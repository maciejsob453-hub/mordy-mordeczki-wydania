'use strict';
/* ═══════════════════════════════════════════════════════════════════════════
   KREATOR SCENARIUSZY V2
   Stary formularz zostaje wyżej wyłącznie jako czytelna historia przebudowy.
   Te definicje są celowo ostatnie: kreator ma tworzyć kompletny stan świata,
   a nie luźną listę premii, z której może wyjść Sejm mający więcej niż 40 miejsc.
   ═══════════════════════════════════════════════════════════════════════════ */
const KRE2_POLA=[
  ['fame','Sława',-40,40,0],['cred','Wiarygodność',-40,40,0],
  ['uni','Jedność',-40,40,0],['act','Aktywność',-40,40,0],
  ['ctr','Kontrowersja',-40,40,0],['skladProc','Liczebność partii (%)',-60,60,0],
  ['obecnosc','Obecność w kanałach',-40,40,0],
];
const KRE2_OGOLNE=[
  ['kapital','Kapitał prowadzonej partii',-26,400,0],
  ['akcje','Liczba akcji na tydzień',-2,3,0],
  ['tygodni','Długość kadencji',4,24,12],
  ['krolPrzychylnosc','Przychylność Króla',-40,40,0],
];
const KRE2_PARTIA=[
  ['fame','Sława',-60,60],['cred','Wiarygodność',-60,60],
  ['uni','Jedność',-60,60],['act','Aktywność',-60,60],
  ['ctr','Kontrowersja',-60,60],['pret','Pretensjonalność',-60,60],
  ['pot','Sufit rozwoju',-40,60],
];
const KRE_NOWA_STAT=[['fame','Sława',0,100],['cred','Wiarygodność',0,100],['uni','Jedność',0,100],['act','Aktywność',0,100],['ctr','Kontrowersja',0,100],['pret','Pretensjonalność',0,100],['pot','Sufit rozwoju',10,160]];
const KRE_LIDER_STAT=[['0','Charyzma'],['1','Kompetencja'],['2','Wytrzymałość'],['3','Autorytet']];
const KRE2_KROKI=[
  ['Tożsamość','Nazwa i opowieść'],['Partie','Nowe i istniejące ugrupowania'],
  ['Sejm','Dokładnie 40 mandatów'],['Relacje','Sojusze i wrogowie'],
  ['AI 2.0','Charakter każdej partii'],['Wydarzenia','Własna historia kampanii'],
  ['Cele','Własne drogi rozwoju'],['Świat','Władza, media i gospodarka'],['Finał','Kontrola i uruchomienie'],
];
const KRE2_TRUDNOSCI=['Spokojny','Standard','Trudny','Brutalny','Eksperymentalny'];
const KRE2_RZAD0=['NP','FD','DPD','PLR','POJ','NBR','SS','PP'];
const KRE2_NAZWY={fame:'sława',cred:'wiarygodność',uni:'jedność',act:'aktywność',
  ctr:'kontrowersja',pret:'pretensjonalność',pot:'sufit rozwoju'};
const kre2BazoweMandaty=()=>Object.fromEntries(krePartieLista().map(k=>[k,START_SEATS[k]||0]));

function openKreator(){
  KRE={krok:0,nazwa:'',opis:'',trudnosc:'Standard',autor:'',ef:{},partie:{},wybrana:'PPP',
    mandaty:kre2BazoweMandaty(),mandatyZm:false,rzadTryb:'zastany',rzadPartie:KRE2_RZAD0.slice(),
    premier:'NP',premierOsoba:null,prezTryb:'zastany',prezydent:'KK',prezydentOsoba:null,relacje:'zastane',nowe:[],cele:[],seq:0,celWybrany:0,
    edycje:{},ai:{},wydarzenia:[],wydSel:0,relA:'PPP',relB:'KK',
    swiat:{relacje:{},bank:{},media:{},obecnosc:{},majatekMnoznik:100,ustawy:[]}};
  KRE2_POLA.concat(KRE2_OGOLNE).forEach(([k,,,,dom])=>KRE.ef[k]=dom);
  kreatorRys();
}
function kreSet(k,v){if(KRE){KRE[k]=v;kreatorRys()}}
function kreEf(k,v){if(KRE){KRE.ef[k]=Math.round(+v||0);kreatorRys()}}
function krePartia(k){if(KRE){KRE.wybrana=k;if(!KRE.partie[k])KRE.partie[k]={};kreatorRys()}}
/* Lista osób jest częścią scenariusza, nie tylko ozdobą kafla partii. Dzięki
   temu autor może wskazać konkretnego premiera, prezydenta albo człowieka z
   zaplecza — także w nowej partii bez rozgrywki w tle. */
function kreOsobyPartii(k){
  const x=kreNowaZnajdz(k);
  if(x)return [...new Set([x.lider,...String(x.zaplecze||'').split(',').map(s=>s.trim()).filter(Boolean)])];
  const l=LP[k]||{};return [...new Set([...(l.main||[]),...(l.bench||[])].filter(Boolean))];
}
function kreOsoba(k,n){if(!KRE)return;const osoby=kreOsobyPartii(k);if(!osoby.includes(n))n=osoby[0]||null;
  if(KRE.premier===k)KRE.premierOsoba=n;if(KRE.prezydent===k)KRE.prezydentOsoba=n;kreatorRys()}
function kreZapleczeDodaj(k){const x=kreNowaZnajdz(k);if(!x)return;const lista=String(x.zaplecze||'').split(',').map(s=>s.trim()).filter(Boolean);lista.push(`Działacz ${lista.length+1}`);x.zaplecze=lista.join(', ');kreatorRys()}
function kreZapleczeUsun(k){const x=kreNowaZnajdz(k);if(!x)return;const lista=String(x.zaplecze||'').split(',').map(s=>s.trim()).filter(Boolean);lista.pop();x.zaplecze=lista.join(', ');kreatorRys()}
function krePole(k,pole,v){
  if(!KRE)return;if(!KRE.partie[k])KRE.partie[k]={};
  const n=Math.round(+v||0);if(n)KRE.partie[k][pole]=n;else delete KRE.partie[k][pole];kreatorRys();
}
function kreWyczysc(k){if(KRE){delete KRE.partie[k];kreatorRys()}}
function kreNowaPartia(){
  if(!KRE||KRE.nowe.length>=8)return;
  const nr=++KRE.seq,id='SCP'+nr,kol=['#3f6fa8','#8c4771','#497b54','#a45a38','#69529b','#a58a34'][((nr-1)%6)];
  KRE.nowe.push({id,nazwa:'Nowa partia '+nr,ab:'P'+nr,c:kol,founded:'01.08.2026',lider:'Nowy lider '+nr,zaplecze:'',
    opis:'Nowe ugrupowanie utworzone przez autora scenariusza.',slabosc:'Nie ma jeszcze politycznej historii.',logo:'',diff:3,
    stat:{fame:35,cred:50,uni:60,act:50,ctr:18,pret:30,pot:80},comp:{eli:1,int:3,ser:12},aff:{eli:4,int:5,ser:6},liderStat:[55,55,55,55]});
  KRE.mandaty[id]=0;KRE.partie[id]={};KRE.ai[id]={typ:'oportunista',agresja:55,rozwoj:62,media:70,prawo:62,koalicje:76,ryzyko:82};KRE.wybrana=id;KRE.mandatyZm=true;kreatorRys();
}
function kreUsunPartie(id){
  if(!KRE||!kreNowaZnajdz(id))return;KRE.nowe=KRE.nowe.filter(x=>x.id!==id);delete KRE.mandaty[id];delete KRE.partie[id];
  delete KRE.ai[id];delete KRE.swiat.bank[id];delete KRE.swiat.media[id];delete KRE.swiat.obecnosc[id];Object.keys(KRE.swiat.relacje).filter(x=>x.split('|').includes(id)).forEach(x=>delete KRE.swiat.relacje[x]);
  KRE.rzadPartie=KRE.rzadPartie.filter(k=>k!==id);KRE.cele=KRE.cele.filter(c=>c.party!==id);
  if(KRE.premier===id)KRE.premier=KRE.rzadPartie[0]||null;if(KRE.prezydent===id)KRE.prezydent='KK';
  KRE.wybrana=krePartieLista()[0]||null;KRE.mandatyZm=true;kreatorRys();
}
function kreNowaPole(id,pole,v,rysuj){
  const x=kreNowaZnajdz(id);if(!x)return;
  if(pole.startsWith('stat.'))x.stat[pole.slice(5)]=Math.round(+v||0);
  else if(pole.startsWith('comp.'))x.comp[pole.slice(5)]=Math.max(0,Math.round(+v||0));
  else if(pole.startsWith('aff.'))x.aff[pole.slice(4)]=cl(Math.round(+v||1),1,9);
  else if(pole.startsWith('lider.'))x.liderStat[+pole.slice(6)]=cl(Math.round(+v||50),1,99);
  else if(['diff'].includes(pole))x[pole]=cl(Math.round(+v||1),1,5);
  else x[pole]=String(v||'').slice(0,pole==='opis'||pole==='slabosc'?180:42);
  if(rysuj)kreatorRys();
}
function kreNowaLogo(inp,id){
  const x=kreNowaZnajdz(id),f=inp&&inp.files&&inp.files[0];if(!x||!f)return;
  const rd=new FileReader();rd.onload=()=>{const im=new Image();im.onload=()=>{const cv=document.createElement('canvas'),sc=Math.min(1,160/Math.max(im.width,im.height));
    cv.width=Math.max(1,Math.round(im.width*sc));cv.height=Math.max(1,Math.round(im.height*sc));cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);
    x.logo=cv.toDataURL('image/webp',.78);kreatorRys()};im.src=rd.result};rd.readAsDataURL(f);
}
function kreCelDodaj(){
  if(!KRE||KRE.cele.length>=12)return;const party=KRE.wybrana||krePartieLista()[0],nr=KRE.cele.length+1;
  KRE.cele.push({id:'CEL'+(++KRE.seq),party,nazwa:'Własny cel '+nr,opis:'Opisz, do czego partia ma dojść i dlaczego zmienia to jej historię.',
    war:{mem:25,seats:4,fame:0,cred:0,uni:0,act:0,ctrMax:0,term:1,kp:0,poll:0,urzad:'brak'},
    nagroda:{fame:8,cred:4,uni:6,act:4,kp:40,mem:0,ap:0,nazwa:'',ab:'',c:''}});KRE.celWybrany=KRE.cele.length-1;kreatorRys();
}
function kreCelUsun(i){if(!KRE)return;KRE.cele.splice(i,1);KRE.celWybrany=Math.max(0,Math.min(KRE.celWybrany,KRE.cele.length-1));kreatorRys()}
function kreCelWybierz(i){if(KRE){KRE.celWybrany=cl(Math.round(+i||0),0,Math.max(0,KRE.cele.length-1));kreatorRys()}}
function kreCelPole(i,grupa,pole,v,rysuj){
  const c=KRE&&KRE.cele[i];if(!c)return;const o=grupa?c[grupa]:c;
  if(grupa)o[pole]=pole==='urzad'||['nazwa','ab','c'].includes(pole)?String(v||''):Math.max(0,Math.round(+v||0));else o[pole]=String(v||'').slice(0,pole==='opis'?300:70);
  if(rysuj)kreatorRys();
}
function kreMeta(k){
  if(!KRE||kreNowaZnajdz(k))return null;if(!KRE.edycje[k]){const b=BASE[k],lider=LP[k]&&LP[k].main[0];KRE.edycje[k]={nazwa:b.n,ab:b.ab,c:b.c,opis:b.blurb||'',slabosc:b.flaw||'',logo:'',lider,liderStat:(LEAD[lider]||[50,50,50,50]).slice()}}return KRE.edycje[k];
}
function kreMetaPole(k,pole,v,rysuj){const e=kreMeta(k);if(!e)return;if(pole.startsWith('lider.'))e.liderStat[+pole.slice(6)]=cl(Math.round(+v||50),1,99);else e[pole]=String(v||'').slice(0,pole==='opis'||pole==='slabosc'?180:42);if(rysuj)kreatorRys()}
function kreMetaReset(k){if(KRE){delete KRE.edycje[k];kreatorRys()}}
function kreMetaLogo(inp,k){const e=kreMeta(k),f=inp&&inp.files&&inp.files[0];if(!e||!f)return;const rd=new FileReader();rd.onload=()=>{const im=new Image();im.onload=()=>{const cv=document.createElement('canvas'),sc=Math.min(1,160/Math.max(im.width,im.height));cv.width=Math.max(1,Math.round(im.width*sc));cv.height=Math.max(1,Math.round(im.height*sc));cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);e.logo=cv.toDataURL('image/webp',.78);kreatorRys()};im.src=rd.result};rd.readAsDataURL(f)}
function kreAiGet(k){
  if(!KRE.ai[k]){const h=CHAR[k]||{},v=x=>Math.round((h[x]??AI_STYLE.domyslny[x])*100);KRE.ai[k]={typ:'domyslny',agresja:v('agr'),rozwoj:v('bud'),media:55,prawo:55,koalicje:55,ryzyko:50}}return KRE.ai[k];
}
function kreAiPole(k,pole,v,rysuj){const a=kreAiGet(k);if(pole==='typ'){a.typ=String(v);const s=AI_STYLE[a.typ]||AI_STYLE.domyslny;a.agresja=Math.round(s.agr*100);a.rozwoj=Math.round(s.bud*100);a.media=Math.round(s.media*100);a.prawo=Math.round(s.prawo*100);a.koalicje=Math.round(s.koalicje*100);a.ryzyko=Math.round(s.ryzyko*100)}else a[pole]=cl(Math.round(+v||0),0,100);if(rysuj)kreatorRys()}
function kreRelUstaw(a,b,v){if(!KRE||!a||!b||a===b)return;const key=[a,b].sort().join('|');KRE.swiat.relacje[key]=cl(Math.round(+v||0),-100,100);kreatorRys()}
function kreRelUsun(key){if(KRE){delete KRE.swiat.relacje[key];kreatorRys()}}
function kreSwiatPole(grupa,k,v){if(!KRE)return;if(grupa==='ustawy'){const i=KRE.swiat.ustawy.indexOf(k);if(i>=0)KRE.swiat.ustawy.splice(i,1);else KRE.swiat.ustawy.push(k)}else if(grupa)KRE.swiat[grupa][k]=Math.round(+v||0);else KRE.swiat[k]=Math.round(+v||0);kreatorRys()}
function kreObecnosc(k,r,v,rysuj){if(!KRE)return;if(!KRE.swiat.obecnosc[k])KRE.swiat.obecnosc[k]={};KRE.swiat.obecnosc[k][r]=cl(Math.round(+v||0),0,100);if(rysuj)kreatorRys()}
const KRE_WZORY_WYDARZEN={
  afera:{kategoria:'Afera',nazwa:'Wyciek z kanału',opis:'Ktoś wrzucił do sieci fragment rozmowy. Serwer żąda reakcji.',war:{odTygodnia:2},opcje:[
    {nazwa:'Pokaż kulisy',opis:'Więcej wiarygodności, ale tracisz twarz.',ai:{agresja:0,ryzyko:-1,media:0,prawo:1,koalicje:0,rozwoj:1},efekty:{fame:-2,cred:5,uni:0,act:0,ctr:0,mem:0,kapital:0,obecnosc:0,rel:0,relPartia:''}},
    {nazwa:'Idź w zaparte',opis:'Zyskujesz rozgłos, gdy afera nie przygaśnie.',ai:{agresja:2,ryzyko:2,media:1,prawo:0,koalicje:0,rozwoj:0},efekty:{fame:7,cred:-4,uni:0,act:0,ctr:6,mem:0,kapital:0,obecnosc:0,rel:0,relPartia:''}}
  ]},
  kryzys:{kategoria:'Kryzys',nazwa:'Pęka koalicja',opis:'Koalicjant grozi odejściem. Trzeba wybrać cenę spokoju.',war:{odTygodnia:3},opcje:[
    {nazwa:'Oddaj im resort',opis:'Rząd trwa, ale twoja partia słabnie.',ai:{agresja:0,ryzyko:-1,media:0,prawo:0,koalicje:2,rozwoj:0},efekty:{fame:0,cred:4,uni:-2,act:0,ctr:0,mem:0,kapital:-10,obecnosc:0,rel:0,relPartia:''}},
    {nazwa:'Zaryzykuj nowe wybory',opis:'Możesz wygrać albo rozpętać chaos.',ai:{agresja:2,ryzyko:2,media:0,prawo:0,koalicje:-1,rozwoj:0},efekty:{fame:5,cred:0,uni:0,act:0,ctr:8,mem:0,kapital:0,obecnosc:0,rel:-8,relPartia:''}}
  ]},
  media:{kategoria:'Media',nazwa:'Wielki wywiad',opis:'Redakcja daje ci pierwszą stronę i oczekuje jasnej deklaracji.',war:{odTygodnia:1},opcje:[
    {nazwa:'Mów o konkretach',opis:'Spokojna odpowiedź buduje zaufanie.',ai:{agresja:0,ryzyko:0,media:1,prawo:1,koalicje:0,rozwoj:2},efekty:{fame:0,cred:6,uni:0,act:3,ctr:0,mem:0,kapital:0,obecnosc:0,rel:0,relPartia:''}},
    {nazwa:'Zrób show',opis:'Serwer zapamięta wystąpienie, ale nie każdy je polubi.',ai:{agresja:1,ryzyko:2,media:2,prawo:0,koalicje:0,rozwoj:0},efekty:{fame:10,cred:-2,uni:0,act:0,ctr:4,mem:0,kapital:0,obecnosc:0,rel:0,relPartia:''}}
  ]}
};
function kreWydSzablon(typ){const s=KRE_WZORY_WYDARZEN[typ];return s?JSON.parse(JSON.stringify(s)):null}
function kreWydDodaj(typ){
  if(typ){
    if(!KRE||KRE.wydarzenia.length>=24)return;
    const nr=KRE.wydarzenia.length+1,id='EV'+(++KRE.seq),sz=kreWydSzablon(typ);
    const e=sz||{nazwa:'Nowe wydarzenie '+nr,kategoria:'Wydarzenie scenariusza',opis:'Opisz sytuację, przed którą staje partia.',party:'gracz',opcje:[]};
    e.id=id;e.party=e.party||'gracz';e.war=Object.assign({term:0,week:0,odTygodnia:0,coIle:0,przerwa:0,powtarzalne:false,minMandaty:0,maxMandaty:0,minSlawa:0,maxKontrowersja:0,urzad:'brak',poWydarzeniu:'',poTygodniach:0,poOpcji:''},e.war||{});
    e.opcje=(e.opcje&&e.opcje.length?e.opcje:[{nazwa:'Podejmuję ryzyko',opis:'Odważna odpowiedź.',ai:{},efekty:{}},{nazwa:'Gram bezpiecznie',opis:'Ostrożna odpowiedź.',ai:{},efekty:{}}]).map((o,j)=>Object.assign({id:'O'+(j+1)},o));
    KRE.wydarzenia.push(e);KRE.wydSel=KRE.wydarzenia.length-1;kreatorRys();return;
  }
  if(!KRE||KRE.wydarzenia.length>=24)return;const nr=KRE.wydarzenia.length+1,id='EV'+(++KRE.seq);KRE.wydarzenia.push({id,nazwa:'Nowe wydarzenie '+nr,kategoria:'Wydarzenie scenariusza',opis:'Opisz sytuację, przed którą staje partia.',party:'gracz',war:{term:0,week:0,odTygodnia:0,coIle:0,przerwa:0,powtarzalne:false,minMandaty:0,maxMandaty:0,minSlawa:0,maxKontrowersja:0,urzad:'brak'},opcje:[{nazwa:'Podejmuję ryzyko',opis:'Odważna odpowiedź.',ai:{agresja:1,ryzyko:1,media:0,prawo:0,koalicje:0,rozwoj:0},efekty:{fame:6,cred:0,uni:0,act:3,ctr:5,mem:0,kapital:0,obecnosc:0,rel:0,relPartia:''}},{nazwa:'Gram bezpiecznie',opis:'Ostrożna odpowiedź.',ai:{agresja:0,ryzyko:-1,media:0,prawo:0,koalicje:1,rozwoj:1},efekty:{fame:0,cred:4,uni:3,act:0,ctr:-2,mem:0,kapital:0,obecnosc:0,rel:0,relPartia:''}}]});KRE.wydSel=KRE.wydarzenia.length-1;kreatorRys();
}
function kreWydDuplikuj(i){
  if(!KRE||!KRE.wydarzenia[i]||KRE.wydarzenia.length>=24)return;
  const e=JSON.parse(JSON.stringify(KRE.wydarzenia[i]));e.id='EV'+(++KRE.seq);e.nazwa=(e.nazwa||'Wydarzenie')+' — kopia';
  KRE.wydarzenia.push(e);KRE.wydSel=KRE.wydarzenia.length-1;kreatorRys();
}
function kreWydWybierz(i){if(KRE){KRE.wydSel=cl(Math.round(+i||0),0,Math.max(0,KRE.wydarzenia.length-1));kreatorRys()}}
function kreWydUsun(i){if(KRE){const id=KRE.wydarzenia[i]?.id;KRE.wydarzenia.splice(i,1);KRE.wydarzenia.forEach(x=>{if(x.war?.poWydarzeniu===id){x.war.poWydarzeniu='';x.war.poOpcji=''}});KRE.wydSel=cl(KRE.wydSel,0,Math.max(0,KRE.wydarzenia.length-1));kreatorRys()}}
function kreWydPole(i,grupa,pole,v,rysuj){const e=KRE&&KRE.wydarzenia[i];if(!e)return;const o=grupa?e[grupa]:e;if(grupa==='war')o[pole]=['urzad','poWydarzeniu','poOpcji'].includes(pole)?String(v||''):pole==='powtarzalne'?!!v:Math.max(0,Math.round(+v||0));else o[pole]=String(v||'').slice(0,pole==='opis'?500:80);if(rysuj)kreatorRys()}
function kreWydOpcjaDodaj(i){const e=KRE&&KRE.wydarzenia[i];if(!e||e.opcje.length>=4)return;e.opcje.push({id:'O'+(e.opcje.length+1),nazwa:'Nowa odpowiedź',opis:'',ai:{agresja:0,ryzyko:0,media:0,prawo:0,koalicje:0,rozwoj:0},efekty:{fame:0,cred:0,uni:0,act:0,ctr:0,mem:0,kapital:0,obecnosc:0,rel:0,relPartia:''}});kreatorRys()}
function kreWydOpcjaUsun(i,j){const e=KRE&&KRE.wydarzenia[i];if(e&&e.opcje.length>1){e.opcje.splice(j,1);kreatorRys()}}
function kreWydOpcjaPole(i,j,grupa,pole,v,rysuj){const o=KRE&&KRE.wydarzenia[i]&&KRE.wydarzenia[i].opcje[j];if(!o)return;const x=grupa?o[grupa]:o;if(grupa==='ai'||grupa==='efekty'){if(['relPartia','nazwa','ab','c','ustawa'].includes(pole))x[pole]=String(v||'');else if(['zmienLidera','ustawaWlacz'].includes(pole))x[pole]=!!v;else x[pole]=Math.round(+v||0)}else x[pole]=String(v||'').slice(0,pole==='opis'?180:70);if(rysuj)kreatorRys()}
const kre2SumaMandatow=()=>Object.values(KRE.mandaty).reduce((a,n)=>a+(+n||0),0);
const kre2PulaMandatow=()=>TOTAL_SEATS-kre2SumaMandatow();
function kreMandat(k,d){
  if(!KRE||!KRE.mandaty.hasOwnProperty(k))return;
  if(d<0&&KRE.mandaty[k]>0){KRE.mandaty[k]--;KRE.mandatyZm=true}
  if(d>0&&kre2PulaMandatow()>0){KRE.mandaty[k]++;KRE.mandatyZm=true}
  kreatorRys();
}
function kreResetMandaty(){if(KRE){KRE.mandaty=kre2BazoweMandaty();KRE.mandatyZm=false;kreatorRys()}}
function krePreset(id){
  if(!KRE)return;
  const p={reset:{},spokoj:{fame:8,cred:8,uni:12,act:6,ctr:-12},
    kryzys:{fame:-12,cred:-15,uni:-18,act:-10,ctr:22,skladProc:-30,obecnosc:-12},
    wrzenie:{fame:10,cred:-8,uni:-15,act:18,ctr:28,obecnosc:12}}[id]||{};
  KRE2_POLA.forEach(([k,,,,dom])=>KRE.ef[k]=p[k]!=null?p[k]:dom);kreatorRys();
}
function kreRzadTryb(v){if(KRE){KRE.rzadTryb=v;kreatorRys()}}
function kreRzadTog(k){
  if(!KRE||!KRE.mandaty[k])return;
  const i=KRE.rzadPartie.indexOf(k);if(i>=0)KRE.rzadPartie.splice(i,1);else KRE.rzadPartie.push(k);
  if(!KRE.rzadPartie.includes(KRE.premier))KRE.premier=KRE.rzadPartie[0]||null;
  if(KRE.premier)KRE.premierOsoba=kreOsobyPartii(KRE.premier)[0]||null;kreatorRys();
}
function krePremier(k){if(KRE&&KRE.rzadPartie.includes(k)){KRE.premier=k;KRE.premierOsoba=kreOsobyPartii(k)[0]||null;kreatorRys()}}
function krePremierOsoba(n){if(KRE&&KRE.premier){KRE.premierOsoba=String(n||'')||kreOsobyPartii(KRE.premier)[0]||null;kreatorRys()}}
function krePrezydentTryb(v){if(KRE){KRE.prezTryb=v;kreatorRys()}}
function krePrezydent(k){if(KRE){KRE.prezydent=k;KRE.prezydentOsoba=kreOsobyPartii(k)[0]||null;kreatorRys()}}
function krePrezydentOsoba(n){if(KRE&&KRE.prezydent){KRE.prezydentOsoba=String(n||'')||kreOsobyPartii(KRE.prezydent)[0]||null;kreatorRys()}}
function kreRelacje(v){if(KRE){KRE.relacje=v;kreatorRys()}}
function kreKrok(n){if(KRE){kreCzytaj();KRE.krok=cl(Math.round(n),0,KRE2_KROKI.length-1);kreatorRys()}}
function kreDalej(d){kreKrok(KRE.krok+d)}
function kre2StatFinal(k,pole){
  const p=krePartiaDane(k)||{};
  const max=pole==='pot'?200:100;
  return Math.round(cl((+p[pole]||0)+(+KRE.ef[pole]||0)+(+((KRE.partie[k]||{})[pole])||0),0,max));
}
function kre2RzadMandaty(){return KRE.rzadPartie.reduce((a,k)=>a+(KRE.mandaty[k]||0),0)}
function kre2MaZmiany(){
  return KRE.mandatyZm||KRE.rzadTryb!=='zastany'||KRE.prezTryb!=='zastany'||KRE.relacje!=='zastane'||
    KRE.nowe.length>0||KRE.cele.length>0||KRE.wydarzenia.length>0||Object.keys(KRE.edycje).length>0||Object.keys(KRE.swiat.relacje).length>0||
    KRE.swiat.majatekMnoznik!==100||Object.keys(KRE.swiat.bank).length>0||Object.keys(KRE.swiat.media).length>0||Object.keys(KRE.swiat.obecnosc).length>0||KRE.swiat.ustawy.length>0||
    KRE2_POLA.concat(KRE2_OGOLNE).some(([k,,,,d])=>KRE.ef[k]!==d)||
    Object.keys(KRE.partie).some(k=>kreIleZmian(k));
}
function kre2WalidacjaWydarzen(){
  const out=[],ev=Array.isArray(KRE?.wydarzenia)?KRE.wydarzenia:[],byId=new Map(),dupy=new Set(),cykle=new Set(),nierealne=new Set();
  const dodaj=(blok,t)=>out.push({blok,krok:5,t});
  ev.forEach((e,i)=>{const id=String(e.id||'').trim();if(!id)dodaj(1,`Wydarzenie „${e.nazwa||'bez nazwy'}” nie ma identyfikatora.`);else if(byId.has(id)){dupy.add(id);dodaj(1,`Identyfikator wydarzenia „${id}” powtarza się.`)}else byId.set(id,e)});
  ev.forEach(e=>{
    const n=e.nazwa||'bez nazwy',w=e.war||{},minM=+w.minMandaty||0,maxM=+w.maxMandaty||0;
    if(minM&&maxM&&minM>maxM){nierealne.add(e.id);dodaj(1,`Wydarzenie „${n}” wymaga jednocześnie minimum mandatów większego od maksimum.`)}
    if(minM>TOTAL_SEATS){nierealne.add(e.id);dodaj(1,`Wydarzenie „${n}” wymaga więcej mandatów, niż istnieje w Sejmie.`)}
    if(+w.minSlawa>100){nierealne.add(e.id);dodaj(1,`Wydarzenie „${n}” wymaga sławy powyżej 100 i nigdy się nie uruchomi.`)}
    if(+w.maxKontrowersja<0){nierealne.add(e.id);dodaj(1,`Wydarzenie „${n}” ma ujemny maksymalny poziom kontrowersji.`)}
    if(+w.coIle<0||+w.przerwa<0||+w.poTygodniach<0)dodaj(1,`Wydarzenie „${n}” ma ujemny odstęp czasowy.`);
    if(KRE.ef.tygodni&&+w.week>+KRE.ef.tygodni){nierealne.add(e.id);dodaj(1,`Wydarzenie „${n}” wypada po końcu kadencji.`)}
    const popr=w.poWydarzeniu||w.wymagaWydarzenia;
    if(popr){
      if(popr===e.id||!byId.has(popr))dodaj(1,`Wydarzenie „${n}” ma nieprawidłowego poprzednika.`);
      const p=byId.get(popr),opc=String(w.poOpcji||'');
      if(p&&opc&&!((p.opcje||[]).some(o=>String(o.id||o.nazwa||'')===opc)))dodaj(1,`Wydarzenie „${n}” wymaga odpowiedzi, której poprzednik nie posiada.`);
    }else if(w.poOpcji)dodaj(1,`Wydarzenie „${n}” ma wybraną odpowiedź poprzednika bez poprzednika.`);
  });
  let zmiana=true;while(zmiana){zmiana=false;ev.forEach(e=>{const p=e.war&&(e.war.poWydarzeniu||e.war.wymagaWydarzenia);if(p&&nierealne.has(p)&&!nierealne.has(e.id)){nierealne.add(e.id);dodaj(1,`Wydarzenie „${e.nazwa||'bez nazwy'}” jest nieosiągalne, bo czeka na wydarzenie, które nigdy się nie uruchomi.`);zmiana=true}})}
  const przejdz=(id,sciezka)=>{if(!id||!byId.has(id))return;const idx=sciezka.indexOf(id);if(idx>=0){const kl=sciezka.slice(idx).concat(id).join('>');if(!cykle.has(kl)){cykle.add(kl);dodaj(1,`Łańcuch wydarzeń tworzy pętlę: ${sciezka.slice(idx).concat(id).join(' → ')}.`)}return}const e=byId.get(id),p=e&&e.war&&(e.war.poWydarzeniu||e.war.wymagaWydarzenia);if(p)przejdz(p,sciezka.concat(id))};
  ev.forEach(e=>przejdz(e.id,[]));
  if(ev.length>1&&!ev.some(e=>!(e.war&&(e.war.poWydarzeniu||e.war.wymagaWydarzenia))))dodaj(1,'Każde wydarzenie czeka na inne wydarzenie. Łańcuch nie ma punktu startowego.');
  return out;
}
function kre2Walidacja(){
  const w=[];
  if(!KRE.nazwa.trim())w.push({blok:1,krok:0,t:'Nadaj scenariuszowi nazwę.'});
  if(KRE.opis.trim().length<30)w.push({krok:0,t:'Opis jest bardzo krótki — gracz nie będzie wiedział, co się stało.'});
  const nazwy=new Set(PID.map(k=>String(BASE[k].n||'').trim().toLowerCase()));
  const skroty=new Set(PID.map(k=>String(BASE[k].ab||'').trim().toUpperCase()));
  const liderzy=new Set(Object.keys(LEAD).map(x=>x.trim().toLowerCase()));
  KRE.nowe.forEach(x=>{
    const naz=String(x.nazwa||'').trim(),ab=String(x.ab||'').trim().toUpperCase(),lid=String(x.lider||'').trim();
    if(!naz)w.push({blok:1,krok:1,t:'Nowa partia nie ma nazwy.'});
    else if(nazwy.has(naz.toLowerCase()))w.push({blok:1,krok:1,t:`Nazwa „${naz}” jest już zajęta.`});else nazwy.add(naz.toLowerCase());
    if(!ab||ab.length>4)w.push({blok:1,krok:1,t:`${naz||'Nowa partia'} musi mieć skrót od 1 do 4 znaków.`});
    else if(skroty.has(ab))w.push({blok:1,krok:1,t:`Skrót „${ab}” jest już zajęty.`});else skroty.add(ab);
    if(!lid)w.push({blok:1,krok:1,t:`${naz||'Nowa partia'} nie ma przewodniczącego.`});
    else if(liderzy.has(lid.toLowerCase()))w.push({blok:1,krok:1,t:`Lider „${lid}” już istnieje w innej partii.`});else liderzy.add(lid.toLowerCase());
    if((+x.comp.eli||0)+(+x.comp.int||0)+(+x.comp.ser||0)<1)w.push({blok:1,krok:1,t:`${naz||'Nowa partia'} nie ma ani jednego członka.`});
  });
  const wszystkie=krePartieLista().map(k=>({k,p:krePartiaDane(k),lider:kreNowaZnajdz(k)?.lider||KRE.edycje[k]?.lider||(LP[k]&&LP[k].main[0])}));
  const powt=(f,v)=>wszystkie.filter(x=>String(f(x)||'').trim().toLowerCase()===String(v||'').trim().toLowerCase()).length>1;
  wszystkie.forEach(x=>{if(powt(y=>y.p.n,x.p.n))w.push({blok:1,krok:1,t:`Nazwa „${x.p.n}” występuje w kilku partiach.`});if(powt(y=>y.p.ab,x.p.ab))w.push({blok:1,krok:1,t:`Skrót „${x.p.ab}” występuje w kilku partiach.`});if(x.lider&&powt(y=>y.lider,x.lider))w.push({blok:1,krok:1,t:`Lider „${x.lider}” prowadzi kilka partii.`})});
  if(kre2PulaMandatow()!==0)w.push({blok:1,krok:2,t:`Rozdaj wszystkie mandaty. Zostało: ${kre2PulaMandatow()}.`});
  if(Math.max(...Object.values(KRE.mandaty))>=25)w.push({krok:2,t:'Jedna partia ma samodzielną większość. To może być celowe, ale mocno spłaszcza grę.'});
  KRE.cele.forEach(c=>{
    if(!String(c.nazwa||'').trim())w.push({blok:1,krok:6,t:'Własny cel nie ma nazwy.'});
    if(!krePartieLista().includes(c.party))w.push({blok:1,krok:6,t:`Cel „${c.nazwa||'bez nazwy'}” nie ma istniejącej partii.`});
  });
  KRE.wydarzenia.forEach(e=>{if(!String(e.nazwa||'').trim())w.push({blok:1,krok:5,t:'Wydarzenie nie ma nazwy.'});if(!String(e.opis||'').trim())w.push({blok:1,krok:5,t:`Wydarzenie „${e.nazwa||'bez nazwy'}” nie ma opisu.`});if(!['gracz','losowa'].includes(e.party)&&!krePartieLista().includes(e.party))w.push({blok:1,krok:5,t:`Wydarzenie „${e.nazwa||'bez nazwy'}” wskazuje nieistniejącą partię.`});if(!e.opcje||!e.opcje.length)w.push({blok:1,krok:5,t:`Wydarzenie „${e.nazwa||'bez nazwy'}” nie ma odpowiedzi.`});else e.opcje.forEach(o=>{if(!String(o.nazwa||'').trim())w.push({blok:1,krok:5,t:`Wydarzenie „${e.nazwa||'bez nazwy'}” ma pustą odpowiedź.`})})});
  w.push(...kre2WalidacjaWydarzen());
  if(KRE.rzadTryb==='wlasny'){
    if(!KRE.rzadPartie.length)w.push({blok:1,krok:7,t:'Własny rząd nie ma żadnej partii.'});
    if(KRE.rzadPartie.some(k=>!KRE.mandaty[k]))w.push({blok:1,krok:7,t:'Partia bez mandatu nie może wejść do startowego rządu.'});
    if(!KRE.rzadPartie.includes(KRE.premier))w.push({blok:1,krok:7,t:'Premier musi pochodzić z partii rządzącej.'});
    if(KRE.rzadPartie.length&&kre2RzadMandaty()<MAJ)w.push({krok:7,t:`Rząd ma ${kre2RzadMandaty()} mandatów i zacznie jako mniejszościowy.`});
  }
  if(KRE.rzadTryb==='zastany'&&KRE2_RZAD0.some(k=>!KRE.mandaty[k]))
    w.push({blok:1,krok:7,t:'Rząd zastany zawiera partię bez mandatu. Wybierz własny gabinet albo start bez rządu.'});
  if(!kre2MaZmiany())w.push({krok:8,t:'Ten scenariusz jest identyczny jak zwykły Sejm zastany.'});
  return w;
}
function kre2SeatBar(){return `<div class="kreseatbar">${krePartieLista().filter(k=>KRE.mandaty[k]).map(k=>{const p=krePartiaDane(k);return
  `<i title="${esc(p.n)}: ${KRE.mandaty[k]}" style="width:${KRE.mandaty[k]/TOTAL_SEATS*100}%;background:${p.c}"></i>`}).join('')}</div>`}
