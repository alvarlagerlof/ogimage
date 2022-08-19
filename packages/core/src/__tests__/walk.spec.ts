import mock from "mock-fs";

import loadConfig from "../config.js";
import { walkPath } from "../paths.js";
import { DirectoryItems } from "mock-fs/lib/filesystem.js";
import loadNodeModules from "./utils/loadNodeModules.js";
import { makeHtml } from "./utils/makeHtml.js";

const data = [
  [
    {
      "ogimage.json": `{
        "buildDir": "build",
        "domain": "example.com",
        "layoutsDir": "ogimage-layouts"
    }`,
      build: {
        "index.html": makeHtml("Start page", "Some description"),
        "about.html": makeHtml("About us", "We're makers of a website"),
      },
    } as DirectoryItems,
    2,
  ],
  [
    {
      "ogimage.json": `{
        "buildDir": "generated",
        "domain": "example.com",
        "layoutsDir": "ogimage-layouts"
    }`,
      generated: {
        "index.html": makeHtml("Start page", "Some description"),
        "about.html": makeHtml("About us", "We're makers of a website"),
        blog: {
          "index.html": makeHtml("All blog posts", "List of all posts"),
          1: {
            "index.html": makeHtml(
              "This is the first post",
              "We didn't bother writing something"
            ),
          },
          2: {
            "index.html": makeHtml(
              "This is the second post",
              "Probably just lorem ipsum below"
            ),
          },
        },
      },
    } as DirectoryItems,
    5,
  ],
];

describe.each(data)("WALK", (fileStructure: DirectoryItems, expectedLength) => {
  beforeEach(() => {
    mock(fileStructure);
  });

  test("walk build dir", async () => {
    const config = await loadConfig();
    const pathStrings = await walkPath(config.buildDir);

    expect(pathStrings.length).toBe(expectedLength);
  });

  afterEach(() => {
    mock.restore();
  });
});
