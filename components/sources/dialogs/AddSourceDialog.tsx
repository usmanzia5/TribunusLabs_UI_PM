"use client";

import { useState, useTransition } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { createSource } from "@/lib/sources/actions";
import type { ProjectSource } from "@/lib/sources/types";
import { parseTags } from "@/lib/sources/validation";
import { cn } from "@/lib/cn";

interface AddSourceDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const kinds: ProjectSource["kind"][] = [
  "council_report",
  "news",
  "zoning_map",
  "bylaw_policy",
  "staff_report",
  "minutes_agenda",
  "market_data",
  "other",
];

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

export function AddSourceDialog({
  projectId,
  open,
  onOpenChange,
  onCreated,
}: AddSourceDialogProps) {
  const [format, setFormat] = useState<"url" | "file">("url");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [file, setFile] = useState<File | null>(null);
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
  });

  const resetForm = () => {
    setFormData({
      title: "",
      url: "",
      kind: "other",
      tags: "",
      publisher: "",
      published_at: "",
      meeting_date: "",
      meeting_body: "",
      agenda_item: "",
      project_ref: "",
      notes: "",
    });
    setFile(null);
    setFormat("url");
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const tags = parseTags(formData.tags);
      const base = {
        kind: formData.kind,
        title: formData.title.trim(),
        publisher: formData.publisher.trim() || null,
        published_at: formData.published_at || null,
        meeting_date: formData.meeting_date || null,
        meeting_body: formData.meeting_body.trim() || null,
        agenda_item: formData.agenda_item.trim() || null,
        project_ref: formData.project_ref.trim() || null,
        tags,
        notes: formData.notes.trim() || null,
      };

      let result;

      if (format === "url") {
        result = await createSource(projectId, {
          ...base,
          format: "url",
          url: formData.url.trim(),
        });
      } else {
        if (!file) {
          setError("Select a file to upload.");
          return;
        }
        const storage_path = `mock/${projectId}/${crypto.randomUUID()}/${file.name}`;
        result = await createSource(projectId, {
          ...base,
          format: "file",
          storage_path,
          mime_type: file.type || null,
          file_size_bytes: file.size,
        });
      }

      if (result?.error) {
        setError(result.error);
        return;
      }

      onCreated();
      onOpenChange(false);
      resetForm();
    });
  };

  const disableSubmit =
    !formData.title.trim() ||
    (format === "url" ? !formData.url.trim() : !file) ||
    isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!isPending) {
          onOpenChange(next);
          if (!next) {
            resetForm();
          }
        }
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Source</DialogTitle>
            <DialogDescription>
              Attach a link or file with helpful context for this project.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFormat("url")}
                className={cn(
                  "rounded-sm border px-3 py-2 text-sm",
                  format === "url"
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-border text-text-2 hover:bg-surface-2"
                )}
              >
                Link
              </button>
              <button
                type="button"
                onClick={() => setFormat("file")}
                className={cn(
                  "rounded-sm border px-3 py-2 text-sm",
                  format === "file"
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-border text-text-2 hover:bg-surface-2"
                )}
              >
                File
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-danger">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Staff report on rezoning"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kind">Type</Label>
                <Select
                  value={formData.kind}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, kind: value }))
                  }
                >
                  <SelectTrigger id="kind" className="h-10 rounded-sm border-border bg-surface">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {kinds.map((kind) => (
                      <SelectItem key={kind} value={kind}>
                        {kindLabels[kind]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {format === "url" ? (
              <div className="space-y-2">
                <Label htmlFor="url">
                  URL <span className="text-danger">*</span>
                </Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, url: e.target.value }))
                  }
                  placeholder="https://example.com/report"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="file">
                  File <span className="text-danger">*</span>
                </Label>
                <Input
                  id="file"
                  type="file"
                  onChange={(e) => {
                    const next = e.target.files?.[0] || null;
                    setFile(next);
                  }}
                />
                {file && (
                  <p className="text-sm text-text-3">
                    {file.name} · {(file.size / 1024).toFixed(0)} KB
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="publisher">Publisher</Label>
                <Input
                  id="publisher"
                  value={formData.publisher}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      publisher: e.target.value,
                    }))
                  }
                  placeholder="City of Coquitlam"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="published_at">Published date</Label>
                <Input
                  id="published_at"
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
                <Label htmlFor="meeting_date">Meeting date</Label>
                <Input
                  id="meeting_date"
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
                <Label htmlFor="meeting_body">Meeting body</Label>
                <Input
                  id="meeting_body"
                  value={formData.meeting_body}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      meeting_body: e.target.value,
                    }))
                  }
                  placeholder="Regular Council"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="agenda_item">Agenda item</Label>
                <Input
                  id="agenda_item"
                  value={formData.agenda_item}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      agenda_item: e.target.value,
                    }))
                  }
                  placeholder="4.2 Rezoning Application"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project_ref">Project reference</Label>
                <Input
                  id="project_ref"
                  value={formData.project_ref}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      project_ref: e.target.value,
                    }))
                  }
                  placeholder="PROJ-21065"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, tags: e.target.value }))
                }
                placeholder="council, meeting, 2024"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Add any quick context about this source."
                className="min-h-[100px]"
              />
            </div>

            {error && <p className="text-sm text-danger">{error}</p>}
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
              Add Source
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
