/**
 * Golden test for the altered fiscal 2022 column of Exhibit 4.
 *
 * The code repo checks the unaltered years only. This test checks the altered
 * column: it balances, and it foots everywhere except the two places listed in
 * KEYS.md (Source errata, rows 5 and 6). If the transcription of the altered
 * column changes, this test is what notices.
 */
import { describe, expect, it } from 'vitest';
import { loadEngine, readScenario } from './code-repo';

const engine = await loadEngine();
const result = engine.validateScenario(readScenario('best-buy-fy2022-altered.json'));
if (!result.ok) throw new Error(result.errors.join('\n'));
const scenario = result.scenario;

describe('Exhibit 4, altered fiscal 2022 column', () => {
  const rows = engine.footingReport(scenario).filter((row) => row.period === 'FY2022A');

  it('is the period the scenario marks as altered', () => {
    expect(scenario.altered?.periods).toEqual(['FY2022A']);
  });

  it('checks every printed total and per-share figure', () => {
    // 7 printed balance sheet totals, 4 income statement totals, 2 EPS figures.
    expect(rows.length).toBe(13);
  });

  it('differs from its own components in exactly two places', () => {
    const differences = rows
      .filter((row) => !row.matches)
      .map((row) => ({ check: row.check, printed: row.printed, computed: row.computed }));
    expect(differences).toEqual([
      // Errata row 5: earnings before tax is printed as 18,343; the components sum to 18,333.
      { check: 'income_before_tax', printed: 18343, computed: 18333 },
      // Errata row 6: basic EPS is printed as 56.50; 14,491 over 256.6 shares is 56.47.
      { check: 'eps_basic', printed: 56.5, computed: 56.47 },
    ]);
  });

  it('balances at 27,292', () => {
    const row = engine.balanceReport(scenario).find((candidate) => candidate.period === 'FY2022A');
    expect(row).toEqual({
      period: 'FY2022A',
      assets: 27292,
      liabilitiesAndEquity: 27292,
      balanced: true,
    });
  });

  it('has retained earnings equal to the year net earnings (errata row 7)', () => {
    const value = (id: string): number | undefined =>
      scenario.lineItems.find((item) => item.id === id)?.values.FY2022A;
    const netIncomePrinted = scenario.totals.find((total) => total.id === 'net_income')?.printed
      ?.FY2022A;
    expect(value('retained_earnings')).toBe(14491);
    expect(netIncomePrinted).toBe(14491);
  });
});
