// =============================================================
// CHERRY CAPTURES - SPATIAL 3D COVERFLOW & INTERACTIVE ENGINE
// =============================================================

document.addEventListener("DOMContentLoaded", () => {
  initIntroLoader();
  initMobileNav();
  initSpatialCoverflow();
  initVenuesTabs();
  initPhotoMarquee();
  fetchStudioSettings();
});

// 1. Opening Intro Loader (Logo only)
function initIntroLoader() {
  const loader = document.getElementById("site-intro-loader");
  if (!loader) return;
  const dismiss = () => {
    if (loader.classList.contains("loader-dismissed")) return;
    loader.classList.add("loader-dismissed");
    setTimeout(() => { if (loader.parentNode) loader.remove(); }, 650);
  };
  const timer = setTimeout(dismiss, 1800);
  loader.addEventListener("click", () => {
    clearTimeout(timer);
    dismiss();
  });
}

// 2. Mobile Nav Toggle
function initMobileNav() {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.getElementById("primary-nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
}

// 3. SPATIAL 3D GLASS COVERFLOW ENGINE (Vision Pro Style)
const SERVICES_DATA = [
  {
    title: "Marriage & Wedding Shoots",
    sub: "Sacred Muhurtham · 4K HDR Cinema",
    thumb: "public/indian-wedding-marriage-realistic.png",
    link: "contact.html?service=Marriage%20%26%20Wedding%20Shoot"
  },
  {
    title: "Romantic Pre-Wedding Shoots",
    sub: "Heritage Palaces · Sunset Teasers",
    thumb: "public/indian-prewedding-realistic.png",
    link: "contact.html?service=Pre-Wedding%20Romantic%20Shoot"
  },
  {
    title: "Invitation Videos & Event Promos",
    sub: "✦ New · 4K Royal Telugu Digital Cards",
    thumb: "public/indian-invitation-video-promo.png",
    link: "contact.html?service=Invitation%20Videos%20%26%20Event%20Promos"
  },
  {
    title: "Half-Saree Functions (Langa Voni)",
    sub: "Auspicious Rituals · Silk Drape Portraits",
    thumb: "public/indian-halfsaree-realistic.png",
    link: "contact.html?service=Half-Saree%20Function"
  },
  {
    title: "1st Birthday & Kids Milestones",
    sub: "Cake Smash Joy · Candid Smiles",
    thumb: "public/indian-birthday-realistic.png",
    link: "contact.html?service=Birthday%20Celebration"
  },
  {
    title: "Personal & Creative Portraits",
    sub: "Editorial Studio · Maternity & Folios",
    thumb: "public/indian-personal-portrait-realistic.png",
    link: "contact.html?service=Personal%20%26%20Creative%20Portraits"
  },
  {
    title: "Car Delivery & Automotive Cinema",
    sub: "Showroom Ribbon Cut · 4K Rolling Reels",
    thumb: "public/indian-car-delivery-realistic.png",
    link: "contact.html?service=Luxury%20Car%20Delivery%20Shoot"
  },
  {
    title: "Instagram Reels & Vertical Cinema",
    sub: "Viral 9:16 Video · Gimbal & Beat-Sync",
    thumb: "public/indian-reels-cinematography-realistic.png",
    link: "contact.html?service=Instagram%20Reels%20%26%20Vertical%20Cinema"
  },
  {
    title: "Convention Halls & DJ Live Music",
    sub: "⚠️ Pre-Booking Mandatory · Concert Sound",
    thumb: "public/indian-convention-hall-luxury.png",
    link: "contact.html?service=Convention%20Hall%20%26%20DJ%20Music%20Arrangement"
  }
];

function initSpatialCoverflow() {
  const cards = Array.from(document.querySelectorAll(".coverflow-card"));
  const dotsContainer = document.getElementById("coverflow-dots");
  const prevBtn = document.getElementById("coverflow-prev");
  const nextBtn = document.getElementById("coverflow-next");
  const topPrev = document.getElementById("coverflow-top-prev");
  const topNext = document.getElementById("coverflow-top-next");
  const controllerThumb = document.getElementById("controller-thumb");
  const controllerTitle = document.getElementById("controller-title");
  const controllerSub = document.getElementById("controller-sub");
  const controllerAction = document.getElementById("controller-action");
  const breadcrumb = document.getElementById("spatial-breadcrumb-title");

  if (!cards.length) return;

  // Start with Invitation Videos & Event Promos (index 2) as highlighted flagship
  let activeIndex = 2;
  const total = cards.length;

  // Build Pagination Dots
  if (dotsContainer) {
    dotsContainer.innerHTML = "";
    cards.forEach((_, idx) => {
      const dot = document.createElement("button");
      dot.className = "spatial-dot" + (idx === activeIndex ? " active" : "");
      dot.type = "button";
      dot.setAttribute("aria-label", `Jump to service ${idx + 1}`);
      dot.addEventListener("click", () => goToIndex(idx));
      dotsContainer.appendChild(dot);
    });
  }

  function updateCoverflow() {
    const isMobile = window.innerWidth <= 768;
    const isTablet = window.innerWidth <= 1080 && window.innerWidth > 768;

    const xOffset1 = isMobile ? 150 : (isTablet ? 210 : 270);
    const xOffset2 = isMobile ? 260 : (isTablet ? 370 : 480);
    const xOffset3 = isMobile ? 360 : (isTablet ? 500 : 660);

    cards.forEach((card, i) => {
      // Circular wrapped difference
      let diff = i - activeIndex;
      if (diff > total / 2) diff -= total;
      if (diff < -total / 2) diff += total;

      card.classList.remove("is-active");

      if (diff === 0) {
        // Active Center Card
        card.classList.add("is-active");
        card.style.transform = `translate3d(0, 0, 80px) rotateY(0deg) scale(1.04)`;
        card.style.opacity = "1";
        card.style.filter = "brightness(1) blur(0px)";
        card.style.zIndex = "10";
        card.style.pointerEvents = "auto";
      } else if (diff === 1) {
        // Immediate Right
        card.style.transform = `translate3d(${xOffset1}px, 0, -90px) rotateY(-26deg) scale(0.88)`;
        card.style.opacity = "0.78";
        card.style.filter = "brightness(0.88) blur(0.4px)";
        card.style.zIndex = "8";
        card.style.pointerEvents = "auto";
      } else if (diff === -1) {
        // Immediate Left
        card.style.transform = `translate3d(-${xOffset1}px, 0, -90px) rotateY(26deg) scale(0.88)`;
        card.style.opacity = "0.78";
        card.style.filter = "brightness(0.88) blur(0.4px)";
        card.style.zIndex = "8";
        card.style.pointerEvents = "auto";
      } else if (diff === 2) {
        // Far Right
        card.style.transform = `translate3d(${xOffset2}px, 0, -180px) rotateY(-38deg) scale(0.76)`;
        card.style.opacity = isMobile ? "0.2" : "0.5";
        card.style.filter = "brightness(0.7) blur(1px)";
        card.style.zIndex = "6";
        card.style.pointerEvents = isMobile ? "none" : "auto";
      } else if (diff === -2) {
        // Far Left
        card.style.transform = `translate3d(-${xOffset2}px, 0, -180px) rotateY(38deg) scale(0.76)`;
        card.style.opacity = isMobile ? "0.2" : "0.5";
        card.style.filter = "brightness(0.7) blur(1px)";
        card.style.zIndex = "6";
        card.style.pointerEvents = isMobile ? "none" : "auto";
      } else {
        // Hidden / Off-stage
        const sign = diff > 0 ? 1 : -1;
        card.style.transform = `translate3d(${sign * xOffset3}px, 0, -280px) rotateY(${sign * -48}deg) scale(0.6)`;
        card.style.opacity = "0";
        card.style.filter = "blur(4px)";
        card.style.zIndex = "1";
        card.style.pointerEvents = "none";
      }
    });

    // Sync Bottom Controller Pill
    const activeData = SERVICES_DATA[activeIndex] || SERVICES_DATA[0];
    if (controllerThumb) controllerThumb.src = activeData.thumb;
    if (controllerTitle) controllerTitle.textContent = activeData.title;
    if (controllerSub) controllerSub.textContent = activeData.sub;
    if (controllerAction) controllerAction.href = activeData.link;
    if (breadcrumb) breadcrumb.textContent = `Cherry Captures · ${activeData.title}`;

    // Sync Pagination Dots
    if (dotsContainer) {
      Array.from(dotsContainer.children).forEach((dot, idx) => {
        dot.classList.toggle("active", idx === activeIndex);
      });
    }
  }

  function goToIndex(idx) {
    activeIndex = (idx + total) % total;
    updateCoverflow();
  }

  function next() {
    goToIndex(activeIndex + 1);
  }

  function prev() {
    goToIndex(activeIndex - 1);
  }

  // Card click handling
  cards.forEach((card, idx) => {
    card.addEventListener("click", (e) => {
      // If clicking directly on a button or link inside, let it navigate
      if (e.target.closest("a") || e.target.closest("button")) return;
      if (idx !== activeIndex) {
        goToIndex(idx);
      }
    });
  });

  if (prevBtn) prevBtn.addEventListener("click", prev);
  if (nextBtn) nextBtn.addEventListener("click", next);
  if (topPrev) topPrev.addEventListener("click", prev);
  if (topNext) topNext.addEventListener("click", next);

  // Keyboard Navigation
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  });

  // Touch Swipe on mobile
  const viewport = document.getElementById("coverflow-viewport");
  if (viewport) {
    let startX = 0;
    viewport.addEventListener("touchstart", (e) => {
      startX = e.changedTouches[0].screenX;
    }, { passive: true });

    viewport.addEventListener("touchend", (e) => {
      const endX = e.changedTouches[0].screenX;
      const diffX = endX - startX;
      if (Math.abs(diffX) > 40) {
        if (diffX < 0) next();
        else prev();
      }
    }, { passive: true });
  }

  // Handle window resize
  window.addEventListener("resize", updateCoverflow);

  // Initial draw
  updateCoverflow();
}

