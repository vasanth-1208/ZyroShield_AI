"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { useZyroStore } from "@/lib/store";
import { ClaimRecord } from "@/lib/types";
import { rupee } from "@/lib/utils";

export default function ClaimsPage() {
  const claims = useZyroStore((s) => s.claimHistory);
  const payouts = useZyroStore((s) => s.payoutHistory);
  const [selected, setSelected] = useState<ClaimRecord | null>(null);

  const sortedClaims = useMemo(() => [...claims].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [claims]);

  return (
    <div className="page-stack">
      <Card>
        <CardHeader>
          <CardTitle>Claims Management</CardTitle>
          <CardDescription>Eligibility-gated zero-touch claims with reasoned decisions and payout timeline.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="pt-5">
          <div className="overflow-auto rounded-xl border border-border/70">
            <Table className="min-w-[1180px]">
              <THead>
                <TR>
                  <TH>Date</TH>
                  <TH>Reason</TH>
                  <TH>Status</TH>
                  <TH>Confidence</TH>
                  <TH>Eligible</TH>
                  <TH>Deductible</TH>
                  <TH>Paid</TH>
                  <TH>Payout Breakdown</TH>
                  <TH>Decision Reason</TH>
                  <TH>Action</TH>
                </TR>
              </THead>
              <TBody>
                {sortedClaims.length ? (
                  sortedClaims.map((claim) => {
                    const paid = payouts.some((payout) => payout.claimId === claim.id);
                    const reason = claim.approvalReason ?? claim.rejectionReason ?? "Under review";
                    return (
                      <TR key={claim.id}>
                        <TD>{new Date(claim.date).toLocaleString()}</TD>
                        <TD>{(claim.reason ?? "NONE").replace("_", " ")}</TD>
                        <TD><Badge tone={statusTone(claim.status)}>{claim.status.replace("_", " ")}</Badge></TD>
                        <TD>{claim.confidenceScore ?? "-"}</TD>
                        <TD>{rupee(claim.eligibleAmount ?? 0)}</TD>
                        <TD>{rupee(claim.deductible ?? 0)}</TD>
                        <TD>{paid ? rupee(claim.payoutAmount) : "-"}</TD>
                        <TD>{`${rupee(claim.eligibleAmount ?? 0)} - ${rupee(claim.deductible ?? 0)} = ${rupee(claim.payoutAmount)}`}</TD>
                        <TD className="max-w-[280px] whitespace-normal break-words">{reason}</TD>
                        <TD><Button size="sm" variant="outline" onClick={() => setSelected(claim)}>View</Button></TD>
                      </TR>
                    );
                  })
                ) : (
                  <TR><TD colSpan={10} className="text-muted-foreground">No claims yet. Simulate a disruption from Dashboard.</TD></TR>
                )}
              </TBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selected ? <ClaimModal claim={selected} onClose={() => setSelected(null)} /> : null}
    </div>
  );
}

function ClaimModal({ claim, onClose }: { claim: ClaimRecord; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/45 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Claim Timeline</CardTitle>
          <CardDescription>Disruption reason: {(claim.reason ?? "NONE").replace("_", " ")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid gap-2 md:grid-cols-2">
            <p><span className="text-muted-foreground">Claim ID:</span> {claim.id}</p>
            <p><span className="text-muted-foreground">Date:</span> {new Date(claim.date).toLocaleString()}</p>
            <p><span className="text-muted-foreground">Fraud Status:</span> {claim.fraudStatus}</p>
            <p><span className="text-muted-foreground">Claim Status:</span> {claim.status.replace("_", " ")}</p>
            <p><span className="text-muted-foreground">Eligible Amount:</span> {rupee(claim.eligibleAmount ?? 0)}</p>
            <p><span className="text-muted-foreground">Deductible:</span> {rupee(claim.deductible ?? 0)}</p>
            <p><span className="text-muted-foreground">Final Payout:</span> {claim.payoutAmount ? rupee(claim.payoutAmount) : "-"}</p>
            <p><span className="text-muted-foreground">Confidence:</span> {claim.confidenceScore ?? "-"}</p>
          </div>

          <div className="rounded-lg border border-border/70 bg-white/45 p-3 dark:bg-slate-950/30">
            <p className="font-medium">Decision Reason</p>
            <p className="text-xs text-muted-foreground">{claim.approvalReason ?? claim.rejectionReason ?? "Pending automated decision."}</p>
          </div>

          <div className="space-y-2">
            {(claim.timeline ?? []).map((item, i) => (
              <div key={`${item.step}-${i}`} className="rounded-lg border border-border/70 bg-white/45 p-3 dark:bg-slate-950/30">
                <p className="font-medium">{item.step}</p>
                <p className="text-xs text-muted-foreground">{item.status.toUpperCase()}</p>
                <p className="text-xs text-muted-foreground">{item.timestamp ? new Date(item.timestamp).toLocaleString() : "Awaiting step"}</p>
              </div>
            ))}
          </div>

          <Button onClick={onClose}>Close</Button>
        </CardContent>
      </Card>
    </div>
  );
}

function statusTone(status: ClaimRecord["status"]): "default" | "success" | "warning" | "danger" {
  if (status === "PAID" || status === "APPROVED") return "success";
  if (status === "REJECTED") return "danger";
  if (status === "PENDING" || status === "UNDER_REVIEW") return "warning";
  return "default";
}
