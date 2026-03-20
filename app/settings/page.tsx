"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useZyroStore } from "@/lib/store";

export default function SettingsPage() {
  const router = useRouter();
  const user = useZyroStore((s) => s.user);
  const updateUser = useZyroStore((s) => s.updateUser);
  const logout = useZyroStore((s) => s.logout);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [income, setIncome] = useState(0);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setCity(user.city);
    setIncome(user.income);
  }, [user]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Manage profile, preferences, and session controls</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input value={name} onChange={(event) => setName(event.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">City</label>
              <Input value={city} onChange={(event) => setCity(event.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Monthly Income (INR)</label>
            <Input type="number" value={income} onChange={(event) => setIncome(Number(event.target.value))} />
          </div>

          <label className="flex items-center justify-between rounded-xl border border-border/70 bg-white/45 px-4 py-3 text-sm dark:bg-slate-950/30">
            Enable risk & payout notifications
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={notifications}
              onChange={(event) => setNotifications(event.target.checked)}
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => updateUser({ name, city, income })}>Save Changes</Button>
            <Button
              variant="outline"
              onClick={() => {
                logout();
                router.push("/login");
              }}
            >
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
