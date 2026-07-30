// import { useEffect, useState } from "react";
// import {
//   Row,
//   Col,
//   Card,
//   Statistic,
//   Select,
//   Spin,
//   Table,
//   Tag,
//   DatePicker,
//   List,
//   Typography,
// } from "antd";
// import { GlobalOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";
// import {
//   AreaChart,
//   Area,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   Legend,
// } from "recharts";
// import dayjs from "dayjs";
// import { getVisitorAnalyticsApi } from "../api/api";

// const { Option } = Select;
// const { RangePicker } = DatePicker;
// const { Text } = Typography;

// export default function VisitorDashboard() {
//   const [loading, setLoading] = useState(false);
//   const [filter, setFilter] = useState("today");
//   const [dateRange, setDateRange] = useState(null); // [dayjs, dayjs] when custom

//   const [stats, setStats] = useState({
//     totalVisitors: 0,
//     anonymousVisitors: 0,
//     existingVisitors: 0,
//     visitors: [],
//     trend: [],
//     topPages: [],
//     topReferrers: [],
//   });

//   const loadVisitors = async (params) => {
//     try {
//       setLoading(true);
//       const res = await getVisitorAnalyticsApi(params);
//       setStats(res.data);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadVisitors({ filter: "today" });
//   }, []);

//   const handleFilterChange = (value) => {
//     setFilter(value);
//     setDateRange(null);
//     loadVisitors({ filter: value });
//   };

//   const handleRangeChange = (dates) => {
//     setDateRange(dates);
//     if (dates && dates.length === 2) {
//       loadVisitors({
//         from: dates[0].format("YYYY-MM-DD"),
//         to: dates[1].format("YYYY-MM-DD"),
//       });
//     }
//   };

//   const columns = [
//     { title: "Name", render: (_, r) => r.user?.name || "Anonymous" },
//     { title: "Email", render: (_, r) => r.user?.email || "-" },
//     { title: "Visitor ID", dataIndex: "visitorId" },
//     { title: "Entry Page", dataIndex: "entryPath" },
//     {
//       title: "First Visit",
//       dataIndex: "startedAt",
//       render: (v) => new Date(v).toLocaleString(),
//     },
//     {
//       title: "Last Seen",
//       dataIndex: "lastSeenAt",
//       render: (v) => new Date(v).toLocaleString(),
//     },
//     {
//       title: "Status",
//       filters: [
//         {
//           text: "Existing",
//           value: "existing",
//         },
//         {
//           text: "Anonymous",
//           value: "anonymous",
//         },
//       ],
//       onFilter: (value, record) => {
//         if (value === "existing") return !!record.user;
//         return !record.user;
//       },
//       render: (_, r) =>
//         r.user ? (
//           <Tag color="green">Existing</Tag>
//         ) : (
//           <Tag color="orange">Anonymous</Tag>
//         ),
//     },
//   ];

//   return (
//     <div style={{ padding: 24 }}>
//       <Row justify="space-between" align="middle" wrap>
//         <h2>Visitor Dashboard</h2>

//         <Row gutter={12}>
//           <Col>
//             <Select
//               value={filter}
//               style={{ width: 160 }}
//               onChange={handleFilterChange}
//             >
//               <Option value="today">Today</Option>
//               <Option value="week">This Week</Option>
//               <Option value="month">This Month</Option>
//             </Select>
//           </Col>
//           <Col>
//             <RangePicker value={dateRange} onChange={handleRangeChange} />
//           </Col>
//         </Row>
//       </Row>

//       <Spin spinning={loading}>
//         {/* Summary cards */}
//         <Row gutter={20} style={{ marginTop: 20 }}>
//           <Col span={8}>
//             <Card>
//               <Statistic
//                 title="Total Visitors"
//                 value={stats.totalVisitors}
//                 prefix={<GlobalOutlined />}
//               />
//             </Card>
//           </Col>
//           <Col span={8}>
//             <Card>
//               <Statistic
//                 title="Anonymous Visitors"
//                 value={stats.anonymousVisitors}
//                 prefix={<UserOutlined />}
//               />
//             </Card>
//           </Col>
//           <Col span={8}>
//             <Card>
//               <Statistic
//                 title="Existing Visitors"
//                 value={stats.existingVisitors}
//                 prefix={<TeamOutlined />}
//               />
//             </Card>
//           </Col>
//         </Row>

