"use client";

import { format, formatDistanceToNow } from "date-fns";
import { Link2, FileText, Clock, Tag } from "lucide-react";
import type { ProjectSource } from "@/lib/sources/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { SourceActionsMenu } from "./SourceActionsMenu";

interface ProjectSourcesTableProps {
  sources: ProjectSource[];
  onAddClick: () => void;
  onEditClick: (source: ProjectSource) => void;
}

const KIND_LABELS: Record<ProjectSource["kind"], string> = {
  council_report: "Council report",
  news: "News",
  zoning_map: "Zoning map",
  bylaw_policy: "Bylaw / policy",
  staff_report: "Staff report",
  minutes_agenda: "Minutes / agenda",
  market_data: "Market data",
  other: "Other",
};

function getHostname(url: string | null) {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function getKeyDate(source: ProjectSource) {
  if (source.meeting_date) return source.meeting_date;
  if (source.published_at) return source.published_at;
  return null;
}

function formatDate(dateString: string | null) {
  if (!dateString) return "—";
  try {
    return format(new Date(dateString), "LLL d, yyyy");
  } catch {
    return "—";
  }
}

export function ProjectSourcesTable({
  sources,
  onAddClick,
  onEditClick,
}: ProjectSourcesTableProps) {
  if (!sources.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="w-14 h-14 rounded-md bg-surface-2 flex items-center justify-center mb-4">
          <Tag className="w-7 h-7 text-text-3" />
        </div>
        <h3 className="text-base font-semibold text-text mb-1">
          No sources yet
        </h3>
        <p className="text-sm text-text-2 mb-4 max-w-sm">
          Add council reports, news, maps, or policies to build project context.
        </p>
        <Button
          onClick={onAddClick}
          className="rounded-sm bg-accent hover:bg-accent-hover text-white"
        >
          Add Source
        </Button>
      </div>
    );
  }

  const handleRowOpen = (source: ProjectSource) => {
    const target = source.url || source.storage_path;
    if (target) {
      window.open(target, "_blank");
    }
  };

  return (
    <div className="p-6">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-text-2 font-medium w-[160px]">
              Type
            </TableHead>
            <TableHead className="text-text-2 font-medium">Title</TableHead>
            <TableHead className="text-text-2 font-medium w-[160px]">
              Key date
            </TableHead>
            <TableHead className="text-text-2 font-medium w-[180px]">
              Added / Updated
            </TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sources.map((source) => {
            const hostname = getHostname(source.url);
            const keyDate = getKeyDate(source);
            const visibleTags = source.tags.slice(0, 3);
            const overflow = source.tags.length - visibleTags.length;

            return (
              <TableRow
                key={source.id}
                className={cn(
                  "group border-border",
                  "hover:bg-surface-2 cursor-pointer",
                  "transition-colors duration-150"
                )}
                onClick={() => handleRowOpen(source)}
              >
                <TableCell className="align-middle">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-9 h-9 rounded-md flex items-center justify-center",
                        "bg-surface-2"
                      )}
                    >
                      {source.format === "url" ? (
                        <Link2 className="w-4 h-4 text-text-2" />
                      ) : (
                        <FileText className="w-4 h-4 text-text-2" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-text">
                        {KIND_LABELS[source.kind]}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant="outline"
                          className="text-xs rounded-full border-border text-text-2"
                        >
                          {source.format === "url" ? "URL" : "File"}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-xs rounded-full border-border text-text-2"
                        >
                          Not ingested
                        </Badge>
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="align-middle">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-text">
                      {source.title}
                    </p>
                    <p className="text-xs text-text-2 flex flex-wrap gap-2">
                      {source.publisher && (
                        <span>{source.publisher}</span>
                      )}
                      {source.project_ref && (
                        <span className="text-text-3">· {source.project_ref}</span>
                      )}
                      {hostname && (
                        <span className="text-text-3">· {hostname}</span>
                      )}
                    </p>
                    {source.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {visibleTags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[11px] px-2 py-1 rounded-full bg-surface-2 text-text-2"
                          >
                            {tag}
                          </span>
                        ))}
                        {overflow > 0 && (
                          <span className="text-[11px] px-2 py-1 rounded-full bg-surface-2 text-text-2">
                            +{overflow}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </TableCell>

                <TableCell className="align-middle text-sm text-text-2">
                  {keyDate ? (
                    <div className="space-y-1">
                      <p>{formatDate(keyDate)}</p>
                      <p className="text-xs text-text-3">
                        {source.meeting_date
                          ? "Meeting date"
                          : "Published date"}
                      </p>
                    </div>
                  ) : (
                    "—"
                  )}
                </TableCell>

                <TableCell className="align-middle text-sm text-text-2">
                  <div className="space-y-1">
                    <p>Added {formatDate(source.created_at)}</p>
                    <p className="flex items-center gap-1 text-xs text-text-3">
                      <Clock className="w-3 h-3" />
                      Updated{" "}
                      {formatDistanceToNow(new Date(source.updated_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </TableCell>

                <TableCell
                  className="align-middle"
                  onClick={(e) => e.stopPropagation()}
                >
                  <SourceActionsMenu
                    projectId={source.project_id}
                    source={source}
                    onEdit={(s) => onEditClick(s)}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
