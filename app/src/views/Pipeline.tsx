import { useState } from "react";
import type { Lead, Stage } from "../types";
import { STAGE_LABELS, scoreOf } from "../types";
import { leadTypeMeta } from "../data";
import { IconBell, ScoreDial, fmtDate } from "../components/shared";

interface Props {
  leads: Lead[];
  onOpen: (id: string) => void;
  onStageChange: (id: string, stage: Stage) => void;
}

const STAGES: Stage[] = ["new", "contacted", "appointment", "closed"];

export function Pipeline({ leads, onOpen, onStageChange }: Props) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<Stage | null>(null);

  return (
    <div>
      <header className="page-head rise">
        <span className="overline">Pipeline board</span>
        <h1 className="page-title">Every lead, <em>moving forward.</em></h1>
        <p className="page-sub">Drag cards between stages, or open a lead to update it. Reminders surface on each card.</p>
      </header>

      <div className="board rise" style={{ animationDelay: "0.06s" }}>
        {STAGES.map((stage) => {
          const cards = leads
            .filter((l) => l.stage === stage)
            .map((l) => ({ lead: l, score: scoreOf(l) }))
            .sort((a, b) => b.score - a.score);
          return (
            <div
              key={stage}
              className={`board-col ${overCol === stage ? "drag-over" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setOverCol(stage); }}
              onDragLeave={() => setOverCol((c) => (c === stage ? null : c))}
              onDrop={(e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData("text/plain") || draggingId;
                if (id) onStageChange(id, stage);
                setOverCol(null);
                setDraggingId(null);
              }}
            >
              <div className="board-col-head">
                <span className="board-col-title">{STAGE_LABELS[stage]}</span>
                <span className="board-col-count">{cards.length}</span>
              </div>
              <div className="board-cards">
                {cards.map(({ lead, score }) => {
                  const meta = leadTypeMeta(lead.leadType);
                  return (
                    <div
                      key={lead.id}
                      className={`board-card ${draggingId === lead.id ? "dragging" : ""}`}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", lead.id);
                        setDraggingId(lead.id);
                      }}
                      onDragEnd={() => { setDraggingId(null); setOverCol(null); }}
                      onClick={() => onOpen(lead.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && onOpen(lead.id)}
                    >
                      <div className="bc-top">
                        <div>
                          <div className="bc-name">{lead.ownerName}</div>
                          <div className="bc-addr">{lead.address}</div>
                        </div>
                        <ScoreDial score={score} size={34} />
                      </div>
                      <div className="bc-foot">
                        <span className="bc-type">{meta.label}</span>
                        {lead.reminder && (
                          <span className="bc-reminder">
                            <IconBell size={11} /> {fmtDate(lead.reminder)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
