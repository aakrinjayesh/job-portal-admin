import { useState, useEffect, useCallback, useRef } from "react";
import {
  getPlanLimitsApi,
  bulkUpsertPlanLimitsApi,
  updatePlanPricingApi,   // ← add this to your api.js
} from "../api/api";

// Enterprise removed
const PLANS = [
  { key: "BASIC",        label: "Basic",        color: "#6B7280", bg: "#F3F4F6", text: "#1F2937",  editable: false },
  { key: "PROFESSIONAL", label: "Professional", color: "#2563EB", bg: "#EFF6FF", text: "#1E3A8A",  editable: true  },
  { key: "ORGANIZATION", label: "Organization", color: "#059669", bg: "#ECFDF5", text: "#064E3B",  editable: true  },
];

const PERIODS = ["DAILY", "MONTHLY", "YEARLY"];

const FEATURE_GROUPS = [
  {
    group: "Jobs & Hiring",
    icon: "💼",
    features: [
      { key: "JOB_POST_CREATION",        label: "Job post creation" },
      { key: "FIND_CANDIDATE_SEARCH",    label: "Find candidate search" },
      { key: "CANDIDATE_PROFILE_VIEWS",  label: "Candidate profile views" },
      { key: "APPLY_BENCH_TO_JOB",       label: "Apply bench to job" },
      { key: "FIND_JOB_SEARCH",          label: "Find job search" },
    ],
  },
  {
    group: "AI Features",
    icon: "✦",
    features: [
      { key: "AI_FIT_SCORE",      label: "AI fit score" },
      { key: "AI_TOKENS_TOTAL",   label: "AI tokens total" },
      { key: "RESUME_EXTRACTION", label: "Resume extraction" },
      { key: "JD_EXTRACTION",     label: "JD extraction" },
    ],
  },
];

function formatVal(v) {
  if (v === -1 || v === null || v === undefined) return "";
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (v >= 1_000)     return (v / 1_000).toFixed(0) + "K";
  return String(v);
}

function buildStateFromApi(plans) {
  const state = {};
  const ids   = {};
  plans.forEach(plan => {
    (plan.limits || []).forEach(limit => {
      const key = `${limit.feature}__${plan.tier}__${limit.period}`;
      state[key] = limit.maxAllowed;
      ids[key]   = limit.id;
    });
  });
  return { state, ids };
}

function Toast({ message, type, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);

  const colors = {
    success: { bg: "#ECFDF5", border: "#6EE7B7", color: "#065F46" },
    error:   { bg: "#FEF2F2", border: "#FCA5A5", color: "#991B1B" },
    info:    { bg: "#F0F9FF", border: "#BAE6FD", color: "#0C4A6E" },
  }[type] || {};

  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 1000,
      display: "flex", alignItems: "center", gap: 10,
      background: colors.bg, border: `1px solid ${colors.border}`, color: colors.color,
      borderRadius: 10, padding: "12px 18px", fontSize: 13, fontWeight: 500,
      boxShadow: "0 4px 20px rgba(0,0,0,0.10)", animation: "slideUp 0.2s ease",
    }}>
      <span>{type === "success" ? "✓" : type === "error" ? "✕" : "ℹ"}</span>
      {message}
    </div>
  );
}

