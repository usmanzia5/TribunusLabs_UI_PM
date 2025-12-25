"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Project } from "@/lib/projects/types";
import {
  ProjectProfile,
  ProjectProfileData,
  profileDataSchema,
} from "@/lib/projects/profile-types";
import { updateProjectProfile } from "@/lib/projects/profile-actions";
import { computeFSR } from "@/lib/projects/profile-defaults";
import { generateDummyZoning, COQUITLAM_CENTER } from "@/lib/maps/dummy-zoning";
import { Accordion } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { ProfileHeader } from "./ProfileHeader";
import { SetupStatusBanner } from "./SetupStatusBanner";
import { ProfileFormSection } from "./ProfileFormSection";
import { OverviewSection } from "./OverviewSection";
import { SiteLegalSection } from "./SiteLegalSection";
import { PlanningSection } from "./PlanningSection";
import { ProposalSection } from "./ProposalSection";
import { DocumentChecklistSection } from "./DocumentChecklistSection";
import { ZoningPlaceholderMap } from "@/components/maps/ZoningPlaceholderMap";

interface ProjectProfileClientProps {
  initialProject: Project;
  initialProfile: ProjectProfile;
}

/**
 * Main project profile client component
 * Manages form state, dirty tracking, and coordinates all sections
 */
export function ProjectProfileClient({
  initialProject,
  initialProfile,
}: ProjectProfileClientProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<ProjectProfileData>({
    resolver: zodResolver(profileDataSchema),
    defaultValues: initialProfile.data,
  });

  const {
    formState: { isDirty },
    handleSubmit,
    reset,
    watch,
    register,
    setValue,
  } = form;

  // Watch for FSR computation
  const lotArea = watch("siteLegal.lotArea");
  const gfa = watch("proposal.gfa");

  // Compute FSR in real-time
  const fsr =
    lotArea?.value && gfa?.value
      ? computeFSR(lotArea.value, lotArea.unit, gfa.value, gfa.unit)
      : null;

  // Map center and pin
  const location = watch("location");
  const center =
    location?.lat && location?.lng
      ? { lat: location.lat, lng: location.lng }
      : COQUITLAM_CENTER;
  const pin =
    location?.lat && location?.lng
      ? { lat: location.lat, lng: location.lng }
      : undefined;
  const zones = generateDummyZoning(center.lat, center.lng);

  const onSubmit = (data: ProjectProfileData) => {
    startTransition(async () => {
      const result = await updateProjectProfile({
        projectId: initialProject.id,
        profileData: data,
      });

      if (result.error) {
        toast({
          title: "Failed to update profile",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Profile updated",
          description: "Your changes have been saved successfully.",
        });

        // Reset form with new data (clears dirty state)
        if (result.profile) {
          reset(result.profile.data);
        }
      }
    });
  };

  const handleCancel = () => {
    reset(initialProfile.data);
  };

  return (
    <div className="space-y-6">
      <ProfileHeader
        projectId={initialProject.id}
        projectName={initialProject.name}
        isDirty={isDirty}
        isPending={isPending}
        onUpdate={handleSubmit(onSubmit)}
        onCancel={handleCancel}
      />

      <SetupStatusBanner status={initialProfile.setup_status} />

      {/* 2-column layout: Form + Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Form sections (2/3 width on desktop) */}
        <div className="lg:col-span-2 space-y-4">
          <Accordion
            type="multiple"
            defaultValue={["overview", "proposal"]}
            className="space-y-3"
          >
            <ProfileFormSection
              value="overview"
              title="Overview"
              description="Basic project information"
            >
              <OverviewSection register={register} errors={form.formState.errors} />
            </ProfileFormSection>

            <ProfileFormSection
              value="site-legal"
              title="Site & Legal"
              description="Property details and legal description"
            >
              <SiteLegalSection
                register={register}
                errors={form.formState.errors}
                watch={watch}
                setValue={setValue}
              />
            </ProfileFormSection>

            <ProfileFormSection
              value="planning"
              title="Planning Context"
              description="Zoning, designations, and constraints"
            >
              <PlanningSection
                register={register}
                errors={form.formState.errors}
                watch={watch}
                setValue={setValue}
              />
            </ProfileFormSection>

            <ProfileFormSection
              value="proposal"
              title="Proposal Summary"
              description="Development proposal details"
            >
              <ProposalSection
                register={register}
                errors={form.formState.errors}
                watch={watch}
                setValue={setValue}
                fsr={fsr}
              />
            </ProfileFormSection>

            <ProfileFormSection
              value="documents"
              title="Document Checklist"
              description="Track document readiness"
            >
              <DocumentChecklistSection form={form} />
            </ProfileFormSection>
          </Accordion>
        </div>

        {/* Right: Map (1/3 width on desktop, sticky) */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 border border-border rounded-md p-4 bg-white">
            <h3 className="text-base font-medium text-text mb-3">Zoning Map</h3>
            <ZoningPlaceholderMap
              center={center}
              pin={pin}
              zones={zones}
              className="aspect-square"
            />
            {!pin && (
              <p className="text-xs text-text-3 mt-2">
                Add an address and click Update to geocode and center map.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
