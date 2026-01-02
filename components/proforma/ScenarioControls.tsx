"use client";

import { UseFormReturn } from "react-hook-form";
import type { ProFormaAssumptions } from "@/lib/proforma/types";
import { scenarioRanges } from "@/lib/proforma/defaults";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type ScenarioControlsProps = {
  form: UseFormReturn<ProFormaAssumptions>;
};

export function ScenarioControls({ form }: ScenarioControlsProps) {
  const { setValue, watch } = form;

  const deltaSalePricePerSqftPct = watch("scenario.deltaSalePricePerSqftPct");
  const deltaHardCostPerSqftPct = watch("scenario.deltaHardCostPerSqftPct");
  const deltaInterestRatePct = watch("scenario.deltaInterestRatePct");
  const deltaTotalMonths = watch("scenario.deltaTotalMonths");

  const handleReset = () => {
    setValue("scenario.deltaSalePricePerSqftPct", 0);
    setValue("scenario.deltaHardCostPerSqftPct", 0);
    setValue("scenario.deltaInterestRatePct", 0);
    setValue("scenario.deltaTotalMonths", 0);
  };

  return (
    <div className="border rounded-md p-4 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Scenario Analysis</h3>
        <Button variant="outline" size="sm" onClick={handleReset}>
          Reset
        </Button>
      </div>

      <div className="space-y-4">
        {/* Sale Price Delta */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <Label htmlFor="scenario-sale-price">Sale Price Delta</Label>
            <span className="text-sm font-medium">
              {deltaSalePricePerSqftPct > 0 ? "+" : ""}
              {deltaSalePricePerSqftPct}%
            </span>
          </div>
          <input
            id="scenario-sale-price"
            type="range"
            min={scenarioRanges.deltaSalePricePerSqftPct.min}
            max={scenarioRanges.deltaSalePricePerSqftPct.max}
            step={scenarioRanges.deltaSalePricePerSqftPct.step}
            value={deltaSalePricePerSqftPct}
            onChange={(e) =>
              setValue(
                "scenario.deltaSalePricePerSqftPct",
                parseFloat(e.target.value)
              )
            }
            className="w-full"
          />
        </div>

        {/* Hard Cost Delta */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <Label htmlFor="scenario-hard-cost">Hard Cost Delta</Label>
            <span className="text-sm font-medium">
              {deltaHardCostPerSqftPct > 0 ? "+" : ""}
              {deltaHardCostPerSqftPct}%
            </span>
          </div>
          <input
            id="scenario-hard-cost"
            type="range"
            min={scenarioRanges.deltaHardCostPerSqftPct.min}
            max={scenarioRanges.deltaHardCostPerSqftPct.max}
            step={scenarioRanges.deltaHardCostPerSqftPct.step}
            value={deltaHardCostPerSqftPct}
            onChange={(e) =>
              setValue(
                "scenario.deltaHardCostPerSqftPct",
                parseFloat(e.target.value)
              )
            }
            className="w-full"
          />
        </div>

        {/* Interest Rate Delta */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <Label htmlFor="scenario-interest">Interest Rate Delta</Label>
            <span className="text-sm font-medium">
              {deltaInterestRatePct > 0 ? "+" : ""}
              {deltaInterestRatePct.toFixed(1)}pp
            </span>
          </div>
          <input
            id="scenario-interest"
            type="range"
            min={scenarioRanges.deltaInterestRatePct.min}
            max={scenarioRanges.deltaInterestRatePct.max}
            step={scenarioRanges.deltaInterestRatePct.step}
            value={deltaInterestRatePct}
            onChange={(e) =>
              setValue("scenario.deltaInterestRatePct", parseFloat(e.target.value))
            }
            className="w-full"
          />
        </div>

        {/* Duration Delta */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <Label htmlFor="scenario-duration">Total Duration Delta (months)</Label>
            <span className="text-sm font-medium">
              {deltaTotalMonths > 0 ? "+" : ""}
              {deltaTotalMonths} months
            </span>
          </div>
          <input
            id="scenario-duration"
            type="range"
            min={scenarioRanges.deltaTotalMonths.min}
            max={scenarioRanges.deltaTotalMonths.max}
            step={scenarioRanges.deltaTotalMonths.step}
            value={deltaTotalMonths}
            onChange={(e) =>
              setValue("scenario.deltaTotalMonths", parseInt(e.target.value))
            }
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
