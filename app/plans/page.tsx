"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlanOption } from "@/lib/types";
import { rupee } from "@/lib/utils";
import { useZyroStore } from "@/lib/store";

const plans: PlanOption[] = [
  { code: "BASIC", name: "Basic", premium: 149, coverage: 500 },
  { code: "STANDARD", name: "Standard", premium: 249, coverage: 900, recommended: true },
  { code: "PRO", name: "Pro", premium: 399, coverage: 1400 }
];

export default function PlansPage() {
  const router = useRouter();
  const user = useZyroStore((s) => s.user);
  const setPlan = useZyroStore((s) => s.setPlan);
  const [loadingPlan, setLoadingPlan] = useState<PlanOption["code"] | null>(null);

  async function choosePlan(plan: PlanOption) {
    if (!user) {
      router.push("/login");
      return;
    }

    setLoadingPlan(plan.code);
    try {
      await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, ...plan })
      });

      setPlan(plan);
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
          <p className="text-sm text-muted-foreground">Only income-loss protection. No health or vehicle coverage.</p>
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
                  <CardDescription>Weekly premium {rupee(plan.premium)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-display font-bold">{rupee(plan.coverage)}</p>
                  <p className="text-sm text-muted-foreground">Coverage per approved disruption claim</p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-secondary" /> Auto parametric claims
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-secondary" /> AI risk scoring
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-secondary" /> Fraud safeguard
                    </li>
                  </ul>
                  <Button className="mt-5 w-full" onClick={() => choosePlan(plan)} disabled={loadingPlan !== null}>
                    {loadingPlan === plan.code ? "Please wait..." : `Select ${plan.name}`}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Plan Comparison</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3 text-sm">
            <div className="rounded-xl border border-border/70 p-4 bg-white/40 dark:bg-slate-950/30">
              <p className="font-medium">Basic</p>
              <p className="text-muted-foreground">Best for part-time riders in low disruption zones.</p>
            </div>
            <div className="rounded-xl border border-border/70 p-4 bg-white/40 dark:bg-slate-950/30">
              <p className="font-medium">Standard</p>
              <p className="text-muted-foreground">Balanced premium and coverage for daily riders.</p>
            </div>
            <div className="rounded-xl border border-border/70 p-4 bg-white/40 dark:bg-slate-950/30">
              <p className="font-medium">Pro</p>
              <p className="text-muted-foreground">Higher payout for cities with heavy rain and AQI spikes.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
