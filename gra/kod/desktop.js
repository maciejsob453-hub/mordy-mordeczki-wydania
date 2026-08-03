/* Warstwa desktopowa — ładowana PO game.js i nietykająca żadnej mechaniki.
   Dokłada to, czego karta przeglądarki nie umiała: zapis do pliku, autozapis,
   wznawianie ostatniej gry, skróty klawiszowe i zoom.
   Wszystko rysuje poza #app, bo render() gry czyści #app przy każdym odświeżeniu. */
(function () {
"use strict";

const api = () => (window.pywebview && window.pywebview.api) || null;
const G = () => (window.__game ? window.__game.G : null);

/* Znaczki zasobów są opcjonalne. Dopóki grafik nie ma, panel ma wyglądać tak,
   jakby ich nigdy nie planowano, zamiast rozpychać się pustymi polami. */
(function sprawdzIkony() {
  const probka = new Image();
  probka.onerror = () => document.body.classList.add("bez-ikon");
  probka.src = "obrazki/ikona-kapital.png";
})();

/* ---------- pasek narzędzi + komunikaty ---------- */

const bar = document.createElement("div");
bar.id = "dtBar";
bar.innerHTML =
  '<button data-a="save" title="Zapisz do pliku (Ctrl+S)">Zapisz</button>' +
  '<button data-a="load" title="Wczytaj z pliku (Ctrl+O)">Wczytaj</button>' +
  '<span class="sep"></span>' +
  '<button data-a="zoomout" title="Pomniejsz (Ctrl+-)">−</button>' +
  '<button data-a="zoomin" title="Powiększ (Ctrl++)">+</button>' +
  '<button data-a="full" title="Pełny ekran (F11)">⛶</button>';
document.body.appendChild(bar);

const toastBox = document.createElement("div");
toastBox.id = "dtToast";
document.body.appendChild(toastBox);

function toast(msg, kind) {
  const t = document.createElement("div");
  t.className = "dtT" + (kind ? " " + kind : "");
  t.innerHTML = msg;
  toastBox.appendChild(t);
  setTimeout(() => t.classList.add("out"), 2600);
  setTimeout(() => t.remove(), 3100);
}

/* ---------- zapis i odczyt ---------- */

function code() {
  try {
    return G() ? window.__game.saveCode() : null;
  } catch (e) {
    return null;
  }
}

function apply(raw) {
  const c = String(raw || "").trim();
  if (!c) return toast("Pusty plik zapisu.", "bad");
  try {
    window.__game.loadCode(c);          // ta sama droga, co wklejenie kodu w grze
    window.render();
    toast("<b>Zapis wczytany.</b>");
  } catch (e) {
    toast("Nie udało się wczytać: " + e.message, "bad");
  }
}

async function saveToFile() {
  const c = code();
  if (!c) return toast("Nie ma czego zapisywać — gra jeszcze nie ruszyła.", "bad");
  const a = api();
  if (!a) return toast("Zapis do pliku działa tylko w aplikacji.", "bad");
  const name = await a.save_dialog(c, suggestedName());
  if (name) toast("Zapisane: <b>" + name + "</b>");
}

async function loadFromFile() {
  const a = api();
  if (!a) return toast("Wczytywanie z pliku działa tylko w aplikacji.", "bad");
  const raw = await a.open_dialog();
  if (raw !== null && raw !== undefined) apply(raw);
}

function suggestedName() {
  const g = G();
  if (!g) return "mordy-mordeczki";
  const p = (g.p && g.p[g.me] && g.p[g.me].ab) || "gra";
  return ("mordy-" + p + "-K" + g.term + "-T" + g.week).replace(/[^\w.-]/g, "_");
}

/* ---------- autozapis ---------- */

let dirty = false;
const origRender = window.render;
window.render = function () {
  dirty = true;                          // każdy przerysowany ekran to zmiana stanu
  return origRender.apply(this, arguments);
};

setInterval(() => {
  if (!dirty) return;
  const a = api(), c = code();
  if (!a || !c) return;
  dirty = false;
  const g = G();
  a.autosave(c, {
    party: (g.p && g.p[g.me] && g.p[g.me].n) || "",
    term: g.term,
    week: g.week,
  });
}, 20000);

/* ---------- status na Discordzie ---------- */

/* Discord przyjmuje jedną zmianę na 15 sekund, więc melduje się tu rzadziej
   niż przerysowuje ekran. Treść składamy z tego, co i tak widać na panelu. */
let ostatniStatus = "";

function statusGry() {
  const g = G();
  if (!g) return { opis: "W menu głównym", stan: "Wybiera partię" };

  const p = g.p[g.me];
  const ludzie = p.mem + " " + odmiana(p.mem, "osoba", "osoby", "osób");
  const mandaty = p.seats + " " + odmiana(p.seats, "mandat", "mandaty", "mandatów");

  // urzędy najpierw, bo to najciekawsze, co można o kimś powiedzieć
  const tytuly = [];
  if (g.gov && g.gov.pm === g.me && g.pmOk) tytuly.push("premier");
  if (g.prez && g.prez.party === g.me) tytuly.push("prezydent");
  if (g.sejmPrez && g.sejmPrez.marszalek === g.me) tytuly.push("marszałek");
  if (!tytuly.length) {
    tytuly.push(g.gov && g.gov.parties && g.gov.parties.includes(g.me) ? "koalicja" : "opozycja");
  }

  const sondaz = (typeof g.lastPoll === "number")
    ? ", sondaż " + g.lastPoll.toFixed(1).replace(".", ",") + "%" : "";

  const faza = g.phase === "finalcamp" ? "Finałowa kampania"
             : g.phase === "elect" ? "Dzień wyborów"
             : g.phase === "pmvote" ? "Sejm wybiera premiera"
             : g.phase === "prez" ? "Wybory prezydenckie"
             : "Kadencja " + g.term + ", tydzień " + g.week + "/" + g.weeks;

  return {
    opis: p.n + " · " + ludzie + ", " + mandaty,
    stan: faza + " · " + tytuly.join(" i ") + sondaz,
  };
}

function odmiana(n, a, b, c) {
  if (n === 1) return a;
  const d = n % 10, s = n % 100;
  return (d >= 2 && d <= 4 && (s < 10 || s >= 20)) ? b : c;
}

setInterval(() => {
  const a = api();
  if (!a || !a.discord) return;
  const s = statusGry();
  const podpis = s.opis + "|" + s.stan;
  if (podpis === ostatniStatus) return;     // bez zmian nie ma po co zawracać głowy
  ostatniStatus = podpis;
  try { a.discord(s.opis, s.stan); } catch (e) { /* status to dodatek */ }
}, 15000);

/* ---------- wznowienie ostatniej gry ---------- */

async function offerResume() {
  const a = api();
  if (!a || G()) return;
  const s = await a.autosave_read();
  if (!s || !s.code) return;

  const box = document.createElement("div");
  box.id = "dtResume";
  box.innerHTML =
    "<div><b>Ostatnia gra czeka</b><span>" +
    (s.party ? s.party + " · " : "") +
    "kadencja " + s.term + ", tydzień " + s.week +
    (s.when ? " · " + s.when : "") +
    "</span></div>" +
    '<button data-r="yes">Wznawiam</button>' +
    '<button data-r="no" class="ghost">Zaczynam od nowa</button>';
  document.body.appendChild(box);
  box.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.r === "yes") apply(s.code);
    box.remove();
  });
}

