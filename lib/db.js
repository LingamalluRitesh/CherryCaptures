import pg from "pg";
import { createClient } from "@supabase/supabase-js";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const dataDirectory = resolve(root, "data");
const dataFile = resolve(dataDirectory, "site-data.json");

const defaultData = {
  settings: {
    phone: "+91 97041 63008",
    whatsapp: "919704163008",
    email: "hello@cherrycaptures.com",
    instagram: "https://instagram.com/cherrycaptures"
  },
  enquiries: [],
  reviews: [
    {
      id: "rev-1",
      client_name: "Pooja & Karthik",
      event_type: "Destination Wedding, Goa",
      rating: 5,
      comment: "Cherry Captures made our wedding feel like a timeless film. Every smile, every tear, and every candid glance was preserved so naturally. We can't stop rewatching our gallery!",
      instagram_handle: "@pooja_karthik",
      avatar_url: "",
      is_featured: true,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString()
    },
    {
      id: "rev-2",
      client_name: "Deepika & Rahul",
      event_type: "Traditional Wedding, Hyderabad",
      rating: 5,
      comment: "The drone shots took our breath away! Professional, warm, and invisible during the sacred rituals. Truly gifted storytellers.",
      instagram_handle: "@deepika.r",
      avatar_url: "",
      is_featured: true,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString()
    },
    {
      id: "rev-3",
      client_name: "Sneha & Arjun",
      event_type: "Pre-Wedding & Sangeet",
      rating: 5,
      comment: "From the pre-wedding shoot to our reception, the team brought so much patience, kindness, and cinematic artistry. Highly recommended!",
      instagram_handle: "@arjun_sneha",
      avatar_url: "",
      is_featured: true,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString()
    }
  ],
  ads: [
    {
      id: "ad-1",
      title: "2026-27 Wedding Dates Open",
      badge: "BOOKING NOW",
      description: "Now taking bookings for the upcoming wedding season across India. Limited weekend dates available.",
      instagram_url: "https://instagram.com/",
      active: true,
      created_at: new Date().toISOString()
    },
    {
      id: "ad-2",
      title: "New Cinematic Reel Live",
      badge: "LATEST REEL",
      description: "Watch the dreamy sunset teaser from our latest destination wedding in Goa on our Instagram.",
      instagram_url: "https://instagram.com/",
      active: true,
      created_at: new Date().toISOString()
    },
    {
      id: "ad-3",
      title: "Complimentary Drone Teaser",
      badge: "LIMITED OFFER",
      description: "Book your wedding package this month and get a complimentary 4K cinematic aerial highlight reel.",
      instagram_url: "https://instagram.com/",
      active: true,
      created_at: new Date().toISOString()
    }
  ],
  projects: [
    {
      id: "proj-1",
      title: "A promise in the garden",
      category: "weddings",
      subtitle: "Weddings · The golden hour",
      image_url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1400&q=88",
      instagram_url: "https://instagram.com/",
      featured: true,
      created_at: new Date().toISOString()
    },
    {
      id: "proj-2",
      title: "Where the day begins",
      category: "weddings",
      subtitle: "Weddings · A quiet beginning",
      image_url: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1200&q=88",
      instagram_url: "https://instagram.com/",
      featured: true,
      created_at: new Date().toISOString()
    },
    {
      id: "proj-3",
      title: "A softer kind of Sunday",
      category: "portraits",
      subtitle: "Portraits · At home",
      image_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=88",
      instagram_url: "https://instagram.com/",
      featured: true,
      created_at: new Date().toISOString()
    },
    {
      id: "proj-4",
      title: "One more song",
      category: "celebrations",
      subtitle: "Celebrations · All together",
      image_url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=88",
      instagram_url: "https://instagram.com/",
      featured: true,
      created_at: new Date().toISOString()
    },
    {
      id: "proj-5",
      title: "A little after forever",
      category: "weddings",
      subtitle: "Weddings · Just married",
      image_url: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=1000&q=88",
      instagram_url: "https://instagram.com/",
      featured: true,
      created_at: new Date().toISOString()
    },
    {
      id: "proj-6",
      title: "Made of golden light",
      category: "portraits",
      subtitle: "Portraits · Out in the open",
      image_url: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=88",
      instagram_url: "https://instagram.com/",
      featured: true,
      created_at: new Date().toISOString()
    },
    {
      id: "proj-7",
      title: "The day, in motion",
      category: "films",
      subtitle: "Cinematic Films · Highlights",
      image_url: "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?auto=format&fit=crop&w=1400&q=88",
      instagram_url: "https://instagram.com/",
      featured: true,
      created_at: new Date().toISOString()
    }
  ],
  experience: {
    years_experience: "8+ Years",
    weddings_captured: "250+ Celebrations",
    drone_hours: "500+ Hours",
    happy_couples: "300+ Couples",
    about_heading: "Big feelings. Beautifully kept.",
    about_story: "We believe the moments that matter most don’t need a pose or a perfect plan. They just need the people you love, a little room to be yourselves, and someone there to notice. Cherry Captures brings photography, filmmaking, and drone storytelling together with a thoughtful, easy-going approach."
  },
  media: {
    hero_image_url: "public/cherry-hero-ai.png",
    logo_url: "public/cherry-captures-logo.jpeg",
    about_image_url: "public/cherry-captures-logo.jpeg",
    banner_image_url: ""
  }
};

