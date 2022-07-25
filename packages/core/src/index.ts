#!/usr/bin/env node
import { constants } from "node:fs";
import { readFile, access, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import logSymbols from "log-symbols";
import chalk from "chalk";

import metascraper from "metascraper";
import metascraperTitle from "metascraper-title";
import metascraperImage from "metascraper-image";
import metascraperDate from "metascraper-date";
import metascraperDescription from "metascraper-description";
import metascraperPublisher from "metascraper-publisher";
import puppeteer, { Browser } from "puppeteer";

interface Config {
  buildDir: string;
  domain: string;
}

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

(async function run() {
  if (await checkFileExists("ogimage.json")) {
    const file = await readFile("ogimage.json", "utf8");
    const config = JSON.parse(file) as Config;

    log.info("Starting browser");
    const browser = await startBrowser();

    log.info("Looking for html files in", config.buildDir);
    await walkPath(config, config.buildDir);

    log.info("Stopping browser");
    browser.close();
    log.success("Browser stopped");
  } else {
    log.error("Did not find config file");
  }
})();

function shouldExclude(dirOrFile: string): boolean {
  const exclude = ["404", "500"].some((item) => dirOrFile.includes(item));
  if (exclude) log.warning("Excluded", dirOrFile);
  return exclude;
}

async function walkPath(config: Config, basePath: string) {
  if (shouldExclude(basePath)) return;

  const pathContent = await readdir(basePath, { withFileTypes: true });

  const files = pathContent
    .filter((item) => item.isFile())
    .filter((file) => path.extname(file.name).toLowerCase() == ".html")
    .filter((file) => !shouldExclude(file.name))
    .map((file) => file.name);

  await Promise.allSettled(
    files.map((file) => {
      new Promise<void>(async (resolve, reject) => {
        try {
          const pathString = path.resolve(basePath, file);

          const meta = await extractMeta(pathString);
          await addOgImageTag(config, pathString);
          await screenshot(meta);

          log.success(
            "Done",
            pathString.replace(process.cwd(), "").substring(1)
          );
          resolve();
        } catch (e) {
          log.error("Failed to handle file", file, e.message);
          reject(e);
        }
      });
    })
  );
  const directories = pathContent
    .filter((item) => !item.isFile())
    .map((directory) => directory.name);

  return await Promise.allSettled(
    directories.map((directory) => {
      new Promise<void>(async (resolve, reject) => {
        try {
          await walkPath(config, `${basePath}/${directory}`);
          resolve();
        } catch {
          reject();
        }
      });
    })
  );
}

async function startBrowser() {
  try {
    const browser = await puppeteer.launch({
      executablePath: process.env.PUPPETEER_EXEC_PATH,
      headless: true,
    });

    log.success("Started browser");
    return browser;
  } catch (e) {
    log.error("Failed to start browser", e.message);
  }
}

async function extractMeta(pathString: string) {
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
    .replace(".html", "")}.jpg`;

  const tag = `<meta property="og:image" content=${imgUrl} />`;
  const newContent =
    content.slice(0, index) + tag + "\n" + content.slice(index);

  await writeFile(pathString, newContent);
}

async function screenshot(meta: any) {}

function checkFileExists(file) {
  return access(file, constants.F_OK)
    .then(() => true)
    .catch(() => false);
}
