import { EconomicsSummary, UserProfile } from "@/lib/types";

export function calculateWorkerEconomics(user: UserProfile, riskProbability: number): EconomicsSummary {
  const hourlyIncome = round(user.dailyIncome / 10);
  const weeklyWorkingHours = 60;
  const weeklyRiskExposureHours = round(Math.max(4, riskProbability * weeklyWorkingHours));
  const incomeLossPerDisruption = round(hourlyIncome * 5);
  const incomeAtRiskWeekly = round(hourlyIncome * weeklyRiskExposureHours);
  const recommendedCoverage = roundTo50(Math.max(500, Math.min(2000, incomeLossPerDisruption * 2)));
  const recommendedPremium = round(Math.max(35, recommendedCoverage * (0.06 + riskProbability * 0.08)));

  return {
    hourlyIncome,
    weeklyWorkingHours,
    weeklyRiskExposureHours,
    incomeLossPerDisruption,
    incomeAtRiskWeekly,
    recommendedCoverage,
    recommendedPremium
  };
}

function round(value: number) {
  return Math.round(value);
}

function roundTo50(value: number) {
  return Math.round(value / 50) * 50;
}
