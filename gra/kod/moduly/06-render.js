'use strict';
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
    /* Zszywanie zachowuje ten sam korzeń dokumentu, więc przeglądarka sama trzyma
       pozycję. Ręczne window.scrollTo odpalane przy każdym renderze ścigało się
       z kółkiem myszy i na dłuższych ekranach wprawiało całą grę w drganie. */
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
const leadName=k=>G&&G.partyCouncil&&G.partyCouncil.party===k&&G.partyCouncil.members&&G.partyCouncil.members.length===5?'Rada Partyjna':leads(G.p[k]).join(' / ');
const leadAva=(k,sz)=>{const p=G.p[k],s=sz||38,ls=leads(p);
  if(ls.length<2)return ava(p.lead,p.c,s);
  // im więcej przewodniczących, tym mocniej portrety zachodzą na siebie
  const s2=Math.round(s*(ls.length>2?.72:.82)),ov=Math.round(s2*.42);
  return `<div style="display:flex;flex:none">${ls.map((n,i)=>
    i?`<div style="margin-left:-${ov}px">${ava(n,p.c,s2)}</div>`:ava(n,p.c,s2)).join('')}</div>`};

function render(){if(PROBA)return;
  applyTheme();initTips();initKeys();initDzwiek();
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
  else if(G.queue&&G.queue.length){
    /* Kolejka mogła powstać przed wyjściem z rządu. Kryzys koalicyjny nie może
       wtedy czekać w pamięci i wyskoczyć już w opozycji. */
    G.queue=G.queue.filter(e=>e&&e.id!=='kryzKoal'||inGov());
    if(G.queue.length)showEvent(G.queue.shift());
  }
  else if(G.scenEventPending){const z=G.scenEventPending,e=(G.scenEvents||[]).find(x=>x.id===z.id);if(e)scenEventPokaz(e,z.k);else G.scenEventPending=null}
}

let SEL='PPP';
function pickParty(k){SEL=k;render()}
/* Wybór partii działa jak wybór drużyny: jedna karta zostaje na środku,
   a strzałki zmieniają tylko szyld. Dzięki temu porównujesz partie bez
   przekopywania się przez ścianę małych kafli. */
function pickPartyKrok(d){
  const i=PID.indexOf(SEL),n=PID.length;
  if(!n)return;
  pickParty(PID[(i+(+d||0)+n)%n]);
}
function setupScenEf(){return (SCENSEL&&SCEN[SCENSEL]&&SCEN[SCENSEL].efekty)||null}
function setupScenMandaty(k){
  const ef=setupScenEf();return ef&&ef.mandatyStart?Math.max(0,Math.round(+ef.mandatyStart[k]||0)):(START_SEATS[k]||0);
}
function setupScenStat(k,pole){
  const ef=setupScenEf();if(!ef)return BASE[k][pole];
  const max=pole==='pot'?200:100,w=(ef.wszystkie||{})[pole],z=((ef.partie||{})[k]||{})[pole];
  return Math.round(cl((+BASE[k][pole]||0)+(typeof w==='number'?w:0)+(typeof z==='number'?z:0),0,max));
}
function pickMain(){
  const box=document.getElementById('pmain');if(!box)return;
  const p=Object.assign({},BASE[SEL]),lp=LP[SEL],isDuo=DUO_START.includes(SEL)&&lp.main[1];
  ['fame','cred','uni','act','ctr','pret','pot'].forEach(s=>p[s]=setupScenStat(SEL,s));
  const scenSeats=setupScenMandaty(SEL);
  const ld1=LEAD[lp.main[0]]||[50,50,50,50], ld2=isDuo?(LEAD[lp.main[1]]||[50,50,50,50]):null;
  const ld=ld2?[0,1,2,3].map(i=>Math.round((ld1[i]+ld2[i])/2)):ld1;
  const ic1=INNATE[lp.main[0]], ic2=isDuo?INNATE[lp.main[1]]:null;
  const ics=[ic1,ic2].filter(Boolean);
  const st=(n,v,c)=>`<div class="row"><div class="l"><span>${n}</span><b>${v}</b></div>
    <div class="trk"><i style="width:${v}%;background:${c}"></i></div></div>`;
  box.innerHTML=`
    <div style="position:absolute;right:-70px;top:-70px;width:280px;height:280px;border-radius:50%;
      background:radial-gradient(circle,${p.c}55,transparent 70%);filter:blur(6px)"></div>
    <div class="pickhd partyherohead">
      <img class="crest" style="width:74px;height:74px;padding:3px;border-radius:5px" src="${LOGOS[SEL]||''}" alt="">
      <div style="min-width:0">
        <h2>${p.n}</h2>
        <div class="meta">${p.ab} · założona ${p.founded} · trudność
          <span style="color:var(--acc)">${'★'.repeat(p.diff)}${'☆'.repeat(5-p.diff)}</span></div>
      </div>
    </div>
    <p class="partyblurb" style="color:var(--dim);font-size:14px;line-height:1.55;margin:0">${p.blurb}</p>
    <div class="pickstat partystats">
      ${st('Sława',p.fame,'var(--acc)')}${st('Wiarygodność',p.cred,'var(--info)')}
      ${st('Jedność',p.uni,'var(--pos)')}${st('Aktywność',p.act,'#9b7fd4')}
    </div>
    <div class="partyfacts" style="display:flex;gap:18px;font-family:var(--m);font-size:11.5px;color:var(--dim);margin-top:6px;flex-wrap:wrap">
      <span>mandaty <b style="color:${scenSeats!==START_SEATS[SEL]?'var(--acc)':'var(--tx)'}">${scenSeats}</b></span>
      <span>osób <b style="color:var(--tx)">${p.mem}</b></span>
      <span>skład <b style="color:var(--tx)">${p.comp0[0]}·${p.comp0[1]}·${p.comp0[2]}</b> elita/inteligencja/serwerowicze</span>
      <span>sufit <b style="color:var(--tx)">${p.pot}</b></span>
    </div>
    <div class="leadchip partyleader">
      ${ava(lp.main[0],p.c,42)}
      <div style="flex:1;min-width:0">
        <div class="n">${isDuo?lp.main[0]+' / '+lp.main[1]+' (współprzewodnictwo)':lp.main.join(' · ')}</div>
        <div class="s">charyzma ${ld[0]} · kompetencja ${ld[1]} · wytrzymałość ${ld[2]} · autorytet ${ld[3]}</div>
        ${ics.map(x=>`<div style="font-size:11.5px;color:var(--acc);margin-top:3px">★ ${x.n}</div>`).join('')}
      </div>
    </div>
    <div style="font-size:12.5px;color:var(--dim2);margin-top:10px">
      Zaplecze: ${lp.bench.length?lp.bench.join(', '):'<span style="color:var(--neg)">brak</span>'}</div>
    <button class="btn pickstart" style="width:100%;margin-top:15px;padding:12px" onclick="start('${SEL}')">
      Prowadzę ${p.ab} →</button>`;
}
