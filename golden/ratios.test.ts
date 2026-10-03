/**
 * Golden test for the ratio engine.
 *
 * Every value here is copied from the ratio table in KEYS.md (Test fixtures),
 * at the precision that table prints. If the engine and the table disagree,
 * the mismatch is reported: neither side is edited to make this pass.
 */
import { describe, expect, it } from 'vitest';
import { loadEngine, readScenario } from './code-repo';

const engine = await loadEngine();

function load(fileName: string) {
  const result = engine.validateScenario(readScenario(fileName));
  if (!result.ok) throw new Error(result.errors.join('\n'));
  return result.scenario;
}

/** [Best Buy, Nvidia], fiscal year ended January 2021. */
const KEY: Record<string, [number, number]> = {
  net_working_capital: [2019, 12130],
  current_ratio: [1.19, 4.09],
  quick_ratio: [0.62, 3.56],
  receivables_turnover: [42.77, 8.16],
  average_collection_period: [8.5, 44.7],
  inventory_turnover: [6.8, 4.48],
  average_age_of_inventory: [53.7, 81.5],
  total_asset_turnover: [2.73, 0.72],
  debt_ratio: [0.759, 0.413],
  debt_to_equity: [3.16, 0.7],
  times_interest_earned: [46.7, 25.0],
  gross_profit_margin: [22.4, 62.3],
  profit_margin: [3.8, 26.0],
  return_on_total_assets: [10.4, 18.8],
  return_on_common_equity: [39.2, 25.6],
  earnings_per_share: [6.93, 7.02],
  book_value_per_share: [17.85, 27.25],
  dividend_payout: [31.8, 9.1],
};

/** Accepted variants: [ratio, definition, Best Buy, Nvidia]. */
const VARIANTS: [string, string, number, number][] = [
  ['debt_ratio', 'interest_bearing_debt', 0.072, 0.242],
  ['times_interest_earned', 'operating_income', 46.0, 24.6],
  ['earnings_per_share', 'period_end_shares', 7.0, 6.99],
];

const NEEDS_SHARE_PRICE = ['price_earnings', 'dividend_yield'];

const COMPANIES = [
  { name: 'Best Buy', fileName: 'best-buy-fy2021.json', column: 0 },
  { name: 'Nvidia', fileName: 'nvidia-fy2021.json', column: 1 },
] as const;

describe.each(COMPANIES)('$name ratios, fiscal 2021', ({ fileName, column }) => {
  const results = engine.computeRatios(load(fileName), 'FY2021');
  const definition = (ratio: string, id = 'key') => {
    const found = results
      .find((result) => result.id === ratio)
      ?.definitions.find((candidate) => candidate.id === id);
    if (found === undefined) throw new Error(`no ${ratio} / ${id}`);
    return found;
  };
  const rounded = (ratio: string, id = 'key'): number | undefined => {
    const found = definition(ratio, id);
    const decimals = results.find((result) => result.id === ratio)?.decimals ?? 0;
    return found.available ? engine.roundTo(found.value, decimals) : undefined;
  };

  it('covers all 20 ratios between the key table and the two that need a share price', () => {
    expect([...Object.keys(KEY), ...NEEDS_SHARE_PRICE].sort()).toEqual(
      results.map((result) => result.id).sort(),
    );
  });

  it.each(Object.entries(KEY))('%s matches KEYS.md', (ratio, expected) => {
    expect(rounded(ratio)).toBe(expected[column]);
  });

  it.each(VARIANTS)('%s on %s matches KEYS.md', (ratio, id, bestBuy, nvidia) => {
    expect(rounded(ratio, id)).toBe(column === 0 ? bestBuy : nvidia);
  });

  it.each(NEEDS_SHARE_PRICE)('%s needs a share price', (ratio) => {
    expect(definition(ratio)).toMatchObject({
      available: false,
      unavailable: { reason: 'missing_input', ids: ['market_price_per_share'] },
    });
  });

  it.each(Object.entries(KEY))('accepts the KEYS.md value of %s as a student answer', (ratio, expected) => {
    const result = results.find((candidate) => candidate.id === ratio);
    if (result === undefined) throw new Error(`no ${ratio}`);
    expect(engine.checkRatioAnswer(result, expected[column]).status).toBe('match');
  });

  it('names the period-end variant when a student computes EPS on period-end shares', () => {
    const result = results.find((candidate) => candidate.id === 'earnings_per_share');
    if (result === undefined) throw new Error('no earnings_per_share');
    const answer = column === 0 ? 7.0 : 6.99;
    expect(engine.checkRatioAnswer(result, answer)).toEqual({
      status: 'match',
      definition: 'period_end_shares',
    });
  });
});

describe('notes under the ratio table in KEYS.md', () => {
  it("Nvidia's quick ratio includes 10,714 of marketable securities", () => {
    const nvidia = load('nvidia-fy2021.json');
    const quick = engine
      .computeRatios(nvidia, 'FY2021')
      .find((result) => result.id === 'quick_ratio')?.definitions[0];
    expect(quick?.available && quick.inputs.map((input) => input.id)).toContain(
      'marketable_securities',
    );
    expect(nvidia.lineItems.find((item) => item.id === 'marketable_securities')?.values.FY2021).toBe(
      10714,
    );
  });

  it('dividends per share are 2.20 for Best Buy (stated) and 0.64 for Nvidia (395 over 617 shares)', () => {
    const fact = (fileName: string, id: string): number | undefined =>
      load(fileName).facts.find((candidate) => candidate.id === id)?.values.FY2021;
    expect(fact('best-buy-fy2021.json', 'dividends_per_share')).toBe(2.2);
    const paid = fact('nvidia-fy2021.json', 'dividends_paid');
    const shares = fact('nvidia-fy2021.json', 'weighted_shares_basic');
    expect(paid).toBe(395);
    expect(shares).toBe(617);
    expect(engine.roundTo(395 / 617, 2)).toBe(0.64);
  });
});
