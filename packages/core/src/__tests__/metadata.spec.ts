import mock from "mock-fs";
import path from "node:path";

import extractMeta from "../extractMeta.js";
import loadNodeModules from "./utils/loadNodeModules.js";
import { makeComplexHtml, makeCustomHtml, makeHtml } from "./utils/makeHtml.js";

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

  test("custom", async () => {
    mock({
      build: {
        "index.html": makeCustomHtml("About page", "About us", "blogpost", {
          data: "something",
        }),
      },
      ...loadNodeModules(),
    });

    const metadata = await extractMeta(path.resolve("./build/index.html"));

    console.log(metadata);

    expect(metadata.title).toBe("About page");
    expect(metadata.description).toBe("About us");
    expect(metadata.facebook).toBe("blogpost");
    expect(metadata.data).toBeDefined();

    mock.restore();
  });
});
