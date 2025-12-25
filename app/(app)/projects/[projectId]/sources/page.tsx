import { notFound } from "next/navigation";
import { getProjectById } from "@/lib/projects/queries";
import { getProjectSources } from "@/lib/sources/queries";
import type { ListSourcesParams } from "@/lib/sources/types";
import { ProjectSourcesClient } from "@/components/sources/ProjectSourcesClient";

interface ProjectSourcesPageProps {
  params: Promise<{
    projectId: string;
  }>;
  searchParams: Promise<Partial<ListSourcesParams>>;
}

export default async function ProjectSourcesPage({
  params,
  searchParams,
}: ProjectSourcesPageProps) {
  const { projectId } = await params;
  const filters = await searchParams;

  const project = await getProjectById(projectId);

  if (!project) {
    notFound();
  }

  const parsedParams: ListSourcesParams = {
    q: filters?.q,
    kind: (filters?.kind as ListSourcesParams["kind"]) || "all",
    status: (filters?.status as ListSourcesParams["status"]) || "active",
    sort: (filters?.sort as ListSourcesParams["sort"]) || "updated_desc",
  };

  const sources = await getProjectSources(projectId, parsedParams);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6">
      <ProjectSourcesClient
        project={project}
        sources={sources}
        params={parsedParams}
      />
    </div>
  );
}
