import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { handleApiRequest, secureHeaders, getAdminPassword } from "./lib/app.js";
import { getDbStatus } from "./lib/db.js";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)));
try {
  process.loadEnvFile(resolve(root, ".env"));
} catch {}

const dataDirectory = resolve(root, "data");
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "127.0.0.1";

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml"
};

async function serveFile(request, response, pathname) {
  const relative = pathname === "/" ? "index.html" : decodeURIComponent(pathname.slice(1));
  const file = resolve(root, relative);
  if (!file.startsWith(root + sep) || file.startsWith(dataDirectory + sep)) {
    response.writeHead(404, secureHeaders());
    response.end("Not found");
    return;
  }
  try {
    const data = await readFile(file);
    response.writeHead(200, {
      ...secureHeaders(),
      "Content-Type": contentTypes[extname(file).toLowerCase()] || "application/octet-stream",
      "Cache-Control": extname(file) === ".html" ? "no-cache" : "public, max-age=3600"
    });
    if (request.method === "HEAD") response.end();
    else response.end(data);
  } catch {
    response.writeHead(404, secureHeaders());
    response.end("Not found");
  }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || "/", "http://" + (request.headers.host || "localhost"));
  try {
    const handled = await handleApiRequest(request, response, url);
    if (handled) return;

    if (request.method === "GET" || request.method === "HEAD") {
      await serveFile(request, response, url.pathname);
      return;
    }

    response.writeHead(405, secureHeaders());
    response.end("Method not allowed");
  } catch (error) {
    console.error("Server error:", error);
    response.writeHead(500, secureHeaders());
    response.end("Internal Server Error");
  }
});

server.listen(port, host, async () => {
  console.log("Cherry Captures is running at http://" + host + ":" + port);
  const status = await getDbStatus();
  console.log("Database status:", status.message);
  console.log("Admin password:", getAdminPassword());
});
