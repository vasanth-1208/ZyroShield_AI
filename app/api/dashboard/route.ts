import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { memoryDb } from "@/lib/mock-db";
import {
  buildClaimTimeline,
  calculateDynamicPremium,
  calculateDynamicPremiumBreakdown,
  calculatePremium,
  countPaidClaimsLast7Days,
  createAutoClaim,
  createPayout,
  detectDisruptionReason,
  evaluateClaimEligibility,
  evaluateRisk,
  runFraudChecks,
  simulateMetrics
} from "@/lib/engine";
import { POLICY_TERMS } from "@/lib/insurance";
import {
  AiDecisionInsights,
  ClaimRecord,
  EconomicsSummary,
  EnvironmentMetrics,
  NotificationItem,
  PlanOption,
  PolicyRecord,
  PremiumModelBreakdown,
  PayoutRecord,
  UserProfile
} from "@/lib/types";
import { UserModel } from "@/models/User";
import { PlanModel } from "@/models/Plan";
import { ClaimModel } from "@/models/Claim";
import { PayoutModel } from "@/models/Payout";
import { classifyRisk, predictDisruptionProbability, predictFraudProbability } from "@/lib/ml";
import { calculateWorkerEconomics } from "@/lib/economics";

const demoUser: UserProfile = {
  id: "demo-user",
  name: "Demo Rider",
  city: "Bengaluru",
  dailyIncome: 1200,
  vehicleType: "BIKE",
  workingZone: "MEDIUM_RISK",
  safeHistoryScore: 84
};

const demoPlan: PlanOption = {
  code: "STANDARD",
  name: "Standard",
  premium: 249,
  coverage: 900,
  recommended: true
};

const defaultMetrics: EnvironmentMetrics = {
  rainfall: 24,
  temperature: 32,
  aqi: 168,
  floodAlert: false,
  curfewTrafficAlert: false
};

function disruptionCountLast30Days(claims: ClaimRecord[]) {
  const now = Date.now();
  return claims.filter((claim) => {
    const ageDays = (now - new Date(claim.date).getTime()) / (1000 * 60 * 60 * 24);
    return ageDays <= 30 && claim.reason !== "NONE";
  }).length;
}

function confidenceFromProbability(probability: number) {
  if (probability >= 0.75 || probability <= 0.2) return "HIGH" as const;
  if (probability >= 0.55 || probability <= 0.35) return "MEDIUM" as const;
  return "LOW" as const;
}

function riskProbabilityFor(metrics: EnvironmentMetrics, claims: ClaimRecord[]) {
  return predictDisruptionProbability({
    rainfall: metrics.rainfall,
    aqi: metrics.aqi,
    temperature: metrics.temperature,
    historicalDisruptions: disruptionCountLast30Days(claims),
    floodAlert: metrics.floodAlert,
    curfewAlert: metrics.curfewTrafficAlert
  });
}

function fraudFromProbability(fraudProbability: number, claimCount: number) {
  const fraudScore = Math.round(fraudProbability * 100);
  const movementScore = Math.max(5, Math.min(99, Math.round(100 - fraudScore * 0.65)));
  const claimFrequency = Math.max(0, Math.min(100, Math.round(Math.min(claimCount, 8) * 12 + fraudScore * 0.25)));
  const locationAnomaly = Math.max(0, Math.min(100, Math.round(fraudScore * 0.9)));
  const deviceConsistencyScore = Math.max(0, Math.min(100, Math.round(100 - fraudScore * 0.55)));
  const behaviorAnomalyScore = Math.max(0, Math.min(100, Math.round(fraudScore * 0.85)));
  const status = fraudScore >= 75 ? "FRAUD" : fraudScore >= 45 ? "UNDER REVIEW" : "SAFE";
  const riskLevel = fraudScore >= 75 ? "HIGH" : fraudScore >= 45 ? "MEDIUM" : "LOW";

  return {
    fraudScore,
    fraudProbability: Number(fraudProbability.toFixed(4)),
    movementScore,
    claimFrequency,
    locationAnomaly,
    deviceConsistencyScore,
    behaviorAnomalyScore,
    riskLevel,
    confidence: confidenceFromProbability(fraudProbability),
    status
  } as const;
}