// -------------------------------------------------------------
// PostgreSQL Connection Pool (Supabase direct connection)
// -------------------------------------------------------------
let pgPool = null;

export function getPgPool() {
  let connectionString = process.env.DATABASE_URL || "";
  if (!connectionString) return null;

  // Auto-detect direct Supabase IPv6-only host and use IPv4-compatible Supabase pooler for Vercel/serverless
  const match = connectionString.match(/postgresql:\/\/postgres:([^@]+)@db\.([a-z0-9]+)\.supabase\.co:5432\/postgres/);
  if (match) {
    const [, pass, ref] = match;
    connectionString = `postgresql://postgres.${ref}:${pass}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`;
  }

  if (!pgPool) {
    try {
      pgPool = new pg.Pool({
        connectionString,
        ssl: { rejectUnauthorized: false },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000
      });
      pgPool.on("error", (err) => {
        console.error("Postgres pool unexpected error:", err);
      });
    } catch (err) {
      console.error("Postgres pool init error:", err);
      return null;
    }
  }
  return pgPool;
}

// -------------------------------------------------------------
// Local JSON Storage fallback
// -------------------------------------------------------------
async function ensureLocalData() {
  try {
    await mkdir(dataDirectory, { recursive: true });
    await readFile(dataFile, "utf8");
  } catch {
    try {
      await writeFile(dataFile, JSON.stringify(defaultData, null, 2), "utf8");
    } catch {}
  }
}
ensureLocalData();

async function readLocalStore() {
  try {
    const raw = await readFile(dataFile, "utf8");
    const parsed = JSON.parse(raw);
    return {
      settings: { ...defaultData.settings, ...(parsed.settings || {}) },
      enquiries: Array.isArray(parsed.enquiries) ? parsed.enquiries : [],
      reviews: Array.isArray(parsed.reviews) ? parsed.reviews : defaultData.reviews,
      ads: Array.isArray(parsed.ads) ? parsed.ads : defaultData.ads,
      projects: Array.isArray(parsed.projects) ? parsed.projects : defaultData.projects,
      experience: { ...defaultData.experience, ...(parsed.experience || {}) },
      media: { ...defaultData.media, ...(parsed.media || {}) }
    };
  } catch {
    return structuredClone(defaultData);
  }
}

async function writeLocalStore(store) {
  try {
    const tempFile = dataFile + ".tmp";
    await writeFile(tempFile, JSON.stringify(store, null, 2), "utf8");
    await rename(tempFile, dataFile);
  } catch (err) {
    console.error("Local store write error:", err);
  }
}

// -------------------------------------------------------------
// Unified Database Operations
// -------------------------------------------------------------

export async function getDbStatus() {
  const pool = getPgPool();
  if (pool) {
    try {
      const res = await pool.query("SELECT current_database(), current_user;");
      if (res.rows.length) {
        return {
          configured: true,
          type: "supabase",
          message: "Connected to Supabase PostgreSQL database."
        };
      }
    } catch (err) {
      return {
        configured: true,
        type: "fallback_local",
        message: `Database connection error (${err.message}). Using local storage fallback.`
      };
    }
  }

  return {
    configured: false,
    type: "local",
    message: "Running on local storage. Set DATABASE_URL in .env to connect to Supabase."
  };
}

