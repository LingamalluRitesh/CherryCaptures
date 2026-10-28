import pg from "pg";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
try {
  process.loadEnvFile(resolve(root, ".env"));
} catch {}

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:BcsyFYdAPnNSZ2Dy@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";

const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  console.log("Checking and seeding Vehicle Delivery and Instagram Video shoots...");

  // 1. Check or Insert Ads
  await pool.query(`
    INSERT INTO public.ads (title, badge, description, instagram_url, active)
    SELECT 'Vehicle Delivery Shoots', 'NEW SERVICE', 'Cinematic showroom car & bike delivery reveal films with 4K drone tracking.', 'https://instagram.com/', true
    WHERE NOT EXISTS (SELECT 1 FROM public.ads WHERE title = 'Vehicle Delivery Shoots');

    INSERT INTO public.ads (title, badge, description, instagram_url, active)
    SELECT 'Instagram Video & Reels Shoots', 'TRENDING', 'High-energy 9:16 vertical 4K edits, trending audio sync & 24h turnaround.', 'https://instagram.com/', true
    WHERE NOT EXISTS (SELECT 1 FROM public.ads WHERE title = 'Instagram Video & Reels Shoots');
  `);

  // 2. Check or Insert Projects
  await pool.query(`
    INSERT INTO public.projects (title, category, subtitle, image_url, instagram_url, featured)
    SELECT 'Nightfall in the GT', 'vehicles', 'Vehicle Delivery · Showroom Reveal', 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1400&q=88', 'https://instagram.com/', true
    WHERE NOT EXISTS (SELECT 1 FROM public.projects WHERE title = 'Nightfall in the GT');

    INSERT INTO public.projects (title, category, subtitle, image_url, instagram_url, featured)
    SELECT 'Golden Hour Aesthetic', 'reels', 'Instagram Reel · 4K Vertical', 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=88', 'https://instagram.com/', true
    WHERE NOT EXISTS (SELECT 1 FROM public.projects WHERE title = 'Golden Hour Aesthetic');
  `);

  console.log("Vehicle & Reel ads and projects verified in Supabase!");

  const ads = await pool.query("SELECT title, badge, active FROM ads ORDER BY created_at DESC LIMIT 5");
  console.log("Active Ads in DB:", ads.rows);

  const projects = await pool.query("SELECT title, category FROM projects ORDER BY created_at DESC LIMIT 5");
  console.log("Recent Projects in DB:", projects.rows);

  await pool.end();
}

main().catch(err => {
  console.error("Error seeding services:", err);
  process.exit(1);
});
