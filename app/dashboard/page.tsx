"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertTriangle, CloudFog, CloudRain, Siren, SunMedium, Wallet2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useZyroStore } from "@/lib/store";
import { ClaimStatus } from "@/lib/types";
import { cn, rupee } from "@/lib/utils";

type SimType = "rain" | "pollution";

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
    setRisk,
    setMetrics,
    setClaimStatus,
    setFraud,
    addClaim,
    addPayout,
    hydratePayouts
  } = useZyroStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!plan) {
      router.push("/plans");
      return;
    }

    const loadPayouts = async () => {
      const res = await fetch("/api/payout");
      const data = await res.json();
      hydratePayouts(data.payouts ?? []);
    };

    loadPayouts();
  }, [user, plan, router, hydratePayouts]);

  async function simulateRisk(mode: SimType) {
    if (!user || !plan) return;
    setLoading(true);

    const riskRes = await fetch(`/api/risk?simulate=${mode}`);
    const riskData = await riskRes.json();
    setMetrics(riskData.metrics);
    setRisk(riskData.risk);

    if (riskData.risk === "HIGH") {
      setClaimStatus("TRIGGERED");

      const fraudRes = await fetch("/api/fraud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimCount: claimHistory.length + 1 })
      });
      const fraudData = await fraudRes.json();
      setFraud(fraudData.fraud);

      const claimRes = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          risk: riskData.risk,
          fraudStatus: fraudData.fraud.status,
          coverage: plan.coverage
        })
      });
      const claimData = await claimRes.json();
      const mappedStatus: ClaimStatus =
        claimData.claim.status === "APPROVED"
          ? "APPROVED"
          : claimData.claim.status === "UNDER_REVIEW"
            ? "UNDER_REVIEW"
            : "TRIGGERED";
      setClaimStatus(mappedStatus);
      addClaim(claimData.claim);

      if (claimData.payout) {
        addPayout(claimData.payout);
      }
    }

    setLoading(false);
  }

  async function simulateFraud() {
    const fraudRes = await fetch("/api/fraud", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ simulateFraud: true })
    });
    const fraudData = await fraudRes.json();
    setFraud(fraudData.fraud);
    setClaimStatus("UNDER_REVIEW");
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
            <CardDescription>Required hackathon simulation actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" disabled={loading} onClick={() => simulateRisk("rain")}>
              Simulate Rain
            </Button>
            <Button className="w-full" variant="outline" disabled={loading} onClick={() => simulateRisk("pollution")}>
              Simulate Pollution
            </Button>
            <Button className="w-full" variant="secondary" disabled={loading} onClick={simulateFraud}>
              Simulate Fraud
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
