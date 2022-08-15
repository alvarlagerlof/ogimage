import { readFile } from "node:fs/promises";

import metascraper, { Metadata } from "metascraper";
import metascraperTitle from "metascraper-title";
import metascraperImage from "metascraper-image";
import metascraperDate from "metascraper-date";
import metascraperDescription from "metascraper-description";
import metascraperPublisher from "metascraper-publisher";
import metascraperAuthor from "metascraper-author";

export default async function extractMeta(
  pathString: string
): Promise<Metadata> {
  const content = (await readFile(pathString)).toString();

  const scrape = metascraper([
    metascraperTitle(),
    metascraperImage(),
    metascraperDate(),
    metascraperDescription(),
    metascraperPublisher(),
    metascraperAuthor(),
  ]);

  return await scrape({ url: null, html: content, validateUrl: false });
}
