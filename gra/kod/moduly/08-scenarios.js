'use strict';
/* ---- scenariusze ---- */
let SCENSEL=null;
/* ══════════ MODY ══════════
   Mod to jeden plik JSON w katalogu gracza. Celowo nie ma w nim kodu — opisuje
   wyłącznie, co zmienić na starcie, a gra sama to stosuje. Dzięki temu mod od
   kogoś obcego nie może zrobić w grze niczego, czego nie przewidzieliśmy tutaj. */
let MODY=[];
/* Partie i cele zapisane w scenariuszu żyją tylko w tym jednym świecie. Nie
   dopisujemy ich na stałe do wszystkich rozgrywek, bo po wczytaniu dwóch modów
   wybór partii puchłby o cudze szyldy. */
let SCEN_PARTY_KEYS=[],SCEN_GOAL_KEYS=[],SCEN_PARTY_DEFS=[],SCEN_GOAL_DEFS=[],SCEN_EDIT_KEYS=[],SCEN_EDIT_DEFS={};
function scenLogo(d){
  if(d.logo&&/^data:image\//.test(d.logo))return d.logo;
  const ab=String(d.ab||'?').slice(0,4).toUpperCase(),kol=String(d.c||'#596579');
  return 'data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="22" fill="#eee9da"/><path d="M13 13h102v102H13z" fill="${kol}" opacity=".18"/><path d="M21 21h86v86H21z" fill="none" stroke="${kol}" stroke-width="7"/><text x="64" y="75" text-anchor="middle" font-family="Georgia" font-size="${ab.length>3?30:38}" font-weight="700" fill="${kol}">${ab.replace(/[&<>]/g,'')}</text></svg>`);
}
function scenPartiaRejestruj(d){
  if(!d||!d.id)return null;
  const id=String(d.id).replace(/[^A-Za-z0-9_-]/g,'').slice(0,16);if(!id||BASE[id])return null;
  const cz=s=>String(s||'').replace(/[<>&]/g,'').trim(),comp=d.comp||{},st=d.stat||{},lider=cz(d.lider||('Lider '+id)).slice(0,40);
  const eli=Math.max(0,Math.round(+comp.eli||0)),inte=Math.max(0,Math.round(+comp.int||0)),ser=Math.max(0,Math.round(+comp.ser||0));
  const mem=Math.max(1,eli+inte+ser),kol=/^#[0-9a-f]{6}$/i.test(d.c||'')?d.c:'#596579';
  BASE[id]={n:cz(d.nazwa||'Nowa partia').slice(0,42),ab:cz(d.ab||id).slice(0,4).toUpperCase(),c:kol,
    founded:String(d.founded||'01.08.2026').slice(0,14),pull:Math.max(.3,+d.pull||1.2),
    fame:cl(+st.fame||35),cred:cl(+st.cred||45),uni:cl(+st.uni||55),act:cl(+st.act||45),
    ctr:cl(+st.ctr||20),pret:cl(+st.pret||30),mem,pot:cl(+st.pot||75,1,200),diff:cl(Math.round(+d.diff||3),1,5),
    aff:{eli:cl(Math.round(+(d.aff&&d.aff.eli)||4),1,9),int:cl(Math.round(+(d.aff&&d.aff.int)||5),1,9),ser:cl(Math.round(+(d.aff&&d.aff.ser)||5),1,9)},
    comp0:[eli,inte,ser],blurb:String(d.opis||'Partia utworzona w scenariuszu.').slice(0,180),
    flaw:String(d.slabosc||'Jej przyszłość zależy od decyzji gracza.').slice(0,180),scenariusz:1};
  PID.push(id);LP[id]={main:[lider],bench:String(d.zaplecze||'').split(',').map(x=>x.trim()).filter(Boolean).slice(0,10)};
  LEAD[lider]=(d.liderStat||[50,50,50,50]).map(x=>cl(Math.round(+x||50),1,99)).slice(0,4);
  while(LEAD[lider].length<4)LEAD[lider].push(50);
  LOGOS[id]=scenLogo(Object.assign({},d,{c:kol}));SCEN_PARTY_KEYS.push({id,lider});return id;
}
function scenCelRejestruj(d){
  if(!d||!d.id||!d.party||!BASE[d.party])return;
  const id='scen-'+String(d.id).replace(/[^A-Za-z0-9_-]/g,'').slice(0,24),w=d.war||{},n=d.nagroda||{},party=d.party;
  const req=[];
  const licz=(pole,opis,max100=false)=>{if(+w[pole]>0)req.push({t:`${opis} co najmniej ${Math.round(+w[pole])}`,v:()=>`${Math.round(me()[pole])} / ${Math.round(+w[pole])}`,ok:()=>+me()[pole]>=+w[pole]})};
  licz('mem','Osób w partii');licz('fame','Sława');licz('cred','Wiarygodność');licz('uni','Jedność');licz('act','Aktywność');
  if(+w.seats>0)req.push({t:`Co najmniej ${Math.round(+w.seats)} mandatów`,v:()=>`${me().seats} / ${Math.round(+w.seats)}`,ok:()=>me().seats>=+w.seats});
  if(+w.term>1)req.push({t:`Dopiero od kadencji ${Math.round(+w.term)}`,v:()=>`kadencja ${G.term}`,ok:()=>G.term>=+w.term});
  if(+w.kp>0)req.push({t:`Kapitał co najmniej ${Math.round(+w.kp)}`,v:()=>`${Math.round(G.kp)} / ${Math.round(+w.kp)}`,ok:()=>G.kp>=+w.kp});
  if(+w.poll>0)req.push({t:`Sondaż co najmniej ${Math.round(+w.poll)}%`,v:()=>`${fmt(G.lastPoll||0)}%`,ok:()=>(G.lastPoll||0)>=+w.poll});
  if(+w.ctrMax>0)req.push({t:`Kontrowersja najwyżej ${Math.round(+w.ctrMax)}`,v:()=>`${Math.round(me().ctr)} / ${Math.round(+w.ctrMax)}`,ok:()=>me().ctr<=+w.ctrMax});
  if(w.urzad==='premier')req.push({t:'Fotel premiera',v:()=>isPM()?'jest':'brak',ok:isPM});
  if(w.urzad==='prezydent')req.push({t:'Urząd prezydenta',v:()=>hasPrez()?'jest':'brak',ok:hasPrez});
  if(w.urzad==='dowolny')req.push({t:'Premier albo prezydent',v:()=>isPM()?'premier':hasPrez()?'prezydent':'brak',ok:()=>isPM()||hasPrez()});
  if(!req.length)req.push({t:'Rozpocznij rozgrywkę',v:()=>'gotowe',ok:()=>true});
  const cons=[];[['fame','sława'],['cred','wiarygodność'],['uni','jedność'],['act','aktywność'],['kp','kapitał'],['mem','ludzie'],['ap','akcje na tydzień']].forEach(([k,o])=>{if(+n[k])cons.push(`${o} ${+n[k]>0?'+':''}${Math.round(+n[k])}`)});
  if(n.nazwa)cons.push(`nowa nazwa: ${String(n.nazwa).slice(0,42)}`);if(n.ab)cons.push(`nowy skrót: ${String(n.ab).slice(0,4).toUpperCase()}`);
  GOALS[id]={n:String(d.nazwa||'Własny cel').slice(0,70),for:[party],logo:party,bots:0,
    avail:()=>G.me===party,what:String(d.opis||'Cel utworzony przez autora scenariusza.').slice(0,300),req,
    cons:cons.length?cons:['Prestiż i doświadczenie za ukończenie celu.'],run(){const p=me();
      ['fame','cred','uni','act'].forEach(k=>{if(+n[k])p[k]=cl(p[k]+ +n[k])});
      if(+n.kp)G.kp+=+n.kp;if(+n.mem>0){p.comp.ser+=Math.round(+n.mem);p.mem+=Math.round(+n.mem)}
      if(+n.ap)G.apMax=Math.max(1,G.apMax+Math.round(+n.ap)),G.ap=Math.max(G.ap,G.apMax);
      if(n.nazwa)p.n=String(n.nazwa).slice(0,42);if(n.ab)p.ab=String(n.ab).slice(0,4).toUpperCase();if(/^#[0-9a-f]{6}$/i.test(n.c||''))p.c=n.c;
      say(`<b>${String(d.nazwa||'Cel ukończony')}.</b> Scenariusz zmienia dalszą drogę partii.`,'roy');}};
  SCEN_GOAL_KEYS.push(id);
}
/* Edycja wbudowanej partii musi być odwracalna. Ekran wyboru ma już pokazywać
   nazwę, barwę i lidera ze scenariusza, ale po powrocie do zwykłej gry baza ma
   wrócić bajt w bajt do swojego stanu. */
function scenEdycjeAktywuj(edycje){
  Object.keys(edycje||{}).forEach(id=>{
    if(!BASE[id])return;const e=edycje[id]||{},staryLider=LP[id]&&LP[id].main[0];
    SCEN_EDIT_KEYS.push({id,base:JSON.parse(JSON.stringify(BASE[id])),lp:JSON.parse(JSON.stringify(LP[id])),logo:LOGOS[id],nowi:[]});
    const cz=s=>String(s||'').replace(/[<>&]/g,'').trim(),b=BASE[id];if(e.nazwa)b.n=cz(e.nazwa).slice(0,42);if(e.ab)b.ab=cz(e.ab).slice(0,4).toUpperCase();
    if(/^#[0-9a-f]{6}$/i.test(e.c||''))b.c=e.c;if(e.opis)b.blurb=String(e.opis).slice(0,180);if(e.slabosc)b.flaw=String(e.slabosc).slice(0,180);
    if(e.logo&&/^data:image\//.test(e.logo))LOGOS[id]=e.logo;
    if(e.lider&&LP[id]){const n=cz(e.lider).slice(0,40);LP[id].main[0]=n;
      if(!LEAD[n])SCEN_EDIT_KEYS[SCEN_EDIT_KEYS.length-1].nowi.push(n);
      LEAD[n]=(e.liderStat||LEAD[staryLider]||[50,50,50,50]).map(x=>cl(Math.round(+x||50),1,99)).slice(0,4)}
  });
}
function scenPartieWyczysc(wymus){
  if(G&&!wymus)return;
  SCEN_GOAL_KEYS.forEach(id=>delete GOALS[id]);SCEN_GOAL_KEYS=[];
  SCEN_EDIT_KEYS.forEach(x=>{BASE[x.id]=x.base;LP[x.id]=x.lp;if(x.logo===undefined)delete LOGOS[x.id];else LOGOS[x.id]=x.logo;x.nowi.forEach(n=>delete LEAD[n])});SCEN_EDIT_KEYS=[];
  SCEN_PARTY_KEYS.forEach(x=>{delete BASE[x.id];delete LP[x.id];delete LOGOS[x.id];delete LEAD[x.lider];const i=PID.indexOf(x.id);if(i>=0)PID.splice(i,1)});
  SCEN_PARTY_KEYS=[];SCEN_PARTY_DEFS=[];SCEN_GOAL_DEFS=[];SCEN_EDIT_DEFS={};if(!BASE[SEL])SEL='PPP';
}
function scenPartieAktywuj(id,partie,cele,edycje){
  scenPartieWyczysc(true);const s=SCEN[id]||{};SCEN_PARTY_DEFS=JSON.parse(JSON.stringify(partie||s.partieNowe||[]));
  SCEN_GOAL_DEFS=JSON.parse(JSON.stringify(cele||s.cele||[]));SCEN_EDIT_DEFS=JSON.parse(JSON.stringify(edycje||s.edycje||{}));
  scenEdycjeAktywuj(SCEN_EDIT_DEFS);SCEN_PARTY_DEFS.forEach(scenPartiaRejestruj);SCEN_GOAL_DEFS.forEach(scenCelRejestruj);
  if(SCEN_PARTY_DEFS.length)SEL=SCEN_PARTY_DEFS[0].id;
}
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

  /* Kreator zapisuje pelny rozklad mandatow, a nie premie dodawane do starego
     Sejmu. Przyjmujemy go tylko wtedy, gdy naprawde daje dokladnie 40 miejsc.
     Inaczej uszkodzony cudzy plik zostaje zignorowany zamiast tworzyc Sejm 60/40. */
  if(ef.mandatyStart&&typeof ef.mandatyStart==='object'){
    const rozklad={};
    Object.keys(G.p).forEach(k=>rozklad[k]=Math.max(0,Math.round(+ef.mandatyStart[k]||0)));
    if(Object.values(rozklad).reduce((a,n)=>a+n,0)===TOTAL_SEATS){
      Object.keys(G.p).forEach(k=>G.p[k].seats=rozklad[k]);
      /* Stary albo ręcznie poprawiony plik może zmienić mandaty bez opisania
         nowego rządu. Nie zostawiamy wtedy w gabinecie partii z zerem miejsc. */
      if(G.gov){
        G.gov.parties=G.gov.parties.filter(k=>G.p[k]&&G.p[k].seats>0);
        if(!G.gov.parties.includes(G.gov.pm)){G.gov=null;G.pmOk=false}
      }
    }
  }

  if(typeof ef.kapital==='number')G.kp=Math.max(0,G.kp+ef.kapital);
  if(typeof ef.akcje==='number')G.apMax=Math.max(1,G.apMax+ef.akcje),G.ap=G.apMax;
  if(typeof ef.frekwencja==='number')G.turnout=cl(ef.frekwencja,.4,1);
  if(typeof ef.tygodni==='number')G.weeks=Math.max(4,Math.min(24,Math.round(ef.tygodni)));
  if(typeof ef.krolPrzychylnosc==='number')G.king.rel=cl(G.king.rel+ef.krolPrzychylnosc);

  /* Klimat sceny jest jedna decyzja autora, ale relacje pozostaja dwustronne.
     Ustawiamy kazda pare raz i kopiujemy wynik w obie strony, zeby A nie kochalo
     B w chwili, gdy B wedlug swojego panelu prowadzi z A wojne. */
  const klimat={zgoda:32,napiecie:-10,wojna:-34}[ef.relacjeTryb];
  if(typeof klimat==='number'){
    const zywe=alive();
    zywe.forEach((a,i)=>zywe.slice(i+1).forEach(b=>G.rel[a][b]=G.rel[b][a]=klimat));
  }

  if(ef.rzad&&typeof ef.rzad==='object'){
    if(ef.rzad.tryb==='brak'){
      G.gov=null;G.pmOk=false;G.pmProc=null;G.bloc=null;
    }else if(ef.rzad.tryb==='wlasny'){
      const team=[...new Set((ef.rzad.parties||[]).filter(k=>G.p[k]&&!G.p[k].dead&&G.p[k].seats>0))];
      const pm=team.includes(ef.rzad.pm)?ef.rzad.pm:team[0];
      if(pm&&team.length){
        const suma=team.reduce((a,k)=>a+G.p[k].seats,0);
        setGov(team,pm,60);G.gov.minority=suma<MAJ?1:0;G.pmOk=true;
        G.gov.pmLead=pmOsoba(pm)||G.p[pm].lead;G.bloc=null;
      }
    }
  }

  if(ef.prezydent&&typeof ef.prezydent==='object'){
    if(ef.prezydent.tryb==='brak')G.prez=null;
    else if(ef.prezydent.tryb==='partia'&&G.p[ef.prezydent.party]){
      const k=ef.prezydent.party;
      G.prez={party:k,lead:G.p[k].lead,until:G.term+1};
    }
  }
}
/* Scenariusz V4 nie kończy się po pierwszym renderze. Zachowuje osobowości AI,
   wydarzenia i ustawienia świata w samym zapisie G, dzięki czemu cudzy plik jest
   nadal wyłącznie danymi, a kampania może żyć przez wiele kadencji. */
function scenRuntimeStart(d){
  d=d||{};G.aiProfile=JSON.parse(JSON.stringify(d.ai||{}));G.aiMemory=G.aiMemory||{};
  G.scenEvents=JSON.parse(JSON.stringify(d.wydarzenia||[]));G.scenEventState={};G.scenEventPending=null;
  G.scenWorld=JSON.parse(JSON.stringify(d.swiat||{}));const w=G.scenWorld;
  Object.keys(w.relacje||{}).forEach(key=>{const [a,b]=key.split('|'),v=cl(Math.round(+w.relacje[key]||0),-100,100);if(G.rel[a]&&G.rel[b])G.rel[a][b]=G.rel[b][a]=v});
  Object.keys(w.bank||{}).forEach(k=>{if(G.p[k])G.p[k].bank=Math.round(+w.bank[k]||0)});
  Object.keys(w.obecnosc||{}).forEach(k=>{if(!G.p[k])return;Object.keys(w.obecnosc[k]||{}).forEach(r=>{if(G.p[k].pres[r]!==undefined)G.p[k].pres[r]=cl(Math.round(+w.obecnosc[k][r]||0),0,100)})});
  const mnoz=cl(+w.majatekMnoznik||100,10,500)/100;if(mnoz!==1)Object.keys(G.kapPryw||{}).forEach(n=>G.kapPryw[n]=Math.round(G.kapPryw[n]*mnoz));
  if(Array.isArray(w.ustawy)){G.law=G.law||{};w.ustawy.forEach(id=>G.law[String(id).slice(0,20)]=1)}
  const media=w.media||{};if(Object.values(media).some(x=>+x>0)){G.law=G.law||{};G.law.media=1;G.aiMedia=G.aiMedia||{};
    Object.keys(media).forEach(k=>{if(!G.p[k])return;const ile=cl(Math.round(+media[k]||0),0,3);G.aiMedia[k]=G.aiMedia[k]||[];
      ['gazeta','tv','kino'].slice(0,ile).forEach((typ,i)=>{if(!G.aiMedia[k].some(m=>m.typ===typ))G.aiMedia[k].push({typ,nazwa:aiNazwaMedia(k,typ,i),szef:G.p[k].lead,bilans:0,staz:0,serca:0,numery:0,ostatnio:0,ostatnieWyd:-99})})})}
}
function scenEventPartia(e){
  if(e.party==='gracz'||!e.party)return G.me;if(e.party==='losowa'){
    const a=alive().filter(k=>k!==G.me);return a.length?pick(a):G.me}return G.p[e.party]?e.party:null;
}
function scenEventMozna(e,k){
  if(!e||!k||!G.p[k])return false;const w=e.war||{},p=G.p[k],st=G.scenEventState[e.id]||{};
  if(w.term&&G.term!==+w.term)return false;if(w.week&&G.week!==+w.week)return false;
  if(w.odTygodnia&&absWeek()<+w.odTygodnia)return false;if(w.coIle&&absWeek()%Math.max(1,+w.coIle)!==0)return false;
  if(!w.powtarzalne&&st.ile)return false;if(w.przerwa&&st.ostatni&&absWeek()-st.ostatni<+w.przerwa)return false;
  if(w.minMandaty&&p.seats<+w.minMandaty)return false;if(w.maxMandaty&&p.seats>+w.maxMandaty)return false;
  if(w.minSlawa&&p.fame<+w.minSlawa)return false;if(w.maxKontrowersja&&p.ctr>+w.maxKontrowersja)return false;
  if(w.urzad==='premier'&&!(G.gov&&G.gov.pm===k&&G.pmOk))return false;if(w.urzad==='prezydent'&&!(G.prez&&G.prez.party===k))return false;
  if(w.urzad==='opozycja'&&G.gov&&G.gov.parties.includes(k))return false;return true;
}
function scenEventEfekt(k,ef){
  const p=G.p[k];if(!p)return;ef=ef||{};
  ['fame','cred','uni','act','ctr','pret'].forEach(x=>{if(isFinite(+ef[x])&&+ef[x])p[x]=cl(p[x]+ +ef[x])});
  if(+ef.mem>0){const g=drawFrom('polityka',Math.round(+ef.mem));p.comp.eli+=g.eli;p.comp.int+=g.int;p.comp.ser+=g.ser;p.mem+=g.eli+g.int+g.ser}
  if(+ef.mem<0)giveBackCap(p,Math.abs(Math.round(+ef.mem)));
  if(+ef.kapital){if(k===G.me)G.kp+=+ef.kapital;else p.bank=(p.bank||0)+ +ef.kapital}
  if(+ef.obecnosc)REG.forEach(r=>p.pres[r.id]=cl(p.pres[r.id]+ +ef.obecnosc));
  const relK=ef.relPartia==='gracz'?G.me:ef.relPartia;if(relK&&relK!==k&&G.rel[k]&&G.rel[relK]){const v=cl((G.rel[k][relK]||0)+(+ef.rel||0),-100,100);G.rel[k][relK]=G.rel[relK][k]=v}
  if(ef.zmienLidera&&p.bench&&p.bench.length){const old=p.lead,n=p.bench.slice().sort((a,b)=>L(b).avg-L(a).avg)[0];p.lead=n;p.bench=p.bench.filter(x=>x!==n);if(!p.bench.includes(old))p.bench.push(old)}
  if(ef.nazwa)p.n=String(ef.nazwa).slice(0,42);if(ef.ab)p.ab=String(ef.ab).slice(0,4).toUpperCase();if(/^#[0-9a-f]{6}$/i.test(ef.c||''))p.c=ef.c;
  if(ef.ustawa){G.law=G.law||{};G.law[String(ef.ustawa).slice(0,20)]=ef.ustawaWlacz===false?0:1}
}
function scenEventWybierz(e,k,opcja){
  if(!e||!opcja)return;scenEventEfekt(k,opcja.efekty);const st=G.scenEventState[e.id]||{ile:0};st.ile++;st.ostatni=absWeek();G.scenEventState[e.id]=st;
  say(`<b>${esc(e.nazwa)}.</b> ${esc(G.p[k].ab)}: ${esc(opcja.nazwa)}.`,opcja.klasa||'roy');
}
function scenEventAiOpcja(e,k){
  const pr=aiProfil(k);return (e.opcje||[]).map((o,i)=>{const t=o.ai||{},ef=o.efekty||{};let s=1+Math.random()*1.2;
    s+=(+t.agresja||0)*pr.agr+(+t.media||0)*pr.media+(+t.prawo||0)*pr.prawo+(+t.koalicje||0)*pr.koalicje+(+t.rozwoj||0)*pr.bud+(+t.ryzyko||0)*pr.ryzyko;
    s+=(+ef.fame||0)*.025+(+ef.cred||0)*.02+(+ef.uni||0)*.02+(+ef.mem||0)*.04-(+ef.ctr||0)*.012;return {o,i,s}}).sort((a,b)=>b.s-a.s)[0]?.o||e.opcje[0];
}
function scenEventPokaz(e,k){
  if(PROBA||!e||!k)return;modal(esc(e.kategoria||'Wydarzenie scenariusza'),esc(e.nazwa),`<p>${esc(e.opis||'')}</p><p class="dim" style="margin-top:10px">Dotyczy: <b>${esc(G.p[k].n)}</b></p>`,
    (e.opcje||[]).map(o=>({l:esc(o.nazwa||'Wybieram'),s:esc(o.opis||''),f:()=>{scenEventWybierz(e,k,o);G.scenEventPending=null;close();render()}})),
    ()=>{const o=(e.opcje||[])[0];if(o)scenEventWybierz(e,k,o);G.scenEventPending=null;close();render()});
}
function scenWydarzeniaTydzien(){
  if(PROBA||!G.scenEvents||!G.scenEvents.length)return;let pokaz=null;
  G.scenEvents.forEach(e=>{const k=scenEventPartia(e);if(!scenEventMozna(e,k))return;
    if(k===G.me&&!pokaz)pokaz={e,k};else{const o=scenEventAiOpcja(e,k);if(o)scenEventWybierz(e,k,o)}});
  if(pokaz&&!G.scenEventPending)G.scenEventPending={id:pokaz.e.id,k:pokaz.k};
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
      zModa:true, autor:String(m.autor||'').slice(0,40),efekty:m.efekty||{},partieNowe:m.partieNowe||[],cele:m.cele||[],
      edycje:m.edycje||{},ai:m.ai||{},wydarzenia:m.wydarzenia||[],swiat:m.swiat||{},
      apply(){try{modEfekty(m.efekty);scenRuntimeStart(m)}catch(e){}}
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
          <span class="scenopis">${esc(x.d)}</span>
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
function pickScen(id){SCENSEL=id;scenPartieAktywuj(id);MODE='free';SFX.click();render()}

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
     [{l:'Wybieram partię',f:()=>{close();MODE='free';scenPartieAktywuj(SCENSEL);render()}},
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
const kreNowaZnajdz=k=>KRE&&Array.isArray(KRE.nowe)?KRE.nowe.find(x=>x.id===k):null;
function krePartiaDane(k){
  const x=kreNowaZnajdz(k);if(x){const c=x.comp||{};return {n:x.nazwa,ab:x.ab,c:x.c,founded:x.founded,
    fame:x.stat.fame,cred:x.stat.cred,uni:x.stat.uni,act:x.stat.act,ctr:x.stat.ctr,pret:x.stat.pret,pot:x.stat.pot,
    mem:(+c.eli||0)+(+c.int||0)+(+c.ser||0),comp0:[+c.eli||0,+c.int||0,+c.ser||0],diff:x.diff||3,
    blurb:x.opis||'Nowa partia scenariusza.'}}
  const b=(G&&G.p&&G.p[k])||BASE[k]||{n:k,ab:k,c:'#8a8a8a',comp0:[0,0,1],mem:1},e=KRE&&KRE.edycje&&KRE.edycje[k];
  return e?Object.assign({},b,{n:e.nazwa||b.n,ab:e.ab||b.ab,c:e.c||b.c,blurb:e.opis||b.blurb,flaw:e.slabosc||b.flaw}):b;
}
const krePartieLista=()=>Object.keys(BASE).concat(KRE&&KRE.nowe?KRE.nowe.map(x=>x.id):[]);
function kreHerb(k,roz='s'){
  const x=kreNowaZnajdz(k),e=KRE&&KRE.edycje&&KRE.edycje[k];if(!x&&!e)return crest(k,roz);
  const px=roz==='l'?56:roz==='m'?46:30;
  const d=x||Object.assign({},krePartiaDane(k),{logo:e.logo});return `<img class="crest ${roz}" src="${e&&e.logo?e.logo:scenLogo(d)}" alt="${esc(d.ab)}" style="width:${px}px;height:${px}px">`;
}
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
