"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  ClaimRecord,
  ClaimStatus,
  EnvironmentMetrics,
  FraudResult,
  PlanOption,
  PayoutRecord,
  RiskStatus,
  UserProfile
} from "@/lib/types";

interface AppState {
  user: UserProfile | null;
  plan: PlanOption | null;
  risk: RiskStatus;
  claimStatus: ClaimStatus;
  metrics: EnvironmentMetrics;
  fraud: FraudResult | null;
  claimHistory: ClaimRecord[];
  payoutHistory: PayoutRecord[];
  latestPayout: number;
  setUser: (user: UserProfile) => void;
  updateUser: (user: Partial<UserProfile>) => void;
  setPlan: (plan: PlanOption) => void;
  setRisk: (risk: RiskStatus) => void;
  setMetrics: (metrics: EnvironmentMetrics) => void;
  setClaimStatus: (claimStatus: ClaimStatus) => void;
  setFraud: (fraud: FraudResult | null) => void;
  addClaim: (claim: ClaimRecord) => void;
  addPayout: (payout: PayoutRecord) => void;
  hydratePayouts: (payouts: PayoutRecord[]) => void;
  logout: () => void;
}

const defaultMetrics: EnvironmentMetrics = {
  rainfall: 18,
  temperature: 30,
  aqi: 125
};

export const useZyroStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      plan: null,
      risk: "LOW",
      claimStatus: "IDLE",
      metrics: defaultMetrics,
      fraud: null,
      claimHistory: [],
      payoutHistory: [],
      latestPayout: 0,
      setUser: (user) => set({ user }),
      updateUser: (user) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...user } : state.user
        })),
      setPlan: (plan) => set({ plan }),
      setRisk: (risk) => set({ risk }),
      setMetrics: (metrics) => set({ metrics }),
      setClaimStatus: (claimStatus) => set({ claimStatus }),
      setFraud: (fraud) => set({ fraud }),
      addClaim: (claim) =>
        set((state) => ({
          claimHistory: [claim, ...state.claimHistory].slice(0, 10)
        })),
      addPayout: (payout) =>
        set((state) => ({
          payoutHistory: [payout, ...state.payoutHistory].slice(0, 10),
          latestPayout: payout.amount
        })),
      hydratePayouts: (payouts) =>
        set({
          payoutHistory: payouts,
          latestPayout: payouts[0]?.amount ?? 0
        }),
      logout: () =>
        set({
          user: null,
          plan: null,
          risk: "LOW",
          claimStatus: "IDLE",
          metrics: defaultMetrics,
          fraud: null,
          claimHistory: [],
          payoutHistory: [],
          latestPayout: 0
        })
    }),
    {
      name: "zyroshield-store",
      partialize: (state) => ({
        user: state.user,
        plan: state.plan,
        risk: state.risk,
        claimStatus: state.claimStatus,
        metrics: state.metrics,
        fraud: state.fraud,
        claimHistory: state.claimHistory,
        payoutHistory: state.payoutHistory,
        latestPayout: state.latestPayout
      })
    }
  )
);
