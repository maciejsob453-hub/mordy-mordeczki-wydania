'use strict';
/* ══════════ CHARAKTERY PARTII ══════════
   Te same liczby, inne nawyki. Awanturnicy biją, dyplomaci budują relacje,
   spokojni rozbudowują partię. Bez tego wszystkie czternaście gra identycznie. */
const CHAR={
 PPP :{agr:.68,bud:.60},  KK  :{agr:.25,bud:.75},  FD  :{agr:.55,bud:.70},
 PLR :{agr:.40,bud:.80},  NP  :{agr:.35,bud:.85},  PKD :{agr:.30,bud:.70},
 ROM :{agr:.60,bud:.60},  PP  :{agr:.50,bud:.75},  POJ :{agr:.78,bud:.50},
 NBR :{agr:.45,bud:.65},  ZHM :{agr:.35,bud:.65},  DPD :{agr:.35,bud:.72},
 SS  :{agr:.35,bud:.90},
};
/* Tematy są tożsamością partii. Dzięki nim AI nie tylko „rozwija się” albo
   „atakuje”, ale ma powód, żeby poprzeć konkretną ustawę. */
const AI_AGENDA={
 PPP:['media','event','zagadki'],POJ:['media','event','podatki'],
 KK:['konst','sady','kodeks'],PLR:['konst','ordyn','mordepedia'],
 FD:['ekon','podatki','man'],NP:['ekon','man','mordepedia'],DPD:['sady','man','ordyn'],
 PKD:['podatki','ekon','ordyn'],PP:['media','cytaty','zagadki'],SS:['media','mordepedia'],
 NBR:['konst','sady','podatki'],ZHM:['sady','kodeks','konst'],ROM:['ordyn','konst','event']
};
const AI_STYLE={
 domyslny:{n:'Charakter historyczny',agr:.5,bud:.7,media:.55,prawo:.55,koalicje:.55,ryzyko:.5},
 agresor:{n:'Agresor',agr:.95,bud:.38,media:.55,prawo:.28,koalicje:.18,ryzyko:.9},
 technokrata:{n:'Technokrata',agr:.18,bud:.76,media:.32,prawo:.98,koalicje:.62,ryzyko:.3},
 populista:{n:'Medialny populista',agr:.66,bud:.54,media:.98,prawo:.32,koalicje:.3,ryzyko:.78},
 koalicjant:{n:'Budowniczy koalicji',agr:.12,bud:.68,media:.42,prawo:.6,koalicje:.98,ryzyko:.22},
 organizator:{n:'Organizator',agr:.2,bud:.98,media:.35,prawo:.52,koalicje:.58,ryzyko:.24},
 oportunista:{n:'Oportunista',agr:.55,bud:.62,media:.7,prawo:.62,koalicje:.76,ryzyko:.82},
};
function aiProfil(k){
  const cfg=G&&G.aiProfile&&G.aiProfile[k],hist=CHAR[k]||{agr:.5,bud:.7},typ=cfg&&AI_STYLE[cfg.typ]?cfg.typ:'domyslny';
  const p=Object.assign({},AI_STYLE[typ]);if(typ==='domyslny')Object.assign(p,hist);
  [['agresja','agr'],['rozwoj','bud'],['media','media'],['prawo','prawo'],['koalicje','koalicje'],['ryzyko','ryzyko']].forEach(([a,b])=>{if(cfg&&isFinite(+cfg[a])&&+cfg[a]>=0)p[b]=cl(+cfg[a]/100,0,1)});
  p.typ=typ;p.agenda=cfg&&Array.isArray(cfg.agenda)?cfg.agenda.slice():((AI_AGENDA[k]||['ekon','media','sady']).slice());return p;
}
const charOf=k=>aiProfil(k);
const aiAgenda=k=>aiProfil(k).agenda||[];
function aiPamiec(k){
  if(!G.aiMemory)G.aiMemory={};const m=G.aiMemory[k]||(G.aiMemory[k]={wrog:null,sojusznik:null,zdrady:{},wpisy:[]}),inni=alive().filter(x=>x!==k);
  m.wpisy=Array.isArray(m.wpisy)?m.wpisy:[];
  if(inni.length){m.wrog=inni.slice().sort((a,b)=>(G.rel[k][a]||0)-(G.rel[k][b]||0))[0];m.sojusznik=inni.slice().sort((a,b)=>(G.rel[k][b]||0)-(G.rel[k][a]||0))[0]}return m;
}
/* Relacja ma mieć pamięć zdarzeń, nie tylko bieżącą liczbę. */
function aiPamietaj(k,typ,dane){
  const m=aiPamiec(k);m.wpisy.push({t:absWeek(),typ,dane:dane||{}});
  if(m.wpisy.length>18)m.wpisy.splice(0,m.wpisy.length-18);
  if(!Array.isArray(G.aiLedger))G.aiLedger=[];
  G.aiLedger.push({t:absWeek(),k,typ,dane:dane||{}});
  if(G.aiLedger.length>80)G.aiLedger.splice(0,G.aiLedger.length-80);
}

