import type { ListSourcesParams, ProjectSource } from "./types";

// Temporary in-memory mock data until Supabase integration is ready
const mockSources: ProjectSource[] = [
  {
    id: "src-1",
    project_id: "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
    kind: "council_report",
    format: "url",
    title: "Council Minutes - Downtown Office",
    url: "https://city.example.com/council/downtown-office",
    storage_path: null,
    mime_type: null,
    file_size_bytes: null,
    publisher: "City of San Francisco",
    published_at: "2024-04-15",
    meeting_date: "2024-04-10",
    meeting_body: "Regular Council",
    agenda_item: "Item 7.2",
    project_ref: "PROJ-104",
    tags: ["council", "minutes", "zoning"],
    notes: "Variance discussion and traffic mitigation follow-ups.",
    status: "active",
    ingestion: "not_ingested",
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "src-2",
    project_id: "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
    kind: "news",
    format: "url",
    title: "Local paper covers downtown redevelopment",
    url: "https://news.example.com/story/downtown-office",
    storage_path: null,
    mime_type: null,
    file_size_bytes: null,
    publisher: "Bay Times",
    published_at: "2024-03-28",
    meeting_date: null,
    meeting_body: null,
    agenda_item: null,
    project_ref: "PROJ-104",
    tags: ["press", "community"],
    notes: "Highlights community response to the proposed height increase.",
    status: "active",
    ingestion: "not_ingested",
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "src-3",
    project_id: "2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q",
    kind: "zoning_map",
    format: "file",
    title: "Riverfront zoning layer",
    url: null,
    storage_path: "project-sources/2b3c4d5e/zoning.pdf",
    mime_type: "application/pdf",
    file_size_bytes: 234567,
    publisher: "City GIS",
    published_at: null,
    meeting_date: null,
    meeting_body: null,
    agenda_item: null,
    project_ref: "PROJ-220",
    tags: ["zoning", "maps"],
    notes: "Latest GIS export from planning department.",
    status: "archived",
    ingestion: "not_ingested",
    created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "src-4",
    project_id: "3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r",
    kind: "bylaw_policy",
    format: "url",
    title: "Policy bulletin: sustainability requirements",
    url: "https://city.example.com/policies/sustainability",
    storage_path: null,
    mime_type: null,
    file_size_bytes: null,
    publisher: "Planning Department",
    published_at: "2023-11-02",
    meeting_date: null,
    meeting_body: null,
    agenda_item: null,
    project_ref: "POL-18-2023",
    tags: ["policy", "sustainability"],
    notes: null,
    status: "active",
    ingestion: "not_ingested",
    created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

function delay(ms: number = 50) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeDate(value: string | null): number | null {
  if (!value) return null;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

/**
 * Fetch project sources with search, filtering, and sorting.
 * Currently uses in-memory mock data until Supabase is wired up.
 */
export async function getProjectSources(
  projectId: string,
  params: ListSourcesParams = {}
): Promise<ProjectSource[]> {
  await delay();

  const {
    q,
    kind = "all",
    status = "active",
    sort = "updated_desc",
  } = params;

  let results = mockSources.filter((source) => source.project_id === projectId);

  if (q) {
    const query = q.toLowerCase();
    results = results.filter((source) =>
      [
        source.title,
        source.publisher,
        source.notes,
        source.url,
        source.project_ref,
      ].some((field) => field?.toLowerCase().includes(query))
    );
  }

  if (kind && kind !== "all") {
    results = results.filter((source) => source.kind === kind);
  }

  if (status && status !== "all") {
    results = results.filter((source) => source.status === status);
  }

  results.sort((a, b) => {
    switch (sort) {
      case "created_desc":
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case "title_asc":
        return a.title.localeCompare(b.title);
      case "published_desc": {
        const aDate = normalizeDate(a.published_at);
        const bDate = normalizeDate(b.published_at);
        if (aDate === bDate) return 0;
        if (aDate === null) return 1;
        if (bDate === null) return -1;
        return bDate - aDate;
      }
      case "meeting_desc": {
        const aDate = normalizeDate(a.meeting_date);
        const bDate = normalizeDate(b.meeting_date);
        if (aDate === bDate) return 0;
        if (aDate === null) return 1;
        if (bDate === null) return -1;
        return bDate - aDate;
      }
      case "updated_desc":
      default:
        return (
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
    }
  });

  return results;
}
