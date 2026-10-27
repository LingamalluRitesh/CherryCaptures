import { handleApiRequest } from "../lib/app.js";

export default async function handler(request, response) {
  const host = request.headers["x-forwarded-host"] || request.headers.host || "localhost";
  const proto = request.headers["x-forwarded-proto"] || "https";
  const url = new URL(request.url || "/", `${proto}://${host}`);

  // Polyfill response.writeHead and response.end if running in an Express-like Vercel environment
  if (!response.writeHead && response.status && response.setHeader) {
    response.writeHead = (statusCode, headers) => {
      response.status(statusCode);
      if (headers) {
        for (const [key, val] of Object.entries(headers)) {
          response.setHeader(key, val);
        }
      }
      return response;
    };
  }

  const handled = await handleApiRequest(request, response, url);
  if (!handled) {
    response.writeHead(404, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: "Endpoint not found" }));
  }
}
