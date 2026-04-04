"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Radar } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useZyroStore } from "@/lib/store";

const baseLogs = [
  "Geo-ping consistency check completed",
  "Shift route overlap model refreshed",
  "Anomaly detector synced with claim graph"
];

export default function SecurityPage() {
  const fraud = useZyroStore((s) => s.fraud);
  const fraudHistory = useZyroStore((s) => s.fraudHistory);
  const [logs, setLogs] = useState<string[]>(baseLogs);
  const [loading, setLoading] = useState(false);

  const chartData = useMemo(
    () => (fraudHistory.length ? fraudHistory.map((f, i) => ({ idx: i + 1, score: f.score })) : [{ idx: 1, score: 0 }]),
    [fraudHistory]
  );

  async function simulateFraud() {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "simulate", mode: "fraud" })
      });
      const data = await res.json();
      useZyroStore.setState({ fraud: data.fraud, claimStatus: "UNDER_REVIEW", fraudHistory: data.fraudHistory ?? fraudHistory });
      setLogs((prev) => [`High-risk spoofing signature detected at ${new Date().toLocaleTimeString()}`, ...prev].slice(0, 8));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-stack">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Radar className="h-5 w-5 text-primary" /> Fraud & Security Center</CardTitle>
          <CardDescription>Movement, location, behavior, and device consistency scoring with anomaly history.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 space-y-0 md:grid-cols-3">
          <Metric label="Fraud Probability" value={fraud ? `${((fraud.fraudProbability ?? fraud.fraudScore / 100) * 100).toFixed(1)}%` : "0%"} />
          <Metric label="Fraud Score" value={fraud ? `${fraud.fraudScore}%` : "0%"} />
          <Metric label="Risk Level" value={fraud?.riskLevel ?? "LOW"} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Signal Breakdown</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <LineItem label="Movement Pattern" value={`${fraud?.movementScore ?? 0}%`} />
            <LineItem label="Location Anomaly" value={`${fraud?.locationAnomaly ?? 0}%`} />
            <LineItem label="Claim Frequency" value={`${fraud?.claimFrequency ?? 0}%`} />
            <LineItem label="Device Consistency" value={`${fraud?.deviceConsistencyScore ?? 0}%`} />
            <LineItem label="Behavior Anomaly" value={`${fraud?.behaviorAnomalyScore ?? 0}%`} />
            <div className="flex items-center gap-3 pt-1">
              <Badge tone={fraud?.status === "FRAUD" ? "danger" : fraud?.status === "UNDER REVIEW" ? "warning" : "success"}>
                {fraud?.status ?? "SAFE"}
              </Badge>
              <Button onClick={simulateFraud} disabled={loading}>{loading ? "Please wait..." : "Simulate Fraud"}</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Fraud Risk History</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="idx" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#f97316" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" /> Activity Logs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {logs.map((log, i) => (
            <div key={`${log}-${i}`} className="rounded-lg border border-border/70 bg-white/45 px-3 py-2 dark:bg-slate-950/30">{log}</div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-h-[78px] flex-col justify-between rounded-xl border border-border/70 bg-white/45 p-3 dark:bg-slate-950/30">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold leading-tight">{value}</p>
    </div>
  );
}

function LineItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-muted/45 px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
