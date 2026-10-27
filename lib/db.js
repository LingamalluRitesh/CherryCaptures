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

let supabaseClient = null;

export function getSupabase() {
  const url = process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || "";
  if (!url || !key) return null;
  if (!supabaseClient) {
    try {
      supabaseClient = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false }
      });
    } catch (e) {
      console.error("Supabase client init error:", e);
      return null;
    }
  }
  return supabaseClient;
}

export function isSupabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY));
}

// Ensure local file storage exists
await mkdir(dataDirectory, { recursive: true });
try {
  const current = JSON.parse(await readFile(dataFile, "utf8"));
  let updated = false;
  for (const [key, value] of Object.entries(defaultData)) {
    if (!current[key]) {
      current[key] = value;
      updated = true;
    }
  }
  if (updated) {
    await writeFile(dataFile, JSON.stringify(current, null, 2), "utf8");
  }
} catch {
  await writeFile(dataFile, JSON.stringify(defaultData, null, 2), "utf8");
}

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
// Database API methods (Supabase with Local JSON fallback)
// -------------------------------------------------------------

export async function getDbStatus() {
  const configured = isSupabaseConfigured();
  if (!configured) {
    return {
      configured: false,
      type: "local",
      message: "Running on local JSON storage. Add SUPABASE_URL and SUPABASE_KEY to sync to Supabase."
    };
  }
  const client = getSupabase();
  try {
    const { error } = await client.from("settings").select("id").limit(1);
    if (error) throw error;
    return {
      configured: true,
      type: "supabase",
      message: "Connected to Supabase PostgreSQL database."
    };
  } catch (err) {
    return {
      configured: true,
      type: "fallback_local",
      message: `Supabase configured, but connection check failed (${err.message || "error"}). Using local storage fallback.`
    };
  }
}

// --- Settings ---
export async function getSettings() {
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client.from("settings").select("*").eq("id", "default").single();
      if (!error && data) {
        return {
          phone: data.phone || defaultData.settings.phone,
          whatsapp: data.whatsapp || defaultData.settings.whatsapp,
          email: data.email || defaultData.settings.email,
          instagram: data.instagram || defaultData.settings.instagram
        };
      }
    } catch {}
  }
  const store = await readLocalStore();
  return store.settings;
}

export async function updateSettings(newSettings) {
  const client = getSupabase();
  if (client) {
    try {
      const { error } = await client.from("settings").upsert({
        id: "default",
        ...newSettings,
        updated_at: new Date().toISOString()
      });
      if (!error) return newSettings;
    } catch {}
  }
  const store = await readLocalStore();
  store.settings = { ...store.settings, ...newSettings };
  await writeLocalStore(store);
  return store.settings;
}

// --- Enquiries ---
export async function getEnquiries() {
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client.from("enquiries").select("*").order("created_at", { ascending: false });
      if (!error && data) return data;
    } catch {}
  }
  const store = await readLocalStore();
  return store.enquiries;
}

export async function addEnquiry(enquiry) {
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client.from("enquiries").insert([enquiry]).select().single();
      if (!error && data) return data;
    } catch {}
  }
  const store = await readLocalStore();
  store.enquiries.unshift(enquiry);
  await writeLocalStore(store);
  return enquiry;
}

export async function updateEnquiryStatus(id, status) {
  const client = getSupabase();
  if (client) {
    try {
      const { error } = await client.from("enquiries").update({ status }).eq("id", id);
      if (!error) return true;
    } catch {}
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
  const client = getSupabase();
  if (client) {
    try {
      const { error } = await client.from("enquiries").delete().eq("id", id);
      if (!error) return true;
    } catch {}
  }
  const store = await readLocalStore();
  store.enquiries = store.enquiries.filter((e) => e.id !== id);
  await writeLocalStore(store);
  return true;
}

// --- Reviews ---
export async function getReviews() {
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client.from("reviews").select("*").order("created_at", { ascending: false });
      if (!error && data && data.length) return data;
    } catch {}
  }
  const store = await readLocalStore();
  return store.reviews || [];
}

export async function addReview(review) {
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client.from("reviews").insert([review]).select().single();
      if (!error && data) return data;
    } catch {}
  }
  const store = await readLocalStore();
  store.reviews.unshift(review);
  await writeLocalStore(store);
  return review;
}

