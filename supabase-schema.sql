-- ==========================================================
-- Cherry Captures — Supabase Database Schema
-- Run this script in the Supabase SQL Editor (Dashboard -> SQL Editor)
-- ==========================================================

-- 1. Studio Settings Table
CREATE TABLE IF NOT EXISTS public.settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  phone TEXT NOT NULL DEFAULT '+91 97041 63008',
  whatsapp TEXT NOT NULL DEFAULT '919704163008',
  email TEXT DEFAULT '',
  instagram TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Client Booking Enquiries Table
CREATE TABLE IF NOT EXISTS public.enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  service TEXT NOT NULL,
  date TEXT DEFAULT '',
  location TEXT DEFAULT '',
  message TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new', -- 'new', 'contacted', 'booked', 'archived'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Customer Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  event_type TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  instagram_handle TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  is_featured BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Scrollable Ads & Announcements Table (with Instagram links)
CREATE TABLE IF NOT EXISTS public.ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  badge TEXT NOT NULL DEFAULT 'LATEST POST', -- e.g. 'OFFER', 'NEW REEL', 'UPDATE'
  description TEXT NOT NULL,
  instagram_url TEXT NOT NULL DEFAULT '',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Previous Projects / Portfolio Table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'weddings', -- 'weddings', 'portraits', 'celebrations', 'films'
  subtitle TEXT DEFAULT '',
  image_url TEXT NOT NULL,
  instagram_url TEXT DEFAULT '',
  featured BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Experience & About Stats Table
