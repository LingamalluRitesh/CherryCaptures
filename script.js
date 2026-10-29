const menuButton = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector(".primary-nav");

if (menuButton && primaryNav) {
  menuButton.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") !== "true";
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    primaryNav.classList.toggle("is-open", open);
  });
  primaryNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation");
    primaryNav.classList.remove("is-open");
  }));
}

document.querySelectorAll("[data-year]").forEach((node) => { node.textContent = new Date().getFullYear(); });

function setContactLinks(settings) {
  const phone = String(settings.phone || "+91 97041 63008").trim();
  const phoneHref = phone.replace(/[^\d+]/g, "");
  const whatsapp = String(settings.whatsapp || "919704163008").replace(/\D/g, "");
  document.querySelectorAll("[data-phone-link]").forEach((link) => { link.href = "tel:" + phoneHref; });
  document.querySelectorAll("[data-phone-text]").forEach((node) => { node.textContent = phone; });
  document.querySelectorAll("[data-whatsapp-link]").forEach((link) => {
    const message = link.dataset.whatsappMessage;
    link.href = "https://wa.me/" + whatsapp + (message ? "?text=" + encodeURIComponent(message) : "");
  });
  document.querySelectorAll("[data-email-link]").forEach((link) => {
    const email = String(settings.email || "").trim();
    link.hidden = !email;
    if (email) link.href = "mailto:" + email;
  });
  document.querySelectorAll("[data-email-text]").forEach((node) => { node.textContent = settings.email || ""; });
  document.querySelectorAll("[data-instagram-link]").forEach((link) => {
    const instagram = String(settings.instagram || "").trim();
    link.hidden = !instagram;
    if (instagram) link.href = instagram;
  });
}

// -------------------------------------------------------------
// Site-Wide Background Video Playback Assurance
// -------------------------------------------------------------
const siteVideos = document.querySelectorAll("[data-site-video], [data-hero-video]");
siteVideos.forEach((video) => {
  video.muted = true;
  video.playsInline = true;
  const playPromise = video.play();
  if (playPromise !== undefined) {
    playPromise.catch(() => {
      const resume = () => { video.play().catch(() => {}); };
      document.addEventListener("touchstart", resume, { once: true });
      document.addEventListener("scroll", resume, { once: true });
      document.addEventListener("click", resume, { once: true });
    });
  }
});

// -------------------------------------------------------------
// Dynamic Data Loaders (Ads, Reviews, Projects, Experience, Media)
// -------------------------------------------------------------

// 1. Settings
fetch("/api/settings")
  .then((response) => response.ok ? response.json() : Promise.reject(new Error("Settings unavailable")))
  .then(setContactLinks)
  .catch(() => setContactLinks({}));

// Helper for photo marquee images
function getAdPhoto(ad) {
  if (ad.image_url) return ad.image_url;
  const t = ((ad.title || "") + " " + (ad.badge || "")).toLowerCase();
  if (t.includes("car") || t.includes("vehicle") || t.includes("delivery") || t.includes("automobile")) {
    return "public/indian-car-delivery-realistic.png";
  }
  if (t.includes("reel") || t.includes("reels") || t.includes("video") || t.includes("cinema") || t.includes("film") || t.includes("drone")) {
    return "public/indian-reels-cinematography-realistic.png";
  }
  if (t.includes("wedding") || t.includes("muhurtham") || t.includes("varmala") || t.includes("marriage")) {
    return "public/indian-wedding-marriage-realistic.png";
  }
  if (t.includes("pre-wedding") || t.includes("prewedding") || t.includes("couple") || t.includes("sunset") || t.includes("romantic")) {
    return "public/indian-prewedding-realistic.png";
  }
  if (t.includes("half-saree") || t.includes("halfsaree") || t.includes("langa") || t.includes("voni") || t.includes("ritusuddhi")) {
    return "public/indian-halfsaree-realistic.png";
  }
  if (t.includes("birthday") || t.includes("kids") || t.includes("smash") || t.includes("child") || t.includes("cake")) {
    return "public/indian-birthday-realistic.png";
  }
  return "public/indian-wedding-marriage-realistic.png";
}

