# Pre-Sales Compensation Calculator

A desktop application for Pre-Sales professionals to calculate commission payouts on individual won deals. Built with Electron for Windows (.exe) and macOS (.dmg).

No installation required — download the portable executable and run it. No internet connection, accounts, or dependencies needed.

## Download

- **Windows:** Download the `.exe` from the [latest release](../../releases/latest) — portable, no installer needed
- **macOS:** Download the `.dmg` from the [latest release](../../releases/latest)

## What This App Does

Enter your comp plan details and a single deal's financials, and the calculator instantly shows:

- Your commission payout on that deal
- How the deal affects your quota attainment
- The rate breakdown (base vs. accelerated) if the deal straddles 100% attainment
- RARR bonus commission (LATAM teams only)

All calculations update in real-time as you type — no submit button needed.

## Field Reference

### User Profile

These fields define your personal compensation structure. Values come from your comp plan letter and quota assignment.

| Field | Description | Where to Find |
|-------|-------------|---------------|
| **OTE** | On-Target Earnings — your total annual compensation (salary + variable) if quota is fully met | `[TODO: e.g., Xactly > My Compensation > Plan Details]` |
| **Salary** | Fixed base pay — always 80% of OTE *(auto-calculated)* | — |
| **OTV** | On-Target Variable — your commission target, always 20% of OTE *(auto-calculated)* | — |
| **NARR Quota** | Your annual Net ARR quota target — the total NARR you must retire to reach 100% attainment | `[TODO: e.g., Xactly > My Quotas > Current Period]` |
| **PCR** | Per-Commission Rate — base rate earned per dollar of NARR, calculated as OTV / NARR Quota *(auto-calculated)* | — |
| **NARR Quota Credit** | Cumulative NARR retired year-to-date across all prior deals, before this deal | `[TODO: e.g., Xactly > My Credits > YTD Summary]` |
| **NARR Quota Attainment** | Current quota attainment percentage before this deal *(auto-calculated)* | — |

### Team Selector

Located in the header bar. Selecting a team auto-populates the uplift rates with that team's preset values. You can override any value manually — the selector will show the team name to indicate it's still based on that preset.

| Team | New Logo Uplift | Multi-Year Uplift | Accelerated PCR | Notes |
|------|----------------|-------------------|-----------------|-------|
| MM/Commercial | 0.05% | 0.05% | 0.25% | |
| Japan | 0.05% | 0.05% | 0.25% | |
| APAC | 0.05% | 0.05% | 0.25% | |
| US & Canada (excl Fed) | 0.045% | 0.045% | 0.20% | M1 values (80/20 split) |
| EMEA | 0.045% | 0.045% | 0.20% | M1 values (80/20 split) |
| US PubSec | 0.10% | N/A | 0.25% | Multi-Year disabled |
| LATAM | 0.05% | 0.05% | 0.25% | +RARR commission (0.10%) |
| ISE - MM/Commercial | 0.025% | 0.025% | 0.075% | |
| ISE - EMEA | 0.0225% | 0.0225% | 0.0725% | |
| ISE - PubSec | 0.050% | N/A | 0.075% | Multi-Year disabled |
| GEE-VE Strategists | 0.025% | 0.025% | 0.15% | 100% NARR, Geo/Segment |
| PSA - GSI & SPA | Pending | Pending | Pending | Enter values manually |
| PSA - MSP | Pending | Pending | Pending | NL Uplift = "MSP NARR" accelerator |
| PSA - Hybrid | Pending | Pending | Pending | Enter values manually |

### Uplift Rates

These rates modify your commission rate based on deal characteristics. They are auto-populated by the Team selector but can be overridden.

| Field | Description | When It Applies |
|-------|-------------|-----------------|
| **New Logo Uplift** | Additive rate modifier for new logo deals | Only when "New Logo" toggle is on |
| **Multi-Year Uplift** | Additive rate modifier for 3+ year contracts | Only when "Multi-Year" toggle is on |
| **Accelerated PCR** | Additional rate applied to NARR above 100% attainment | Only on the portion of NARR that exceeds quota |
| **RARR Rate** | Bonus commission rate on Renewed ARR (LATAM only) | Only when LATAM team is selected |

