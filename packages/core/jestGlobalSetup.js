import rimraf from "rimraf";

export default () => {
  rimraf(".tmp-jest", function () {
    // console.log("Cleared .tmp-jest");
  });
};
