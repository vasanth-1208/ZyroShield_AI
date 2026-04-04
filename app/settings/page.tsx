"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useZyroStore } from "@/lib/store";
import { VehicleType, WorkingZone } from "@/lib/types";

export default function SettingsPage() {
  const router = useRouter();
  const user = useZyroStore((s) => s.user);
  const updateUser = useZyroStore((s) => s.updateUser);
  const logout = useZyroStore((s) => s.logout);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [dailyIncome, setDailyIncome] = useState(0);
  const [vehicleType, setVehicleType] = useState<VehicleType>("BIKE");
  const [workingZone, setWorkingZone] = useState<WorkingZone>("MEDIUM_RISK");
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setCity(user.city);
    setDailyIncome(user.dailyIncome);
    setVehicleType(user.vehicleType);
    setWorkingZone(user.workingZone);
  }, [user]);

  return (
    <div className="page-stack">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Manage profile, preferences, and session controls</CardDescription>
        </CardHeader>
        <CardContent className="page-stack">
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

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Daily Income (INR)</label>
              <Input type="number" value={dailyIncome} onChange={(event) => setDailyIncome(Number(event.target.value))} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Vehicle Type</label>
              <select
                value={vehicleType}
                onChange={(event) => setVehicleType(event.target.value as VehicleType)}
                className="h-10 w-full rounded-lg border border-border bg-white/60 px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring dark:bg-slate-900/50"
              >
                {(["BIKE", "SCOOTER", "BICYCLE", "E_BIKE"] as const).map((option) => (
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
                {(["LOW_RISK", "MEDIUM_RISK", "HIGH_RISK"] as const).map((option) => (
                  <option key={option} value={option}>
                    {option.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
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
            <Button onClick={() => updateUser({ name, city, dailyIncome, vehicleType, workingZone })}>Save Changes</Button>
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
