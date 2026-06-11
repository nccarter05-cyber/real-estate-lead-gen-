import type { Lead } from "../types";
import { scoreOf, tierOf } from "../types";
import { leadTypeMeta } from "../data";
import { ClassChip, IconBell, IconPin, ScoreDial, TierPill, fmtDate } from "../components/shared";

interface Props {
  leads: Lead[];
  onOpen: (id: string) => void;
}

export function Feed({ leads, onOpen }: Props) {
  const today = new Date();
  const greeting = today.getHours() < 12 ? "Good morning" : today.getHours() < 17 ? "Good afternoon" : "Good evening";
  const dateLine = today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const scored = leads
    .map((l) => ({ lead: l, score: scoreOf(l) }))
    .sort((a, b) => b.score - a.score);

  const feed = scored
    .filter(({ lead, score }) => leadTypeMeta(lead.leadType).classification === "warm" && lead.stage !== "closed" && score >= 55)
    .slice(0, 12);

  const hotCount = scored.filter(({ score }) => tierOf(score) === "hot").length;
  const warmCount = scored.filter(({ score }) => tierOf(score) === "warm").length;
  const dueReminders = leads.filter((l) => l.reminder && l.reminder <= today.toISOString().slice(0, 10)).length;
  const newToday = leads.filter((l) => l.surfacedAt === today.toISOString().slice(0, 10)).length;

  return (
    <div>
      <header className="page-head rise">
        <span className="overline">Daily feed · {dateLine}</span>
        <h1 className="page-title">
          {greeting}, Marcus. <em>{feed.length} warm leads</em> match your farm areas.
        </h1>
        <p className="page-sub">
          Ranked by score across zips 28203, 28205, 28209 & 28210. Refreshed 6:00 AM — sourced from MLS, county records, and permissioned partners.
        </p>
      </header>

      <div className="stat-strip rise" style={{ animationDelay: "0.06s" }}>
        <div className="stat">
          <div className="stat-num"><span className="stat-accent-hot">{hotCount}</span></div>
          <div className="stat-label">Hot leads — call within 24h</div>
        </div>
        <div className="stat">
          <div className="stat-num"><span className="stat-accent-warm">{warmCount}</span></div>
          <div className="stat-label">Warm leads — follow up in 72h</div>
        </div>
        <div className="stat">
          <div className="stat-num">{newToday}<span className="stat-delta">new</span></div>
          <div className="stat-label">Surfaced overnight</div>
        </div>
        <div className="stat">
          <div className="stat-num">{dueReminders}</div>
          <div className="stat-label">Follow-ups due today</div>
        </div>
      </div>

      <div className="feed-list">
        {feed.map(({ lead, score }, i) => {
          const meta = leadTypeMeta(lead.leadType);
          return (
            <button
              key={lead.id}
              className="lead-card rise"
              style={{ animationDelay: `${0.1 + i * 0.05}s` }}
              onClick={() => onOpen(lead.id)}
            >
              <ScoreDial score={score} size={48} />
              <div className="lead-card-body">
                <div className="lead-name">{lead.ownerName}</div>
                <div className="lead-addr">
                  <IconPin size={11} /> {lead.address} · {lead.city}, {lead.state} {lead.zip}
                </div>
                <div className="lead-why">{lead.reasoning}</div>
                <div className="lead-meta-row">
                  <TierPill score={score} />
                  <ClassChip classification={meta.classification} />
                  {lead.reminder && (
                    <span className="chip chip-tag">
                      <IconBell size={11} /> Follow up {fmtDate(lead.reminder)}
                    </span>
                  )}
                  {lead.tags.slice(0, 2).map((t) => (
                    <span className="chip chip-tag" key={t}>{t}</span>
                  ))}
                </div>
              </div>
              <div className="lead-card-right">
                <span className="lead-type-label">{meta.label}</span>
                <span style={{ fontSize: 11, color: "var(--ink-3)" }} className="mono">{lead.id}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
