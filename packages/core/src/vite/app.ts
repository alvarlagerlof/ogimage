import * as vite from "vite";
import connect from "connect";

export default function setupApp(viteServer: vite.ViteDevServer) {
  const app = connect();

  app.use(async (req, res, next) => {
    if (req.originalUrl.split("?")[0] !== "/") {
      return next();
    }

    // TODO: Remove example.com
    const url = new URL("http://example.com" + req.originalUrl);
    const layout = url.searchParams.get("layout");

    const html = await viteServer.transformIndexHtml(
      req.originalUrl,
      `
          <!DOCTYPE html>
          <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <style>
              * {
                transition: none !important;
                animation: none !important;
              }
              .viteshot-error {
                color: #e00;
              }
              </style>
            </head>
            <body>
              <div id="root"></div>
              <script type="module" src="/__main__.tsx"></script>
              <script type="module" src="/__renderer__${layout}.tsx"></script>
            </body>
          </html>
          `
    );
    res.setHeader("Content-Type", "text/html");
    res.end(html);
  });
  app.use(viteServer.middlewares);

  return app;
}
