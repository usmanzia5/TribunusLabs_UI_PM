"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Search } from "lucide-react";
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

interface ProjectSourcesToolbarProps {
  projectId: string;
  onAddClick: () => void;
}

export function ProjectSourcesToolbar({
  projectId,
  onAddClick,
}: ProjectSourcesToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentKind = (searchParams.get("kind") as string) || "all";
  const currentStatus = (searchParams.get("status") as string) || "active";
  const currentSort = (searchParams.get("sort") as string) || "updated_desc";
  const currentSearch = searchParams.get("q") || "";

  const [searchValue, setSearchValue] = useState(currentSearch);

  useEffect(() => {
    setSearchValue(currentSearch);
  }, [currentSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      updateParam("q", searchValue || null);
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

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
      router.replace(nextPath, {
        scroll: false,
      });
    },
    [router, searchParams, projectId]
  );

  const handleSelectChange = (key: string) => (value: string) => {
    updateParam(key, value);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b border-border">
      <div className="relative flex-1 min-w-[220px] max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" />
        <Input
          type="search"
          placeholder="Search sources..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className={cn(
            "pl-10 h-10",
            "bg-surface border-border",
            "rounded-sm",
            "focus-visible:ring-2 focus-visible:ring-accent-border focus-visible:border-accent"
          )}
        />
      </div>

      <Select value={currentKind} onValueChange={handleSelectChange("kind")}>
        <SelectTrigger className="w-[160px] h-10 bg-surface border-border rounded-sm">
          <SelectValue placeholder="Kind" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All kinds</SelectItem>
          <SelectItem value="council_report">Council report</SelectItem>
          <SelectItem value="news">News</SelectItem>
          <SelectItem value="zoning_map">Zoning map</SelectItem>
          <SelectItem value="bylaw_policy">Bylaw / policy</SelectItem>
          <SelectItem value="staff_report">Staff report</SelectItem>
          <SelectItem value="minutes_agenda">Minutes / agenda</SelectItem>
          <SelectItem value="market_data">Market data</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={currentStatus}
        onValueChange={handleSelectChange("status")}
      >
        <SelectTrigger className="w-[150px] h-10 bg-surface border-border rounded-sm">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="archived">Archived</SelectItem>
          <SelectItem value="all">All</SelectItem>
        </SelectContent>
      </Select>

      <Select value={currentSort} onValueChange={handleSelectChange("sort")}>
        <SelectTrigger className="w-[180px] h-10 bg-surface border-border rounded-sm">
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="updated_desc">Last updated</SelectItem>
          <SelectItem value="created_desc">Date added</SelectItem>
          <SelectItem value="title_asc">Title A-Z</SelectItem>
          <SelectItem value="published_desc">Published date</SelectItem>
          <SelectItem value="meeting_desc">Meeting date</SelectItem>
        </SelectContent>
      </Select>

      <Button
        onClick={onAddClick}
        className={cn(
          "bg-accent hover:bg-accent-hover text-white",
          "rounded-sm px-4 h-10",
          "transition-colors duration-150"
        )}
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Source
      </Button>
    </div>
  );
}
