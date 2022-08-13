import { FrameworkConfiguration } from "../types.js";

export function svelteConfiguration(
  projectPath: string
): FrameworkConfiguration {
  // Note: This package is an optional peer dependency.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
  const { svelte } = require(require.resolve("@sveltejs/vite-plugin-svelte", {
    paths: [projectPath],
  }));
  return {
    packages: ["svelte"],
    defaultImports: true,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    plugins: [svelte()],
  };
}
