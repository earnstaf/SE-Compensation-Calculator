# Pre-Sales Compensation Calculator

Cross-platform Electron desktop app that calculates a Pre-Sales professional's commission payout on one or more won deals, with pipeline stacking and attainment milestone visualization.

## Tech Stack

- Electron (cross-platform: .exe for Windows, .dmg for macOS)
- Vanilla HTML/CSS/JS (no framework)
- No backend, no database, no auth
- Packaged via Electron Builder
- Auto-updates via electron-updater (GitHub Releases as update source)
- Settings persistence via electron-store (Team, OTE, NARR Quota, NARR Quota Credit, L3/L2 Quota fields)

## Project Structure

```
se-comp-calc/
  main.js              # Electron main process (window, auto-updater, settings IPC)
  preload.js           # Context bridge for settings IPC (load/save)
  index.html           # App shell
  css/
    styles.css         # Layout, theme (crimson/navy/grey), typography
  js/
    calc-engine.js     # Compensation logic (standalone, testable, no DOM)
    ui.js              # Reactive input binding, results rendering, tooltip positioning
    scenarios.js       # Preset scenario definitions + team presets (TEAM_PRESETS, SCENARIOS)
  assets/
    icon.png           # App icon
  .github/
    workflows/
      build.yml        # GitHub Actions: builds win (.exe) + mac (.dmg/.zip) on tag push
  package.json
```

## Architecture

### Security Model

- `nodeIntegration: false`, `contextIsolation: true`, `sandbox: true`
- `webSecurity: true`, `allowRunningInsecureContent: false`
- Preload script exposes `appSettings.load()`/`appSettings.save()` and `pdfExport.generate()` via contextBridge
- IPC settings handler whitelists allowed keys: `team`, `ote`, `narrQuota`, `narrQuotaCredit`, `l3NarrQuota`, `l2NarrQuota`, `l3NarrQuotaCredit`, `l2NarrQuotaCredit`
- PDF export IPC handler (`pdf:generate`) creates hidden BrowserWindow, uses `printToPDF()`
- Navigation blocked (`will-navigate` prevented), new windows denied
- Webview attachment blocked via `web-contents-created` listener

### Auto-Update

- electron-updater checks GitHub Releases on app launch (automatic, silent on no-update)
- Help > "Check for Updates..." menu item for manual checks with user-facing dialogs:
  - Update available: shows platform-specific install/download dialog
  - No update: shows "You're on the latest version" with current version
  - Error: shows "Unable to check for updates" with error details
