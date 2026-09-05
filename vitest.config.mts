import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    globalSetup: ["tests/setup-db.mts"],
    testTimeout: 30000,
    env: {
      DATABASE_URL:
        process.env.TEST_DATABASE_URL ?? "postgres://portal:portal@127.0.0.1:5433/portal_test",
    },
    // Os testes de integração sobem o schema; um pool só evita corrida.
    fileParallelism: false,
  },
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, ".") },
  },
});
