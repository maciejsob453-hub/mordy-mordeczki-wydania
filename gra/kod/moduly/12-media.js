'use strict';
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
    d:'Najdroższa sala na serwerze. Rejestrujesz i emitujesz seanse istniejących filmów — widownia rośnie, gdy partia ma o czym mówić.'},
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
const mediaBilansPasek=m=>{
  const v=Math.max(-1,Math.min(1,(m&&m.bilans||0)/Math.max(1,MEDIA_TYP[m.typ]?.koszt||1)));
  return `<span class="medbilans" title="Bilans szyldu"><i style="width:${Math.round(Math.abs(v)*50)}%;${v<0?'margin-left:50%;background:var(--neg)':'margin-left:'+(50-(Math.abs(v)*50))+'%;background:var(--pos)'}"></i></span>`;
};

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
  /* Czytelnik musi dostać powód, redakcja ma ograniczoną przepustowość, a
     sufit rośnie powoli z rozmiarem partii. Sława sama nie drukuje serc. */
  const sufit=6+Math.sqrt(Math.max(1,p.mem))*3.2;
  return Math.round(cl(p.cred*.30+ld.komp*.14+(m.staz||0)*.35+p.fame*.03-18,0,sufit));
}
/* Ile serduszek zbierze NASTĘPNY numer — to jest prognoza, a nie stan konta. */
function serduszkaProg(m){
  const p=me(), ld=L(m.szef)||{komp:50};
  const sufit=6+Math.sqrt(Math.max(1,p.mem))*3.2;
  return Math.round(cl(p.cred*.30+ld.komp*.14+(m.staz||0)*.35+p.fame*.03-18,0,sufit));
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
  SFX.coin();
  say(`<b>${t.n}</b> ruszyło. ${szef} wyłożył ${kasaSkrot(t.koszt)}.`,'good');
  close();render();
}
function mediaNazwij(i){
  const m=mediaMoje()[i]; if(!m)return;
  /* Własne okno, bo modalName jest od bloków wyborczych i wymaga listy partii —
     podanie mu null wywracało się na pierwszym odwołaniu i nazwy nie dało się
     zmienić w ogóle. */
  SFX.modal();close();
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
  SFX.media();
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
  SFX.media();
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
  modal('Kino','Co dziś emitujesz',
    `<p>Nie produkujesz filmu. Rejestrujesz seans i wypuszczasz go pod swoim szyldem.
     Na widownię przychodzi tym więcej ludzi, im głośniej o twojej partii.
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
  SFX.media();
  p.fame=cl(p.fame+Math.min(5,widz/11));
  say(`<b>${m.nazwa}:</b> „${f.n}” obejrzało ${widz} osób. Wpływ ${kasaSkrot(zysk)}.`,'good');
  modal('Kino',m.nazwa,
    `<div class="wypodsum">
       <div><b>${widz}</b><span>widzów</span></div>
       <div><b>${kasaSkrot(zysk)}</b><span>wpływ</span></div>
       <div><b>${kasaSkrot(m.bilans)}</b><span>bilans wydawnictwa</span></div>
     </div>
      <p>Na zarejestrowany seans „${f.n}” przyszło ${widz} osób — tyle, ile dziś warta jest twoja sława.</p>`,
    [{l:'Dobrze',f:()=>{close();render()}}]);
}
function mediaTab(){
  const p=me(), szef=p.lead, maj=kapPryw(szef);
  if(!mediaJest())return `
    <div class="card sadzamkniety mediazamkniete"><div class="h"><h3>Media</h3><span class="n">nie istnieją</span></div><div class="b">
      <div class="sadhero"><span>OPINIA PUBLICZNA</span><h2>Najpierw potrzebna jest ustawa</h2>
        <p>Gazety, telewizja i kino nie są dekoracją. Ustawa o mediach otworzy listy wydawnictw,
        ich bilanse, widownię i wpływ na sondaże.</p></div>
      <div class="note" style="margin:12px 0 0">Projekt zgłasza premier albo minister
      <b>Kultury i Rozrywki</b>. Po uchwaleniu dział odblokuje się sam.</div>
      <button class="btn" onclick="setTab('premier')">Idę do Kancelarii premiera</button>
    </div></div>`;
  const lista=mediaMoje();
  const rynek=alive().filter(k=>k!==G.me).flatMap(k=>((G.aiMedia&&G.aiMedia[k])||[]).map(m=>({k,m})))
    .sort((a,b)=>zasiegMediow(b.k)-zasiegMediow(a.k));
  return `
  <div class="ekoblok mediaekran">
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
                     kino:['mediaFilm','Zarejestruj seans']}[m.typ];
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
          ${mediaBilansPasek(m)}
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

    <div class="card"><div class="h"><h3>Rynek mediów</h3>
      <span class="n">${rynek.length} cudzych ${pl(rynek.length,'szyld','szyldy','szyldów')}</span></div><div class="b">
      ${rynek.length?`<div class="ekolista medrynek">${rynek.map(({k,m})=>`<div class="ekos medw">
        <span class="mede">${MEDIA_TYP[m.typ].e}</span>
        <span class="ekon">${esc(m.nazwa)}<em class="ekotag">${G.p[k].ab} · ${esc(m.szef)} · ${m.numery||0} ${pl(m.numery||0,'wydanie','wydania','wydań')}</em></span>
        <span class="medserca">zasięg ${zasiegMediow(k).toFixed(1).replace('.',',')}%</span>
        <b class="ekow ${m.bilans>=0?'plus':'minus'}">${m.bilans<0?'−':'+'}${kasaSkrot(Math.abs(m.bilans||0))}</b>
      </div>`).join('')}</div>`:'<p class="dim" style="margin:0">Ustawa dopiero ruszyła. Partie potrzebują najwyżej kilku tygodni, żeby otworzyć pierwsze redakcje.</p>'}
    </div></div>
  </div>`;
}