//         {/* Trend chart — the GA-style "visitors over time" graph */}
//         <Card title="Visitors Over Time" style={{ marginTop: 25 }}>
//           <ResponsiveContainer width="100%" height={300}>
//             <AreaChart data={stats.trend}>
//               <defs>
//                 <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="5%" stopColor="#1677ff" stopOpacity={0.4} />
//                   <stop offset="95%" stopColor="#1677ff" stopOpacity={0} />
//                 </linearGradient>
//               </defs>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis
//                 dataKey="date"
//                 tickFormatter={(d) => dayjs(d).format("DD MMM")}
//               />
//               <YAxis allowDecimals={false} />
//               <Tooltip labelFormatter={(d) => dayjs(d).format("DD MMM YYYY")} />
//               <Legend />
//               <Area
//                 type="monotone"
//                 dataKey="total"
//                 name="Total"
//                 stroke="#1677ff"
//                 fill="url(#totalGrad)"
//               />
//               <Area
//                 type="monotone"
//                 dataKey="existing"
//                 name="Existing"
//                 stroke="#52c41a"
//                 fillOpacity={0}
//               />
//               <Area
//                 type="monotone"
//                 dataKey="anonymous"
//                 name="Anonymous"
//                 stroke="#faad14"
//                 fillOpacity={0}
//               />
//             </AreaChart>
//           </ResponsiveContainer>
//         </Card>

//         {/* Top pages + top referrers, side by side */}
//         <Row gutter={20} style={{ marginTop: 25 }}>
//           <Col span={12}>
//             <Card title="Top Entry Pages">
//               <ResponsiveContainer width="100%" height={280}>
//                 <BarChart data={stats.topPages} layout="vertical">
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis type="number" allowDecimals={false} />
//                   <YAxis dataKey="path" type="category" width={140} />
//                   <Tooltip />
//                   <Bar dataKey="count" fill="#1677ff" radius={[0, 4, 4, 0]} />
//                 </BarChart>
//               </ResponsiveContainer>
//             </Card>
//           </Col>

//           <Col span={12}>
//             <Card title="Top Referrers" style={{ height: "100%" }}>
//               <List
//                 dataSource={stats.topReferrers}
//                 renderItem={(item) => (
//                   <List.Item>
//                     <Text>{item.referrer}</Text>
//                     <Tag color="blue">{item.count}</Tag>
//                   </List.Item>
//                 )}
//                 locale={{ emptyText: "No referrer data yet" }}
//               />
//             </Card>
//           </Col>
//         </Row>

//         {/* Visitor list */}
//         <Card title="Visitor Details" style={{ marginTop: 25 }}>
//           <Table
//             rowKey="id"
//             columns={columns}
//             dataSource={stats.visitors}
//             pagination={{
//               defaultPageSize: 10,
//               showSizeChanger: true,
//               pageSizeOptions: ["10", "20", "50", "100"],
//               showQuickJumper: true,
//               showTotal: (total, range) =>
//                 `${range[0]}-${range[1]} of ${total} visitors`,
//             }}
//           />
//         </Card>
//       </Spin>
//     </div>
//   );
// }

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
import {
  GlobalOutlined,
  TeamOutlined,
  UserOutlined,
  TrophyOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
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
  Cell,
} from "recharts";
import dayjs from "dayjs";
import { getVisitorAnalyticsApi } from "../api/api";

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text } = Typography;

