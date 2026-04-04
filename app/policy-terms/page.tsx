import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CLAIM_ELIGIBILITY_RULES,
  POLICY_COVERAGE,
  POLICY_EXCLUSIONS,
  POLICY_TERMS,
  RISK_ZONE_FACTORS
} from "@/lib/insurance";

export default function PolicyTermsPage() {
  return (
    <div className="page-stack">
      <Card>
        <CardHeader>
          <CardTitle>Policy Terms & Coverage Rules</CardTitle>
          <CardDescription>
            Parametric weekly income-loss policy for gig workers. Claims are auto-triggered only when disruption thresholds are met.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Coverage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {POLICY_COVERAGE.map((item) => (
              <Line key={item} text={item} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exclusions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {POLICY_EXCLUSIONS.map((item) => (
              <Line key={item} text={item} />
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Claim Conditions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {CLAIM_ELIGIBILITY_RULES.map((rule) => (
              <Line key={rule} text={rule} />
            ))}
            <Line text={`Deductible: Rs ${POLICY_TERMS.deductible}`} />
            <Line text={`Coverage limit per claim: Rs ${POLICY_TERMS.coverageLimitPerClaim}`} />
            <Line text={`Waiting period: ${POLICY_TERMS.waitingPeriodHours} hours`} />
            <Line text={`Max paid claims per week: ${POLICY_TERMS.maxPaidClaimsPerWeek}`} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payout Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Line text="Trigger must be valid (rain/heat/AQI/flood/curfew)." />
            <Line text="Fraud status SAFE: auto-paid." />
            <Line text="Fraud status UNDER REVIEW: pending." />
            <Line text="Fraud status FRAUD: rejected." />
            <Line text="Paid amount = min(plan coverage, coverage limit) - deductible." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Zones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {Object.entries(RISK_ZONE_FACTORS).map(([zone, factor]) => (
              <div key={zone} className="flex items-center justify-between rounded-md border border-border/70 bg-white/45 px-3 py-2 dark:bg-slate-950/30">
                <span>{zone.replace("_", " ")}</span>
                <Badge>{factor}x</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Premium Calculation Method</CardTitle>
          <CardDescription>Actuarial base + dynamic risk adjustment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Line text="Expected Loss = Risk Probability x Payout Amount" />
          <Line text="Weekly Premium = Expected Loss + Risk Loading + Operational Cost + Claim History Load" />
          <Line text="Risk Loading = 25% of expected loss" />
          <Line text="Operational Cost = fixed servicing cost per policy" />
          <Line text="Dynamic AI adjustment applies for fraud score, safe history, and risk-zone behavior." />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Coverage Hours & Renewal Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Line text="Coverage window: registered working hours only (default 10 AM to 10 PM)." />
            <Line text="Policy term: 7 days from activation timestamp." />
            <Line text="Renewal reminder: 48h and 24h before expiry." />
            <Line text="Grace period: 12h post-expiry for renewal (no new claims in grace)." />
            <Line text="Premium can adjust at weekly renewal based on risk and claim behavior." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Policy Lifecycle</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 space-y-0 text-sm md:grid-cols-2">
            {[
              "Register",
              "Risk Assessment",
              "Premium Calculation",
              "Policy Issued",
              "Risk Monitoring",
              "Trigger Event",
              "Auto Claim",
              "Fraud Check",
              "Claim Decision",
              "Payout",
              "Renewal",
              "Premium Adjustment"
            ].map((step) => (
              <Line key={step} text={step} />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Line({ text }: { text: string }) {
  return <div className="flex min-h-[42px] items-center rounded-lg border border-border/70 bg-white/45 px-3 py-2 dark:bg-slate-950/30">{text}</div>;
}
