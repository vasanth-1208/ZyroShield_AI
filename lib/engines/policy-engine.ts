import { ClaimRecord, DisruptionReason, PolicyRecord } from "@/lib/types";
import { POLICY_EXCLUSIONS, POLICY_TERMS } from "@/lib/insurance";

interface EligibilityInput {
  policy: PolicyRecord | null;
  reason: DisruptionReason;
  rainfall: number;
  estimatedLoss: number;
  declaredCoverage: number;
  bypassWaitingPeriod?: boolean;
  isWorkerOnline: boolean;
  isDeviceOn: boolean;
  isInZone: boolean;
  isPersonalLeave: boolean;
  isPlatformOutageWeatherRelated: boolean;
  paidClaimsLast7Days: number;
}

export function evaluateClaimEligibility(input: EligibilityInput) {
  if (!input.policy || input.policy.status !== "ACTIVE") {
    return { eligible: false, reason: "No active policy" };
  }

  const start = new Date(input.policy.startDate).getTime();
  const hoursSinceStart = (Date.now() - start) / (1000 * 60 * 60);
  if (!input.bypassWaitingPeriod && hoursSinceStart < POLICY_TERMS.waitingPeriodHours) {
    return { eligible: false, reason: `Waiting period of ${POLICY_TERMS.waitingPeriodHours}h not completed` };
  }

  if (input.paidClaimsLast7Days >= POLICY_TERMS.maxPaidClaimsPerWeek) {
    return { eligible: false, reason: "Weekly paid claim limit reached" };
  }

  if (!input.isWorkerOnline) return { eligible: false, reason: POLICY_EXCLUSIONS[0] };
  if (!input.isDeviceOn) return { eligible: false, reason: POLICY_EXCLUSIONS[1] };
  if (!input.isInZone) return { eligible: false, reason: POLICY_EXCLUSIONS[3] };
  if (input.isPersonalLeave) return { eligible: false, reason: POLICY_EXCLUSIONS[5] };
  if (!input.isPlatformOutageWeatherRelated) return { eligible: false, reason: POLICY_EXCLUSIONS[6] };
  if (input.reason === "HEAVY_RAIN" && input.rainfall < POLICY_TERMS.minRainfallThreshold) {
    return { eligible: false, reason: POLICY_EXCLUSIONS[4] };
  }
  if (input.declaredCoverage > POLICY_TERMS.coverageLimitPerClaim) {
    return { eligible: false, reason: "Coverage limit exceeded for this policy" };
  }
  if (input.estimatedLoss <= POLICY_TERMS.deductible) {
    return { eligible: false, reason: "Loss is below deductible threshold" };
  }

  return { eligible: true, reason: "Eligible" };
}

export function countPaidClaimsLast7Days(claims: ClaimRecord[]) {
  const now = Date.now();
  return claims.filter((claim) => {
    const ageDays = (now - new Date(claim.date).getTime()) / (1000 * 60 * 60 * 24);
    return ageDays <= 7 && claim.status === "PAID";
  }).length;
}