// ── Inline price editor shown inside the plan header card ──
function PriceEditor({ plan, planData, onSaved, onToast }) {
  const [editing, setEditing]   = useState(false);
  const [monthly, setMonthly]   = useState("");
  const [yearly, setYearly]     = useState("");
  const [saving, setSaving]     = useState(false);

  const open = () => {
    setMonthly(String(planData?.monthlyPrice ?? ""));
    setYearly(String(planData?.yearlyPrice ?? ""));
    setEditing(true);
  };

  const cancel = () => setEditing(false);

  const save = async () => {
  const mo = parseInt(monthly);
  const yr = parseInt(yearly);

  if (isNaN(mo) || mo < 0 || mo > 100000) {
    onToast({ message: "Monthly price must be between ₹0 and ₹1,00,000", type: "error" });
    return;
  }

  if (isNaN(yr) || yr < 0 || yr > 1000000) {
    onToast({ message: "Yearly price must be between ₹0 and ₹10,00,000", type: "error" });
    return;
  }

  setSaving(true);
  try {
    await updatePlanPricingApi(planData.id, {
      monthlyPrice: mo,
      yearlyPrice: yr
    });
    onSaved(planData.id, mo, yr);
    onToast({ message: `${plan.label} pricing updated`, type: "success" });
    setEditing(false);
  } catch (e) {
    onToast({ message: e?.response?.data?.message || "Failed to update pricing", type: "error" });
  } finally {
    setSaving(false);
  }
};

  if (!editing) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 4 }}>
        <span style={{ fontSize: 11, color: plan.color, fontFamily: "'DM Mono', monospace" }}>
          ₹{planData?.monthlyPrice?.toLocaleString()}/mo
        </span>
        <button
          onClick={open}
          title="Edit pricing"
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: plan.color, padding: "0 2px", lineHeight: 1,
            opacity: 0.7, fontSize: 11,
          }}
        >✎</button>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, color: plan.color, fontWeight: 600, marginBottom: 2, textAlign: "left" }}>MONTHLY ₹</div>
          <input
            type="number" value={monthly} onChange={e => setMonthly(e.target.value)}
            style={{
              width: "100%", padding: "4px 6px", fontSize: 12, fontWeight: 500,
              border: `1.5px solid ${plan.color}`, borderRadius: 5,
              background: "#fff", color: "#111", outline: "none", textAlign: "center",
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, color: plan.color, fontWeight: 600, marginBottom: 2, textAlign: "left" }}>YEARLY ₹</div>
          <input
            type="number" value={yearly} onChange={e => setYearly(e.target.value)}
            style={{
              width: "100%", padding: "4px 6px", fontSize: 12, fontWeight: 500,
              border: `1.5px solid ${plan.color}`, borderRadius: 5,
              background: "#fff", color: "#111", outline: "none", textAlign: "center",
            }}
          />
        </div>
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        <button
          onClick={cancel}
          style={{
            flex: 1, fontSize: 11, fontWeight: 500, padding: "4px 0",
            border: "1px solid #E5E7EB", borderRadius: 5,
            background: "#fff", color: "#6B7280", cursor: "pointer",
          }}
        >Cancel</button>
        <button
          onClick={save} disabled={saving}
          style={{
            flex: 1, fontSize: 11, fontWeight: 600, padding: "4px 0",
            border: "none", borderRadius: 5,
            background: saving ? "#9CA3AF" : plan.color,
            color: "#fff", cursor: saving ? "not-allowed" : "pointer",
          }}
        >{saving ? "…" : "Save"}</button>
      </div>
    </div>
  );
}

