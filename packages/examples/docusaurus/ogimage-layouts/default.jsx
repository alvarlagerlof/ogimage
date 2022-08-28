export default function Default({ meta }) {
  const { title = "No title", description = "No description" } = meta;

  return (
    <>
      <p>default layout</p>
      <h1>{title}</h1>
      <h2>{description}</h2>
    </>
  );
}
