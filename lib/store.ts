"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  AiDecisionInsights,
  ClaimRecord,
  ClaimStatus,
  EconomicsSummary,
  EnvironmentMetrics,
  FraudResult,
  NotificationItem,
  PlanOption,
  PolicyRecord,
  PremiumModelBreakdown,
  PayoutRecord,
  RiskStatus,
  UserProfile
} from "@/lib/types";

interface AppState {
  hasHydrated: boolean;
  user: UserProfile | null;
  plan: PlanOption | null;
  risk: RiskStatus;
  claimStatus: ClaimStatus;
  metrics: EnvironmentMetrics;
  fraud: FraudResult | null;
  claimHistory: ClaimRecord[];
  payoutHistory: PayoutRecord[];
  policyHistory: PolicyRecord[];
  activePolicy: PolicyRecord | null;
  notifications: NotificationItem[];
  aiAdjustedPremium: number;
  riskProbability: number;
  walletBalance: number;
  economics: EconomicsSummary | null;
  premiumModel: PremiumModelBreakdown | null;
  aiInsights: AiDecisionInsights | null;
  claimsThisWeek: number;
  incomeProtected: number;
  payoutRatio: number;
  lossRatio: number;
  policyExpiryDays: number;
  nextPremiumAdjustment: string | null;
  policyLifecycle: Array<{ step: string; status: "done" | "active" | "pending" }>;
  premiumTrend: Array<{ date: string; premium: number }>;
  riskHistory: Array<{ date: string; probability: number; risk: "LOW" | "HIGH" }>;
  fraudHistory: Array<{ date: string; score: number; probability: number; level: "LOW" | "MEDIUM" | "HIGH" }>;
  latestPayout: number;
  dashboardCacheTs: number;
  demoMode: boolean;
  setUser: (user: UserProfile) => void;
  updateUser: (user: Partial<UserProfile>) => void;
  setPlan: (plan: PlanOption) => void;
  setRisk: (risk: RiskStatus) => void;
  setMetrics: (metrics: EnvironmentMetrics) => void;
  setClaimStatus: (claimStatus: ClaimStatus) => void;
  setFraud: (fraud: FraudResult | null) => void;
  addClaim: (claim: ClaimRecord) => void;
  addPayout: (payout: PayoutRecord) => void;
  setPolicy: (policy: PolicyRecord | null) => void;
  setPolicyHistory: (policies: PolicyRecord[]) => void;
  addNotification: (notification: NotificationItem) => void;
  setAiAdjustedPremium: (premium: number) => void;
  setPremiumTrend: (trend: Array<{ date: string; premium: number }>) => void;
  setWalletBalance: (amount: number) => void;
  hydratePayouts: (payouts: PayoutRecord[]) => void;
  hydrateDashboardLite: (payload: {
    user: UserProfile;
    plan: PlanOption;
    risk: RiskStatus;
    metrics: EnvironmentMetrics;
    aiAdjustedPremium?: number;
    riskProbability?: number;
    economics?: EconomicsSummary | null;
    premiumModel?: PremiumModelBreakdown | null;
    walletBalance?: number;
    policyLifecycle?: Array<{ step: string; status: "done" | "active" | "pending" }>;
  }) => void;
  hydrateDashboardHeavy: (payload: {
    claims: ClaimRecord[];
    fraud: FraudResult;
    payouts: PayoutRecord[];
    payout: PayoutRecord | null;
    policies?: PolicyRecord[];
    notifications?: NotificationItem[];
    aiAdjustedPremium?: number;
    premiumTrend?: Array<{ date: string; premium: number }>;
    riskProbability?: number;
    riskHistory?: Array<{ date: string; probability: number; risk: "LOW" | "HIGH" }>;
    fraudHistory?: Array<{ date: string; score: number; probability: number; level: "LOW" | "MEDIUM" | "HIGH" }>;
    walletBalance?: number;
    economics?: EconomicsSummary | null;
    premiumModel?: PremiumModelBreakdown | null;
    aiInsights?: AiDecisionInsights | null;
    claimsThisWeek?: number;
    incomeProtected?: number;
    payoutRatio?: number;
    lossRatio?: number;
    policyExpiryDays?: number;
    nextPremiumAdjustment?: string | null;
    policyLifecycle?: Array<{ step: string; status: "done" | "active" | "pending" }>;
  }) => void;
  setDemoMode: (enabled: boolean) => void;
  setHasHydrated: (value: boolean) => void;
  logout: () => void;
}

const defaultMetrics: EnvironmentMetrics = {
  rainfall: 18,
  temperature: 30,
  aqi: 125,
  floodAlert: false,
  curfewTrafficAlert: false
};

