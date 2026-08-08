'use strict';
/* Zapis sprawdzamy, zanim cokolwiek podmienimy. Wcześniej kod z innej wersji
   wczytywał się bez słowa i wywalał grę dopiero przy pierwszym brakującym polu —
   już po nadpisaniu stanu, więc nie było do czego wrócić. */
function sprawdzZapis(s){
  const brak=[];
  if(!s||typeof s!=='object')return 'to nie jest zapis gry';
  if(!s.G||typeof s.G!=='object')return 'w kodzie nie ma stanu rozgrywki';
  const G2=s.G;
  if(!G2.p||typeof G2.p!=='object')return 'zapis nie zawiera partii';
  if(!G2.me||!G2.p[G2.me])return 'zapis nie mówi, którą partią grasz';
  ['term','week','ap','kp','en'].forEach(k=>{if(typeof G2[k]!=='number'||!isFinite(G2[k]))brak.push(k)});
  if(brak.length)return `w zapisie brakuje: ${brak.join(', ')}`;
  if(!Array.isArray(s.REG)||!s.REG.length)return 'zapis nie zawiera okręgów';
  if(s.REG.some(r=>!r||!r.id||typeof r.seats!=='number'))return 'okręgi w zapisie są uszkodzone';
  const p=G2.p[G2.me];
  if(!p.lead||!p.comp||typeof p.mem!=='number')return 'twoja partia w zapisie jest niekompletna';
  if(s.v&&s.v>ZAPIS_WERSJA)return `zapis pochodzi z nowszej wersji gry${s.gra?` (${s.gra})`:''} — zaktualizuj grę`;
  return null;
}
if(typeof window!=='undefined')Object.assign(window,{realClockToggle,realClockSpeed,realClockStart,realClockInit});
function loadCode(code){
  const raw=b64d(String(code||'').trim().replace(/^MM/,''));
  if(!raw)throw new Error('nieczytelny kod — sprawdź, czy skopiowałeś go w całości');
  let s;
  try{s=JSON.parse(raw)}catch(e){throw new Error('kod jest uszkodzony albo niepełny')}
  const blad=sprawdzZapis(s);
  if(blad)throw new Error(blad);
  REG.length=0;s.REG.forEach(r=>REG.push(r));
  DIST_SEATS=REG.reduce((a,r)=>a+r.seats,0);
  Object.assign(LEAD,s.LEADX||{});
  scenPartieAktywuj((s.G&&s.G.scen)||'zapis',s.SCEN_PARTIES||[],s.SCEN_GOALS||[],s.SCEN_EDITS||{});
  if(s.CUSTOM&&s.CUSTOM.id)registerCustom(s.CUSTOM);
  G=s.G;
  /* Starsze zapisy nie mają RNG. Dostają stabilny seed z pozycji gry, a nowe
     zapisują bieżący stan generatora, więc błąd można odtworzyć. */
  rngSeed(G.rng||((G.term*1009+G.week*9176+String(G.me||'').length*37)>>>0));
  G.rng=RNG_STATE;
  // partie dodane po powstaniu zapisu dolaczaja z wartosciami startowymi
  PID.forEach(k=>{if(!G.p[k]){
    const b=BASE[k],p2=Object.assign({},b);
    p2.aff=Object.assign({},b.aff);
    p2.pres=Object.fromEntries(REG.map(r=>[r.id,RI(4,26)]));
    p2.coal=null;p2.seats=0;p2.dead=0;p2.pact={};
    p2.comp={eli:b.comp0[0],int:b.comp0[1],ser:b.comp0[2]};
    p2.mem=p2.comp.eli+p2.comp.int+p2.comp.ser;
    p2.mom=0;p2.flow={eli:0,int:0,ser:0};
    p2.lead=LP[k].main[0];p2.bench=LP[k].bench.slice();p2.main=LP[k].main.slice();
    p2.lead2=DUO_START.includes(k)?(LP[k].main[1]||null):null; p2.lead3=null;
    G.p[k]=p2;
  }});
  PID.forEach(a=>{G.rel[a]=G.rel[a]||{};PID.forEach(b2=>{if(a!==b2&&G.rel[a][b2]===undefined)G.rel[a][b2]=RI(-8,26)})});
  G.goals=G.goals||{};G.nationalGoals=G.nationalGoals||{};G.agents=G.agents||{};G.tutSeen=G.tutSeen||{};G.sits=G.sits||[];G.polls=G.polls||[];
  G.aiMemory=G.aiMemory||{};G.aiLedger=Array.isArray(G.aiLedger)?G.aiLedger:[];
  /* Zapis ze starszego wydania nie zna pól, które doszły później. Bez tego gra
     wywracała się przy pierwszym kliknięciu na „G.useTerm.stery” — a to znaczy,
     że gracz tracił rozgrywkę tylko dlatego, że wyszła nowa wersja. */
  G.useTerm=G.useTerm||{};G.catUsed=G.catUsed||{};G.once=G.once||{};G.used=G.used||{};
  G.lup=G.lup||{};G.xpOs=G.xpOs||{};G.znuz=G.znuz||{};G.znuzKad=G.znuzKad||{};
  G.rada=G.rada||{};G.radaOd=G.radaOd||{};G.lawTerm=G.lawTerm||{};G.law=G.law||{};
  G.coal=G.coal||{};G.free=G.free||{eli:0,int:0,ser:0};G.king=G.king||{rel:52,paid:0};
  if(G.gov&&!G.gov.kontrakt){
    const tot=G.gov.parties.reduce((a,k)=>a+(G.p[k]?G.p[k].seats:0),0)||1,demands={};
    G.gov.parties.forEach(k=>{const q=G.p[k],ud=q&&q.comp?Object.keys(q.comp).sort((a,b)=>q.comp[b]-q.comp[a])[0]:'ser';
      demands[k]={resorty:k===G.gov.pm?Math.max(1,Math.round(RESORTY.length*.55)):Math.max(1,Math.round(RESORTY.length*(q?q.seats:0)/tot*.9)),temat:ud};});
    G.gov.kontrakt={od:0,demands,obietnice:[]};
  }
  if(typeof G.bezRzadu!=='number')G.bezRzadu=0;
  if(typeof G.xp!=='number')G.xp=0;
  if(typeof G.prest!=='number')G.prest=0;
  if(typeof G.weeks!=='number'||G.weeks<1)G.weeks=12;
  if(typeof G.week!=='number'||G.week<1)G.week=1;
  if(G.week>G.weeks)G.week=G.weeks;      // stare zapisy potrafią mieć trzynasty tydzień
  if(!G.ptraits){G.ptraits={};if(G.traits&&G.traits.length)G.ptraits[G.p[G.me].lead]=G.traits.slice()}
  G.sejmPrez=null;G.mar=null;
  if(G.phase==='marszalek')G.phase='camp';
  if(G.noise)PID.forEach(k=>{if(G.noise[k]===undefined)G.noise[k]=0});
  return true;
}
/* Wyjście do menu głównego. Pytamy dwa razy, bo bez kodu zapisu rozgrywka przepada. */
function doLobby(){
  close();
  modal('Menu główne','Na pewno wychodzisz?',
    `<p>Wrócisz do ekranu wyboru trybu. Bieżąca rozgrywka <b>zniknie</b>, chyba że masz zapisany kod
     albo plik zapisu — wtedy wczytasz ją później dokładnie w tym miejscu.</p>
     <p class="dim" style="font-size:12.5px">Kadencja ${G.term}, tydzień ${G.week}, ${me().ab}.</p>`,
    [{l:'Tak, wychodzę do menu',s:'Rozgrywka się kończy',f:()=>{
        close();G=null;MODE=null;SCENSEL=null;CRE=null;MENU=true;render();
      }},
     {l:'Zostaję w grze',s:'Nic się nie dzieje',f:close}],close);
}
function openSave(){
  close();
  const active=!!G;
  const code=active?saveCode():'';
  const saveInfo=active?`Długość: ${code.length} znaków · kadencja ${G.term}, tydzień ${G.week}, ${me().ab}`:'Brak aktywnej rozgrywki. Wklej kod poniżej, aby ją wczytać.';
  const v=document.createElement('div');v.className='veil';v.id='veil';
  v.innerHTML=`<div class="mdl"><button class="mdlx" type="button" aria-label="Zamknij">×</button>
    <div class="h"><div class="k">Zapis gry</div><h2>Kod zapisu</h2></div>
    <div class="bd">
      <p>Skopiuj kod i schowaj gdziekolwiek. Wklejenie go w polu niżej przywróci grę dokładnie w tym miejscu ,
      kadencję, skład partii, relacje, ustawy, okręgi i wszystko inne.</p>
      <textarea class="ta" id="sc" style="min-height:110px;font-family:var(--m);font-size:11px" readonly>${active?code:'(Kod pojawi się po rozpoczęciu gry.)'}</textarea>
      <div style="font-size:12px;color:var(--dim2);margin:4px 0 14px">${saveInfo}</div>
      <div style="font-family:var(--m);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--acc);margin-bottom:7px">Wczytaj zapis</div>
      <textarea class="ta" id="lc" style="min-height:80px;font-family:var(--m);font-size:11px" placeholder="Wklej kod zaczynający się od MM..."></textarea>
      <div id="lerr" style="font-size:12.5px;color:var(--neg);margin-top:6px"></div>
    </div>
    <div class="op">
      <button class="opt" id="cp" ${active?'':'disabled'}><b>Kopiuję kod</b><span>${active?'Zaznacza całość, żeby wcisnąć Ctrl+C':'Najpierw rozpocznij rozgrywkę'}</span></button>
      <button class="opt" id="ld"><b>Wczytuję wklejony zapis</b><span>Podmienia bieżącą rozgrywkę</span></button>
      <button class="opt" id="lob"><b>Wychodzę do menu</b><span>Rozgrywka przepadnie, jeśli nie masz kodu</span></button>
      <button class="opt" id="cl"><b>Wracam do gry</b><span></span></button></div></div>`;
  document.body.appendChild(v);
  v.querySelector('#lob').onclick=()=>doLobby();
  v.querySelector('#cp').onclick=()=>{const t=v.querySelector('#sc');t.focus&&t.focus();t.select&&t.select();
    try{document.execCommand&&document.execCommand('copy')}catch(e){}};
  v.querySelector('#cl').onclick=()=>{close();render()};
  v.querySelector('.mdlx').onclick=()=>{close();render()};
  v.querySelector('#ld').onclick=()=>{
    const t=v.querySelector('#lc').value;
    try{loadCode(t);close();say('<b>Zapis wczytany.</b>','good');render()}
    catch(e){v.querySelector('#lerr').innerHTML='Nie udało się wczytać: '+e.message}
  };
}
function summary(){
  const best=G.hist.reduce((a,h)=>Math.max(a,h.seats[G.me]),0);
  const pmC=G.hist.filter(h=>h.pm===G.me).length;
  modal('Podsumowanie',me().n,
   `<p>Kadencji: <b>${G.hist.length}</b> · najlepszy wynik: <b>${best} ${pl(best,'mandat','mandaty','mandatów')}</b>
    · kadencji z twoim premierem: <b>${pmC}</b> · prestiż: <b>${G.prest}</b>.</p>
    <p>Lider: <b>${me().lead}</b>. Członków: <b>${me().mem}</b>. Gra się nie kończy.</p>`,
   [{l:'Gram dalej',s:'Wracasz do gry',f:close},
    {l:'Kod zapisu',s:'Skopiuj i wróć do tej rozgrywki kiedy indziej',f:()=>{close();openSave()}},
    {l:'Nowa gra',s:'Wybór partii od początku',f:()=>{close();G=null;render()}}])}
