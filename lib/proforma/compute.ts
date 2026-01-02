import type {
  ProFormaAssumptions,
  ProFormaOutputs,
  MonthlyCashflowRow,
} from "./types";
import { calculateEquityIRR } from "./irr";

/**
 * Compute pro forma outputs from assumptions (Phase 1: monthly cashflow engine).
 * @param base - The base assumptions
 * @param applyScenario - Whether to apply scenario deltas
 * @returns Computed outputs with all financial metrics
 */
export function computeProForma(
  base: ProFormaAssumptions,
  applyScenario: boolean
): ProFormaOutputs {
  // Check monetization support (Phase 1: FOR_SALE only)
  if (base.meta.monetization !== "FOR_SALE") {
    // Return placeholder outputs for unsupported monetization
    return {
      eff: {
        salePricePerSqft: null,
        hardCostPerSqft: null,
        interestRatePct: null,
        totalMonths: null,
        entitlementMonths: null,
        constructionMonths: null,
        salesLeaseMonths: null,
      },
      revenue: {
        grossRevenue: null,
        salesCommission: null,
        netRevenue: null,
      },
      costs: {
        landTotal: null,
        hard: null,
        soft: null,
        contingency: null,
        devFee: null,
        subtotalBeforeFinancing: null,
      },
      financing: {
        maxLoanAmount: null,
        lenderFee: null,
        totalInterest: null,
        totalFinancing: null,
      },
      totals: {
        totalCost: null,
        profit: null,
        profitMarginPct: null,
        equityNeededPeak: null,
        equityInvestedTotal: null,
        equityMultiple: null,
        equityIrrPct: null,
        roiPct: null,
      },
      monthly: {
        rows: [],
      },
      flags: {
        monetizationSupported: false,
      },
    };
  }

  // 1. Apply scenario deltas to get effective values
  const eff = computeEffectiveValues(base, applyScenario);

  // 2. Compute revenue
  const revenue = computeRevenue(base, eff);

  // 3. Compute costs (pre-financing)
  const costs = computeCosts(base, eff);

  // 4. Compute financing
  const financing = computeFinancing(base, eff, costs);

  // 5. Generate monthly cashflows
  const monthlyRows = generateMonthlyCashflows(
    base,
    eff,
    costs,
    financing.maxLoanAmount,
    revenue.netRevenue
  );

  // 5.5. Calculate total interest from monthly rows
  const totalInterest = monthlyRows.reduce((sum, row) => sum + row.interest, 0);

  // Update financing object with totalInterest
  const financingWithInterest: ProFormaOutputs["financing"] = {
    ...financing,
    totalInterest: totalInterest > 0 ? totalInterest : null,
  };

  // 6. Compute equity metrics from monthly cashflows
  const equityMetrics = computeEquityMetrics(monthlyRows);

  // 7. Compute totals (use updated financing object)
  const totals = computeTotals(revenue, costs, financingWithInterest, equityMetrics);

  return {
    eff,
    revenue,
    costs,
    financing: financingWithInterest,
    totals,
    monthly: {
      rows: monthlyRows,
    },
    flags: {
      monetizationSupported: true,
    },
  };
}

/**
 * Compute effective values after applying scenario deltas with phase resolution.
 */
