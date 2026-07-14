import {
  defineConfig
} from "vitest/config";


export default defineConfig({
  test: {
    environment: "node",
    setupFiles: [
      "./tests/setup.ts"
    ],
    include: [
      "tests/**/*.test.ts"
    ],
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
    fileParallelism: false,
    coverage: {
      provider: "v8",
      reporter: [
        "text",
        "html",
        "lcov"
      ],
      include: [
        "src/services/**/*.ts"
      ],
      exclude: [
        "src/services/auctionTimerService.ts"
      ]
    }
  }
});
