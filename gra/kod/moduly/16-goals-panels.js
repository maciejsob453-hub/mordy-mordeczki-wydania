'use strict';
/* ---- cele partyjne ---- */
/* Wynik twojej partii w ostatnich wyborach. Zanim padły pierwsze, nie ma czego
   czytać — zwracamy null, żeby warunek pokazał to wprost zamiast udawać zero. */
function ostatniWynik(){
  if(!G||!G.hist||!G.hist.length)return null;
  const h=G.hist[G.hist.length-1];
  return typeof h.pct==='number'?h.pct:null;
}
const hasAds=k=>!!(G&&G.p[k]&&G.p[k].adsMode);
const hasHor=k=>!!(G&&G.p[k]&&G.p[k].horMode);
const hasLib=k=>!!(G&&G.p[k]&&G.p[k].libMode);
const hasLib2=k=>!!(G&&G.p[k]&&G.p[k].lib2Mode);
const hasPost=k=>!!(G&&G.p[k]&&G.p[k].postMode);
const hasLsd=k=>!!(G&&G.p[k]&&G.p[k].lsdMode);
const hasKan=k=>!!(G&&G.p[k]&&G.p[k].kanMode);
const hasRob=k=>!!(G&&G.p[k]&&G.p[k].robMode);
const hasPer=k=>!!(G&&G.p[k]&&G.p[k].perMode);
const hasCen=k=>!!(G&&G.p[k]&&G.p[k].cenMode);
const hasHeg=k=>!!(G&&G.p[k]&&G.p[k].hegMode);
function apBase(){
  return Math.max(1, 3+(isPM()?1:0)+(hasPrez()?1:0)+(hasAds(G.me)?2:0)+(hasHeg(G.me)?1:0)-(hasHor(G.me)?1:0));
}
function applyGoals(){
  if(!G)return;
  if(!G.goals)G.goals={};
  if(G.goals.republika){const p=G.p[G.me];if(p.fame<70)p.fame=70}
  if(hasLib2(G.me)){const p=G.p[G.me];if(p.fame<50)p.fame=50}
  // Centrum stoi jednością, hegemon sławą — obie podłogi są celowo niższe
  // niż przy republice, żeby te cele nie robiły z partii pomnika.
  // podłoga jedności trzyma Centrum przy życiu, ale nie wygrywa mu już wyborów
  if(hasCen(G.me)){const p=G.p[G.me];if(p.uni<30)p.uni=30}
  if(hasHeg(G.me)){const p=G.p[G.me];if(p.fame<58)p.fame=58}   // podloga slawy nizej: hegemon ma byc mocny, nie nietykalny
}
function goalDrift(k){
  const p=G.p[k];
  // sądy administracyjne: awantury rozstrzyga się formalnie, więc emocje szybciej siadają
  if(G.law&&G.law.sady)p.ctr=cl(p.ctr-1.1);
  // kodeks karny: za ostre teksty są konsekwencje, cała scena pilnuje się bardziej
  if(G.law&&G.law.kodeks)p.ctr=cl(p.ctr-.7);
  if(p.adsMode){p.uni=cl(p.uni-2.6);p.fame=cl(p.fame+2.8);p.act=cl(p.act+1.2);p.ctr=cl(p.ctr+1.1)}
  /* Cele partyjne przestają być maszynką do jedności. Darmowa zgoda w partii
     działała jak trwały bonus do wyniku niezależnie od tego, co gracz robił;
     teraz każdy cel daje jej wyraźnie mniej, a w zamian mocniej wspiera to,
     co widać na serwerze — aktywność, wiarygodność i obecność. */
  if(p.horMode){p.act=cl(p.act+4.1);p.uni=cl(p.uni+1.3);p.cred=cl(p.cred+.9)}
  if(p.lib2Mode)p.uni=cl(p.uni-1.6);
  if(p.postMode)p.act=cl(p.act+3.2);
  if(p.robMode){p.uni=cl(p.uni+1.0);p.act=cl(p.act+1.1);p.ctr=cl(p.ctr+1.2)}
  if(p.rom12Mode){p.uni=cl(p.uni+1.2);p.cred=cl(p.cred+.7);p.ctr=cl(p.ctr-1)}
  // Świadek Koronny: sama reputacja, żadnej dźwigni
  if(p.swiaMode){p.ctr=cl(p.ctr-.8);if(p.cred<62)p.cred=62}
  // Centrum stoi spokojem i wiarygodnością, a nie samą jednością
  if(p.cenMode){p.uni=cl(p.uni+.45);p.cred=cl(p.cred+1.3);p.ctr=cl(p.ctr-1.1);p.pret=cl(p.pret-.8);p.act=cl(p.act+1.0)}
  // Hegemon rośnie, ale sam swoim rozmiarem drażni resztę sceny
  if(p.hegMode){p.fame=cl(p.fame+2.2);p.act=cl(p.act+1.4);
    alive().forEach(x=>{if(x!==k&&G.rel[x])G.rel[x][k]=cl(G.rel[x][k]-.7,-100,100)})}
  if(p.perMode){p.cred=cl(Math.max(55,p.cred+1.4));p.ctr=cl(p.ctr+.8);
    alive().forEach(x=>{if(x!==k&&G.rel[k])G.rel[k][x]=cl(G.rel[k][x]+1,-100,100)})}
}
const GOALS={
 /* DPD nie skacze prosto do Republikańskiej — najpierw musi przejść przez Centrum.
    Dwie drogi z jednej partii (Kazikmistrz i Centrum) mają być wyborem, a nie
    skrótem do najsilniejszego celu w grze. */
 republika:{n:'Pod błyskiem niebieskiej chwały',for:['PPP','PLR','PKD','NBR','DPD'],logo:'REP',bots:0,
  /* Ten warunek odsiewał wyłącznie DPD, więc cel otwierał się każdemu — łącznie
     z monarchistami i socjaldemokratami, którzy nie mają z republiką nic wspólnego.
     Liczy się przynależność do obozu republikańskiego i nic poza nią. */
  avail:()=>GOALS.republika.for.includes(G.me),
  what:'Odtwarzasz Partię Republikańską. Stare barwy, stare gwiazdy, twój szyld, a pozostałe partie z tym samym celem wchłaniasz razem z ludźmi i mandatami.',
  req:[
   {t:'Przychylność Króla co najmniej 50',v:()=>Math.round(kingFav(G.me))+' / 50',ok:()=>kingFav(G.me)>=50},
   {t:'Co najmniej 150 osób w partii',v:()=>me().mem+' / 150',ok:()=>me().mem>=150},
   {t:'Kaziu, Europejczyk, Eniki, Ponczus i Tako w partii',
    v:()=>{const o=roster(me());return ['Kaziu','Europejczyk','Eniki','Ponczus','Tako'].filter(n=>o.includes(n)).length+' / 5'},
    ok:()=>{const o=roster(me());return ['Kaziu','Europejczyk','Eniki','Ponczus','Tako'].every(n=>o.includes(n))}},
   {t:'Twoja partia ma obecnie premiera albo prezydenta',v:()=>isPM()?'premier':hasPrez()?'prezydent':'brak',ok:()=>isPM()||hasPrez()},
   {t:'Aktywność partii co najmniej 50',v:()=>Math.round(me().act)+' / 50',ok:()=>me().act>=50},
   {t:'Co najmniej 5 elit w składzie',v:()=>me().comp.eli+' / 5',ok:()=>me().comp.eli>=5},
   {t:'Zgoda przynajmniej jednej partii republikańskiej (relacja +55)',
    v:()=>{const ch2=repChetni();return ch2.length?ch2.map(k=>G.p[k].ab).join(', '):'żadna'},
    ok:()=>repChetni().length>=1},
  ],
  cons:['Pod sztandar wchodzą tylko te partie republikańskie, które same tego chcą: relacja co najmniej +55.',
   'Niechętne zostają na scenie, ale tracą część ludzi i mocno psują z tobą relacje.',
   'Łatwiejsza dyplomacja: partie wchodzą z tobą w koalicje przy relacji o 12 niższej.',
   'Sława nigdy nie spada poniżej 70.',
   'Każda decyzja dostaje boost: efekty ×1,15.'],
  run(){const p=me();p.n='Partia Republikańska';p.ab='PR';p.c='#1e63d0';p.logo='REP';p.repMode=1;
   p.fame=Math.max(p.fame,70);M(p,16);
   /* Zjednoczenie zamiast połknięcia. Wcześniej cel kasował cztery partie naraz
      i praktycznie kończył rozgrywkę. Teraz przyłączają się tylko te, które
      naprawdę chcą — resztę trzeba sobie zjednać wcześniej albo zostawić w spokoju. */
   const chetni=repChetni(), oporni=GOALS.republika.for.filter(k=>k!==G.me&&G.p[k]&&!G.p[k].dead&&!chetni.includes(k));
   let os=0,mn=0;
   chetni.forEach(k=>{const q=G.p[k];
     os+=q.mem;mn+=q.seats;
     p.comp.eli+=q.comp.eli;p.comp.int+=q.comp.int;p.comp.ser+=q.comp.ser;p.mem+=q.mem;
     p.seats+=q.seats;
     q.bench.forEach(n=>{if(!p.bench.includes(n)&&p.bench.length<12)p.bench.push(n)});
     if(!p.bench.includes(q.lead)&&p.bench.length<12)p.bench.push(q.lead);
     q.dead=1;q.mem=0;q.comp={eli:0,int:0,ser:0};q.seats=0;q.bench=[];
     if(G.gov&&G.gov.parties.includes(k))govLeave(k);
   });
   // kto się nie przyłączył, odchorowuje rozłam, ale zostaje w grze i pamięta
   oporni.forEach(k=>{const q=G.p[k];
     const zabrane=giveBackCap(q,Math.max(1,Math.round(q.mem*.18)));
     const ile=zabrane.eli+zabrane.int+zabrane.ser;
     q.uni=cl(q.uni-10);q.fame=cl(q.fame-6);
     G.rel[G.me][k]=cl(G.rel[G.me][k]-30,-100,100);G.rel[k][G.me]=cl(G.rel[k][G.me]-30,-100,100);
     if(ile){p.comp.ser+=ile;p.mem+=ile}
   });
   if(chetni.length)say(`<b>Zjednoczenie.</b> ${chetni.map(k=>G.p[k].ab).join(', ')} ${pl(chetni.length,'wchodzi','wchodzą','wchodzą')} pod niebieski sztandar: ${os} ${pl(os,'osoba','osoby','osób')} i ${mn} ${pl(mn,'mandat','mandaty','mandatów')}.`,'roy');
   if(oporni.length)say(`<b>${oporni.map(k=>G.p[k].ab).join(', ')} ${pl(oporni.length,'odmawia','odmawiają','odmawiają')}.</b> Zostają na scenie, tracą po kilku ludzi i zapamiętują ci to na długo.`,'bad');
   graj('dyktator');
   say('<b>Pod błyskiem niebieskiej chwały.</b> Partia Republikańska wraca na serwer, a prowadzisz ją ty.','roy')}},
 /* Wynik ostatnich wyborów. Przed pierwszymi nie ma czego czytać, więc cele
    z takim warunkiem po prostu jeszcze nie są spełnione. */
 centrum:{n:'Ani w lewo, ani w prawo',for:['DPD'],logo:'CEN',bots:0,
  what:'Przestajesz się tłumaczyć jednym i drugim skrzydłem. Tako, Kaziu i balon pod jednym szyldem, a serwer dostaje partię, która nie obiecuje rewolucji — tylko że będzie.',
  req:[
   {t:'Co najmniej 15 osób w partii',v:()=>me().mem+' / 15',ok:()=>me().mem>=15},
   // Tako siedzi wśród bezpartyjnych — trzeba go najpierw ściągnąć decyzją „Werbunek”
   {t:'Tako, Kaziu i balon w partii',
    v:()=>{const o=roster(me());return ['Tako','Kaziu','balon'].filter(n=>o.includes(n)).length+' / 3'},
    ok:()=>{const o=roster(me());return ['Tako','Kaziu','balon'].every(n=>o.includes(n))}},
   {t:'Co najmniej 10% w ostatnich wyborach',
    v:()=>ostatniWynik()===null?'jeszcze nie było wyborów':fmt(ostatniWynik())+'% / 10%',
    ok:()=>(ostatniWynik()||0)>=10},
   {t:'Dopiero od trzeciej kadencji',v:()=>'kadencja '+G.term+' / 3+',ok:()=>G.term>=3},
  ],
  cons:['Partia występuje odtąd jako Partia Centrum.',
   'Wiarygodność rośnie o 1,3 tygodniowo, aktywność o 1,0, a kontrowersja i pretensjonalność powoli schodzą.',
   'Jedność rośnie o 0,45 tygodniowo i nie spada poniżej 30 — tyle, żeby partia się trzymała, za mało, żeby wygrywać samą zgodą.',
   'Dyplomacja łatwiejsza: koalicjanci schodzą z wymaganiami o 8.',
   'Na koniec kadencji dochodzi trochę więcej ludzi — środek przyciąga niezdecydowanych.',
   'Droga do Partii Republikańskiej pozostaje otwarta.'],
  run(){const p=me();p.n='Partia Centrum';p.ab='PC';p.c='#1f7f86';p.logo='CEN';p.cenMode=1;
   p.uni=cl(p.uni+7);p.cred=cl(p.cred+8);p.pret=cl(p.pret-8);p.act=cl(p.act+5);M(p,10);
   say('<b>Ani w lewo, ani w prawo.</b> Partia Centrum wchodzi na scenę i po raz pierwszy od dawna nikt nie wie, na kogo się obrazić.','roy')}},
 hegemon:{n:'Hegemon Perspektywiczny',for:['NP'],logo:'HEG',bots:0,
  what:'Nowa Perspektywa przestaje być jedną z partii i staje się punktem odniesienia dla całego serwera. Jugen, Kenzo i kisielek48 w jednym składzie, urząd w ręku i kasa w skarbcu.',
  req:[
   {t:'Co najmniej 50 osób w partii',v:()=>me().mem+' / 50',ok:()=>me().mem>=50},
   {t:'Twoja partia ma obecnie premiera albo prezydenta',v:()=>isPM()?'premier':hasPrez()?'prezydent':'brak',ok:()=>isPM()||hasPrez()},
   {t:'Powyżej 25% w ostatnich wyborach',
    v:()=>ostatniWynik()===null?'jeszcze nie było wyborów':fmt(ostatniWynik())+'% / >25%',
    ok:()=>(ostatniWynik()||0)>25},
   {t:'Dopiero od piątej kadencji',v:()=>'kadencja '+G.term+' / 5+',ok:()=>G.term>=5},
   {t:'Jugen, Kenzo i kisielek48 w partii',
    v:()=>{const o=roster(me());return ['Jugen','kenzo','kisielek48'].filter(n=>o.includes(n)).length+' / 3'},
    ok:()=>{const o=roster(me());return ['Jugen','kenzo','kisielek48'].every(n=>o.includes(n))}},
   {t:'Ponad 500 kapitału w kasie',v:()=>Math.round(G.kp)+' / >500',ok:()=>G.kp>500},
  ],
  cons:['Partia występuje odtąd jako Hegemonia Perspektywiczna.',
   'Sława rośnie o 2,2 tygodniowo i nigdy nie spada poniżej 65.',
   'Jedna dodatkowa akcja w każdym tygodniu.',
   'Składki wyższe o 45% — skarbiec pracuje na ciebie.',
   'Ale hegemona nikt nie lubi: wszystkie partie tracą do ciebie 15 relacji od ręki i po 0,7 tygodniowo.',
   'Zmęczenie serwera władzą narasta o jedną czwartą szybciej.'],
  run(){const p=me();p.n='Hegemonia Perspektywiczna';p.ab='HP';p.c='#c8952b';p.logo='HEG';p.hegMode=1;
   p.fame=Math.max(p.fame,65);p.uni=cl(p.uni+10);p.cred=cl(p.cred+8);M(p,20);
   alive().forEach(k=>{if(k===G.me)return;
     G.rel[G.me][k]=cl(G.rel[G.me][k]-15,-100,100);G.rel[k][G.me]=cl(G.rel[k][G.me]-15,-100,100)});
   G.apMax=apBase();G.ap=Math.max(G.ap,1);
   say('<b>Hegemon Perspektywiczny.</b> Nowa Perspektywa przestaje być partią, a zaczyna być pogodą na serwerze. Reszta sceny właśnie zrozumiała, że gra o drugie miejsce.','roy')}},
 demokraci:{n:'Oryginał zawsze będzie lepszy',for:['FD'],logo:'PD',bots:0,
  what:'Przywracasz Partię Demokratyczną. Front kończy udawanie, że jest czymś nowym.',
  req:[
   {t:'Przychylność Króla powyżej 0',v:()=>Math.round(kingFav(G.me))+' / >0',ok:()=>kingFav(G.me)>0},
   {t:'Min. 2 elity i 10 intelektualistów w składzie',v:()=>me().comp.eli+' elity · '+me().comp.int+' int.',ok:()=>me().comp.eli>=2&&me().comp.int>=10},
   {t:'Dopiero po pierwszej kadencji',v:()=>'kadencja '+G.term+' / 2+',ok:()=>G.term>=2},
  ],
  cons:['loof traci „Zawsze ma rację i zawsze to powie” i dostaje „Memento potęgi demokratów”: +12 do dyplomacji koalicyjnej i ×1,25 do decyzji kampanii (tylko kampanii).',
   'Wraca elitarny Plawik: +1 do elity, dopisuje się do partii.',
   'Za nim przychodzi ke_Trab: +1 do intelektualistów, też do partii.',
   'Front występuje odtąd jako Partia Demokratyczna.'],
  run(){const p=me();p.n='Partia Demokratyczna';p.ab='PD';p.c='#7aa842';p.logo='PD';p.demMode=1;
   p.comp.eli+=1;p.mem+=1;if(!p.bench.includes('Plawik'))p.bench.push('Plawik');
   p.comp.int+=1;p.mem+=1;if(!p.bench.includes('ke_Trab'))p.bench.push('ke_Trab');
   M(p,14);
   say('<b>Oryginał zawsze będzie lepszy.</b> Partia Demokratyczna wraca, a z nią Plawik i ke_Trab. loof odkłada rację na półkę i sięga po pamięć.','roy')}},
 ads:{n:'Alternatywa dla nowości',for:['DPD','FD','PLR'],logo:'ADS',bots:1,
  avail:()=>['DPD','FD','PLR'].includes(G.me)&&!hasLib(G.me)&&!hasPost(G.me),
  what:'Zbierasz pod jednym szyldem wszystkich, którzy mają dość nowinek, i robisz z tego maszynę do zbierania kapitału. Loof, Tortex i Kaziu w jednym składzie, jeden z nich na czele.',
  req:[
   {t:'Co najmniej 30 osób w partii',v:()=>me().mem+' / 30',ok:()=>me().mem>=30},
   {t:'loof, Tortex, Kaziu i Tako w składzie partii',v:()=>{const o=ownPool(G.me);return ['loof','Tortex','Kaziu','Tako'].filter(n=>o.includes(n)).length+' / 4'},
    ok:()=>{const o=ownPool(G.me);return ['loof','Tortex','Kaziu','Tako'].every(n=>o.includes(n))}},
   {t:'Jeden z nich przewodzi partii',v:()=>me().lead,ok:()=>['loof','Tortex','Kaziu'].includes(me().lead)},
  ],
  cons:['Jedność leci na pysk i dalej spada co tydzień, ale sława rośnie równie szybko.',
   'Dyplomacja w błoto: koalicjanci chcą o 25 wyższej relacji, a wszystkie relacje spadają o 20 od ręki.',
   'Kapitał: składki rosną ponad dwuipółkrotnie, każdy członek zaczyna się realnie opłacać.',
   'Dwie dodatkowe akcje w każdym tygodniu.'],
  run(){const p=me();adsBecome(G.me);
   alive().forEach(k=>{if(k===G.me)return;G.rel[G.me][k]=cl(G.rel[G.me][k]-20,-100,100);G.rel[k][G.me]=cl(G.rel[k][G.me]-20,-100,100)});
   G.apMax=apBase();G.ap=Math.max(G.ap,1);
   say('<b>Alternatywa dla nowości.</b> Nowy szyld, stare pretensje i kasa płynąca strumieniem. Rozmawiać z tobą nikt już nie chce.','roy')}},
 liberal:{n:'Ku liberalizmu, partio!',for:['NBR','PLR','PKD'],logo:'LIB',bots:1,
  avail:()=>['NBR','PLR','PKD'].includes(G.me)&&!hasPost(G.me),
  what:'Zbierasz wokół siebie wszystkich, którym nie po drodze ani z monarchistami, ani z memiarzami, i wywieszasz żółtą różę. Aryati robi hałas, Pan Hod_Dog dogaduje resztę.',
  req:[
   {t:'Co najmniej 30 osób w partii',v:()=>me().mem+' / 30',ok:()=>me().mem>=30},
   {t:'Aryati w składzie partii',v:()=>ownPool(G.me).includes('Aryati')?'jest':'brak',ok:()=>ownPool(G.me).includes('Aryati')},
   {t:'Pan Hod_Dog w partii',v:()=>roster(me()).includes('Pan Hod_Dog')?'jest':'brak',ok:()=>roster(me()).includes('Pan Hod_Dog')},
  ],
  cons:['Partia występuje odtąd jako Partia Liberalna, z żółtą różą w herbie.',
   'Pretensjonalność spada o 18, sława rośnie o 12, wiarygodność o 8.',
   'Dyplomacja łatwiejsza: koalicjanci schodzą z wymaganiami o 10.',
   'Otwiera się kolejny cel: „Jeszcze nie kończymy z liberalizmem!”.',
   'Partia Liberalna nadal może odtworzyć Partię Republikańską.'],
  run(){libBecome(G.me);
   say('<b>Ku liberalizmu, partio!</b> Żółta róża idzie w górę, a serwer po raz pierwszy od dawna słyszy słowo „program” bez ironii.','roy')}},
 liberal2:{n:'Jeszcze nie kończymy z liberalizmem!',for:[],logo:'ALT',bots:0,
  avail:()=>!!(G.p[G.me]&&G.p[G.me].libMode),
  what:'Róża to za mało. Zjednoczasz pod jednym szyldem całe liberalne skrzydło serwera i wchłaniasz to, co z niego zostało.',
  req:[
   {t:'Co najmniej 50 osób w partii',v:()=>me().mem+' / 50',ok:()=>me().mem>=50},
   {t:()=>'Relacja z '+(G.me==='PKD'?'NBR':'PKD')+' co najmniej +30',
    v:()=>{const o=G.me==='PKD'?'NBR':'PKD';return Math.round(G.rel[G.me][o])+' / 30'},
    gone:()=>{const o=G.me==='PKD'?'NBR':'PKD';return !G.p[o]||G.p[o].dead},
    ok:()=>{const o=G.me==='PKD'?'NBR':'PKD';return !!G.p[o]&&!G.p[o].dead&&G.rel[G.me][o]>=30}},
   {t:'Sława co najmniej 80',v:()=>Math.round(me().fame)+' / 80',ok:()=>me().fame>=80},
  ],
  cons:['NBR, PKD i każda inna Partia Liberalna zostają wchłonięte razem z ludźmi i mandatami.',
   'Napływ ludzi na koniec każdej kadencji jest wyraźnie większy.',
   'Sława nigdy nie spada poniżej 50.',
   'Dyplomacja: koalicjanci schodzą z wymaganiami o 18.',
   'Jedność spada o 1,6 tygodniowo, tak duże skrzydło zawsze się trochę kłóci.',
   'Droga do Partii Republikańskiej pozostaje otwarta.'],
  run(){const p=me();
   p.n='Alternatywa Liberalna';p.ab='AL';p.c='#c0392b';p.logo='ALT';p.lib2Mode=1;
   p.fame=Math.max(p.fame,50);M(p,14);
   const cel=alive().filter(k=>k!==G.me&&(['NBR','PKD'].includes(k)||G.p[k].libMode));
   let os=0,mn=0;
   cel.forEach(k=>{const q=G.p[k];
     os+=q.mem;mn+=q.seats;
     p.comp.eli+=q.comp.eli;p.comp.int+=q.comp.int;p.comp.ser+=q.comp.ser;p.mem+=q.mem;p.seats+=q.seats;
     q.bench.concat([q.lead]).forEach(n=>{if(!p.bench.includes(n)&&p.bench.length<12)p.bench.push(n)});
     q.dead=1;q.mem=0;q.comp={eli:0,int:0,ser:0};q.seats=0;q.bench=[];
     if(G.gov&&G.gov.parties.includes(k))govLeave(k);
   });
   if(cel.length)say(`<b>Unifikacja.</b> ${cel.map(k=>G.p[k].ab).join(', ')} znikają z listy partii: ${os} ${pl(os,'osoba','osoby','osób')} i ${mn} ${pl(mn,'mandat','mandaty','mandatów')} przechodzą do ciebie.`,'roy');
   say('<b>Jeszcze nie kończymy z liberalizmem!</b> Alternatywa Liberalna wchodzi do gry jako jedno wielkie, kłótliwe skrzydło.','roy')}},
 /* Kazikmistrz: jedyny cel, który niczego nie przemianowuje i nie zmienia herbu.
    Zmienia jedną osobę — z chodzącej katastrofy w kogoś, z kim wszyscy chcą rozmawiać.
    Dlatego nagroda jest wąska: dotyczy Kazia, a nie całej partii. */
 /* Świadek Koronny — cel globalny, dostępny każdemu i najtrudniejszy w grze.
    Nagroda jest celowo skromna: to ma być coś, czym się chwalisz, a nie coś,
    czym wygrywasz. Trzeba przetrwać cztery kadencje poza rządem, zachować
    czyste konto i mimo wszystko liczyć się w sejmie. */
 swiadek:{n:'Świadek Koronny',for:[],logo:'SWIA',bots:0,
  what:'Cztery kadencje z rzędu poza rządem, bez jednej brudnej zagrywki i wciąż w grze. Nikt ci nic nie zawdzięcza i nikt nie ma na ciebie haka. Na tym serwerze to rzadsze niż wygrane wybory.',
  req:[
   {t:'Co najmniej piąta kadencja',v:()=>'kadencja '+G.term+' / 5+',ok:()=>G.term>=5},
   {t:'Cztery kadencje z rzędu poza rządem',
    v:()=>{const h=G.hist||[];const ile=h.slice(-4).filter(x=>x.pm!==G.me).length;
      return Math.min(4,ile)+' / 4'},
    ok:()=>{const h=G.hist||[];return h.length>=4&&h.slice(-4).every(x=>x.pm!==G.me)}},
   {t:'Kontrowersja poniżej 25',v:()=>Math.round(me().ctr)+' / <25',ok:()=>me().ctr<25},
   {t:'Wiarygodność co najmniej 75',v:()=>Math.round(me().cred)+' / 75',ok:()=>me().cred>=75},
   {t:'Co najmniej 8 mandatów mimo wszystko',v:()=>me().seats+' / 8',ok:()=>me().seats>=8},
  ],
  cons:['Tytuł Świadka Koronnego zostaje przy partii do końca rozgrywki.',
   'Wiarygodność nie spada poniżej 62 — reputacji zbudowanej przez cztery kadencje nie da się stracić z tygodnia na tydzień.',
   'Kontrowersja schodzi o 0,8 tygodniowo. Nic poza tym.',
   'Żadnych premii do sondażu, mandatów ani kapitału. To jest odznaczenie, nie dźwignia.'],
  run(){const p=me();
   p.swiaMode=1;p.cred=cl(p.cred+6);
   say('<b>Świadek Koronny.</b> Cztery kadencje w opozycji, czyste konto i mandaty, których nikt ci nie dał w prezencie. Serwer to odnotował.','roy')}},
 kazik:{n:'Kazikmistrz',for:['DPD'],logo:'KAZIK',bots:0,
  what:'Kaziu bierze partię, wygrywa wybory i nagle okazuje się, że przez te wszystkie lata wszyscy się mylili. Nie zmienia się szyld ani herb — zmienia się on.',
  req:[
   {t:'Kaziu przewodzi partii',v:()=>isLead(me(),'Kaziu')?'przewodzi':me().lead,ok:()=>isLead(me(),'Kaziu')},
   {t:'Co najmniej 20% w ostatnich wyborach',
    v:()=>ostatniWynik()===null?'jeszcze nie było wyborów':fmt(ostatniWynik())+'% / 20%',
    ok:()=>(ostatniWynik()||0)>=20},
   {t:'Co najmniej 250 kapitału w kasie',v:()=>Math.round(G.kp)+' / 250',ok:()=>G.kp>=250},
  ],
  cons:['Kaziu traci cechę „Ktoś to musiał wziąć” i dostaje „Stare dobre lata”.',
   'Wraca jego stary awatar — ten, po którym wszyscy go pamiętają.',
   'Zamiast tracić, partia zyskuje: wiarygodność +1,6 i jedność +1,4 tygodniowo.',
   'Koalicjanci schodzą z wymaganiami o 14 zamiast żądać o 16 więcej — różnica trzydziestu punktów w każdej rozmowie.',
   'Nazwa, herb i barwy partii zostają bez zmian. To nie przemiana partii, tylko jednego człowieka.'],
  run(){const p=me();
   p.cred=cl(p.cred+10);p.uni=cl(p.uni+8);M(p,14);
   say('<b>Kazikmistrz.</b> Kaziu wygrywa wybory i z dnia na dzień przestaje być tym, o którym mówiło się „ktoś to musiał wziąć”.','roy')}},
 lsd:{n:'Miara nader postępu',for:[],logo:'LSD',bots:0,
  avail:()=>hasPost(G.me),
  what:'Postępowcy przestają być partią, a stają się aparatem: własna szkoła kadr, własna kasa i orędzia, których serwer nie umie zignorować.',
  req:[
   {t:'Co najmniej 50 osób w partii',v:()=>me().mem+' / 50',ok:()=>me().mem>=50},
   {t:'Aryati, Kaziu i Mnem w partii',v:()=>{const o=roster(me());return ['Aryati','Kaziu','Mnem'].filter(n=>o.includes(n)).length+' / 3'},
    ok:()=>{const o=roster(me());return ['Aryati','Kaziu','Mnem'].every(n=>o.includes(n))}},
   {t:'Twoja partia ma premiera',v:()=>isPM()?'premier':'brak',ok:()=>isPM()},
  ],
  cons:['Partia występuje odtąd jako Lewicowy Sojusz Demokratyczny.',
   'Limit kapitału rośnie o 90%, więc podatek od nadwyżki boli znacznie później.',
   'Wszystkie decyzje kosztują o 20% mniej kapitału.',
   'Nowa kategoria decyzji „Przemiana”: jednym kliknięciem przekwalifikowujesz serwerowicza na intelektualistę.',
   'Orędzia uderzają dwa razy mocniej w obecność i dorzucają trwałą przewagę w sondażach.'],
  run(){const p=me();
   p.n='Lewicowy Sojusz Demokratyczny';p.ab='LSD';p.c='#8e1e5e';p.logo='LSD';p.lsdMode=1;
   p.cred=cl(p.cred+8);p.uni=cl(p.uni+6);M(p,14);G.cat='prm';
   say('<b>Miara nader postępu.</b> Postępowcy zamieniają się w Lewicowy Sojusz Demokratyczny: własna kasa, własne kadry, własne orędzia.','roy')}},
 robotnicy:{n:'Partia Kolektywnych Robotników',for:['PP'],logo:'PKR',bots:1,
  what:'Partia Pracy przestaje być klubem dyskusyjnym i zamienia się w maszynę: własne struktury w każdym kanale, '
   +'werbunek z polecenia i kasa liczona co do grosza.',
  req:[
   {t:'Co najmniej 20 osób w partii',v:()=>me().mem+' / 20',ok:()=>me().mem>=20},
   {t:'Włóczykij i Rax w składzie partii',v:()=>{const o=ownPool(G.me);return ['Włóczykij','Rax'].filter(n=>o.includes(n)).length+' / 2'},
    ok:()=>{const o=ownPool(G.me);return ['Włóczykij','Rax'].every(n=>o.includes(n))}},
   {t:'Co najmniej 100 kapitału na koncie',v:()=>Math.round(G.kp)+' / 100',ok:()=>G.kp>=100},
  ],
  cons:['Partia występuje odtąd jako Partia Kolektywnych Robotników.',
   'Nabór przynosi o jedną czwartą więcej ludzi, a bilans kadencji rośnie o jedną osobę.',
   'Obecność w kanałach rośnie o 15% mocniej po każdej decyzji i spada nieco wolniej.',
   'Składki serwerowiczów podwojone: to oni utrzymują tę partię.',
   'Jedność rośnie o 1,8 tygodniowo, struktury trzymają ludzi razem, ale kontrowersja rośnie o 1,2: aparat partyjny budzi podejrzenia.'],
  run(){const p=me();
   p.n='Partia Kolektywnych Robotników';p.ab='PKR';p.c='#1d3f7a';p.logo='PKR';p.robMode=1;
   p.uni=cl(p.uni+12);p.act=cl(p.act+10);REG.forEach(r=>p.pres[r.id]=cl(p.pres[r.id]+8));M(p,12);
   say('<b>Partia Kolektywnych Robotników.</b> Koniec gadania, zaczynają się struktury.','roy')}},
 kanal:{n:'Kanał w końcu żyje',for:[],logo:'KAN',bots:0,avail:()=>true,
  what:'Najprostszy cel w grze. Wystarczy, żeby na kanałach partii coś się faktycznie działo i żeby ludzie o was słyszeli w kilku miejscach naraz.',
  req:[
   {t:'Aktywność co najmniej 45',v:()=>Math.round(me().act)+' / 45',ok:()=>me().act>=45},
   {t:'Obecność powyżej 30 w trzech kanałach',v:()=>REG.filter(r=>me().pres[r.id]>=30).length+' / 3',
    ok:()=>REG.filter(r=>me().pres[r.id]>=30).length>=3},
   {t:'Co najmniej 6 osób w partii',v:()=>me().mem+' / 6',ok:()=>me().mem>=6},
  ],
  cons:['Dołącza dwóch serwerowiczów, aktywność skacze o 10.',
   'Obecność w okręgach spada wolniej: 3,8% tygodniowo zamiast 5,5%.',
   'Nie zmienia nazwy ani szyldu i nie blokuje żadnego innego celu.'],
  run(){const p=me();
   p.kanMode=1;p.act=cl(p.act+10);
   const g=drawFrom('ogolny',2);p.comp.eli+=g.eli;p.comp.int+=g.int;p.comp.ser+=g.ser;p.mem+=g.eli+g.int+g.ser;
   REG.forEach(r=>p.pres[r.id]=cl(p.pres[r.id]+6));M(p,8);
   say('<b>Kanał w końcu żyje.</b> Ludzie zaczynają wpadać sami, a obecność trzyma się dłużej.','good')}},
 reka:{n:'Ręka Mordeczki',for:[],logo:'HAND',bots:0,avail:()=>true,
  what:'Król przestaje traktować cię jak jedną z wielu partii i wysyła do ciebie ludzi ze swojego otoczenia. Cel dostępny dla każdego ugrupowania.',
  req:[
   {t:'Przychylność Króla co najmniej 60',v:()=>Math.round(kingFav(G.me))+' / 60',ok:()=>kingFav(G.me)>=60},
  ],
  cons:['Do partii wchodzi 1 osoba z elity i 2 intelektualistów, prosto z dworu.',
   'Nie zmienia nazwy ani szyldu, to układ, nie manifest.',
   'Nie blokuje żadnego innego celu.'],
  run(){const p=me();
   p.comp.eli+=1;p.comp.int+=2;p.mem+=3;
   p.uni=cl(p.uni+6);p.cred=cl(p.cred+4);M(p,8);
   kingRel(4,'Przyjmuje twoich ludzi jak swoich.');
   say('<b>Ręka Mordeczki.</b> Z dworu przychodzi jedna osoba z elity i dwóch intelektualistów. Nikt nie pyta, na jakich zasadach.','roy')}},
 postep:{n:'Będąc postępem warunkuje POSTĘP',for:['PLR'],logo:'POST',bots:1,
  what:'Zbierasz ekipę, która nie chce już niczego naprawiać, tylko robić po swojemu, i zamieniasz partię w maszynę do werbowania.',
  req:[
   {t:'Sulejman, balon i Prawe Jąderko w składzie partii',
    v:()=>{const o=ownPool(G.me);return ['Sulejman','balon','Prawe Jąderko'].filter(n=>o.includes(n)).length+' / 3'},
    ok:()=>{const o=ownPool(G.me);return ['Sulejman','balon','Prawe Jąderko'].every(n=>o.includes(n))}},
   {t:'Co najmniej 30 osób w partii',v:()=>me().mem+' / 30',ok:()=>me().mem>=30},
   {t:'Co najmniej 15% w ostatnich wyborach',
    v:()=>ostatniWynik()===null?'jeszcze nie było wyborów':fmt(ostatniWynik())+'% / 15%',
    ok:()=>(ostatniWynik()||0)>=15},
  ],
  cons:['Partia występuje odtąd jako Postępowcy, ze smokiem w herbie.',
   'Aktywność skacze o 22 i rośnie o 3,2 tygodniowo.',
   'Nabór działa o połowę mocniej: gdzie dotąd przychodziło dwóch serwerowiczów, przyjdzie trzech.',
   'Zamyka drogę do Partii Liberalnej i do Alternatywy dla Serwera: postępowcy idą własną ścieżką.',
   'Republikanów nadal da się odtworzyć.'],
  run(){const p=me();
   p.n='Postępowcy';p.ab='PST';p.c='#5b2d85';p.logo='POST';p.postMode=1;
   p.act=cl(p.act+22);p.fame=cl(p.fame+8);M(p,12);
   say('<b>Będąc postępem warunkuje POSTĘP.</b> Smok idzie na sztandar, a nabór rusza z podwójną siłą.','roy')}},
 horyzont:{n:'Między nami horyzontami',for:['PPP','KK'],logo:'HMO',bots:0,
  what:'Scalasz monarchistów w jedno ugrupowanie z koroną w herbie. Potężne, ciężkie i wolno się obracające.',
  req:[
   {t:()=>G.me==='KK'?'Relacja z PPP co najmniej +30':'Relacja z KK co najmniej +30',
    v:()=>{const o=G.me==='KK'?'PPP':'KK';return Math.round(G.rel[G.me][o])+' / 30'},
    gone:()=>{const o=G.me==='KK'?'PPP':'KK';return !G.p[o]||G.p[o].dead},
    ok:()=>{const o=G.me==='KK'?'PPP':'KK';return !!G.p[o]&&!G.p[o].dead&&G.rel[G.me][o]>=30}},
   {t:'Co najmniej 60 osób w partii',v:()=>me().mem+' / 60',ok:()=>me().mem>=60},
   {t:'Przychylność Króla co najmniej 30',v:()=>Math.round(kingFav(G.me))+' / 30',ok:()=>kingFav(G.me)>=30},
   {t:'Co najmniej 250 kapitału',v:()=>Math.round(G.kp)+' / 250',ok:()=>G.kp>=250},
  ],
  cons:['Aktywność rośnie o 3,6 tygodniowo, partia w końcu żyje na wszystkich kanałach.',
   'Jedność rośnie o 2,2 tygodniowo, spory gasną same.',
   'Władza jest zbyt rozległa, żeby wszystkim zarządzać: jedna akcja mniej w każdym tygodniu.'],
  run(){const p=me();p.n='Horyzont Monarchistyczny';p.ab='HM';p.c='#c9a227';p.logo='HMO';p.horMode=1;
   p.act=cl(p.act+18);p.uni=cl(p.uni+14);M(p,12);
   const ofiary=['PPP','KK','ROM'].filter(k=>k!==G.me&&G.p[k]&&!G.p[k].dead);
   let os=0,mn=0;
   ofiary.forEach(k=>{const q=G.p[k];
     os+=q.mem;mn+=q.seats;
     p.comp.eli+=q.comp.eli;p.comp.int+=q.comp.int;p.comp.ser+=q.comp.ser;p.mem+=q.mem;
     p.seats+=q.seats;
     q.bench.forEach(n=>{if(!p.bench.includes(n)&&p.bench.length<12)p.bench.push(n)});
     if(!p.bench.includes(q.lead)&&p.bench.length<12)p.bench.push(q.lead);
     if(G.gov&&G.gov.parties.includes(k))govLeave(k);
     q.dead=1;q.mem=0;q.comp={eli:0,int:0,ser:0};q.seats=0;q.bench=[];
   });
   if(ofiary.length)say(`<b>Wchłonięcie.</b> ${ofiary.map(k=>G.p[k].ab).join(', ')} przestają istnieć: ${os} ${pl(os,'osoba','osoby','osób')} i ${mn} ${pl(mn,'mandat','mandaty','mandatów')} przechodzą pod koronę.`,'roy');
   G.apMax=apBase();G.ap=Math.min(G.ap,G.apMax);
   say('<b>Horyzont Monarchistyczny.</b> Korona wraca na herb, a razem z nią cała biurokracja, która się pod nią mieści.','roy')}},
 polska1612:{n:'Polska 1612',for:['ROM'],logo:'P1612',bots:0,
  what:'Ruch Obrony Monarchii przestaje być pustym szyldem po cargrzybovie i wraca do roku, w którym korona sięgnęła najdalej. Nowe pokolenie monarchistów bierze sprawy w swoje ręce.',
  req:[
   {t:'Co najmniej 40 osób w partii',v:()=>me().mem+' / 40',ok:()=>me().mem>=40},
   {t:'Co najmniej 15% poparcia w ostatnich wyborach parlamentarnych',
    v:()=>{const h=G.hist.length?fmt(G.hist[G.hist.length-1].pct):'0';return h+'% / 15%'},
    ok:()=>G.hist.length>0&&G.hist[G.hist.length-1].pct>=15},
  ],
  cons:['Partia występuje odtąd jako Polska 1612.',
   'Sława +16 i aktywność +12 od razu, korona wreszcie ma za kim stać.',
   'Jedność rośnie o 2 tygodniowo.',
   'Kontrowersja spada o 1 tygodniowo, powaga zamiast wygłupów cargrzybova uspokaja serwer.'],
  run(){const p=me();p.n='Polska 1612';p.ab='1612';p.c='#8c3b2a';p.logo='ROM';p.rom12Mode=1;
   p.fame=cl(p.fame+16);p.act=cl(p.act+12);M(p,12);
   say('<b>Polska 1612.</b> Ruch Obrony Monarchii zrzuca formalny szyld i wraca jako partia, która pamięta, gdzie sięgała korona.','roy')}},
};
function libBecome(k){
  const p=G.p[k];
  p.n='Partia Liberalna';p.ab='PL';p.c='#e8c72e';p.logo='LIB';p.libMode=1;
  p.pret=cl(p.pret-18);p.fame=cl(p.fame+12);p.cred=cl(p.cred+8);M(p,10);
}
function adsBecome(k){
  const p=G.p[k];
  p.n='Alternatywa dla Serwera';p.ab='AdS';p.c='#0090d4';p.logo='ADS';p.adsMode=1;
  p.uni=cl(p.uni-26);p.fame=cl(p.fame+24);M(p,10);
}
const IDENT_BRAND={
 repMode:{n:'Partia Republikańska',ab:'PR',c:'#1e63d0',logo:'REP'},
 demMode:{n:'Partia Demokratyczna',ab:'PD',c:'#7aa842',logo:'PD'},
 adsMode:{n:'Alternatywa dla Serwera',ab:'AdS',c:'#0090d4',logo:'ADS'},
 libMode:{n:'Partia Liberalna',ab:'PL',c:'#e8c72e',logo:'LIB'},
 lib2Mode:{n:'Alternatywa Liberalna',ab:'AL',c:'#c0392b',logo:'ALT'},
 robMode:{n:'Partia Kolektywnych Robotników',ab:'PKR',c:'#1d3f7a',logo:'PKR'},
 postMode:{n:'Postępowcy',ab:'PST',c:'#5b2d85',logo:'POST'},
 lsdMode:{n:'Lewicowy Sojusz Demokratyczny',ab:'LSD',c:'#8e1e5e',logo:'LSD'},
 horMode:{n:'Horyzont Monarchistyczny',ab:'HM',c:'#c9a227',logo:'HMO'},
 rom12Mode:{n:'Polska 1612',ab:'1612',c:'#8c3b2a',logo:'P1612'},
 cenMode:{n:'Partia Centrum',ab:'PC',c:'#1f7f86',logo:'CEN'},
 hegMode:{n:'Hegemonia Perspektywiczna',ab:'HP',c:'#c8952b',logo:'HEG'},
};
const myIdentities=()=>{const p=G&&G.p[G.me];return p?Object.keys(IDENT_BRAND).filter(m=>p[m]):[]};
function switchIdentity(mode){
  const b=IDENT_BRAND[mode],p=me();if(!b||!p[mode]||p.n===b.n)return;
  p.n=b.n;p.ab=b.ab;p.c=b.c;p.logo=b.logo;
  say(`<b>Zmiana szyldu.</b> Partia znowu występuje jako ${b.n}.`,'roy');render();
}
function myGoals(){if(!G)return [];
  return Object.keys(GOALS).filter(id=>{const g=GOALS[id];
    if(g.avail)return !!g.avail();                       // własny warunek dostępu jest rozstrzygający
    /* Republikę odbudowują wyłącznie partie republikańskie. Wcześniej wystarczyło
       mieć liberalny profil i cel otwierał się dosłownie każdemu, łącznie z FD. */
    if(!g.for.includes(G.me))return false;
    return true;
  })}