function dead(){
  app.innerHTML=ekran(`${sztandar('Koniec',
    G.deadWhy==='samorozwiazanie'?'Partia rozwiązana':['elita','kontrowersja','dlugi','krol'].includes(G.deadWhy)?'Administracja rozwiązała partię':'Partia przestała istnieć',
    ({
      kontrowersja:`Kontrowersja doszła do 100. Administracja uznała ${me().n} za źródło ciągłej awantury i zamknęła kanały partii.`,
      dlugi:`Kapitał polityczny spadł do ${Math.round(G.kp)}. Partia utonęła w długach, nikt już nie chciał finansować kampanii, a wierzyciele rozeszli się do konkurencji.`,
      samorozwiazanie:`<b>${me().lead}</b> postanowił rozwiązać partię przez znikomą sławę i aktywność. Kanał zamilkł na dobre, zero rozgłosu, zero ruchu, nikt już nie miał po co zostawać.`,
      elita:`Elita stanowiła ${Math.round(ratio(me(),'eli')*100)}% składu i kontrowersja wymknęła się spod kontroli.`
    })[G.deadWhy] || `${me().n} rozwiązana w kadencji ${G.term}, tydzień ${G.week}. Kanał zarchiwizowany, rola usunięta, nikt nie napisał pożegnalnego posta.`,
    [[G.term,pl(G.term,'kadencja','kadencje','kadencji')],[G.week,'tydzień'],
     [Math.round(me().mem),'osób w partii'],[Math.round(G.xp||0),'dorobku']])}
  ${ekstopka('koniec tej rozgrywki','<button class="btn" onclick="newRun()">Od nowa</button>')}`)}

