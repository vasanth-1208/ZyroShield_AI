export type RiskStatus = "LOW" | "HIGH";
export type ClaimStatus = "IDLE" | "TRIGGERED" | "APPROVED" | "UNDER_REVIEW";
export type FraudStatus = "SAFE" | "UNDER REVIEW" | "FRAUD";

export interface UserProfile {
  id: string;
  name: string;
  city: string;
  income: number;
}

export interface PlanOption {
  code: "BASIC" | "STANDARD" | "PRO";
  name: string;
  premium: number;
  coverage: number;
  recommended?: boolean;
}

export interface EnvironmentMetrics {
  rainfall: number;
  temperature: number;
  aqi: number;
}

export interface FraudResult {
  fraudScore: number;
  movementScore: number;
  claimFrequency: number;
  locationAnomaly: number;
  status: FraudStatus;
}

export interface ClaimRecord {
  id: string;
  date: string;
  risk: RiskStatus;
  fraudStatus: FraudStatus;
  status: ClaimStatus;
  payoutAmount: number;
}

export interface PayoutRecord {
  id: string;
  date: string;
  amount: number;
  claimId: string;
}
