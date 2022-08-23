import extractMeta from "../extractMeta.js";
import { makeComplexHtml, makeCustomHtml, makeHtml } from "./utils/makeHtml.js";

describe("METADATA", () => {
  test("basic", () => {
    const html = makeHtml("Start page", "Some description");
    const extracted = extractMeta(html);

    expect(extracted.meta.title).toBe("Start page");
    expect(extracted.meta.description).toBe("Some description");
  });

  test("advanced", () => {
    const html = makeComplexHtml(
      "About page",
      "About us",
      "A person",
      "https://example.com"
    );

    const extracted = extractMeta(html);

    expect(extracted.meta.title).toBe("About page");
    expect(extracted.meta.description).toBe("About us");
    expect(extracted.meta.author).toBe("A person");
    expect(extracted.meta.url).toBe("https://example.com");

    expect(extracted.meta.og.title).toBe("About page");
    expect(extracted.meta.og.description).toBe("About us");
    expect(extracted.meta.og.author).toBe("A person");
    expect(extracted.meta.og.url).toBe("https://example.com");
  });

  test("custom", () => {
    const html = makeCustomHtml("About page", "About us", "blogpost", {
      foo: "bar",
    });

    const extracted = extractMeta(html);

    const jsonString = Buffer.from(extracted.data, "base64").toString("utf-8");
    const data: unknown = JSON.parse(jsonString);

    expect(extracted.meta.title).toBe("About page");
    expect(extracted.meta.description).toBe("About us");
    expect(data).toStrictEqual({ foo: "bar" });
    expect(extracted.layout).toBe("blogpost");
  });
});
