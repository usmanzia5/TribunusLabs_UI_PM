"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProjectSource } from "@/lib/sources/types";
import { updateSource } from "@/lib/sources/actions";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/cn";

const KIND_OPTIONS = [
  { value: "council_report", label: "Council report" },
  { value: "news", label: "News" },
  { value: "zoning_map", label: "Zoning map" },
  { value: "bylaw_policy", label: "Bylaw / policy" },
  { value: "staff_report", label: "Staff report" },
  { value: "minutes_agenda", label: "Minutes / agenda" },
  { value: "market_data", label: "Market data" },
  { value: "other", label: "Other" },
];

interface EditSourceDialogProps {
  projectId: string;
  source: ProjectSource;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
}

export function EditSourceDialog({
  projectId,
  source,
  open,
  onOpenChange,
  onClose,
}: EditSourceDialogProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    kind: source.kind,
    title: source.title,
    url: source.url || "",
    tags: (source.tags || []).join(", "),
    notes: source.notes || "",
    publisher: source.publisher || "",
    published_at: source.published_at || "",
    meeting_date: source.meeting_date || "",
    meeting_body: source.meeting_body || "",
    agenda_item: source.agenda_item || "",
    project_ref: source.project_ref || "",
  });

  useEffect(() => {
    setForm({
      kind: source.kind,
      title: source.title,
      url: source.url || "",
      tags: (source.tags || []).join(", "),
      notes: source.notes || "",
      publisher: source.publisher || "",
      published_at: source.published_at || "",
      meeting_date: source.meeting_date || "",
      meeting_body: source.meeting_body || "",
      agenda_item: source.agenda_item || "",
      project_ref: source.project_ref || "",
    });
  }, [source]);

  const canSubmit = useMemo(() => {
    if (isPending) return false;
    if (!form.title.trim()) return false;
    if (source.format === "url") {
      return !!form.url.trim();
    }
    return true;
  }, [form.title, form.url, isPending, source.format]);

  const handleOpenChange = (next: boolean) => {
    if (!isPending) {
      onOpenChange(next);
      if (!next) {
        onClose();
      }
    }
  };

  const handleSubmit = () => {
    if (!canSubmit) return;

    startTransition(async () => {
      const tagList = form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      const result = await updateSource(projectId, {
        id: source.id,
        kind: form.kind,
        title: form.title.trim(),
        url: source.format === "url" ? form.url.trim() : undefined,
        tags: tagList,
        notes: form.notes || null,
        publisher: form.publisher || null,
        published_at: form.published_at || null,
        meeting_date: form.meeting_date || null,
        meeting_body: form.meeting_body || null,
        agenda_item: form.agenda_item || null,
        project_ref: form.project_ref || null,
      });

      if (result.error) {
        toast({
          title: "Unable to update source",
          description: result.error,
        });
        return;
      }

      toast({
        title: "Source updated",
        description: "Your changes have been saved.",
      });
      handleOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Edit Source</DialogTitle>
          <DialogDescription>
            Update metadata for this source.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="kind">Kind</Label>
              <Select
                value={form.kind}
                onValueChange={(value) => setForm({ ...form, kind: value })}
                disabled={isPending}
              >
                <SelectTrigger className="h-10 rounded-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {KIND_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
                className="h-10 rounded-sm"
                disabled={isPending}
              />
            </div>

            {source.format === "url" && (
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  type="url"
                  value={form.url}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, url: e.target.value }))
                  }
                  className="h-10 rounded-sm"
                  disabled={isPending}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={form.tags}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, tags: e.target.value }))
                }
                className="h-10 rounded-sm"
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, notes: e.target.value }))
                }
                className="rounded-sm"
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Accordion type="single" collapsible>
              <AccordionItem value="metadata">
                <AccordionTrigger className="text-sm font-medium">
                  Advanced metadata
                </AccordionTrigger>
                <AccordionContent className="space-y-3 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="publisher">Publisher</Label>
                    <Input
                      id="publisher"
                      value={form.publisher}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          publisher: e.target.value,
                        }))
                      }
                      className="h-10 rounded-sm"
                      disabled={isPending}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="published_at">Published date</Label>
                      <Input
                        id="published_at"
                        type="date"
                        value={form.published_at}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            published_at: e.target.value,
                          }))
                        }
                        className="h-10 rounded-sm"
                        disabled={isPending}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="meeting_date">Meeting date</Label>
                      <Input
                        id="meeting_date"
                        type="date"
                        value={form.meeting_date}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            meeting_date: e.target.value,
                          }))
                        }
                        className="h-10 rounded-sm"
                        disabled={isPending}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="meeting_body">Meeting body</Label>
                      <Input
                        id="meeting_body"
                        value={form.meeting_body}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            meeting_body: e.target.value,
                          }))
                        }
                        className="h-10 rounded-sm"
                        disabled={isPending}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="agenda_item">Agenda item</Label>
                      <Input
                        id="agenda_item"
                        value={form.agenda_item}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            agenda_item: e.target.value,
                          }))
                        }
                        className="h-10 rounded-sm"
                        disabled={isPending}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project_ref">Project ref (PROJ #)</Label>
                    <Input
                      id="project_ref"
                      value={form.project_ref}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          project_ref: e.target.value,
                        }))
                      }
                      className="h-10 rounded-sm"
                      disabled={isPending}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
            className="rounded-sm"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={cn(
              "rounded-sm bg-accent hover:bg-accent-hover text-white"
            )}
          >
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
