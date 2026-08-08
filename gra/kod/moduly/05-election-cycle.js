'use strict';
/* ══════════ WYBORY ══════════ */
function runElection(){
  SFX.elect();
  G.turnout=cl(.80+R(-.05,.09),.7,.98);
  const q=tally(),AL=allocate(q.res,q.total);
  const votes=Object.fromEntries(PID.map(k=>[k,Math.round(q.res[k].tot)]));
  PID.forEach(k=>G.p[k].seats=AL.out[k]);
  G.result={votes,A:AL,q};
  const p0=G.p[G.me];
  G.hist.push({term:G.term,seats:Object.fromEntries(PID.map(k=>[k,G.p[k].seats])),
    pct:q.res[G.me].tot/q.total*100,pm:G.gov?G.gov.pm:null,
    mem:p0.mem,goals:Object.keys(G.goals||{}).length,
    // stan, z którym poszedłeś do urn — na tym opiera się rozliczenie kadencji
    fame:Math.round(p0.fame),uni:Math.round(p0.uni),cred:Math.round(p0.cred),
    ctr:Math.round(p0.ctr),act:Math.round(p0.act),
    pres:Math.round(REG.reduce((a,r)=>a+p0.pres[r.id],0)/Math.max(1,REG.length)),
    znuz:Math.round(znuzenie(G.me)),
    presReg:Object.fromEntries(REG.map(r=>[r.id,Math.round(p0.pres[r.id])]))});
  const prevS=G.hist.length>1?G.hist[G.hist.length-2].seats[G.me]:G.p[G.me].seats;
  M(me(),cl((G.p[G.me].seats-prevS)*3,-20,24));
  G.prest+=G.p[G.me].seats*2;XP(12+G.p[G.me].seats*2);
  PID.forEach(k=>{G.p[k].rally=0;G.p[k].laws=0});
  G.gov=null;G.pmOk=false;G.bloc=null;G.opoBloc=null;G.phase='result';
  startNight();
  say(`<b>Wybory.</b> Zdobywasz ${G.p[G.me].seats} ${pl(G.p[G.me].seats,'mandat','mandaty','mandatów')}.`,
      G.p[G.me].seats>0?'good':'bad');
  /* Pax Mathiae leci, kiedy wybory wygrywa partia Maćka — obojętnie, czy prowadzi
     ją gracz, czy komputer. Wygrana to najwięcej mandatów, a nie sam udział. */
  {const naj=alive().reduce((a,k)=>a===null||G.p[k].seats>G.p[a].seats?k:a,null);
   if(naj&&G.p[naj].seats>0&&isLead(G.p[naj],'Maciek'))graj('pax');}
  render();
}
function accepts(k,bonus=0){
  bonus+=hasT('negocjator')?10:0;
  const DIP={'Mietek Nocul':14,'Bartek':4,'Śledzik':-12,'kenzo':-18,
    'Kaziu':goalDone('kazik')?14:-16,'Supernes':-16};   // Kazikmistrz odwraca jego reputację
  bonus+=(DIP[me().lead]||0)+(DIP[G.p[k].lead]||0)*.5;
  if(goalDone('republika'))bonus+=12;
  if(hasAds(G.me))bonus-=25;
  if(hasAds(k))bonus-=12;
  if(hasLib(G.me))bonus+=10;
  if(hasLib2(G.me))bonus+=18;
  if(hasPer(G.me))bonus+=20;
  if(hasCen(G.me))bonus+=8;      // ze środkiem każdemu jest po drodze
  if(hasHeg(G.me))bonus-=10;     // z hegemonem nikt nie chce iść pod rękę
  if(G.wojna)bonus-=14;
  if(goalDone('demokraci')&&isLead(me(),'loof'))bonus+=12;
  if(isLead(me(),'Sulejman'))bonus+=(G.p[k].seats<=4?20:-12);   // z niszowymi łatwo, z gigantami pod górkę
  // wspólna lista wyborcza to zobowiązanie: kto szedł z tobą do wyborów, wchodzi do rządu
  if(bylWBloku(k))return true;
  const r=G.rel[k][G.me];
  if(r<0)return false;                          // ujemne relacje = nie ma rozmowy
  if(r+bonus>=30)return true;                   // zielone relacje wystarczą same
  return r+bonus-ideo(k,G.me)*1.15>=26}
