"use client";

import { useMemo } from "react";
import { LineChart, Line, ResponsiveContainer, CartesianGrid, Tooltip, XAxis, YAxis, BarChart, Bar } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useZyroStore } from "@/lib/store";

export default function AdminRiskMonitorPage() {
  const claims = useZyroStore((s) => s.claimHistory);
  const payouts = useZyroStore((s) => s.payoutHistory);
  const riskHistory = useZyroStore((s) => s.riskHistory);
  const fraudHistory = useZyroStore((s) => s.fraudHistory);
  const lossRatio = useZyroStore((s) => s.lossRatio);
  const policyHistory = useZyroStore((s) => s.policyHistory);
  const walletBalance = useZyroStore((s) => s.walletBalance);

  const statusMix = useMemo(() => {
    const map = new Map<string, number>();
    claims.forEach((claim) => map.set(claim.status, (map.get(claim.status) ?? 0) + 1));
    return Array.from(map.entries()).map(([status, count]) => ({ status, count }));
  }, [claims]);
  const platformExposure = policyHistory.reduce((sum, policy) => sum + policy.coverage, 0);
  const liquidityPool = Math.max(0, walletBalance + policyHistory.reduce((sum, policy) => sum + policy.aiAdjustedPremium, 0) - payouts.reduce((s, p) => s + p.amount, 0));

  return (
    <div className="page-stack">
      <Card>
        <CardHeader>
          <CardTitle>Admin Risk Monitor</CardTitle>
          <CardDescription>Portfolio-level oversight for risk, fraud, and claims automation health.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <Tile label="Total Policies" value={`${policyHistory.length}`} />
        <Tile label="Claims Processed" value={`${claims.length}`} />
        <Tile label="Payout Transactions" value={`${payouts.length}`} />
        <Tile label="Current Loss Ratio" value={`${(lossRatio * 100).toFixed(1)}%`} />
        <Tile label="Fraud Alerts" value={`${fraudHistory.filter((f) => f.level === "HIGH").length}`} />
        <Tile label="Platform Exposure" value={`Rs ${platformExposure.toFixed(0)}`} />
        <Tile label="Liquidity Pool" value={`Rs ${liquidityPool.toFixed(0)}`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Risk Probability History">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={riskHistory.map((r, i) => ({ idx: i + 1, p: Math.round(r.probability * 100) }))}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="idx" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="p" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Fraud Score History">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={fraudHistory.map((f, i) => ({ idx: i + 1, s: f.score }))}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="idx" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="s" stroke="#f97316" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Claim Decision Distribution">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={statusMix.length ? statusMix : [{ status: "NONE", count: 0 }]}> 
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="status" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#14b8a6" radius={6} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="py-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 text-xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-72">{children}</CardContent>
    </Card>
  );
}
