"use client";

import { useState } from "react";
import { AlertTriangle, Radar } from "lucide-react";
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
  const [logs, setLogs] = useState<string[]>(baseLogs);

  async function simulateFraud() {
    const res = await fetch("/api/dashboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "simulate", mode: "fraud" })
    });
    const data = await res.json();
    useZyroStore.setState({ fraud: data.fraud, claimStatus: "UNDER_REVIEW" });
    setLogs((prev) => [`High-risk spoofing signature detected at ${new Date().toLocaleTimeString()}`, ...prev].slice(0, 8));
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radar className="h-5 w-5 text-primary" /> Fraud & Security Center
          </CardTitle>
          <CardDescription>Anti-GPS spoofing, repeated claim analysis, and behavioral anomaly detection</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Metric label="Fraud Score" value={fraud ? `${fraud.fraudScore}%` : "0%"} />
          <Metric label="Movement Integrity" value={fraud ? `${fraud.movementScore}%` : "-"} />
          <Metric label="Location Anomaly" value={fraud ? `${fraud.locationAnomaly}%` : "-"} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Threat Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Badge tone={fraud?.status === "FRAUD" ? "danger" : fraud?.status === "UNDER REVIEW" ? "warning" : "success"}>
              {fraud?.status ?? "SAFE"}
            </Badge>
            <p className="text-sm text-muted-foreground">
              Anti-spoofing combines rider movement confidence, claim frequency, and location anomaly to identify high-risk claims.
            </p>
            <Button onClick={simulateFraud}>Simulate Fraud</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> Activity Logs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {logs.map((log, i) => (
              <div key={`${log}-${i}`} className="rounded-lg border border-border/70 bg-white/45 px-3 py-2 dark:bg-slate-950/30">
                {log}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/70 bg-white/45 p-4 dark:bg-slate-950/30">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}