export default function VisitorDashboard() {
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("today");
  const [dateRange, setDateRange] = useState(null);
  const [activeFilter, setActiveFilter] = useState("total"); // "total" | "anonymous" | "existing"

  const [stats, setStats] = useState({
    totalVisitors: 0,
    anonymousVisitors: 0,
    existingVisitors: 0,
    visitors: [],
    trend: [],
    topPages: [],
    topReferrers: [],
    currentRecord: null,
    previousRecord: null,
    visitorsByDayOfWeek: [],
    peakDay: null,
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
    setActiveFilter("total");
    loadVisitors({ filter: value });
  };

  const handleRangeChange = (dates) => {
    setDateRange(dates);
    setActiveFilter("total");
    if (dates && dates.length === 2) {
      loadVisitors({
        from: dates[0].format("YYYY-MM-DD"),
        to: dates[1].format("YYYY-MM-DD"),
      });
    }
  };

  const filteredVisitors =
    stats.visitors?.filter((v) => {
      if (activeFilter === "anonymous") return !v.user;
      if (activeFilter === "existing") return !!v.user;
      return true;
    }) || [];

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
        { text: "Existing", value: "existing" },
        { text: "Anonymous", value: "anonymous" },
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
        {/* Summary cards — clickable to filter table below */}
        <Row gutter={20} style={{ marginTop: 20 }}>
          <Col span={8}>
            <Card
              hoverable
              onClick={() => setActiveFilter("total")}
              style={{
                cursor: "pointer",
                border:
                  activeFilter === "total"
                    ? "2px solid #1677ff"
                    : "1px solid #f0f0f0",
              }}
            >
              <Statistic
                title="Total Visitors"
                value={stats.totalVisitors}
                prefix={<GlobalOutlined />}
              />
            </Card>
          </Col>

          <Col span={8}>
            <Card
              hoverable
              onClick={() => setActiveFilter("anonymous")}
              style={{
                cursor: "pointer",
                border:
                  activeFilter === "anonymous"
                    ? "2px solid #faad14"
                    : "1px solid #f0f0f0",
              }}
            >
              <Statistic
                title="Anonymous Visitors"
                value={stats.anonymousVisitors}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>

          <Col span={8}>
            <Card
              hoverable
              onClick={() => setActiveFilter("existing")}
              style={{
                cursor: "pointer",
                border:
                  activeFilter === "existing"
                    ? "2px solid #52c41a"
                    : "1px solid #f0f0f0",
              }}
            >
              <Statistic
                title="Existing Visitors"
                value={stats.existingVisitors}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* 🏆 Record Day card */}
        {stats.currentRecord && (
          <Card style={{ marginTop: 25 }}>
            <Row align="middle" gutter={20}>
              <Col>
                <TrophyOutlined style={{ fontSize: 32, color: "#faad14" }} />
              </Col>
              <Col flex="auto">
                <Text strong style={{ fontSize: 16 }}>
                  Highest Traffic Day (All-Time)
                </Text>
                <div style={{ marginTop: 8 }}>
                  <Text
                    style={{ fontSize: 20, fontWeight: 600, color: "#1677ff" }}
                  >
                    {dayjs(stats.currentRecord.date).format("DD MMM YYYY")}
                  </Text>
                  <Text style={{ marginLeft: 10, fontSize: 18 }}>
                    — {stats.currentRecord.count} visitors
                  </Text>
                </div>

                {stats.previousRecord && (
                  <div style={{ marginTop: 6, color: "#8c8c8c" }}>
                    Previous record was{" "}
                    <Text delete>{stats.previousRecord.count} visitors</Text> on{" "}
                    {dayjs(stats.previousRecord.date).format("DD MMM YYYY")} —
                    beaten by{" "}
                    <Text strong style={{ color: "#52c41a" }}>
                      +{stats.currentRecord.count - stats.previousRecord.count}
                    </Text>
                  </div>
                )}
              </Col>
            </Row>
          </Card>
        )}

        {/* Trend chart */}
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

        {/* 📅 Day of Week chart */}
        <Card
          title={
            <span>
              <CalendarOutlined style={{ marginRight: 8 }} />
              Visitors by Day of Week
              {stats.peakDay && (
                <Tag color="blue" style={{ marginLeft: 12 }}>
                  Peak: {stats.peakDay.day} ({stats.peakDay.count} visitors)
                </Tag>
              )}
            </span>
          }
          style={{ marginTop: 25 }}
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats.visitorsByDayOfWeek}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="shortDay" />
              <YAxis allowDecimals={false} />
              <Tooltip
                labelFormatter={(_, payload) => payload?.[0]?.payload?.day}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {stats.visitorsByDayOfWeek?.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={
                      entry.day === stats.peakDay?.day ? "#1677ff" : "#bae0ff"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Top pages + top referrers */}
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

        {/* Visitor list — filtered by active card */}
        <Card
          title={
            activeFilter === "total"
              ? "All Visitor Details"
              : activeFilter === "anonymous"
                ? "Anonymous Visitor Details"
                : "Existing Visitor Details"
          }
          style={{ marginTop: 25 }}
        >
          <Table
            rowKey="id"
            columns={columns}
            dataSource={filteredVisitors}
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
