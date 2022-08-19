import mock from "mock-fs";
import path from "node:path";
import { readFile } from "node:fs/promises";

import extractMeta from "../extractMeta.js";
import { makeComplexHtml, makeCustomHtml, makeHtml } from "./utils/makeHtml.js";

describe("METADATA", () => {
  test("basic", async () => {
    mock({
      build: {
        "index.html": makeHtml("Start page", "Some description"),
      },
    });

    const html = (
      await readFile(path.resolve("./build/index.html"))
    ).toString();

    const extracted = extractMeta(html);

    mock.restore();

    expect(extracted.meta.title).toBe("Start page");
    expect(extracted.meta.description).toBe("Some description");
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
    });

    const html = (
      await readFile(path.resolve("./build/index.html"))
    ).toString();

    const extracted = extractMeta(html);

    mock.restore();

    expect(extracted.meta.title).toBe("About page");
    expect(extracted.meta.description).toBe("About us");
    expect(extracted.meta.author).toBe("A person");
    expect(extracted.meta.url).toBe("https://example.com");

    expect(extracted.meta.og.title).toBe("About page");
    expect(extracted.meta.og.description).toBe("About us");
    expect(extracted.meta.og.author).toBe("A person");
    expect(extracted.meta.og.url).toBe("https://example.com");
  });

  test("custom", async () => {
    mock({
      build: {
        "index.html": makeCustomHtml("About page", "About us", "blogpost", {
          foo: "bar",
        }),
      },
    });

    const html = (
      await readFile(path.resolve("./build/index.html"))
    ).toString();

    const extracted = extractMeta(html);

    const jsonString = Buffer.from(extracted.data, "base64").toString("utf-8");
    const data: unknown = JSON.parse(jsonString);

    mock.restore();

    expect(extracted.meta.title).toBe("About page");
    expect(extracted.meta.description).toBe("About us");
    expect(data).toStrictEqual({ foo: "bar" });
    expect(extracted.layout).toBe("blogpost");
  });
});
