import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

/**
 * Where the big-simulation code repo is checked out. Defaults to a sibling
 * folder of this repo. Set CODE_REPO to point somewhere else.
 */
export const codeRepo = resolve(process.env.CODE_REPO ?? join(here, '..', '..', 'big-simulation'));

type Engine = typeof import('../../big-simulation/packages/engine/src/index');

/** Loads the engine from the code repo checkout. */
export async function loadEngine(): Promise<Engine> {
  const entry = join(codeRepo, 'packages', 'engine', 'src', 'index.ts');
  if (!existsSync(entry)) {
    throw new Error(
      `No engine at ${entry}. Check out big-simulation next to this repo, or set CODE_REPO.`,
    );
  }
  return (await import(entry)) as Engine;
}

/** Reads a scenario file from the code repo checkout. */
export function readScenario(fileName: string): unknown {
  return JSON.parse(readFileSync(join(codeRepo, 'scenarios', fileName), 'utf8')) as unknown;
}
