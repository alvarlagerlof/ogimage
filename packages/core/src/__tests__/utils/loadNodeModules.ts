import mock from "mock-fs";
import url from "node:url";

export default function loadNodeModules() {
  console.log(url.fileURLToPath(new URL("../../../", import.meta.url)));

  return {
    src: mock.load(url.fileURLToPath(new URL("../../../src", import.meta.url))),
    dist: mock.load(
      url.fileURLToPath(new URL("../../../dist", import.meta.url))
    ),
    "../../node_modules": mock.load(
      url.fileURLToPath(new URL("../../../../../node_modules", import.meta.url))
    ),
    node_modules: mock.load(
      url.fileURLToPath(new URL("../../../node_modules", import.meta.url))
    ),
    "/@fs/var/home/alvar/Code/alvarlagerlof/ogimage/packages/core": mock.load(
      url.fileURLToPath(new URL("../../../", import.meta.url))
    ),
  };
}
