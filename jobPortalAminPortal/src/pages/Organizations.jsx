// src/pages/Organizations.jsx
import { useEffect, useState } from "react";
import {
  Table, Card, Input, Tag, Button, Space,
  Typography, Avatar, Modal, message, Tooltip,
} from "antd";
import {
  SearchOutlined, EyeOutlined,
  DeleteOutlined, BankOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  getOrganizationsApi,
  deleteOrganizationApi,
} from "../api/api";

const { Title, Text } = Typography;

export default function Organizations() {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrgs(1);
  }, []);

  const fetchOrgs = async (page = 1, searchVal = search) => {
    setLoading(true);
    try {
      const res = await getOrganizationsApi({
        page,
        limit: pagination.pageSize,
        search: searchVal,
      });
      setOrgs(res.data.organizations);
      setPagination((p) => ({ ...p, total: res.data.pagination.total, current: page }));
    } catch (err) {
      message.error("Failed to load organizations");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id, name) => {
    Modal.confirm({
      title: `Delete "${name}"?`,
      content: "This will permanently delete the organization and all its data.",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await deleteOrganizationApi(id);
          message.success("Organization deleted");
          fetchOrgs(pagination.current);
        } catch {
          message.error("Failed to delete");
        }
      },
    });
  };

  const columns = [
    {
      title: "Organization",
      key: "name",
      render: (_, record) => (
        <Space>
          <Avatar
            src={record.companyProfile?.logoUrl}
            icon={<BankOutlined />}
            style={{ background: "#e6f4ff" }}
          />
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 11 }}>
              {record.companyProfile?.industry || "—"}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Members",
      dataIndex: "_count",
      key: "members",
      render: (count) => (
        <Tag color="blue">{count?.members || 0} members</Tag>
      ),
    },
    {
      title: "Jobs",
      dataIndex: "_count",
      key: "jobs",
      render: (count) => (
        <Tag color="orange">{count?.jobs || 0} jobs</Tag>
      ),
    },
    {
      title: "Subscription",
      dataIndex: "subscription",
      key: "subscription",
      render: (sub) => {
        if (!sub) return <Tag color="default">No Plan</Tag>;
        const colors = {
          ACTIVE: "success",
          PAST_DUE: "warning",
          CANCELLED: "error",
        };
        return (
          <Space direction="vertical" size={0}>
            <Tag color={colors[sub.status]}>{sub.status}</Tag>
            <Text style={{ fontSize: 11 }} type="secondary">
              {sub.billingCycle}
            </Text>
          </Space>
        );
      },
    },
    {
      title: "Pending Invites",
      dataIndex: "invites",
      key: "invites",
      render: (invites) =>
        invites?.length > 0 ? (
          <Tag color="purple">{invites.length} pending</Tag>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) =>
        new Date(date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="primary"
              ghost
              size="small"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/admin/organizations/${record.id}`)}
            />
          </Tooltip>
          {/* <Tooltip title="Delete">
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id, record.name)}
            />
          </Tooltip> */}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Organizations</Title>
          <Text type="secondary">Manage all organizations on the platform</Text>
        </div>
        <Tag color="blue" style={{ fontSize: 14, padding: "4px 12px" }}>
          Total: {pagination.total}
        </Tag>
      </div>

      <Card style={{ borderRadius: 10 }}>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search organizations..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            fetchOrgs(1, e.target.value);
          }}
          style={{ marginBottom: 16, maxWidth: 300 }}
          allowClear
        />
        <Table
          dataSource={orgs}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: (page) => fetchOrgs(page),
            showTotal: (total) => `Total ${total} organizations`,
          }}
        />
      </Card>
    </div>
  );
}