/* Na co partia stawia w danym tygodniu. Na początku kadencji buduje zaplecze,
   pod koniec rzuca wszystko w obecność i sławę, bo to one liczą się przy urnach. */
function aiWagi(k,p){
  const c=charOf(k), t=G.week/Math.max(1,G.weeks);
  const koniec=t>.62, start=t<.34;
  /* Zamiar na kadencję przechyla wagi: kto idzie po fotel premiera, ciśnie na mandaty,
     kto ratuje się przed progiem, zbiera ludzi i łata jedność. */
  const plan=p.plan||'rozbudowa';
  const P={
    premier:    {slawa:.10,obecnosc:.14,ludzie:.02,kondycja:0,   atak:.04},
    wladza:     {slawa:.05,obecnosc:.06,ludzie:.04,kondycja:.06, atak:.02},
    opozycja:   {slawa:.09,obecnosc:.05,ludzie:.02,kondycja:.02, atak:.12},
    rozbudowa:  {slawa:.02,obecnosc:.03,ludzie:.14,kondycja:.06, atak:0},
    przetrwanie:{slawa:.06,obecnosc:.10,ludzie:.10,kondycja:.12, atak:-.03},
  }[plan]||{};
  const b=n=>P[n]||0;
  // gdy ktoś odjeżdża reszcie stawki, opozycja twardnieje i częściej bije
  const heg=hegemon(), zagrozenie=(heg&&heg!==k)?.09:0;
  return [
    ['slawa',    .16+(koniec?.24:0)+(p.fame<38?.12:0)+b('slawa')],
    ['kondycja', .13+(start?.10:0)+(p.uni<44?.16:0)+(p.cred<40?.08:0)+b('kondycja')],
    ['ludzie',   .10+.14*c.bud+(start?.12:0)-(koniec?.10:0)+b('ludzie')],
    ['obecnosc', .20+(koniec?.28:0)+b('obecnosc')],
    ['program',  .06+(start?.05:0)],
    ['atak',     .04+.14*c.agr*(koniec?1.5:1)*(p.ctr>68?.15:1)+b('atak')+zagrozenie],
  ];
}
function aiLos(wagi){
  const suma=wagi.reduce((a,x)=>a+Math.max(0,x[1]),0)||1;
  let x=rnd()*suma;
  for(const [n,w] of wagi){x-=Math.max(0,w);if(x<=0)return n}
  return wagi[0][0];
}
/* Gdzie dokładać obecność: nie tam, gdzie jesteśmy najsłabsi, tylko tam, gdzie
   mały wysiłek realnie przewróci wynik — duży kanał, w którym siedzimy tuż za liderem. */
function aiOkreg(k,p){
  let naj=null,najW=-1;
  REG.forEach(r=>{
    const moja=p.pres[r.id];
    let rywal=0;alive().forEach(x=>{if(x!==k)rywal=Math.max(rywal,G.p[x].pres[r.id])});
    const luka=rywal-moja;
    const szansa=luka<=0?1.15:luka<26?1.7:.45;      // blisko lidera albo już na czele
    const w=r.seats*szansa*(moja<10?.55:1)*(.85+rnd()*.3);
    if(w>najW){najW=w;naj=r}
  });
  return naj||pick(REG);
}
/* W kogo uderzyć: w najgroźniejszego, z którym i tak jest źle, a nie w przypadkowego. */
function aiCel(k,prog){
  const heg=hegemon(),pam=aiPamiec(k);
  // Przeciw komuś, kto odjeżdża całej stawce, partie zwierają szeregi nawet wtedy,
  // gdy formalnie nic do niego nie mają — dlatego hegemon łapie się na cel mimo dobrych relacji.
  const kand=alive().filter(x=>x!==k&&(G.rel[k][x]<prog||x===heg));
  if(!kand.length)return null;
  return kand.map(x=>({x,w:(G.p[x].seats*2.2+G.p[x].fame/3+(G.p[x].mom||0))*(x===heg?2.4:1)*(x===pam.wrog?1.65:1)*(1+Math.min(1.2,(pam.zdrady[x]||0)*.28))*(.8+rnd()*.4)}))
    .sort((a,b)=>b.w-a.w)[0].x;
}