/* czy szliśmy do ostatnich wyborów z jednej listy */
function bylWBloku(k){
  return !!(G&&G.blokWyborczy&&G.blokWyborczy.includes(k)&&k!==G.me);
}
function aiGov(force){
  const rank=alive().filter(k=>G.p[k].seats>0).sort((a,b)=>G.p[b].seats-G.p[a].seats);
  if(!rank.length){G.gov=null;return}
  if(force){ // rząd zastany: dobiera partnerów po mandatach i chęci, aż do większości
    const pm=rank[0];let team=[pm],s=G.p[pm].seats;
    rank.filter(k=>k!==pm)
      .map(k=>({k,w:G.p[k].seats*3+(G.rel[k][pm]-ideo(k,pm)*2)/4}))
      .sort((a,b)=>b.w-a.w)
      .forEach(x=>{if(s<MAJ){team.push(x.k);s+=G.p[x.k].seats}});
    setGov(team,pm,RI(50,62));G.gov.minority=s<MAJ?1:0;G.gov.pmLead=pmOsoba(pm)||G.p[pm].lead;return;
  }
  // Koalicję składa się z rachunku: najpierw ci, którzy wnoszą najwięcej mandatów
  // przy najmniejszym oporze, i tylko tylu, ilu trzeba do większości. Szeroka koalicja
  // to więcej resortów do oddania, więc nikt nie bierze do rządu na zapas.
  for(const pm of rank){
    let team=[pm],s=G.p[pm].seats;
    const kolejka=rank.filter(k=>k!==pm)
      .map(k=>({k,chetny:G.rel[k][pm]-ideo(k,pm)*2.2,mand:G.p[k].seats}))
      .filter(x=>x.chetny>=18)
      .sort((a,b)=>(b.mand*3+b.chetny/4)-(a.mand*3+a.chetny/4));
    for(const x of kolejka){
      if(s>=MAJ)break;                       // mamy większość, nikogo więcej nie dobieramy
      team.push(x.k);s+=x.mand;
    }
    if(s>=MAJ){setGov(team,pm,RI(46,60));G.gov.pmLead=pmOsoba(pm)||G.p[pm].lead;return}
  }
  setGov([rank[0]],rank[0],RI(36,48));G.gov.pmLead=pmOsoba(rank[0])||G.p[rank[0]].lead;
}
function setGov(team,pm,appr){
  const tot=team.reduce((a,k)=>a+G.p[k].seats,0)||1;
  /* Resortów jest dokładnie tyle, ile ministerstw w radzie, i liczy się wyłącznie to,
     kto na nich siedzi. Wcześniej obok rady chodził drugi, abstrakcyjny licznik ośmiu
     „przydziałów” — rozjeżdżał się z rzeczywistością i to z niego brały się bzdury
     w rodzaju odwoływania ministra, którego nie ma. */
  /* Sprawczość: czy ten rząd cokolwiek dowozi. Rośnie z każdą przegłosowaną ustawą,
     spada z każdą przegraną. Nie decyduje o wszystkim, ale premier, który przegrywa
     głosowanie za głosowaniem, przestaje być traktowany poważnie. */
  /* Rząd dostaje kontrakt, nie tylko tablicę partii. Koalicjant ma od początku
     zapisane, ile resortów powinien dostać i jaki temat będzie dla niego ważny. */
  const demand={};
  team.forEach(k=>{
    const q=G.p[k],ud=q.mem?Object.keys(q.comp).sort((a,b)=>q.comp[b]-q.comp[a])[0]:'ser';
    demand[k]={resorty:k===pm?Math.max(1,Math.round(RESORTY.length*.55)):
      Math.max(1,Math.round(RESORTY.length*q.seats/Math.max(1,tot)*.9)),temat:ud};
  });
  G.gov={parties:team,pm,appr,minority:tot<MAJ?1:0,spraw:50,wygrane:0,przegrane:0,
    kontrakt:{od:typeof absWeek==='function'?absWeek():0,demands:demand,obietnice:[]}};
  G.rada={};                                  // nowy rząd zaczyna od pustych krzeseł
  G.radaOd={};
  G.bezRzadu=0;                               // kryzys rządowy się skończył, licznik kar wraca do zera
}
/* Ile ministerstw realnie obsadziła dana partia. */
function resortyPartii(k){
  radaInit();
  return RESORTY.filter(r=>{const n=radaKto(r.id);return n&&partiaOsoby(n)===k}).length;
}
/* Kontrakt gabinetu żyje przez całą kadencję. Samo wejście do rządu nie
   wystarcza: koalicjant sprawdza, czy dostał swoje krzesła i czy ktoś dowiózł
   jego temat. Niespełnione ustalenia obniżają relację dopiero co kilka tygodni,
   żeby nie zamienić gry w karę naliczaną co klatkę. */
function govKontraktTick(){
  const g=G.gov;if(!g||!g.kontrakt||!G.pmOk)return;
  const TEMAT={eli:['ekon','podatki','konst'],int:['mordepedia','man'],ser:['media','zagadki','cytaty','event']};
  g.parties.filter(k=>k!==g.pm&&G.p[k]&&!G.p[k].dead).forEach(k=>{
    const d=g.kontrakt.demands&&g.kontrakt.demands[k];if(!d)return;
    const ma=resortyPartii(k), temat=(TEMAT[d.temat]||[]).some(id=>G.lawBy&&G.lawBy[id]===k);
    d.przydzielone=ma;d.tematDone=temat?1:0;
    const poTerminie=G.week>=4, problem=ma<d.resorty||(poTerminie&&!temat);
    if(!problem){d.status='spelniony';return}
    d.status='zagrozony';
    if(absWeek()<(d.ostatniaKara||-99)+2)return;
    d.ostatniaKara=absWeek();
    /* Kontrakt ma granicę. Gdy relacja spadnie poniżej -45, koalicjant nie
       marudzi już w panelu, tylko formalnie wychodzi z rządu. Dzięki temu
       zaniedbany temat może wywołać prawdziwy kryzys większości. */
    const relPo=(G.rel[k]&&G.rel[k][g.pm])||0;
    if(relPo<=-45&&typeof govLeave==='function'){
      if(g.pm===G.me)say(`<b>${G.p[k].ab} wypowiada umowę.</b> Koalicjant opuszcza rząd, bo obietnice zostały złamane.`,'bad');
      govLeave(k);
      return;
    }
    const kara=ma<d.resorty?4:2;
    G.rel[k][g.pm]=cl(G.rel[k][g.pm]-kara,-100,100);
    G.rel[g.pm][k]=cl(G.rel[g.pm][k]-Math.round(kara*.55),-100,100);
    G.p[k].mom=cl((G.p[k].mom||0)-1,-35,42);
    if(g.parties.includes(G.me))say(`<b>${G.p[k].ab} rozlicza kontrakt.</b> Brakuje ${Math.max(0,d.resorty-ma)} resortów${!temat&&poTerminie?' i nie ruszył ich temat':''}. Relacje spadają.`,'bad');
  });
}

