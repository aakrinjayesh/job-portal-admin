/**
 * NetworkingRecommend.jsx
 *
 * Multi-step admin page:
 *   Step 1 — Browse + select an organisation networking post
 *   Step 2 — View post details, click "Recommend Candidates"
 *   Step 3 — Review AI-matched candidates (uncheck unwanted), click "Send Notification"
 *   Step 4 — Done / result summary
 */

import { useEffect, useState, useCallback } from "react";
import {
  Card, Table, Button, Input, Typography, Space, Tag, Avatar,
  message, Divider, Row, Col, Statistic, Spin, Alert, Checkbox,
  Tooltip, Badge, Steps, Empty, Progress,
} from "antd";
import {
  SearchOutlined, ArrowLeftOutlined, ArrowRightOutlined,
  UserOutlined, MailOutlined, ReloadOutlined, CheckCircleOutlined,
  BulbOutlined, TeamOutlined, BuildOutlined, SendOutlined,
} from "@ant-design/icons";
import {
  getNetworkingPostsApi,
  getNetworkingPostByIdApi,
  recommendCandidatesApi,
  notifyCandidatesApi,
} from "../api/api";

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

// ─── Step labels ─────────────────────────────────────────────────────────────
const STEPS = [
  { title: "Select Post",       icon: <BuildOutlined /> },
  { title: "Review Post",       icon: <BulbOutlined /> },
  { title: "Pick Candidates",   icon: <TeamOutlined /> },
  { title: "Done",              icon: <CheckCircleOutlined /> },
];

// ─── Utility ─────────────────────────────────────────────────────────────────
const truncate = (str = "", n = 160) =>
  str.length > n ? str.slice(0, n) + "…" : str;

