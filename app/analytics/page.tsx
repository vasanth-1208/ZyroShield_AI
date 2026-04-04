"use client";

import { useMemo } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ComposedChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useZyroStore } from "@/lib/store";

export default function AnalyticsPage() {
  const metrics = useZyroStore((s) => s.metrics);
  const claims = useZyroStore((s) => s.claimHistory);
  const premiumTrend = useZyroStore((s) => s.premiumTrend);
  const riskHistory = useZyroStore((s) => s.riskHistory);
  const fraudHistory = useZyroStore((s) => s.fraudHistory);
  const payoutHistory = useZyroStore((s) => s.payoutHistory);
  const lossRatio = useZyroStore((s) => s.lossRatio);
  const payoutRatio = useZyroStore((s) => s.payoutRatio);
  const riskProbability = useZyroStore((s) => s.riskProbability);
  const incomeProtected = useZyroStore((s) => s.incomeProtected);
  const policyHistory = useZyroStore((s) => s.policyHistory);

  const rainfallTrend = useMemo(
    () => Array.from({ length: 7 }).map((_, i) => ({ day: `D${i + 1}`, rainfall: Math.max(0, metrics.rainfall - 14 + i * 5 + (i % 2 ? 4 : -1)) })),
    [metrics.rainfall]
  );

  const aqiTrend = useMemo(
    () => Array.from({ length: 7 }).map((_, i) => ({ day: `D${i + 1}`, aqi: Math.max(45, metrics.aqi - 40 + i * 12 + (i % 2 ? 8 : -5)) })),
    [metrics.aqi]
  );

  const riskProbabilityTrend = useMemo(
    () => (riskHistory.length ? riskHistory.map((item, i) => ({ idx: i + 1, riskProbability: Math.round(item.probability * 100) })) : [{ idx: 1, riskProbability: 20 }]),
    [riskHistory]
  );

  const claimFrequency = useMemo(() => {
    const buckets = new Map<string, number>();
    claims.forEach((claim) => {
      const day = new Date(claim.date).toLocaleDateString();
      buckets.set(day, (buckets.get(day) ?? 0) + 1);
    });
    return Array.from(buckets.entries()).map(([day, count]) => ({ day, count }));
  }, [claims]);

  const riskVsPremium = useMemo(() => {
    const len = Math.max(riskHistory.length, premiumTrend.length);
    return Array.from({ length: len || 1 }).map((_, i) => ({
      idx: i + 1,
      risk: Math.round((riskHistory[i]?.probability ?? 0.2) * 100),
      premium: premiumTrend[i]?.premium ?? 40
    }));
  }, [riskHistory, premiumTrend]);

  const claimsVsWeather = useMemo(() => {
    const len = Math.max(7, claimFrequency.length);
    return Array.from({ length: len }).map((_, i) => ({
      idx: i + 1,
      claims: claimFrequency[i]?.count ?? 0,
      rainfall: rainfallTrend[i % rainfallTrend.length]?.rainfall ?? 0,
      aqi: aqiTrend[i % aqiTrend.length]?.aqi ?? 0
    }));
  }, [claimFrequency, rainfallTrend, aqiTrend]);

  const fraudTrend = useMemo(
    () => (fraudHistory.length ? fraudHistory.map((item, i) => ({ idx: i + 1, fraud: item.score })) : [{ idx: 1, fraud: 10 }]),
    [fraudHistory]
  );

  const payoutRatioSeries = useMemo(() => [{ label: "Payout Ratio", value: Number((payoutRatio * 100).toFixed(1)) }, { label: "Loss Ratio", value: Number((lossRatio * 100).toFixed(1)) }], [payoutRatio, lossRatio]);
  const fraudRate = useMemo(() => {
    if (!claims.length) return 0;
    const flagged = claims.filter((claim) => claim.fraudStatus === "FRAUD" || claim.status === "REJECTED").length;
    return flagged / claims.length;
  }, [claims]);
  const platformExposure = useMemo(() => policyHistory.reduce((sum, policy) => sum + policy.coverage, 0), [policyHistory]);
  const riskZoneComparison = useMemo(
    () => [
      { zone: "Low", premium: 120, claimProb: 18 },
      { zone: "Medium", premium: 220, claimProb: 34 },
      { zone: "High", premium: 340, claimProb: 58 }
    ],
    []
  );
  const incomeProtectedWeekly = useMemo(
    () =>
      Array.from({ length: 4 }).map((_, i) => ({
        week: `W${i + 1}`,
        amount: Math.max(0, incomeProtected - i * 220)
      })),
    [incomeProtected]
  );

  return (
    <div className="page-stack">
      <Card>
        <CardHeader>
          <CardTitle>Risk, Claims, and Actuarial Analytics</CardTitle>
          <CardDescription>Weather trends, claim behavior, premium movement, payout ratio, and fraud trajectory.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <MetricCard label="Claim Probability" value={`${(riskProbability * 100).toFixed(1)}%`} />
        <MetricCard label="Income Protected / Week" value={`Rs ${incomeProtected.toFixed(0)}`} />
        <MetricCard label="Payout Ratio" value={`${(payoutRatio * 100).toFixed(1)}%`} />
        <MetricCard label="Loss Ratio" value={`${(lossRatio * 100).toFixed(1)}%`} />
        <MetricCard label="Fraud Rate" value={`${(fraudRate * 100).toFixed(1)}%`} />
        <MetricCard label="Platform Exposure" value={`Rs ${platformExposure.toFixed(0)}`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Rainfall Trends"><AreaPlot data={rainfallTrend} xKey="day" yKey="rainfall" color="#0ea5e9" /></ChartCard>
        <ChartCard title="AQI Trends"><LinePlot data={aqiTrend} xKey="day" yKey="aqi" color="#f97316" /></ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Risk Probability Trend"><LinePlot data={riskProbabilityTrend} xKey="idx" yKey="riskProbability" color="#ef4444" /></ChartCard>
        <ChartCard title="Premium Trend"><LinePlot data={premiumTrend.length ? premiumTrend.map((p, i) => ({ idx: i + 1, premium: p.premium })) : [{ idx: 1, premium: 40 }]} xKey="idx" yKey="premium" color="#6366f1" /></ChartCard>
        <ChartCard title="Fraud Score Trend"><LinePlot data={fraudTrend} xKey="idx" yKey="fraud" color="#fb923c" /></ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Risk vs Premium Graph">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={riskVsPremium}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="idx" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="premium" fill="#4f46e5" radius={6} />
              <Line type="monotone" dataKey="risk" stroke="#ef4444" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Claims vs Weather Graph">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={claimsVsWeather}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="idx" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="claims" fill="#14b8a6" radius={6} />
              <Line type="monotone" dataKey="rainfall" stroke="#0ea5e9" strokeWidth={2} />
              <Line type="monotone" dataKey="aqi" stroke="#f59e0b" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Claim Frequency"><BarPlot data={claimFrequency.length ? claimFrequency : [{ day: "-", count: 0 }]} xKey="day" yKey="count" /></ChartCard>
        <ChartCard title="Payout Ratio / Loss Ratio"><BarPlot data={payoutRatioSeries} xKey="label" yKey="value" /></ChartCard>
        <ChartCard title="Payout Transactions">
          <BarPlot data={payoutHistory.length ? payoutHistory.map((p, i) => ({ idx: i + 1, amount: p.amount })) : [{ idx: 1, amount: 0 }]} xKey="idx" yKey="amount" />
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Risk Zone Comparison">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={riskZoneComparison}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="zone" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="premium" fill="#4f46e5" radius={6} />
              <Line type="monotone" dataKey="claimProb" stroke="#ef4444" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Income Protected Per Week">
          <BarPlot data={incomeProtectedWeekly} xKey="week" yKey="amount" />
        </ChartCard>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
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
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="h-72">{children}</CardContent>
    </Card>
  );
}

function LinePlot({ data, xKey, yKey, color }: { data: any[]; xKey: string; yKey: string; color: string }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function AreaPlot({ data, xKey, yKey, color }: { data: any[]; xKey: string; yKey: string; color: string }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`fill-${yKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.7} />
            <stop offset="100%" stopColor={color} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Area type="monotone" dataKey={yKey} stroke={color} fill={`url(#fill-${yKey})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function BarPlot({ data, xKey, yKey }: { data: any[]; xKey: string; yKey: string }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Bar dataKey={yKey} fill="#14b8a6" radius={6} />
      </BarChart>
    </ResponsiveContainer>
  );
}