export const useZyroStore = create<AppState>()(
  persist(
    (set) => ({
      hasHydrated: false,
      user: null,
      plan: null,
      risk: "LOW",
      claimStatus: "IDLE",
      metrics: defaultMetrics,
      fraud: null,
      claimHistory: [],
      payoutHistory: [],
      policyHistory: [],
      activePolicy: null,
      notifications: [],
      aiAdjustedPremium: 40,
      riskProbability: 0.18,
      walletBalance: 0,
      economics: null,
      premiumModel: null,
      aiInsights: null,
      claimsThisWeek: 0,
      incomeProtected: 0,
      payoutRatio: 0,
      lossRatio: 0,
      policyExpiryDays: 0,
      nextPremiumAdjustment: null,
      policyLifecycle: [],
      premiumTrend: [],
      riskHistory: [],
      fraudHistory: [],
      latestPayout: 0,
      dashboardCacheTs: 0,
      demoMode: false,
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
          claimHistory: [claim, ...state.claimHistory].slice(0, 20)
        })),
      addPayout: (payout) =>
        set((state) => ({
          payoutHistory: [payout, ...state.payoutHistory].slice(0, 20),
          latestPayout: payout.amount
        })),
      setPolicy: (policy) => set({ activePolicy: policy }),
      setPolicyHistory: (policies) => set({ policyHistory: policies }),
      addNotification: (notification) =>
        set((state) => ({
          notifications: [notification, ...state.notifications].slice(0, 20)
        })),
      setAiAdjustedPremium: (premium) => set({ aiAdjustedPremium: premium }),
      setPremiumTrend: (trend) => set({ premiumTrend: trend }),
      setWalletBalance: (amount) => set({ walletBalance: amount }),
      hydratePayouts: (payouts) =>
        set({
          payoutHistory: payouts,
          latestPayout: payouts[0]?.amount ?? 0
        }),
      hydrateDashboardLite: (payload) =>
        set({
          user: payload.user,
          plan: payload.plan,
          risk: payload.risk,
          metrics: payload.metrics,
          aiAdjustedPremium: payload.aiAdjustedPremium ?? payload.plan.premium,
          riskProbability: payload.riskProbability ?? 0.18,
          economics: payload.economics ?? null,
          premiumModel: payload.premiumModel ?? null,
          walletBalance: payload.walletBalance ?? 0,
          policyLifecycle: payload.policyLifecycle ?? [],
          dashboardCacheTs: Date.now()
        }),
      hydrateDashboardHeavy: (payload) =>
        set({
          claimHistory: payload.claims,
          fraud: payload.fraud,
          payoutHistory: payload.payouts,
          latestPayout: payload.payout?.amount ?? payload.payouts[0]?.amount ?? 0,
          policyHistory: payload.policies ?? [],
          activePolicy: payload.policies?.find((policy) => policy.status === "ACTIVE") ?? null,
          notifications: payload.notifications ?? [],
          aiAdjustedPremium: payload.aiAdjustedPremium ?? 40,
          premiumTrend: payload.premiumTrend ?? [],
          riskProbability: payload.riskProbability ?? 0.18,
          riskHistory: payload.riskHistory ?? [],
          fraudHistory: payload.fraudHistory ?? [],
          walletBalance: payload.walletBalance ?? 0,
          economics: payload.economics ?? null,
          premiumModel: payload.premiumModel ?? null,
          aiInsights: payload.aiInsights ?? null,
          claimsThisWeek: payload.claimsThisWeek ?? 0,
          incomeProtected: payload.incomeProtected ?? 0,
          payoutRatio: payload.payoutRatio ?? 0,
          lossRatio: payload.lossRatio ?? 0,
          policyExpiryDays: payload.policyExpiryDays ?? 0,
          nextPremiumAdjustment: payload.nextPremiumAdjustment ?? null,
          policyLifecycle: payload.policyLifecycle ?? [],
          dashboardCacheTs: Date.now()
        }),
      setDemoMode: (enabled) => set({ demoMode: enabled }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
      logout: () =>
        set({
          hasHydrated: true,
          user: null,
          plan: null,
          risk: "LOW",
          claimStatus: "IDLE",
          metrics: defaultMetrics,
          fraud: null,
          claimHistory: [],
          payoutHistory: [],
          policyHistory: [],
          activePolicy: null,
          notifications: [],
          aiAdjustedPremium: 40,
          riskProbability: 0.18,
          walletBalance: 0,
          economics: null,
          premiumModel: null,
          aiInsights: null,
          claimsThisWeek: 0,
          incomeProtected: 0,
          payoutRatio: 0,
          lossRatio: 0,
          policyExpiryDays: 0,
          nextPremiumAdjustment: null,
          policyLifecycle: [],
          premiumTrend: [],
          riskHistory: [],
          fraudHistory: [],
          latestPayout: 0,
          dashboardCacheTs: 0,
          demoMode: false
        })
    }),
    {
      name: "zyroshield-store",
      partialize: (state) => ({
        user: state.user,
        hasHydrated: state.hasHydrated,
        plan: state.plan,
        risk: state.risk,
        claimStatus: state.claimStatus,
        metrics: state.metrics,
        fraud: state.fraud,
        claimHistory: state.claimHistory,
        payoutHistory: state.payoutHistory,
        policyHistory: state.policyHistory,
        activePolicy: state.activePolicy,
        notifications: state.notifications,
        aiAdjustedPremium: state.aiAdjustedPremium,
        riskProbability: state.riskProbability,
        walletBalance: state.walletBalance,
        economics: state.economics,
        premiumModel: state.premiumModel,
        aiInsights: state.aiInsights,
        claimsThisWeek: state.claimsThisWeek,
        incomeProtected: state.incomeProtected,
        payoutRatio: state.payoutRatio,
        lossRatio: state.lossRatio,
        policyExpiryDays: state.policyExpiryDays,
        nextPremiumAdjustment: state.nextPremiumAdjustment,
        policyLifecycle: state.policyLifecycle,
        premiumTrend: state.premiumTrend,
        riskHistory: state.riskHistory,
        fraudHistory: state.fraudHistory,
        latestPayout: state.latestPayout,
        dashboardCacheTs: state.dashboardCacheTs,
        demoMode: state.demoMode
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      }
    }
  )
);
