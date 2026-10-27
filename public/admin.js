const loginPanel = document.querySelector("#login-panel");
const adminApp = document.querySelector("#admin-app");
const loginForm = document.querySelector("#login-form");
const loginMessage = document.querySelector("#login-message");
const logoutButton = document.querySelector("#logout-button");
const globalMessage = document.querySelector("#admin-global-message");
const dbStatusBadge = document.querySelector("#db-status-badge");

// Tab counts & stats
const statTotal = document.querySelector("#stat-total");
const statNew = document.querySelector("#stat-new");
const statPromos = document.querySelector("#stat-promos");
const tabEnquiryCount = document.querySelector("#tab-enquiry-count");
const tabAdsCount = document.querySelector("#tab-ads-count");
const tabReviewsCount = document.querySelector("#tab-reviews-count");
const tabProjectsCount = document.querySelector("#tab-projects-count");

// Views
const tabs = document.querySelectorAll(".admin-tab");
const views = document.querySelectorAll(".admin-view");

// Data caches
let enquiries = [];
let ads = [];
let reviews = [];
let projects = [];

document.querySelector("#today-date").textContent = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric"
}).format(new Date());

async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body && !headers["Content-Type"]) headers["Content-Type"] = "application/json";
  const response = await fetch(path, { ...options, headers, credentials: "same-origin" });
  const result = response.status === 204 ? {} : await response.json();
  if (!response.ok) {
    const error = new Error(result.error || "The request could not be completed.");
    error.status = response.status;
    throw error;
  }
  return result;
}

function showAdmin() {
  loginPanel.hidden = true;
  adminApp.hidden = false;
  logoutButton.hidden = false;
  loadAllData();
}

function showLogin() {
  adminApp.hidden = true;
  loginPanel.hidden = false;
  logoutButton.hidden = true;
}

function setError(message) {
  if (globalMessage) globalMessage.textContent = message || "";
}

function formatDate(dateString) {
  if (!dateString) return "Date not set";
  const date = new Date(dateString);
  return Number.isNaN(date.getTime()) ? dateString : new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date);
}

// -------------------------------------------------------------
// Database Status Indicator
// -------------------------------------------------------------
async function checkDbStatus() {
  if (!dbStatusBadge) return;
  try {
    const status = await api("/api/status");
    if (status.type === "supabase") {
      dbStatusBadge.textContent = "🟢 Supabase Connected";
      dbStatusBadge.className = "admin-db-badge db-supabase";
      dbStatusBadge.title = status.message;
    } else {
      dbStatusBadge.textContent = "🟡 Local Storage Mode";
      dbStatusBadge.className = "admin-db-badge db-local";
      dbStatusBadge.title = status.message + " (Set SUPABASE_URL and SUPABASE_ANON_KEY to connect to Supabase)";
    }
  } catch {
    dbStatusBadge.textContent = "⚪ Offline";
  }
}

// -------------------------------------------------------------
// Navigation Tabs
// -------------------------------------------------------------
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const targetTab = tab.dataset.tab;
    tabs.forEach((t) => t.classList.toggle("active", t === tab));
    views.forEach((view) => {
      view.hidden = view.id !== `${targetTab}-view`;
    });
  });
});

// -------------------------------------------------------------
// Tab 1: Enquiries
// -------------------------------------------------------------
const enquiryRows = document.querySelector("#enquiry-rows");
const emptyEnquiries = document.querySelector("#empty-enquiries");
const statusFilter = document.querySelector("#status-filter");
const refreshEnquiries = document.querySelector("#refresh-enquiries");