/* Premier może raz na tydzień przestawić warunki umowy, zamiast czekać aż
   koalicjant pęknie bez żadnej możliwości rozmowy. To nie daje darmowej
   większości: kosztuje akcję polityczną, relację albo kapitał i zostawia ślad
   w kontrakcie na resztę kadencji. */
function renegocjujKontrakt(k){
  /* Rozmowa nie zużywa jednego z trzech kafli akcji; blokada tygodniowa i koszt
     relacji/kapitału pilnują, żeby nie dało się spamować jej w jednej turze. */
  const g=G.gov,d=g&&g.kontrakt,q=d&&d.demands&&d.demands[k];
  if(!g||g.pm!==G.me||k===G.me||!q||!G.p[k]||G.p[k].dead)return;
  if(q.ostatniaRenegocjacja===absWeek())return modal('Kontrakt gabinetu','Rozmowa juĹĽ byĹ‚a',
    `<p>Z ${G.p[k].ab} renegocjowaĹ‚eĹ› warunki w tym tygodniu. NastÄ™pna rozmowa bÄ™dzie moĹĽliwa po zmianie tygodnia.</p>`,[{l:'Rozumiem',f:close}],close);
  const tematy=['ekon','podatki','konst','mordepedia','man','media','zagadki','cytaty'];
  const nowy=tematy.find(id=>!(G.lawBy&&G.lawBy[id]===k))||q.temat;
  const ab=G.p[k].ab;
  const wykonaj=(typ,fn)=>{close();fn();q.ostatniaRenegocjacja=absWeek();
    G.gov.spraw=cl((G.gov.spraw||50)-1);if(typeof aiPamietaj==='function')aiPamietaj(k,'renegocjacja',{typ});render()};
  const opcje=[];
  if(q.resorty>1)opcje.push({l:'Odpuść jedno ministerstwo',s:`Wymóg spada do ${q.resorty-1}. Relacja +4, sprawczość rządu -1.`,f:()=>wykonaj('resort',()=>{q.resorty--;G.rel[G.me][k]=cl(G.rel[G.me][k]+4,-100,100);G.rel[k][G.me]=cl(G.rel[k][G.me]+4,-100,100)})});
  opcje.push({l:`Przestaw temat na ${sn(nowy)}`,s:'Nowa obietnica trafia do kontraktu i musi zostać dowieziona ustawą.',f:()=>wykonaj('temat',()=>{q.temat=nowy;q.tematDone=0;G.rel[G.me][k]=cl(G.rel[G.me][k]+3,-100,100);G.rel[k][G.me]=cl(G.rel[k][G.me]+3,-100,100)})});
  if(G.kp>=20)opcje.push({l:'Dorzucam 20 kapitału',s:'Koalicjant dostaje polityczny budżet. Relacja +8.',f:()=>wykonaj('kapital',()=>{G.kp-=20;G.rel[G.me][k]=cl(G.rel[G.me][k]+8,-100,100);G.rel[k][G.me]=cl(G.rel[k][G.me]+8,-100,100)})});
  opcje.push({l:'Jeszcze nie',s:'Nie zmieniasz umowy.',f:close});
  modal('Kontrakt gabinetu',`Renegocjacja z ${ab}`,
    `<p>${ab} ma zapisane <b>${q.resorty}</b> resorty i temat <b>${sn(q.temat)}</b>. Obecnie przydzielono <b>${q.przydzielone||resortyPartii(k)}</b>.</p>
     <p class="dim">Każda zmiana zabiera ten tydzień rozmów. Umowa działa dopiero wtedy, gdy jej warunki są czytelne i rozliczalne.</p>`,opcje,close);
}

/* ══════════ PROCEDURA PREMIERA ══════════ */
function topSeats(n){return alive().filter(k=>G.p[k].seats>0)
  .sort((a,b)=>G.p[b].seats-G.p[a].seats).slice(0,n)}
