import { FrameworkConfiguration } from "../types.js";

export function solidConfiguration(
  projectPath: string
): FrameworkConfiguration {
  // Note: This package is an optional peer dependency.

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
  const solidPlugin = require(require.resolve("vite-plugin-solid", {
    paths: [projectPath],
  }));
  return {
    packages: ["solid-js"],
    defaultImports: false,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    plugins: [solidPlugin()],
  };
}
