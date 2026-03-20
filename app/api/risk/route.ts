import { NextResponse } from "next/server";
import { evaluateRisk, simulateMetrics } from "@/lib/engine";
import { memoryDb } from "@/lib/mock-db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("simulate") ?? undefined;

  const metrics = simulateMetrics(mode);
  const risk = evaluateRisk(metrics);
  memoryDb.metrics = metrics;

  return NextResponse.json({ metrics, risk });
}