const reqOf=id=>(GOALS[id]?GOALS[id].req:[]).filter(r=>!(r.gone&&r.gone()));
function goalOk(id){const g=GOALS[id];const r=reqOf(id);return !!g&&r.length>0&&r.every(x=>x.ok())}
function goalReady(){return myGoals().some(id=>!goalDone(id)&&goalOk(id))}
function doGoal(id){
  if(!G.goals)G.goals={};
  if(!GOALS[id]||G.goals[id]||!myGoals().includes(id)||!goalOk(id))return;
  const nameBefore=me().n;
  G.goals[id]=1;GOALS[id].run();G.prest+=14;XP(30);applyGoals();
  const p=me(),g=GOALS[id],renamed=p.n!==nameBefore;
  render();
  SFX.goal();burst(['#d9ab45','#f7e3aa','#c9a227','#8c6d1f'],130,1);
  modal('Cel wypełniony',typeof g.n==='function'?g.n():g.n,
    `<p>${renamed?`Gratulacje, jesteś teraz <b style="color:${p.c}">${p.n}</b>.`:'Gratulacje, cel partyjny wypełniony.'}</p>`,
    [{l:'Wspaniale',s:'',f:close}]);
}
function aiGoals(){
  // boty potrafią AdS i Partię Liberalną, i tylko wtedy, gdy nie gramy żadną z partii z tej puli
  if(!GOALS.postep.for.includes(G.me))GOALS.postep.for.forEach(k=>{
    const p=G.p[k];if(!p||p.dead||p.postMode)return;
    const pool=[...new Set(p.main.concat(p.bench,[p.lead]))];
    if(p.mem<20||!['Sulejman','balon','Prawe Jąderko'].every(n=>pool.includes(n)))return;
    p.n='Postępowcy';p.ab='PST';p.c='#5b2d85';p.logo='POST';p.postMode=1;
    p.act=cl(p.act+22);p.fame=cl(p.fame+8);
    say(`<b>${p.n} (PST).</b> ${p.lead} przestawia partię na tryb werbunkowy i zmienia szyld.`,'roy');
  });
  if(!GOALS.liberal.for.includes(G.me))GOALS.liberal.for.forEach(k=>{
    const p=G.p[k];if(!p||p.dead||p.libMode)return;
    const pool=[...new Set(p.main.concat(p.bench,[p.lead]))];
    if(p.mem<30||!pool.includes('Aryati')||!p.bench.includes('Pan Hod_Dog'))return;
    libBecome(k);
    say(`<b>${p.n} (PL).</b> ${p.lead} wywiesza żółtą różę i zbiera wokół siebie liberalne skrzydło serwera.`,'roy');
  });
  // warunek dotyczy wyłącznie tego jednego celu, więc nie może przerywać całej funkcji
  if(!GOALS.ads.for.includes(G.me))GOALS.ads.for.forEach(k=>{
    const p=G.p[k];if(!p||p.dead||p.adsMode)return;
    const pool=[...new Set(p.main.concat(p.bench,[p.lead]))];
    if(p.mem<30||!['loof','Tortex','Kaziu'].every(n=>pool.includes(n)))return;
    if(!['loof','Tortex','Kaziu'].includes(p.lead))return;
    adsBecome(k);
    alive().forEach(x=>{if(x===k)return;G.rel[k][x]=cl(G.rel[k][x]-20,-100,100);G.rel[x][k]=cl(G.rel[x][k]-20,-100,100)});
    say(`<b>${p.n} (AdS).</b> ${p.lead} zebrał pod jednym szyldem wszystkich niezadowolonych. Nowa siła, z którą nikt nie chce rozmawiać.`,'bad');
  });

  /* Przemiany, które partie komputerowe też potrafią przeprowadzić.
     Celowo pomijamy te, które połykają inne ugrupowania — takie trzęsienie ziemi
     zostaje w rękach gracza, żeby serwer nie przewracał się sam z siebie. */
  aiPrzemiana('polska1612','ROM',p=>p.mem>=40&&G.term>=2,p=>{
    p.n='Polska 1612';p.ab='1612';p.c='#8c3b2a';p.logo='P1612';p.rom12Mode=1;
    p.fame=cl(p.fame+10);p.uni=cl(p.uni+8);
    return `<b>Polska 1612.</b> ${p.lead} wskrzesza rok, w którym korona sięgnęła najdalej.`;
  });
  aiPrzemiana('lsd','POJ',p=>p.mem>=26&&p.act>=55,p=>{
    p.n='Lewicowy Sojusz Demokratyczny';p.ab='LSD';p.c='#8e1e5e';p.logo='LSD';p.lsdMode=1;
    p.act=cl(p.act+14);p.fame=cl(p.fame+6);
    return `<b>Lewicowy Sojusz Demokratyczny.</b> ${p.lead} skleja lewe skrzydło serwera w jedno.`;
  });
}
/* Jedna przemiana partii sterowanej przez komputer: sprawdza warunek, zmienia szyld,
   ogłasza to serwerowi. Nie rusza partii, którą gra człowiek. */
