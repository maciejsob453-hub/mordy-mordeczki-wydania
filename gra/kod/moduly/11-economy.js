'use strict';
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
  // Zaplecze ma wpływ, ale nie przebija serwerowych fortun. Najbogatsi są
  // wyjątkiem; osoby z drugiego szeregu pozostają wyraźnie niżej.
  'kenzo':24e6, 'Supernes':14e6, 'Mnem':9e6, 'Aryati':16e6,
  // liderzy bez fortuny — kilkanaście milionów i tyle
  'Kromka':7.4e6, 'Vengeance':11e6, 'Maciek':9.2e6, 'impir':6.8e6, 'inwid':6.1e6,
  'Fazmiś':13e6, 'Kaziu':4.9e6, 'Sulejman':3.6e6, 'Peterdeus':12e6, 'Lager':10.5e6,
};
const KAP_POLKA={lider:14e6, glowny:1.5e6, zaplecze:30e3, wolny:2600};
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
  /* Gospodarka nie spada od losowego „pecha”. Ten ujemny czynnik pochodzi
     wyłącznie z konkretnych złych ruchów: przegranej ustawy, paraliżu rządu,
     ostrej afery albo nieudanej decyzji. Każdy cios wygasa po kilku tygodniach. */
  const ciosy=(G.pkbCiosy||[]).filter(x=>x&&(+x.do||0)>=absWeek());
  const karaCiosow=ciosy.reduce((a,x)=>a+Math.max(0,+x.sila||0),0);
  return [
   {n:'Minister finansów', v:(kompMF-55)*.20, o:mf?`${mf}, kompetencja ${kompMF}`:'wakat na resorcie'},
   {n:'Premier',           v:(kompPM-55)*.14, o:pm?`${pm}, kompetencja ${kompPM}`:'brak rządu'},
   {n:'Stabilność',        v:(stab-ktr)*.34+(G.gov&&G.pmOk?4:-9),
    o:`kontrowersja ${Math.round(ktr)} z ${stab} progu${G.gov&&G.pmOk?', rząd stoi':', rządu nie ma'}`},
   {n:'Inwestycje',        v:(akt-inw)*.30, o:`aktywność ${Math.round(akt)} z ${inw} progu`},
   /* Zadowolenie jest ważne dla frekwencji i sondażu, ale nie jest już
      darmowym mnożnikiem PKB. Sama ustawa podatkowa nie może dawać +9 do
      obrotu tylko dlatego, że ktoś nazwał ją „zadowoleniem”. */
   {n:'Poparcie rządu',    v:G.gov?(G.gov.appr-50)*.22:-7,
    o:G.gov?`rząd ma ${Math.round(G.gov.appr)} poparcia`:'nie ma rządu, nie ma zaufania'},
   {n:'Skutki złych decyzji',v:-karaCiosow,
    o:ciosy.length?ciosy.map(x=>x.opis||'błędna decyzja').join(', '):'brak aktywnych szkód'},
  ];
}
/* Jedno wejście dla wszystkich działań, które psują obrót. Waga 1 to lekki
   zgrzyt, 6 to kryzys widoczny w PKB przez kilka tygodni. */
