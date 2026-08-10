'use strict';
/* ---- sala sejmowa ----
   Miejsca układają się w łukach od lewej do prawej, jak w prawdziwej sali.
   Poza samym rozkładem widać tu trzy rzeczy naraz: gdzie przebiega próg większości,
   ile mandatów zebrał rząd i które miejsca są twoje. */
function hemi(order,w,mode){
  const n=order.length;if(!n)return '';
  const W=w||600, cx=W/2;
  const rows=n>48?6:n>34?5:n>18?4:3;
  // Kulka nie może rosnąć razem z szerokością pustej karty. Przy 720 px
  // skrajne miejsca robiły się wielkie, a zewnętrzny łuk wychodził za viewBox.
  const rad=Math.max(4.8,Math.min(9.5,W/n*0.50));
  const Rmax=W/2-rad-10, Rmin=Rmax*0.42;
  /* W widoku Sejmu półkole jest celowo wyższe od geometrycznego. Zwykły łuk 2:1
     wyglądał jak spłaszczony wykres i ściskał pięć rzędów mandatów. */
  const yScale=mode?1.20:1;
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
  const H=Math.round(Rmax*yScale+rad+26), cy=Math.round(Rmax*yScale+rad+18);
  const colOf=k=>{if(mode==='bloc'){const b=blocOf(k);if(b)return b.color}return G.p[k].c};
  const uid='h'+Math.floor(rnd()*0x1000000).toString(36).padStart(5,'0');

  // ile mandatów ma rząd i gdzie kończy się próg większości
  const rzad=G.gov?G.gov.parties:[];
  const mRzad=rzad.reduce((a,k)=>a+(G.p[k]?G.p[k].seats:0),0);
  const moje=G.p[G.me]?G.p[G.me].seats:0;
  const prog=Math.min(MAJ,n);
  const kątProgu=pts[prog-1]?pts[prog-1].t:Math.PI/2;
  // Łuk dostaje margines wewnątrz viewBoxu. Wcześniej Rmax+rad+7 ucinał
  // końcowe kulki i sprawiał wrażenie, jakby granica „zjadała” mandaty.
  const Rzew=Math.min(W/2-3,Rmax+rad+7), Rwew=Math.max(4,Rmin-rad-7);

  /* Łuk ma domykać się za ostatnim zajętym fotelem, a nie w jego środku —
     inaczej zielona kreska nad ławami rządu wyraźnie nie dociąga. */
  const kątKonca=ile=>{
    const a=pts[ile-1];if(!a)return Math.PI;
    const b=pts[ile];
    return b?(a.t+b.t)/2:Math.min(Math.PI,a.t+(a.t-(pts[ile-2]?pts[ile-2].t:0))/2);
  };
  const luk=(R,od,do_,kolor,gr,op)=>{
    const x1=cx-R*Math.cos(od), y1=cy-R*Math.sin(od)*yScale;
    const x2=cx-R*Math.cos(do_), y2=cy-R*Math.sin(do_)*yScale;
    const duzy=Math.abs(do_-od)>Math.PI?1:0;
    return `<path d="M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${R} ${(R*yScale).toFixed(1)} 0 ${duzy} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}"
      fill="none" stroke="${kolor}" stroke-width="${gr}" stroke-linecap="round" opacity="${op}"/>`;
  };

  const miejsca=pts.map((p,i)=>{const k=order[i];if(!k)return '';
    const x=cx-p.r*Math.cos(p.t), y=cy-p.r*Math.sin(p.t)*yScale;
    const mine=k===G.me, b=blocOf(k), wRzadzie=rzad.includes(k);
    return `<g class="seat ${mine?'mine':''}" data-p="${k}" style="--sd:${Math.min(i*6,240)}ms">
      <circle cx="${x.toFixed(1)}" cy="${(y+1.2).toFixed(1)}" r="${rad}" fill="rgba(0,0,0,.55)"/>
      <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rad}" fill="${colOf(k)}"
        stroke="${mine?'#f0d489':wRzadzie?'rgba(255,255,255,.58)':'rgba(255,255,255,.34)'}"
        stroke-width="${mine?3:wRzadzie?1.8:1.5}"/>
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

    <!-- Rząd jest opisany pod salą; zielony łuk nie zabiera już miejsca kulkom. -->

    <!-- Próg większości. Kreska biegnie wyłącznie nad ławami, bo poprowadzona
         przez środek przecinała fotele i wyglądała jak rysa na wykresie. -->
    ${luk(Rzew+7,0,kątProgu,`url(#${uid}maj)`,mRzad>0?1.5:3,mRzad>0?.5:.8)}
    <line x1="${(cx-(Rzew+10)*Math.cos(kątProgu)).toFixed(1)}" y1="${(cy-(Rzew+10)*Math.sin(kątProgu)*yScale).toFixed(1)}"
          x2="${(cx-(Rzew+21)*Math.cos(kątProgu)).toFixed(1)}" y2="${(cy-(Rzew+21)*Math.sin(kątProgu)*yScale).toFixed(1)}"
          stroke="var(--acc)" stroke-width="1.7" stroke-dasharray="4 3" opacity=".95"/>
    <text x="${(cx-(Rzew+29)*Math.cos(kątProgu)).toFixed(1)}" y="${(cy-(Rzew+29)*Math.sin(kątProgu)*yScale+3.5).toFixed(1)}"
      text-anchor="middle" fill="var(--acc)" font-size="10.5" font-family="ui-monospace,monospace"
      letter-spacing=".08em">${MAJ}</text>

    ${miejsca}

    <text x="${cx}" y="${cy-(mode?51:30)}" text-anchor="middle" fill="${moje?G.p[G.me].c:'var(--dim2)'}"
      font-size="${mode?48:27}" font-weight="700" font-family="ui-monospace,monospace">${moje}</text>
    <text x="${cx}" y="${cy-(mode?24:15)}" text-anchor="middle" fill="var(--dim2)" font-size="${mode?13:10}"
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
function mapTab(q,AL){
  const p=me(),r=REG.find(x=>x.id===G.sel);
  const ld=Object.fromEntries(REG.map(x=>[x.id,leader(x.id,q.res)]));
  return `
  <div class="mapwrap">
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
          /* Trzy obrysy są zawsze tej samej grubości: zewnętrzny to lider,
             środkowy to druga partia, a najbliższy polu to gracz. Wcześniej
             szerokość rosła razem z obecnością i mapa wyglądała, jakby część
             granic przypadkiem była pogrubiona. */
          const rank=alive().slice().sort((a,b)=>G.p[b].pres[x.id]-G.p[a].pres[x.id]);
          const Lk=rank[0],drugi=rank[1]||null;
          const c=G.p[Lk].c,pr=p.pres[x.id],on=x.id===G.sel,crestSrc=(G.p[Lk].logo&&LOGOS[G.p[Lk].logo])||LOGOS[Lk]||'';
          const R0=102,dom=Lk,dp=cl(G.p[Lk].pres[x.id],0,100),dp2=drugi?cl(G.p[drugi].pres[x.id],0,100):0;
          const glosy=ld[x.id];
          return `<g class="hex" onclick="setSel('${x.id}')">
            <polygon class="hglow" points="${hexPts(x.x,x.y,R0)}" fill="${c}" filter="url(#soft)"/>
            <polygon class="hf" points="${hexPts(x.x,x.y,R0)}" fill="${c}" fill-opacity="${(.17+dp/155).toFixed(3)}"
              stroke="${on?'var(--acc)':c}" stroke-width="2" stroke-opacity="${on?1:.72}"/>
            <polygon points="${hexPts(x.x,x.y,R0+12)}" pathLength="100" fill="none" stroke="${G.p[dom].c}"
              stroke-width="4" stroke-linecap="round" stroke-dasharray="${Math.max(.1,dp)} 100" stroke-opacity=".94"/>
            ${drugi?`<polygon points="${hexPts(x.x,x.y,R0+7)}" pathLength="100" fill="none" stroke="${G.p[drugi].c}"
              stroke-width="2" stroke-linecap="round" stroke-dasharray="${Math.max(.1,dp2)} 100" stroke-opacity=".95"/>`:''}
            ${dom===G.me?'':`<polygon points="${hexPts(x.x,x.y,R0+2)}" pathLength="100" fill="none" stroke="${p.c}"
              stroke-width="2" stroke-linecap="round" stroke-dasharray="${Math.max(.1,cl(pr,0,100))} 100" stroke-opacity=".86"/>`}
            <rect x="${x.x-19}" y="${x.y-72}" width="38" height="38" rx="7" fill="#f4f1ea" fill-opacity=".93"/>
            <image class="hcrest" href="${crestSrc}" x="${x.x-17}" y="${x.y-70}" width="34" height="34" preserveAspectRatio="xMidYMid meet"/>
            <text x="${x.x}" y="${x.y-12}" text-anchor="middle" fill="var(--tx)" font-size="17.5" font-weight="660">${x.n}</text>
            <text x="${x.x}" y="${x.y+9}" text-anchor="middle" fill="${c}" font-size="13" font-weight="650" letter-spacing=".04em">${G.p[Lk].ab} dominuje</text>
            ${drugi?`<text x="${x.x}" y="${x.y+27}" text-anchor="middle" fill="${G.p[drugi].c}" font-size="10.5" font-weight="650" letter-spacing=".05em">2. ${G.p[drugi].ab} · ${Math.round(dp2)}</text>`:''}
            ${Array.from({length:x.seats}).map((_,i)=>`<rect x="${x.x-(x.seats*11-3)/2+i*11}" y="${x.y+38}" width="8" height="8" rx="4"
              fill="var(--acc)" fill-opacity=".95" stroke="rgba(0,0,0,.5)" stroke-width=".6"/>`).join('')}
            <text x="${x.x}" y="${x.y+65}" text-anchor="middle" fill="var(--dim)" font-size="12" font-family="ui-monospace,monospace">${G.p[glosy].ab} bierze głosy · ty ${Math.round(pr)}/100</text>
          </g>`}).join('')}
      </svg></div>
      <div class="legend">${alive().sort((a,b)=>q.res[b].tot-q.res[a].tot).slice(0,7)
        .map(k=>`<span><i style="background:${G.p[k].c}"></i>${G.p[k].ab}</span>`).join('')}
        <span class="dim" style="margin-left:auto">Zewnętrzny obrys: lider obecności. Środkowy obrys: druga partia. Wewnętrzny obrys: twoja obecność.</span></div>
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
  decyzjeSweep();
  const live=decyzjeInit().filter(x=>x&&x.status==='ACTIVE'),closed=[];
  if(live.length){
    const now=czasGlobalny();
    return `<div class="stol live-actions"><div class="stolh"><h3>Akcje w toku</h3><span class="stoln">${live.length} aktywnych · ${Math.max(0,G.ap)}/${G.apMax} AP</span></div><div class="stolm live-actions-grid">${live.map(d=>{const left=Math.max(0,Number(d.deadline||now)-now),days=Math.ceil(left/24);return `<div class="mj live-action" style="--ac:${CATCOL[d.cat]||'var(--line2)'}"><div class="live-action-mark">◷</div><h4>${esc(d.n)}</h4><span>AKTYWNA · ${days} ${pl(days,'dzień','dni','dni')}</span><small>do ${dateStr(new Date(gameDate().getTime()+left*3600000))}</small></div>`}).join('')}${closed.map(d=>`<div class="mj live-action closed" style="--ac:${CATCOL[d.cat]||'var(--line2)'}"><div class="live-action-mark">${d.status==='COMPLETED'?'✓':'×'}</div><h4>${esc(d.n)}</h4><span>${d.status==='COMPLETED'?'ZAKOŃCZONA':'WYGASŁA'}</span></div>`).join('')}</div></div>`;
  }
  return '';
  const klucz=G.term+'-'+G.week;
  /* Stare zapisy mogły zawierać puste wpisy utworzone przez samo otwarcie okna.
     Nie pokazujemy ich jako wykonanych ruchów. Nowe wpisy mają znacznik ok. */
  const surowe=(G.stolTyg===klucz&&G.stol?G.stol:[]).filter(x=>
    x&&x.ap>0&&(x.ok||Object.keys(x.zm||{}).length));
  /* Stare zapisy potrafiły mieć ten sam ruch dwa razy po cofnięciu okna.
     Stół nie może przez taki duplikat zapełnić całego tygodnia — token jest
     jedynym źródłem prawdy, a całość tniemy do realnego limitu AP. */
  const widziane=new Set(),zagrane=surowe.filter(x=>{
    const k=x.token||`${x.id}|${x.n}`;if(widziane.has(k))return false;widziane.add(k);return true;
  });
  const wolne=Math.max(0,Math.min(G.apMax,G.ap));
  const miejsca=[];
  zagrane.forEach(x=>{for(let i=0;i<x.ap;i++)miejsca.push(i===0?x:{ciag:x})});
  miejsca.splice(G.apMax);
  for(let i=0;i<wolne;i++)miejsca.push(null);
  const plan=(G.harmonogram||[]).filter(x=>x&&x.tydzien===klucz).slice().reverse();
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
          <div class="skut">${zm||'<span class="p">wykonano</span>'}</div>
        </div>`}).join('')}
    </div>
    ${plan.length?`<div class="stolczas"><span>Oś czasu</span>${plan.map(x=>`<b>D${x.od}–${x.do}</b><em>${esc(x.n)}</em>`).join('')}</div>`:''}
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
  /* Ustawa ma własny proces sejmu i własną kartę w Kancelarii. Nie może
     udawać zwykłej decyzji tygodnia, bo znika poczucie osobnego głosowania. */
  list=(list||[]).filter(a=>a.id!=='ustawa');
  return list.map(a=>{
    const f=fat(a.id),done=a.once&&G.once[a.id];
    const usedT=(a.term1&&G.useTerm[a.id]);
    /* Kategoria nie ma wspĂłlnego cooldownu. Zostawiamy te zmienne dla starych
       zapisĂłw i tekstĂłw kart, ale zawsze sÄ… wyĹ‚Ä…czone; odnowa naleĹĽy do id decyzji. */
    const catFull=false,catLeft=0;
    const noShame=a.shame&&!shameAktywne();
    const cdDo=(G.odnowy&&G.odnowy[a.id])||0, cd=cdDo>czasGlobalny();
    // decyzje z limitem tygodniowym (regeneracja): dwa razy i koniec
    const limT=!!a.tydz2&&limit2Uzyte(a)>=2;
    const kpC=Math.round(a.kp*sizeF(me()).kp*inflacja());   // cena z uwzględnieniem inflacji
    const ok=G.ap>=a.ap&&G.kp>=kpC&&(a.en<0||G.en>=a.en)&&!done&&!usedT&&!limT&&!noShame&&!cd&&!(a.id==='rekr'&&rekrutacjaDni()>0);
    const col=CATCOL[a.cat]||'var(--line2)';
    const cb=G.lastAct&&COMBO.find(c=>c.a===G.lastAct&&c.b===a.id);
    const katN=(CATS.find(x=>x[0]===a.cat)||['',''])[1]||'Ta kategoria';
    const blok=done?'wykorzystane':usedT?'zużyte w tej kadencji'
      // blokuje kategoria, nie ta jedna decyzja — bez tego wygląda to na zepsuty przycisk
      :limT?'wykorzystane dwa razy w ostatnich 7 dniach'
      :catFull?`kategoria ${katN} wróci za ${Math.max(1,Math.ceil(catLeft/24))} ${pl(Math.max(1,Math.ceil(catLeft/24)),'dzień','dni','dni')}`
      :cd?`odnowa za ${Math.max(1,Math.ceil((cdDo-czasGlobalny())/24))} ${pl(Math.max(1,Math.ceil((cdDo-czasGlobalny())/24)),'dzień','dni','dni')}`
      :noShame?'dostępne tylko tuż po wpadce':(a.id==='rekr'&&rekrutacjaDni()>0)?`nabór wraca za ${rekrutacjaDni()} ${pl(rekrutacjaDni(),'dzień','dni','dni')}`
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
        <span class="cst rt"><em>odnowa</em>${czasOdnowy(a)?Math.ceil(czasOdnowy(a)/24)+' '+pl(Math.ceil(czasOdnowy(a)/24),'dzień','dni','dni'):'natychmiast'}</span>
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
  return `<div class="card urzad ustawy lawprocess" style="margin-top:14px"><div class="h"><h3>Proces legislacyjny</h3>
    <span class="n">${G.lawPend?'jedna u prezydenta':'osobna ścieżka sejmu'}</span></div><div class="b">
    ${pend?`<div class="lawpend">
      <div class="lp1">Czeka na podpis prezydenta</div>
      <b>${pend.n}</b>
      <span>Sejm: za ${G.lawPend.za}, przeciw ${G.lawPend.przeciw}. Dopóki nie zapadnie decyzja, nie zgłosisz kolejnej.</span>
    </div>`:''}
    <div class="lawintro"><b>Ustawa nie zajmuje slotu decyzji.</b><span>To osobne głosowanie sejmu: wybierasz projekt, ustawiasz kierunek i obserwujesz, czy rząd ma większość.</span></div>
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
  /* Bez aktywnego gabinetu nie ma inicjatywy ustawodawczej. */
  if(!G.gov||!G.pmOk||!G.gov.pm)return false;
  // kto nie ma ani jednego mandatu, ten nie ma prawa inicjatywy — nie miałby nawet jak zagłosować
  if(!me().seats)return false;
  if(isPM())return true;
  return !!(l.resort&&mojeResorty().includes(l.resort));
}
/* Sejm rozpatruje jeden projekt tygodniowo. Każda ustawa z osobna ma nadal swoje
   jedno podejście na kadencję — ten limit tylko rozkłada je w czasie, żeby nie
   dało się w jednym tygodniu przepchnąć całego programu naraz. */
const ustawaWTymTygodniu=()=>G.lawWeek===null?false:Number.isFinite(+G.lawAt)
  ? czasGlobalny()-Number(G.lawAt)<168
  : G.lawWeek===G.term+'-'+G.week;
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
    const klucz=id+'|'+czasGlobalny()+'|'+Math.round(me().fame)+'|'+(G.used[id]||0);
  if(podgladCache[klucz])return podgladCache[klucz];

  const kopiaG=JSON.stringify(G), prawdziwe=G, rngPrawdziwe=RNG_STATE;
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
    RNG_STATE=rngPrawdziwe;G.rng=RNG_STATE; // podgląd nie może zużyć losowości prawdziwej gry
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
  return `${stolTygodnia()}
  <div class="card"><div class="h"><h3>Decyzje dostępne teraz</h3>
    <span class="n">${ikona('akcje','sm')}${Math.max(0,G.ap)}/${G.apMax} akcji pozostało · ${ikona('kapital','sm')}${Math.round(G.kp)} kapitału · ${ikona('energia','sm')}${Math.round(G.en)} energii</span></div>
    <div class="b">
    <div class="cats">${cats.map(([c,n])=>{
      const zuzyta=false,poz=0,pozD=0;
      return `<button class="${!fx&&G.cat===c?'on':''} ${zuzyta?'spent':''} ${c==='prz'||c==='prem'?'roy':''}"
        onclick="setCat('${c}')" title="${zuzyta?`Kategoria wróci za ${pozD} ${pl(pozD,'dzień','dni','dni')}`:n}">${zuzyta?'◷ ':''}${n}</button>`}).join('')}</div>
    <div class="fxbar">
      <span class="fxlab">Filtruj po skutku decyzji</span>
      <button class="fx ${fx?'':'on'}" onclick="setFx('')">wszystkie</button>
      ${Object.keys(AFXN).filter(f=>dost.has(f)).map(f=>`<button class="fx ${fx===f?'on':''}"
        style="${fx===f?`background:${AFXN[f][1]};border-color:${AFXN[f][1]};color:#10140f`:`color:${AFXN[f][1]};border-color:${AFXN[f][1]}55`}"
        onclick="setFx('${f}')">${AFXN[f][0]}</button>`).join('')}
    </div>
    ${false?`<div class="spentbar">
      <b>${(CATS.find(c=>c[0]===G.cat)||['',''])[1]} ma aktywny cooldown.</b>
      Zagrałeś tu decyzję, dlatego karta czeka na własny termin odnowy. Nie musisz kończyć ani rozpoczynać tygodnia — czas płynie sam.</div>`:''}
    <div class="actgrid">${actCards(list,fx)}</div>
    <div class="note"><b>Każda decyzja ma własny termin odnowy.</b> Kolejność też się liczy: kanwasing przed wiecem daje ×1,55, ale manifest przed memami tylko ×0,55.
    Filtr „po skutku” pokazuje decyzje z wszystkich kategorii naraz.</div>
  </div></div>
  ${agentBox()}`;
}
function agentBox(){
  const wolni=AGENTS.filter(a=>agentFree(a.n)), moi=AGENTS.filter(a=>G.agents[a.n]===G.me);
  const zostalo=agenciZostalo();
  const agentOstatni=agentCooldownDni();
  const blok=agentOstatni>0||!zostalo;
  return `<div class="card" style="margin-top:14px"><div class="h"><h3>Transfery bezpartyjnych</h3>
    <span class="n">${wolni.length} ${pl(wolni.length,'wolny','wolnych','wolnych')} · ${moi.length} u ciebie ·
      <b style="color:${zostalo?'var(--acc)':'var(--neg)'}">${zostalo}/${AGENCI_NA_KADENCJE}</b> w kadencji</span></div><div class="b">
    <div class="note" style="margin:0 0 13px">Poza partiami chodzi po serwerze kilka osób, które da się ściągnąć czystym kapitałem, bez akcji i bez zgody kogokolwiek.
    <b>Dwa transfery na kadencję</b>, najwyżej jeden na tydzień.
    ${!zostalo?'<b style="color:var(--neg)">Limit tej kadencji wyczerpany</b> — kolejni bezpartyjni dopiero po wyborach.'
      :agentOstatni>0?`<b>Następny transfer za ${agentOstatni} ${pl(agentOstatni,'dzień','dni','dni')}.</b>`:''}
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
        <button class="btn sm" ${ok?'':'disabled'} onclick="signAgent('${esc(a.n)}')">${!zostalo?'Limit kadencji wyczerpany':agentOstatni>0?`Transfer za ${agentOstatni} dni`:G.kp<c?'Za mało kapitału':'Podpisuję transfer'}</button>
      </div>`}).join('')||'<span class="dim">Nikt wolny nie chodzi teraz po serwerze. Wróć za tydzień.</span>'}</div>
  </div></div>`;
}

let pend=null;
function doAct(id){
  const a=A.find(x=>x.id===id);
  const done=a.once&&G.once[a.id],usedT=a.term1&&G.useTerm[a.id],limT=!!a.tydz2&&limit2Uzyte(a)>=2;
  const noShame=a.shame&&!shameAktywne(),cd=(G.odnowy&&G.odnowy[id]||0)>czasGlobalny();
  if(G.ap<a.ap||G.kp<a.kp||(a.en>0&&G.en<a.en)||done||usedT||limT||noShame||cd||(a.id==='rekr'&&rekrutacjaDni()>0))return;
  pend={a,t:null,r:null,s:null,tem:null};
  if(me().ctr>=70&&actFx(a.id).includes('ctr')&&!G.noWarn){
    return modal('Ostrożnie','Ta decyzja podbije kontrowersję',
      `<p>Masz już <b>${Math.round(me().ctr)}/100</b> kontrowersji. Przy 96 partia wpada w paraliż:
       sondaż słabnie, kapitał wycieka, a co tydzień ktoś odchodzi. Na pewno w to idziesz?</p>`,
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
  if(a.id==='debata'&&!pend.miniDone)return miniGra('debata');
  if(a.id==='spot'&&!pend.miniDone)return miniGra('spot');
  fire(a,pend.t,pend.r,pend.s,pend.tem);
}
/* Debata i spot są małymi scenkami, nie trzema zawsze takimi samymi guzikami.
   Pytania losują się z puli, a odpowiedź liczy się przez cechy partii i lidera.
   Dzięki temu kompetencja, wiarygodność i sława mają znaczenie w rozmowie, a
   nie tylko w opisie karty decyzji. */
const MINI_PYTANIA={
  debata:[
    {q:'Mordeczka pyta: „Skąd weźmiecie pieniądze na ten plan?”',o:[['Pokazuję liczby','Konkretny plan buduje zaufanie.',2,[['cred',.55],['komp',.45]]],['Odwracam temat','Widownia słyszy unik.',0,[['char',.35],['cred',-.35]]],['Atakuję rywala','Ostra kontra może odbić się rykoszetem.',1,[['char',.55],['ctr',-.25]]]]},
    {q:'Rywal wyciąga starą aferę z twojej kroniki. Co robisz?',o:[['Przyznaję błąd','Szczerość kosztuje, ale odzyskuje wiarygodność.',2,[['cred',.6],['uni',.2]]],['To spisek','Twardy elektorat klaszcze, reszta patrzy krzywo.',1,[['char',.45],['ctr',-.5]]],['Pytam o jego afery','Zmieniasz temat, ale tracisz klasę.',0,[['char',.25],['cred',-.45]]]]},
    {q:'Kanał pyta, czy po wyborach wejdziesz z rywalem do rządu.',o:[['Stawiam warunki','Nie obiecujesz za dużo i zostawiasz sobie ruch.',2,[['komp',.45],['cred',.35]]],['Nigdy z nimi','Twardość mobilizuje swoich, pali mosty.',1,[['uni',.45],['rel',-.2]]],['Zobaczymy','Elastyczność brzmi jak brak planu.',0,[['cred',-.3],['char',.25]]]]},
    {q:'Ostatnie zdanie ma zostać jako nagłówek poranka.',o:[['„To dopiero początek”','Krótko i nośnie.',2,[['char',.55],['fame',.25]]],['Czytam program','Merytorycznie, ale bez iskry.',1,[['komp',.55],['fame',.1]]],['Wbijam szpilę','Może pójść viralowo albo boleśnie.',0,[['char',.35],['ctr',-.6]]]]},
    {q:'Mordeczka prosi o jedną rzecz, której nie zrobisz jako premier.',o:[['Nie będę kłamać','Wysokie ryzyko, ale jasna granica.',2,[['cred',.6],['komp',.25]]],['Nie będę miękki','Podoba się radykałom.',1,[['uni',.35],['char',.3]]],['Nie odpowiem','Unikasz odpowiedzialności.',0,[['cred',-.55],['char',.2]]]]}
  ],
  spot:[
    {q:'Pierwsze trzy sekundy spotu. Co widzi widz?',o:[['Tłum i emocje','Obraz zatrzymuje przewijanie.',2,[['fame',.55],['act',.3]]],['Dokument i liczby','Spokojny start dla cierpliwych.',1,[['cred',.5],['komp',.25]]],['Żart z rywala','Może zostać memem, może cringem.',0,[['char',.4],['ctr',-.45]]]]},
    {q:'W środku spotu pada pytanie: „Co zmieni się jutro?”',o:[['Jedna konkretna rzecz','Obietnica ma kształt i cenę.',2,[['cred',.5],['komp',.45]]],['Wielka wizja','Dobrze brzmi, ale jest pusta.',1,[['fame',.35],['char',.25]]],['Wina poprzedników','Negatyw mobilizuje tylko część widowni.',0,[['ctr',-.5],['fame',.2]]]]},
    {q:'Komentarze pod spotem zaczynają żyć własnym życiem.',o:[['Odpowiadam spokojnie','Moderacja i dialog ratują przekaz.',2,[['cred',.45],['uni',.3]]],['Dolewam oliwy','Zasięg rośnie, reputacja płonie.',1,[['fame',.45],['ctr',-.55]]],['Wyłączam komentarze','Porządek kosztem wiarygodności.',0,[['cred',-.35],['act',.2]]]]},
    {q:'Ostatnie ujęcie ma pokazać lidera.',o:[['Wśród ludzi','Kontakt jest ważniejszy niż pomnik.',2,[['char',.45],['fame',.35]]],['Przy biurku','Kompetencja i urząd.',1,[['komp',.5],['cred',.25]]],['Na tle logo','Marka partii zostaje, człowiek znika.',0,[['fame',.25],['char',-.3]]]]}
  ]
};
function miniWartosc(o){
  const p=me(),ld=lead(G.me),wart=k=>k==='komp'||k==='char'||k==='wytrz'||k==='autor'?ld[k]||0:p[k]||0;
  return Math.round((o[2]||0)+((o[3]||[]).reduce((s,[k,w])=>s+wart(k)*w/100,0))+R(-.35,.35));
}
function miniGra(typ){
  if(PROBA){pend.miniDone=1;pend.miniBonus=0;return step()}
  if(!pend.mini){const pula=(MINI_PYTANIA[typ]||[]).slice().sort(()=>rnd()-.5);pend.mini={r:0,score:0,pytania:pula.slice(0,3)};}
  const m=pend.mini,deb=typ==='debata',nr=m.r+1,q=m.pytania[m.r]||MINI_PYTANIA[typ][0];
  modal(deb?`Debata · runda ${nr}`:`Spot · decyzja ${nr}`,pend.a.n,
    `<p>${q.q}</p><div class="note">Odpowiedź ma wagę zależną od twoich cech. Nie ma jednej zawsze dobrej opcji.</div>`,
    q.o.map(o=>({l:o[0],s:o[1],f:()=>{m.score+=miniWartosc(o);m.r++;close();if(m.r<3)miniGra(typ);else{pend.miniBonus=Math.round(m.score-6);pend.miniDone=1;step()}}})),
    ()=>{pend=null;close();render()});
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
  const tydz2Przed=a.tydz2?((G.tydz2Times&&Array.isArray(G.tydz2Times[a.id]))?G.tydz2Times[a.id].slice():[]):null;
  const f=fat(a.id);
  if(!G.usedTimes)G.usedTimes={};
  ostatnieUzycia(a.id);
  G.usedTimes[a.id].push(czasGlobalny());G.used[a.id]=G.usedTimes[a.id].length;
  // limity zapisujemy razem z kosztem, żeby rezygnacja w oknie cofnęła jedno i drugie
  G.stolSeq=(G.stolSeq||0)+1;
  const stolToken=G.stolSeq;
  const czasPrzed={dzien:G.dzienTygodnia||1,czas:G.czasTygodnia||0,godz:G.czasGodzTygodnia||0,h:G.godzina||8,
    simHour:typeof G.simHour==='number'?G.simHour:null,odnowa:G.odnowy&&G.odnowy[a.id]||0};
  G.lastCharge={ap:a.ap,kp:Math.round(a.kp*kpMul),en:(a.en>0?a.en*enMul:a.en),id:a.id,cat:a.cat,token:stolToken,
                czasPrzed,
                term1:limitStad,once:razStad,
                /* Cofnięcie musi przywrócić nie tylko walutę. Te trzy pola
                   sterują karą za pusty tydzień, kombinacją i limitem dwa razy
                   na tydzień; bez ich poprzedniego stanu cofnięta decyzja nadal
                   była liczona jako zagrana. */
                used2Przed:null,
                tydz2Przed,
                lastRealActionAtPrzed:G.lastRealActionAt,
                lastActPrzed:G.lastAct,
                actedWeekPrzed:G.actedWeek};
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
  /* Sąd nie daje autorowi ustawy immunitetu. Brudna zagrywka zostawia za to
     materiał procesowy, który przez kilka tygodni podbija szansę skazania. */
  if(a.cat==='bru'&&lawDone('sady')){
    sadTrop(G.me,12+Math.max(0,p.ctr-c0)*.7+Math.max(0,p.pret-pr0)*.5);
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
  /* Ruch wszedł do rozliczenia: od tej chwili widać, ile dni zajęła ta
     decyzja. Limit kategorii i akcje nadal są tygodniowe, więc nie da się
     obejść zasad przez szybkie klikanie. */
  const dni=czasAkcji(a),wpisCzas=przesunCzas(dni,a);
  const cyklDecyzji=decyzjaStart(a,wpisCzas);
  if(!G.odnowy)G.odnowy={};
  G.odnowy[a.id]=czasGlobalny()+czasOdnowy(a);
  if(a.tydz2){
    if(!G.tydz2Times)G.tydz2Times={};
    if(!Array.isArray(G.tydz2Times[a.id]))G.tydz2Times[a.id]=[];
    G.tydz2Times[a.id].push(czasGlobalny());
  }
  if(G.lastCharge){G.lastCharge.czasSeq=wpisCzas&&wpisCzas.seq;G.lastCharge.decisionToken=cyklDecyzji&&cyklDecyzji.token}
  G.catUsed[a.cat]=(G.catUsed[a.cat]||0)+1;
  if(a.cat!=='spe'){
    if(!G.catTimes)G.catTimes={};
    if(!Array.isArray(G.catTimes[a.cat]))G.catTimes[a.cat]=[];
    G.catTimes[a.cat].push(czasGlobalny());
  }
  if(msg)say(`<b>${a.n}.</b> ${msg} <span class="dim">Czas: ${dni} ${pl(dni,'dzień','dni','dni')}.</span>`);
  else if(!PROBA)say(`<b>${a.n}.</b> Decyzja rozpoczęta. Potrwa około ${dni} ${pl(dni,'dzień','dni','dni')}.`,'roy');
  const decyzjaZla=p.fame<f0-4||p.ctr>c0+10;
  if(decyzjaZla&&typeof pkbCios==='function'){
    const sila=Math.min(5,1+Math.max(0,p.ctr-c0)/8+Math.max(0,f0-p.fame)/7);
    pkbCios(a.id,sila,`${a.n} pogorszyła zaufanie do obrotu`);
  }
  if(decyzjaZla)shake();
  SFX.action(a.cat,decyzjaZla);
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
  G.lastRealActionAt=czasGlobalny();
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
  if(msg)stolWpis(a,stolPrzed,stolToken);
  else G.stolPend={id:a.id,n:a.n,kat:a.cat,ap:a.ap,przed:stolPrzed,token:stolToken,tydzien:stolKlucz};
  checkDeath();
  // uwaga: decyzje z własnym oknem (nabór, rekonstrukcja, ustawa, rebranding) otwierają je w a.f,
  // więc fire nie może tu zamykać niczego, bo skasowałby okno w tej samej klatce
  pend=null;render();
}
/* Oddanie opłaty za decyzję, która nie doszła do skutku. Wydzielone z actBack,
   bo to samo musi się dziać, gdy okno zniknie bez kliknięcia „wstecz”. */
/* Dopisanie decyzji do stołu tygodnia razem z tym, co realnie zmieniła. */
function stolWpis(a,przed,token){
  /* Stół jest kroczący: zmiana tygodnia nie może wyczyścić wykonanych ruchów. */
  const now=czasGlobalny();
  if(!Array.isArray(G.stol))G.stol=[];
  G.stol=G.stol.filter(x=>x&&(!Number.isFinite(Number(x.at))||now-Number(x.at)<168));
  if(token&&G.stol.some(x=>x&&x.token===token))return;   // podwójne kliknięcie nie mnoży ruchu
  const po=snap(), zm={};
  /* Wszystko poniżej pół punktu zaokrąglało się do zera i znikało ze stołu —
     decyzja realnie dawała +0,4 sławy, a gracz widział, że nie dała nic.
     Drobne przyrosty pokazujemy więc z jednym miejscem po przecinku. */
  ['fame','cred','uni','act','mem'].forEach(k=>{
    const d=po[k]-(przed?przed[k]:po[k]);
    if(Math.abs(d)>=1)zm[k]=Math.round(d);
    else if(Math.abs(d)>=0.12)zm[k]=Math.round(d*10)/10;});
  G.stol.push({id:a.id,n:a.n,kat:a.cat,ap:a.ap,zm,token:token||null,ok:1,at:now});
  if(G.stol.length>12)G.stol=G.stol.slice(-12);
}
/* Decyzja okienkowa doszła do skutku — dopiero teraz ląduje na stole. */
function stolZatwierdz(){
  const w=G&&G.stolPend; if(!w)return;
  G.stolPend=null;
  if(w.tydzien!==G.term+'-'+G.week)return;               // stare okno nie dopisze się do nowego tygodnia
  stolWpis({id:w.id,n:w.n,cat:w.kat,ap:w.ap},w.przed,w.token);
}
function oddajOplate(){
  if(G)G.stolPend=null;          // rezygnacja zdejmuje decyzję ze stołu
  const c=G&&G.lastCharge; if(!c)return;
  G.ap+=c.ap;G.kp+=c.kp;G.en=cl(G.en+c.en);
  if(G.usedTimes&&Array.isArray(G.usedTimes[c.id]))G.usedTimes[c.id].pop();
  if(G.used[c.id])G.used[c.id]--;
  if(G.catUsed[c.cat])G.catUsed[c.cat]--;
  if(c.cat!=='spe'&&G.catTimes&&Array.isArray(G.catTimes[c.cat]))G.catTimes[c.cat].pop();
  if(Array.isArray(c.tydz2Przed)){
    if(!G.tydz2Times)G.tydz2Times={};
    if(c.tydz2Przed.length)G.tydz2Times[c.id]=c.tydz2Przed.slice();
    else delete G.tydz2Times[c.id];
  }
  /* Limit „raz na kadencję” zużywa się dopiero wtedy, gdy gracz naprawdę coś
     zatwierdzi. Wcześniej wystarczyło zajrzeć w zmianę przewodniczącego
     i wycofać się, żeby stracić ją na całą kadencję. */
  if(c.term1)delete G.useTerm[c.id];
  if(c.once)delete G.once[c.id];
  if(G.lastAct===c.id)G.lastAct=c.lastActPrzed||null;
  if(G.actedWeek===G.term+'-'+G.week)G.actedWeek=c.actedWeekPrzed||null;
  if(c.lastRealActionAtPrzed===undefined)delete G.lastRealActionAt;
  else G.lastRealActionAt=c.lastRealActionAtPrzed;
  if(c.czasPrzed){G.dzienTygodnia=c.czasPrzed.dzien;G.czasTygodnia=c.czasPrzed.czas;G.czasGodzTygodnia=c.czasPrzed.godz;G.godzina=c.czasPrzed.h;if(c.czasPrzed.simHour!==null)G.simHour=c.czasPrzed.simHour;if(Array.isArray(G.harmonogram)&&c.czasSeq)G.harmonogram=G.harmonogram.filter(x=>x.seq!==c.czasSeq)}
  if(c.decisionToken&&Array.isArray(G.decisionLog)){const d=G.decisionLog.find(x=>x&&x.token===c.decisionToken);if(d){d.status='CANCELLED';d.cancelledAt=czasGlobalny()}}
  if(!G.odnowy)G.odnowy={};if(c.czasPrzed)G.odnowy[c.id]=c.czasPrzed.odnowa;else delete G.odnowy[c.id];
  G.lastCharge=null;
}
function actBack(){   // rezygnacja w oknie decyzji oddaje to, co pobrała sama decyzja
  oddajOplate();
  pend=null;close();render();
}
/* Zapis nie przechowuje otwartego okna wyboru. Przy zapisie lub wczytaniu
   oddajemy opĹ‚atÄ™ i anulujemy wpis, zamiast blokowaÄ‡ grÄ™ niewidzialnym krokiem. */
function anulujNiedokonczonaDecyzje(){
  if(!G)return;
  if(G.lastCharge)oddajOplate();
  G.stolPend=null;pend=null;
  if(typeof NABOR!=='undefined')NABOR=null;
  if(typeof WYW!=='undefined')WYW=null;
  if(typeof LIVE!=='undefined')LIVE=null;
}
function chooseReg(){const p=me();
  modal('Wybór okręgu',pend.a.n,`<p>${pend.a.d}</p>`,REG.map(r=>({l:r.n,
    s:`${r.seats} ${pl(r.seats,'mandat','mandaty','mandatów')} · obecność ${Math.round(p.pres[r.id])}/100 · ${r.pop} osób`,
    f:()=>{pend.r=r.id;close();step()}})),()=>{pend=null;close();render()})}
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
      f:()=>{pend.tem=t.id;close();step()}})),()=>{
        /* Przy wystąpieniu drugi krok wraca do okręgu. Gracz nie powinien
           tracić decyzji tylko dlatego, że zajrzał do listy tematów. */
        if(pend&&pend.r){pend.r=null;close();chooseReg()}
        else{pend=null;close();render()}
      })}
function chooseTgt(){
  modal('Wybór celu',pend.a.n,`<p>${pend.a.d}</p>`,alive().filter(k=>k!==G.me).map(k=>({
    l:`${G.p[k].n}, ${G.p[k].lead}`,
    s:`relacje ${G.rel[G.me][k]>0?'+':''}${Math.round(G.rel[G.me][k])} · sława ${Math.round(G.p[k].fame)} · ${G.p[k].mem} osób · ${G.p[k].seats} mand. · kompetencja lidera ${L(G.p[k].lead).komp}`,
    f:()=>{pend.t=k;close();step()}})),()=>{pend=null;close();render()})}
function chooseSeg(){
  modal('Wybór grupy',pend.a.n,`<p>${pend.a.d}</p>`,SEG.map(s=>({l:s.n,
    s:`dopasowanie ${me().aff[s.id].toFixed(1)} · udział w elektoracie ${Math.round(segShare(s.id)*100)}%`,
    f:()=>{pend.s=s.id;close();step()}})),()=>{pend=null;close();render()})}
function segShare(id){let a=0,b=0;REG.forEach(r=>{const v=regVotes(r);a+=v*r.mix[id];b+=v});return a/b}

/* ---- pula ludzi w rozbiciu na grupy ---- */
function drawFrom(reg,n){
  if(G&&G.p&&G.p[G.me]&&G.p[G.me].postMode&&n>0)n=Math.ceil(n*1.5);   // Postępowcy werbują lepiej, ale już nie podwójnie
  if(G&&G.p&&G.p[G.me]&&G.p[G.me].robMode&&n>0)n=Math.round(n*1.25);   // struktury robotnicze
  const mx=REG.find(r=>r.id===reg).mix, out={eli:0,int:0,ser:0};
  for(let i=0;i<n;i++){
    const order=SID.slice().sort((a,b)=>(mx[b]*rnd())-(mx[a]*rnd()));
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
  SFX.select();
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
      const roll=rnd();
      let gr = roll<.90?'ser' : roll<.99?'int' : 'eli';
      if(G.free[gr]<1)gr=G.free.ser>0?'ser':G.free.int>0?'int':G.free.eli>0?'eli':null;
      if(!gr)break;
      got[gr]++;G.free[gr]--;p.comp[gr]++;p.mem++;taken++;
    }
    g=taken;
    p.act=cl(p.act+3);p.pres[reg]=cl(p.pres[reg]+8);
    if(g>=2)M(p,5); else if(g===0)M(p,-3);
    const cooldown=hasT('sieciowiec')?4:6;
    G.recCd=cooldown;                 // pole zgodności dla starych zapisów
    G.recCdAt=czasGlobalny()+cooldown*168;
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
