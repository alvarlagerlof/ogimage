import path from "node:path";
import mock from "mock-fs";

import loadConfig from "../src/config.js";
import { walkPath } from "../src/paths.js";

function generateHtmlFile(title: string, description: string) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <meta name="description" content="${description}">
    </head>
    <body></body>
    </html>
    `;
}

describe("metadata", () => {
  const fileStructure = {
    "ogimage.json": `{
        "buildDir": "build",
        "domain": "example.com",
        "layoutsDir": "ogimage-layouts"
    }`,
    build: {
      "index.html": generateHtmlFile("Start page", "Some description"),
      "about.html": generateHtmlFile("About us", "We're makers of a website"),
      blog: {
        "1.html": generateHtmlFile(
          "This is the first post",
          "We didn't bother writing something"
        ),
        "2.html": generateHtmlFile(
          "This is the second post",
          "Probably just lorem ipsum below"
        ),
      },
    },
    node_modules: mock.load(path.resolve(__dirname, "../../../node_modules")),
  };

  beforeEach(() => {
    mock(fileStructure);
  });

  test("load config", async () => {
    const config = await loadConfig();

    expect(config.buildDir).toBe("build");
    expect(config.domain).toBe("example.com");
    expect(config.layoutsDir).toBe("ogimage-layouts");
  });

  test("walk build dir", async () => {
    const config = await loadConfig();

    const pathStrings = await walkPath(config.buildDir);

    expect(pathStrings.length).toBe(4);
  });

  afterEach(() => {
    mock.restore();
  });
});
