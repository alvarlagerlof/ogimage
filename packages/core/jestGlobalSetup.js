import rimraf from "rimraf";

export default () => {
  rimraf("./src/__tests__/utils/.tmp-jest", function () {
    // console.log("Cleared .tmp-jest");
  });
};
