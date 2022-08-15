export default function makeDefaultReact() {
  return `
    export default function Default({
        title = "No title",
        description = "No description",
      }) {
        return (
          <>
            <p>default layout</p>
            <h1>{title}</h1>
            <h2>{description}</h2>
          </>
        );
      }
      `;
}
