import { notFound } from "next/navigation";
import { getProjectById } from "@/lib/projects/queries";
import { getProjectSources } from "@/lib/sources/queries";
import type { ListSourcesParams } from "@/lib/sources/types";
import { ProjectSourcesToolbar } from "@/components/sources/ProjectSourcesToolbar";
import { ProjectSourcesTable } from "@/components/sources/ProjectSourcesTable";
import { ProjectSourcesEmptyState } from "@/components/sources/ProjectSourcesEmptyState";

interface ProjectSourcesPageProps {
  params: Promise<{
    projectId: string;
  }>;
  searchParams: Promise<{
    q?: string;
    kind?: ListSourcesParams["kind"];
    status?: ListSourcesParams["status"];
    sort?: ListSourcesParams["sort"];
  }>;
}

/**
 * Project sources page (server component)
 * Fetches project basics and source list using URL params for filters.
 */
export default async function ProjectSourcesPage({
  params,
  searchParams,
}: ProjectSourcesPageProps) {
  const { projectId } = await params;
  const queryParams = await searchParams;

  const project = await getProjectById(projectId);

  if (!project) {
    notFound();
  }

  const {
    q = "",
    kind = "all",
    status = "active",
    sort = "updated_desc",
  } = queryParams;

  const sources = await getProjectSources(projectId, {
    q: q || undefined,
    kind,
    status,
    sort,
  });

  const isFiltered =
    !!q || (kind && kind !== "all") || (status && status !== "active");

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 space-y-6">
      <div className="space-y-1">
        <p className="text-sm text-text-2">Project</p>
        <h1 className="text-xl font-semibold text-text">{project.name}</h1>
        <p className="text-sm text-text-2">
          Data sources library for project context.
        </p>
      </div>

      <ProjectSourcesToolbar
        projectId={projectId}
        query={{ q, kind, status, sort }}
      />

      {sources.length === 0 ? (
        <ProjectSourcesEmptyState isFiltered={isFiltered} />
      ) : (
        <ProjectSourcesTable sources={sources} />
      )}
    </div>
  );
}
