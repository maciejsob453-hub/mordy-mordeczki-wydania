'use strict';
/* ── SĄD ──
   To osobna gałąź władzy, a nie dekoracja pod Sejmem. Ustawa określa wielkość
   składu, niezależność od partii i surowość. Każde nazwisko przechodzi przez
   głosowanie izby, a każda sprawa kończy się imiennym głosem sędziów i karą. */
const SAD_ZARZUTY={
  urzad:{n:'Nadużycie urzędu',d:'Wykorzystanie stanowiska lub administracji do walki partyjnej.'},
  korupcja:{n:'Korupcja polityczna',d:'Prywatne pieniądze i wpływy użyte do załatwienia decyzji.'},
  procedura:{n:'Naruszenie procedury',d:'Obejście regulaminu, terminów albo wyniku głosowania.'},
};
function sadInit(){
  if(!G.sad)G.sad={sedziowie:[],historia:[],odrzuceni:{},tropy:{},nr:0};
  const s=G.sad;
  s.sedziowie=Array.isArray(s.sedziowie)?s.sedziowie:[];
  s.historia=Array.isArray(s.historia)?s.historia:[];
  s.odrzuceni=s.odrzuceni||{};s.tropy=s.tropy||{};s.nr=s.nr||0;
  /* Człowiek, który odszedł z polityki, nie może wisieć na ławie jako duch. */
  s.sedziowie=s.sedziowie.filter(x=>x&&x.n&&partiaOsoby(x.n));
  return s;
}
const sadNastawy=()=>lawDone('sady')?lawParams('sady'):{sklad:3,niezaleznosc:60,surowosc:50};
function sadKandydaci(){
  const s=sadInit(), zajeci=new Set(s.sedziowie.map(x=>x.n));
  return wszyscyZaplecze().filter(n=>partiaOsoby(n)&&!zajeci.has(n)
      &&!alive().some(k=>isLead(G.p[k],n))&&!s.odrzuceni[n+'|'+G.term])
    .sort((a,b)=>(L(b).komp+L(b).autor*.45)-(L(a).komp+L(a).autor*.45));
}
function sadGlosyKandydata(nick,mojGlos){
  const pk=partiaOsoby(nick), min=radaKto('spraw'), mk=min?partiaOsoby(min):null;
  const ld=L(nick), by={};let za=0,przeciw=0,wstrzym=0;
  alive().forEach(k=>{
    const mand=G.p[k].seats;if(!mand)return;
    let v;
    if(k===G.me&&mojGlos!==undefined)v=mojGlos;
    else{
      const rel=pk&&G.rel[k]&&G.rel[k][pk]!==undefined?G.rel[k][pk]:0;
      let x=(ld.komp-50)*.7+(ld.autor-50)*.25+rel*.38+R(-18,18);
      if(k===pk)x+=55;
      if(k===mk)x+=28;
      if(G.gov&&G.gov.parties.includes(k)&&mk&&G.gov.parties.includes(mk))x+=12;
      v=x>8?'za':x<-13?'przeciw':'wstrzym';
    }
    by[k]=v;
    if(v==='za')za+=mand;else if(v==='przeciw')przeciw+=mand;else wstrzym+=mand;
  });
  return {za,przeciw,wstrzym,by,potrzeba:MAJ,ok:za>=MAJ};
}
function sadZglos(nick){
  if(!lawDone('sady')||!me().seats)return;
  const s=sadInit(), n=sadNastawy();
  if(s.sedziowie.length>=n.sklad||!sadKandydaci().includes(nick))return;
  const pk=partiaOsoby(nick), l=L(nick);
  modal('Sąd','Wybór sędziego',
    `<p>Zgłaszasz <b>${esc(nick)}</b> (${pk?G.p[pk].ab:'bezpartyjny'}). Kandydat ma
     kompetencję <b>${l.komp}</b> i autorytet <b>${l.autor}</b>.</p>
     <p class="dim" style="margin-top:10px">Sędzia potrzebuje ${MAJ} głosów całej izby.
     Minister Sprawiedliwości ma wpływ na nominację, ale nie może ominąć głosowania.</p>`,
    [{l:'Głosuję za',f:()=>{close();sadWybierz(nick,'za')}},
     {l:'Wstrzymuję się',f:()=>{close();sadWybierz(nick,'wstrzym')}},
     {l:'Głosuję przeciw',f:()=>{close();sadWybierz(nick,'przeciw')}},
     {l:'Wycofuję kandydaturę',f:close}],close);
}
function sadWybierz(nick,mojGlos,cicho){
  const s=sadInit(), w=sadGlosyKandydata(nick,mojGlos), pk=partiaOsoby(nick);
  if(w.ok)s.sedziowie.push({n:nick,partia:pk,od:absWeek()});
  else s.odrzuceni[nick+'|'+G.term]=1;
  s.historia.push({typ:'wybor',tyd:absWeek(),n:nick,partia:pk,ok:w.ok,za:w.za,przeciw:w.przeciw});
  s.historia=s.historia.slice(-16);
  if(cicho)return w.ok;
  SFX.vote();
  modal('Sejm',w.ok?'Sędzia wybrany':'Kandydatura odrzucona',
    `<p><b>${esc(nick)}</b> ${w.ok?'wchodzi do składu sądu':'nie zebrał większości'}.</p>${panelGlosowania(w)}`,
    [{l:'Rozumiem',f:()=>{close();render()}}]);
  render();return w.ok;
}
function sadZapewnijSklad(){
  if(!lawDone('sady'))return;
  const s=sadInit(), cel=sadNastawy().sklad;
  if(s.sedziowie.length>cel)s.sedziowie=s.sedziowie.slice(0,cel);
}
/* Ustawa otwiera wakaty, nie teleportuje sędziów do składu. Brakujące miejsce
   jest stanem gry, który trzeba świadomie uzupełnić głosowaniem izby. */
