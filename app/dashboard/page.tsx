"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Bell,
  CloudFog,
  CloudRain,
  Loader2,
  Siren,
  SunMedium,
  TrafficCone,
  Waves,
  Wallet2,
  ShieldCheck,
  Activity,
  Clock3
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useZyroStore } from "@/lib/store";
import { ClaimStatus } from "@/lib/types";
import { AI_TRANSPARENCY_NOTE } from "@/lib/insurance";
import { cn, rupee } from "@/lib/utils";

type SimType = "rain" | "heat" | "pollution" | "flood" | "curfew" | "fraud";

const CACHE_TTL = 1000 * 60 * 3;

export default function DashboardPage() {
  const router = useRouter();
  const {
    user,
    plan,
    risk,
    claimStatus,
    metrics,
    fraud,
    latestPayout,
    claimHistory,
    payoutHistory,
    notifications,
    activePolicy,
    aiAdjustedPremium,
    riskProbability,
    walletBalance,
    economics,
    premiumModel,
    aiInsights,
    claimsThisWeek,
    incomeProtected,
    payoutRatio,
    lossRatio,
    policyExpiryDays,
    nextPremiumAdjustment,
    policyLifecycle,
    dashboardCacheTs,
    demoMode,
    setRisk,
    setMetrics,
    setClaimStatus,
    setFraud,
    hydrateDashboardLite,
    hydrateDashboardHeavy,
    setPolicy,
    setPolicyHistory,
    setAiAdjustedPremium,
    setPremiumTrend,
    setWalletBalance
  } = useZyroStore();

  const [bootLoading, setBootLoading] = useState(false);
  const [heavyLoading, setHeavyLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<SimType | null>(null);

  const hasLiteData = Boolean(user && plan);
  const cacheFresh = useMemo(() => Date.now() - dashboardCacheTs < CACHE_TTL, [dashboardCacheTs]);

  useEffect(() => {
    let mounted = true;

    async function loadLite() {
      if (!mounted) return;
      setBootLoading(true);
      try {
        const query = new URLSearchParams({ lite: "1" });
        if (user?.id) query.set("userId", user.id);
        if (demoMode) query.set("demo", "1");

        const res = await fetch(`/api/dashboard?${query.toString()}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load dashboard");
        const data = await res.json();
        hydrateDashboardLite(data);
        setAiAdjustedPremium(data.aiAdjustedPremium ?? 40);
        setWalletBalance(data.walletBalance ?? 0);
      } catch {
        if (!user) router.push("/login");
      } finally {
        if (mounted) setBootLoading(false);
      }
    }

    if (!hasLiteData || !cacheFresh) loadLite();

    return () => {
      mounted = false;
    };
  }, [hasLiteData, cacheFresh, user, router, demoMode, hydrateDashboardLite, setAiAdjustedPremium, setWalletBalance]);

  useEffect(() => {
    if (!user) return;
    let mounted = true;

    const timer = setTimeout(async () => {
      if (!mounted) return;
      setHeavyLoading(true);
      try {
        const query = new URLSearchParams({ userId: user.id });
        if (demoMode) query.set("demo", "1");
        const res = await fetch(`/api/dashboard?${query.toString()}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load heavy dashboard data");
        const data = await res.json();
        hydrateDashboardHeavy(data);
        setMetrics(data.metrics);
        setRisk(data.risk);
        if (data.fraud) setFraud(data.fraud);
        setPolicy(data.activePolicy ?? null);
        setPolicyHistory(data.policies ?? []);
        setAiAdjustedPremium(data.aiAdjustedPremium ?? 40);
        setPremiumTrend(data.premiumTrend ?? []);
        setWalletBalance(data.walletBalance ?? 0);
      } finally {
        if (mounted) setHeavyLoading(false);
      }
    }, 80);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [
    user,
    demoMode,
    hydrateDashboardHeavy,
    setMetrics,
    setRisk,
    setFraud,
    setPolicy,
    setPolicyHistory,
    setAiAdjustedPremium,
    setPremiumTrend,
    setWalletBalance
  ]);

  async function simulate(mode: SimType) {
    if (!user) return;

    setActionLoading(mode);
    try {
      const res = await fetch("/api/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "simulate",
          mode,
          userId: user.id,
          coverage: activePolicy?.coverage ?? plan?.coverage,
          demo: demoMode
        })
      });

      if (!res.ok) throw new Error("Simulation failed");
      const data = await res.json();
      setMetrics(data.metrics);
      setRisk(data.risk);
      setFraud(data.fraud);
      hydrateDashboardHeavy(data);
      setPolicy(data.activePolicy ?? null);
      setAiAdjustedPremium(data.aiAdjustedPremium ?? aiAdjustedPremium);
      setWalletBalance(data.walletBalance ?? walletBalance);

      const nextClaimStatus: ClaimStatus = data.claim
        ? data.claim.status === "PAID"
          ? "PAID"
          : data.claim.status === "APPROVED"
            ? "APPROVED"
            : data.claim.status === "REJECTED"
              ? "REJECTED"
              : "PENDING"
        : mode === "fraud"
          ? "UNDER_REVIEW"
          : data.risk === "HIGH"
            ? "TRIGGERED"
            : "IDLE";

      setClaimStatus(nextClaimStatus);
    } finally {
      setActionLoading(null);
    }
  }

  if (bootLoading && !hasLiteData) return <DashboardSkeleton />;

  const latestClaim = claimHistory[0];

  return (
    <div className="page-stack">
      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Income Protected" value={rupee(incomeProtected)} sub="Total covered income restored" icon={ShieldCheck} />
        <KpiCard label="Current Risk Level" value={risk} sub={`${((riskProbability ?? 0) * 100).toFixed(1)}% disruption probability`} icon={AlertTriangle} />
        <KpiCard label="Active Coverage" value={rupee(activePolicy?.coverage ?? plan?.coverage ?? 0)} sub="Current policy coverage limit" icon={ShieldCheck} />
        <KpiCard label="Claim Status" value={claimStatus.replace("_", " ")} sub={latestClaim?.approvalReason ?? latestClaim?.rejectionReason ?? "No active claim"} icon={Activity} />
        <KpiCard label="Wallet Balance" value={rupee(walletBalance)} sub={`${payoutHistory.length} credited payouts`} icon={Wallet2} />
        <KpiCard label="Policy Expiry" value={policyExpiryDays ? `${policyExpiryDays} day(s)` : "-"} sub={activePolicy ? "Renew before expiry" : "No active policy"} icon={Clock3} />
        <KpiCard label="AI Premium" value={rupee(aiAdjustedPremium)} sub="Current weekly adjusted premium" icon={Wallet2} />
        <KpiCard label="Fraud Risk" value={fraud?.riskLevel ?? "LOW"} sub={`${fraud?.fraudScore ?? 0}% fraud score`} icon={Siren} />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Income Risk Summary</CardTitle>
            <CardDescription>Worker economics, risk exposure, and recommended protection.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 space-y-0 md:grid-cols-2 lg:grid-cols-3 text-sm">
            <Metric label="Hourly Income" value={rupee(economics?.hourlyIncome ?? 0)} />
            <Metric label="Loss / Disruption" value={rupee(economics?.incomeLossPerDisruption ?? 0)} />
            <Metric label="Recommended Coverage" value={rupee(economics?.recommendedCoverage ?? 0)} />
            <Metric label="Recommended Premium" value={rupee(economics?.recommendedPremium ?? 0)} />
            <Metric label="Policy Expiry" value={policyExpiryDays ? `${policyExpiryDays} day(s)` : "-"} />
            <Metric label="Next Premium Adjustment" value={nextPremiumAdjustment ? new Date(nextPremiumAdjustment).toLocaleDateString() : "-"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell className="h-4 w-4 text-primary" /> Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(notifications.length ? notifications.slice(0, 5) : []).map((item) => (
              <div key={item.id} className="rounded-lg border border-border/70 bg-white/45 p-2 text-xs dark:bg-slate-950/30">
                <p className="font-semibold">{item.title}</p>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
            {!notifications.length ? <p className="text-xs text-muted-foreground">No notifications yet.</p> : null}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Automated Disruption Triggers</CardTitle>
            <CardDescription>Risk Monitoring {"->"} Fraud Check {"->"} Claim Decision {"->"} Payout</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 grid gap-3 sm:grid-cols-5">
              <Metric label="Rainfall" value={`${metrics.rainfall} mm`} />
              <Metric label="Temp" value={`${metrics.temperature} C`} />
              <Metric label="AQI" value={`${metrics.aqi}`} />
              <Metric label="Flood" value={metrics.floodAlert ? "Alert" : "Normal"} />
              <Metric label="Curfew" value={metrics.curfewTrafficAlert ? "Alert" : "Normal"} />
            </div>

            <div className="grid gap-2 md:grid-cols-3">
              <TriggerButton loading={actionLoading === "rain"} label="Simulate Rain" onClick={() => simulate("rain")} />
              <TriggerButton loading={actionLoading === "heat"} label="Simulate Heatwave" onClick={() => simulate("heat")} />
              <TriggerButton loading={actionLoading === "pollution"} label="Simulate Pollution" onClick={() => simulate("pollution")} />
              <TriggerButton loading={actionLoading === "flood"} label="Simulate Flood" onClick={() => simulate("flood")} />
              <TriggerButton loading={actionLoading === "curfew"} label="Simulate Curfew" onClick={() => simulate("curfew")} />
              <TriggerButton loading={actionLoading === "fraud"} label="Simulate Fraud" onClick={() => simulate("fraud")} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Portfolio KPIs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Line label="Claims This Week" value={`${claimsThisWeek}`} />
            <Line label="Income Protected" value={rupee(incomeProtected)} />
            <Line label="Payout Ratio" value={`${(payoutRatio * 100).toFixed(1)}%`} />
            <Line label="Loss Ratio" value={`${(lossRatio * 100).toFixed(1)}%`} />
            <Line label="Fraud Risk" value={fraud?.riskLevel ?? "-"} />
            <Badge tone={risk === "HIGH" ? "danger" : "success"}>{risk === "HIGH" ? "High Exposure" : "Stable"}</Badge>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fraud Snapshot</CardTitle>
            <CardDescription>Interpretation-first fraud analysis for claim trust decisions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Line label="Fraud Probability" value={`${(((fraud?.fraudProbability ?? 0) || (fraud?.fraudScore ?? 0) / 100) * 100).toFixed(1)}%`} />
            <Line label="Movement Integrity" value={`${fraud?.movementScore ?? 0}%`} />
            <Line label="Location Anomaly" value={`${fraud?.locationAnomaly ?? 0}%`} />
            <Line label="Device Consistency" value={`${fraud?.deviceConsistencyScore ?? 0}%`} />
            <Line label="Decision" value={fraud?.status ?? "SAFE"} />
            <p className="text-xs text-muted-foreground">
              {fraud?.status === "FRAUD"
                ? "High anomaly concentration detected. Claims move to rejection workflow."
                : fraud?.status === "UNDER REVIEW"
                  ? "Signals are mixed. Claim kept under review until confidence improves."
                  : "Signals are stable. Claim automation remains eligible."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actuarial Pricing Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Line label="Risk Probability" value={`${((premiumModel?.riskProbability ?? 0) * 100).toFixed(1)}%`} />
            <Line label="Expected Loss" value={rupee(premiumModel?.expectedLoss ?? 0)} />
            <Line label="Risk Loading" value={rupee(premiumModel?.riskLoading ?? 0)} />
            <Line label="Platform Cost" value={rupee(premiumModel?.platformCost ?? 0)} />
            <Line label="Safety Margin" value={rupee(premiumModel?.safetyMargin ?? 0)} />
            <Line label="Final Premium" value={rupee(premiumModel?.finalPremium ?? aiAdjustedPremium)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Decision Confidence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Line label="Risk Decision" value={`${aiInsights?.risk.decision ?? "-"} (${aiInsights?.risk.confidence ?? "-"})`} />
            <Line label="Fraud Decision" value={`${aiInsights?.fraud.decision ?? "-"} (${aiInsights?.fraud.confidence ?? "-"})`} />
            <Line label="Premium Decision" value={`${aiInsights?.premium.decision ?? "-"}`} />
            <Line label="Claim Decision" value={`${aiInsights?.claim.decision ?? "-"}`} />
            <p className="text-xs text-muted-foreground">{aiInsights?.claim.reason ?? AI_TRANSPARENCY_NOTE}</p>
          </CardContent>
        </Card>
      </section>

      {latestClaim ? (
        <Card>
          <CardHeader>
            <CardTitle>Claim Timeline</CardTitle>
            <CardDescription>
              Reason: {(latestClaim.reason ?? "NONE").replace("_", " ")} | Confidence: {latestClaim.confidenceScore ?? 0}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 md:grid-cols-2">
            {(latestClaim.timeline ?? []).map((item, index) => (
              <div key={`${item.step}-${index}`} className="rounded-lg border border-border/70 bg-white/45 p-3 text-sm dark:bg-slate-950/30">
                <p className="font-medium">{item.step}</p>
                <p className="text-xs text-muted-foreground">{item.status.toUpperCase()}</p>
              </div>
            ))}
            <div className="rounded-lg border border-border/70 bg-white/45 p-3 text-sm dark:bg-slate-950/30">
              <p className="font-medium">Payout</p>
              <p className="text-xs text-muted-foreground">
                Eligible {rupee(latestClaim.eligibleAmount ?? 0)} | Deductible {rupee(latestClaim.deductible ?? 0)} | Paid {rupee(latestClaim.payoutAmount)}
              </p>
              <p className="text-xs text-muted-foreground">{latestClaim.approvalReason ?? latestClaim.rejectionReason ?? "Pending decision"}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {risk === "HIGH" ? (
        <Card className="border-rose-500/50">
          <CardContent className="flex items-center gap-2 py-4 text-sm text-rose-500">
            <Siren className="h-4 w-4" /> Disruption detected. Zero-touch claim pipeline executed.
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Policy Lifecycle Workflow</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 space-y-0 md:grid-cols-2 text-sm">
          {(policyLifecycle.length
            ? policyLifecycle
            : [
                { step: "Applied", status: "active" },
                { step: "Risk Assessed", status: "pending" },
                { step: "Premium Calculated", status: "pending" },
                { step: "Active", status: "pending" },
                { step: "Monitoring", status: "pending" },
                { step: "Claim", status: "pending" },
                { step: "Payout", status: "pending" },
                { step: "Expired", status: "pending" },
                { step: "Renewal", status: "pending" }
              ]
          ).map((item) => (
            <div key={item.step} className="flex h-20 w-full items-center justify-between rounded-lg border border-border/70 bg-white/45 p-3 dark:bg-slate-950/30">
              <span className="font-medium">{item.step}</span>
              <Badge className="min-w-[72px] justify-center" tone={item.status === "done" ? "success" : item.status === "active" ? "warning" : "default"}>
                {item.status}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">{AI_TRANSPARENCY_NOTE}</p>
      {heavyLoading ? <p className="text-xs text-muted-foreground">Refreshing underwriting insights...</p> : null}
    </div>
  );
}

function TriggerButton({ loading, label, onClick }: { loading: boolean; label: string; onClick: () => void }) {
  return (
    <Button className="w-full" variant="outline" disabled={loading} onClick={onClick}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {loading ? "Please wait..." : label}
    </Button>
  );
}

function DashboardSkeleton() {
  return (
    <div className="page-stack">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl border border-border/70 bg-muted/40" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="h-56 animate-pulse rounded-xl border border-border/70 bg-muted/40 xl:col-span-2" />
        <div className="h-56 animate-pulse rounded-xl border border-border/70 bg-muted/40" />
      </div>
    </div>
  );
}

function KpiCard({ label, value, sub, icon: Icon }: { label: string; value: string; sub: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <Card className="h-full">
      <CardContent className="flex min-h-[120px] flex-col justify-between py-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{label}</p>
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <p className="mt-1 font-display text-xl font-semibold leading-tight">{value}</p>
        <p className="line-clamp-2 text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-h-[84px] h-full flex-col justify-between rounded-xl border border-border/70 bg-white/45 p-3 dark:bg-slate-950/30">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Clock3 className="h-3 w-3 text-primary" />
      </div>
      <p className="mt-1 text-base font-semibold leading-tight">{value}</p>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-muted/45 px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
