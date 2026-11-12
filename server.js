import { createServer } from "node:http";
import { randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rename, writeFile, copyFile, readdir, stat } from "node:fs/promises";
import { extname, resolve, sep, basename } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)));
try {
  process.loadEnvFile(resolve(root, ".env"));
} catch {}

const dataDirectory = resolve(root, "data");
const publicDirectory = resolve(root, "public");
const dataFile = resolve(dataDirectory, "site-data.json");
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "0.0.0.0";
const adminPassword = process.env.ADMIN_PASSWORD || "cherrycaptures2026";
const sessionLifetime = 8 * 60 * 60 * 1000;
const sessions = new Map();
const limits = new Map();

// Known brain directory for generated images on Windows
const brainDir = "C:/Users/Ritesh/.gemini/antigravity/brain/fa04c10c-4e46-4ece-9c55-a71c159f3d08";

// Image mapping dictionary
const IMAGE_MAPPINGS = [
  { brainMatch: "luxury_wedding_invitation_promo", destNames: ["indian-invitation-video-promo.png", "indian-invitation-video-promo.jpg"] },
  { brainMatch: "grand_wedding_convention_hall", destNames: ["indian-narasaraopet-convention-grand.png", "indian-narasaraopet-convention-grand.jpg"] },
  { brainMatch: "luxury_indian_wedding_convention", destNames: ["indian-convention-hall-luxury.png", "indian-convention-hall-luxury.jpg"] },
  { brainMatch: "indian_wedding_dj_live_music", destNames: ["indian-wedding-dj-music.png", "indian-wedding-dj-music.jpg"] },
  { brainMatch: "indian_wedding_marriage", destNames: ["indian-wedding-marriage-realistic.png", "indian-wedding-marriage-realistic.jpg"] },
  { brainMatch: "indian_prewedding_sunset", destNames: ["indian-prewedding-realistic.png", "indian-prewedding-realistic.jpg"] },
  { brainMatch: "south_indian_halfsaree", destNames: ["indian-halfsaree-realistic.png", "indian-halfsaree-realistic.jpg"] },
  { brainMatch: "indian_reels_cinematography", destNames: ["indian-reels-cinematography-realistic.png", "indian-reels-cinematography-realistic.jpg"] },
  { brainMatch: "nikon_z9_studio_photography", destNames: ["nikon-camera-showcase.png", "nikon-camera-showcase.jpg"] }
];

await mkdir(dataDirectory, { recursive: true });
await mkdir(publicDirectory, { recursive: true });

// Sync brain images if present
async function syncBrainImages() {
  try {
    const brainFiles = await readdir(brainDir);
    for (const mapping of IMAGE_MAPPINGS) {
      const match = brainFiles.find(f => f.includes(mapping.brainMatch) && (f.endsWith(".jpg") || f.endsWith(".png")));
      if (match) {
        const src = resolve(brainDir, match);
        for (const dest of mapping.destNames) {
          const rootTarget = resolve(root, dest);
          const publicTarget = resolve(publicDirectory, dest);
          try { await copyFile(src, rootTarget); } catch {}
          try { await copyFile(src, publicTarget); } catch {}
        }
      }
    }
    console.log("✨ Synchronized media assets from brain directory successfully.");
  } catch (err) {
    // Brain directory not directly readable or not on this host
  }
}
await syncBrainImages();

const initialStore = {
  settings: {
    phone: "+91 97041 63008",
    whatsapp: "919704163008",
    email: "cherrycapturesofficial@gmail.com",
    instagram: "https://instagram.com/cherrycaptures"
  },
  enquiries: []
};

try {
  await readFile(dataFile, "utf8");
} catch {
  await writeFile(dataFile, JSON.stringify(initialStore, null, 2), "utf8");
}

async function readStore() {
  try {
    const stored = JSON.parse(await readFile(dataFile, "utf8"));
    return {
      settings: { ...initialStore.settings, ...(stored.settings || {}) },
      enquiries: Array.isArray(stored.enquiries) ? stored.enquiries : []
    };
  } catch {
    return structuredClone(initialStore);
  }
}

async function writeStore(store) {
  const temporary = dataFile + ".tmp";
  await writeFile(temporary, JSON.stringify(store, null, 2), "utf8");
  await rename(temporary, dataFile);
}

function sendJson(response, status, payload, extraHeaders = {}) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    ...extraHeaders
  });
  response.end(JSON.stringify(payload));
}

