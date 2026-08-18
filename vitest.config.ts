import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    env: {
      // Placeholder so importing lib/db/prisma.ts never throws for a missing env var during
      // unit tests. Individual tests override/delete process.env.DATABASE_URL as needed --
      // no test in this suite opens a real database connection.
      DATABASE_URL: "postgresql://user:pass@localhost:5432/udyogquest_test"
    }
  },
  resolve: {
    alias: {
      "@": rootDir
    }
  }
});
