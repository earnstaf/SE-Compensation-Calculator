# SE Compensation Calculator

Cross-platform Electron desktop app that calculates a Solution Engineer's commission payout on a single won deal.

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
    scenarios.js       # Preset scenario definitions
    tooltips.js        # Tooltip content and behavior
  package.json
```

## Domain Model

### Compensation Structure

OTE splits 80/20: Salary (80%) and OTV (20%). PCR = OTV / NARR Quota. Commission on a deal = NARR Quota Retirement * applicable commission rate.

### Variables

SE Profile (user-configurable):
- OTE: On-Target Earnings
- Salary: OTE * 0.80 (auto-calculated)
- OTV: OTE * 0.20 (auto-calculated)
- NARR Quota: Annual Net ARR quota target
- PCR: OTV / NARR Quota (auto-calculated)
- NARR Quota Credit: Cumulative NARR retired YTD before this deal
- NARR Quota Attainment: NARR Quota Credit / NARR Quota (auto-calculated)

Uplift Rates (editable, with defaults):
- NARR Uplift: 0.0005 (always applied)
- New Logo Uplift: 0.0005 (applied when New Logo Deal toggle is on)
- Overachievement Uplift: 0.0025 (applied only to NARR above 100% attainment)

Deal Inputs:
- IARR: Incumbent ARR (expiring contract ARR, zero for new logos)
- Renewed ARR: ARR renewed on new opportunity (zero for new logos)
- CARR: Churned ARR (INFORMATIONAL ONLY, not used in calculation)
- New Module ARR: New module or new logo ARR
- New Logo Deal: Boolean toggle

### Derived Values

- Day 1 ARR = Renewed ARR + New Module ARR
- NARR Quota Retirement = Day 1 ARR - IARR
- Post-Deal Attainment = (NARR Quota Credit + NARR Quota Retirement) / NARR Quota

IMPORTANT: CARR is displayed for context but is NOT subtracted in the NARR formula.

## Commission Calculation Logic

This is the core engine. All formulas must live in calc-engine.js as pure functions.

### Rate Construction

```
base_rate = PCR + NARR_Uplift
if new_logo_deal:
    base_rate += New_Logo_Uplift

overachievement_rate = base_rate + Overachievement_Uplift
```

### Attainment Split

When a deal straddles 100% quota attainment, it must be bifurcated.

```
narr_remaining_to_100 = max(0, NARR_Quota - NARR_Quota_Credit)
deal_narr = Day_1_ARR - IARR

if deal_narr <= 0:
    total_commission = 0

else if NARR_Quota_Credit >= NARR_Quota:
    // Already over 100%. Entire deal at overachievement rate.
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
commission_above = narr_above * overachievement_rate
total_commission = commission_below + commission_above
otv_attainment = total_commission / OTV
```

## Validation Test Cases

Use these to verify calc-engine.js produces correct results.

### Test 1: Renewal + Upsell (below 100%, no New Logo)
Inputs: OTE=100000, NARR Quota=10000000, NARR Quota Credit=2000000, IARR=1000000, Renewed ARR=1000000, CARR=0, New Module ARR=125000, New Logo=No, Uplifts at defaults.
Expected: NARR=125000, Rate=0.0025, Commission=$312.50

### Test 2: Renewal with Churn (CARR informational only)
Inputs: OTE=100000, NARR Quota=10000000, NARR Quota Credit=2000000, IARR=1000000, Renewed ARR=900000, CARR=100000, New Module ARR=125000, New Logo=No, Uplifts at defaults.
Expected: Day 1 ARR=1025000, NARR=25000 (NOT -75000; CARR is not subtracted), Rate=0.0025, Commission=$62.50

### Test 3: New Logo (below 100%)
Inputs: OTE=100000, NARR Quota=10000000, NARR Quota Credit=2000000, IARR=0, Renewed ARR=0, CARR=0, New Module ARR=1000000, New Logo=Yes, Uplifts at defaults.
Expected: NARR=1000000, Rate=0.003, Commission=$3,000

### Test 4: New Logo + Overachievement (straddles 100%)
Inputs: OTE=100000, NARR Quota=10000000, NARR Quota Credit=9500000, IARR=0, Renewed ARR=0, CARR=0, New Module ARR=1000000, New Logo=Yes, Uplifts at defaults.
Expected: NARR=1000000, split $500K below 100% (rate 0.003, commission $1500) and $500K above 100% (rate 0.0055, commission $2750). Total=$4,250.

### Test 5: Already over 100% before deal
Inputs: OTE=100000, NARR Quota=10000000, NARR Quota Credit=11000000, IARR=0, Renewed ARR=0, CARR=0, New Module ARR=500000, New Logo=Yes, Uplifts at defaults.
Expected: Entire $500K at overachievement rate 0.0055, Commission=$2,750.

### Test 6: Negative NARR (no commission)
Inputs: OTE=100000, NARR Quota=10000000, NARR Quota Credit=2000000, IARR=1000000, Renewed ARR=800000, CARR=0, New Module ARR=100000, New Logo=No, Uplifts at defaults.
Expected: Day 1 ARR=900000, NARR=-100000. Commission=$0.

## UI Behavior

- All derived values update reactively on every input change. No submit button.
- Results panel conditionally shows overachievement split lines only when the deal crosses 100%.
- Results panel shows CARR as an informational line item, clearly labeled as not used in calculation.
- Four scenario preset buttons auto-populate all fields on click.
- Clear/Reset zeroes all fields.
- Currency inputs display with $ and comma formatting.
- Info icon (i) tooltips on every input field.
- Window resizable, minimum size accommodates all fields without scrolling.

## Code Conventions

- Calculation logic isolated in calc-engine.js with no DOM dependencies. Pure input/output.
- No placeholder or stub implementations. Every feature must be functional.
- Minimal comments, only where logic is non-obvious.
- Prefer simplicity over abstraction.

## Packaging

- electron-builder configured for Windows (.exe) and macOS (.dmg).
- Zero runtime dependencies. Fully offline.
- No persistent storage. Inputs reset on app close.
