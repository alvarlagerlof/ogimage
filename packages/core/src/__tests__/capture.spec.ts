import getPort from "get-port";
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

    const browser = await startBrowser();
    const page = await browser.newPage();

    const pageUrl = `http://localhost:${port}/?layout=default`;

    const metadata: MetaData = {
      meta: {
        title: "About us",
        description: "We made a website",
      },
      layout: "default",
    };

    const pathString = url
      .fileURLToPath(new URL("./build/index.html", import.meta.url))
      .toString();

    const file = pathString
      .split(`/${config.buildDir}/`)[1]
      .replace(".html", ".jpg");

    const screenshotPath = path.resolve(config.buildDir, "ogimage", file);

    await capture(page, pageUrl, metadata, screenshotPath);

    await page.close();
    await browser.close();
    await stopRenderer();

    const result = await readdir(path.resolve(config.buildDir, "ogimage"));
    expect(result.length).toBe(1);
  });
});
