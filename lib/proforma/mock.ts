import type { ProFormaAssumptions, ProFormaRow } from "./types";
import { defaultAssumptions } from "./defaults";

// Simulate network delay
function delay(ms = 50): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// In-memory store for pro formas
const mockProFormas = new Map<string, ProFormaRow>();

/**
 * Get pro forma for a project (returns null if not exists).
 */
export async function getMockProForma(
  projectId: string
): Promise<ProFormaRow | null> {
  await delay();
  return mockProFormas.get(projectId) ?? null;
}

/**
 * Save pro forma assumptions for a project (upsert).
 */
export async function saveMockProForma(
  projectId: string,
  assumptions: ProFormaAssumptions
): Promise<ProFormaRow> {
  await delay();

  const row: ProFormaRow = {
    project_id: projectId,
    updated_at: new Date().toISOString(),
    assumptions,
  };

  mockProFormas.set(projectId, row);
  return row;
}

/**
 * Ensure pro forma exists for a project (creates with defaults if missing).
 */
export async function ensureMockProForma(
  projectId: string
): Promise<ProFormaRow> {
  await delay();

  const existing = mockProFormas.get(projectId);
  if (existing) {
    return existing;
  }

  // Create with defaults
  const row: ProFormaRow = {
    project_id: projectId,
    updated_at: new Date().toISOString(),
    assumptions: defaultAssumptions,
  };

  mockProFormas.set(projectId, row);
  return row;
}

/**
 * Seed pro forma with values from project profile (optional).
 * To be called from ensureProFormaRow if profile data is available.
 */
export function seedFromProfile(
  units: number | null,
  saleableAreaSqft: number | null
): Partial<ProFormaAssumptions> {
  return {
    program: {
      units,
      saleableAreaSqft,
      netToGrossPct: 80, // Default value for seeded projects
    },
  };
}
