import { useMemo, useState } from "react";
import type { Lead, LeadTypeId } from "../types";
import { scoreOf } from "../types";
import { LEAD_TYPES, leadTypeMeta } from "../data";
import { ClassChip, IconExport, IconSearch, ScoreDial, fmtMoney } from "../components/shared";

interface Props {
  leads: Lead[];
  onOpen: (id: string) => void;
  notify: (msg: string) => void;
}

const PROPERTY_TYPES = ["Any", "Single Family", "Condo", "Townhouse", "Duplex", "Bungalow", "Ranch"];

export function Search({ leads, onOpen, notify }: Props) {
  const [query, setQuery] = useState("");
  const [activeTypes, setActiveTypes] = useState<Set<LeadTypeId>>(new Set());
  const [minEquity, setMinEquity] = useState(0);
  const [minOwnership, setMinOwnership] = useState(0);
  const [propType, setPropType] = useState("Any");

  const toggleType = (id: LeadTypeId) =>
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads
      .filter((l) => {
        if (q && !(l.zip.startsWith(q) || l.city.toLowerCase().includes(q) || l.address.toLowerCase().includes(q) || l.ownerName.toLowerCase().includes(q))) return false;
        if (activeTypes.size > 0 && !activeTypes.has(l.leadType)) return false;
        if (l.property.equityPct < minEquity) return false;
        if (l.property.ownershipYears < minOwnership) return false;
        if (propType !== "Any" && l.property.type !== propType) return false;
        return true;
      })
      .map((l) => ({ lead: l, score: scoreOf(l) }))
      .sort((a, b) => b.score - a.score);
  }, [leads, query, activeTypes, minEquity, minOwnership, propType]);

  const exportCsv = () => {
    const header = ["ID", "Owner", "Address", "City", "State", "Zip", "Lead Type", "Classification", "Score", "Equity %", "Owned Yrs", "Est Value", "Phone", "DNC Status", "Source"];
    const rows = results.map(({ lead, score }) => {
      const meta = leadTypeMeta(lead.leadType);
      return [lead.id, lead.ownerName, lead.address, lead.city, lead.state, lead.zip, meta.label, meta.classification, score, lead.property.equityPct, lead.property.ownershipYears, lead.property.estValue, lead.contact.phone ?? "", lead.contact.dncStatus, lead.source];
    });
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `prospectiq-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    notify(`Exported ${results.length} leads to CSV`);
  };

  const warmTypes = LEAD_TYPES.filter((t) => t.classification === "warm");
  const coldTypes = LEAD_TYPES.filter((t) => t.classification === "cold");

  return (
    <div>
      <header className="page-head rise">
        <span className="overline">Lead search</span>
        <h1 className="page-title">Find your next <em>conversation.</em></h1>
      </header>

      <div className="search-bar rise" style={{ animationDelay: "0.05s" }}>
        <div className="search-input-wrap">
          <IconSearch size={17} />
          <input
            className="search-input"
            placeholder="Search by zip code, city, address, or owner name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search leads"
          />
        </div>
        <button className="btn" onClick={exportCsv} disabled={results.length === 0}>
          <IconExport size={14} /> Export CSV
        </button>
      </div>

      <div className="type-groups rise" style={{ animationDelay: "0.1s" }}>
        <div className="type-group">
          <div className="type-group-head">
            <span className="type-dot" style={{ background: "var(--warm)" }} />
            <span className="overline">Warm lead types — shown intent</span>
          </div>
          <div className="type-chips">
            {warmTypes.map((t) => (
              <button
                key={t.id}
                className={`type-chip ${activeTypes.has(t.id) ? "on-warm" : ""}`}
                onClick={() => toggleType(t.id)}
                title={t.blurb}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="type-group">
          <div className="type-group-head">
            <span className="type-dot" style={{ background: "var(--cold)" }} />
            <span className="overline">Cold lead types — profile match</span>
          </div>
          <div className="type-chips">
            {coldTypes.map((t) => (
              <button
                key={t.id}
                className={`type-chip ${activeTypes.has(t.id) ? "on-cold" : ""}`}
                onClick={() => toggleType(t.id)}
                title={t.blurb}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="adv-filters rise" style={{ animationDelay: "0.14s" }}>
        <span className="overline">Refine</span>
        <div className="adv-filter">
          <label>Min equity</label>
          <input type="range" min={0} max={90} step={10} value={minEquity} onChange={(e) => setMinEquity(+e.target.value)} />
          <span className="mono">{minEquity}%+</span>
        </div>
        <div className="adv-filter">
          <label>Owned</label>
          <input type="range" min={0} max={25} step={5} value={minOwnership} onChange={(e) => setMinOwnership(+e.target.value)} />
          <span className="mono">{minOwnership}+ yrs</span>
        </div>
        <div className="adv-filter">
          <label>Property type</label>
          <select value={propType} onChange={(e) => setPropType(e.target.value)}>
            {PROPERTY_TYPES.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
        {(minEquity > 0 || minOwnership > 0 || propType !== "Any" || activeTypes.size > 0) && (
          <button
            className="btn btn-sm btn-ghost"
            onClick={() => { setMinEquity(0); setMinOwnership(0); setPropType("Any"); setActiveTypes(new Set()); }}
          >
            Reset filters
          </button>
        )}
      </div>

      <div className="results-head rise" style={{ animationDelay: "0.18s" }}>
        <span className="results-count"><strong>{results.length}</strong> leads match</span>
        <span className="overline">Sorted by score</span>
      </div>

      {results.length === 0 ? (
        <div className="empty-state rise">
          <div className="empty-title">No leads match these filters.</div>
          Try widening your equity range or clearing a lead type.
        </div>
      ) : (
        <>
          <div className="results-cols">
            <span className="rr-col-label">Score</span>
            <span className="rr-col-label">Owner / Address</span>
            <span className="rr-col-label">Lead type</span>
            <span className="rr-col-label">Equity</span>
            <span className="rr-col-label">Est. value</span>
            <span className="rr-col-label">Class</span>
          </div>
          <div className="results rise" style={{ animationDelay: "0.2s" }}>
            {results.map(({ lead, score }) => {
              const meta = leadTypeMeta(lead.leadType);
              return (
                <button className="result-row" key={lead.id} onClick={() => onOpen(lead.id)}>
                  <ScoreDial score={score} size={40} />
                  <div>
                    <div className="rr-name">{lead.ownerName}</div>
                    <div className="rr-sub">{lead.address} · {lead.city} {lead.zip}</div>
                  </div>
                  <div className="rr-sub rr-hide-mobile" style={{ fontSize: 12.5, color: "var(--ink-2)" }}>{meta.label}</div>
                  <div className="rr-val rr-hide-mobile">{lead.property.equityPct}%</div>
                  <div className="rr-val rr-hide-mobile">{fmtMoney(lead.property.estValue)}</div>
                  <div><ClassChip classification={meta.classification} /></div>
                </button>
              );
            })}
          </div>
          <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <TierLegend />
          </div>
        </>
      )}
    </div>
  );
}

function TierLegend() {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <span className="overline">Tiers</span>
      <span className="tier-pill tier-hot">Hot 80–100</span>
      <span className="tier-pill tier-warm">Warm 55–79</span>
      <span className="tier-pill tier-cold">Cold 25–54</span>
      <span className="tier-pill tier-low">Low 0–24</span>
    </div>
  );
}

export { TierLegend };
