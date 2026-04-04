"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { BellRing, Menu, ShieldCheck, UserCircle2, MapPin } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { appNavItems, chromeRoutes } from "@/lib/navigation";
import { useZyroStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const user = useZyroStore((s) => s.user);
  const hasHydrated = useZyroStore((s) => s.hasHydrated);
  const logout = useZyroStore((s) => s.logout);

  const showChrome = chromeRoutes.some((route) => pathname.startsWith(route));

  useEffect(() => {
    if (showChrome && hasHydrated && !user) {
      router.push("/login");
    }
  }, [showChrome, hasHydrated, user, router]);

  if (!showChrome) {
    return <>{children}</>;
  }

  if (showChrome && !hasHydrated) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="min-h-screen bg-mesh-light dark:bg-mesh-dark">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-4 p-3 md:p-4">
        <aside className="glass sticky top-4 hidden h-[calc(100vh-2rem)] w-72 flex-col overflow-hidden rounded-2xl p-4 md:flex">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-primary/15 p-2 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-xl font-bold">ZyroShield</p>
              <p className="text-xs text-muted-foreground">Income Protection OS</p>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col">
            <nav className="space-y-1 overflow-y-auto pr-1">
              {appNavItems.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                  className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      active ? "bg-gradient-to-r from-primary to-cyan-500 text-primary-foreground shadow-[0_10px_25px_rgba(14,165,233,0.3)]" : "hover:bg-muted/60"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="glass sticky top-3 z-20 rounded-2xl px-4 py-3 shadow-[0_12px_28px_rgba(2,6,23,0.18)]">
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
                <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-white/55 px-3 py-2 dark:bg-slate-950/35">
                  <div className="rounded-full bg-primary/15 p-1.5 text-primary">
                    <UserCircle2 className="h-5 w-5" />
                  </div>
                  <div className="max-w-[180px]">
                    <p className="truncate text-sm font-semibold leading-tight">{user?.name ?? "Demo Rider"}</p>
                    <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {user?.city ?? "Bengaluru"} | Rs {user?.dailyIncome ?? 1200}/day
                    </p>
                  </div>
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
            className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-6"
          >
            {children}
          </motion.main>
        </div>
      </div>
    </div>
  );
}
