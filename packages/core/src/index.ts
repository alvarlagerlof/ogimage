#!/usr/bin/env node
import getPort from "get-port";
import { Browser } from "playwright";

import startRenderer from "./vite/index.js";
import addOgImageTag from "./addOgImageTag.js";
import capture from "./capture.js";
import pLimit, { LimitFunction } from "p-limit";
import step from "./step.js";
import log from "./log.js";
import walkPath from "./walk.js";
import { Config } from "./types.js";
import { Metadata } from "metascraper";
import extractMeta from "./extractMeta.js";
import startBrowser from "./browser.js";
import loadConfig from "./config.js";
import clearGenerated from "./frameworks/clear.js";

interface PathStringWithMetadata {
  pathString: string;
  metadata: Metadata;
}

const limit: LimitFunction = pLimit(3);

(async function run() {
  const port = await getPort();

  const config = await step<Config>({
    initialMessage: () => "Loading config...",
    execute: async () => {
      return await loadConfig();
    },
    successMessage: () => "Loaded config",
    failMessage: () => "Failed to load config",
  });

  await step<void>({
    initialMessage: () => "Clearing generated folder...",
    execute: async () => await clearGenerated(config.buildDir),
    successMessage: () => "Cleared generated folder",
    failMessage: () => "Failed to clear generated folder",
  });

  const browser = await step<Browser>({
    initialMessage: () => "Starting browser...",
    execute: async () => await startBrowser(),
    successMessage: () => "Browser started",
    failMessage: () => `Failed to start browser`,
  });

  const stopRenderer = await step<() => Promise<void>>({
    initialMessage: () => "Starting renderer...",
    execute: async () =>
      await startRenderer({
        framework: { type: "react" },
        projectPath: `${process.cwd()}/${config.layoutsDir}`,
        port: port,
      }),
    successMessage: () => `Started renderer at port: ${port}`,
    failMessage: () => `Failed to renderer`,
  });

  const pathStrings = await step<string[]>({
    initialMessage: () => `Looking for html files in ${config.buildDir}`,
    execute: async () => await walkPath(limit, config, config.buildDir),
    successMessage: (returnValue) => `Found ${returnValue.length} html files`,
    failMessage: () => `Failed to look for html files`,
  });

  await step({
    initialMessage: () => `Adding meta og:image tags...`,
    execute: async () =>
      await Promise.all(
        pathStrings.map(async (pathString) =>
          limit(async () => {
            await addOgImageTag(config, pathString);
          })
        )
      ),
    successMessage: (returnValue) =>
      `Added meta og:image tags ${returnValue.length} to html files`,
    failMessage: () => `Failed to add meta og:image tags`,
  });

  const pathStringsWithMetadata = await step<PathStringWithMetadata[]>({
    initialMessage: () => `Extracting metadata...`,
    execute: async () =>
      await Promise.all(
        pathStrings.map(async (pathString) =>
          limit(async () => {
            return {
              pathString: pathString,
              metadata: await extractMeta(pathString),
            };
          })
        )
      ),
    successMessage: (returnValue) =>
      `Extracted metadata from ${returnValue.length} html`,
    failMessage: () => `Failed to extract metadata`,
  });

  await Promise.all(
    pathStringsWithMetadata.map(async (pathStringWithMetadata, index) =>
      limit(async () => {
        await step({
          execute: async () =>
            await capture(
              browser,
              pathStringWithMetadata.pathString,
              config.buildDir,
              pathStringWithMetadata.metadata,
              `http://localhost:${port}/?layout=default`
            ),
          successMessage: () => {
            const progress = `(${index + 1} / ${
              pathStringsWithMetadata.length
            }`;

            const file = pathStringWithMetadata.pathString
              .replace(process.cwd(), "")
              .substring(1);

            return `${progress} Captured for ${file}`;
          },
          failMessage: () => `Failed to add meta og:image tags`,
        });
      })
    )
  );

  log.success(`Captured for ${pathStringsWithMetadata.length} pages`);

  await step({
    initialMessage: () => `Stopping browser...`,
    execute: async () => await browser.close(),
    successMessage: () => "Browser stopped",
    failMessage: () => "Failed to stop the browser",
  });

  await step({
    initialMessage: () => "Stopping renderer...",
    execute: async () => await stopRenderer(),
    successMessage: () => "Renderer stopped",
    failMessage: () => "Failed to stop the renderer",
  });

  process.exit(0);
})();
