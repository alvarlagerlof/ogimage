import path from "path";
import playwright from "playwright";
import { MetaData } from "./types.js";

const DEFAULT_TIMEOUT_MILLIS = 2 * 60 * 1000;

export default async function capture(
  browser: playwright.Browser,
  pathString: string,
  buildDir: string,
  meta: MetaData,
  url: string
) {
  const page = await browser.newPage();

  console.log(url);

  page
    // .on("console", (message) =>
    //   console.log(
    //     `${message.type().substr(0, 3).toUpperCase()} ${message.text()}`
    //   )
    // )
    // .on("pageerror", ({ message }) => console.log(message))
    // .on("response", (response) =>
    //   console.log(`${response.status()} ${response.url()}`)
    // )
    .on("requestfailed", (request) =>
      console.log(`${request.failure().errorText} ${request.url()}`)
    );

  page.setDefaultTimeout(DEFAULT_TIMEOUT_MILLIS);

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
    console.log("taking");
    await page.screenshot({
      path: screenshotPath,
    });
  });

  let errorMessage: string | null = null;
  let done!: (errorMessage?: string) => void;
  const donePromise = new Promise<void>((resolve) => {
    done = (receivedErrorMessage) => {
      console.log("done called");
      if (receivedErrorMessage) {
        errorMessage = receivedErrorMessage;
      }
      resolve();
    };
  });

  await page.exposeFunction("__done__", done);

  await page.goto(url);

  // TODO: Why does this not work in jest?
  await donePromise;

  if (errorMessage) {
    throw new Error(errorMessage);
  }
}