function ownPool(k){return [...new Set(G.p[k].main.concat(G.p[k].bench))]}
function bestRep(k){
  const free=ownPool(k).filter(n=>!isPMperson(n)&&!isPrezPerson(n)&&!isMarPerson(n));
  const pool=free.length?free:ownPool(k);
  return pool.map(L).sort((a,b)=>(b.char*.6+b.komp*.4)-(a.char*.6+a.komp*.4))[0];
}
function raceScore(k,who,boost){
  const p=G.p[k], ld=L(who||G.p[k].lead);
  return Math.max(.5, p.seats*1.35+p.fame*.20+p.cred*.12+ld.char*.24+(boost||0)/5+R(-6,6));
}
function runRace(cands){
  const raw=cands.map(c=>({...c,v:Math.pow(raceScore(c.k,c.who,c.boost),1.55)}));
  const sum=raw.reduce((a,x)=>a+x.v,0)||1;
  return raw.map(x=>({...x,pct:x.v/sum*100})).sort((a,b)=>b.pct-a.pct);
}
function startMar(){
  G.sejmPrez={marszalek:null,wice:[],marszalekLead:null};
  G.mar={stage:'marChoice',pool:topSeats(4),result:null,winner:null,who:null,decision:null,boost:0};
  G.phase='marszalek';render();
}
function marDeclare(run,who,boost){
  const m=G.mar;
  m.decision=run?{who,boost:boost||0}:'skip';
  const pool=m.pool.filter(k=>k!==G.me||run);
  const cands=pool.map(k=>{
    if(k===G.me&&run)return {k,who,boost:boost||0};
    const rep=bestRep(k);return {k,who:rep?rep.n:G.p[k].lead,boost:0};
  });
  if(!cands.length){m.result=[];m.winner=null;m.who=null}
  else{m.result=runRace(cands);m.winner=m.result[0].k;m.who=m.result[0].who}
  render();
}
function marContinue(){
  const m=G.mar,sp=G.sejmPrez;
  if(m.stage==='marChoice'){
    sp.marszalek=m.winner; sp.marszalekLead=m.winner?m.who:null;
    if(m.winner){say(`<b>${m.who} marszałkiem sejmu</b> (${G.p[m.winner].ab}), ${fmt(m.result[0].pct)}% w wyścigu.`,'roy');
      if(m.winner===G.me){G.prest+=10;XP(14);G.cat='mar'}}
    G.mar={stage:'countPrompt',count:null,countVote:null};render();return;
  }
  if(m.stage==='countPrompt'){
    G.mar={stage:'countA',countVote:null};render();return;
  }
  if(m.stage==='countA'){
    if(!G.mar.countVote){G.mar.countVote=sejmVote('depcount','c2',G.me);render();return}
    const v=G.mar.countVote;
    if(v.pass){G.mar={stage:'countResult',count:2,countVote:v};render();return}
    G.mar={stage:'countB',countVote:null};render();return;
  }
  if(m.stage==='countB'){
    if(!G.mar.countVote){G.mar.countVote=sejmVote('depcount','c1',G.me);render();return}
    const v=G.mar.countVote;
    if(v.pass){G.mar={stage:'countResult',count:1,countVote:v};render();return}
    G.mar={stage:'countZero',count:0,countVote:v};
    say('<b>Sejm przyjmuje przez aklamację</b>: wicemarszałków nie będzie.','roy');
    render();return;
  }
  if(m.stage==='countResult'){
    const c=m.count;
    say(c===2?`<b>Sejm zatwierdza dwóch wicemarszałków.</b>`:`<b>Sejm zatwierdza jednego wicemarszałka.</b>`);
    if(!c){G.mar={stage:'done'};marFinish();return}
    G.mar={stage:'depChoice',slot:1,count:c,
      pool:topSeats(6).filter(k=>k!==sp.marszalek),result:null,winner:null,who:null,decision:null,boost:0};
    render();return;
  }
  if(m.stage==='countZero'){
    G.mar={stage:'done'};marFinish();return;
  }
  if(m.stage==='depChoice'){
    if(m.winner){sp.wice.push(m.winner);
      say(`<b>${m.who} wicemarszałkiem</b> (${G.p[m.winner].ab}), ${fmt(m.result[0].pct)}% w wyścigu.`,'roy');
      if(m.winner===G.me){G.prest+=6;XP(8)}}
    if(m.slot>=m.count){G.mar={stage:'done'};marFinish();return}
    // druga (i kolejna) tura wicemarszałka zawsze rozstrzyga się wśród innych ugrupowań
    const used=new Set([sp.marszalek,...sp.wice,G.me]);
    G.mar={stage:'depChoice',slot:m.slot+1,count:m.count,
      pool:topSeats(6).filter(k=>!used.has(k)),result:null,winner:null,who:null,decision:null,boost:0};
    render();return;
  }
}
function marFinish(){
  const sp=G.sejmPrez;
  say(`Prezydium sejmu: marszałek <b>${sp.marszalek?G.p[sp.marszalek].lead:'wakat'}</b>, wicemarszałkowie: ${sp.wice.map(k=>G.p[k].lead).join(', ')||'brak'}.`);
  if(isMar()||isWice())G.cat='mar';
  G.phase='camp';G.mar=null;startTerm();
}
function isMar(){return !!(G.sejmPrez&&G.sejmPrez.marszalek===G.me)}
function isWice(){return !!(G.sejmPrez&&G.sejmPrez.wice.includes(G.me))}
function isMarPerson(n){return !!(G.sejmPrez&&G.sejmPrez.marszalekLead&&G.sejmPrez.marszalekLead===n)}
function startPM(){
  G.pmOk=false;
  G.sejmPrez=null; // prezydium poprzedniej kadencji wygasa wraz z sejmem
  if(G.partyCouncil&&G.partyCouncil.party===G.me){
    /* Nominacja premiera jest osobną decyzją rady, więc nie przenosimy jej
       bez pytania z poprzedniego gabinetu. */
    G.partyCouncil.pm=null;G.partyCouncil.pmParty=null;
  }
  G.pmProc={round:1,tries:[],cand:null,by:null,vote:null,triedThisCycle:[]};
  G.phase='pmvote';
  nextCandidate();
  render();
}
function nextCandidate(){
  const pr=G.pmProc;
  if(!pr.triedThisCycle)pr.triedThisCycle=[];
  pr.lista=alive().filter(x=>G.p[x].seats>0&&!pmBlocked(x)&&!pr.triedThisCycle.includes(x))
    .sort((a,b)=>kingScore(b)-kingScore(a));
  if(!pr.lista.length){
    pr.cycle=(pr.cycle||0)+1;
    pr.triedThisCycle=[];
    pr.lista=alive().filter(x=>G.p[x].seats>0&&!pmBlocked(x)).sort((a,b)=>kingScore(b)-kingScore(a));
    say(`<b>Sejm wyczerpał listę kandydatów.</b> Runda ${pr.round}: głosowania zaczynają się od nowa.`,'bad');
  }
  /* Skrajny przypadek: w izbie nie ma nikogo, kogo dałoby się zgłosić — wszyscy
     albo bez mandatów, albo wykluczeni. Wcześniej procedura szła dalej z pustym
     kandydatem i ekran wyboru premiera wywracał się na odwołaniu do partii,
     której nie ma. Teraz Król po prostu rozwiązuje izbę i wracamy do kampanii. */
  if(!pr.lista.length){
    say('<b>Nie ma kogo zgłosić na premiera.</b> Król Mordeczka rozwiązuje sejm, idziemy do przedterminowych wyborów.','roy');
    G.gov=null;G.pmOk=false;G.pmProc=null;G.bloc=null;
    G.phase='camp';G.week=G.weeks;
    return;
  }
  if(pr.round===1){
    /* Pierwsza desygnacja należy do rządu, o ile rząd w ogóle stoi: koalicja
       zawiązała się wokół konkretnego premiera i to jego zgłasza.

       Wcześniej brany był ulubieniec Króla z całej izby i — co gorsza — od razu
       nadpisywał G.gov.pm. Stąd trzy dziwactwa naraz: rząd desygnował kogoś
       spoza siebie, gubił po drodze własnego kandydata, a potem karnie głosował
       za obcym, bo dyscyplina koalicyjna patrzy właśnie na G.gov.pm. */
    const zRzadu=(G.gov&&G.gov.parties)?pr.lista.filter(k=>G.gov.parties.includes(k)):[];
    if(G.gov&&G.gov.pm&&zRzadu.includes(G.gov.pm)){
      pr.by='Koalicja'; pr.cand=G.gov.pm;
    }else if(zRzadu.length){
      pr.by='Koalicja'; pr.cand=zRzadu[0]; G.gov.pm=pr.cand;
    }else{
      pr.by='Zezwolenie Króla Mordeczki'; pr.cand=pr.lista[0]||null;
    }
    pr.choose=false;
  }else if(pr.round%3===2){
    pr.by='Król Mordeczka';
    pr.cand=pr.lista[0]||null; pr.choose=false;
  }else{
    pr.by='Sejm';
    const pool=pr.lista.filter(k=>G.p[k].seats>=Math.max(3,Math.round(TOTAL_SEATS*.10)));
    const use=pool.length?pool:pr.lista;
    pr.cand=null; pr.choose=G.p[G.me].seats>0&&use.includes(G.me);
    if(!pr.choose){const c=use.slice().sort((a,b)=>G.p[b].seats-G.p[a].seats);pr.cand=c[0]||null}
  }
  pr.vote=null;G.bribeCache={};
}
function doPMVote(cand,myVote){
  const pr=G.pmProc; if(!pr||!cand)return;
  pr.cand=cand;
  const v=sejmVote('pm',cand,cand,myVote);
  pr.vote=v;
  pr.tries.push({round:pr.round,cand,yes:v.yes,no:v.no,abst:v.abst,pass:v.pass});
  if(!pr.triedThisCycle)pr.triedThisCycle=[];
  if(!pr.triedThisCycle.includes(cand))pr.triedThisCycle.push(cand);
  if(v.pass){
    G.pmOk=true;
    // podstawą rządu jest zgłoszona koalicja; kto zagłosował za, może ją dopełnić do większości
    const declared=(G.gov&&G.gov.parties&&G.gov.parties.includes(cand))?G.gov.parties.slice():[cand];
    const team=declared.slice();
    let bs=team.reduce((a,k)=>a+G.p[k].seats,0);
    alive().filter(k=>G.p[k].seats>0&&!team.includes(k)&&v.by[k]>0)
      .sort((a,b)=>G.p[b].seats-G.p[a].seats)
      .forEach(k=>{if(bs<MAJ){team.push(k);bs+=G.p[k].seats}});
    setGov(team,cand,RI(48,62));
    G.gov.minority=bs<MAJ?1:0;
    G.gov.pm=cand; G.gov.pmLead=pmOsoba(cand)||G.p[cand].lead;
    const szef=G.gov.pmLead;   // konkretna osoba z fotela, nie pierwszy lider z brzegu
    gainAutor(szef,RI(2,4));
    if(G.gov.minority)say(`<b>Rząd ${szef} nie ma większości</b> (${bs}/${TOTAL_SEATS}). Utrzyma się najwyżej kilka tygodni.`,'bad');
    if(cand===G.me){G.prest+=20;M(me(),24);XP(30);me().fame=cl(me().fame+9)} else if(G.gov.parties.includes(G.me)){G.prest+=8;M(me(),8);XP(10)}
    makeBlocs();
    say(`<b>${szef} zostaje premierem</b> (${G.p[cand].ab}), ${v.yes}:${v.no}.`,'roy');
  }else{
    say(`<b>${pmOsoba(cand)||G.p[cand].lead} nie uzyskał wotum zaufania</b> ${v.yes}:${v.no}.`,'bad');
    if(cand===G.me)M(me(),-8);
  }
  render();
}
/* Ile rund sejm może przepalić, zanim Król przestaje pytać o zdanie. */
const PM_RUNDY_MAX=8;
function pmFailForward(){
  /* Był tu wariant, w którym Król powoływał rząd mniejszościowy zamiast pozwolić
     sejmowi szukać dalej. Leżał wyłączony na sztywno i tak został — usunięty,
     bo kryzys rządowy ma teraz własne, narastające koszty i sam się rozstrzyga. */
  const pr=G.pmProc;
  pr.round++;
  // paraliż sejmu uderza w cały serwer
  alive().forEach(k=>{const q=G.p[k];q.act=cl(q.act-1.2);q.uni=cl(q.uni-.8);M(q,-1)});
  /* Bez tego dało się głosować przeciw w nieskończoność — także przeciw kandydatowi
     własnej koalicji — i kadencja nigdy nie ruszała. Po ośmiu rundach Król kończy
     targi i powołuje rząd z najsilniejszego ugrupowania, które ma z kim rządzić. */
  if(pr.round>PM_RUNDY_MAX){
    const rank=alive().filter(k=>G.p[k].seats>0&&!pmBlocked(k))
      .sort((a,b)=>G.p[b].seats-G.p[a].seats||kingScore(b)-kingScore(a));
    const pm=rank[0]||alive().filter(k=>G.p[k].seats>0).sort((a,b)=>G.p[b].seats-G.p[a].seats)[0];
    if(!pm){nextCandidate();render();return}
    let team=[pm],bs=G.p[pm].seats;
    alive().filter(k=>k!==pm&&G.p[k].seats>0)
      .map(k=>({k,w:G.p[k].seats*3+(G.rel[k][pm]||0)/4}))
      .sort((a,b)=>b.w-a.w)
      .forEach(x=>{if(bs<MAJ){team.push(x.k);bs+=G.p[x.k].seats}});
    setGov(team,pm,RI(34,46));
    G.gov.minority=bs<MAJ?1:0;G.gov.royal=1;G.pmOk=true;
    G.gov.pmLead=pmOsoba(pm)||G.p[pm].lead;
    // rząd z nadania, nie z wyboru — cały sejm płaci za przeciąganie
    alive().forEach(k=>{const q=G.p[k];q.cred=cl(q.cred-4);M(q,-6)});
    if(pm===G.me){G.prest+=6;M(me(),4)}
    say(`<b>Król Mordeczka kończy targi.</b> Po ${PM_RUNDY_MAX} nieudanych głosowaniach powołuje rząd `
      +`<b>${G.gov.pmLead}</b> (${G.p[pm].ab})${G.gov.minority?', bez większości':''}. Sejm wychodzi z tego bez twarzy.`,'roy');
    modal('Pałac','Król powołuje rząd z nadania',
      `<p>Sejm nie wyłonił premiera przez ${PM_RUNDY_MAX} rund. Król przestał pytać o zdanie
       i powierzył misję <b>${G.gov.pmLead}</b> z ${G.p[pm].ab}.</p>
       <p style="margin-top:10px">${G.gov.minority?'To rząd mniejszościowy — utrzyma się tylko do pierwszego wotum.'
         :'Rząd ma większość, ale nie ma mandatu od izby.'}
       Wszystkim partiom spadła wiarygodność: przeciąganie procedury kosztuje cały sejm.</p>`,
      [{l:'Rozumiem',f:()=>{close();makeBlocs();render()}}]);
    makeBlocs();render();return;
  }
  nextCandidate();render();
}