function kre2SuwakEf([k,opis,min,max,dom]){
  const v=KRE.ef[k],final=k==='kapital'?26+v:k==='akcje'?3+v:k==='krolPrzychylnosc'?52+v:v;
  const suf=k==='tygodni'?' tyg.':k==='kapital'?' kap.':k==='akcje'?' akcje':'';
  return `<div class="kresuwak ${v!==dom?'ruszony':''}"><div><b>${opis}</b><span>${['tygodni','kapital','akcje','krolPrzychylnosc'].includes(k)?`wynik: ${final}${suf}`:`zmiana dla wszystkich: ${v>0?'+':''}${v}`}</span></div><input aria-label="${opis}" type="range" min="${min}" max="${max}" value="${v}" oninput="kreEf('${k}',this.value)"><strong class="m">${k==='tygodni'?v:(v>0?'+':'')+v}</strong></div>`;
}
function kre2Stepper(){return `<div class="kresteps">${KRE2_KROKI.map((s,i)=>`<button class="krestep ${i===KRE.krok?'on':''} ${i<KRE.krok?'done':''}" onclick="kreKrok(${i})"><i>${i<KRE.krok?'✓':i+1}</i><span><b>${s[0]}</b><small>${s[1]}</small></span></button>`).join('')}</div>`}

function kre2EkranOpis(){return `<div class="krepanel krebig"><div class="kretitle"><span>01</span><div><h2>Nadaj temu światu charakter</h2><p>To zobaczy gracz, zanim wybierze partię.</p></div></div><div class="kreform"><label>Nazwa scenariusza<input id="kn" maxlength="60" value="${esc(KRE.nazwa)}" placeholder="np. Sejm po wielkim rozłamie"></label><label>Autor<input id="ka" maxlength="40" value="${esc(KRE.autor)}" placeholder="twój nick"></label><label class="wide">Co wydarzyło się na serwerze?<textarea id="ko" maxlength="400" rows="5" placeholder="Napisz dwa lub trzy konkretne zdania. Kto wygrał, kto się rozpadł i dlaczego ten start jest ciekawy?">${esc(KRE.opis)}</textarea><small>${KRE.opis.length}/400</small></label></div><div class="sterlab">Jak gra ma opisać poziom trudności</div><div class="krediff">${KRE2_TRUDNOSCI.map((x,i)=>`<button class="${KRE.trudnosc===x?'on':''}" onclick="kreSet('trudnosc','${x}')"><b>${x}</b><span>${['dużo miejsca na błędy','normalna walka o władzę','słaby start lub groźni rywale','świat chce cię zniszczyć','nietypowe zasady'][i]}</span></button>`).join('')}</div><div class="krehint"><b>Dobra zasada</b><span>Scenariusz powinien stawiać pytanie: „co zrobi gracz w tej sytuacji?”, a nie tylko dodawać wszystkim +10.</span></div></div>`}

function kre2EkranSejm(){return `<div class="krepanel krebig"><div class="kretitle"><span>02</span><div><h2>Zbuduj Sejm</h2><p>Najpierw zabierz mandat jednej partii, potem przydziel go innej. Suma zawsze musi wynosić 40.</p></div></div><div class="kresejmhead"><div><span>Rozdane</span><b>${kre2SumaMandatow()} / ${TOTAL_SEATS}</b></div><div class="${kre2PulaMandatow()?'bad':'good'}"><span>Do rozdania</span><b>${kre2PulaMandatow()}</b></div><button class="btn g sm" onclick="kreResetMandaty()">Przywróć Sejm zastany</button></div>${kre2SeatBar()}<div class="kreseatgrid">${krePartieLista().map(k=>{const p=BASE[k],n=KRE.mandaty[k];return `<article class="kreseat" style="--pc:${p.c}"><div class="kreseatid">${crest(k,'m')}<div><b>${p.ab}</b><span>${p.n}</span></div></div><div class="kreseatctl"><button onclick="kreMandat('${k}',-1)" ${n<=0?'disabled':''} aria-label="Zabierz mandat ${p.ab}">−</button><strong>${n}</strong><button onclick="kreMandat('${k}',1)" ${kre2PulaMandatow()<=0?'disabled':''} aria-label="Dodaj mandat ${p.ab}">+</button></div><div class="kreseatmeter"><i style="width:${Math.min(100,n/12*100)}%"></i></div></article>`}).join('')}</div><div class="krehint ${kre2PulaMandatow()?'warn':''}"><b>${kre2PulaMandatow()?'Podział niedokończony':'Sejm jest poprawny'}</b><span>${kre2PulaMandatow()?`Jeszcze ${kre2PulaMandatow()} ${pl(kre2PulaMandatow(),'mandat','mandaty','mandatów')} czeka na właściciela.`:'Wszystkie 40 miejsc ma właściciela. Możesz przejść dalej.'}</span></div></div>`}

