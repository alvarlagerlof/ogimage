import { Config } from "./types.js";

import { readFile, writeFile } from "node:fs/promises";

export default async function addOgImageTag(
  config: Config,
  pathString: string
) {
  const content = (await readFile(pathString)).toString();

  const index = content.indexOf("</head>");

  const imgUrl = `https://${config.domain}/ogimage/${pathString
    .replace(process.cwd(), "")
    .replace(config.buildDir, "")
    .substring(2)
    .replace(".html", "")}.jpg`;

  const tag = `<meta property="og:image" content=${imgUrl} />`;
  const newContent =
    content.slice(0, index) + tag + "\n" + content.slice(index);

  await writeFile(pathString, newContent);
}
