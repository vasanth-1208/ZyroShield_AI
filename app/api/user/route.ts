import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { memoryDb } from "@/lib/mock-db";
import { UserModel } from "@/models/User";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let user = {
      id: crypto.randomUUID(),
      name: body.name,
      city: body.city,
      income: Number(body.income ?? 0)
    };

    const conn = await connectToDatabase();
    if (conn) {
      const created = await UserModel.create({ name: body.name, city: body.city, income: Number(body.income ?? 0) });
      user = { ...user, id: String(created._id) };
    }

    memoryDb.user = user;

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Unable to create user right now." }, { status: 500 });
  }
}