function renderEnquiries() {
  const filter = statusFilter.value;
  const visible = enquiries.filter((item) => filter === "all" || item.status === filter);
  enquiryRows.replaceChildren();
  emptyEnquiries.hidden = visible.length > 0;

  statTotal.textContent = String(enquiries.length);
  statNew.textContent = String(enquiries.filter((e) => e.status === "new").length);
  tabEnquiryCount.textContent = String(enquiries.filter((e) => e.status === "new").length);

  visible.forEach((item) => {
    const row = document.createElement("tr");

    // Client cell
    const client = document.createElement("td");
    const clientName = document.createElement("b");
    clientName.textContent = item.name;
    const clientEmail = document.createElement("a");
    clientEmail.href = "mailto:" + item.email;
    clientEmail.textContent = item.email;
    client.append(clientName, clientEmail);

    // Story cell
    const story = document.createElement("td");
    const service = document.createElement("b");
    service.textContent = item.service;
    const note = document.createElement("small");
    note.textContent = item.message ? item.message.slice(0, 100) + (item.message.length > 100 ? "…" : "") : "No extra note";
    story.append(service, note);
    if (item.message && item.message.length > 100) {
      const details = document.createElement("details");
      const summary = document.createElement("summary");
      summary.textContent = "Read full note";
      const fullNote = document.createElement("p");
      fullNote.textContent = item.message;
      details.append(summary, fullNote);
      story.append(details);
    }

    // When & Where
    const when = document.createElement("td");
    const eventDate = document.createElement("span");
    eventDate.textContent = formatDate(item.date);
    const place = document.createElement("small");
    place.textContent = item.location || "Location not set";
    place.style.display = "block";
    place.style.marginTop = "4px";
    place.style.color = "#81796d";
    when.append(eventDate, place);

    // Received date
    const received = document.createElement("td");
    received.textContent = formatDate(item.created_at || item.createdAt);

    // Status select
    const statusCell = document.createElement("td");
    const select = document.createElement("select");
    ["new", "contacted", "booked", "archived"].forEach((val) => {
      const opt = document.createElement("option");
      opt.value = val;
      opt.textContent = val.charAt(0).toUpperCase() + val.slice(1);
      if (item.status === val) opt.selected = true;
      select.append(opt);
    });
    select.addEventListener("change", async () => {
      try {
        await api(`/api/admin/enquiries/${item.id}`, {
          method: "PATCH",
          body: JSON.stringify({ status: select.value })
        });
        item.status = select.value;
        renderEnquiries();
      } catch (err) {
        alert(err.message);
      }
    });
    statusCell.append(select);

    // Action cell (Delete)
    const actionCell = document.createElement("td");
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", async () => {
      if (!confirm(`Delete enquiry from ${item.name}?`)) return;
      try {
        await api(`/api/admin/enquiries/${item.id}`, { method: "DELETE" });
        enquiries = enquiries.filter((e) => e.id !== item.id);
        renderEnquiries();
      } catch (err) {
        alert(err.message);
      }
    });
    actionCell.append(deleteBtn);

    row.append(client, story, when, received, statusCell, actionCell);
    enquiryRows.append(row);
  });
}

async function loadEnquiries() {
  try {
    enquiries = await api("/api/admin/enquiries");
    renderEnquiries();
  } catch (err) {
    if (err.status === 401) showLogin();
  }
}

if (statusFilter) statusFilter.addEventListener("change", renderEnquiries);
if (refreshEnquiries) refreshEnquiries.addEventListener("click", loadEnquiries);

// -------------------------------------------------------------
// Tab 2: Scrollable Ads (with Instagram links)
// -------------------------------------------------------------
const adsList = document.querySelector("#ads-list");
const emptyAds = document.querySelector("#empty-ads");
const adForm = document.querySelector("#ad-form");
const adMessage = document.querySelector("#ad-message");

