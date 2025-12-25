import {
  type CreateSourceInput,
  type ListSourcesParams,
  type ProjectSource,
  type UpdateSourceInput,
} from "./types";
import { sanitizeListParams } from "./validation";

type MockSource = ProjectSource;

const now = () => new Date().toISOString();

const mockSources: MockSource[] = [
  {
    id: "src-1",
    project_id: "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
    kind: "council_report",
    format: "url",
    title: "Council Minutes - April",
    url: "https://city.example.com/council/minutes-april",
    storage_path: null,
    mime_type: null,
    file_size_bytes: null,
    publisher: "City of Coquitlam",
    published_at: "2024-04-18",
    meeting_date: "2024-04-20",
    meeting_body: "Regular Council",
    agenda_item: "4.2 - Rezoning Application",
    project_ref: "PROJ-21065",
    tags: ["council", "minutes"],
    notes: "Key discussion on parking ratios.",
    status: "active",
    ingestion: "queued",
    created_at: now(),
    updated_at: now(),
  },
  {
    id: "src-2",
    project_id: "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
    kind: "news",
    format: "url",
    title: "Local paper covers project",
    url: "https://news.example.com/story",
    storage_path: null,
    mime_type: null,
    file_size_bytes: null,
    publisher: "Tri-City News",
    published_at: "2024-03-02",
    meeting_date: null,
    meeting_body: null,
    agenda_item: null,
    project_ref: null,
    tags: ["press"],
    notes: "Good summary for stakeholders.",
    status: "archived",
    ingestion: "done",
    created_at: now(),
    updated_at: now(),
  },
  {
    id: "src-3",
    project_id: "2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q",
    kind: "other",
    format: "file",
    title: "Traffic impact study",
    url: null,
    storage_path: "mock/traffic-study.pdf",
    mime_type: "application/pdf",
    file_size_bytes: 1500000,
    publisher: "ACME Engineering",
    published_at: null,
    meeting_date: null,
    meeting_body: null,
    agenda_item: null,
    project_ref: null,
    tags: ["traffic"],
    notes: "Preliminary findings only.",
    status: "active",
    ingestion: "not_ingested",
    created_at: now(),
    updated_at: now(),
  },
];

const delay = async (ms = 50) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const compare = (a: string | null, b: string | null) => {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return new Date(b).getTime() - new Date(a).getTime();
};

export async function getMockSources(
  projectId: string,
  params: ListSourcesParams
): Promise<ProjectSource[]> {
  await delay();

  const { q, kind, status, sort } = sanitizeListParams(params);

  let result = mockSources.filter((source) => source.project_id === projectId);

  if (kind && kind !== "all") {
    result = result.filter((source) => source.kind === kind);
  }

  if (status && status !== "all") {
    result = result.filter((source) => source.status === status);
  }

  if (q) {
    const query = q.toLowerCase();
    result = result.filter((source) =>
      [
        source.title,
        source.publisher,
        source.notes,
        source.url,
        source.project_ref,
      ]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(query))
    );
  }

  result.sort((a, b) => {
    switch (sort) {
      case "created_desc":
        return (
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
        );
      case "title_asc":
        return a.title.localeCompare(b.title);
      case "published_desc":
        return compare(b.published_at, a.published_at);
      case "meeting_desc":
        return compare(b.meeting_date, a.meeting_date);
      case "updated_desc":
      default:
        return (
          new Date(b.updated_at).getTime() -
          new Date(a.updated_at).getTime()
        );
    }
  });

  return [...result];
}

export async function createMockSource(
  projectId: string,
  input: CreateSourceInput
): Promise<ProjectSource> {
  await delay();

  const id = `src-${crypto.randomUUID()}`;
  const base = {
    id,
    project_id: projectId,
    kind: input.kind,
    format: input.format,
    title: input.title,
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
    created_at: now(),
    updated_at: now(),
  };

  const source: ProjectSource =
    input.format === "url"
      ? {
          ...base,
          url: input.url,
          storage_path: null,
          mime_type: null,
          file_size_bytes: null,
        }
      : {
          ...base,
          url: null,
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
    (source) => source.id === input.id && source.project_id === projectId
  );

  if (index === -1) return null;

  const current = mockSources[index];
  const updated: ProjectSource = { ...current };

  (Object.keys(input) as (keyof UpdateSourceInput)[]).forEach((key) => {
    const value = input[key];
    if (value !== undefined) {
      (updated as Record<string, unknown>)[key] = value as unknown;
    }
  });

  updated.tags = input.tags ?? current.tags;
  updated.updated_at = now();

  mockSources[index] = updated;

  return mockSources[index];
}

export async function deleteMockSource(
  projectId: string,
  sourceId: string
): Promise<boolean> {
  await delay();

  const index = mockSources.findIndex(
    (source) => source.id === sourceId && source.project_id === projectId
  );

  if (index === -1) return false;

  mockSources.splice(index, 1);
  return true;
}