// 2. Below-Hero Photo-Scrolling Marquee & Ads (with Instagram links)
function loadAds() {
  const photoTrack = document.querySelector("#photo-marquee-track");
  const tickerTrack = document.querySelector("#ticker-track");
  if (!photoTrack && !tickerTrack) return;

  fetch("/api/ads")
    .then((r) => r.ok ? r.json() : [])
    .then((ads) => {
      if (!ads || !ads.length) return;

      // 1. Populate below-hero photo-scrolling marquee
      if (photoTrack) {
        photoTrack.replaceChildren();
        const loopedAds = [...ads, ...ads];
        loopedAds.forEach((ad) => {
          const card = document.createElement("article");
          card.className = "ad-photo-card";

          const img = document.createElement("img");
          img.src = getAdPhoto(ad);
          img.alt = ad.title || "Cherry Captures Special";
          img.loading = "lazy";

          const overlay = document.createElement("div");
          overlay.className = "ad-photo-overlay";

          const topBar = document.createElement("div");
          topBar.className = "ad-photo-top";

          const badge = document.createElement("span");
          badge.className = "ad-card-badge";
          badge.textContent = ad.badge || "NEW SERVICE";

          const instaTag = document.createElement("span");
          instaTag.className = "ad-card-insta-icon";
          instaTag.textContent = "📸 INSTAGRAM";

          topBar.append(badge, instaTag);

          const bottomBar = document.createElement("div");
          bottomBar.className = "ad-photo-bottom";

          const title = document.createElement("h3");
          title.className = "ad-card-title";
          title.textContent = ad.title;

          const desc = document.createElement("p");
          desc.className = "ad-card-desc";
          desc.textContent = ad.description;

          const action = document.createElement("a");
          action.className = "ad-card-action";
          action.href = ad.instagram_url || "https://instagram.com/";
          action.target = "_blank";
          action.rel = "noreferrer";
          action.textContent = "Watch on Instagram ↗";

          bottomBar.append(title, desc, action);
          overlay.append(topBar, bottomBar);
          card.append(img, overlay);
          photoTrack.append(card);
        });
      }

      // 2. Fallback text ticker if present
      if (tickerTrack) {
        tickerTrack.replaceChildren();
        const list = [...ads, ...ads];
        list.forEach((ad) => {
          const item = document.createElement("div");
          item.className = "ad-item";

          const badge = document.createElement("span");
          badge.className = "ad-badge";
          badge.textContent = ad.badge || "PROMO";

          const title = document.createElement("span");
          title.className = "ad-title";
          title.textContent = ad.title;

          const desc = document.createElement("span");
          desc.className = "ad-desc";
          desc.textContent = " — " + ad.description;

          const link = document.createElement("a");
          link.className = "ad-link";
          link.href = ad.instagram_url || "https://instagram.com/";
          link.target = "_blank";
          link.rel = "noreferrer";
          link.textContent = "Check on Instagram ↗";

          const sep = document.createElement("span");
          sep.className = "ticker-sep";
          sep.textContent = "✳";

          item.append(badge, title, desc, link);
          tickerTrack.append(item, sep);
        });
      }
    })
    .catch(() => {});
}
loadAds();

// 3. Customer Reviews
function loadReviews() {
  const container = document.querySelector("#reviews-container");
  if (!container) return;
  fetch("/api/reviews")
    .then((r) => r.ok ? r.json() : [])
    .then((reviews) => {
      if (!reviews || !reviews.length) return;
      container.replaceChildren();
      reviews.forEach((rev) => {
        const card = document.createElement("article");
        card.className = "review-card";

        const stars = document.createElement("div");
        stars.className = "review-stars";
        stars.textContent = "★".repeat(rev.rating || 5) + "☆".repeat(5 - (rev.rating || 5));

        const quote = document.createElement("p");
        quote.className = "review-quote";
        quote.textContent = rev.comment;

        const author = document.createElement("div");
        author.className = "review-author";

        const info = document.createElement("div");
        const name = document.createElement("b");
        name.textContent = rev.client_name;
        const eventType = document.createElement("small");
        eventType.textContent = rev.event_type;
        info.append(name, eventType);

        author.append(info);

        if (rev.instagram_handle) {
          const insta = document.createElement("a");
          insta.className = "review-insta";
          const handle = rev.instagram_handle.startsWith("@") ? rev.instagram_handle.slice(1) : rev.instagram_handle;
          insta.href = rev.instagram_handle.startsWith("http") ? rev.instagram_handle : `https://instagram.com/${handle}`;
          insta.target = "_blank";
          insta.rel = "noreferrer";
          insta.textContent = rev.instagram_handle;
          author.append(insta);
        }

        card.append(stars, quote, author);
        container.append(card);
      });
    })
    .catch(() => {});
}
loadReviews();

