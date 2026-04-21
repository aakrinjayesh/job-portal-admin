// src/pages/admin/UserLookup.jsx
import { useState } from "react";
import { lookupUserApi, deleteUserApi } from "../api/api";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function initials(name = "") {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  .ul-root {
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    background: #F5F4F1;
    padding: 2.5rem 1rem 4rem;
  }

  .ul-wrap {
    max-width: 640px;
    margin: 0 auto;
  }

  /* Header */
  .ul-header {
    margin-bottom: 2.5rem;
  }
  .ul-header-eyebrow {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #9B8E7E;
    margin-bottom: 6px;
  }
  .ul-header h1 {
    font-size: 26px;
    font-weight: 600;
    color: #1A1714;
    margin: 0 0 6px;
    letter-spacing: -0.5px;
  }
  .ul-header p {
    font-size: 13.5px;
    color: #7A6F64;
    margin: 0;
    line-height: 1.5;
  }

  /* Search Card */
  .ul-search-card {
    background: #FFFFFF;
    border: 1px solid #E5E0D8;
    border-radius: 14px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 1px 3px rgba(26,23,20,0.04);
  }
  .ul-search-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #9B8E7E;
    margin-bottom: 10px;
    display: block;
  }
  .ul-search-row {
    display: flex;
    gap: 8px;
  }
  .ul-input {
    flex: 1;
    height: 42px;
    border: 1px solid #DDD8D1;
    border-radius: 9px;
    padding: 0 14px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: #1A1714;
    background: #FAFAF8;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .ul-input::placeholder { color: #B8B0A6; }
  .ul-input:focus {
    border-color: #C4A882;
    box-shadow: 0 0 0 3px rgba(196,168,130,0.15);
    background: #fff;
  }
  .ul-search-btn {
    height: 42px;
    padding: 0 20px;
    background: #1A1714;
    color: #F5F4F1;
    border: none;
    border-radius: 9px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s, transform 0.1s;
    white-space: nowrap;
    letter-spacing: 0.01em;
  }
  .ul-search-btn:hover:not(:disabled) { background: #2E2924; }
  .ul-search-btn:active:not(:disabled) { transform: scale(0.98); }
  .ul-search-btn:disabled { opacity: 0.45; cursor: not-allowed; }

  /* Alerts */
  .ul-alert {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    border-radius: 10px;
    padding: 13px 16px;
    font-size: 13.5px;
    margin-bottom: 16px;
    line-height: 1.5;
  }
  .ul-alert-icon {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 700;
    flex-shrink: 0;
    margin-top: 1px;
  }
  .ul-alert-error {
    background: #FEF2F2;
    border: 1px solid #FECACA;
    color: #991B1B;
  }
  .ul-alert-error .ul-alert-icon { background: #FCA5A5; color: #7F1D1D; }
  .ul-alert-success {
    background: #F0FDF4;
    border: 1px solid #BBF7D0;
    color: #14532D;
  }
  .ul-alert-success .ul-alert-icon { background: #86EFAC; color: #14532D; }

  /* Card */
  .ul-card {
    background: #FFFFFF;
    border: 1px solid #E5E0D8;
    border-radius: 14px;
    margin-bottom: 10px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(26,23,20,0.04);
  }

  /* Identity header */
  .ul-identity {
    padding: 20px;
  }
  .ul-identity-top {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    margin-bottom: 20px;
  }
  .ul-avatar {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: #EDE9E0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 15px;
    color: #6B5E4E;
    flex-shrink: 0;
    overflow: hidden;
    border: 1px solid #DDD8D1;
  }
  .ul-avatar img { width: 100%; height: 100%; object-fit: cover; }
  .ul-identity-meta { flex: 1; min-width: 0; }
  .ul-identity-name {
    font-size: 16px;
    font-weight: 600;
    color: #1A1714;
    margin: 0 0 5px;
    letter-spacing: -0.2px;
  }
  .ul-identity-email {
    font-size: 13px;
    color: #7A6F64;
    margin: 0 0 8px;
  }
  .ul-badge-row {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }

  /* Delete btn */
  .ul-delete-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 13px;
    border: 1px solid #FECACA;
    border-radius: 8px;
    background: transparent;
    color: #DC2626;
    font-family: 'DM Sans', sans-serif;
    font-size: 12.5px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s;
    flex-shrink: 0;
  }
  .ul-delete-btn:hover { background: #FEF2F2; }

  /* Section label */
  .ul-section-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #9B8E7E;
    padding: 14px 20px 10px;
    border-top: 1px solid #F0EDE8;
    display: block;
  }

  /* Rows */
  .ul-rows { padding: 0 20px 8px; }
  .ul-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    padding: 9px 0;
    border-bottom: 1px solid #F5F4F1;
    font-size: 13.5px;
  }
  .ul-row:last-child { border-bottom: none; }
  .ul-row-label { color: #7A6F64; flex-shrink: 0; min-width: 130px; }
  .ul-row-value {
    color: #1A1714;
    text-align: right;
    word-break: break-all;
  }

  /* Stats grid */
  .ul-stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
    margin-bottom: 10px;
  }
  .ul-stat {
    background: #FFFFFF;
    border: 1px solid #E5E0D8;
    border-radius: 12px;
    padding: 14px 10px;
    text-align: center;
    box-shadow: 0 1px 3px rgba(26,23,20,0.04);
  }
  .ul-stat-label {
    font-size: 11px;
    color: #9B8E7E;
    margin-bottom: 4px;
    line-height: 1.3;
  }
  .ul-stat-value {
    font-size: 20px;
    font-weight: 600;
    color: #1A1714;
    letter-spacing: -0.5px;
  }

  /* Badges */
  .ul-badge {
    display: inline-flex;
    align-items: center;
    border-radius: 6px;
    padding: 3px 8px;
    font-size: 11.5px;
    font-weight: 500;
    line-height: 1;
  }
  .ul-badge-admin { background: #FEF3C7; color: #92400E; }
  .ul-badge-company { background: #DBEAFE; color: #1E40AF; }
  .ul-badge-candidate { background: #D1FAE5; color: #065F46; }
  .ul-badge-active { background: #D1FAE5; color: #065F46; }
  .ul-badge-inactive { background: #FEE2E2; color: #991B1B; }
  .ul-badge-verified { background: #D1FAE5; color: #065F46; }
  .ul-badge-unverified { background: #F3F4F6; color: #6B7280; }
  .ul-badge-neutral { background: #F3F4F6; color: #374151; }
  .ul-badge-amber { background: #FEF3C7; color: #92400E; }
  .ul-badge-sub-active { background: #D1FAE5; color: #065F46; }
  .ul-badge-sub-pastdue { background: #FEF3C7; color: #92400E; }
  .ul-badge-sub-cancelled { background: #FEE2E2; color: #991B1B; }
  .ul-badge-tier-basic { background: #F3F4F6; color: #374151; }
  .ul-badge-tier-pro { background: #DBEAFE; color: #1E40AF; }
  .ul-badge-tier-org { background: #FEF3C7; color: #92400E; }
  .ul-badge-tier-ent { background: #D1FAE5; color: #065F46; }

  /* Code */
  .ul-code {
    font-family: 'DM Mono', monospace;
    font-size: 11.5px;
    background: #F5F4F1;
    color: #4B3F2F;
    padding: 2px 7px;
    border-radius: 5px;
    border: 1px solid #E5E0D8;
  }

  /* Links */
  .ul-link {
    color: #B07D4A;
    text-decoration: none;
    font-size: 12.5px;
  }
  .ul-link:hover { text-decoration: underline; }

  /* Session items */
  .ul-session {
    padding: 10px 20px;
    border-top: 1px solid #F5F4F1;
  }
  .ul-session:first-child { border-top: none; }
  .ul-session-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
    margin-bottom: 3px;
  }
  .ul-session-ip { font-weight: 500; color: #1A1714; }
  .ul-session-date { color: #9B8E7E; font-size: 12px; }
  .ul-session-agent { font-size: 12px; color: #9B8E7E; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  /* License items */
  .ul-license {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #FAFAF8;
    border: 1px solid #EDE9E3;
    border-radius: 9px;
    padding: 10px 14px;
    margin-bottom: 7px;
    font-size: 13px;
  }
  .ul-license:last-child { margin-bottom: 0; }
  .ul-license-name { font-weight: 500; color: #1A1714; }
  .ul-license-meta { display: flex; align-items: center; gap: 8px; }
  .ul-license-until { font-size: 12px; color: #9B8E7E; }
  .ul-licenses-wrap { padding: 0 20px 16px; }
  .ul-licenses-label { font-size: 11px; color: #9B8E7E; margin-bottom: 8px; display: block; }

  /* Warning box */
  .ul-warning {
    display: flex;
    gap: 8px;
    padding: 11px 14px;
    background: #FFFBEB;
    border: 1px solid #FDE68A;
    border-radius: 9px;
    font-size: 12.5px;
    color: #92400E;
    margin-bottom: 16px;
    line-height: 1.5;
  }

  /* Empty state */
  .ul-empty {
    text-align: center;
    font-size: 13.5px;
    color: #9B8E7E;
    padding: 24px 0 8px;
  }

  /* Delete Modal */
  .ul-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(26,23,20,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    z-index: 50;
  }
  .ul-modal {
    background: #FFFFFF;
    border-radius: 16px;
    border: 1px solid #E5E0D8;
    padding: 24px;
    width: 100%;
    max-width: 420px;
    box-shadow: 0 8px 32px rgba(26,23,20,0.16);
  }
  .ul-modal-header {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    margin-bottom: 16px;
  }
  .ul-modal-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: #FEE2E2;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
  }
  .ul-modal-title {
    font-size: 15.5px;
    font-weight: 600;
    color: #1A1714;
    margin: 0 0 3px;
  }
  .ul-modal-subtitle {
    font-size: 12.5px;
    color: #9B8E7E;
    margin: 0;
  }
  .ul-modal-body {
    font-size: 13.5px;
    color: #4B3F2F;
    line-height: 1.6;
    margin-bottom: 16px;
  }
  .ul-modal-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }
  .ul-btn-cancel {
    height: 38px;
    padding: 0 18px;
    border: 1px solid #DDD8D1;
    border-radius: 8px;
    background: transparent;
    color: #4B3F2F;
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s;
  }
  .ul-btn-cancel:hover:not(:disabled) { background: #F5F4F1; }
  .ul-btn-cancel:disabled { opacity: 0.5; }
  .ul-btn-danger {
    height: 38px;
    padding: 0 18px;
    border: none;
    border-radius: 8px;
    background: #DC2626;
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s;
  }
  .ul-btn-danger:hover:not(:disabled) { background: #B91C1C; }
  .ul-btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Divider */
  .ul-divider { height: 1px; background: #F0EDE8; margin: 0; }

  @media (max-width: 480px) {
    .ul-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .ul-identity-top { flex-wrap: wrap; }
    .ul-delete-btn { width: 100%; justify-content: center; }
  }
`;

// ─── Sub-components ───────────────────────────────────────────────────────────
function Badge({ label, className }) {
  return <span className={`ul-badge ${className}`}>{label}</span>;
}

function Row({ label, children }) {
  return (
    <div className="ul-row">
      <span className="ul-row-label">{label}</span>
      <span className="ul-row-value">{children || "—"}</span>
    </div>
  );
}

function SectionLabel({ title }) {
  return <span className="ul-section-label">{title}</span>;
}

function Stat({ label, value }) {
  return (
    <div className="ul-stat">
      <div className="ul-stat-label">{label}</div>
      <div className="ul-stat-value">{value}</div>
    </div>
  );
}

function DeleteModal({ user, onCancel, onConfirm, loading }) {
  const isSoleAdmin =
    user.organizationMember?.role === "COMPANY_ADMIN" &&
    user.organizationMember?.organization;

  return (
    <div className="ul-modal-overlay">
      <div className="ul-modal">
        <div className="ul-modal-header">
          <div className="ul-modal-icon">⚠</div>
          <div>
            <p className="ul-modal-title">Delete user account?</p>
            <p className="ul-modal-subtitle">This action cannot be undone</p>
          </div>
        </div>

        <p className="ul-modal-body">
          You are about to permanently delete{" "}
          <strong style={{ color: "#1A1714" }}>{user.name}</strong>{" "}
          <span style={{ color: "#9B8E7E" }}>({user.email})</span>. This will
          remove their profile, job applications, sessions, and organization
          membership from the system.
        </p>

        {isSoleAdmin && (
          <div className="ul-warning">
            <span style={{ flexShrink: 0 }}>⚠️</span>
            <span>
              This user is a <strong>Company Admin</strong> of{" "}
              <strong>{user.organizationMember.organization.name}</strong>.
              The organization will be left without an admin.
            </span>
          </div>
        )}

        <div className="ul-modal-actions">
          <button className="ul-btn-cancel" onClick={onCancel} disabled={loading}>Cancel</button>
          <button className="ul-btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? "Deleting…" : "Yes, delete user"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Role / status badge helpers ─────────────────────────────────────────────
function roleBadge(role) {
  const map = { admin: "ul-badge-admin", company: "ul-badge-company", candidate: "ul-badge-candidate" };
  return <Badge label={role} className={map[role] ?? "ul-badge-neutral"} />;
}

function subBadge(status) {
  const map = { ACTIVE: "ul-badge-sub-active", PAST_DUE: "ul-badge-sub-pastdue", CANCELLED: "ul-badge-sub-cancelled" };
  return <Badge label={status} className={map[status] ?? "ul-badge-neutral"} />;
}

function tierBadge(tier) {
  const map = { BASIC: "ul-badge-tier-basic", PROFESSIONAL: "ul-badge-tier-pro", ORGANIZATION: "ul-badge-tier-org", ENTERPRISE: "ul-badge-tier-ent" };
  return <Badge label={tier} className={map[tier] ?? "ul-badge-neutral"} />;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function UserLookup() {
  const [email, setEmail]         = useState("");
  const [user, setUser]           = useState(null);
  const [error, setError]         = useState(null);
  const [searching, setSearching] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting]   = useState(false);
  const [deleted, setDeleted]     = useState(null);

  const handleSearch = async () => {
    const q = email.trim().toLowerCase();
    if (!q) return;
    setUser(null); setError(null); setDeleted(null); setSearching(true);
    try {
      const data = await lookupUserApi(q);
      setUser(data.user);
    } catch (err) {
      setError(err.response?.data?.message ?? "Something went wrong");
    } finally {
      setSearching(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      await deleteUserApi(user.id);
      setDeleted(user.email);
      setUser(null);
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message ?? "Delete failed. Please try again.");
      setShowModal(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="ul-root">
        <div className="ul-wrap">

          {/* Header */}
          <div className="ul-header">
            <p className="ul-header-eyebrow">Admin Panel</p>
            <h1>User Lookup</h1>
            <p>Search any registered user by email to view their account details or remove their account.</p>
          </div>

          {/* Search */}
          <div className="ul-search-card">
            <label className="ul-search-label">Email address</label>
            <div className="ul-search-row">
           <input
  type="email"
  className="ul-input"
  value={email}
  onChange={(e) => {
    setEmail(e.target.value);
    if (!e.target.value.trim()) {
      setError(null);      // ← clear error when input is empty
      setDeleted(null);    // ← clear success too
    }
  }}
  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
  placeholder="user@example.com"
/>
              <button
                className="ul-search-btn"
                onClick={handleSearch}
                disabled={searching || !email.trim()}
              >
                {searching ? "Searching…" : "Search"}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="ul-alert ul-alert-error">
              <div className="ul-alert-icon">✕</div>
              <span>{error}</span>
            </div>
          )}

          {/* Success */}
          {deleted && (
            <div className="ul-alert ul-alert-success">
              <div className="ul-alert-icon">✓</div>
              <span>User <strong>{deleted}</strong> was deleted successfully.</span>
            </div>
          )}

          {/* ── User Result ─────────────────────────────────────────────── */}
          {user && (
            <>
              {/* Identity Card */}
              <div className="ul-card">
                <div className="ul-identity">
                  <div className="ul-identity-top">
                    {/* Avatar */}
                    <div className="ul-avatar">
                      {user.profileUrl
                        ? <img src={user.profileUrl} alt={user.name} />
                        : initials(user.name)
                      }
                    </div>
                    {/* Name / Email / Badges */}
                    <div className="ul-identity-meta">
                      <p className="ul-identity-name">{user.name}</p>
                      <p className="ul-identity-email">{user.email}</p>
                      <div className="ul-badge-row">
                        {roleBadge(user.role)}
                        <Badge
                          label={user.isactive ? "Active" : "Inactive"}
                          className={user.isactive ? "ul-badge-active" : "ul-badge-inactive"}
                        />
                        <Badge
                          label={user.emailverified ? "Email verified" : "Not verified"}
                          className={user.emailverified ? "ul-badge-verified" : "ul-badge-unverified"}
                        />
                      </div>
                    </div>
                    {/* Delete */}
                    <button className="ul-delete-btn" onClick={() => setShowModal(true)}>
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                        <path d="M2 4h12M5.333 4V2.667A1.333 1.333 0 016.667 1.333h2.666A1.333 1.333 0 0110.667 2.667V4m2 0v9.333A1.333 1.333 0 0111.333 14.667H4.667A1.333 1.333 0 013.333 13.333V4h9.334z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Delete
                    </button>
                  </div>

                  {/* Account rows */}
                  <SectionLabel title="Account details" />
                  <div className="ul-rows">
                    <Row label="User ID">
                      <code className="ul-code">{user.id}</code>
                    </Row>
                    <Row label="Phone">{user.phoneNumber}</Row>
                    <Row label="Company">{user.companyName}</Row>
                    <Row label="Notifications">
                      <Badge label={user.notificationType} className="ul-badge-neutral" />
                    </Row>
                    <Row label="Member since">{fmtDate(user.createdAt)}</Row>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="ul-stats">
                <Stat label="Jobs posted"      value={user.stats.jobsPosted} />
                <Stat label="Applications"     value={user.stats.jobApplications} />
                <Stat label="Saved candidates" value={user.stats.savedCandidates} />
                <Stat label="AI tokens used"   value={user.stats.totalAiTokensUsed.toLocaleString("en-IN")} />
              </div>

              {/* Candidate Profile */}
              {user.candidateProfile && (
                <div className="ul-card">
                  <SectionLabel title="Candidate profile" />
                  <div className="ul-rows">
                    <Row label="Title">{user.candidateProfile.title}</Row>
                    <Row label="Experience">{user.candidateProfile.totalExperience}</Row>
                    <Row label="Location">{user.candidateProfile.currentLocation}</Row>
                    <Row label="Current CTC">{user.candidateProfile.currentCTC}</Row>
                    <Row label="Expected CTC">{user.candidateProfile.expectedCTC}</Row>
                    <Row label="Preferred job types">{user.candidateProfile.preferredJobType?.join(", ")}</Row>
                    <Row label="Certifications">{user.candidateProfile.certifications?.join(", ")}</Row>
                    <Row label="Status">{user.candidateProfile.status}</Row>
                    <Row label="Profile verified">
                      <Badge
                        label={user.candidateProfile.isVerified ? "Verified" : "Not verified"}
                        className={user.candidateProfile.isVerified ? "ul-badge-verified" : "ul-badge-unverified"}
                      />
                    </Row>
                    {user.candidateProfile.linkedInUrl && (
                      <Row label="LinkedIn">
                        <a className="ul-link" href={user.candidateProfile.linkedInUrl} target="_blank" rel="noreferrer">
                          {user.candidateProfile.linkedInUrl}
                        </a>
                      </Row>
                    )}
                  </div>
                </div>
              )}

              {/* Organization */}
              {user.organizationMember && (
                <div className="ul-card">
                  <SectionLabel title="Organization" />
                  <div className="ul-rows">
                    <Row label="Org name">{user.organizationMember.organization?.name}</Row>
                    <Row label="Org ID">
                      <code className="ul-code">{user.organizationMember.organization?.id}</code>
                    </Row>
                    <Row label="Member role">
                      <Badge
                        label={user.organizationMember.role}
                        className={user.organizationMember.role === "COMPANY_ADMIN" ? "ul-badge-amber" : "ul-badge-company"}
                      />
                    </Row>
                    <Row label="Permissions">
                      <Badge label={user.organizationMember.permissions} className="ul-badge-neutral" />
                    </Row>
                    {user.organizationMember.organization?.companyProfile && (
                      <>
                        <Row label="Industry">{user.organizationMember.organization.companyProfile.industry}</Row>
                        <Row label="Company size">{user.organizationMember.organization.companyProfile.companySize}</Row>
                        <Row label="Headquarters">{user.organizationMember.organization.companyProfile.headquarters}</Row>
                        <Row label="Website">
                          <a className="ul-link" href={user.organizationMember.organization.companyProfile.website} target="_blank" rel="noreferrer">
                            {user.organizationMember.organization.companyProfile.website}
                          </a>
                        </Row>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Subscription */}
              {user.organizationMember?.organization?.subscription && (() => {
                const sub = user.organizationMember.organization.subscription;
                return (
                  <div className="ul-card">
                    <SectionLabel title="Subscription" />
                    <div className="ul-rows">
                      <Row label="Status">{subBadge(sub.status)}</Row>
                      <Row label="Billing cycle">
                        <Badge label={sub.billingCycle} className="ul-badge-neutral" />
                      </Row>
                      <Row label="Auto-renew">
                        <Badge
                          label={sub.autoRenew ? "Enabled" : "Disabled"}
                          className={sub.autoRenew ? "ul-badge-active" : "ul-badge-unverified"}
                        />
                      </Row>
                      <Row label="Period start">{fmtDate(sub.currentPeriodStart)}</Row>
                      <Row label="Period end">{fmtDate(sub.currentPeriodEnd)}</Row>
                      <Row label="Next billing">{fmtDate(sub.nextBillingDate)}</Row>
                    </div>
                    {sub.licenses?.length > 0 && (
                      <div className="ul-licenses-wrap">
                        <div className="ul-divider" style={{ marginBottom: 14 }} />
                        <span className="ul-licenses-label">Active licenses</span>
                        {sub.licenses.map((lic) => (
                          <div key={lic.id} className="ul-license">
                            <span className="ul-license-name">{lic.plan.name}</span>
                            <div className="ul-license-meta">
                              {tierBadge(lic.plan.tier)}
                              <span className="ul-license-until">until {fmtDate(lic.validUntil)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Sessions */}
              {user.activeSessions?.length > 0 && (
                <div className="ul-card">
                  <SectionLabel title={`Active sessions (${user.activeSessions.length})`} />
                  {user.activeSessions.map((s) => (
                    <div key={s.id} className="ul-session">
                      <div className="ul-session-top">
                        <span className="ul-session-ip">{s.ipAddress ?? "Unknown IP"}</span>
                        <span className="ul-session-date">{fmtDate(s.createdAt)}</span>
                      </div>
                      <p className="ul-session-agent">{s.userAgent ?? "Unknown agent"}</p>
                    </div>
                  ))}
                </div>
              )}

              {!user.organizationMember && !user.candidateProfile && (
                <p className="ul-empty">No organization or candidate profile linked to this account.</p>
              )}
            </>
          )}
        </div>
      </div>

      {showModal && user && (
        <DeleteModal
          user={user}
          onCancel={() => setShowModal(false)}
          onConfirm={handleDelete}
          loading={deleting}
        />
      )}
    </>
  );
}