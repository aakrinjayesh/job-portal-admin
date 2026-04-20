import { useState, useEffect } from "react";
import {
  getOrganizationsApi,       // GET /admin/organizations
  adminPostJobApi,           // POST /admin/jobs
} from "../api/api";

// ── Add these to your api.js ──────────────────────────────
// export const getOrganizationsApi = (params) =>
//   axios.get("/admin/organizations", { params });
// export const adminPostJobApi = (data) =>
//   axios.post("/admin/jobs", data);
// ─────────────────────────────────────────────────────────

const EMPLOYMENT_TYPES = ["FullTime", "PartTime", "Contract", "Freelancer", "Internship"];
const EXPERIENCE_LEVELS = ["Internship", "EntryLevel", "Mid", "Senior", "Lead"];
const JOB_TYPES = ["Remote", "Hybrid", "Onsite"];
const APPLICANT_SOURCES = ["Both", "Candidate", "Company"];
const QUESTION_TYPES = ["TEXT", "TEXTAREA", "NUMBER", "BOOLEAN", "SELECT"];
const TENURE_TYPES = ["month", "year"];

const NEEDS_TENURE = ["PartTime", "Contract", "Freelancer"];

function Toast({ message, type, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
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

function Label({ children, required }) {
  return (
    <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6, letterSpacing: "0.01em" }}>
      {children}{required && <span style={{ color: "#EF4444", marginLeft: 3 }}>*</span>}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text", disabled }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      style={{
        width: "100%", padding: "9px 12px",
        border: "1px solid #E5E7EB", borderRadius: 8,
        fontSize: 13, color: "#111827", background: disabled ? "#F9FAFB" : "#fff",
        outline: "none", fontFamily: "inherit",
        transition: "border-color 0.15s",
        boxSizing: "border-box",
      }}
      onFocus={e => e.target.style.borderColor = "#6B7280"}
      onBlur={e => e.target.style.borderColor = "#E5E7EB"}
    />
  );
}

function Textarea({ value, onChange, placeholder, rows = 4 }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{
        width: "100%", padding: "9px 12px",
        border: "1px solid #E5E7EB", borderRadius: 8,
        fontSize: 13, color: "#111827", background: "#fff",
        outline: "none", fontFamily: "inherit", resize: "vertical",
        lineHeight: 1.6, boxSizing: "border-box",
      }}
      onFocus={e => e.target.style.borderColor = "#6B7280"}
      onBlur={e => e.target.style.borderColor = "#E5E7EB"}
    />
  );
}

function Select({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        width: "100%", padding: "9px 12px",
        border: "1px solid #E5E7EB", borderRadius: 8,
        fontSize: 13, color: value ? "#111827" : "#9CA3AF",
        background: "#fff", outline: "none", fontFamily: "inherit",
        cursor: "pointer", boxSizing: "border-box", appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center",
      }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => (
        <option key={typeof o === "string" ? o : o.value} value={typeof o === "string" ? o : o.value}>
          {typeof o === "string" ? o : o.label}
        </option>
      ))}
    </select>
  );
}

