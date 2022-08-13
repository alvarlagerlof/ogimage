import { readFile } from "node:fs/promises";

import metascraper, { Metadata } from "metascraper";
import metascraperTitle from "metascraper-title";
import metascraperImage from "metascraper-image";
import metascraperDate from "metascraper-date";
import metascraperDescription from "metascraper-description";
import metascraperPublisher from "metascraper-publisher";

export default async function extractMeta(
  pathString: string
): Promise<Metadata> {
  const content = (await readFile(pathString)).toString();

  const scraper = await metascraper([
    metascraperTitle(),
    metascraperImage(),
    metascraperDate(),
    metascraperDescription(),
    metascraperPublisher(),
  ]);

  return await scraper({ url: null, html: content, validateUrl: false });
}