function aiPrzemiana(id,kto,warunek,zmien){
  if(G.me===kto)return;                       // twoją partię przemieniasz sam
  const p=G.p[kto];
  if(!p||p.dead||G.goals&&G.goals[id])return;
  if(!warunek(p)||!ch(.10))return;            // rzadko, żeby nie działo się to co kadencję
  if(!G.goals)G.goals={};
  G.goals[id]=1;
  const opis=zmien(p);
  say(opis,'roy');
}
function goalCard(id){
  const g=GOALS[id],done=goalDone(id),all=goalOk(id);
  /* Wpis dziennika, a nie sama lista warunków: ile z nich jest odhaczonych
     i jak daleko do końca widać od razu w nagłówku, tak jak w dzienniku
     Victorii. Wcześniej trzeba było przelecieć wzrokiem wszystkie ptaszki. */
  const wym=reqOf(id), zrob=done?wym.length:wym.filter(r=>r.ok()).length;
  const proc=wym.length?Math.round(zrob/wym.length*100):0;
  return `<div class="card dziennik ${done?'zrobiony':all?'gotowy':''}" style="margin-bottom:14px">
    <div class="h"><h3>${typeof g.n==='function'?g.n():g.n}</h3>
    <span class="n">${done?'wypełniony':all?'gotowy':zrob+' z '+wym.length}</span></div><div class="b">
    <div class="dzpostep"><div class="trk"><i style="width:${proc}%"></i></div>
      <b>${done?'✓':proc+'%'}</b></div>
    <div style="display:flex;gap:18px;align-items:flex-start;flex-wrap:wrap;margin-bottom:14px">
      <img src="${LOGOS[g.logo]||''}" alt="" style="width:92px;height:92px;object-fit:contain;background:#f4f1ea;border-radius:var(--r2);padding:6px;flex:none;border:1px solid rgba(0,0,0,.3)">
      <div style="flex:1;min-width:220px">
        <p style="color:var(--dim);margin-bottom:8px">${g.what}</p>
        ${done?'<span class="pill pos">cel wypełniony</span>':all?'<span class="pill acc">wszystkie warunki spełnione</span>':'<span class="pill">warunki niespełnione</span>'}
        ${g.req.length>reqOf(id).length?'<div class="dim" style="font-size:12px;margin-top:6px">Jeden z warunków przestał obowiązywać: partia, której dotyczył, już nie istnieje.</div>':''}
      </div></div>
    ${reqOf(id).map(r=>{const o=r.ok();return `<div style="display:flex;justify-content:space-between;gap:12px;padding:8px 0;border-bottom:1px solid var(--line);font-size:13.5px">
      <span style="color:${o||done?'var(--tx)':'var(--dim)'}">${done||o?'✓':'✗'} ${typeof r.t==='function'?r.t():r.t}</span>
      <b class="m" style="color:${o||done?'var(--pos)':'var(--neg)'}">${done?'✓':r.v()}</b></div>`}).join('')}
    <h4 style="margin:16px 0 8px">Konsekwencje</h4>
    ${g.cons.map(c=>`<div style="padding:6px 0;border-bottom:1px solid var(--line);font-size:13.5px;color:var(--dim)">${c}</div>`).join('')}
    ${done?'':`<button class="btn" style="margin-top:16px" ${all?'':'disabled'} onclick="doGoal('${id}')">${all?'Wypełniam cel →':'Warunki jeszcze nie spełnione'}</button>`}
  </div></div>`;
}
const GENERIC_GOALS=['kanal','reka'];
function identSwitcher(){
  const ms=myIdentities();
  if(ms.length<2)return '';
  const p=me();
  return `<div class="card" style="margin-bottom:14px"><div class="h"><h3>Szyld partii</h3>
    <span class="n">masz ${ms.length} tożsamości</span></div><div class="b">
    <p class="dim" style="font-size:13px;margin-bottom:10px">Wypełniłeś więcej niż jeden cel, który zmienia nazwę partii. Zasady wszystkich zostają aktywne naraz, ale na zewnątrz widać tylko jeden szyld naraz, wybierz który.</p>
    <div style="display:flex;gap:9px;flex-wrap:wrap">
    ${ms.map(m=>{const b=IDENT_BRAND[m],on=p.n===b.n;
      return `<button class="opt" style="flex:1;min-width:190px;${on?'border-color:var(--acc)':''}" ${on?'disabled':''} onclick="switchIdentity('${m}')">
        <b>${on?'✓ ':''}${b.n}</b><span>${b.ab}</span></button>`}).join('')}
    </div></div></div>`;
}
function goalTab(){
  const ids=myGoals();
  if(!ids.length)return identSwitcher()+`<div class="card"><div class="h"><h3>Cele partyjne</h3></div><div class="b"><p class="dim">Twoja partia nie ma wytyczonego celu. Własne cele mają PPP, KK, PLR, PKD, DPD i Front Demokratyczny.</p></div></div>`;
  const transform=ids.filter(id=>!GENERIC_GOALS.includes(id));
  const generic=ids.filter(id=>GENERIC_GOALS.includes(id));
  return identSwitcher()
    +`<div class="note" style="margin:0 0 14px">Cel partyjny to jednorazowa przemiana: zmienia nazwę, logo i zasady, którymi gra twoja partia. ${transform.length>1?'Twoja partia ma do wyboru '+transform.length+' dróg.':''}</div>`
    +transform.map(goalCard).join('')
    +(generic.length?`<h4 style="margin:20px 0 10px">Ogólne, dostępne dla każdego</h4>`+generic.map(goalCard).join(''):'');
}