const matchColor = (score) => {
  if (score >= 70) return "#52C41A";
  if (score >= 40) return "#FA8C16";
  return "#8C8C8C";
};

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1 — Post list
// ─────────────────────────────────────────────────────────────────────────────
function PostListStep({ onSelect }) {
  const [messageApi, ctx] = message.useMessage();
  const [posts, setPosts]       = useState([]);
  const [loading, setLoading]   = useState(false);
  const [search, setSearch]     = useState("");
  const [pagination, setPag]    = useState({ page: 1, total: 0 });

  const fetchPosts = useCallback(async (page = 1, q = search) => {
    setLoading(true);
    try {
      const res = await getNetworkingPostsApi({ page, limit: 20, search: q });
      const d = res.data.data;
      setPosts(d.posts || []);
      setPag({ page, total: d.total || 0 });
    } catch {
      messageApi.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchPosts(1); }, []);

  const columns = [
    {
      title: "Organisation",
      key: "org",
      width: 180,
      render: (_, r) => (
        <Space>
          <Avatar
            size={36}
            src={r.organization?.companyProfile?.logoUrl}
            style={{ background: "#1677FF", flexShrink: 0 }}
          >
            {(r.organization?.name || "O")[0]}
          </Avatar>
          <Text strong>{r.organization?.name || "—"}</Text>
        </Space>
      ),
    },
    {
      title: "Post Content",
      key: "content",
      render: (_, r) => (
        <Paragraph
          ellipsis={{ rows: 2 }}
          style={{ margin: 0, fontSize: 13, color: "#374151" }}
        >
          {r.contentPreview}
        </Paragraph>
      ),
    },
    {
      title: "Engagement",
      key: "engagement",
      width: 120,
      render: (_, r) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: 12 }}>👍 {r._count?.likes || 0} likes</Text>
          <Text style={{ fontSize: 12 }}>💬 {r._count?.comments || 0} comments</Text>
        </Space>
      ),
    },
    {
      title: "Posted",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 130,
      render: (v) =>
        new Date(v).toLocaleDateString("en-IN", { dateStyle: "medium" }),
    },
    {
      title: "",
      key: "action",
      width: 110,
      render: (_, r) => (
        <Button type="primary" size="small" onClick={() => onSelect(r)}>
          Select →
        </Button>
      ),
    },
  ];

  return (
    <>
      {ctx}
      <Card
        bordered={false}
        title={<Space><BuildOutlined /><span>Organisation Networking Posts</span></Space>}
        extra={
          <Space>
            <Search
              placeholder="Search org or content…"
              allowClear
              style={{ width: 260 }}
              onSearch={(v) => { setSearch(v); fetchPosts(1, v); }}
              onChange={(e) => !e.target.value && fetchPosts(1, "")}
            />
            <Button icon={<ReloadOutlined />} onClick={() => fetchPosts(1)} />
          </Space>
        }
        style={{ borderRadius: 8 }}
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={posts}
          loading={loading}
          scroll={{ x: 700 }}
          pagination={{
            current: pagination.page,
            pageSize: 20,
            total: pagination.total,
            onChange: (p) => fetchPosts(p),
            showTotal: (t) => `${t} posts`,
          }}
          onRow={(r) => ({
            style: { cursor: "pointer" },
            onClick: () => onSelect(r),
          })}
        />
      </Card>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 — Post detail + trigger recommend
// ─────────────────────────────────────────────────────────────────────────────
function PostDetailStep({ selectedPost, onBack, onRecommend }) {
  const [messageApi, ctx] = message.useMessage();
  const [post, setPost]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [analysing, setAnalysing] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getNetworkingPostByIdApi(selectedPost.id);
        setPost(res.data.data);
      } catch {
        messageApi.error("Failed to load post details");
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedPost.id]);

  const handleRecommend = async () => {
    setAnalysing(true);
    try {
      const res = await recommendCandidatesApi(selectedPost.id);
      onRecommend(res.data.data, post);
    } catch (err) {
      messageApi.error(err?.response?.data?.message || "Recommendation failed");
    } finally {
      setAnalysing(false);
    }
  };

  return (
    <>
      {ctx}
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={onBack}
        style={{ marginBottom: 16 }}
      >
        Back to Posts
      </Button>

      {loading ? (
        <Spin />
      ) : post ? (
        <Row gutter={24}>
          <Col xs={24} md={16}>
            <Card
              bordered={false}
              style={{ borderRadius: 8 }}
              title={
                <Space>
                  <Avatar
                    size={40}
                    src={post.organization?.companyProfile?.logoUrl}
                    style={{ background: "#1677FF" }}
                  >
                    {(post.organization?.name || "O")[0]}
                  </Avatar>
                  <div>
                    <Text strong style={{ display: "block" }}>
                      {post.organization?.name}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {new Date(post.createdAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </Text>
                  </div>
                </Space>
              }
            >
              <Paragraph style={{ fontSize: 15, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                {post.content}
              </Paragraph>

              {post.mediaUrls?.length > 0 && (
                <Space wrap style={{ marginTop: 12 }}>
                  {post.mediaUrls.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noreferrer">
                      <img
                        src={url}
                        alt={`media-${i}`}
                        style={{ maxWidth: 200, maxHeight: 140, borderRadius: 6, objectFit: "cover" }}
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                    </a>
                  ))}
                </Space>
              )}

              <Divider />

              <Row gutter={24}>
                <Col>
                  <Statistic title="Likes"    value={post._count?.likes    || 0} prefix="👍" />
                </Col>
                <Col>
                  <Statistic title="Comments" value={post._count?.comments || 0} prefix="💬" />
                </Col>
              </Row>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card
              bordered={false}
              style={{ borderRadius: 8 }}
              title="Organisation"
            >
              {post.organization?.companyProfile?.website && (
                <p>
                  <Text type="secondary">Website: </Text>
                  <a href={post.organization.companyProfile.website} target="_blank" rel="noreferrer">
                    {post.organization.companyProfile.website}
                  </a>
                </p>
              )}
              {post.organization?.companyProfile?.companySize && (
                <p>
                  <Text type="secondary">Size: </Text>
                  {post.organization.companyProfile.companySize}
                </p>
              )}
              {post.networkingPage && (
                <p>
                  <Text type="secondary">Page: </Text>
                  {post.networkingPage.name}
                </p>
              )}
            </Card>

            <Card bordered={false} style={{ borderRadius: 8, marginTop: 16 }}>
              <Alert
                type="info"
                showIcon
                message="The AI will extract skills, Salesforce clouds, and keywords from this post's content, then match them against all active candidate profiles."
                style={{ marginBottom: 16 }}
              />
              <Button
                type="primary"
                size="large"
                block
                icon={<BulbOutlined />}
                loading={analysing}
                onClick={handleRecommend}
              >
                {analysing ? "Analysing post…" : "Recommend Candidates"}
              </Button>
            </Card>
          </Col>
        </Row>
      ) : null}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3 — Candidate list with checkboxes → notify
// ─────────────────────────────────────────────────────────────────────────────
function CandidatePickStep({ postId, post, result, onBack, onDone }) {
  const [messageApi, ctx] = message.useMessage();
  const [selected, setSelected] = useState(() =>
    new Set((result?.candidates || []).map((c) => c.userId)),
  );
  const [sending, setSending] = useState(false);

  const candidates = result?.candidates || [];
  const extracted  = result?.extracted  || {};

  const toggle = (userId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const selectAll   = () => setSelected(new Set(candidates.map((c) => c.userId)));
  const deselectAll = () => setSelected(new Set());

  const handleSend = async () => {
    if (selected.size === 0) {
      messageApi.warning("Please select at least one candidate");
      return;
    }
    setSending(true);
    try {
      const res = await notifyCandidatesApi(postId, {
        candidateUserIds: Array.from(selected),
      });
      onDone(res.data.data);
    } catch (err) {
      messageApi.error(err?.response?.data?.message || "Failed to send notifications");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {ctx}

      <Button
        icon={<ArrowLeftOutlined />}
        onClick={onBack}
        style={{ marginBottom: 16 }}
      >
        Back to Post
      </Button>

      {/* Extracted requirements */}
      <Card
        bordered={false}
        style={{ borderRadius: 8, marginBottom: 16 }}
        size="small"
        title={<Space><BulbOutlined /><span>AI-Extracted Requirements from Post</span></Space>}
      >
        <Row gutter={24}>
          <Col xs={24} sm={8}>
            <Text type="secondary">Skills</Text>
            <br />
            {extracted.skills?.length
              ? extracted.skills.map((s) => <Tag key={s} color="blue">{s}</Tag>)
              : <Text type="secondary" style={{ fontSize: 12 }}>None detected</Text>}
          </Col>
          <Col xs={24} sm={8}>
            <Text type="secondary">Clouds</Text>
            <br />
            {extracted.clouds?.length
              ? extracted.clouds.map((c) => <Tag key={c} color="purple">{c}</Tag>)
              : <Text type="secondary" style={{ fontSize: 12 }}>None detected</Text>}
          </Col>
          <Col xs={24} sm={8}>
            <Text type="secondary">Keywords</Text>
            <br />
            {extracted.keywords?.length
              ? extracted.keywords.map((k) => <Tag key={k}>{k}</Tag>)
              : <Text type="secondary" style={{ fontSize: 12 }}>None detected</Text>}
          </Col>
        </Row>
        <Text type="secondary" style={{ fontSize: 12, marginTop: 8, display: "block" }}>
          Scanned {result?.totalScanned || 0} candidate profiles. Showing top {candidates.length} matches.
        </Text>
      </Card>

      {/* Selection controls */}
      <Card
        bordered={false}
        style={{ borderRadius: 8 }}
        title={
          <Space>
            <TeamOutlined />
            <span>Recommended Candidates</span>
            <Badge count={selected.size} style={{ background: "#1677FF" }} />
          </Space>
        }
        extra={
          <Space>
            <Button size="small" onClick={selectAll}>Select All</Button>
            <Button size="small" onClick={deselectAll}>Deselect All</Button>
            <Button
              type="primary"
              icon={<SendOutlined />}
              loading={sending}
              disabled={selected.size === 0}
              onClick={handleSend}
            >
              Send Notification ({selected.size})
            </Button>
          </Space>
        }
      >
        {candidates.length === 0 ? (
          <Empty description="No matching candidates found" />
        ) : (
          <div>
            {candidates.map((c) => {
              const isChecked = selected.has(c.userId);
              const color = matchColor(c.matchScore);
              return (
                <div
                  key={c.userId}
                  onClick={() => toggle(c.userId)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "12px 16px",
                    marginBottom: 8,
                    borderRadius: 8,
                    border: `1px solid ${isChecked ? "#1677FF" : "#E8E8E8"}`,
                    background: isChecked ? "#F0F5FF" : "#FAFAFA",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <Checkbox checked={isChecked} onChange={() => toggle(c.userId)} onClick={(e) => e.stopPropagation()} />

                  <Avatar
                    size={44}
                    src={c.profilePicture || c.user?.profileUrl}
                    style={{ background: "#1677FF", flexShrink: 0 }}
                  >
                    {(c.name || c.user?.name || "?")[0]}
                  </Avatar>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Space style={{ flexWrap: "wrap" }}>
                      <Text strong>{c.name || c.user?.name || "—"}</Text>
                      {c.title && <Tag style={{ margin: 0 }}>{c.title}</Tag>}
                    </Space>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {c.user?.email || c.email || "—"}
                    </Text>
                    {c.currentLocation && (
                      <Text type="secondary" style={{ fontSize: 12, marginLeft: 12 }}>
                        📍 {c.currentLocation}
                      </Text>
                    )}
                    {c.totalExperience && (
                      <Text type="secondary" style={{ fontSize: 12, marginLeft: 12 }}>
                        🕐 {c.totalExperience}
                      </Text>
                    )}
                    {c.matchReasons?.length > 0 && (
                      <div style={{ marginTop: 4 }}>
                        {c.matchReasons.slice(0, 5).map((r) => (
                          <Tag key={r} color="green" style={{ fontSize: 11 }}>{r}</Tag>
                        ))}
                        {c.matchReasons.length > 5 && (
                          <Tag style={{ fontSize: 11 }}>+{c.matchReasons.length - 5} more</Tag>
                        )}
                      </div>
                    )}
                  </div>

                  <Tooltip title={`Match score: ${c.matchScore}/100`}>
                    <div style={{ textAlign: "center", flexShrink: 0, width: 64 }}>
                      <Progress
                        type="circle"
                        percent={c.matchScore}
                        size={52}
                        strokeColor={color}
                        format={(p) => (
                          <span style={{ fontSize: 12, fontWeight: 700, color }}>{p}</span>
                        )}
                      />
                    </div>
                  </Tooltip>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 4 — Done
// ─────────────────────────────────────────────────────────────────────────────
function DoneStep({ result, onReset }) {
  return (
    <Card bordered={false} style={{ borderRadius: 8, textAlign: "center", padding: 40 }}>
      <CheckCircleOutlined style={{ fontSize: 64, color: "#52C41A", marginBottom: 16 }} />
      <Title level={3}>Notifications Sent!</Title>

      <Row gutter={32} justify="center" style={{ margin: "24px 0" }}>
        <Col>
          <Statistic
            title="Sent"
            value={result?.sent?.length || 0}
            valueStyle={{ color: "#52C41A" }}
          />
        </Col>
        <Col>
          <Statistic
            title="Failed"
            value={result?.failed?.length || 0}
            valueStyle={{ color: result?.failed?.length ? "#FF4D4F" : "#8C8C8C" }}
          />
        </Col>
      </Row>

      {result?.sent?.length > 0 && (
        <div style={{ textAlign: "left", maxWidth: 400, margin: "0 auto 16px" }}>
          <Text type="secondary" style={{ fontSize: 12 }}>Emails sent to:</Text>
          <br />
          {result.sent.map((email) => (
            <Tag key={email} color="green" style={{ margin: "2px 4px 2px 0" }}>{email}</Tag>
          ))}
        </div>
      )}

      {result?.failed?.length > 0 && (
        <div style={{ textAlign: "left", maxWidth: 400, margin: "0 auto 16px" }}>
          <Text type="danger" style={{ fontSize: 12 }}>Failed:</Text>
          <br />
          {result.failed.map(({ email, reason }) => (
            <Tooltip key={email} title={reason}>
              <Tag color="red" style={{ margin: "2px 4px 2px 0" }}>{email}</Tag>
            </Tooltip>
          ))}
        </div>
      )}

      <Button type="primary" size="large" onClick={onReset} style={{ marginTop: 16 }}>
        Start Over
      </Button>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────────────────────────────────────────
export default function NetworkingRecommend() {
  const [step, setStep]               = useState(0); // 0-3
  const [selectedPost, setSelectedPost] = useState(null);
  const [postDetail, setPostDetail]     = useState(null);
  const [recommend, setRecommend]       = useState(null);
  const [notifyResult, setNotifyResult] = useState(null);

  const reset = () => {
    setStep(0);
    setSelectedPost(null);
    setPostDetail(null);
    setRecommend(null);
    setNotifyResult(null);
  };

  const handleSelectPost = (post) => {
    setSelectedPost(post);
    setStep(1);
  };

  const handleRecommend = (data, post) => {
    setRecommend(data);
    setPostDetail(post);
    setStep(2);
  };

  const handleDone = (result) => {
    setNotifyResult(result);
    setStep(3);
  };

  return (
    <>
      <Title level={4} style={{ marginBottom: 20 }}>
        🎯 Networking Post → Candidate Recommendations
      </Title>

      <Steps
        current={step}
        items={STEPS}
        style={{ marginBottom: 28 }}
        size="small"
      />

      {step === 0 && (
        <PostListStep onSelect={handleSelectPost} />
      )}

      {step === 1 && selectedPost && (
        <PostDetailStep
          selectedPost={selectedPost}
          onBack={() => setStep(0)}
          onRecommend={handleRecommend}
        />
      )}

      {step === 2 && recommend && (
        <CandidatePickStep
          postId={selectedPost.id}
          post={postDetail}
          result={recommend}
          onBack={() => setStep(1)}
          onDone={handleDone}
        />
      )}

      {step === 3 && (
        <DoneStep result={notifyResult} onReset={reset} />
      )}
    </>
  );
}
