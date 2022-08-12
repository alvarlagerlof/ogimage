import React from "react";
import ReactDOM from "react-dom";

export async function renderScreenshot(component: React.ComponentType<{}>) {
  const root = document.getElementById("root")!;

  if (typeof component !== "function") {
    throw Error("Component is not a function");
  }

  root.innerHTML = "";

  try {
    ReactDOM.render(
      React.createElement(component, (component as any).args || {}),
      root
    );
  } catch (e) {
    root.innerHTML = `<pre class="viteshot-error">${
      (e as any).stack || e
    }</pre>`;
  }

  await window.__takeScreenshot__();
  ReactDOM.unmountComponentAtNode(root);
}
