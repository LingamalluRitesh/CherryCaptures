import { handleApiRequest } from "../../lib/app.js";

export default async function handler(req, res) {
  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
  const proto = req.headers["x-forwarded-proto"] || "https";
  const slug = Array.isArray(req.query?.slug) ? req.query.slug.join("/") : (req.query?.slug || "");
  const url = new URL(`/api/admin/${slug}`, `${proto}://${host}`);
  await handleApiRequest(req, res, url);
}