/* Sąd też ma być częścią polityki, a nie ekranem, który otwiera wyłącznie
   gracz. Bot może wnieść sprawę wtedy, gdy ma realny trop i odwagę, ale robi to
   najwyżej raz w tygodniu. Tryb cichy omija zasoby gracza i pokazuje skutek
   dopiero w kronice albo komunikacie, jeśli sprawa dotyczy jego partii. */
function aiSad(k){
  if(typeof sadWnies!=='function'||typeof sadSklad!=='function'||!lawDone('sady'))return;
  if(sadSklad().length<2)return;
  G.aiCourtWeek=G.aiCourtWeek||{};
  if(G.aiCourtWeek[k]===absWeek()||!ch(.012+aiProfil(k).ryzyko*.028))return;
  const cel=aiCel(k,10);if(!cel||cel===k||!G.p[cel]||G.p[cel].dead)return;
  const nick=G.p[cel].lead;
  const typ=['urzad','korupcja','procedura'][RI(0,2)];
  const wynik=sadWnies(nick,typ,true);G.aiCourtWeek[k]=absWeek();
  if(!wynik)return;
  aiPamietaj(k,'pozew',{cel,zarzut:typ,wyrok:wynik.wyrok,wygrana:wynik.win});
  aiPamietaj(cel,'pozew_otrzymany',{sprawca:k,zarzut:typ,wyrok:wynik.wyrok});
  if(cel===G.me)say(`<b>${G.p[k].ab} kieruje sprawę do sądu.</b> ${wynik.win?'Zapadł wyrok: '+wynik.wyrok+'.':'Sędziowie oddalili ich zarzut.'}` ,wynik.win?'bad':'good');
}

