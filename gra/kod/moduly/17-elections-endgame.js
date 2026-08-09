'use strict';
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
    const profil=aiProfil(anchor);
    if(!ch(cl(.08+profil.koalicje*.42+zagrozenie*.58,.05,.96)))return;

    const pam=aiPamiec(anchor),kand=rank.filter(k=>k!==anchor&&!used.has(k)&&G.rel[k][anchor]>=20&&G.rel[anchor][k]>=20&&ideo(k,anchor)<8&&(pam.zdrady[k]||0)<2)
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
    let los=rnd()*suma, wybor='ludzie';
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
      <span class="pill">ostatnie 24 godziny kampanii</span>
      ${G.electionAt?`<span class="dim" style="font-size:12px">Urny: <b>${dateStr(new Date(new Date(2026,7,1,8,0,0).getTime()+G.electionAt*3600000))}</b> <b>${String((8+G.electionAt%24)%24).padStart(2,'0')}:00</b></span>`:''}
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
function closeFinalCamp(){
  if(G.electionAt&&typeof G.simHour==='number'&&G.simHour<G.electionAt){
    say(`<b>Urny jeszcze zamknięte.</b> Wybory rozpoczną się ${dateStr(new Date(new Date(2026,7,1,8,0,0).getTime()+G.electionAt*3600000))} o ${String((8+G.electionAt%24)%24).padStart(2,'0')}:00.`,'roy');render();return;
  }
  G.phase='elect';G.electionAt=null;render();
}
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
  dodaj('Kontrowersja',teraz.ctr-przed.ctr,'pkt','Powyżej 96 sondaż słabnie, a paraliż kosztuje ludzi i kapitał.',teraz.ctr<przed.ctr);
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
    const rel=G.rel[k][G.me], stan=rel<0?'rel-bad':acc||zBloku?'rel-good':'rel-mid';
    return `<button class="opt coal-option ${stan} ${on?'on':''} ${zBloku?'zbloku':''}" style="--rel:${rel}" onclick="tg('${k}')">
      <b>${on?'✓ ':''}${G.p[k].ab}, ${G.p[k].lead} <span class="m dim">${G.p[k].seats} mand.</span>${
        zBloku?'<span class="tagblok">byliście w bloku</span>':''}</b>
      <span>relacja <b style="color:${rel>=30?'var(--pos)':rel<0?'var(--neg)':'#b8a67d'}">${Math.round(rel)}</b>
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
  const councilPm=G.partyCouncil&&G.partyCouncil.party===G.me&&Array.isArray(G.partyCouncil.members)&&G.partyCouncil.members.length===5;
  if(!pr.vote&&pr.cand===G.me&&councilPm&&!pr.pmPerson)return pmCouncilPersonScreen();
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
function pmCouncilPersonScreen(){
  const pr=G.pmProc,members=G.partyCouncil.members.filter(n=>!isPrezPerson(n)&&!isMarPerson(n));
  app.innerHTML=ekran(`<div class="card"><div class="h"><div class="k">RADA PARTYJNA · DESYGNACJA</div><h2>Wybierz osobę na premiera</h2></div><div class="b"><p>Twoja partia wskazała kandydata partyjnego. Teraz rada wybiera konkretną osobę z pięciu członków — dopiero potem Sejm głosuje nad jej rządem.</p><div class="council-primary-grid">${members.map(n=>{const x=L(n);return `<button class="opt" onclick="pmPickPerson('${esc(n)}')"><div style="display:flex;align-items:center;gap:10px">${ava(n,me().c,42)}<span><b>${n}</b><small>autorytet ${x.autor} · kompetencja ${x.komp} · charyzma ${x.char}</small></span></div></button>`}).join('')}</div><p class="dim" style="margin-top:12px">Desygnacja ${pr.round} z 3 · kandydat partyjny pozostaje ${G.p[G.me].ab}.</p></div></div>`);
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
function pmPick(k){
  const council=G.partyCouncil&&G.partyCouncil.party===G.me&&Array.isArray(G.partyCouncil.members)&&G.partyCouncil.members.length===5;
  if(k===G.me&&council){G.pmProc.cand=k;G.pmProc.pmPerson=null;render();return}
  doPMVote(k,undefined)
}
function pmPickPerson(n){
  const pr=G.pmProc,council=G.partyCouncil&&G.partyCouncil.party===G.me&&Array.isArray(G.partyCouncil.members)&&G.partyCouncil.members.length===5;
  if(!pr||pr.cand!==G.me||!council||!G.partyCouncil.members.includes(n))return;
  G.partyCouncil.pm=n;G.partyCouncil.pmParty=G.me;pr.pmPerson=n;doPMVote(G.me,undefined);
}
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
        let x=rnd()*sw,pickR=from[0];
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
   Serwer męczy się twarzą władzy: premierem i prezydentem. Sam koalicjant nie
   dostaje tej kary, bo nie prowadzi państwa. Po zejściu z obu urzędów ślad znika
   z czasem. */
function mialNajwyzszyUrzad(k){
  return !!((G.gov&&G.pmOk&&G.gov.pm===k)||(G.prez&&G.prez.party===k)||
    (G.hist||[]).some(h=>h&&h.pm===k)||(G.prezHist||[]).some(h=>h&&h.winner===k));
}
function znuzenie(k){
  if(!G.znuz)return 0;
  /* Naprawa starych zapisów: koalicjantom naliczano karę mimo braku urzędu.
     Zerujemy ją tylko partii, która nigdy nie miała premiera ani prezydenta. */
  if(G.znuz[k]&&!mialNajwyzszyUrzad(k)){
    G.znuz[k]=0;if(G.znuzKad)G.znuzKad[k]=0;
  }
  return G.znuz[k]||0;
}
function naliczZnuzenie(){
  if(!G.znuz)G.znuz={};
  const g=G.gov;
  alive().forEach(k=>{
    const premier=!!(g&&G.pmOk&&g.pm===k);
    const prezydent=!!(G.prez&&G.prez.party===k);
    let d;
    if(premier)d=BAL.znuzeniePremier;
    else if(prezydent)d=BAL.znuzeniePrezydent;
    else d=BAL.znuzenieOpozycja;      // bez najwyższego urzędu partia odpoczywa
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
  if(moje>=48&&(isPM()||hasPrez()))
    say(`<b>Serwer ma cię dość.</b> Tak długo trzymasz najważniejszy urząd, że zmęczenie władzą zjada ci ${Math.round(moje/2.9)}% poparcia. Czas bez fotela premiera i prezydenta je zmywa.`,'bad');
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
  G.once.ordynacja=0;G.useTerm={};G.camp=null;G.campPoster=null;G.electionAt=null;
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
  const noise=rows.map(()=>rnd()+.15);
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
function partyCouncilNeedsPrimary(){
  return !!(G&&me()&&me().councilMode&&G.partyCouncil&&G.partyCouncil.party===G.me&&Array.isArray(G.partyCouncil.members)&&G.partyCouncil.members.length===5&&G.partyCouncil.primaryTerm!==G.term);
}
function partyCouncilPrimaryScreen(){
  const members=G.partyCouncil.members;
  app.innerHTML=ekran(`<div class="card"><div class="h"><div class="k">RADA PARTYJNA · PRAWYBORY</div><h2>Wybierz kandydata na prezydenta</h2></div><div class="b"><p>Rada Partyjna wystawia jedną osobę. Dopiero potem zaczyna się właściwa kampania i wybory całego serwera.</p><div class="council-primary-grid">${members.map(n=>{const x=L(n);return `<button class="opt" onclick="partyCouncilChoosePrimary('${esc(n)}')"><div style="display:flex;align-items:center;gap:10px">${ava(n,me().c,42)}<span><b>${n}</b><small>charyzma ${x.char} · kompetencja ${x.komp}</small></span></div></button>`}).join('')}</div></div></div>`);
}
function partyCouncilChoosePrimary(n){
  if(!partyCouncilNeedsPrimary()||!G.partyCouncil.members.includes(n))return;
  G.partyCouncil.primary=n;G.partyCouncil.primaryTerm=G.term;G.prezWho=n;
  say(`<b>Prawybory Rady Partyjnej.</b> ${n} otrzymuje nominację na prezydenta.`,'roy');render();
}
function prezScreen(){
  if(G.prezNight&&!G.prezNight.done)return prezNightScreen();
  if(partyCouncilNeedsPrimary())return partyCouncilPrimaryScreen();
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
  const snap={v:ZAPIS_WERSJA,gra:WERSJA,G,CUSTOM,SCEN_PARTIES:SCEN_PARTY_DEFS,SCEN_GOALS:SCEN_GOAL_DEFS,SCEN_EDITS:SCEN_EDIT_DEFS,
    REG:REG.map(r=>({id:r.id,n:r.n,pop:r.pop,eng:r.eng,seats:r.seats,x:r.x,y:r.y,mix:r.mix,d:r.d})),
    LUP:G.lup,LEADX:Object.fromEntries(Object.keys(LEAD).filter(n=>!AVA[n]).map(n=>[n,LEAD[n]]))};
  return 'MM'+b64e(JSON.stringify(snap));
}
