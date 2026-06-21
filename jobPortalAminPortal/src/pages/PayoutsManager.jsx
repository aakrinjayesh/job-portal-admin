import { useEffect, useState } from "react";
import {
  Card, Table, Tag, Button, Modal, Input, Typography,
  Space, message, Select, Row, Col, Statistic, Tooltip,
} from "antd";
import {
  CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined,
  DollarOutlined, ClockCircleOutlined, CheckOutlined,
} from "@ant-design/icons";
import { listPayoutsApi, approvePayoutApi, rejectPayoutApi } from "../api/api";

const { Title, Text } = Typography;
const { TextArea } = Input;

const STATUS_COLOR = { PENDING: "orange", COMPLETED: "green", FAILED: "red" };

export default function PayoutsManager() {
  const [messageApi, contextHolder] = message.useMessage();
  const [payouts, setPayouts]       = useState([]);
  const [loading, setLoading]       = useState(false);
  const [statusFilter, setFilter]   = useState("PENDING");
  const [pagination, setPagination] = useState({ page: 1, total: 0 });

  // approve
  const [approveModal, setApproveModal] = useState({ open: false, payout: null });
  const [gatewayRef, setGatewayRef]     = useState("");
  const [approving, setApproving]       = useState(false);

  // reject
  const [rejectModal, setRejectModal] = useState({ open: false, payout: null });
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting]       = useState(false);

  // ── fetch ─────────────────────────────────────────────────────────────────
  const fetchPayouts = async (page = 1) => {
    setLoading(true);
    try {
      const res = await listPayoutsApi({ status: statusFilter || undefined, page, limit: 20 });
      // backend: { status, data: [...], total, page, totalPages }
      setPayouts(res.data.data || []);
      setPagination({ page, total: res.data.total || 0 });
    } catch {
      messageApi.error("Failed to load payouts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayouts(1); }, [statusFilter]);

  // ── actions ───────────────────────────────────────────────────────────────
  const handleApprove = async () => {
    setApproving(true);
    try {
      await approvePayoutApi(approveModal.payout.id, {
        gatewayPayoutId: gatewayRef.trim() || undefined,
      });
      messageApi.success("Payout approved");
      setApproveModal({ open: false, payout: null });
      setGatewayRef("");
      fetchPayouts(pagination.page);
    } catch (err) {
      messageApi.error(err?.response?.data?.message || "Approval failed");
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    setRejecting(true);
    try {
      await rejectPayoutApi(rejectModal.payout.id, {
        reason: rejectReason.trim() || undefined,
      });
      messageApi.success("Payout rejected — funds returned to instructor");
      setRejectModal({ open: false, payout: null });
      setRejectReason("");
      fetchPayouts(pagination.page);
    } catch (err) {
      messageApi.error(err?.response?.data?.message || "Rejection failed");
    } finally {
      setRejecting(false);
    }
  };

  // ── stats from current page data ──────────────────────────────────────────
  const pendingCount   = payouts.filter((p) => p.status === "PENDING").length;
  const completedCount = payouts.filter((p) => p.status === "COMPLETED").length;
  const failedCount    = payouts.filter((p) => p.status === "FAILED").length;

  // ── columns ───────────────────────────────────────────────────────────────
  const columns = [
    {
      title: "Instructor",
      key: "instructor",
      render: (_, r) => (
        <Space direction="vertical" size={0}>
          <Text strong>{r.instructor?.user?.name || "—"}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{r.instructor?.user?.email}</Text>
        </Space>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (v) => <Text strong>₹{Number(v).toLocaleString("en-IN")}</Text>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s) => <Tag color={STATUS_COLOR[s] || "default"}>{s}</Tag>,
    },
    {
      title: "Available Balance",
      key: "balance",
      render: (_, r) => (
        <Space direction="vertical" size={0}>
          <Text>₹{Number(r.instructor?.availableBalance ?? 0).toLocaleString("en-IN")}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>
            Lifetime: ₹{Number(r.instructor?.lifetimeEarnings ?? 0).toLocaleString("en-IN")}
          </Text>
          <Text type="secondary" style={{ fontSize: 11 }}>
            Withdrawn: ₹{Number(r.instructor?.lifetimeWithdrawn ?? 0).toLocaleString("en-IN")}
          </Text>
        </Space>
      ),
    },
    {
      title: "Bank / UPI",
      key: "bankupi",
      render: (_, r) => {
        const i = r.instructor;
        if (!i?.bankAccountNumber && !i?.upiId) return <Text type="secondary">—</Text>;
        return (
          <Space direction="vertical" size={0}>
            {i.bankAccountNumber && (
              <Text style={{ fontSize: 12 }}>
                Bank: ••••{String(i.bankAccountNumber).slice(-4)}
              </Text>
            )}
            {i.upiId && <Text style={{ fontSize: 12 }}>UPI: {i.upiId}</Text>}
          </Space>
        );
      },
    },
    {
      title: "Gateway Ref",
      dataIndex: "gatewayPayoutId",
      key: "gwRef",
      render: (v) => v ? <Text code style={{ fontSize: 11 }}>{v}</Text> : <Text type="secondary">—</Text>,
    },
    {
      title: "Requested",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (v) =>
        new Date(v).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      render: (_, record) =>
        record.status === "PENDING" ? (
          <Space>
            <Tooltip title="Approve & mark COMPLETED">
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => setApproveModal({ open: true, payout: record })}
              >
                Approve
              </Button>
            </Tooltip>
            <Tooltip title="Reject & refund balance">
              <Button
                danger
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={() => setRejectModal({ open: true, payout: record })}
              >
                Reject
              </Button>
            </Tooltip>
          </Space>
        ) : (
          <Text type="secondary" style={{ fontSize: 12 }}>—</Text>
        ),
    },
  ];

  return (
    <>
      {contextHolder}

      <Title level={4} style={{ marginBottom: 20 }}>Instructor Payouts</Title>

      {/* Summary strip */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {[
          { label: "Pending (this page)", value: pendingCount,   color: "#FA8C16", icon: <ClockCircleOutlined /> },
          { label: "Completed (this page)", value: completedCount, color: "#52C41A", icon: <CheckOutlined /> },
          { label: "Failed / Rejected",     value: failedCount,   color: "#FF4D4F", icon: <CloseCircleOutlined /> },
        ].map(({ label, value, color, icon }) => (
          <Col xs={24} sm={8} key={label}>
            <Card bordered={false} style={{ borderLeft: `4px solid ${color}`, borderRadius: 8 }}>
              <Statistic title={label} value={value} prefix={icon} valueStyle={{ color }} />
            </Card>
          </Col>
        ))}
      </Row>

      <Card
        bordered={false}
        title={<Space><DollarOutlined /><span>Payout Requests</span></Space>}
        extra={
          <Space>
            <Select
              value={statusFilter}
              onChange={(v) => setFilter(v)}
              style={{ width: 140 }}
              options={[
                { value: "",          label: "All statuses" },
                { value: "PENDING",   label: "Pending" },
                { value: "COMPLETED", label: "Completed" },
                { value: "FAILED",    label: "Failed" },
              ]}
            />
            <Button icon={<ReloadOutlined />} onClick={() => fetchPayouts(1)}>
              Refresh
            </Button>
          </Space>
        }
        style={{ borderRadius: 8 }}
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={payouts}
          loading={loading}
          scroll={{ x: 1000 }}
          pagination={{
            current: pagination.page,
            pageSize: 20,
            total: pagination.total,
            onChange: (p) => fetchPayouts(p),
            showTotal: (t) => `${t} total payouts`,
          }}
        />
      </Card>

      {/* ── Approve Modal ── */}
      <Modal
        open={approveModal.open}
        title="Approve Payout"
        okText="Confirm Approve"
        okButtonProps={{ loading: approving }}
        onOk={handleApprove}
        onCancel={() => { setApproveModal({ open: false, payout: null }); setGatewayRef(""); }}
        destroyOnClose
      >
        {approveModal.payout && (
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <Text>
              Approving{" "}
              <Text strong>
                ₹{Number(approveModal.payout.amount).toLocaleString("en-IN")}
              </Text>{" "}
              for <Text strong>{approveModal.payout.instructor?.user?.name}</Text>.
              This will mark the payout <Tag color="green">COMPLETED</Tag> and
              increment their lifetime withdrawn amount.
            </Text>
            <Input
              placeholder="Gateway / UTR reference (optional)"
              value={gatewayRef}
              onChange={(e) => setGatewayRef(e.target.value)}
            />
          </Space>
        )}
      </Modal>

      {/* ── Reject Modal ── */}
      <Modal
        open={rejectModal.open}
        title="Reject Payout"
        okText="Reject & Refund"
        okButtonProps={{ loading: rejecting, danger: true }}
        onOk={handleReject}
        onCancel={() => { setRejectModal({ open: false, payout: null }); setRejectReason(""); }}
        destroyOnClose
      >
        {rejectModal.payout && (
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <Text>
              Rejecting{" "}
              <Text strong>
                ₹{Number(rejectModal.payout.amount).toLocaleString("en-IN")}
              </Text>{" "}
              for <Text strong>{rejectModal.payout.instructor?.user?.name}</Text>.
              The amount will be <Text strong>returned</Text> to their available
              balance and an ADJUSTMENT ledger entry will be created.
            </Text>
            <TextArea
              rows={3}
              placeholder="Reason for rejection (optional, stored in ledger)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </Space>
        )}
      </Modal>
    </>
  );
}
