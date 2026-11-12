import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const dataFile = resolve(root, "data", "site-data.json");

export const SERVICES_CATALOG = [
  {
    id: "weddings",
    title: "Marriage & Wedding Shoots",
    badge: "SACRED MUHURTHAM",
    subtitle: "Pellikuthuru, Varmala & Grand Reception",
    description: "Sacred South Indian marriage rituals, Muhurtham, Varmala, and reception cinema captured in authentic 4K HDR.",
    image_url: "public/indian-wedding-marriage-realistic.png",
    link: "contact.html?service=Marriage%20%26%20Wedding%20Shoot"
  },
  {
    id: "prewedding",
    title: "Romantic Pre-Wedding Shoots",
    badge: "TRENDING TEASERS",
    subtitle: "Heritage Palaces, Scenic Lakes & Sunset Silhouettes",
    description: "Picturesque outdoor locations, sunset silhouettes, creative styling, and ready-to-share teaser reels that set the tone for your wedding.",
    image_url: "public/indian-prewedding-realistic.png",
    link: "contact.html?service=Pre-Wedding%20Romantic%20Shoot"
  },
  {
    id: "invitations",
    title: "Invitation Videos & Event Promos",
    badge: "4K DIGITAL CARDS",
    subtitle: "Royal Animated Save-The-Dates & WhatsApp Reels",
    description: "Opulent 24K gold animated Telugu & Sanskrit wedding invitation cards, couple story teasers, high-impact event trailers, and WhatsApp invitation reels.",
    image_url: "public/indian-invitation-video-promo.png",
    link: "contact.html?service=Invitation%20Videos%20%26%20Event%20Promos"
  },
  {
    id: "halfsaree",
    title: "Traditional Half-Saree Functions (Langa Voni)",
    badge: "AUSPICIOUS RITUALS",
    subtitle: "Ritusuddhi Ceremony & Kanchipuram Silk Portraits",
    description: "Auspicious coming-of-age celebration with traditional Kanchipuram silk drape portraits, family blessings, ceremonial decor, and candid joyful moments.",
    image_url: "public/indian-halfsaree-realistic.png",
    link: "contact.html?service=Half-Saree%20Function"
  },
  {
    id: "birthdays",
    title: "1st Birthday & Kids Milestones",
    badge: "PURE JOY",
    subtitle: "Cake Smash Laughter & Candid Family Hugs",
    description: "Capturing innocent laughter, colorful theme decor, messy cake smash fun, and heartwarming grandparent moments.",
    image_url: "public/indian-birthday-realistic.png",
    link: "contact.html?service=Birthday%20%26%20Milestone%20Celebration"
  },
  {
    id: "personal",
    title: "Personal Shoots & Creative Portraits",
    badge: "EDITORIAL GLAMOUR",
    subtitle: "Artistic Folios, Maternity & Personal Branding",
    description: "Dramatic studio lighting, artistic maternity celebrations, model folios, and creative personal branding portraits with cinema-grade color grading.",
    image_url: "public/indian-personal-portrait-realistic.png",
    link: "contact.html?service=Personal%20%26%20Creative%20Portraits"
  },
  {
    id: "vehicles",
    title: "Luxury Car & Vehicle Delivery Shoots",
    badge: "EXCLUSIVE CELEBRATION",
    subtitle: "Showroom Ribbon Cut & High-Octane Rolling Cinema",
    description: "Commemorate bringing your dream machine home with showroom delivery moments, ribbon-cutting ceremonies, rolling shots, and 9:16 Instagram delivery reels.",
    image_url: "public/indian-car-delivery-realistic.png",
    link: "contact.html?service=Luxury%20Car%20Delivery%20Shoot"
  },
  {
    id: "reels",
    title: "Instagram Reels & Vertical Cinema",
    badge: "VIRAL 9:16",
    subtitle: "Trend-Setting Edits, Gimbal Moves & Social Stories",
    description: "High-energy vertical video production, synchronized to trending tracks with speed-ramping, cinematic gimbal moves, and viral aesthetic grading.",
    image_url: "public/indian-reels-cinematography-realistic.png",
    link: "contact.html?service=Instagram%20Reels%20%26%20Vertical%20Cinema"
  },
  {
    id: "arrangements",
    title: "Convention Halls & DJ Live Music",
    badge: "VENUES & DJ",
    subtitle: "Guntur & Narasaraopeta AC Halls with Concert Sound",
    description: "Facilitating premier AC convention halls across Guntur & Narasaraopeta alongside concert-grade line-array DJ sound towers, moving beam trusses, and live Dhol. Pre-booking 15-30 days in advance is mandatory!",
    image_url: "public/indian-convention-hall-luxury.png",
    link: "contact.html?service=Convention%20Hall%20%26%20DJ%20Music%20Arrangement"
  }
];

export async function getSiteData() {
  try {
    const raw = await readFile(dataFile, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    return { settings: {}, enquiries: [], reviews: [], ads: [] };
  }
}

export async function saveSiteData(data) {
  await writeFile(dataFile, JSON.stringify(data, null, 2), "utf8");
}