function ai(){
  alive().forEach(k=>{
    if(k===G.me)return;const p=G.p[k],ld=lead(k);
    /* Plan nie jest już wyrokiem na całą kadencję. Gdy partia straci rząd,
       mandaty albo zjedzie pod próg, zmienia priorytet i pamięta dlaczego. */
    if(p.planTerm===G.term&&p.plan){
      const nowy=aiPlan(k);
      if(nowy!==p.plan&&((p.plan==='wladza'&&!(G.gov&&G.gov.parties.includes(k)))||(p.plan==='premier'&&p.seats<3)||(p.plan==='rozbudowa'&&p.mem<8))){
        const stary=p.plan;p.plan=nowy;aiPamietaj(k,'zmiana_planu',{z:stary,na:nowy});
        say(`<b>${p.ab}</b> zmienia cel: ${PLAN_OPIS[nowy]||nowy}.`,'');
      }
    }
    /* Bot ma ten sam tygodniowy limit ruchow co gracz. */
    p.aiAp=Math.max(2,Math.min(4,3+(p.uni>=78?1:0)));
    aiZrzutka(k);          // po prywatne pieniądze sięga tylko partia pod kreską
    aiMedia(k);            // boty prowadzą własne wydawnictwa i też mają z nich zasięg
    const wagi=aiWagi(k,p);
    while(p.aiAp>0){
      const ruch=aiLos(wagi);
      p.aiAp--;
      aiPamietaj(k,'ruch',{typ:ruch,pozostalo:p.aiAp});
      if(ruch==='slawa'){const d=Math.max(.15,1-Math.pow(cl(p.fame/Math.max(p.pot,1),0,1.4),2.4));
        p.fame=cl(p.fame+R(1.8,4.4)*(.6+p.pot/150)*d*(.8+ld.char/250))}
      else if(ruch==='kondycja'){p.cred=cl(p.cred+R(1,2.8));p.uni=cl(p.uni+R(1,2.6))}
      else if(ruch==='ludzie'){if(ch((.60+p.fame/220)*cl(1-(p.mem-16)/62,.12,1)+(isEraNiestab()?.05:0))){const rg=aiOkreg(k,p),gt=drawFrom(rg.id,ch(.30)?2:1);
        p.comp.eli+=gt.eli;p.comp.int+=gt.int;p.comp.ser+=gt.ser;p.mem+=gt.eli+gt.int+gt.ser}p.act=cl(p.act+R(1,3))}
      else if(ruch==='obecnosc'){const rg=aiOkreg(k,p);p.pres[rg.id]=cl(p.pres[rg.id]+R(10,20))}
      else if(ruch==='program'){const t=topSeg(p);p.aff[t]+=R(.04,.16)}
      else if(ruch==='atak'&&p.ctr<70&&ch(.30)){
        // partie AI również prowadzą akcje sabotażowe
        const tg2=[aiCel(k,8)].filter(Boolean);
        if(tg2.length){const t2=tg2[0];
          if(!(t2===G.me&&me().pact[k]>G.week)){
            if(ch(.62)){const o=G.p[t2];o.fame=cl(o.fame-R(5,10));o.act=cl(o.act-R(6,12));
              REG.forEach(r2=>o.pres[r2.id]=cl(o.pres[r2.id]*.82));M(o,-6);
              if(typeof sadTrop==='function')sadTrop(k,18+p.ctr*.12);
              const pm=aiPamiec(t2);pm.zdrady[k]=(pm.zdrady[k]||0)+1;
              aiPamietaj(k,'sabotaz',{cel:t2,udany:true});
              aiPamietaj(t2,'sabotaz',{sprawca:k,udany:true});
              G.rel[k][t2]=cl(G.rel[k][t2]-18,-100,100);G.rel[t2][k]=cl(G.rel[t2][k]-18,-100,100);
              if(t2===G.me)say(`<b>${p.ab} zorganizował sabotaż</b> na twoich kanałach, obecność i aktywność w dół.`,'bad')}
            else {p.cred=cl(p.cred-9);p.ctr=cl(p.ctr+14);p.fame=cl(p.fame-6);
              if(t2===G.me)say(`<b>${p.ab} próbował cię sabotować i wpadł.</b> Ich wiarygodność leci.`,'good')}}}
      }
      else if(ruch==='atak'&&p.ctr<70){
        const tg=[aiCel(k,12)].filter(Boolean);
        if(tg.length){const t=tg[0];
          if(t===G.me&&me().pact[k]>G.week)continue;
          if(ch(.62)){const o=G.p[t];o.fame=cl(o.fame-R(1.5,4));o.cred=cl(o.cred-R(1,3.5));p.ctr=cl(p.ctr+4);
            if(typeof sadTrop==='function')sadTrop(k,10+p.ctr*.08);
            const pm=aiPamiec(t);pm.zdrady[k]=(pm.zdrady[k]||0)+1;
            aiPamietaj(k,'atak',{cel:t,udany:true});
            aiPamietaj(t,'atak',{sprawca:k,udany:true});
            G.rel[k][t]=cl(G.rel[k][t]-14,-100,100);G.rel[t][k]=cl(G.rel[t][k]-14,-100,100);
            if(t===G.me)say(`<b>${p.lead} (${p.ab})</b> uderzył w ciebie publicznie.`,'bad')}
          else p.cred=cl(p.cred-4)}}
      else p.act=cl(p.act+R(2,6));
    }
    aiSad(k);
    // AI wymienia słabych liderów
    if(p.bench.length&&ch(.015+aiProfil(k).ryzyko*.035)){
      const best=p.bench.map(L).sort((a,b)=>b.avg-a.avg)[0];
      if(best.avg>L(p.lead).avg+9){const old=p.lead;p.lead=best.n;p.bench=p.bench.filter(x=>x!==best.n);
        if(!p.main.includes(old)&&!p.bench.includes(old))p.bench.push(old);p.uni=cl(p.uni+8);
        say(`<b>${p.ab}</b> zmienia przewodniczącego na <b>${best.n}</b>.`)}
    }
    // Przestawienie sterów to dla partii duża rzecz: obowiązuje ją ten sam limit
    // co gracza, czyli raz na kadencję, i nawet wtedy zdarza się rzadko.
    if(ch(.005)&&p.steryTerm!==G.term){
      const ilu=leads(p).length, cel=ilu===1?(ch(.75)?2:3):(ch(.55)?1:(ilu===2?3:2));
      const pula=roster(p).sort((a,b)=>L(b).avg-L(a).avg).slice(0,cel);
      if(pula.length===cel&&cel!==ilu){
        const stare=leads(p);
        p.lead=pula[0];p.lead2=pula[1]||null;p.lead3=pula[2]||null;
        pula.forEach(n=>{p.bench=p.bench.filter(y=>y!==n)});
        stare.forEach(n=>{if(!pula.includes(n)&&!p.main.includes(n)&&!p.bench.includes(n))p.bench.push(n)});
        p.uni=cl(p.uni+(cel===1?4:cel===2?-3:-7));p.ctr=cl(p.ctr+(cel===3?5:0));
        p.steryTerm=G.term;
        say(`<b>${p.ab}</b> przechodzi na ${cel===1?'jednoosobowe':cel===2?'dwuosobowe':'trzyosobowe'} przewodnictwo: ${pula.join(', ')}.`)}
    }
  });
}
/* ══════════ PLANY PARTII KOMPUTEROWYCH ══════════
   Bot przestaje losować ruch z płaskiej tabeli. Na starcie kadencji wybiera sobie
   zamiar i trzyma się go przez dwanaście tygodni — widać to potem w tym, co robi. */
