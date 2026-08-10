'use strict';
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
  stolZatwierdz();              // werbunek jest rozstrzygnięty także wtedy, gdy kandydat odmówi
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
function ministerStazGodz(id){
  radaInit();
  const od=G.radaOd[id];
  if(!od)return 99999;
  if(Number.isFinite(Number(od.at)))return Math.max(0,czasGlobalny()-Number(od.at));
  return Math.max(0,((G.term-(od.t||G.term))*12+(G.week-(od.w||G.week)))*168);
}
function ministerStaz(id){
  return Math.floor(ministerStazGodz(id)/168);
}
const ministerBlokada=id=>Math.max(0,Math.ceil((KARENCJA*168-ministerStazGodz(id))/168));
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
/* Koalicjant nie dostaje ministerstwa z automatu. Musi przekonać premiera,
   a rozmowa bierze pod uwagę relację i realną kompetencję proponowanej osoby. */
function premierRozmowa(id,nick){
  const pm=G.gov&&G.gov.pm, res=RESORTY.find(r=>r.id===id);
  if(!pm||!res||pm===G.me||!G.gov.parties.includes(G.me))return;
  if(G.premierProposalTerm===G.term)return modal('Rozmowa z premierem','Limit propozycji wykorzystany',
    '<p>W tej kadencji złożyłeś już jedną propozycję obsady resortu. Premier nie przyjmie kolejnej kandydatury do następnych wyborów.</p>',
    [{l:'Rozumiem',f:close}],close);
  const rel=(G.rel[G.me]&&G.rel[G.me][pm])||0, komp=L(nick).komp;
  const szansa=cl(.28+rel/220+(komp-50)/180+(me().seats/(TOTAL_SEATS*6)),.05,.9);
  modal('Rozmowa z premierem',res.n,
    `<p>Proponujesz <b>${esc(nick)}</b> na ministra. Premier <b>${esc(G.p[pm].lead)}</b> patrzy na relację między partiami i kompetencję kandydata.</p>
     <div class="talkmeter"><span>relacja ${Math.round(rel)}</span><b>${Math.round(szansa*100)}% szansy</b><span>kompetencja ${komp}</span></div>
     <p class="dim">Lepsza relacja i kompetentne zaplecze zwiększają zgodę. Odmowa psuje relacje, ale nie blokuje kolejnej rozmowy w późniejszym tygodniu.</p>`,
    [{l:'Składam propozycję',f:()=>{
      G.premierProposalTerm=G.term;close();
      if(ch(szansa)){obsadz(id,nick,null,true);say(`<b>Premier zgadza się.</b> ${nick} obejmuje resort ${res.n}.`,'good')}
      else{G.rel[G.me][pm]=cl((G.rel[G.me][pm]||0)-5,-100,100);G.rel[pm][G.me]=cl((G.rel[pm][G.me]||0)-5,-100,100);me().ctr=cl(me().ctr+2);say(`<b>Premier odmawia.</b> Uważa, że ${nick} nie pasuje do resortu ${res.n}. Relacje spadają.`,'bad');render()}
    }},{l:'Jeszcze nie teraz',f:close}],close);
}
function openResort(id){
  radaInit();
  const premier=!!(G.gov&&G.pmOk&&G.gov.pm===G.me);
  const koalicjant=!!(G.gov&&G.gov.parties&&G.gov.parties.includes(G.me));
  if(!premier&&!koalicjant)return modal('Rada ministrów','Brak uprawnień',
    '<p>Obsadzanie resortów należy do premiera. Z opozycji możesz tylko złożyć propozycję, gdy twoja partia jest w koalicji.</p>',
    [{l:'Wracam',f:close}],close);
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
  const rozmowa=!isPM()&&G.gov&&G.gov.parties.includes(G.me),propozycjaZuzyta=G.premierProposalTerm===G.term;
  moi.slice(0,8).forEach(n=>opcje.push({
    l:rozmowa?(propozycjaZuzyta?'Propozycja wykorzystana w tej kadencji':`Proponuję ${n} premierowi`):`${n} <span class="ok">(twoja partia)</span>`,
    s:rozmowa?(propozycjaZuzyta?'Kolejna kandydatura będzie możliwa po wyborach':`relacja z premierem i kompetencja wpływają na zgodę · komp. ${L(n).komp}`):`kompetencja ${L(n).komp} · sława +3, aktywność +2`,
    f:()=>rozmowa?premierRozmowa(id,n):obsadz(id,n,null)}));
  if(premier)obcy.slice(0,10).forEach(([n,k])=>opcje.push({
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
function obsadz(id,nick,zPartii,fromTalk){
  if(!(G.gov&&G.pmOk&&G.gov.pm===G.me)&&!fromTalk){
    say('<b>Nie jesteś premierem.</b> Nominację może zatwierdzić tylko szef rządu.','bad');
    close();render();return;
  }
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
    if(stary!==nick)G.radaOd[id]={at:czasGlobalny(),t:G.term,w:G.week};   // od tej godziny liczy się staż
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
      f:()=>{close();G.lastCharge=null;stolZatwierdz();   // minister odwołany, decyzja doszła do skutku
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
  d:'Powołuje osobną władzę sądowniczą. Sejm wybiera sędziów, a partie mogą wnosić sprawy o nadużycie urzędu, korupcję i naruszenie procedury.',
  skutek:'Ustalasz liczbę sędziów, niezależność od partii i surowość wyroków. Brudne decyzje zostawiają materiał dowodowy.'},
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
 sady:{
  baza:{sklad:3,niezaleznosc:60,surowosc:50},
  zakres:{sklad:[3,5],niezaleznosc:[20,100],surowosc:[20,100]},
  krok:{sklad:2,niezaleznosc:10,surowosc:10},
  opis:{sklad:'Liczba sędziów',niezaleznosc:'Niezależność od partii',surowosc:'Surowość wyroków'},
  jedn:''},
};
const lawEdytowalna=id=>!!LAWPAR[id];
/* Liczba sedziow jest dyskretna. Stare zapisy i bot potrafily przepuscic
   ulamek z losowania wspolnego dla wszystkich pokretel, np. „3.2 sedzi”. */
function lawSnap(id,k,v){
  const P=LAWPAR[id],z=P&&P.zakres&&P.zakres[k],step=P&&P.krok&&P.krok[k];
  if(!z||!step)return v;
  const x=cl(Number(v),z[0],z[1]),s=Number(step)||1;
  return Math.round((z[0]+Math.round((x-z[0])/s)*s)*100)/100;
}
function lawParams(id){
  lawsInit();
  const P=LAWPAR[id];if(!P)return null;
  const zapisane=(G.law[id]&&typeof G.law[id]==='object')?G.law[id]:null;
  const out=Object.assign({},P.baza,zapisane||{});
  Object.keys(P.baza).forEach(k=>{out[k]=lawSnap(id,k,out[k])});
  return out;
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
    const agenda=typeof aiAgenda==='function'&&aiAgenda(k).includes(id);
    const rel=G.rel[k][przez]+(agenda?24:0);
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
    const ag=agenda;
    const szansa=cl(BAL.ustawaBaza+rel/165+(wRzadzie?BAL.ustawaKoalicja:0)+(maResort?.12:0)
      -(opozycja?BAL.ustawaOpozycja:0)       // rywalowi nie robi się prezentów
      +(law.kat==='rozrywka'?.18:0)          // przy rozrywce nikt się nie kłóci
      -(law.prog>.6?.18:0)                   // ustrojowych pilnują wszyscy
      -rad*BAL.ustawaOpor*nastrojSejmu()     // im bardziej pod siebie, tym większy opór
      +(G.p[k].cred>60?-.05:.03),.02,.94);
    if(ch(szansa)){za+=s;by[k]='za'}
    else if(ch(.22)){wstrzym+=s;by[k]='wstrzymał się'}
    else{przeciw+=s;by[k]='przeciw'}
  });
    /* Głosowanie zostaje w pamięci partii. Dzięki temu AI nie jest bezmyślnym
       rzutem monetą: kolejne negocjacje i wojny wyborcze mają ślad tego, kto
       faktycznie poparł albo zablokował projekt. */
    if(!PROBA&&typeof aiPamietaj==='function'){
      Object.keys(by).forEach(k=>{
        if(k!==G.me)aiPamietaj(k,'glosowanie',{id,glos:by[k],wnioskodawca:przez,agenda:typeof aiAgenda==='function'&&aiAgenda(k).includes(id)});
      });
    }
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
  G.lawWeek=G.term+'-'+G.week;G.lawAt=czasGlobalny(); // laska zajęta przez kroczące 7 dni
  const w=lawVote(id,opcje);
  close();
  if(!w.ok){
    SFX.lawFail();
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
  SFX.lawPass();
  sprawczosc(true,G.me);
  if(G.przekupiony&&G.przekupiony.doTerm===G.term)G.przekupiony=null;
  G.lawPend={id,opcje:opcje||null,za:w.za,przeciw:w.przeciw,wstrzym:w.wstrzym,by:w.by,przez:G.me,odTerm:G.term,odWeek:G.week,odAt:czasGlobalny()};
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
  if(pmK&&pmK!==G.me&&G.gov.pm===pmK&&G.gov.parties.includes(pmK)&&G.p[pmK]&&!G.p[pmK].dead)
    zglaszajacy.push({k:pmK,pula:wolne,rola:3,co:2});
  alive().forEach(k=>{
    if(k===G.me||k===pmK||!G.p[k]||G.p[k].dead)return;
    const resorty=RESORTY.filter(r=>{const n=radaKto(r.id);return n&&partiaOsoby(n)===k}).map(r=>r.id);
    const pula=G.gov.parties.includes(k)?wolne.filter(l=>l.resort&&resorty.includes(l.resort)):[];
    if(pula.length)zglaszajacy.push({k,pula,rola:2,co:3});
    /* Gdy premierem jest gracz i nie oddał resortów botom, sejm nadal żyje.
       Najsilniejsza partia opozycyjna może złożyć projekt poselski. */
    else if(G.p[k].seats>0&&!G.gov.parties.includes(k))zglaszajacy.push({k,pula:wolne,rola:1,co:3});
  });
  if(!zglaszajacy.length)return;

  const teraz=czasGlobalny();
  if(G.aiLawNextAt&&teraz<G.aiLawNextAt)return;
  /* Ustawa ma cooldown liczony godzinami, nie numerem tygodnia. Rząd dostaje
     krótszy rytm, minister i opozycja dłuższy, ale żadna inicjatywa nie czeka
     na sztuczny reset kadencji. */
  const wybor=zglaszajacy.sort((a,b)=>(b.rola*(.55+aiProfil(b.k).prawo))-(a.rola*(.55+aiProfil(a.k).prawo))||G.p[b.k].seats-G.p[a.k].seats)[0];
  G.aiLawNextAt=teraz+Math.max(36,Math.round((wybor.co+1-aiProfil(wybor.k).prawo*2)*24));
  const pm=wybor.k, mozliwe=wybor.pula;
  // Składa to, co jemu się opłaca: partia serwerowicka ciśnie rozrywkę,
  // elitarna ekonomię, a ktoś ledwo nad progiem próbuje ruszyć ordynację.
  const q=G.p[pm], udzial=g=>q.mem?q.comp[g]/q.mem:0;
  /* Agenda partii: sklad i styl AI prowadza do konkretnego tematu, zamiast
     losowac ustawe tylko po kategorii. */
  const law=mozliwe.map(l=>{
    let w=1;
    const styl=aiProfil(pm);
    if(typeof aiAgenda==='function'&&aiAgenda(pm).includes(l.id))w+=3.4+styl.prawo;
    const udz={eli:udzial('eli'),int:udzial('int'),ser:udzial('ser')};
    if(l.id==='ekon'||l.id==='podatki')w+=udz.eli*2.2+styl.bud*.8;
    if(l.id==='media'||l.id==='cytaty'||l.id==='zagadki'||l.id==='event')w+=udz.ser*1.8+styl.media*1.2;
    if(l.id==='mordepedia'||l.id==='man')w+=udz.int*1.6+styl.prawo*.6;
    if(l.id==='sady'||l.id==='kodeks'||l.id==='konst'||l.id==='ordyn')w+=styl.prawo*1.8+styl.koalicje*.35;
    if(l.kat==='rozrywka')w+=udzial('ser')*2.6;
    if(l.id==='ekon')w+=udzial('eli')*3.2+udzial('int')*1.1;
    if(l.id==='konst')w+=udzial('eli')*2.4;
    if(l.id==='kodeks')w+=udzial('ser')*1.5+udzial('int')*1.2;
    if(l.id==='ordyn')w+=q.seats<=3?2.2:.4;
    return {l,w:w*(.8+rnd()*.5)};
  }).sort((a,b)=>b.w-a.w)[0].l;

  // bot nastawia pokrętła zachowawczo — sam nie chce przegrać głosowania
  let opcje=null;
  if(lawEdytowalna(law.id)){
    const P=LAWPAR[law.id];opcje={};
    const teraz=lawParams(law.id);
    Object.keys(P.baza).forEach(k=>{
      const z=P.zakres[k];
      const delta=(rnd()-.4)*(z[1]-z[0])*.16;
      opcje[k]=lawSnap(law.id,k,teraz[k]+delta);
    });
  }
  G.lawTerm[law.id]=1;
  if(typeof aiPamietaj==='function')aiPamietaj(pm,'projekt_ustawy',{id:law.id});
  say(`<b>${G.p[pm].ab} składa projekt:</b> ${law.n}.`,'roy');
  if(me().seats>0)openGlosowanie(law,opcje,pm);   // masz mandaty, więc masz głos
  else rozstrzygnijUstawe(law.id,opcje,pm,undefined);
}
function openGlosowanie(law,opcje,pm){
  const nast=opcje?Object.keys(opcje).map(k=>`${LAWPAR[law.id].opis[k]}: <b>${opcje[k]}${k==='prog'?'%':''}</b>`).join(' · '):'';
  const rad=radykalnosc(law.id,opcje);
  modal('Sejm głosuje',law.n,
    `<p><b>${G.p[pm].ab}</b> kieruje pod głosowanie ustawę, którą wnosi ${G.p[pm].lead}.
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
  SFX.vote();
  if(relZmiana&&G.rel[G.me]&&G.rel[G.me][pm]!==undefined){
    G.rel[G.me][pm]=cl(G.rel[G.me][pm]+relZmiana,-100,100);
    G.rel[pm][G.me]=cl(G.rel[pm][G.me]+relZmiana,-100,100);
  }
  if(!w.ok){
    SFX.lawFail();
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
  SFX.lawPass();
  sprawczosc(true,pm);
  if(G.przekupiony&&G.przekupiony.doTerm===G.term)G.przekupiony=null;
  G.lawPend={id,opcje:opcje||null,za:w.za,przeciw:w.przeciw,wstrzym:w.wstrzym,by:w.by,przez:pm,odTerm:G.term,odWeek:G.week,odAt:czasGlobalny()};
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
      if(id==='event'&&typeof budzetWydatek==='function')budzetWydatek(koszt,`event: ${w.n}`);
      else G.kapPryw[szef]=Math.max(1000,Math.round(kapPryw(szef)-koszt));
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
  if(id==='sady')sadZapewnijSklad();
}
const TOTAL_SEATS_LIVE=()=>REG.reduce((a,r)=>a+r.seats,0)+TOPUP;

/* Prezydent ma trzy tygodnie na podpis albo weto. Komputer decyduje od razu, więc
   dotyczy to wyłącznie gracza w pałacu: ustawa nie może leżeć na biurku w nieskończoność,
   bo blokuje cały sejm — nikt nie złoży kolejnej, dopóki ta nie zostanie rozstrzygnięta. */
const ZWLOKA_MAX=3;
function zwlokaPrezydenta(){
  const l=G.lawPend;
  if(!l||!hasPrez())return;                    // pałac nie nasz albo nic nie czeka
  let ile;
  if(typeof l.odAt==='number')ile=Math.floor((czasGlobalny()-l.odAt)/168);
  else{
    if(typeof l.odTerm!=='number')return;
    ile=(G.term-l.odTerm)*12+(G.week-l.odWeek);
  }
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
    /* Weto utrzymane nie jest wejściem ustawy w życie. Czyścimy ewentualny
       ślad ze starych zapisów, żeby Media, Sąd i Pedia nie otwierały się bokiem. */
    if(G.law&&G.law[id]&&!G.law[id].__accepted)delete G.law[id];
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
  if(!ok){SFX.veto();odrzucenieWeta(id,opcje,pmK,glosyPrzed);return}
  if(ok){
    SFX.seal();
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
