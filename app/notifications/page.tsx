"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useZyroStore } from "@/lib/store";

export default function NotificationsPage() {
  const notifications = useZyroStore((s) => s.notifications);

  return (
    <div className="page-stack">
      <Card>
        <CardHeader>
          <CardTitle>Notifications & Alerts</CardTitle>
          <CardDescription>Policy renewals, risk alerts, premium changes, claim and payout events.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="space-y-3 py-5">
          {notifications.length ? (
            notifications.map((item) => (
              <div key={item.id} className="rounded-xl border border-border/70 bg-white/45 p-3 dark:bg-slate-950/30">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="font-semibold text-sm">{item.title}</p>
                  <Badge tone={item.level === "success" ? "success" : item.level === "warning" ? "warning" : "default"}>{item.level.toUpperCase()}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                <p className="mt-1 text-xs text-muted-foreground">{new Date(item.date).toLocaleString()}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No alerts yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