// 4. Venues City Tabs
function initVenuesTabs() {
  const tabs = document.querySelectorAll(".city-tab-btn");
  const panes = document.querySelectorAll(".venues-grid-pane");
  if (!tabs.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const city = tab.dataset.city;
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      panes.forEach(p => {
        if (p.id === `pane-${city}`) p.classList.add("active");
        else p.classList.remove("active");
      });
    });
  });
}

// 5. Below-Hero Photo Marquee
function initPhotoMarquee() {
  const track = document.getElementById("photo-marquee-track");
  if (!track) return;

  fetch("/api/site-data")
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(data => {
      if (data.ads && data.ads.length) {
        renderMarquee(data.ads);
      } else {
        renderDefaultMarquee();
      }
    })
    .catch(() => renderDefaultMarquee());

  function renderMarquee(items) {
    track.innerHTML = "";
    // Double for seamless marquee loop
    const combined = [...items, ...items];
    combined.forEach(ad => {
      const card = document.createElement("article");
      card.className = "ad-photo-card";

      const img = document.createElement("img");
      img.src = ad.image_url || "public/indian-wedding-marriage-realistic.png";
      img.alt = ad.title || "Cherry Captures";
      img.loading = "lazy";
      img.onerror = () => { img.src = "public/indian-wedding-marriage-realistic.png"; };

      const overlay = document.createElement("div");
      overlay.className = "ad-photo-overlay";
      overlay.innerHTML = `
        <div class="ad-photo-top">
          <span class="ad-card-badge">${ad.badge || "FEATURED"}</span>
          <span class="ad-card-insta-icon">📸 INSTAGRAM</span>
        </div>
        <div class="ad-photo-bottom">
          <h3>${ad.title || ""}</h3>
          <p class="ad-card-desc">${ad.description || ""}</p>
          <a class="ad-card-action" href="${ad.instagram_url || 'https://instagram.com/'}" target="_blank" rel="noreferrer">Watch on Instagram ↗</a>
        </div>
      `;
      card.append(img, overlay);
      track.appendChild(card);
    });
  }

  function renderDefaultMarquee() {
    renderMarquee(SERVICES_DATA.map((s, idx) => ({
      title: s.title,
      badge: "CHERRY REELS",
      description: s.sub,
      image_url: s.thumb,
      instagram_url: "https://instagram.com/"
    })));
  }
}

// 6. Fetch Studio Settings for direct Call & WhatsApp links
function fetchStudioSettings() {
  fetch("/api/settings")
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(settings => {
      if (settings.phone) {
        document.querySelectorAll("[data-phone-link]").forEach(el => {
          el.href = `tel:${settings.phone}`;
        });
      }
      if (settings.whatsapp) {
        const clean = settings.whatsapp.replace(/\D/g, "");
        document.querySelectorAll("[data-whatsapp-link]").forEach(el => {
          el.href = `https://wa.me/${clean}`;
        });
      }
    })
    .catch(() => {});
}