/* ---- sondaż / sejm / kronika ---- */
function pollTab(q,AL){
  const sh=Object.fromEntries(alive().map(k=>[k,shown(k,q.res[k].tot/q.total*100)]));
  const rows=alive().sort((a,b)=>sh[b]-sh[a]);   // kolejność zgodna z tym, co widać
  const mine=sh[G.me]||0, poprzedni=(G.prevShown&&G.prevShown[G.me]);
  const trend=poprzedni===undefined?0:mine-poprzedni;
  return `<div class="pollhero"><div><span class="eyebrow">LIVE · SERWEROWY POMIAR</span><h2>Sondaż tygodnia</h2><p>Poparcie miękkie, nastroje i zasięg mediów — wszystko w jednym odczycie.</p></div>
    <div class="pollheroStats"><div><b>${fmt(mine)}%</b><span>twoja partia</span></div><div><b class="${trend>=0?'up':'down'}">${trend>0?'+':''}${fmt(trend)}</b><span>trend od ostatniego</span></div><div><b>${alive().length}</b><span>aktywnych partii</span></div></div></div>`+histChart()+`<div class="card" style="margin-top:14px"><div class="h"><h3>Sondaż, kadencja ${G.term}, tydzień ${G.week}</h3>
    <span class="n">progi ${THR.base}% / ${THR.base+3}% / ${THR.base+8}%</span></div><div class="b">
    <div class="note" style="margin:0 0 14px">Sondaż to badanie, nie wynik, pojedyncza pozycja bywa przestrzelona
    nawet o <b>sześć punktów</b> w jedną albo drugą stronę. Mandaty obok liczone są z prawdziwego poparcia, którego nie widzisz.
    Nastroje serwera: ${SEG.map(s=>`<b style="color:${s.c}">${s.n} ${G.mood[s.id]>1.06?'↑':G.mood[s.id]<.94?'↓':'→'}</b>`).join(' · ')}</div>
    <table class="t"><thead><tr><th>Partia</th><th>Lider</th><th>Blok</th><th class="r">Trend</th><th class="r">Sondaż</th>
      <th class="r">Mand.</th><th class="r">Osób</th></tr></thead><tbody>
    ${rows.map(k=>{const v=q.res[k].tot,pc=sh[k],s=AL.out[k],pv=(G.prevShown||{})[k],tr=pv===undefined?0:pc-pv;
      return `<tr class="${k===G.me?'me':''}"><td><div class="nm">${crest(k,'s')}<span>${G.p[k].n}</span></div></td>
      <td><div class="nm">${leadAva(k,24)}<span class="dim">${leadName(k)}</span></div></td>
      <td>${(()=>{const bl=blocOf(k),co=G.p[k].coal&&CO()[G.p[k].coal];
        const s=bl?bl.short:(co?G.p[k].coal:null), c=bl?bl.color:(co?co.c:null);
        return s?`<span class="blocpill" style="background:${c}22;color:${c};border:1px solid ${c}55">${s}</span>`:'<span class="dim">,</span>'})()}</td>
      <td class="r m" style="color:${Math.abs(tr)<.25?'var(--dim2)':tr>0?'var(--pos)':'var(--neg)'}">${
        Math.abs(tr)<.25?'→':(tr>0?'▲ '+fmt(Math.abs(tr)):'▼ '+fmt(Math.abs(tr)))}</td>
      <td class="r m" style="color:${s?'var(--tx)':'var(--dim2)'}">${fmt(pc)}%</td>
      <td class="r m"><b>${s}</b></td><td class="r m dim">${G.p[k].mem}</td></tr>`}).join('')}
    </tbody></table>
    ${G.hist.length?`<h4 style="margin:20px 0 10px">Twoja historia</h4>
    <div class="nightbox">
      ${G.hist.slice().reverse().map((h,ridx)=>{
        const i=G.hist.length-1-ridx, prev=i>0?G.hist[i-1]:null;
        const dSeat=prev?h.seats[G.me]-(prev.seats[G.me]||0):null;
        const maxPct=Math.max(...G.hist.map(x=>x.pct),1);
        return `<div class="nrow ${ridx===0?'me':''}">
          <div class="npos">K${h.term}</div>
          <div class="ncrest">${crest(G.me,'s')}</div>
          <div class="nname"><b>${h.mem} ${pl(h.mem,'osoba','osoby','osób')}</b><span>${h.pm===G.me?'premier tej kadencji':`łącznie ${h.goals||0} ${pl(h.goals||0,'cel','cele','celów')}`}</span></div>
          <div class="ntrk"><i style="width:${(h.pct/maxPct*100).toFixed(1)}%;background:${me().c}"></i></div>
          <div class="npct">${fmt(h.pct)}%</div>
          <div class="nseat">${h.seats[G.me]}<em>${pl(h.seats[G.me],'mandat','mandaty','mandatów')}</em>
            ${dSeat!==null&&dSeat!==0?`<u class="${dSeat>0?'up':'dn'}">${dSeat>0?'+':''}${dSeat}</u>`:''}</div>
        </div>`}).join('')}
    </div>`:''}
  </div></div>`;
}
/* Skład rady ministrów widzi cały serwer, nie tylko premier — bez tego nie dało się
   sprawdzić, kto właściwie siedzi w rządzie i czyja partia na tym zarabia. */
