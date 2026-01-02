import type { ProFormaAssumptions } from "./types";
import {
  getMockProForma,
  ensureMockProForma,
  seedFromProfile,
} from "./mock";
import { defaultAssumptions } from "./defaults";

/**
 * Migrate legacy pro forma assumptions to current schema.
 * Handles backward compatibility for data saved before Phase 1 upgrade.
 */
function migrateLegacyAssumptions(assumptions: any): ProFormaAssumptions {
  const migrated = { ...assumptions };

  // Migrate timeline.totalMonths → phases (25/60/15 split)
  if (migrated.timeline?.totalMonths && !migrated.timeline?.phases) {
    const total = migrated.timeline.totalMonths;
    const entitlement = Math.round(total * 0.25);
    const construction = Math.round(total * 0.60);
    const salesLease = total - entitlement - construction;

    migrated.timeline = {
      phases: {
        entitlementMonths: entitlement,
        constructionMonths: construction,
        salesLeaseMonths: salesLease,
      },
      totalMonths: total,
      autoCalcSalesMonths: false, // Default off for migrated data
    };
  }

  // Migrate revenue → revenueSale
  if (migrated.revenue && !migrated.revenueSale) {
    migrated.revenueSale = migrated.revenue;
    migrated.revenueRent = {
      avgRentPerUnitMonthly: null,
      vacancyPct: null,
    };
    delete migrated.revenue;
  }

  // Remove deprecated interestCoverageFactor
  if (migrated.financing?.interestCoverageFactor !== undefined) {
    delete migrated.financing.interestCoverageFactor;
  }

  // Add missing meta
  if (!migrated.meta) {
    migrated.meta = {
      assetType: 'TOWNHOME',
      monetization: 'FOR_SALE',
    };
  }

  // Add missing absorption
  if (!migrated.absorption) {
    migrated.absorption = {
      unitsPerMonth: 4,
    };
  }

  // Add missing program.netToGrossPct
  if (migrated.program && migrated.program.netToGrossPct === undefined) {
    migrated.program.netToGrossPct = 80;
  }

  // Ensure timeline structure exists
  if (!migrated.timeline) {
    migrated.timeline = defaultAssumptions.timeline;
  }

  // Ensure autoCalcSalesMonths exists
  if (migrated.timeline && migrated.timeline.autoCalcSalesMonths === undefined) {
    migrated.timeline.autoCalcSalesMonths = true;
  }

  return migrated as ProFormaAssumptions;
}

/**
 * Get pro forma assumptions for a project.
 * Returns null if no pro forma exists.
 * Applies migration to handle legacy data formats.
 */
export async function getProForma(
  projectId: string
): Promise<ProFormaAssumptions | null> {
  // Use mock layer
  const row = await getMockProForma(projectId);

  if (!row?.assumptions) {
    return null;
  }

  // Apply migration to handle legacy data
  return migrateLegacyAssumptions(row.assumptions);

  /* Future Supabase implementation:
  const { data, error } = await supabase
    .from('project_proformas')
    .select('assumptions')
    .eq('project_id', projectId)
    .single();

  if (error || !data) return null;
  return migrateLegacyAssumptions(data.assumptions);
  */
}

/**
 * Ensure a pro forma row exists for a project.
 * Creates with defaults (optionally seeded from profile) if missing.
 */
export async function ensureProFormaRow(
  projectId: string
): Promise<ProFormaAssumptions> {
  // Check if exists
  const existing = await getProForma(projectId);
  if (existing) {
    return existing;
  }

  // Try to seed from project profile
  const seededAssumptions = await seedFromProjectProfile(projectId);

  // Use mock layer to create
  const row = await ensureMockProForma(projectId);

  // Merge seeded values if available
  if (seededAssumptions) {
    const merged = {
      ...row.assumptions,
      program: {
        ...row.assumptions.program,
        ...seededAssumptions.program,
      },
    };
    return merged;
  }

  return row.assumptions;

  /* Future Supabase implementation:
  // Attempt insert with defaults
  const assumptions = seededAssumptions || defaultAssumptions;

  const { data, error } = await supabase
    .from('project_proformas')
    .upsert({
      project_id: projectId,
      assumptions,
    })
    .select('assumptions')
    .single();

  if (error) throw error;
  return data.assumptions as ProFormaAssumptions;
  */
}

/**
 * Attempt to seed pro forma from project profile data.
 * Returns null if profile not found or has no relevant data.
 */
async function seedFromProjectProfile(
  projectId: string
): Promise<Partial<ProFormaAssumptions> | null> {
  try {
    // Import here to avoid circular deps
    const { getProjectAndProfile } = await import("../projects/profile-queries");
    const { project, profile } = await getProjectAndProfile(projectId);

    if (!profile?.data) return null;

    const { proposal } = profile.data;

    // Extract units and GFA from profile
    const units = proposal?.unitsProposed ?? null;
    const gfaValue = proposal?.gfa?.value ?? null;
    const gfaUnit = proposal?.gfa?.unit ?? "sqft";

    // Convert GFA to sqft if needed
    let saleableAreaSqft = gfaValue;
    if (gfaValue && gfaUnit === "m2") {
      saleableAreaSqft = gfaValue * 10.7639; // m2 to sqft
    }

    if (units || saleableAreaSqft) {
      return seedFromProfile(units, saleableAreaSqft);
    }

    return null;
  } catch (error) {
    // If profile queries fail, just return null
    return null;
  }
}
