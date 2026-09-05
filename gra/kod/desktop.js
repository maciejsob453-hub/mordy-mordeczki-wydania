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
  '<button data-a="sloty" title="Zapisy (Ctrl+Z)">Zapisy</button>' +
  '<button data-a="save" title="Zapisz do pliku (Ctrl+S)">Do pliku</button>' +
  '<button data-a="load" title="Wczytaj z pliku (Ctrl+O)">Z pliku</button>' +
  '<span class="sep"></span>' +
  '<button data-a="zoomout" title="Pomniejsz (Ctrl+-)">−</button>' +
  '<button data-a="zoomreset" class="zoomvalue" title="Automatyczne dopasowanie / reset (Ctrl+0)">100%</button>' +
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

/* ---------- zapisy w slotach ---------- */

/* Opis, po którym gracz pozna zapis na liście: kto, kiedy i jak mu idzie. */
function opisStanu() {
  const g = G();
  if (!g) return {};
  const p = g.p[g.me] || {};
  return {
    party: p.ab || "", partyName: p.n || "",
    lead: (window.__game.leads ? window.__game.leads(p).join(" / ") : p.lead) || "",
    term: g.term, week: g.week, seats: p.seats || 0, mem: p.mem || 0,
  };
}

async function otworzSloty() {
  const a = api();
  if (!a) return toast("Zapisy w slotach działają tylko w aplikacji.", "bad");
  const sloty = await a.sloty();
  const graTrwa = !!G();

  const stare = document.getElementById("dtSloty");
  if (stare) stare.remove();

  const box = document.createElement("div");
  box.id = "dtSloty";
  box.innerHTML =
    '<div class="dtsOkno">' +
    '<button class="dtsX" title="Zamknij">×</button>' +
    '<div class="dtsH"><span>Zapisy gry</span><h2>Twoje rozgrywki</h2></div>' +
    '<div class="dtsLista">' +
    sloty.map((s) => {
      if (s.pusty) {
        return '<div class="dtsSlot pusty" data-nr="' + s.nr + '">' +
          '<div class="dtsNr">' + s.nr + "</div>" +
          '<div class="dtsOpis"><b>Wolne miejsce</b><span>' +
          (graTrwa ? "Kliknij, żeby zapisać tu grę" : "Nic tu jeszcze nie ma") + "</span></div>" +
          (graTrwa ? '<button class="dtsBtn" data-akcja="zapisz" data-nr="' + s.nr + '">Zapisz</button>' : "") +
          "</div>";
      }
      return '<div class="dtsSlot" data-nr="' + s.nr + '">' +
        '<div class="dtsNr">' + s.nr + "</div>" +
        '<div class="dtsOpis"><b>' + (s.partyName || s.party) + "</b>" +
        "<span>" + s.lead + " · kadencja " + s.term + ", tydzień " + s.week +
        " · " + s.seats + " mand. · " + s.mem + " osób</span>" +
        '<em>' + s.when + "</em></div>" +
        '<div class="dtsAkcje">' +
        '<button class="dtsBtn" data-akcja="wczytaj" data-nr="' + s.nr + '">Wczytaj</button>' +
        (graTrwa ? '<button class="dtsBtn g" data-akcja="zapisz" data-nr="' + s.nr + '">Nadpisz</button>' : "") +
        '<button class="dtsBtn x" data-akcja="usun" data-nr="' + s.nr + '">Usuń</button>' +
        "</div></div>";
    }).join("") +
    "</div>" +
    '<div class="dtsStopka">Autozapis chodzi osobno, co 20 sekund, i nie zajmuje żadnego z tych miejsc.</div>' +
    "</div>";
  document.body.appendChild(box);

  const zamknij = () => box.remove();
  box.querySelector(".dtsX").onclick = zamknij;
  box.onclick = (e) => { if (e.target === box) zamknij(); };

  box.querySelectorAll("[data-akcja]").forEach((b) => {
    b.onclick = async (e) => {
      e.stopPropagation();
      const nr = +b.dataset.nr, akcja = b.dataset.akcja;
      if (akcja === "zapisz") {
        const c = code();
        if (!c) return toast("Nie ma czego zapisywać — gra jeszcze nie ruszyła.", "bad");
        await a.slot_zapisz(nr, c, opisStanu());
        toast("<b>Zapisano</b> w miejscu " + nr + ".");
        zamknij(); otworzSloty();
      } else if (akcja === "wczytaj") {
        const c = await a.slot_wczytaj(nr);
        if (!c) return toast("To miejsce jest puste.", "bad");
        zamknij(); apply(c);
      } else if (akcja === "usun") {
        await a.slot_usun(nr);
        toast("Miejsce " + nr + " wyczyszczone.");
        zamknij(); otworzSloty();
      }
    };
  });
  // kliknięcie w puste miejsce zapisuje bez celowania w mały przycisk
  box.querySelectorAll(".dtsSlot.pusty").forEach((s) => {
    s.onclick = () => { const b = s.querySelector('[data-akcja="zapisz"]'); if (b) b.click(); };
  });
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
  const result = origRender.apply(this, arguments);
  void wyslijStatus();
  return result;
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

/* Treść pochodzi ze stanu gry; transport w Pythonie ogranicza częstotliwość
   i ponawia połączenie, gdy Discord zostanie uruchomiony później. */
let ostatniStatus = "";
let statusWTrakcie = false;

function statusGry() {
  const g = G();
  const p = g && g.p && g.p[g.me];
  if (!p) return { opis: "Mordy Mordeczki I · Sejm", stan: "Menu główne · Wybiera partię" };

  const seats = Number.isFinite(p.seats) ? p.seats : 0;
  const mandaty = seats + " " + odmiana(seats, "mandat", "mandaty", "mandatów");
  const tytuly = [];
  if (g.gov && g.gov.pm === g.me && g.pmOk) tytuly.push("premier");
  if (g.prez && g.prez.party === g.me) tytuly.push("prezydent");
  if (g.sejmPrez && g.sejmPrez.marszalek === g.me) tytuly.push("marszałek");
  if (!tytuly.length) {
    tytuly.push(g.gov && Array.isArray(g.gov.parties) && g.gov.parties.includes(g.me) ? "koalicja" : "opozycja");
  }

  const sondaz = Number.isFinite(g.lastPoll)
    ? ", sondaż " + g.lastPoll.toFixed(1).replace(".", ",") + "%" : "";
  const fazy = {
    finalcamp: "Finałowa kampania", elect: "Dzień wyborów",
    result: "Wyniki wyborów", pmvote: "Sejm wybiera premiera",
    marszalek: "Sejm wybiera marszałka", prez: "Wybory prezydenckie",
    dead: "Koniec rozgrywki",
  };
  const faza = fazy[g.phase] || "Kadencja " + g.term + ", tydzień " + g.week + "/" + g.weeks;
  return {
    opis: "Mordy Mordeczki I · " + (p.ab || p.n || "Partia") + " · " + mandaty,
    stan: faza + (g.phase === "dead" ? "" : " · " + tytuly.join(" i ") + sondaz),
  };
}

function odmiana(n, a, b, c) {
  if (n === 1) return a;
  const d = n % 10, s = n % 100;
  return (d >= 2 && d <= 4 && (s < 10 || s >= 20)) ? b : c;
}

async function wyslijStatus() {
  if (statusWTrakcie) return false;
  const a = api();
  if (!a || typeof a.discord !== "function") return false;
  const s = statusGry();
  const podpis = JSON.stringify(s);
  if (podpis === ostatniStatus) return true;
  statusWTrakcie = true;
  try {
    // Most zwraca Promise. Zapamiętujemy dopiero przyjęcie do kolejki,
    // a odrzucony Promise nie blokuje następnej próby ani gry.
    const przyjeto = await a.discord(s.opis, s.stan);
    if (przyjeto === true) ostatniStatus = podpis;
    return przyjeto === true;
  } catch (e) {
    return false;
  } finally {
    statusWTrakcie = false;
  }
}

window.MM1Presence = Object.freeze({ snapshot: statusGry, refresh: wyslijStatus });
window.addEventListener("pywebviewready", () => { void wyslijStatus(); });
setInterval(() => { void wyslijStatus(); }, 15000);
void wyslijStatus();

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
const zoomLabel = () => bar.querySelector('.zoomvalue');
function autoZoom() {
  /* Gra jest składana ze stałych wymiarów, więc małe ekrany dostają rozsądny
     punkt startowy zamiast osobnego, połamanego układu. Gracz nadal może go
     zmienić co 5%, a duży monitor zostaje przy pełnej skali. */
  const w = window.innerWidth || 1920;
  return w < 1180 ? .72 : w < 1380 ? .80 : w < 1580 ? .88 : w < 1780 ? .94 : 1;
}
function setZoom(z, zapisz) {
  zoom = Math.round(Math.max(0.7, Math.min(1.3, z)) * 20) / 20;
  document.body.style.zoom = zoom;
  const l=zoomLabel();if(l)l.textContent=Math.round(zoom*100)+'%';
  const a = api();
  if (a && zapisz !== false) a.remember_zoom(zoom);
}

/* ---------- wejścia ---------- */

bar.addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  const act = b.dataset.a;
  if (act === "sloty") otworzSloty();
  else if (act === "save") saveToFile();
  else if (act === "load") loadFromFile();
  else if (act === "zoomin") setZoom(zoom + 0.05);
  else if (act === "zoomout") setZoom(zoom - 0.05);
  else if (act === "zoomreset") setZoom(autoZoom());
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
  else if (k === "z") { e.preventDefault(); otworzSloty(); }
  else if (k === "+" || k === "=") { e.preventDefault(); setZoom(zoom + 0.05); }
  else if (k === "-") { e.preventDefault(); setZoom(zoom - 0.05); }
  else if (k === "0") { e.preventDefault(); setZoom(autoZoom()); }
}, true);

/* pywebview zgłasza gotowość mostu do Pythona osobnym zdarzeniem */
window.addEventListener("pywebviewready", async () => {
  const a = api();
  if (a) {
    const z = await a.remembered_zoom();
    setZoom(z || autoZoom(), false);
    // przy grze ze źródeł kod ma numer z ostatniego wydania — bierzemy prawdziwy
    try {
      const v = await a.wersja();
      if (v && window.__game && window.__game.ustawWersje(v) && window.render) window.render();
    } catch (e) { /* w wydaniu numer jest już wpisany na stałe */ }
  }
  offerResume();
});

/* W zwykłej przeglądarce nie ma zdarzenia pywebviewready. Pasek nadal pokazuje
   prawdziwą skalę, co pozwala testować widok bez aplikacji. */
if (!api()) setZoom(autoZoom(), false);

})();
