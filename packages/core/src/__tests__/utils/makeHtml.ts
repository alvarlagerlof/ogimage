export function makeHtml(title: string, description: string) {
  return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
          <meta name="description" content="${description}">
      </head>
      <body></body>
      </html>
      `;
}

export function makeComplexHtml(
  title: string,
  description: string,
  author: string,
  url: string
) {
  return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title}</title>
            <meta name="description" content="${description}">
            <meta name="author" content="${author}">
            <meta name="url" content="${url}">
            <meta name="og:title" content="${title}">
            <meta name="og:description" content="${description}">
            <meta name="og:author" content="${author}">
            <meta name="og:url" content="${url}">
        </head>
        <body></body>
        </html>
        `;
}

export function makeCustomHtml(
  title: string,
  description: string,
  layout: string,
  data: unknown
) {
  const json = JSON.stringify(data);
  const buffer = Buffer.from(json, "utf-8").toString("base64");

  return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title}</title>
            <meta name="description" content="${description}">
            <meta name="og:image:gen:layout" content=${layout}>
            <meta name="og:image:gen:data" content="${buffer}">

        </head>
        <body></body>
        </html>
        `;
}
