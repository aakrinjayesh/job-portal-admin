/**
 * SeedSocialManager — Admin UI for the AI engagement / seed-social system.
 *
 * Backend contract (all routes under /admin/seed/...):
 *
 * Config    GET/PUT /seed/config
 *           Response: { status, message, data: SeedConfig }
 *
 * Personas  GET /seed/personas        → { data: SeedPersona[] (with user, CandidateProfile) }
 *           POST /seed/personas       → { name, voice, expertise[], verbosity, emojiUsage, maxPerDay, title, location, totalExperience, profileUrl }
 *           PATCH /seed/personas/:id  → same fields (all optional); id = SeedPersona.id
 *           DELETE /seed/personas/:id (soft) | ?hard=true (hard)
 *
 * Categories GET /seed/categories        → { data: SeedCategory[] }
 *            POST /seed/categories       → { key, label, description, isActive? }
 *            PATCH /seed/categories/:id  → { label?, description?, isActive? }
 *            DELETE /seed/categories/:id
 *
 * Engagements GET /seed/engagements?status=&type=&page=&limit=
 *             Response: { data: { rows: [], total, page, totalPages } }
 *             POST /seed/engagements/:id/cancel  (only SCHEDULED ones)
 *
 * Stats       GET /seed/stats → { data: { personas, activePersonas, activeCategories, engagements: { STATUS: n } } }
 *
 * Triggers    POST /seed/generate-now  POST /seed/post-now
 *
 * Purge       DELETE /seed/purge  body: { confirm: true }
 */

import { useEffect, useState, useCallback } from "react";
import {
  Card, Tabs, Table, Tag, Button, Modal, Form, Input,
  InputNumber, Select, Switch, Typography, Space, message,
  Popconfirm, Row, Col, Statistic, Divider, Spin, Alert,
  Avatar, Tooltip,
} from "antd";
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined,
  PlayCircleOutlined, ThunderboltOutlined, SettingOutlined,
  UserOutlined, AppstoreOutlined, UnorderedListOutlined,
  WarningOutlined, RobotOutlined,
} from "@ant-design/icons";
import {
  getSeedConfigApi, updateSeedConfigApi,
  listPersonasApi, createPersonaApi, updatePersonaApi, deletePersonaApi,
  listCategoriesApi, createCategoryApi, updateCategoryApi, deleteCategoryApi,
  listEngagementsApi, cancelEngagementApi,
  triggerGenerateApi, triggerPostApi,
  getSeedStatsApi, purgeSeedDataApi,
} from "../api/api";

