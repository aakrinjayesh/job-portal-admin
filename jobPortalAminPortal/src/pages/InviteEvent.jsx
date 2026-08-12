import {
  Card,
  Typography,
  Table,
  Select,
  Button,
  Tag,
  Tooltip,
  message,
  Space,
  Empty,
} from "antd";
import {
  TeamOutlined,
  BankOutlined,
  MailOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  getAllEventsApi,
  fetchCandidateBatchesApi,
  fetchCompanyBatchesApi,
  sendBatchMailApi,
} from "../api/api.js";

const { Title, Text } = Typography;

export default function InviteEvent() {
  const [messageApi, contextHolder] = message.useMessage();

  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(undefined);

  const [batchType, setBatchType] = useState(null); // "candidate" | "company" | null
  const [batches, setBatches] = useState([]);
  const [fetchingCandidates, setFetchingCandidates] = useState(false);
  const [fetchingCompanies, setFetchingCompanies] = useState(false);
  const [sendingBatchId, setSendingBatchId] = useState(null);

  const fetchEvents = async () => {
    setEventsLoading(true);
    try {
      const res = await getAllEventsApi();
      const list =
        res.data?.events || res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setEvents(list);
    } catch {
      messageApi.error("Failed to load events");
    } finally {
      setEventsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleFetchCandidates = async () => {
    setFetchingCandidates(true);
    try {
      const res = await fetchCandidateBatchesApi();
      setBatches(res.data.batches || []);
      setBatchType("candidate");
      messageApi.success(res.data.message);
    } catch (err) {
      messageApi.error(err?.response?.data?.message || "Failed to fetch candidates");
    } finally {
      setFetchingCandidates(false);
    }
  };

  const handleFetchCompanies = async () => {
    setFetchingCompanies(true);
    try {
      const res = await fetchCompanyBatchesApi();
      setBatches(res.data.batches || []);
      setBatchType("company");
      messageApi.success(res.data.message);
    } catch (err) {
      messageApi.error(err?.response?.data?.message || "Failed to fetch companies");
    } finally {
      setFetchingCompanies(false);
    }
  };

  const handleSendMail = async (batch) => {
    if (!selectedEventId) {
      messageApi.warning("Select an event first");
      return;
    }
    setSendingBatchId(batch.batchId);
    try {
      const res = await sendBatchMailApi({
        batchId: batch.batchId,
        eventId: selectedEventId,
      });
      setBatches((prev) =>
        prev.map((b) => (b.batchId === batch.batchId ? { ...b, ...res.data.batch } : b)),
      );
      messageApi.success(res.data.message);
    } catch (err) {
      messageApi.error(err?.response?.data?.message || "Failed to send mail");
    } finally {
      setSendingBatchId(null);
    }
  };

  const peopleColumns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    ...(batchType === "company"
      ? [{ title: "Company Name", dataIndex: "companyName", key: "companyName", render: (v) => v || "-" }]
      : []),
    {
      title: "Joined",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (v) => (v ? dayjs(v).format("DD MMM YYYY") : "-"),
    },
  ];

  const columns = [
    {
      title: "Batch",
      key: "batch",
      render: (_, record) => <Text strong>Batch {record.batchNumber}</Text>,
    },
    {
      title: "People",
      key: "people",
      render: (_, record) => record.users?.length || 0,
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) =>
        record.sent ? (
          <Tooltip
            title={`Sent for "${record.sentEventName}" on ${
              record.sentAt ? dayjs(record.sentAt).format("DD MMM YYYY, hh:mm A") : ""
            }`}
          >
            <Tag icon={<CheckCircleOutlined />} color="green">
              Sent
            </Tag>
          </Tooltip>
        ) : (
          <Tag>Not sent</Tag>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Tooltip title={!selectedEventId && !record.sent ? "Select an event first" : ""}>
          <Button
            type="primary"
            size="small"
            icon={<MailOutlined />}
            disabled={record.sent || !selectedEventId}
            loading={sendingBatchId === record.batchId}
            onClick={() => handleSendMail(record)}
          >
            {record.sent ? "Sent" : "Send Mail"}
          </Button>
        </Tooltip>
      ),
    },
  ];

  return (
    <>
      {contextHolder}

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          Invite Event
        </Title>
        <Text type="secondary">
          Fetch candidates or companies in batches of 10 and send them an event invitation.
        </Text>
      </div>

      {/* Event selector */}
      <Card style={{ marginBottom: 24 }}>
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <Text strong>Select Event</Text>
          <Select
            showSearch
            allowClear
            placeholder="Select an event to invite for"
            style={{ width: 420, maxWidth: "100%" }}
            loading={eventsLoading}
            value={selectedEventId}
            onChange={setSelectedEventId}
            optionFilterProp="label"
            options={events.map((e) => ({
              value: e.id,
              label: `${e.name}${e.eventDate ? " — " + dayjs(e.eventDate).format("DD MMM YYYY") : ""}`,
            }))}
            notFoundContent={eventsLoading ? "Loading..." : "No events found"}
          />
          <Text type="secondary" style={{ fontSize: 12 }}>
            The mail is sent to the selected event's invitation template, with every
            person in the batch BCC'd.
          </Text>
        </Space>
      </Card>

      {/* Fetch buttons */}
      <Space style={{ marginBottom: 24 }}>
        <Button
          icon={<TeamOutlined />}
          type={batchType === "candidate" ? "primary" : "default"}
          loading={fetchingCandidates}
          onClick={handleFetchCandidates}
        >
          Fetch Candidates
        </Button>
        <Button
          icon={<BankOutlined />}
          type={batchType === "company" ? "primary" : "default"}
          loading={fetchingCompanies}
          onClick={handleFetchCompanies}
        >
          Fetch Companies
        </Button>
      </Space>

      {/* Batches table */}
      <Card
        title={
          batchType
            ? `${batchType === "candidate" ? "Candidate" : "Company"} Batches`
            : "Batches"
        }
      >
        <Table
          dataSource={batches}
          columns={columns}
          rowKey="batchId"
          pagination={false}
          locale={{
            emptyText: (
              <Empty description="Fetch candidates or companies to see batches" />
            ),
          }}
          expandable={{
            expandedRowRender: (record) => (
              <Table
                dataSource={record.users}
                columns={peopleColumns}
                rowKey="id"
                pagination={false}
                size="small"
              />
            ),
          }}
        />
      </Card>
    </>
  );
}