function computeEffectiveValues(
  base: ProFormaAssumptions,
  applyScenario: boolean
): ProFormaOutputs["eff"] {
  // Determine base phase months
  let baseEntitlement = base.timeline.phases.entitlementMonths;
  let baseConstruction = base.timeline.phases.constructionMonths;
  let baseSalesLease = base.timeline.phases.salesLeaseMonths;

  // Auto-calc sales months from absorption if enabled
  if (
    base.timeline.autoCalcSalesMonths &&
    base.program.units !== null &&
    base.absorption.unitsPerMonth !== null &&
    base.absorption.unitsPerMonth > 0
  ) {
    baseSalesLease = Math.ceil(base.program.units / base.absorption.unitsPerMonth);
  }

  // Calculate base total
  const baseTotal =
    baseEntitlement !== null &&
    baseConstruction !== null &&
    baseSalesLease !== null
      ? baseEntitlement + baseConstruction + baseSalesLease
      : null;

  // Apply scenario deltas
  const deltaSalePrice = applyScenario
    ? base.scenario.deltaSalePricePerSqftPct
    : 0;
  const deltaHardCost = applyScenario ? base.scenario.deltaHardCostPerSqftPct : 0;
  const deltaInterest = applyScenario ? base.scenario.deltaInterestRatePct : 0;
  const deltaMonths = applyScenario ? base.scenario.deltaTotalMonths : 0;

  // Effective values for price/cost/rate
  const effSalePricePerSqft =
    base.revenueSale.salePricePerSqft !== null
      ? Math.max(
          0,
          base.revenueSale.salePricePerSqft * (1 + deltaSalePrice / 100)
        )
      : null;

  const effHardCostPerSqft =
    base.costs.hardCostPerSqft !== null
      ? Math.max(0, base.costs.hardCostPerSqft * (1 + deltaHardCost / 100))
      : null;

  const effInterestRatePct =
    base.financing.interestRatePct !== null
      ? Math.max(0, base.financing.interestRatePct + deltaInterest)
      : null;

  // Apply duration delta to phases
  let effEntitlement = baseEntitlement;
  let effConstruction = baseConstruction;
  let effSalesLease = baseSalesLease;

  if (
    baseTotal !== null &&
    baseEntitlement !== null &&
    baseConstruction !== null &&
    baseSalesLease !== null
  ) {
    const effTotal = Math.max(1, baseTotal + deltaMonths);
    const totalDelta = effTotal - baseTotal;

    // Allocate delta: positive adds to sales, negative subtracts from sales then construction then entitlement
    if (totalDelta >= 0) {
      effSalesLease = baseSalesLease + totalDelta;
    } else {
      let remaining = Math.abs(totalDelta);
      effSalesLease = Math.max(0, baseSalesLease - remaining);
      remaining -= baseSalesLease - effSalesLease;

      if (remaining > 0) {
        effConstruction = Math.max(0, baseConstruction - remaining);
        remaining -= baseConstruction - effConstruction;
      }

      if (remaining > 0) {
        effEntitlement = Math.max(0, baseEntitlement - remaining);
      }
    }
  }

  const effTotalMonths =
    effEntitlement !== null &&
    effConstruction !== null &&
    effSalesLease !== null
      ? effEntitlement + effConstruction + effSalesLease
      : null;

  return {
    salePricePerSqft: effSalePricePerSqft,
    hardCostPerSqft: effHardCostPerSqft,
    interestRatePct: effInterestRatePct,
    totalMonths: effTotalMonths,
    entitlementMonths: effEntitlement,
    constructionMonths: effConstruction,
    salesLeaseMonths: effSalesLease,
  };
}

/**
 * Compute revenue metrics (FOR_SALE only in Phase 1).
 */
function computeRevenue(
  base: ProFormaAssumptions,
  eff: ProFormaOutputs["eff"]
): ProFormaOutputs["revenue"] {
  // FOR_SALE only
  if (base.meta.monetization !== "FOR_SALE") {
    return {
      grossRevenue: null,
      salesCommission: null,
      netRevenue: null,
    };
  }

  // grossRevenue = saleableAreaSqft * effSalePricePerSqft + otherRevenue
  const grossRevenue =
    base.program.saleableAreaSqft !== null && eff.salePricePerSqft !== null
      ? base.program.saleableAreaSqft * eff.salePricePerSqft +
        (base.revenueSale.otherRevenue ?? 0)
      : null;

  // salesCommission = grossRevenue * (salesCommissionPct/100)
  const salesCommission =
    grossRevenue !== null && base.revenueSale.salesCommissionPct !== null
      ? grossRevenue * (base.revenueSale.salesCommissionPct / 100)
      : null;

  // netRevenue = grossRevenue - salesCommission
  const netRevenue =
    grossRevenue !== null && salesCommission !== null
      ? grossRevenue - salesCommission
      : null;

  return {
    grossRevenue,
    salesCommission,
    netRevenue,
  };
}

/**
 * Compute cost metrics (pre-financing).
 */
