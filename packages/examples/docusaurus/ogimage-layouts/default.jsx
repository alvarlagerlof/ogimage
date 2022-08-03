export default function Default() {
  const { title = "No title", description = "No description" } =
    window.meta ?? {};

  return (
    <>
      <p>default layout</p>
      <h1>{title}</h1>
      <h2>{description}</h2>
    </>
  );
}
