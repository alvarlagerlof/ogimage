import { readFile } from "node:fs/promises";
import getMetaData, { MetaData } from "metadata-scraper";

export default async function extractMeta(
  pathString: string
): Promise<MetaData> {
  const content = (await readFile(pathString)).toString();

  return (await getMetaData({
    html: content,

    customRules: {
      facebook: {
        rules: [
          [
            'meta[property="og:image:layout"][content]',
            (element) => element.getAttribute("content"),
          ],
        ],
        processor: (text) => text.toLowerCase(),
      },
    },
    // customRules: {
    //   layout: {
    //     rules: [
    //       [
    //         'meta[name="og:image:layout"][content]',
    //         (element: Element) => element.getAttribute("content"),
    //       ],
    //     ],
    //     processor: (text: string) => text.toLowerCase(),
    //   },
    // },
  })) as MetaData;
}
