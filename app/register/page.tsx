"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { useZyroStore } from "@/lib/store";
import { VehicleType, WorkingZone } from "@/lib/types";

const vehicleOptions: VehicleType[] = ["BIKE", "SCOOTER", "BICYCLE", "E_BIKE"];
const zoneOptions: WorkingZone[] = ["LOW_RISK", "MEDIUM_RISK", "HIGH_RISK"];

export default function RegisterPage() {
  const router = useRouter();
  const setUser = useZyroStore((s) => s.setUser);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [dailyIncome, setDailyIncome] = useState("");
  const [vehicleType, setVehicleType] = useState<VehicleType>("BIKE");
  const [workingZone, setWorkingZone] = useState<WorkingZone>("MEDIUM_RISK");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!name.trim() || !city.trim() || Number(dailyIncome) <= 0) {
      setError("Please provide valid name, city, and daily income.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          city: city.trim(),
          dailyIncome: Number(dailyIncome),
          vehicleType,
          workingZone
        })
      });

      if (!res.ok) throw new Error("Registration failed");

      const data = await res.json();
      setUser(data.user);
      router.push("/plans");
    } catch {
      setError("Unable to register right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-mesh-light px-6 py-8 dark:bg-mesh-dark">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="font-display text-2xl font-bold">
            ZyroShield
          </Link>
          <ThemeToggle />
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Worker Registration</CardTitle>
              <CardDescription>Set up your protection profile before choosing a weekly policy.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Rahul Kumar" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">City</label>
                  <Input value={city} onChange={(event) => setCity(event.target.value)} placeholder="Mumbai" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Daily Income (INR)</label>
                  <Input
                    type="number"
                    min={0}
                    value={dailyIncome}
                    onChange={(event) => setDailyIncome(event.target.value)}
                    placeholder="1200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Vehicle Type</label>
                  <select
                    value={vehicleType}
                    onChange={(event) => setVehicleType(event.target.value as VehicleType)}
                    className="h-10 w-full rounded-lg border border-border bg-white/60 px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring dark:bg-slate-900/50"
                  >
                    {vehicleOptions.map((option) => (
                      <option key={option} value={option}>
                        {option.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Working Zone</label>
                  <select
                    value={workingZone}
                    onChange={(event) => setWorkingZone(event.target.value as WorkingZone)}
                    className="h-10 w-full rounded-lg border border-border bg-white/60 px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring dark:bg-slate-900/50"
                  >
                    {zoneOptions.map((option) => (
                      <option key={option} value={option}>
                        {option.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {error ? <p className="text-sm text-rose-500">{error}</p> : null}

              <Button className="w-full" onClick={submit} disabled={loading}>
                {loading ? "Please wait..." : "Continue to Plan Selection"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Already have an account? <Link href="/login" className="text-primary">Login</Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
