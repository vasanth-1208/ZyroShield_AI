import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { memoryDb } from "@/lib/mock-db";
import { ClaimRecord, ClaimStatus } from "@/lib/types";
import { ClaimModel } from "@/models/Claim";
import { PayoutModel } from "@/models/Payout";

export async function POST(req: Request) {
  const body = await req.json();

  const approved = body.risk === "HIGH" && body.fraudStatus === "SAFE";
  const review = body.risk === "HIGH" && body.fraudStatus !== "SAFE";

  const claimStatus: ClaimStatus = approved ? "APPROVED" : review ? "UNDER_REVIEW" : "TRIGGERED";

  const claim: ClaimRecord = {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    risk: body.risk,
    fraudStatus: body.fraudStatus,
    status: claimStatus,
    payoutAmount: approved ? body.coverage : 0
  };

  memoryDb.claims.unshift(claim);

  let payout = null;
  if (approved) {
    payout = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      amount: body.coverage,
      claimId: claim.id
    };
    memoryDb.payouts.unshift(payout);
  }

  const conn = await connectToDatabase();
  if (conn) {
    await ClaimModel.create({
      userId: body.userId,
      risk: claim.risk,
      fraudStatus: claim.fraudStatus,
      status: claim.status,
      payoutAmount: claim.payoutAmount
    });
    if (payout) {
      await PayoutModel.create({ claimId: payout.claimId, amount: payout.amount });
    }
  }

  return NextResponse.json({ claim, payout });
}
