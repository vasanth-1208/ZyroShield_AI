import { FraudResult, FraudStatus } from "@/lib/types";

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
