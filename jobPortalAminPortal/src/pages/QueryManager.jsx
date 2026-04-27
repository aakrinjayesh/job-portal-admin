// src/pages/QueryManager.jsx
import { useState } from "react";
import {
  Card, Button, Table, Tag, Typography,
  Alert, Space, Select, Spin, Tooltip, Grid, Divider,
} from "antd";
import {
  PlayCircleOutlined,
  ClearOutlined,
  CopyOutlined,
  DatabaseOutlined,
  TableOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { executeQueryApi } from "../api/api";

const { Title, Text } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;

// ─── Schema Explorer Data ─────────────────────────────────────────────────────
const SCHEMA_EXPLORER = {
  Users: [
    "id", "name", "email", "chatuserid", "phoneNumber", "companyName",
    "profileUrl", "role", "notificationsEnabled", "notificationType",
    "reminderNotificationsEnabled", "password", "emailverified", "isactive", "createdAt",
  ],
  Organization: ["id", "name", "createdAt", "updatedAt"],
  OrganizationMember: ["id", "organizationId", "userId", "role", "permissions", "createdAt", "updatedAt"],
  OrganizationInvite: ["id", "email", "token", "organizationId", "role", "permissions", "licenseId", "seatId", "createdAt", "expiresAt"],
  CompanyProfile: ["id", "name", "slug", "tagline", "description", "website", "industry", "companySize", "foundedYear", "logoUrl", "coverImage", "headquarters", "locations", "specialties", "socialLinks", "organizationId", "createdAt", "updatedAt"],
  UserProfile: ["id", "userId", "vendorId", "chatuserid", "profilePicture", "title", "summary", "name", "phoneNumber", "email", "portfolioLink", "preferredLocation", "currentLocation", "preferredJobType", "currentCTC", "expectedCTC", "rateCardPerHour", "status", "joiningPeriod", "totalExperience", "relevantSalesforceExperience", "skillsJson", "primaryClouds", "secondaryClouds", "certifications", "workExperience", "education", "isContactDetails", "linkedInUrl", "trailheadUrl", "isVerified", "organizationId", "createdAt", "updatedAt"],
  UserSession: ["id", "userId", "refreshToken", "userAgent", "ipAddress", "revoked", "expiresAt", "createdAt"],
  Job: ["id", "role", "description", "employmentType", "tenure", "experience", "experienceLevel", "location", "skills", "clouds", "salary", "companyName", "responsibilities", "certifications", "jobType", "applicantSource", "status", "applicationDeadline", "isDeleted", "deletedReason", "deletedAt", "ApplicationLimit", "companyLogo", "postedById", "organizationId", "createdAt", "updatedAt"],
  JobApplication: ["id", "jobId", "userId", "candidateProfileId", "appliedById", "status", "appliedAt", "updatedAt", "organizationId"],
  ApplicationAnalysis: ["id", "jobApplicationId", "fitPercentage", "details", "status", "createdAt", "updatedAt"],
  JobApplicationQuestion: ["id", "jobId", "question", "type", "options", "required", "order", "createdAt", "updatedAt"],
  JobApplicationAnswer: ["id", "applicationId", "questionId", "answerText", "createdAt"],
  SavedJob: ["id", "jobId", "userId", "savedAt", "organizationId", "isDeleted", "deletedAt"],
  SavedCandidate: ["id", "recruiterId", "candidateProfileId", "note", "organizationId", "createdAt", "updatedAt"],
  OrganizationSubscription: ["id", "organizationId", "status", "billingCycle", "autoRenew", "currentPeriodStart", "currentPeriodEnd", "nextBillingDate"],
  License: ["id", "subscriptionId", "planId", "assignedToId", "seatId", "purchasedById", "paymentId", "validFrom", "validUntil", "isActive"],
  SubscriptionPlan: ["id", "tier", "name", "monthlyPrice", "yearlyPrice"],
  LicenseSeat: ["id", "subscriptionId", "assignedToId", "createdAt", "updatedAt"],
  PlanLimit: ["id", "planId", "planName", "feature", "period", "maxAllowed"],
  UsageRecord: ["id", "licenseId", "seatId", "feature", "period", "currentUsage", "periodStart", "periodEnd", "isExceeded"],
  AITokenUsage: ["id", "organizationId", "userId", "licenseId", "seatId", "inputTokens", "outputTokens", "totalTokens", "featureUsed", "createdAt"],
  Invoice: ["id", "subscriptionId", "invoiceNumber", "status", "billingCycle", "planTier", "subtotal", "tax", "total", "quantity", "periodStart", "periodEnd", "dueDate", "paidAt", "promoCode"],
  Payment: ["id", "subscriptionId", "invoiceId", "amount", "currency", "status", "gateway", "gatewayPaymentId", "gatewaySessionId"],
  Activity: ["id", "recruiterId", "candidateId", "jobId", "category", "organizationId", "createdAt", "updatedAt"],
  ActivityNote: ["id", "activityId", "subject", "noteType", "description", "interactedAt", "startTime", "endTime", "reminderSent", "createdAt", "updatedAt"],
  ActivitySchedule: ["id", "activityId", "title", "scheduleType", "startTime", "endTime", "notes", "createdAt", "updatedAt"],
  CandidateRating: ["id", "recruiterId", "candidateProfileId", "rating", "comment", "createdAt", "updatedAt"],
  CandidateJobFit: ["id", "jobId", "candidateProfileId", "fitPercentage", "details", "status", "createdAt", "updatedAt"],
  TaskTemplate: ["id", "recruiterId", "organizationId", "title", "order", "isDefault", "isActive", "createdAt", "updatedAt"],
  CandidateTaskList: ["id", "recruiterId", "candidateId", "jobId", "organizationId", "createdAt", "updatedAt"],
  CandidateTask: ["id", "taskListId", "organizationId", "title", "completed", "order", "isActive", "dueDate", "createdFromId", "createdAt", "updatedAt"],
  PromoCode: ["id", "code", "discountType", "discountValue", "applicablePlans", "validFrom", "validTo", "maxTotalUsages", "totalUsages", "isActive", "createdById", "createdAt", "updatedAt"],
  PromoCodeUsage: ["id", "promoCodeId", "userId", "discountType", "discountValue", "discountedAmount", "invoiceId", "paymentId", "usedAt"],
  SupportMessage: ["id", "fullName", "email", "phoneNumber", "role", "subject", "message", "createdAt"],
  EmailLog: ["id", "to", "subject", "status", "provider", "messageId", "response", "error", "retries", "createdAt", "updatedAt"],
  Address: ["id", "doorNumber", "street", "city", "state", "country", "pinCode", "gstNumber", "organizationId"],
  Skills: ["id", "name", "isVerified"],
  Certification: ["id", "name", "isVerified"],
  Location: ["id", "name", "isVerified"],
  Cloud: ["id", "name", "isVerified"],
  CompanyRole: ["id", "name", "isVerified"],
  Qualification: ["id", "name", "isVerified"],
  Dashboard: ["id", "name", "description", "ownerId", "createdAt", "updatedAt"],
  DashboardWidget: ["id", "dashboardId", "title", "dataset", "chartType", "metricType", "metricField", "xField", "categoryField", "timeBucket", "filters", "sort", "display", "createdAt", "updatedAt"],
  Course: ["id", "title", "description", "price", "currency", "courseType", "url", "userId", "createdAt"],
  Class: ["id", "fileName", "url", "type", "title", "description", "size", "duration", "metaData", "courseId", "createdAt"],
  Review: ["id", "rating", "comment", "userId", "courseId", "createdAt", "updatedAt"],
  Country: ["id", "name", "code"],
  State: ["id", "name", "code", "countryId"],
};

const TABLE_NAMES = Object.keys(SCHEMA_EXPLORER).sort();

// ─── Query Templates ──────────────────────────────────────────────────────────
const QUERY_TEMPLATES = [
  { label: "All Users", query: `SELECT id, name, email, role, "emailverified", "createdAt" FROM "Users" ORDER BY "createdAt" DESC LIMIT 50;` },
  { label: "Total Users by Role", query: `SELECT role, COUNT(*) as total FROM "Users" GROUP BY role;` },
  { label: "All Organizations", query: `SELECT id, name, "createdAt" FROM "Organization" ORDER BY "createdAt" DESC LIMIT 50;` },
  { label: "All Jobs", query: `SELECT id, role, "employmentType", status, location, "createdAt" FROM "Job" WHERE "isDeleted" = false ORDER BY "createdAt" DESC LIMIT 50;` },
  { label: "Jobs by Status", query: `SELECT status, COUNT(*) as total FROM "Job" WHERE "isDeleted" = false GROUP BY status;` },
  { label: "All Licenses", query: `SELECT id, "planId", "isActive", "validFrom", "validUntil" FROM "License" ORDER BY "validFrom" DESC LIMIT 50;` },
  { label: "Active Licenses", query: `SELECT id, "planId", "validUntil" FROM "License" WHERE "isActive" = true ORDER BY "validUntil" ASC LIMIT 50;` },
  { label: "Job Applications", query: `SELECT id, "jobId", "userId", status, "appliedAt" FROM "JobApplication" ORDER BY "appliedAt" DESC LIMIT 50;` },
  { label: "Applications by Status", query: `SELECT status, COUNT(*) as total FROM "JobApplication" GROUP BY status;` },
  { label: "Organizations with Members", query: `SELECT o.id, o.name, COUNT(m.id) as member_count FROM "Organization" o LEFT JOIN "OrganizationMember" m ON o.id = m."organizationId" GROUP BY o.id, o.name ORDER BY member_count DESC;` },
  { label: "Recent Signups (7 days)", query: `SELECT name, email, role, "createdAt" FROM "Users" WHERE "createdAt" >= NOW() - INTERVAL '7 days' ORDER BY "createdAt" DESC;` },
  { label: "Subscription Plans", query: `SELECT id, tier, name, "monthlyPrice", "yearlyPrice" FROM "SubscriptionPlan";` },
  { label: "Paid Plan Users", query: `SELECT u.name, u.email, u."phoneNumber", u.role, sp.tier, sp.name AS plan_name, l."validFrom", l."validUntil", l."isActive"\nFROM "License" l\nJOIN "OrganizationMember" om ON l."assignedToId" = om.id\nJOIN "Users" u ON om."userId" = u.id\nJOIN "SubscriptionPlan" sp ON l."planId" = sp.id\nWHERE sp.tier != 'BASIC' AND l."isActive" = true AND l."validUntil" >= NOW()\nORDER BY l."validFrom" DESC;` },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const needsQuote = (col) => /[A-Z]/.test(col);
const q = (col) => needsQuote(col) ? `"${col}"` : col;

function buildSelectQuery(table, cols) {
  if (!table) return "";
  const colStr = cols.length === 0 ? "*" : cols.map(q).join(", ");
  return `SELECT ${colStr}\nFROM "${table}"\nLIMIT 50;`;
}

export default function QueryManager() {
  const [query, setQuery]                   = useState("");
  const [result, setResult]                 = useState(null);
  const [columns, setColumns]               = useState([]);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState("");
  const [rowCount, setRowCount]             = useState(0);
  const [executionTime, setExecutionTime]   = useState(null);
  const [selectedTable, setSelectedTable]   = useState(null);
  const [selectedColumns, setSelectedColumns] = useState([]);

  const screens  = useBreakpoint();
  const isMobile = !screens.sm;

  // ── Schema Explorer ──────────────────────────────────────────────────────────
  const handleTableSelect = (table) => {
    setSelectedTable(table);
    setSelectedColumns([]);
    setQuery(buildSelectQuery(table, []));
  };

  const handleColumnSelect = (cols) => {
    setSelectedColumns(cols);
    setQuery(buildSelectQuery(selectedTable, cols));
  };

  const handleClearExplorer = () => {
    setSelectedTable(null);
    setSelectedColumns([]);
  };

  // ── Run ──────────────────────────────────────────────────────────────────────
  const handleRun = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    setColumns([]);
    const start = Date.now();
    try {
      const res     = await executeQueryApi(query);
      const elapsed = Date.now() - start;
      setExecutionTime(elapsed);
      setRowCount(res.count);
      if (res.rows && res.rows.length > 0) {
        const cols = Object.keys(res.rows[0]).map((key) => ({
          title: key, dataIndex: key, key, ellipsis: true,
          width: isMobile ? 120 : undefined,
          render: (val) => {
            if (val === null || val === undefined) return <Text type="secondary">NULL</Text>;
            if (typeof val === "boolean") return <Tag color={val ? "green" : "red"}>{String(val)}</Tag>;
            if (typeof val === "object") return <Text style={{ fontSize: 11 }}>{JSON.stringify(val).slice(0, 80)}...</Text>;
            return String(val);
          },
        }));
        setColumns(cols);
        setResult(res.rows.map((row, i) => ({ ...row, _key: i })));
      } else {
        setResult([]); setColumns([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Query failed");
      setExecutionTime(Date.now() - start);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (value) => {
    const tpl = QUERY_TEMPLATES.find((t) => t.label === value);
    if (tpl) { setQuery(tpl.query); handleClearExplorer(); }
  };

  const handleCopy  = () => navigator.clipboard.writeText(query);
  const handleClear = () => {
    setQuery(""); setResult(null); setColumns([]);
    setError(""); setExecutionTime(null); handleClearExplorer();
  };

  const availableColumns = selectedTable ? (SCHEMA_EXPLORER[selectedTable] ?? []) : [];

  return (
    <div style={{ padding: "8px 0" }}>

      {/* Header */}
      <div style={{ marginBottom: isMobile ? 16 : 24 }}>
        <Space>
          <DatabaseOutlined style={{ fontSize: isMobile ? 18 : 22, color: "#1677FF" }} />
          <Title level={isMobile ? 5 : 4} style={{ margin: 0 }}>SQL Query Manager</Title>
        </Space>
        <br />
        <Text type="secondary" style={{ fontSize: isMobile ? 12 : 14 }}>
          {isMobile
            ? "Run SELECT queries on your database."
            : "Run SELECT queries directly on your database. Write operations are blocked for safety."}
        </Text>
      </div>

      {/* Quick Templates */}
      <Card
        style={{ marginBottom: 12, borderRadius: 10 }}
        styles={{ body: { padding: isMobile ? "10px 12px" : "12px 16px" } }}
      >
        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 8 : 12, alignItems: isMobile ? "flex-start" : "center" }}>
          <Text strong style={{ fontSize: isMobile ? 12 : 14, whiteSpace: "nowrap" }}>Quick Templates:</Text>
          <Select
            placeholder="Select a template..."
            style={{ width: isMobile ? "100%" : 250 }}
            onChange={handleTemplateSelect}
            value={null}
          >
            {QUERY_TEMPLATES.map((t) => <Option key={t.label} value={t.label}>{t.label}</Option>)}
          </Select>
        </div>
      </Card>

      {/* Query Editor */}
      <Card
        style={{ marginBottom: 12, borderRadius: 10 }}
        styles={{ body: { padding: isMobile ? 12 : 16 } }}
      >
        {/* Toolbar */}
        <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <Text strong style={{ fontSize: isMobile ? 12 : 14 }}>SQL Query</Text>
          <Space size={isMobile ? 4 : 8}>
          <Tooltip title="Copy query">
  <Button
    size="small"
    icon={<CopyOutlined />}
    onClick={handleCopy}
    disabled={!query}
  />
</Tooltip>
            <Tooltip title="Clear">
              <Button size="small" icon={<ClearOutlined />} onClick={handleClear} disabled={!query}>
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
            width: "100%", minHeight: isMobile ? 120 : 160,
            padding: isMobile ? "10px 12px" : "12px 16px",
            fontFamily: "'Courier New', monospace", fontSize: isMobile ? 12 : 13,
            lineHeight: 1.6, border: "1.5px solid #d9d9d9", borderRadius: 8,
            background: "#1e1e2e", color: "#cdd6f4", resize: "vertical",
            outline: "none", boxSizing: "border-box",
          }}
          onKeyDown={(e) => {
            if (e.ctrlKey && e.key === "Enter") handleRun();
            if (e.key === "Tab") {
              e.preventDefault();
              const s = e.target.selectionStart, en = e.target.selectionEnd;
              setQuery(query.substring(0, s) + "  " + query.substring(en));
            }
          }}
        />

        {/* ── Schema Explorer ──────────────────────────────────────────────── */}
        <Divider
          orientation="left"
          orientationMargin={0}
          style={{ margin: "14px 0 12px", fontSize: 12, color: "#8c8c8c" }}
        >
          <Space size={4}>
            <AppstoreOutlined style={{ fontSize: 12 }} />
            <span>Schema Explorer</span>
          </Space>
        </Divider>

        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 12, alignItems: "flex-start" }}>

          {/* Table dropdown */}
          <div style={{ flex: 1, width: isMobile ? "100%" : "auto", minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
              <TableOutlined style={{ fontSize: 12, color: "#1677ff" }} />
              <Text style={{ fontSize: 12, color: "#595959" }}>Table</Text>
              <Tag style={{ fontSize: 10, padding: "0 5px", lineHeight: "18px" }}>
                {TABLE_NAMES.length} tables
              </Tag>
            </div>
            <Select
              showSearch
              allowClear
              placeholder="Select a table..."
              style={{ width: "100%" }}
              value={selectedTable}
              onChange={handleTableSelect}
              onClear={handleClearExplorer}
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {TABLE_NAMES.map((t) => <Option key={t} value={t}>{t}</Option>)}
            </Select>
          </div>

          {/* Column dropdown */}
          <div style={{ flex: 2, width: isMobile ? "100%" : "auto", minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
              <DatabaseOutlined style={{ fontSize: 12, color: "#52c41a" }} />
              <Text style={{ fontSize: 12, color: "#595959" }}>Columns</Text>
              {selectedTable && (
                <Tag color="green" style={{ fontSize: 10, padding: "0 5px", lineHeight: "18px" }}>
                  {availableColumns.length} columns
                </Tag>
              )}
            </div>
            <Select
              mode="multiple"
              allowClear
              showSearch
              placeholder={selectedTable ? "Select columns — empty means SELECT *" : "Select a table first..."}
              style={{ width: "100%" }}
              value={selectedColumns}
              onChange={handleColumnSelect}
              disabled={!selectedTable}
              maxTagCount={isMobile ? 2 : 4}
              maxTagPlaceholder={(omitted) => `+${omitted.length} more`}
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {availableColumns.map((col) => <Option key={col} value={col}>{col}</Option>)}
            </Select>
          </div>
        </div>

        {selectedTable && (
          <Text type="secondary" style={{ fontSize: 11.5, display: "block", marginTop: 8 }}>
            Query auto-filled above. Leave columns empty to select all (<code>*</code>). You can still edit the query freely before running.
          </Text>
        )}

        {/* Run button */}
        <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          {!isMobile && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              💡 Tip: Press <kbd>Ctrl+Enter</kbd> to run query
            </Text>
          )}
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={handleRun}
            loading={loading}
            disabled={!query.trim()}
            style={{ borderRadius: 6, height: 38, paddingInline: isMobile ? 0 : 24, width: isMobile ? "100%" : "auto" }}
          >
            Run Query
          </Button>
        </div>
      </Card>

      {/* Error */}
      {error && (
        <Alert type="error" message="Query Error" description={error} showIcon style={{ marginBottom: 12, borderRadius: 8 }} />
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: isMobile ? 24 : 40 }}>
          <Spin size="large" />
          <br />
          <Text type="secondary" style={{ marginTop: 8, display: "block" }}>Running query...</Text>
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
              {executionTime !== null && <Tag color="green">{executionTime}ms</Tag>}
              {selectedTable && <Tag color="purple">{selectedTable}</Tag>}
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
              scroll={{ x: "max-content" }}
              size="small"
              pagination={{
                pageSize: isMobile ? 10 : 20,
                showSizeChanger: !isMobile,
                showTotal: (total) => isMobile ? `${total} rows` : `Total ${total} rows`,
                simple: isMobile,
              }}
            />
          )}
        </Card>
      )}
    </div>
  );
}