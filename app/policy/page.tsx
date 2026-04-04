"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { useZyroStore } from "@/lib/store";
import { AI_TRANSPARENCY_NOTE, POLICY_EXCLUSIONS, POLICY_TERMS } from "@/lib/insurance";
import { rupee } from "@/lib/utils";

export default function PolicyPage() {
  const activePolicy = useZyroStore((s) => s.activePolicy);
  const policyHistory = useZyroStore((s) => s.policyHistory);
  const aiAdjustedPremium = useZyroStore((s) => s.aiAdjustedPremium);
  const setPolicyHistory = useZyroStore((s) => s.setPolicyHistory);
  const setPolicy = useZyroStore((s) => s.setPolicy);
  const setAiAdjustedPremium = useZyroStore((s) => s.setAiAdjustedPremium);
  const [loading, setLoading] = useState<"renew" | "cancel" | null>(null);

  const sortedPolicies = useMemo(
    () => [...policyHistory].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()),
    [policyHistory]
  );

  async function renewPolicy() {
    setLoading("renew");
    try {
      const res = await fetch("/api/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "policy_renew" })
      });
      if (!res.ok) return;
      const data = await res.json();
      setPolicyHistory(data.policies ?? []);
      setPolicy(data.activePolicy ?? data.policies?.find((p: { status: string }) => p.status === "ACTIVE") ?? null);
      setAiAdjustedPremium(data.aiAdjustedPremium ?? aiAdjustedPremium);
    } finally {
      setLoading(null);
    }
  }

  async function cancelPolicy() {
    setLoading("cancel");
    try {
      const res = await fetch("/api/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "policy_cancel" })
      });
      if (!res.ok) return;
      const data = await res.json();
      setPolicyHistory(data.policies ?? []);
      setPolicy(data.activePolicy ?? null);
      setAiAdjustedPremium(data.aiAdjustedPremium ?? aiAdjustedPremium);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="page-stack">
      <Card>
        <CardHeader>
          <CardTitle>Insurance Policy Management</CardTitle>
          <CardDescription>Manage weekly policy lifecycle with AI-adjusted pricing.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/policy-terms" className={buttonVariants({ size: "sm", variant: "outline" })}>
            View Policy Terms & Coverage Rules
          </Link>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Active Policy</CardTitle>
          </CardHeader>
          <CardContent>
            {activePolicy ? (
              <div className="grid gap-3 md:grid-cols-2">
                <PolicyInfo label="Plan" value={activePolicy.planName} />
                <PolicyInfo label="Coverage" value={rupee(activePolicy.coverage)} />
                <PolicyInfo label="Weekly Premium" value={rupee(activePolicy.weeklyPremium)} />
                <PolicyInfo label="AI Adjusted Premium" value={rupee(activePolicy.aiAdjustedPremium)} />
                <PolicyInfo label="Valid From" value={new Date(activePolicy.startDate).toLocaleDateString()} />
                <PolicyInfo label="Valid Until" value={new Date(activePolicy.endDate).toLocaleDateString()} />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No active policy. Select one from Plans page.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Badge tone={activePolicy?.status === "ACTIVE" ? "success" : "warning"}>{activePolicy?.status ?? "NO POLICY"}</Badge>
            <Button className="w-full" onClick={renewPolicy} disabled={!activePolicy || loading !== null}>
              {loading === "renew" ? "Please wait..." : "Renew Policy"}
            </Button>
            <Button className="w-full" variant="outline" onClick={cancelPolicy} disabled={!activePolicy || loading !== null}>
              {loading === "cancel" ? "Please wait..." : "Cancel Policy"}
            </Button>
            <p className="text-xs text-muted-foreground">AI Adjusted Premium: {rupee(aiAdjustedPremium)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coverage Exclusions</CardTitle>
          <CardDescription>{AI_TRANSPARENCY_NOTE}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {POLICY_EXCLUSIONS.map((item) => (
            <div key={item} className="rounded-lg border border-border/70 bg-white/45 px-3 py-2 dark:bg-slate-950/30">
              {item}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Insurance Terms Snapshot</CardTitle>
          <CardDescription>Core policy conditions used for claim decisioning.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-6 space-y-0 text-sm md:grid-cols-2 lg:grid-cols-3">
          <PolicyInfo label="Coverage Limit" value={rupee(POLICY_TERMS.coverageLimitPerClaim)} />
          <PolicyInfo label="Deductible" value={rupee(POLICY_TERMS.deductible)} />
          <PolicyInfo label="Waiting Period" value={`${POLICY_TERMS.waitingPeriodHours} hours`} />
          <PolicyInfo label="Coverage Hours" value="10:00 AM - 10:00 PM working window" />
          <PolicyInfo label="Max Claims / Week" value={`${POLICY_TERMS.maxPaidClaimsPerWeek}`} />
          <PolicyInfo label="Renewal Date" value={activePolicy ? new Date(activePolicy.endDate).toLocaleDateString() : "-"} />
          <PolicyInfo label="Eligibility Rules" value="Online + in-zone + trigger met + no exclusion" />
          <PolicyInfo label="Premium Adjustment" value="Risk, claim frequency, fraud, safe behavior" />
          <PolicyInfo label="Renewal Rule" value="Weekly recalibration at policy renewal" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Policy History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-xl border border-border/70">
            <Table className="min-w-[860px]">
              <THead>
                <TR>
                  <TH>Plan</TH>
                  <TH>Coverage</TH>
                  <TH>Weekly Premium</TH>
                  <TH>AI Premium</TH>
                  <TH>Status</TH>
                  <TH>Start</TH>
                  <TH>End</TH>
                </TR>
              </THead>
              <TBody>
                {sortedPolicies.length ? (
                  sortedPolicies.map((policy) => (
                    <TR key={policy.id}>
                      <TD>{policy.planName}</TD>
                      <TD>{rupee(policy.coverage)}</TD>
                      <TD>{rupee(policy.weeklyPremium)}</TD>
                      <TD>{rupee(policy.aiAdjustedPremium)}</TD>
                      <TD>
                        <Badge tone={policy.status === "ACTIVE" ? "success" : policy.status === "CANCELLED" ? "danger" : "warning"}>
                          {policy.status}
                        </Badge>
                      </TD>
                      <TD>{new Date(policy.startDate).toLocaleDateString()}</TD>
                      <TD>{new Date(policy.endDate).toLocaleDateString()}</TD>
                    </TR>
                  ))
                ) : (
                  <TR>
                    <TD colSpan={7} className="text-muted-foreground">
                      No policies yet.
                    </TD>
                  </TR>
                )}
              </TBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PolicyInfo({ label, value, compact = false }: { label: string; value: string; compact?: boolean }) {
  return (
    <div className="flex h-[86px] flex-col justify-between rounded-lg border border-border/70 bg-white/45 p-3 dark:bg-slate-950/30">
      <p className="text-xs leading-tight text-muted-foreground">{label}</p>
      <p className={`mt-1 font-semibold leading-none ${compact ? "text-[0.95rem]" : ""}`}>{value}</p>
    </div>
  );
}
