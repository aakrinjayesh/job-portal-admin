// src/pages/QueryManager.jsx
import { useState } from "react";
import {
  Card, Button, Table, Tag, Typography,
  Alert, Space, Select, Spin, Tooltip, Grid,
} from "antd";
import {
  PlayCircleOutlined,
  ClearOutlined,
  CopyOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import { executeQueryApi } from "../api/api";

const { Title, Text } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;

const QUERY_TEMPLATES = [
  {
    label: "All Users",
    query: `SELECT id, name, email, role, "emailverified", "createdAt" FROM "Users" ORDER BY "createdAt" DESC LIMIT 50;`,
  },
  {
    label: "Total Users by Role",
    query: `SELECT role, COUNT(*) as total FROM "Users" GROUP BY role;`,
  },
  {
    label: "All Organizations",
    query: `SELECT id, name, "createdAt" FROM "Organization" ORDER BY "createdAt" DESC LIMIT 50;`,
  },
  {
    label: "All Jobs",
    query: `SELECT id, role, "employmentType", status, location, "createdAt" FROM "Job" WHERE "isDeleted" = false ORDER BY "createdAt" DESC LIMIT 50;`,
  },
  {
    label: "Jobs by Status",
    query: `SELECT status, COUNT(*) as total FROM "Job" WHERE "isDeleted" = false GROUP BY status;`,
  },
  {
    label: "All Licenses",
    query: `SELECT id, "planId", "isActive", "validFrom", "validUntil" FROM "License" ORDER BY "validFrom" DESC LIMIT 50;`,
  },
  {
    label: "Active Licenses",
    query: `SELECT id, "planId", "validUntil" FROM "License" WHERE "isActive" = true ORDER BY "validUntil" ASC LIMIT 50;`,
  },
  {
    label: "Job Applications",
    query: `SELECT id, "jobId", "userId", status, "appliedAt" FROM "JobApplication" ORDER BY "appliedAt" DESC LIMIT 50;`,
  },
  {
    label: "Applications by Status",
    query: `SELECT status, COUNT(*) as total FROM "JobApplication" GROUP BY status;`,
  },
  {
    label: "Organizations with Members",
    query: `SELECT o.id, o.name, COUNT(m.id) as member_count FROM "Organization" o LEFT JOIN "OrganizationMember" m ON o.id = m."organizationId" GROUP BY o.id, o.name ORDER BY member_count DESC;`,
  },
  {
    label: "Recent Signups (7 days)",
    query: `SELECT name, email, role, "createdAt" FROM "Users" WHERE "createdAt" >= NOW() - INTERVAL '7 days' ORDER BY "createdAt" DESC;`,
  },
  {
    label: "Subscription Plans",
    query: `SELECT id, tier, name, "monthlyPrice", "yearlyPrice" FROM "SubscriptionPlan";`,
  },
];

export default function QueryManager() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rowCount, setRowCount] = useState(0);
  const [executionTime, setExecutionTime] = useState(null);

  const screens = useBreakpoint();
  const isMobile = !screens.sm;

  const handleRun = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    setColumns([]);

    const start = Date.now();
    try {
      const res = await executeQueryApi(query);
      const elapsed = Date.now() - start;
      setExecutionTime(elapsed);
      setRowCount(res.count);

      if (res.rows && res.rows.length > 0) {
        const cols = Object.keys(res.rows[0]).map((key) => ({
          title: key,
          dataIndex: key,
          key,
          ellipsis: true,
          // ✅ on mobile limit width
          width: isMobile ? 120 : undefined,
          render: (val) => {
            if (val === null || val === undefined)
              return <Text type="secondary">NULL</Text>;
            if (typeof val === "boolean")
              return <Tag color={val ? "green" : "red"}>{String(val)}</Tag>;
            if (typeof val === "object")
              return (
                <Text style={{ fontSize: 11 }}>
                  {JSON.stringify(val).slice(0, 80)}...
                </Text>
              );
            return String(val);
          },
        }));
        setColumns(cols);
        setResult(res.rows.map((row, i) => ({ ...row, _key: i })));
      } else {
        setResult([]);
        setColumns([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Query failed");
      setExecutionTime(Date.now() - start);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (value) => {
    const template = QUERY_TEMPLATES.find((t) => t.label === value);
    if (template) setQuery(template.query);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(query);
  };

  const handleClear = () => {
    setQuery("");
    setResult(null);
    setColumns([]);
    setError("");
    setExecutionTime(null);
  };

  return (
    <div style={{ padding: "8px 0" }}>

      {/* Header */}
      <div style={{ marginBottom: isMobile ? 16 : 24 }}>
        <Space>
          <DatabaseOutlined style={{ fontSize: isMobile ? 18 : 22, color: "#1677FF" }} />
          <Title level={isMobile ? 5 : 4} style={{ margin: 0 }}>
            SQL Query Manager
          </Title>
        </Space>
        <br />
        <Text type="secondary" style={{ fontSize: isMobile ? 12 : 14 }}>
          {isMobile
            ? "Run SELECT queries on your database."
            : "Run SELECT queries directly on your database. Write operations are blocked for safety."}
        </Text>
      </div>

      {/* Query Templates */}
      <Card
        style={{ marginBottom: 12, borderRadius: 10 }}
        styles={{ body: { padding: isMobile ? "10px 12px" : "12px 16px" } }}
      >
        {/* ✅ Mobile: stack vertically, Desktop: horizontal */}
        <div style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 8 : 12,
          alignItems: isMobile ? "flex-start" : "center",
        }}>
          <Text strong style={{ fontSize: isMobile ? 12 : 14, whiteSpace: "nowrap" }}>
            Quick Templates:
          </Text>
          <Select
            placeholder="Select a template..."
            style={{ width: isMobile ? "100%" : 250 }}
            onChange={handleTemplateSelect}
            value={null}
          >
            {QUERY_TEMPLATES.map((t) => (
              <Option key={t.label} value={t.label}>
                {t.label}
              </Option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Query Editor */}
      <Card
        style={{ marginBottom: 12, borderRadius: 10 }}
        styles={{ body: { padding: isMobile ? 12 : 16 } }}
      >
        {/* Toolbar */}
        <div style={{
          marginBottom: 8,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
        }}>
          <Text strong style={{ fontSize: isMobile ? 12 : 14 }}>SQL Query</Text>
          <Space size={isMobile ? 4 : 8}>
            <Tooltip title="Copy query">
              <Button
                size="small"
                icon={<CopyOutlined />}
                onClick={handleCopy}
                disabled={!query}
              >
                {/* ✅ hide text on mobile, show icon only */}
                {!isMobile && "Copy"}
              </Button>
            </Tooltip>
            <Tooltip title="Clear">
              <Button
                size="small"
                icon={<ClearOutlined />}
                onClick={handleClear}
                disabled={!query}
              >
                {!isMobile && "Clear"}
              </Button>
            </Tooltip>
          </Space>
        </div>

        {/* Textarea */}
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Write your SQL query here...\n\nExample:\nSELECT * FROM "Users" LIMIT 10;`}
          style={{
            width: "100%",
            // ✅ shorter on mobile
            minHeight: isMobile ? 120 : 160,
            padding: isMobile ? "10px 12px" : "12px 16px",
            fontFamily: "'Courier New', monospace",
            fontSize: isMobile ? 12 : 13,
            lineHeight: 1.6,
            border: "1.5px solid #d9d9d9",
            borderRadius: 8,
            background: "#1e1e2e",
            color: "#cdd6f4",
            resize: "vertical",
            outline: "none",
            boxSizing: "border-box",
          }}
          onKeyDown={(e) => {
            if (e.ctrlKey && e.key === "Enter") handleRun();
            if (e.key === "Tab") {
              e.preventDefault();
              const start = e.target.selectionStart;
              const end = e.target.selectionEnd;
              const newVal = query.substring(0, start) + "  " + query.substring(end);
              setQuery(newVal);
            }
          }}
        />

        {/* Run button row */}
        <div style={{
          marginTop: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
        }}>
          {/* ✅ hide tip on mobile */}
          {!isMobile && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              💡 Tip: Press <kbd>Ctrl+Enter</kbd> to run query
            </Text>
          )}

          {/* ✅ full width button on mobile */}
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={handleRun}
            loading={loading}
            disabled={!query.trim()}
            style={{
              borderRadius: 6,
              height: 38,
              paddingInline: isMobile ? 0 : 24,
              width: isMobile ? "100%" : "auto",
            }}
          >
            Run Query
          </Button>
        </div>
      </Card>

      {/* Error */}
      {error && (
        <Alert
          type="error"
          message="Query Error"
          description={error}
          showIcon
          style={{ marginBottom: 12, borderRadius: 8 }}
        />
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: isMobile ? 24 : 40 }}>
          <Spin size="large" />
          <br />
          <Text type="secondary" style={{ marginTop: 8, display: "block" }}>
            Running query...
          </Text>
        </div>
      )}

      {/* Results */}
      {!loading && result !== null && (
        <Card
          style={{ borderRadius: 10 }}
          styles={{ body: { padding: isMobile ? "12px 8px" : "24px" } }}
          title={
            <Space wrap>
              <Text strong style={{ fontSize: isMobile ? 13 : 14 }}>Results</Text>
              <Tag color="blue">{rowCount} rows</Tag>
              {executionTime !== null && (
                <Tag color="green">{executionTime}ms</Tag>
              )}
            </Space>
          }
        >
          {result.length === 0 ? (
            <Alert type="info" message="Query returned 0 rows" showIcon />
          ) : (
            <Table
              dataSource={result}
              columns={columns}
              rowKey="_key"
              // ✅ always horizontal scroll for results table
              scroll={{ x: "max-content" }}
              size="small"
              pagination={{
                pageSize: isMobile ? 10 : 20,
                showSizeChanger: !isMobile,
                showTotal: (total) =>
                  isMobile ? `${total} rows` : `Total ${total} rows`,
                simple: isMobile, // ✅ simpler pagination on mobile
              }}
            />
          )}
        </Card>
      )}
    </div>
  );
}