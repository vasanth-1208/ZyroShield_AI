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

export default function RegisterPage() {
  const router = useRouter();
  const setUser = useZyroStore((s) => s.setUser);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [income, setIncome] = useState("");
  const [error, setError] = useState("");

  async function submit() {
    if (!name.trim() || !city.trim() || Number(income) <= 0) {
      setError("Please provide valid name, city, and monthly income.");
      return;
    }
    setError("");
    try {
      const res = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          city: city.trim(),
          income: Number(income)
        })
      });

      if (!res.ok) {
        throw new Error("Registration failed");
      }

      const data = await res.json();
      setUser(data.user);
      router.push("/onboarding");
    } catch {
      setError("Unable to register right now. Please try again.");
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

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-lg">
          <Card>
            <CardHeader>
              <CardTitle>Create Account</CardTitle>
              <CardDescription>Set up your rider profile for weekly income-loss insurance</CardDescription>
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

              <div className="space-y-2">
                <label className="text-sm font-medium">Monthly Income (INR)</label>
                <Input
                  type="number"
                  min={0}
                  value={income}
                  onChange={(event) => setIncome(event.target.value)}
                  placeholder="24000"
                />
              </div>

              {error ? <p className="text-sm text-rose-500">{error}</p> : null}

              <Button className="w-full" onClick={submit}>
                Continue to Onboarding
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