/* ══════════ BLOKI POLITYCZNE ══════════ */
const BLOCPAL=['#e0b23c','#4bbd85','#5a9be8','#e2606f','#a98bd8','#d98b4a','#4f8a52','#c0392b','#2e6b46','#7b2fbe'];
const OPONAMES=[
 {s:'eli',n:'Front Korony',k:'FK'},{s:'eli',n:'Przymierze Ołtarza',k:'PO'},
 {s:'eli',n:'Rada Starszych',k:'RS'},{s:'eli',n:'Pakt Zasłużonych',k:'PZ'},
 {s:'eli',n:'Liga Dawnych Rodów',k:'LDR'},{s:'eli',n:'Konwent Koronny',k:'KK2'},
 {s:'eli',n:'Zjednoczenie Narodowe',k:'ZN'},{s:'eli',n:'Porozumienie Weteranów',k:'PW'},
 {s:'int',n:'Koalicja Obywatelska',k:'KO'},{s:'int',n:'Sojusz Rozumu',k:'SR'},
 {s:'int',n:'Blok Programowy',k:'BP'},{s:'int',n:'Porozumienie Statutowe',k:'PS'},
 {s:'int',n:'Forum Kanałów',k:'FKA'},{s:'int',n:'Unia Redakcyjna',k:'UR'},
 {s:'int',n:'Zjednoczona Lewica',k:'ZL'},{s:'int',n:'Akademia Serwera',k:'AS'},
 {s:'ser',n:'Front Memiczny',k:'FM'},{s:'ser',n:'Ruch Nowych',k:'RN'},
 {s:'ser',n:'Sojusz Kanapowy',k:'SK'},{s:'ser',n:'Zlot Szitposterów',k:'ZS'},
 {s:'ser',n:'Braterstwo Głosowego',k:'BG'},{s:'ser',n:'Wielka Fala',k:'WF'},
 {s:'ser',n:'Liga Nocnych Marków',k:'LNM'},{s:'ser',n:'Porozumienie Ogólnego',k:'POG'}];