// --- Settings ---
export async function getSettings() {
  const pool = getPgPool();
  if (pool) {
    try {
      const res = await pool.query("SELECT phone, whatsapp, email, instagram FROM settings WHERE id = 'default' LIMIT 1;");
      if (res.rows.length) return res.rows[0];
    } catch (err) {
      console.warn("getSettings fallback:", err.message);
    }
  }
  const store = await readLocalStore();
  return store.settings;
}

export async function updateSettings(newSettings) {
  const pool = getPgPool();
  if (pool) {
    try {
      const res = await pool.query(`
        INSERT INTO settings (id, phone, whatsapp, email, instagram, updated_at)
        VALUES ('default', $1, $2, $3, $4, NOW())
        ON CONFLICT (id) DO UPDATE SET
          phone = EXCLUDED.phone,
          whatsapp = EXCLUDED.whatsapp,
          email = EXCLUDED.email,
          instagram = EXCLUDED.instagram,
          updated_at = NOW()
        RETURNING phone, whatsapp, email, instagram;
      `, [newSettings.phone, newSettings.whatsapp, newSettings.email || "", newSettings.instagram || ""]);
      if (res.rows.length) return res.rows[0];
    } catch (err) {
      console.warn("updateSettings fallback:", err.message);
    }
  }
  const store = await readLocalStore();
  store.settings = { ...store.settings, ...newSettings };
  await writeLocalStore(store);
  return store.settings;
}

// --- Enquiries ---
export async function getEnquiries() {
  const pool = getPgPool();
  if (pool) {
    try {
      const res = await pool.query("SELECT * FROM enquiries ORDER BY created_at DESC;");
      return res.rows;
    } catch (err) {
      console.warn("getEnquiries fallback:", err.message);
    }
  }
  const store = await readLocalStore();
  return store.enquiries;
}

export async function addEnquiry(enquiry) {
  const pool = getPgPool();
  if (pool) {
    try {
      const res = await pool.query(`
        INSERT INTO enquiries (id, name, email, service, date, location, message, status, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *;
      `, [
        enquiry.id,
        enquiry.name,
        enquiry.email,
        enquiry.service,
        enquiry.date || "",
        enquiry.location || "",
        enquiry.message || "",
        enquiry.status || "new",
        enquiry.created_at || new Date().toISOString()
      ]);
      if (res.rows.length) return res.rows[0];
    } catch (err) {
      console.warn("addEnquiry fallback:", err.message);
    }
  }
  const store = await readLocalStore();
  store.enquiries.unshift(enquiry);
  await writeLocalStore(store);
  return enquiry;
}

export async function updateEnquiryStatus(id, status) {
  const pool = getPgPool();
  if (pool) {
    try {
      await pool.query("UPDATE enquiries SET status = $1 WHERE id = $2;", [status, id]);
      return true;
    } catch (err) {
      console.warn("updateEnquiryStatus fallback:", err.message);
    }
  }
  const store = await readLocalStore();
  const item = store.enquiries.find((e) => e.id === id);
  if (item) {
    item.status = status;
    await writeLocalStore(store);
    return true;
  }
  return false;
}

export async function deleteEnquiry(id) {
  const pool = getPgPool();
  if (pool) {
    try {
      await pool.query("DELETE FROM enquiries WHERE id = $1;", [id]);
      return true;
    } catch (err) {
      console.warn("deleteEnquiry fallback:", err.message);
    }
  }
  const store = await readLocalStore();
  store.enquiries = store.enquiries.filter((e) => e.id !== id);
  await writeLocalStore(store);
  return true;
}

// --- Customer Reviews ---
export async function getReviews() {
  const pool = getPgPool();
  if (pool) {
    try {
      const res = await pool.query("SELECT * FROM reviews ORDER BY created_at DESC;");
      if (res.rows.length) return res.rows;
    } catch (err) {
      console.warn("getReviews fallback:", err.message);
    }
  }
  const store = await readLocalStore();
  return store.reviews || [];
}

