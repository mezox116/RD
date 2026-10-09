
const OWNER_PASSWORD = "RD12345";
const STORAGE_KEY = "rd_red_devils_v2";

let data = { players: [], matches: [], results: [] };

try {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) data = JSON.parse(saved);
} catch (e) {
  console.error("Could not load saved data", e);
}

const $ = (id) => document.getElementById(id);

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  render();
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  })[ch]);
}

function showNotice(message) {
  const el = $("adminNotice");
  if (!el) {
    alert(message);
    return;
  }
  el.textContent = message;
  el.classList.add("show");
}

function fillSelect(id, items) {
  const el = $(id);
  if (!el) return;
  el.innerHTML = items.length
    ? items.map(item =>
        `<option value="${escapeHTML(item.id)}">${escapeHTML(item.name)}</option>`
      ).join("")
    : '<option value="">No options available</option>';
}

function render() {
  const playersGrid = $("playersGrid");
  const matchesGrid = $("matchesGrid");
  const resultsGrid = $("resultsGrid");

  if (playersGrid) {
    playersGrid.innerHTML = data.players.length
      ? data.players.map(p => `
        <article class="card player">
          ${p.photo
            ? `<img class="avatar" src="${p.photo}" alt="">`
            : `<div class="avatar placeholder">${escapeHTML(p.name[0] || "?")}</div>`}
          <div>
            <h3>${escapeHTML(p.name)}</h3>
            <p>${escapeHTML(p.position)}</p>
            ${p.captain ? '<span class="pill captain">★ Captain</span>' : ""}
          </div>
        </article>`).join("")
      : '<div class="empty">No players added yet.</div>';
  }

  if (matchesGrid) {
    matchesGrid.innerHTML = data.matches.length
      ? data.matches.map(m => `
        <article class="card match">
          <h3>${escapeHTML(m.team1)} vs ${escapeHTML(m.team2)}</h3>
          <p>${escapeHTML(m.time)}</p>
        </article>`).join("")
      : '<div class="empty">No upcoming matches.</div>';
  }

  if (resultsGrid) {
    resultsGrid.innerHTML = data.results.length
      ? data.results.slice().reverse().map(r => `
        <article class="card match">
          <h3>${escapeHTML(r.team1)} ${r.score1} - ${r.score2} ${escapeHTML(r.team2)}</h3>
          <p>${escapeHTML(r.time || "")}</p>
        </article>`).join("")
      : '<div class="empty">No results recorded.</div>';
  }

  if ($("playerCount")) $("playerCount").textContent = data.players.length;
  if ($("matchCount")) $("matchCount").textContent = data.matches.length;
  if ($("resultCount")) $("resultCount").textContent = data.results.length;

  fillSelect("captainSelect", data.players.filter(p => !p.captain));
  fillSelect("removePlayerSelect", data.players);
  fillSelect("removeCaptainSelect", data.players.filter(p => p.captain));
  fillSelect("removeMatchSelect", data.matches.map(m => ({
    id: m.id,
    name: `${m.team1} vs ${m.team2}`
  })));
}

function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

const loginForm = $("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if ($("password").value !== OWNER_PASSWORD) {
      alert("Wrong password!");
      return;
    }

    $("loginView").classList.add("hide");
    $("dashboard").classList.remove("hide");
    showNotice("Owner panel unlocked!");
  });
}

if ($("logout")) {
  $("logout").addEventListener("click", () => {
    $("dashboard").classList.add("hide");
    $("loginView").classList.remove("hide");
  });
}

document.querySelectorAll("[data-tab]").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-tab]").forEach(b =>
      b.classList.toggle("active", b === button)
    );

    document.querySelectorAll(".adminform").forEach(form =>
      form.classList.toggle("active", form.id === "form-" + button.dataset.tab)
    );
  });
});

if ($("playerForm")) {
  $("playerForm").addEventListener("submit", async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const file = form.photo.files[0];
    let photo = "";

    if (file) {
      if (file.size > 1500000) {
        showNotice("Photo must be smaller than 1.5 MB.");
        return;
      }

      photo = await new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    }

    data.players.push({
      id: newId(),
      name: form.name.value.trim(),
      position: form.position.value.trim(),
      photo,
      captain: false
    });

    save();
    form.reset();
    showNotice("Player added!");
  });
}

if ($("captainForm")) {
  $("captainForm").addEventListener("submit", event => {
    event.preventDefault();
    const player = data.players.find(p => p.id === event.currentTarget.player.value);
    if (!player) return showNotice("Choose a player first.");
    player.captain = true;
    save();
    showNotice("Captain added!");
  });
}

if ($("removeCaptainForm")) {
  $("removeCaptainForm").addEventListener("submit", event => {
    event.preventDefault();
    const player = data.players.find(p => p.id === event.currentTarget.player.value);
    if (!player) return showNotice("Choose a captain first.");
    player.captain = false;
    save();
    showNotice("Captain status removed.");
  });
}

if ($("removePlayerForm")) {
  $("removePlayerForm").addEventListener("submit", event => {
    event.preventDefault();
    const id = event.currentTarget.player.value;
    data.players = data.players.filter(p => p.id !== id);
    save();
    showNotice("Player removed.");
  });
}

if ($("matchForm")) {
  $("matchForm").addEventListener("submit", event => {
    event.preventDefault();
    const form = event.currentTarget;

    data.matches.push({
      id: newId(),
      team1: form.team1.value.trim(),
      team2: form.team2.value.trim(),
      time: form.time.value
    });

    save();
    form.reset();
    showNotice("Match added!");
  });
}

if ($("removeMatchForm")) {
  $("removeMatchForm").addEventListener("submit", event => {
    event.preventDefault();
    const id = event.currentTarget.match.value;
    data.matches = data.matches.filter(m => m.id !== id);
    save();
    showNotice("Match removed.");
  });
}

if ($("resultForm")) {
  $("resultForm").addEventListener("submit", event => {
    event.preventDefault();
    const form = event.currentTarget;

    data.results.push({
      id: newId(),
      team1: form.team1.value.trim(),
      team2: form.team2.value.trim(),
      score1: Number(form.score1.value),
      score2: Number(form.score2.value),
      time: form.time.value
    });

    save();
    form.reset();
    showNotice("Result saved!");
  });
}

render();
