import getPort from "get-port";
import { spawn } from "node:child_process";
import { readdir } from "node:fs/promises";
import path from "node:path";
import url from "node:url";

import startBrowser from "../browser.js";
import capture from "../capture.js";
import { Config } from "../types.js";
import { MetaData } from "../types.js";
import startRenderer from "../vite/index.js";
import { setupTmpDir, writeNestedFile } from "./utils/fsHelper.js";
import makeDefaultReact from "./utils/makeDefaultReact.js";

describe("CAPTURE", () => {
  test("once", async () => {
    await setupTmpDir();

    await writeNestedFile("ogimage-layouts/default.tsx", makeDefaultReact());

    const config: Config = {
      buildDir: "build",
      domain: "https://example.com",
      layoutsDir: "ogimage-layouts",
    };

    const port = await getPort();

    const stopRenderer = await startRenderer({
      framework: { type: "react" },
      projectPath: `${process.cwd()}/${config.layoutsDir}`,
      port: port,
    });

    const pathString = url.fileURLToPath(
      new URL("./build/index.html", import.meta.url)
    );

    const metadata: MetaData = {
      meta: {
        title: "About us",
        description: "We made a website",
      },
      layout: "default",
    };

    const browser = await startBrowser();

    await capture(
      browser,
      pathString,
      config.buildDir,
      metadata,
      `http://localhost:${port}/?layout=default`
    );

    await browser.close();
    await stopRenderer();

    const result = await readdir(path.resolve(config.buildDir, "ogimage"));
    expect(result.length).toBe(1);
  });

  test("once", async () => {
    await setupTmpDir();

    await writeNestedFile("ogimage-layouts/default.tsx", makeDefaultReact());

    await writeNestedFile(
      "ogimage-layouts/blogpost.tsx",
      makeDefaultReact("#EAFF00")
    );

    const config: Config = {
      buildDir: "build",
      domain: "https://example.com",
      layoutsDir: "ogimage-layouts",
    };

    const port = await getPort();

    const stopRenderer = await startRenderer({
      framework: { type: "react" },
      projectPath: `${process.cwd()}/${config.layoutsDir}`,
      port: port,
    });

    const pathString = url.fileURLToPath(
      new URL("./build/index.html", import.meta.url)
    );

    const pathString2 = url.fileURLToPath(
      new URL("./build/index.html", import.meta.url)
    );

    const metadata: MetaData = {
      meta: {
        title: "About us",
        description: "We made a website",
      },
      layout: "default",
    };

    const browser = await startBrowser();

    await capture(
      browser,
      pathString,
      config.buildDir,
      metadata,
      `http://localhost:${port}/?layout=default`
    );

    await capture(
      browser,
      pathString2,
      config.buildDir,
      metadata,
      `http://localhost:${port}/?layout=blogpostx`
    );

    await browser.close();
    await stopRenderer();

    const result = await readdir(path.resolve(config.buildDir, "ogimage"));
    expect(result.length).toBe(1);
  });
});
