const [watch] = process.argv.slice(2);
import { build } from "esbuild";

let watchModeOptions = {};

if (watch) {
  watchModeOptions = {
    watch: {
      onRebuild(error, result) {
        if (error) console.error("watch build failed:", error);
        else console.log("watch build succeeded:", result);
      },
    },
  };
}

build({
  entryPoints: ["src/index.ts"],
  outdir: "dist",
  platform: "node",
  bundle: true,
  external: ["canvas", "re2", "jsdom", "./xhr-sync-worker.js"],
  // minify: false,
  sourcemap: true,
  target: ["node16"],
  format: "esm",
  ...watchModeOptions,
}).catch(() => process.exit(1));
