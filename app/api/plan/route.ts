import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { memoryDb } from "@/lib/mock-db";
import { PlanModel } from "@/models/Plan";

export async function POST(req: Request) {
  const body = await req.json();
  const start = new Date();
  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  const plan = {
    code: body.code,
    name: body.name,
    premium: body.premium,
    coverage: body.coverage,
    aiAdjustedPremium: Number(body.aiAdjustedPremium ?? body.premium),
    status: "ACTIVE",
    startDate: start.toISOString(),
    endDate: end.toISOString()
  };

  memoryDb.plan = {
    code: plan.code,
    name: plan.name,
    premium: plan.premium,
    coverage: plan.coverage
  };

  const conn = await connectToDatabase();
  if (conn) {
    await PlanModel.create({ ...plan, userId: body.userId });
  }

  return NextResponse.json({ plan });
}
