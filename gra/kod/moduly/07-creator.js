'use strict';
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
  const cel=e=>e.target.closest&&e.target.closest('.qtip,.act[data-tip]');
  document.addEventListener('mouseover',e=>{const t=cel(e);if(t&&!t.contains(e.relatedTarget))pokaz(t)});
  document.addEventListener('mouseout',e=>{const t=cel(e);if(t&&!t.contains(e.relatedTarget))ukryj()});
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
const CICHO_TEST=typeof location!=='undefined'&&new URLSearchParams(location.search).has('mute');
const sndOn=()=>!CICHO_TEST&&!(G&&G.mute);
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
/* Krótki szum robi z interfejsu przedmiot: papier, pieczęć i przesuwanie żetonu
   nie brzmią jak kolejna nutka z syntezatora. Jest celowo cichy i filtrowany,
   żeby po kilkudziesięciu kliknięciach nie męczył ani nie zjadał muzyki. */
function szum(d,vol,filtr=1200){
  if(PROBA||!sndOn())return;const c=ac();if(!c)return;
  try{
    const t=c.currentTime,b=c.createBuffer(1,Math.max(1,Math.ceil(c.sampleRate*d)),c.sampleRate);
    const a=b.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=(Math.random()*2-1)*(1-i/a.length);
    const z=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();
    z.buffer=b;f.type='bandpass';f.frequency.value=filtr;f.Q.value=.65;
    g.gain.setValueAtTime(Math.max(.0001,vol),t);g.gain.exponentialRampToValueAtTime(.0001,t+d);
    z.connect(f);f.connect(g);g.connect(c.destination);z.start(t);z.stop(t+d+.02);
  }catch(e){}
}
/* Nie pozwalamy jednemu kliknięciu odpalić dwóch dźwięków: część przycisków ma
   własną reakcję, a cały interfejs dostaje też dyskretny dźwięk z nasłuchu. */
const SND_OSTATNIE={};
function sndRaz(k,ms=45){const n=Date.now();if((SND_OSTATNIE[k]||0)+ms>n)return false;SND_OSTATNIE[k]=n;return true}
const SFX={
  ui:()=>{if(!sndRaz('ui',38))return;beep(610,.035,'triangle',.022,35);szum(.028,.006,2400)},
  click:()=>SFX.ui(),
  modal:()=>{if(!sndRaz('modal',90))return;beep(294,.08,'triangle',.025,65);szum(.045,.008,1450)},
  select:()=>{if(!sndRaz('select',55))return;beep(740,.045,'sine',.025,35)},
  ok:()=>seq([[554,.07,'sine',.035],[740,.09,'triangle',.033],[988,.15,'sine',.029]],58),
  bad:()=>{beep(245,.13,'sawtooth',.03,-72);szum(.09,.012,380)},
  warn:()=>seq([[340,.08,'square',.022],[300,.11,'square',.02]],85),
  week:()=>{szum(.055,.012,720);seq([[294,.06,'triangle',.024],[392,.09,'triangle',.026]],78)},
  coin:()=>seq([[980,.035,'square',.021],[1450,.055,'triangle',.024],[1960,.07,'sine',.018]],48),
  transfer:()=>{szum(.07,.014,980);seq([[392,.06,'triangle',.024],[587,.11,'sine',.028]],70)},
  media:()=>{szum(.055,.012,1950);seq([[660,.04,'triangle',.021],[880,.075,'sine',.02]],55)},
  vote:()=>{szum(.04,.014,560);beep(220,.1,'triangle',.026,25)},
  lawPass:()=>{szum(.09,.018,720);seq([[392,.08,'triangle',.028],[523,.09,'triangle',.03],[784,.18,'sine',.033]],74)},
  lawFail:()=>{szum(.11,.017,410);seq([[330,.08,'sawtooth',.023],[247,.16,'sawtooth',.026]],80)},
  seal:()=>{szum(.12,.026,440);beep(156,.22,'sine',.035,18);setTimeout(()=>beep(624,.11,'triangle',.022),65)},
  veto:()=>{szum(.12,.02,330);seq([[233,.1,'sawtooth',.026],[196,.18,'sawtooth',.03]],86)},
  mile:()=>seq([[523,.12,'sine',.032],[659,.12,'triangle',.032],[784,.15,'triangle',.03],[1047,.28,'sine',.035]],82),
  goal:()=>{SFX.mile();setTimeout(()=>szum(.11,.016,1200),260)},
  enter:()=>{szum(.08,.014,820);seq([[196,.18,'sine',.032],[294,.18,'triangle',.029]],58)},
  elect:()=>{szum(.1,.014,580);seq([[392,.16,'triangle',.034],[523,.16,'triangle',.034],[659,.18,'triangle',.034],[784,.35,'sine',.036]],118)},
  gong:()=>{szum(.12,.016,510);seq([[196,.38,'sine',.043],[294,.34,'sine',.033]],42)},
  action:(cat,zle)=>{
    if(zle)return SFX.bad();
    if(cat==='bru')return SFX.warn();
    if(cat==='kam')return SFX.media();
    if(cat==='org')return SFX.transfer();
    if(cat==='spe')return SFX.coin();
    SFX.ok();
  },
};
let DZWIEK_GOTOWY=false;
function initDzwiek(){
  if(DZWIEK_GOTOWY||typeof document==='undefined')return;DZWIEK_GOTOWY=true;
  document.addEventListener('click',e=>{
    const b=e.target&&e.target.closest&&e.target.closest('button,.act,.law,.resort,.agent,.pickcell,.modecard');
    if(!b||b.disabled||b.getAttribute('aria-disabled')==='true'||b.classList.contains('sndbtn'))return;
    SFX.ui();
  },true);
}
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
