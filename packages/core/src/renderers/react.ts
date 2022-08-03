import React from "react";
import ReactDOM from "react-dom";

export async function renderScreenshots(
  component: React.ComponentType<{}> & {
    beforeScreenshot?: (element: HTMLElement) => Promise<void>;
  }
) {
  const root = document.getElementById("root")!;

  if (typeof component !== "function") {
    // This is not a component.
    // continue;
    throw Error("Component is not a function");
  }
  root.innerHTML = "";
  try {
    ReactDOM.render(
      React.createElement(component, (component as any).args || {}),
      root
    );
    const beforeScreenshot = (component as any).beforeScreenshot;
    if (beforeScreenshot) {
      await beforeScreenshot(root);
    }
  } catch (e) {
    root.innerHTML = `<pre class="viteshot-error">${
      (e as any).stack || e
    }</pre>`;
  }

  await window.__takeScreenshot__();
  ReactDOM.unmountComponentAtNode(root);
}