export async function addReview(review) {
  const pool = getPgPool();
  if (pool) {
    try {
      const res = await pool.query(`
        INSERT INTO reviews (id, client_name, event_type, rating, comment, instagram_handle, avatar_url, is_featured, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *;
      `, [
        review.id,
        review.client_name,
        review.event_type,
        review.rating || 5,
        review.comment,
        review.instagram_handle || "",
        review.avatar_url || "",
        review.is_featured !== false,
        review.created_at || new Date().toISOString()
      ]);
      if (res.rows.length) return res.rows[0];
    } catch (err) {
      console.warn("addReview fallback:", err.message);
    }
  }
  const store = await readLocalStore();
  store.reviews.unshift(review);
  await writeLocalStore(store);
  return review;
}

export async function deleteReview(id) {
  const pool = getPgPool();
  if (pool) {
    try {
      await pool.query("DELETE FROM reviews WHERE id = $1;", [id]);
      return true;
    } catch (err) {
      console.warn("deleteReview fallback:", err.message);
    }
  }
  const store = await readLocalStore();
  store.reviews = store.reviews.filter((r) => r.id !== id);
  await writeLocalStore(store);
  return true;
}

// --- Scrollable Ads (with Instagram Links) ---
export async function getAds(onlyActive = true) {
  const pool = getPgPool();
  if (pool) {
    try {
      const query = onlyActive 
        ? "SELECT * FROM ads WHERE active = true ORDER BY created_at DESC;"
        : "SELECT * FROM ads ORDER BY created_at DESC;";
      const res = await pool.query(query);
      if (res.rows.length) return res.rows;
    } catch (err) {
      console.warn("getAds fallback:", err.message);
    }
  }
  const store = await readLocalStore();
  if (onlyActive) {
    return (store.ads || []).filter((ad) => ad.active !== false);
  }
  return store.ads || [];
}

export async function addAd(ad) {
  const pool = getPgPool();
  if (pool) {
    try {
      const res = await pool.query(`
        INSERT INTO ads (id, title, badge, description, instagram_url, active, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
      `, [
        ad.id,
        ad.title,
        ad.badge || "SPECIAL",
        ad.description,
        ad.instagram_url || "",
        ad.active !== false,
        ad.created_at || new Date().toISOString()
      ]);
      if (res.rows.length) return res.rows[0];
    } catch (err) {
      console.warn("addAd fallback:", err.message);
    }
  }
  const store = await readLocalStore();
  store.ads.unshift(ad);
  await writeLocalStore(store);
  return ad;
}

export async function updateAd(id, fields) {
  const pool = getPgPool();
  if (pool) {
    try {
      if (fields.active !== undefined) {
        await pool.query("UPDATE ads SET active = $1 WHERE id = $2;", [fields.active, id]);
        return true;
      }
    } catch (err) {
      console.warn("updateAd fallback:", err.message);
    }
  }
  const store = await readLocalStore();
  const ad = store.ads.find((a) => a.id === id);
  if (ad) {
    Object.assign(ad, fields);
    await writeLocalStore(store);
    return true;
  }
  return false;
}

export async function deleteAd(id) {
  const pool = getPgPool();
  if (pool) {
    try {
      await pool.query("DELETE FROM ads WHERE id = $1;", [id]);
      return true;
    } catch (err) {
      console.warn("deleteAd fallback:", err.message);
    }
  }
  const store = await readLocalStore();
  store.ads = store.ads.filter((a) => a.id !== id);
  await writeLocalStore(store);
  return true;
}

// --- Projects (Portfolio) ---
export async function getProjects(category = null) {
  const pool = getPgPool();
  if (pool) {
    try {
      const query = (category && category !== "all")
        ? "SELECT * FROM projects WHERE category = $1 ORDER BY created_at DESC;"
        : "SELECT * FROM projects ORDER BY created_at DESC;";
      const params = (category && category !== "all") ? [category] : [];
      const res = await pool.query(query, params);
      if (res.rows.length) return res.rows;
    } catch (err) {
      console.warn("getProjects fallback:", err.message);
    }
  }
  const store = await readLocalStore();
  if (category && category !== "all") {
    return (store.projects || []).filter((p) => p.category === category);
  }
  return store.projects || [];
}

