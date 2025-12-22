import { z } from "zod";

export type SourceKind =
  | "council_report"
  | "news"
  | "zoning_map"
  | "bylaw_policy"
  | "staff_report"
  | "minutes_agenda"
  | "market_data"
  | "other";

export type SourceFormat = "url" | "file";

export type SourceStatus = "active" | "archived";

export type SourceIngestionStatus = "not_ingested" | "queued" | "done" | "error";

export type ProjectSource = {
  id: string;
  project_id: string;
  kind: SourceKind;
  format: SourceFormat;
  title: string;
  url: string | null;
  storage_path: string | null;
  mime_type: string | null;
  file_size_bytes: number | null;
  publisher: string | null;
  published_at: string | null;
  meeting_date: string | null;
  meeting_body: string | null;
  agenda_item: string | null;
  project_ref: string | null;
  tags: string[];
  notes: string | null;
  status: SourceStatus;
  ingestion: SourceIngestionStatus;
  created_at: string;
  updated_at: string;
};

export type CreateSourceInput =
  | {
      kind: SourceKind;
      format: "url";
      title: string;
      url: string;
      publisher?: string | null;
      published_at?: string | null;
      meeting_date?: string | null;
      meeting_body?: string | null;
      agenda_item?: string | null;
      project_ref?: string | null;
      tags?: string[];
      notes?: string | null;
    }
  | {
      kind: SourceKind;
      format: "file";
      title: string;
      storage_path: string;
      mime_type?: string | null;
      file_size_bytes?: number | null;
      publisher?: string | null;
      published_at?: string | null;
      meeting_date?: string | null;
      meeting_body?: string | null;
      agenda_item?: string | null;
      project_ref?: string | null;
      tags?: string[];
      notes?: string | null;
    };

export type UpdateSourceInput =
  Partial<
    Omit<ProjectSource, "id" | "project_id" | "created_at" | "updated_at">
  > & {
    id: string;
  };

export type ListSourcesParams = {
  q?: string;
  kind?: SourceKind | "all";
  sort?:
    | "updated_desc"
    | "created_desc"
    | "title_asc"
    | "published_desc"
    | "meeting_desc";
  status?: SourceStatus | "all";
};

export const sourceKindSchema = z.enum([
  "council_report",
  "news",
  "zoning_map",
  "bylaw_policy",
  "staff_report",
  "minutes_agenda",
  "market_data",
  "other",
]);

export const sourceStatusSchema = z.enum(["active", "archived"]);

