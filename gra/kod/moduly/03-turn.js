'use strict';
/* ══════════ TURA ══════════ */
let REAL_TIMER=null;
let REAL_LAST_RENDER=0;
function simClockSync(){
  if(!G)return;
  const h=Math.max(0,Math.floor(Number(G.simHour)||0)),kad=G.weeks*168;
  const inKad=h%kad;
  G.term=Math.floor(h/kad)+1;
  G.week=Math.floor(inKad/168)+1;
  G.czasGodzTygodnia=inKad;
  G.czasTygodnia=Math.floor(inKad/24);
  G.dzienTygodnia=Math.min(7,Math.floor((inKad%168)/24)+1);
  G.godzina=(8+(h%24))%24;
}
function simClockMigrate(){
  if(!G)return;
  if(typeof G.simHour!=='number'||!isFinite(G.simHour))
    G.simHour=Math.max(0,((Math.max(1,G.term||1)-1)*(G.weeks||12)+(Math.max(1,G.week||1)-1))*168+(G.czasGodzTygodnia||0));
  if(typeof G.realCarry!=='number'||!isFinite(G.realCarry))G.realCarry=0;
  simClockSync();
}
function realClockInit(){
  if(!G)return;
  simClockMigrate();
  G.realTimeEconomy=true;
  if(typeof G.realSpeed!=='number')G.realSpeed=1;
  if(typeof G.realPaused!=='boolean')G.realPaused=false;
  /* Ĺšwiat ma jeden logiczny krok = jedna godzina. Timer tylko odtwarza te
     kroki częściej lub rzadziej; prędkość nie przeskakuje po kilka godzin. */
  if(!REAL_TIMER)REAL_TIMER=setInterval(realClockPaint,250);
}
function realtimeHourly(){
  const p=me&&me();if(!p)return;
  if(typeof decyzjeSweep==='function')decyzjeSweep(czasGlobalny());
  const eg=typeof enGain==='function'?enGain():0;
  G.en=cl(G.en+eg/168);
  G._apCarry=(G._apCarry||0)+(G.apMax||3)/168;
  while(G._apCarry>=1&&G.ap<G.apMax){G.ap++;G._apCarry-=1}
  if(typeof kategoriaUzyta==='function'&&G.catTimes)Object.keys(G.catTimes).forEach(k=>kategoriaUzyta(k));
}
function realtimeDaily(){
  /* AI dostaje wiele okazji w ciągu kadencji, ale nie wykonuje ruchu co klatkę.
     Dzienny rytm jest tylko harmonogramem reakcji, nie turą gracza. */
  if(G.phase==='camp'){
    realtimeDriftTick();
    realtimeSituationTick();
    ai();aiGoals();aiAgents();aiTransfery();aiOpozycja();
    if(G.gov){govTickRealtime();govKontraktTick();aiProposeLaw();aiObsadzRade();aiRekonstrukcja()}
    if(!G.queue||!G.queue.length)G.queue=buildEvents();
  }
  if(G.simHour%168===0)makeNoise();
}

/* Główne statystyki nie czekają już na sztuczną granicę tygodnia. Ten krok jest
   celowo mały: siedem dobowych kroków daje w przybliżeniu dawny tygodniowy
   dryf, ale gracz widzi reakcję świata od razu po zmianie daty. */
