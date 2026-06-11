export type Classification = "warm" | "cold";

export type Tier = "hot" | "warm" | "cold" | "low";

export type Stage = "new" | "contacted" | "appointment" | "closed";

export type LeadTypeId =
  | "expired"
  | "fsbo"
  | "form_fill"
  | "home_value"
  | "life_event"
  | "relocation"
  | "past_client"
  | "high_equity"
  | "long_term"
  | "absentee"
  | "pre_foreclosure"
  | "probate"
  | "absentee_landlord"
  | "empty_nester"
  | "investor";

export interface LeadTypeMeta {
  id: LeadTypeId;
  label: string;
  classification: Classification;
  blurb: string;
}

/** Per-category signal strength, 0–1. Composite score is derived from these. */
export interface SignalStrengths {
  intent: number;
  lifeEvent: number;
  property: number;
  marketTiming: number;
  contactQuality: number;
}

export interface Signal {
  category: keyof SignalStrengths;
  text: string;
}

export interface PropertyData {
  type: string;
  beds: number;
  baths: number;
  sqft: number;
  yearBuilt: number;
  estValue: number;
  assessedValue: number;
  equityPct: number;
  ownershipYears: number;
  lastSalePrice: number;
  lastSaleDate: string;
}

export interface ContactInfo {
  phone?: string;
  phoneVerified: boolean;
  dncStatus: "clear" | "listed";
  email?: string;
  emailVerified: boolean;
  consent: "opt_in" | "none";
}

export interface Note {
  date: string;
  text: string;
}

export interface Lead {
  id: string;
  ownerName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  leadType: LeadTypeId;
  strengths: SignalStrengths;
  reasoning: string;
  signals: Signal[];
  property: PropertyData;
  contact: ContactInfo;
  source: string;
  stage: Stage;
  tags: string[];
  notes: Note[];
  reminder?: string;
  surfacedAt: string;
}

export const CATEGORY_WEIGHTS: Record<keyof SignalStrengths, number> = {
  intent: 0.35,
  lifeEvent: 0.25,
  property: 0.2,
  marketTiming: 0.15,
  contactQuality: 0.05,
};

export const CATEGORY_LABELS: Record<keyof SignalStrengths, string> = {
  intent: "Intent",
  lifeEvent: "Life Event",
  property: "Property Data",
  marketTiming: "Market Timing",
  contactQuality: "Contact Quality",
};

export function scoreOf(lead: Lead): number {
  const s = lead.strengths;
  return Math.round(
    (Object.keys(CATEGORY_WEIGHTS) as (keyof SignalStrengths)[]).reduce(
      (sum, k) => sum + s[k] * CATEGORY_WEIGHTS[k] * 100,
      0,
    ),
  );
}

export function tierOf(score: number): Tier {
  if (score >= 80) return "hot";
  if (score >= 55) return "warm";
  if (score >= 25) return "cold";
  return "low";
}

export const TIER_LABELS: Record<Tier, string> = {
  hot: "Hot",
  warm: "Warm",
  cold: "Cold",
  low: "Low",
};

export const TIER_GUIDANCE: Record<Tier, string> = {
  hot: "Priority outreach within 24 hours",
  warm: "Follow up within 72 hours",
  cold: "Add to nurture sequence",
  low: "Low priority — monitor",
};

export const STAGE_LABELS: Record<Stage, string> = {
  new: "New",
  contacted: "Contacted",
  appointment: "Appointment Set",
  closed: "Closed",
};
