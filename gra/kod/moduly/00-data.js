'use strict';
/* ═══════════════════════════════════════════════════════════
   MORDY MORDECZKI — SEJM
   Roleplay polityczny na serwerze Mordy Mordeczki.

   Autorzy: Maciek i Balon
   ═══════════════════════════════════════════════════════════ */
"use strict";
const LOGOS = {"PKR": "obrazki/2d4de0deb7c1.webp", "WP": "obrazki/10efbd4fb21b.webp", "LSD": "obrazki/62ff16ae5515.webp", "KAN": "obrazki/28efd8279222.svg", "HAND": "obrazki/f3c9da594c00.svg", "POST": "obrazki/adb43c8743c7.webp", "LIB": "obrazki/5609cc4b3929.webp", "ALT": "obrazki/1fb954d6dd7c.webp", "ADS": "obrazki/a5665e494ecf.webp", "HMO": "obrazki/3da3c7510fc8.webp", "SS": "obrazki/5ed581dc6fb1.webp", "REP": "obrazki/a56a5574593a.webp", "PD": "obrazki/505b87671205.webp", "PPP": "obrazki/9a313b752b8b.webp", "ZHM": "obrazki/07520c9d52a7.webp", "NP": "obrazki/686628e32c75.webp", "ROM": "obrazki/f72e203052b7.webp", "NBR": "obrazki/20c8f32ecec2.webp", "FD": "obrazki/1f63df863e7f.webp", "KK": "obrazki/40064ea5d3ff.webp", "PKD": "obrazki/174141e9bca2.webp", "PLR": "obrazki/logo-concordia.png", "ChPC": "obrazki/4c15d82ceb7d.webp", "DPD": "obrazki/04774de77d36.webp", "POJ": "obrazki/31bfab4a1110.webp", "PP": "obrazki/720fb5e0b9e2.webp", "P1612": "obrazki/logo-p1612.png", "CEN": "obrazki/logo-centrum.webp", "HEG": "obrazki/logo-hegemon.webp", "SWIA": "obrazki/logo-swiadek.svg", "KAZIK": "obrazki/ava-kaziu-prime.webp"};

/* ══════════ POKRĘTŁA TRUDNOŚCI ══════════
   Wszystko, czym realnie stroi się grę, siedzi tutaj. Wcześniej te liczby były
   rozsypane po całym pliku i podkręcenie trudności wymagało polowania po kodzie.
   Każda pozycja ma opisane, co się stanie, gdy ją ruszysz. */
const BAL={
  // ile obecności w kanale zostaje z tygodnia na tydzień (mniej = trzeba częściej wracać)
  /* Obecność zanika w każdym z ośmiu okręgów naraz, a odbudować da się ją jedną
     decyzją kampanijną tygodniowo (kategoria ma limit). Przy 0,906 dawało to
     twardy sufit w okolicach 25/100 — nie dało się zbudować obecności, choćby
     grać co tydzień. Wolniejszy zanik podnosi ten sufit, nie znosząc go. */
  zanikObecnosci:      .935,
  zanikObecnosciKanal: .955,   // partia z celem „Kanał w końcu żyje”
  zanikObecnosciRob:   .949,   // Partia Kolektywnych Robotników

  // powtarzanie tej samej decyzji: ile traci za każde użycie i gdzie jest dno
  zmeczenieKrok:       .21,
  zmeczenieDno:        .26,

  // odejścia z partii: baza, wpływ jedności i progi wielkości
  odejsciaBaza:        .22,
  odejsciaJednosc:     240,    // większy dzielnik = jedność słabiej chroni
  odejsciaDuza:        .09,    // powyżej 44 osób
  odejsciaOlbrzym:     .09,    // powyżej 70
  odejsciaKolos:       .11,    // powyżej 100

  // zmęczenie władzą: liczą się najwyższe urzędy, nie samo siedzenie w koalicji
  znuzeniePremier:     21,
  znuzeniePrezydent:   14,
  znuzenieOpozycja:   -15,
  znuzenieSufit:       72,
  znuzenieSilaSondaz:  290,    // mniejszy dzielnik = mocniej bije po sondażu
  znuzenieSilaTwardy:  165,
  // ile z pełnej dawki liczy się w pierwszej, drugiej, trzeciej… kadencji u władzy
  znuzenieNarost:      [.45,.75,1,1.2,1.35],

  // ile wyniku bierze się ze składu partii, a ile z kampanii, obecności i sławy
  udzialTwardego:      .62,    // niżej = skład mniej decyduje, gra mniej o rekrutację
  // nawet twardy elektorat trzeba zmobilizować: ile daje sama liczba ludzi, a ile aktywność
  twardyAktywnosc:     .62,
  twardyAktywnoscDziel: 145,
  wykladnikSkladu:     .78,    // niżej = malejące zwroty z wielkości są ostrzejsze

  // jak mocno jedność przekłada się na wynik wyborczy
  jednoscBaza:         .64,    // wyżej = kiepska jedność mniej boli
  jednoscDzielnik:     175,    // wyżej = wysoka jedność mniej daje

  // przewaga urzędu — im wyżej, tym mocniejsza spirala zwycięzcy
  premierGlosy:        1.12,
  prezydentGlosy:      1.08,
  koalicjaGlosy:       1.04,
  premierSondaz:       1.22,
  prezydentSondaz:     1.12,

  // doganianie: ile poparcia dostaje partia wyraźnie mniejsza od czołówki
  doganianieSila:      .42,
  // duży zasięg daje więcej, ale nie liniowo; inaczej jedna partia zjada cały sondaż
  pullWykladnik:       .62,

  // energia: ile jej wraca co tydzień i jak drogie są decyzje
  energiaBaza:         2.0,
  energiaMnoznik:      .96,
  /* Dobę liczymy wewnątrz tygodnia. To nie kasuje limitu akcji — pokazuje
     tylko, że wiec, ustawa i zwykły post nie zajmują tyle samo czasu. */
  dniTygodnia:         7,
  godzinTygodnia:      168,
  czasAkcjiMin:        1,
  czasAkcjiMax:        6,

  // ile ludzi co kadencj\u0119 sypi\u0105 ustawy: autorowi, a ile reszcie sceny
  // głosowanie nad ustawą: od czego zależy, czy poseł podniesie rękę
  ustawaBaza:          .17,   // wyjściowa przychylność kogokolwiek
  ustawaKoalicja:      .44,   // ile dokłada bycie w rządzie wnioskodawcy
  ustawaOpozycja:      .20,   // ile odejmuje siedzenie po drugiej stronie
  ustawaOpor:          .78,   // jak mocno przeszkadza radykalność projektu

  ustawyPremier:       2.15,
  ustawyAutor:         .5,
  ustawyReszta:        .7,
};

/* Losowość ma pamiętać stan razem z zapisem. Bez tego nie da się odtworzyć
   błędu ani sprawdzić, czy AI naprawdę podjęło inną decyzję po poprawce. */
