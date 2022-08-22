import React from "react";
import ReactDOM from "react-dom";

import { MetaData } from "../types.js";

export async function renderScreenshot(
  component: React.ComponentType,
  meta: MetaData
) {
  const root = document.getElementById("root");

  if (typeof component !== "function") {
    throw Error("Component is not a function");
  }

  console.log("react ran");

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
