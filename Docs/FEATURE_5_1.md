# Feature 05.1 — Pro Forma / Scenario Planning (Phase 1 Upgrade)

## Objective
Upgrade the existing **Pro Forma** page from a “single-sheet feasibility calculator” to a **minimal developer-grade Phase 1 model** with:

- **Two top-level toggles**
  - **Asset Type:** `Townhome` | `Multifamily`
  - **Monetization:** `For-Sale` | `For-Rent` (Phase 1: UI + partial model plumbing; core calculations remain For-Sale only until Phase 2)
- Replace single **Total Duration** with **3 phase durations**:
  - Entitlement months
  - Construction months
  - Sales / Lease-up months
  - (Total auto-sum; scenario delta applies to Total and allocates to phases)
- Add **For-Sale absorption input** (units/month) and use it to compute **sales period** if user wants auto.
- Add a **basic monthly cashflow engine** (MVP): monthly cost spread, debt draws to LTC, monthly interest accrual.
- Add return metrics:
  - **Equity Multiple**
  - **Levered IRR (Equity IRR)** (monthly cashflow-based)
- Keep existing Save/Revert + scenario sliders; adjust sliders to work with the new model.

Phase 2 (FOR-RENT NOI/cap rate/permanent debt, deposits, detailed curves, residual land) is explicitly out of scope.

---

## Part A — Data Model (Supabase)

### A1) Table: `project_proformas` (existing)
Keep existing table. Continue to persist a single pro forma per project as JSON.

No schema change required.

### A2) Backward compatibility / migrations
Existing `assumptions` JSON objects must load successfully.
- If legacy `timeline.totalMonths` exists, map to:
  - `timeline.phases.entitlementMonths = round(totalMonths * 0.25)`
  - `timeline.phases.constructionMonths = round(totalMonths * 0.60)`
  - `timeline.phases.salesLeaseMonths = totalMonths - entitlement - construction`
- If missing new fields, fill from defaults.

---

## Part B — Assumptions Schema (Phase 1)

### B1) Canonical TypeScript type
Update `lib/proforma/types.ts`.

