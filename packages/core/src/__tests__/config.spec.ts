import mock from "mock-fs";

import loadConfig from "../config.js";
import loadNodeModules from "./utils/loadNodeModules.js";

describe("CONFIG", () => {
  test("load config", async () => {
    mock({
      "ogimage.json": `{
              "buildDir": "build",
              "domain": "example.com",
              "layoutsDir": "ogimage-layouts"
          }`,
    });

    const config = await loadConfig();

    mock.restore();

    expect(config.buildDir).toBe("build");
    expect(config.domain).toBe("example.com");
    expect(config.layoutsDir).toBe("ogimage-layouts");
  });

  test("fail on no config", async () => {
    mock();

    mock.restore();

    await expect(async () => await loadConfig()).rejects.toThrow();
  });

  test("fail on no incorrect config", async () => {
    mock({
      "ogimage.json": `{
              "buildDir": "build",
              "domain": "example.com",
          }`,
    });

    mock.restore();

    await expect(async () => await loadConfig()).rejects.toThrow();
  });
});