// Tag input for skills / clouds / certifications
function TagInput({ tags, onChange, placeholder }) {
  const [input, setInput] = useState("");

  const add = () => {
    const val = input.trim();
    if (val && !tags.includes(val)) onChange([...tags, val]);
    setInput("");
  };

  const remove = (tag) => onChange(tags.filter(t => t !== tag));

  return (
    <div style={{ border: "1px solid #E5E7EB", borderRadius: 8, padding: "6px 8px", background: "#fff", minHeight: 42 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: tags.length ? 6 : 0 }}>
        {tags.map(tag => (
          <span key={tag} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#F3F4F6", border: "1px solid #E5E7EB", borderRadius: 6, padding: "2px 8px", fontSize: 12, fontWeight: 500, color: "#374151" }}>
            {tag}
            <button onClick={() => remove(tag)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", fontSize: 12, padding: 0, lineHeight: 1 }}>×</button>
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          style={{ flex: 1, border: "none", outline: "none", fontSize: 13, color: "#111827", fontFamily: "inherit", padding: "2px 4px" }}
        />
        <button onClick={add} style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", border: "1px solid #E5E7EB", borderRadius: 6, background: "#F9FAFB", color: "#374151", cursor: "pointer" }}>Add</button>
      </div>
    </div>
  );
}

// Screening question row
function QuestionRow({ q, index, onChange, onRemove }) {
  return (
    <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 10, padding: "14px 16px", marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#6B7280" }}>Question {index + 1}</span>
        <button onClick={onRemove} style={{ background: "none", border: "none", cursor: "pointer", color: "#EF4444", fontSize: 13, fontWeight: 600, padding: "2px 6px" }}>Remove</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 160px 80px", gap: 10, marginBottom: 8 }}>
        <Input value={q.question} onChange={v => onChange({ ...q, question: v })} placeholder="Question text…" />
        <Select value={q.type} onChange={v => onChange({ ...q, type: v })} options={QUESTION_TYPES} />
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <input type="checkbox" checked={q.required} onChange={e => onChange({ ...q, required: e.target.checked })} id={`req-${index}`} style={{ cursor: "pointer" }} />
          <label htmlFor={`req-${index}`} style={{ fontSize: 12, color: "#374151", cursor: "pointer" }}>Required</label>
        </div>
      </div>
      {q.type === "SELECT" && (
        <TagInput tags={q.options} onChange={opts => onChange({ ...q, options: opts })} placeholder="Add option, press Enter…" />
      )}
    </div>
  );
}

function SectionCard({ title, icon, children }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, marginBottom: 20, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 15 }}>{icon}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{title}</span>
      </div>
      <div style={{ padding: "20px" }}>
        {children}
      </div>
    </div>
  );
}

function Grid({ cols = 2, children }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16 }}>
      {children}
    </div>
  );
}

function Field({ children }) {
  return <div style={{ marginBottom: 0 }}>{children}</div>;
}

const EMPTY_FORM = {
  // Admin fields
  organizationId: "",
  postedById: "",
  // Job fields
  role: "",
  description: "",
  employmentType: "",
  experienceLevel: "",
  experience: { min: "", max: "" },
  tenure: { number: "", type: "month" },
  location: "",
  skills: [],
  clouds: [],
  salary: "",
  companyName: "",
  responsibilities: "",
  certifications: [],
  jobType: "",
  applicationDeadline: "",
  ApplicationLimit: "",
  companyLogo: "",
  applicantSource: "Both",
  questions: [],
};

