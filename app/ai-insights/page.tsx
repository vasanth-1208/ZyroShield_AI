"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useZyroStore } from "@/lib/store";

export default function AiInsightsPage() {
  const aiInsights = useZyroStore((s) => s.aiInsights);

  if (!aiInsights) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Decision Insights</CardTitle>
          <CardDescription>No inference data available yet.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="page-stack">
      <Card>
        <CardHeader>
          <CardTitle>AI Decision Insights</CardTitle>
          <CardDescription>Probability, confidence, and explainable decision traces from each engine.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <InsightCard title="Risk Prediction Engine" decision={aiInsights.risk.decision} probability={aiInsights.risk.probability} confidence={aiInsights.risk.confidence} reason={aiInsights.risk.reason} />
        <InsightCard title="Fraud Detection Engine" decision={aiInsights.fraud.decision} probability={aiInsights.fraud.probability} confidence={aiInsights.fraud.confidence} reason={aiInsights.fraud.reason} />
        <InsightCard title="Dynamic Premium Engine" decision={aiInsights.premium.decision} probability={aiInsights.premium.probability} confidence={aiInsights.premium.confidence} reason={aiInsights.premium.reason} />
        <InsightCard title="Claim Decision Engine" decision={aiInsights.claim.decision} probability={aiInsights.claim.probability} confidence={aiInsights.claim.confidence} reason={aiInsights.claim.reason} />
      </div>
    </div>
  );
}

function InsightCard({ title, probability, decision, confidence, reason }: { title: string; probability: number; decision: string; confidence: string; reason: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center justify-between rounded-md bg-muted/45 px-3 py-2">
          <span>Probability</span>
          <span className="font-semibold">{(probability * 100).toFixed(1)}%</span>
        </div>
        <div className="flex items-center justify-between rounded-md bg-muted/45 px-3 py-2">
          <span>Decision</span>
          <span className="font-semibold">{decision}</span>
        </div>
        <div className="flex items-center justify-between rounded-md bg-muted/45 px-3 py-2">
          <span>Confidence</span>
          <Badge tone={confidence === "HIGH" ? "success" : confidence === "MEDIUM" ? "warning" : "default"}>{confidence}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">{reason}</p>
      </CardContent>
    </Card>
  );
}