const PLAN_OPIS={
  premier:'idzie po fotel premiera',
  wladza:'broni miejsca w rządzie',
  opozycja:'rozlicza rząd',
  rozbudowa:'buduje partię',
  przetrwanie:'ratuje się przed progiem',
};
function aiPlan(k){
  const p=G.p[k];
  const wRzadzie=!!(G.gov&&G.gov.parties.includes(k));
  const udzial=p.seats/Math.max(1,TOTAL_SEATS);
  if(p.mem<9||(p.seats===0&&p.fame<40))return 'przetrwanie';
  if(wRzadzie)return 'wladza';
  if(udzial>=.18||(p.seats>=4&&p.fame>58))return 'premier';
  if(p.mem<20)return 'rozbudowa';
  return 'opozycja';
}
function ustawPlany(){
  const nowe=[];alive().forEach(k=>{if(k===G.me)return;
    const p=G.p[k];
    if(p.planTerm===G.term&&p.plan)return;    // zamiar obowiązuje całą kadencję
    p.plan=aiPlan(k);p.planTerm=G.term;aiPamiec(k);nowe.push(`${p.ab}: ${PLAN_OPIS[p.plan]}`)});
  if(nowe.length)say(`<b>Strategie na kadencję.</b> ${nowe.join(' · ')}`);
}
/* Kto odjeżdża reszcie stawki. Zwraca partię, przeciw której warto się zewrzeć. */
function hegemon(){
  const zywe=alive().filter(k=>G.p[k].seats>0);
  if(zywe.length<3)return null;
  const rank=zywe.slice().sort((a,b)=>G.p[b].seats-G.p[a].seats);
  const pierwszy=G.p[rank[0]].seats, drugi=G.p[rank[1]].seats;
  // odjeżdża, gdy ma połowę izby albo dwa razy tyle co następny
  if(pierwszy>=MAJ||(pierwszy>=drugi*2&&pierwszy>=6))return rank[0];
  return null;
}

/* Bot na fotelu premiera sam obsadza ministerstwa — inaczej rząd komputerowy
   stałby z pustymi krzesłami i zbierał za to kary. */
