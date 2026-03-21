"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertTriangle, CloudFog, CloudRain, Loader2, Siren, SunMedium, Wallet2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useZyroStore } from "@/lib/store";
import { ClaimStatus } from "@/lib/types";
import { cn, rupee } from "@/lib/utils";

type SimType = "rain" | "pollution" | "fraud";

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
    dashboardCacheTs,
    demoMode,
    setRisk,
    setMetrics,
    setClaimStatus,
    setFraud,
    hydrateDashboardLite,
    hydrateDashboardHeavy
  } = useZyroStore();

  const [bootLoading, setBootLoading] = useState(false);
  const [heavyLoading, setHeavyLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

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
      } catch {
        if (!user) router.push("/login");
      } finally {
        if (mounted) setBootLoading(false);
      }
    }

    if (!hasLiteData || !cacheFresh) {
      loadLite();
    }

    return () => {
      mounted = false;
    };
  }, [hasLiteData, cacheFresh, user, router, demoMode, hydrateDashboardLite]);

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
      } catch {
        // Keep existing cached state if background load fails.
      } finally {
        if (mounted) setHeavyLoading(false);
      }
    }, 50);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [user, demoMode, hydrateDashboardHeavy, setMetrics, setRisk, setFraud]);

  async function simulate(mode: SimType) {
    if (!user || !plan) return;

    setActionLoading(true);
    try {
      const res = await fetch("/api/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "simulate",
          mode,
          userId: user.id,
          coverage: plan.coverage,
          demo: demoMode
        })
      });

      if (!res.ok) throw new Error("Simulation failed");

      const data = await res.json();
      setMetrics(data.metrics);
      setRisk(data.risk);
      setFraud(data.fraud);
      hydrateDashboardHeavy({
        claims: data.claims,
        payouts: data.payouts,
        payout: data.payout,
        fraud: data.fraud
      });

      const nextClaimStatus: ClaimStatus = data.claim
        ? data.claim.status === "APPROVED"
          ? "APPROVED"
          : "UNDER_REVIEW"
        : mode === "fraud"
          ? "UNDER_REVIEW"
          : data.risk === "HIGH"
            ? "TRIGGERED"
            : "IDLE";

      setClaimStatus(nextClaimStatus);
    } catch {
      // Preserve the current UI state if simulation fails.
    } finally {
      setActionLoading(false);
    }
  }

  if (bootLoading && !hasLiteData) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-4">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <InfoCard label="Rider" value={user?.name ?? "-"} sub={`${user?.city ?? "-"} | Income ${rupee(user?.income ?? 0)}`} />
        <InfoCard label="Weekly Plan" value={plan?.name ?? "Not selected"} sub={`Premium ${rupee(plan?.premium ?? 0)}`} />
        <InfoCard label="Coverage" value={rupee(plan?.coverage ?? 0)} sub="Per approved disruption" />
        <StatusCard label="Risk" status={risk} />
        <StatusCard label="Claim" status={claimStatus.replace("_", " ")} />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Environment Live Panel</CardTitle>
            <CardDescription>AI model inputs for parametric trigger</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              <Metric icon={CloudRain} label="Rainfall" value={`${metrics.rainfall} mm`} />
              <Metric icon={SunMedium} label="Temperature" value={`${metrics.temperature} C`} />
              <Metric icon={CloudFog} label="AQI" value={`${metrics.aqi}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Demo Controls</CardTitle>
            <CardDescription>Single-call scenario simulation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" disabled={actionLoading} onClick={() => simulate("rain")}>
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {actionLoading ? "Please wait..." : "Simulate Rain"}
            </Button>
            <Button className="w-full" variant="outline" disabled={actionLoading} onClick={() => simulate("pollution")}>
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {actionLoading ? "Please wait..." : "Simulate Pollution"}
            </Button>
            <Button className="w-full" variant="secondary" disabled={actionLoading} onClick={() => simulate("fraud")}>
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {actionLoading ? "Please wait..." : "Simulate Fraud"}
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> Fraud Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Line label="Fraud Score" value={fraud ? `${fraud.fraudScore}%` : "-"} />
            <Line label="Movement" value={fraud ? `${fraud.movementScore}%` : "-"} />
            <Line label="Claim Frequency" value={fraud ? `${fraud.claimFrequency}%` : "-"} />
            <Line label="Anomaly" value={fraud ? `${fraud.locationAnomaly}%` : "-"} />
            <Badge tone={fraud?.status === "FRAUD" ? "danger" : fraud?.status === "UNDER REVIEW" ? "warning" : "success"}>
              {fraud?.status ?? "SAFE"}
            </Badge>
            {heavyLoading ? <p className="text-xs text-muted-foreground">Refreshing detailed data...</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet2 className="h-4 w-4 text-emerald-500" /> Payout Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <motion.div
              className={cn(
                "rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4",
                latestPayout > 0 && "animate-pulse-success"
              )}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-xs text-emerald-600 dark:text-emerald-400">Latest payout</p>
              <p className="font-display text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {latestPayout ? `${rupee(latestPayout)} credited successfully` : "No payout yet"}
              </p>
            </motion.div>
            <div className="mt-3 text-xs text-muted-foreground">
              Total claims: {claimHistory.length} | Total payouts: {payoutHistory.length}
            </div>
          </CardContent>
        </Card>
      </section>

      {risk === "HIGH" ? (
        <Card className="border-rose-500/50">
          <CardContent className="flex items-center gap-2 py-4 text-sm text-rose-500">
            <Siren className="h-4 w-4" /> Environmental risk is HIGH. Claim trigger flow executed automatically.
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
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

function InfoCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <Card>
      <CardContent className="py-5">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 font-display text-xl font-semibold">{value}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}

function StatusCard({ label, status }: { label: string; status: string }) {
  const tone = status.includes("HIGH") ? "danger" : status.includes("REVIEW") ? "warning" : "success";
  return (
    <Card>
      <CardContent className="py-5">
        <p className="text-xs text-muted-foreground">{label}</p>
        <Badge className="mt-2" tone={tone as "danger" | "warning" | "success"}>
          {status}
        </Badge>
      </CardContent>
    </Card>
  );
}

function Metric({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/70 bg-white/45 p-4 dark:bg-slate-950/30">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="mt-1 text-xl font-semibold">{value}</p>
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
