/* ═══════════════════════════════════════════════════════════
   MORDY MORDECZKI — SEJM
   Roleplay polityczny na serwerze Mordy Mordeczki.

   Autorzy: Maciek i Balon
   ═══════════════════════════════════════════════════════════ */
(function(){
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

  // zmęczenie władzą: ile dokłada kadencja u steru i ile zmywa kadencja w opozycji
  znuzeniePremier:     21,
  znuzenieKoalicja:    11,
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
  doganianieSila:      .30,

  // energia: ile jej wraca co tydzień i jak drogie są decyzje
  energiaBaza:         2.0,
  energiaMnoznik:      .96,

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

const R=(a,b)=>a+Math.random()*(b-a), RI=(a,b)=>Math.floor(R(a,b+1));
const cl=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));
const ch=p=>Math.random()<p, pick=a=>a[Math.floor(Math.random()*a.length)];
const fmt=n=>n.toFixed(1).replace('.',',');
const pl=(n,a,b,c)=>n===1?a:(n%10>=2&&n%10<=4&&(n%100<10||n%100>=20)?b:c);
const esc=s=>String(s).replace(/'/g,"\\'");

/* ══════════ LIDERZY ══════════ */
/* [charyzma, kompetencja, wytrzymałość, autorytet] */
const AVA={"Prawe Jąderko": "obrazki/32a907831366.webp", "Vengeance": "obrazki/d9c43f30a1fa.webp", "Korzeń": "obrazki/edd614e44a4d.webp", "Maciej Starszy": "obrazki/7f677d35a527.webp", "bizantyjczyk": "obrazki/3f26e28825a4.webp", "Jangcy": "obrazki/3c5f99631754.webp", "Zomowiec z Sejmu": "obrazki/5a6024fdfbc7.webp", "Wojtaszko": "obrazki/463d9208b9dd.webp", "Pan Hod_Dog": "obrazki/16ca0d3b9eeb.webp", "Plawik": "obrazki/35a4cee441f9.webp", "Lager": "obrazki/5e6a47f7a1eb.webp", "Peterdeus": "obrazki/c23e96e64f3b.webp", "Sulejman": "obrazki/986e02aca71d.webp", "Aryati": "obrazki/947b2f454432.webp", "kisielek48": "obrazki/3d3332854d5f.webp", "Bartek": "obrazki/989b5176e4a1.webp", "cargrzybov": "obrazki/30bcedf79997.webp", "Fazmiś": "obrazki/0e9071fc2092.webp", "impir": "obrazki/135df09bc351.webp", "inwid": "obrazki/7b152588238a.webp", "Maciek": "obrazki/4aa32504feb8.webp", "Kromka": "obrazki/9d211aac5435.webp", "Tortex": "obrazki/53820c7b8559.webp", "Kaziu": "obrazki/8220da0fe301.webp", "its.r3dz0l.eq": "obrazki/b9fb8b09ea87.webp", "kenzo": "obrazki/eb1ee0a9978d.webp", "bluetes33": "obrazki/f450efa7026d.webp", "Kocur": "obrazki/ea8295d6fab4.webp", "Gustaw": "obrazki/2a9007517459.webp", "Antoniopl": "obrazki/1189f2a85ea3.webp", "warrior": "obrazki/2f39d1ecb2de.webp", "alan": "obrazki/da625bd66599.webp", "Śledzik": "obrazki/65e60b12b9fe.webp", "Serty": "obrazki/ff0950f99292.webp", "Heraquik": "obrazki/67887df61b8e.webp", "balon": "obrazki/e7cc40af1a7a.webp", "Wiktor z Aeterny": "obrazki/d2ed03874247.webp", "Góra": "obrazki/4205cad83b6b.webp", "Klabar": "obrazki/b536642cd5eb.webp", "Bober": "obrazki/83dd46efd068.webp", "Oli": "obrazki/7a685e2ac353.webp", "loof": "obrazki/3f7e866b3355.webp", "Mnem": "obrazki/e452af74ed4c.webp", "Mietek Nocul": "obrazki/89ee38f6ab26.webp", "Prjonnek": "obrazki/cfd70f7b77a6.webp", "Jugen": "obrazki/9e01fd9dbb40.webp", "mentos": "obrazki/d99a6ee7b318.webp", "ekologiaball": "obrazki/ad479906048d.webp", "Franzon": "obrazki/a4d97f94288d.webp", "Prewencjusz": "obrazki/2edc2ee02c95.webp", "Włóczykij": "obrazki/721a1f244511.webp", "Rax": "obrazki/7b7c4f192e6f.webp", "Supernes": "obrazki/eea9db03ef6b.webp", "Sirius": "obrazki/bc8735f17d51.webp", "x_avi": "obrazki/89c9588432e9.webp", "Garibaldi": "obrazki/b3d16b3de0ab.webp", "Silesia": "obrazki/ca0230b99bb6.webp", "Animu Player": "obrazki/9c0a033d5ceb.webp", "Mordeczka": "obrazki/0051a52917ef.webp","Delex":"obrazki/40c5466af2f5.png","Pablo":"obrazki/b6a728b14b8b.png","Europejczyk":"obrazki/ava-europejczyk.png","Eniki":"obrazki/ava-eniki.png","Ponczus":"obrazki/ava-ponczus.png","ke_Trab":"obrazki/ava-ke-trab.png","Miazga":"obrazki/ava-miazga.png","Tako":"obrazki/ava-tako.webp"};
const TRAITS=[
 {id:'mowca',n:'Mówca',cost:55,d:'Wiece i orędzia dają o 35% więcej sławy.'},
 {id:'negocjator',n:'Negocjator',cost:62,excl:['showman'],d:'+10 do skłonności partii w negocjacjach koalicyjnych, rozmowy kuluarowe o połowę skuteczniejsze.'},
 {id:'twardziel',n:'Twardziel',cost:48,d:'Wszystkie decyzje kosztują o 25% mniej energii.'},
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
    const a=wolni.find(x=>p.bank>=x.kp*2.2);
    if(!a)return;
    p.bank-=a.kp*2.2;G.agents[a.n]=k;
    p.comp[a.seg]++;p.mem++;
    if(!p.bench.includes(a.n)&&p.bench.length<10)p.bench.push(a.n);
    say(`<b>${p.ab} pozyskuje ${a.n}</b> (${sn(a.seg)}). Bezpartyjnych ubywa.`,'');
  });
}
const LP={
 PPP:{main:['Lager'],bench:['kenzo','bluetes33','Kocur','Antoniopl','x_avi','Garibaldi','Pablo']},
 KK:{main:['Peterdeus'],bench:['warrior','alan','Śledzik','Serty','Animu Player']},
 FD:{main:['loof'],bench:['Heraquik','Wiktor z Aeterny','Góra','Klabar','Bober','Oli','Mietek Nocul']},
 PLR:{main:['Sulejman','Aryati'],bench:['Prjonnek','balon']},
 // its.r3dz0l.eq przyszedł z rozwiązanej Chrześcijańskiej Partii Cesarskiej razem z mandatem
 NP:{main:['kisielek48'],bench:['Jugen','mentos','ekologiaball','Franzon','Prewencjusz','Silesia','its.r3dz0l.eq']},
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
 PPP :{n:'Partia Polskich Patriotów',ab:'PPP',c:'#237a3a',founded:'25.04.2025',pull:15.115,
   fame:78,cred:50,uni:40,act:35,ctr:35,pret:30,mem:41,pot:74,diff:1,
   aff:{eli:5,int:4,ser:7}, comp0:[1,7,33],
   blurb:'Największa partia serwera. 41 osób, sześć mandatów i lider, który nie odpisuje na DM.',
   flaw:'Lager ma wytrzymałość 30 i kompetencję 36, energia ledwo się odnawia, wiarygodność wycieka. Na ławce czekają kenzo i bluetes33.'},
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
   fame:58,cred:66,uni:70,act:68,ctr:22,pret:36,mem:21,pot:84,diff:1,
   aff:{eli:4,int:6,ser:6}, comp0:[0,4,17],
   blurb:'Siedem mandatów i fotel premiera na starcie. kisielek48 zbiera wokół siebie wszystkich, którzy nie chcą monarchistów.',
   flaw:'Brak wyrazistości: nie dominujesz żadnego segmentu, wszędzie jesteś druga. Rząd z ośmiu koalicjantów pęka od jednego złego tygodnia.'},
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
  d.setDate(d.getDate()+((G.term-1)*12+(G.week-1))*7);
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
  const d=new Date(a.from);let i=0;
  el.classList.add('ticking');el.textContent=dateStr(d);
  const iv=setInterval(()=>{
    i++;d.setDate(d.getDate()+1);el.textContent=dateStr(d);
    if(i>=7){clearInterval(iv);el.textContent=dateStr(a.to);
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
     king:{rel:52,paid:0}, sejmPrez:null, mar:null, goals:{}, agents:{}, agentWeek:null, sits:[], polls:[], scen:null, mute:false, night:null,
     prez:{party:'KK',lead:'Śledzik',until:2}, prezHist:[]};
  const used=PID.reduce((a,k)=>a+p[k].mem,0), fr=SERVER-used;
  G.free={eli:13,int:Math.round(fr*.24),ser:0};       // elita jest rzadkim towarem
  G.free.ser=fr-G.free.eli-G.free.int;
  G.mood={eli:1,int:1,ser:1};
  G.kapPryw={}; G.pkb=0; G.skarb=0;
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
  say('<b>Rząd zastany:</b> kisielek48 premierem, dziewięć partii, '+st+' z '+TOTAL_SEATS+' mandatów. Monarchiści po raz pierwszy poza gabinetem.','roy');
}
// mandat po rozwiązanej ChPC przeszedł razem z jej posłem do Nowej Perspektywy
/* Z PPP i z Kongresu Koronnego ludzie odeszli. Mandaty nie wyparowały: zabrał je
   sąsiad z tego samego obozu — republikański PKD i monarchistyczny ROM. Oba stoją
   poza gabinetem, więc rząd kisielka48 dalej ma równo 26 z 40. */
const START_SEATS={PPP:6,KK:3,ROM:2,FD:7,NP:8,PLR:3,PKD:2,PP:1,POJ:1,NBR:1,ZHM:1,DPD:4,SS:1};
function seedSeats(){
  // sejm zastany: rząd kisielka48 ma 26 z 40, monarchiści idą w opozycję
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
function regVotes(r){return r.pop*r.eng*G.turnout*(1+(G.gov?(G.gov.appr-50)/900:0))}
function moodOf(g){return (G.mood&&G.mood[g])||1}
/* Doganianie. Serwer nie lubi, gdy jedna partia zjada wszystko: część wyborców
   przenosi głos na tych z tyłu, żeby ktokolwiek jeszcze się liczył. Bez tego
   przegrany nie miał żadnej drogi powrotu, a wygrany tylko się rozpędzał. */
function doganianie(k){
  if(!G||!G.p[k])return 1;
  const zywe=alive().filter(x=>G.p[x].seats>0);
  if(zywe.length<3)return 1;
  const naj=Math.max(...zywe.map(x=>G.p[x].seats));
  if(naj<5)return 1;                       // przy rozdrobnionym sejmie nie ma kogo doganiać
  const luka=cl((naj-G.p[k].seats)/naj,0,1);
  return 1+luka*BAL.doganianieSila;
}
function score(k,r,s){
  const p=G.p[k]; if(p.dead)return 0;
  const a=p.aff[s.id]; if(a<=.05)return .0006;
  const ld=lead(k);
  let v=Math.pow(a,1.32)*p.pull;
  v*=(0.44+p.fame/135);
  v*=(0.64+p.cred/200);
  /* Jedność liczy się, ale przestaje być najważniejsza. Wcześniej rozpięta była
     od 0,46 do 1,33 — czyli mocniej niż sława i aktywność razem wzięte — więc
     wystarczyło pilnować jednego suwaka, żeby wygrywać wybory. Teraz waży mniej
     niż to, co partia realnie robi na serwerze. */
  v*=(BAL.jednoscBaza+p.uni/BAL.jednoscDzielnik);
  // aktywność waży więcej niż wcześniej: partia, która nic nie robi, ma to widzieć w sondażu
  v*=(0.38+p.act/100);
  v*=(0.52+ld.char/140);
  /* MOST MIĘDZY GOSPODARKĄ A POLITYKĄ.
     Media nie były do niczego politycznie potrzebne: kupowałeś je za prywatne
     pieniądze, zarabiały prywatne pieniądze i cała gospodarka kręciła się obok
     właściwej gry. Teraz zasięg wydawnictw wchodzi wprost do sondażu — kto ma
     gazetę, antenę i ekran, ten dociera do ludzi także wtedy, gdy nie zrobił
     w tym tygodniu nic innego. To jest realna przewaga za pieniądze, i tak samo
     realnie da się ją stracić razem z wydawnictwami. */
  v*=(1+zasiegMediow(k)/100);
  v*=(1+(p.mom||0)/150);
  v*=moodOf(s.id);
  v*=(1+(p.rally||0)*0.09+(p.laws||0)*0.03);
  v*=(1+((p.ctr-32)/100)*s.ctr);
  v*=(1+((p.pret-32)/135)*s.prt);
    const pv=p.pres[r.id]*(1-cl((p.pret-38)/150,0,.42));
  v*=Math.pow(cl(.34+pv/60,.34,2.7),1.32);
  if(p.marg)v*=.75;
  if(p.ctr>=90)v*=.5;   // paraliż kontrowersji: połowa poparcia znika
  v*=(1-znuzenie(k)/BAL.znuzenieSilaSondaz);   // zmęczenie władzą
  v*=doganianie(k);                            // głos protestu idzie do słabszych
  if(G.gov){const g=G.gov.parties.includes(k);
    v*= g?(1+(G.gov.appr-50)/150):(1-(G.gov.appr-50)/300)}
  if(G.prez&&G.prez.party===k)v*=BAL.prezydentSondaz;
  if(G.gov&&G.pmOk&&G.gov.pm===k)v*=BAL.premierSondaz;   // fotel premiera to najmocniejsza pozycja w grze
  if(G.gov&&!G.pmOk&&G.gov.parties.includes(k))v*=.93;
  return Math.max(.0006,v);
}
function tally(){
  const soft={},hw={},res={},rv={};
  PID.forEach(k=>{soft[k]={};hw[k]=0;res[k]={tot:0,reg:{}}});
  REG.forEach(r=>{
    rv[r.id]=regVotes(r);
    const sh={};let sum=0;
    PID.forEach(k=>{let s=0;SEG.forEach(g=>{s+=score(k,r,g)*r.mix[g.id]});sh[k]=s;sum+=s});
    PID.forEach(k=>{soft[k][r.id]=sum?sh[k]/sum:0; hw[k]+=soft[k][r.id]*rv[r.id]});
  });
  const HARD=BAL.udzialTwardego,hard={};
  PID.forEach(k=>{const c=G.p[k].comp;
    let m=1;   // urząd mobilizuje także twardy elektorat
    if(G.gov&&G.pmOk&&G.gov.pm===k)m*=BAL.premierGlosy;
    if(G.prez&&G.prez.party===k)m*=BAL.prezydentGlosy;
    if(G.gov&&G.gov.parties.includes(k)&&G.gov.pm!==k)m*=BAL.koalicjaGlosy;
    if(G.p[k].ctr>=90)m*=.5;   // paraliż kontrowersji zjada połowę twardego elektoratu
    m*=(1-znuzenie(k)/BAL.znuzenieSilaTwardy);    // zmęczenie władzą zniechęca nawet własnych
    /* Nawet własni ludzie muszą mieć po co wyjść do urn. Martwa partia nie dowozi
       swoich: wcześniej twardy elektorat zależał wyłącznie od liczby nazwisk, więc
       dało się nic nie robić przez całą kadencję i nie stracić ani punktu. */
    m*=cl(BAL.twardyAktywnosc+G.p[k].act/BAL.twardyAktywnoscDziel,.55,1.25);
    /* Malejące zwroty z wielkości. W małej partii pracuje przy wyborach praktycznie
       każdy; w wielkiej połowa nazwisk to martwe dusze, które nikogo nie przyprowadzą.
       Bez tego skład przekładał się na głosy wprost i partia, która raz urosła,
       nie miała już jak przegrać. */
    const surowy=c.eli*1.75+c.int*1.10+c.ser*.66;
    hard[k]=G.p[k].dead?0:Math.pow(surowy,BAL.wykladnikSkladu)*2.15*HARD*m});
  REG.forEach(r=>{
    const pool=rv[r.id];let hs=0;const h={};
    PID.forEach(k=>{h[k]=hw[k]>0?hard[k]*soft[k][r.id]*rv[r.id]/hw[k]:0;hs+=h[k]});
    let sc=1;if(hs>pool*.93)sc=pool*.93/hs;
    let left=pool;PID.forEach(k=>{h[k]*=sc;left-=h[k]});
    PID.forEach(k=>{const v=h[k]+left*soft[k][r.id];res[k].reg[r.id]=v;res[k].tot+=v});
  });
  const total=PID.reduce((a,k)=>a+res[k].tot,0);
  return {res,total,rv};
}
function lists(res,total){
  /* Próg liczy się od listy, nie od partii w środku. Na tym polega wspólna lista:
     kandydaci różnych partii idą pod jednym szyldem, wyborca głosuje na listę,
     a zdobyte mandaty dzieli się dopiero potem. Wcześniej partia musiała mieć
     jeszcze własne pięć procent, więc mniejszy koalicjant nie dostawał nic —
     wejście na listę zmieniało tylko próg i nie dawało w zamian niczego. */
  const pctOf={};
  alive().forEach(k=>{pctOf[k]=total>0?res[k].tot/total*100:0});
  const Ls=[],done=new Set();
  for(const c in CO()){
    const all=CO()[c].m.filter(k=>!G.p[k].dead);
    if(all.length<2)continue;
    all.forEach(k=>done.add(k));
    const blocPct=all.reduce((a,k)=>a+res[k].tot,0)/(total||1)*100;
    Ls.push({id:c,coal:true,m:all,all,n:all.length,
      tot:all.reduce((a,k)=>a+res[k].tot,0),blocPct,
      reg:Object.fromEntries(REG.map(r=>[r.id,all.reduce((a,k)=>a+res[k].reg[r.id],0)]))});
  }
  alive().forEach(k=>{if(!done.has(k))Ls.push({id:k,coal:false,m:[k],all:[k],n:1,tot:res[k].tot,
    blocPct:pctOf[k],reg:Object.fromEntries(REG.map(r=>[r.id,res[k].reg[r.id]]))})});
  Ls.forEach(l=>{
    l.pct=l.blocPct;                                       // wynik całej listy
    l.thr=thrFor(l.n);
    l.in = l.blocPct>=l.thr && l.tot>0;
  });
  /* Klauzula ratunkowa. Sejm może sobie ustawą podnieść próg, a przy kilkunastu
     partiach da się go ustawić tak, że nie przeskakuje go nikt. Wtedy nie ma
     posłów, nie ma kogo zgłosić na premiera i rozgrywka staje. W takim wypadku
     próg ustępuje: wchodzą dwie najsilniejsze listy, jak w każdej ordynacji,
     która przewiduje, co robić, gdy próg wytnie wszystkich. */
  const weszly=Ls.filter(l=>l.in).length;
  if(weszly<Math.min(2,Ls.length)){
    Ls.filter(l=>l.tot>0).sort((a,b)=>b.blocPct-a.blocPct)
      .slice(0,2).forEach(l=>l.in=true);
  }
  return Ls;
}
function allocate(res,total){
  const Ls=lists(res,total),run=Ls.filter(l=>l.in);
  const out=Object.fromEntries(PID.map(k=>[k,0])),byReg={};
  REG.forEach(r=>{
    const s=run.map(l=>({l,v:l.reg[r.id],s:0}));
    for(let i=0;i<r.seats;i++){let b=null,q=-1;
      s.forEach(x=>{const t=x.v/(x.s+1);if(t>q){q=t;b=x}});if(!b)break;b.s++}
    byReg[r.id]={};
    s.forEach(x=>{
      if(!x.s)return;
      if(!x.l.coal){out[x.l.id]+=x.s;byReg[r.id][x.l.id]=x.s;return}
      const sub=x.l.m.map(k=>({k,v:res[k].reg[r.id]}));
      const sv=sub.reduce((a,y)=>a+y.v,0)||1;let left=x.s;
      sub.forEach(y=>{y.e=y.v/sv*x.s;y.s=Math.floor(y.e);left-=y.s});
      sub.sort((a,b)=>(b.e-b.s)-(a.e-a.s));
      for(let i=0;i<left;i++)sub[i%sub.length].s++;
      sub.forEach(y=>{if(y.s){out[y.k]+=y.s;byReg[r.id][y.k]=(byReg[r.id][y.k]||0)+y.s}});
    });
  });
  // mandaty wyrównawcze: liczone per partia, tylko dodają, koncentracja w okręgu zawsze się opłaca
  const inRun=new Set();run.forEach(l=>l.m.forEach(k=>inRun.add(k)));
  PID.forEach(k=>{if(!inRun.has(k))out[k]=0});   // nikt poniżej progu nie zostaje z mandatem
  const vTot=[...inRun].reduce((a,k)=>a+res[k].tot,0)||1;
  const topup={};
  for(let i=0;i<TOPUP;i++){
    let b=null,bd=-1e9;
    inRun.forEach(k=>{
      const ideal=res[k].tot/vTot*TOTAL_SEATS;
      const d=ideal-(out[k]+(topup[k]||0))+res[k].tot/vTot*.08;
      if(d>bd){bd=d;b=k}});
    if(!b)break;
    out[b]++;topup[b]=(topup[b]||0)+1;
  }
  return {out,L:Ls,byReg,topup};
}
function leader(rid,res){let b=null,v=-1;alive().forEach(k=>{if(res[k].reg[rid]>v){v=res[k].reg[rid];b=k}});return b}

/* ══════════ GŁOSOWANIA W SEJMIE ══════════ */
function ideo(a,b){let s=0;SID.forEach(x=>{const d=G.p[a].aff[x]-G.p[b].aff[x];s+=d*d});return Math.sqrt(s)}
/* kind: 'pm' | 'wotum' | 'minister' | 'ustawa' */
function stance(k,kind,tgt,pro){
  const p=G.p[k];
  const relPro=k===pro?100:G.rel[k][pro];
  const dist=k===pro?0:ideo(k,pro);
  if(kind==='depcount'){
    // formalna decyzja proceduralna, mniej wicemarszałków łatwiej przechodzi
    return R(-12,18)+(tgt==='c1'?16:0);
  }
  if(kind==='pm'){
    if(k===tgt)return 100;
    // kto podpisał umowę koalicyjną, ten głosuje na jej premiera
    if(G.gov&&G.gov.parties.includes(k)&&tgt===G.gov.pm)return 96;
    let v=relPro*.9-dist*2.4+18;
    if(G.gov&&G.gov.parties.includes(k)&&G.gov.parties.includes(tgt))v+=44;
    if(G.prez&&G.prez.party===k&&G.prez.party!==tgt)v-=10;
    v+=(lead(tgt).komp-52)*.5;
    return v;
  }
  if(kind==='wotum'){
    if(!G.gov)return -100;
    if(G.gov.parties.includes(k))return k===G.gov.pm?-100:-40+(50-G.gov.appr)*.5;
    return 26+(50-G.gov.appr)*.8+relPro*.4-dist*1.2;
  }
  if(kind==='rozwiazanie'){
    // Nikt nie oddaje własnego mandatu z ochotą: nawet opozycja waha się tym mocniej,
    // im więcej ma do stracenia. Rząd jest przeciw z zasady.
    if(G.gov&&G.gov.parties.includes(k))return -85;
    const traci=p.seats/Math.max(1,TOTAL_SEATS)*100;
    return 4+(50-(G.gov?G.gov.appr:50))*.62+relPro*.32-dist*1.1-traci*1.5+(p.mom||0)*.28;
  }
  if(kind==='minister'){
    if(k===tgt)return -100;
    if(G.gov&&G.gov.parties.includes(k))return G.rel[k][tgt]<0?30:-25;
    return 20+relPro*.35-G.rel[k][tgt]*.4;
  }
  return relPro*.6-dist*1.5+10;
}
function sejmVote(kind,tgt,pro,myVote){
  const by={};let yes=0,no=0,abst=0;const bribed=[];
  /* Dyscyplina koalicyjna przy wyborze premiera. Koalicja zawiązuje się wokół
     konkretnego obozu, więc jej członkowie popierają kandydata z własnych szeregów,
     a przeciw komuś spoza niego głosują. Bez tej reguły dało się zebrać koalicję,
     patrzeć, jak Król desygnuje kogoś zupełnie obcego, i widzieć własnych
     koalicjantów głosujących za nim jak gdyby nigdy nic. */
  const wKoalicji=k=>!!(G.gov&&G.gov.parties&&G.gov.parties.includes(k));
  const dyscyplina=k=>(kind!=='pm'||!wKoalicji(k))?0:(wKoalicji(tgt)?70:-70);
  // opozycja wykłada kapitał, żeby oderwać koalicjanta od głosowania
  const opoPow=(kind==='pm')&&G.gov&&G.term>1
    ? alive().filter(x=>!G.gov.parties.includes(x)&&G.p[x].seats>0)
        .reduce((a,x)=>a+G.p[x].seats*(0.4+G.p[x].cred/200),0)/TOTAL_SEATS : 0;
  alive().forEach(k=>{
    const s=G.p[k].seats; if(!s)return;
    let v;
    if(k===G.me&&myVote!==undefined)v=myVote;
    else if(opoPow>0&&G.gov&&G.gov.parties.includes(k)&&G.gov.parties.includes(tgt)&&k!==tgt&&k!==G.me){
      const key=k+'|'+tgt;
      if(!G.bribeCache)G.bribeCache={};
      if(G.bribeCache[key]===undefined){
        const loj=cl(G.rel[k][tgt]/110+.34,0,1);
        G.bribeCache[key]=ch(cl(opoPow*.55-loj*.42,0,.20));
      }
      if(G.bribeCache[key]){v=-1;bribed.push(k)}
      else{const x=stance(k,kind,tgt,pro)+R(-14,14)+dyscyplina(k);v=x>4?1:x<-16?-1:0}
    }
    else{
      const press=(kind==='pm'&&G.pmProc)?(G.pmProc.round-1)*9:0;
      let x=stance(k,kind,tgt,pro)+R(-14,14)+press+dyscyplina(k);
      // opozycja głosuje twardo przeciw wszystkiemu, co idzie od rządu
      if(G.gov&&!G.gov.parties.includes(k)&&(G.gov.parties.includes(tgt)||tgt===pro&&G.gov.parties.includes(pro)))x-=40;
      const hi=kind==='pm'?4:14, lo=kind==='pm'?-16:-8;
      v=x>hi?1:x<lo?-1:0}
    by[k]=v; if(v>0)yes+=s; else if(v<0)no+=s; else abst+=s;
  });
  return {yes,no,abst,by,bribed,pass:(kind==='pm')?(yes>=MAJ):(yes>no)};
}

/* ══════════ AKCJE ══════════ */
/* Zmęczenie decyzją. Ta sama zagrywka powtarzana w kółko przestaje działać
   znacznie szybciej niż kiedyś — samo klikanie w to samo nie buduje już poparcia. */
function fat(id){return Math.max(BAL.zmeczenieDno,1-BAL.zmeczenieKrok*(G.used[id]||0))}
function sizeF(p){ // im większa partia, tym drożej się nią rusza: decyzja to koszt dla całej struktury
  const kp=Math.round(cl(.38+p.mem*.031,.38,2.7)*100)/100;
  if(p.mem<8) return {kp,fame:1.60,en:.72,lab:'zwinność kanapowej partii'};
  if(p.mem<15)return {kp,fame:1.42,en:.82,lab:'zwinność małej partii'};
  if(p.mem<26)return {kp,fame:1.16,en:.93,lab:''};
  if(p.mem>46)return {kp,fame:.80,en:1.22,lab:'inercja dużej partii'};
  return {kp,fame:1,en:1,lab:''};
}
const A=[
/* --- kampania --- */
{id:'wiec',cat:'kam',n:'Wiec w kanale',ap:1,kp:6,en:8,reg:1,tem:1,
 d:'Wybierasz kanał i temat wystąpienia. Trafiony temat porywa okręg, nietrafiony potrafi go zrazić.',
 f:(p,f,_,r,__,t)=>{
   const rg=REG.find(x=>x.id===r),tm=TEM.find(x=>x.id===t)||TEM[0];
   let m=0;SID.forEach(s=>m+=rg.mix[s]*(tm.w[s]||0));
   const roll=m*2.2+R(-.55,.55)+lead(G.me).char/220-.25;
   SID.forEach(s=>{if(tm.w[s])p.aff[s]=Math.max(.1,p.aff[s]+tm.w[s]*.09*f)});
   // wiec buduje obecność i sławę, nie jedność — od zgody w partii jest co innego
   if(roll>.85){M(p,8);p.pres[r]=cl(p.pres[r]+46*f);p.fame=cl(p.fame+R(5,8)*f);p.act=cl(p.act+4);
     return `<b>Owacja.</b> „${tm.n}” w ${rg.n} trafiło idealnie. Obecność +${Math.round(30*f)}.`}
   if(roll>.25){p.pres[r]=cl(p.pres[r]+25*f);p.fame=cl(p.fame+R(1.5,3)*f);p.act=cl(p.act+3);
     return `Przyzwoicie. „${tm.n}” w ${rg.n} przeszło bez emocji. Obecność +${Math.round(18*f)}.`}
   if(roll>-.5){p.pres[r]=cl(p.pres[r]+6*f);p.fame=cl(p.fame+.5);
     return `Letnio. W ${rg.n} nikt się tym tematem nie przejął.`}
   M(p,-7);p.pres[r]=cl(p.pres[r]-9);p.fame=cl(p.fame-3);p.ctr=cl(p.ctr+6);
   return `<b>Wygwizdany.</b> „${tm.n}” to było ostatnie, co ${rg.n} chciało usłyszeć. Obecność −9.`}},
{id:'kanwas',cat:'kam',n:'Kanwasing',ap:1,kp:11,en:12,reg:1,
 d:'Prywatne DM-y do userów z kanału. Męczące, ale najpewniejsze na obecność.',
 f:(p,f,_,r)=>{p.pres[r]=cl(p.pres[r]+44*f);p.act=cl(p.act+2);
   return `Obecność w <b>${rn(r)}</b> +${Math.round(44*f)}.`}},
{id:'spot',cat:'kam',n:'Spot wyborczy',ap:1,kp:22,en:9,
 d:'Emitowany wyłącznie w #kanał_eventowy, tam trafia zawsze i mocno. Do pozostałych okręgów przenika tylko czasem i słabiej. Wymaga wiarygodności, inaczej wyjdzie cringe.',
 f:(p,f)=>{if(ch(cl(.55-p.cred/160,.06,.5))){p.fame=cl(p.fame+2);p.ctr=cl(p.ctr+9);p.cred=cl(p.cred-4);
   return `Spot uznano za <b>cringe</b>. Krąży, ale jako mem.`}
  const g=R(8,14)*f;M(p,9);p.fame=cl(p.fame+g);p.cred=cl(p.cred+2);p.uni=cl(p.uni+4);
  p.pres.event=cl(p.pres.event+34*f);
  let ile=0;
  REG.filter(r=>r.id!=='event').forEach(r=>{if(ch(.45)){p.pres[r.id]=cl(p.pres[r.id]+R(5,11)*f);ile++}});
  return `Spot chwycił. <b>Sława +${fmt(g)}</b>, obecność w #kanał_eventowy +${Math.round(34*f)}${ile?`, przeniknął też do ${ile} ${pl(ile,'innego okręgu','innych okręgów','innych okręgów')}`:', ale nigdzie indziej go nie zauważono'}.`}},
{id:'debata',cat:'kam',n:'Debata z rywalem',ap:2,kp:0,en:15,tgt:1,term1:1,
 d:'Pojedynek liderów, raz na kadencję. O wyniku decydują kompetencja i charyzma, nie program, ale wynik bywa niespodzianką, a wygrana nie zawsze daje autorytet.',
 f:(p,f,t)=>{const o=G.p[t],a=lead(G.me),b=lead(t);
  const dbBoost=n=>n==='loof'?(goalDone('demokraci')?0:20):n==='Aryati'?12:n==='Śledzik'?-14:0;
  const dbBoost2=q=>leads(q).reduce((a,n)=>a+dbBoost(n),0);
  const x=p.cred*.2+p.uni*.1+a.komp*.45+a.char*.25+R(-22,22)+dbBoost2(p);
  const y=o.cred*.2+o.uni*.1+b.komp*.45+b.char*.25+R(-22,22)+dbBoost2(o);
  G.rel[G.me][t]=cl(G.rel[G.me][t]-9,-100,100);
  if(x>y){M(p,11);M(o,-7);XP(14);const zysk=ch(.6);if(zysk)gainAutor(p.lead,RI(1,2));
   if(isLead(p,'Aryati')){p.ctr=cl(p.ctr+7);p.pret=cl(p.pret+5)}
   if(ch(.12)){p.flow.eli+=1;var zdob='<b>elitę</b>'} else {p.flow.int+=1;var zdob='<b>intelektualistę</b>'}p.fame=cl(p.fame+R(7,12)*f);p.cred=cl(p.cred+5);o.fame=cl(o.fame-5);o.cred=cl(o.cred-4);
   const autInfo=zysk?', autorytet w górę':`, ale bez wzrostu autorytetu, ${o.lead} zdążył się obronić`;
   if(p.marg){p.marg=0;return `<b>${p.lead} rozjeżdża ${o.lead}.</b> Przestano cię ignorować${autInfo}, a ${zdob} dołączy przy rozliczeniu kadencji.`}
   return `<b>${p.lead} wygrywa</b> z ${o.lead} (${o.ab}). Doświadczenie +14${autInfo}, a przy rozliczeniu kadencji dołączy ${zdob}.`}
  M(p,-9);M(o,6);p.fame=cl(p.fame-3);p.cred=cl(p.cred-7);o.fame=cl(o.fame+5);
  return `<b>${o.lead} rozjeżdża ${p.lead}</b> w debacie.`}},
{id:'memy',cat:'kam',n:'Zalew memami',ap:1,kp:1,en:3,reg:1,
 d:'Tanie i skuteczne w kanałach memiarskich. Weterani kręcą nosem.',
 f:(p,f,_,r)=>{p.fame=cl(p.fame+R(3,5.5)*f);p.ctr=cl(p.ctr+7);p.cred=cl(p.cred-3.5);
  p.pret=cl(p.pret-4);p.aff.ser+=.45*f;p.pres[r]=cl(p.pres[r]+20*f);
  const nap=RI(2,4);p.flow.ser+=nap;
  return `Kanał <b>${rn(r)}</b> zalany. <b>${nap} ${pl(nap,'serwerowicz','serwerowiczów','serwerowiczów')}</b> dołączy przy rozliczeniu kadencji.`}},
{id:'manifest',cat:'kam',n:'Manifest programowy',ap:2,kp:20,en:15,tem:1,
 d:'Wybierasz oś programową. Trwale przesuwa partię w stronę wybranej grupy.',
 f:(p,f,_,__,___,t)=>{const tm=TEM.find(x=>x.id===t)||TEM[0];
  SID.forEach(s=>{if(tm.w[s])p.aff[s]=Math.max(.1,p.aff[s]+tm.w[s]*.26*f)});
  p.cred=cl(p.cred+R(8,12)*f);p.fame=cl(p.fame+4*f);p.pret=cl(p.pret+6);M(p,6);
  return `Manifest: „${tm.n}”. Program przesunięty, wiarygodność w górę.`}},
/* --- organizacja --- */
{id:'rekr',cat:'org',n:'Nabór do partii',ap:1,kp:18,en:11,reg:1,
 d:'Piszesz ogłoszenie werbunkowe. Treść jest oceniana, banał nie przyciągnie nikogo. Raz na 6 tygodni, maksymalnie 2 osoby.',
 f:(p,f,_,r)=>{openRecruit(r);return null}},
{id:'trening',cat:'org',n:'Praca nad wizerunkiem lidera',ap:2,kp:30,en:15,
 d:'Podnosisz jedną z trzech cech przewodniczącego: charyzmę, kompetencję albo wytrzymałość. Powyżej 80 postępy są coraz mniejsze. Autorytetu tak nie podciągniesz, ten trzeba wywalczyć w debatach i wyborach.',
 f:()=>{openTrain();return null}},
{id:'szkol',cat:'org',n:'Szkolenie kadr',ap:1,kp:13,en:7,
 d:'Aktywność i jedność w górę, a jedna osoba z zaplecza (albo sam przewodniczący) dostaje +1 do losowej cechy (charyzma, kompetencja albo wytrzymałość). Tylko jedna i tylko o jeden, ale to się kumuluje.',
 f:(p,f)=>{p.act=cl(p.act+R(6,10)*f);p.cred=cl(p.cred+3);p.ctr=cl(p.ctr-3);
  const pool=[...new Set(p.bench.concat([p.lead]))];
  const who=pick(pool), i=RI(0,2), nm=['charyzmę','kompetencję','wytrzymałość'][i];
  const cur=L(who);
  if(cur[['char','komp','wytrz'][i]]>=99)return `Kadry przeszkolone, ale ${who} nie ma się już czego uczyć.`;
  if(!G.lup[who])G.lup[who]=[0,0,0,0];
  G.lup[who][i]+=1;
  return `Kadry przeszkolone. <b>${who}</b> podnosi ${nm} do ${L(who)[['char','komp','wytrz'][i]]}.`}},
{id:'statut',cat:'org',n:'Reforma statutu',ap:2,kp:16,en:11,
 d:'Porządkujesz struktury. Przy niskiej jedności to zaproszenie do rozłamu.',
 f:(p,f)=>{if(p.uni<40&&ch(.42)){const q=giveBackCap(p,Math.max(1,Math.round(p.mem*.16)));const l=q.eli+q.int+q.ser;p.uni=cl(p.uni-6);
   return `Reforma <b>wywołała rozłam</b>. Odchodzi ${l} ${pl(l,'osoba','osoby','osób')}.`}
  const g=R(8,13)*f;p.cred=cl(p.cred+5*f);p.pret=cl(p.pret-4);return `Statut przyjęty. <b>Wiarygodność +${Math.round(g*.6)}</b>, mniej pretensjonalnie.`}},
{id:'czyst',cat:'org',n:'Czystka w partii',ap:2,kp:0,en:16,
 d:'Jedność mocno w górę kosztem 10–22% składu. Pamiętaj, że liczba osób przekłada się wprost na głosy, to najdroższa jedność w grze.',
 f:(p,f)=>{const q=giveBackCap(p,Math.max(1,Math.round(p.mem*R(.10,.22))));const l=q.eli+q.int+q.ser;
  p.ctr=cl(p.ctr+10);p.cred=cl(p.cred-5);p.act=cl(p.act+R(4,8));p.uni=cl(p.uni+R(12,19)*f);
  return `Wylatuje <b>${l} ${pl(l,'osoba','osoby','osób')}</b>, reszta trzyma szyk.`}},
{id:'zjazd',cat:'org',n:'Zjazd partii',ap:2,kp:105,en:26,term1:1,
 d:'Najdroższa decyzja w grze i tylko raz na kadencję. Poza sławą, jednością i obecnością wszędzie daje trwałą przewagę wyborczą +9% do wyborów.',
 f:(p,f)=>{M(p,22);p.fame=cl(p.fame+R(12,19)*f);p.act=cl(p.act+18*f);p.cred=cl(p.cred+8);
  p.uni=cl(p.uni+R(9,15)*f);
  REG.forEach(r=>p.pres[r.id]=cl(p.pres[r.id]+20));
  p.rally=Math.min(2,(p.rally||0)+1);
  return `<b>Zjazd</b> przeszedł do serwerowej legendy. Przewaga wyborcza +${p.rally*9}% do końca kadencji.`}},

/* --- dyplomacja --- */
{id:'wywiad',cat:'dyp',n:'Wywiad dla serwerowego medium',ap:1,kp:6,en:9,
 d:'Trzy pytania na żywo. Nie ma odpowiedzi dobrych zawsze — liczy się to, w jakiej sytuacji jest twoja partia. Wyjdziesz z tego ze sławą i wiarygodnością albo z aferą.',
 f:()=>{openWywiad();return null}},
{id:'kulisy',cat:'dyp',n:'Rozmowy kuluarowe',ap:1,kp:14,en:7,tgt:1,
 d:'Prywatny kanał, dwie osoby, żadnych świadków. Najpewniejszy sposób na odbudowę relacji.',
 f:(p,f,t)=>{const dm={'Mietek Nocul':1.45,'kenzo':.40,'Kaziu':.55,'Bartek':1.06}[p.lead]||1;
  const g=Math.round(R(14,24)*(0.75+lead(G.me).komp/200)*(hasT('negocjator')?1.5:1)*dm);
  G.rel[G.me][t]=cl(G.rel[G.me][t]+g,-100,100);G.rel[t][G.me]=cl(G.rel[t][G.me]+g,-100,100);
  return `Relacje z <b>${G.p[t].ab}</b> +${g} (teraz ${Math.round(G.rel[G.me][t])}).`}},
{id:'zarob',cat:'org',n:'Zarób kapitał prywatny',ap:0,kp:0,en:22,
 d:'Przewodniczący odpuszcza politykę na tydzień i zajmuje się własnym interesem. Partia nie zyskuje na tym nic — ani sławy, ani jedności — ale w kieszeni robi się grubiej. Nie kosztuje akcji, bo to jego prywatna sprawa, za to zjada sporo energii. Ile dokładnie wpadnie, zależy od pozycji, rangi i tego, jak akurat stoi gospodarka.',
 f:(p,f)=>{
   const szef=p.lead;
   /* Zarobek jest tu wyraźnie inny niż tygodniowy: to jednorazowy strzał
      z szerokim rozrzutem, więc raz wyjdzie z tego grosz, a raz krocie. */
   const baza=zarobekLidera(G.me);
   const los=R(.6,3.4)*f;
   const kwota=Math.max(20e3,Math.round(baza*los));
   G.kapPryw[szef]=(G.kapPryw[szef]!==undefined?G.kapPryw[szef]:kapPryw(szef))+kwota;
   sprawdzRangi();
   const jak=los>2.6?'Tydzień, o jakim się marzy.':los>1.6?'Poszło lepiej, niż zakładał.'
     :los>1?'Zwyczajnie, ale uczciwie.':'Zeszło się na niczym.';
   return `${jak} <b>${szef}</b> zarobił <b>${kasaSkrot(kwota)}</b> do własnej kieszeni.`
     +` Partia z tego nie ma nic.`}},
{id:'zrzutka',cat:'org',n:'Zrzutka z prywatnych kieszeni',ap:0,kp:0,en:20,
 d:'Prosisz kogoś ze swojego zaplecza, żeby wyłożył własne pieniądze na partię. Milion prywatnego majątku to jeden punkt kapitału. Nikt nie robi tego z radości: jedność leci w dół, a ten, kogo wydoisz, odchodzi z partii z pretensjami. Im więcej bierzesz, tym gorzej to wygląda.',
 f:()=>{openZrzutka();return null}},
{id:'werb',cat:'dyp',n:'Werbunek działacza',ap:2,kp:22,en:14,
 d:'Dzwonisz do konkretnej osoby z cudzej partii i próbujesz ją przeciągnąć. Ludzie rzadko zmieniają barwy, więc szanse są niskie: liczy się relacja z jej partią, twoja wielkość, twoja kontrowersja i pretensjonalność. Przewodniczącego ściągniesz tylko w wyjątkowych okolicznościach.',
 f:()=>{openWerb();return null}},
{id:'przekw',cat:'prm',n:'Przekwalifikowanie działacza',ap:1,kp:12,en:8,
 d:'Szkoła kadr LSD: bierzesz jednego serwerowicza, dajesz mu do przeczytania statut i wypuszczasz jako intelektualistę. Jedna osoba na decyzję.',
 f:(p)=>{if(p.comp.ser<1)return 'Nie ma już kogo przekwalifikować, w partii nie został ani jeden serwerowicz.';
  p.comp.ser--;p.comp.int++;
  p.cred=cl(p.cred+2);p.pret=cl(p.pret+2);p.aff.int+=.2;p.aff.ser=Math.max(.1,p.aff.ser-.15);
  return `Jeden serwerowicz kończy szkołę kadr. <b>Skład: ${p.comp.eli} elity, ${p.comp.int} intelektualistów, ${p.comp.ser} serwerowiczów.</b>`}},
{id:'kampania_prm',cat:'prm',n:'Kurs dla całego zaplecza',ap:2,kp:30,en:16,
 d:'Zamiast jednej osoby przepuszczasz przez szkołę kadr trzech naraz. Drożej, ale za jedną akcję.',
 f:(p)=>{let n=0;for(let i=0;i<3&&p.comp.ser>0;i++){p.comp.ser--;p.comp.int++;n++}
  if(!n)return 'Nie ma kogo szkolić.';
  p.cred=cl(p.cred+4);p.pret=cl(p.pret+4);p.aff.int+=.4;
  return `<b>${n} ${pl(n,'osoba przechodzi','osoby przechodzą','osób przechodzi')}</b> z serwerowiczów na intelektualistów.`}},
{id:'luz',cat:'kam',n:'Luźny stream z liderem',ap:1,kp:8,en:9,
 d:'Dwie godziny gadania o niczym na kanale głosowym. Zbija pretensjonalność najmocniej w grze, przy okazji dorzuca trochę sławy.',
 f:(p,f)=>{const d=R(11,17)*f;p.pret=cl(p.pret-d);p.fame=cl(p.fame+R(3,6)*f);p.aff.ser+=.35;
  p.cred=cl(p.cred-2);
  return `Serwer usłyszał normalnego człowieka. <b>Pretensjonalność −${Math.round(d)}</b>.`}},
{id:'konsult',cat:'org',n:'Otwarte konsultacje z serwerem',ap:1,kp:10,en:8,
 d:'Otwierasz kanał, w którym każdy może wejść i powiedzieć, co jest nie tak z partią. Pretensjonalność i kontrowersja w dół, aktywność w górę.',
 f:(p,f)=>{const d=R(8,13)*f;p.pret=cl(p.pret-d);p.ctr=cl(p.ctr-R(4,7));p.act=cl(p.act+R(5,9)*f);
  p.cred=cl(p.cred+3);p.aff.ser+=.25;
  return `Wysłuchaliście serwera. <b>Pretensjonalność −${Math.round(d)}</b>, kontrowersja też w dół.`}},
{id:'przepr',cat:'dyp',n:'Publiczne przeprosiny',ap:1,kp:4,en:9,tgt:1,shame:1,
 d:'Odblokowane tylko po wpadce, nieudanym sabotażu, przyłapaniu na aferze albo doniesieniu. Kosztuje sławę i dumę, ale wyciąga relację z najgłębszego dołka.',
 f:(p,f,t)=>{const cur=G.rel[G.me][t];
  const g=Math.round((cur<-20?R(30,44):R(16,25))*({'Mietek Nocul':1.45,'kenzo':.40,'Kaziu':.55}[p.lead]||1));
  G.rel[G.me][t]=cl(cur+g,-100,100);G.rel[t][G.me]=cl(G.rel[t][G.me]+g,-100,100);
  p.fame=cl(p.fame-3);p.cred=cl(p.cred+2);M(p,-3);
  return `Przeprosiny przyjęte. Relacje z <b>${G.p[t].ab}</b> ${Math.round(cur)} → ${Math.round(G.rel[G.me][t])}.`}},
{id:'podkup',cat:'bru',n:'Przekupienie działacza',ap:1,kp:0,en:9,tgt:1,
 d:'Wybierasz konkretną osobę z cudzego zaplecza i płacisz jej cenę — kto lepszy, ten droższy. Żadnego losowania: albo cię stać, albo nie. Przewodniczącego nie kupisz, a serwer i tak się dowie.',
 f:(p,f,t)=>{openPrzekup(t);return null}},
/* --- brudne --- */
/* Donos do administracji: jedyna decyzja w grze, która potrafi skasować cudzą
   partię z serwera. Dlatego jest wyłącznie w rękach gracza (boty jej nie mają),
   raz na kadencję i z szansą jak jeden do dziesięciu. Dziewięć razy na dziesięć
   zostaje po niej tylko to, że wszyscy wiedzą, kto doniósł. */
{id:'admin',cat:'bru',n:'Doniesienie do administracji',ap:2,kp:22,en:16,tgt:1,term1:1,
 d:'Zgłaszasz partię administracji serwera. Szansa na jej rozwiązanie to 10%. Jeśli się nie uda — a zwykle się nie udaje — zostajesz z ogromną kontrowersją i opinią donosiciela. Raz na kadencję.',
 f:(p,f,t)=>{const o=G.p[t];
  if(ch(.10)){
    o.dead=1;o.seats=0;
    // ludzie rozwiązanej partii wracają do puli bezpartyjnych
    G.free.eli=(G.free.eli||0)+o.comp.eli;G.free.int=(G.free.int||0)+o.comp.int;G.free.ser=(G.free.ser||0)+o.comp.ser;
    o.comp={eli:0,int:0,ser:0};o.mem=0;
    if(G.gov&&G.gov.parties.includes(t))govLeave(t);
    p.ctr=cl(p.ctr+26);p.cred=cl(p.cred-10);M(p,10);
    alive().forEach(k=>{if(k===G.me)return;G.rel[k][G.me]=cl(G.rel[k][G.me]-18,-100,100)});
    say(`<b>Administracja rozwiązuje ${o.n}.</b> Kanał zarchiwizowany, rola usunięta. Serwer wie, kto to zgłosił.`,'roy');
    return `<b>${o.ab} znika z serwera.</b> Kontrowersja +26, a reszta sceny patrzy na ciebie inaczej.`}
  p.ctr=cl(p.ctr+34);p.cred=cl(p.cred-14);p.fame=cl(p.fame-6);M(p,-16);
  G.shame=G.week+6;
  G.rel[G.me][t]=cl(G.rel[G.me][t]-40,-100,100);G.rel[t][G.me]=cl(G.rel[t][G.me]-40,-100,100);
  alive().forEach(k=>{if(k===G.me||k===t)return;G.rel[k][G.me]=cl(G.rel[k][G.me]-12,-100,100)});
  return `<b>Administracja odrzuciła zgłoszenie</b>, ale wyciekło, kto je złożył. Kontrowersja +34, wszyscy patrzą krzywo.`}},
/* --- program --- */
/* Dział „Program" wypadł z gry. Trzy decyzje przestawiające elektorat poszły
   razem z nim, ale wyciszenie sporu i zejście na ziemię zostają — bez nich
   z wysokiej kontrowersji i pretensjonalności nie dałoby się zejść w ogóle,
   a paraliż przy 90 byłby ślepą uliczką. Siedzą teraz w Organizacji. */
{id:'chlodzenie',cat:'org',n:'Wyciszenie sporu',ap:1,kp:12,en:9,
 d:'Wycofujesz się z awantur, kasujesz najgorsze posty, przepraszasz za ton. Kontrowersja spada o 8–13, powoli, ale to jedyny sposób, żeby zejść z linii ognia. Kosztuje trochę sławy.',
 f:(p,f)=>{const d=R(8,13)*Math.max(.55,f);
  p.ctr=cl(p.ctr-d);p.fame=cl(p.fame-R(1.5,3));p.cred=cl(p.cred+2);
  return `Spór wyciszony. <b>Kontrowersja −${Math.round(d)}</b> (teraz ${Math.round(p.ctr)}).`}},
{id:'depret',cat:'org',n:'Zejście na ziemię',ap:1,kp:6,en:7,
 d:'Mniej manifestów, więcej normalnej gadki. Zbija pretensjonalność.',
 f:(p,f)=>{const d=R(9,15)*f;p.pret=cl(p.pret-d);p.cred=cl(p.cred-1.5);p.aff.ser+=.3;p.aff.ser+=.25;
  return `Ton złagodzony. <b>Pretensjonalność −${Math.round(d)}</b>.`}},
/* --- rząd (koalicja) --- */
{id:'ustawa',cat:'wla',n:'Projekt ustawy',ap:2,kp:10,en:11,gov:1,pm:0,tem:1,
 d:'Wybierasz temat i poddajesz go pod głosowanie sejmu. Przegrana ustawa boli podwójnie.',
 f:(p,f,_,__,___,t)=>{const tm=TEM.find(x=>x.id===t)||TEM[0];
  const v=sejmVote('ustawa',G.me,G.me);
  if(v.pass){SID.forEach(s=>{if(tm.w[s])p.aff[s]=Math.max(.1,p.aff[s]+tm.w[s]*.18)});
   if(G.gov)APPR(+RI(2,6));p.cred=cl(p.cred+4);
   return `Ustawa „${tm.n}” <b>przeszła</b> ${v.yes}:${v.no}.`}
  p.cred=cl(p.cred-5);if(G.gov)APPR(-5);
  return `Ustawa „${tm.n}” <b>odrzucona</b> ${v.yes}:${v.no}. Kompromitacja.`}},
/* --- premier: reszta jego narzędzi siedzi w dziale Premiera, nie w decyzjach --- */
{id:'oredzie',cat:'prem',n:'Orędzie premiera',ap:1,kp:8,en:9,pm:1,tem:1,term1:1,
 d:'Raz na kadencję. Wystąpienie do całego serwera, temat decyduje, kto klaszcze.',
 f:(p,f,_,__,___,t)=>{const tm=TEM.find(x=>x.id===t)||TEM[0];
  let m=0;REG.forEach(r=>{let x=0;SID.forEach(s=>x+=r.mix[s]*(tm.w[s]||0));m+=x*regVotes(r)});
  m/=REG.reduce((a,r)=>a+regVotes(r),0);
  const roll=m*2+lead(G.me).char/200-.3;
  SID.forEach(s=>{if(tm.w[s])p.aff[s]=Math.max(.1,p.aff[s]+tm.w[s]*.12)});
  const om=hasLsd(G.me)?2.2:1;
  REG.forEach(r=>p.pres[r.id]=cl(p.pres[r.id]+(roll>.4?9:4)*om));
  if(hasLsd(G.me)){p.rally=(p.rally||0)+2;p.fame=cl(p.fame+4)}
  G.useTerm.oredzie=1;
  if(roll>.4){p.fame=cl(p.fame+R(6,10));APPR(+RI(4,10));M(p,6);
   const g=drawFrom('ogolny',RI(1,2));const n=g.eli+g.int+g.ser;
   p.comp.eli+=g.eli;p.comp.int+=g.int;p.comp.ser+=g.ser;p.mem+=n;
   return `Orędzie „${tm.n}” <b>przyjęte dobrze</b>. Poparcie rządu w górę, a do partii wchodzi <b>${n} ${pl(n,'osoba','osoby','osób')}</b>.`}
  if(roll>-.3){p.fame=cl(p.fame+2);
   const g=drawFrom('ogolny',RI(1,2));const n=g.eli+g.int+g.ser;
   p.comp.eli+=g.eli;p.comp.int+=g.int;p.comp.ser+=g.ser;p.mem+=n;
   return `Orędzie „${tm.n}” przeszło bez echa, ale ${n} ${pl(n,'osoba dopisała się','osoby dopisały się','osób dopisało się')} do partii.`}
  APPR(-RI(3,7));p.fame=cl(p.fame-2);
  return `Orędzie „${tm.n}” <b>źle odebrane</b>. Poparcie rządu w dół.`}},
{id:'dymisja',cat:'prem',n:'Odwołanie ministra',ap:2,kp:12,en:12,pm:1,
 d:'Wyrzucasz partię z rządu. Decydujesz sam, bez głosowania, ale koalicja się o tym dowie: relacje na dno i mocny zastrzyk kontrowersji.',
 f:()=>{openDym();return null}},
{id:'zmianaMin',cat:'prem',n:'Zmiana ministra',ap:1,kp:8,en:8,pm:1,
 d:'Wymieniasz człowieka na resorcie, zostawiając jego partię w koalicji. Tańsze niż dymisja, ale kontrowersja i tak rośnie. Świeżo powołanego ministra nie ruszysz przez trzy tygodnie.',
 f:()=>{openZmiana();return null}},
{id:'rozwiaz',cat:'prem',n:'Rozwiązanie sejmu',ap:3,kp:30,en:20,pm:1,
 d:'Przedterminowe wybory w wybranym przez ciebie momencie. Serwer odbiera to jako ucieczkę: tracisz ponad połowę sławy i dostajesz potężny zastrzyk kontrowersji.',
 f:(p)=>{const f0=p.fame;
  p.fame=cl(p.fame*0.42);
  p.ctr=Math.min(88,p.ctr+RI(22,30));
  p.cred=cl(p.cred-9);M(p,-16);
  say('<b>Premier rozwiązuje sejm.</b> Przedterminowe wybory, a serwer uznał to za ucieczkę.','bad');
  G.week=G.weeks;
  return `Sejm rozwiązany. Sława ${Math.round(f0)} spada do ${Math.round(p.fame)}, kontrowersja rośnie do ${Math.round(p.ctr)}.`}},
/* Ustawa o kanałach poszła precz. Przewracała całą mapę wyborczą w środku
   kadencji — mandaty okręgowe rozdzielały się od nowa, przez co obecność
   budowana przez pół kadencji traciła sens, a przy okazji sypały się rzeczy
   liczone od stałej liczby okręgów. Więcej z tego było awarii niż rozgrywki. */
/* --- opozycja --- */
{id:'wotum',cat:'opo',n:'Rozliczanie rządu',ap:2,kp:24,en:16,opo:1,
 d:'Zbierasz materiał, wywlekasz wpadki i próbujesz doprowadzić do głosowania nad wotum nieufności. Sejm rzadko w ogóle dopuszcza wniosek, a koalicjanci i tak zagłosują przeciw.',
 f:()=>{openWotum();return null}},
{id:'przekup',cat:'opo',n:'Przekupstwo koalicjanta',ap:2,kp:55,en:14,opo:1,
 d:'Dogadujesz się po cichu z posłem koalicji. Przy najbliższej ustawie zagłosuje przeciw własnemu rządowi. Drogie, ryzykowne i zwykle wystarcza raz, żeby wywrócić głosowanie.',
 f:()=>{openPrzekupstwo();return null}},
/* --- prezydent: weto ustaw jest teraz w dziale Prezydenta, przy biurku --- */
{id:'oredzieP',cat:'prz',n:'Orędzie prezydenckie',ap:1,kp:6,en:8,prez:1,tem:1,term1:1,
 d:'Raz na kadencję prezydencką, czyli na dwie parlamentarne. Prezydent mówi do serwera ponad podziałami, albo udaje, że ponad.',
 f:(p,f,_,__,___,t)=>{const tm=TEM.find(x=>x.id===t)||TEM[0];
  SID.forEach(s=>{if(tm.w[s])p.aff[s]=Math.max(.1,p.aff[s]+tm.w[s]*.14)});
  G.useTerm.oredzieP=1;G.prezOredzieFor=prezKadencja();
  p.fame=cl(p.fame+R(5,9));p.cred=cl(p.cred+4);M(p,7);
  REG.forEach(r=>p.pres[r.id]=cl(p.pres[r.id]+11*(hasLsd(G.me)?2.2:1)));
  if(hasLsd(G.me))p.rally=(p.rally||0)+2;
  const g=drawFrom('polityka',RI(1,2));const n=g.eli+g.int+g.ser;
  p.comp.eli+=g.eli;p.comp.int+=g.int;p.comp.ser+=g.ser;p.mem+=n;
  return `Orędzie „${tm.n}” poszło na wszystkie kanały. Jedyne w tej kadencji, a do partii dołącza <b>${n} ${pl(n,'osoba','osoby','osób')}</b>.`}},
/* --- specjalne --- */
{id:'sabotaz',cat:'spe',n:'Akcja sabotażowa',ap:2,kp:30,en:18,tgt:1,
 d:'Skoordynowany chaos na kanałach przeciwnika. Udaje się mniej więcej co trzeci raz, reszta kończy się wykryciem i katastrofą wizerunkową. Blok opozycyjny i Showman poprawiają szanse.',
 f:(p,f,t)=>{const o=G.p[t];
  const wBloc=G.opoBloc&&G.opoBloc.parties.includes(G.me)&&G.opoBloc.parties.length>1;
  let risk=cl(.75-lead(G.me).komp/300-p.cred/700+o.cred/340+(G.used.sabotaz||0)*.10-(wBloc?.09:0)-(hasT('showman')?.06:0),.40,.92);
  G.rel[G.me][t]=cl(G.rel[G.me][t]-26,-100,100);G.rel[t][G.me]=cl(G.rel[t][G.me]-26,-100,100);
  if(ch(risk)){
    const d=R(16,26);
    p.fame=cl(p.fame-d);p.cred=cl(p.cred-20);p.ctr=cl(p.ctr+26);p.uni=cl(p.uni-11);M(p,-20);
    REG.forEach(r=>p.pres[r.id]=cl(p.pres[r.id]-12));
    G.rel[G.me][t]=cl(G.rel[G.me][t]-25,-100,100);
    alive().forEach(x=>{if(x!==G.me)G.rel[G.me][x]=cl(G.rel[G.me][x]-9,-100,100)});
    G.shame=G.week+6;
    return `<b>Wykryto twoich ludzi.</b> Sława −${Math.round(d)}, wiarygodność −20, kontrowersja +26. Zostały ci publiczne przeprosiny.`}
  o.fame=cl(o.fame-R(9,15));o.act=cl(o.act-R(10,17));o.uni=cl(o.uni-7);M(o,-13);
  REG.forEach(r=>o.pres[r.id]=cl(o.pres[r.id]*.72));
  M(p,7);XP(10);
  return `<b>Sabotaż udany.</b> ${o.ab} traci sławę, aktywność i jedną trzecią obecności we wszystkich okręgach. Nikt nie wie, że to ty (ryzyko było ${Math.round(risk*100)}%).`}},
{id:'odp',cat:'spe',n:'Regeneracja lidera',ap:1,kp:0,en:-36,tydz2:1,
 d:'Lider znika na chwilę i wraca z energią. Nic nie kosztuje, ale dwa razy w tygodniu to maksimum — po trzecim zniknięciu nikt by go już nie szukał.',
 f:(p)=>{p.act=cl(p.act-3);return `${p.lead} odpoczął. <b>Energia +36</b>.`}},
{id:'stery',cat:'spe',n:'Układ sterów',ap:1,kp:26,en:12,term1:1,
 d:'Ustalasz, ilu ludzi prowadzi partię: jeden, dwóch albo trzech, i kto to jest. Statystyki oraz cechy wrodzone liczą się wtedy jako średnia całego składu sterów. Raz na kadencję.',
 f:()=>{openStery();return null}},
];
function topSeg(p){let b=SID[0];SID.forEach(s=>{if(p.aff[s]>p.aff[b])b=s});return b}
const COMBO=[
 {a:'kanwas',b:'wiec',   m:1.55,n:'Przygotowany grunt',d:'Ludzie już wiedzieli, po co przychodzą.'},
 {a:'manifest',b:'spot', m:1.45,n:'Spójny przekaz',d:'Spot mówi dokładnie to, co manifest.'},
 {a:'wywiad',b:'debata', m:1.40,n:'Rozgrzany lider',d:'Wszedł na debatę prosto z wywiadu.'},
 {a:'szkol',b:'kanwas',  m:1.40,n:'Przeszkolone kadry',d:'Wiedzieli, co pisać w DM-ach.'},
 {a:'zjazd',b:'rekr',    m:1.45,n:'Świeży entuzjazm',d:'Po zjeździe ludzie sami się zgłaszali.'},
 {a:'manifest',b:'memy', m:0.55,n:'Niespójność',d:'Wczoraj manifest, dziś memy. Nikt tego nie kupuje.'},
 {a:'admin',b:'kulisy',  m:0.45,n:'Świeży donos',d:'Trudno rozmawiać w kuluarach, gdy właśnie zgłosiłeś kogoś adminom.'},
 {a:'admin',b:'wywiad',  m:0.55,n:'Niewygodne pytanie',d:'Dziennikarz zaczął od tego zgłoszenia do administracji.'},
 {a:'czyst',b:'rekr',    m:0.60,n:'Zła prasa',d:'Kto chce wchodzić do partii, która właśnie kogoś wyrzuciła?'},
];
/* Premier i prezydent mają własne działy w nawigacji, więc nie ma ich tutaj. */
const CATS=[['kam','Kampania'],['org','Organizacja'],['dyp','Dyplomacja'],['bru','Brudne'],
            ['prm','Przemiana'],['wla','Rząd'],
            ['opo','Opozycja'],['spe','Specjalne']];

/* ══════════ WYDARZENIA ══════════ */
const EV=[
{id:'mediacja',w:()=>me().ctr>55?6:1,k:'Serwer',t:'Admini proponują mediację',
 x:()=>`Przy kontrowersji ${Math.round(me().ctr)}/100 administracja zaprasza na rozmowę: „albo się dogadamy, albo zaczniemy zamykać kanały”.`,
 o:[{l:'Idę i przepraszam publicznie',s:'Kontrowersja −14, sława −5',
     f:p=>{p.ctr=cl(p.ctr-14);p.fame=cl(p.fame-5);p.cred=cl(p.cred+4);return 'Ton opadł. Serwer to odnotował.'}},
    {l:'Idę, ale niczego nie przyznaję',s:'Kontrowersja −6',
     f:p=>{p.ctr=cl(p.ctr-6);p.pret=cl(p.pret+4);return 'Formalnie się dogadaliście.'}},
    {l:'Nie idę',s:'Kontrowersja +7',
     f:p=>{p.ctr=cl(p.ctr+7);M(p,-4);return 'Administracja zapamiętała.'}}]},
{id:'odplyw',w:()=>3,k:'Serwer',t:'Fala odejść z serwera',
 x:'Kilkanaście osób naraz opuściło Mordy Mordeczki, sezon, egzaminy, znudzenie. Ubyło wszystkim, także tobie.',
 o:[{l:'Próbuję ich zatrzymać',s:'Energia −14, tracisz mniej, ale i tak tracisz',
     f:p=>{G.en=cl(G.en-14);const q=giveBackCap(p,RI(1,2));return `Odeszło ${q.eli+q.int+q.ser}. Bez tego byłoby więcej.`}},
    {l:'Odpuszczam',s:'Tracisz więcej osób',
     f:p=>{const q=giveBackCap(p,RI(2,4));return `Odeszło ${q.eli+q.int+q.ser} ${pl(q.eli+q.int+q.ser,'osoba','osoby','osób')}.`}},
    {l:'Publicznie komentuję odejścia',s:'Tracisz osoby i wiarygodność',
     f:p=>{const q=giveBackCap(p,RI(1,3));p.cred=cl(p.cred-5);p.ctr=cl(p.ctr+6);
       return `Odeszło ${q.eli+q.int+q.ser}, a komentarz uznano za żałosny.`}}]},
{id:'nuda',w:()=>3,k:'Serwer',t:'Serwer się nudzi',
 x:'Martwy tydzień. Kanały puste, nikt nie odpisuje, kampanie mówią do ściany.',
 o:[{l:'Przeczekuję',s:'Aktywność i obecność w dół',
     f:p=>{p.act=cl(p.act-9);REG.forEach(r=>p.pres[r.id]=cl(p.pres[r.id]-7));return 'Tydzień stracony.'}},
    {l:'Wymuszam aktywność na swoich',s:'Aktywność spada mniej, ale jedność siada',
     f:p=>{p.act=cl(p.act-4);p.uni=cl(p.uni-8);G.en=cl(G.en-10);return 'Ludzie pisali z przymusu. Widać to było.'}},
    {l:'Robimy coś głupiego, byle się działo',s:'Aktywność w dół, kontrowersja w górę',
     f:p=>{p.act=cl(p.act-6);p.ctr=cl(p.ctr+11);p.cred=cl(p.cred-4);return 'Zadziałało na pół dnia.'}}]},
{id:'stare',w:()=>me().fame>44?4:1,k:'Wizerunek',t:'Ktoś wywlekł stare screeny',
 x:'Rozmowy sprzed roku, w których twoja partia obiecywała dokładnie odwrotnie niż dziś. Nie ma dobrej odpowiedzi.',
 o:[{l:'Przyznaję, że się zmieniliśmy',s:'Wiarygodność w dół, jedność w dół',
     f:p=>{p.cred=cl(p.cred-7);p.uni=cl(p.uni-5);return 'Szczerze, ale słabo.'}},
    {l:'Twierdzę, że to wyrwane z kontekstu',s:'Wiarygodność mocno w dół, kontrowersja w górę',
     f:p=>{p.cred=cl(p.cred-11);p.ctr=cl(p.ctr+9);return 'Nikt nie uwierzył.'}},
    {l:'Milczę',s:'Sława i wiarygodność w dół',
     f:p=>{p.fame=cl(p.fame-6);p.cred=cl(p.cred-5);M(p,-4);return 'Milczenie odczytano jako przyznanie się.'}}]},
{id:'kanal',w:()=>2,k:'Administracja',t:'Admin kasuje kanał',dyn:1,
 build(){const r=pick(REG);
  return {x:`Administracja zamknęła <b>${r.n}</b> na tydzień „dla ochłonięcia”. Cała praca, którą tam włożyłeś, wyparowała.`,
   o:[{l:'Przenoszę ludzi na inne kanały',s:'Tracisz obecność tam, trochę zyskujesz gdzie indziej',
       f:p=>{const lost=p.pres[r.id];p.pres[r.id]=cl(lost*.35);
         REG.filter(x=>x.id!==r.id).forEach(x=>p.pres[x.id]=cl(p.pres[x.id]+4));
         return `Obecność w ${r.n} spadła z ${Math.round(lost)} do ${Math.round(p.pres[r.id])}.`}},
      {l:'Protestuję u adminów',s:'Obecność przepada, kontrowersja rośnie',
       f:p=>{p.pres[r.id]=cl(p.pres[r.id]*.30);p.ctr=cl(p.ctr+8);
         return `Protest odrzucony, obecność w ${r.n} przepadła.`}},
      {l:'Czekam, aż otworzą',s:'Obecność przepada w całości',
       f:p=>{p.pres[r.id]=cl(p.pres[r.id]*.25);p.act=cl(p.act-5);
         return `${r.n} wrócił, twoich ludzi tam już nie ma.`}}]}}},
{id:'wyciek',w:()=>3,k:'Serwer',t:'Wyciek z prywatnego kanału',dyn:1,
 build(){const o=pick(alive().filter(k=>k!==G.me));
  return {x:`Ktoś wrzucił na #ogólny screeny z prywatnego kanału <b>${G.p[o].n}</b>. Nie ty. Ale możesz to wykorzystać.`,
   o:[{l:'Nagłaśniam sprawę',s:'Sława +5, oni tracą, ale relacje siadają',f:p=>{p.fame=cl(p.fame+R(3,6));G.p[o].fame=cl(G.p[o].fame-R(4,8));G.p[o].cred=cl(G.p[o].cred-6);
       G.rel[G.me][o]=cl(G.rel[G.me][o]-20,-100,100);M(p,5);return `${G.p[o].ab} obrywa, ty zbierasz zasięgi.`}},
      {l:'Bronię ich publicznie',s:'Relacje +26, wiarygodność +5',f:p=>{G.rel[G.me][o]=cl(G.rel[G.me][o]+26,-100,100);G.rel[o][G.me]=cl(G.rel[o][G.me]+26,-100,100);p.cred=cl(p.cred+5);return `${G.p[o].lead} tego nie zapomni.`}},
      {l:'Nie mieszam się',s:',',f:()=>'Przeczekałeś.'}]}}},
{id:'boost',w:()=>3,k:'Serwer',t:'Fala boostów',
 x:'Serwer dostał poziom trzeci. Admini rozdają role, kanały żyją, wszyscy są w dobrym humorze.',
 o:[{l:'Fundujemy konkurs z naszej kasy',s:'−22 kapitału, sława i obecność wszędzie',f:p=>{if(G.kp<22)return 'Nie stać cię.';G.kp-=22;p.fame=cl(p.fame+R(4,8));REG.forEach(r=>p.pres[r.id]=cl(p.pres[r.id]+4));M(p,6);return 'Wasze logo przy każdej nagrodzie.'}},
    {l:'Przypisujemy sobie zasługę',s:'Sława +4, wiarygodność −5',f:p=>{p.fame=cl(p.fame+4);p.cred=cl(p.cred-5);p.ctr=cl(p.ctr+5);return 'Nikt nie zaprzeczył wystarczająco szybko.'}},
    {l:'Cieszymy się razem ze wszystkimi',s:'Aktywność +8',f:p=>{p.act=cl(p.act+8);p.uni=cl(p.uni+3);return 'Dobry tydzień.'}}]},
{id:'wojnaGrup',w:()=>4,k:'Serwer',t:'Wojna grup',dyn:1,
 build(){const a=pick(SID);let b=pick(SID);while(b===a)b=pick(SID);
  return {x:`Na #konstytucji wybuchła awantura: <b>${sn(a)}</b> kontra <b>${sn(b)}</b>. Trzeba się opowiedzieć albo udawać, że się nie widzi.`,
   o:[{l:`Staję po stronie: ${sn(a)}`,s:`Dopasowanie do nich +1,2, do drugich −0,8`,f:p=>{p.aff[a]+=1.2;p.aff[b]=Math.max(.1,p.aff[b]-.8);p.ctr=cl(p.ctr+6);return `${sn(a)} zapamiętają.`}},
      {l:`Staję po stronie: ${sn(b)}`,s:`Dopasowanie do nich +1,2, do pierwszych −0,8`,f:p=>{p.aff[b]+=1.2;p.aff[a]=Math.max(.1,p.aff[a]-.8);p.ctr=cl(p.ctr+6);return `${sn(b)} zapamiętają.`}},
      {l:'Apeluję o spokój',s:'Wiarygodność +6, pretensjonalność +6',f:p=>{p.cred=cl(p.cred+6);p.pret=cl(p.pret+6);return 'Nikt cię nie posłuchał, ale wyszedłeś na dorosłego.'}}]}}},
{id:'hejt',w:()=>me().fame>50?4:1,k:'Wizerunek',t:'Zorganizowana nagonka',
 x:'Na kilku kanałach naraz pojawiły się identyczne posty przeciwko tobie. Ktoś to koordynuje.',
 o:[{l:'Odpowiadam punkt po punkcie',s:'Wiarygodność +7, energia −13',f:p=>{p.cred=cl(p.cred+7);G.en=cl(G.en-13);p.pret=cl(p.pret+4);return 'Rzeczowo i nudno. Zadziałało.'}},
    {l:'Kontratak z grubej rury',s:'Sława +6, kontrowersja +14',f:p=>{p.fame=cl(p.fame+6);p.ctr=cl(p.ctr+14);p.cred=cl(p.cred-4);M(p,4);return 'Awantura przykryła nagonkę.'}},
    {l:'Milczę i czekam',s:'Sława −4, ale kontrowersja spada',f:p=>{p.fame=cl(p.fame-4);p.ctr=cl(p.ctr-8);return 'Po tygodniu ucichło.'}}]},
{id:'zdrada',w:()=>me().uni<52?4:1,k:'Wewnętrzne',t:'Ktoś gra na dwa fronty',dyn:1,
 build(){const o=pick(alive().filter(k=>k!==G.me));
  return {x:`Jeden z twoich ludzi od tygodni siedzi na kanale <b>${G.p[o].n}</b> i przekazuje im wszystko.`,
   o:[{l:'Wyrzucam bez rozgłosu',s:'−1 osoba, jedność +8',f:p=>{giveBackCap(p,1);p.uni=cl(p.uni+8);return 'Cicho i skutecznie.'}},
      {l:'Robię z tego publiczną aferę',s:'Sława +6, relacje z nimi −30',f:p=>{p.fame=cl(p.fame+6);p.ctr=cl(p.ctr+9);G.rel[G.me][o]=cl(G.rel[G.me][o]-30,-100,100);G.p[o].cred=cl(G.p[o].cred-6);return `${G.p[o].ab} wypiera się wszystkiego.`}},
      {l:'Zostawiam go i karmię fałszywkami',s:'Ryzykowne, ale może się opłacić',f:p=>{if(ch(.55)){G.p[o].act=cl(G.p[o].act-10);p.cred=cl(p.cred+3);M(p,5);return `${G.p[o].ab} podjął decyzje na podstawie twoich bzdur.`}p.uni=cl(p.uni-9);return 'Zorientowali się. Twoi ludzie też.'}}]}}},
{id:'sojusz',w:()=>3,k:'Dyplomacja',t:'Ktoś proponuje układ',dyn:1,
 build(){const c=alive().filter(k=>k!==G.me).sort((a,b)=>G.rel[b][G.me]-G.rel[a][G.me])[0];
  return {x:`<b>${G.p[c].lead}</b> pisze na priv: „Nie musimy się lubić, ale możemy sobie nie przeszkadzać przez kilka tygodni”.`,
   o:[{l:'Przyjmuję',s:'Pakt na 6 tygodni, relacje +18',f:p=>{p.pact[c]=G.week+6;G.rel[G.me][c]=cl(G.rel[G.me][c]+18,-100,100);G.rel[c][G.me]=cl(G.rel[c][G.me]+18,-100,100);return `Pakt z ${G.p[c].ab}.`}},
      {l:'Odmawiam i publikuję',s:'Sława +5, relacje −25',f:p=>{p.fame=cl(p.fame+5);p.ctr=cl(p.ctr+8);G.rel[G.me][c]=cl(G.rel[G.me][c]-25,-100,100);return 'Serwer się uśmiał. Oni nie.'}},
      {l:'Odmawiam grzecznie',s:'Relacje −5',f:p=>{G.rel[G.me][c]=cl(G.rel[G.me][c]-5,-100,100);return 'Bez awantury.'}}]}}},
{id:'mem',w:()=>3,k:'Serwer',t:'Twoja partia w memie',
 x:'Ktoś zrobił z waszego ostatniego posta szablon. Krąży po wszystkich kanałach. Nie jest złośliwy, na razie.',
 o:[{l:'Wchodzimy w to i robimy własne wersje',s:'Sława +7, pretensjonalność −8',f:p=>{p.fame=cl(p.fame+R(5,9));p.pret=cl(p.pret-8);p.aff.ser+=.5;M(p,6);return 'Wasz mem, wasze zasady.'}},
    {l:'Prosimy o usunięcie',s:'Wiarygodność +2, sława −5, memiarze się wściekają',f:p=>{p.cred=cl(p.cred+2);p.fame=cl(p.fame-5);p.aff.ser=Math.max(.1,p.aff.ser-.7);return 'Efekt odwrotny do zamierzonego.'}},
    {l:'Nie komentujemy',s:',',f:()=>'Mem sam wygasł po tygodniu.'}]},
{id:'awaria',w:()=>2,k:'Administracja',t:'Awaria serwera',
 x:'Discord leżał przez dwa dni. Kanały puste, kampanie zamrożone, wszyscy zaczynają od nowa.',
 o:[{l:'Odbudowujemy obecność natychmiast',s:'Energia −16, obecność wszędzie +12',f:p=>{G.en=cl(G.en-16);REG.forEach(r=>p.pres[r.id]=cl(p.pres[r.id]+5));return 'Byliście pierwsi po powrocie.'}},
    {l:'Korzystamy z przerwy',s:'Energia +26, obecność wszędzie −8',f:p=>{G.en=cl(G.en+26);REG.forEach(r=>p.pres[r.id]=cl(p.pres[r.id]-8));return 'Odpoczęliście.'}},
    {l:'Wrzucamy podsumowanie awarii',s:'Wiarygodność +5, pretensjonalność +4',f:p=>{p.cred=cl(p.cred+5);p.pret=cl(p.pret+4);return 'Nikt nie przeczytał, ale wygląda profesjonalnie.'}}]},
{id:'talent',w:()=>3,k:'Kadry',t:'Ktoś zdolny puka do drzwi',
 x:'Zgłosił się ktoś naprawdę ogarnięty. Chce działać, ale pyta, co z tego będzie miał.',
 o:[{l:'Obiecuję miejsce na liście',s:'+2 osoby, jedność −5',f:p=>{const gt=drawFrom('polityka',2);p.comp.eli+=gt.eli;p.comp.int+=gt.int;p.comp.ser+=gt.ser;p.mem+=gt.eli+gt.int+gt.ser;p.uni=cl(p.uni-5);return 'Przyszedł nie sam.'}},
    {l:'Podkupuję kogoś z cudzego zaplecza',s:'Ktoś realny zmienia barwy, relacje siadają',f:p=>{
      const donors=alive().filter(k=>k!==G.me&&G.p[k].bench.length>=2);
      if(!donors.length)return 'Nikt nie ma zaplecza do oddania.';
      const from=pick(donors), who=pick(G.p[from].bench);
      G.p[from].bench=G.p[from].bench.filter(x=>x!==who);p.bench.push(who);
      G.rel[G.me][from]=cl(G.rel[G.me][from]-18,-100,100);G.rel[from][G.me]=cl(G.rel[from][G.me]-18,-100,100);
      XP(8);return `<b>${who}</b> przechodzi z ${G.p[from].ab} do ciebie.`}},
    {l:'Nie mam nic do zaoferowania',s:'Doświadczenie +6',f:p=>{XP(6);p.cred=cl(p.cred+3);return 'Uczciwie. Poszedł gdzie indziej.'}}]},
{id:'delegal',w:()=>eliteRisk(me())>0&&me().ctr>72?9:0,k:'Administracja',t:'Wniosek o delegalizację partii',
 x:()=>`Na kanale administracyjnym pojawił się wniosek: ${me().n} to „klika kilku ludzi, która przejęła serwer”.
   Elita to ${Math.round(ratio(me(),'eli')*100)}% twojego składu, kontrowersja ${Math.round(me().ctr)}/100.
   Przy 90 partia wpada w paraliż: sondaż na pół, kapitał na minus, ludzie wychodzą.`,
 o:[{l:'Wypraszam część elity',s:'Tracisz najcenniejszych ludzi, kontrowersja mocno w dół',
     f:p=>{const q=purge(p,'eli',Math.max(1,Math.round(p.comp.eli*.4)));p.ctr=cl(p.ctr-22);p.uni=cl(p.uni-5);
       return `${q} ${pl(q,'osoba odchodzi','osoby odchodzą','osób odchodzi')} z elity. Kontrowersja −22.`}},
    {l:'Werbuję serwerowiczów na przeciwwagę',s:'Rozcieńcza skład, ale rozbija jedność',
     f:p=>{const gt=drawFrom('szitpost',RI(1,3));p.comp.ser+=gt.ser;p.mem+=gt.ser;p.ctr=cl(p.ctr-11);p.uni=cl(p.uni-9);
       return `${gt.ser} ${pl(gt.ser,'serwerowicz','serwerowiczów','serwerowiczów')} w partii. Skład rozcieńczony.`}},
    {l:'Odrzucam wniosek jako pomówienie',s:'Nic nie tracisz, ale kontrowersja rośnie dalej',
     f:p=>{p.ctr=cl(p.ctr+8);M(p,-4);return 'Wniosek odrzucony. Temat wróci.'}}]},
{id:'wypal',w:()=>G.en<24?9:0,k:'Kryzys',t:()=>`${me().lead} ma dość`,
 x:()=>`Trzeci tydzień bez przerwy. ${me().lead} pisze na kanale zarządu: „Serio zastanawiam się, czy mi się to jeszcze chce”.`,
 o:[{l:'Tydzień offline',s:'Energia +42, aktywność −8',f:p=>{G.en=cl(G.en+42);p.act=cl(p.act-8);return 'Partia dycha, kanały cichną.'}},
    {l:'Zaciskamy zęby',s:'Ryzyko: jedność i energia w dół',f:p=>{if(ch(.55)){p.uni=cl(p.uni-12);G.en=cl(G.en-8);return 'Ludzie widzą, że to już nie to.'}p.act=cl(p.act+5);return 'Dowozi. Doceniono.'}},
    {l:'Oddaję stery zastępcy',s:'Energia +58, sława −6',f:p=>{G.en=cl(G.en+58);p.fame=cl(p.fame-6);p.uni=cl(p.uni+5);return 'Zastępca przejmuje kampanię.'}}]},
{id:'bunt',w:()=>me().bench.length&&me().uni<42?7:0,k:'Wewnętrzne',t:'Ktoś podważa przewodnictwo',dyn:1,
 build(){const c=pick(me().bench),cur=lead(G.me),cand=L(c);
  return {x:`<b>${c}</b> zwołał zebranie bez wiedzy zarządu. Statystyki: charyzma ${cand.char}, kompetencja ${cand.komp}, autorytet ${cand.autor}. Obecny lider ${cur.n}: ${cur.char}/${cur.komp}/${cur.autor}.`,
   o:[{l:`Oddaję stery ${c}`,s:'Realna zmiana lidera, jedność +12, sława −3',
       f:p=>{const old=p.lead;p.lead=c;p.bench=p.bench.filter(x=>x!==c);G.useTerm.lider=1;
         if(!p.main.includes(old)&&!p.bench.includes(old))p.bench.push(old);
         p.uni=cl(p.uni+12);p.fame=cl(p.fame-3);G.en=cl(G.en+30);
         return `<b>${c}</b> obejmuje przewodnictwo.`}},
      {l:'Wyrzucam go z partii',s:'Jedność +8, tracisz zaplecze i ludzi',
       f:p=>{p.bench=p.bench.filter(x=>x!==c);p.uni=cl(p.uni+8);const q=giveBackCap(p,RI(1,3));const l=q.eli+q.int+q.ser;p.ctr=cl(p.ctr+7);
         return `${c} poza partią. Zabrał ${l} ${pl(l,'osobę','osoby','osób')}.`}},
      {l:'Udaję, że nic się nie stało',s:'Ryzyko rozłamu',
       f:p=>{if(ch(.5)){p.uni=cl(p.uni-14);const q=giveBackCap(p,Math.round(p.mem*.2));const l=q.eli+q.int+q.ser;
         return `<b>Rozłam.</b> ${c} odchodzi z ${l} ${pl(l,'osobą','osobami','osobami')}.`}p.uni=cl(p.uni+3);return 'Ucichło samo.'}}]}}},
{id:'rozlam',w:()=>me().uni<36?6:0,k:'Wewnętrzne',t:'Frakcja szykuje rozłam',
 x:'Grupa działaczy założyła prywatny kanał. Nazwali go „ratunek dla partii”. Ciebie tam nie ma.',
 o:[{l:'Negocjuję',s:'Jedność +12, rozmycie programu',f:p=>{p.uni=cl(p.uni+12);const t=topSeg(p);p.aff[t]=Math.max(.1,p.aff[t]-.6);return 'Dogadaliście się kosztem wyrazistości.'}},
    {l:'Wyrzucam prowodyrów',s:'Jedność +20, tracisz ludzi',f:p=>{const q=giveBackCap(p,Math.max(1,Math.round(p.mem*.18)));const l=q.eli+q.int+q.ser;p.uni=cl(p.uni+20);p.ctr=cl(p.ctr+8);return `${l} ${pl(l,'osoba','osoby','osób')} poza partią.`}},
    {l:'Ignoruję',s:'Ryzyko rozłamu, ale odejdą najwyżej dwie osoby',f:p=>{if(ch(.5)){const q=giveBackCap(p,Math.round(p.mem*.32));const l=q.eli+q.int+q.ser;p.uni=cl(p.uni-10);return `<b>Rozłam.</b> ${l} ${pl(l,'osoba odchodzi','osoby odchodzą','osób odchodzi')}.`}p.uni=cl(p.uni+4);return 'Frakcja rozeszła się sama.'}}]},
{id:'pret',w:()=>me().pret>60?7:0,k:'Wizerunek',t:'„Ale wy jesteście pretensjonalni”',
 x:'Ktoś wkleił wasz manifest na #ogólny z podpisem „normalnie ludzie tak nie piszą”. Czterdzieści reakcji, wszystkie z płaczącym emoji.',
 o:[{l:'Autoironiczny post',s:'Pretensjonalność −18',f:p=>{p.pret=cl(p.pret-18);p.cred=cl(p.cred-3);p.aff.ser+=.5;return 'Śmiejecie się z siebie pierwsi.'}},
    {l:'Bronię poziomu dyskusji',s:'Wiarygodność +6, pretensjonalność +8',f:p=>{p.cred=cl(p.cred+6);p.pret=cl(p.pret+8);p.aff.int+=.4;return 'Weterani przyklaskują, reszta przewraca oczami.'}},
    {l:'Milczę',s:'Sława −2',f:p=>{p.fame=cl(p.fame-2);return 'Temat ucichł po pięciu dniach.'}}]},
{id:'fala',w:()=>3,k:'Serwer',t:'Fala nowych userów',
 x:'Ktoś wrzucił zaproszenie na dużym serwerze. #brama pęka w szwach.',
 o:[{l:'Rzucam się na onboarding',s:'Serwer rośnie, obecność w #brama',f:p=>{if(PID.reduce((a,k)=>a+G.p[k].mem,0)+freeTot()<SERVER_MAX)G.free.ser+=RI(8,14);p.pres.brama=cl(p.pres.brama+9);p.aff.ser+=.6;G.en=cl(G.en-9);return 'Przygarnąłeś nowych pierwszy.'}},
    {l:'Zostawiam konkurencji',s:'Rosną inni',f:p=>{if(PID.reduce((a,k)=>a+G.p[k].mem,0)+freeTot()<SERVER_MAX)G.free.ser+=RI(8,14);alive().forEach(k=>{if(k!==G.me)G.p[k].pres.brama=cl(G.p[k].pres.brama+3)});return 'Nowi trafili gdzie indziej.'}},
    {l:'Powitalny mem',s:'Memiarze i nowi w górę',f:p=>{if(PID.reduce((a,k)=>a+G.p[k].mem,0)+freeTot()<SERVER_MAX)G.free.ser+=RI(6,11);p.aff.ser+=.5;p.cred=cl(p.cred-2);return 'Mem powitalny stał się klasyką.'}}]},
{id:'skandal',w:()=>me().ctr>55?6:2,k:'Skandal',t:'Twój działacz odjechał',
 x:'Członek partii napisał na #ogólnym coś, czego nie da się obronić. Screeny już krążą.',
 o:[{l:'Natychmiastowe wykluczenie',s:'Wiarygodność +5, −1 osoba',f:p=>{giveBackCap(p,1);p.cred=cl(p.cred+5);p.uni=cl(p.uni-6);return 'Szybka reakcja ucięła temat.'}},
    {l:'Bronię swojego',s:'Jedność +10, wiarygodność −9',f:p=>{p.uni=cl(p.uni+10);p.cred=cl(p.cred-9);p.ctr=cl(p.ctr+10);return 'Partia zwarła szyki.'}},
    {l:'Robię z tego mem',s:'Memiarze w górę',f:p=>{p.aff.ser+=.8;p.ctr=cl(p.ctr+10);p.fame=cl(p.fame+4);p.cred=cl(p.cred-4);return 'Skandal przerobiony na content.'}}]},
{id:'donacja',w:()=>3,k:'Okazja',t:'Ktoś chce zainwestować',
 x:'Zamożny (jak na warunki serwera) user oferuje wsparcie. Chce w zamian miejsce na liście.',
 o:[{l:'Biorę',s:'+26 kapitału, wiarygodność −4',f:p=>{G.kp+=26;p.cred=cl(p.cred-4);return 'Kasa na koncie.'}},
    {l:'Biorę, ale bez miejsca',s:'+12 kapitału',f:p=>{G.kp+=12;return 'Kompromis.'}},
    {l:'Odmawiam publicznie',s:'Wiarygodność +7, sława +3',f:p=>{p.cred=cl(p.cred+7);p.fame=cl(p.fame+3);return 'Odmowa nagłośniona.'}}]},
{id:'okreg',w:()=>4,k:'Okręg',t:'Lokalna afera',dyn:1,
 build(){const r=pick(REG);
  return {x:`W kanale <b>${r.n}</b> wybuchła awantura o moderację. Ludzie szukają, kto stanie po ich stronie.`,
   o:[{l:`Staję po stronie ${r.n}`,s:'Obecność +26, mody zapamiętają',f:p=>{p.pres[r.id]=cl(p.pres[r.id]+11);p.ctr=cl(p.ctr+7);p.cred=cl(p.cred-3);return `${r.n} cię zapamięta.`}},
      {l:'Staję po stronie modów',s:'Wiarygodność +6, obecność −10',f:p=>{p.cred=cl(p.cred+6);p.pres[r.id]=cl(p.pres[r.id]-10);return 'Porządek ponad popularność.'}},
      {l:'Mediuję',s:'Obecność +10, pretensjonalność +3',f:p=>{p.pres[r.id]=cl(p.pres[r.id]+10);p.cred=cl(p.cred+2);p.pret=cl(p.pret+3);return 'Wszyscy średnio zadowoleni.'}}]}}},
{id:'cisza',w:()=>me().act<30?5:0,k:'Wewnętrzne',t:'Cisza na kanałach',
 x:'Od pięciu dni nikt nic nie napisał na kanale partii. Nawet boty.',
 o:[{l:'Osobiste DM do każdego',s:'Aktywność +14, energia −14',f:p=>{p.act=cl(p.act+14);G.en=cl(G.en-14);return 'Ludzie wrócili. Na razie.'}},
    {l:'Konkurs z nagrodą',s:'−16 kapitału, aktywność +11',f:p=>{G.kp=Math.max(0,G.kp-16);p.act=cl(p.act+11);p.fame=cl(p.fame+2);return 'Kanał stanął na nogi.'}},
    {l:'Trudno',s:'Tracisz ludzi',f:p=>{p.act=cl(p.act-7);giveBackCap(p,RI(1,3));return 'Kilka osób po cichu wyszło.'}}]},
{id:'upadek',w:()=>3,k:'Rynek',t:'Partia w rozsypce',dyn:1,
 build(){const c=alive().filter(k=>k!==G.me&&G.p[k].uni<45).sort((a,b)=>G.p[a].uni-G.p[b].uni)[0];
  if(!c)return null;const o=G.p[c];
  return {x:`<b>${o.n}</b> rozpada się na oczach serwera. ${o.lead} nie panuje nad kanałem.`,
   o:[{l:'Otwieram drzwi',s:`+${Math.max(1,Math.round(o.mem*.2))} osób`,f:p=>{
      let n=Math.max(1,Math.round(o.mem*.2)),g=0;
      for(let i=0;i<n;i++){ if(o.mem<=1)break;
        const gr=o.comp.ser>0?'ser':o.comp.int>0?'int':o.comp.eli>0?'eli':null;
        if(!gr)break; o.comp[gr]--;o.mem--;p.comp[gr]++;p.mem++;g++; }
      p.uni=cl(p.uni-5);return `Przejmujesz ${g} ${pl(g,'osobę','osoby','osób')} od ${o.ab}.`}},
      {l:'Dobijam publicznie',s:'Relacje −25',f:p=>{o.fame=cl(o.fame-10);o.uni=cl(o.uni-8);G.rel[G.me][c]=cl(G.rel[G.me][c]-25,-100,100);p.ctr=cl(p.ctr+7);return `${o.ab} dostał w plecy.`}},
      {l:'Oferuję pomoc',s:'Relacje +30',f:p=>{G.rel[G.me][c]=cl(G.rel[G.me][c]+30,-100,100);G.rel[c][G.me]=cl(G.rel[c][G.me]+30,-100,100);p.cred=cl(p.cred+4);return `${o.lead} zapamięta.`}}]}}},
{id:'sonda',w:()=>G.week>4?4:0,k:'Media',t:'Serwerowy sondaż',
 x:'Ktoś zrobił ankietę na #konstytucji. Wyniki są... interesujące.',
 o:[{l:'Nagłaśniam',s:'Działa tylko, jeśli idziesz dobrze',f:p=>{const q=tally();const s=q.res[G.me].tot/q.total*100;
      if(s>10){p.fame=cl(p.fame+6);return `${fmt(s)}%, dobry wynik, dobrze rozegrany.`}
      p.fame=cl(p.fame-3);p.uni=cl(p.uni-5);return `${fmt(s)}%. Nagłośniłeś własną słabość.`}},
    {l:'Podważam metodologię',s:'Pretensjonalność +7',f:p=>{p.pret=cl(p.pret+7);p.cred=cl(p.cred+3);return 'Napisałeś akapit o próbie badawczej. Na Discordzie.'}},
    {l:'Ignoruję',s:',',f:()=>'Sondaż przeszedł bez echa.'}]},
{id:'wielka',w:()=>G.week>3?4:0,k:'Wydarzenie',t:'Wielka debata serwerowa',
 x:()=>`Admini organizują debatę wszystkich liderów. ${me().lead} musi się pokazać.`,
 o:[{l:'Idę przygotowany',s:'Energia −16, zysk zależny od kompetencji lidera',f:p=>{G.en=cl(G.en-16);
      if(lead(G.me).komp>58){p.fame=cl(p.fame+9);p.cred=cl(p.cred+4);return `${p.lead} wypadł najlepiej ze wszystkich.`}
      p.fame=cl(p.fame+3);p.cred=cl(p.cred-2);return 'Przetrwał. Bez fajerwerków.'}},
    {l:'Idę na żywioł',s:'Viral albo kompromitacja',f:p=>{if(ch(cl(.25+lead(G.me).char/220,.2,.7))){p.fame=cl(p.fame+11);p.ctr=cl(p.ctr+9);p.aff.ser+=.5;return 'Improwizacja poszła viralem.'}p.fame=cl(p.fame-4);p.cred=cl(p.cred-7);return 'Zabrakło argumentów w połowie zdania.'}},
    {l:'Nie idę',s:'Sława −6, energia +8',f:p=>{p.fame=cl(p.fame-6);G.en=cl(G.en+8);return 'Nieobecność była tematem debaty.'}}]},
{id:'kryzKoal',w:()=>inGov()&&G.gov.parties.length>1?5:0,k:'Rząd',t:'Kryzys w koalicji',dyn:1,
 build(){if(!G.gov||!G.gov.parties)return null;
  const o=G.gov.parties.filter(k=>k!==G.me);if(!o.length)return null;const c=pick(o);
  return {x:`<b>${G.p[c].lead}</b> (${G.p[c].ab}) grozi wyjściem z rządu. Poparcie rządu: ${Math.round(G.gov.appr)}.`,
   o:[{l:'Ustępuję',s:'Relacje +20, poparcie −6',f:p=>{G.rel[G.me][c]=cl(G.rel[G.me][c]+20,-100,100);G.rel[c][G.me]=cl(G.rel[c][G.me]+20,-100,100);APPR(-6);return 'Koalicja trzyma się kupy.'}},
      {l:'Odmawiam',s:'Przy złych relacjach koalicja może pęknąć, a to oznacza wybory',
       f:p=>{G.rel[G.me][c]=cl(G.rel[G.me][c]-22,-100,100);
        const risk=cl(.10+(0-G.rel[c][G.me])/240+(50-G.gov.appr)/300,.05,.55);
        if(ch(risk)){const ab=G.p[c].ab;govLeave(c);return `${ab} trzasnął drzwiami (szansa była ${Math.round(risk*100)}%).`}
        APPR(+3);return `Blefowali (ryzyko ${Math.round(risk*100)}%). Zostają.`}},
      {l:'Wyrzucam ich pierwszy',s:'Jeśli koalicja straci większość, parlament zostaje rozwiązany',
       f:p=>{const ab=G.p[c].ab;govLeave(c);G.rel[G.me][c]=-60;G.rel[c][G.me]=-60;
        if(G.gov){APPR(+5);p.fame=cl(p.fame+4);return `${ab} poza rządem, większość utrzymana.`}
        return `${ab} poza rządem, i rząd runął razem z nim.`}}]}}},
{id:'prezKonf',w:()=>G.gov&&G.prez&&!G.gov.parties.includes(G.prez.party)&&inGov()?4:0,k:'Pałac',t:'Prezydent kontra rząd',dyn:1,
 build(){if(!G.gov||!G.prez)return null; return {x:`Prezydent <b>${G.prez.lead}</b> (${G.p[G.prez.party].ab}) publicznie skrytykował rząd i zapowiada weto.`,
   o:[{l:'Idę na wojnę',s:'Poparcie −5, sława +4',f:p=>{APPR(-5);p.fame=cl(p.fame+4);
       G.rel[G.me][G.prez.party]=cl(G.rel[G.me][G.prez.party]-20,-100,100);return 'Konflikt eskaluje.'}},
      {l:'Szukam kompromisu',s:'Relacje +18, poparcie +3',f:p=>{G.rel[G.me][G.prez.party]=cl(G.rel[G.me][G.prez.party]+18,-100,100);
       G.rel[G.prez.party][G.me]=cl(G.rel[G.prez.party][G.me]+18,-100,100);APPR(+3);p.pret=cl(p.pret+3);return 'Napięcie zdjęte.'}},
      {l:'Ignoruję pałac',s:'Poparcie −2',f:p=>{APPR(-2);return 'Milczenie odczytano jako słabość.'}}]}}},
];

/* ══════════ TURA ══════════ */
function buildEvents(){
  /* Nie w trakcie wyborów. Wydarzenie wskakujące w środek liczenia głosów albo
     w dogrywkę prezydencką przerywa animację i wygląda jak błąd — a gracz i tak
     nie ma wtedy czym na nie odpowiedzieć. */
  if(G.phase==='elect'||G.phase==='result'||G.phase==='prez'||G.phase==='pmvote'
     ||G.phase==='marszalek'||G.prez2||G.prezState)return [];
  /* Ostatni tydzień kadencji należy do absolutorium. Nic innego nie ma prawa
     wyskoczyć, bo rozliczenie premiera z gospodarki ma być jedyną rzeczą,
     na którą gracz wtedy patrzy. */
  if(G.week>=G.weeks)return [];
  const pool=EV.map(e=>({e,w:e.w()})).filter(x=>x.w>0);
  const n=ch(.14)?2:ch(.62)?1:0,q=[];
  for(let i=0;i<n;i++){
    const t=pool.reduce((a,x)=>a+x.w,0);if(!t)break;
    let r=Math.random()*t,s=null;
    for(const x of pool){r-=x.w;if(r<=0){s=x;break}}
    if(!s)break;pool.splice(pool.indexOf(s),1);
    if(s.e.dyn){let b=null;try{b=s.e.build()}catch(err){b=null} if(!b)continue;q.push(Object.assign({},s.e,b))}
    else q.push(s.e);
  }
  return q;
}
/* Premier nie idzie dalej z pustymi krzesłami w rządzie.
   Wcześniej dało się przeczekać całą kadencję bez ani jednego ministra i nic
   z tego nie wynikało — teraz tydzień się nie kończy, dopóki rada nie jest obsadzona. */
function pusteResorty(){
  if(!G.gov||!G.pmOk||G.gov.pm!==G.me)return [];
  radaInit();
  const puste=RESORTY.filter(r=>!radaKto(r.id));
  if(!puste.length)return [];
  // jeśli nie ma kogo posadzić, nie ma czego wymagać — wakat jest wtedy stanem faktycznym
  const zajeci=Object.values(G.rada);
  const wolni=[G.me].concat((G.gov.parties||[]).filter(k=>k!==G.me))
    .flatMap(k=>G.p[k]?roster(G.p[k]):[])
    .filter(n=>!zajeci.includes(n));
  return wolni.length?puste:[];
}
function endWeek(){
  const puste=pusteResorty();
  if(puste.length){
    G.tab='premier';
    SFX.bad();
    modal('Kancelaria premiera','Rada ministrów niekompletna',
      `<p>Jesteś premierem, a ${puste.length===RESORTY.length?'żaden resort nie ma ministra'
        :`${puste.length} ${pl(puste.length,'resort stoi pusty','resorty stoją puste','resortów stoi pustych')}`}:
       <b>${puste.map(r=>r.n).join(', ')}</b>.</p>
       <p style="margin-top:10px">Sejm nie przejdzie do kolejnego tygodnia z niedokończonym gabinetem.
       Obsadź krzesła w <b>Kancelarii premiera</b>. Masz jeszcze ludzi, których da się tam posadzić —
       gdyby ich zabrakło, gra przestanie o to prosić.</p>`,
      [{l:'Idę obsadzić rząd',f:()=>{close();G.tab='premier';render()}}]);
    render();
    return;
  }
  const p=me();
  const dateFrom=gameDate();
  ustawPlany();
  ai();drift();aiGoals();aiAgents();aiTransfery();sitTick();
  sprzatnijRade();   // po transferach i odejściach rada musi zgadzać się ze składami partii
  zwlokaPrezydenta();   // ustawa nie może leżeć na biurku bez końca
  if(isEraNiestab()&&!G.eraNiestab){G.eraNiestab=1;
    say('<b>Era niestabilności.</b> Grudniowo-styczniowy chaos na serwerze ułatwia podbieranie ludzi z innych partii, i tobie, i botom. Potrwa do końca stycznia.','roy');}
  else if(!isEraNiestab()&&G.eraNiestab===1){G.eraNiestab=2;
    say('<b>Era niestabilności się kończy.</b> Werbunek wraca do normy.','roy');}
  if(G.gov)govTick();
  if(G.gov&&G.pmOk){
    G.gov.parties.forEach(k=>{const q=G.p[k];
      const w=resortyPartii(k)/Math.max(1,RESORTY.length);
      if(G.gov.appr>52){q.fame=cl(q.fame+.7+w*1.4);if(ch(.14+w*.3)){const gt=drawFrom('polityka',1);q.comp.eli+=gt.eli;q.comp.int+=gt.int;q.comp.ser+=gt.ser;q.mem+=gt.eli+gt.int+gt.ser}}
      else if(G.gov.appr<38){q.fame=cl(q.fame-.8);M(q,-1)}
      if(k===G.gov.pm){q.fame=cl(q.fame+2.6);q.act=cl(q.act+1.2);M(q,1.2)}});
  } else {
    /* Kryzys rządowy narasta. Pierwszy tydzień bez gabinetu to jeszcze normalne
       targi, ale każdy kolejny kosztuje coraz więcej: serwer przestaje wierzyć,
       że ktokolwiek to poskłada. Wcześniej brak rządu był praktycznie darmowy
       i dało się przeczekać całą kadencję bez premiera. */
    G.bezRzadu=(G.bezRzadu||0)+1;
    const t=G.bezRzadu, sila=Math.min(3.4,1+(t-1)*.55);
    alive().forEach(k=>{const q=G.p[k];
      q.act=cl(q.act-1.8*sila);q.uni=cl(q.uni-1.1*sila);M(q,-1.5*sila);
      if(t>=3)q.cred=cl(q.cred-.9*(sila-1));      // nikt nie wierzy klasie politycznej
    });
    G.kp=Math.max(0,G.kp-Math.round(4*sila));
    // przy przeciągającym się paraliżu ludzie zaczynają wychodzić z partii
    if(t>=4&&ch(.30+Math.min(.4,(t-4)*.09))){
      const poszli=giveBackCap(me(),1), ilu=poszli.eli+poszli.int+poszli.ser;
      if(ilu)say(`<b>Kryzys rządowy, tydzień ${t}.</b> Ludzie mają dość patrzenia na pusty gabinet — odchodzi ${ilu}.`,'bad');
    }
    if(t===1)say('<b>Serwer bez rządu.</b> Kanały cichną, nikt nic nie ustala.','bad');
    else if(t===3)say('<b>Trzeci tydzień bez rządu.</b> Aktywność i jedność lecą we wszystkich partiach, kasa wycieka szybciej.','bad');
    else if(t>=5&&ch(.5))say(`<b>Paraliż władzy: ${t} tydzień bez gabinetu.</b> Serwer przestaje traktować sejm poważnie.`,'bad');
    else if(ch(.35))say('<b>Serwer bez rządu.</b> Kanały cichną, ludzie odpływają, nikt nic nie ustala.','bad');
  }
  /* Dwunasty tydzień jest ostatnim. Po jego rozegraniu idziemy prosto do kampanii
     finałowej i do urn — wcześniej licznik szedł do trzynastu i gra pokazywała
     „13 z 12”, czyli tydzień, którego w kadencji nie ma. */
  const tydzienPrzed=G.week, ostatniTydzien=G.week>=G.weeks;
  if(!ostatniTydzien)G.week++;
  dateAnim={from:dateFrom,to:gameDate()};
  G.apMax=apBase();G.ap=G.apMax;
  G.sztab=G.sztabMax=5+Math.floor(p.mem/22);
  {  // premier i pałac ściągają ludzi sami z siebie
    const urz=(isPM()?1:0)+(hasPrez()?1:0);
    if(urz>0){const g=drawFrom('polityka',urz);const n=g.eli+g.int+g.ser;
      if(n){p.comp.eli+=g.eli;p.comp.int+=g.int;p.comp.ser+=g.ser;p.mem+=n;
        say(`<b>Urząd przyciąga.</b> ${isPM()&&hasPrez()?'Fotel premiera i pałac dorzucają':isPM()?'Fotel premiera dorzuca':'Pałac prezydencki dorzuca'} ${n} ${pl(n,'osobę','osoby','osób')} w tym tygodniu.`,'good')}}
  }
  G.kp+=income().total;
  {  // kapitał ma pracować: nadwyżka topnieje, a serwer zaczyna gadać o partii, która tylko zbiera
    const lim=Math.max(70,income().total*6)*(hasLsd(G.me)?1.9:1);
    if(G.kp>lim){
      const nad=G.kp-lim, kara=Math.round(nad*.24+5);
      G.kp-=kara;
      p.ctr=cl(p.ctr+Math.min(7,1.2+nad/80));
      p.fame=cl(p.fame-Math.min(4,nad/110));
      p.act=cl(p.act-Math.min(3,nad/150));
      say(`<b>Kapitał leży bezczynnie.</b> Limit to ${Math.round(lim)}, a ty trzymasz ${Math.round(G.kp+kara)}: przepada ${kara}, kontrowersja rośnie. Serwer nie lubi partii, które tylko zbierają.`,'bad');
    }
    /* Danina od leżącego kapitału partii poszła precz. Ustawa o podatkach robiła
       dwie zupełnie różne rzeczy pod jedną nazwą: skubała kapitał partii i osobno
       majątki prywatne, a do tego przestawiała progresję składek. Nie dało się
       z tego wyczytać, co właściwie robi jeden suwak. Zostaje jedno znaczenie:
       podatek od majątku dotyczy prywatnych kont i przez nie rusza PKB. */
  }
  // gospodarka rusza się raz na tydzień, po rozliczeniu daniny
  pkbTydzien();
  G.en=cl(G.en+enGain());
  Object.keys(G.used).forEach(k=>{if(ch(.42))G.used[k]=Math.max(0,G.used[k]-1)});
  // Tygodniowy ruch jest drobny i tylko uzupełnia to, co naprawdę liczy się przy
  // rozliczeniu kadencji — patrz demografiaSerwera().
  const total=PID.reduce((a,k)=>a+G.p[k].mem,0)+freeTot();
  if(total<SERVER_MAX&&ch(.45)){G.free.ser+=RI(0,1);if(ch(.16))G.free.int+=1}
  G.prev=snap();
  /* Kara szła z tego, że zostały niewydane akcje — a część decyzji akcję zwraca,
     więc odpalała się też komuś, kto zagrał i odzyskał punkt. Liczy się fakt
     zagrania czegokolwiek w tym tygodniu, i tylko to. */
  if(G.actedWeek!==G.term+'-'+tydzienPrzed){
    p.fame=cl(p.fame-1.8);p.act=cl(p.act-2.5);M(p,-4);p.uni=cl(p.uni-1);
    say('<b>Tydzień bez ruchu.</b> Nie zagrałeś ani jednej decyzji, więc kanały partii milczały: sława −1,8, aktywność −2,5, jedność −1.','bad');
  }
  if(G.actedWeek===G.term+'-'+tydzienPrzed)G.streak=(G.streak||0)+1;
  else G.streak=0;
  if(G.recCd>0)G.recCd--;
  aiProposeLaw();          // premier sterowany przez komputer też składa projekty
  aiObsadzRade();          // i sam obsadza ministerstwa, zamiast trzymać puste krzesła
  aiRekonstrukcja();       // a niewygodnego koalicjanta potrafi wyrzucić
  aiOpozycja();            // opozycja rozlicza rząd bez czekania na gracza
  histPush();SFX.week();
  G.catUsed={};G.used2={};G.lastCharge=null;podgladCache={};   // ostatnia decyzja przechodzi na kolejny tydzień, żeby kombinacje w ogóle działały
  // nastroje serwera dryfują tydzień po tygodniu, nikt nie wie, dokąd
  /* Nastrój segmentu nie dryfuje już losowo — liczy go grupyTydzien z zadowolenia
     grupy interesu, więc jest za co odpowiadać zamiast czekać na rzut kostką. */
  if(ch(.13)){const a=pick(SID);let b=pick(SID);while(b===a)b=pick(SID);
    G.mood[a]=cl(G.mood[a]+R(.06,.13),.76,1.28);
    G.mood[b]=cl(G.mood[b]-R(.05,.11),.76,1.28);
    say(`<b>Zmiana nastrojów.</b> „${sn(a)}” się mobilizują, „${sn(b)}” tracą zapał.`)}
  makeNoise();
  G.queue=buildEvents();
  {
    // ostrzeżenia nie mogą wstrzymywać kalendarza, inaczej wybory nigdy nie nadchodzą
    if(p.ctr>=90){
      // partia w paraliżu: sondaż na pół, kasa wycieka, ludzie uciekają
      const ucieklo=giveBackCap(p,2), n=ucieklo.eli+ucieklo.int+ucieklo.ser;
      G.kp=Math.max(0,G.kp-Math.round(8+p.mem*.35));   // kasa może się skończyć, ale nie zejść pod zero
      p.fame=cl(p.fame-3);p.act=cl(p.act-3);p.uni=cl(p.uni-3);
      say(`<b>Paraliż: kontrowersja ${Math.round(p.ctr)}/100.</b> Sondaż liczony na pół, z kasy ucieka ${Math.round(8+p.mem*.35)} kapitału`
        +(n?`, odchodzi ${n} ${pl(n,'osoba','osoby','osób')}`:'')+'. Schłodź to, zanim zostanie sam szyld.','bad');
    }
    else if(p.ctr>=70)say(`<b>Kontrowersja ${Math.round(p.ctr)}/100.</b> Przy 90 partia wpada w paraliż: sondaż na pół, kapitał na minus, ludzie wychodzą.`,'bad');
    else if(p.fame<=9&&p.act<=9)say(`<b>${p.lead} ma dość.</b> Sława ${Math.round(p.fame)}, aktywność ${Math.round(p.act)}, o partii nikt już nie pamięta. Rozwiązać cię nikt nie rozwiąże, ale tak się nie wygrywa wyborów.`,'bad');
    if(ostatniTydzien){G.phase='finalcamp';absolutorium()}
    else if(G.prez2&&G.week>=G.prez2.week){runRunoff();return}
    else if(G.week===6&&G.term%2===0&&(!G.prez||G.term>=G.prez.until)){G.phase='prez';G.prezState=null}
  }
  render();
}
function leaderTraitDrift(p,name){
  switch(name){
    // Tłuszczolt: Maciek nie przechodzi obok żadnej awantury, ale dwór go lubi
    case 'Maciek':    p.ctr=cl(p.ctr+2.8);p.pret=cl(p.pret+2.2); break;
    case 'Lager':     p.act=cl(p.act-2.4); break;
    case 'loof':      if(!goalDone('demokraci')){p.cred=cl(p.cred+1.5);p.uni=cl(p.uni+1.2);p.ctr=cl(p.ctr+2.6)} break;
    case 'Peterdeus': p.act=cl(p.act-1.9);p.uni=cl(p.uni-1.4); break;
    case 'Fazmiś':    p.fame=cl(p.fame+1.6);p.act=cl(p.act+3.4);p.cred=cl(p.cred-1.8); break;
    case 'Aryati':    p.act=cl(p.act+4.2); break;
    case 'Śledzik':   p.uni=cl(p.uni+2.2);p.fame=cl(p.fame+3.4); break;
    case 'Mietek Nocul': p.ctr=cl(p.ctr-1.8); break;
    case 'kenzo':     p.act=cl(p.act+2.6);p.cred=cl(p.cred+1.6); break;
    case 'Bartek':    p.cred=cl(p.cred-2.8);p.act=cl(p.act-1.6);
                      if(!G.lup[name])G.lup[name]=[0,0,0,0];
                      if(ch(.55)&&L(name).char<99)G.lup[name][0]+=1; break;
    // po celu „Kazikmistrz” ta sama osoba działa w drugą stronę
    case 'Kaziu':     if(goalDone('kazik')){p.cred=cl(p.cred+1.6);p.uni=cl(p.uni+1.4)}
                      else{p.cred=cl(p.cred-2.2);p.act=cl(p.act-2.6)} break;
    case 'Sulejman':  p.uni=cl(p.uni+2.4);p.ctr=cl(p.ctr+1.4); break;
    case 'Supernes':  p.fame=cl(p.fame+3.4);p.act=cl(p.act+3.8);
                      p.cred=Math.min(p.cred,40); break;
    case 'Vengeance': p.pret=cl(p.pret+1.6);p.fame=cl(p.fame+1.8); break;
    case 'Mnem':      p.fame=cl(p.fame+3.2);p.cred=cl(p.cred-2.4);p.pret=cl(p.pret+2); break;
  }
}
function drift(){
  PID.forEach(k=>{
    const p=G.p[k];if(p.dead)return;
    const ld=lead(k);
    p.fame=cl(p.fame-p.fame*.022-Math.min(.30,p.fame*.028));
    p.act=cl(p.act-1.3);p.ctr=cl(p.ctr-(G.wojna?.7:1.4));
    const t=Math.max(1,p.mem), re_=p.comp.eli/t, ri=p.comp.int/t, rs=p.comp.ser/t;
    p.uni=cl(p.uni-.4+(ld.autor-54)/32 + ri*1.5 + re_*.7 - rs*2.4);
    if(p.mem<=3)p.uni=Math.max(p.uni,14);   // trzyosobowa partia nie ma jak się rozpaść na frakcje
    p.ctr=cl(p.ctr + rs*1.5*(k===G.me&&hasT('populista')?.5:1) + re_*2.6 - ri*.9 + eliteRisk(p)*6);
    p.fame=cl(p.fame + ri*1.4 + re_*1.9);
    p.pret=cl(p.pret + ri*1.6 - rs*1.1);
    p.cred=cl(p.cred+(ld.komp-52)/30 + (p.comp.int*.9+p.comp.eli*.5-p.comp.ser*.7)/Math.max(1,p.mem) + (k===G.me&&hasT('technokrata')?.8:0));
    // Obecność osypuje się szybciej, niż wynikało z dawnych .945 — przy tamtym tempie
    // wystarczyło raz wejść w kanał i już się z niego nie schodziło. Teraz trzeba wracać.
    REG.forEach(r=>p.pres[r.id]=cl(p.pres[r.id]*(p.robMode?BAL.zanikObecnosciRob:p.kanMode?BAL.zanikObecnosciKanal:BAL.zanikObecnosci)));
    if(p.fame>p.pot)p.fame=cl(p.fame-(p.fame-p.pot)*.18);
    p.mom=cl((p.mom||0)*.83,-35,42);
    const cap=BASE[k].pot+16;
    if(p.mom>28&&ch(.20)&&p.pot<cap)p.pot=cl(p.pot+.5);
    if(p.mom<-18&&ch(.20))p.pot=cl(Math.max(BASE[k].pot-14,p.pot-.5));
    if(k==='KK')p.act=cl(p.act-1.1);
    if(k==='ROM')p.act=cl(p.act-2.0);
    goalDrift(k);
    if(p.fame<p.pot*.55)p.fame=cl(p.fame+1.1+(p.mem<12?1.1:0));   // każdy ma prawo do odbicia od dna
    if(k==='FD')p.pret=cl(p.pret+.5);
    leaderTraitDrift(p,p.lead);
    leads(p).slice(1).forEach(n=>leaderTraitDrift(p,n));
    /* Odejścia. Jedność je hamuje, ale nigdy nie zatrzymuje: przy pełnej zgodzie
       i tak co jakiś czas ktoś odpada, bo inaczej wystarczyło pilnować jedności,
       żeby partia rosła w nieskończoność. Im większa partia, tym trudniej ją
       utrzymać w kupie — moloch sam się osypuje. */
    if(p.mem>6){
      // Jedność nadal chroni — ale wyłącznie partie, które da się ogarnąć.
      // Każdy kolejny próg wielkości dokłada odejść, więc moloch osypuje się sam.
      const duza=p.mem>44?BAL.odejsciaDuza:0, olbrzym=p.mem>70?BAL.odejsciaOlbrzym:0, kolos=p.mem>100?BAL.odejsciaKolos:0;
      const podloga=p.mem>70?.13:p.mem>44?.10:p.mem>20?.055:.03;
      const szansa=cl(BAL.odejsciaBaza-(p.uni-50)/BAL.odejsciaJednosc+duza+olbrzym+kolos+(p.ctr>70?.10:0),podloga,.50);
      if(ch(szansa)){
        const ile=p.mem>90?3:p.mem>55?2:1, q2=giveBack(p,ile), n=q2.eli+q2.int+q2.ser;
        if(n&&k===G.me)say(`<b>Odejście z partii.</b> ${n} ${pl(n,'osoba odchodzi','osoby odchodzą','osób odchodzi')} po cichu. Przy jedności ${Math.round(p.uni)} zdarza się to ${szansa>.3?'często':szansa>.18?'czasem':'rzadko'}.`,'bad');
      }
    }
    // czasem zaplecze rezygnuje na dobre i wraca do bezpartyjnych, segment wg kompetencji
    /* Ludzie z zaplecza nie znikają już w powietrzu. Odejście bez powodu i bez
       śladu w decyzjach było tylko podatkiem od pecha — kto ma odejść, ten odchodzi
       do konkurencji (patrz aiTransfery), i wtedy widać dokąd i dlaczego. */
    // molochy: przy dużym, ustabilizowanym poparciu trzeba czasem poświęcić ludzi dla wizerunku, elita zostaje
    if(p.mem>150){
      const nadmiar=cl((p.mem-150)/300,0,1);
      const oslona=cl(1-(p.act-40)/80,.15,1);   // wysoka aktywność mocno ogranicza ryzyko
      if(ch(nadmiar*.4*oslona)){
        const seg=p.comp.ser>0?'ser':(p.comp.int>0?'int':null);
        if(seg){
          const cele=alive().filter(x=>x!==k);
          const cel=cele.length?pick(cele):null;
          p.comp[seg]--;p.mem--;
          if(cel){G.p[cel].comp[seg]++;G.p[cel].mem++}
          if(k===G.me)say(`<b>Zarządzanie wizerunkiem.</b> Przy tak dużym poparciu trzeba było kogoś poświęcić: ${seg==='ser'?'serwerowicz':'intelektualista'} przechodzi do ${cel?G.p[cel].ab:'konkurencji'}. Elita zostaje. Wyższa aktywność mocno obniża to ryzyko.`,'bad');
        }
      }
    }
    if(G.gov&&!G.pmOk&&G.gov.parties.includes(k))p.uni=cl(p.uni-.8);
  });
}
/* ══════════ CHARAKTERY PARTII ══════════
   Te same liczby, inne nawyki. Awanturnicy biją, dyplomaci budują relacje,
   spokojni rozbudowują partię. Bez tego wszystkie czternaście gra identycznie. */
const CHAR={
 PPP :{agr:.85,bud:.55},  KK  :{agr:.25,bud:.75},  FD  :{agr:.55,bud:.70},
 PLR :{agr:.40,bud:.80},  NP  :{agr:.35,bud:.85},  PKD :{agr:.30,bud:.70},
 ROM :{agr:.60,bud:.60},  PP  :{agr:.50,bud:.75},  POJ :{agr:.78,bud:.50},
 NBR :{agr:.45,bud:.65},  ZHM :{agr:.35,bud:.65},  DPD :{agr:.35,bud:.72},
 SS  :{agr:.35,bud:.90},
};
const charOf=k=>CHAR[k]||{agr:.5,bud:.7};

/* Na co partia stawia w danym tygodniu. Na początku kadencji buduje zaplecze,
   pod koniec rzuca wszystko w obecność i sławę, bo to one liczą się przy urnach. */
function aiWagi(k,p){
  const c=charOf(k), t=G.week/Math.max(1,G.weeks);
  const koniec=t>.62, start=t<.34;
  /* Zamiar na kadencję przechyla wagi: kto idzie po fotel premiera, ciśnie na mandaty,
     kto ratuje się przed progiem, zbiera ludzi i łata jedność. */
  const plan=p.plan||'rozbudowa';
  const P={
    premier:    {slawa:.10,obecnosc:.14,ludzie:.02,kondycja:0,   atak:.04},
    wladza:     {slawa:.05,obecnosc:.06,ludzie:.04,kondycja:.06, atak:.02},
    opozycja:   {slawa:.09,obecnosc:.05,ludzie:.02,kondycja:.02, atak:.12},
    rozbudowa:  {slawa:.02,obecnosc:.03,ludzie:.14,kondycja:.06, atak:0},
    przetrwanie:{slawa:.06,obecnosc:.10,ludzie:.10,kondycja:.12, atak:-.03},
  }[plan]||{};
  const b=n=>P[n]||0;
  // gdy ktoś odjeżdża reszcie stawki, opozycja twardnieje i częściej bije
  const heg=hegemon(), zagrozenie=(heg&&heg!==k)?.09:0;
  return [
    ['slawa',    .16+(koniec?.24:0)+(p.fame<38?.12:0)+b('slawa')],
    ['kondycja', .13+(start?.10:0)+(p.uni<44?.16:0)+(p.cred<40?.08:0)+b('kondycja')],
    ['ludzie',   .10+.14*c.bud+(start?.12:0)-(koniec?.10:0)+b('ludzie')],
    ['obecnosc', .20+(koniec?.28:0)+b('obecnosc')],
    ['program',  .06+(start?.05:0)],
    ['atak',     .04+.14*c.agr*(koniec?1.5:1)*(p.ctr>68?.15:1)+b('atak')+zagrozenie],
  ];
}
function aiLos(wagi){
  const suma=wagi.reduce((a,x)=>a+Math.max(0,x[1]),0)||1;
  let x=Math.random()*suma;
  for(const [n,w] of wagi){x-=Math.max(0,w);if(x<=0)return n}
  return wagi[0][0];
}
/* Gdzie dokładać obecność: nie tam, gdzie jesteśmy najsłabsi, tylko tam, gdzie
   mały wysiłek realnie przewróci wynik — duży kanał, w którym siedzimy tuż za liderem. */
function aiOkreg(k,p){
  let naj=null,najW=-1;
  REG.forEach(r=>{
    const moja=p.pres[r.id];
    let rywal=0;alive().forEach(x=>{if(x!==k)rywal=Math.max(rywal,G.p[x].pres[r.id])});
    const luka=rywal-moja;
    const szansa=luka<=0?1.15:luka<26?1.7:.45;      // blisko lidera albo już na czele
    const w=r.seats*szansa*(moja<10?.55:1)*(.85+Math.random()*.3);
    if(w>najW){najW=w;naj=r}
  });
  return naj||pick(REG);
}
/* W kogo uderzyć: w najgroźniejszego, z którym i tak jest źle, a nie w przypadkowego. */
function aiCel(k,prog){
  const heg=hegemon();
  // Przeciw komuś, kto odjeżdża całej stawce, partie zwierają szeregi nawet wtedy,
  // gdy formalnie nic do niego nie mają — dlatego hegemon łapie się na cel mimo dobrych relacji.
  const kand=alive().filter(x=>x!==k&&(G.rel[k][x]<prog||x===heg));
  if(!kand.length)return null;
  return kand.map(x=>({x,w:(G.p[x].seats*2.2+G.p[x].fame/3+(G.p[x].mom||0))*(x===heg?2.4:1)*(.8+Math.random()*.4)}))
    .sort((a,b)=>b.w-a.w)[0].x;
}

function ai(){
  alive().forEach(k=>{
    if(k===G.me)return;const p=G.p[k],ld=lead(k);
    aiZrzutka(k);          // po prywatne pieniądze sięga tylko partia pod kreską
    aiMedia(k);            // boty prowadzą własne wydawnictwa i też mają z nich zasięg
    const n=Math.max(1, 1+Math.round(p.act/34)+Math.round((p.uni-46)/26));   // rozsypana partia działa wolniej
    const wagi=aiWagi(k,p);
    for(let i=0;i<n;i++){
      const ruch=aiLos(wagi);
      if(ruch==='slawa'){const d=Math.max(.15,1-Math.pow(cl(p.fame/Math.max(p.pot,1),0,1.4),2.4));
        p.fame=cl(p.fame+R(1.8,4.4)*(.6+p.pot/150)*d*(.8+ld.char/250))}
      else if(ruch==='kondycja'){p.cred=cl(p.cred+R(1,2.8));p.uni=cl(p.uni+R(1,2.6))}
      else if(ruch==='ludzie'){if(ch((.60+p.fame/220)*cl(1-(p.mem-16)/62,.12,1)+(isEraNiestab()?.05:0))){const rg=aiOkreg(k,p),gt=drawFrom(rg.id,ch(.30)?2:1);
        p.comp.eli+=gt.eli;p.comp.int+=gt.int;p.comp.ser+=gt.ser;p.mem+=gt.eli+gt.int+gt.ser}p.act=cl(p.act+R(1,3))}
      else if(ruch==='obecnosc'){const rg=aiOkreg(k,p);p.pres[rg.id]=cl(p.pres[rg.id]+R(10,20))}
      else if(ruch==='program'){const t=topSeg(p);p.aff[t]+=R(.04,.16)}
      else if(ruch==='atak'&&p.ctr<70&&ch(.30)){
        // partie AI również prowadzą akcje sabotażowe
        const tg2=[aiCel(k,8)].filter(Boolean);
        if(tg2.length){const t2=tg2[0];
          if(!(t2===G.me&&me().pact[k]>G.week)){
            if(ch(.62)){const o=G.p[t2];o.fame=cl(o.fame-R(5,10));o.act=cl(o.act-R(6,12));
              REG.forEach(r2=>o.pres[r2.id]=cl(o.pres[r2.id]*.82));M(o,-6);
              G.rel[k][t2]=cl(G.rel[k][t2]-18,-100,100);G.rel[t2][k]=cl(G.rel[t2][k]-18,-100,100);
              if(t2===G.me)say(`<b>${p.ab} zorganizował sabotaż</b> na twoich kanałach, obecność i aktywność w dół.`,'bad')}
            else {p.cred=cl(p.cred-9);p.ctr=cl(p.ctr+14);p.fame=cl(p.fame-6);
              if(t2===G.me)say(`<b>${p.ab} próbował cię sabotować i wpadł.</b> Ich wiarygodność leci.`,'good')}}}
      }
      else if(ruch==='atak'&&p.ctr<70){
        const tg=[aiCel(k,12)].filter(Boolean);
        if(tg.length){const t=tg[0];
          if(t===G.me&&me().pact[k]>G.week)continue;
          if(ch(.62)){const o=G.p[t];o.fame=cl(o.fame-R(1.5,4));o.cred=cl(o.cred-R(1,3.5));p.ctr=cl(p.ctr+4);
            G.rel[k][t]=cl(G.rel[k][t]-14,-100,100);G.rel[t][k]=cl(G.rel[t][k]-14,-100,100);
            if(t===G.me)say(`<b>${p.lead} (${p.ab})</b> uderzył w ciebie publicznie.`,'bad')}
          else p.cred=cl(p.cred-4)}}
      else p.act=cl(p.act+R(2,6));
    }
    // AI wymienia słabych liderów
    if(p.bench.length&&ch(.03)){
      const best=p.bench.map(L).sort((a,b)=>b.avg-a.avg)[0];
      if(best.avg>L(p.lead).avg+9){const old=p.lead;p.lead=best.n;p.bench=p.bench.filter(x=>x!==best.n);
        if(!p.main.includes(old)&&!p.bench.includes(old))p.bench.push(old);p.uni=cl(p.uni+8);
        say(`<b>${p.ab}</b> zmienia przewodniczącego na <b>${best.n}</b>.`)}
    }
    // Przestawienie sterów to dla partii duża rzecz: obowiązuje ją ten sam limit
    // co gracza, czyli raz na kadencję, i nawet wtedy zdarza się rzadko.
    if(ch(.005)&&p.steryTerm!==G.term){
      const ilu=leads(p).length, cel=ilu===1?(ch(.75)?2:3):(ch(.55)?1:(ilu===2?3:2));
      const pula=roster(p).sort((a,b)=>L(b).avg-L(a).avg).slice(0,cel);
      if(pula.length===cel&&cel!==ilu){
        const stare=leads(p);
        p.lead=pula[0];p.lead2=pula[1]||null;p.lead3=pula[2]||null;
        pula.forEach(n=>{p.bench=p.bench.filter(y=>y!==n)});
        stare.forEach(n=>{if(!pula.includes(n)&&!p.main.includes(n)&&!p.bench.includes(n))p.bench.push(n)});
        p.uni=cl(p.uni+(cel===1?4:cel===2?-3:-7));p.ctr=cl(p.ctr+(cel===3?5:0));
        p.steryTerm=G.term;
        say(`<b>${p.ab}</b> przechodzi na ${cel===1?'jednoosobowe':cel===2?'dwuosobowe':'trzyosobowe'} przewodnictwo: ${pula.join(', ')}.`)}
    }
  });
}
/* ══════════ PLANY PARTII KOMPUTEROWYCH ══════════
   Bot przestaje losować ruch z płaskiej tabeli. Na starcie kadencji wybiera sobie
   zamiar i trzyma się go przez dwanaście tygodni — widać to potem w tym, co robi. */
const PLAN_OPIS={
  premier:'idzie po fotel premiera',
  wladza:'broni miejsca w rządzie',
  opozycja:'rozlicza rząd',
  rozbudowa:'buduje partię',
  przetrwanie:'ratuje się przed progiem',
};
function aiPlan(k){
  const p=G.p[k];
  const wRzadzie=!!(G.gov&&G.gov.parties.includes(k));
  const udzial=p.seats/Math.max(1,TOTAL_SEATS);
  if(p.mem<9||(p.seats===0&&p.fame<40))return 'przetrwanie';
  if(wRzadzie)return 'wladza';
  if(udzial>=.18||(p.seats>=4&&p.fame>58))return 'premier';
  if(p.mem<20)return 'rozbudowa';
  return 'opozycja';
}
function ustawPlany(){
  alive().forEach(k=>{if(k===G.me)return;
    const p=G.p[k];
    if(p.planTerm===G.term&&p.plan)return;    // zamiar obowiązuje całą kadencję
    p.plan=aiPlan(k);p.planTerm=G.term});
}
/* Kto odjeżdża reszcie stawki. Zwraca partię, przeciw której warto się zewrzeć. */
function hegemon(){
  const zywe=alive().filter(k=>G.p[k].seats>0);
  if(zywe.length<3)return null;
  const rank=zywe.slice().sort((a,b)=>G.p[b].seats-G.p[a].seats);
  const pierwszy=G.p[rank[0]].seats, drugi=G.p[rank[1]].seats;
  // odjeżdża, gdy ma połowę izby albo dwa razy tyle co następny
  if(pierwszy>=MAJ||(pierwszy>=drugi*2&&pierwszy>=6))return rank[0];
  return null;
}

/* Bot na fotelu premiera sam obsadza ministerstwa — inaczej rząd komputerowy
   stałby z pustymi krzesłami i zbierał za to kary. */
function aiObsadzRade(){
  radaInit();
  const g=G.gov;if(!g||!G.pmOk)return;
  const pm=g.pm;if(!pm||pm===G.me||!G.p[pm]||G.p[pm].dead)return;
  const puste=RESORTY.filter(r=>!radaKto(r.id));
  if(!puste.length)return;

  /* Rząd obsadza się od razu po powołaniu, a nie po jednym krześle na tydzień.
     Premier bierze najpierw swoich — to jego ludzie mają rządzić — a dopiero
     gdy ma połowę stołków, dokłada koalicjantom, żeby ich nie stracić. */
  const rozdane=[];
  puste.forEach(res=>{
    const zajeci=Object.values(G.rada);
    const wolniZ=k=>roster(G.p[k]).filter(n=>!zajeci.includes(n)&&!isPrezPerson(n)&&!isMarPerson(n));
    const bezTeki=g.parties.filter(k=>k!==pm&&resortyPartii(k)===0&&wolniZ(k).length);
    const swojeDosc=resortyPartii(pm)>=Math.ceil(RESORTY.length/2);
    const zrodlo=(swojeDosc&&bezTeki.length)?bezTeki[0]:(wolniZ(pm).length?pm:(bezTeki[0]||null));
    if(!zrodlo)return;
    const wolni=wolniZ(zrodlo);
    if(!wolni.length)return;
    const kto=wolni.slice().sort((a,b)=>L(b).komp-L(a).komp)[0];
    G.rada[res.id]=kto;
    rozdane.push({res,kto,zrodlo});
    if(zrodlo!==pm){
      G.rel[pm][zrodlo]=cl(G.rel[pm][zrodlo]+8,-100,100);
      G.rel[zrodlo][pm]=cl(G.rel[zrodlo][pm]+8,-100,100);
    }
  });
  if(rozdane.length&&(g.parties.includes(G.me)||me().seats>0))
    say(`<b>${G.p[pm].ab} rozdaje teki.</b> ${rozdane.map(x=>`${x.res.n}: ${x.kto} (${G.p[x.zrodlo].ab})`).join(' · ')}`);
}

/* Opozycja, która realnie rozlicza rząd: wotum nieufności, a przy bardzo słabym
   gabinecie nawet wniosek o rozwiązanie sejmu. */
function aiOpozycja(){
  const g=G.gov;if(!g||!G.pmOk)return;
  if(G.week<3||G.week>G.weeks-1)return;              // nie na starcie i nie tuż przed urnami
  const opoz=alive().filter(k=>k!==G.me&&!g.parties.includes(k)&&G.p[k].seats>=2&&G.p[k].plan==='opozycja');
  if(!opoz.length)return;
  const lider=opoz.slice().sort((a,b)=>G.p[b].seats-G.p[a].seats)[0];
  const p=G.p[lider], c=charOf(lider);
  const slabosc=(50-g.appr)/100+(g.minority?.35:0);
  if(slabosc<=0)return;

  // wniosek o rozwiązanie sejmu tylko przy naprawdę leżącym rządzie
  if(g.appr<26&&ch(.05+c.agr*.05)){
    const v=sejmVote('rozwiazanie',lider,lider,undefined);
    if(v.pass){
      g.parties.forEach(k=>{const q=G.p[k];
        q.fame=cl(q.fame-RI(10,18));q.mom=(q.mom||0)-20;M(q,-14);
        REG.forEach(r=>q.pres[r.id]=cl(q.pres[r.id]*.85))});
      p.fame=cl(p.fame+RI(8,13));M(p,16);
      say(`<b>${p.ab} przepchnął rozwiązanie sejmu</b> ${v.yes}:${v.no}. Idziemy do przedterminowych wyborów.`,
          g.parties.includes(G.me)?'bad':'good');
      G.gov=null;G.pmOk=false;G.bloc=null;G.week=G.weeks;
    }else{
      p.fame=cl(p.fame-RI(6,11));p.ctr=cl(p.ctr+9);APPR(+4);
      say(`<b>${p.ab} chciał rozwiązać sejm</b> i przegrał ${v.yes}:${v.no}.`,'');
    }
    return;
  }
  // zwykłe wotum nieufności
  if(!ch(cl(.05+slabosc*.28+c.agr*.06,0,.30)))return;
  const v=sejmVote('wotum',g.pm,lider,undefined);
  if(v.pass){
    say(`<b>${p.ab} obalił rząd</b> ${v.yes}:${v.no}. Przedterminowe wybory.`,
        g.parties.includes(G.me)?'bad':'good');
    p.fame=cl(p.fame+8);M(p,12);
    G.gov=null;G.pmOk=false;G.week=G.weeks;
  }else{
    p.fame=cl(p.fame-3);APPR(+3);
    say(`<b>${p.ab} złożył wotum nieufności</b> i przepadło ${v.yes}:${v.no}.`,'');
  }
}

/* Boty walczą o ludzi: biorą bezpartyjnych i podbierają z cudzych partii,
   także z twojej. Pula wolnych realnie się kurczy. */
function aiTransfery(){
  alive().forEach(k=>{
    if(k===G.me)return;
    const p=G.p[k];if(p.dead)return;
    const c=charOf(k), chetny=p.plan==='rozbudowa'||p.plan==='przetrwanie';
    // bezpartyjny za kapitał
    if(ch(.04+(chetny?.05:0)+c.bud*.04)){
      const wolni=AGENTS.filter(a=>agentFree(a.n));
      if(wolni.length){
        const a=pick(wolni), koszt=agentCost(a.n,1);
        if(p.bank===undefined)p.bank=0;
        if(p.mem>=6&&ch(cl(.30+p.fame/220,0,.75))){
          if(!G.agents)G.agents={};
          G.agents[a.n]=k;p.comp[a.seg]++;p.mem++;
          if(!p.bench.includes(a.n))p.bench.push(a.n);
          say(`<b>${p.ab}</b> podpisuje transfer: <b>${a.n}</b> (${sn(a.seg)}).`);
        }
      }
    }
    // werbunek imienny z cudzej partii, twoja też się liczy
    if(ch(.055+c.agr*.03+(chetny?.03:0))){
      // bierzemy na cel tylko partie, które naprawdę mają kogo stracić — inaczej
      // próba przepadała na pustej ławce i podbierania praktycznie nie było widać
      const wolniZ=x=>roster(G.p[x]).filter(n=>!isLead(G.p[x],n)&&!isPrezPerson(n)&&!isMarPerson(n)&&!isPMperson(n));
      const cele=alive().filter(x=>x!==k&&G.p[x].mem>4&&wolniZ(x).length);
      if(!cele.length)return;
      // najchętniej tam, gdzie jest z czego wybierać, a relacje nie są wrogie
      const cel=cele.map(x=>({x,w:wolniZ(x).length*1.4+G.rel[k][x]/22+Math.random()*3}))
        .sort((a,b)=>b.w-a.w)[0].x;
      const o=G.p[cel];
      const pula=wolniZ(cel);
      const kto=pick(pula);
      const szansa=cl(.18+G.rel[cel][k]/260+(p.fame-o.fame)/300-o.uni/380,.06,.5);
      if(!ch(szansa)){
        G.rel[k][cel]=cl(G.rel[k][cel]-6,-100,100);G.rel[cel][k]=cl(G.rel[cel][k]-6,-100,100);
        if(cel===G.me)say(`<b>${p.ab}</b> próbował ściągnąć <b>${kto}</b> z twojej partii. Odmówił.`,'good');
        return;
      }
      const seg=L(kto).komp>=80?'eli':'int';
      if(o.mem>1){o.comp[seg]>0?o.comp[seg]--:(o.comp.int>0?o.comp.int--:o.comp.ser--);o.mem--}
      o.main=o.main.filter(x=>x!==kto);o.bench=o.bench.filter(x=>x!==kto);
      p.comp[seg]++;p.mem++;if(!p.bench.includes(kto))p.bench.push(kto);
      G.rel[k][cel]=cl(G.rel[k][cel]-16,-100,100);G.rel[cel][k]=cl(G.rel[cel][k]-16,-100,100);
      o.uni=cl(o.uni-4);
      if(cel===G.me)say(`<b>${p.ab} podebrał ci ${kto}.</b> Przeszedł do nich z całym dorobkiem.`,'bad');
      else if(k===G.me)say(`<b>${kto}</b> przechodzi do ciebie z ${o.ab}.`,'good');
      // transfery między innymi partiami też widać, ale bez zasypywania kroniki
      else if(ch(.4))say(`<b>${kto}</b> przechodzi z ${o.ab} do ${p.ab}.`);
    }
  });
}

/* Premier z komputera potrafi wyrzucić koalicjanta, który mu przeszkadza. */
function aiRekonstrukcja(){
  const g=G.gov;if(!g||!G.pmOk)return;
  const pm=g.pm;if(!pm||pm===G.me||!G.p[pm]||G.p[pm].dead)return;
  if(!ch(.02))return;
  const wrogowie=g.parties.filter(k=>k!==pm&&k!==G.me&&G.rel[pm][k]<-25&&resortyPartii(k)>0);
  if(!wrogowie.length)return;
  const cel=wrogowie[0];
  const v=sejmVote('minister',cel,pm,undefined);
  if(v.pass){
    RESORTY.forEach(r=>{const n=radaKto(r.id);if(n&&partiaOsoby(n)===cel)delete G.rada[r.id]});
    govLeave(cel);
    say(`<b>${G.p[pm].ab} wyrzucił ${G.p[cel].ab} z rządu</b> ${v.yes}:${v.no}.`,cel===G.me?'bad':'');
  }
}

function govTick(){
  const g=G.gov;
  APPR(+R(-3.5,2.6)+(g.minority?-4.5:0)+(G.pmOk?0:-3)
    +(G.prez&&!g.parties.includes(G.prez.party)?-1.2:.6));
  if(g.minority){
    const seats=g.parties.reduce((a,k)=>a+G.p[k].seats,0);
    if(seats>=MAJ){g.minority=0;g.royal=0;say('<b>Rząd odzyskał większość.</b>','good')}
    else if(ch(.26)||g.appr<26){
      collapseGov(`Rząd mniejszościowy ${G.p[g.pm].lead} (${seats}/${TOTAL_SEATS}) nie przetrwał głosowania.`);return}
  }
  if(ch(.10)){const d=RI(4,11);APPR(-d);
    say(`<b>Wpadka rządu.</b> Poparcie −${d}.`,g.parties.includes(G.me)?'bad':'good')}
  radaTick();
}
/* Ministrowie pracują na konto swoich partii, a puste resorty mszczą się na premierze. */
function radaTick(){
  radaInit();
  const g=G.gov;if(!g)return;
  RESORTY.forEach(r=>{
    const kto=radaKto(r.id);if(!kto)return;
    const k=partiaOsoby(kto);if(!k||!G.p[k]||G.p[k].dead)return;
    const komp=L(kto).komp;
    G.p[k].fame=cl(G.p[k].fame+.34+komp/380);
    G.p[k].act=cl(G.p[k].act+.28);
    if(komp>=72)G.p[k].cred=cl(G.p[k].cred+.16);
  });
  // Rząd bez obsadzonych resortów po prostu nie działa i widać to na zewnątrz.
  const puste=RESORTY.filter(r=>!radaKto(r.id)).length;
  if(!puste)return;
  const odWyborow=G.week;
  if(odWyborow>3){
    const pm=g.pm&&G.p[g.pm];
    APPR(-puste*.9);
    if(pm){
      pm.ctr=cl(pm.ctr+puste*.55);
      pm.mom=(pm.mom||0)-puste*1.4;
      if(g.pm===G.me&&G.week%3===0)
        say(`<b>${puste} ${pl(puste,'resort stoi pusty','resorty stoją puste','resortów stoi pustych')}.</b> Serwer widzi rząd, który nie rządzi: kontrowersja rośnie, a rozpęd leci w dół.`,'bad');
    }
  }
}
function APPR(x){if(G&&G.gov){G.gov.appr=Math.max(0,Math.min(100,G.gov.appr+x))}return (G&&G.gov)?G.gov.appr:0}
function collapseGov(why){
  say(`<b>Rząd upadł.</b> ${why} Przedterminowe wybory.`,'bad');
  if(G.gov&&G.gov.parties.includes(G.me))M(me(),-10);
  G.gov=null;G.pmOk=false;G.bloc=null;G.opoBloc=null;
  G.week=Math.max(G.week,G.weeks);
}
function govLeave(c){
  if(!G.gov)return;
  G.gov.parties=G.gov.parties.filter(k=>k!==c);
  RESORTY.forEach(r=>{const n=radaKto(r.id);if(n&&partiaOsoby(n)===c)delete G.rada[r.id]});
  const s=G.gov.parties.reduce((a,k)=>a+G.p[k].seats,0);
  if(s<MAJ){collapseGov(`${G.p[c].n} opuściło koalicję, rząd stracił większość.`);return}
  say(`<b>${G.p[c].ab} wychodzi z rządu.</b> Koalicja utrzymuje większość ${s}/${TOTAL_SEATS}.`,'bad');
}

/* ══════════ WYBORY ══════════ */
function runElection(){
  SFX.elect();
  G.turnout=cl(.80+R(-.05,.09),.7,.98);
  const q=tally(),AL=allocate(q.res,q.total);
  const votes=Object.fromEntries(PID.map(k=>[k,Math.round(q.res[k].tot)]));
  PID.forEach(k=>G.p[k].seats=AL.out[k]);
  G.result={votes,A:AL,q};
  const p0=G.p[G.me];
  G.hist.push({term:G.term,seats:Object.fromEntries(PID.map(k=>[k,G.p[k].seats])),
    pct:q.res[G.me].tot/q.total*100,pm:G.gov?G.gov.pm:null,
    mem:p0.mem,goals:Object.keys(G.goals||{}).length,
    // stan, z którym poszedłeś do urn — na tym opiera się rozliczenie kadencji
    fame:Math.round(p0.fame),uni:Math.round(p0.uni),cred:Math.round(p0.cred),
    ctr:Math.round(p0.ctr),act:Math.round(p0.act),
    pres:Math.round(REG.reduce((a,r)=>a+p0.pres[r.id],0)/Math.max(1,REG.length)),
    znuz:Math.round(znuzenie(G.me)),
    presReg:Object.fromEntries(REG.map(r=>[r.id,Math.round(p0.pres[r.id])]))});
  const prevS=G.hist.length>1?G.hist[G.hist.length-2].seats[G.me]:G.p[G.me].seats;
  M(me(),cl((G.p[G.me].seats-prevS)*3,-20,24));
  G.prest+=G.p[G.me].seats*2;XP(12+G.p[G.me].seats*2);
  PID.forEach(k=>{G.p[k].rally=0;G.p[k].laws=0});
  G.gov=null;G.pmOk=false;G.bloc=null;G.opoBloc=null;G.phase='result';
  startNight();
  say(`<b>Wybory.</b> Zdobywasz ${G.p[G.me].seats} ${pl(G.p[G.me].seats,'mandat','mandaty','mandatów')}.`,
      G.p[G.me].seats>0?'good':'bad');
  /* Pax Mathiae leci, kiedy wybory wygrywa partia Maćka — obojętnie, czy prowadzi
     ją gracz, czy komputer. Wygrana to najwięcej mandatów, a nie sam udział. */
  {const naj=alive().reduce((a,k)=>a===null||G.p[k].seats>G.p[a].seats?k:a,null);
   if(naj&&G.p[naj].seats>0&&isLead(G.p[naj],'Maciek'))graj('pax');}
  render();
}
function accepts(k,bonus=0){
  bonus+=hasT('negocjator')?10:0;
  const DIP={'Mietek Nocul':14,'Bartek':4,'Śledzik':-12,'kenzo':-18,
    'Kaziu':goalDone('kazik')?14:-16,'Supernes':-16};   // Kazikmistrz odwraca jego reputację
  bonus+=(DIP[me().lead]||0)+(DIP[G.p[k].lead]||0)*.5;
  if(goalDone('republika'))bonus+=12;
  if(hasAds(G.me))bonus-=25;
  if(hasAds(k))bonus-=12;
  if(hasLib(G.me))bonus+=10;
  if(hasLib2(G.me))bonus+=18;
  if(hasPer(G.me))bonus+=20;
  if(hasCen(G.me))bonus+=8;      // ze środkiem każdemu jest po drodze
  if(hasHeg(G.me))bonus-=10;     // z hegemonem nikt nie chce iść pod rękę
  if(G.wojna)bonus-=14;
  if(goalDone('demokraci')&&isLead(me(),'loof'))bonus+=12;
  if(isLead(me(),'Sulejman'))bonus+=(G.p[k].seats<=4?20:-12);   // z niszowymi łatwo, z gigantami pod górkę
  // wspólna lista wyborcza to zobowiązanie: kto szedł z tobą do wyborów, wchodzi do rządu
  if(bylWBloku(k))return true;
  const r=G.rel[k][G.me];
  if(r<0)return false;                          // ujemne relacje = nie ma rozmowy
  if(r+bonus>=30)return true;                   // zielone relacje wystarczą same
  return r+bonus-ideo(k,G.me)*1.15>=26}
/* czy szliśmy do ostatnich wyborów z jednej listy */
function bylWBloku(k){
  return !!(G&&G.blokWyborczy&&G.blokWyborczy.includes(k)&&k!==G.me);
}
function aiGov(force){
  const rank=alive().filter(k=>G.p[k].seats>0).sort((a,b)=>G.p[b].seats-G.p[a].seats);
  if(!rank.length){G.gov=null;return}
  if(force){ // rząd zastany: dobiera partnerów po mandatach i chęci, aż do większości
    const pm=rank[0];let team=[pm],s=G.p[pm].seats;
    rank.filter(k=>k!==pm)
      .map(k=>({k,w:G.p[k].seats*3+(G.rel[k][pm]-ideo(k,pm)*2)/4}))
      .sort((a,b)=>b.w-a.w)
      .forEach(x=>{if(s<MAJ){team.push(x.k);s+=G.p[x.k].seats}});
    setGov(team,pm,RI(50,62));G.gov.minority=s<MAJ?1:0;G.gov.pmLead=pmOsoba(pm)||G.p[pm].lead;return;
  }
  // Koalicję składa się z rachunku: najpierw ci, którzy wnoszą najwięcej mandatów
  // przy najmniejszym oporze, i tylko tylu, ilu trzeba do większości. Szeroka koalicja
  // to więcej resortów do oddania, więc nikt nie bierze do rządu na zapas.
  for(const pm of rank){
    let team=[pm],s=G.p[pm].seats;
    const kolejka=rank.filter(k=>k!==pm)
      .map(k=>({k,chetny:G.rel[k][pm]-ideo(k,pm)*2.2,mand:G.p[k].seats}))
      .filter(x=>x.chetny>=18)
      .sort((a,b)=>(b.mand*3+b.chetny/4)-(a.mand*3+a.chetny/4));
    for(const x of kolejka){
      if(s>=MAJ)break;                       // mamy większość, nikogo więcej nie dobieramy
      team.push(x.k);s+=x.mand;
    }
    if(s>=MAJ){setGov(team,pm,RI(46,60));G.gov.pmLead=pmOsoba(pm)||G.p[pm].lead;return}
  }
  setGov([rank[0]],rank[0],RI(36,48));G.gov.pmLead=pmOsoba(rank[0])||G.p[rank[0]].lead;
}
function setGov(team,pm,appr){
  const tot=team.reduce((a,k)=>a+G.p[k].seats,0)||1;
  /* Resortów jest dokładnie tyle, ile ministerstw w radzie, i liczy się wyłącznie to,
     kto na nich siedzi. Wcześniej obok rady chodził drugi, abstrakcyjny licznik ośmiu
     „przydziałów” — rozjeżdżał się z rzeczywistością i to z niego brały się bzdury
     w rodzaju odwoływania ministra, którego nie ma. */
  /* Sprawczość: czy ten rząd cokolwiek dowozi. Rośnie z każdą przegłosowaną ustawą,
     spada z każdą przegraną. Nie decyduje o wszystkim, ale premier, który przegrywa
     głosowanie za głosowaniem, przestaje być traktowany poważnie. */
  G.gov={parties:team,pm,appr,minority:tot<MAJ?1:0,spraw:50,wygrane:0,przegrane:0};
  G.rada={};                                  // nowy rząd zaczyna od pustych krzeseł
  G.radaOd={};
  G.bezRzadu=0;                               // kryzys rządowy się skończył, licznik kar wraca do zera
}
/* Ile ministerstw realnie obsadziła dana partia. */
function resortyPartii(k){
  radaInit();
  return RESORTY.filter(r=>{const n=radaKto(r.id);return n&&partiaOsoby(n)===k}).length;
}

/* ══════════ PROCEDURA PREMIERA ══════════ */
function topSeats(n){return alive().filter(k=>G.p[k].seats>0)
  .sort((a,b)=>G.p[b].seats-G.p[a].seats).slice(0,n)}
function ownPool(k){return [...new Set(G.p[k].main.concat(G.p[k].bench))]}
function bestRep(k){
  const free=ownPool(k).filter(n=>!isPMperson(n)&&!isPrezPerson(n)&&!isMarPerson(n));
  const pool=free.length?free:ownPool(k);
  return pool.map(L).sort((a,b)=>(b.char*.6+b.komp*.4)-(a.char*.6+a.komp*.4))[0];
}
function raceScore(k,who,boost){
  const p=G.p[k], ld=L(who||G.p[k].lead);
  return Math.max(.5, p.seats*1.35+p.fame*.20+p.cred*.12+ld.char*.24+(boost||0)/5+R(-6,6));
}
function runRace(cands){
  const raw=cands.map(c=>({...c,v:Math.pow(raceScore(c.k,c.who,c.boost),1.55)}));
  const sum=raw.reduce((a,x)=>a+x.v,0)||1;
  return raw.map(x=>({...x,pct:x.v/sum*100})).sort((a,b)=>b.pct-a.pct);
}
function startMar(){
  G.sejmPrez={marszalek:null,wice:[],marszalekLead:null};
  G.mar={stage:'marChoice',pool:topSeats(4),result:null,winner:null,who:null,decision:null,boost:0};
  G.phase='marszalek';render();
}
function marDeclare(run,who,boost){
  const m=G.mar;
  m.decision=run?{who,boost:boost||0}:'skip';
  const pool=m.pool.filter(k=>k!==G.me||run);
  const cands=pool.map(k=>{
    if(k===G.me&&run)return {k,who,boost:boost||0};
    const rep=bestRep(k);return {k,who:rep?rep.n:G.p[k].lead,boost:0};
  });
  if(!cands.length){m.result=[];m.winner=null;m.who=null}
  else{m.result=runRace(cands);m.winner=m.result[0].k;m.who=m.result[0].who}
  render();
}
function marContinue(){
  const m=G.mar,sp=G.sejmPrez;
  if(m.stage==='marChoice'){
    sp.marszalek=m.winner; sp.marszalekLead=m.winner?m.who:null;
    if(m.winner){say(`<b>${m.who} marszałkiem sejmu</b> (${G.p[m.winner].ab}), ${fmt(m.result[0].pct)}% w wyścigu.`,'roy');
      if(m.winner===G.me){G.prest+=10;XP(14);G.cat='mar'}}
    G.mar={stage:'countPrompt',count:null,countVote:null};render();return;
  }
  if(m.stage==='countPrompt'){
    G.mar={stage:'countA',countVote:null};render();return;
  }
  if(m.stage==='countA'){
    if(!G.mar.countVote){G.mar.countVote=sejmVote('depcount','c2',G.me);render();return}
    const v=G.mar.countVote;
    if(v.pass){G.mar={stage:'countResult',count:2,countVote:v};render();return}
    G.mar={stage:'countB',countVote:null};render();return;
  }
  if(m.stage==='countB'){
    if(!G.mar.countVote){G.mar.countVote=sejmVote('depcount','c1',G.me);render();return}
    const v=G.mar.countVote;
    if(v.pass){G.mar={stage:'countResult',count:1,countVote:v};render();return}
    G.mar={stage:'countZero',count:0,countVote:v};
    say('<b>Sejm przyjmuje przez aklamację</b>: wicemarszałków nie będzie.','roy');
    render();return;
  }
  if(m.stage==='countResult'){
    const c=m.count;
    say(c===2?`<b>Sejm zatwierdza dwóch wicemarszałków.</b>`:`<b>Sejm zatwierdza jednego wicemarszałka.</b>`);
    if(!c){G.mar={stage:'done'};marFinish();return}
    G.mar={stage:'depChoice',slot:1,count:c,
      pool:topSeats(6).filter(k=>k!==sp.marszalek),result:null,winner:null,who:null,decision:null,boost:0};
    render();return;
  }
  if(m.stage==='countZero'){
    G.mar={stage:'done'};marFinish();return;
  }
  if(m.stage==='depChoice'){
    if(m.winner){sp.wice.push(m.winner);
      say(`<b>${m.who} wicemarszałkiem</b> (${G.p[m.winner].ab}), ${fmt(m.result[0].pct)}% w wyścigu.`,'roy');
      if(m.winner===G.me){G.prest+=6;XP(8)}}
    if(m.slot>=m.count){G.mar={stage:'done'};marFinish();return}
    // druga (i kolejna) tura wicemarszałka zawsze rozstrzyga się wśród innych ugrupowań
    const used=new Set([sp.marszalek,...sp.wice,G.me]);
    G.mar={stage:'depChoice',slot:m.slot+1,count:m.count,
      pool:topSeats(6).filter(k=>!used.has(k)),result:null,winner:null,who:null,decision:null,boost:0};
    render();return;
  }
}
function marFinish(){
  const sp=G.sejmPrez;
  say(`Prezydium sejmu: marszałek <b>${sp.marszalek?G.p[sp.marszalek].lead:'wakat'}</b>, wicemarszałkowie: ${sp.wice.map(k=>G.p[k].lead).join(', ')||'brak'}.`);
  if(isMar()||isWice())G.cat='mar';
  G.phase='camp';G.mar=null;startTerm();
}
function isMar(){return !!(G.sejmPrez&&G.sejmPrez.marszalek===G.me)}
function isWice(){return !!(G.sejmPrez&&G.sejmPrez.wice.includes(G.me))}
function isMarPerson(n){return !!(G.sejmPrez&&G.sejmPrez.marszalekLead&&G.sejmPrez.marszalekLead===n)}
function startPM(){
  G.pmOk=false;
  G.sejmPrez=null; // prezydium poprzedniej kadencji wygasa wraz z sejmem
  G.pmProc={round:1,tries:[],cand:null,by:null,vote:null,triedThisCycle:[]};
  G.phase='pmvote';
  nextCandidate();
  render();
}
function nextCandidate(){
  const pr=G.pmProc;
  if(!pr.triedThisCycle)pr.triedThisCycle=[];
  pr.lista=alive().filter(x=>G.p[x].seats>0&&!pmBlocked(x)&&!pr.triedThisCycle.includes(x))
    .sort((a,b)=>kingScore(b)-kingScore(a));
  if(!pr.lista.length){
    pr.cycle=(pr.cycle||0)+1;
    pr.triedThisCycle=[];
    pr.lista=alive().filter(x=>G.p[x].seats>0&&!pmBlocked(x)).sort((a,b)=>kingScore(b)-kingScore(a));
    say(`<b>Sejm wyczerpał listę kandydatów.</b> Runda ${pr.round}: głosowania zaczynają się od nowa.`,'bad');
  }
  /* Skrajny przypadek: w izbie nie ma nikogo, kogo dałoby się zgłosić — wszyscy
     albo bez mandatów, albo wykluczeni. Wcześniej procedura szła dalej z pustym
     kandydatem i ekran wyboru premiera wywracał się na odwołaniu do partii,
     której nie ma. Teraz Król po prostu rozwiązuje izbę i wracamy do kampanii. */
  if(!pr.lista.length){
    say('<b>Nie ma kogo zgłosić na premiera.</b> Król Mordeczka rozwiązuje sejm, idziemy do przedterminowych wyborów.','roy');
    G.gov=null;G.pmOk=false;G.pmProc=null;G.bloc=null;
    G.phase='camp';G.week=G.weeks;
    return;
  }
  if(pr.round===1){
    /* Pierwsza desygnacja należy do rządu, o ile rząd w ogóle stoi: koalicja
       zawiązała się wokół konkretnego premiera i to jego zgłasza.

       Wcześniej brany był ulubieniec Króla z całej izby i — co gorsza — od razu
       nadpisywał G.gov.pm. Stąd trzy dziwactwa naraz: rząd desygnował kogoś
       spoza siebie, gubił po drodze własnego kandydata, a potem karnie głosował
       za obcym, bo dyscyplina koalicyjna patrzy właśnie na G.gov.pm. */
    const zRzadu=(G.gov&&G.gov.parties)?pr.lista.filter(k=>G.gov.parties.includes(k)):[];
    if(G.gov&&G.gov.pm&&zRzadu.includes(G.gov.pm)){
      pr.by='Koalicja'; pr.cand=G.gov.pm;
    }else if(zRzadu.length){
      pr.by='Koalicja'; pr.cand=zRzadu[0]; G.gov.pm=pr.cand;
    }else{
      pr.by='Zezwolenie Króla Mordeczki'; pr.cand=pr.lista[0]||null;
    }
    pr.choose=false;
  }else if(pr.round%3===2){
    pr.by='Król Mordeczka';
    pr.cand=pr.lista[0]||null; pr.choose=false;
  }else{
    pr.by='Sejm';
    const pool=pr.lista.filter(k=>G.p[k].seats>=Math.max(3,Math.round(TOTAL_SEATS*.10)));
    const use=pool.length?pool:pr.lista;
    pr.cand=null; pr.choose=G.p[G.me].seats>0&&use.includes(G.me);
    if(!pr.choose){const c=use.slice().sort((a,b)=>G.p[b].seats-G.p[a].seats);pr.cand=c[0]||null}
  }
  pr.vote=null;G.bribeCache={};
}
function doPMVote(cand,myVote){
  const pr=G.pmProc; if(!pr||!cand)return;
  pr.cand=cand;
  const v=sejmVote('pm',cand,cand,myVote);
  pr.vote=v;
  pr.tries.push({round:pr.round,cand,yes:v.yes,no:v.no,abst:v.abst,pass:v.pass});
  if(!pr.triedThisCycle)pr.triedThisCycle=[];
  if(!pr.triedThisCycle.includes(cand))pr.triedThisCycle.push(cand);
  if(v.pass){
    G.pmOk=true;
    // podstawą rządu jest zgłoszona koalicja; kto zagłosował za, może ją dopełnić do większości
    const declared=(G.gov&&G.gov.parties&&G.gov.parties.includes(cand))?G.gov.parties.slice():[cand];
    const team=declared.slice();
    let bs=team.reduce((a,k)=>a+G.p[k].seats,0);
    alive().filter(k=>G.p[k].seats>0&&!team.includes(k)&&v.by[k]>0)
      .sort((a,b)=>G.p[b].seats-G.p[a].seats)
      .forEach(k=>{if(bs<MAJ){team.push(k);bs+=G.p[k].seats}});
    setGov(team,cand,RI(48,62));
    G.gov.minority=bs<MAJ?1:0;
    G.gov.pm=cand; G.gov.pmLead=pmOsoba(cand)||G.p[cand].lead;
    const szef=G.gov.pmLead;   // konkretna osoba z fotela, nie pierwszy lider z brzegu
    gainAutor(szef,RI(2,4));
    if(G.gov.minority)say(`<b>Rząd ${szef} nie ma większości</b> (${bs}/${TOTAL_SEATS}). Utrzyma się najwyżej kilka tygodni.`,'bad');
    if(cand===G.me){G.prest+=20;M(me(),24);XP(30);me().fame=cl(me().fame+9)} else if(G.gov.parties.includes(G.me)){G.prest+=8;M(me(),8);XP(10)}
    makeBlocs();
    say(`<b>${szef} zostaje premierem</b> (${G.p[cand].ab}), ${v.yes}:${v.no}.`,'roy');
  }else{
    say(`<b>${pmOsoba(cand)||G.p[cand].lead} nie uzyskał wotum zaufania</b> ${v.yes}:${v.no}.`,'bad');
    if(cand===G.me)M(me(),-8);
  }
  render();
}
/* Ile rund sejm może przepalić, zanim Król przestaje pytać o zdanie. */
const PM_RUNDY_MAX=8;
function pmFailForward(){
  /* Był tu wariant, w którym Król powoływał rząd mniejszościowy zamiast pozwolić
     sejmowi szukać dalej. Leżał wyłączony na sztywno i tak został — usunięty,
     bo kryzys rządowy ma teraz własne, narastające koszty i sam się rozstrzyga. */
  const pr=G.pmProc;
  pr.round++;
  // paraliż sejmu uderza w cały serwer
  alive().forEach(k=>{const q=G.p[k];q.act=cl(q.act-1.2);q.uni=cl(q.uni-.8);M(q,-1)});
  /* Bez tego dało się głosować przeciw w nieskończoność — także przeciw kandydatowi
     własnej koalicji — i kadencja nigdy nie ruszała. Po ośmiu rundach Król kończy
     targi i powołuje rząd z najsilniejszego ugrupowania, które ma z kim rządzić. */
  if(pr.round>PM_RUNDY_MAX){
    const rank=alive().filter(k=>G.p[k].seats>0&&!pmBlocked(k))
      .sort((a,b)=>G.p[b].seats-G.p[a].seats||kingScore(b)-kingScore(a));
    const pm=rank[0]||alive().filter(k=>G.p[k].seats>0).sort((a,b)=>G.p[b].seats-G.p[a].seats)[0];
    if(!pm){nextCandidate();render();return}
    let team=[pm],bs=G.p[pm].seats;
    alive().filter(k=>k!==pm&&G.p[k].seats>0)
      .map(k=>({k,w:G.p[k].seats*3+(G.rel[k][pm]||0)/4}))
      .sort((a,b)=>b.w-a.w)
      .forEach(x=>{if(bs<MAJ){team.push(x.k);bs+=G.p[x.k].seats}});
    setGov(team,pm,RI(34,46));
    G.gov.minority=bs<MAJ?1:0;G.gov.royal=1;G.pmOk=true;
    G.gov.pmLead=pmOsoba(pm)||G.p[pm].lead;
    // rząd z nadania, nie z wyboru — cały sejm płaci za przeciąganie
    alive().forEach(k=>{const q=G.p[k];q.cred=cl(q.cred-4);M(q,-6)});
    if(pm===G.me){G.prest+=6;M(me(),4)}
    say(`<b>Król Mordeczka kończy targi.</b> Po ${PM_RUNDY_MAX} nieudanych głosowaniach powołuje rząd `
      +`<b>${G.gov.pmLead}</b> (${G.p[pm].ab})${G.gov.minority?', bez większości':''}. Sejm wychodzi z tego bez twarzy.`,'roy');
    modal('Pałac','Król powołuje rząd z nadania',
      `<p>Sejm nie wyłonił premiera przez ${PM_RUNDY_MAX} rund. Król przestał pytać o zdanie
       i powierzył misję <b>${G.gov.pmLead}</b> z ${G.p[pm].ab}.</p>
       <p style="margin-top:10px">${G.gov.minority?'To rząd mniejszościowy — utrzyma się tylko do pierwszego wotum.'
         :'Rząd ma większość, ale nie ma mandatu od izby.'}
       Wszystkim partiom spadła wiarygodność: przeciąganie procedury kosztuje cały sejm.</p>`,
      [{l:'Rozumiem',f:()=>{close();makeBlocs();render()}}]);
    makeBlocs();render();return;
  }
  nextCandidate();render();
}

/* ══════════ BLOKI POLITYCZNE ══════════ */
const BLOCPAL=['#e0b23c','#4bbd85','#5a9be8','#e2606f','#a98bd8','#d98b4a','#4f8a52','#c0392b','#2e6b46','#7b2fbe'];
const OPONAMES=[
 {s:'eli',n:'Front Korony',k:'FK'},{s:'eli',n:'Przymierze Ołtarza',k:'PO'},
 {s:'eli',n:'Rada Starszych',k:'RS'},{s:'eli',n:'Pakt Zasłużonych',k:'PZ'},
 {s:'eli',n:'Liga Dawnych Rodów',k:'LDR'},{s:'eli',n:'Konwent Koronny',k:'KK2'},
 {s:'eli',n:'Zjednoczenie Narodowe',k:'ZN'},{s:'eli',n:'Porozumienie Weteranów',k:'PW'},
 {s:'int',n:'Koalicja Obywatelska',k:'KO'},{s:'int',n:'Sojusz Rozumu',k:'SR'},
 {s:'int',n:'Blok Programowy',k:'BP'},{s:'int',n:'Porozumienie Statutowe',k:'PS'},
 {s:'int',n:'Forum Kanałów',k:'FKA'},{s:'int',n:'Unia Redakcyjna',k:'UR'},
 {s:'int',n:'Zjednoczona Lewica',k:'ZL'},{s:'int',n:'Akademia Serwera',k:'AS'},
 {s:'ser',n:'Front Memiczny',k:'FM'},{s:'ser',n:'Ruch Nowych',k:'RN'},
 {s:'ser',n:'Sojusz Kanapowy',k:'SK'},{s:'ser',n:'Zlot Szitposterów',k:'ZS'},
 {s:'ser',n:'Braterstwo Głosowego',k:'BG'},{s:'ser',n:'Wielka Fala',k:'WF'},
 {s:'ser',n:'Liga Nocnych Marków',k:'LNM'},{s:'ser',n:'Porozumienie Ogólnego',k:'POG'}];
function nameTaken(n,k){
  for(const c in G.coal){if(G.coal[c].n===n||c===k)return true}
  if(G.bloc&&(G.bloc.name===n||G.bloc.short===k))return true;
  if(G.opoBloc&&(G.opoBloc.name===n||G.opoBloc.short===k))return true;
  return false;
}
function autoName(parties,used){
  // dominująca cecha bloku = średnia ważona mandatami, nie suma
  let best=null,bv=-1;
  const w=parties.reduce((a,k)=>a+Math.max(1,G.p[k].seats),0)||1;
  SID.forEach(s=>{
    let v=0;parties.forEach(k=>v+=G.p[k].aff[s]*Math.max(1,G.p[k].seats));
    v/=w; if(v>bv){bv=v;best=s}});
  const swoje=OPONAMES.filter(o=>o.s===best), reszta=OPONAMES.filter(o=>o.s!==best);
  return swoje.find(o=>o.k!==used&&!nameTaken(o.n,o.k))
    ||reszta.find(o=>o.k!==used&&!nameTaken(o.n,o.k))
    ||swoje.find(o=>o.k!==used)||OPONAMES.find(o=>o.k!==used)||OPONAMES[0];
}
function syncCoal(){
  // bloki to listy wyborcze: nowe zastępują wszystkie poprzednie
  const nc={};
  if(G.bloc&&G.bloc.parties.length>1)nc[G.bloc.short]={n:G.bloc.name,c:G.bloc.color,m:G.bloc.parties.slice()};
  if(G.opoBloc&&G.opoBloc.parties.length>1&&G.opoBloc.short!==(G.bloc&&G.bloc.short))
    nc[G.opoBloc.short]={n:G.opoBloc.name,c:G.opoBloc.color,m:G.opoBloc.parties.slice()};
  G.coal=nc;
  PID.forEach(k=>G.p[k].coal=coalOf(k));
}
function makeBlocs(){
  if(!G.gov)return;
  if(!G.bloc){const a=autoName(G.gov.parties,null);
    G.bloc={name:a.n,short:a.k,color:BLOCPAL[RI(0,BLOCPAL.length-1)],parties:G.gov.parties.slice()}}
  else G.bloc.parties=G.gov.parties.slice();
  // opozycja: istniejący blok tylko czyścimy ze zmarłych i tych, którzy weszli do rządu
  if(G.opoBloc){
    G.opoBloc.parties=G.opoBloc.parties.filter(k=>!G.p[k].dead&&G.p[k].seats>0&&!G.gov.parties.includes(k));
    if(G.opoBloc.parties.length<2)G.opoBloc=null;
  }
  // jeśli gracz sam siedzi w rządzie, opozycja organizuje się bez niego; jeśli jest w opozycji, decyduje sam
  if(!G.opoBloc){
    const opo=alive().filter(k=>G.p[k].seats>0&&!G.gov.parties.includes(k))
      .sort((a,b)=>G.p[b].seats-G.p[a].seats);
    const anchor=opo[0];
    const grp=anchor?[anchor].concat(opo.filter(k=>k!==anchor&&G.rel[k][anchor]>=8&&G.rel[anchor][k]>=8)):[];
    if(grp.length>=2){
      const b=autoName(grp,G.bloc.short);
      G.opoBloc={name:b.n,short:b.k,color:BLOCPAL[(BLOCPAL.indexOf(G.bloc.color)+4)%BLOCPAL.length],parties:grp};
      say(`Opozycja zawiązuje <b>${b.n} (${b.k})</b> wokół ${G.p[anchor].ab}: ${grp.map(k=>G.p[k].ab).join(', ')}.`);
    }
  }
}
function blocOf(k){
  const c=G.p[k].coal;   // lista wyborcza jest ważniejsza, bo od niej zależy próg
  if(c&&G.coal[c])return {name:G.coal[c].n,short:c,color:G.coal[c].c,parties:G.coal[c].m};
  if(G.bloc&&G.bloc.parties.includes(k))return G.bloc;
  if(G.opoBloc&&G.opoBloc.parties.includes(k))return G.opoBloc;
  return null;
}
function allBlocs(){
  const out=[],seen=new Set();
  [G.bloc,G.opoBloc].filter(Boolean).forEach(b=>{if(out.indexOf(b)<0){seen.add(b.short);out.push(b)}});
  for(const c in G.coal){if(seen.has(c))continue;const m=G.coal[c].m.filter(k=>!G.p[k].dead&&G.p[k].seats>0);
    if(m.length){seen.add(c);out.push({name:G.coal[c].n,short:c,color:G.coal[c].c,parties:m})}}
  return out;
}

/* ══════════ PREZYDENT ══════════ */
const isPMperson=n=>!!(G.gov&&G.pmOk&&G.gov.pmLead&&G.gov.pmLead===n);
const isPrezPerson=n=>!!(G.prez&&G.prez.lead===n);
function prezPool(k){
  // kandydować może każdy, także urzędujący prezydent po reelekcję, poza urzędującym premierem i marszałkiem
  return [...new Set(G.p[k].main.concat(G.p[k].bench,[G.p[k].lead]))]
    .filter(n=>!isPMperson(n)&&!isMarPerson(n));
}
/* Premierem zostaje ktoś ze sterów partii, ale nie ten, kto siedzi już w Pałacu
   albo na fotelu marszałka. Przy dwu- i trzyliderstwie wystarczy jeden wolny
   człowiek: partia z prezydentem na czele nadal może wystawić współprzewodniczącego. */
function pmOsoby(k){
  return leads(G.p[k]).filter(n=>!isPrezPerson(n)&&!isMarPerson(n));
}
function pmOsoba(k){
  const wolni=pmOsoby(k);
  if(!wolni.length)return null;
  // gdy jest z kogo wybierać, sejm patrzy na autorytet i kompetencję
  return wolni.slice().sort((a,b)=>(L(b).autor*.6+L(b).komp*.4)-(L(a).autor*.6+L(a).komp*.4))[0];
}
function pmBlocked(k){return !pmOsoby(k).length}
function prezRuns(k){
  // słabe partie zwykle nie wystawiają nikogo
  const p=G.p[k];
  if(p.seats>=6||p.fame>66)return true;
  if(p.seats>=4)return ch(.72);
  if(p.seats>=1)return ch(.32);
  return p.fame>40&&ch(.18);
}
function prezCandidates(){
  // liczące się partie wystawiają najlepszego człowieka, lidera albo kogoś z zaplecza
  return alive().filter(k=>(G.p[k].seats>0||G.p[k].fame>34)&&prezRuns(k)).map(k=>{
    const pl2=prezPool(k);
    if(!pl2.length)return null;
    if(G.gov&&G.pmOk&&G.gov.pm===k&&!pl2.length)return null;
    const best=pl2.map(L).sort((a,b)=>(b.char*.6+b.komp*.4)-(a.char*.6+a.komp*.4))[0];
    return {k,lead:best.n};
  }).filter(Boolean);
}
function prezRound1(myRun,pushKp,myWho){
  const q=tally();
  const cands=prezCandidates();
  if(myRun){const i=cands.findIndex(c=>c.k===G.me);
    if(i>=0)cands[i].lead=myWho||cands[i].lead; else cands.push({k:G.me,lead:myWho||me().lead})}
  const sc={};
  cands.forEach(c=>{
    const base=q.res[c.k].tot/q.total*100;
    const ld=L(c.lead);
    let v=base*2.15+ld.char*.13+ld.komp*.055+G.p[c.k].fame*.07+R(-1.6,1.6);
    if(c.k===G.me&&pushKp)v+=pushKp/13;
    if(c.k===G.me&&!myRun)v=0;
    // wykładnik rozjeżdża stawkę: faworyt wyraźnie odskakuje reszcie
    sc[c.k]=Math.max(.4,Math.pow(Math.max(v,1),2.7));
  });
  const live=cands.filter(c=>sc[c.k]>0.5);
  if(!live.length)return {r1:[],runoff:null,winner:cands[0]?cands[0].k:G.me,who:{}};
  const sum=live.reduce((a,c)=>a+sc[c.k],0);
  const who=Object.fromEntries(cands.map(c=>[c.k,c.lead]));
  const r1=live.map(c=>({k:c.k,who:c.lead,pct:sc[c.k]/sum*100})).sort((a,b)=>b.pct-a.pct);
  return {r1,who,decided:r1[0].pct>50,winner:r1[0].pct>50?r1[0].k:null};
}
function prezRound2(r1,who,boost){
  const [a,b]=r1;
  let av=a.pct,bv=b.pct;
  if(a.k===G.me)av+=boost; if(b.k===G.me)bv+=boost;
  r1.slice(2).forEach(x=>{
    const ta=G.rel[x.k][a.k]-ideo(x.k,a.k)*2, tb=G.rel[x.k][b.k]-ideo(x.k,b.k)*2;
    const sa=1/(1+Math.exp(-(ta-tb)/14));
    av+=x.pct*sa*.90; bv+=x.pct*(1-sa)*.90;
  });
  const t2=av+bv;
  const ro=[{k:a.k,who:a.who,pct:av/t2*100},{k:b.k,who:b.who,pct:bv/t2*100}].sort((x,y)=>y.pct-x.pct);
  return {r1,runoff:ro,winner:ro[0].k,who};
}
/* Znacznik kadencji prezydenckiej: zmienia się dopiero wtedy, gdy w Pałacu
   siada ktoś nowy albo ten sam na nową kadencję. */
function prezKadencja(){return G.prez?`${G.prez.party}|${G.prez.lead}|${G.prez.until}`:''}
function crownPrez(k,who){
  G.prez={party:k,lead:who||G.p[k].lead,until:G.term+2};
  G.prezOredzieFor=null;G.useTerm.oredzieP=0;   // nowy prezydent, nowe orędzie
  G.prezHist.push({term:G.term,winner:k});
  if(k===G.me){G.prest+=15;XP(24);M(me(),16);me().fame=cl(me().fame+6)}
  gainAutor(G.prez.lead,RI(3,5));
  say(`<b>${G.prez.lead} (${G.p[k].ab}) prezydentem</b> na dwie kadencje.`,'roy');
}

/* ══════════ MOTYW ══════════ */
function hex2rgb(h){h=String(h||'').replace('#','');
  if(h.length===3)h=h.split('').map(x=>x+x).join('');
  const v=parseInt(h,16);return [v>>16&255,v>>8&255,v&255]}
function rgb2hsl(r,g,b){r/=255;g/=255;b/=255;
  const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let h=0,s=0;const l=(mx+mn)/2;
  if(mx!==mn){const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);
    h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h/=6}
  return [h*360,s*100,l*100]}
const HSL=(h,s,l)=>`hsl(${Math.round(h)} ${Math.round(s)}% ${l.toFixed(1)}%)`;
const THEMEKEYS=['--bg','--p1','--p2','--p3','--line','--line2','--tx','--dim','--dim2','--glowa','--glowb'];
function applyTheme(){
  const R=document.documentElement&&document.documentElement.style;
  if(!R||!R.setProperty)return;
  if(!G||!G.p||!G.p[G.me])return THEMEKEYS.forEach(k=>R.removeProperty(k));
  const col=G.p[G.me].c, rgb=hex2rgb(col), hs=rgb2hsl(rgb[0],rgb[1],rgb[2]);
  const h=hs[0], sat=x=>Math.min(hs[1],x);
  R.setProperty('--bg',   HSL(h,sat(30),5.2));
  R.setProperty('--p1',   HSL(h,sat(24),8.4));
  R.setProperty('--p2',   HSL(h,sat(22),11));
  R.setProperty('--p3',   HSL(h,sat(20),14.4));
  R.setProperty('--line', HSL(h,sat(18),19.5));
  R.setProperty('--line2',HSL(h,sat(18),30));
  R.setProperty('--tx',   HSL(h,14,94));
  R.setProperty('--dim',  HSL(h,10,70));
  R.setProperty('--dim2', HSL(h,8,49));
  R.setProperty('--glowa',`rgba(${rgb[0]},${rgb[1]},${rgb[2]},.16)`);
  R.setProperty('--glowb',`rgba(${rgb[0]},${rgb[1]},${rgb[2]},.07)`);
}

/* ══════════ RENDER ══════════ */
const app=document.getElementById('app');

/* ═══════════════════════════════════════════════════════════
   ZSZYWANIE EKRANU
   Gra buduje cały ekran jako jeden napis i wpisywała go w app.innerHTML po
   każdej decyzji. Wszystko było wtedy niszczone i tworzone od nowa: liczby
   skakały zamiast dojeżdżać, przewijanie wracało na górę, obrazki mrugały,
   a najechanie kursorem gubiło się w trakcie.

   Zamiast przepisywać dwadzieścia trzy miejsca, w których gra rysuje ekran,
   przechwytujemy samo przypisanie. Nowy napis trafia do oderwanego pudełka,
   a potem idzie porównanie węzeł po węźle: co się nie zmieniło, zostaje
   nietknięte. Dzięki temu przejścia CSS mają na czym działać, bo element
   naprawdę trwa między jednym rysowaniem a drugim.
   ═══════════════════════════════════════════════════════════ */
const OPIS_INNER=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');

/* Liczby, które mrugają, kiedy zmienią wartość, i pudełka, które przy tym świecą */
const MRUG_LICZBY='.rs .rv b,.nocsz .tabliczki b';
const MRUG_PUDLO='.rs,.tabliczki>div';

const tenSamWezel=(a,b)=>a.nodeType===b.nodeType&&
  (a.nodeType!==1||(a.tagName===b.tagName&&(a.id||'')===(b.id||'')));

function zszyjAtrybuty(stary,nowy){
  const na=nowy.attributes;
  for(let i=na.length-1;i>=0;i--){
    const at=na[i];
    if(stary.getAttribute(at.name)!==at.value)stary.setAttribute(at.name,at.value);
  }
  const sa=stary.attributes;
  for(let i=sa.length-1;i>=0;i--){
    const at=sa[i];
    if(!nowy.hasAttribute(at.name))stary.removeAttribute(at.name);
  }
  /* Pola formularza trzymają to, co wpisał gracz, we właściwości, a nie
     w atrybucie. Bez tego kod zapisu kasowałby się w trakcie pisania. */
  const tg=stary.tagName;
  if(tg==='INPUT'||tg==='TEXTAREA'){
    if(stary!==document.activeElement&&stary.value!==nowy.value)stary.value=nowy.value;
    if(stary.checked!==nowy.checked)stary.checked=nowy.checked;
  } else if(tg==='SELECT'&&stary!==document.activeElement){
    if(stary.value!==nowy.value)stary.value=nowy.value;
  }
}

function zszyjWezel(stary,nowy){
  if(stary.nodeType===3||stary.nodeType===8){
    if(stary.nodeValue!==nowy.nodeValue)stary.nodeValue=nowy.nodeValue;
    return;
  }
  if(stary.nodeType!==1)return;
  zszyjAtrybuty(stary,nowy);
  zszyjDzieci(stary,nowy);
}

function zszyjDzieci(stary,nowy){
  const nd=nowy.childNodes;
  for(let i=0;i<nd.length;i++){
    const n=nd[i], s=stary.childNodes[i];
    if(!s){stary.appendChild(document.importNode(n,true));continue}
    if(tenSamWezel(s,n))zszyjWezel(s,n);
    else stary.replaceChild(document.importNode(n,true),s);
  }
  while(stary.childNodes.length>nd.length)stary.removeChild(stary.lastChild);
}

function zszyj(cel,html){
  const pudlo=document.createElement('div');
  OPIS_INNER.set.call(pudlo,html);
  zszyjDzieci(cel,pudlo);
}

Object.defineProperty(app,'innerHTML',{
  configurable:true,
  get(){return OPIS_INNER.get.call(app)},
  set(html){
    const przewijanie=window.scrollY;
    /* Skoro odczyty przeżywają rysowanie, da się wreszcie zobaczyć, że się
       zmieniły. Zapamiętujemy je przed zszyciem i mrugamy tymi, które poszły
       w górę albo w dół — wcześniej liczba po prostu była inna.
       To samo dotyczy tabliczek nocy wyborczej: rosną w trakcie liczenia. */
    const odczyty=[...app.querySelectorAll(MRUG_LICZBY)];
    const przed=odczyty.map(x=>x.textContent);
    zszyj(app,html);
    app.querySelectorAll(MRUG_LICZBY).forEach((x,i)=>{
      if(przed[i]===undefined||przed[i]===x.textContent)return;
      const rs=x.closest(MRUG_PUDLO); if(!rs)return;
      rs.classList.remove('mrug'); void rs.offsetWidth; rs.classList.add('mrug');
      setTimeout(()=>rs.classList.remove('mrug'),520);
    });
    /* Animacja wejścia zakładki nie odpali się sama, kiedy element przetrwał
       zszywanie — trzeba ją przerwać i puścić od nowa. */
    const w=app.querySelector('.widok.wejscie');
    if(w){w.classList.remove('wejscie');void w.offsetWidth;w.classList.add('wejscie')}
    if(window.scrollY!==przewijanie)window.scrollTo(0,przewijanie);
  }
});
const crest=(k,s='m')=>{const src=(G&&G.p&&G.p[k]&&G.p[k].logo&&LOGOS[G.p[k].logo])||LOGOS[k]||'';
  return `<img class="crest ${s}" src="${src}" alt="${(G?G.p[k]:BASE[k]).ab}">`};
const stars=d=>'★'.repeat(d)+'☆'.repeat(5-d);
/* Po ukończeniu Kazikmistrza Kaziu wraca do swojego najbardziej rozpoznawalnego
   awatara — tego z czasów, o których wszyscy mówią „stare dobre lata”. */
const ava=(name,col,sz)=>{
  const im=(name==='Kaziu'&&typeof goalDone==='function'&&goalDone('kazik'))
    ? 'obrazki/ava-kaziu-prime.webp' : AVA[name];
  const s=sz||38;
  return im?`<img class="avaimg" src="${im}" alt="${name}" style="width:${s}px;height:${s}px;border-color:${col}">`
   :`<span class="ava" style="background:${col};width:${s}px;height:${s}px;font-size:${s*.38}px">${initials(name)}</span>`};
const leadName=k=>leads(G.p[k]).join(' / ');
const leadAva=(k,sz)=>{const p=G.p[k],s=sz||38,ls=leads(p);
  if(ls.length<2)return ava(p.lead,p.c,s);
  // im więcej przewodniczących, tym mocniej portrety zachodzą na siebie
  const s2=Math.round(s*(ls.length>2?.72:.82)),ov=Math.round(s2*.42);
  return `<div style="display:flex;flex:none">${ls.map((n,i)=>
    i?`<div style="margin-left:-${ov}px">${ava(n,p.c,s2)}</div>`:ava(n,p.c,s2)).join('')}</div>`};

function render(){if(PROBA)return;
  applyTheme();initTips();initKeys();
  /* Decyzja z własnym oknem jest opłacona z góry, a zapis o opłacie służy do
     jej cofnięcia. Zamknięcie okna w dowolny inny sposób niż przyciskiem
     „wstecz" zostawiało ten zapis wiszący: decyzja liczyła się jako zużyta
     mimo że nic z niej nie wyszło, a pierwsze „wstecz" w kolejnym oknie
     oddawało pieniądze za tamtą i zdejmowało jej limit. Stąd wywiady w kółko
     za darmo z jednej strony, a z drugiej przepadające decyzje, z których
     gracz się wycofał. Skoro okna nie ma, a opłata wciąż wisi, znaczy to,
     że decyzja nie doszła do skutku — oddajemy ją w całości. */
  if(G&&G.lastCharge&&typeof document!=='undefined'&&!document.getElementById('veil'))
    oddajOplate();
  if(CRE)return creator();
  if(KRE)return kreatorEkran();
  if(!G&&MENU)return menuGlowne();
  if(!G)return MODE==='free'?setup():MODE==='scen'?scenScreen():modeScreen();
  if(G.phase==='dead')return dead();
  if(G.phase==='result'&&G.night&&!G.night.done)return nightScreen();
  // finałowa kampania toczy się już na normalnym ekranie, w pasku nad grą
  if(G.phase==='elect')return preElect();
  if(G.phase==='result')return results();
  if(G.phase==='pmvote')return pmScreen();
  if(G.phase==='marszalek')return marScreen();
  if(G.phase==='prez')return prezScreen();
  game();
  setTimeout(fxFlush,10);
  if(dateAnim)setTimeout(runDateAnim,20);
  if(G.sitPending&&SITS[G.sitPending]&&SITS[G.sitPending].resolve){
    const id=G.sitPending;G.sitPending=null;SITS[id].resolve();
  }
  else if(G.queue&&G.queue.length)showEvent(G.queue.shift());
}

let SEL='PPP';
function pickParty(k){SEL=k;render()}
function pickMain(){
  const box=document.getElementById('pmain');if(!box)return;
  const p=BASE[SEL],lp=LP[SEL],isDuo=DUO_START.includes(SEL)&&lp.main[1];
  const ld1=LEAD[lp.main[0]]||[50,50,50,50], ld2=isDuo?(LEAD[lp.main[1]]||[50,50,50,50]):null;
  const ld=ld2?[0,1,2,3].map(i=>Math.round((ld1[i]+ld2[i])/2)):ld1;
  const ic1=INNATE[lp.main[0]], ic2=isDuo?INNATE[lp.main[1]]:null;
  const ics=[ic1,ic2].filter(Boolean);
  const st=(n,v,c)=>`<div class="row"><div class="l"><span>${n}</span><b>${v}</b></div>
    <div class="trk"><i style="width:${v}%;background:${c}"></i></div></div>`;
  box.innerHTML=`
    <div style="position:absolute;right:-70px;top:-70px;width:280px;height:280px;border-radius:50%;
      background:radial-gradient(circle,${p.c}55,transparent 70%);filter:blur(6px)"></div>
    <div class="pickhd">
      <img class="crest" style="width:74px;height:74px;padding:3px;border-radius:5px" src="${LOGOS[SEL]||''}" alt="">
      <div style="min-width:0">
        <h2>${p.n}</h2>
        <div class="meta">${p.ab} · założona ${p.founded} · trudność
          <span style="color:var(--acc)">${'★'.repeat(p.diff)}${'☆'.repeat(5-p.diff)}</span></div>
      </div>
    </div>
    <p style="color:var(--dim);font-size:14px;line-height:1.55;margin:0">${p.blurb}</p>
    <div class="pickstat">
      ${st('Sława',p.fame,'var(--acc)')}${st('Wiarygodność',p.cred,'var(--info)')}
      ${st('Jedność',p.uni,'var(--pos)')}${st('Aktywność',p.act,'#9b7fd4')}
    </div>
    <div style="display:flex;gap:18px;font-family:var(--m);font-size:11.5px;color:var(--dim);margin-top:6px;flex-wrap:wrap">
      <span>osób <b style="color:var(--tx)">${p.mem}</b></span>
      <span>skład <b style="color:var(--tx)">${p.comp0[0]}·${p.comp0[1]}·${p.comp0[2]}</b> elita/inteligencja/serwerowicze</span>
      <span>sufit <b style="color:var(--tx)">${p.pot}</b></span>
    </div>
    <div class="leadchip">
      ${ava(lp.main[0],p.c,42)}
      <div style="flex:1;min-width:0">
        <div class="n">${isDuo?lp.main[0]+' / '+lp.main[1]+' (współprzewodnictwo)':lp.main.join(' · ')}</div>
        <div class="s">charyzma ${ld[0]} · kompetencja ${ld[1]} · wytrzymałość ${ld[2]} · autorytet ${ld[3]}</div>
        ${ics.map(x=>`<div style="font-size:11.5px;color:var(--acc);margin-top:3px">★ ${x.n}</div>`).join('')}
      </div>
    </div>
    <div style="font-size:12.5px;color:var(--dim2);margin-top:10px">
      Zaplecze: ${lp.bench.length?lp.bench.join(', '):'<span style="color:var(--neg)">brak</span>'}</div>
    <button class="btn" style="width:100%;margin-top:15px;padding:12px" onclick="start('${SEL}')">
      Prowadzę ${p.ab} →</button>`;
}
/* ══════════ KREATOR WŁASNEJ PARTII ══════════ */
let CUSTOM=null, CRE=null;
const CRB=250;
const crMem=c=>c.comp.eli+c.comp.int+c.comp.ser;
function crCostOf(c){
  let t=c.comp.ser*1+c.comp.int*3+c.comp.eli*7;
  ['fame','cred','uni','act'].forEach(k=>t+=c.st[k]-25);
  t+=(c.pot-45)*2;
  t+=c.take?crPrice(c.take.n)*2:c.ls.reduce((a,x)=>a+(x-45),0);
  t+=c.seats*12;
  Object.keys(c.rel).forEach(k=>{if(c.rel[k]==='fr')t+=12;if(c.rel[k]==='en')t-=8});
  c.poach.forEach(p=>t+=p.cost);
  return t;
}
const crPrice=n=>{const a=LEAD[n]||[50,50,50,50];return Math.round((a[0]+a[1]+a[2]+a[3])/16)};
function openCreator(){
  CRE={name:'',ab:'',c:'#c0623a',logo:null,ava:null,lead:'',opis:'',
    ls:[45,45,45,45],st:{fame:25,cred:25,uni:25,act:25},pot:45,
    comp:{eli:0,int:0,ser:3},seats:0,rel:{},poach:[],take:null};
  render();
}
function crClose(){CRE=null;render()}
function crSet(k,v){CRE[k]=v}
function crSetR(k,v){CRE[k]=v;render()}
function crPeople(){
  // kogo da się przejąć na przewodniczącego: musi zostać następca w macierzystej partii
  const out=[];
  PID.filter(k=>k!=='CUS'&&LP[k]).forEach(k=>{
    const main=LP[k].main,bench=LP[k].bench;
    main.forEach(n=>{if(LEAD[n]&&(main.length>1||bench.length))out.push({n,from:k,lead:1})});
    bench.forEach(n=>{if(LEAD[n])out.push({n,from:k,lead:0})});
  });
  return out;
}
function crTake(n,from){
  const c=CRE;
  if(c.take&&c.take.n===n){c.take=null;return render()}
  c.take={n,from};c.poach=c.poach.filter(p=>p.n!==n);render();
}
function crAdj(w,d){
  const c=CRE;
  if(w==='ser'||w==='int'||w==='eli'){const n=Math.max(0,c.comp[w]+d);if(d>0&&crMem(c)>=40)return;c.comp[w]=n}
  else if(['fame','cred','uni','act'].includes(w))c.st[w]=cl(c.st[w]+d,25,75);
  else if(w==='pot')c.pot=cl(c.pot+d,45,92);
  else if(w.slice(0,2)==='ls')c.ls[+w[2]]=cl(c.ls[+w[2]]+d,45,82);
  else if(w==='seats')c.seats=cl(c.seats+d,0,4);
  render();
}
function crRel(k,mode){
  const c=CRE;
  if(mode==='en'&&Object.keys(c.rel).filter(x=>c.rel[x]==='en').length>=3&&c.rel[k]!=='en')return;
  if(mode==='ne')delete c.rel[k]; else c.rel[k]=mode;
  if(mode!=='fr')c.poach=c.poach.filter(p=>p.from!==k);
  render();
}
function crPoach(n,from){
  const c=CRE;
  const has=c.poach.find(p=>p.n===n);
  if(has){c.poach=c.poach.filter(p=>p.n!==n);return render()}
  if(c.poach.length>=3||c.rel[from]!=='fr')return;
  c.poach.push({n,from,cost:crPrice(n)});
  render();
}
function crImg(inp,which){
  const f=inp.files&&inp.files[0];if(!f)return;
  const rd=new FileReader();
  rd.onload=()=>{const im=new Image();
    im.onload=()=>{
      const mx=which==='logo'?128:96;
      const sc=Math.min(1,mx/Math.max(im.width,im.height));
      const w=Math.max(1,Math.round(im.width*sc)),h=Math.max(1,Math.round(im.height*sc));
      const cv=document.createElement('canvas');cv.width=w;cv.height=h;
      cv.getContext('2d').drawImage(im,0,0,w,h);
      let out=cv.toDataURL('image/webp',.72);
      if(out.indexOf('data:image/webp')!==0)out=cv.toDataURL('image/png');
      CRE[which]=out;render();
    };
    im.onerror=()=>{CRE.err='Nie udało się wczytać obrazka.';render()};
    im.src=rd.result;
  };
  rd.readAsDataURL(f);
}
function crErr(){
  const c=CRE;
  if(!c.name.trim())return 'Wpisz nazwę partii.';
  if(!c.ab.trim())return 'Wpisz skrót partii.';
  if(!c.logo)return 'Wgraj logo partii.';
  if(!c.take&&!c.lead.trim())return 'Wpisz imię przewodniczącego albo przejmij kogoś z gry.';
  if(!c.take&&LEAD[c.lead.trim()])return 'To imię już należy do kogoś na serwerze, wybierz inne.';
  if(crMem(c)<1)return 'Partia musi mieć co najmniej jedną osobę.';
  if(crCostOf(c)>CRB)return 'Przekroczony budżet fundamentu.';
  return null;
}
function registerCustom(c){
  CUSTOM=c;
  if(c.take&&LP[c.take.from]){   // macierzysta partia od razu wystawia następcę
    const src=LP[c.take.from];
    src.main=src.main.filter(n=>n!==c.take.n);
    src.bench=src.bench.filter(n=>n!==c.take.n);
    if(!src.main.length&&src.bench.length)src.main=[src.bench.shift()];
  }
  BASE[c.id]=c.base;
  if(PID.indexOf(c.id)<0)PID.push(c.id);
  LP[c.id]=c.lp;
  LOGOS[c.id]=c.logo||'';
  LEAD[c.lead]=c.ls;
  if(c.ava)AVA[c.lead]=c.ava;
  (c.strip||[]).forEach(x=>{if(LP[x.from])LP[x.from].bench=LP[x.from].bench.filter(n=>n!==x.n)});
}
function crFinish(){
  const c=CRE;
  if(crErr())return;
  const id='CUS', mem=crMem(c), left=Math.max(0,CRB-crCostOf(c));
  const leadName=c.take?c.take.n:c.lead.trim();
  const sh={eli:c.comp.eli/mem,int:c.comp.int/mem,ser:c.comp.ser/mem};
  const d=new Date(), pad=x=>String(x).padStart(2,'0');
  const low=['fame','cred','uni','act'].sort((a,b)=>c.st[a]-c.st[b])[0];
  const LOWN={fame:'Sławy tyle co nic. O partii serwer musi się dopiero dowiedzieć.',
    cred:'Wiarygodność na dnie, słowa tej partii nikt jeszcze nie traktuje poważnie.',
    uni:'Jedność niska. Przy pierwszym kryzysie zacznie się szarpanina.',
    act:'Aktywność niska. Kanały partii milczą, a milczenie zbija sondaż.'};
  BASE[id]={n:c.name.trim().slice(0,42),ab:c.ab.trim().slice(0,3).toUpperCase(),c:c.c,
    founded:pad(d.getDate())+'.'+pad(d.getMonth()+1)+'.'+d.getFullYear(),
    pull:Math.round((0.9+c.pot/40)*1000)/1000,
    fame:c.st.fame,cred:c.st.cred,uni:c.st.uni,act:c.st.act,ctr:14,pret:28,
    mem,pot:c.pot,diff:3,aff:{eli:cl(Math.round(2+7*sh.eli),1,9),int:cl(Math.round(2+7*sh.int),1,9),ser:cl(Math.round(2+7*sh.ser),1,9)},
    comp0:[c.comp.eli,c.comp.int,c.comp.ser],
    blurb:c.opis.trim().slice(0,150)||('Partia założona przez ciebie. '+mem+' '+pl(mem,'osoba','osoby','osób')+', sufit '+c.pot+', wszystko przed wami.'),
    flaw:LOWN[low],custom:1};
  const strip=c.poach.map(p=>({n:p.n,from:p.from}));
  registerCustom({id,base:BASE[id],lp:{main:[leadName],bench:c.poach.map(p=>p.n)},
    logo:c.logo,ava:c.take?null:c.ava,lead:leadName,ls:c.take?(LEAD[leadName]||[50,50,50,50]).slice():c.ls.slice(),
    seats:c.seats,rel:Object.assign({},c.rel),strip,take:c.take});
  CRE=null;
  newGame(id);
  Object.keys(CUSTOM.rel).forEach(k=>{if(!G.p[k]||k===id)return;
    const v=CUSTOM.rel[k]==='fr'?25:CUSTOM.rel[k]==='en'?-30:null;
    if(v===null)return;G.rel[id][k]=v;G.rel[k][id]=v});
  strip.concat(c.take?[{from:c.take.from}]:[]).forEach(x=>{if(!G.rel[id]||G.rel[id][x.from]===undefined)return;
    const d=x.n?20:34;
    G.rel[id][x.from]=cl(G.rel[id][x.from]-d,-100,100);
    G.rel[x.from][id]=cl(G.rel[x.from][id]-d,-100,100)});
  if(c.take)say(`<b>${leadName}</b> odchodzi z ${G.p[c.take.from].ab} i staje na czele ${G.p[id].ab}. Tamci już mianowali następcę: <b>${G.p[c.take.from].lead}</b>.`,'bad');
  G.kp+=Math.min(60,left*2);
  say('<b>'+G.p[id].n+' powstaje.</b> '+mem+' '+pl(mem,'osoba','osoby','osób')+', '
    +(c.seats?c.seats+' '+pl(c.seats,'mandat','mandaty','mandatów'):'zero mandatów')
    +', kapitał startowy '+Math.round(G.kp)+'.','roy');
  render();
}
function creator(){
  const c=CRE, cost=crCostOf(c), left=CRB-cost, mem=crMem(c), err=crErr();
  const row=(lab,val,w,note)=>`<div class="crrow"><span>${lab}${note?` <span class="dim" style="font-size:12px">${note}</span>`:''}</span>
    <span class="crb"><button onclick="crAdj('${w}',-1)">−</button><b>${val}</b><button onclick="crAdj('${w}',1)">+</button></span></div>`;
  const LSN=['charyzma','kompetencja','wytrzymałość','autorytet'];
  const benchPool=PID.filter(k=>k!=='CUS'&&LP[k]).map(k=>({k,ppl:LP[k].bench.filter(n=>LEAD[n])})).filter(x=>x.ppl.length);
  app.innerHTML=`
  <div class="crbar">
    <div><div style="font-family:var(--m);font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--dim2)">Budżet fundamentu</div>
      <b class="m" style="font-size:22px;color:${left<0?'var(--neg)':'var(--acc)'}">${left}</b>
      <span class="dim" style="font-size:12.5px"> z ${CRB} zostało</span></div>
    <div style="flex:1;min-width:160px;max-width:340px"><div class="trk" style="height:8px"><i style="width:${cl(cost/CRB*100,0,100)}%;background:${left<0?'var(--neg)':'var(--acc)'}"></i></div>
      <div style="font-size:11.5px;color:var(--dim2);margin-top:5px">Reszta zamienia się w kapitał startowy: ${Math.min(60,Math.max(0,left)*2)} kapitału</div></div>
    <button class="btn g sm" onclick="crClose()">Wracam do listy</button>
    <button class="btn" ${err?'disabled':''} onclick="crFinish()">${err?err:'Zakładam partię →'}</button>
  </div>

  <div class="pick" style="align-items:start">
   <div style="display:flex;flex-direction:column;gap:14px">

    <div class="card"><div class="h"><h3>Szyld</h3></div><div class="b">
      <input class="inp" maxlength="42" placeholder="Nazwa partii" value="${(c.name||'').replace(/"/g,'&quot;')}" oninput="crSet('name',this.value)">
      <input class="inp" maxlength="3" placeholder="Skrót (3 znaki)" value="${(c.ab||'').replace(/"/g,'&quot;')}" style="max-width:160px" oninput="crSet('ab',this.value)">
      <input class="inp" maxlength="150" placeholder="Jedno zdanie o partii (opcjonalnie)" value="${(c.opis||'').replace(/"/g,'&quot;')}" oninput="crSet('opis',this.value)">
      <div style="font-size:12.5px;color:var(--dim);margin:4px 0 6px">Barwa partii</div>
      <div class="swatch">${['#c0623a','#237a3a','#1e63d0','#7b2fbe','#a01c2c','#c8952b','#4b2d63','#1f3864','#d489a2','#4bbd85','#0090d4','#e2606f'].map(x=>`<button onclick="crSetR('c','${x}')" style="background:${x}" class="${x===c.c?'on':''}"></button>`).join('')}</div>
      <div style="font-size:12.5px;color:var(--dim);margin:14px 0 6px">Logo partii (jpg, png, webp)</div>
      <div style="display:flex;align-items:center;gap:12px">
        ${c.logo?`<img src="${c.logo}" alt="" style="width:56px;height:56px;object-fit:contain;background:#f4f1ea;border-radius:6px;padding:3px;flex:none">`:'<div style="width:56px;height:56px;border:1px dashed var(--line2);border-radius:6px;flex:none"></div>'}
        <input type="file" accept="image/*" onchange="crImg(this,'logo')" style="font-size:12.5px;color:var(--dim)">
      </div>
    </div></div>

    <div class="card"><div class="h"><h3>Przewodniczący</h3><span class="n">${c.take?'przejęty z gry':'punkt za punkt, sufit 82'}</span></div><div class="b">
      ${c.take?(()=>{const st=LEAD[c.take.n]||[50,50,50,50];
        return `<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
          ${ava(c.take.n,c.c,48)}<div style="flex:1;min-width:0"><b style="font-size:16px">${c.take.n}</b>
          <div class="dim" style="font-size:12.5px">odchodzi z ${BASE[c.take.from].ab}, koszt ${crPrice(c.take.n)*2} pkt</div></div>
          <button class="btn g sm" onclick="crTake('${esc(c.take.n)}','${c.take.from}')">Rezygnuję</button></div>
        <div class="crrow"><span>charyzma</span><b class="m">${st[0]}</b></div>
        <div class="crrow"><span>kompetencja</span><b class="m">${st[1]}</b></div>
        <div class="crrow"><span>wytrzymałość</span><b class="m">${st[2]}</b></div>
        <div class="crrow"><span>autorytet</span><b class="m">${st[3]}</b></div>
        <div class="note" style="margin-top:12px">Jego partia od razu mianuje następcę, a relacja z nią leci o 34 w dół.</div>`})()
       :`<input class="inp" maxlength="24" placeholder="Imię przewodniczącego" value="${(c.lead||'').replace(/"/g,'&quot;')}" oninput="crSet('lead',this.value)">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
        ${c.ava?`<img src="${c.ava}" alt="" style="width:44px;height:44px;object-fit:cover;border-radius:50%;border:2px solid ${c.c};flex:none">`:'<div style="width:44px;height:44px;border:1px dashed var(--line2);border-radius:50%;flex:none"></div>'}
        <input type="file" accept="image/*" onchange="crImg(this,'ava')" style="font-size:12.5px;color:var(--dim)">
        <span class="dim" style="font-size:12px">profilowe, opcjonalne</span>
      </div>
      ${c.ls.map((v,i)=>row(LSN[i],v,'ls'+i)).join('')}`}
    </div></div>

    <div class="card"><div class="h"><h3>Albo przejmij kogoś z gry</h3><span class="n">koszt ×2 ceny transferu</span></div><div class="b">
      <div class="note" style="margin:0 0 11px">Możesz postawić na czele partii kogoś, kto już gra. Jeśli sięgniesz po przewodniczącego, jego partia natychmiast wystawia następcę z ławki.</div>
      ${(()=>{const gr={};crPeople().forEach(x=>{(gr[x.from]=gr[x.from]||[]).push(x)});
        return Object.keys(gr).map(k=>`<div style="margin-bottom:9px">
          <div style="font-size:12px;color:var(--dim2);text-transform:uppercase;letter-spacing:.08em;margin-bottom:5px">${BASE[k].ab}</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap">${gr[k].map(x=>{const on=c.take&&c.take.n===x.n,st=LEAD[x.n];
            return `<button class="opt" style="flex:0 1 auto;padding:6px 10px;${on?'border-color:var(--acc)':''}" onclick="crTake('${esc(x.n)}','${k}')">
              <b style="margin:0;font-size:12.5px">${on?'✓ ':''}${x.n}${x.lead?' ★':''}</b>
              <span style="font-size:11px">${crPrice(x.n)*2} pkt · średnia ${Math.round((st[0]+st[1]+st[2]+st[3])/4)}</span></button>`}).join('')}</div></div>`).join('')})()}
    </div></div>

    <div class="card"><div class="h"><h3>Ludzie</h3><span class="n">${mem} z 40</span></div><div class="b">
      ${row('Elita','<span style="color:#e0b23c">'+c.comp.eli+'</span>','eli','7 pkt za osobę')}
      ${row('Intelektualiści','<span style="color:#5a9be8">'+c.comp.int+'</span>','int','3 pkt')}
      ${row('Serwerowicze','<span style="color:#4bbd85">'+c.comp.ser+'</span>','ser','1 pkt')}
      <div class="note" style="margin-top:12px">Skład decyduje o elektoracie: partia elit trafia do elit, partia serwerowiczów do serwerowiczów. Ludzie biorą się z tych 670 na serwerze, więc innym partiom ich ubywa.</div>
    </div></div>

   </div>
   <div style="display:flex;flex-direction:column;gap:14px">

    <div class="card"><div class="h"><h3>Wskaźniki startowe</h3><span class="n">baza 25, sufit 75</span></div><div class="b">
      ${row('Sława',Math.round(c.st.fame),'fame')}
      ${row('Wiarygodność',Math.round(c.st.cred),'cred')}
      ${row('Jedność',Math.round(c.st.uni),'uni')}
      ${row('Aktywność',Math.round(c.st.act),'act')}
      ${row('Sufit potencjału',c.pot,'pot','2 pkt za punkt')}
      ${row('Mandaty na start',c.seats,'seats','12 pkt za mandat, najwyżej 4')}
      <div class="note" style="margin-top:12px">Mandaty odbierane są największym partiom, sejm zawsze ma ${TOTAL_SEATS} miejsc. Sufit potencjału to granica, powyżej której sława zaczyna spadać sama.</div>
    </div></div>

    <div class="card"><div class="h"><h3>Relacje na start</h3><span class="n">wrogów najwyżej 3</span></div><div class="b">
      <div class="note" style="margin:0 0 12px">Przyjaźń kosztuje 12 punktów i daje relację +25, potrzebna też do podbierania ludzi. Wrogość zwraca 8 punktów i ustawia relację na −30. Reszta zaczyna neutralnie i losowo.</div>
      ${PID.filter(k=>k!=='CUS').map(k=>{const m=c.rel[k]||'ne';
        return `<div class="crrow"><span class="nm">${crest(k,'xs')}<span>${BASE[k].n}</span></span>
        <span class="crb">
          <button onclick="crRel('${k}','en')" style="${m==='en'?'border-color:var(--neg);color:var(--neg)':''};width:auto;padding:0 8px">wróg</button>
          <button onclick="crRel('${k}','ne')" style="${m==='ne'?'border-color:var(--acc);color:var(--acc)':''};width:auto;padding:0 8px">neutralnie</button>
          <button onclick="crRel('${k}','fr')" style="${m==='fr'?'border-color:var(--pos);color:var(--pos)':''};width:auto;padding:0 8px">przyjaźń</button>
        </span></div>`}).join('')}
    </div></div>

    <div class="card"><div class="h"><h3>Zaplecze z podbierania</h3><span class="n">${c.poach.length} z 3</span></div><div class="b">
      <div class="note" style="margin:0 0 12px">Podebrać da się tylko kogoś z cudzego zaplecza i tylko z partii ustawionej na przyjaźń, a transfer zbija tę relację o 20. Przewodniczących nie ruszasz.</div>
      ${benchPool.map(x=>`<div style="margin-bottom:10px"><div style="font-size:12px;color:var(--dim2);text-transform:uppercase;letter-spacing:.08em;margin-bottom:5px">${BASE[x.k].ab}${c.rel[x.k]==='fr'?'':' <span style="color:var(--neg)">(brak przyjaźni)</span>'}</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">${x.ppl.map(n=>{const on=!!c.poach.find(p=>p.n===n),ok=c.rel[x.k]==='fr';
          return `<button class="opt" style="flex:0 1 auto;padding:7px 11px;${on?'border-color:var(--pos)':''};${ok?'':'opacity:.4'}" onclick="crPoach('${esc(n)}','${x.k}')">
            <b style="margin:0;font-size:13px">${on?'✓ ':''}${n}</b><span style="font-size:11.5px">${crPrice(n)} pkt · średnia ${Math.round((LEAD[n][0]+LEAD[n][1]+LEAD[n][2]+LEAD[n][3])/4)}</span></button>`}).join('')}</div></div>`).join('')}
    </div></div>

   </div>
  </div>`;
}

/* ---- objaśnienia wskaźników ---- */
const STATHELP={
 fame:['Sława','Ile osób na serwerze w ogóle o tobie słyszało. Wchodzi wprost do sondażu i decyduje, czy na koniec kadencji ludzie do ciebie dołączą.',
  'Rośnie: wiec, spot, debata, memy, orędzie, wygrane głosowania, udany wywiad.',
  'Spada: sama z siebie o 2,2% tygodniowo, przy tygodniu bez decyzji, po przegranych i wpadkach. Powyżej sufitu potencjału zaczyna się osuwać.'],
 cred:['Wiarygodność','Czy ktokolwiek bierze twoje słowa na poważnie. Wchodzi do sondażu, do przychylności Króla i do szansy na przeciągnięcie ludzi.',
  'Rośnie: manifest, statut, konsultacje, kompetentny przewodniczący, intelektualiści w składzie.',
  'Spada: memy, wykryty sabotaż, kłamstwa w debacie, przewaga serwerowiczów w składzie.'],
 uni:['Jedność','Czy partia trzyma się kupy. Decyduje o tempie regeneracji energii i o tym, jak często ludzie odchodzą po cichu.',
  'Rośnie: szkolenie kadr, statut, zjazd, wyciszenie sporu, wysoki autorytet przewodniczącego.',
  'Spada: czystki, rozłamy, odejścia, zmiana przewodniczącego, przewaga serwerowiczów.'],
 act:['Aktywność','Czy na kanałach partii cokolwiek się dzieje. Wchodzi do sondażu, do przychylności Króla i do wysokości składek.',
  'Rośnie: kanwasing, nabór, zjazd, konsultacje, eventy.',
  'Spada: 1,3 tygodniowo sama z siebie, mocniej przy tygodniu bez decyzji.'],
 ctr:['Kontrowersja','Ile awantur ciągnie się za partią. Zniechęca elity i intelektualistów, a przyciąga serwerowiczów.',
  'Rośnie: donosy do administracji, sabotaż, przekupstwa, memy, przerost elit, zaleganie z kapitałem.',
  'Spada: 1,4 tygodniowo, przeprosiny, wyciszenie sporu, konsultacje, ustawa o kodeksie karnym.',
  'Przy 90 partia wpada w paraliż: sondaż liczony na pół, kapitał wycieka, co tydzień ktoś odchodzi.'],
 pret:['Pretensjonalność','Jak bardzo partia brzmi jak wykład. Elity i intelektualiści to lubią, serwerowicze uciekają, a obecność w kanałach przelicza się gorzej.',
  'Rośnie: manifesty, statuty, przewaga intelektualistów, szkoła kadr.',
  'Spada: luźny stream, otwarte konsultacje, zejście na ziemię, serwerowicze w składzie.'],
 mom:['Momentum','Krótka pamięć serwera o tym, czy ostatnio ci szło. Od −35 do +42, wchodzi do sondażu jako mnożnik do ±28%.',
  'Rośnie: wygrane debaty i głosowania, udane afery, dobrze przyjęte wiece i orędzia, wypełnione cele, trafione kombinacje decyzji.',
  'Spada: przegrane głosowania, wpadki, wykryty sabotaż, sprzeczne kombinacje, odejścia ludzi.',
  'Wygasa o 17% tygodniowo, więc nie da się go odkładać. Cecha Męczennik tnie spadki o 65%.']
};
function statTip(id){
  const h=STATHELP[id];if(!h)return '';
  const html=`<b>${h[0]}</b><i>${h[1]}</i>${h.slice(2).map(x=>`<u>${x}</u>`).join('')}`;
  return `<span class="qtip" data-tip="${html.replace(/"/g,'&quot;')}">?</span>`;
}
function initTips(){
  if(!document||!document.addEventListener||initTips.done)return;
  initTips.done=1;
  const box=()=>{let d=document.getElementById('qfloat');
    if(!d){d=document.createElement('div');d.id='qfloat';d.className='qfloat';document.body.appendChild(d)}return d};
  const pokaz=t=>{
    const d=box();d.innerHTML=t.getAttribute('data-tip')||'';d.style.display='block';
    const w=Math.min(320,window.innerWidth-24);d.style.width=w+'px';
    const r=t.getBoundingClientRect();
    d.style.left=Math.max(12,Math.min(r.left+r.width/2-w/2,window.innerWidth-w-12))+'px';
    const h=d.offsetHeight;
    d.style.top=(r.top-h-10<8?r.bottom+10:r.top-h-10)+'px';
  };
  const ukryj=()=>{const d=document.getElementById('qfloat');if(d)d.style.display='none'};
  document.addEventListener('mouseover',e=>{const t=e.target.closest&&e.target.closest('.qtip');if(t)pokaz(t)});
  document.addEventListener('mouseout',e=>{const t=e.target.closest&&e.target.closest('.qtip');if(t)ukryj()});
  document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('.qtip');
    if(t){e.stopPropagation();const d=document.getElementById('qfloat');
      if(d&&d.style.display==='block')ukryj();else pokaz(t)}else ukryj()});
  window.addEventListener('scroll',ukryj,true);
}
/* ---- dopamina: skutki, kamienie milowe, seria ---- */
let FX=[];
function fxPush(t,c){if(PROBA)return;FX.push({t,c})}
function fxFlush(){
  if(!FX.length||!document||!document.body)return;
  const box=document.createElement('div');box.className='fxwrap';
  box.innerHTML=FX.map((f,i)=>`<div class="fxchip ${f.c||''}" style="animation-delay:${i*70}ms">${f.t}</div>`).join('');
  document.body.appendChild(box);
  setTimeout(()=>box.remove(),2600);
  FX=[];
}
function streakBox(){
  const s=G.streak||0;
  if(s<2)return '';
  return `<div class="rs streakchip" title="Tygodnie z rzędu, w których coś zrobiłeś. Od trzech tygodni sława z decyzji rośnie o 8% za każdy tydzień serii, maksymalnie o 40%.">
    <b>${s}<span class="plus" style="color:var(--acc)">🔥</span></b><span>seria</span></div>`;
}
const streakMul=()=>1+Math.min(.40,Math.max(0,((G.streak||0)-2)*.08));

/* ══════════ 1.6 TEST: DŹWIĘK, CZĄSTKI, HISTORIA, SCENARIUSZE ══════════ */
let AC=null;
const sndOn=()=>!(G&&G.mute);
function ac(){try{if(!AC&&typeof window!=='undefined'&&(window.AudioContext||window.webkitAudioContext))
  AC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){}return AC}
function beep(f,d,type,vol,slide){
  if(PROBA)return;                    // podgląd liczy po cichu, nie gra dziewięć razy
  if(!sndOn())return;const c=ac();if(!c)return;
  try{
    if(c.state==='suspended')c.resume();
    const t=c.currentTime,o=c.createOscillator(),g=c.createGain();
    o.type=type||'sine';o.frequency.setValueAtTime(f,t);
    if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(40,f+slide),t+(d||.1));
    g.gain.setValueAtTime(.0001,t);
    g.gain.exponentialRampToValueAtTime(vol||.05,t+.01);
    g.gain.exponentialRampToValueAtTime(.0001,t+(d||.1));
    o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+(d||.1)+.03);
  }catch(e){}
}
const seq=(arr,step)=>arr.forEach((x,i)=>setTimeout(()=>beep(x[0],x[1]||.12,x[2]||'sine',x[3]||.05),i*(step||90)));
const SFX={
  click:()=>beep(520,.045,'triangle',.035),
  ok:()=>seq([[660,.09,'sine',.045],[900,.12,'sine',.04]],65),
  bad:()=>beep(200,.2,'sawtooth',.045,-90),
  week:()=>seq([[330,.07,'square',.028],[440,.09,'square',.026]],80),
  coin:()=>seq([[900,.05,'square',.03],[1320,.07,'square',.028]],55),
  mile:()=>seq([[523,.16],[659,.16],[784,.16],[1047,.3]],85),
  elect:()=>seq([[392,.22,'triangle',.05],[523,.22,'triangle',.05],[659,.22,'triangle',.05],[784,.42,'triangle',.05]],130),
  gong:()=>seq([[196,.5,'sine',.06],[294,.4,'sine',.04]],40),
};
/* ---- muzyka ----
   Kawałki z serwera, każdy przypisany do jednej chwili w grze. Grają cicho i
   pojedynczo: druga piosenka przerywa pierwszą, zamiast nakładać się na nią.
   Przycisk wyciszania ucina wszystko, łącznie z tym, co akurat leci. */
const MUZYKA={
  petarda:{plik:'muzyka/nie-pucuj-petardy.mp3',glos:.22},
  pax:    {plik:'muzyka/pax-mathiae.mp3',      glos:.20},
  dyktator:{plik:'muzyka/dyktator-i-krol.mp3', glos:.22},
};
let GRA_TERAZ=null;
const coGra=()=>GRA_TERAZ?String(GRA_TERAZ.src||'').split('/').pop():null;
function stopMuzyka(){
  if(!GRA_TERAZ)return;
  try{GRA_TERAZ.pause();GRA_TERAZ.currentTime=0}catch(e){}
  GRA_TERAZ=null;
}
function graj(id){
  const m=MUZYKA[id];
  if(!m||!sndOn()||typeof Audio==='undefined')return;
  stopMuzyka();
  try{
    const a=new Audio(m.plik);
    a.volume=m.glos;                       // cicho — to tło, nie koncert
    a.onended=()=>{if(GRA_TERAZ===a)GRA_TERAZ=null};
    // przeglądarka potrafi odmówić odtwarzania, zanim gracz cokolwiek kliknie
    const p=a.play();
    if(p&&p.catch)p.catch(()=>{if(GRA_TERAZ===a)GRA_TERAZ=null});
    GRA_TERAZ=a;
  }catch(e){}
}
function toggleMute(){G.mute=!G.mute;if(G.mute)stopMuzyka();else SFX.ok();render()}
/* ---- cząstki ---- */
function burst(kolor,ile,mocno){
  if(PROBA)return;                    // konfetti też nie należy do podglądu
  if(typeof document==='undefined'||!document.body)return;
  let cv=document.getElementById('cfx');
  if(!cv){cv=document.createElement('canvas');cv.id='cfx';cv.className='cfx';document.body.appendChild(cv)}
  if(!cv.getContext)return;
  cv.width=(window.innerWidth||1200);cv.height=(window.innerHeight||800);
  const ctx=cv.getContext('2d');if(!ctx)return;
  const kol=kolor||['#d9ab45','#f7e3aa','#7fbe69','#5f9bd0','#e2606f'];
  const P=[];
  for(let i=0;i<(ile||90);i++)P.push({
    x:cv.width/2+R(-cv.width*.28,cv.width*.28), y:cv.height*.28+R(-40,40),
    vx:R(-4,4), vy:R(-11,-3)*(mocno?1.3:1), g:.28+Math.random()*.12,
    s:R(4,10), r:Math.random()*6.28, vr:R(-.25,.25), c:kol[RI(0,kol.length-1)], a:1});
  let t=0;
  const rys=()=>{
    t++;ctx.clearRect(0,0,cv.width,cv.height);
    let zywe=0;
    P.forEach(p=>{
      p.vy+=p.g;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;p.a=Math.max(0,1-t/110);
      if(p.a<=0||p.y>cv.height+40)return;
      zywe++;
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.r);ctx.globalAlpha=p.a;
      ctx.fillStyle=p.c;ctx.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);ctx.restore();
    });
    if(zywe&&t<130)requestAnimationFrame(rys);else{ctx.clearRect(0,0,cv.width,cv.height);cv.remove()}
  };
  requestAnimationFrame(rys);
}
function shake(){
  if(PROBA)return;                    // ekran nie ma się trząść od samego liczenia
  if(typeof document==='undefined'||!document.body||!document.body.classList)return;
  document.body.classList.add('shk');setTimeout(()=>document.body.classList.remove('shk'),480);
}
/* ---- historia sondażu ---- */
function histPush(){
  if(!G.polls)G.polls=[];
  const q=tally();
  const row={w:absWeek(),s:{}};
  alive().forEach(k=>row.s[k]=+(q.res[k].tot/q.total*100).toFixed(1));
  G.polls.push(row);
  if(G.polls.length>72)G.polls.shift();
}
function histChart(){try{return histChartIn()}catch(e){return ''}}
function histChartIn(){
  const H=(G.polls||[]).filter(r=>r&&r.s&&typeof r.w==='number');
  if(H.length<3)return `<div class="card"><div class="h"><h3>Historia sondażu</h3><span class="n">zbieram dane</span></div>
    <div class="b"><p class="dim">Wykres pojawi się po kilku tygodniach gry.</p></div></div>`;
  const last=H[H.length-1].s;
  const top=alive().filter(k=>G.p[k]).sort((a,b)=>(+last[b]||0)-(+last[a]||0)).slice(0,5);
  const linie=[...new Set([G.me].concat(top))].filter(k=>G.p[k]&&!G.p[k].dead);
  const W=760,Hh=230,PL=38,PR=14,PT=16,PB=26;
  const val=(r,k)=>{const v=+r.s[k];return isFinite(v)?v:0};
  const maxV=Math.max(12,...H.map(r=>Math.max(...linie.map(k=>val(r,k)))))*1.12;
  const X=i=>PL+i*(W-PL-PR)/Math.max(1,H.length-1);
  const Y=v=>PT+(Hh-PT-PB)*(1-v/maxV);
  const path=k=>H.map((r,i)=>`${i?'L':'M'}${X(i).toFixed(1)} ${Y(val(r,k)).toFixed(1)}`).join(' ');
  const gridy=[0,25,50,75,100].map(p=>maxV*p/100);
  return `<div class="card"><div class="h"><h3>Historia sondażu</h3>
    <span class="n">${H.length} ${pl(H.length,'tydzień','tygodnie','tygodni')} · twoja linia jest gruba</span></div><div class="b">
    <svg viewBox="0 0 ${W} ${Hh}" class="histsvg">
      ${gridy.map(v=>`<g><line x1="${PL}" y1="${Y(v)}" x2="${W-PR}" y2="${Y(v)}" stroke="var(--line)" stroke-width="1"/>
        <text x="${PL-7}" y="${Y(v)+3.5}" text-anchor="end" font-size="9.5" font-family="ui-monospace,monospace" fill="var(--dim2)">${v.toFixed(0)}%</text></g>`).join('')}
      ${[0,Math.floor(H.length/2),H.length-1].map(i=>`<text x="${X(i)}" y="${Hh-8}" text-anchor="middle" font-size="9.5"
        font-family="ui-monospace,monospace" fill="var(--dim2)">${dateStr(sitDate(H[i].w)).replace(/ \d{4}$/,'')}</text>`).join('')}
      ${linie.map(k=>`<path d="${path(k)}" fill="none" stroke="${G.p[k].c}" stroke-width="${k===G.me?3.2:1.6}"
        stroke-opacity="${k===G.me?1:.65}" stroke-linejoin="round" stroke-linecap="round"/>`).join('')}
      ${linie.map(k=>{const v=val(H[H.length-1],k);
        return `<circle cx="${X(H.length-1)}" cy="${Y(v)}" r="${k===G.me?4.5:3}" fill="${G.p[k].c}"/>`}).join('')}
    </svg>
    <div class="legend" style="margin-top:10px">${linie.map(k=>`<span><i style="background:${G.p[k].c}"></i>${G.p[k].ab} ${fmt(val(H[H.length-1],k))}%</span>`).join('')}</div>
  </div></div>`;
}
/* ---- scenariusze ---- */
let SCENSEL=null;
/* ══════════ MODY ══════════
   Mod to jeden plik JSON w katalogu gracza. Celowo nie ma w nim kodu — opisuje
   wyłącznie, co zmienić na starcie, a gra sama to stosuje. Dzięki temu mod od
   kogoś obcego nie może zrobić w grze niczego, czego nie przewidzieliśmy tutaj. */
let MODY=[];
function modEfekty(ef){
  if(!ef||typeof ef!=='object')return;
  const licz=(v,teraz)=>typeof v==='number'?v:teraz;

  // zmiany dotyczące wszystkich partii naraz
  const w=ef.wszystkie||{};
  alive().forEach(k=>{
    const p=G.p[k];
    ['fame','cred','uni','act','ctr','pret'].forEach(s=>{
      if(typeof w[s]==='number')p[s]=cl(p[s]+w[s]);
    });
    if(typeof w.skladProc==='number'){
      /* Ujemna wartość ma partie zmniejszyć, dodatnia powiększyć. Stał tu minus,
         który odwracał znak, więc scenariusz „partie o 30% mniejsze" robił je
         o 30% większe. Przy powiększaniu ludzie muszą skądś przyjść, więc biorą
         się z puli bezpartyjnych i tylko tylu, ilu tam naprawdę jest. */
      ['eli','int','ser'].forEach(s2=>{
        const chce=Math.round(p.comp[s2]*(w.skladProc/100));
        const realne=chce<0?Math.max(-p.comp[s2],chce):Math.min(chce,G.free[s2]||0);
        p.comp[s2]+=realne;
        G.free[s2]=(G.free[s2]||0)-realne;
      });
      p.mem=p.comp.eli+p.comp.int+p.comp.ser;
    }
    if(typeof w.obecnosc==='number')REG.forEach(r=>p.pres[r.id]=cl(p.pres[r.id]+w.obecnosc));
  });

  // zmiany dla konkretnych partii
  const per=ef.partie||{};
  Object.keys(per).forEach(k=>{
    if(!G.p[k]||G.p[k].dead)return;
    const p=G.p[k], z=per[k]||{};
    ['fame','cred','uni','act','ctr','pret','pot'].forEach(s=>{
      if(typeof z[s]==='number')p[s]=cl(p[s]+z[s],0,s==='pot'?200:100);
    });
    if(typeof z.mandaty==='number')p.seats=Math.max(0,p.seats+z.mandaty);
    if(z.rozwiazana===true){p.dead=1;p.seats=0}
  });

  if(typeof ef.kapital==='number')G.kp=Math.max(0,G.kp+ef.kapital);
  if(typeof ef.akcje==='number')G.apMax=Math.max(1,G.apMax+ef.akcje),G.ap=G.apMax;
  if(typeof ef.frekwencja==='number')G.turnout=cl(ef.frekwencja,.4,1);
  if(typeof ef.tygodni==='number')G.weeks=Math.max(4,Math.min(24,Math.round(ef.tygodni)));
  if(typeof ef.krolPrzychylnosc==='number')G.king.rel=cl(G.king.rel+ef.krolPrzychylnosc);
}
/* Scenariusze z modów dokładają się do wbudowanych. Jeśli mod ma zły format,
   pomijamy go bez słowa — jedna literówka w cudzym pliku nie może zablokować gry. */
function modyDoScen(){
  MODY.forEach(m=>{
    if(!m||!m.nazwa)return;
    const id='mod-'+(m.id||m.nazwa).toString().slice(0,40);
    SCEN[id]={
      n:String(m.nazwa).slice(0,60),
      t:String(m.trudnosc||'Mod').slice(0,20),
      d:String(m.opis||'Scenariusz z moda.').slice(0,400),
      mod:String(m.zmiany||'Zmiany opisane przez autora moda.').slice(0,400),
      zModa:true, autor:String(m.autor||'').slice(0,40),
      apply(){try{modEfekty(m.efekty)}catch(e){}}
    };
  });
}
async function wczytajMody(){
  try{
    const a=(window.pywebview&&window.pywebview.api)||null;
    if(!a||!a.mody)return;
    const lista=await a.mody();
    MODY=Array.isArray(lista)?lista:[];
    modyDoScen();
  }catch(e){MODY=[]}
}

const SCEN={
 klasyk:{n:'Sejm zastany',t:'Standard',logo:'',
  d:'Serwer taki, jaki jest naprawdę: rząd kisielka48, monarchiści w opozycji, wszystko na swoim miejscu.',
  mod:'Żadnych zmian, pełne zasady gry.', apply(){}},
 kryzys:{n:'Wielki kryzys serwera',t:'Trudny',
  d:'Fala banów, wyciek logów i awantura, po której połowa serwera przestała pisać. Wszyscy zaczynają poobijani.',
  mod:'Wszystkie partie tracą 40% składu, kontrowersja +22, kapitał i banki wyzerowane, frekwencja niższa o jedną piątą.',
  apply(){
    alive().forEach(k=>{const p=G.p[k];
      ['eli','int','ser'].forEach(s2=>{const ub=Math.round(p.comp[s2]*.4);p.comp[s2]-=ub;G.free[s2]=(G.free[s2]||0)+ub});
      p.mem=p.comp.eli+p.comp.int+p.comp.ser;
      p.ctr=cl(p.ctr+22);p.fame=cl(p.fame-10);p.uni=cl(p.uni-12);p.bank=0;
      REG.forEach(r=>p.pres[r.id]=cl(p.pres[r.id]*.6));
    });
    G.kp=6;G.turnout=.62;G.king.rel=38;
    say('<b>Wielki kryzys serwera.</b> Po awanturze, o której nikt nie chce mówić, wszystkie partie są o połowę mniejsze, a ludzie nie ufają nikomu.','bad');
  }},
 zero:{n:'Wszystko od zera',t:'Bardzo trudny',
  d:'Zakładasz partię dosłownie od zera, w sejmie pełnym molochów. Masz za to pełną kasę na start i nic do stracenia.',
  mod:'Twoja partia: 1 osoba, 0 mandatów, sława 8. Za to 220 kapitału i 6 akcji w pierwszym tygodniu.',
  apply(){
    const p=me();
    ['eli','int','ser'].forEach(s2=>{G.free[s2]=(G.free[s2]||0)+p.comp[s2];p.comp[s2]=0});
    p.comp.ser=1;p.mem=1;p.fame=8;p.act=30;p.uni=70;
    const m=p.seats;p.seats=0;
    const inni=alive().filter(k=>k!==G.me).sort((a,b)=>G.p[b].seats-G.p[a].seats);
    for(let i=0;i<m;i++)G.p[inni[i%inni.length]].seats++;
    G.kp=220;G.ap=G.apMax=6;
    say('<b>Wszystko od zera.</b> Jedna osoba, zero mandatów i worek kapitału. Reszta serwera nawet nie wie, że istniejesz.','roy');
  }},
 rozbicie:{n:'Rozbita scena',t:'Chaotyczny',
  d:'Nikt nie ma przewagi. Czterdzieści mandatów rozsypane po całym sejmie, każdy rząd wisi na włosku.',
  mod:'Mandaty rozdane niemal po równo, rząd upada na starcie, wszystkie relacje wyzerowane.',
  apply(){
    const zywe=alive();
    zywe.forEach(k=>G.p[k].seats=0);
    for(let i=0;i<TOTAL_SEATS;i++)G.p[zywe[i%zywe.length]].seats++;
    zywe.forEach(a=>zywe.forEach(b=>{if(a!==b)G.rel[a][b]=RI(-8,8)}));
    G.gov=null;G.pmOk=false;G.bloc=null;G.opoBloc=null;G.coal={};zywe.forEach(k=>G.p[k].coal=null);
    say('<b>Rozbita scena.</b> Żadna partia nie ma więcej niż trzy mandaty, a rządu po prostu nie ma. Powodzenia.','roy');
  }},
 korona:{n:'Twarda ręka Króla',t:'Nietypowy',
  d:'Mordeczka przestał udawać, że sejm cokolwiek znaczy. Premiera wskazuje sam, a kto mu podpadnie, ten znika z rozdania.',
  mod:'Król desygnuje premiera bez głosowania sejmu, jego przychylność liczy się podwójnie, danina jest o połowę tańsza.',
  apply(){G.krolTryb=1;G.king.rel=46;
    say('<b>Twarda ręka Króla.</b> Głosowanie nad premierem staje się formalnością, liczy się tylko to, co myśli Mordeczka.','roy')}},
 wojna:{n:'Wojna na górze',t:'Trudny',
  d:'Wszyscy ze wszystkimi na noże. Koalicje rozsypują się szybciej, niż powstają, a serwer żywi się aferami.',
  mod:'Wszystkie relacje na minusie, kontrowersja rośnie dwa razy szybciej, ale afery i brudne decyzje dają o połowę więcej sławy.',
  apply(){
    const zywe=alive();
    zywe.forEach(a=>zywe.forEach(b=>{if(a!==b)G.rel[a][b]=RI(-45,-12)}));
    G.wojna=1;
    say('<b>Wojna na górze.</b> Nikt nikomu nie ufa, a każda afera niesie się po całym serwerze.','bad');
  }},
};
function scenScreen(){
  /* Ten sam układ, co przy wyborze partii: lista po lewej wierszami,
     panel wybranego po prawej. Jeden wzorzec na oba ekrany startu. */
  const wybrany=SCEN[SCENSEL]||SCEN[Object.keys(SCEN)[0]];
  const wybId=SCEN[SCENSEL]?SCENSEL:Object.keys(SCEN)[0];
  app.innerHTML=`
  <div class="podnag">
    <div class="kick">Nowa gra · scenariusze</div>
    <h2>Wybierz świat</h2>
  </div>
  <div class="pick v3 scenv3">
    <div class="pickmain">
      <div class="pickhd"><h2>${esc(wybrany.n)}</h2>
        <div class="meta">${esc(wybrany.t)}${wybrany.zModa?' · mod':''}</div></div>
      <p style="font-size:13.5px;line-height:1.6;color:var(--dim)">${wybrany.d}</p>
      <div class="note" style="margin:var(--o4) 0">${wybrany.mod}</div>
      ${wybrany.zModa?`<div class="dim" style="font-size:12px">${wybrany.autor?'autor: '+esc(wybrany.autor):'twój scenariusz'}</div>`:''}
      <button class="btn" style="width:100%;margin-top:var(--o4)" onclick="pickScen('${wybId}')">
        Biorę ten świat →</button>
    </div>
    <div>
      <div class="picklist">
        ${Object.keys(SCEN).map(id=>{const x=SCEN[id];
          return `<button class="pickcell scenrow ${wybId===id?'on':''}" onclick="podejrzyjScen('${id}')">
          <i class="pcbar"></i>
          <span class="pcname">${esc(x.n)}</span>
          <div class="pcrow"><span class="pcseat">${esc(x.t)}${x.zModa?' · mod':''}</span></div>
        </button>`}).join('')}
      </div>
    </div>
  </div>
  <div class="scennarz">
    <button class="btn g sm" onclick="backToMode()">← Wstecz</button>
    <button class="btn sm" onclick="openKreator()">Kreator scenariuszy</button>
    <button class="btn g sm" onclick="wczytajScenPlik()">Wczytaj z pliku…</button>
    ${MODY.length?`<span class="dim" style="font-size:12px;margin-left:auto">
      ${MODY.length} ${pl(MODY.length,'własny scenariusz','własne scenariusze','własnych scenariuszy')}
      · <button class="conowego" onclick="openMody()">zarządzaj</button></span>`:''}
  </div>`;
}
/* Podgląd scenariusza nie zaczyna jeszcze gry — dopiero „Biorę ten świat". */
function podejrzyjScen(id){SCENSEL=id;SFX.click();render()}
function pickScen(id){SCENSEL=id;MODE='free';SFX.click();render()}

/* ── scenariusz jako plik ──
   Scenariusz ma być czymś, co się wysyła koledze i wczytuje jednym kliknięciem.
   Z pliku bierzemy wyłącznie dane; efekty i tak przechodzą przez modEfekty,
   które rozumie skończoną listę pól, więc cudzy plik nie wykona nic własnego. */
async function wczytajScenPlik(){
  const a=(window.pywebview&&window.pywebview.api)||null;
  if(!a||!a.scen_wczytaj)return modal('Niedostępne','Wczytywanie z pliku',
    '<p>Ta wersja gry działa w przeglądarce i nie ma dostępu do plików. Użyj aplikacji.</p>',
    [{l:'Rozumiem',f:close}]);
  let dane=null;
  try{ dane=await a.scen_wczytaj(); }catch(e){ dane=null }
  if(!dane)return;
  if(!dane.nazwa)return modal('Nie ten plik','Wczytywanie scenariusza',
    '<p>W tym pliku nie ma scenariusza. Plik scenariusza ma rozszerzenie <b>.mmscen</b> '+
    'i powstaje z <b>Kreatora scenariuszy</b>.</p>',[{l:'Rozumiem',f:close}]);
  try{
    const zapis=await a.mod_zapisz(dane);
    if(zapis&&zapis.ok===false)throw new Error('zapis');
  }catch(e){ /* nie udało się zachować na stałe — scenariusz i tak zadziała w tej sesji */ }
  MODY=MODY.filter(m=>m.nazwa!==dane.nazwa).concat([dane]);
  modyDoScen();
  SCENSEL='mod-'+(dane.id||dane.nazwa).toString().slice(0,40);
  SFX.click();
  modal('Wczytany','Scenariusz gotowy',
    `<p><b>${esc(String(dane.nazwa).slice(0,60))}</b> jest już na liście i został wybrany.
     ${dane.autor?'Autor: <b>'+esc(String(dane.autor).slice(0,40))+'</b>.':''}</p>`,
    [{l:'Wybieram partię',f:()=>{close();MODE='free';render()}},
     {l:'Zostaję na liście',f:()=>{close();render()}}]);
}

async function zapiszScenPlik(dane){
  const a=(window.pywebview&&window.pywebview.api)||null;
  if(!a||!a.scen_zapisz)return null;
  try{ return await a.scen_zapisz(dane,String(dane.nazwa||'scenariusz')); }
  catch(e){ return null }
}

/* ---- kreator scenariuszy ----
   Formularz, z którego wychodzi zwykły plik moda. Wszystko, co da się tu ustawić,
   gra potem stosuje sama — nie ma tu miejsca na kod, więc nie ma też miejsca
   na to, żeby czyjś scenariusz zrobił coś nieprzewidzianego. */
let KRE=null;
const KRE_POLA=[
  ['ctr','Kontrowersja wszystkich partii',-40,40,0],
  ['uni','Jedność wszystkich partii',-40,40,0],
  ['fame','Sława wszystkich partii',-40,40,0],
  ['act','Aktywność wszystkich partii',-40,40,0],
  ['skladProc','Zmiana składu partii (%)',-60,60,0],
  ['obecnosc','Obecność w kanałach',-40,40,0],
];
const KRE_OGOLNE=[
  ['kapital','Twój kapitał na start',-40,400,0],
  ['akcje','Akcje na tydzień',-1,3,0],
  ['tygodni','Tygodni w kadencji',4,24,12],
  ['krolPrzychylnosc','Przychylność Króla',-40,40,0],
];
/* Co da się ustawić pojedynczej partii. Reszta sceny zostaje bez zmian, więc
   scenariusz może zaczynać się od jednego konkretnego układu sił, a nie tylko
   od przesunięcia wszystkim po równo. */
const KRE_PARTIA=[
  ['mandaty','Mandaty',-20,20,0],
  ['fame','Sława',-60,60,0],
  ['cred','Wiarygodność',-60,60,0],
  ['uni','Jedność',-60,60,0],
  ['ctr','Kontrowersja',-60,60,0],
  ['pot','Sufit rozwoju',-40,60,0],
];
function openKreator(){
  KRE={nazwa:'',opis:'',trudnosc:'Mod',autor:'',ef:{},partie:{},wybrana:null,kadencja:1};
  KRE_POLA.concat(KRE_OGOLNE).forEach(([k,,,,dom])=>KRE.ef[k]=dom);
  kreatorRys();
}
function kreSet(k,v){if(KRE)KRE[k]=v}
function kreEf(k,v){if(KRE)KRE.ef[k]=Math.round(+v||0);kreatorRys()}
/* Wybór partii do osobnego ustawienia. Drugie kliknięcie w tę samą zwija panel. */
function krePartia(k){
  if(!KRE)return;
  KRE.wybrana=KRE.wybrana===k?null:k;
  if(KRE.wybrana&&!KRE.partie[k])KRE.partie[k]={};
  kreatorRys();
}
function krePole(k,pole,v){
  if(!KRE||!KRE.partie[k])return;
  const n=Math.round(+v||0);
  if(n===0)delete KRE.partie[k][pole]; else KRE.partie[k][pole]=n;
  kreatorRys();
}
function kreWyczysc(k){if(KRE){delete KRE.partie[k];if(KRE.wybrana===k)KRE.wybrana=null;kreatorRys()}}
const kreIleZmian=k=>Object.keys((KRE&&KRE.partie[k])||{}).length;
/* Kreator odpala się sprzed gry: z kafla na ekranie startowym i z listy
   scenariuszy. Żadna rozgrywka wtedy nie stoi, więc nie wolno mu pytać o G.
   Brał alive() i G.p[k], przez co kliknięcie kafla wywalało się na nullu
   i ekran po prostu nie wchodził — kreator „nic nie robił". Sięga teraz do
   stałej tablicy partii, dokładnie tak jak robi to crest(). */
const krePartieLista=()=>Object.keys(BASE);
const krePartiaDane=k=>(G&&G.p&&G.p[k])||BASE[k]||{n:k,ab:k,c:'#8a8a8a'};
/* ── kreator scenariuszy ──
   Był ciasnym oknem z listą kilkunastu suwaków, po której nie dało się poznać,
   co właściwie powstaje. Teraz to pełny ekran: po lewej ustawienia w sekcjach,
   po prawej żywy opis tego, co scenariusz naprawdę zrobi na starcie. */
function kreOpisZmian(){
  const e=KRE.ef, w=[], z=[];
  if(e.skladProc)w.push(`partie ${e.skladProc>0?'większe':'mniejsze'} o <b>${Math.abs(e.skladProc)}%</b>`);
  [['fame','sława'],['uni','jedność'],['act','aktywność'],['ctr','kontrowersja']].forEach(([k,n])=>{
    if(e[k])w.push(`${n} u wszystkich <b>${e[k]>0?'+':''}${e[k]}</b>`)});
  if(e.obecnosc)w.push(`obecność w kanałach <b>${e.obecnosc>0?'+':''}${e.obecnosc}</b>`);
  if(e.kapital)z.push(`twój kapitał na start <b>${e.kapital>0?'+':''}${e.kapital}</b>`);
  if(e.akcje)z.push(`akcje na tydzień <b>${e.akcje>0?'+':''}${e.akcje}</b>`);
  if(e.tygodni!==12)z.push(`kadencja trwa <b>${e.tygodni}</b> ${pl(e.tygodni,'tydzień','tygodnie','tygodni')}`);
  if(e.krolPrzychylnosc)z.push(`Król nastawiony <b>${e.krolPrzychylnosc>0?'+':''}${e.krolPrzychylnosc}</b>`);
  return {sceny:w, zasady:z, osobne:Object.keys(KRE.partie).filter(k=>kreIleZmian(k))};
}
function kreatorEkran(){
  const suwak=([k,opis,min,max,dom])=>{
    const v=KRE.ef[k];
    return `<div class="krow ${v!==dom?'ruszony':''}"><span>${opis}</span>
      <input type="range" min="${min}" max="${max}" value="${v}"
        oninput="kreEf('${k}',this.value)">
      <b class="m">${v>0&&k!=='tygodni'?'+':''}${v}</b></div>`};
  const op=kreOpisZmian();
  const pusty=!op.sceny.length&&!op.zasady.length&&!op.osobne.length;
  app.innerHTML=`
  <div class="kreekran">
    <div class="krehead">
      <div>
        <div class="kick">Kreator scenariuszy</div>
        <h1>Zbuduj własny start serwera</h1>
        <p class="dim">Ustawiasz, jak wygląda scena w chwili, gdy siadasz do gry.
        Gotowy scenariusz zapiszesz jako plik i wyślesz komu chcesz.</p>
      </div>
      <button class="btn g sm" onclick="kreWyjdz()">← Wracam do listy</button>
    </div>

    <div class="krebody">
      <div class="krelewa">
        <div class="card"><div class="h"><h3>Podstawy</h3></div><div class="b">
          <div class="krow"><span>Nazwa</span><input id="kn" type="text" maxlength="60"
            value="${esc(KRE.nazwa)}" placeholder="np. Wojna wszystkich ze wszystkimi"></div>
          <div class="krow"><span>Trudność</span><input id="kt" type="text" maxlength="20"
            value="${esc(KRE.trudnosc)}" placeholder="np. Trudny"></div>
          <div class="krow"><span>Autor</span><input id="ka" type="text" maxlength="40"
            value="${esc(KRE.autor)}" placeholder="twój nick"></div>
          <div class="krow"><span>Opis</span><input id="ko" type="text" maxlength="200"
            value="${esc(KRE.opis)}" placeholder="co się stało na serwerze"></div>
        </div></div>

        <div class="card"><div class="h"><h3>Wszystkie partie na starcie</h3>
          <span class="n">dotyczy każdego, łącznie z tobą</span></div><div class="b">
          ${KRE_POLA.map(suwak).join('')}
        </div></div>

        <div class="card"><div class="h"><h3>Zasady rozgrywki</h3></div><div class="b">
          ${KRE_OGOLNE.map(suwak).join('')}
        </div></div>

        <div class="card"><div class="h"><h3>Pojedyncze partie</h3>
          <span class="n">${op.osobne.length?op.osobne.length+' ustawionych':'nic osobno'}</span></div><div class="b">
          <div class="note" style="margin:0 0 11px">Te zmiany dochodzą do tego, co wyżej.
          Możesz komuś dołożyć mandatów, kogoś pogrążyć, a reszty sceny nie ruszać.</div>
          <div class="krepartie">
            ${krePartieLista().map(k=>{const ile=kreIleZmian(k);
              return `<button class="krep ${KRE.wybrana===k?'on':''} ${ile?'ma':''}"
                onclick="krePartia('${k}')" title="${esc(krePartiaDane(k).n)}">
                ${crest(k,'s')}<span>${krePartiaDane(k).ab}</span>${ile?`<i>${ile}</i>`:''}</button>`}).join('')}
          </div>
          ${KRE.wybrana?`<div class="krebox">
            <div class="krehd"><b>${esc(krePartiaDane(KRE.wybrana).n)}</b>
              <button class="btn g sm" onclick="kreWyczysc('${KRE.wybrana}')">Wyczyść</button></div>
            ${KRE_PARTIA.map(([pole,opis,mini,maks])=>{
              const w=(KRE.partie[KRE.wybrana]||{})[pole]||0;
              return `<div class="krow ${w?'ruszony':''}"><span>${opis}</span>
                <input type="range" min="${mini}" max="${maks}" value="${w}"
                  oninput="krePole('${KRE.wybrana}','${pole}',this.value)">
                <b class="m">${w>0?'+':''}${w}</b></div>`}).join('')}
          </div>`:'<div class="dim" style="font-size:12.5px">Kliknij herb, żeby ustawić partię osobno.</div>'}
        </div></div>
      </div>

      <div class="kreprawa">
        <div class="card win"><div class="h"><h3>Tak to wyjdzie</h3></div><div class="b">
          <div class="krepodg">
            <b>${esc(KRE.nazwa)||'<span class="dim">Scenariusz bez nazwy</span>'}</b>
            <span class="krett">${esc(KRE.trudnosc)||'Mod'}</span>
          </div>
          <p class="dim" style="font-size:13px;margin:0 0 12px">${esc(KRE.opis)||'Brak opisu.'}</p>
          ${pusty?`<div class="note">Na razie nic nie zmieniasz — to będzie zwykły
            <b>Sejm zastany</b>. Poruszaj suwakami po lewej, a tutaj zobaczysz, co z tego wychodzi.</div>`:`
            ${op.sceny.length?`<div class="sterlab">Scena na starcie</div>
              <ul class="krelista">${op.sceny.map(x=>'<li>'+x+'</li>').join('')}</ul>`:''}
            ${op.zasady.length?`<div class="sterlab" style="margin-top:12px">Zasady</div>
              <ul class="krelista">${op.zasady.map(x=>'<li>'+x+'</li>').join('')}</ul>`:''}
            ${op.osobne.length?`<div class="sterlab" style="margin-top:12px">Osobno ustawione</div>
              <ul class="krelista">${op.osobne.map(k=>`<li><b>${krePartiaDane(k).ab}</b> — ${kreIleZmian(k)}
                ${pl(kreIleZmian(k),'zmiana','zmiany','zmian')}</li>`).join('')}</ul>`:''}`}
        </div></div>

        <div class="kreakcje">
          <button class="btn" onclick="kreatorZapisz()">Zapisz na listę</button>
          <button class="btn g" onclick="kreatorDoPliku()">Zapisz do pliku…</button>
          <button class="btn g" onclick="kreWyjdz()">Odrzuć</button>
        </div>
        <div class="dim" style="font-size:11.5px;margin-top:9px">
          Plik <b>.mmscen</b> wyślesz komukolwiek — wczyta go przyciskiem
          <b>Wczytaj z pliku</b> na liście scenariuszy.</div>
      </div>
    </div>
  </div>`;
  ['#kn','#kt','#ka','#ko'].forEach(s=>{const e=document.querySelector(s);
    if(e)e.oninput=()=>{kreCzytaj();kreOdswiezPodglad()}});
}
/* Tekst czytamy bez przerysowania ekranu — inaczej pisanie w polu przerywałoby
   się po każdej literze. */
function kreCzytaj(){
  if(!KRE)return;
  const w=s=>(document.querySelector(s)||{}).value||'';
  KRE.nazwa=w('#kn'); KRE.trudnosc=w('#kt')||'Mod'; KRE.autor=w('#ka'); KRE.opis=w('#ko');
}
function kreOdswiezPodglad(){
  const b=document.querySelector('.krepodg b'), tt=document.querySelector('.krepodg .krett'),
        o=document.querySelector('.kreprawa .b>p');
  if(b)b.innerHTML=esc(KRE.nazwa)||'<span class="dim">Scenariusz bez nazwy</span>';
  if(tt)tt.textContent=KRE.trudnosc||'Mod';
  if(o)o.textContent=KRE.opis||'Brak opisu.';
}
function kreWyjdz(){KRE=null;render()}
async function kreatorDoPliku(){
  kreCzytaj();
  if(!KRE.nazwa.trim())return modal('Kreator','Bez nazwy ani rusz',
    '<p>Scenariusz musi mieć nazwę — po niej znajdziesz go na liście.</p>',[{l:'Wracam',f:close}]);
  const plik=await zapiszScenPlik(kreatorDane());
  if(plik)modal('Zapisany','Scenariusz w pliku',
    `<p>Zapisałem <b>${esc(plik)}</b>. Możesz go teraz wysłać komu chcesz —
     wczyta go przyciskiem <b>Wczytaj z pliku</b> na liście scenariuszy.</p>`,
    [{l:'Dobra',f:close}]);
}
function kreatorRys(){kreatorEkran()}
/* Jedno miejsce, w którym powstaje scenariusz. Zapis na listę i zapis do pliku
   biorą stąd to samo, więc plik wysłany koledze zadziała identycznie. */
function kreatorDane(){
  const zmiany=[];
  KRE_POLA.concat(KRE_OGOLNE).forEach(([k,opis,,,dom])=>{
    if(KRE.ef[k]!==dom)zmiany.push(`${opis}: ${KRE.ef[k]>0?'+':''}${KRE.ef[k]}`);
  });
  const mod={nazwa:KRE.nazwa.trim(),opis:KRE.opis.trim()||'Scenariusz z kreatora.',
    trudnosc:KRE.trudnosc.trim()||'Mod',autor:KRE.autor.trim(),
    efekty:{wszystkie:{},partie:{}}};
  KRE_POLA.forEach(([k,,,,dom])=>{if(KRE.ef[k]!==dom)mod.efekty.wszystkie[k]=KRE.ef[k]});
  KRE_OGOLNE.forEach(([k,,,,dom])=>{if(KRE.ef[k]!==dom)mod.efekty[k]=KRE.ef[k]});
  // ustawienia pojedynczych partii — tylko te, w których gracz naprawdę coś ruszył
  Object.keys(KRE.partie||{}).forEach(k=>{
    const z=KRE.partie[k];
    if(z&&Object.keys(z).length){
      mod.efekty.partie[k]=z;
      zmiany.push(`${krePartiaDane(k).ab}: `+Object.keys(z).map(p=>`${p} ${z[p]>0?'+':''}${z[p]}`).join(', '));
    }
  });
  mod.zmiany=zmiany.join(' · ')||'Bez zmian względem zwykłej gry.';
  return mod;
}
async function kreatorZapisz(){
  if(!KRE)return;
  if(!KRE.nazwa.trim())return modal('Kreator','Bez nazwy ani rusz',
    `<p>Scenariusz musi mieć nazwę — po niej znajdziesz go na liście.</p>`,
    [{l:'Wracam',f:()=>{close();kreatorRys()}}]);
  const mod=kreatorDane();
  const a=(window.pywebview&&window.pywebview.api)||null;
  if(!a||!a.mod_zapisz)return modal('Kreator','Nie mam gdzie tego zapisać',
    `<p>Zapis modów działa w wersji na komputer. W przeglądarce nie ma dostępu do plików.</p>`,
    [{l:'Rozumiem',f:()=>{close();render()}}]);
  let wynik=null;
  try{wynik=await a.mod_zapisz(mod)}catch(e){wynik={ok:false,blad:e.message}}
  KRE=null;close();
  if(wynik&&wynik.ok){
    await wczytajMody();
    render();
    modal('Kreator','Scenariusz zapisany',
      `<p><b>${esc(mod.nazwa)}</b> jest już na liście scenariuszy.</p>
       <p style="margin-top:10px">Plik leży w katalogu modów — możesz go wysłać komuś,
       a on wrzuci go u siebie i zagra w to samo.</p>`,
      [{l:'Dobrze',f:()=>{close();render()}}]);
  }else{
    modal('Kreator','Nie udało się zapisać',
      `<p>${esc((wynik&&wynik.blad)||'Nieznany błąd.')}</p>`,
      [{l:'Trudno',f:()=>{close();render()}}]);
  }
}
async function openMody(){
  const a=(window.pywebview&&window.pywebview.api)||null;
  let folder='';
  try{folder=a&&a.mody_folder?await a.mody_folder():''}catch(e){}
  modal('Mody',`Wgrane mody: ${MODY.length}`,
    `<p>Mody to pojedyncze pliki. Żeby dodać cudzy scenariusz, wrzuć jego plik do katalogu
     modów i uruchom grę ponownie.</p>
     ${folder?`<div class="note" style="margin:12px 0"><b>Katalog modów</b><br>
       <span style="font-family:var(--m);font-size:11.5px;word-break:break-all">${esc(folder)}</span></div>`:''}
     ${MODY.length?`<div class="lawheld">${MODY.map(m=>
       `<div class="lh"><span>${esc(m.nazwa)}${m.autor?' — '+esc(m.autor):''}</span>
         <button class="btn g sm" onclick="modUsun('${esc(m.plik||'')}')">Usuń</button></div>`).join('')}</div>`
      :'<p class="dim">Nie masz jeszcze żadnych modów. Zrób własny w kreatorze.</p>'}`,
    [{l:'Zamykam',f:()=>{close();render()}}]);
}
async function modUsun(plik){
  const a=(window.pywebview&&window.pywebview.api)||null;
  if(!a||!a.mod_usun||!plik)return;
  try{await a.mod_usun(plik)}catch(e){}
  await wczytajMody();
  close();render();
  openMody();
}

/* ══════════ 1.6 TEST · FALA 2 ══════════ */

/* ─── wspólne klocki ekranów pełnoekranowych ───
   Cała ścieżka po wyborach — dzień, obie noce, wyniki, prezydium, premier —
   jest zbudowana z tych samych trzech rzeczy: sztandaru z tabliczkami,
   płyty na treść i przyklejonej stopki z przyciskiem. Trzymamy je w jednym
   miejscu, żeby nie przepisywać sztandaru w dziewięciu ekranach z osobna
   i żeby zmiana wyglądu szła wszędzie naraz. */
function sztandar(kick,tytul,tresc,tabl){
  return `<div class="nocsz">
    <div class="kick">${kick}</div>
    <h1>${tytul}</h1>
    ${tresc?`<p>${tresc}</p>`:''}
    ${tabl&&tabl.length?`<div class="tabliczki">${tabl.map(t=>
      `<div><b>${t[0]}</b><span>${t[1]}</span></div>`).join('')}</div>`:''}
  </div>`;
}
function ekstopka(legenda,przyciski){
  return `<div class="ekstopka">${legenda?`<span class="ekleg">${legenda}</span>`:''}${przyciski}</div>`;
}
const ekran=tresc=>`<div class="nocekran">${tresc}</div>`;

/* ---- noc wyborcza ---- */
function startNight(){
  const {votes}=G.result;
  const total=Object.values(votes).reduce((a,b)=>a+b,0)||1;
  const grp={};
  alive().forEach(k=>{const c=G.p[k].coal&&CO()[G.p[k].coal]?G.p[k].coal:k;
    (grp[c]=grp[c]||{m:[],st:0,v:0}).m.push(k);grp[c].st+=G.p[k].seats;grp[c].v+=votes[k]});
  const prevH=G.hist.length>1?G.hist[G.hist.length-2].seats:null;
  const rows=Object.keys(grp).map(c=>{const g=grp[c],lista=!!CO()[c];
    return {ab:lista?c:G.p[c].ab, n:lista?CO()[c].n:G.p[c].n, m:g.m, st:g.st,
      pct:g.v/total*100, col:lista?(CO()[c].c||G.p[g.m[0]].c):G.p[c].c, mine:g.m.includes(G.me),
      /* próg tej listy: im więcej partii pod jednym szyldem, tym wyżej.
         Bez tego noc nie mówi najważniejszej rzeczy — kto siada tuż pod kreską. */
      thr:thrFor(g.m.length), we:g.st>0, gl:g.v,
      d:prevH?g.st-g.m.reduce((a,k)=>a+(prevH[k]||0),0):null}})
    .sort((a,b)=>b.pct-a.pct);
  G.night={i:0,done:false,rows,total};
}
function nightScreen(){
  const N=G.night, poz=N.rows.length, settled=N.i>=poz, remain=poz-N.i;
  /* Zszywanie ekranu porównuje dzieci po numerze, więc lista musi rosnąć NA KOŃCU.
     Wcześniej nowy wynik dochodził na początek: każdy wiersz podmieniał treść
     w cudzym węźle, przez co nowa lista wjeżdżała bez ruchu, a przerysowywany
     był wiersz na samym dole — ten pokazany dawno temu. Dlatego w treści idą
     od najsłabszej, a .nightbox odwraca je z powrotem, żeby zwycięzca był u góry.

     Z tego samego powodu pusty cokół i cokół z nazwiskiem mają różne id:
     zszywanie porównuje węzły po id, więc dopiero to robi z tego wymianę węzła,
     a nie podmianę treści w starym — i animacja wjazdu ma się na czym odpalić. */
  const podane=N.rows.slice(poz-N.i), ujawnione=podane.slice().reverse();
  const max=Math.max(...N.rows.map(r=>r.pct),1);
  const zwyc=settled?N.rows[0]:null;
  // starsze zapisy nie mają w wierszu ani progu, ani liczby głosów — stąd zapasy
  const glosy=r=>r.gl!==undefined?r.gl:Math.round(r.pct/100*N.total);
  const wszedl=r=>r.we!==undefined?r.we:r.st>0;
  const policzone=podane.reduce((a,r)=>a+glosy(r),0);
  const kolejnosc=N.rows.slice().reverse();     // komisje podają od najsłabszej
  app.innerHTML=`
  <div class="nocekran">
    <div class="nocsz">
      <div class="kick">Noc wyborcza · kadencja ${G.term}</div>
      <h1>${settled?'Wszystko policzone':remain===1?'Ostatnia lista, ta najważniejsza…':'Liczymy głosy'}</h1>
      <p>${settled?'Komisje zamknęły protokoły. Tak wygląda nowy sejm.'
        :'Komisje podają wyniki od najsłabszej listy.'}</p>
      <div class="tabliczki">
        <div><b>${policzone}</b><span>policzone głosy</span></div>
        <div><b>${N.i}/${poz}</b><span>podane listy</span></div>
        <div><b>${Math.round(N.total/SERVER*100)}%</b><span>frekwencja</span></div>
        <div><b>${TOTAL_SEATS}</b><span>mandatów w grze</span></div>
      </div>
      <div class="nockom">
        <span class="luke">komisje</span>
        <div class="nockomt">${kolejnosc.map((r,j)=>
          `<i class="${j<N.i?'on':''}" style="--pc:${r.col}"></i>`).join('')}</div>
        <span class="luke">${settled?'wszystkie podały':`zostało ${remain}`}</span>
      </div>
    </div>

    <div class="noccokol ${zwyc?'jest':''}">
      <div class="mramka"></div>
      <div class="luke">Zwycięzca nocy</div>
      ${zwyc?`<div class="nocczolo" id="cokol-jest">
          <div class="ncrest">${zwyc.m.slice(0,4).map(k=>crest(k,'m')).join('')}</div>
          <div class="noccn"><b>${zwyc.n}</b><span>${zwyc.m.map(k=>G.p[k].ab).join(' · ')}</span></div>
          <div class="noccl"><b>${zwyc.st}</b><em>${pl(zwyc.st,'mandat','mandaty','mandatów')}</em></div>
          <div class="noccp"><b>${fmt(zwyc.pct)}%</b><em>poparcia</em></div>
        </div>`
       :`<div class="noccpusto" id="cokol-pusty">Cokół czeka. Komisje jeszcze liczą.</div>`}
    </div>

    <div class="nocplyta">
      <div class="nightbox">
        ${ujawnione.map((r,j)=>{
          const miejsce=poz-j, thr=r.thr||0;
          const thrL=thr?cl(thr/max*100,0,100):0;
          return `<div class="nrow ${r.mine?'me':''} ${wszedl(r)?'':'out'}" style="--pc:${r.col}">
            <div class="npos">${miejsce}</div>
            <div class="ncrest">${r.m.slice(0,4).map(k=>crest(k,'s')).join('')}</div>
            <div class="nname"><b>${r.n}</b><span>${r.m.map(k=>G.p[k].ab).join(' · ')}</span></div>
            <div class="ntrk"><i style="width:${(r.pct/max*100).toFixed(1)}%;background:${r.col};color:${r.col}"></i>
              ${thr?`<u style="left:${thrL.toFixed(1)}%" title="próg tej listy: ${thr}%"></u>`:''}</div>
            <div class="npct">${fmt(r.pct)}%</div>
            <div class="nseat"><b>${r.st}</b><em>${pl(r.st,'mandat','mandaty','mandatów')}</em></div>
            <div class="ndelta ${r.d===null||r.d===0?'pusto':r.d>0?'up':'dn'}">${
              r.d!==null&&r.d!==0?(r.d>0?'+':'')+r.d:''}</div>
          </div>`}).join('')}
      </div>
      ${N.i?'':'<div class="nocczek">Komisje zaraz podadzą pierwsze wyniki…</div>'}
    </div>

    <div class="ekstopka">
      <span class="ekleg">kreska w pasku to próg tej listy</span>
      <button class="btn ${settled?'':'g'}" onclick="${settled?'nightEnd()':'nightSkip()'}">${
        settled?'Przechodzę do wyników →':'Pokaż wszystko od razu'}</button>
    </div>
  </div>`;
  if(!settled)setTimeout(nightStep,remain<=1?1300:remain===2?820:(N.i<2?520:Math.max(260,560-N.i*45)));
}
function nightStep(){
  if(!G.night||G.night.i>=G.night.rows.length)return;
  G.night.i++;
  const r=G.night.rows[G.night.rows.length-G.night.i];
  beep(300+G.night.i*45,.07,'triangle',r.mine?.06:.03);
  liczenie(true);
  if(G.night.i===G.night.rows.length){
    setTimeout(()=>{const zwyc=G.night.rows[0];
      if(zwyc.mine){SFX.elect();burst(null,140,1)}else SFX.gong()},260);
    liczenie(false);
  }
  render();
}
function nightSkip(){if(G.night){G.night.i=G.night.rows.length;render()}}
function nightEnd(){if(G.night)G.night.done=true;render()}
/* ---- raport kadencji ---- */
function ocena(v){return v>=92?'A+':v>=82?'A':v>=72?'B':v>=60?'C':v>=45?'D':'F'}
function raport(){
  const H=G.hist,cur=H[H.length-1],prev=H.length>1?H[H.length-2]:null;
  const p=me();
  const dS=prev?cur.seats[G.me]-(prev.seats[G.me]||0):cur.seats[G.me];
  const dP=prev?cur.pct-prev.pct:cur.pct;
  const dM=prev&&prev.mem!==undefined?p.mem-prev.mem:p.mem;
  const cele=Object.keys(G.goals||{}).length-(prev&&prev.goals!==undefined?prev.goals:0);
  const urzedy=(cur.pm===G.me?1:0)+(G.prez&&G.prez.party===G.me?1:0);
  const pola=[
   {n:'Mandaty',v:cl(50+dS*9,0,100),o:`${dS>0?'+':''}${dS}`,d:'zmiana względem poprzednich wyborów'},
   {n:'Poparcie',v:cl(50+dP*5,0,100),o:`${dP>0?'+':''}${fmt(dP)} pkt`,d:'zmiana wyniku procentowego'},
   {n:'Ludzie',v:cl(46+dM*3.4,0,100),o:`${dM>0?'+':''}${dM}`,d:'przyrost składu partii'},
   {n:'Kondycja',v:cl((p.fame+p.cred+p.uni+p.act)/4,0,100),o:Math.round((p.fame+p.cred+p.uni+p.act)/4)+'/100',d:'średnia ze sławy, wiarygodności, jedności i aktywności'},
   {n:'Spokój',v:cl(100-p.ctr,0,100),o:Math.round(p.ctr)+' kontrowersji',d:'im mniej awantur, tym lepiej'},
   {n:'Ambicje',v:cl(30+cele*30+urzedy*20,0,100),o:`${cele} ${pl(cele,'cel','cele','celów')} · ${urzedy} ${pl(urzedy,'urząd','urzędy','urzędów')}`,d:'wypełnione cele partyjne i sprawowane urzędy'},
  ];
  const sr=pola.reduce((a,x)=>a+x.v,0)/pola.length;
  const werdykt=sr>=82?'Kadencja, o której serwer będzie gadał.':sr>=72?'Solidna robota, widać kierunek.'
    :sr>=60?'Ani wielki sukces, ani wpadka. Da się lepiej.':sr>=45?'Słabo. Coś tu nie zagrało.'
    :'Katastrofa. Trzeba zmienić wszystko.';
  return `<div class="card raport"><div class="h"><h3>Raport kadencji ${G.term}</h3>
    <span class="n">${prev?'porównanie z kadencją '+prev.term:'pierwsza kadencja'}</span></div><div class="b">
    <div class="rgrade"><div class="rletter ${sr>=72?'ok':sr>=45?'mid':'bad'}">${ocena(sr)}</div>
      <div><b>${werdykt}</b><p>Ocena łączna ${Math.round(sr)} na 100, liczona z sześciu obszarów.</p></div></div>
    <div class="rgrid">${pola.map(x=>`<div class="rcell">
      <div class="rtop"><span>${x.n}</span><b class="${x.v>=72?'ok':x.v>=45?'':'bad'}">${ocena(x.v)}</b></div>
      <div class="rbar"><i style="width:${x.v.toFixed(0)}%"></i></div>
      <div class="rval">${x.o}</div><div class="rdesc">${x.d}</div>
    </div>`).join('')}</div>
  </div></div>`;
}
/* ---- serwerowy kurier ---- */
function kurier(){
  const p=me(),H=G.polls||[];
  const ost=H.length>1?H[H.length-1]:null, przed=H.length>2?H[H.length-2]:null;
  let skok=null;
  if(ost&&przed){let best=null;
    alive().forEach(k=>{const d=(ost.s[k]||0)-(przed.s[k]||0);
      if(!best||Math.abs(d)>Math.abs(best.d))best={k,d}});
    if(best&&Math.abs(best.d)>=.6)skok=best;
  }
  const lead=alive().sort((a,b)=>G.p[b].seats-G.p[a].seats)[0];
  const naglowki=[];
  if(p.ctr>=90)naglowki.push([`${p.ab} TONIE W AWANTURACH`,'Serwer mówi już tylko o tym, komu podpadliście w tym tygodniu.']);
  if(isPM())naglowki.push([`RZĄD ${p.ab} PRACUJE`,`${p.lead} zapowiada, że wszystko idzie zgodnie z planem. Nikt nie zna planu.`]);
  if(skok&&skok.d>0)naglowki.push([`${G.p[skok.k].ab} W GÓRĘ O ${fmt(skok.d)} PKT`,`Najlepszy tydzień ${G.p[skok.k].n} od dawna.`]);
  if(skok&&skok.d<0)naglowki.push([`${G.p[skok.k].ab} TRACI ${fmt(-skok.d)} PKT`,`W kuluarach mówią o zmianie kursu.`]);
  if(p.mem<=3)naglowki.push([`CZY ${p.ab} TO JESZCZE PARTIA?`,'Trzy osoby, jeden kanał i dużo dobrych chęci.']);
  if((G.streak||0)>=4)naglowki.push([`${p.ab} NIE ZWALNIA`,`Czwarty tydzień z rzędu z realnymi ruchami. Konkurencja patrzy.`]);
  if(G.sits&&G.sits.some(x=>!x.done))naglowki.push(['SYTUACJA BEZ ROZSTRZYGNIĘCIA','Serwer czeka, aż ktoś w końcu podejmie decyzję.']);
  naglowki.push([`${G.p[lead].ab} NA CZELE SEJMU`,`${G.p[lead].seats} ${pl(G.p[lead].seats,'mandat','mandaty','mandatów')} i coraz większa pewność siebie.`]);
  naglowki.push(['CISZA NA KANAŁACH','Tydzień bez skandalu. Redakcja odnotowuje z niedowierzaniem.']);
  const wybor=naglowki[(G.term*7+G.week)%Math.min(naglowki.length,3)]||naglowki[0];
  return `<div class="kurier">
    <div class="kglowa"><b>Serwerowy Kurier</b><span>${dateStr(gameDate())} · nakład 670</span></div>
    <h3>${wybor[0]}</h3><p>${wybor[1]}</p>
  </div>`;
}
/* ---- rywal ---- */
/* ---- skróty klawiszowe ---- */
function initKeys(){
  if(initKeys.done||typeof document==='undefined'||!document.addEventListener)return;
  initKeys.done=1;
  document.addEventListener('keydown',e=>{
    if(!G||document.getElementById('veil'))return;
    if(e.target&&/input|textarea/i.test(e.target.tagName||''))return;
    const T=['mapa','akcje','lider','krol','sondaz','cele','sejm'];
    if(e.key>='1'&&e.key<='7'){const t=T[+e.key-1];if(t){G.tab=t;if(G.tutSeen)G.tutSeen[t]=1;render()}}
    else if(e.code==='Space'&&G.phase==='camp'){e.preventDefault();if(typeof endWeek==='function')endWeek()}
    else if(e.key==='m'||e.key==='M')toggleMute();
  });
}


/* Iskra — miniaturowy wykres wklejany wprost w podpowiedź. U nich dymki
   pokazują historię obok liczby, więc widać nie tylko ile, ale i dokąd to
   idzie. Rysowany jako SVG w treści, bez żadnej biblioteki. */
function iskra(dane,kolor,W,H){
  const d=(dane||[]).filter(x=>isFinite(x));
  if(d.length<2)return '';
  W=W||240;H=H||46;
  const mn=Math.min(...d),mx=Math.max(...d),roz=Math.max(1e-9,mx-mn);
  const x=i=>(i/(d.length-1)*(W-4)+2).toFixed(1);
  const y=v=>(H-4-((v-mn)/roz)*(H-10)).toFixed(1);
  const linia=d.map((v,i)=>`${i?'L':'M'}${x(i)},${y(v)}`).join(' ');
  const pole=`M${x(0)},${H} L`+d.map((v,i)=>`${x(i)},${y(v)}`).join(' L')+` L${x(d.length-1)},${H} Z`;
  const k=kolor||'var(--acc)';
  return `<svg class="iskra" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
    <path d="${pole}" fill="${k}" fill-opacity=".14"/>
    <path d="${linia}" fill="none" stroke="${k}" stroke-width="1.8"
      stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${x(d.length-1)}" cy="${y(d[d.length-1])}" r="2.6" fill="${k}"/>
  </svg>`;
}

/* ══════════ LISTA WAŻNYCH AKCJI ══════════
   Wzięte z paska alertów Victorii: rząd znaczników, z których każdy mówi
   „tu czeka na ciebie decyzja". Wcześniej trzeba było obejść wszystkie działy,
   żeby sprawdzić, czy gdzieś czegoś nie przegapiłeś — ustawa do podpisu,
   sytuacja bez rozstrzygnięcia, gotowy cel, wydawnictwo gotowe do wydania.
   Teraz wszystko woła samo, a kliknięcie prowadzi wprost tam, gdzie trzeba. */
function waznePozycje(){
  if(!G||!G.p||!G.p[G.me])return [];
  const w=[];
  if(hasPrez()&&lawsToSign().length)
    w.push({i:'✒',n:'Ustawa czeka na podpis',d:'Prezydent musi ją podpisać albo zawetować.',t:'prezydent',pilne:1});
  if(isPM()&&lawsPending())
    w.push({i:'§',n:'Możesz zgłosić ustawę',d:'Żadna nie jest w toku — sejm czeka.',t:'premier'});
  (G.sits||[]).filter(x=>!x.done).forEach(x=>{
    const S=SITS[x.id];
    w.push({i:'!',n:S?S.k:'Sytuacja na serwerze',d:S?S.n:'Coś się dzieje i czeka na rozstrzygnięcie.',t:'sejm',pilne:1});
  });
  if(goalReady())
    w.push({i:'★',n:'Cel partyjny gotowy',d:'Warunki spełnione — możesz go odebrać.',t:'cele',pilne:1});
  if(leads(G.p[G.me]).some(n=>xpOs(n)>=35))
    w.push({i:'▲',n:'Doświadczenie do wydania',d:'Przewodniczący może podnieść cechę albo kupić nową.',t:'lider'});
  if(kingFav(G.me)<0)
    w.push({i:'♛',n:'Król jest na ciebie zły',d:'Przy ujemnej przychylności desygnacja przejdzie obok ciebie.',t:'krol',pilne:1});
  if(G.ap>0)
    w.push({i:'●',n:`${G.ap} ${pl(G.ap,'ruch','ruchy','ruchów')} do wykorzystania`,d:'Niewykorzystane akcje przepadają z końcem tygodnia.',t:'akcje'});
  if(mediaJest())(G.media||[]).filter(m=>mediaGotowe(m)).forEach(m=>
    w.push({i:'📰',n:`${m.nazwa} czeka na wydanie`,d:'Wydawnictwo jest gotowe, a nic z niego nie wychodzi.',t:'media'}));
  const p=me();
  if(p.ctr>=82)w.push({i:'✖',n:'Kontrowersja pod sufitem',d:`${Math.round(p.ctr)}/100. Przy 90 partia wpada w paraliż.`,t:'mapa',pilne:1});
  const szef=p.lead, kies=szef?kapPryw(szef):0;
  if(kies<0)w.push({i:'✖',n:'Przewodniczący pod kreską',d:`Dług rośnie o ${Math.round(DLUG_ODSETKI*100)}% tygodniowo.`,t:'ekonomia',pilne:1});
  return w;
}
function waznePasek(){
  const w=waznePozycje(); if(!w.length)return '';
  return `<div class="wazne">
    <span class="wazneet">Czeka na ciebie</span>
    <div class="waznelista">${w.map(x=>
      `<button class="waz ${x.pilne?'pilne':''}" onclick="setTab('${x.t}')" title="${esc(x.d)}">
        <i>${x.i}</i><span>${esc(x.n)}</span></button>`).join('')}</div>
  </div>`;
}

/* ══════════ PANEL MODYFIKATORÓW ══════════
   U nich to lista wszystkiego, co aktualnie działa na kraj, razem ze źródłem.
   U nas siedziała kupa liczb, których gracz nie widział na oczy: znużenie
   władzą, momentum, przewaga po zjeździe, inflacja, zmęczenie decyzją,
   mnożnik rangi i zasięg mediów. Tu wszystko stoi w jednym miejscu. */
function modyfikatory(){
  const p=me(),m=[];
  const z=znuzenie(G.me);
  if(z>0.5)m.push({n:'Zmęczenie władzą',v:`−${Math.round(z/1.65)}% poparcia`,zle:1,
    zr:'Każda kadencja u steru dokłada, kadencja w opozycji zdejmuje.'});
  if(Math.abs(p.mom||0)>1)m.push({n:'Momentum',v:`${(p.mom||0)>0?'+':''}${Math.round(p.mom||0)}`,zle:(p.mom||0)<0,
    zr:'Wygrane debaty, udane afery i owacyjne wiece. Wygasa o 17% tygodniowo.'});
  if(p.rally)m.push({n:'Przewaga po zjeździe',v:`+${p.rally*9}% do wyborów`,
    zr:'Zjazd partii. Trzyma do końca kadencji.'});
  if(p.laws)m.push({n:'Dorobek ustawodawczy',v:`+${(p.laws*3)}% do wyniku`,
    zr:'Ustawy, które przepchnąłeś. Zostają na zawsze.'});
  const inf=inflacjaProc();
  if(inf>0)m.push({n:'Inflacja',v:`decyzje +${inf}% drożej`,zle:1,
    zr:`Kapitał ponad ${INFLACJA_PROG}. Im większy zapas leży w kasie, tym drożej.`});
  const sf=sizeF(p);
  if(sf.lab)m.push({n:sf.lab,v:`koszt ×${sf.kp.toFixed(2)}`,zle:sf.kp>1,
    zr:'Im większa partia, tym drożej się nią rusza.'});
  const zas=zasiegMediow();
  if(zas>0)m.push({n:'Zasięg mediów',v:`+${zas.toFixed(1)}% w sondażu`,
    zr:'Wydawnictwa, z których coś wychodzi. Zasięg wygasa, jeśli nic nie wydajesz.'});
  const mr=mnoznikRangi(p.lead);
  if(mr>1)m.push({n:`Ranga: ${(ranga(p.lead)||{}).n||'—'}`,v:`zarobek ×${mr.toFixed(2)}`,
    zr:'Każdy zdobyty stopień to +18% do tego, co przewodniczący zarabia.'});
  const uz=Object.keys(G.used||{}).filter(k=>G.used[k]>0);
  if(uz.length)m.push({n:'Zmęczenie decyzjami',v:`${uz.length} ${pl(uz.length,'powtórzona','powtórzone','powtórzonych')}`,zle:1,
    zr:'Ta sama zagrywka w kółko działa coraz słabiej. Odpuszczenie ją regeneruje.'});
  (G.sits||[]).filter(x=>!x.done).forEach(x=>{const S=SITS[x.id];
    if(S)m.push({n:S.k,v:'trwa',zle:1,zr:S.n})});
  if(G.absolutorium&&G.absolutorium.term===G.term-1&&!G.absolutorium.udzielone)
    m.push({n:'Brak absolutorium',v:'z poprzedniej kadencji',zle:1,
      zr:'PKB spadło, a sejm to zapisał.'});
  return `<div class="card"><div class="h"><h3>Co na ciebie działa</h3>
    <span class="n">${m.length} ${pl(m.length,'modyfikator','modyfikatory','modyfikatorów')}</span></div><div class="b">
    ${m.length?`<div class="modlista">${m.map(x=>`<div class="modw ${x.zle?'zle':'ok'}">
      <div class="modl"><b>${x.n}</b><span>${x.zr}</span></div>
      <div class="modv">${x.v}</div></div>`).join('')}</div>`
     :'<p class="dim" style="margin:0">Nic szczególnego. Czysta kartka.</p>'}
  </div></div>`;
}


/* ══════════ GRUPY INTERESU ══════════
   Wzięte z panelu grup interesu Victorii. Elita, intelektualiści i serwerowicze
   byli do tej pory wyłącznie elektoratem — liczyli się przy urnach i nic poza
   tym. Teraz są siłą polityczną: mają zadowolenie, mają czego chcieć, popierają
   albo blokują ustawy i mówią to wprost.

   Zadowolenie rusza się od tego, co robisz: podatek progresywny wkurza elitę,
   równy uderza w serwerowiczów, ustawy o rozrywce cieszą wszystkich, awantura
   w partii zniechęca intelektualistów. Wchodzi wprost w nastrój segmentu,
   czyli w to samo miejsce, którym gra liczyła głosy od zawsze. */
const GRUPY={
 eli:{n:'Elita',   c:'#e0b23c', chce:'Spokoju, prestiżu i tego, żeby nikt nie ruszał ich pieniędzy.'},
 int:{n:'Intelektualiści',c:'#5a9be8', chce:'Programów, ustaw i tego, żeby ktoś w ogóle czytał statut.'},
 ser:{n:'Serwerowicze',c:'#4bbd85', chce:'Rozrywki, luzu i niskich podatków dla zwykłych ludzi.'},
};
function grupyInit(){
  if(!G.grupy)G.grupy={};
  SID.forEach(g=>{if(G.grupy[g]===undefined)G.grupy[g]=50});
}
const zadowolenie=g=>{grupyInit();return G.grupy[g]};
function zmienZadowolenie(g,d,why){
  grupyInit();
  G.grupy[g]=cl(G.grupy[g]+d,0,100);
  if(why&&Math.abs(d)>=4)
    say(`<b>${GRUPY[g].n}:</b> ${why} Zadowolenie ${d>0?'+':''}${Math.round(d)} (teraz ${Math.round(G.grupy[g])}).`,
        d>0?'good':'bad');
}
/* Zadowolenie przekłada się na nastrój segmentu, czyli na to, ilu ich przyjdzie
   zagłosować. Pięćdziesiąt to obojętność, sto to zapał, zero to bojkot. */
function grupyTydzien(){
  grupyInit();
  const p=me(), st=stawkaMajatkowa(), prog=progresjaWlaczona();
  // podatki
  if(st>0){
    if(prog){zmienZadowolenie('eli',-st*.35);zmienZadowolenie('ser',+st*.18)}
    else {zmienZadowolenie('ser',-st*.30);zmienZadowolenie('eli',+st*.10)}
  }
  // awantura zniechęca tych, którzy lubią porządek
  if(p.ctr>65){zmienZadowolenie('int',-1.1);zmienZadowolenie('eli',-.9)}
  if(p.ctr<30)zmienZadowolenie('eli',+.4);
  // aktywność cieszy serwerowiczów, wiarygodność intelektualistów
  if(p.act>60)zmienZadowolenie('ser',+.6);
  if(p.cred>60)zmienZadowolenie('int',+.6);
  // wszystko wraca powoli do obojętności, więc nic nie zostaje na zawsze
  SID.forEach(g=>{G.grupy[g]=cl(G.grupy[g]+(50-G.grupy[g])*.05,0,100)});
  // nastrój segmentu jedzie za zadowoleniem
  SID.forEach(g=>{G.mood[g]=cl(.78+G.grupy[g]/100*.48,.76,1.28)});
}
/* Jak grupa patrzy na konkretną ustawę. Zwraca liczbę od −1 do 1. */
function grupaWobecUstawy(g,id,opcje){
  const law=lawById(id); if(!law)return 0;
  let v=0;
  if(law.kat==='rozrywka')v+= g==='ser'?.7:g==='int'?.2:0;
  if(law.kat==='ustroj') v+= g==='int'?.5:g==='eli'?.2:-.2;
  if(id==='podatki'&&opcje){
    const st=opcje.majatek||0, pr=opcje.progresja>0;
    if(pr){v+= g==='eli'?-st*.11:g==='ser'?+st*.06:0}
    else  {v+= g==='ser'?-st*.10:g==='eli'?+st*.04:0}
  }
  if(id==='media')v+= g==='int'?.5:g==='ser'?.3:0;
  if(id==='man') v+= g==='int'?.6:g==='eli'?.3:-.1;
  // grupa niezadowolona jest generalnie przeciw wszystkiemu, co idzie od rządu
  v+=(zadowolenie(g)-50)/145;
  return Math.max(-1,Math.min(1,v));
}
function grupyTab(){
  grupyInit();
  return `<div class="card"><div class="h"><h3>Grupy interesu</h3>
    <span class="n">czego chcą i jak im się układa</span></div><div class="b">
    <div class="grlista">${SID.map(g=>{const z=zadowolenie(g),G_=GRUPY[g];
      const stan=z>=70?'zadowoleni':z>=55?'spokojni':z>=45?'obojętni':z>=30?'zniechęceni':'wrogo nastawieni';
      return `<div class="grw" style="--gc:${G_.c}">
        <div class="grl"><b>${G_.n}</b><span>${G_.chce}</span></div>
        <div class="grp">
          <div class="trk"><i style="width:${z}%;background:${G_.c}"></i></div>
          <div class="grv">${Math.round(z)} · ${stan}</div>
        </div>
      </div>`}).join('')}</div>
    <div class="note" style="margin-top:12px">Zadowolenie przekłada się wprost na to,
    ilu z nich przyjdzie zagłosować. Podatki, awantury i to, czym się zajmujesz,
    ruszają nim w obie strony, ale wszystko powoli wraca do obojętności.</div>
  </div></div>`;
}

/* ══════════ RADYKAŁOWIE I LOJALIŚCI ══════════
   U nich ludność dzieli się na radykałów i lojalistów zależnie od tego, jak jej
   się żyje. U nas tak samo: przy awanturze i rozsypanej partii część składu
   radykalizuje się i zaczyna szkodzić, przy wiarygodności i zgodzie rośnie
   twardy trzon, którego nikt ci nie podbierze. */
function radykalowie(k){
  const p=G.p[k||G.me]; if(!p)return {rad:0,loj:0};
  const rad=Math.round(p.mem*cl(p.ctr/100*.55+(60-p.uni)/100*.35,0,.75));
  const loj=Math.round(p.mem*cl(p.cred/100*.42+p.uni/100*.30-p.ctr/100*.25,0,.7));
  return {rad:Math.max(0,rad),loj:Math.max(0,loj)};
}
function radykalowieTydzien(){
  const p=me(), r=radykalowie(G.me);
  if(r.rad>0){
    // radykałowie sami z siebie podbijają kontrowersję i czasem wychodzą
    p.ctr=cl(p.ctr+Math.min(3.2,r.rad*.16));
    if(r.rad>=4&&ch(.18)){
      const g=giveBackCap(p,1),n=g.eli+g.int+g.ser;
      if(n)say(`<b>Radykałowie odchodzą.</b> ${r.rad} ${pl(r.rad,'osoba jest','osoby są','osób jest')} `
        +`nie do utrzymania przy tej kontrowersji — jedna właśnie trzasnęła drzwiami.`,'bad');
    }
  }
  if(r.loj>0)p.uni=cl(p.uni+Math.min(1.6,r.loj*.05));
}

/* ══════════ SYTUACJE CZASOWE ══════════ */
const absWeek=()=>((G.term-1)*12+G.week);
function sitDate(abs){const d=new Date(2026,7,1);d.setDate(d.getDate()+(abs-1)*7);return d}
const SITS={
 koniecROM:{
  n:'Koniec liderstwa, co dalej?', k:'Sytuacja w ROM', logo:'ROM',
  start:()=>{const k=G.sits&&G.sits.find(x=>x.id==='kraniecPPP');return !!(k&&k.done&&absWeek()>=k.to+2)},
  weeks:5,
  d:'cargrzybov formalnie prowadzi Ruch Obrony Monarchii, ale z roleplayu wypisał się dawno temu. '
   +'Kanał stoi, statutu nikt nie czyta, a monarchiści z innych partii już się rozglądają, kto przejmie sztandar.',
  tick(){
    const q=G.p.ROM;if(!q||q.dead)return;
    q.fame=cl(q.fame-3.8);q.uni=cl(q.uni-3.4);q.cred=cl(q.cred-2.8);q.act=cl(q.act-1.6);
    M(q,-3);q.bank=Math.max(0,(q.bank||0)-12);
    if(G.me==='ROM'&&ch(.5)){const g=giveBackCap(q,1),n=g.eli+g.int+g.ser;
      if(n)say('<b>Koniec liderstwa:</b> ktoś wypisał się z partii bez słowa.','bad')}
  },
  end(){ if(G.me==='ROM')G.sitPending='koniecROM'; else sitROMEnd(); },
  resolve(){ sitROMChoice(); }
 },
 kraniecPPP:{
  n:'Kraniec PPP', k:'Sytuacja w PPP', logo:'PPP',
  start:()=>G.term===1&&G.week>=2,
  weeks:6,
  d:'Lager przestał odpisywać nie tylko na DM-y. Partia Polskich Patriotów tygodniami nie wypuszcza nic poza '
   +'zapowiedziami, ludzie wychodzą po cichu, a sondaż osypuje się z tygodnia na tydzień. Serwer czeka, aż ktoś '
   +'w końcu podejmie decyzję.',
  tick(){
    const q=G.p.PPP;if(!q||q.dead)return;
    q.fame=cl(q.fame-3.4);q.act=cl(q.act-2.6);q.uni=cl(q.uni-2.2);q.ctr=cl(q.ctr+1.2);
    q.bank=Math.max(0,(q.bank||0)-18);
    M(q,-4);
    if(ch(.6)){const g=giveBackCap(q,2);const n=g.eli+g.int+g.ser;
      if(n&&G.me==='PPP')say(`<b>Kraniec PPP:</b> odchodzi ${n} ${pl(n,'osoba','osoby','osób')}, nikt nie tłumaczy dlaczego.`,'bad')}
    if(G.me==='PPP'){G.kp=Math.max(-40,G.kp-6)}
  },
  end(){ if(G.me==='PPP')G.sitPending='kraniecPPP'; else sitKraniecEnd(); },
  resolve(){ sitKraniecChoice(); }
 }
};
function sitActive(id){return !!(G.sits&&G.sits.some(x=>x.id===id&&!x.done))}
function sitTick(){
  if(!G.sits)G.sits=[];
  Object.keys(SITS).forEach(id=>{
    const s=SITS[id];
    if(G.sits.some(x=>x.id===id))return;
    if(s.start()){
      G.sits.push({id,from:absWeek(),to:absWeek()+s.weeks});
      say(`<b>Nowa sytuacja: ${s.n}.</b> ${s.d} Rozstrzygnie się do ${dateStr(sitDate(absWeek()+s.weeks))}.`,'roy');
    }
  });
  G.sits.forEach(x=>{
    if(x.done)return;
    const s=SITS[x.id];
    if(absWeek()>=x.to){x.done=1;s.end()}
    else s.tick();
  });
}
function sitBanner(){
  if(!G.sits||!G.sits.some(x=>!x.done))return '';
  return G.sits.filter(x=>!x.done).map(x=>{const s=SITS[x.id],left=x.to-absWeek();
    return `<div class="sitbar">
      ${s.logo?crest(s.logo,'m'):''}
      <div style="flex:1;min-width:0">
        <div class="sitk">Sytuacja w toku</div>
        <b>${s.n}</b>
        <p>${s.d}</p>
      </div>
      <div class="sitleft"><b>${left}</b><span>${pl(left,'tydzień','tygodnie','tygodni')}</span>
        <em>do ${dateStr(sitDate(x.to))}</em></div>
    </div>`}).join('');
}
function eraBanner(){
  if(!isEraNiestab())return '';
  const end=new Date(2027,1,1);
  const left=Math.max(1,Math.ceil((end-gameDate())/(7*86400000)));
  return `<div class="sitbar">
    <div style="width:44px;height:44px;border-radius:50%;background:rgba(217,171,69,.16);
      border:1px solid var(--acc);display:grid;place-items:center;font-size:19px;flex:none">⚡</div>
    <div style="flex:1;min-width:0">
      <div class="sitk">Wydarzenie globalne</div>
      <b>Era niestabilności</b>
      <p>Grudniowo-styczniowy chaos na serwerze. Werbunek działaczy z cudzych partii idzie łatwiej, tobie i botom.</p>
    </div>
    <div class="sitleft"><b>${left}</b><span>${pl(left,'tydzień','tygodnie','tygodni')}</span>
      <em>do 1 lutego 2027</em></div>
  </div>`;
}
function sitROMEnd(){
  const q=G.p.ROM;if(!q||q.dead)return;
  q.uni=cl(q.uni+10);q.fame=cl(q.fame+4);
  say('<b>Koniec liderstwa rozstrzygnięty.</b> cargrzybov zostaje przy sztandarze Ruchu Obrony Monarchii, choć nikt nie wie, na jak długo.','roy');
}
function sitROMChoice(){
  const q=me();
  const cel=(G.p.KK&&!G.p.KK.dead)?'KK':null;
  const nazwaCel=cel?G.p.KK.n:'Kongresu już nie ma';
  const opts=[
   {l:'Zostaję jako cargrzybov i wracam z silniejszą ręką',
    s:'Jedność +26, wiarygodność +14, sława +12, aktywność +18. Partia rusza z miejsca.',
    f:()=>{close();
      q.uni=cl(q.uni+26);q.cred=cl(q.cred+14);q.fame=cl(q.fame+12);q.act=cl(q.act+18);M(q,16);XP(14);
      say('<b>cargrzybov wraca do gry.</b> Ruch Obrony Monarchii dostaje drugie życie, a serwer nie wie, co o tym myśleć.','roy');
      render()}}];
  if(cel)opts.push({l:`Wkraczam do ${nazwaCel}`,
    s:'Twoi ludzie i mandaty przechodzą pod koronę, dalej grasz tamtą partią',
    f:()=>{close();sitROMMerge()}});
  sitModal('Koniec liderstwa','Ruch Obrony Monarchii czeka na decyzję',
    `<p>Pięć tygodni zwłoki wystarczyło, żeby z partii zostało ${q.mem} ${pl(q.mem,'osoba','osoby','osób')},
     sława ${Math.round(q.fame)} i jedność ${Math.round(q.uni)}. Albo cargrzybov wraca naprawdę, albo sztandar
     trafia pod koronę.</p>`,opts);
}
function sitROMMerge(){
  const q=G.p.ROM,kk=G.p.KK;
  kk.comp.eli+=q.comp.eli;kk.comp.int+=q.comp.int;kk.comp.ser+=q.comp.ser;
  kk.mem+=q.mem;kk.seats+=q.seats;
  [q.lead].concat(q.bench).forEach(n=>{if(!kk.bench.includes(n)&&kk.bench.length<12)kk.bench.push(n)});
  q.dead=1;q.mem=0;q.comp={eli:0,int:0,ser:0};q.seats=0;q.bench=[];
  if(G.gov&&G.gov.parties.includes('ROM'))govLeave('ROM');
  G.me='KK';G.tab='mapa';
  kk.uni=cl(kk.uni+8);kk.fame=cl(kk.fame+5);
  say(`<b>Ruch Obrony Monarchii przestaje istnieć.</b> Sztandar, ludzie i mandaty wchodzą do ${kk.n}. Od teraz grasz tą partią.`,'roy');
  render();
}
function sitKraniecEnd(){
  const q=G.p.PPP;
  if(!q||q.dead)return;
  // bez gracza partia ratuje się sama, ale drogo
  const nast=q.bench.length?q.bench[0]:null;
  if(nast){const stary=q.lead;q.lead=nast;q.bench=q.bench.filter(n=>n!==nast);if(!q.bench.includes(stary))q.bench.push(stary);
    q.uni=cl(q.uni+14);q.act=cl(q.act+10);q.fame=cl(q.fame+6);
    say(`<b>Kraniec PPP rozstrzygnięty.</b> ${stary} oddaje przewodnictwo, partię przejmuje <b>${nast}</b>. PPP łapie oddech.`,'roy');
  } else {
    q.uni=cl(q.uni+6);say('<b>Kraniec PPP rozstrzygnięty.</b> Nikt się nie zgłosił, Lager zostaje i partia dogorywa dalej.','bad');
  }
}
function sitKraniecChoice(){
  const q=me(),kandydaci=[...new Set(q.bench.concat(q.main))].filter(n=>n!==q.lead);
  const opts=[];
  opts.push({l:'Rozwiązuję PPP i wchodzę do Kongresu Koronnego',
    s:'Twoi ludzie i mandaty przechodzą do KK, dalej grasz Kongresem',
    f:()=>{close();sitKraniecMerge()}});
  kandydaci.slice(0,4).forEach(n=>{const x=L(n);
    opts.push({l:`Oddaję przewodnictwo: ${n}`,
      s:`charyzma ${x.char} · kompetencja ${x.komp} · wytrzymałość ${x.wytrz} · jedność i aktywność wracają do gry`,
      f:()=>{close();sitKraniecLead(n)}})});
  if(!kandydaci.length)opts.push({l:'Zostawiam Lagera',s:'Partia dogorywa, ale zostaje twoja',
    f:()=>{close();q.uni=cl(q.uni+5);say('<b>Kraniec PPP:</b> zostawiasz wszystko jak jest. Serwer to zapamięta.','bad');render()}});
  sitModal('Kraniec PPP','Trzeba podjąć decyzję',
    `<p>Sześć tygodni osuwania się skończyło. Partia Polskich Patriotów nie przetrwa kolejnej kadencji
     w tym stanie: ${Math.round(q.mem)} ${pl(q.mem,'osoba','osoby','osób')}, sława ${Math.round(q.fame)},
     jedność ${Math.round(q.uni)}. Albo ktoś inny bierze stery, albo zwijasz szyld i wchodzisz pod koronę Kongresu.</p>`,opts);
}
function sitKraniecMerge(){
  const q=G.p.PPP,kk=G.p.KK;
  kk.comp.eli+=q.comp.eli;kk.comp.int+=q.comp.int;kk.comp.ser+=q.comp.ser;
  kk.mem+=q.mem;kk.seats+=q.seats;
  [q.lead].concat(q.bench).forEach(n=>{if(!kk.bench.includes(n)&&kk.bench.length<12)kk.bench.push(n)});
  q.dead=1;q.mem=0;q.comp={eli:0,int:0,ser:0};q.seats=0;q.bench=[];
  if(G.gov&&G.gov.parties.includes('PPP'))govLeave('PPP');
  G.me='KK';G.tab='mapa';
  kk.uni=cl(kk.uni+10);kk.act=cl(kk.act+8);
  say('<b>Partia Polskich Patriotów przestaje istnieć.</b> Ludzie, mandaty i cała ława wchodzą pod koronę Kongresu Koronnego. Od teraz grasz Kongresem.','roy');
  render();
}
function sitKraniecLead(n){
  const q=me(),stary=q.lead;
  q.lead=n;q.main=[n];q.bench=q.bench.filter(x=>x!==n);
  if(!q.bench.includes(stary))q.bench.push(stary);
  q.uni=cl(q.uni+16);q.act=cl(q.act+12);q.fame=cl(q.fame+8);M(q,10);XP(14);
  say(`<b>Kraniec PPP:</b> ${stary} odchodzi na ławkę, partię przejmuje <b>${n}</b>. Kanały wracają do życia.`,'roy');
  render();
}
function sitModal(kick,tyt,body,opts){
  close();
  const v=document.createElement('div');v.className='veil';v.id='veil';
  v.innerHTML=`<div class="mdl sitmdl">
    <button class="mdlx" type="button" aria-label="Zamknij">×</button>
    <div class="siths">
      <svg viewBox="0 0 120 120" class="sitseal"><g fill="none" stroke="var(--acc)" stroke-width="1.6">
        <circle cx="60" cy="60" r="52" stroke-opacity=".55"/><circle cx="60" cy="60" r="44" stroke-opacity=".35"/>
        <path d="M60 12l5 12-5-3-5 3z" fill="var(--acc)" stroke="none"/>
        <path d="M26 74q34 22 68 0" stroke-opacity=".5"/></g></svg>
      <div class="k">${kick}</div><h2>${tyt}</h2></div>
    <div class="bd">${body}</div>
    <div class="op">${opts.map((o,i)=>`<button class="opt" data-i="${i}"><b>${o.l}</b><span>${o.s||''}</span></button>`).join('')}</div>
  </div>`;
  document.body.appendChild(v);
  v.querySelectorAll('.opt').forEach(b=>b.onclick=()=>opts[+b.dataset.i].f());
  v.querySelector('.mdlx').onclick=()=>{close();render()};
}

/* ══════════ TRYBY GRY I SAMOUCZEK ══════════ */
let MODE=null;
/* Menu główne stoi PRZED wyborem trybu. Wzorzec kinowy: tło na całą szerokość,
   a po lewej sam tekst — bez ramek, bez kafli, bez płyt. Reszta gry zostaje
   w języku Victorii, ale ten jeden ekran ma być pusty i ma robić wrażenie. */
let MENU=true;
function menuIdz(gdzie){
  if(gdzie==='nowa'){MENU=false;render();return}
  if(gdzie==='wczytaj'){openSave();return}
  if(gdzie==='scenariusze'){MENU=false;MODE='scen';render();return}
  if(gdzie==='kreator'){openKreator();return}
  if(gdzie==='tworcy'){modal('Mordy Mordeczki','Twórcy',creditsBox(),
    [{l:'Zamykam',f:()=>{close();render()}}]);return}
  if(gdzie==='wyjdz'){
    const a=(window.pywebview&&window.pywebview.api)||null;
    if(a&&a.zamknij){try{a.zamknij();return}catch(e){}}
    try{window.close()}catch(e){}
  }
}
function menuGlowne(){
  const poz=[['nowa','Nowa gra'],['wczytaj','Wczytaj grę'],['scenariusze','Scenariusze'],
             ['kreator','Kreator scenariuszy'],['tworcy','Twórcy'],['wyjdz','Wyjdź']];
  app.innerHTML=`
  <div class="mg">
    <div class="mgtlo"></div>
    <div class="mgcien"></div>
    <div class="mgtresc">
      <div class="mgznak">Mordy Mordeczki</div>
      <h1 class="mgtytul">Sejm</h1>
      <div class="mgkreska"></div>
      <nav class="mgmenu">
        ${poz.map(([id,n])=>`<button class="mgpoz" onclick="menuIdz('${id}')">${n}</button>`).join('')}
      </nav>
      <div class="mgkreska dol"></div>
    </div>
    <div class="mgwersja">wersja ${WERSJA}</div>
  </div>`;
  if(patchDoPokazania())setTimeout(pokazPatch,600);
}
function backToMenu(){MENU=true;MODE=null;SCENSEL=null;render()}
function pickMode(m){MODE=m;SFX.click();if(m==='tut'){SCENSEL=null;return startTutorial()}if(m==='free')SCENSEL=null;render()}
function backToMode(){MODE=null;render()}
/* Ikony trybów. Jedna definicja, żeby karty miały wspólny język i grubość kreski. */
const IKO={
 tut:'<path d="M12 18h22a6 6 0 0 1 6 6v26a6 6 0 0 0-6-6H12z"/><path d="M52 18H40a6 6 0 0 0-6 6v26a6 6 0 0 1 6-6h12z" opacity=".55"/><path d="M18 28h10M18 36h8"/>',
 free:'<path d="M32 7l6.6 13.7L53 23l-10.6 10.2L45 48l-13-6.8L19 48l2.6-14.8L11 23l14.4-2.3z"/><path d="M32 48v9" opacity=".5"/><path d="M24 57h16" opacity=".5"/>',
 upad:'<path d="M14 52h36"/><path d="M20 52V28l12-12 12 12v24"/><path d="M27 52V38h10v14" opacity=".55"/><path d="M46 14l6 6M52 14l-6 6" opacity=".8"/>',
 los :'<path d="M32 8l20 11v22L32 52 12 41V19z"/><path d="M32 30v22" opacity=".5"/><path d="M12 19l20 11 20-11" opacity=".5"/><circle cx="32" cy="22" r="2.6" fill="currentColor" stroke="none"/><circle cx="23" cy="38" r="2.2" fill="currentColor" stroke="none" opacity=".7"/><circle cx="41" cy="38" r="2.2" fill="currentColor" stroke="none" opacity=".7"/>',
 kre :'<path d="M12 50h40"/><path d="M18 50V32M30 50V20M42 50V38"/><path d="M44 14l7 7-19 19-9 2 2-9z"/>',
 plik:'<path d="M14 14h20l6 7h10v33H14z"/><path d="M32 30v16" opacity=".8"/><path d="M25 39l7 7 7-7" opacity=".8"/>',
};
const iko=k=>`<svg class="mico" viewBox="0 0 64 64"><g fill="none" stroke="currentColor"
  stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${IKO[k]}</g></svg>`;

/* ── Ślepy los ──
   Karta bez podpowiedzi: gra sama dobiera scenariusz i partię, a gracz dowiaduje
   się, czym gra, dopiero po starcie. Nie ma tu żadnej nowej mechaniki — to zwykły
   start, tylko wybrany za ciebie. */
/* Panel obok kolumny menu pokazuje to, na co gracz akurat patrzy. */
function opisTrybu(el){
  const box=el&&el.closest('.modes'); if(!box)return;
  box.setAttribute('data-opis',el.getAttribute('data-opis')||'');
  box.querySelectorAll('.modecard.patrze').forEach(x=>x.classList.remove('patrze'));
  el.classList.add('patrze');
}
function slepyLos(){
  const scenariusze=Object.keys(SCEN);
  const partie=PID.filter(k=>BASE[k]);
  const s=scenariusze[RI(0,scenariusze.length-1)];
  const p=partie[RI(0,partie.length-1)];
  SCENSEL=s; MODE='free'; SFX.click();
  modal('Ślepy los','Los wybrał za ciebie',
    `<p>Scenariusz: <b>${esc(SCEN[s].n)}</b><br>Partia: <b>${esc(BASE[p].n)}</b></p>
     <p class="dim" style="font-size:13px">${esc(BASE[p].blurb)}</p>`,
    [{l:'Biorę, co dali',s:'Zaczynam tą partią',f:()=>{close();start(p)}},
     {l:'Losuj jeszcze raz',s:'Inny scenariusz i inna partia',f:()=>{close();slepyLos()}},
     {l:'Wybiorę sam',s:'Przechodzę do listy partii',f:()=>{close();render()}}]);
}

function modeScreen(){
  const karta=(o)=>`
    <button class="modecard ${o.kl||''}" ${o.wyl?'disabled aria-disabled="true"':`onclick="${o.akcja}"`}
      onmouseenter="opisTrybu(this)" onfocus="opisTrybu(this)"
      data-opis="${esc((o.n||'')+String.fromCharCode(10,10)+String(o.d||'').replace(/<[^>]+>/g,'')+String.fromCharCode(10,10)+(o.stopka||''))}">
      <div class="mramka"></div>
      <div class="mikob">${iko(o.i)}</div>
      ${o.data?`<div class="mdata">${o.data}</div>`:''}
      <div class="mtag">${o.tag}</div>
      <h2>${o.n}</h2>
      <p>${o.d}</p>
      <div class="mfoot"><span>${o.stopka}</span><b>${o.akcjaN}</b></div>
    </button>`;

  app.innerHTML=`
  <div class="startekran">
  <button class="btn g sm" style="margin-bottom:14px" onclick="backToMenu()">← Wstecz</button>
  <!-- Ekran trybów jest podstroną, a nie drugim ekranem głównym. Wielki tytuł,
       godło i wizytówka serwera zostały w menu — tutaj jest tylko nagłówek
       mówiący, gdzie jesteś, i sama lista. -->
  <div class="podnag">
    <div class="kick">Nowa gra</div>
    <h2>Od czego zaczynasz</h2>
  </div>
  <!-- Układ menu wzięty z proporcji Victorii: kolumna przycisków 310x55 po lewej,
       odstęp 5 w grupie i 25 między grupami, a po prawej panel z opisem tego,
       na co akurat patrzysz. Same kafle zostają — zmienia się tylko to, jak stoją. -->
  <div class="modes">
    ${karta({i:'tut',akcja:"pickMode('tut')",tag:'dla nowych',n:'Samouczek',
      d:'Prowadzę cię krok po kroku przez pierwszą kadencję Stronnictwem Reisei: obecność w kanałach, kolejność decyzji, transfery, cele partyjne i wybory.',
      stopka:'ok. 10 minut',akcjaN:'Zaczynam →'})}
    ${karta({i:'free',akcja:"pickMode('free')",tag:'pełna gra',data:'1 sierpnia 2026',kl:'glowna',n:'Dzień dzisiejszy',
      d:'Serwer taki, jaki jest teraz: czternaście partii od największej po jednoosobową, rząd na swoim miejscu i wszystko do wzięcia.',
      stopka:'wszystkie partie i scenariusze',akcjaN:'Wybieram partię →'})}
    ${karta({i:'upad',wyl:1,kl:'wkrotce',tag:'scenariusz',data:'25 kwietnia 2025',n:'Upadek Republikanów',
      d:'Zaczynasz szesnaście miesięcy wcześniej, w tygodniu, w którym niebieski sztandar poszedł w dół, a jego ludzie rozeszli się po całym serwerze.',
      stopka:'w przygotowaniu',akcjaN:'Wkrótce'})}
    ${karta({i:'los',akcja:'slepyLos()',tag:'???',kl:'tajemna',n:'Losowo',
      d:'Nie wybierasz nic. Ani sceny, ani partii. Dowiadujesz się, kim grasz, dopiero kiedy siadasz do stołu.',
      stopka:'losowa scena i partia',akcjaN:'Rzucam →'})}
  </div>

  </div>`;
  /* Panel po prawej startuje od karty głównej. Ustawiamy go po klatce, bo
     przeglądarka potrafi w międzyczasie sama komuś nadać fokus i podmienić
     opis na przypadkowy kafel. */
  setTimeout(()=>{const dom=app.querySelector('.modes.v3 .modecard.glowna')
    ||app.querySelector('.modes.v3 .modecard');
    if(dom)opisTrybu(dom)},0);
  // „Co nowego” wyskakuje raz na wersję, przy pierwszym wejściu na ekran startowy
  if(patchDoPokazania())setTimeout(pokazPatch,240);
}
/* Autorzy gry. Wersja bierze się z pliku VERSION przy budowaniu wydania. */
const AUTORZY=['Maciek','Balon'];
/* Numer wpisuje tu build z pliku VERSION. Przy uruchamianiu ze źródeł, bez budowania,
   warstwa desktopowa podmienia go na prawdziwy — inaczej stopka pokazywałaby numer
   z ostatniego wydania i kłamała. */
let WERSJA='1.1.69';
function ustawWersje(v){
  if(typeof v==='string'&&/^\d+\.\d+\.\d+$/.test(v.trim())){WERSJA=v.trim();return true}
  return false;
}

/* ══════════ CO NOWEGO ══════════
   Zasada: każde wydanie dopisuje tu jeden wpis, krótko i po ludzku — co gracz
   zobaczy, a nie co zmieniło się w kodzie. Okno pokazuje się raz na wersję,
   przy pierwszym odpaleniu, i da się do niego wrócić z ekranu startowego. */
const PATCHNOTE={
 '1.1.56':{data:'6 sierpnia 2026', zmiany:[
   'PORZUCONA DECYZJA NIE ZOSTAJE NA STOLE TYGODNIA. Wpis szedl na stol w chwili odpalenia decyzji, takze tej z wlasnym oknem — a ta w tym momencie jeszcze niczego nie zrobila. Zamkniecie okna bez wyboru zostawialo kafel bez skutkow, czasem z liczbami z powietrza. Teraz decyzja okienkowa czeka i wchodzi na stol dopiero po kliknieciu tego ostatniego punktu, a rezygnacja zdejmuje ja calkiem.',
   'JEDNOSC NADAJA JUZ TYLKO TRZY DECYZJE: Spot wyborczy, Czystka w partii i Zjazd partii. Reszta gry przestala ja dosypywac po cichu.',
   'PASEK WLADZY NA DWA POZIOMY, jak w Victorii: gorny rzad to przyrosty tygodniowe na zielono — kapital, energia, zarobek przewodniczacego i momentum — a dolny to stan zasobow. Oba siedza w jednym zaokraglonym pancerzu z mosiezna obwodka, sztandar partii stoi po lewej jak flaga. Podpisy zeszly pod liczbami do podpowiedzi, wiec pasek zszedl ze 143 na 106 pikseli i nie zawija sie juz na trzy pietra.',
   'TLUSZCZOLT — nowa cecha wrodzona Macka. Kontrowersja +2,8 i pretensjonalnosc +2,2 tygodniowo, bo Maciek nie przechodzi obok zadnej awantury. Za to Krol Mordeczka trzyma z nim jak rowny z rownym: przychylnosc dworu +14, osobnym wierszem na liscie u Krola.',
   'PARTIA LIBERALNO-REPUBLIKANSKA NAZYWA SIE TERAZ CONCORDIA i ma nowe logo. Barwa poszla w mocniejszy fiolet.',
   'LICZNIK ODPALEN W LAUNCHERZE: ile razy gra zostala uruchomiona i na ilu komputerach. Nie wychodzi stamtad nic o graczu — zaden nick, adres ani nazwa komputera. Instalacja dostaje losowy numer, ktory nigdzie nie jest wysylany i sluzy tylko temu, zeby drugie odpalenie na tej samej maszynie nie doliczylo kolejnej osoby. Brak internetu oznacza tylko tyle, ze launcher pokaze ostatnia znana liczbe.',
 ]},

 '1.1.55':{data:'6 sierpnia 2026', zmiany:[
   'DZIAL PROGRAM USUNIETY. Trzy decyzje przestawiajace elektorat poszly razem z nim, ale wyciszenie sporu i zejscie na ziemie zostaja — bez nich z wysokiej kontrowersji i pretensjonalnosci nie dalo by sie zejsc w ogole, a paraliz przy 90 bylby slepa uliczka. Siedza teraz w Organizacji. Kategorii jest szesc zamiast siedmiu.',
   'ZADNA DECYZJA NIE NADAJE JUZ JEDNOSCI. Manifest, luzny stream, regeneracja lidera i kurs dla zaplecza po cichu ja dosypywaly — teraz zgoda w partii bierze sie wylacznie z tego, co dzieje sie wokol niej, a nie z klikania decyzji.',
   'Ostrzezenie o kontrowersji zniknelo ze skladu partii i zostalo w jednym miejscu, przy kondycji partii. Wczesniej ta sama czerwona ramka stala w dwoch dzialach naraz.',
   'NAZWY WYDAWNICTW DAJA SIE ZMIENIAC. Okno nazwy bylo od blokow wyborczych i wymagalo listy partii, wiec przy wydawnictwie wywracalo sie na pierwszym odwolaniu i nic sie nie otwieralo.',
   'Gazeta nie ma juz serduszek zanim wyda pierwszy numer — swiezy szyld nie ma czego lajkowac.',
   'Lista wydawnictw ustawia sie po bilansie: najbardziej dochodowe na wierzchu, deficytowe na dole. Ujemny bilans pokazuje sie wreszcie z minusem, a nie jak zysk.',
   'JEDNA REDAKCJA KAZDEGO RODZAJU: jedna gazeta, jedna telewizja, jedno kino. Trzy szyldy tego samego naraz to juz nie byl wybor, tylko lista zakupow. W sklepie widac wprost, co juz masz.',
   'Boty siegaja po media wyraznie czesciej i przy mniejszym zapasie w kieszeni.',
   'Podpowiedz kapitalu prywatnego miesci sie w swojej ramce — dlugie nazwy i zdania wychodzily poza prostokat. Przy prawej krawedzi okna odsuwa sie do srodka, a kwoty w niej maja mordedolara.',
 ]},

 '1.1.54':{data:'6 sierpnia 2026', zmiany:[
   'GOSPODARKA WESZLA DO POLITYKI. Media byly zamknieta petla obok gry: kupowales je za prywatne pieniadze, zarabialy prywatne pieniadze i nic z tego nie wracalo do rdzenia. Teraz zasieg wydawnictw wchodzi WPROST DO SONDAZU — kto ma gazete, antene i ekran, ten dociera do ludzi takze wtedy, gdy nie zrobil w tygodniu nic innego. Zasieg liczy sie tylko z wydawnictw, ktore realnie cos wydaja, i wygasa sam, wiec media trzeba karmic, a nie kupic raz i zapomniec.',
   'DA SIE PRZEGRAC PRZEZ GOSPODARKE. Kieszen przewodniczacego moze zejsc pod kreske, a wtedy dlug rosnie sam o dziewiec procent tygodniowo, co tydzien zabiera wiarygodnosc i jednosc oraz podbija kontrowersje. Po trzech tygodniach pod kreska komornik zabiera wydawnictwa, jedno po drugim, zaczynajac od najdrozszego — z licytacji wraca niecala polowa. Do tego kazdy szyld ma koszty stale, wiec media, z ktorych nic nie wychodzi, po prostu topia pieniadze.',
   'BOTY GRAJA W GOSPODARKE. Partie prowadzone przez komputer zakladaja teraz wlasne wydawnictwa, kiedy je na to stac, i regularnie z nich wydaja — wiec ich zasieg tez wchodzi do sondazu. Twoja przewaga przestala rosnac sama z tego, ze nikt inny nawet nie probuje.',
   'SLAWA PRZESTALA BYC WALUTA WSZYSTKIEGO. Kazdy system ciagnie teraz z czego innego: serduszka gazety z WIARYGODNOSCI i kompetencji redaktora, widownia telewizji z AKTYWNOSCI i charyzmy prowadzacego, kino nadal ze slawy, a zarobek przewodniczacego z AUTORYTETU i mandatow. Optymalna gra przestala sie sprowadzac do podbijania jednego suwaka.',
   'DECYZJE GOSPODARCZE NIE ZJADAJA JUZ AKCJI. Zarobek i zrzutka to prywatne sprawy przewodniczacego, wiec kosztuja zero akcji, za to sporo energii. Nowe systemy przestaly konkurowac z polityka o te same trzydziesci szesc ruchow na kadencje.',
   'SAD ZSZEDL POD SEJM jako karta. Trzynascie dzialow na trzy akcje w tygodniu to bylo za duzo — teraz jest ich dziesiec.',
   'NAGRANIE MA TRZY TRYBY, losowane za kazdym razem: Uwaga widowni z oczkami wznoszacymi sie od dolu, Trema z gestymi oczkami gasnacymi blyskawicznie i Potok pytan, w ktorym oczka przelatuja z boku na bok. Jedno klikanie w kolko przestalo byc jedynym, co tam jest.',
 ]},

 '1.1.53':{data:'6 sierpnia 2026', zmiany:[
   'DZIAL MEDIA WIDAC ZAWSZE, nad Sadem. Bez ustawy o mediach po prostu nic sie w nim nie otworzy — zamiast znikac z nawigacji bez slowa, stoi z etykieta „zamk." i tlumaczy, czego brakuje.',
   'GAZETA TO SZYLD, A NIE JEDNA GAZETA. Pod jednym wydawnictwem wychodza kolejne numery, co dwa tygodnie, i kazdy zbiera tyle serduszek, na ile stac twoja slawe, kompetencje redaktora i staz szyldu. Od dziesieciu numer wychodzi na swoje, ponizej dokladasz do niego z kieszeni.',
   'WIDOWNIA ZESZLA NA ZIEMIE. Odcinek ogladalo dziewiecset osob przy serwerze liczacym szescset siedemdziesiat — teraz przed ekranem siada dwadziescia kilka osob, a przy filmie dwadziescia do czterdziestu. Za to kazdy widz jest sporo wart, wiec pieniadze wychodza podobne, tylko liczby wreszcie znacza to, co powinny.',
   'Telewizja i kino maja przerwe tygodniowa, gazeta dwutygodniowa — przy kazdym wydawnictwie widac wprost, ile jeszcze zostalo do nastepnego wydania.',
   'Przy kazdym wydawnictwie widac tez, ile numerow albo wydan juz z niego wyszlo.',
 ]},

 '1.1.52':{data:'6 sierpnia 2026', zmiany:[
   'MAJATEK ROSNIE REGRESYWNIE I O TO CHODZILO. Wszyscy mieli te sama stawke tygodniowa, wiec pol procenta od dwustu milionow dawalo wiecej niz ktos z tysiacami widzial przez cala kadencje — przepasc poglebiala sie sama i z dolu nikt nie ruszal z miejsca. Teraz szescdziesiat tysiecy rosnie po jakies szesc procent tygodniowo, dziesiec milionow po jeden, a cwierc miliarda po dwie dziesiate. Przez kadencje mentos urosl o 119%, kenzo o 5%.',
   'RZAD FIRMUJE WLASNE USTAWY. Zglaszales projekt jako premier i patrzyles, jak twoi wlasni koalicjanci wstrzymuja sie albo glosuja przeciw, mimo ze umowa stala. Teraz koalicja przy dobrych relacjach glosuje za jak jeden maz, przy chlodnych czesc sie wstrzymuje, a dopiero zepsute relacje albo projekt szyty grubo pod siebie zwalniaja z dyscypliny.',
   'MINIGRA PRZENIESIONA TAM, GDZIE MIALA BYC: do wykladow i reportazy z ustawy o MAN, nie do wywiadu. Zamiast zbierania pieniedzy sa oczka uwagi, ktore trzeba klikac, zanim zgasna, i liczy sie sama celnosc. Nagroda jest w slawie i umiarkowana — to przyprawa do ustawy, a nie sposob na granie w kolko.',
   'NOWY DZIAL MEDIA, otwierany ustawa o mediach. Bez niej nikt na serwerze nie ma prawa niczego wydawac. Wszystko kupuje sie za prywatny majatek przewodniczacego — i to jest to, na co sie go zbiera.',
   'WYDAWNICTWO GAZETOWE za 500 tysiecy: zyje samo i zarabia na serduszkach. Od dziesieciu wychodzi na plus, powyzej zaczyna zarabiac, a serduszek przybywa razem ze slawa partii i kompetencja redaktora. Gazete mozna nazwac i obsadzic kims ze swojego zaplecza.',
   'WYDAWNICTWO TELEWIZYJNE za 10 milionow: nagrywasz odcinki i sam wybierasz, o czym mowisz — filozoficznie, politycznie albo smieciowo. Widownia zalezy od tego, do kogo trafia temat i jak stoi twoje dopasowanie do grup, a wplyw idzie wprost od liczby widzow.',
   'WYDAWNICTWO KINOWE za 20 milionow: kręcisz filmy, a na seanse przychodzi tym wiecej ludzi, im glosniej o twojej partii. Bilans kazdego wydawnictwa liczy sie osobno i widac go na wspolnej liscie.',
 ]},

 '1.1.51':{data:'6 sierpnia 2026', zmiany:[
   'RANGI DZIALAJA ODWROTNIE NIZ DOTAD I TAK, JAK POWINNY. Wejscie na kazdy stopien kosztowalo caly prog, wiec na starcie polowa bogaczy wykupywala sie na wyzsze polki naraz — z gospodarki znikaly setki milionow, PKB lecialo w dol, a premier obrywal absolutorium za cos, na co nie mial wplywu. Teraz Sir to szesc procent progu, a Elektor szescdziesiat, i do tego trzeba miec siedemdziesiat procent wiecej, niz wynosi jego kamien milowy. Nizsze rangi wpadaja same, wyzsze bola coraz mocniej. Kapital prywatny znowu rosnie zamiast wyparowywac.',
   'ABSOLUTORIUM W DWUNASTYM TYGODNIU, jako porzadna tabela: PKB na starcie kadencji, PKB na koniec, zmiana procentowa i wypisane co do jednego, co z tego wynika dla premiera. W ostatnim tygodniu nie wyskakuje juz zadne wydarzenie — rozliczenie z gospodarki ma byc jedyna rzecza, na ktora patrzysz.',
   'WEJSCIE NA ZYWO W WYWIADZIE. Po pytaniach idzie trzydziesci sekund transmisji: przez ekran przelatuja widzowie, ktorych trzeba lapac, zanim uciekna. Ogladalnosc mnozy to, co wyszlo z rozmowy — dobra odpowiedz przy pustej widowni wazy mniej niz srednia przy pelnej sali. Im dalej w transmisje, tym gescej i szybciej.',
   'USTAWA O ORDYNACJI NIE RUSZA JUZ MANDATOW. Zmiana wielkosci sejmu w srodku kadencji rozdawala mandaty od nowa i rozjezdzala wszystko, co liczy sie od stalej wielkosci izby. Zostal sam prog wyborczy.',
   'PRZEKUPIENIE KROLA WYRAZNIE PODROZALO: punkt przychylnosci kosztuje teraz szesnascie kapitalu zamiast siedmiu. Desygnacja przestala byc kwestia zbierania kasy.',
   'NOWA ZAKLADKA SAD, na razie jako podglad. Sklad sadu administracyjnego bierze sie wprost z ustawy o sadach: bez niej sadu nie ma, a sedziow obsadza resort Sprawiedliwosci, wiec kto go trzyma, ten ustawia lawe. Sprawy, odwolania i wyroki dopiero powstaja — dzial stoi z etykieta wip, zeby bylo jasne, ze liczby sa prawdziwe, a mechaniki jeszcze nie ma.',
 ]},

 '1.1.50':{data:'5 sierpnia 2026', zmiany:[
   'STOPNIE RANG. Majatek prywatny ma teraz kamienie milowe: od Sira za milion, przez Barona, Magnata i Ksiecia, az po Elektora za miliard. Przekroczenie progu kosztuje dokladnie tyle, ile ten prog wynosi — placisz wpisowe — ale od tej pory zarabiasz o osiemnascie procent wiecej za kazdy stopien. Kto wchodzi do gry z gotowym majatkiem, ma rangi nadane i nie placi za nie nic: loof ze 150 mln jest Ksieciem i zbiera na Wielkiego Ksiecia, a mentos z 59 tysiacami nie ma zadnej i idzie na Sira. Najwyzsza ranga stoi pod portretem, tam gdzie kapital prywatny.',
   'NOWA DECYZJA: ZAROB KAPITAL PRYWATNY (Organizacja). Przewodniczacy odpuszcza polityke na tydzien i zajmuje sie wlasnym interesem. Partia nie dostaje z tego nic — ani slawy, ani jednosci — za to w kieszeni robi sie grubiej. Rozrzut jest szeroki, wiec raz wyjdzie 700 tysiecy, a raz trzynascie milionow.',
   'WIEC W KANALE PRZESTAL DAWAC JEDNOSC. Buduje obecnosc i slawe, a od zgody w partii jest co innego.',
   'Wybor tematu wiecu nie podpowiada juz, co jest przyzwoite, a co zle. Sklad kanalu stoi wyzej w oknie i wniosek trzeba wyciagnac samemu — gotowa etykietka zamieniala decyzje w czytanie odpowiedzi.',
   'USTAWA O KANALACH USUNIETA. Przewracala cala mape wyborcza w srodku kadencji, przez co obecnosc budowana przez pol kadencji tracila sens, a przy okazji sypaly sie rzeczy liczone od stalej liczby okregow. Wiecej z tego bylo awarii niz rozgrywki.',
   'WYKRES PKB POKAZUJE SIE OD PIERWSZEGO TYGODNIA. Wczesniej potrzebowal dwoch odczytow, wiec przy pierwszym wejsciu w Ekonomie bylo tam samo zdanie o tym, ze wykresu jeszcze nie ma.',
   'Poparcie rzadu weszlo do czynnikow mnoznika PKB. Rzad z dobrym poparciem podnosi obrot, brak rzadu go dusi.',
   'ABSOLUTORIUM. Na koniec kadencji premier odpowiada za gospodarke. Jesli PKB przez kadencje spadlo, sejm nie udziela absolutorium: wiarygodnosc, slawa, jednosc i aktywnosc ida w dol, kontrowersja w gore, a poparcie rzadu siada. Kara rosnie z glebokoscia spadku, ale nie przewraca rzadu — zla gospodarka ma bolec, nie konczyc rozgrywke.',
   'Kropki lukow kadencji przestaly wchodzic na podpowiedzi rozwijane z paska wladzy.',
 ]},

 '1.1.49':{data:'5 sierpnia 2026', zmiany:[
   'RZAD DESYGNUJE WRESZCIE SWOJEGO PREMIERA. W pierwszej rundzie kandydata brano z calej izby wedlug przychylnosci Krola i — co gorsza — od razu nadpisywano nim premiera koalicji. Stad trzy dziwactwa naraz: rzad zglaszal kogos spoza siebie, gubil wlasnego kandydata, a potem karnie glosowal za obcym, bo dyscyplina koalicyjna patrzy wlasnie na premiera rzadu. Teraz pierwsza desygnacja nalezy do koalicji, a Krol wchodzi dopiero wtedy, gdy rzadu nie ma.',
   'PRZEWODNICZACY ZARABIA. Co tydzien wplywa mu prywatny majatek: tym wiecej, im wieksza slawa, autorytet, liczba mandatow i urzedy. Premier obraca cudzymi pieniedzmi i czesc z tego zostaje przy nim. Kontrowersja dziala odwrotnie — nikt nie robi interesow z kims, kto co tydzien jest w awanturze.',
   'KAPITAL PRYWATNY W PASKU WLADZY, obok akcji, kapitalu i mandatow, ze znakiem mordedolara. Pod kursorem rozpisuje sie na kieszenie zaplecza i pokazuje tygodniowy zarobek przewodniczacego.',
   'USTAWA O UTWORZENIU EVENTU. Sejm powoluje event, a placi za niego przewodniczacy z wlasnej kieszeni: teleturniej telewizyjny za 38 mln, event o grze komputerowej za 19 mln albo event o przemowie za 7 mln. Kazdy daje co innego — teleturniej slawe i obecnosc wszedzie, gra serwerowiczow i awanture o zasady, przemowa wiarygodnosc i jednosc.',
   'USTAWA O MAN ORGANIZUJE. Do stopni i tytulow doszedl wybor, co Akademia robi na otwarcie: wyklad o intelektualnych zagwozdkach za 26 mln (elita zachwycona), reportaz o serwerze za 14 mln (po rowno slawa i wiarygodnosc) albo wyklad o smieciach za 5 mln (tanio i bez pretensji). Obie ustawy zglasza premier albo minister od wlasciwego resortu.',
   'Koszt schodzi z prywatnego majatku dopiero wtedy, gdy sejm ustawe uchwali — przepadly projekt nie kosztuje ani grosza.',
   'MNOZNIK OBROTU JEST WYMAGAJACY. Stabilnosc wychodzi na plus dopiero ponizej 40 kontrowersji, a inwestycje dopiero powyzej 50 aktywnosci. Wczesniej oba progi stały tam, gdzie serwer stoi sam z siebie, wiec wszystko bylo na plusie bez wysilku. „Zaufanie przedsiebiorcow" nazywa sie teraz po ludzku: zadowolenie ludzi.',
   'WYKRES PKB w dziale Ekonomia: ostatnie dwadziescia cztery tygodnie, zielony przy wzroscie, czerwony przy spadku, z odczytem zmiany procentowej.',
   'GLOSOWANIA NAD USTAWAMI WYGLADAJA JAK ROZSTRZYGNIECIE, a nie jak wiersz tekstu. Werdykt to pieczec ze znakiem przybitym w plakietce, obok trzy liczby w tabliczkach, a przy przegranej widac wprost, ilu glosow zabraklo do progu. Kazda partia dostala listwe w barwie swojego glosu.',
 ]},

 '1.1.48':{data:'5 sierpnia 2026', zmiany:[
   'MORDEDOLAR NA SWOIM MIEJSCU. Sakiewka z monetami stoi teraz przy kazdej kwocie w grze: przy PKB, przy kapitale prywatnym i pod portretami w zapleczach. Rysowany zapas przestal byc potrzebny.',
   'Obrazek zostal przyciety do samej sakiewki i przeskalowany, bo w oryginale wiekszosc pliku to byl pusty margines — w ikonie na dwanascie pikseli sakiewka bylaby ziarnkiem w rogu.',
 ]},

 '1.1.47':{data:'5 sierpnia 2026', zmiany:[
   'WYWIADY ZA DARMO W KOLKO — KONIEC. Decyzja z wlasnym oknem jest oplacona z gory, a zapis o tej oplacie sluzy do jej cofniecia. Wywiad, nabor i uklad sterow nie kasowaly go po zakonczeniu, wiec zapis przechodzil na nastepne decyzje: pierwsze „wstecz" w dowolnym kolejnym oknie oddawalo pieniadze za tamta i zdejmowalo jej limit.',
   'PORZUCONA DECYZJA NIE LICZY SIE JUZ JAKO ZUZYTA. Zamkniecie okna w inny sposob niz przyciskiem „wstecz" zostawialo decyzje policzona, choc nic z niej nie wyszlo. Teraz gra sama to rozpoznaje: nie ma okna, a oplata wisi — znaczy, ze decyzja nie doszla do skutku, wiec wraca w calosci razem z akcja i limitem.',
   'PKB LICZY SIE Z MAJATKU: suma prywatnych kont razy mnoznik obrotu. Dlatego konta stoja w milionach, a PKB w miliardach, i wszystko, co rusza majatkiem, widac od razu.',
   'Mnoznik obrotu nie jest staly. Skladaja sie na niego kompetencja ministra finansow, kompetencja premiera, stabilnosc, inwestycje i zaufanie przedsiebiorcow — wszystkie pieć widac wypisane w dziale Ekonomia razem z tym, ile kazdy dodaje.',
   'KAPITAL PRYWATNY ZYJE. Rosnie sam z siebie, a podatek ten wzrost zjada i przy wysokiej stawce wychodzi juz pod kreska. Podatek daje pieniadze teraz, ale zabiera i majatek, i zaufanie, wiec PKB zwalnia z dwoch stron naraz — nie ma jednej najlepszej stawki.',
   'MAJATKI ROZDANE PO NAZWISKACH, a nie z automatu. Bartek, Tortex i loof maja po 150–230 mln i sami robia ponad polowe majatku serwera. kenzo, Supernes, Mnem i Aryati maja wiecej niz niejeden lider. Kromka, Kaziu, Sulejman czy impir siedza na kilku milionach mimo przewodnictwa. Bezpartyjni maja tysiace, wiec po zwerbowaniu od razu widac, ze nic nie wnosza.',
   'NOWA DECYZJA: ZRZUTKA Z PRYWATNYCH KIESZENI (Organizacja). Milion prywatnego majatku to jeden punkt kapitalu partii. Kto wylozy, ten odchodzi z partii, a jednosc siada tym mocniej, im grubszy portfel wydoisz. Przewodniczacego nie ruszysz. AI siega po to samo, ale tylko gdy ma kase pod kreska.',
   'USTAWA O PODATKACH ROBI JUZ TYLKO JEDNA RZECZ. Wczesniej pod jedna nazwa skubala kapital partii, osobno majatki prywatne i jeszcze przestawiala progresje skladek — nie dalo sie wyczytac, co robi jeden suwak. Zostal podatek od prywatnych majatkow, ktory napelnia skarb i przez majatki rusza PKB.',
   'Panel ekonomii nie ma juz zadnych przyciskow podatkowych — podatki ustawia sie wylacznie ustawa.',
 ]},

 '1.1.46':{data:'5 sierpnia 2026', zmiany:[
   'DECYZJE PRZESTALY ODPALAC SIE SAME. Podglad skutkow gral prawdziwa decyzje dziewiec razy na kopii stanu, zeby pokazac widelki. Decyzje takie jak nabor, wywiad czy uklad sterow nie licza niczego same — otwieraja wlasne okno. Podglad naprawde je otwieral, a ze jego pamiec kasuje sie co tydzien, na starcie kazdego tygodnia sypalo oknami. Teraz podglad nie otwiera niczego, nie gra dzwiekami i nie sypie konfetti.',
   'Przy decyzjach, ktorych skutek rozstrzyga sie dopiero w oknie, podglad mowi to wprost zamiast milczec jak przy decyzji bez skutkow.',
   'PKB DZIALA. To roczny obrot calego serwera, wiec stoi w miliardach, i rusza sie co tydzien: aktywne partie napedzaja wzrost, awantury go dusza, a podatek od majatku hamuje go i jednoczesnie napelnia skarb.',
   'PODATKI SIEDZA W USTAWIE, NIE W ZAKLADCE. Ustawa o podatkach realnie strzyze prywatne konta i przesuwa PKB. Przy progresji place glownie bogaci — czyli ci sami, ktorzy siedza w sejmie i maja to przeglosowac. Bez progresji stawka jest rowna, wiec procentowo najciezej wychodzi najubozszym, ktorych jest najwiecej przy urnach.',
   'Kapital prywatny rozjechal sie tak, jak powinien: przewodniczacy obracaja milionami, dalekie zaplecze tysiacami, a bezpartyjni grosikami. Rozpietosc siega trzech tysiecy razy.',
   'WYWIAD OD NOWA. Zamiast trzech pytan z jednym wlasciwym tonem masz cztery losowane z puli, kazde z wlasnym naciskiem. Pod pytaniem z nozem przechwalki nie przejda nikomu, przy lekkim odbiciu pokora brzmi jak brak pomyslu. Licza sie dwie rzeczy naraz, dziennikarz i widownia, i chca czego innego. Do tego kregoslup: kto trzyma jedna linie, dostaje premie, kto skacze miedzy rejestrami, traci wiarygodnosc.',
   'Wywiad wyglada teraz jak studio: portret pod swiatlem, dwa wskazniki, ktore ruszaja sie po kazdej odpowiedzi, pytanie postawione jak cytat i reakcja dziennikarza od razu po odpowiedzi.',
 ]},

 '1.1.45':{data:'5 sierpnia 2026', zmiany:[
   'NOWY DZIAL: EKONOMIA — i od razu mowi o sobie, ze jest NIEDOKONCZONY. Widac PKB serwera i kapital prywatny kazdej osoby z zaplecz, ale nic z tego jeszcze nie dziala: PKB stoi w miejscu, nikt nie zarabia, nikt nie traci, a przyciski ustawy podatkowej sa wylaczone. Dzial jest po to, zeby zobaczyc liczby i dopiero na nich zdecydowac, jak ma dzialac.',
   'KAPITAL PRYWATNY POD PORTRETAMI. Kazdy z zaplecza ma wlasny majatek, osobny od kapitalu partii, widoczny pod avatarem w zakladce Partie i we wlasnym zapleczu. Rozrzut jest ostry celowo: garstka bogatych i duzo biednych, bo na tym ma stac spor, kogo opodatkowac.',
   'Znak mordedolara jest na razie zastepczy — czeka na wlasciwa emotke.',
 ]},

 '1.1.44':{data:'5 sierpnia 2026', zmiany:[
   'KREATOR SCENARIUSZY WRESZCIE SIE OTWIERA. Kafel na ekranie startowym nie robil nic: kreator pytal o partie tak, jakby jakas gra juz stala, a stal przed nia, wiec leciał na pustym miejscu i ekran nie wchodzil. Bral teraz liste partii ze stalej tablicy, tak jak robia to herby. Bylo zepsute od czasu, kiedy kreator trafil na ekran startowy.',
   'PREZYDIUM SEJMU I WYBOR PREMIERA na plytach: sztandar z tabliczkami, tresc na plycie i przyklejona stopka z przyciskiem. Wybor premiera mial gesty akapit z czterema liczbami — teraz stoja w tabliczkach: ile glosow do wiekszosci, ile mandatow w sejmie, ktora tura i jaka presja na poslow.',
   'WYBORY PREZYDENCKIE w calosci: wystawienie kandydata, noc, dogrywka i final. Caly ciag od dnia wyborow do zaprzysiezenia mowi teraz jednym jezykiem.',
   'EKRAN KONCA GRY dostal sztandar i tabliczki: ile kadencji, ktory tydzien, ilu ludzi zostalo i jaki dorobek.',
 ]},

 '1.1.43':{data:'5 sierpnia 2026', zmiany:[
   'NOC PREZYDENCKA tym samym jezykiem co wyborcza: sztandar z tabliczkami, rzad komisji, palac czekajacy na zwyciezce i tory kandydatow jako osadzone plytki. Meta 50% to teraz mosiezna kreska, a nie szara linijka.',
   'Portrety kandydatow przestaly mrugac. Ranking zmienia sie co klatke liczenia i razem z nim przestawiala sie cala lista, wiec awatar co chwile wczytywal sie od nowa. Teraz tor kandydata stoi w miejscu, a przesuwa go tylko kolejnosc — wynik widac lepiej, bo wiersze realnie jada w gore i w dol.',
   'RAPORT KADENCJI WRACA NA EKRAN WYNIKOW. Ocena literowa calej kadencji z szesciu obszarow byla napisana w grze od dawna, ale zaden ekran jej nie pokazywal. Teraz stoi pod wynikiem jako pieczec, a obszary jako plytki. Od drugiej kadencji, bo polowa pol to zmiana wzgledem poprzedniej.',
   'DZIEN WYBOROW dostal ten sam sztandar, a progi list stoja w tabliczkach zamiast w akapicie. Cala sciezka wyborcza — dzien, noc, wyniki — czyta sie teraz jako jedno.',
 ]},

 '1.1.42':{data:'5 sierpnia 2026', zmiany:[
   'NOC WYBORCZA OD NOWA. Byla tabelka na karcie. Teraz to studio: sztandar z tabliczkami, ktore rosna w trakcie liczenia, rzad komisji zapalajacych sie barwa swojej listy i cokol zwyciezcy, ktory stoi pusty od pierwszej sekundy i czeka, az ktos go zajmie. Kazda lista to osadzona plytka ze swiecaca listwa w swoim kolorze, a mandaty stoja w zlotej tabliczce.',
   'Na pasku poparcia widac wreszcie prog tej listy. Od razu wiadomo, kto siadl tuz pod kreska, a kto ja przeskoczyl — listy, ktore nie weszly, sa wygaszone.',
   'Nowy wynik naprawde wjezdza na ekran. Wczesniej animacja szla na zly wiersz: nowa lista podmieniala sie po cichu, a od nowa rozjezdzal sie pasek tej najslabszej, pokazanej dawno temu.',
   'EKRAN WYNIKOW tym samym jezykiem, wiec czyta sie dalej jak ciag tej samej nocy: ta sama plyta z mosiezna listwa, ten sam rzad tabliczek. Slupki sa teraz osadzone w plycie i swieca, twoja kolumna dostala zlota plinte, a rozliczenie kadencji te same plytki co wiersze nocy.',
   'Przycisk zamykajacy oba ekrany przykleja sie do dolu okna, wiec nie trzeba do niego przewijac.',
 ]},

 '1.1.41':{data:'5 sierpnia 2026', zmiany:[
   'OKNA I MODALE w tym samym jezyku: mosiezna listwa u gory, okucie w rogu, naglowek szeryfowy. Opcje do wyboru wygladaja teraz na plytki, ktore sie naciska, a nie na wiersze listy — pod kursorem odjezdzaja w bok i swieca zlotem.',
   'Krzyzyk zamykajacy obraca sie pod kursorem.',
 ]},

 '1.1.40':{data:'5 sierpnia 2026', zmiany:[
   'KARTY W CALEJ GRZE jako plyty, tym samym jezykiem co ekrany startowe: krawedz swiatla u gory, listwa w barwie dzialu pod naglowkiem i okucie w rogu, ktore zapala sie pod kursorem. Jedna zmiana przeszla naraz na Sejm, Sondaz, Partie, Lidera i Cele.',
 ]},

 '1.1.39':{data:'5 sierpnia 2026', zmiany:[
   'Liczby nad wyborem partii siedza wreszcie w tabliczkach. Poprzednie wydanie mialo ten styl napisany na zla klase, wiec nie mial czego zlapac i rzad liczb zostal plaski.',
 ]},

 '1.1.38':{data:'5 sierpnia 2026', zmiany:[
   'EKRAN WYBORU PARTII w tym samym jezyku co ekran trybow. Karta partii jest teraz osadzona plyta z mosiezna listwa u gory i okuciem w rogu, liczby nad nia stoja w tabliczkach, a kafle partii unosza sie pod kursorem i swieca barwa swojego ugrupowania.',
   'Wybrana partia dostaje okucie w rogu, dokladnie takie jak karta trybu, wiec oba ekrany mowia tym samym.',
 ]},

 '1.1.37':{data:'5 sierpnia 2026', zmiany:[
   'EKRAN TRYBOW OD NOWA. Byly trzy plaskie prostokaty na czarnym tle. Teraz ekran jest zbudowany z plyt jak w grach Paradoxu: sztandar z mosiezna listwa, liczby w osadzonych tabliczkach, karty z okuciami w rogach i ikonami w plakietkach.',
   'TRZY NOWE KARTY. Kreator scenariuszy i Wczytaj scenariusz weszly prosto na ekran startowy, wiec nie trzeba ich juz szukac. Doszedl tez Slepy los: gra sama dobiera scenariusz i partie, a dowiadujesz sie, kim grasz, dopiero po starcie.',
   'Launcher przestal zajmowac sie scenariuszami — robi tylko to, do czego jest: odpala gre i ja aktualizuje.',
 ]},

 '1.1.36':{data:'5 sierpnia 2026', zmiany:[
   'NOWY KREATOR SCENARIUSZY. Byl ciasnym oknem z kilkunastoma suwakami, po ktorym nie dalo sie poznac, co wlasciwie powstaje. Teraz to pelny ekran: ustawienia w sekcjach po lewej, a po prawej stale widoczny opis tego, co scenariusz naprawde zrobi na starcie.',
   'SCENARIUSZ JAKO PLIK. Zapisujesz go jako plik .mmscen i wysylasz komu chcesz. Na liscie scenariuszy jest przycisk Wczytaj z pliku, ktory stawia cudzy scenariusz obok wbudowanych.',
   'Naprawione: zmiana skladu partii dzialala odwrotnie. Scenariusz ustawiony na partie mniejsze o 30% robil je o 30% wiekszymi. Przy powiekszaniu ludzie biora sie teraz z puli bezpartyjnych, a nie znikad.',
   'Suwak, ktory ruszyles, jest podswietlony, wiec widac, co zmieniles wzgledem zwyklej gry.',
 ]},

 '1.1.35':{data:'5 sierpnia 2026', zmiany:[
   'KONIEC PRZEBUDOWYWANIA EKRANU. Gra po kazdej decyzji niszczyla caly ekran i tworzyla go od nowa. Teraz ekran jest zszywany: porownanie wezel po wezle zostawia nietkniete wszystko, co sie nie zmienilo.',
   'Dzieki temu paski cech dojezdzaja plynnie zamiast przeskakiwac, przewijanie zostaje tam, gdzie bylo, herby i awatary nie mrugaja przy kazdym kliknieciu, a odczyt, ktory sie wlasnie zmienil, mruga zlotem.',
   'Pole tekstowe, w ktorym wlasnie piszesz, nie kasuje sie w trakcie rysowania.',
   'Zszywanie objelo wszystkie dwadziescia trzy miejsca, w ktorych gra rysuje ekran, bez zmiany ani jednego z nich: przechwycone jest samo przypisanie tresci.',
 ]},

 '1.1.34':{data:'5 sierpnia 2026', zmiany:[
   'PODGLAD SKUTKOW. Najedz kursorem na decyzje, a paski cech w bocznej kolumnie pokaza ducha: zakreskowany odcinek mowi, dokad pojedzie kazda cecha, a przy liczbie staja widelki w rodzaju 62 +5...+8. Przestales klikac w ciemno.',
   'Widelki, a nie jedna liczba, bo skutki sa losowe z zalozenia. Gra odpala prawdziwa decyzje dziewiec razy na kopii stanu i pokazuje rozrzut, jaki z tego wyszedl. Zaden wynik nie jest zmyslony ani wpisany recznie, wiec podglad nie rozjedzie sie z gra.',
   'KRESKA RYWALA. Przy kazdym pasku stoi pionowa kreska z nazwa najlepszej partii w tej cesze, a obok twojej liczby miejsce w stawce. Samo 62 nigdy nie mowilo, czy to duzo.',
   'Przy kontrowersji i pretensjonalnosci najlepszy znaczy najnizszy, bo tam wygrywa ten, kto ma najmniej.',
 ]},

 '1.1.33':{data:'5 sierpnia 2026', zmiany:[
   'STOL TYGODNIA. Nad decyzjami stoi teraz stol z miejscami na twoje ruchy. Puste zapraszaja, zajete zostaja jako zapis tego, co zagrales, razem z liczbami, ktore ta decyzja naprawde dala. Wczesniej po zagraniu nie bylo po niej sladu poza wpisem w kronice.',
   'Decyzja za dwa albo trzy ruchy zajmuje na stole tyle miejsc, ile kosztuje, wiec od razu widac, ile tygodnia zjada.',
   'LUK KADENCJI. Nad zakladkami biegnie os dwunastu tygodni: przebyte wygaszone, biezacy duzy i zloty, na koncu odliczanie do wyborow, ktore czerwienieje na dwa tygodnie przed urna. Dwunasty tydzien przestal wygladac dokladnie jak drugi.',
 ]},

 '1.1.32':{data:'5 sierpnia 2026', zmiany:[
   'PRZEBUDOWA UKLADU. Nawigacja zeszla z gory na lewa szyne i zostaje na miejscu przy przewijaniu, tak jak w klientach gier. Gra przestala czytac sie jak strona internetowa z paskiem i menu.',
   'Tresc dostala cala wysokosc okna i sporo szerokosci: decyzje mieszcza sie teraz w trzech kolumnach zamiast dwoch, a wybrany dzial widac non stop zamiast szukac go w rzedzie kilkunastu zakladek.',
   'Pasek zasobow jest osobnym panelem z zaokraglona rama, a nie kanapka miedzy tytulem a menu.',
   'Na waskim oknie szyna sama wraca na gore, wiec nic sie nie zwezi do niczytelnosci.',
 ]},

 '1.1.31':{data:'5 sierpnia 2026', zmiany:[
   'Sejm zastany poprawiony: PPP ma szesc mandatow zamiast siedmiu, Kongres Koronny trzy zamiast czterech. Ludzie odeszli, a mandaty przejeli sasiedzi z tego samego obozu, wiec izba dalej ma rowno 40, a rzad kisielka48 26.',
   'Koalicjanci maja wreszcie dyscypline. Gdy Krol desygnuje premiera spoza twojej koalicji, twoi partnerzy glosuja przeciw; gdy kandydat jest z koalicji, popieraja go i dopiero wtedy da sie ich przekupic. Wczesniej glosowali za kazdym.',
   'Republike moga odbudowac tylko partie republikanskie: PPP, PLR, PKD, NBR i DPD. Warunek dostepu odsiewal wczesniej wylacznie DPD, wiec cel otwieral sie kazdemu, lacznie z monarchistami.',
   'Tydzien bez ruchu nie odpala sie juz po zagraniu decyzji, ktora zwraca akcje. Liczy sie fakt zagrania czegokolwiek, a nie stan licznika akcji. Komunikat mowi teraz, ile dokladnie kosztuje bezczynnosc.',
   'Transfery bezpartyjnych: dwa na kadencje zamiast jednego na tydzien. Wolna pula znikala do konca pierwszej kadencji, teraz starcza na cala gre i nikt nie wykupi wszystkich.',
 ]},

 '1.1.30':{data:'5 sierpnia 2026', zmiany:[
   'Ekran startowy: zza tytulu bije cieple swiatlo, liczby serwera sa duze i zlote, a karty trybow wyraznie leza nad tlem i mocniej reaguja na kursor.',
   'Cechy przewodniczacego: poprawione obciecie podpisu AUTORYTET.',
 ]},

 '1.1.29':{data:'5 sierpnia 2026', zmiany:[
   'Nowa paleta calej gry. Tlo zeszlo glebiej, a panele poszly w gore, wiec karty wreszcie wygladaja jak karty lezace na czyms, a nie jak plamy w tym samym kolorze co tlo.',
   'Sala obrad dostala atmosfere: cieple swiatlo znad mownicy, przyciemnione brzegi i delikatne ziarno jak na transmisji z obrad.',
   'Pasek u gory to teraz pulpit: odczyty rozdzielone kreskami, zlote liczby, barwa twojej partii biegnie przez cala dolna krawedz.',
   'Zakladki maja plynny wskaznik, a przy zmianie widoku karty wjezdzaja po kolei. Animacja odpala sie tylko przy zmianie zakladki, wiec klikanie decyzji niczym nie miga.',
   'Lawy w Sejmie sa wypukle i reaguja na kursor, wlasne mandaty swieca zlotem. Pasek glosowania jest wyzszy i wypelnia sie plynnie.',
   'Cechy przewodniczacego czyta sie jak odczyty przyrzadu, a nie jak cztery szare kwadraty.',
   'Naprawione: tytul decyzji stal o 15 pikseli dalej niz jej opis, bo zostal mu padding po starszej wersji ukladu.',
   'Kto ma w systemie wylaczone animacje, dostaje gre bez ruchu.',
 ]},

 '1.1.28':{data:'5 sierpnia 2026', zmiany:[
   'Drugi etap nowego wygladu: ekran Decyzji. Kategorie wygladaja teraz jak nawigacja, filtry skutkow zeszly na drugi plan, a kafle maja rowne wysokosci i kolorowy akcent kategorii przy lewej krawedzi.',
   'Wyszarzone decyzje wyrazniej odrozniaja sie od dostepnych, a powod blokady stoi w osobnej linii pod kaflem.',
   'Mapa okregow: kafle reaguja na kursor i wyraznie pokazuja, ktory okreg jest wybrany.',
 ]},

 '1.1.27':{data:'5 sierpnia 2026', zmiany:[
   'Pierwszy etap nowego wygladu: jedna skala wielkosci pisma i jeden rytm odstepow zamiast wartosci dobieranych na oko w kilkunastu miejscach.',
   'Karty maja spokojniejsza rame i wyrazniejszy naglowek, kafle decyzji czytaja sie jak karty do zagrania.',
   'Tabele, listy, pigulki i okna dostaly wiecej powietrza i jednolita wysokosc.',
   'Wykres kondycji partii mniejszy - podpisy osi przestaly na siebie zachodzic.',
 ]},

 '1.1.26':{data:'5 sierpnia 2026', zmiany:[
   'Weto nie marnuje juz calej kadencji. Podejscie do ustawy zuzywa sie dopiero po rozstrzygnieciu sprawy, a nie w chwili zlozenia projektu.',
   'Sejm moze odrzucic weto prezydenta wiekszoscia trzech piatych. Palac przestal byc instancja, od ktorej nie ma odwolania.',
   'Kazde weto kosztuje prezydenta: kontrowersja w gore, wiarygodnosc w dol i relacje z premierem na minus. Przegrane weto zabiera mu takze slawe.',
   'Prezydent komputerowy czyta ustawy: patrzy na radykalnosc, na to czy projekt jest jego, i czy sam siedzi w rzadzie.',
   'Przed zlozeniem projektu widzisz ostrzezenie, ze jako nie-rzadowiec pracujesz na konto premiera. Przy glosowaniu widac autora od razu.',
   'Partia bez mandatow nie ma juz prawa inicjatywy ustawodawczej.',
   'Ustawa przepchnieta przez opozycje obniza sprawczosc rzadu - to dowod, ze gabinet stracil kontrole nad izba.',
 ]},

 '1.1.25':{data:'5 sierpnia 2026', zmiany:[
   'Cel Kazikmistrz ma własne logo, a po jego ukończeniu Kaziu wraca do swojego starego awatara — tego, po którym wszyscy go pamiętają.',
 ]},

 '1.1.24':{data:'5 sierpnia 2026', zmiany:[
   'Naprawiony błąd: ustawa z poprzedniej kadencji zostawała na biurku prezydenta i naliczała karę za zwłokę w sprawie, której nigdy nie widziałeś. Teraz projekt przepada wraz z końcem kadencji.',
   'Zmęczenie władzą psuje też relacje — im dłużej rządzisz, tym gorzej reszta sceny na ciebie patrzy.',
   'Składając rząd bez kogoś, kto ma mandaty, obrażasz go proporcjonalnie do jego siły. Wcześniej nikomu to nie przeszkadzało.',
   'Ludzie z zaplecza nie znikają już bez śladu do bezpartyjnych. Odejść mogą do konkurencji — i wtedy widać dokąd.',
   'Regeneracja lidera znów za darmo, ale najwyżej dwa razy w tygodniu.',
   'Filtry decyzji zgadzają się z tym, co decyzja naprawdę robi — zniknęła jedność tam, gdzie jej już nie ma.',
   'Wykres kondycji partii mniejszy, podpisy osi przestały na siebie zachodzić.',
 ]},
 
 '1.1.23':{data:'5 sierpnia 2026', zmiany:[
   'Inflacja: im większy zapas kapitału trzymasz w kasie, tym drożej wychodzi każda decyzja. Przy grubym worku starczy na jedną akcję w tygodniu — kapitał ma pracować, nie leżeć.',
   'Jedności nie kupisz już żadną decyzją. Zostają debaty, a te niosą ze sobą kontrowersję.',
   'Nabór do partii raz na sześć tygodni zamiast co trzy.',
   'Regeneracja lidera kosztuje 70 kapitału — tydzień bez przewodniczącego to majątek.',
   'Premier nie przejdzie do kolejnego tygodnia z pustymi krzesłami w rządzie. Nieobsadzone resorty świecą na czerwono.',
   'Po głosowaniu nad ustawą widzisz pełny wynik: kto jak zagłosował i o ile brakowało.',
   'Ustawa wniesiona spoza rządu daje autorowi mniej, a premierowi i tak dopisuje zasługę — tak działa gabinet.',
   'Ustawy wreszcie coś zmieniają: media dają dokładniejsze sondaże, sądy i kodeks schładzają kontrowersję, zagadki dokładają energii, Mordepedia ułatwia nabór.',
   'Żadne wydarzenie nie wskoczy już w środek liczenia głosów ani dogrywki prezydenckiej.',
   'Tako jest teraz potrzebny także do Alternatywy i Partii Republikańskiej. DPD dochodzi do Republikańskiej dopiero przez Partię Centrum.',
 ]},
 '1.1.20':{data:'4 sierpnia 2026', zmiany:[
   'Launcher ma teraz zakładki: Gra, Mody i Kreator. Wszystko robisz w jednym oknie, bez wchodzenia do gry.',
   'Kreator scenariuszy wprost w launcherze: nazwa, autor, opis i dziesięć suwaków ustawiających stan serwera na starcie.',
   'Zapisany scenariusz od razu ląduje na liście modów i w grze.',
 ]},
 '1.1.19':{data:'4 sierpnia 2026', zmiany:[
   'Mody i scenariusze masz teraz w launcherze: osobny ekran z listą wgranych, wgrywaniem plikiem i usuwaniem.',
   'Launcher przyjmuje pojedyncze pliki modów i całe paczki zip naraz — wskazujesz plik i tyle.',
 ]},
 '1.1.18':{data:'4 sierpnia 2026', zmiany:[
   'Mody i własne scenariusze. W kreatorze ustawiasz, jak ma wyglądać serwer na starcie, i zapisujesz to jako plik — swój scenariusz pojawia się na liście obok wbudowanych.',
   'Plik moda możesz wysłać komuś innemu. Wrzuca go u siebie do katalogu modów i gra w dokładnie to samo.',
   'Mody nie zawierają kodu, tylko opis zmian — cudzy scenariusz nie może zrobić w grze niczego poza tym, co przewidziano.',
   'Launcher wygląda inaczej: godło, wyraźny stan gotowości i jeden duży przycisk, gdy nie ma czego pobierać.',
 ]},
 '1.1.16':{data:'4 sierpnia 2026', zmiany:[
   'Aktualizacja nie otwiera już dwóch okien gry naraz. Launcher odblokowywał przycisk pół sekundy przed startem gry i dało się kliknąć drugi raz.',
 ]},
 '1.1.15':{data:'4 sierpnia 2026', zmiany:[
   'Wywiad to teraz minigra: trzy pytania, a właściwa odpowiedź zależy od sytuacji twojej partii. Wygrana daje sławę i wiarygodność bez kontrowersji, przegrana — aferę.',
   'Zamiast wycieku screenów i szitpostu wchodzi Doniesienie do administracji: raz na kadencję, 10% szans na rozwiązanie cudzej partii, a przy porażce ogromna kontrowersja. Boty tego nie mają.',
   'Nowa akcja opozycji: Przekupstwo koalicjanta. Kupiony poseł głosuje przeciw rządowi przy najbliższej ustawie.',
   'Rząd ma teraz sprawczość — przegrane głosowania biją po premierze i po poparciu gabinetu.',
   'Prezydent musi zdecydować o ustawie w trzy tygodnie. Zwłoka kosztuje wiarygodność, sławę i jedność partii.',
   'Sejm nie zapętli się już na wyborze premiera: po ośmiu nieudanych rundach Król powołuje rząd z nadania.',
   'Nabór da się wykręcić na pełne 100 punktów, ale tylko idealnym ogłoszeniem.',
   'Memy wyraźnie tańsze, kanwasing i nabór droższe.',
   'Nowy cel DPD „Kazikmistrz”: Kaziu traci swoją fatalną cechę i dostaje „Stare dobre lata”.',
   'Nowy cel globalny „Świadek Koronny” — najtrudniejszy w grze i celowo bez wielkich premii.',
   'Zakładka Partie pokazuje wyłącznie zaplecza obcych partii. Mandaty w pasku to zdobyte, nie prognoza.',
   'Gustaw przechodzi z PPP do DPD. Cele Postępowców i LSD dostały ostrzejsze wymagania, a najsilniejsze nagrody zostały przycięte.',
 ]},
 '1.1.14':{data:'4 sierpnia 2026', zmiany:[
   'Zapisy ze starszych wersji wczytują się normalnie. Wcześniej rozgrywka sprzed aktualizacji potrafiła wywalić grę przy pierwszym kliknięciu.',
   'Zapis z „trzynastego tygodnia” sam się prostuje przy wczytaniu.',
 ]},
 '1.1.13':{data:'4 sierpnia 2026', zmiany:[
   'Obecność w kanałach da się wreszcie zbudować. Zanikała szybciej, niż można ją było odnawiać, więc siedziała na sztywnym suficie i nie dawało się z niej zrobić wyniku.',
   'Kapitał nie schodzi już poniżej zera przy paraliżu partii, a dopłaty koalicyjne płacisz tylko wtedy, gdy naprawdę cię na nie stać.',
   'Minister, który odszedł z partii albo dał się podkupić, nie siedzi już w radzie jako duch — resort wraca do obsadzenia.',
   'Sejm, w którym nikt nie ma mandatu, nie wywraca już wyboru premiera. Król rozwiązuje izbę i idziemy do przedterminowych wyborów.',
   'Sprzątanie po kodzie: martwy ekran przewodnictwa i nieużywane resztki poszły w kosz.',
 ]},
 '1.1.12':{data:'4 sierpnia 2026', zmiany:[
   'Kadencja ma dokładnie dwanaście tygodni. Koniec z „13 z 12” — po ostatnim tygodniu idziesz prosto do urn.',
   'Wejście w Układ sterów i wycofanie się nie zabiera już limitu na kadencję ani akcji. Limit zużywa się dopiero, gdy coś zatwierdzisz.',
   'Sejm rozpatruje jeden projekt ustawy tygodniowo. Zasada „raz na kadencję” dla każdej ustawy zostaje bez zmian.',
   'Brak rządu wreszcie boli i boli coraz bardziej z każdym tygodniem kryzysu — spada aktywność, jedność, wiarygodność i kasa, a po czterech tygodniach ludzie zaczynają odchodzić.',
   'Sondaże mocniej zależą od tego, co robisz. Nawet własny elektorat trzeba zmobilizować: martwa partia nie dowozi swoich do urn.',
   'Zmęczenie władzą uderza łagodniej po pierwszej kadencji i narasta dopiero przy kolejnych.',
   'Partie finansują kampanię z tego, co mają na koncie, a nie tylko z tygodniowego przychodu. Duże budżety dają malejące zwroty.',
   'Cele partyjne dają wyraźnie mniej jedności, a więcej wiarygodności i aktywności. Sama zgoda w partii przestaje wygrywać wybory.',
   'Zakładka Partie przebudowana: twoje zaplecze na wierzchu, reszta sceny jednym czytelnym spisem zamiast ściany pasków.',
   'Nabór: kawałki ogłoszenia wyśrodkowane, z licznikiem postępu i czytelniejszym układem.',
 ]},
 '1.1.11':{data:'4 sierpnia 2026', zmiany:[
   'Nowa zakładka „Partie”: cała scena na jednym ekranie — kto rządzi, ile ma, w jakim jest stanie i jak cię znosi.',
   'Serwer wreszcie naprawdę żyje. Ludzie dołączają po dobrej kadencji i odchodzą po awanturach — liczby się zmieniają, a nie tylko komunikaty.',
   'Koalicjanci liczą krzesła. Zgarnij całą radę ministrów dla siebie, a partie bez resortu ci to zapamiętają.',
   'Jedność waży mniej niż dotąd — o wyniku decyduje bardziej to, co partia realnie robi.',
   'Tako dołącza do serwera jako bezpartyjny intelektualista. Bez niego nie ma Partii Centrum.',
   'Mandaty dostały własną ikonę, logo Perspektywicznej wreszcie na środku.',
   'Koniec z ucinanymi napisami pod salą sejmową i w kondycji partii.',
   'Kronika wróciła pod Przewodnictwo, a ciasny panel nad nią zniknął.',
 ]},
 '1.1.10':{data:'4 sierpnia 2026', zmiany:[
   'Do gry wchodzi muzyka z serwera. „Nie pucuj mi petardy” wita cię przy starcie PPP.',
   '„Pax Mathiae” leci, kiedy wybory wygrywa partia Maćka.',
   '„Dyktator i Król” gra przy powrocie Partii Republikańskiej.',
   'Wszystko cicho i pod jednym przyciskiem — wyciszenie ucina też to, co akurat leci.',
 ]},
 '1.1.9':{data:'4 sierpnia 2026', zmiany:[
   'Naprawiony launcher: aktualizacja nie kończy się już komunikatem o uszkodzonych bibliotekach.',
   'Nowy cel dla DPD — „Ani w lewo, ani w prawo”: zbierasz Tortexa, Kaziu i balona i zakładasz Partię Centrum.',
   'Nowy cel dla Nowej Perspektywy — „Hegemon Perspektywiczny”: pięć kadencji, urząd, pięćdziesiąt osób i pełna kasa. Reszta sceny cię za to znienawidzi.',
   'Balon przechodzi do PLR, a Chrześcijańska Partia Cesarska znika ze sceny — jej poseł i mandat trafiają do Nowej Perspektywy.',
   'Przycisk „Menu” na pasku gry: wyjście do menu nie chowa się już w oknie zapisu.',
   'Wymagania celów mówią jednym głosem: wszędzie „w partii”, nigdzie „w zapleczu”.',
 ]},
 '1.1.8':{data:'4 sierpnia 2026', zmiany:[
   'Koniec z pustym sejmem. Sejm mógł podnieść próg wyborczy tak wysoko, że nie przeskakiwał go nikt — teraz próg ustępuje, a mandaty zawsze mają właściciela.',
   'Koalicje wreszcie się opłacają: mandaty należą się liście i dzielą między wszystkie partie, także te bez własnych pięciu procent.',
   'Mała partia nie pokazuje już w sondażu zera, mając realne poparcie — błąd pomiaru skaluje się z wielkością.',
   'Doświadczenie zbiera osoba, nie partia. Zmiana przewodniczącego nie przenosi już cudzego dorobku.',
   'Odwołanie ministra to decyzja premiera, bez głosowania. Doszła osobna „Zmiana ministra”, a świeżo powołanego nie ruszysz przez trzy tygodnie.',
   'Przekupienie działacza: wybierasz konkretną osobę i płacisz jej cenę, zamiast rzucać monetą. Przewodniczących kupić się nie da.',
   'Vengeance rośnie wolniej i zatrzymuje się na 82 autorytetu — i nie zabiera już bonusu do nowej gry.',
   'Nowy skrót o partii i kronika na samej górze — bez przewijania pół strony.',
 ]},
 '1.1.7':{data:'4 sierpnia 2026', zmiany:[
   'Launcher zakłada grze własny folder zamiast wysypywać pliki tam, gdzie sam leży.',
   'Gra i jej biblioteki schodzą zawsze razem — koniec z błędem o brakującym python314.dll.',
   'Gra nie rozpakowuje się już przy każdym starcie: wstaje szybciej i rzadziej wkurza antywirusy.',
 ]},
 '1.1.6':{data:'4 sierpnia 2026', zmiany:[
   'Zapisy w sześciu miejscach: widzisz partię, kadencję, mandaty i datę każdej rozgrywki. Skrót Ctrl+Z.',
   'Autozapis chodzi osobno i nie zajmuje żadnego z tych miejsc.',
   'Launcher pobiera pliki ośmioma połączeniami naraz — aktualizacja schodzi w sekundy zamiast w minutę.',
   'Nowy wygląd launchera: własny pasek postępu i widać, który plik akurat leci.',
 ]},
 '1.1.4':{data:'3 sierpnia 2026', zmiany:[
   'Nabór to teraz układanka: składasz ogłoszenie z trzech kawałków, a liczy się dopasowanie do ludzi z kanału. Koniec z pisaniem w puste pole.',
   'Ustawy nie przechodzą już same z siebie — opozycja przestała firmować sukcesy rządu.',
   'Nowy widok głosowania: pasek za i przeciw, kreska progu, kto jak zagłosował.',
   'Po głosowaniu widać wprost, czy prezydent podpisał, czy zawetował.',
   'Sejm i władza rozłożone na kolumny, sala sejmowa mniejsza i czytelniejsza.',
   'Premier może znowu tworzyć i likwidować kanały — decyzja wróciła do gry.',
 ]},
 '1.1.3':{data:'3 sierpnia 2026', zmiany:[
   'Po każdej aktualizacji zobaczysz to okno — raz na wersję, nie za każdym odpaleniem.',
   'Do listy zmian wrócisz w każdej chwili: „co nowego” pod nazwiskami na ekranie startowym.',
 ]},
 '1.1.2':{data:'3 sierpnia 2026', zmiany:[
   'Trudniej: obecność w kanałach szybciej się osypuje, a powtarzanie tej samej decyzji przestaje działać.',
   'Nikt nie betonuje się na szczycie — im dłużej rządzisz, tym bardziej serwer ma cię dość.',
   'Po wyborach dostajesz rozliczenie kadencji: co dokładnie zabrało ci mandaty.',
   'Partie komputerowe składają wotum nieufności, podbierają ludzi i obsadzają ministerstwa.',
   'Ustawy resortowe: podatki, Mordepedia, sądy administracyjne i MAN.',
   'Cel Republikanów to zjednoczenie chętnych, a nie połknięcie czterech partii naraz.',
 ]},
};
function patchDoPokazania(){
  const wpis=PATCHNOTE[WERSJA];
  if(!wpis)return null;
  try{if(localStorage.getItem('mm_patchnote')===WERSJA)return null}catch(e){}
  return wpis;
}
function patchZamknij(){
  try{localStorage.setItem('mm_patchnote',WERSJA)}catch(e){}
  close();render();
}
function pokazPatch(){
  const wpis=PATCHNOTE[WERSJA];if(!wpis)return;
  close();
  const v=document.createElement('div');v.className='veil';v.id='veil';
  v.innerHTML=`<div class="mdl patchmdl"><button class="mdlx" type="button" aria-label="Zamknij">×</button>
    <div class="h"><div class="k">Wersja ${WERSJA} · ${wpis.data}</div><h2>Co nowego</h2></div>
    <div class="bd"><ul class="patchlist">${wpis.zmiany.map(z=>`<li>${z}</li>`).join('')}</ul></div>
    <div class="op"><button class="opt" id="pok"><b>Gram</b><span>Pokażę to znowu dopiero przy kolejnej wersji</span></button></div></div>`;
  document.body.appendChild(v);
  v.querySelector('#pok').onclick=patchZamknij;
  v.querySelector('.mdlx').onclick=patchZamknij;
}
function creditsBox(){
  return `<div class="credits">
    <div class="cline"></div>
    <div class="ctxt"><span class="ck">Mordy Mordeczki · Sejm</span>
      <b>${AUTORZY.join(' i ')}</b>
      <span class="cv">wersja ${WERSJA}${PATCHNOTE[WERSJA]?` · <button class="conowego" onclick="pokazPatch()">co nowego</button>`:''}</span></div>
  </div>`;
}
const TUT=[
 {t:'Prowadzisz Stronnictwo Reisei',
  d:'Dwie osoby, jeden mandat, ogromny sufit potencjału. U góry masz akcje na ten tydzień, kapitał, energię, sondaż i datę. '
   +'Kadencja to dwanaście tygodni, potem wybory. Panel z prawej mówi, co robić dalej, i odblokowuje się dopiero, gdy to zrobisz.',
  ok:()=>true},
 {t:'Zadanie: otwórz Mapę okręgów',tab:'mapa',
  d:'Sześciokąty to kanały serwera, w każdym rozdaje się mandaty. Obecność w kanale mnoży twój wynik od ×0,34 do ×2,7, '
   +'mocniej niż cokolwiek innego w grze. Wejdź w zakładkę i kliknij dowolny kanał.',
  ok:()=>!!G.tutSeen.mapa},
 {t:'Zadanie: zrób kanwasing',tab:'akcje',
  d:'Zakładka Decyzje, kategoria Kampania, decyzja <b>Kanwasing</b> w kanale <b>#ogólny</b>. Najtańszy sposób na obecność. '
   +'Z każdej kategorii możesz w tygodniu wykonać tylko jedną decyzję, więc plan na tydzień układa się sam.',
  ok:()=>(G.used.kanwas||0)>0},
 {t:'Zadanie: zakończ tydzień',
  d:'Kliknij <b>Kolejny tydzień</b> u góry. Data przeskoczy o siedem dni, wrócą akcje i energia, a serwer w tym czasie też coś zrobi. '
   +'Zdarzenia losowe rozwiążesz w oknie, które się pojawi.',
  ok:()=>G.week>=2},
 {t:'Zadanie: wiec, czyli kombinacja',tab:'akcje',
  d:'Zrób <b>Wiec w kanale</b> w tym samym <b>#ogólnym</b>. Kanwasing przed wiecem to kombinacja <b>×1,55</b>: '
   +'ludzie już wiedzieli, po co przychodzą. Kolejność decyzji działa też między tygodniami, kafelki pokazują mnożnik.',
  ok:()=>(G.used.wiec||0)>0},
 {t:'Zadanie: zajrzyj do Sondażu',tab:'sondaz',
  d:'Zobacz, jak stoisz na tle reszty. To badanie, nie wynik: pojedynczy odczyt bywa przestrzelony nawet o sześć punktów. '
   +'Mandaty obok liczone są z prawdziwego poparcia, którego nie widzisz.',
  ok:()=>!!G.tutSeen.sondaz},
 {t:'Skąd się bierze kapitał',
  d:'Składki płacą twoi ludzie i to bardzo nierówno: elita 2,6, intelektualista 0,95, serwerowicz 0,18. Jedna elita to '
   +'finansowo czternastu serwerowiczów. Do tego dochodzą urzędy: bycie w rządzie, fotel premiera, pałac prezydencki i resorty. '
   +'Uwaga na drugą stronę: nadwyżka ponad sześciokrotność tygodniowego dochodu topnieje o 24% i podbija kontrowersję. '
   +'Kapitał ma wychodzić w tym samym tygodniu, w którym wpłynął.',
  ok:()=>true},
 {t:'Zadanie: podpisz transfer',tab:'akcje',
  d:'Na dole zakładki Decyzje jest panel <b>Transfery bezpartyjnych</b>: ludzie spoza partii, których bierze się czystym kapitałem, '
   +'bez akcji. Elity kosztują najwięcej i najwięcej dają. Podpisz kogokolwiek, kogo cię stać. Jeden transfer na tydzień, boty polują na tych samych.',
  ok:()=>Object.keys(G.agents).some(n=>G.agents[n]===G.me)},
 {t:'Energia i zmęczenie',
  d:'Każda decyzja kosztuje energię, a ta wraca co tydzień, tym szybciej im wyższa wytrzymałość przewodniczącego i jedność partii. '
   +'Powtarzanie tej samej decyzji ją osłabia (kafelek pokazuje „zmęcz. ×”), więc opłaca się mieszać. '
   +'Koszt kapitału rośnie z wielkością partii: kanapowa płaci ułamek, moloch dwa i pół raza więcej.',
  ok:()=>true},
 {t:'Zadanie: sprawdź przychylność Króla',tab:'krol',
  d:'Król decyduje, kto dostanie desygnację na premiera. Liczą się przede wszystkim mandaty i wielkość partii, potem wiarygodność, '
   +'aktywność, stosunki z dworem i danina. Kontrowersja przeszkadza, ale nie przekreśla. Zajrzyj, jak stoisz.',
  ok:()=>!!G.tutSeen.krol},
 {t:'Zadanie: obejrzyj Sejm i władzę',tab:'sejm',
  d:'Tu widzisz premiera, prezydenta, gabinet, listy wyborcze i opozycję. Jeśli jesteś poza rządem, stąd zawiązujesz i nazywasz '
   +'blok opozycyjny. Zajrzyj, kto dziś rządzi serwerem.',
  ok:()=>!!G.tutSeen.sejm},
 {t:'Zadanie: wybierz sobie cel',tab:'cele',
  d:'Cel partyjny to jednorazowa przemiana: zmienia nazwę, logo i zasady, którymi gra twoja partia. '
   +'<b>Kanał w końcu żyje</b> i <b>Ręka Mordeczki</b> są dostępne dla każdego, reszta zależy od partii. Zobacz, czego wymagają.',
  ok:()=>!!G.tutSeen.cele},
 {t:'Ludzie, dyplomacja i kontrowersja',
  d:'Ludzi zdobywasz naborem, transferami, werbunkiem imiennym z cudzych partii i na koniec kadencji, jeśli sława i wiarygodność '
   +'są wyższe od progu zależnego od wielkości partii. Relacje z innymi decydują o koalicjach i o tym, kto da ci kogoś podebrać. '
   +'A kontrowersji pilnuj: przy 90 partia wpada w paraliż, sondaż liczy się na pół i ludzie wychodzą.',
  ok:()=>true},
 {t:'Dograj kadencję do wyborów',
  d:'Reszta należy do ciebie. Buduj obecność, zbieraj ludzi, wydawaj kapitał. Przed wyborami zdecydujesz, czy startujesz sam przy progu 5%, '
   +'czy z kimś na wspólnej liście, gdzie próg rośnie do 8% we dwójkę i 13% w trójkę.',
  ok:()=>G.term>=2||G.phase==='elect'},
];
function startTutorial(){
  newGame('SS');
  G.tut={i:0};G.tutSeen={};
  say('<b>Samouczek.</b> Prowadzę cię przez pierwszą kadencję. Panel z prawej mówi, co robić dalej.','roy');
  render();
}
function tutStep(){return G.tut?TUT[G.tut.i]:null}
function tutNext(){
  if(!G.tut)return;
  const st=tutStep();
  if(!st||!st.ok())return;
  G.tut.i++;
  if(G.tut.i>=TUT.length){
    G.tut=null;
    say('<b>Samouczek skończony.</b> Od tej pory grasz normalnie, ta partia zostaje twoja.','good');
  }
  render();
}
function tutSkip(){
  if(!G.tut)return;
  G.tut=null;say('Samouczek pominięty. Grasz dalej normalnie.','');render();
}
function tutBox(){
  const st=tutStep();if(!st)return '';
  const gotowe=st.ok();
  return `<div class="tut">
    <div class="th"><span>Samouczek · krok ${G.tut.i+1} z ${TUT.length}</span>
      <button onclick="tutSkip()" title="Pomiń samouczek">✕</button></div>
    <div class="tdots">${TUT.map((_,i)=>`<i class="${i<G.tut.i?'done':i===G.tut.i?'on':''}"></i>`).join('')}</div>
    <h4>${st.t}</h4>
    <p>${st.d}</p>
    ${st.tab&&!gotowe?`<div class="thint">Zakładka <b>${(({mapa:'Mapa okręgów',akcje:'Decyzje',sondaz:'Sondaż',cele:'Cele partyjne',lider:'Lider',krol:'Król',sejm:'Sejm i władza'})[st.tab])}</b>, na górze ekranu</div>`:''}
    <button class="btn ${gotowe?'':'g'}" ${gotowe?'':'disabled'} onclick="tutNext()">
      ${gotowe?(G.tut.i===TUT.length-1?'Kończę samouczek':'Dalej →'):'Zrób to, co powyżej'}</button>
  </div>`;
}

function setup(){
  app.innerHTML=`
  <div class="intro">
    <div class="kick">Mordy Mordeczki · roleplay polityczny</div>
    <h1>Sejm<svg class="seal" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="var(--acc2)" stroke-width="1.1">
        <circle cx="50" cy="50" r="43"/><circle cx="50" cy="50" r="36"/>
        <path d="M50 14 L54 24 L50 22 L46 24 Z" fill="var(--acc2)" stroke="none"/>
        <g opacity=".85">
          <path d="M28 62 Q50 78 72 62" />
          <path d="M30 58 Q50 72 70 58" />
        </g>
      </g></svg></h1>
    <p>670 osób, 40 mandatów w dziewięciu kanałach, wybory co dwanaście tygodni. Po wyborach sejm głosuje nad
       premierem, a jeśli nie przejdzie, kandydata wskazuje Król Mordeczka. Co drugą kadencję serwer wybiera prezydenta.</p>
    <div class="facts">
      <div class="fact"><b>670</b><span>osób na serwerze</span></div>
      <div class="fact"><b>${DIST_SEATS}+${TOPUP}</b><span>mandatów: okręgi + lista</span></div>
      <div class="fact"><b>5/8/13%</b><span>progi wyborcze</span></div>
      <div class="fact"><b>${MAJ}</b><span>mandatów na większość</span></div>
      <div class="fact"><b>∞</b><span>kadencji</span></div>
    </div>
    <div class="ekstopka">
      <span class="ekleg">wczytywanie zapisów jest w menu głównym</span>
      <button class="btn g sm" onclick="backToMode()">← Wstecz</button>
    </div>
  </div>
  <!-- Układ z ekranu startu Victorii: lista po lewej, panel wybranego po prawej.
       Ich wiersze mają 560x105, panel boczny 420, odstęp 5 — te proporcje
       przenosimy tutaj, samą grafikę rysujemy po swojemu. -->
  <div class="pick v3">
    <div class="pickmain" id="pmain"></div>
    <div>
      <div style="font-family:var(--m);font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:var(--dim2);margin-bottom:10px">${PID.length} ugrupowań · kliknij, żeby obejrzeć</div>
      <div class="picklist">
        ${PID.map(k=>{const st=START_SEATS[k]||0,d=BASE[k].diff||3;
          return `<button class="pickcell ${k===SEL?'on':''}" onclick="pickParty('${k}')" style="--pc:${BASE[k].c}">
          <i class="pcbar"></i>
          <div class="pcimg">${crest(k,'l')}</div>
          <span>${BASE[k].ab}</span>
          <span class="pcname">${BASE[k].n}</span>
          <div class="pcrow"><span class="pcseat">${st} ${pl(st,'mandat','mandaty','mandatów')}</span>
            <span class="pcdiff" title="trudność ${d} z 5">${'★'.repeat(d)}${'☆'.repeat(5-d)}</span></div>
        </button>`}).join('')}
        <button class="pickcell" onclick="openCreator()" style="border-style:dashed;--pc:var(--acc)">
          <div class="pcimg"><span style="width:56px;height:56px;display:grid;place-items:center;font-size:28px;color:var(--acc);
            border:1px dashed var(--line2);border-radius:10px;position:relative">+</span></div><span>NOWA</span>
          <span class="pcname">Zakładasz własną partię od zera</span>
          <div class="pcrow"><span class="pcseat">kreator</span><span class="pcdiff">☆☆☆☆☆</span></div></button>
      </div>
    </div>
  </div>`;
  pickMain();
}
function start(k){
  newGame(k);
  if(SCENSEL&&SCEN[SCENSEL]){G.scen=SCENSEL;try{SCEN[SCENSEL].apply()}catch(e){}}
  histPush();SFX.gong();render();
  if(k==='PPP')graj('petarda');   // hymn Partii Pana Prezesa na powitanie
}
function tryLoadFromSetup(){
  const el=document.getElementById('loadCodeInp');
  const err=document.getElementById('loadErr');
  const code=el?el.value:'';
  try{loadCode(code);if(err)err.textContent='';render()}
  catch(e){if(err)err.textContent='Nie udało się wczytać: '+e.message}
}

function game(){
  applyGoals();
  const p=me(),q=tally(),AL=allocate(q.res,q.total);
  const sh=q.res[G.me].tot/q.total*100;
  G.lastPoll=sh;
  const role=isPM()?'PREMIER':inGov()?'KOALICJA':'OPOZYCJA';
  app.innerHTML=`
  <div class="hud" style="--partia:${p.c}">
    <div class="id">${crest(G.me,'m')}<div style="min-width:0"><h2>${p.n}</h2>
      <div class="sub">${p.lead} · <span class="rola ${role.toLowerCase()}">${role}</span>${hasPrez()?' · <span class="rola prezydent">PREZYDENT</span>':''}</div></div></div>
    <!-- Górny poziom paska: co PRZYBĘDZIE w tym tygodniu, na zielono.
         Dolny: stan na teraz. Dokładnie ten układ, co w pasku Victorii —
         najpierw przyrosty, pod nimi zasoby, wszystko w jednym pancerzu. -->
    <div class="rgroup">
    <div class="rs">${ikona('akcje')}<div class="rv"><b>${G.ap}<span class="of">/${G.apMax}</span></b><span>akcje</span></div></div>
    ${(()=>{const i=income();return `<div class="rs tip">${ikona('kapital')}<div class="rv"><b class="${G.kp<0?'ujem':''}">${Math.round(G.kp)}<span class="plus">+${i.total}</span></b><span>kapitał</span></div>
      <div class="tipbox">
        <div style="font-family:var(--m);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--acc);margin-bottom:8px">Wpływy tygodniowe</div>
        ${SEG.map(s=>{const per={eli:2.6,int:.95,ser:.18}[s.id];
          return `<div class="l"><span><i style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${s.c};margin-right:6px"></i>${s.n} ${p.comp[s.id]}×${per.toFixed(2)}</span><b>${(p.comp[s.id]*per).toFixed(1)}</b></div>`}).join('')}
        <div class="l" style="border-top:1px solid var(--line);padding-top:6px;margin-top:6px">
          <span>Ściągalność (aktywność ${Math.round(p.act)})</span>
          <b style="color:${i.akt>1?'var(--pos)':i.akt<.7?'var(--neg)':'var(--acc)'}">×${i.akt.toFixed(2)}</b></div>
        ${i.urz?`<div class="l"><span>Dodatki z urzędów</span><b style="color:var(--acc)">+${i.urz.toFixed(1)}</b></div>`:''}
        <div class="tot"><span>Razem</span><b class="m" style="color:var(--acc)">+${i.total}</b></div>
        ${inflacjaProc()>0?`<div class="l" style="border-top:1px solid var(--line);padding-top:6px;margin-top:6px">
          <span style="color:var(--neg)">Inflacja (kapitał ponad ${INFLACJA_PROG})</span>
          <b style="color:var(--neg)">decyzje +${inflacjaProc()}%</b></div>
          <div style="color:var(--dim2);font-size:11.5px;margin-top:6px">Im większy zapas leży w kasie,
          tym drożej wychodzi każda decyzja. Wydawaj, zamiast zbierać.</div>`:''}
        <div style="color:var(--dim2);font-size:11.5px;margin-top:7px">Elita płaci czternaście razy tyle co serwerowicz, ale przy martwej partii nie płaci nikt.</div>
      </div></div>`})()}
    ${(()=>{const eg=enGain(),ld=lead(G.me);return `<div class="rs tip">${ikona('energia')}
      <div class="rv"><b class="${G.en<25?'ujem':''}">${Math.round(G.en)}<span class="plus" style="color:${eg<8?'var(--neg)':eg<18?'var(--acc)':'var(--pos)'};-webkit-text-fill-color:${eg<8?'var(--neg)':eg<18?'var(--acc)':'var(--pos)'}">+${eg}</span></b><span>energia</span></div>
      <div class="tipbox">
        <div style="font-family:var(--m);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--acc);margin-bottom:8px">Regeneracja tygodniowa</div>
        <div class="l"><span>Podstawa</span><b>2,0</b></div>
        <div class="l"><span>Wytrzymałość ${p.lead} (${ld.wytrz})</span><b>+${(ld.wytrz/3.4).toFixed(1)}</b></div>
        <div class="l"><span>Jedność ${Math.round(p.uni)} <span style="color:var(--dim2)">(próg 48)</span></span>
          <b style="color:${p.uni>=48?'var(--pos)':'var(--neg)'}">${p.uni>=48?'+':''}${((p.uni-48)/4.5).toFixed(1)}</b></div>
        <div class="tot"><span>Razem</span><b class="m" style="color:${eg<8?'var(--neg)':'var(--acc)'}">+${eg}</b></div>
        <div style="color:var(--dim2);font-size:11.5px;margin-top:7px">Przy jedności poniżej dwudziestu lider praktycznie nie regeneruje sił, nikt nie ma weny do prowadzenia partii, w której jest sam.</div>
      </div></div>`})()}
    </div>
    <div class="rgroup">
    <div class="rs tip">${ikona('sondaz')}<div class="rv"><b>${fmt(shown(G.me,sh))}%<span class="plus" style="color:var(--info);-webkit-text-fill-color:var(--info)">?</span></b><span>sondaż</span></div>
      ${(()=>{const h=(G.polls||[]).map(r=>r.s&&r.s[G.me]).filter(x=>isFinite(x));
        return h.length>1?`<div class="iskrabox">${iskra(h,'var(--acc)')}
          <span>ostatnie ${h.length} ${pl(h.length,'odczyt','odczyty','odczytów')}</span></div>`:''})()}
      <div class="tipbox" style="width:330px">
        <div style="font-family:var(--m);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--acc);margin-bottom:8px">Co realnie rusza sondażem</div>
        <div class="l"><span><b>Liczba i skład partii</b>, decyduje najmocniej</span></div>
        <div style="font-size:11.5px;color:var(--dim2);margin:-2px 0 7px">Dwie trzecie wyniku to twoi ludzie. Elita waży 1,75 głosu, intelektualista 1,10, serwerowicz 0,66.</div>
        <div class="l"><span><b>Obecność w okręgach</b></span><b>×0,45–2,1</b></div>
        <div style="font-size:11.5px;color:var(--dim2);margin:-2px 0 7px">Wiec, kanwasing, memy, zjazd i spot. Spada 12% tygodniowo, więc trzeba podtrzymywać.</div>
        <div class="l"><span><b>Jedność i aktywność</b></span><b>×0,46–1,3</b></div>
        <div style="font-size:11.5px;color:var(--dim2);margin:-2px 0 7px">Ważą dziś więcej niż sama sława. Szkolenie kadr, statut, zjazd.</div>
        <div class="l"><span><b>Urzędy</b></span><b>premier +26%, pałac +13%</b></div>
        <div class="l"><span><b>Momentum</b></span><b>±30%</b></div>
        <div style="font-size:11.5px;color:var(--dim2);margin:-2px 0 7px">Rośnie od wygranych debat, udanych afer i owacyjnych wieców; wygasa o 17% tygodniowo.</div>
        <div style="border-top:1px solid var(--line);padding-top:7px;margin-top:4px;color:var(--dim2);font-size:11.5px">
          Sam sondaż to <b style="color:var(--tx)">badanie</b>, nie wynik, pojedynczy odczyt bywa przestrzelony nawet o siedem punktów.
          Prawdziwe poparcie widać dopiero przy urnach.</div>
      </div></div>
    <!-- mandaty zdobyte w ostatnich wyborach, nie prognoza z bieżącego przeliczenia:
         liczba ma się zgadzać z tym, co pokazuje sejm, i zmieniać dopiero po urnach -->
    <div class="rs" title="Mandaty zdobyte w ostatnich wyborach. Zmienią się dopiero po następnych."><i class="ic ic-mandat" aria-hidden="true"></i><div class="rv"><b>${p.seats}</b><span>mandaty</span></div></div>
    ${(()=>{const kp=roster(p).reduce((a,n)=>a+kapPryw(n),0), z=G.zarobekOstatnio||0;
      return `<div class="rs tip">${mordedolar(19)}<div class="rv"><b>${kasaSkrot(kp)}</b><span>kapitał prywatny</span></div>
      ${(()=>{const h=(G.pkbHist||[]).map(x=>x.k).filter(x=>isFinite(x));
        return h.length>1?`<div class="iskrabox">${iskra(h,'var(--acc)')}
          <span>majątek zaplecza przez ${h.length} ${pl(h.length,'tydzień','tygodnie','tygodni')}</span></div>`:''})()}
      <div class="tipbox">
        <div style="font-family:var(--m);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--acc);margin-bottom:8px">Kieszenie zaplecza</div>
        ${roster(p).sort((a,b)=>kapPryw(b)-kapPryw(a)).slice(0,5).map(n=>
          `<div class="l"><span>${n}${isLead(p,n)?' · przewodnictwo':''}</span>
            <b>${mordedolar(11)} ${kasaSkrot(kapPryw(n))}</b></div>`).join('')}
        ${z?`<div class="l" style="border-top:1px solid var(--line);padding-top:6px;margin-top:6px">
          <span>Zarobek przewodniczącego w tygodniu</span><b style="color:var(--pos)">+${kasaSkrot(z)}</b></div>`:''}
        <div class="tot"><span>Razem</span><b class="m" style="color:var(--acc)">${mordedolar(13)} ${kasaSkrot(kp)}</b></div>
        <div style="color:var(--dim2);font-size:11.5px;margin-top:6px">Milion prywatnego majątku zamienisz
        na ${KAP_ZA_MLN} kapitału <b>Zrzutką z prywatnych kieszeni</b> — ale kto wyłoży, ten odchodzi.</div>
      </div></div>`})()}
    </div>
    ${streakBox()}
    <div class="hudend">
      <button class="sndbtn" onclick="toggleMute()" title="${G.mute?'Włącz dźwięk':'Wycisz'}">${G.mute?'♪̸':'♪'}</button>
      <div class="datechip" key="${G.term}-${G.week}"><b>${dateStr(gameDate())}</b><span>K${G.term} · tydzień ${G.week} z ${G.weeks}</span></div>
      <button class="btn g sm" onclick="openSave()" title="Zapis i wczytanie">Zapis</button>
      <!-- wyjście do menu siedziało wcześniej dopiero w oknie zapisu i nikt go tam nie szukał -->
      <button class="btn g sm" onclick="doLobby()" title="Wyjście do menu głównego">Menu</button>
      ${G.phase==='finalcamp'
        ? `<button class="btn tura" onclick="closeFinalCamp()">Otwieram urny →</button>`
        : `<button class="btn tura" onclick="endWeek()">${G.week>=G.weeks?'Do wyborów →':'Kolejny tydzień →'}</button>`}
    </div>
  </div>
  ${G.phase==='finalcamp'?campBar():''}
  ${sitBanner()}
  ${eraBanner()}
  ${G.tut?tutBox():''}
  ${G.prez2?`<div class="runoff">
    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
      <span class="pill roy">druga tura za ${Math.max(0,G.prez2.week-G.week)} ${pl(Math.max(0,G.prez2.week-G.week),'tydzień','tygodnie','tygodni')}</span>
      ${G.prez2.r1.slice(0,2).map(x=>`<span class="nm">${ava(x.who,G.p[x.k].c,26)}<b>${x.who}</b>
        <span class="dim">${G.p[x.k].ab} ${fmt(x.pct)}%</span></span>`).join('<span class="dim">kontra</span>')}
      ${[G.prez2.r1[0].k,G.prez2.r1[1].k].includes(G.me)
        ? `<button class="btn sm" style="margin-left:auto" onclick="openPush()">Dorzuć do kampanii${G.prez2.spent?` (wydano ${G.prez2.spent})`:''}</button>`
        : '<span class="dim" style="margin-left:auto;font-size:12.5px">Nie ma cię w dogrywce.</span>'}
    </div></div>`:''}
  ${lukKadencji()}
  ${waznePasek()}
  <div class="nav">
    ${(()=>{const nv=[['mapa','Mapa okręgów'],['akcje','Decyzje'+(G.ap?`<span class="badge">${G.ap}</span>`:'')],
       ['lider','Lider'+(leads(G.p[G.me]).some(n=>xpOs(n)>=35)?'<span class="badge">!</span>':'')],['krol','Król'+(kingFav(G.me)<0?'<span class="badge">!</span>':'')],['partie','Partie'],['sondaz','Sondaż']];
      const mg=myGoals();
      if(mg.length)nv.push(['cele',(mg.length>1?'Cele partyjne':'Cel partyjny')+(goalReady()?'<span class="badge">!</span>':'')]);
      // urzędy mają własne działy zamiast kategorii schowanych w decyzjach
      if(isPM())nv.push(['premier','Premier'+(lawsPending()?'<span class="badge">!</span>':'')]);
      if(hasPrez())nv.push(['prezydent','Prezydent'+(lawsToSign().length?`<span class="badge">${lawsToSign().length}</span>`:'')]);
      nv.push(['sejm','Sejm i władza']);
      nv.push(['ekonomia','Ekonomia']);
      // Media stoją nad Sądem i widać je zawsze — bez ustawy po prostu nie da
      // się w nich niczego otworzyć, zamiast znikać z nawigacji bez słowa.
      // Sąd zszedł pod Sejm jako karta. Trzynaście działów na trzy akcje w tygodniu
      // to było za dużo: nowe systemy konkurowały nie o uwagę, tylko o te same ruchy.
      nv.push(['media','Media'+(mediaJest()?'':'<span class="badge wip">zamk.</span>')]);
      return nv.map(([k,n])=>`<button class="${G.tab===k?'on':''}" onclick="setTab('${k}')">${n}</button>`).join('')})()}
  </div>
  <div class="layout">
    <div style="display:flex;flex-direction:column;gap:14px">${sidebar(p,q)}</div>
    <div class="widok${G._we?' wejscie':''}" data-tab="${G.tab}">${G.tab==='mapa'?kurier()+mapTab(q,AL):G.tab==='akcje'?actTab():G.tab==='partie'?partieTab():G.tab==='sondaz'?pollTab(q,AL)
      :G.tab==='cele'?goalTab():G.tab==='lider'?leadTab():G.tab==='krol'?kingTab()
      :G.tab==='premier'?premierTab():G.tab==='prezydent'?prezydentTab()
      :G.tab==='ekonomia'?ekonomiaTab()
      :G.tab==='media'?mediaTab():sejmTab()+grupyTab()+sadTab()}</div>
  </div>`;
  G._we=0;
}
function radar(p){
  const AX=[['Sława',p.fame,'var(--acc)'],['Wiarygodność',p.cred,'var(--info)'],['Jedność',p.uni,'var(--pos)'],
    ['Aktywność',p.act,'#9b7fd4'],['Spokój',100-p.ctr,'var(--neg)'],['Przystępność',100-p.pret,'#d98b4a']];
  const cx=110,cy=98,R=72,N=AX.length;
  const pt=(i,r)=>{const a=-Math.PI/2+i*2*Math.PI/N;return [cx+r*Math.cos(a),cy+r*Math.sin(a)]};
  const poly=(f)=>AX.map((x,i)=>pt(i,R*cl(f===null?x[1]:f,0,100)/100).map(v=>v.toFixed(1)).join(',')).join(' ');
  const prev=G.prev?[G.prev.fame,G.prev.cred,G.prev.uni,G.prev.act,100-G.prev.ctr,100-G.prev.pret]:null;
  const prevPoly=prev?prev.map((v,i)=>pt(i,R*cl(v,0,100)/100).map(x=>x.toFixed(1)).join(',')).join(' '):null;
  return `<svg viewBox="0 0 220 200" class="radar">
    ${[25,50,75,100].map(r=>`<polygon points="${poly(r)}" fill="none" stroke="var(--line)" stroke-width="1" ${r===100?'stroke-opacity=".9"':'stroke-opacity=".45"'}/>`).join('')}
    ${AX.map((x,i)=>{const [ex,ey]=pt(i,R);return `<line x1="${cx}" y1="${cy}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}" stroke="var(--line)" stroke-width="1" stroke-opacity=".5"/>`}).join('')}
    ${prevPoly?`<polygon points="${prevPoly}" fill="none" stroke="var(--dim2)" stroke-width="1.2" stroke-dasharray="3 3" opacity=".7"/>`:''}
    <polygon points="${poly(null)}" fill="${p.c}" fill-opacity=".26" stroke="${p.c}" stroke-width="2" stroke-linejoin="round"/>
    ${AX.map((x,i)=>{const [px,py]=pt(i,R*cl(x[1],0,100)/100);
      return `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="3" fill="${x[2]}"/>`}).join('')}
    ${AX.map((x,i)=>{const [lx,ly]=pt(i,R+17);
      return `<text x="${lx.toFixed(1)}" y="${(ly+3).toFixed(1)}" text-anchor="${i===0||i===3?'middle':(lx>cx?'start':'end')}"
        font-size="9.5" font-family="ui-monospace,monospace" fill="var(--dim2)" letter-spacing=".04em">${x[0].toUpperCase()}</text>`}).join('')}
  </svg>`;
}
/* ---- zakładka „Partie” ----
   Jedno pytanie i jedna odpowiedź: kto siedzi w cudzych partiach. Własnej tu nie ma,
   bo jej skład widać w bocznej kolumnie, a wszystkie liczby o obcych — poparcie,
   mandaty, kondycję — pokazuje sondaż i sala sejmowa. Ta zakładka jest od nazwisk. */
function partieTab(){
  const obce=alive().filter(k=>k!==G.me)
    .sort((a,b)=>roster(G.p[b]).length-roster(G.p[a]).length);
  return `<div class="card"><div class="h"><h3>Zaplecza partii</h3>
    <span class="n">${obce.length} ${pl(obce.length,'partia','partie','partii')}</span></div>
    <div class="b">
    <div class="note" style="margin:0 0 14px">Kto realnie siedzi w cudzych partiach. Stąd bierzesz
    ludzi przy przekupywaniu działaczy i tu widać, kogo można komu podebrać.</div>
    ${obce.map(k=>{
      const p=G.p[k], sklad=roster(p);
      return `<div class="pzap">
        <div class="pzh">${crest(k,'s')}
          <div style="min-width:0"><b>${p.ab}</b>
            <span class="dim">${p.n}</span></div>
          <span class="pill">${sklad.length} ${pl(sklad.length,'osoba','osoby','osób')}</span>
        </div>
        <div class="benchgrid">
          ${sklad.map(n=>`<div class="bperson ${isLead(p,n)?'lead':''}" title="${esc(n)}${isLead(p,n)?' — przewodnictwo':''} — kapitał prywatny ${kasa(kapPryw(n))}${ranga(n)?' · '+ranga(n).n:''}">
            ${ava(n,p.c,34)}<span>${n}</span>
            <em class="kappryw">${mordedolar(11)} ${kasaSkrot(kapPryw(n))}</em>
            ${rangaOdznaka(n)}</div>`).join('')
            ||'<span class="dim">Nikogo poza przewodniczącym.</span>'}
        </div>
      </div>`}).join('')}
    </div></div>`;
}
/* ══════════ EKONOMIA — DZIAŁ NIEDOKOŃCZONY ══════════
   Szkielet, nie mechanika. Nic tu jeszcze nie wpływa na rozgrywkę: PKB stoi
   w miejscu, kapitał prywatny nikomu nie przybywa ani nie ubywa, a wszystkie
   przyciski w dziale są wyłączone. Chodzi o to, żeby liczby dało się zobaczyć
   i dopiero na nich zdecydować, jak to ma naprawdę działać.

   Otwarte pytanie, które trzeba rozstrzygnąć przed napisaniem reszty:
   skąd PKB ma brać wzrost i co dokładnie ma z nim robić ustawa podatkowa.  */
const PKB_START=51894432103;

/* Mordedolar — znak przy każdej kwocie w grze.
   Bierzemy obrazek z gra/obrazki/mordedolar.png. Dopóki pliku tam nie ma,
   przeglądarka odpala onerror i w to miejsce wchodzi rysowana sakiewka:
   wygląda podobnie, więc ekran nie czeka na plik, a po wrzuceniu grafiki
   nie trzeba zmieniać ani jednej linijki kodu. */
const MDOL_ZAPAS=`<svg viewBox="0 0 24 24" aria-hidden="true">
  <path d="M5.4 9.2c-1 1.5-1.6 3.2-1.6 5 0 4 3.6 7 8.2 7s8.2-3 8.2-7c0-1.8-.6-3.5-1.6-5z"
    fill="currentColor" opacity=".55"/>
  <path d="M8.4 9.2c-.5-1.1-.4-2.2.4-2.9.9-.8 2.3-.7 3.2.2.9-.9 2.3-1 3.2-.2.8.7.9 1.8.4 2.9"
    fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <ellipse cx="9.3" cy="17.4" rx="3.1" ry="1.15" fill="currentColor"/>
  <ellipse cx="9.3" cy="15.4" rx="3.1" ry="1.15" fill="currentColor"/>
  <ellipse cx="14.7" cy="16.6" rx="2.7" ry="1.05" fill="currentColor"/>
</svg>`;
/* O plik pytamy raz, przy starcie, i to poza drzewem strony — dzięki temu
   w samej grze nigdy nie ląduje obrazek, który się nie wczytał. Kiedy plik
   się pojawi, po pierwszym uruchomieniu gra przerysuje się już z nim. */
let MDOL_PLIK=false;
if(typeof Image!=='undefined'){
  const pr=new Image();
  pr.onload=()=>{MDOL_PLIK=true;try{render()}catch(e){}};
  pr.src='obrazki/mordedolar.png';
}
const mordedolar=(px)=>{const s=px||13;
  return `<span class="mdol" style="width:${s}px;height:${s}px" aria-hidden="true">${
    MDOL_PLIK?`<img src="obrazki/mordedolar.png" alt="" width="${s}" height="${s}">`
             :MDOL_ZAPAS}</span>`};

/* Duże liczby czyta się tylko z odstępami co trzy cyfry. */
const kasa=v=>Math.round(v||0).toString().replace(/\B(?=(\d{3})+(?!\d))/g,' ');
const kasaSkrot=v=>{v=Math.abs(v||0);
  return v>=1e9?(v/1e9).toFixed(2)+' mld':v>=1e6?(v/1e6).toFixed(1)+' mln':
         v>=1e3?(v/1e3).toFixed(1)+' tys.':Math.round(v)+''};

/* Kapitał prywatny liczymy raz na osobę i zapamiętujemy w stanie gry, żeby
   nie skakał przy każdym rysowaniu.

   Rozrzut ma być brutalny, bo na nim stoi cały spór podatkowy. Decyduje przede
   wszystkim to, kim ktoś jest na serwerze: przewodniczący partii obraca
   milionami, ktoś z dalekiego zaplecza tysiącami, a bezpartyjny grosikami.
   Do tego dochodzi autorytet i kompetencja, które podbijają wynik stromo, więc
   najbardziej znani wychodzą daleko przed resztę własnej półki. */
/* Majątek nie wynika ze statystyk, tylko z tego, kim ktoś jest na serwerze.
   Statystyki dawały płaską drabinkę, na której każdy lider był bogaty i każdy
   z zaplecza biedny — a tak to nie wygląda. Dlatego półki są wpisane wprost:
   trzy wielkie fortuny, kilka średnich, reszta liderów skromnie, zaplecze
   w tysiącach, bezpartyjni na dnie. */
const KAP_OSOBY={
  // trzy fortuny, które same robią ponad połowę majątku serwera
  'Bartek':230e6, 'Tortex':185e6, 'loof':150e6,
  // zaplecze, które ma więcej niż niejeden lider
  'kenzo':96e6, 'Supernes':54e6, 'Mnem':38e6, 'Aryati':44e6,
  // liderzy bez fortuny — kilkanaście milionów i tyle
  'Kromka':7.4e6, 'Vengeance':11e6, 'Maciek':9.2e6, 'impir':6.8e6, 'inwid':6.1e6,
  'Fazmiś':13e6, 'Kaziu':4.9e6, 'Sulejman':3.6e6, 'Peterdeus':12e6, 'Lager':10.5e6,
};
const KAP_POLKA={lider:14e6, glowny:2.2e6, zaplecze:52e3, wolny:2600};
function rolaOsoby(n){
  if(!G||!G.p)return 'wolny';
  for(const k of alive()){
    const p=G.p[k];
    if(isLead(p,n))return 'lider';
    if((p.main||[]).includes(n))return 'glowny';
    if((p.bench||[]).includes(n))return 'zaplecze';
  }
  return 'wolny';
}
function kapPryw(n){
  if(!G||!n)return 0;
  if(!G.kapPryw)G.kapPryw={};
  if(G.kapPryw[n]===undefined){
    if(KAP_OSOBY[n]!==undefined){
      // nazwiskom z listy dokładamy tylko drobny rozrzut, żeby nie były co do złotówki równe
      let z=0; for(let i=0;i<n.length;i++)z=(z*31+n.charCodeAt(i))%1000;
      G.kapPryw[n]=Math.round(KAP_OSOBY[n]*(.92+z/1000*.16));
    }else{
      const x=L(n);
      let z=0; for(let i=0;i<n.length;i++)z=(z*31+n.charCodeAt(i))%100000;
      const rozrzut=.45+(z%1000)/1000*1.3;
      const renoma=Math.pow(1+(x.autor*.55+x.komp*.45)/100,1.9);
      G.kapPryw[n]=Math.round(KAP_POLKA[rolaOsoby(n)]*renoma*rozrzut);
    }
  }
  return G.kapPryw[n];
}

/* ── PKB ──
   PKB nie jest osobną liczbą żyjącą własnym życiem, tylko wyliczeniem z majątku:

       PKB = suma kapitału prywatnego × mnożnik obrotu

   Dzięki temu pojedyncze konta mogą stać w milionach, a PKB i tak wychodzi
   w miliardach — i wszystko, co rusza majątkiem, od razu widać na PKB.

   Mnożnik nie jest stały. Mówi, ile razy w roku te same pieniądze zmienią
   właściciela, a to zależy od tego, jak rządzona jest gospodarka:
     • kompetencja ministra finansów — kto liczy, ten nie gubi,
     • kompetencja premiera — rząd bez głowy dławi obrót,
     • stabilność — awantury i brak rządu zatrzymują pieniądze w kieszeni,
     • zaufanie przedsiębiorców — rośnie przy niskich podatkach, siada przy wysokich,
     • inwestycje — aktywne partie ciągną serwer do przodu.

   Sam majątek też się rusza: bez podatku rośnie żwawo, przy wysokim maleje.
   Stąd dylemat, o który chodzi — podatek daje pieniądze teraz, ale zjada
   i majątek, i mnożnik, więc PKB leci w dół z dwóch stron naraz. */
const PKB_MNOZNIK_BAZA=80;
const stawkaMajatkowa=()=>{const pod=G&&G.law&&typeof G.law.podatki==='object'?G.law.podatki:null;
  return pod&&pod.majatek>0?pod.majatek:0};
const progresjaWlaczona=()=>{const pod=G&&G.law&&typeof G.law.podatki==='object'?G.law.podatki:null;
  return !!(pod&&pod.progresja>0)};

/* Kto pilnuje kasy państwa. Bez obsadzonego resortu liczy się sam premier. */
function ministerFinansow(){
  if(!G||!G.rada)return null;
  const r=RESORTY.find(x=>/finans|gospod|skarb/i.test(x.n||x.id));
  return r?(G.rada[r.id]||null):null;
}
function pkbCzynniki(){
  const ps=alive().map(k=>G.p[k]);
  const akt=ps.length?ps.reduce((a,p)=>a+p.act,0)/ps.length:45;
  const ktr=ps.length?ps.reduce((a,p)=>a+p.ctr,0)/ps.length:40;
  const mf=ministerFinansow(), pm=G.gov&&G.gov.pm?(G.gov.pmLead||G.p[G.gov.pm].lead):null;
  const kompMF=mf?L(mf).komp:45;
  const kompPM=pm?L(pm).komp:40;
  const st=stawkaMajatkowa();
  /* Progi są celowo wymagające: gospodarka ma być czymś, co trzeba wypracować,
     a nie stanem domyślnym. Stabilność wychodzi na plus dopiero, gdy średnia
     kontrowersja spadnie poniżej 40, a inwestycje dopiero powyżej 50 aktywności.
     Wcześniej obie siedziały na 45, czyli mniej więcej tam, gdzie serwer stoi
     sam z siebie, i wszystko było na plusie bez żadnego wysiłku. */
  const stab=40, inw=50;
  return [
   {n:'Minister finansów', v:(kompMF-55)*.20, o:mf?`${mf}, kompetencja ${kompMF}`:'wakat na resorcie'},
   {n:'Premier',           v:(kompPM-55)*.14, o:pm?`${pm}, kompetencja ${kompPM}`:'brak rządu'},
   {n:'Stabilność',        v:(stab-ktr)*.34+(G.gov&&G.pmOk?4:-9),
    o:`kontrowersja ${Math.round(ktr)} z ${stab} progu${G.gov&&G.pmOk?', rząd stoi':', rządu nie ma'}`},
   {n:'Inwestycje',        v:(akt-inw)*.30, o:`aktywność ${Math.round(akt)} z ${inw} progu`},
   {n:'Zadowolenie ludzi', v:9-st*2.4, o:st?`podatek ${st}%`:'podatku od majątku nie ma'},
   {n:'Poparcie rządu',    v:G.gov?(G.gov.appr-50)*.22:-7,
    o:G.gov?`rząd ma ${Math.round(G.gov.appr)} poparcia`:'nie ma rządu, nie ma zaufania'},
  ];
}
const pkbMnoznik=()=>{
  const suma=pkbCzynniki().reduce((a,x)=>a+x.v,0);
  return Math.max(28,Math.min(140,PKB_MNOZNIK_BAZA+suma));
};
const pkbLicz=()=>Math.round(kapPrywRazem()*pkbMnoznik());

/* ── rangi ──
   Kamienie milowe majątku. Przekroczenie progu kosztuje dokładnie tyle, ile ten
   próg wynosi — wykupujesz się na wyższą półkę — ale od tej pory zarabiasz
   więcej, wprost proporcjonalnie do zdobytej rangi. Raz zdobyta nie przepada,
   nawet gdy majątek potem spadnie.

   Kto wchodzi do gry z gotowym majątkiem, ten rangi ma już nadane i za nic nie
   płaci: loof ze 150 mln jest Księciem i zbiera na Wielkiego Księcia, a mentos
   z 59 tys. nie ma żadnej i idzie na Sira. */
const RANGI=[
 {n:'Sir',            prog:1e6,    e:'🎖️'},
 {n:'Szlachcic',      prog:2.5e6,  e:'🛡️'},
 {n:'Hrabia',         prog:5e6,    e:'⚜️'},
 {n:'Lord',           prog:10e6,   e:'🏵️'},
 {n:'Wasal',          prog:15e6,   e:'🗝️'},
 {n:'Baron',          prog:25e6,   e:'🏰'},
 {n:'Palatyn',        prog:37.5e6, e:'⚔️'},
 {n:'Markiz',         prog:55e6,   e:'👑'},
 {n:'Margrabia',      prog:70e6,   e:'🦅'},
 {n:'Magnat',         prog:100e6,  e:'💎'},
 {n:'Książę',         prog:150e6,  e:'🐉'},
 {n:'Wielki Książę',  prog:250e6,  e:'🌟'},
 {n:'Wielki Mistrz',  prog:350e6,  e:'🔱'},
 {n:'Kniaź',          prog:500e6,  e:'🦁'},
 {n:'Elektor',        prog:1e9,    e:'☀️'},
];
/* Symetria rang. Wcześniej wejście na każdy stopień kosztowało cały próg, więc
   na starcie połowa bogaczy wykupywała się na wyższe półki naraz — z gospodarki
   znikały setki milionów, PKB leciało w dół, a premier obrywał absolutorium za
   coś, na co nie miał wpływu.

   Teraz jest odwrotnie i tak, jak być powinno: niskie rangi są tanie i wpadają
   same, wysokie kosztują coraz dotkliwiej i wymagają zapasu ponad sam próg.
   Sir to sześć procent progu, Elektor sześćdziesiąt — i do tego trzeba mieć
   siedemdziesiąt procent więcej, niż wynosi jego kamień milowy. */
const rangaUdzial=i=>.06+i/(RANGI.length-1)*.54;
const rangaWymog=i=>Math.round(RANGI[i].prog*(1+i*.05));
const rangaKoszt=i=>Math.round(RANGI[i].prog*rangaUdzial(i));
const rangaNr=n=>(G&&G.rangi&&G.rangi[n]!==undefined)?G.rangi[n]:-1;
const ranga=n=>{const i=rangaNr(n);return i>=0?RANGI[i]:null};
const nastepnaRanga=n=>RANGI[rangaNr(n)+1]||null;
/* Zarobek rośnie z rangą wprost proporcjonalnie: każdy stopień to +18%. */
const mnoznikRangi=n=>1+(rangaNr(n)+1)*.18;

/* Nadanie rang na starcie — z majątku, jaki ktoś już ma, i bez żadnego kosztu. */
function rangiStart(){
  G.rangi={};
  wszyscyZaplecze().forEach(n=>{
    const v=kapPryw(n);
    let i=-1; RANGI.forEach((r,j)=>{if(v>=r.prog)i=j});
    if(i>=0)G.rangi[n]=i;
  });
}
/* Awans w trakcie gry: próg trzeba przekroczyć i zapłacić za wejście. */
function sprawdzRangi(){
  if(!G.rangi)rangiStart();
  wszyscyZaplecze().forEach(n=>{
    let i=rangaNr(n)+1;
    // jeden awans na sprawdzenie: wyższe stopnie mają boleć, nie sypać się seriami
    if(i<RANGI.length&&kapPryw(n)>=rangaWymog(i)){
      const koszt=rangaKoszt(i);
      G.rangi[n]=i;
      G.kapPryw[n]=Math.max(1000,Math.round(kapPryw(n)-koszt));
      if(n===me().lead)
        say(`<b>${n} zostaje ${RANGI[i].n}.</b> Wpisowe ${kasaSkrot(koszt)}, `
           +`za to zarobek rośnie do ${mnoznikRangi(n).toFixed(2)}× podstawy.`,'roy');
    }
  });
}
const rangaOdznaka=n=>{const r=ranga(n);
  return r?`<span class="ranga" title="${r.n} — kamień milowy ${kasaSkrot(r.prog)}">${r.e} ${r.n}</span>`:''};

/* ── zarobek przewodniczącego ──
   Lider partii dorabia się na swojej pozycji: im wyżej stoi i im głośniej o nim
   na serwerze, tym więcej mu wpada. Urzędy płacą najlepiej — premier obraca
   cudzymi pieniędzmi i część z tego zostaje przy nim. Kontrowersja działa
   odwrotnie: nikt nie robi interesów z kimś, kto co tydzień jest w awanturze. */
function zarobekLidera(k){
  const p=G.p[k]; if(!p||p.dead)return 0;
  const ld=lead(k);
  /* Przewodniczący dorabia się na POZYCJI, a nie na rozgłosie: autorytet
     i mandaty ważą tu najwięcej, sława zostaje dodatkiem. */
  const baza=90e3+p.fame*3e3+ld.autor*13e3+p.seats*26e3;
  const urzad=(G.gov&&G.gov.pm===k?2.1:1)*(G.gov&&G.gov.parties&&G.gov.parties.includes(k)?1.35:1)
    *(G.prez&&G.prez.party===k?1.4:1);
  const wstyd=cl(1-p.ctr/170,.28,1);
  const rynek=1+(pkbMnoznik()-PKB_MNOZNIK_BAZA)/260;   // dobra gospodarka podnosi wszystkich
  return Math.round(baza*urzad*wstyd*rynek*mnoznikRangi(ld.n||p.lead));
}
function zarobekTydzien(){
  alive().forEach(k=>{
    const kto=G.p[k].lead; if(!kto)return;
    const z=zarobekLidera(k); if(z<=0)return;
    G.kapPryw[kto]=(G.kapPryw[kto]!==undefined?G.kapPryw[kto]:kapPryw(kto))+z;
    if(k===G.me)G.zarobekOstatnio=z;
  });
}

/* Tygodniowy ruch gospodarki: fiskus strzyże konta, majątek sam z siebie
   rośnie albo maleje, a PKB przelicza się z tego, co zostało. */
function pkbTydzien(){
  if(!G)return;
  if(!G.kapPryw)G.kapPryw={};
  zarobekTydzien();                  // najpierw przewodniczący zarabiają, potem fiskus
  const st=stawkaMajatkowa(), prog=progresjaWlaczona();
  const d=podzialMajatku();
  let wplyw=0;
  /* Majątek rośnie sam, bo ludzie coś na tym serwerze robią, ale tempo jest
     REGRESYWNE: mała kieszeń rośnie szybko w procentach, wielka ledwie drga.

     Wcześniej wszyscy mieli tę samą stawkę, więc pół procenta od dwustu
     milionów dawało co tydzień więcej, niż ktoś z tysiącami widział przez całą
     kadencję — przepaść pogłębiała się sama i nikt z dołu nigdy nie ruszał
     z miejsca. Teraz sześćdziesiąt tysięcy rośnie po jakieś 6% tygodniowo,
     dziesięć milionów po 1%, a ćwierć miliarda po jakieś 0,2%. Dogonić da się
     tylko na początku — i o to chodzi.

     Podatek zjada ten wzrost tak samo u wszystkich, więc przy wysokiej stawce
     najpierw pod kreską lądują ci, którzy rosną najwolniej: najbogatsi. */
  const tempoMajatku=v=>Math.max(.0010,.075*Math.pow(4e5/(4e5+Math.max(0,v)),.55));
  d.lu.forEach(({n,v})=>{
    let nowe=v*(1+tempoMajatku(v)-st*.0011);
    if(st>0){
      // progresja decyduje, kogo to naprawdę boli
      const mnoz=prog?(v>=d.sr?1.7:.3):1;
      const pobrane=Math.round(v*(st/100)*mnoz/12);       // stawka jest roczna
      nowe-=pobrane; wplyw+=pobrane;
    }
    // dług nie „rośnie" sam ku dodatnim — od tego jest dlugTydzien
    G.kapPryw[n]=v<0?Math.round(v):Math.max(1000,Math.round(nowe));
  });
  if(wplyw>0)G.skarb=(G.skarb||0)+wplyw;
  G.podatekOstatnio=wplyw;
  G.kapPop=d.suma;
  G.pkbPop=G.pkb||pkbLicz();
  G.pkb=pkbLicz();
  G.pkbTempo=G.pkbPop?(G.pkb-G.pkbPop)/G.pkbPop:0;
  grupyTydzien();                    // zadowolenie grup interesu i nastroje segmentów
  radykalowieTydzien();              // radykałowie szkodzą, lojaliści trzymają
  mediaTydzien();                    // wydawnictwa naliczają swoje koszty stałe
  dlugTydzien();                     // kto wszedł pod kreskę, ten zaczyna tonąć
  sprawdzRangi();                    // kto przekroczył próg, ten awansuje i płaci wpisowe
  pkbZapiszOdczyt();
}
/* ── absolutorium ──
   Na koniec kadencji premier odpowiada za gospodarkę. Jeśli PKB przez kadencję
   spadło, sejm nie udziela absolutorium: to nie jest wotum nieufności i nie
   przewraca rządu, ale zostaje na papierze i kosztuje. Kara jest wyraźna,
   a nie druzgocąca — zła gospodarka ma boleć, nie kończyć rozgrywki. */
function absolutorium(){
  if(!G||!G.gov||!G.pmOk)return;
  if(G.absolutorium&&G.absolutorium.term===G.term)return;   // raz na kadencję
  const h=(G.pkbHist||[]).filter(x=>x.t===G.term);
  if(h.length<2)return;
  const start=h[0].v, koniec=h[h.length-1].v;
  if(!start||!koniec)return;
  const zm=(koniec-start)/start*100;
  const pmK=G.gov.pm, pmP=G.p[pmK]; if(!pmP||pmP.dead)return;
  const szef=G.gov.pmLead||pmP.lead;
  const udzielone=zm>=0;
  const zmiany=[];
  if(udzielone){
    pmP.cred=cl(pmP.cred+4);pmP.fame=cl(pmP.fame+2);
    zmiany.push(['Wiarygodność',4],['Sława',2]);
  }else{
    // spadek: wszystko w dół, ale proporcjonalnie do tego, jak głęboko
    const s=Math.min(3.2,Math.abs(zm)/6);
    const d=[['Wiarygodność',-(3+s*2.4),'cred'],['Sława',-(2+s*1.6),'fame'],
             ['Jedność',-(2+s*2.0),'uni'],['Aktywność',-(1+s*1.4),'act'],
             ['Kontrowersja',(3+s*2.8),'ctr']];
    d.forEach(([n,v,k])=>{const w=Math.round(v);pmP[k]=cl(pmP[k]+w);zmiany.push([n,w])});
    G.gov.appr=cl(G.gov.appr-Math.round(4+s*3));
    zmiany.push(['Poparcie rządu',-Math.round(4+s*3)]);
  }
  G.absolutorium={term:G.term,zm,udzielone,pm:pmK,szef,start,koniec,zmiany};
  say(pmK===G.me
    ?(udzielone?`<b>Sejm udzielił absolutorium.</b> PKB przez kadencję ${G.term} urosło o ${zm.toFixed(1)}%.`
              :`<b>Sejm odmówił absolutorium.</b> PKB spadło o ${Math.abs(zm).toFixed(1)}%, ${szef} obrywa za gospodarkę.`)
    :`<b>${G.p[pmK].ab}: ${udzielone?'absolutorium udzielone':'absolutorium odmówione'}.</b> PKB ${zm>=0?'urosło':'spadło'} o ${Math.abs(zm).toFixed(1)}%.`,
    udzielone?'good':'bad');
  if(typeof document!=='undefined')setTimeout(oknoAbsolutorium,60);
}
/* Tabela rozliczenia — jedyny wyskok dwunastego tygodnia. */
function oknoAbsolutorium(){
  const a=G&&G.absolutorium; if(!a||a.pokazane)return;
  a.pokazane=1;
  const wiersz=([n,v])=>`<tr><td>${n}</td>
    <td class="${v>0?'ok':v<0?'bad':''}">${v>0?'+':''}${v}</td></tr>`;
  modal('Sejm · koniec kadencji '+a.term,
    a.udzielone?'Absolutorium udzielone':'Absolutorium odmówione',
    `<div class="absopl ${a.udzielone?'ok':'no'}">
       <div class="absznak">${a.udzielone?'✓':'✕'}</div>
       <div><b>${a.szef}</b><span>premier rozliczony z gospodarki</span></div>
     </div>
     <table class="abstab">
       <tr><th>PKB na starcie kadencji</th><td>${kasa(a.start)}</td></tr>
       <tr><th>PKB na koniec</th><td>${kasa(a.koniec)}</td></tr>
       <tr class="absrazem"><th>Zmiana</th>
         <td class="${a.zm>=0?'ok':'bad'}">${a.zm>=0?'+':''}${a.zm.toFixed(2)}%</td></tr>
     </table>
     <div class="absnag">Co z tego wynika dla premiera</div>
     <table class="abstab">${a.zmiany.map(wiersz).join('')}</table>
     <p class="dim" style="font-size:12.5px;margin-top:12px">${a.udzielone
       ? 'Gospodarka urosła, więc sejm nie ma się do czego przyczepić.'
       : 'To nie jest wotum nieufności — rząd stoi dalej. Ale zostaje na papierze i widać to na wszystkim.'}</p>`,
    [{l:'Przyjmuję do wiadomości',f:()=>{close();render()}}]);
}

/* Jeden odczyt na tydzień, bez duplikatów — dopisuje i koniec tygodnia,
   i pierwsze wejście w dział Ekonomia, więc musi się pilnować sam. */
function pkbZapiszOdczyt(){
  if(!G)return;
  if(!G.pkbHist)G.pkbHist=[];
  const ost=G.pkbHist[G.pkbHist.length-1];
  if(ost&&ost.t===G.term&&ost.w===G.week){ost.v=G.pkb;ost.k=kapPrywRazem();return}
  G.pkbHist.push({t:G.term,w:G.week,v:G.pkb,k:kapPrywRazem()});
  if(G.pkbHist.length>36)G.pkbHist.shift();
}

/* Wykres PKB. Rysowany ścieżką SVG, bo to jedna linia i nie ma po co
   ściągać biblioteki. Skala pionowa jest przycięta do zakresu danych —
   przy wzroście rzędu procenta linia od zera byłaby płaska jak stół. */
function pkbWykres(){
  const surowe=(G.pkbHist||[]).slice(-24);
  if(!surowe.length)return '';
  /* Przy jednym odczycie rysujemy go jako prostą kreskę zamiast chować wykres.
     Gracz wchodzi w Ekonomię w pierwszym tygodniu i ma zobaczyć wykres, a nie
     zdanie o tym, że wykresu jeszcze nie ma. */
  const h=surowe.length===1?[surowe[0],surowe[0]]:surowe;
  const W=680,H=150,pad=6;
  const vs=h.map(x=>x.v), min=Math.min(...vs), max=Math.max(...vs);
  const roz=max-min;
  const x=i=>pad+i/(h.length-1)*(W-pad*2);
  const y=v=>roz<=0?H/2:H-pad-(v-min)/roz*(H-pad*2);
  const linia=h.map((p,i)=>`${i?'L':'M'}${x(i).toFixed(1)} ${y(p.v).toFixed(1)}`).join(' ');
  const pole=`${linia} L${x(h.length-1).toFixed(1)} ${H} L${x(0).toFixed(1)} ${H} Z`;
  const rosnie=h[h.length-1].v>=h[0].v;
  const zm=(h[h.length-1].v-h[0].v)/Math.max(1,h[0].v)*100;
  return `<div class="pkbwyk">
    <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img"
      aria-label="Wykres PKB z ostatnich ${h.length} tygodni">
      <defs><linearGradient id="pkbgrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${rosnie?'#7cb463':'#d1554a'}" stop-opacity=".34"/>
        <stop offset="100%" stop-color="${rosnie?'#7cb463':'#d1554a'}" stop-opacity="0"/>
      </linearGradient></defs>
      <path d="${pole}" fill="url(#pkbgrad)"/>
      <path d="${linia}" fill="none" stroke="${rosnie?'var(--pos)':'var(--neg)'}"
        stroke-width="2" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>
      <circle cx="${x(h.length-1).toFixed(1)}" cy="${y(h[h.length-1].v).toFixed(1)}" r="3.5"
        fill="${rosnie?'var(--pos)':'var(--neg)'}"/>
    </svg>
    <div class="pkbwyko">
      <span>${kasaSkrot(min)}</span>
      <b class="${rosnie?'up':'dn'}">${surowe.length===1?'pierwszy odczyt'
        :`${zm>0?'+':''}${zm.toFixed(1)}% przez ${surowe.length} ${pl(surowe.length,'tydzień','tygodnie','tygodni')}`}</b>
      <span>${kasaSkrot(max)}</span>
    </div></div>`;
}
/* Bezpartyjni też mają kieszenie — i to najpłytsze ze wszystkich. Bez nich
   zestawienie majątków pokazywałoby wyłącznie tych, którzy już się gdzieś
   ustawili, a cały dół drabiny by z niego wypadł. */
const wszyscyZaplecze=()=>[...new Set(
  alive().flatMap(k=>roster(G.p[k])).concat(AGENTS.map(a=>a.n)))].filter(Boolean);
const kapPrywRazem=()=>wszyscyZaplecze().reduce((a,n)=>a+kapPryw(n),0);
/* Próg „bogatego" stawiamy na średniej — powyżej niej jest garstka, poniżej reszta.
   Dokładnie ten podział ma być stawką ustawy podatkowej. */
function podzialMajatku(){
  const lu=wszyscyZaplecze().map(n=>({n,v:kapPryw(n)})).sort((a,b)=>b.v-a.v);
  const suma=lu.reduce((a,x)=>a+x.v,0), sr=lu.length?suma/lu.length:0;
  const bogaci=lu.filter(x=>x.v>=sr), biedni=lu.filter(x=>x.v<sr);
  return {lu,suma,sr,bogaci,biedni};
}

/* ── zamiana kapitału prywatnego na partyjny ──
   Milion prywatnego majątku to jeden punkt kapitału partii. Wygląda na darmowe
   pieniądze, więc musi mieć cenę, której nie da się obejść: kto wyłożył swoje,
   ten wychodzi z partii, a reszta składu to widzi i jedność siada. Im grubszy
   portfel wydoisz, tym większa dziura po nim zostaje. */
const KAP_ZA_MLN=1;
const zrzutkaDaje=n=>Math.floor(kapPryw(n)/1e6*KAP_ZA_MLN);
function zrzutkaKoszt(n){
  const kp=zrzutkaDaje(n);
  return {kp, uni:Math.round(cl(4+kp*.22,4,34)), ctr:Math.round(cl(2+kp*.10,2,16))};
}
function openZrzutka(){
  if(PROBA)return;
  close();
  const p=me();
  // przewodniczący nie wychodzi z własnej partii, więc jego kieszeń jest poza zasięgiem
  const lista=roster(p).filter(n=>!isLead(p,n)).sort((a,b)=>kapPryw(b)-kapPryw(a));
  if(!lista.length)return modal('Zrzutka','Nie masz kogo prosić',
    `<p>W partii nie ma nikogo poza przewodnictwem, a przewodniczący nie wypisze się sam z siebie.</p>`,
    [{l:'Trudno',f:actBack}],actBack);
  const razem=lista.reduce((a,n)=>a+kapPryw(n),0);
  modal('Zrzutka','Kto wyłoży własne pieniądze',
    `<p>Zaplecze ${p.ab} trzyma razem <b>${kasa(razem)}</b> prywatnego majątku.
     Każdy <b>milion</b> zamienia się na <b>${KAP_ZA_MLN}</b> kapitału partii.</p>
     <p class="dim" style="font-size:13px">Kto wyłoży, ten odchodzi — nikt nie oddaje
     dorobku życia i zostaje jakby nigdy nic. Jedność spada tym mocniej, im większa suma.</p>`,
    lista.slice(0,7).map(n=>{const k=zrzutkaKoszt(n);
      return {l:`${n} — ${kasaSkrot(kapPryw(n))}`,
        s:k.kp?`daje ${k.kp} kapitału · jedność −${k.uni} · kontrowersja +${k.ctr} · odchodzi z partii`
              :'ma za mało, żeby cokolwiek z tego wyszło',
        dis:!k.kp, f:()=>zrzutkaWez(n)}})
      .concat([{l:'Nikogo nie proszę',s:'Nie tracisz akcji ani energii',f:actBack}]),
    actBack);
}
function zrzutkaWez(n){
  const p=me(), k=zrzutkaKoszt(n);
  if(!k.kp)return;
  G.kp+=k.kp; p.uni=cl(p.uni-k.uni); p.ctr=cl(p.ctr+k.ctr);
  G.kapPryw[n]=Math.max(1000,Math.round(kapPryw(n)*.06));   // zostaje mu ledwie co
  p.bench=p.bench.filter(x=>x!==n); p.main=p.main.filter(x=>x!==n);
  M(p,-3);
  G.lastCharge=null;                                        // zrzutka doszła do skutku
  stolZatwierdz();
  say(`<b>${n} wyłożył własne pieniądze.</b> Partia dostaje ${k.kp} kapitału, `
     +`ale ${n} odchodzi, a jedność leci o ${k.uni} w dół.`,'bad');
  close();
  modal('Zrzutka','Pieniądze są, człowieka nie ma',
    `<p><b>${n}</b> przelał, co miał: <b>+${k.kp}</b> kapitału.</p>
     <p style="margin-top:10px">Jedność <b>−${k.uni}</b>, kontrowersja <b>+${k.ctr}</b>,
     a ${n} wypisał się z ${p.ab} tego samego dnia.</p>`,
    [{l:'Rozumiem',f:()=>{close();render()}}]);
}
/* ── boty w gospodarce ──
   Do tej pory nowe systemy były wyłącznie twoje: boty nie zakładały mediów,
   nie wydawały numerów i nie miały z gospodarki nic. Twoja przewaga rosła sama,
   bo nikt inny nawet nie próbował. Teraz partie prowadzone przez komputer robią
   to samo co ty — kupują wydawnictwa, kiedy je na to stać, i regularnie z nich
   wydają, więc ich zasięg też wchodzi do sondażu. */
function aiMedia(k){
  if(!mediaJest())return;
  if(!G.aiMedia)G.aiMedia={};
  if(!G.aiMedia[k])G.aiMedia[k]=[];
  const p=G.p[k]; if(!p||p.dead)return;
  const szef=p.lead, maj=kapPryw(szef), moje=G.aiMedia[k];
  // zakup: rzadko i tylko wtedy, gdy zostaje wyraźny zapas
  if(moje.length<3&&ch(.42)){
    const chce=Object.keys(MEDIA_TYP)
      .filter(t=>maj>MEDIA_TYP[t].koszt*1.5&&!moje.some(m=>m.typ===t))
      .sort((a,b)=>MEDIA_TYP[b].koszt-MEDIA_TYP[a].koszt)[0];
    if(chce){
      G.kapPryw[szef]=Math.round(maj-MEDIA_TYP[chce].koszt);
      moje.push({typ:chce,nazwa:`${p.ab} ${MEDIA_TYP[chce].e}`,szef,bilans:0,staz:0,ostatnieWyd:absWeek()});
      say(`<b>${p.ab} zakłada ${MEDIA_TYP[chce].n.toLowerCase()}.</b> ${szef} wyłożył ${kasaSkrot(MEDIA_TYP[chce].koszt)}.`,'');
    }
  }
  // wydawanie: bot pilnuje swoich terminów tak samo jak gracz
  moje.forEach(m=>{
    m.staz=(m.staz||0)+1;
    if(absWeek()-(m.ostatnieWyd||-99)<MEDIA_PRZERWA[m.typ])return;
    if(!ch(.7))return;
    const ld=L(m.szef)||{komp:50,char:50};
    const skala={gazeta:.9,tv:1.6,kino:1.9}[m.typ]||1;
    const zysk=Math.round((p.cred*.5+p.act*.4+ld.komp*.3-18)*skala*22000*R(.7,1.3));
    m.bilans+=zysk; m.ostatnieWyd=absWeek();
    G.kapPryw[m.szef]=Math.round((G.kapPryw[m.szef]!==undefined?G.kapPryw[m.szef]:kapPryw(m.szef))+zysk);
  });
}

/* AI robi to samo, ale wyłącznie z rozpaczy — kiedy kasa jest pod kreską. */
function aiZrzutka(k){
  const p=G.p[k];
  if(!p||p.dead||(p.bank||0)>-6||!ch(.12))return;
  const kand=roster(p).filter(n=>!isLead(p,n)).sort((a,b)=>kapPryw(b)-kapPryw(a))[0];
  if(!kand)return;
  const kp=zrzutkaDaje(kand); if(kp<4)return;
  p.bank=(p.bank||0)+kp; p.uni=cl(p.uni-Math.round(cl(4+kp*.22,4,34)));
  G.kapPryw[kand]=Math.max(1000,Math.round(kapPryw(kand)*.06));
  p.bench=p.bench.filter(x=>x!==kand); p.main=p.main.filter(x=>x!==kand);
  say(`<b>${p.ab} sięgnął po prywatne pieniądze.</b> ${kand} wyłożył swoje i odszedł z partii.`,'bad');
}

function kapitalTab(){
  const p=me(), lista=roster(p).sort((a,b)=>kapPryw(b)-kapPryw(a));
  const razem=lista.reduce((a,n)=>a+kapPryw(n),0);
  const doWziecia=lista.filter(n=>!isLead(p,n)).reduce((a,n)=>a+zrzutkaDaje(n),0);
  return `<div class="card"><div class="h"><h3>Kapitał prywatny zaplecza</h3>
    <span class="n">${kasaSkrot(razem)} w ${lista.length} ${pl(lista.length,'kieszeni','kieszeniach','kieszeniach')}</span></div>
    <div class="b">
    <div class="tabliczki" style="margin:0 0 14px">
      <div><b>${kasaSkrot(razem)}</b><span>majątek zaplecza</span></div>
      <div><b>${doWziecia}</b><span>kapitału do wzięcia</span></div>
      <div><b>${KAP_ZA_MLN}</b><span>kapitał za milion</span></div>
    </div>
    <div class="ekolista">${lista.map((n,i)=>{const k=zrzutkaKoszt(n), szef=isLead(p,n);
      return `<div class="ekos ${szef?'szef':''}">
        <span class="ekopoz">${i+1}</span>${ava(n,p.c,26)}
        <span class="ekon">${n}${szef?' <em class="ekotag">przewodnictwo</em>':''}</span>
        <b class="ekow">${mordedolar(12)} ${kasaSkrot(kapPryw(n))}</b>
        <span class="ekodaje">${szef?'—':k.kp?`+${k.kp} kap.`:'za mało'}</span>
      </div>`}).join('')}</div>
    <div class="note" style="margin-top:12px">Zamiana idzie przez decyzję
      <b>Zrzutka z prywatnych kieszeni</b> w Organizacji. Milion majątku to
      ${KAP_ZA_MLN} kapitału, ale kto wyłoży, ten odchodzi z partii, a jedność siada
      tym mocniej, im grubszy portfel wydoisz. Przewodniczącego nie ruszysz.</div>
    </div></div>`;
}

/* ══════════ MEDIA ══════════
   Dział otwiera się dopiero po ustawie o mediach — bez niej nikt na serwerze
   nie ma prawa niczego wydawać. Wszystko kupuje się za prywatny majątek
   przewodniczącego, więc to jest to, na co się go zbiera.

   Trzy rodzaje wydawnictw, każdy z inną mechaniką:
     • gazeta  — żyje sama, zarabia na serduszkach, ale z niczego nie robi kokosów,
     • telewizja — zarabiasz na odcinkach, w których wybierasz, o czym mówić,
     • kino    — zarabiasz na filmach, a widownię ciągnie sława partii.
   Bilans każdego wydawnictwa liczy się osobno i widać go na wspólnej liście. */
const MEDIA_TYP={
  gazeta:{n:'Wydawnictwo gazetowe',koszt:500e3,e:'📰',
    d:'Tygodnik, który sam się utrzymuje. Serduszka czytelników to jego jedyny przychód: od dziesięciu wychodzi na plus, powyżej zaczyna zarabiać. Nie zbijesz na tym fortuny, ale pracuje bez ciebie.'},
  tv:{n:'Wydawnictwo telewizyjne',koszt:10e6,e:'📺',
    d:'Studio z anteną. Nagrywasz odcinki i sam wybierasz, o czym mówisz — filozoficznie, politycznie albo śmieciowo. Ile z tego wyjdzie, zależy od widowni, a widownię trzeba sobie wyrobić.'},
  kino:{n:'Wydawnictwo kinowe',koszt:20e6,e:'🎬',
    d:'Najdroższa zabawka na serwerze. Kręcisz filmy, a na seanse przychodzą ludzie — tym tłumniej, im głośniej o twojej partii.'},
};
const mediaInit=()=>{if(!G.media)G.media=[]};
/* ── zasięg ──
   Ile procent przewagi w sondażu daje własna prasa i antena. Liczy się nie sam
   fakt posiadania, tylko to, czy z wydawnictwa cokolwiek wychodzi: szyld, który
   nie wydał nic od miesiąca, nie dociera do nikogo. Zasięg wygasa sam, więc
   media trzeba karmić, a nie kupić raz i zapomnieć. */
const MEDIA_ZASIEG={gazeta:3.5,tv:7,kino:5};
function zasiegMediow(k){
  const kto=k||G.me;
  const lista=kto===G.me?(G.media||[]):((G.aiMedia&&G.aiMedia[kto])||[]);
  if(!lista.length)return 0;
  return lista.reduce((a,m)=>{
    const odKiedy=absWeek()-(m.ostatnieWyd!==undefined?m.ostatnieWyd:-99);
    const swiezosc=odKiedy<=1?1:odKiedy<=3?.6:odKiedy<=6?.25:0;
    return a+(MEDIA_ZASIEG[m.typ]||0)*swiezosc;
  },0);
}
const mediaJest=()=>lawDone('media');
const mediaMoje=()=>{mediaInit();return G.media};
const mediaBilans=()=>mediaMoje().reduce((a,m)=>a+m.bilans,0);

/* Serduszka gazety chodzą za sławą partii i kompetencją redaktora. */
/* Serduszka to nie popularność, tylko zaufanie: gazetę czyta się wtedy, gdy
   wierzy się w to, co pisze. Dlatego ciągnie z WIARYGODNOŚCI partii
   i kompetencji redaktora, a sława dokłada tu najmniej. Bez tego wszystkie
   cztery systemy jechały na samej sławie i optymalna gra sprowadzała się
   do podbijania jednego suwaka. */
function serduszka(m){
  // świeży szyld nie ma jeszcze czego lajkować — serduszka liczą się od numerów
  if(!m.numery)return 0;
  const p=me(), ld=L(m.szef)||{komp:50};
  return Math.max(0,Math.round(p.cred*.46+ld.komp*.22+(m.staz||0)*.5+p.fame*.08-14));
}
/* Ile serduszek zbierze NASTĘPNY numer — to jest prognoza, a nie stan konta. */
function serduszkaProg(m){
  const p=me(), ld=L(m.szef)||{komp:50};
  return Math.max(0,Math.round(p.cred*.46+ld.komp*.22+(m.staz||0)*.5+p.fame*.08-14));
}
/* Ile tygodni musi minąć między wydaniami. Gazeta wychodzi co dwa tygodnie,
   antena i ekran co tydzień — inaczej dałoby się klikać w kółko bez końca. */
const MEDIA_PRZERWA={gazeta:2,tv:1,kino:1};
const mediaGotowe=m=>absWeek()-(m.ostatnieWyd||-99)>=MEDIA_PRZERWA[m.typ];
const mediaZa=m=>Math.max(0,MEDIA_PRZERWA[m.typ]-(absWeek()-(m.ostatnieWyd||-99)));
/* Utrzymanie wydawnictwa. Wcześniej samo posiadanie nic nie kosztowało, więc
   media były darmową maszynką: kupujesz raz i tylko zbierasz. Teraz każdy szyld
   ma koszty stałe i płaci je przewodniczący ze swojej kieszeni — jeśli z niego
   nic nie wychodzi, po prostu topi pieniądze. */
const MEDIA_UTRZYMANIE={gazeta:35e3,tv:420e3,kino:700e3};
function mediaTydzien(){
  if(!G)return;
  mediaInit();
  if(!G.media.length)return;
  let koszt=0;
  G.media.forEach(m=>{m.staz=(m.staz||0)+1;koszt+=MEDIA_UTRZYMANIE[m.typ]||0;
    m.bilans-=MEDIA_UTRZYMANIE[m.typ]||0});
  if(koszt>0)kieszenSzefa(-koszt);
}
/* Wspólne wejście do kieszeni przewodniczącego — także pod kreskę. */
function kieszenSzefa(delta){
  const szef=me().lead; if(!szef)return 0;
  const teraz=(G.kapPryw[szef]!==undefined?G.kapPryw[szef]:kapPryw(szef));
  G.kapPryw[szef]=Math.round(teraz+delta);
  return G.kapPryw[szef];
}
/* ── dług i spirala ──
   Do tej pory gospodarki nie dało się przegrać: majątek miał sztywne dno,
   absolutorium bolało i tyle. Teraz kieszeń może zejść pod kreskę, a wtedy
   dług sam rośnie o odsetki, co tydzień odbiera wiarygodność i podbija
   kontrowersję, a przy dostatecznie głębokim dołku wierzyciele zabierają
   wydawnictwa. To jest ta spirala: im dłużej tkwisz, tym trudniej wyjść. */
const DLUG_ODSETKI=.09;
function dlugTydzien(){
  if(!G)return;
  const szef=me().lead; if(!szef)return;
  const stan=(G.kapPryw[szef]!==undefined?G.kapPryw[szef]:kapPryw(szef));
  if(stan>=0){G.dlugTygodni=0;return}
  const p=me();
  G.dlugTygodni=(G.dlugTygodni||0)+1;
  G.kapPryw[szef]=Math.round(stan*(1+DLUG_ODSETKI));      // dług rośnie sam
  const glebokosc=Math.min(4,Math.abs(stan)/8e6);
  p.cred=cl(p.cred-Math.round(2+glebokosc*1.6));
  p.ctr =cl(p.ctr +Math.round(3+glebokosc*2.2));
  p.uni =cl(p.uni -Math.round(1+glebokosc));
  say(`<b>${szef} tonie w długach.</b> Na koncie ${kasa(G.kapPryw[szef])}, `
     +`odsetki ${Math.round(DLUG_ODSETKI*100)}% tygodniowo. Wiarygodność w dół, kontrowersja w górę.`,'bad');
  /* Po trzech tygodniach pod kreską wierzyciele zabierają wydawnictwa — jedno
     po drugim, zaczynając od najdroższego. */
  if(G.dlugTygodni>=3&&(G.media||[]).length){
    const i=G.media.map((m,j)=>({j,c:MEDIA_TYP[m.typ].koszt})).sort((a,b)=>b.c-a.c)[0].j;
    const m=G.media[i];
    G.media.splice(i,1);
    G.kapPryw[szef]=Math.round(G.kapPryw[szef]+MEDIA_TYP[m.typ].koszt*.45);
    p.fame=cl(p.fame-4);
    say(`<b>Komornik zabiera ${m.nazwa}.</b> Wydawnictwo poszło za długi, `
       +`z licytacji wróciło ${kasaSkrot(MEDIA_TYP[m.typ].koszt*.45)}.`,'bad');
  }
}
function mediaKup(typ){
  const t=MEDIA_TYP[typ]; if(!t)return;
  mediaInit();
  const p=me(), szef=p.lead;
  // jedna redakcja każdego rodzaju — trzy szyldy naraz to już nie wybór, tylko lista zakupów
  if(G.media.some(m=>m.typ===typ))return;
  if(kapPryw(szef)<t.koszt)return;
  kieszenSzefa(-t.koszt);
  G.media.push({typ,nazwa:`${t.n.split(' ')[1]||'Wydawnictwo'} ${p.ab}`,szef,
                bilans:0,staz:0,serca:0,ostatnio:0,numery:0});
  say(`<b>${t.n}</b> ruszyło. ${szef} wyłożył ${kasaSkrot(t.koszt)}.`,'good');
  close();render();
}
function mediaNazwij(i){
  const m=mediaMoje()[i]; if(!m)return;
  /* Własne okno, bo modalName jest od bloków wyborczych i wymaga listy partii —
     podanie mu null wywracało się na pierwszym odwołaniu i nazwy nie dało się
     zmienić w ogóle. */
  close();
  const v=document.createElement('div');v.className='veil';v.id='veil';
  v.innerHTML=`<div class="mdl"><button class="mdlx" type="button" aria-label="Zamknij">×</button>
    <div class="h"><div class="k">${MEDIA_TYP[m.typ].n}</div><h2>Jak ma się nazywać?</h2></div>
    <div class="bd"><p>Pod tą nazwą wydawnictwo występuje na liście i w kronice.</p>
      <input class="inp" id="mn" maxlength="40" value="${esc(m.nazwa)}"></div>
    <div class="op"><button class="opt" id="mok"><b>Zatwierdzam</b><span>Nazwa wchodzi od zaraz</span></button></div></div>`;
  document.body.appendChild(v);
  const zapisz=()=>{const w=v.querySelector('#mn').value.trim();
    if(w)m.nazwa=w.slice(0,40); close(); render()};
  v.querySelector('#mok').onclick=zapisz;
  v.querySelector('#mn').onkeydown=e=>{if(e.key==='Enter')zapisz()};
  v.querySelector('.mdlx').onclick=()=>{close();render()};
  setTimeout(()=>{const inp=v.querySelector('#mn');if(inp){inp.focus();inp.select()}},30);
}
function mediaSzef(i){
  const m=mediaMoje()[i]; if(!m)return;
  const p=me();
  modal('Wydawnictwo','Kto to prowadzi',
    `<p>Redaktor odpowiada za to, jak wydawnictwo sobie radzi. Liczy się kompetencja.</p>`,
    roster(p).map(n=>({l:n,s:`kompetencja ${L(n).komp} · charyzma ${L(n).char}`,
      f:()=>{m.szef=n;close();render()}}))
      .concat([{l:'Zostawiam',f:close}]),close);
}
/* ── gazeta: numer ──
   Wydawnictwo to szyld, a nie jedna gazeta. Pod nim wychodzą kolejne numery,
   co dwa tygodnie, i każdy zbiera tyle serduszek, na ile stać twoją sławę.
   Od dziesięciu numer wychodzi na swoje, poniżej dokładasz do niego z kieszeni. */
function mediaNumer(i){
  const m=mediaMoje()[i]; if(!m||m.typ!=='gazeta'||!mediaGotowe(m))return;
  const p=me();
  const s=serduszkaProg(m)+RI(-3,3);
  const serca=Math.max(0,s);
  const zysk=Math.round((serca-10)*18000);
  m.bilans+=zysk; m.serca=serca; m.ostatnio=zysk;
  m.numery=(m.numery||0)+1; m.ostatnieWyd=absWeek();
  const szef=p.lead;
  kieszenSzefa(zysk);
  if(serca>=18)p.fame=cl(p.fame+1);
  say(`<b>${m.nazwa}</b> nr ${m.numery}: ${serca} ${pl(serca,'serduszko','serduszka','serduszek')}, `
     +`${zysk>=0?'zysk':'strata'} ${kasaSkrot(Math.abs(zysk))}.`,zysk>=0?'good':'bad');
  modal('Gazeta',`${m.nazwa} nr ${m.numery}`,
    `<div class="wypodsum">
       <div><b>${serca}</b><span>serduszek</span></div>
       <div><b>${zysk>=0?'+':'−'}${kasaSkrot(Math.abs(zysk))}</b><span>na tym numerze</span></div>
       <div><b>${kasaSkrot(m.bilans)}</b><span>bilans szyldu</span></div>
     </div>
     <p>${serca>=25?'Numer poszedł znakomicie — czytają cię nawet ci, którzy nie lubią.'
       :serca>=10?'Numer wyszedł na swoje.'
       :'Za mało serduszek, żeby to się spięło. Numer dokłada do interesu.'}</p>
     <p class="dim" style="font-size:12.5px;margin-top:10px">Serduszek przybywa razem ze sławą partii,
     kompetencją redaktora i stażem szyldu. Następny numer za dwa tygodnie.</p>`,
    [{l:'Dobrze',f:()=>{close();render()}}]);
}

/* ── telewizja: odcinek ── */
const TV_TEMAT=[
 {id:'filo',n:'Filozoficznie',d:'Rozmowa o niczym, ale z powagą. Elita to kupuje, reszta wyłącza.',
  w:{eli:1.9,int:1.1,ser:.25}},
 {id:'poli',n:'Politycznie',d:'O sejmie, rządzie i tym, kto komu podpadł. Bezpiecznie i przewidywalnie.',
  w:{eli:1.0,int:1.4,ser:.9}},
 {id:'smiec',n:'Śmieciowo',d:'Bez tematu, za to głośno. Ogląda to pół serwera i nikt się nie przyznaje.',
  w:{eli:.2,int:.7,ser:1.9}},
];
function mediaOdcinek(i){
  const m=mediaMoje()[i]; if(!m||m.typ!=='tv'||!mediaGotowe(m))return;
  const p=me();
  modal('Telewizja','O czym dziś mówisz',
    `<p>Widownia zależy od tego, kto ogląda ten serwer. Twoje dopasowanie do grup:
     elita ${p.aff.eli.toFixed(1)}, intelektualiści ${p.aff.int.toFixed(1)}, serwerowicze ${p.aff.ser.toFixed(1)}.</p>`,
    TV_TEMAT.map(t=>({l:t.n,s:t.d,f:()=>{close();mediaOdcinekGraj(i,t)}}))
      .concat([{l:'Dziś nie nagrywam',f:close}]),close);
}
function mediaOdcinekGraj(i,t){
  const m=mediaMoje()[i], p=me();
  // widownia: dopasowanie tematu do składu serwera razy sława i kompetencja prowadzącego
  let dop=0; SID.forEach(s=>dop+=segShare(s)*(t.w[s]||0)*p.aff[s]);
  const ld=L(m.szef)||{char:50,komp:50};
  /* Serwer ma 670 osób, a przed ekranem siada garstka — dwadzieścia osób przy
     jednym odcinku to na tym serwerze naprawdę dużo. Dlatego widownia liczy się
     w dziesiątkach, a nie w setkach, za to każdy widz jest sporo wart. */
  /* Antenę ogląda się wtedy, gdy coś się na niej dzieje — więc telewizja
     ciągnie z AKTYWNOŚCI partii i charyzmy prowadzącego, nie ze sławy. */
  const widz=Math.max(3,Math.round(dop*2.2*(1+p.act/95)*(1+ld.char/190)*R(.72,1.34)));
  const zysk=Math.round(widz*90000);
  m.bilans+=zysk; m.ostatnio=zysk; m.widz=widz; m.ostatnieWyd=absWeek();
  m.numery=(m.numery||0)+1;
  kieszenSzefa(zysk);
  p.fame=cl(p.fame+Math.min(4,widz/9));
  say(`<b>${m.nazwa}:</b> odcinek „${t.n}” obejrzało ${widz} osób. Wpływ ${kasaSkrot(zysk)}.`,'good');
  modal('Telewizja',m.nazwa,
    `<div class="wypodsum">
       <div><b>${widz}</b><span>widzów</span></div>
       <div><b>${kasaSkrot(zysk)}</b><span>wpływ</span></div>
       <div><b>${kasaSkrot(m.bilans)}</b><span>bilans wydawnictwa</span></div>
     </div>
     <p>Temat „${t.n}” ${dop>1.1?'trafił w to, co serwer akurat ogląda.'
       :dop>.6?'przeszedł bez emocji.':'nie zainteresował prawie nikogo.'}</p>`,
    [{l:'Dobrze',f:()=>{close();render()}}]);
}
/* ── kino: film ── */
const KINO_FILM=[
 {id:'dram',n:'Dramat serwerowy',mn:1.25,d:'Dwie godziny o tym, jak ktoś komuś nie odpisał na DM.'},
 {id:'akcja',n:'Film akcji',mn:1.0,d:'Wybuchy, pościgi i jeden bardzo zły admin.'},
 {id:'dok',n:'Dokument o serwerze',mn:.8,d:'Poważnie, rzetelnie i bez publiczności.'},
];
function mediaFilm(i){
  const m=mediaMoje()[i]; if(!m||m.typ!=='kino'||!mediaGotowe(m))return;
  modal('Kino','Co kręcisz',
    `<p>Na seanse przychodzi tym więcej ludzi, im głośniej o twojej partii.
     Twoja sława: <b>${Math.round(me().fame)}</b>.</p>`,
    KINO_FILM.map(f=>({l:f.n,s:f.d,f:()=>{close();mediaFilmGraj(i,f)}}))
      .concat([{l:'Nie kręcę',f:close}]),close);
}
function mediaFilmGraj(i,f){
  const m=mediaMoje()[i], p=me();
  const widz=Math.max(4,Math.round(p.fame*.30*f.mn*R(.7,1.4)));
  const zysk=Math.round(widz*110000);
  m.bilans+=zysk; m.ostatnio=zysk; m.widz=widz; m.ostatnieWyd=absWeek();
  m.numery=(m.numery||0)+1;
  kieszenSzefa(zysk);
  p.fame=cl(p.fame+Math.min(5,widz/11));
  say(`<b>${m.nazwa}:</b> „${f.n}” obejrzało ${widz} osób. Wpływ ${kasaSkrot(zysk)}.`,'good');
  modal('Kino',m.nazwa,
    `<div class="wypodsum">
       <div><b>${widz}</b><span>widzów</span></div>
       <div><b>${kasaSkrot(zysk)}</b><span>wpływ</span></div>
       <div><b>${kasaSkrot(m.bilans)}</b><span>bilans wydawnictwa</span></div>
     </div>
     <p>Na „${f.n}” przyszło ${widz} osób — tyle, ile dziś warta jest twoja sława.</p>`,
    [{l:'Dobrze',f:()=>{close();render()}}]);
}
function mediaTab(){
  const p=me(), szef=p.lead, maj=kapPryw(szef);
  if(!mediaJest())return `
    <div class="card"><div class="h"><h3>Media</h3><span class="n">zamknięte</span></div><div class="b">
      <p style="margin-top:0">Na serwerze nie wolno niczego wydawać, dopóki sejm nie uchwali
      <b>ustawy o mediach</b>. Bez niej nie ma gazet, telewizji ani kina.</p>
      <div class="note" style="margin:12px 0 0">Ustawę zgłasza premier albo minister
      <b>Kultury i Rozrywki</b>. Dopiero po niej ten dział się otwiera.</div>
    </div></div>`;
  const lista=mediaMoje();
  return `
  <div class="ekoblok">
    <div class="card"><div class="h"><h3>Twoje wydawnictwa</h3>
      <span class="n">${lista.length} · bilans ${kasaSkrot(mediaBilans())}</span></div><div class="b">
      <div class="tabliczki" style="margin:0 0 14px">
        <div><b>${lista.length}</b><span>${pl(lista.length,'wydawnictwo','wydawnictwa','wydawnictw')}</span></div>
        <div><b>${kasaSkrot(mediaBilans())}</b><span>bilans łączny</span></div>
        <div><b>${kasaSkrot(maj)}</b><span>kieszeń ${esc(szef)}</span></div>
      </div>
      ${lista.length?`<div class="ekolista">${lista
        .map((m,i)=>({m,i}))
        .sort((a,b)=>b.m.bilans-a.m.bilans)      // najbardziej dochodowe na wierzchu, deficytowe na dole
        .map(({m,i})=>{const t=MEDIA_TYP[m.typ];
        const gotowe=mediaGotowe(m), za=mediaZa(m);
        const akcja={gazeta:['mediaNumer','Wydaj numer'],tv:['mediaOdcinek','Nagraj odcinek'],
                     kino:['mediaFilm','Nakręć film']}[m.typ];
        return `<div class="ekos medw">
          <span class="mede">${t.e}</span>
          <span class="ekon">${esc(m.nazwa)}<em class="ekotag">${t.n} · ${esc(m.szef)}${
            m.numery?` · ${m.numery} ${m.typ==='gazeta'?pl(m.numery,'numer','numery','numerów')
              :pl(m.numery,'wydanie','wydania','wydań')}`:' · nic jeszcze nie wyszło'}</em></span>
          ${m.typ==='gazeta'
            ?`<span class="medserca ${m.numery?(m.serca>=10?'ok':'no'):''}">${
                m.numery?`♥ ${m.serca}`:'brak numerów'}</span>`
            :`<span class="medserca">${m.widz?m.widz+' widzów':'brak wydań'}</span>`}
          <b class="ekow ${m.bilans>=0?'plus':'minus'}">${mordedolar(12)} ${
            m.bilans<0?'−':'+'}${kasaSkrot(Math.abs(m.bilans))}</b>
          <span class="medakcje">
            <button class="btn ${gotowe?'':'g'} sm" ${gotowe?'':'disabled'}
              onclick="${akcja[0]}(${i})">${gotowe?akcja[1]:`za ${za} ${pl(za,'tydzień','tygodnie','tygodni')}`}</button>
            <button class="btn g sm" onclick="mediaNazwij(${i})">Nazwa</button>
            <button class="btn g sm" onclick="mediaSzef(${i})">Redaktor</button>
          </span>
        </div>`}).join('')}</div>`
       :'<p class="dim" style="margin:0">Nie masz jeszcze żadnego wydawnictwa.</p>'}
    </div></div>

    <div class="card"><div class="h"><h3>Załóż wydawnictwo</h3>
      <span class="n">płaci ${esc(szef)} z własnej kieszeni</span></div><div class="b">
      <div class="medsklep">${Object.keys(MEDIA_TYP).map(k=>{const t=MEDIA_TYP[k],stac=maj>=t.koszt;
        const mam=lista.some(m=>m.typ===k);
        return `<div class="medkafel ${mam?'mam':stac?'':'brak'}">
          <div class="mede duzy">${t.e}</div>
          <b>${t.n}</b>
          <div class="medcena">${mordedolar(13)} ${kasaSkrot(t.koszt)}</div>
          <p>${t.d}</p>
          <button class="btn ${mam||!stac?'g':''}" ${mam||!stac?'disabled':''} onclick="mediaKup('${k}')">
            ${mam?'Już to masz':stac?'Zakładam':'Brakuje '+kasaSkrot(t.koszt-maj)}</button>
        </div>`}).join('')}</div>
    </div></div>
  </div>`;
}

/* ── SĄD ──
   Dział na razie tylko pokazuje. Skład sądu bierze się wprost z ustawy
   o sądach administracyjnych: dopóki sejm jej nie uchwali, żadnego sądu nie ma
   i nie ma kto rozpatrywać odwołań. Sędziów wyznacza resort Sprawiedliwości,
   więc kto go trzyma, ten obsadza ławę.

   Co jest gotowe: skład, źródło jego powołania i podgląd, kto ma wpływ.
   Czego nie ma: samych spraw, odwołań od decyzji administracji, wyroków
   i tego, żeby sąd cokolwiek realnie blokował. Dlatego dział stoi z etykietą
   „wip” — żeby było jasne, że liczby są prawdziwe, a mechaniki jeszcze nie ma. */
function sadSklad(){
  if(!G||!lawDone('sady'))return [];
  /* Ława to trzy osoby: minister Sprawiedliwości z urzędu, a do tego dwoje
     o najwyższej kompetencji spośród tych, którzy nie prowadzą własnej partii —
     sędzia z fotelem przewodniczącego byłby sędzią we własnej sprawie. */
  const res=RESORTY.find(r=>r.id==='spraw');
  const min=res?radaKto(res.id):null;
  const wolni=wszyscyZaplecze()
    .filter(n=>n!==min&&!alive().some(k=>isLead(G.p[k],n)))
    .sort((a,b)=>L(b).komp-L(a).komp).slice(0,2);
  const ludzie=[];
  if(min)ludzie.push({n:min,rola:'Przewodniczący składu',skad:'z urzędu, resort Sprawiedliwości'});
  wolni.forEach(n=>ludzie.push({n,rola:'Sędzia',skad:'powołany za kompetencję'}));
  return ludzie;
}
function sadTab(){
  const jest=lawDone('sady');
  const sklad=sadSklad();
  const res=RESORTY.find(r=>r.id==='spraw');
  const kto=res?radaKto(res.id):null;
  const mojResort=!!(res&&mojeResorty().includes('spraw'));
  return `
  <div class="ekoblok">
    <div class="ekotasma">NIEDOKOŃCZONE! Skład jest prawdziwy, spraw i wyroków jeszcze nie ma.</div>

    <div class="card"><div class="h"><h3>Sąd administracyjny</h3>
      <span class="n">${jest?'powołany':'nie istnieje'}</span></div><div class="b">
      ${jest?`
        <div class="tabliczki" style="margin:0 0 14px">
          <div><b>${sklad.length}</b><span>${pl(sklad.length,'sędzia','sędziów','sędziów')}</span></div>
          <div><b>${kto?G.p[partiaOsoby(kto)]?G.p[partiaOsoby(kto)].ab:'—':'wakat'}</b><span>obsadza ławę</span></div>
          <div><b>${sklad.length?Math.round(sklad.reduce((a,x)=>a+L(x.n).komp,0)/sklad.length):0}</b><span>średnia kompetencja</span></div>
        </div>
        <div class="ekolista">${sklad.map((x,i)=>`<div class="ekos">
          <span class="ekopoz">${i+1}</span>${ava(x.n,me().c,26)}
          <span class="ekon">${x.n}<em class="ekotag">${x.rola}</em></span>
          <b class="ekow">kompetencja ${L(x.n).komp}</b>
          <span class="ekodaje">${x.skad}</span>
        </div>`).join('')||'<div class="dim">Nie ma kogo powołać.</div>'}</div>`
       :`<p style="margin-top:0">Sądu nie ma, bo sejm nie uchwalił <b>ustawy o sądach
         administracyjnych</b>. Dopóki jej nie ma, decyzje administracji są ostateczne
         i nie ma od nich odwołania.</p>
         <div class="note" style="margin:12px 0 0">Ustawę zgłasza premier albo
         <b>minister Sprawiedliwości</b>${kto?` — teraz jest nim <b>${kto}</b>`:', a resort stoi pusty'}.
         ${mojResort?'Resort trzymasz ty, więc możesz ją wnieść.':''}</div>`}
    </div></div>

    <div class="card"><div class="h"><h3>Czego tu jeszcze nie ma</h3>
      <span class="n">plan działu</span></div><div class="b">
      <ul class="krelista">
        <li><b>Sprawy i odwołania</b> — od banów, od decyzji administracji, od wyników głosowań.</li>
        <li><b>Wyroki</b> — sąd utrzymuje albo uchyla, a uchylenie realnie cofa skutek.</li>
        <li><b>Skład jako stawka polityczna</b> — kto obsadzi ławę, ten wygrywa spory zanim się zaczną.</li>
        <li><b>Koszt procesu</b> — odwołanie ma kosztować kapitał i czas, żeby nie było darmowe.</li>
      </ul>
      <div class="dim" style="font-size:12px;margin-top:11px">Skład powyżej liczy się naprawdę
      i zmienia się razem z obsadą resortu — reszta dopiero powstaje.</div>
    </div></div>
  </div>`;
}

function ekonomiaTab(){
  if(!G.pkb)G.pkb=pkbLicz();        // zapisy sprzed tej wersji nie mają jeszcze PKB
  pkbZapiszOdczyt();
  const d=podzialMajatku();
  const udzial=G.pkb?d.suma/G.pkb*100:0;
  const wiersz=(x,i)=>`<div class="ekos">
    <span class="ekopoz">${i+1}</span>${ava(x.n,'#6f7a6b',26)}
    <span class="ekon">${x.n}</span>
    <b class="ekow">${mordedolar(12)} ${kasaSkrot(x.v)}</b></div>`;
  const t=G.pkbTempo||0, kier=t>0?'up':t<0?'dn':'';
  const mn=pkbMnoznik(), czyn=pkbCzynniki();
  const dK=G.kapPop?d.suma-G.kapPop:0;
  return `
  <div class="ekoblok">
    <div class="card"><div class="h"><h3>Produkt krajowy brutto</h3>
      <span class="n">kadencja ${G.term}, tydzień ${G.week}</span></div><div class="b">
      <div class="pkbplyta">
        <div class="pkbduza">${mordedolar(30)} ${kasa(G.pkb)}</div>
        <div class="pkbwzor">${kasaSkrot(d.suma)} kapitału prywatnego × ${mn.toFixed(1)} obrotu</div>
        <div class="pkbtempo ${kier}">${t>0?'+':''}${(t*100).toFixed(2)}% tygodniowo${
          G.pkbPop?` · tydzień temu ${kasaSkrot(G.pkbPop)}`:''}</div>
      </div>
      <div class="tabliczki" style="margin:14px 0 0">
        <div><b>${kasaSkrot(d.suma)}</b><span>kapitał prywatny razem</span></div>
        <div><b>${dK>0?'+':''}${kasaSkrot(dK)}</b><span>zmiana w tygodniu</span></div>
        <div><b>${mn.toFixed(1)}×</b><span>mnożnik obrotu</span></div>
        <div><b>${kasaSkrot(G.skarb||0)}</b><span>zebrane do skarbu</span></div>
      </div>
      ${pkbWykres()}
      <div class="note" style="margin-top:14px"><b>PKB liczy się z majątku.</b>
        Bierzemy sumę wszystkich prywatnych kont i mnożymy przez obrót — ile razy
        w roku te same pieniądze zmienią właściciela. Dlatego konta stoją
        w milionach, a PKB w miliardach, i wszystko, co rusza majątkiem,
        widać tu od razu.</div>
    </div></div>

    <div class="card"><div class="h"><h3>Z czego składa się mnożnik</h3>
      <span class="n">baza ${PKB_MNOZNIK_BAZA} · teraz ${mn.toFixed(1)}</span></div><div class="b">
      <div class="ekoczyn">${czyn.map(x=>`<div class="ekocz ${x.v>=0?'plus':'minus'}">
        <div class="ekoczl"><b>${x.n}</b><span>${x.o}</span></div>
        <div class="ekoczv">${x.v>0?'+':''}${x.v.toFixed(1)}</div></div>`).join('')}</div>
      <div class="dim" style="font-size:12px;margin-top:11px">Podatek od majątku ustawia sejm
      <b>ustawą o podatkach</b>. Im wyższy, tym mocniej zjada i majątek, i zaufanie —
      więc PKB leci w dół z dwóch stron naraz.</div>
    </div></div>

    ${kapitalTab()}

    <div class="card"><div class="h"><h3>Najbogatsi na serwerze</h3>
      <span class="n">${d.lu.length} ${pl(d.lu.length,'osoba','osoby','osób')} w zapleczach</span></div><div class="b">
      <div class="ekolista">${d.lu.slice(0,12).map(wiersz).join('')}</div>
      ${d.lu.length>12?`<div class="dim" style="font-size:12px;margin-top:10px">
        …i ${d.lu.length-12} ${pl(d.lu.length-12,'osoba','osoby','osób')} niżej.
        Średnia to ${kasaSkrot(d.sr)}, mediana ${kasaSkrot(d.lu[Math.floor(d.lu.length/2)].v)}.</div>`:''}
    </div></div>
  </div>`;
}

/* Najlepszy wynik w stawce dla danej cechy. Przy kontrowersji i pretensjonalności
   „najlepszy" znaczy najniższy — tam wygrywa ten, kto ma najmniej. */
const CECHA_ODWROTNA={ctr:1,pret:1};
function najlepszyRywal(k){
  const inni=alive().filter(x=>x!==G.me&&!G.p[x].dead);
  if(!inni.length)return null;
  const odwr=!!CECHA_ODWROTNA[k];
  return inni.reduce((a,x)=>{
    const v=G.p[x][k]; if(v===undefined)return a;
    if(!a||(odwr?v<a.v:v>a.v))return {v,ab:G.p[x].ab};
    return a;
  },null);
}
function sidebar(p,q){
  const b=(l,v,c,k)=>{const d=G.prev?v-G.prev[k]:0;
    /* Kreska rywala. Sama liczba „62" nigdy nic nie znaczyła — dopiero widok,
       gdzie stoi najlepszy w stawce, mówi, czy to dużo. */
    const r=najlepszyRywal(k);
    const mie=r?(()=>{const odwr=!!CECHA_ODWROTNA[k];
      const lepsi=alive().filter(x=>x!==G.me&&!G.p[x].dead&&(odwr?G.p[x][k]<v:G.p[x][k]>v)).length;
      return lepsi+1})():0;
    return `<div class="st"><div class="l"><span>${l}${statTip(k)}</span><span>
      <b class="wart" data-c="${k}" data-v="${Math.round(v)}">${Math.round(v)}</b>${
      Math.abs(d)>.6?`<span class="d ${d>0?'up':'dn'}">${d>0?'+':''}${Math.round(d)}</span>`:''}${
      mie?`<span class="msc" title="twoje miejsce w stawce">${mie}.</span>`:''}</span></div>
      <div class="trk" data-c="${k}" data-v="${cl(v)}"><i style="width:${cl(v)}%;background:${c}"></i>
      <u class="duch"></u>${
      r?`<span class="rywal" style="left:${cl(r.v)}%" data-kto="${r.ab}"
        title="najlepszy w stawce: ${r.ab} ${Math.round(r.v)}"></span>`:''}</div></div>`};
  const ld=lead(G.me),used=PID.reduce((a,k)=>a+G.p[k].mem,0);
  const benchAll=roster(p),swapCands=benchAll.filter(x=>!isLead(p,x));
  return `
  <div class="card lead"><div class="h"><h3>Przewodnictwo</h3>
    <span class="n">${leads(p).length===1?'jednoosobowe':leads(p).length===2?'dwuosobowe':'trzyosobowe'}</span></div><div class="b">
    <div class="leadbox">${leadAva(G.me,44)}<div style="min-width:0">
      <b style="font-size:15px">${leads(p).join(' / ')}</b>
      <div class="dim" style="font-size:12px">${leads(p).length>1?'współprzewodniczący':'przewodniczący'} ${p.ab}${hasPrez()?' · <span style="color:var(--roy)">prezydent</span>':''}${isPM()?' · <span style="color:var(--acc)">premier</span>':''}</div>
      ${innAll(G.me).map(t=>`<div style="font-size:11.5px;color:var(--acc);margin-top:3px">★ ${t.n}</div>`).join('')}</div></div>
    <div class="lstat">
      <div><b>${ld.char}</b><span>charyzma</span></div>
      <div><b>${ld.komp}</b><span>kompet.</span></div>
      <div><b>${ld.wytrz}</b><span>wytrzym.</span></div>
      <div><b>${ld.autor}</b><span>autorytet</span></div></div>
    <div class="hint">${leads(p).length>1?'Statystyki to średnia całego składu sterów. ':''}Kto prowadzi partię, ustawiasz
      w <b>Decyzjach → Specjalne → Układ sterów</b>${G.useTerm.stery?' <span class="bad">(zużyte w tej kadencji)</span>':''}.</div>
  </div></div>
  ${feed()}
  <div class="card skl"><div class="h"><h3>Skład partii</h3><span class="n">${p.mem} ${pl(p.mem,'osoba','osoby','osób')}</span></div><div class="b">
    <div style="display:flex;height:11px;border-radius:4px;overflow:hidden;margin-bottom:10px">
      ${SEG.map(s=>`<i style="display:block;height:100%;width:${p.mem?p.comp[s.id]/p.mem*100:0}%;background:${s.c}"></i>`).join('')}</div>
    ${SEG.map(s=>`<div style="display:flex;align-items:center;gap:8px;font-size:12.5px;margin-bottom:5px">
      <i style="width:9px;height:9px;border-radius:2px;background:${s.c};flex:none"></i>
      <span style="flex:1">${s.n}</span><b class="m">${p.comp[s.id]}</b>
      <span class="dim m" style="width:38px;text-align:right">${p.mem?Math.round(p.comp[s.id]/p.mem*100):0}%</span></div>`).join('')}
    ${p.fame<=9&&p.act<=9?`<div style="margin-top:10px;font-size:12.5px;color:#f0a0a0;background:rgba(192,74,62,.18);
      border-left:2px solid var(--neg);padding:9px 11px;border-radius:0 5px 5px 0;line-height:1.45">
      <b>Sława ${Math.round(p.fame)}, aktywność ${Math.round(p.act)}.</b> Przy zerze obu naraz ${p.lead}
      sam rozwiąże partię. Zrób cokolwiek, wiec, wywiad, rekrutację, byle nie stała w miejscu.</div>`:''}
    ${eliteRisk(p)>0?`<div style="margin-top:10px;font-size:12.5px;color:#e8a4ad;background:rgba(226,96,111,.1);
      border-left:2px solid var(--neg);padding:8px 10px;border-radius:0 5px 5px 0;line-height:1.45">
      <b>Za dużo elity.</b> ${Math.round(ratio(p,'eli')*100)}% składu przy bezpiecznym progu 30%.
      Kontrowersja rośnie o ${(eliteRisk(p)*6).toFixed(1)} tygodniowo.</div>`:''}
    ${p.mem>4&&ratio(p,'ser')>.72?`<div style="margin-top:10px;font-size:12.5px;color:var(--dim);background:#0b0e13;
      border-left:2px solid var(--acc2);padding:8px 10px;border-radius:0 5px 5px 0;line-height:1.45">
      Partia niemal wyłącznie serwerowicka, jedność leci w dół, kontrowersja w górę.</div>`:''}
  </div></div>
  ${modyfikatory()}
  <div class="card kond"><div class="h"><h3>Kondycja partii</h3><span class="n">mapa</span></div><div class="b">
    ${radar(p)}
    <div id="paskiCech">
    ${b('Sława',p.fame,'var(--acc)','fame')}
    ${b('Wiarygodność',p.cred,'var(--info)','cred')}
    ${b('Jedność',p.uni,'var(--pos)','uni')}
    ${b('Aktywność',p.act,'#9b7fd4','act')}
    ${b('Kontrowersja',p.ctr,'var(--neg)','ctr')}
    ${p.ctr>=90?`<div class="ctrwarn bad"><b>Paraliż</b> Sondaż liczony na pół, kapitał wycieka, co tydzień ktoś odchodzi. Schładzaj: przeprosiny, wyciszenie sporu, otwarte konsultacje.</div>`
      :p.ctr>=70?`<div class="ctrwarn"><b>Uwaga na kontrowersję</b> Przy 90 partia wpada w paraliż. Zostało ci ${Math.round(90-p.ctr)} punktów luzu.</div>`:''}
    ${b('Pretensjonalność',p.pret,'#d98b4a','pret')}
    <div id="podgNota" class="podgnota"></div>
    </div>
    ${(()=>{const z=znuzenie(G.me);if(!z)return '';
      const strata=Math.round(z/1.65);
      return `<div class="st"><div class="l"><span>Zmęczenie władzą</span>
          <span><b style="color:${z>=45?'var(--neg)':z>=22?'var(--acc)':'var(--dim)'}">${Math.round(z)}</b></span></div>
        <div class="trk"><i style="width:${cl(z/72*100)}%;background:${z>=45?'var(--neg)':'var(--acc)'}"></i></div></div>
        <div class="ctrwarn${z>=45?' bad':''}" style="margin-top:-4px">
          <b>Serwer ma dość rządzących</b> Zjada ci <b>${strata}%</b> poparcia przy urnach.
          Każda kadencja z fotelem premiera dokłada 21 punktów, w koalicji 11,
          a kadencja w opozycji zdejmuje 15. Nie da się tego odrobić decyzjami — tylko czasem poza rządem.</div>`})()}
    <div class="st"><div class="l"><span>Momentum${statTip('mom')}</span><span><b style="color:${(p.mom||0)>8?'var(--pos)':(p.mom||0)<-8?'var(--neg)':'var(--tx)'}">${(p.mom||0)>0?'+':''}${Math.round(p.mom||0)}</b>${
      G.prev&&Math.abs((p.mom||0)-(G.prev.mom||0))>.6?`<span class="d ${(p.mom||0)>G.prev.mom?'up':'dn'}">${(p.mom||0)>G.prev.mom?'+':''}${Math.round((p.mom||0)-(G.prev.mom||0))}</span>`:''}</span></div>
      <div class="trk"><i style="width:${((p.mom||0)+35)/105*100}%;background:${(p.mom||0)>0?'var(--pos)':'var(--neg)'}"></i></div></div>
    <div style="display:flex;justify-content:space-between;font-family:var(--m);font-size:12.5px;
      border-top:1px solid var(--line);padding-top:11px;color:var(--dim)">
      <span>osób <b style="color:var(--tx)">${p.mem}</b></span>
      <span>sufit <b style="color:var(--tx)">${Math.round(p.pot)}</b></span>
      <span>prestiż <b style="color:var(--tx)">${G.prest}</b></span></div>
    ${p.marg?`<div style="margin-top:10px"><span class="pill neg">marginalizacja −25%</span></div>`:''}
  </div></div>
    ${(()=>{
      // Prawdziwy stan serwera, a nie stała z początku gry: ludzie przychodzą i odchodzą
      const ludzie=used+freeTot(), zmiana=ludzie-SERVER;
      return `<div class="card"><div class="h"><h3>Serwer</h3>
      <span class="n">${ludzie} ${zmiana?`<span style="color:${zmiana>0?'var(--pos)':'var(--neg)'}">${zmiana>0?'+':''}${zmiana}</span>`:''}</span></div><div class="b">
    <div class="st"><div class="l"><span>W partiach</span><b class="m">${used}</b></div>
      <div class="trk"><i style="width:${cl(used/Math.max(1,ludzie)*100)}%;background:var(--acc)"></i></div></div>
    <div class="st" style="margin:0"><div class="l"><span>Niezrzeszonych</span><b class="m">${freeTot()}</b></div>
      <div class="trk"><i style="width:${cl(freeTot()/Math.max(1,ludzie)*100)}%;background:var(--pos)"></i></div></div>`})()}
    <div style="display:flex;gap:10px;margin-top:9px;font-family:var(--m);font-size:11px;color:var(--dim)">
      ${SEG.map(s=>`<span><i style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${s.c};margin-right:4px"></i>${G.free[s.id]}</span>`).join('')}</div>
  </div></div>
  <div class="card skl"><div class="h"><h3>Zaplecze</h3><span class="n">${benchAll.length} ${pl(benchAll.length,'osoba','osoby','osób')}</span></div><div class="b">
    <div class="benchgrid">
      ${benchAll.map(n=>`<div class="bperson ${isLead(p,n)?'lead':''}" title="${n} — kapitał prywatny ${kasa(kapPryw(n))}${ranga(n)?' · '+ranga(n).n:''}">
        ${ava(n,p.c,34)}<span>${n}</span>
        <em class="kappryw">${mordedolar(11)} ${kasaSkrot(kapPryw(n))}</em>
        ${rangaOdznaka(n)}</div>`).join('')||'<span class="dim">Nikogo poza przewodniczącym.</span>'}
    </div>
  </div></div>
  <div class="card rel"><div class="h"><h3>Relacje</h3></div><div class="b">
    ${alive().filter(k=>k!==G.me).sort((a,b2)=>G.rel[b2][G.me]-G.rel[a][G.me]).map(k=>{
      const v=Math.round(G.rel[G.me][k]);
      return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:7px;font-size:12.5px">
        ${crest(k,'s')}<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${G.p[k].ab} <span class="dim">${G.p[k].lead}</span></span>
        <b class="m" style="color:${v<0?'var(--neg)':v>30?'var(--pos)':'var(--dim)'}">${v>0?'+':''}${v}</b></div>`}).join('')}
  </div></div>`;
}

/* ---- sala sejmowa ----
   Miejsca układają się w łukach od lewej do prawej, jak w prawdziwej sali.
   Poza samym rozkładem widać tu trzy rzeczy naraz: gdzie przebiega próg większości,
   ile mandatów zebrał rząd i które miejsca są twoje. */
function hemi(order,w,mode){
  const n=order.length;if(!n)return '';
  const W=w||600, cx=W/2;
  const rows=n>48?6:n>34?5:n>18?4:3;
  const rad=Math.max(4.5,Math.min(10,W/n*0.52));
  const Rmax=W/2-rad-10, Rmin=Rmax*0.42;
  const radii=rows===1?[Rmax]:[...Array(rows)].map((_,i)=>Rmin+i*(Rmax-Rmin)/(rows-1));
  const tw=radii.reduce((a,b)=>a+b,0);
  let cnt=radii.map(r=>Math.max(1,Math.floor(n*r/tw)));
  let left=n-cnt.reduce((a,b)=>a+b,0);
  for(let i=rows-1;left>0;i=(i-1+rows)%rows){cnt[i]++;left--}
  while(left<0){const i=cnt.indexOf(Math.max(...cnt));cnt[i]--;left++}
  const pts=[];
  radii.forEach((r,ri)=>{const c=cnt[ri];
    for(let i=0;i<c;i++){const t=c===1?Math.PI/2:Math.PI*(i/(c-1));
      pts.push({t,r,ri})}});
  pts.sort((a,b)=>a.t-b.t||a.ri-b.ri);

  // Podpisy przeniosły się pod wykres, więc samo SVG nie potrzebuje już zapasu na dole.
  const H=Math.round(Rmax+rad+18), cy=Math.round(Rmax+rad+12);
  const colOf=k=>{if(mode==='bloc'){const b=blocOf(k);if(b)return b.color}return G.p[k].c};
  const uid='h'+Math.random().toString(36).slice(2,7);

  // ile mandatów ma rząd i gdzie kończy się próg większości
  const rzad=G.gov?G.gov.parties:[];
  const mRzad=rzad.reduce((a,k)=>a+(G.p[k]?G.p[k].seats:0),0);
  const moje=G.p[G.me]?G.p[G.me].seats:0;
  const prog=Math.min(MAJ,n);
  const kątProgu=pts[prog-1]?pts[prog-1].t:Math.PI/2;
  const Rzew=Rmax+rad+7, Rwew=Rmin-rad-7;

  /* Łuk ma domykać się za ostatnim zajętym fotelem, a nie w jego środku —
     inaczej zielona kreska nad ławami rządu wyraźnie nie dociąga. */
  const kątKonca=ile=>{
    const a=pts[ile-1];if(!a)return Math.PI;
    const b=pts[ile];
    return b?(a.t+b.t)/2:Math.min(Math.PI,a.t+(a.t-(pts[ile-2]?pts[ile-2].t:0))/2);
  };
  const luk=(R,od,do_,kolor,gr,op)=>{
    const x1=cx-R*Math.cos(od), y1=cy-R*Math.sin(od);
    const x2=cx-R*Math.cos(do_), y2=cy-R*Math.sin(do_);
    const duzy=Math.abs(do_-od)>Math.PI?1:0;
    return `<path d="M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${R} ${R} 0 ${duzy} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}"
      fill="none" stroke="${kolor}" stroke-width="${gr}" stroke-linecap="round" opacity="${op}"/>`;
  };

  const miejsca=pts.map((p,i)=>{const k=order[i];if(!k)return '';
    const x=cx-p.r*Math.cos(p.t), y=cy-p.r*Math.sin(p.t);
    const mine=k===G.me, b=blocOf(k), wRzadzie=rzad.includes(k);
    return `<g class="seat ${mine?'mine':''}" data-p="${k}" style="--sd:${Math.min(i*6,240)}ms">
      <circle cx="${x.toFixed(1)}" cy="${(y+1.2).toFixed(1)}" r="${rad}" fill="rgba(0,0,0,.55)"/>
      <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rad}" fill="${colOf(k)}"
        stroke="${mine?'#f0d489':wRzadzie?'rgba(255,255,255,.42)':'rgba(0,0,0,.5)'}"
        stroke-width="${mine?2.4:wRzadzie?1.3:1}"/>
      <circle cx="${(x-rad*.3).toFixed(1)}" cy="${(y-rad*.34).toFixed(1)}" r="${(rad*.34).toFixed(1)}"
        fill="#fff" opacity=".26"/>
      <title>${G.p[k].n}${b?' · '+b.name:''} — ${G.p[k].seats} ${pl(G.p[k].seats,'mandat','mandaty','mandatów')}${wRzadzie?' · w rządzie':''}</title>
    </g>`}).join('');

  return `<svg viewBox="0 0 ${W} ${H}" class="hemi" style="width:100%;height:auto;display:block">
    <defs>
      <linearGradient id="${uid}maj" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="var(--acc)" stop-opacity=".15"/>
        <stop offset="1" stop-color="var(--acc)" stop-opacity=".85"/>
      </linearGradient>
    </defs>

    ${luk(Rzew,0,Math.PI,'var(--line)',1,.9)}
    ${luk(Rwew,0,Math.PI,'var(--line)',1,.55)}

    ${mRzad>0?luk(Rzew+7,0,kątKonca(Math.min(mRzad,n)),'var(--pos)',3.5,.85):''}

    <!-- Próg większości. Kreska biegnie wyłącznie nad ławami, bo poprowadzona
         przez środek przecinała fotele i wyglądała jak rysa na wykresie. -->
    ${luk(Rzew+7,0,kątProgu,`url(#${uid}maj)`,mRzad>0?1.5:3,mRzad>0?.5:.8)}
    <line x1="${(cx-(Rzew+10)*Math.cos(kątProgu)).toFixed(1)}" y1="${(cy-(Rzew+10)*Math.sin(kątProgu)).toFixed(1)}"
          x2="${(cx-(Rzew+21)*Math.cos(kątProgu)).toFixed(1)}" y2="${(cy-(Rzew+21)*Math.sin(kątProgu)).toFixed(1)}"
          stroke="var(--acc)" stroke-width="1.7" stroke-dasharray="4 3" opacity=".95"/>
    <text x="${(cx-(Rzew+29)*Math.cos(kątProgu)).toFixed(1)}" y="${(cy-(Rzew+29)*Math.sin(kątProgu)+3.5).toFixed(1)}"
      text-anchor="middle" fill="var(--acc)" font-size="10.5" font-family="ui-monospace,monospace"
      letter-spacing=".08em">${MAJ}</text>

    ${miejsca}

    <text x="${cx}" y="${cy-30}" text-anchor="middle" fill="${moje?G.p[G.me].c:'var(--dim2)'}"
      font-size="27" font-weight="700" font-family="ui-monospace,monospace">${moje}</text>
    <text x="${cx}" y="${cy-15}" text-anchor="middle" fill="var(--dim2)" font-size="10"
      font-family="ui-monospace,monospace" letter-spacing=".14em">TWOICH MANDATÓW</text>
  </svg>
  <!-- Podpisy wyszły z SVG do zwykłego paska: wewnątrz wykresu nie mieściły się
       w jego wysokości i dłuższe komunikaty były po prostu ucinane w połowie. -->
  <div class="hemipod">
    <span><b>${n}</b> ${pl(n,'mandat','mandaty','mandatów')}</span>
    <span>większość <b>${MAJ}</b></span>
    ${mRzad>0?`<span>rząd <b style="color:var(--pos)">${mRzad}</b></span>
      <span class="hemistan ${mRzad>=MAJ?'ok':'zle'}">${
        mRzad>=MAJ?'rząd ma większość':`rząd mniejszościowy, brakuje ${MAJ-mRzad}`}</span>`:''}
  </div>`;
}
function hexPts(cx,cy,r){const a=[];for(let i=0;i<6;i++){const t=(Math.PI/180)*(60*i-90);
  a.push((cx+r*Math.cos(t)).toFixed(1)+','+(cy+r*Math.sin(t)).toFixed(1))}return a.join(' ')}
function presArc(cx,cy,r,frac){
  if(frac<=0.004)return '';
  if(frac>=0.996)return `M ${cx} ${cy-r} A ${r} ${r} 0 1 1 ${(cx-0.01).toFixed(2)} ${cy-r} Z`;
  const a0=-Math.PI/2, a1=a0+Math.PI*2*frac;
  return `M ${(cx+r*Math.cos(a0)).toFixed(2)} ${(cy+r*Math.sin(a0)).toFixed(2)} `
    +`A ${r} ${r} 0 ${frac>.5?1:0} 1 ${(cx+r*Math.cos(a1)).toFixed(2)} ${(cy+r*Math.sin(a1)).toFixed(2)}`;
}
/* Soczewki mapy — wzięte z paska widoków Victorii. Kanałów jest dziewięć,
   a na każdy przypada kilka liczb; do tej pory widać było naraz tylko jedną.
   Soczewka przełącza to, co maluje heks: kto tu dominuje, gdzie masz obecność,
   ile jest mandatów i jak duży jest kanał. */
const SOCZEWKI=[
 {id:'dom', n:'Dominacja',  d:'Kto ma w kanale największą obecność.'},
 {id:'ja',  n:'Twoja obecność', d:'Ile masz w każdym kanale, od 0 do 100.'},
 {id:'mand',n:'Mandaty',    d:'Ile foteli rozdaje się w kanale.'},
 {id:'ludz',n:'Wielkość',   d:'Ilu ludzi siedzi w kanale.'},
];
function setSoczewka(id){G.socz=id;render()}
const soczewka=()=>G.socz||'dom';
function mapTab(q,AL){
  const p=me(),r=REG.find(x=>x.id===G.sel);
  const ld=Object.fromEntries(REG.map(x=>[x.id,leader(x.id,q.res)]));
  const SOC=soczewka();
  const maxLudz=Math.max(...REG.map(x=>x.pop||1));
  const maxMand=Math.max(...REG.map(x=>x.seats||1));
  return `
  <div class="mapwrap">
    <div class="soczpasek">
      <span class="wazneet">Widok mapy</span>
      ${SOCZEWKI.map(x=>`<button class="socz ${SOC===x.id?'on':''}"
        onclick="setSoczewka('${x.id}')" title="${esc(x.d)}">${x.n}</button>`).join('')}
      <span class="soczopis">${esc((SOCZEWKI.find(x=>x.id===SOC)||SOCZEWKI[0]).d)}</span>
    </div>
    <div class="card">
      <div class="h"><h3>Okręgi wyborcze</h3><span class="n">${DIST_SEATS} w okręgach + ${TOPUP} z listy</span></div>
      <div class="b" style="padding:8px">
      <svg class="hexsvg" viewBox="0 0 800 620">
        <defs>
          <pattern id="grid" width="26" height="26" patternUnits="userSpaceOnUse">
            <path d="M26 0H0V26" fill="none" stroke="var(--line)" stroke-width="1" stroke-opacity=".5"/></pattern>
          <radialGradient id="vig" cx="50%" cy="42%" r="72%">
            <stop offset="55%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity=".55"/></radialGradient>
          <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="9"/></filter>
        </defs>
        <rect x="0" y="0" width="800" height="620" fill="url(#grid)" rx="12"/>
        <rect x="0" y="0" width="800" height="620" fill="url(#vig)" rx="12"/>
        ${REG.map(x=>{
          const Lk=alive().reduce((a,k2)=>G.p[k2].pres[x.id]>G.p[a].pres[x.id]?k2:a,G.me);
          const c=G.p[Lk].c,pr=p.pres[x.id],on=x.id===G.sel,crestSrc=(G.p[Lk].logo&&LOGOS[G.p[Lk].logo])||LOGOS[Lk]||'';
          const R0=102, arc=presArc(x.x,x.y,R0+7,cl(pr,0,100)/100);
          const dom=Lk, dp=G.p[dom].pres[x.id], darc=presArc(x.x,x.y,R0+15,cl(dp,0,100)/100);
          const glosy=ld[x.id];
          return `<g class="hex" onclick="setSel('${x.id}')">
            <polygon class="hglow" points="${hexPts(x.x,x.y,R0)}" fill="${c}" filter="url(#soft)"/>
            <polygon class="hf" points="${hexPts(x.x,x.y,R0)}" fill="${
              SOC==='ja'?p.c:SOC==='mand'?'var(--acc)':SOC==='ludz'?'#5a8bb0':c}" fill-opacity="${
              (SOC==='ja'?(.10+cl(pr,0,100)/125)
               :SOC==='mand'?(.10+(x.seats/maxMand)*.62)
               :SOC==='ludz'?(.10+((x.pop||1)/maxLudz)*.62)
               :(.17+dp/155)).toFixed(3)}"
              stroke="${on?'var(--acc)':c}" stroke-width="${on?3.6:1.6}" stroke-opacity="${on?1:.72}"/>
            <path d="${darc}" fill="none" stroke="${G.p[dom].c}" stroke-width="${(3+dp/22).toFixed(1)}" stroke-linecap="round" stroke-opacity=".85"/>
            ${dom===G.me?'':`<path d="${arc}" fill="none" stroke="${p.c}" stroke-width="3" stroke-linecap="round" stroke-opacity="${(.35+pr/190).toFixed(2)}"/>`}
            <rect x="${x.x-19}" y="${x.y-72}" width="38" height="38" rx="7" fill="#f4f1ea" fill-opacity=".93"/>
            <image class="hcrest" href="${crestSrc}" x="${x.x-17}" y="${x.y-70}" width="34" height="34" preserveAspectRatio="xMidYMid meet"/>
            <text x="${x.x}" y="${x.y-12}" text-anchor="middle" fill="var(--tx)" font-size="17.5" font-weight="660">${x.n}</text>
            <text x="${x.x}" y="${x.y+9}" text-anchor="middle" fill="${
              SOC==='ja'?p.c:SOC==='mand'?'var(--acc)':SOC==='ludz'?'#8fb8d6':c}" font-size="13" font-weight="650" letter-spacing=".04em">${
              SOC==='ja'?`twoja obecność ${Math.round(pr)}`
              :SOC==='mand'?`${x.seats} ${pl(x.seats,'mandat','mandaty','mandatów')}`
              :SOC==='ludz'?`${x.pop} ${pl(x.pop,'osoba','osoby','osób')}`
              :`${G.p[Lk].ab} dominuje`}</text>
            ${Array.from({length:x.seats}).map((_,i)=>`<rect x="${x.x-(x.seats*11-3)/2+i*11}" y="${x.y+20}" width="8" height="8" rx="4"
              fill="var(--acc)" fill-opacity=".95" stroke="rgba(0,0,0,.5)" stroke-width=".6"/>`).join('')}
            <text x="${x.x}" y="${x.y+50}" text-anchor="middle" fill="var(--dim)" font-size="12" font-family="ui-monospace,monospace">${G.p[glosy].ab} bierze głosy · ty ${Math.round(pr)}/100</text>
          </g>`}).join('')}
      </svg></div>
      <div class="legend">${alive().sort((a,b)=>q.res[b].tot-q.res[a].tot).slice(0,7)
        .map(k=>`<span><i style="background:${G.p[k].c}"></i>${G.p[k].ab}</span>`).join('')}
        <span class="dim" style="margin-left:auto">Barwa kanału i zewnętrzny łuk: kto ma tu największą obecność. Wewnętrzny łuk: twoja obecność.</span></div>
    </div>
    <div class="card okr"><div class="h"><h3>${r.n}</h3><span class="n">${r.seats} ${pl(r.seats,'mandat','mandaty','mandatów')}</span></div>
      <div class="b regbox">
      <p class="dim" style="font-size:13px">${r.d}</p>
      <div class="mix">${SID.map(s=>r.mix[s]>0?`<i style="width:${r.mix[s]*100}%;background:${SEG.find(x=>x.id===s).c}"></i>`:'').join('')}</div>
      <div class="dim" style="font-size:12px">${SID.filter(s=>r.mix[s]>=.14).map(s=>sn(s)+' '+Math.round(r.mix[s]*100)+'%').join(' · ')}</div>
      <table><tr><td>Osób w kanale</td><td>${r.pop}</td></tr>
        <tr><td>Frekwencja</td><td>${Math.round(r.eng*G.turnout*100)}%</td></tr>
        <tr><td>Głosów</td><td>${Math.round(q.rv[r.id])}</td></tr>
        <tr><td>Twoja obecność</td><td style="color:${p.pres[r.id]>50?'var(--pos)':p.pres[r.id]<20?'var(--neg)':'var(--tx)'}">${Math.round(p.pres[r.id])}/100</td></tr>
        <tr><td>Twój wynik</td><td>${fmt(q.res[G.me].reg[r.id]/q.rv[r.id]*100)}%</td></tr>
        <tr><td>Twoje mandaty</td><td>${AL.byReg[r.id][G.me]||0}</td></tr></table>
      <h4 style="margin:14px 0 6px;font-size:13px">Mandaty w okręgu</h4>
      ${Object.entries(AL.byReg[r.id]).sort((a,b)=>b[1]-a[1]).map(([k,v])=>
        `<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;font-size:13px">
         ${crest(k,'s')}<span style="flex:1">${G.p[k].ab}</span><b class="m">${v}</b></div>`).join('')||'<span class="dim">Brak</span>'}
      <div style="margin-top:12px;padding:10px 12px;background:rgba(0,0,0,.25);border-left:2px solid var(--acc2);
        border-radius:0 4px 4px 0;font-size:12.5px;line-height:1.5">
        <b style="color:var(--tx)">Mnożnik z obecności: ×${Math.pow(cl(.34+(p.pres[r.id]*(1-cl((p.pret-38)/150,0,.42)))/60,.34,2.7),1.32).toFixed(2)}</b>
        <span class="dim">, przy zerowej byłoby ×0,25, przy pełnej ×3,66. To najmocniejsza dźwignia w okręgu.</span></div>
      <div class="note" style="margin-top:10px">Obecność budujesz <b>wyłącznie decyzjami</b>: wiec, kanwasing,
      zalew memami, zjazd i spot. Spada o 12% tygodniowo, więc trzeba ją podtrzymywać.
      Przy 100 zdobywasz w okręgu około sześć razy więcej niż przy zerze, i tyle samo kosztuje to konkurencję.</div>
    </div></div>
  </div>`;
}
function sendTeam(){}

/* ---- akcje ---- */
/* ---- filtry decyzji ---- */
const AFX={
 wiec:['fame','pres'], kanwas:['pres'], spot:['fame','pres'], debata:['fame','risk'],
 luz:['pret','fame'], konsult:['pret','ctr'], werb:['ludzie','rel','risk'], przekw:['ludzie','cred'], kampania_prm:['ludzie','cred','uni'],
 memy:['fame','ctr'], manifest:['fame','cred','pres'],
 rekr:['ludzie'], trening:['lider'], szkol:['lider','ludzie'], statut:['cred','prog'],
 czyst:['uni','ludzie','ctr'], zjazd:['uni','fame','ludzie'],
 wywiad:['fame','cred'], kulisy:['rel'], przepr:['rel','ctr'],
 podkup:['ludzie','ctr','risk'], admin:['ctr','risk'],
 zwrot:['prog'], nisza:['prog','ludzie'], otw:['prog','ludzie'], chlodzenie:['ctr','pret'], depret:['pret','prog'],
 ustawa:['cred','fame'], oredzie:['fame','pres','ludzie'],
 dymisja:['rel','fame','risk'], zmianaMin:['rel','ctr'], rozwiaz:['risk','ctr'],
 wotum:['risk','fame'], oredzieP:['fame','cred','pres','ludzie'],
 sabotaz:['risk','ctr'], odp:['energia'],
};
const AFXN={fame:['Sława','#d9ab45'],ctr:['Kontrowersja','#d5544a'],cred:['Wiarygodność','#5f9bd0'],
 uni:['Jedność','#7fbe69'],ludzie:['Ludzie','#b08fd6'],pres:['Obecność','#4bbd85'],
 rel:['Relacje','#e2a05f'],kp:['Kapitał','#c9a227'],risk:['Ryzyko','#c04a3e'],pret:['Pretensjonalność','#c78ad2'],
 prog:['Program','#9b7fd4'],lider:['Lider','#5f9bd0'],energia:['Energia','#7fbe69']};
function actFx(id){return AFX[id]||[]}
/* ═══ STÓŁ TYGODNIA ═══
   Trzy miejsca na ruchy, które masz w tygodniu. Puste zapraszają, zajęte zostają
   jako zapis tego, co zrobiłeś, razem z liczbami. Wcześniej po zagraniu decyzji
   nie było po niej śladu poza wpisem w kronice — kafel po prostu szarzał. */
const STOL_NAZWY={fame:'sława',cred:'wiarygodność',uni:'jedność',act:'aktywność',mem:'ludzie'};
function stolTygodnia(){
  const klucz=G.term+'-'+G.week;
  const zagrane=(G.stolTyg===klucz&&G.stol)?G.stol:[];
  const wolne=Math.max(0,G.apMax-zagrane.reduce((a,x)=>a+x.ap,0));
  const miejsca=[];
  zagrane.forEach(x=>{for(let i=0;i<x.ap;i++)miejsca.push(i===0?x:{ciag:x})});
  for(let i=0;i<wolne;i++)miejsca.push(null);
  return `<div class="stol">
    <div class="stolh">
      <h3>Twój tydzień</h3>
      <span class="stoln">${wolne?wolne+' '+pl(wolne,'wolny ruch','wolne ruchy','wolnych ruchów'):'tydzień rozegrany'}</span>
    </div>
    <div class="stolm" style="grid-template-columns:repeat(${Math.max(1,miejsca.length)},1fr)">
      ${miejsca.map(m=>{
        if(!m)return `<div class="mj"><div class="pust">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
            stroke-width="1.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
          <b>wolny ruch</b></div></div>`;
        if(m.ciag)return `<div class="mj pelne ciag" style="--ac:${CATCOL[m.ciag.kat]||'var(--line2)'}"></div>`;
        const zm=Object.keys(m.zm).map(k=>
          `<span class="${m.zm[k]>0?'p':'m'}">${STOL_NAZWY[k]} ${m.zm[k]>0?'+':''}${m.zm[k]}</span>`).join('');
        return `<div class="mj pelne" style="--ac:${CATCOL[m.kat]||'var(--line2)'}">
          <div class="ptak"><svg viewBox="0 0 24 24" width="10" height="10" fill="none"
            stroke="#08170a" stroke-width="3" stroke-linecap="round"><path d="M4 13l5 5L20 7"/></svg></div>
          <h4>${m.n}</h4>
          <div class="skut">${zm||'<span class="n">bez zmian w cechach</span>'}</div>
        </div>`}).join('')}
    </div>
  </div>`;
}

/* ═══ ŁUK KADENCJI ═══
   Dwunasty tydzień wyglądał dokładnie jak drugi. Teraz widać, gdzie jesteś
   w cyklu i ile zostało do urny. */
function lukKadencji(){
  const zost=Math.max(0,G.weeks-G.week);
  return `<div class="luk">
    <span class="luke">Kadencja ${G.term}</span>
    <div class="luktor">
      ${Array.from({length:G.weeks}).map((_,i)=>{
        const n=i+1, kl=n<G.week?'byl':n===G.week?'jest':'';
        return `<div class="lukt ${kl}">${n===G.week?`<em>TYDZIEŃ ${n}</em>`:''}<i></i></div>`}).join('')}
    </div>
    <span class="lukurna ${zost<=2?'blisko':''}">${zost===0?'Wybory w tym tygodniu'
      :'Wybory za '+zost+' '+pl(zost,'tydzień','tygodnie','tygodni')}</span>
  </div>`;
}
const CATCOL={kam:'#d9ab45',org:'#5f9bd0',dyp:'#7fbe69',bru:'#c04a3e',pro:'#b08fd6',
  wla:'#c8952b',prem:'#e0b23c',prz:'#b08fd6',opo:'#b0674a',spe:'#75695b',prm:'#8e1e5e'};
/* Kafle decyzji. Osobno, bo te same karty pokazują się i w Decyzjach,
   i w działach Premiera oraz Prezydenta. */
/* ══════════ INFLACJA ══════════
   Kapitał ma pracować, a nie leżeć. Kto zbiera i nie wydaje, ten napędza ceny:
   im większa góra pieniędzy, tym drożej wychodzi każda decyzja. Przy naprawdę
   grubym worku wystarczy na jedną akcję w tygodniu i tyle — trzymanie zapasu
   przestaje być darmową strategią. */
const INFLACJA_PROG = 120;      // do tego poziomu ceny są normalne
const INFLACJA_MAKS = 2.6;      // wyżej niż tyle już nie rośnie
function inflacja(){
  if(!G||typeof G.kp!=='number')return 1;
  const ponad=G.kp-INFLACJA_PROG;
  if(ponad<=0)return 1;
  return Math.min(INFLACJA_MAKS,1+ponad/260);
}
const inflacjaProc=()=>Math.round((inflacja()-1)*100);

function actCards(list,fx){
  return list.map(a=>{
    const f=fat(a.id),done=a.once&&G.once[a.id];
    const usedT=(a.term1&&G.useTerm[a.id]);
    const noShame=a.shame&&!(G.shame&&G.shame>G.week);
    const catFull=a.cat!=='spe'&&(G.catUsed[a.cat]||0)>=1;
    // decyzje z limitem tygodniowym (regeneracja): dwa razy i koniec
    const limT=!!a.tydz2&&((G.used2&&G.used2[a.id])||0)>=2;
    const kpC=Math.round(a.kp*sizeF(me()).kp*inflacja());   // cena z uwzględnieniem inflacji
    const ok=G.ap>=a.ap&&G.kp>=kpC&&(a.en<0||G.en>=a.en)&&!done&&!usedT&&!limT&&!catFull&&!noShame&&!(a.id==='rekr'&&G.recCd>0);
    const col=CATCOL[a.cat]||'var(--line2)';
    const cb=G.lastAct&&COMBO.find(c=>c.a===G.lastAct&&c.b===a.id);
    const katN=(CATS.find(x=>x[0]===a.cat)||['',''])[1]||'Ta kategoria';
    const blok=done?'wykorzystane':usedT?'zużyte w tej kadencji'
      // blokuje kategoria, nie ta jedna decyzja — bez tego wygląda to na zepsuty przycisk
      :limT?'wykorzystane dwa razy w tym tygodniu'
      :catFull?`nie ta decyzja — cała kategoria ${katN} zamknięta do przyszłego tygodnia`
      :noShame?'dostępne tylko tuż po wpadce':(a.id==='rekr'&&G.recCd>0)?`nabór wraca za ${G.recCd} ${pl(G.recCd,'tydzień','tygodnie','tygodni')}`
      :G.ap<a.ap?'za mało akcji':G.kp<kpC?'za mało kapitału':(a.en>0&&G.en<a.en)?'za mało energii':'';
    const wym=[a.reg?'okręg':'',a.tem?'temat':'',a.tgt?'cel':'',a.seg?'grupa':''].filter(Boolean);
    return `<button class="act" ${ok?'':'disabled'} style="--ac:${col}" onclick="doAct('${a.id}')"
      onmouseenter="podglad('${a.id}')" onmouseleave="podglad('')">
      <div class="ahd">
        <div style="min-width:0"><h4>${a.n}</h4>
          <div class="afx">${actFx(a.id).map(x=>`<span style="--fc:${AFXN[x][1]}"><i></i>${AFXN[x][0]}</span>`).join('')}</div></div>
        <div class="apx" title="${a.ap} ${pl(a.ap,'akcja','akcje','akcji')}">${Array.from({length:3}).map((_,i)=>`<b class="${i<a.ap?'on':''}"></b>`).join('')}</div>
      </div>
      <div class="dd">${a.d}</div>
      <div class="c">
        ${a.kp?`<span class="cst ${G.kp<kpC?'no':''}"><em>${ikona('kapital','mini')}kapitał</em>${kpC}</span>`:''}
        <span class="cst ${a.en>0?(G.en<a.en?'no':''):'yes'}"><em>${ikona('energia','mini')}energia</em>${a.en>0?'−'+Math.round(a.en*.82*sizeF(me()).en):'+'+(-a.en)}</span>
        ${f<.9?`<span class="cst ft"><em>zmęczenie</em>×${f.toFixed(2)}</span>`:''}
        ${cb?`<span class="cst ${cb.m>1?'yes':'no'}"><em>${cb.n}</em>×${cb.m.toFixed(2)}</span>`:''}
        ${wym.length?`<span class="cst dimx"><em>wybierasz</em>${wym.join(' + ')}</span>`:''}
        ${fx?`<span class="cst dimx"><em>kategoria</em>${katN}</span>`:''}
        ${a.term1&&!usedT?'<span class="cst ft"><em>limit</em>raz na kadencję</span>':''}
      </div>
      ${blok?`<div class="blk">${blok}</div>`:''}
    </button>`}).join('')||'<div class="note">Nic z tym skutkiem nie jest teraz dostępne.</div>';
}
/* ---- dział Premiera: rada ministrów, ustawy, decyzje rządowe ---- */
function premierTab(){
  lawsInit();radaInit();
  const g=G.gov,swoi=roster(me());
  const obsadzone=RESORTY.filter(r=>radaKto(r.id)).length;
  const moich=RESORTY.filter(r=>{const n=radaKto(r.id);return n&&swoi.includes(n)}).length;

  return `<div class="card urzad prem"><div class="h"><h3>Kancelaria premiera</h3>
    <span class="n">${G.p[G.me].ab} · kadencja ${G.term}</span></div><div class="b">
    <div class="urow">
      <div class="ubox"><b>${obsadzone}/${RESORTY.length}</b><span>obsadzonych resortów</span></div>
      <div class="ubox"><b>${moich}</b><span>ministrów z twojej partii</span></div>
      <div class="ubox"><b>${LAWS.filter(l=>lawDone(l.id)).length}/${LAWS.length}</b><span>ustaw w mocy</span></div>
      ${(()=>{const s=g&&typeof g.spraw==='number'?Math.round(g.spraw):50;
        const kol=s>=60?'var(--pos)':s<=30?'var(--neg)':'var(--acc)';
        return `<div class="ubox" title="Ile z tego, co rząd wnosi pod głosowanie, faktycznie przechodzi. Przegrane ustawy zbijają poparcie rządu i biją po premierze.">
          <b style="color:${kol}">${s}</b><span>sprawczość rządu</span></div>`})()}
    </div>
    ${(g&&g.przegrane>=2)?`<div class="spentbar"><b>Rząd przegrał ${g.przegrane} ${pl(g.przegrane,'głosowanie','głosowania','głosowań')}.</b>
      Sprawczość spada, a z nią poparcie gabinetu i twoja pozycja. Sprawdź, kto w koalicji przestał głosować z tobą.</div>`:''}
    <div class="note" style="margin:14px 0 0">Ministrowie z własnej partii budują twoją sławę.
    Resort oddany koalicjantowi kupuje przychylność jego partii, ale pracuje na jej konto.
    Cały rząd możesz przemeblować w jednym tygodniu.</div>
  </div></div>

  <div class="card urzad prem" style="margin-top:14px"><div class="h"><h3>Rada ministrów</h3>
    <span class="n">${obsadzone} z ${RESORTY.length}</span></div><div class="b">
    <div class="resgrid">${RESORTY.map(r=>{
      const kto=radaKto(r.id), kPart=kto?partiaOsoby(kto):null, swoj=kto&&swoi.includes(kto);
      return `<button class="resort ${kto?'on':''} ${swoj?'swoj':''} ${!kto&&pusteResorty().length?'wolne':''}" onclick="openResort('${r.id}')">
        <div class="rnm">${r.n}</div>
        ${kto?`<div class="rkto">${ava(kto,kPart?G.p[kPart].c:'#666',26)}<div style="min-width:0">
            <b>${kto}</b><span>${swoj?'twoja partia':(kPart?G.p[kPart].ab:'bezpartyjny')}</span></div></div>`
          :`<div class="rwakat">wakat — kliknij, żeby obsadzić</div>`}
      </button>`}).join('')}</div>
  </div></div>

  ${lawsCard()}

  <div class="card" style="margin-top:14px"><div class="h"><h3>Decyzje premiera</h3>
    <span class="n">${ikona('akcje','sm')}${G.ap}/${G.apMax}</span></div><div class="b">
    <div class="actgrid">${actCards(A.filter(a=>a.cat==='prem'),'')}</div>
  </div></div>`;
}

function lawsCard(){
  lawsInit();
  const pend=G.lawPend?lawById(G.lawPend.id):null;
  return `<div class="card urzad ustawy" style="margin-top:14px"><div class="h"><h3>Ustawy</h3>
    <span class="n">${G.lawPend?'jedna u prezydenta':'możesz zgłosić'}</span></div><div class="b">
    ${pend?`<div class="lawpend">
      <div class="lp1">Czeka na podpis prezydenta</div>
      <b>${pend.n}</b>
      <span>Sejm: za ${G.lawPend.za}, przeciw ${G.lawPend.przeciw}. Dopóki nie zapadnie decyzja, nie zgłosisz kolejnej.</span>
    </div>`:''}
    <div class="note" style="margin:${pend?'14px 0':'0 0 14px'}">Każda ustawa wchodzi w życie na stałe i działa do końca rozgrywki.
    Za przegłosowaną dostajesz <b>+1 osobę, +1 aktywność i +2 sławy</b>. Jedno podejście do każdej ustawy na kadencję,
    a sejm rozpatruje <b>jeden projekt tygodniowo</b>.</div>
    ${ustawaWTymTygodniu()?`<div class="spentbar"><b>Sejm ma już projekt na ten tydzień.</b>
      Kolejny złożysz po naciśnięciu <b>Kolejny tydzień</b>. Limit „raz na kadencję” dla każdej ustawy zostaje bez zmian.</div>`:''}
    <div class="lawgrid">${LAWS.map(l=>{
      const w=lawDone(l.id), proba=G.lawTerm[l.id], edyt=lawEdytowalna(l.id);
      const zajete=ustawaWTymTygodniu();
      const mozna=isPM()&&!proba&&!G.lawPend&&!zajete&&(!w||edyt);
      const stan=proba?'próbowane w tej kadencji':G.lawPend?'najpierw dokończ poprzednią'
        :zajete?'sejm ma już projekt na ten tydzień'
        :w?(edyt?'w mocy — można poprawić':'w mocy'):'do zgłoszenia';
      const nastawy=(w&&edyt)?lawParams(l.id):null;
      return `<button class="law ${w?'on':''}" ${mozna?'':'disabled'} onclick="startLaw('${l.id}')">
        <div class="lhd"><h4>${l.n}</h4><span class="lkat ${l.kat}">${l.kat}</span></div>
        <div class="ld">${l.d}</div>
        <div class="lsk"><b>Skutek:</b> ${l.skutek}</div>
        ${nastawy?`<div class="lnast">${Object.keys(nastawy).map(k=>
          `<span>${LAWPAR[l.id].opis[k]} <b>${nastawy[k]}${k==='prog'?'%':''}</b></span>`).join('')}</div>`:''}
        <div class="lft"><span>${l.prog>.6?'wymaga 2/3 głosów':'zwykła większość'}</span><i>${stan}</i></div>
      </button>`}).join('')}</div>
  </div></div>`;
}
/* Kto ma prawo złożyć projekt: premier każdy, minister tylko ze swojego resortu.
   Dlatego rozdanie ministerstw to realna decyzja — oddajesz komuś prawo do ustaw. */
function mojeResorty(){
  radaInit();
  return RESORTY.filter(r=>{const n=radaKto(r.id);return n&&partiaOsoby(n)===G.me}).map(r=>r.id);
}
function mogeZglosic(id){
  const l=lawById(id);if(!l)return false;
  // kto nie ma ani jednego mandatu, ten nie ma prawa inicjatywy — nie miałby nawet jak zagłosować
  if(!me().seats)return false;
  if(isPM())return true;
  return !!(l.resort&&mojeResorty().includes(l.resort));
}
/* Sejm rozpatruje jeden projekt tygodniowo. Każda ustawa z osobna ma nadal swoje
   jedno podejście na kadencję — ten limit tylko rozkłada je w czasie, żeby nie
   dało się w jednym tygodniu przepchnąć całego programu naraz. */
const ustawaWTymTygodniu=()=>G.lawWeek===G.term+'-'+G.week;
function startLaw(id){
  const l=lawById(id);if(!l||!mogeZglosic(id)||G.lawPend||G.lawTerm[id])return;
  if(lawDone(id)&&!lawEdytowalna(id))return;
  if(ustawaWTymTygodniu())return modal('Sejm','Laska marszałkowska zajęta',
    `<p>Sejm rozpatruje w tygodniu <b>jeden</b> projekt, a ten tydzień jest już zajęty.
     Wróć do <b>${l.n}</b> w przyszłym tygodniu.</p>
     <p class="dim">Każda ustawa i tak ma tylko jedno podejście na kadencję — chodzi o to,
     żeby nie dało się przepchnąć całego programu w jeden wieczór.</p>`,
    [{l:'Rozumiem',f:close}],close);
  if(lawEdytowalna(id))return openEdycja(id);
  if(l.warianty)return openWariant(id);
  const w=lawVote(id);   // podgląd nastrojów, zanim gracz zdecyduje
  modal('Sejm',l.n,
    `<p>${l.d}</p><p><b>Skutek:</b> ${l.skutek}</p>
     <p style="margin-top:10px">Do przejścia trzeba ${l.prog>.6?'<b>dwóch trzecich</b>':'<b>zwykłej większości</b>'} głosów.
     Licząc obecne nastroje sejmu, wygląda to na <b>${w.ok?'przechodzące':'przegrane'}</b>, ale głosowanie i tak rozstrzygnie się przy urnie.</p>`,
    [{l:'Kieruję pod głosowanie',
      s:(G.gov&&G.pmOk&&!G.gov.parties.includes(G.me))
        ? `Uwaga: nie jesteś w rządzie — zasługę zapisze premier ${G.p[G.gov.pm].ab}`
        : 'Sejm głosuje od razu',
      f:()=>proposeLaw(id)},
     {l:'Jeszcze nie teraz',s:'Wrócisz do tego później',f:close}],close);
}
/* ── ustawy z wariantem ──
   Niektóre ustawy nie są jednym przełącznikiem, tylko wyborem, co konkretnie
   powstanie: jaki event, jakie przedsięwzięcie Akademii. Płaci za nie
   przewodniczący z własnego majątku, nie partia — stąd biorą się pieniądze
   z zarabiania kapitału prywatnego i stąd ma sens go zbierać. */
const wariantyUstawy=id=>{const l=lawById(id);return (l&&l.warianty)||null};
const wariantPo=(id,w)=>(wariantyUstawy(id)||[]).find(x=>x.id===w)||null;
const majatekSzefa=()=>{const n=G&&G.p&&G.p[G.me]?G.p[G.me].lead:null;return n?kapPryw(n):0};
function openWariant(id){
  const l=lawById(id), maj=majatekSzefa(), szef=me().lead;
  modal('Sejm',l.n,
    `<p>${l.d}</p>
     <p style="margin-top:10px"><b>${szef}</b> ma w kieszeni <b>${kasa(maj)}</b>.
     Koszt schodzi z prywatnego majątku przewodniczącego dopiero wtedy, gdy sejm ustawę uchwali.</p>`,
    l.warianty.map(w=>{const stac=maj>=w.mln*1e6;
      return {l:`${w.n} — ${w.mln} mln`,
        s:stac?w.d:`Nie stać cię: brakuje ${kasaSkrot(w.mln*1e6-maj)}`,
        dis:!stac, f:()=>proposeLaw(id,{wariant:w.id})}})
      .concat([{l:'Jeszcze nie teraz',s:'Wrócisz do tego później',f:close}]),
    close);
}

/* Jedno okno do wszystkich ustaw z pokrętłami — i przy zgłaszaniu, i przy poprawianiu. */
let EDYT=null;
function openEdycja(id){
  const P=LAWPAR[id];if(!P)return;
  EDYT={id,o:lawParams(id)};
  edytRys();
}
function edytSet(pole,v){
  if(!EDYT)return;
  const P=LAWPAR[EDYT.id],z=P.zakres[pole];
  const krok=P.krok[pole];
  EDYT.o[pole]=Math.round(cl(EDYT.o[pole]+v*krok,z[0],z[1])*100)/100;
  edytRys();
}
function edytOk(){if(EDYT)proposeLaw(EDYT.id,Object.assign({},EDYT.o))}
function edytRys(){
  const {id,o}=EDYT, P=LAWPAR[id], law=lawById(id), wMocy=lawDone(id);
  const rad=radykalnosc(id,o);
  const kolor=rad<.3?'var(--pos)':rad<.55?'var(--acc)':'var(--neg)';
  const v=rysujOkno('edyt-'+id,`<button class="mdlx" type="button" aria-label="Zamknij">×</button>
    <div class="h"><div class="k">${wMocy?'Poprawka do ustawy':'Nowa ustawa'}</div><h2>${law.n}</h2></div>
    <div class="bd">
      <p>${law.d}</p>
      ${wMocy?'<div class="note" style="margin:0 0 14px">Ustawa już obowiązuje. Poprawka idzie pod głosowanie tak samo jak nowa i tak samo się opłaca.</div>':''}
      ${Object.keys(P.baza).map(k=>{
        const b=P.baza[k],teraz=o[k],zmiana=teraz-b;
        return `<div class="ordrow">
          <div class="ordlab"><b>${P.opis[k]}</b><span>wyjściowo ${b}${k==='prog'?'%':''}</span></div>
          <div class="crb"><button onclick="edytSet('${k}',-1)">−</button>
            <b>${teraz}${k==='prog'?'%':''}</b><button onclick="edytSet('${k}',1)">+</button></div>
          <div class="ordzm ${zmiana>0?'up':zmiana<0?'dn':''}">${zmiana?(zmiana>0?'+':'')+Math.round(zmiana*100)/100:'bez zmian'}</div>
        </div>`}).join('')}
      <div class="oporbar">
        <div class="ol"><span>Opór sejmu</span><b style="color:${kolor}">${Math.round(rad*100*nastrojSejmu())}%</b></div>
        <div class="trk"><i style="width:${Math.min(100,Math.round(rad*100*nastrojSejmu()))}%;background:${kolor}"></i></div>
        <div class="od">${oporOpis(rad)} ${nastrojOpis()}</div>
      </div>
    </div>
    <div class="op">
      <button class="opt" id="eok"><b>Kieruję pod głosowanie</b><span>${Object.keys(P.baza).map(k=>P.opis[k]+' '+o[k]).join(' · ')}</span></button>
      <button class="opt" id="eno"><b>Jednak nie</b><span>Nic nie zmieniasz</span></button></div>`);
  v.querySelector('.mdlx').onclick=close;
  v.querySelector('#eno').onclick=close;
  v.querySelector('#eok').onclick=edytOk;
}

/* ---- dział Prezydenta: podpis albo weto, orędzie, decyzje pałacu ---- */
function prezydentTab(){
  lawsInit();
  const pend=G.lawPend?lawById(G.lawPend.id):null;
  const pmK=G.gov?G.gov.pm:null;
  const wMocy=LAWS.filter(l=>lawDone(l.id));
  return `<div class="card urzad prez"><div class="h"><h3>Pałac prezydencki</h3>
    <span class="n">${G.prez?G.prez.lead:'—'} · do kadencji ${G.prez?G.prez.until:'—'}</span></div><div class="b">
    <div class="urow">
      <div class="ubox"><b>${wMocy.length}</b><span>ustaw w mocy</span></div>
      <div class="ubox"><b>${G.lawPend?1:0}</b><span>czeka na biurku</span></div>
      <div class="ubox"><b>${G.useTerm&&G.useTerm.oredzieP?'zużyte':'wolne'}</b><span>orędzie w tej kadencji</span></div>
    </div>
    <div class="note" style="margin:14px 0 0">Podpis poprawia relacje z premierem, ale wzmacnia jego partię.
    Weto kosztuje cię <b>2 kontrowersji</b> i psuje relacje — za to nie wpuszcza w życie czegoś, co pomoże rywalowi.</div>
  </div></div>

  <div class="card urzad prez" style="margin-top:14px"><div class="h"><h3>Biurko prezydenta</h3>
    <span class="n">${pend?'ustawa do decyzji':'pusto'}</span></div><div class="b">
    ${pend?`<div class="lawdesk">
      <div class="lp1">${pmK?`Premier ${G.p[pmK].ab} kieruje do podpisu`:'Sejm kieruje do podpisu'}</div>
      <b>${pend.n}</b>
      <div class="ld" style="margin:7px 0 10px">${pend.d}</div>
      <div class="lsk"><b>Skutek:</b> ${pend.skutek}</div>
      <div class="lawtally">
        <span class="ok">za ${G.lawPend.za}</span>
        <span class="no">przeciw ${G.lawPend.przeciw}</span>
        <span>wstrzymało się ${G.lawPend.wstrzym}</span>
      </div>
      ${lawGlosy(G.lawPend)}
      <div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap">
        <button class="btn" onclick="signLaw(true)">Podpisuję ustawę</button>
        <button class="btn g" onclick="signLaw(false)">Odrzucam, weto</button>
      </div>
    </div>`:`<div class="note" style="margin:0">Nic nie czeka na podpis. Ustawy trafiają tu dopiero,
      gdy przejdą przez sejm.</div>`}
  </div></div>

  ${wMocy.length?`<div class="card" style="margin-top:14px"><div class="h"><h3>Ustawy obowiązujące</h3>
    <span class="n">${wMocy.length}</span></div><div class="b">
    ${wMocy.map(l=>`<div class="lawrow"><b>${l.n}</b><span>${l.skutek}</span></div>`).join('')}
  </div></div>`:''}

  <div class="card" style="margin-top:14px"><div class="h"><h3>Decyzje prezydenta</h3>
    <span class="n">${ikona('akcje','sm')}${G.ap}/${G.apMax}</span></div><div class="b">
    <div class="actgrid">${actCards(A.filter(a=>a.cat==='prz'),'')}</div>
  </div></div>`;
}

/* Ile prób wystarczy, żeby zobaczyć rozrzut, a interfejs nie zamulił.
   Decyzje losowe pokazują widełki, pewne — jedną liczbę. */
const PROB_ILE=9;
const PODG_CECHY=[['fame','Sława'],['cred','Wiarygodność'],['uni','Jedność'],
                  ['act','Aktywność'],['ctr','Kontrowersja'],['pret','Pretensjonalność']];
let podgladCache={};
function przewidz(id){
  const a=A.find(x=>x.id===id); if(!a||!a.f||!G)return null;
  const klucz=id+'|'+G.term+'-'+G.week+'|'+Math.round(me().fame)+'|'+(G.used[id]||0);
  if(podgladCache[klucz])return podgladCache[klucz];

  const kopiaG=JSON.stringify(G), prawdziwe=G;
  const wynik={};
  PROBA=1;
  try{
    for(let i=0;i<PROB_ILE;i++){
      G=JSON.parse(kopiaG);
      const przed=snap();
      const f=fat(a.id);
      // losowe wymagania decyzji dobieramy sami, żeby dało się ją w ogóle odpalić
      const r=a.reg?REG[0].id:null, tm=a.tem?TEM[0].id:null;
      const cel=a.tgt?alive().find(k=>k!==G.me):null;
      const seg=a.seg?SID[0]:null;
      try{ a.f(me(),f,cel,r,seg,tm); }catch(e){ /* decyzja bez sensownego celu — pomijamy próbę */ }
      const po=snap();
      PODG_CECHY.forEach(([k])=>{
        const d=po[k]-przed[k]; if(Math.abs(d)<.5)return;
        if(!wynik[k])wynik[k]={min:d,max:d};
        wynik[k].min=Math.min(wynik[k].min,d);
        wynik[k].max=Math.max(wynik[k].max,d);
      });
    }
  } finally {
    G=prawdziwe;          // stan wraca zawsze, nawet gdy decyzja rzuci wyjątkiem
    PROBA=0;
  }
  Object.keys(wynik).forEach(k=>{
    wynik[k].min=Math.round(wynik[k].min); wynik[k].max=Math.round(wynik[k].max);
  });
  podgladCache[klucz]=wynik;
  return wynik;
}

/* Duch na paskach w bocznej kolumnie: pokazuje, dokąd pojedzie każda cecha,
   zanim klikniesz. Rusza samym DOM-em, bez przerysowywania ekranu. */
/* Decyzje, których skutek rozstrzyga się dopiero w oknie — podgląd nie ma tu
   czego pokazać i musi to powiedzieć wprost, zamiast milczeć jak przy decyzji
   bez skutków. */
const BEZ_PODGLADU={rekr:'Nabór liczy się z ogłoszenia, które ułożysz w oknie.',
  wywiad:'Wynik zależy od odpowiedzi, których udzielisz na żywo.',
  stery:'Skutek zależy od tego, kogo posadzisz u steru.',
  szkolenie:'Wybierasz w oknie, którą cechę podnosisz.',
  dymisja:'Zależy od tego, kogo wyrzucisz z rządu.',
  zmianaMin:'Zależy od tego, kogo posadzisz na resorcie.'};
function podglad(id){
  const box=document.getElementById('paskiCech'); if(!box)return;
  const w=id?przewidz(id):null;
  const nota=document.getElementById('podgNota');
  if(nota){
    const t=id&&BEZ_PODGLADU[id]&&(!w||!Object.keys(w).length)?BEZ_PODGLADU[id]:'';
    nota.textContent=t; nota.classList.toggle('wid',!!t);
  }
  PODG_CECHY.forEach(([k])=>{
    const pas=box.querySelector('.trk[data-c="'+k+'"]'); if(!pas)return;
    const duch=pas.querySelector('.duch'), et=box.querySelector('.wart[data-c="'+k+'"]');
    const zm=w&&w[k];
    if(!zm){duch.classList.remove('wid');if(et){et.textContent=et.dataset.v;et.style.color=''}return}
    const od=+pas.dataset.v, sr=(zm.min+zm.max)/2;
    const do_=cl(od+sr);
    duch.classList.add('wid');
    duch.classList.toggle('ujem',sr<0);
    duch.style.left=Math.min(od,do_)+'%';
    duch.style.width=Math.abs(do_-od)+'%';
    if(et){
      const wid=zm.min!==zm.max?`${zm.min>0?'+':''}${zm.min}…${zm.max>0?'+':''}${zm.max}`
                               :`${zm.min>0?'+':''}${zm.min}`;
      et.textContent=Math.round(od)+' '+wid;
      et.style.color=sr>0?'var(--pos)':'var(--neg)';
    }
  });
}

function actTab(){
  const cats=CATS.filter(([c])=>c==='wla'?inGov():c==='prem'?isPM():c==='prz'?hasPrez():c==='opo'?!inGov():c==='prm'?hasLsd(G.me):true);
  if(!cats.find(c=>c[0]===G.cat))G.cat='kam';
  const fx=G.fx||'';
  let list=A.filter(a=>a.cat===G.cat);
  if(fx)list=A.filter(a=>actFx(a.id).includes(fx)&&cats.some(c=>c[0]===a.cat));
  const dost=new Set();A.forEach(a=>{if(cats.some(c=>c[0]===a.cat))actFx(a.id).forEach(f=>dost.add(f))});
  // ile kategorii stoi jeszcze otworem — inaczej gracz widzi tylko wyszarzone kafle
  const wolnych=cats.filter(([c])=>c==='spe'||!(G.catUsed[c]||0)).length;
  return `${stolTygodnia()}
  <div class="card"><div class="h"><h3>Decyzje tygodnia</h3>
    <span class="n">${ikona('akcje','sm')}${G.ap}/${G.apMax} akcji · ${ikona('kapital','sm')}${Math.round(G.kp)} kapitału · ${ikona('energia','sm')}${Math.round(G.en)} energii
    · ${wolnych} ${pl(wolnych,'kategoria otwarta','kategorie otwarte','kategorii otwartych')}</span></div>
    <div class="b">
    <div class="cats">${cats.map(([c,n])=>{
      const zuzyta=c!=='spe'&&(G.catUsed[c]||0)>=1;   // widać od razu, w czym już zagrałeś w tym tygodniu
      return `<button class="${!fx&&G.cat===c?'on':''} ${zuzyta?'spent':''} ${c==='prz'||c==='prem'?'roy':''}"
        onclick="setCat('${c}')" title="${zuzyta?'Decyzja z tej kategorii już wykorzystana w tym tygodniu':n}">${zuzyta?'✓ ':''}${n}</button>`}).join('')}</div>
    <div class="fxbar">
      <span class="fxlab">Filtruj po skutku decyzji</span>
      <button class="fx ${fx?'':'on'}" onclick="setFx('')">wszystkie</button>
      ${Object.keys(AFXN).filter(f=>dost.has(f)).map(f=>`<button class="fx ${fx===f?'on':''}"
        style="${fx===f?`background:${AFXN[f][1]};border-color:${AFXN[f][1]};color:#10140f`:`color:${AFXN[f][1]};border-color:${AFXN[f][1]}55`}"
        onclick="setFx('${f}')">${AFXN[f][0]}</button>`).join('')}
    </div>
    ${(!fx&&G.cat!=='spe'&&(G.catUsed[G.cat]||0)>=1)?`<div class="spentbar">
      <b>${(CATS.find(c=>c[0]===G.cat)||['',''])[1]} jest już zamknięta na ten tydzień.</b>
      Zagrałeś tu decyzję, dlatego wszystko poniżej jest wyszarzone i nie reaguje na kliknięcia — tak ma być.
      Wróci za 1 tydzień, po naciśnięciu <b>Kolejny tydzień</b>. Do tego czasu zostają ci kategorie bez znaczka ✓.</div>`:''}
    <div class="actgrid">${actCards(list,fx)}</div>
    <div class="note"><b>Jedna decyzja z każdej kategorii na tydzień.</b> Kolejność też się liczy: kanwasing przed wiecem daje ×1,55, ale manifest przed memami tylko ×0,55.
    Filtr „po skutku” pokazuje decyzje z wszystkich kategorii naraz.</div>
  </div></div>
  ${agentBox()}`;
}
function agentBox(){
  const wolni=AGENTS.filter(a=>agentFree(a.n)), moi=AGENTS.filter(a=>G.agents[a.n]===G.me);
  const zostalo=agenciZostalo();
  const blok=G.agentWeek===G.term+'-'+G.week||!zostalo;
  return `<div class="card" style="margin-top:14px"><div class="h"><h3>Transfery bezpartyjnych</h3>
    <span class="n">${wolni.length} ${pl(wolni.length,'wolny','wolnych','wolnych')} · ${moi.length} u ciebie ·
      <b style="color:${zostalo?'var(--acc)':'var(--neg)'}">${zostalo}/${AGENCI_NA_KADENCJE}</b> w kadencji</span></div><div class="b">
    <div class="note" style="margin:0 0 13px">Poza partiami chodzi po serwerze kilka osób, które da się ściągnąć czystym kapitałem, bez akcji i bez zgody kogokolwiek.
    <b>Dwa transfery na kadencję</b>, najwyżej jeden na tydzień.
    ${!zostalo?'<b style="color:var(--neg)">Limit tej kadencji wyczerpany</b> — kolejni bezpartyjni dopiero po wyborach.'
      :G.agentWeek===G.term+'-'+G.week?'<b>W tym tygodniu podpisałeś już transfer.</b>':''}
    Inne partie robią to samo, kto pierwszy ten lepszy.</div>
    <div class="agrid">${wolni.map(a=>{
      const c=agentCost(a.n), st=LEAD[a.n]||[50,50,50,50];
      const sc=SEG.find(x=>x.id===a.seg).c;
      const ok=!blok&&G.kp>=c;
      return `<div class="agent" style="--ac:${sc}">
        <div class="ahead">${ava(a.n,sc,44)}
          <div style="min-width:0;flex:1">
            <b>${a.n}</b>
            <span class="aseg" style="color:${sc}">${sn(a.seg)}</span>
          </div>
          <div class="aprice ${G.kp<c?'no':''}">${c}<i>kap.</i></div>
        </div>
        <div class="adesc">${a.d}</div>
        <div class="astat">${['charyzma','kompet.','wytrz.','autorytet'].map((x,i)=>`<span>${x} <b>${st[i]}</b></span>`).join('')}</div>
        <button class="btn sm" ${ok?'':'disabled'} onclick="signAgent('${esc(a.n)}')">${!zostalo?'Limit kadencji wyczerpany':G.agentWeek===G.term+'-'+G.week?'Transfer w tym tygodniu zużyty':G.kp<c?'Za mało kapitału':'Podpisuję transfer'}</button>
      </div>`}).join('')||'<span class="dim">Nikt wolny nie chodzi teraz po serwerze. Wróć za tydzień.</span>'}</div>
  </div></div>`;
}

let pend=null;
function doAct(id){
  const a=A.find(x=>x.id===id);
  if(G.ap<a.ap||G.kp<a.kp||(a.en>0&&G.en<a.en))return;
  pend={a,t:null,r:null,s:null,tem:null};
  if(me().ctr>=70&&actFx(a.id).includes('ctr')&&!G.noWarn){
    return modal('Ostrożnie','Ta decyzja podbije kontrowersję',
      `<p>Masz już <b>${Math.round(me().ctr)}/100</b> kontrowersji. Przy 90 partia wpada w paraliż:
       sondaż liczony na pół, kapitał wycieka, a co tydzień ktoś odchodzi. Na pewno w to idziesz?</p>`,
      [{l:'Tak, robię to',s:a.n,f:()=>{close();step()}},
       {l:'Nie, odpuszczam',s:'Nie tracisz nic',f:()=>{pend=null;close();render()}},
       {l:'Tak i nie pytaj mnie więcej w tej rozgrywce',s:'Wyłącza ostrzeżenie do końca gry',
        f:()=>{G.noWarn=1;close();step()}}],
      ()=>{pend=null;close();render()});
  }
  step();
}
function step(){
  const a=pend.a;
  if(a.reg&&!pend.r)return chooseReg();
  if(a.tem&&!pend.tem)return chooseTem();
  if(a.tgt&&!pend.t)return chooseTgt();
  if(a.seg&&!pend.s)return chooseSeg();
  fire(a,pend.t,pend.r,pend.s,pend.tem);
}
function fire(a,t,r,s,tm){
  const p0=me(),f0=p0.fame,m0=p0.mem,c0=p0.ctr,pr0=p0.pret,rel0=t?G.rel[G.me][t]:null;
  const stolPrzed=snap();   // stan sprzed decyzji, żeby stół pokazał jej własny skutek
  const prs0=Object.fromEntries(REG.map(x=>[x.id,p0.pres[x.id]]));
  const cb=G.lastAct?COMBO.find(c=>c.a===G.lastAct&&c.b===a.id):null;
  const sf=sizeF(p0), tr=hasT;
  const enMul=(tr('twardziel')?.75:1)*sf.en*BAL.energiaMnoznik;
  const kpMul=sf.kp*(hasT('strateg')?.82:1)*(hasLsd(G.me)?.80:1)*inflacja();
  G.ap-=a.ap;G.kp-=Math.round(a.kp*kpMul);G.en=cl(G.en-(a.en>0?a.en*enMul:a.en));
  // co było zużyte wcześniej, zostaje zużyte — rezygnacja cofa wyłącznie to, co pobrała ta decyzja
  const limitStad=!!a.term1&&!G.useTerm[a.id], razStad=!!a.once&&!G.once[a.id];
  if(a.once)G.once[a.id]=1;
  if(a.term1)G.useTerm[a.id]=1;
  if(a.tydz2){if(!G.used2)G.used2={};G.used2[a.id]=(G.used2[a.id]||0)+1}
  const f=fat(a.id);G.used[a.id]=(G.used[a.id]||0)+1;
  // limity zapisujemy razem z kosztem, żeby rezygnacja w oknie cofnęła jedno i drugie
  G.lastCharge={ap:a.ap,kp:Math.round(a.kp*kpMul),en:(a.en>0?a.en*enMul:a.en),id:a.id,cat:a.cat,
                term1:limitStad,once:razStad};
  const msg=a.f(me(),f,t,r,s,tm);
  if(msg)G.lastCharge=null;
  const p=me();
  if(p.fame>f0){const d=Math.max(.50,1-Math.pow(cl(f0/Math.max(p.pot,1),0,1.4),2.4));
    let mul=d*sf.fame;
    mul*=streakMul();
    if(tr('mowca')&&['wiec','oredzie','oredzieP'].includes(a.id))mul*=1.35;
    if(tr('showman')&&a.cat==='bru')mul*=1.40;
    p.fame=f0+(p.fame-f0)*mul}
  if(p.mem>m0){const raw=p.mem,d2=Math.max(.3,1-Math.pow(cl(m0/110,0,1),1.5));
    p.mem=raw}
  /* Ustawa o sądach administracyjnych: kto ją przepchnął, ten ma procedurę po swojej
     stronie i brudne zagrywki kosztują go o połowę mniej wizerunku. */
  if(a.cat==='bru'&&lawDone('sady')){
    const autor=G.lawBy&&G.lawBy.sady===G.me;
    const ulga=autor?.5:.85;
    if(p.ctr>c0)p.ctr=c0+(p.ctr-c0)*ulga;
    if(p.pret>pr0)p.pret=pr0+(p.pret-pr0)*ulga;
  }
  // kolejność ma znaczenie: powiązane decyzje wzmacniają się, sprzeczne kasują
  if(cb){
    if(p.fame>f0)p.fame=f0+(p.fame-f0)*cb.m;
    REG.forEach(x=>{const d=p.pres[x.id]-prs0[x.id];if(d>0)p.pres[x.id]=cl(prs0[x.id]+d*cb.m)});
    if(cb.m<1){p.cred=cl(p.cred-3);M(p,-3)} else {M(p,3)}
    say(`<b>${cb.n}${cb.m<1?' (−)':' (+)'}</b> ${cb.d} Efekt ×${cb.m.toFixed(2)}.`,cb.m<1?'bad':'good');
  }
  const gb=(goalDone('republika')?1.15:1)*((goalDone('demokraci')&&isLead(p,'loof')&&a.cat==='kam')?1.25:1);
  if(gb>1){
    if(p.fame>f0)p.fame=f0+(p.fame-f0)*gb;
    REG.forEach(x=>{const d=p.pres[x.id]-prs0[x.id];if(d>0)p.pres[x.id]=cl(prs0[x.id]+d*gb)});
  }
  if(p.robMode)REG.forEach(x=>{const d=p.pres[x.id]-prs0[x.id];if(d>0)p.pres[x.id]=cl(prs0[x.id]+d*1.15)});
  applyGoals();
  G.lastAct=a.id;
  G.catUsed[a.cat]=(G.catUsed[a.cat]||0)+1;
  if(msg)say(`<b>${a.n}.</b> ${msg}`);
  if(p.fame<f0-4||p.ctr>c0+10){SFX.bad();shake()}else SFX.ok();
  {  // skutki na ekran, żeby było widać, co ta decyzja zrobiła
    const df=p.fame-f0, dm=p.mem-m0;
    const dpr=REG.reduce((a2,x)=>a2+Math.max(0,p.pres[x.id]-prs0[x.id]),0);
    if(Math.abs(df)>=1)fxPush((df>0?'+':'')+Math.round(df)+' sławy',df>0?'good':'bad');
    if(dpr>=2)fxPush('+'+Math.round(dpr)+' obecności','good');
    if(dm>0)fxPush('+'+dm+' '+pl(dm,'osoba','osoby','osób'),'good');
    if(dm<0)fxPush(dm+' '+pl(-dm,'osoba','osoby','osób'),'bad');
    const dc=p.ctr-c0, dpr2=p.pret-pr0;
    if(Math.abs(dc)>=1)fxPush((dc>0?'+':'')+Math.round(dc)+' kontrowersji',dc>0?'bad':'good');
    if(Math.abs(dpr2)>=1)fxPush((dpr2>0?'+':'')+Math.round(dpr2)+' pretensjonalności',dpr2>0?'bad':'good');
    if(t&&rel0!==null){const dr=G.rel[G.me][t]-rel0;
      if(Math.abs(dr)>=1)fxPush(`relacje z ${G.p[t].ab} ${dr>0?'+':''}${Math.round(dr)}`,dr>0?'good':'bad')}
    if(a.ap)fxPush('−'+a.ap+' '+pl(a.ap,'akcja','akcje','akcji'),'');
  }
  G.actedWeek=G.term+'-'+G.week;
  /* Stół tygodnia. Zapisujemy nie sam identyfikator, tylko różnicę, jaką ta
     decyzja zrobiła — dzięki temu kafel na stole mówi, co naprawdę wyszło,
     a nie powtarza ogólny opis z listy. */
  const stolKlucz=G.term+'-'+G.week;
  if(!G.stol||G.stolTyg!==stolKlucz){G.stol=[];G.stolTyg=stolKlucz}
  /* Na stół trafia wyłącznie decyzja, która NAPRAWDĘ się odbyła.

     Wcześniej wpis szedł tu zawsze, także dla decyzji z własnym oknem — a te
     w tym momencie jeszcze niczego nie zrobiły. Zamknięcie okna bez wyboru
     zostawiało na stole kafel bez skutków, czasem z liczbami z powietrza.
     Teraz decyzja okienkowa czeka w G.stolPend i wchodzi na stół dopiero
     wtedy, gdy gracz kliknie ten ostatni punkt. Rezygnacja ją stamtąd zdejmuje. */
  if(msg)stolWpis(a,stolPrzed);
  else G.stolPend={id:a.id,n:a.n,kat:a.cat,ap:a.ap,przed:stolPrzed};
  checkDeath();
  // uwaga: decyzje z własnym oknem (nabór, rekonstrukcja, ustawa, rebranding) otwierają je w a.f,
  // więc fire nie może tu zamykać niczego, bo skasowałby okno w tej samej klatce
  pend=null;render();
}
/* Oddanie opłaty za decyzję, która nie doszła do skutku. Wydzielone z actBack,
   bo to samo musi się dziać, gdy okno zniknie bez kliknięcia „wstecz”. */
/* Dopisanie decyzji do stołu tygodnia razem z tym, co realnie zmieniła. */
function stolWpis(a,przed){
  const klucz=G.term+'-'+G.week;
  if(!G.stol||G.stolTyg!==klucz){G.stol=[];G.stolTyg=klucz}
  const po=snap(), zm={};
  /* Wszystko poniżej pół punktu zaokrąglało się do zera i znikało ze stołu —
     decyzja realnie dawała +0,4 sławy, a gracz widział, że nie dała nic.
     Drobne przyrosty pokazujemy więc z jednym miejscem po przecinku. */
  ['fame','cred','uni','act','mem'].forEach(k=>{
    const d=po[k]-(przed?przed[k]:po[k]);
    if(Math.abs(d)>=1)zm[k]=Math.round(d);
    else if(Math.abs(d)>=0.12)zm[k]=Math.round(d*10)/10;});
  G.stol.push({id:a.id,n:a.n,kat:a.cat,ap:a.ap,zm});
}
/* Decyzja okienkowa doszła do skutku — dopiero teraz ląduje na stole. */
function stolZatwierdz(){
  const w=G&&G.stolPend; if(!w)return;
  G.stolPend=null;
  stolWpis({id:w.id,n:w.n,cat:w.kat,ap:w.ap},w.przed);
}
function oddajOplate(){
  if(G)G.stolPend=null;          // rezygnacja zdejmuje decyzję ze stołu
  const c=G&&G.lastCharge; if(!c)return;
  G.ap+=c.ap;G.kp+=c.kp;G.en=cl(G.en+c.en);
  if(G.used[c.id])G.used[c.id]--;
  if(G.catUsed[c.cat])G.catUsed[c.cat]--;
  /* Limit „raz na kadencję” zużywa się dopiero wtedy, gdy gracz naprawdę coś
     zatwierdzi. Wcześniej wystarczyło zajrzeć w zmianę przewodniczącego
     i wycofać się, żeby stracić ją na całą kadencję. */
  if(c.term1)delete G.useTerm[c.id];
  if(c.once)delete G.once[c.id];
  if(G.lastAct===c.id)G.lastAct=null;
  G.lastCharge=null;
}
function actBack(){   // rezygnacja w oknie decyzji oddaje to, co pobrała sama decyzja
  oddajOplate();
  pend=null;close();render();
}
function chooseReg(){const p=me();
  modal('Wybór okręgu',pend.a.n,`<p>${pend.a.d}</p>`,REG.map(r=>({l:r.n,
    s:`${r.seats} ${pl(r.seats,'mandat','mandaty','mandatów')} · obecność ${Math.round(p.pres[r.id])}/100 · ${r.pop} osób`,
    f:()=>{pend.r=r.id;close();step()}})))}
function chooseTem(){
  const r=pend.r?REG.find(x=>x.id===pend.r):null;
  modal('Temat wystąpienia',pend.a.n,
    r?`<p>Wybierasz, o czym mówisz w <b>${r.n}</b>. Skład tego kanału: ${SID.filter(s=>r.mix[s]>=.12).map(s=>sn(s)+' '+Math.round(r.mix[s]*100)+'%').join(', ')}.</p>`
     :`<p>Wybierasz oś przekazu. Przesunie to program partii na stałe.</p>`,
    /* Bez podpowiadania, który temat trafi. Skład kanału stoi wyżej w oknie
       i to z niego trzeba wyciągnąć wniosek samemu — gotowa ocena „świetnie
       pasuje / wrogie" zamieniała wybór w czytanie etykietki. */
    TEM.map(t=>({l:t.n,
      s:SID.filter(s=>(t.w[s]||0)>=1.5).map(sn).join(', '),
      f:()=>{pend.tem=t.id;close();step()}})))}
function chooseTgt(){
  modal('Wybór celu',pend.a.n,`<p>${pend.a.d}</p>`,alive().filter(k=>k!==G.me).map(k=>({
    l:`${G.p[k].n}, ${G.p[k].lead}`,
    s:`relacje ${G.rel[G.me][k]>0?'+':''}${Math.round(G.rel[G.me][k])} · sława ${Math.round(G.p[k].fame)} · ${G.p[k].mem} osób · ${G.p[k].seats} mand. · kompetencja lidera ${L(G.p[k].lead).komp}`,
    f:()=>{pend.t=k;close();step()}})))}
function chooseSeg(){
  modal('Wybór grupy',pend.a.n,`<p>${pend.a.d}</p>`,SEG.map(s=>({l:s.n,
    s:`dopasowanie ${me().aff[s.id].toFixed(1)} · udział w elektoracie ${Math.round(segShare(s.id)*100)}%`,
    f:()=>{pend.s=s.id;close();step()}})))}
function segShare(id){let a=0,b=0;REG.forEach(r=>{const v=regVotes(r);a+=v*r.mix[id];b+=v});return a/b}

/* ---- pula ludzi w rozbiciu na grupy ---- */
function drawFrom(reg,n){
  if(G&&G.p&&G.p[G.me]&&G.p[G.me].postMode&&n>0)n=Math.ceil(n*1.5);   // Postępowcy werbują lepiej, ale już nie podwójnie
  if(G&&G.p&&G.p[G.me]&&G.p[G.me].robMode&&n>0)n=Math.round(n*1.25);   // struktury robotnicze
  const mx=REG.find(r=>r.id===reg).mix, out={eli:0,int:0,ser:0};
  for(let i=0;i<n;i++){
    const order=SID.slice().sort((a,b)=>(mx[b]*Math.random())-(mx[a]*Math.random()));
    const pick2=order.find(g=>mx[g]>0&&G.free[g]>0);
    if(!pick2)break; out[pick2]++;G.free[pick2]--;
  }
  return out;
}
function giveBackCap(p,n){   // decyzje i wydarzenia nie mogą wypatroszyć partii
  return giveBack(p,Math.min(2,Math.max(1,n)));
}
function giveBack(p,n){ // odchodzą przede wszystkim serwerowicze; partia nigdy nie schodzi poniżej jednej osoby
  const out={eli:0,int:0,ser:0};
  // Zapaść ma boleć, ale nie wymiatać całej partii w jedną kadencję. Drobne odejścia
  // sumowały się przez dwanaście tygodni tak, że z dużej partii zostawała jedna osoba.
  const dno=podlogaSkladu(p);
  for(let i=0;i<n;i++){
    if(p.mem<=1||p.mem<=dno)break;
    const g = p.comp.ser>0?'ser':p.comp.int>0?'int':p.comp.eli>0?'eli':null;
    if(!g)break; p.comp[g]--;p.mem--;G.free[g]++;out[g]++;
  }
  return out;
}
/* Poniżej tylu osób partia nie zejdzie przez zwykłe odpływy w tej kadencji.
   Świadome decyzje gracza (czystki, rozłamy) mają własne limity i tego nie dotyczą. */
function podlogaSkladu(p){
  if(!G||!G.memStart)return 1;
  const start=G.memStart[p===G.p[G.me]?G.me:Object.keys(G.p).find(k=>G.p[k]===p)];
  if(!start)return 1;
  return Math.max(1,Math.floor(start*.62));
}
function purge(p,g,n){ // celowe pozbycie się jednej grupy
  const q=Math.min(n,p.comp[g],Math.max(0,p.mem-1));p.comp[g]-=q;p.mem-=q;G.free[g]+=q;return q;
}

/* ---- nabór: ocena ogłoszenia ---- */
const BANAL=/^\s*(hej|siema|elo|cze[śs][ćc]|witam|yo)[\s,.!]*$/i;
function localScore(t){
  const s=(t||'').trim();
  if(!s)return {sc:0,why:'Puste ogłoszenie.'};
  const w=s.split(/\s+/).filter(Boolean), n=w.length;
  const uq=new Set(w.map(x=>x.toLowerCase().replace(/[^a-ząćęłńóśźż0-9]/g,''))).size;
  let sc=16, notes=[];
  sc += n<5?-14 : n<14?5 : n<45?23 : n<95?17 : 6;
  if(n<14)notes.push('za krótkie');
  sc += Math.min(13,(uq/Math.max(1,n))*18);
  const sent=(s.match(/[.!?]/g)||[]).length;
  sc += Math.min(9,sent*3);
  if(sent===0&&n>12)notes.push('brak interpunkcji');
  if(/\d/.test(s))sc+=5;
  if(/program|reform|mandat|sejm|okr[ęe]g|kana[łl]|g[łl]os|wybor|koalicj|ustaw|monarch|lewic|wolno[śs]|porz[ąa]d|tradycj|wsp[óo]ln|walcz|budu|zmien/i.test(s)){sc+=11}
  else notes.push('nic konkretnego o tym, po co ta partia');
  if(/dołącz|dolacz|zapraszam|napisz|czekamy|wpadaj|zg[łl]o[śs]|pisz do|do[łl][ąa]cz/i.test(s))sc+=6;
  else notes.push('brak wezwania do działania');
  if(n<13&&/do[łl][ąa]cz do (naszej )?partii|zapraszam/i.test(s)){sc-=17;notes.push('sam frazes')}
  if(BANAL.test(s)){sc-=28;notes.push('to nie jest ogłoszenie')}
  if(/(.)\1{5,}/.test(s)){sc-=20;notes.push('spam znaków')}
  if(uq<Math.max(3,n*.4)){sc-=12;notes.push('powtarzasz się')}
  const caps=(s.match(/[A-ZĄĆĘŁŃÓŚŹŻ]/g)||[]).length;
  if(s.length>18&&caps>s.length*.42){sc-=11;notes.push('krzyczysz wersalikami')}
  sc=cl(Math.round(sc),0,100);
  const why = sc>=75?'Konkretnie, z charakterem i z powodem, żeby kliknąć.'
    : sc>=52?'Przyzwoicie, choć bez iskry.'
    : sc>=32?('Słabo, '+(notes[0]||'przeciętne'))
    : ('Nie działa: '+(notes.slice(0,2).join(', ')||'zbyt ogólnikowe')+'.');
  return {sc,why};
}
async function aiScore(t,reg,pn){
  const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1000,messages:[{role:"user",content:
`Oceniasz ogłoszenie werbunkowe partii politycznej na serwerze Discord o nazwie Mordy Mordeczki.
Partia: ${pn}. Kanał, na którym publikowane: ${reg}.
Oceń, czy to ogłoszenie realnie przekonałoby kogoś do dołączenia. Nagradzaj konkret, charakter,
powód dla odbiorcy i naturalny język. Karz frazesy typu "dołącz do partii", jedno zdanie bez treści,
spam i pustosłowie.
Odpowiedz WYŁĄCZNIE obiektem JSON, bez markdown: {"score": <0-100>, "why": "<jedno zdanie po polsku, max 18 słów>"}

OGŁOSZENIE:
${t}`}]})});
  const d=await r.json();
  const txt=(d.content||[]).map(x=>x.text||'').join('').replace(/```json|```/g,'').trim();
  const j=JSON.parse(txt.slice(txt.indexOf('{'),txt.lastIndexOf('}')+1));
  return {sc:cl(Math.round(j.score),0,100),why:String(j.why||'').slice(0,140)};
}
/* ══════════ NABÓR: UKŁADANIE OGŁOSZENIA ══════════
   Zamiast wklepywania tekstu w puste pole składasz ogłoszenie z trzech kawałków.
   Każdy trafia do innych ludzi, więc liczy się dopasowanie do składu kanału,
   a powtarzanie tego samego zestawu przestaje działać. */
const KLOCKI=[
 {id:'konkret', n:'Konkret',        t:'„Trzy mandaty, plan na czwarty i miejsce dla ciebie."',
  w:{eli:1.5,int:1.6,ser:.5}, ton:'rzecz'},
 {id:'wizja',   n:'Wizja',          t:'„Budujemy coś, o czym ten serwer będzie gadał latami."',
  w:{eli:1.7,int:1.0,ser:.9}, ton:'duma'},
 {id:'ludzie',  n:'Ludzie',         t:'„Siedzimy na kanale codziennie. Wpadnij, zobacz sam."',
  w:{eli:.4,int:.9,ser:1.7}, ton:'swoj'},
 {id:'zart',    n:'Żart',           t:'„Obiecujemy mniej niż inni, ale dowozimy dwa razy tyle."',
  w:{eli:.5,int:.8,ser:1.6}, ton:'swoj'},
 {id:'wyzwanie',n:'Wyzwanie',       t:'„Szukamy kogoś, kto ogarnie kanał lepiej niż my."',
  w:{eli:1.1,int:1.5,ser:1.0}, ton:'rzecz'},
 {id:'atak',    n:'Uderzenie',      t:'„Reszta obiecuje. My głosujemy."',
  w:{eli:1.2,int:1.1,ser:1.2}, ton:'ostro', ctr:6},
 {id:'apel',    n:'Apel",',         t:'„Dołącz do partii!"',
  w:{eli:.2,int:.2,ser:.4}, ton:'banal'},
 {id:'spam',    n:'Zawołanie',      t:'„@everyone wbijajcie, robimy grubą rzecz"',
  w:{eli:.1,int:.2,ser:1.1}, ton:'banal', ctr:9},
];
let NABOR=null;
function naborTog(id){
  if(!NABOR)return;
  const i=NABOR.wyb.indexOf(id);
  if(i>=0)NABOR.wyb.splice(i,1);
  else if(NABOR.wyb.length<3)NABOR.wyb.push(id);
  naborRys();
}
/* Ocena ogłoszenia: ile trafia w ludzi z tego kanału, czy ma różne rejestry
   i czy nie jest zlepkiem banałów. Bez losowania — ten sam zestaw da to samo. */
/* ══════════ WYWIAD ══════════
   Trzy pytania, przy każdym trzy odpowiedzi w innym rejestrze. Nie ma odpowiedzi
   dobrej zawsze: pokora ratuje partię z aferą, ale wygląda żałośnie przy czystym
   koncie; atak przebija się, gdy nikt o tobie nie słyszał, i pogrąża, gdy właśnie
   coś przeskrobałeś. Dlatego wywiadu nie da się wykuć — trzeba czytać własną
   sytuację. Kompetencja przewodniczącego daje margines błędu, nie zwalnia z myślenia. */
/* Pula pytań. Z każdego wywiadu losujemy cztery, po jednym z każdego etapu,
   żeby dwa wywiady pod rząd nie wyglądały identycznie. Nacisk pytania decyduje,
   ile ono waży i jakiego rejestru oczekuje studio. */
const WYWIAD_PYT=[
 // ── otwarcie ──
 {et:0,nacisk:'zwykly',q:'Zacznijmy od tego, co wszyscy widzieli. Ostatnie tygodnie to u was seria wpadek. Co pan na to?',
  o:[{l:'Przyznaję, zawaliliśmy i wyciągamy wnioski',ton:'pokora'},
     {l:'To wyrwane z kontekstu, media szukają sensacji',ton:'obrona'},
     {l:'A pytał pan o wpadki innych partii?',ton:'atak'}]},
 {et:0,nacisk:'lekki',q:'Na dzień dobry coś prostego: czym się pan dzisiaj pochwali?',
  o:[{l:'Tym, że jeszcze nas nie rozwiązali. Na razie',ton:'pokora'},
     {l:'Konkretami. Mam je wypisane, mogę czytać',ton:'obrona'},
     {l:'Tym, że reszta sejmu nie ma się czym pochwalić',ton:'atak'}]},
 // ── środek: pytanie o tożsamość ──
 {et:1,nacisk:'zwykly',q:'Czym wasza partia różni się od reszty sejmu? Bo z zewnątrz wyglądacie podobnie.',
  o:[{l:'Mamy konkretny program i da się go sprawdzić',ton:'obrona'},
     {l:'Różnimy się tym, że nie obiecujemy cudów',ton:'pokora'},
     {l:'Reszta sejmu to jedna wielka zmowa, my nie',ton:'atak'}]},
 {et:1,nacisk:'zwykly',q:'Ludzie mówią, że jesteście partią jednego człowieka. Jest w tym coś?',
  o:[{l:'Jest. Pracujemy nad tym i nie ukrywam tego',ton:'pokora'},
     {l:'Mamy zaplecze, tylko ono nie krzyczy na kanałach',ton:'obrona'},
     {l:'Lepiej jeden konkretny niż dziesięciu takich jak u konkurencji',ton:'atak'}]},
 // ── środek: pytanie z nożem ──
 {et:2,nacisk:'ostry',q:'Mam tu wasze obietnice sprzed kadencji. Ani jednej nie dowieźliście. Kłamaliście?',
  o:[{l:'Nie dowieźliśmy i nie będę tego owijał',ton:'pokora'},
     {l:'Dowieźliśmy trzy z nich, mogę wymienić po kolei',ton:'obrona'},
     {l:'A kto je zablokował? Niech pan zapyta koalicji',ton:'atak'}]},
 {et:2,nacisk:'ostry',q:'Pański człowiek napisał na kanale rzeczy, których nie powtórzę na antenie. Zostaje w partii?',
  o:[{l:'Nie zostaje. Dziś rano było po sprawie',ton:'pokora'},
     {l:'Zostaje, bo przeprosił i naprawił to publicznie',ton:'obrona'},
     {l:'Zostaje. Nie będę zwalniał ludzi na pański gwizdek',ton:'atak'}]},
 // ── zamknięcie ──
 {et:3,nacisk:'zwykly',q:'Ostatnie pytanie: gdzie będziecie za dwie kadencje?',
  o:[{l:'W rządzie, i to my będziemy rozdawać karty',ton:'atak'},
     {l:'Tam, gdzie postawi nas serwer. Bez wielkich słów',ton:'pokora'},
     {l:'Silniejsi niż dziś, bo robimy swoje krok po kroku',ton:'obrona'}]},
 {et:3,nacisk:'lekki',q:'Na koniec: co powie pan komuś, kto dziś zakłada własną partię?',
  o:[{l:'Żeby dwa razy pomyślał. Ja bym nie zakładał',ton:'pokora'},
     {l:'Żeby zaczął od ludzi, nie od nazwy i logo',ton:'obrona'},
     {l:'Żeby się pospieszył, bo miejsca już prawie nie ma',ton:'atak'}]},
];
/* Reakcje dziennikarza — krótkie, bo ma to być wtrącenie, nie akapit. */
const WYW_REAKCJE={
  traf:['Dziennikarz kiwa głową i notuje.','Dziennikarz na chwilę odpuszcza.',
        'To go zatrzymało. Zagląda w kartki.'],
  pudlo:['Dziennikarz unosi brew.','„To ciekawe" — a po głosie słychać, że nie.',
         'Dziennikarz zapisuje coś i podkreśla dwa razy.']};
let WYW=null;
/* Rejestr, który pasuje do samej partii — punkt wyjścia, nie wyrok. */
function wywiadOczekiwany(p){
  if(p.ctr>=55)return 'pokora';                 // po aferze nikt nie chce słuchać przechwałek
  if(p.fame<=32)return 'atak';                  // nieznani muszą zrobić hałas
  if(p.cred>=58)return 'obrona';                // wiarygodnym opłaca się mówić konkretami
  return p.pret>=55?'pokora':'obrona';
}
/* ── wywiad: co się zmieniło ──
   Wcześniej cały wywiad miał jeden właściwy ton i wystarczyło go odgadnąć raz.
   Teraz każde pytanie ma własny nacisk i to on przesuwa oczekiwanie: pod ostrym
   pytaniem przechwałki nie przejdą nawet znanej partii, a przy lekkim odbiciu
   pokora brzmi jak brak pomysłu. Do tego liczą się dwie rzeczy naraz —
   dziennikarz i widownia — i one chcą czego innego, więc nie da się zadowolić
   obu w każdym pytaniu. Na koniec dochodzi kręgosłup: kto trzyma jedną linię,
   dostaje premię, kto skacze między tonami, traci wiarygodność. */
const TONY={pokora:{n:'Pokora',k:'#7cb463'},obrona:{n:'Konkret',k:'#5a9be8'},atak:{n:'Atak',k:'#d1554a'}};
function oczekiwanyDlaPytania(p,pyt){
  const baza=wywiadOczekiwany(p);
  if(pyt.nacisk==='ostry')  return p.ctr>=40?'pokora':'obrona';   // pod ścianą nie ma miejsca na hałas
  if(pyt.nacisk==='lekki')  return p.fame<=48?'atak':baza;        // lekkie pytanie to okazja na hałas
  return baza;
}
/* Dziennikarz punktuje za trafiony rejestr, widownia ma własny gust: lubi
   atak, gdy partia jest nieznana, i pokorę, gdy właśnie narozrabiała. */
function wywiadPunkty(p,pyt,ton){
  const ok=ton===oczekiwanyDlaPytania(p,pyt);
  const waga=pyt.nacisk==='ostry'?1.35:pyt.nacisk==='lekki'?.75:1;
  const dzien=Math.round((ok?11:-9)*waga);
  let widz=ok?5:-4;
  if(ton==='atak')   widz+=p.fame<=45?6:-3;
  if(ton==='pokora') widz+=p.ctr>=50?6:-2;
  if(ton==='obrona') widz+=p.cred>=55?4:0;
  return {ok,dzien,widz:Math.round(widz*waga)};
}
function openWywiad(){
  if(PROBA)return;
  close();
  const p=me();
  // po jednym pytaniu z każdego etapu — wywiad ma łuk, a nie losową sieczkę
  const zestaw=[0,1,2,3].map(et=>{const g=WYWIAD_PYT.filter(x=>x.et===et);
    return g[RI(0,g.length-1)]}).filter(Boolean);
  WYW={i:0,traf:0,pyt:zestaw,wybory:[],
       dzien:52,                                  // nastawienie dziennikarza
       widz:Math.round(cl(30+p.fame*.45)),        // widownia zaczyna od tego, czy cię zna
       reakcja:null};
  wywiadRys();
}
function wywiadOdp(nr){
  if(!WYW)return;
  const pyt=WYW.pyt[WYW.i], wyb=pyt&&pyt.o[nr];
  if(!wyb)return;
  const p=me();
  const w=wywiadPunkty(p,pyt,wyb.ton);
  WYW.wybory.push(wyb.ton);
  if(w.ok)WYW.traf++;
  WYW.dzien=cl(WYW.dzien+w.dzien);
  WYW.widz=cl(WYW.widz+w.widz);
  const pula=w.ok?WYW_REAKCJE.traf:WYW_REAKCJE.pudlo;
  WYW.reakcja={t:pula[RI(0,pula.length-1)],ok:w.ok,dzien:w.dzien,widz:w.widz};
  WYW.i++;
  if(WYW.i<WYW.pyt.length)wywiadRys();
  else wywiadKoniec();
}
/* Kręgosłup: ile różnych rejestrów poszło w eter. Jeden albo dwa to linia,
   trzy to skakanie i widać to na wiarygodności. */
const wywiadKregoslup=()=>new Set(WYW.wybory).size;
function wywiadRys(){
  const p=me(), pyt=WYW.pyt[WYW.i], ld=lead(G.me);
  const NAC={ostry:['pytanie z nożem','ostre'],zwykly:['pytanie zasadnicze','zwykle'],
             lekki:['pytanie na odbicie','lekkie']};
  const nac=NAC[pyt.nacisk]||NAC.zwykly;
  const miara=(n,v,kl)=>`<div class="wymiara ${kl}">
    <div class="wyml"><span>${n}</span><b>${Math.round(v)}</b></div>
    <div class="trk"><i style="width:${cl(v)}%"></i></div></div>`;
  const r=WYW.reakcja;
  const v=rysujOkno('wywiad',`
    <button class="mdlx" type="button" aria-label="Zamknij">×</button>
    <div class="wystudio">
      <div class="wyglowa">
        ${ava(ld.n,p.c,54)}
        <div style="min-width:0">
          <div class="kick">Wywiad na żywo · ${nac[0]}</div>
          <h2>${esc(ld.n)} przed mikrofonem</h2>
        </div>
        <div class="wypips">${WYW.pyt.map((_,i)=>
          `<i class="${i<WYW.i?'byl':i===WYW.i?'jest':''}"></i>`).join('')}</div>
      </div>
      <div class="wymiary">
        ${miara('Dziennikarz',WYW.dzien,'dz')}
        ${miara('Widownia',WYW.widz,'wd')}
      </div>
    </div>
    <div class="bd">
      ${r?`<div class="wyreak ${r.ok?'ok':'zle'}">${r.t}
        <span>${r.dzien>0?'+':''}${r.dzien} dziennikarz · ${r.widz>0?'+':''}${r.widz} widownia</span></div>`:''}
      <div class="wypyt ${pyt.nacisk}">${pyt.q}</div>
      <div class="wypodp">Pytanie ${WYW.i+1} z ${WYW.pyt.length} · nacisk ${nac[1]}
        ${WYW.wybory.length?`· dotąd ${[...new Set(WYW.wybory)].map(t=>TONY[t].n).join(', ')}`:''}</div>
    </div>
    <div class="op">${pyt.o.map((o,i)=>
      `<button class="opt wyopt" data-w="${i}" style="--ton:${TONY[o.ton].k}">
        <b>${o.l}</b><span>${TONY[o.ton].n}</span></button>`).join('')}</div>`);
  if(!v)return;                       // podgląd skutków nie rysuje okna
  v.querySelectorAll('.opt').forEach(b=>b.onclick=()=>wywiadOdp(+b.dataset.w));
  v.querySelector('.mdlx').onclick=actBack;
}
/* ── nagranie ──
   Reportaż i wykład z ustawy o MAN nie kończą się na przelewie. Trzeba je
   nagrać: przez trzydzieści sekund po planie przelatują oczka uwagi i trzeba
   je klikać. Liczy się nie suma, tylko CELNOŚĆ — złapałeś większość, materiał
   wyszedł; przegapiłeś połowę, wyszła sieczka. Nagroda jest w sławie i to
   umiarkowana: to ma być przyprawa do ustawy, a nie sposób na granie w kółko. */
let LIVE=null;
const LIVE_SEK=30;
function nagranieStart(tytul,potem){
  const tryb=NAGR_TRYBY[RI(0,NAGR_TRYBY.length-1)];
  LIVE={do_:Date.now()+LIVE_SEK*1000, zlapane:0, uciekle:0, chmurki:[], nast:0, id:0,
        tytul:tytul||'Nagranie', potem:potem||null, tryb};
  liveRys();
  LIVE.petla=setInterval(liveKlatka,90);
}
/* Trzy tryby, żeby nagranie nie było w kółko tym samym klikaniem.
   Losowany przy każdym uruchomieniu:
     • uwaga — oczka wznoszą się z dołu, klasyka,
     • trema — oczka stoją w miejscu, ale gasną szybko i pojawiają się gęsto,
     • potok — oczka lecą z boku na bok, dużo, za to żyją długo. */
const NAGR_TRYBY=[
 {id:'uwaga',n:'Uwaga widowni',d:'Oczka wznoszą się od dołu. Łap je, zanim znikną u góry.',
  tempo:(pos)=>Math.max(260,760-pos*430), zycie:(pos)=>Math.max(1700,3100-pos*1100), ruch:'gora'},
 {id:'trema',n:'Trema',d:'Oczka pojawiają się gęsto i gasną błyskawicznie. Liczy się sam refleks.',
  tempo:(pos)=>Math.max(170,430-pos*220), zycie:()=>1150, ruch:'stoi'},
 {id:'potok',n:'Potok pytań',d:'Oczka przelatują z boku na bok. Jest ich dużo, ale dają się dogonić.',
  tempo:(pos)=>Math.max(200,520-pos*260), zycie:()=>2900, ruch:'bok'},
];
function liveKlatka(){
  if(!LIVE)return;
  const zost=Math.max(0,LIVE.do_-Date.now());
  const postep=1-zost/(LIVE_SEK*1000);
  const t=LIVE.tryb;
  if(Date.now()>=LIVE.nast){
    LIVE.nast=Date.now()+t.tempo(postep);
    LIVE.chmurki.push({id:++LIVE.id, x:R(6,86), y:R(12,80), ur:Date.now(), zycie:t.zycie(postep)});
  }
  const teraz=Date.now();
  LIVE.chmurki=LIVE.chmurki.filter(c=>{
    if(teraz-c.ur>c.zycie){LIVE.uciekle++;return false}
    return true;
  });
  if(zost<=0)return liveKoniec();
  liveRys();
}
function liveLap(id){
  if(!LIVE)return;
  const i=LIVE.chmurki.findIndex(c=>c.id===id); if(i<0)return;
  LIVE.chmurki.splice(i,1);
  LIVE.zlapane++;
  beep(520+Math.min(300,LIVE.zlapane*11),.04,'sine',.03);
  liveRys();
}
function liveRys(){
  if(!LIVE)return;
  const zost=Math.max(0,Math.ceil((LIVE.do_-Date.now())/1000));
  const teraz=Date.now();
  const suma=LIVE.zlapane+LIVE.uciekle;
  const cel=suma?Math.round(LIVE.zlapane/suma*100):0;
  const v=rysujOkno('nagranie',`
    <div class="wystudio">
      <div class="wyglowa">
        <span class="livekropka"></span>
        <div style="min-width:0">
          <div class="kick">Nagranie w toku · ${LIVE.tryb.n}</div>
          <h2>${esc(LIVE.tytul)}</h2>
        </div>
        <div class="liveczas ${zost<=6?'malo':''}">${zost}s</div>
      </div>
      <div class="wymiary">
        <div class="wymiara wd"><div class="wyml"><span>Celność</span><b>${cel}%</b></div>
          <div class="trk"><i style="width:${cel}%"></i></div></div>
        <div class="wymiara dz"><div class="wyml"><span>Złapane / przegapione</span>
          <b>${LIVE.zlapane} / ${LIVE.uciekle}</b></div>
          <div class="trk"><i style="width:${cl(suma?LIVE.zlapane/suma*100:0)}%"></i></div></div>
      </div>
    </div>
    <div class="bd">
      <div class="liveplansza">
        ${LIVE.chmurki.map(c=>{const t=(teraz-c.ur)/c.zycie;
          const poz=LIVE.tryb.ruch==='gora'?`left:${c.x}%;bottom:${(8+t*76).toFixed(1)}%`
                   :LIVE.tryb.ruch==='bok' ?`left:${(4+t*88).toFixed(1)}%;bottom:${c.y}%`
                                           :`left:${c.x}%;bottom:${c.y}%`;
          return `<button class="liveoczko ${LIVE.tryb.id}" data-id="${c.id}" style="${poz}"></button>`}).join('')}
        ${LIVE.chmurki.length?'':'<span class="livepusto">…</span>'}
      </div>
      <div class="wypodp">${esc(LIVE.tryb.d)}</div>
    </div>`);
  if(!v)return;
  v.querySelectorAll('.liveoczko').forEach(b=>b.onclick=()=>liveLap(+b.dataset.id));
}
/* Rozliczenie nagrania z ustawy o MAN. Sława jest tu przyprawą, nie daniem
   głównym — całe przedsięwzięcie i tak zapłaciło już swoje w efekcie ustawy. */
function nagranieMAN(w,celnosc){
  const p=me();
  const proc=Math.round(celnosc*100);
  const slawa=Math.round(celnosc*7);
  const wiar=celnosc>=.7?2:0;
  p.fame=cl(p.fame+slawa); if(wiar)p.cred=cl(p.cred+wiar);
  if(celnosc<.35){p.pret=cl(p.pret+3)}
  const ocena=celnosc>=.8?'Materiał wyszedł znakomicie.'
    :celnosc>=.55?'Materiał wyszedł porządnie.'
    :celnosc>=.35?'Da się to puścić, ale bez szału.'
    :'Z tego wyszła sieczka.';
  say(`<b>${w.n}</b> nagrany: celność ${proc}%. ${ocena} Sława +${slawa}.`,celnosc>=.55?'good':'');
  modal('Nagranie',w.n,
    `<div class="wypodsum">
       <div><b>${proc}%</b><span>celność</span></div>
       <div><b>+${slawa}</b><span>sława</span></div>
       <div><b>${wiar?'+'+wiar:'—'}</b><span>wiarygodność</span></div>
     </div>
     <p>${ocena} ${celnosc<.35?'Przy takiej robocie łatwo wyjść na kogoś, kto się wywyższa bez pokrycia.'
       :'Efekt samej ustawy i tak już zadziałał — to jest dokładka za to, jak poszło nagranie.'}</p>`,
    [{l:'Dobrze',f:()=>{close();render()}}]);
}
function liveKoniec(){
  if(!LIVE)return;
  clearInterval(LIVE.petla);
  const suma=LIVE.zlapane+LIVE.uciekle;
  const celnosc=suma?LIVE.zlapane/suma:0;
  const potem=LIVE.potem;
  LIVE=null;
  close();
  if(potem)potem(celnosc);
}
function wywiadKoniec(){
  const p=me(), ld=lead(G.me);
  const traf=WYW.traf, ile=WYW.pyt.length;
  const kreg=wywiadKregoslup();
  /* Kręgosłup dokłada się do oceny: jedna linia przez cały wywiad robi lepsze
     wrażenie niż cztery trafione odpowiedzi wygłoszone czterema różnymi głosami. */
  const bonus=kreg===1?9:kreg===2?3:-7;
  const komp=ld.komp>=78?6:ld.komp>=60?3:0;      // wygadany lider ratuje słabszy dzień
  const ocena=Math.round((WYW.dzien+WYW.widz)/2+bonus+komp);
  const udany=ocena>=52;
  const dzien=Math.round(WYW.dzien), widz=Math.round(WYW.widz);
  const opisKreg=kreg===1?'Trzymałeś jedną linię przez cały wywiad.'
    :kreg===2?'Zmieniałeś ton raz — dało się to obronić.'
    :'Skakałeś między trzema rejestrami i widać to na nagraniu.';
  WYW=null;
  G.lastCharge=null;      // wywiad się odbył, nie ma czego zwracać
  stolZatwierdz();
  close();
  const podsum=`<div class="wypodsum">
      <div><b>${traf}/${ile}</b><span>trafione rejestry</span></div>
      <div><b>${dzien}</b><span>dziennikarz</span></div>
      <div><b>${widz}</b><span>widownia</span></div>
      <div><b>${ocena}</b><span>ocena łączna</span></div>
    </div>`;
  if(udany){
    /* Nagroda idzie tam, skąd przyszła: dziennikarz robi wiarygodność,
       widownia robi sławę. Dzięki temu dwa dobre wywiady potrafią wyjść
       zupełnie inaczej. */
    const gf=Math.round(2+widz/14), gc=Math.round(2+dzien/16);
    p.fame=cl(p.fame+gf);p.cred=cl(p.cred+gc);
    if(ocena>=72)p.ctr=cl(p.ctr-3);
    if(p.marg&&ch(.5))p.marg=0;
    say(`<b>Dobry wywiad.</b> ${ld.n} trafił w ton: sława +${gf}, wiarygodność +${gc}.`,'good');
    modal('Wywiad',ocena>=72?'Wyszło znakomicie':'Wyszedłeś z tego obronną ręką',
      `${podsum}<p>${opisKreg} Serwer uznał, że ${ld.n} mówił jak człowiek,
       a nie jak komunikat prasowy.</p>
       <p style="margin-top:10px">Sława <b>+${gf}</b> od widowni, wiarygodność <b>+${gc}</b>
       od dziennikarza${ocena>=72?', a kontrowersja nawet trochę siadła':''}.</p>`,
      [{l:'Dobrze',f:()=>{close();render()}}]);
  }else{
    const kara=Math.round(8+(52-ocena)*.55);
    p.ctr=cl(p.ctr+kara);p.cred=cl(p.cred-Math.round(3+(52-ocena)/9));p.fame=cl(p.fame+2);
    M(p,-6);
    say(`<b>Wywiad wymknął się spod kontroli.</b> ${ld.n} mówił nie to, co trzeba. Kontrowersja +${kara}.`,'bad');
    modal('Wywiad',ocena<32?'Katastrofa na antenie':'Poszło źle',
      `${podsum}<p>${opisKreg} Fragmenty krążą po kanałach wyrwane z kontekstu.
       <b>Kontrowersja +${kara}</b>, wiarygodność w dół.</p>
       <p class="dim" style="margin-top:10px">Rejestr dobiera się nie tylko do partii, ale i do
       pytania: pod pytaniem z nożem przechwałki nie przejdą nikomu, a przy lekkim odbiciu
       pokora brzmi jak brak pomysłu. Widownia i dziennikarz chcą czego innego, więc nie da się
       zadowolić obu naraz — trzeba wybrać, na kim ci bardziej zależy.</p>`,
      [{l:'Trudno',f:()=>{close();render()}}]);
  }
  render();
}

function naborOcena(wyb,reg){
  const r=REG.find(x=>x.id===reg)||REG[0];
  const kl=wyb.map(id=>KLOCKI.find(k=>k.id===id)).filter(Boolean);
  if(!kl.length)return {sc:0,why:'Puste ogłoszenie nikogo nie przyciągnie.',ctr:0};
  let dop=0;
  kl.forEach(k=>{SID.forEach(s=>{dop+=(k.w[s]||0)*(r.mix[s]||0)})});
  dop=dop/kl.length;                                   // średnie trafienie w kanał
  const tony=new Set(kl.map(k=>k.ton));
  const banaly=kl.filter(k=>k.ton==='banal').length;
  const roznorodnosc=(tony.size-1)*5;                  // różne rejestry brzmią naturalniej
  const kara=banaly*17;
  /* Skala dobrana tak, żeby setka była osiągalna, ale wymagała trafienia w kanał
     co do joty: idealny zestaw trzech kawałków w różnych rejestrach, bez ani
     jednego frazesu. Wcześniej sufit stał na 83 i pełnego naboru nie dało się
     wykręcić choćby zagrać perfekcyjnie. */
  const sc=Math.round(cl(dop*59+roznorodnosc-kara+(kl.length===3?7:0),0,100));
  const ctr=kl.reduce((a,k)=>a+(k.ctr||0),0);
  const why=banaly>=2?'Same slogany. Tak pisze każdy i nikt tego nie czyta.'
    :banaly===1?'Jeden pusty frazes psuje resztę, ale całość jeszcze się broni.'
    :sc>=72?'Trafia dokładnie w ludzi z tego kanału i brzmi jak napisane przez człowieka.'
    :sc>=48?'Przyzwoite. Zabrakło czegoś, co zatrzymałoby wzrok.'
    :'Nie trafia w tych, którzy tu siedzą.';
  return {sc,why,ctr};
}
function naborRys(){
  const v=document.getElementById('veil');if(!v||!NABOR)return;
  const p=me(),reg=NABOR.reg,r=REG.find(x=>x.id===reg)||REG[0];
  const o=naborOcena(NABOR.wyb,reg), pelne=NABOR.wyb.length===3;
  const bd=v.querySelector('#rb'), op=v.querySelector('.op');
  bd.innerHTML=`
    <p>Składasz ogłoszenie na kanał <b>${rn(reg)}</b>. Siedzą tu głównie
      ${SID.filter(s=>r.mix[s]>=.2).map(s=>`${sn(s)} ${Math.round(r.mix[s]*100)}%`).join(', ')}.
      Wybierz <b>trzy</b> kawałki — liczy się, czy trafiają w tych ludzi.</p>
    <div class="naborkrok"><span>Kawałki ogłoszenia</span>
      <b class="${NABOR.wyb.length===3?'gotowe':''}">${NABOR.wyb.length} z 3</b></div>
    <div class="klocki">${KLOCKI.map(k=>{
      const on=NABOR.wyb.includes(k.id), pelno=!on&&NABOR.wyb.length>=3;
      return `<button class="klocek ${on?'on':''}" ${pelno?'disabled':''} onclick="naborTog('${k.id}')">
        <b>${k.n}</b><span>${k.t}</span></button>`}).join('')}</div>
    ${NABOR.wyb.length?`<div class="podglad">
      <div class="k">Tak to wygląda na kanale</div>
      ${NABOR.wyb.map(id=>{const k=KLOCKI.find(x=>x.id===id);return `<p>${k.t}</p>`}).join('')}
    </div>`:''}
    ${pelne?`<div class="ocenapas"><i style="width:${o.sc}%;background:${o.sc>=72?'var(--pos)':o.sc>=48?'var(--acc)':'var(--neg)'}"></i></div>
      <div class="dim" style="font-size:12.5px;margin-top:6px">${o.why}${o.ctr?` <span class="bad">Kontrowersja +${o.ctr}.</span>`:''}</div>`:''}
    <div class="dim" style="font-size:12px;margin-top:10px">Twoja obecność tu: ${Math.round(p.pres[reg])}/100 ·
      charyzma ${lead(G.me).char} · wolni: elita ${G.free.eli}, intelektualiści ${G.free.int}, serwerowicze ${G.free.ser}</div>`;
  op.innerHTML=`<button class="opt" id="rgo" ${pelne?'':'disabled'}><b>Publikuję</b>
      <span>${pelne?'Zużywa akcję i 9 kapitału':`wybierz jeszcze ${3-NABOR.wyb.length}`}</span></button>
    <button class="opt" id="rno"><b>Jednak nie</b><span>Nic nie tracisz</span></button>`;
  op.querySelector('#rno').onclick=actBack;
  if(pelne)op.querySelector('#rgo').onclick=naborPublikuj;
}
function openRecruit(reg){
  if(PROBA)return;                    // to samo, co w modal(): podgląd niczego nie otwiera
  close();
  NABOR={reg,wyb:[]};
  const v=document.createElement('div');v.className='veil';v.id='veil';
  v.innerHTML=`<div class="mdl"><button class="mdlx" type="button" aria-label="Zamknij">×</button>
    <div class="h"><div class="k">Nabór · ${rn(reg)}</div>
    <h2>Ułóż ogłoszenie</h2></div>
    <div class="bd" id="rb"></div>
    <div class="op"></div></div>`;
  document.body.appendChild(v);
  v.querySelector('.mdlx').onclick=actBack;
  naborRys();
}
function naborPublikuj(){
    const v=document.getElementById('veil');if(!v||!NABOR)return;
    const p=me(),reg=NABOR.reg;
    const box=v.querySelector('#rb');
    const res=naborOcena(NABOR.wyb,reg);
    if(G.law&&G.law.mordepedia)res.sc=Math.min(100,res.sc+8);   // Mordepedia: nowy wie, gdzie trafił
    if(res.ctr)p.ctr=cl(p.ctr+res.ctr);
    v.querySelector('.op').innerHTML='<button class="opt" disabled><b>Ogłoszenie poszło…</b><span></span></button>';
    // premia za obecność w kanale i charyzmę lidera
    const boost=p.pres[reg]/9+lead(G.me).char/7-11;
    const eff=cl(res.sc+boost,0,100);
    let g = eff>=58?(hasT('sieciowiec')&&eff>=82?3:2) : 1;   // nabór nigdy nie wraca z pustymi rękami
    // z ogłoszenia przychodzą prawie wyłącznie serwerowicze
    const got={eli:0,int:0,ser:0};let taken=0;
    for(let i=0;i<g;i++){
      const roll=Math.random();
      let gr = roll<.90?'ser' : roll<.99?'int' : 'eli';
      if(G.free[gr]<1)gr=G.free.ser>0?'ser':G.free.int>0?'int':G.free.eli>0?'eli':null;
      if(!gr)break;
      got[gr]++;G.free[gr]--;p.comp[gr]++;p.mem++;taken++;
    }
    g=taken;
    p.act=cl(p.act+3);p.pres[reg]=cl(p.pres[reg]+8);
    if(g>=2)M(p,5); else if(g===0)M(p,-3);
    G.recCd=hasT('sieciowiec')?4:6;   // nabór to rzadkie wydarzenie, nie co drugi tydzień
    const opis=g?[got.eli?got.eli+' z elity':'',got.int?got.int+' z intelektualistów':'',got.ser?got.ser+' z serwerowiczów':''].filter(Boolean).join(', '):'nikt';
    say(`<b>Nabór w ${rn(reg)}.</b> Ocena ${res.sc}/100, dołącza ${opis}.`,g?'good':'bad');
    const col=eff>=76?'var(--pos)':eff>=52?'var(--acc)':'var(--neg)';
    box.innerHTML=`<div class="meter"><i style="width:${eff}%;background:${col}"></i></div>
      <div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:12px">
        <span class="dim">ocena treści <b class="m" style="color:var(--tx)">${res.sc}</b>/100</span>
        <span class="dim">z obecnością i charyzmą: <b class="m" style="color:${col}">${Math.round(eff)}</b></span></div>
      <div class="judge">${res.why}</div>
      <p style="margin-top:14px;font-size:16px;color:${g?'var(--pos)':'var(--neg)'}">
        <b>${g?`Dołącza ${opis}.`:'Pula serwerowiczów jest pusta.'}</b><br><span style="font-size:13.5px;color:var(--dim)">Partia liczy teraz <b style="color:var(--tx)">${p.mem}</b> ${pl(p.mem,'osobę','osoby','osób')}, skład: ${p.comp.eli} elity, ${p.comp.int} intelektualistów, ${p.comp.ser} serwerowiczów.</span></p>`;
    v.querySelector('.op').innerHTML=`<button class="opt" id="rok"><b>Zamykam</b><span></span></button>`;
    v.querySelector('#rok').onclick=()=>{NABOR=null;pend=null;G.lastCharge=null;stolZatwierdz();close();render()};
}
function danina(v){
  if(!G||G.kp<v)return;
  G.kp-=v;G.king.paid+=v;
  say(`<b>Danina ${v} kapitału dla Mordeczki.</b> Punktacja u Króla +${(v/DANINA_ZA_PUNKT).toFixed(1)}.`,'roy');
  render();
}
function openTrain(){
  const p=me(),ls=leads(p);
  // przy dwu- i trzyliderstwie najpierw decydujesz, komu poświęcasz ten tydzień
  if(ls.length>1)return modal('Przewodnictwo','Kogo szlifujesz?',
    `<p>Statystyki partii to średnia całych sterów, więc podciągnięcie jednej osoby rusza średnią
     o ułamek tego, co przy jednym przewodniczącym. Wybierz, kto siada do pracy nad sobą.</p>`,
    ls.map(n=>{const x=L(n),ic=INNATE[n];
      return {l:`${n}${ic?` <span style="color:var(--acc)">★ ${ic.n}</span>`:''}`,
        s:`charyzma ${x.char} · kompetencja ${x.komp} · wytrzymałość ${x.wytrz} · autorytet ${x.autor}`,
        f:()=>{close();openTrainFor(n)}}})
      .concat([{l:'Rezygnuję',s:'Nie tracisz akcji ani kapitału',f:actBack}]),actBack);
  openTrainFor(p.lead);
}
function openTrainFor(kto){
  const p=me(),ld=lead(G.me),wielu=leads(p).length>1;
  const STAT=[['char','charyzma','sława, rekrutacja, improwizacja'],['komp','kompetencja','wiarygodność, debaty, ryzyko gafy'],
    ['wytrz','wytrzymałość','regeneracja energii']];
  modal('Przewodnictwo',`Szlifujesz ${kto}`,
    `<p>Aktualnie (${wielu?'średnia całych sterów':'stan '+kto}): charyzma ${ld.char}, kompetencja ${ld.komp}, wytrzymałość ${ld.wytrz}, autorytet ${ld.autor}.
     Powyżej 80 każdy punkt przychodzi znacznie trudniej, a 99 to sufit. Autorytetu tu nie wytrenujesz, rośnie tylko po wygranych debatach i wyborach.${wielu?` Szlifujesz samego ${kto}, więc średnia partii rusza się o ułamek tego, co zwykle.`:''}</p>`,
    STAT.map(([id,n,d],i)=>{const cur=L(kto)[id];
      const gain=cur>=99?0:cur>=88?1:cur>=80?RI(1,2):cur>=62?RI(1,2):RI(2,3);
      return {l:`${n[0].toUpperCase()+n.slice(1)} ${cur} → ~${Math.min(99,cur+gain)}`,s:d,
        f:()=>{if(!G.lup[kto])G.lup[kto]=[0,0,0,0];
          G.lup[kto][i]+=gain;
          say(`<b>${kto}</b> podciąga ${n} do ${L(kto)[id]}.`);
          G.lastCharge=null;stolZatwierdz();close();render()}}})   // szkolenie się odbyło
      .concat([{l:'Rezygnuję',s:'Nie tracisz akcji ani kapitału',f:actBack}]),actBack)
}

/* ---- przewodnictwo ---- */
/* ---- układ sterów: jeden, dwóch albo trzech przewodniczących ---- */
let STER=null;
const steryOpis=n=>n===1?'jednoosobowe':n===2?'dwuosobowe':'trzyosobowe';
function steryKoszt(n){return n===1?{uni:5,ctr:0}:n===2?{uni:-3,ctr:3}:{uni:-8,ctr:7}}
function openStery(){
  close();
  const p=me();
  STER={ile:Math.max(1,leads(p).length),wyb:leads(p).slice()};
  steryRys();
}
function sterySet(n){
  STER.ile=n;
  if(STER.wyb.length>n)STER.wyb=STER.wyb.slice(0,n);
  steryRys();
}
function steryTog(n){
  const i=STER.wyb.indexOf(n);
  if(i>=0)STER.wyb.splice(i,1);
  else if(STER.wyb.length<STER.ile)STER.wyb.push(n);
  steryRys();
}
function steryRys(){
  const p=me(),pula=roster(p),gotowe=STER.wyb.length===STER.ile;
  const st=STER.wyb.map(L);
  const sr=f=>st.length?Math.round(st.reduce((a,x)=>a+x[f],0)/st.length):0;
  const k=steryKoszt(STER.ile);
  const v=rysujOkno('stery',`<button class="mdlx" type="button" aria-label="Zamknij">×</button>
    <div class="h"><div class="k">Decyzja specjalna · raz na kadencję</div><h2>Układ sterów</h2></div>
    <div class="bd">
      <p>Ilu ludzi ma prowadzić ${p.n}? Przy kilku przewodniczących wszystkie statystyki
      i cechy wrodzone liczą się jako <b>średnia całego składu</b>, więc słabszy nazwisko obniża silniejsze,
      ale wnosi swoją cechę.</p>
      <div class="sterile">${[1,2,3].map(n=>`<button class="${STER.ile===n?'on':''}" ${pula.length<n?'disabled':''}
        onclick="sterySet(${n})"><b>${n}</b><span>${steryOpis(n)}</span></button>`).join('')}</div>
      <div class="sterlab">Wybierz ${STER.ile} ${pl(STER.ile,'osobę','osoby','osób')} · zaznaczono ${STER.wyb.length}</div>
      <div class="sterlist">${pula.map(n=>{
        const on=STER.wyb.includes(n),poz=STER.wyb.indexOf(n),x=L(n),ic=INNATE[n];
        const pelno=!on&&STER.wyb.length>=STER.ile;
        return `<button class="sterp ${on?'on':''}" ${pelno?'disabled':''} onclick="steryTog('${esc(n)}')">
          ${on?`<i class="sternum">${poz+1}</i>`:''}
          ${ava(n,p.c,34)}
          <div style="min-width:0;text-align:left">
            <b>${n}</b>
            <span>char ${x.char} · komp ${x.komp} · wytrz ${x.wytrz} · autor ${x.autor}</span>
            ${ic?`<em>★ ${ic.n}</em>`:''}
          </div></button>`}).join('')}</div>
      ${gotowe?`<div class="sterpodg">
        <div class="k">Po zmianie</div>
        <div class="lstat">
          <div><b>${sr('char')}</b><span>charyzma</span></div>
          <div><b>${sr('komp')}</b><span>kompet.</span></div>
          <div><b>${sr('wytrz')}</b><span>wytrzym.</span></div>
          <div><b>${sr('autor')}</b><span>autorytet</span></div></div>
        <div class="dim" style="font-size:12.5px;margin-top:9px">
          Jedność ${k.uni>0?'+':''}${k.uni}${k.ctr?` · kontrowersja +${k.ctr}`:''}.
          ${STER.ile===1?'Jeden człowiek decyduje szybko i partia to lubi.'
            :STER.ile===2?'Dwa nazwiska na czele to dwie wizje, ludzie trochę na to kręcą nosem.'
            :'Trójka na czele to ciągłe negocjacje o wszystko. Serwer patrzy na to z politowaniem.'}</div>
      </div>`:''}
    </div>
    <div class="op">
      <button class="opt" id="sok" ${gotowe?'':'disabled'}><b>Zatwierdzam ${steryOpis(STER.ile)}</b>
        <span>${gotowe?STER.wyb.join(' · '):`brakuje ${STER.ile-STER.wyb.length}`}</span></button>
      <button class="opt" id="sno"><b>Jednak nie</b><span>Nic nie tracisz</span></button></div>`);
  if(!v)return;                       // podgląd skutków nie rysuje okna
  v.querySelector('#sno').onclick=actBack;
  v.querySelector('.mdlx').onclick=actBack;
  if(gotowe)v.querySelector('#sok').onclick=steryOk;
}
function steryOk(){
  const p=me();
  if(!STER||STER.wyb.length!==STER.ile)return;
  const stare=leads(p),nowe=STER.wyb.slice(),k=steryKoszt(STER.ile);
  p.lead=nowe[0];p.lead2=nowe[1]||null;p.lead3=nowe[2]||null;
  nowe.forEach(n=>{p.bench=p.bench.filter(y=>y!==n)});
  // kto wypadł ze sterów, wraca na ławkę zamiast zniknąć ze składu
  stare.forEach(n=>{if(!nowe.includes(n)&&!p.main.includes(n)&&!p.bench.includes(n))p.bench.push(n)});
  p.uni=cl(p.uni+k.uni);p.ctr=cl(p.ctr+k.ctr);
  STER=null;pend=null;G.lastCharge=null;close();   // stery przestawione, nie ma czego zwracać
  stolZatwierdz();
  say(`<b>Nowy układ sterów.</b> ${p.ab} prowadzi ${nowe.length===1?'samodzielnie':'wspólnie'}: ${nowe.join(', ')}.`,'roy');
  XP(12);render();
}

/* Był tu osobny ekran zmiany przewodniczącego (openLead/openCoLead). Nic go nie
   otwierało — gracz dochodzi do sterów wyłącznie przez decyzję „Układ sterów”,
   która robi to samo i pozwala ustawić od jednego do trzech przewodniczących. */

/* ---- koalicja / ministerstwa / głosowania ---- */
function werbChance(n,from){
  const p=me(),o=G.p[from],isL=isLead(o,n);
  const c=.17
    + G.rel[from][G.me]*0.0050      // relacje z jego partią
    + (p.mem-o.mem)*0.0045          // kto jest większy
    + (p.fame-50)*0.0028
    - p.ctr*0.0038                  // awanturnikowi nikt nie ufa
    - p.pret*0.0030                 // ani nadętym
    + (hasT('negocjator')?.08:0)
    + (goalDone('republika')||hasLib2(G.me)?.06:0)
    + (isEraNiestab()?.05:0)         // era niestabilności: chaos ułatwia podbieranie ludzi
    - (isL?.30:0);
  return cl(c,.03,.72);
}
function werbPool(k){
  const o=G.p[k];
  return [...new Set(o.main.concat(o.bench))].filter(n=>LEAD[n]&&(o.lead!==n||o.bench.length||o.main.length>1));
}
function openWerb(){
  const opts=alive().filter(k=>k!==G.me&&werbPool(k).length).map(k=>{
    const best=werbPool(k).reduce((a,n)=>Math.max(a,werbChance(n,k)),0);
    return {l:G.p[k].n,s:`relacja ${G.rel[k][G.me]>0?'+':''}${Math.round(G.rel[k][G.me])} · ${G.p[k].mem} osób · do wzięcia ${werbPool(k).length} · najlepsza szansa ${Math.round(best*100)}%`,
      f:()=>{close();openWerb2(k)}}});
  opts.push({l:'Rezygnuję',s:'Nie tracisz akcji ani kapitału',f:actBack});
  modal('Dyplomacja','Z której partii chcesz kogoś wyciągnąć?',
    `<p>Ludzie przechodzą do partii, które są większe, spokojniejsze i mają dobre układy z ich obecną.
     Twoja kontrowersja <b>${Math.round(me().ctr)}</b> i pretensjonalność <b>${Math.round(me().pret)}</b> działają przeciwko tobie.</p>`,opts,actBack);
}
function openWerb2(k){
  const o=G.p[k];
  const opts=werbPool(k).sort((a,b)=>werbChance(b,k)-werbChance(a,k)).map(n=>{
    const c=werbChance(n,k),x=L(n),isL=isLead(o,n);
    return {l:n+(isL?' · przewodniczący':''),
      s:`szansa <b>${Math.round(c*100)}%</b> · charyzma ${x.char}, kompetencja ${x.komp}${isL?' · odejście lidera to skandal, szansa mocno w dół':''}`,
      f:()=>{close();werbDo(n,k,c)}}});
  opts.push({l:'Wracam do listy partii',s:'',f:()=>{close();openWerb()}});
  modal('Dyplomacja',`Kogo z ${o.ab}?`,
    `<p>Relacja z ${o.ab}: <b>${G.rel[k][G.me]>0?'+':''}${Math.round(G.rel[k][G.me])}</b>. Nieudana próba i tak ją popsuje.</p>`,opts,actBack);
}
function werbDo(n,k,c){
  G.lastCharge=null;
  const p=me(),o=G.p[k],isL=isLead(o,n);
  if(ch(c)){
    const gr=isL||L(n).komp>=80?'eli':'int';   // ktoś z twarzą i imieniem nigdy nie jest zwykłym serwerowiczem
    if(o.mem>1){o.comp[gr]>0?o.comp[gr]--:(o.comp.int>0?o.comp.int--:o.comp.eli--);o.mem--}
    p.comp[gr]++;p.mem++;
    o.main=o.main.filter(x=>x!==n);o.bench=o.bench.filter(x=>x!==n);
    if(o.lead2===n){o.lead2=o.lead3||null;o.lead3=null}
    else if(o.lead3===n)o.lead3=null;
    if(o.lead===n){o.lead=o.main[0]||o.bench.shift()||o.lead;if(!o.main.length&&o.lead!==n)o.main=[o.lead]}
    if(!p.bench.includes(n))p.bench.push(n);
    G.werbOk=1;
    G.rel[G.me][k]=cl(G.rel[G.me][k]-18,-100,100);G.rel[k][G.me]=cl(G.rel[k][G.me]-18,-100,100);
    p.uni=cl(p.uni+2);o.uni=cl(o.uni-6);M(o,-6);M(p,5);XP(8);
    fxPush(`werbunek udany: ${n}`,'good');
    say(`<b>${n} przechodzi do ${p.ab}</b> z ${o.ab}.${isL?` Tamci mianują ${o.lead}.`:''} Relacja z ${o.ab} leci o 18 w dół.`,'good');
  } else {
    G.rel[G.me][k]=cl(G.rel[G.me][k]-10,-100,100);G.rel[k][G.me]=cl(G.rel[k][G.me]-10,-100,100);
    p.ctr=cl(p.ctr+5);p.cred=cl(p.cred-2);
    say(`<b>${n} odmawia.</b> Rozmowa wyciekła, ${o.ab} ma pretensje, twoja kontrowersja rośnie.`,'bad');
  }
  render();
}
function rebalanceSeats(){
  // minimum dwa mandaty na okręg, reszta metodą D Hondta wg liczby głosujących
  const base=REG.length<=8?2:1;
  const w=REG.map(r=>r.pop*r.eng);
  REG.forEach(r=>r.seats=base);
  let left=DIST_SEATS-base*REG.length;
  while(left>0){
    let bi=0,bq=-1;
    REG.forEach((r,i)=>{const q=w[i]/(r.seats+1);if(q>bq){bq=q;bi=i}});
    REG[bi].seats++;left--;
  }
}
/* ══════════ RADA MINISTRÓW ══════════ */
const RESORTY=[
 {id:'fin',    n:'Finansów',            d:'Kasa sejmu, składki i to, komu ile zostaje.'},
 {id:'spraw',  n:'Sprawiedliwości',     d:'Regulaminy, spory i odwołania od banów.'},
 {id:'kultura',n:'Kultury i Rozrywki',  d:'Eventy, konkursy, wszystko co ożywia serwer.'},
 {id:'arch',   n:'Archiwizacji',        d:'Pilnuje, co się na serwerze wydarzyło i kto to pamięta.'},
 {id:'edu',    n:'Edukacji i Nauki',    d:'Poradniki dla nowych i szkolenia kadr.'},
];
const radaInit=()=>{if(!G.rada)G.rada={};if(!G.radaOd)G.radaOd={}};
function radaKto(id){radaInit();return G.rada[id]||null}
/* Ile tygodni minister siedzi już na resorcie. Świeżo powołanego nie wymienia się
   z dnia na dzień — rada ministrów to nie ławka rezerwowych, a każda roszada
   kosztuje rząd wiarygodność. */
const KARENCJA=3;
function ministerStaz(id){
  radaInit();
  const od=G.radaOd[id];
  if(!od)return 99;
  return (G.term-od.t)*12+(G.week-od.w);
}
const ministerBlokada=id=>Math.max(0,KARENCJA-ministerStaz(id));
/* Minister musi być żywą osobą z istniejącej partii. Ludzie odchodzą z zaplecza
   do bezpartyjnych i dają się podkupić konkurencji — a ich resort zostawał
   podpisany nazwiskiem, którego nie ma już w żadnym składzie. */
function sprzatnijRade(){
  radaInit();
  RESORTY.forEach(r=>{
    const n=G.rada[r.id];
    if(!n)return;
    if(!partiaOsoby(n)){
      delete G.rada[r.id];delete G.radaOd[r.id];
      if(G.gov&&G.gov.pm===G.me)
        say(`<b>${n}</b> znika ze sceny — resort ${r.n} zostaje bez ministra.`,'bad');
    }
  });
}
/* w której partii siedzi dana osoba */
function partiaOsoby(nick){
  return alive().find(k=>roster(G.p[k]).includes(nick))||null;
}
function openResort(id){
  radaInit();
  const res=RESORTY.find(r=>r.id===id);if(!res)return;
  const siedzi=radaKto(id), blok=siedzi?ministerBlokada(id):0;
  if(blok>0)return modal('Rada ministrów',res.n,
    `<p><b>${siedzi}</b> objął ten resort dopiero co i musi mieć czas cokolwiek zrobić.
     Wymiana będzie możliwa za <b>${blok} ${pl(blok,'tydzień','tygodnie','tygodni')}</b>.</p>
     <p class="dim">Rada ministrów to nie ławka rezerwowych — rząd, który wymienia ludzi
     co tydzień, sam sobie odbiera wiarygodność.</p>`,[{l:'Rozumiem',f:close}],close);
  const moi=roster(me()).filter(n=>!Object.values(G.rada).includes(n));
  const koalicja=(G.gov?G.gov.parties:[]).filter(k=>k!==G.me);
  const obcy=[];
  koalicja.forEach(k=>roster(G.p[k]).filter(n=>!Object.values(G.rada).includes(n))
    .slice(0,4).forEach(n=>obcy.push([n,k])));

  const opcje=[];
  moi.slice(0,8).forEach(n=>opcje.push({
    l:`${n} <span class="ok">(twoja partia)</span>`,
    s:`kompetencja ${L(n).komp} · sława +3, aktywność +2`,
    f:()=>obsadz(id,n,null)}));
  obcy.slice(0,10).forEach(([n,k])=>opcje.push({
    l:`${n} <span class="dim">(${G.p[k].ab})</span>`,
    s:`kompetencja ${L(n).komp} · relacje z ${G.p[k].ab} +10`,
    f:()=>obsadz(id,n,k)}));
  if(radaKto(id))opcje.push({l:'Zostawiam wakat',s:`${radaKto(id)} odchodzi z rządu`,f:()=>obsadz(id,null,null)});
  opcje.push({l:'Jednak nie',s:'Nic nie zmieniasz',f:close});

  // ilu koalicjantów zostało dotąd z pustymi rękami — żeby nie było niespodzianki
  const g2=G.gov;
  const bezResortu=(g2&&G.pmOk&&g2.pm===G.me)
    ? g2.parties.filter(k=>k!==G.me&&G.p[k]&&!G.p[k].dead
        &&!RESORTY.some(r=>{const n=radaKto(r.id);return n&&partiaOsoby(n)===k})) : [];
  modal('Rada ministrów',res.n,
    `<p>${res.d}</p><p>Ministra z własnej partii widać w twojej sławie. Oddany koalicjantowi
     resort kupuje ci przychylność jego partii, ale pracuje na jej konto.</p>
     ${bezResortu.length?`<p class="dim" style="font-size:12.5px">Bez resortu w koalicji:
       <b>${bezResortu.map(k=>`${G.p[k].ab} (${G.p[k].seats} ${pl(G.p[k].seats,'mandat','mandaty','mandatów')})`).join(', ')}</b>.
       Jeśli zgarniesz całą radę dla siebie, policzą krzesła i to odbije się na relacjach.</p>`:''}`,opcje,close);
}
function obsadz(id,nick,zPartii){
  radaInit();
  const res=RESORTY.find(r=>r.id===id);
  if(!res)return;                       // resort mógł zniknąć razem z zapisem ze starszej wersji
  if(G)G.lastCharge=null;               // resort obsadzony — decyzja doszła do skutku
  stolZatwierdz();
  const stary=G.rada[id];
  if(stary&&stary!==nick){
    /* Każda roszada w radzie ma swoją cenę: partia odwołanego zapamiętuje,
       a serwer widzi rząd, który nie umie się zdecydować. */
    const kS=partiaOsoby(stary);
    me().ctr=cl(me().ctr+6);
    if(kS&&kS!==G.me){
      G.rel[G.me][kS]=cl(G.rel[G.me][kS]-14,-100,100);
      G.rel[kS][G.me]=cl(G.rel[kS][G.me]-14,-100,100);
      say(`<b>${stary}</b> traci resort. ${G.p[kS].ab} tego nie zapomni — relacje w dół, kontrowersja w górę.`,'bad');
    }else{
      me().uni=cl(me().uni-4);   // wymiana swojego to sygnał, że w partii coś nie gra
      say(`<b>${stary}</b> traci resort. Własna partia patrzy na to krzywo.`,'bad');
    }
  }
  if(nick){
    G.rada[id]=nick;
    if(stary!==nick)G.radaOd[id]={t:G.term,w:G.week};   // od tego tygodnia liczy się staż
    if(zPartii){
      G.rel[G.me][zPartii]=cl(G.rel[G.me][zPartii]+10,-100,100);
      G.rel[zPartii][G.me]=cl(G.rel[zPartii][G.me]+10,-100,100);
      say(`<b>${nick}</b> obejmuje resort: ${res.n}. Relacje z ${G.p[zPartii].ab} w górę.`);
    }else{
      me().fame=cl(me().fame+3);me().act=cl(me().act+2);
      say(`<b>${nick}</b> z twojej partii obejmuje resort: ${res.n}. Sława w górę.`,'good');
      zawiedzeniKoalicjanci();
    }
  }else{
    delete G.rada[id];delete G.radaOd[id];
    say(`Resort ${res.n} zostaje bez ministra.`,'bad');
  }
  close();render();
}

/* Koalicjant, który wniósł mandaty, a nie dostał nic, zaczyna liczyć krzesła.
   Wcześniej dało się obsadzić całą radę własnymi ludźmi i nikt nie mrugnął —
   koalicja była listą nazwisk, a nie układem, który trzeba obsługiwać. */
function zawiedzeniKoalicjanci(){
  const g=G.gov;
  if(!g||!G.pmOk||g.pm!==G.me)return;
  const partnerzy=g.parties.filter(k=>k!==G.me&&G.p[k]&&!G.p[k].dead);
  if(!partnerzy.length)return;
  const obsadzone=RESORTY.filter(r=>radaKto(r.id));
  if(obsadzone.length<2)return;            // przy jednym resorcie nie ma o co kruszyć kopii

  const mojeK=obsadzone.filter(r=>{const n=radaKto(r.id);return roster(me()).includes(n)}).length;
  const udzial=mojeK/obsadzone.length;
  if(udzial<.75)return;                    // zwykły podział łupów nikogo nie dziwi

  const mandKoal=g.parties.reduce((a,k)=>a+G.p[k].seats,0)||1;
  const urazeni=[];
  partnerzy.forEach(k=>{
    const maResort=RESORTY.some(r=>{const n=radaKto(r.id);return n&&partiaOsoby(n)===k});
    if(maResort)return;
    // im większy wkład w koalicję, tym większa uraza: mały przystawka to co innego
    // niż partia, bez której nie byłoby większości
    const waga=G.p[k].seats/mandKoal;
    const zlosc=Math.round(cl(3+waga*26+(udzial>=1?4:0),3,20));
    G.rel[k][G.me]=cl(G.rel[k][G.me]-zlosc,-100,100);
    G.rel[G.me][k]=cl(G.rel[G.me][k]-Math.round(zlosc*.4),-100,100);
    G.p[k].mom=cl((G.p[k].mom||0)-3,-35,42);
    urazeni.push({k,zlosc});
  });
  if(!urazeni.length)return;

  APPR(-Math.min(9,2+urazeni.length*2));
  me().ctr=cl(me().ctr+3);
  const naj=urazeni.sort((a,b)=>b.zlosc-a.zlosc);
  say(`<b>Koalicjanci liczą krzesła.</b> ${udzial>=1?'Cała rada ministrów':'Prawie cała rada'} jest twoja,
    a ${naj.map(x=>`${G.p[x.k].ab} (−${x.zlosc})`).join(', ')} ${pl(naj.length,'wyszedł','wyszli','wyszli')} z niczym.`,'bad');
}

/* Cena działacza. Kto ma lepsze statystyki, tego trudniej przeciągnąć — i drożej.
   Wcześniej przekupienie było rzutem monetą: w trzech przypadkach na dziesięć
   wyciekały DM-y, a gracz i tak nie wiedział, kogo właściwie kupuje. */
const cenaDzialacza=n=>{const a=L(n);return Math.round((a.char+a.komp+a.wytrz+a.autor)/4*1.35)};
function openPrzekup(t){
  const o=G.p[t],p=me();
  // Przewodniczący nie jest na sprzedaż — on jest partią, a nie jej pracownikiem.
  const kand=o.mem>1?roster(o).filter(n=>!isLead(o,n)):[];
  if(!kand.length)return modal('Brudne','Nie ma kogo przekupić',
    `<p>W ${o.ab} nie ma nikogo poza sterami, a przewodniczących kupić się nie da.</p>`,
    [{l:'Rozumiem',f:actBack}],actBack);
  modal('Brudne','Przekupienie działacza',
    `<p>Wybierasz konkretną osobę i płacisz jej cenę. Bez losowania — albo cię stać, albo nie.
     Przejście widać jednak z daleka: <b>kontrowersja +10</b>, wiarygodność w dół
     i relacje z ${o.ab} na minus.</p>
     <p class="dim">Masz ${ikona('kapital','mini')}<b>${Math.round(G.kp)}</b> kapitału.</p>`,
    kand.slice(0,8).map(n=>{const c=cenaDzialacza(n),a=L(n),stac=G.kp>=c;
      return {l:`${n} — ${c} kapitału${stac?'':' · nie stać'}`,
        s:`charyzma ${a.char} · kompetencja ${a.komp} · wytrzymałość ${a.wytrz}`,
        f:()=>{
          if(!stac){close();return modal('Brudne','Za mało kapitału',
            `<p>${n} kosztuje <b>${c}</b>, a masz <b>${Math.round(G.kp)}</b>. Ludzie nie chodzą na kreskę.</p>`,
            [{l:'Trudno',f:actBack}],actBack)}
          close();
          G.kp-=c;
          o.bench=o.bench.filter(x=>x!==n);o.main=o.main.filter(x=>x!==n);
          if(!p.bench.includes(n))p.bench.push(n);
          // razem z człowiekiem przechodzi jego głos w partii
          const gr=o.comp.eli>0&&ch(.3)?'eli':o.comp.int>0?'int':'ser';
          if(o.comp[gr]>0&&o.mem>1){o.comp[gr]--;o.mem--;p.comp[gr]++;p.mem++}
          p.ctr=cl(p.ctr+10);p.cred=cl(p.cred-4);o.uni=cl(o.uni-6);
          G.rel[G.me][t]=cl(G.rel[G.me][t]-26,-100,100);G.rel[t][G.me]=cl(G.rel[t][G.me]-26,-100,100);
          say(`<b>${n}</b> przechodzi z ${o.ab} do ciebie za ${c} kapitału.`,'good');
          render();
        }}})
      .concat([{l:'Rezygnuję',s:'Nie tracisz akcji',f:actBack}]),actBack);
}

/* Przekupstwo koalicjanta: opozycja kupuje jeden głos, żeby wywrócić najbliższą
   ustawę rządu. Szansa zależy od tego, jak mocno koalicjant trzyma się premiera —
   kto ma z nim złe relacje i mało do stracenia, ten bierze pieniądze najchętniej. */
function przekupSzansa(k){
  if(!G.gov)return 0;
  const p=G.p[k], relPM=G.rel[k][G.gov.pm];
  return cl(.30-relPM/220+(50-p.cred)/260+(p.seats<=3?.12:0)+lead(G.me).char/420,.06,.72);
}
function openPrzekupstwo(){
  const g=G.gov;
  if(!g||!G.pmOk)return modal('Opozycja','Nie ma kogo przekupywać',
    `<p>Nie ma rządu, więc nie ma też koalicjanta, którego dałoby się skusić.</p>`,
    [{l:'Rozumiem',f:actBack}],actBack);
  if(g.parties.includes(G.me))return modal('Opozycja','Jesteś w tym rządzie',
    `<p>Przekupywanie własnych koalicjantów to już nie opozycja, tylko rozkład.</p>`,
    [{l:'Rozumiem',f:actBack}],actBack);
  if(G.przekupiony&&G.przekupiony.doTerm===G.term)return modal('Opozycja','Już masz swojego człowieka',
    `<p><b>${G.p[G.przekupiony.kto].ab}</b> ma zagłosować przeciw przy najbliższej ustawie.
     Drugi raz w tej kadencji nikt się nie da.</p>`,[{l:'Rozumiem',f:actBack}],actBack);
  const kand=g.parties.filter(k=>k!==g.pm&&G.p[k].seats>0);
  if(!kand.length)return modal('Opozycja','Rząd jednopartyjny',
    `<p>W tym gabinecie nie ma koalicjantów — jest tylko ${G.p[g.pm].ab}. Nie ma kogo podkupić.</p>`,
    [{l:'Rozumiem',f:actBack}],actBack);
  modal('Opozycja','Przekupstwo koalicjanta',
    `<p>Wybierasz partię koalicji, z której poseł zagłosuje przeciw rządowi przy najbliższej ustawie.
     Im gorzej ma z premierem i im mniej ma do stracenia, tym chętniej weźmie.</p>
     <p class="dim">Wpadka kosztuje kontrowersję i relacje z całą koalicją.</p>`,
    kand.map(k=>{const sz=przekupSzansa(k);
      return {l:`${G.p[k].ab} — szansa ${Math.round(sz*100)}%`,
        s:`${G.p[k].seats} ${pl(G.p[k].seats,'mandat','mandaty','mandatów')} · relacje z premierem ${Math.round(G.rel[k][g.pm])}`,
        f:()=>{close();
          if(ch(sz)){
            G.przekupiony={kto:k,doTerm:G.term};
            me().ctr=cl(me().ctr+8);
            say(`<b>Masz swojego człowieka w koalicji.</b> Poseł ${G.p[k].ab} zagłosuje przeciw rządowi przy najbliższej ustawie.`,'good');
            modal('Opozycja','Dogadane',
              `<p>Przy najbliższym głosowaniu <b>${G.p[k].ab}</b> odda głos przeciw własnemu rządowi.</p>
               <p style="margin-top:10px">Kontrowersja +8. Jeśli rząd przegra, premier za to zapłaci.</p>`,
              [{l:'Dobrze',f:()=>{close();render()}}]);
          }else{
            me().ctr=cl(me().ctr+18);me().cred=cl(me().cred-8);M(me(),-10);
            G.rel[G.me][k]=cl(G.rel[G.me][k]-30,-100,100);G.rel[k][G.me]=cl(G.rel[k][G.me]-30,-100,100);
            g.parties.forEach(x=>{if(x!==G.me){G.rel[x][G.me]=cl(G.rel[x][G.me]-10,-100,100)}});
            say(`<b>${G.p[k].ab} odmówił i puścił to dalej.</b> Cała koalicja wie, że próbowałeś kupić głos.`,'bad');
            modal('Opozycja','Odmówił i rozgadał',
              `<p>Propozycja trafiła prosto na kanał koalicji. Kontrowersja +18, wiarygodność w dół,
               relacje z całym rządem popsute.</p>`,
              [{l:'Trudno',f:()=>{close();render()}}]);
          }
          render()}}})
      .concat([{l:'Rezygnuję',s:'Nie tracisz akcji',f:actBack}]),actBack);
}

function openDym(){
  /* Odwołać można wyłącznie kogoś, kto naprawdę siedzi na resorcie.
     Liczba w gov.min mówi tylko, ile resortów partia dostała w podziale łupów —
     przy pustej radzie ministrów nie ma tam żywego człowieka do wyrzucenia. */
  const g=G.gov;radaInit();
  const ministrowieZ=k=>RESORTY.filter(r=>{const n=radaKto(r.id);return n&&partiaOsoby(n)===k});
  const cand=g.parties.filter(k=>k!==G.me&&ministrowieZ(k).length);
  if(!cand.length)return modal('Premier','Nie ma kogo odwołać',
    `<p>${g.parties.filter(k=>k!==G.me).length
      ? 'Żaden koalicjant nie ma obsadzonego resortu — same wakaty. Najpierw rozdaj ministerstwa w radzie ministrów, potem będzie kogo odwoływać.'
      : 'Rządzisz sam, nie ma w rządzie nikogo poza tobą.'}</p>`,[{l:'Rozumiem',f:actBack}]);
  /* Odwołanie to decyzja premiera, nie sejmu — tak działa dymisja w każdym
     normalnym rządzie. Sejm nie głosuje nad tym, kto siedzi w radzie ministrów;
     jeśli mu się rząd nie podoba, ma od tego wotum nieufności. */
  modal('Premier','Odwołanie ministra',
    `<p>Odwołujesz sam, bez głosowania. Odwołany traci resort, a jego partia wypada z koalicji —
     to jawne zerwanie, więc relacje lecą na łeb, a serwer ma temat na cały tydzień.</p>
     <p class="dim">Chcesz tylko wymienić człowieka na stanowisku, zostawiając partię w rządzie?
     Do tego służy <b>Zmiana ministra</b>.</p>`,
    cand.map(k=>{const rs=ministrowieZ(k).map(r=>r.n).join(', ');
      return {l:`Odwołuję ${G.p[k].lead} (${G.p[k].ab})`,
      s:`${rs} · relacje ${Math.round(G.rel[G.me][k])} → −55 · koalicja traci ${G.p[k].seats} ${pl(G.p[k].seats,'mandat','mandaty','mandatów')}`,
      f:()=>{close();G.lastCharge=null;   // minister odwołany, decyzja doszła do skutkustolZatwierdz();
        RESORTY.forEach(r=>{const n=radaKto(r.id);
          if(n&&partiaOsoby(n)===k){delete G.rada[r.id];delete G.radaOd[r.id]}});
        G.rel[G.me][k]=-55;G.rel[k][G.me]=-55;
        me().fame=cl(me().fame+6);me().act=cl(me().act+7);me().ctr=cl(me().ctr+16);
        // reszta koalicji widzi, że premier potrafi tak zrobić każdemu
        (G.gov?G.gov.parties:[]).forEach(x=>{if(x!==G.me&&x!==k){
          G.rel[G.me][x]=cl(G.rel[G.me][x]-7,-100,100);G.rel[x][G.me]=cl(G.rel[x][G.me]-7,-100,100)}});
        govLeave(k);
        say(`<b>Odwołujesz ${G.p[k].lead}</b>. ${G.p[k].ab} poza rządem.`,'bad');
        modal('Premier','Minister odwołany',
          `<p><b>${G.p[k].ab}</b> wypada z rządu, a ${rs||'jego resorty'} ${rs.includes(',')?'wracają':'wraca'} do obsadzenia.</p>
           <p style="margin-top:12px">Relacje z ${G.p[k].ab} spadły do <b>−55</b>, kontrowersja w górę o <b>16</b>,
           a pozostali koalicjanci popatrzyli na ciebie inaczej.</p>`,
          [{l:'Rozumiem',f:()=>{close();render()}}]);
        render()}}})
      .concat([{l:'Rezygnuję',s:'Nie tracisz akcji',f:actBack}]),actBack)}

/* Wymiana człowieka na resorcie bez wywracania koalicji. */
function openZmiana(){
  radaInit();
  const obsadzone=RESORTY.filter(r=>radaKto(r.id));
  if(!obsadzone.length)return modal('Premier','Nie ma kogo zmieniać',
    `<p>Rada ministrów świeci pustkami — najpierw kogoś powołaj.</p>`,[{l:'Rozumiem',f:actBack}],actBack);
  const gotowe=obsadzone.filter(r=>!ministerBlokada(r.id));
  if(!gotowe.length)return modal('Premier','Jeszcze za wcześnie',
    `<p>Wszyscy ministrowie objęli resorty dopiero co. Najbliższa zmiana będzie możliwa za
     <b>${Math.min.apply(null,obsadzone.map(r=>ministerBlokada(r.id)))}</b> ${pl(Math.min.apply(null,obsadzone.map(r=>ministerBlokada(r.id))),'tydzień','tygodnie','tygodni')}.</p>
     <p class="dim">Minister musi mieć czas cokolwiek zrobić, zanim go rozliczysz.</p>`,
    [{l:'Rozumiem',f:actBack}],actBack);
  modal('Premier','Zmiana ministra',
    `<p>Wymieniasz osobę na stanowisku. Partia zostaje w koalicji, ale odwołany i jego ludzie
     zapamiętają: <b>kontrowersja +6</b> i relacje w dół.</p>`,
    gotowe.map(r=>{const n=radaKto(r.id),k=partiaOsoby(n);
      return {l:`${r.n}: ${n}`,
        s:`${k&&k!==G.me?G.p[k].ab:'twoja partia'} · na stanowisku ${ministerStaz(r.id)} ${pl(ministerStaz(r.id),'tydzień','tygodnie','tygodni')}`,
        f:()=>{close();openResort(r.id)}}})
      .concat([{l:'Rezygnuję',s:'Nie tracisz akcji',f:actBack}]),actBack);
}
/* Rozwiązanie sejmu to rzecz wyjątkowa: potrzeba słabego rządu, silnej opozycji
   i sejmu, który ma dość. Dlatego szansa jest wyraźnie niższa niż przy wotum. */
function rozwiazChance(){
  if(!G.gov)return 0;
  const opoS=alive().filter(k=>!G.gov.parties.includes(k)).reduce((a,k)=>a+G.p[k].seats,0);
  return cl(.06+(50-G.gov.appr)/420+opoS/TOTAL_SEATS*.16+me().cred/900-.04,.02,.34);
}
function wotumChance(){
  // marszałek dopuszcza wniosek rzadko, trzeba mieć materiał i słabnący rząd
  if(!G.gov)return 0;
  const opoS=alive().filter(k=>!G.gov.parties.includes(k)).reduce((a,k)=>a+G.p[k].seats,0);
  return cl(.15 + (50-G.gov.appr)/260 + opoS/TOTAL_SEATS*.20 + me().cred/700 - .10, .05, .55);
}
function openWotum(){
  if(!G.gov)return modal('Opozycja','Nie ma rządu',`<p>Nie ma czego obalać.</p>`,[{l:'Rozumiem',f:close}]);
  const g=G.gov, pr=wotumChance();
  const o=[{l:`Składam wniosek o wotum nieufności wobec rządu`,
    s:`Szansa na dopuszczenie wniosku: <b>${Math.round(pr*100)}%</b> · premier ${g.pmLead||G.p[g.pm].lead} · poparcie rządu ${Math.round(g.appr)}`,
    f:()=>{close();
      if(!ch(pr)){
        APPR(+2);me().fame=cl(me().fame-3);me().cred=cl(me().cred-4);M(me(),-5);
        say(`<b>Marszałek odrzucił wniosek</b> jako bezzasadny (szansa była ${Math.round(pr*100)}%). Wyszedłeś na krzykacza.`,'bad');
        render();return}
      const v=sejmVote('wotum',g.pm,G.me,1);
      const szef=g.pmLead||G.p[g.pm].lead;
      if(v.pass){say(`<b>Rząd obalony</b> ${v.yes}:${v.no}. Przedterminowe wybory.`,'good');
        G.gov=null;G.pmOk=false;G.week=G.weeks;me().fame=cl(me().fame+9);M(me(),14);XP(20);
        modal('Sejm','Rząd obalony',
          `<p>Wotum nieufności wobec rządu <b>${szef}</b> przeszło: za <b>${v.yes}</b>, przeciw <b>${v.no}</b>, wstrzymało się <b>${v.abst}</b>.</p>
           ${glosyBox(v)}<p style="margin-top:12px">Kadencja kończy się teraz, idziemy do przedterminowych wyborów.</p>`,
          [{l:'Do wyborów',f:()=>{close();render()}}]);}
      else{APPR(+4);me().fame=cl(me().fame+3);
        say(`<b>Wniosek dopuszczony, ale przepadł</b> ${v.yes}:${v.no}. Koalicja się zwarła.`,'bad');
        modal('Sejm','Wotum przepadło',
          `<p>Za <b>${v.yes}</b>, przeciw <b>${v.no}</b>, wstrzymało się <b>${v.abst}</b>. Koalicja zwarła szeregi wokół ${szef}.</p>
           ${glosyBox(v)}<p style="margin-top:12px">Poparcie rządu nawet trochę urosło, ale sam wniosek pokazał ci, kto z kim trzyma.</p>`,
          [{l:'Rozumiem',f:()=>{close();render()}}]);}
      render()}}];
  g.parties.filter(k=>k!==g.pm).forEach(k=>o.push({
    l:`Wotum wobec ministra z ${G.p[k].ab}`,s:`${G.p[k].lead} · resortów ${resortyPartii(k)} · łatwiejsze niż obalenie rządu`,
    f:()=>{close();
      const v=sejmVote('minister',k,G.me,1);
      if(v.pass){govLeave(k);me().fame=cl(me().fame+4);
        say(`<b>Sejm odwołał ministra z ${G.p[k].ab}</b> ${v.yes}:${v.no}.`,'good')}
      else{APPR(+2);say(`<b>Wniosek odrzucony</b> ${v.yes}:${v.no}.`,'bad')}
      render()}}));
  // Najcięższe działo opozycji: nie zmiana rządu, tylko rozpisanie wyborów od nowa.
  const prR=rozwiazChance();
  o.push({l:'Składam wniosek o rozwiązanie sejmu',
    s:`Szansa: <b>${Math.round(prR*100)}%</b> · udaje się rzadko, a przegrana rujnuje sondaż`,
    f:()=>{close();
      const v=sejmVote('rozwiazanie',G.me,G.me,1);
      const potrzeba=Math.floor((v.yes+v.no)/2)+1;
      if(v.pass){
        const rzad=G.gov?G.gov.parties.slice():[];
        rzad.forEach(k=>{const q=G.p[k];
          q.fame=cl(q.fame-RI(12,20));q.cred=cl(q.cred-RI(6,11));q.mom=(q.mom||0)-22;
          REG.forEach(r=>q.pres[r.id]=cl(q.pres[r.id]*.82));M(q,-16)});
        me().fame=cl(me().fame+RI(9,15));me().act=cl(me().act+8);M(me(),18);XP(26);
        const bylRzad=rzad.map(k=>G.p[k].ab).join(', ');
        G.gov=null;G.pmOk=false;G.bloc=null;G.week=G.weeks;
        say(`<b>Sejm rozwiązany</b> ${v.yes}:${v.no}. Rząd idzie do wyborów z połamanym sondażem, a ty jako ten, kto to przepchnął.`,'good');
        modal('Sejm','Sejm rozwiązany',
          `<p>Wniosek przeszedł: za <b>${v.yes}</b>, przeciw <b>${v.no}</b>, wstrzymało się <b>${v.abst}</b>.</p>
           ${glosyBox(v)}
           <p style="margin-top:12px">Kadencja kończy się natychmiast. ${bylRzad?`<b>${bylRzad}</b> idzie do wyborów`:'Rząd idzie do wyborów'}
           ze sławą i obecnością w dół, a ty ze sławą w górę jako ten, kto ich rozliczył.</p>`,
          [{l:'Do wyborów',f:()=>{close();render()}}]);
      }else{
        // przegrany zamach na sejm zostaje w pamięci serwera na długo
        me().fame=cl(me().fame-RI(10,16));me().cred=cl(me().cred-RI(6,10));me().ctr=cl(me().ctr+12);
        me().mom=(me().mom||0)-18;M(me(),-16);APPR(+5);
        say(`<b>Wniosek o rozwiązanie sejmu przepadł</b> ${v.yes}:${v.no}. Serwer zapamiętał, kto próbował wywrócić stół.`,'bad');
        modal('Sejm','Wniosek przepadł',
          `<p>Za <b>${v.yes}</b>, przeciw <b>${v.no}</b>, wstrzymało się <b>${v.abst}</b>. Do przejścia brakowało <b>${Math.max(0,potrzeba-v.yes)}</b> ${pl(Math.max(0,potrzeba-v.yes),'głosu','głosów','głosów')}.</p>
           ${glosyBox(v)}
           <p style="margin-top:12px">Nikt nie oddaje własnego mandatu z ochotą — im większa partia, tym mocniej trzyma się krzesła.
           Ty tracisz sławę, wiarygodność i rozpęd, a poparcie rządu rośnie.</p>`,
          [{l:'Rozumiem',f:()=>{close();render()}}]);
      }
      render()}});
  o.push({l:'Rezygnuję',s:'Nie tracisz akcji ani kapitału',f:actBack});
  modal('Opozycja','Rozliczanie rządu',
    `<p>Wniosek o wotum nieufności trafia najpierw do marszałka i najczęściej ląduje w koszu ,
     obalenie rządu wobec całego gabinetu udaje się rzadko. Uderzenie w pojedynczego ministra
     przechodzi łatwiej i osłabia koalicję bez wywracania stołu. Odrzucony wniosek kosztuje cię
     sławę i wiarygodność.</p>`,o,actBack)}
const THR={base:5};

/* ══════════ USTAWY ══════════
   Premier zgłasza, sejm głosuje, prezydent podpisuje albo odrzuca.
   Każda wchodzi w życie na stałe i działa do końca rozgrywki. */
const LAWS=[
 {id:'ekon',n:'Ustawa ekonomiczna',kat:'gospodarka',prog:.5,resort:'fin',
  d:'Przebudowa składek partyjnych: elity płacą według majątku, reszta ryczałtem.',
  skutek:'Wpływy ze składek rosną o jedną piątą. Dotyczy wszystkich partii, więc bogaci zyskują najwięcej.'},
 {id:'podatki',n:'Ustawa o podatkach',kat:'gospodarka',prog:.5,resort:'fin',wybor:true,
  d:'Ustalasz, kto ile oddaje: daninę od kapitału leżącego bezczynnie i to, czy wszyscy płacą po równo, czy bogatsi więcej.',
  skutek:'Nastawiasz podatek od prywatnych majątków na serwerze i wybierasz, czy stawka jest równa dla wszystkich, czy bogaci płacą więcej. Podatek napełnia skarb, ale zjada majątki i zaufanie przedsiębiorców, więc PKB zwalnia z dwóch stron naraz.'},
 {id:'zagadki',n:'Ustawa o zagadkach tematycznych',kat:'rozrywka',prog:.5,resort:'kultura',
  d:'Cotygodniowe zagadki na kanałach, z nagrodami z budżetu sejmu.',
  skutek:'Co kadencję dochodzą serwerowicze, najwięcej partii, która to przepchnęła. Serwer ożywa, więc rośnie też aktywność.'},
 {id:'cytaty',n:'Ustawa o cytatach',kat:'rozrywka',prog:.5,resort:'kultura',
  d:'Oficjalny kanał z najlepszymi tekstami serwera i głosowaniem na cytat tygodnia.',
  skutek:'Co kadencję dochodzą serwerowicze, najwięcej partii, która to przepchnęła.'},
 {id:'media',n:'Ustawa o mediach',kat:'rozrywka',prog:.5,resort:'kultura',
  d:'Serwerowa gazeta i regulamin sporów wokół tego, kto co napisał.',
  skutek:'Co kadencję dochodzą serwerowicze i intelektualista, najwięcej partii, która to przepchnęła.'},
 {id:'mordepedia',n:'Ustawa o Mordepedii',kat:'rozrywka',prog:.5,resort:'arch',
  d:'Serwerowa encyklopedia: kto, kiedy, co i dlaczego, z przypisami i sporami o przypisy.',
  skutek:'Sława +10 od razu dla tego, kto ją przepchnął, a co kadencję dochodzi intelektualista.'},
 {id:'sady',n:'Ustawa o sądach administracyjnych',kat:'ustrój',prog:.5,resort:'spraw',
  d:'Instancja odwoławcza od decyzji administracji: terminy, procedura i papier na wszystko.',
  skutek:'Brudne zagrywki kosztują wnioskodawcę o połowę mniej kontrowersji i pretensjonalności.'},
 {id:'man',n:'Ustawa o MAN',kat:'ustrój',prog:.5,resort:'edu',
  d:'Mordeczkowa Akademia Nauk: stopnie, tytuły i ścieżka awansu dla tych, którzy piszą dłużej niż zdanie. Przy okazji ustalasz, co Akademia organizuje na otwarcie — i płacisz za to z własnej kieszeni.',
  skutek:'Raz na kadencję wnioskodawca przekuwa dwóch intelektualistów w elitę. Reszcie dochodzi jeden po latach. Do tego skutek wybranego przedsięwzięcia.',
  warianty:[
   {id:'zagwozdki',n:'Wykład o intelektualnych zagwozdkach',mln:26,
    d:'Trzy godziny o niczym i wszystkim naraz. Elita wychodzi zachwycona, reszta serwera nie wie, co się stało.',
    ef:p=>{p.cred=cl(p.cred+11);p.aff.eli=Math.max(.1,p.aff.eli+.5);p.pret=cl(p.pret+7);
      p.fame=cl(p.fame+4);M(p,4);return 'Elita mówi o tym tygodniami. Wiarygodność mocno w górę, sympatia elity też.'}},
   {id:'reportaz',n:'Reportaż o serwerze',mln:14,
    d:'Godzinny materiał o tym, jak to wszystko działa. Ogląda go pół serwera i nikt nie ma pretensji.',
    ef:p=>{p.cred=cl(p.cred+6);p.fame=cl(p.fame+7);p.act=cl(p.act+4);
      p.aff.int=Math.max(.1,p.aff.int+.3);M(p,3);
      return 'Materiał obejrzeli wszyscy. Sława i wiarygodność w górę po równo.'}},
   {id:'smieci',n:'Wykład o śmieciach',mln:5,
    d:'Temat żaden, prowadzący przypadkowy, ale wstęp wolny i sala pełna.',
    ef:p=>{p.fame=cl(p.fame+4);p.act=cl(p.act+3);p.aff.ser=Math.max(.1,p.aff.ser+.25);
      p.pret=cl(p.pret-3);M(p,2);
      return 'Tanio, wesoło i bez pretensji. Serwerowicze to zapamiętali.'}},
  ]},
 {id:'event',n:'Ustawa o utworzeniu eventu',kat:'ustrój',prog:.5,resort:'kultura',
  d:'Sejm powołuje wielki event serwerowy, a ty go finansujesz z własnych pieniędzy. Wybierasz, co to będzie — i za to płacisz z prywatnego majątku przewodniczącego.',
  skutek:'Skutek zależy od wybranego eventu. Płaci przewodniczący z własnej kieszeni, nie partia.',
  warianty:[
   {id:'teleturniej',n:'Teleturniej telewizyjny',mln:38,
    d:'Studio, światła, nagrody i pół serwera przed ekranami. Najdroższa rzecz, jaką można tu zrobić, i najgłośniejsza.',
    ef:p=>{p.fame=cl(p.fame+16);p.act=cl(p.act+7);p.uni=cl(p.uni+5);M(p,7);
      REG.forEach(r=>p.pres[r.id]=cl(p.pres[r.id]+14));
      return 'Oglądał to cały serwer. Sława mocno w górę i obecność rośnie wszędzie.'}},
   {id:'gra',n:'Event o grze komputerowej',mln:19,
    d:'Turniej z zapisami, drabinką i awanturą o zasady. Serwerowicze żyją tym tygodniami.',
    ef:p=>{p.fame=cl(p.fame+9);p.act=cl(p.act+9);p.aff.ser=Math.max(.1,p.aff.ser+.55);
      p.ctr=cl(p.ctr+4);M(p,6);
      return 'Turniej wciągnął pół serwera. Serwerowicze są twoi, ale o zasady był spór.'}},
   {id:'przemowa',n:'Event o przemowie',mln:7,
    d:'Wychodzisz, mówisz, schodzisz. Bez scenografii i bez budżetu, za to własnymi słowami.',
    ef:p=>{p.cred=cl(p.cred+8);p.uni=cl(p.uni+7);p.fame=cl(p.fame+3);
      p.ctr=cl(p.ctr-3);
      return 'Bez fajerwerków, za to szczerze. Wiarygodność i jedność w górę.'}},
  ]},
 {id:'kodeks',n:'Nowelizacja kodeksu karnego',kat:'ustrój',prog:.5,resort:'spraw',
  d:'Nowa taryfa kar: mniej banów za drobiazgi, twardziej za awantury.',
  skutek:'Co kadencję dochodzą serwerowicze i intelektualista, a kontrowersja wnioskodawcy spada o 4.'},
 {id:'konst',n:'Nowelizacja konstytucji',kat:'ustrój',prog:2/3,
  d:'Zmiana ustroju serwera. Wymaga dwóch trzecich głosów, więc bez szerokiej zgody nie ma o czym mówić.',
  skutek:'Co kadencję dochodzi ci 1 osoba z elity i 2 intelektualistów.'},
 {id:'ordyn',n:'Ustawa o ordynacji wyborczej',kat:'ustrój',prog:.5,wybor:true,
  d:'Ustalasz od nowa próg wyborczy i wielkość sejmu.',
  skutek:'Próg i liczba mandatów zmieniają się na to, co ustawisz przy zgłoszeniu.'},
];
const lawById=id=>LAWS.find(x=>x.id===id);

/* Ustawy z pokrętłami. Te da się nastawiać i poprawiać także po uchwaleniu —
   poprawka idzie pod głosowanie tak samo jak nowa ustawa i tak samo się opłaca.
   Im mocniej odchylasz się od stanu wyjściowego, tym chętniej sejm mówi „hola hola”. */
const LAWPAR={
 ekon:{
  baza:{eli:2.6,int:.95,ser:.18},
  zakres:{eli:[1,6],int:[.3,3],ser:[.05,1.5]},
  krok:{eli:.2,int:.1,ser:.05},
  opis:{eli:'Składka elity',int:'Składka intelektualisty',ser:'Składka serwerowicza'},
  jedn:'kapitału tygodniowo'},
 ordyn:{
  baza:{prog:5},
  // próg powyżej ośmiu procent wycinał przy kilkunastu partiach cały sejm
  zakres:{prog:[0,8]},
  krok:{prog:1},
  opis:{prog:'Próg wyborczy'},
  jedn:''},
 podatki:{
  // progresja 0 = każdy płaci tyle samo, 1 = bogatsi dokładają za resztę
  baza:{majatek:0,progresja:0},
  zakres:{majatek:[0,12],progresja:[0,1]},
  krok:{majatek:1,progresja:1},
  opis:{majatek:'Podatek od prywatnego majątku (%)',progresja:'Progresja (0 równo, 1 progresywnie)'},
  jedn:''},
};
const lawEdytowalna=id=>!!LAWPAR[id];
function lawParams(id){
  lawsInit();
  const P=LAWPAR[id];if(!P)return null;
  const zapisane=(G.law[id]&&typeof G.law[id]==='object')?G.law[id]:null;
  return Object.assign({},P.baza,zapisane||{});
}
/* 0 = tak jak było, 1 = skrajność, której nikt nie przepuści.
   Nie wszystko waży tyle samo: przy ordynacji ruszanie liczby mandatów przewraca
   cały sejm, a sam próg to znacznie mniejsza sprawa. Punktem odniesienia jest
   stan obecny, nie pierwotny — inaczej każda kolejna poprawka byłaby coraz trudniejsza. */
const LAWWAGI={ordyn:{prog:.75}};
function radykalnosc(id,o){
  const P=LAWPAR[id];if(!P||!o)return 0;
  const teraz=(G&&G.law&&typeof G.law[id]==='object')?G.law[id]:P.baza;
  const wagi=LAWWAGI[id]||{};
  const klucze=Object.keys(P.baza);
  let suma=0,wagaSuma=0;
  klucze.forEach(k=>{
    const b=teraz[k]!==undefined?teraz[k]:P.baza[k], z=P.zakres[k];
    const rozpietosc=Math.max(z[1]-b,b-z[0])||1;
    const w=wagi[k]||1;
    suma+=Math.abs((o[k]-b)/rozpietosc)*w;
    wagaSuma+=w;
  });
  return cl(suma/Math.max(1,wagaSuma),0,1);
}
/* Nastawienie sejmu zmienia się z kadencji na kadencję — raz posłowie są ugodowi,
   raz nie chcą słyszeć o żadnych zmianach. Dzięki temu odrzucona ustawa nie znaczy,
   że ta sama nigdy nie przejdzie. */
function nastrojSejmu(){
  if(!G)return 1;
  if(G.nastroj===undefined||G.nastrojTerm!==G.term){
    G.nastroj=Math.round(R(.72,1.34)*100)/100;
    G.nastrojTerm=G.term;
  }
  return G.nastroj;
}
function nastrojOpis(){
  const n=nastrojSejmu();
  return n<.85?'Sejm w tej kadencji jest ugodowy.'
    :n<1.1?'Sejm w tej kadencji głosuje jak zwykle.'
    :n<1.25?'Sejm w tej kadencji jest podejrzliwy wobec zmian.'
    :'Sejm w tej kadencji nie chce słyszeć o żadnych reformach.';
}
function oporOpis(r){
  return r<.12?'Sejm nawet tego nie zauważy.'
    :r<.3?'Drobna korekta, powinna przejść bez awantury.'
    :r<.5?'Zauważalna zmiana. Część partii będzie kręcić nosem.'
    :r<.72?'Radykalne. Sejm powie, że przesadzasz, i wielu zagłosuje przeciw.'
    :'Skrajność. „Hola hola, przepierdoliłeś sobie” — tak to skwitują i odrzucą.';
}
function lawsInit(){
  if(!G.law)G.law={};
  if(!G.lawTerm)G.lawTerm={};
}
const lawDone=id=>{lawsInit();return !!G.law[id]};
const lawsToSign=()=>{lawsInit();return G.lawPend?[G.lawPend]:[]};
function lawsPending(){
  lawsInit();
  if(G.lawPend)return false;                       // jedna ustawa w toku naraz
  return LAWS.some(l=>!lawDone(l.id)&&!G.lawTerm[l.id]);
}

/* ile mandatów popiera ustawę — koalicja trzyma z wnioskodawcą, reszta zależy
   od relacji i od tego, jak bardzo wniosek odbiega od stanu zastanego */
function lawVote(id,opcje,wnioskodawca,mojGlos){
  const law=lawById(id), przez=wnioskodawca||G.me;
  const rad=radykalnosc(id,opcje);
  const by={};let za=0,przeciw=0,wstrzym=0;
  alive().forEach(k=>{
    const s=G.p[k].seats;if(!s)return;
    if(k===przez&&k!==G.me){za+=s;by[k]='za';return}
    if(k===G.me){
      // gracz głosuje sam, chyba że to jego własny wniosek
      const v=(mojGlos===undefined)?'za':mojGlos;
      if(v==='za'){za+=s;by[k]='za'}
      else if(v==='wstrzym'){wstrzym+=s;by[k]='wstrzymał się'}
      else{przeciw+=s;by[k]='przeciw'}
      return;
    }
    /* Przekupiony koalicjant głosuje przeciw własnemu rządowi — raz, przy najbliższej
       ustawie, i to wystarcza, żeby wywrócić głosowanie wiszące na jednym mandacie. */
    if(G.przekupiony&&G.przekupiony.kto===k&&G.przekupiony.doTerm===G.term){
      przeciw+=s;by[k]='przeciw';
      return;
    }
    const wRzadzie=!!(G.gov&&G.gov.parties.includes(k));
    const rel=G.rel[k][przez];
    /* Umowa koalicyjna to nie sondaż. Rząd firmuje swoje ustawy — inaczej
       zgłaszasz projekt jako premier i patrzysz, jak twoi właśni koalicjanci
       wstrzymują się albo głosują przeciw, mimo że dogadałeś się z nimi tydzień
       wcześniej. Wpływ zostaje, ale przez relacje: dobre to głos pewny, chłodne
       to wstrzymanie, a dopiero naprawdę zepsute zwalniają z dyscypliny. */
    const wnioskZRzadu=!!(G.gov&&G.gov.parties.includes(przez));
    if(wRzadzie&&wnioskZRzadu&&k!==przez){
      const skrajna=rad>.78&&rel<45;      // pod projekt szyty grubo pod siebie nikt nie podpisze się w ciemno
      if(rel>=10&&!skrajna){za+=s;by[k]='za';return}
      if(rel>=-15&&!skrajna){
        if(ch(.72)){za+=s;by[k]='za'} else {wstrzym+=s;by[k]='wstrzymał się'}
        return;
      }
      // relacje pod kreską albo projekt nie do obrony — koalicjant głosuje jak reszta sejmu
    }
    // resort w rękach koalicjanta kupuje jego głos — ale samo bycie w rządzie waży więcej
    const maResort=Object.values(G.rada||{}).some(n=>partiaOsoby(n)===k);
    /* Opozycja nie firmuje sukcesów rządu. Dawna baza .34 sprawiała, że nawet wrogowie
       głosowali za co trzecim projektem i wszystko przechodziło samo — teraz ustawa
       potrzebuje realnego zaplecza w sejmie albo dogadania się z kimś z zewnątrz. */
    const opozycja=!!(G.gov&&!G.gov.parties.includes(k)&&przez!==k);
    /* Posłowie słuchają swojego zaplecza: partia oparta na elicie zagłosuje
       inaczej niż ta stojąca na serwerowiczach, bo obie odpowiadają przed kim
       innym. To jest ten sam podział, który liczy się przy urnach. */
    const skl=G.p[k].comp, mem=Math.max(1,G.p[k].mem);
    const glosGrup=SID.reduce((a,g)=>a+(skl[g]/mem)*grupaWobecUstawy(g,id,opcje),0);
    const szansa=cl(BAL.ustawaBaza+rel/165+(wRzadzie?BAL.ustawaKoalicja:0)+(maResort?.12:0)
      -(opozycja?BAL.ustawaOpozycja:0)       // rywalowi nie robi się prezentów
      +(law.kat==='rozrywka'?.18:0)          // przy rozrywce nikt się nie kłóci
      -(law.prog>.6?.18:0)                   // ustrojowych pilnują wszyscy
      -rad*BAL.ustawaOpor*nastrojSejmu()     // im bardziej pod siebie, tym większy opór
      +glosGrup*.22                          // czego chce zaplecze tej partii
      +(G.p[k].cred>60?-.05:.03),.02,.94);
    if(ch(szansa)){za+=s;by[k]='za'}
    else if(ch(.22)){wstrzym+=s;by[k]='wstrzymał się'}
    else{przeciw+=s;by[k]='przeciw'}
  });
  const oddane=za+przeciw;
  const potrzeba=Math.ceil((law.prog>.6?(za+przeciw+wstrzym):oddane)*law.prog);
  return {za,przeciw,wstrzym,by,potrzeba,rad,ok:za>=potrzeba&&za>0};
}

/* Rozliczenie rządu z tego, co dowiózł. Wywoływane po każdym głosowaniu nad ustawą,
   niezależnie od tego, kto ją składał — liczy się to, czy rząd potrafi przepchnąć
   swoje przez sejm. */
function sprawczosc(przeszla,kto){
  const g=G.gov;
  if(!g||!G.pmOk)return;
  if(typeof g.spraw!=='number')g.spraw=50;
  const rzadowa=g.parties.includes(kto);
  if(!rzadowa){
    // opozycja przepchnęła swoje: rząd stracił kontrolę nad izbą i to widać
    if(przeszla){g.spraw=cl((g.spraw||50)-11);APPR(-3);
      const pm=G.p[g.pm];if(pm){pm.cred=cl(pm.cred-2);M(pm,-4)}
      if(g.pm===G.me)say('<b>Opozycja przepchnęła ustawę pod twoim nosem.</b> Sejm przestaje słuchać rządu.','bad')}
    return;
  }
  if(przeszla){
    g.spraw=cl(g.spraw+9);g.wygrane=(g.wygrane||0)+1;
    APPR(+2);
  }else{
    g.spraw=cl(g.spraw-14);g.przegrane=(g.przegrane||0)+1;
    APPR(-5);
    const pm=G.p[g.pm];
    if(pm){pm.cred=cl(pm.cred-3);M(pm,-6)}
    // seria porażek to już nie pech, tylko rząd, który nie panuje nad własną większością
    if(g.przegrane>=3&&g.spraw<=25){
      if(pm){pm.fame=cl(pm.fame-4);pm.uni=cl(pm.uni-4)}
      if(g.pm===G.me)say('<b>Twój rząd nie panuje nad sejmem.</b> Trzecia przegrana ustawa — sprawczość na dnie, a serwer to widzi.','bad');
      else if(G.gov.parties.includes(G.me))say(`<b>Rząd ${G.p[g.pm].ab} przegrywa głosowanie za głosowaniem.</b> Koalicja traci na tym razem z premierem.`,'bad');
    }
  }
}
function proposeLaw(id,opcje){
  lawsInit();
  const law=lawById(id);
  if(!law||!mogeZglosic(id)||G.lawPend||G.lawTerm[id])return;
  if(lawDone(id)&&!lawEdytowalna(id))return;        // bez pokręteł nie ma czego poprawiać
  if(ustawaWTymTygodniu())return;                   // jeden projekt na tydzień
  /* Podejście zużywa się dopiero wtedy, gdy sprawa naprawdę się kończy — przy
     przegranym głosowaniu albo po podpisie. Weto prezydenta nie może spalać
     projektu, który sejm przegłosował: premier wygrał izbę i ma prawo wrócić. */
  G.lawWeek=G.term+'-'+G.week;                      // laska marszałkowska zajęta do końca tygodnia
  const w=lawVote(id,opcje);
  close();
  if(!w.ok){
    me().ctr=cl(me().ctr+3);
    G.lawTerm[id]=1;      // przegrane głosowanie to zużyte podejście
    sprawczosc(false,G.me);
    if(G.przekupiony&&G.przekupiony.doTerm===G.term)G.przekupiony=null;   // kupiony głos działa raz
    say(`<b>${law.n} przepada.</b> Za ${w.za}, przeciw ${w.przeciw} przy progu ${w.potrzeba}.`,'bad');
    modal('Sejm','Ustawa nie przeszła',
      `<p><b>${law.n}</b> nie zebrała większości: za <b>${w.za}</b>, przeciw <b>${w.przeciw}</b>,
       wstrzymało się <b>${w.wstrzym}</b>. Potrzeba było <b>${w.potrzeba}</b>.</p>
       ${w.rad>.45?`<p style="color:var(--neg)"><b>Sejm uznał, że przesadziłeś.</b> ${oporOpis(w.rad)}</p>`:''}
       ${lawGlosy(w)}
       <p style="margin-top:12px">Kontrowersja +3. Do tej ustawy wrócisz dopiero w przyszłej kadencji.</p>`,
      [{l:'Rozumiem',f:()=>{close();render()}}]);
    return;
  }
  sprawczosc(true,G.me);
  if(G.przekupiony&&G.przekupiony.doTerm===G.term)G.przekupiony=null;
  G.lawPend={id,opcje:opcje||null,za:w.za,przeciw:w.przeciw,wstrzym:w.wstrzym,by:w.by,przez:G.me,odTerm:G.term,odWeek:G.week};
  say(`<b>${law.n} przechodzi przez sejm.</b> Za ${w.za}, przeciw ${w.przeciw}. Czeka na podpis prezydenta.`,'good');
  const prezK=G.prez?G.prez.party:null;
  modal('Sejm','Ustawa uchwalona',
    `<p><b>${law.n}</b> przechodzi: za <b>${w.za}</b>, przeciw <b>${w.przeciw}</b>, wstrzymało się <b>${w.wstrzym}</b>.</p>
     ${lawGlosy(w)}
     <p style="margin-top:12px">Teraz ${prezK?`decyduje prezydent <b>${G.prez.lead}</b> (${G.p[prezK]?G.p[prezK].ab:'—'})`:'brak prezydenta, więc ustawa wchodzi sama'}.</p>`,
    [{l:'Rozumiem',f:()=>{close();if(!prezK)signLaw(true,true);else{aiSignLaw();render()}}}]);
}
/* ══════════ PANEL GŁOSOWANIA ══════════
   Jeden wygląd dla wszystkiego, nad czym głosuje sejm: ustaw, wotum, rozwiązania
   izby i odwołania ministra. Pasek pokazuje układ sił, kreska — próg przejścia,
   a lista mówi, kto jak zagłosował i ile ma mandatów. */
function panelGlosowania(d){
  const za=d.za||0, przeciw=d.przeciw||0, wstrzym=d.wstrzym||0;
  const suma=Math.max(1,za+przeciw+wstrzym);
  const potrzeba=d.potrzeba!==undefined?d.potrzeba:Math.floor((za+przeciw)/2)+1;
  const przeszlo=d.ok!==undefined?d.ok:za>=potrzeba;
  const proc=x=>(x/suma*100).toFixed(1);
  const progPoz=cl(potrzeba/suma*100,0,100);

  const lista=Object.keys(d.by||{}).sort((a,b)=>G.p[b].seats-G.p[a].seats);
  const glos=k=>{const v=d.by[k];
    if(typeof v==='number')return v>0?'za':v<0?'przeciw':'wstrzymał się';
    return v;};

  const brakowalo=Math.max(0,potrzeba-za);
  return `<div class="glos">
    <div class="glospieczec ${przeszlo?'ok':'no'}">
      <div class="glosznak">${przeszlo
        ? `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12.5l5.5 5.5L20 7" fill="none"
             stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`
        : `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none"
             stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>`}</div>
      <div class="glostyt">
        <b>${przeszlo?'Przeszło':'Przepadło'}</b>
        <span>${przeszlo?`próg ${potrzeba} zebrany z zapasem ${za-potrzeba}`
          :brakowalo?`zabrakło ${brakowalo} ${pl(brakowalo,'głosu','głosów','głosów')} do progu ${potrzeba}`
          :`próg ${potrzeba}`}</span>
      </div>
      <div class="glosliczby">
        <div class="ok"><b>${za}</b><span>za</span></div>
        <div><b>${wstrzym}</b><span>wstrzym.</span></div>
        <div class="no"><b>${przeciw}</b><span>przeciw</span></div>
      </div>
    </div>
    <div class="glospas">
      ${za?`<i class="za" style="width:${proc(za)}%">${za}</i>`:''}
      ${wstrzym?`<i class="ws" style="width:${proc(wstrzym)}%">${wstrzym>1?wstrzym:''}</i>`:''}
      ${przeciw?`<i class="pr" style="width:${proc(przeciw)}%">${przeciw}</i>`:''}
      <u class="prog" style="left:${progPoz}%"><em>${potrzeba}</em></u>
    </div>
    <div class="gloslegenda">
      <span><i class="za"></i>za</span><span><i class="ws"></i>wstrzymali się</span>
      <span><i class="pr"></i>przeciw</span><span class="dim">kreska to próg przejścia</span>
    </div>
    ${lista.length?`<div class="glosparty">${lista.map(k=>{const g=glos(k);
      return `<div class="gp ${g==='za'?'ok':g==='przeciw'?'no':''} ${k===G.me?'ja':''}">
        ${crest(k,'xs')}<span class="gpn">${G.p[k].ab}</span>
        <span class="gpg">${g}</span><b>${G.p[k].seats}</b></div>`}).join('')}</div>`:''}
  </div>`;
}
function glosyBox(v){return panelGlosowania(v)}
function lawGlosy(w){return panelGlosowania(w)}
/* ---- ustawy premiera sterowanego przez komputer ----
   Bez tego bycie samym prezydentem nie miałoby sensu: na biurko nigdy nic by nie trafiło. */
function aiProposeLaw(){
  lawsInit();radaInit();
  if(G.lawPend||!G.gov||!G.pmOk)return;
  const wolne=LAWS.filter(l=>!G.lawTerm[l.id]&&(!lawDone(l.id)||lawEdytowalna(l.id)));
  if(!wolne.length)return;

  /* Projekt składa premier albo minister — każdy ze swojego podwórka.
     Bot z resortem Finansów sięga po ustawę o podatkach tak samo jak ty. */
  const zglaszajacy=[];
  const pmK=G.gov.pm;
  if(pmK&&pmK!==G.me&&G.p[pmK]&&!G.p[pmK].dead)
    zglaszajacy.push({k:pmK,pula:wolne,szansa:.24});
  alive().forEach(k=>{
    if(k===G.me||k===pmK||!G.p[k]||G.p[k].dead)return;
    const resorty=RESORTY.filter(r=>{const n=radaKto(r.id);return n&&partiaOsoby(n)===k}).map(r=>r.id);
    if(!resorty.length)return;
    const pula=wolne.filter(l=>l.resort&&resorty.includes(l.resort));
    if(pula.length)zglaszajacy.push({k,pula,szansa:.16});
  });
  if(!zglaszajacy.length)return;

  const wybor=pick(zglaszajacy);
  if(!ch(wybor.szansa))return;              // mniej więcej raz na kilka tygodni
  const pm=wybor.k, mozliwe=wybor.pula;
  // Składa to, co jemu się opłaca: partia serwerowicka ciśnie rozrywkę,
  // elitarna ekonomię, a ktoś ledwo nad progiem próbuje ruszyć ordynację.
  const q=G.p[pm], udzial=g=>q.mem?q.comp[g]/q.mem:0;
  const law=mozliwe.map(l=>{
    let w=1;
    if(l.kat==='rozrywka')w+=udzial('ser')*2.6;
    if(l.id==='ekon')w+=udzial('eli')*3.2+udzial('int')*1.1;
    if(l.id==='konst')w+=udzial('eli')*2.4;
    if(l.id==='kodeks')w+=udzial('ser')*1.5+udzial('int')*1.2;
    if(l.id==='ordyn')w+=q.seats<=3?2.2:.4;
    return {l,w:w*(.8+Math.random()*.5)};
  }).sort((a,b)=>b.w-a.w)[0].l;

  // bot nastawia pokrętła zachowawczo — sam nie chce przegrać głosowania
  let opcje=null;
  if(lawEdytowalna(law.id)){
    const P=LAWPAR[law.id];opcje={};
    const teraz=lawParams(law.id);
    Object.keys(P.baza).forEach(k=>{
      const z=P.zakres[k];
      const delta=(Math.random()-.4)*(z[1]-z[0])*.16;
      opcje[k]=Math.round(cl(teraz[k]+delta,z[0],z[1])*100)/100;
    });
  }
  G.lawTerm[law.id]=1;
  if(me().seats>0)openGlosowanie(law,opcje,pm);   // masz mandaty, więc masz głos
  else rozstrzygnijUstawe(law.id,opcje,pm,undefined);
}
function openGlosowanie(law,opcje,pm){
  const nast=opcje?Object.keys(opcje).map(k=>`${LAWPAR[law.id].opis[k]}: <b>${opcje[k]}${k==='prog'?'%':''}</b>`).join(' · '):'';
  const rad=radykalnosc(law.id,opcje);
  modal('Sejm głosuje',law.n,
    `<p><b>${G.p[pm].ab}</b> kieruje pod głosowanie ustawę, którą firmuje ${G.p[pm].lead}.
     ${G.gov&&G.pmOk&&G.gov.pm!==pm?`Projekt idzie spoza gabinetu — jeśli przejdzie,
       najwięcej zapisze sobie premier <b>${G.p[G.gov.pm].ab}</b>.`
      :'To projekt rządowy.'}</p>
     <p>${law.d}</p>
     <p><b>Skutek:</b> ${law.skutek}</p>
     ${nast?`<div class="note" style="margin:12px 0">${nast}</div>`:''}
     ${rad>.4?`<p style="color:var(--neg)">${oporOpis(rad)}</p>`:''}
     <p style="margin-top:10px">Masz <b>${me().seats}</b> ${pl(me().seats,'mandat','mandaty','mandatów')}.
     Jeśli ustawa przejdzie, wzmocni partię premiera — ale ty też skorzystasz na tym, co zmienia.</p>`,
    [{l:'Głosuję za',s:'Relacje z premierem w górę',f:()=>{close();rozstrzygnijUstawe(law.id,opcje,pm,'za',8)}},
     {l:'Wstrzymuję się',s:'Nic nie ryzykujesz',f:()=>{close();rozstrzygnijUstawe(law.id,opcje,pm,'wstrzym',0)}},
     {l:'Głosuję przeciw',s:'Relacje z premierem w dół',f:()=>{close();rozstrzygnijUstawe(law.id,opcje,pm,'przeciw',-8)}}],
    ()=>{close();rozstrzygnijUstawe(law.id,opcje,pm,'wstrzym',0)});
}
function rozstrzygnijUstawe(id,opcje,pm,mojGlos,relZmiana){
  const law=lawById(id);
  const w=lawVote(id,opcje,pm,mojGlos);
  if(relZmiana&&G.rel[G.me]&&G.rel[G.me][pm]!==undefined){
    G.rel[G.me][pm]=cl(G.rel[G.me][pm]+relZmiana,-100,100);
    G.rel[pm][G.me]=cl(G.rel[pm][G.me]+relZmiana,-100,100);
  }
  if(!w.ok){
    G.lawTerm[id]=1;
    sprawczosc(false,pm);
    if(G.przekupiony&&G.przekupiony.doTerm===G.term)G.przekupiony=null;
    say(`<b>${law.n}</b> od ${G.p[pm].ab} przepada w sejmie: za ${w.za}, przeciw ${w.przeciw}.`,'bad');
    // po oddaniu głosu gracz ma zobaczyć, czym się to skończyło i kto jak głosował
    if(mojGlos!==undefined)modal('Sejm','Ustawa nie przeszła',
      `<p><b>${law.n}</b> ${G.p[pm]?'od '+G.p[pm].ab:''} przepada.</p>
       <p style="margin-top:8px">Za <b>${w.za}</b>, przeciw <b>${w.przeciw}</b>,
       wstrzymało się <b>${w.wstrzym}</b>. Do przejścia trzeba było <b>${w.potrzeba}</b>.</p>
       ${panelGlosowania(w)}
       <p style="margin-top:12px" class="dim">Twój głos: <b>${mojGlos==='za'?'za':mojGlos==='wstrzym'?'wstrzymanie się':'przeciw'}</b>.</p>`,
      [{l:'Rozumiem',f:()=>{close();render()}}]);
    render();return;
  }
  sprawczosc(true,pm);
  if(G.przekupiony&&G.przekupiony.doTerm===G.term)G.przekupiony=null;
  G.lawPend={id,opcje:opcje||null,za:w.za,przeciw:w.przeciw,wstrzym:w.wstrzym,by:w.by,przez:pm,odTerm:G.term,odWeek:G.week};
  say(`<b>${law.n}</b> przechodzi przez sejm głosami ${w.za}:${w.przeciw}. Firmuje ją ${G.p[pm].ab}.`);
  if(mojGlos!==undefined)modal('Sejm','Ustawa przeszła',
    `<p><b>${law.n}</b> przechodzi. Firmuje ją <b>${G.p[pm]?G.p[pm].ab:'rząd'}</b>.</p>
     <p style="margin-top:8px">Za <b>${w.za}</b>, przeciw <b>${w.przeciw}</b>,
     wstrzymało się <b>${w.wstrzym}</b> przy progu <b>${w.potrzeba}</b>.</p>
     ${panelGlosowania(w)}
     <p style="margin-top:12px" class="dim">Twój głos: <b>${mojGlos==='za'?'za':mojGlos==='wstrzym'?'wstrzymanie się':'przeciw'}</b>.
     ${hasPrez()?'Teraz decyzja należy do ciebie jako prezydenta.':'Ustawa idzie na biurko prezydenta.'}</p>`,
    [{l:'Rozumiem',f:()=>{close();render()}}]);
  if(hasPrez()){
    // pałac twój: to ty decydujesz, więc nie rozstrzygamy tego za ciebie
    say('<b>Ustawa czeka na twój podpis.</b> Zajrzyj do działu Prezydent.','roy');
    render();
  }else{
    aiSignLaw();render();
  }
}

/* prezydent sterowany przez komputer decyduje sam, gdy pałac nie jest twój */
function aiSignLaw(){
  if(!G.lawPend||hasPrez())return;
  const prezK=G.prez?G.prez.party:null;
  const law=lawById(G.lawPend.id), moja=G.lawPend.przez===G.me;
  if(!prezK||!G.p[prezK]){
    signLaw(true,true);
    if(moja)modal('Prezydent','Nie ma komu wetować',
      `<p>Pałac stoi pusty, więc <b>${law.n}</b> wchodzi w życie bez niczyjego podpisu.</p>`,
      [{l:'Rozumiem',f:()=>{close();render()}}]);
    return;
  }
  const rel=G.rel[prezK]&&G.gov&&G.gov.pm?G.rel[prezK][G.gov.pm]:0;
  /* Pałac czyta, co podpisuje. Ustawa radykalna budzi opór, ustawa korzystna
     dla partii prezydenta przechodzi łatwiej, a projekt firmowany przez własny
     obóz nie zostaje zawetowany z powodu jednej kłótni z premierem. */
  const rad=radykalnosc(G.lawPend.id,G.lawPend.opcje||null);
  const swoja=G.lawPend.przez===prezK;
  const wRzadzie=!!(G.gov&&G.gov.parties.includes(prezK));
  const szansa=cl(.5+rel/190-rad*.42+(swoja?.45:0)+(wRzadzie?.18:0)
    +(law.kat==='rozrywka'?.1:0)-(law.prog>.6?.12:0),.08,.97);
  const przyjmie=ch(szansa);
  signLaw(przyjmie,true);
  // Decyzja Pałacu ginęła w kronice — przy własnej ustawie mówimy o niej wprost.
  if(moja){
    const kto=`${G.prez.lead} (${G.p[prezK].ab})`;
    modal('Prezydent',przyjmie?'Ustawa podpisana':'Weto prezydenta',
      przyjmie
        ? `<p><b>${kto}</b> składa podpis pod ustawą <b>${law.n}</b>.</p>
           <p style="margin-top:10px">${law.skutek}</p>
           <div class="note" style="margin-top:12px">Relacje z Pałacem: ${Math.round(rel)}. Im lepsze, tym chętniej podpisuje.</div>`
        : `<p><b>${kto}</b> odmawia podpisu. <b>${law.n}</b> nie wchodzi w życie mimo przegłosowania w sejmie.</p>
           <div class="note" style="margin-top:12px">Relacje z Pałacem: ${Math.round(rel)}.
           Do tej ustawy wrócisz dopiero w przyszłej kadencji — chyba że wcześniej dogadasz się z prezydentem.</div>`,
      [{l:przyjmie?'Dobrze':'Trudno',f:()=>{close();render()}}]);
  }
}
function applyLaw(id,opcje){
  lawsInit();
  // ustawy z pokrętłami zapamiętują nastawy, reszcie wystarczy sam fakt uchwalenia
  G.law[id]=opcje||(lawEdytowalna(id)?Object.assign({},LAWPAR[id].baza):1);
  /* Wariant rozlicza się tu, a nie przy zgłoszeniu: przepadła ustawa nie może
     kosztować przewodniczącego ani grosza. */
  if(opcje&&opcje.wariant){
    const w=wariantPo(id,opcje.wariant);
    if(w){
      const p=me(), szef=p.lead, koszt=w.mln*1e6;
      G.kapPryw[szef]=Math.max(1000,Math.round(kapPryw(szef)-koszt));
      const msg=w.ef(p);
      say(`<b>${w.n}</b> — ${szef} wyłożył <b>${kasaSkrot(koszt)}</b> z własnej kieszeni. ${msg}`,'good');
      /* Wykład i reportaż trzeba jeszcze nagrać. Sama ustawa daje swoje,
         a nagranie dokłada od siebie tyle, ile uda się złapać. */
      if(id==='man'&&typeof document!=='undefined')
        setTimeout(()=>nagranieStart(w.n,c=>nagranieMAN(w,c)),80);
    }
  }
  /* Ordynacja rusza wyłącznie próg wyborczy. Zmiana liczby mandatów w środku
     rozgrywki przewracała cały sejm: mandaty rozdzielały się od nowa, a wszystko,
     co liczy się od stałej wielkości izby — większość, progi list, rozliczenie
     kadencji — przestawało się zgadzać z tym, co gracz miał przed oczami. */
  if(id==='ordyn'&&opcje)THR.base=cl(opcje.prog,0,8);
}
const TOTAL_SEATS_LIVE=()=>REG.reduce((a,r)=>a+r.seats,0)+TOPUP;

/* Prezydent ma trzy tygodnie na podpis albo weto. Komputer decyduje od razu, więc
   dotyczy to wyłącznie gracza w pałacu: ustawa nie może leżeć na biurku w nieskończoność,
   bo blokuje cały sejm — nikt nie złoży kolejnej, dopóki ta nie zostanie rozstrzygnięta. */
const ZWLOKA_MAX=3;
function zwlokaPrezydenta(){
  const l=G.lawPend;
  if(!l||!hasPrez())return;                    // pałac nie nasz albo nic nie czeka
  if(typeof l.odTerm!=='number')return;
  const ile=(G.term-l.odTerm)*12+(G.week-l.odWeek);
  if(ile<ZWLOKA_MAX){
    if(ile===ZWLOKA_MAX-1)
      say(`<b>Ustawa czeka na twój podpis.</b> Zostaje ostatni tydzień — potem serwer uzna, że prezydent ucieka od decyzji.`,'bad');
    return;
  }
  const p=me(), nazwa=lawById(l.id)?lawById(l.id).n:'ustawa';
  p.cred=cl(p.cred-16);p.fame=cl(p.fame-12);p.uni=cl(p.uni-14);p.ctr=cl(p.ctr+8);M(p,-18);
  G.lawPend=null;                              // sprawa umiera na biurku, ustawa nie wchodzi w życie
  say(`<b>${nazwa} umiera na biurku prezydenta.</b> Trzy tygodnie bez decyzji: wiarygodność −16, sława −12, jedność −14.`,'bad');
  modal('Pałac','Nie podjąłeś decyzji',
    `<p><b>${nazwa}</b> leżała u ciebie trzy tygodnie. Ani podpisu, ani weta — ustawa przepada,
     a serwer zapamiętał, że prezydent nie potrafił zdecydować.</p>
     <p style="margin-top:10px">Wiarygodność <b>−16</b>, sława <b>−12</b>, jedność partii <b>−14</b>,
     kontrowersja <b>+8</b>.</p>`,
    [{l:'Rozumiem',f:()=>{close();render()}}]);
}
/* Weto nie jest już ostatecznym słowem. Sejm może je odrzucić większością
   trzech piątych — tak jak w każdej normalnej procedurze. Prezydent przestaje
   być instancją, od której nie ma odwołania. */
const PROG_WETO=.6;
/* Sejm głosuje nad odrzuceniem weta. Poprzeć musi trzy piąte izby, więc udaje się
   to tylko rządom z realnym zapleczem — ale przestaje być tak, że pałac zamyka
   temat jednym podpisem. Prezydent płaci za każde weto, niezależnie od wyniku. */
function odrzucenieWeta(id,opcje,pmK,glosy){
  const law=lawById(id);
  const prezK=G.prez?G.prez.party:null;
  // weto zawsze coś kosztuje pałac: to konflikt z izbą, a nie darmowy przycisk
  if(prezK&&G.p[prezK]){
    const q=G.p[prezK];
    q.ctr=cl(q.ctr+7);q.cred=cl(q.cred-3);
    if(G.gov&&G.gov.pm&&G.rel[prezK][G.gov.pm]!==undefined){
      G.rel[prezK][G.gov.pm]=cl(G.rel[prezK][G.gov.pm]-12,-100,100);
      G.rel[G.gov.pm][prezK]=cl(G.rel[G.gov.pm][prezK]-12,-100,100);
    }
  }
  // izba głosuje tak, jak głosowała nad ustawą, ale próg jest teraz wyższy
  let za=0,przeciw=0,wstrzym=0;const by={};
  alive().forEach(k=>{
    const s=G.p[k].seats;if(!s)return;
    const poprzednio=(glosy&&glosy.by)?glosy.by[k]:null;
    // kto był za ustawą, ten broni jej dalej; reszta rzadko zmienia zdanie
    const chce=poprzednio==='za'?.92:poprzednio==='wstrzymał się'?.35:.12;
    if(ch(chce)){za+=s;by[k]='za'}
    else if(ch(.2)){wstrzym+=s;by[k]='wstrzymał się'}
    else{przeciw+=s;by[k]='przeciw'}
  });
  const potrzeba=Math.ceil(TOTAL_SEATS*PROG_WETO);
  const udalo=za>=potrzeba;
  const w={za,przeciw,wstrzym,by,potrzeba,rad:0,ok:udalo};
  if(udalo){
    G.lawTerm[id]=1;
    applyLaw(id,opcje);
    if(!G.lawBy)G.lawBy={};
    if(pmK)G.lawBy[id]=pmK;
    if(G.gov)G.gov.spraw=cl((G.gov.spraw||50)+7);
    if(prezK&&G.p[prezK]){G.p[prezK].fame=cl(G.p[prezK].fame-6);M(G.p[prezK],-12)}
    say(`<b>Sejm odrzucił weto</b> ${za}:${przeciw}. ${law.n} wchodzi w życie mimo prezydenta.`,'good');
  }else{
    G.lawTerm[id]=1;
    if(G.gov)G.gov.spraw=cl((G.gov.spraw||50)-8);
    say(`<b>Weto utrzymane</b> ${za}:${przeciw} przy progu ${potrzeba}. ${law.n} nie wchodzi w życie.`,'bad');
  }
  if(me().seats>0||pmK===G.me)
    modal('Sejm',udalo?'Weto odrzucone':'Weto utrzymane',
      `<p>Prezydent zawetował <b>${law.n}</b>, więc sejm głosował nad odrzuceniem weta.
       Potrzeba było <b>${potrzeba}</b> z ${TOTAL_SEATS} głosów, czyli trzech piątych izby.</p>
       <p style="margin-top:8px">Za <b>${za}</b>, przeciw <b>${przeciw}</b>, wstrzymało się <b>${wstrzym}</b>.</p>
       ${panelGlosowania(w)}
       <p style="margin-top:12px">${udalo
         ? 'Ustawa wchodzi w życie ponad głową pałacu. Prezydent traci na tym twarz.'
         : 'Weto zostaje w mocy. Ustawa przepada na tę kadencję.'}</p>`,
      [{l:'Rozumiem',f:()=>{close();render()}}]);
  render();
}
function signLaw(ok,cicho){
  if(!G.lawPend)return;
  const {id,opcje}=G.lawPend, law=lawById(id);
  const pmK=G.lawPend.przez||(G.gov?G.gov.pm:null);
  const glosyPrzed=G.lawPend;
  G.lawPend=null;
  if(!ok){odrzucenieWeta(id,opcje,pmK,glosyPrzed);return}
  if(ok){
    applyLaw(id,opcje);
    if(pmK===G.me)G.bezUstaw=0;      // licznik bezczynności zerujemy przy każdej swojej ustawie
    // kto ustawę przepchnął, ten czerpie z niej najwięcej do końca rozgrywki
    if(!G.lawBy)G.lawBy={};
    if(pmK)G.lawBy[id]=pmK;
    /* Ustawa wchodzi w życie za rządu, więc to rząd zbiera pochwały. Jeśli wniósł
       ją ktoś spoza gabinetu, premier i tak wychodzi na tego, który „dowiózł” —
       autor dostaje mniej niż ten, kto siedzi na fotelu. */
    const szefRzadu=G.gov&&G.pmOk?G.gov.pm:null;
    if(szefRzadu&&szefRzadu!==pmK&&G.p[szefRzadu]){
      const s=G.p[szefRzadu];
      s.fame=cl(s.fame+3);s.act=cl(s.act+1.5);M(s,4);
      if(G.gov)G.gov.spraw=cl((G.gov.spraw||50)+4);
      if(szefRzadu===G.me)
        say(`<b>To twój rząd wprowadza ${law.n} w życie.</b> Ustawę wniósł kto inny, ale zasługę serwer zapisze tobie.`,'good');
      else if(pmK===G.me)
        say(`<b>${law.n} wchodzi w życie</b>, ale to premier ${G.p[szefRzadu].ab} zbiera z tego najwięcej. Tak działa rząd: wnosisz z ławy, chwali się gabinet.`,'bad');
    }
    if(pmK&&G.p[pmK]){
      const q=G.p[pmK];
      const wRzadzie=!!(G.gov&&G.gov.parties.includes(pmK));
      // spoza koalicji ustawa daje autorowi wyraźnie mniej — nie masz z czego jej wyegzekwować
      const mnoznik=wRzadzie?1:.45;
      q.comp.ser++;q.mem++;q.act=cl(q.act+1*mnoznik);q.fame=cl(q.fame+2*mnoznik);
      if(id==='kodeks')q.ctr=cl(q.ctr-4);
      if(id==='mordepedia')q.fame=cl(q.fame+10);
      if(id==='man'){   // dwóch intelektualistów awansuje do elity
        const ile=Math.min(2,q.comp.int);
        if(ile){q.comp.int-=ile;q.comp.eli+=ile}
      }
    }
    if(!hasPrez()&&pmK===G.me)M(me(),4);
    if(hasPrez()&&pmK&&pmK!==G.me){
      G.rel[G.me][pmK]=cl(G.rel[G.me][pmK]+8,-100,100);
      G.rel[pmK][G.me]=cl(G.rel[pmK][G.me]+8,-100,100);
    }
    if(!cicho||hasPrez())say(`<b>${law.n} podpisana.</b> ${law.skutek}`,'roy');
    else say(`<b>${law.n} wchodzi w życie.</b> ${law.skutek}`,'roy');
    XP(14);
  }else{
    if(hasPrez()){
      me().ctr=cl(me().ctr+2);
      if(pmK&&pmK!==G.me){
        G.rel[G.me][pmK]=cl(G.rel[G.me][pmK]-14,-100,100);
        G.rel[pmK][G.me]=cl(G.rel[pmK][G.me]-14,-100,100);
      }
      say(`<b>Weto prezydenta.</b> ${law.n} nie wchodzi w życie. Kontrowersja +2, relacje z premierem w dół.`,'bad');
    }else{
      say(`<b>${law.n} zawetowana.</b> Prezydent nie złożył podpisu.`,'bad');
    }
  }
  render();
}
/* Dodatkowi ludzie z ustaw, doliczani przy rozliczeniu kadencji.
   Każda kolejna ustawa dokłada wyraźnie mniej niż poprzednia — bez tego komplet
   dawałby trzynaście osób na kadencję, czyli trzy razy więcej niż całe granie. */
function lawIntake(k){
  if(!G||!G.p[k]||G.p[k].dead)return null;
  lawsInit();
  const d={eli:0,int:0,ser:0};
  if(G.law.zagadki)d.ser+=2;
  if(G.law.cytaty)d.ser+=2;
  if(G.law.media){d.ser+=2;d.int+=1}
  if(G.law.kodeks){d.ser+=2;d.int+=1}
  if(G.law.konst){d.eli+=1;d.int+=2}
  if(G.law.mordepedia)d.int+=1;
  if(G.law.man)d.eli+=1;
  const suma=d.eli+d.int+d.ser;
  if(!suma)return null;
  /* Ustawa działa na cały serwer, więc ludzie dochodzą każdej partii — ale owoce
     zbiera przede wszystkim ten, kto ją przepchnął. Dlatego oddanie fotela premiera
     komuś innemu naprawdę boli, a podpisywanie cudzych ustaw trzeba przemyśleć. */
  const moje=Object.keys(G.lawBy||{}).filter(id=>G.lawBy[id]===k&&G.law[id]).length;
  const premier=!!(G.gov&&G.pmOk&&G.gov.pm===k);
  const wagaAutora=moje?1+moje*.55:0;               // im więcej własnych ustaw, tym większy udział
  const mnoznik=premier?BAL.ustawyPremier:wagaAutora?Math.min(2.0,.8+wagaAutora*BAL.ustawyAutor):BAL.ustawyReszta;
  const limit=Math.max(premier||moje?2:1,Math.round(mnoznik*Math.sqrt(suma)));
  if(suma<=limit)return d;
  const f=limit/suma;
  const out={eli:Math.round(d.eli*f),int:Math.round(d.int*f),ser:Math.round(d.ser*f)};
  if(!(out.eli+out.int+out.ser))out.ser=1;                   // zaokrąglenie nie może zjeść wszystkiego
  return out;
}

/* Które partie republikańskie zechcą wejść pod wspólny sztandar. */
function repChetni(){
  if(!G)return [];
  return ['PPP','PLR','PKD','DPD'].filter(k=>k!==G.me&&G.p[k]&&!G.p[k].dead&&G.rel[k][G.me]>=55);
}
/* ---- cele partyjne ---- */
/* Wynik twojej partii w ostatnich wyborach. Zanim padły pierwsze, nie ma czego
   czytać — zwracamy null, żeby warunek pokazał to wprost zamiast udawać zero. */
function ostatniWynik(){
  if(!G||!G.hist||!G.hist.length)return null;
  const h=G.hist[G.hist.length-1];
  return typeof h.pct==='number'?h.pct:null;
}
const hasAds=k=>!!(G&&G.p[k]&&G.p[k].adsMode);
const hasHor=k=>!!(G&&G.p[k]&&G.p[k].horMode);
const hasLib=k=>!!(G&&G.p[k]&&G.p[k].libMode);
const hasLib2=k=>!!(G&&G.p[k]&&G.p[k].lib2Mode);
const hasPost=k=>!!(G&&G.p[k]&&G.p[k].postMode);
const hasLsd=k=>!!(G&&G.p[k]&&G.p[k].lsdMode);
const hasKan=k=>!!(G&&G.p[k]&&G.p[k].kanMode);
const hasRob=k=>!!(G&&G.p[k]&&G.p[k].robMode);
const hasPer=k=>!!(G&&G.p[k]&&G.p[k].perMode);
const hasCen=k=>!!(G&&G.p[k]&&G.p[k].cenMode);
const hasHeg=k=>!!(G&&G.p[k]&&G.p[k].hegMode);
function apBase(){
  return Math.max(1, 3+(isPM()?1:0)+(hasPrez()?1:0)+(hasAds(G.me)?2:0)+(hasHeg(G.me)?1:0)-(hasHor(G.me)?1:0));
}
function applyGoals(){
  if(!G)return;
  if(!G.goals)G.goals={};
  if(G.goals.republika){const p=G.p[G.me];if(p.fame<70)p.fame=70}
  if(hasLib2(G.me)){const p=G.p[G.me];if(p.fame<50)p.fame=50}
  // Centrum stoi jednością, hegemon sławą — obie podłogi są celowo niższe
  // niż przy republice, żeby te cele nie robiły z partii pomnika.
  // podłoga jedności trzyma Centrum przy życiu, ale nie wygrywa mu już wyborów
  if(hasCen(G.me)){const p=G.p[G.me];if(p.uni<30)p.uni=30}
  if(hasHeg(G.me)){const p=G.p[G.me];if(p.fame<58)p.fame=58}   // podloga slawy nizej: hegemon ma byc mocny, nie nietykalny
}
function goalDrift(k){
  const p=G.p[k];
  // sądy administracyjne: awantury rozstrzyga się formalnie, więc emocje szybciej siadają
  if(G.law&&G.law.sady)p.ctr=cl(p.ctr-1.1);
  // kodeks karny: za ostre teksty są konsekwencje, cała scena pilnuje się bardziej
  if(G.law&&G.law.kodeks)p.ctr=cl(p.ctr-.7);
  if(p.adsMode){p.uni=cl(p.uni-2.6);p.fame=cl(p.fame+2.8);p.act=cl(p.act+1.2);p.ctr=cl(p.ctr+1.1)}
  /* Cele partyjne przestają być maszynką do jedności. Darmowa zgoda w partii
     działała jak trwały bonus do wyniku niezależnie od tego, co gracz robił;
     teraz każdy cel daje jej wyraźnie mniej, a w zamian mocniej wspiera to,
     co widać na serwerze — aktywność, wiarygodność i obecność. */
  if(p.horMode){p.act=cl(p.act+4.1);p.uni=cl(p.uni+1.3);p.cred=cl(p.cred+.9)}
  if(p.lib2Mode)p.uni=cl(p.uni-1.6);
  if(p.postMode)p.act=cl(p.act+3.2);
  if(p.robMode){p.uni=cl(p.uni+1.0);p.act=cl(p.act+1.1);p.ctr=cl(p.ctr+1.2)}
  if(p.rom12Mode){p.uni=cl(p.uni+1.2);p.cred=cl(p.cred+.7);p.ctr=cl(p.ctr-1)}
  // Świadek Koronny: sama reputacja, żadnej dźwigni
  if(p.swiaMode){p.ctr=cl(p.ctr-.8);if(p.cred<62)p.cred=62}
  // Centrum stoi spokojem i wiarygodnością, a nie samą jednością
  if(p.cenMode){p.uni=cl(p.uni+.45);p.cred=cl(p.cred+1.3);p.ctr=cl(p.ctr-1.1);p.pret=cl(p.pret-.8);p.act=cl(p.act+1.0)}
  // Hegemon rośnie, ale sam swoim rozmiarem drażni resztę sceny
  if(p.hegMode){p.fame=cl(p.fame+2.2);p.act=cl(p.act+1.4);
    alive().forEach(x=>{if(x!==k&&G.rel[x])G.rel[x][k]=cl(G.rel[x][k]-.7,-100,100)})}
  if(p.perMode){p.cred=cl(Math.max(55,p.cred+1.4));p.ctr=cl(p.ctr+.8);
    alive().forEach(x=>{if(x!==k&&G.rel[k])G.rel[k][x]=cl(G.rel[k][x]+1,-100,100)})}
}
const GOALS={
 /* DPD nie skacze prosto do Republikańskiej — najpierw musi przejść przez Centrum.
    Dwie drogi z jednej partii (Kazikmistrz i Centrum) mają być wyborem, a nie
    skrótem do najsilniejszego celu w grze. */
 republika:{n:'Pod błyskiem niebieskiej chwały',for:['PPP','PLR','PKD','NBR','DPD'],logo:'REP',bots:0,
  /* Ten warunek odsiewał wyłącznie DPD, więc cel otwierał się każdemu — łącznie
     z monarchistami i socjaldemokratami, którzy nie mają z republiką nic wspólnego.
     Liczy się przynależność do obozu republikańskiego i nic poza nią. */
  avail:()=>GOALS.republika.for.includes(G.me),
  what:'Odtwarzasz Partię Republikańską. Stare barwy, stare gwiazdy, twój szyld, a pozostałe partie z tym samym celem wchłaniasz razem z ludźmi i mandatami.',
  req:[
   {t:'Przychylność Króla co najmniej 50',v:()=>Math.round(kingFav(G.me))+' / 50',ok:()=>kingFav(G.me)>=50},
   {t:'Co najmniej 150 osób w partii',v:()=>me().mem+' / 150',ok:()=>me().mem>=150},
   {t:'Kaziu, Europejczyk, Eniki, Ponczus i Tako w partii',
    v:()=>{const o=roster(me());return ['Kaziu','Europejczyk','Eniki','Ponczus','Tako'].filter(n=>o.includes(n)).length+' / 5'},
    ok:()=>{const o=roster(me());return ['Kaziu','Europejczyk','Eniki','Ponczus','Tako'].every(n=>o.includes(n))}},
   {t:'Twoja partia ma obecnie premiera albo prezydenta',v:()=>isPM()?'premier':hasPrez()?'prezydent':'brak',ok:()=>isPM()||hasPrez()},
   {t:'Aktywność partii co najmniej 50',v:()=>Math.round(me().act)+' / 50',ok:()=>me().act>=50},
   {t:'Co najmniej 5 elit w składzie',v:()=>me().comp.eli+' / 5',ok:()=>me().comp.eli>=5},
   {t:'Zgoda przynajmniej jednej partii republikańskiej (relacja +55)',
    v:()=>{const ch2=repChetni();return ch2.length?ch2.map(k=>G.p[k].ab).join(', '):'żadna'},
    ok:()=>repChetni().length>=1},
  ],
  cons:['Pod sztandar wchodzą tylko te partie republikańskie, które same tego chcą: relacja co najmniej +55.',
   'Niechętne zostają na scenie, ale tracą część ludzi i mocno psują z tobą relacje.',
   'Łatwiejsza dyplomacja: partie wchodzą z tobą w koalicje przy relacji o 12 niższej.',
   'Sława nigdy nie spada poniżej 70.',
   'Każda decyzja dostaje boost: efekty ×1,15.'],
  run(){const p=me();p.n='Partia Republikańska';p.ab='PR';p.c='#1e63d0';p.logo='REP';p.repMode=1;
   p.fame=Math.max(p.fame,70);M(p,16);
   /* Zjednoczenie zamiast połknięcia. Wcześniej cel kasował cztery partie naraz
      i praktycznie kończył rozgrywkę. Teraz przyłączają się tylko te, które
      naprawdę chcą — resztę trzeba sobie zjednać wcześniej albo zostawić w spokoju. */
   const chetni=repChetni(), oporni=GOALS.republika.for.filter(k=>k!==G.me&&G.p[k]&&!G.p[k].dead&&!chetni.includes(k));
   let os=0,mn=0;
   chetni.forEach(k=>{const q=G.p[k];
     os+=q.mem;mn+=q.seats;
     p.comp.eli+=q.comp.eli;p.comp.int+=q.comp.int;p.comp.ser+=q.comp.ser;p.mem+=q.mem;
     p.seats+=q.seats;
     q.bench.forEach(n=>{if(!p.bench.includes(n)&&p.bench.length<12)p.bench.push(n)});
     if(!p.bench.includes(q.lead)&&p.bench.length<12)p.bench.push(q.lead);
     q.dead=1;q.mem=0;q.comp={eli:0,int:0,ser:0};q.seats=0;q.bench=[];
     if(G.gov&&G.gov.parties.includes(k))govLeave(k);
   });
   // kto się nie przyłączył, odchorowuje rozłam, ale zostaje w grze i pamięta
   oporni.forEach(k=>{const q=G.p[k];
     const zabrane=giveBackCap(q,Math.max(1,Math.round(q.mem*.18)));
     const ile=zabrane.eli+zabrane.int+zabrane.ser;
     q.uni=cl(q.uni-10);q.fame=cl(q.fame-6);
     G.rel[G.me][k]=cl(G.rel[G.me][k]-30,-100,100);G.rel[k][G.me]=cl(G.rel[k][G.me]-30,-100,100);
     if(ile){p.comp.ser+=ile;p.mem+=ile}
   });
   if(chetni.length)say(`<b>Zjednoczenie.</b> ${chetni.map(k=>G.p[k].ab).join(', ')} ${pl(chetni.length,'wchodzi','wchodzą','wchodzą')} pod niebieski sztandar: ${os} ${pl(os,'osoba','osoby','osób')} i ${mn} ${pl(mn,'mandat','mandaty','mandatów')}.`,'roy');
   if(oporni.length)say(`<b>${oporni.map(k=>G.p[k].ab).join(', ')} ${pl(oporni.length,'odmawia','odmawiają','odmawiają')}.</b> Zostają na scenie, tracą po kilku ludzi i zapamiętują ci to na długo.`,'bad');
   graj('dyktator');
   say('<b>Pod błyskiem niebieskiej chwały.</b> Partia Republikańska wraca na serwer, a prowadzisz ją ty.','roy')}},
 /* Wynik ostatnich wyborów. Przed pierwszymi nie ma czego czytać, więc cele
    z takim warunkiem po prostu jeszcze nie są spełnione. */
 centrum:{n:'Ani w lewo, ani w prawo',for:['DPD'],logo:'CEN',bots:0,
  what:'Przestajesz się tłumaczyć jednym i drugim skrzydłem. Tako, Kaziu i balon pod jednym szyldem, a serwer dostaje partię, która nie obiecuje rewolucji — tylko że będzie.',
  req:[
   {t:'Co najmniej 15 osób w partii',v:()=>me().mem+' / 15',ok:()=>me().mem>=15},
   // Tako siedzi wśród bezpartyjnych — trzeba go najpierw ściągnąć decyzją „Werbunek”
   {t:'Tako, Kaziu i balon w partii',
    v:()=>{const o=roster(me());return ['Tako','Kaziu','balon'].filter(n=>o.includes(n)).length+' / 3'},
    ok:()=>{const o=roster(me());return ['Tako','Kaziu','balon'].every(n=>o.includes(n))}},
   {t:'Co najmniej 10% w ostatnich wyborach',
    v:()=>ostatniWynik()===null?'jeszcze nie było wyborów':fmt(ostatniWynik())+'% / 10%',
    ok:()=>(ostatniWynik()||0)>=10},
   {t:'Dopiero od trzeciej kadencji',v:()=>'kadencja '+G.term+' / 3+',ok:()=>G.term>=3},
  ],
  cons:['Partia występuje odtąd jako Partia Centrum.',
   'Wiarygodność rośnie o 1,3 tygodniowo, aktywność o 1,0, a kontrowersja i pretensjonalność powoli schodzą.',
   'Jedność rośnie o 0,45 tygodniowo i nie spada poniżej 30 — tyle, żeby partia się trzymała, za mało, żeby wygrywać samą zgodą.',
   'Dyplomacja łatwiejsza: koalicjanci schodzą z wymaganiami o 8.',
   'Na koniec kadencji dochodzi trochę więcej ludzi — środek przyciąga niezdecydowanych.',
   'Droga do Partii Republikańskiej pozostaje otwarta.'],
  run(){const p=me();p.n='Partia Centrum';p.ab='PC';p.c='#1f7f86';p.logo='CEN';p.cenMode=1;
   p.uni=cl(p.uni+7);p.cred=cl(p.cred+8);p.pret=cl(p.pret-8);p.act=cl(p.act+5);M(p,10);
   say('<b>Ani w lewo, ani w prawo.</b> Partia Centrum wchodzi na scenę i po raz pierwszy od dawna nikt nie wie, na kogo się obrazić.','roy')}},
 hegemon:{n:'Hegemon Perspektywiczny',for:['NP'],logo:'HEG',bots:0,
  what:'Nowa Perspektywa przestaje być jedną z partii i staje się punktem odniesienia dla całego serwera. Jugen, Prewencjusz i kisielek48 w jednym składzie, urząd w ręku i kasa w skarbcu.',
  req:[
   {t:'Co najmniej 50 osób w partii',v:()=>me().mem+' / 50',ok:()=>me().mem>=50},
   {t:'Twoja partia ma obecnie premiera albo prezydenta',v:()=>isPM()?'premier':hasPrez()?'prezydent':'brak',ok:()=>isPM()||hasPrez()},
   {t:'Powyżej 25% w ostatnich wyborach',
    v:()=>ostatniWynik()===null?'jeszcze nie było wyborów':fmt(ostatniWynik())+'% / >25%',
    ok:()=>(ostatniWynik()||0)>25},
   {t:'Dopiero od piątej kadencji',v:()=>'kadencja '+G.term+' / 5+',ok:()=>G.term>=5},
   {t:'Jugen, Prewencjusz i kisielek48 w partii',
    v:()=>{const o=roster(me());return ['Jugen','Prewencjusz','kisielek48'].filter(n=>o.includes(n)).length+' / 3'},
    ok:()=>{const o=roster(me());return ['Jugen','Prewencjusz','kisielek48'].every(n=>o.includes(n))}},
   {t:'Ponad 500 kapitału w kasie',v:()=>Math.round(G.kp)+' / >500',ok:()=>G.kp>500},
  ],
  cons:['Partia występuje odtąd jako Hegemonia Perspektywiczna.',
   'Sława rośnie o 2,2 tygodniowo i nigdy nie spada poniżej 65.',
   'Jedna dodatkowa akcja w każdym tygodniu.',
   'Składki wyższe o 45% — skarbiec pracuje na ciebie.',
   'Ale hegemona nikt nie lubi: wszystkie partie tracą do ciebie 15 relacji od ręki i po 0,7 tygodniowo.',
   'Zmęczenie serwera władzą narasta o jedną czwartą szybciej.'],
  run(){const p=me();p.n='Hegemonia Perspektywiczna';p.ab='HP';p.c='#c8952b';p.logo='HEG';p.hegMode=1;
   p.fame=Math.max(p.fame,65);p.uni=cl(p.uni+10);p.cred=cl(p.cred+8);M(p,20);
   alive().forEach(k=>{if(k===G.me)return;
     G.rel[G.me][k]=cl(G.rel[G.me][k]-15,-100,100);G.rel[k][G.me]=cl(G.rel[k][G.me]-15,-100,100)});
   G.apMax=apBase();G.ap=Math.max(G.ap,1);
   say('<b>Hegemon Perspektywiczny.</b> Nowa Perspektywa przestaje być partią, a zaczyna być pogodą na serwerze. Reszta sceny właśnie zrozumiała, że gra o drugie miejsce.','roy')}},
 demokraci:{n:'Oryginał zawsze będzie lepszy',for:['FD'],logo:'PD',bots:0,
  what:'Przywracasz Partię Demokratyczną. Front kończy udawanie, że jest czymś nowym.',
  req:[
   {t:'Przychylność Króla powyżej 0',v:()=>Math.round(kingFav(G.me))+' / >0',ok:()=>kingFav(G.me)>0},
   {t:'Min. 2 elity i 10 intelektualistów w składzie',v:()=>me().comp.eli+' elity · '+me().comp.int+' int.',ok:()=>me().comp.eli>=2&&me().comp.int>=10},
   {t:'Dopiero po pierwszej kadencji',v:()=>'kadencja '+G.term+' / 2+',ok:()=>G.term>=2},
  ],
  cons:['loof traci „Zawsze ma rację i zawsze to powie” i dostaje „Memento potęgi demokratów”: +12 do dyplomacji koalicyjnej i ×1,25 do decyzji kampanii (tylko kampanii).',
   'Wraca elitarny Plawik: +1 do elity, dopisuje się do partii.',
   'Za nim przychodzi ke_Trab: +1 do intelektualistów, też do partii.',
   'Front występuje odtąd jako Partia Demokratyczna.'],
  run(){const p=me();p.n='Partia Demokratyczna';p.ab='PD';p.c='#7aa842';p.logo='PD';p.demMode=1;
   p.comp.eli+=1;p.mem+=1;if(!p.bench.includes('Plawik'))p.bench.push('Plawik');
   p.comp.int+=1;p.mem+=1;if(!p.bench.includes('ke_Trab'))p.bench.push('ke_Trab');
   M(p,14);
   say('<b>Oryginał zawsze będzie lepszy.</b> Partia Demokratyczna wraca, a z nią Plawik i ke_Trab. loof odkłada rację na półkę i sięga po pamięć.','roy')}},
 ads:{n:'Alternatywa dla nowości',for:['DPD','FD','PLR'],logo:'ADS',bots:1,
  avail:()=>['DPD','FD','PLR'].includes(G.me)&&!hasLib(G.me)&&!hasPost(G.me),
  what:'Zbierasz pod jednym szyldem wszystkich, którzy mają dość nowinek, i robisz z tego maszynę do zbierania kapitału. Loof, Tortex i Kaziu w jednym składzie, jeden z nich na czele.',
  req:[
   {t:'Co najmniej 30 osób w partii',v:()=>me().mem+' / 30',ok:()=>me().mem>=30},
   {t:'loof, Tortex, Kaziu i Tako w składzie partii',v:()=>{const o=ownPool(G.me);return ['loof','Tortex','Kaziu','Tako'].filter(n=>o.includes(n)).length+' / 4'},
    ok:()=>{const o=ownPool(G.me);return ['loof','Tortex','Kaziu','Tako'].every(n=>o.includes(n))}},
   {t:'Jeden z nich przewodzi partii',v:()=>me().lead,ok:()=>['loof','Tortex','Kaziu'].includes(me().lead)},
  ],
  cons:['Jedność leci na pysk i dalej spada co tydzień, ale sława rośnie równie szybko.',
   'Dyplomacja w błoto: koalicjanci chcą o 25 wyższej relacji, a wszystkie relacje spadają o 20 od ręki.',
   'Kapitał: składki rosną ponad dwuipółkrotnie, każdy członek zaczyna się realnie opłacać.',
   'Dwie dodatkowe akcje w każdym tygodniu.'],
  run(){const p=me();adsBecome(G.me);
   alive().forEach(k=>{if(k===G.me)return;G.rel[G.me][k]=cl(G.rel[G.me][k]-20,-100,100);G.rel[k][G.me]=cl(G.rel[k][G.me]-20,-100,100)});
   G.apMax=apBase();G.ap=Math.max(G.ap,1);
   say('<b>Alternatywa dla nowości.</b> Nowy szyld, stare pretensje i kasa płynąca strumieniem. Rozmawiać z tobą nikt już nie chce.','roy')}},
 liberal:{n:'Ku liberalizmu, partio!',for:['NBR','PLR','PKD'],logo:'LIB',bots:1,
  avail:()=>['NBR','PLR','PKD'].includes(G.me)&&!hasPost(G.me),
  what:'Zbierasz wokół siebie wszystkich, którym nie po drodze ani z monarchistami, ani z memiarzami, i wywieszasz żółtą różę. Aryati robi hałas, Pan Hod_Dog dogaduje resztę.',
  req:[
   {t:'Co najmniej 30 osób w partii',v:()=>me().mem+' / 30',ok:()=>me().mem>=30},
   {t:'Aryati w składzie partii',v:()=>ownPool(G.me).includes('Aryati')?'jest':'brak',ok:()=>ownPool(G.me).includes('Aryati')},
   {t:'Pan Hod_Dog w partii',v:()=>roster(me()).includes('Pan Hod_Dog')?'jest':'brak',ok:()=>roster(me()).includes('Pan Hod_Dog')},
  ],
  cons:['Partia występuje odtąd jako Partia Liberalna, z żółtą różą w herbie.',
   'Pretensjonalność spada o 18, sława rośnie o 12, wiarygodność o 8.',
   'Dyplomacja łatwiejsza: koalicjanci schodzą z wymaganiami o 10.',
   'Otwiera się kolejny cel: „Jeszcze nie kończymy z liberalizmem!”.',
   'Partia Liberalna nadal może odtworzyć Partię Republikańską.'],
  run(){libBecome(G.me);
   say('<b>Ku liberalizmu, partio!</b> Żółta róża idzie w górę, a serwer po raz pierwszy od dawna słyszy słowo „program” bez ironii.','roy')}},
 liberal2:{n:'Jeszcze nie kończymy z liberalizmem!',for:[],logo:'ALT',bots:0,
  avail:()=>!!(G.p[G.me]&&G.p[G.me].libMode),
  what:'Róża to za mało. Zjednoczasz pod jednym szyldem całe liberalne skrzydło serwera i wchłaniasz to, co z niego zostało.',
  req:[
   {t:'Co najmniej 50 osób w partii',v:()=>me().mem+' / 50',ok:()=>me().mem>=50},
   {t:()=>'Relacja z '+(G.me==='PKD'?'NBR':'PKD')+' co najmniej +30',
    v:()=>{const o=G.me==='PKD'?'NBR':'PKD';return Math.round(G.rel[G.me][o])+' / 30'},
    gone:()=>{const o=G.me==='PKD'?'NBR':'PKD';return !G.p[o]||G.p[o].dead},
    ok:()=>{const o=G.me==='PKD'?'NBR':'PKD';return !!G.p[o]&&!G.p[o].dead&&G.rel[G.me][o]>=30}},
   {t:'Sława co najmniej 80',v:()=>Math.round(me().fame)+' / 80',ok:()=>me().fame>=80},
  ],
  cons:['NBR, PKD i każda inna Partia Liberalna zostają wchłonięte razem z ludźmi i mandatami.',
   'Napływ ludzi na koniec każdej kadencji jest wyraźnie większy.',
   'Sława nigdy nie spada poniżej 50.',
   'Dyplomacja: koalicjanci schodzą z wymaganiami o 18.',
   'Jedność spada o 1,6 tygodniowo, tak duże skrzydło zawsze się trochę kłóci.',
   'Droga do Partii Republikańskiej pozostaje otwarta.'],
  run(){const p=me();
   p.n='Alternatywa Liberalna';p.ab='AL';p.c='#c0392b';p.logo='ALT';p.lib2Mode=1;
   p.fame=Math.max(p.fame,50);M(p,14);
   const cel=alive().filter(k=>k!==G.me&&(['NBR','PKD'].includes(k)||G.p[k].libMode));
   let os=0,mn=0;
   cel.forEach(k=>{const q=G.p[k];
     os+=q.mem;mn+=q.seats;
     p.comp.eli+=q.comp.eli;p.comp.int+=q.comp.int;p.comp.ser+=q.comp.ser;p.mem+=q.mem;p.seats+=q.seats;
     q.bench.concat([q.lead]).forEach(n=>{if(!p.bench.includes(n)&&p.bench.length<12)p.bench.push(n)});
     q.dead=1;q.mem=0;q.comp={eli:0,int:0,ser:0};q.seats=0;q.bench=[];
     if(G.gov&&G.gov.parties.includes(k))govLeave(k);
   });
   if(cel.length)say(`<b>Unifikacja.</b> ${cel.map(k=>G.p[k].ab).join(', ')} znikają z listy partii: ${os} ${pl(os,'osoba','osoby','osób')} i ${mn} ${pl(mn,'mandat','mandaty','mandatów')} przechodzą do ciebie.`,'roy');
   say('<b>Jeszcze nie kończymy z liberalizmem!</b> Alternatywa Liberalna wchodzi do gry jako jedno wielkie, kłótliwe skrzydło.','roy')}},
 /* Kazikmistrz: jedyny cel, który niczego nie przemianowuje i nie zmienia herbu.
    Zmienia jedną osobę — z chodzącej katastrofy w kogoś, z kim wszyscy chcą rozmawiać.
    Dlatego nagroda jest wąska: dotyczy Kazia, a nie całej partii. */
 /* Świadek Koronny — cel globalny, dostępny każdemu i najtrudniejszy w grze.
    Nagroda jest celowo skromna: to ma być coś, czym się chwalisz, a nie coś,
    czym wygrywasz. Trzeba przetrwać cztery kadencje poza rządem, zachować
    czyste konto i mimo wszystko liczyć się w sejmie. */
 swiadek:{n:'Świadek Koronny',for:[],logo:'SWIA',bots:0,
  what:'Cztery kadencje z rzędu poza rządem, bez jednej brudnej zagrywki i wciąż w grze. Nikt ci nic nie zawdzięcza i nikt nie ma na ciebie haka. Na tym serwerze to rzadsze niż wygrane wybory.',
  req:[
   {t:'Co najmniej piąta kadencja',v:()=>'kadencja '+G.term+' / 5+',ok:()=>G.term>=5},
   {t:'Cztery kadencje z rzędu poza rządem',
    v:()=>{const h=G.hist||[];const ile=h.slice(-4).filter(x=>x.pm!==G.me).length;
      return Math.min(4,ile)+' / 4'},
    ok:()=>{const h=G.hist||[];return h.length>=4&&h.slice(-4).every(x=>x.pm!==G.me)}},
   {t:'Kontrowersja poniżej 25',v:()=>Math.round(me().ctr)+' / <25',ok:()=>me().ctr<25},
   {t:'Wiarygodność co najmniej 75',v:()=>Math.round(me().cred)+' / 75',ok:()=>me().cred>=75},
   {t:'Co najmniej 8 mandatów mimo wszystko',v:()=>me().seats+' / 8',ok:()=>me().seats>=8},
  ],
  cons:['Tytuł Świadka Koronnego zostaje przy partii do końca rozgrywki.',
   'Wiarygodność nie spada poniżej 62 — reputacji zbudowanej przez cztery kadencje nie da się stracić z tygodnia na tydzień.',
   'Kontrowersja schodzi o 0,8 tygodniowo. Nic poza tym.',
   'Żadnych premii do sondażu, mandatów ani kapitału. To jest odznaczenie, nie dźwignia.'],
  run(){const p=me();
   p.swiaMode=1;p.cred=cl(p.cred+6);
   say('<b>Świadek Koronny.</b> Cztery kadencje w opozycji, czyste konto i mandaty, których nikt ci nie dał w prezencie. Serwer to odnotował.','roy')}},
 kazik:{n:'Kazikmistrz',for:['DPD'],logo:'KAZIK',bots:0,
  what:'Kaziu bierze partię, wygrywa wybory i nagle okazuje się, że przez te wszystkie lata wszyscy się mylili. Nie zmienia się szyld ani herb — zmienia się on.',
  req:[
   {t:'Kaziu przewodzi partii',v:()=>isLead(me(),'Kaziu')?'przewodzi':me().lead,ok:()=>isLead(me(),'Kaziu')},
   {t:'Co najmniej 20% w ostatnich wyborach',
    v:()=>ostatniWynik()===null?'jeszcze nie było wyborów':fmt(ostatniWynik())+'% / 20%',
    ok:()=>(ostatniWynik()||0)>=20},
   {t:'Co najmniej 250 kapitału w kasie',v:()=>Math.round(G.kp)+' / 250',ok:()=>G.kp>=250},
  ],
  cons:['Kaziu traci cechę „Ktoś to musiał wziąć” i dostaje „Stare dobre lata”.',
   'Wraca jego stary awatar — ten, po którym wszyscy go pamiętają.',
   'Zamiast tracić, partia zyskuje: wiarygodność +1,6 i jedność +1,4 tygodniowo.',
   'Koalicjanci schodzą z wymaganiami o 14 zamiast żądać o 16 więcej — różnica trzydziestu punktów w każdej rozmowie.',
   'Nazwa, herb i barwy partii zostają bez zmian. To nie przemiana partii, tylko jednego człowieka.'],
  run(){const p=me();
   p.cred=cl(p.cred+10);p.uni=cl(p.uni+8);M(p,14);
   say('<b>Kazikmistrz.</b> Kaziu wygrywa wybory i z dnia na dzień przestaje być tym, o którym mówiło się „ktoś to musiał wziąć”.','roy')}},
 lsd:{n:'Miara nader postępu',for:[],logo:'LSD',bots:0,
  avail:()=>hasPost(G.me),
  what:'Postępowcy przestają być partią, a stają się aparatem: własna szkoła kadr, własna kasa i orędzia, których serwer nie umie zignorować.',
  req:[
   {t:'Co najmniej 50 osób w partii',v:()=>me().mem+' / 50',ok:()=>me().mem>=50},
   {t:'Aryati, Kaziu i Mnem w partii',v:()=>{const o=roster(me());return ['Aryati','Kaziu','Mnem'].filter(n=>o.includes(n)).length+' / 3'},
    ok:()=>{const o=roster(me());return ['Aryati','Kaziu','Mnem'].every(n=>o.includes(n))}},
   {t:'Twoja partia ma premiera',v:()=>isPM()?'premier':'brak',ok:()=>isPM()},
  ],
  cons:['Partia występuje odtąd jako Lewicowy Sojusz Demokratyczny.',
   'Limit kapitału rośnie o 90%, więc podatek od nadwyżki boli znacznie później.',
   'Wszystkie decyzje kosztują o 20% mniej kapitału.',
   'Nowa kategoria decyzji „Przemiana”: jednym kliknięciem przekwalifikowujesz serwerowicza na intelektualistę.',
   'Orędzia uderzają dwa razy mocniej w obecność i dorzucają trwałą przewagę w sondażach.'],
  run(){const p=me();
   p.n='Lewicowy Sojusz Demokratyczny';p.ab='LSD';p.c='#8e1e5e';p.logo='LSD';p.lsdMode=1;
   p.cred=cl(p.cred+8);p.uni=cl(p.uni+6);M(p,14);G.cat='prm';
   say('<b>Miara nader postępu.</b> Postępowcy zamieniają się w Lewicowy Sojusz Demokratyczny: własna kasa, własne kadry, własne orędzia.','roy')}},
 robotnicy:{n:'Partia Kolektywnych Robotników',for:['PP'],logo:'PKR',bots:1,
  what:'Partia Pracy przestaje być klubem dyskusyjnym i zamienia się w maszynę: własne struktury w każdym kanale, '
   +'werbunek z polecenia i kasa liczona co do grosza.',
  req:[
   {t:'Co najmniej 20 osób w partii',v:()=>me().mem+' / 20',ok:()=>me().mem>=20},
   {t:'Włóczykij i Rax w składzie partii',v:()=>{const o=ownPool(G.me);return ['Włóczykij','Rax'].filter(n=>o.includes(n)).length+' / 2'},
    ok:()=>{const o=ownPool(G.me);return ['Włóczykij','Rax'].every(n=>o.includes(n))}},
   {t:'Co najmniej 100 kapitału na koncie',v:()=>Math.round(G.kp)+' / 100',ok:()=>G.kp>=100},
  ],
  cons:['Partia występuje odtąd jako Partia Kolektywnych Robotników.',
   'Nabór przynosi o jedną czwartą więcej ludzi, a bilans kadencji rośnie o jedną osobę.',
   'Obecność w kanałach rośnie o 15% mocniej po każdej decyzji i spada nieco wolniej.',
   'Składki serwerowiczów podwojone: to oni utrzymują tę partię.',
   'Jedność rośnie o 1,8 tygodniowo, struktury trzymają ludzi razem, ale kontrowersja rośnie o 1,2: aparat partyjny budzi podejrzenia.'],
  run(){const p=me();
   p.n='Partia Kolektywnych Robotników';p.ab='PKR';p.c='#1d3f7a';p.logo='PKR';p.robMode=1;
   p.uni=cl(p.uni+12);p.act=cl(p.act+10);REG.forEach(r=>p.pres[r.id]=cl(p.pres[r.id]+8));M(p,12);
   say('<b>Partia Kolektywnych Robotników.</b> Koniec gadania, zaczynają się struktury.','roy')}},
 kanal:{n:'Kanał w końcu żyje',for:[],logo:'KAN',bots:0,avail:()=>true,
  what:'Najprostszy cel w grze. Wystarczy, żeby na kanałach partii coś się faktycznie działo i żeby ludzie o was słyszeli w kilku miejscach naraz.',
  req:[
   {t:'Aktywność co najmniej 45',v:()=>Math.round(me().act)+' / 45',ok:()=>me().act>=45},
   {t:'Obecność powyżej 30 w trzech kanałach',v:()=>REG.filter(r=>me().pres[r.id]>=30).length+' / 3',
    ok:()=>REG.filter(r=>me().pres[r.id]>=30).length>=3},
   {t:'Co najmniej 6 osób w partii',v:()=>me().mem+' / 6',ok:()=>me().mem>=6},
  ],
  cons:['Dołącza dwóch serwerowiczów, aktywność skacze o 10.',
   'Obecność w okręgach spada wolniej: 3,8% tygodniowo zamiast 5,5%.',
   'Nie zmienia nazwy ani szyldu i nie blokuje żadnego innego celu.'],
  run(){const p=me();
   p.kanMode=1;p.act=cl(p.act+10);
   const g=drawFrom('ogolny',2);p.comp.eli+=g.eli;p.comp.int+=g.int;p.comp.ser+=g.ser;p.mem+=g.eli+g.int+g.ser;
   REG.forEach(r=>p.pres[r.id]=cl(p.pres[r.id]+6));M(p,8);
   say('<b>Kanał w końcu żyje.</b> Ludzie zaczynają wpadać sami, a obecność trzyma się dłużej.','good')}},
 reka:{n:'Ręka Mordeczki',for:[],logo:'HAND',bots:0,avail:()=>true,
  what:'Król przestaje traktować cię jak jedną z wielu partii i wysyła do ciebie ludzi ze swojego otoczenia. Cel dostępny dla każdego ugrupowania.',
  req:[
   {t:'Przychylność Króla co najmniej 60',v:()=>Math.round(kingFav(G.me))+' / 60',ok:()=>kingFav(G.me)>=60},
  ],
  cons:['Do partii wchodzi 1 osoba z elity i 2 intelektualistów, prosto z dworu.',
   'Nie zmienia nazwy ani szyldu, to układ, nie manifest.',
   'Nie blokuje żadnego innego celu.'],
  run(){const p=me();
   p.comp.eli+=1;p.comp.int+=2;p.mem+=3;
   p.uni=cl(p.uni+6);p.cred=cl(p.cred+4);M(p,8);
   kingRel(4,'Przyjmuje twoich ludzi jak swoich.');
   say('<b>Ręka Mordeczki.</b> Z dworu przychodzi jedna osoba z elity i dwóch intelektualistów. Nikt nie pyta, na jakich zasadach.','roy')}},
 postep:{n:'Będąc postępem warunkuje POSTĘP',for:['PLR'],logo:'POST',bots:1,
  what:'Zbierasz ekipę, która nie chce już niczego naprawiać, tylko robić po swojemu, i zamieniasz partię w maszynę do werbowania.',
  req:[
   {t:'Sulejman, balon i Prawe Jąderko w składzie partii',
    v:()=>{const o=ownPool(G.me);return ['Sulejman','balon','Prawe Jąderko'].filter(n=>o.includes(n)).length+' / 3'},
    ok:()=>{const o=ownPool(G.me);return ['Sulejman','balon','Prawe Jąderko'].every(n=>o.includes(n))}},
   {t:'Co najmniej 30 osób w partii',v:()=>me().mem+' / 30',ok:()=>me().mem>=30},
   {t:'Co najmniej 15% w ostatnich wyborach',
    v:()=>ostatniWynik()===null?'jeszcze nie było wyborów':fmt(ostatniWynik())+'% / 15%',
    ok:()=>(ostatniWynik()||0)>=15},
  ],
  cons:['Partia występuje odtąd jako Postępowcy, ze smokiem w herbie.',
   'Aktywność skacze o 22 i rośnie o 3,2 tygodniowo.',
   'Nabór działa o połowę mocniej: gdzie dotąd przychodziło dwóch serwerowiczów, przyjdzie trzech.',
   'Zamyka drogę do Partii Liberalnej i do Alternatywy dla Serwera: postępowcy idą własną ścieżką.',
   'Republikanów nadal da się odtworzyć.'],
  run(){const p=me();
   p.n='Postępowcy';p.ab='PST';p.c='#5b2d85';p.logo='POST';p.postMode=1;
   p.act=cl(p.act+22);p.fame=cl(p.fame+8);M(p,12);
   say('<b>Będąc postępem warunkuje POSTĘP.</b> Smok idzie na sztandar, a nabór rusza z podwójną siłą.','roy')}},
 horyzont:{n:'Między nami horyzontami',for:['PPP','KK'],logo:'HMO',bots:0,
  what:'Scalasz monarchistów w jedno ugrupowanie z koroną w herbie. Potężne, ciężkie i wolno się obracające.',
  req:[
   {t:()=>G.me==='KK'?'Relacja z PPP co najmniej +30':'Relacja z KK co najmniej +30',
    v:()=>{const o=G.me==='KK'?'PPP':'KK';return Math.round(G.rel[G.me][o])+' / 30'},
    gone:()=>{const o=G.me==='KK'?'PPP':'KK';return !G.p[o]||G.p[o].dead},
    ok:()=>{const o=G.me==='KK'?'PPP':'KK';return !!G.p[o]&&!G.p[o].dead&&G.rel[G.me][o]>=30}},
   {t:'Co najmniej 60 osób w partii',v:()=>me().mem+' / 60',ok:()=>me().mem>=60},
   {t:'Przychylność Króla co najmniej 30',v:()=>Math.round(kingFav(G.me))+' / 30',ok:()=>kingFav(G.me)>=30},
   {t:'Co najmniej 250 kapitału',v:()=>Math.round(G.kp)+' / 250',ok:()=>G.kp>=250},
  ],
  cons:['Aktywność rośnie o 3,6 tygodniowo, partia w końcu żyje na wszystkich kanałach.',
   'Jedność rośnie o 2,2 tygodniowo, spory gasną same.',
   'Władza jest zbyt rozległa, żeby wszystkim zarządzać: jedna akcja mniej w każdym tygodniu.'],
  run(){const p=me();p.n='Horyzont Monarchistyczny';p.ab='HM';p.c='#c9a227';p.logo='HMO';p.horMode=1;
   p.act=cl(p.act+18);p.uni=cl(p.uni+14);M(p,12);
   const ofiary=['PPP','KK','ROM'].filter(k=>k!==G.me&&G.p[k]&&!G.p[k].dead);
   let os=0,mn=0;
   ofiary.forEach(k=>{const q=G.p[k];
     os+=q.mem;mn+=q.seats;
     p.comp.eli+=q.comp.eli;p.comp.int+=q.comp.int;p.comp.ser+=q.comp.ser;p.mem+=q.mem;
     p.seats+=q.seats;
     q.bench.forEach(n=>{if(!p.bench.includes(n)&&p.bench.length<12)p.bench.push(n)});
     if(!p.bench.includes(q.lead)&&p.bench.length<12)p.bench.push(q.lead);
     if(G.gov&&G.gov.parties.includes(k))govLeave(k);
     q.dead=1;q.mem=0;q.comp={eli:0,int:0,ser:0};q.seats=0;q.bench=[];
   });
   if(ofiary.length)say(`<b>Wchłonięcie.</b> ${ofiary.map(k=>G.p[k].ab).join(', ')} przestają istnieć: ${os} ${pl(os,'osoba','osoby','osób')} i ${mn} ${pl(mn,'mandat','mandaty','mandatów')} przechodzą pod koronę.`,'roy');
   G.apMax=apBase();G.ap=Math.min(G.ap,G.apMax);
   say('<b>Horyzont Monarchistyczny.</b> Korona wraca na herb, a razem z nią cała biurokracja, która się pod nią mieści.','roy')}},
 polska1612:{n:'Polska 1612',for:['ROM'],logo:'P1612',bots:0,
  what:'Ruch Obrony Monarchii przestaje być pustym szyldem po cargrzybovie i wraca do roku, w którym korona sięgnęła najdalej. Nowe pokolenie monarchistów bierze sprawy w swoje ręce.',
  req:[
   {t:'Co najmniej 40 osób w partii',v:()=>me().mem+' / 40',ok:()=>me().mem>=40},
   {t:'Co najmniej 15% poparcia w ostatnich wyborach parlamentarnych',
    v:()=>{const h=G.hist.length?fmt(G.hist[G.hist.length-1].pct):'0';return h+'% / 15%'},
    ok:()=>G.hist.length>0&&G.hist[G.hist.length-1].pct>=15},
  ],
  cons:['Partia występuje odtąd jako Polska 1612.',
   'Sława +16 i aktywność +12 od razu, korona wreszcie ma za kim stać.',
   'Jedność rośnie o 2 tygodniowo.',
   'Kontrowersja spada o 1 tygodniowo, powaga zamiast wygłupów cargrzybova uspokaja serwer.'],
  run(){const p=me();p.n='Polska 1612';p.ab='1612';p.c='#8c3b2a';p.logo='ROM';p.rom12Mode=1;
   p.fame=cl(p.fame+16);p.act=cl(p.act+12);M(p,12);
   say('<b>Polska 1612.</b> Ruch Obrony Monarchii zrzuca formalny szyld i wraca jako partia, która pamięta, gdzie sięgała korona.','roy')}},
};
function libBecome(k){
  const p=G.p[k];
  p.n='Partia Liberalna';p.ab='PL';p.c='#e8c72e';p.logo='LIB';p.libMode=1;
  p.pret=cl(p.pret-18);p.fame=cl(p.fame+12);p.cred=cl(p.cred+8);M(p,10);
}
function adsBecome(k){
  const p=G.p[k];
  p.n='Alternatywa dla Serwera';p.ab='AdS';p.c='#0090d4';p.logo='ADS';p.adsMode=1;
  p.uni=cl(p.uni-26);p.fame=cl(p.fame+24);M(p,10);
}
const IDENT_BRAND={
 repMode:{n:'Partia Republikańska',ab:'PR',c:'#1e63d0',logo:'REP'},
 demMode:{n:'Partia Demokratyczna',ab:'PD',c:'#7aa842',logo:'PD'},
 adsMode:{n:'Alternatywa dla Serwera',ab:'AdS',c:'#0090d4',logo:'ADS'},
 libMode:{n:'Partia Liberalna',ab:'PL',c:'#e8c72e',logo:'LIB'},
 lib2Mode:{n:'Alternatywa Liberalna',ab:'AL',c:'#c0392b',logo:'ALT'},
 robMode:{n:'Partia Kolektywnych Robotników',ab:'PKR',c:'#1d3f7a',logo:'PKR'},
 postMode:{n:'Postępowcy',ab:'PST',c:'#5b2d85',logo:'POST'},
 lsdMode:{n:'Lewicowy Sojusz Demokratyczny',ab:'LSD',c:'#8e1e5e',logo:'LSD'},
 horMode:{n:'Horyzont Monarchistyczny',ab:'HM',c:'#c9a227',logo:'HMO'},
 rom12Mode:{n:'Polska 1612',ab:'1612',c:'#8c3b2a',logo:'P1612'},
 cenMode:{n:'Partia Centrum',ab:'PC',c:'#1f7f86',logo:'CEN'},
 hegMode:{n:'Hegemonia Perspektywiczna',ab:'HP',c:'#c8952b',logo:'HEG'},
};
const myIdentities=()=>{const p=G&&G.p[G.me];return p?Object.keys(IDENT_BRAND).filter(m=>p[m]):[]};
function switchIdentity(mode){
  const b=IDENT_BRAND[mode],p=me();if(!b||!p[mode]||p.n===b.n)return;
  p.n=b.n;p.ab=b.ab;p.c=b.c;p.logo=b.logo;
  say(`<b>Zmiana szyldu.</b> Partia znowu występuje jako ${b.n}.`,'roy');render();
}
function myGoals(){if(!G)return [];
  return Object.keys(GOALS).filter(id=>{const g=GOALS[id];
    if(g.avail)return !!g.avail();                       // własny warunek dostępu jest rozstrzygający
    /* Republikę odbudowują wyłącznie partie republikańskie. Wcześniej wystarczyło
       mieć liberalny profil i cel otwierał się dosłownie każdemu, łącznie z FD. */
    if(!g.for.includes(G.me))return false;
    return true;
  })}
const reqOf=id=>(GOALS[id]?GOALS[id].req:[]).filter(r=>!(r.gone&&r.gone()));
function goalOk(id){const g=GOALS[id];const r=reqOf(id);return !!g&&r.length>0&&r.every(x=>x.ok())}
function goalReady(){return myGoals().some(id=>!goalDone(id)&&goalOk(id))}
function doGoal(id){
  if(!G.goals)G.goals={};
  if(!GOALS[id]||G.goals[id]||!myGoals().includes(id)||!goalOk(id))return;
  const nameBefore=me().n;
  G.goals[id]=1;GOALS[id].run();G.prest+=14;XP(30);applyGoals();
  const p=me(),g=GOALS[id],renamed=p.n!==nameBefore;
  render();
  SFX.elect();burst(['#d9ab45','#f7e3aa','#c9a227','#8c6d1f'],130,1);
  modal('Cel wypełniony',typeof g.n==='function'?g.n():g.n,
    `<p>${renamed?`Gratulacje, jesteś teraz <b style="color:${p.c}">${p.n}</b>.`:'Gratulacje, cel partyjny wypełniony.'}</p>`,
    [{l:'Wspaniale',s:'',f:close}]);
}
function aiGoals(){
  // boty potrafią AdS i Partię Liberalną, i tylko wtedy, gdy nie gramy żadną z partii z tej puli
  if(!GOALS.postep.for.includes(G.me))GOALS.postep.for.forEach(k=>{
    const p=G.p[k];if(!p||p.dead||p.postMode)return;
    const pool=[...new Set(p.main.concat(p.bench,[p.lead]))];
    if(p.mem<20||!['Sulejman','balon','Prawe Jąderko'].every(n=>pool.includes(n)))return;
    p.n='Postępowcy';p.ab='PST';p.c='#5b2d85';p.logo='POST';p.postMode=1;
    p.act=cl(p.act+22);p.fame=cl(p.fame+8);
    say(`<b>${p.n} (PST).</b> ${p.lead} przestawia partię na tryb werbunkowy i zmienia szyld.`,'roy');
  });
  if(!GOALS.liberal.for.includes(G.me))GOALS.liberal.for.forEach(k=>{
    const p=G.p[k];if(!p||p.dead||p.libMode)return;
    const pool=[...new Set(p.main.concat(p.bench,[p.lead]))];
    if(p.mem<30||!pool.includes('Aryati')||!p.bench.includes('Pan Hod_Dog'))return;
    libBecome(k);
    say(`<b>${p.n} (PL).</b> ${p.lead} wywiesza żółtą różę i zbiera wokół siebie liberalne skrzydło serwera.`,'roy');
  });
  // warunek dotyczy wyłącznie tego jednego celu, więc nie może przerywać całej funkcji
  if(!GOALS.ads.for.includes(G.me))GOALS.ads.for.forEach(k=>{
    const p=G.p[k];if(!p||p.dead||p.adsMode)return;
    const pool=[...new Set(p.main.concat(p.bench,[p.lead]))];
    if(p.mem<30||!['loof','Tortex','Kaziu'].every(n=>pool.includes(n)))return;
    if(!['loof','Tortex','Kaziu'].includes(p.lead))return;
    adsBecome(k);
    alive().forEach(x=>{if(x===k)return;G.rel[k][x]=cl(G.rel[k][x]-20,-100,100);G.rel[x][k]=cl(G.rel[x][k]-20,-100,100)});
    say(`<b>${p.n} (AdS).</b> ${p.lead} zebrał pod jednym szyldem wszystkich niezadowolonych. Nowa siła, z którą nikt nie chce rozmawiać.`,'bad');
  });

  /* Przemiany, które partie komputerowe też potrafią przeprowadzić.
     Celowo pomijamy te, które połykają inne ugrupowania — takie trzęsienie ziemi
     zostaje w rękach gracza, żeby serwer nie przewracał się sam z siebie. */
  aiPrzemiana('polska1612','ROM',p=>p.mem>=40&&G.term>=2,p=>{
    p.n='Polska 1612';p.ab='1612';p.c='#8c3b2a';p.logo='P1612';p.rom12Mode=1;
    p.fame=cl(p.fame+10);p.uni=cl(p.uni+8);
    return `<b>Polska 1612.</b> ${p.lead} wskrzesza rok, w którym korona sięgnęła najdalej.`;
  });
  aiPrzemiana('lsd','POJ',p=>p.mem>=26&&p.act>=55,p=>{
    p.n='Lewicowy Sojusz Demokratyczny';p.ab='LSD';p.c='#8e1e5e';p.logo='LSD';p.lsdMode=1;
    p.act=cl(p.act+14);p.fame=cl(p.fame+6);
    return `<b>Lewicowy Sojusz Demokratyczny.</b> ${p.lead} skleja lewe skrzydło serwera w jedno.`;
  });
}
/* Jedna przemiana partii sterowanej przez komputer: sprawdza warunek, zmienia szyld,
   ogłasza to serwerowi. Nie rusza partii, którą gra człowiek. */
function aiPrzemiana(id,kto,warunek,zmien){
  if(G.me===kto)return;                       // twoją partię przemieniasz sam
  const p=G.p[kto];
  if(!p||p.dead||G.goals&&G.goals[id])return;
  if(!warunek(p)||!ch(.10))return;            // rzadko, żeby nie działo się to co kadencję
  if(!G.goals)G.goals={};
  G.goals[id]=1;
  const opis=zmien(p);
  say(opis,'roy');
}
function goalCard(id){
  const g=GOALS[id],done=goalDone(id),all=goalOk(id);
  /* Wpis dziennika, a nie sama lista warunków: ile z nich jest odhaczonych
     i jak daleko do końca widać od razu w nagłówku, tak jak w dzienniku
     Victorii. Wcześniej trzeba było przelecieć wzrokiem wszystkie ptaszki. */
  const wym=reqOf(id), zrob=done?wym.length:wym.filter(r=>r.ok()).length;
  const proc=wym.length?Math.round(zrob/wym.length*100):0;
  return `<div class="card dziennik ${done?'zrobiony':all?'gotowy':''}" style="margin-bottom:14px">
    <div class="h"><h3>${typeof g.n==='function'?g.n():g.n}</h3>
    <span class="n">${done?'wypełniony':all?'gotowy':zrob+' z '+wym.length}</span></div><div class="b">
    <div class="dzpostep"><div class="trk"><i style="width:${proc}%"></i></div>
      <b>${done?'✓':proc+'%'}</b></div>
    <div style="display:flex;gap:18px;align-items:flex-start;flex-wrap:wrap;margin-bottom:14px">
      <img src="${LOGOS[g.logo]||''}" alt="" style="width:92px;height:92px;object-fit:contain;background:#f4f1ea;border-radius:var(--r2);padding:6px;flex:none;border:1px solid rgba(0,0,0,.3)">
      <div style="flex:1;min-width:220px">
        <p style="color:var(--dim);margin-bottom:8px">${g.what}</p>
        ${done?'<span class="pill pos">cel wypełniony</span>':all?'<span class="pill acc">wszystkie warunki spełnione</span>':'<span class="pill">warunki niespełnione</span>'}
        ${g.req.length>reqOf(id).length?'<div class="dim" style="font-size:12px;margin-top:6px">Jeden z warunków przestał obowiązywać: partia, której dotyczył, już nie istnieje.</div>':''}
      </div></div>
    ${reqOf(id).map(r=>{const o=r.ok();return `<div style="display:flex;justify-content:space-between;gap:12px;padding:8px 0;border-bottom:1px solid var(--line);font-size:13.5px">
      <span style="color:${o||done?'var(--tx)':'var(--dim)'}">${done||o?'✓':'✗'} ${typeof r.t==='function'?r.t():r.t}</span>
      <b class="m" style="color:${o||done?'var(--pos)':'var(--neg)'}">${done?'✓':r.v()}</b></div>`}).join('')}
    <h4 style="margin:16px 0 8px">Konsekwencje</h4>
    ${g.cons.map(c=>`<div style="padding:6px 0;border-bottom:1px solid var(--line);font-size:13.5px;color:var(--dim)">${c}</div>`).join('')}
    ${done?'':`<button class="btn" style="margin-top:16px" ${all?'':'disabled'} onclick="doGoal('${id}')">${all?'Wypełniam cel →':'Warunki jeszcze nie spełnione'}</button>`}
  </div></div>`;
}
const GENERIC_GOALS=['kanal','reka'];
function identSwitcher(){
  const ms=myIdentities();
  if(ms.length<2)return '';
  const p=me();
  return `<div class="card" style="margin-bottom:14px"><div class="h"><h3>Szyld partii</h3>
    <span class="n">masz ${ms.length} tożsamości</span></div><div class="b">
    <p class="dim" style="font-size:13px;margin-bottom:10px">Wypełniłeś więcej niż jeden cel, który zmienia nazwę partii. Zasady wszystkich zostają aktywne naraz, ale na zewnątrz widać tylko jeden szyld naraz, wybierz który.</p>
    <div style="display:flex;gap:9px;flex-wrap:wrap">
    ${ms.map(m=>{const b=IDENT_BRAND[m],on=p.n===b.n;
      return `<button class="opt" style="flex:1;min-width:190px;${on?'border-color:var(--acc)':''}" ${on?'disabled':''} onclick="switchIdentity('${m}')">
        <b>${on?'✓ ':''}${b.n}</b><span>${b.ab}</span></button>`}).join('')}
    </div></div></div>`;
}
function goalTab(){
  const ids=myGoals();
  if(!ids.length)return identSwitcher()+`<div class="card"><div class="h"><h3>Cele partyjne</h3></div><div class="b"><p class="dim">Twoja partia nie ma wytyczonego celu. Własne cele mają PPP, KK, PLR, PKD, DPD i Front Demokratyczny.</p></div></div>`;
  const transform=ids.filter(id=>!GENERIC_GOALS.includes(id));
  const generic=ids.filter(id=>GENERIC_GOALS.includes(id));
  return identSwitcher()
    +`<div class="note" style="margin:0 0 14px">Cel partyjny to jednorazowa przemiana: zmienia nazwę, logo i zasady, którymi gra twoja partia. ${transform.length>1?'Twoja partia ma do wyboru '+transform.length+' dróg.':''}</div>`
    +transform.map(goalCard).join('')
    +(generic.length?`<h4 style="margin:20px 0 10px">Ogólne, dostępne dla każdego</h4>`+generic.map(goalCard).join(''):'');
}

/* ---- sondaż / sejm / kronika ---- */
function pollTab(q,AL){
  const sh=Object.fromEntries(alive().map(k=>[k,shown(k,q.res[k].tot/q.total*100)]));
  const rows=alive().sort((a,b)=>sh[b]-sh[a]);   // kolejność zgodna z tym, co widać
  return histChart()+`<div class="card" style="margin-top:14px"><div class="h"><h3>Sondaż, kadencja ${G.term}, tydzień ${G.week}</h3>
    <span class="n">progi ${THR.base}% / ${THR.base+3}% / ${THR.base+8}%</span></div><div class="b">
    <div class="note" style="margin:0 0 14px">Sondaż to badanie, nie wynik, pojedyncza pozycja bywa przestrzelona
    nawet o <b>sześć punktów</b> w jedną albo drugą stronę. Mandaty obok liczone są z prawdziwego poparcia, którego nie widzisz.
    Nastroje serwera: ${SEG.map(s=>`<b style="color:${s.c}">${s.n} ${G.mood[s.id]>1.06?'↑':G.mood[s.id]<.94?'↓':'→'}</b>`).join(' · ')}</div>
    <table class="t"><thead><tr><th>Partia</th><th>Lider</th><th>Blok</th><th class="r">Trend</th><th class="r">Sondaż</th>
      <th class="r">Mand.</th><th class="r">Osób</th></tr></thead><tbody>
    ${rows.map(k=>{const v=q.res[k].tot,pc=sh[k],s=AL.out[k],pv=(G.prevShown||{})[k],tr=pv===undefined?0:pc-pv;
      return `<tr class="${k===G.me?'me':''}"><td><div class="nm">${crest(k,'s')}<span>${G.p[k].n}</span></div></td>
      <td><div class="nm">${leadAva(k,24)}<span class="dim">${leadName(k)}</span></div></td>
      <td>${(()=>{const bl=blocOf(k),co=G.p[k].coal&&CO()[G.p[k].coal];
        const s=bl?bl.short:(co?G.p[k].coal:null), c=bl?bl.color:(co?co.c:null);
        return s?`<span class="blocpill" style="background:${c}22;color:${c};border:1px solid ${c}55">${s}</span>`:'<span class="dim">,</span>'})()}</td>
      <td class="r m" style="color:${Math.abs(tr)<.25?'var(--dim2)':tr>0?'var(--pos)':'var(--neg)'}">${
        Math.abs(tr)<.25?'→':(tr>0?'▲ '+fmt(Math.abs(tr)):'▼ '+fmt(Math.abs(tr)))}</td>
      <td class="r m" style="color:${s?'var(--tx)':'var(--dim2)'}">${fmt(pc)}%</td>
      <td class="r m"><b>${s}</b></td><td class="r m dim">${G.p[k].mem}</td></tr>`}).join('')}
    </tbody></table>
    ${G.hist.length?`<h4 style="margin:20px 0 10px">Twoja historia</h4>
    <div class="nightbox">
      ${G.hist.slice().reverse().map((h,ridx)=>{
        const i=G.hist.length-1-ridx, prev=i>0?G.hist[i-1]:null;
        const dSeat=prev?h.seats[G.me]-(prev.seats[G.me]||0):null;
        const maxPct=Math.max(...G.hist.map(x=>x.pct),1);
        return `<div class="nrow ${ridx===0?'me':''}">
          <div class="npos">K${h.term}</div>
          <div class="ncrest">${crest(G.me,'s')}</div>
          <div class="nname"><b>${h.mem} ${pl(h.mem,'osoba','osoby','osób')}</b><span>${h.pm===G.me?'premier tej kadencji':`łącznie ${h.goals||0} ${pl(h.goals||0,'cel','cele','celów')}`}</span></div>
          <div class="ntrk"><i style="width:${(h.pct/maxPct*100).toFixed(1)}%;background:${me().c}"></i></div>
          <div class="npct">${fmt(h.pct)}%</div>
          <div class="nseat">${h.seats[G.me]}<em>${pl(h.seats[G.me],'mandat','mandaty','mandatów')}</em>
            ${dSeat!==null&&dSeat!==0?`<u class="${dSeat>0?'up':'dn'}">${dSeat>0?'+':''}${dSeat}</u>`:''}</div>
        </div>`}).join('')}
    </div>`:''}
  </div></div>`;
}
/* Skład rady ministrów widzi cały serwer, nie tylko premier — bez tego nie dało się
   sprawdzić, kto właściwie siedzi w rządzie i czyja partia na tym zarabia. */
function radaPodglad(){
  radaInit();
  if(!G.gov)return '';
  const obsadzone=RESORTY.filter(r=>radaKto(r.id)).length;
  const mojeResorty=RESORTY.filter(r=>{const n=radaKto(r.id);return n&&partiaOsoby(n)===G.me}).length;
  return `<div class="card rel"><div class="h"><h3>Rada ministrów</h3>
    <span class="n">${obsadzone} z ${RESORTY.length}${mojeResorty?` · ${mojeResorty} twoich`:''}</span></div><div class="b">
    <div class="minlist">${RESORTY.map(r=>{
      const kto=radaKto(r.id), kPart=kto?partiaOsoby(kto):null, moj=kPart===G.me;
      return `<div class="minrow2 ${moj?'moj':''}">
        <span class="mres">${r.n}</span>
        ${kto?`<span class="mkto">${ava(kto,kPart?G.p[kPart].c:'#666',22)}<b>${kto}</b>
            <span class="dim">${kPart?G.p[kPart].ab:'bezpartyjny'}</span></span>`
          :'<span class="mkto dim">wakat</span>'}
      </div>`}).join('')}</div>
    <div class="note" style="margin:12px 0 0">Minister pracuje na konto swojej partii: co tydzień dokłada jej
    sławy i aktywności, a przy ustawach ze swojego resortu liczy się tak jak premier.
    ${mojeResorty?`Masz <b>${mojeResorty}</b> ${pl(mojeResorty,'resort','resorty','resortów')}.`:'Nie masz żadnego resortu.'}</div>
  </div></div>`;
}
/* Ustawy widziane oczami zwykłego posła: co jest w mocy, kto to przepchnął
   i co ty sam możesz złożyć z resortu, który trzyma twoja partia. */
function ustawyPodglad(){
  lawsInit();radaInit();
  const moje=mojeResorty();
  const doZlozenia=LAWS.filter(l=>mogeZglosic(l.id)&&!G.lawTerm[l.id]&&!G.lawPend&&(!lawDone(l.id)||lawEdytowalna(l.id)));
  const wMocy=LAWS.filter(l=>lawDone(l.id));
  // karta stoi zawsze — bez niej nie było wiadomo, że ustawy w ogóle istnieją
  // ani po co brać ministerstwo
  const nazwaResortu=id=>(RESORTY.find(r=>r.id===id)||{}).n||'—';
  return `<div class="card kond"><div class="h"><h3>Ustawy</h3>
    <span class="n">${wMocy.length} z ${LAWS.length} w mocy</span></div><div class="b">
    ${G.lawPend?`<div class="spentbar" style="margin-bottom:13px"><b>${lawById(G.lawPend.id).n}</b> czeka na podpis prezydenta.
      Sejm: za ${G.lawPend.za}, przeciw ${G.lawPend.przeciw}. Dopóki nie zapadnie decyzja, nikt nie złoży kolejnej.</div>`:''}
    ${moje.length?`<div class="note" style="margin:0 0 12px">Twoja partia trzyma
      ${moje.map(nazwaResortu).map(n=>`<b>${n}</b>`).join(', ')}, więc możesz składać ustawy z ${pl(moje.length,'tego resortu','tych resortów','tych resortów')}
      nawet nie będąc premierem. Ustawa przepchnięta przez ciebie pracuje przede wszystkim na twoją partię.</div>`:''}
    ${doZlozenia.length?`<div class="lawmini">${doZlozenia.map(l=>`
      <button class="lawm" onclick="startLaw('${l.id}')">
        <span class="lmn">${l.n}</span>
        <span class="lmr">${l.resort?nazwaResortu(l.resort):'ustrojowa'}${isPM()&&!moje.includes(l.resort)?' · z urzędu premiera':''}</span>
        <span class="lmgo">złóż →</span>
      </button>`).join('')}</div>`
      :`<div class="dim" style="font-size:12.5px">${G.lawPend?'Najpierw musi zapaść decyzja prezydenta.'
        :moje.length?'Z twoich resortów nie ma teraz czego składać — wszystko albo w mocy, albo próbowane w tej kadencji.'
        :'Bez resortu ani fotela premiera nie masz z czym wyjść na mównicę. Weź ministerstwo.'}</div>`}
    ${wMocy.length?`<div class="lawheld">${wMocy.map(l=>{
      const autor=G.lawBy&&G.lawBy[l.id], moja=autor===G.me;
      return `<div class="lh ${moja?'moja':''}"><span>${l.n}</span>
        <b>${autor&&G.p[autor]?G.p[autor].ab:'—'}</b></div>`}).join('')}</div>
      <div class="dim" style="font-size:11.5px;margin-top:8px">Po prawej partia, która ustawę przepchnęła — to ona zbiera z niej najwięcej.</div>`:''}
  </div></div>`;
}
function sejmTab(){
  const arr=[];alive().sort((a,b)=>G.p[b].seats-G.p[a].seats).forEach(k=>{for(let i=0;i<G.p[k].seats;i++)arr.push(k)});
  const g=G.gov;
  return `<div class="card"><div class="h"><h3>Sejm, kadencja ${G.term}</h3>
    <span class="n">${TOTAL_SEATS} mandatów · większość ${MAJ}</span></div><div class="b">
    ${(()=>{const m=G.hemiMode||'party';
      const ord=allBlocs().map(b=>b.short);
      const arrS=m==='bloc'?arr.slice().sort((a,b)=>{
        const ba=blocOf(a),bb=blocOf(b);
        const ra=ba?ord.indexOf(ba.short):99, rb=bb?ord.indexOf(bb.short):99;
        return ra-rb||G.p[b].seats-G.p[a].seats;}):arr;
      const grupy = m==='bloc'
        ? allBlocs().map(b=>({n:b.short+' · '+b.name,c:b.color,
            s:b.parties.reduce((x,k)=>x+G.p[k].seats,0)})).filter(x=>x.s>0)
          .concat((()=>{const rest=alive().filter(k=>G.p[k].seats>0&&!blocOf(k));
            return rest.length?[{n:'Niezrzeszeni',c:'#75695b',s:rest.reduce((x,k)=>x+G.p[k].seats,0)}]:[]})())
        : alive().filter(k=>G.p[k].seats>0).sort((a,b)=>G.p[b].seats-G.p[a].seats)
            .map(k=>({n:G.p[k].ab,c:G.p[k].c,s:G.p[k].seats,me:k===G.me,k}));
      return `${true?`<div style="display:flex;gap:4px;justify-content:center;margin:2px 0 6px">
        <button class="hfil ${m==='party'?'on':''}" onclick="setHemi('party')">Podział partyjny</button>
        <button class="hfil ${m==='bloc'?'on':''}" onclick="setHemi('bloc')">Podział koalicyjny</button></div>`:''}
      <div style="max-width:470px;margin:2px auto 10px">${hemi(arrS,470,m)}</div>
      <div class="sejmleg">
        ${grupy.map(g2=>{
          const wRzadzie=g2.k&&G.gov&&G.gov.parties.includes(g2.k);
          return `<span class="sl ${g2.me?'ja':''} ${wRzadzie?'rzad':''}" style="--pc:${g2.c}">
            ${g2.k?crest(g2.k,'xs'):`<i style="background:${g2.c}"></i>`}
            <b>${g2.n}</b><em>${g2.s}</em></span>`}).join('')}
      </div>`})()}
    <div class="wladza">
      ${(()=>{const g2=G.gov,sp=G.sejmPrez;
        const card=(lab,who,party,extra,col,cls)=>`<div class="wcard ${cls||''}" style="--wc:${col}">
          <div class="wlab">${lab}</div>
          <div class="wbody">${who&&party?ava(who,G.p[party].c,44):''}
            <div style="flex:1;min-width:0">
              <b>${who||'wakat'}</b>
              <span>${party?G.p[party].n:'urząd nieobsadzony'}</span>
              ${extra?`<div class="wex">${extra}</div>`:''}</div>
            ${party?crest(party,'m'):''}</div></div>`;
        return `
        ${g2?card('Premier', G.pmOk?(g2.pmLead||G.p[g2.pm].lead):null, g2.pm,
          `koalicja ${g2.parties.reduce((a,k)=>a+G.p[k].seats,0)} z ${TOTAL_SEATS} mandatów${g2.minority?', rząd mniejszościowy':''}`,
          '#d1a13a', isPM()?'mine':''):card('Premier',null,null,'Bezkrólewie, serwer działa bez gabinetu','#c04a3e')}
        ${G.prez?card('Prezydent serwera', G.prez.lead, G.prez.party,
          `mandat do kadencji ${G.prez.until}`, '#9b7fb8', hasPrez()?'mine':''):''}
        ${sp&&sp.marszalek?card('Marszałek Sejmu', G.p[sp.marszalek].lead, sp.marszalek,
          sp.wice.length?`wicemarszałkowie: ${sp.wice.map(k=>G.p[k].lead+' ('+G.p[k].ab+')').join(', ')}`:'brak wicemarszałków',
          '#5a8bb0', isMar()?'mine':''):''}
        ${opoCard()}
        ${allBlocs().filter(b=>b.parties.some(k=>G.p[k].seats>0)&&!(b===G.opoBloc&&!inGov()&&me().seats)).map(b=>`
          <div class="wcard" style="--wc:${b.color}">
            <div class="wlab">${b===G.bloc?'Blok rządowy':b===G.opoBloc?'Blok opozycyjny':'Lista wyborcza'} · ${b.short}</div>
            <div class="wbody"><div style="flex:1;min-width:0">
              <b>${b.name}</b>
              <span>${b.parties.map(k=>G.p[k].ab).join(' · ')}, ${b.parties.reduce((a,k)=>a+G.p[k].seats,0)} mandatów</span></div>
              ${b.parties.includes(G.me)&&b.parties.length>1?`<button class="btn g sm" onclick="renameBloc('${b===G.opoBloc?'opo':b===G.bloc?'gov':b.short}')">Nazwij</button>`:''}
            </div></div>`).join('')}
      `})()}
    </div>
    <div class="sejmgrid">
    ${G.gov?`<div class="card"><div class="h"><h3>Gabinet</h3>
      <span class="n">${G.gov.parties.length} ${pl(G.gov.parties.length,'partia','partie','partii')}</span></div><div class="b">
      <div class="gauge" style="margin-bottom:13px"><i style="width:${G.gov.appr}%;background:linear-gradient(90deg,${
        G.gov.appr>58?'#5f8a4c,var(--pos)':G.gov.appr<42?'#8f3830,var(--neg)':'#a37f2c,var(--acc)'})"></i>
        <span>poparcie rządu ${Math.round(G.gov.appr)} / 100</span></div>
      ${G.gov.parties.map(k=>`<div class="minrow" ${k===G.me?'style="background:rgba(209,161,58,.08);margin:0 -6px;padding:7px 6px"':''}>
        ${crest(k,'s')}${leadAva(k,24)}
        <span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
          <b>${G.p[k].ab}</b> <span class="dim">${leadName(k)}</span></span>
        <span class="m dim" style="font-size:12px">${G.p[k].seats} mand.</span>
        <span class="dots" title="${resortyPartii(k)} z ${RESORTY.length} resortów">${[...Array(RESORTY.length)].map((_,i)=>
          `<i class="${i<resortyPartii(k)?'':'off'}"></i>`).join('')}</span></div>`).join('')}
    </div></div>`:''}
    ${radaPodglad()}
    ${ustawyPodglad()}
    </div>
    <table class="t"><thead><tr><th>Partia</th><th>Lider</th><th class="r">Mandaty</th><th>Status</th><th class="r">Relacja</th></tr></thead><tbody>
    ${alive().sort((a,b)=>G.p[b].seats-G.p[a].seats).map(k=>{const v=k===G.me?null:Math.round(G.rel[G.me][k]);
      return `<tr class="${k===G.me?'me':''}"><td><div class="nm">${crest(k,'s')}<span>${G.p[k].n}</span></div></td>
      <td><div class="nm">${leadAva(k,24)}<span class="dim">${leadName(k)}</span></div></td>
      <td class="r m"><b>${G.p[k].seats}</b></td>
      <td>${g&&g.parties.includes(k)?`<span class="pill pos">${g.pm===k?'premier':'koalicja'}</span>`
        :G.p[k].seats?'<span class="pill">opozycja</span>':'<span class="pill neg">poza sejmem</span>'}
        ${G.prez&&G.prez.party===k?'<span class="pill roy">prezydent</span>':''}</td>
      <td class="r m" style="color:${v===null?'var(--dim2)':v<0?'var(--neg)':v>30?'var(--pos)':'var(--dim)'}">${v===null?',':(v>0?'+':'')+v}</td></tr>`}).join('')}
    </tbody></table></div></div>`;
}
function feed(n){
  return `<div class="card"><div class="h"><h3>Kronika</h3><span class="n">K${G.term}·T${G.week}</span></div>
  <div class="b log" style="max-height:${n?520:300}px;padding-top:4px">${G.log.slice(0,n||14).map(l=>
    `<div class="e ${l.c}" style="font-size:12.5px;padding:8px 0"><span class="w">${l.w}</span>${l.t}</div>`).join('')
    ||'<span class="dim">Cisza. Zrób coś, a serwer zacznie gadać.</span>'}</div></div>`;
}

function leadTab(){
  const p=me(),ld=lead(G.me),sf=sizeF(p);
  const kto=leadWybrany(), ls=leads(p), wielu=ls.length>1;
  const STAT=[['char','Charyzma','sława, rekrutacja, wynik prezydencki'],
    ['komp','Kompetencja','wiarygodność, debaty, ryzyko gafy'],
    ['wytrz','Wytrzymałość','regeneracja energii co tydzień']];
  const cost=v=>v>=95?60:v>=88?40:v>=80?28:v>=62?18:12;
  return `<div class="card"><div class="h"><h3>${leads(p).join(' i ')}, rozwój</h3>
    <span class="n">doświadczenie ${wielu?esc(kto):''}: <b style="color:var(--acc)">${Math.floor(xpOs(kto))}</b></span></div><div class="b">
    <div class="leadbox" style="margin-bottom:16px">${leads(p).length>1?leadAva(G.me,50):ava(p.lead,p.c,58)}<div style="min-width:0">
      <b style="font-size:17px">${leads(p).join(' / ')}</b>
      <div class="dim" style="font-size:12.5px">${leads(p).length>1?'współprzewodniczący':'przewodniczący'} ${p.ab} · średnia ${Math.round(ld.avg)}${isPM()?' · <span style="color:var(--acc)">premier</span>':''}${hasPrez()?' · <span style="color:var(--roy)">prezydent</span>':''}</div></div></div>
    ${innAll(G.me).map(t=>`<div class="innate"><div class="lab">Cecha wrodzona</div>
      <h4>${t.n}</h4><p>${t.d}</p>
      <p style="margin-top:7px;font-size:12.5px;opacity:.62">Nie da się jej wykupić ani usunąć.</p></div>`).join('')}
    <p class="dim" style="font-size:13px">Doświadczenie zdobywasz za wygrane debaty, udane afery, wybory,
    fotel premiera i prezydenturę. Zbiera je <b>ten, kto akurat przewodzi</b>, i zostaje przy nim na zawsze —
    oddasz stery komu innemu, a dorobek zostanie przy poprzedniku i wróci razem z nim.</p>
    ${wielu?`<div class="sterlab" style="margin-top:18px">Kogo rozwijasz</div>
      <div class="ktorego">${ls.map(n=>{const x=L(n);
        return `<button class="${n===kto?'on':''}" onclick="setLeadSel('${esc(n)}')">
          ${ava(n,p.c,26)}<span><b>${n}</b><em>śr. ${Math.round(x.avg)}</em></span></button>`}).join('')}</div>
      <div class="note" style="margin:0 0 12px">Każdy ma własne doświadczenie i wydaje wyłącznie swoje —
      przy dwóch przewodniczących to, co zarobicie, dzieli się między was po połowie.
      Cecha kupiona komukolwiek ze sterów działa na całą partię, tyle że za każdą płacisz osobno.
      ${ls.filter(n=>n!==kto).map(n=>`${esc(n)}: ${Math.floor(xpOs(n))}`).join(' · ')}</div>`:''}
    <h4 style="margin:18px 0 6px">Cechy charakteru <span class="dim" style="font-weight:400;font-size:12.5px">, ${kto} i tylko ${kto}</span></h4>
    <div class="note" style="margin:0 0 11px">Wykupione cechy i wytrenowane statystyki zapisują się <b>osobie</b>, nie partii.
    Jeśli oddasz przewodnictwo komuś innemu, wszystko zostaje przy ${p.lead} i wróci razem z nim.
    ${(()=>{const inni=[...new Set(p.bench.concat(p.main))].filter(n=>n!==p.lead&&traitsOf(n).length);
      return inni.length?'W zapleczu cechy mają też: '+inni.map(n=>n+' ('+traitsOf(n).map(x=>TRAITS.find(y=>y.id===x).n).join(', ')+')').join(' · ')+'.':''})()}</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:9px">
    ${TRAITS.map(t=>{const has=traitsOf(kto).includes(t.id),can=xpOs(kto)>=t.cost,cf=conflictOf(t,kto);
      return `<button class="act" ${has||!can||cf?'disabled':''} onclick="buyTrait('${t.id}')"
        style="${has?'border-color:var(--pos);opacity:1':''}">
        <h4 style="color:${has?'var(--pos)':cf?'var(--dim2)':'var(--tx)'}">${has?'✓ ':''}${t.n}</h4>
        <div class="dd">${t.d}</div>
        <div class="c">${has?'<span class="yes">wykupione</span>'
          :cf?`<span class="no">wyklucza się z: ${cf.n}</span>`
          :`<span class="${can?'':'no'}">${t.cost} dośw.</span>`}
          ${!has&&!cf&&t.excl?`<span class="dim">≠ ${t.excl.map(x=>TRAITS.find(y=>y.id===x).n).join(', ')}</span>`:''}</div>
      </button>`}).join('')}</div>
    <h4 style="margin:20px 0 10px">Statystyki${wielu?` <span class="dim" style="font-size:12px;font-weight:400">, ${kto}; partia liczy średnią całych sterów</span>`:''}</h4>
    ${STAT.map(([id,n,d],i)=>{const v=L(kto)[id],c=cost(v);
      return `<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
        <div style="flex:1;min-width:0">
          <div style="display:flex;justify-content:space-between;font-size:13.5px;margin-bottom:4px">
            <span>${n} <span class="dim" style="font-size:12px">, ${d}</span></span><b class="m">${v}</b></div>
          <div class="trk"><i style="width:${v}%;background:${['var(--acc)','var(--info)','#9b7fd4'][i]}"></i></div></div>
        <button class="btn ${xpOs(kto)>=c&&v<99?'':'g'} sm" ${xpOs(kto)>=c&&v<99?'':'disabled'}
          onclick="buyStat(${i})" style="white-space:nowrap">+1 za ${c}</button></div>`}).join('')}
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;opacity:.7">
      <div style="flex:1;min-width:0">
        <div style="display:flex;justify-content:space-between;font-size:13.5px;margin-bottom:4px">
          <span>Autorytet <span class="dim" style="font-size:12px">, jedność partii</span></span><b class="m">${ld.autor}</b></div>
        <div class="trk"><i style="width:${ld.autor}%;background:var(--pos)"></i></div></div>
      <span class="dim" style="font-size:12px;white-space:nowrap">tylko debaty i wybory</span></div>
    <div class="note">Poniżej 62 punkt kosztuje 12 doświadczenia, powyżej 88 już 40, powyżej 95, 60. Sufit to 99. Autorytetu nie da się kupić ani wytrenować, rośnie wyłącznie po wygranych debatach, objęciu fotela premiera i wygranej prezydenturze.</div>
    <h4 style="margin:20px 0 10px">Wielkość partii</h4>
    <div class="judge">${p.mem} ${pl(p.mem,'osoba','osoby','osób')}${sf.lab?`, <b style="color:${p.mem<26?'var(--pos)':'var(--neg)'}">${sf.lab}</b>`:''}:
      decyzje kosztują <b>${Math.round(sf.kp*100)}%</b> kapitału, dają <b>${Math.round(sf.fame*100)}%</b> sławy
      i zużywają <b>${Math.round(sf.en*100)}%</b> energii.
      ${p.mem<15?'Mała partia rusza się szybciej i taniej niż giganci, to twoja główna przewaga.'
        :p.mem>46?'Duża partia grzęźnie we własnej strukturze. Za to dostajesz znacznie więcej kapitału co tydzień.'
        :'Średnia wielkość: bez premii i bez kary.'}</div>
  </div></div>`;
}
function conflictOf(t,who){
  if(!t.excl)return null;
  // sprzeczność liczy się w obrębie jednej osoby: dwaj przewodniczący mogą mieć
  // cechy, które u jednego by się wykluczały
  const maja=traitsOf(who||leadWybrany());
  const c=t.excl.find(x=>maja.indexOf(x)>=0);
  return c?TRAITS.find(x=>x.id===c):null;
}
function buyTrait(id){
  const t=TRAITS.find(x=>x.id===id),who=leadWybrany();
  if(!t||!who||traitsOf(who).includes(id)||xpOs(who)<t.cost||conflictOf(t,who))return;
  if(!G.ptraits)G.ptraits={};
  if(!G.ptraits[who])G.ptraits[who]=[];
  xpPula()[who]-=t.cost;G.ptraits[who].push(id);
  say(`<b>${who}</b> rozwija cechę: <b>${t.n}</b>. Zostaje przy nim na stałe, także gdy odda przewodnictwo.`,'good');render();
}
function buyStat(i){
  const who=leadWybrany(),key=['char','komp','wytrz'][i],v=L(who)[key];
  const c=v>=95?60:v>=88?40:v>=80?28:v>=62?18:12;
  if(xpOs(who)<c||v>=99)return;
  xpPula()[who]-=c;if(!G.lup[who])G.lup[who]=[0,0,0,0];G.lup[who][i]+=1;render();
}

function kingTab(){
  const f=kingFactors();
  const rank=alive().filter(k=>G.p[k].seats>0).map(k=>({k,s:kingScore(k)})).sort((a,b)=>b.s-a.s);
  const moje=rank.findIndex(x=>x.k===G.me);
  const fav=kingFav(G.me);
  const medal=i=>i===0?'#d9ab45':i===1?'#c7c7cf':i===2?'#c98a52':null;
  const maxAbs=Math.max(2,...f.map(x=>Math.abs(x.w)));
  return `
  <div class="card kroyal"><div class="b">
    <div class="crown">
      <div class="ofc">
        ${ava(KING,'#9b7fb8',60)}
        <div class="who" style="flex:1;min-width:0">
          <div class="lab">Monarcha serwera</div><b>${KING}</b>
          <span>To on zezwala sejmowi głosować nad konkretnym kandydatem na premiera. Bez jego zgody nie ma głosowania.</span></div>
        <span class="pill ${fav>=18?'pos':fav<0?'neg':'roy'}" style="font-size:15px;padding:7px 14px">${fav>0?'+':''}${Math.round(fav)}</span></div>
      <div class="kgaugewrap">
        <div class="kgauge">
          <div class="kzone bad" style="width:50%"></div>
          <div class="kzone mid" style="width:11%"></div>
          <div class="kzone good" style="width:39%"></div>
          <div class="kneedle" style="left:${cl(50+fav*0.62,2,98)}%"></div>
        </div>
        <div class="kgaugelab"><span>wygnaniec</span><span>obojętny</span><span>ulubieniec</span></div>
      </div>
      ${fav<0?`<div style="margin-top:13px;font-size:12.5px;color:#f0a0a0">
        <b>Uwaga.</b> Przy tej przychylności Mordeczka nie pozwoli sejmowi głosować nad twoim kandydatem. Zbij kontrowersję, podnieś aktywność albo sięgnij do skarbca.</div>`:''}
    </div>
  </div></div>
  <div class="card"><div class="h"><h3>Skarbiec</h3><span class="n">masz ${Math.round(G.kp)} kapitału</span></div><div class="b">
    <p class="dim" style="font-size:13px;margin-bottom:10px">Kapitał przekazany Królowi liczy się wprost do desygnacji ,
      jeden punkt za każde ${DANINA_ZA_PUNKT} monet. Dotychczas przekazałeś <b style="color:var(--acc)">${G.king.paid}</b>,
      co daje <b style="color:var(--acc)">+${(G.king.paid/DANINA_ZA_PUNKT).toFixed(1)}</b> punktu.</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      ${[140,320,650,1200].map(v=>`<button class="btn ${G.kp>=v?'':'g'}" ${G.kp>=v?'':'disabled'}
        style="flex:1;min-width:120px;padding:11px 8px" onclick="danina(${v})">
        ${v} kapitału<br><span style="font-size:11px;opacity:.75">+${(v/DANINA_ZA_PUNKT).toFixed(1)} punktu</span></button>`).join('')}
    </div>
  </div></div>
  <div class="card"><div class="h"><h3>Co liczy się u Króla</h3><span class="n">7 czynników</span></div><div class="b">
    ${f.map(x=>{const pos=x.w>=0,pct=cl(Math.abs(x.w)/maxAbs*50,1,50);
      return `<div class="kfrow">
      <div class="kfhead"><span>${x.n} <i>${x.d}</i></span><b style="color:${pos?'var(--pos)':'var(--neg)'}">${pos?'+':''}${x.w.toFixed(1)}</b></div>
      <div class="kftrack"><div class="kfmid"></div>
        <div class="kffill ${pos?'pos':'neg'}" style="width:${pct}%"></div></div>
    </div>`}).join('')}
    <div class="note" style="margin-top:4px">Punktacja decyduje, komu Król pozwoli stanąć przed sejmem. Jesteś obecnie
      <b style="color:var(--tx)">${moje>=0?moje+1:','}</b> ${moje===0?', desygnacja jest twoja':`z ${rank.length}, a przed tobą ${rank.slice(0,moje).map(x=>G.p[x.k].ab).join(', ')||'nikt'}`}.
      Sama sympatia nie wystarczy: bez mandatów punktacja i tak będzie niska.</div>
  </div></div>
  <div class="card"><div class="h"><h3>Ranking dworski</h3><span class="n">${rank.length} ${pl(rank.length,'partia','partie','partii')} z mandatami</span></div><div class="b">
    ${rank.map((x,i)=>`<div class="minrow" ${x.k===G.me?'style="background:rgba(155,127,184,.12);margin:0 -6px;padding:7px 6px"':''}>
      <span class="m dim krank" style="${medal(i)?'color:'+medal(i)+';font-weight:700':''}">${i+1}.</span>${crest(x.k,'s')}
      <span style="flex:1"><b>${G.p[x.k].ab}</b> <span class="dim">${leadName(x.k)} · ${G.p[x.k].seats} mand.</span></span>
      <b class="m" style="width:44px;text-align:right;color:${x.k===G.me?'var(--acc)':x.s<0?'var(--neg)':'var(--dim)'}">${x.s>0?'+':''}${Math.round(x.s)}</b></div>`).join('')}
  </div></div>`;
}

/* ---- modal ---- */
/* Okno, które samo się przerysowuje przy każdym kliknięciu (suwaki, listy wyboru).
   Gdy to wciąż to samo okno, podmieniamy tylko środek — inaczej całość znika
   i wjeżdża od nowa, co przy klikaniu +/− wygląda jak miganie. */
function rysujOkno(nazwa,srodek){
  if(PROBA)return null;               // to samo, co w modal(): podgląd niczego nie otwiera
  const stary=document.getElementById('veil');
  if(stary&&stary.dataset.okno===nazwa){
    const mdl=stary.querySelector('.mdl');
    if(mdl){mdl.innerHTML=srodek;return stary}
  }
  close();
  const v=document.createElement('div');v.className='veil';v.id='veil';
  v.dataset.okno=nazwa;
  v.innerHTML=`<div class="mdl">${srodek}</div>`;
  document.body.appendChild(v);
  return v;
}
function modal(k,t,b,o,onX){
  /* Podgląd skutków odpala prawdziwą decyzję dziewięć razy na kopii stanu.
     Decyzje takie jak nabór, wywiad czy szkolenie nie liczą niczego same —
     otwierają własne okno. Bez tej blokady podgląd naprawdę je otwierał,
     więc okna wyskakiwały same z siebie, a że pamięć podglądu kasuje się co
     tydzień, sypało nimi na starcie każdego tygodnia. */
  if(PROBA)return;
  close();
  const v=document.createElement('div');v.className='veil';v.id='veil';
  v.innerHTML=`<div class="mdl" role="dialog" aria-modal="true">
    <button class="mdlx" type="button" aria-label="Zamknij">×</button>
    <div class="h"><div class="k">${k}</div><h2>${t}</h2></div>
    <div class="bd">${b}</div>
    <div class="op">${o.map((x,i)=>`<button class="opt" data-i="${i}" ${x.dis?'disabled':''}><b>${x.l}</b><span>${x.s||''}</span></button>`).join('')}</div></div>`;
  document.body.appendChild(v);
  v.querySelectorAll('.opt').forEach(b2=>b2.onclick=()=>o[+b2.dataset.i].f());
  v.querySelector('.mdlx').onclick=onX||close;
}
function close(){const v=document.getElementById('veil');if(v)v.remove()}
function shortFree(sh,self){
  if(!sh)return false;
  if(G.bloc&&G.bloc!==self&&G.bloc.short===sh)return false;
  if(G.opoBloc&&G.opoBloc!==self&&G.opoBloc.short===sh)return false;
  return !Object.keys(G.coal).some(c=>G.coal[c]!==self&&c===sh);
}
function opoParties(){
  return alive().filter(k=>k!==G.me&&G.p[k].seats>0&&(!G.gov||!G.gov.parties.includes(k)));
}
function opoCard(){
  if(inGov()||!me().seats)return '';
  const w=G.opoBloc, inside=!!(w&&w.parties.includes(G.me));
  const kand=opoParties().filter(k=>!w||!w.parties.includes(k));
  const chetni=kand.filter(k=>listWill(k)>=10);
  const mand=(w?w.parties:[G.me]).reduce((a,k)=>a+G.p[k].seats,0);
  return `<div class="wcard" style="--wc:${inside?(w.color||'#c04a3e'):'#c04a3e'}">
    <div class="wlab">Opozycja${w?' · '+w.short:''}</div>
    <div class="wbody"><div style="flex:1;min-width:0">
      <b>${inside?w.name:(w?w.name:'Opozycja niezorganizowana')}</b>
      <span>${w?w.parties.map(k=>G.p[k].ab).join(' · ')+', '+mand+' '+pl(mand,'mandat','mandaty','mandatów'):'Każdy sobie. '+opoParties().length+' '+pl(opoParties().length,'partia','partie','partii')+' poza rządem.'}</span>
      ${inside?'':`<div class="wex">${chetni.length?'Chętnych do wspólnego frontu: '+chetni.map(k=>G.p[k].ab).join(', '):'Nikt nie chce się na razie łączyć.'}</div>`}</div>
    <div style="display:flex;flex-direction:column;gap:5px">
      ${inside?`<button class="btn g sm" onclick="renameBloc('opo')">Nazwij</button>`
       :'<span class="dim" style="font-size:11.5px">poza blokiem</span>'}
    </div></div></div>`;
}
function makeOpo(){
  const chetni=opoParties().filter(k=>listWill(k)>=10);
  if(!chetni.length)return;
  const grp=[G.me].concat(chetni);
  modalName(grp,x=>{
    G.opoBloc={name:x.name,short:shortFree(x.short,null)?x.short:'OPO',color:x.color,parties:grp};
    grp.forEach(k=>{if(k!==G.me){G.rel[G.me][k]=cl(G.rel[G.me][k]+10,-100,100);G.rel[k][G.me]=cl(G.rel[k][G.me]+10,-100,100)}});
    say(`<b>${x.name} (${G.opoBloc.short})</b>: opozycja zawiązuje wspólny front, ${grp.map(k=>G.p[k].ab).join(', ')}.`,'roy');
    render();
  });
}
function joinOpo(){
  const w=G.opoBloc;if(!w||w.parties.includes(G.me))return;
  const av=w.parties.reduce((a,k)=>a+listWill(k),0)/w.parties.length;
  if(av<10&&ch(.6)){say(`<b>${w.name} nie chce cię u siebie.</b> Średnia relacja ${Math.round(av)}.`,'bad');return render()}
  w.parties.push(G.me);
  w.parties.forEach(k=>{if(k!==G.me){G.rel[G.me][k]=cl(G.rel[G.me][k]+8,-100,100);G.rel[k][G.me]=cl(G.rel[k][G.me]+8,-100,100)}});
  say(`<b>Wchodzisz do ${w.name}.</b> Opozycja mówi jednym głosem.`,'good');render();
}
function leaveOpo(){
  const w=G.opoBloc;if(!w)return;
  w.parties=w.parties.filter(k=>k!==G.me);
  if(w.parties.length<2)G.opoBloc=null;
  say('<b>Wychodzisz z bloku opozycyjnego.</b> Grasz na własny rachunek.','bad');render();
}
function renameBloc(which){
  const b=which==='opo'?G.opoBloc:which==='gov'?G.bloc:null;
  if(b){modalName(b.parties,x=>{
    b.name=x.name;b.color=x.color;
    if(shortFree(x.short,b))b.short=x.short;
    say(`Blok występuje odtąd jako <b>${b.name} (${b.short})</b>.`,'roy');render()});return}
  const c=G.coal[which];if(!c)return;
  modalName(c.m,x=>{c.n=x.name;c.c=x.color;
    let key=which;
    if(x.short&&x.short!==which&&shortFree(x.short,c)){
      G.coal[x.short]=c;delete G.coal[which];key=x.short;
      c.m.forEach(k=>G.p[k].coal=key)}
    say(`Lista występuje odtąd jako <b>${c.n} (${key})</b>.`,'roy');render()});
}
function modalName(parties,cb,tytul,opis){
  close();
  const sug=autoName(parties,null);
  let col=BLOCPAL[RI(0,BLOCPAL.length-1)];
  const v=document.createElement('div');v.className='veil';v.id='veil';
  v.innerHTML=`<div class="mdl"><button class="mdlx" type="button" aria-label="Zamknij">×</button>
    <div class="h"><div class="k">${tytul||'Nazwa bloku'}</div>
    <h2>Jak ma się nazywać?</h2></div>
    <div class="bd"><p>${opis||''}${opis?'<br>':''}${parties.map(k=>G.p[k].n).join(' + ')}. Pod tą nazwą i barwą blok będzie
      występował w sondażach, sejmie i kronice.</p>
      <input class="inp" id="bn" maxlength="34" placeholder="np. ${sug.n}" value="${sug.n}">
      <input class="inp" id="bs" maxlength="5" placeholder="skrót" value="${sug.k}" style="max-width:130px">
      <div class="swatch" id="sw">${BLOCPAL.map(c=>`<button data-c="${c}" style="background:${c}"></button>`).join('')}</div>
    </div>
    <div class="op"><button class="opt" id="okb"><b>Zatwierdzam</b><span>Blok wchodzi do gry pod tą nazwą</span></button></div></div>`;
  document.body.appendChild(v);
  v.querySelector('.mdlx').onclick=()=>{close();render()};
  const paint=()=>v.querySelectorAll('#sw button').forEach(b=>b.className=b.dataset.c===col?'on':'');
  v.querySelectorAll('#sw button').forEach(b=>b.onclick=()=>{col=b.dataset.c;paint()});paint();
  v.querySelector('#okb').onclick=()=>{
    const n=(v.querySelector('#bn').value||sug.n).trim().slice(0,34);
    const s=(v.querySelector('#bs').value||sug.k).trim().slice(0,5).toUpperCase();
    close();cb({name:n||sug.n,short:s||sug.k,color:col});};
}
function showEvent(e){
  const T=typeof e.t==='function'?e.t():e.t, X=typeof e.x==='function'?e.x():e.x;
  modal(e.k,T,`<p>${X}</p>`,e.o.map(o=>({l:o.l,s:o.s,f:()=>{
    const r=o.f(me());if(r)say(`<b>${T}.</b> ${r}`);checkDeath();close();render()}})))}

/* ---- wybory ---- */
function resetLists(){
  if(G.listsReset===G.term)return;
  G.listsReset=G.term;
  G.coal={};PID.forEach(k=>{if(G.p[k])G.p[k].coal=null});
  G.bloc=null;G.opoBloc=null;G.newList=[];G.listTries={};
  aiCoal();
  say('<b>Listy wyborcze wygasają.</b> Każda partia startuje sama, dopóki się z kimś nie dogada.','roy');
}
/* Listy wyborcze zawiązywane z rachunku, nie z sympatii.
   Wspólna lista kumuluje głosy, ale podnosi próg — więc opłaca się tym, którzy sami
   go nie przeskoczą, a szkodzi tym, którzy i tak są bezpieczni. Bot liczy jedno i drugie. */
function aiCoal(){
  const q=tally();
  const proc=k=>q.total?q.res[k].tot/q.total*100:0;
  const rank=alive().filter(k=>k!==G.me).sort((a,b)=>G.p[b].seats-G.p[a].seats);
  const used=new Set();
  rank.forEach(anchor=>{
    if(used.has(anchor))return;
    const mojProc=proc(anchor);
    // im bliżej progu, tym mocniej partia szuka koła ratunkowego
    const zagrozenie=cl((THR.base+2-mojProc)/4,0,1);
    if(!ch(cl(.22+zagrozenie*.62,.08,.9)))return;

    const kand=rank.filter(k=>k!==anchor&&!used.has(k)&&G.rel[k][anchor]>=20&&G.rel[anchor][k]>=20&&ideo(k,anchor)<8)
      .map(k=>({k,w:proc(k)*1.4+G.rel[k][anchor]/8}))
      .sort((a,b)=>b.w-a.w);
    if(!kand.length)return;

    // dobieramy tylu, żeby przeskoczyć podniesiony próg, i ani jednego więcej
    const part=[];let suma=mojProc;
    for(const {k} of kand){
      if(part.length>=2)break;
      if(part.length&&suma>=thrFor(part.length+1)+2.5)break;   // już bezpiecznie
      part.push(k);suma+=proc(k);
    }
    // lista bez sensu, jeśli razem i tak nie przeskoczą własnego, wyższego progu
    if(!part.length||suma<thrFor(part.length+1))return;
    const grp=[anchor].concat(part);grp.forEach(k=>used.add(k));
    const nm=autoName(grp,null);let key=nm.k,i=1;while(G.coal[key])key=nm.k+(++i);
    G.coal[key]={n:nm.n,c:BLOCPAL[RI(0,BLOCPAL.length-1)],m:grp};
    grp.forEach(k=>G.p[k].coal=key);
    say(`<b>${nm.n} (${key})</b> idzie do wyborów wspólną listą: ${grp.map(k=>G.p[k].ab).join(', ')}. Próg ${thrFor(grp.length)}%.`);
  });
}
const listWill=k=>Math.round(G.rel[k][G.me]+(hasT('negocjator')?10:0)+(goalDone('republika')?12:0)-(hasAds(G.me)?25:0));
function togList(k){G.newList=G.newList||[];
  const i=G.newList.indexOf(k);if(i<0)G.newList.push(k);else G.newList.splice(i,1);render()}
function makeList(){
  // wspólna lista to poważna sprawa, więc próg chęci jest wyższy niż przy dosiadaniu się do cudzej
  const sel=(G.newList||[]).filter(k=>!G.p[k].coal&&listWill(k)>=28);
  if(!sel.length)return;
  const grp=[G.me].concat(sel);
  modalName(grp,x=>{
    let key=(x.short||'LW').toUpperCase().slice(0,5),i=1;
    while(G.coal[key])key=(x.short||'LW').toUpperCase().slice(0,4)+(++i);
    G.coal[key]={n:x.name,c:x.color||me().c,m:grp};
    grp.forEach(k=>G.p[k].coal=key);
    sel.forEach(k=>{G.rel[G.me][k]=cl(G.rel[G.me][k]+12,-100,100);G.rel[k][G.me]=cl(G.rel[k][G.me]+12,-100,100)});
    G.blokWyborczy=grp.slice();      // po wyborach wejdą z tobą do rządu bez targowania
    G.newList=[];
    say(`<b>${x.name} (${key})</b>: startujesz wspólną listą z ${sel.map(k=>G.p[k].ab).join(', ')}. Próg ${thrFor(grp.length)}%.`,'good');
    render();
  },'Wasza lista wyborcza','Pod tą nazwą pójdziecie do wyborów.');
}
function listJoinChance(c){
  const m=G.coal[c]?G.coal[c].m.filter(k=>!G.p[k].dead):[];
  const av=m.length?m.reduce((a,k)=>a+listWill(k),0)/m.length:60;
  return {av,chance:cl(av/20,.05,.97)};
}
function joinList(c){
  if(!G.coal[c]||(G.listTries&&G.listTries[c]))return;
  if(!G.listTries)G.listTries={};
  const m=G.coal[c].m.filter(k=>!G.p[k].dead);
  const {av,chance}=listJoinChance(c);
  if(!ch(chance)){
    G.listTries[c]='no';
    say(`<b>${G.coal[c].n} odrzuca twoją kandydaturę.</b> Średnia relacja ${Math.round(av)}, szansa była ${Math.round(chance*100)}%.`,'bad');
    return render();
  }
  G.listTries[c]='ok';
  if(me().coal)leaveList(1);
  G.coal[c].m.push(G.me);me().coal=c;
  G.blokWyborczy=G.coal[c].m.slice();     // ta lista wejdzie z tobą do rządu
  m.forEach(k=>{G.rel[G.me][k]=cl(G.rel[G.me][k]+10,-100,100);G.rel[k][G.me]=cl(G.rel[k][G.me]+10,-100,100)});
  say(`<b>Wchodzisz na listę ${G.coal[c].n}</b>, próg ${thrFor(G.coal[c].m.length)}%.`,'good');render();
}
function leaveList(quiet){
  const c=me().coal;if(!c||!G.coal[c])return;
  G.blokWyborczy=null;                    // wyjście z listy zwalnia z zobowiązania
  G.coal[c].m=G.coal[c].m.filter(k=>k!==G.me);
  G.coal[c].m.forEach(k=>{G.rel[G.me][k]=cl(G.rel[G.me][k]-16,-100,100);G.rel[k][G.me]=cl(G.rel[k][G.me]-16,-100,100)});
  if(G.coal[c].m.length<2){G.coal[c].m.forEach(k=>G.p[k].coal=null);delete G.coal[c]}
  me().coal=null;
  if(!quiet){say('<b>Startujesz sam.</b> Próg wraca do '+THR.base+'%.','bad');render()}
}
const POSTERS=[
 {id:'wielki',n:'Wielki plakat z liderem',d:'Twarz na każdym rogu serwera. Sława rośnie najmocniej, ale wygląda nachalnie.',fame:1.5,cred:.5,ctr:1.3},
 {id:'progr',n:'Plakat programowy',d:'Same konkrety i liczby. Mniej efektowne, za to solidne.',fame:.7,cred:1.5,ctr:.3},
 {id:'ludzie',n:'Zdjęcia ze zwykłymi ludźmi',d:'Ciepłe, swojskie, bez patosu.',fame:1.0,cred:1.0,ctr:.2},
 {id:'atak',n:'Plakat uderzający w rywali',d:'Zapada w pamięć, ale budzi kontrowersje.',fame:1.7,cred:.1,ctr:2.1},
];
/* Finałowa kampania nie przejmuje już całego ekranu — siedzi w pasku nad grą
   i otwiera się małym oknem, tak samo jak dogrywka prezydencka. */
function campInit(){
  if(!G.camp)G.camp={contrib:{},poster:{},simmed:false};
  if(G.camp.simmed)return;
  alive().filter(k=>k!==G.me).forEach(k=>{
    // Ile wyłożą, zależy od tego, na co ich stać, a nie od rzutu kostką.
    // Zdesperowani na końcu stawki sypią wszystkim, co mają.
    const q=G.p[k], c=charOf(k);
    const przod=alive().filter(x=>G.p[x].seats>q.seats).length<=2;
    /* Kampanię finansuje się z tego, co partia ma na koncie, a nie tylko z pensji
       za bieżący tydzień. Wcześniej boty dochodziły do maksymalnego banku i szły
       do wyborów, nie ruszając ani grosza — wykładały tyle, ile im akurat wpadło. */
    const bank=Math.max(0,q.bank||0);
    const zBanku=bank*R(.30,.60)*(przod?.85:1.2);   // zdesperowani sypią wszystkim, co mają
    const amt=Math.round(cl(income(k).total*R(2.4,4.6)*(przod?1:1.25)+zBanku,12,260));
    q.bank=Math.max(0,bank-zBanku);                  // kasa naprawdę schodzi z konta
    // Plakat pod charakter i sytuację: awanturnik uderza, wiarygodny pokazuje program,
    // a ten bez rozpoznawalności stawia na twarz lidera.
    const wagi=[
      ['wielki', .8+(q.fame<45?1.2:0)],
      ['progr',  .8+(q.cred>62?1.3:0)],
      ['ludzie', 1.0+(q.ctr>60?.9:0)],
      ['atak',   .3+c.agr*1.9-(q.ctr>70?.8:0)],
    ];
    const suma=wagi.reduce((a,x)=>a+Math.max(0,x[1]),0);
    let los=Math.random()*suma, wybor='ludzie';
    for(const [id,w] of wagi){los-=Math.max(0,w);if(los<=0){wybor=id;break}}
    // malejące zwroty: dwa razy większy budżet nie daje dwa razy większej kampanii
    const ps=POSTERS.find(x=>x.id===wybor)||POSTERS[2], scale=Math.sqrt(amt/50);
    G.camp.contrib[k]=amt;G.camp.poster[k]=ps.id;
    G.p[k].fame=cl(G.p[k].fame+ps.fame*7*scale);
    G.p[k].cred=cl(G.p[k].cred+ps.cred*7*scale);
    G.p[k].ctr=cl(G.p[k].ctr+ps.ctr*4*scale);
  });
  G.camp.simmed=true;
}
function campRank(){
  campInit();
  return alive().slice().sort((a,b)=>(G.camp.contrib[b]||0)-(G.camp.contrib[a]||0));
}
function campDecided(){return !!(G.camp&&G.camp.contrib[G.me]!==undefined)}
function campBar(){
  campInit();
  const rank=campRank(),moj=G.camp.contrib[G.me],czolo=rank.slice(0,3);
  return `<div class="runoff campbar">
    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
      <span class="pill">ostatni tydzień kampanii</span>
      <span class="dim" style="font-size:12.5px">Najwięcej wykłada
        ${czolo.map(k=>`<b style="color:${G.p[k].c}">${G.p[k].ab}</b> ${G.camp.contrib[k]||0}`).join(' · ')}</span>
      ${campDecided()
        ? `<span class="dim" style="margin-left:auto;font-size:12.5px">Twoja kampania: <b style="color:var(--tx)">${moj||'pominięta'}</b>
             <button class="btn g sm" style="margin-left:9px" onclick="openCamp()">Podgląd</button></span>`
        : `<button class="btn sm" style="margin-left:auto" onclick="openCamp()">Wykładam na kampanię →</button>`}
    </div></div>`;
}

function openCamp(){
  campInit();
  const p=me(),rank=campRank(),max=Math.max(1,...rank.map(k=>G.camp.contrib[k]||0));
  const decided=campDecided();
  close();
  const v=document.createElement('div');v.className='veil';v.id='veil';
  v.innerHTML=`<div class="mdl"><button class="mdlx" type="button" aria-label="Zamknij">×</button>
    <div class="h"><div class="k">Kadencja ${G.term} · ostatni tydzień</div><h2>Finałowa kampania</h2></div>
    <div class="bd">
      <p>Każda partia dokłada teraz ostatni kapitał. Kapitał, którego nie wydasz,
      i tak przepadnie na starcie nowej kadencji.</p>
      ${decided?`<div class="note" style="margin:0 0 14px">${G.camp.contrib[G.me]
          ?`Wykładasz <b>${G.camp.contrib[G.me]}</b> kapitału.`
          :'Pomijasz finałową kampanię.'}</div>`
        :`<div class="sterlab">Ile dokładasz</div>
          <div class="campkwota">
            <input type="number" id="campv" min="1" max="${Math.floor(G.kp)}" step="1"
              value="${Math.min(60,Math.floor(G.kp))}" ${G.kp<1?'disabled':''}>
            <span class="dim">z ${Math.round(G.kp)} kapitału</span>
            <button class="btn sm" id="campgo" ${G.kp<1?'disabled':''}>Wykładam</button>
          </div>
          <div class="note" style="margin:12px 0 14px">Im więcej wyłożysz, tym mocniej rośnie sława
            i wiarygodność w ostatnim tygodniu. Kapitał, którego nie wydasz, i tak przepadnie.</div>`}
      <div class="sterlab">Kto ile wyłożył</div>
      <div class="camprank">${rank.map(k=>{const v2=G.camp.contrib[k]||0;
        return `<div class="crow ${k===G.me?'ja':''}">
          ${crest(k,'s')}<span class="cnm">${G.p[k].ab}</span>
          <div class="cbar"><i style="width:${Math.round(v2/max*100)}%;background:${G.p[k].c}"></i></div>
          <b class="m">${v2||'—'}</b></div>`}).join('')}</div>
    </div>
    <div class="op">${decided
      ? '<button class="opt" id="cok"><b>Zamykam</b><span>Wybory ruszą, gdy zdecydujesz</span></button>'
      : [30,60,100].map(x=>`<button class="opt camp-kw" data-v="${x}" ${G.kp<x?'disabled':''}>
          <b>Wykładam ${x}</b><span>${G.kp<x?'za mało kapitału':'masz '+Math.round(G.kp)}</span></button>`).join('')
        + '<button class="opt" id="cno"><b>Pomijam</b><span>Kapitał zostaje, ale przepadnie</span></button>'}</div></div>`;
  document.body.appendChild(v);
  v.querySelector('.mdlx').onclick=()=>{close();render()};
  const ok=v.querySelector('#cok');if(ok)ok.onclick=()=>{close();render()};
  const no=v.querySelector('#cno');if(no)no.onclick=()=>runFinalCamp(0);
  v.querySelectorAll('.camp-kw').forEach(b=>b.onclick=()=>runFinalCamp(+b.dataset.v));
  const pole=v.querySelector('#campv'), go=v.querySelector('#campgo');
  if(go)go.onclick=()=>{const kwota=Math.floor(+pole.value||0);if(kwota>0)runFinalCamp(Math.min(kwota,Math.floor(G.kp)))};
  if(pole)pole.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();go.click()}};
}

function runFinalCamp(v){
  const p=me();
  if(v>0){
    if(G.kp<v)return;
    G.kp-=v;
    // gracz wykłada sam kapitał — bez wybierania plakatu; efekt jak przy spokojnej,
    // rzeczowej kampanii, żeby kwota decydowała zamiast rzutu na rodzaj plakatu
    const scale=Math.sqrt(v/50);   // te same malejące zwroty, co u botów
    p.fame=cl(p.fame+7*scale);p.cred=cl(p.cred+7*scale);p.ctr=cl(p.ctr+1.4*scale);
    G.camp.contrib[G.me]=v;G.camp.poster[G.me]='ludzie';
    say(`<b>Finałowa kampania.</b> ${p.lead} wykłada ${v} kapitału.`,'good');
  }else{
    G.camp.contrib[G.me]=0;
    say('<b>Pomijasz finałową kampanię.</b> Kapitał zostaje w kasie, ale na wynik już nie wpłynie.','bad');
  }
  close();render();
}
function closeFinalCamp(){G.phase='elect';render()}
function preElect(){
  resetLists();
  const p=me(), my=p.coal, sel=G.newList||[];
  const wolne=alive().filter(k=>k!==G.me&&!G.p[k].coal);
  const listy=Object.keys(G.coal).filter(c=>G.coal[c].m.length&&c!==my);
  const nSel=sel.filter(k=>!G.p[k].coal&&listWill(k)>=28).length;
  // ten sam sztandar co obie noce wyborcze — dzień wyborów jest ich początkiem,
  // a progi czyta się z tabliczek szybciej niż z akapitu
  app.innerHTML=`<div class="nocekran">
  <div class="nocsz">
    <div class="kick">Kadencja ${G.term} · cisza wyborcza</div>
    <h1>Dzień wyborów</h1>
    <p>Poprzednie listy właśnie wygasły. Zanim otworzą się urny, partie dogadują się
       na nowo: wspólna lista kumuluje głosy, ale podnosi próg.</p>
    <div class="tabliczki">
      <div><b>${THR.base}%</b><span>próg w pojedynkę</span></div>
      <div><b>${THR.base+3}%</b><span>próg we dwójkę</span></div>
      <div><b>${THR.base+8}%</b><span>próg w trójkę i więcej</span></div>
      <div><b>${listy.length}</b><span>${pl(listy.length,'lista przeciwników','listy przeciwników','list przeciwników')}</span></div>
    </div>
  </div>
  <div class="layout" style="grid-template-columns:1fr 1fr">
    <div class="card"><div class="h"><h3>Twoja lista</h3>
      <span class="n">próg ${my?thrFor(G.coal[my].m.length):nSel?thrFor(nSel+1):THR.base}%</span></div><div class="b">
      ${my?`<div class="note" style="margin:0 0 12px"><b>${G.coal[my].n} (${my})</b>: ${G.coal[my].m.map(k=>G.p[k].ab).join(' · ')}.
          Mandaty dzielicie proporcjonalnie do głosów wewnątrz listy.</div>
        <button class="btn g" onclick="leaveList()">Wychodzę z listy</button>`
       :`<div class="note" style="margin:0 0 12px">Startujesz sam. Zaznacz partie, z którymi chcesz iść wspólnie: wejdą tylko te,
          które cię zniosą, czyli relacja co najmniej 15.</div>
         <div class="lsel">${wolne.map(k=>{const w=listWill(k),okk=w>=28,on=sel.includes(k);
           return `<button class="lchip ${on?'on':''}" ${okk?'':'disabled'} onclick="togList('${k}')">
             ${crest(k,'s')}<span>${G.p[k].ab}</span><b class="${okk?'':'no'}">${w>0?'+':''}${w}</b></button>`}).join('')||'<span class="dim">Wszyscy są już na listach.</span>'}</div>
         <button class="btn" style="margin-top:14px" ${nSel?'':'disabled'} onclick="makeList()">
           ${nSel?`Zawiązuję listę z ${nSel} ${pl(nSel,'partią','partiami','partiami')}, próg ${thrFor(nSel+1)}%`:'Zaznacz kogoś albo startuj sam'}</button>`}
    </div></div>
    <div class="card"><div class="h"><h3>Listy przeciwników</h3><span class="n">${listy.length}</span></div><div class="b">
      ${listy.map(c=>{const m=G.coal[c].m,av=Math.round(m.reduce((a,k)=>a+listWill(k),0)/m.length);
        const tried=G.listTries&&G.listTries[c],chance=Math.round(listJoinChance(c).chance*100);
        return `<div class="lrow"><div style="flex:1;min-width:0">
          <b>${G.coal[c].n}</b> <span class="dim" style="font-size:12px">${m.map(k=>G.p[k].ab).join(', ')}</span>
          <div class="dim" style="font-size:11.5px;font-family:var(--m)">próg ${thrFor(m.length)}% · średnia relacja ${av>0?'+':''}${av}</div></div>
          ${my?'':tried==='no'?'<span class="pill neg">odmowa</span>'
            :`<button class="btn g sm" onclick="joinList('${c}')">Próbuję (${chance}%)</button>`}</div>`}).join('')
        ||'<span class="dim">Nikt się nie dogadał, wszyscy startują sami.</span>'}
    </div></div>
  </div>
  <div class="ekstopka">
    <span class="ekleg">${my?'idziesz wspólną listą':'startujesz sam'}</span>
    <button class="btn" onclick="runElection()">Otwórz urny →</button>
  </div>
  </div>`}

let govSel=[],govPay=0;
/* ══════════ ROZLICZENIE KADENCJI ══════════
   Po wyborach nie wystarczy pokazać liczb — trzeba powiedzieć, co je zrobiło.
   Porównujemy stan sprzed poprzednich wyborów z tym, z którym poszedłeś do urn,
   i nazywamy trzy rzeczy, które najmocniej ruszyły wynikiem. */
function rozliczenieKadencji(){
  const h=G.hist||[];
  if(h.length<2)return '';
  const teraz=h[h.length-1], przed=h[h.length-2];
  if(!przed||przed.pres===undefined)return '';      // zapis sprzed tej wersji
  const dM=(teraz.seats[G.me]||0)-(przed.seats[G.me]||0);
  const dPct=teraz.pct-przed.pct;

  const poz=[];
  const dodaj=(nazwa,ile,jednostka,opis,dobrze)=>{
    if(Math.abs(ile)<1)return;
    poz.push({nazwa,ile,jednostka,opis,dobrze:dobrze!==undefined?dobrze:ile>0,waga:Math.abs(ile)});
  };
  dodaj('Obecność w kanałach',teraz.pres-przed.pres,'śr. pkt',
    'Mnoży twój wynik w każdym okręgu mocniej niż cokolwiek innego.');
  dodaj('Skład partii',teraz.mem-przed.mem,'osób','Twardy elektorat, który przyjdzie zagłosować.');
  dodaj('Sława',teraz.fame-przed.fame,'pkt','Ile osób w ogóle o tobie słyszało.');
  dodaj('Jedność',teraz.uni-przed.uni,'pkt','Rozsypana partia gorzej mobilizuje swoich.');
  dodaj('Wiarygodność',teraz.cred-przed.cred,'pkt','Decyduje, czy ktoś ci uwierzy.');
  dodaj('Kontrowersja',teraz.ctr-przed.ctr,'pkt','Powyżej 90 sondaż liczy się na pół.',teraz.ctr<przed.ctr);
  dodaj('Zmęczenie władzą',(teraz.znuz||0)-(przed.znuz||0),'pkt',
    'Zjada poparcie za samo siedzenie u steru. Zmywa je tylko kadencja w opozycji.',
    (teraz.znuz||0)<(przed.znuz||0));
  poz.sort((a,b)=>b.waga-a.waga);
  const glowne=poz.slice(0,4);

  // okręg, w którym zmiana obecności była największa — najbardziej namacalny przykład
  let okr=null;
  if(przed.presReg){
    REG.forEach(r=>{const a=przed.presReg[r.id],b=Math.round(me().pres[r.id]);
      if(a===undefined)return;const d=b-a;
      if(!okr||Math.abs(d)>Math.abs(okr.d))okr={r,a,b,d}});
  }

  const werdykt=dM>0?`Zyskujesz <b class="ok">${dM}</b> ${pl(dM,'mandat','mandaty','mandatów')}.`
    :dM<0?`Tracisz <b class="bad">${-dM}</b> ${pl(-dM,'mandat','mandaty','mandatów')}.`
    :'Utrzymujesz stan posiadania.';
  return `<div class="card kond rozlicz"><div class="h"><h3>Dlaczego taki wynik</h3>
    <span class="n">kadencja ${przed.term} → ${teraz.term}</span></div><div class="b">
    <p style="font-size:14.5px;margin-bottom:12px">${werdykt}
      Poparcie ${dPct>=0?'wzrosło':'spadło'} o <b>${fmt(Math.abs(dPct))} pkt proc.</b>
      (${fmt(przed.pct)}% → ${fmt(teraz.pct)}%).</p>
    ${glowne.length?`<div class="przyczyny">${glowne.map(x=>`
      <div class="pz ${x.dobrze?'plus':'minus'}">
        <div class="pzl"><b>${x.nazwa}</b><span>${x.opis}</span></div>
        <div class="pzv">${x.ile>0?'+':''}${Math.round(x.ile)}<em>${x.jednostka}</em></div>
      </div>`).join('')}</div>`
      :'<div class="dim" style="font-size:13px">Przez całą kadencję nic się u ciebie właściwie nie ruszyło — i wynik to pokazuje.</div>'}
    ${okr&&Math.abs(okr.d)>=6?`<div class="note" style="margin-top:12px">Najmocniej zmieniło się w <b>${okr.r.n}</b>:
      obecność ${okr.d>0?'wzrosła':'spadła'} z <b>${okr.a}</b> do <b>${okr.b}</b>.
      ${okr.d<0?'Obecność osypuje się co tydzień sama — trzeba tam wracać.':'Widać to wprost w głosach z tego kanału.'}</div>`:''}
  </div></div>`;
}
function results(){
  const {votes,A:AL}=G.result,p=me(),ms=p.seats;
  const total=Object.values(votes).reduce((a,b)=>a+b,0);
  const arr=[];alive().sort((a,b)=>G.p[b].seats-G.p[a].seats).forEach(k=>{for(let i=0;i<G.p[k].seats;i++)arr.push(k)});
  const rank=alive().filter(k=>G.p[k].seats>0).sort((a,b)=>G.p[b].seats-G.p[a].seats);
  const top1=rank[0]===G.me;
  const prevH=G.hist.length>1?G.hist[G.hist.length-2].seats:null;
  const dSeat=k=>prevH?G.p[k].seats-(prevH[k]||0):null;
  const maxPct=Math.max(...alive().map(k=>votes[k]/total*100));
  let maxList=maxPct;
  app.innerHTML=`
  <div class="wynik">
    <div class="kick">Wyniki wyborów · kadencja ${G.term}</div>
    <div class="wynczolo">
      ${crest(G.me,'l')}
      <div class="wynlicz">
        <div class="big">${ms}</div>
        <div class="wynpod"><span>${pl(ms,'mandat','mandaty','mandatów')} dla ${p.ab}</span>${
          dSeat(G.me)!==null&&dSeat(G.me)!==0?`<span class="delta2 ${dSeat(G.me)>0?'up':'dn'}">${dSeat(G.me)>0?'+':''}${dSeat(G.me)}</span>`:''}</div>
      </div>
    </div>
    <p class="sub">${ms>=MAJ?'<b class="ok">Samodzielna większość.</b> Nie potrzebujesz nikogo.':
      top1?'Jesteś <b style="color:var(--acc)">największą partią sejmu</b>, desygnacja premiera należy do ciebie.':
      ms?'Bez koalicji nie ma rządu. Sprawdź, kto w ogóle chce z tobą rozmawiać.':
      '<b class="bad">Poza sejmem.</b> Zabrakło do progu, 12 tygodnii w cieniu.'}</p>
    <!-- ten sam rząd tabliczek co na nocy wyborczej: oba ekrany mają się czytać
         jako jeden ciąg, a nie jak dwie różne gry -->
    <div class="tabliczki">
      <div><b>${fmt(votes[G.me]/total*100)}%</b><span>twoje poparcie</span></div>
      <div><b>${votes[G.me]}</b><span>głosów na ciebie</span></div>
      <div><b>${rank.indexOf(G.me)>=0?(rank.indexOf(G.me)+1)+'.':'—'}</b><span>miejsce w sejmie</span></div>
      <div><b>${Math.round(total/SERVER*100)}%</b><span>frekwencja</span></div>
    </div>
  </div>
  <!-- Raport kadencji był napisany, wyeksportowany i nigdy nie rysowany: żaden
       ekran go nie wywoływał. Wraca tu, bo to naturalne miejsce — najpierw ile
       masz, potem jak ci poszło, dopiero potem dlaczego. Od drugiej kadencji,
       bo połowa jego pól to zmiana względem poprzedniej. -->
  ${G.hist.length>1?raport():''}
  ${rozliczenieKadencji()}
  <div style="max-width:440px;margin:0 auto 6px">${hemi(arr,440)}</div>
  <div class="legend" style="border:none;padding:0 0 14px;justify-content:center">
    ${alive().filter(k=>G.p[k].seats>0).sort((a,b)=>G.p[b].seats-G.p[a].seats).map(k=>
      `<span style="${k===G.me?'color:var(--acc);font-weight:600':''}"><i style="background:${G.p[k].c}"></i>${G.p[k].ab} ${G.p[k].seats}</span>`).join('')}</div>
  ${(()=>{const g2={};alive().forEach(k=>{const c=G.p[k].coal&&CO()[G.p[k].coal]?G.p[k].coal:k;g2[c]=(g2[c]||0)+votes[k]});
    maxList=Math.max(...Object.values(g2))/total*100;return ''})()}
  <div class="card" style="margin-top:8px"><div class="h"><h3>Wynik wyborów</h3>
    <span class="n">wysokość słupka = procent głosów · kreska w słupku = próg tej listy</span></div><div class="b">
    <div class="seatchart">
      ${(()=>{
        const grp={};
        alive().forEach(k=>{const c=G.p[k].coal&&CO()[G.p[k].coal]?G.p[k].coal:k;
          (grp[c]=grp[c]||{m:[],st:0,v:0}).m.push(k);grp[c].st+=G.p[k].seats;grp[c].v+=votes[k]});
        return Object.keys(grp).sort((a,b)=>(grp[b].v-grp[a].v)||(grp[b].st-grp[a].st)).map(c=>{
          const g=grp[c], lista=!!CO()[c], nm=lista?CO()[c].n:G.p[c].n, ab=lista?c:G.p[c].ab;
          const pc=g.v/total*100, h=cl(pc/Math.max(maxList,.1)*100,0,100), moje=g.m.includes(G.me);
          const thr=thrFor(g.m.length), thrH=cl(thr/Math.max(maxList,.1)*100,0,100);
          const col=lista?(CO()[c].c||G.p[g.m[0]].c):G.p[c].c;
          const dd=g.m.reduce((a,k)=>a+(dSeat(k)||0),0);
          return `<div class="scol ${moje?'me':''} ${g.st?'':'out'}" title="${nm}">
            <div class="sval">${fmt(pc)}%</div>
            <div class="stube"><i style="height:${Math.max(1.5,h)}%;background:${col}"></i>
              <u style="bottom:${thrH.toFixed(1)}%" title="próg ${thr}%"></u></div>
            <div class="sfoot">
              <div class="scrests">${g.m.slice(0,5).map(k=>crest(k,'s')).join('')}</div>
              <span>${ab}</span><b>${g.st} ${pl(g.st,'mandat','mandaty','mandatów')}${dd?(dd>0?' +':' ')+dd:''}</b>
              ${g.m.length>1?`<em>${g.m.map(k=>G.p[k].ab+' '+fmt(votes[k]/total*100)+'%').join(' · ')}</em>`:''}
            </div></div>`}).join('')})()}
      <div class="majline"><span>najwyższy wynik = pełny słupek · do większości trzeba ${MAJ} mandatów</span></div>
    </div>
    <div class="note" style="margin-top:16px">Poniżej progu: ${AL.L.filter(l=>!l.in).map(l=>(CO()[l.id]?CO()[l.id].n:G.p[l.id].ab)+' '+fmt(l.pct)+'% przy progu '+l.thr+'%').join(' · ')||'żadna lista'}.</div>
  </div></div>
  <div class="layout" style="grid-template-columns:1fr;margin-top:14px">
    <div class="card"><div class="h"><h3>Budowa koalicji</h3><span class="n">potrzeba ${MAJ}</span></div><div class="b">
      ${ms?`<p class="dim" style="font-size:13.5px">Partia wejdzie do koalicji dopiero przy relacji <b class="ok">+50</b>.
      Niżej trzeba dopłacić kapitałem, przy relacji <b class="bad">ujemnej</b> nie ma o czym rozmawiać.
      Premiera wskaże <b>Król Mordeczka</b> spośród koalicjantów, kierując się przychylnością z zakładki Król, a nie samą liczbą mandatów. Urzędujący prezydent nie może nim zostać.</p><div id="govbox"></div>`
        :'<p class="dim">Bez mandatów nie negocjujesz.</p>'}
    </div></div>
  </div>
  <div class="ekstopka">
    <span class="ekleg">${ms?`do większości trzeba ${MAJ} mandatów`:'bez mandatów zostaje ci opozycja'}</span>
    <button class="btn g" onclick="summary()">Podsumowanie</button>
    <button class="btn g" onclick="goOpo()">${ms?'Nie tworzę rządu':'Dalej'}</button>
    ${ms?`<button class="btn" onclick="tryGov()">Zgłoś koalicję →</button>`:''}
  </div>`;
  drawGov();
}
function partnersList(){return alive().filter(k=>k!==G.me&&G.p[k].seats>0).sort((a,b)=>G.p[b].seats-G.p[a].seats)}
function drawGov(){
  const box=document.getElementById('govbox');if(!box)return;
  const sum=me().seats+govSel.reduce((a,k)=>a+G.p[k].seats,0);
  box.innerHTML=partnersList().map(k=>{const on=govSel.includes(k),acc=accepts(k,govPay*2);
    const zBloku=bylWBloku(k);
    return `<button class="opt ${zBloku?'zbloku':''}" style="margin-bottom:8px;${on?'border-color:var(--acc)':''}" onclick="tg('${k}')">
      <b>${on?'✓ ':''}${G.p[k].ab}, ${G.p[k].lead} <span class="m dim">${G.p[k].seats} mand.</span>${
        zBloku?'<span class="tagblok">byliście w bloku</span>':''}</b>
      <span>relacja <b style="color:${G.rel[k][G.me]>=30?'var(--pos)':G.rel[k][G.me]<0?'var(--neg)':'var(--acc)'}">${Math.round(G.rel[k][G.me])}</b>
      · dystans ${ideo(k,G.me).toFixed(1)} ·
      <span class="${acc?'ok':'bad'}">${zBloku?'wchodzą bez targowania':acc?'zgodzą się':G.rel[k][G.me]<0?'wykluczone, ujemna relacja':'za mało, dopłać albo popraw relacje'}</span></span></button>`}).join('')
   +`<div style="display:flex;align-items:center;gap:10px;margin:12px 0 4px">
      <button class="btn g sm" onclick="pay(-1)" ${govPay?'':'disabled'}>−</button>
      <span class="m">dopłata ${govPay*7} kapitału (+${govPay*2} do skłonności)</span>
      <button class="btn g sm" onclick="pay(1)" ${G.kp>=(govPay+1)*7?'':'disabled'}>+</button></div>
    <div style="border-top:1px solid var(--line);padding-top:11px;margin-top:8px;font-size:15px">
      Razem: <b class="m" style="color:${sum>=MAJ?'var(--pos)':'var(--neg)'}">${sum}</b> / ${MAJ}
      ${govSel.every(k=>accepts(k,govPay*2))?'':'<span class="bad">, ktoś odmawia</span>'}</div>`;
}
function tg(k){govSel.includes(k)?govSel=govSel.filter(x=>x!==k):govSel.push(k);drawGov()}
function pay(d){govPay=Math.max(0,govPay+d);drawGov()}
function tryGov(){
  const sum=me().seats+govSel.reduce((a,k)=>a+G.p[k].seats,0);
  if(sum<MAJ)return modal('Błąd','Za mało mandatów',`<p>Masz ${sum}, potrzeba ${MAJ}.</p>`,[{l:'Rozumiem',f:close}]);
  if(!govSel.every(k=>accepts(k,govPay*2)))
    return modal('Błąd','Ktoś odmawia',`<p>Nie wszyscy chcą z tobą rządzić. Podnieś dopłatę albo zmień skład.</p>`,[{l:'Rozumiem',f:close}]);
  // dopłaty koalicyjne płaci się z kasy, a nie z kredytu
  const koszt=govPay*7;
  if(G.kp<koszt)return modal('Błąd','Nie stać cię na taką dopłatę',
    `<p>Umowa kosztowałaby <b>${koszt}</b> kapitału, a masz <b>${Math.round(G.kp)}</b>.
     Zejdź z dopłatą albo zbierz więcej.</p>`,[{l:'Rozumiem',f:close}]);
  G.kp-=koszt;
  /* Kto miał mandaty i nie dostał nic, ten to zapamięta — tym mocniej,
     im więcej wnosił. Wcześniej można było ułożyć rząd i nikt się nie obrażał. */
  const pominieci=alive().filter(k=>k!==G.me&&!govSel.includes(k)&&G.p[k].seats>0);
  pominieci.forEach(k=>{
    const waga=G.p[k].seats/Math.max(1,TOTAL_SEATS)*100;
    const uraza=Math.round(cl(6+waga*1.1,4,26));
    G.rel[k][G.me]=cl(G.rel[k][G.me]-uraza,-100,100);
    G.rel[G.me][k]=cl(G.rel[G.me][k]-Math.round(uraza*.4),-100,100);
  });
  if(pominieci.length)say(`<b>${pominieci.length} ${pl(pominieci.length,'partia została','partie zostały','partii zostało')} poza rządem.</b> `
    +`Najbardziej obrażeni: ${pominieci.slice().sort((a,b)=>G.p[b].seats-G.p[a].seats).slice(0,3).map(k=>G.p[k].ab).join(', ')}.`,'bad');
  const team=[G.me,...govSel];
  const pm=team.filter(k=>!pmBlocked(k)).sort((a,b)=>kingScore(b)-kingScore(a))[0]
    ||team.slice().sort((a,b)=>kingScore(b)-kingScore(a))[0];
  setGov(team,pm,RI(48,60));
  say(`Koalicja: ${team.map(k=>G.p[k].ab).join(' + ')}. Król wskazuje na <b>${G.p[pm].lead}</b> (${G.p[pm].ab}), przychylność ${Math.round(kingFav(pm))}.`);
  govSel=[];govPay=0;
  const opo=alive().filter(k=>G.p[k].seats>0&&!team.includes(k));
  const nazwijOpo=()=>{
    if(opo.length<2)return startPM();
    modalName(opo,b2=>{
      G.opoBloc={name:b2.name,short:shortFree(b2.short,null)?b2.short:'OPO',color:b2.color,parties:opo.slice()};
      say(`Opozycję nazywasz <b>${b2.name} (${G.opoBloc.short})</b>: ${opo.map(k=>G.p[k].ab).join(', ')}.`,'roy');
      startPM();
    },'Nazwij opozycję','Reszta sejmu i tak trafi do jednego worka. Ty decydujesz, jak ten worek się nazywa.');
  };
  if(team.length>1)modalName(team,b=>{G.bloc={name:b.name,short:b.short,color:b.color,parties:team.slice()};
    say(`Powstaje blok <b>${b.name} (${b.short})</b>.`,'good');nazwijOpo()});
  else nazwijOpo();
}
function goOpo(){govSel=[];govPay=0;aiGov();
  say(`Koalicję buduje ${G.gov?G.gov.parties.map(k=>G.p[k].ab).join(' + '):'nikt'}.`);
  const chetni=alive().filter(k=>k!==G.me&&G.p[k].seats>0&&(!G.gov||!G.gov.parties.includes(k))&&listWill(k)>=10);
  if(!me().seats||!chetni.length)return startPM();
  modal('Opozycja','Zawiązujesz wspólny front?',
    `<p>Poza rządem zostaje ${chetni.length+1} ${pl(chetni.length+1,'partia','partie','partii')}.
     Wspólny blok opozycyjny to jeden głos w sejmie i jedna nazwa w kronice zamiast kilku osobnych awantur.</p>`,
    [{l:'Tak, zawiązuję i nazywam',s:chetni.map(k=>G.p[k].ab).join(', '),
      f:()=>{close();const grp=[G.me].concat(chetni);
        modalName(grp,b=>{G.opoBloc={name:b.name,short:shortFree(b.short,null)?b.short:'OPO',color:b.color,parties:grp};
          grp.forEach(k=>{if(k!==G.me){G.rel[G.me][k]=cl(G.rel[G.me][k]+10,-100,100);G.rel[k][G.me]=cl(G.rel[k][G.me]+10,-100,100)}});
          say(`<b>${b.name} (${G.opoBloc.short})</b>: opozycja idzie razem.`,'roy');startPM()},
          'Opozycja','Zawiązujecie wspólny front.')}},
     {l:'Nie, gram sam',s:'Zawsze możesz zawiązać opozycję później, w zakładce Sejm',f:()=>{close();startPM()}}]);
}

/* ---- ekran głosowania nad premierem ---- */
function marRaceBar(x,i){
  return `<div class="vrow"><div class="who">${ava(x.who,G.p[x.k].c,30)}${crest(x.k,'xs')}
      <span>${x.who} <span class="dim">${G.p[x.k].ab}</span></span></div>
    <div style="flex:1;max-width:220px"><div class="trk" style="height:9px"><i style="width:${cl(x.pct*1.4,3,100)}%;background:${G.p[x.k].c}"></i></div></div>
    <span class="vv" style="color:${x.k===G.me?'var(--acc)':'var(--tx)'}">${fmt(x.pct)}%</span></div>`;
}
function marChoiceScreen(m,label,poolLabel){
  const my=G.p[G.me];
  const canRun=m.pool.includes(G.me);
  if(m.slot>=2&&!canRun){
    // druga tura wicemarszałka rozstrzyga się wyłącznie między innymi ugrupowaniami
  }
  if(!canRun){
    app.innerHTML=ekran(`
    ${sztandar(`Kadencja ${G.term} · prezydium sejmu`,`Wyścig o ${label}`,
      `Kandydować mogą ${poolLabel}. Twoja partia się nie kwalifikuje, wyścig rozstrzygnie się bez ciebie.`,
      [[m.pool.length,pl(m.pool.length,'startujący','startujących','startujących')],
       [G.p[G.me].seats,'wasze mandaty'],
       ['—','wasz kandydat']])}
    <div class="nocplyta"><div class="card" style="border:none;background:none;box-shadow:none">
      <div class="h"><h3>Startujący</h3></div><div class="b">
      ${m.pool.map(k=>{const r=bestRep(k);return `<div class="minrow"><span style="flex:1"><b>${r?r.n:G.p[k].lead}</b>
        <span class="dim">${G.p[k].ab} · ${G.p[k].seats} mand.</span></span></div>`}).join('')||'<span class="dim">Brak kandydatów.</span>'}
    </div></div></div>
    ${ekstopka('wyścig idzie bez was',
      '<button class="btn" onclick="marDeclare(false,null,0)">Rozstrzygnij wyścig →</button>')}`);
    return;
  }
  const pool=ownPool(G.me);
  if(!G.marWho||!pool.includes(G.marWho))G.marWho=pool[0];
  app.innerHTML=ekran(`
  ${sztandar(`Kadencja ${G.term} · prezydium sejmu`,`Wyścig o ${label}`,
    `Kandydować mogą ${poolLabel}. Twoja partia się kwalifikuje, więc wybierz, kto was reprezentuje,
     i ewentualnie dołóż kapitału do kampanii. Wygrywa najwyższy wynik, bez dogrywek.`,
    [[m.pool.length,pl(m.pool.length,'startujący','startujących','startujących')],
     [my.seats,'wasze mandaty'],
     [Math.round(G.kp),'kapitału w kasie']])}
  <div class="card" style="margin-bottom:14px"><div class="h"><h3>Kto startuje z ${my.ab}?</h3></div><div class="b">
    <div style="display:flex;gap:10px;flex-wrap:wrap">
    ${pool.map(n=>{const x=L(n),on=G.marWho===n;
      return `<button class="opt" style="flex:1;min-width:180px;${on?'border-color:var(--acc)':''}"
        onclick="setMarWho('${esc(n)}')"><div style="display:flex;align-items:center;gap:10px">${ava(n,my.c,38)}
        <div><b style="margin:0">${on?'✓ ':''}${n}</b><span>charyzma ${x.char} · kompetencja ${x.komp}</span></div></div></button>`}).join('')}
    </div></div></div>
  <div class="card"><div class="h"><h3>Kampania ${G.marWho}</h3><span class="n">${Math.round(G.kp)} kapitału</span></div><div class="b">
    <button class="opt" style="margin-bottom:9px" onclick="marDeclare(true,'${esc(G.marWho)}',0)"><b>Startuję bez kampanii</b>
      <span>Darmowe. Liczy się siła w sejmie i charyzma.</span></button>
    <button class="opt" style="margin-bottom:9px" onclick="marDeclare(true,'${esc(G.marWho)}',30)" ${G.kp<30?'disabled':''}>
      <b>Kampania za 30 kapitału</b><span>Wyraźny zastrzyk siły w wyścigu.</span></button>
    <button class="opt" style="margin-bottom:9px" onclick="marDeclare(true,'${esc(G.marWho)}',70)" ${G.kp<70?'disabled':''}>
      <b>Kampania za 70 kapitału</b><span>Bardzo mocne wsparcie.</span></button>
    <button class="opt" onclick="marDeclare(false,null,0)"><b>Nie startuję</b>
      <span>Wyścig odbędzie się bez was, inna partia obejmie urząd.</span></button>
  </div></div>
  ${ekstopka('wygrywa najwyższy wynik, bez dogrywek','')}`);
}
function marResultScreen(m,label){
  const moje=m.winner===G.me;
  app.innerHTML=ekran(`
  ${sztandar(`Kadencja ${G.term} · prezydium sejmu`,
    m.winner?m.who+', '+label:'Urząd nieobsadzony',
    m.winner?(moje?'<b class="ok">Wygraliście wyścig.</b>':`Wygrywa ${G.p[m.winner].n}.`):'Nikt się nie zgłosił.',
    [[(m.result||[]).length,pl((m.result||[]).length,'kandydat','kandydatów','kandydatów')],
     [m.winner?G.p[m.winner].ab:'—','urząd bierze'],
     [m.result&&m.result.length?fmt(Math.max(...m.result.map(x=>x.pct)))+'%':'—','wynik zwycięzcy']])}
  <div class="nocplyta"><div class="card" style="border:none;background:none;box-shadow:none">
    <div class="h"><h3>Wynik wyścigu</h3></div><div class="b">
    ${(m.result||[]).map(marRaceBar).join('')||'<span class="dim">Brak kandydatów.</span>'}
  </div></div></div>
  ${ekstopka(moje?'urząd wasz':'prezydium się układa',
    '<button class="btn" onclick="marContinue()">Dalej →</button>')}`);
}
function marCountPromptScreen(){
  app.innerHTML=ekran(`
  ${sztandar(`Kadencja ${G.term} · prezydium sejmu`,'Ilu ma być wicemarszałków?',
    `Sejm głosuje w trzech etapach: najpierw nad <b>dwoma</b> wicemarszałkami, jeśli odrzuci, nad <b>jednym</b>,
     a jeśli i to przepadnie, wicemarszałków <b>nie będzie</b>, praktycznie jednogłośnie.`,
    [[3,'etapy głosowania'],[2,'najpierw tylu'],[MAJ,'głosów do przyjęcia']])}
  ${ekstopka('każdy etap to osobne głosowanie',
    '<button class="btn" onclick="marContinue()">Zaczynamy głosowanie →</button>')}`);
}
function marCountVoteScreen(){
  const m=G.mar;
  const label = m.stage==='countA'?'dwóch wicemarszałków':'jednego wicemarszałka';
  if(!m.countVote){
    app.innerHTML=ekran(`
    ${sztandar(`Kadencja ${G.term} · prezydium sejmu`,`Głosowanie: ${label}`,
      m.stage==='countB'?'Poprzednia propozycja (dwóch wicemarszałków) nie przeszła. Sejm głosuje teraz nad jednym.'
        :'Pierwsze głosowanie tej kadencji w sprawie prezydium.',
      [[MAJ,'głosów do przyjęcia'],[TOTAL_SEATS,'mandatów w sejmie'],
       [m.stage==='countB'?'2 z 3':'1 z 3','etap']])}
    ${ekstopka('wstrzymanie się liczy się przeciw',
      '<button class="btn" onclick="marContinue()">Głosujemy →</button>')}`);
    return;
  }
  app.innerHTML=ekran(`
  ${sztandar(`Kadencja ${G.term} · prezydium sejmu`,m.countVote.pass?'Przyjęto':'Odrzucono',
    `Głosowanie nad ${label}.`,
    [[m.countVote.yes,'za'],[m.countVote.no,'przeciw'],[MAJ,'trzeba było']])}
  <div class="nocplyta">${voteBox(m.countVote,G.me)}</div>
  ${ekstopka(m.countVote.pass?'propozycja przeszła':'propozycja przepadła',
    '<button class="btn" onclick="marContinue()">Dalej →</button>')}`);
}
function marCountResultScreen(){
  const m=G.mar;
  app.innerHTML=ekran(`
  ${sztandar(`Kadencja ${G.term} · prezydium sejmu`,
    `Będzie ${m.count===2?'dwóch wicemarszałków':'jeden wicemarszałek'}`,
    'Teraz rozstrzygną się wyścigi o te miejsca.',
    [[m.count,pl(m.count,'miejsce','miejsca','miejsc')],[6,'partie mogą startować']])}
  ${ekstopka('',
    '<button class="btn" onclick="marContinue()">Wybieramy wicemarszałka →</button>')}`);
}
function marZeroScreen(){
  app.innerHTML=ekran(`
  ${sztandar(`Kadencja ${G.term} · prezydium sejmu`,'Wicemarszałków nie będzie',
    'Obie propozycje przepadły. Sejm przyjął to praktycznie jednogłośnie, prezydium ograniczy się do marszałka.',
    [[0,'wicemarszałków'],[1,'marszałek']])}
  ${ekstopka('prezydium zamknięte',
    '<button class="btn" onclick="marContinue()">Kończymy prezydium →</button>')}`);
}
function marScreen(){
  const m=G.mar;
  if(!m){G.phase='camp';startTerm();return}
  if(m.stage==='marChoice'){
    if(m.decision===null)return marChoiceScreen(m,'marszałka','<b>cztery największe partie</b>');
    return marResultScreen(m,'marszałek sejmu');
  }
  if(m.stage==='countPrompt')return marCountPromptScreen();
  if(m.stage==='countA'||m.stage==='countB')return marCountVoteScreen();
  if(m.stage==='countResult')return marCountResultScreen();
  if(m.stage==='countZero')return marZeroScreen();
  if(m.stage==='depChoice'){
    if(m.decision===null)return marChoiceScreen(m,`wicemarszałka (${m.slot} z ${m.count})`,'<b>sześć największych partii</b>');
    return marResultScreen(m,'wicemarszałek');
  }
  G.phase='camp';startTerm();
}
function setMarWho(n){G.marWho=n;render()}
function pmScreen(){
  const pr=G.pmProc;
  if(pr.vote&&pr.vote.pass)return pmDone();
  const pool=alive().filter(k=>G.p[k].seats>0&&!pr.tries.map(t=>t.cand).includes(k));
  const cand=pr.cand;
  // gęsty akapit z czterema liczbami rozbity na tabliczki — czyta się je raz,
  // a nie za każdą desygnacją od nowa
  app.innerHTML=ekran(`
  ${sztandar(`Kadencja ${G.term} · głosowanie ${pr.round} z 3`,'Kto zostanie premierem?',
    `Premierem może zostać wyłącznie lider partii, a wstrzymanie się liczy się przeciwko niemu.
     ${pr.round===1?'Desygnacja należy do zwycięzcy wyborów.'
      :pr.round%3===2?'<b style="color:var(--roy)">Kandydata wskazuje Król Mordeczka</b>, nie musi to być ktoś z koalicji.'
      :'Sejm wybiera swobodnie.'}
     Głosowania trwają, dopóki ktoś nie zbierze większości, a każdy tydzień bez rządu kosztuje cały serwer.`,
    [[MAJ,'głosów do większości'],[TOTAL_SEATS,'mandatów w sejmie'],
     [pr.round,'tura desygnacji'],
     [`+${(pr.round-1)*9}`,'presja na posłów']])}
  ${pr.lista?`<div class="card" style="margin-bottom:14px"><div class="h"><h3>Lista Króla Mordeczki</h3>
    <span class="n">kolejność desygnacji</span></div><div class="b">
    ${pr.lista.map((k,i)=>{const odp=pr.tries.some(t=>t.cand===k&&!t.pass);
      return `<div class="minrow" ${k===G.me?'style="background:rgba(155,127,184,.12);margin:0 -6px;padding:7px 6px"':''}>
      <span class="m dim" style="width:22px">${i+1}.</span>${crest(k,'s')}
      <span style="flex:1"><b>${G.p[k].ab}</b> <span class="dim">${G.p[k].lead} · ${G.p[k].seats} mand.</span></span>
      ${odp?'<span class="pill neg">odpadł</span>':k===pr.cand?'<span class="pill acc">desygnowany</span>':''}
      <b class="m" style="width:42px;text-align:right;color:${kingScore(k)<0?'var(--neg)':'var(--dim)'}">${kingScore(k)>0?'+':''}${Math.round(kingScore(k))}</b></div>`}).join('')}
    <div class="note">Kto raz przepadnie, wypada z listy. Wtedy Król schodzi o oczko niżej.</div>
  </div></div>`:''}
  ${pr.tries.length?`<div class="card" style="margin-bottom:16px"><div class="b">
    ${pr.tries.map(t=>`<div style="display:flex;align-items:center;gap:10px;font-size:13.5px;padding:5px 0">
      ${crest(t.cand,'s')}<span style="flex:1">${G.p[t.cand].lead} (${G.p[t.cand].ab})</span>
      <span class="m dim">${t.yes} za · ${t.no} przeciw · ${t.abst} wstrz.</span>
      <span class="pill ${t.pass?'pos':'neg'}">${t.pass?'przeszedł':'odrzucony'}</span></div>`).join('')}
  </div></div>`:''}
  ${pr.vote&&!pr.vote.pass?voteBox(pr.vote,pr.cand)+
    `<div style="text-align:center;margin-top:18px"><button class="btn" onclick="pmNext()">
      Kolejna desygnacja →</button></div>`
   :pr.choose?`<div class="card"><div class="h"><h3>Twoja desygnacja</h3>
      <span class="n">${pr.by}</span></div><div class="b">
      ${pool.filter(k=>!pmBlocked(k)&&G.p[k].seats>=Math.max(3,Math.round(TOTAL_SEATS*.10))).map(k=>`<button class="opt" style="margin-bottom:8px" onclick="pmPick('${k}')">
        <b>${G.p[k].lead}, ${G.p[k].ab} <span class="m dim">${G.p[k].seats} mand.</span></b>
        <span>kompetencja ${L(G.p[k].lead).komp} · charyzma ${L(G.p[k].lead).char} ·
        wstępne poparcie ${predict(k)} z ${TOTAL_SEATS}</span></button>`).join('')}
    </div></div>`
   :cand?`<div class="card"><div class="h"><h3>${pr.by} desygnuje</h3></div><div class="b">
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:14px">
        ${ava(G.p[cand].lead,G.p[cand].c,56)}${crest(cand,'l')}<div><h2>${G.p[cand].lead}</h2>
        <div class="dim">${G.p[cand].n} · ${G.p[cand].seats} ${pl(G.p[cand].seats,'mandat','mandaty','mandatów')}</div>
        <div class="dim" style="font-size:13px">kompetencja ${L(G.p[cand].lead).komp} · charyzma ${L(G.p[cand].lead).char} ·
        wstępne poparcie ${predict(cand)} z ${TOTAL_SEATS}</div></div></div>
      ${me().seats?`<p class="dim">Jak głosują twoje ${me().seats} ${pl(me().seats,'mandat','mandaty','mandatów')}?</p>
      <div style="display:flex;gap:9px;flex-wrap:wrap">
        <button class="btn" onclick="pmVote(1)">Za</button>
        <button class="btn r" onclick="pmVote(-1)">Przeciw</button>
        <button class="btn g" onclick="pmVote(0)">Wstrzymuję się</button></div>`
       :`<p class="dim">Bez mandatów nie masz głosu w tym głosowaniu.</p>
      <div style="display:flex;gap:9px;flex-wrap:wrap">
        <button class="btn" onclick="pmVote(0)">Kontynuuj</button></div>`}
    </div></div>`
   :`<div class="card"><div class="b"><p>Nie ma już kandydatów. Przedterminowe wybory.</p>
      <button class="btn" onclick="pmNext()">Dalej →</button></div></div>`}`);
}
function predict(k){let y=0;alive().forEach(x=>{if(G.p[x].seats&&stance(x,'pm',k,k)>12)y+=G.p[x].seats});return y}
function voteBox(v,cand){
  const tot=v.yes+v.no+v.abst||1;
  return `<div class="card"><div class="h"><h3>Wynik głosowania, ${G.p[cand].lead}</h3>
    <span class="n">${v.pass?'wniosek przeszedł':'wniosek odrzucony'}</span></div><div class="b">
    <div class="votebar">
      <i style="width:${v.yes/tot*100}%;background:var(--pos)">${v.yes?v.yes:''}</i>
      <i style="width:${v.no/tot*100}%;background:var(--neg)">${v.no?v.no:''}</i>
      <i style="width:${v.abst/tot*100}%;background:#3a4557;color:#e7eaf1">${v.abst?v.abst:''}</i></div>
    <div style="display:flex;gap:16px;font-size:12.5px;color:var(--dim);margin-bottom:10px">
      <span><b class="ok">${v.yes}</b> za</span><span><b class="bad">${v.no}</b> przeciw</span><span><b>${v.abst}</b> wstrzymało się</span></div>
    ${v.bribed&&v.bribed.length?`<div style="font-size:12.5px;color:#f0a0a0;background:rgba(192,74,62,.14);
      border-left:2px solid var(--neg);padding:9px 11px;border-radius:0 4px 4px 0;margin-bottom:11px;line-height:1.45">
      <b>Opozycja dosypała.</b> ${v.bribed.map(k=>G.p[k].ab).join(', ')} ${v.bribed.length===1?'zagłosował':'zagłosowali'} przeciw mimo umowy koalicyjnej.</div>`:''}
    ${alive().filter(k=>G.p[k].seats).sort((a,b)=>G.p[b].seats-G.p[a].seats).map(k=>`
      <div class="vrow"><div class="who">${crest(k,'xs')}${v.bribed&&v.bribed.includes(k)?'<span class="pill neg" style="font-size:9px">przekupiony</span>':''}<span>${G.p[k].ab} <span class="dim">${G.p[k].lead}</span></span></div>
      <span class="cnt">${G.p[k].seats}</span>
      <span class="vv" style="color:${v.by[k]>0?'var(--pos)':v.by[k]<0?'var(--neg)':'var(--dim2)'}">
        ${v.by[k]>0?'ZA':v.by[k]<0?'PRZECIW':'WSTRZ.'}</span></div>`).join('')}
  </div></div>`;
}
function pmPick(k){doPMVote(k,undefined)}
function pmVote(v){doPMVote(G.pmProc.cand,v)}
function pmNext(){pmFailForward()}
function pmDone(){
  const pr=G.pmProc,g=G.gov;
  app.innerHTML=`
  <div class="intro" style="padding:38px 0 14px">
    <div class="kick">Kadencja ${G.term} · rząd powołany</div>
    <h1>${g.pmLead||G.p[g.pm].lead} premierem</h1>
    <p>${g.parties.map(k=>G.p[k].ab).join(' + ')}, ${g.parties.reduce((a,k)=>a+G.p[k].seats,0)} z ${TOTAL_SEATS} mandatów.
       ${g.pm===G.me?'<b class="ok">To ty prowadzisz rząd.</b> Odblokowane zostały decyzje premiera.'
        :g.parties.includes(G.me)?'Jesteś w koalicji.':'Idziesz w opozycję.'}</p>
  </div>
  ${voteBox(pr.vote,pr.cand)}
  <div style="text-align:center;margin-top:20px">
    <button class="btn" onclick="afterPM()">Zaczynamy kadencję →</button></div>`;
}
function afterPM(){G.sejmPrez=null;G.mar=null;G.phase='camp';startTerm()}
function rotateBench(){
  // nikt nowy się nie pojawia, co kadencję najwyżej dwie osoby zmieniają barwy
  const moves=RI(0,2);
  for(let i=0;i<moves;i++){
    const donors=alive().filter(k=>G.p[k].bench.length>=2);
    if(!donors.length)return;
    const from=donors.sort((a,b)=>G.p[b].bench.length-G.p[a].bench.length)[RI(0,Math.min(2,donors.length-1))];
    const who=pick(G.p[from].bench);
    const to=alive().filter(k=>k!==from&&G.p[k].bench.length<4)
      .sort((a,b)=>(G.p[a].bench.length-G.p[b].bench.length)||(G.p[b].fame-G.p[a].fame))[0];
    if(!to)return;
    G.p[from].bench=G.p[from].bench.filter(x=>x!==who);
    G.p[to].bench.push(who);
    if(from===G.me)say(`<b>${who}</b> odchodzi z twojego zaplecza do ${G.p[to].ab}.`,'bad');
    else if(to===G.me)say(`<b>${who}</b> przechodzi z ${G.p[from].ab} do twojego zaplecza.`,'good');
    else say(`${who}: ${G.p[from].ab} → ${G.p[to].ab}.`);
  }
}
function memberFlow(){
  // rozliczenie kadencji: sława i wiarygodność przyciągają ludzi, obecność decyduje SKĄD
  alive().forEach(k=>{const p=G.p[k];
    const avgPres=REG.reduce((a,r)=>a+p.pres[r.id],0)/REG.length;
    // próg odniesienia sławy zależy od wielkości: trzyosobowa partia nie ma jak mieć sławy czterdziestki
    // im większa partia, tym wyżej poprzeczka, ale gracz ma łagodniejszą krzywą niż boty
    const st=(k===G.me)?.52:.95, st2=(k===G.me)?.32:.55;
    const bench0=cl(30+(p.mem-6)*st, 30, 78), bench1=cl(34+(p.mem-6)*st2, 34, 62);
    // Partie rosną wolno i tylko przy rozliczeniu kadencji. Świetnie rozegrana
    // kadencja to kilka osób, nie kilkanaście — inaczej setka jest po trzech kadencjach.
    const pull=(p.fame-bench0)/15 + (p.cred-bench1)/20 + (p.mom||0)/34 + (avgPres-28)/26;
    let n=Math.round(cl(pull,-5,4)+R(-.4,.4));
    // molochy przestają rosnąć, ale gracz ma łagodniejszy sufit, żeby setka była w ogóle osiągalna
    if(k===G.me){if(p.mem>58)n=Math.min(n,Math.max(1,3-Math.floor((p.mem-58)/14)))}
    else if(p.mem>40)n=Math.min(n,Math.max(0,2-Math.floor((p.mem-40)/8)));
    if(p.lib2Mode)n=Math.round(n*1.25)+1;  // liberalne skrzydło ciągnie ludzi samo z siebie
    if(p.postMode)n=Math.round(n*1.5)+1;   // Postępowcy werbują szybciej niż ktokolwiek
    if(p.cenMode&&n>0)n+=1;                // środek zgarnia niezdecydowanych, ale bez fajerwerków
    if(k===G.me&&n>0)n=Math.min(n+1,4);    // gracz ma lekką przewagę, ale z twardym sufitem
    if(freeTot()<60)n=Math.min(n,1);        // pusta pula hamuje wszystkich
    // najpierw to, co obiecały decyzje z kadencji
    const fl=p.flow||{eli:0,int:0,ser:0};
    let flTot=0;
    SID.forEach(gr=>{const take=Math.min(fl[gr]||0,G.free[gr]);
      if(take>0){p.comp[gr]+=take;p.mem+=take;G.free[gr]-=take;flTot+=take}});
    if(k===G.me&&flTot)say(`<b>Owoce kampanii:</b> dołącza ${[fl.eli?fl.eli+' z elity':'',fl.int?fl.int+' z intelektualistów':'',fl.ser?fl.ser+' z serwerowiczów':''].filter(Boolean).join(', ')}.`,'good');
    p.flow={eli:0,int:0,ser:0};
    // to, co co kadencję dosypują uchwalone ustawy
    const zUstaw=lawIntake(k);
    if(zUstaw){
      let uTot=0;
      SID.forEach(gr=>{const take=Math.min(zUstaw[gr]||0,G.free[gr]);
        if(take>0){p.comp[gr]+=take;p.mem+=take;G.free[gr]-=take;uTot+=take}});
      if(uTot&&k===G.me)say(`<b>Skutek ustaw:</b> dochodzi ${uTot} ${pl(uTot,'osoba','osoby','osób')} z tego, co sejm uchwalił.${
        (G.gov&&G.pmOk&&G.gov.pm===G.me)?' Jako partia premiera zbierasz z nich najwięcej.':''}`,'good');
    }
    if(n>0){
      // ludzie napływają z kanałów, w których naprawdę byłeś obecny
      const rank=REG.slice().sort((a,b)=>p.pres[b.id]-p.pres[a.id]);
      const src=rank.slice(0,3).filter(r=>p.pres[r.id]>12);
      const from=src.length?src:[rank[0]];
      const tot={eli:0,int:0,ser:0};let g=0;
      for(let i=0;i<n;i++){
        const w=from.map(r=>p.pres[r.id]+6);const sw=w.reduce((a,b)=>a+b,0);
        let x=Math.random()*sw,pickR=from[0];
        for(let j=0;j<from.length;j++){x-=w[j];if(x<=0){pickR=from[j];break}}
        const got=drawFrom(pickR.id,1);
        tot.eli+=got.eli;tot.int+=got.int;tot.ser+=got.ser;
        const q=got.eli+got.int+got.ser;g+=q;
      }
      p.comp.eli+=tot.eli;p.comp.int+=tot.int;p.comp.ser+=tot.ser;p.mem+=g;
      if(k===G.me&&g){
        const opis=[tot.eli?tot.eli+' z elity':'',tot.int?tot.int+' z intelektualistów':'',tot.ser?tot.ser+' z serwerowiczów':''].filter(Boolean).join(', ');
        say(`<b>Bilans kadencji:</b> dołącza ${opis}, głównie z ${from.map(r=>r.n).join(' i ')}.`,'good');
      }
    } else if(n<0){
      const q=giveBack(p,-n);const g=q.eli+q.int+q.ser;
      if(k===G.me&&g)say(`<b>Bilans kadencji:</b> przy sławie ${Math.round(p.fame)} i wiarygodności ${Math.round(p.cred)} odeszło ${g} ${pl(g,'osoba','osoby','osób')}.`,'bad');
    }
  });
}
/* ══════════ ZNUŻENIE WŁADZĄ ══════════
   Serwer męczy się tymi, którzy rządzą za długo. Każda kadencja u steru zostawia
   ślad, każda w opozycji go zmywa. Dzięki temu żadna partia — twoja też — nie
   zabetonuje się na szczycie: im dłużej trzymasz władzę, tym drożej ją utrzymać.
   Zmęczenia nie da się „przegrać” ani zbić decyzjami; schodzi tylko czasem poza rządem. */
const znuzenie=k=>(G.znuz&&G.znuz[k])||0;
function naliczZnuzenie(){
  if(!G.znuz)G.znuz={};
  const g=G.gov;
  alive().forEach(k=>{
    const premier=!!(g&&G.pmOk&&g.pm===k);
    const wRzadzie=!!(g&&g.parties.includes(k));
    let d;
    if(premier)d=BAL.znuzeniePremier;
    else if(wRzadzie)d=BAL.znuzenieKoalicja;
    else d=BAL.znuzenieOpozycja;      // opozycja odpoczywa w oczach serwera
    /* Pierwsza kadencja u władzy jest tania — nikt nie ma dość rządu, który dopiero
       zaczął. Dopiero kolejne bolą coraz mocniej. Wcześniej każda kadencja liczyła
       się tak samo i już po pierwszej znikało kilkanaście procent poparcia. */
    if(!G.znuzKad)G.znuzKad={};
    if(d>0){
      G.znuzKad[k]=(G.znuzKad[k]||0)+1;
      d*=BAL.znuzenieNarost[Math.min(BAL.znuzenieNarost.length-1,G.znuzKad[k]-1)];
    }else{
      G.znuzKad[k]=Math.max(0,(G.znuzKad[k]||0)-1);   // odpoczynek zmywa też staż
    }
    // hegemonowi serwer liczy każdą kadencję surowiej — to cena bycia punktem odniesienia
    if(hasHeg(k)&&d>0)d*=1.25;
    G.znuz[k]=cl((G.znuz[k]||0)+d,0,BAL.znuzenieSufit);
  });
  /* Im dłużej ktoś rządzi, tym bardziej reszta ma go dość — nie tylko w sondażu,
     ale i przy stole. Relacje osypują się tym szybciej, im większe zmęczenie. */
  alive().forEach(k=>{
    const z=G.znuz[k]||0;
    if(z<18)return;
    const spadek=z/26;
    alive().forEach(x=>{if(x===k)return;
      G.rel[x][k]=cl(G.rel[x][k]-spadek,-100,100)});
  });
  const moje=G.znuz[G.me]||0;
  if(moje>=48&&(g&&g.parties.includes(G.me)))
    say(`<b>Serwer ma cię dość.</b> Rządzisz tak długo, że zmęczenie władzą zjada ci ${Math.round(moje/2.9)}% poparcia. Kadencja w opozycji by je zmyła.`,'bad');
}
/* ---- demografia serwera ----
   Serwer żyje własnym życiem: przy dobrej kadencji ludzie się schodzą, przy
   awanturach cicho znikają. Wcześniej pula rosła po parę osób co tydzień
   niezależnie od wszystkiego, więc komunikaty o napływie były pustą obietnicą —
   liczba na pasku stała w miejscu, cokolwiek się działo.

   Zwraca zmianę liczby ludzi na serwerze (na plus albo na minus). */
function demografiaSerwera(){
  const zywe=alive();
  if(!zywe.length)return 0;
  const sr=f=>zywe.reduce((a,k)=>a+f(G.p[k]),0)/zywe.length;
  const fame=sr(p=>p.fame), akt=sr(p=>p.act), ktr=sr(p=>p.ctr), jed=sr(p=>p.uni);

  // Co ciągnie ludzi na serwer, a co ich z niego wypycha
  let ruch=(fame-44)/10 + (akt-44)/9 - (ktr-36)/8 + (jed-48)/22;
  ruch+=((G.turnout||.85)-.82)*14;              // wysoka frekwencja to znak, że tu się dzieje
  if(!G.gov)ruch-=3.5;                          // kadencja bez rządu odstrasza
  else if(G.gov.minority)ruch-=1.4;
  if(G.p[G.me].ctr>=80)ruch-=1.6;               // twoje własne awantury też się liczą
  ruch+=R(-2.2,2.2);                            // reszta to przypadek

  const ludzie=PID.reduce((a,k)=>a+G.p[k].mem,0)+freeTot();
  // im ciaśniej na serwerze, tym trudniej o kolejnych chętnych
  if(ruch>0)ruch*=cl(1-(ludzie-SERVER)/(SERVER_MAX-SERVER),.15,1);
  let d=Math.round(cl(ruch,-16,14));
  if(d>0)d=Math.min(d,Math.max(0,SERVER_MAX-ludzie));
  if(d<0)d=-Math.min(-d,Math.max(0,ludzie-120));   // serwer nie wymiera do zera
  if(!d)return 0;

  if(d>0){
    // nowi trafiają do puli niezrzeszonych: głównie serwerowicze, elita rzadko
    let zostalo=d;
    const eli=ch(.18)?1:0, int=Math.round(zostalo*.22);
    G.free.eli+=eli;zostalo-=eli;
    G.free.int+=int;zostalo-=int;
    G.free.ser+=Math.max(0,zostalo);
  }else{
    // Odchodzą najpierw ci, którzy nigdzie nie zdążyli wsiąknąć. Dopiero gdy pula
    // wolnych się skończy, ubytek zaczynają odczuwać same partie.
    let brak=-d;
    ['ser','int','eli'].forEach(s=>{
      const z=Math.min(brak,G.free[s]||0);G.free[s]-=z;brak-=z;
    });
    while(brak>0){
      const duze=alive().filter(k=>G.p[k].mem>1).sort((a,b)=>G.p[b].mem-G.p[a].mem);
      if(!duze.length)break;
      const k=duze[0],p=G.p[k],s=p.comp.ser>0?'ser':p.comp.int>0?'int':'eli';
      if(p.comp[s]<1)break;
      p.comp[s]--;p.mem--;brak--;
    }
  }
  return d;
}
function startTerm(){
  /* Zasada dyskontynuacji: projekt, którego stary sejm nie dokończył, przepada
     razem z kadencją. Bez tego ustawa wisiała na biurku przez wybory, a prezydent
     dostawał karę za zwłokę w sprawie, której nigdy nie widział. */
  if(G.lawPend){
    const zal=lawById(G.lawPend.id);
    G.lawPend=null;
    if(zal)say(`<b>${zal.n} przepada wraz z końcem kadencji.</b> Nowy sejm zaczyna z czystym biurkiem.`,'bad');
  }
  memberFlow(); rotateBench();
  {const d=demografiaSerwera();
   if(d>0)say(`<b>Serwer rośnie.</b> Przez kadencję dołączyło ${d} ${pl(d,'osoba','osoby','osób')}.`,'good');
   else if(d<0)say(`<b>Serwer się wykrusza.</b> Przez kadencję ubyło ${-d} ${pl(-d,'osoba','osoby','osób')}.`,'bad');}
  // Sejm bez ustaw przez sześć kadencji z rzędu przestaje być traktowany serio.
  // Liczy się tylko czas, w którym naprawdę mogłeś je składać, czyli z fotelem premiera.
  if(isPM()){
    G.bezUstaw=(G.bezUstaw||0)+1;
    if(G.bezUstaw>=6){
      const p=me();p.uni=cl(p.uni-26);p.cred=cl(p.cred-8);
      say('<b>Sześć kadencji rządzenia bez jednej ustawy.</b> Partia przestaje rozumieć, po co ci ta władza. Jedność mocno w dół.','bad');
      G.bezUstaw=0;
    }else if(G.bezUstaw===4){
      say('<b>Czwarta kadencja u steru bez żadnej ustawy.</b> Ludzie zaczynają pytać, co właściwie robisz. Jeszcze dwie i jedność poleci.','bad');
    }
  }
  naliczZnuzenie();
  // stan składu na starcie kadencji — od niego liczy się, jak głęboko partia może osunąć
  G.memStart={};alive().forEach(k=>{G.memStart[k]=G.p[k].mem});
  G.lawTerm={};                 // każdą ustawę wolno zgłosić raz na kadencję
  G.oredzie=0;
  G.term++;G.week=1;G.weeks=12;G.phase='camp';
  G.apMax=apBase();G.ap=G.apMax;
  /* Vengeance rośnie w autorytet z każdą kadencją, ale wolniej i z sufitem — przy
     pięciu punktach dochodził do maksimum w osiem kadencji i nie dało się z nim
     wygrać niczego. Bonus siedzi w G.lup, czyli w zapisie tej rozgrywki: wcześniej
     dopisywał się do wspólnej tablicy liderów i zostawał tam nawet po nowej grze. */
  {const kto='Vengeance';
   if(alive().some(k=>isLead(G.p[k],kto))&&L(kto).autor<82)gainAutor(kto,2);}
  G.sztab=G.sztabMax=5+Math.floor(me().mem/22);
  // Orędzie prezydenckie rozlicza się z kadencją prezydencką, a ta trwa dwie
  // parlamentarne — inaczej prezydent miałby dwa orędzia na jedną swoją kadencję.
  const oredzieBylo=G.useTerm.oredzieP;
  G.once.ordynacja=0;G.useTerm={};G.camp=null;G.campPoster=null;
  if(oredzieBylo&&G.prez&&G.prezOredzieFor===prezKadencja())G.useTerm.oredzieP=1;
  say(`<b>Kadencja ${G.term}.</b> ${G.gov?`Rząd: ${G.gov.parties.map(k=>G.p[k].ab).join(' + ')}, premier ${G.gov.pmLead||G.p[G.gov.pm].lead}.`:'Brak rządu.'}`,
      isPM()?'good':'');
  render();
}

/* ---- wybory prezydenckie ---- */
/* Kolejność kandydatów w treści jest stała, a przesuwa ich wyłącznie `order`.
   Przy liczeniu ranking zmienia się co klatkę i gdyby zmieniała się razem z nim
   kolejność w treści, zszywanie wpisywałoby portret w cudzy wiersz — czyli
   trzynaście razy z rzędu podmieniałoby src obrazka i awatary by mrugały. */
function raceBar(x,total,poz){
  const w=cl(x.pct*2,2.5,100), me2=x.k===G.me;
  const votes=total?Math.round(x.pct/100*total):null;
  return `<div class="lane ${me2?'me':''}" style="order:${poz===undefined?0:poz};--pc:${G.p[x.k].c}">
    ${poz===undefined?'':`<div class="lpoz">${poz+1}</div>`}
    <div class="lname">${ava(x.who||G.p[x.k].lead,G.p[x.k].c,34)}
      <div style="min-width:0"><b>${x.who||G.p[x.k].lead}</b><span>${G.p[x.k].ab}</span></div></div>
    <div class="ltrack">
      <div class="lfill" style="width:${w.toFixed(1)}%;background:linear-gradient(90deg,${G.p[x.k].c}55,${G.p[x.k].c})">
        <span class="lpct">${fmt(x.pct)}%</span></div>
      <div class="lgoal"><i></i><em>50%</em></div>
    </div>
    ${votes!==null?`<div class="lvotes">${votes} ${pl(votes,'głos','głosy','głosów')}</div>`:''}
    </div>`;
}
function prezStartNight(list){
  const turnout=cl(.68+R(-.05,.08),.55,.9);
  G.prezNight={rows:(list||[]).slice(),i:0,frames:13,done:false,total:Math.round(SERVER*turnout)};
}
function prezJitter(rows,t){
  const noise=rows.map(()=>Math.random()+.15);
  const ns=noise.reduce((a,b)=>a+b,0)||1;
  const spread=Math.max(0,1-t);
  return rows.map((x,i)=>({...x,pct:x.pct*(1-spread)+(noise[i]/ns*100)*spread}));
}
function prezNightScreen(){
  const N=G.prezNight, settled=N.i>=N.frames, remain=N.frames-N.i;
  const t=settled?1:N.i/N.frames;
  const teraz=settled?N.rows.slice():prezJitter(N.rows,t);
  /* Ranking liczymy osobno od kolejności w treści: wiersze zostają na swoich
     miejscach, a o tym, kto stoi wyżej, decyduje `order`. Patrz komentarz
     przy raceBar — inaczej portrety mrugałyby przy każdej klatce liczenia. */
  const kolejnosc=teraz.map((x,i)=>({i,pct:x.pct})).sort((a,b)=>b.pct-a.pct);
  const miejsce={}; kolejnosc.forEach((r,j)=>{miejsce[r.i]=j});
  const lead0=kolejnosc.length?teraz[kolejnosc[0].i]:null;
  const policzone=Math.round(N.total*t);
  app.innerHTML=`
  <div class="nocekran">
    <div class="nocsz">
      <div class="kick">Wybory prezydenckie · kadencja ${G.term}</div>
      <h1>${settled?'Wszystko policzone':remain<=1?'Ostatnie komisje się zgłaszają…':'Serwer głosuje'}</h1>
      <p>${settled?'Protokoły zamknięte. Tak zagłosował serwer.'
        :'Głosuje cały serwer, nie sejm. Wynik jeszcze się rusza.'}</p>
      <div class="tabliczki">
        <div><b>${policzone}</b><span>policzone głosy</span></div>
        <div><b>${Math.round(t*100)}%</b><span>protokołów</span></div>
        <div><b>${teraz.length}</b><span>${pl(teraz.length,'kandydat','kandydatów','kandydatów')}</span></div>
        <div><b>50%</b><span>próg pierwszej tury</span></div>
      </div>
      <div class="nockom">
        <span class="luke">komisje</span>
        <div class="nockomt">${Array.from({length:N.frames},(_,j)=>
          `<i class="${j<N.i?'on':''}"></i>`).join('')}</div>
        <span class="luke">${settled?'wszystkie podały':`zostało ${remain}`}</span>
      </div>
    </div>

    <div class="noccokol ${settled?'jest':''}">
      <div class="mramka"></div>
      <div class="luke">Prezydent serwera</div>
      ${settled&&lead0?`<div class="nocczolo" id="palac-jest">
          <div class="ncrest">${ava(lead0.who||G.p[lead0.k].lead,G.p[lead0.k].c,48)}</div>
          <div class="noccn"><b>${lead0.who||G.p[lead0.k].lead}</b><span>${G.p[lead0.k].ab}</span></div>
          <div class="noccp"><b>${fmt(lead0.pct)}%</b><em>${
            lead0.pct>=50?'większość w I turze':'idzie do dogrywki'}</em></div>
        </div>`
       :`<div class="noccpusto" id="palac-pusty">Pałac czeka. Komisje jeszcze liczą.</div>`}
    </div>

    <div class="nocplyta">
      <div class="racebox ${settled?'':'jittering'}">${
        teraz.map((x,i)=>raceBar(x,N.total,miejsce[i])).join('')}</div>
    </div>

    <div class="ekstopka">
      <span class="ekleg">meta to 50% — kto jej nie dotknie, idzie do dogrywki</span>
      <button class="btn ${settled?'':'g'}" onclick="${settled?'prezNightEnd()':'prezNightSkip()'}">${
        settled?'Przechodzę do wyników →':'Pokaż wynik od razu'}</button>
    </div>
  </div>`;
  if(!settled)setTimeout(prezNightStep,remain<=1?950:remain<=2?560:280);
}
function prezNightStep(){
  if(!G.prezNight||G.prezNight.i>=G.prezNight.frames)return;
  G.prezNight.i++;
  beep(220+G.prezNight.i*22,.05,'triangle',.025);
  liczenie(true);
  if(G.prezNight.i>=G.prezNight.frames){
    const winner=G.prezNight.rows.slice().sort((a,b)=>b.pct-a.pct)[0];
    setTimeout(()=>{if(winner&&winner.k===G.me){SFX.elect();burst(null,140,1)}else SFX.gong()},180);
    liczenie(false);
  }
  render();
}
/* Liczenie głosów przerysowuje ekran kilka razy na sekundę. Płynne przejścia pasków
   nie nadążają za taką częstotliwością i zamiast animacji widać migotanie,
   dlatego na czas liczenia je wyłączamy. */
function liczenie(wlacz){
  try{document.body.classList.toggle('licze',!!wlacz)}catch(e){}
}
function prezNightSkip(){if(G.prezNight){G.prezNight.i=G.prezNight.frames;render()}}
function prezNightEnd(){if(G.prezNight)G.prezNight.done=true;render()}
function prezScreen(){
  if(G.prezNight&&!G.prezNight.done)return prezNightScreen();
  const st=G.prezState;
  if(!st){
    const pool=prezPool(G.me);
    if(!G.prezWho)G.prezWho=pool.map(L).sort((a,b)=>(b.char*.6+b.komp*.4)-(a.char*.6+a.komp*.4))[0].n;
    app.innerHTML=ekran(`
    ${sztandar(`Kadencja ${G.term}, tydzień ${G.week} · wybory prezydenckie`,'Serwer wybiera prezydenta',
      `Kandydować może przewodniczący albo ktokolwiek z zaplecza, ale nie urzędujący premier.
       Słabe partie zwykle w ogóle nikogo nie wystawiają, więc stawka bywa krótka i faworyt
       potrafi zgarnąć grubo ponad 25% już w pierwszej turze.`,
      [[SERVER,'głosuje cały serwer'],['50%','próg pierwszej tury'],
       [pool.length,pl(pool.length,'wasz kandydat','waszych kandydatów','waszych kandydatów')],
       [Math.round(G.kp),'kapitału w kasie']])}
    <div class="card" style="margin-bottom:14px"><div class="h"><h3>Kogo wystawiasz?</h3>
      <span class="n">liczy się charyzma i kompetencja</span></div><div class="b">
      <div style="display:flex;gap:10px;flex-wrap:wrap">
      ${pool.map(n=>{const x=L(n),on=G.prezWho===n;
        return `<button class="opt" style="flex:1;min-width:190px;${on?'border-color:var(--acc)':''}"
          onclick="setPrezWho('${esc(n)}')">
          <div style="display:flex;align-items:center;gap:10px">${ava(n,me().c,40)}
          <div><b style="margin:0">${on?'✓ ':''}${n}</b>
          <span>charyzma ${x.char} · kompetencja ${x.komp}</span></div></div></button>`}).join('')}
      </div></div></div>
    <div class="card"><div class="h"><h3>Kampania ${G.prezWho}</h3><span class="n">${Math.round(G.kp)} kapitału</span></div><div class="b">
      <button class="opt" style="margin-bottom:9px" onclick="prezGo(0)"><b>Startuje bez dodatkowej kampanii</b>
        <span>Darmowe. Liczy się sondaż partii i charyzma kandydata (${L(G.prezWho).char}).</span></button>
      <button class="opt" style="margin-bottom:9px" onclick="prezGo(30)" ${G.kp<30?'disabled':''}>
        <b>Kampania za 30 kapitału</b><span>Wyraźny zastrzyk poparcia w pierwszej turze.</span></button>
      <button class="opt" style="margin-bottom:9px" onclick="prezGo(60)" ${G.kp<60?'disabled':''}>
        <b>Kampania za 60 kapitału</b><span>Bardzo mocne wsparcie. Drogo.</span></button>
      <button class="opt" onclick="prezGo(-1)"><b>Nie wystawiam nikogo</b>
        <span>Prezydentem zostanie ktoś inny, i będzie ci to utrudniał.</span></button>
    </div></div>
    ${ekstopka('prezydent daje akcję, kapitał, weto i orędzia','')}`);
    return;
  }
  const {r1,runoff,winner}=st;
  const voteTotal=G.prezNight?G.prezNight.total:null;
  const race=(list,tyt)=>`<div class="card"><div class="h"><h3>${tyt}</h3>
    <span class="n">meta to 50%, kto jej nie dotknie, idzie do dogrywki</span></div>
    <div class="b racebox">${list.map(x=>raceBar(x,voteTotal)).join('')}</div></div>`;
  if(st.stage===1&&!st.decided){
    const [a,b]=r1, mine=[a.k,b.k].includes(G.me);
    app.innerHTML=ekran(`
    ${sztandar(`Wybory prezydenckie · kadencja ${G.term} · pierwsza tura`,'Nikt nie przekroczył 50%',
      `Do drugiej tury przechodzą <b>${a.who}</b> (${G.p[a.k].ab}) i <b>${b.who}</b> (${G.p[b.k].ab}).
       Głosowanie za tydzień, do tego czasu głosy odpadłych kandydatów są do wzięcia.
       ${mine?'<b class="ok">Jesteś w grze.</b> Masz jeden tydzień, żeby dorzucić do kampanii.'
         :'Ciebie już nie ma w stawce, ale wybór prezydenta wpłynie na twoją kadencję.'}`,
      [[fmt(a.pct)+'%',a.who],[fmt(b.pct)+'%',b.who],
       [fmt(100-a.pct-b.pct)+'%','głosów do wzięcia'],[1,'tydzień do dogrywki']])}
    ${race(r1,'Wyścig o pałac, pierwsza tura')}
    ${ekstopka(mine?'jesteś w dogrywce':'dogrywka bez ciebie',
      '<button class="btn" onclick="prezWait()">Wracam do kampanii →</button>')}`);
    return;
  }
  const zw=runoff?runoff.find(x=>x.k===winner):r1.find(x=>x.k===winner);
  app.innerHTML=ekran(`
  ${sztandar(`Wybory prezydenckie · kadencja ${G.term} · ${runoff?'druga tura':'rozstrzygnięcie w pierwszej turze'}`,
    `${st.who[winner]||G.p[winner].lead} prezydentem`,
    winner===G.me?'<b class="ok">Pałac jest twój.</b> Odblokowane zostały decyzje prezydenckie.'
      :`Pałac przejmuje ${G.p[winner].n}.${G.gov&&!G.gov.parties.includes(winner)?' Rząd będzie miał z nim pod górkę.':''}`,
    [[zw?fmt(zw.pct)+'%':'—','wynik zwycięzcy'],[G.p[winner].ab,'partia prezydenta'],
     [runoff?2:1,pl(runoff?2:1,'tura','tury','tur')],[voteTotal,'oddanych głosów']])}
  <div class="nocplyta">
    ${runoff?race(runoff,'Dogrywka, dwóch na mecie'):''}
    <div style="margin-top:${runoff?'14px':'0'}">${race(r1,runoff?'Pierwsza tura, jak się tam znaleźli':'Wyścig o pałac, rozstrzygnięty od razu')}</div>
  </div>
  ${ekstopka(winner===G.me?'pałac wasz':'pałac idzie gdzie indziej',
    '<button class="btn" onclick="prezDone()">Wracam do kampanii →</button>')}`);
}
function prezGo(kp,who){
  const pool=prezPool(G.me);
  who = who || G.prezWho;
  if(kp>=0&&(!who||!pool.includes(who)))who=pool[0]||null;
  if(kp>=0&&!who)say('<b>Nie masz kogo wystawić.</b> Urzędujący premier nie może kandydować na prezydenta.','bad');
  if(kp>0)G.kp-=kp;
  const st=prezRound1(kp>=0,kp>0?kp:0,who||G.prezWho);
  st.stage=1;
  G.prezState=st;
  if(st.decided){ crownPrez(st.winner,st.who[st.winner]); }
  else {
    G.prez2={r1:st.r1,who:st.who,week:G.week+1,boost:0,spent:0};
    say(`<b>Pierwsza tura rozstrzygnięta.</b> Do drugiej idą ${st.r1[0].who} (${G.p[st.r1[0].k].ab}) i ${st.r1[1].who} (${G.p[st.r1[1].k].ab}). Zostaje tydzień.`,'roy');
  }
  prezStartNight(st.r1);
  render();
}
function prezPush(kp){
  if(!G.prez2||G.kp<kp)return;
  G.kp-=kp;G.prez2.spent+=kp;G.prez2.boost+=kp/24;
  say(`Kampania przed drugą turą: <b>${kp} kapitału</b>.`);
  close();render();
}
function runRunoff(){
  const st=prezRound2(G.prez2.r1,G.prez2.who,G.prez2.boost);
  st.stage=2;G.prezState=st;G.phase='prez';
  crownPrez(st.winner,st.who[st.winner]);
  G.prez2=null;
  prezStartNight(st.runoff);
  render();
}
function prezDone(){G.prezState=null;G.prezWho=null;G.phase='camp';render()}
function openPush(){
  const p2=G.prez2;if(!p2)return;
  modal('Druga tura','Kampania przed dogrywką',
    `<p>Głosy kandydatów, którzy odpadli, rozdzielą się według sympatii między partiami, ale kampanię
     wciąż można dołożyć. Dotychczas wydano <b>${p2.spent}</b> kapitału (przewaga +${p2.boost.toFixed(1)} pkt).</p>`,
    [40,80,140].map(v=>({l:`Dorzucam ${v} kapitału`,s:`+${(v/24).toFixed(1)} punktu w dogrywce · masz ${Math.round(G.kp)}`,
      dis:G.kp<v, f:()=>prezPush(v)}))
      .concat([{l:'Nic nie dokładam',s:'Zostawiasz to sympatiom wyborców',f:close}]))
}
function prezWait(){G.prezState=null;G.phase='camp';render()}
function setPrezWho(n){G.prezWho=n;render()}

function b64e(s){try{
  const b=new TextEncoder().encode(s);let x='';
  for(let i=0;i<b.length;i++)x+=String.fromCharCode(b[i]);
  return btoa(x)}catch(e){return ''}}
function b64d(s){try{
  const x=atob(s),b=new Uint8Array(x.length);
  for(let i=0;i<x.length;i++)b[i]=x.charCodeAt(i);
  return new TextDecoder().decode(b)}catch(e){return ''}}
const ZAPIS_WERSJA=2;
function saveCode(){
  const snap={v:ZAPIS_WERSJA,gra:WERSJA,G,CUSTOM,
    REG:REG.map(r=>({id:r.id,n:r.n,pop:r.pop,eng:r.eng,seats:r.seats,x:r.x,y:r.y,mix:r.mix,d:r.d})),
    LUP:G.lup,LEADX:Object.fromEntries(Object.keys(LEAD).filter(n=>!AVA[n]).map(n=>[n,LEAD[n]]))};
  return 'MM'+b64e(JSON.stringify(snap));
}
/* Zapis sprawdzamy, zanim cokolwiek podmienimy. Wcześniej kod z innej wersji
   wczytywał się bez słowa i wywalał grę dopiero przy pierwszym brakującym polu —
   już po nadpisaniu stanu, więc nie było do czego wrócić. */
function sprawdzZapis(s){
  const brak=[];
  if(!s||typeof s!=='object')return 'to nie jest zapis gry';
  if(!s.G||typeof s.G!=='object')return 'w kodzie nie ma stanu rozgrywki';
  const G2=s.G;
  if(!G2.p||typeof G2.p!=='object')return 'zapis nie zawiera partii';
  if(!G2.me||!G2.p[G2.me])return 'zapis nie mówi, którą partią grasz';
  ['term','week','ap','kp','en'].forEach(k=>{if(typeof G2[k]!=='number'||!isFinite(G2[k]))brak.push(k)});
  if(brak.length)return `w zapisie brakuje: ${brak.join(', ')}`;
  if(!Array.isArray(s.REG)||!s.REG.length)return 'zapis nie zawiera okręgów';
  if(s.REG.some(r=>!r||!r.id||typeof r.seats!=='number'))return 'okręgi w zapisie są uszkodzone';
  const p=G2.p[G2.me];
  if(!p.lead||!p.comp||typeof p.mem!=='number')return 'twoja partia w zapisie jest niekompletna';
  if(s.v&&s.v>ZAPIS_WERSJA)return `zapis pochodzi z nowszej wersji gry${s.gra?` (${s.gra})`:''} — zaktualizuj grę`;
  return null;
}
function loadCode(code){
  const raw=b64d(String(code||'').trim().replace(/^MM/,''));
  if(!raw)throw new Error('nieczytelny kod — sprawdź, czy skopiowałeś go w całości');
  let s;
  try{s=JSON.parse(raw)}catch(e){throw new Error('kod jest uszkodzony albo niepełny')}
  const blad=sprawdzZapis(s);
  if(blad)throw new Error(blad);
  REG.length=0;s.REG.forEach(r=>REG.push(r));
  DIST_SEATS=REG.reduce((a,r)=>a+r.seats,0);
  Object.assign(LEAD,s.LEADX||{});
  if(s.CUSTOM&&s.CUSTOM.id)registerCustom(s.CUSTOM);
  G=s.G;
  // partie dodane po powstaniu zapisu dolaczaja z wartosciami startowymi
  PID.forEach(k=>{if(!G.p[k]){
    const b=BASE[k],p2=Object.assign({},b);
    p2.aff=Object.assign({},b.aff);
    p2.pres=Object.fromEntries(REG.map(r=>[r.id,RI(4,26)]));
    p2.coal=null;p2.seats=0;p2.dead=0;p2.pact={};
    p2.comp={eli:b.comp0[0],int:b.comp0[1],ser:b.comp0[2]};
    p2.mem=p2.comp.eli+p2.comp.int+p2.comp.ser;
    p2.mom=0;p2.flow={eli:0,int:0,ser:0};
    p2.lead=LP[k].main[0];p2.bench=LP[k].bench.slice();p2.main=LP[k].main.slice();
    p2.lead2=DUO_START.includes(k)?(LP[k].main[1]||null):null; p2.lead3=null;
    G.p[k]=p2;
  }});
  PID.forEach(a=>{G.rel[a]=G.rel[a]||{};PID.forEach(b2=>{if(a!==b2&&G.rel[a][b2]===undefined)G.rel[a][b2]=RI(-8,26)})});
  G.goals=G.goals||{};G.agents=G.agents||{};G.tutSeen=G.tutSeen||{};G.sits=G.sits||[];G.polls=G.polls||[];
  /* Zapis ze starszego wydania nie zna pól, które doszły później. Bez tego gra
     wywracała się przy pierwszym kliknięciu na „G.useTerm.stery” — a to znaczy,
     że gracz tracił rozgrywkę tylko dlatego, że wyszła nowa wersja. */
  G.useTerm=G.useTerm||{};G.catUsed=G.catUsed||{};G.once=G.once||{};G.used=G.used||{};
  G.lup=G.lup||{};G.xpOs=G.xpOs||{};G.znuz=G.znuz||{};G.znuzKad=G.znuzKad||{};
  G.rada=G.rada||{};G.radaOd=G.radaOd||{};G.lawTerm=G.lawTerm||{};G.law=G.law||{};
  G.coal=G.coal||{};G.free=G.free||{eli:0,int:0,ser:0};G.king=G.king||{rel:52,paid:0};
  if(typeof G.bezRzadu!=='number')G.bezRzadu=0;
  if(typeof G.xp!=='number')G.xp=0;
  if(typeof G.prest!=='number')G.prest=0;
  if(typeof G.weeks!=='number'||G.weeks<1)G.weeks=12;
  if(typeof G.week!=='number'||G.week<1)G.week=1;
  if(G.week>G.weeks)G.week=G.weeks;      // stare zapisy potrafią mieć trzynasty tydzień
  if(!G.ptraits){G.ptraits={};if(G.traits&&G.traits.length)G.ptraits[G.p[G.me].lead]=G.traits.slice()}
  G.sejmPrez=null;G.mar=null;
  if(G.phase==='marszalek')G.phase='camp';
  if(G.noise)PID.forEach(k=>{if(G.noise[k]===undefined)G.noise[k]=0});
  return true;
}
/* Wyjście do menu głównego. Pytamy dwa razy, bo bez kodu zapisu rozgrywka przepada. */
function doLobby(){
  close();
  modal('Menu główne','Na pewno wychodzisz?',
    `<p>Wrócisz do ekranu wyboru trybu. Bieżąca rozgrywka <b>zniknie</b>, chyba że masz zapisany kod
     albo plik zapisu — wtedy wczytasz ją później dokładnie w tym miejscu.</p>
     <p class="dim" style="font-size:12.5px">Kadencja ${G.term}, tydzień ${G.week}, ${me().ab}.</p>`,
    [{l:'Tak, wychodzę do menu',s:'Rozgrywka się kończy',f:()=>{
        close();G=null;MODE=null;SCENSEL=null;CRE=null;MENU=true;render();
      }},
     {l:'Zostaję w grze',s:'Nic się nie dzieje',f:close}],close);
}
function openSave(){
  close();
  const code=saveCode();
  const v=document.createElement('div');v.className='veil';v.id='veil';
  v.innerHTML=`<div class="mdl"><button class="mdlx" type="button" aria-label="Zamknij">×</button>
    <div class="h"><div class="k">Zapis gry</div><h2>Kod zapisu</h2></div>
    <div class="bd">
      <p>Skopiuj kod i schowaj gdziekolwiek. Wklejenie go w polu niżej przywróci grę dokładnie w tym miejscu ,
      kadencję, skład partii, relacje, ustawy, okręgi i wszystko inne.</p>
      <textarea class="ta" id="sc" style="min-height:110px;font-family:var(--m);font-size:11px" readonly>${code}</textarea>
      <div style="font-size:12px;color:var(--dim2);margin:4px 0 14px">Długość: ${code.length} znaków · kadencja ${G.term}, tydzień ${G.week}, ${me().ab}</div>
      <div style="font-family:var(--m);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--acc);margin-bottom:7px">Wczytaj zapis</div>
      <textarea class="ta" id="lc" style="min-height:80px;font-family:var(--m);font-size:11px" placeholder="Wklej kod zaczynający się od MM..."></textarea>
      <div id="lerr" style="font-size:12.5px;color:var(--neg);margin-top:6px"></div>
    </div>
    <div class="op">
      <button class="opt" id="cp"><b>Kopiuję kod</b><span>Zaznacza całość, żeby wcisnąć Ctrl+C</span></button>
      <button class="opt" id="ld"><b>Wczytuję wklejony zapis</b><span>Podmienia bieżącą rozgrywkę</span></button>
      <button class="opt" id="lob"><b>Wychodzę do menu</b><span>Rozgrywka przepadnie, jeśli nie masz kodu</span></button>
      <button class="opt" id="cl"><b>Wracam do gry</b><span></span></button></div></div>`;
  document.body.appendChild(v);
  v.querySelector('#lob').onclick=()=>doLobby();
  v.querySelector('#cp').onclick=()=>{const t=v.querySelector('#sc');t.focus&&t.focus();t.select&&t.select();
    try{document.execCommand&&document.execCommand('copy')}catch(e){}};
  v.querySelector('#cl').onclick=()=>{close();render()};
  v.querySelector('.mdlx').onclick=()=>{close();render()};
  v.querySelector('#ld').onclick=()=>{
    const t=v.querySelector('#lc').value;
    try{loadCode(t);close();say('<b>Zapis wczytany.</b>','good');render()}
    catch(e){v.querySelector('#lerr').innerHTML='Nie udało się wczytać: '+e.message}
  };
}
function summary(){
  const best=G.hist.reduce((a,h)=>Math.max(a,h.seats[G.me]),0);
  const pmC=G.hist.filter(h=>h.pm===G.me).length;
  modal('Podsumowanie',me().n,
   `<p>Kadencji: <b>${G.hist.length}</b> · najlepszy wynik: <b>${best} ${pl(best,'mandat','mandaty','mandatów')}</b>
    · kadencji z twoim premierem: <b>${pmC}</b> · prestiż: <b>${G.prest}</b>.</p>
    <p>Lider: <b>${me().lead}</b>. Członków: <b>${me().mem}</b>. Gra się nie kończy.</p>`,
   [{l:'Gram dalej',s:'Wracasz do gry',f:close},
    {l:'Kod zapisu',s:'Skopiuj i wróć do tej rozgrywki kiedy indziej',f:()=>{close();openSave()}},
    {l:'Nowa gra',s:'Wybór partii od początku',f:()=>{close();G=null;render()}}])}
function dead(){
  app.innerHTML=ekran(`${sztandar('Koniec',
    G.deadWhy==='samorozwiazanie'?'Partia rozwiązana':['elita','kontrowersja','dlugi','krol'].includes(G.deadWhy)?'Administracja rozwiązała partię':'Partia przestała istnieć',
    ({
      kontrowersja:`Kontrowersja doszła do 100. Administracja uznała ${me().n} za źródło ciągłej awantury i zamknęła kanały partii.`,
      dlugi:`Kapitał polityczny spadł do ${Math.round(G.kp)}. Partia utonęła w długach, nikt już nie chciał finansować kampanii, a wierzyciele rozeszli się do konkurencji.`,
      samorozwiazanie:`<b>${me().lead}</b> postanowił rozwiązać partię przez znikomą sławę i aktywność. Kanał zamilkł na dobre, zero rozgłosu, zero ruchu, nikt już nie miał po co zostawać.`,
      elita:`Elita stanowiła ${Math.round(ratio(me(),'eli')*100)}% składu i kontrowersja wymknęła się spod kontroli.`
    })[G.deadWhy] || `${me().n} rozwiązana w kadencji ${G.term}, tydzień ${G.week}. Kanał zarchiwizowany, rola usunięta, nikt nie napisał pożegnalnego posta.`,
    [[G.term,pl(G.term,'kadencja','kadencje','kadencji')],[G.week,'tydzień'],
     [Math.round(me().mem),'osób w partii'],[Math.round(G.xp||0),'dorobku']])}
  ${ekstopka('koniec tej rozgrywki','<button class="btn" onclick="newRun()">Od nowa</button>')}`)}

/* ---- eksport uchwytów ---- */
Object.assign(window,{grupyTab,zadowolenie,radykalowie,grupaWobecUstawy,iskra,setSoczewka,SOCZEWKI,waznePozycje,waznePasek,modyfikatory,podejrzyjScen,menuIdz,backToMenu,opisTrybu,mediaNumer,mediaKup,mediaNazwij,mediaSzef,mediaOdcinek,mediaFilm,slepyLos,kreWyjdz,kreatorDoPliku,kreatorDane,kreatorEkran,wczytajScenPlik,zapiszScenPlik,podglad,przewidz,start,pickParty,danina,openSave,doLobby,tryLoadFromSetup,marContinue,marDeclare,setMarWho,setHemi:m=>{G.hemiMode=m;render()},endWeek,runElection,doAct,sendTeam,tryGov,goOpo,summary,tg,pay,buyTrait,buyStat,openPush,prezPush,prezWait,togList,makeList,joinList,leaveList,resetLists,aiCoal,listWill,renameBloc,shortFree,opoCard,opoParties,makeOpo,joinOpo,leaveOpo,modalName,actBack,openWerb,openWerb2,werbDo,werbChance,werbPool,openCreator,crClose,crSet,crSetR,crAdj,crImg,crRel,crPoach,crTake,crPeople,crFinish,creator,registerCustom,crCostOf,crMem,doGoal,goalTab,myGoals,goalReady,goalOk,switchIdentity,libBecome,hasLib,hasLib2,hasPost,hasLsd,hasKan,hasRob,hasPer,applyGoals,goalDone,GOALS,aiGoals,adsBecome,hasAds,hasHor,apBase,
  openTrain,openRecruit,pmPick,pmVote,pmNext,afterPM,prezGo,prezDone,setPrezWho,
  openStery,sterySet,steryTog,steryOk,openDym,mojeResorty,mogeZglosic,rozwiazChance,LAWS,RESORTY,radaKto,openCamp,campBar,
  pokazPatch,patchZamknij,naborTog,naborPublikuj,setLeadSel,
  openResort,startLaw,signLaw,premierTab,prezydentTab,
  closeFinalCamp,runFinalCamp,openEdycja,edytSet,edytOk,
  /* _we to jednorazowa flaga animacji wejścia. Ekran przerysowuje się po każdej
     decyzji, więc gdyby karty wjeżdżały za każdym razem, gra migałaby przy każdym
     kliknięciu. Animacja ma się odpalić tylko przy realnej zmianie widoku. */
  setTab:k=>{if(G.tab!==k)G._we=1;G.tab=k;G.fx='';if(G&&G.tutSeen)G.tutSeen[k]=1;render()}, setCat:c=>{G.cat=c;G.fx='';render()}, setFx:f=>{G.fx=f;render()},
  signAgent,agentCost,agentFree,AGENTS,render,
  ekonomiaTab,kapitalTab,kapPryw,kapPrywRazem,podzialMajatku,kasa,kasaSkrot,
  rolaOsoby,pkbTydzien,pkbLicz,pkbMnoznik,pkbCzynniki,stawkaMajatkowa,
  wszyscyZaplecze,alive,openZrzutka,zrzutkaWez,zrzutkaDaje,aiZrzutka,
  stolWpis,stolZatwierdz,zarobekLidera,zarobekTydzien,pkbWykres,openWariant,wariantyUstawy,wariantPo,
  majatekSzefa,panelGlosowania,nextCandidate,pkbZapiszOdczyt,
  RANGI,ranga,rangaNr,nastepnaRanga,mnoznikRangi,rangiStart,sprawdzRangi,absolutorium,
  rangaKoszt,rangaWymog,oknoAbsolutorium,sadTab,sadSklad,nagranieStart,liveLap,DANINA_ZA_PUNKT,NAGR_TRYBY,
  mediaTab,mediaKup,mediaNazwij,mediaSzef,mediaOdcinek,mediaFilm,mediaTydzien,mediaBilans,
  zasiegMediow,aiMedia,dlugTydzien,kieszenSzefa,MEDIA_ZASIEG,MEDIA_UTRZYMANIE,absWeek,tally,
  mediaOdcinekGraj,mediaFilmGraj,serduszka,MEDIA_TYP,nagranieMAN,mediaNumer,mediaGotowe,mediaZa,mediaJest,
  setSel:s=>{G.sel=s;render()}, newRun:()=>{G=null;MODE=null;SCENSEL=null;MENU=true;render()}, nightStep,nightSkip,nightEnd,startNight,prezNightSkip,prezNightEnd,raport,kurier,toggleMute,pickScen,scenScreen,SCEN,openKreator,kreSet,kreEf,krePartia,krePole,kreWyczysc,KRE_PARTIA,kreatorZapisz,openMody,modUsun,burst,shake,histChart,histPush,SFX,graj,stopMuzyka,coGra,MUZYKA,fxFlush,statTip,streakMul,sitTick,sitBanner,sitActive,SITS,sitKraniecChoice,sitROMChoice,pickMode,backToMode,tutNext,tutSkip,startTutorial,tutBox});
window.__game={przewidz,podglad,get PROBA(){return PROBA},
  get KRE(){return KRE}, SCEN, kreatorDane,
  myGoals,goalDone,goalOk,signAgent,agentFree,agentCost,agenciZostalo,AGENCI_NA_KADENCJE,
  openDym,pusteResorty,openZmiana,openPrzekup,cenaDzialacza,ministerStaz,ministerBlokada,mojeResorty,
  zawiedzeniKoalicjanci,demografiaSerwera,SERVER,SERVER_MAX,AGENTS,mogeZglosic,rozwiazChance,radaKto,RESORTY,pmOsoba,pmOsoby,leads,roster,
  aiTransfery,aiOpozycja,aiObsadzRade,aiRekonstrukcja,znuzenie,hegemon,resortyPartii,leadWybrany,aiPlan,ustawPlany,
  rozliczenieKadencji,sprawdzZapis,doganianie,repChetni,BAL,saveCode,loadCode,
  PATCHNOTE,patchDoPokazania,pokazPatch,ustawWersje,get WERSJA(){return WERSJA},
  naborOcena,panelGlosowania,KLOCKI,
  openWywiad,wywiadOdp,wywiadOczekiwany,WYWIAD_PYT,
  openPrzekupstwo,przekupSzansa,sprawczosc,zwlokaPrezydenta,ZWLOKA_MAX,
  newGame,endWeek,runElection,tally,allocate,aiGov,startTerm,startPM,doPMVote,pmFailForward,
  localScore,openRecruit,openTrain,collapseGov,makeBlocs,prezPool,drawFrom,giveBack,purge,eliteRisk,ratio,syncCoal,prezDone,makeNoise,XP,
  giveBackCap,prezRound1,prezRound2,runRunoff,memberFlow,prezWait,prezPush,openPush,crownPrez,hemi,pmBlocked,rotateBench,AVA,TEM,INNATE,conflictOf,buyTrait,buyStat,inflacja,inflacjaProc,INFLACJA_PROG,traitsOf,xpOs,xpPula,COMBO,ostatniWynik,hasCen,hasHeg,LOGOS,applyGoals,checkDeath,isPMperson,isPrezPerson,income,EV,wotumChance,prezGo,A,fire,me,topSeg,sejmVote,setGov,PID,REG,SEG,SID,BASE,COAL,LP,LEAD,THR,
  TOPUP,DIST_SEATS,TOTAL_SEATS,MAJ,accepts,thrFor,
  radar,feed,runDateAnim,gameDate,dateStr,mapTab,actTab,pollTab,partieTab,sejmTab,leadTab,kingTab,sidebar,setup,pmScreen,prezScreen,marScreen,startMar,marContinue,marDeclare,isMar,isWice,isMarPerson,ownPool,bestRep,runRace,raceScore,results,TRAITS,sizeF,shown,enGain,pickMain,kingScore,kingFactors,kingFav,allBlocs,rebalanceSeats,isLead,lead,L,innAll,GOALS,openStery,sterySet,steryTog,steryOk,creditsBox,AUTORZY,WERSJA,
  LAWS,lawVote,proposeLaw,signLaw,odrzucenieWeta,PROG_WETO,applyLaw,lawDone,lawIntake,lawsPending,lawsToSign,startLaw,
  LAWPAR,lawEdytowalna,lawParams,radykalnosc,aiProposeLaw,openEdycja,rozstrzygnijUstawe,
  nastrojSejmu,bylWBloku,doLobby,rysujOkno,
  CHAR,charOf,aiWagi,aiLos,aiOkreg,aiCel,ai,POSTERS,aiCoal,aiGoals,aiAgents,campInit,aiPrzemiana,obsadz,openResort,partiaOsoby,premierTab,prezydentTab,TOTAL_SEATS_LIVE,
  openCamp,campBar,campRank,runFinalCamp,closeFinalCamp,
  get G(){return G}, setRender(f){render=f}, setModal(f){modal=f},
  MODY:()=>MODY, ustawMody:v=>{MODY=Array.isArray(v)?v:[]}, wczytajMody, modEfekty, modyDoScen};
render();
/* Mody dociągamy po pierwszym rysowaniu: most do Pythona wstaje chwilę po stronie,
   a ekran wyboru scenariusza i tak przerysuje się, gdy lista dojdzie. */
if(typeof window!=='undefined'){
  const sprobujMody=(ile)=>{
    const a=window.pywebview&&window.pywebview.api;
    if(a&&a.mody)wczytajMody().then(()=>{if(MODY.length)render()});
    else if(ile>0)setTimeout(()=>sprobujMody(ile-1),400);
  };
  setTimeout(()=>sprobujMody(12),300);
}
})();
