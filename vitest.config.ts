import { defineConfig } from 'vitest/config';
import { codeRepo } from './golden/code-repo.ts';

export default defineConfig({
  test: {
    include: ['golden/**/*.test.ts'],
  },
  server: {
    fs: {
      // The engine and the scenario files are read from the code repo checkout.
      allow: ['.', codeRepo],
    },
  },
});
