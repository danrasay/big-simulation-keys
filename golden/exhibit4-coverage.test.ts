/**
 * Golden test for the Exhibit 4 findings key (keys/exhibit4-findings.json).
 *
 * The key is the instructor manual's six findings, corrected per the errata,
 * plus the retained earnings anomaly as a seventh.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { loadEngine, readScenario } from './code-repo';

const engine = await loadEngine();
const validation = engine.validateScenario(readScenario('best-buy-fy2022-altered.json'));
if (!validation.ok) throw new Error(validation.errors.join('\n'));
const scenario = validation.scenario;

interface KeyFile {
  scenario: string;
  findings: { id: string; title: string; source: string; lineItems: string[] }[];
}
const here = dirname(fileURLToPath(import.meta.url));
const key = JSON.parse(
  readFileSync(join(here, '..', 'keys', 'exhibit4-findings.json'), 'utf8'),
) as KeyFile;

const flag = (lineItems: string[]) => ({
  lineItems,
  category: 'unexplained' as const,
  evidence: 'Written by a test.',
});

describe('Exhibit 4 findings key', () => {
  it('is usable with the Exhibit 4 scenario', () => {
    expect(engine.findingsKeyProblems(scenario, key)).toEqual([]);
  });

  it('holds seven findings, each with a title and a source', () => {
    expect(key.findings.map((finding) => finding.id)).toEqual([
      '1-receivables-factored',
      '2-inventory-method',
      '3-depreciation',
      '4-goodwill',
      '5-accounts-payable',
      '6-revenue-and-cost-of-sales',
      '7-retained-earnings',
    ]);
    for (const finding of key.findings) {
      expect(finding.title.length).toBeGreaterThan(20);
      expect(finding.source.length).toBeGreaterThan(5);
    }
  });

  it('ties every finding to at least one material change', () => {
    const rows = engine.materialityReport(scenario, 'FY2022A', 'FY2021').rows;
    for (const finding of key.findings) {
      expect(engine.flagIsMaterial(flag(finding.lineItems), rows), finding.id).toBe(true);
    }
  });

  it('is fully covered by one flag per finding', () => {
    const flags = key.findings.map((finding) => flag([finding.lineItems[0] ?? '']));
    const report = engine.coverage(key, flags);
    expect(report.coveredCount).toBe(7);
    expect(report.total).toBe(7);
    expect(report.flagsOutsideKey).toEqual([]);
  });

  it('covers finding 1 from either side: cash or receivables', () => {
    for (const id of ['cash_and_equivalents', 'receivables_net']) {
      const report = engine.coverage(key, [flag([id])]);
      expect(report.findings[0]).toEqual({ id: '1-receivables-factored', covered: true, flags: [0] });
      expect(report.coveredCount).toBe(1);
    }
  });

  it('covers finding 3 from accumulated depreciation, although that change is not material', () => {
    const rows = engine.materialityReport(scenario, 'FY2022A', 'FY2021').rows;
    const only = flag(['accumulated_depreciation']);
    expect(engine.flagIsMaterial(only, rows)).toBe(false);
    expect(engine.coverage(key, [only]).findings[2]?.covered).toBe(true);
  });

  it('leaves the material changes the manual does not mention outside the key', () => {
    const flags = [
      flag(['selling_general_and_administrative']),
      flag(['restructuring_charges']),
      flag(['income_tax_expense']),
    ];
    const report = engine.coverage(key, flags);
    expect(report.coveredCount).toBe(0);
    expect(report.flagsOutsideKey).toEqual([0, 1, 2]);
  });

  it('maps every material line item to a finding, except those three', () => {
    const rows = engine.materialityReport(scenario, 'FY2022A', 'FY2021').rows;
    const inKey = new Set(key.findings.flatMap((finding) => finding.lineItems));
    const unmapped = rows
      .filter((row) => row.material && row.kind === 'line' && !inKey.has(row.id))
      .map((row) => row.id);
    expect(unmapped).toEqual([
      'selling_general_and_administrative',
      'restructuring_charges',
      'income_tax_expense',
    ]);
  });
});
