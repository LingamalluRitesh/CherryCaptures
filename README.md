# Cherry Captures — Photography & Films Studio

A luxury multi-page photography and filmmaking studio website with a comprehensive private admin portal, dynamic customer reviews, scrollable ads with direct Instagram links, previous projects portfolio, experience stats, and custom media management.

Built for high-performance hosting on **Vercel** with **Supabase PostgreSQL** cloud database (and automatic local offline fallback).

---

## 🌟 Key Features

1. **Admin Portal (`/admin.html`)**:
   - **Customer Reviews**: Add, view, and manage customer testimonials with 5-star ratings, event locations, and Instagram handles.
   - **Scrollable Ads & Announcements**: Post news, seasonal offers, and new reel announcements to the animated marquee banner with direct links to Instagram.
   - **Previous Projects & Portfolio**: Add previous weddings, portraits, and films with image URLs, categories, and Instagram post links.
   - **Studio Experience & Stats**: Update years of experience, weddings captured, drone hours, happy couples, and bio narrative in real time.
   - **Change Website Images**: Customize hero background, studio logo, and about images right from the admin desk.
   - **Client Booking Enquiries**: Filter by status (*Needs reply*, *Contacted*, *Booked*, *Archived*), read client notes, and delete records.
   - **Studio Contact Settings**: Update phone, WhatsApp, email, and Instagram profile URLs.
   - **Database Status Indicator**: Live status showing `🟢 Supabase Connected` or `🟡 Local Storage Mode`.

2. **Public Website**:
   - Animated luxury announcement ticker at the top of pages with direct Instagram links (`Check on Instagram ↗`).
   - Customer Reviews section ("Love Notes & Kind Words") on the homepage.
   - Milestones and experience counters band.
   - Dynamic portfolio gallery with categories and Instagram links.
   - Fully responsive, accessible, with smooth parallax effects and fast loading.

---

## 🚀 1. Run Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the local server:
   ```bash
   npm start
   ```

3. Open your browser:
   - **Website**: [http://127.0.0.1:3000](http://127.0.0.1:3000)
   - **Admin Portal**: [http://127.0.0.1:3000/admin.html](http://127.0.0.1:3000/admin.html) (Default password: `cherrycaptures2026`)

---

## 🗄️ 2. Connect to Supabase Database

1. Create a free project on [Supabase](https://supabase.com).
2. Go to **SQL Editor** in your Supabase dashboard.
3. Open `supabase-schema.sql` from this project, copy the entire SQL script, paste it into the editor, and click **Run**.
4. Go to **Project Settings → API** and copy:
   - `Project URL`
   - `Project API anon key` (or `service_role key`)
5. Add them to your `.env` file (or Vercel Environment Variables):
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-supabase-key
   ```
6. Restart the server (`npm start`). The admin header will now show `🟢 Supabase Connected`!

---

## 🐙 3. Push to Your GitHub

1. Create a new repository on [GitHub](https://github.com/new) (e.g. `cherry-captures`). Do **not** initialize with README or .gitignore (they are already included).
2. In your terminal, link your remote and push:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

---

## ▲ 4. Deploy to Vercel

1. Log in to [Vercel](https://vercel.com) and click **Add New → Project**.
2. Select your newly pushed GitHub repository (`cherry-captures`).
3. In **Environment Variables**, add:
   - `ADMIN_PASSWORD` = `your-secure-password`
   - `SUPABASE_URL` = `https://your-project.supabase.co`
   - `SUPABASE_ANON_KEY` = `your-supabase-anon-or-service-key`
4. Click **Deploy**.
5. Vercel will automatically build the serverless functions (`api/index.js`) and serve the static files from the global edge network!
