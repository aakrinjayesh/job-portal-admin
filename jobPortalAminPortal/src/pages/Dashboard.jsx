// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import {
  Row, Col, Card, Statistic, Table,
  Tag, Typography, Spin, Alert,
} from "antd";
import {
  UserOutlined, BankOutlined, FileTextOutlined,
  AppstoreOutlined, SolutionOutlined,
} from "@ant-design/icons";
import { getAdminStatsApi } from "../api/api"; // ✅ fix path to your actual api file

const { Title, Text } = Typography;

const statCards = [
  {
    key: "totalCandidates",
    title: "Total Candidates",
    icon: <UserOutlined style={{ fontSize: 24, color: "#1677FF" }} />,
    color: "#E6F4FF",
    borderColor: "#1677FF",
  },
  {
    key: "totalCompanies",
    title: "Total Companies",
    icon: <BankOutlined style={{ fontSize: 24, color: "#52C41A" }} />,
    color: "#F6FFED",
    borderColor: "#52C41A",
  },
  {
    key: "totalJobs",
    title: "Total Jobs",
    icon: <FileTextOutlined style={{ fontSize: 24, color: "#FA8C16" }} />,
    color: "#FFF7E6",
    borderColor: "#FA8C16",
  },
  {
    key: "totalOrganizations",
    title: "Organizations",
    icon: <AppstoreOutlined style={{ fontSize: 24, color: "#722ED1" }} />,
    color: "#F9F0FF",
    borderColor: "#722ED1",
  },
  {
    key: "totalApplications",
    title: "Total Applications",
    icon: <SolutionOutlined style={{ fontSize: 24, color: "#EB2F96" }} />,
    color: "#FFF0F6",
    borderColor: "#EB2F96",
  },
];

const columns = [
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
    render: (email) => <Text type="secondary">{email}</Text>,
  },
  {
    title: "Role",
    dataIndex: "role",
    key: "role",
    render: (role) => (
      <Tag
        color={
          role === "candidate" ? "blue" : role === "company" ? "green" : "purple"
        }
      >
        {role.toUpperCase()}
      </Tag>
    ),
  },
  {
    title: "Verified",
    dataIndex: "emailverified",
    key: "emailverified",
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
    render: (date) =>
      new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
  },
];

// ✅ Fix 1 — component name was "LoginPage", export was "Dashboard" — both now "Dashboard"
const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <Alert type="error" message={error} showIcon style={{ margin: 24 }} />;
  }

  return (
    <div style={{ padding: "8px 0" }}>

      {/* Page Title */}
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>Overview</Title>
        <Text type="secondary">
          Welcome back! Here's what's happening on your platform.
        </Text>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        {statCards.map((card) => (
          <Col xs={24} sm={12} md={8} lg={6} xl={4} key={card.key}>
            <Card
              style={{
                borderRadius: 12,
                borderLeft: `4px solid ${card.borderColor}`,
                background: card.color,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
              styles={{ body: { padding: "20px 24px" } }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                    {card.title}
                  </Text>
                  <Statistic
                    value={stats?.[card.key] ?? 0}
                    valueStyle={{ fontSize: 28, fontWeight: 700 }}
                  />
                </div>
                <div style={{ background: "#fff", borderRadius: 8, padding: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                  {card.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Recent Users Table */}
      <Card
        title={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Title level={5} style={{ margin: 0 }}>Recently Joined Users</Title>
            <Tag color="blue">Last 5</Tag>
          </div>
        }
        style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
      >
        <Table
          dataSource={recentUsers}
          columns={columns}
          rowKey="id"
          pagination={false}
          size="middle"
        />
      </Card>
    </div>
  );
};

// ✅ Fix 2 — export name matches component name
export default Dashboard;