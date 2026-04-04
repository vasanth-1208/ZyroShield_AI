import { DisruptionReason, WorkingZone } from "@/lib/types";

export const POLICY_TERMS = {
  deductible: 100,
  waitingPeriodHours: 24,
  coverageLimitPerClaim: 1400,
  maxPaidClaimsPerWeek: 2,
  minRainfallThreshold: 50,
  eligibleZones: ["LOW_RISK", "MEDIUM_RISK", "HIGH_RISK"] as WorkingZone[]
};

export const POLICY_EXCLUSIONS = [
  "Worker offline voluntarily during disruption window",
  "Device switched off or telemetry unavailable",
  "Fraud detected by anomaly model",
  "Worker outside registered delivery zone",
  "Minor rain below trigger threshold",
  "Personal leave day or non-working day",
  "Platform server outage unrelated to weather"
];

export const POLICY_COVERAGE = [
  "Income loss protection for disruption-led work stoppage",
  "Parametric triggers: Rain, Heatwave, AQI, Flood alert, Curfew/Traffic",
  "Automatic claim creation and payout for eligible events"
];

export const CLAIM_ELIGIBILITY_RULES = [
  "Active policy required",
  "Waiting period must be completed",
  "Disruption threshold must be met",
  "Worker must be online and inside registered zone",
  "Claim frequency limit not exceeded"
];

export const RISK_ZONE_FACTORS: Record<WorkingZone, number> = {
  LOW_RISK: 0.9,
  MEDIUM_RISK: 1.0,
  HIGH_RISK: 1.25
};

export const AI_TRANSPARENCY_NOTE =
  "Current release uses explainable ML-inspired scoring with logistic and anomaly-style models for transparent decisions.";

export const DISRUPTION_LABELS: Record<DisruptionReason, string> = {
  HEAVY_RAIN: "Heavy Rain",
  HEATWAVE: "Heatwave",
  POLLUTION: "Pollution Spike",
  FLOOD_ALERT: "Flood Alert",
  CURFEW_TRAFFIC: "Traffic/Curfew",
  NONE: "No Disruption"
};
