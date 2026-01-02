import { irr } from 'financial';

/**
 * Calculate annualized Internal Rate of Return from monthly equity cashflows
 * @param cashflows Array of monthly cashflows (negative = investment, positive = distribution)
 * @returns Annual IRR as percentage, or null if calculation fails
 */
export function calculateEquityIRR(cashflows: number[]): number | null {
  try {
    // Ensure we have valid cashflows
    if (!cashflows || cashflows.length === 0) {
      return null;
    }

    // Check if all cashflows are zero
    if (cashflows.every(cf => cf === 0)) {
      return null;
    }

    // Check for sign changes (required for IRR to have a solution)
    const hasNegative = cashflows.some(cf => cf < 0);
    const hasPositive = cashflows.some(cf => cf > 0);

    if (!hasNegative || !hasPositive) {
      return null; // No sign change, IRR undefined
    }

    // Calculate monthly IRR
    const monthlyIRR = irr(cashflows);

    // Validate result
    if (!isFinite(monthlyIRR) || isNaN(monthlyIRR)) {
      return null;
    }

    // Annualize: (1 + monthlyRate)^12 - 1
    const annualIRR = Math.pow(1 + monthlyIRR, 12) - 1;

    // Return as percentage
    return annualIRR * 100;
  } catch (error) {
    // IRR calculation failed (no convergence, no solution, etc.)
    return null;
  }
}
