import mock from "mock-fs";
import url from "node:url";

export default function loadNodeModules() {
  return {
    src: mock.load(url.fileURLToPath(new URL("../../../src", import.meta.url))),
    "../../node_modules": mock.load(
      url.fileURLToPath(new URL("../../../../../node_modules", import.meta.url))
    ),
    node_modules: mock.load(
      url.fileURLToPath(new URL("../../../node_modules", import.meta.url))
    ),
  };
}
