#!/usr/bin/env node
import { constants } from "node:fs";
import { readFile, access, readdir, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import logSymbols from "log-symbols";
import chalk from "chalk";
import getPort from "get-port";

import metascraper, { Metadata } from "metascraper";
import metascraperTitle from "metascraper-title";
import metascraperImage from "metascraper-image";
import metascraperDate from "metascraper-date";
import metascraperDescription from "metascraper-description";
import metascraperPublisher from "metascraper-publisher";

import startRenderer from "./renderer.js";
import shoot from "./shooters/playwright.js";
import { chromium, Browser } from "playwright";
import pLimit from "p-limit";

interface Config {
  buildDir: string;
  domain: string;
  layoutsDir: string;
}

const limit = pLimit(10);

const log = (() => {
  const base = (level: string, ...message) =>
    console.log(chalk.grey("ogimage"), level, ...message);

  return {
    info: (...message) => base(logSymbols.info, ...message),
    success: (...message) => base(logSymbols.success, ...message),
    warning: (...message) => base(logSymbols.warning, ...message),
    error: (...message) => base(logSymbols.error, ...message),
  };
})();

let count = 0;

(async function run() {
  const port = await getPort();
  // console.log(`http://localhost:${port}`);

  if (await checkFileExists("ogimage.json")) {
    const file = await readFile("ogimage.json", "utf8");
    const config = JSON.parse(file) as Config;

    // log.info("Clearing generated folder...");
    // await rm(path.resolve(config.buildDir, "ogimage"), {
    //   recursive: true,
    //   force: true,
    // });
    // log.success("Cleared generated folder");

    log.info("Starting browser...");
    const browser: Browser = await startBrowser();

    log.info("Starting renderer...");
    const stopRenderer = await startRenderer({
      framework: { type: "react" },
      projectPath: `${process.cwd()}/${config.layoutsDir}`,
      port: port,
    });
    log.success("Started renderer");

    log.info("Looking for html files in", config.buildDir);
    await walkPath(config, browser, port, config.buildDir);

    log.info("Stopping browser...");
    browser.close();
    log.success("Browser stopped");

    log.info("Stopping renderer...");
    await stopRenderer();
    log.success("Renderer stopped");

    log.info(`Captured ${count} pages`);

    process.exit(0);
  } else {
    log.error("Did not find config file");

    process.exit(1);
  }
})();

function shouldExclude(dirOrFile: string): boolean {
  const exclude = ["404", "500"].some((item) => dirOrFile.includes(item));
  if (exclude) log.warning("Excluded", dirOrFile);
  return exclude;
}

async function walkPath(
  config: Config,
  browser: Browser,
  port: number,
  basePath: string
) {
  if (shouldExclude(basePath)) return;
  const pathContent = await readdir(basePath, { withFileTypes: true });

  const files = pathContent
    .filter((item) => item.isFile())
    .filter((file) => path.extname(file.name).toLowerCase() == ".html")
    .filter((file) => !shouldExclude(file.name))
    .map((file) => file.name);

  await Promise.all(
    files.map(async (file) =>
      limit(async () => {
        try {
          const pathString = path.resolve(basePath, file);

          await addOgImageTag(config, pathString);

          const meta = await extractMeta(pathString);

          await shoot(
            browser,
            pathString,
            config.buildDir,
            meta,
            `http://localhost:${port}/?layout=default`
          );

          count++;

          log.success(
            "Done",
            pathString.replace(process.cwd(), "").substring(1)
          );
        } catch (e) {
          log.error("Failed to handle file", file, e.message);
        }
      })
    )
  );

  const directories = pathContent
    .filter((item) => !item.isFile())
    .map((directory) => directory.name);

  // await Promise.all(
  //   directories.map(async (directory) => {
  //     try {
  //       await walkPath(config, browser, port, `${basePath}/${directory}`);
  //     } catch (e) {
  //       log.error(e.message);
  //     }
  //   })
  // );

  await Promise.all(
    directories.map(async (directory) =>
      limit(async () => {
        try {
          await walkPath(config, browser, port, `${basePath}/${directory}`);
        } catch (e) {
          log.error(e.message);
        }
      })
    )
  );
}

async function startBrowser(): Promise<Browser> {
  try {
    const browser = await chromium.launch({
      executablePath: process.env.PUPPETEER_EXEC_PATH,
      headless: true,
    });
    log.success("Started browser");
    return browser;
  } catch (e) {
    log.error("Failed to start browser", e.message);
  }
}

async function extractMeta(pathString: string): Promise<Metadata> {
  const content = (await readFile(pathString)).toString();

  const scraper = await metascraper([
    metascraperTitle(),
    metascraperImage(),
    metascraperDate(),
    metascraperDescription(),
    metascraperPublisher(),
  ]);

  return await scraper({ url: null, html: content, validateUrl: false });
}

async function addOgImageTag(config: Config, pathString: string) {
  const content = (await readFile(pathString)).toString();
  const index = content.indexOf("</head>");

  const imgUrl = `https://${config.domain}/ogimage/${pathString
    .replace(process.cwd(), "")
    .replace(config.buildDir, "")
    .substring(2)
    .replace(".html", "")}.png`;

  const tag = `<meta property="og:image" content=${imgUrl} />`;
  const newContent =
    content.slice(0, index) + tag + "\n" + content.slice(index);

  await writeFile(pathString, newContent);
}

function checkFileExists(file) {
  return access(file, constants.F_OK)
    .then(() => true)
    .catch(() => false);
}
