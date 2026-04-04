interface RiskFeatures {
  rainfall: number;
  aqi: number;
  temperature: number;
  historicalDisruptions: number;
  floodAlert: boolean;
  curfewAlert: boolean;
}

function sigmoid(x: number) {
  return 1 / (1 + Math.exp(-x));
}

export function predictDisruptionProbability(features: RiskFeatures) {
  const z =
    -4.2 +
    0.032 * features.rainfall +
    0.009 * features.aqi +
    0.08 * Math.max(0, features.temperature - 35) +
    0.12 * features.historicalDisruptions +
    (features.floodAlert ? 1.15 : 0) +
    (features.curfewAlert ? 0.95 : 0);

  return Number(sigmoid(z).toFixed(4));
}

export function classifyRisk(probability: number) {
  if (probability >= 0.55) return "HIGH";
  return "LOW";
}
