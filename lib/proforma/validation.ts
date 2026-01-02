import { z } from "zod";

// Helper: nullable number (finite, allow null)
const nullableNumber = z.number().finite().nullable();

// Helper: nullable percent (0-100, allow null)
const nullablePercent = z.number().min(0).max(100).nullable();

// Enums for asset type and monetization
const assetTypeSchema = z.enum(['TOWNHOME', 'MULTIFAMILY']);
const monetizationSchema = z.enum(['FOR_SALE', 'FOR_RENT']);

// Meta validation
const metaSchema = z.object({
  assetType: assetTypeSchema,
  monetization: monetizationSchema,
});

// Program validation
const programSchema = z.object({
  units: z.number().int().min(1).max(50000).nullable(),
  saleableAreaSqft: z.number().min(1).max(5000000).nullable(),
  netToGrossPct: z.number().min(30).max(95).nullable(), // For multifamily
});

// Acquisition validation
const acquisitionSchema = z.object({
  landPrice: nullableNumber,
  closingCostsPct: nullablePercent,
});

// Revenue - For Sale validation
const revenueSaleSchema = z.object({
  salePricePerSqft: nullableNumber,
  otherRevenue: nullableNumber,
  salesCommissionPct: nullablePercent,
});

// Revenue - For Rent validation (Phase 1 placeholder)
const revenueRentSchema = z.object({
  avgRentPerUnitMonthly: nullableNumber,
  vacancyPct: nullablePercent,
});

// Costs validation
const costsSchema = z.object({
  hardCostPerSqft: nullableNumber,
  softCostPctOfHard: nullablePercent,
  contingencyPctOfHard: nullablePercent,
  contingencyPctOfSoft: nullablePercent,
  devFeePctOfCost: nullablePercent,
});

// Financing validation (removed interestCoverageFactor)
const financingSchema = z.object({
  loanToCostPct: nullablePercent,
  interestRatePct: nullablePercent,
  lenderFeePct: nullablePercent,
});

// Timeline phases validation
const phasesSchema = z.object({
  entitlementMonths: z.number().int().min(0).max(120).nullable(),
  constructionMonths: z.number().int().min(0).max(120).nullable(),
  salesLeaseMonths: z.number().int().min(0).max(120).nullable(),
});

// Timeline validation with phases
const timelineSchema = z.object({
  phases: phasesSchema,
  totalMonths: z.number().int().min(1).max(240).nullable(),
  autoCalcSalesMonths: z.boolean(),
});

// Absorption validation
const absorptionSchema = z.object({
  unitsPerMonth: z.number().min(0.1).max(500).nullable(),
});

// Scenario validation (not nullable, defaults to 0)
const scenarioSchema = z.object({
  deltaSalePricePerSqftPct: z.number().min(-10).max(10),
  deltaHardCostPerSqftPct: z.number().min(-10).max(10),
  deltaInterestRatePct: z.number().min(-2).max(2), // Absolute points
  deltaTotalMonths: z.number().int().min(-6).max(6),
});

// Complete assumptions schema
export const assumptionsSchema = z.object({
  meta: metaSchema,
  program: programSchema,
  acquisition: acquisitionSchema,
  revenueSale: revenueSaleSchema,
  revenueRent: revenueRentSchema,
  costs: costsSchema,
  financing: financingSchema,
  timeline: timelineSchema,
  absorption: absorptionSchema,
  scenario: scenarioSchema,
});

// Server action input schema (includes project_id)
export const saveProFormaSchema = z.object({
  projectId: z.string().uuid(),
  assumptions: assumptionsSchema,
});
