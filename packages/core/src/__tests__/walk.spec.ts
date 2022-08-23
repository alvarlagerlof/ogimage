import { walkPath } from "../paths.js";
import { setupTmpDir, writeNestedFile } from "./utils/fsHelper.js";
import { makeHtml } from "./utils/makeHtml.js";

describe("WALK", () => {
  test("basic build dir", async () => {
    await setupTmpDir();

    await writeNestedFile(
      "build/index.html",
      makeHtml("Start page", "Some description")
    );

    await writeNestedFile(
      "build/about.html",
      makeHtml("About page", "Some description")
    );

    const pathStrings = await walkPath("build");

    expect(pathStrings.length).toBe(2);
  });

  test("nested build dir", async () => {
    await setupTmpDir();

    await writeNestedFile(
      "build/index.html",
      makeHtml("Start page", "Some description")
    );

    await writeNestedFile(
      "build/about.html",
      makeHtml("About page", "About us")
    );

    await writeNestedFile(
      "build/blog/1.html",
      makeHtml("First post", "This is the first post")
    );

    const pathStrings = await walkPath("build");

    expect(pathStrings.length).toBe(3);
  });
});