function kre2EkranPartie(){
  const k=KRE.wybrana||'PPP',p=BASE[k],z=KRE.partie[k]||{};
  return `<div class="krepanel krebig"><div class="kretitle"><span>03</span><div><h2>Ustaw kondycję partii</h2><p>Najpierw klimat całej sceny, potem wyjątki dla konkretnych ugrupowań.</p></div></div><div class="sterlab">Gotowy punkt wyjścia</div><div class="krepresets"><button onclick="krePreset('reset')"><b>Sejm zastany</b><span>bez zmian statystyk</span></button><button onclick="krePreset('spokoj')"><b>Krucha zgoda</b><span>więcej jedności, mniej afer</span></button><button onclick="krePreset('kryzys')"><b>Serwer po katastrofie</b><span>mniejsze i rozbite partie</span></button><button onclick="krePreset('wrzenie')"><b>Polityczne wrzenie</b><span>aktywność, sława i skandale</span></button></div><div class="kresuwaki">${KRE2_POLA.map(kre2SuwakEf).join('')}</div><div class="kresectionhead"><div><span>Wyjątki</span><h3>Jedna partia może płynąć pod prąd</h3></div><button class="btn g sm" onclick="kreWyczysc('${k}')" ${!kreIleZmian(k)?'disabled':''}>Wyczyść ${p.ab}</button></div><div class="krepartie">${krePartieLista().map(x=>{const ile=kreIleZmian(x);return `<button class="krep ${x===k?'on':''} ${ile?'ma':''}" onclick="krePartia('${x}')" style="--pc:${BASE[x].c}">${crest(x,'s')}<span>${BASE[x].ab}</span>${ile?`<i>${ile}</i>`:''}</button>`}).join('')}</div><div class="krepartyedit" style="--pc:${p.c}"><div class="krepartyhero">${crest(k,'l')}<div><span>Ustawiasz osobno</span><h3>${esc(p.n)}</h3><small>Mandaty: ${KRE.mandaty[k]} · członkowie: ${p.mem}</small></div></div><div class="krestatgrid">${KRE2_PARTIA.map(([pole,opis,min,max])=>{const v=z[pole]||0,f=kre2StatFinal(k,pole);return `<div class="krestat ${v?'ruszony':''}"><div><b>${opis}</b><span>${Math.round(p[pole]||0)} → <strong>${f}</strong></span></div><input aria-label="${opis} ${p.ab}" type="range" min="${min}" max="${max}" value="${v}" oninput="krePole('${k}','${pole}',this.value)"><em>${v>0?'+':''}${v}</em></div>`}).join('')}</div></div></div>`;
}

function kre2EkranWladza(){
  const rm=kre2RzadMandaty();
  return `<div class="krepanel krebig"><div class="kretitle"><span>04</span><div><h2>Rozstaw władzę</h2><p>Gabinet, prezydent, relacje i tempo kampanii obowiązują od pierwszej sekundy.</p></div></div><div class="kresectionhead"><div><span>Rząd</span><h3>Kto zaczyna w gabinecie?</h3></div>${KRE.rzadTryb==='wlasny'?`<div class="krequorum ${rm>=MAJ?'good':'bad'}">${rm} / ${MAJ} do większości</div>`:''}</div><div class="krechoices trzy"><button class="${KRE.rzadTryb==='zastany'?'on':''}" onclick="kreRzadTryb('zastany')"><b>Rząd zastany</b><span>kisielek48 i obecny szeroki gabinet</span></button><button class="${KRE.rzadTryb==='brak'?'on':''}" onclick="kreRzadTryb('brak')"><b>Bez rządu</b><span>walka o premiera rusza od zera</span></button><button class="${KRE.rzadTryb==='wlasny'?'on':''}" onclick="kreRzadTryb('wlasny')"><b>Własny gabinet</b><span>wybierasz partie i premiera</span></button></div>${KRE.rzadTryb==='wlasny'?`<div class="kregovbox"><div class="krepartie">${krePartieLista().map(k=>`<button class="krep ${KRE.rzadPartie.includes(k)?'on':''}" onclick="kreRzadTog('${k}')" ${!KRE.mandaty[k]?'disabled':''} style="--pc:${BASE[k].c}">${crest(k,'s')}<span>${BASE[k].ab}</span><i>${KRE.mandaty[k]}</i></button>`).join('')}</div><label class="kreselect">Partia premiera<select onchange="krePremier(this.value)">${KRE.rzadPartie.map(k=>`<option value="${k}" ${KRE.premier===k?'selected':''}>${BASE[k].n} (${BASE[k].ab})</option>`).join('')}</select></label></div>`:''}<div class="kresectionhead"><div><span>Pałac</span><h3>Kto jest prezydentem serwera?</h3></div></div><div class="krechoices trzy"><button class="${KRE.prezTryb==='zastany'?'on':''}" onclick="krePrezydentTryb('zastany')"><b>Śledzik</b><span>pozostaje stan zastany</span></button><button class="${KRE.prezTryb==='brak'?'on':''}" onclick="krePrezydentTryb('brak')"><b>Wakat</b><span>nikt nie może wetować ustaw</span></button><button class="${KRE.prezTryb==='partia'?'on':''}" onclick="krePrezydentTryb('partia')"><b>Wskaż partię</b><span>jej lider obejmuje urząd</span></button></div>${KRE.prezTryb==='partia'?`<div class="krepartie prez">${krePartieLista().map(k=>`<button class="krep ${KRE.prezydent===k?'on':''}" onclick="krePrezydent('${k}')" style="--pc:${BASE[k].c}">${crest(k,'s')}<span>${BASE[k].ab}</span></button>`).join('')}</div>`:''}<div class="kresectionhead"><div><span>Relacje</span><h3>Temperatura sceny</h3></div></div><div class="krechoices cztery">${[['zastane','Zastane','koalicje i animozje jak dziś'],['zgoda','Odprężenie','wszyscy zaczynają na plusie'],['napiecie','Napięcie','każdy patrzy podejrzliwie'],['wojna','Wojna','relacje zaczynają od −34']].map(x=>`<button class="${KRE.relacje===x[0]?'on':''}" onclick="kreRelacje('${x[0]}')"><b>${x[1]}</b><span>${x[2]}</span></button>`).join('')}</div><div class="kresectionhead"><div><span>Reguły</span><h3>Tempo tej rozgrywki</h3></div></div><div class="kresuwaki">${KRE2_OGOLNE.map(kre2SuwakEf).join('')}</div></div>`;
}

