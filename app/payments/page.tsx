"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useZyroStore } from "@/lib/store";
import { rupee } from "@/lib/utils";

export default function PaymentsPage() {
  const payoutHistory = useZyroStore((s) => s.payoutHistory);
  const latestPayout = useZyroStore((s) => s.latestPayout);
  const walletBalance = useZyroStore((s) => s.walletBalance);
  const policyHistory = useZyroStore((s) => s.policyHistory);
  const claimHistory = useZyroStore((s) => s.claimHistory);
  const [loading, setLoading] = useState(false);

  const totalCredited = payoutHistory.reduce((acc, item) => acc + item.amount, 0);
  const premiumPaid = policyHistory.reduce((sum, policy) => sum + policy.aiAdjustedPremium, 0);
  const pendingPayouts = claimHistory.filter((claim) => claim.status === "PENDING" || claim.status === "UNDER_REVIEW").length;
  const weeklyCharge = policyHistory[0]?.aiAdjustedPremium ?? 0;

  async function topup(amount: number) {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "wallet_topup", amount })
      });
      const data = await res.json();
      useZyroStore.setState({ walletBalance: data.walletBalance ?? walletBalance, notifications: data.notifications ?? [] });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-stack">
      <div className="grid gap-6 md:grid-cols-4">
        <WalletStat label="Wallet Balance" value={rupee(walletBalance)} />
        <WalletStat label="Latest Credit" value={latestPayout ? rupee(latestPayout) : "-"} />
        <WalletStat label="Claim Credits" value={rupee(totalCredited)} />
        <WalletStat label="Transactions" value={`${payoutHistory.length}`} />
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <WalletStat label="Premium Payments" value={rupee(premiumPaid)} />
        <WalletStat label="Weekly Premium Charge" value={rupee(weeklyCharge)} />
        <WalletStat label="Pending Payouts" value={`${pendingPayouts}`} />
        <WalletStat label="Settlement History" value={`${payoutHistory.length} settlements`} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Wallet Top-Up Simulation</CardTitle>
          <CardDescription>Add balance for demo settlement flows.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap justify-center gap-4 space-y-0">
          <Button disabled={loading} onClick={() => topup(250)}>{loading ? "Please wait..." : "Top-up Rs 250"}</Button>
          <Button disabled={loading} variant="outline" onClick={() => topup(500)}>{loading ? "Please wait..." : "Top-up Rs 500"}</Button>
          <Button disabled={loading} variant="outline" onClick={() => topup(1000)}>{loading ? "Please wait..." : "Top-up Rs 1000"}</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
          <CardDescription>Simulated claim settlement transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-xl border border-border/70">
            <Table className="min-w-[720px]">
              <THead>
                <TR>
                  <TH>Date</TH>
                  <TH>Amount</TH>
                  <TH>Claim Ref</TH>
                  <TH>Status</TH>
                </TR>
              </THead>
              <TBody>
                {payoutHistory.length ? (
                  payoutHistory.map((payout) => (
                    <TR key={payout.id}>
                      <TD>{new Date(payout.date).toLocaleString()}</TD>
                      <TD>{rupee(payout.amount)}</TD>
                      <TD>{payout.claimId.slice(0, 8)}</TD>
                      <TD className="text-emerald-600">Credited</TD>
                    </TR>
                  ))
                ) : (
                  <TR>
                    <TD colSpan={4} className="text-muted-foreground">No payouts yet. Run simulations from dashboard.</TD>
                  </TR>
                )}
              </TBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Premium Charge History</CardTitle>
          <CardDescription>Weekly premium debits from active and renewed policies.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-xl border border-border/70">
            <Table className="min-w-[720px]">
              <THead>
                <TR>
                  <TH>Date</TH>
                  <TH>Plan</TH>
                  <TH>Base Premium</TH>
                  <TH>AI Premium</TH>
                  <TH>Status</TH>
                </TR>
              </THead>
              <TBody>
                {policyHistory.length ? (
                  policyHistory.map((policy) => (
                    <TR key={policy.id}>
                      <TD>{new Date(policy.startDate).toLocaleDateString()}</TD>
                      <TD>{policy.planName}</TD>
                      <TD>{rupee(policy.weeklyPremium)}</TD>
                      <TD>{rupee(policy.aiAdjustedPremium)}</TD>
                      <TD>{policy.status}</TD>
                    </TR>
                  ))
                ) : (
                  <TR>
                    <TD colSpan={5} className="text-muted-foreground">No premium charges yet.</TD>
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

function WalletStat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="py-5">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
