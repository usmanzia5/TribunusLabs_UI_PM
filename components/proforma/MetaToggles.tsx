"use client";

import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { ProFormaAssumptions } from "@/lib/proforma/types";

interface MetaTogglesProps {
  form: UseFormReturn<ProFormaAssumptions>;
}

export function MetaToggles({ form }: MetaTogglesProps) {
  const assetType = form.watch("meta.assetType");
  const monetization = form.watch("meta.monetization");

  return (
    <div className="space-y-6 mb-6 p-6 bg-white border rounded-md">
      <div>
        <Label className="text-sm font-medium mb-3 block">Asset Type</Label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => form.setValue("meta.assetType", "TOWNHOME", { shouldDirty: true })}
            className={`
              px-6 py-2.5 rounded-sm text-sm font-medium transition-colors
              ${
                assetType === "TOWNHOME"
                  ? "bg-accent text-white"
                  : "bg-surface border border-gray-300 text-gray-700 hover:bg-surface-2"
              }
            `}
          >
            Townhome
          </button>
          <button
            type="button"
            onClick={() => form.setValue("meta.assetType", "MULTIFAMILY", { shouldDirty: true })}
            className={`
              px-6 py-2.5 rounded-sm text-sm font-medium transition-colors
              ${
                assetType === "MULTIFAMILY"
                  ? "bg-accent text-white"
                  : "bg-surface border border-gray-300 text-gray-700 hover:bg-surface-2"
              }
            `}
          >
            Multifamily
          </button>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium mb-3 block">Monetization</Label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => form.setValue("meta.monetization", "FOR_SALE", { shouldDirty: true })}
            className={`
              px-6 py-2.5 rounded-sm text-sm font-medium transition-colors
              ${
                monetization === "FOR_SALE"
                  ? "bg-accent text-white"
                  : "bg-surface border border-gray-300 text-gray-700 hover:bg-surface-2"
              }
            `}
          >
            For-Sale
          </button>
          <button
            type="button"
            disabled
            title="For-Rent modeling coming in Phase 2"
            className="
              px-6 py-2.5 rounded-sm text-sm font-medium
              bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed
            "
          >
            For-Rent
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          For-Rent modeling is coming in Phase 2
        </p>
      </div>
    </div>
  );
}