function computeCosts(
  base: ProFormaAssumptions,
  eff: ProFormaOutputs["eff"]
): ProFormaOutputs["costs"] {
  // hard = saleableAreaSqft * effHardCostPerSqft
  const hard =
    base.program.saleableAreaSqft !== null && eff.hardCostPerSqft !== null
      ? base.program.saleableAreaSqft * eff.hardCostPerSqft
      : null;

  // soft = hard * (softCostPctOfHard/100)
  const soft =
    hard !== null && base.costs.softCostPctOfHard !== null
      ? hard * (base.costs.softCostPctOfHard / 100)
      : null;

  // contHard = hard * (contingencyPctOfHard/100)
  const contHard =
    hard !== null && base.costs.contingencyPctOfHard !== null
      ? hard * (base.costs.contingencyPctOfHard / 100)
      : null;

  // contSoft = soft * (contingencyPctOfSoft/100)
  const contSoft =
    soft !== null && base.costs.contingencyPctOfSoft !== null
      ? soft * (base.costs.contingencyPctOfSoft / 100)
      : null;

  // contingency = contHard + contSoft
  const contingency =
    contHard !== null || contSoft !== null
      ? (contHard ?? 0) + (contSoft ?? 0)
      : null;

  // landClosing = landPrice * (closingCostsPct/100)
  const landClosing =
    base.acquisition.landPrice !== null &&
    base.acquisition.closingCostsPct !== null
      ? base.acquisition.landPrice * (base.acquisition.closingCostsPct / 100)
      : null;

  // landTotal = landPrice + landClosing
  const landTotal =
    base.acquisition.landPrice !== null
      ? base.acquisition.landPrice + (landClosing ?? 0)
      : null;

  // subtotalBeforeDevFee = landTotal + hard + soft + contingency
  const subtotalBeforeDevFee =
    landTotal !== null || hard !== null || soft !== null || contingency !== null
      ? (landTotal ?? 0) + (hard ?? 0) + (soft ?? 0) + (contingency ?? 0)
      : null;

  // devFee = subtotalBeforeDevFee * (devFeePctOfCost/100)
  const devFee =
    subtotalBeforeDevFee !== null && base.costs.devFeePctOfCost !== null
      ? subtotalBeforeDevFee * (base.costs.devFeePctOfCost / 100)
      : null;

  // subtotalBeforeFinancing = subtotalBeforeDevFee + devFee
  const subtotalBeforeFinancing =
    subtotalBeforeDevFee !== null
      ? subtotalBeforeDevFee + (devFee ?? 0)
      : null;

  return {
    landTotal,
    hard,
    soft,
    contingency,
    devFee,
    subtotalBeforeFinancing,
  };
}

/**
 * Compute financing metrics.
 */
function computeFinancing(
  base: ProFormaAssumptions,
  eff: ProFormaOutputs["eff"],
  costs: ProFormaOutputs["costs"]
): ProFormaOutputs["financing"] {
  // maxLoanAmount = subtotalBeforeFinancing * (loanToCostPct/100)
  const maxLoanAmount =
    costs.subtotalBeforeFinancing !== null &&
    base.financing.loanToCostPct !== null
      ? costs.subtotalBeforeFinancing * (base.financing.loanToCostPct / 100)
      : null;

  // lenderFee = maxLoanAmount * (lenderFeePct/100)
  const lenderFee =
    maxLoanAmount !== null && base.financing.lenderFeePct !== null
      ? maxLoanAmount * (base.financing.lenderFeePct / 100)
      : null;

  // totalInterest will be computed from monthly cashflows
  // totalFinancing will be computed in totals

  return {
    maxLoanAmount,
    lenderFee,
    totalInterest: null, // Computed from monthly rows
    totalFinancing: null, // Computed in totals
  };
}

/**
 * Generate monthly cashflow rows (Phase 1 MVP engine).
 */
