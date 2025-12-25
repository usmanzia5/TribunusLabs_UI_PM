"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Project } from "@/lib/projects/types";
import type { ListSourcesParams, ProjectSource } from "@/lib/sources/types";
import { updateSource, deleteSource } from "@/lib/sources/actions";
import { ProjectSourcesToolbar } from "./ProjectSourcesToolbar";
import { ProjectSourcesTable } from "./ProjectSourcesTable";
import { AddSourceDialog } from "./dialogs/AddSourceDialog";
import { EditSourceDialog } from "./dialogs/EditSourceDialog";
import { DeleteSourceDialog } from "./dialogs/DeleteSourceDialog";
import { ProjectSourcesEmptyState } from "./ProjectSourcesEmptyState";
import { Button } from "@/components/ui/button";

interface ProjectSourcesClientProps {
  project: Project;
  sources: ProjectSource[];
  params: ListSourcesParams;
}

export function ProjectSourcesClient({
  project,
  sources,
  params,
}: ProjectSourcesClientProps) {
  const router = useRouter();
  const [actionError, setActionError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editSource, setEditSource] = useState<ProjectSource | null>(null);
  const [deleteSourceTarget, setDeleteSourceTarget] = useState<ProjectSource | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleRefresh = () => {
    router.refresh();
    setActionError(null);
  };

  const handleArchiveToggle = (source: ProjectSource) => {
    setPendingId(source.id);
    startTransition(async () => {
      const nextStatus = source.status === "archived" ? "active" : "archived";
      const result = await updateSource(project.id, {
        id: source.id,
        status: nextStatus,
      });

      if (result.error) {
        setActionError(result.error);
      } else {
        setActionError(null);
      }

      router.refresh();
      setPendingId(null);
    });
  };

  const handleDelete = (source: ProjectSource) => {
    setPendingId(source.id);
    startTransition(async () => {
      const result = await deleteSource(project.id, source.id);

      if (result.error) {
        setActionError(result.error);
      } else {
        setActionError(null);
      }

      router.refresh();
      setPendingId(null);
      setDeleteSourceTarget(null);
    });
  };

  const hasSources = sources.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-2">Project</p>
          <h1 className="text-xl font-semibold text-text">
            {project.name}
          </h1>
        </div>
        <Button
          variant="outline"
          onClick={() => setAddOpen(true)}
          className="rounded-sm"
        >
          Add Source
        </Button>
      </div>

      {actionError && (
        <div className="rounded-md border border-danger bg-danger/5 px-3 py-2 text-sm text-danger">
          {actionError}
        </div>
      )}

      <ProjectSourcesToolbar
        params={params}
        onAddSource={() => setAddOpen(true)}
      />

      {hasSources ? (
        <ProjectSourcesTable
          sources={sources}
          onEdit={setEditSource}
          onDelete={setDeleteSourceTarget}
          onArchiveToggle={handleArchiveToggle}
          pendingId={pendingId}
        />
      ) : (
        <ProjectSourcesEmptyState
          statusFilter={params.status || "active"}
          onAddSource={() => setAddOpen(true)}
        />
      )}

      <AddSourceDialog
        projectId={project.id}
        open={addOpen}
        onOpenChange={setAddOpen}
        onCreated={handleRefresh}
      />

      <EditSourceDialog
        projectId={project.id}
        source={editSource}
        open={!!editSource}
        onOpenChange={(open) => {
          if (!open) setEditSource(null);
        }}
        onSaved={handleRefresh}
      />

      <DeleteSourceDialog
        source={deleteSourceTarget}
        open={!!deleteSourceTarget}
        onConfirm={() => {
          if (deleteSourceTarget) {
            handleDelete(deleteSourceTarget);
          }
        }}
        onOpenChange={(open) => {
          if (!open) setDeleteSourceTarget(null);
        }}
        isPending={isPending && pendingId === deleteSourceTarget?.id}
      />
    </div>
  );
}
