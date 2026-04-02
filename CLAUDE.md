# Pre-Sales Compensation Calculator

Cross-platform Electron desktop app that calculates a Pre-Sales professional's commission payout on a single won deal.

## Tech Stack

- Electron (cross-platform: .exe for Windows, .dmg for macOS)
- Vanilla HTML/CSS/JS (no framework)
- No backend, no database, no auth, no network
- Packaged via Electron Builder

## Project Structure

```
se-comp-calc/
  main.js              # Electron main process
  index.html           # App shell
  css/
    styles.css         # Layout, theme, typography
  js/
    calc-engine.js     # Compensation logic (standalone, testable)
    ui.js              # Reactive input binding, results rendering
    scenarios.js       # Preset scenario definitions + team presets
  package.json
```

## Domain Model

### Compensation Structure

OTE splits 80/20: Salary (80%) and OTV (20%). PCR = OTV / NARR Quota. Commission on a deal = NARR Quota Retirement * applicable commission rate.

### Variables

SE Profile (user-configurable):
- Team: Team preset selector (populates uplift defaults, user can override)
- OTE: On-Target Earnings
- Salary: OTE * 0.80 (auto-calculated)
- OTV: OTE * 0.20 (auto-calculated)
- NARR Quota: Annual Net ARR quota target
- PCR: OTV / NARR Quota (auto-calculated)
- NARR Quota Credit: Cumulative NARR retired YTD before this deal
- NARR Quota Attainment: NARR Quota Credit / NARR Quota (auto-calculated)

Uplift Rates (editable, populated by team preset):
- New Logo Uplift: Applied only when New Logo toggle is on (default 0.05%)
- Multi-Year Uplift: Applied only when Multi-Year toggle is on (default 0.05%)
- Accelerated PCR: Applied only to NARR above 100% attainment (default 0.25%)
- RARR Rate: LaTam only, 0.10% of Renewed ARR (hidden for other teams)

There is NO always-on uplift. The base rate is just PCR. Uplifts only apply when their conditions are met.

Deal Inputs:
- IARR: Incumbent ARR (expiring contract ARR, zero for new logos)
- Renewed ARR: ARR renewed on new opportunity (zero for new logos)
- CARR: Churned ARR (INFORMATIONAL ONLY, not used in calculation)
- New Module ARR: New module or new logo ARR
- New Logo: Boolean toggle (is this a new logo deal?)
- Multi-Year: Boolean toggle (is this a 3+ year contract?)

### Derived Values

- Day 1 ARR = Renewed ARR + New Module ARR
- NARR Quota Retirement = Day 1 ARR - IARR
- Post-Deal Attainment = (NARR Quota Credit + NARR Quota Retirement) / NARR Quota

IMPORTANT: CARR is displayed for context but is NOT subtracted in the NARR formula.

## Commission Calculation Logic

This is the core engine. All formulas must live in calc-engine.js as pure functions.

### Rate Construction

```
base_rate = PCR
if new_logo_deal:
    base_rate += New_Logo_Uplift
if multi_year_deal:
    base_rate += Multi_Year_Uplift

accelerated_rate = base_rate + Accelerated_PCR
```

### Attainment Split

When a deal straddles 100% quota attainment, it must be bifurcated.

```
narr_remaining_to_100 = max(0, NARR_Quota - NARR_Quota_Credit)
deal_narr = Day_1_ARR - IARR

if deal_narr <= 0:
    narr_commission = 0

else if NARR_Quota_Credit >= NARR_Quota:
    // Already over 100%. Entire deal at accelerated rate.
    narr_below = 0
    narr_above = deal_narr

else if deal_narr <= narr_remaining_to_100:
    // Does not cross 100%. Entire deal at base rate.
    narr_below = deal_narr
    narr_above = 0

else:
    // Straddles 100%. Split.
    narr_below = narr_remaining_to_100
    narr_above = deal_narr - narr_remaining_to_100

commission_below = narr_below * base_rate
commission_above = narr_above * accelerated_rate
narr_commission = commission_below + commission_above
```

### LaTam RARR Commission

