"use client";

import { useState } from "react";
import type { Project } from "@/lib/projects/types";
import type { ProjectSource } from "@/lib/sources/types";
import { ProjectSourcesToolbar } from "./ProjectSourcesToolbar";
import { AddSourceDialog } from "./AddSourceDialog";
import { ProjectSourcesTable } from "./ProjectSourcesTable";
import { EditSourceDialog } from "./EditSourceDialog";

interface ProjectSourcesClientProps {
  projectId: string;
  project: Project | null;
  sources: ProjectSource[];
}

export function ProjectSourcesClient({
  projectId,
  project,
  sources,
}: ProjectSourcesClientProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [activeSource, setActiveSource] = useState<ProjectSource | null>(null);

  const handleEdit = (source: ProjectSource) => {
    setActiveSource(source);
    setEditOpen(true);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-6 pb-4 space-y-1">
        <p className="text-sm text-text-2">
          {project ? project.name : "Project"} · Data Sources
        </p>
        <h1 className="text-xl font-semibold text-text">Project Library</h1>
      </div>

      <ProjectSourcesToolbar
        projectId={projectId}
        onAddClick={() => setAddOpen(true)}
      />

      <ProjectSourcesTable
        sources={sources}
        onAddClick={() => setAddOpen(true)}
        onEditClick={handleEdit}
      />

      <AddSourceDialog
        projectId={projectId}
        open={addOpen}
        onOpenChange={setAddOpen}
      />

      {activeSource && (
        <EditSourceDialog
          projectId={projectId}
          source={activeSource}
          open={editOpen}
          onOpenChange={setEditOpen}
          onClose={() => setActiveSource(null)}
        />
      )}
    </div>
  );
}
