# Big Simulation Online: keys

Private. This file holds the two sections of the development plan that state expected answers. The rest of the plan is `docs/PLAN.md` in the `big-simulation` repo.

Nothing in this file may be copied into the `big-simulation` repo, which is meant to become public with its full history.

## Test fixtures

These values are the engine's acceptance tests. I computed them from Exhibits 1, 2 and 4 with the Exhibit 5 formulas; they are not copied from the instructor manual, whose ratio tables did not come through as text. Compare them with the manual's tables before treating them as the answer key.

### Ratios, fiscal year ended January 2021 ($ millions except per share)

| Ratio | Best Buy | Nvidia |
| --- | --- | --- |
| Net working capital | 2,019 | 12,130 |
| Current ratio | 1.19 | 4.09 |
| Quick ratio | 0.62 | 3.56 |
| Receivables turnover | 42.77 | 8.16 |
| Average collection period (days) | 8.5 | 44.7 |
| Inventory turnover | 6.80 | 4.48 |
| Average age of inventory (days) | 53.7 | 81.5 |
| Total asset turnover | 2.73 | 0.72 |
| Debt ratio | 0.759 | 0.413 |
| Debt to equity | 3.16 | 0.70 |
| Times interest earned | 46.7 | 25.0 |
| Gross profit margin | 22.4% | 62.3% |
| Profit margin | 3.8% | 26.0% |
| Return on total assets | 10.4% | 18.8% |
| Return on common equity | 39.2% | 25.6% |
| Earnings per share | 6.93 | 7.02 |
| Book value per share | 17.85 | 27.25 |
| Dividend payout | 31.8% | 9.1% |
| Price to earnings | Needs share price | Needs share price |
| Dividend yield | Needs share price | Needs share price |

Accepted variants: debt ratio on interest-bearing debt is 0.072 and 0.242; times interest earned on operating income is 46.0 and 24.6; EPS on period-end shares is 7.00 and 6.99. Dividends per share are 2.20 for Best Buy (stated) and 0.64 for Nvidia (395 paid over 617 weighted shares). Nvidia's quick ratio includes 10,714 of marketable securities.

### Exhibit 4 changes that pass the default materiality test

Thresholds on the fiscal 2021 base are 473 (1% of revenue) and 180 (10% of net earnings). Subtotals are left out.

| Line item | Altered FY2022 | FY2021 | Change | % | Manual finding |
| --- | --- | --- | --- | --- | --- |
| Cash and cash equivalents | 6,500 | 5,494 | +1,006 | +18.3% | 1 |
| Receivables, net | 55 | 1,061 | -1,006 | -94.8% | 1 |
| Merchandise inventories | 12,090 | 5,612 | +6,478 | +115.4% | 2 |
| Fixtures and equipment | 8,000 | 6,333 | +1,667 | +26.3% | 3 |
| Goodwill | 1,200 | 986 | +214 | +21.7% | 4 |
| Accounts payable | 5,051 | 6,979 | -1,928 | -27.6% | 5 |
| Revenue | 53,472 | 47,262 | +6,210 | +13.1% | 6 |
| Cost of sales | 29,013 | 36,689 | -7,676 | -20.9% | 6 |
| Selling, general and administrative | 6,051 | 7,928 | -1,877 | -23.7% | Not in the manual |
| Restructuring charges | 51 | 254 | -203 | -79.9% | Not in the manual |
| Income tax expense | 3,852 | 579 | +3,273 | +565.3% | Not in the manual |
| Net earnings | 14,491 | 1,798 | +12,693 | +706.0% | Not in the manual |
| Retained earnings | 14,491 | 4,233 | +10,258 | +242.3% | Not in the manual |

Goodwill and restructuring pass only the net earnings test. Accumulated depreciation moves by 5 (6,996 to 7,001), which is not material and is exactly the evidence for finding 3: gross property rose 1,553 with almost no added depreciation. On the altered-year base the thresholds become 535 and 1,449; goodwill and restructuring then pass neither test, and cash and receivables pass only the revenue test.

Derived checks for the same exhibit: gross margin jumps from 22.4% to 45.7%; the effective tax rate falls from 24.4% to 21.0%; total assets (27,292) equal liabilities plus equity.

## Source errata

Nine things in the source files do not line up. Each needs a decision before the scenario data and the answer key are frozen in phase 0.

| # | Where | What the file says | What the numbers show | Plan default |
| --- | --- | --- | --- | --- |
| 1 | Instructor manual, finding 1 | Receivables are "higher in a similar amount" | Receivables fall by 1,006, from 1,061 to 55, as factoring would produce | Key reads "lower" |
| 2 | Instructor manual, finding 6 | Possible change from LIFO to FIFO | The Exhibit 4 footnote still states the weighted average method | Key reads "a change away from weighted average with no footnote" |
| 3 | Instructor manual, finding 2 | Inventories "almost double" | They rise 115% | Wording only |
| 4 | Exhibit 4, income statement | Third column is headed February 1, 2020 | It holds the fiscal 2019 figures (revenue 42,879, net earnings 1,464). Fiscal 2020 is absent | Model the column as fiscal 2019 and relabel it |
| 5 | Exhibit 4, earnings before tax | 18,343 | The components sum to 18,333 | Keep the printed figure, exempt it from the footing test, accept it as a bonus finding |
| 6 | Exhibit 4, basic EPS | 56.50 | 14,491 over 256.6 shares is 56.47 | Same treatment as row 5 |
| 7 | Exhibit 4, retained earnings | 14,491 | Identical to the year's net earnings although the opening balance was 4,233, which implies 4,233 of undisclosed distributions | Added as the seventh key finding in `keys/exhibit4-findings.json` |
| 8 | Exhibit 5 | A one-page PDF | It is an image with no text layer; the 20 formulas in this plan were read from the image | Claude Code must view it as an image, not extract text |
| 9 | Project description | "add date" and "Friday Nov 12th" | Placeholders from the Gettysburg course | You supply the open, due and presentation dates per section |

Two more points are intentional in the source and are kept. The Exhibit 4 footnotes still speak as of January 30, 2021, which is the missing-disclosure evidence the Investigator is meant to find. And the instructor manual appears to be part of the public download at the Cupola, so a determined student can find the six findings. Scenario versioning lets you alter Exhibit 4 for your own section if that matters to you.
