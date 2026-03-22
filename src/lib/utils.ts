export function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

export function formatM3(n: number): string {
  return formatNumber(n) + " m³/mês";
}

export function getLevelColor(pct: number): string {
  if (pct >= 60) return "#22c55e"; // green
  if (pct >= 30) return "#eab308"; // yellow
  return "#ef4444"; // red
}

export function getEfficiencyColor(pct: number): string {
  if (pct >= 90) return "#22c55e";
  if (pct >= 75) return "#3b82f6";
  if (pct >= 60) return "#eab308";
  return "#ef4444";
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
    // Green for high %, red for low
    const r = Math.round(239 - clamped * 205);
    const g = Math.round(68 + clamped * 129);
    const b = Math.round(68 - clamped * 0);
    return `rgb(${r},${g},${b})`;
  }

  // Blue gradient for consumption
  const r = Math.round(20 + (1 - clamped) * 200);
  const g = Math.round(60 + (1 - clamped) * 180);
  const b = Math.round(220);
  return `rgb(${r},${g},${b})`;
}
