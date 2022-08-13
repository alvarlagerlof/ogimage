import { readFile, access } from "node:fs/promises";
import { constants } from "node:fs";

import { Config } from "./types.js";

export default async function loadConfig() {
  if (!checkFileExists("ogimage.json")) {
    throw Error("No config file found");
  }

  const file = await readFile("ogimage.json", "utf8");
  return JSON.parse(file) as Config;
}

function checkFileExists(file) {
  return access(file, constants.F_OK)
    .then(() => true)
    .catch(() => false);
}
