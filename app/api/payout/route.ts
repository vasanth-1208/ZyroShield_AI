import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { memoryDb } from "@/lib/mock-db";
import { PayoutModel } from "@/models/Payout";

export async function GET() {
  const conn = await connectToDatabase();

  if (conn) {
    const payouts = await PayoutModel.find().sort({ createdAt: -1 }).limit(20).lean();
    const mapped = payouts.map((p) => ({
      id: String(p._id),
      date: (p.createdAt as Date).toISOString(),
      amount: p.amount,
      claimId: p.claimId
    }));
    return NextResponse.json({ payouts: mapped });
  }

  return NextResponse.json({ payouts: memoryDb.payouts });
}
