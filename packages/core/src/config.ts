import { readFile, access } from "node:fs/promises";
import { constants, PathLike } from "node:fs";

import { Config } from "./types.js";

export default async function loadConfig() {
  if (!(await checkFileExists("ogimage.json"))) {
    throw Error("No config file found");
  }

  const file = await readFile("ogimage.json", "utf8");
  return JSON.parse(file) as Config;
}

async function checkFileExists(file: PathLike): Promise<boolean> {
  return await access(file, constants.F_OK)
    .then(() => true)
    .catch(() => false);
}
