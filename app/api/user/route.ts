import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { memoryDb } from "@/lib/mock-db";
import { UserModel } from "@/models/User";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const user = {
      id: crypto.randomUUID(),
      name: body.name,
      city: body.city,
      income: Number(body.income ?? 0)
    };

    memoryDb.user = user;

    const conn = await connectToDatabase();
    if (conn) {
      await UserModel.create({ name: body.name, city: body.city, income: Number(body.income ?? 0) });
    }

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Unable to create user right now." }, { status: 500 });
  }
}
