export type RiskStatus = "LOW" | "HIGH";
export type ClaimStatus = "IDLE" | "TRIGGERED" | "PENDING" | "APPROVED" | "REJECTED" | "PAID" | "UNDER_REVIEW";
export type FraudStatus = "SAFE" | "UNDER REVIEW" | "FRAUD";
export type PolicyStatus = "ACTIVE" | "CANCELLED" | "EXPIRED";
export type DisruptionReason = "HEAVY_RAIN" | "HEATWAVE" | "POLLUTION" | "FLOOD_ALERT" | "CURFEW_TRAFFIC" | "NONE";
export type WorkingZone = "LOW_RISK" | "MEDIUM_RISK" | "HIGH_RISK";
export type VehicleType = "BIKE" | "SCOOTER" | "BICYCLE" | "E_BIKE";
export type ConfidenceLevel = "LOW" | "MEDIUM" | "HIGH";

export interface UserProfile {
  id: string;
  name: string;
  city: string;
  dailyIncome: number;
  vehicleType: VehicleType;
  workingZone: WorkingZone;
  safeHistoryScore: number;
}

export interface PlanOption {
  code: "BASIC" | "STANDARD" | "PRO";
  name: string;
  premium: number;
  coverage: number;
  recommended?: boolean;
}

export interface PolicyRecord {
  id: string;
  planCode: PlanOption["code"];
  planName: string;
  coverage: number;
  weeklyPremium: number;
  aiAdjustedPremium: number;
  status: PolicyStatus;
  startDate: string;
  endDate: string;
  renewedFromId?: string;
}

export interface EnvironmentMetrics {
  rainfall: number;
  temperature: number;
  aqi: number;
  floodAlert: boolean;
  curfewTrafficAlert: boolean;
}

export interface FraudResult {
  fraudScore: number;
  fraudProbability?: number;
  movementScore: number;
  claimFrequency: number;
  locationAnomaly: number;
  deviceConsistencyScore?: number;
  behaviorAnomalyScore?: number;
  riskLevel?: "LOW" | "MEDIUM" | "HIGH";
  confidence?: ConfidenceLevel;
  status: FraudStatus;
}

export interface ClaimRecord {
  id: string;
  date: string;
  risk: RiskStatus;
  reason: DisruptionReason;
  fraudStatus: FraudStatus;
  status: ClaimStatus;
  payoutAmount: number;
  deductible?: number;
  eligibleAmount?: number;
  approvalReason?: string;
  rejectionReason?: string;
  confidenceScore?: number;
  timeline: Array<{ step: string; status: "done" | "active" | "pending"; timestamp?: string }>;
}

export interface PayoutRecord {
  id: string;
  date: string;
  amount: number;
  claimId: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  level: "info" | "success" | "warning";
  category?: "POLICY" | "RISK" | "PREMIUM" | "CLAIM" | "FRAUD" | "PAYMENT" | "SYSTEM";
  read?: boolean;
  date: string;
}

export interface EconomicsSummary {
  hourlyIncome: number;
  weeklyWorkingHours: number;
  weeklyRiskExposureHours: number;
  incomeLossPerDisruption: number;
  incomeAtRiskWeekly: number;
  recommendedCoverage: number;
  recommendedPremium: number;
}

export interface PremiumModelBreakdown {
  riskProbability: number;
  expectedLoss: number;
  riskLoading: number;
  platformCost: number;
  claimHistoryLoad: number;
  safetyMargin: number;
  finalPremium: number;
}

export interface AiDecision {
  probability: number;
  confidence: ConfidenceLevel;
  decision: string;
  reason: string;
}

export interface AiDecisionInsights {
  risk: AiDecision;
  fraud: AiDecision;
  premium: AiDecision;
  claim: AiDecision;
}
