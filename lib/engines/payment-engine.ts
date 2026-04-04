import { PayoutRecord } from "@/lib/types";

export function createPayout(claimId: string, amount: number): PayoutRecord | null {
  if (amount <= 0) return null;

  return {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    amount,
    claimId
  };
}