async function readJson(request) {
  let size = 0;
  const chunks = [];
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 1024 * 1024) throw Object.assign(new Error("Request is too large."), { status: 413 });
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw Object.assign(new Error("Please send valid form data."), { status: 400 });
  }
}

function cleanText(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

function clientKey(request) {
  return request.socket.remoteAddress || "unknown";
}

function rateLimited(request, key, maximum, windowMs) {
  const now = Date.now();
  const id = key + ":" + clientKey(request);
  const entry = limits.get(id);
  if (!entry || now - entry.start > windowMs) {
    limits.set(id, { start: now, count: 1 });
    return false;
  }
  entry.count += 1;
  return entry.count > maximum;
}

function cookieValue(request, name) {
  const header = request.headers.cookie || "";
  const item = header.split(";").map((part) => part.trim()).find((part) => part.startsWith(name + "="));
  return item ? decodeURIComponent(item.slice(name.length + 1)) : "";
}

function authorized(request) {
  const token = cookieValue(request, "cc_admin");
  const expires = sessions.get(token);
  if (!token || !expires || expires < Date.now()) {
    if (token) sessions.delete(token);
    return false;
  }
  return true;
}

function requireAdmin(request, response) {
  if (authorized(request)) return true;
  sendJson(response, 401, { error: "Please sign in again." });
  return false;
}

function safeEqual(left, right) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function secureHeaders() {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Content-Security-Policy": "default-src 'self' 'unsafe-inline' https: data: blob:;"
  };
}

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4"
};