let RNG_STATE=0x6d2b79f5;
function rngSeed(seed){
  const n=Number(seed);
  RNG_STATE=(Number.isFinite(n)?Math.floor(n):0x6d2b79f5)>>>0;
  if(!RNG_STATE)RNG_STATE=0x6d2b79f5;
}
function rnd(){
  RNG_STATE=(Math.imul(RNG_STATE,1664525)+1013904223)>>>0;
  if(G&&typeof G==='object')G.rng=RNG_STATE;
  return RNG_STATE/4294967296;
}
const R=(a,b)=>a+rnd()*(b-a), RI=(a,b)=>Math.floor(R(a,b+1));
const cl=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));
const ch=p=>rnd()<p, pick=a=>a.length?a[Math.floor(rnd()*a.length)]:undefined;
const fmt=n=>n.toFixed(1).replace('.',',');
const pl=(n,a,b,c)=>n===1?a:(n%10>=2&&n%10<=4&&(n%100<10||n%100>=20)?b:c);
const esc=s=>String(s).replace(/'/g,"\\'");

/* ══════════ LIDERZY ══════════ */
/* [charyzma, kompetencja, wytrzymałość, autorytet] */
const AVA={"Prawe Jąderko": "obrazki/32a907831366.webp", "Vengeance": "obrazki/d9c43f30a1fa.webp", "Korzeń": "obrazki/edd614e44a4d.webp", "Maciej Starszy": "obrazki/7f677d35a527.webp", "bizantyjczyk": "obrazki/3f26e28825a4.webp", "Jangcy": "obrazki/3c5f99631754.webp", "Zomowiec z Sejmu": "obrazki/5a6024fdfbc7.webp", "Wojtaszko": "obrazki/463d9208b9dd.webp", "Pan Hod_Dog": "obrazki/16ca0d3b9eeb.webp", "Plawik": "obrazki/35a4cee441f9.webp", "Lager": "obrazki/5e6a47f7a1eb.webp", "Peterdeus": "obrazki/c23e96e64f3b.webp", "Sulejman": "obrazki/986e02aca71d.webp", "Aryati": "obrazki/947b2f454432.webp", "kisielek48": "obrazki/3d3332854d5f.webp", "Bartek": "obrazki/989b5176e4a1.webp", "cargrzybov": "obrazki/30bcedf79997.webp", "Fazmiś": "obrazki/0e9071fc2092.webp", "impir": "obrazki/135df09bc351.webp", "inwid": "obrazki/7b152588238a.webp", "Maciek": "obrazki/4aa32504feb8.webp", "Kromka": "obrazki/9d211aac5435.webp", "Tortex": "obrazki/53820c7b8559.webp", "Kaziu": "obrazki/8220da0fe301.webp", "its.r3dz0l.eq": "obrazki/b9fb8b09ea87.webp", "kenzo": "obrazki/eb1ee0a9978d.webp", "bluetes33": "obrazki/f450efa7026d.webp", "Kocur": "obrazki/ea8295d6fab4.webp", "Gustaw": "obrazki/2a9007517459.webp", "Antoniopl": "obrazki/1189f2a85ea3.webp", "warrior": "obrazki/2f39d1ecb2de.webp", "alan": "obrazki/da625bd66599.webp", "Śledzik": "obrazki/65e60b12b9fe.webp", "Serty": "obrazki/ff0950f99292.webp", "Heraquik": "obrazki/67887df61b8e.webp", "balon": "obrazki/e7cc40af1a7a.webp", "Wiktor z Aeterny": "obrazki/d2ed03874247.webp", "Góra": "obrazki/4205cad83b6b.webp", "Klabar": "obrazki/b536642cd5eb.webp", "Bober": "obrazki/83dd46efd068.webp", "Oli": "obrazki/7a685e2ac353.webp", "loof": "obrazki/3f7e866b3355.webp", "Mnem": "obrazki/e452af74ed4c.webp", "Mietek Nocul": "obrazki/89ee38f6ab26.webp", "Prjonnek": "obrazki/cfd70f7b77a6.webp", "Jugen": "obrazki/9e01fd9dbb40.webp", "mentos": "obrazki/d99a6ee7b318.webp", "ekologiaball": "obrazki/ad479906048d.webp", "Franzon": "obrazki/a4d97f94288d.webp", "Prewencjusz": "obrazki/2edc2ee02c95.webp", "Włóczykij": "obrazki/721a1f244511.webp", "Rax": "obrazki/7b7c4f192e6f.webp", "Supernes": "obrazki/eea9db03ef6b.webp", "Sirius": "obrazki/bc8735f17d51.webp", "x_avi": "obrazki/89c9588432e9.webp", "Garibaldi": "obrazki/b3d16b3de0ab.webp", "Silesia": "obrazki/ca0230b99bb6.webp", "Animu Player": "obrazki/9c0a033d5ceb.webp", "Mordeczka": "obrazki/0051a52917ef.webp","Delex":"obrazki/40c5466af2f5.png","Pablo":"obrazki/b6a728b14b8b.png","Europejczyk":"obrazki/ava-europejczyk.png","Eniki":"obrazki/ava-eniki.png","Ponczus":"obrazki/ava-ponczus.png","ke_Trab":"obrazki/ava-ke-trab.png","Miazga":"obrazki/ava-miazga.png","Tako":"obrazki/ava-tako.webp"};
const TRAITS=[
 {id:'mowca',n:'Mówca',cost:68,d:'Wiece i orędzia dają o 35% więcej sławy.'},
 {id:'negocjator',n:'Negocjator',cost:78,excl:['showman'],d:'+10 do skłonności partii w negocjacjach koalicyjnych, rozmowy kuluarowe o połowę skuteczniejsze.'},
 {id:'twardziel',n:'Twardziel',cost:60,d:'Wszystkie decyzje kosztują o 25% mniej energii.'},
 {id:'showman',n:'Showman',cost:55,excl:['technokrata','negocjator'],d:'Brudne zagrywki dają o 40% więcej sławy, a ich ryzyko spada o 8 punktów.'},
 {id:'technokrata',n:'Technokrata',cost:62,excl:['showman'],d:'Wiarygodność rośnie o 0,8 tygodniowo, ryzyko gafy o połowę mniejsze.'},
 {id:'sieciowiec',n:'Sieciowiec',cost:68,excl:['elitarysta'],d:'Nabór może przynieść trzecią osobę, odnowienie skrócone do dwóch tygodni.'},
 {id:'populista',n:'Populista',cost:55,excl:['elitarysta'],d:'Kontrowersja od serwerowiczów o połowę mniejsza.'},
 {id:'elitarysta',n:'Elitarysta',cost:55,excl:['populista','sieciowiec'],d:'Bezpieczny próg elity rośnie z 30% do 42% składu.'},
 {id:'strateg',n:'Strateg',cost:72,d:'Każda decyzja kosztuje o 18% mniej kapitału. Ktoś w końcu liczy te pieniądze.'},
 {id:'meczennik',n:'Męczennik',cost:48,d:'Porażki i przegrane głosowania niemal nie zbijają momentum.'},
];
const traitsOf=who=>{if(!G)return [];if(!G.ptraits)G.ptraits={};const w=who||(G.p&&G.p[G.me]&&G.p[G.me].lead);return (w&&G.ptraits[w])||[]};
/* Cecha działa, gdy ma ją ktokolwiek przy sterze — kupuje się ją osobno dla każdej
   osoby i osobno za nią płaci, więc dwóch przewodniczących to podwójny koszt,
   a nie darmowy bonus. */
const hasT=n=>{if(!G||!G.p||!G.p[G.me])return false;
  return leads(G.p[G.me]).some(w=>traitsOf(w).indexOf(n)>=0)};
/* Kogo rozwijamy w zakładce Lider. Przy jednym przewodniczącym to zawsze on. */
function leadWybrany(){
  const p=G&&G.p&&G.p[G.me];if(!p)return null;
  const ls=leads(p);
  return (G.leadSel&&ls.includes(G.leadSel))?G.leadSel:p.lead;
}
function setLeadSel(n){G.leadSel=n;render()}
/* wrodzone, przypisane do osoby, nie do partii; wracają razem z nią */
const INNATE={
 'Maciek':{n:'Tłuszczolt',c:'#b8683a',
   d:'Kontrowersja +2,8 i pretensjonalność +2,2 tygodniowo — Maciek nie umie przejść obok żadnej awantury. Za to Król Mordeczka trzyma z nim jak równy z równym: przychylność dworu +14.'},
 'Lager':{n:'Odpisze jutro',c:'#c98a3a',
   d:'Aktywność partii spada o 2,4 tygodniowo, cokolwiek zrobisz. Dopóki Lager przewodzi, PPP się nie rusza.'},
 'loof':{n:'Zawsze ma rację i zawsze to powie',c:'#5a8bb0',
   d:'Wiarygodność +1,5 i jedność +1,2 tygodniowo, w debatach +20 do wyniku, ale kontrowersja rośnie o 2,6 tygodniowo.'},
 'Peterdeus':{n:'Widmo z 2024 roku',c:'#75695b',
   d:'Aktywność −1,9 i jedność −1,4 tygodniowo. Kongres cichnie razem z nim.'},
 'Fazmiś':{n:'Zaraz wam wszystko wytłumaczę',c:'#7aa35e',
   d:'Sława +1,6 i aktywność +3,4 tygodniowo, ale wiarygodność spada o 1,8, młodemu nikt nie wierzy.'},
 'Śledzik':{n:'Król mnie lubi',c:'#d1a13a',
   d:'Jedność +2,2 i sława +3,4 tygodniowo, Król załatwia, co trzeba. Ale w debatach masz −14 do wyniku, a partie o 12 mniej chętnie wchodzą z tobą w koalicje: skoro Król i tak wszystko ustawi, po co się starać.'},
 'Mietek Nocul':{n:'Nikt go nie nienawidzi',c:'#7aa35e',
   d:'Kontrowersja spada o 1,8 tygodniowo, rozmowy kuluarowe i przeprosiny działają o 45% mocniej, a partie wchodzą z tobą w koalicję przy relacji o 14 niższej. Nic poza tym, i to wystarcza.'},
 'Sulejman':{n:'Sułtan małych ludów',c:'#7b2fbe',
   d:'Jedność +2,4 tygodniowo, a partie małe i niszowe wchodzą w koalicję przy relacji o 20 niższej. Za to z dużymi graczami rozmawia się o 12 trudniej, a kontrowersja rośnie o 1,4 tygodniowo, nie każdemu odpowiada ten styl.'},
 'kenzo':{n:'Widzi wszystko, nie mówi nic',c:'#5a8bb0',
   d:'Aktywność +2,6 i wiarygodność +1,6 tygodniowo, widzi wszystko i wszystko ogarnia. Ale rozmowy kuluarowe i przeprosiny działają o 60% słabiej, a partie wchodzą w koalicję dopiero przy relacji o 18 wyższej. Z nim na czele PPP nie dogada się z nikim.'},
 'Bartek':{n:'Twarz z każdego mema',c:'#b9a24b',
   d:'Charyzma rośnie o 1,1 tygodniowo aż do 99, ale wiarygodność spada o 2,8, a aktywność o 1,6. Dyplomacja dostaje ledwie zauważalny bonus +4. Memiarzowi nikt nie wierzy, za to wszyscy go znają.'},
 'Kaziu':{n:'Ktoś to musiał wziąć',c:'#c04a3e',
   d:'Wiarygodność −2,2 i aktywność −2,6 tygodniowo, a koalicjanci chcą o 16 wyższej relacji. Tragedia na każdym froncie, trzymaj go z dala od przewodnictwa.'},
 /* Nagroda za cel „Kazikmistrz”: ta sama osoba, tylko że nagle wszystko jej wychodzi.
    Wchodzi w miejsce cechy wyżej, gdy cel zostanie ukończony — patrz inn() i innAll(). */
 'Kaziu*':{n:'Stare dobre lata',c:'#d9ab45',
   d:'Wiarygodność +1,6 i jedność +1,4 tygodniowo, a koalicjanci schodzą z wymaganiami o 14. Kaziu wrócił do formy, o której wszyscy mówili, że nigdy jej nie miał.'},
 'Supernes':{n:'Rule Britannia, Britannia rules the party',c:'#3b6fb5',
   d:'Sława +3,4 i aktywność +3,8 tygodniowo, imperium samo się nie ogłosi. Ale wiarygodność zatrzymuje się na 40 i wyżej nie idzie, a partie chcą o 16 wyższej relacji: widać, że prowadzenie partii go męczy.'},
 'Aryati':{n:'Gryzońska wieczność',c:'#9b7fb8',
   d:'Aktywność +4,2 tygodniowo i +12 w debatach, lecz każda wygrana debata podbija kontrowersję o 7 i pretensjonalność o 5.'},
 'Vengeance':{n:'Człowiek Piła',c:'#c0392b',
   d:'Pretensjonalność +1,6 i sława +1,8 tygodniowo, bo lider napierdala po japońsku i nikt nie wie o co chodzi, ale wszyscy słuchają. Autorytet rośnie o 2 z każdą kadencją i zatrzymuje się na 82 — wyjdzie z tego ta postać, tylko powoli.'},
 'Mnem':{n:'Jam jest młody i młodością was zabije',c:'#e0b23c',
   d:'Sława +3,2 tygodniowo, a Król patrzy na niego przychylniej niż na innych (+10 do przychylności). Ale wiarygodność spada o 2,4 tygodniowo, a pretensjonalność rośnie o 2. Młodość imponuje, dopóki ktoś nie zapyta o konkrety.'},
};
const goalDone=id=>!!(G&&G.goals&&G.goals[id]);
const MEMENTO={n:'Memento potęgi demokratów',c:'#7aa842',
 d:'+12 do skłonności partii w negocjacjach koalicyjnych, a decyzje kampanii działają o 25% mocniej. Stary Front pamięta, jak się wygrywało.'};
const inn=k=>(G.p[k].lead==='loof'&&goalDone('demokraci'))?MEMENTO
  :(G.p[k].lead==='Kaziu'&&goalDone('kazik'))?INNATE['Kaziu*']:(INNATE[G.p[k].lead]||null);
const LEAD={
 'Lager':[44,36,30,38], 'kenzo':[64,58,62,55], 'bluetes33':[55,66,54,62],
 'Kocur':[42,38,48,36], 'Gustaw':[50,70,56,64], 'Antoniopl':[48,36,44,40],
 'x_avi':[52,40,46,44], 'Garibaldi':[46,50,48,50], 'Pablo':[54,48,52,46],
 'Peterdeus':[58,72,36,52], 'warrior':[68,50,70,58], 'alan':[38,50,46,48],
 'Śledzik':[70,60,64,62], 'Serty':[40,48,52,42], 'Animu Player':[46,42,52,38],
 'loof':[60,82,66,70], 'Heraquik':[74,74,70,68], 'balon':[64,60,64,58], 'Mnem':[66,70,62,64], 'Vengeance':[66,64,60,63], 'Plawik':[92,76,58,70], 'Mietek Nocul':[72,56,66,58],
 'Wiktor z Aeterny':[52,48,40,44], 'Góra':[56,72,60,66], 'Klabar':[62,58,72,54],
 'Bober':[68,52,66,50], 'Oli':[42,50,42,46],
 'Sulejman':[68,58,62,56], 'Aryati':[60,68,58,66], 'Prjonnek':[44,46,48,42],
 'kisielek48':[62,72,68,70], 'Jugen':[66,64,62,60], 'mentos':[42,40,54,38], 'ekologiaball':[50,36,42,44],
 'Franzon':[46,48,44,44], 'Prewencjusz':[58,74,64,66], 'Silesia':[44,52,44,46],
 'Bartek':[72,32,58,50], 'Ignacy':[26,22,30,24],
 'cargrzybov':[40,44,14,26],
 'Fazmiś':[64,62,70,64], 'Włóczykij':[58,68,64,62], 'Rax':[68,56,66,56],
 'impir':[56,52,58,54], 'inwid':[50,60,54,58],
 'Maciek':[76,18,44,62],
 'Korzeń':[44,38,42,40], 'Jangcy':[42,40,44,38], 'Zomowiec z Sejmu':[48,36,52,42],
 'Wojtaszko':[62,70,58,66], 'Pan Hod_Dog':[68,62,60,60], 'Prawe Jąderko':[42,32,46,36],
 'Maciej Starszy':[98,78,70,82], 'bizantyjczyk':[95,74,72,76], 'Supernes':[80,70,60,58],
 'Kromka':[52,58,56,66],
 'Tortex':[50,66,60,62], 'Kaziu':[54,62,58,60], 'Sirius':[46,46,46,42],
 'its.r3dz0l.eq':[44,50,48,70],
 'Miazga':[46,42,50,44], 'Delex':[82,40,38,36],
 'Europejczyk':[58,64,52,62], 'Eniki':[64,44,58,46], 'Ponczus':[50,48,62,44],
 'Tako':[46,74,58,52],   // intelektualista: głowa tak, estrada nie
 'ke_Trab':[60,74,56,64],
};
const AGENTS=[
 {n:'Korzeń',           seg:'ser',kp:18,d:'Siedzi na kanale od zawsze, nie napisał nic, co ktoś by zapamiętał. Ale jest.'},
 {n:'Maciej Starszy',   seg:'eli',kp:88,d:'Stary wyjadacz z czasów, o których nikt już nie pamięta. Waży w każdej rozmowie.'},
 {n:'bizantyjczyk',     seg:'eli',kp:88,d:'Cichy, uprzejmy i wszędzie ma znajomych. Elita w najczystszej postaci.'},
 {n:'Jangcy',           seg:'ser',kp:18,d:'Wpada na eventy, znika na dwa tygodnie, wraca jakby nigdy nic.'},
 {n:'Zomowiec z Sejmu', seg:'ser',kp:20,d:'Pilnuje porządku na kanałach z zapałem, którego nikt go nie prosił.'},
 {n:'Wojtaszko',        seg:'int',kp:54,d:'Czyta statuty dla przyjemności i potrafi z tego zrobić notatkę na trzy strony.'},
 {n:'Pan Hod_Dog',      seg:'int',kp:54,d:'Pisze długie posty, które ludzie faktycznie czytają do końca. Rzadka umiejętność.'},
 {n:'Prawe Jąderko',    seg:'ser',kp:20,d:'Nick z dna internetu i awatar z anime. Wpada, coś napisze, znika. Ale jest.'},
 {n:'Miazga',           seg:'ser',kp:20,d:'Nikt nie wie, czym się zajmuje poza serwerem, ale zawsze ma plan i nigdy się nie tłumaczy.'},
 {n:'Delex',            seg:'ser',kp:24,d:'Pisze mało, ale jak już coś powie, cały czat na chwilę zamiera. Charyzma nie z tej ligi jak na serwerowicza.'},
 {n:'Europejczyk',      seg:'ser',kp:22,d:'Mówi o serwerze tak, jakby to była izba wyższa, i nikt nie ma odwagi mu przerwać. Maniery z portretu.'},
 {n:'Eniki',            seg:'ser',kp:20,d:'Żartuje z wszystkiego, łącznie z sobą, i przez to nikt nie zauważa, że siedzi na każdym głosowaniu.'},
 {n:'Ponczus',          seg:'ser',kp:20,d:'Patrzy w okno, pisze raz na tydzień i zawsze trafia w sedno. Cierpliwość zamiast aktywności.'},
 {n:'Tako',             seg:'int',kp:56,d:'Wygląda jak coś, co wyszło z sennego koszmaru, a pisze jak profesor. Bezpartyjny z wyboru i bez zamiaru, żeby to zmienić — chyba że ktoś zaproponuje coś naprawdę środkowego.'},
];
const agentFree=n=>!(G&&G.agents&&G.agents[n]);
/* Przy jednym transferze na tydzień wolna pula znikała w pierwszej kadencji.
   Dwa na kadencję sprawiają, że bezpartyjni są na wagę złota przez całą grę
   i żaden gracz nie wykupi wszystkich. */
const AGENCI_NA_KADENCJE=2;
const agenciWziete=()=>(G&&G.agentTerm&&G.agentTerm.t===G.term)?G.agentTerm.n:0;
const agenciZostalo=()=>Math.max(0,AGENCI_NA_KADENCJE-agenciWziete());
function agentCost(n,k){const a=AGENTS.find(x=>x.n===n);if(!a)return 0;
  return Math.round(a.kp*(k?1:sizeF(me()).kp))}
function signAgent(n){
  const a=AGENTS.find(x=>x.n===n);if(!a||!agentFree(n))return;
  if(G.agentWeek===G.term+'-'+G.week)return;
  if(!agenciZostalo())return;
  const c=agentCost(n);if(G.kp<c)return;
  const p=me();
  G.kp-=c;G.agents[n]=G.me;G.agentWeek=G.term+'-'+G.week;SFX.coin();
  G.agentTerm=(G.agentTerm&&G.agentTerm.t===G.term)?{t:G.term,n:G.agentTerm.n+1}:{t:G.term,n:1};
  p.comp[a.seg]++;p.mem++;
  if(!p.bench.includes(n))p.bench.push(n);
  p.uni=cl(p.uni+(a.seg==='eli'?3:1));
  if(a.seg==='eli')p.fame=cl(p.fame+3);
  if(a.seg==='int')p.cred=cl(p.cred+2);
  fxPush(`transfer udany: ${n}`,'good');
  say(`<b>Transfer: ${n}</b> wchodzi do ${p.ab} za ${c} kapitału (${sn(a.seg)}).`,'good');
  XP(4);render();
}
function aiAgents(){
  // boty też kupują, ale tylko te, które realnie mają z czego
  alive().forEach(k=>{
    if(k===G.me)return;const p=G.p[k];
    p.bank=Math.min(260,(p.bank||0)+income(k).total);   // boty też nie zbierają w nieskończoność
    if(!ch(.18))return;
    const wolni=AGENTS.filter(a=>agentFree(a.n)).sort((a,b)=>b.kp-a.kp);
    const a=wolni.find(x=>p.bank>=agentCost(x.n,1));
    if(!a)return;
    const koszt=agentCost(a.n,1);
    p.bank-=koszt;G.agents[a.n]=k;
    p.comp[a.seg]++;p.mem++;
    if(!p.bench.includes(a.n)&&p.bench.length<10)p.bench.push(a.n);
    say(`<b>${p.ab} pozyskuje ${a.n}</b> za ${koszt} kapitału (${sn(a.seg)}). Bezpartyjnych ubywa.`,'');
  });
}
const LP={
 PPP:{main:['Lager'],bench:['kenzo','Kocur','Antoniopl','x_avi','Garibaldi']},
 KK:{main:['Peterdeus'],bench:['warrior','alan','Śledzik','Serty','Animu Player']},
 FD:{main:['loof'],bench:['Heraquik','Wiktor z Aeterny','Góra','Klabar','Bober','Oli','Mietek Nocul']},
 PLR:{main:['Sulejman','Aryati'],bench:['Prjonnek','balon']},
 // its.r3dz0l.eq przyszedł z rozwiązanej Chrześcijańskiej Partii Cesarskiej razem z mandatem
 NP:{main:['kisielek48'],bench:['Jugen','mentos','ekologiaball','Franzon','Prewencjusz','Silesia','its.r3dz0l.eq','bluetes33','Pablo']},
 PKD:{main:['Bartek'],bench:['Ignacy']},
 ROM:{main:['cargrzybov'],bench:[]},
 PP:{main:['Fazmiś'],bench:['Włóczykij','Rax']},
 POJ:{main:['impir','inwid'],bench:[]},
 NBR:{main:['Maciek'],bench:['Supernes']},
 ZHM:{main:['Kromka'],bench:[]},
 DPD:{main:['Tortex','Kaziu'],bench:['Sirius','Gustaw']},
 SS:{main:['Vengeance'],bench:['Mnem']},
};
const DUO_START=['PLR','POJ','DPD'];   // te partie startują ze współprzewodnictwem
const M=(p,x)=>{if(x<0&&G&&G.p&&p===G.p[G.me]&&hasT('meczennik'))x*=.35;p.mom=cl((p.mom||0)+x,-35,42)};
const L=n=>{const a=LEAD[n]||[50,50,50,50];
  const u=(G&&G.lup&&G.lup[n])||[0,0,0,0];
  const c=cl(a[0]+u[0],1,99),k=cl(a[1]+u[1],1,99),w=cl(a[2]+u[2],1,99),t=cl(a[3]+u[3],1,99);
  return {n,char:c,komp:k,wytrz:w,autor:t,avg:(c+k+w+t)/4,img:AVA[n]||null}};
function gainAutor(n,amt){   // autorytet: tylko wygrane debaty i wybory, nie da się go wytrenować
  if(!n||!G)return;
  if(!G.lup[n])G.lup[n]=[0,0,0,0];
  if(L(n).autor<99)G.lup[n][3]+=amt;
}
const initials=n=>n.replace(/[^A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż0-9 ]/g,'').split(/[ .]/).filter(Boolean)
  .slice(0,2).map(x=>x[0].toUpperCase()).join('')||'?';

/* ══════════ SEGMENTY ══════════ */
const SEG=[
 {id:'eli',n:'Elita',          c:'#e0b23c',ctr:-0.75,prt: 0.65,vote:1.70,
  d:'Najstarsi i najbardziej wpływowi. Jest ich najmniej, a ich głos waży najwięcej.'},
 {id:'int',n:'Intelektualiści',c:'#5a9be8',ctr:-0.35,prt: 0.45,vote:1.05,
  d:'Piszą programy i czytają statuty. Dają sławę i wiarygodność, podnoszą pretensjonalność.'},
 {id:'ser',n:'Serwerowicze',   c:'#4bbd85',ctr: 0.90,prt:-0.90,vote:0.50,
  d:'Większość serwera. Łatwo ich zwerbować, trudno utrzymać w ryzach.'},
];
const SID=SEG.map(s=>s.id);
const sn=id=>{const s=SEG.find(x=>x.id===id);return s?s.n:','};

/* ══════════ TEMATY WYSTĄPIEŃ ══════════ */
const TEM=[
 {id:'ustroj',    n:'Reforma ustroju serwera',            w:{eli:-1.2,int: 2.6,ser: 0.4}},
 {id:'przywileje',n:'Przywileje dla zasłużonych',         w:{eli: 2.8,int: 0.6,ser:-1.4}},
 {id:'wolnosc',   n:'Wolność słowa na kanałach',          w:{eli:-1.4,int:-0.4,ser: 2.6}},
 {id:'porzadek',  n:'Porządek i egzekwowanie regulaminu', w:{eli: 2.0,int: 1.4,ser:-2.4}},
 {id:'onboarding',n:'Program dla nowych użytkowników',    w:{eli:-0.8,int: 0.4,ser: 2.4}},
 {id:'moderacja', n:'Ukrócenie samowoli moderatorów',     w:{eli:-1.6,int: 0.2,ser: 2.6}},
 {id:'jakosc',    n:'Podniesienie poziomu dyskusji',      w:{eli: 1.6,int: 2.6,ser:-2.0}},
 {id:'rozrywka',  n:'Więcej eventów i zabawy',            w:{eli:-1.0,int:-0.8,ser: 2.8}},
 {id:'transparent',n:'Jawność decyzji administracji',     w:{eli:-0.6,int: 2.2,ser: 1.2}},
];

/* ══════════ OKRĘGI ══════════ */
const REG=[
 {id:'historia',n:'#max2',pop:63,eng:.48,seats:3,x:250,y:135,
  mix:{eli:.22,int:.70,ser:.08},d:'Archiwum serwera. Prawie sami intelektualiści, najwyższa frekwencja.'},
 {id:'kaplica',n:'#max3',pop:50,eng:.52,seats:2,x:449,y:135,
  mix:{eli:.30,int:.66,ser:.04},d:'Najwięcej elity w przeliczeniu na głowę. Dwa mandaty, ale ciężkie.'},
 {id:'muzyka',n:'#ekonomia',pop:52,eng:.30,seats:2,x:648,y:135,
  mix:{eli:.06,int:.34,ser:.60},d:'Mieszanka. Nikt tu nie dominuje.'},
 {id:'polityka',n:'#konstytucja',pop:85,eng:.55,seats:4,x:150.5,y:307.5,
  mix:{eli:.28,int:.52,ser:.20},d:'Elita i intelektualiści. Wszyscy czytają, wszyscy głosują.'},
 {id:'ogolny',n:'#ogólny',pop:130,eng:.32,seats:6,x:349.5,y:307.5,
  mix:{eli:.10,int:.30,ser:.60},d:'Jedyny kanał, gdzie bywają wszystkie trzy grupy. Sześć mandatów.'},
 {id:'gaming',n:'#czat_gamingowy',pop:80,eng:.24,seats:3,x:548.5,y:307.5,
  mix:{eli:.02,int:.13,ser:.85},d:'Serwerowicze. Dużo ludzi, prawie nikt nie głosuje.'},
 {id:'szitpost',n:'#twitter',pop:105,eng:.26,seats:4,x:250,y:480,
  mix:{eli:0,int:0,ser:1},d:'Wyłącznie serwerowicze. Elita tu nie zagląda.'},
 {id:'brama',n:'#ogłoszenia_youtube',pop:40,eng:.20,seats:2,x:449,y:480,
  mix:{eli:.01,int:.09,ser:.90},d:'Sami nowi serwerowicze, najniższa frekwencja.'},
 {id:'event',n:'#kanał_eventowy',pop:65,eng:.38,seats:3,x:648,y:480,
  mix:{eli:.08,int:.26,ser:.66},d:'Konkursy, zapowiedzi, spoty. Jedyne miejsce, gdzie w ogóle ogląda się materiały wyborcze.'},
];
const SERVER=670, SERVER_MAX=860, TOPUP=11;
let DIST_SEATS=REG.reduce((a,r)=>a+r.seats,0);
const TOTAL_SEATS=DIST_SEATS+TOPUP;
const MAJ=Math.floor(TOTAL_SEATS/2)+1;
const rn=id=>REG.find(r=>r.id===id).n;

/* ══════════ KOALICJE ══════════ */
const COAL={
 HM :{n:'Horyzont Monarchistyczny',c:'#c9a227',m:['PPP','KK','ROM']},
 FS :{n:'Front Socjaldemokracji',  c:'#e2606f',m:['PLR','POJ','NBR','PP']},
 HPI:{n:'Harmonijny Pakt Izraela', c:'#9b7fd4',m:['PKD','ZHM']},
};
const COAL0=JSON.parse(JSON.stringify(COAL));
const CO=()=>G.coal;
/* próg: 5% partia sama, 8% lista dwóch partii, 13% lista trzech i więcej */
const thrFor=n=>n<=1?THR.base:n<=2?THR.base+3:THR.base+8;

/* ══════════ PARTIE ══════════ */
const BASE={
 /* PPP ma największy skład i startowe mandaty, więc nie potrzebuje drugiej,
    ukrytej przewagi w mnożniku odbioru. Niższy pull zostawia jej charakter
    lidera, ale pozwala kampanii i obecności innych partii realnie ją dogonić. */
 PPP :{n:'Partia Polskich Patriotów',ab:'PPP',c:'#237a3a',founded:'25.04.2025',pull:10.800,
   fame:78,cred:50,uni:40,act:35,ctr:35,pret:30,mem:39,pot:74,diff:1,
   aff:{eli:1,int:4,ser:31}, comp0:[1,7,31],
   blurb:'Największa partia serwera. 39 osób, cztery mandaty i lider, który nie odpisuje na DM.',
   flaw:'Lager ma wytrzymałość 30 i kompetencję 36, energia ledwo się odnawia, wiarygodność wycieka. Kenzo został jako ostatni mocny człowiek zaplecza.'},
 KK  :{n:'Kongres Koronny',ab:'KK',c:'#a01c2c',founded:'16.02.2024',pull:12.592,
   fame:72,cred:64,uni:35,act:30,ctr:20,pret:38,mem:34,pot:62,diff:2,
   aff:{eli:8,int:6,ser:3}, comp0:[1,6,27],
   blurb:'Najstarsza partia serwera, od lutego 2024. Instytucja. Umiera powoli i z godnością.',
   flaw:'Uwiąd: co tydzień traci jedność i aktywność. Cztery mandaty po dziewięciu, Peterdeus ma kompetencję 72 i wytrzymałość 36, a Śledzik siedzi w pałacu zamiast na czele partii.'},
 FD  :{n:'Front Demokratyczny',ab:'FD',c:'#2e6b46',founded:'27.12.2025',pull:1.900,
   fame:70,cred:78,uni:68,act:75,ctr:48,pret:74,mem:26,pot:85,diff:1,
   aff:{eli:6,int:9,ser:2}, comp0:[1,6,19],
   blurb:'Najbardziej profesjonalna partia w grze. I wszyscy jej to wypominają.',
   flaw:'Pretensjonalność 74. Memiarze i nowicjusze, czyli 9 mandatów, cię odrzucają.'},
 PLR :{n:'Concordia',ab:'CC',c:'#a92fd0',founded:'10.10.2025',pull:1.500,
   fame:62,cred:55,uni:58,act:55,ctr:30,pret:34,mem:24,pot:88,diff:3,
   aff:{eli:4,int:7,ser:5}, comp0:[0,5,19],
   blurb:'Dawni „Postępowcy”. Sufit potencjału 88, najwyższy w grze. Nikt go jeszcze nie dotknął.',
   flaw:'Niewykorzystany potencjał: 26 punktów poniżej własnego sufitu. Dwóch liderów, zero zaplecza.'},
 NP  :{n:'Nowa Perspektywa',ab:'NP',c:'#c8952b',founded:'01.02.2026',pull:1.668,
   fame:58,cred:66,uni:70,act:68,ctr:22,pret:36,mem:23,pot:84,diff:1,
   aff:{eli:4,int:6,ser:19}, comp0:[0,4,19],
   blurb:'Dziesięć mandatów i fotel premiera na starcie. kisielek48 zbiera wokół siebie wszystkich, którzy nie chcą monarchistów.',
   flaw:'Bluetes i Pablo przeszli do NP razem z mandatami. Masz siłę, ale rząd z ośmiu koalicjantów nadal pęka od jednego złego tygodnia.'},
 PKD :{n:'Partia Królestwa Dawidowego',ab:'PKD',c:'#b9a24b',founded:'09.11.2025',pull:1.199,
   fame:52,cred:30,uni:55,act:50,ctr:55,pret:22,mem:16,pot:60,diff:4,
   aff:{eli:3,int:2,ser:8}, comp0:[0,2,14],
   blurb:'Pół memu, pół teokracji. Znają cię wszyscy, poważnie nie traktuje nikt.',
   flaw:'Bartek ma charyzmę 72 i kompetencję 32. Ludzie go uwielbiają i nie wierzą mu ani słowa.'},
 ROM :{n:'Ruch Obrony Monarchii',ab:'ROM',c:'#8c3b2a',founded:'02.03.2026',pull:0.600,
   fame:34,cred:40,uni:25,act:12,ctr:20,pret:32,mem:11,pot:44,diff:5,
   aff:{eli:7,int:4,ser:2}, comp0:[0,2,9],
   blurb:'cargrzybov złożył wypowiedzenie z roleplayu. Partia istnieje wyłącznie formalnie.',
   flaw:'Wytrzymałość lidera 14 i pusta ławka. Nie ma kogo mianować, musisz grać tym, co zostało.'},
 PP  :{n:'Partia Pracy',ab:'PP',c:'#1d3557',founded:'11.07.2026',pull:0.916,
   fame:24,cred:58,uni:70,act:65,ctr:18,pret:26,mem:10,pot:92,diff:4,
   aff:{eli:2,int:5,ser:7}, comp0:[0,2,8],
   blurb:'Najmłodsza z poważnych. Sufit 92, najwyższy w grze. Nazwiska brak.',
   flaw:'Za mało czasu: startujesz ze sławą 24 i dziesięcioma osobami.'},
 POJ :{n:'Partia Odrodzenia Jugosławii',ab:'POJ',c:'#c0392b',founded:'24.05.2026',pull:2.650,
   fame:26,cred:45,uni:62,act:40,ctr:25,pret:28,mem:6,pot:48,diff:4,
   aff:{eli:2,int:4,ser:6}, comp0:[0,1,5],
   blurb:'Bratstvo i jedinstvo na serwerze o nazwie Mordy Mordeczki.',
   flaw:'Wąski sufit 48 i pusta ławka. Zostają wam tylko impir i inwid, na zmianę.'},
 NBR :{n:'Niepełnosprawny Blok Rencistów',ab:'NBR',c:'#6b5b3e',founded:'29.01.2026',pull:2.420,
   fame:30,cred:12,uni:80,act:40,ctr:60,pret:14,mem:3,pot:26,diff:5,
   aff:{eli:1,int:1,ser:9}, comp0:[0,0,3],
   blurb:'Zero potencjału, zero programu, sto procent wibe. Wystarczy, że jest.',
   flaw:'Maciek ma charyzmę 76 i kompetencję 18. Ludzie go słuchają, nikt nie wie po co.'},
 ZHM :{n:'Związek Harmonii Monarchistycznej',ab:'ZHM',c:'#4b2d63',founded:'14.07.2026',pull:2.647,
   fame:20,cred:50,uni:72,act:42,ctr:12,pret:44,mem:3,pot:46,diff:5,
   aff:{eli:6,int:5,ser:2}, comp0:[0,1,2],
   blurb:'Estetyka: korona i kwiat wiśni. Zasięgi: trzy osoby.',
   flaw:'Niszowość: rekrutacja przynosi o połowę mniej ludzi. Kromka rządzi sam i nie ma zmiennika.'},
 DPD :{n:'Demokratyczne Porozumienie Dialogu',ab:'DPD',c:'#0b63f6',founded:'08.07.2026',pull:2.129,
   fame:16,cred:60,uni:75,act:45,ctr:8,pret:25,mem:4,pot:74,diff:4,marg:1,
   aff:{eli:3,int:7,ser:4}, comp0:[0,2,2],
   blurb:'Świeża, rozsądna i konsekwentnie przemilczana przez cały serwer. Cztery mandaty w rządzie kisielka mimo to.',
   flaw:'Marginalizacja: −25% do odbioru, dopóki nie przebijesz się debatą albo skandalem.'},
 SS  :{n:'Stronnictwo Reisei',ab:'SS',c:'#d489a2',founded:'26.07.2026',pull:2.300,
   fame:64,cred:62,uni:86,act:55,ctr:10,pret:42,mem:2,pot:90,diff:2,
   aff:{eli:5,int:5,ser:5}, comp0:[0,2,0],
   blurb:'Reisei znaczy spokój. Dwie osoby, pieczęć z kwiatem wiśni i sława, której nikt na serwerze nie umie wytłumaczyć. Czysty środek sceny.',
   flaw:'Cały skład to Vengeance i zaplecze Mnema. Dwie osoby, zero mandatów, ogromny sufit, wszystko dopiero przed wami.'},
};
const PID=Object.keys(BASE);

/* ══════════ STAN ══════════ */
let G=null;
const me=()=>G.p[G.me];
/* Znaczki zasobów. Wstawiane i w panelu, i w zdaniach w rodzaju „wydaj kapitał”,
   żeby ta sama rzecz zawsze wyglądała tak samo. Grafiki leżą w obrazki/ikona-*.png;
   gdy któregoś brakuje, zostaje sam napis i nic się nie sypie. */
const IKONY={akcje:'akcje',kapital:'kapital',energia:'energia',sondaz:'sondaz',mandat:'mandat'};
const ikona=(id,kl)=>IKONY[id]?`<i class="ic ic-${IKONY[id]}${kl?' '+kl:''}" aria-hidden="true"></i>`:'';
/* Pełny skład imienny partii: przewodniczący, współprzewodniczący, twarze i ławka.
   Lider musi być wpisany osobno, bo obejmując stery znika z ławki, a jeśli nie
   wywodził się z pierwotnego składu, to nie ma go też wśród twarzy — i wypadał
   z listy zaplecza razem z licznikiem. */
function roster(p){return [...new Set(leads(p).concat(p.main,p.bench).filter(Boolean))]}
/* Partia może mieć jednego, dwóch albo trzech przewodniczących. Wszystko, co ich
   dotyczy — statystyki, cechy, podpisy — liczy się z tej listy, żeby trzeci nie
   wypadał z rachunku w połowie miejsc. */
const leads=p=>[p.lead,p.lead2,p.lead3].filter(Boolean);
const isLead=(p,n)=>leads(p).includes(n);
const freeTot=()=>G.free.eli+G.free.int+G.free.ser;
function enGain(){
  const p=me();
  const bonusZagadki=(G.law&&G.law.zagadki)?4:0;   // cotygodniowe zagadki trzymają serwer w ruchu
  return Math.max(0, Math.round((BAL.energiaBaza+lead(G.me).wytrz/3.1+(p.uni-42)/4.4+bonusZagadki)*10)/10);
}
const KING='Mordeczka';
const MIES=['stycznia','lutego','marca','kwietnia','maja','czerwca','lipca','sierpnia','września','października','listopada','grudnia'];
function gameDate(){
  const d=new Date(2026,7,1);
  d.setDate(d.getDate()+((G.term-1)*12+(G.week-1))*7+Math.max(0,(G&&G.dzienTygodnia||1)-1));
  return d;
}
const dateStr=d=>d.getDate()+' '+MIES[d.getMonth()]+' '+d.getFullYear();
function isEraNiestab(){
  if(!G)return false;
  const d=gameDate();
  return (d.getFullYear()===2026&&d.getMonth()===11)||(d.getFullYear()===2027&&d.getMonth()===0);
}
let dateAnim=null;
function runDateAnim(){
  const a=dateAnim;dateAnim=null;
  if(!a)return;
  if(!document||!document.querySelector)return;
  const el=document.querySelector('.datechip b');if(!el)return;
  if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const d=new Date(a.from);let i=0,total=Math.max(1,Math.round((new Date(a.to)-new Date(a.from))/86400000));
  el.classList.add('ticking');el.textContent=dateStr(d);
  const iv=setInterval(()=>{
    i++;d.setDate(d.getDate()+1);el.textContent=dateStr(d);
    if(i>=total){clearInterval(iv);el.textContent=dateStr(a.to);
      el.classList.remove('ticking');el.classList.add('landed');
      setTimeout(()=>el&&el.classList.remove('landed'),430)}
  },95);
}
function kingFactors(k){
  const p=G.p[k||G.me], me2=(k||G.me)===G.me;
  const out=[
    {n:'Siła w sejmie',    v:p.seats+' / '+TOTAL_SEATS, w:p.seats*2.1, d:'Mandaty ważą najwięcej. Króla obchodzi, kto realnie utrzyma sejm.'},
    {n:'Zaplecze w partii',v:p.mem+' osób',      w:cl((p.mem-14)*.34,-6,14), d:'Duża partia to gwarancja, że rząd nie rozpadnie się po tygodniu.'},
    {n:'Wiarygodność',     v:Math.round(p.cred), w:(p.cred-45)*.42*(me2&&hasPer(G.me)?2:1), d:'Król nie desygnuje ludzi, którym nikt nie wierzy.'},
    {n:'Aktywność',        v:Math.round(p.act),  w:(p.act-45)*.34,  d:'Martwa partia nie utrzyma rządu.'},
    {n:'Kontrowersja',     v:Math.round(p.ctr),  w:-p.ctr*.26,      d:'Skandale przeszkadzają, ale Król widział już gorsze rzeczy.'},
    {n:'Stosunki z dworem',v:me2?Math.round(G.king.rel):50, w:me2?(G.king.rel-50)*.34:0, d:'To, co ustaliliście na osobności, przez ustawy, daninę i przysługi.'},
    /* Tłuszczolt. Mordeczka i Maciek trzymają się razem z powodów, o których
       obaj mówią niechętnie i zawsze tak samo: „wagowo się sprzyjamy". */
    {n:'Tłuszczolt', v:isLead(p,'Maciek')?'tak':'—', w:isLead(p,'Maciek')?14:0,
     d:'Król trzyma z Maćkiem jak równy z równym. Reszcie sejmu trudno to skomentować.'},
    {n:'Danina',           v:me2?G.king.paid:0,  w:me2?G.king.paid/(G.krolTryb?8:DANINA_ZA_PUNKT):0, d:'Kapitałem da się go przekonać, ale bardzo drogo.'},
  ];
  if(isLead(p,'Mnem'))out.push({n:'Młoda krew',v:'Mnem',w:10,d:'„Jam jest młody i młodością was zabije.” Tupet i świeżość imponują dworowi niezależnie od reszty.'});
  return out;
}
/* Ile kapitału idzie na jeden punkt u Króla. Za siedem monet dawało się kupić
   przychylność zbyt tanio — desygnacja robiła się kwestią zbierania kasy,
   a nie polityki. */
const DANINA_ZA_PUNKT=16;
function kingScore(k){return kingFactors(k).reduce((a,x)=>a+x.w,0)}
function kingFav(k){return kingScore(k)*(G&&G.krolTryb?2:1)}
function kingRel(d,why){
  if(!G.king)return;
  G.king.rel=cl(G.king.rel+d,0,100);
  if(why)say(`<b>Król Mordeczka:</b> ${why} Relacja ${d>0?'+':''}${Math.round(d)} (teraz ${Math.round(kingFav(G.me))}).`,d>0?'roy':'bad');
}
function income(k){
  // składki: elita płaci najwięcej, serwerowicz grosze; aktywność decyduje, ilu w ogóle płaci
  const p=(k?G.p[k]:me()), c=p.comp;
  // stawki składek: domyślne albo takie, jakie ustawił sejm ustawą ekonomiczną
  const u=G&&G.law?G.law.ekon:null, st=(u&&typeof u==='object')?u:null;
  const sEli=st?st.eli:2.6, sInt=st?st.int:0.95;
  const sSer=st?st.ser:(hasRob(k||G.me)?0.36:0.18);
  // gdy stawki są nastawione ręcznie, one same są nagrodą — premia za uchwałę
  // należy się tylko wtedy, gdy nikt przy nich nie kręcił
  const domyslne=!st||(st.eli===2.6&&st.int===0.95);
  const podnies=u&&domyslne?1.2:1;
  // Przewagi się nakładają, ale nie mnożą bez końca: najmocniejsza działa w pełni,
  // każda kolejna już tylko w części. Inaczej trzy bonusy dawały ośmiokrotność bazy.
  const bonusy=[(hasAds(k||G.me)?2.1:1),(hasHeg(k||G.me)?1.45:1),podnies].filter(x=>x>1).sort((a,b)=>b-a);
  const mnoznik=bonusy.reduce((a,x,i)=>a*(i?1+(x-1)*.45:x),1);
  // Ustawa o podatkach: przy progresji bogaty skład dokłada się za resztę,
  // przy stawce równej każdy płaci tyle samo, co zawsze.
  const pod=G&&G.law?G.law.podatki:null;
  const prog=(pod&&typeof pod==='object'&&pod.progresja>0)?1:0;
  const udzEli=p.mem?c.eli/p.mem:0;
  const progM=prog?{eli:1+.45*(1-udzEli),int:1.08,ser:.72}:{eli:1,int:1,ser:1};
  const skladki=(c.eli*sEli*progM.eli+c.int*sInt*progM.int+c.ser*sSer*progM.ser)*mnoznik;
  const akt=cl(0.28+p.act/78,0.28,1.6);
  const mine=(k||G.me)===G.me;
  const urz=mine?((inGov()?4:0)+(isPM()?8:0)+(hasPrez()?5:0)
    +(G.gov&&G.pmOk?resortyPartii(G.me)*2.0:0)):0;
  // ryczałt: partia kanapowa i tak musi mieć za co działać. Wygasa płynnie, razem ze wzrostem składek
  const flo=Math.max(0,8-p.mem*.35);
  return {skladki,akt,urz,flo,total:Math.round(Math.max(1,flo,skladki*akt+urz+1))};
}
function makeNoise(){ // błąd pomiaru zmienia się powoli, nie skacze co tydzień
  if(!G.noise)G.noise={};
  const q=G.p?tally():null;
  if(q)G.prevShown=Object.fromEntries(PID.map(k=>[k,shown(k,q.res[k].tot/q.total*100)]));
  PID.forEach(k=>{const prev=G.noise[k]||0;
    G.noise[k]=cl(prev*.70+R(-1,1)*2.4,-4.5,4.5)});
}
function shown(k,pct){ // wartość pokazywana w sondażu, nie prawdziwa
  /* Błąd pomiaru skaluje się z wielkością partii, jak w prawdziwych badaniach:
     przy dwóch procentach nikt nie pomyli się o pięć punktów, bo nie ma o co.
     Wcześniej szum był stały i mała partia oglądała u siebie okrągłe zero,
     mając realne 2,4% — wyglądało to jak zepsuta gra, a nie jak sondaż. */
  let skala=cl(Math.sqrt(Math.max(0,pct)*Math.max(0,100-pct))/43.3,.18,1.25);
  if(G.law&&G.law.media)skala*=.6;   // ustawa medialna: sondaże robione rzetelniej, mniejszy błąd
  const wynik=pct+((G.noise&&G.noise[k])||0)*skala;
  return Math.max(pct*.35,wynik);   // realne poparcie nigdy nie znika z tabeli do zera
}
const ratio=(p,g)=>p.mem>0?p[ 'comp'][g]/p.mem:0;
const eliteRisk=p=>{if(p.mem<9)return 0;const lim=(G&&p===G.p[G.me]&&hasT('elitarysta'))?.42:.30;const r=ratio(p,'eli');return r>lim?(r-lim)*3.4:0};
const alive=()=>PID.filter(k=>!G.p[k].dead);
const lead=k=>{const p=G.p[k],ls=leads(p);
  if(ls.length<2)return L(p.lead);
  const st=ls.map(L), sr=f=>Math.round(st.reduce((a,x)=>a+x[f],0)/st.length);
  return {n:ls.join(' / '),char:sr('char'),komp:sr('komp'),wytrz:sr('wytrz'),autor:sr('autor'),
    avg:st.reduce((a,x)=>a+x.avg,0)/st.length,img:st[0].img,duo:st};};
const innAll=k=>{const p=G.p[k];
  // po ukończeniu celu dana osoba dostaje inną cechę wrodzoną w miejsce startowej
  const one=n=>(n==='loof'&&goalDone('demokraci'))?MEMENTO
    :(n==='Kaziu'&&goalDone('kazik'))?INNATE['Kaziu*']:(INNATE[n]||null);
  // Więcej głów u steru to więcej kłótni, nie więcej darmowych zdolności:
  // cechy wnoszą tylko dwie pierwsze osoby, trzecia dokłada wyłącznie statystyki.
  return leads(p).slice(0,2).map(one).filter(Boolean);};
function coalOf(k){if(!G||!G.coal)return null;for(const c in G.coal) if(G.coal[c].m.includes(k)) return c; return null}
const inGov=()=>!!(G.gov&&G.gov.parties.includes(G.me));
const isPM=()=>!!(G.gov&&G.gov.pm===G.me&&G.pmOk);
const hasPrez=()=>!!(G.prez&&G.prez.party===G.me);

function newGame(id){
  /* Nowa gra ma własny seed, a późniejsze rzuty zapisują się w G.rng. Dzięki
     temu nowy start nadal jest różny, ale konkretny zapis jest powtarzalny. */
  const seed=(Date.now()^String(id||'').split('').reduce((a,c)=>((a*33)^c.charCodeAt(0))>>>0,0))>>>0;
  rngSeed(seed);
  const p={};
  PID.forEach(k=>{
    p[k]=Object.assign({},BASE[k]);
    p[k].aff=Object.assign({},BASE[k].aff);
    p[k].pres=Object.fromEntries(REG.map(r=>[r.id,k===id?8:R(4,26)]));
    p[k].coal=(()=>{for(const c in COAL0)if(COAL0[c].m.includes(k))return c;return null})(); p[k].seats=0; p[k].dead=0; p[k].pact={};
    p[k].pret=p[k].pret||30; p[k].marg=p[k].marg||0;
    const c0=BASE[k].comp0;
    p[k].comp={eli:c0[0],int:c0[1],ser:c0[2]};
    p[k].mem=c0[0]+c0[1]+c0[2];
    p[k].mom=0; p[k].flow={eli:0,int:0,ser:0}; p[k].lead=LP[k].main[0]; p[k].bench=LP[k].bench.slice(); p[k].main=LP[k].main.slice();
    p[k].lead2=DUO_START.includes(k)?(LP[k].main[1]||null):null; p[k].lead3=null;
  });
  const startCoal=JSON.parse(JSON.stringify(COAL0));
  const rel={};
  PID.forEach(a=>{rel[a]={};PID.forEach(b=>{ if(a===b)return;
    const ca=(()=>{for(const c in COAL0)if(COAL0[c].m.includes(a))return c;return null})();
    const cb=(()=>{for(const c in COAL0)if(COAL0[c].m.includes(b))return c;return null})();
    let v=RI(-8,26); if(ca&&ca===cb) v+=RI(30,46); rel[a][b]=v})});
  G={me:id,p,rel,coal:startCoal,term:1,week:1,weeks:12,ap:3,apMax:3,kp:26,en:100,
     sztab:5,sztabMax:5,log:[],used:{},once:{},tab:'mapa',cat:'kam',sel:'ogolny',
     gov:null,pmOk:false,pmProc:null,queue:[],phase:'camp',prest:0,hist:[],prev:null,
     turnout:.85,lup:{},recCd:0,xp:0,xpOs:{},traits:[],ptraits:{},tut:null,tutSeen:{},streak:0,noise:{},useTerm:{},catUsed:{},lastAct:null,
     king:{rel:52,paid:0}, sejmPrez:null, mar:null, goals:{}, nationalGoals:{}, agents:{}, agentWeek:null, sits:[], polls:[], scen:null,
     rng:RNG_STATE,aiMemory:{},aiLedger:[],
     /* Simulowany kalendarz: decyzje przesuwają dzień, a luka tygodnia nadal
        pozostaje cotygodniowym limitem akcji i rozliczeń. */
     dzienTygodnia:1,czasTygodnia:0,czasGodzTygodnia:0,godzina:8,harmonogram:[],odnowy:{},pkbCiosy:[],
     /* Parametr jest wyłącznie dla automatycznego podglądu. Normalna gra startuje
        z dźwiękiem, a test nie budzi człowieka przy komputerze. */
     mute:typeof location!=='undefined'&&new URLSearchParams(location.search).has('mute'), night:null,
     prez:{party:'KK',lead:'Śledzik',until:2}, prezHist:[]};
  const used=PID.reduce((a,k)=>a+p[k].mem,0), fr=SERVER-used;
  G.free={eli:13,int:Math.round(fr*.24),ser:0};       // elita jest rzadkim towarem
  G.free.ser=fr-G.free.eli-G.free.int;
  G.mood={eli:1,int:1,ser:1};
  G.kapPryw={}; G.pkb=0; G.skarb=0; G.budzet=0; G.budzetHistoria=[];
  /* Pierwszy odczyt PKB zapisujemy od razu na starcie. Bez tego wykres przez
     cały pierwszy tydzień nie miał czego rysować i dział Ekonomia świecił
     pustką akurat wtedy, gdy gracz tam pierwszy raz zagląda. */
  G.pkbHist=[];
  rangiStart();                     // rangi z majątku startowego, bez opłat
  makeNoise();
  G.prev=snap();
  say(`Kadencja 1. Do wyborów ${G.weeks} tygodni. Prezydentem jest <b>${G.prez.lead}</b> (${G.p[G.prez.party].ab}).`,'roy');
  seedSeats();
  // rząd zastany: Front Socjaldemokracji plus wszystkie partie pozakoalicyjne, premier kisielek48
  const team=['NP','FD','DPD','PLR','POJ','NBR','SS','PP'].filter(k=>G.p[k]&&G.p[k].seats>0);
  const st=team.reduce((a,k)=>a+G.p[k].seats,0);
  setGov(team,'NP',RI(56,64)); G.gov.minority=st<MAJ?1:0; G.pmOk=true; G.gov.pmLead=pmOsoba('NP')||G.p.NP.lead;
  // rząd przecina listy wyborcze, więc nie jest blokiem: HM, FS i HPI zostają na swoim miejscu
  G.bloc=null; G.opoBloc=null;
  PID.forEach(k=>G.p[k].coal=coalOf(k));
  say('<b>Rząd zastany:</b> kisielek48 premierem, '+st+' z '+TOTAL_SEATS+' mandatów. Monarchiści po raz pierwszy poza gabinetem.','roy');
}
// mandat po rozwiązanej ChPC przeszedł razem z jej posłem do Nowej Perspektywy
/* Z PPP i z Kongresu Koronnego ludzie odeszli. Mandaty nie wyparowały: zabrał je
   sąsiad z tego samego obozu — republikański PKD i monarchistyczny ROM. Oba stoją
   poza gabinetem, więc rząd kisielka48 dalej ma równo 26 z 40. */
/* Bluetes i Pablo przeszli do Nowej Perspektywy razem z mandatami. To korekta
   stanu zastanego, a nie bonus znikąd: PPP oddaje dwa miejsca, NP je przejmuje. */
const START_SEATS={PPP:4,KK:3,ROM:2,FD:7,NP:10,PLR:3,PKD:2,PP:1,POJ:1,NBR:1,ZHM:1,DPD:4,SS:1};
function seedSeats(){
  // sejm zastany: rząd kisielka48 ma większość po transferze Bluetes i Pablo, monarchiści idą w opozycję
  const s=Object.assign({},START_SEATS);
  const cs=(CUSTOM&&CUSTOM.seats)||0;
  if(cs&&CUSTOM){s[CUSTOM.id]=cs;let left=cs;
    const don=Object.keys(s).filter(k=>k!==CUSTOM.id);
    while(left>0){don.sort((a,b)=>s[b]-s[a]);if(s[don[0]]<=1)break;s[don[0]]--;left--}}
  PID.forEach(k=>G.p[k].seats=s[k]||0);
}
function snap(){const p=me();return {fame:p.fame,cred:p.cred,uni:p.uni,act:p.act,ctr:p.ctr,pret:p.pret,mem:p.mem,mom:p.mom||0}}
/* Doświadczenie zbiera osoba, nie partia. Wcześniej była jedna wspólna pula:
   dało się wyrobić dorobek jednym przewodniczącym, oddać stery komu innemu
   i od razu kupić następcy cechy za cudzą pracę. Rozwój postaci przestawał
   wtedy cokolwiek znaczyć. */
function xpPula(){
  if(!G.xpOs){
    G.xpOs={};
    // zapisy sprzed zmiany trzymały jedną liczbę — oddajemy ją tym, którzy wtedy przewodzili
    const ls=G.p&&G.p[G.me]?leads(G.p[G.me]):[];
    if(G.xp>0&&ls.length)ls.forEach(w=>G.xpOs[w]=G.xp/ls.length);
  }
  return G.xpOs;
}
const xpOs=w=>(w&&xpPula()[w])||0;
function XP(n){if(PROBA)return;
  if(!G)return;
  G.xp=(G.xp||0)+n;                 // łączny dorobek partii, do historii i rozliczeń
  const ls=G.p&&G.p[G.me]?leads(G.p[G.me]):[];
  if(!ls.length)return;
  const na=n/ls.length;             // dwie głowy u steru nie mnożą doświadczenia, dzielą je
  const pula=xpPula();
  ls.forEach(w=>pula[w]=(pula[w]||0)+na);
}
function checkDeath(){
  if(!G||G.phase==='dead')return false;
  const p=me();
  return false;   // partii nikt już nie rozwiązuje, zostają konsekwencje
}
/* ═══ TRYB PRÓBY ═══
   Skutki decyzji są imperatywne i losowe, więc nie da się ich przewidzieć
   wzorem. Zamiast dublować logikę, odpalamy prawdziwą decyzję kilka razy na
   kopii stanu i patrzymy, co wyszło. Przy PRÓBIE milknie wszystko, co sięga
   poza stan gry: kronika, dymki, dźwięk, doświadczenie i przerysowanie ekranu.
   Test test_podglad.py pilnuje, że prawdziwy stan wychodzi z podglądu
   bajt w bajt taki sam. */
let PROBA=0;
function say(t,c=''){if(PROBA)return;G.log.unshift({w:`K${G.term}·T${G.week}`,t,c}); if(G.log.length>240)G.log.pop()}

/* ══════════ MODEL WYBORCZY ══════════ */
