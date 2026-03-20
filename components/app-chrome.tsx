"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { BellRing, Menu, ShieldCheck, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { appNavItems, chromeRoutes } from "@/lib/navigation";
import { useZyroStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const user = useZyroStore((s) => s.user);
  const logout = useZyroStore((s) => s.logout);

  const showChrome = chromeRoutes.some((route) => pathname.startsWith(route));

  useEffect(() => {
    if (showChrome && !user) {
      router.push("/login");
    }
  }, [showChrome, user, router]);

  if (!showChrome) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-mesh-light dark:bg-mesh-dark">
      <div className="mx-auto flex min-h-screen max-w-[1500px] gap-4 p-3 md:p-4">
        <aside className="glass sticky top-4 hidden h-[calc(100vh-2rem)] w-72 flex-col rounded-2xl p-4 md:flex">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-primary/15 p-2 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-xl font-bold">ZyroShield</p>
              <p className="text-xs text-muted-foreground">Income Protection OS</p>
            </div>
          </div>

          <nav className="space-y-1">
            {appNavItems.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                    active ? "bg-primary text-primary-foreground" : "hover:bg-muted/60"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-xl border border-border/70 bg-white/40 p-4 dark:bg-slate-950/35">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-primary" /> Demo Mode
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Simulate rain, pollution, fraud, and instant payouts for pitch flow.</p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="glass sticky top-3 z-20 rounded-2xl px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 md:hidden">
                <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")}> 
                  <Menu className="h-4 w-4" />
                </Button>
                <p className="font-display text-lg font-semibold">ZyroShield</p>
              </div>

              <div className="hidden items-center gap-2 md:flex">
                <BellRing className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">AI risk monitor active</p>
              </div>

              <div className="flex items-center gap-2">
                <ThemeToggle />
                <div className="rounded-lg border border-border/70 bg-white/45 px-3 py-2 text-right text-xs dark:bg-slate-950/35">
                  <p className="font-semibold text-sm">{user?.name ?? "Guest Rider"}</p>
                  <p className="text-muted-foreground">{user?.city ?? "Bengaluru"}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    logout();
                    router.push("/login");
                  }}
                >
                  Logout
                </Button>
              </div>
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 md:hidden">
              {appNavItems.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold",
                      active ? "border-primary bg-primary/15 text-primary" : "border-border"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </header>

          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex-1 px-2 pb-2 pt-4 md:px-3"
          >
            {children}
          </motion.main>
        </div>
      </div>
    </div>
  );
}