function radaPodglad(){
  radaInit();
  if(!G.gov)return '';
  const obsadzone=RESORTY.filter(r=>radaKto(r.id)).length;
  const mojeResorty=RESORTY.filter(r=>{const n=radaKto(r.id);return n&&partiaOsoby(n)===G.me}).length;
  return `<div class="card rel"><div class="h"><h3>Rada ministrów</h3>
    <span class="n">${obsadzone} z ${RESORTY.length}${mojeResorty?` · ${mojeResorty} twoich`:''}</span></div><div class="b">
    <div class="minlist">${RESORTY.map(r=>{
    const kto=radaKto(r.id), kPart=kto?partiaOsoby(kto):null, moj=kPart===G.me;
      const canAsk=!isPM()&&G.gov.parties.includes(G.me)&&!kto;
      return `<div class="minrow2 ${moj?'moj':''} ${canAsk?'resortrequest':''}" ${canAsk?`onclick="openResort('${r.id}')" title="Porozmawiaj z premierem o tym resorcie"`:''}>
        <span class="mres">${r.n}</span>
        ${kto?`<span class="mkto">${ava(kto,kPart?G.p[kPart].c:'#666',22)}<b>${kto}</b>
            <span class="dim">${kPart?G.p[kPart].ab:'bezpartyjny'}</span></span>`
          :`<span class="mkto dim">wakat${canAsk?'<small>porozmawiaj z premierem ›</small>':''}</span>`}
      </div>`}).join('')}</div>
    <div class="note" style="margin:12px 0 0">Minister pracuje na konto swojej partii: co tydzień dokłada jej
    sławy i aktywności, a przy ustawach ze swojego resortu liczy się tak jak premier.
    ${mojeResorty?`Masz <b>${mojeResorty}</b> ${pl(mojeResorty,'resort','resorty','resortów')}.`:'Nie masz żadnego resortu.'}</div>
  </div></div>`;
}
/* Ustawy widziane oczami zwykłego posła: co jest w mocy, kto to przepchnął
   i co ty sam możesz złożyć z resortu, który trzyma twoja partia. */