```ts
export type AssetType = 'TOWNHOME' | 'MULTIFAMILY';
export type Monetization = 'FOR_SALE' | 'FOR_RENT';

export type ProFormaAssumptions = {
  meta: {
    assetType: AssetType;
    monetization: Monetization; // Phase 1: FOR_SALE is fully calculated; FOR_RENT is gated/placeholder.
  };

  // Program
  program: {
    units: number | null;

    // For-sale modeling basis (Phase 1): use as revenue/cost basis.
    saleableAreaSqft: number | null;

    // Multifamily realism (Phase 1): optional; used only for validation + future expansion
    netToGrossPct: number | null; // e.g., 80 means 80%
  };

  // Acquisition
  acquisition: {
    landPrice: number | null;       // CAD
    closingCostsPct: number | null; // % of land price
  };

  // Revenue — FOR SALE (Phase 1)
  revenueSale: {
    salePricePerSqft: number | null;   // CAD/sqft
    otherRevenue: number | null;       // CAD
    salesCommissionPct: number | null; // % of gross revenue
  };

  // Revenue — FOR RENT (Phase 1 placeholder fields only; UI gated)
  revenueRent: {
    avgRentPerUnitMonthly: number | null; // optional placeholder (not used in Phase 1 calcs)
    vacancyPct: number | null;            // optional placeholder
  };

  // Costs
  costs: {
    hardCostPerSqft: number | null;     // CAD/sqft
    softCostPctOfHard: number | null;   // % of hard
    contingencyPctOfHard: number | null;
    contingencyPctOfSoft: number | null;
    devFeePctOfCost: number | null;     // % of (land + hard + soft + contingency) (still ok for MVP)
  };

  // Financing (Phase 1: construction debt with monthly interest accrual)
  financing: {
    loanToCostPct: number | null;     // % LTC cap
    interestRatePct: number | null;   // annual %
    lenderFeePct: number | null;      // % of loan amount (one-time)
  };

  // Timeline (Phase 1: 3 phases; total auto-sum)
  timeline: {
    phases: {
      entitlementMonths: number | null;
      constructionMonths: number | null;
      salesLeaseMonths: number | null;
    };
    // derived total displayed in UI; persisted for clarity but always recomputed on save
    totalMonths: number | null;
    // optional: if true, auto-calc salesLeaseMonths from absorption
    autoCalcSalesMonths: boolean;
  };

  // For-sale absorption (Phase 1)
  absorption: {
    unitsPerMonth: number | null; // used to auto compute salesLeaseMonths if enabled
  };

  // Scenario sliders (UI-only; persist if user saves)
  scenario: {
    deltaSalePricePerSqftPct: number; // -10..+10
    deltaHardCostPerSqftPct: number;  // -10..+10
    deltaInterestRatePct: number;     // -2..+2 (absolute points)
    deltaTotalMonths: number;         // -6..+6 months
  };
};
B2) Defaults
Update lib/proforma/defaults.ts:

meta.assetType = 'TOWNHOME'

meta.monetization = 'FOR_SALE'

program.netToGrossPct = 80 (optional default; can be null if you prefer strict)

timeline.phases = { entitlement: 6, construction: 18, salesLease: 6 } (or nulls)

timeline.autoCalcSalesMonths = true

absorption.unitsPerMonth = 4 (or null)

Scenario defaults remain 0.

B3) Validation (Zod)
Update lib/proforma/validation.ts:

assetType enum

monetization enum

saleableAreaSqft: 1..5_000_000 (nullable)

netToGrossPct: 30..95 (nullable)

Phase months:

each: 0..120 (nullable)

total computed must be 1..240 when all present

unitsPerMonth: 0.1..500 (nullable)

Financing:

loanToCostPct: 0..95

interestRatePct: 0..30

lenderFeePct: 0..10

Remove interestCoverageFactor completely (deprecated):

If legacy data includes it, ignore it on load/save.

Part C — Calculation Engine (Phase 1)
C0) Overview
Phase 1 compute engine upgrades from “lump-sum interest approximation” to monthly cashflow with:

monthly cost spreads (simple even spread per phase)

monthly debt draws to LTC based on costs-to-date

monthly interest on outstanding balance

equity cashflows → equity IRR and equity multiple

FOR_RENT is gated: show “Phase 2” placeholder outputs if monetization = FOR_RENT.

C1) Types
Update lib/proforma/compute.ts.

ts
Copy code
export type MonthlyCashflowRow = {
  monthIndex: number; // 1..N
  phase: 'ENTITLEMENT' | 'CONSTRUCTION' | 'SALES_LEASE' | 'EXIT';

  // Uses
  land: number;
  soft: number;
  hard: number;
  contingency: number;
  devFee: number;
  carry: number; // optional: 0 in Phase 1 unless you add simple carry later
  lenderFee: number;
  interest: number;

  // Sources
  salesRevenue: number; // Phase 1: for-sale only
  loanDraw: number;
  equity: number;

  // Balances
  debtOutstanding: number;
};

export type ProFormaOutputs = {
  eff: {
    salePricePerSqft: number | null;
    hardCostPerSqft: number | null;
    interestRatePct: number | null;
    totalMonths: number | null;
    entitlementMonths: number | null;
    constructionMonths: number | null;
    salesLeaseMonths: number | null;
  };

  revenue: {
    grossRevenue: number | null;
    salesCommission: number | null;
    netRevenue: number | null;
  };

  costs: {
    landTotal: number | null;
    hard: number | null;
    soft: number | null;
    contingency: number | null;
    devFee: number | null;
    subtotalBeforeFinancing: number | null;
  };

  financing: {
    maxLoanAmount: number | null;
    lenderFee: number | null;
    totalInterest: number | null;
    totalFinancing: number | null;
  };

  totals: {
    totalCost: number | null;
    profit: number | null;
    profitMarginPct: number | null;
    equityNeededPeak: number | null; // NEW: peak equity injected
    equityInvestedTotal: number | null; // sum of equity injections
    equityMultiple: number | null; // based on equity cashflows
    equityIrrPct: number | null; // NEW
    roiPct: number | null; // keep, but define clearly: profit / equityInvestedTotal
  };

  monthly: {
    rows: MonthlyCashflowRow[];
  };

  deltas?: {
    profitDelta: number | null;
    profitMarginDeltaPct: number | null;
    equityNeededDelta: number | null;
  };

  flags: {
    monetizationSupported: boolean; // true only for FOR_SALE in Phase 1
  };
};
C2) Effective inputs after scenario
Same as before, but:

scenario affects:

sale price ($/sf)

hard cost ($/sf)

interest rate

total months (then allocated to phases)

Rules:

Clamp:

eff prices/costs >= 0

eff interest >= 0

eff total months >= 1

C3) Phase months resolution
Inputs:

base phase months: entitlement, construction, salesLease

base totalMonths = sum

scenario deltaTotalMonths applied to total

Algorithm:

Determine base phases:

If phases are all present: use them.

Else if legacy timeline.totalMonths present: use migration mapping.

Else use defaults.

Apply scenario delta to total:

effTotal = baseTotal + deltaTotalMonths (min 1)

Allocate the delta across phases (Phase 1 simple rule):

If delta >= 0: add all delta to salesLeaseMonths

If delta < 0: subtract from salesLeaseMonths first, then from constructionMonths, then entitlementMonths, never below 0.

If timeline.autoCalcSalesMonths is true AND absorption.unitsPerMonth valid:

salesLeaseMonths = ceil(units / unitsPerMonth)

Recompute total = entitlement + construction + salesLease

Apply scenario delta afterward as in steps above (still add/subtract primarily to salesLease)

C4) Deterministic budget totals (same idea, but interest now monthly)
Compute base totals (null-guard dependent):

landTotal = landPrice + landPrice * closingCostsPct

hard = saleableArea * effHardCostPerSqft

soft = hard * softPct

cont = hardcontHard + softcontSoft

subtotalBeforeDevFee = landTotal + hard + soft + cont

devFee = subtotalBeforeDevFee * devFeePct

subtotalBeforeFinancing = subtotalBeforeDevFee + devFee

maxLoanAmount = subtotalBeforeFinancing * LTC

lenderFee = maxLoanAmount * lenderFeePct

Revenue totals (FOR_SALE only):

grossRevenue = saleableArea * effSalePrice + otherRevenue

salesCommission = grossRevenue * salesCommissionPct

netRevenue = grossRevenue - salesCommission

C5) Monthly cashflow engine (MVP)
Generate N months = effTotalMonths.

Phases:

Months 1..E: ENTITLEMENT

Months E+1..E+C: CONSTRUCTION

Remaining up to N: SALES_LEASE

Exit assumed at month N (no separate extra month; keep simple)

Cost spreading rules (Phase 1 simple):

land paid in month 1: landTotal

soft spread:

60% across ENTITLEMENT evenly

40% across first half of CONSTRUCTION evenly

hard spread:

evenly across CONSTRUCTION months

contingency:

spread evenly across CONSTRUCTION months (or 50/50 with late construction; keep simple)

dev fee:

spread evenly across CONSTRUCTION months (or paid at month 1; choose one rule and document)

lenderFee:

paid at first month of CONSTRUCTION (or month 1 if you prefer) — choose: month 1 for simplicity.

Revenue timing (FOR_SALE only, Phase 1):

Allocate netRevenue across SALES_LEASE months based on absorption:

If unitsPerMonth valid:

Compute unit closings per month with a simple ramp:

month1 closings = min(unitsPerMonth, unitsRemaining)

month2.. = same (flat), until units done

Revenue per unit = netRevenue / units

salesRevenue_m = closings_m * revenuePerUnit

Else:

Spread netRevenue evenly across SALES_LEASE months.

Debt draw + interest (Phase 1):
Maintain debtOutstanding month to month.
For each month:

usesBeforeFinancing = land + soft + hard + contingency + devFee + carry

Determine costToDate cumulative of (land+soft+hard+cont+devFee+carry+lenderFee) excluding interest.

debtCapacityToDate = maxLoanAmount * (costToDate / subtotalBeforeFinancing)

Clamp 0..maxLoanAmount

targetDebt = min(debtCapacityToDate, maxLoanAmount)

loanDraw = max(0, targetDebt - prevDebtOutstanding)

Interest:

interest = ((prevDebtOutstanding + (prevDebtOutstanding + loanDraw)) / 2) * (effInterestRatePct/100) / 12

Sources:

salesRevenue (for-sale only)

loanDraw

Equity is the plug:

equity = max(0, (usesBeforeFinancing + lenderFee + interest) - salesRevenue - loanDraw)

If salesRevenue causes surplus in a month:

Set equity negative as a distribution (return of capital / profits):

equity = (uses + lenderFee + interest) - salesRevenue - loanDraw (can be negative)

Update debtOutstanding = prev + loanDraw (no principal paydown in Phase 1; assume repaid implicitly from sales proceeds via equity distribution math)

Keep this simple: do NOT model principal repayment separately; allow negative equity to represent free cash.

Equity metrics:

equityCashflows = array of monthly equity (negative = invest, positive = distribution)

equityInvestedTotal = sum of negative equity absolute values

equityNeededPeak = peak cumulative negative equity balance:

compute cumulative equity balance: cum += equity

peak need = minimum (most negative) of cum, absolute value

Equity Multiple:

sumPositive / sumAbsNegative

Equity IRR:

Use an XIRR-equivalent on monthly dates:

if implementing in TS: compute IRR via numeric root solve on monthly periods.

if you already have an IRR helper, reuse; else implement irrMonthly(cashflows) with Newton/bisection.

Convert to annual:

(1 + irrMonthly) ^ 12 - 1

Profit + margin:

profit = netRevenue - totalCost (still computed from totals)

totalInterest = sum(monthly interest)

totalCost = subtotalBeforeFinancing + lenderFee + totalInterest

ROI definition (Phase 1):

roiPct = profit / equityInvestedTotal * 100 (not peak equity)

Null-guarding:

If required inputs missing for FOR_SALE: return null outputs and empty monthly rows.
Required inputs for full calc:

units, saleableAreaSqft, landPrice, closingCostsPct

salePricePerSqft, salesCommissionPct (otherRevenue can default 0)

hardCostPerSqft, softPct, contingencies, devFee

LTC, interest rate, lender fee

phase months resolved to total >= 1

FOR_RENT gating:

If meta.monetization === 'FOR_RENT':

flags.monetizationSupported = false

Show UI banner “For-Rent modeling comes in Phase 2”

Outputs show — except basic cost totals if you want

Monthly rows can still show costs/debt/interest, but revenue = 0 and profit meaningless (optional)

Phase 1 recommendation: disable compute and show placeholder.

C6) Base vs scenario comparison
Compute two passes:

baseOut with scenario deltas = 0

scenarioOut with deltas applied
Add deltas object:

profitDelta = scenario.profit - base.profit

marginDeltaPct = scenario.margin - base.margin

equityNeededDelta = scenario.equityNeededPeak - base.equityNeededPeak

Part D — Persistence + Data Access
D1) Queries
Keep existing lib/proforma/queries.ts.
Ensure:

on load: normalize legacy fields to new schema

on save: recompute timeline.totalMonths from phases and persist it

D2) Server Actions
Update lib/proforma/actions.ts:

Validate with updated Zod

Strip deprecated fields (interestCoverageFactor if present)

Ensure timeline.totalMonths is consistent before upsert

Upsert into project_proformas

D3) Seeding
When creating a new pro forma row:

If Project Profile has units and area, seed:

program.units

program.saleableAreaSqft

Part E — UI / UX (Phase 1 Upgrade)
E1) Route
Keep app/proforma/page.tsx structure.

E2) Top-level toggles
Add a new panel at top of form:

Asset Type: segmented control

Townhome

Multifamily

Monetization: segmented control

For-Sale

For-Rent (Phase 1: selectable but shows “Phase 2” banner + disables outputs OR disables selection)

Behavior:

If monetization = FOR_RENT:

show inline banner on Outputs panel: “For-Rent modeling comes in Phase 2”

disable scenario sliders and show outputs as — OR keep cost-only compute (choose one; recommended: disable compute to avoid misleading numbers)

E3) Timeline UI changes
Replace “Total Project Duration” input with:

Entitlement months

Construction months

Sales/Lease-up months

Total months (read-only auto-sum)

Add checkbox:

“Auto-calc Sales months from absorption” (default ON)

If ON: Sales/Lease-up months field becomes read-only; derived from ceil(units / unitsPerMonth)

Scenario Duration Delta:

Continues to apply, displayed as “Total Duration Delta”

Internally allocated to phases per Part C3.

E4) Add Absorption section (FOR_SALE only)
Accordion section: Sales

Absorption (units/month)

Helper text: “Used to estimate sellout period when Auto-calc is enabled.”

If monetization != FOR_SALE: hide/disable this section.

E5) Remove Interest Coverage Factor input
Delete from UI entirely.

Delete from schema.

If legacy data exists, ignore silently.

E6) Outputs panel updates
Keep existing KPI cards, but update definitions:

Net Revenue (for-sale only)

Total Cost

Profit

Profit Margin

Peak Equity Needed (replace old Equity Needed)

Equity Multiple (new)

Equity IRR (new)

ROI (keep; define as Profit / Total Equity Invested)

Add small tooltip/info icon per KPI with definition strings (simple inline).

E7) Monthly cashflow table (minimal, collapsible)
Add a collapsible “Monthly Breakdown” section under outputs (default collapsed):

Table columns:

Month

Phase

Hard

Soft

Interest

Loan Draw

Equity

Sales Revenue

Debt Outstanding

Show first 24 months by default with “Show all” toggle if N > 24.

This is a debugging/credibility tool; keep simple styling.

E8) Scenario sliders (unchanged ranges; updated copy)
Sale Price Delta (%): -10..+10

Hard Cost Delta (%): -10..+10

Interest Rate Delta (pp): -2..+2

Duration Delta (months): -6..+6
Reset unchanged.

If monetization != FOR_SALE: disable sliders.

E9) Save / Revert rules
Unchanged, but:

Revert restores all fields including toggles + phases + absorption.

Saving persists scenario deltas too (keep existing behavior for continuity).

Part F — Files to Create / Modify
Create (if missing)
lib/proforma/irr.ts (if you don’t already have an IRR helper)

Modify
lib/proforma/types.ts (new schema)

lib/proforma/defaults.ts

lib/proforma/validation.ts

lib/proforma/compute.ts (monthly engine + IRR/multiple)

lib/proforma/queries.ts (normalize legacy)

lib/proforma/actions.ts (strip deprecated fields, persist total months)

UI:

components/proforma/AssumptionsForm.tsx (add toggles, phases, absorption; remove interestCoverageFactor)

components/proforma/OutputsPanel.tsx (new KPIs + monthly breakdown)

components/proforma/ScenarioControls.tsx (disable when unsupported, update labels)

app/proforma/ProFormaClient.tsx (wire compute twice, deltas, dirty tracking)

No DB migration required.

Part G — Modular Execution Checklist (AI Agent Tasks)
G1) Schema + defaults
Update types with meta, timeline.phases, absorption, remove interestCoverageFactor

Update defaults accordingly

Update Zod validation

G2) Legacy normalization
In query layer: map legacy timeline.totalMonths to phase months

Drop legacy interestCoverageFactor

G3) Compute engine
Implement phase resolution + duration delta allocation

Implement monthly cashflow generation

Implement debt draw + monthly interest

Implement equity cashflows

Add equity multiple + equity IRR

Keep base vs scenario computations and deltas

G4) UI upgrades
Add toggles panel

Replace timeline input with 3-phase + total

Add absorption section and auto-calc toggle

Remove interestCoverageFactor input everywhere

Update outputs panel (Peak Equity, IRR, Multiple, ROI definition)

Add collapsible monthly table

G5) Persistence
Ensure save recomputes totalMonths

Ensure revert resets everything

Ensure scenario deltas persist

G6) QA
Existing projects with saved pro formas still load

Scenario sliders update outputs live

Phase months sum correctly; duration delta applies correctly

Auto-calc sales months updates when units or units/month changes

Peak equity needed behaves reasonably as duration/rate changes

IRR shows — when cashflows are invalid (no sign change or all null)

FOR_RENT shows placeholder and does not mislead

Acceptance Criteria
Pro Forma page supports selecting Asset Type and Monetization.

Timeline uses Entitlement / Construction / Sales-Lease months with auto total.

FOR_SALE includes Absorption (units/month) and can auto-calc sales months.

Model uses a monthly engine (cost spread + debt draw + interest) and outputs:

Net Revenue, Total Cost, Profit, Profit Margin

Peak Equity Needed

Equity Multiple

Equity IRR

ROI (profit / equity invested)

Scenario deltas still work and show impact deltas.

Save/Revert works per project and survives refresh.

FOR_RENT is explicitly gated with a Phase 2 placeholder (no misleading “profit” outputs).