import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, join, normalize, relative } from "node:path";
import { fileURLToPath } from "node:url";

const port = Number(process.env.PORT || 4173);
const basePath = "/receipts";
const distRoot = normalize(join(fileURLToPath(new URL("..", import.meta.url)), "dist"));

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json; charset=utf-8",
};

const server = createServer(async (request, response) => {
  const canSendBody = request.method === "GET";

  if (!request.url || (request.method !== "GET" && request.method !== "HEAD")) {
    response.writeHead(405).end();
    return;
  }

  const url = new URL(request.url, `http://${request.headers.host || "127.0.0.1"}`);

  if (url.pathname === "/" || url.pathname === basePath) {
    response.writeHead(308, { Location: `${basePath}/` }).end();
    return;
  }

  if (!url.pathname.startsWith(`${basePath}/`)) {
    response.writeHead(404).end("Not found");
    return;
  }

  const requestedPath = decodeURIComponent(url.pathname.slice(basePath.length + 1));
  const targetPath = await resolveStaticPath(requestedPath);

  response.writeHead(200, {
    "Content-Type": contentTypes[extname(targetPath)] || "application/octet-stream",
  });

  if (canSendBody) {
    createReadStream(targetPath).pipe(response);
    return;
  }

  response.end();
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Receipts listening on http://0.0.0.0:${port}${basePath}/`);
});

async function resolveStaticPath(requestedPath) {
  const safePath = normalize(join(distRoot, requestedPath || "index.html"));

  if (relative(distRoot, safePath).startsWith("..")) {
    return join(distRoot, "index.html");
  }

  try {
    const fileStat = await stat(safePath);

    if (fileStat.isFile()) {
      return safePath;
    }

    if (fileStat.isDirectory()) {
      const indexPath = join(safePath, "index.html");
      const indexStat = await stat(indexPath);

      if (indexStat.isFile()) {
        return indexPath;
      }
    }
  } catch {
    return join(distRoot, "index.html");
  }

  return join(distRoot, "index.html");
}
