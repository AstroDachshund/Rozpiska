import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./supabase/tests/setup.ts'],
    // Testy RLS współdzielą jedną lokalną bazę → brak równoległości między plikami,
    // żeby seed/cleanup jednego testu nie kolidował z innym.
    fileParallelism: false,
    pool: 'forks',
    poolOptions: { forks: { singleFork: true } },
    testTimeout: 30_000,
    hookTimeout: 30_000,
    include: ['supabase/tests/**/*.test.ts', 'lib/**/*.test.ts'],
  },
});
