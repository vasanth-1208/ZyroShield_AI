import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { memoryDb } from "@/lib/mock-db";
import { PlanModel } from "@/models/Plan";

export async function POST(req: Request) {
  const body = await req.json();
  const plan = {
    code: body.code,
    name: body.name,
    premium: body.premium,
    coverage: body.coverage
  };

  memoryDb.plan = plan;

  const conn = await connectToDatabase();
  if (conn) {
    await PlanModel.create({ ...plan, userId: body.userId });
  }

  return NextResponse.json({ plan });
}