function ustawyPodglad(){
  lawsInit();radaInit();
  const moje=mojeResorty();
  const doZlozenia=LAWS.filter(l=>mogeZglosic(l.id)&&!G.lawTerm[l.id]&&!G.lawPend&&(!lawDone(l.id)||lawEdytowalna(l.id)));
  const wMocy=LAWS.filter(l=>lawDone(l.id));
  // karta stoi zawsze — bez niej nie było wiadomo, że ustawy w ogóle istnieją
  // ani po co brać ministerstwo
  const nazwaResortu=id=>(RESORTY.find(r=>r.id===id)||{}).n||'—';
  return `<div class="card kond"><div class="h"><h3>Ustawy</h3>
    <span class="n">${wMocy.length} z ${LAWS.length} w mocy</span></div><div class="b">
    ${G.lawPend?`<div class="spentbar" style="margin-bottom:13px"><b>${lawById(G.lawPend.id).n}</b> czeka na podpis prezydenta.
      Sejm: za ${G.lawPend.za}, przeciw ${G.lawPend.przeciw}. Dopóki nie zapadnie decyzja, nikt nie złoży kolejnej.</div>`:''}
    ${moje.length?`<div class="note" style="margin:0 0 12px">Twoja partia trzyma
      ${moje.map(nazwaResortu).map(n=>`<b>${n}</b>`).join(', ')}, więc możesz składać ustawy z ${pl(moje.length,'tego resortu','tych resortów','tych resortów')}
      nawet nie będąc premierem. Ustawa przepchnięta przez ciebie pracuje przede wszystkim na twoją partię.</div>`:''}
    ${doZlozenia.length?`<div class="lawmini">${doZlozenia.map(l=>`
      <button class="lawm" onclick="startLaw('${l.id}')">
        <span class="lmn">${l.n}</span>
        <span class="lmr">${l.resort?nazwaResortu(l.resort):'ustrojowa'}${isPM()&&!moje.includes(l.resort)?' · z urzędu premiera':''}</span>
        <span class="lmgo">złóż →</span>
      </button>`).join('')}</div>`
      :`<div class="dim" style="font-size:12.5px">${G.lawPend?'Najpierw musi zapaść decyzja prezydenta.'
        :moje.length?'Z twoich resortów nie ma teraz czego składać — wszystko albo w mocy, albo próbowane w tej kadencji.'
        :'Bez resortu ani fotela premiera nie masz z czym wyjść na mównicę. Weź ministerstwo.'}</div>`}
    ${wMocy.length?`<div class="lawheld">${wMocy.map(l=>{
      const autor=G.lawBy&&G.lawBy[l.id], moja=autor===G.me;
      return `<div class="lh ${moja?'moja':''}"><span>${l.n}</span>
        <b>${autor&&G.p[autor]?G.p[autor].ab:'—'}</b></div>`}).join('')}</div>
      <div class="dim" style="font-size:11.5px;margin-top:8px">Po prawej partia, która ustawę przepchnęła — to ona zbiera z niej najwięcej.</div>`:''}
  </div></div>`;
}
function sejmTab(){
  const arr=[];alive().sort((a,b)=>G.p[b].seats-G.p[a].seats).forEach(k=>{for(let i=0;i<G.p[k].seats;i++)arr.push(k)});
  const g=G.gov;
  return `<div class="card"><div class="h"><h3>Sejm, kadencja ${G.term}</h3>
    <span class="n">${alive().filter(k=>G.p[k].seats>0).length} klubów parlamentarnych</span></div><div class="b">
    ${(()=>{const m=G.hemiMode||'party';
      const ord=allBlocs().map(b=>b.short);
      const arrS=m==='bloc'?arr.slice().sort((a,b)=>{
        const ba=blocOf(a),bb=blocOf(b);
        const ra=ba?ord.indexOf(ba.short):99, rb=bb?ord.indexOf(bb.short):99;
        return ra-rb||G.p[b].seats-G.p[a].seats;}):arr;
      const grupy = m==='bloc'
        ? allBlocs().map(b=>({n:b.short+' · '+b.name,c:b.color,
            s:b.parties.reduce((x,k)=>x+G.p[k].seats,0)})).filter(x=>x.s>0)
          .concat((()=>{const rest=alive().filter(k=>G.p[k].seats>0&&!blocOf(k));
            return rest.length?[{n:'Niezrzeszeni',c:'#75695b',s:rest.reduce((x,k)=>x+G.p[k].seats,0)}]:[]})())
        : alive().filter(k=>G.p[k].seats>0).sort((a,b)=>G.p[b].seats-G.p[a].seats)
            .map(k=>({n:G.p[k].ab,c:G.p[k].c,s:G.p[k].seats,me:k===G.me,k}));
      return `<div class="sejm-sala">${true?`<div class="hemi-filtry">
        <button class="hfil ${m==='party'?'on':''}" onclick="setHemi('party')">Podział partyjny</button>
        <button class="hfil ${m==='bloc'?'on':''}" onclick="setHemi('bloc')">Podział koalicyjny</button></div>`:''}
      <div class="hemi-scena">${hemi(arrS,720,m)}</div>
      <div class="sejmleg">
        ${grupy.map(g2=>{
          const wRzadzie=g2.k&&G.gov&&G.gov.parties.includes(g2.k);
          return `<span class="sl ${g2.me?'ja':''} ${wRzadzie?'rzad':''}" style="--pc:${g2.c}">
            ${g2.k?crest(g2.k,'xs'):`<i style="background:${g2.c}"></i>`}
            <b>${g2.n}</b><em>${g2.s}</em></span>`}).join('')}
      </div></div>`})()}
    <div class="wladza">
      ${(()=>{const g2=G.gov,sp=G.sejmPrez;
        const card=(lab,who,party,extra,col,cls)=>`<div class="wcard ${cls||''}" style="--wc:${col}">
          <div class="wlab">${lab}</div>
          <div class="wbody">${who&&party?ava(who,G.p[party].c,44):''}
            <div style="flex:1;min-width:0">
              <b>${who||'wakat'}</b>
              <span>${party?G.p[party].n:'urząd nieobsadzony'}</span>
              ${extra?`<div class="wex">${extra}</div>`:''}</div>
            ${party?crest(party,'m'):''}</div></div>`;
        return `
        ${g2?card('Premier', G.pmOk?(g2.pmLead||G.p[g2.pm].lead):null, g2.pm,
          `koalicja ${g2.parties.reduce((a,k)=>a+G.p[k].seats,0)} z ${TOTAL_SEATS} mandatów${g2.minority?', rząd mniejszościowy':''}`,
          '#d1a13a', isPM()?'mine':''):card('Premier',null,null,'Bezkrólewie, serwer działa bez gabinetu','#c04a3e')}
        ${G.prez?card('Prezydent serwera', G.prez.lead, G.prez.party,
          `mandat do kadencji ${G.prez.until}`, '#9b7fb8', hasPrez()?'mine':''):''}
        ${sp&&sp.marszalek?card('Marszałek Sejmu', G.p[sp.marszalek].lead, sp.marszalek,
          sp.wice.length?`wicemarszałkowie: ${sp.wice.map(k=>G.p[k].lead+' ('+G.p[k].ab+')').join(', ')}`:'brak wicemarszałków',
          '#5a8bb0', isMar()?'mine':''):''}
        ${opoCard()}
        ${(()=>{
          /* Sejm nie może być ścianą niemal identycznych kart. Zostają układy,
             które rządzą, stoją naprzeciw albo dotyczą gracza; reszta jest skrótem. */
          const aktywne=allBlocs().filter(b=>b.parties.some(k=>G.p[k].seats>0)&&!(b===G.opoBloc&&!inGov()&&me().seats));
          const pierwsze=aktywne.filter(b=>b===G.bloc||b===G.opoBloc||b.parties.includes(G.me));
          const reszta=aktywne.filter(b=>!pierwsze.includes(b));
          const karta=b=>`
          <div class="wcard" style="--wc:${b.color}">
            <div class="wlab">${b===G.bloc?'Blok rządowy':b===G.opoBloc?'Blok opozycyjny':'Lista wyborcza'} · ${b.short}</div>
            <div class="wbody"><div style="flex:1;min-width:0">
              <b>${b.name}</b>
              <span>${b.parties.map(k=>G.p[k].ab).join(' · ')}, ${b.parties.reduce((a,k)=>a+G.p[k].seats,0)} mandatów</span></div>
              ${b.parties.includes(G.me)&&b.parties.length>1?`<button class="btn g sm" onclick="renameBloc('${b===G.opoBloc?'opo':b===G.bloc?'gov':b.short}')">Nazwij</button>`:''}
            </div></div>`;
          return pierwsze.map(karta).join('')+(reszta.length?`<div class="wcard wcard-zbiorczy">
            <div class="wlab">Pozostałe listy · ${reszta.length}</div>
            <div class="wbody"><div><b>${reszta.map(b=>b.short).join(' · ')}</b>
              <span>${reszta.reduce((s,b)=>s+b.parties.reduce((a,k)=>a+G.p[k].seats,0),0)} mandatów poza głównymi układami</span></div></div>
          </div>`:'');
        })()}
      `})()}
    </div>
    <div class="sejmgrid">
    ${G.gov?`<div class="card"><div class="h"><h3>Gabinet</h3>
      <span class="n">${G.gov.parties.length} ${pl(G.gov.parties.length,'partia','partie','partii')}</span></div><div class="b">
      <div class="gauge" style="margin-bottom:13px"><i style="width:${G.gov.appr}%;background:linear-gradient(90deg,${
        G.gov.appr>58?'#5f8a4c,var(--pos)':G.gov.appr<42?'#8f3830,var(--neg)':'#a37f2c,var(--acc)'})"></i>
        <span>poparcie rządu ${Math.round(G.gov.appr)} / 100</span></div>
      ${G.gov.parties.map(k=>`<div class="minrow" ${k===G.me?'style="background:rgba(209,161,58,.08);margin:0 -6px;padding:7px 6px"':''}>
        ${crest(k,'s')}${leadAva(k,24)}
        <span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
          <b>${G.p[k].ab}</b> <span class="dim">${leadName(k)}</span></span>
        <span class="m dim" style="font-size:12px">${G.p[k].seats} mand.</span>
        <span class="dots" title="${resortyPartii(k)} z ${RESORTY.length} resortów">${[...Array(RESORTY.length)].map((_,i)=>
          `<i class="${i<resortyPartii(k)?'':'off'}"></i>`).join('')}</span></div>`).join('')}
    </div></div>`:''}
    ${radaPodglad()}
    ${ustawyPodglad()}
    </div>
    <table class="t"><thead><tr><th>Partia</th><th>Lider</th><th class="r">Mandaty</th><th>Status</th><th class="r">Relacja</th></tr></thead><tbody>
    ${alive().sort((a,b)=>G.p[b].seats-G.p[a].seats).map(k=>{const v=k===G.me?null:Math.round(G.rel[G.me][k]);
      return `<tr class="${k===G.me?'me':''}"><td><div class="nm">${crest(k,'s')}<span>${G.p[k].n}</span></div></td>
      <td><div class="nm">${leadAva(k,24)}<span class="dim">${leadName(k)}</span></div></td>
      <td class="r m"><b>${G.p[k].seats}</b></td>
      <td>${g&&g.parties.includes(k)?`<span class="pill pos">${g.pm===k?'premier':'koalicja'}</span>`
        :G.p[k].seats?'<span class="pill">opozycja</span>':'<span class="pill neg">poza sejmem</span>'}
        ${G.prez&&G.prez.party===k?'<span class="pill roy">prezydent</span>':''}</td>
      <td class="r m" style="color:${v===null?'var(--dim2)':v<0?'var(--neg)':v>30?'var(--pos)':'var(--dim)'}">${v===null?',':(v>0?'+':'')+v}</td></tr>`}).join('')}
    </tbody></table></div></div>`;
}
function feed(n){
  /* Kronika ma dawać ostatni puls kadencji, a nie drugi, ciasny ekran z własnym
     paskiem przewijania. Pełna historia dalej jest w zakładce Kronika. */
  const ile=n||5;
  return `<details class="card kronika sidefold" ${sideAttr('kronika')}><summary><h3>Kronika</h3><span class="n">K${G.term}·T${G.week}</span></summary>
  <div class="b log">${G.log.slice(0,ile).map(l=>
    `<div class="e ${l.c}" style="font-size:12.5px;padding:8px 0"><span class="w">${l.w}</span>${l.t}</div>`).join('')
    ||'<span class="dim">Cisza. Zrób coś, a serwer zacznie gadać.</span>'}
    ${!n&&G.log.length>ile?`<div class="kronika-stopka">Starsze wpisy są w zakładce Kronika.</div>`:''}</div></details>`;
}

