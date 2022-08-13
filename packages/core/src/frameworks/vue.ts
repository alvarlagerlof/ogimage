import { FrameworkConfiguration } from "../types.js";

export function vueConfiguration(projectPath: string): FrameworkConfiguration {
  // Note: This package is an optional peer dependency.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
  const vue = require(require.resolve("@vitejs/plugin-vue", {
    paths: [projectPath],
  }));
  return {
    packages: ["vue"],
    defaultImports: true,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    plugins: [vue()],
  };
}
