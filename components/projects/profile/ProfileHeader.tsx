"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileHeaderProps {
  projectId: string;
  projectName: string;
  isDirty: boolean;
  isPending: boolean;
  onUpdate: () => void;
  onCancel: () => void;
}

/**
 * Profile page header with breadcrumb and action buttons
 */
export function ProfileHeader({
  projectId,
  projectName,
  isDirty,
  isPending,
  onUpdate,
  onCancel,
}: ProfileHeaderProps) {
  return (
    <div className="flex items-center justify-between pb-4 border-b border-border">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link
          href="/projects"
          className="text-text-3 hover:text-text transition-colors"
        >
          Projects
        </Link>
        <ChevronRight className="w-4 h-4 text-text-3" />
        <span className="text-text font-medium">{projectName}</span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button asChild variant="outline" className="rounded-sm">
          <Link href={`/projects/${projectId}/sources`}>Data Sources</Link>
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={!isDirty || isPending}>
          Cancel
        </Button>
        <Button onClick={onUpdate} disabled={!isDirty || isPending}>
          {isPending ? "Saving..." : "Update"}
        </Button>
      </div>
    </div>
  );
}
