"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useZyroStore } from "@/lib/store";
import { rupee } from "@/lib/utils";

export default function IncomeRiskCalculatorPage() {
  const economics = useZyroStore((s) => s.economics);
  const [dailyIncome, setDailyIncome] = useState(economics?.hourlyIncome ? economics.hourlyIncome * 10 : 1000);
  const [hoursLost, setHoursLost] = useState(5);
  const [weeklyDisruptions, setWeeklyDisruptions] = useState(2);
  const [riskLevel, setRiskLevel] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");

  const result = useMemo(() => {
    const hourly = dailyIncome / 10;
    const lossPerEvent = hourly * hoursLost;
    const weeklyLoss = lossPerEvent * weeklyDisruptions;
    const riskMultiplier = riskLevel === "LOW" ? 0.9 : riskLevel === "HIGH" ? 1.25 : 1;
    const recommendedCoverage = Math.round(Math.max(500, Math.min(2500, weeklyLoss * 1.3 * riskMultiplier)) / 50) * 50;
    const recommendedPremium = Math.round(Math.max(35, recommendedCoverage * (0.055 + (riskLevel === "HIGH" ? 0.03 : riskLevel === "MEDIUM" ? 0.015 : 0.005))));
    return { hourly, lossPerEvent, weeklyLoss, recommendedCoverage, recommendedPremium };
  }, [dailyIncome, hoursLost, weeklyDisruptions, riskLevel]);

  return (
    <div className="page-stack">
      <Card>
        <CardHeader>
          <CardTitle>Income Risk Calculator</CardTitle>
          <CardDescription>Estimate disruption loss and AI coverage recommendation for your delivery profile.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="grid gap-6 space-y-0 py-5 md:grid-cols-4">
          <Field label="Daily Income (Rs)">
            <Input type="number" value={dailyIncome} onChange={(e) => setDailyIncome(Number(e.target.value || 0))} />
          </Field>
          <Field label="Hours Lost Per Event">
            <Input type="number" value={hoursLost} onChange={(e) => setHoursLost(Number(e.target.value || 0))} />
          </Field>
          <Field label="Weekly Disruptions">
            <Input type="number" value={weeklyDisruptions} onChange={(e) => setWeeklyDisruptions(Number(e.target.value || 0))} />
          </Field>
          <Field label="Risk Level">
            <select
              value={riskLevel}
              onChange={(event) => setRiskLevel(event.target.value as "LOW" | "MEDIUM" | "HIGH")}
              className="h-10 w-full rounded-lg border border-border bg-white/60 px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring dark:bg-slate-900/50"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </Field>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-5">
        <Stat label="Hourly Income" value={rupee(Math.round(result.hourly))} />
        <Stat label="Loss Per Event" value={rupee(Math.round(result.lossPerEvent))} />
        <Stat label="Weekly Risk Exposure" value={rupee(Math.round(result.weeklyLoss))} />
        <Stat label="Recommended Coverage" value={rupee(result.recommendedCoverage)} />
        <Stat label="Recommended Premium" value={rupee(result.recommendedPremium)} />
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="py-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 text-lg font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