```
if team == "LaTam":
    rarr_rate = 0.001  // 0.10%, user-editable
    rarr_commission = Renewed_ARR * rarr_rate
    total_commission = narr_commission + rarr_commission
else:
    total_commission = narr_commission

otv_attainment = total_commission / OTV
```

## Team Presets

Team selector at top of SE Profile auto-populates uplift rate defaults. User can override manually (changes team display to "Custom").

| Team | New Logo Uplift | Multi-Year Uplift | Accelerated PCR | Notes |
|------|----------------|-------------------|-----------------|-------|
| MM/Commercial | 0.05% | 0.05% | 0.25% | |
| Japan | 0.05% | 0.05% | 0.25% | |
| APAC | 0.05% | 0.05% | 0.25% | |
| US & Canada (excl Fed) | 0.045% | 0.045% | 0.20% | M1 values (80/20 split) |
| EMEA | 0.045% | 0.045% | 0.20% | M1 values (80/20 split) |
| US PubSec | 0.10% | N/A (0%) | 0.25% | Multi-Year toggle disabled |
| LaTam | 0.05% | 0.05% | 0.25% | +RARR commission (0.10%) |
| ISE - MM/Commercial | 0.025% | 0.025% | 0.075% | |
| ISE - EMEA | 0.0225% | 0.0225% | 0.0725% | |
| ISE - PubSec | 0.050% | N/A (0%) | 0.075% | Multi-Year toggle disabled |
| GEE-VE Strategists | 0.025% | 0.025% | 0.15% | 100% NARR, Geo/Segment |
| PSA - GSI & SPA | 0 | 0 | 0 | Pending — user enters manually |
| PSA - MSP | 0 | 0 | 0 | Pending — NL Uplift = "MSP NARR" accelerator |
| PSA - Hybrid | 0 | 0 | 0 | Pending — user enters manually |

## Validation Test Cases

Use these to verify calc-engine.js produces correct results.

### Test 1: Upsell Existing Customer (below 100%, no uplifts)
Inputs: OTE=100000, NARR Quota=10000000, NARR Quota Credit=2000000, IARR=1000000, Renewed ARR=1000000, CARR=0, New Module ARR=125000, New Logo=Off, Multi-Year=Off.
Expected: NARR=$125,000, Rate=PCR=0.20%, Commission=$250.

### Test 2: Upsell with Churn (CARR informational only)
Inputs: OTE=100000, NARR Quota=10000000, NARR Quota Credit=2000000, IARR=1000000, Renewed ARR=900000, CARR=100000, New Module ARR=125000, New Logo=Off, Multi-Year=Off.
Expected: Day 1 ARR=$1,025,000, NARR=$25,000 (CARR is not subtracted), Rate=PCR=0.20%, Commission=$50.

### Test 3: New Logo + Multi-Year (straddles 100%)
Inputs: OTE=100000, NARR Quota=10000000, NARR Quota Credit=9500000, IARR=0, Renewed ARR=0, CARR=0, New Module ARR=1000000, New Logo=On, Multi-Year=On.
Expected: NARR=$1,000,000, split $500K below 100% (rate 0.30%, commission $1,500) and $500K above 100% (rate 0.55%, commission $2,750). Total=$4,250.

### Test 4: New Logo Only (below 100%)
Inputs: OTE=100000, NARR Quota=10000000, NARR Quota Credit=2000000, IARR=0, Renewed ARR=0, CARR=0, New Module ARR=1000000, New Logo=On, Multi-Year=Off.
Expected: NARR=$1,000,000, Rate=0.25% (PCR + New Logo), Commission=$2,500.

### Test 5: Already over 100% before deal
Inputs: OTE=100000, NARR Quota=10000000, NARR Quota Credit=11000000, IARR=0, Renewed ARR=0, CARR=0, New Module ARR=500000, New Logo=On, Multi-Year=On.
Expected: Entire $500K at accelerated rate 0.55% (PCR + NL + MY + Accelerated PCR), Commission=$2,750.

### Test 6: Negative NARR (no commission)
Inputs: OTE=100000, NARR Quota=10000000, NARR Quota Credit=2000000, IARR=1000000, Renewed ARR=800000, CARR=0, New Module ARR=100000, New Logo=Off, Multi-Year=Off.
Expected: Day 1 ARR=$900,000, NARR=-$100,000. Commission=$0.

