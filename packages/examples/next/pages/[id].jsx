/* eslint-disable @next/next/no-img-element */
import Head from "next/head";

export default function Post({ title, body, image }) {
  return (
    <div>
      <Head>
        <title>{title}</title>
        <meta name="description" content={body.substring(0, 50)} />
      </Head>

      <h1>{title}</h1>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <em>Written by</em>

        <img
          src={image}
          alt="Author"
          style={{
            objectFit: "cover",
            width: "50px",
            height: "50px",
            borderRadius: "50%",
          }}
        />
      </div>

      <p>{body}</p>
    </div>
  );
}

async function fetchPosts() {
  const posts = await fetch("https://jsonplaceholder.typicode.com/posts").then(
    (res) => res.json()
  );

  // const morePosts = posts.map((post) => [
  //   ...posts.map((item, index) => ({ ...item, id: post.id + item.id + index })),
  // ]);

  // console.log(morePosts);

  // Array.from({length: times}, () => func());

  let counter = 0;

  const morePosts = [...new Array(2)]
    .map(() => {
      return posts.map((post) => {
        counter++;
        if (counter === 404 || counter === 500) counter++;
        return {
          ...post,
          id: counter,
        };
      });
    })
    .flat();

  return morePosts.map((item, index) => {
    return { ...item, image: `https://placem.at/people?w=${400 + index}` };
  });
}

export async function getStaticProps({ params }) {
  const posts = await fetchPosts();

  const post = posts.find((post) => post.id.toString() === params.id);

  return {
    props: {
      ...post,
    },
  };
}

export async function getStaticPaths() {
  const posts = await fetchPosts();

  const paths = posts.map((post) => ({
    params: { id: post.id.toString() },
  }));

  return { paths, fallback: false };
}