function generateMonthlyCashflows(
  base: ProFormaAssumptions,
  eff: ProFormaOutputs["eff"],
  costs: ProFormaOutputs["costs"],
  maxLoanAmount: number | null,
  netRevenue: number | null
): MonthlyCashflowRow[] {
  // Check if we have enough data to generate cashflows
  if (
    eff.totalMonths === null ||
    eff.entitlementMonths === null ||
    eff.constructionMonths === null ||
    eff.salesLeaseMonths === null ||
    costs.subtotalBeforeFinancing === null
  ) {
    return [];
  }

  const N = eff.totalMonths;
  const E = eff.entitlementMonths;
  const C = eff.constructionMonths;
  const S = eff.salesLeaseMonths;

  const rows: MonthlyCashflowRow[] = [];

  // Extract cost totals (null defaults to 0 for spreading)
  const landTotal = costs.landTotal ?? 0;
  const hardTotal = costs.hard ?? 0;
  const softTotal = costs.soft ?? 0;
  const contingencyTotal = costs.contingency ?? 0;
  const devFeeTotal = costs.devFee ?? 0;
  const lenderFeeTotal =
    maxLoanAmount !== null && base.financing.lenderFeePct !== null
      ? maxLoanAmount * (base.financing.lenderFeePct / 100)
      : 0;

  // Debt and interest tracking
  let debtOutstanding = 0;
  let costToDateExcludingInterest = 0;

  // Cost spreading logic
  for (let m = 1; m <= N; m++) {
    // Determine phase
    let phase: "ENTITLEMENT" | "CONSTRUCTION" | "SALES_LEASE";
    if (m <= E) {
      phase = "ENTITLEMENT";
    } else if (m <= E + C) {
      phase = "CONSTRUCTION";
    } else {
      phase = "SALES_LEASE";
    }

    // Initialize monthly costs
    let land = 0;
    let soft = 0;
    let hard = 0;
    let contingency = 0;
    let devFee = 0;
    let lenderFee = 0;

    // Land: paid in month 1
    if (m === 1) {
      land = landTotal;
    }

    // Lender fee: paid in month 1
    if (m === 1) {
      lenderFee = lenderFeeTotal;
    }

    // Soft costs: 60% across ENTITLEMENT, 40% across first half of CONSTRUCTION
    if (phase === "ENTITLEMENT" && E > 0) {
      soft = softTotal * 0.6 / E;
    } else if (phase === "CONSTRUCTION" && C > 0) {
      const firstHalfC = Math.ceil(C / 2);
      const monthInConstruction = m - E;
      if (monthInConstruction <= firstHalfC) {
        soft = softTotal * 0.4 / firstHalfC;
      }
    }

    // Hard costs: spread evenly across CONSTRUCTION
    if (phase === "CONSTRUCTION" && C > 0) {
      hard = hardTotal / C;
    }

    // Contingency: spread evenly across CONSTRUCTION
    if (phase === "CONSTRUCTION" && C > 0) {
      contingency = contingencyTotal / C;
    }

    // Dev fee: spread evenly across CONSTRUCTION
    if (phase === "CONSTRUCTION" && C > 0) {
      devFee = devFeeTotal / C;
    }

    // Revenue: distribute across SALES_LEASE
    let salesRevenue = 0;
    if (phase === "SALES_LEASE" && S > 0 && netRevenue !== null) {
      // Check if absorption-based or even spread
      if (
        base.absorption.unitsPerMonth !== null &&
        base.absorption.unitsPerMonth > 0 &&
        base.program.units !== null &&
        base.program.units > 0
      ) {
        // Absorption-based: flat rate
        const revenuePerUnit = netRevenue / base.program.units;
        const monthInSales = m - E - C;
        const unitsClosedSoFar = Math.min(
          (monthInSales - 1) * base.absorption.unitsPerMonth,
          base.program.units
        );
        const unitsClosingThisMonth = Math.min(
          base.absorption.unitsPerMonth,
          base.program.units - unitsClosedSoFar
        );
        salesRevenue = unitsClosingThisMonth * revenuePerUnit;
      } else {
        // Even spread
        salesRevenue = netRevenue / S;
      }
    }

    // Update cost-to-date (excluding interest)
    costToDateExcludingInterest += land + soft + hard + contingency + devFee + lenderFee;

    // Debt draw logic
    let loanDraw = 0;
    if (maxLoanAmount !== null && costs.subtotalBeforeFinancing !== null && costs.subtotalBeforeFinancing > 0) {
      const debtCapacity = Math.min(
        (costToDateExcludingInterest / costs.subtotalBeforeFinancing) * maxLoanAmount,
        maxLoanAmount
      );
      loanDraw = Math.max(0, debtCapacity - debtOutstanding);
    }

    // Interest calculation (average balance method)
    let interest = 0;
    if (eff.interestRatePct !== null && eff.interestRatePct > 0) {
      const avgBalance = (debtOutstanding + (debtOutstanding + loanDraw)) / 2;
      interest = avgBalance * (eff.interestRatePct / 100) / 12;
    }

    // Equity (plug)
    const uses = land + soft + hard + contingency + devFee + lenderFee + interest;
    const sources = salesRevenue + loanDraw;
    const equity = uses - sources;

    // Update debt outstanding
    debtOutstanding += loanDraw;

    // Create row
    rows.push({
      monthIndex: m,
      phase,
      land,
      soft,
      hard,
      contingency,
      devFee,
      lenderFee,
      interest,
      salesRevenue,
      loanDraw,
      equity,
      debtOutstanding,
    });
  }

  return rows;
}

