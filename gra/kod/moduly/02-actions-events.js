'use strict';
/* ══════════ AKCJE ══════════ */
/* Zmęczenie decyzją. Ta sama zagrywka powtarzana w kółko przestaje działać
   znacznie szybciej niż kiedyś — samo klikanie w to samo nie buduje już poparcia. */
function fat(id){return Math.max(BAL.zmeczenieDno,1-BAL.zmeczenieKrok*(G.used[id]||0))}
function sizeF(p){ // im większa partia, tym drożej się nią rusza: decyzja to koszt dla całej struktury
  const kp=Math.round(cl(.38+p.mem*.031,.38,2.7)*100)/100;
  if(p.mem<8) return {kp,fame:1.60,en:.72,lab:'zwinność kanapowej partii'};
  if(p.mem<15)return {kp,fame:1.42,en:.82,lab:'zwinność małej partii'};
  if(p.mem<26)return {kp,fame:1.16,en:.93,lab:''};
  if(p.mem>46)return {kp,fame:.80,en:1.22,lab:'inercja dużej partii'};
  return {kp,fame:1,en:1,lab:''};
}
const A=[
/* --- kampania --- */
{id:'wiec',cat:'kam',n:'Wiec w kanale',ap:1,kp:6,en:8,reg:1,tem:1,
 d:'Wybierasz kanał i temat wystąpienia. Trafiony temat porywa okręg, nietrafiony potrafi go zrazić.',
 f:(p,f,_,r,__,t)=>{
   const rg=REG.find(x=>x.id===r),tm=TEM.find(x=>x.id===t)||TEM[0];
   let m=0;SID.forEach(s=>m+=rg.mix[s]*(tm.w[s]||0));
   const roll=m*2.2+R(-.55,.55)+lead(G.me).char/220-.25;
   SID.forEach(s=>{if(tm.w[s])p.aff[s]=Math.max(.1,p.aff[s]+tm.w[s]*.09*f)});
   // wiec buduje obecność i sławę, nie jedność — od zgody w partii jest co innego
   if(roll>.85){M(p,8);p.pres[r]=cl(p.pres[r]+46*f);p.fame=cl(p.fame+R(5,8)*f);p.act=cl(p.act+4);
     return `<b>Owacja.</b> „${tm.n}” w ${rg.n} trafiło idealnie. Obecność +${Math.round(30*f)}.`}
   if(roll>.25){p.pres[r]=cl(p.pres[r]+25*f);p.fame=cl(p.fame+R(1.5,3)*f);p.act=cl(p.act+3);
     return `Przyzwoicie. „${tm.n}” w ${rg.n} przeszło bez emocji. Obecność +${Math.round(18*f)}.`}
   if(roll>-.5){p.pres[r]=cl(p.pres[r]+6*f);p.fame=cl(p.fame+.5);
     return `Letnio. W ${rg.n} nikt się tym tematem nie przejął.`}
   M(p,-7);p.pres[r]=cl(p.pres[r]-9);p.fame=cl(p.fame-3);p.ctr=cl(p.ctr+6);
   return `<b>Wygwizdany.</b> „${tm.n}” to było ostatnie, co ${rg.n} chciało usłyszeć. Obecność −9.`}},
{id:'kanwas',cat:'kam',n:'Kanwasing',ap:1,kp:11,en:12,reg:1,
 d:'Prywatne DM-y do userów z kanału. Męczące, ale najpewniejsze na obecność.',
 f:(p,f,_,r)=>{p.pres[r]=cl(p.pres[r]+44*f);p.act=cl(p.act+2);
   return `Obecność w <b>${rn(r)}</b> +${Math.round(44*f)}.`}},
{id:'spot',cat:'kam',n:'Spot wyborczy',ap:1,kp:22,en:9,
 d:'Emitowany wyłącznie w #kanał_eventowy, tam trafia zawsze i mocno. Do pozostałych okręgów przenika tylko czasem i słabiej. Wymaga wiarygodności, inaczej wyjdzie cringe.',
 f:(p,f)=>{if(ch(cl(.55-p.cred/160,.06,.5))){p.fame=cl(p.fame+2);p.ctr=cl(p.ctr+9);p.cred=cl(p.cred-4);
   return `Spot uznano za <b>cringe</b>. Krąży, ale jako mem.`}
  const g=R(8,14)*f;M(p,9);p.fame=cl(p.fame+g);p.cred=cl(p.cred+2);p.uni=cl(p.uni+4);
  p.pres.event=cl(p.pres.event+34*f);
  let ile=0;
  REG.filter(r=>r.id!=='event').forEach(r=>{if(ch(.45)){p.pres[r.id]=cl(p.pres[r.id]+R(5,11)*f);ile++}});
  return `Spot chwycił. <b>Sława +${fmt(g)}</b>, obecność w #kanał_eventowy +${Math.round(34*f)}${ile?`, przeniknął też do ${ile} ${pl(ile,'innego okręgu','innych okręgów','innych okręgów')}`:', ale nigdzie indziej go nie zauważono'}.`}},
{id:'debata',cat:'kam',n:'Debata z rywalem',ap:2,kp:0,en:15,tgt:1,term1:1,
 d:'Pojedynek liderów, raz na kadencję. O wyniku decydują kompetencja i charyzma, nie program, ale wynik bywa niespodzianką, a wygrana nie zawsze daje autorytet.',
 f:(p,f,t)=>{const o=G.p[t],a=lead(G.me),b=lead(t);
  const dbBoost=n=>n==='loof'?(goalDone('demokraci')?0:20):n==='Aryati'?12:n==='Śledzik'?-14:0;
  const dbBoost2=q=>leads(q).reduce((a,n)=>a+dbBoost(n),0);
  const x=p.cred*.2+p.uni*.1+a.komp*.45+a.char*.25+R(-22,22)+dbBoost2(p);
  const y=o.cred*.2+o.uni*.1+b.komp*.45+b.char*.25+R(-22,22)+dbBoost2(o);
  G.rel[G.me][t]=cl(G.rel[G.me][t]-9,-100,100);
  if(x>y){M(p,11);M(o,-7);XP(14);const zysk=ch(.6);if(zysk)gainAutor(p.lead,RI(1,2));
   if(isLead(p,'Aryati')){p.ctr=cl(p.ctr+7);p.pret=cl(p.pret+5)}
   if(ch(.12)){p.flow.eli+=1;var zdob='<b>elitę</b>'} else {p.flow.int+=1;var zdob='<b>intelektualistę</b>'}p.fame=cl(p.fame+R(7,12)*f);p.cred=cl(p.cred+5);o.fame=cl(o.fame-5);o.cred=cl(o.cred-4);
   const autInfo=zysk?', autorytet w górę':`, ale bez wzrostu autorytetu, ${o.lead} zdążył się obronić`;
   if(p.marg){p.marg=0;return `<b>${p.lead} rozjeżdża ${o.lead}.</b> Przestano cię ignorować${autInfo}, a ${zdob} dołączy przy rozliczeniu kadencji.`}
   return `<b>${p.lead} wygrywa</b> z ${o.lead} (${o.ab}). Doświadczenie +14${autInfo}, a przy rozliczeniu kadencji dołączy ${zdob}.`}
  M(p,-9);M(o,6);p.fame=cl(p.fame-3);p.cred=cl(p.cred-7);o.fame=cl(o.fame+5);
  return `<b>${o.lead} rozjeżdża ${p.lead}</b> w debacie.`}},
{id:'memy',cat:'kam',n:'Zalew memami',ap:1,kp:1,en:3,reg:1,
 d:'Tanie i skuteczne w kanałach memiarskich. Weterani kręcą nosem.',
 f:(p,f,_,r)=>{p.fame=cl(p.fame+R(3,5.5)*f);p.ctr=cl(p.ctr+7);p.cred=cl(p.cred-3.5);
  p.pret=cl(p.pret-4);p.aff.ser+=.45*f;p.pres[r]=cl(p.pres[r]+20*f);
  const nap=RI(2,4);p.flow.ser+=nap;
  return `Kanał <b>${rn(r)}</b> zalany. <b>${nap} ${pl(nap,'serwerowicz','serwerowiczów','serwerowiczów')}</b> dołączy przy rozliczeniu kadencji.`}},
{id:'manifest',cat:'kam',n:'Manifest programowy',ap:2,kp:20,en:15,tem:1,
 d:'Wybierasz oś programową. Trwale przesuwa partię w stronę wybranej grupy.',
 f:(p,f,_,__,___,t)=>{const tm=TEM.find(x=>x.id===t)||TEM[0];
  SID.forEach(s=>{if(tm.w[s])p.aff[s]=Math.max(.1,p.aff[s]+tm.w[s]*.26*f)});
  p.cred=cl(p.cred+R(8,12)*f);p.fame=cl(p.fame+4*f);p.pret=cl(p.pret+6);M(p,6);
  return `Manifest: „${tm.n}”. Program przesunięty, wiarygodność w górę.`}},
/* --- organizacja --- */
{id:'rekr',cat:'org',n:'Nabór do partii',ap:1,kp:18,en:11,reg:1,
 d:'Piszesz ogłoszenie werbunkowe. Treść jest oceniana, banał nie przyciągnie nikogo. Raz na 6 tygodni, maksymalnie 2 osoby.',
 f:(p,f,_,r)=>{openRecruit(r);return null}},
{id:'trening',cat:'org',n:'Praca nad wizerunkiem lidera',ap:2,kp:30,en:15,
 d:'Podnosisz jedną z trzech cech przewodniczącego: charyzmę, kompetencję albo wytrzymałość. Powyżej 80 postępy są coraz mniejsze. Autorytetu tak nie podciągniesz, ten trzeba wywalczyć w debatach i wyborach.',
 f:()=>{openTrain();return null}},
{id:'szkol',cat:'org',n:'Szkolenie kadr',ap:1,kp:13,en:7,
 d:'Aktywność i jedność w górę, a jedna osoba z zaplecza (albo sam przewodniczący) dostaje +1 do losowej cechy (charyzma, kompetencja albo wytrzymałość). Tylko jedna i tylko o jeden, ale to się kumuluje.',
 f:(p,f)=>{p.act=cl(p.act+R(6,10)*f);p.cred=cl(p.cred+3);p.ctr=cl(p.ctr-3);
  const pool=[...new Set(p.bench.concat([p.lead]))];
  const who=pick(pool), i=RI(0,2), nm=['charyzmę','kompetencję','wytrzymałość'][i];
  const cur=L(who);
  if(cur[['char','komp','wytrz'][i]]>=99)return `Kadry przeszkolone, ale ${who} nie ma się już czego uczyć.`;
  if(!G.lup[who])G.lup[who]=[0,0,0,0];
  G.lup[who][i]+=1;
  return `Kadry przeszkolone. <b>${who}</b> podnosi ${nm} do ${L(who)[['char','komp','wytrz'][i]]}.`}},
{id:'statut',cat:'org',n:'Reforma statutu',ap:2,kp:16,en:11,
 d:'Porządkujesz struktury. Przy niskiej jedności to zaproszenie do rozłamu.',
 f:(p,f)=>{if(p.uni<40&&ch(.42)){const q=giveBackCap(p,Math.max(1,Math.round(p.mem*.16)));const l=q.eli+q.int+q.ser;p.uni=cl(p.uni-6);
   return `Reforma <b>wywołała rozłam</b>. Odchodzi ${l} ${pl(l,'osoba','osoby','osób')}.`}
  const g=R(8,13)*f;p.cred=cl(p.cred+5*f);p.pret=cl(p.pret-4);return `Statut przyjęty. <b>Wiarygodność +${Math.round(g*.6)}</b>, mniej pretensjonalnie.`}},
{id:'czyst',cat:'org',n:'Czystka w partii',ap:2,kp:0,en:16,
 d:'Jedność mocno w górę kosztem 10–22% składu. Pamiętaj, że liczba osób przekłada się wprost na głosy, to najdroższa jedność w grze.',
 f:(p,f)=>{const q=giveBackCap(p,Math.max(1,Math.round(p.mem*R(.10,.22))));const l=q.eli+q.int+q.ser;
  p.ctr=cl(p.ctr+10);p.cred=cl(p.cred-5);p.act=cl(p.act+R(4,8));p.uni=cl(p.uni+R(12,19)*f);
  return `Wylatuje <b>${l} ${pl(l,'osoba','osoby','osób')}</b>, reszta trzyma szyk.`}},
{id:'zjazd',cat:'org',n:'Zjazd partii',ap:2,kp:105,en:26,term1:1,
 d:'Najdroższa decyzja w grze i tylko raz na kadencję. Poza sławą, jednością i obecnością wszędzie daje trwałą przewagę wyborczą +9% do wyborów.',
 f:(p,f)=>{M(p,22);p.fame=cl(p.fame+R(12,19)*f);p.act=cl(p.act+18*f);p.cred=cl(p.cred+8);
  p.uni=cl(p.uni+R(9,15)*f);
  REG.forEach(r=>p.pres[r.id]=cl(p.pres[r.id]+20));
  p.rally=Math.min(2,(p.rally||0)+1);
  return `<b>Zjazd</b> przeszedł do serwerowej legendy. Przewaga wyborcza +${p.rally*9}% do końca kadencji.`}},

/* --- dyplomacja --- */
{id:'wywiad',cat:'dyp',n:'Wywiad dla serwerowego medium',ap:1,kp:6,en:9,
 d:'Trzy pytania na żywo. Nie ma odpowiedzi dobrych zawsze — liczy się to, w jakiej sytuacji jest twoja partia. Wyjdziesz z tego ze sławą i wiarygodnością albo z aferą.',
 f:()=>{openWywiad();return null}},
{id:'kulisy',cat:'dyp',n:'Rozmowy kuluarowe',ap:1,kp:14,en:7,tgt:1,
 d:'Prywatny kanał, dwie osoby, żadnych świadków. Najpewniejszy sposób na odbudowę relacji.',
 f:(p,f,t)=>{const dm={'Mietek Nocul':1.45,'kenzo':.40,'Kaziu':.55,'Bartek':1.06}[p.lead]||1;
  const g=Math.round(R(14,24)*(0.75+lead(G.me).komp/200)*(hasT('negocjator')?1.5:1)*dm);
  G.rel[G.me][t]=cl(G.rel[G.me][t]+g,-100,100);G.rel[t][G.me]=cl(G.rel[t][G.me]+g,-100,100);
  return `Relacje z <b>${G.p[t].ab}</b> +${g} (teraz ${Math.round(G.rel[G.me][t])}).`}},
{id:'zarob',cat:'org',n:'Zarób kapitał prywatny',ap:0,kp:0,en:22,
 d:'Przewodniczący odpuszcza politykę na tydzień i zajmuje się własnym interesem. Partia nie zyskuje na tym nic — ani sławy, ani jedności — ale w kieszeni robi się grubiej. Nie kosztuje akcji, bo to jego prywatna sprawa, za to zjada sporo energii. Ile dokładnie wpadnie, zależy od pozycji, rangi i tego, jak akurat stoi gospodarka.',
 f:(p,f)=>{
   const szef=p.lead;
   /* Zarobek jest tu wyraźnie inny niż tygodniowy: to jednorazowy strzał
      z szerokim rozrzutem, więc raz wyjdzie z tego grosz, a raz krocie. */
   const baza=zarobekLidera(G.me);
   const los=R(.6,3.4)*f;
   const kwota=Math.max(20e3,Math.round(baza*los));
   G.kapPryw[szef]=(G.kapPryw[szef]!==undefined?G.kapPryw[szef]:kapPryw(szef))+kwota;
   sprawdzRangi();
   const jak=los>2.6?'Tydzień, o jakim się marzy.':los>1.6?'Poszło lepiej, niż zakładał.'
     :los>1?'Zwyczajnie, ale uczciwie.':'Zeszło się na niczym.';
   return `${jak} <b>${szef}</b> zarobił <b>${kasaSkrot(kwota)}</b> do własnej kieszeni.`
     +` Partia z tego nie ma nic.`}},
{id:'zrzutka',cat:'org',n:'Zrzutka z prywatnych kieszeni',ap:0,kp:0,en:20,
 d:'Prosisz kogoś ze swojego zaplecza, żeby wyłożył własne pieniądze na partię. Milion prywatnego majątku to jeden punkt kapitału. Nikt nie robi tego z radości: jedność leci w dół, a ten, kogo wydoisz, odchodzi z partii z pretensjami. Im więcej bierzesz, tym gorzej to wygląda.',
 f:()=>{openZrzutka();return null}},
{id:'werb',cat:'dyp',n:'Werbunek działacza',ap:2,kp:22,en:14,
 d:'Dzwonisz do konkretnej osoby z cudzej partii i próbujesz ją przeciągnąć. Ludzie rzadko zmieniają barwy, więc szanse są niskie: liczy się relacja z jej partią, twoja wielkość, twoja kontrowersja i pretensjonalność. Przewodniczącego ściągniesz tylko w wyjątkowych okolicznościach.',
 f:()=>{openWerb();return null}},
{id:'przekw',cat:'prm',n:'Przekwalifikowanie działacza',ap:1,kp:12,en:8,
 d:'Szkoła kadr LSD: bierzesz jednego serwerowicza, dajesz mu do przeczytania statut i wypuszczasz jako intelektualistę. Jedna osoba na decyzję.',
 f:(p)=>{if(p.comp.ser<1)return 'Nie ma już kogo przekwalifikować, w partii nie został ani jeden serwerowicz.';
  p.comp.ser--;p.comp.int++;
  p.cred=cl(p.cred+2);p.pret=cl(p.pret+2);p.aff.int+=.2;p.aff.ser=Math.max(.1,p.aff.ser-.15);
  return `Jeden serwerowicz kończy szkołę kadr. <b>Skład: ${p.comp.eli} elity, ${p.comp.int} intelektualistów, ${p.comp.ser} serwerowiczów.</b>`}},
{id:'kampania_prm',cat:'prm',n:'Kurs dla całego zaplecza',ap:2,kp:30,en:16,
 d:'Zamiast jednej osoby przepuszczasz przez szkołę kadr trzech naraz. Drożej, ale za jedną akcję.',
 f:(p)=>{let n=0;for(let i=0;i<3&&p.comp.ser>0;i++){p.comp.ser--;p.comp.int++;n++}
  if(!n)return 'Nie ma kogo szkolić.';
  p.cred=cl(p.cred+4);p.pret=cl(p.pret+4);p.aff.int+=.4;
  return `<b>${n} ${pl(n,'osoba przechodzi','osoby przechodzą','osób przechodzi')}</b> z serwerowiczów na intelektualistów.`}},
{id:'luz',cat:'kam',n:'Luźny stream z liderem',ap:1,kp:8,en:9,
 d:'Dwie godziny gadania o niczym na kanale głosowym. Zbija pretensjonalność najmocniej w grze, przy okazji dorzuca trochę sławy.',
 f:(p,f)=>{const d=R(11,17)*f;p.pret=cl(p.pret-d);p.fame=cl(p.fame+R(3,6)*f);p.aff.ser+=.35;
  p.cred=cl(p.cred-2);
  return `Serwer usłyszał normalnego człowieka. <b>Pretensjonalność −${Math.round(d)}</b>.`}},
{id:'konsult',cat:'org',n:'Otwarte konsultacje z serwerem',ap:1,kp:10,en:8,
 d:'Otwierasz kanał, w którym każdy może wejść i powiedzieć, co jest nie tak z partią. Pretensjonalność i kontrowersja w dół, aktywność w górę.',
 f:(p,f)=>{const d=R(8,13)*f;p.pret=cl(p.pret-d);p.ctr=cl(p.ctr-R(4,7));p.act=cl(p.act+R(5,9)*f);
  p.cred=cl(p.cred+3);p.aff.ser+=.25;
  return `Wysłuchaliście serwera. <b>Pretensjonalność −${Math.round(d)}</b>, kontrowersja też w dół.`}},
{id:'przepr',cat:'dyp',n:'Publiczne przeprosiny',ap:1,kp:4,en:9,tgt:1,shame:1,
 d:'Odblokowane tylko po wpadce, nieudanym sabotażu, przyłapaniu na aferze albo doniesieniu. Kosztuje sławę i dumę, ale wyciąga relację z najgłębszego dołka.',
 f:(p,f,t)=>{const cur=G.rel[G.me][t];
  const g=Math.round((cur<-20?R(30,44):R(16,25))*({'Mietek Nocul':1.45,'kenzo':.40,'Kaziu':.55}[p.lead]||1));
  G.rel[G.me][t]=cl(cur+g,-100,100);G.rel[t][G.me]=cl(G.rel[t][G.me]+g,-100,100);
  p.fame=cl(p.fame-3);p.cred=cl(p.cred+2);M(p,-3);
  return `Przeprosiny przyjęte. Relacje z <b>${G.p[t].ab}</b> ${Math.round(cur)} → ${Math.round(G.rel[G.me][t])}.`}},
{id:'podkup',cat:'bru',n:'Przekupienie działacza',ap:1,kp:0,en:9,tgt:1,
 d:'Wybierasz konkretną osobę z cudzego zaplecza i płacisz jej cenę — kto lepszy, ten droższy. Żadnego losowania: albo cię stać, albo nie. Przewodniczącego nie kupisz, a serwer i tak się dowie.',
 f:(p,f,t)=>{openPrzekup(t);return null}},
/* --- brudne --- */
/* Donos do administracji: jedyna decyzja w grze, która potrafi skasować cudzą
   partię z serwera. Dlatego jest wyłącznie w rękach gracza (boty jej nie mają),
   raz na kadencję i z szansą jak jeden do dziesięciu. Dziewięć razy na dziesięć
   zostaje po niej tylko to, że wszyscy wiedzą, kto doniósł. */
{id:'admin',cat:'bru',n:'Doniesienie do administracji',ap:2,kp:22,en:16,tgt:1,term1:1,
 d:'Zgłaszasz partię administracji serwera. Szansa na jej rozwiązanie to 10%. Jeśli się nie uda — a zwykle się nie udaje — zostajesz z ogromną kontrowersją i opinią donosiciela. Raz na kadencję.',
 f:(p,f,t)=>{const o=G.p[t];
  if(ch(.10)){
    o.dead=1;o.seats=0;
    // ludzie rozwiązanej partii wracają do puli bezpartyjnych
    G.free.eli=(G.free.eli||0)+o.comp.eli;G.free.int=(G.free.int||0)+o.comp.int;G.free.ser=(G.free.ser||0)+o.comp.ser;
    o.comp={eli:0,int:0,ser:0};o.mem=0;
    if(G.gov&&G.gov.parties.includes(t))govLeave(t);
    p.ctr=cl(p.ctr+26);p.cred=cl(p.cred-10);M(p,10);
    alive().forEach(k=>{if(k===G.me)return;G.rel[k][G.me]=cl(G.rel[k][G.me]-18,-100,100)});
    say(`<b>Administracja rozwiązuje ${o.n}.</b> Kanał zarchiwizowany, rola usunięta. Serwer wie, kto to zgłosił.`,'roy');
    return `<b>${o.ab} znika z serwera.</b> Kontrowersja +26, a reszta sceny patrzy na ciebie inaczej.`}
  p.ctr=cl(p.ctr+34);p.cred=cl(p.cred-14);p.fame=cl(p.fame-6);M(p,-16);
  G.shame=G.week+6;
  G.rel[G.me][t]=cl(G.rel[G.me][t]-40,-100,100);G.rel[t][G.me]=cl(G.rel[t][G.me]-40,-100,100);
  alive().forEach(k=>{if(k===G.me||k===t)return;G.rel[k][G.me]=cl(G.rel[k][G.me]-12,-100,100)});
  return `<b>Administracja odrzuciła zgłoszenie</b>, ale wyciekło, kto je złożył. Kontrowersja +34, wszyscy patrzą krzywo.`}},
/* --- program --- */
/* Dział „Program" wypadł z gry. Trzy decyzje przestawiające elektorat poszły
   razem z nim, ale wyciszenie sporu i zejście na ziemię zostają — bez nich
   z wysokiej kontrowersji i pretensjonalności nie dałoby się zejść w ogóle,
   a paraliż przy 90 byłby ślepą uliczką. Siedzą teraz w Organizacji. */
{id:'chlodzenie',cat:'org',n:'Wyciszenie sporu',ap:1,kp:12,en:9,
 d:'Wycofujesz się z awantur, kasujesz najgorsze posty, przepraszasz za ton. Kontrowersja spada o 8–13, powoli, ale to jedyny sposób, żeby zejść z linii ognia. Kosztuje trochę sławy.',
 f:(p,f)=>{const d=R(8,13)*Math.max(.55,f);
  p.ctr=cl(p.ctr-d);p.fame=cl(p.fame-R(1.5,3));p.cred=cl(p.cred+2);
  return `Spór wyciszony. <b>Kontrowersja −${Math.round(d)}</b> (teraz ${Math.round(p.ctr)}).`}},
{id:'depret',cat:'org',n:'Zejście na ziemię',ap:1,kp:6,en:7,
 d:'Mniej manifestów, więcej normalnej gadki. Zbija pretensjonalność.',
 f:(p,f)=>{const d=R(9,15)*f;p.pret=cl(p.pret-d);p.cred=cl(p.cred-1.5);p.aff.ser+=.3;p.aff.ser+=.25;
  return `Ton złagodzony. <b>Pretensjonalność −${Math.round(d)}</b>.`}},
/* --- rząd (koalicja) --- */
{id:'ustawa',cat:'wla',n:'Projekt ustawy',ap:2,kp:10,en:11,gov:1,pm:0,tem:1,
 d:'Wybierasz temat i poddajesz go pod głosowanie sejmu. Przegrana ustawa boli podwójnie.',
 f:(p,f,_,__,___,t)=>{const tm=TEM.find(x=>x.id===t)||TEM[0];
  const v=sejmVote('ustawa',G.me,G.me);
  if(v.pass){SID.forEach(s=>{if(tm.w[s])p.aff[s]=Math.max(.1,p.aff[s]+tm.w[s]*.18)});
   if(G.gov)APPR(+RI(2,6));p.cred=cl(p.cred+4);
   return `Ustawa „${tm.n}” <b>przeszła</b> ${v.yes}:${v.no}.`}
  p.cred=cl(p.cred-5);if(G.gov)APPR(-5);
  return `Ustawa „${tm.n}” <b>odrzucona</b> ${v.yes}:${v.no}. Kompromitacja.`}},
/* --- premier: reszta jego narzędzi siedzi w dziale Premiera, nie w decyzjach --- */
{id:'oredzie',cat:'prem',n:'Orędzie premiera',ap:1,kp:8,en:9,pm:1,tem:1,term1:1,
 d:'Raz na kadencję. Wystąpienie do całego serwera, temat decyduje, kto klaszcze.',
 f:(p,f,_,__,___,t)=>{const tm=TEM.find(x=>x.id===t)||TEM[0];
  let m=0;REG.forEach(r=>{let x=0;SID.forEach(s=>x+=r.mix[s]*(tm.w[s]||0));m+=x*regVotes(r)});
  m/=REG.reduce((a,r)=>a+regVotes(r),0);
  const roll=m*2+lead(G.me).char/200-.3;
  SID.forEach(s=>{if(tm.w[s])p.aff[s]=Math.max(.1,p.aff[s]+tm.w[s]*.12)});
  const om=hasLsd(G.me)?2.2:1;
  REG.forEach(r=>p.pres[r.id]=cl(p.pres[r.id]+(roll>.4?9:4)*om));
  if(hasLsd(G.me)){p.rally=(p.rally||0)+2;p.fame=cl(p.fame+4)}
  G.useTerm.oredzie=1;
  if(roll>.4){p.fame=cl(p.fame+R(6,10));APPR(+RI(4,10));M(p,6);
   const g=drawFrom('ogolny',RI(1,2));const n=g.eli+g.int+g.ser;
   p.comp.eli+=g.eli;p.comp.int+=g.int;p.comp.ser+=g.ser;p.mem+=n;
   return `Orędzie „${tm.n}” <b>przyjęte dobrze</b>. Poparcie rządu w górę, a do partii wchodzi <b>${n} ${pl(n,'osoba','osoby','osób')}</b>.`}
  if(roll>-.3){p.fame=cl(p.fame+2);
   const g=drawFrom('ogolny',RI(1,2));const n=g.eli+g.int+g.ser;
   p.comp.eli+=g.eli;p.comp.int+=g.int;p.comp.ser+=g.ser;p.mem+=n;
   return `Orędzie „${tm.n}” przeszło bez echa, ale ${n} ${pl(n,'osoba dopisała się','osoby dopisały się','osób dopisało się')} do partii.`}
  APPR(-RI(3,7));p.fame=cl(p.fame-2);
  return `Orędzie „${tm.n}” <b>źle odebrane</b>. Poparcie rządu w dół.`}},
{id:'dymisja',cat:'prem',n:'Odwołanie ministra',ap:2,kp:12,en:12,pm:1,
 d:'Wyrzucasz partię z rządu. Decydujesz sam, bez głosowania, ale koalicja się o tym dowie: relacje na dno i mocny zastrzyk kontrowersji.',
 f:()=>{openDym();return null}},
{id:'zmianaMin',cat:'prem',n:'Zmiana ministra',ap:1,kp:8,en:8,pm:1,
 d:'Wymieniasz człowieka na resorcie, zostawiając jego partię w koalicji. Tańsze niż dymisja, ale kontrowersja i tak rośnie. Świeżo powołanego ministra nie ruszysz przez trzy tygodnie.',
 f:()=>{openZmiana();return null}},
{id:'rozwiaz',cat:'prem',n:'Rozwiązanie sejmu',ap:3,kp:30,en:20,pm:1,
 d:'Przedterminowe wybory w wybranym przez ciebie momencie. Serwer odbiera to jako ucieczkę: tracisz ponad połowę sławy i dostajesz potężny zastrzyk kontrowersji.',
 f:(p)=>{const f0=p.fame;
  p.fame=cl(p.fame*0.42);
  p.ctr=Math.min(88,p.ctr+RI(22,30));
  p.cred=cl(p.cred-9);M(p,-16);
  say('<b>Premier rozwiązuje sejm.</b> Przedterminowe wybory, a serwer uznał to za ucieczkę.','bad');
  G.week=G.weeks;
  return `Sejm rozwiązany. Sława ${Math.round(f0)} spada do ${Math.round(p.fame)}, kontrowersja rośnie do ${Math.round(p.ctr)}.`}},
/* Ustawa o kanałach poszła precz. Przewracała całą mapę wyborczą w środku
   kadencji — mandaty okręgowe rozdzielały się od nowa, przez co obecność
   budowana przez pół kadencji traciła sens, a przy okazji sypały się rzeczy
   liczone od stałej liczby okręgów. Więcej z tego było awarii niż rozgrywki. */
/* --- opozycja --- */
{id:'wotum',cat:'opo',n:'Rozliczanie rządu',ap:2,kp:24,en:16,opo:1,
 d:'Zbierasz materiał, wywlekasz wpadki i próbujesz doprowadzić do głosowania nad wotum nieufności. Sejm rzadko w ogóle dopuszcza wniosek, a koalicjanci i tak zagłosują przeciw.',
 f:()=>{openWotum();return null}},
{id:'przekup',cat:'opo',n:'Przekupstwo koalicjanta',ap:2,kp:55,en:14,opo:1,
 d:'Dogadujesz się po cichu z posłem koalicji. Przy najbliższej ustawie zagłosuje przeciw własnemu rządowi. Drogie, ryzykowne i zwykle wystarcza raz, żeby wywrócić głosowanie.',
 f:()=>{openPrzekupstwo();return null}},
/* --- prezydent: weto ustaw jest teraz w dziale Prezydenta, przy biurku --- */
{id:'oredzieP',cat:'prz',n:'Orędzie prezydenckie',ap:1,kp:6,en:8,prez:1,tem:1,term1:1,
 d:'Raz na kadencję prezydencką, czyli na dwie parlamentarne. Prezydent mówi do serwera ponad podziałami, albo udaje, że ponad.',
 f:(p,f,_,__,___,t)=>{const tm=TEM.find(x=>x.id===t)||TEM[0];
  SID.forEach(s=>{if(tm.w[s])p.aff[s]=Math.max(.1,p.aff[s]+tm.w[s]*.14)});
  G.useTerm.oredzieP=1;G.prezOredzieFor=prezKadencja();
  p.fame=cl(p.fame+R(5,9));p.cred=cl(p.cred+4);M(p,7);
  REG.forEach(r=>p.pres[r.id]=cl(p.pres[r.id]+11*(hasLsd(G.me)?2.2:1)));
  if(hasLsd(G.me))p.rally=(p.rally||0)+2;
  const g=drawFrom('polityka',RI(1,2));const n=g.eli+g.int+g.ser;
  p.comp.eli+=g.eli;p.comp.int+=g.int;p.comp.ser+=g.ser;p.mem+=n;
  return `Orędzie „${tm.n}” poszło na wszystkie kanały. Jedyne w tej kadencji, a do partii dołącza <b>${n} ${pl(n,'osoba','osoby','osób')}</b>.`}},
/* --- specjalne --- */
{id:'sabotaz',cat:'spe',n:'Akcja sabotażowa',ap:2,kp:30,en:18,tgt:1,
 d:'Skoordynowany chaos na kanałach przeciwnika. Udaje się mniej więcej co trzeci raz, reszta kończy się wykryciem i katastrofą wizerunkową. Blok opozycyjny i Showman poprawiają szanse.',
 f:(p,f,t)=>{const o=G.p[t];
  const wBloc=G.opoBloc&&G.opoBloc.parties.includes(G.me)&&G.opoBloc.parties.length>1;
  let risk=cl(.75-lead(G.me).komp/300-p.cred/700+o.cred/340+(G.used.sabotaz||0)*.10-(wBloc?.09:0)-(hasT('showman')?.06:0),.40,.92);
  G.rel[G.me][t]=cl(G.rel[G.me][t]-26,-100,100);G.rel[t][G.me]=cl(G.rel[t][G.me]-26,-100,100);
  if(ch(risk)){
    const d=R(16,26);
    p.fame=cl(p.fame-d);p.cred=cl(p.cred-20);p.ctr=cl(p.ctr+26);p.uni=cl(p.uni-11);M(p,-20);
    REG.forEach(r=>p.pres[r.id]=cl(p.pres[r.id]-12));
    G.rel[G.me][t]=cl(G.rel[G.me][t]-25,-100,100);
    alive().forEach(x=>{if(x!==G.me)G.rel[G.me][x]=cl(G.rel[G.me][x]-9,-100,100)});
    G.shame=G.week+6;
    return `<b>Wykryto twoich ludzi.</b> Sława −${Math.round(d)}, wiarygodność −20, kontrowersja +26. Zostały ci publiczne przeprosiny.`}
  o.fame=cl(o.fame-R(9,15));o.act=cl(o.act-R(10,17));o.uni=cl(o.uni-7);M(o,-13);
  REG.forEach(r=>o.pres[r.id]=cl(o.pres[r.id]*.72));
  M(p,7);XP(10);
  return `<b>Sabotaż udany.</b> ${o.ab} traci sławę, aktywność i jedną trzecią obecności we wszystkich okręgach. Nikt nie wie, że to ty (ryzyko było ${Math.round(risk*100)}%).`}},
{id:'odp',cat:'spe',n:'Regeneracja lidera',ap:1,kp:0,en:-36,tydz2:1,
 d:'Lider znika na chwilę i wraca z energią. Nic nie kosztuje, ale dwa razy w tygodniu to maksimum — po trzecim zniknięciu nikt by go już nie szukał.',
 f:(p)=>{p.act=cl(p.act-3);return `${p.lead} odpoczął. <b>Energia +36</b>.`}},
{id:'stery',cat:'spe',n:'Układ sterów',ap:1,kp:26,en:12,term1:1,
 d:'Ustalasz, ilu ludzi prowadzi partię: jeden, dwóch albo trzech, i kto to jest. Statystyki oraz cechy wrodzone liczą się wtedy jako średnia całego składu sterów. Raz na kadencję.',
 f:()=>{openStery();return null}},
];
function topSeg(p){let b=SID[0];SID.forEach(s=>{if(p.aff[s]>p.aff[b])b=s});return b}
const COMBO=[
 {a:'kanwas',b:'wiec',   m:1.55,n:'Przygotowany grunt',d:'Ludzie już wiedzieli, po co przychodzą.'},
 {a:'manifest',b:'spot', m:1.45,n:'Spójny przekaz',d:'Spot mówi dokładnie to, co manifest.'},
 {a:'wywiad',b:'debata', m:1.40,n:'Rozgrzany lider',d:'Wszedł na debatę prosto z wywiadu.'},
 {a:'szkol',b:'kanwas',  m:1.40,n:'Przeszkolone kadry',d:'Wiedzieli, co pisać w DM-ach.'},
 {a:'zjazd',b:'rekr',    m:1.45,n:'Świeży entuzjazm',d:'Po zjeździe ludzie sami się zgłaszali.'},
 {a:'manifest',b:'memy', m:0.55,n:'Niespójność',d:'Wczoraj manifest, dziś memy. Nikt tego nie kupuje.'},
 {a:'admin',b:'kulisy',  m:0.45,n:'Świeży donos',d:'Trudno rozmawiać w kuluarach, gdy właśnie zgłosiłeś kogoś adminom.'},
 {a:'admin',b:'wywiad',  m:0.55,n:'Niewygodne pytanie',d:'Dziennikarz zaczął od tego zgłoszenia do administracji.'},
 {a:'czyst',b:'rekr',    m:0.60,n:'Zła prasa',d:'Kto chce wchodzić do partii, która właśnie kogoś wyrzuciła?'},
];
/* Premier i prezydent mają własne działy w nawigacji, więc nie ma ich tutaj. */
const CATS=[['kam','Kampania'],['org','Organizacja'],['dyp','Dyplomacja'],['bru','Brudne'],
            ['prm','Przemiana'],['wla','Rząd'],
            ['opo','Opozycja'],['spe','Specjalne']];

