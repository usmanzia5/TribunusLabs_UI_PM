"use client";

import { ExternalLink, Link2, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ProjectSource } from "@/lib/sources/types";
import { cn } from "@/lib/cn";
import { SourceActionsMenu } from "./SourceActionsMenu";

const kindLabels: Record<ProjectSource["kind"], string> = {
  council_report: "Council report",
  news: "News",
  zoning_map: "Zoning map",
  bylaw_policy: "Bylaw / policy",
  staff_report: "Staff report",
  minutes_agenda: "Minutes / agenda",
  market_data: "Market data",
  other: "Other",
};

interface ProjectSourcesTableProps {
  sources: ProjectSource[];
  onEdit: (source: ProjectSource) => void;
  onDelete: (source: ProjectSource) => void;
  onArchiveToggle: (source: ProjectSource) => void;
  pendingId: string | null;
}

function formatKeyDate(source: ProjectSource) {
  if (source.meeting_date) return source.meeting_date;
  if (source.published_at) return source.published_at;
  return "—";
}

function getHostname(url: string | null) {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return null;
  }
}

function StatusBadge({ status }: { status: ProjectSource["status"] }) {
  const styles =
    status === "archived"
      ? "bg-border text-text-2 border-border"
      : "bg-accent-soft text-accent border-accent-border";
  return (
    <Badge className={cn("rounded-full px-2 py-1", styles)}>
      {status === "archived" ? "Archived" : "Active"}
    </Badge>
  );
}

function IngestionBadge({ ingestion }: { ingestion: ProjectSource["ingestion"] }) {
  const tone: Record<ProjectSource["ingestion"], string> = {
    not_ingested: "bg-surface-2 text-text-2 border-border",
    queued: "bg-accent-soft text-accent border-accent-border",
    done: "bg-success/10 text-success border-success/30",
    error: "bg-danger/10 text-danger border-danger/30",
  };
  const labels: Record<ProjectSource["ingestion"], string> = {
    not_ingested: "Not ingested",
    queued: "Queued",
    done: "Complete",
    error: "Error",
  };

  return (
    <Badge className={cn("rounded-full px-2 py-1", tone[ingestion])}>
      {labels[ingestion]}
    </Badge>
  );
}

function FormatBadge({ format }: { format: ProjectSource["format"] }) {
  const Icon = format === "url" ? Link2 : FileText;
  return (
    <Badge className="flex items-center gap-1 rounded-full border-border bg-surface-2 px-2 py-1 text-text-2">
      <Icon className="h-3.5 w-3.5" />
      {format === "url" ? "URL" : "File"}
    </Badge>
  );
}

export function ProjectSourcesTable({
  sources,
  onEdit,
  onDelete,
  onArchiveToggle,
  pendingId,
}: ProjectSourcesTableProps) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="border-border bg-surface-3/60">
            <TableHead className="text-text-2">Title</TableHead>
            <TableHead className="text-text-2">Type</TableHead>
            <TableHead className="text-text-2">Key date</TableHead>
            <TableHead className="text-text-2">Status</TableHead>
            <TableHead className="text-text-2">Ingestion</TableHead>
            <TableHead className="text-right text-text-2">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sources.map((source) => {
            const host = getHostname(source.url);
            const showPending = pendingId === source.id;

            return (
              <TableRow
                key={source.id}
                className="border-border hover:bg-surface-2/60"
              >
                <TableCell>
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-text">{source.title}</p>
                        <FormatBadge format={source.format} />
                        <button
                          type="button"
                          className="text-text-3 hover:text-accent"
                          onClick={() => {
                            if (source.url) {
                              window.open(source.url, "_blank");
                            } else if (source.storage_path) {
                              window.open(source.storage_path, "_blank");
                            }
                          }}
                          aria-label="Open source"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="text-sm text-text-3 flex flex-wrap items-center gap-2">
                        {source.publisher && <span>{source.publisher}</span>}
                        {source.project_ref && (
                          <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs text-text-2">
                            {source.project_ref}
                          </span>
                        )}
                        {host && <span className="text-text-3">{host}</span>}
                      </div>
                      {source.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {source.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-surface-2 px-2 py-1 text-xs text-text-2"
                            >
                              {tag}
                            </span>
                          ))}
                          {source.tags.length > 3 && (
                            <span className="text-xs text-text-3">
                              +{source.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                      {source.notes && (
                        <p className="text-sm text-text-3">{source.notes}</p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-text-2">
                  {kindLabels[source.kind]}
                </TableCell>
                <TableCell className="text-text-2">
                  {formatKeyDate(source)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={source.status} />
                </TableCell>
                <TableCell>
                  <IngestionBadge ingestion={source.ingestion} />
                </TableCell>
                <TableCell className="text-right">
                  <SourceActionsMenu
                    source={source}
                    onEdit={() => onEdit(source)}
                    onDelete={() => onDelete(source)}
                    onArchiveToggle={() => onArchiveToggle(source)}
                    isPending={showPending}
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
