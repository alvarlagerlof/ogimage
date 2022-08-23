export default function makeDefaultReact(background = "#fff") {
  return `
    export default function Default({
        meta
      }) {
        return (
          <div style={{ background: "${background}"}}>
            <p>default layout</p>
            <h1 style={{ fontSize: "11em", margin: "0px" }}>{meta.title}</h1>
            <h2 style={{ fontSize: "8em", margin: "0px" }}>{meta.description}</h2>
          </div>
        );
      }
      `;
}
