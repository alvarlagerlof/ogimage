import startBrowser from "../src/browser.js";

test("it starts", async () => {
  const browser = await startBrowser();
  expect(browser).toBeDefined();

  await browser.close();
});

test("it can open a page", async () => {
  const browser = await startBrowser();
  await browser.newPage();
  await browser.close();
});

test("it can open load an url", async () => {
  const browser = await startBrowser();
  const page = await browser.newPage();

  const loadUrl = "https://example.com";
  await page.goto(loadUrl, { waitUntil: "domcontentloaded" });

  const returnedUrl = await page.evaluate(() => {
    return window.location.origin;
  });

  expect(returnedUrl).toBe(loadUrl);

  await browser.close();
});