- `manualUpdateCheck` flag distinguishes manual vs automatic checks (automatic stays silent)
- Windows: Wireshark-style update dialog with Install/Remind/Skip buttons, shows current vs new version
- macOS: Manual download dialog with link to releases page and `xattr -cr` instructions (no code signing)
- Triggered by pushing a git tag matching `v*` (e.g., `v1.1.0`)
- Pre-release tags (`v*-rc.*`) build without becoming "latest" (won't trigger auto-update)
- GitHub Actions workflow builds both platforms and publishes release artifacts

### Settings Persistence

- electron-store saves Team, OTE, NARR Quota, and NARR Quota Credit between sessions
- Stored in OS-appropriate user data directory (e.g., `%APPDATA%` on Windows)
- Settings load on app start via IPC, save reactively on input change
- Deal inputs (IARR, Renewed ARR, CARR, NARR, toggles) reset each session

## Domain Model

### Compensation Structure

OTE splits 80/20: Salary (80%) and OTV (20%). PCR = OTV / NARR Quota. Commission on a deal = NARR Quota Retirement * applicable commission rate.

### Variables

User Profile (user-configurable, persisted between sessions):
- Team: Team preset selector (in header bar, independent of scenarios)
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
- RARR Rate: LATAM (0.10%) and PSA-MSP (0.05%) of Renewed ARR (hidden for other teams)

There is NO always-on uplift. The base rate is just PCR. Uplifts only apply when their conditions are met.

Deal Inputs:
- IARR: Incumbent ARR (expiring contract ARR, zero for new logos)
- Renewed ARR: ARR renewed on new opportunity (zero for new logos)
- CARR: Churned ARR (INFORMATIONAL ONLY, not used in calculation)
- NARR: New module or new logo ARR (labeled "NARR" in UI, was "New Module ARR")
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

### LATAM RARR Commission

```
if team == "LATAM":
    rarr_rate = 0.001  // 0.10%, user-editable
    rarr_commission = Renewed_ARR * rarr_rate
    total_commission = narr_commission + rarr_commission
else:
    total_commission = narr_commission

otv_attainment = total_commission / OTV
```

## Team Presets

Team selector in header bar (independent of scenario selection). Auto-populates uplift rate defaults. User can override manually (changes team display to "Custom"). Teams are alphabetized in the dropdown with Custom at top.

| Team | New Logo Uplift | Multi-Year Uplift | Accelerated PCR | Notes |
|------|----------------|-------------------|-----------------|-------|
| APAC | 0.05% | 0.05% | 0.25% | |
| EMEA | 0.045% | 0.045% | 0.20% | M1 values (80/20 split) |
| GEE-VE Strategists | 0.025% | 0.025% | 0.15% | 100% NARR, Geo/Segment |
| ISE - EMEA | 0.0225% | 0.0225% | 0.0725% | |
| ISE - MM/Commercial | 0.025% | 0.025% | 0.075% | |
| ISE - PubSec | 0.050% | N/A (0%) | 0.075% | Multi-Year toggle disabled |
| Japan | 0.05% | 0.05% | 0.25% | |
| LATAM | 0.05% | 0.05% | 0.25% | +RARR commission (0.10%) |
| MM/Commercial | 0.05% | 0.05% | 0.25% | |
| PSA - GSI & SPA | 0.045% | 0.045% | 0.20% | Dual-measure (70/30), Named Accounts / Geo SPAs |
| PSA - Hybrid | 0.045% | 0.045% | 0.20% | Dual-measure (70/30), Primary Named / Secondary Assignment |
| PSA - MSP | 0.05% (MSP NARR) | 0.05% | 0.25% | +RARR commission (0.05%), NL="MSP NARR" |
| US & Canada (excl Fed) | 0.045% | 0.045% | 0.20% | M1 values (80/20 split) |
| US PubSec | 0.10% | N/A (0%) | 0.25% | Multi-Year toggle disabled |

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
- Team selector in header bar, independent of scenarios. Scenarios do NOT override team selection.
- Team selector populates uplift defaults; manual edits revert team to "Custom."
- Results panel conditionally shows accelerated split lines only when the deal crosses 100%.
- Results panel shows CARR as an informational line item, clearly labeled as not used in calculation.
- Rate breakdown labels show additive components (e.g., "PCR + New Logo + Multi-Year").
- LATAM RARR commission shown as separate line when applicable.
- Four scenario preset buttons auto-populate deal fields only (not team/profile).
- Clear/Reset zeroes deal fields and resets uplift rates to team defaults.
- Currency inputs display with $ and comma formatting.
- Info icon (i) tooltips on every input field, positioned with JS (`position: fixed`) to avoid overflow clipping. Tooltips flip below trigger when near top edge.
- Window resizable, minimum size accommodates all fields without scrolling.
- PubSec teams disable and gray out Multi-Year toggle (N/A).
- PSA teams have confirmed uplift values (no more "pending" note).
- PSA-MSP: "New Logo" toggle relabeled to "MSP NARR".
- Color scheme: crimson/navy/grey (matches Tanium brand colors).
- Section labeled "User Profile" (not "SE Profile").
- Help > Check for Updates menu item triggers manual update check with user feedback dialogs.
- Help > About menu shows version and author (Eric Arnst).

## Uplift Rate Display

Uplift rate input fields (New Logo, Multi-Year, Accelerated PCR, RARR) display values as percentages (e.g., `0.05%`) rather than raw decimals (`0.0005`). Team presets populate fields using `formatRateAsPercent()`. `parseRate()` detects the `%` suffix and divides by 100 to convert back to decimal for calculations. Both formats are accepted as user input. Reset defaults use percentage strings. `checkTeamModified()` still correctly compares parsed values against preset decimals.

## Code Conventions

- Calculation logic isolated in calc-engine.js with no DOM dependencies. Pure input/output.
- No placeholder or stub implementations. Every feature must be functional.
- Minimal comments, only where logic is non-obvious.
- Prefer simplicity over abstraction.

## Export Features

### Copy to Clipboard
- Copy button (clipboard icon) in results panel header copies plain-text summary
- "Copied!" toast fades after 1.5 seconds
- "Hide Sensitive Data" checkbox obfuscates OTE, Salary, OTV, PCR, and OTV Attainment in output (shows `[hidden]`)
- Output mirrors results panel: User Profile → Deal Details → Results
- Supports single-measure, dual-measure, LATAM/PSA-MSP RARR, accelerator splits
- Uses `navigator.clipboard.writeText()` (standard Web API, works in sandbox)

### PDF Export
- Export PDF button (document icon) in results panel header
- Single-page PDF via Electron's `webContents.printToPDF()` — no external PDF library
- Crimson/navy color scheme matching the app
- IPC: renderer sends HTML string → main.js creates hidden BrowserWindow → loads via data URI → printToPDF → save dialog → write file
- Footer shows app version; version passed via `_appVersion` in `settings:load` response
- Respects "Hide Sensitive Data" checkbox state

### Both Export Types in Comparison Mode
- Include Deal A, Deal B, and Comparison summary sections
- Profile section shown once (shared between deals)

## Deal Comparison Mode

- "Compare Deals" toggle in header bar, near scenario presets
- When active: Deal Details becomes "Deal A", Deal B section appears below
- Results panel splits into two-column grid (Deal A / Deal B) with comparison summary
- Both deals use the SAME User Profile (OTE, quota, uplift rates, quota credit)
- Deals are independent what-if calculations — Deal B does NOT inherit Deal A's quota retirement
- Dual-measure: each deal has its own L3 region toggle
- Comparison summary shows: Commission Delta, NARR Retirement Delta, Post-Deal Attainment Delta
- Green text for higher-value deal, red for lower, muted for even
- Scenario presets populate Deal A only
- Reset button exits comparison mode and clears Deal B
- No persistence of Deal B across sessions
- Maximum two deals (not a pipeline tracker)

### Render Architecture
Results rendering refactored into reusable builder functions:
- `buildSingleMeasureHtml(r, inputs)` → HTML string
- `buildDualMeasureHtml(r, inputs)` → HTML string
- `renderResults()` and `renderDualMeasureResults()` are thin wrappers
- Comparison mode uses the same builders for each column

## Multi-Deal Pipeline Stacking

Inline feature within the Deal Calculator (not a separate mode/tab). Users can model a sequence of expected deals with cumulative attainment carry-forward.

### UI

- "+ Add a Deal" button below Deal Details (always visible in deal mode)
- Deal 1 shows an editable Opportunity Name field in pipeline mode (hidden in single-deal mode, resets to "Deal 1" on exit)
- Each additional deal is a full-size copy of Deal Details with: Opportunity Name text field, IARR, Renewed ARR, CARR, NARR, New Logo toggle, Multi-Year toggle, L3 Region toggle (dual-measure)
- Deal boxes have action buttons: move up/down, duplicate, remove (X)
- "Clear All Deals" button appears when 2+ deals exist
- When only one deal exists, app looks and behaves exactly as before

### Calculation Logic

Deals processed sequentially top-to-bottom. Each deal's NARR Quota Retirement carries forward as quota credit for the next deal. Reuses existing `calculateCompensation()` / `calculateDualMeasureCompensation()` with no new calc-engine logic.

```
running_credit = NARR_Quota_Credit (from profile)
for each deal:
    result = calculateCompensation({...profile, narrQuotaCredit: running_credit, ...deal_inputs})
    running_credit += result.narrQuotaRetirement
```

For dual-measure pipeline: L3 and L2 running credits are tracked independently. A deal with "Deal is within L3" toggled off only advances L2 running credit — L3 running credit stays unchanged for subsequent deals. The `result.dealInL3` flag controls this.

### Per-Deal Inline Results

Each dynamic deal box shows: NARR Retired, Commission, Attainment (pre → post) below its inputs. For dual-measure teams, shows both L3 and L2 attainment lines with dynamic measure labels.

### Commission Breakdown (Pipeline)

When 2+ deals: summary table (#, Name, NARR Retired, Commission, Attainment Pre→Post), pipeline totals, cumulative attainment bar with per-deal color-coded segments. Deal crossing 100% gets accelerator highlight (⚡ badge). For dual-measure teams, the Attainment column splits into two columns (one per measure) with independent tracking.

### Pipeline Interactions

- Comparison mode and pipeline mode are mutually exclusive
- Scenario presets populate last dynamic deal (or Deal 1 if no dynamic deals)
- Reset exits pipeline mode and clears all deals
- Switching to Annual mode exits pipeline mode
- Deal reordering triggers full recalculation (order affects rates)
- Pipeline data is NOT persisted between sessions

### Pipeline Export

Copy and PDF include: User Profile, per-deal sections (inputs + results), Pipeline Totals. PDF filename: `Pipeline-Breakdown-YYYY-MM-DD.pdf`. "Hide Sensitive Data" applies same redaction rules.

### Dual-Measure Pipeline

Running quota credit tracked independently per measure (L3, L2). Each deal box includes L3 region toggle. Two attainment bars (one per measure) in pipeline results.

## Attainment Milestone Markers

Visual progress bar showing pre-deal and post-deal attainment relative to key thresholds.

### Deal Calculator Bar

Appears in Commission Breakdown for both single-measure (after Quota Attainment rows) and dual-measure (after Deal Metrics, one bar per measure). Two-segment design:
- **Pre-deal segment** in muted color: dark red (`#4a2030`) below 100%, dark green (`#2d5a3a`) at/above 100%
- **Deal increment segment** in bright color: crimson (`#751323`) below 100%, green (`#66bb6a`) at/above 100%
- If deal straddles 100%: increment splits at threshold (crimson below, green above)
- If no deal entered: only the muted pre-deal fill shows current attainment from quota credit
- 100% threshold: prominent 2px vertical line
- Milestone labels at 50%, 75%, 100%, 125%, 150% below the track (100% is bold)
- Tick lines inside the track at each milestone
- Dynamic scale: max(150%, ceil(post-deal / 25) * 25)

### Pipeline Attainment Bar

When multiple deals: each deal gets a distinct color segment from `DEAL_COLORS` palette. Cumulative bar shows which deal pushed past each milestone. Deal crossing 100% has its segment split at the threshold.

### Dual-Measure Bars

Two bars per calculation (one per measure), each with independent 100% thresholds. Each measure independently flips from red to green based on its own post-deal attainment.

### Annual Projections Bar

Replaced old `buildAttainmentBar()` with new `buildDealAttainmentBar()`. Single segment from 0 to target attainment, colored crimson below 100% or green at/above 100%. For dual-measure: two bars.

### Technical

- Pure CSS/HTML, no charting library
- `buildDealAttainmentBar({ segments, title })` — generic builder accepting array of `{ startPct, endPct, color, label }`
- `buildAttainmentSegments(prePct, postPct, hasDealNarr)` — shared helper for pre-deal + deal increment logic
- `buildSingleDealSegments(r)` / `buildMeasureBarSegments(measure)` — thin wrappers calling `buildAttainmentSegments`
- `buildPipelineSegments(allResults, baseInputs)` / `buildPipelineSegmentsL2()` — segment builders for pipeline
- `BAR_COLORS` constant: hex colors for inline styles (`preDeal: '#3a4a8a'`, `accent: '#751323'`, `accel: '#66bb6a'`)
- `BAR_COLORS_MUTED` constant: darker shades for pre-deal segments (`belowQuota: '#4a2030'`, `aboveQuota: '#2d5a3a'`)
- Bar rendered inside a bordered card container (`.deal-attainment-bar`) with padding and subtle background
- Labels positioned below the track (not above) to prevent text overlap
- CSS transitions on segment width (200ms ease)
- Legend shows color swatches with labels

### Critical Implementation Notes

- **Inline styles must use hex colors, NOT CSS variables.** Setting `background:var(--name)` in an HTML `style` attribute causes browsers to invalidate the entire style string, making segments invisible (zero width, transparent background). Always use `BAR_COLORS` constants.
- **gh-pages CSP must include `'unsafe-inline'` for `style-src`.** Without it, all inline style attributes are blocked, preventing dynamic positioning and sizing of bar segments.
- **Uplift rate display**: Fields show percentages (e.g., `0.05%`) not raw decimals (`0.0005`). `parseRate()` handles both formats — if the string ends with `%`, divides by 100.
- **Dynamic deal inputs must include `class="has-prefix"`** on currency fields (IARR, Renewed ARR, CARR, NARR) in `createDealBoxHtml`. Without it, text overlaps the `$` prefix (missing 22px left padding).
- **Dynamic deal toggle HTML must match Deal 1's nesting.** The `.toggle-field` class must be on a child `<div>` inside `.field`, NOT on the `.field` itself. Putting `toggle-field` on `.field` makes the label, toggle, and span all flex siblings, breaking alignment.

## Packaging & Distribution

- electron-builder configured for Windows (NSIS installer .exe) and macOS (.dmg + .zip).
- NSIS: one-click install, per-user, no directory selection.
- Artifact filenames do NOT include version (e.g., `Pre-Sales-Compensation-Calculator-Setup.exe`)
- README uses permanent `/releases/latest/download/` URLs — no update needed on each release
- GitHub Actions builds on tag push (`v*`) or manual workflow_dispatch.
- GitHub Releases hosts distributables; electron-updater checks releases for updates.
- Pre-release builds: tag as `v*-rc.*`, mark as prerelease after build, won't affect auto-update
- App icon at `assets/icon.png`.
- `asar: true`, `compression: maximum`.
- Repo is public at github.com/earnstaf/SE-Compensation-Calculator.

### TODO: macOS Distribution
- Add hardenedRuntime, entitlements, and code signing configuration before shipping macOS builds.
- Without code signing, macOS users must run `xattr -cr` to bypass Gatekeeper.

### TODO: Code Signing
- Windows: Consider SSL.com or SignPath.io for EV/OV code signing certificate to eliminate SmartScreen warnings.
- macOS: Apple Developer ID ($99/year) required for notarization. Without it, users get "damaged and can't be opened" error.

## Dual-Measure Support

Teams with quota splits use two PCRs derived from the same OTV:
- Primary PCR = (OTV * primarySplit) / Primary NARR Quota (higher rate, lower quota)
- Secondary PCR = (OTV * secondarySplit) / Secondary NARR Quota (lower rate, higher quota)

Each measure has its own New Logo, Multi-Year, and Accelerated PCR uplift values. Primary Accelerated PCR + Secondary Accelerated PCR = total Accelerated PCR by design.

A deal-level toggle controls payout scope (label is dynamic per team):
- On (primary deal): The deal earns commission on BOTH measures. Primary NARR rolls up to secondary, so the same deal_narr is run through the commission formula twice (once with primary rates/quota/attainment, once with secondary), and both payouts are summed.
- Off (secondary-only deal): The deal earns commission on secondary only. Single payout.

Primary and secondary attainment thresholds are independent. A deal can cross 100% on one measure but not the other.

### Dual-Measure Teams

| Team | Split | Primary Label | Secondary Label |
|------|-------|---------------|-----------------|
| US & Canada (excl Fed) | 80/20 | L3 (Regional) | L2 (Geo) |
| EMEA | 80/20 | L3 (Regional) | L2 (Geo) |
| ISE - EMEA | 80/20 | L3 (Regional) | L2 (Geo) |
| PSA - GSI & SPA | 70/30 | Named Accounts Partner NARR | Geo-based SPAs Partner NARR |
| PSA - Hybrid | 70/30 | Primary Named Account | Secondary Assignment |

Measure labels are dynamic per team preset. The dual-measure system supports arbitrary label text so it can accommodate any future team naming conventions.

### Dual-Measure Toggle Behavior

- Preset dual-measure teams: toggle is auto-enabled and locked on
- Custom team: toggle is unlockable, user controls it; custom label and split ratio fields appear
- Single-measure preset teams: toggle is hidden

### Dual-Measure Uplift Presets

| Team | M1 NL | M1 MY | M1 Accel | M2 NL | M2 MY | M2 Accel |
|------|-------|-------|---------|-------|-------|---------|
| US & Canada (excl Fed) | 0.045% | 0.045% | 0.20% | 0.005% | 0.005% | 0.05% |
| EMEA | 0.045% | 0.045% | 0.20% | 0.005% | 0.005% | 0.05% |
| ISE - EMEA | 0.0225% | 0.0225% | 0.0725% | 0.0025% | 0.0025% | 0.0025% |
| PSA - GSI & SPA | 0.045% | 0.045% | 0.20% | 0.005% | 0.005% | 0.05% |
| PSA - Hybrid | 0.045% | 0.045% | 0.20% | 0.005% | 0.005% | 0.05% |

### PSA-MSP

Single-measure team (100% Global MSP ARR). Uses "MSP NARR" instead of "New Logo" as the uplift toggle label. Includes RARR bonus commission at 0.05% of Renewed ARR (same mechanic as LaTam at 0.10%, different rate).

### Test Case: Dual-Measure L3 Deal

OTE=200000, L3 NARR Quota=21309600, L2 NARR Quota=67680000, L3 Attainment=10%, L2 Attainment=10%.
L3 PCR = (40000 * 0.80) / 21309600 = ~0.1502%.
L2 PCR = (40000 * 0.20) / 67680000 = ~0.0118%.
For an L3 deal with no uplifts: commission = (deal_narr * L3 PCR) + (deal_narr * L2 PCR).
Both measures pay out independently based on their own attainment levels.

## Annual Projections Calculator

Tab-based mode toggle between "Deal Calculator" (default) and "Annual Projections." User Profile and Uplift Rates are shared between both modes.

### Annual Inputs
- Target NARR Attainment: slider (0-200%) + text input, default 100%
- Deal Mix: New Logo % (default 30%), Multi-Year % (default 20%) — can overlap
- Total Renewed ARR: shown only for LATAM/PSA-MSP teams (for RARR bonus)
- For dual-measure teams: two attainment sliders (one per measure)
- Auto-calculated Total NARR = Quota × Attainment

### Annual Calculation Logic (calc-engine.js)
`calculateAnnualCompensation(inputs)` — splits total NARR into 4 buckets using overlap formula:
- Plain NARR (neither NL nor MY): rate = PCR
- NL-only NARR: rate = PCR + NL Uplift
- MY-only NARR: rate = PCR + MY Uplift
- Both NL+MY NARR: rate = PCR + NL Uplift + MY Uplift
- Overlap = max(0, newLogoPct + multiYearPct - 1)

Bucket percentages are rounded to 10 decimal places via `.toFixed(10)` to eliminate floating-point noise (e.g., `1e-16` → `0`) that would otherwise cascade through NARR × rate multiplications into scientific notation display values.

Each bucket splits at 100% attainment threshold: below at base rate, above at accelerated rate. Proportional distribution across buckets.

`calculateDualMeasureAnnualCompensation(inputs)` — derives PCRs, calls `calculateAnnualCompensation()` twice (per measure), sums results. RARR bonus added at outer level.

### Sensitivity Table
Pre-computed at [50, 75, 100, 110, 120, 150]% attainment. Highlighted row = closest to user's target. For dual-measure: uses same attainment for both measures per row.

### Attainment Progress Bar
Visual bar mapping 0-200% to track width, markers at 50/75/100/125/150%. 100% marker visually emphasized (accelerator threshold).

### Mode Toggle Behavior
- Switching to Annual exits comparison mode if active
- Deal Details section hidden in annual mode; Annual Inputs section hidden in deal mode
- Scenario presets and Compare Deals button hidden in annual mode
- Results title changes: "Annual Projection" vs "Commission Breakdown"
- Reset button exits annual mode and resets annual fields to defaults

### Annual Export
- Copy/PDF include: User Profile, Assumptions (attainment, deal mix), Projection (variable, OTV attainment, total comp), Sensitivity table
- PDF filename: `Annual-Projection-YYYY-MM-DD.pdf`
- "Hide Sensitive Data" redacts same fields as deal mode plus Variable Comp and Total Comp

### Persisted Annual Settings
Keys added to ALLOWED_SETTINGS: `targetAttainment`, `newLogoPct`, `multiYearPct`, `totalRenewedArr`, `l3TargetAttainment`, `l2TargetAttainment`

### Test Cases
- Single-measure at 100% attainment: Variable comp should equal OTV (at PCR only, no uplifts, 0% deal mix)
- Single-measure at 120%: Above-100% buckets appear with accelerated rates
- Deal mix overlap: NL 60% + MY 60% → 20% overlap bucket with both uplifts
- Dual-measure asymmetric: L3 at 120%, L2 at 80% — each evaluates independently

## Web Version (gh-pages)

The `gh-pages` branch hosts a browser-based version at GitHub Pages. It shares all UI, calculation, and rendering code with the Electron version but differs in:

### Settings Persistence
- Uses `js/web-settings.js` (localStorage wrapper via `WebSettings` object) instead of Electron's `electron-store` via IPC
- `saveSettings()` calls `WebSettings.save(data)` (synchronous) instead of `window.appSettings.save(data)` (async IPC)
- `loadSettings()` is synchronous, no `async/await`, no `appVersion` from IPC

### PDF Export
- Uses `html2pdf.js` (v0.10.2 from cdnjs CDN) instead of Electron's `webContents.printToPDF()`
- Creates a temporary DOM container, renders via html2pdf, then removes the container
- CDN script loaded with SRI integrity hash

### index.html Differences
- Includes `<script>` tags for `html2pdf.bundle.min.js` (CDN) and `js/web-settings.js` before the app scripts
- CSP meta tag: `style-src 'self' 'unsafe-inline'` (inline styles required for attainment bars), `script-src 'self' https://cdnjs.cloudflare.com`
- **IMPORTANT**: When syncing `index.html` from master to gh-pages, do NOT overwrite — the gh-pages version has extra script tags that master doesn't need

### Syncing master → gh-pages
When copying `js/ui.js` from master to gh-pages, three adaptations are required:
1. `saveSettings()`: Replace `if (!settingsLoaded || !window.appSettings) return` → `if (!settingsLoaded) return`, and `window.appSettings.save(data)` → `WebSettings.save(data)`
2. `loadSettings()`: Replace `async function loadSettings()` block with synchronous version using `WebSettings.load()` (no `appVersion`, no `await`)
3. PDF export handler: Replace `window.pdfExport.generate(html, prefix)` block with `html2pdf()` pipeline

Other files (css/styles.css, js/calc-engine.js, js/scenarios.js, CLAUDE.md) can be copied directly from master.
