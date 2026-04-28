// src/pages/OrganizationDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card, Row, Col, Tag, Typography, Avatar,
  Table, Space, Button, Select, message,
  Descriptions, Tabs, Spin, Alert,
} from "antd";
import {
  ArrowLeftOutlined, BankOutlined,
  UserOutlined, DeleteOutlined,
} from "@ant-design/icons";
import {
  getOrganizationByIdApi,
//   updateSubscriptionStatusApi,
  removeMemberApi,
} from "../api/api";

const { Title, Text } = Typography;

export default function OrganizationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrg();
  }, [id]);

  const fetchOrg = async () => {
    setLoading(true);
    try {
      const res = await getOrganizationByIdApi(id);
      setOrg(res.data.organization);
    } catch {
      setError("Failed to load organization");
    } finally {
      setLoading(false);
    }
  };

//   const handleStatusChange = async (status) => {
//     try {
//       await updateSubscriptionStatusApi(id, status);
//       message.success("Subscription status updated");
//       fetchOrg();
//     } catch {
//       message.error("Failed to update status");
//     }
//   };

  const handleRemoveMember = async (memberId, name) => {
    try {
      await removeMemberApi(memberId);
      message.success(`${name} removed`);
      fetchOrg();
    } catch {
      message.error("Failed to remove member");
    }
  };

  if (loading) return <Spin size="large" style={{ display: "block", margin: "100px auto" }} />;
  if (error) return <Alert type="error" message={error} showIcon />;
  if (!org) return null;

  const memberColumns = [
    {
      title: "Member",
      key: "user",
      render: (_, r) => (
        <Space>
          <Avatar src={r.user?.profileUrl} icon={<UserOutlined />} />
          <div>
            <Text strong>{r.user?.name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 11 }}>{r.user?.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      render: (role) => (
        <Tag color={role === "COMPANY_ADMIN" ? "gold" : "blue"}>{role}</Tag>
      ),
    },
    {
      title: "Permissions",
      dataIndex: "permissions",
      render: (p) => <Tag>{p}</Tag>,
    },
  {
  title: "License",
  key: "license",
  render: (_, r) => {
    // ✅ now directly r.licenses[0]
    const license = r.license;
    if (!license) return <Tag color="default">No License</Tag>;
    return (
      <Tag color={license.isActive ? "success" : "error"}>
        {license.plan?.tier} — {license.isActive ? "Active" : "Expired"}
      </Tag>
    );
  },
},
    {
      title: "Action",
      key: "action",
      render: (_, r) => (
        <Button
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveMember(r.id, r.user?.name)}
        >
          Remove
        </Button>
      ),
    },
  ];

  const invoiceColumns = [
    { title: "Invoice #", dataIndex: "invoiceNumber", key: "invoiceNumber" },
    { title: "Plan", dataIndex: "planTier", key: "planTier", render: (t) => <Tag>{t}</Tag> },
    { title: "Total", dataIndex: "total", key: "total", render: (v) => `₹${v}` },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s) => (
        <Tag color={s === "PAID" ? "success" : s === "PENDING" ? "warning" : "error"}>{s}</Tag>
      ),
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (d) => new Date(d).toLocaleDateString("en-IN"),
    },
  ];

  const tabItems = [
    {
      key: "overview",
      label: "Overview",
      children: (
        <Descriptions bordered column={2} size="middle">
          <Descriptions.Item label="Organization ID">{org.id}</Descriptions.Item>
          <Descriptions.Item label="Created">
            {new Date(org.createdAt).toLocaleDateString("en-IN")}
          </Descriptions.Item>
          <Descriptions.Item label="Industry">
            {org.companyProfile?.industry || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Company Size">
            {org.companyProfile?.companySize || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Website">
            {org.companyProfile?.website || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Headquarters">
            {org.companyProfile?.headquarters || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Total Members">{org._count?.members}</Descriptions.Item>
          <Descriptions.Item label="Total Jobs">{org._count?.jobs}</Descriptions.Item>
          <Descriptions.Item label="Total Applications">{org._count?.jobApplications}</Descriptions.Item>
          <Descriptions.Item label="Pending Invites">{org._count?.invites}</Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: "members",
      label: `Members (${org._count?.members || 0})`,
      children: (
        <Table
          dataSource={org.members}
          columns={memberColumns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      ),
    },
    {
  key: "jobs",
  label: `Jobs (${org._count?.jobs || 0})`,
  children: org.jobs?.length > 0 ? (
    <Table
      dataSource={org.jobs}
      rowKey="id"
      pagination={{ pageSize: 10 }}
      columns={[
        {
          title: "Role",
          dataIndex: "role",
          key: "role",
          render: (v) => <Text strong>{v}</Text>,
        },
        {
          title: "Employment Type",
          dataIndex: "employmentType",
          key: "employmentType",
          render: (v) => <Tag>{v}</Tag>,
        },
        {
          title: "Job Type",
          dataIndex: "jobType",
          key: "jobType",
          render: (v) => <Tag color="blue">{v}</Tag>,
        },
        {
          title: "Location",
          dataIndex: "location",
          key: "location",
          render: (v) => v || "—",
        },
        {
          title: "Salary",
          dataIndex: "salary",
          key: "salary",
          render: (v) => v || "Not Disclosed",
        },
        {
          title: "Applications",
          key: "applications",
          render: (_, r) => (
            <Tag color="purple">{r._count?.jobApplications || 0} applied</Tag>
          ),
        },
        {
          title: "Status",
          dataIndex: "status",
          key: "status",
          render: (s) => (
            <Tag color={s === "Open" ? "success" : "error"}>{s}</Tag>
          ),
        },
        {
          title: "Posted",
          dataIndex: "createdAt",
          key: "createdAt",
          render: (d) =>
            new Date(d).toLocaleDateString("en-IN", {
              day: "2-digit", month: "short", year: "numeric",
            }),
        },
      ]}
    />
  ) : (
    <Alert type="info" message="No jobs posted by this organization" showIcon />
  ),
},
    {
      key: "subscription",
      label: "Subscription",
      children: org.subscription ? (
        <div>
          <Card style={{ marginBottom: 16, borderRadius: 8 }}>
            <Space wrap>
              <div>
                <Text type="secondary">Status</Text>
                <br />
                <Select
                  value={org.subscription.status}
                //   onChange={handleStatusChange}
                  style={{ width: 160, marginTop: 4 }}
                  options={[
                    { value: "ACTIVE", label: "ACTIVE" },
                    { value: "PAST_DUE", label: "PAST_DUE" },
                    { value: "CANCELLED", label: "CANCELLED" },
                  ]}
                />
              </div>
              <div>
                <Text type="secondary">Billing Cycle</Text>
                <br />
                <Tag style={{ marginTop: 4 }}>{org.subscription.billingCycle}</Tag>
              </div>
              <div>
                <Text type="secondary">Period Ends</Text>
                <br />
                <Text strong>
                  {new Date(org.subscription.currentPeriodEnd).toLocaleDateString("en-IN")}
                </Text>
              </div>
              <div>
                <Text type="secondary">Total Seats</Text>
                <br />
                <Tag color="blue">{org.subscription.seats?.length || 0}</Tag>
              </div>
            </Space>
          </Card>
          <Title level={5}>Invoices</Title>
          <Table
            dataSource={org.subscription.invoices}
            columns={invoiceColumns}
            rowKey="id"
            pagination={false}
            size="small"
          />
        </div>
      ) : (
        <Alert type="info" message="No subscription found for this organization" showIcon />
      ),
    },
    {
      key: "invites",
      label: `Pending Invites (${org._count?.invites || 0})`,
      children: (
        <Table
          dataSource={org.invites}
          rowKey="id"
          pagination={false}
          columns={[
            { title: "Email", dataIndex: "email", key: "email" },
            { title: "Role", dataIndex: "role", key: "role", render: (r) => <Tag>{r}</Tag> },
            {
              title: "Expires",
              dataIndex: "expiresAt",
              key: "expiresAt",
              render: (d) => new Date(d).toLocaleDateString("en-IN"),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/admin/organizations")}>
          Back
        </Button>
      </Space>

      {/* Header */}
      <Card style={{ marginBottom: 16, borderRadius: 10 }}>
        <Space>
          <Avatar
            size={56}
            src={org.companyProfile?.logoUrl}
            icon={<BankOutlined />}
            style={{ background: "#e6f4ff" }}
          />
          <div>
            <Title level={4} style={{ margin: 0 }}>{org.name}</Title>
            <Text type="secondary">{org.companyProfile?.headquarters || "No location"}</Text>
          </div>
        </Space>
      </Card>

      {/* Tabs */}
      <Card style={{ borderRadius: 10 }}>
        <Tabs items={tabItems} />
      </Card>
    </div>
  );
}