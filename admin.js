// Admin Dashboard Logic
document.addEventListener("DOMContentLoaded", () => {
  const loginView = document.getElementById("admin-login-view");
  const dashView = document.getElementById("admin-dashboard-view");
  const loginForm = document.getElementById("admin-login-form");
  const pwdInput = document.getElementById("admin-pwd-input");
  const fillChip = document.getElementById("fill-pwd-chip");
  const errorMsg = document.getElementById("admin-login-error");
  const logoutBtn = document.getElementById("admin-logout-btn");

  if (fillChip && pwdInput) {
    fillChip.addEventListener("click", () => {
      pwdInput.value = "cherrycaptures2026";
      pwdInput.focus();
    });
  }

  // Check existing session
  fetch("/api/admin/session")
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(data => {
      if (data.authenticated) {
        showDashboard();
      }
    })
    .catch(() => {});

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      errorMsg.textContent = "";
      const pwd = pwdInput.value;
      try {
        const res = await fetch("/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: pwd })
        });
        const data = await res.json();
        if (res.ok) {
          showDashboard();
        } else {
          errorMsg.textContent = data.error || "Incorrect password. Try cherrycaptures2026";
        }
      } catch {
        errorMsg.textContent = "Server error. Ensure node server is running.";
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await fetch("/api/admin/logout", { method: "POST" });
      location.reload();
    });
  }

  function showDashboard() {
    loginView.hidden = true;
    dashView.hidden = false;
    logoutBtn.hidden = false;
    loadEnquiries();
    loadSettings();
    initAdminTabs();
  }

  async function loadEnquiries() {
    const tbody = document.getElementById("enquiries-tbody");
    const countEl = document.getElementById("total-enquiries-count");
    const tabCount = document.getElementById("enquiry-tab-count");
    try {
      const res = await fetch("/api/admin/enquiries");
      if (!res.ok) return;
      const enquiries = await res.json();
      if (countEl) countEl.textContent = enquiries.length;
      if (tabCount) tabCount.textContent = enquiries.length;

      if (!enquiries.length) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 30px; color: #888;">No booking enquiries yet.</td></tr>`;
        return;
      }

      tbody.innerHTML = enquiries.map(e => `
        <tr>
          <td><strong>${e.name}</strong><br><small style="color:#888;">${e.email}</small></td>
          <td><span style="color:#dfb455; font-weight:700;">${e.service}</span></td>
          <td>${e.date || "TBD"}<br><small style="color:#888;">${e.location || "Not specified"}</small></td>
          <td><a href="tel:${e.phone || ''}" style="color:#25d366;">${e.phone || 'N/A'}</a></td>
          <td><span style="padding:3px 8px; border-radius:6px; background:#1e2738; font-size:11px; font-weight:700;">${e.status.toUpperCase()}</span></td>
          <td>
            <a href="https://wa.me/${(e.phone || '').replace(/\D/g, '')}" target="_blank" style="color:#25d366; font-weight:700; text-decoration:none;">Chat WhatsApp ↗</a>
          </td>
        </tr>
      `).join("");
    } catch {}
  }

  async function loadSettings() {
    try {
      const res = await fetch("/api/settings");
      if (!res.ok) return;
      const s = await res.json();
      if (document.getElementById("setting-phone")) document.getElementById("setting-phone").value = s.phone || "";
      if (document.getElementById("setting-whatsapp")) document.getElementById("setting-whatsapp").value = s.whatsapp || "";
      if (document.getElementById("setting-email")) document.getElementById("setting-email").value = s.email || "";
      if (document.getElementById("setting-instagram")) document.getElementById("setting-instagram").value = s.instagram || "";
    } catch {}
  }

  const settingsForm = document.getElementById("admin-settings-form");
  const settingsFb = document.getElementById("settings-feedback");
  if (settingsForm) {
    settingsForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      settingsFb.textContent = "Saving...";
      settingsFb.style.color = "#dfb455";
      const payload = {
        phone: document.getElementById("setting-phone").value,
        whatsapp: document.getElementById("setting-whatsapp").value,
        email: document.getElementById("setting-email").value,
        instagram: document.getElementById("setting-instagram").value
      };
      try {
        const res = await fetch("/api/admin/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          settingsFb.textContent = "✓ Settings saved successfully!";
          settingsFb.style.color = "#10b981";
        } else {
          settingsFb.textContent = "Failed to save settings.";
          settingsFb.style.color = "#ff5c77";
        }
      } catch {
        settingsFb.textContent = "Error saving settings.";
        settingsFb.style.color = "#ff5c77";
      }
    });
  }

  function initAdminTabs() {
    const tabs = document.querySelectorAll(".admin-tab");
    tabs.forEach(t => {
      t.addEventListener("click", () => {
        tabs.forEach(x => x.classList.remove("active"));
        t.classList.add("active");
        const target = t.dataset.tab;
        document.querySelectorAll(".admin-tab-pane").forEach(p => p.classList.remove("active"));
        const targetPane = document.getElementById(`tab-${target}`);
        if (targetPane) targetPane.classList.add("active");
      });
    });
  }
});