function renderAds() {
  adsList.replaceChildren();
  emptyAds.hidden = ads.length > 0;
  tabAdsCount.textContent = String(ads.filter((a) => a.active).length);

  ads.forEach((ad) => {
    const card = document.createElement("article");
    card.className = "item-preview-card" + (ad.active ? "" : " inactive");

    const header = document.createElement("div");
    header.className = "item-header";
    const badge = document.createElement("span");
    badge.className = "item-badge";
    badge.textContent = ad.badge || "PROMO";
    const statusText = document.createElement("small");
    statusText.style.color = ad.active ? "#78a981" : "#887f72";
    statusText.textContent = ad.active ? "● Live on site" : "○ Inactive";
    header.append(badge, statusText);

    const title = document.createElement("h4");
    title.className = "item-title";
    title.textContent = ad.title;

    const desc = document.createElement("p");
    desc.className = "item-desc";
    desc.textContent = ad.description;

    const footer = document.createElement("div");
    footer.className = "item-footer";

    const instaLink = document.createElement("a");
    instaLink.href = ad.instagram_url || "https://instagram.com/";
    instaLink.target = "_blank";
    instaLink.rel = "noreferrer";
    instaLink.textContent = "View Instagram Post ↗";

    const actions = document.createElement("div");
    actions.className = "item-actions";

    const toggleBtn = document.createElement("button");
    toggleBtn.className = "delete-btn";
    toggleBtn.style.color = "var(--gold-pale)";
    toggleBtn.style.borderColor = "rgba(216,173,99,.3)";
    toggleBtn.textContent = ad.active ? "Deactivate" : "Activate";
    toggleBtn.addEventListener("click", async () => {
      try {
        await api(`/api/admin/ads/${ad.id}`, {
          method: "PATCH",
          body: JSON.stringify({ active: !ad.active })
        });
        ad.active = !ad.active;
        renderAds();
      } catch (err) {
        alert(err.message);
      }
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", async () => {
      if (!confirm(`Delete ad "${ad.title}"?`)) return;
      try {
        await api(`/api/admin/ads/${ad.id}`, { method: "DELETE" });
        ads = ads.filter((a) => a.id !== ad.id);
        renderAds();
      } catch (err) {
        alert(err.message);
      }
    });

    actions.append(toggleBtn, deleteBtn);
    footer.append(instaLink, actions);
    card.append(header, title, desc, footer);
    adsList.append(card);
  });

  if (statPromos) {
    const activeAdsCount = ads.filter((a) => a.active).length;
    statPromos.textContent = `${activeAdsCount} ads · ${reviews.length} reviews`;
  }
}

async function loadAds() {
  try {
    ads = await api("/api/admin/ads");
    renderAds();
  } catch {}
}

if (adForm) {
  adForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(adForm).entries());
    data.active = data.active === "true";
    adMessage.textContent = "Publishing ad…";
    try {
      const created = await api("/api/admin/ads", {
        method: "POST",
        body: JSON.stringify(data)
      });
      ads.unshift(created);
      renderAds();
      adForm.reset();
      adMessage.textContent = "Ad published to scrollable banner!";
      setTimeout(() => { adMessage.textContent = ""; }, 3000);
    } catch (err) {
      adMessage.textContent = err.message;
    }
  });
}

// -------------------------------------------------------------
// Tab 3: Customer Reviews
// -------------------------------------------------------------
const reviewsList = document.querySelector("#reviews-list");
const emptyReviews = document.querySelector("#empty-reviews");
const reviewForm = document.querySelector("#review-form");
const reviewMessage = document.querySelector("#review-message");

function renderReviews() {
  reviewsList.replaceChildren();
  emptyReviews.hidden = reviews.length > 0;
  tabReviewsCount.textContent = String(reviews.length);

  reviews.forEach((rev) => {
    const card = document.createElement("article");
    card.className = "item-preview-card";

    const header = document.createElement("div");
    header.className = "item-header";
    const stars = document.createElement("span");
    stars.style.color = "var(--gold)";
    stars.style.fontSize = "10px";
    stars.textContent = "★".repeat(rev.rating || 5) + "☆".repeat(5 - (rev.rating || 5));

    const eventType = document.createElement("small");
    eventType.style.color = "#8f8679";
    eventType.textContent = rev.event_type || "";
    header.append(stars, eventType);

    const quote = document.createElement("p");
    quote.className = "item-desc";
    quote.style.fontStyle = "italic";
    quote.textContent = `“${rev.comment}”`;

    const footer = document.createElement("div");
    footer.className = "item-footer";

    const author = document.createElement("span");
    author.style.color = "var(--cream)";
    author.style.fontWeight = "600";
    author.textContent = rev.client_name + (rev.instagram_handle ? ` (${rev.instagram_handle})` : "");

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", async () => {
      if (!confirm(`Delete review from ${rev.client_name}?`)) return;
      try {
        await api(`/api/admin/reviews/${rev.id}`, { method: "DELETE" });
        reviews = reviews.filter((r) => r.id !== rev.id);
        renderReviews();
      } catch (err) {
        alert(err.message);
      }
    });

    footer.append(author, deleteBtn);
    card.append(header, quote, footer);
    reviewsList.append(card);
  });

  if (statPromos) {
    const activeAdsCount = ads.filter((a) => a.active).length;
    statPromos.textContent = `${activeAdsCount} ads · ${reviews.length} reviews`;
  }
}

