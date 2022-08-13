import path from "path";
import fs from "fs-extra";

import { Options } from "./index.js";
import { getRelativeFilePaths, getRendererDirPath } from "./paths.js";

export async function renderMainContent() {
  const rendererDirPath = getRendererDirPath();

  const extension = (await fs.pathExists(path.join(rendererDirPath, "main.js")))
    ? ".js"
    : ".ts";
  return await fs.readFile(
    path.join(rendererDirPath, "main" + extension),
    "utf8"
  );
}

export async function renderCustomContent(layout: string, options: Options) {
  const relativeFilePaths = await getRelativeFilePaths(options.projectPath);

  const rendererDirPath = getRendererDirPath();

  const extension = (await fs.pathExists(path.join(rendererDirPath, "main.js")))
    ? ".js"
    : ".ts";

  const renderer = await fs.readFile(
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
