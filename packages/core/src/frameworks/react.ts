import * as vite from "vite";
// import { svgrPlugin } from "../plugins/svgr-plugin";
import { FrameworkConfiguration } from "../types.js";

export function reactConfiguration(
  config: {
    type: "react";
  },
  viteConfig?: vite.UserConfig
): FrameworkConfiguration {
  const alias = viteConfig?.resolve?.alias;
  return {
    packages: ["react", "react-dom"],
    plugins: [
      {
        name: "react",
        transform(code: string, id: string) {
          // Since React 17, importing React is optional when building with webpack.
          // We do need the import with Vite, however.
          const reactImportRegExp = /import (\* as )?React[ ,]/;
          if (
            (id.endsWith(".js") || id.endsWith("sx")) &&
            !reactImportRegExp.test(code)
          ) {
            return `import React from "react";${code}`;
          }
          return null;
        },
      },
    ],
  };
}
