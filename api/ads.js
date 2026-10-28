import { handleApiRequest } from "../lib/app.js";

export default async function handler(req, res) {
  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
  const proto = req.headers["x-forwarded-proto"] || "https";
  const url = new URL(req.url || "/api/ads", `${proto}://${host}`);
  await handleApiRequest(req, res, url);
}
