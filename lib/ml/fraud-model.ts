interface FraudFeatures {
  avgSpeedKmh: number;
  claimFrequency: number;
  locationDriftScore: number;
  routeVariance: number;
}

export function predictFraudProbability(features: FraudFeatures) {
  const anomalyIndex =
    0.28 * normalize(features.avgSpeedKmh, 10, 80) +
    0.32 * normalize(features.claimFrequency, 0, 8) +
    0.24 * normalize(features.locationDriftScore, 0, 100) +
    0.16 * normalize(features.routeVariance, 0, 100);

  return Number(Math.min(0.99, Math.max(0.01, anomalyIndex)).toFixed(4));
}

function normalize(value: number, min: number, max: number) {
  return Math.min(1, Math.max(0, (value - min) / (max - min)));
}
