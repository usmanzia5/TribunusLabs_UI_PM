import type { ListSourcesParams, ProjectSource } from "./types";
import { listSourcesParamsSchema } from "./validation";
import { getMockSources } from "@/lib/supabase/mock";
// SUPABASE INTEGRATION: Uncomment when ready
// import { createServerClient } from "@/lib/supabase/server";

/**
 * Fetch project sources with search, filter, and sort
 * Currently uses mock data until Supabase is configured
 */
export async function getProjectSources(
  projectId: string,
  params: ListSourcesParams = {}
): Promise<ProjectSource[]> {
  const parsed = listSourcesParamsSchema.safeParse(params);
  const validated = parsed.success ? parsed.data : {};

  // MOCK DATA (temporary)
  return getMockSources(projectId, validated);

  // SUPABASE INTEGRATION: Uncomment when ready
  /*
  const supabase = await createServerClient();

  let query = supabase.from("project_sources").select("*").eq("project_id", projectId);

  if (validated.kind && validated.kind !== "all") {
    query = query.eq("kind", validated.kind);
  }

  if (validated.status && validated.status !== "all") {
    query = query.eq("status", validated.status);
  }

  if (validated.q) {
    const like = `%${validated.q}%`;
    query = query.or(
      [
        `title.ilike.${like}`,
        `publisher.ilike.${like}`,
        `notes.ilike.${like}`,
        `url.ilike.${like}`,
        `project_ref.ilike.${like}`,
      ].join(",")
    );
  }

  const sort = validated.sort || "updated_desc";
  switch (sort) {
    case "created_desc":
      query = query.order("created_at", { ascending: false });
      break;
    case "title_asc":
      query = query.order("title", { ascending: true });
      break;
    case "published_desc":
      query = query.order("published_at", { ascending: false, nullsFirst: false });
      break;
    case "meeting_desc":
      query = query.order("meeting_date", { ascending: false, nullsFirst: false });
      break;
    default:
      query = query.order("updated_at", { ascending: false });
      break;
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching sources", error);
    return [];
  }

  return data || [];
  */
}
