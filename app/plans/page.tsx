"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlanOption } from "@/lib/types";
import { rupee } from "@/lib/utils";
import { useZyroStore } from "@/lib/store";
import { calculateDynamicPremiumBreakdown } from "@/lib/engine";
import { AI_TRANSPARENCY_NOTE } from "@/lib/insurance";

const plans: PlanOption[] = [
  { code: "BASIC", name: "Basic", premium: 149, coverage: 500 },
  { code: "STANDARD", name: "Standard", premium: 249, coverage: 900, recommended: true },
  { code: "PRO", name: "Pro", premium: 399, coverage: 1400 }
];

export default function PlansPage() {
  const router = useRouter();
  const user = useZyroStore((s) => s.user);
  const setPlan = useZyroStore((s) => s.setPlan);
  const setPolicy = useZyroStore((s) => s.setPolicy);
  const setPolicyHistory = useZyroStore((s) => s.setPolicyHistory);
  const setAiAdjustedPremium = useZyroStore((s) => s.setAiAdjustedPremium);
  const risk = useZyroStore((s) => s.risk);
  const claimHistory = useZyroStore((s) => s.claimHistory);
  const fraud = useZyroStore((s) => s.fraud);
  const [loadingPlan, setLoadingPlan] = useState<PlanOption["code"] | null>(null);

  const premiumView = useMemo(() => {
    if (!user) {
      return {
        premium: 40,
        components: {
          expectedLoss: 25,
          riskLoading: 6,
          operationalCost: 8,
          historyAdjustment: 0,
          fraudAdjustment: 0,
          safetyDiscount: 0
        },
        expectedWeeklyLoss: 0
      };
    }
    return calculateDynamicPremiumBreakdown(user, risk, claimHistory, fraud);
  }, [user, risk, claimHistory, fraud]);

  async function choosePlan(plan: PlanOption) {
    if (!user) {
      router.push("/login");
      return;
    }

    setLoadingPlan(plan.code);
    try {
      const res = await fetch("/api/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "policy_select", plan })
      });

      if (!res.ok) throw new Error("Policy creation failed");

      const data = await res.json();
      setPlan(plan);
      setAiAdjustedPremium(data.aiAdjustedPremium ?? premiumView.premium);
      setPolicyHistory(data.policies ?? []);
      setPolicy(data.activePolicy ?? data.policies?.find((p: { status: string }) => p.status === "ACTIVE") ?? null);
      router.push("/dashboard");
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <main className="min-h-screen bg-mesh-light px-6 py-8 dark:bg-mesh-dark">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold">Weekly Insurance Plans</h1>
          <p className="text-sm text-muted-foreground">AI adjusted premium updates based on risk, claims, and fraud behavior.</p>
        </div>

        <div className="mb-5 grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="py-5">
              <p className="text-sm text-muted-foreground">AI Adjusted Premium</p>
              <p className="font-display text-3xl font-bold">{rupee(premiumView.premium)}</p>
              <p className="text-xs text-muted-foreground">Expected weekly loss benchmark: {rupee(premiumView.expectedWeeklyLoss)}</p>
              <p className="mt-2 text-xs text-muted-foreground">{AI_TRANSPARENCY_NOTE}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="grid gap-2 py-5 text-xs">
              <Row label="Expected Loss" value={premiumView.components.expectedLoss} />
              <Row label="Risk Loading" value={premiumView.components.riskLoading} />
              <Row label="Operational Cost" value={premiumView.components.operationalCost} />
              <Row label="History Adjustment" value={premiumView.components.historyAdjustment} />
              <Row label="Fraud Adjustment" value={premiumView.components.fraudAdjustment} />
              <Row label="Safety Discount" value={premiumView.components.safetyDiscount} />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div key={plan.code} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className={`h-full ${plan.recommended ? "ring-2 ring-primary/60" : ""}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{plan.name}</CardTitle>
                    {plan.recommended ? (
                      <span className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary">Recommended</span>
                    ) : null}
                  </div>
                  <CardDescription>Weekly base premium {rupee(plan.premium)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-display font-bold">{rupee(plan.coverage)}</p>
                  <p className="text-sm text-muted-foreground">Coverage per approved automated disruption claim</p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-secondary" /> Zero-touch claim lifecycle
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-secondary" /> 5 automated disruption triggers
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-secondary" /> AI pricing + fraud controls
                    </li>
                  </ul>
                  <Button className="mt-5 w-full" onClick={() => choosePlan(plan)} disabled={loadingPlan !== null}>
                    {loadingPlan === plan.code ? "Please wait..." : `Activate ${plan.name}`}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  const sign = value > 0 ? "+" : "";
  return (
    <div className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{sign}{value}</span>
    </div>
  );
}
