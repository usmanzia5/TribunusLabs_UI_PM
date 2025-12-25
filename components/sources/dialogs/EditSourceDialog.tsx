"use client";

import { useEffect, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { ProjectSource } from "@/lib/sources/types";
import { updateSource } from "@/lib/sources/actions";
import { parseTags } from "@/lib/sources/validation";
import { cn } from "@/lib/cn";

interface EditSourceDialogProps {
  projectId: string;
  source: ProjectSource | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

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

export function EditSourceDialog({
  projectId,
  source,
  open,
  onOpenChange,
  onSaved,
}: EditSourceDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    kind: "other" as ProjectSource["kind"],
    tags: "",
    publisher: "",
    published_at: "",
    meeting_date: "",
    meeting_body: "",
    agenda_item: "",
    project_ref: "",
    notes: "",
    status: "active" as ProjectSource["status"],
  });

  useEffect(() => {
    if (source) {
      setFormData({
        title: source.title,
        url: source.url || "",
        kind: source.kind,
        tags: source.tags.join(", "),
        publisher: source.publisher || "",
        published_at: source.published_at || "",
        meeting_date: source.meeting_date || "",
        meeting_body: source.meeting_body || "",
        agenda_item: source.agenda_item || "",
        project_ref: source.project_ref || "",
        notes: source.notes || "",
        status: source.status,
      });
      setError(null);
    }
  }, [source]);

  if (!source) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const tags = parseTags(formData.tags);
      const result = await updateSource(projectId, {
        id: source.id,
        title: formData.title.trim(),
        kind: formData.kind,
        url: source.format === "url" ? formData.url.trim() : source.url,
        publisher: formData.publisher.trim() || null,
        published_at: formData.published_at || null,
        meeting_date: formData.meeting_date || null,
        meeting_body: formData.meeting_body.trim() || null,
        agenda_item: formData.agenda_item.trim() || null,
        project_ref: formData.project_ref.trim() || null,
        tags,
        notes: formData.notes.trim() || null,
        status: formData.status,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      onSaved();
      onOpenChange(false);
    });
  };

  const disableSubmit =
    isPending ||
    !formData.title.trim() ||
    (source.format === "url" && !formData.url.trim());

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!isPending) {
          onOpenChange(next);
        }
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Source</DialogTitle>
            <DialogDescription>
              Update metadata to keep your library organized.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-title">
                  Title <span className="text-danger">*</span>
                </Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-kind">Type</Label>
                <Select
                  value={formData.kind}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, kind: value as ProjectSource["kind"] }))
                  }
                >
                  <SelectTrigger id="edit-kind" className="h-10 rounded-sm border-border bg-surface">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(kindLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {source.format === "url" ? (
              <div className="space-y-2">
                <Label htmlFor="edit-url">
                  URL <span className="text-danger">*</span>
                </Label>
                <Input
                  id="edit-url"
                  type="url"
                  value={formData.url}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, url: e.target.value }))
                  }
                />
              </div>
            ) : (
              <div className="space-y-1">
                <Label>File</Label>
                <p className="rounded-sm border border-border bg-surface-2 px-3 py-2 text-sm text-text-2">
                  Stored at {source.storage_path || "N/A"}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-publisher">Publisher</Label>
                <Input
                  id="edit-publisher"
                  value={formData.publisher}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      publisher: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-published_at">Published date</Label>
                <Input
                  id="edit-published_at"
                  type="date"
                  value={formData.published_at}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      published_at: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-meeting_date">Meeting date</Label>
                <Input
                  id="edit-meeting_date"
                  type="date"
                  value={formData.meeting_date}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      meeting_date: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-meeting_body">Meeting body</Label>
                <Input
                  id="edit-meeting_body"
                  value={formData.meeting_body}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      meeting_body: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-agenda_item">Agenda item</Label>
                <Input
                  id="edit-agenda_item"
                  value={formData.agenda_item}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      agenda_item: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-project_ref">Project reference</Label>
                <Input
                  id="edit-project_ref"
                  value={formData.project_ref}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      project_ref: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-tags">Tags (comma separated)</Label>
                <Input
                  id="edit-tags"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, tags: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: value as ProjectSource["status"],
                    }))
                  }
                >
                  <SelectTrigger id="edit-status" className="h-10 rounded-sm border-border bg-surface">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                className="min-h-[100px]"
              />
            </div>

            {error && (
              <p className="text-sm text-danger">{error}</p>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-sm"
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-sm bg-accent text-white hover:bg-accent-hover"
              disabled={disableSubmit}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
