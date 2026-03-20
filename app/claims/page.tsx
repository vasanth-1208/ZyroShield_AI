"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { useZyroStore } from "@/lib/store";
import { ClaimRecord } from "@/lib/types";
import { rupee } from "@/lib/utils";

export default function ClaimsPage() {
  const claims = useZyroStore((s) => s.claimHistory);
  const [selected, setSelected] = useState<ClaimRecord | null>(null);

  const sortedClaims = useMemo(
    () => [...claims].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [claims]
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Claims</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-xl border border-border/70">
            <Table>
              <THead>
                <TR>
                  <TH>Date</TH>
                  <TH>Risk</TH>
                  <TH>Fraud</TH>
                  <TH>Status</TH>
                  <TH>Payout</TH>
                  <TH>Action</TH>
                </TR>
              </THead>
              <TBody>
                {sortedClaims.length ? (
                  sortedClaims.map((claim) => (
                    <TR key={claim.id}>
                      <TD>{new Date(claim.date).toLocaleString()}</TD>
                      <TD>{claim.risk}</TD>
                      <TD>{claim.fraudStatus}</TD>
                      <TD>
                        <Badge tone={claim.status === "APPROVED" ? "success" : claim.status === "UNDER_REVIEW" ? "warning" : "default"}>
                          {claim.status.replace("_", " ")}
                        </Badge>
                      </TD>
                      <TD>{claim.payoutAmount ? rupee(claim.payoutAmount) : "-"}</TD>
                      <TD>
                        <Button size="sm" variant="outline" onClick={() => setSelected(claim)}>
                          View
                        </Button>
                      </TD>
                    </TR>
                  ))
                ) : (
                  <TR>
                    <TD colSpan={6} className="text-muted-foreground">
                      No claims yet. Trigger simulations from Dashboard.
                    </TD>
                  </TR>
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
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Claim Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><span className="text-muted-foreground">Claim ID:</span> {claim.id}</p>
          <p><span className="text-muted-foreground">Date:</span> {new Date(claim.date).toLocaleString()}</p>
          <p><span className="text-muted-foreground">Risk:</span> {claim.risk}</p>
          <p><span className="text-muted-foreground">Fraud Status:</span> {claim.fraudStatus}</p>
          <p><span className="text-muted-foreground">Claim Status:</span> {claim.status.replace("_", " ")}</p>
          <p><span className="text-muted-foreground">Payout Amount:</span> {claim.payoutAmount ? rupee(claim.payoutAmount) : "-"}</p>
          <div className="pt-2">
            <Button onClick={onClose}>Close</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