/**
 * Compute equity metrics from monthly cashflows.
 */
function computeEquityMetrics(rows: MonthlyCashflowRow[]): {
  equityInvestedTotal: number | null;
  equityNeededPeak: number | null;
  equityMultiple: number | null;
  equityIrrPct: number | null;
} {
  if (rows.length === 0) {
    return {
      equityInvestedTotal: null,
      equityNeededPeak: null,
      equityMultiple: null,
      equityIrrPct: null,
    };
  }

  const equityCashflows = rows.map((row) => row.equity);

  // Equity invested total (sum of negative equity, absolute value)
  const equityInvestedTotal = equityCashflows
    .filter((cf) => cf < 0)
    .reduce((sum, cf) => sum + Math.abs(cf), 0);

  // Peak equity needed (max cumulative negative balance)
  let cumulative = 0;
  let peak = 0;
  for (const equity of equityCashflows) {
    cumulative += equity;
    peak = Math.min(peak, cumulative);
  }
  const equityNeededPeak = Math.abs(peak);

  // Equity multiple (positive equity / negative equity)
  const positiveEquity = equityCashflows
    .filter((cf) => cf > 0)
    .reduce((sum, cf) => sum + cf, 0);
  const equityMultiple =
    equityInvestedTotal > 0 ? positiveEquity / equityInvestedTotal : null;

  // Equity IRR (from monthly cashflows, annualized)
  const equityIrrPct = calculateEquityIRR(equityCashflows);

  return {
    equityInvestedTotal: equityInvestedTotal > 0 ? equityInvestedTotal : null,
    equityNeededPeak: equityNeededPeak > 0 ? equityNeededPeak : null,
    equityMultiple,
    equityIrrPct,
  };
}

/**
 * Compute total metrics and returns.
 */
function computeTotals(
  revenue: ProFormaOutputs["revenue"],
  costs: ProFormaOutputs["costs"],
  financing: ProFormaOutputs["financing"],
  equityMetrics: {
    equityInvestedTotal: number | null;
    equityNeededPeak: number | null;
    equityMultiple: number | null;
    equityIrrPct: number | null;
  }
): ProFormaOutputs["totals"] {
  // totalInterest from monthly cashflows (already computed in financing, but we'll use equity metrics context)
  // For now, recompute from costs + financing
  const totalFinancing =
    financing.lenderFee !== null
      ? financing.lenderFee + (financing.totalInterest ?? 0)
      : null;

  // totalCost = subtotalBeforeFinancing + totalFinancing
  const totalCost =
    costs.subtotalBeforeFinancing !== null || totalFinancing !== null
      ? (costs.subtotalBeforeFinancing ?? 0) + (totalFinancing ?? 0)
      : null;

  // profit = netRevenue - totalCost
  const profit =
    revenue.netRevenue !== null && totalCost !== null
      ? revenue.netRevenue - totalCost
      : null;

  // profitMarginPct = (profit / netRevenue) * 100
  const profitMarginPct =
    profit !== null && revenue.netRevenue !== null && revenue.netRevenue !== 0
      ? (profit / revenue.netRevenue) * 100
      : null;

  // roiPct = (profit / equityInvestedTotal) * 100
  const roiPct =
    profit !== null &&
    equityMetrics.equityInvestedTotal !== null &&
    equityMetrics.equityInvestedTotal !== 0
      ? (profit / equityMetrics.equityInvestedTotal) * 100
      : null;

  return {
    totalCost,
    profit,
    profitMarginPct,
    equityNeededPeak: equityMetrics.equityNeededPeak,
    equityInvestedTotal: equityMetrics.equityInvestedTotal,
    equityMultiple: equityMetrics.equityMultiple,
    equityIrrPct: equityMetrics.equityIrrPct,
    roiPct,
  };
}

/**
 * Compute delta between two values.
 */
export function computeDelta(
  base: number | null,
  scenario: number | null
): number | null {
  if (base === null || scenario === null) return null;
  return scenario - base;
}