export async function deleteReview(id) {
  const client = getSupabase();
  if (client) {
    try {
      const { error } = await client.from("reviews").delete().eq("id", id);
      if (!error) return true;
    } catch {}
  }
  const store = await readLocalStore();
  store.reviews = store.reviews.filter((r) => r.id !== id);
  await writeLocalStore(store);
  return true;
}

// --- Ads (Scrollable Ads with Instagram link) ---
export async function getAds(onlyActive = true) {
  const client = getSupabase();
  if (client) {
    try {
      let query = client.from("ads").select("*").order("created_at", { ascending: false });
      if (onlyActive) query = query.eq("active", true);
      const { data, error } = await query;
      if (!error && data && data.length) return data;
    } catch {}
  }
  const store = await readLocalStore();
  if (onlyActive) {
    return (store.ads || []).filter((ad) => ad.active !== false);
  }
  return store.ads || [];
}

export async function addAd(ad) {
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client.from("ads").insert([ad]).select().single();
      if (!error && data) return data;
    } catch {}
  }
  const store = await readLocalStore();
  store.ads.unshift(ad);
  await writeLocalStore(store);
  return ad;
}

export async function updateAd(id, fields) {
  const client = getSupabase();
  if (client) {
    try {
      const { error } = await client.from("ads").update(fields).eq("id", id);
      if (!error) return true;
    } catch {}
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
  const client = getSupabase();
  if (client) {
    try {
      const { error } = await client.from("ads").delete().eq("id", id);
      if (!error) return true;
    } catch {}
  }
  const store = await readLocalStore();
  store.ads = store.ads.filter((a) => a.id !== id);
  await writeLocalStore(store);
  return true;
}

// --- Projects (Portfolio) ---
export async function getProjects(category = null) {
  const client = getSupabase();
  if (client) {
    try {
      let query = client.from("projects").select("*").order("created_at", { ascending: false });
      if (category && category !== "all") query = query.eq("category", category);
      const { data, error } = await query;
      if (!error && data && data.length) return data;
    } catch {}
  }
  const store = await readLocalStore();
  if (category && category !== "all") {
    return (store.projects || []).filter((p) => p.category === category);
  }
  return store.projects || [];
}

export async function addProject(project) {
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client.from("projects").insert([project]).select().single();
      if (!error && data) return data;
    } catch {}
  }
  const store = await readLocalStore();
  store.projects.unshift(project);
  await writeLocalStore(store);
  return project;
}

export async function deleteProject(id) {
  const client = getSupabase();
  if (client) {
    try {
      const { error } = await client.from("projects").delete().eq("id", id);
      if (!error) return true;
    } catch {}
  }
  const store = await readLocalStore();
  store.projects = store.projects.filter((p) => p.id !== id);
  await writeLocalStore(store);
  return true;
}

// --- Experience & Stats ---
export async function getExperience() {
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client.from("experience").select("*").eq("id", "default").single();
      if (!error && data) return data;
    } catch {}
  }
  const store = await readLocalStore();
  return store.experience || defaultData.experience;
}

export async function updateExperience(exp) {
  const client = getSupabase();
  if (client) {
    try {
      const { error } = await client.from("experience").upsert({
        id: "default",
        ...exp,
        updated_at: new Date().toISOString()
      });
      if (!error) return exp;
    } catch {}
  }
  const store = await readLocalStore();
  store.experience = { ...store.experience, ...exp };
  await writeLocalStore(store);
  return store.experience;
}

// --- Media & Images ---
export async function getMedia() {
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client.from("media").select("*").eq("id", "default").single();
      if (!error && data) return data;
    } catch {}
  }
  const store = await readLocalStore();
  return store.media || defaultData.media;
}

export async function updateMedia(med) {
  const client = getSupabase();
  if (client) {
    try {
      const { error } = await client.from("media").upsert({
        id: "default",
        ...med,
        updated_at: new Date().toISOString()
      });
      if (!error) return med;
    } catch {}
  }
  const store = await readLocalStore();
  store.media = { ...store.media, ...med };
  await writeLocalStore(store);
  return store.media;
}
