"use client";

import { useState } from "react";
import { Edit, Archive, ArchiveRestore, Trash2, ExternalLink, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { ProjectSource } from "@/lib/sources/types";

interface SourceActionsMenuProps {
  source: ProjectSource;
  onEdit: () => void;
  onDelete: () => void;
  onArchiveToggle: () => void;
  isPending?: boolean;
}

export function SourceActionsMenu({
  source,
  onEdit,
  onDelete,
  onArchiveToggle,
  isPending,
}: SourceActionsMenuProps) {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    if (source.url) {
      window.open(source.url, "_blank");
    } else if (source.storage_path) {
      window.open(source.storage_path, "_blank");
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreVertical className="h-4 w-4 text-text-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={handleOpen}>
          <ExternalLink className="mr-2 h-4 w-4" />
          Open
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onArchiveToggle}>
          {source.status === "archived" ? (
            <>
              <ArchiveRestore className="mr-2 h-4 w-4" />
              Unarchive
            </>
          ) : (
            <>
              <Archive className="mr-2 h-4 w-4" />
              Archive
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-danger focus:text-danger"
          onClick={onDelete}
          disabled={isPending}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
