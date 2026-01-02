"use client";

import { UseFormReturn } from "react-hook-form";
import type { ProFormaAssumptions } from "@/lib/proforma/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { MetaToggles } from "./MetaToggles";

type AssumptionsFormProps = {
  form: UseFormReturn<ProFormaAssumptions>;
};

export function AssumptionsForm({ form }: AssumptionsFormProps) {
  const { register, formState, watch, setValue } = form;
  const { errors } = formState;

  const assetType = watch("meta.assetType");
  const autoCalcSalesMonths = watch("timeline.autoCalcSalesMonths");
  const entitlementMonths = watch("timeline.phases.entitlementMonths");
  const constructionMonths = watch("timeline.phases.constructionMonths");
  const salesLeaseMonths = watch("timeline.phases.salesLeaseMonths");

  // Calculate total months
  const totalMonths =
    (entitlementMonths ?? 0) +
    (constructionMonths ?? 0) +
    (salesLeaseMonths ?? 0);

  return (
    <div className="space-y-4">
      {/* Meta Toggles */}
      <MetaToggles form={form} />

      <Accordion
        type="multiple"
        defaultValue={["program", "revenue", "costs"]}
        className="space-y-2"
      >
        {/* Program Section */}
        <AccordionItem value="program" className="border rounded-md px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="font-medium">Program</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 pb-4">
              <div>
                <Label htmlFor="program.units">Units</Label>
                <Input
                  id="program.units"
                  type="number"
                  step="1"
                  {...register("program.units", { valueAsNumber: true })}
                  className="mt-1"
                />
                {errors.program?.units && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.program.units.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="program.saleableAreaSqft">
                  Saleable Area (sq ft)
                </Label>
                <Input
                  id="program.saleableAreaSqft"
                  type="number"
                  step="0.01"
                  {...register("program.saleableAreaSqft", {
                    valueAsNumber: true,
                  })}
                  className="mt-1"
                />
                {errors.program?.saleableAreaSqft && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.program.saleableAreaSqft.message}
                  </p>
                )}
              </div>
              {assetType === "MULTIFAMILY" && (
                <div>
                  <Label htmlFor="program.netToGrossPct">
                    Net to Gross Ratio (%)
                  </Label>
                  <Input
                    id="program.netToGrossPct"
                    type="number"
                    step="0.1"
                    {...register("program.netToGrossPct", {
                      valueAsNumber: true,
                    })}
                    className="mt-1"
                    placeholder="80"
                  />
                  {errors.program?.netToGrossPct && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.program.netToGrossPct.message}
                    </p>
                  )}
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Acquisition Section */}
        <AccordionItem value="acquisition" className="border rounded-md px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="font-medium">Acquisition</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 pb-4">
              <div>
                <Label htmlFor="acquisition.landPrice">Land Price (CAD)</Label>
                <Input
                  id="acquisition.landPrice"
                  type="number"
                  step="0.01"
                  {...register("acquisition.landPrice", { valueAsNumber: true })}
                  className="mt-1"
                />
                {errors.acquisition?.landPrice && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.acquisition.landPrice.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="acquisition.closingCostsPct">
                  Closing Costs (%)
                </Label>
                <Input
                  id="acquisition.closingCostsPct"
                  type="number"
                  step="0.1"
                  {...register("acquisition.closingCostsPct", {
                    valueAsNumber: true,
                  })}
                  className="mt-1"
                />
                {errors.acquisition?.closingCostsPct && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.acquisition.closingCostsPct.message}
                  </p>
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Revenue Section */}
        <AccordionItem value="revenue" className="border rounded-md px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="font-medium">Revenue (For-Sale)</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 pb-4">
              <div>
                <Label htmlFor="revenueSale.salePricePerSqft">
                  Sale Price (CAD/sq ft)
                </Label>
                <Input
                  id="revenueSale.salePricePerSqft"
                  type="number"
                  step="0.01"
                  {...register("revenueSale.salePricePerSqft", {
                    valueAsNumber: true,
                  })}
                  className="mt-1"
                />
                {errors.revenueSale?.salePricePerSqft && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.revenueSale.salePricePerSqft.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="revenueSale.otherRevenue">Other Revenue (CAD)</Label>
                <Input
                  id="revenueSale.otherRevenue"
                  type="number"
                  step="0.01"
                  {...register("revenueSale.otherRevenue", { valueAsNumber: true })}
                  className="mt-1"
                />
                {errors.revenueSale?.otherRevenue && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.revenueSale.otherRevenue.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="revenueSale.salesCommissionPct">
                  Sales Commission (%)
                </Label>
                <Input
                  id="revenueSale.salesCommissionPct"
                  type="number"
                  step="0.1"
                  {...register("revenueSale.salesCommissionPct", {
                    valueAsNumber: true,
                  })}
                  className="mt-1"
                />
                {errors.revenueSale?.salesCommissionPct && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.revenueSale.salesCommissionPct.message}
                  </p>
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Absorption Section (NEW) */}
        <AccordionItem value="absorption" className="border rounded-md px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="font-medium">Sales Absorption</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 pb-4">
              <div>
                <Label htmlFor="absorption.unitsPerMonth">
                  Absorption Rate (units/month)
                </Label>
                <Input
                  id="absorption.unitsPerMonth"
                  type="number"
                  step="0.1"
                  {...register("absorption.unitsPerMonth", {
                    valueAsNumber: true,
                  })}
                  className="mt-1"
                  placeholder="4"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Used to estimate sellout period when Auto-calc is enabled
                </p>
                {errors.absorption?.unitsPerMonth && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.absorption.unitsPerMonth.message}
                  </p>
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Costs Section */}
        <AccordionItem value="costs" className="border rounded-md px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="font-medium">Costs</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 pb-4">
              <div>
                <Label htmlFor="costs.hardCostPerSqft">
                  Hard Cost (CAD/sq ft)
                </Label>
                <Input
                  id="costs.hardCostPerSqft"
                  type="number"
                  step="0.01"
                  {...register("costs.hardCostPerSqft", { valueAsNumber: true })}
                  className="mt-1"
                />
                {errors.costs?.hardCostPerSqft && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.costs.hardCostPerSqft.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="costs.softCostPctOfHard">
                  Soft Cost (% of Hard)
                </Label>
                <Input
                  id="costs.softCostPctOfHard"
                  type="number"
                  step="0.1"
                  {...register("costs.softCostPctOfHard", {
                    valueAsNumber: true,
                  })}
                  className="mt-1"
                />
                {errors.costs?.softCostPctOfHard && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.costs.softCostPctOfHard.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="costs.contingencyPctOfHard">
                  Contingency - Hard (%)
                </Label>
                <Input
                  id="costs.contingencyPctOfHard"
                  type="number"
                  step="0.1"
                  {...register("costs.contingencyPctOfHard", {
                    valueAsNumber: true,
                  })}
                  className="mt-1"
                />
                {errors.costs?.contingencyPctOfHard && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.costs.contingencyPctOfHard.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="costs.contingencyPctOfSoft">
                  Contingency - Soft (%)
                </Label>
                <Input
                  id="costs.contingencyPctOfSoft"
                  type="number"
                  step="0.1"
                  {...register("costs.contingencyPctOfSoft", {
                    valueAsNumber: true,
                  })}
                  className="mt-1"
                />
                {errors.costs?.contingencyPctOfSoft && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.costs.contingencyPctOfSoft.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="costs.devFeePctOfCost">Dev Fee (% of Cost)</Label>
                <Input
                  id="costs.devFeePctOfCost"
                  type="number"
                  step="0.1"
                  {...register("costs.devFeePctOfCost", { valueAsNumber: true })}
                  className="mt-1"
                />
                {errors.costs?.devFeePctOfCost && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.costs.devFeePctOfCost.message}
                  </p>
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Financing Section */}
        <AccordionItem value="financing" className="border rounded-md px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="font-medium">Financing</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 pb-4">
              <div>
                <Label htmlFor="financing.loanToCostPct">Loan to Cost (%)</Label>
                <Input
                  id="financing.loanToCostPct"
                  type="number"
                  step="0.1"
                  {...register("financing.loanToCostPct", {
                    valueAsNumber: true,
                  })}
                  className="mt-1"
                />
                {errors.financing?.loanToCostPct && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.financing.loanToCostPct.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="financing.interestRatePct">
                  Interest Rate (%)
                </Label>
                <Input
                  id="financing.interestRatePct"
                  type="number"
                  step="0.01"
                  {...register("financing.interestRatePct", {
                    valueAsNumber: true,
                  })}
                  className="mt-1"
                />
                {errors.financing?.interestRatePct && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.financing.interestRatePct.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="financing.lenderFeePct">Lender Fee (%)</Label>
                <Input
                  id="financing.lenderFeePct"
                  type="number"
                  step="0.01"
                  {...register("financing.lenderFeePct", { valueAsNumber: true })}
                  className="mt-1"
                />
                {errors.financing?.lenderFeePct && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.financing.lenderFeePct.message}
                  </p>
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Timeline Section */}
        <AccordionItem value="timeline" className="border rounded-md px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="font-medium">Timeline</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2 pb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="timeline.phases.entitlementMonths">
                    Entitlement (months)
                  </Label>
                  <Input
                    id="timeline.phases.entitlementMonths"
                    type="number"
                    step="1"
                    {...register("timeline.phases.entitlementMonths", {
                      valueAsNumber: true,
                    })}
                    className="mt-1"
                  />
                  {errors.timeline?.phases?.entitlementMonths && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.timeline.phases.entitlementMonths.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="timeline.phases.constructionMonths">
                    Construction (months)
                  </Label>
                  <Input
                    id="timeline.phases.constructionMonths"
                    type="number"
                    step="1"
                    {...register("timeline.phases.constructionMonths", {
                      valueAsNumber: true,
                    })}
                    className="mt-1"
                  />
                  {errors.timeline?.phases?.constructionMonths && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.timeline.phases.constructionMonths.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="timeline.phases.salesLeaseMonths">
                    Sales/Lease-up (months)
                  </Label>
                  <Input
                    id="timeline.phases.salesLeaseMonths"
                    type="number"
                    step="1"
                    {...register("timeline.phases.salesLeaseMonths", {
                      valueAsNumber: true,
                    })}
                    className="mt-1"
                    disabled={autoCalcSalesMonths}
                  />
                  {errors.timeline?.phases?.salesLeaseMonths && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.timeline.phases.salesLeaseMonths.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="timeline.autoCalcSalesMonths"
                  checked={autoCalcSalesMonths}
                  onCheckedChange={(checked) =>
                    setValue("timeline.autoCalcSalesMonths", checked as boolean, {
                      shouldDirty: true,
                    })
                  }
                />
                <Label
                  htmlFor="timeline.autoCalcSalesMonths"
                  className="text-sm font-normal cursor-pointer"
                >
                  Auto-calculate Sales months from absorption
                </Label>
              </div>

              <div className="pt-2 border-t">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Total Duration:</span>{" "}
                  {totalMonths} months
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