export async function addProject(project) {
  const pool = getPgPool();
  if (pool) {
    try {
      const res = await pool.query(`
        INSERT INTO projects (id, title, category, subtitle, image_url, instagram_url, featured, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
      `, [
        project.id,
        project.title,
        project.category || "weddings",
        project.subtitle || "",
        project.image_url,
        project.instagram_url || "",
        project.featured !== false,
        project.created_at || new Date().toISOString()
      ]);
      if (res.rows.length) return res.rows[0];
    } catch (err) {
      console.warn("addProject fallback:", err.message);
    }
  }
  const store = await readLocalStore();
  store.projects.unshift(project);
  await writeLocalStore(store);
  return project;
}

export async function deleteProject(id) {
  const pool = getPgPool();
  if (pool) {
    try {
      await pool.query("DELETE FROM projects WHERE id = $1;", [id]);
      return true;
    } catch (err) {
      console.warn("deleteProject fallback:", err.message);
    }
  }
  const store = await readLocalStore();
  store.projects = store.projects.filter((p) => p.id !== id);
  await writeLocalStore(store);
  return true;
}

// --- Experience & Stats ---
export async function getExperience() {
  const pool = getPgPool();
  if (pool) {
    try {
      const res = await pool.query("SELECT * FROM experience WHERE id = 'default' LIMIT 1;");
      if (res.rows.length) return res.rows[0];
    } catch (err) {
      console.warn("getExperience fallback:", err.message);
    }
  }
  const store = await readLocalStore();
  return store.experience || defaultData.experience;
}

export async function updateExperience(exp) {
  const pool = getPgPool();
  if (pool) {
    try {
      const res = await pool.query(`
        INSERT INTO experience (id, years_experience, weddings_captured, drone_hours, happy_couples, about_heading, about_story, updated_at)
        VALUES ('default', $1, $2, $3, $4, $5, $6, NOW())
        ON CONFLICT (id) DO UPDATE SET
          years_experience = EXCLUDED.years_experience,
          weddings_captured = EXCLUDED.weddings_captured,
          drone_hours = EXCLUDED.drone_hours,
          happy_couples = EXCLUDED.happy_couples,
          about_heading = EXCLUDED.about_heading,
          about_story = EXCLUDED.about_story,
          updated_at = NOW()
        RETURNING *;
      `, [
        exp.years_experience || defaultData.experience.years_experience,
        exp.weddings_captured || defaultData.experience.weddings_captured,
        exp.drone_hours || defaultData.experience.drone_hours,
        exp.happy_couples || defaultData.experience.happy_couples,
        exp.about_heading || defaultData.experience.about_heading,
        exp.about_story || defaultData.experience.about_story
      ]);
      if (res.rows.length) return res.rows[0];
    } catch (err) {
      console.warn("updateExperience fallback:", err.message);
    }
  }
  const store = await readLocalStore();
  store.experience = { ...store.experience, ...exp };
  await writeLocalStore(store);
  return store.experience;
}

// --- Media & Site Images ---
export async function getMedia() {
  const pool = getPgPool();
  if (pool) {
    try {
      const res = await pool.query("SELECT * FROM media WHERE id = 'default' LIMIT 1;");
      if (res.rows.length) return res.rows[0];
    } catch (err) {
      console.warn("getMedia fallback:", err.message);
    }
  }
  const store = await readLocalStore();
  return store.media || defaultData.media;
}

export async function updateMedia(med) {
  const pool = getPgPool();
  if (pool) {
    try {
      const res = await pool.query(`
        INSERT INTO media (id, hero_image_url, logo_url, about_image_url, banner_image_url, updated_at)
        VALUES ('default', $1, $2, $3, $4, NOW())
        ON CONFLICT (id) DO UPDATE SET
          hero_image_url = EXCLUDED.hero_image_url,
          logo_url = EXCLUDED.logo_url,
          about_image_url = EXCLUDED.about_image_url,
          banner_image_url = EXCLUDED.banner_image_url,
          updated_at = NOW()
        RETURNING *;
      `, [
        med.hero_image_url || defaultData.media.hero_image_url,
        med.logo_url || defaultData.media.logo_url,
        med.about_image_url || defaultData.media.about_image_url,
        med.banner_image_url || ""
      ]);
      if (res.rows.length) return res.rows[0];
    } catch (err) {
      console.warn("updateMedia fallback:", err.message);
    }
  }
  const store = await readLocalStore();
  store.media = { ...store.media, ...med };
  await writeLocalStore(store);
  return store.media;
}
