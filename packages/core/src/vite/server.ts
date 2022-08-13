import * as vite from "vite";
import friendlyTypeImports from "rollup-plugin-friendly-type-imports";
import tsconfigPaths from "vite-tsconfig-paths";
import fs from "fs-extra";
import * as esbuild from "esbuild";

import { Options } from "./index.js";
import { getRelativeFilePaths } from "./paths.js";
import { renderMainContent, renderCustomContent } from "./content.js";

async function getFrameworkConfig(options) {
  switch (options.framework.type) {
    //   case "preact":
    //     const { preactConfiguration } = await import("./frameworks/preact");
    //     return preactConfiguration();
    case "react":
      const { reactConfiguration } = await import("../frameworks/react.js");
      return reactConfiguration(options.framework);
    //   case "solid":
    //     const { solidConfiguration } = await import("./frameworks/solid");
    //     return solidConfiguration(options.projectPath);
    //   case "svelte":
    //     const { svelteConfiguration } = await import("./frameworks/svelte");
    //     return svelteConfiguration(options.projectPath);
    //   case "vue":
    //     const { vueConfiguration } = await import("./frameworks/vue");
    //     return vueConfiguration(options.projectPath);
    //   default:
    //     throw new Error(`Invalid framework type: ${frameworkType}`);
  }
}

export default async function setupServer(options: Options) {
  const relativeFilePaths = await getRelativeFilePaths(options.projectPath);
  const frameworkConfig = await getFrameworkConfig(options);

  return await vite.createServer({
    root: options.projectPath,
    configFile: false,
    server: {
      middlewareMode: true,
      hmr: {
        overlay: false,
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        plugins: [
          // Ensure that esbuild doesn't crash when encountering JSX in .js files.
          // Credit: https://github.com/vitejs/vite/discussions/3448#discussioncomment-749919
          {
            name: "load-js-files-as-jsx",
            setup(build) {
              build.onLoad({ filter: /.*\.js$/ }, async (args) => ({
                loader: "jsx",
                contents: await fs.readFile(args.path, "utf8"),
              }));
            },
          },
        ],
      },
      entries: [
        ...(options.wrapper ? [options.wrapper.path] : []),
        ...relativeFilePaths,
      ],
      include: [...frameworkConfig.packages],
    },
    ...options.vite,
    plugins: [
      ...frameworkConfig.plugins,
      tsconfigPaths(),
      friendlyTypeImports(),
      {
        name: "virtual",
        load: async (id) => {
          if (id === "/__main__.tsx") {
            return await renderMainContent();
          }
          if (id.startsWith("/__renderer__")) {
            const layout = id.replace("/__renderer__", "").replace(".tsx", "");
            return await renderCustomContent(layout, options);
          }
          if (id.endsWith(".js")) {
            const source = await fs.readFile(id, "utf8");
            const transformed = await esbuild.transform(source, {
              loader: "jsx",
              format: "esm",
              sourcefile: id,
            });
            return transformed;
          }
          return null;
        },
      },
      ...(options.vite?.plugins || []),
    ],
  });
}
