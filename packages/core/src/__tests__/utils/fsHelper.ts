import { PathLike, constants } from "node:fs";
import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import url from "node:url";
import { v4 as uuid } from "uuid";

export async function setupTmpDir() {
  try {
    const currentDir = url.fileURLToPath(new URL(".", import.meta.url));
    const id = uuid();
    const directory = path.join(currentDir, ".tmp-jest", id);

    // console.log(directory);

    await mkdir(directory, { recursive: true });

    process.chdir(directory);
    return directory;
  } catch (e) {
    throw e as Error;
  }
}

export async function writeNestedFile(filePath: string, data: string) {
  try {
    const dirname = path.dirname(filePath);
    const exist = await checkFileExists(dirname);
    if (!exist) {
      await mkdir(dirname, { recursive: true });
    }

    await writeFile(filePath, data, "utf8");
  } catch (e) {
    throw e as Error;
  }
}

async function checkFileExists(file: PathLike): Promise<boolean> {
  return await access(file, constants.F_OK)
    .then(() => true)
    .catch(() => false);
}