function kre3EkranSejm(){
  const lista=krePartieLista();
  return `<div class="krepanel krebig"><div class="kretitle"><span>03</span><div><h2>Zbuduj Sejm</h2><p>Każda utworzona partia od razu może dostać mandaty. Suma musi wynosić dokładnie 40.</p></div></div>
    <div class="kresejmhead"><div><span>Rozdane</span><b>${kre2SumaMandatow()} / ${TOTAL_SEATS}</b></div><div class="${kre2PulaMandatow()?'bad':'good'}"><span>Do rozdania</span><b>${kre2PulaMandatow()}</b></div><button class="btn g sm" onclick="kreResetMandaty()">Przywróć podział</button></div>
    ${kre2SeatBar()}<div class="kreseatgrid">${lista.map(k=>{const p=krePartiaDane(k),n=KRE.mandaty[k]||0;return `<article class="kreseat" style="--pc:${p.c}"><div class="kreseatid">${kreHerb(k,'m')}<div><b>${esc(p.ab)}</b><span>${esc(p.n)}</span></div></div><div class="kreseatctl"><button onclick="kreMandat('${k}',-1)" ${n<=0?'disabled':''}>−</button><strong>${n}</strong><button onclick="kreMandat('${k}',1)" ${kre2PulaMandatow()<=0?'disabled':''}>+</button></div><div class="kreseatmeter"><i style="width:${Math.min(100,n/12*100)}%"></i></div></article>`}).join('')}</div>
    <div class="krehint ${kre2PulaMandatow()?'warn':''}"><b>${kre2PulaMandatow()?'Podział niedokończony':'Sejm jest poprawny'}</b><span>${kre2PulaMandatow()?`Do rozdania zostało ${kre2PulaMandatow()} mandatów.`:'Wszystkie miejsca mają właściciela.'}</span></div></div>`;
}
function kre4EkranRelacje(){
  const l=krePartieLista(),n=k=>krePartiaDane(k),a=KRE.relA||l[0],b=(KRE.relB&&KRE.relB!==a)?KRE.relB:l.find(x=>x!==a),key=[a,b].sort().join('|'),v=KRE.swiat.relacje[key]??0;
  return `<div class="krepanel krebig"><div class="kretitle"><span>04</span><div><h2>Rozpisz sojusze i wojny</h2><p>Globalny klimat zostaje bazą, a tutaj ustawiasz konkretne pary od −100 do +100.</p></div></div>
    <div class="krefinalgrid"><section><div class="sterlab">Pierwsza partia</div><label class="kreselect"><select onchange="kreSet('relA',this.value)">${l.map(k=>`<option value="${k}" ${a===k?'selected':''}>${esc(n(k).n)} (${esc(n(k).ab)})</option>`).join('')}</select></label></section><section><div class="sterlab">Druga partia</div><label class="kreselect"><select onchange="kreSet('relB',this.value)">${l.filter(k=>k!==a).map(k=>`<option value="${k}" ${b===k?'selected':''}>${esc(n(k).n)} (${esc(n(k).ab)})</option>`).join('')}</select></label></section></div>
    <div class="krerelhero"><div style="--pc:${n(a).c}">${kreHerb(a,'l')}<b>${esc(n(a).ab)}</b></div><main><strong class="${v>=35?'good':v<=-25?'bad':''}">${v>0?'+':''}${v}</strong><span>${v>=60?'twardy sojusz':v>=25?'współpraca':v<=-60?'otwarta wojna':v<=-20?'wrogość':'chłodna neutralność'}</span><input type="range" min="-100" max="100" value="${v}" oninput="this.previousElementSibling.previousElementSibling.textContent=(this.value>0?'+':'')+this.value" onchange="kreRelUstaw('${a}','${b}',this.value)"></main><div style="--pc:${n(b).c}">${kreHerb(b,'l')}<b>${esc(n(b).ab)}</b></div></div>
    <div class="kresectionhead"><div><span>Wyjątki</span><h3>${Object.keys(KRE.swiat.relacje).length} ustawionych relacji</h3></div></div><div class="krerellista">${Object.keys(KRE.swiat.relacje).length?Object.entries(KRE.swiat.relacje).map(([x,val])=>{const [p,q]=x.split('|');return `<div>${kreHerb(p,'s')}<b>${esc(n(p).ab)}</b><span class="${val>=25?'good':val<=-20?'bad':''}">${val>0?'+':''}${val}</span><b>${esc(n(q).ab)}</b>${kreHerb(q,'s')}<button onclick="kreRelUsun('${x}')">×</button></div>`}).join(''):'<div class="kreempty mini"><b>Brak relacji szczególnych</b><span>Świat użyje wybranego później klimatu sceny.</span></div>'}</div></div>`;
}
function kre4EkranAI(){
  const l=krePartieLista(),k=KRE.wybrana||l[0],p=krePartiaDane(k),a=kreAiGet(k),suw=([x,n])=>`<div class="krestat"><div><b>${n}</b><span>${a[x]}/100</span></div><input type="range" min="0" max="100" value="${a[x]}" oninput="kreAiPole('${k}','${x}',this.value,0);this.previousElementSibling.lastElementChild.textContent=this.value+'/100'"><em>${a[x]}</em></div>`;
  return `<div class="krepanel krebig"><div class="kretitle"><span>05</span><div><h2>Nadaj partiom charakter</h2><p>AI pamięta plan, wrogów i sojuszników. Te ustawienia zmieniają decyzje, ustawy, media oraz koalicje.</p></div></div><div class="krepartie rozbudowane">${l.map(x=>{const q=krePartiaDane(x);return `<button class="krep ${x===k?'on':''}" onclick="krePartia('${x}')" style="--pc:${q.c}">${kreHerb(x,'s')}<span>${esc(q.ab)}</span></button>`}).join('')}</div>
    <div class="kreaihero" style="--pc:${p.c}">${kreHerb(k,'l')}<div><span>Dyrekcja strategiczna</span><h3>${esc(p.n)}</h3><small>${AI_STYLE[a.typ]?.n||a.typ}</small></div><label>Archetyp<select onchange="kreAiPole('${k}','typ',this.value,1)">${Object.entries(AI_STYLE).map(([x,q])=>`<option value="${x}" ${a.typ===x?'selected':''}>${q.n}</option>`).join('')}</select></label></div>
    <div class="kreaitraits">${[['agresja','Agresja'],['rozwoj','Rozbudowa partii'],['media','Głód mediów'],['prawo','Aktywność ustawodawcza'],['koalicje','Skłonność do koalicji'],['ryzyko','Ryzykanctwo']].map(suw).join('')}</div>
    <div class="krehint"><b>To działa w grze</b><span>Przykład: wysoka aktywność ustawodawcza skraca przerwy między projektami, a koalicyjność podnosi realną szansę wspólnej listy.</span></div></div>`;
}
function kre4EkranWydarzenia(){
  const i=cl(KRE.wydSel||0,0,Math.max(0,KRE.wydarzenia.length-1)),e=KRE.wydarzenia[i],l=krePartieLista(),num=(g,k,n,max=999)=>`<label>${n}<input type="number" min="0" max="${max}" value="${e?e[g][k]||0:0}" onchange="kreWydPole(${i},'${g}','${k}',this.value,1)"></label>`,poprzednicy=KRE.wydarzenia.map((x,j)=>[x.id||'EV'+j,x.nazwa||x.id]).filter((x,j)=>j!==i),poprzednik=e&&KRE.wydarzenia.find(x=>x.id===e.war?.poWydarzeniu),sel=(arr,v)=>arr.map(([a,b])=>`<option value="${esc(a)}" ${String(a)===String(v||'')?'selected':''}>${esc(b)}</option>`).join(''),odpowiedzi=[['','dowolna odpowiedź'],...(poprzednik?.opcje||[]).map((o,j)=>[o.id||'O'+(j+1),o.nazwa||'Odpowiedź '+(j+1)])];
  return `<div class="krepanel krebig"><div class="kretitle"><span>06</span><div><h2>Wyreżyseruj wydarzenia</h2><p>Do 24 sytuacji z warunkami i czterema odpowiedziami. AI wybiera zgodnie ze swoim charakterem.</p></div></div><div class="kresectionhead"><div><span>Oś kampanii</span><h3>${KRE.wydarzenia.length} z 24 wydarzeń</h3></div><div class="krewydtemplates"><button class="btn" onclick="kreWydDodaj('custom')" ${KRE.wydarzenia.length>=24?'disabled':''}>+ Wydarzenie</button><button class="btn g sm" onclick="kreWydDodaj('afera')" ${KRE.wydarzenia.length>=24?'disabled':''}>Afera</button><button class="btn g sm" onclick="kreWydDodaj('kryzys')" ${KRE.wydarzenia.length>=24?'disabled':''}>Kryzys</button><button class="btn g sm" onclick="kreWydDodaj('media')" ${KRE.wydarzenia.length>=24?'disabled':''}>Media</button></div></div>
    ${!e?`<div class="kreempty"><b>Świat jeszcze milczy</b><span>Dodaj kryzys, rozłam, debatę, aferę albo wydarzenie fabularne.</span><button class="btn" onclick="kreWydDodaj('custom')">Tworzę pierwsze wydarzenie</button></div>`:`<div class="krewyd"><aside>${KRE.wydarzenia.map((x,j)=>`<button class="${j===i?'on':''}" onclick="kreWydWybierz(${j})"><i>${j+1}</i><span><b>${esc(x.nazwa)}</b><small>${x.war.term?'K'+x.war.term:'dowolna kadencja'} · ${x.war.week?'T'+x.war.week:'warunkowo'}</small></span></button>`).join('')}</aside><main><div class="kresectionhead"><div><span>Wydarzenie ${i+1}</span><h3>${esc(e.nazwa)}</h3></div><div class="krewydactions"><button class="btn g sm" onclick="kreWydDuplikuj(${i})">Duplikuj</button><button class="btn g sm" onclick="kreWydUsun(${i})">Usuń</button></div></div>
      <div class="kreform trzy"><label>Nazwa<input value="${esc(e.nazwa)}" onchange="kreWydPole(${i},'','nazwa',this.value,1)"></label><label>Kategoria<input value="${esc(e.kategoria)}" onchange="kreWydPole(${i},'','kategoria',this.value,1)"></label><label>Dotyczy<select onchange="kreWydPole(${i},'','party',this.value,1)"><option value="gracz" ${e.party==='gracz'?'selected':''}>partii gracza</option><option value="losowa" ${e.party==='losowa'?'selected':''}>losowej partii AI</option>${l.map(k=>`<option value="${k}" ${e.party===k?'selected':''}>${esc(krePartiaDane(k).ab)}</option>`).join('')}</select></label><label class="wide">Opis<textarea rows="4" maxlength="500" onchange="kreWydPole(${i},'','opis',this.value,1)">${esc(e.opis)}</textarea></label></div>
      <div class="sterlab">Kiedy się uruchamia — zero oznacza dowolnie</div><div class="krenumbers cele">${num('war','term','Kadencja',50)}${num('war','week','Tydzień',24)}${num('war','odTygodnia','Od tygodnia gry',999)}${num('war','coIle','Co ile tygodni',100)}${num('war','przerwa','Przerwa po odpaleniu',100)}${num('war','minMandaty','Min. mandatów',40)}${num('war','maxMandaty','Maks. mandatów',40)}${num('war','minSlawa','Min. sława',100)}${num('war','maxKontrowersja','Maks. kontrowersja',100)}<label>Urząd<select onchange="kreWydPole(${i},'war','urzad',this.value,1)">${[['brak','bez warunku'],['premier','premier'],['prezydent','prezydent'],['opozycja','opozycja']].map(x=>`<option value="${x[0]}" ${e.war.urzad===x[0]?'selected':''}>${x[1]}</option>`).join('')}</select></label><label class="krecheckline"><input type="checkbox" ${e.war.powtarzalne?'checked':''} onchange="kreWydPole(${i},'war','powtarzalne',this.checked,1)"> Powtarzalne</label></div>
      <div class="krechain"><div class="sterlab">?a?cuch wydarze?</div><div class="kreform trzy"><label>Po wydarzeniu<select onchange="kreWydPole(${i},'war','poWydarzeniu',this.value,1)"><option value="">bez poprzednika</option>${sel(poprzednicy,e.war.poWydarzeniu)}</select></label><label>Po konkretnej odpowiedzi<select onchange="kreWydPole(${i},'war','poOpcji',this.value,1)">${sel(odpowiedzi,e.war.poOpcji)}</select></label><label>Op??nienie po poprzedniku<input type="number" min="0" max="100" value="${e.war.poTygodniach||0}" onchange="kreWydPole(${i},'war','poTygodniach',this.value,1)"></label></div></div>
      <div class="kresectionhead"><div><span>Odpowiedzi</span><h3>${e.opcje.length} z 4 możliwości</h3></div><button class="btn g sm" onclick="kreWydOpcjaDodaj(${i})" ${e.opcje.length>=4?'disabled':''}>+ Odpowiedź</button></div><div class="kreopcje">${e.opcje.map((o,j)=>kre4OpcjaWyd(i,j,o,l)).join('')}</div></main></div>`}</div>`;
}
function kre4OpcjaWyd(i,j,o,l){
  const ef=(k,n)=>`<label>${n}<input type="number" min="-200" max="200" value="${o.efekty[k]||0}" onchange="kreWydOpcjaPole(${i},${j},'efekty','${k}',this.value,1)"></label>`,ai=(k,n)=>`<label>${n}<input type="number" min="-3" max="3" value="${o.ai[k]||0}" onchange="kreWydOpcjaPole(${i},${j},'ai','${k}',this.value,1)"></label>`;
  return `<article><header><b>Odpowiedź ${j+1}</b><button onclick="kreWydOpcjaUsun(${i},${j})" ${j===0?'disabled':''}>×</button></header><div class="kreform"><label>Napis na przycisku<input value="${esc(o.nazwa)}" onchange="kreWydOpcjaPole(${i},${j},'','nazwa',this.value,1)"></label><label>Podpowiedź<input value="${esc(o.opis)}" onchange="kreWydOpcjaPole(${i},${j},'','opis',this.value,1)"></label></div><div class="sterlab">Skutki</div><div class="krenumbers opcja">${ef('fame','Sława')}${ef('cred','Wiarygodność')}${ef('uni','Jedność')}${ef('act','Aktywność')}${ef('ctr','Kontrowersja')}${ef('mem','Ludzie')}${ef('kapital','Kapitał')}${ef('obecnosc','Obecność')}${ef('rel','Relacja')}<label>Relacja z<select onchange="kreWydOpcjaPole(${i},${j},'efekty','relPartia',this.value,1)"><option value="">nikt</option><option value="gracz" ${o.efekty.relPartia==='gracz'?'selected':''}>gracz</option>${l.map(k=>`<option value="${k}" ${o.efekty.relPartia===k?'selected':''}>${esc(krePartiaDane(k).ab)}</option>`).join('')}</select></label></div><div class="sterlab">Przemiana po odpowiedzi</div><div class="kreform trzy"><label>Nowa nazwa partii<input value="${esc(o.efekty.nazwa||'')}" onchange="kreWydOpcjaPole(${i},${j},'efekty','nazwa',this.value,1)"></label><label>Nowy skrót<input maxlength="4" value="${esc(o.efekty.ab||'')}" onchange="kreWydOpcjaPole(${i},${j},'efekty','ab',this.value,1)"></label><label>Nowy kolor<input type="color" value="${/^#[0-9a-f]{6}$/i.test(o.efekty.c||'')?o.efekty.c:'#d9ab45'}" onchange="kreWydOpcjaPole(${i},${j},'efekty','c',this.value,1)"></label><label class="krecheckline"><input type="checkbox" ${o.efekty.zmienLidera?'checked':''} onchange="kreWydOpcjaPole(${i},${j},'efekty','zmienLidera',this.checked,1)"> Zmień lidera na najlepszego następcę</label><label>Ustawa<select onchange="kreWydOpcjaPole(${i},${j},'efekty','ustawa',this.value,1)"><option value="">bez zmiany</option>${LAWS.map(x=>`<option value="${x.id}" ${o.efekty.ustawa===x.id?'selected':''}>${esc(x.n)}</option>`).join('')}</select></label></div><div class="sterlab">Co lubi AI — od −3 do +3</div><div class="krenumbers opcja">${ai('agresja','Agresja')}${ai('ryzyko','Ryzyko')}${ai('media','Media')}${ai('prawo','Prawo')}${ai('koalicje','Koalicje')}${ai('rozwoj','Rozwój')}</div></article>`;
}
function kre3EdytorNowej(x){
  const pole=(lab,k,v,max=42)=>`<label>${lab}<input value="${esc(String(v||''))}" maxlength="${max}" onchange="kreNowaPole('${x.id}','${k}',this.value,1)"></label>`;
  const suw=([k,n,min,max])=>`<div class="krestat"><div><b>${n}</b><span>${x.stat[k]}</span></div><input type="range" min="${min}" max="${max}" value="${x.stat[k]}" oninput="kreNowaPole('${x.id}','stat.${k}',this.value,0);this.previousElementSibling.lastElementChild.textContent=this.value"><em>${x.stat[k]}</em></div>`;
  return `<div class="krenew" style="--pc:${x.c}"><div class="krenewhero">${kreHerb(x.id,'l')}<div><span>Partia scenariusza</span><h3>${esc(x.nazwa)}</h3><small>${esc(x.ab)} · lider ${esc(x.lider)}</small></div><button class="btn g sm" onclick="kreUsunPartie('${x.id}')">Usuń partię</button></div>
    <div class="kreform trzy">${pole('Pełna nazwa','nazwa',x.nazwa)}${pole('Skrót','ab',x.ab,4)}<label>Kolor<input type="color" value="${x.c}" onchange="kreNowaPole('${x.id}','c',this.value,1)"></label>${pole('Przewodniczący','lider',x.lider)}${pole('Data założenia','founded',x.founded,14)}${pole('Zaplecze, po przecinku','zaplecze',x.zaplecze,120)}<div class="krehint"><b>Zaplecze: ${Math.max(0,kreOsobyPartii(x.id).length-1)} osób</b><span>Dodaj albo usuń działacza; potem możesz wskazać go jako urząd.</span><button class="btn g sm" onclick="kreZapleczeDodaj('${x.id}')">+ Działacz</button><button class="btn g sm" onclick="kreZapleczeUsun('${x.id}')">Usuń ostatniego</button></div></div>
    <div class="kreform"><label class="wide">Opis partii<textarea rows="3" maxlength="180" onchange="kreNowaPole('${x.id}','opis',this.value,1)">${esc(x.opis)}</textarea></label><label class="wide">Słabość startowa<textarea rows="2" maxlength="180" onchange="kreNowaPole('${x.id}','slabosc',this.value,1)">${esc(x.slabosc)}</textarea></label></div>
    <div class="krenewcols"><section><div class="sterlab">Skład partii</div><div class="krenumbers">${[['eli','Elita'],['int','Intelektualiści'],['ser','Serwerowicze']].map(([k,n])=>`<label>${n}<input type="number" min="0" max="200" value="${x.comp[k]}" onchange="kreNowaPole('${x.id}','comp.${k}',this.value,1)"></label>`).join('')}</div><div class="sterlab">Logo</div><label class="kreupload"><input type="file" accept="image/*" onchange="kreNowaLogo(this,'${x.id}')"><b>${x.logo?'Zmień własne logo':'Wgraj własne logo'}</b><span>Bez pliku gra zrobi herb ze skrótu i koloru.</span></label></section>
    <section><div class="sterlab">Statystyki partii</div><div class="krestatgrid">${KRE_NOWA_STAT.map(suw).join('')}</div></section></div>
    <div class="krenewcols"><section><div class="sterlab">Lider</div><div class="krestatgrid">${KRE_LIDER_STAT.map(([k,n])=>`<div class="krestat"><div><b>${n}</b><span>${x.liderStat[+k]}</span></div><input type="range" min="1" max="99" value="${x.liderStat[+k]}" oninput="kreNowaPole('${x.id}','lider.${k}',this.value,0);this.previousElementSibling.lastElementChild.textContent=this.value"><em>${x.liderStat[+k]}</em></div>`).join('')}</div></section>
    <section><div class="sterlab">Kogo przyciąga</div><div class="krestatgrid">${[['eli','Elita'],['int','Intelektualiści'],['ser','Serwerowicze']].map(([k,n])=>`<div class="krestat"><div><b>${n}</b><span>${x.aff[k]}/9</span></div><input type="range" min="1" max="9" value="${x.aff[k]}" oninput="kreNowaPole('${x.id}','aff.${k}',this.value,0);this.previousElementSibling.lastElementChild.textContent=this.value+'/9'"><em>${x.aff[k]}</em></div>`).join('')}</div></section></div></div>`;
}
function kre3EdytorStarej(k,p,z){
  const e=kreMeta(k),pole=(n,x,v,max=42)=>`<label>${n}<input value="${esc(String(v||''))}" maxlength="${max}" onchange="kreMetaPole('${k}','${x}',this.value,1)"></label>`;
  return `<div class="krepartyedit" style="--pc:${p.c}"><div class="krepartyhero">${kreHerb(k,'l')}<div><span>Istniejąca partia — pełna edycja</span><h3>${esc(p.n)}</h3><small>Zmiany obowiązują tylko w tym scenariuszu.</small></div><button class="btn g sm" onclick="kreMetaReset('${k}')">Przywróć tożsamość</button></div>
    <div class="kreform trzy">${pole('Nazwa','nazwa',e.nazwa)}${pole('Skrót','ab',e.ab,4)}<label>Kolor<input type="color" value="${e.c}" onchange="kreMetaPole('${k}','c',this.value,1)"></label>${pole('Przewodniczący','lider',e.lider)}<label class="kreupload"><input type="file" accept="image/*" onchange="kreMetaLogo(this,'${k}')"><b>${e.logo?'Zmień własny herb':'Wgraj nowy herb'}</b><span>Obowiązuje tylko w scenariuszu.</span></label></div>
    <div class="kreform"><label class="wide">Opis partii<textarea rows="2" onchange="kreMetaPole('${k}','opis',this.value,1)">${esc(e.opis)}</textarea></label><label class="wide">Słabość<textarea rows="2" onchange="kreMetaPole('${k}','slabosc',this.value,1)">${esc(e.slabosc)}</textarea></label></div>
    <div class="krenewcols"><section><div class="sterlab">Statystyki lidera</div><div class="krestatgrid">${KRE_LIDER_STAT.map(([x,n])=>`<div class="krestat"><div><b>${n}</b><span>${e.liderStat[+x]}</span></div><input type="range" min="1" max="99" value="${e.liderStat[+x]}" oninput="kreMetaPole('${k}','lider.${x}',this.value,0);this.previousElementSibling.lastElementChild.textContent=this.value"><em>${e.liderStat[+x]}</em></div>`).join('')}</div></section><section><div class="sterlab">Zmiana kondycji startowej</div><div class="krestatgrid">${KRE2_PARTIA.map(([x,n,min,max])=>{const v=z[x]||0,f=kre2StatFinal(k,x);return `<div class="krestat ${v?'ruszony':''}"><div><b>${n}</b><span>${Math.round(p[x]||0)} → <strong>${f}</strong></span></div><input type="range" min="${min}" max="${max}" value="${v}" oninput="krePole('${k}','${x}',this.value)"><em>${v>0?'+':''}${v}</em></div>`}).join('')}</div></section></div></div>`;
}
function kre3EkranPartie(){
  const k=KRE.wybrana||krePartieLista()[0],p=krePartiaDane(k),z=KRE.partie[k]||{},nowa=kreNowaZnajdz(k);
  return `<div class="krepanel krebig"><div class="kretitle"><span>02</span><div><h2>Zbuduj partie</h2><p>Możesz zmieniać istniejące ugrupowania albo stworzyć do ośmiu całkiem nowych.</p></div></div>
    <div class="kresectionhead"><div><span>Scena</span><h3>${krePartieLista().length} ugrupowań · ${KRE.nowe.length} własnych</h3></div><button class="btn" onclick="kreNowaPartia()" ${KRE.nowe.length>=8?'disabled':''}>+ Nowa partia</button></div>
    <div class="krepartie rozbudowane">${krePartieLista().map(x=>{const q=krePartiaDane(x),ile=kreIleZmian(x);return `<button class="krep ${x===k?'on':''} ${kreNowaZnajdz(x)?'nowa':''} ${ile?'ma':''}" onclick="krePartia('${x}')" style="--pc:${q.c}">${kreHerb(x,'s')}<span>${esc(q.ab)}</span>${kreNowaZnajdz(x)?'<i>+</i>':ile?`<i>${ile}</i>`:''}</button>`}).join('')}</div>
    ${nowa?kre3EdytorNowej(nowa):kre3EdytorStarej(k,p,z)}
    <div class="kresectionhead"><div><span>Cała scena</span><h3>Globalny kryzys albo prosperity</h3></div></div><div class="krepresets"><button onclick="krePreset('reset')"><b>Bez zmian</b><span>stan zwykłej gry</span></button><button onclick="krePreset('spokoj')"><b>Krucha zgoda</b><span>więcej jedności</span></button><button onclick="krePreset('kryzys')"><b>Katastrofa</b><span>mniej ludzi i zaufania</span></button><button onclick="krePreset('wrzenie')"><b>Wrzenie</b><span>aktywność i skandale</span></button></div><div class="kresuwaki">${KRE2_POLA.map(kre2SuwakEf).join('')}</div></div>`;
}
function kre3EkranCele(){
  const i=Math.max(0,Math.min(KRE.celWybrany||0,KRE.cele.length-1)),c=KRE.cele[i],partie=krePartieLista();
  const num=(g,k,n,max=999)=>`<label>${n}<input type="number" min="0" max="${max}" value="${c?c[g][k]||0:0}" onchange="kreCelPole(${i},'${g}','${k}',this.value,1)"></label>`;
  return `<div class="krepanel krebig"><div class="kretitle"><span>07</span><div><h2>Napisz własne cele</h2><p>Cel ma warunki, nagrody i może po ukończeniu przemianować partię.</p></div></div><div class="kresectionhead"><div><span>Dziennik</span><h3>${KRE.cele.length} z 12 celów</h3></div><button class="btn" onclick="kreCelDodaj()" ${KRE.cele.length>=12?'disabled':''}>+ Nowy cel</button></div>
    ${KRE.cele.length?`<div class="kregoals"><aside>${KRE.cele.map((x,j)=>`<button class="${j===i?'on':''}" onclick="kreCelWybierz(${j})"><b>${esc(x.nazwa)}</b><span>${esc(krePartiaDane(x.party).ab)}</span></button>`).join('')}</aside><main><div class="kresectionhead"><div><span>Edytujesz</span><h3>${esc(c.nazwa)}</h3></div><button class="btn g sm" onclick="kreCelUsun(${i})">Usuń cel</button></div>
      <div class="kreform trzy"><label>Nazwa celu<input maxlength="70" value="${esc(c.nazwa)}" onchange="kreCelPole(${i},'','nazwa',this.value,1)"></label><label>Partia<select onchange="kreCelPole(${i},'','party',this.value,1)">${partie.map(k=>`<option value="${k}" ${c.party===k?'selected':''}>${esc(krePartiaDane(k).n)}</option>`).join('')}</select></label><label class="wide">Opis<textarea rows="3" maxlength="300" onchange="kreCelPole(${i},'','opis',this.value,1)">${esc(c.opis)}</textarea></label></div>
      <div class="sterlab">Warunki — zero oznacza brak warunku</div><div class="krenumbers cele">${num('war','mem','Liczba ludzi',300)}${num('war','seats','Mandaty',40)}${num('war','fame','Sława',100)}${num('war','cred','Wiarygodność',100)}${num('war','uni','Jedność',100)}${num('war','act','Aktywność',100)}${num('war','ctrMax','Maks. kontrowersja',100)}${num('war','term','Kadencja',50)}${num('war','kp','Kapitał',5000)}${num('war','poll','Sondaż %',100)}<label>Urząd<select onchange="kreCelPole(${i},'war','urzad',this.value,1)">${[['brak','bez warunku'],['premier','premier'],['prezydent','prezydent'],['dowolny','premier lub prezydent']].map(x=>`<option value="${x[0]}" ${c.war.urzad===x[0]?'selected':''}>${x[1]}</option>`).join('')}</select></label></div>
      <div class="sterlab">Nagrody</div><div class="krenumbers cele">${num('nagroda','fame','Sława',100)}${num('nagroda','cred','Wiarygodność',100)}${num('nagroda','uni','Jedność',100)}${num('nagroda','act','Aktywność',100)}${num('nagroda','kp','Kapitał',5000)}${num('nagroda','mem','Nowi ludzie',200)}${num('nagroda','ap','Akcje / tydzień',5)}</div><div class="kreform trzy"><label>Nowa nazwa po celu<input value="${esc(c.nagroda.nazwa)}" onchange="kreCelPole(${i},'nagroda','nazwa',this.value,1)"></label><label>Nowy skrót<input maxlength="4" value="${esc(c.nagroda.ab)}" onchange="kreCelPole(${i},'nagroda','ab',this.value,1)"></label><label>Nowy kolor<input type="color" value="${/^#[0-9a-f]{6}$/i.test(c.nagroda.c||'')?c.nagroda.c:'#d9ab45'}" onchange="kreCelPole(${i},'nagroda','c',this.value,1)"></label></div></main></div>`:`<div class="kreempty"><b>Brak własnych celów</b><span>Dodaj cel, wybierz partię, ustaw warunki i zdecyduj, co dostanie po ukończeniu.</span><button class="btn" onclick="kreCelDodaj()">Tworzę pierwszy cel</button></div>`}</div>`;
}
function kre3EkranWladza(){
  const rm=kre2RzadMandaty(),lista=krePartieLista(),n=k=>krePartiaDane(k),k=KRE.wybrana||lista[0];
  return `<div class="krepanel krebig"><div class="kretitle"><span>08</span><div><h2>Ustaw władzę, gospodarkę i media</h2><p>Nowa partia może dostać urząd, własne wydawnictwa, pieniądze i obowiązujące prawo.</p></div></div>
    <div class="kresectionhead"><div><span>Rząd</span><h3>Kto zaczyna w gabinecie?</h3></div>${KRE.rzadTryb==='wlasny'?`<div class="krequorum ${rm>=MAJ?'good':'bad'}">${rm} / ${MAJ} do większości</div>`:''}</div>
    <div class="krechoices trzy"><button class="${KRE.rzadTryb==='zastany'?'on':''}" onclick="kreRzadTryb('zastany')"><b>Rząd zastany</b><span>układ z normalnej gry</span></button><button class="${KRE.rzadTryb==='brak'?'on':''}" onclick="kreRzadTryb('brak')"><b>Bez rządu</b><span>walka rusza od zera</span></button><button class="${KRE.rzadTryb==='wlasny'?'on':''}" onclick="kreRzadTryb('wlasny')"><b>Własny gabinet</b><span>wybierasz cały skład</span></button></div>
    ${KRE.rzadTryb==='wlasny'?`<div class="kregovbox"><div class="krepartie rozbudowane">${lista.map(k=>`<button class="krep ${KRE.rzadPartie.includes(k)?'on':''}" onclick="kreRzadTog('${k}')" ${!KRE.mandaty[k]?'disabled':''} style="--pc:${n(k).c}">${kreHerb(k,'s')}<span>${esc(n(k).ab)}</span><i>${KRE.mandaty[k]||0}</i></button>`).join('')}</div><label class="kreselect">Partia premiera<select onchange="krePremier(this.value)">${KRE.rzadPartie.map(k=>`<option value="${k}" ${KRE.premier===k?'selected':''}>${esc(n(k).n)} (${esc(n(k).ab)})</option>`).join('')}</select></label>${KRE.premier?`<label class="kreselect">Konkretna osoba<select onchange="krePremierOsoba(this.value)">${kreOsobyPartii(KRE.premier).map(o=>`<option value="${esc(o)}" ${KRE.premierOsoba===o?'selected':''}>${esc(o)}</option>`).join('')}</select></label>`:''}</div>`:''}
    <div class="kresectionhead"><div><span>Pałac</span><h3>Kto jest prezydentem?</h3></div></div><div class="krechoices trzy"><button class="${KRE.prezTryb==='zastany'?'on':''}" onclick="krePrezydentTryb('zastany')"><b>Stan zastany</b><span>Śledzik pozostaje w pałacu</span></button><button class="${KRE.prezTryb==='brak'?'on':''}" onclick="krePrezydentTryb('brak')"><b>Wakat</b><span>nikt nie wetuje</span></button><button class="${KRE.prezTryb==='partia'?'on':''}" onclick="krePrezydentTryb('partia')"><b>Wskaż partię</b><span>jej lider obejmuje urząd</span></button></div>
    ${KRE.prezTryb==='partia'?`<div class="krepartie prez rozbudowane">${lista.map(k=>`<button class="krep ${KRE.prezydent===k?'on':''}" onclick="krePrezydent('${k}')" style="--pc:${n(k).c}">${kreHerb(k,'s')}<span>${esc(n(k).ab)}</span></button>`).join('')}</div>${KRE.prezydent?`<label class="kreselect">Konkretna osoba w pałacu<select onchange="krePrezydentOsoba(this.value)">${kreOsobyPartii(KRE.prezydent).map(o=>`<option value="${esc(o)}" ${KRE.prezydentOsoba===o?'selected':''}>${esc(o)}</option>`).join('')}</select></label>`:''}`:''}
    <div class="kresectionhead"><div><span>Relacje</span><h3>Temperatura całej sceny</h3></div></div><div class="krechoices cztery">${[['zastane','Zastane','historyczne układy'],['zgoda','Odprężenie','wszyscy +32'],['napiecie','Napięcie','wszyscy −10'],['wojna','Wojna','wszyscy −34']].map(x=>`<button class="${KRE.relacje===x[0]?'on':''}" onclick="kreRelacje('${x[0]}')"><b>${x[1]}</b><span>${x[2]}</span></button>`).join('')}</div>
    <div class="kresectionhead"><div><span>Reguły</span><h3>Tempo rozgrywki</h3></div></div><div class="kresuwaki">${KRE2_OGOLNE.map(kre2SuwakEf).join('')}</div>
    <div class="kresectionhead"><div><span>Gospodarka</span><h3>Majątek oraz kasa każdej partii</h3></div></div><div class="kresuwaki"><div class="kresuwak"><div><b>Prywatne majątki całego serwera</b><span>100% to stan zwykłej gry</span></div><input type="range" min="10" max="500" value="${KRE.swiat.majatekMnoznik}" oninput="this.nextElementSibling.textContent=this.value+'%'" onchange="kreSwiatPole('','majatekMnoznik',this.value)"><strong class="m">${KRE.swiat.majatekMnoznik}%</strong></div></div>
    <div class="krepartie rozbudowane">${lista.map(x=>`<button class="krep ${x===k?'on':''}" onclick="krePartia('${x}')" style="--pc:${n(x).c}">${kreHerb(x,'s')}<span>${esc(n(x).ab)}</span></button>`).join('')}</div><div class="kreswiatparty" style="--pc:${n(k).c}">${kreHerb(k,'l')}<div><b>${esc(n(k).n)}</b><span>Startowa kasa i własne media</span></div><label>Kapitał partii<input type="number" min="-500" max="5000" value="${KRE.swiat.bank[k]||0}" onchange="kreSwiatPole('bank','${k}',this.value)"></label><label>Wydawnictwa<select onchange="kreSwiatPole('media','${k}',this.value)">${[0,1,2,3].map(x=>`<option value="${x}" ${(KRE.swiat.media[k]||0)===x?'selected':''}>${x===0?'brak':x===1?'gazeta':x===2?'gazeta + telewizja':'gazeta + telewizja + kino'}</option>`).join('')}</select></label></div>
    <div class="sterlab" style="margin-top:14px">Obecność ${esc(n(k).ab)} w okręgach na starcie</div><div class="kreokregstart">${REG.map(r=>{const v=KRE.swiat.obecnosc[k]?.[r.id]??15;return `<label><span><b>${esc(r.n)}</b><em>${v}/100</em></span><input type="range" min="0" max="100" value="${v}" oninput="this.previousElementSibling.lastElementChild.textContent=this.value+'/100';kreObecnosc('${k}','${r.id}',this.value,0)" onchange="kreObecnosc('${k}','${r.id}',this.value,1)"></label>`}).join('')}</div>
    <div class="kresectionhead"><div><span>Prawo na starcie</span><h3>Ustawy już obowiązujące</h3></div></div><div class="krelaws">${LAWS.map(x=>`<button class="${KRE.swiat.ustawy.includes(x.id)?'on':''}" onclick="kreSwiatPole('ustawy','${x.id}',1)"><b>${esc(x.n)}</b><span>${KRE.swiat.ustawy.includes(x.id)?'obowiązuje':'nie obowiązuje'}</span></button>`).join('')}</div></div>`;
}
function kre3EkranFinal(){
  const wal=kre2Walidacja(),blok=wal.filter(x=>x.blok),n=k=>krePartiaDane(k);
  const rzad=KRE.rzadTryb==='brak'?'brak rządu':KRE.rzadTryb==='zastany'?'rząd zastany':`${KRE.premierOsoba||n(KRE.premier).n} · ${KRE.rzadPartie.map(k=>n(k).ab).join(' · ')}`;
  const prez=KRE.prezTryb==='brak'?'wakat':KRE.prezTryb==='zastany'?'Śledzik (KK)':`${KRE.prezydentOsoba||n(KRE.prezydent).n} — ${n(KRE.prezydent).ab}`;
  return `<div class="krepanel krebig"><div class="kretitle"><span>09</span><div><h2>Ostatnia kontrola</h2><p>Pełny świat: partie, AI, wydarzenia, Sejm, cele, gospodarka i władza.</p></div></div>
    <div class="krefinalhero ${blok.length?'bad':'good'}"><div><span>${blok.length?'Scenariusz wymaga poprawki':'Scenariusz gotowy do gry'}</span><h2>${esc(KRE.nazwa)||'Bez nazwy'}</h2><p>${esc(KRE.opis)||'Brak opisu.'}</p></div><strong>${esc(KRE.trudnosc)}</strong></div>
    <div class="krefinalstats"><div><b>${krePartieLista().length}</b><span>partii</span></div><div><b>${KRE.wydarzenia.length}</b><span>wydarzeń</span></div><div><b>${KRE.cele.length}</b><span>własnych celów</span></div><div><b>${kre2SumaMandatow()}</b><span>mandatów</span></div></div>
    <div class="krefinalgrid"><section><div class="sterlab">Sejm</div>${kre2SeatBar()}<div class="krefinalseats">${krePartieLista().filter(k=>KRE.mandaty[k]).sort((a,b)=>KRE.mandaty[b]-KRE.mandaty[a]).map(k=>`<div>${kreHerb(k,'s')}<span>${esc(n(k).ab)}</span><b>${KRE.mandaty[k]}</b></div>`).join('')}</div></section><section><div class="sterlab">Władza</div><dl class="krefacts"><div><dt>Rząd</dt><dd>${esc(rzad)}</dd></div><div><dt>Prezydent</dt><dd>${esc(prez)}</dd></div><div><dt>Relacje</dt><dd>${esc(KRE.relacje)}</dd></div><div><dt>Kadencja</dt><dd>${KRE.ef.tygodni} tygodni · ${3+KRE.ef.akcje} akcji</dd></div></dl></section></div>
    ${KRE.nowe.length?`<div class="krefinalblock"><div class="sterlab">Nowe partie</div><div class="krefinalpartie">${KRE.nowe.map(x=>`<div>${kreHerb(x.id,'m')}<span><b>${esc(x.nazwa)}</b><small>${esc(x.lider)} · ${x.comp.eli+x.comp.int+x.comp.ser} osób · ${KRE.mandaty[x.id]||0} mandatów</small></span></div>`).join('')}</div></div>`:''}
    ${KRE.cele.length?`<div class="krefinalblock"><div class="sterlab">Własne cele</div>${KRE.cele.map(x=>`<p><b>${esc(n(x.party).ab)}</b> · ${esc(x.nazwa)}</p>`).join('')}</div>`:''}
    <div class="krecheck"><div class="sterlab">Kontrola błędów</div>${wal.length?wal.map(x=>`<button class="${x.blok?'bad':'warn'}" onclick="kreKrok(${x.krok})"><i>${x.blok?'!':'?'}</i><span>${esc(x.t)}</span><b>Popraw →</b></button>`).join(''):`<div class="kreok"><i>✓</i><span>Scenariusz ma poprawne partie, 40 mandatów, działające cele i kompletną władzę.</span></div>`}</div></div>`;
}
function kre2OpisPartii(k){
  const z=KRE.partie[k]||{},p=krePartiaDane(k);
  const nowa=kreNowaZnajdz(k);if(nowa)return `${p.ab}: nowa partia, lider ${nowa.lider}, ${nowa.comp.eli+nowa.comp.int+nowa.comp.ser} osób`;
  const a=Object.keys(z).map(pole=>`${KRE2_NAZWY[pole]||pole} ${Math.round(p[pole]||0)}→${kre2StatFinal(k,pole)}`);
  return a.length?`${p.ab}: ${a.join(', ')}`:'';
}
function kre2EkranFinal(){
  const wal=kre2Walidacja(),blok=wal.filter(x=>x.blok),osobne=krePartieLista().map(kre2OpisPartii).filter(Boolean);
  const rzad=KRE.rzadTryb==='zastany'?'rząd kisielka48':KRE.rzadTryb==='brak'?'brak rządu':`${BASE[KRE.premier]?.ab||'?'} prowadzi gabinet ${KRE.rzadPartie.map(k=>BASE[k].ab).join(' · ')} (${kre2RzadMandaty()} mandatów)`;
  const prez=KRE.prezTryb==='zastany'?'Śledzik (KK)':KRE.prezTryb==='brak'?'wakat':`${BASE[KRE.prezydent].n} — ${BASE[KRE.prezydent].ab}`;
  return `<div class="krepanel krebig"><div class="kretitle"><span>05</span><div><h2>Ostatnia kontrola</h2><p>Tu nie ma ukrytych „+20”. Widzisz dokładnie, co wystartuje.</p></div></div><div class="krefinalhero ${blok.length?'bad':'good'}"><div><span>${blok.length?'Scenariusz wymaga poprawki':'Scenariusz gotowy do gry'}</span><h2>${esc(KRE.nazwa)||'Bez nazwy'}</h2><p>${esc(KRE.opis)||'Brak opisu.'}</p></div><strong>${esc(KRE.trudnosc)}</strong></div><div class="krefinalgrid"><section><div class="sterlab">Sejm · ${TOTAL_SEATS} mandatów</div>${kre2SeatBar()}<div class="krefinalseats">${krePartieLista().filter(k=>KRE.mandaty[k]).sort((a,b)=>KRE.mandaty[b]-KRE.mandaty[a]).map(k=>`<div>${crest(k,'s')}<span>${BASE[k].ab}</span><b>${KRE.mandaty[k]}</b></div>`).join('')}</div></section><section><div class="sterlab">Władza</div><dl class="krefacts"><div><dt>Rząd</dt><dd>${rzad}</dd></div><div><dt>Prezydent</dt><dd>${prez}</dd></div><div><dt>Relacje</dt><dd>${{zastane:'stan zastany',zgoda:'odprężenie +32',napiecie:'napięcie −10',wojna:'wojna −34'}[KRE.relacje]}</dd></div><div><dt>Kadencja</dt><dd>${KRE.ef.tygodni} tygodni · ${3+KRE.ef.akcje} ${pl(3+KRE.ef.akcje,'akcja','akcje','akcji')} na tydzień</dd></div></dl></section></div>${osobne.length?`<div class="krefinalblock"><div class="sterlab">Wyjątki dla partii</div>${osobne.map(x=>`<p>${esc(x)}</p>`).join('')}</div>`:''}<div class="krecheck"><div class="sterlab">Kontrola błędów</div>${wal.length?wal.map(x=>`<button class="${x.blok?'bad':'warn'}" onclick="kreKrok(${x.krok})"><i>${x.blok?'!':'?'}</i><span>${esc(x.t)}</span><b>Popraw →</b></button>`).join(''):`<div class="kreok"><i>✓</i><span>40 mandatów, poprawny układ władzy i komplet danych. Możesz uruchomić próbę albo zapisać plik.</span></div>`}</div></div>`;
}

