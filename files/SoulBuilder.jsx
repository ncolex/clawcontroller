import { useState, useCallback } from "react";

// ─── Zustand store additions (paste into your existing store) ────────────────
// If you're using Zustand, add these actions to your agent store:
//
// generateSoul: async (payload) => { ... POST /api/soul/generate ... }
// validateSoul: async (structured, ecosystem) => { ... POST /api/soul/validate ... }
// scoreSoul:    async (structured) => { ... POST /api/soul/score ... }

const API = "/api/soul";

async function apiPost(path, body) {
  const r = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error((await r.json()).detail || r.statusText);
  return r.json();
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ScoreBar({ label, value, color }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: "#8b9ab0", letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color }}>{value ?? "—"}</span>
      </div>
      <div style={{ height: 4, background: "#1a2235", borderRadius: 2, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${value ?? 0}%`,
          background: color,
          borderRadius: 2,
          transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: `0 0 8px ${color}66`
        }} />
      </div>
    </div>
  );
}

function Tag({ children, color = "#3b82f6" }) {
  return (
    <span style={{
      display: "inline-block", padding: "2px 8px",
      background: `${color}22`, border: `1px solid ${color}44`,
      borderRadius: 4, fontSize: 11, color, marginRight: 4, marginBottom: 4
    }}>
      {children}
    </span>
  );
}

function Alert({ type, children }) {
  const colors = { warning: "#f59e0b", error: "#ef4444", success: "#10b981", info: "#6366f1" };
  const c = colors[type] || colors.info;
  return (
    <div style={{
      display: "flex", gap: 8, padding: "8px 12px",
      background: `${c}11`, border: `1px solid ${c}33`,
      borderRadius: 6, marginBottom: 6, fontSize: 12, color: "#c8d4e8", lineHeight: 1.5
    }}>
      <span style={{ color: c, flexShrink: 0 }}>
        {type === "warning" ? "⚠" : type === "error" ? "✕" : type === "success" ? "✓" : "ℹ"}
      </span>
      <span>{children}</span>
    </div>
  );
}

// ─── STEPS ───────────────────────────────────────────────────────────────────

function Step1({ form, setForm }) {
  return (
    <div>
      <Label>Agent Type</Label>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["agent", "subagent"].map(t => (
          <button
            key={t}
            onClick={() => setForm(f => ({ ...f, type: t }))}
            style={{
              flex: 1, padding: "10px 0", borderRadius: 8,
              border: `2px solid ${form.type === t ? "#6366f1" : "#1e2d45"}`,
              background: form.type === t ? "#6366f122" : "#111827",
              color: form.type === t ? "#a5b4fc" : "#6b7a95",
              fontWeight: 600, fontSize: 13, cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            {t === "agent" ? "🤖 Agent" : "⚡ Subagent"}
          </button>
        ))}
      </div>

      <Label>Agent Name</Label>
      <Input
        placeholder="e.g. ResearchAgent, TradingBot, SummaryWorker"
        value={form.name}
        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
      />

      <Label>Base Idea / Purpose</Label>
      <Textarea
        placeholder="Describe what this agent should do, its domain, and how it operates..."
        rows={5}
        value={form.base_idea}
        onChange={e => setForm(f => ({ ...f, base_idea: e.target.value }))}
      />
    </div>
  );
}

function Step2({ form, setForm }) {
  return (
    <div>
      {form.type === "subagent" && (
        <>
          <Label>Parent Agent (required for subagents)</Label>
          <Input
            placeholder="e.g. ResearchAgent, OrchestratorAgent"
            value={form.hierarchy_parent || ""}
            onChange={e => setForm(f => ({ ...f, hierarchy_parent: e.target.value }))}
          />
        </>
      )}

      <Label>Existing Agents in Ecosystem (comma-separated)</Label>
      <Input
        placeholder="ResearchAgent, StrategyAgent, SummaryWorker"
        value={form.existing_agents_raw || ""}
        onChange={e => setForm(f => ({
          ...f,
          existing_agents_raw: e.target.value,
          existing_agents: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
        }))}
      />

      <div style={{ marginTop: 16, padding: 14, background: "#0d1929", borderRadius: 8, border: "1px solid #1e2d45" }}>
        <p style={{ fontSize: 12, color: "#6b7a95", margin: 0, lineHeight: 1.6 }}>
          Providing existing agents helps the AI detect role overlaps and ensure your new agent fills a genuine gap in the ecosystem.
        </p>
      </div>
    </div>
  );
}

function Step3({ draft, score, validation }) {
  if (!draft) {
    return (
      <div style={{ textAlign: "center", padding: 40, color: "#4b5a72" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⚙️</div>
        Generate your SOUL to see the review
      </div>
    );
  }

  return (
    <div>
      <Label>Generated SOUL.md</Label>
      <div style={{
        background: "#060e1a", border: "1px solid #1e2d45", borderRadius: 8,
        padding: 16, fontFamily: "monospace", fontSize: 12, color: "#94a3b8",
        whiteSpace: "pre-wrap", maxHeight: 320, overflowY: "auto",
        lineHeight: 1.7
      }}>
        {draft.markdown}
      </div>

      {draft.structured && (
        <div style={{ marginTop: 16 }}>
          <Label>Competencies</Label>
          <div>{(draft.structured.competencies || []).map((c, i) => <Tag key={i} color="#6366f1">{c}</Tag>)}</div>
          <Label style={{ marginTop: 10 }}>Restrictions</Label>
          <div>{(draft.structured.restrictions || []).map((r, i) => <Tag key={i} color="#ef4444">{r}</Tag>)}</div>
        </div>
      )}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Label({ children, style }) {
  return <p style={{ fontSize: 11, color: "#6b7a95", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6, marginTop: 0, ...style }}>{children}</p>;
}

function Input({ ...props }) {
  return (
    <input
      {...props}
      style={{
        width: "100%", padding: "10px 14px", background: "#0d1929",
        border: "1px solid #1e2d45", borderRadius: 8, color: "#c8d4e8",
        fontSize: 13, marginBottom: 16, boxSizing: "border-box",
        outline: "none", transition: "border-color 0.2s",
      }}
      onFocus={e => e.target.style.borderColor = "#6366f1"}
      onBlur={e => e.target.style.borderColor = "#1e2d45"}
    />
  );
}

function Textarea({ ...props }) {
  return (
    <textarea
      {...props}
      style={{
        width: "100%", padding: "10px 14px", background: "#0d1929",
        border: "1px solid #1e2d45", borderRadius: 8, color: "#c8d4e8",
        fontSize: 13, marginBottom: 16, boxSizing: "border-box",
        outline: "none", resize: "vertical", fontFamily: "inherit",
        transition: "border-color 0.2s",
      }}
      onFocus={e => e.target.style.borderColor = "#6366f1"}
      onBlur={e => e.target.style.borderColor = "#1e2d45"}
    />
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function SoulBuilder({ agentId, onSaved }) {
  const [step, setStep]           = useState(0);
  const [form, setForm]           = useState({ type: "agent", name: "", base_idea: "", hierarchy_parent: null, existing_agents: [] });
  const [draft, setDraft]         = useState(null);
  const [validation, setVal]      = useState(null);
  const [score, setScore]         = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [saved, setSaved]         = useState(false);

  const steps = ["Base Identity", "Hierarchy & Ecosystem", "Review & Score"];

  const canProceed = () => {
    if (step === 0) return form.name.trim().length > 0 && form.base_idea.trim().length > 10;
    if (step === 1) return form.type === "agent" || (form.hierarchy_parent && form.hierarchy_parent.trim().length > 0);
    return true;
  };

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [d, v, s] = await Promise.all([
        apiPost("/generate", form),
        apiPost("/validate", { structured: {}, ecosystem: [] }),
        apiPost("/score",    { structured: {} }),
      ]);
      setDraft(d);
      // Run validate + score with real structured data
      const [v2, s2] = await Promise.all([
        apiPost("/validate", { structured: d.structured, ecosystem: form.existing_agents.map(n => ({ name: n, structured: {} })) }),
        apiPost("/score",    { structured: d.structured }),
      ]);
      setVal(v2);
      setScore(s2);
      setStep(2);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [form]);

  const strengthen = useCallback(async () => {
    if (!draft) return;
    setLoading(true);
    try {
      const enhanced = await apiPost("/generate", { ...form, base_idea: form.base_idea + "\n\nIMPORTANT: Make restrictions stricter, competencies more specific, and role more precise." });
      const [v, s] = await Promise.all([
        apiPost("/validate", { structured: enhanced.structured, ecosystem: form.existing_agents.map(n => ({ name: n, structured: {} })) }),
        apiPost("/score",    { structured: enhanced.structured }),
      ]);
      setDraft(enhanced);
      setVal(v);
      setScore(s);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [draft, form]);

  const save = useCallback(async () => {
    if (!draft || !agentId) return;
    setLoading(true);
    try {
      await fetch(`${API}/save/${agentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent_id: agentId, soul_markdown: draft.markdown, structured: draft.structured }),
      });
      setSaved(true);
      onSaved?.(draft);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [draft, agentId, onSaved]);

  const scoreColor = v => v >= 75 ? "#10b981" : v >= 45 ? "#f59e0b" : "#ef4444";
  const overlapPct = validation ? Math.round((validation.overlap_score || 0) * 100) : 0;
  const blocked    = overlapPct > 70;

  return (
    <div style={{
      display: "flex", gap: 0, background: "#080f1d", borderRadius: 12,
      border: "1px solid #1e2d45", overflow: "hidden",
      fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
      boxShadow: "0 25px 60px #00000088", maxWidth: 980, width: "100%"
    }}>

      {/* ── Left Panel ─────────────────────────────────────────────────── */}
      <div style={{ flex: 1, padding: 32, borderRight: "1px solid #1e2d45", minWidth: 0 }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10, color: "#6366f1", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 }}>
            SOUL BUILDER
          </div>
          <h2 style={{ margin: 0, fontSize: 22, color: "#e2e8f0", fontWeight: 700 }}>
            {form.name || "New Agent"}
          </h2>
        </div>

        {/* Step Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 28 }}>
          {steps.map((s, i) => (
            <button
              key={i}
              onClick={() => i < step || (i === 1 && canProceed()) ? setStep(i) : null}
              style={{
                flex: 1, padding: "7px 4px", fontSize: 10, fontWeight: 600,
                letterSpacing: "0.06em", textTransform: "uppercase",
                borderRadius: 6, border: "none", cursor: "pointer",
                background: step === i ? "#6366f1" : step > i ? "#1e3a2e" : "#0d1929",
                color: step === i ? "#fff" : step > i ? "#10b981" : "#4b5a72",
                transition: "all 0.2s"
              }}
            >
              {step > i ? "✓ " : `${i + 1}. `}{s}
            </button>
          ))}
        </div>

        {/* Step Content */}
        <div style={{ minHeight: 280 }}>
          {step === 0 && <Step1 form={form} setForm={setForm} />}
          {step === 1 && <Step2 form={form} setForm={setForm} />}
          {step === 2 && <Step3 draft={draft} score={score} validation={validation} />}
        </div>

        {error && (
          <div style={{ padding: "10px 14px", background: "#ef444415", border: "1px solid #ef444444", borderRadius: 8, color: "#fca5a5", fontSize: 12, marginTop: 12 }}>
            {error}
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} style={btnStyle("#1e2d45", "#94a3b8")}>
              ← Back
            </button>
          )}
          {step < 1 && (
            <button onClick={() => canProceed() && setStep(s => s + 1)} disabled={!canProceed()} style={btnStyle("#6366f1", "#fff", !canProceed())}>
              Next →
            </button>
          )}
          {step === 1 && (
            <button onClick={generate} disabled={!canProceed() || loading} style={btnStyle("#6366f1", "#fff", !canProceed() || loading)}>
              {loading ? "Generating..." : "⚡ Generate SOUL"}
            </button>
          )}
          {step === 2 && draft && (
            <button
              onClick={save}
              disabled={loading || blocked || saved}
              style={btnStyle(saved ? "#10b981" : blocked ? "#6b1a1a" : "#10b981", "#fff", loading || blocked || saved)}
            >
              {saved ? "✓ Saved" : blocked ? "⛔ Overlap Too High" : loading ? "Saving..." : "💾 Save SOUL"}
            </button>
          )}
        </div>
      </div>

      {/* ── Right Panel: AI Assistant ──────────────────────────────────── */}
      <div style={{ width: 300, padding: 24, background: "#060e1a", display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 10, color: "#6b7a95", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 20 }}>
          Identity Analysis
        </div>

        {/* Score Bars */}
        {score ? (
          <div style={{ marginBottom: 20 }}>
            <ScoreBar label="Identity Strength" value={score.identity_strength}  color={scoreColor(score.identity_strength)} />
            <ScoreBar label="Clarity"           value={score.clarity}            color={scoreColor(score.clarity)} />
            <ScoreBar label="Constraints"       value={score.constraint_quality} color={scoreColor(score.constraint_quality)} />
            <ScoreBar label="Specialization"    value={score.specialization}     color={scoreColor(score.specialization)} />
          </div>
        ) : (
          <div style={{ padding: "20px 0", textAlign: "center", color: "#2a3a52", fontSize: 12, marginBottom: 20 }}>
            Scores appear after generation
          </div>
        )}

        {/* Validation Alerts */}
        {validation && (
          <div style={{ flex: 1, overflowY: "auto" }}>
            {validation.conflicts?.map((c, i)    => <Alert key={`c${i}`} type="error">{c}</Alert>)}
            {validation.warnings?.map((w, i)     => <Alert key={`w${i}`} type="warning">{w}</Alert>)}
            {validation.missing_sections?.map((m, i) => <Alert key={`m${i}`} type="info">Missing: <strong>{m}</strong></Alert>)}
            {!validation.conflicts?.length && !validation.warnings?.length && !validation.missing_sections?.length && (
              <Alert type="success">Identity looks solid. No critical issues detected.</Alert>
            )}
            {overlapPct > 0 && (
              <div style={{ marginTop: 8, padding: "8px 12px", background: "#0d1929", borderRadius: 6, fontSize: 11, color: "#6b7a95" }}>
                Ecosystem overlap: <span style={{ color: scoreColor(100 - overlapPct), fontWeight: 700 }}>{overlapPct}%</span>
              </div>
            )}
          </div>
        )}

        {/* Strengthen Button */}
        {draft && (
          <button
            onClick={strengthen}
            disabled={loading}
            style={{
              ...btnStyle("#1e2d45", "#a5b4fc", loading),
              marginTop: 16, width: "100%", borderColor: "#6366f133",
              border: "1px solid #6366f133", fontSize: 11, letterSpacing: "0.06em"
            }}
          >
            {loading ? "..." : "✦ Strengthen Identity"}
          </button>
        )}

        <div style={{ marginTop: 16, fontSize: 10, color: "#2a3a52", lineHeight: 1.5, textAlign: "center" }}>
          SOUL.md defines cognitive identity.<br />Precision here = system reliability.
        </div>
      </div>
    </div>
  );
}

function btnStyle(bg, color, disabled = false) {
  return {
    flex: 1, padding: "10px 16px", background: disabled ? "#0d1929" : bg,
    color: disabled ? "#2a3a52" : color, border: "none", borderRadius: 8,
    fontSize: 12, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
    letterSpacing: "0.04em", transition: "all 0.2s",
    fontFamily: "inherit"
  };
}
