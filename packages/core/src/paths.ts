import * as url from "url";
import { promisify } from "util";
import glob from "glob";
import { readdir } from "node:fs/promises";
import path from "node:path";

import log from "./log.js";
import { Options } from "./vite/index.js";

export function getRendererDirPath() {
  return url.fileURLToPath(new URL("./renderers", import.meta.url));
}

export async function getRelativeFilePaths(
  projectPath: Pick<Options, "projectPath">["projectPath"]
) {
  return await promisify(glob)("*", {
    ignore: "**/node_modules/**",
    cwd: projectPath,
  });
}

function shouldExclude(dirOrFile: string): boolean {
  const exclude = ["404", "500"].some((item) => dirOrFile.includes(item));
  if (exclude) log.warning("Excluded", dirOrFile);
  return exclude;
}

export async function walkPath(basePath: string): Promise<string[]> {
  if (shouldExclude(basePath)) return;
  const pathContent = await readdir(basePath, { withFileTypes: true });

  const files = pathContent
    .filter((item) => item.isFile())
    .filter((file) => path.extname(file.name).toLowerCase() == ".html")
    .filter((file) => !shouldExclude(file.name))
    .map((file) => file.name)
    .map((file) => path.resolve(basePath, file));

  const filesSubDirectories = await Promise.all(
    pathContent
      .filter((item) => !item.isFile())
      .map((directory) => directory.name)
      .map(async (directory) => {
        return await walkPath(`${basePath}/${directory}`);
      })
  );

  return [...files, ...filesSubDirectories.flat()].filter(
    (pathString) => pathString !== undefined
  );
}