function kre2Sidebar(){
  const wal=kre2Walidacja(),blok=wal.filter(x=>x.blok),zm=KRE2_POLA.concat(KRE2_OGOLNE).filter(([k,,,,d])=>KRE.ef[k]!==d).length+
    Object.keys(KRE.partie).reduce((a,k)=>a+kreIleZmian(k),0)+KRE.nowe.length+KRE.cele.length+KRE.wydarzenia.length+Object.keys(KRE.edycje).length+Object.keys(KRE.ai).length+Object.keys(KRE.swiat.relacje).length+(KRE.mandatyZm?1:0)+(KRE.rzadTryb!=='zastany'?1:0)+(KRE.prezTryb!=='zastany'?1:0)+(KRE.relacje!=='zastane'?1:0);
  return `<aside class="kreprawa"><div class="kreside"><div class="kresideprog"><i style="width:${(KRE.krok+1)/KRE2_KROKI.length*100}%"></i></div><span class="kresideeyebrow">Krok ${KRE.krok+1} z ${KRE2_KROKI.length}</span><h3 class="kreside-name">${esc(KRE.nazwa)||'Nowy scenariusz'}</h3><p class="kreside-desc">${esc(KRE.opis)||KRE2_KROKI[KRE.krok][1]}</p><div class="kresidemeta"><span>${esc(KRE.trudnosc)}</span><span>${kre2SumaMandatow()}/${TOTAL_SEATS} mandatów</span><span>${zm} zmian</span></div>${kre2SeatBar()}${wal.length?`<div class="kresidewarn ${blok.length?'bad':''}"><b>${blok.length?blok.length+' błędy blokujące':wal.length+' uwagi'}</b><span>${esc((blok[0]||wal[0]).t)}</span></div>`:`<div class="kresidewarn good"><b>Wszystko się zgadza</b><span>Scenariusz przechodzi kontrolę.</span></div>`}<div class="kresidenav">${KRE.krok>0?`<button class="btn g" onclick="kreDalej(-1)">← Wstecz</button>`:''}${KRE.krok<KRE2_KROKI.length-1?`<button class="btn" onclick="kreDalej(1)">Dalej: ${KRE2_KROKI[KRE.krok+1][0]} →</button>`:`<button class="btn" onclick="kreatorProbuj()" ${blok.length?'disabled':''}>Zagraj próbnie</button><button class="btn g" onclick="kreatorSymulator()" ${blok.length?'disabled':''}>Symulator tygodni</button><button class="btn g" onclick="kreatorZapisz()" ${blok.length?'disabled':''}>Zapisz na listę</button><button class="btn g" onclick="kreatorDoPliku()" ${blok.length?'disabled':''}>Zapisz plik .mmscen</button>`}</div><button class="kreodrzuc" onclick="kreWyjdz()">Odrzuć projekt</button></div></aside>`;
}

function kreatorEkran(){
  const ekran=[kre2EkranOpis,kre3EkranPartie,kre3EkranSejm,kre4EkranRelacje,kre4EkranAI,kre4EkranWydarzenia,kre3EkranCele,kre3EkranWladza,kre3EkranFinal][KRE.krok]();
  app.innerHTML=`<div class="kreekran"><header class="krehead"><div><div class="kick">Kreator kampanii</div><h1>Reżyseria żywego świata</h1><p>Dziewięć etapów: partie, liderzy, Sejm, relacje, AI, wydarzenia, cele, gospodarka i władza.</p><div class="kretools"><button class="btn g sm" onclick="kreatorPodglad()">Podgląd</button><button class="btn g sm" onclick="kreatorSymulator()">Symulator</button><button class="btn g sm" onclick="kreatorDraftZapisz()">Zapisz szkic</button><button class="btn g sm" onclick="kreatorDraftWczytaj()">Wczytaj szkic</button><button class="btn g sm" onclick="kreatorEksportJSON()">Eksport JSON</button><button class="btn g sm" onclick="kreatorImportJSON()">Import JSON</button></div></div><button class="btn g sm" onclick="kreWyjdz()">← Lista scenariuszy</button></header>${kre2Stepper()}<div class="krebody"><main class="krelewa">${ekran}</main>${kre2Sidebar()}</div></div>`;
  ['#kn','#ka','#ko'].forEach(s=>{const e=document.querySelector(s);if(e)e.oninput=()=>{kreCzytaj();kreOdswiezPodglad()}});
}
function kreCzytaj(){
  if(!KRE)return;const set=(s,k)=>{const e=document.querySelector(s);if(e)KRE[k]=e.value||''};
  set('#kn','nazwa');set('#ka','autor');set('#ko','opis');
}
function kreOdswiezPodglad(){
  const n=document.querySelector('.kreside-name'),o=document.querySelector('.kreside-desc');
  if(n)n.textContent=KRE.nazwa||'Nowy scenariusz';if(o)o.textContent=KRE.opis||KRE2_KROKI[KRE.krok][1];
  const licz=document.querySelector('#ko+small');if(licz)licz.textContent=KRE.opis.length+'/400';
}
function kre2Blokuje(){
  kreCzytaj();const b=kre2Walidacja().filter(x=>x.blok);if(!b.length)return false;
  modal('Kreator','Najpierw popraw scenariusz',`<p>${esc(b[0].t)}</p>`,[{l:'Pokaż miejsce',f:()=>{close();kreKrok(b[0].krok)}}]);return true;
}
function kreatorDane(){
  const zmiany=[],mod={nazwa:KRE.nazwa.trim(),opis:KRE.opis.trim()||'Scenariusz z kreatora.',
    trudnosc:KRE.trudnosc||'Standard',autor:KRE.autor.trim(),efekty:{wszystkie:{},partie:{}},
    partieNowe:JSON.parse(JSON.stringify(KRE.nowe)),cele:JSON.parse(JSON.stringify(KRE.cele)),
    edycje:JSON.parse(JSON.stringify(KRE.edycje)),ai:JSON.parse(JSON.stringify(KRE.ai)),
    wydarzenia:JSON.parse(JSON.stringify(KRE.wydarzenia)),swiat:JSON.parse(JSON.stringify(KRE.swiat)),konfiguracja:{mandaty:JSON.parse(JSON.stringify(KRE.mandaty)),mandatyZm:!!KRE.mandatyZm,rzadTryb:KRE.rzadTryb,rzadPartie:KRE.rzadPartie.slice(),premier:KRE.premier,premierOsoba:KRE.premierOsoba||null,prezTryb:KRE.prezTryb,prezydent:KRE.prezydent,prezydentOsoba:KRE.prezydentOsoba||null,relacje:KRE.relacje}};
  if(KRE.nowe.length)zmiany.push(`${KRE.nowe.length} ${pl(KRE.nowe.length,'nowa partia','nowe partie','nowych partii')}`);
  if(KRE.cele.length)zmiany.push(`${KRE.cele.length} ${pl(KRE.cele.length,'własny cel','własne cele','własnych celów')}`);
  if(KRE.wydarzenia.length)zmiany.push(`${KRE.wydarzenia.length} ${pl(KRE.wydarzenia.length,'wydarzenie','wydarzenia','wydarzeń')}`);
  if(Object.keys(KRE.edycje).length)zmiany.push(`${Object.keys(KRE.edycje).length} edytowanych partii`);
  KRE2_POLA.forEach(([k,opis,,,dom])=>{if(KRE.ef[k]!==dom){mod.efekty.wszystkie[k]=KRE.ef[k];zmiany.push(`${opis}: ${KRE.ef[k]>0?'+':''}${KRE.ef[k]}`)}});
  KRE2_OGOLNE.forEach(([k,opis,,,dom])=>{if(KRE.ef[k]!==dom){mod.efekty[k]=KRE.ef[k];zmiany.push(`${opis}: ${KRE.ef[k]>0?'+':''}${KRE.ef[k]}`)}});
  Object.keys(KRE.partie).forEach(k=>{if(kreIleZmian(k)){mod.efekty.partie[k]=Object.assign({},KRE.partie[k]);zmiany.push(kre2OpisPartii(k))}});
  if(KRE.mandatyZm){mod.efekty.mandatyStart=Object.assign({},KRE.mandaty);zmiany.push('Nowy podział 40 mandatów')}
  if(KRE.relacje!=='zastane'){mod.efekty.relacjeTryb=KRE.relacje;zmiany.push('Relacje: '+KRE.relacje)}
  if(KRE.rzadTryb!=='zastany'){
    mod.efekty.rzad=KRE.rzadTryb==='brak'?{tryb:'brak'}:{tryb:'wlasny',parties:KRE.rzadPartie.slice(),pm:KRE.premier,pmOsoba:KRE.premierOsoba||null};
    zmiany.push(KRE.rzadTryb==='brak'?'Brak rządu':'Własny rząd: '+KRE.rzadPartie.map(k=>krePartiaDane(k).ab).join(', '));
  }
  if(KRE.prezTryb!=='zastany'){
    mod.efekty.prezydent=KRE.prezTryb==='brak'?{tryb:'brak'}:{tryb:'partia',party:KRE.prezydent,osoba:KRE.prezydentOsoba||null};
    zmiany.push(KRE.prezTryb==='brak'?'Wakat prezydencki':'Prezydent z '+krePartiaDane(KRE.prezydent).ab);
  }
  mod.zmiany=zmiany.join(' · ')||'Bez zmian względem zwykłej gry.';return mod;
}
const KRE_DRAFT_KEY='mm_kreator_scenariusza_v3';
function kreDraftZapiszCichy(){try{if(KRE)localStorage.setItem(KRE_DRAFT_KEY,JSON.stringify(KRE))}catch(e){}}
function kreDraftUsun(){try{localStorage.removeItem(KRE_DRAFT_KEY)}catch(e){}}
function kreDraftNormalizuj(){
  if(!KRE)return;
  KRE.ef=Object.assign({},KRE.ef||{});KRE.partie=Object.assign({},KRE.partie||{});KRE.nowe=Array.isArray(KRE.nowe)?KRE.nowe:[];KRE.cele=Array.isArray(KRE.cele)?KRE.cele:[];KRE.edycje=Object.assign({},KRE.edycje||{});KRE.ai=Object.assign({},KRE.ai||{});KRE.wydarzenia=Array.isArray(KRE.wydarzenia)?KRE.wydarzenia:[];KRE.swiat=Object.assign({relacje:{},bank:{},media:{},obecnosc:{},majatekMnoznik:100,ustawy:[]},KRE.swiat||{});KRE.swiat.relacje=Object.assign({},KRE.swiat.relacje||{});KRE.swiat.bank=Object.assign({},KRE.swiat.bank||{});KRE.swiat.media=Object.assign({},KRE.swiat.media||{});KRE.swiat.obecnosc=Object.assign({},KRE.swiat.obecnosc||{});KRE.swiat.ustawy=Array.isArray(KRE.swiat.ustawy)?KRE.swiat.ustawy:[];
  KRE.wydarzenia.forEach((e,j)=>{e.id=e.id||'EV'+(j+1);e.war=Object.assign({term:0,week:0,odTygodnia:0,coIle:0,przerwa:0,powtarzalne:false,minMandaty:0,maxMandaty:0,minSlawa:0,maxKontrowersja:0,urzad:'brak',poWydarzeniu:'',poTygodniach:0,poOpcji:''},e.war||{});e.opcje=(Array.isArray(e.opcje)?e.opcje:[]).map((o,k)=>Object.assign({id:'O'+(k+1),ai:{},efekty:{}},o))});
}
function kreatorDraftZapisz(){if(!KRE)return;kreDraftZapiszCichy();modal('Kreator','Szkic zapisany',`<p>Robocza wersja <b>${esc(KRE.nazwa||'bez nazwy')}</b> jest zapisana na tym komputerze. Możesz do niej wrócić po ponownym wejściu do kreatora.</p>`,[{l:'Dobrze',f:close}])}
function kreatorDraftWczytaj(){
  let d=null;try{d=JSON.parse(localStorage.getItem(KRE_DRAFT_KEY)||'null')}catch(e){}
  if(!d)return modal('Kreator','Brak szkicu','<p>Nie ma jeszcze zapisanego szkicu scenariusza.</p>',[{l:'Wracam',f:close}]);
  openKreator();KRE=Object.assign(KRE,d);kreDraftNormalizuj();kreatorRys();
}
async function kreatorEksportJSON(){
  if(!KRE)return;const json=JSON.stringify(kreatorDane(),null,2);
  try{await navigator.clipboard.writeText(json);modal('Kreator','JSON skopiowany','<p>Pełny scenariusz jest w schowku. Możesz wkleić go komuś albo zachować jako kopię.</p>',[{l:'Dobrze',f:close}])}
  catch(e){window.prompt('Skopiuj JSON scenariusza:',json)}
}
function kreatorImportJSON(){
  const raw=window.prompt('Wklej JSON scenariusza:','');if(!raw)return;
  try{
    const d=JSON.parse(raw);if(!d||typeof d!=='object')throw new Error('Niepoprawny obiekt');
    openKreator();
    if(d.krok!==undefined&&Array.isArray(d.wydarzenia))KRE=Object.assign(KRE,d);
    else {KRE.nazwa=d.nazwa||'';KRE.opis=d.opis||'';KRE.trudnosc=d.trudnosc||'Standard';KRE.autor=d.autor||'';KRE.nowe=d.partieNowe||[];KRE.cele=d.cele||[];KRE.edycje=d.edycje||{};KRE.ai=d.ai||{};KRE.wydarzenia=d.wydarzenia||[];KRE.swiat=d.swiat||KRE.swiat;const ef=d.efekty||{};KRE.ef=Object.assign(KRE.ef,ef.wszystkie||{});KRE.partie=Object.assign(KRE.partie,ef.partie||{});if(ef.mandatyStart){KRE.mandaty=Object.assign(KRE.mandaty,ef.mandatyStart);KRE.mandatyZm=true}const cfg=d.konfiguracja||{};if(cfg.mandaty)KRE.mandaty=Object.assign(KRE.mandaty,cfg.mandaty);if(cfg.rzadTryb)KRE.rzadTryb=cfg.rzadTryb;if(Array.isArray(cfg.rzadPartie))KRE.rzadPartie=cfg.rzadPartie.slice();if(cfg.premier)KRE.premier=cfg.premier;if(cfg.premierOsoba)KRE.premierOsoba=cfg.premierOsoba;if(cfg.prezTryb)KRE.prezTryb=cfg.prezTryb;if(cfg.prezydent)KRE.prezydent=cfg.prezydent;if(cfg.prezydentOsoba)KRE.prezydentOsoba=cfg.prezydentOsoba;if(cfg.relacje)KRE.relacje=cfg.relacje}
    kreDraftNormalizuj();kreatorRys();
  }catch(e){modal('Kreator','Nie udało się wczytać JSON','<p>Plik ma zły format albo pochodzi ze starej wersji.</p>',[{l:'Wracam',f:close}])}
}
function kreatorPodglad(){
  if(!KRE)return;const d=kreatorDane(),ev=d.wydarzenia||[],chains=ev.filter(e=>e.war&&e.war.poWydarzeniu).map(e=>`${esc(e.nazwa)} ← ${esc(e.war.poWydarzeniu)}${e.war.poOpcji?' / '+esc(e.war.poOpcji):''}`).join('<br>');
  modal('Podgląd scenariusza',esc(d.nazwa||'Bez nazwy'),`<p>${esc(d.opis||'')}</p><div class="krefinalstats"><div><b>${d.partieNowe.length}</b><span>nowych partii</span></div><div><b>${ev.length}</b><span>wydarzeń</span></div><div><b>${d.cele.length}</b><span>celów</span></div></div>${ev.length?`<div class="lawheld" style="margin-top:12px">${ev.map(e=>`<div class="lh"><span><b>${esc(e.nazwa)}</b><small>${esc(e.kategoria||'Wydarzenie')} · ${(e.opcje||[]).length} odpowiedzi</small></span></div>`).join('')}</div>`:''}${chains?`<p class="dim" style="margin-top:12px"><b>Łańcuchy:</b><br>${chains}</p>`:''}`,[{l:'Wracam',f:close}]);
}
let KRE_TEST=null;
function kreTestAbs(){return KRE_TEST?(KRE_TEST.term-1)*KRE_TEST.maxWeeks+KRE_TEST.week:0}
function kreTestPartia(e){
  if(!KRE_TEST)return null;if(e.party==='gracz'||!e.party)return KRE_TEST.party;
  if(e.party==='losowa')return krePartieLista().find(k=>k!==KRE_TEST.party&&(+KRE.mandaty[k]||0)>0)||KRE_TEST.party;
  return KRE.mandaty[e.party]!==undefined?e.party:null;
}
function kreTestMozna(e,k){
  if(!KRE_TEST||!e||!k)return false;const w=e.war||{},st=KRE_TEST.state[e.id]||{},s=KRE_TEST.parties[k]||KRE_TEST.stats,abs=kreTestAbs();
  const popr=w.poWydarzeniu||w.wymagaWydarzenia;
  if(popr){const ps=KRE_TEST.state[popr];if(!ps||!ps.ile)return false;if(w.poOpcji&&ps.opcja!==w.poOpcji)return false;if(w.poTygodniach&&abs-(ps.ostatni||0)<+w.poTygodniach)return false}
  if(w.term&&KRE_TEST.term!==+w.term)return false;if(w.week&&KRE_TEST.week!==+w.week)return false;
  if(w.odTygodnia&&abs<+w.odTygodnia)return false;if(w.coIle&&abs%Math.max(1,+w.coIle)!==0)return false;
  if(!w.powtarzalne&&st.ile)return false;if(w.przerwa&&st.ostatni&&abs-st.ostatni<+w.przerwa)return false;
  if(w.minMandaty&&s.seats<+w.minMandaty)return false;if(w.maxMandaty&&s.seats>+w.maxMandaty)return false;if(w.minSlawa&&s.fame<+w.minSlawa)return false;if(w.maxKontrowersja&&s.ctr>+w.maxKontrowersja)return false;
  if(w.urzad==='premier'&&KRE.premier!==k)return false;if(w.urzad==='prezydent'&&KRE.prezydent!==k)return false;if(w.urzad==='opozycja'&&KRE.rzadPartie.includes(k))return false;return true;
}
function kreTestOpcja(e){
  const os=e.opcje||[];if(!os.length)return null;if(KRE_TEST.tryb!=='ai')return os[0];const score=o=>{const a=o.ai||{},f=o.efekty||{};return (+a.agresja||0)+(+a.media||0)+(+a.prawo||0)+(+a.koalicje||0)+(+a.rozwoj||0)+(+a.ryzyko||0)+(+f.fame||0)*.025+(+f.cred||0)*.02-(+f.ctr||0)*.012};return os.slice().sort((a,b)=>score(b)-score(a))[0]}
