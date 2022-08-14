import mock from "mock-fs";
import { DirectoryItems } from "mock-fs/lib/filesystem.js";
import getPort from "get-port";

import startBrowser from "../browser.js";
import capture from "../capture.js";
import extractMeta from "../extractMeta.js";
import { walkPath } from "../paths.js";
import loadNodeModules from "./utils/loadNodeModules.js";
import makeHtml from "./utils/makeHtml.js";
import loadConfig from "../config.js";
import startRenderer from "../vite/index.js";

describe("CAPTURE", () => {
  test("all", async () => {
    mock({
      "ogimage.json": `{
                "buildDir": "build",
                "domain": "example.com",
                "layoutsDir": "ogimage-layouts"
            }`,
      "index.html": makeHtml("Start page", "Some description"),
      "about.html": makeHtml("About us", "We're makers of a website"),
      ...loadNodeModules(),
    });

    const config = await loadConfig();

    const browser = await startBrowser();
    await browser.close();

    expect(config.buildDir).toBe("build");
    expect(config.domain).toBe("example.com");
    expect(config.layoutsDir).toBe("ogimage-layouts");

    mock.restore();
  });

  // test("start", async () => {
  //   mock({
  //     "ogimage.json": `{
  //               "buildDir": "build",
  //               "domain": "example.com",
  //               "layoutsDir": "ogimage-layouts"
  //           }`,
  //     "index.html": makeHtml("Start page", "Some description"),
  //     "about.html": makeHtml("About us", "We're makers of a website"),
  //     ...loadNodeModules(),
  //   });

  //   const browser = await startBrowser();

  //   // const config = await loadConfig();

  //   // const pathStrings = await walkPath(config.buildDir);

  //   // const pathStringsWithMetadata = await Promise.all(
  //   //   pathStrings.map(async (pathString) => ({
  //   //     pathString: pathString,
  //   //     metadata: await extractMeta(pathString),
  //   //   }))
  //   // );

  //   // const port = await getPort();

  //   // const stopRenderer = await startRenderer({
  //   //   framework: { type: "react" },
  //   //   projectPath: `${process.cwd()}/${config.layoutsDir}`,
  //   //   port: port,
  //   // });

  //   // await Promise.all(
  //   //   pathStringsWithMetadata.map(
  //   //     async (pathStringWithMetadata) =>
  //   //       await capture(
  //   //         browser,
  //   //         pathStringWithMetadata.pathString,
  //   //         config.buildDir,
  //   //         pathStringWithMetadata.metadata,
  //   //         `http://localhost:${port}/?layout=default`
  //   //       )
  //   //   )
  //   // );

  //   await browser.close();
  //   // await stopRenderer();

  //   expect(1).toBe(1);
  //   mock.restore();
  // });
});