function aiObsadzRade(){
  radaInit();
  const g=G.gov;if(!g||!G.pmOk)return;
  const pm=g.pm;if(!pm||pm===G.me||!G.p[pm]||G.p[pm].dead)return;
  const puste=RESORTY.filter(r=>!radaKto(r.id));
  if(!puste.length)return;

  /* Rząd obsadza się od razu po powołaniu, a nie po jednym krześle na tydzień.
     Premier bierze najpierw swoich — to jego ludzie mają rządzić — a dopiero
     gdy ma połowę stołków, dokłada koalicjantom, żeby ich nie stracić. */
  const rozdane=[];
  puste.forEach(res=>{
    const zajeci=Object.values(G.rada);
    const wolniZ=k=>roster(G.p[k]).filter(n=>!zajeci.includes(n)&&!isPrezPerson(n)&&!isMarPerson(n));
    const bezTeki=g.parties.filter(k=>k!==pm&&wolniZ(k).length)
      .sort((a,b)=>{
        const da=g.kontrakt&&g.kontrakt.demands&&g.kontrakt.demands[a];
        const db=g.kontrakt&&g.kontrakt.demands&&g.kontrakt.demands[b];
        const na=(da?da.resorty:1)-resortyPartii(a), nb=(db?db.resorty:1)-resortyPartii(b);
        return nb-na||G.p[b].seats-G.p[a].seats;
      });
    const swojeDosc=resortyPartii(pm)>=Math.ceil(RESORTY.length/2);
    const zrodlo=(swojeDosc&&bezTeki.length)?bezTeki[0]:(wolniZ(pm).length?pm:(bezTeki[0]||null));
    if(!zrodlo)return;
    const wolni=wolniZ(zrodlo);
    if(!wolni.length)return;
    const kto=wolni.slice().sort((a,b)=>L(b).komp-L(a).komp)[0];
    G.rada[res.id]=kto;
    rozdane.push({res,kto,zrodlo});
    if(zrodlo!==pm){
      G.rel[pm][zrodlo]=cl(G.rel[pm][zrodlo]+8,-100,100);
      G.rel[zrodlo][pm]=cl(G.rel[zrodlo][pm]+8,-100,100);
    }
  });
  if(rozdane.length&&(g.parties.includes(G.me)||me().seats>0))
    say(`<b>${G.p[pm].ab} rozdaje teki.</b> ${rozdane.map(x=>`${x.res.n}: ${x.kto} (${G.p[x.zrodlo].ab})`).join(' · ')}`);
}

/* Opozycja, która realnie rozlicza rząd: wotum nieufności, a przy bardzo słabym
   gabinecie nawet wniosek o rozwiązanie sejmu. */
function aiOpozycja(){
  const g=G.gov;if(!g||!G.pmOk)return;
  if(G.week<3||G.week>G.weeks-1)return;              // nie na starcie i nie tuż przed urnami
  const opoz=alive().filter(k=>k!==G.me&&!g.parties.includes(k)&&G.p[k].seats>=2&&G.p[k].plan==='opozycja');
  if(!opoz.length)return;
  const lider=opoz.slice().sort((a,b)=>G.p[b].seats-G.p[a].seats)[0];
  const p=G.p[lider], c=charOf(lider);
  const slabosc=(50-g.appr)/100+(g.minority?.35:0);
  if(slabosc<=0)return;

  // wniosek o rozwiązanie sejmu tylko przy naprawdę leżącym rządzie
  if(g.appr<26&&ch(.05+c.agr*.05)){
    const v=sejmVote('rozwiazanie',lider,lider,undefined);
    if(v.pass){
      g.parties.forEach(k=>{const q=G.p[k];
        q.fame=cl(q.fame-RI(10,18));q.mom=(q.mom||0)-20;M(q,-14);
        REG.forEach(r=>q.pres[r.id]=cl(q.pres[r.id]*.85))});
      p.fame=cl(p.fame+RI(8,13));M(p,16);
      say(`<b>${p.ab} przepchnął rozwiązanie sejmu</b> ${v.yes}:${v.no}. Idziemy do przedterminowych wyborów.`,
          g.parties.includes(G.me)?'bad':'good');
      G.gov=null;G.pmOk=false;G.bloc=null;G.week=G.weeks;
    }else{
      p.fame=cl(p.fame-RI(6,11));p.ctr=cl(p.ctr+9);APPR(+4);
      say(`<b>${p.ab} chciał rozwiązać sejm</b> i przegrał ${v.yes}:${v.no}.`,'');
    }
    return;
  }
  // zwykłe wotum nieufności
  if(!ch(cl(.05+slabosc*.28+c.agr*.06,0,.30)))return;
  const v=sejmVote('wotum',g.pm,lider,undefined);
  if(v.pass){
    say(`<b>${p.ab} obalił rząd</b> ${v.yes}:${v.no}. Przedterminowe wybory.`,
        g.parties.includes(G.me)?'bad':'good');
    p.fame=cl(p.fame+8);M(p,12);
    G.gov=null;G.pmOk=false;G.week=G.weeks;
  }else{
    p.fame=cl(p.fame-3);APPR(+3);
    say(`<b>${p.ab} złożył wotum nieufności</b> i przepadło ${v.yes}:${v.no}.`,'');
  }
}

/* Boty walczą o ludzi: biorą bezpartyjnych i podbierają z cudzych partii,
   także z twojej. Pula wolnych realnie się kurczy. */