function makeNotification(title: string, description: string, level: NotificationItem["level"] = "info"): NotificationItem {
  return {
    id: crypto.randomUUID(),
    title,
    description,
    level,
    read: false,
    date: new Date().toISOString()
  };
}

function buildPremiumModel(riskProbability: number, payoutAmount: number, claimHistoryCount: number): PremiumModelBreakdown {
  const expectedLoss = riskProbability * payoutAmount;
  const riskLoading = expectedLoss * 0.25;
  const platformCost = 8;
  const claimHistoryLoad = Math.min(14, claimHistoryCount * 2);
  const safetyMargin = expectedLoss * 0.1;
  const finalPremium = Math.max(20, Math.round(expectedLoss + riskLoading + platformCost + claimHistoryLoad + safetyMargin));

  return {
    riskProbability: Number(riskProbability.toFixed(4)),
    expectedLoss: Math.round(expectedLoss),
    riskLoading: Math.round(riskLoading),
    platformCost,
    claimHistoryLoad,
    safetyMargin: Math.round(safetyMargin),
    finalPremium
  };
}

function estimatedLossFromMetrics(dailyIncome: number, metrics: EnvironmentMetrics) {
  let lostHours = 3;
  if (metrics.rainfall > 70 || metrics.aqi > 380 || metrics.temperature > 45) lostHours = 6;
  else if (metrics.floodAlert || metrics.curfewTrafficAlert) lostHours = 5;
  const hourly = dailyIncome / 10;
  return Math.round(hourly * lostHours);
}

function getActivePolicy() {
  return memoryDb.policies.find((policy) => policy.status === "ACTIVE") ?? null;
}

function buildPolicyLifecycle(input: {
  hasUser: boolean;
  hasPolicy: boolean;
  risk: "LOW" | "HIGH";
  hasClaim: boolean;
  hasPayout: boolean;
  policyExpired: boolean;
}) {
  const { hasUser, hasPolicy, risk, hasClaim, hasPayout, policyExpired } = input;
  return [
    { step: "Applied", status: hasUser ? "done" : "active" },
    { step: "Risk Assessed", status: hasUser ? "done" : "pending" },
    { step: "Premium Calculated", status: hasUser ? "done" : "pending" },
    { step: "Active", status: hasPolicy ? "done" : "pending" },
    { step: "Monitoring", status: hasPolicy && risk === "LOW" ? "active" : hasPolicy ? "done" : "pending" },
    { step: "Claim", status: hasClaim ? "done" : "pending" },
    { step: "Payout", status: hasPayout ? "done" : hasClaim ? "active" : "pending" },
    { step: "Expired", status: policyExpired ? "done" : "pending" },
    { step: "Renewal", status: policyExpired ? "active" : "pending" }
  ];
}

function createPolicy(plan: PlanOption, aiAdjustedPremium: number, renewedFromId?: string): PolicyRecord {
  const start = new Date();
  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  return {
    id: crypto.randomUUID(),
    planCode: plan.code,
    planName: plan.name,
    coverage: plan.coverage,
    weeklyPremium: plan.premium,
    aiAdjustedPremium,
    status: "ACTIVE",
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    renewedFromId
  };
}

