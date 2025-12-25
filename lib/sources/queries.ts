import type { ListSourcesParams, ProjectSource } from "./types";
import { sanitizeListParams } from "./validation";
import { getMockSources } from "./mock";
// SUPABASE INTEGRATION: Uncomment when ready
// import { createServerClient } from "@/lib/supabase/server";

export async function getProjectSources(
  projectId: string,
  params: Partial<ListSourcesParams> = {}
): Promise<ProjectSource[]> {
  const cleanParams = sanitizeListParams(params);

  // MOCK DATA (temporary)
  return getMockSources(projectId, cleanParams);

  // SUPABASE INTEGRATION: Uncomment when ready
  /*
  const supabase = await createServerClient();

  let query = supabase
    .from("project_sources")
    .select("*")
    .eq("project_id", projectId);

  if (cleanParams.kind && cleanParams.kind !== "all") {
    query = query.eq("kind", cleanParams.kind);
  }

  if (cleanParams.status && cleanParams.status !== "all") {
    query = query.eq("status", cleanParams.status);
  }

  if (cleanParams.q) {
    const q = cleanParams.q;
    query = query.or(
      `title.ilike.%${q}%,publisher.ilike.%${q}%,notes.ilike.%${q}%,url.ilike.%${q}%,project_ref.ilike.%${q}%`
    );
  }

  switch (cleanParams.sort) {
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
    case "updated_desc":
    default:
      query = query.order("updated_at", { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching sources:", error);
    return [];
  }

  return data || [];
  */
}
