import mock from "mock-fs";
import getPort from "get-port";
import url from "node:url";
import path from "node:path";
import { readdir } from "node:fs/promises";

import startBrowser from "../browser.js";
import capture from "../capture.js";
import loadNodeModules from "./utils/loadNodeModules.js";
import { makeHtml } from "./utils/makeHtml.js";
import loadConfig from "../config.js";
import startRenderer from "../vite/index.js";
import makeDefaultReact from "./utils/makeDefaultReact.js";
import { MetaData } from "../types.js";

describe("CAPTURE", () => {
  test(
    "mocked meta",
    async () => {
      const browser = await startBrowser();
      mock({
        "ogimage.json": `{
              "buildDir": "build",
              "domain": "example.com",
              "layoutsDir": "ogimage-layouts"
          }`,
        "ogimage-layouts": {
          "default.tsx": makeDefaultReact(),
        },
        build: {
          "index.html": makeHtml("Start page", "Some description"),
        },
        ...loadNodeModules(),
      });
      const config = await loadConfig();
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
          image: null,
          date: null,
          description: "We’re makers of a website",
          publisher: null,
        },
        layout: "default",
      };

      await capture(
        browser,
        pathString,
        config.buildDir,
        metadata,
        `http://localhost:${port}/?layout=default`
      );

      await browser.close();
      await stopRenderer();
      console.log(await readdir(path.resolve(config.buildDir)));
      const result = await readdir(path.resolve(config.buildDir, "ogimage"));

      mock.restore();

      expect(result.length).toBe(1);
    },
    70 * 1000
  );
});