function buildSnapshot() {
  memoryDb.metrics = {
    rainfall: memoryDb.metrics.rainfall ?? defaultMetrics.rainfall,
    temperature: memoryDb.metrics.temperature ?? defaultMetrics.temperature,
    aqi: memoryDb.metrics.aqi ?? defaultMetrics.aqi,
    floodAlert: memoryDb.metrics.floodAlert ?? false,
    curfewTrafficAlert: memoryDb.metrics.curfewTrafficAlert ?? false
  };

  const user = memoryDb.user ?? demoUser;
  const plan = memoryDb.plan ?? demoPlan;
  const riskProbability = riskProbabilityFor(memoryDb.metrics, memoryDb.claims);
  const thresholdRisk = evaluateRisk(memoryDb.metrics);
  const risk = thresholdRisk === "HIGH" || classifyRisk(riskProbability) === "HIGH" ? "HIGH" : "LOW";

  const fraudProbability = predictFraudProbability({
    avgSpeedKmh: 22 + Math.random() * 45,
    claimFrequency: memoryDb.claims.length,
    locationDriftScore: 15 + Math.random() * 60,
    routeVariance: 20 + Math.random() * 60
  });

  const fraud = memoryDb.fraud ?? fraudFromProbability(fraudProbability, memoryDb.claims.length || 1);
  const premiumBreakdown = calculateDynamicPremiumBreakdown(user, risk, memoryDb.claims, fraud);
  const aiAdjustedPremium = premiumBreakdown.premium;
  const activePolicy = getActivePolicy();
  const economics: EconomicsSummary = memoryDb.economics ?? calculateWorkerEconomics(user, riskProbability);
  const premiumModel: PremiumModelBreakdown =
    memoryDb.premiumModel ?? buildPremiumModel(riskProbability, activePolicy?.coverage ?? plan.coverage, memoryDb.claims.length);

  const claimsThisWeek = memoryDb.claims.filter((claim) => {
    const ageDays = (Date.now() - new Date(claim.date).getTime()) / (1000 * 60 * 60 * 24);
    return ageDays <= 7;
  }).length;

  const paidClaims = memoryDb.claims.filter((claim) => claim.status === "PAID");
  const totalPayouts = memoryDb.payouts.reduce((sum, payout) => sum + payout.amount, 0);
  const incomeProtected = Math.min(totalPayouts, economics.incomeAtRiskWeekly * 4);
  const payoutRatio = paidClaims.length ? totalPayouts / paidClaims.length : 0;
  const premiumCollected = memoryDb.premiumHistory.reduce((sum, item) => sum + item.premium, 0);
  const lossRatio = premiumCollected ? totalPayouts / premiumCollected : 0;

  const policyExpiryDays = activePolicy
    ? Math.max(0, Math.ceil((new Date(activePolicy.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;
  const nextPremiumAdjustment = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
  const policyLifecycle = buildPolicyLifecycle({
    hasUser: Boolean(memoryDb.user),
    hasPolicy: Boolean(activePolicy),
    risk,
    hasClaim: Boolean(memoryDb.claims.length),
    hasPayout: Boolean(memoryDb.payouts.length),
    policyExpired: Boolean(activePolicy && new Date(activePolicy.endDate).getTime() < Date.now())
  });

  const claimDecision =
    memoryDb.claims[0]?.status === "REJECTED"
      ? {
          probability: 0.2,
          confidence: "HIGH" as const,
          decision: "Rejected",
          reason: memoryDb.claims[0]?.rejectionReason ?? "Policy exclusion/eligibility gate failed"
        }
      : {
          probability: risk === "HIGH" ? 0.82 : 0.28,
          confidence: confidenceFromProbability(risk === "HIGH" ? 0.82 : 0.28),
          decision: memoryDb.claims[0]?.status ?? "Monitoring",
          reason: memoryDb.claims[0]?.approvalReason ?? "Auto-decision based on policy and fraud checks"
        };

  const aiInsights: AiDecisionInsights = memoryDb.aiInsights ?? {
    risk: {
      probability: Number(riskProbability.toFixed(4)),
      confidence: confidenceFromProbability(riskProbability),
      decision: risk,
      reason: "Computed from rainfall, AQI, temperature and recent disruptions"
    },
    fraud: {
      probability: Number(fraudProbability.toFixed(4)),
      confidence: confidenceFromProbability(fraudProbability),
      decision: fraud.status,
      reason: "Movement, anomaly and behavior signals"
    },
    premium: {
      probability: Number(Math.min(0.99, riskProbability * 0.7 + (fraud.fraudScore / 100) * 0.3).toFixed(4)),
      confidence: "MEDIUM",
      decision: `Rs ${aiAdjustedPremium}`,
      reason: "Expected loss + loading + platform cost + behavior adjustments"
    },
    claim: claimDecision
  };

  if (!memoryDb.premiumHistory.length) {
    memoryDb.premiumHistory = [{ date: new Date().toISOString(), premium: aiAdjustedPremium }];
  }
  if (!memoryDb.riskHistory.length) {
    memoryDb.riskHistory = [{ date: new Date().toISOString(), probability: Number(riskProbability.toFixed(4)), risk }];
  }
  if (!memoryDb.fraudHistory.length) {
    memoryDb.fraudHistory = [
      { date: new Date().toISOString(), score: fraud.fraudScore, probability: Number(fraudProbability.toFixed(4)), level: fraud.riskLevel ?? "LOW" }
    ];
  }
  memoryDb.economics = economics;
  memoryDb.premiumModel = premiumModel;
  memoryDb.aiInsights = aiInsights;
  if (policyExpiryDays > 0 && policyExpiryDays <= 2) {
    const key = `Policy renewal due in ${policyExpiryDays} day(s)`;
    const exists = memoryDb.notifications.some((item) => item.title === key);
    if (!exists) {
      memoryDb.notifications.unshift(makeNotification(key, "Renew now to avoid coverage lapse.", "warning"));
    }
  }

  return {
    user,
    plan,
    risk,
    metrics: memoryDb.metrics,
    claims: memoryDb.claims,
    fraud,
    payout: memoryDb.payouts[0] ?? null,
    payouts: memoryDb.payouts,
    policies: memoryDb.policies,
    activePolicy,
    notifications: memoryDb.notifications,
    aiAdjustedPremium,
    premiumBreakdown,
    riskProbability,
    fraudProbability,
    premiumTrend: memoryDb.premiumHistory,
    riskHistory: memoryDb.riskHistory,
    fraudHistory: memoryDb.fraudHistory,
    walletBalance: memoryDb.walletBalance,
    economics,
    premiumModel,
    aiInsights,
    claimsThisWeek,
    incomeProtected,
    payoutRatio: Number(payoutRatio.toFixed(2)),
    lossRatio: Number(lossRatio.toFixed(2)),
    policyExpiryDays,
    nextPremiumAdjustment,
    policyLifecycle
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lite = searchParams.get("lite") === "1";
  const demo = searchParams.get("demo") === "1";
  const userId = searchParams.get("userId");

  if (demo && !memoryDb.user) {
    memoryDb.user = demoUser;
    memoryDb.plan = demoPlan;
    memoryDb.metrics = defaultMetrics;
  }

  const conn = await connectToDatabase();

  if (conn && userId) {
    const [dbUser, dbPolicies, dbClaims, dbPayouts] = (await Promise.all([
      UserModel.findById(userId).lean().catch(() => null),
      PlanModel.find({ userId }).sort({ createdAt: -1 }).limit(20).lean().catch(() => []),
      ClaimModel.find({ userId }).sort({ createdAt: -1 }).limit(20).lean().catch(() => []),
      PayoutModel.find().sort({ createdAt: -1 }).limit(20).lean().catch(() => [])
    ])) as [any, any[], any[], any[]];

    if (dbUser) {
      memoryDb.user = {
        id: String(dbUser._id),
        name: dbUser.name,
        city: dbUser.city,
        dailyIncome: Number(dbUser.dailyIncome ?? 0),
        vehicleType: dbUser.vehicleType ?? "BIKE",
        workingZone: dbUser.workingZone ?? "MEDIUM_RISK",
        safeHistoryScore: Number(dbUser.safeHistoryScore ?? 70)
      };
    }

    if (dbPolicies.length) {
      memoryDb.policies = dbPolicies.map((policy) => ({
        id: String(policy._id),
        planCode: policy.code,
        planName: policy.name,
        coverage: policy.coverage,
        weeklyPremium: policy.premium,
        aiAdjustedPremium: Number(policy.aiAdjustedPremium ?? policy.premium),
        status: policy.status ?? "ACTIVE",
        startDate: new Date(policy.startDate ?? policy.createdAt).toISOString(),
        endDate: new Date(policy.endDate ?? policy.createdAt).toISOString(),
        renewedFromId: policy.renewedFromId
      }));

      const active = memoryDb.policies.find((policy) => policy.status === "ACTIVE");
      if (active) {
        memoryDb.plan = {
          code: active.planCode,
          name: active.planName,
          premium: active.weeklyPremium,
          coverage: active.coverage
        };
      }
    }

    if (dbClaims.length) {
      memoryDb.claims = dbClaims.map((claim) => ({
        id: String(claim._id),
        date: new Date(claim.createdAt).toISOString(),
        risk: claim.risk,
        reason: claim.reason ?? "NONE",
        fraudStatus: claim.fraudStatus,
        status: claim.status,
        payoutAmount: claim.payoutAmount,
        deductible: claim.deductible,
        eligibleAmount: claim.eligibleAmount,
        approvalReason: claim.approvalReason,
        rejectionReason: claim.rejectionReason,
        confidenceScore: claim.confidenceScore,
        timeline: claim.timeline ?? []
      }));
    }

    if (dbPayouts.length) {
      memoryDb.payouts = dbPayouts.map((payout) => ({
        id: String(payout._id),
        date: new Date(payout.createdAt).toISOString(),
        amount: payout.amount,
        claimId: payout.claimId
      }));
      memoryDb.walletBalance = memoryDb.payouts.reduce((sum, payout) => sum + payout.amount, 0);
    }
  }

  const snapshot = buildSnapshot();

  if (lite) {
    return NextResponse.json({
      user: snapshot.user,
      plan: snapshot.plan,
      risk: snapshot.risk,
      metrics: snapshot.metrics,
      aiAdjustedPremium: snapshot.aiAdjustedPremium,
      riskProbability: snapshot.riskProbability,
      economics: snapshot.economics,
      premiumModel: snapshot.premiumModel,
      walletBalance: snapshot.walletBalance,
      policyLifecycle: snapshot.policyLifecycle,
      policies: snapshot.policies.slice(0, 1),
      claims: [],
      payouts: [],
      notifications: snapshot.notifications.slice(0, 4)
    });
  }

  return NextResponse.json(snapshot);
}

export async function POST(req: Request) {
  const body = await req.json();
  const action = String(body.action ?? "simulate");

  if (action === "login") {
    const demo = Boolean(body.demo);

    if (demo) {
      memoryDb.user = demoUser;
      memoryDb.plan = demoPlan;
      memoryDb.metrics = defaultMetrics;
      memoryDb.notifications = [makeNotification("Demo mode enabled", "ZyroShield is now running with mock automation data.", "info")];
      return NextResponse.json(buildSnapshot());
    }

    const name = String(body.name ?? "Guest Rider");
    const city = String(body.city ?? "Bengaluru");

    let user: UserProfile = {
      id: crypto.randomUUID(),
      name,
      city,
      dailyIncome: Number(body.dailyIncome ?? 1200),
      vehicleType: body.vehicleType ?? "BIKE",
      workingZone: body.workingZone ?? "MEDIUM_RISK",
      safeHistoryScore: Number(body.safeHistoryScore ?? 72)
    };

    const conn = await connectToDatabase();
    if (conn) {
      const created = await UserModel.create({
        name: user.name,
        city: user.city,
        dailyIncome: user.dailyIncome,
        vehicleType: user.vehicleType,
        workingZone: user.workingZone,
        safeHistoryScore: user.safeHistoryScore
      });
      user = { ...user, id: String(created._id) };
    }

    memoryDb.user = user;
    if (!memoryDb.plan) memoryDb.plan = demoPlan;
    memoryDb.notifications.unshift(makeNotification("Login success", "Monitoring engine is active for disruption triggers.", "success"));

    return NextResponse.json(buildSnapshot());
  }

  if (action === "policy_select") {
    const plan: PlanOption = {
      code: body.plan.code,
      name: body.plan.name,
      premium: Number(body.plan.premium),
      coverage: Number(body.plan.coverage)
    };

    const user = memoryDb.user ?? demoUser;
    const fraud = memoryDb.fraud ?? runFraudChecks(memoryDb.claims.length || 1);
    const risk = evaluateRisk(memoryDb.metrics);
    const riskProbability = riskProbabilityFor(memoryDb.metrics, memoryDb.claims);
    const actuarialPremium = calculatePremium(riskProbability, plan.coverage, memoryDb.claims);
    const dynamicPremium = calculateDynamicPremium(user, risk, memoryDb.claims, fraud);
    const aiAdjustedPremium = Math.round((actuarialPremium + dynamicPremium) / 2);
    const policy = createPolicy(plan, aiAdjustedPremium);

    memoryDb.plan = plan;
    memoryDb.policies.unshift(policy);
    memoryDb.premiumHistory.unshift({ date: new Date().toISOString(), premium: aiAdjustedPremium });
    memoryDb.notifications.unshift(
      makeNotification("Policy activated", `${plan.name} weekly policy is active at AI premium Rs ${aiAdjustedPremium}.`, "success")
    );

    const conn = await connectToDatabase();
    if (conn && memoryDb.user) {
      await PlanModel.updateMany({ userId: memoryDb.user.id, status: "ACTIVE" }, { $set: { status: "EXPIRED" } });
      await PlanModel.create({
        userId: memoryDb.user.id,
        code: plan.code,
        name: plan.name,
        premium: plan.premium,
        coverage: plan.coverage,
        aiAdjustedPremium,
        status: "ACTIVE",
        startDate: policy.startDate,
        endDate: policy.endDate
      });
    }

    return NextResponse.json(buildSnapshot());
  }

  if (action === "policy_renew") {
    const active = getActivePolicy();
    if (!active) {
      return NextResponse.json({ error: "No active policy to renew." }, { status: 400 });
    }

    const user = memoryDb.user ?? demoUser;
    const fraud = memoryDb.fraud ?? runFraudChecks(memoryDb.claims.length || 1);
    const risk = evaluateRisk(memoryDb.metrics);
    const riskProbability = riskProbabilityFor(memoryDb.metrics, memoryDb.claims);
    const actuarialPremium = calculatePremium(riskProbability, active.coverage, memoryDb.claims);
    const dynamicPremium = calculateDynamicPremium(user, risk, memoryDb.claims, fraud);
    const aiAdjustedPremium = Math.round((actuarialPremium + dynamicPremium) / 2);
    const renewed = createPolicy(
      {
        code: active.planCode,
        name: active.planName,
        premium: active.weeklyPremium,
        coverage: active.coverage
      },
      aiAdjustedPremium,
      active.id
    );

    active.status = "EXPIRED";
    memoryDb.policies.unshift(renewed);
    memoryDb.premiumHistory.unshift({ date: new Date().toISOString(), premium: aiAdjustedPremium });
    memoryDb.notifications.unshift(makeNotification("Policy renewed", "Your policy was renewed with updated AI pricing.", "success"));

    const conn = await connectToDatabase();
    if (conn && memoryDb.user) {
      await PlanModel.updateMany({ userId: memoryDb.user.id, status: "ACTIVE" }, { $set: { status: "EXPIRED" } });
      await PlanModel.create({
        userId: memoryDb.user.id,
        code: renewed.planCode,
        name: renewed.planName,
        premium: renewed.weeklyPremium,
        coverage: renewed.coverage,
        aiAdjustedPremium: renewed.aiAdjustedPremium,
        status: renewed.status,
        startDate: renewed.startDate,
        endDate: renewed.endDate,
        renewedFromId: renewed.renewedFromId
      });
    }

    return NextResponse.json(buildSnapshot());
  }

  if (action === "policy_cancel") {
    const active = getActivePolicy();
    if (!active) {
      return NextResponse.json({ error: "No active policy to cancel." }, { status: 400 });
    }

    active.status = "CANCELLED";
    memoryDb.notifications.unshift(makeNotification("Policy cancelled", "You can reactivate anytime from plans.", "warning"));

    const conn = await connectToDatabase();
    if (conn && memoryDb.user) {
      await PlanModel.updateMany({ userId: memoryDb.user.id, status: "ACTIVE" }, { $set: { status: "CANCELLED" } });
    }

    return NextResponse.json(buildSnapshot());
  }

  if (action === "wallet_topup") {
    const amount = Math.max(100, Number(body.amount ?? 500));
    memoryDb.walletBalance += amount;
    memoryDb.notifications.unshift(makeNotification("Wallet top-up", `Rs ${amount} added to wallet balance.`, "success"));
    return NextResponse.json(buildSnapshot());
  }

  if (action !== "simulate") {
    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  }

  const mode = String(body.mode ?? "rain") as "rain" | "heat" | "pollution" | "flood" | "curfew" | "fraud";

  if (mode === "fraud") {
    memoryDb.fraud = {
      fraudScore: 92,
      fraudProbability: 0.92,
      movementScore: 18,
      claimFrequency: 88,
      locationAnomaly: 94,
      deviceConsistencyScore: 11,
      behaviorAnomalyScore: 89,
      riskLevel: "HIGH",
      confidence: "HIGH",
      status: "FRAUD"
    };
    memoryDb.fraudHistory.unshift({ date: new Date().toISOString(), score: 92, probability: 0.92, level: "HIGH" });
    memoryDb.notifications.unshift(makeNotification("Fraud anomaly", "High spoofing risk detected. Claim review tightened.", "warning"));
    return NextResponse.json(buildSnapshot());
  }

  const metrics = simulateMetrics(mode);
  memoryDb.metrics = metrics;
  const riskProbability = riskProbabilityFor(metrics, memoryDb.claims);
  const thresholdRisk = evaluateRisk(metrics);
  const risk = thresholdRisk === "HIGH" || classifyRisk(riskProbability) === "HIGH" ? "HIGH" : "LOW";
  const reason = detectDisruptionReason(metrics);

  const policy = getActivePolicy();
  const user = memoryDb.user ?? demoUser;
  const estimatedLoss = estimatedLossFromMetrics(user.dailyIncome, metrics);
  const coverage = policy?.coverage ?? memoryDb.plan?.coverage ?? 500;
  const cappedLoss = Math.min(estimatedLoss, coverage, POLICY_TERMS.coverageLimitPerClaim);
  const payoutEligibleCoverage = Math.max(0, cappedLoss - POLICY_TERMS.deductible);

  const fraudProbability = predictFraudProbability({
    avgSpeedKmh: 18 + Math.random() * 70,
    claimFrequency: memoryDb.claims.length + 1,
    locationDriftScore: 8 + Math.random() * 90,
    routeVariance: 12 + Math.random() * 88
  });
  const fraud = fraudFromProbability(fraudProbability, memoryDb.claims.length + 1);
  memoryDb.fraud = fraud;
  memoryDb.fraudHistory.unshift({
    date: new Date().toISOString(),
    score: fraud.fraudScore,
    probability: Number(fraudProbability.toFixed(4)),
    level: fraud.riskLevel ?? "LOW"
  });
  memoryDb.riskHistory.unshift({
    date: new Date().toISOString(),
    probability: Number(riskProbability.toFixed(4)),
    risk
  });

  let claim: ClaimRecord | null = null;
  let payout: PayoutRecord | null = null;

  const paidClaimsLast7Days = countPaidClaimsLast7Days(memoryDb.claims);
  const eligibility = evaluateClaimEligibility({
    policy,
    reason,
    rainfall: metrics.rainfall,
    estimatedLoss,
    declaredCoverage: coverage,
    bypassWaitingPeriod: Boolean(body.demo),
    isWorkerOnline: body.isWorkerOnline ?? true,
    isDeviceOn: body.isDeviceOn ?? true,
    isInZone: body.isInZone ?? true,
    isPersonalLeave: body.isPersonalLeave ?? false,
    isPlatformOutageWeatherRelated: body.isPlatformOutageWeatherRelated ?? true,
    paidClaimsLast7Days
  });

  if (risk === "HIGH" && reason !== "NONE") {
    if (!eligibility.eligible) {
      claim = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        risk: "HIGH",
        reason,
        fraudStatus: "SAFE",
        status: "REJECTED",
        payoutAmount: 0,
        deductible: POLICY_TERMS.deductible,
        eligibleAmount: 0,
        rejectionReason: eligibility.reason,
        confidenceScore: 0.92,
        timeline: buildClaimTimeline("REJECTED")
      };
      memoryDb.claims.unshift(claim);
      memoryDb.notifications.unshift(makeNotification("Claim rejected", eligibility.reason, "warning"));
    } else {
      claim = createAutoClaim({ risk, reason, fraud, coverage: payoutEligibleCoverage });
      if (claim) {
        claim.deductible = POLICY_TERMS.deductible;
        claim.eligibleAmount = cappedLoss;
        claim.confidenceScore = Number((1 - Math.abs(fraudProbability - riskProbability)).toFixed(2));
        if (claim.status === "PAID") {
          claim.approvalReason = `Eligibility passed. Estimated loss Rs ${estimatedLoss}, deductible Rs ${POLICY_TERMS.deductible}, final payout Rs ${payoutEligibleCoverage}.`;
        } else if (claim.status === "PENDING") {
          claim.rejectionReason = "Fraud engine marked claim as UNDER REVIEW.";
        } else if (claim.status === "REJECTED") {
          claim.rejectionReason = "Fraud probability crossed rejection threshold.";
        }
      }
    }

    if (claim) {
      if (eligibility.eligible) {
        memoryDb.claims.unshift(claim);
      }

      if (claim.status === "PAID") {
        payout = createPayout(claim.id, claim.payoutAmount);
        if (payout) {
          memoryDb.payouts.unshift(payout);
          memoryDb.walletBalance += payout.amount;
        }
      }

      memoryDb.notifications.unshift(
        makeNotification(
          "Zero-touch claim processed",
          `Trigger ${reason.replace("_", " ")} created claim ${claim.status}.`,
          claim.status === "PAID" ? "success" : "warning"
        )
      );

      const conn = await connectToDatabase();
      if (conn && memoryDb.user) {
        await ClaimModel.create({
          userId: memoryDb.user.id,
          risk: claim.risk,
          reason: claim.reason,
          fraudStatus: claim.fraudStatus,
          status: claim.status,
          payoutAmount: claim.payoutAmount,
          deductible: claim.deductible,
          eligibleAmount: claim.eligibleAmount,
          approvalReason: claim.approvalReason,
          rejectionReason: claim.rejectionReason,
          confidenceScore: claim.confidenceScore,
          timeline: claim.timeline
        });

        if (payout) {
          await PayoutModel.create({
            claimId: payout.claimId,
            amount: payout.amount
          });
        }
      }
    }
  }

  const snapshot = buildSnapshot();

  return NextResponse.json({
    ...snapshot,
    claim,
    payout
  });
}
