import type { ProFormaAssumptions } from "./types";

// Default assumptions with all numeric fields as null and scenario deltas as 0
export const defaultAssumptions: ProFormaAssumptions = {
  meta: {
    assetType: 'TOWNHOME',
    monetization: 'FOR_SALE',
  },
  program: {
    units: null,
    saleableAreaSqft: null,
    netToGrossPct: 80, // Default for multifamily modeling
  },
  acquisition: {
    landPrice: null,
    closingCostsPct: null,
  },
  revenueSale: {
    salePricePerSqft: null,
    otherRevenue: null,
    salesCommissionPct: null,
  },
  revenueRent: {
    avgRentPerUnitMonthly: null,
    vacancyPct: null,
  },
  costs: {
    hardCostPerSqft: null,
    softCostPctOfHard: null,
    contingencyPctOfHard: null,
    contingencyPctOfSoft: null,
    devFeePctOfCost: null,
  },
  financing: {
    loanToCostPct: null,
    interestRatePct: null,
    lenderFeePct: null,
  },
  timeline: {
    phases: {
      entitlementMonths: 6,
      constructionMonths: 18,
      salesLeaseMonths: 6,
    },
    totalMonths: 30, // Auto-sum of phases
    autoCalcSalesMonths: true, // Default ON per user decision
  },
  absorption: {
    unitsPerMonth: 4, // Typical absorption rate
  },
  scenario: {
    deltaSalePricePerSqftPct: 0,
    deltaHardCostPerSqftPct: 0,
    deltaInterestRatePct: 0,
    deltaTotalMonths: 0,
  },
};

// Recommended slider ranges for scenario analysis
export const scenarioRanges = {
  deltaSalePricePerSqftPct: { min: -10, max: 10, step: 1 },
  deltaHardCostPerSqftPct: { min: -10, max: 10, step: 1 },
  deltaInterestRatePct: { min: -2, max: 2, step: 0.1 },
  deltaTotalMonths: { min: -6, max: 6, step: 1 },
} as const;
