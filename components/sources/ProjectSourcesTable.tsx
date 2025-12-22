import type { ElementType } from "react";
import { format } from "date-fns";
import {
  CalendarClock,
  FileText,
  Link2,
  Map,
  Newspaper,
  ScrollText,
  Tags,
} from "lucide-react";
import type { ProjectSource, SourceKind } from "@/lib/sources/types";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/cn";

interface ProjectSourcesTableProps {
  sources: ProjectSource[];
}

const kindLabels: Record<SourceKind, { label: string; icon: ElementType }> = {
  council_report: { label: "Council report", icon: ScrollText },
  news: { label: "News", icon: Newspaper },
  zoning_map: { label: "Zoning map", icon: Map },
  bylaw_policy: { label: "Bylaw / policy", icon: FileText },
  staff_report: { label: "Staff report", icon: FileText },
  minutes_agenda: { label: "Minutes / agenda", icon: ScrollText },
  market_data: { label: "Market data", icon: Tags },
  other: { label: "Other", icon: FileText },
};

function formatKeyDate(source: ProjectSource) {
  const keyDate = source.meeting_date || source.published_at;
  if (!keyDate) return "—";

  const parsed = new Date(keyDate);
  return Number.isNaN(parsed.getTime()) ? "—" : format(parsed, "MMM d, yyyy");
}

function formatUpdatedAt(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "—" : format(parsed, "MMM d, yyyy");
}

function getHostname(url: string | null) {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch (error) {
    return null;
  }
}

/**
 * Table view for project sources.
 * Shows type, title, key metadata, and status badges.
 */
export function ProjectSourcesTable({ sources }: ProjectSourcesTableProps) {
  return (
    <div className="border border-border rounded-md bg-surface overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-text-2 font-medium">Type</TableHead>
            <TableHead className="text-text-2 font-medium">Title</TableHead>
            <TableHead className="text-text-2 font-medium">Key date</TableHead>
            <TableHead className="text-text-2 font-medium">Status</TableHead>
            <TableHead className="text-text-2 font-medium">Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sources.map((source) => {
            const kind = kindLabels[source.kind];
            const HostIcon = source.format === "url" ? Link2 : FileText;
            const hostname = getHostname(source.url);
            const tags = source.tags || [];
            const extraCount = tags.length > 3 ? tags.length - 3 : 0;

            return (
              <TableRow
                key={source.id}
                className={cn(
                  "group border-border",
                  "hover:bg-surface-2 transition-colors duration-150"
                )}
              >
                <TableCell>
                  <div className="flex items-center gap-2 text-text">
                    {kind && <kind.icon className="w-4 h-4 text-text-2" />}
                    <span className="text-sm font-medium">{kind?.label}</span>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <HostIcon className="w-4 h-4 text-text-3" />
                    </div>
                    <div className="space-y-2">
                      <div className="text-text font-semibold leading-tight">
                        {source.title}
                      </div>
                      <div className="text-sm text-text-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                        {source.publisher && (
                          <span className="truncate">{source.publisher}</span>
                        )}
                        {source.project_ref && (
                          <span className="text-text-3">•</span>
                        )}
                        {source.project_ref && (
                          <span className="truncate">{source.project_ref}</span>
                        )}
                        {hostname && <span className="text-text-3">•</span>}
                        {hostname && <span className="truncate">{hostname}</span>}
                      </div>
                      {tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                          {tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={`${source.id}-${tag}`}
                              variant="outline"
                              className="bg-surface-2 border-border-strong text-text-2"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {extraCount > 0 && (
                            <Badge
                              variant="secondary"
                              className="bg-accent-soft text-accent border-accent-border"
                            >
                              +{extraCount}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>

                <TableCell className="text-text-2">{formatKeyDate(source)}</TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs",
                        source.format === "url"
                          ? "bg-surface-2 text-text-2 border-border"
                          : "bg-accent-soft text-accent border-accent-border"
                      )}
                    >
                      {source.format === "url" ? "URL" : "File"}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs border-border-strong",
                        source.status === "active"
                          ? "text-success"
                          : "text-text-2"
                      )}
                    >
                      {source.status === "active" ? "Active" : "Archived"}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-xs border-border-strong text-text-2"
                    >
                      Not ingested
                    </Badge>
                  </div>
                </TableCell>

                <TableCell className="text-text-2">
                  <div className="flex items-center gap-2">
                    <CalendarClock className="w-4 h-4 text-text-3" />
                    <span>{formatUpdatedAt(source.updated_at)}</span>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
