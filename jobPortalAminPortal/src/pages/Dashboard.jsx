// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import {
  Row, Col, Card, Statistic, Table,
  Tag, Typography, Spin, Alert, Grid,
} from "antd";
import {
  UserOutlined, BankOutlined, FileTextOutlined,
  AppstoreOutlined, SolutionOutlined,
} from "@ant-design/icons";
import { getAdminStatsApi } from "../api/api";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const statCards = [
  {
    key: "totalCandidates",
    title: "Total Candidates",
    icon: <UserOutlined style={{ fontSize: 22, color: "#1677FF" }} />,
    color: "#E6F4FF",
    borderColor: "#1677FF",
  },
  {
    key: "totalCompanies",
    title: "Total Companies",
    icon: <BankOutlined style={{ fontSize: 22, color: "#52C41A" }} />,
    color: "#F6FFED",
    borderColor: "#52C41A",
  },
  {
    key: "totalJobs",
    title: "Total Jobs",
    icon: <FileTextOutlined style={{ fontSize: 22, color: "#FA8C16" }} />,
    color: "#FFF7E6",
    borderColor: "#FA8C16",
  },
  {
    key: "totalOrganizations",
    title: "Organizations",
    icon: <AppstoreOutlined style={{ fontSize: 22, color: "#722ED1" }} />,
    color: "#F9F0FF",
    borderColor: "#722ED1",
  },
  {
    key: "totalApplications",
    title: "Total Applications",
    icon: <SolutionOutlined style={{ fontSize: 22, color: "#EB2F96" }} />,
    color: "#FFF0F6",
    borderColor: "#EB2F96",
  },
];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const screens = useBreakpoint();

  const isMobile = !screens.sm;
  const isTablet = screens.sm && !screens.lg;

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await getAdminStatsApi();
      setStats(res.stats);
      setRecentUsers(res.recentUsers);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "60vh",
        flexDirection: "column",
        gap: 16,
      }}>
        <Spin size="large" />
        <Text type="secondary">Loading dashboard...</Text>
      </div>
    );
  }

  if (error) {
    return <Alert type="error" message={error} showIcon style={{ margin: 16 }} />;
  }

  // Mobile: show only key columns
  const mobileColumns = [
    {
      title: "User",
      key: "user",
      render: (_, record) => (
        <div>
          <Text strong style={{ fontSize: 13 }}>{record.name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>{record.email}</Text>
          <br />
          <Tag
            color={record.role === "candidate" ? "blue" : record.role === "company" ? "green" : "purple"}
            style={{ marginTop: 4, fontSize: 10 }}
          >
            {record.role.toUpperCase()}
          </Tag>
          <Tag
            color={record.emailverified ? "success" : "warning"}
            style={{ marginTop: 4, fontSize: 10 }}
          >
            {record.emailverified ? "Verified" : "Pending"}
          </Tag>
        </div>
      ),
    },
    {
      title: "Joined",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 90,
      render: (date) =>
        new Date(date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "2-digit",
        }),
    },
  ];

  // Desktop: full columns
  const desktopColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name) => <Text strong>{name}</Text>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      ellipsis: true,
      render: (email) => <Text type="secondary">{email}</Text>,
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      width: 110,
      render: (role) => (
        <Tag color={role === "candidate" ? "blue" : role === "company" ? "green" : "purple"}>
          {role.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Verified",
      dataIndex: "emailverified",
      key: "emailverified",
      width: 100,
      render: (verified) => (
        <Tag color={verified ? "success" : "warning"}>
          {verified ? "Verified" : "Pending"}
        </Tag>
      ),
    },
    {
      title: "Joined",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date) =>
        new Date(date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
    },
  ];

  return (
    <div style={{ padding: isMobile ? "4px 0" : "8px 0" }}>

      {/* Page Title */}
      <div style={{ marginBottom: isMobile ? 16 : 24 }}>
        <Title level={isMobile ? 5 : 4} style={{ margin: 0 }}>
          Overview
        </Title>
        <Text type="secondary" style={{ fontSize: isMobile ? 12 : 14 }}>
          Welcome back! Here's what's happening on your platform.
        </Text>
      </div>

      {/* Stats Cards */}
      <Row gutter={[isMobile ? 8 : 16, isMobile ? 8 : 16]} style={{ marginBottom: isMobile ? 16 : 32 }}>
        {statCards.map((card) => (
          <Col
            xs={12}   // 2 per row on mobile
            sm={12}   // 2 per row on small
            md={8}    // 3 per row on medium
            lg={6}    // 4 per row on large
            xl={4}    // 5 per row on xl (fits all 5)
            key={card.key}
          >
            <Card
              style={{
                borderRadius: isMobile ? 8 : 12,
                borderLeft: `4px solid ${card.borderColor}`,
                background: card.color,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                height: "100%",
              }}
              styles={{
                body: {
                  padding: isMobile ? "12px 14px" : "20px 24px",
                },
              }}
            >
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 19,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: isMobile ? 10 : 12,
                      display: "block",
                      marginBottom: 4,
                      // whiteSpace: "nowrap",
                      // overflow: "hidden",
                      // textOverflow: "ellipsis",
                    }}
                  >
                    {card.title}
                  </Text>
                  <Statistic
                    value={stats?.[card.key] ?? 0}
                    valueStyle={{
                      fontSize: isMobile ? 20 : 28,
                      fontWeight: 700,
                      lineHeight: 1.2,
                    }}
                  />
                </div>
                {/* Hide icon on very small screens */}
                {!isMobile && (
                  <div style={{
                    background: "#fff",
                    borderRadius: 8,
                    padding: 8,
                    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                    flexShrink: 0,
                    marginLeft: 8,
                  }}>
                    {card.icon}
                  </div>
                )}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Recent Users Table */}
      <Card
        title={
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <Title level={isMobile ? 5 : 5} style={{ margin: 0, fontSize: isMobile ? 13 : 16 }}>
              Recently Joined Users
            </Title>
            <Tag color="blue">Last 5</Tag>
          </div>
        }
        style={{
          borderRadius: isMobile ? 8 : 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
        styles={{
          body: { padding: isMobile ? "0 0 8px 0" : "24px" },
        }}
      >
        <Table
          dataSource={recentUsers}
          columns={isMobile ? mobileColumns : desktopColumns}
          rowKey="id"
          pagination={false}
          size={isMobile ? "small" : "middle"}
          scroll={isMobile ? {} : { x: 600 }}
        />
      </Card>
    </div>
  );
};

export default Dashboard;