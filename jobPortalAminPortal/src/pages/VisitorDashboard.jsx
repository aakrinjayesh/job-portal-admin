import { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Select,
  Spin,
  Table,
  Tag,
  DatePicker,
  List,
  Typography,
} from "antd";
import { GlobalOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import dayjs from "dayjs";
import { getVisitorAnalyticsApi } from "../api/api";

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text } = Typography;

export default function VisitorDashboard() {
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("today");
  const [dateRange, setDateRange] = useState(null); // [dayjs, dayjs] when custom

  const [stats, setStats] = useState({
    totalVisitors: 0,
    anonymousVisitors: 0,
    existingVisitors: 0,
    visitors: [],
    trend: [],
    topPages: [],
    topReferrers: [],
  });

  const loadVisitors = async (params) => {
    try {
      setLoading(true);
      const res = await getVisitorAnalyticsApi(params);
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVisitors({ filter: "today" });
  }, []);

  const handleFilterChange = (value) => {
    setFilter(value);
    setDateRange(null);
    loadVisitors({ filter: value });
  };

  const handleRangeChange = (dates) => {
    setDateRange(dates);
    if (dates && dates.length === 2) {
      loadVisitors({
        from: dates[0].format("YYYY-MM-DD"),
        to: dates[1].format("YYYY-MM-DD"),
      });
    }
  };

  const columns = [
    { title: "Name", render: (_, r) => r.user?.name || "Anonymous" },
    { title: "Email", render: (_, r) => r.user?.email || "-" },
    { title: "Visitor ID", dataIndex: "visitorId" },
    { title: "Entry Page", dataIndex: "entryPath" },
    {
      title: "First Visit",
      dataIndex: "startedAt",
      render: (v) => new Date(v).toLocaleString(),
    },
    {
      title: "Last Seen",
      dataIndex: "lastSeenAt",
      render: (v) => new Date(v).toLocaleString(),
    },
    {
      title: "Status",
      filters: [
        {
          text: "Existing",
          value: "existing",
        },
        {
          text: "Anonymous",
          value: "anonymous",
        },
      ],
      onFilter: (value, record) => {
        if (value === "existing") return !!record.user;
        return !record.user;
      },
      render: (_, r) =>
        r.user ? (
          <Tag color="green">Existing</Tag>
        ) : (
          <Tag color="orange">Anonymous</Tag>
        ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" wrap>
        <h2>Visitor Dashboard</h2>

        <Row gutter={12}>
          <Col>
            <Select
              value={filter}
              style={{ width: 160 }}
              onChange={handleFilterChange}
            >
              <Option value="today">Today</Option>
              <Option value="week">This Week</Option>
              <Option value="month">This Month</Option>
            </Select>
          </Col>
          <Col>
            <RangePicker value={dateRange} onChange={handleRangeChange} />
          </Col>
        </Row>
      </Row>

      <Spin spinning={loading}>
        {/* Summary cards */}
        <Row gutter={20} style={{ marginTop: 20 }}>
          <Col span={8}>
            <Card>
              <Statistic
                title="Total Visitors"
                value={stats.totalVisitors}
                prefix={<GlobalOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Anonymous Visitors"
                value={stats.anonymousVisitors}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Existing Visitors"
                value={stats.existingVisitors}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Trend chart — the GA-style "visitors over time" graph */}
        <Card title="Visitors Over Time" style={{ marginTop: 25 }}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={stats.trend}>
              <defs>
                <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1677ff" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#1677ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(d) => dayjs(d).format("DD MMM")}
              />
              <YAxis allowDecimals={false} />
              <Tooltip labelFormatter={(d) => dayjs(d).format("DD MMM YYYY")} />
              <Legend />
              <Area
                type="monotone"
                dataKey="total"
                name="Total"
                stroke="#1677ff"
                fill="url(#totalGrad)"
              />
              <Area
                type="monotone"
                dataKey="existing"
                name="Existing"
                stroke="#52c41a"
                fillOpacity={0}
              />
              <Area
                type="monotone"
                dataKey="anonymous"
                name="Anonymous"
                stroke="#faad14"
                fillOpacity={0}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Top pages + top referrers, side by side */}
        <Row gutter={20} style={{ marginTop: 25 }}>
          <Col span={12}>
            <Card title="Top Entry Pages">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stats.topPages} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="path" type="category" width={140} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1677ff" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          <Col span={12}>
            <Card title="Top Referrers" style={{ height: "100%" }}>
              <List
                dataSource={stats.topReferrers}
                renderItem={(item) => (
                  <List.Item>
                    <Text>{item.referrer}</Text>
                    <Tag color="blue">{item.count}</Tag>
                  </List.Item>
                )}
                locale={{ emptyText: "No referrer data yet" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Visitor list */}
        <Card title="Visitor Details" style={{ marginTop: 25 }}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={stats.visitors}
            pagination={{
              defaultPageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} visitors`,
            }}
          />
        </Card>
      </Spin>
    </div>
  );
}
