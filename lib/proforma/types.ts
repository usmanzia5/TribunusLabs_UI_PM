// Pro Forma types for assumptions, outputs, and database row

export type AssetType = 'TOWNHOME' | 'MULTIFAMILY';
export type Monetization = 'FOR_SALE' | 'FOR_RENT';
export type PhaseType = 'ENTITLEMENT' | 'CONSTRUCTION' | 'SALES_LEASE';

export type MonthlyCashflowRow = {
  monthIndex: number; // 1..N
  phase: PhaseType;
  // Uses
  land: number;
  soft: number;
  hard: number;
  contingency: number;
  devFee: number;
  lenderFee: number;
  interest: number;
  // Sources
  salesRevenue: number;
  loanDraw: number;
  equity: number; // plug (negative = investment, positive = distribution)
  // Balances
  debtOutstanding: number;
};

export type ProFormaAssumptions = {
  // Meta (Phase 1: asset type and monetization toggles)
  meta: {
    assetType: AssetType;
    monetization: Monetization; // Phase 1: FOR_SALE fully calculated; FOR_RENT gated
  };

  // Program
  program: {
    units: number | null;
    saleableAreaSqft: number | null; // GFA/saleable area for revenue + cost per sqft
    netToGrossPct: number | null; // For multifamily modeling (Phase 1: optional)
  };

  // Acquisition
  acquisition: {
    landPrice: number | null; // CAD
    closingCostsPct: number | null; // % of land price (legal, transfer taxes, etc)
  };

  // Revenue — FOR SALE (Phase 1: active)
  revenueSale: {
    salePricePerSqft: number | null; // CAD/sqft
    otherRevenue: number | null; // CAD (parking, storage, misc)
    salesCommissionPct: number | null; // % of total revenue
  };

  // Revenue — FOR RENT (Phase 1: placeholder fields only, UI gated)
  revenueRent: {
    avgRentPerUnitMonthly: number | null; // Placeholder (not used in Phase 1 calcs)
    vacancyPct: number | null; // Placeholder
  };

  // Costs
  costs: {
    hardCostPerSqft: number | null; // CAD/sqft
    softCostPctOfHard: number | null; // % of hard
    contingencyPctOfHard: number | null; // % of hard
    contingencyPctOfSoft: number | null; // % of soft
    devFeePctOfCost: number | null; // % of (land + hard + soft + contingency)
  };

  // Financing (Phase 1: construction debt with monthly interest accrual)
  financing: {
    loanToCostPct: number | null; // % LTC cap
    interestRatePct: number | null; // annual %
    lenderFeePct: number | null; // % of loan amount (one-time)
  };

  // Timeline (Phase 1: 3 phases; total auto-sum)
  timeline: {
    phases: {
      entitlementMonths: number | null;
      constructionMonths: number | null;
      salesLeaseMonths: number | null;
    };
    totalMonths: number | null; // Derived, auto-computed from phases
    autoCalcSalesMonths: boolean; // If true, auto-calc salesLeaseMonths from absorption
  };

  // For-sale absorption (Phase 1)
  absorption: {
    unitsPerMonth: number | null; // Used to auto compute salesLeaseMonths if enabled
  };

  // Scenario sliders (UI-only; persist if user saves)
  scenario: {
    deltaSalePricePerSqftPct: number; // e.g., -10..+10
    deltaHardCostPerSqftPct: number; // e.g., -10..+10
    deltaInterestRatePct: number; // e.g., -2..+2 (absolute points)
    deltaTotalMonths: number; // e.g., -6..+6 months (applied to total, allocated to phases)
  };
};

export type ProFormaOutputs = {
  // Derived inputs (after scenario)
  eff: {
    salePricePerSqft: number | null;
    hardCostPerSqft: number | null;
    interestRatePct: number | null;
    totalMonths: number | null;
    entitlementMonths: number | null;
    constructionMonths: number | null;
    salesLeaseMonths: number | null;
  };

  // Core $ values
  revenue: {
    grossRevenue: number | null;
    salesCommission: number | null;
    netRevenue: number | null;
  };

  costs: {
    landTotal: number | null; // land + closing costs
    hard: number | null;
    soft: number | null;
    contingency: number | null;
    devFee: number | null;
    subtotalBeforeFinancing: number | null;
  };

  financing: {
    maxLoanAmount: number | null; // Renamed from loanAmount
    lenderFee: number | null;
    totalInterest: number | null; // Renamed from interest (sum of monthly interest)
    totalFinancing: number | null;
  };

  totals: {
    totalCost: number | null;
    profit: number | null;
    profitMarginPct: number | null; // profit / netRevenue
    equityNeededPeak: number | null; // NEW: peak equity invested at any point
    equityInvestedTotal: number | null; // NEW: sum of equity injections
    equityMultiple: number | null; // (sum positive equity) / (sum negative equity)
    equityIrrPct: number | null; // NEW: annualized IRR from equity cashflows
    roiPct: number | null; // profit / equityInvestedTotal
  };

  // Monthly cashflow breakdown (Phase 1)
  monthly: {
    rows: MonthlyCashflowRow[];
  };

  // Deltas (scenario vs base comparison)
  deltas?: {
    profitDelta: number | null;
    profitMarginDeltaPct: number | null;
    equityNeededDelta: number | null;
  };

  // Flags
  flags: {
    monetizationSupported: boolean; // true only for FOR_SALE in Phase 1
  };
};

export type ProFormaRow = {
  project_id: string;
  updated_at: string;
  assumptions: ProFormaAssumptions;
};