function leadTab(){
  const p=me(),ld=lead(G.me),sf=sizeF(p);
  const kto=leadWybrany(), ls=leads(p), wielu=ls.length>1;
  const STAT=[['char','Charyzma','sława, rekrutacja, wynik prezydencki'],
    ['komp','Kompetencja','wiarygodność, debaty, ryzyko gafy'],
    ['wytrz','Wytrzymałość','regeneracja energii co tydzień']];
  const cost=v=>v>=95?60:v>=88?40:v>=80?28:v>=62?18:12;
  return `<div class="card"><div class="h"><h3>${leads(p).join(' i ')}, rozwój</h3>
    <span class="n">doświadczenie ${wielu?esc(kto):''}: <b style="color:var(--acc)">${Math.floor(xpOs(kto))}</b></span></div><div class="b">
    <div class="leadbox" style="margin-bottom:16px">${leads(p).length>1?leadAva(G.me,50):ava(p.lead,p.c,58)}<div style="min-width:0">
      <b style="font-size:17px">${leads(p).join(' / ')}</b>
      <div class="dim" style="font-size:12.5px">${leads(p).length>1?'współprzewodniczący':'przewodniczący'} ${p.ab} · średnia ${Math.round(ld.avg)}${isPM()?' · <span style="color:var(--acc)">premier</span>':''}${hasPrez()?' · <span style="color:var(--roy)">prezydent</span>':''}</div></div></div>
    ${innAll(G.me).map(t=>`<div class="innate"><div class="lab">Cecha wrodzona</div>
      <h4>${t.n}</h4><p>${t.d}</p>
      <p style="margin-top:7px;font-size:12.5px;opacity:.62">Nie da się jej wykupić ani usunąć.</p></div>`).join('')}
    <p class="dim" style="font-size:13px">Doświadczenie zdobywasz za wygrane debaty, udane afery, wybory,
    fotel premiera i prezydenturę. Zbiera je <b>ten, kto akurat przewodzi</b>, i zostaje przy nim na zawsze —
    oddasz stery komu innemu, a dorobek zostanie przy poprzedniku i wróci razem z nim.</p>
    ${wielu?`<div class="sterlab" style="margin-top:18px">Kogo rozwijasz</div>
      <div class="ktorego">${ls.map(n=>{const x=L(n);
        return `<button class="${n===kto?'on':''}" onclick="setLeadSel('${esc(n)}')">
          ${ava(n,p.c,26)}<span><b>${n}</b><em>śr. ${Math.round(x.avg)}</em></span></button>`}).join('')}</div>
      <div class="note" style="margin:0 0 12px">Każdy ma własne doświadczenie i wydaje wyłącznie swoje —
      przy dwóch przewodniczących to, co zarobicie, dzieli się między was po połowie.
      Cecha kupiona komukolwiek ze sterów działa na całą partię, tyle że za każdą płacisz osobno.
      ${ls.filter(n=>n!==kto).map(n=>`${esc(n)}: ${Math.floor(xpOs(n))}`).join(' · ')}</div>`:''}
    <h4 style="margin:18px 0 6px">Cechy charakteru <span class="dim" style="font-weight:400;font-size:12.5px">, ${kto} i tylko ${kto}</span></h4>
    <div class="note" style="margin:0 0 11px">Wykupione cechy i wytrenowane statystyki zapisują się <b>osobie</b>, nie partii.
    Jeśli oddasz przewodnictwo komuś innemu, wszystko zostaje przy ${p.lead} i wróci razem z nim.
    ${(()=>{const inni=[...new Set(p.bench.concat(p.main))].filter(n=>n!==p.lead&&traitsOf(n).length);
      return inni.length?'W zapleczu cechy mają też: '+inni.map(n=>n+' ('+traitsOf(n).map(x=>TRAITS.find(y=>y.id===x).n).join(', ')+')').join(' · ')+'.':''})()}</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:9px">
    ${TRAITS.map(t=>{const has=traitsOf(kto).includes(t.id),can=xpOs(kto)>=t.cost,cf=conflictOf(t,kto);
      return `<button class="act" ${has||!can||cf?'disabled':''} onclick="buyTrait('${t.id}')"
        style="${has?'border-color:var(--pos);opacity:1':''}">
        <h4 style="color:${has?'var(--pos)':cf?'var(--dim2)':'var(--tx)'}">${has?'✓ ':''}${t.n}</h4>
        <div class="dd">${t.d}</div>
        <div class="c">${has?'<span class="yes">wykupione</span>'
          :cf?`<span class="no">wyklucza się z: ${cf.n}</span>`
          :`<span class="${can?'':'no'}">${t.cost} dośw.</span>`}
          ${!has&&!cf&&t.excl?`<span class="dim">≠ ${t.excl.map(x=>TRAITS.find(y=>y.id===x).n).join(', ')}</span>`:''}</div>
      </button>`}).join('')}</div>
    <h4 style="margin:20px 0 10px">Statystyki${wielu?` <span class="dim" style="font-size:12px;font-weight:400">, ${kto}; partia liczy średnią całych sterów</span>`:''}</h4>
    ${STAT.map(([id,n,d],i)=>{const v=L(kto)[id],c=cost(v);
      return `<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
        <div style="flex:1;min-width:0">
          <div style="display:flex;justify-content:space-between;font-size:13.5px;margin-bottom:4px">
            <span>${n} <span class="dim" style="font-size:12px">, ${d}</span></span><b class="m">${v}</b></div>
          <div class="trk"><i style="width:${v}%;background:${['var(--acc)','var(--info)','#9b7fd4'][i]}"></i></div></div>
        <button class="btn ${xpOs(kto)>=c&&v<99?'':'g'} sm" ${xpOs(kto)>=c&&v<99?'':'disabled'}
          onclick="buyStat(${i})" style="white-space:nowrap">+1 za ${c}</button></div>`}).join('')}
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;opacity:.7">
      <div style="flex:1;min-width:0">
        <div style="display:flex;justify-content:space-between;font-size:13.5px;margin-bottom:4px">
          <span>Autorytet <span class="dim" style="font-size:12px">, jedność partii</span></span><b class="m">${ld.autor}</b></div>
        <div class="trk"><i style="width:${ld.autor}%;background:var(--pos)"></i></div></div>
      <span class="dim" style="font-size:12px;white-space:nowrap">tylko debaty i wybory</span></div>
    <div class="note">Poniżej 62 punkt kosztuje 12 doświadczenia, powyżej 88 już 40, powyżej 95, 60. Sufit to 99. Autorytetu nie da się kupić ani wytrenować, rośnie wyłącznie po wygranych debatach, objęciu fotela premiera i wygranej prezydenturze.</div>
    <h4 style="margin:20px 0 10px">Wielkość partii</h4>
    <div class="judge">${p.mem} ${pl(p.mem,'osoba','osoby','osób')}${sf.lab?`, <b style="color:${p.mem<26?'var(--pos)':'var(--neg)'}">${sf.lab}</b>`:''}:
      decyzje kosztują <b>${Math.round(sf.kp*100)}%</b> kapitału, dają <b>${Math.round(sf.fame*100)}%</b> sławy
      i zużywają <b>${Math.round(sf.en*100)}%</b> energii.
      ${p.mem<15?'Mała partia rusza się szybciej i taniej niż giganci, to twoja główna przewaga.'
        :p.mem>46?'Duża partia grzęźnie we własnej strukturze. Za to dostajesz znacznie więcej kapitału co tydzień.'
        :'Średnia wielkość: bez premii i bez kary.'}</div>
  </div></div>`;
}
function conflictOf(t,who){
  if(!t.excl)return null;
  // sprzeczność liczy się w obrębie jednej osoby: dwaj przewodniczący mogą mieć
  // cechy, które u jednego by się wykluczały
  const maja=traitsOf(who||leadWybrany());
  const c=t.excl.find(x=>maja.indexOf(x)>=0);
  return c?TRAITS.find(x=>x.id===c):null;
}
function buyTrait(id){
  const t=TRAITS.find(x=>x.id===id),who=leadWybrany();
  if(!t||!who||traitsOf(who).includes(id)||xpOs(who)<t.cost||conflictOf(t,who))return;
  if(!G.ptraits)G.ptraits={};
  if(!G.ptraits[who])G.ptraits[who]=[];
  xpPula()[who]-=t.cost;G.ptraits[who].push(id);
  say(`<b>${who}</b> rozwija cechę: <b>${t.n}</b>. Zostaje przy nim na stałe, także gdy odda przewodnictwo.`,'good');render();
}
function buyStat(i){
  const who=leadWybrany(),key=['char','komp','wytrz'][i],v=L(who)[key];
  const c=v>=95?60:v>=88?40:v>=80?28:v>=62?18:12;
  if(xpOs(who)<c||v>=99)return;
  xpPula()[who]-=c;if(!G.lup[who])G.lup[who]=[0,0,0,0];G.lup[who][i]+=1;render();
}

