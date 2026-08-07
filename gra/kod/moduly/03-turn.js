'use strict';
/* ══════════ TURA ══════════ */
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
    let r=Math.random()*t,s=null;
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
function endWeek(){
  const puste=pusteResorty();
  if(puste.length){
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
  const p=me();
  const dateFrom=gameDate();
  ustawPlany();
  ai();drift();aiGoals();aiAgents();aiTransfery();sitTick();scenWydarzeniaTydzien();
  sprzatnijRade();   // po transferach i odejściach rada musi zgadzać się ze składami partii
  sadTydzien();      // sąd sprząta skład i wygasza stare materiały dowodowe
  zwlokaPrezydenta();   // ustawa nie może leżeć na biurku bez końca
  if(isEraNiestab()&&!G.eraNiestab){G.eraNiestab=1;
    say('<b>Era niestabilności.</b> Grudniowo-styczniowy chaos na serwerze ułatwia podbieranie ludzi z innych partii, i tobie, i botom. Potrwa do końca stycznia.','roy');}
  else if(!isEraNiestab()&&G.eraNiestab===1){G.eraNiestab=2;
    say('<b>Era niestabilności się kończy.</b> Werbunek wraca do normy.','roy');}
  if(G.gov)govTick();
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
  }
  /* Dwunasty tydzień jest ostatnim. Po jego rozegraniu idziemy prosto do kampanii
     finałowej i do urn — wcześniej licznik szedł do trzynastu i gra pokazywała
     „13 z 12”, czyli tydzień, którego w kadencji nie ma. */
  const tydzienPrzed=G.week, ostatniTydzien=G.week>=G.weeks;
  if(!ostatniTydzien)G.week++;
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
  pkbTydzien();
  G.en=cl(G.en+enGain());
  Object.keys(G.used).forEach(k=>{if(ch(.42))G.used[k]=Math.max(0,G.used[k]-1)});
  // Tygodniowy ruch jest drobny i tylko uzupełnia to, co naprawdę liczy się przy
  // rozliczeniu kadencji — patrz demografiaSerwera().
  const total=PID.reduce((a,k)=>a+G.p[k].mem,0)+freeTot();
  if(total<SERVER_MAX&&ch(.45)){G.free.ser+=RI(0,1);if(ch(.16))G.free.int+=1}
  G.prev=snap();
  /* Kara szła z tego, że zostały niewydane akcje — a część decyzji akcję zwraca,
     więc odpalała się też komuś, kto zagrał i odzyskał punkt. Liczy się fakt
     zagrania czegokolwiek w tym tygodniu, i tylko to. */
  if(G.actedWeek!==G.term+'-'+tydzienPrzed){
    p.fame=cl(p.fame-1.8);p.act=cl(p.act-2.5);M(p,-4);p.uni=cl(p.uni-1);
    say('<b>Tydzień bez ruchu.</b> Nie zagrałeś ani jednej decyzji, więc kanały partii milczały: sława −1,8, aktywność −2,5, jedność −1.','bad');
  }
  if(G.actedWeek===G.term+'-'+tydzienPrzed)G.streak=(G.streak||0)+1;
  else G.streak=0;
  if(G.recCd>0)G.recCd--;
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
  G.queue=buildEvents();
  {
    // ostrzeżenia nie mogą wstrzymywać kalendarza, inaczej wybory nigdy nie nadchodzą
    if(p.ctr>=90){
      // partia w paraliżu: sondaż na pół, kasa wycieka, ludzie uciekają
      const ucieklo=giveBackCap(p,2), n=ucieklo.eli+ucieklo.int+ucieklo.ser;
      G.kp=Math.max(0,G.kp-Math.round(8+p.mem*.35));   // kasa może się skończyć, ale nie zejść pod zero
      p.fame=cl(p.fame-3);p.act=cl(p.act-3);p.uni=cl(p.uni-3);
      say(`<b>Paraliż: kontrowersja ${Math.round(p.ctr)}/100.</b> Sondaż liczony na pół, z kasy ucieka ${Math.round(8+p.mem*.35)} kapitału`
        +(n?`, odchodzi ${n} ${pl(n,'osoba','osoby','osób')}`:'')+'. Schłodź to, zanim zostanie sam szyld.','bad');
    }
    else if(p.ctr>=70)say(`<b>Kontrowersja ${Math.round(p.ctr)}/100.</b> Przy 90 partia wpada w paraliż: sondaż na pół, kapitał na minus, ludzie wychodzą.`,'bad');
    else if(p.fame<=9&&p.act<=9)say(`<b>${p.lead} ma dość.</b> Sława ${Math.round(p.fame)}, aktywność ${Math.round(p.act)}, o partii nikt już nie pamięta. Rozwiązać cię nikt nie rozwiąże, ale tak się nie wygrywa wyborów.`,'bad');
    if(ostatniTydzien){G.phase='finalcamp';absolutorium()}
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
