import path from "path";
import fs from "fs";
import { readFile } from "fs/promises";

import { Options } from "./index.js";
import { getRelativeFilePaths, getRendererDirPath } from "../paths.js";

async function exists(path: fs.PathLike) {
  try {
    await fs.promises.stat(path);
    return true;
  } catch {
    return false;
  }
}

export async function renderMainContent() {
  const rendererDirPath = getRendererDirPath();

  const extension = (await exists(path.join(rendererDirPath, "main.js")))
    ? ".js"
    : ".ts";

  return await readFile(path.join(rendererDirPath, "main" + extension), "utf8");
}

export async function renderCustomContent(layout: string, options: Options) {
  const relativeFilePaths = await getRelativeFilePaths(options.projectPath);

  const renderer = await readFile(
    path.join(getRendererDirPath(), options.framework.type + ".js"),
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