// 4. Experience & Stats
function loadExperience() {
  fetch("/api/experience")
    .then((r) => r.ok ? r.json() : null)
    .then((exp) => {
      if (!exp) return;
      document.querySelectorAll("[data-exp-years]").forEach((el) => { el.textContent = exp.years_experience; });
      document.querySelectorAll("[data-exp-weddings]").forEach((el) => { el.textContent = exp.weddings_captured; });
      document.querySelectorAll("[data-exp-drone]").forEach((el) => { el.textContent = exp.drone_hours; });
      document.querySelectorAll("[data-exp-couples]").forEach((el) => { el.textContent = exp.happy_couples; });
      document.querySelectorAll("[data-about-heading]").forEach((el) => { el.textContent = exp.about_heading; });
      if (exp.about_story) {
        document.querySelectorAll("[data-about-story]").forEach((el) => {
          el.innerHTML = exp.about_story.split("\n\n").map((p) => `<p>${p.trim()}</p>`).join("");
        });
      }
    })
    .catch(() => {});
}
loadExperience();

// 5. Media Customization
function loadMedia() {
  fetch("/api/media")
    .then((r) => r.ok ? r.json() : null)
    .then((media) => {
      if (!media) return;
      if (media.hero_image_url) {
        const heroImg = document.querySelector(".hero-backdrop img");
        if (heroImg) heroImg.src = media.hero_image_url;
      }
      if (media.about_image_url) {
        document.querySelectorAll("[data-about-image]").forEach((img) => { img.src = media.about_image_url; });
      }
      if (media.logo_url) {
        document.querySelectorAll(".brand-mark img, .footer-brand img").forEach((img) => { img.src = media.logo_url; });
      }
    })
    .catch(() => {});
}
loadMedia();

// 6. Portfolio Projects
function loadPortfolio() {
  const grid = document.querySelector("#portfolio-grid");
  if (!grid) return;
  fetch("/api/projects")
    .then((r) => r.ok ? r.json() : [])
    .then((projects) => {
      if (!projects || !projects.length) return;
      const allCountBadge = document.querySelector('[data-filter="all"] span');
      if (allCountBadge) allCountBadge.textContent = String(projects.length).padStart(2, "0");
      grid.replaceChildren();
      projects.forEach((proj, idx) => {
        const card = document.createElement("button");
        const spanClass = (idx === 0 || idx === 6) ? "card-span-7 card-height-lg" : (idx === 1 || idx === 5) ? "card-span-5 card-height-lg" : "card-span-4 card-height-md";
        card.className = `portfolio-card ${spanClass}`;
        card.type = "button";
        card.dataset.category = proj.category || "weddings";
        card.dataset.title = proj.title;
        card.dataset.subtitle = proj.subtitle || "";
        card.setAttribute("data-depth", "");

        const img = document.createElement("img");
        img.src = proj.image_url;
        img.alt = proj.title;
        img.loading = "lazy";

        const caption = document.createElement("span");
        caption.className = "portfolio-caption";

        const small = document.createElement("small");
        small.textContent = `${String(idx + 1).padStart(2, "0")} / ${(proj.category || "weddings").toUpperCase()}`;

        const bold = document.createElement("b");
        bold.innerHTML = `${proj.title} <i>↗</i>`;

        caption.append(small, bold);

        if (proj.instagram_url) {
          const pill = document.createElement("a");
          pill.className = "portfolio-insta-pill";
          pill.href = proj.instagram_url;
          pill.target = "_blank";
          pill.rel = "noreferrer";
          pill.textContent = "Instagram ↗";
          pill.addEventListener("click", (e) => e.stopPropagation());
          caption.append(pill);
        }

        card.append(img, caption);
        grid.append(card);
      });
      initPortfolioFilteringAndModal();
    })
    .catch(() => {});
}
loadPortfolio();

// -------------------------------------------------------------
// Interactive Effects & Parallax
// -------------------------------------------------------------
const hero = document.querySelector(".hero");
if (hero && window.matchMedia("(pointer: fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const heroImage = hero.querySelector(".hero-backdrop img");
  hero.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();
    const dx = (event.clientX - rect.left) / rect.width - 0.5;
    const dy = (event.clientY - rect.top) / rect.height - 0.5;
    heroImage.style.transform = "scale(1.13) translate3d(" + (dx * -9).toFixed(1) + "px," + (dy * -6).toFixed(1) + "px,0)";
  });
  hero.addEventListener("pointerleave", () => { heroImage.style.transform = ""; });
}

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!reducedMotion && window.matchMedia("(pointer: fine)").matches) {
  document.querySelectorAll("[data-depth]").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const bounds = element.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      element.style.transform = "perspective(1000px) rotateY(" + (x * 4).toFixed(2) + "deg) rotateX(" + (-y * 3.5).toFixed(2) + "deg) translateY(-3px)";
    });
    element.addEventListener("pointerleave", () => { element.style.transform = ""; });
  });
}

