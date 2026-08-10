'use strict';
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
  const lider=zywe.find(x=>G.p[x].seats===naj);
  if(k===lider){
    const drugi=Math.max(...zywe.filter(x=>x!==lider).map(x=>G.p[x].seats),0);
    const przewaga=(naj-drugi)/Math.max(1,naj);
    return 1-cl(przewaga*.40,0,.30);        // wygrany płaci za zbyt dużą przewagę
  }
  const luka=cl((naj-G.p[k].seats)/naj,0,1);
  return 1+luka*BAL.doganianieSila;
}
/* Serwer szybko przyzwyczaja się do jednego zwycięzcy. To nie jest kara za
   bycie dużą partią, tylko miękki hamulec na serię: po każdym kolejnym
   zwycięstwie tej samej partii część niezdecydowanych szuka kogoś nowego.
   Liczymy wyłącznie pełne, zakończone wybory z historii, więc podgląd i
   pierwsza kadencja nie dostają sztucznego minusa. */
function wyborczeZnuzenie(k){
  const h=G&&G.hist||[];let seria=0;
  for(let i=h.length-1;i>=0;i--){
    const s=h[i]&&h[i].seats;if(!s)break;
    const zywe=Object.keys(s).filter(x=>G.p[x]&&!G.p[x].dead);
    if(!zywe.length)break;
    const lider=zywe.sort((a,b)=>(s[b]||0)-(s[a]||0))[0];
    if(lider!==k)break;
    seria++;
  }
  /* Seria byÅ‚a zbyt Å‚agodna: PPP potrafiÅ‚o wygrywaÄ‡ prawie kaÅ¼de wybory,
     mimo Å¼e reszta sceny miaÅ‚a juÅ¼ ludzi i urzÄ™dy. Po drugim zwyciÄ™stwie
     zmÄ™czenie ma byÄ‡ widoczne, ale nigdy nie kasuje dobrze prowadzonej partii. */
  return cl(1-seria*.085,.65,1);
}
function score(k,r,s){
  const p=G.p[k]; if(p.dead)return 0;
  const a=p.aff[s.id]; if(a<=.05)return .0006;
  const ld=lead(k);
  let v=Math.pow(a,1.32)*Math.pow(Math.max(.1,p.pull),BAL.pullWykladnik);
  /* PPP pozostaje mocna i grywalna dla człowieka, ale komputer nie może
     wygrywać samym dziedzictwem startowego szyldu. Hamulec dotyczy wyłącznie
     partii sterowanej przez AI, więc wybór PPP nie jest karą dla gracza. */
  if(k==='PPP'&&k!==G.me)v*=.65;
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
  if(p.ctr>=96)v*=.68;  // twardy paraliż dopiero przy skrajnym skandalu
  v*=(1-znuzenie(k)/BAL.znuzenieSilaSondaz);   // zmęczenie władzą
  v*=doganianie(k);                            // głos protestu idzie do słabszych
  v*=wyborczeZnuzenie(k);                     // seria zwycięstw nie może zabetonować sejmu
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
    if(G.p[k].ctr>=96)m*=.68;  // paraliż kontrowersji osłabia, ale nie kasuje elektoratu
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
  /* DEV nie zmienia zwyklej matematyki dla normalnej gry. W trybie testowym
     cala pula trafia do wybranej partii, dzieki czemu kazdy ekran widzi
     rzeczywiste 100%, a nie tylko statystyke ustawiona na karcie. */
  if(G.devMode&&G.me&&res[G.me]){
    PID.forEach(k=>{res[k].tot=0;Object.keys(res[k].reg).forEach(r=>res[k].reg[r]=0)});
    REG.forEach(r=>{res[G.me].reg[r.id]=rv[r.id]});
    res[G.me].tot=total;
  }
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
