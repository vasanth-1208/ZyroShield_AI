import { ClaimRecord, EnvironmentMetrics, PlanOption, PayoutRecord, UserProfile } from "@/lib/types";
import { FraudResult } from "@/lib/types";

interface MockDb {
  user: UserProfile | null;
  plan: PlanOption | null;
  metrics: EnvironmentMetrics;
  claims: ClaimRecord[];
  payouts: PayoutRecord[];
  fraud: FraudResult | null;
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
    aqi: 140
  },
  claims: [],
  payouts: [],
  fraud: null
};

export const memoryDb = global.zyroMemory ?? seed;

if (!global.zyroMemory) {
  global.zyroMemory = memoryDb;
}