function nameTaken(n,k){
  for(const c in G.coal){if(G.coal[c].n===n||c===k)return true}
  if(G.bloc&&(G.bloc.name===n||G.bloc.short===k))return true;
  if(G.opoBloc&&(G.opoBloc.name===n||G.opoBloc.short===k))return true;
  return false;
}
function autoName(parties,used){
  // dominująca cecha bloku = średnia ważona mandatami, nie suma
  let best=null,bv=-1;
  const w=parties.reduce((a,k)=>a+Math.max(1,G.p[k].seats),0)||1;
  SID.forEach(s=>{
    let v=0;parties.forEach(k=>v+=G.p[k].aff[s]*Math.max(1,G.p[k].seats));
    v/=w; if(v>bv){bv=v;best=s}});
  const swoje=OPONAMES.filter(o=>o.s===best), reszta=OPONAMES.filter(o=>o.s!==best);
  return swoje.find(o=>o.k!==used&&!nameTaken(o.n,o.k))
    ||reszta.find(o=>o.k!==used&&!nameTaken(o.n,o.k))
    ||swoje.find(o=>o.k!==used)||OPONAMES.find(o=>o.k!==used)||OPONAMES[0];
}
function syncCoal(){
  // bloki to listy wyborcze: nowe zastępują wszystkie poprzednie
  const nc={};
  if(G.bloc&&G.bloc.parties.length>1)nc[G.bloc.short]={n:G.bloc.name,c:G.bloc.color,m:G.bloc.parties.slice()};
  if(G.opoBloc&&G.opoBloc.parties.length>1&&G.opoBloc.short!==(G.bloc&&G.bloc.short))
    nc[G.opoBloc.short]={n:G.opoBloc.name,c:G.opoBloc.color,m:G.opoBloc.parties.slice()};
  G.coal=nc;
  PID.forEach(k=>G.p[k].coal=coalOf(k));
}
function makeBlocs(){
  if(!G.gov)return;
  if(!G.bloc){const a=autoName(G.gov.parties,null);
    G.bloc={name:a.n,short:a.k,color:BLOCPAL[RI(0,BLOCPAL.length-1)],parties:G.gov.parties.slice()}}
  else G.bloc.parties=G.gov.parties.slice();
  // opozycja: istniejący blok tylko czyścimy ze zmarłych i tych, którzy weszli do rządu
  if(G.opoBloc){
    G.opoBloc.parties=G.opoBloc.parties.filter(k=>!G.p[k].dead&&G.p[k].seats>0&&!G.gov.parties.includes(k));
    if(G.opoBloc.parties.length<2)G.opoBloc=null;
  }
  // jeśli gracz sam siedzi w rządzie, opozycja organizuje się bez niego; jeśli jest w opozycji, decyduje sam
  if(!G.opoBloc){
    const opo=alive().filter(k=>G.p[k].seats>0&&!G.gov.parties.includes(k))
      .sort((a,b)=>G.p[b].seats-G.p[a].seats);
    const anchor=opo[0];
    const grp=anchor?[anchor].concat(opo.filter(k=>k!==anchor&&G.rel[k][anchor]>=8&&G.rel[anchor][k]>=8)):[];
    if(grp.length>=2){
      const b=autoName(grp,G.bloc.short);
      G.opoBloc={name:b.n,short:b.k,color:BLOCPAL[(BLOCPAL.indexOf(G.bloc.color)+4)%BLOCPAL.length],parties:grp};
      say(`Opozycja zawiązuje <b>${b.n} (${b.k})</b> wokół ${G.p[anchor].ab}: ${grp.map(k=>G.p[k].ab).join(', ')}.`);
    }
  }
}
function blocOf(k){
  const c=G.p[k].coal;   // lista wyborcza jest ważniejsza, bo od niej zależy próg
  if(c&&G.coal[c])return {name:G.coal[c].n,short:c,color:G.coal[c].c,parties:G.coal[c].m};
  if(G.bloc&&G.bloc.parties.includes(k))return G.bloc;
  if(G.opoBloc&&G.opoBloc.parties.includes(k))return G.opoBloc;
  return null;
}
function allBlocs(){
  const out=[],seen=new Set();
  [G.bloc,G.opoBloc].filter(Boolean).forEach(b=>{if(out.indexOf(b)<0){seen.add(b.short);out.push(b)}});
  for(const c in G.coal){if(seen.has(c))continue;const m=G.coal[c].m.filter(k=>!G.p[k].dead&&G.p[k].seats>0);
    if(m.length){seen.add(c);out.push({name:G.coal[c].n,short:c,color:G.coal[c].c,parties:m})}}
  return out;
}

