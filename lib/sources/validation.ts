import { z } from "zod";
import { sourceKindSchema, sourceStatusSchema } from "./types";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const baseSourceSchema = z.object({
  id: z.string().optional(),
  kind: sourceKindSchema,
  title: z.string().trim().min(2).max(120),
  publisher: z.string().trim().max(120).nullable().optional(),
  published_at: z
    .string()
    .regex(dateRegex, "Use YYYY-MM-DD format")
    .nullable()
    .optional(),
  meeting_date: z
    .string()
    .regex(dateRegex, "Use YYYY-MM-DD format")
    .nullable()
    .optional(),
  meeting_body: z.string().trim().max(120).nullable().optional(),
  agenda_item: z.string().trim().max(120).nullable().optional(),
  project_ref: z.string().trim().max(80).nullable().optional(),
  tags: z
    .string()
    .or(z.array(z.string()))
    .optional()
    .transform((value) => {
      if (!value) return [];
      const tagsArray = Array.isArray(value) ? value : value.split(",");
      return tagsArray
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, 20)
        .map((tag) => tag.slice(0, 32));
    }),
  notes: z.string().trim().max(2000).nullable().optional(),
  status: sourceStatusSchema.optional(),
});

export const createUrlSourceSchema = baseSourceSchema.extend({
  format: z.literal("url"),
  url: z.string().url(),
});

export const createFileSourceSchema = baseSourceSchema.extend({
  format: z.literal("file"),
  storage_path: z.string().min(1),
  mime_type: z.string().nullable().optional(),
  file_size_bytes: z.number().nullable().optional(),
});

export const createSourceSchema = z.discriminatedUnion("format", [
  createUrlSourceSchema,
  createFileSourceSchema,
]);

const updateBase = baseSourceSchema.partial();

export const updateSourceSchema = updateBase.extend({
  id: z.string().min(1),
  url: z.string().url().optional(),
});

export const listSourcesParamsSchema = z.object({
  q: z.string().trim().optional(),
  kind: sourceKindSchema.or(z.literal("all")).optional(),
  status: sourceStatusSchema.or(z.literal("all")).optional(),
  sort: z
    .enum([
      "updated_desc",
      "created_desc",
      "title_asc",
      "published_desc",
      "meeting_desc",
    ])
    .optional(),
});
