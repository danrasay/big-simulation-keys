/**
 * Golden test for the Exhibit 4 difference view and materiality test.
 *
 * The expected rows are the table "Exhibit 4 changes that pass the default
 * materiality test" in KEYS.md, and the notes under it.
 */
import { describe, expect, it } from 'vitest';
import { loadEngine, readScenario } from './code-repo';

const engine = await loadEngine();
const validation = engine.validateScenario(readScenario('best-buy-fy2022-altered.json'));
if (!validation.ok) throw new Error(validation.errors.join('\n'));
const scenario = validation.scenario;

/** id, altered FY2022, FY2021, change, percent change to one decimal. In statement order. */
const TABLE: [string, number, number, number, number][] = [
  ['cash_and_equivalents', 6500, 5494, 1006, 18.3],
  ['receivables_net', 55, 1061, -1006, -94.8],
  ['inventories', 12090, 5612, 6478, 115.4],
  ['fixtures_and_equipment', 8000, 6333, 1667, 26.3],
  ['goodwill', 1200, 986, 214, 21.7],
  ['accounts_payable', 5051, 6979, -1928, -27.6],
  ['retained_earnings', 14491, 4233, 10258, 242.3],
  ['revenue', 53472, 47262, 6210, 13.1],
  ['cost_of_sales', 29013, 36689, -7676, -20.9],
  ['selling_general_and_administrative', 6051, 7928, -1877, -23.7],
  ['restructuring_charges', 51, 254, -203, -79.9],
  ['income_tax_expense', 3852, 579, 3273, 565.3],
];

describe('Exhibit 4, default materiality (prior year, either test)', () => {
  const report = engine.materialityReport(scenario, 'FY2022A', 'FY2021');
  const row = (id: string) => {
    const found = report.rows.find((candidate) => candidate.id === id);
    if (found === undefined) throw new Error(`no row ${id}`);
    return found;
  };

  it('uses thresholds of 473 and 180 on the fiscal 2021 base', () => {
    expect(report.thresholds.basePeriod).toBe('FY2021');
    expect(report.thresholds.revenue).toBeCloseTo(472.62, 6);
    expect(report.thresholds.netIncome).toBeCloseTo(179.8, 6);
  });

  it('finds exactly the material line items in the KEYS.md table', () => {
    const material = report.rows.filter((r) => r.material && r.kind === 'line').map((r) => r.id);
    expect(material).toEqual(TABLE.map(([id]) => id));
  });

  it.each(TABLE)('%s matches the KEYS.md row', (id, current, prior, change, percent) => {
    const found = row(id);
    expect(found).toMatchObject({ current, prior, change, material: true });
    expect(engine.roundTo(found.percentChange ?? Number.NaN, 1)).toBe(percent);
  });

  it('finds net earnings material: 14,491 against 1,798, up 706.0%', () => {
    const found = row('net_income');
    expect(found).toMatchObject({ current: 14491, prior: 1798, change: 12693, material: true });
    expect(engine.roundTo(found.percentChange ?? Number.NaN, 1)).toBe(706.0);
  });

  it('passes goodwill and restructuring on the net earnings test only', () => {
    for (const id of ['goodwill', 'restructuring_charges']) {
      expect(row(id)).toMatchObject({ passesRevenueTest: false, passesNetIncomeTest: true });
    }
  });

  it('does not find accumulated depreciation material: it moves by 5 while gross property rises 1,553', () => {
    expect(row('accumulated_depreciation')).toMatchObject({
      current: 7001,
      prior: 6996,
      change: 5,
      material: false,
    });
    expect(row('gross_property_and_equipment').change).toBe(1553);
  });
});

describe('Exhibit 4, thresholds on the altered-year base', () => {
  const report = engine.materialityReport(scenario, 'FY2022A', 'FY2021', {
    ...engine.DEFAULT_MATERIALITY,
    base: 'current',
  });
  const row = (id: string) => report.rows.find((candidate) => candidate.id === id);

  it('uses thresholds of 535 and 1,449', () => {
    expect(report.thresholds.basePeriod).toBe('FY2022A');
    expect(report.thresholds.revenue).toBeCloseTo(534.72, 6);
    expect(report.thresholds.netIncome).toBeCloseTo(1449.1, 6);
  });

  it('passes goodwill and restructuring on neither test', () => {
    for (const id of ['goodwill', 'restructuring_charges']) {
      expect(row(id)).toMatchObject({
        passesRevenueTest: false,
        passesNetIncomeTest: false,
        material: false,
      });
    }
  });

  it('passes cash and receivables on the revenue test only', () => {
    for (const id of ['cash_and_equivalents', 'receivables_net']) {
      expect(row(id)).toMatchObject({ passesRevenueTest: true, passesNetIncomeTest: false });
    }
  });
});

describe('Exhibit 4, derived checks', () => {
  const printed = (id: string, period: string): number => {
    const value =
      scenario.lineItems.find((item) => item.id === id)?.values[period] ??
      scenario.totals.find((total) => total.id === id)?.printed?.[period];
    if (value === undefined) throw new Error(`no ${id} for ${period}`);
    return value;
  };
  const margin = (period: string): number =>
    engine.roundTo((printed('gross_profit', period) / printed('revenue', period)) * 100, 1);
  const taxRate = (period: string): number =>
    engine.roundTo(
      (printed('income_tax_expense', period) / printed('income_before_tax', period)) * 100,
      1,
    );

  it('gross margin jumps from 22.4% to 45.7%', () => {
    expect(margin('FY2021')).toBe(22.4);
    expect(margin('FY2022A')).toBe(45.7);
  });

  it('the effective tax rate falls from 24.4% to 21.0%', () => {
    expect(taxRate('FY2021')).toBe(24.4);
    expect(taxRate('FY2022A')).toBe(21.0);
  });
});
