"use client";

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
import type { ProjectSource } from "@/lib/sources/types";
import { Loader2 } from "lucide-react";

interface DeleteSourceDialogProps {
  source: ProjectSource | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending?: boolean;
}

export function DeleteSourceDialog({
  source,
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: DeleteSourceDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete source?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove{" "}
            <span className="font-medium text-text">{source?.title}</span>{" "}
            from the project library.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-sm" disabled={isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="rounded-sm bg-danger text-white hover:bg-danger/90"
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