/* ---- eksport uchwytów ---- */
Object.assign(window,{radykalowie,radykalowieWszystkim,iskra,waznePozycje,waznePasek,modyfikatory,podejrzyjScen,menuIdz,backToMenu,opisTrybu,mediaNumer,mediaKup,mediaNazwij,mediaSzef,mediaOdcinek,mediaFilm,slepyLos,kreWyjdz,kreatorDoPliku,kreatorDane,kreatorEkran,wczytajScenPlik,zapiszScenPlik,podglad,przewidz,start,pickParty,danina,openSave,doLobby,tryLoadFromSetup,marContinue,marDeclare,setMarWho,setHemi:m=>{G.hemiMode=m;render()},endWeek,runElection,doAct,sendTeam,tryGov,goOpo,summary,tg,pay,buyTrait,buyStat,openPush,prezPush,prezWait,togList,makeList,joinList,leaveList,resetLists,aiCoal,listWill,renameBloc,shortFree,opoCard,opoParties,makeOpo,joinOpo,leaveOpo,modalName,actBack,openWerb,openWerb2,werbDo,werbChance,werbPool,openCreator,crClose,crSet,crSetR,crAdj,crImg,crRel,crPoach,crTake,crPeople,crFinish,creator,registerCustom,crCostOf,crMem,doGoal,goalTab,myGoals,myPartyGoals,myNationalGoals,nationalGoalReady,nationalGoalDone,nationalGoalProgress,nationalGoalTick,NATIONAL_GOALS,goalReady,goalOk,switchIdentity,libBecome,hasLib,hasLib2,hasPost,hasLsd,hasKan,hasRob,hasPer,applyGoals,goalDone,GOALS,aiGoals,adsBecome,hasAds,hasHor,apBase,
  openTrain,openRecruit,pmPick,pmVote,pmNext,afterPM,prezGo,prezDone,setPrezWho,
  openStery,sterySet,steryTog,steryOk,openDym,mojeResorty,mogeZglosic,rozwiazChance,LAWS,RESORTY,radaKto,openCamp,campBar,
  pokazPatch,patchZamknij,naborTog,naborPublikuj,setLeadSel,sideToggle,
  openResort,renegocjujKontrakt,startLaw,signLaw,premierTab,prezydentTab,
  closeFinalCamp,runFinalCamp,openEdycja,edytSet,edytOk,
  /* _we to jednorazowa flaga animacji wejścia. Ekran przerysowuje się po każdej
     decyzji, więc gdyby karty wjeżdżały za każdym razem, gra migałaby przy każdym
     kliknięciu. Animacja ma się odpalić tylko przy realnej zmianie widoku. */
  setTab:k=>{if(G.tab!==k)G._we=1;G.tab=k;G.fx='';if(G&&G.tutSeen)G.tutSeen[k]=1;render()}, setCat:c=>{G.cat=c;G.fx='';render()}, setFx:f=>{G.fx=f;render()},
  signAgent,agentCost,agentFree,AGENTS,render,
  ekonomiaTab,kapitalTab,kapPryw,kapPrywRazem,podzialMajatku,kasa,kasaSkrot,budzetInit,budzetWydatek,
  rolaOsoby,pkbTydzien,pkbLicz,pkbMnoznik,pkbCzynniki,pkbCios,stawkaMajatkowa,
  wszyscyZaplecze,alive,openZrzutka,zrzutkaWez,zrzutkaDaje,aiZrzutka,
  stolWpis,stolZatwierdz,zarobekLidera,zarobekTydzien,pkbWykres,openWariant,wariantyUstawy,wariantPo,
  majatekSzefa,panelGlosowania,nextCandidate,pkbZapiszOdczyt,
  RANGI,ranga,rangaNr,nastepnaRanga,mnoznikRangi,rangiStart,sprawdzRangi,absolutorium,
  rangaKoszt,rangaWymog,oknoAbsolutorium,sadTab,sadSklad,sadInit,sadZglos,sadWybierz,
  sadOpenSprawa,sadWnies,sadDowody,sadWymagaObslugi,sadTydzien,nagranieStart,liveLap,DANINA_ZA_PUNKT,NAGR_TRYBY,
  mediaTab,mediaTydzien,mediaBilans,
  zasiegMediow,aiMedia,dlugTydzien,kieszenSzefa,MEDIA_ZASIEG,MEDIA_UTRZYMANIE,absWeek,tally,
  mediaOdcinekGraj,mediaFilmGraj,serduszka,MEDIA_TYP,nagranieMAN,mediaGotowe,mediaZa,mediaJest,
  setSel:s=>{G.sel=s;render()}, newRun:()=>{G=null;MODE=null;SCENSEL=null;MENU=true;render()}, nightStep,nightSkip,nightEnd,startNight,prezNightSkip,prezNightEnd,raport,kurier,toggleMute,pickScen,scenScreen,SCEN,openKreator,kreSet,kreEf,krePartia,krePole,kreWyczysc,KRE_PARTIA,kreatorZapisz,openMody,modUsun,burst,shake,histChart,histPush,SFX,graj,stopMuzyka,coGra,MUZYKA,fxFlush,statTip,streakMul,sitTick,sitBanner,sitActive,SITS,sitKraniecChoice,sitROMChoice,pickMode,backToMode,tutNext,tutSkip,startTutorial,tutBox});
