"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Bot, CloudRain, ShieldCheck, WalletCards, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

const features = [
  {
    icon: ShieldCheck,
    title: "Parametric Income Cover",
    desc: "Claims trigger from disruption signals, not paperwork."
  },
  {
    icon: Bot,
    title: "AI Risk Intelligence",
    desc: "Rainfall and AQI patterns predict rider income-loss windows."
  },
  {
    icon: Wind,
    title: "Fraud & Anti-Spoofing",
    desc: "Movement and anomaly checks help prevent false claims."
  },
  {
    icon: WalletCards,
    title: "Instant Payout Rail",
    desc: "Approved claims simulate wallet credit in seconds."
  }
];

const steps = [
  "Rider enrolls in a weekly income-loss plan",
  "Weather and AQI signals stream into AI risk engine",
  "High disruption auto-triggers parametric claim",
  "Fraud checks run before instant payout simulation"
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-mesh-light px-6 py-8 dark:bg-mesh-dark">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between">
          <div>
            <p className="font-display text-2xl font-bold">ZyroShield</p>
            <p className="text-xs text-muted-foreground">AI-powered income protection for gig riders</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
          </div>
        </header>

        <section className="mt-14 grid items-center gap-10 md:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <p className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Weekly insurance for delivery worker income-loss only
            </p>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight md:text-6xl">
              Get paid when rain and pollution pause your delivery earnings.
            </h1>
            <p className="mt-4 text-muted-foreground">
              ZyroShield is a startup-grade parametric insurance platform designed for Swiggy and Zomato riders. It
              auto-detects environmental disruptions, triggers claims, runs fraud checks, and simulates instant payouts.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register">
                <Button size="lg" className="group">
                  Create Account
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Continue to Demo
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.08 }}
            className="glass rounded-2xl p-6 shadow-glow"
          >
            <div className="grid grid-cols-2 gap-4">
              {[
                ["Avg Weekly Premium", "₹249"],
                ["Payout Window", "< 5 sec"],
                ["Risk Inputs", "Rain + AQI"],
                ["Fraud Layer", "GPS + Claims"]
              ].map(([title, value]) => (
                <div key={title} className="rounded-xl border border-white/20 bg-white/50 p-4 dark:bg-slate-900/35">
                  <p className="text-xs text-muted-foreground">{title}</p>
                  <p className="mt-1 text-lg font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        <section className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <feature.icon className="h-5 w-5 text-primary" />
                  <CardTitle className="mt-2">{feature.title}</CardTitle>
                  <CardDescription>{feature.desc}</CardDescription>
                </CardHeader>
                <CardContent />
              </Card>
            </motion.div>
          ))}
        </section>

        <section className="mt-16">
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
              <CardDescription>Simple onboarding, autonomous risk-to-payout workflow</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {steps.map((step, idx) => (
                  <div key={step} className="rounded-xl border border-border/70 bg-white/45 p-4 dark:bg-slate-950/30">
                    <p className="text-xs font-semibold text-primary">STEP {idx + 1}</p>
                    <p className="mt-1 text-sm">{step}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <CloudRain className="h-4 w-4" /> Built for real-world disruption days across Indian cities.
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