function sadWymagaObslugi(){
  if(!lawDone('sady'))return false;
  return sadSklad().length<sadNastawy().sklad&&sadKandydaci().length>0;
}
function sadSklad(){sadInit();return lawDone('sady')?G.sad.sedziowie.slice():[]}
function sadDowody(nick,typ){
  const k=partiaOsoby(nick), p=k?G.p[k]:null;if(!p)return 0;
  const trop=(G.sad&&G.sad.tropy&&G.sad.tropy[k])||0;
  /* Sama wysoka statystyka nie jest dowodem. Materiał powstaje po tropie z
     konkretnej decyzji albo po naprawdę skrajnym skandalu; bez tego wynik jest
     celowo za niski, żeby nie dało się skazywać losowych ludzi z listy. */
  const zdarzenie=trop>=12, skandal=p.ctr>=86;
  if(!zdarzenie&&!skandal)return 18;
  if(typ==='urzad')return Math.round(cl(24+p.ctr*.34+(G.gov&&G.gov.parties.includes(k)?10:0)+trop*1.2,25,92));
  if(typ==='korupcja')return Math.round(cl(18+p.ctr*.25+Math.log10(Math.max(10,kapPryw(nick)))*4+trop,22,90));
  return Math.round(cl(22+p.pret*.24+(100-p.cred)*.22+trop*1.05,22,90));
}
function sadOpenSprawa(nick){
  if(!lawDone('sady')||sadSklad().length<2)return;
  const k=partiaOsoby(nick);if(!k||k===G.me)return;
  modal('Sąd',`Sprawa przeciw ${esc(nick)}`,
    `<p>Wybierz zarzut. Wniesienie sprawy kosztuje <b>1 akcję i 8 kapitału</b>.
     Jeśli oskarżenie upadnie, twoja wiarygodność spadnie.</p>`,
    Object.keys(SAD_ZARZUTY).map(id=>{const z=SAD_ZARZUTY[id],d=sadDowody(nick,id);
      const podst=d>=42;
      return {l:z.n,s:podst?`${z.d} · materiał dowodowy ${d}/100`:`Brak konkretnego zdarzenia (tylko ${d}/100)`,dis:!podst||G.ap<1||G.kp<8,
        f:()=>{close();sadWnies(nick,id)}}}).concat([{l:'Rezygnuję',f:close}]),close);
}
function sadWnies(nick,typ,cicho){
  const k=partiaOsoby(nick), z=SAD_ZARZUTY[typ], sklad=sadSklad();
  if(!k||!z||sklad.length<2||(!cicho&&(G.ap<1||G.kp<8)))return;
  if(sadDowody(nick,typ)<42)return;
  if(!cicho){G.ap--;G.kp-=8;G.actedWeek=G.term+'-'+G.week}
  const n=sadNastawy(), dow=sadDowody(nick,typ), glosy=[];
  sklad.forEach(s=>{
    const ld=L(s.n), taSama=s.partia===k, moja=s.partia===G.me;
    const partyjnosc=(100-n.niezaleznosc)/100;
    const wynik=dow+(n.surowosc-50)*.34+(ld.komp-50)*.18
      +(moja?7*partyjnosc:0)-(taSama?22*partyjnosc:0)+R(-15,15);
    glosy.push({n:s.n,partia:s.partia,za:wynik>=50});
  });
  const za=glosy.filter(x=>x.za).length, win=za>sklad.length/2, p=G.p[k];
  let wyrok='uniewinnienie',kara='Sąd oddala zarzuty.';
  if(win){
    if(dow>=76){wyrok='zakaz pełnienia urzędu';p.cred=cl(p.cred-8);p.ctr=cl(p.ctr+10);p.fame=cl(p.fame-5);
      Object.keys(G.rada||{}).forEach(r=>{if(G.rada[r]===nick){delete G.rada[r];delete G.radaOd[r]}});
      kara='Usunięcie z urzędu, wiarygodność −8, sława −5, kontrowersja +10.';
    }else if(dow>=54){wyrok='grzywna';const gr=Math.round(Math.max(50e3,kapPryw(nick)*.06));
      G.kapPryw[nick]=Math.max(0,kapPryw(nick)-gr);G.skarb=(G.skarb||0)+gr;p.cred=cl(p.cred-5);p.ctr=cl(p.ctr+6);
      kara=`Grzywna ${kasaSkrot(gr)}, wiarygodność −5, kontrowersja +6.`;
    }else{wyrok='upomnienie';p.cred=cl(p.cred-3);p.ctr=cl(p.ctr+3);kara='Wiarygodność −3, kontrowersja +3.'}
  }else if(!cicho){me().cred=cl(me().cred-3);me().ctr=cl(me().ctr+2);kara+=' Za bezpodstawny wniosek tracisz 3 wiarygodności.'}
  const s=sadInit();s.nr++;s.tropy[k]=Math.max(0,(s.tropy[k]||0)-20);
  s.historia.push({typ:'wyrok',tyd:absWeek(),nr:s.nr,n:nick,partia:k,zarzut:z.n,dow,wyrok,za,ilu:sklad.length});
  s.historia=s.historia.slice(-16);
  if(cicho)return {win,wyrok};
  SFX.seal();
  modal('Sąd',win?'Wyrok skazujący':'Uniewinnienie',
    `<div class="sadwyrok"><span>Sprawa ${s.nr}</span><h3>${esc(nick)} — ${wyrok}</h3><p>${kara}</p></div>
     <div class="sadglosy">${glosy.map(x=>`<div class="${x.za?'za':'przeciw'}">${ava(x.n,G.p[x.partia]?G.p[x.partia].c:'#777',28)}<span><b>${esc(x.n)}</b><em>${x.za?'winny':'niewinny'}</em></span></div>`).join('')}</div>`,
    [{l:'Przyjmuję wyrok',f:()=>{close();render()}}]);
  render();
}
function sadTydzien(){
  if(!lawDone('sady'))return;
  const s=sadInit();
  Object.keys(s.tropy).forEach(k=>s.tropy[k]=Math.max(0,s.tropy[k]-3));
  sadZapewnijSklad();
}
function sadTab(){
  const jest=lawDone('sady'), res=RESORTY.find(r=>r.id==='spraw'), min=res?radaKto(res.id):null;
  if(!jest)return `<div class="card sadzamkniety"><div class="h"><h3>Sąd</h3><span class="n">nie istnieje</span></div><div class="b">
    <div class="sadhero"><span>WŁADZA SĄDOWNICZA</span><h2>Najpierw potrzebna jest ustawa</h2>
      <p>Bez sądu decyzje administracji są ostateczne. Ustawę może zgłosić premier albo minister Sprawiedliwości${min?` — teraz jest nim <b>${esc(min)}</b>`:''}.</p></div>
    <button class="btn" onclick="setTab('sejm')">Idę do Sejmu i ustaw</button></div></div>`;
  sadZapewnijSklad();
  const s=sadInit(), sklad=sadSklad(), nast=sadNastawy(), wakat=Math.max(0,nast.sklad-sklad.length);
  const oskarzeni=alive().filter(k=>k!==G.me).map(k=>G.p[k].lead).filter(Boolean)
    .sort((a,b)=>sadDowody(b,'procedura')-sadDowody(a,'procedura'));
  return `<div class="ekoblok sadekran">
    <div class="sadhero"><span>SĄD ADMINISTRACYJNY</span><h2>Wyrok zapada głosami, nie przyciskiem ministra</h2>
      <p>Sejm wybiera skład. Sędziowie oceniają dowody według ustawy, własnej kompetencji i partyjnych nacisków.</p>
      <div class="sadparam"><b>${nast.sklad}<em>miejsc</em></b><b>${nast.niezaleznosc}<em>niezależność</em></b><b>${nast.surowosc}<em>surowość</em></b></div>
    </div>
    <div class="sadkolumny">
      <div class="card"><div class="h"><h3>Skład sądu</h3><span class="n">${sklad.length}/${nast.sklad}</span></div><div class="b">
        <div class="sadlawka">${sklad.map((x,i)=>{const pk=partiaOsoby(x.n)||x.partia;return `<div class="sadsedzia">
          <span class="sadnr">${i+1}</span>${ava(x.n,G.p[pk]?G.p[pk].c:'#777',38)}
          <span><b>${esc(x.n)}</b><em>${pk&&G.p[pk]?G.p[pk].ab:'—'} · kompetencja ${L(x.n).komp}</em></span></div>`}).join('')}</div>
        ${wakat?`<div class="sadwak"><b>${wakat} ${pl(wakat,'wakat','wakaty','wakatów')}</b><span>Wskaż kandydata; o powołaniu zdecyduje cały Sejm.</span></div>
          <div class="sadkand">${sadKandydaci().slice(0,6).map(n=>{const pk=partiaOsoby(n);return `<button onclick='sadZglos(${JSON.stringify(n)})'>${ava(n,G.p[pk].c,25)}<span>${esc(n)}<em>${G.p[pk].ab} · komp. ${L(n).komp}</em></span></button>`}).join('')}</div>`:''}
      </div></div>
      <div class="card"><div class="h"><h3>Wnieś sprawę</h3><span class="n">1 akcja · 8 kapitału</span></div><div class="b">
        <p class="dim" style="margin-top:0">Wybierz oskarżonego. W następnym kroku wskażesz zarzut i zobaczysz siłę materiału.</p>
        <div class="sadoskarzeni">${oskarzeni.map(n=>{const k=partiaOsoby(n),d=Math.max(...Object.keys(SAD_ZARZUTY).map(t=>sadDowody(n,t)));
          return `<button ${sklad.length<2||G.ap<1||G.kp<8?'disabled':''} onclick='sadOpenSprawa(${JSON.stringify(n)})'>${ava(n,G.p[k].c,30)}<span><b>${esc(n)}</b><em>${G.p[k].ab} · materiał do ${d}/100</em></span><i>›</i></button>`}).join('')}</div>
      </div></div>
    </div>
    <div class="card"><div class="h"><h3>Wokanda i wybory</h3><span class="n">ostatnie ${Math.min(8,s.historia.length)}</span></div><div class="b">
      <div class="sadhist">${s.historia.slice(-8).map(x=>x.typ==='wyrok'
        ?`<div class="${x.wyrok==='uniewinnienie'?'oddalona':'skazany'}"><span>sprawa ${x.nr}</span><b>${esc(x.n)} — ${x.wyrok}</b><em>${esc(x.zarzut)} · dowody ${x.dow}/100 · ${x.za}/${x.ilu} sędziów za winą</em></div>`
        :`<div class="${x.ok?'wybrany':'oddalona'}"><span>wybór</span><b>${esc(x.n)} ${x.ok?'wchodzi do składu':'odrzucony'}</b><em>Sejm ${x.za}:${x.przeciw}</em></div>`).join('')||'<p class="dim" style="margin:0">Wokanda jest czysta.</p>'}</div>
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

/* Zwiniecie panelu jest wyborem gracza, wiec zwykle przerysowanie ekranu nie
   moze go kasowac. Stan siedzi w rozgrywce i przechodzi razem z zapisem. */
const SIDE_DOMYSLNIE={lead:1,kond:1,kronika:1,skl:1,zaplecze:0,serwer:0,rel:0};
function sideOtwarte(id){
  if(!G.sideOpen)G.sideOpen={...SIDE_DOMYSLNIE};
  return G.sideOpen[id]===undefined?!!SIDE_DOMYSLNIE[id]:!!G.sideOpen[id];
}
function sideToggle(el,id){
  if(!G||!el)return;
  if(!G.sideOpen)G.sideOpen={...SIDE_DOMYSLNIE};
  G.sideOpen[id]=el.open?1:0;
}
const sideAttr=id=>`${sideOtwarte(id)?'open ':''}ontoggle="sideToggle(this,'${id}')"`;

function sidebar(p,q){
  const b=(l,v,c,k)=>{const d=G.prev?v-G.prev[k]:0;
    /* Kreska rywala. Sama liczba „62" nigdy nic nie znaczyła — dopiero widok,
       gdzie stoi najlepszy w stawce, mówi, czy to dużo. */
    const r=najlepszyRywal(k);
    const mie=r?(()=>{const odwr=!!CECHA_ODWROTNA[k];
      const lepsi=alive().filter(x=>x!==G.me&&!G.p[x].dead&&(odwr?G.p[x][k]<v:G.p[x][k]>v)).length;
      return lepsi+1})():0;
    return `<div class="st"><div class="l"><span>${l}${statTip(k)}</span><span class="odczyt">
      <b class="wart" data-c="${k}" data-v="${Math.round(v)}">${Math.round(v)}</b>${
      Math.abs(d)>.6?`<span class="d ${d>0?'up':'dn'}">${d>0?'+':''}${Math.round(d)}</span>`:''}${
      mie?`<span class="msc" title="twoje miejsce w stawce">#${mie}</span>`:''}</span></div>
      <div class="trk" data-c="${k}" data-v="${cl(v)}"><i style="width:${cl(v)}%;background:${c}"></i>
      <u class="duch"></u>${
      r?`<span class="rywal" style="left:${cl(r.v)}%" data-kto="${r.ab}"
        title="najlepszy w stawce: ${r.ab} ${Math.round(r.v)}"></span>`:''}</div></div>`};
  const ld=lead(G.me),used=PID.reduce((a,k)=>a+G.p[k].mem,0);
  const benchAll=roster(p),swapCands=benchAll.filter(x=>!isLead(p,x));
  return `
  <details class="card lead sidefold" ${sideAttr('lead')}><summary><h3>Przewodnictwo</h3>
    <span class="n">${leads(p).length===1?'jednoosobowe':leads(p).length===2?'dwuosobowe':'trzyosobowe'}</span></summary><div class="b">
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
  </div></details>
  ${feed()}
  <details class="card skl sidefold" ${sideAttr('skl')}><summary><h3>Skład partii</h3><span class="n">${p.mem} ${pl(p.mem,'osoba','osoby','osób')}</span></summary><div class="b">
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
      <b>${Math.round(ratio(p,'ser')*100)}% serwerowiczów.</b> Jedność spada, kontrowersja rośnie.</div>`:''}
  </div></details>
  <details class="card kond sidefold" ${sideAttr('kond')}><summary><h3>Kondycja partii</h3><span class="n">wskaźniki</span></summary><div class="b">
    <div id="paskiCech">
    ${b('Sława',p.fame,'var(--acc)','fame')}
    ${b('Wiarygodność',p.cred,'var(--info)','cred')}
    ${b('Jedność',p.uni,'var(--pos)','uni')}
    ${b('Aktywność',p.act,'#9b7fd4','act')}
    ${b('Kontrowersja',p.ctr,'var(--neg)','ctr')}
    ${p.ctr>=96?`<div class="ctrwarn bad"><b>Paraliż</b> Sondaż słabnie, kapitał wycieka, co tydzień ktoś odchodzi. Schładzaj: przeprosiny, wyciszenie sporu, otwarte konsultacje.</div>`
      :p.ctr>=70?`<div class="ctrwarn"><b>Uwaga na kontrowersję</b> Przy 96 partia wpada w paraliż. Zostało ci ${Math.round(96-p.ctr)} punktów luzu.</div>`:''}
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
  </div></details>
    ${(()=>{
      // Prawdziwy stan serwera, a nie stała z początku gry: ludzie przychodzą i odchodzą
      const ludzie=used+freeTot(), zmiana=ludzie-SERVER;
      return `<details class="card sidefold serwerfold" ${sideAttr('serwer')}><summary><h3>Serwer</h3>
      <span class="n">${ludzie} ${zmiana?`<span style="color:${zmiana>0?'var(--pos)':'var(--neg)'}">${zmiana>0?'+':''}${zmiana}</span>`:''}</span></summary><div class="b">
    <div class="st"><div class="l"><span>W partiach</span><b class="m">${used}</b></div>
      <div class="trk"><i style="width:${cl(used/Math.max(1,ludzie)*100)}%;background:var(--acc)"></i></div></div>
    <div class="st" style="margin:0"><div class="l"><span>Niezrzeszonych</span><b class="m">${freeTot()}</b></div>
      <div class="trk"><i style="width:${cl(freeTot()/Math.max(1,ludzie)*100)}%;background:var(--pos)"></i></div></div>`})()}
    <div style="display:flex;gap:10px;margin-top:9px;font-family:var(--m);font-size:11px;color:var(--dim)">
      ${SEG.map(s=>`<span><i style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${s.c};margin-right:4px"></i>${G.free[s.id]}</span>`).join('')}</div>
  </div></details>
  <details class="card sidefold zaplecze" ${sideAttr('zaplecze')}><summary><h3>Zaplecze</h3><span class="n">${benchAll.length} ${pl(benchAll.length,'osoba','osoby','osób')}</span></summary><div class="b">
    <div class="benchgrid">
      ${benchAll.map(n=>`<div class="bperson ${isLead(p,n)?'lead':''}" title="${n} — kapitał prywatny ${kasa(kapPryw(n))}${ranga(n)?' · '+ranga(n).n:''}">
        ${ava(n,p.c,34)}<span>${n}</span>
        <em class="kappryw">${mordedolar(11)} ${kasaSkrot(kapPryw(n))}</em>
        ${rangaOdznaka(n)}</div>`).join('')||'<span class="dim">Nikogo poza przewodniczącym.</span>'}
    </div>
  </div></details>
  <details class="card sidefold rel" ${sideAttr('rel')}><summary><h3>Relacje</h3><span class="n">${alive().length-1} partii</span></summary><div class="b">
    ${alive().filter(k=>k!==G.me).sort((a,b2)=>G.rel[b2][G.me]-G.rel[a][G.me]).map(k=>{
      const v=Math.round(G.rel[G.me][k]);
      return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:7px;font-size:12.5px">
        ${crest(k,'s')}<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${G.p[k].ab} <span class="dim">${G.p[k].lead}</span></span>
        <b class="m" style="color:${v<0?'var(--neg)':v>30?'var(--pos)':'var(--dim)'}">${v>0?'+':''}${v}</b></div>`}).join('')}
  </div></details>`;
}
