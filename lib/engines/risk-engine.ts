import { DisruptionReason, EnvironmentMetrics, RiskStatus } from "@/lib/types";

export function evaluateRisk(metrics: EnvironmentMetrics): RiskStatus {
  if (
    metrics.rainfall > 50 ||
    metrics.temperature > 42 ||
    metrics.aqi > 300 ||
    metrics.floodAlert ||
    metrics.curfewTrafficAlert
  ) {
    return "HIGH";
  }
  return "LOW";
}

export function detectDisruptionReason(metrics: EnvironmentMetrics): DisruptionReason {
  if (metrics.rainfall > 50) return "HEAVY_RAIN";
  if (metrics.temperature > 42) return "HEATWAVE";
  if (metrics.aqi > 300) return "POLLUTION";
  if (metrics.floodAlert) return "FLOOD_ALERT";
  if (metrics.curfewTrafficAlert) return "CURFEW_TRAFFIC";
  return "NONE";
}

export function simulateMetrics(mode?: string): EnvironmentMetrics {
  const base: EnvironmentMetrics = {
    rainfall: rand(4, 35),
    temperature: rand(24, 39),
    aqi: rand(80, 220),
    floodAlert: false,
    curfewTrafficAlert: false
  };

  if (mode === "rain") {
    base.rainfall = rand(58, 95);
    base.temperature = rand(22, 31);
  }

  if (mode === "heat") {
    base.temperature = rand(43, 48);
    base.rainfall = rand(0, 8);
  }

  if (mode === "pollution") {
    base.aqi = rand(320, 450);
  }

  if (mode === "flood") {
    base.floodAlert = true;
    base.rainfall = rand(45, 80);
  }

  if (mode === "curfew") {
    base.curfewTrafficAlert = true;
    base.aqi = rand(170, 300);
  }

  return base;
}

function rand(min: number, max: number) {
  return Math.round(Math.random() * (max - min) + min);
}
