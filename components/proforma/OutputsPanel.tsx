"use client";

import { useState } from "react";
import type { ProFormaOutputs } from "@/lib/proforma/types";
import {
  formatCAD,
  formatPercent,
  formatDelta,
  formatPercentDelta,
  formatPhase,
  getPhaseColor,
} from "@/lib/utils/formatting";
import { computeDelta } from "@/lib/proforma/compute";
import { cn } from "@/lib/cn";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronDown, Info } from "lucide-react";

type OutputsPanelProps = {
  baseOutputs: ProFormaOutputs;
  scenarioOutputs: ProFormaOutputs;
};

export function OutputsPanel({
  baseOutputs,
  scenarioOutputs,
}: OutputsPanelProps) {
  const [showAllMonths, setShowAllMonths] = useState(false);

  // Compute deltas
  const profitDelta = computeDelta(
    baseOutputs.totals.profit,
    scenarioOutputs.totals.profit
  );
  const marginDelta = computeDelta(
    baseOutputs.totals.profitMarginPct,
    scenarioOutputs.totals.profitMarginPct
  );
  const peakEquityDelta = computeDelta(
    baseOutputs.totals.equityNeededPeak,
    scenarioOutputs.totals.equityNeededPeak
  );

  const profitValue = scenarioOutputs.totals.profit;
  const isProfitPositive = profitValue !== null && profitValue > 0;
  const isProfitNegative = profitValue !== null && profitValue < 0;

  const monthlyRows = scenarioOutputs.monthly.rows;
  const displayRows = showAllMonths
    ? monthlyRows
    : monthlyRows.slice(0, 24);

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg">Outputs</h3>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Net Revenue */}
        <KPICard
          label="Net Revenue"
          value={formatCAD(scenarioOutputs.revenue.netRevenue)}
          tooltip="Gross revenue minus sales commission"
        />

        {/* Total Cost */}
        <KPICard
          label="Total Cost"
          value={formatCAD(scenarioOutputs.totals.totalCost)}
          tooltip="All costs including financing (land, hard, soft, contingency, dev fee, interest, lender fee)"
        />

        {/* Profit */}
        <KPICard
          label="Profit"
          value={formatCAD(scenarioOutputs.totals.profit)}
          valueClassName={cn(
            isProfitPositive && "text-green-600",
            isProfitNegative && "text-red-600"
          )}
          tooltip="Net revenue minus total cost"
        />

        {/* Profit Margin */}
        <KPICard
          label="Profit Margin"
          value={formatPercent(scenarioOutputs.totals.profitMarginPct)}
          tooltip="Profit as percentage of net revenue"
        />

        {/* Peak Equity Needed */}
        <KPICard
          label="Peak Equity Needed"
          value={formatCAD(scenarioOutputs.totals.equityNeededPeak)}
          tooltip="Maximum equity invested at any point in the project timeline"
        />

        {/* Equity Multiple */}
        <KPICard
          label="Equity Multiple"
          value={
            scenarioOutputs.totals.equityMultiple !== null
              ? scenarioOutputs.totals.equityMultiple.toFixed(2) + "x"
              : "—"
          }
          tooltip="Total cash returned divided by total equity invested"
        />

        {/* Equity IRR */}
        <KPICard
          label="Equity IRR"
          value={formatPercent(scenarioOutputs.totals.equityIrrPct)}
          tooltip="Annualized internal rate of return on equity cashflows"
        />

        {/* ROI */}
        <KPICard
          label="ROI"
          value={formatPercent(scenarioOutputs.totals.roiPct)}
          tooltip="Profit divided by total equity invested"
        />
      </div>

      {/* Delta Strip */}
      <div className="border rounded-md p-4 bg-gray-50">
        <h4 className="text-sm font-medium mb-3">Scenario Impact</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <DeltaItem label="Profit Δ" value={formatDelta(profitDelta)} />
          <DeltaItem
            label="Margin Δ"
            value={formatPercentDelta(marginDelta)}
          />
          <DeltaItem label="Peak Equity Δ" value={formatDelta(peakEquityDelta)} />
        </div>
      </div>

      {/* Monthly Breakdown */}
      {monthlyRows.length > 0 && (
        <Collapsible>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 border rounded-md hover:bg-gray-50">
            <span className="font-medium">
              Monthly Cashflow Breakdown ({monthlyRows.length} months)
            </span>
            <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-2 border rounded-md overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Month</TableHead>
                    <TableHead>Phase</TableHead>
                    <TableHead className="text-right">Land</TableHead>
                    <TableHead className="text-right">Soft</TableHead>
                    <TableHead className="text-right">Hard</TableHead>
                    <TableHead className="text-right">Interest</TableHead>
                    <TableHead className="text-right">Loan Draw</TableHead>
                    <TableHead className="text-right">Equity</TableHead>
                    <TableHead className="text-right">Sales Revenue</TableHead>
                    <TableHead className="text-right">Debt Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayRows.map((row) => (
                    <TableRow key={row.monthIndex}>
                      <TableCell className="font-medium">
                        {row.monthIndex}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-block px-2 py-0.5 text-xs rounded-full",
                            getPhaseColor(row.phase)
                          )}
                        >
                          {formatPhase(row.phase)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {row.land > 0 ? formatCAD(row.land) : "—"}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {row.soft > 0 ? formatCAD(row.soft) : "—"}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {row.hard > 0 ? formatCAD(row.hard) : "—"}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {row.interest > 0 ? formatCAD(row.interest) : "—"}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {row.loanDraw > 0 ? formatCAD(row.loanDraw) : "—"}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right text-sm font-medium",
                          row.equity < 0 && "text-red-600",
                          row.equity > 0 && "text-green-600"
                        )}
                      >
                        {formatCAD(row.equity)}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {row.salesRevenue > 0 ? formatCAD(row.salesRevenue) : "—"}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {formatCAD(row.debtOutstanding)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {monthlyRows.length > 24 && (
              <div className="mt-2 flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAllMonths(!showAllMonths)}
                >
                  {showAllMonths
                    ? "Show first 24 months"
                    : `Show all ${monthlyRows.length} months`}
                </Button>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}

function KPICard({
  label,
  value,
  valueClassName,
  tooltip,
}: {
  label: string;
  value: string;
  valueClassName?: string;
  tooltip?: string;
}) {
  return (
    <div className="border rounded-md p-4">
      <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
        <span>{label}</span>
        {tooltip && (
          <span className="group relative">
            <Info className="h-3 w-3 text-gray-400" />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 text-xs bg-gray-900 text-white rounded shadow-lg z-10">
              {tooltip}
            </span>
          </span>
        )}
      </div>
      <div className={cn("text-2xl font-semibold", valueClassName)}>
        {value}
      </div>
    </div>
  );
}

function DeltaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
