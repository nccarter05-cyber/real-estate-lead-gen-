import type { Classification, Tier } from "../types";
import { TIER_LABELS, tierOf } from "../types";

const TIER_COLORS: Record<Tier, string> = {
  hot: "var(--hot)",
  warm: "var(--warm)",
  cold: "var(--cold)",
  low: "var(--low)",
};

export function tierColor(score: number): string {
  return TIER_COLORS[tierOf(score)];
}

export function ScoreDial({ score, size = 44 }: { score: number; size?: number }) {
  const color = tierColor(score);
  const deg = (score / 100) * 360;
  return (
    <div
      className="dial"
      style={{ width: size, height: size }}
      title={`Score ${score} / 100 — ${TIER_LABELS[tierOf(score)]}`}
    >
      <div
        className="dial-ring"
        style={{
          background: `conic-gradient(${color} ${deg}deg, var(--paper-deep) ${deg}deg)`,
        }}
      />
      <span className="dial-num" style={{ color, fontSize: size * 0.32 }}>
        {score}
      </span>
    </div>
  );
}

export function TierPill({ score }: { score: number }) {
  const tier = tierOf(score);
  return <span className={`tier-pill tier-${tier}`}>{TIER_LABELS[tier]}</span>;
}

export function ClassChip({ classification }: { classification: Classification }) {
  return (
    <span className={`chip ${classification === "warm" ? "chip-warm-class" : "chip-cold-class"}`}>
      {classification === "warm" ? "● Warm lead" : "● Cold lead"}
    </span>
  );
}

export const fmtMoney = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M` : `$${Math.round(n / 1000)}K`;

export const fmtDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

/* --- icons (inline, stroke-based) --- */
type IconProps = { size?: number };
const ic = (size = 17) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export const IconFeed = ({ size }: IconProps) => (
  <svg {...ic(size)} className="nav-ico"><path d="M12 3l9 7-1 1-1-.7V20a1 1 0 0 1-1 1h-4v-6h-4v6H6a1 1 0 0 1-1-1v-9.7l-1 .7-1-1 9-7z" /></svg>
);
export const IconSearch = ({ size }: IconProps) => (
  <svg {...ic(size)} className="nav-ico"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);
export const IconBoard = ({ size }: IconProps) => (
  <svg {...ic(size)} className="nav-ico"><rect x="3" y="3" width="7" height="13" rx="1.5" /><rect x="14" y="3" width="7" height="8" rx="1.5" /></svg>
);
export const IconGear = ({ size }: IconProps) => (
  <svg {...ic(size)} className="nav-ico"><circle cx="12" cy="12" r="3.2" /><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2-1.2L14.2 3h-4l-.4 2.5a7 7 0 0 0-2 1.2l-2.3-1-2 3.4 2 1.5a7 7 0 0 0 0 2.4l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2 1.2l.4 2.5h4l.4-2.5a7 7 0 0 0 2-1.2l2.3 1 2-3.4-2-1.5c.07-.4.1-.8.1-1.2z" /></svg>
);
export const IconPhone = ({ size }: IconProps) => (
  <svg {...ic(size)}><path d="M5 4h4l1.5 4L8 9.5a12 12 0 0 0 6.5 6.5L16 14l4 1.5v4a1.5 1.5 0 0 1-1.6 1.5C10.8 20.4 3.6 13.2 3 5.6A1.5 1.5 0 0 1 4.5 4z" /></svg>
);
export const IconMail = ({ size }: IconProps) => (
  <svg {...ic(size)}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
);
export const IconBell = ({ size }: IconProps) => (
  <svg {...ic(size)}><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" /><path d="M10 20a2 2 0 0 0 4 0" /></svg>
);
export const IconExport = ({ size }: IconProps) => (
  <svg {...ic(size)}><path d="M12 15V3" /><path d="m7 8 5-5 5 5" /><path d="M5 15v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" /></svg>
);
export const IconPin = ({ size }: IconProps) => (
  <svg {...ic(size)}><path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11z" /><circle cx="12" cy="10" r="2.6" /></svg>
);
