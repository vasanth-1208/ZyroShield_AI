import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { memoryDb } from "@/lib/mock-db";
import { UserModel } from "@/models/User";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const safeHistoryScore = Number(body.safeHistoryScore ?? Math.round(Math.random() * 20 + 70));

    let user = {
      id: crypto.randomUUID(),
      name: body.name,
      city: body.city,
      dailyIncome: Number(body.dailyIncome ?? 0),
      vehicleType: body.vehicleType ?? "BIKE",
      workingZone: body.workingZone ?? "MEDIUM_RISK",
      safeHistoryScore
    };

    const conn = await connectToDatabase();
    if (conn) {
      const created = await UserModel.create({
        name: body.name,
        city: body.city,
        dailyIncome: Number(body.dailyIncome ?? 0),
        vehicleType: body.vehicleType ?? "BIKE",
        workingZone: body.workingZone ?? "MEDIUM_RISK",
        safeHistoryScore
      });
      user = { ...user, id: String(created._id) };
    }

    memoryDb.user = user;

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Unable to create user right now." }, { status: 500 });
  }
}
