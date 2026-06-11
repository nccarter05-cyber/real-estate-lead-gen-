import { useCallback, useMemo, useRef, useState } from "react";
import type { Lead, Stage } from "./types";
import { scoreOf, tierOf } from "./types";
import { SEED_LEADS, leadTypeMeta } from "./data";
import { Feed } from "./views/Feed";
import { Search } from "./views/Search";
import { Pipeline } from "./views/Pipeline";
import { Settings } from "./views/Settings";
import { LeadDrawer } from "./components/LeadDrawer";
import { IconBoard, IconFeed, IconGear, IconSearch } from "./components/shared";

type View = "feed" | "search" | "pipeline" | "settings";

const NAV: { id: View; label: string; icon: React.ReactNode }[] = [
  { id: "feed", label: "Daily Feed", icon: <IconFeed /> },
  { id: "search", label: "Lead Search", icon: <IconSearch /> },
  { id: "pipeline", label: "Pipeline", icon: <IconBoard /> },
  { id: "settings", label: "Settings", icon: <IconGear /> },
];

export default function App() {
  const [view, setView] = useState<View>("feed");
  const [leads, setLeads] = useState<Lead[]>(SEED_LEADS);
  const [openId, setOpenId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const notify = useCallback((msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  const updateLead = useCallback((updated: Lead) => {
    setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
  }, []);

  const setStage = useCallback((id: string, stage: Stage) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, stage } : l)));
  }, []);

  const openLead = useMemo(() => leads.find((l) => l.id === openId) ?? null, [leads, openId]);

  const feedCount = leads.filter(
    (l) => leadTypeMeta(l.leadType).classification === "warm" && l.stage !== "closed" && scoreOf(l) >= 55,
  ).length;
  const hotCount = leads.filter((l) => tierOf(scoreOf(l)) === "hot").length;

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">P</div>
          <div>
            <div className="brand-name">Prospect<em>IQ</em></div>
            <div className="brand-sub">Lead intelligence</div>
          </div>
        </div>
        <nav className="nav">
          {NAV.map((n) => (
            <button
              key={n.id}
              className={`nav-item ${view === n.id ? "active" : ""}`}
              onClick={() => setView(n.id)}
            >
              {n.icon}
              {n.label}
              {n.id === "feed" && feedCount > 0 && <span className="nav-count">{feedCount}</span>}
              {n.id === "pipeline" && hotCount > 0 && <span className="nav-count">{hotCount} hot</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="agent-chip">
            <div className="agent-avatar">MT</div>
            <div>
              <div className="agent-name">Marcus Tran</div>
              <div className="agent-role">Solo agent · Charlotte, NC</div>
            </div>
          </div>
          <strong>Equal Housing Opportunity.</strong> All numbers DNC-scrubbed. Agent-initiated
          outreach only. Searches logged 24 months.
        </div>
      </aside>

      <main className="main" key={view}>
        {view === "feed" && <Feed leads={leads} onOpen={setOpenId} />}
        {view === "search" && <Search leads={leads} onOpen={setOpenId} notify={notify} />}
        {view === "pipeline" && <Pipeline leads={leads} onOpen={setOpenId} onStageChange={setStage} />}
        {view === "settings" && <Settings notify={notify} />}
      </main>

      {openLead && (
        <LeadDrawer
          lead={openLead}
          onClose={() => setOpenId(null)}
          onUpdate={updateLead}
          notify={notify}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
