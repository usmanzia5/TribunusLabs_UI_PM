"use client";

import { useMemo, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ProFormaAssumptions } from "@/lib/proforma/types";
import { assumptionsSchema } from "@/lib/proforma/validation";
import { defaultAssumptions } from "@/lib/proforma/defaults";
import { computeProForma } from "@/lib/proforma/compute";
import { saveProForma } from "@/lib/proforma/actions";
import { useToast } from "@/hooks/use-toast";
import { ProjectSelector } from "@/components/proforma/ProjectSelector";
import { ProFormaHeader } from "@/components/proforma/ProFormaHeader";
import { AssumptionsForm } from "@/components/proforma/AssumptionsForm";
import { ScenarioControls } from "@/components/proforma/ScenarioControls";
import { OutputsPanel } from "@/components/proforma/OutputsPanel";

type Project = {
  id: string;
  name: string;
};

type ProFormaClientProps = {
  initialProjects: Project[];
  selectedProjectId: string | null;
  initialAssumptions: ProFormaAssumptions | null;
  projectName: string | null;
};

export function ProFormaClient({
  initialProjects,
  selectedProjectId,
  initialAssumptions,
  projectName,
}: ProFormaClientProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Initialize form with assumptions or defaults
  const form = useForm<ProFormaAssumptions>({
    resolver: zodResolver(assumptionsSchema),
    defaultValues: initialAssumptions ?? defaultAssumptions,
  });

  const { handleSubmit, reset, watch, formState, setValue } = form;
  const { isDirty } = formState;

  // Watch all form values for live calculations
  const currentAssumptions = watch();

  // Auto-calculate sales months when enabled
  useEffect(() => {
    const autoCalcSalesMonths = currentAssumptions.timeline?.autoCalcSalesMonths;
    const units = currentAssumptions.program?.units;
    const unitsPerMonth = currentAssumptions.absorption?.unitsPerMonth;

    if (autoCalcSalesMonths && units !== null && units > 0 && unitsPerMonth !== null && unitsPerMonth > 0) {
      const computed = Math.ceil(units / unitsPerMonth);
      const currentSalesMonths = currentAssumptions.timeline?.phases?.salesLeaseMonths;

      // Only update if the computed value differs from current value
      if (currentSalesMonths !== computed) {
        setValue("timeline.phases.salesLeaseMonths", computed, { shouldDirty: true });
      }
    }
  }, [
    currentAssumptions.timeline?.autoCalcSalesMonths,
    currentAssumptions.program?.units,
    currentAssumptions.absorption?.unitsPerMonth,
    currentAssumptions.timeline?.phases?.salesLeaseMonths,
    setValue,
  ]);

  // Compute base outputs (no scenario)
  const baseOutputs = useMemo(() => {
    const baseAssumptions = initialAssumptions ?? defaultAssumptions;
    return computeProForma(baseAssumptions, false);
  }, [initialAssumptions]);

  // Compute scenario outputs (with deltas)
  const scenarioOutputs = useMemo(() => {
    return computeProForma(currentAssumptions, true);
  }, [currentAssumptions]);

  // Save handler
  const onSave = handleSubmit((data) => {
    if (!selectedProjectId) {
      toast({
        title: "No project selected",
        description: "Please select a project first",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      const result = await saveProForma(selectedProjectId, data);

      if (result.error) {
        toast({
          title: "Failed to save pro forma",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Pro forma saved successfully",
        });
        // Clear dirty state
        reset(data);
      }
    });
  });

  // Revert handler
  const onRevert = () => {
    reset(initialAssumptions ?? defaultAssumptions);
  };

  // Empty state when no project selected
  if (!selectedProjectId) {
    return (
      <div className="h-full flex flex-col">
        <div className="border-b px-6 py-4">
          <h1 className="text-2xl font-semibold">Pro Forma</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="max-w-md text-center space-y-4">
            <h2 className="text-lg font-medium">Select a project</h2>
            <p className="text-gray-600">
              Choose a project to start modeling.
            </p>
            <div className="flex justify-center mt-6">
              <ProjectSelector
                projects={initialProjects}
                selectedProjectId={null}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main pro forma interface
  return (
    <div className="h-full flex flex-col">
      <ProFormaHeader
        projectName={projectName}
        isDirty={isDirty}
        isPending={isPending}
        onSave={onSave}
        onRevert={onRevert}
      />

      <div className="flex-1 overflow-auto">
        <div className="px-6 py-4">
          <ProjectSelector
            projects={initialProjects}
            selectedProjectId={selectedProjectId}
          />
        </div>

        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Assumptions + Scenario */}
            <div className="lg:col-span-2 space-y-4">
              <AssumptionsForm form={form} />
              <ScenarioControls form={form} />
            </div>

            {/* Right: Outputs (sticky on desktop) */}
            <div className="lg:sticky lg:top-6 lg:self-start">
              <OutputsPanel
                baseOutputs={baseOutputs}
                scenarioOutputs={scenarioOutputs}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
