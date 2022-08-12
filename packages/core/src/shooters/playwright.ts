import { Metadata } from "metascraper";
import path from "path";
import playwright from "playwright";

const DEFAULT_TIMEOUT_MILLIS = 2 * 60 * 1000;

export default async function shoot(
  browser: playwright.Browser,
  pathString: string,
  buildDir: string,
  meta: Metadata,
  url: string
) {
  const page = await browser.newPage();

  page.setDefaultTimeout(DEFAULT_TIMEOUT_MILLIS);

  await page.exposeFunction("__meta__", async () => <Metadata>meta);

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

    await page.screenshot({
      fullPage: true,
      path: screenshotPath,
    });
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
