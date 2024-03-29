import path from "node:path";
import fs from "node:fs";
import url from "node:url";
import { readFile } from "fs/promises";

import { Options } from "./index.js";
import { getRelativeFilePaths } from "../paths.js";

async function exists(path: fs.PathLike) {
  try {
    await fs.promises.stat(path);
    return true;
  } catch {
    return false;
  }
}

const rendererDirPath = url.fileURLToPath(
  new URL("../../dist/renderers", import.meta.url)
);

export async function renderMainContent() {
  // const extension = (await exists(path.join(rendererDirPath, "main.js")))
  //   ? ".js"
  //   : ".ts";

  const extension = ".js";

  return await readFile(path.join(rendererDirPath, "main" + extension), "utf8");
}

export async function renderCustomContent(layout: string, options: Options) {
  const relativeFilePaths = await getRelativeFilePaths(options.projectPath);

  // TODO: Find a better way to do this
  //const extension = typeof jest !== "undefined" ? ".ts" : ".js";
  const extension = ".js";

  const renderer = await readFile(
    path.join(rendererDirPath, options.framework.type + extension),
    "utf8"
  );

  const importComponentModule = `import componentModule from "/${relativeFilePaths.find(
    (file) => file.split(".")[0] == layout
  )}";`;

  const renderScreenshot = `
      const meta = await window.__meta__()

      renderScreenshot(componentModule, meta).then(__done__).catch(e => {
        __done__(e.stack || e.message || "Unknown error");
      });
      `;

  return `
        ${renderer}
        ${importComponentModule}
        ${renderScreenshot}
        `;
}
