import { z } from "zod";
import type { ListSourcesParams, SourceKind } from "./types";

const kindValues: readonly [SourceKind, ...SourceKind[]] = [
  "council_report",
  "news",
  "zoning_map",
  "bylaw_policy",
  "staff_report",
  "minutes_agenda",
  "market_data",
  "other",
];

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format")
  .nullable()
  .optional();

const tagSchema = z
  .array(z.string().trim().min(1).max(32))
  .max(20)
  .default([]);

const baseSourceSchema = z.object({
  kind: z.enum(kindValues),
  title: z.string().trim().min(2).max(120),
  publisher: z.string().trim().max(120).nullable().optional(),
  published_at: dateSchema,
  meeting_date: dateSchema,
  meeting_body: z.string().trim().max(120).nullable().optional(),
  agenda_item: z.string().trim().max(120).nullable().optional(),
  project_ref: z.string().trim().max(120).nullable().optional(),
  tags: tagSchema,
  notes: z.string().trim().max(2000).nullable().optional(),
  status: z.enum(["active", "archived"]).optional(),
  ingestion: z
    .enum(["not_ingested", "queued", "done", "error"])
    .optional(),
});

export const createSourceSchema = z.discriminatedUnion("format", [
  z
    .object({
      format: z.literal("url"),
      url: z.string().url("Enter a valid URL"),
    })
    .merge(baseSourceSchema),
  z
    .object({
      format: z.literal("file"),
      storage_path: z.string().min(1, "File path is required"),
      mime_type: z.string().trim().max(200).nullable().optional(),
      file_size_bytes: z.number().int().positive().nullable().optional(),
    })
    .merge(baseSourceSchema),
]);

export const updateSourceSchema = z
  .object({
    id: z.string().min(1, "Source ID is required"),
  })
  .merge(
    baseSourceSchema
      .partial()
      .extend({
        url: z.string().url("Enter a valid URL").nullable().optional(),
        storage_path: z.string().min(1).nullable().optional(),
        file_size_bytes: z.number().int().positive().nullable().optional(),
        mime_type: z.string().trim().max(200).nullable().optional(),
      })
      .partial()
  );

export function parseTags(input?: string): string[] {
  if (!input) return [];
  const tags = input
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  return Array.from(new Set(tags)).slice(0, 20);
}

export function sanitizeListParams(
  params: Partial<ListSourcesParams>
): ListSourcesParams {
  const allowedSorts: ListSourcesParams["sort"][] = [
    "updated_desc",
    "created_desc",
    "title_asc",
    "published_desc",
    "meeting_desc",
  ];

  const kind = kindValues.includes(params.kind as SourceKind)
    ? (params.kind as ListSourcesParams["kind"])
    : "all";

  const status: ListSourcesParams["status"] =
    params.status === "archived" || params.status === "all"
      ? params.status
      : "active";

  const sort = allowedSorts.includes(params.sort as ListSourcesParams["sort"])
    ? (params.sort as ListSourcesParams["sort"])
    : "updated_desc";

  return {
    q: params.q || undefined,
    kind,
    status,
    sort,
  };
}
