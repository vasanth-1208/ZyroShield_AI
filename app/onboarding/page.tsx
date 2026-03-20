"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useZyroStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const workerTypes = ["Bike Delivery", "Bicycle Delivery", "Part-time Rider"];
const shiftTypes = ["Morning", "Evening", "Full Day"];
const payoutStyles = ["Instant Wallet", "Daily Transfer", "Weekly Settlement"];

export default function OnboardingPage() {
  const router = useRouter();
  const user = useZyroStore((s) => s.user);
  const [step, setStep] = useState(0);
  const [workerType, setWorkerType] = useState(workerTypes[0]);
  const [shiftType, setShiftType] = useState(shiftTypes[0]);
  const [payoutStyle, setPayoutStyle] = useState(payoutStyles[0]);

  const progress = useMemo(() => ((step + 1) / 3) * 100, [step]);

  if (!user) {
    router.push("/register");
    return null;
  }

  return (
    <main className="min-h-screen bg-mesh-light px-6 py-8 dark:bg-mesh-dark">
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Onboarding Setup</CardTitle>
            <CardDescription>Step {step + 1} of 3 for {user.name}</CardDescription>
            <div className="h-2 w-full rounded-full bg-muted">
              <motion.div
                className="h-2 rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 0 ? <Step title="Choose worker type" items={workerTypes} value={workerType} onChange={setWorkerType} /> : null}
            {step === 1 ? <Step title="Preferred shift window" items={shiftTypes} value={shiftType} onChange={setShiftType} /> : null}
            {step === 2 ? <Step title="Preferred payout mode" items={payoutStyles} value={payoutStyle} onChange={setPayoutStyle} /> : null}

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
                Back
              </Button>
              <Button onClick={() => (step === 2 ? router.push("/plans") : setStep((s) => s + 1))}>
                {step === 2 ? "Continue to Plans" : "Next"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function Step({
  title,
  items,
  value,
  onChange
}: {
  title: string;
  items: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="mb-3 text-sm font-medium">{title}</p>
      <div className="grid gap-2 sm:grid-cols-3">
        {items.map((item) => (
          <button
            key={item}
            onClick={() => onChange(item)}
            className={cn(
              "rounded-xl border p-3 text-left text-sm transition",
              value === item ? "border-primary bg-primary/10" : "border-border/80 bg-white/45 hover:bg-muted/50 dark:bg-slate-900/35"
            )}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
