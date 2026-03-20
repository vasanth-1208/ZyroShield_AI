"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { useZyroStore } from "@/lib/store";
import { rupee } from "@/lib/utils";

export default function PaymentsPage() {
  const payoutHistory = useZyroStore((s) => s.payoutHistory);
  const latestPayout = useZyroStore((s) => s.latestPayout);

  const totalCredited = payoutHistory.reduce((acc, item) => acc + item.amount, 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <WalletStat label="Wallet Balance" value={rupee(totalCredited)} />
        <WalletStat label="Latest Credit" value={latestPayout ? rupee(latestPayout) : "-"} />
        <WalletStat label="Transactions" value={`${payoutHistory.length}`} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
          <CardDescription>Simulated claim settlement transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-xl border border-border/70">
            <Table>
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
                    <TD colSpan={4} className="text-muted-foreground">
                      No payouts yet. Run simulations from dashboard.
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
