// Formatting utilities for numbers, currency, and percentages

/**
 * Format a number as Canadian dollars.
 * Returns '—' if value is null or undefined.
 */
export function formatCAD(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";

  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format a number as a percentage.
 * Returns '—' if value is null or undefined.
 */
export function formatPercent(
  value: number | null | undefined,
  decimals = 1
): string {
  if (value === null || value === undefined) return "—";

  return `${value.toFixed(decimals)}%`;
}

/**
 * Format a number with comma separators.
 * Returns '—' if value is null or undefined.
 */
export function formatNumber(
  value: number | null | undefined,
  decimals = 0
): string {
  if (value === null || value === undefined) return "—";

  return new Intl.NumberFormat("en-CA", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format a delta value with +/- prefix and compact notation.
 * Returns '—' if value is null or undefined.
 * Returns empty string if value is 0.
 */
export function formatDelta(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  if (value === 0) return "—";

  const sign = value > 0 ? "+" : "";
  const formatted = formatCAD(Math.abs(value));

  return `${sign}${formatted}`;
}

/**
 * Format a percentage delta value with +/- prefix.
 * Returns '—' if value is null or undefined.
 * Returns empty string if value is 0.
 */
export function formatPercentDelta(
  value: number | null | undefined,
  decimals = 1
): string {
  if (value === null || value === undefined) return "—";
  if (value === 0) return "—";

  const sign = value > 0 ? "+" : "";

  return `${sign}${value.toFixed(decimals)}pp`;
}

/**
 * Format phase type for display.
 * Converts internal phase names to user-friendly labels.
 */
export function formatPhase(phase: string): string {
  const map: Record<string, string> = {
    ENTITLEMENT: "Entitlement",
    CONSTRUCTION: "Construction",
    SALES_LEASE: "Sales",
  };
  return map[phase] || phase;
}

/**
 * Get Tailwind CSS classes for phase badge color.
 * Returns background and text color classes for phase badges.
 */
export function getPhaseColor(phase: string): string {
  const map: Record<string, string> = {
    ENTITLEMENT: "bg-blue-100 text-blue-700",
    CONSTRUCTION: "bg-orange-100 text-orange-700",
    SALES_LEASE: "bg-green-100 text-green-700",
  };
  return map[phase] || "bg-gray-100 text-gray-700";
}