function kingTab(){
  const f=kingFactors();
  const rank=alive().filter(k=>G.p[k].seats>0).map(k=>({k,s:kingScore(k)})).sort((a,b)=>b.s-a.s);
  const moje=rank.findIndex(x=>x.k===G.me);
  const fav=kingFav(G.me);
  const medal=i=>i===0?'#d9ab45':i===1?'#c7c7cf':i===2?'#c98a52':null;
  const maxAbs=Math.max(2,...f.map(x=>Math.abs(x.w)));
  return `
  <div class="royalhero"><div><span class="eyebrow">DWÓR MORDY MORDECZKI</span><h2>Król i desygnacja</h2><p>Nie wystarczy mieć rację. Trzeba jeszcze dostać zgodę na wejście do gry.</p></div><div class="royalbadge"><span>twoja przychylność</span><b>${fav>0?'+':''}${Math.round(fav)}</b></div></div>
  <div class="card kroyal"><div class="b">
    <div class="crown">
      <div class="ofc">
        ${ava(KING,'#9b7fb8',60)}
        <div class="who" style="flex:1;min-width:0">
          <div class="lab">Monarcha serwera</div><b>${KING}</b>
          <span>To on zezwala sejmowi głosować nad konkretnym kandydatem na premiera. Bez jego zgody nie ma głosowania.</span></div>
        <span class="pill ${fav>=18?'pos':fav<0?'neg':'roy'}" style="font-size:15px;padding:7px 14px">${fav>0?'+':''}${Math.round(fav)}</span></div>
      <div class="kgaugewrap">
        <div class="kgauge">
          <div class="kzone bad" style="width:50%"></div>
          <div class="kzone mid" style="width:11%"></div>
          <div class="kzone good" style="width:39%"></div>
          <div class="kneedle" style="left:${cl(50+fav*0.62,2,98)}%"></div>
        </div>
        <div class="kgaugelab"><span>wygnaniec</span><span>obojętny</span><span>ulubieniec</span></div>
      </div>
      ${fav<0?`<div style="margin-top:13px;font-size:12.5px;color:#f0a0a0">
        <b>Uwaga.</b> Przy tej przychylności Mordeczka nie pozwoli sejmowi głosować nad twoim kandydatem. Zbij kontrowersję, podnieś aktywność albo sięgnij do skarbca.</div>`:''}
    </div>
  </div></div>
  <div class="card"><div class="h"><h3>Skarbiec</h3><span class="n">masz ${Math.round(G.kp)} kapitału</span></div><div class="b">
    <p class="dim" style="font-size:13px;margin-bottom:10px">Kapitał przekazany Królowi liczy się wprost do desygnacji ,
      jeden punkt za każde ${DANINA_ZA_PUNKT} monet. Dotychczas przekazałeś <b style="color:var(--acc)">${G.king.paid}</b>,
      co daje <b style="color:var(--acc)">+${(G.king.paid/DANINA_ZA_PUNKT).toFixed(1)}</b> punktu.</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      ${[140,320,650,1200].map(v=>`<button class="btn ${G.kp>=v?'':'g'}" ${G.kp>=v?'':'disabled'}
        style="flex:1;min-width:120px;padding:11px 8px" onclick="danina(${v})">
        ${v} kapitału<br><span style="font-size:11px;opacity:.75">+${(v/DANINA_ZA_PUNKT).toFixed(1)} punktu</span></button>`).join('')}
    </div>
  </div></div>
  <div class="card"><div class="h"><h3>Co liczy się u Króla</h3><span class="n">7 czynników</span></div><div class="b">
    ${f.map(x=>{const pos=x.w>=0,pct=cl(Math.abs(x.w)/maxAbs*50,1,50);
      return `<div class="kfrow">
      <div class="kfhead"><span>${x.n} <i>${x.d}</i></span><b style="color:${pos?'var(--pos)':'var(--neg)'}">${pos?'+':''}${x.w.toFixed(1)}</b></div>
      <div class="kftrack"><div class="kfmid"></div>
        <div class="kffill ${pos?'pos':'neg'}" style="width:${pct}%"></div></div>
    </div>`}).join('')}
    <div class="note" style="margin-top:4px">Punktacja decyduje, komu Król pozwoli stanąć przed sejmem. Jesteś obecnie
      <b style="color:var(--tx)">${moje>=0?moje+1:','}</b> ${moje===0?', desygnacja jest twoja':`z ${rank.length}, a przed tobą ${rank.slice(0,moje).map(x=>G.p[x.k].ab).join(', ')||'nikt'}`}.
      Sama sympatia nie wystarczy: bez mandatów punktacja i tak będzie niska.</div>
  </div></div>
  <div class="card"><div class="h"><h3>Ranking dworski</h3><span class="n">${rank.length} ${pl(rank.length,'partia','partie','partii')} z mandatami</span></div><div class="b">
    ${rank.map((x,i)=>`<div class="minrow" ${x.k===G.me?'style="background:rgba(155,127,184,.12);margin:0 -6px;padding:7px 6px"':''}>
      <span class="m dim krank" style="${medal(i)?'color:'+medal(i)+';font-weight:700':''}">${i+1}.</span>${crest(x.k,'s')}
      <span style="flex:1"><b>${G.p[x.k].ab}</b> <span class="dim">${leadName(x.k)} · ${G.p[x.k].seats} mand.</span></span>
      <b class="m" style="width:44px;text-align:right;color:${x.k===G.me?'var(--acc)':x.s<0?'var(--neg)':'var(--dim)'}">${x.s>0?'+':''}${Math.round(x.s)}</b></div>`).join('')}
  </div></div>`;
}

/* ---- modal ---- */
/* Okno, które samo się przerysowuje przy każdym kliknięciu (suwaki, listy wyboru).
   Gdy to wciąż to samo okno, podmieniamy tylko środek — inaczej całość znika
   i wjeżdża od nowa, co przy klikaniu +/− wygląda jak miganie. */
function rysujOkno(nazwa,srodek){
  if(PROBA)return null;               // to samo, co w modal(): podgląd niczego nie otwiera
  const stary=document.getElementById('veil');
  if(stary&&stary.dataset.okno===nazwa){
    const mdl=stary.querySelector('.mdl');
    if(mdl){mdl.innerHTML=srodek;return stary}
  }
  close();
  const v=document.createElement('div');v.className='veil';v.id='veil';
  v.dataset.okno=nazwa;
  v.innerHTML=`<div class="mdl">${srodek}</div>`;
  document.body.appendChild(v);
  return v;
}
function modal(k,t,b,o,onX){
  /* Podgląd skutków odpala prawdziwą decyzję dziewięć razy na kopii stanu.
     Decyzje takie jak nabór, wywiad czy szkolenie nie liczą niczego same —
     otwierają własne okno. Bez tej blokady podgląd naprawdę je otwierał,
     więc okna wyskakiwały same z siebie, a że pamięć podglądu kasuje się co
     tydzień, sypało nimi na starcie każdego tygodnia. */
  if(PROBA)return;
  SFX.modal();
  close();
  const v=document.createElement('div');v.className='veil';v.id='veil';
  v.innerHTML=`<div class="mdl" role="dialog" aria-modal="true">
    ${onX?'<button class="mdlx" type="button" aria-label="Zamknij">×</button>':''}
    <div class="h"><div class="k">${k}</div><h2>${t}</h2></div>
    <div class="bd">${b}</div>
    <div class="op">${o.map((x,i)=>`<button class="opt" data-i="${i}" ${x.dis?'disabled':''}><b>${x.l}</b><span>${x.s||''}</span></button>`).join('')}</div></div>`;
  document.body.appendChild(v);
  v.querySelectorAll('.opt').forEach(b2=>b2.onclick=()=>o[+b2.dataset.i].f());
  const x=v.querySelector('.mdlx');if(x)x.onclick=onX;
}
function close(){const v=document.getElementById('veil');if(v)v.remove()}
function shortFree(sh,self){
  if(!sh)return false;
  if(G.bloc&&G.bloc!==self&&G.bloc.short===sh)return false;
  if(G.opoBloc&&G.opoBloc!==self&&G.opoBloc.short===sh)return false;
  return !Object.keys(G.coal).some(c=>G.coal[c]!==self&&c===sh);
}
function opoParties(){
  return alive().filter(k=>k!==G.me&&G.p[k].seats>0&&(!G.gov||!G.gov.parties.includes(k)));
}
function opoCard(){
  if(inGov()||!me().seats)return '';
  const w=G.opoBloc, inside=!!(w&&w.parties.includes(G.me));
  const kand=opoParties().filter(k=>!w||!w.parties.includes(k));
  const chetni=kand.filter(k=>listWill(k)>=10);
  const mand=(w?w.parties:[G.me]).reduce((a,k)=>a+G.p[k].seats,0);
  return `<div class="wcard" style="--wc:${inside?(w.color||'#c04a3e'):'#c04a3e'}">
    <div class="wlab">Opozycja${w?' · '+w.short:''}</div>
    <div class="wbody"><div style="flex:1;min-width:0">
      <b>${inside?w.name:(w?w.name:'Opozycja niezorganizowana')}</b>
      <span>${w?w.parties.map(k=>G.p[k].ab).join(' · ')+', '+mand+' '+pl(mand,'mandat','mandaty','mandatów'):'Każdy sobie. '+opoParties().length+' '+pl(opoParties().length,'partia','partie','partii')+' poza rządem.'}</span>
      ${inside?'':`<div class="wex">${chetni.length?'Chętnych do wspólnego frontu: '+chetni.map(k=>G.p[k].ab).join(', '):'Nikt nie chce się na razie łączyć.'}</div>`}</div>
    <div style="display:flex;flex-direction:column;gap:5px">
      ${inside?`<button class="btn g sm" onclick="renameBloc('opo')">Nazwij</button>`
       :'<span class="dim" style="font-size:11.5px">poza blokiem</span>'}
    </div></div></div>`;
}
function makeOpo(){
  const chetni=opoParties().filter(k=>listWill(k)>=10);
  if(!chetni.length)return;
  const grp=[G.me].concat(chetni);
  modalName(grp,x=>{
    G.opoBloc={name:x.name,short:shortFree(x.short,null)?x.short:'OPO',color:x.color,parties:grp};
    grp.forEach(k=>{if(k!==G.me){G.rel[G.me][k]=cl(G.rel[G.me][k]+10,-100,100);G.rel[k][G.me]=cl(G.rel[k][G.me]+10,-100,100)}});
    say(`<b>${x.name} (${G.opoBloc.short})</b>: opozycja zawiązuje wspólny front, ${grp.map(k=>G.p[k].ab).join(', ')}.`,'roy');
    render();
  });
}
function joinOpo(){
  const w=G.opoBloc;if(!w||w.parties.includes(G.me))return;
  const av=w.parties.reduce((a,k)=>a+listWill(k),0)/w.parties.length;
  if(av<10&&ch(.6)){say(`<b>${w.name} nie chce cię u siebie.</b> Średnia relacja ${Math.round(av)}.`,'bad');return render()}
  w.parties.push(G.me);
  w.parties.forEach(k=>{if(k!==G.me){G.rel[G.me][k]=cl(G.rel[G.me][k]+8,-100,100);G.rel[k][G.me]=cl(G.rel[k][G.me]+8,-100,100)}});
  say(`<b>Wchodzisz do ${w.name}.</b> Opozycja mówi jednym głosem.`,'good');render();
}
function leaveOpo(){
  const w=G.opoBloc;if(!w)return;
  w.parties=w.parties.filter(k=>k!==G.me);
  if(w.parties.length<2)G.opoBloc=null;
  say('<b>Wychodzisz z bloku opozycyjnego.</b> Grasz na własny rachunek.','bad');render();
}
function renameBloc(which){
  const b=which==='opo'?G.opoBloc:which==='gov'?G.bloc:null;
  if(b){modalName(b.parties,x=>{
    b.name=x.name;b.color=x.color;
    if(shortFree(x.short,b))b.short=x.short;
    say(`Blok występuje odtąd jako <b>${b.name} (${b.short})</b>.`,'roy');render()});return}
  const c=G.coal[which];if(!c)return;
  modalName(c.m,x=>{c.n=x.name;c.c=x.color;
    let key=which;
    if(x.short&&x.short!==which&&shortFree(x.short,c)){
      G.coal[x.short]=c;delete G.coal[which];key=x.short;
      c.m.forEach(k=>G.p[k].coal=key)}
    say(`Lista występuje odtąd jako <b>${c.n} (${key})</b>.`,'roy');render()});
}
function modalName(parties,cb,tytul,opis){
  close();
  const sug=autoName(parties,null);
  let col=BLOCPAL[RI(0,BLOCPAL.length-1)];
  const v=document.createElement('div');v.className='veil';v.id='veil';
  v.innerHTML=`<div class="mdl"><button class="mdlx" type="button" aria-label="Zamknij">×</button>
    <div class="h"><div class="k">${tytul||'Nazwa bloku'}</div>
    <h2>Jak ma się nazywać?</h2></div>
    <div class="bd"><p>${opis||''}${opis?'<br>':''}${parties.map(k=>G.p[k].n).join(' + ')}. Pod tą nazwą i barwą blok będzie
      występował w sondażach, sejmie i kronice.</p>
      <input class="inp" id="bn" maxlength="34" placeholder="np. ${sug.n}" value="${sug.n}">
      <input class="inp" id="bs" maxlength="5" placeholder="skrót" value="${sug.k}" style="max-width:130px">
      <div class="swatch" id="sw">${BLOCPAL.map(c=>`<button data-c="${c}" style="background:${c}"></button>`).join('')}</div>
    </div>
    <div class="op"><button class="opt" id="okb"><b>Zatwierdzam</b><span>Blok wchodzi do gry pod tą nazwą</span></button></div></div>`;
  document.body.appendChild(v);
  v.querySelector('.mdlx').onclick=()=>{close();render()};
  const paint=()=>v.querySelectorAll('#sw button').forEach(b=>b.className=b.dataset.c===col?'on':'');
  v.querySelectorAll('#sw button').forEach(b=>b.onclick=()=>{col=b.dataset.c;paint()});paint();
  v.querySelector('#okb').onclick=()=>{
    const n=(v.querySelector('#bn').value||sug.n).trim().slice(0,34);
    const s=(v.querySelector('#bs').value||sug.k).trim().slice(0,5).toUpperCase();
    close();cb({name:n||sug.n,short:s||sug.k,color:col});};
}
function showEvent(e){
  const T=typeof e.t==='function'?e.t():e.t, X=typeof e.x==='function'?e.x():e.x;
  modal(e.k,T,`<p>${X}</p>`,e.o.map(o=>({l:o.l,s:o.s,f:()=>{
    const r=o.f(me());if(r)say(`<b>${T}.</b> ${r}`);checkDeath();close();render()}})))}