const { Title, Text } = Typography;
const { TextArea } = Input;

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG TAB
// ─────────────────────────────────────────────────────────────────────────────
function ConfigTab() {
  const [messageApi, ctx] = message.useMessage();
  const [loading, setLoading]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [triggering, setTrig]   = useState({ generate: false, post: false });
  const [purging, setPurging]   = useState(false);
  const [stats, setStats]       = useState(null);
  const [form] = Form.useForm();

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const [cfgRes, statsRes] = await Promise.all([getSeedConfigApi(), getSeedStatsApi()]);
      // response shape: { status, message, data: {...} }
      form.setFieldsValue(cfgRes.data.data);
      setStats(statsRes.data.data);
    } catch {
      messageApi.error("Failed to load config / stats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchConfig(); }, []);

  const handleSave = async (values) => {
    setSaving(true);
    try {
      await updateSeedConfigApi(values);
      messageApi.success("Config saved");
    } catch (err) {
      messageApi.error(err?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const trigger = async (type) => {
    setTrig((t) => ({ ...t, [type]: true }));
    try {
      const res = type === "generate" ? await triggerGenerateApi() : await triggerPostApi();
      const d = res.data;
      if (d.data?.configured === false) {
        messageApi.warning(d.data.message || "SOCIAL_INTERNAL_URL not configured — cron will run automatically");
      } else {
        messageApi.success(`${type === "generate" ? "Generate" : "Post"} job triggered`);
      }
    } catch (err) {
      messageApi.error(err?.response?.data?.message || "Trigger failed");
    } finally {
      setTrig((t) => ({ ...t, [type]: false }));
    }
  };

  const handlePurge = async () => {
    setPurging(true);
    try {
      await purgeSeedDataApi();
      messageApi.success("All seed personas and engagements purged");
      fetchConfig();
    } catch (err) {
      messageApi.error(err?.response?.data?.message || "Purge failed");
    } finally {
      setPurging(false);
    }
  };

  const NUMBER_FIELDS = [
    { name: "maxCommentsPerDay",    label: "Max Comments / Day" },
    { name: "maxLikesPerDay",       label: "Max Likes / Day" },
    { name: "commentsPerPostMin",   label: "Comments / Post (min)" },
    { name: "commentsPerPostMax",   label: "Comments / Post (max)" },
    { name: "likesPerPostMin",      label: "Likes / Post (min)" },
    { name: "likesPerPostMax",      label: "Likes / Post (max)" },
    { name: "postEligibleDays",     label: "Post Eligible Days" },
    { name: "lowEngagementMax",     label: "Low Engagement Max" },
    { name: "firstActionDelayMin",  label: "First Action Delay Min (s)" },
    { name: "firstActionDelayMax",  label: "First Action Delay Max (s)" },
    { name: "actionGapMin",         label: "Action Gap Min (s)" },
    { name: "activeHourStart",      label: "Active Hour Start (0–23)" },
    { name: "activeHourEnd",        label: "Active Hour End (1–24)" },
    { name: "perRunCap",            label: "Per Run Cap" },
  ];

  return (
    <>
      {ctx}

      {/* Stats strip */}
      {stats && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          {[
            { label: "Total Personas",   value: stats.personas,        color: "#1677FF" },
            { label: "Active Personas",  value: stats.activePersonas,  color: "#52C41A" },
            { label: "Active Categories",value: stats.activeCategories,color: "#722ED1" },
            { label: "Engagements (SCHEDULED)", value: stats.engagements?.SCHEDULED || 0, color: "#FA8C16" },
            { label: "Engagements (COMPLETED)", value: stats.engagements?.COMPLETED || 0, color: "#52C41A" },
            { label: "Engagements (FAILED)",    value: stats.engagements?.FAILED    || 0, color: "#FF4D4F" },
          ].map(({ label, value, color }) => (
            <Col xs={12} sm={8} md={4} key={label}>
              <Card bordered={false} size="small" style={{ borderLeft: `3px solid ${color}`, borderRadius: 8 }}>
                <Statistic title={label} value={value} valueStyle={{ color, fontSize: 20 }} />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Manual triggers */}
      <Space style={{ marginBottom: 20 }} wrap>
        <Button
          icon={<ThunderboltOutlined />}
          loading={triggering.generate}
          onClick={() => trigger("generate")}
        >
          Generate Now
        </Button>
        <Button
          icon={<PlayCircleOutlined />}
          loading={triggering.post}
          onClick={() => trigger("post")}
        >
          Post Now
        </Button>
        <Button icon={<ReloadOutlined />} onClick={fetchConfig}>
          Refresh Stats
        </Button>
        <Popconfirm
          title="Purge ALL seed data?"
          description="This will delete all persona accounts and engagements. Config and categories are kept. This cannot be undone."
          icon={<WarningOutlined style={{ color: "red" }} />}
          onConfirm={handlePurge}
          okText="Yes, Purge"
          okButtonProps={{ danger: true }}
        >
          <Button danger loading={purging} icon={<WarningOutlined />}>
            Purge Seed Data
          </Button>
        </Popconfirm>
      </Space>

      {loading ? (
        <Spin />
      ) : (
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Row gutter={24}>
            <Col xs={24} sm={8}>
              <Form.Item name="enabled" label="System Enabled" valuePropName="checked">
                <Switch checkedChildren="ON" unCheckedChildren="OFF" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={16}>
              <Form.Item name="timezone" label="Timezone">
                <Input placeholder="e.g. Asia/Kolkata" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Rate Limits &amp; Scheduling</Divider>

          <Row gutter={16}>
            {NUMBER_FIELDS.map(({ name, label }) => (
              <Col xs={24} sm={12} md={8} key={name}>
                <Form.Item name={name} label={label}>
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            ))}
          </Row>

          <Button type="primary" htmlType="submit" loading={saving}>
            Save Config
          </Button>
        </Form>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PERSONAS TAB
// ─────────────────────────────────────────────────────────────────────────────
function PersonasTab() {
  const [messageApi, ctx] = message.useMessage();
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [modal, setModal]       = useState({ open: false, record: null });
  const [saving, setSaving]     = useState(false);
  const [form] = Form.useForm();

  const fetchPersonas = async () => {
    setLoading(true);
    try {
      const res = await listPersonasApi();
      // { status, message, data: [...] }
      setPersonas(res.data.data || []);
    } catch {
      messageApi.error("Failed to load personas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPersonas(); }, []);

  const openModal = (record = null) => {
    setModal({ open: true, record });
    if (record) {
      form.setFieldsValue({
        name:            record.user?.name || "",
        voice:           record.voice || "",
        expertise:       (record.expertise || []).join(", "),
        verbosity:       record.verbosity || "medium",
        emojiUsage:      record.emojiUsage || "low",
        maxPerDay:       record.maxPerDay ?? 3,
        title:           record.user?.CandidateProfile?.title || "",
        location:        record.user?.CandidateProfile?.currentLocation || "",
        totalExperience: "",
        profileUrl:      record.user?.profileUrl || "",
        isActive:        record.isActive ?? true,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ verbosity: "medium", emojiUsage: "low", maxPerDay: 3, isActive: true });
    }
  };

  const handleSave = async (values) => {
    setSaving(true);
    const payload = {
      ...values,
      expertise: values.expertise
        ? values.expertise.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
    };
    try {
      if (modal.record) {
        await updatePersonaApi(modal.record.id, payload);
        messageApi.success("Persona updated");
      } else {
        await createPersonaApi(payload);
        messageApi.success("Persona created — a seed user account was auto-created");
      }
      setModal({ open: false, record: null });
      fetchPersonas();
    } catch (err) {
      messageApi.error(err?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, hard = false) => {
    try {
      await deletePersonaApi(id, hard);
      messageApi.success(hard ? "Persona hard-deleted" : "Persona deactivated");
      fetchPersonas();
    } catch (err) {
      messageApi.error(err?.response?.data?.message || "Delete failed");
    }
  };

  const columns = [
    {
      title: "Persona",
      key: "persona",
      render: (_, r) => (
        <Space>
          <Avatar size={36} src={r.user?.profileUrl} style={{ background: "#1677FF" }}>
            {(r.user?.name || "?")[0]}
          </Avatar>
          <Space direction="vertical" size={0}>
            <Text strong>{r.user?.name || "—"}</Text>
            <Text type="secondary" style={{ fontSize: 11 }}>{r.user?.email}</Text>
            {r.user?.CandidateProfile?.title && (
              <Text style={{ fontSize: 11, color: "#888" }}>{r.user.CandidateProfile.title}</Text>
            )}
          </Space>
        </Space>
      ),
    },
    {
      title: "Voice",
      dataIndex: "voice",
      key: "voice",
      render: (v) => <Text italic>"{v}"</Text>,
    },
    {
      title: "Expertise",
      dataIndex: "expertise",
      key: "expertise",
      render: (arr) => arr?.length
        ? arr.map((e) => <Tag key={e} color="blue">{e}</Tag>)
        : <Text type="secondary">—</Text>,
    },
    {
      title: "Style",
      key: "style",
      render: (_, r) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: 12 }}>Verbosity: <Tag>{r.verbosity}</Tag></Text>
          <Text style={{ fontSize: 12 }}>Emoji: <Tag>{r.emojiUsage}</Tag></Text>
          <Text style={{ fontSize: 12 }}>Max/day: {r.maxPerDay}</Text>
        </Space>
      ),
    },
    {
      title: "Active",
      dataIndex: "isActive",
      key: "isActive",
      render: (v) => <Tag color={v ? "green" : "default"}>{v ? "Active" : "Inactive"}</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, r) => (
        <Space>
          <Tooltip title="Edit persona">
            <Button size="small" icon={<EditOutlined />} onClick={() => openModal(r)} />
          </Tooltip>
          <Popconfirm
            title="Deactivate this persona?"
            description="Use hard delete (via ?hard=true) to fully remove the account."
            onConfirm={() => handleDelete(r.id, false)}
            okText="Deactivate"
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      {ctx}
      <Alert
        type="info"
        showIcon
        message="Creating a persona auto-creates a seed user account with a @seed.aakrin.invalid email. The account is hidden from candidates."
        style={{ marginBottom: 12 }}
      />
      <div style={{ marginBottom: 12 }}>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
            New Persona
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchPersonas}>Refresh</Button>
        </Space>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={personas}
        loading={loading}
        scroll={{ x: 800 }}
      />

      <Modal
        open={modal.open}
        title={modal.record ? "Edit Persona" : "New Persona"}
        width={600}
        onCancel={() => setModal({ open: false, record: null })}
        onOk={() => form.submit()}
        okText="Save"
        okButtonProps={{ loading: saving }}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Name" rules={[{ required: !modal.record, message: "Name is required" }]}>
                <Input placeholder="e.g. Priya Sharma" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="title" label="Professional Title">
                <Input placeholder="e.g. Salesforce Architect" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="voice"
            label="Voice / Tone"
            rules={[{ required: !modal.record, message: "Voice is required" }]}
          >
            <TextArea
              rows={2}
              placeholder="e.g. professional but approachable, uses short punchy sentences, references real-world Salesforce projects"
            />
          </Form.Item>

          <Form.Item name="expertise" label="Expertise (comma-separated)">
            <Input placeholder="Salesforce, Sales Cloud, Apex, LWC" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="verbosity" label="Verbosity">
                <Select options={[{ value: "short", label: "Short" }, { value: "medium", label: "Medium" }]} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="emojiUsage" label="Emoji Usage">
                <Select
                  options={[
                    { value: "none",   label: "None" },
                    { value: "low",    label: "Low" },
                    { value: "medium", label: "Medium" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="maxPerDay" label="Max / Day">
                <InputNumber min={1} max={50} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="location" label="Location">
                <Input placeholder="e.g. Bengaluru, India" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="totalExperience" label="Total Experience">
                <Input placeholder="e.g. 7 years" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="profileUrl" label="Profile Picture URL">
            <Input placeholder="https://... (leave blank for auto-generated avatar)" />
          </Form.Item>

          {modal.record && (
            <Form.Item name="isActive" label="Active" valuePropName="checked">
              <Switch />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORIES TAB
// ─────────────────────────────────────────────────────────────────────────────
function CategoriesTab() {
  const [messageApi, ctx] = message.useMessage();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [modal, setModal]           = useState({ open: false, record: null });
  const [saving, setSaving]         = useState(false);
  const [form] = Form.useForm();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await listCategoriesApi();
      setCategories(res.data.data || []);
    } catch {
      messageApi.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openModal = (record = null) => {
    setModal({ open: true, record });
    if (record) {
      form.setFieldsValue({
        label:       record.label,
        description: record.description,
        isActive:    record.isActive,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ isActive: true });
    }
  };

  const handleSave = async (values) => {
    setSaving(true);
    try {
      if (modal.record) {
        // update: only label, description, isActive allowed
        await updateCategoryApi(modal.record.id, {
          label:       values.label,
          description: values.description,
          isActive:    values.isActive,
        });
        messageApi.success("Category updated");
      } else {
        // create: key + label + description + isActive
        await createCategoryApi(values);
        messageApi.success("Category created");
      }
      setModal({ open: false, record: null });
      fetchCategories();
    } catch (err) {
      messageApi.error(err?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCategoryApi(id);
      messageApi.success("Category deleted");
      fetchCategories();
    } catch (err) {
      messageApi.error(err?.response?.data?.message || "Delete failed");
    }
  };

  const columns = [
    {
      title: "Key",
      dataIndex: "key",
      key: "key",
      render: (v) => <Text code>{v}</Text>,
    },
    {
      title: "Label",
      dataIndex: "label",
      key: "label",
      render: (v) => <Text strong>{v}</Text>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Active",
      dataIndex: "isActive",
      key: "isActive",
      render: (v) => <Tag color={v ? "green" : "default"}>{v ? "Active" : "Inactive"}</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, r) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openModal(r)} />
          <Popconfirm
            title="Delete this category?"
            description="Any engagements tagged to this category will remain but won't be selectable."
            onConfirm={() => handleDelete(r.id)}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      {ctx}
      <div style={{ marginBottom: 12 }}>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
            New Category
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchCategories}>Refresh</Button>
        </Space>
      </div>

      <Table rowKey="id" columns={columns} dataSource={categories} loading={loading} scroll={{ x: 600 }} />

      <Modal
        open={modal.open}
        title={modal.record ? "Edit Category" : "New Category"}
        onCancel={() => setModal({ open: false, record: null })}
        onOk={() => form.submit()}
        okText="Save"
        okButtonProps={{ loading: saving }}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          {/* Key only on create — backend slugifies it and makes it immutable */}
          {!modal.record && (
            <Form.Item
              name="key"
              label="Key (slug, immutable after creation)"
              rules={[{ required: true, message: "Key is required" }]}
            >
              <Input placeholder="e.g. career-advice" />
            </Form.Item>
          )}
          <Form.Item name="label" label="Label" rules={[{ required: true, message: "Label is required" }]}>
            <Input placeholder="e.g. Career Advice" />
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true, message: "Description is required" }]}>
            <TextArea rows={3} placeholder="Describe what kind of AI comments this category generates" />
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ENGAGEMENTS TAB
// ─────────────────────────────────────────────────────────────────────────────
const ENG_STATUS_COLOR = {
  SCHEDULED: "orange",
  COMPLETED: "green",
  FAILED:    "red",
  CANCELLED: "default",
};

function EngagementsTab() {
  const [messageApi, ctx]     = message.useMessage();
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPag]  = useState({ page: 1, total: 0 });
  const [statusFilter, setStatus] = useState("");
  const [typeFilter, setType]     = useState("");

  const fetchEngagements = async (page = 1) => {
    setLoading(true);
    try {
      const res = await listEngagementsApi({
        status: statusFilter || undefined,
        type:   typeFilter   || undefined,
        page,
        limit: 25,
      });
      // backend: { data: { rows: [], total, page, totalPages } }
      const d = res.data.data;
      setRows(d.rows || []);
      setPag({ page, total: d.total || 0 });
    } catch {
      messageApi.error("Failed to load engagements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEngagements(1); }, [statusFilter, typeFilter]);

  const handleCancel = async (id) => {
    try {
      await cancelEngagementApi(id);
      messageApi.success("Engagement cancelled");
      fetchEngagements(pagination.page);
    } catch (err) {
      messageApi.error(err?.response?.data?.message || "Cancel failed");
    }
  };

  const columns = [
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (v) => <Tag>{v}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s) => <Tag color={ENG_STATUS_COLOR[s] || "default"}>{s}</Tag>,
    },
    {
      title: "Persona",
      dataIndex: "persona",
      key: "persona",
      render: (v) => <Text>{v}</Text>,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (v) => v ? <Tag color="purple">{v}</Tag> : <Text type="secondary">—</Text>,
    },
    {
      title: "Post Preview",
      dataIndex: "postSnippet",
      key: "postSnippet",
      ellipsis: true,
      render: (v) => v ? <Text style={{ fontSize: 12 }}>{v}</Text> : <Text type="secondary">—</Text>,
    },
    {
      title: "Content",
      dataIndex: "content",
      key: "content",
      ellipsis: true,
      render: (v) =>
        v ? (
          <Tooltip title={v}>
            <Text style={{ fontSize: 12 }}>{v.slice(0, 60)}{v.length > 60 ? "…" : ""}</Text>
          </Tooltip>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: "Scheduled For",
      dataIndex: "scheduledFor",
      key: "scheduledFor",
      render: (v) =>
        v ? new Date(v).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—",
    },
    {
      title: "Error",
      dataIndex: "error",
      key: "error",
      render: (v) => v ? <Text type="danger" style={{ fontSize: 11 }}>{v}</Text> : <Text type="secondary">—</Text>,
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      render: (_, r) =>
        r.status === "SCHEDULED" ? (
          <Popconfirm
            title="Cancel this engagement?"
            onConfirm={() => handleCancel(r.id)}
          >
            <Button size="small" danger>Cancel</Button>
          </Popconfirm>
        ) : (
          <Text type="secondary" style={{ fontSize: 12 }}>—</Text>
        ),
    },
  ];

  return (
    <>
      {ctx}
      <Space style={{ marginBottom: 12 }} wrap>
        <Select
          value={statusFilter}
          onChange={(v) => setStatus(v)}
          style={{ width: 150 }}
          placeholder="Filter by status"
          allowClear
          options={[
            { value: "SCHEDULED", label: "Scheduled" },
            { value: "COMPLETED", label: "Completed" },
            { value: "FAILED",    label: "Failed" },
            { value: "CANCELLED", label: "Cancelled" },
          ]}
        />
        <Select
          value={typeFilter}
          onChange={(v) => setType(v)}
          style={{ width: 150 }}
          placeholder="Filter by type"
          allowClear
          options={[
            { value: "COMMENT", label: "Comment" },
            { value: "LIKE",    label: "Like" },
          ]}
        />
        <Button icon={<ReloadOutlined />} onClick={() => fetchEngagements(1)}>
          Refresh
        </Button>
      </Space>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={rows}
        loading={loading}
        scroll={{ x: 1100 }}
        pagination={{
          current: pagination.page,
          pageSize: 25,
          total: pagination.total,
          onChange: (p) => fetchEngagements(p),
          showTotal: (t) => `${t} engagements`,
        }}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function SeedSocialManager() {
  const TAB_ITEMS = [
    {
      key: "config",
      label: <span><SettingOutlined /> Config &amp; Stats</span>,
      children: <ConfigTab />,
    },
    {
      key: "personas",
      label: <span><UserOutlined /> Personas</span>,
      children: <PersonasTab />,
    },
    {
      key: "categories",
      label: <span><AppstoreOutlined /> Categories</span>,
      children: <CategoriesTab />,
    },
    {
      key: "engagements",
      label: <span><UnorderedListOutlined /> Engagements</span>,
      children: <EngagementsTab />,
    },
  ];

  return (
    <>
      <Title level={4} style={{ marginBottom: 16 }}>
        <RobotOutlined style={{ marginRight: 8 }} />
        AI Comments / Seed Social
      </Title>
      <Alert
        type="warning"
        showIcon
        message="Changes to config take effect on the next scheduled run. Use Generate Now / Post Now to trigger immediately."
        style={{ marginBottom: 20 }}
      />
      <Card bordered={false} style={{ borderRadius: 8 }}>
        <Tabs defaultActiveKey="config" items={TAB_ITEMS} />
      </Card>
    </>
  );
}
