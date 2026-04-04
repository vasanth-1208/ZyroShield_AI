import { ClaimRecord, FraudResult, RiskStatus, UserProfile, WorkingZone } from "@/lib/types";
import { RISK_ZONE_FACTORS } from "@/lib/insurance";
import { predictPremiumAdjustment } from "@/lib/ml";

export interface PremiumBreakdown {
  premium: number;
  components: {
    expectedLoss: number;
    riskLoading: number;
    operationalCost: number;
    historyAdjustment: number;
    fraudAdjustment: number;
    safetyDiscount: number;
  };
  expectedWeeklyLoss: number;
}

export function calculatePremium(riskProbability: number, payoutAmount: number, claimHistory: ClaimRecord[]) {
  const expectedLoss = riskProbability * payoutAmount;
  const riskLoading = expectedLoss * 0.25;
  const operationalCost = 8;
  const claimLoad = Math.min(12, claimHistory.length * 2);

  const premium = expectedLoss + riskLoading + operationalCost + claimLoad;
  return Math.max(20, Math.round(premium));
}

export function calculateDynamicPremium(
  user: UserProfile,
  risk: RiskStatus,
  claims: ClaimRecord[],
  fraud: FraudResult | null
) {
  return calculateDynamicPremiumBreakdown(user, risk, claims, fraud).premium;
}

export function calculateDynamicPremiumBreakdown(
  user: UserProfile,
  risk: RiskStatus,
  claims: ClaimRecord[],
  fraud: FraudResult | null
): PremiumBreakdown {
  const zoneFactor = zoneFactorFor(user.workingZone);
  const payoutBasis = Math.max(300, user.dailyIncome * 0.7);
  const riskProbability = risk === "HIGH" ? 0.48 : 0.14;

  const expectedLoss = riskProbability * payoutBasis * zoneFactor;
  const riskLoading = expectedLoss * 0.25;
  const operationalCost = 8;

  const historyAdjustment = claims.length >= 4 ? 12 : claims.length === 0 ? -4 : claims.length * 2;
  const fraudAdjustment = fraud ? Math.round(14 * (fraud.fraudScore / 100)) : 0;
  const safetyDiscount = user.safeHistoryScore >= 80 ? -5 : 0;

  const mlAdjustment = predictPremiumAdjustment({
    riskProbability,
    claimCount: claims.length,
    fraudProbability: fraud ? fraud.fraudScore / 100 : 0.2,
    safeScore: user.safeHistoryScore
  });

  const premium = Math.max(
    20,
    Math.round(expectedLoss + riskLoading + operationalCost + historyAdjustment + fraudAdjustment + safetyDiscount + mlAdjustment)
  );

  return {
    premium,
    components: {
      expectedLoss: Math.round(expectedLoss),
      riskLoading: Math.round(riskLoading),
      operationalCost,
      historyAdjustment,
      fraudAdjustment,
      safetyDiscount
    },
    expectedWeeklyLoss: Math.round(expectedLoss)
  };
}

function zoneFactorFor(zone: WorkingZone) {
  return RISK_ZONE_FACTORS[zone] ?? 1;
}