async function loadReviews() {
  try {
    reviews = await api("/api/admin/reviews");
    renderReviews();
  } catch {}
}

if (reviewForm) {
  reviewForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(reviewForm).entries());
    reviewMessage.textContent = "Adding review…";
    try {
      const created = await api("/api/admin/reviews", {
        method: "POST",
        body: JSON.stringify(data)
      });
      reviews.unshift(created);
      renderReviews();
      reviewForm.reset();
      reviewMessage.textContent = "Customer review added!";
      setTimeout(() => { reviewMessage.textContent = ""; }, 3000);
    } catch (err) {
      reviewMessage.textContent = err.message;
    }
  });
}

// -------------------------------------------------------------
// Tab 4: Projects & Portfolio
// -------------------------------------------------------------
const projectsList = document.querySelector("#projects-list");
const emptyProjects = document.querySelector("#empty-projects");
const projectForm = document.querySelector("#project-form");
const projectMessage = document.querySelector("#project-message");

function renderProjects() {
  projectsList.replaceChildren();
  emptyProjects.hidden = projects.length > 0;
  tabProjectsCount.textContent = String(projects.length);

  projects.forEach((proj) => {
    const card = document.createElement("article");
    card.className = "item-preview-card project-preview";

    const thumb = document.createElement("img");
    thumb.className = "project-thumb";
    thumb.src = proj.image_url;
    thumb.alt = proj.title;
    thumb.loading = "lazy";

    const details = document.createElement("div");
    const catBadge = document.createElement("span");
    catBadge.className = "item-badge";
    catBadge.textContent = (proj.category || "portfolio").toUpperCase();

    const title = document.createElement("h4");
    title.className = "item-title";
    title.style.margin = "4px 0 2px";
    title.textContent = proj.title;

    const sub = document.createElement("small");
    sub.style.display = "block";
    sub.style.color = "#8b8376";
    sub.style.fontSize = "7.5px";
    sub.textContent = proj.subtitle || "";

    const footer = document.createElement("div");
    footer.style.display = "flex";
    footer.style.justifyContent = "space-between";
    footer.style.alignItems = "center";
    footer.style.marginTop = "6px";

    if (proj.instagram_url) {
      const instaLink = document.createElement("a");
      instaLink.href = proj.instagram_url;
      instaLink.target = "_blank";
      instaLink.style.color = "var(--gold-pale)";
      instaLink.style.fontSize = "7px";
      instaLink.textContent = "Instagram ↗";
      footer.append(instaLink);
    } else {
      footer.append(document.createElement("span"));
    }

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", async () => {
      if (!confirm(`Delete project "${proj.title}"?`)) return;
      try {
        await api(`/api/admin/projects/${proj.id}`, { method: "DELETE" });
        projects = projects.filter((p) => p.id !== proj.id);
        renderProjects();
      } catch (err) {
        alert(err.message);
      }
    });
    footer.append(deleteBtn);

    details.append(catBadge, title, sub, footer);
    card.append(thumb, details);
    projectsList.append(card);
  });
}

async function loadProjects() {
  try {
    projects = await api("/api/admin/projects");
    renderProjects();
  } catch {}
}

if (projectForm) {
  projectForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(projectForm).entries());
    projectMessage.textContent = "Adding project…";
    try {
      const created = await api("/api/admin/projects", {
        method: "POST",
        body: JSON.stringify(data)
      });
      projects.unshift(created);
      renderProjects();
      projectForm.reset();
      projectMessage.textContent = "Project added to portfolio!";
      setTimeout(() => { projectMessage.textContent = ""; }, 3000);
    } catch (err) {
      projectMessage.textContent = err.message;
    }
  });
}