## UI Behavior

- All derived values update reactively on every input change. No submit button.
- Team selector populates uplift defaults; manual edits revert team to "Custom."
- Results panel conditionally shows accelerated split lines only when the deal crosses 100%.
- Results panel shows CARR as an informational line item, clearly labeled as not used in calculation.
- Rate breakdown labels show additive components (e.g., "PCR + New Logo + Multi-Year").
- LaTam RARR commission shown as separate line when applicable.
- Four scenario preset buttons auto-populate all fields on click.
- Clear/Reset zeroes all fields and resets team to Custom.
- Currency inputs display with $ and comma formatting.
- Info icon (i) tooltips on every input field, positioned with JS to avoid overflow clipping.
- Window resizable, minimum size accommodates all fields without scrolling.
- PubSec teams disable and gray out Multi-Year toggle (N/A).

## Code Conventions

- Calculation logic isolated in calc-engine.js with no DOM dependencies. Pure input/output.
- No placeholder or stub implementations. Every feature must be functional.
- Minimal comments, only where logic is non-obvious.
- Prefer simplicity over abstraction.

## Packaging

- electron-builder configured for Windows (.exe) and macOS (.dmg).
- Zero runtime dependencies. Fully offline.
- No persistent storage. Inputs reset on app close.

### TODO: macOS Distribution
- Add hardenedRuntime, entitlements, and code signing configuration before shipping macOS builds.

## Phase 2: Annual Calculator

DO NOT implement in the deal-level calculator. Recorded for future reference.

### Regional Quota Splits (M1/M2)

Certain teams operate on a dual-measure quota structure where OTV is split across two geographic levels (Region vs. Geo). Each measure has its own uplift rates and accelerator values.

#### Teams with M1/M2 Split:

| Team | M1 Weight | M1 Level | M2 Weight | M2 Level |
|------|-----------|----------|-----------|----------|
| US & Canada (excl Fed) | 80% | L3 NARR | 20% | L2 NARR |
| EMEA | 80% | L3 NARR | 20% | L2 NARR |
| ISE - EMEA | 80% | L3 NARR | 20% | L2 NARR |

#### M1 vs. M2 Uplift Rates:

| Team | M1 NL | M1 MY | M1 Accelerated | M2 NL | M2 MY | M2 Accelerated |
|------|-------|-------|----------------|-------|-------|----------------|
| US & Canada (excl Fed) | 0.045% | 0.045% | 0.20% | 0.005% | 0.005% | 0.05% |
| EMEA | 0.045% | 0.045% | 0.20% | 0.005% | 0.005% | 0.05% |
| ISE - EMEA | 0.0225% | 0.0225% | 0.0725% | 0.0025% | 0.0025% | 0.0025% |

All other teams use a single measure (100% of OTV against one NARR target).

### LaTam Special Case

LaTam uses 100% L4 ARR (not NARR) as its quota measure. The RARR bonus commission (0.10% on Renewed ARR) is implemented in the deal-level calculator. For the annual calculator, the quota basis difference (ARR vs. NARR) will need dedicated handling.

### Annual Calculator Design Implications

- User selects team, which determines whether M1/M2 split applies.
- If split applies, OTV is divided (e.g., 80/20) across two measures, each with its own uplift rates and accelerator.
- Attainment and overachievement are calculated independently per measure.
- Total annual commission = sum of commissions across all measures.
- The deal-level calculator remains unchanged; it always operates on a single deal against a single rate structure.

### PSA Quota Splits

PSA-GSI & SPA and PSA-Hybrid use a 70/30 quota split (70% Named Accounts Partner NARR / 30% Geo-based SPAs Partner NARR for GSI & SPA; 70% Primary Named Account / 30% Secondary Assignment for Hybrid). PSA-MSP uses 100% Global MSP ARR. These splits only matter for the annual calculator.

### GEE-VE Quota

GEE-VE uses 100% NARR based on Geo/Segment mapping. Single measure, no split. Same structure as SE Team 1 for annual calculation purposes.