function realtimeDriftTick(){
  const s=1/7;
  PID.forEach(k=>{
    const p=G.p[k];if(!p||p.dead)return;
    const ld=lead(k),t=Math.max(1,p.mem),re_=p.comp.eli/t,ri=p.comp.int/t,rs=p.comp.ser/t;
    p.fame=cl(p.fame-(p.fame*.022+Math.min(.30,p.fame*.028))*s);
    p.act=cl(p.act-1.3*s);p.ctr=cl(p.ctr-(G.wojna?.7:1.4)*s);
    p.uni=cl(p.uni+(-.4+(ld.autor-54)/32+ri*1.5+re_*.7-rs*2.4)*s);
    if(p.mem<=3)p.uni=Math.max(p.uni,14);
    p.ctr=cl(p.ctr+(rs*1.5*(k===G.me&&hasT('populista')?.5:1)+re_*2.6-ri*.9+eliteRisk(p)*6)*s);
    p.fame=cl(p.fame+(ri*1.4+re_*1.9)*s);
    p.pret=cl(p.pret+(ri*1.6-rs*1.1)*s);
    p.cred=cl(p.cred+((ld.komp-52)/30+(p.comp.int*.9+p.comp.eli*.5-p.comp.ser*.7)/Math.max(1,p.mem)+(k===G.me&&hasT('technokrata')?.8:0))*s);
    REG.forEach(r=>{const baz=p.robMode?BAL.zanikObecnosciRob:p.kanMode?BAL.zanikObecnosciKanal:BAL.zanikObecnosci;p.pres[r.id]=cl(p.pres[r.id]*Math.pow(baz,s))});
    if(p.fame>p.pot)p.fame=cl(p.fame-(p.fame-p.pot)*.18*s);
    p.mom=cl((p.mom||0)*Math.pow(.83,s),-35,42);
    if(p.mom>28&&ch(.20*s)&&p.pot<BASE[k].pot+16)p.pot=cl(p.pot+.5*s);
    if(p.mom<-18&&ch(.20*s))p.pot=cl(Math.max(BASE[k].pot-14,p.pot-.5*s));
    if(k==='KK')p.act=cl(p.act-1.1*s);if(k==='ROM')p.act=cl(p.act-2*s);
    realtimeGoalDrift(k,s);
    if(p.fame<p.pot*.55)p.fame=cl(p.fame+(1.1+(p.mem<12?1.1:0))*s);
    if(k==='FD')p.pret=cl(p.pret+.5*s);
    realtimeLeaderTraitDrift(p,p.lead,s);leads(p).slice(1).forEach(n=>realtimeLeaderTraitDrift(p,n,s));
    if(G.gov&&!G.pmOk&&G.gov.parties.includes(k))p.uni=cl(p.uni-.8*s);
  });
}
function realtimeGoalDrift(k,s){
  const p=G.p[k];
  if(G.law&&G.law.sady)p.ctr=cl(p.ctr-1.1*s);
  if(G.law&&G.law.kodeks)p.ctr=cl(p.ctr-.7*s);
  if(p.adsMode){p.uni=cl(p.uni-2.6*s);p.fame=cl(p.fame+2.8*s);p.act=cl(p.act+1.2*s);p.ctr=cl(p.ctr+1.1*s)}
  if(p.horMode){p.act=cl(p.act+4.1*s);p.uni=cl(p.uni+1.3*s);p.cred=cl(p.cred+.9*s)}
  if(p.lib2Mode)p.uni=cl(p.uni-1.6*s);if(p.postMode)p.act=cl(p.act+3.2*s);
  if(p.robMode){p.uni=cl(p.uni+1*s);p.act=cl(p.act+1.1*s);p.ctr=cl(p.ctr+1.2*s)}
  if(p.rom12Mode){p.uni=cl(p.uni+1.2*s);p.cred=cl(p.cred+.7*s);p.ctr=cl(p.ctr-1*s)}
  if(p.swiaMode){p.ctr=cl(p.ctr-.8*s);if(p.cred<62)p.cred=62}
  if(p.cenMode){p.uni=cl(p.uni+.45*s);p.cred=cl(p.cred+1.3*s);p.ctr=cl(p.ctr-1.1*s);p.pret=cl(p.pret-.8*s);p.act=cl(p.act+1*s)}
  if(p.hegMode){p.fame=cl(p.fame+2.2*s);p.act=cl(p.act+1.4*s);alive().forEach(x=>{if(x!==k&&G.rel[x])G.rel[x][k]=cl(G.rel[x][k]-.7*s,-100,100)})}
  if(p.perMode){p.cred=cl(Math.max(55,p.cred+1.4*s));p.ctr=cl(p.ctr+.8*s);alive().forEach(x=>{if(x!==k&&G.rel[k])G.rel[k][x]=cl(G.rel[k][x]+1*s,-100,100)})}
  if(p.azMode){p.cred=cl(p.cred+.6*s);p.act=cl(p.act+.8*s);p.uni=cl(p.uni+.35*s)}
}
function realtimeLeaderTraitDrift(p,name,s){
  const add=(k,v)=>{p[k]=cl(p[k]+v*s)};
  switch(name){
    case 'Maciek':add('ctr',2.8);add('pret',2.2);break;case 'Lager':add('act',-2.4);break;
    case 'loof':if(!goalDone('demokraci')){add('cred',1.5);add('uni',1.2);add('ctr',2.6)}break;
    case 'Peterdeus':add('act',-1.9);add('uni',-1.4);break;case 'Fazmiś':add('fame',1.6);add('act',3.4);add('cred',-1.8);break;
    case 'Aryati':add('act',4.2);break;case 'Śledzik':add('uni',2.2);add('fame',3.4);break;case 'Mietek Nocul':add('ctr',-1.8);break;
    case 'kenzo':add('act',2.6);add('cred',1.6);break;case 'Bartek':add('cred',-2.8);add('act',-1.6);break;
    case 'Kaziu':if(goalDone('kazik')){add('cred',1.6);add('uni',1.4)}else{add('cred',-2.2);add('act',-2.6)}break;
    case 'Sulejman':add('uni',2.4);add('ctr',1.4);break;case 'Supernes':add('fame',3.4);add('act',3.8);p.cred=Math.min(p.cred,40);break;
    case 'Vengeance':add('pret',1.6);add('fame',1.8);break;case 'Mnem':add('fame',3.2);add('cred',-2.4);add('pret',2);break;
  }
}
function realtimeSituationTick(){
  if(typeof sitTickCzas==='function')sitTickCzas();
  if(typeof scenWydarzeniaCzas==='function')scenWydarzeniaCzas();
  if(typeof sadCzas==='function')sadCzas();
}
function realtimeEconomyTick(){
  if(!G||G.phase!=='camp')return;
  /* Dobowe rozliczenie jest ułamkiem starego tygodnia. Dzięki temu kapitał,
     dług, media i rangi reagują w trakcie płynięcia czasu, a nie dopiero na
     ukrytej granicy tygodnia. */
  if(typeof pkbTydzien==='function')pkbTydzien(1/7);
  if(typeof mediaTick==='function')mediaTick(24);
  if(typeof dlugTick==='function')dlugTick(24);
  if(typeof sprawdzRangi==='function')sprawdzRangi();
}
function realtimeBoundary(){
  /* Stare procedury rozliczeń zachowujemy wyłącznie jako konserwację zapisu i
     przejście kadencji. Gracz nie wywołuje ich klawiszem ani przyciskiem; świat
     idzie dalej godzinami, a decyzje mają własne odnowy liczone w godzinach. */
  if(!G||G.phase!=='camp')return;
  const nowTerm=G.term,nowWeek=G.week,oldWeek=nowWeek>1?nowWeek-1:G.weeks,oldTerm=nowWeek>1?nowTerm:Math.max(1,nowTerm-1);
  const h=G.simHour;G.term=oldTerm;G.week=oldWeek;
  endWeek(true);
  G.simHour=h;simClockSync();
}
function simClockStep(){
  if(!G||PROBA)return false;
  simClockMigrate();
  G.simHour=Math.max(0,Math.floor(G.simHour)+1);
  simClockSync();realtimeHourly();
  if(G.simHour%24===0)realtimeEconomyTick();
  if(G.simHour%168===0)realtimeBoundary();
  else if(G.simHour%24===0)realtimeDaily();
  if(G.phase==='finalcamp'&&G.electionAt&&G.simHour>=G.electionAt){
    G.phase='elect';G.electionAt=null;say('<b>Wybory się rozpoczęły.</b> Urny są otwarte.','roy');
  }
  return true;
}
function realClockPaint(){
  if(!G||PROBA||G.realPaused)return;
  simClockMigrate();
  G.realCarry=(G.realCarry||0)+Math.max(.5,Number(G.realSpeed)||1)/4;
  let n=0;while(G.realCarry>=1&&n<8){G.realCarry-=1;simClockStep();n++}
  if(n){
    /* Symulacja moze isc co godzine, ale calego DOM-u nie trzeba skladac przy
       kazdym kroku. Wczesniej mapa celow tracila uchwyt i scroll skakal, bo
       zegar wymuszal pelny render kilka razy na sekunde. Stan swiata zostaje
       aktualizowany od razu; ekran odswiezamy najwyzej dwa-trzy razy na sekunde
       albo natychmiast, gdy czeka wydarzenie wymagajace reakcji. */
    const now=Date.now(),pilne=!!(G.queue&&G.queue.length)||!!G.sitPending||G.phase!=='camp';
    if(pilne||now-REAL_LAST_RENDER>=420){REAL_LAST_RENDER=now;render()}
  }
}
function realClockStart(){realClockInit();G.realPaused=false;render()}
function realClockToggle(){
  realClockInit();G.realPaused=!G.realPaused;render();
}
function realClockSpeed(v){
  realClockInit();const n=Number(v);G.realSpeed=[.5,1,2,3,4,5].includes(n)?n:1;render();
}
function buildEvents(){
  /* Nie w trakcie wyborów. Wydarzenie wskakujące w środek liczenia głosów albo
     w dogrywkę prezydencką przerywa animację i wygląda jak błąd — a gracz i tak
     nie ma wtedy czym na nie odpowiedzieć. */
  if(G.phase==='elect'||G.phase==='result'||G.phase==='prez'||G.phase==='pmvote'
     ||G.phase==='marszalek'||G.prez2||G.prezState)return [];
  /* Ostatni tydzień kadencji należy do absolutorium. Nic innego nie ma prawa
     wyskoczyć, bo rozliczenie premiera z gospodarki ma być jedyną rzeczą,
     na którą gracz wtedy patrzy. */
  if(G.week>=G.weeks)return [];
  const pool=EV.map(e=>({e,w:e.w()})).filter(x=>x.w>0);
  const n=ch(.14)?2:ch(.62)?1:0,q=[];
  for(let i=0;i<n;i++){
    const t=pool.reduce((a,x)=>a+x.w,0);if(!t)break;
    let r=rnd()*t,s=null;
    for(const x of pool){r-=x.w;if(r<=0){s=x;break}}
    if(!s)break;pool.splice(pool.indexOf(s),1);
    if(s.e.dyn){let b=null;try{b=s.e.build()}catch(err){b=null} if(!b)continue;q.push(Object.assign({},s.e,b))}
    else q.push(s.e);
  }
  return q;
}
/* Premier nie idzie dalej z pustymi krzesłami w rządzie.
   Wcześniej dało się przeczekać całą kadencję bez ani jednego ministra i nic
   z tego nie wynikało — teraz tydzień się nie kończy, dopóki rada nie jest obsadzona. */