/* ---------- zoom ---------- */

let zoom = 1;
function setZoom(z) {
  zoom = Math.max(0.6, Math.min(1.8, z));
  document.body.style.zoom = zoom;
  const a = api();
  if (a) a.remember_zoom(zoom);
}

/* ---------- wejścia ---------- */

bar.addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  const act = b.dataset.a;
  if (act === "save") saveToFile();
  else if (act === "load") loadFromFile();
  else if (act === "zoomin") setZoom(zoom + 0.1);
  else if (act === "zoomout") setZoom(zoom - 0.1);
  else if (act === "full" && api()) api().toggle_fullscreen();
});

/* Gra ma własne skróty (initKeys), więc łapiemy tylko kombinacje z Ctrl
   i F11 — reszta klawiszy leci do gry nietknięta. */
window.addEventListener("keydown", (e) => {
  if (e.key === "F11") {
    e.preventDefault();
    if (api()) api().toggle_fullscreen();
    return;
  }
  if (!e.ctrlKey || e.altKey) return;
  const k = e.key.toLowerCase();
  if (k === "s") { e.preventDefault(); saveToFile(); }
  else if (k === "o") { e.preventDefault(); loadFromFile(); }
  else if (k === "+" || k === "=") { e.preventDefault(); setZoom(zoom + 0.1); }
  else if (k === "-") { e.preventDefault(); setZoom(zoom - 0.1); }
  else if (k === "0") { e.preventDefault(); setZoom(1); }
}, true);

/* pywebview zgłasza gotowość mostu do Pythona osobnym zdarzeniem */
window.addEventListener("pywebviewready", async () => {
  const a = api();
  if (a) {
    const z = await a.remembered_zoom();
    if (z && z !== 1) setZoom(z);
    // przy grze ze źródeł kod ma numer z ostatniego wydania — bierzemy prawdziwy
    try {
      const v = await a.wersja();
      if (v && window.__game && window.__game.ustawWersje(v) && window.render) window.render();
    } catch (e) { /* w wydaniu numer jest już wpisany na stałe */ }
  }
  offerResume();
});

})();
