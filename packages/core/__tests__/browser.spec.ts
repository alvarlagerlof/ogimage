import startBrowser from "../src/browser.js";

test("it starts", async () => {
  const browser = await startBrowser();
  await expect(browser).toBeDefined();

  await browser.close();
});
