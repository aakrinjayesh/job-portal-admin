// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Tag,
  Typography,
  Spin,
  Alert,
  Grid,
  Segmented,
  DatePicker,
} from "antd";
import dayjs from "dayjs";
import {
  UserOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  SolutionOutlined,
  TeamOutlined,
  ShopOutlined,
  SafetyCertificateOutlined,
  SwapOutlined,
  IdcardOutlined,
  CheckCircleOutlined,
  PauseCircleOutlined,
  FileDoneOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { getAdminStatsApi, getUserCountByDateApi } from "../api/api";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

// Platform-wide totals
const platformStatCards = [
  {
    key: "totalUsers",
    title: "Total Users",
    icon: <TeamOutlined style={{ fontSize: 22, color: "#2F54EB" }} />,
    color: "#F0F5FF",
    borderColor: "#2F54EB",
  },
  {
    key: "totalOrganizations",
    title: "Total Organizations",
    icon: <AppstoreOutlined style={{ fontSize: 22, color: "#722ED1" }} />,
    color: "#F9F0FF",
    borderColor: "#722ED1",
  },
  {
    key: "totalJobPostings",
    title: "Total Job Postings",
    icon: <FileTextOutlined style={{ fontSize: 22, color: "#FA8C16" }} />,
    color: "#FFF7E6",
    borderColor: "#FA8C16",
  },
  {
    key: "totalApplications",
    title: "Total Applications",
    icon: <SolutionOutlined style={{ fontSize: 22, color: "#EB2F96" }} />,
    color: "#FFF0F6",
    borderColor: "#EB2F96",
  },
];

// Candidate insights — all self-registered (direct) candidates
const candidateStatCards = [
  {
    key: "selfRegisteredCandidates",
    title: "Self-Registered Candidates",
    icon: <UserOutlined style={{ fontSize: 22, color: "#1677FF" }} />,
    color: "#E6F4FF",
    borderColor: "#1677FF",
  },
  {
    key: "selfRegisteredCandidatesWithProfile",
    title: "Candidates With Completed Profile",
    icon: <IdcardOutlined style={{ fontSize: 22, color: "#13C2C2" }} />,
    color: "#E6FFFB",
    borderColor: "#13C2C2",
  },
  {
    key: "activeSelfRegisteredCandidates",
    title: "Active Candidates",
    icon: <CheckCircleOutlined style={{ fontSize: 22, color: "#52C41A" }} />,
    color: "#F6FFED",
    borderColor: "#52C41A",
  },
  {
    key: "inactiveSelfRegisteredCandidates",
    title: "Inactive Candidates",
    icon: <PauseCircleOutlined style={{ fontSize: 22, color: "#F5222D" }} />,
    color: "#FFF1F0",
    borderColor: "#F5222D",
  },
];

// Company insights — self-registered vs admin-created company users
const companyStatCards = [
  {
    key: "selfRegisteredVerifiedCompanies",
    title: "Self-Registered Verified Companies",
    icon: (
      <SafetyCertificateOutlined style={{ fontSize: 22, color: "#389E0D" }} />
    ),
    color: "#F6FFED",
    borderColor: "#389E0D",
  },
  {
    key: "adminCreatedCompanyUsers",
    title: "Admin-Created Company Users",
    icon: <ShopOutlined style={{ fontSize: 22, color: "#FA541C" }} />,
    color: "#FFF2E8",
    borderColor: "#FA541C",
  },
  {
    key: "adminCreatedCompaniesConverted",
    title: "Admin-Created Companies (Email Verified)",
    icon: <SwapOutlined style={{ fontSize: 22, color: "#FAAD14" }} />,
    color: "#FFFBE6",
    borderColor: "#FAAD14",
  },
];

// Job posting insights — split by who posted the job
const jobStatCards = [
  {
    key: "adminCreatedJobPostings",
    title: "Admin-Posted Jobs",
    icon: <FileDoneOutlined style={{ fontSize: 22, color: "#13C2C2" }} />,
    color: "#E6FFFB",
    borderColor: "#13C2C2",
  },
  {
    key: "directUserJobPostings",
    title: "Self-Posted Jobs",
    icon: <SendOutlined style={{ fontSize: 22, color: "#F5222D" }} />,
    color: "#FFF1F0",
    borderColor: "#F5222D",
  },
];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const screens = useBreakpoint();
  const [recentUsersFilter, setRecentUsersFilter] = useState("all"); // all | company | candidate
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateStats, setDateStats] = useState(null);
  const [dateLoading, setDateLoading] = useState(false);

  const isMobile = !screens.sm;

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

  const handleDateChange = async (date) => {
    setSelectedDate(date);
    if (!date) {
      setDateStats(null);
      return;
    }
    setDateLoading(true);
    try {
      const formatted = date.format("YYYY-MM-DD");
      const res = await getUserCountByDateApi(formatted);
      setDateStats(res);
    } catch (err) {
      console.error("Failed to fetch date stats", err);
      setDateStats(null);
    } finally {
      setDateLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <Spin size="large" />
        <Text type="secondary">Loading dashboard...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <Alert type="error" message={error} showIcon style={{ margin: 16 }} />
    );
  }

  // Mobile: show only key columns
  const mobileColumns = [
    {
      title: "User",
      key: "user",
      render: (_, record) => (
        <div>
          <Text strong style={{ fontSize: 13 }}>
            {record.name}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>
            {record.email}
          </Text>
          <br />
          <Tag
            color={
              record.role === "candidate"
                ? "blue"
                : record.role === "company"
                  ? "green"
                  : "purple"
            }
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
        <Tag
          color={
            role === "candidate"
              ? "blue"
              : role === "company"
                ? "green"
                : "purple"
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

  // Recently self-registered users — render all, optionally filter by role.
  const filteredRecentUsers = recentUsers.filter((user) => {
    switch (recentUsersFilter) {
      case "company":
        return user.role === "company";
      case "candidate":
        return user.role === "candidate";
      default:
        return true;
    }
  });

  const renderStatCards = (cards) => (
    <Row gutter={[16, 16]}>
      {cards.map((card) => (
        <Col
          key={card.key}
          xs={12}
          sm={12}
          md={8}
          lg={8}
          xl={4}
          style={{ minWidth: isMobile ? "48%" : "180px" }}
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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 19,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text
                  type="secondary"
                  style={{
                    fontSize: isMobile ? 10 : 12,
                    display: "block",
                    marginBottom: 4,
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
              {!isMobile && (
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 8,
                    padding: 8,
                    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                    flexShrink: 0,
                    marginLeft: 8,
                  }}
                >
                  {card.icon}
                </div>
              )}
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );

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

      {/* Platform Totals */}
      <div style={{ marginBottom: isMobile ? 8 : 12 }}>
        <Text
          strong
          style={{ fontSize: isMobile ? 12 : 14, color: "#8C8C8C" }}
        >
          PLATFORM TOTALS
        </Text>
      </div>
      <div style={{ marginBottom: isMobile ? 16 : 28 }}>
        {renderStatCards(platformStatCards)}
      </div>

      {/* Candidate Insights */}
      <div style={{ marginBottom: isMobile ? 8 : 12 }}>
        <Text
          strong
          style={{ fontSize: isMobile ? 12 : 14, color: "#8C8C8C" }}
        >
          CANDIDATE INSIGHTS
        </Text>
      </div>
      <div style={{ marginBottom: isMobile ? 16 : 28 }}>
        {renderStatCards(candidateStatCards)}
      </div>

      {/* Company Insights */}
      <div style={{ marginBottom: isMobile ? 8 : 12 }}>
        <Text
          strong
          style={{ fontSize: isMobile ? 12 : 14, color: "#8C8C8C" }}
        >
          COMPANY INSIGHTS
        </Text>
      </div>
      <div style={{ marginBottom: isMobile ? 16 : 28 }}>
        {renderStatCards(companyStatCards)}
      </div>

      {/* Job Posting Sources */}
      <div style={{ marginBottom: isMobile ? 8 : 12 }}>
        <Text
          strong
          style={{ fontSize: isMobile ? 12 : 14, color: "#8C8C8C" }}
        >
          JOB POSTING SOURCES
        </Text>
      </div>
      <div style={{ marginBottom: isMobile ? 16 : 32 }}>
        {renderStatCards(jobStatCards)}
      </div>

      {/* Date-wise Signups */}
      <Card
        style={{
          borderRadius: isMobile ? 8 : 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          marginBottom: isMobile ? 16 : 32,
        }}
        styles={{ body: { padding: isMobile ? 16 : 24 } }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <Title level={5} style={{ margin: 0, fontSize: isMobile ? 13 : 16 }}>
            Signups by Date
          </Title>
          <DatePicker
            value={selectedDate}
            onChange={handleDateChange}
            disabledDate={(current) =>
              current && current > dayjs().endOf("day")
            }
            size={isMobile ? "small" : "middle"}
          />
        </div>

        {dateLoading && (
          <div
            style={{ display: "flex", justifyContent: "center", padding: 24 }}
          >
            <Spin />
          </div>
        )}

        {!dateLoading && !selectedDate && (
          <Text type="secondary">
            Pick a date to see how many accounts were created.
          </Text>
        )}

        {!dateLoading && selectedDate && dateStats && (
          <Row gutter={[16, 16]}>
            <Col xs={8}>
              <Statistic
                title="Total Signups"
                value={dateStats.counts.total}
                valueStyle={{ fontSize: isMobile ? 18 : 24, fontWeight: 700 }}
              />
            </Col>
            <Col xs={8}>
              <Statistic
                title="Admin Created"
                value={dateStats.counts.adminCreated}
                valueStyle={{
                  fontSize: isMobile ? 18 : 24,
                  fontWeight: 700,
                  color: "#13C2C2",
                }}
              />
            </Col>
            <Col xs={8}>
              <Statistic
                title="Self Registered"
                value={dateStats.counts.direct}
                valueStyle={{
                  fontSize: isMobile ? 18 : 24,
                  fontWeight: 700,
                  color: "#F5222D",
                }}
              />
            </Col>
          </Row>
        )}
      </Card>

      {/* Recent Users Table */}
      <Card
        title={
          // <div style={{
          //   display: "flex",
          //   justifyContent: "space-between",
          //   alignItems: "center",
          // }}>
          //   <Title level={isMobile ? 5 : 5} style={{ margin: 0, fontSize: isMobile ? 13 : 16 }}>
          //     Recently Joined Users
          //   </Title>
          //   <Tag color="blue">Last 5</Tag>
          // </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <Title
              level={isMobile ? 5 : 5}
              style={{ margin: 0, fontSize: isMobile ? 13 : 16 }}
            >
              Recently Self-Registered Users
            </Title>
            <Segmented
              size={isMobile ? "small" : "middle"}
              options={[
                { label: "All", value: "all" },
                { label: "Company", value: "company" },
                { label: "Candidate", value: "candidate" },
              ]}
              value={recentUsersFilter}
              onChange={setRecentUsersFilter}
            />
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
          dataSource={filteredRecentUsers}
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
