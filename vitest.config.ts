import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: {
    environment: "node",
    env: { DATABASE_PATH: ":memory:", SESSION_SECRET: "test-secret-at-least-32-characters-long" },
  },
});