function kreTestZastosuj(e,k,o){
  const f=o.efekty||{},s=KRE_TEST.parties[k]||KRE_TEST.stats;['fame','cred','uni','act','ctr','pret'].forEach(x=>{if(isFinite(+f[x]))s[x]=cl(s[x]+(+f[x]||0),-100,100)});if(+f.kapital)KRE_TEST.kapital+=+f.kapital;if(+f.mem)KRE_TEST.ludzie+=+f.mem;
  const st=KRE_TEST.state[e.id]||{ile:0};st.ile++;st.ostatni=kreTestAbs();st.opcja=o.id||o.nazwa||'';KRE_TEST.state[e.id]=st;KRE_TEST.log.push({week:KRE_TEST.week,term:KRE_TEST.term,event:e.nazwa||'bez nazwy',option:o.nazwa||'odpowiedź',party:krePartiaDane(k)?.ab||k});
}
function kreSymulujKrok(){
  if(!KRE_TEST||KRE_TEST.done)return;const next=kreTestAbs()+1;if(next>KRE_TEST.maxWeeks*KRE_TEST.maxTerms){KRE_TEST.done=true;kreSymulujWidok();return}KRE_TEST.term=Math.floor((next-1)/KRE_TEST.maxWeeks)+1;KRE_TEST.week=((next-1)%KRE_TEST.maxWeeks)+1;
  let ile=0;KRE_TEST.events.forEach(e=>{const k=kreTestPartia(e);if(k&&kreTestMozna(e,k)){const o=kreTestOpcja(e);if(o){kreTestZastosuj(e,k,o);ile++}}});KRE_TEST.last=ile;kreSymulujWidok();
}
function kreSymulujStart(){
  if(!KRE||kre2Blokuje())return;const party=KRE.wybrana&&KRE.mandaty[KRE.wybrana]!==undefined?KRE.wybrana:krePartieLista()[0],parties={};krePartieLista().forEach(k=>{parties[k]={seats:+KRE.mandaty[k]||0,fame:kre2StatFinal(k,'fame'),cred:kre2StatFinal(k,'cred'),uni:kre2StatFinal(k,'uni'),act:kre2StatFinal(k,'act'),ctr:kre2StatFinal(k,'ctr'),pret:kre2StatFinal(k,'pret')}});
  KRE_TEST={week:0,term:1,maxWeeks:Math.max(1,+KRE.ef.tygodni||12),maxTerms:3,party,parties,events:JSON.parse(JSON.stringify(KRE.wydarzenia||[])),state:{},log:[],tryb:'pierwsza',done:false,last:0,kapital:+KRE.ef.kapital||0,ludzie:0,stats:parties[party]};kreSymulujWidok();
}
function kreSymulujWidok(){
  if(!KRE_TEST)return;const s=KRE_TEST.stats,party=krePartiaDane(KRE_TEST.party)||{},logs=KRE_TEST.log.slice().reverse();
  const logHtml=logs.length?logs.map(x=>`<div class="lh"><span><b>K${x.term} · T${x.week}</b> ${esc(x.event)}</span><small>${esc(x.party)}: ${esc(x.option)}</small></div>`).join(''):'<p class="dim">Jeszcze nic się nie wydarzyło. Przewiń pierwszy tydzień.</p>';
  const body=`<p>Suchy test scenariusza dla partii <b>${esc(party.ab||KRE_TEST.party)}</b>. Nie zmienia prawdziwej rozgrywki.</p><div class="krefinalstats"><div><b>K${KRE_TEST.term} · T${KRE_TEST.week}</b><span>czas testu</span></div><div><b>${KRE_TEST.log.length}</b><span>odpalonych wydarzeń</span></div><div><b>${s.fame}</b><span>sława</span></div><div><b>${s.cred}</b><span>wiarygodność</span></div></div><div class="kretestscores"><span>Jedność <b>${s.uni}</b></span><span>Aktywność <b>${s.act}</b></span><span>Kontrowersja <b>${s.ctr}</b></span><span>Kapitał <b>${KRE_TEST.kapital}</b></span></div><div class="lawheld kretestlog">${logHtml}</div>`;
  const stop=()=>{KRE_TEST=null;close()};modal('Symulator scenariusza',esc(KRE.nazwa||'Bez nazwy'),body,[{l:KRE_TEST.done?'Koniec testu':'Następny etap czasu',s:KRE_TEST.done?'':'Uruchom warunki i wydarzenia',f:()=>kreSymulujKrok(),dis:KRE_TEST.done},{l:KRE_TEST.tryb==='ai'?'Wybór: AI':'Wybór: pierwsza odpowiedź',s:'Zmień sposób podejmowania decyzji',f:()=>{KRE_TEST.tryb=KRE_TEST.tryb==='ai'?'pierwsza':'ai';kreSymulujWidok()}},{l:'Restart',f:()=>kreSymulujStart()},{l:'Zamknij',f:stop}],stop);
}
function kreatorSymulator(){kreSymulujStart()}
function kreatorProbuj(){
  if(kre2Blokuje())return;const dane=kreatorDane(),id='kreator-proba';
  SCEN[id]={n:dane.nazwa,t:dane.trudnosc,d:dane.opis,mod:dane.zmiany,zModa:true,autor:dane.autor,
    efekty:dane.efekty,partieNowe:dane.partieNowe,cele:dane.cele,edycje:dane.edycje,ai:dane.ai,wydarzenia:dane.wydarzenia,swiat:dane.swiat,
    apply(){modEfekty(dane.efekty);scenRuntimeStart(dane)}};
  SCENSEL=id;KRE=null;G=null;MENU=false;MODE='free';scenPartieAktywuj(id);render();
}
async function kreatorDoPliku(){
  if(kre2Blokuje())return;const plik=await zapiszScenPlik(kreatorDane());
  if(plik)modal('Zapisany','Scenariusz w pliku',`<p>Zapisałem <b>${esc(plik)}</b>. Możesz go wysłać komu chcesz — wczyta go przyciskiem <b>Wczytaj z pliku</b>.</p>`,[{l:'Dobra',f:close}]);
}
async function kreatorZapisz(){
  if(!KRE||kre2Blokuje())return;const mod=kreatorDane(),a=(window.pywebview&&window.pywebview.api)||null;
  if(!a||!a.mod_zapisz)return modal('Kreator','Nie mam gdzie tego zapisać','<p>Zapis modów działa w wersji na komputer. W przeglądarce nie ma dostępu do plików.</p>',[{l:'Rozumiem',f:()=>{close();render()}}]);
  let wynik=null;try{wynik=await a.mod_zapisz(mod)}catch(e){wynik={ok:false,blad:e.message}}
  kreDraftUsun();KRE=null;close();
  if(wynik&&wynik.ok){await wczytajMody();render();modal('Kreator','Scenariusz zapisany',`<p><b>${esc(mod.nazwa)}</b> jest już na liście scenariuszy.</p><p style="margin-top:10px">Plik leży w katalogu modów — możesz go wysłać komuś, a on zagra w ten sam świat.</p>`,[{l:'Dobrze',f:()=>{close();render()}}])}
  else modal('Kreator','Nie udało się zapisać',`<p>${esc((wynik&&wynik.blad)||'Nieznany błąd.')}</p>`,[{l:'Trudno',f:()=>{close();render()}}]);
}

async function openMody(){
  const a=(window.pywebview&&window.pywebview.api)||null;
  let folder='';
  try{folder=a&&a.mody_folder?await a.mody_folder():''}catch(e){}
  modal('Mody',`Wgrane mody: ${MODY.length}`,
    `<p>Mody to pojedyncze pliki. Żeby dodać cudzy scenariusz, wrzuć jego plik do katalogu
     modów i uruchom grę ponownie.</p>
     ${folder?`<div class="note" style="margin:12px 0"><b>Katalog modów</b><br>
       <span style="font-family:var(--m);font-size:11.5px;word-break:break-all">${esc(folder)}</span></div>`:''}
     ${MODY.length?`<div class="lawheld">${MODY.map(m=>
       `<div class="lh"><span>${esc(m.nazwa)}${m.autor?' — '+esc(m.autor):''}</span>
         <button class="btn g sm" onclick="modUsun('${esc(m.plik||'')}')">Usuń</button></div>`).join('')}</div>`
      :'<p class="dim">Nie masz jeszcze żadnych modów. Zrób własny w kreatorze.</p>'}`,
    [{l:'Zamykam',f:()=>{close();render()}}]);
}
async function modUsun(plik){
  const a=(window.pywebview&&window.pywebview.api)||null;
  if(!a||!a.mod_usun||!plik)return;
  try{await a.mod_usun(plik)}catch(e){}
  await wczytajMody();
  close();render();
  openMody();
}

/* ══════════ 1.6 TEST · FALA 2 ══════════ */

/* ─── wspólne klocki ekranów pełnoekranowych ───
   Cała ścieżka po wyborach — dzień, obie noce, wyniki, prezydium, premier —
   jest zbudowana z tych samych trzech rzeczy: sztandaru z tabliczkami,
   płyty na treść i przyklejonej stopki z przyciskiem. Trzymamy je w jednym
   miejscu, żeby nie przepisywać sztandaru w dziewięciu ekranach z osobna
   i żeby zmiana wyglądu szła wszędzie naraz. */
function sztandar(kick,tytul,tresc,tabl){
  return `<div class="nocsz">
    <div class="kick">${kick}</div>
    <h1>${tytul}</h1>
    ${tresc?`<p>${tresc}</p>`:''}
    ${tabl&&tabl.length?`<div class="tabliczki">${tabl.map(t=>
      `<div><b>${t[0]}</b><span>${t[1]}</span></div>`).join('')}</div>`:''}
  </div>`;
}
function ekstopka(legenda,przyciski){
  return `<div class="ekstopka">${legenda?`<span class="ekleg">${legenda}</span>`:''}${przyciski}</div>`;
}
const ekran=tresc=>`<div class="nocekran">${tresc}</div>`;

/* ---- noc wyborcza ---- */
function startNight(){
  const {votes}=G.result;
  const total=Object.values(votes).reduce((a,b)=>a+b,0)||1;
  const grp={};
  alive().forEach(k=>{const c=G.p[k].coal&&CO()[G.p[k].coal]?G.p[k].coal:k;
    (grp[c]=grp[c]||{m:[],st:0,v:0}).m.push(k);grp[c].st+=G.p[k].seats;grp[c].v+=votes[k]});
  const prevH=G.hist.length>1?G.hist[G.hist.length-2].seats:null;
  const rows=Object.keys(grp).map(c=>{const g=grp[c],lista=!!CO()[c];
    return {ab:lista?c:G.p[c].ab, n:lista?CO()[c].n:G.p[c].n, m:g.m, st:g.st,
      pct:g.v/total*100, col:lista?(CO()[c].c||G.p[g.m[0]].c):G.p[c].c, mine:g.m.includes(G.me),
      /* próg tej listy: im więcej partii pod jednym szyldem, tym wyżej.
         Bez tego noc nie mówi najważniejszej rzeczy — kto siada tuż pod kreską. */
      thr:thrFor(g.m.length), we:g.st>0, gl:g.v,
      d:prevH?g.st-g.m.reduce((a,k)=>a+(prevH[k]||0),0):null}})
    .sort((a,b)=>b.pct-a.pct);
  G.night={i:0,done:false,rows,total};
}
function nightScreen(){
  const N=G.night, poz=N.rows.length, settled=N.i>=poz, remain=poz-N.i;
  /* Zszywanie ekranu porównuje dzieci po numerze, więc lista musi rosnąć NA KOŃCU.
     Wcześniej nowy wynik dochodził na początek: każdy wiersz podmieniał treść
     w cudzym węźle, przez co nowa lista wjeżdżała bez ruchu, a przerysowywany
     był wiersz na samym dole — ten pokazany dawno temu. Dlatego w treści idą
     od najsłabszej, a .nightbox odwraca je z powrotem, żeby zwycięzca był u góry.

     Z tego samego powodu pusty cokół i cokół z nazwiskiem mają różne id:
     zszywanie porównuje węzły po id, więc dopiero to robi z tego wymianę węzła,
     a nie podmianę treści w starym — i animacja wjazdu ma się na czym odpalić. */
  const podane=N.rows.slice(poz-N.i), ujawnione=podane.slice().reverse();
  const max=Math.max(...N.rows.map(r=>r.pct),1);
  const zwyc=settled?N.rows[0]:null;
  // starsze zapisy nie mają w wierszu ani progu, ani liczby głosów — stąd zapasy
  const glosy=r=>r.gl!==undefined?r.gl:Math.round(r.pct/100*N.total);
  const wszedl=r=>r.we!==undefined?r.we:r.st>0;
  const policzone=podane.reduce((a,r)=>a+glosy(r),0);
  const kolejnosc=N.rows.slice().reverse();     // komisje podają od najsłabszej
  app.innerHTML=`
  <div class="nocekran">
    <div class="nocsz">
      <div class="kick">Noc wyborcza · kadencja ${G.term}</div>
      <h1>${settled?'Wszystko policzone':remain===1?'Ostatnia lista, ta najważniejsza…':'Liczymy głosy'}</h1>
      <p>${settled?'Komisje zamknęły protokoły. Tak wygląda nowy sejm.'
        :'Komisje podają wyniki od najsłabszej listy.'}</p>
      <div class="tabliczki">
        <div><b>${policzone}</b><span>policzone głosy</span></div>
        <div><b>${N.i}/${poz}</b><span>podane listy</span></div>
        <div><b>${Math.round(N.total/SERVER*100)}%</b><span>frekwencja</span></div>
        <div><b>${TOTAL_SEATS}</b><span>mandatów w grze</span></div>
      </div>
      <div class="nockom">
        <span class="luke">komisje</span>
        <div class="nockomt">${kolejnosc.map((r,j)=>
          `<i class="${j<N.i?'on':''}" style="--pc:${r.col}"></i>`).join('')}</div>
        <span class="luke">${settled?'wszystkie podały':`zostało ${remain}`}</span>
      </div>
    </div>

    <div class="noccokol ${zwyc?'jest':''}">
      <div class="mramka"></div>
      <div class="luke">Zwycięzca nocy</div>
      ${zwyc?`<div class="nocczolo" id="cokol-jest">
          <div class="ncrest">${zwyc.m.slice(0,4).map(k=>crest(k,'m')).join('')}</div>
          <div class="noccn"><b>${zwyc.n}</b><span>${zwyc.m.map(k=>G.p[k].ab).join(' · ')}</span></div>
          <div class="noccl"><b>${zwyc.st}</b><em>${pl(zwyc.st,'mandat','mandaty','mandatów')}</em></div>
          <div class="noccp"><b>${fmt(zwyc.pct)}%</b><em>poparcia</em></div>
        </div>`
       :`<div class="noccpusto" id="cokol-pusty">Cokół czeka. Komisje jeszcze liczą.</div>`}
    </div>

    <div class="nocplyta">
      <div class="nightbox">
        ${ujawnione.map((r,j)=>{
          const miejsce=poz-j, thr=r.thr||0;
          const thrL=thr?cl(thr/max*100,0,100):0;
          return `<div class="nrow ${r.mine?'me':''} ${wszedl(r)?'':'out'}" style="--pc:${r.col}">
            <div class="npos">${miejsce}</div>
            <div class="ncrest">${r.m.slice(0,4).map(k=>crest(k,'s')).join('')}</div>
            <div class="nname"><b>${r.n}</b><span>${r.m.map(k=>G.p[k].ab).join(' · ')}</span></div>
            <div class="ntrk"><i style="width:${(r.pct/max*100).toFixed(1)}%;background:${r.col};color:${r.col}"></i>
              ${thr?`<u style="left:${thrL.toFixed(1)}%" title="próg tej listy: ${thr}%"></u>`:''}</div>
            <div class="npct">${fmt(r.pct)}%</div>
            <div class="nseat"><b>${r.st}</b><em>${pl(r.st,'mandat','mandaty','mandatów')}</em></div>
            <div class="ndelta ${r.d===null||r.d===0?'pusto':r.d>0?'up':'dn'}">${
              r.d!==null&&r.d!==0?(r.d>0?'+':'')+r.d:''}</div>
          </div>`}).join('')}
      </div>
      ${N.i?'':'<div class="nocczek">Komisje zaraz podadzą pierwsze wyniki…</div>'}
    </div>

    <div class="ekstopka">
      <span class="ekleg">kreska w pasku to próg tej listy</span>
      <button class="btn ${settled?'':'g'}" onclick="${settled?'nightEnd()':'nightSkip()'}">${
        settled?'Przechodzę do wyników →':'Pokaż wszystko od razu'}</button>
    </div>
  </div>`;
  if(!settled)setTimeout(nightStep,remain<=1?1300:remain===2?820:(N.i<2?520:Math.max(260,560-N.i*45)));
}
function nightStep(){
  if(!G.night||G.night.i>=G.night.rows.length)return;
  G.night.i++;
  const r=G.night.rows[G.night.rows.length-G.night.i];
  beep(300+G.night.i*45,.07,'triangle',r.mine?.06:.03);
  liczenie(true);
  if(G.night.i===G.night.rows.length){
    setTimeout(()=>{const zwyc=G.night.rows[0];
      if(zwyc.mine){SFX.elect();burst(null,140,1)}else SFX.gong()},260);
    liczenie(false);
  }
  render();
}
function nightSkip(){if(G.night){G.night.i=G.night.rows.length;render()}}
function nightEnd(){if(G.night)G.night.done=true;render()}
/* ---- raport kadencji ---- */
function ocena(v){return v>=92?'A+':v>=82?'A':v>=72?'B':v>=60?'C':v>=45?'D':'F'}
function raport(){
  const H=G.hist,cur=H[H.length-1],prev=H.length>1?H[H.length-2]:null;
  const p=me();
  const dS=prev?cur.seats[G.me]-(prev.seats[G.me]||0):cur.seats[G.me];
  const dP=prev?cur.pct-prev.pct:cur.pct;
  const dM=prev&&prev.mem!==undefined?p.mem-prev.mem:p.mem;
  const cele=Object.keys(G.goals||{}).length-(prev&&prev.goals!==undefined?prev.goals:0);
  const urzedy=(cur.pm===G.me?1:0)+(G.prez&&G.prez.party===G.me?1:0);
  const pola=[
   {n:'Mandaty',v:cl(50+dS*9,0,100),o:`${dS>0?'+':''}${dS}`,d:'zmiana względem poprzednich wyborów'},
   {n:'Poparcie',v:cl(50+dP*5,0,100),o:`${dP>0?'+':''}${fmt(dP)} pkt`,d:'zmiana wyniku procentowego'},
   {n:'Ludzie',v:cl(46+dM*3.4,0,100),o:`${dM>0?'+':''}${dM}`,d:'przyrost składu partii'},
   {n:'Kondycja',v:cl((p.fame+p.cred+p.uni+p.act)/4,0,100),o:Math.round((p.fame+p.cred+p.uni+p.act)/4)+'/100',d:'średnia ze sławy, wiarygodności, jedności i aktywności'},
   {n:'Spokój',v:cl(100-p.ctr,0,100),o:Math.round(p.ctr)+' kontrowersji',d:'im mniej awantur, tym lepiej'},
   {n:'Ambicje',v:cl(30+cele*30+urzedy*20,0,100),o:`${cele} ${pl(cele,'cel','cele','celów')} · ${urzedy} ${pl(urzedy,'urząd','urzędy','urzędów')}`,d:'wypełnione cele partyjne i sprawowane urzędy'},
  ];
  const sr=pola.reduce((a,x)=>a+x.v,0)/pola.length;
  const werdykt=sr>=82?'Kadencja, o której serwer będzie gadał.':sr>=72?'Solidna robota, widać kierunek.'
    :sr>=60?'Ani wielki sukces, ani wpadka. Da się lepiej.':sr>=45?'Słabo. Coś tu nie zagrało.'
    :'Katastrofa. Trzeba zmienić wszystko.';
  return `<div class="card raport"><div class="h"><h3>Raport kadencji ${G.term}</h3>
    <span class="n">${prev?'porównanie z kadencją '+prev.term:'pierwsza kadencja'}</span></div><div class="b">
    <div class="rgrade"><div class="rletter ${sr>=72?'ok':sr>=45?'mid':'bad'}">${ocena(sr)}</div>
      <div><b>${werdykt}</b><p>Ocena łączna ${Math.round(sr)} na 100, liczona z sześciu obszarów.</p></div></div>
    <div class="rgrid">${pola.map(x=>`<div class="rcell">
      <div class="rtop"><span>${x.n}</span><b class="${x.v>=72?'ok':x.v>=45?'':'bad'}">${ocena(x.v)}</b></div>
      <div class="rbar"><i style="width:${x.v.toFixed(0)}%"></i></div>
      <div class="rval">${x.o}</div><div class="rdesc">${x.d}</div>
    </div>`).join('')}</div>
  </div></div>`;
}
/* ---- serwerowy kurier ---- */
function kurier(){
  const p=me(),H=G.polls||[];
  const ost=H.length>1?H[H.length-1]:null, przed=H.length>2?H[H.length-2]:null;
  let skok=null;
  if(ost&&przed){let best=null;
    alive().forEach(k=>{const d=(ost.s[k]||0)-(przed.s[k]||0);
      if(!best||Math.abs(d)>Math.abs(best.d))best={k,d}});
    if(best&&Math.abs(best.d)>=.6)skok=best;
  }
  const lead=alive().sort((a,b)=>G.p[b].seats-G.p[a].seats)[0];
  const naglowki=[];
  if(p.ctr>=96)naglowki.push([`${p.ab} TONIE W AWANTURACH`,'Serwer mówi już tylko o tym, komu podpadliście w tym tygodniu.']);
  if(isPM())naglowki.push([`RZĄD ${p.ab} PRACUJE`,`${p.lead} zapowiada, że wszystko idzie zgodnie z planem. Nikt nie zna planu.`]);
  if(skok&&skok.d>0)naglowki.push([`${G.p[skok.k].ab} W GÓRĘ O ${fmt(skok.d)} PKT`,`Najlepszy tydzień ${G.p[skok.k].n} od dawna.`]);
  if(skok&&skok.d<0)naglowki.push([`${G.p[skok.k].ab} TRACI ${fmt(-skok.d)} PKT`,`W kuluarach mówią o zmianie kursu.`]);
  if(p.mem<=3)naglowki.push([`CZY ${p.ab} TO JESZCZE PARTIA?`,'Trzy osoby, jeden kanał i dużo dobrych chęci.']);
  if((G.streak||0)>=4)naglowki.push([`${p.ab} NIE ZWALNIA`,`Czwarty tydzień z rzędu z realnymi ruchami. Konkurencja patrzy.`]);
  if(G.sits&&G.sits.some(x=>!x.done))naglowki.push(['SYTUACJA BEZ ROZSTRZYGNIĘCIA','Serwer czeka, aż ktoś w końcu podejmie decyzję.']);
  naglowki.push([`${G.p[lead].ab} NA CZELE SEJMU`,`${G.p[lead].seats} ${pl(G.p[lead].seats,'mandat','mandaty','mandatów')} i coraz większa pewność siebie.`]);
  naglowki.push(['CISZA NA KANAŁACH','Tydzień bez skandalu. Redakcja odnotowuje z niedowierzaniem.']);
  const wybor=naglowki[(G.term*7+G.week)%Math.min(naglowki.length,3)]||naglowki[0];
  return `<div class="kurier">
    <div class="kglowa"><b>Serwerowy Kurier</b><span>${dateStr(gameDate())} · nakład 670</span></div>
    <h3>${wybor[0]}</h3><p>${wybor[1]}</p>
  </div>`;
}
/* ---- rywal ---- */
/* ---- skróty klawiszowe ---- */
function initKeys(){
  if(initKeys.done||typeof document==='undefined'||!document.addEventListener)return;
  initKeys.done=1;
  document.addEventListener('keydown',e=>{
    if(!G)return;
    if(e.target&&/input|textarea/i.test(e.target.tagName||''))return;
    /* Spacja steruje wyłącznie zegarem. Nie istnieje już skrót „następny
       tydzień”, bo kalendarz ma płynąć niezależnie od kliknięć gracza. */
    if(e.code==='Space'){e.preventDefault();if(typeof realClockToggle==='function')realClockToggle();return}
    if(document.getElementById('veil'))return;
    const T=['mapa','akcje','lider','krol','sondaz','cele','sejm'];
    if(e.key>='1'&&e.key<='7'){const t=T[+e.key-1];if(t){G.tab=t;if(G.tutSeen)G.tutSeen[t]=1;render()}}
    else if(e.key==='m'||e.key==='M')toggleMute();
  });
}


