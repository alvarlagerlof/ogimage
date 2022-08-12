import React from "react";
import ReactDOM from "react-dom";
import * as url from "url";

import connect from "connect";
import * as esbuild from "esbuild";
import fs from "fs-extra";
import glob from "glob";
import { Server } from "http";
import path from "path";
import friendlyTypeImports from "rollup-plugin-friendly-type-imports";
import { promisify } from "util";
import * as vite from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { FrameworkOptions, WrapperConfig } from "./config.js";

export default async function startRenderer(options: {
  framework: FrameworkOptions;
  projectPath: string;
  port: number;
  wrapper?: WrapperConfig;
  vite?: vite.UserConfig;
}) {
  const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

  const relativeFilePaths = await promisify(glob)("*", {
    ignore: "**/node_modules/**",
    cwd: options.projectPath,
  });

  if (relativeFilePaths.length === 0) {
    throw new Error("No files found");
  }
  const frameworkConfig = await (async () => {
    // const frameworkType = options.framework.type;
    const frameworkType = "react";
    switch (options.framework.type) {
      //   case "preact":
      //     const { preactConfiguration } = await import("./frameworks/preact");
      //     return preactConfiguration();
      case "react":
        const { reactConfiguration } = await import("./frameworks/react.js");
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
  })();
  const rendererDirPath = __dirname + "/renderers";

  // Support both production (.js) and development (.ts).
  const extension = (await fs.pathExists(path.join(rendererDirPath, "main.js")))
    ? ".js"
    : ".ts";
  const mainContent = await fs.readFile(
    path.join(rendererDirPath, "main" + extension),
    "utf8"
  );

  async function renderCustomContent(layout: string) {
    const renderer = await fs.readFile(
      path.join(rendererDirPath, options.framework.type + extension),
      "utf8"
    );

    const importComponentModule = `import componentModule from "/${relativeFilePaths.find(
      (file) => file.split(".")[0] == layout
    )}";`;

    const renderScreenshot = `
      renderScreenshot(componentModule).then(__done__).catch(e => {
        __done__(e.stack || e.message || "Unknown error");
      });
      `;

    const insertMeta = `
      window.meta = await window.__meta__();
    `;

    return `
        ${renderer}
        ${insertMeta}
        ${importComponentModule}
        ${renderScreenshot}
        `;
  }

  const viteServer = await vite.createServer({
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
            return mainContent;
          }
          // if (id === "/__renderer__.tsx") {
          //   return rendererContent;
          // }
          if (id.startsWith("/__renderer__")) {
            const layout = id.replace("/__renderer__", "").replace(".tsx", "");
            return renderCustomContent(layout);
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
  const app = connect();
  app.use(async (req, res, next) => {
    if (req.originalUrl.split("?")[0] !== "/") {
      return next();
    }

    const url = new URL("http://example.com" + req.originalUrl);
    const layout = url.searchParams.get("layout");

    const html = await viteServer.transformIndexHtml(
      req.originalUrl,
      `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <style>
            * {
              transition: none !important;
              animation: none !important;
            }
            .viteshot-error {
              color: #e00;
            }
            </style>
          </head>
          <body>
            <div id="root"></div>
            <script type="module" src="/__main__.tsx"></script>
            <script type="module" src="/__renderer__${layout}.tsx"></script>
          </body>
        </html>
        `
    );
    res.setHeader("Content-Type", "text/html");
    res.end(html);
  });
  app.use(viteServer.middlewares);
  let server!: Server;
  await new Promise((resolve) => (server = app.listen(options.port, resolve)));
  return async () => {
    await viteServer.close();
    await server.close();
  };
}
