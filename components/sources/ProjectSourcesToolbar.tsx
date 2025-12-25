"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, Plus } from "lucide-react";
import type { ListSourcesParams } from "@/lib/sources/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/cn";

const kindOptions: { label: string; value: NonNullable<ListSourcesParams["kind"]> }[] = [
  { label: "All types", value: "all" },
  { label: "Council reports", value: "council_report" },
  { label: "News", value: "news" },
  { label: "Zoning maps", value: "zoning_map" },
  { label: "Bylaws & policy", value: "bylaw_policy" },
  { label: "Staff reports", value: "staff_report" },
  { label: "Minutes & agendas", value: "minutes_agenda" },
  { label: "Market data", value: "market_data" },
  { label: "Other", value: "other" },
];

const statusOptions: { label: string; value: NonNullable<ListSourcesParams["status"]> }[] = [
  { label: "Active", value: "active" },
  { label: "Archived", value: "archived" },
  { label: "All statuses", value: "all" },
];

const sortOptions: { label: string; value: NonNullable<ListSourcesParams["sort"]> }[] = [
  { label: "Last updated", value: "updated_desc" },
  { label: "Date created", value: "created_desc" },
  { label: "Title (A-Z)", value: "title_asc" },
  { label: "Published date", value: "published_desc" },
  { label: "Meeting date", value: "meeting_desc" },
];

interface ProjectSourcesToolbarProps {
  params: ListSourcesParams;
  onAddSource: () => void;
}

export function ProjectSourcesToolbar({
  params,
  onAddSource,
}: ProjectSourcesToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [searchValue, setSearchValue] = useState(params.q || "");

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const current = new URLSearchParams(searchParams.toString());

      if (value) {
        current.set(key, value);
      } else {
        current.delete(key);
      }

      const query = current.toString();
      const nextUrl = query ? `${pathname}?${query}` : pathname;
      router.replace(nextUrl, { scroll: false });
    },
    [router, searchParams, pathname]
  );

  useEffect(() => {
    setSearchValue(params.q || "");
  }, [params.q]);

  useEffect(() => {
    const timer = setTimeout(() => {
      updateParam("q", searchValue || null);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, updateParam]);

  const updateFilter = (key: string, value: string) => {
    updateParam(key, value);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-white px-4 py-3 shadow-sm">
      <div className="relative flex-1 min-w-[220px] max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-3" />
        <Input
          placeholder="Search sources"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className={cn(
            "h-10 w-full pl-10",
            "bg-surface border-border rounded-sm",
            "focus-visible:ring-2 focus-visible:ring-accent-border focus-visible:border-accent"
          )}
        />
      </div>

      <Select value={params.kind || "all"} onValueChange={(value) => updateFilter("kind", value)}>
        <SelectTrigger className="h-10 w-[170px] rounded-sm border-border bg-surface">
          <SelectValue placeholder="All types" />
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
        value={params.status || "active"}
        onValueChange={(value) => updateFilter("status", value)}
      >
        <SelectTrigger className="h-10 w-[150px] rounded-sm border-border bg-surface">
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

      <Select value={params.sort || "updated_desc"} onValueChange={(value) => updateFilter("sort", value)}>
        <SelectTrigger className="h-10 w-[160px] rounded-sm border-border bg-surface">
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

      <div className="flex-1" />

      <Button
        onClick={onAddSource}
        className="rounded-sm bg-accent text-white hover:bg-accent-hover"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Source
      </Button>
    </div>
  );
}