export default function AdminPostjob() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [organizations, setOrganizations] = useState([]);
  const [orgMembers, setOrgMembers]       = useState([]);
  const [loadingOrgs, setLoadingOrgs]     = useState(true);
  const [saving, setSaving]               = useState(false);
  const [toast, setToast]                 = useState(null);
  const [orgDisplayName, setOrgDisplayName] = useState("");

  // Load organizations for the dropdown
 useEffect(() => {
  setLoadingOrgs(true);
  getOrganizationsApi({ limit: 100 })
    .then(res => {
      console.log("API response:", res.data); // 👈 check this first
      const orgs = res.data?.organizations || res.data?.data || res.data || [];
      console.log("Orgs extracted:", orgs);   // 👈 should be an array
      setOrganizations(orgs);
    })
    .catch((err) => {
      console.error("Org fetch error:", err);
      setToast({ message: "Failed to load organizations", type: "error" });
    })
    .finally(() => setLoadingOrgs(false));
}, []);

  // When org changes, populate members dropdown + companyName
  const handleOrgChange = (orgId) => {
  const org = organizations.find(o => o.id === orgId);
  setOrgDisplayName(org?.name || "");          // ← add this
  setOrgMembers(org?.members || []);
  setForm(f => ({
    ...f,
    organizationId: orgId,
    postedById: "",
    companyName: org?.companyProfile?.name || org?.name || "",
    companyLogo: org?.companyProfile?.logoUrl || "",
  }));
};

  const set = (field) => (val) => setForm(f => ({ ...f, [field]: val }));

  const addQuestion = () => setForm(f => ({
    ...f,
    questions: [...f.questions, { question: "", type: "TEXT", options: [], required: true, order: f.questions.length }],
  }));

  const updateQuestion = (i, q) => setForm(f => ({
    ...f,
    questions: f.questions.map((x, idx) => idx === i ? q : x),
  }));

  const removeQuestion = (i) => setForm(f => ({
    ...f,
    questions: f.questions.filter((_, idx) => idx !== i),
  }));

  const validate = () => {
    if (!form.organizationId) return "Select an organization";
    if (!form.role.trim())    return "Job role is required";
    if (!form.description.trim()) return "Description is required";
    if (!form.employmentType) return "Select employment type";
    if (!form.jobType)        return "Select job type";
    if (!form.salary.trim())  return "Salary is required";
    if (!form.responsibilities.trim()) return "Responsibilities are required";
    if (NEEDS_TENURE.includes(form.employmentType) && !form.tenure.number)
      return "Tenure is required for this employment type";
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { 
      console.log("Validation error:", err); 
      setToast({ message: err, type: "error" }); return; }

    setSaving(true);
    try {
      const payload = {
        organizationId:    form.organizationId,
        postedById:        form.postedById || undefined,
        role:              form.role,
        description:       form.description,
        employmentType:    form.employmentType,
        experienceLevel:   form.experienceLevel || undefined,
        experience:        (form.experience.min || form.experience.max)
                             ? { min: form.experience.min, max: form.experience.max }
                             : undefined,
        tenure:            NEEDS_TENURE.includes(form.employmentType)
                             ? { number: form.tenure.number, type: form.tenure.type }
                             : undefined,
        location:          form.location || undefined,
        skills:            form.skills,
        clouds:            form.clouds,
        salary:            form.salary,
        companyName:       form.companyName || undefined,
        responsibilities:  form.responsibilities,
        certifications:    form.certifications,
        jobType:           form.jobType,
        applicationDeadline: form.applicationDeadline || undefined,
        ApplicationLimit:  form.ApplicationLimit ? parseInt(form.ApplicationLimit) : undefined,
        companyLogo:       form.companyLogo || undefined,
        applicantSource:   form.applicantSource,
        questions:         form.questions,
      };
console.log("Submitting payload:", payload); 
      await adminPostJobApi(payload);
      setToast({ message: "Job posted successfully!", type: "success" });
      setForm(EMPTY_FORM);
      setOrgMembers([]);
      setOrgDisplayName(""); 
    } catch (e) {
      console.error("Submit error:", e);  
      setToast({ message: e?.response?.data?.message || "Failed to post job", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm(EMPTY_FORM);
    setOrgMembers([]);
    setOrgDisplayName("");
  };

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", minHeight: "100vh", background: "#F8FAFC", color: "#111827" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');
        @keyframes slideUp { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 3px; }
        input::placeholder, textarea::placeholder { color: #9CA3AF; }
        select option { color: #111827; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ background: "#fff", borderBottom: "1px solid #E5E7EB", padding: "0 32px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#111827", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontSize: 14 }}>💼</span>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>Post a Job</div>
              <div style={{ fontSize: 11, color: "#9CA3AF", fontFamily: "'DM Mono', monospace" }}>Admin · Jobs</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleReset} style={{ fontSize: 13, fontWeight: 500, padding: "7px 14px", border: "1px solid #E5E7EB", borderRadius: 8, background: "transparent", color: "#374151", cursor: "pointer" }}>
              Reset
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              style={{ fontSize: 13, fontWeight: 600, padding: "7px 20px", border: "none", borderRadius: 8, background: saving ? "#9CA3AF" : "#111827", color: "#fff", cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8 }}
            >
              {saving && <span style={{ width: 12, height: 12, border: "2px solid #ffffff60", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />}
              {saving ? "Posting…" : "Post Job"}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 32px" }}>

        {/* ── 1. Organization ── */}
        <SectionCard title="Organization" icon="🏢">
          <Grid cols={2}>
        <Field>
  <Label required>Organization</Label>
  {loadingOrgs ? (
    <div style={{ fontSize: 13, color: "#9CA3AF", padding: "9px 0" }}>Loading organizations…</div>
  ) : (
    <>
      <input
        list="org-list"
        value={orgDisplayName}
        onChange={e => {
          setOrgDisplayName(e.target.value);
          const org = organizations.find(o => o.name === e.target.value);
          if (org) handleOrgChange(org.id);  // sets organizationId in form
        }}
        placeholder="Search or select organization…"
        style={{
          width: "100%", padding: "9px 12px",
          border: "1px solid #E5E7EB", borderRadius: 8,
          fontSize: 13, color: "#111827", background: "#fff",
          outline: "none", fontFamily: "inherit", boxSizing: "border-box",
        }}
      />
      <datalist id="org-list">
        {organizations.map(o => (
          <option key={o.id} value={o.name} />
        ))}
      </datalist>
    </>
  )}
</Field>
            {/* <Field>
              <Label>Posted By (Member)</Label>
              <Select
                value={form.postedById}
                onChange={set("postedById")}
                placeholder={form.organizationId ? "Select member (optional)…" : "Select org first…"}
                options={orgMembers.map(m => ({
                  value: m.userId,
                  label: `${m.user?.name || "Unknown"} — ${m.role}`,
                }))}
              />
            </Field> */}
          </Grid>
        </SectionCard>

        {/* ── 2. Basic Info ── */}
        <SectionCard title="Job Details" icon="📋">
          <Grid cols={2}>
            <Field>
              <Label required>Job Role / Title</Label>
              <Input value={form.role} onChange={set("role")} placeholder="e.g. Salesforce Developer" />
            </Field>
            <Field>
              <Label>Company Name</Label>
              <Input value={form.companyName} onChange={set("companyName")} placeholder="Auto-filled from org" />
            </Field>
          </Grid>

          <div style={{ marginTop: 16 }}>
            <Label required>Description</Label>
            <Textarea value={form.description} onChange={set("description")} placeholder="Describe the role, team, and what the candidate will be doing…" rows={5} />
          </div>

          <div style={{ marginTop: 16 }}>
            <Label required>Responsibilities</Label>
            <Textarea value={form.responsibilities} onChange={set("responsibilities")} placeholder="Key responsibilities and day-to-day tasks…" rows={4} />
          </div>
        </SectionCard>

        {/* ── 3. Employment & Type ── */}
        <SectionCard title="Employment" icon="⚙️">
          <Grid cols={3}>
            <Field>
              <Label required>Employment Type</Label>
              <Select value={form.employmentType} onChange={set("employmentType")} placeholder="Select…" options={EMPLOYMENT_TYPES} />
            </Field>
           <Field>
  <Label required>Job Type</Label>
  <Select
    value={form.jobType}
    onChange={v => setForm(f => ({
      ...f,
      jobType: v,
      location: v === "Remote" ? "" : f.location,  // ← clears on Remote
    }))}
    placeholder="Select…"
    options={JOB_TYPES}
  />
</Field>
            <Field>
              <Label>Experience Level</Label>
              <Select value={form.experienceLevel} onChange={set("experienceLevel")} placeholder="Select…" options={EXPERIENCE_LEVELS} />
            </Field>
          </Grid>

          {/* Tenure — shown only when needed */}
          {NEEDS_TENURE.includes(form.employmentType) && (
            <div style={{ marginTop: 16, padding: "14px 16px", background: "#FEF9C3", border: "1px solid #FDE68A", borderRadius: 8 }}>
              <Label required>Tenure (required for {form.employmentType})</Label>
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <Input
                  type="number"
                  value={form.tenure.number}
                  onChange={v => setForm(f => ({ ...f, tenure: { ...f.tenure, number: v } }))}
                  placeholder="e.g. 6"
                />
                <div style={{ width: 140 }}>
                  <Select
                    value={form.tenure.type}
                    onChange={v => setForm(f => ({ ...f, tenure: { ...f.tenure, type: v } }))}
                    options={TENURE_TYPES}
                  />
                </div>
              </div>
            </div>
          )}

          <div style={{ marginTop: 16 }}>
            <Grid cols={2}>
              <Field>
                <Label>Experience Range</Label>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Input type="number" value={form.experience.min} onChange={v => setForm(f => ({ ...f, experience: { ...f.experience, min: v } }))} placeholder="Min yrs" />
                  <span style={{ color: "#9CA3AF", fontSize: 13 }}>–</span>
                  <Input type="number" value={form.experience.max} onChange={v => setForm(f => ({ ...f, experience: { ...f.experience, max: v } }))} placeholder="Max yrs" />
                </div>
              </Field>
              <Field>
                <Label required>Salary</Label>
                <Input value={form.salary} onChange={set("salary")} placeholder="e.g. 10-15 LPA or ₹80K/mo" />
              </Field>
            </Grid>
          </div>

          <div style={{ marginTop: 16 }}>
         <Grid cols={2}>
  {/* Hide location when Remote is selected */}
  {form.jobType !== "Remote" && (
    <Field>
      <Label>Location</Label>
      <Input value={form.location} onChange={set("location")} placeholder="e.g. Mumbai, India" />
    </Field>
  )}
  <Field>
    <Label>Applicant Source</Label>
    <Select value={form.applicantSource} onChange={set("applicantSource")} options={APPLICANT_SOURCES} />
  </Field>
</Grid>
          </div>
        </SectionCard>

        {/* ── 4. Skills & Clouds ── */}
        <SectionCard title="Skills & Expertise" icon="✦">
          <div style={{ marginBottom: 16 }}>
            <Label>Skills</Label>
            <TagInput tags={form.skills} onChange={set("skills")} placeholder="Type a skill, press Enter or Add…" />
          </div>
          <div style={{ marginBottom: 16 }}>
            <Label>Salesforce Clouds</Label>
            <TagInput tags={form.clouds} onChange={set("clouds")} placeholder="e.g. Sales Cloud, Service Cloud…" />
          </div>
          <div>
            <Label>Certifications</Label>
            <TagInput tags={form.certifications} onChange={set("certifications")} placeholder="e.g. Salesforce Admin…" />
          </div>
        </SectionCard>

        {/* ── 5. Additional ── */}
        <SectionCard title="Additional Settings" icon="🔧">
          <Grid cols={3}>
            <Field>
              <Label>Application Deadline</Label>
              <Input type="date" value={form.applicationDeadline} onChange={set("applicationDeadline")} />
            </Field>
            <Field>
              <Label>Application Limit</Label>
              <Input type="number" value={form.ApplicationLimit} onChange={set("ApplicationLimit")} placeholder="e.g. 100" />
            </Field>
            <Field>
              <Label>Company Logo URL</Label>
              <Input value={form.companyLogo} onChange={set("companyLogo")} placeholder="https://…" />
            </Field>
          </Grid>
        </SectionCard>

        {/* ── 6. Screening Questions ── */}
        <SectionCard title="Screening Questions" icon="❓">
          {form.questions.length === 0 && (
            <div style={{ textAlign: "center", padding: "20px 0", color: "#9CA3AF", fontSize: 13 }}>
              No screening questions added yet
            </div>
          )}
          {form.questions.map((q, i) => (
            <QuestionRow
              key={i}
              index={i}
              q={q}
              onChange={q => updateQuestion(i, q)}
              onRemove={() => removeQuestion(i)}
            />
          ))}
          <button
            onClick={addQuestion}
            style={{
              width: "100%", padding: "10px", fontSize: 13, fontWeight: 500,
              border: "1.5px dashed #D1D5DB", borderRadius: 8,
              background: "transparent", color: "#6B7280", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              marginTop: form.questions.length ? 4 : 0,
            }}
          >
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add Screening Question
          </button>
        </SectionCard>

        {/* ── Bottom submit bar ── */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 4, paddingBottom: 32 }}>
          <button onClick={handleReset} style={{ fontSize: 13, fontWeight: 500, padding: "9px 20px", border: "1px solid #E5E7EB", borderRadius: 8, background: "#fff", color: "#374151", cursor: "pointer" }}>
            Reset form
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            style={{ fontSize: 13, fontWeight: 600, padding: "9px 28px", border: "none", borderRadius: 8, background: saving ? "#9CA3AF" : "#111827", color: "#fff", cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8 }}
          >
            {saving && <span style={{ width: 12, height: 12, border: "2px solid #ffffff60", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />}
            {saving ? "Posting…" : "Post Job"}
          </button>
        </div>

      </div>

      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}