function aiTransfery(){
  alive().forEach(k=>{
    if(k===G.me)return;
    const p=G.p[k];if(p.dead)return;
    const c=charOf(k), chetny=p.plan==='rozbudowa'||p.plan==='przetrwanie';
    // bezpartyjny za kapitał
    if(ch(.04+(chetny?.05:0)+c.bud*.04)){
      const wolni=AGENTS.filter(a=>agentFree(a.n));
      if(wolni.length){
        const a=pick(wolni), koszt=agentCost(a.n,1);
        if(p.bank===undefined)p.bank=0;
        if(p.mem>=6&&p.bank>=koszt&&ch(cl(.30+p.fame/220,0,.75))){
          if(!G.agents)G.agents={};
          p.bank-=koszt;
          G.agents[a.n]=k;p.comp[a.seg]++;p.mem++;
          if(!p.bench.includes(a.n))p.bench.push(a.n);
          aiPamietaj(k,'transfer',{osoba:a.n,koszt});
          say(`<b>${p.ab}</b> podpisuje transfer: <b>${a.n}</b> za ${koszt} kapitału (${sn(a.seg)}).`);
        }
      }
    }
    // werbunek imienny z cudzej partii, twoja też się liczy
    if(ch(.055+c.agr*.03+(chetny?.03:0))){
      // bierzemy na cel tylko partie, które naprawdę mają kogo stracić — inaczej
      // próba przepadała na pustej ławce i podbierania praktycznie nie było widać
      const wolniZ=x=>roster(G.p[x]).filter(n=>!isLead(G.p[x],n)&&!isPrezPerson(n)&&!isMarPerson(n)&&!isPMperson(n));
      const cele=alive().filter(x=>x!==k&&G.p[x].mem>4&&wolniZ(x).length);
      if(!cele.length)return;
      // najchętniej tam, gdzie jest z czego wybierać, a relacje nie są wrogie
      const cel=cele.map(x=>({x,w:wolniZ(x).length*1.4+G.rel[k][x]/22+rnd()*3}))
        .sort((a,b)=>b.w-a.w)[0].x;
      const o=G.p[cel];
      const pula=wolniZ(cel);
      const kto=pick(pula);
      const szansa=cl(.18+G.rel[cel][k]/260+(p.fame-o.fame)/300-o.uni/380,.06,.5);
      if(!ch(szansa)){
        aiPamietaj(k,'transfer_odrzucony',{cel:cel,osoba:kto});
        G.rel[k][cel]=cl(G.rel[k][cel]-6,-100,100);G.rel[cel][k]=cl(G.rel[cel][k]-6,-100,100);
        if(cel===G.me)say(`<b>${p.ab}</b> próbował ściągnąć <b>${kto}</b> z twojej partii. Odmówił.`,'good');
        return;
      }
      const seg=L(kto).komp>=80?'eli':'int';
      if(o.mem>1){o.comp[seg]>0?o.comp[seg]--:(o.comp.int>0?o.comp.int--:o.comp.ser--);o.mem--}
      o.main=o.main.filter(x=>x!==kto);o.bench=o.bench.filter(x=>x!==kto);
      p.comp[seg]++;p.mem++;if(!p.bench.includes(kto))p.bench.push(kto);
      aiPamietaj(k,'transfer',{cel:cel,osoba:kto});
      aiPamietaj(cel,'odebrany_transfer',{sprawca:k,osoba:kto});
      G.rel[k][cel]=cl(G.rel[k][cel]-16,-100,100);G.rel[cel][k]=cl(G.rel[cel][k]-16,-100,100);
      o.uni=cl(o.uni-4);
      if(cel===G.me)say(`<b>${p.ab} podebrał ci ${kto}.</b> Przeszedł do nich z całym dorobkiem.`,'bad');
      else if(k===G.me)say(`<b>${kto}</b> przechodzi do ciebie z ${o.ab}.`,'good');
      // transfery między innymi partiami też widać, ale bez zasypywania kroniki
      else if(ch(.4))say(`<b>${kto}</b> przechodzi z ${o.ab} do ${p.ab}.`);
    }
  });
}

