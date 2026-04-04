import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { memoryDb } from "@/lib/mock-db";
import { createAutoClaim, createPayout } from "@/lib/engine";
import { ClaimModel } from "@/models/Claim";
import { PayoutModel } from "@/models/Payout";

export async function POST(req: Request) {
  const body = await req.json();

  const claim = createAutoClaim({
    risk: body.risk,
    reason: body.reason ?? "NONE",
    fraud: {
      fraudScore: 20,
      movementScore: 80,
      claimFrequency: 20,
      locationAnomaly: 12,
      status: body.fraudStatus
    },
    coverage: body.coverage
  });

  if (!claim) {
    return NextResponse.json({ claim: null, payout: null });
  }

  memoryDb.claims.unshift(claim);

  let payout = null;
  if (claim.status === "PAID") {
    payout = createPayout(claim.id, claim.payoutAmount);
  }

  if (payout) {
    memoryDb.payouts.unshift(payout);
  }

  const conn = await connectToDatabase();
  if (conn) {
    await ClaimModel.create({
      userId: body.userId,
      risk: claim.risk,
      reason: claim.reason,
      fraudStatus: claim.fraudStatus,
      status: claim.status,
      payoutAmount: claim.payoutAmount,
      timeline: claim.timeline
    });
    if (payout) {
      await PayoutModel.create({ claimId: payout.claimId, amount: payout.amount });
    }
  }

  return NextResponse.json({ claim, payout });
}
