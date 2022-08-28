import playwright from "playwright";
import terminalImage from "terminal-image";

import { MetaData } from "./types.js";

export default async function capture(
  page: playwright.Page,
  url: string,
  meta: MetaData,
  screenshotPath: string
) {
  page.setDefaultTimeout(2 * 60 * 1000);

  // eslint-disable-next-line @typescript-eslint/require-await
  await page.exposeFunction("__meta__", async () => meta);

  await page.exposeFunction("__takeScreenshot__", async () => {
    await page.screenshot({
      path: screenshotPath,
    });

    // console.log(
    //   await terminalImage.file(screenshotPath, {
    //     width: "100%",
    //     height: "100%",
    //   })
    // );
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