/* Premier z komputera potrafi wyrzucić koalicjanta, który mu przeszkadza. */
function aiRekonstrukcja(){
  const g=G.gov;if(!g||!G.pmOk)return;
  const pm=g.pm;if(!pm||pm===G.me||!G.p[pm]||G.p[pm].dead)return;
  if(!ch(.02))return;
  const wrogowie=g.parties.filter(k=>k!==pm&&k!==G.me&&G.rel[pm][k]<-25&&resortyPartii(k)>0);
  if(!wrogowie.length)return;
  const cel=wrogowie[0];
  const v=sejmVote('minister',cel,pm,undefined);
  if(v.pass){
    RESORTY.forEach(r=>{const n=radaKto(r.id);if(n&&partiaOsoby(n)===cel)delete G.rada[r.id]});
    govLeave(cel);
    say(`<b>${G.p[pm].ab} wyrzucił ${G.p[cel].ab} z rządu</b> ${v.yes}:${v.no}.`,cel===G.me?'bad':'');
  }
}

function govTick(){
  const g=G.gov;
  APPR(+R(-3.5,2.6)+(g.minority?-4.5:0)+(G.pmOk?0:-3)
    +(G.prez&&!g.parties.includes(G.prez.party)?-1.2:.6));
  if(g.minority){
    const seats=g.parties.reduce((a,k)=>a+G.p[k].seats,0);
    if(seats>=MAJ){g.minority=0;g.royal=0;say('<b>Rząd odzyskał większość.</b>','good')}
    else if(ch(.26)||g.appr<26){
      collapseGov(`Rząd mniejszościowy ${G.p[g.pm].lead} (${seats}/${TOTAL_SEATS}) nie przetrwał głosowania.`);return}
  }
  if(ch(.10)){const d=RI(4,11);APPR(-d);
    say(`<b>Wpadka rządu.</b> Poparcie −${d}.`,g.parties.includes(G.me)?'bad':'good')}
  radaTick();
}
/* Ministrowie pracują na konto swoich partii, a puste resorty mszczą się na premierze. */
function radaTick(){
  radaInit();
  const g=G.gov;if(!g)return;
  RESORTY.forEach(r=>{
    const kto=radaKto(r.id);if(!kto)return;
    const k=partiaOsoby(kto);if(!k||!G.p[k]||G.p[k].dead)return;
    const komp=L(kto).komp;
    G.p[k].fame=cl(G.p[k].fame+.34+komp/380);
    G.p[k].act=cl(G.p[k].act+.28);
    if(komp>=72)G.p[k].cred=cl(G.p[k].cred+.16);
  });
  // Rząd bez obsadzonych resortów po prostu nie działa i widać to na zewnątrz.
  const puste=RESORTY.filter(r=>!radaKto(r.id)).length;
  if(!puste)return;
  const odWyborow=G.week;
  if(odWyborow>3){
    const pm=g.pm&&G.p[g.pm];
    APPR(-puste*.9);
    if(pm){
      pm.ctr=cl(pm.ctr+puste*.55);
      pm.mom=(pm.mom||0)-puste*1.4;
      if(g.pm===G.me&&G.week%3===0)
        say(`<b>${puste} ${pl(puste,'resort stoi pusty','resorty stoją puste','resortów stoi pustych')}.</b> Serwer widzi rząd, który nie rządzi: kontrowersja rośnie, a rozpęd leci w dół.`,'bad');
    }
  }
}
function APPR(x){if(G&&G.gov){G.gov.appr=Math.max(0,Math.min(100,G.gov.appr+x))}return (G&&G.gov)?G.gov.appr:0}
function collapseGov(why){
  say(`<b>Rząd upadł.</b> ${why} Przedterminowe wybory.`,'bad');
  if(G.gov&&G.gov.parties.includes(G.me))M(me(),-10);
  G.gov=null;G.pmOk=false;G.bloc=null;G.opoBloc=null;
  G.week=Math.max(G.week,G.weeks);
}
function govLeave(c){
  if(!G.gov)return;
  G.gov.parties=G.gov.parties.filter(k=>k!==c);
  RESORTY.forEach(r=>{const n=radaKto(r.id);if(n&&partiaOsoby(n)===c)delete G.rada[r.id]});
  const s=G.gov.parties.reduce((a,k)=>a+G.p[k].seats,0);
  if(s<MAJ){collapseGov(`${G.p[c].n} opuściło koalicję, rząd stracił większość.`);return}
  say(`<b>${G.p[c].ab} wychodzi z rządu.</b> Koalicja utrzymuje większość ${s}/${TOTAL_SEATS}.`,'bad');
}
