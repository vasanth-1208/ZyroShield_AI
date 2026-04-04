import { ClaimRecord, ClaimStatus, DisruptionReason, FraudResult, RiskStatus } from "@/lib/types";

export function buildClaimTimeline(status: ClaimStatus) {
  const now = new Date().toISOString();
  return [
    { step: "Disruption detected", status: "done" as const, timestamp: now },
    { step: "Risk marked HIGH", status: "done" as const, timestamp: now },
    { step: "Claim auto-created", status: "done" as const, timestamp: now },
    {
      step: "Fraud check",
      status: status === "PENDING" ? "active" as const : "done" as const,
      timestamp: now
    },
    {
      step: "Claim decision",
      status: status === "APPROVED" || status === "REJECTED" || status === "PAID" ? "done" as const : "pending" as const,
      timestamp: status === "APPROVED" || status === "REJECTED" || status === "PAID" ? now : undefined
    },
    {
      step: "Payout processed",
      status: status === "PAID" ? "done" as const : "pending" as const,
      timestamp: status === "PAID" ? now : undefined
    },
    {
      step: "User notified",
      status: status === "PAID" ? "done" as const : "pending" as const,
      timestamp: status === "PAID" ? now : undefined
    }
  ];
}

export function createAutoClaim(params: {
  risk: RiskStatus;
  reason: DisruptionReason;
  fraud: FraudResult;
  coverage: number;
}): ClaimRecord | null {
  if (params.risk !== "HIGH") return null;

  let status: ClaimStatus = "PENDING";
  let payoutAmount = 0;

  if (params.fraud.status === "SAFE") {
    status = "PAID";
    payoutAmount = params.coverage;
  } else if (params.fraud.status === "UNDER REVIEW") {
    status = "PENDING";
  } else {
    status = "REJECTED";
  }

  return {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    risk: params.risk,
    reason: params.reason,
    fraudStatus: params.fraud.status,
    status,
    payoutAmount,
    timeline: buildClaimTimeline(status)
  };
}
