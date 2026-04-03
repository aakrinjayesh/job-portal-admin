import {
  Card,
  Row,
  Col,
  Button,
  Typography,
  Tag,
  Badge,
  Table,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Tooltip,
  message,
  Space,
} from "antd";
import {
  PlusOutlined,
  CopyOutlined,
  CheckOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import axiosInstance from "../api/axiosInstance.js";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const PLAN_OPTIONS = [
  { value: "BASIC", label: "BASIC" },
  { value: "PROFESSIONAL", label: "PROFESSIONAL" },
  { value: "ORGANIZATION", label: "ORGANIZATION" },
  { value: "ENTERPRISE", label: "ENTERPRISE" },
];

const genCode = () => {
  const rand = () => Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PROMO-${rand()}-${rand()}`;
};

export default function PromoCodeManager() {
  const [messageApi, contextHolder] = message.useMessage();
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [form] = Form.useForm();

  const fetchPromos = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/admin/promo/list");
      setPromos(res.data.data || []);
    } catch {
      messageApi.error("Failed to load promo codes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const handleToggle = async (id) => {
    setToggling(id);
    try {
      const res = await axiosInstance.patch(`/admin/promo/${id}/toggle`);
      setPromos((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, isActive: res.data.data.isActive } : p,
        ),
      );
    } catch {
      messageApi.error("Failed to toggle promo code");
    } finally {
      setToggling(null);
    }
  };

  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleCreate = async (values) => {
    setSubmitting(true);
    try {
      const [validFrom, validTo] = values.validity;
      await axiosInstance.post("/admin/promo/create", {
        code: values.code || undefined,
        discountType: values.discountType,
        discountValue: values.discountValue,
        applicablePlans: values.applicablePlans || [],
        validFrom: validFrom.toISOString(),
        validTo: validTo.toISOString(),
        maxTotalUsages: values.maxTotalUsages || -1,
      });
      messageApi.success("Promo code created");
      setModalOpen(false);
      form.resetFields();
      fetchPromos();
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to create promo code";
      messageApi.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Stats ── */
  const now = new Date();
  const totalCodes = promos.length;
  const activeCodes = promos.filter((p) => p.isActive).length;
  const expiredCodes = promos.filter((p) => new Date(p.validTo) < now).length;
  const totalRedemptions = promos.reduce(
    (sum, p) => sum + (p._count?.usages || 0),
    0,
  );

  const stats = [
    { label: "Total Codes", value: totalCodes, color: "#1677ff" },
    { label: "Active", value: activeCodes, color: "#52c41a" },
    { label: "Expired", value: expiredCodes, color: "#ff4d4f" },
    { label: "Total Redemptions", value: totalRedemptions, color: "#722ed1" },
  ];

  /* ── Table columns ── */
  const columns = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      render: (code, record) => (
        <Space>
          <Text strong style={{ fontFamily: "monospace" }}>
            {code}
          </Text>
          <Tooltip title={copiedId === record.id ? "Copied!" : "Copy"}>
            <Button
              type="text"
              size="small"
              icon={
                copiedId === record.id ? (
                  <CheckOutlined style={{ color: "#52c41a" }} />
                ) : (
                  <CopyOutlined />
                )
              }
              onClick={() => handleCopy(code, record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: "Discount",
      key: "discount",
      render: (_, record) => (
        <Tag color={record.discountType === "PERCENTAGE" ? "blue" : "purple"}>
          {record.discountType === "PERCENTAGE"
            ? `${record.discountValue}% OFF`
            : `₹${record.discountValue} OFF`}
        </Tag>
      ),
    },
    {
      title: "Plans",
      key: "plans",
      render: (_, record) =>
        record.applicablePlans.length === 0 ? (
          <Tag>All Plans</Tag>
        ) : (
          record.applicablePlans.map((p) => (
            <Tag key={p} color="geekblue">
              {p}
            </Tag>
          ))
        ),
    },
    {
      title: "Validity",
      key: "validity",
      render: (_, record) => {
        const from = dayjs(record.validFrom).format("DD MMM YYYY");
        const to = dayjs(record.validTo).format("DD MMM YYYY");
        const isExpired = new Date(record.validTo) < now;
        const isUpcoming = new Date(record.validFrom) > now;
        return (
          <Space direction="vertical" size={0}>
            <Text style={{ fontSize: 12 }}>
              {from} – {to}
            </Text>
            {isExpired && <Tag color="red">Expired</Tag>}
            {isUpcoming && <Tag color="orange">Upcoming</Tag>}
          </Space>
        );
      },
    },
    {
      title: "Usage",
      key: "usage",
      render: (_, record) => {
        const used = record._count?.usages || 0;
        const max = record.maxTotalUsages;
        return (
          <Text>
            {used} / {max === -1 ? "∞" : max}
          </Text>
        );
      },
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => (
        <Badge
          status={record.isActive ? "success" : "default"}
          text={record.isActive ? "Active" : "Inactive"}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          size="small"
          loading={toggling === record.id}
          onClick={() => handleToggle(record.id)}
          danger={record.isActive}
        >
          {record.isActive ? "Disable" : "Enable"}
        </Button>
      ),
    },
  ];

  return (
    <>
      {contextHolder}

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          Promo Code Manager
        </Title>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchPromos}
            loading={loading}
          >
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalOpen(true)}
          >
            Create Promo Code
          </Button>
        </Space>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {stats.map((s) => (
          <Col xs={12} sm={6} key={s.label}>
            <Card size="small" style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>
                {s.value}
              </div>
              <Text type="secondary" style={{ fontSize: 13 }}>
                {s.label}
              </Text>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Table */}
      <Card>
        <Table
          dataSource={promos}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Create Modal */}
      <Modal
        title="Create Promo Code"
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={480}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          style={{ marginTop: 16 }}
        >
          {/* Code field */}
          <Form.Item
            label="Promo Code"
            name="code"
            normalize={(val) => val?.toUpperCase()}
          >
            <Input
              placeholder="Leave empty to auto-generate"
              addonAfter={
                <Button
                  type="link"
                  size="small"
                  style={{ padding: 0, height: "auto" }}
                  onClick={() => form.setFieldValue("code", genCode())}
                >
                  Auto-generate
                </Button>
              }
            />
          </Form.Item>

          {/* Discount Type */}
          <Form.Item
            label="Discount Type"
            name="discountType"
            rules={[{ required: true, message: "Select discount type" }]}
          >
            <Select
              options={[
                { value: "PERCENTAGE", label: "Percentage" },
                { value: "FLAT", label: "Flat Amount" },
              ]}
              placeholder="Select type"
            />
          </Form.Item>

          {/* Discount Value */}
          <Form.Item
            label="Discount Value"
            name="discountValue"
            rules={[{ required: true, message: "Enter discount value" }]}
          >
            <InputNumber
              min={1}
              style={{ width: "100%" }}
              placeholder="e.g. 20 or 500"
            />
          </Form.Item>

          {/* Applicable Plans */}
          <Form.Item
            label="Applicable Plans"
            name="applicablePlans"
            help="Leave empty to apply to all plans"
          >
            <Select
              mode="multiple"
              options={PLAN_OPTIONS}
              placeholder="All plans"
              allowClear
            />
          </Form.Item>

          {/* Validity */}
          <Form.Item
            label="Validity Period"
            name="validity"
            rules={[{ required: true, message: "Select validity range" }]}
          >
            <RangePicker
              showTime
              style={{ width: "100%" }}
              disabledDate={(d) => d && d < dayjs().startOf("day")}
            />
          </Form.Item>

          {/* Max Usages */}
          <Form.Item
            label="Max Total Usages"
            name="maxTotalUsages"
            help="Leave empty for unlimited"
          >
            <InputNumber
              min={1}
              style={{ width: "100%" }}
              placeholder="e.g. 100"
            />
          </Form.Item>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Button
              onClick={() => {
                setModalOpen(false);
                form.resetFields();
              }}
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={submitting}>
              Generate Promo Code
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}
