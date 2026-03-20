import { NextResponse } from "next/server";
import { runFraudChecks } from "@/lib/engine";

export async function POST(req: Request) {
  const body = await req.json();
  if (body.simulateFraud) {
    return NextResponse.json({
      fraud: {
        fraudScore: 92,
        movementScore: 18,
        claimFrequency: 88,
        locationAnomaly: 94,
        status: "FRAUD"
      }
    });
  }
  const fraud = runFraudChecks(body.claimCount ?? 1);
  return NextResponse.json({ fraud });
}