/* ══════════ WYDARZENIA ══════════ */
const EV=[
{id:'mediacja',w:()=>me().ctr>55?6:1,k:'Serwer',t:'Admini proponują mediację',
 x:()=>`Przy kontrowersji ${Math.round(me().ctr)}/100 administracja zaprasza na rozmowę: „albo się dogadamy, albo zaczniemy zamykać kanały”.`,
 o:[{l:'Idę i przepraszam publicznie',s:'Kontrowersja −14, sława −5',
     f:p=>{p.ctr=cl(p.ctr-14);p.fame=cl(p.fame-5);p.cred=cl(p.cred+4);return 'Ton opadł. Serwer to odnotował.'}},
    {l:'Idę, ale niczego nie przyznaję',s:'Kontrowersja −6',
     f:p=>{p.ctr=cl(p.ctr-6);p.pret=cl(p.pret+4);return 'Formalnie się dogadaliście.'}},
    {l:'Nie idę',s:'Kontrowersja +7',
     f:p=>{p.ctr=cl(p.ctr+7);M(p,-4);return 'Administracja zapamiętała.'}}]},
{id:'odplyw',w:()=>3,k:'Serwer',t:'Fala odejść z serwera',
 x:'Kilkanaście osób naraz opuściło Mordy Mordeczki, sezon, egzaminy, znudzenie. Ubyło wszystkim, także tobie.',
 o:[{l:'Próbuję ich zatrzymać',s:'Energia −14, tracisz mniej, ale i tak tracisz',
     f:p=>{G.en=cl(G.en-14);const q=giveBackCap(p,RI(1,2));return `Odeszło ${q.eli+q.int+q.ser}. Bez tego byłoby więcej.`}},
    {l:'Odpuszczam',s:'Tracisz więcej osób',
     f:p=>{const q=giveBackCap(p,RI(2,4));return `Odeszło ${q.eli+q.int+q.ser} ${pl(q.eli+q.int+q.ser,'osoba','osoby','osób')}.`}},
    {l:'Publicznie komentuję odejścia',s:'Tracisz osoby i wiarygodność',
     f:p=>{const q=giveBackCap(p,RI(1,3));p.cred=cl(p.cred-5);p.ctr=cl(p.ctr+6);
       return `Odeszło ${q.eli+q.int+q.ser}, a komentarz uznano za żałosny.`}}]},
{id:'nuda',w:()=>3,k:'Serwer',t:'Serwer się nudzi',
 x:'Martwy tydzień. Kanały puste, nikt nie odpisuje, kampanie mówią do ściany.',
 o:[{l:'Przeczekuję',s:'Aktywność i obecność w dół',
     f:p=>{p.act=cl(p.act-9);REG.forEach(r=>p.pres[r.id]=cl(p.pres[r.id]-7));return 'Tydzień stracony.'}},
    {l:'Wymuszam aktywność na swoich',s:'Aktywność spada mniej, ale jedność siada',
     f:p=>{p.act=cl(p.act-4);p.uni=cl(p.uni-8);G.en=cl(G.en-10);return 'Ludzie pisali z przymusu. Widać to było.'}},
    {l:'Robimy coś głupiego, byle się działo',s:'Aktywność w dół, kontrowersja w górę',
     f:p=>{p.act=cl(p.act-6);p.ctr=cl(p.ctr+11);p.cred=cl(p.cred-4);return 'Zadziałało na pół dnia.'}}]},
{id:'stare',w:()=>me().fame>44?4:1,k:'Wizerunek',t:'Ktoś wywlekł stare screeny',
 x:'Rozmowy sprzed roku, w których twoja partia obiecywała dokładnie odwrotnie niż dziś. Nie ma dobrej odpowiedzi.',
 o:[{l:'Przyznaję, że się zmieniliśmy',s:'Wiarygodność w dół, jedność w dół',
     f:p=>{p.cred=cl(p.cred-7);p.uni=cl(p.uni-5);return 'Szczerze, ale słabo.'}},
    {l:'Twierdzę, że to wyrwane z kontekstu',s:'Wiarygodność mocno w dół, kontrowersja w górę',
     f:p=>{p.cred=cl(p.cred-11);p.ctr=cl(p.ctr+9);return 'Nikt nie uwierzył.'}},
    {l:'Milczę',s:'Sława i wiarygodność w dół',
     f:p=>{p.fame=cl(p.fame-6);p.cred=cl(p.cred-5);M(p,-4);return 'Milczenie odczytano jako przyznanie się.'}}]},
{id:'kanal',w:()=>2,k:'Administracja',t:'Admin kasuje kanał',dyn:1,
 build(){const r=pick(REG);
  return {x:`Administracja zamknęła <b>${r.n}</b> na tydzień „dla ochłonięcia”. Cała praca, którą tam włożyłeś, wyparowała.`,
   o:[{l:'Przenoszę ludzi na inne kanały',s:'Tracisz obecność tam, trochę zyskujesz gdzie indziej',
       f:p=>{const lost=p.pres[r.id];p.pres[r.id]=cl(lost*.35);
         REG.filter(x=>x.id!==r.id).forEach(x=>p.pres[x.id]=cl(p.pres[x.id]+4));
         return `Obecność w ${r.n} spadła z ${Math.round(lost)} do ${Math.round(p.pres[r.id])}.`}},
      {l:'Protestuję u adminów',s:'Obecność przepada, kontrowersja rośnie',
       f:p=>{p.pres[r.id]=cl(p.pres[r.id]*.30);p.ctr=cl(p.ctr+8);
         return `Protest odrzucony, obecność w ${r.n} przepadła.`}},
      {l:'Czekam, aż otworzą',s:'Obecność przepada w całości',
       f:p=>{p.pres[r.id]=cl(p.pres[r.id]*.25);p.act=cl(p.act-5);
         return `${r.n} wrócił, twoich ludzi tam już nie ma.`}}]}}},
{id:'wyciek',w:()=>3,k:'Serwer',t:'Wyciek z prywatnego kanału',dyn:1,
 build(){const o=pick(alive().filter(k=>k!==G.me));
  return {x:`Ktoś wrzucił na #ogólny screeny z prywatnego kanału <b>${G.p[o].n}</b>. Nie ty. Ale możesz to wykorzystać.`,
   o:[{l:'Nagłaśniam sprawę',s:'Sława +5, oni tracą, ale relacje siadają',f:p=>{p.fame=cl(p.fame+R(3,6));G.p[o].fame=cl(G.p[o].fame-R(4,8));G.p[o].cred=cl(G.p[o].cred-6);
       G.rel[G.me][o]=cl(G.rel[G.me][o]-20,-100,100);M(p,5);return `${G.p[o].ab} obrywa, ty zbierasz zasięgi.`}},
      {l:'Bronię ich publicznie',s:'Relacje +26, wiarygodność +5',f:p=>{G.rel[G.me][o]=cl(G.rel[G.me][o]+26,-100,100);G.rel[o][G.me]=cl(G.rel[o][G.me]+26,-100,100);p.cred=cl(p.cred+5);return `${G.p[o].lead} tego nie zapomni.`}},
      {l:'Nie mieszam się',s:',',f:()=>'Przeczekałeś.'}]}}},
{id:'boost',w:()=>3,k:'Serwer',t:'Fala boostów',
 x:'Serwer dostał poziom trzeci. Admini rozdają role, kanały żyją, wszyscy są w dobrym humorze.',
 o:[{l:'Fundujemy konkurs z naszej kasy',s:'−22 kapitału, sława i obecność wszędzie',f:p=>{if(G.kp<22)return 'Nie stać cię.';G.kp-=22;p.fame=cl(p.fame+R(4,8));REG.forEach(r=>p.pres[r.id]=cl(p.pres[r.id]+4));M(p,6);return 'Wasze logo przy każdej nagrodzie.'}},
    {l:'Przypisujemy sobie zasługę',s:'Sława +4, wiarygodność −5',f:p=>{p.fame=cl(p.fame+4);p.cred=cl(p.cred-5);p.ctr=cl(p.ctr+5);return 'Nikt nie zaprzeczył wystarczająco szybko.'}},
    {l:'Cieszymy się razem ze wszystkimi',s:'Aktywność +8',f:p=>{p.act=cl(p.act+8);p.uni=cl(p.uni+3);return 'Dobry tydzień.'}}]},
{id:'wojnaGrup',w:()=>4,k:'Serwer',t:'Wojna grup',dyn:1,
 build(){const a=pick(SID);let b=pick(SID);while(b===a)b=pick(SID);
  return {x:`Na #konstytucji wybuchła awantura: <b>${sn(a)}</b> kontra <b>${sn(b)}</b>. Trzeba się opowiedzieć albo udawać, że się nie widzi.`,
   o:[{l:`Staję po stronie: ${sn(a)}`,s:`Dopasowanie do nich +1,2, do drugich −0,8`,f:p=>{p.aff[a]+=1.2;p.aff[b]=Math.max(.1,p.aff[b]-.8);p.ctr=cl(p.ctr+6);return `${sn(a)} zapamiętają.`}},
      {l:`Staję po stronie: ${sn(b)}`,s:`Dopasowanie do nich +1,2, do pierwszych −0,8`,f:p=>{p.aff[b]+=1.2;p.aff[a]=Math.max(.1,p.aff[a]-.8);p.ctr=cl(p.ctr+6);return `${sn(b)} zapamiętają.`}},
      {l:'Apeluję o spokój',s:'Wiarygodność +6, pretensjonalność +6',f:p=>{p.cred=cl(p.cred+6);p.pret=cl(p.pret+6);return 'Nikt cię nie posłuchał, ale wyszedłeś na dorosłego.'}}]}}},
{id:'hejt',w:()=>me().fame>50?4:1,k:'Wizerunek',t:'Zorganizowana nagonka',
 x:'Na kilku kanałach naraz pojawiły się identyczne posty przeciwko tobie. Ktoś to koordynuje.',
 o:[{l:'Odpowiadam punkt po punkcie',s:'Wiarygodność +7, energia −13',f:p=>{p.cred=cl(p.cred+7);G.en=cl(G.en-13);p.pret=cl(p.pret+4);return 'Rzeczowo i nudno. Zadziałało.'}},
    {l:'Kontratak z grubej rury',s:'Sława +6, kontrowersja +14',f:p=>{p.fame=cl(p.fame+6);p.ctr=cl(p.ctr+14);p.cred=cl(p.cred-4);M(p,4);return 'Awantura przykryła nagonkę.'}},
    {l:'Milczę i czekam',s:'Sława −4, ale kontrowersja spada',f:p=>{p.fame=cl(p.fame-4);p.ctr=cl(p.ctr-8);return 'Po tygodniu ucichło.'}}]},
{id:'zdrada',w:()=>me().uni<52?4:1,k:'Wewnętrzne',t:'Ktoś gra na dwa fronty',dyn:1,
 build(){const o=pick(alive().filter(k=>k!==G.me));
  return {x:`Jeden z twoich ludzi od tygodni siedzi na kanale <b>${G.p[o].n}</b> i przekazuje im wszystko.`,
   o:[{l:'Wyrzucam bez rozgłosu',s:'−1 osoba, jedność +8',f:p=>{giveBackCap(p,1);p.uni=cl(p.uni+8);return 'Cicho i skutecznie.'}},
      {l:'Robię z tego publiczną aferę',s:'Sława +6, relacje z nimi −30',f:p=>{p.fame=cl(p.fame+6);p.ctr=cl(p.ctr+9);G.rel[G.me][o]=cl(G.rel[G.me][o]-30,-100,100);G.p[o].cred=cl(G.p[o].cred-6);return `${G.p[o].ab} wypiera się wszystkiego.`}},
      {l:'Zostawiam go i karmię fałszywkami',s:'Ryzykowne, ale może się opłacić',f:p=>{if(ch(.55)){G.p[o].act=cl(G.p[o].act-10);p.cred=cl(p.cred+3);M(p,5);return `${G.p[o].ab} podjął decyzje na podstawie twoich bzdur.`}p.uni=cl(p.uni-9);return 'Zorientowali się. Twoi ludzie też.'}}]}}},
{id:'sojusz',w:()=>3,k:'Dyplomacja',t:'Ktoś proponuje układ',dyn:1,
 build(){const c=alive().filter(k=>k!==G.me).sort((a,b)=>G.rel[b][G.me]-G.rel[a][G.me])[0];
  return {x:`<b>${G.p[c].lead}</b> pisze na priv: „Nie musimy się lubić, ale możemy sobie nie przeszkadzać przez kilka tygodni”.`,
   o:[{l:'Przyjmuję',s:'Pakt na 6 tygodni, relacje +18',f:p=>{p.pact[c]=G.week+6;G.rel[G.me][c]=cl(G.rel[G.me][c]+18,-100,100);G.rel[c][G.me]=cl(G.rel[c][G.me]+18,-100,100);return `Pakt z ${G.p[c].ab}.`}},
      {l:'Odmawiam i publikuję',s:'Sława +5, relacje −25',f:p=>{p.fame=cl(p.fame+5);p.ctr=cl(p.ctr+8);G.rel[G.me][c]=cl(G.rel[G.me][c]-25,-100,100);return 'Serwer się uśmiał. Oni nie.'}},
      {l:'Odmawiam grzecznie',s:'Relacje −5',f:p=>{G.rel[G.me][c]=cl(G.rel[G.me][c]-5,-100,100);return 'Bez awantury.'}}]}}},
{id:'mem',w:()=>3,k:'Serwer',t:'Twoja partia w memie',
 x:'Ktoś zrobił z waszego ostatniego posta szablon. Krąży po wszystkich kanałach. Nie jest złośliwy, na razie.',
 o:[{l:'Wchodzimy w to i robimy własne wersje',s:'Sława +7, pretensjonalność −8',f:p=>{p.fame=cl(p.fame+R(5,9));p.pret=cl(p.pret-8);p.aff.ser+=.5;M(p,6);return 'Wasz mem, wasze zasady.'}},
    {l:'Prosimy o usunięcie',s:'Wiarygodność +2, sława −5, memiarze się wściekają',f:p=>{p.cred=cl(p.cred+2);p.fame=cl(p.fame-5);p.aff.ser=Math.max(.1,p.aff.ser-.7);return 'Efekt odwrotny do zamierzonego.'}},
    {l:'Nie komentujemy',s:',',f:()=>'Mem sam wygasł po tygodniu.'}]},
{id:'awaria',w:()=>2,k:'Administracja',t:'Awaria serwera',
 x:'Discord leżał przez dwa dni. Kanały puste, kampanie zamrożone, wszyscy zaczynają od nowa.',
 o:[{l:'Odbudowujemy obecność natychmiast',s:'Energia −16, obecność wszędzie +12',f:p=>{G.en=cl(G.en-16);REG.forEach(r=>p.pres[r.id]=cl(p.pres[r.id]+5));return 'Byliście pierwsi po powrocie.'}},
    {l:'Korzystamy z przerwy',s:'Energia +26, obecność wszędzie −8',f:p=>{G.en=cl(G.en+26);REG.forEach(r=>p.pres[r.id]=cl(p.pres[r.id]-8));return 'Odpoczęliście.'}},
    {l:'Wrzucamy podsumowanie awarii',s:'Wiarygodność +5, pretensjonalność +4',f:p=>{p.cred=cl(p.cred+5);p.pret=cl(p.pret+4);return 'Nikt nie przeczytał, ale wygląda profesjonalnie.'}}]},
{id:'talent',w:()=>3,k:'Kadry',t:'Ktoś zdolny puka do drzwi',
 x:'Zgłosił się ktoś naprawdę ogarnięty. Chce działać, ale pyta, co z tego będzie miał.',
 o:[{l:'Obiecuję miejsce na liście',s:'+2 osoby, jedność −5',f:p=>{const gt=drawFrom('polityka',2);p.comp.eli+=gt.eli;p.comp.int+=gt.int;p.comp.ser+=gt.ser;p.mem+=gt.eli+gt.int+gt.ser;p.uni=cl(p.uni-5);return 'Przyszedł nie sam.'}},
    {l:'Podkupuję kogoś z cudzego zaplecza',s:'Ktoś realny zmienia barwy, relacje siadają',f:p=>{
      const donors=alive().filter(k=>k!==G.me&&G.p[k].bench.length>=2);
      if(!donors.length)return 'Nikt nie ma zaplecza do oddania.';
      const from=pick(donors), who=pick(G.p[from].bench);
      G.p[from].bench=G.p[from].bench.filter(x=>x!==who);p.bench.push(who);
      G.rel[G.me][from]=cl(G.rel[G.me][from]-18,-100,100);G.rel[from][G.me]=cl(G.rel[from][G.me]-18,-100,100);
      XP(8);return `<b>${who}</b> przechodzi z ${G.p[from].ab} do ciebie.`}},
    {l:'Nie mam nic do zaoferowania',s:'Doświadczenie +6',f:p=>{XP(6);p.cred=cl(p.cred+3);return 'Uczciwie. Poszedł gdzie indziej.'}}]},
{id:'delegal',w:()=>eliteRisk(me())>0&&me().ctr>72?9:0,k:'Administracja',t:'Wniosek o delegalizację partii',
 x:()=>`Na kanale administracyjnym pojawił się wniosek: ${me().n} to „klika kilku ludzi, która przejęła serwer”.
   Elita to ${Math.round(ratio(me(),'eli')*100)}% twojego składu, kontrowersja ${Math.round(me().ctr)}/100.
   Przy 96 partia wpada w paraliż: sondaż słabnie, kapitał ucieka, ludzie wychodzą.`,
 o:[{l:'Wypraszam część elity',s:'Tracisz najcenniejszych ludzi, kontrowersja mocno w dół',
     f:p=>{const q=purge(p,'eli',Math.max(1,Math.round(p.comp.eli*.4)));p.ctr=cl(p.ctr-22);p.uni=cl(p.uni-5);
       return `${q} ${pl(q,'osoba odchodzi','osoby odchodzą','osób odchodzi')} z elity. Kontrowersja −22.`}},
    {l:'Werbuję serwerowiczów na przeciwwagę',s:'Rozcieńcza skład, ale rozbija jedność',
     f:p=>{const gt=drawFrom('szitpost',RI(1,3));p.comp.ser+=gt.ser;p.mem+=gt.ser;p.ctr=cl(p.ctr-11);p.uni=cl(p.uni-9);
       return `${gt.ser} ${pl(gt.ser,'serwerowicz','serwerowiczów','serwerowiczów')} w partii. Skład rozcieńczony.`}},
    {l:'Odrzucam wniosek jako pomówienie',s:'Nic nie tracisz, ale kontrowersja rośnie dalej',
     f:p=>{p.ctr=cl(p.ctr+8);M(p,-4);return 'Wniosek odrzucony. Temat wróci.'}}]},
{id:'wypal',w:()=>G.en<24?9:0,k:'Kryzys',t:()=>`${me().lead} ma dość`,
 x:()=>`Trzeci tydzień bez przerwy. ${me().lead} pisze na kanale zarządu: „Serio zastanawiam się, czy mi się to jeszcze chce”.`,
 o:[{l:'Tydzień offline',s:'Energia +42, aktywność −8',f:p=>{G.en=cl(G.en+42);p.act=cl(p.act-8);return 'Partia dycha, kanały cichną.'}},
    {l:'Zaciskamy zęby',s:'Ryzyko: jedność i energia w dół',f:p=>{if(ch(.55)){p.uni=cl(p.uni-12);G.en=cl(G.en-8);return 'Ludzie widzą, że to już nie to.'}p.act=cl(p.act+5);return 'Dowozi. Doceniono.'}},
    {l:'Oddaję stery zastępcy',s:'Energia +58, sława −6',f:p=>{G.en=cl(G.en+58);p.fame=cl(p.fame-6);p.uni=cl(p.uni+5);return 'Zastępca przejmuje kampanię.'}}]},
{id:'bunt',w:()=>me().bench.length&&me().uni<42?7:0,k:'Wewnętrzne',t:'Ktoś podważa przewodnictwo',dyn:1,
 build(){const c=pick(me().bench),cur=lead(G.me),cand=L(c);
  return {x:`<b>${c}</b> zwołał zebranie bez wiedzy zarządu. Statystyki: charyzma ${cand.char}, kompetencja ${cand.komp}, autorytet ${cand.autor}. Obecny lider ${cur.n}: ${cur.char}/${cur.komp}/${cur.autor}.`,
   o:[{l:`Oddaję stery ${c}`,s:'Realna zmiana lidera, jedność +12, sława −3',
       f:p=>{const old=p.lead;p.lead=c;p.bench=p.bench.filter(x=>x!==c);G.useTerm.lider=1;
         if(!p.main.includes(old)&&!p.bench.includes(old))p.bench.push(old);
         p.uni=cl(p.uni+12);p.fame=cl(p.fame-3);G.en=cl(G.en+30);
         return `<b>${c}</b> obejmuje przewodnictwo.`}},
      {l:'Wyrzucam go z partii',s:'Jedność +8, tracisz zaplecze i ludzi',
       f:p=>{p.bench=p.bench.filter(x=>x!==c);p.uni=cl(p.uni+8);const q=giveBackCap(p,RI(1,3));const l=q.eli+q.int+q.ser;p.ctr=cl(p.ctr+7);
         return `${c} poza partią. Zabrał ${l} ${pl(l,'osobę','osoby','osób')}.`}},
      {l:'Udaję, że nic się nie stało',s:'Ryzyko rozłamu',
       f:p=>{if(ch(.5)){p.uni=cl(p.uni-14);const q=giveBackCap(p,Math.round(p.mem*.2));const l=q.eli+q.int+q.ser;
         return `<b>Rozłam.</b> ${c} odchodzi z ${l} ${pl(l,'osobą','osobami','osobami')}.`}p.uni=cl(p.uni+3);return 'Ucichło samo.'}}]}}},
{id:'rozlam',w:()=>me().uni<36?6:0,k:'Wewnętrzne',t:'Frakcja szykuje rozłam',
 x:'Grupa działaczy założyła prywatny kanał. Nazwali go „ratunek dla partii”. Ciebie tam nie ma.',
 o:[{l:'Negocjuję',s:'Jedność +12, rozmycie programu',f:p=>{p.uni=cl(p.uni+12);const t=topSeg(p);p.aff[t]=Math.max(.1,p.aff[t]-.6);return 'Dogadaliście się kosztem wyrazistości.'}},
    {l:'Wyrzucam prowodyrów',s:'Jedność +20, tracisz ludzi',f:p=>{const q=giveBackCap(p,Math.max(1,Math.round(p.mem*.18)));const l=q.eli+q.int+q.ser;p.uni=cl(p.uni+20);p.ctr=cl(p.ctr+8);return `${l} ${pl(l,'osoba','osoby','osób')} poza partią.`}},
    {l:'Ignoruję',s:'Ryzyko rozłamu, ale odejdą najwyżej dwie osoby',f:p=>{if(ch(.5)){const q=giveBackCap(p,Math.round(p.mem*.32));const l=q.eli+q.int+q.ser;p.uni=cl(p.uni-10);return `<b>Rozłam.</b> ${l} ${pl(l,'osoba odchodzi','osoby odchodzą','osób odchodzi')}.`}p.uni=cl(p.uni+4);return 'Frakcja rozeszła się sama.'}}]},
{id:'pret',w:()=>me().pret>60?7:0,k:'Wizerunek',t:'„Ale wy jesteście pretensjonalni”',
 x:'Ktoś wkleił wasz manifest na #ogólny z podpisem „normalnie ludzie tak nie piszą”. Czterdzieści reakcji, wszystkie z płaczącym emoji.',
 o:[{l:'Autoironiczny post',s:'Pretensjonalność −18',f:p=>{p.pret=cl(p.pret-18);p.cred=cl(p.cred-3);p.aff.ser+=.5;return 'Śmiejecie się z siebie pierwsi.'}},
    {l:'Bronię poziomu dyskusji',s:'Wiarygodność +6, pretensjonalność +8',f:p=>{p.cred=cl(p.cred+6);p.pret=cl(p.pret+8);p.aff.int+=.4;return 'Weterani przyklaskują, reszta przewraca oczami.'}},
    {l:'Milczę',s:'Sława −2',f:p=>{p.fame=cl(p.fame-2);return 'Temat ucichł po pięciu dniach.'}}]},
{id:'fala',w:()=>3,k:'Serwer',t:'Fala nowych userów',
 x:'Ktoś wrzucił zaproszenie na dużym serwerze. #brama pęka w szwach.',
 o:[{l:'Rzucam się na onboarding',s:'Serwer rośnie, obecność w #brama',f:p=>{if(PID.reduce((a,k)=>a+G.p[k].mem,0)+freeTot()<SERVER_MAX)G.free.ser+=RI(8,14);p.pres.brama=cl(p.pres.brama+9);p.aff.ser+=.6;G.en=cl(G.en-9);return 'Przygarnąłeś nowych pierwszy.'}},
    {l:'Zostawiam konkurencji',s:'Rosną inni',f:p=>{if(PID.reduce((a,k)=>a+G.p[k].mem,0)+freeTot()<SERVER_MAX)G.free.ser+=RI(8,14);alive().forEach(k=>{if(k!==G.me)G.p[k].pres.brama=cl(G.p[k].pres.brama+3)});return 'Nowi trafili gdzie indziej.'}},
    {l:'Powitalny mem',s:'Memiarze i nowi w górę',f:p=>{if(PID.reduce((a,k)=>a+G.p[k].mem,0)+freeTot()<SERVER_MAX)G.free.ser+=RI(6,11);p.aff.ser+=.5;p.cred=cl(p.cred-2);return 'Mem powitalny stał się klasyką.'}}]},
{id:'skandal',w:()=>me().ctr>55?6:2,k:'Skandal',t:'Twój działacz odjechał',
 x:'Członek partii napisał na #ogólnym coś, czego nie da się obronić. Screeny już krążą.',
 o:[{l:'Natychmiastowe wykluczenie',s:'Wiarygodność +5, −1 osoba',f:p=>{giveBackCap(p,1);p.cred=cl(p.cred+5);p.uni=cl(p.uni-6);return 'Szybka reakcja ucięła temat.'}},
    {l:'Bronię swojego',s:'Jedność +10, wiarygodność −9',f:p=>{p.uni=cl(p.uni+10);p.cred=cl(p.cred-9);p.ctr=cl(p.ctr+10);return 'Partia zwarła szyki.'}},
    {l:'Robię z tego mem',s:'Memiarze w górę',f:p=>{p.aff.ser+=.8;p.ctr=cl(p.ctr+10);p.fame=cl(p.fame+4);p.cred=cl(p.cred-4);return 'Skandal przerobiony na content.'}}]},
{id:'donacja',w:()=>3,k:'Okazja',t:'Ktoś chce zainwestować',
 x:'Zamożny (jak na warunki serwera) user oferuje wsparcie. Chce w zamian miejsce na liście.',
 o:[{l:'Biorę',s:'+26 kapitału, wiarygodność −4',f:p=>{G.kp+=26;p.cred=cl(p.cred-4);return 'Kasa na koncie.'}},
    {l:'Biorę, ale bez miejsca',s:'+12 kapitału',f:p=>{G.kp+=12;return 'Kompromis.'}},
    {l:'Odmawiam publicznie',s:'Wiarygodność +7, sława +3',f:p=>{p.cred=cl(p.cred+7);p.fame=cl(p.fame+3);return 'Odmowa nagłośniona.'}}]},
{id:'okreg',w:()=>4,k:'Okręg',t:'Lokalna afera',dyn:1,
 build(){const r=pick(REG);
  return {x:`W kanale <b>${r.n}</b> wybuchła awantura o moderację. Ludzie szukają, kto stanie po ich stronie.`,
   o:[{l:`Staję po stronie ${r.n}`,s:'Obecność +26, mody zapamiętają',f:p=>{p.pres[r.id]=cl(p.pres[r.id]+11);p.ctr=cl(p.ctr+7);p.cred=cl(p.cred-3);return `${r.n} cię zapamięta.`}},
      {l:'Staję po stronie modów',s:'Wiarygodność +6, obecność −10',f:p=>{p.cred=cl(p.cred+6);p.pres[r.id]=cl(p.pres[r.id]-10);return 'Porządek ponad popularność.'}},
      {l:'Mediuję',s:'Obecność +10, pretensjonalność +3',f:p=>{p.pres[r.id]=cl(p.pres[r.id]+10);p.cred=cl(p.cred+2);p.pret=cl(p.pret+3);return 'Wszyscy średnio zadowoleni.'}}]}}},
{id:'cisza',w:()=>me().act<30?5:0,k:'Wewnętrzne',t:'Cisza na kanałach',
 x:'Od pięciu dni nikt nic nie napisał na kanale partii. Nawet boty.',
 o:[{l:'Osobiste DM do każdego',s:'Aktywność +14, energia −14',f:p=>{p.act=cl(p.act+14);G.en=cl(G.en-14);return 'Ludzie wrócili. Na razie.'}},
    {l:'Konkurs z nagrodą',s:'−16 kapitału, aktywność +11',f:p=>{G.kp=Math.max(0,G.kp-16);p.act=cl(p.act+11);p.fame=cl(p.fame+2);return 'Kanał stanął na nogi.'}},
    {l:'Trudno',s:'Tracisz ludzi',f:p=>{p.act=cl(p.act-7);giveBackCap(p,RI(1,3));return 'Kilka osób po cichu wyszło.'}}]},
{id:'upadek',w:()=>3,k:'Rynek',t:'Partia w rozsypce',dyn:1,
 build(){const c=alive().filter(k=>k!==G.me&&G.p[k].uni<45).sort((a,b)=>G.p[a].uni-G.p[b].uni)[0];
  if(!c)return null;const o=G.p[c];
  return {x:`<b>${o.n}</b> rozpada się na oczach serwera. ${o.lead} nie panuje nad kanałem.`,
   o:[{l:'Otwieram drzwi',s:`+${Math.max(1,Math.round(o.mem*.2))} osób`,f:p=>{
      let n=Math.max(1,Math.round(o.mem*.2)),g=0;
      for(let i=0;i<n;i++){ if(o.mem<=1)break;
        const gr=o.comp.ser>0?'ser':o.comp.int>0?'int':o.comp.eli>0?'eli':null;
        if(!gr)break; o.comp[gr]--;o.mem--;p.comp[gr]++;p.mem++;g++; }
      p.uni=cl(p.uni-5);return `Przejmujesz ${g} ${pl(g,'osobę','osoby','osób')} od ${o.ab}.`}},
      {l:'Dobijam publicznie',s:'Relacje −25',f:p=>{o.fame=cl(o.fame-10);o.uni=cl(o.uni-8);G.rel[G.me][c]=cl(G.rel[G.me][c]-25,-100,100);p.ctr=cl(p.ctr+7);return `${o.ab} dostał w plecy.`}},
      {l:'Oferuję pomoc',s:'Relacje +30',f:p=>{G.rel[G.me][c]=cl(G.rel[G.me][c]+30,-100,100);G.rel[c][G.me]=cl(G.rel[c][G.me]+30,-100,100);p.cred=cl(p.cred+4);return `${o.lead} zapamięta.`}}]}}},
{id:'sonda',w:()=>G.week>4?4:0,k:'Media',t:'Serwerowy sondaż',
 x:'Ktoś zrobił ankietę na #konstytucji. Wyniki są... interesujące.',
 o:[{l:'Nagłaśniam',s:'Działa tylko, jeśli idziesz dobrze',f:p=>{const q=tally();const s=q.res[G.me].tot/q.total*100;
      if(s>10){p.fame=cl(p.fame+6);return `${fmt(s)}%, dobry wynik, dobrze rozegrany.`}
      p.fame=cl(p.fame-3);p.uni=cl(p.uni-5);return `${fmt(s)}%. Nagłośniłeś własną słabość.`}},
    {l:'Podważam metodologię',s:'Pretensjonalność +7',f:p=>{p.pret=cl(p.pret+7);p.cred=cl(p.cred+3);return 'Napisałeś akapit o próbie badawczej. Na Discordzie.'}},
    {l:'Ignoruję',s:',',f:()=>'Sondaż przeszedł bez echa.'}]},
{id:'wielka',w:()=>G.week>3?4:0,k:'Wydarzenie',t:'Wielka debata serwerowa',
 x:()=>`Admini organizują debatę wszystkich liderów. ${me().lead} musi się pokazać.`,
 o:[{l:'Idę przygotowany',s:'Energia −16, zysk zależny od kompetencji lidera',f:p=>{G.en=cl(G.en-16);
      if(lead(G.me).komp>58){p.fame=cl(p.fame+9);p.cred=cl(p.cred+4);return `${p.lead} wypadł najlepiej ze wszystkich.`}
      p.fame=cl(p.fame+3);p.cred=cl(p.cred-2);return 'Przetrwał. Bez fajerwerków.'}},
    {l:'Idę na żywioł',s:'Viral albo kompromitacja',f:p=>{if(ch(cl(.25+lead(G.me).char/220,.2,.7))){p.fame=cl(p.fame+11);p.ctr=cl(p.ctr+9);p.aff.ser+=.5;return 'Improwizacja poszła viralem.'}p.fame=cl(p.fame-4);p.cred=cl(p.cred-7);return 'Zabrakło argumentów w połowie zdania.'}},
    {l:'Nie idę',s:'Sława −6, energia +8',f:p=>{p.fame=cl(p.fame-6);G.en=cl(G.en+8);return 'Nieobecność była tematem debaty.'}}]},
{id:'kryzKoal',w:()=>inGov()&&G.gov.parties.length>1?5:0,k:'Rząd',t:'Kryzys w koalicji',dyn:1,
 build(){if(!G.gov||!G.gov.parties)return null;
  const o=G.gov.parties.filter(k=>k!==G.me);if(!o.length)return null;const c=pick(o);
  return {x:`<b>${G.p[c].lead}</b> (${G.p[c].ab}) grozi wyjściem z rządu. Poparcie rządu: ${Math.round(G.gov.appr)}.`,
   o:[{l:'Ustępuję',s:'Relacje +20, poparcie −6',f:p=>{G.rel[G.me][c]=cl(G.rel[G.me][c]+20,-100,100);G.rel[c][G.me]=cl(G.rel[c][G.me]+20,-100,100);APPR(-6);return 'Koalicja trzyma się kupy.'}},
      {l:'Odmawiam',s:'Przy złych relacjach koalicja może pęknąć, a to oznacza wybory',
       f:p=>{G.rel[G.me][c]=cl(G.rel[G.me][c]-22,-100,100);
        const risk=cl(.10+(0-G.rel[c][G.me])/240+(50-G.gov.appr)/300,.05,.55);
        if(ch(risk)){const ab=G.p[c].ab;govLeave(c);return `${ab} trzasnął drzwiami (szansa była ${Math.round(risk*100)}%).`}
        APPR(+3);return `Blefowali (ryzyko ${Math.round(risk*100)}%). Zostają.`}},
      {l:'Wyrzucam ich pierwszy',s:'Jeśli koalicja straci większość, parlament zostaje rozwiązany',
       f:p=>{const ab=G.p[c].ab;govLeave(c);G.rel[G.me][c]=-60;G.rel[c][G.me]=-60;
        if(G.gov){APPR(+5);p.fame=cl(p.fame+4);return `${ab} poza rządem, większość utrzymana.`}
        return `${ab} poza rządem, i rząd runął razem z nim.`}}]}}},
{id:'prezKonf',w:()=>G.gov&&G.prez&&!G.gov.parties.includes(G.prez.party)&&inGov()?4:0,k:'Pałac',t:'Prezydent kontra rząd',dyn:1,
 build(){if(!G.gov||!G.prez)return null; return {x:`Prezydent <b>${G.prez.lead}</b> (${G.p[G.prez.party].ab}) publicznie skrytykował rząd i zapowiada weto.`,
   o:[{l:'Idę na wojnę',s:'Poparcie −5, sława +4',f:p=>{APPR(-5);p.fame=cl(p.fame+4);
       G.rel[G.me][G.prez.party]=cl(G.rel[G.me][G.prez.party]-20,-100,100);return 'Konflikt eskaluje.'}},
      {l:'Szukam kompromisu',s:'Relacje +18, poparcie +3',f:p=>{G.rel[G.me][G.prez.party]=cl(G.rel[G.me][G.prez.party]+18,-100,100);
       G.rel[G.prez.party][G.me]=cl(G.rel[G.prez.party][G.me]+18,-100,100);APPR(+3);p.pret=cl(p.pret+3);return 'Napięcie zdjęte.'}},
      {l:'Ignoruję pałac',s:'Poparcie −2',f:p=>{APPR(-2);return 'Milczenie odczytano jako słabość.'}}]}}},
];
