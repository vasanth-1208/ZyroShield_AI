interface PremiumFeatures {
  riskProbability: number;
  claimCount: number;
  fraudProbability: number;
  safeScore: number;
}

export function predictPremiumAdjustment(features: PremiumFeatures) {
  const adjustment =
    18 * features.riskProbability +
    2.2 * Math.min(features.claimCount, 8) +
    15 * features.fraudProbability -
    0.08 * features.safeScore;

  return Math.round(adjustment);
}
