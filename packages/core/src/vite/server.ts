import * as vite from "vite";
import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import friendlyTypeImports from "rollup-plugin-friendly-type-imports";
import tsconfigPaths from "vite-tsconfig-paths";
import * as esbuild from "esbuild";
import { readFile } from "fs/promises";

import { Options } from "./index.js";
import { getRelativeFilePaths } from "../paths.js";
import { renderMainContent, renderCustomContent } from "./content.js";

import { reactConfiguration } from "../frameworks/react.js";
import { preactConfiguration } from "../frameworks/preact.js";
import { solidConfiguration } from "../frameworks/solid.js";
import { svelteConfiguration } from "../frameworks/svelte.js";
import { vueConfiguration } from "../frameworks/vue.js";

async function getFrameworkConfig(options: Options) {
  switch (options.framework.type) {
    case "preact":
      return preactConfiguration();
    // return (await import("../frameworks/preact.js")).preactConfiguration();
    case "react":
      // return reactConfiguration();
      return (await import("../frameworks/react.js")).reactConfiguration();
    case "solid":
      return solidConfiguration(options.projectPath);
    // return (await import("../frameworks/solid.js")).solidConfiguration(
    //   options.projectPath
    // );
    case "svelte":
      return svelteConfiguration(options.projectPath);
    // return (await import("../frameworks/svelte.js")).svelteConfiguration(
    //   options.projectPath
    // );
    case "vue":
      return vueConfiguration(options.projectPath);
    // return (await import("../frameworks/vue.js")).vueConfiguration(
    //   options.projectPath
    // );
    default:
      throw new Error(
        `Invalid framework type: ${options.framework.type as string}`
      );
  }
}

export default async function setupServer(options: Options) {
  const relativeFilePaths = await getRelativeFilePaths(options.projectPath);
  const frameworkConfig = await getFrameworkConfig(options);

  console.log(frameworkConfig);

  return await vite.createServer({
    root: options.projectPath,
    configFile: false,
    server: {
      middlewareMode: true,
      hmr: {
        overlay: false,
      },
    },
    resolve: {
      alias: {
        ".vite/deps": url.fileURLToPath(
          new URL("./deps_temp", import.meta.url)
        ),
        // "@fs/var/home/alvar/Code/alvarlagerlof/ogimage/packages/core/node_modules":
        //   url.fileURLToPath(new URL("./node_modules", import.meta.url)),
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
                contents: await readFile(args.path, "utf8"),
              }));
            },
          },
        ],
      },
      entries: [...relativeFilePaths],
      include: [...frameworkConfig.packages],
    },
    ...options.vite,
    plugins: [
      ...frameworkConfig.plugins,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      tsconfigPaths() as vite.PluginOption,
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
            const source = await readFile(id, "utf8");
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
function fileURLToPath(arg0: URL): string {
  throw new Error("Function not implemented.");
}
