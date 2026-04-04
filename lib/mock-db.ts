import {
  AiDecisionInsights,
  ClaimRecord,
  EconomicsSummary,
  EnvironmentMetrics,
  FraudResult,
  NotificationItem,
  PremiumModelBreakdown,
  PlanOption,
  PolicyRecord,
  PayoutRecord,
  UserProfile
} from "@/lib/types";

interface MockDb {
  user: UserProfile | null;
  plan: PlanOption | null;
  metrics: EnvironmentMetrics;
  claims: ClaimRecord[];
  payouts: PayoutRecord[];
  fraud: FraudResult | null;
  policies: PolicyRecord[];
  notifications: NotificationItem[];
  premiumHistory: Array<{ date: string; premium: number }>;
  riskHistory: Array<{ date: string; probability: number; risk: "LOW" | "HIGH" }>;
  fraudHistory: Array<{ date: string; score: number; probability: number; level: "LOW" | "MEDIUM" | "HIGH" }>;
  walletBalance: number;
  economics: EconomicsSummary | null;
  premiumModel: PremiumModelBreakdown | null;
  aiInsights: AiDecisionInsights | null;
}

declare global {
  // eslint-disable-next-line no-var
  var zyroMemory: MockDb | undefined;
}

const seed: MockDb = {
  user: null,
  plan: null,
  metrics: {
    rainfall: 20,
    temperature: 31,
    aqi: 140,
    floodAlert: false,
    curfewTrafficAlert: false
  },
  claims: [],
  payouts: [],
  fraud: null,
  policies: [],
  notifications: [],
  premiumHistory: [],
  riskHistory: [],
  fraudHistory: [],
  walletBalance: 0,
  economics: null,
  premiumModel: null,
  aiInsights: null
};

export const memoryDb = global.zyroMemory ?? seed;

if (!global.zyroMemory) {
  global.zyroMemory = memoryDb;
}
