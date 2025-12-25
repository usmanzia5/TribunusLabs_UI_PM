"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Plus, Grid3x3, List } from "lucide-react";
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

interface ProjectsToolbarProps {
  onCreateClick: () => void;
}

/**
 * Toolbar for projects list with search, sort, and view controls
 * All state is managed via URL params for shareable/bookmarkable URLs
 */
export function ProjectsToolbar({ onCreateClick }: ProjectsToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get current values from URL
  const currentView = (searchParams.get("view") as "grid" | "list") || "grid";
  const currentSort = searchParams.get("sort") || "updated_desc";
  const currentSearch = searchParams.get("q") || "";

  // Local state for search input (for debouncing)
  const [searchValue, setSearchValue] = useState(currentSearch);

  useEffect(() => {
    setSearchValue(currentSearch);
  }, [currentSearch]);

  // Debounced search update
  useEffect(() => {
    const timer = setTimeout(() => {
      updateParam("q", searchValue || null);
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  // Update URL param while preserving others
  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }

      router.replace(`/projects?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const handleViewChange = (view: "grid" | "list") => {
    updateParam("view", view);
  };

  const handleSortChange = (sort: string) => {
    updateParam("sort", sort);
  };

  return (
    <div className="flex items-center gap-3 flex-wrap px-6 py-4 border-b border-border">
      {/* Search input */}
      <div className="relative flex-1 min-w-[200px] max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" />
        <Input
          type="search"
          placeholder="Search projects..."
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

      {/* Sort dropdown */}
      <Select value={currentSort} onValueChange={handleSortChange}>
        <SelectTrigger
          className={cn(
            "w-[180px] h-10",
            "bg-surface border-border",
            "rounded-sm"
          )}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="updated_desc">Last modified</SelectItem>
          <SelectItem value="created_desc">Date created</SelectItem>
          <SelectItem value="name_asc">Name (A-Z)</SelectItem>
        </SelectContent>
      </Select>

      {/* View toggle */}
      <div className="flex items-center gap-1 border border-border rounded-sm p-1">
        <button
          onClick={() => handleViewChange("grid")}
          className={cn(
            "p-2 rounded-sm transition-colors duration-150",
            currentView === "grid"
              ? "bg-accent-soft text-accent"
              : "hover:bg-surface-2 text-text-2"
          )}
          aria-label="Grid view"
          aria-pressed={currentView === "grid"}
        >
          <Grid3x3 className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleViewChange("list")}
          className={cn(
            "p-2 rounded-sm transition-colors duration-150",
            currentView === "list"
              ? "bg-accent-soft text-accent"
              : "hover:bg-surface-2 text-text-2"
          )}
          aria-label="List view"
          aria-pressed={currentView === "list"}
        >
          <List className="w-4 h-4" />
        </button>
      </div>

      {/* New Project button */}
      <Button
        onClick={onCreateClick}
        className={cn(
          "bg-accent hover:bg-accent-hover text-white",
          "rounded-sm px-4 h-10",
          "transition-colors duration-150"
        )}
      >
        <Plus className="w-4 h-4 mr-2" />
        New Project
      </Button>
    </div>
  );
}
