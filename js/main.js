document.addEventListener("DOMContentLoaded", () => {
  // ─── Hamburger Menu ───
  const hamburger = document.getElementById("hamburger");
  const overlay = document.getElementById("menuOverlay");
  const closeBtn = document.getElementById("menuClose");

  function openMenu() {
    hamburger.classList.add("active");
    overlay.classList.add("open");
  }

  function closeMenu() {
    hamburger.classList.remove("active");
    overlay.classList.remove("open");
  }

  hamburger.addEventListener("click", () => {
    overlay.classList.contains("open") ? closeMenu() : openMenu();
  });

  closeBtn.addEventListener("click", closeMenu);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeMenu();
  });

  // Close menu when a nav link is clicked
  document.querySelectorAll(".menu-links a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  // ─── Load JSON Data ───
  loadSection("data/experience.json", "experienceCards", renderExperienceCard);
  loadSection("data/achievements.json", "achievementCards", renderAchievementCard);
  loadSection("data/education.json", "educationCards", renderExperienceCard);

  // ─── Birthday Check ───
  checkBirthday();
});

async function loadSection(url, containerId, renderFn) {
  const container = document.getElementById(containerId);
  const section = container.closest(".section");
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load ${url}`);
    const data = await res.json();
    if (!data || data.length === 0) {
      section.style.display = "none";
      return;
    }
    data.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    container.innerHTML = data.map(renderFn).join("");
  } catch (err) {
    console.error(err);
    section.style.display = "none";
  }
}

function renderExperienceCard(item) {
  const descHtml = Array.isArray(item.description)
    ? `<ul>${item.description.map((d) => `<li>${escapeHtml(d)}</li>`).join("")}</ul>`
    : `<p>${escapeHtml(item.description)}</p>`;

  const open = item.url ? `<a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" class="card-link">` : "";
  const close = item.url ? "</a>" : "";

  return `
    ${open}<div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">${escapeHtml(item.title)}</div>
          <div class="card-subtitle">${escapeHtml(item.company)}</div>
        </div>
        <div class="card-date">${escapeHtml(item.date)}</div>
      </div>
      <div class="card-body">${descHtml}</div>
    </div>${close}`;
}

function renderAchievementCard(item) {
  const open = item.url ? `<a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" class="card-link">` : "";
  const close = item.url ? "</a>" : "";

  return `
    ${open}<div class="card">
      <div class="card-header">
        <div class="card-title">${escapeHtml(item.title)}</div>
        <div class="card-date">${escapeHtml(item.date)}</div>
      </div>
      <div class="card-body"><p>${escapeHtml(item.description)}</p></div>
    </div>${close}`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// ─── Birthday Celebration ───
async function checkBirthday() {
  try {
    const res = await fetch("data/bday.json");
    if (!res.ok) return;
    const bday = await res.json();

    // Use IST (UTC+5:30) regardless of visitor's timezone
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const utc = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
    const ist = new Date(utc + istOffset);

    if (ist.getMonth() + 1 === bday.month && ist.getDate() === bday.day) {
      const age = ist.getFullYear() - bday.year;
      showBirthday(age);
    }
  } catch (err) {
    // silently skip if no bday config
  }
}

function showBirthday(age) {
  const overlay = document.getElementById("bdayOverlay");
  overlay.classList.add("active");
  document.body.style.overflow = "hidden";

  if (age) {
    document.getElementById("bdayAge").textContent = `🎂 Congrats on turning ${age}! 🎂`;
  }

  // Spawn confetti
  spawnConfetti();

  // Auto-dismiss after 30 seconds
  setTimeout(() => {
    overlay.classList.add("fade-out");
    setTimeout(() => {
      overlay.classList.remove("active", "fade-out");
      document.body.style.overflow = "";
    }, 600);
  }, 30000);
}

function spawnConfetti() {
  const container = document.getElementById("bdayConfetti");
  const colors = ["#f9a8d4", "#a78bfa", "#67e8f9", "#fbbf24", "#34d399", "#fb7185", "#c084fc"];
  const shapes = ["circle", "rect"];

  for (let i = 0; i < 80; i++) {
    const piece = document.createElement("div");
    piece.classList.add("confetti-piece");
    const color = colors[Math.floor(Math.random() * colors.length)];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const left = Math.random() * 100;
    const delay = Math.random() * 4;
    const duration = 3 + Math.random() * 4;
    const size = 6 + Math.random() * 10;

    piece.style.left = left + "%";
    piece.style.width = size + "px";
    piece.style.height = shape === "rect" ? size * 0.6 + "px" : size + "px";
    piece.style.background = color;
    piece.style.borderRadius = shape === "circle" ? "50%" : "2px";
    piece.style.animationDelay = delay + "s";
    piece.style.animationDuration = duration + "s";

    container.appendChild(piece);
  }

  // Respawn confetti every 7 seconds for the full 30s
  const interval = setInterval(() => {
    container.innerHTML = "";
    for (let i = 0; i < 60; i++) {
      const piece = document.createElement("div");
      piece.classList.add("confetti-piece");
      const color = colors[Math.floor(Math.random() * colors.length)];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      const size = 6 + Math.random() * 10;

      piece.style.left = Math.random() * 100 + "%";
      piece.style.width = size + "px";
      piece.style.height = shape === "rect" ? size * 0.6 + "px" : size + "px";
      piece.style.background = color;
      piece.style.borderRadius = shape === "circle" ? "50%" : "2px";
      piece.style.animationDelay = Math.random() * 3 + "s";
      piece.style.animationDuration = 3 + Math.random() * 4 + "s";

      container.appendChild(piece);
    }
  }, 7000);

  // Stop respawning after 30s
  setTimeout(() => clearInterval(interval), 30000);
}