function LimitCell({ value, original, onChange, planColor }) {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const changed = value !== original;
  const isUnlimited = value === -1 || value === null || value === undefined;

  const startEdit = () => {
    setEditing(true);
    setInputVal(isUnlimited ? "" : String(value));
  };

  const commit = () => {
    setEditing(false);
    const raw = inputVal.trim();
    if (raw === "" || raw === "∞") { onChange(-1); return; }
    const n = parseInt(raw);
    if (!isNaN(n) && n >= 0) onChange(n);
    else onChange(value);
  };

  if (editing) {
    return (
      <input
        autoFocus type="text" value={inputVal} placeholder="∞"
        onChange={e => setInputVal(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
        style={{
          width: "100%", textAlign: "center", border: `1.5px solid ${planColor}`,
          borderRadius: 6, padding: "5px 4px", fontSize: 13, fontWeight: 500,
          background: "#fff", color: "#111", outline: "none",
        }}
      />
    );
  }

  return (
    <div
      onClick={startEdit}
      title={isUnlimited ? "Unlimited — click to set limit" : `${Number(value).toLocaleString()} — click to edit`}
      style={{
        cursor: "pointer", borderRadius: 6, padding: "5px 8px",
        textAlign: "center", fontSize: 13, fontWeight: 500,
        userSelect: "none", transition: "all 0.12s",
        border:     changed ? `1.5px solid ${planColor}` : "1.5px solid transparent",
        background: changed ? `${planColor}15` : "transparent",
        color:      isUnlimited ? "#9CA3AF" : changed ? planColor : "#374151",
        minWidth: 60,
      }}
      onMouseEnter={e => { if (!changed) { e.currentTarget.style.background = "#F9FAFB"; e.currentTarget.style.borderColor = "#E5E7EB"; }}}
      onMouseLeave={e => { if (!changed) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; }}}
    >
      {isUnlimited ? "∞" : formatVal(value)}
      {changed && <span style={{ fontSize: 9, marginLeft: 4, opacity: 0.7 }}>●</span>}
    </div>
  );
}

export default function PlanlimitsAdmin() {
  const [loading, setLoading]   = useState(true);
  const [plans, setPlans]       = useState([]);
  const [state, setState]       = useState({});
  const originalState           = useRef({});
  const limitIds                = useRef({});

  const [periodFilter, setPeriodFilter] = useState("MONTHLY");
  const [search, setSearch]             = useState("");
  const [toast, setToast]               = useState(null);
  const [saving, setSaving]             = useState(false);

  useEffect(() => {
    setLoading(true);
    getPlanLimitsApi()
      .then(res => {
        const apiPlans = res.data?.plans || [];
        setPlans(apiPlans);
        const { state: s, ids } = buildStateFromApi(apiPlans);
        setState(s);
        originalState.current = { ...s };
        limitIds.current = ids;
      })
      .catch(() => setToast({ message: "Failed to load plan limits", type: "error" }))
      .finally(() => setLoading(false));
  }, []);

  // Update local plans state after a price save so header re-renders
  const handlePriceSaved = useCallback((planId, monthlyPrice, yearlyPrice) => {
    setPlans(prev => prev.map(p => p.id === planId ? { ...p, monthlyPrice, yearlyPrice } : p));
  }, []);

  const changedCount = Object.keys(state).filter(k => state[k] !== originalState.current[k]).length;

  const handleChange = useCallback((key, val) => {
    setState(s => ({ ...s, [key]: val }));
  }, []);

  const resetAll = () => {
    setState({ ...originalState.current });
    setToast({ message: "All changes reset", type: "info" });
  };

  const saveAll = async () => {
    if (changedCount === 0) { setToast({ message: "No changes to save", type: "info" }); return; }
    setSaving(true);
    try {
      const byPlan = {};
      Object.keys(state)
        .filter(k => state[k] !== originalState.current[k])
        .forEach(k => {
          const [feature, planTier, period] = k.split("__");
          const plan = plans.find(p => p.tier === planTier);
          if (!plan) return;
          if (!byPlan[plan.id]) byPlan[plan.id] = [];
          byPlan[plan.id].push({ feature, period, maxAllowed: state[k] });
        });

      await Promise.all(
        Object.entries(byPlan).map(([planId, limits]) =>
          bulkUpsertPlanLimitsApi(planId, limits)
        )
      );

      originalState.current = { ...state };
      setToast({ message: `Saved ${changedCount} limit${changedCount > 1 ? "s" : ""} successfully`, type: "success" });
    } catch (e) {
      setToast({ message: e?.response?.data?.message || "Failed to save. Please try again.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const activePeriods = periodFilter === "ALL" ? PERIODS : [periodFilter];

  const filteredGroups = FEATURE_GROUPS.map(g => ({
    ...g,
    features: g.features.filter(f =>
      f.label.toLowerCase().includes(search.toLowerCase()) ||
      f.key.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(g => g.features.length > 0);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", color: "#9CA3AF", fontSize: 14 }}>
        <span style={{ width: 18, height: 18, border: "2px solid #E5E7EB", borderTopColor: "#6B7280", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite", marginRight: 10 }} />
        Loading plan limits…
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", minHeight: "100vh", background: "#F8FAFC", color: "#111827" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');
        @keyframes slideUp { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 3px; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
      `}</style>

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #E5E7EB", padding: "0 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#111827", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontSize: 14 }}>⚡</span>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>Plan limits</div>
              <div style={{ fontSize: 11, color: "#9CA3AF", fontFamily: "'DM Mono', monospace" }}>Admin · Billing</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {changedCount > 0 && (
              <span style={{ fontSize: 12, background: "#FEF9C3", color: "#92400E", border: "1px solid #FDE68A", borderRadius: 20, padding: "3px 10px", fontWeight: 500 }}>
                {changedCount} unsaved change{changedCount > 1 ? "s" : ""}
              </span>
            )}
            <button onClick={resetAll} disabled={changedCount === 0} style={{ fontSize: 13, fontWeight: 500, padding: "7px 14px", border: "1px solid #E5E7EB", borderRadius: 8, background: "transparent", color: changedCount === 0 ? "#D1D5DB" : "#374151", cursor: changedCount === 0 ? "not-allowed" : "pointer" }}>Reset</button>
            <button onClick={saveAll} disabled={saving} style={{ fontSize: 13, fontWeight: 600, padding: "7px 18px", border: "none", borderRadius: 8, background: saving ? "#9CA3AF" : "#111827", color: "#fff", cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8 }}>
              {saving && <span style={{ width: 12, height: 12, border: "2px solid #ffffff60", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />}
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 32px" }}>

        {/* Filters */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", fontSize: 14, pointerEvents: "none" }}>🔍</span>
            <input type="text" placeholder="Search features…" value={search} onChange={e => setSearch(e.target.value)} style={{ width: "100%", padding: "8px 12px 8px 34px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, color: "#111827", background: "#fff", outline: "none", fontFamily: "inherit" }} />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {["ALL", "DAILY", "MONTHLY", "YEARLY"].map(p => (
              <button key={p} onClick={() => setPeriodFilter(p)} style={{ fontSize: 12, fontWeight: 500, padding: "7px 14px", borderRadius: 8, border: "1px solid", borderColor: periodFilter === p ? "#111827" : "#E5E7EB", background: periodFilter === p ? "#111827" : "#fff", color: periodFilter === p ? "#fff" : "#6B7280", cursor: "pointer" }}>
                {p === "ALL" ? "All periods" : p.charAt(0) + p.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Plan header row — 3 cols now */}
        <div style={{ display: "grid", gridTemplateColumns: "260px repeat(3, 1fr)", gap: 10, marginBottom: 12 }}>
          <div />
          {PLANS.map(plan => {
            const planData = plans.find(p => p.tier === plan.key);
            return (
              <div key={plan.key} style={{ background: plan.bg, border: `1px solid ${plan.color}30`, borderRadius: 10, padding: "12px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: plan.text }}>{plan.label}</div>
                {plan.editable ? (
                  <PriceEditor
                    plan={plan}
                    planData={planData}
                    onSaved={handlePriceSaved}
                    onToast={setToast}
                  />
                ) : (
                  <div style={{ fontSize: 11, color: plan.color, marginTop: 4, fontFamily: "'DM Mono', monospace" }}>
                    {planData ? `₹${planData.monthlyPrice.toLocaleString()}/mo` : "—"}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Feature groups */}
        {filteredGroups.map(({ group, icon, features }) => (
          <div key={group} style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", marginBottom: 2, fontSize: 12, fontWeight: 600, color: "#6B7280", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              <span style={{ fontSize: 14 }}>{icon}</span>{group}
            </div>
            <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden" }}>
              {features.map((feature, fi) => (
                <div key={feature.key}>
                  {activePeriods.map((period, pi) => (
                    <div key={period} style={{ display: "grid", gridTemplateColumns: "260px repeat(3, 1fr)", alignItems: "center", borderBottom: fi === features.length - 1 && pi === activePeriods.length - 1 ? "none" : "1px solid #F3F4F6", minHeight: 46 }}>
                      <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, borderRight: "1px solid #F3F4F6" }}>
                        {pi === 0 ? (
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 500, color: "#111827", lineHeight: 1.4 }}>{feature.label}</div>
                            <div style={{ fontSize: 11, color: "#9CA3AF", fontFamily: "'DM Mono', monospace", marginTop: 1 }}>{feature.key.toLowerCase()}</div>
                          </div>
                        ) : <div />}
                        {activePeriods.length > 1 && (
                          <div style={{ marginLeft: "auto" }}>
                            <span style={{ fontSize: 10, fontWeight: 600, color: period === "DAILY" ? "#B45309" : period === "MONTHLY" ? "#1D4ED8" : "#065F46", background: period === "DAILY" ? "#FEF3C7" : period === "MONTHLY" ? "#EFF6FF" : "#ECFDF5", padding: "2px 7px", borderRadius: 4, fontFamily: "'DM Mono', monospace", letterSpacing: "0.04em" }}>{period.slice(0, 3)}</span>
                          </div>
                        )}
                      </div>
                      {PLANS.map(plan => (
                        <div key={plan.key} style={{ padding: "6px 12px" }}>
                          <LimitCell
                            value={state[`${feature.key}__${plan.key}__${period}`]}
                            original={originalState.current[`${feature.key}__${plan.key}__${period}`]}
                            planColor={plan.color}
                            onChange={val => handleChange(`${feature.key}__${plan.key}__${period}`, val)}
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Legend */}
        <div style={{ display: "flex", gap: 20, marginTop: 8, padding: "12px 0", borderTop: "1px solid #F3F4F6", flexWrap: "wrap" }}>
          <div style={{ fontSize: 12, color: "#9CA3AF", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14 }}>∞</span>
            Empty or ∞ = unlimited (stored as -1)
          </div>
          <div style={{ fontSize: 12, color: "#9CA3AF", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#2563EB", display: "inline-block" }} />
            Highlighted cell = unsaved change
          </div>
          <div style={{ fontSize: 12, color: "#9CA3AF" }}>
            Click any value to edit · Enter to confirm · Esc to cancel
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}