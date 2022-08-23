import path from "path";
import playwright from "playwright";
import terminalImage from "terminal-image";

import { MetaData } from "./types.js";

export default async function capture(
  browser: playwright.Browser,
  pathString: string,
  buildDir: string,
  meta: MetaData,
  url: string
) {
  const page = await browser.newPage();

  page.setDefaultTimeout(2 * 60 * 1000);

  // eslint-disable-next-line @typescript-eslint/require-await
  await page.exposeFunction("__meta__", async () => meta);

  const screenshotPath = path.resolve(
    path.resolve(buildDir, "ogimage"),
    pathString
      .replace(process.cwd(), "")
      .replace(buildDir, "")
      .substring(2)
      .replace(".html", "") + ".jpg"
  );

  await page.exposeFunction("__takeScreenshot__", async () => {
    await page.screenshot({
      path: screenshotPath,
    });

    console.log(
      await terminalImage.file(screenshotPath, {
        width: "100%",
        height: "100%",
      })
    );
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

  if (errorMessage) {
    throw new Error(errorMessage);
  }
}
