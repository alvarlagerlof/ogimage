import { mkdir } from "node:fs/promises";

import loadConfig from "../config.js";
import { setupTmpDir, writeNestedFile } from "./utils/fsHelper.js";

describe("CONFIG", () => {
  test("fail on no config", async () => {
    await setupTmpDir();

    await expect(async () => await loadConfig()).rejects.toThrow();
  });

  test("load config", async () => {
    await setupTmpDir();

    await writeNestedFile(
      "ogimage.json",
      JSON.stringify({
        buildDir: "build",
        domain: "https://example.com",
        layoutsDir: "ogimage-layouts",
      })
    );

    await mkdir("build");
    await mkdir("ogimage-layouts");

    const config = await loadConfig();

    expect(config.buildDir).toBe("build");
    expect(config.domain).toBe("https://example.com");
    expect(config.layoutsDir).toBe("ogimage-layouts");
  });

  test("fail on incorrect domai", async () => {
    await setupTmpDir();

    await writeNestedFile(
      "ogimage.json",
      JSON.stringify({
        buildDir: "build",
        domain: "example.com",
        layoutsDir: "ogimage-layouts",
      })
    );

    await expect(async () => await loadConfig()).rejects.toThrow();
  });
});
