import { useEffect, useState } from "react";
import type { Lead, SignalStrengths, Stage } from "../types";
import {
  CATEGORY_LABELS,
  CATEGORY_WEIGHTS,
  STAGE_LABELS,
  TIER_GUIDANCE,
  scoreOf,
  tierOf,
} from "../types";
import { leadTypeMeta } from "../data";
import {
  ClassChip,
  IconBell,
  IconMail,
  IconPhone,
  ScoreDial,
  TierPill,
  fmtDate,
  fmtMoney,
  tierColor,
} from "./shared";

interface Props {
  lead: Lead;
  onClose: () => void;
  onUpdate: (lead: Lead) => void;
  notify: (msg: string) => void;
}

const CATEGORY_ORDER: (keyof SignalStrengths)[] = [
  "intent",
  "lifeEvent",
  "property",
  "marketTiming",
  "contactQuality",
];

export function LeadDrawer({ lead, onClose, onUpdate, notify }: Props) {
  const [noteDraft, setNoteDraft] = useState("");
  const [tagDraft, setTagDraft] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const score = scoreOf(lead);
  const tier = tierOf(score);
  const meta = leadTypeMeta(lead.leadType);
  const today = new Date().toISOString().slice(0, 10);

  const addNote = () => {
    const text = noteDraft.trim();
    if (!text) return;
    onUpdate({ ...lead, notes: [{ date: today, text }, ...lead.notes] });
    setNoteDraft("");
  };

  const addTag = () => {
    const tag = tagDraft.trim();
    if (!tag || lead.tags.includes(tag)) return;
    onUpdate({ ...lead, tags: [...lead.tags, tag] });
    setTagDraft("");
  };

  const canCall = lead.contact.phone && lead.contact.dncStatus === "clear";

  return (
    <>
      <div className="drawer-scrim" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-label={`Lead profile: ${lead.ownerName}`}>
        <header className="drawer-head">
          <button className="drawer-close" onClick={onClose} aria-label="Close profile">✕</button>
          <div className="drawer-head-grid">
            <ScoreDial score={score} size={62} />
            <div>
              <h2 className="drawer-owner">{lead.ownerName}</h2>
              <div className="drawer-addr">
                {lead.address} · {lead.city}, {lead.state} {lead.zip}
              </div>
              <div className="drawer-meta">
                <TierPill score={score} />
                <ClassChip classification={meta.classification} />
                <span className="chip chip-tag">{meta.label}</span>
              </div>
            </div>
          </div>
          <div className={`drawer-guidance g-${tier}`}>
            <IconBell size={14} />
            {TIER_GUIDANCE[tier]}
          </div>
        </header>

        <div className="drawer-body">
          {/* why this lead */}
          <section className="card card-pad why-card">
            <div className="card-title">Why this lead</div>
            <p className="why-text">{lead.reasoning}</p>
          </section>

          {/* signals */}
          <section className="card card-pad">
            <div className="card-title">Signals detected</div>
            <div className="signal-list">
              {lead.signals.map((s, i) => (
                <div className="signal-item" key={i}>
                  <span className="signal-cat">{CATEGORY_LABELS[s.category]}</span>
                  <span>{s.text}</span>
                </div>
              ))}
            </div>
          </section>

          {/* score breakdown */}
          <section className="card card-pad">
            <div className="card-title">Score breakdown — {score} / 100</div>
            <div className="breakdown">
              {CATEGORY_ORDER.map((k) => {
                const pts = lead.strengths[k] * CATEGORY_WEIGHTS[k] * 100;
                const max = CATEGORY_WEIGHTS[k] * 100;
                return (
                  <div className="bd-row" key={k}>
                    <div className="bd-label">
                      {CATEGORY_LABELS[k]}
                      <span className="bd-weight">weight {Math.round(CATEGORY_WEIGHTS[k] * 100)}%</span>
                    </div>
                    <div className="bd-track">
                      <div
                        className="bd-fill"
                        style={{ width: `${(pts / max) * 100}%`, background: tierColor(score) }}
                      />
                    </div>
                    <div className="bd-pts">
                      {pts.toFixed(1)}<span style={{ color: "var(--ink-3)", fontWeight: 400 }}>/{max}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* property data */}
          <section className="card card-pad">
            <div className="card-title">Property data</div>
            <div className="prop-grid">
              <div className="prop-cell"><div className="prop-k">Type</div><div className="prop-v">{lead.property.type}</div></div>
              <div className="prop-cell"><div className="prop-k">Beds / Baths</div><div className="prop-v">{lead.property.beds} / {lead.property.baths}</div></div>
              <div className="prop-cell"><div className="prop-k">Sq Ft</div><div className="prop-v">{lead.property.sqft.toLocaleString()}</div></div>
              <div className="prop-cell"><div className="prop-k">Est. Value</div><div className="prop-v">{fmtMoney(lead.property.estValue)}</div></div>
              <div className="prop-cell"><div className="prop-k">Est. Equity</div><div className="prop-v highlight">{lead.property.equityPct}%</div></div>
              <div className="prop-cell"><div className="prop-k">Owned</div><div className="prop-v">{lead.property.ownershipYears} yrs</div></div>
              <div className="prop-cell"><div className="prop-k">Assessed</div><div className="prop-v">{fmtMoney(lead.property.assessedValue)}</div></div>
              <div className="prop-cell"><div className="prop-k">Last Sale</div><div className="prop-v">{fmtMoney(lead.property.lastSalePrice)}</div></div>
              <div className="prop-cell"><div className="prop-k">Sale Date</div><div className="prop-v">{fmtDate(lead.property.lastSaleDate)}</div></div>
            </div>
          </section>

          {/* contact */}
          <section className="card card-pad">
            <div className="card-title">Contact</div>
            <div className="contact-rows">
              <div className="contact-row">
                <span className="contact-icon"><IconPhone size={15} /></span>
                {lead.contact.phone ? (
                  <>
                    <span className="mono">{lead.contact.phone}</span>
                    {lead.contact.phoneVerified && <span className="verified-tick">✓ verified</span>}
                    <span className={`chip ${lead.contact.dncStatus === "clear" ? "chip-dnc-clear" : "chip-dnc-listed"}`}>
                      {lead.contact.dncStatus === "clear" ? "DNC clear" : "On DNC registry — do not call"}
                    </span>
                  </>
                ) : (
                  <span className="contact-missing">No phone on file — mail outreach only</span>
                )}
              </div>
              <div className="contact-row">
                <span className="contact-icon"><IconMail size={15} /></span>
                {lead.contact.email ? (
                  <>
                    <span className="mono">{lead.contact.email}</span>
                    {lead.contact.emailVerified && <span className="verified-tick">✓ verified</span>}
                  </>
                ) : (
                  <span className="contact-missing">No email on file</span>
                )}
              </div>
              {lead.contact.consent === "opt_in" && (
                <div className="contact-row">
                  <span className="chip chip-consent">✓ Opt-in consent on record</span>
                </div>
              )}
            </div>
            <div className="contact-actions">
              <button
                className="btn btn-primary btn-sm"
                disabled={!canCall}
                style={!canCall ? { opacity: 0.45, cursor: "not-allowed" } : undefined}
                onClick={() => notify(`Call logged for ${lead.ownerName}`)}
              >
                <IconPhone size={13} /> Log a call
              </button>
              <button
                className="btn btn-sm"
                disabled={!lead.contact.email}
                style={!lead.contact.email ? { opacity: 0.45, cursor: "not-allowed" } : undefined}
                onClick={() => notify("Email draft opened")}
              >
                <IconMail size={13} /> Email
              </button>
              <button className="btn btn-sm btn-ghost" onClick={() => notify("AI outreach drafts arrive in Phase 2")}>
                ✦ AI outreach draft <span className="phase-badge">Phase 2</span>
              </button>
            </div>
          </section>

          {/* stage + reminder */}
          <section className="card card-pad">
            <div className="card-title">Pipeline & follow-up</div>
            <div className="reminder-row" style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600 }}>Stage</label>
              <select
                className="stage-select"
                value={lead.stage}
                onChange={(e) => onUpdate({ ...lead, stage: e.target.value as Stage })}
              >
                {(Object.keys(STAGE_LABELS) as Stage[]).map((s) => (
                  <option key={s} value={s}>{STAGE_LABELS[s]}</option>
                ))}
              </select>
            </div>
            <div className="reminder-row">
              <label style={{ fontSize: 12.5, fontWeight: 600 }}>Follow-up</label>
              <input
                type="date"
                value={lead.reminder ?? ""}
                min={today}
                onChange={(e) => onUpdate({ ...lead, reminder: e.target.value || undefined })}
              />
              {lead.reminder && (
                <button className="btn btn-sm btn-ghost" onClick={() => onUpdate({ ...lead, reminder: undefined })}>
                  Clear
                </button>
              )}
            </div>
          </section>

          {/* tags + notes */}
          <section className="card card-pad">
            <div className="card-title">Tags & notes</div>
            <div className="tag-row" style={{ marginBottom: 12 }}>
              {lead.tags.map((t) => (
                <span className="chip chip-tag" key={t}>
                  {t}
                  <button
                    style={{ border: 0, background: "none", color: "var(--ink-3)", padding: 0, fontSize: 11 }}
                    onClick={() => onUpdate({ ...lead, tags: lead.tags.filter((x) => x !== t) })}
                    aria-label={`Remove tag ${t}`}
                  >
                    ✕
                  </button>
                </span>
              ))}
              <input
                className="tag-input"
                placeholder="+ tag"
                value={tagDraft}
                onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTag()}
              />
            </div>
            {lead.notes.map((n, i) => (
              <div className="note-item" key={i}>
                <div className="note-date">{fmtDate(n.date)}</div>
                {n.text}
              </div>
            ))}
            <div className="note-input-row">
              <textarea
                className="note-input"
                rows={2}
                placeholder="Add a private note…"
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
              />
              <button className="btn btn-sm" onClick={addNote} style={{ alignSelf: "flex-end" }}>
                Save
              </button>
            </div>
          </section>

          {/* compliance footer */}
          <div className="source-line">
            <strong style={{ color: "var(--ink-2)" }}>Source:</strong> {lead.source} · Surfaced {fmtDate(lead.surfacedAt)} · Refreshed daily
          </div>
          <div className="fh-disclosure">
            Equal Housing Opportunity. ProspectIQ does not permit filtering by race, religion, national origin,
            sex, disability, familial status, or color. All outreach must be agent-initiated and comply with
            TCPA and CAN-SPAM. Search activity is retained in the compliance audit log for 24 months.
          </div>
        </div>
      </aside>
    </>
  );
}
