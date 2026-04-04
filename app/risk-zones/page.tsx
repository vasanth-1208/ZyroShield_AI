"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RISK_ZONE_FACTORS } from "@/lib/insurance";
import { useZyroStore } from "@/lib/store";

const zoneBlocks = [
  { zone: "LOW_RISK", city: "Mysuru", disruption: "Low", tone: "success" as const },
  { zone: "MEDIUM_RISK", city: "Bengaluru", disruption: "Moderate", tone: "warning" as const },
  { zone: "HIGH_RISK", city: "Chennai", disruption: "High", tone: "danger" as const }
];

export default function RiskZonesPage() {
  const user = useZyroStore((s) => s.user);

  return (
    <div className="page-stack">
      <Card>
        <CardHeader>
          <CardTitle>Risk Zones Map</CardTitle>
          <CardDescription>Operational risk zoning for premium and coverage calibration.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {zoneBlocks.map((item) => (
          <Card key={item.zone}>
            <CardHeader>
              <CardTitle>{item.zone.replace("_", " ")}</CardTitle>
              <CardDescription>{item.city}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>Zone multiplier: <span className="font-semibold">{RISK_ZONE_FACTORS[item.zone as keyof typeof RISK_ZONE_FACTORS]}x</span></p>
              <p>Disruption intensity: <span className="font-semibold">{item.disruption}</span></p>
              <Badge tone={item.tone}>{item.disruption} exposure</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Zone</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <p>Worker: <span className="font-semibold">{user?.name ?? "-"}</span></p>
          <p>Current zone: <span className="font-semibold">{user?.workingZone?.replace("_", " ") ?? "-"}</span></p>
          <p className="text-xs text-muted-foreground mt-2">Claims outside registered zone are excluded by policy rules.</p>
        </CardContent>
      </Card>
    </div>
  );
}
