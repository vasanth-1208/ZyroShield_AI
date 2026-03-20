import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { memoryDb } from "@/lib/mock-db";
import { evaluateRisk, runFraudChecks, simulateMetrics } from "@/lib/engine";
import { ClaimRecord, ClaimStatus, FraudResult, PlanOption, PayoutRecord, UserProfile } from "@/lib/types";
import { UserModel } from "@/models/User";
import { PlanModel } from "@/models/Plan";
import { ClaimModel } from "@/models/Claim";
import { PayoutModel } from "@/models/Payout";

const demoUser: UserProfile = {
  id: "demo-user",
  name: "Demo Rider",
  city: "Bengaluru",
  income: 26000
};

const demoPlan: PlanOption = {
  code: "STANDARD",
  name: "Standard",
  premium: 249,
  coverage: 900,
  recommended: true
};

function buildDemoSnapshot() {
  const fraud: FraudResult = {
    fraudScore: 18,
    movementScore: 86,
    claimFrequency: 14,
    locationAnomaly: 10,
    status: "SAFE"
  };

  return {
    user: demoUser,
    plan: demoPlan,
    risk: "LOW",
    metrics: {
      rainfall: 24,
      temperature: 32,
      aqi: 168
    },
    claims: [],
    fraud,
    payout: null,
    payouts: []
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lite = searchParams.get("lite") === "1";
  const demo = searchParams.get("demo") === "1";
  const userId = searchParams.get("userId");

  if (demo) {
    const snapshot = buildDemoSnapshot();
    return NextResponse.json(lite ? { ...snapshot, claims: [], payouts: [] } : snapshot);
  }

  const risk = evaluateRisk(memoryDb.metrics);

  let user = memoryDb.user;
  let plan = memoryDb.plan;
  let claims = memoryDb.claims;
  let payouts = memoryDb.payouts;

  const conn = await connectToDatabase();

  if (conn && userId) {
    const [dbUser, dbPlan, dbClaims, dbPayouts] = (await Promise.all([
      UserModel.findById(userId).lean().catch(() => null),
      PlanModel.findOne({ userId }).sort({ createdAt: -1 }).lean().catch(() => null),
      ClaimModel.find({ userId }).sort({ createdAt: -1 }).limit(12).lean().catch(() => []),
      PayoutModel.find().sort({ createdAt: -1 }).limit(12).lean().catch(() => [])
    ])) as [any, any, any[], any[]];

    if (dbUser) {
      user = {
        id: String(dbUser._id),
        name: dbUser.name,
        city: dbUser.city,
        income: Number(dbUser.income ?? 0)
      };
    }

    if (dbPlan) {
      plan = {
        code: dbPlan.code,
        name: dbPlan.name,
        premium: dbPlan.premium,
        coverage: dbPlan.coverage
      };
    }

    if (dbClaims.length) {
      claims = dbClaims.map((claim) => ({
        id: String(claim._id),
        date: (claim.createdAt as Date).toISOString(),
        risk: claim.risk,
        fraudStatus: claim.fraudStatus,
        status: claim.status as ClaimStatus,
        payoutAmount: claim.payoutAmount
      }));
    }

    if (dbPayouts.length) {
      payouts = dbPayouts.map((payout) => ({
        id: String(payout._id),
        date: (payout.createdAt as Date).toISOString(),
        amount: payout.amount,
        claimId: payout.claimId
      }));
    }
  }

  const fallbackUser: UserProfile =
    user ??
    ({
      id: "guest-user",
      name: "Guest Rider",
      city: "Bengaluru",
      income: 22000
    } as UserProfile);

  const fallbackPlan: PlanOption =
    plan ??
    ({
      code: "STANDARD",
      name: "Standard",
      premium: 249,
      coverage: 900,
      recommended: true
    } as PlanOption);

  if (!memoryDb.plan) {
    memoryDb.plan = fallbackPlan;
  }

  const fraud: FraudResult = memoryDb.fraud ?? runFraudChecks(claims.length || 1);
  const payload = {
    user: fallbackUser,
    plan: fallbackPlan,
    risk,
    metrics: memoryDb.metrics,
    claims,
    fraud,
    payout: payouts[0] ?? null,
    payouts
  };

  return NextResponse.json(lite ? { ...payload, claims: [], payouts: [] } : payload);
}

export async function POST(req: Request) {
  const body = await req.json();
  const action = body.action;

  if (action === "login") {
    const name = String(body.name ?? "Guest Rider");
    const city = String(body.city ?? "Bengaluru");
    const income = Number(body.income ?? 22000);
    const demo = Boolean(body.demo);

    if (demo) {
      const snapshot = buildDemoSnapshot();
      memoryDb.user = snapshot.user;
      memoryDb.plan = snapshot.plan;
      memoryDb.metrics = snapshot.metrics;
      memoryDb.claims = snapshot.claims;
      memoryDb.payouts = snapshot.payouts;
      memoryDb.fraud = snapshot.fraud;
      return NextResponse.json(snapshot);
    }

    let user: UserProfile = {
      id: crypto.randomUUID(),
      name,
      city,
      income
    };

    const conn = await connectToDatabase();
    if (conn) {
      const created = await UserModel.create({ name, city, income });
      user = { ...user, id: String(created._id) };
    }

    memoryDb.user = user;
    if (!memoryDb.plan) {
      memoryDb.plan = demoPlan;
    }

    return NextResponse.json({
      user,
      plan: memoryDb.plan,
      risk: evaluateRisk(memoryDb.metrics),
      metrics: memoryDb.metrics,
      claims: [],
      fraud: memoryDb.fraud ?? runFraudChecks(memoryDb.claims.length || 1),
      payout: memoryDb.payouts[0] ?? null,
      payouts: []
    });
  }

  if (action !== "simulate") {
    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  }

  const mode = body.mode as "rain" | "heat" | "pollution" | "fraud";
  const coverage = Number(body.coverage ?? memoryDb.plan?.coverage ?? 500);
  const userId = String(body.userId ?? memoryDb.user?.id ?? "guest-user");

  if (mode === "fraud") {
    const forcedFraud: FraudResult = {
      fraudScore: 92,
      movementScore: 18,
      claimFrequency: 88,
      locationAnomaly: 94,
      status: "FRAUD"
    };
    memoryDb.fraud = forcedFraud;

    return NextResponse.json({
      metrics: memoryDb.metrics,
      risk: evaluateRisk(memoryDb.metrics),
      fraud: forcedFraud,
      claim: null,
      payout: null,
      claims: memoryDb.claims,
      payouts: memoryDb.payouts
    });
  }

  const metrics = simulateMetrics(mode);
  const risk = evaluateRisk(metrics);
  memoryDb.metrics = metrics;

  let claim: ClaimRecord | null = null;
  let payout: PayoutRecord | null = null;
  let fraud: FraudResult = memoryDb.fraud ?? runFraudChecks(memoryDb.claims.length + 1);

  if (risk === "HIGH") {
    fraud = runFraudChecks(memoryDb.claims.length + 1);
    memoryDb.fraud = fraud;

    const approved = fraud.status === "SAFE";
    const claimStatus: ClaimStatus = approved ? "APPROVED" : "UNDER_REVIEW";

    claim = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      risk,
      fraudStatus: fraud.status,
      status: claimStatus,
      payoutAmount: approved ? coverage : 0
    };

    memoryDb.claims.unshift(claim);

    if (approved) {
      payout = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        amount: coverage,
        claimId: claim.id
      };
      memoryDb.payouts.unshift(payout);
    }

    const conn = await connectToDatabase();
    if (conn) {
      await ClaimModel.create({
        userId,
        risk: claim.risk,
        fraudStatus: claim.fraudStatus,
        status: claim.status,
        payoutAmount: claim.payoutAmount
      });

      if (payout) {
        await PayoutModel.create({
          claimId: payout.claimId,
          amount: payout.amount
        });
      }
    }
  }

  return NextResponse.json({
    metrics,
    risk,
    fraud,
    claim,
    payout,
    claims: memoryDb.claims,
    payouts: memoryDb.payouts
  });
}
