"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, Plus, Search } from "lucide-react";
import type { ListSourcesParams } from "@/lib/sources/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/cn";

interface ProjectSourcesToolbarProps {
  projectId: string;
  query: {
    q?: string;
    kind?: ListSourcesParams["kind"];
    status?: ListSourcesParams["status"];
    sort?: ListSourcesParams["sort"];
  };
  onAddSourceClick?: () => void;
}

const kindOptions: { value: NonNullable<ListSourcesParams["kind"]>; label: string }[] =
  [
    { value: "all", label: "All types" },
    { value: "council_report", label: "Council reports" },
    { value: "news", label: "News" },
    { value: "zoning_map", label: "Zoning maps" },
    { value: "bylaw_policy", label: "Bylaw / policy" },
    { value: "staff_report", label: "Staff reports" },
    { value: "minutes_agenda", label: "Minutes & agenda" },
    { value: "market_data", label: "Market data" },
    { value: "other", label: "Other" },
  ];

const statusOptions: {
  value: NonNullable<ListSourcesParams["status"]>;
  label: string;
}[] = [
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
  { value: "all", label: "All statuses" },
];

const sortOptions: {
  value: NonNullable<ListSourcesParams["sort"]>;
  label: string;
}[] = [
  { value: "updated_desc", label: "Last updated" },
  { value: "created_desc", label: "Date added" },
  { value: "title_asc", label: "Title (A-Z)" },
  { value: "published_desc", label: "Published date" },
  { value: "meeting_desc", label: "Meeting date" },
];

/**
 * Toolbar for project sources page with search, filters, and sort.
 * State is stored in URL params for shareable links.
 */
export function ProjectSourcesToolbar({
  projectId,
  query,
  onAddSourceClick,
}: ProjectSourcesToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("q") || query.q || "";
  const currentKind =
    (searchParams.get("kind") as ListSourcesParams["kind"] | null) ||
    query.kind ||
    "all";
  const currentStatus =
    (searchParams.get("status") as ListSourcesParams["status"] | null) ||
    query.status ||
    "active";
  const currentSort =
    (searchParams.get("sort") as ListSourcesParams["sort"] | null) ||
    query.sort ||
    "updated_desc";

  const [searchValue, setSearchValue] = useState(currentSearch);

  useEffect(() => {
    setSearchValue(currentSearch);
  }, [currentSearch]);

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }

      const queryString = params.toString();
      const nextPath = queryString
        ? `/projects/${projectId}/sources?${queryString}`
        : `/projects/${projectId}/sources`;

      router.replace(nextPath, { scroll: false });
    },
    [projectId, router, searchParams]
  );

  // Debounce search changes
  useEffect(() => {
    const timer = setTimeout(() => {
      updateParam("q", searchValue || null);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, updateParam]);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3",
        "px-6 py-4 border border-border rounded-md",
        "bg-surface"
      )}
    >
      <div className="relative flex-1 min-w-[240px] max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" />
        <Input
          type="search"
          value={searchValue}
          placeholder="Search sources..."
          onChange={(event) => setSearchValue(event.target.value)}
          className={cn(
            "pl-10 h-10",
            "bg-surface-2 border-border",
            "rounded-sm",
            "focus-visible:ring-2 focus-visible:ring-accent-border focus-visible:border-accent"
          )}
        />
      </div>

      <Select value={currentKind} onValueChange={(value) => updateParam("kind", value)}>
        <SelectTrigger className="w-[180px] h-10 bg-surface-2 border-border rounded-sm">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          {kindOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentStatus}
        onValueChange={(value) => updateParam("status", value)}
      >
        <SelectTrigger className="w-[160px] h-10 bg-surface-2 border-border rounded-sm">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={currentSort} onValueChange={(value) => updateParam("sort", value)}>
        <SelectTrigger className="w-[180px] h-10 bg-surface-2 border-border rounded-sm">
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex-1"></div>

      <Button
        onClick={() => onAddSourceClick?.()}
        disabled={!onAddSourceClick}
        className={cn(
          "bg-accent hover:bg-accent-hover text-white",
          "rounded-sm px-4 h-10"
        )}
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Source
      </Button>

      <div className="flex items-center gap-1 text-sm text-text-3">
        <Filter className="w-4 h-4" />
        <span>Filters persist in the URL</span>
      </div>
    </div>
  );
}
