"use client";

import { useState, useTransition } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Edit,
  ExternalLink,
  Archive,
  ArchiveRestore,
  Trash2,
} from "lucide-react";
import type { ProjectSource } from "@/lib/sources/types";
import { updateSource, deleteSource } from "@/lib/sources/actions";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/cn";

interface SourceActionsMenuProps {
  projectId: string;
  source: ProjectSource;
  onEdit: (source: ProjectSource) => void;
}

export function SourceActionsMenu({
  projectId,
  source,
  onEdit,
}: SourceActionsMenuProps) {
  const { toast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleOpen = () => {
    const targetUrl = source.url || source.storage_path;
    if (targetUrl) {
      window.open(targetUrl, "_blank");
    } else {
      toast({
        title: "No link available",
        description: "This source does not have a URL yet.",
      });
    }
  };

  const handleArchiveToggle = () => {
    startTransition(async () => {
      const result = await updateSource(projectId, {
        id: source.id,
        status: source.status === "active" ? "archived" : "active",
      });

      if (result.error) {
        toast({
          title: "Unable to update source",
          description: result.error,
        });
        return;
      }

      toast({
        title:
          source.status === "active"
            ? "Source archived"
            : "Source restored",
      });
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteSource(projectId, source.id);
      if (result.error) {
        toast({
          title: "Unable to delete source",
          description: result.error,
        });
        return;
      }
      toast({
        title: "Source deleted",
        description: "This source has been removed.",
      });
      setDeleteOpen(false);
    });
  };

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen} modal={false}>
        <DropdownMenuTrigger
          asChild
          onClick={(e) => e.stopPropagation()}
          disabled={isPending}
        >
          <button
            className={cn(
              "w-8 h-8 rounded-sm flex items-center justify-center",
              "hover:bg-surface-2 text-text-2"
            )}
            aria-label="Source actions"
          >
            <span className="sr-only">Open actions</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleOpen}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Open
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEdit(source)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleArchiveToggle}>
            {source.status === "active" ? (
              <>
                <Archive className="w-4 h-4 mr-2" />
                Archive
              </>
            ) : (
              <>
                <ArchiveRestore className="w-4 h-4 mr-2" />
                Unarchive
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className="text-danger focus:text-danger"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete source?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the source from this project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-danger text-white hover:bg-danger"
              disabled={isPending}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