function pkbCios(typ,sila,opis,tygodnie=3){
  if(PROBA||!G)return;
  if(!Array.isArray(G.pkbCiosy))G.pkbCiosy=[];
  const x={typ:String(typ||'blad').slice(0,24),sila:cl(+sila||1,0,18),do:absWeek()+Math.max(1,Math.round(+tygodnie||3)),opis:String(opis||'błędne decyzje').slice(0,120)};
  G.pkbCiosy.push(x);if(G.pkbCiosy.length>24)G.pkbCiosy=G.pkbCiosy.slice(-24);
  say(`<b>Gospodarka odczuwa skutki.</b> ${esc(x.opis)} (−${x.sila} do mnożnika przez ${Math.max(1,x.do-absWeek())} tyg.).`,'bad');
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
  radykalowieWszystkim();             // każda partia płaci za własny rozjazd
  mediaTydzien();                    // wydawnictwa naliczają swoje koszty stałe
  dlugTydzien();                     // kto wszedł pod kreskę, ten zaczyna tonąć
  sprawdzRangi();                    // kto przekroczył próg, ten awansuje i płaci wpisowe
  pkbZapiszOdczyt();
  if(Array.isArray(G.pkbCiosy))G.pkbCiosy=G.pkbCiosy.filter(x=>x&&(+x.do||0)>absWeek());
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
  const udzielone=zm>=0, mocne=zm>=12, krytyczne=zm<=-10;
  const zmiany=[];
  if(udzielone){
    const cred=mocne?8:4,fame=mocne?5:2;
    pmP.cred=cl(pmP.cred+cred);pmP.fame=cl(pmP.fame+fame);
    zmiany.push(['Wiarygodność',cred],['Sława',fame]);
    if(mocne){pmP.uni=cl(pmP.uni+3);G.prest=(G.prest||0)+8;if(pmK===G.me)G.kp+=12;zmiany.push(['Jedność',3],['Prestiż',8],['Kapitał partii',12])}
  }else{
    // spadek: wszystko w dół, ale proporcjonalnie do tego, jak głęboko
    const s=Math.min(6,Math.abs(zm)/4);
    const d=[['Wiarygodność',-(3+s*2.4),'cred'],['Sława',-(2+s*1.6),'fame'],
             ['Jedność',-(2+s*2.0),'uni'],['Aktywność',-(1+s*1.4),'act'],
             ['Kontrowersja',(3+s*2.8),'ctr']];
    d.forEach(([n,v,k])=>{const w=Math.round(v);pmP[k]=cl(pmP[k]+w);zmiany.push([n,w])});
    G.gov.appr=cl(G.gov.appr-Math.round(4+s*3));
    zmiany.push(['Poparcie rządu',-Math.round(4+s*3)]);
    if(krytyczne){
      const odpływ=Math.min(8,Math.max(2,Math.ceil(Math.abs(zm)/5)));
      const q=typeof giveBackCap==='function'?giveBackCap(pmP,Math.max(1,Math.round(pmP.mem*odpływ/100))):{eli:0,int:0,ser:0};
      const l=q.eli+q.int+q.ser;G.prest=Math.max(0,(G.prest||0)-10);G.kp=Math.max(0,G.kp-15);
      if(l)zmiany.push(['Odpływ z partii',-l]);zmiany.push(['Prestiż',-10],['Kapitał partii',-15]);
    }
  }
  G.absolutorium={term:G.term,zm,udzielone,pm:pmK,szef,start,koniec,zmiany};
  say(pmK===G.me
    ?(udzielone?`<b>Sejm udzielił absolutorium.</b> PKB przez kadencję ${G.term} urosło o ${zm.toFixed(1)}%. ${mocne?'To mocny mandat zaufania — nagrody są pełne.':''}`
              :`<b>Sejm odmówił absolutorium.</b> PKB spadło o ${Math.abs(zm).toFixed(1)}%, ${szef} obrywa za gospodarkę. ${krytyczne?'Straty są krytyczne: odpływ ludzi, prestiżu i kapitału.':''}`)
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
       ? (a.zm>=12?'Mocny wzrost gospodarczy daje pełne premie i zapisuje premiera jako budowniczego kadencji.':'Gospodarka urosła, więc sejm zatwierdza rozliczenie.')
       : (a.zm<=-10?'Krytyczny spadek uruchamia odpływ ludzi i ciężar polityczny na następną kadencję.':'To nie jest wotum nieufności — rząd stoi dalej, ale wynik zostaje w kronice.')}</p>`,
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
const AI_MEDIA_NAZWY={
  gazeta:['Kurier','Dziennik','Trybuna','Głos'],
  tv:['Telewizja','Studio','Kanał','Wizja'],
  kino:['Kino','Film','Ekran','Wytwórnia'],
};
function aiNazwaMedia(k,typ,nr){
  const p=G.p[k], pula=AI_MEDIA_NAZWY[typ]||['Media'];
  const rdzen=pula[(PID.indexOf(k)+(nr||0))%pula.length];
  return `${rdzen} ${p.ab}`;
}
function aiMedia(k){
  if(!mediaJest())return;
  if(!G.aiMedia)G.aiMedia={};
  if(!G.aiMediaPlan)G.aiMediaPlan={};
  if(!G.aiMedia[k])G.aiMedia[k]=[];
  const p=G.p[k]; if(!p||p.dead)return;
  const szef=p.lead, moje=G.aiMedia[k], teraz=absWeek();
  moje.forEach((m,i)=>{if(!m.nazwa||/[📰📺🎬]$/.test(m.nazwa))m.nazwa=aiNazwaMedia(k,m.typ,i)});
  const profil=aiProfil(k),limit=profil.media>.78?3:profil.media>.42?2:1;
  if(G.aiMediaPlan[k]===undefined)G.aiMediaPlan[k]=teraz+RI(0,Math.max(1,Math.round(3-profil.media*2)));

  /* Bot zawsze zaczyna od gazety, a droższe formaty dokłada dopiero później.
     Losowa szansa zakupu sprawiała, że część partii przez całe kadencje nie robiła
     nic; plan tygodniowy jest widoczny, przewidywalny i nadal zależy od pieniędzy. */
  if(moje.length<limit&&teraz>=G.aiMediaPlan[k]){
    const maj=kapPryw(szef);
    const kolejnosc=['gazeta','tv','kino'];
    const chce=kolejnosc.find(t=>!moje.some(m=>m.typ===t)&&maj>=MEDIA_TYP[t].koszt*1.18);
    if(chce){
      const koszt=MEDIA_TYP[chce].koszt;
      G.kapPryw[szef]=Math.round(maj-koszt);
      const nazwa=aiNazwaMedia(k,chce,moje.length);
      moje.push({typ:chce,nazwa,szef,bilans:0,staz:0,serca:0,numery:0,
                 ostatnio:0,ostatnieWyd:-99});
      G.aiMediaPlan[k]=teraz+RI(Math.max(2,Math.round(7-profil.media*4)),Math.max(3,Math.round(9-profil.media*4)));
      say(`<b>${p.ab} zakłada ${nazwa}.</b> ${szef} wyłożył ${kasaSkrot(koszt)}.`,'');
    }else G.aiMediaPlan[k]=teraz+2;
  }

  // Każdy szyld płaci koszty i publikuje, gdy kończy mu się przerwa.
  moje.forEach(m=>{
    m.staz=(m.staz||0)+1;
    const utrz=MEDIA_UTRZYMANIE[m.typ]||0;
    m.bilans=(m.bilans||0)-utrz;
    G.kapPryw[m.szef]=Math.round((G.kapPryw[m.szef]!==undefined?G.kapPryw[m.szef]:kapPryw(m.szef))-utrz);
    if(teraz-(m.ostatnieWyd!==undefined?m.ostatnieWyd:-99)<MEDIA_PRZERWA[m.typ])return;
    const ld=L(m.szef)||{komp:50,char:50};
    const skala={gazeta:.9,tv:1.6,kino:1.9}[m.typ]||1;
    const zysk=Math.max(12000,Math.round((p.cred*.5+p.act*.4+ld.komp*.3-18)*skala*22000*R(.7,1.3)));
    m.bilans+=zysk;m.ostatnio=zysk;m.ostatnieWyd=teraz;m.numery=(m.numery||0)+1;
    m.serca=m.typ==='gazeta'?Math.max(1,Math.round((p.cred+ld.komp+m.staz)/14)):m.serca;
    m.widz=m.typ==='gazeta'?0:Math.max(3,Math.round((p.act+p.fame+ld.char)/9*skala));
    G.kapPryw[m.szef]=Math.round(G.kapPryw[m.szef]+zysk);
    p.fame=cl(p.fame+Math.min(2.5,(m.widz||m.serca||1)/16));
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
