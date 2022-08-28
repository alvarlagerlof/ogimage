#!/usr/bin/env node
import getPort from "get-port";
import { readFile } from "node:fs/promises";
import path from "node:path";
import url from "node:url";
import pLimit, { LimitFunction } from "p-limit";
import { Browser } from "playwright";

import addOgImageTag from "./addOgImageTag.js";
import startBrowser from "./browser.js";
import capture from "./capture.js";
import clearGenerated from "./clear.js";
import loadConfig from "./config.js";
import extractMeta from "./extractMeta.js";
import log from "./log.js";
import { walkPath } from "./paths.js";
import step from "./step.js";
import { Config, MetaData } from "./types.js";
import startRenderer from "./vite/index.js";

interface PathStringWithMetadata {
  screenshotPath: string;
  metadata: MetaData;
}

const limit: LimitFunction = pLimit(4);

void (async function run() {
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
    failMessage: () => `Failed to start renderer`,
  });

  const pathStrings = await step<string[]>({
    initialMessage: () => `Looking for html files in ${config.buildDir}`,
    execute: async () => await walkPath(config.buildDir),
    successMessage: (returnValue) => `Found ${returnValue.length} html files`,
    failMessage: () => `Failed to look for html files`,
  });

  await step({
    initialMessage: () => `Adding meta og:image tags...`,
    execute: async () =>
      await Promise.all(
        pathStrings.map(async (pathString) => {
          await addOgImageTag(config, pathString);
        })
      ),
    successMessage: (returnValue) =>
      `Added meta og:image tags ${returnValue.length} to html files`,
    failMessage: () => `Failed to add meta og:image tags`,
  });

  const screenshotPathsWithMetadata = await step<PathStringWithMetadata[]>({
    initialMessage: () => `Extracting metadata...`,
    execute: async () => {
      return await Promise.all(
        pathStrings.map(async (pathString) => {
          const html = (await readFile(path.resolve(pathString))).toString();

          const file = pathString
            .split(`/${config.buildDir}/`)[1]
            .replace(".html", ".jpg");

          const screenshotPath = path.resolve(config.buildDir, "ogimage", file);

          return {
            screenshotPath,
            metadata: extractMeta(html),
          } as PathStringWithMetadata;
        })
      );
    },
    successMessage: (returnValue) =>
      `Extracted metadata from ${returnValue.length} html`,
    failMessage: () => `Failed to extract metadata`,
  });

  await Promise.all(
    screenshotPathsWithMetadata.map(async (screenshotPathWithMetadata, index) =>
      limit(async () => {
        await step({
          execute: async () => {
            const { screenshotPath, metadata } = screenshotPathWithMetadata;

            const page = await browser.newPage();
            const pageUrl = `http://localhost:${port}/?layout=default`;

            await capture(page, pageUrl, metadata, screenshotPath);
            await page.close();
          },

          successMessage: () => {
            const progress = `(${index + 1} / ${
              screenshotPathsWithMetadata.length
            })`;

            return `${progress} Captured ${screenshotPathWithMetadata.screenshotPath
              .replace(process.cwd(), "")
              .substring(1)}`;
          },
          failMessage: () => `Failed to add meta og:image tags`,
        });
      })
    )
  );

  log.success(`Captured for ${screenshotPathsWithMetadata.length} pages`);

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
