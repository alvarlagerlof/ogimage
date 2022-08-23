import { readFile, access } from "node:fs/promises";
import { constants, PathLike } from "node:fs";
import { z } from "zod";

import { Config } from "./types.js";

const ConfigSchema = z
  .object({
    buildDir: z.string(),
    layoutsDir: z.string(),
    domain: z.string().url(),
  })
  .strict();

export default async function loadConfig(): Promise<Config> {
  if (!(await checkFileExists("ogimage.json"))) {
    throw Error("No config file found");
  }

  const file = await readFile("ogimage.json", "utf8");
  const parsedJson = JSON.parse(file) as Config;

  const config = ConfigSchema.parse(parsedJson) as Config;

  if (!(await checkFileExists(config.buildDir))) {
    throw Error("Specified buildDir in config does not exist");
  }

  if (!(await checkFileExists(config.layoutsDir))) {
    throw Error("Specified layoutsDir in config does not exist");
  }

  return config;
}

async function checkFileExists(file: PathLike): Promise<boolean> {
  return await access(file, constants.F_OK)
    .then(() => true)
    .catch(() => false);
}
