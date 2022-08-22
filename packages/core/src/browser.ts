import { chromium, Browser } from "playwright";

export default async function startBrowser(): Promise<Browser> {
  return await chromium.launch({
    executablePath: process.env.PUPPETEER_EXEC_PATH,
    headless: false,
  });
}