async function serveFile(request, response, pathname) {
  const relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const file = resolve(root, relative);
  if (!file.startsWith(root) || file.startsWith(dataDirectory + sep)) {
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
    // Check fallback in brainDir if image
    const ext = extname(file).toLowerCase();
    if ([".jpg", ".png", ".jpeg"].includes(ext)) {
      const base = basename(file);
      for (const mapping of IMAGE_MAPPINGS) {
        if (mapping.destNames.includes(base)) {
          try {
            const brainFiles = await readdir(brainDir);
            const match = brainFiles.find(f => f.includes(mapping.brainMatch));
            if (match) {
              const brainPath = resolve(brainDir, match);
              const data = await readFile(brainPath);
              response.writeHead(200, {
                ...secureHeaders(),
                "Content-Type": contentTypes[ext] || "image/jpeg",
                "Cache-Control": "public, max-age=3600"
              });
              response.end(data);
              return;
            }
          } catch {}
        }
      }

      // If not on disk, serve a polished luxury gold SVG fallback
      const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
        <defs>
          <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#dfb455"/>
            <stop offset="50%" stop-color="#b38738"/>
            <stop offset="100%" stop-color="#8f651c"/>
          </linearGradient>
          <radialGradient id="bg" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stop-color="#241e17"/>
            <stop offset="100%" stop-color="#0e0d0c"/>
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)"/>
        <circle cx="400" cy="270" r="110" fill="none" stroke="url(#gold)" stroke-width="3" stroke-dasharray="6,6"/>
        <circle cx="400" cy="270" r="95" fill="none" stroke="url(#gold)" stroke-width="2"/>
        <path d="M370 240 L430 240 L440 255 L465 255 C470 255 475 260 475 265 L475 305 C475 310 470 315 465 315 L335 315 C330 315 325 310 325 305 L325 265 C325 260 330 255 335 255 L360 255 Z" fill="none" stroke="url(#gold)" stroke-width="4"/>
        <circle cx="400" cy="285" r="22" fill="none" stroke="url(#gold)" stroke-width="4"/>
        <text x="400" y="430" text-anchor="middle" font-family="'Cinzel', Georgia, serif" font-size="28" font-weight="700" letter-spacing="4" fill="url(#gold)">CHERRY CAPTURES</text>
        <text x="400" y="465" text-anchor="middle" font-family="'DM Sans', sans-serif" font-size="14" font-weight="600" letter-spacing="3" fill="#dfb455" opacity="0.85">LUXURY CINEMA &amp; CELEBRATIONS</text>
      </svg>`;
      response.writeHead(200, {
        ...secureHeaders(),
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600"
      });
      response.end(fallbackSvg);
      return;
    }
    response.writeHead(404, secureHeaders());
    response.end("Not found");
  }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || "/", "http://" + (request.headers.host || "localhost"));
  const pathname = url.pathname;
  try {
    if (pathname === "/api/settings" && request.method === "GET") {
      const store = await readStore();
      sendJson(response, 200, store.settings, secureHeaders());
      return;
    }

    if (pathname === "/api/enquiries" && request.method === "POST") {
      if (rateLimited(request, "enquiry", 8, 60 * 60 * 1000)) {
        sendJson(response, 429, { error: "Please wait a little before sending another enquiry." }, secureHeaders());
        return;
      }
      const body = await readJson(request);
      if (cleanText(body.website, 200)) {
        sendJson(response, 201, { ok: true }, secureHeaders());
        return;
      }
      const enquiry = {
        id: randomUUID(),
        name: cleanText(body.name, 100),
        email: cleanText(body.email, 180),
        service: cleanText(body.service, 120),
        date: cleanText(body.date, 30),
        location: cleanText(body.location, 140),
        message: cleanText(body.message, 3000),
        status: "new",
        createdAt: new Date().toISOString()
      };
      if (!enquiry.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enquiry.email) || !enquiry.service) {
        sendJson(response, 400, { error: "Please check your name, email, and service." }, secureHeaders());
        return;
      }
      const store = await readStore();
      store.enquiries.unshift(enquiry);
      await writeStore(store);
      sendJson(response, 201, { ok: true }, secureHeaders());
      return;
    }

    if (pathname === "/api/admin/session" && request.method === "GET") {
      sendJson(response, 200, { authenticated: authorized(request) }, secureHeaders());
      return;
    }

    if (pathname === "/api/admin/login" && request.method === "POST") {
      if (rateLimited(request, "login", 8, 15 * 60 * 1000)) {
        sendJson(response, 429, { error: "Too many attempts. Please wait a few minutes." }, secureHeaders());
        return;
      }
      const body = await readJson(request);
      if (!safeEqual(String(body.password || ""), adminPassword)) {
        sendJson(response, 401, { error: "That password didn’t match. Try again." }, secureHeaders());
        return;
      }
      const token = randomBytes(32).toString("hex");
      sessions.set(token, Date.now() + sessionLifetime);
      const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
      sendJson(response, 200, { ok: true }, {
        ...secureHeaders(),
        "Set-Cookie": "cc_admin=" + token + "; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800" + secure
      });
      return;
    }

    if (pathname === "/api/admin/logout" && request.method === "POST") {
      const token = cookieValue(request, "cc_admin");
      if (token) sessions.delete(token);
      sendJson(response, 200, { ok: true }, {
        ...secureHeaders(),
        "Set-Cookie": "cc_admin=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0"
      });
      return;
    }

    if (pathname === "/api/admin/enquiries" && request.method === "GET") {
      if (!requireAdmin(request, response)) return;
      const store = await readStore();
      sendJson(response, 200, store.enquiries, secureHeaders());
      return;
    }

    if (pathname.startsWith("/api/admin/enquiries/") && request.method === "PATCH") {
      if (!requireAdmin(request, response)) return;
      const id = pathname.slice("/api/admin/enquiries/".length);
      const body = await readJson(request);
      const status = cleanText(body.status, 20);
      if (!["new", "in_discussion", "booked", "closed"].includes(status)) {
        sendJson(response, 400, { error: "Invalid status value." }, secureHeaders());
        return;
      }
      const store = await readStore();
      const enquiry = store.enquiries.find((item) => item.id === id);
      if (!enquiry) {
        sendJson(response, 404, { error: "Enquiry not found." }, secureHeaders());
        return;
      }
      enquiry.status = status;
      await writeStore(store);
      sendJson(response, 200, enquiry, secureHeaders());
      return;
    }

    if (pathname === "/api/admin/settings" && request.method === "PATCH") {
      if (!requireAdmin(request, response)) return;
      const body = await readJson(request);
      const phone = cleanText(body.phone, 40);
      const whatsapp = cleanText(body.whatsapp, 20).replace(/\D/g, "");
      const email = cleanText(body.email, 180);
      const instagram = cleanText(body.instagram, 300);
      const store = await readStore();
      store.settings = { ...store.settings, phone, whatsapp, email, instagram };
      await writeStore(store);
      sendJson(response, 200, store.settings, secureHeaders());
      return;
    }

    if (request.method === "GET" || request.method === "HEAD") {
      await serveFile(request, response, pathname);
      return;
    }
    sendJson(response, 405, { error: "Method not allowed." }, secureHeaders());
  } catch (error) {
    sendJson(response, error.status || 500, { error: error.status ? error.message : "Something went wrong." }, secureHeaders());
  }
});

server.listen(port, host, () => {
  console.log("Cherry Captures is running at http://" + host + ":" + port);
});
