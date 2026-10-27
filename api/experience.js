import { handleApiRequest } from "../lib/app.js";

export default async function handler(req, res) {
  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
  const proto = req.headers["x-forwarded-proto"] || "https";
  await handleApiRequest(req, res, new URL("/api/experience", `${proto}://${host}`));
}