CREATE TABLE IF NOT EXISTS public.experience (
  id TEXT PRIMARY KEY DEFAULT 'default',
  years_experience TEXT NOT NULL DEFAULT '8+ Years',
  weddings_captured TEXT NOT NULL DEFAULT '250+ Celebrations',
  drone_hours TEXT NOT NULL DEFAULT '500+ Hours',
  happy_couples TEXT NOT NULL DEFAULT '300+ Couples',
  about_heading TEXT NOT NULL DEFAULT 'Big feelings. Beautifully kept.',
  about_story TEXT NOT NULL DEFAULT 'We believe the moments that matter most don’t need a pose or a perfect plan. They just need the people you love, a little room to be yourselves, and someone there to notice.',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Site Media Customization Table
CREATE TABLE IF NOT EXISTS public.media (
  id TEXT PRIMARY KEY DEFAULT 'default',
  hero_image_url TEXT NOT NULL DEFAULT 'public/cherry-hero-ai.png',
  logo_url TEXT NOT NULL DEFAULT 'public/cherry-captures-logo.jpeg',
  about_image_url TEXT NOT NULL DEFAULT 'public/cherry-captures-logo.jpeg',
  banner_image_url TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================
-- Insert Default Records
-- ==========================================================

INSERT INTO public.settings (id, phone, whatsapp, email, instagram)
VALUES ('default', '+91 97041 63008', '919704163008', 'hello@cherrycaptures.com', 'https://instagram.com/cherrycaptures')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.experience (id, years_experience, weddings_captured, drone_hours, happy_couples, about_heading, about_story)
VALUES (
  'default',
  '8+ Years',
  '250+ Celebrations',
  '500+ Hours',
  '300+ Couples',
  'Big feelings. Beautifully kept.',
  'We believe the moments that matter most don’t need a pose or a perfect plan. They just need the people you love, a little room to be yourselves, and someone there to notice.'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.media (id, hero_image_url, logo_url, about_image_url)
VALUES ('default', 'public/cherry-hero-ai.png', 'public/cherry-captures-logo.jpeg', 'public/cherry-captures-logo.jpeg')
ON CONFLICT (id) DO NOTHING;

-- Initial default reviews
INSERT INTO public.reviews (client_name, event_type, rating, comment, instagram_handle)
VALUES
('Pooja & Karthik', 'Destination Wedding, Goa', 5, 'Cherry Captures made our wedding feel like a timeless film. Every smile, every tear, and every candid glance was preserved so naturally. We can’t stop rewatching our gallery!', '@pooja_karthik'),
('Deepika & Rahul', 'Traditional Wedding, Hyderabad', 5, 'The drone shots took our breath away! Professional, warm, and invisible during the sacred rituals. Truly gifted storytellers.', '@deepika.r'),
('Sneha & Arjun', 'Pre-Wedding & Sangeet', 5, 'From the pre-wedding shoot to our reception, the team brought so much patience, kindness and cinematic artistry. Highly recommended!', '@arjun_sneha')
ON CONFLICT DO NOTHING;

-- Initial default ads with Instagram links
INSERT INTO public.ads (title, badge, description, instagram_url, active)
VALUES
('Vehicle Delivery Shoots', 'NEW SERVICE', 'Cinematic showroom car & bike delivery reveal films with 4K drone tracking.', 'https://instagram.com/', true),
('Instagram Video & Reels Shoots', 'TRENDING', 'High-energy 9:16 vertical 4K edits, trending audio sync & 24h turnaround.', 'https://instagram.com/', true),
('2026-27 Wedding Dates Open', 'BOOKING NOW', 'Now taking bookings for the upcoming wedding season across India. Limited weekend dates available.', 'https://instagram.com/', true),
('Complimentary Drone Teaser', 'LIMITED OFFER', 'Book your wedding package this month and get a complimentary 4K cinematic aerial highlight reel.', 'https://instagram.com/', true)
ON CONFLICT DO NOTHING;

-- Initial default projects
INSERT INTO public.projects (title, category, subtitle, image_url, instagram_url, featured)
VALUES
('Nightfall in the GT', 'vehicles', 'Vehicle Delivery · Showroom Reveal', 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1400&q=88', 'https://instagram.com/', true),
('Golden Hour Aesthetic', 'reels', 'Instagram Reel · 4K Vertical', 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=88', 'https://instagram.com/', true),
('A promise in the garden', 'weddings', 'Weddings · The golden hour', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1400&q=88', 'https://instagram.com/', true),
('Where the day begins', 'weddings', 'Weddings · A quiet beginning', 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1200&q=88', 'https://instagram.com/', true),
('A softer kind of Sunday', 'portraits', 'Portraits · At home', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=88', 'https://instagram.com/', true),
('One more song', 'celebrations', 'Celebrations · All together', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=88', 'https://instagram.com/', true),
('A little after forever', 'weddings', 'Weddings · Just married', 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=1000&q=88', 'https://instagram.com/', true),
('Made of golden light', 'portraits', 'Portraits · Out in the open', 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=88', 'https://instagram.com/', true),
('The day, in motion', 'films', 'Cinematic Films · Highlights', 'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?auto=format&fit=crop&w=1400&q=88', 'https://instagram.com/', true)
ON CONFLICT DO NOTHING;

-- ==========================================================
-- Enable Row Level Security (RLS)
-- ==========================================================
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- Allow public read access to content tables
DROP POLICY IF EXISTS "Public read settings" ON public.settings;
CREATE POLICY "Public read settings" ON public.settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public read reviews" ON public.reviews;
CREATE POLICY "Public read reviews" ON public.reviews FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public read ads" ON public.ads;
CREATE POLICY "Public read ads" ON public.ads FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public read projects" ON public.projects;
CREATE POLICY "Public read projects" ON public.projects FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public read experience" ON public.experience;
CREATE POLICY "Public read experience" ON public.experience FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public read media" ON public.media;
CREATE POLICY "Public read media" ON public.media FOR SELECT USING (true);

-- Allow public to submit booking enquiries
DROP POLICY IF EXISTS "Public insert enquiries" ON public.enquiries;
CREATE POLICY "Public insert enquiries" ON public.enquiries FOR INSERT WITH CHECK (true);

-- Full access for service_role (used by server backend)
DROP POLICY IF EXISTS "Service full access settings" ON public.settings;
CREATE POLICY "Service full access settings" ON public.settings USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Service full access enquiries" ON public.enquiries;
CREATE POLICY "Service full access enquiries" ON public.enquiries USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Service full access reviews" ON public.reviews;
CREATE POLICY "Service full access reviews" ON public.reviews USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Service full access ads" ON public.ads;
CREATE POLICY "Service full access ads" ON public.ads USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Service full access projects" ON public.projects;
CREATE POLICY "Service full access projects" ON public.projects USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Service full access experience" ON public.experience;
CREATE POLICY "Service full access experience" ON public.experience USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Service full access media" ON public.media;
CREATE POLICY "Service full access media" ON public.media USING (true) WITH CHECK (true);
