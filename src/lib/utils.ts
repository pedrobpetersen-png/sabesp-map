// SABESP brand colors
export const SABESP = {
  blue: "#005BAA",
  blueDark: "#003D73",
  blueLight: "#4A90D9",
  green: "#00A651",
  greenLight: "#4DC884",
  white: "#FFFFFF",
  gray50: "#F8FAFC",
  gray100: "#F1F5F9",
  gray200: "#E2E8F0",
  gray300: "#CBD5E1",
  gray400: "#94A3B8",
  gray500: "#64748B",
  gray600: "#475569",
  gray700: "#334155",
  gray800: "#1E293B",
};

export function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

export function formatM3(n: number): string {
  return formatNumber(n) + " m³/mês";
}

export function formatM3s(n: number): string {
  if (n >= 1) return n.toFixed(1) + " m³/s";
  return (n * 1000).toFixed(0) + " L/s";
}

export function getLevelColor(pct: number): string {
  if (pct >= 60) return "#00A651"; // SABESP green
  if (pct >= 30) return "#F59E0B"; // amber
  return "#EF4444"; // red
}

export function getEfficiencyColor(pct: number): string {
  if (pct >= 90) return "#00A651";
  if (pct >= 75) return "#005BAA";
  if (pct >= 60) return "#F59E0B";
  return "#EF4444";
}

export function choroplethColor(
  value: number,
  min: number,
  max: number,
  isPct: boolean = false
): string {
  const normalized = isPct ? value / 100 : (value - min) / (max - min || 1);
  const clamped = Math.max(0, Math.min(1, normalized));

  if (isPct) {
    // Green for high %, amber for low
    const r = Math.round(245 - clamped * 245);
    const g = Math.round(100 + clamped * 66);
    const b = Math.round(80 - clamped * 0);
    return `rgb(${r},${g},${b})`;
  }

  // SABESP blue gradient for consumption
  const r = Math.round(200 - clamped * 200);
  const g = Math.round(220 - clamped * 129);
  const b = Math.round(240 - clamped * 70);
  return `rgb(${r},${g},${b})`;
}
