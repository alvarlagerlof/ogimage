import mock from "mock-fs";
import path from "node:path";

import extractMeta from "../extractMeta.js";
import loadNodeModules from "./utils/loadNodeModules.js";
import { makeComplexHtml, makeHtml } from "./utils/makeHtml.js";

describe("METADATA", () => {
  test("basic", async () => {
    mock({
      build: {
        "index.html": makeHtml("Start page", "Some description"),
      },
      ...loadNodeModules(),
    });

    const metadata = await extractMeta(path.resolve("./build/index.html"));

    expect(metadata.title).toBe("Start page");
    expect(metadata.description).toBe("Some description");

    mock.restore();
  });

  test("advanced", async () => {
    console.log(
      makeComplexHtml(
        "About page",
        "About us",
        "A person",
        "https://example.com"
      )
    );

    mock({
      build: {
        "index.html": makeComplexHtml(
          "About page",
          "About us",
          "A person",
          "https://example.com"
        ),
      },
      ...loadNodeModules(),
    });

    const metadata = await extractMeta(path.resolve("./build/index.html"));

    expect(metadata.title).toBe("About page");
    expect(metadata.description).toBe("About us");
    expect(metadata.author).toBe("A person");
    expect(metadata.url).toBe("https://example.com");

    mock.restore();
  });
});
