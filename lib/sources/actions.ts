/** @format */
"use server";

import { revalidatePath } from "next/cache";
import {
  createSourceSchema,
  updateSourceSchema,
} from "./validation";
import type {
  CreateSourceInput,
  ProjectSource,
  UpdateSourceInput,
} from "./types";
import {
  createMockSource,
  updateMockSource,
  deleteMockSource,
} from "./mock";
// SUPABASE INTEGRATION: Uncomment when ready
// import { createServerClient } from "@/lib/supabase/server";

export async function createSource(
  projectId: string,
  input: CreateSourceInput
): Promise<{ source?: ProjectSource; error?: string }> {
  try {
    const validated = createSourceSchema.parse(input);

    // MOCK DATA (temporary)
    const source = await createMockSource(projectId, validated);

    // SUPABASE INTEGRATION: Uncomment when ready
    /*
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from("project_sources")
      .insert([{ project_id: projectId, ...validated }])
      .select()
      .single();

    if (error) {
      return { error: "Failed to create source" };
    }

    const source = data as ProjectSource;
    */

    revalidatePath(`/projects/${projectId}/sources`);

    return { source };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to create source" };
  }
}

export async function updateSource(
  projectId: string,
  input: UpdateSourceInput
): Promise<{ source?: ProjectSource; error?: string }> {
  try {
    const validated = updateSourceSchema.parse(input);

    // MOCK DATA (temporary)
    const source = await updateMockSource(projectId, validated);

    if (!source) {
      return { error: "Source not found" };
    }

    // SUPABASE INTEGRATION: Uncomment when ready
    /*
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from("project_sources")
      .update(validated)
      .eq("id", validated.id)
      .eq("project_id", projectId)
      .select()
      .single();

    if (error) {
      return { error: "Failed to update source" };
    }

    const source = data as ProjectSource;
    */

    revalidatePath(`/projects/${projectId}/sources`);

    return { source };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to update source" };
  }
}

export async function deleteSource(
  projectId: string,
  sourceId: string
): Promise<{ ok?: true; error?: string }> {
  try {
    // MOCK DATA (temporary)
    const success = await deleteMockSource(projectId, sourceId);

    if (!success) {
      return { error: "Source not found" };
    }

    // SUPABASE INTEGRATION: Uncomment when ready
    /*
    const supabase = await createServerClient();

    const { error } = await supabase
      .from("project_sources")
      .delete()
      .eq("id", sourceId)
      .eq("project_id", projectId);

    if (error) {
      return { error: "Failed to delete source" };
    }
    */

    revalidatePath(`/projects/${projectId}/sources`);

    return { ok: true };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to delete source" };
  }
}
