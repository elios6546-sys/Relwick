// Point d'entrée de production du site (Next.js) pour un hébergeur Node.js
// qui attend un fichier à lancer : `node server.js`.
// Le site doit avoir été compilé avant (`pnpm build:web`).
const http = require("http");
const path = require("path");

const webDir = path.join(__dirname, "apps", "web");
const next = require(require.resolve("next", { paths: [webDir] }));

const port = Number(process.env.PORT) || 3000;
const app = next({ dev: false, dir: webDir });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    http
      .createServer((req, res) => handle(req, res))
      .listen(port, () => {
        console.log(`Relwick (site) en écoute sur le port ${port}`);
      });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
