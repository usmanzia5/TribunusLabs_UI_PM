import { FileQuestion, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

interface ProjectSourcesEmptyStateProps {
  isFiltered?: boolean;
  onAddSourceClick?: () => void;
}

/**
 * Empty state for project sources.
 * Shows different messaging for filter results vs. brand new library.
 */
export function ProjectSourcesEmptyState({
  isFiltered = false,
  onAddSourceClick,
}: ProjectSourcesEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 bg-surface rounded-md border border-border">
      <div
        className={cn(
          "w-16 h-16 rounded-md mb-4",
          "bg-surface-2 flex items-center justify-center"
        )}
      >
        <FileQuestion className="w-8 h-8 text-text-3" />
      </div>

      {isFiltered ? (
        <>
          <h3 className="text-base font-semibold text-text mb-1">
            No sources match these filters
          </h3>
          <p className="text-sm text-text-2 mb-4 text-center max-w-sm">
            Try adjusting your search, type, or status filters to see more results.
          </p>
        </>
      ) : (
        <>
          <h3 className="text-base font-semibold text-text mb-1">
            No sources yet
          </h3>
          <p className="text-sm text-text-2 mb-4 text-center max-w-sm">
            Add council reports, news links, zoning maps, or policy documents to build
            project context.
          </p>
          <Button
            onClick={onAddSourceClick}
            disabled={!onAddSourceClick}
            className={cn(
              "bg-accent hover:bg-accent-hover text-white",
              "rounded-sm px-4 h-10"
            )}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Source
          </Button>
        </>
      )}
    </div>
  );
}
