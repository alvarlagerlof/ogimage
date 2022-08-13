import { readdir } from "node:fs/promises";
import path from "node:path";
import { LimitFunction } from "p-limit";

import log from "./log.js";
import { Config } from "./types.js";

function shouldExclude(dirOrFile: string): boolean {
  const exclude = ["404", "500"].some((item) => dirOrFile.includes(item));
  if (exclude) log.warning("Excluded", dirOrFile);
  return exclude;
}

export default async function walkPath(
  limit: LimitFunction,
  config: Config,
  basePath: string
): Promise<string[]> {
  if (shouldExclude(basePath)) return;
  const pathContent = await readdir(basePath, { withFileTypes: true });

  const files = pathContent
    .filter((item) => item.isFile())
    .filter((file) => path.extname(file.name).toLowerCase() == ".html")
    .filter((file) => !shouldExclude(file.name))
    .map((file) => file.name);

  const inCurrentDir = await Promise.all(
    files.map(async (file) =>
      limit(async () => {
        try {
          return path.resolve(basePath, file);
        } catch (e) {
          log.error("Failed to handle file", file, e.message);
        }
      })
    )
  );

  const directories = pathContent
    .filter((item) => !item.isFile())
    .map((directory) => directory.name);

  const inOtherDirs = await Promise.all(
    directories.map(async (directory) =>
      limit(async () => {
        try {
          return await walkPath(limit, config, `${basePath}/${directory}`);
        } catch (e) {
          log.error(e.message);
        }
      })
    )
  );

  return [...inCurrentDir, ...inOtherDirs.flat()].filter(
    (pathString) => pathString !== undefined
  );
}
