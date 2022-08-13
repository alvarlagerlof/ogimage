import * as url from "url";
import { promisify } from "util";
import glob from "glob";

import { Options } from "./index.js";

export function getRendererDirPath() {
  return url.fileURLToPath(new URL("../renderers", import.meta.url));
}

export async function getRelativeFilePaths(
  projectPath: Pick<Options, "projectPath">["projectPath"]
) {
  return await promisify(glob)("*", {
    ignore: "**/node_modules/**",
    cwd: projectPath,
  });
}
