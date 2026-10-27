import pg from "pg";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
try {
  process.loadEnvFile(resolve(root, ".env"));
} catch {}

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:BcsyFYdAPnNSZ2Dy@db.tqpmfvdryjbbbktkdujv.supabase.co:5432/postgres";

const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  console.log("Connecting to Supabase PostgreSQL database...");
  const sql = readFileSync(resolve(root, "supabase-schema.sql"), "utf8");
  try {
    await pool.query(sql);
    console.log("Schema and initial data successfully loaded into Supabase!");

    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log("Supabase public tables:", res.rows.map(r => r.table_name));

    const counts = await Promise.all([
      pool.query("SELECT COUNT(*) FROM settings").then(r => `settings: ${r.rows[0].count}`),
      pool.query("SELECT COUNT(*) FROM reviews").then(r => `reviews: ${r.rows[0].count}`),
      pool.query("SELECT COUNT(*) FROM ads").then(r => `ads: ${r.rows[0].count}`),
      pool.query("SELECT COUNT(*) FROM projects").then(r => `projects: ${r.rows[0].count}`),
      pool.query("SELECT COUNT(*) FROM experience").then(r => `experience: ${r.rows[0].count}`),
      pool.query("SELECT COUNT(*) FROM media").then(r => `media: ${r.rows[0].count}`)
    ]);
    console.log("Table records count:", counts.join(", "));
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
