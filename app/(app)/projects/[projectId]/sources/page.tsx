import { ProjectSourcesClient } from "@/components/sources/ProjectSourcesClient";
import { getProjectById } from "@/lib/projects/queries";
import { getProjectSources } from "@/lib/sources/queries";

interface ProjectSourcesPageProps {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{
    q?: string;
    kind?: string;
    status?: string;
    sort?:
      | "updated_desc"
      | "created_desc"
      | "title_asc"
      | "published_desc"
      | "meeting_desc";
  }>;
}

export default async function ProjectSourcesPage({
  params,
  searchParams,
}: ProjectSourcesPageProps) {
  const { projectId } = await params;
  const query = await searchParams;

  const project = await getProjectById(projectId);
  const sources = await getProjectSources(projectId, {
    q: query.q,
    kind: (query.kind as any) || "all",
    status: (query.status as any) || "active",
    sort: query.sort || "updated_desc",
  });

  return (
    <ProjectSourcesClient
      projectId={projectId}
      project={project}
      sources={sources}
    />
  );
}
