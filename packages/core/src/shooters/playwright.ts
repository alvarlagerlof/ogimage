import fs from "fs";
import path from "path";
import playwright from "playwright";
import { Shooter } from "../config.js";

const DEFAULT_TIMEOUT_MILLIS = 2 * 60 * 1000;

export default async function shoot(
  browser: playwright.Browser,
  pathString: string,
  buildDir: string,
  meta: any,
  url: string
) {
  const page = await browser.newPage();

  page.setDefaultTimeout(DEFAULT_TIMEOUT_MILLIS);

  // Ensure all images are loaded.
  // Source: https://stackoverflow.com/a/49233383
  // await page.evaluate(async () => {
  //   const selectors = Array.from(document.querySelectorAll("img"));
  //   await Promise.all(
  //     selectors.map((img) => {
  //       if (img.complete) {
  //         return;
  //       }
  //       return new Promise((resolve) => {
  //         img.addEventListener("load", resolve);
  //         // If an image fails to load, ignore it.
  //         img.addEventListener("error", resolve);
  //       });
  //     })
  //   );
  // });
  const logs = [];

  await page.exposeFunction("__takeScreenshot__", async () => {
    const screenshotDirPath = path.resolve(buildDir, "ogimage");

    const screenshotPath = path.resolve(
      screenshotDirPath,
      pathString
        .replace(process.cwd(), "")
        .replace(buildDir, "")
        .substring(2)
        .replace(".html", "") + ".png"
    );
    page.on("console", (message) => {
      logs.push(message.text());
    });

    await page.evaluate((meta) => {
      window.meta = meta;
    }, meta);

    await page.screenshot({
      fullPage: true,
      path: screenshotPath,
    });
  });

  await page.exposeFunction("__getMeta__", () => {
    return meta;
  });

  let errorMessage: string | null = null;
  let done!: (errorMessage?: string) => void;
  const donePromise = new Promise<void>((resolve) => {
    done = (receivedErrorMessage) => {
      if (receivedErrorMessage) {
        errorMessage = receivedErrorMessage;
      }
      resolve();
    };
  });
  await page.exposeFunction("__done__", done);

  await page.goto(url);

  await donePromise;

  console.log(logs);

  if (errorMessage) {
    throw new Error(errorMessage);
  }
}
