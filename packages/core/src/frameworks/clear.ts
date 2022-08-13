import { rm } from "node:fs/promises";
import path from "node:path";

import { Config } from "../types.js";

export default async function clearGenerated(
  buildDir: Pick<Config, "buildDir">["buildDir"]
) {
  await rm(path.resolve(buildDir, "ogimage"), {
    recursive: true,
    force: true,
  });
}
