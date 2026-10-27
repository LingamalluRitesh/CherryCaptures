import { handleApiRequest } from "../lib/app.js";

export default async function handler(request, response) {
  const host = request.headers["x-forwarded-host"] || request.headers.host || "localhost";
  const proto = request.headers["x-forwarded-proto"] || "https";
  const url = new URL(request.url || "/", `${proto}://${host}`);

  const handled = await handleApiRequest(request, response, url);
  if (!handled) {
    response.writeHead(404, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: "Endpoint not found." }));
  }
}
