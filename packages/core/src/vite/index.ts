import { Server } from "http";
import * as vite from "vite";

import { FrameworkOptions, WrapperConfig } from "../types.js";
import setupApp from "./app.js";
import { getRelativeFilePaths } from "./paths.js";
import setupServer from "./server.js";

export interface Options {
  framework: FrameworkOptions;
  projectPath: string;
  port: number;
  wrapper?: WrapperConfig;
  vite?: vite.UserConfig;
}

export default async function startRenderer(options: Options) {
  const relativeFilePaths = await getRelativeFilePaths(options.projectPath);

  if (relativeFilePaths.length === 0) {
    throw new Error("No files found");
  }

  const viteServer = await setupServer(options);
  const app = setupApp(viteServer);

  let server!: Server;
  await new Promise((resolve) => (server = app.listen(options.port, resolve)));
  return async () => {
    await viteServer.close();
    await server.close();
  };
}
