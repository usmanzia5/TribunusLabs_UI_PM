import { FilePlus2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProjectSourcesEmptyStateProps {
  statusFilter: "active" | "archived" | "all";
  onAddSource: () => void;
}

export function ProjectSourcesEmptyState({
  statusFilter,
  onAddSource,
}: ProjectSourcesEmptyStateProps) {
  const headline =
    statusFilter === "archived"
      ? "No archived sources"
      : "No sources yet";

  const subhead =
    statusFilter === "archived"
      ? "Unarchive a source from the Active view to see it here."
      : "Add council reports, news, maps, or policies to build project context.";

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-border bg-white px-6 py-12 text-center shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-text-2">
        <FilePlus2 className="h-6 w-6" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-text">{headline}</h3>
        <p className="text-sm text-text-3">{subhead}</p>
      </div>
      {statusFilter !== "archived" && (
        <Button
          onClick={onAddSource}
          className="bg-accent text-white hover:bg-accent-hover"
        >
          Add Source
        </Button>
      )}
    </div>
  );
}
