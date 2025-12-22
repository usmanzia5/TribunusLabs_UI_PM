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

import { ProjectProfile, ProjectProfileData } from "@/lib/projects/profile-types";
import { createDefaultProfile } from "@/lib/projects/profile-defaults";
import type {
  CreateSourceInput,
  ListSourcesParams,
  ProjectSource,
  UpdateSourceInput,
} from "@/lib/sources/types";

// In-memory profile storage (Map for O(1) lookup)
let mockProfiles: Map<string, ProjectProfile> = new Map();

let mockSources: ProjectSource[] = [
  {
    id: "source-1",
    project_id: "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
    kind: "council_report",
    format: "url",
    title: "Public Hearing Minutes - June 2024",
    url: "https://example.com/council/minutes-june-2024",
    storage_path: null,
    mime_type: null,
    file_size_bytes: null,
    publisher: "City of Vancouver",
    published_at: "2024-06-12",
    meeting_date: "2024-06-10",
    meeting_body: "Public Hearing",
    agenda_item: "PH1 - Rezoning Application",
    project_ref: "PROJ-21-065",
    tags: ["council", "minutes"],
    notes: "Key decision on height limits.",
    status: "active",
    ingestion: "not_ingested",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "source-2",
    project_id: "2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q",
    kind: "news",
    format: "file",
    title: "Business Journal Article",
    url: null,
    storage_path: "2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q/source-2/article.pdf",
    mime_type: "application/pdf",
    file_size_bytes: 2400000,
    publisher: "Portland Business Journal",
    published_at: "2024-03-01",
    meeting_date: null,
    meeting_body: null,
    agenda_item: null,
    project_ref: null,
    tags: ["news", "market"],
    notes: null,
    status: "active",
    ingestion: "not_ingested",
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

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

function matchesQuery(text: string | null, query: string) {
  return text?.toLowerCase().includes(query.toLowerCase());
}

export async function getMockSources(
  projectId: string,
  params: ListSourcesParams = {}
): Promise<ProjectSource[]> {
  await delay();

  const { q, kind = "all", sort = "updated_desc", status = "active" } = params;

  let results = mockSources.filter((s) => s.project_id === projectId);

  if (status !== "all") {
    results = results.filter((s) => s.status === status);
  }

  if (kind !== "all") {
    results = results.filter((s) => s.kind === kind);
  }

  if (q) {
    results = results.filter(
      (s) =>
        matchesQuery(s.title, q) ||
        matchesQuery(s.publisher, q) ||
        matchesQuery(s.notes, q) ||
        matchesQuery(s.url, q) ||
        matchesQuery(s.project_ref, q)
    );
  }

  results = [...results].sort((a, b) => {
    switch (sort) {
      case "created_desc":
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case "title_asc":
        return a.title.localeCompare(b.title);
      case "published_desc":
        return (
          new Date(b.published_at || 0).getTime() -
          new Date(a.published_at || 0).getTime()
        );
      case "meeting_desc":
        return (
          new Date(b.meeting_date || 0).getTime() -
          new Date(a.meeting_date || 0).getTime()
        );
      default:
        return (
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
    }
  });

  return results;
}

export async function createMockSource(
  projectId: string,
  input: CreateSourceInput
): Promise<ProjectSource> {
  await delay();

  const now = new Date().toISOString();
  const id = generateId();

  const baseFields = {
    id,
    project_id: projectId,
    url: null,
    storage_path: null,
    mime_type: null,
    file_size_bytes: null,
    publisher: input.publisher || null,
    published_at: input.published_at || null,
    meeting_date: input.meeting_date || null,
    meeting_body: input.meeting_body || null,
    agenda_item: input.agenda_item || null,
    project_ref: input.project_ref || null,
    tags: input.tags || [],
    notes: input.notes || null,
    status: "active" as const,
    ingestion: "not_ingested" as const,
    created_at: now,
    updated_at: now,
  };

  const source: ProjectSource =
    input.format === "url"
      ? {
          ...baseFields,
          kind: input.kind,
          format: "url",
          title: input.title,
          url: input.url,
        }
      : {
          ...baseFields,
          kind: input.kind,
          format: "file",
          title: input.title,
          storage_path: input.storage_path,
          mime_type: input.mime_type || null,
          file_size_bytes: input.file_size_bytes || null,
        };

  mockSources.unshift(source);
  return source;
}

export async function updateMockSource(
  projectId: string,
  input: UpdateSourceInput
): Promise<ProjectSource | null> {
  await delay();

  const index = mockSources.findIndex(
    (s) => s.project_id === projectId && s.id === input.id
  );
  if (index === -1) return null;

  mockSources[index] = {
    ...mockSources[index],
    ...input,
    tags: input.tags ?? mockSources[index].tags,
    updated_at: new Date().toISOString(),
  };

  return mockSources[index];
}

export async function deleteMockSource(
  projectId: string,
  sourceId: string
): Promise<boolean> {
  await delay();

  const index = mockSources.findIndex(
    (s) => s.project_id === projectId && s.id === sourceId
  );
  if (index === -1) return false;

  mockSources.splice(index, 1);
  return true;
}
