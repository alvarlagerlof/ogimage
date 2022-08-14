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
      ...loadNodeModules(),
    });

    const config = await loadConfig();

    expect(config.buildDir).toBe("build");
    expect(config.domain).toBe("example.com");
    expect(config.layoutsDir).toBe("ogimage-layouts");

    mock.restore();
  });

  test("fail on no config", async () => {
    mock({ ...loadNodeModules() });

    await expect(async () => await loadConfig()).rejects.toThrow();

    mock.restore();
  });

  test("fail on no incorrect config", async () => {
    mock({
      "ogimage.json": `{
              "buildDir": "build",
              "domain": "example.com",
          }`,
      ...loadNodeModules(),
    });

    await expect(async () => await loadConfig()).rejects.toThrow();

    mock.restore();
  });
});