There is no always-on uplift. Your base commission rate is PCR alone. Uplifts stack additively when their conditions are met.

### Deal Details

These fields describe the specific deal you're calculating commission on.

| Field | Description | Where to Find |
|-------|-------------|---------------|
| **IARR** | Incumbent ARR — the ARR on the customer's expiring contract. Zero for new logos. | `[TODO: e.g., SFDC Opportunity > Incumbent ARR field]` |
| **Renewed ARR** | ARR being renewed on the new opportunity. The portion of IARR that carries over. Zero for new logos. | `[TODO: e.g., SFDC Opportunity > Renewed ARR field]` |
| **CARR** | Churned ARR — module/license churn from the expiring contract. **Informational only — not used in commission calculation.** | `[TODO: e.g., SFDC Opportunity > Churned ARR field]` |
| **NARR** | Net new ARR on this deal — new modules or new logo ARR | `[TODO: e.g., SFDC Opportunity > New Module ARR field]` |
| **New Logo** | Toggle on if this is a new customer with no existing contract | Deal context |
| **Multi-Year** | Toggle on if the contract term is 3+ years | Deal context |

### Commission Breakdown (Results Panel)

The right side of the app shows the calculated commission with full transparency into how it was derived:

- **Day 1 ARR** — Renewed ARR + NARR
- **NARR Quota Retirement** — Day 1 ARR - IARR (the net new value this deal contributes to quota)
- **Pre/Post-Deal Attainment** — Your quota attainment before and after this deal
- **Base Commission Rate** — PCR plus any applicable uplifts, with a label showing the components (e.g., "PCR + New Logo + Multi-Year")
- **Accelerated Rate** — Shown only when the deal crosses 100% attainment, with the split between below-100% and above-100% portions
- **RARR Commission** — Shown only for LATAM team when Renewed ARR > 0
- **Total Deal Commission** — Your total payout on this deal

## Scenario Presets

Four built-in scenarios are available in the header bar to quickly populate deal fields for common situations. The Team selector is independent — scenarios do not change your team or uplift rates.

| Scenario | What It Demonstrates |
|----------|---------------------|
| **Upsell Existing** | Upsell to existing customer, no churn, below 100% attainment |
| **Upsell with Churn** | Upsell with module churn — shows that CARR is informational only |
| **New Logo + Multi-Year** | New logo deal that straddles 100% attainment, triggering accelerated rates |
| **New Logo Only** | New logo below 100% — shows New Logo Uplift in isolation |

## How Commission Is Calculated

### Rate Construction

```
base_rate = PCR
if new_logo:  base_rate += New Logo Uplift
if multi_year: base_rate += Multi-Year Uplift

accelerated_rate = base_rate + Accelerated PCR
```

### Attainment Split

When a deal straddles 100% quota attainment, the NARR is split:

- **Below 100%:** Portion of NARR that brings you up to 100%, paid at `base_rate`
- **Above 100%:** Remaining NARR beyond 100%, paid at `accelerated_rate`

If you're already above 100% before the deal, the entire deal pays at the accelerated rate.

### LATAM RARR Bonus

LATAM teams receive an additional commission of `RARR Rate × Renewed ARR`, paid on top of the standard NARR-based commission.

## FAQ

**Q: Why doesn't CARR affect my commission?**
CARR (Churned ARR) is displayed for context but is intentionally excluded from the NARR calculation. Your commission is based on Day 1 ARR minus IARR, not net of churn.

**Q: Why is Multi-Year grayed out for my team?**
US PubSec and ISE - PubSec teams have no Multi-Year Uplift in their comp plan, so the toggle is disabled.

**Q: What does "Pending" mean for PSA teams?**
PSA uplift values have not been finalized. Select your PSA team and enter the uplift values manually based on your comp plan letter.

**Q: My team uses an M1/M2 quota split. Which values should I use?**
This calculator operates on a single deal against a single measure. Use your M1 (primary measure) uplift values, which are the defaults for US & Canada, EMEA, and ISE - EMEA teams. An annual calculator with full M1/M2 support is planned for a future release.

**Q: Does the app store any data?**
No. All inputs reset when you close the app. Nothing is saved to disk or transmitted over the network.