function pusteResorty(){
  if(!G.gov||!G.pmOk||G.gov.pm!==G.me)return [];
  radaInit();
  const puste=RESORTY.filter(r=>!radaKto(r.id));
  if(!puste.length)return [];
  // jeśli nie ma kogo posadzić, nie ma czego wymagać — wakat jest wtedy stanem faktycznym
  const zajeci=Object.values(G.rada);
  const wolni=[G.me].concat((G.gov.parties||[]).filter(k=>k!==G.me))
    .flatMap(k=>G.p[k]?roster(G.p[k]):[])
    .filter(n=>!zajeci.includes(n));
  return wolni.length?puste:[];
}
function endWeek(automatic=false){
  const puste=pusteResorty();
  if(puste.length&&!automatic){
    G.tab='premier';
    SFX.bad();
    modal('Kancelaria premiera','Rada ministrów niekompletna',
      `<p>Jesteś premierem, a ${puste.length===RESORTY.length?'żaden resort nie ma ministra'
        :`${puste.length} ${pl(puste.length,'resort stoi pusty','resorty stoją puste','resortów stoi pustych')}`}:
       <b>${puste.map(r=>r.n).join(', ')}</b>.</p>
       <p style="margin-top:10px">Sejm nie przejdzie do kolejnego tygodnia z niedokończonym gabinetem.
       Obsadź krzesła w <b>Kancelarii premiera</b>. Masz jeszcze ludzi, których da się tam posadzić —
       gdyby ich zabrakło, gra przestanie o to prosić.</p>`,
      [{l:'Idę obsadzić rząd',f:()=>{close();G.tab='premier';render()}}]);
    render();
    return;
  }
  if(puste.length&&automatic)say('<b>Wakat w radzie ministrów.</b> Symulacja płynie dalej, a brak resortów osłabia rząd.','bad');
  /* Wakaty w Sądzie są obowiązkowe dla gabinetu, który je otworzył, ale nie
     mogą zatrzymywać opozycji ani pierwszej kadencji przed powstaniem rządu.
     Wcześniej sam fakt wejścia ustawy w życie blokował każdemu ręczne przejście
     tygodnia, nawet gdy gracz nie miał żadnej możliwości obsadzenia sędziów. */
  const sadWymagaGracza=typeof sadWymagaObslugi==='function'&&sadWymagaObslugi()
    &&!!(G.gov&&G.gov.pm===G.me&&G.pmOk);
  if(sadWymagaGracza&&!automatic){
    G.tab='sad';
    modal('Sąd','Najpierw obsadź skład sądu',
      `<p>Ustawa o sądzie weszła w życie, ale nadal brakuje sędziów. Każda kandydatura musi przejść przez głosowanie sejmu.</p>
       <p class="dim">Tydzień nie może się skończyć, dopóki nie obsadzisz wszystkich wakatów albo nie zabraknie legalnych kandydatów.</p>`,
      [{l:'Idę do Sądu',f:()=>{close();G.tab='sad';render()}}]);
    render();
    return;
  }
  if(typeof sadWymagaObslugi==='function'&&sadWymagaObslugi()&&automatic)say('<b>Wakat w sądzie.</b> Sprawy czekają na kandydatów, ale kalendarz nie zatrzymuje świata.','bad');
  const p=me();
  const dateFrom=gameDate();
  ustawPlany();
  ai();if(G.realTimeEconomy!==true)drift();aiGoals();aiAgents();aiTransfery();
  if(G.realTimeEconomy!==true){sitTick();scenWydarzeniaTydzien();}
  sprzatnijRade();   // po transferach i odejściach rada musi zgadzać się ze składami partii
  if(G.realTimeEconomy!==true)sadTydzien();      // zegar ciągły robi to codziennie
  zwlokaPrezydenta();   // ustawa nie może leżeć na biurku bez końca
  if(isEraNiestab()&&!G.eraNiestab){G.eraNiestab=1;
    say('<b>Era niestabilności.</b> Grudniowo-styczniowy chaos na serwerze ułatwia podbieranie ludzi z innych partii, i tobie, i botom. Potrwa do końca stycznia.','roy');}
  else if(!isEraNiestab()&&G.eraNiestab===1){G.eraNiestab=2;
    say('<b>Era niestabilności się kończy.</b> Werbunek wraca do normy.','roy');}
  if(G.gov){govTick();govKontraktTick();}
  if(typeof pkbCios==='function'&&G.gov&&G.gov.appr<38)
    pkbCios('rząd',Math.min(4,(38-G.gov.appr)/5),'Niskie poparcie rządu zatrzymało inwestycje',3);
  if(G.gov&&G.pmOk){
    G.gov.parties.forEach(k=>{const q=G.p[k];
      const w=resortyPartii(k)/Math.max(1,RESORTY.length);
      if(G.gov.appr>52){q.fame=cl(q.fame+.7+w*1.4);if(ch(.14+w*.3)){const gt=drawFrom('polityka',1);q.comp.eli+=gt.eli;q.comp.int+=gt.int;q.comp.ser+=gt.ser;q.mem+=gt.eli+gt.int+gt.ser}}
      else if(G.gov.appr<38){q.fame=cl(q.fame-.8);M(q,-1)}
      if(k===G.gov.pm){q.fame=cl(q.fame+2.6);q.act=cl(q.act+1.2);M(q,1.2)}});
  } else {
    /* Kryzys rządowy narasta. Pierwszy tydzień bez gabinetu to jeszcze normalne
       targi, ale każdy kolejny kosztuje coraz więcej: serwer przestaje wierzyć,
       że ktokolwiek to poskłada. Wcześniej brak rządu był praktycznie darmowy
       i dało się przeczekać całą kadencję bez premiera. */
    G.bezRzadu=(G.bezRzadu||0)+1;
    const t=G.bezRzadu, sila=Math.min(3.4,1+(t-1)*.55);
    alive().forEach(k=>{const q=G.p[k];
      q.act=cl(q.act-1.8*sila);q.uni=cl(q.uni-1.1*sila);M(q,-1.5*sila);
      if(t>=3)q.cred=cl(q.cred-.9*(sila-1));      // nikt nie wierzy klasie politycznej
    });
    G.kp=Math.max(0,G.kp-Math.round(4*sila));
    // przy przeciągającym się paraliżu ludzie zaczynają wychodzić z partii
    if(t>=4&&ch(.30+Math.min(.4,(t-4)*.09))){
      const poszli=giveBackCap(me(),1), ilu=poszli.eli+poszli.int+poszli.ser;
      if(ilu)say(`<b>Kryzys rządowy, tydzień ${t}.</b> Ludzie mają dość patrzenia na pusty gabinet — odchodzi ${ilu}.`,'bad');
    }
    if(t===1)say('<b>Serwer bez rządu.</b> Kanały cichną, nikt nic nie ustala.','bad');
    else if(t===3)say('<b>Trzeci tydzień bez rządu.</b> Aktywność i jedność lecą we wszystkich partiach, kasa wycieka szybciej.','bad');
    else if(t>=5&&ch(.5))say(`<b>Paraliż władzy: ${t} tydzień bez gabinetu.</b> Serwer przestaje traktować sejm poważnie.`,'bad');
    else if(ch(.35))say('<b>Serwer bez rządu.</b> Kanały cichną, ludzie odpływają, nikt nic nie ustala.','bad');
    if(typeof pkbCios==='function')pkbCios('paraliz',Math.min(5,1+t*.55),'Brak rządu zamroził decyzje i pieniądze',2);
  }
  /* Dwunasty tydzień jest ostatnim. Po jego rozegraniu idziemy prosto do kampanii
     finałowej i do urn — wcześniej licznik szedł do trzynastu i gra pokazywała
     „13 z 12”, czyli tydzień, którego w kadencji nie ma. */
  const tydzienPrzed=G.week, ostatniTydzien=G.week>=G.weeks;
  if(!ostatniTydzien)G.week++;
  /* Kompatybilność ze starym wywołaniem endWeek(): ręczne testy, stare zapisy i
     część modów mogą nadal zamknąć tydzień przyciskiem. Zegar musi wtedy dostać
     ten sam skok, inaczej następny render przelicza simHour=0 z powrotem na
     tydzień pierwszy i wygląda to jak zablokowany kalendarz. Przy prawdziwym
     ticku czasu simHour jest już dalej, więc niczego nie cofamy. */
  const oczekiwanyStart=((Math.max(1,G.term||1)-1)*Math.max(1,G.weeks||1)+(Math.max(1,G.week||1)-1))*168;
  if(!Number.isFinite(Number(G.simHour))||Number(G.simHour)<oczekiwanyStart)G.simHour=oczekiwanyStart;
  /* Nowy tydzień zaczyna się od pierwszego dnia, ale historia czasu zostaje
     w zapisie, żeby gracz widział rytm decyzji zamiast teleportu bez śladu. */
  G.dzienTygodnia=1;G.czasTygodnia=0;G.czasGodzTygodnia=0;G.godzina=8;
  dateAnim={from:dateFrom,to:gameDate()};
  G.apMax=apBase();G.ap=G.apMax;
  G.sztab=G.sztabMax=5+Math.floor(p.mem/22);
  {  // premier i pałac ściągają ludzi sami z siebie
    const urz=(isPM()?1:0)+(hasPrez()?1:0);
    if(urz>0){const g=drawFrom('polityka',urz);const n=g.eli+g.int+g.ser;
      if(n){p.comp.eli+=g.eli;p.comp.int+=g.int;p.comp.ser+=g.ser;p.mem+=n;
        say(`<b>Urząd przyciąga.</b> ${isPM()&&hasPrez()?'Fotel premiera i pałac dorzucają':isPM()?'Fotel premiera dorzuca':'Pałac prezydencki dorzuca'} ${n} ${pl(n,'osobę','osoby','osób')} w tym tygodniu.`,'good')}}
  }
  G.kp+=income().total;
  {  // kapitał ma pracować: nadwyżka topnieje, a serwer zaczyna gadać o partii, która tylko zbiera
    const lim=Math.max(70,income().total*6)*(hasLsd(G.me)?1.9:1);
    if(G.kp>lim){
      const nad=G.kp-lim, kara=Math.round(nad*.24+5);
      G.kp-=kara;
      p.ctr=cl(p.ctr+Math.min(7,1.2+nad/80));
      p.fame=cl(p.fame-Math.min(4,nad/110));
      p.act=cl(p.act-Math.min(3,nad/150));
      say(`<b>Kapitał leży bezczynnie.</b> Limit to ${Math.round(lim)}, a ty trzymasz ${Math.round(G.kp+kara)}: przepada ${kara}, kontrowersja rośnie. Serwer nie lubi partii, które tylko zbierają.`,'bad');
    }
    /* Danina od leżącego kapitału partii poszła precz. Ustawa o podatkach robiła
       dwie zupełnie różne rzeczy pod jedną nazwą: skubała kapitał partii i osobno
       majątki prywatne, a do tego przestawiała progresję składek. Nie dało się
       z tego wyczytać, co właściwie robi jeden suwak. Zostaje jedno znaczenie:
       podatek od majątku dotyczy prywatnych kont i przez nie rusza PKB. */
  }
  // gospodarka rusza się raz na tydzień, po rozliczeniu daniny
  if(G.realTimeEconomy!==true)pkbTydzien();
  G.en=cl(G.en+enGain());
  /* Zmęczenie decyzji wygasa rollingowo po 168 godzinach w ostatnieUzycia().
     Nie losujemy już raz na granicy tygodnia, bo to było kolejne ukryte
     „odświeżenie tury”. */
  // Tygodniowy ruch jest drobny i tylko uzupełnia to, co naprawdę liczy się przy
  // rozliczeniu kadencji — patrz demografiaSerwera().
  const total=PID.reduce((a,k)=>a+G.p[k].mem,0)+freeTot();
  if(total<SERVER_MAX&&ch(.45)){G.free.ser+=RI(0,1);if(ch(.16))G.free.int+=1}
  G.prev=snap();
  /* Kara szła z tego, że zostały niewydane akcje — a część decyzji akcję zwraca,
     więc odpalała się też komuś, kto zagrał i odzyskał punkt. Liczy się fakt
     zagrania czegokolwiek w tym tygodniu, i tylko to. */
  /* Kara sprawdza faktyczny czas ostatniej zatwierdzonej decyzji. Samo pole
     actedWeek bylo tylko etykietą i po cofnięciu okna potrafiło zostawić pusty
     tydzień jako wykonany albo odwrotnie. */
  const mialRuch=Number(G.lastRealActionAt)>=czasGlobalny()-168;
  if(!mialRuch){
    p.fame=cl(p.fame-1.8);p.act=cl(p.act-2.5);M(p,-4);p.uni=cl(p.uni-1);
    say('<b>Tydzień bez ruchu.</b> Nie zagrałeś ani jednej decyzji, więc kanały partii milczały: sława −1,8, aktywność −2,5, jedność −1.','bad');
  }
  if(mialRuch)G.streak=(G.streak||0)+1;
  else G.streak=0;
  if(G.recCdAt===undefined&&G.recCd>0)G.recCd--;
  aiProposeLaw();          // premier sterowany przez komputer też składa projekty
  aiObsadzRade();          // i sam obsadza ministerstwa, zamiast trzymać puste krzesła
  aiRekonstrukcja();       // a niewygodnego koalicjanta potrafi wyrzucić
  aiOpozycja();            // opozycja rozlicza rząd bez czekania na gracza
  histPush();SFX.week();
  G.catUsed={};G.used2={};G.lastCharge=null;G.stolPend=null;podgladCache={};   // niedokończone okno nie może przejść na kolejny tydzień
  /* Nastroje trzech części serwera pozostają lekkim, losowym pulsem elektoratu.
     Nie ma już osobnego systemu zadowolenia grup interesu, który nadpisywał
     ten ruch i drugi raz liczył ten sam podział ludzi. */
  if(ch(.13)){const a=pick(SID);let b=pick(SID);while(b===a)b=pick(SID);
    G.mood[a]=cl(G.mood[a]+R(.06,.13),.76,1.28);
    G.mood[b]=cl(G.mood[b]-R(.05,.11),.76,1.28);
    say(`<b>Zmiana nastrojów.</b> „${sn(a)}” się mobilizują, „${sn(b)}” tracą zapał.`)}
  makeNoise();
  if(!G.queue||!G.queue.length)G.queue=buildEvents();
  {
    // ostrzeżenia nie mogą wstrzymywać kalendarza, inaczej wybory nigdy nie nadchodzą
    if(p.ctr>=96){
      // partia w paraliżu: sondaż słabnie, kasa wycieka, ludzie uciekają
      const ucieklo=giveBackCap(p,2), n=ucieklo.eli+ucieklo.int+ucieklo.ser;
      G.kp=Math.max(0,G.kp-Math.round(8+p.mem*.35));   // kasa może się skończyć, ale nie zejść pod zero
      p.fame=cl(p.fame-3);p.act=cl(p.act-3);p.uni=cl(p.uni-3);
      say(`<b>Paraliż: kontrowersja ${Math.round(p.ctr)}/100.</b> Sondaż słabnie, z kasy ucieka ${Math.round(8+p.mem*.35)} kapitału`
        +(n?`, odchodzi ${n} ${pl(n,'osoba','osoby','osób')}`:'')+'. Schłodź to, zanim zostanie sam szyld.','bad');
    }
    else if(p.ctr>=70)say(`<b>Kontrowersja ${Math.round(p.ctr)}/100.</b> Przy 96 partia wpada w paraliż: sondaż słabnie, kapitał ucieka, ludzie wychodzą.`,'bad');
    else if(p.fame<=9&&p.act<=9)say(`<b>${p.lead} ma dość.</b> Sława ${Math.round(p.fame)}, aktywność ${Math.round(p.act)}, o partii nikt już nie pamięta. Rozwiązać cię nikt nie rozwiąże, ale tak się nie wygrywa wyborów.`,'bad');
    if(ostatniTydzien){G.phase='finalcamp';G.electionAt=(G.simHour||czasGlobalny())+24;absolutorium()}
    else if(G.prez2&&G.week>=G.prez2.week){runRunoff();return}
    else if(G.week===6&&G.term%2===0&&(!G.prez||G.term>=G.prez.until)){G.phase='prez';G.prezState=null}
  }
  render();
}
function leaderTraitDrift(p,name){
  switch(name){
    // Tłuszczolt: Maciek nie przechodzi obok żadnej awantury, ale dwór go lubi
    case 'Maciek':    p.ctr=cl(p.ctr+2.8);p.pret=cl(p.pret+2.2); break;
    case 'Lager':     p.act=cl(p.act-2.4); break;
    case 'loof':      if(!goalDone('demokraci')){p.cred=cl(p.cred+1.5);p.uni=cl(p.uni+1.2);p.ctr=cl(p.ctr+2.6)} break;
    case 'Peterdeus': p.act=cl(p.act-1.9);p.uni=cl(p.uni-1.4); break;
    case 'Fazmiś':    p.fame=cl(p.fame+1.6);p.act=cl(p.act+3.4);p.cred=cl(p.cred-1.8); break;
    case 'Aryati':    p.act=cl(p.act+4.2); break;
    case 'Śledzik':   p.uni=cl(p.uni+2.2);p.fame=cl(p.fame+3.4); break;
    case 'Mietek Nocul': p.ctr=cl(p.ctr-1.8); break;
    case 'kenzo':     p.act=cl(p.act+2.6);p.cred=cl(p.cred+1.6); break;
    case 'Bartek':    p.cred=cl(p.cred-2.8);p.act=cl(p.act-1.6);
                      if(!G.lup[name])G.lup[name]=[0,0,0,0];
                      if(ch(.55)&&L(name).char<99)G.lup[name][0]+=1; break;
    // po celu „Kazikmistrz” ta sama osoba działa w drugą stronę
    case 'Kaziu':     if(goalDone('kazik')){p.cred=cl(p.cred+1.6);p.uni=cl(p.uni+1.4)}
                      else{p.cred=cl(p.cred-2.2);p.act=cl(p.act-2.6)} break;
    case 'Sulejman':  p.uni=cl(p.uni+2.4);p.ctr=cl(p.ctr+1.4); break;
    case 'Supernes':  p.fame=cl(p.fame+3.4);p.act=cl(p.act+3.8);
                      p.cred=Math.min(p.cred,40); break;
    case 'Vengeance': p.pret=cl(p.pret+1.6);p.fame=cl(p.fame+1.8); break;
    case 'Mnem':      p.fame=cl(p.fame+3.2);p.cred=cl(p.cred-2.4);p.pret=cl(p.pret+2); break;
  }
}
function drift(){
  PID.forEach(k=>{
    const p=G.p[k];if(p.dead)return;
    const ld=lead(k);
    p.fame=cl(p.fame-p.fame*.022-Math.min(.30,p.fame*.028));
    p.act=cl(p.act-1.3);p.ctr=cl(p.ctr-(G.wojna?.7:1.4));
    const t=Math.max(1,p.mem), re_=p.comp.eli/t, ri=p.comp.int/t, rs=p.comp.ser/t;
    p.uni=cl(p.uni-.4+(ld.autor-54)/32 + ri*1.5 + re_*.7 - rs*2.4);
    if(p.mem<=3)p.uni=Math.max(p.uni,14);   // trzyosobowa partia nie ma jak się rozpaść na frakcje
    p.ctr=cl(p.ctr + rs*1.5*(k===G.me&&hasT('populista')?.5:1) + re_*2.6 - ri*.9 + eliteRisk(p)*6);
    p.fame=cl(p.fame + ri*1.4 + re_*1.9);
    p.pret=cl(p.pret + ri*1.6 - rs*1.1);
    p.cred=cl(p.cred+(ld.komp-52)/30 + (p.comp.int*.9+p.comp.eli*.5-p.comp.ser*.7)/Math.max(1,p.mem) + (k===G.me&&hasT('technokrata')?.8:0));
    // Obecność osypuje się szybciej, niż wynikało z dawnych .945 — przy tamtym tempie
    // wystarczyło raz wejść w kanał i już się z niego nie schodziło. Teraz trzeba wracać.
    REG.forEach(r=>p.pres[r.id]=cl(p.pres[r.id]*(p.robMode?BAL.zanikObecnosciRob:p.kanMode?BAL.zanikObecnosciKanal:BAL.zanikObecnosci)));
    if(p.fame>p.pot)p.fame=cl(p.fame-(p.fame-p.pot)*.18);
    p.mom=cl((p.mom||0)*.83,-35,42);
    const cap=BASE[k].pot+16;
    if(p.mom>28&&ch(.20)&&p.pot<cap)p.pot=cl(p.pot+.5);
    if(p.mom<-18&&ch(.20))p.pot=cl(Math.max(BASE[k].pot-14,p.pot-.5));
    if(k==='KK')p.act=cl(p.act-1.1);
    if(k==='ROM')p.act=cl(p.act-2.0);
    goalDrift(k);
    if(p.fame<p.pot*.55)p.fame=cl(p.fame+1.1+(p.mem<12?1.1:0));   // każdy ma prawo do odbicia od dna
    if(k==='FD')p.pret=cl(p.pret+.5);
    leaderTraitDrift(p,p.lead);
    leads(p).slice(1).forEach(n=>leaderTraitDrift(p,n));
    /* Odejścia. Jedność je hamuje, ale nigdy nie zatrzymuje: przy pełnej zgodzie
       i tak co jakiś czas ktoś odpada, bo inaczej wystarczyło pilnować jedności,
       żeby partia rosła w nieskończoność. Im większa partia, tym trudniej ją
       utrzymać w kupie — moloch sam się osypuje. */
    if(p.mem>6){
      // Jedność nadal chroni — ale wyłącznie partie, które da się ogarnąć.
      // Każdy kolejny próg wielkości dokłada odejść, więc moloch osypuje się sam.
      const duza=p.mem>44?BAL.odejsciaDuza:0, olbrzym=p.mem>70?BAL.odejsciaOlbrzym:0, kolos=p.mem>100?BAL.odejsciaKolos:0;
      const podloga=p.mem>70?.13:p.mem>44?.10:p.mem>20?.055:.03;
      const szansa=cl(BAL.odejsciaBaza-(p.uni-50)/BAL.odejsciaJednosc+duza+olbrzym+kolos+(p.ctr>70?.10:0),podloga,.50);
      if(ch(szansa)){
        const ile=p.mem>90?3:p.mem>55?2:1, q2=giveBack(p,ile), n=q2.eli+q2.int+q2.ser;
        if(n&&k===G.me)say(`<b>Odejście z partii.</b> ${n} ${pl(n,'osoba odchodzi','osoby odchodzą','osób odchodzi')} po cichu. Przy jedności ${Math.round(p.uni)} zdarza się to ${szansa>.3?'często':szansa>.18?'czasem':'rzadko'}.`,'bad');
      }
    }
    // czasem zaplecze rezygnuje na dobre i wraca do bezpartyjnych, segment wg kompetencji
    /* Ludzie z zaplecza nie znikają już w powietrzu. Odejście bez powodu i bez
       śladu w decyzjach było tylko podatkiem od pecha — kto ma odejść, ten odchodzi
       do konkurencji (patrz aiTransfery), i wtedy widać dokąd i dlaczego. */
    // molochy: przy dużym, ustabilizowanym poparciu trzeba czasem poświęcić ludzi dla wizerunku, elita zostaje
    if(p.mem>150){
      const nadmiar=cl((p.mem-150)/300,0,1);
      const oslona=cl(1-(p.act-40)/80,.15,1);   // wysoka aktywność mocno ogranicza ryzyko
      if(ch(nadmiar*.4*oslona)){
        const seg=p.comp.ser>0?'ser':(p.comp.int>0?'int':null);
        if(seg){
          const cele=alive().filter(x=>x!==k);
          const cel=cele.length?pick(cele):null;
          p.comp[seg]--;p.mem--;
          if(cel){G.p[cel].comp[seg]++;G.p[cel].mem++}
          if(k===G.me)say(`<b>Zarządzanie wizerunkiem.</b> Przy tak dużym poparciu trzeba było kogoś poświęcić: ${seg==='ser'?'serwerowicz':'intelektualista'} przechodzi do ${cel?G.p[cel].ab:'konkurencji'}. Elita zostaje. Wyższa aktywność mocno obniża to ryzyko.`,'bad');
        }
      }
    }
    if(G.gov&&!G.pmOk&&G.gov.parties.includes(k))p.uni=cl(p.uni-.8);
  });
}
