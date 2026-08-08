'use strict';
/* Autorzy gry. Wersja bierze się z pliku VERSION przy budowaniu wydania. */
const AUTORZY=['Maciek','Balon'];
const TESTERZY=['Aryati','loof'];
/* Numer wpisuje tu build z pliku VERSION. Przy uruchamianiu ze źródeł, bez budowania,
   warstwa desktopowa podmienia go na prawdziwy — inaczej stopka pokazywałaby numer
   z ostatniego wydania i kłamała. */
let WERSJA='1.1.130';
function ustawWersje(v){
  if(typeof v==='string'&&/^\d+\.\d+\.\d+$/.test(v.trim())){WERSJA=v.trim();return true}
  return false;
}