/* Iskra — miniaturowy wykres wklejany wprost w podpowiedź. U nich dymki
   pokazują historię obok liczby, więc widać nie tylko ile, ale i dokąd to
   idzie. Rysowany jako SVG w treści, bez żadnej biblioteki. */
function iskra(dane,kolor,W,H){
  const d=(dane||[]).filter(x=>isFinite(x));
  if(d.length<2)return '';
  W=W||240;H=H||46;
  const mn=Math.min(...d),mx=Math.max(...d),roz=Math.max(1e-9,mx-mn);
  const x=i=>(i/(d.length-1)*(W-4)+2).toFixed(1);
  const y=v=>(H-4-((v-mn)/roz)*(H-10)).toFixed(1);
  const linia=d.map((v,i)=>`${i?'L':'M'}${x(i)},${y(v)}`).join(' ');
  const pole=`M${x(0)},${H} L`+d.map((v,i)=>`${x(i)},${y(v)}`).join(' L')+` L${x(d.length-1)},${H} Z`;
  const k=kolor||'var(--acc)';
  return `<svg class="iskra" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
    <path d="${pole}" fill="${k}" fill-opacity=".14"/>
    <path d="${linia}" fill="none" stroke="${k}" stroke-width="1.8"
      stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${x(d.length-1)}" cy="${y(d[d.length-1])}" r="2.6" fill="${k}"/>
  </svg>`;
}

/* ══════════ LISTA WAŻNYCH AKCJI ══════════
   Wzięte z paska alertów Victorii: rząd znaczników, z których każdy mówi
   „tu czeka na ciebie decyzja". Wcześniej trzeba było obejść wszystkie działy,
   żeby sprawdzić, czy gdzieś czegoś nie przegapiłeś — ustawa do podpisu,
   sytuacja bez rozstrzygnięcia, gotowy cel, wydawnictwo gotowe do wydania.
   Teraz wszystko woła samo, a kliknięcie prowadzi wprost tam, gdzie trzeba. */
function waznePozycje(){
  if(!G||!G.p||!G.p[G.me])return [];
  const w=[];
  if(hasPrez()&&lawsToSign().length)
    w.push({i:'✒',n:'Ustawa czeka na podpis',d:'Prezydent musi ją podpisać albo zawetować.',t:'prezydent',pilne:1});
  if(isPM()&&lawsPending())
    w.push({i:'§',n:'Możesz zgłosić ustawę',d:'Żadna nie jest w toku — sejm czeka.',t:'premier'});
  (G.sits||[]).filter(x=>!x.done).forEach(x=>{
    const S=SITS[x.id];
    w.push({i:'!',n:S?S.k:'Sytuacja na serwerze',d:S?S.n:'Coś się dzieje i czeka na rozstrzygnięcie.',t:'sejm',pilne:1});
  });
  if(goalReady())
    w.push({i:'★',n:'Cel partyjny gotowy',d:'Warunki spełnione — możesz go odebrać.',t:'cele',pilne:1});
  if(typeof nationalGoalReady==='function'&&nationalGoalReady())
    w.push({i:'◆',n:'Cel narodowy w toku',d:'Dziennik przełomów odlicza dni. Otwórz zakładkę Celów, żeby zobaczyć warunek i postęp.',t:'cele'});
  if(leads(G.p[G.me]).some(n=>xpOs(n)>=35))
    w.push({i:'▲',n:'Doświadczenie do wydania',d:'Przewodniczący może podnieść cechę albo kupić nową.',t:'lider'});
  if(kingFav(G.me)<0)
    w.push({i:'♛',n:'Król jest na ciebie zły',d:'Przy ujemnej przychylności desygnacja przejdzie obok ciebie.',t:'krol',pilne:1});
  if(G.ap>0)
    w.push({i:'●',n:`${G.ap} ${pl(G.ap,'ruch','ruchy','ruchów')} do wykorzystania`,d:'Niewykorzystane akcje przepadają z końcem tygodnia.',t:'akcje'});
  if(mediaJest())(G.media||[]).filter(m=>mediaGotowe(m)).forEach(m=>
    w.push({i:'📰',n:`${m.nazwa} czeka na wydanie`,d:'Wydawnictwo jest gotowe, a nic z niego nie wychodzi.',t:'media'}));
  const p=me();
  if(p.ctr>=82)w.push({i:'✖',n:'Kontrowersja pod sufitem',d:`${Math.round(p.ctr)}/100. Przy 96 partia wpada w paraliż.`,t:'mapa',pilne:1});
  const szef=p.lead, kies=szef?kapPryw(szef):0;
  if(kies<0)w.push({i:'✖',n:'Przewodniczący pod kreską',d:`Dług rośnie o ${Math.round(DLUG_ODSETKI*100)}% tygodniowo.`,t:'ekonomia',pilne:1});
  return w;
}
function waznePasek(){
  const w=waznePozycje(); if(!w.length)return '';
  // Pasek ma pomagać, nie zamieniać się w drugi dziennik. Pokazujemy dwa
  // najpilniejsze tropy; reszta zostaje widoczna jako licznik i w badge'ach.
  const pokaz=w.slice().sort((a,b)=>Number(!!b.pilne)-Number(!!a.pilne)).slice(0,2);
  return `<div class="wazne">
    <span class="wazneet" title="Ważne rzeczy do zrobienia">!</span>
    <div class="waznelista">${pokaz.map(x=>
      `<button class="waz ${x.pilne?'pilne':''}" onclick="setTab('${x.t}')" title="${esc(x.d)}">
        <i>${x.i}</i><span>${esc(x.n)}</span></button>`).join('')}${w.length>pokaz.length?`<span class="wazwiecej">+${w.length-pokaz.length} w zakładkach</span>`:''}</div>
  </div>`;
}

/* ══════════ PANEL MODYFIKATORÓW ══════════
   U nich to lista wszystkiego, co aktualnie działa na kraj, razem ze źródłem.
   U nas siedziała kupa liczb, których gracz nie widział na oczy: znużenie
   władzą, momentum, przewaga po zjeździe, inflacja, zmęczenie decyzją,
   mnożnik rangi i zasięg mediów. Tu wszystko stoi w jednym miejscu. */
function modyfikatory(){
  const p=me(),m=[];
  const z=znuzenie(G.me);
  if(z>0.5)m.push({n:'Zmęczenie władzą',v:`−${Math.round(z/1.65)}% poparcia`,zle:1,
    zr:'Każda kadencja u steru dokłada, kadencja w opozycji zdejmuje.'});
  if(Math.abs(p.mom||0)>1)m.push({n:'Momentum',v:`${(p.mom||0)>0?'+':''}${Math.round(p.mom||0)}`,zle:(p.mom||0)<0,
    zr:'Wygrane debaty, udane afery i owacyjne wiece. Wygasa o 17% tygodniowo.'});
  if(p.rally)m.push({n:'Przewaga po zjeździe',v:`+${p.rally*9}% do wyborów`,
    zr:'Zjazd partii. Trzyma do końca kadencji.'});
  if(p.laws)m.push({n:'Dorobek ustawodawczy',v:`+${(p.laws*3)}% do wyniku`,
    zr:'Ustawy, które przepchnąłeś. Zostają na zawsze.'});
  const inf=inflacjaProc();
  if(inf>0)m.push({n:'Inflacja',v:`decyzje +${inf}% drożej`,zle:1,
    zr:`Kapitał ponad ${INFLACJA_PROG}. Im większy zapas leży w kasie, tym drożej.`});
  const sf=sizeF(p);
  if(sf.lab)m.push({n:sf.lab,v:`koszt ×${sf.kp.toFixed(2)}`,zle:sf.kp>1,
    zr:'Im większa partia, tym drożej się nią rusza.'});
  const zas=zasiegMediow();
  if(zas>0)m.push({n:'Zasięg mediów',v:`+${zas.toFixed(1)}% w sondażu`,
    zr:'Wydawnictwa, z których coś wychodzi. Zasięg wygasa, jeśli nic nie wydajesz.'});
  const mr=mnoznikRangi(p.lead);
  if(mr>1)m.push({n:`Ranga: ${(ranga(p.lead)||{}).n||'—'}`,v:`zarobek ×${mr.toFixed(2)}`,
    zr:'Każdy zdobyty stopień to +18% do tego, co przewodniczący zarabia.'});
  const uz=Object.keys(G.used||{}).filter(k=>G.used[k]>0);
  if(uz.length)m.push({n:'Zmęczenie decyzjami',v:`${uz.length} ${pl(uz.length,'powtórzona','powtórzone','powtórzonych')}`,zle:1,
    zr:'Ta sama zagrywka w kółko działa coraz słabiej. Odpuszczenie ją regeneruje.'});
  (G.sits||[]).filter(x=>!x.done).forEach(x=>{const S=SITS[x.id];
    if(S)m.push({n:S.k,v:'trwa',zle:1,zr:S.n})});
  if(G.absolutorium&&G.absolutorium.term===G.term-1&&!G.absolutorium.udzielone)
    m.push({n:'Brak absolutorium',v:'z poprzedniej kadencji',zle:1,
      zr:'PKB spadło, a sejm to zapisał.'});
  return `<div class="card mods"><div class="h"><h3>Co na ciebie działa</h3>
    <span class="n">${m.length} ${pl(m.length,'modyfikator','modyfikatory','modyfikatorów')}</span></div><div class="b">
    ${m.length?`<div class="modlista">${m.map(x=>`<div class="modw ${x.zle?'zle':'ok'}">
      <div class="modl"><b>${x.n}</b><span>${x.zr}</span></div>
      <div class="modv">${x.v}</div></div>`).join('')}</div>`
     :'<p class="dim" style="margin:0">Nic szczególnego. Czysta kartka.</p>'}
  </div></div>`;
}


/* ══════════ RADYKAŁOWIE I LOJALIŚCI ══════════
   U nich ludność dzieli się na radykałów i lojalistów zależnie od tego, jak jej
   się żyje. U nas tak samo: przy awanturze i rozsypanej partii część składu
   radykalizuje się i zaczyna szkodzić, przy wiarygodności i zgodzie rośnie
   twardy trzon, którego nikt ci nie podbierze. */
function radykalowie(k){
  const p=G.p[k||G.me]; if(!p)return {rad:0,loj:0};
  const rad=Math.round(p.mem*cl(p.ctr/100*.55+(60-p.uni)/100*.35,0,.75));
  const loj=Math.round(p.mem*cl(p.cred/100*.42+p.uni/100*.30-p.ctr/100*.25,0,.7));
  return {rad:Math.max(0,rad),loj:Math.max(0,loj)};
}
function radykalowieTydzien(k){
  const who=k||G.me,p=G.p[who],r=radykalowie(who);
  if(!p||p.dead)return;
  if(r.rad>0){
    // radykałowie sami z siebie podbijają kontrowersję i czasem wychodzą
    p.ctr=cl(p.ctr+Math.min(3.2,r.rad*.16));
    if(r.rad>=4&&ch(.18)){
      const g=giveBackCap(p,1),n=g.eli+g.int+g.ser;
      if(n&&who===G.me)say(`<b>Radykałowie odchodzą.</b> ${r.rad} ${pl(r.rad,'osoba jest','osoby są','osób jest')} `
        +`nie do utrzymania przy tej kontrowersji — jedna właśnie trzasnęła drzwiami.`,'bad');
    }
  }
  if(r.loj>0)p.uni=cl(p.uni+Math.min(1.6,r.loj*.05));
}

/* ══════════ SYTUACJE CZASOWE ══════════ */
const absWeek=()=>((G.term-1)*Math.max(1,G.weeks||12)+G.week);
function sitDate(abs){const d=new Date(2026,7,1);d.setDate(d.getDate()+(abs-1)*7);return d}
const SITS={
 koniecROM:{
  n:'Koniec liderstwa, co dalej?', k:'Sytuacja w ROM', logo:'ROM',
  start:()=>{const k=G.sits&&G.sits.find(x=>x.id==='kraniecPPP');return !!(k&&k.done&&absWeek()>=k.to+2)},
  weeks:5,
  d:'cargrzybov formalnie prowadzi Ruch Obrony Monarchii, ale z roleplayu wypisał się dawno temu. '
   +'Kanał stoi, statutu nikt nie czyta, a monarchiści z innych partii już się rozglądają, kto przejmie sztandar.',
  tick(){
    const q=G.p.ROM;if(!q||q.dead)return;
    q.fame=cl(q.fame-3.8);q.uni=cl(q.uni-3.4);q.cred=cl(q.cred-2.8);q.act=cl(q.act-1.6);
    M(q,-3);q.bank=Math.max(0,(q.bank||0)-12);
    if(G.me==='ROM'&&ch(.5)){const g=giveBackCap(q,1),n=g.eli+g.int+g.ser;
      if(n)say('<b>Koniec liderstwa:</b> ktoś wypisał się z partii bez słowa.','bad')}
  },
  end(){ if(G.me==='ROM')G.sitPending='koniecROM'; else sitROMEnd(); },
  resolve(){ sitROMChoice(); }
 },
 kraniecPPP:{
  n:'Kraniec PPP', k:'Sytuacja w PPP', logo:'PPP',
  start:()=>G.term===1&&G.week>=2,
  weeks:6,
  d:'Lager przestał odpisywać nie tylko na DM-y. Partia Polskich Patriotów tygodniami nie wypuszcza nic poza '
   +'zapowiedziami, ludzie wychodzą po cichu, a sondaż osypuje się z tygodnia na tydzień. Serwer czeka, aż ktoś '
   +'w końcu podejmie decyzję.',
  tick(){
    const q=G.p.PPP;if(!q||q.dead)return;
    q.fame=cl(q.fame-3.4);q.act=cl(q.act-2.6);q.uni=cl(q.uni-2.2);q.ctr=cl(q.ctr+1.2);
    q.bank=Math.max(0,(q.bank||0)-18);
    M(q,-4);
    if(ch(.6)){const g=giveBackCap(q,2);const n=g.eli+g.int+g.ser;
      if(n&&G.me==='PPP')say(`<b>Kraniec PPP:</b> odchodzi ${n} ${pl(n,'osoba','osoby','osób')}, nikt nie tłumaczy dlaczego.`,'bad')}
    if(G.me==='PPP'){G.kp=Math.max(-40,G.kp-6)}
  },
  end(){ if(G.me==='PPP')G.sitPending='kraniecPPP'; else sitKraniecEnd(); },
  resolve(){ sitKraniecChoice(); }
 }
};
function sitActive(id){return !!(G.sits&&G.sits.some(x=>x.id===id&&!x.done))}
function sitTick(){
  if(!G.sits)G.sits=[];
  Object.keys(SITS).forEach(id=>{
    const s=SITS[id];
    if(G.sits.some(x=>x.id===id))return;
    if(s.start()){
      G.sits.push({id,from:absWeek(),to:absWeek()+s.weeks});
      say(`<b>Nowa sytuacja: ${s.n}.</b> ${s.d} Rozstrzygnie się do ${dateStr(sitDate(absWeek()+s.weeks))}.`,'roy');
    }
  });
  G.sits.forEach(x=>{
    if(x.done)return;
    const s=SITS[x.id];
    if(absWeek()>=x.to){x.done=1;s.end()}
    else s.tick();
  });
}
function sitBanner(){
  if(!G.sits||!G.sits.some(x=>!x.done))return '';
  return G.sits.filter(x=>!x.done).map(x=>{const s=SITS[x.id],leftHours=G.realTimeEconomy&&Number.isFinite(Number(x.toAt))?Math.max(0,x.toAt-czasGlobalny()):Math.max(0,(x.to-absWeek())*168),left=Math.ceil(leftHours/168);
    return `<div class="sitbar">
      ${s.logo?crest(s.logo,'m'):''}
      <div style="flex:1;min-width:0">
        <div class="sitk">Sytuacja w toku</div>
        <b>${s.n}</b>
        <p>${s.d}</p>
      </div>
      <div class="sitleft"><b>${left}</b><span>${pl(left,'tydzień','tygodnie','tygodni')}</span>
        <em>do ${G.realTimeEconomy?dateStr(new Date(gameDate().getTime()+leftHours/24*86400000)):dateStr(sitDate(x.to))}</em></div>
    </div>`}).join('');
}
function eraBanner(){
  if(!isEraNiestab())return '';
  const end=new Date(2027,1,1);
  const left=Math.max(1,Math.ceil((end-gameDate())/(7*86400000)));
  return `<div class="sitbar">
    <div style="width:44px;height:44px;border-radius:50%;background:rgba(217,171,69,.16);
      border:1px solid var(--acc);display:grid;place-items:center;font-size:19px;flex:none">⚡</div>
    <div style="flex:1;min-width:0">
      <div class="sitk">Wydarzenie globalne</div>
      <b>Era niestabilności</b>
      <p>Grudniowo-styczniowy chaos na serwerze. Werbunek działaczy z cudzych partii idzie łatwiej, tobie i botom.</p>
    </div>
    <div class="sitleft"><b>${left}</b><span>${pl(left,'tydzień','tygodnie','tygodni')}</span>
      <em>do 1 lutego 2027</em></div>
  </div>`;
}
function sitROMEnd(){
  const q=G.p.ROM;if(!q||q.dead)return;
  q.uni=cl(q.uni+10);q.fame=cl(q.fame+4);
  say('<b>Koniec liderstwa rozstrzygnięty.</b> cargrzybov zostaje przy sztandarze Ruchu Obrony Monarchii, choć nikt nie wie, na jak długo.','roy');
}
function sitROMChoice(){
  const q=me();
  const cel=(G.p.KK&&!G.p.KK.dead)?'KK':null;
  const nazwaCel=cel?G.p.KK.n:'Kongresu już nie ma';
  const opts=[
   {l:'Zostaję jako cargrzybov i wracam z silniejszą ręką',
    s:'Jedność +26, wiarygodność +14, sława +12, aktywność +18. Partia rusza z miejsca.',
    f:()=>{close();
      q.uni=cl(q.uni+26);q.cred=cl(q.cred+14);q.fame=cl(q.fame+12);q.act=cl(q.act+18);M(q,16);XP(14);
      say('<b>cargrzybov wraca do gry.</b> Ruch Obrony Monarchii dostaje drugie życie, a serwer nie wie, co o tym myśleć.','roy');
      render()}}];
  if(cel)opts.push({l:`Wkraczam do ${nazwaCel}`,
    s:'Twoi ludzie i mandaty przechodzą pod koronę, dalej grasz tamtą partią',
    f:()=>{close();sitROMMerge()}});
  sitModal('Koniec liderstwa','Ruch Obrony Monarchii czeka na decyzję',
    `<p>Pięć tygodni zwłoki wystarczyło, żeby z partii zostało ${q.mem} ${pl(q.mem,'osoba','osoby','osób')},
     sława ${Math.round(q.fame)} i jedność ${Math.round(q.uni)}. Albo cargrzybov wraca naprawdę, albo sztandar
     trafia pod koronę.</p>`,opts);
}
function sitROMMerge(){
  const q=G.p.ROM,kk=G.p.KK;
  kk.comp.eli+=q.comp.eli;kk.comp.int+=q.comp.int;kk.comp.ser+=q.comp.ser;
  kk.mem+=q.mem;kk.seats+=q.seats;
  [q.lead].concat(q.bench).forEach(n=>{if(!kk.bench.includes(n)&&kk.bench.length<12)kk.bench.push(n)});
  q.dead=1;q.mem=0;q.comp={eli:0,int:0,ser:0};q.seats=0;q.bench=[];
  if(G.gov&&G.gov.parties.includes('ROM'))govLeave('ROM');
  G.me='KK';G.tab='mapa';
  kk.uni=cl(kk.uni+8);kk.fame=cl(kk.fame+5);
  say(`<b>Ruch Obrony Monarchii przestaje istnieć.</b> Sztandar, ludzie i mandaty wchodzą do ${kk.n}. Od teraz grasz tą partią.`,'roy');
  render();
}
function sitKraniecEnd(){
  const q=G.p.PPP;
  if(!q||q.dead)return;
  // bez gracza partia ratuje się sama, ale drogo
  const nast=q.bench.length?q.bench[0]:null;
  if(nast){const stary=q.lead;q.lead=nast;q.bench=q.bench.filter(n=>n!==nast);if(!q.bench.includes(stary))q.bench.push(stary);
    q.uni=cl(q.uni+14);q.act=cl(q.act+10);q.fame=cl(q.fame+6);
    say(`<b>Kraniec PPP rozstrzygnięty.</b> ${stary} oddaje przewodnictwo, partię przejmuje <b>${nast}</b>. PPP łapie oddech.`,'roy');
  } else {
    q.uni=cl(q.uni+6);say('<b>Kraniec PPP rozstrzygnięty.</b> Nikt się nie zgłosił, Lager zostaje i partia dogorywa dalej.','bad');
  }
}
/* W zegarze ciągłym sytuacja nie dostaje siedmiu identycznych kar naraz na
   granicy tygodnia. Trzymamy osobny termin w godzinach i rozliczamy ją raz na
   dobę, dzięki czemu data, efekt i moment zakończenia są spójne. */
