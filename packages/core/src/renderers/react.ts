import { Metadata } from "metascraper";
import React from "react";
import ReactDOM from "react-dom";

export async function renderScreenshot(
  component: React.ComponentType,
  meta: Metadata
) {
  const root = document.getElementById("root");

  if (typeof component !== "function") {
    throw Error("Component is not a function");
  }

  root.innerHTML = "";

  try {
    ReactDOM.render(
      React.createElement(component, (meta ?? {}) as React.Attributes),
      root
    );
  } catch (e) {
    const error = e as Error;
    root.innerHTML = `<pre class="viteshot-error">${
      error.stack || error.toString()
    }</pre>`;
  }

  await window.__takeScreenshot__();
  ReactDOM.unmountComponentAtNode(root);
}
