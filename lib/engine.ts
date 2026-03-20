import { EnvironmentMetrics, FraudResult, FraudStatus, RiskStatus } from "@/lib/types";

export function evaluateRisk(metrics: EnvironmentMetrics): RiskStatus {
  if (metrics.rainfall > 50 || metrics.aqi > 300) return "HIGH";
  return "LOW";
}

export function simulateMetrics(mode?: string): EnvironmentMetrics {
  const base: EnvironmentMetrics = {
    rainfall: random(4, 35),
    temperature: random(24, 39),
    aqi: random(80, 220)
  };

  if (mode === "rain") {
    base.rainfall = random(58, 95);
    base.temperature = random(22, 31);
  }

  if (mode === "heat") {
    base.temperature = random(42, 48);
    base.rainfall = random(0, 8);
    base.aqi = random(130, 260);
  }

  if (mode === "pollution") {
    base.aqi = random(320, 450);
    base.temperature = random(27, 36);
  }

  return base;
}

export function runFraudChecks(claimCount: number): FraudResult {
  const movementScore = random(35, 96);
  const locationAnomaly = random(2, 90);
  const speedSpike = random(0, 100);
  const claimFrequency = Math.min(100, claimCount * 20 + random(8, 26));

  const fraudScore = Math.round(movementScore * 0.18 + claimFrequency * 0.34 + locationAnomaly * 0.25 + speedSpike * 0.23);

  let status: FraudStatus = "SAFE";
  if (fraudScore >= 75 || locationAnomaly > 80) status = "FRAUD";
  else if (fraudScore >= 45) status = "UNDER REVIEW";

  return {
    fraudScore,
    movementScore,
    claimFrequency,
    locationAnomaly,
    status
  };
}

function random(min: number, max: number) {
  return Math.round(Math.random() * (max - min) + min);
}
