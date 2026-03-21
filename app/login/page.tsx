"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { useZyroStore } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const setUser = useZyroStore((s) => s.setUser);
  const hydrateDashboardLite = useZyroStore((s) => s.hydrateDashboardLite);
  const setDemoMode = useZyroStore((s) => s.setDemoMode);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    router.prefetch("/dashboard");
  }, [router]);

  async function login(asGuest = false, demo = false) {
    if (!asGuest && !email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");
    const username = asGuest ? "Guest Rider" : email.split("@")[0].replace(/[._-]/g, " ");
    try {
      const response = await fetch("/api/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          name: username,
          city: "Bengaluru",
          income: 22000,
          demo
        })
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const dashboardData = await response.json();
      setUser(dashboardData.user);
      hydrateDashboardLite(dashboardData);
      setDemoMode(demo);
      router.push("/dashboard");
    } catch {
      setError("Unable to login right now. Please try again.");
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

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>Access your parametric income protection workspace</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="rider@email.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>

              {error ? <p className="text-sm text-rose-500">{error}</p> : null}

              <Button className="w-full" onClick={() => login(false)} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                {loading ? "Please wait..." : "Continue"}
              </Button>
              <Button variant="outline" className="w-full" onClick={() => login(true)} disabled={loading}>
                {loading ? "Please wait..." : "Continue as Guest"}
              </Button>
              <Button variant="secondary" className="w-full" onClick={() => login(true, true)} disabled={loading}>
                <Zap className="h-4 w-4" />
                {loading ? "Please wait..." : "Instant Demo Mode"}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                New here? <Link href="/register" className="text-primary">Create account</Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