window.pickPartyKrok=pickPartyKrok;
window.premierRozmowa=premierRozmowa;
Object.assign(window,{kreMandat,kreResetMandaty,krePreset,kreRzadTryb,kreRzadTog,krePremier,
  krePremierOsoba,krePrezydentTryb,krePrezydent,krePrezydentOsoba,kreOsobyPartii,kreZapleczeDodaj,kreZapleczeUsun,kreRelacje,kreKrok,kreDalej,kreatorProbuj,
  kreNowaPartia,kreUsunPartie,kreNowaPole,kreNowaLogo,kreCelDodaj,kreCelUsun,kreCelWybierz,kreCelPole,
  kreMetaPole,kreMetaReset,kreMetaLogo,kreAiPole,kreRelUstaw,kreRelUsun,kreSwiatPole,kreObecnosc,
  kreWydDodaj,kreWydSzablon,kreWydDuplikuj,kreWydWybierz,kreWydUsun,kreWydPole,kreWydOpcjaDodaj,kreWydOpcjaUsun,kreWydOpcjaPole,
  kreatorDraftZapisz,kreatorDraftWczytaj,kreatorEksportJSON,kreatorImportJSON,kreatorPodglad,kreatorSymulator});
window.__game={przewidz,podglad,get PROBA(){return PROBA},
  get rng(){return G&&G.rng},get aiLedger(){return G&&G.aiLedger||[]},
  get KRE(){return KRE}, SCEN, kreatorDane,
  myGoals,myPartyGoals,myNationalGoals,nationalGoalReady,nationalGoalDone,nationalGoalProgress,nationalGoalTick,NATIONAL_GOALS,goalDone,goalOk,signAgent,agentFree,agentCost,agenciZostalo,AGENCI_NA_KADENCJE,
  openDym,pusteResorty,openZmiana,openPrzekup,cenaDzialacza,ministerStaz,ministerBlokada,mojeResorty,
  zawiedzeniKoalicjanci,demografiaSerwera,SERVER,SERVER_MAX,AGENTS,mogeZglosic,rozwiazChance,radaKto,RESORTY,pmOsoba,pmOsoby,leads,roster,
  aiTransfery,aiOpozycja,aiObsadzRade,aiRekonstrukcja,aiSad,znuzenie,hegemon,resortyPartii,leadWybrany,aiPlan,ustawPlany,aiPamiec,aiPamietaj,aiAgenda,govKontraktTick,
  rozliczenieKadencji,sprawdzZapis,doganianie,wyborczeZnuzenie,repChetni,BAL,saveCode,loadCode,
  PATCHNOTE,patchDoPokazania,pokazPatch,ustawWersje,get WERSJA(){return WERSJA},
  naborOcena,panelGlosowania,KLOCKI,
  openWywiad,wywiadOdp,wywiadOczekiwany,WYWIAD_PYT,miniGra,
  openPrzekupstwo,przekupSzansa,sprawczosc,zwlokaPrezydenta,ZWLOKA_MAX,
  newGame,endWeek,runElection,tally,allocate,aiGov,startTerm,startPM,doPMVote,pmFailForward,
  localScore,openRecruit,openTrain,collapseGov,makeBlocs,prezPool,drawFrom,giveBack,purge,eliteRisk,ratio,syncCoal,prezDone,makeNoise,XP,
  giveBackCap,prezRound1,prezRound2,runRunoff,memberFlow,prezWait,prezPush,openPush,crownPrez,hemi,pmBlocked,rotateBench,AVA,TEM,INNATE,conflictOf,buyTrait,buyStat,inflacja,inflacjaProc,INFLACJA_PROG,traitsOf,xpOs,xpPula,COMBO,ostatniWynik,hasCen,hasHeg,LOGOS,applyGoals,checkDeath,isPMperson,isPrezPerson,income,EV,wotumChance,prezGo,A,fire,me,topSeg,sejmVote,setGov,PID,REG,SEG,SID,BASE,COAL,LP,LEAD,THR,
  TOPUP,DIST_SEATS,TOTAL_SEATS,MAJ,accepts,thrFor,
  feed,runDateAnim,gameDate,dateStr,mapTab,actTab,pollTab,partieTab,sejmTab,leadTab,kingTab,sidebar,setup,pmScreen,prezScreen,marScreen,startMar,marContinue,marDeclare,isMar,isWice,isMarPerson,ownPool,bestRep,runRace,raceScore,results,TRAITS,sizeF,shown,enGain,pickMain,kingScore,kingFactors,kingFav,allBlocs,rebalanceSeats,isLead,lead,L,innAll,GOALS,openStery,sterySet,steryTog,steryOk,creditsBox,AUTORZY,TESTERZY,WERSJA,
  LAWS,lawVote,proposeLaw,signLaw,odrzucenieWeta,PROG_WETO,applyLaw,lawDone,lawIntake,lawsPending,lawsToSign,startLaw,sadTrop,
  LAWPAR,lawEdytowalna,lawParams,radykalnosc,aiProposeLaw,openEdycja,rozstrzygnijUstawe,
  nastrojSejmu,bylWBloku,doLobby,rysujOkno,
  CHAR,AI_STYLE,charOf,aiProfil,aiWagi,aiLos,aiOkreg,aiCel,ai,POSTERS,aiCoal,aiGoals,aiAgents,campInit,aiPrzemiana,obsadz,openResort,premierRozmowa,partiaOsoby,premierTab,prezydentTab,TOTAL_SEATS_LIVE,
  openCamp,campBar,campRank,runFinalCamp,closeFinalCamp,
  get G(){return G}, czasAkcji,przesunCzas, setRender(f){render=f}, setModal(f){modal=f},
  MODY:()=>MODY, ustawMody:v=>{MODY=Array.isArray(v)?v:[]}, wczytajMody, modEfekty, modyDoScen,
  scenRuntimeStart,scenWydarzeniaTydzien,scenEventWybierz};
render();
/* Mody dociągamy po pierwszym rysowaniu: most do Pythona wstaje chwilę po stronie,
   a ekran wyboru scenariusza i tak przerysuje się, gdy lista dojdzie. */
if(typeof window!=='undefined'){
  const sprobujMody=(ile)=>{
    const a=window.pywebview&&window.pywebview.api;
    if(a&&a.mody)wczytajMody().then(()=>{if(MODY.length)render()});
    else if(ile>0)setTimeout(()=>sprobujMody(ile-1),400);
  };
  setTimeout(()=>sprobujMody(12),300);
}
