import type {
  CreateSourceInput,
  ListSourcesParams,
  ProjectSource,
  UpdateSourceInput,
} from "@/lib/sources/types";
import { ProjectProfile, ProjectProfileData } from "@/lib/projects/profile-types";
import { createDefaultProfile } from "@/lib/projects/profile-defaults";

/**
 * Mock data store for development/testing
 * Replace with real Supabase calls once configured
 */

export interface MockProject {
  id: string;
  name: string;
  address: string | null;
  created_at: string;
  updated_at: string;
}

// In-memory data store
let mockProjects: MockProject[] = [
  {
    id: "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
    name: "Downtown Office Complex",
    address: "123 Main St, San Francisco, CA 94102",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q",
    name: "Riverside Residential Development",
    address: "456 River Rd, Portland, OR 97201",
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r",
    name: "Tech Campus Expansion",
    address: null,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

/**
 * Simulates async delay for realistic feel
 */
function delay(ms: number = 50) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate a UUID-like ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export interface MockQueryParams {
  q?: string;
  sort?: "updated_desc" | "created_desc" | "name_asc";
  limit?: number;
}

/**
 * Get all projects with optional search and sort
 */
export async function getMockProjects(
  params: MockQueryParams = {}
): Promise<MockProject[]> {
  await delay();

  let result = [...mockProjects];

  // Search filter
  if (params.q) {
    const query = params.q.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.address?.toLowerCase().includes(query)
    );
  }

  // Sort
  const sort = params.sort || "updated_desc";
  result.sort((a, b) => {
    switch (sort) {
      case "updated_desc":
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      case "created_desc":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "name_asc":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  // Limit
  if (params.limit) {
    result = result.slice(0, params.limit);
  }

  return result;
}

/**
 * Get a single project by ID
 */
export async function getMockProjectById(
  id: string
): Promise<MockProject | null> {
  await delay();
  return mockProjects.find((p) => p.id === id) || null;
}

/**
 * Create a new project
 */
export async function createMockProject(input: {
  name: string;
  address?: string | null;
}): Promise<MockProject> {
  await delay();

  const now = new Date().toISOString();
  const newProject: MockProject = {
    id: generateId(),
    name: input.name,
    address: input.address || null,
    created_at: now,
    updated_at: now,
  };

  mockProjects.unshift(newProject);
  return newProject;
}

/**
 * Update a project's name
 */
export async function updateMockProject(
  id: string,
  updates: { name?: string; address?: string | null }
): Promise<MockProject | null> {
  await delay();

  const index = mockProjects.findIndex((p) => p.id === id);
  if (index === -1) return null;

  mockProjects[index] = {
    ...mockProjects[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };

  return mockProjects[index];
}

/**
 * Delete a project
 */
export async function deleteMockProject(id: string): Promise<boolean> {
  await delay();

  const index = mockProjects.findIndex((p) => p.id === id);
  if (index === -1) return false;

  mockProjects.splice(index, 1);
  return true;
}

// ============================================================================
// Project Profiles Mock Storage
// ============================================================================

// In-memory profile storage (Map for O(1) lookup)
let mockProfiles: Map<string, ProjectProfile> = new Map();

/**
 * Get project profile by project ID
 * Auto-creates a default profile if one doesn't exist
 */
export async function getMockProjectProfile(
  projectId: string
): Promise<ProjectProfile | null> {
  await delay();

  // Auto-create if doesn't exist
  if (!mockProfiles.has(projectId)) {
    const project = mockProjects.find((p) => p.id === projectId);
    if (!project) return null;

    const defaultProfile = createDefaultProfile(
      projectId,
      project.name,
      project.address
    );
    mockProfiles.set(projectId, defaultProfile);
  }

  return mockProfiles.get(projectId) || null;
}

/**
 * Update project profile
 */
export async function updateMockProjectProfile(
  projectId: string,
  data: ProjectProfileData,
  setupStatus: "draft" | "complete"
): Promise<ProjectProfile> {
  await delay();

  const updated: ProjectProfile = {
    project_id: projectId,
    updated_at: new Date().toISOString(),
    setup_status: setupStatus,
    data,
  };

  mockProfiles.set(projectId, updated);
  return updated;
}

// ============================================================================
// Project Sources Mock Storage
// ============================================================================

let mockSources: ProjectSource[] = [
  {
    id: "source-1",
    project_id: mockProjects[0].id,
    kind: "council_report",
    format: "url",
    title: "Council report: Rezoning approval",
    url: "https://city.example.org/reports/rezoning-123-main",
    storage_path: null,
    mime_type: null,
    file_size_bytes: null,
    publisher: "City Council",
    published_at: "2024-03-15",
    meeting_date: "2024-03-12",
    meeting_body: "City Council",
    agenda_item: "Rezoning - 123 Main St",
    project_ref: "DP-2024-015",
    tags: ["zoning", "council"],
    notes: "Includes conditions for façade treatments.",
    status: "active",
    ingestion: "not_ingested",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "source-2",
    project_id: mockProjects[0].id,
    kind: "news",
    format: "file",
    title: "Local paper coverage",
    url: null,
    storage_path: `${mockProjects[0].id}/source-2/story.pdf`,
    mime_type: "application/pdf",
    file_size_bytes: 1024 * 320,
    publisher: "San Francisco Times",
    published_at: "2024-02-20",
    meeting_date: null,
    meeting_body: null,
    agenda_item: null,
    project_ref: null,
    tags: ["news", "community"],
    notes: null,
    status: "active",
    ingestion: "not_ingested",
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "source-3",
    project_id: mockProjects[1].id,
    kind: "zoning_map",
    format: "url",
    title: "Zoning map - waterfront",
    url: "https://planning.example.org/maps/waterfront-zoning",
    storage_path: null,
    mime_type: null,
    file_size_bytes: null,
    publisher: "Planning Dept.",
    published_at: null,
    meeting_date: null,
    meeting_body: null,
    agenda_item: null,
    project_ref: "WF-2023-08",
    tags: ["map", "zoning"],
    notes: "Check overlays for floodplain.",
    status: "archived",
    ingestion: "not_ingested",
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

function compareDateStringsDesc(aDate: string | null, bDate: string | null) {
  if (!aDate && !bDate) return 0;
  if (!aDate) return 1;
  if (!bDate) return -1;
  return new Date(bDate).getTime() - new Date(aDate).getTime();
}

/**
 * Get sources for a project with search/filter/sort options
 */
export async function getMockProjectSources(
  projectId: string,
  params: ListSourcesParams = {}
): Promise<ProjectSource[]> {
  await delay();

  let results = mockSources.filter((source) => source.project_id === projectId);

  // Status filter (default active)
  const statusFilter = params.status ?? "active";
  if (statusFilter !== "all") {
    results = results.filter((source) => source.status === statusFilter);
  }

  // Kind filter
  if (params.kind && params.kind !== "all") {
    results = results.filter((source) => source.kind === params.kind);
  }

  // Search
  if (params.q) {
    const query = params.q.toLowerCase();
    results = results.filter((source) => {
      const haystacks = [
        source.title,
        source.publisher,
        source.notes,
        source.url,
        source.project_ref,
      ]
        .filter(Boolean)
        .map((value) => value!.toLowerCase());

      return haystacks.some((value) => value.includes(query));
    });
  }

  // Sort
  const sort = params.sort ?? "updated_desc";
  results = [...results].sort((a, b) => {
    switch (sort) {
      case "created_desc":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "title_asc":
        return a.title.localeCompare(b.title);
      case "published_desc":
        return compareDateStringsDesc(a.published_at, b.published_at);
      case "meeting_desc":
        return compareDateStringsDesc(a.meeting_date, b.meeting_date);
      case "updated_desc":
      default:
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    }
  });

  return results;
}

export async function getMockSourceById(
  projectId: string,
  sourceId: string
): Promise<ProjectSource | null> {
  await delay();
  return (
    mockSources.find(
      (source) => source.project_id === projectId && source.id === sourceId
    ) || null
  );
}

export async function createMockSource(
  projectId: string,
  input: CreateSourceInput
): Promise<ProjectSource> {
  await delay();

  const now = new Date().toISOString();
  const newSource: ProjectSource = {
    id: generateId(),
    project_id: projectId,
    kind: input.kind,
    format: input.format,
    title: input.title,
    url: input.format === "url" ? input.url : null,
    storage_path: input.format === "file" ? input.storage_path : null,
    mime_type: input.format === "file" ? input.mime_type ?? null : null,
    file_size_bytes:
      input.format === "file" ? input.file_size_bytes ?? null : null,
    publisher: input.publisher ?? null,
    published_at: input.published_at ?? null,
    meeting_date: input.meeting_date ?? null,
    meeting_body: input.meeting_body ?? null,
    agenda_item: input.agenda_item ?? null,
    project_ref: input.project_ref ?? null,
    tags: input.tags ?? [],
    notes: input.notes ?? null,
    status: "active",
    ingestion: "not_ingested",
    created_at: now,
    updated_at: now,
  };

  mockSources.unshift(newSource);
  return newSource;
}

export async function updateMockSource(
  projectId: string,
  input: UpdateSourceInput
): Promise<ProjectSource | null> {
  await delay();

  const index = mockSources.findIndex(
    (source) => source.project_id === projectId && source.id === input.id
  );

  if (index === -1) return null;

  const existing = mockSources[index];
  const nextFormat = input.format ?? existing.format;

  const updated: ProjectSource = {
    ...existing,
    ...input,
    format: nextFormat,
    url: nextFormat === "url" ? input.url ?? existing.url : null,
    storage_path:
      nextFormat === "file"
        ? input.storage_path ?? existing.storage_path
        : null,
    mime_type:
      nextFormat === "file" ? input.mime_type ?? existing.mime_type : null,
    file_size_bytes:
      nextFormat === "file"
        ? input.file_size_bytes ?? existing.file_size_bytes
        : null,
    publisher: input.publisher ?? existing.publisher,
    published_at: input.published_at ?? existing.published_at,
    meeting_date: input.meeting_date ?? existing.meeting_date,
    meeting_body: input.meeting_body ?? existing.meeting_body,
    agenda_item: input.agenda_item ?? existing.agenda_item,
    project_ref: input.project_ref ?? existing.project_ref,
    tags: input.tags ?? existing.tags,
    notes: input.notes ?? existing.notes,
    status: input.status ?? existing.status,
    ingestion: "not_ingested",
    created_at: existing.created_at,
    updated_at: new Date().toISOString(),
  };

  mockSources[index] = updated;
  return updated;
}

export async function deleteMockSource(
  projectId: string,
  sourceId: string
): Promise<boolean> {
  await delay();

  const index = mockSources.findIndex(
    (source) => source.project_id === projectId && source.id === sourceId
  );

  if (index === -1) return false;

  mockSources.splice(index, 1);
  return true;
}
