"use client";

import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useZyroStore } from "@/lib/store";

export default function AnalyticsPage() {
  const metrics = useZyroStore((s) => s.metrics);

  const rainfallTrend = useMemo(
    () =>
      Array.from({ length: 7 }).map((_, i) => ({
        day: `D${i + 1}`,
        rainfall: Math.max(0, metrics.rainfall - 14 + i * 5 + (i % 2 ? 4 : -1))
      })),
    [metrics.rainfall]
  );

  const aqiTrend = useMemo(
    () =>
      Array.from({ length: 7 }).map((_, i) => ({
        day: `D${i + 1}`,
        aqi: Math.max(45, metrics.aqi - 40 + i * 12 + (i % 2 ? 8 : -5))
      })),
    [metrics.aqi]
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>AI Risk Analytics</CardTitle>
          <CardDescription>Rainfall and AQI trends powering disruption probability</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Rainfall Trends</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={rainfallTrend}>
                <defs>
                  <linearGradient id="rainFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="rainfall" stroke="#0ea5e9" fill="url(#rainFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AQI Trends</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={aqiTrend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="aqi" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Risk Insights</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3 text-sm">
          <Insight title="Disruption Window" value="4 PM - 9 PM" note="High overlap with peak rider shifts." />
          <Insight title="Dominant Trigger" value="AQI spikes" note="Urban core routes show elevated pollution." />
          <Insight title="Prediction" value="Moderate to High" note="Next 48h exposure likely to stay elevated." />
        </CardContent>
      </Card>
    </div>
  );
}

function Insight({ title, value, note }: { title: string; value: string; note: string }) {
  return (
    <div className="rounded-xl border border-border/70 bg-white/45 p-4 dark:bg-slate-950/30">
      <p className="text-xs text-muted-foreground">{title}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{note}</p>
    </div>
  );
}