function sitTickCzas(){
  if(!G||!G.realTimeEconomy)return;
  if(!G.sits)G.sits=[];
  const now=czasGlobalny();
  const kr=G.sits.find(x=>x.id==='kraniecPPP');
  Object.keys(SITS).forEach(id=>{
    const s=SITS[id];if(G.sits.some(x=>x.id===id))return;
    let start=false;
    if(id==='kraniecPPP')start=G.term===1&&now>=168;
    else if(id==='koniecROM')start=!!(kr&&kr.done&&now>=Number(kr.toAt||0)+336);
    else start=!!s.start();
    if(start){
      const x={id,from:absWeek(),to:absWeek()+s.weeks,fromAt:now,toAt:now+s.weeks*168,lastAt:now-24};
      G.sits.push(x);
      say(`<b>Nowa sytuacja: ${s.n}.</b> ${s.d} Rozstrzygnie się do ${dateStr(new Date(gameDate().getTime()+s.weeks*7*86400000))}.`,'roy');
    }
  });
  G.sits.forEach(x=>{
    if(x.done)return;const s=SITS[x.id];if(!s)return;
    if(!Number.isFinite(Number(x.toAt)))x.toAt=now+Math.max(1,(x.to||absWeek()+s.weeks)-absWeek())*168;
    if(now>=x.toAt){x.done=1;s.end();return}
    if(now-Number(x.lastAt||0)<24)return;x.lastAt=now;
    const q=x.id==='kraniecPPP'?G.p.PPP:G.p.ROM;if(!q||q.dead)return;
    if(x.id==='kraniecPPP'){
      q.fame=cl(q.fame-3.4/7);q.act=cl(q.act-2.6/7);q.uni=cl(q.uni-2.2/7);q.ctr=cl(q.ctr+1.2/7);q.bank=Math.max(0,(q.bank||0)-18/7);M(q,-4/7);
      if(G.me==='PPP'&&ch(.60/7)){const g=giveBackCap(q,1),n=g.eli+g.int+g.ser;if(n)say(`<b>Kraniec PPP:</b> odchodzi ${n} ${pl(n,'osoba','osoby','osób')}.`,'bad')}
      if(G.me==='PPP')G.kp=Math.max(-40,G.kp-6/7);
    }else{
      q.fame=cl(q.fame-3.8/7);q.uni=cl(q.uni-3.4/7);q.cred=cl(q.cred-2.8/7);q.act=cl(q.act-1.6/7);q.bank=Math.max(0,(q.bank||0)-12/7);M(q,-3/7);
      if(G.me==='ROM'&&ch(.50/7)){const g=giveBackCap(q,1),n=g.eli+g.int+g.ser;if(n)say('<b>Koniec liderstwa:</b> ktoś wypisał się z partii.','bad')}
    }
  });
}

/* Każda partia przechodzi przez ten sam wewnętrzny rozjazd. Wcześniej tick
   dotyczył tylko gracza, więc radykałowie AI byli dekoracją bez kosztu. */
function radykalowieWszystkim(){
  alive().forEach(k=>radykalowieTydzien(k));
}
function sitKraniecChoice(){
  const q=me(),kandydaci=[...new Set(q.bench.concat(q.main))].filter(n=>n!==q.lead);
  const opts=[];
  opts.push({l:'Rozwiązuję PPP i wchodzę do Kongresu Koronnego',
    s:'Twoi ludzie i mandaty przechodzą do KK, dalej grasz Kongresem',
    f:()=>{close();sitKraniecMerge()}});
  kandydaci.slice(0,4).forEach(n=>{const x=L(n);
    opts.push({l:`Oddaję przewodnictwo: ${n}`,
      s:`charyzma ${x.char} · kompetencja ${x.komp} · wytrzymałość ${x.wytrz} · jedność i aktywność wracają do gry`,
      f:()=>{close();sitKraniecLead(n)}})});
  if(!kandydaci.length)opts.push({l:'Zostawiam Lagera',s:'Partia dogorywa, ale zostaje twoja',
    f:()=>{close();q.uni=cl(q.uni+5);say('<b>Kraniec PPP:</b> zostawiasz wszystko jak jest. Serwer to zapamięta.','bad');render()}});
  sitModal('Kraniec PPP','Trzeba podjąć decyzję',
    `<p>Sześć tygodni osuwania się skończyło. Partia Polskich Patriotów nie przetrwa kolejnej kadencji
     w tym stanie: ${Math.round(q.mem)} ${pl(q.mem,'osoba','osoby','osób')}, sława ${Math.round(q.fame)},
     jedność ${Math.round(q.uni)}. Albo ktoś inny bierze stery, albo zwijasz szyld i wchodzisz pod koronę Kongresu.</p>`,opts);
}
function sitKraniecMerge(){
  const q=G.p.PPP,kk=G.p.KK;
  kk.comp.eli+=q.comp.eli;kk.comp.int+=q.comp.int;kk.comp.ser+=q.comp.ser;
  kk.mem+=q.mem;kk.seats+=q.seats;
  [q.lead].concat(q.bench).forEach(n=>{if(!kk.bench.includes(n)&&kk.bench.length<12)kk.bench.push(n)});
  q.dead=1;q.mem=0;q.comp={eli:0,int:0,ser:0};q.seats=0;q.bench=[];
  if(G.gov&&G.gov.parties.includes('PPP'))govLeave('PPP');
  G.me='KK';G.tab='mapa';
  kk.uni=cl(kk.uni+10);kk.act=cl(kk.act+8);
  say('<b>Partia Polskich Patriotów przestaje istnieć.</b> Ludzie, mandaty i cała ława wchodzą pod koronę Kongresu Koronnego. Od teraz grasz Kongresem.','roy');
  render();
}
function sitKraniecLead(n){
  const q=me(),stary=q.lead;
  q.lead=n;q.main=[n];q.bench=q.bench.filter(x=>x!==n);
  if(!q.bench.includes(stary))q.bench.push(stary);
  q.uni=cl(q.uni+16);q.act=cl(q.act+12);q.fame=cl(q.fame+8);M(q,10);XP(14);
  say(`<b>Kraniec PPP:</b> ${stary} odchodzi na ławkę, partię przejmuje <b>${n}</b>. Kanały wracają do życia.`,'roy');
  render();
}
function sitModal(kick,tyt,body,opts){
  close();
  const v=document.createElement('div');v.className='veil';v.id='veil';
  v.innerHTML=`<div class="mdl sitmdl">
    <button class="mdlx" type="button" aria-label="Zamknij">×</button>
    <div class="siths">
      <svg viewBox="0 0 120 120" class="sitseal"><g fill="none" stroke="var(--acc)" stroke-width="1.6">
        <circle cx="60" cy="60" r="52" stroke-opacity=".55"/><circle cx="60" cy="60" r="44" stroke-opacity=".35"/>
        <path d="M60 12l5 12-5-3-5 3z" fill="var(--acc)" stroke="none"/>
        <path d="M26 74q34 22 68 0" stroke-opacity=".5"/></g></svg>
      <div class="k">${kick}</div><h2>${tyt}</h2></div>
    <div class="bd">${body}</div>
    <div class="op">${opts.map((o,i)=>`<button class="opt" data-i="${i}"><b>${o.l}</b><span>${o.s||''}</span></button>`).join('')}</div>
  </div>`;
  document.body.appendChild(v);
  v.querySelectorAll('.opt').forEach(b=>b.onclick=()=>opts[+b.dataset.i].f());
  v.querySelector('.mdlx').onclick=()=>{close();render()};
}

/* ══════════ TRYBY GRY I SAMOUCZEK ══════════ */
let MODE=null;
/* Menu główne stoi PRZED wyborem trybu. Wzorzec kinowy: tło na całą szerokość,
   a po lewej sam tekst — bez ramek, bez kafli, bez płyt. Reszta gry zostaje
   w języku Victorii, ale ten jeden ekran ma być pusty i ma robić wrażenie. */
let MENU=true;
function menuIdz(gdzie){
  if(gdzie==='nowa'){MENU=false;render();return}
  if(gdzie==='wczytaj'){openSave();return}
  if(gdzie==='scenariusze'){MENU=false;MODE='scen';render();return}
  if(gdzie==='kreator'){openKreator();return}
  if(gdzie==='tworcy'){modal('Mordy Mordeczki','Twórcy',creditsBox(),
    [{l:'Zamykam',f:()=>{close();render()}}]);return}
  if(gdzie==='wyjdz'){
    const a=(window.pywebview&&window.pywebview.api)||null;
    if(a&&a.zamknij){try{a.zamknij();return}catch(e){}}
    try{window.close()}catch(e){}
  }
}
function menuGlowne(){
  const poz=[['nowa','Nowa gra'],['wczytaj','Wczytaj grę'],['scenariusze','Scenariusze'],
             ['kreator','Kreator scenariuszy'],['tworcy','Twórcy'],['wyjdz','Wyjdź']];
  app.innerHTML=`
  <div class="mg">
    <div class="mgtlo"></div>
    <div class="mgcien"></div>
    <div class="mgtresc">
      <div class="mgznak">Mordy Mordeczki</div>
      <h1 class="mgtytul">Sejm</h1>
      <div class="mgkreska"></div>
      <nav class="mgmenu">
        ${poz.map(([id,n])=>`<button class="mgpoz" onclick="menuIdz('${id}')">${n}</button>`).join('')}
      </nav>
      <div class="mgkreska dol"></div>
    </div>
    <div class="mgwersja">wersja ${WERSJA}</div>
  </div>`;
  if(patchDoPokazania())setTimeout(pokazPatch,600);
}
function backToMenu(){if(!G)scenPartieWyczysc();MENU=true;MODE=null;SCENSEL=null;render()}
function pickMode(m){MODE=m;SFX.click();if(m==='tut'){scenPartieWyczysc();SCENSEL=null;return startTutorial()}if(m==='free'){scenPartieWyczysc();SCENSEL=null}render()}
function backToMode(){if(!G){scenPartieWyczysc();SCENSEL=null}MODE=null;render()}
/* Ikony trybów. Jedna definicja, żeby karty miały wspólny język i grubość kreski. */
const IKO={
 tut:'<path d="M12 18h22a6 6 0 0 1 6 6v26a6 6 0 0 0-6-6H12z"/><path d="M52 18H40a6 6 0 0 0-6 6v26a6 6 0 0 1 6-6h12z" opacity=".55"/><path d="M18 28h10M18 36h8"/>',
 free:'<path d="M32 7l6.6 13.7L53 23l-10.6 10.2L45 48l-13-6.8L19 48l2.6-14.8L11 23l14.4-2.3z"/><path d="M32 48v9" opacity=".5"/><path d="M24 57h16" opacity=".5"/>',
 upad:'<path d="M14 52h36"/><path d="M20 52V28l12-12 12 12v24"/><path d="M27 52V38h10v14" opacity=".55"/><path d="M46 14l6 6M52 14l-6 6" opacity=".8"/>',
 los :'<path d="M32 8l20 11v22L32 52 12 41V19z"/><path d="M32 30v22" opacity=".5"/><path d="M12 19l20 11 20-11" opacity=".5"/><circle cx="32" cy="22" r="2.6" fill="currentColor" stroke="none"/><circle cx="23" cy="38" r="2.2" fill="currentColor" stroke="none" opacity=".7"/><circle cx="41" cy="38" r="2.2" fill="currentColor" stroke="none" opacity=".7"/>',
 kre :'<path d="M12 50h40"/><path d="M18 50V32M30 50V20M42 50V38"/><path d="M44 14l7 7-19 19-9 2 2-9z"/>',
 plik:'<path d="M14 14h20l6 7h10v33H14z"/><path d="M32 30v16" opacity=".8"/><path d="M25 39l7 7 7-7" opacity=".8"/>',
};
const iko=k=>`<svg class="mico" viewBox="0 0 64 64"><g fill="none" stroke="currentColor"
  stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${IKO[k]}</g></svg>`;

/* ── Ślepy los ──
   Karta bez podpowiedzi: gra sama dobiera scenariusz i partię, a gracz dowiaduje
   się, czym gra, dopiero po starcie. Nie ma tu żadnej nowej mechaniki — to zwykły
   start, tylko wybrany za ciebie. */
/* Panel obok kolumny menu pokazuje to, na co gracz akurat patrzy. */
function opisTrybu(el){
  const box=el&&el.closest('.modes'); if(!box)return;
  box.setAttribute('data-opis',el.getAttribute('data-opis')||'');
  box.querySelectorAll('.modecard.patrze').forEach(x=>x.classList.remove('patrze'));
  el.classList.add('patrze');
}
function slepyLos(){
  const scenariusze=Object.keys(SCEN);
  const s=scenariusze[RI(0,scenariusze.length-1)];
  scenPartieAktywuj(s);
  const partie=PID.filter(k=>BASE[k]);
  const p=partie[RI(0,partie.length-1)];
  SCENSEL=s; MODE='free'; SFX.click();
  modal('Ślepy los','Los wybrał za ciebie',
    `<p>Scenariusz: <b>${esc(SCEN[s].n)}</b><br>Partia: <b>${esc(BASE[p].n)}</b></p>
     <p class="dim" style="font-size:13px">${esc(BASE[p].blurb)}</p>`,
    [{l:'Biorę, co dali',s:'Zaczynam tą partią',f:()=>{close();start(p)}},
     {l:'Losuj jeszcze raz',s:'Inny scenariusz i inna partia',f:()=>{close();slepyLos()}},
     {l:'Wybiorę sam',s:'Przechodzę do listy partii',f:()=>{close();render()}}]);
}

function modeScreen(){
  const karta=(o)=>`
    <button class="modecard ${o.kl||''}" ${o.wyl?'disabled aria-disabled="true"':`onclick="${o.akcja}"`}
      onmouseenter="opisTrybu(this)" onfocus="opisTrybu(this)"
      data-opis="${esc((o.n||'')+String.fromCharCode(10,10)+String(o.d||'').replace(/<[^>]+>/g,'')+String.fromCharCode(10,10)+(o.stopka||''))}">
      <div class="mramka"></div>
      <div class="mikob">${iko(o.i)}</div>
      ${o.data?`<div class="mdata">${o.data}</div>`:''}
      <div class="mtag">${o.tag}</div>
      <h2>${o.n}</h2>
      <p>${o.d}</p>
      <div class="mfoot"><span>${o.stopka}</span><b>${o.akcjaN}</b></div>
    </button>`;

  app.innerHTML=`
  <div class="startekran modepick">
  <button class="btn g sm" style="margin-bottom:14px" onclick="backToMenu()">← Wstecz</button>
  <!-- Ekran trybów jest podstroną, a nie drugim ekranem głównym. Wielki tytuł,
       godło i wizytówka serwera zostały w menu — tutaj jest tylko nagłówek
       mówiący, gdzie jesteś, i sama lista. -->
  <div class="podnag modehead">
    <div class="kick">Nowa rozgrywka</div>
    <h2>Wybierz stół, przy którym siadasz</h2>
    <p>Każdy tryb prowadzi do tej samej politycznej gry. Różni się tylko punktem startu.</p>
  </div>
  <!-- Układ menu wzięty z proporcji Victorii: kolumna przycisków 310x55 po lewej,
       odstęp 5 w grupie i 25 między grupami, a po prawej panel z opisem tego,
       na co akurat patrzysz. Same kafle zostają — zmienia się tylko to, jak stoją. -->
  <div class="modes fifamodes">
    ${karta({i:'tut',akcja:"pickMode('tut')",tag:'dla nowych',n:'Samouczek',
      d:'Prowadzę cię krok po kroku przez pierwszą kadencję Stronnictwem Reisei: obecność w kanałach, kolejność decyzji, transfery, cele partyjne i wybory.',
      stopka:'ok. 10 minut',akcjaN:'Zaczynam →'})}
    ${karta({i:'free',akcja:"pickMode('free')",tag:'pełna gra',data:'STAN SERWERA · 1 SIERPNIA 2026',kl:'glowna',n:'Dzień dzisiejszy',
      d:'Serwer taki, jaki jest teraz: czternaście partii od największej po jednoosobową, rząd na swoim miejscu i wszystko do wzięcia.',
      stopka:'wszystkie partie i scenariusze',akcjaN:'Wybieram partię →'})}
    ${karta({i:'upad',wyl:1,kl:'wkrotce',tag:'scenariusz',data:'ARCHIWUM · 25 KWIETNIA 2025',n:'Upadek Republikanów',
      d:'Zaczynasz szesnaście miesięcy wcześniej, w tygodniu, w którym niebieski sztandar poszedł w dół, a jego ludzie rozeszli się po całym serwerze.',
      stopka:'w przygotowaniu',akcjaN:'Wkrótce'})}
    ${karta({i:'los',akcja:'slepyLos()',tag:'???',kl:'tajemna',n:'Losowo',
      d:'Nie wybierasz nic. Ani sceny, ani partii. Dowiadujesz się, kim grasz, dopiero kiedy siadasz do stołu.',
      stopka:'losowa scena i partia',akcjaN:'Rzucam →'})}
  </div>

  </div>`;
  /* Panel po prawej startuje od karty głównej. Ustawiamy go po klatce, bo
     przeglądarka potrafi w międzyczasie sama komuś nadać fokus i podmienić
     opis na przypadkowy kafel. */
  setTimeout(()=>{const dom=app.querySelector('.modes.v3 .modecard.glowna')
    ||app.querySelector('.modes.v3 .modecard');
    if(dom)opisTrybu(dom)},0);
  // „Co nowego” wyskakuje raz na wersję, przy pierwszym wejściu na ekran startowy
  if(patchDoPokazania())setTimeout(pokazPatch,240);
}
