import { parse, Document } from "parse5";

import { MetaData } from "./types.js";

function getByTag(document: Document, name: string): Element[] {
  const results: Element[] = [];

  const walk = (childNodes: NodeListOf<ChildNode>) => {
    childNodes.forEach((node: Element) => {
      if (node.tagName && node.tagName == name) {
        results.push(node);
      }

      if (node.childNodes) {
        walk(node.childNodes);
      }
    });
  };

  walk(document.childNodes);

  return results;
}

function getValue(element: Element): string {
  if (element.childNodes) {
    return element.childNodes[0].value;
  }
}

function getByName(elements: Element[], name: string): string | undefined {
  const found: Element = elements.find((element: Element) => {
    if (element.attrs) {
      return element.attrs[0].value === name;
    }
    return false;
  });

  return found?.attrs[1]?.value;
}

export default function extractMeta(html: string): MetaData {
  const parsed = parse(html);

  const title = getByTag(parsed, "title")[0];
  const meta = getByTag(parsed, "meta");

  return {
    meta: {
      title: getValue(title),
      description: getByName(meta, "description"),
      author: getByName(meta, "author"),
      url: getByName(meta, "url"),
      og: {
        title: getByName(meta, "og:title"),
        description: getByName(meta, "og:description"),
        author: getByName(meta, "og:author"),
        url: getByName(meta, "og:url"),
      },
    },
    layout: getByName(meta, "og:image:gen:layout"),
    data: getByName(meta, "og:image:gen:data"),
  };
}