/* ══════════ PREZYDENT ══════════ */
const isPMperson=n=>!!(G.gov&&G.pmOk&&G.gov.pmLead&&G.gov.pmLead===n);
const isPrezPerson=n=>!!(G.prez&&G.prez.lead===n);
function prezPool(k){
  // kandydować może każdy, także urzędujący prezydent po reelekcję, poza urzędującym premierem i marszałkiem
  const council=G.partyCouncil&&G.partyCouncil.party===k&&Array.isArray(G.partyCouncil.members)&&G.partyCouncil.members.length===5;
  const source=council?(G.partyCouncil.primary&&G.partyCouncil.primaryTerm===G.term?[G.partyCouncil.primary]:G.partyCouncil.members):G.p[k].main.concat(G.p[k].bench,[G.p[k].lead]);
  return [...new Set(source)]
    .filter(n=>!isPMperson(n)&&!isMarPerson(n));
}
/* Premierem zostaje ktoś ze sterów partii, ale nie ten, kto siedzi już w Pałacu
   albo na fotelu marszałka. Przy dwu- i trzyliderstwie wystarczy jeden wolny
   człowiek: partia z prezydentem na czele nadal może wystawić współprzewodniczącego. */
function pmOsoby(k){
  const council=G.partyCouncil&&G.partyCouncil.party===k&&Array.isArray(G.partyCouncil.members)&&G.partyCouncil.members.length===5;
  const source=council?(G.partyCouncil.pm&&G.partyCouncil.pmParty===k?[G.partyCouncil.pm]:G.partyCouncil.members):leads(G.p[k]);
  return source.filter(n=>!isPrezPerson(n)&&!isMarPerson(n));
}
function pmOsoba(k){
  const wolni=pmOsoby(k);
  if(!wolni.length)return null;
  // gdy jest z kogo wybierać, sejm patrzy na autorytet i kompetencję
  return wolni.slice().sort((a,b)=>(L(b).autor*.6+L(b).komp*.4)-(L(a).autor*.6+L(a).komp*.4))[0];
}
function pmBlocked(k){return !pmOsoby(k).length}
function prezRuns(k){
  // słabe partie zwykle nie wystawiają nikogo
  const p=G.p[k];
  if(p.seats>=6||p.fame>66)return true;
  if(p.seats>=4)return ch(.72);
  if(p.seats>=1)return ch(.32);
  return p.fame>40&&ch(.18);
}
function prezCandidates(){
  // liczące się partie wystawiają najlepszego człowieka, lidera albo kogoś z zaplecza
  return alive().filter(k=>(G.p[k].seats>0||G.p[k].fame>34)&&prezRuns(k)).map(k=>{
    const pl2=prezPool(k);
    if(!pl2.length)return null;
    if(G.gov&&G.pmOk&&G.gov.pm===k&&!pl2.length)return null;
    const best=pl2.map(L).sort((a,b)=>(b.char*.6+b.komp*.4)-(a.char*.6+a.komp*.4))[0];
    return {k,lead:best.n};
  }).filter(Boolean);
}
function prezRound1(myRun,pushKp,myWho){
  const q=tally();
  const cands=prezCandidates();
  if(myRun){const i=cands.findIndex(c=>c.k===G.me);
    if(i>=0)cands[i].lead=myWho||cands[i].lead; else cands.push({k:G.me,lead:myWho||me().lead})}
  const sc={};
  cands.forEach(c=>{
    const base=q.res[c.k].tot/q.total*100;
    const ld=L(c.lead);
    let v=base*2.15+ld.char*.13+ld.komp*.055+G.p[c.k].fame*.07+R(-1.6,1.6);
    if(c.k===G.me&&pushKp)v+=pushKp/13;
    if(c.k===G.me&&!myRun)v=0;
    // wykładnik rozjeżdża stawkę: faworyt wyraźnie odskakuje reszcie
    sc[c.k]=Math.max(.4,Math.pow(Math.max(v,1),2.7));
  });
  const live=cands.filter(c=>sc[c.k]>0.5);
  if(!live.length)return {r1:[],runoff:null,winner:cands[0]?cands[0].k:G.me,who:{}};
  const sum=live.reduce((a,c)=>a+sc[c.k],0);
  const who=Object.fromEntries(cands.map(c=>[c.k,c.lead]));
  const r1=live.map(c=>({k:c.k,who:c.lead,pct:sc[c.k]/sum*100})).sort((a,b)=>b.pct-a.pct);
  return {r1,who,decided:r1[0].pct>50,winner:r1[0].pct>50?r1[0].k:null};
}
function prezRound2(r1,who,boost){
  const [a,b]=r1;
  let av=a.pct,bv=b.pct;
  if(a.k===G.me)av+=boost; if(b.k===G.me)bv+=boost;
  r1.slice(2).forEach(x=>{
    const ta=G.rel[x.k][a.k]-ideo(x.k,a.k)*2, tb=G.rel[x.k][b.k]-ideo(x.k,b.k)*2;
    const sa=1/(1+Math.exp(-(ta-tb)/14));
    av+=x.pct*sa*.90; bv+=x.pct*(1-sa)*.90;
  });
  const t2=av+bv;
  const ro=[{k:a.k,who:a.who,pct:av/t2*100},{k:b.k,who:b.who,pct:bv/t2*100}].sort((x,y)=>y.pct-x.pct);
  return {r1,runoff:ro,winner:ro[0].k,who};
}
/* Znacznik kadencji prezydenckiej: zmienia się dopiero wtedy, gdy w Pałacu
   siada ktoś nowy albo ten sam na nową kadencję. */
