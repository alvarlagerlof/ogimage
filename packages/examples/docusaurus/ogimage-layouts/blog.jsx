export default function Blog() {
  const { title = "No title", description = "No description" } =
    window.meta ?? {};

  return (
    <>
      <p>blog layout</p>
      <h1>{title}</h1>
      <h2>{description}</h2>
    </>
  );
}
