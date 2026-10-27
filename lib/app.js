import { randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import * as db from "./db.js";

const sessionLifetime = 8 * 60 * 60 * 1000;
const sessions = new Map();
const limits = new Map();

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "cherrycaptures2026";
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
    if (size > 2 * 1024 * 1024) {
      throw Object.assign(new Error("Request payload is too large."), { status: 413 });
    }
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw Object.assign(new Error("Please send valid JSON data."), { status: 400 });
  }
}

function cleanText(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

function clientKey(request) {
  return request.headers["x-forwarded-for"] || request.socket?.remoteAddress || "unknown";
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

export function authorized(request) {
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
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  return a.length === b.length && timingSafeEqual(a, b);
}

export function secureHeaders() {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
  };
}

// -------------------------------------------------------------
// Core API Request Handler (used by both server.js and Vercel)
// -------------------------------------------------------------
export async function handleApiRequest(request, response, url) {
  const pathname = url.pathname;
  const method = request.method;

  try {
    // 1. Status & Database check
    if (pathname === "/api/status" && method === "GET") {
      const status = await db.getDbStatus();
      sendJson(response, 200, status, secureHeaders());
      return true;
    }

    // 2. Settings
    if (pathname === "/api/settings" && method === "GET") {
      const settings = await db.getSettings();
      sendJson(response, 200, settings, secureHeaders());
      return true;
    }

    // 3. Reviews (Public)
    if (pathname === "/api/reviews" && method === "GET") {
      const reviews = await db.getReviews();
      sendJson(response, 200, reviews, secureHeaders());
      return true;
    }

    // 4. Ads (Public - Scrollable Ads with Instagram links)
    if (pathname === "/api/ads" && method === "GET") {
      const ads = await db.getAds(true);
      sendJson(response, 200, ads, secureHeaders());
      return true;
    }

    // 5. Projects (Public - Portfolio)
    if (pathname === "/api/projects" && method === "GET") {
      const category = url.searchParams.get("category");
      const projects = await db.getProjects(category);
      sendJson(response, 200, projects, secureHeaders());
      return true;
    }

    // 6. Experience & Stats (Public)
    if (pathname === "/api/experience" && method === "GET") {
      const exp = await db.getExperience();
      sendJson(response, 200, exp, secureHeaders());
      return true;
    }

    // 7. Media (Public)
    if (pathname === "/api/media" && method === "GET") {
      const media = await db.getMedia();
      sendJson(response, 200, media, secureHeaders());
      return true;
    }

    // 8. Submit Booking Enquiry (Public)
    if (pathname === "/api/enquiries" && method === "POST") {
      if (rateLimited(request, "enquiry", 8, 60 * 60 * 1000)) {
        sendJson(response, 429, { error: "Please wait a little before sending another enquiry." }, secureHeaders());
        return true;
      }
      const body = await readJson(request);
      if (cleanText(body.website, 200)) {
        // Honeypot field for bot spam
        sendJson(response, 201, { ok: true }, secureHeaders());
        return true;
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
        created_at: new Date().toISOString()
      };
      if (!enquiry.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enquiry.email) || !enquiry.service) {
        sendJson(response, 400, { error: "Please check your name, email, and service." }, secureHeaders());
        return true;
      }
      await db.addEnquiry(enquiry);
      sendJson(response, 201, { ok: true }, secureHeaders());
      return true;
    }

    // 9. Admin Session Check
    if (pathname === "/api/admin/session" && method === "GET") {
      sendJson(response, 200, { authenticated: authorized(request) }, secureHeaders());
      return true;
    }

    // 10. Admin Login
    if (pathname === "/api/admin/login" && method === "POST") {
      if (rateLimited(request, "login", 8, 15 * 60 * 1000)) {
        sendJson(response, 429, { error: "Too many attempts. Please wait a few minutes." }, secureHeaders());
        return true;
      }
      const adminPassword = getAdminPassword();
      const body = await readJson(request);
      if (!safeEqual(String(body.password || ""), adminPassword)) {
        sendJson(response, 401, { error: "That password didn’t match. Try again." }, secureHeaders());
        return true;
      }
      const token = randomBytes(32).toString("hex");
      sessions.set(token, Date.now() + sessionLifetime);
      const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
      sendJson(response, 200, { ok: true }, {
        ...secureHeaders(),
        "Set-Cookie": "cc_admin=" + token + "; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800" + secure
      });
      return true;
    }

    // 11. Admin Logout
    if (pathname === "/api/admin/logout" && method === "POST") {
      const token = cookieValue(request, "cc_admin");
      if (token) sessions.delete(token);
      sendJson(response, 200, { ok: true }, {
        ...secureHeaders(),
        "Set-Cookie": "cc_admin=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0"
      });
      return true;
    }

    // -----------------------------------------------------------
    // Protected Admin Endpoints
    // -----------------------------------------------------------
    if (pathname.startsWith("/api/admin/")) {
      if (!requireAdmin(request, response)) return true;

      // --- Admin Enquiries ---
      if (pathname === "/api/admin/enquiries" && method === "GET") {
        const enquiries = await db.getEnquiries();
        sendJson(response, 200, enquiries, secureHeaders());
        return true;
      }

      const enquiryMatch = pathname.match(/^\/api\/admin\/enquiries\/([0-9a-f-]+)$/i);
      if (enquiryMatch) {
        const enquiryId = enquiryMatch[1];
        if (method === "PATCH") {
          const body = await readJson(request);
          const allowedStatuses = new Set(["new", "contacted", "booked", "archived"]);
          if (!allowedStatuses.has(body.status)) {
            sendJson(response, 400, { error: "Choose a valid enquiry status." }, secureHeaders());
            return true;
          }
          await db.updateEnquiryStatus(enquiryId, body.status);
          sendJson(response, 200, { ok: true }, secureHeaders());
          return true;
        }
        if (method === "DELETE") {
          await db.deleteEnquiry(enquiryId);
          sendJson(response, 200, { ok: true }, secureHeaders());
          return true;
        }
      }

      // --- Admin Settings ---
      if (pathname === "/api/admin/settings") {
        if (method === "GET") {
          const settings = await db.getSettings();
          sendJson(response, 200, settings, secureHeaders());
          return true;
        }
        if (method === "PUT") {
          const body = await readJson(request);
          const phone = cleanText(body.phone, 40);
          const whatsapp = cleanText(body.whatsapp, 20).replace(/\D/g, "");
          const email = cleanText(body.email, 180);
          const instagram = cleanText(body.instagram, 300);

          if (!phone || !/^\+?[\d\s().-]{8,24}$/.test(phone) || whatsapp.length < 8 || whatsapp.length > 15) {
            sendJson(response, 400, { error: "Enter a phone number and WhatsApp number with country code." }, secureHeaders());
            return true;
          }
          if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            sendJson(response, 400, { error: "Enter a valid enquiry email address." }, secureHeaders());
            return true;
          }
          const updated = await db.updateSettings({ phone, whatsapp, email, instagram });
          sendJson(response, 200, updated, secureHeaders());
          return true;
        }
      }

      // --- Admin Reviews ---
      if (pathname === "/api/admin/reviews") {
        if (method === "GET") {
          const reviews = await db.getReviews();
          sendJson(response, 200, reviews, secureHeaders());
          return true;
        }
        if (method === "POST") {
          const body = await readJson(request);
          const client_name = cleanText(body.client_name, 100);
          const event_type = cleanText(body.event_type, 120);
          const comment = cleanText(body.comment, 2000);
          const rating = Number(body.rating) || 5;
          const instagram_handle = cleanText(body.instagram_handle, 100);
          const avatar_url = cleanText(body.avatar_url, 500);

          if (!client_name || !comment) {
            sendJson(response, 400, { error: "Client name and review comment are required." }, secureHeaders());
            return true;
          }

          const review = {
            id: randomUUID(),
            client_name,
            event_type: event_type || "Celebration",
            rating: Math.min(5, Math.max(1, rating)),
            comment,
            instagram_handle,
            avatar_url,
            is_featured: true,
            created_at: new Date().toISOString()
          };
          const created = await db.addReview(review);
          sendJson(response, 201, created, secureHeaders());
          return true;
        }
      }

      const reviewMatch = pathname.match(/^\/api\/admin\/reviews\/([a-z0-9-]+)$/i);
      if (reviewMatch && method === "DELETE") {
        await db.deleteReview(reviewMatch[1]);
        sendJson(response, 200, { ok: true }, secureHeaders());
        return true;
      }

      // --- Admin Ads (Scrollable Ads with Instagram link) ---
      if (pathname === "/api/admin/ads") {
        if (method === "GET") {
          const ads = await db.getAds(false); // get all including inactive
          sendJson(response, 200, ads, secureHeaders());
          return true;
        }
        if (method === "POST") {
          const body = await readJson(request);
          const title = cleanText(body.title, 140);
          const badge = cleanText(body.badge, 40) || "SPECIAL";
          const description = cleanText(body.description, 400);
          const instagram_url = cleanText(body.instagram_url, 500);
          const active = body.active !== false;

          if (!title || !description) {
            sendJson(response, 400, { error: "Ad title and description are required." }, secureHeaders());
            return true;
          }

          const ad = {
            id: randomUUID(),
            title,
            badge: badge.toUpperCase(),
            description,
            instagram_url: instagram_url || "https://instagram.com/",
            active,
            created_at: new Date().toISOString()
          };
          const created = await db.addAd(ad);
          sendJson(response, 201, created, secureHeaders());
          return true;
        }
      }

      const adMatch = pathname.match(/^\/api\/admin\/ads\/([a-z0-9-]+)$/i);
      if (adMatch) {
        const adId = adMatch[1];
        if (method === "PATCH") {
          const body = await readJson(request);
          await db.updateAd(adId, body);
          sendJson(response, 200, { ok: true }, secureHeaders());
          return true;
        }
        if (method === "DELETE") {
          await db.deleteAd(adId);
          sendJson(response, 200, { ok: true }, secureHeaders());
          return true;
        }
      }

      // --- Admin Projects (Portfolio) ---
      if (pathname === "/api/admin/projects") {
        if (method === "GET") {
          const projects = await db.getProjects();
          sendJson(response, 200, projects, secureHeaders());
          return true;
        }
        if (method === "POST") {
          const body = await readJson(request);
          const title = cleanText(body.title, 140);
          const category = cleanText(body.category, 60) || "weddings";
          const subtitle = cleanText(body.subtitle, 140);
          const image_url = cleanText(body.image_url, 600);
          const instagram_url = cleanText(body.instagram_url, 500);

          if (!title || !image_url) {
            sendJson(response, 400, { error: "Project title and image URL are required." }, secureHeaders());
            return true;
          }

          const project = {
            id: randomUUID(),
            title,
            category,
            subtitle,
            image_url,
            instagram_url,
            featured: true,
            created_at: new Date().toISOString()
          };
          const created = await db.addProject(project);
          sendJson(response, 201, created, secureHeaders());
          return true;
        }
      }

      const projectMatch = pathname.match(/^\/api\/admin\/projects\/([a-z0-9-]+)$/i);
      if (projectMatch && method === "DELETE") {
        await db.deleteProject(projectMatch[1]);
        sendJson(response, 200, { ok: true }, secureHeaders());
        return true;
      }

      // --- Admin Experience & Stats ---
      if (pathname === "/api/admin/experience") {
        if (method === "GET") {
          const exp = await db.getExperience();
          sendJson(response, 200, exp, secureHeaders());
          return true;
        }
        if (method === "PUT") {
          const body = await readJson(request);
          const updated = await db.updateExperience({
            years_experience: cleanText(body.years_experience, 40),
            weddings_captured: cleanText(body.weddings_captured, 40),
            drone_hours: cleanText(body.drone_hours, 40),
            happy_couples: cleanText(body.happy_couples, 40),
            about_heading: cleanText(body.about_heading, 200),
            about_story: cleanText(body.about_story, 3000)
          });
          sendJson(response, 200, updated, secureHeaders());
          return true;
        }
      }

      // --- Admin Media (Hero & Site Images) ---
      if (pathname === "/api/admin/media") {
        if (method === "GET") {
          const media = await db.getMedia();
          sendJson(response, 200, media, secureHeaders());
          return true;
        }
        if (method === "PUT") {
          const body = await readJson(request);
          const updated = await db.updateMedia({
            hero_image_url: cleanText(body.hero_image_url, 600),
            logo_url: cleanText(body.logo_url, 600),
            about_image_url: cleanText(body.about_image_url, 600),
            banner_image_url: cleanText(body.banner_image_url, 600)
          });
          sendJson(response, 200, updated, secureHeaders());
          return true;
        }
      }

      sendJson(response, 404, { error: "Admin endpoint not found." }, secureHeaders());
      return true;
    }

    if (pathname.startsWith("/api/")) {
      sendJson(response, 404, { error: "Endpoint not found." }, secureHeaders());
      return true;
    }

    return false; // Not an API request, let static file server handle it
  } catch (error) {
    console.error("API error:", error);
    sendJson(response, error.status || 500, { error: error.status ? error.message : "Something went wrong." }, secureHeaders());
    return true;
  }
}
