import { useState } from "react";
import { LEAD_TYPES } from "../data";
import type { LeadTypeId } from "../types";

interface Props {
  notify: (msg: string) => void;
}

const CRMS = [
  { name: "Follow Up Boss", color: "#1c6e5c", initials: "FB" },
  { name: "KVCore", color: "#274472", initials: "KV" },
  { name: "Chime", color: "#8a3d2a", initials: "CH" },
  { name: "HubSpot", color: "#b4502e", initials: "HS" },
];

const SAVED_SEARCHES = [
  { name: "Dilworth expireds + FSBO", criteria: "28203 · expired, fsbo · score 55+" },
  { name: "South CLT equity unlock", criteria: "28209, 28210 · high_equity · equity 60%+" },
  { name: "Plaza Midwood distress", criteria: "28205 · pre_foreclosure, probate" },
];

export function Settings({ notify }: Props) {
  const [zips, setZips] = useState(["28203", "28205", "28209", "28210"]);
  const [zipDraft, setZipDraft] = useState("");
  const [prefs, setPrefs] = useState<Set<LeadTypeId>>(
    new Set<LeadTypeId>(["expired", "fsbo", "home_value", "life_event", "past_client", "high_equity", "pre_foreclosure"]),
  );
  const [toggles, setToggles] = useState({
    dailyFeedEmail: true,
    reminderPush: true,
    newHotLeadPush: true,
    weeklyDigest: false,
  });

  const addZip = () => {
    const z = zipDraft.trim();
    if (/^\d{5}$/.test(z) && !zips.includes(z)) {
      setZips([...zips, z]);
      notify(`Farm area ${z} added`);
    }
    setZipDraft("");
  };

  const togglePref = (id: LeadTypeId) =>
    setPrefs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const flip = (key: keyof typeof toggles) =>
    setToggles((t) => ({ ...t, [key]: !t[key] }));

  return (
    <div>
      <header className="page-head rise">
        <span className="overline">Settings</span>
        <h1 className="page-title">Tune your <em>instrument.</em></h1>
      </header>

      <div className="settings-grid rise" style={{ animationDelay: "0.06s" }}>
        <div className="settings-col">
          <section className="card card-pad">
            <div className="card-title">Farm areas</div>
            <p style={{ fontSize: 12.5, color: "var(--ink-2)", margin: "0 0 12px" }}>
              Zip codes your daily feed and alerts are built around.
            </p>
            <div className="zip-chips">
              {zips.map((z) => (
                <span className="zip-chip" key={z}>
                  {z}
                  <button onClick={() => setZips(zips.filter((x) => x !== z))} aria-label={`Remove ${z}`}>✕</button>
                </span>
              ))}
              <input
                className="zip-add"
                placeholder="+ add zip"
                value={zipDraft}
                maxLength={5}
                onChange={(e) => setZipDraft(e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => e.key === "Enter" && addZip()}
              />
            </div>
          </section>

          <section className="card card-pad">
            <div className="card-title">Feed lead types</div>
            <p style={{ fontSize: 12.5, color: "var(--ink-2)", margin: "0 0 12px" }}>
              Which lead types appear in your daily warm feed.
            </p>
            <div className="type-chips">
              {LEAD_TYPES.map((t) => (
                <button
                  key={t.id}
                  className={`type-chip ${prefs.has(t.id) ? (t.classification === "warm" ? "on-warm" : "on-cold") : ""}`}
                  onClick={() => togglePref(t.id)}
                  title={t.blurb}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </section>

          <section className="card card-pad">
            <div className="card-title">Saved searches</div>
            {SAVED_SEARCHES.map((s) => (
              <div className="saved-search" key={s.name}>
                <div>
                  <div className="ss-name">{s.name}</div>
                  <div className="ss-criteria">{s.criteria}</div>
                </div>
                <span className="phase-badge">Alerts · Phase 2</span>
              </div>
            ))}
          </section>
        </div>

        <div className="settings-col">
          <section className="card card-pad">
            <div className="card-title">Notifications</div>
            <div className="toggle-row">
              <div>
                Daily feed email
                <div className="toggle-sub">Your ranked warm leads, every morning at 6 AM</div>
              </div>
              <button className={`switch ${toggles.dailyFeedEmail ? "on" : ""}`} onClick={() => flip("dailyFeedEmail")} aria-label="Toggle daily feed email" />
            </div>
            <div className="toggle-row">
              <div>
                Follow-up reminders
                <div className="toggle-sub">Push notification when a reminder comes due</div>
              </div>
              <button className={`switch ${toggles.reminderPush ? "on" : ""}`} onClick={() => flip("reminderPush")} aria-label="Toggle reminder notifications" />
            </div>
            <div className="toggle-row">
              <div>
                New hot lead alerts
                <div className="toggle-sub">Instant push when a lead scores 80+ in your farm</div>
              </div>
              <button className={`switch ${toggles.newHotLeadPush ? "on" : ""}`} onClick={() => flip("newHotLeadPush")} aria-label="Toggle hot lead alerts" />
            </div>
            <div className="toggle-row">
              <div>
                Weekly market digest
                <div className="toggle-sub">Farm-area market trends, Mondays</div>
              </div>
              <button className={`switch ${toggles.weeklyDigest ? "on" : ""}`} onClick={() => flip("weeklyDigest")} aria-label="Toggle weekly digest" />
            </div>
          </section>

          <section className="card card-pad">
            <div className="card-title">CRM connections</div>
            {CRMS.map((c) => (
              <div className="crm-row" key={c.name}>
                <span className="crm-logo" style={{ background: c.color }}>{c.initials}</span>
                <div>
                  <div className="crm-name">{c.name}</div>
                  <div className="crm-sub">Two-way sync via OAuth 2.0</div>
                </div>
                <span className="phase-badge">Phase 2</span>
              </div>
            ))}
          </section>

          <section className="card card-pad">
            <div className="card-title">Compliance</div>
            <div style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.6 }}>
              <p style={{ margin: "0 0 8px" }}>
                <strong>DNC scrubbing</strong> — every phone number is checked against the national
                Do Not Call registry before display. Numbers on the registry are flagged and calling is disabled.
              </p>
              <p style={{ margin: "0 0 8px" }}>
                <strong>Fair Housing</strong> — search filters exclude all protected class characteristics.
                Your search parameters are retained in an audit log for 24 months.
              </p>
              <p style={{ margin: 0 }}>
                <strong>Data privacy</strong> — lead PII is encrypted at rest (AES-256) and purged or
                anonymized after 24 months. Every profile shows its data source.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