// -------------------------------------------------------------
// Tab 5: Experience & About
// -------------------------------------------------------------
const experienceForm = document.querySelector("#experience-form");
const experienceMessage = document.querySelector("#experience-message");

async function loadExperience() {
  if (!experienceForm) return;
  try {
    const exp = await api("/api/admin/experience");
    for (const [key, val] of Object.entries(exp)) {
      const input = experienceForm.elements[key];
      if (input) input.value = val || "";
    }
  } catch {}
}

if (experienceForm) {
  experienceForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(experienceForm).entries());
    experienceMessage.textContent = "Saving experience details…";
    try {
      await api("/api/admin/experience", {
        method: "PUT",
        body: JSON.stringify(data)
      });
      experienceMessage.textContent = "Experience & Story updated successfully!";
      setTimeout(() => { experienceMessage.textContent = ""; }, 3000);
    } catch (err) {
      experienceMessage.textContent = err.message;
    }
  });
}

// -------------------------------------------------------------
// Tab 6: Site Media & Images
// -------------------------------------------------------------
const mediaForm = document.querySelector("#media-form");
const mediaMessage = document.querySelector("#media-message");

async function loadMedia() {
  if (!mediaForm) return;
  try {
    const med = await api("/api/admin/media");
    for (const [key, val] of Object.entries(med)) {
      const input = mediaForm.elements[key];
      if (input) input.value = val || "";
    }
  } catch {}
}

if (mediaForm) {
  mediaForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(mediaForm).entries());
    mediaMessage.textContent = "Saving site images…";
    try {
      await api("/api/admin/media", {
        method: "PUT",
        body: JSON.stringify(data)
      });
      mediaMessage.textContent = "Website images updated successfully!";
      setTimeout(() => { mediaMessage.textContent = ""; }, 3000);
    } catch (err) {
      mediaMessage.textContent = err.message;
    }
  });
}

// -------------------------------------------------------------
// Tab 7: Studio Settings
// -------------------------------------------------------------
const settingsForm = document.querySelector("#settings-form");
const settingsMessage = document.querySelector("#settings-message");

async function loadSettings() {
  if (!settingsForm) return;
  try {
    const set = await api("/api/admin/settings");
    for (const [key, val] of Object.entries(set)) {
      const input = settingsForm.elements[key];
      if (input) input.value = val || "";
    }
  } catch {}
}

if (settingsForm) {
  settingsForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(settingsForm).entries());
    settingsMessage.textContent = "Saving studio settings…";
    try {
      await api("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify(data)
      });
      settingsMessage.textContent = "Studio contact details saved!";
      setTimeout(() => { settingsMessage.textContent = ""; }, 3000);
    } catch (err) {
      settingsMessage.textContent = err.message;
    }
  });
}

// -------------------------------------------------------------
// Load All Admin Data
// -------------------------------------------------------------
async function loadAllData() {
  checkDbStatus();
  loadEnquiries();
  loadAds();
  loadReviews();
  loadProjects();
  loadExperience();
  loadMedia();
  loadSettings();
}

// -------------------------------------------------------------
// Auth: Session, Login & Logout
// -------------------------------------------------------------
async function checkSession() {
  try {
    const session = await api("/api/admin/session");
    if (session.authenticated) {
      showAdmin();
    } else {
      showLogin();
    }
  } catch {
    showLogin();
  }
}

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const password = loginForm.elements.password.value;
    loginMessage.textContent = "Signing in…";
    try {
      await api("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ password })
      });
      loginForm.reset();
      loginMessage.textContent = "";
      showAdmin();
    } catch (err) {
      loginMessage.textContent = err.message;
    }
  });
}

if (logoutButton) {
  logoutButton.addEventListener("click", async () => {
    try {
      await api("/api/admin/logout", { method: "POST" });
    } finally {
      showLogin();
    }
  });
}

// Start
checkSession();