function prezKadencja(){return G.prez?`${G.prez.party}|${G.prez.lead}|${G.prez.until}`:''}
function crownPrez(k,who){
  G.prez={party:k,lead:who||G.p[k].lead,until:G.term+2};
  G.prezOredzieFor=null;G.useTerm.oredzieP=0;   // nowy prezydent, nowe orędzie
  G.prezHist.push({term:G.term,winner:k});
  if(k===G.me){G.prest+=15;XP(24);M(me(),16);me().fame=cl(me().fame+6)}
  gainAutor(G.prez.lead,RI(3,5));
  say(`<b>${G.prez.lead} (${G.p[k].ab}) prezydentem</b> na dwie kadencje.`,'roy');
}

/* ══════════ MOTYW ══════════ */
function hex2rgb(h){h=String(h||'').replace('#','');
  if(h.length===3)h=h.split('').map(x=>x+x).join('');
  const v=parseInt(h,16);return [v>>16&255,v>>8&255,v&255]}
function rgb2hsl(r,g,b){r/=255;g/=255;b/=255;
  const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let h=0,s=0;const l=(mx+mn)/2;
  if(mx!==mn){const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);
    h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h/=6}
  return [h*360,s*100,l*100]}
const HSL=(h,s,l)=>`hsl(${Math.round(h)} ${Math.round(s)}% ${l.toFixed(1)}%)`;
const THEMEKEYS=['--bg','--p1','--p2','--p3','--line','--line2','--tx','--dim','--dim2','--glowa','--glowb'];
function applyTheme(){
  const R=document.documentElement&&document.documentElement.style;
  if(!R||!R.setProperty)return;
  if(!G||!G.p||!G.p[G.me])return THEMEKEYS.forEach(k=>R.removeProperty(k));
  const col=G.p[G.me].c, rgb=hex2rgb(col), hs=rgb2hsl(rgb[0],rgb[1],rgb[2]);
  const h=hs[0], sat=x=>Math.min(hs[1],x);
  R.setProperty('--bg',   HSL(h,sat(30),5.2));
  R.setProperty('--p1',   HSL(h,sat(24),8.4));
  R.setProperty('--p2',   HSL(h,sat(22),11));
  R.setProperty('--p3',   HSL(h,sat(20),14.4));
  R.setProperty('--line', HSL(h,sat(18),19.5));
  R.setProperty('--line2',HSL(h,sat(18),30));
  R.setProperty('--tx',   HSL(h,14,94));
  R.setProperty('--dim',  HSL(h,10,70));
  R.setProperty('--dim2', HSL(h,8,49));
  R.setProperty('--glowa',`rgba(${rgb[0]},${rgb[1]},${rgb[2]},.16)`);
  R.setProperty('--glowb',`rgba(${rgb[0]},${rgb[1]},${rgb[2]},.07)`);
}