const revealTargets = document.querySelectorAll(".intro, .home-work, .home-services, .home-cta, .service-detail, .service-note, .about-story, .values-band, .about-last, .contact-layout, .portfolio-section, .home-reviews");
if (!reducedMotion && "IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealTargets.forEach((target) => {
    target.classList.add("reveal-on-scroll");
    revealObserver.observe(target);
  });
}

// -------------------------------------------------------------
// Portfolio Filtering & Lightbox Modal
// -------------------------------------------------------------
function initPortfolioFilteringAndModal() {
  const filterButtons = [...document.querySelectorAll("[data-filter]")];
  const portfolioItems = [...document.querySelectorAll(".portfolio-card[data-category]")];
  const portfolioCards = [...document.querySelectorAll("button.portfolio-card[data-category]")];
  const emptyFilter = document.querySelector(".empty-filter");

  filterButtons.forEach((button) => button.addEventListener("click", () => {
    const category = button.dataset.filter;
    filterButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    let count = 0;
    portfolioItems.forEach((card) => {
      const visible = category === "all" || card.dataset.category === category;
      card.hidden = !visible;
      if (visible) count += 1;
    });
    if (emptyFilter) emptyFilter.hidden = count !== 0;
  }));

  const photoDialog = document.querySelector(".photo-dialog");
  if (photoDialog) {
    const dialogImage = photoDialog.querySelector(".dialog-image");
    const dialogTitle = photoDialog.querySelector(".dialog-title");
    const dialogCount = photoDialog.querySelector(".dialog-count");
    let dialogIndex = 0;
    function openPortfolioImage(index) {
      const visible = portfolioCards.filter((card) => !card.hidden);
      if (!visible.length) return;
      dialogIndex = (index + visible.length) % visible.length;
      const card = visible[dialogIndex];
      const image = card.querySelector("img");
      dialogImage.src = image.currentSrc || image.src;
      dialogImage.alt = image.alt;
      dialogTitle.textContent = card.dataset.title + " — " + card.dataset.subtitle;
      dialogCount.textContent = String(dialogIndex + 1).padStart(2, "0") + " / " + String(visible.length).padStart(2, "0");
    }
    portfolioCards.forEach((card) => card.addEventListener("click", () => {
      openPortfolioImage(portfolioCards.filter((item) => !item.hidden).indexOf(card));
      photoDialog.showModal();
    }));
    photoDialog.querySelector(".dialog-close").addEventListener("click", () => photoDialog.close());
    photoDialog.querySelector(".dialog-prev").addEventListener("click", () => openPortfolioImage(dialogIndex - 1));
    photoDialog.querySelector(".dialog-next").addEventListener("click", () => openPortfolioImage(dialogIndex + 1));
    photoDialog.addEventListener("click", (event) => { if (event.target === photoDialog) photoDialog.close(); });
    photoDialog.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") openPortfolioImage(dialogIndex - 1);
      if (event.key === "ArrowRight") openPortfolioImage(dialogIndex + 1);
    });
  }
}
initPortfolioFilteringAndModal();

// -------------------------------------------------------------
// Contact & Booking Form
// -------------------------------------------------------------
const bookingForm = document.querySelector("#booking-form");
if (bookingForm) {
  const params = new URLSearchParams(window.location.search);
  const requestedService = params.get("service");
  const serviceSelect = document.querySelector("#service-select");
  if (requestedService && serviceSelect) {
    const option = [...serviceSelect.options].find((item) => item.text.toLowerCase().includes(requestedService.toLowerCase()));
    if (option) option.selected = true;
  }

  bookingForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!bookingForm.reportValidity()) return;
    const feedback = document.querySelector("#form-feedback");
    const submitButton = bookingForm.querySelector('button[type="submit"]');
    const fields = Object.fromEntries(new FormData(bookingForm).entries());
    submitButton.disabled = true;
    feedback.textContent = "Sending your note…";
    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "We couldn’t send that just now.");
      feedback.textContent = "Your enquiry is with us. We’ll be in touch soon.";
      bookingForm.reset();
    } catch (error) {
      feedback.textContent = "We couldn’t send that just now. Please call or WhatsApp us instead.";
    } finally {
      submitButton.disabled = false;
    }
  });
}
