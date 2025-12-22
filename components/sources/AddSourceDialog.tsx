"use client";

import { useMemo, useState, useTransition } from "react";
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
import { createSource } from "@/lib/sources/actions";
import { cn } from "@/lib/cn";
import { useToast } from "@/hooks/use-toast";

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

type TabKey = "link" | "file";

interface AddSourceDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddSourceDialog({
  projectId,
  open,
  onOpenChange,
}: AddSourceDialogProps) {
  const { toast } = useToast();
  const [tab, setTab] = useState<TabKey>("link");
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    kind: "other",
    title: "",
    url: "",
    tags: "",
    notes: "",
    publisher: "",
    published_at: "",
    meeting_date: "",
    meeting_body: "",
    agenda_item: "",
    project_ref: "",
  });

  const canSubmit = useMemo(() => {
    if (isPending || uploading) return false;
    if (!form.title.trim()) return false;
    if (tab === "link") {
      return !!form.url.trim();
    }
    return !!file;
  }, [file, form.title, form.url, isPending, tab, uploading]);

  const resetState = () => {
    setForm({
      kind: "other",
      title: "",
      url: "",
      tags: "",
      notes: "",
      publisher: "",
      published_at: "",
      meeting_date: "",
      meeting_body: "",
      agenda_item: "",
      project_ref: "",
    });
    setFile(null);
    setUploadProgress(0);
    setUploading(false);
    setTab("link");
  };

  const handleOpenChange = (next: boolean) => {
    if (!isPending && !uploading) {
      onOpenChange(next);
      if (!next) {
        resetState();
      }
    }
  };

  const startFakeUpload = async () => {
    setUploading(true);
    setUploadProgress(20);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setUploadProgress(70);
    await new Promise((resolve) => setTimeout(resolve, 400));
    setUploadProgress(100);
    await new Promise((resolve) => setTimeout(resolve, 200));
    setUploading(false);
  };

  const handleSubmit = () => {
    if (!canSubmit) return;

    startTransition(async () => {
      if (tab === "file" && file) {
        await startFakeUpload();
      }

      const sourceId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}`;

      const tagList = form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      const payload =
        tab === "link"
          ? {
              format: "url" as const,
              kind: form.kind,
              title: form.title.trim(),
              url: form.url.trim(),
            }
          : {
              format: "file" as const,
              kind: form.kind,
              title: form.title.trim(),
              storage_path: `${projectId}/${sourceId}/${file?.name}`,
              mime_type: file?.type || null,
              file_size_bytes: file?.size || null,
            };

      const result = await createSource(projectId, {
        ...payload,
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
          title: "Unable to add source",
          description: result.error,
        });
        return;
      }

      toast({
        title: "Source added",
        description: "Your source was created successfully.",
      });
      handleOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Add Source</DialogTitle>
          <DialogDescription>
            Attach links or files to this project and track key metadata.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 border border-border rounded-md p-1 bg-surface">
          {(["link", "file"] as TabKey[]).map((key) => (
            <button
              key={key}
              type="button"
              className={cn(
                "flex-1 h-10 rounded-sm text-sm font-medium transition-colors",
                tab === key
                  ? "bg-accent-soft text-accent border border-accent-border"
                  : "text-text-2 hover:bg-surface-2 border border-transparent"
              )}
              onClick={() => setTab(key)}
              disabled={isPending || uploading}
            >
              {key === "link" ? "Link" : "File"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="kind">Kind</Label>
              <Select
                value={form.kind}
                onValueChange={(value) => setForm({ ...form, kind: value })}
                disabled={isPending || uploading}
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
                placeholder="Council report or article title"
                className="h-10 rounded-sm"
                disabled={isPending || uploading}
              />
            </div>

            {tab === "link" ? (
              <div className="space-y-2">
                <Label htmlFor="url">
                  URL <span className="text-danger">*</span>
                </Label>
                <Input
                  id="url"
                  type="url"
                  value={form.url}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, url: e.target.value }))
                  }
                  placeholder="https://example.com/report"
                  className="h-10 rounded-sm"
                  disabled={isPending || uploading}
                  required
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
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="h-10 rounded-sm"
                  disabled={isPending || uploading}
                />
                {file && (
                  <p className="text-xs text-text-2">
                    {file.name} · {Math.round(file.size / 1024)} KB
                  </p>
                )}
                {uploading && (
                  <p className="text-xs text-text-2">
                    Uploading... {uploadProgress}%
                  </p>
                )}
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
                placeholder="council, zoning, staff report"
                className="h-10 rounded-sm"
                disabled={isPending || uploading}
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
                placeholder="What is this source about?"
                className="rounded-sm"
                disabled={isPending || uploading}
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
                      placeholder="City, newspaper, or agency"
                      className="h-10 rounded-sm"
                      disabled={isPending || uploading}
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
                        disabled={isPending || uploading}
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
                        disabled={isPending || uploading}
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
                        placeholder="Public Hearing, Regular Council..."
                        className="h-10 rounded-sm"
                        disabled={isPending || uploading}
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
                        placeholder="PH1 - Rezoning Application"
                        className="h-10 rounded-sm"
                        disabled={isPending || uploading}
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
                      placeholder="PROJ 21-065"
                      className="h-10 rounded-sm"
                      disabled={isPending || uploading}
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
            disabled={isPending || uploading}
            className="rounded-sm"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="rounded-sm bg-accent hover:bg-accent-hover text-white"
          >
            {(isPending || uploading) && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            {tab === "link" ? "Add Link" : "Upload File"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
