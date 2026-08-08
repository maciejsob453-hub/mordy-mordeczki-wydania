'use strict';
/* ══════════ CO NOWEGO ══════════
   Zasada: każde wydanie dopisuje tu jeden wpis, krótko i po ludzku — co gracz
   zobaczy, a nie co zmieniło się w kodzie. Okno pokazuje się raz na wersję,
   przy pierwszym odpaleniu, i da się do niego wrócić z ekranu startowego. */
const PATCHNOTE={
 '1.1.129':{data:'8 sierpnia 2026', zmiany:[
  'Sad dostaje wlasna sale akt: lawa, kodeksy, waga i pieczecie buduja powage zamknietego dzialu.','Sprawy, glosowania i wyroki maja teraz spokojne centrum zamiast wspolnego tla rejestru.',
 ]},
 '1.1.128':{data:'8 sierpnia 2026', zmiany:[
  'Mordepedia staje sie prawdziwym archiwum serwera: ksiegi, teczki i lampy prowadza wzrok do kronik.','Zamkniety dzial ma teraz wlasne tlo i nie korzysta juz ze starej tapety scenariuszowej.',
 ]},
 '1.1.127':{data:'8 sierpnia 2026', zmiany:[
  'Dwor Mordeczek dostaje wlasny gabinet koronny z korona, pieczeciami i spokojnym miejscem na ranking.','Stara tapeta znika z ekranu krola, a karty zachowuja kontrast dla portretow i decyzji.',
 ]},
 '1.1.126':{data:'8 sierpnia 2026', zmiany:[
  'Ekonomia dostaje osobny pulpit rachunkowy z wykresami i dokumentami na obrzezach.','PKB, kapital prywatny i mnoznik obrotu maja teraz scenografie skarbca zamiast ogolnego rejestru.',
 ]},
 '1.1.125':{data:'8 sierpnia 2026', zmiany:[
  'Przewodnictwo, zaplecza i cele dostaja osobna teczke partyjna zamiast wspolnego tla ekonomii.','Nowa faktura prowadzi wzrok do kart i zostawia spokojny srodek na liczby oraz opisy.',
 ]},
 '1.1.124':{data:'8 sierpnia 2026', zmiany:[
  'Gorny pasek gry dostal wlasna scenografie command rail: skora, mosiadz i spokojny srodek dla zasobow.','HUD zachowuje responsywne trzy pasy na telefonie i czytelne liczby na desktopie.',
 ]},
 '1.1.123':{data:'8 sierpnia 2026', zmiany:[
  'Kreator scenariuszy na telefonie pokazuje teraz dziewiec etapow w siatce 3x3 zamiast chowac je w poziomym pasku.','Numery i nazwy zostaja widoczne, a dluzsze opisy wracaja na szerokim ekranie.',
 ]},
 '1.1.122':{data:'8 sierpnia 2026', zmiany:[
  'Tabela klubow w Sejmie miesci sie teraz na telefonie bez poziomego przewijania.','Na waskim ekranie zostaja partia, mandaty, status i relacja, a lider ma osobna zakladke.',
 ]},
 '1.1.121':{data:'8 sierpnia 2026', zmiany:[
  'Karty decyzji i zdolnosci lidera dziedzicza teraz barwe prowadzonej partii, mieszajac ja z kolorem konkretnego skutku.','Zielone, fioletowe i niebieskie partie nie wracaja juz na swoich kartach do tego samego zlota.',
 ]},
 '1.1.120':{data:'8 sierpnia 2026', zmiany:[
  'Gabinet premiera i palac prezydenta zaczynaja sie teraz w jednej linii; stare marginesy nie przesuwaja drugiej karty ani ustaw.','Uklad jest krotszy i rowniejszy bez zmiany zawartosci ani kolejnosci.',
 ]},
 '1.1.119':{data:'8 sierpnia 2026', zmiany:[
  'Ostatni tydzien kampanii ma teraz oprawe sali protokolow i prowadzi wizualnie prosto do urn.','Przycisk wylozenia na kampanie dostal wyrazny mosiadzny kontrast, ale nadal korzysta z barwy aktywnej partii.',
 ]},
 '1.1.118':{data:'8 sierpnia 2026', zmiany:[
  'Modale decyzji korzystaja teraz z faktury dokumentu na stole, a nie z jednolitego zielonego gradientu.','Rozmiar, pozycja i przycisk zamkniecia zostaly bez zmian.',
 ]},
 '1.1.117':{data:'8 sierpnia 2026', zmiany:[
  'Noc wyborcza i raport wyniku dostaly nowa sale protokolow: lampy, koperty i komisja sa na obrzezach, a srodek zostaje czytelny dla liczb.','Stara czerwona tapeta nie miesza sie juz z reszta atlasu.',
 ]},
 '1.1.116':{data:'8 sierpnia 2026', zmiany:[
  'Boczny pulpit jest teraz jedna teczka: przewodnictwo, kondycja, kronika i sklad partii maja wspolny material archiwum.','Tekstura jest przygaszona pod trescia, wiec czytelnosc i zwijanie kart zostaja bez zmian.',
 ]},
 '1.1.115':{data:'8 sierpnia 2026', zmiany:[
  'Decyzje tygodnia dostaly wlasne biurko robocze z papierami, mosiadzem i spokojna przestrzenia pod karty.','Faktura jest widoczna na ekranie, ale nie zabiera kontrastu tekstom i przyciskom.',
 ]},
 '1.1.114':{data:'8 sierpnia 2026', zmiany:[
  'Na laptopach i telefonach zakladki gry sa teraz jednym poziomym paskiem; nie zabieraja juz calej wysokosci ekranu.','Nawigacja przewija sie poziomo, a widok gry zaczyna sie od razu pod HUD-em.',
 ]},
 '1.1.113':{data:'8 sierpnia 2026', zmiany:[
  'Naprawiony konflikt stylow HUD-u na telefonach: zasoby sa faktycznie widoczne, a nie tylko zadeklarowane w CSS.',
 ]},
 '1.1.112':{data:'8 sierpnia 2026', zmiany:[
  'Na malych ekranach HUD pokazuje teraz kapitał, energie, sondaz i mandaty w kompaktowym przewijanym rejestrze zamiast je chowac.',
 ]},
 '1.1.111':{data:'8 sierpnia 2026', zmiany:[
  'Naglowki Sondazu i Krola korzystaja teraz z wlasnych scenografii zamiast zmieniac material na mapowy.',
 ]},
 '1.1.110':{data:'8 sierpnia 2026', zmiany:[
  'Ranking dworski na malym ekranie nie ma juz ukrytej szerokosci; kolumna bierze dokladnie tyle miejsca, ile widzi gracz.',
 ]},
 '1.1.109':{data:'8 sierpnia 2026', zmiany:[
  'Sejm ma osobna scenografie sali obrad, sondaż dostał rytm rejestru, a ranking dworski nie jest juz jedna dluga kolumna.',
 ]},
 '1.1.108':{data:'8 sierpnia 2026', zmiany:[
  'Zaplecza obcych partii sa teraz rejestrem dwoch kolumn, wiec zakladka nie ciagnie sie bez konca na szerokim ekranie.',
 ]},
 '1.1.107':{data:'8 sierpnia 2026', zmiany:[
  'Ekrany partii, celow, lidera i ekonomii dostaly osobne tlo archiwum, zeby nie wygladaly jak jedna domyslna karta.',
  'Media i sad maja teraz wlasne scenografie takze w stanie zamknietym; naprawiony zostal pusty poziomy pasek na desktopie.',
 ]},
 '1.1.106':{data:'8 sierpnia 2026', zmiany:[
  'Ekran decyzji kampanii ma osobny stol akcji z kolorami kategorii, a transfery bezpartyjnych osobny rejestr ludzi.',
  'Karty akcji i transferow maja teraz mocniejsza krawedz, spokojniejsze tla i czytelniejszy podzial funkcji.',
 ]},
 '1.1.105':{data:'8 sierpnia 2026', zmiany:[
  'Gabinet premiera i palac prezydencki maja teraz uklad dwoch kart obok siebie zamiast dlugiej kolumny.',
  'Tablica ustaw jest lzejsza: kafle sa nizsze, opisy krotsze, a kategorie nie wygladaja jak kapsulki.',
 ]},
 '1.1.104':{data:'8 sierpnia 2026', zmiany:[
  'Sejm, kancelaria premiera i palac prezydencki dostaly osobna fakture sali parlamentarnej zamiast wspolnego tla mapy.',
  'Najwazniejsze karty wladzy maja teraz mocniejszy rytm instytucji, ale nadal zostaja czytelne i spokojne.',
 ]},
 '1.1.103':{data:'8 sierpnia 2026', zmiany:[
  'Kreator scenariuszy dostal wlasna pracownie z faktura archiwum, wyraznym naglowkiem i czytelniejszym paskiem dziewieciu etapow.',
  'Lista scenariuszy korzysta z tego samego rejestru, a karty wybranego scenariusza maja mocniejszy akcent i hierarchie.',
 ]},
 '1.1.102':{data:'8 sierpnia 2026', zmiany:[
  'Serwerowy Kurier i mapa okregow korzystaja teraz z tej samej ciemnej scenografii atlasu co reszta gry.',
  'Panel boczny ma przywrocona hierarchie: przewodnictwo, kondycja, kronika, sklad, zaplecze, serwer i relacje.',
 ]},
 '1.1.101':{data:'8 sierpnia 2026', zmiany:[
  'Naprawiony glowny uklad gry: szeroka scena wraca do mapy, Sejmu, mediow i ustaw, a panel boczny ma stala szerokosc.',
  'Sejm, Sad, Media, Ekonomia, Krol i Pedia dostaly wspolna kompozycje instytucji oraz nowa generowana teksture atlasu.',
 ]},
 '1.1.100':{data:'8 sierpnia 2026', zmiany:[
  'Noc wyborcza i wyniki dostaly wspolna sale protokolow: spokojniejszy atlas, wyrazniejsze liczby i mniej przypadkowych kart.',
  'Paski komisji, listy oraz rozliczenie kadencji maja teraz jedna hierarchie i dzialaja tak samo na desktopie i telefonie.',
 ]},
 '1.1.99':{data:'8 sierpnia 2026', zmiany:[
  'Nowy kokpit gry: tozsamosc, zasoby i sterowanie sa zebrane w jednej urzedowej belce.',
  'Naglowki kart korzystaja z lekkiej tekstury rejestru, a pasek nawigacji i data nie nachodza na tresc.',
 ]},
 '1.1.98':{data:'8 sierpnia 2026', zmiany:[
  'Ujednolicone listy osob, rzadow, ekonomii i sadu: mniej kapsulek, wiecej czytelnych wierszy i ramek.',
  'Paski, statystyki i karty koalicyjne maja wspolny rytm, odstepy oraz kolory statusu.',
 ]},
 '1.1.97':{data:'8 sierpnia 2026', zmiany:[
  'Domkniety redesign ekranow wejscia: wybor partii, scenariusze i kreator maja ten sam jezyk atlasu co gra.',
  'Okna decyzji maja stala rame, przycisk zamkniecia w prawym rogu i czytelne opcje z wlasnym tlem.',
  'Karty partii, kroki kreatora i formularze dostaly rowne odstepy, mocniejsza hierarchie i responsywne zwijanie.',
 ]},
 '1.1.96':{data:'8 sierpnia 2026', zmiany:[
  'Pelny redesign interfejsu gry: wspolny atlas polityczny, plaskie panele i czytelniejsza hierarchia informacji.',
  'Nowa generowana scenografia UI spina ekran kampanii, Sejm, sad, media, sondaz, Krola, Pedia i kreator.',
  'Przyciski, zakladki, zasoby i karty decyzji maja jedna role wizualna; zloto zostaje tylko dla akcji nadrzednych.',
 ]},
 '1.1.95':{data:'8 sierpnia 2026', zmiany:[
  'PELNA SCENOGRAFIA GRY. Kampania, wybor partii, sondaż, Krol, noc wyborcza i Mordepedia dostaja wlasne, lekkie tla zamiast jednego gradientu.',
  'GRAFIKI SA SKOMPRESOWANE DO WEBP. Nowe tła nie obciazaja aktualizacji bardziej, niz musza, a interfejs nadal zostaje czytelny na wierzchu.',
 ]},
 '1.1.94':{data:'8 sierpnia 2026', zmiany:[
  'NOWE TLA DLA SADU, MEDIOW I SEJMU. Generowane tekstury wzmacniaja klimat dzialow, ale zostawiaja srodek czytelny dla danych i mapy.',
  'MEDIA I SAD MAJA JEDEN JEZYK SCENOGRAFII. Zamkniete i otwarte ekrany nie wygladaja juz jak gole gradienty.',
 ]},
 '1.1.93':{data:'8 sierpnia 2026', zmiany:[
  'AUDYT BALANSU PRZYHAMOWUJE BETONOWANIE SCENY. Seryjny zwyciezca traci przewage, a komputerowy PPP dostaje hamulec; gracz zachowuje pelna sile tej partii.',
  'SMOKE TEST STARTUJE PRAWDZIWA PARTIE. Zapis i odczyt sa sprawdzane po uruchomieniu rozgrywki, nie tylko na ekranie trybu.',
 ]},
 '1.1.92':{data:'8 sierpnia 2026', zmiany:[
  'GRA MA ZEGAR. Decyzje przesuwaja dzien i godzine, a odnowa wraca po realnym czasie zamiast tylko po przerysowaniu ekranu.',
  'COFNIETE OKNO COFA CZAS I OS CZASU. Pusty ruch nie zapelnia juz tygodnia ani harmonogramu.',
  'DEBATY I SPOTY MAJA LOSOWE PYTANIA. Odpowiedzi korzystaja ze slawy, wiarygodnosci, kompetencji i jednosci.',
  'PKB NIE DOSTAJE JUZ DARMOWEGO BONUSU ZA ZADOWOLENIE. Absolutorium ma mocna nagrode za wzrost i krytyczne straty za gleboki spadek.',
  'KAPITAL ZAPLECZA JEST NIZEJ NIZ FORTUNY SERWERA, A ROZPISKA KLUBOW W SEJMIE JEST ZWIJANA.',
 ]},
 '1.1.91':{data:'8 sierpnia 2026', zmiany:[
  'SEJM I WLADZA SA ZWARTE. Gabinet, rada i ustawy nie rozlewaja sie juz po pustej karcie, a sala ma mniejsze, rowno rozmieszczone miejsca.',
  'SKRAJNE KULKI SEJMU NIE SA OBCINANE. Luk dostal bezpieczny margines wewnatrz obrazu.',
  'DODANO CICHE PODPOWIEDZI. Pasek pokazuje najwyzej dwa najpilniejsze tropy, a reszte tylko liczniki w zakladkach.',
  'MORDEPEDIA JEST NOWA ZAKLADKA. Najpierw zamknieta ustawa, potem archiwum premierow i prezydentow z kolejnych kadencji.',
 ]},
 '1.1.90':{data:'8 sierpnia 2026', zmiany:[
  'DECYZJE MAJA CZAS TRWANIA. Zwykly ruch zajmuje dzien lub dwa, ustawa i debata kilka dni, a luka tygodnia nadal odnawia limity co siedem dni.',
  'PKB MOZE SPADAC PRZEZ KONKRETNE BLEDY. Przegrane ustawy, brak rzadu i zle decyzje zostawiaja czasowy cios w obrocie zamiast losowego pecha.',
  'MEDIA MAJA KARTA BLOKADY JAK SAD, LISTE SZYLDOW I PASEK BILANSU. Kino rejestruje seanse zamiast udawac fabryke filmow, a serduszka rosna znacznie wolniej.',
  'KREATOR POZWALA DODAWAC ZAPLECZE I WSKAZAC KONKRETNA OSOBE NA FOTELU PREMIERA LUB PREZYDENTA.',
  'DEBATA I SPOT DOSTALY TRZYRUNDOWE MINIGRY. Wynik zalezy od decyzji gracza, nie tylko od jednego rzutu.',
 ]},
 '1.1.89':{data:'8 sierpnia 2026', zmiany:[
  'SONDAZ MA MALEJACE ZWROTY Z DUZEGO ZASIEGU. PPP NIE MA JUZ PODWOJNEGO BONUSU, A PARTIE Z TYLU MOGA REALNIE DOGANIAC LIDERA.',
  'SERYJNY ZWYCIEZCA PLACI ZA PRZEWAGE. Kolejne wygrane oddaja czesc niezdecydowanych konkurencji zamiast betonowac sejm.',
  'AUDYTY NIE ZGLASZAJA JUZ FALSZYWYCH BRAKOW EKSPORTOW. Test balansu obsluguje tez wakaty rady, sad i okna decyzji.',
 ]},
 '1.1.88':{data:'7 sierpnia 2026', zmiany:[
  'WYBOR PARTII DOSTAL KARUZELE JAK W FIFIE. Logo, nazwa i pelny profil sa na jednej karcie, a partie zmieniasz strzalkami.',
  'KOALICJANT MOZE ROZMAWIAC Z PREMIEREM O MINISTERSTWIE. Relacja i kompetencja zaplecza zmieniaja szanse zgody.',
  'SEDZIOW NIE MA JUZ Z AUTOMATU. Ustawe o sadzie trzeba domknac prawdziwymi glosowaniami, a sprawa bez dowodu nie ruszy.',
  'USTAWY MAJA OSOBNY PROCES, KONTROWERSJA PARALIZUJE DOPIERO PRZY 96, A SONDAZ I KROL DOSTALY NOWE NAGLOWKI. Bluetes i Pablo sa teraz w NP z mandatami.',
  'SONDAZ NIE JEST JUZ LINIOWY. Duzy zasieg ma malejace zwroty, seryjny zwyciezca placi za przewage, a partie z tylu dostaja szanse dogonienia.',
  'PODGLAD DECYZJI NIE ZJADA LOSOWOSCI PRAWDZIWEJ GRY. Wynik proby jest powtarzalny, a prawdziwa decyzja zachowuje swoj wlasny rzut.',
]},
 '1.1.87':{data:'7 sierpnia 2026', zmiany:[
  'KREATOR MA SYMULATOR TYGODNI. Sprawdzisz warunki, lancuchy i skutki wydarzen bez ruszania prawdziwej gry.',
  'WALIDATOR WYKRYWA PETLE, NIEOSIAGALNE WYDARZENIA, SPRZECZNE WARUNKI I BRAK PUNKTU STARTOWEGO.',
  'SYMULATOR MA TRYB PIERWSZEJ ODPOWIEDZI ORAZ PROSTY TRYB AI Z LOGIEM KAZDEGO WYDARZENIA.',
 ]},
 '1.1.86':{data:'7 sierpnia 2026', zmiany:[
  'KREATOR MA ZAPIS ROBOCZY, PODGLAD, DUPLIKOWANIE ORAZ IMPORT I EKSPORT JSON.',
  'WYDARZENIA MOZNA TWORZYC Z GOTOWYCH SZABLONOW AFERA, KRYZYS I MEDIA.',
  'WYDARZENIA MOGA TWORZYC LANCUCHY ZALEZNOSCI, ODPOWIEDZI I OPOZNIENIA.',
 ]},
 '1.1.85':{data:'7 sierpnia 2026', zmiany:[
  'KOD GRY ZOSTAL PODZIELONY NA 19 MODULOW. Partie, wybory, Sejm, AI, ekonomia, media, sad, ustawy, interfejs i zapisy maja teraz osobne miejsca.',
  'ZACHOWANA ZOSTALA PELNA ZGODNOSC Z GRA. Kolejnosc ladowania, window API, format zapisow, mody, wyglad i zasady rozgrywki pozostaly takie same.',
  'GAME.JS JEST TERAZ TYLKO BOOTSTRAPEM WERSJI. Moduly sa ladowane jawnie i synchronicznie z index.html, wiec latwiej znalezc i bezpiecznie zmienic konkretny system.',
 ]},
 '1.1.84':{data:'7 sierpnia 2026', zmiany:[
  'AI 2.0 NADAJE PARTIOM PRAWDZIWE CHARAKTERY. Agresor, technokrata, populista, koalicjant, organizator i oportunista inaczej planuja, buduja media, skladaja ustawy i dobieraja sojusze.',
  'KREATOR WYDARZEN POZWALA REZYSEROWAC CALA KAMPANIE. Ustawisz wyzwalacze, warunki, odpowiedzi gracza i AI, skutki polityczne, zmiany liderow oraz aktywowanie ustaw.',
  'KREATOR SCENARIUSZY MA DZIEWIEC ETAPOW. Doszly relacje, profile AI, gospodarka, media, obecnosc w okregach, ustawy startowe i pelna kontrola nad swiatem.',
  'ISTNIEJACE PARTIE MOZNA PRZEBUDOWAC OD PODSTAW. Zmienisz nazwe, skrot, kolor, herb, opis, lidera i jego statystyki bez psucia zwyklej gry.',
 ]},
 '1.1.83':{data:'7 sierpnia 2026', zmiany:[
  'KREATOR SCENARIUSZY TWORZY TERAZ CALE UGRUPOWANIA. Ustawisz nazwe, skrot, kolor, herb, lidera, zaplecze, sklad ludzi, statystyki i sympatie grup.',
  'NOWE PARTIE NAPRAWDE WCHODZA DO GRY. Dostaja mandaty, moga prowadzic rzad, objac prezydentury i zostaja zachowane w pliku scenariusza oraz zapisie rozgrywki.',
  'MOZNA PISAC WLASNE CELE PARTII. Autor ustawia warunki, nagrody, wymagany urzad, a nawet przemianowanie i nowy kolor po ukonczeniu drogi.',
  'KREATOR MA SZESC PELNYCH ETAPOW I NOWY UKLAD. Kontrola wykrywa powtorzone nazwy, skroty i liderow, pusty sklad, zly Sejm oraz niekompletny rzad.',
 ]},
 '1.1.82':{data:'7 sierpnia 2026', zmiany:[
  'ARYATI I LOOF SA WPISANI JAKO TESTERZY. Informacja jest widoczna po kliknieciu Tworcy w menu glownym.',
 ]},
 '1.1.81':{data:'7 sierpnia 2026', zmiany:[
  'ZMECZENIE WLADZA LICZY TYLKO PREMIERA I PREZYDENTA. Sam udzial w koalicji nie daje juz kary, a stare bledne naliczenia naprawiaja sie po wczytaniu zapisu.',
  'STOL TYGODNIA NIE DOPISUJE DUCHOW ANI DUPLIKATOW. Cofniete, stare i podwojnie zatwierdzone decyzje nie zajmuja ruchu, zniknal tez mylacy napis o braku zmian cech.',
  'PARTIE KOMPUTEROWE REGULARNIE SKLADAJA USTAWY. Robi to premier, minister albo silna opozycja, a prezydent podpisuje, wetuje i uruchamia glosowanie nad odrzuceniem weta.',
  'PODPOWIEDZI SA TAM, GDZIE TRZEBA. Gorny pasek wyjasnia akcje, kapital, energie, sondaz i mandaty, a karty decyzji nie zaslaniaja ekranu dlugimi wykladami.',
 ]},
 '1.1.80':{data:'7 sierpnia 2026', zmiany:[
  'Sad jest osobnym dzialem. Sejm wybiera sedziow, a partie wnosza sprawy o naduzycie urzedu, korupcje i naruszenie procedury.',
  'Wyroki zapadaja imiennymi glosami sedziow i koncza sie upomnieniem, grzywna, usunieciem z urzedu albo uniewinnieniem.',
  'Ustawa o sadach ma trzy nastawy: liczbe sedziow, niezaleznosc od partii i surowosc wyrokow. Brudne decyzje zostawiaja dowody.',
  'Przewijanie nie trzesie juz ekranem. Gra przestala cofac pozycje strony przy kazdym przerysowaniu.',
  'Skale interfejsu mozna zmieniac co 5 procent, a pierwsze uruchomienie dobiera rozmiar do szerokosci ekranu.',
  'Partie sterowane przez komputer zakladaja nazwane gazety, telewizje i kina, placa utrzymanie, publikuja i zdobywaja zasieg.',
 ]},
 '1.1.79':{data:'7 sierpnia 2026', zmiany:[
  'Kreator scenariuszy zostal zbudowany od nowa jako piec krokow: opowiesc, Sejm, partie, wladza i finalna kontrola.',
  'Podzial mandatow zawsze pilnuje dokladnie 40 miejsc. Mandat najpierw trafia do puli, a dopiero potem do innej partii.',
  'Mozna ustawic startowy rzad, partie premiera, prezydenta oraz klimat relacji od odprezenia po otwarta wojne.',
  'Kondycje partii ustawia sie globalnymi presetami i osobnymi wyjatkami z podgladem prawdziwej wartosci przed i po zmianie.',
  'Final kreatora pokazuje pelny sklad Sejmu, uklad wladzy, zasady i bledy blokujace zapis.',
  'Przycisk Zagraj probnie uruchamia swiat bez zapisywania pliku, a wybor partii pokazuje juz mandaty i statystyki z tego scenariusza.',
 ]},
 '1.1.78':{data:'7 sierpnia 2026', zmiany:[
  'Kondycja partii ma tylko osobne wskazniki. Usunieto ostatnie pozostalosci zbiorczej oceny.',
  'Kazdy panel prawego pulpitu mozna zwinac, a wybor nie resetuje sie przy przerysowaniu ekranu.',
  'Sala Sejmu jest wyzsza i wieksza. Mandaty, wiekszosc oraz sila rzadu dostaly czytelna hierarchie.',
  'Zloto zostalo tylko przy najwazniejszych potwierdzeniach. Negocjacje koalicyjne maja kolory zalezne od relacji i zgody.',
  'Podpowiedzi akcji, kapitalu, energii i sondazu znow sa widoczne. Pokazuja aktywne czynniki i sposob poprawy wyniku.',
  'Gorny pasek i srodkowe widoki maja wiecej miejsca oraz rowniejsze proporcje.',
 ]},
 '1.1.77':{data:'7 sierpnia 2026', zmiany:[
  'Kondycja partii pokazuje juz tylko konkretne wskazniki. Zniknela zbiorcza ocena, trend i podsumowanie mocnej oraz slabej strony.',
  'Srodek gry jest szerszy: mapa, decyzje, lider, Krol i pozostale dzialy dostaly miejsce zabrane z bocznego pulpitu i nawigacji.',
  'Prawy pulpit ma nowa kolejnosc: Przewodnictwo, Kondycja, Kronika, Sklad, Zaplecze, Serwer i Relacje. Kondycja nie naklada sie podczas przewijania.',
  'Barwa prowadzonej partii przechodzi przez cala gre. Concordia daje fiolet, PPP i FD zielen, a kolor widac w nawigacji, kartach i decyzjach.',
  'Gorny pasek ma trzy rowne strefy i nie wypada poza ekran przy mniejszym oknie.',
  'Sala Sejmu jest zwarta i wycentrowana. Wiekszosc, liczba mandatow i sila rzadu maja wlasny pas pod lawami zamiast dlugiego napisu w naglowku.',
  'System grup interesu zostal usuniety: nie ma panelu zadowolenia, cotygodniowego naliczania ani dodatkowego wplywu grup na glosowania ustaw.',
 ]},
 '1.1.76':{data:'7 sierpnia 2026', zmiany:[
  'Wybor partii dziala jak selektor druzyny: pelny profil zostaje po lewej, a cala stawka miesci sie po prawej bez przewijania przez sciane kart.',
  'Scenariusze dostaly ten sam uklad i od razu pokazuja opis kazdego swiata, zamiast samych nazw i poziomu trudnosci.',
  'Kondycja partii jest na gorze prawego pulpitu, nie nachodzi juz na kolejne karty, a Serwer, Zaplecze i Relacje sa domyslnie zlozone.',
  'HUD pokazuje pelna nazwe partii na szerokim ekranie, czytelna date i wszystkie kluczowe zasoby bez wykresow ostatnich odczytow i majatku prywatnego.',
  'Mapa zachowuje regularne szesciokaty. Trzy rowne obrysy pokazuja lidera, druga partie i twoja obecnosc, a przy mniejszym oknie mapa bierze cala szerokosc.',
  'Przyciski maja jasna hierarchie: glowna akcja jest zlota, wybory w oknach sa ciemnozielone, a zablokowane akcje pozostaja czytelne.',
  'Krzyzyk siedzi w prawym gornym rogu okna. Cofniecie wyboru okregu, tematu albo decyzji z wlasnym oknem nie zuzywa ruchu ani limitu.',
  'Transfery sa w trzech czytelnych kolumnach, a Sejm pokazuje najwazniejsze uklady bez sciany kart list wyborczych.',
 ]},
 '1.1.75':{data:'7 sierpnia 2026', zmiany:[
  'Kondycja partii nie ma juz wykresu radarowego. Zamiast niego pokazuje osobne wskazniki stanu partii.',
  'Przyciski dostaly druga warstwe czytelnosci bez zaleznosci od wygladu ekranu: dotyczy to mediow, transferow, list i modali.',
  'Zablokowane przyciski sa ciemne, ale maja jasny napis zamiast czarnej plamy.',
 ]},
 '1.1.74':{data:'7 sierpnia 2026', zmiany:[
  'Kondycja partii jest teraz duzym panelem po prawej stronie ekranu, z odczytem cech w dwoch kolumnach zamiast w waskiej liscie.',
  'Usunieto karte Co na ciebie dziala; Kronika pokazuje tylko najnowsze wpisy bez przycietego przewijania, a Przewodnictwo i Sklad sa krotsze.',
  'Przyciski akcji dostaly z powrotem czytelne zlote lub zielone tla. Zablokowane przyciski nadal sa zablokowane, ale ich opis jest widoczny.',
  'Mapa ma stale grubosci lukow oraz przerywana linie i podpis drugiej partii w kazdym okregu.',
  'Sejm zwija poboczne listy wyborcze do jednej karty, zostawiajac na wierzchu tylko najwazniejsze uklady.',
 ]},
 '1.1.73':{data:'7 sierpnia 2026', zmiany:[
   'WYBOR TRYBU JEST TERAZ TABLICA CZTERECH KART. Dzien dzisiejszy, samouczek, los i przyszle archiwum maja wlasne pelne pola, a data jest tabliczka sezonu.',
   'GORNY PASEK JEST KROTSZY: nie ma wykresow ostatnich odczytow ani kapitalu prywatnego. Energia znow miesci sie obok akcji, kapitalu, sondazu i mandatow.',
   'MAPA WROCILA DO ZWYKLYCH SZESCIOBOCZNYCH OKREGOW. Zniknal pasek Czeka na ciebie, a wazne dzialy dostaja wykrzyknik na swojej zakladce.',
   'KONDYCJA PARTII JEST PIERWSZA W BOCZNYM PANELU. Wykres wychodzi do obu krawedzi karty, a zlote tla w Mediach i przy wyborze partii sa z powrotem widoczne.',
 ]},
 '1.1.72':{data:'7 sierpnia 2026', zmiany:[
   'WYBOR PARTII I SCENARIUSZA DOSTAL NOWY UKLAD. Najpierw widzisz pelny profil wybranej opcji, a potem krotka tablice szyldow zamiast absurdalnej listy obok panelu.',
   'PULPIT I BOCZNY PANEL SA CZYTELNIEJSZE: zasoby maja rowne kasetony, kondycja partii stoi na gorze, a wykres wypelnia cala szerokosc karty.',
   'MAPA MA DZIEWIEC ROZNYCH KSZTALTOW OKREGOW I NIE MA FILTROW. Cofniecie decyzji przywraca tez znacznik tygodnia, kombinacje i limity.',
 ]},
 '1.1.71':{data:'7 sierpnia 2026', zmiany:[
   'PELNE UDWIEKOWIENIE GRY. Klikniecia, wybory, decyzje, tygodnie, pieniadze, transfery, media, modale, cele i nagrania maja teraz wlasne lekkie brzmienia zamiast kilku przypadkowych pikniec.',
   'SEJM MA WLASNY RYTM: osobno slychac glosowanie, przejscie albo upadek ustawy, pieczec podpisu i weto prezydenta. Dzwieki sa ciche, nie zagluszaja muzyki i podlegaja temu samemu przyciskowi wyciszenia.',
   'PODGLAD SKUTKOW POZOSTAJE NIEMY. Proba decyzji nie odpala zadnego dzwieku, tak samo jak wczesniej nie otwiera okien ani nie sypie efektami.',
 ]},

 '1.1.70':{data:'7 sierpnia 2026', zmiany:[
   'NOWY WYGLAD CALEJ GRY POZA MENU GLOWNYM. Zasoby sa teraz ciezka belka urzedowa, zakladki tworza boczny grzbiet ksiegi, a karty, ustawy i okna maja jeden jezyk ciemnego archiwum z mosiadznymi detalami.',
   'WYBOR PARTII, MAPA, SEJM I NOC WYBORCZA DOSTALY WLASNA HIERARCHIE. Najwazniejsza tresc bierze miejsce, lista jest narzedziem, a nie sciana takich samych kafli.',
   'NOWA AUTORSKA FAKTURA TLA. Ciemny atlas z delikatna siatka i ornamentem stoi tylko za gra, wiec filmowe menu glowne zostaje dokladnie takie jak bylo.',
 ]},

 '1.1.56':{data:'6 sierpnia 2026', zmiany:[
   'PORZUCONA DECYZJA NIE ZOSTAJE NA STOLE TYGODNIA. Wpis szedl na stol w chwili odpalenia decyzji, takze tej z wlasnym oknem — a ta w tym momencie jeszcze niczego nie zrobila. Zamkniecie okna bez wyboru zostawialo kafel bez skutkow, czasem z liczbami z powietrza. Teraz decyzja okienkowa czeka i wchodzi na stol dopiero po kliknieciu tego ostatniego punktu, a rezygnacja zdejmuje ja calkiem.',
   'JEDNOSC NADAJA JUZ TYLKO TRZY DECYZJE: Spot wyborczy, Czystka w partii i Zjazd partii. Reszta gry przestala ja dosypywac po cichu.',
   'PASEK WLADZY NA DWA POZIOMY, jak w Victorii: gorny rzad to przyrosty tygodniowe na zielono — kapital, energia, zarobek przewodniczacego i momentum — a dolny to stan zasobow. Oba siedza w jednym zaokraglonym pancerzu z mosiezna obwodka, sztandar partii stoi po lewej jak flaga. Podpisy zeszly pod liczbami do podpowiedzi, wiec pasek zszedl ze 143 na 106 pikseli i nie zawija sie juz na trzy pietra.',
   'TLUSZCZOLT — nowa cecha wrodzona Macka. Kontrowersja +2,8 i pretensjonalnosc +2,2 tygodniowo, bo Maciek nie przechodzi obok zadnej awantury. Za to Krol Mordeczka trzyma z nim jak rowny z rownym: przychylnosc dworu +14, osobnym wierszem na liscie u Krola.',
   'PARTIA LIBERALNO-REPUBLIKANSKA NAZYWA SIE TERAZ CONCORDIA i ma nowe logo. Barwa poszla w mocniejszy fiolet.',
   'LICZNIK ODPALEN W LAUNCHERZE: ile razy gra zostala uruchomiona i na ilu komputerach. Nie wychodzi stamtad nic o graczu — zaden nick, adres ani nazwa komputera. Instalacja dostaje losowy numer, ktory nigdzie nie jest wysylany i sluzy tylko temu, zeby drugie odpalenie na tej samej maszynie nie doliczylo kolejnej osoby. Brak internetu oznacza tylko tyle, ze launcher pokaze ostatnia znana liczbe.',
 ]},

 '1.1.55':{data:'6 sierpnia 2026', zmiany:[
   'DZIAL PROGRAM USUNIETY. Trzy decyzje przestawiajace elektorat poszly razem z nim, ale wyciszenie sporu i zejscie na ziemie zostaja — bez nich z wysokiej kontrowersji i pretensjonalnosci nie dalo by sie zejsc w ogole, a paraliz przy 90 bylby slepa uliczka. Siedza teraz w Organizacji. Kategorii jest szesc zamiast siedmiu.',
   'ZADNA DECYZJA NIE NADAJE JUZ JEDNOSCI. Manifest, luzny stream, regeneracja lidera i kurs dla zaplecza po cichu ja dosypywaly — teraz zgoda w partii bierze sie wylacznie z tego, co dzieje sie wokol niej, a nie z klikania decyzji.',
   'Ostrzezenie o kontrowersji zniknelo ze skladu partii i zostalo w jednym miejscu, przy kondycji partii. Wczesniej ta sama czerwona ramka stala w dwoch dzialach naraz.',
   'NAZWY WYDAWNICTW DAJA SIE ZMIENIAC. Okno nazwy bylo od blokow wyborczych i wymagalo listy partii, wiec przy wydawnictwie wywracalo sie na pierwszym odwolaniu i nic sie nie otwieralo.',
   'Gazeta nie ma juz serduszek zanim wyda pierwszy numer — swiezy szyld nie ma czego lajkowac.',
   'Lista wydawnictw ustawia sie po bilansie: najbardziej dochodowe na wierzchu, deficytowe na dole. Ujemny bilans pokazuje sie wreszcie z minusem, a nie jak zysk.',
   'JEDNA REDAKCJA KAZDEGO RODZAJU: jedna gazeta, jedna telewizja, jedno kino. Trzy szyldy tego samego naraz to juz nie byl wybor, tylko lista zakupow. W sklepie widac wprost, co juz masz.',
   'Boty siegaja po media wyraznie czesciej i przy mniejszym zapasie w kieszeni.',
   'Podpowiedz kapitalu prywatnego miesci sie w swojej ramce — dlugie nazwy i zdania wychodzily poza prostokat. Przy prawej krawedzi okna odsuwa sie do srodka, a kwoty w niej maja mordedolara.',
 ]},

 '1.1.54':{data:'6 sierpnia 2026', zmiany:[
   'GOSPODARKA WESZLA DO POLITYKI. Media byly zamknieta petla obok gry: kupowales je za prywatne pieniadze, zarabialy prywatne pieniadze i nic z tego nie wracalo do rdzenia. Teraz zasieg wydawnictw wchodzi WPROST DO SONDAZU — kto ma gazete, antene i ekran, ten dociera do ludzi takze wtedy, gdy nie zrobil w tygodniu nic innego. Zasieg liczy sie tylko z wydawnictw, ktore realnie cos wydaja, i wygasa sam, wiec media trzeba karmic, a nie kupic raz i zapomniec.',
   'DA SIE PRZEGRAC PRZEZ GOSPODARKE. Kieszen przewodniczacego moze zejsc pod kreske, a wtedy dlug rosnie sam o dziewiec procent tygodniowo, co tydzien zabiera wiarygodnosc i jednosc oraz podbija kontrowersje. Po trzech tygodniach pod kreska komornik zabiera wydawnictwa, jedno po drugim, zaczynajac od najdrozszego — z licytacji wraca niecala polowa. Do tego kazdy szyld ma koszty stale, wiec media, z ktorych nic nie wychodzi, po prostu topia pieniadze.',
   'BOTY GRAJA W GOSPODARKE. Partie prowadzone przez komputer zakladaja teraz wlasne wydawnictwa, kiedy je na to stac, i regularnie z nich wydaja — wiec ich zasieg tez wchodzi do sondazu. Twoja przewaga przestala rosnac sama z tego, ze nikt inny nawet nie probuje.',
   'SLAWA PRZESTALA BYC WALUTA WSZYSTKIEGO. Kazdy system ciagnie teraz z czego innego: serduszka gazety z WIARYGODNOSCI i kompetencji redaktora, widownia telewizji z AKTYWNOSCI i charyzmy prowadzacego, kino nadal ze slawy, a zarobek przewodniczacego z AUTORYTETU i mandatow. Optymalna gra przestala sie sprowadzac do podbijania jednego suwaka.',
   'DECYZJE GOSPODARCZE NIE ZJADAJA JUZ AKCJI. Zarobek i zrzutka to prywatne sprawy przewodniczacego, wiec kosztuja zero akcji, za to sporo energii. Nowe systemy przestaly konkurowac z polityka o te same trzydziesci szesc ruchow na kadencje.',
   'SAD ZSZEDL POD SEJM jako karta. Trzynascie dzialow na trzy akcje w tygodniu to bylo za duzo — teraz jest ich dziesiec.',
   'NAGRANIE MA TRZY TRYBY, losowane za kazdym razem: Uwaga widowni z oczkami wznoszacymi sie od dolu, Trema z gestymi oczkami gasnacymi blyskawicznie i Potok pytan, w ktorym oczka przelatuja z boku na bok. Jedno klikanie w kolko przestalo byc jedynym, co tam jest.',
 ]},

 '1.1.53':{data:'6 sierpnia 2026', zmiany:[
   'DZIAL MEDIA WIDAC ZAWSZE, nad Sadem. Bez ustawy o mediach po prostu nic sie w nim nie otworzy — zamiast znikac z nawigacji bez slowa, stoi z etykieta „zamk." i tlumaczy, czego brakuje.',
   'GAZETA TO SZYLD, A NIE JEDNA GAZETA. Pod jednym wydawnictwem wychodza kolejne numery, co dwa tygodnie, i kazdy zbiera tyle serduszek, na ile stac twoja slawe, kompetencje redaktora i staz szyldu. Od dziesieciu numer wychodzi na swoje, ponizej dokladasz do niego z kieszeni.',
   'WIDOWNIA ZESZLA NA ZIEMIE. Odcinek ogladalo dziewiecset osob przy serwerze liczacym szescset siedemdziesiat — teraz przed ekranem siada dwadziescia kilka osob, a przy filmie dwadziescia do czterdziestu. Za to kazdy widz jest sporo wart, wiec pieniadze wychodza podobne, tylko liczby wreszcie znacza to, co powinny.',
   'Telewizja i kino maja przerwe tygodniowa, gazeta dwutygodniowa — przy kazdym wydawnictwie widac wprost, ile jeszcze zostalo do nastepnego wydania.',
   'Przy kazdym wydawnictwie widac tez, ile numerow albo wydan juz z niego wyszlo.',
 ]},

 '1.1.52':{data:'6 sierpnia 2026', zmiany:[
   'MAJATEK ROSNIE REGRESYWNIE I O TO CHODZILO. Wszyscy mieli te sama stawke tygodniowa, wiec pol procenta od dwustu milionow dawalo wiecej niz ktos z tysiacami widzial przez cala kadencje — przepasc poglebiala sie sama i z dolu nikt nie ruszal z miejsca. Teraz szescdziesiat tysiecy rosnie po jakies szesc procent tygodniowo, dziesiec milionow po jeden, a cwierc miliarda po dwie dziesiate. Przez kadencje mentos urosl o 119%, kenzo o 5%.',
   'RZAD FIRMUJE WLASNE USTAWY. Zglaszales projekt jako premier i patrzyles, jak twoi wlasni koalicjanci wstrzymuja sie albo glosuja przeciw, mimo ze umowa stala. Teraz koalicja przy dobrych relacjach glosuje za jak jeden maz, przy chlodnych czesc sie wstrzymuje, a dopiero zepsute relacje albo projekt szyty grubo pod siebie zwalniaja z dyscypliny.',
   'MINIGRA PRZENIESIONA TAM, GDZIE MIALA BYC: do wykladow i reportazy z ustawy o MAN, nie do wywiadu. Zamiast zbierania pieniedzy sa oczka uwagi, ktore trzeba klikac, zanim zgasna, i liczy sie sama celnosc. Nagroda jest w slawie i umiarkowana — to przyprawa do ustawy, a nie sposob na granie w kolko.',
   'NOWY DZIAL MEDIA, otwierany ustawa o mediach. Bez niej nikt na serwerze nie ma prawa niczego wydawac. Wszystko kupuje sie za prywatny majatek przewodniczacego — i to jest to, na co sie go zbiera.',
   'WYDAWNICTWO GAZETOWE za 500 tysiecy: zyje samo i zarabia na serduszkach. Od dziesieciu wychodzi na plus, powyzej zaczyna zarabiac, a serduszek przybywa razem ze slawa partii i kompetencja redaktora. Gazete mozna nazwac i obsadzic kims ze swojego zaplecza.',
   'WYDAWNICTWO TELEWIZYJNE za 10 milionow: nagrywasz odcinki i sam wybierasz, o czym mowisz — filozoficznie, politycznie albo smieciowo. Widownia zalezy od tego, do kogo trafia temat i jak stoi twoje dopasowanie do grup, a wplyw idzie wprost od liczby widzow.',
   'WYDAWNICTWO KINOWE za 20 milionow: kręcisz filmy, a na seanse przychodzi tym wiecej ludzi, im glosniej o twojej partii. Bilans kazdego wydawnictwa liczy sie osobno i widac go na wspolnej liscie.',
 ]},

 '1.1.51':{data:'6 sierpnia 2026', zmiany:[
   'RANGI DZIALAJA ODWROTNIE NIZ DOTAD I TAK, JAK POWINNY. Wejscie na kazdy stopien kosztowalo caly prog, wiec na starcie polowa bogaczy wykupywala sie na wyzsze polki naraz — z gospodarki znikaly setki milionow, PKB lecialo w dol, a premier obrywal absolutorium za cos, na co nie mial wplywu. Teraz Sir to szesc procent progu, a Elektor szescdziesiat, i do tego trzeba miec siedemdziesiat procent wiecej, niz wynosi jego kamien milowy. Nizsze rangi wpadaja same, wyzsze bola coraz mocniej. Kapital prywatny znowu rosnie zamiast wyparowywac.',
   'ABSOLUTORIUM W DWUNASTYM TYGODNIU, jako porzadna tabela: PKB na starcie kadencji, PKB na koniec, zmiana procentowa i wypisane co do jednego, co z tego wynika dla premiera. W ostatnim tygodniu nie wyskakuje juz zadne wydarzenie — rozliczenie z gospodarki ma byc jedyna rzecza, na ktora patrzysz.',
   'WEJSCIE NA ZYWO W WYWIADZIE. Po pytaniach idzie trzydziesci sekund transmisji: przez ekran przelatuja widzowie, ktorych trzeba lapac, zanim uciekna. Ogladalnosc mnozy to, co wyszlo z rozmowy — dobra odpowiedz przy pustej widowni wazy mniej niz srednia przy pelnej sali. Im dalej w transmisje, tym gescej i szybciej.',
   'USTAWA O ORDYNACJI NIE RUSZA JUZ MANDATOW. Zmiana wielkosci sejmu w srodku kadencji rozdawala mandaty od nowa i rozjezdzala wszystko, co liczy sie od stalej wielkosci izby. Zostal sam prog wyborczy.',
   'PRZEKUPIENIE KROLA WYRAZNIE PODROZALO: punkt przychylnosci kosztuje teraz szesnascie kapitalu zamiast siedmiu. Desygnacja przestala byc kwestia zbierania kasy.',
   'NOWA ZAKLADKA SAD, na razie jako podglad. Sklad sadu administracyjnego bierze sie wprost z ustawy o sadach: bez niej sadu nie ma, a sedziow obsadza resort Sprawiedliwosci, wiec kto go trzyma, ten ustawia lawe. Sprawy, odwolania i wyroki dopiero powstaja — dzial stoi z etykieta wip, zeby bylo jasne, ze liczby sa prawdziwe, a mechaniki jeszcze nie ma.',
 ]},

 '1.1.50':{data:'5 sierpnia 2026', zmiany:[
   'STOPNIE RANG. Majatek prywatny ma teraz kamienie milowe: od Sira za milion, przez Barona, Magnata i Ksiecia, az po Elektora za miliard. Przekroczenie progu kosztuje dokladnie tyle, ile ten prog wynosi — placisz wpisowe — ale od tej pory zarabiasz o osiemnascie procent wiecej za kazdy stopien. Kto wchodzi do gry z gotowym majatkiem, ma rangi nadane i nie placi za nie nic: loof ze 150 mln jest Ksieciem i zbiera na Wielkiego Ksiecia, a mentos z 59 tysiacami nie ma zadnej i idzie na Sira. Najwyzsza ranga stoi pod portretem, tam gdzie kapital prywatny.',
   'NOWA DECYZJA: ZAROB KAPITAL PRYWATNY (Organizacja). Przewodniczacy odpuszcza polityke na tydzien i zajmuje sie wlasnym interesem. Partia nie dostaje z tego nic — ani slawy, ani jednosci — za to w kieszeni robi sie grubiej. Rozrzut jest szeroki, wiec raz wyjdzie 700 tysiecy, a raz trzynascie milionow.',
   'WIEC W KANALE PRZESTAL DAWAC JEDNOSC. Buduje obecnosc i slawe, a od zgody w partii jest co innego.',
   'Wybor tematu wiecu nie podpowiada juz, co jest przyzwoite, a co zle. Sklad kanalu stoi wyzej w oknie i wniosek trzeba wyciagnac samemu — gotowa etykietka zamieniala decyzje w czytanie odpowiedzi.',
   'USTAWA O KANALACH USUNIETA. Przewracala cala mape wyborcza w srodku kadencji, przez co obecnosc budowana przez pol kadencji tracila sens, a przy okazji sypaly sie rzeczy liczone od stalej liczby okregow. Wiecej z tego bylo awarii niz rozgrywki.',
   'WYKRES PKB POKAZUJE SIE OD PIERWSZEGO TYGODNIA. Wczesniej potrzebowal dwoch odczytow, wiec przy pierwszym wejsciu w Ekonomie bylo tam samo zdanie o tym, ze wykresu jeszcze nie ma.',
   'Poparcie rzadu weszlo do czynnikow mnoznika PKB. Rzad z dobrym poparciem podnosi obrot, brak rzadu go dusi.',
   'ABSOLUTORIUM. Na koniec kadencji premier odpowiada za gospodarke. Jesli PKB przez kadencje spadlo, sejm nie udziela absolutorium: wiarygodnosc, slawa, jednosc i aktywnosc ida w dol, kontrowersja w gore, a poparcie rzadu siada. Kara rosnie z glebokoscia spadku, ale nie przewraca rzadu — zla gospodarka ma bolec, nie konczyc rozgrywke.',
   'Kropki lukow kadencji przestaly wchodzic na podpowiedzi rozwijane z paska wladzy.',
 ]},

 '1.1.49':{data:'5 sierpnia 2026', zmiany:[
   'RZAD DESYGNUJE WRESZCIE SWOJEGO PREMIERA. W pierwszej rundzie kandydata brano z calej izby wedlug przychylnosci Krola i — co gorsza — od razu nadpisywano nim premiera koalicji. Stad trzy dziwactwa naraz: rzad zglaszal kogos spoza siebie, gubil wlasnego kandydata, a potem karnie glosowal za obcym, bo dyscyplina koalicyjna patrzy wlasnie na premiera rzadu. Teraz pierwsza desygnacja nalezy do koalicji, a Krol wchodzi dopiero wtedy, gdy rzadu nie ma.',
   'PRZEWODNICZACY ZARABIA. Co tydzien wplywa mu prywatny majatek: tym wiecej, im wieksza slawa, autorytet, liczba mandatow i urzedy. Premier obraca cudzymi pieniedzmi i czesc z tego zostaje przy nim. Kontrowersja dziala odwrotnie — nikt nie robi interesow z kims, kto co tydzien jest w awanturze.',
   'KAPITAL PRYWATNY W PASKU WLADZY, obok akcji, kapitalu i mandatow, ze znakiem mordedolara. Pod kursorem rozpisuje sie na kieszenie zaplecza i pokazuje tygodniowy zarobek przewodniczacego.',
   'USTAWA O UTWORZENIU EVENTU. Sejm powoluje event, a placi za niego przewodniczacy z wlasnej kieszeni: teleturniej telewizyjny za 38 mln, event o grze komputerowej za 19 mln albo event o przemowie za 7 mln. Kazdy daje co innego — teleturniej slawe i obecnosc wszedzie, gra serwerowiczow i awanture o zasady, przemowa wiarygodnosc i jednosc.',
   'USTAWA O MAN ORGANIZUJE. Do stopni i tytulow doszedl wybor, co Akademia robi na otwarcie: wyklad o intelektualnych zagwozdkach za 26 mln (elita zachwycona), reportaz o serwerze za 14 mln (po rowno slawa i wiarygodnosc) albo wyklad o smieciach za 5 mln (tanio i bez pretensji). Obie ustawy zglasza premier albo minister od wlasciwego resortu.',
   'Koszt schodzi z prywatnego majatku dopiero wtedy, gdy sejm ustawe uchwali — przepadly projekt nie kosztuje ani grosza.',
   'MNOZNIK OBROTU JEST WYMAGAJACY. Stabilnosc wychodzi na plus dopiero ponizej 40 kontrowersji, a inwestycje dopiero powyzej 50 aktywnosci. Wczesniej oba progi stały tam, gdzie serwer stoi sam z siebie, wiec wszystko bylo na plusie bez wysilku. „Zaufanie przedsiebiorcow" nazywa sie teraz po ludzku: zadowolenie ludzi.',
   'WYKRES PKB w dziale Ekonomia: ostatnie dwadziescia cztery tygodnie, zielony przy wzroscie, czerwony przy spadku, z odczytem zmiany procentowej.',
   'GLOSOWANIA NAD USTAWAMI WYGLADAJA JAK ROZSTRZYGNIECIE, a nie jak wiersz tekstu. Werdykt to pieczec ze znakiem przybitym w plakietce, obok trzy liczby w tabliczkach, a przy przegranej widac wprost, ilu glosow zabraklo do progu. Kazda partia dostala listwe w barwie swojego glosu.',
 ]},

 '1.1.48':{data:'5 sierpnia 2026', zmiany:[
   'MORDEDOLAR NA SWOIM MIEJSCU. Sakiewka z monetami stoi teraz przy kazdej kwocie w grze: przy PKB, przy kapitale prywatnym i pod portretami w zapleczach. Rysowany zapas przestal byc potrzebny.',
   'Obrazek zostal przyciety do samej sakiewki i przeskalowany, bo w oryginale wiekszosc pliku to byl pusty margines — w ikonie na dwanascie pikseli sakiewka bylaby ziarnkiem w rogu.',
 ]},

 '1.1.47':{data:'5 sierpnia 2026', zmiany:[
   'WYWIADY ZA DARMO W KOLKO — KONIEC. Decyzja z wlasnym oknem jest oplacona z gory, a zapis o tej oplacie sluzy do jej cofniecia. Wywiad, nabor i uklad sterow nie kasowaly go po zakonczeniu, wiec zapis przechodzil na nastepne decyzje: pierwsze „wstecz" w dowolnym kolejnym oknie oddawalo pieniadze za tamta i zdejmowalo jej limit.',
   'PORZUCONA DECYZJA NIE LICZY SIE JUZ JAKO ZUZYTA. Zamkniecie okna w inny sposob niz przyciskiem „wstecz" zostawialo decyzje policzona, choc nic z niej nie wyszlo. Teraz gra sama to rozpoznaje: nie ma okna, a oplata wisi — znaczy, ze decyzja nie doszla do skutku, wiec wraca w calosci razem z akcja i limitem.',
   'PKB LICZY SIE Z MAJATKU: suma prywatnych kont razy mnoznik obrotu. Dlatego konta stoja w milionach, a PKB w miliardach, i wszystko, co rusza majatkiem, widac od razu.',
   'Mnoznik obrotu nie jest staly. Skladaja sie na niego kompetencja ministra finansow, kompetencja premiera, stabilnosc, inwestycje i zaufanie przedsiebiorcow — wszystkie pieć widac wypisane w dziale Ekonomia razem z tym, ile kazdy dodaje.',
   'KAPITAL PRYWATNY ZYJE. Rosnie sam z siebie, a podatek ten wzrost zjada i przy wysokiej stawce wychodzi juz pod kreska. Podatek daje pieniadze teraz, ale zabiera i majatek, i zaufanie, wiec PKB zwalnia z dwoch stron naraz — nie ma jednej najlepszej stawki.',
   'MAJATKI ROZDANE PO NAZWISKACH, a nie z automatu. Bartek, Tortex i loof maja po 150–230 mln i sami robia ponad polowe majatku serwera. kenzo, Supernes, Mnem i Aryati maja wiecej niz niejeden lider. Kromka, Kaziu, Sulejman czy impir siedza na kilku milionach mimo przewodnictwa. Bezpartyjni maja tysiace, wiec po zwerbowaniu od razu widac, ze nic nie wnosza.',
   'NOWA DECYZJA: ZRZUTKA Z PRYWATNYCH KIESZENI (Organizacja). Milion prywatnego majatku to jeden punkt kapitalu partii. Kto wylozy, ten odchodzi z partii, a jednosc siada tym mocniej, im grubszy portfel wydoisz. Przewodniczacego nie ruszysz. AI siega po to samo, ale tylko gdy ma kase pod kreska.',
   'USTAWA O PODATKACH ROBI JUZ TYLKO JEDNA RZECZ. Wczesniej pod jedna nazwa skubala kapital partii, osobno majatki prywatne i jeszcze przestawiala progresje skladek — nie dalo sie wyczytac, co robi jeden suwak. Zostal podatek od prywatnych majatkow, ktory napelnia skarb i przez majatki rusza PKB.',
   'Panel ekonomii nie ma juz zadnych przyciskow podatkowych — podatki ustawia sie wylacznie ustawa.',
 ]},

 '1.1.46':{data:'5 sierpnia 2026', zmiany:[
   'DECYZJE PRZESTALY ODPALAC SIE SAME. Podglad skutkow gral prawdziwa decyzje dziewiec razy na kopii stanu, zeby pokazac widelki. Decyzje takie jak nabor, wywiad czy uklad sterow nie licza niczego same — otwieraja wlasne okno. Podglad naprawde je otwieral, a ze jego pamiec kasuje sie co tydzien, na starcie kazdego tygodnia sypalo oknami. Teraz podglad nie otwiera niczego, nie gra dzwiekami i nie sypie konfetti.',
   'Przy decyzjach, ktorych skutek rozstrzyga sie dopiero w oknie, podglad mowi to wprost zamiast milczec jak przy decyzji bez skutkow.',
   'PKB DZIALA. To roczny obrot calego serwera, wiec stoi w miliardach, i rusza sie co tydzien: aktywne partie napedzaja wzrost, awantury go dusza, a podatek od majatku hamuje go i jednoczesnie napelnia skarb.',
   'PODATKI SIEDZA W USTAWIE, NIE W ZAKLADCE. Ustawa o podatkach realnie strzyze prywatne konta i przesuwa PKB. Przy progresji place glownie bogaci — czyli ci sami, ktorzy siedza w sejmie i maja to przeglosowac. Bez progresji stawka jest rowna, wiec procentowo najciezej wychodzi najubozszym, ktorych jest najwiecej przy urnach.',
   'Kapital prywatny rozjechal sie tak, jak powinien: przewodniczacy obracaja milionami, dalekie zaplecze tysiacami, a bezpartyjni grosikami. Rozpietosc siega trzech tysiecy razy.',
   'WYWIAD OD NOWA. Zamiast trzech pytan z jednym wlasciwym tonem masz cztery losowane z puli, kazde z wlasnym naciskiem. Pod pytaniem z nozem przechwalki nie przejda nikomu, przy lekkim odbiciu pokora brzmi jak brak pomyslu. Licza sie dwie rzeczy naraz, dziennikarz i widownia, i chca czego innego. Do tego kregoslup: kto trzyma jedna linie, dostaje premie, kto skacze miedzy rejestrami, traci wiarygodnosc.',
   'Wywiad wyglada teraz jak studio: portret pod swiatlem, dwa wskazniki, ktore ruszaja sie po kazdej odpowiedzi, pytanie postawione jak cytat i reakcja dziennikarza od razu po odpowiedzi.',
 ]},

 '1.1.45':{data:'5 sierpnia 2026', zmiany:[
   'NOWY DZIAL: EKONOMIA — i od razu mowi o sobie, ze jest NIEDOKONCZONY. Widac PKB serwera i kapital prywatny kazdej osoby z zaplecz, ale nic z tego jeszcze nie dziala: PKB stoi w miejscu, nikt nie zarabia, nikt nie traci, a przyciski ustawy podatkowej sa wylaczone. Dzial jest po to, zeby zobaczyc liczby i dopiero na nich zdecydowac, jak ma dzialac.',
   'KAPITAL PRYWATNY POD PORTRETAMI. Kazdy z zaplecza ma wlasny majatek, osobny od kapitalu partii, widoczny pod avatarem w zakladce Partie i we wlasnym zapleczu. Rozrzut jest ostry celowo: garstka bogatych i duzo biednych, bo na tym ma stac spor, kogo opodatkowac.',
   'Znak mordedolara jest na razie zastepczy — czeka na wlasciwa emotke.',
 ]},

 '1.1.44':{data:'5 sierpnia 2026', zmiany:[
   'KREATOR SCENARIUSZY WRESZCIE SIE OTWIERA. Kafel na ekranie startowym nie robil nic: kreator pytal o partie tak, jakby jakas gra juz stala, a stal przed nia, wiec leciał na pustym miejscu i ekran nie wchodzil. Bral teraz liste partii ze stalej tablicy, tak jak robia to herby. Bylo zepsute od czasu, kiedy kreator trafil na ekran startowy.',
   'PREZYDIUM SEJMU I WYBOR PREMIERA na plytach: sztandar z tabliczkami, tresc na plycie i przyklejona stopka z przyciskiem. Wybor premiera mial gesty akapit z czterema liczbami — teraz stoja w tabliczkach: ile glosow do wiekszosci, ile mandatow w sejmie, ktora tura i jaka presja na poslow.',
   'WYBORY PREZYDENCKIE w calosci: wystawienie kandydata, noc, dogrywka i final. Caly ciag od dnia wyborow do zaprzysiezenia mowi teraz jednym jezykiem.',
   'EKRAN KONCA GRY dostal sztandar i tabliczki: ile kadencji, ktory tydzien, ilu ludzi zostalo i jaki dorobek.',
 ]},

 '1.1.43':{data:'5 sierpnia 2026', zmiany:[
   'NOC PREZYDENCKA tym samym jezykiem co wyborcza: sztandar z tabliczkami, rzad komisji, palac czekajacy na zwyciezce i tory kandydatow jako osadzone plytki. Meta 50% to teraz mosiezna kreska, a nie szara linijka.',
   'Portrety kandydatow przestaly mrugac. Ranking zmienia sie co klatke liczenia i razem z nim przestawiala sie cala lista, wiec awatar co chwile wczytywal sie od nowa. Teraz tor kandydata stoi w miejscu, a przesuwa go tylko kolejnosc — wynik widac lepiej, bo wiersze realnie jada w gore i w dol.',
   'RAPORT KADENCJI WRACA NA EKRAN WYNIKOW. Ocena literowa calej kadencji z szesciu obszarow byla napisana w grze od dawna, ale zaden ekran jej nie pokazywal. Teraz stoi pod wynikiem jako pieczec, a obszary jako plytki. Od drugiej kadencji, bo polowa pol to zmiana wzgledem poprzedniej.',
   'DZIEN WYBOROW dostal ten sam sztandar, a progi list stoja w tabliczkach zamiast w akapicie. Cala sciezka wyborcza — dzien, noc, wyniki — czyta sie teraz jako jedno.',
 ]},

 '1.1.42':{data:'5 sierpnia 2026', zmiany:[
   'NOC WYBORCZA OD NOWA. Byla tabelka na karcie. Teraz to studio: sztandar z tabliczkami, ktore rosna w trakcie liczenia, rzad komisji zapalajacych sie barwa swojej listy i cokol zwyciezcy, ktory stoi pusty od pierwszej sekundy i czeka, az ktos go zajmie. Kazda lista to osadzona plytka ze swiecaca listwa w swoim kolorze, a mandaty stoja w zlotej tabliczce.',
   'Na pasku poparcia widac wreszcie prog tej listy. Od razu wiadomo, kto siadl tuz pod kreska, a kto ja przeskoczyl — listy, ktore nie weszly, sa wygaszone.',
   'Nowy wynik naprawde wjezdza na ekran. Wczesniej animacja szla na zly wiersz: nowa lista podmieniala sie po cichu, a od nowa rozjezdzal sie pasek tej najslabszej, pokazanej dawno temu.',
   'EKRAN WYNIKOW tym samym jezykiem, wiec czyta sie dalej jak ciag tej samej nocy: ta sama plyta z mosiezna listwa, ten sam rzad tabliczek. Slupki sa teraz osadzone w plycie i swieca, twoja kolumna dostala zlota plinte, a rozliczenie kadencji te same plytki co wiersze nocy.',
   'Przycisk zamykajacy oba ekrany przykleja sie do dolu okna, wiec nie trzeba do niego przewijac.',
 ]},

 '1.1.41':{data:'5 sierpnia 2026', zmiany:[
   'OKNA I MODALE w tym samym jezyku: mosiezna listwa u gory, okucie w rogu, naglowek szeryfowy. Opcje do wyboru wygladaja teraz na plytki, ktore sie naciska, a nie na wiersze listy — pod kursorem odjezdzaja w bok i swieca zlotem.',
   'Krzyzyk zamykajacy obraca sie pod kursorem.',
 ]},

 '1.1.40':{data:'5 sierpnia 2026', zmiany:[
   'KARTY W CALEJ GRZE jako plyty, tym samym jezykiem co ekrany startowe: krawedz swiatla u gory, listwa w barwie dzialu pod naglowkiem i okucie w rogu, ktore zapala sie pod kursorem. Jedna zmiana przeszla naraz na Sejm, Sondaz, Partie, Lidera i Cele.',
 ]},

 '1.1.39':{data:'5 sierpnia 2026', zmiany:[
   'Liczby nad wyborem partii siedza wreszcie w tabliczkach. Poprzednie wydanie mialo ten styl napisany na zla klase, wiec nie mial czego zlapac i rzad liczb zostal plaski.',
 ]},

 '1.1.38':{data:'5 sierpnia 2026', zmiany:[
   'EKRAN WYBORU PARTII w tym samym jezyku co ekran trybow. Karta partii jest teraz osadzona plyta z mosiezna listwa u gory i okuciem w rogu, liczby nad nia stoja w tabliczkach, a kafle partii unosza sie pod kursorem i swieca barwa swojego ugrupowania.',
   'Wybrana partia dostaje okucie w rogu, dokladnie takie jak karta trybu, wiec oba ekrany mowia tym samym.',
 ]},

 '1.1.37':{data:'5 sierpnia 2026', zmiany:[
   'EKRAN TRYBOW OD NOWA. Byly trzy plaskie prostokaty na czarnym tle. Teraz ekran jest zbudowany z plyt jak w grach Paradoxu: sztandar z mosiezna listwa, liczby w osadzonych tabliczkach, karty z okuciami w rogach i ikonami w plakietkach.',
   'TRZY NOWE KARTY. Kreator scenariuszy i Wczytaj scenariusz weszly prosto na ekran startowy, wiec nie trzeba ich juz szukac. Doszedl tez Slepy los: gra sama dobiera scenariusz i partie, a dowiadujesz sie, kim grasz, dopiero po starcie.',
   'Launcher przestal zajmowac sie scenariuszami — robi tylko to, do czego jest: odpala gre i ja aktualizuje.',
 ]},

 '1.1.36':{data:'5 sierpnia 2026', zmiany:[
   'NOWY KREATOR SCENARIUSZY. Byl ciasnym oknem z kilkunastoma suwakami, po ktorym nie dalo sie poznac, co wlasciwie powstaje. Teraz to pelny ekran: ustawienia w sekcjach po lewej, a po prawej stale widoczny opis tego, co scenariusz naprawde zrobi na starcie.',
   'SCENARIUSZ JAKO PLIK. Zapisujesz go jako plik .mmscen i wysylasz komu chcesz. Na liscie scenariuszy jest przycisk Wczytaj z pliku, ktory stawia cudzy scenariusz obok wbudowanych.',
   'Naprawione: zmiana skladu partii dzialala odwrotnie. Scenariusz ustawiony na partie mniejsze o 30% robil je o 30% wiekszymi. Przy powiekszaniu ludzie biora sie teraz z puli bezpartyjnych, a nie znikad.',
   'Suwak, ktory ruszyles, jest podswietlony, wiec widac, co zmieniles wzgledem zwyklej gry.',
 ]},

 '1.1.35':{data:'5 sierpnia 2026', zmiany:[
   'KONIEC PRZEBUDOWYWANIA EKRANU. Gra po kazdej decyzji niszczyla caly ekran i tworzyla go od nowa. Teraz ekran jest zszywany: porownanie wezel po wezle zostawia nietkniete wszystko, co sie nie zmienilo.',
   'Dzieki temu paski cech dojezdzaja plynnie zamiast przeskakiwac, przewijanie zostaje tam, gdzie bylo, herby i awatary nie mrugaja przy kazdym kliknieciu, a odczyt, ktory sie wlasnie zmienil, mruga zlotem.',
   'Pole tekstowe, w ktorym wlasnie piszesz, nie kasuje sie w trakcie rysowania.',
   'Zszywanie objelo wszystkie dwadziescia trzy miejsca, w ktorych gra rysuje ekran, bez zmiany ani jednego z nich: przechwycone jest samo przypisanie tresci.',
 ]},

 '1.1.34':{data:'5 sierpnia 2026', zmiany:[
   'PODGLAD SKUTKOW. Najedz kursorem na decyzje, a paski cech w bocznej kolumnie pokaza ducha: zakreskowany odcinek mowi, dokad pojedzie kazda cecha, a przy liczbie staja widelki w rodzaju 62 +5...+8. Przestales klikac w ciemno.',
   'Widelki, a nie jedna liczba, bo skutki sa losowe z zalozenia. Gra odpala prawdziwa decyzje dziewiec razy na kopii stanu i pokazuje rozrzut, jaki z tego wyszedl. Zaden wynik nie jest zmyslony ani wpisany recznie, wiec podglad nie rozjedzie sie z gra.',
   'KRESKA RYWALA. Przy kazdym pasku stoi pionowa kreska z nazwa najlepszej partii w tej cesze, a obok twojej liczby miejsce w stawce. Samo 62 nigdy nie mowilo, czy to duzo.',
   'Przy kontrowersji i pretensjonalnosci najlepszy znaczy najnizszy, bo tam wygrywa ten, kto ma najmniej.',
 ]},

 '1.1.33':{data:'5 sierpnia 2026', zmiany:[
   'STOL TYGODNIA. Nad decyzjami stoi teraz stol z miejscami na twoje ruchy. Puste zapraszaja, zajete zostaja jako zapis tego, co zagrales, razem z liczbami, ktore ta decyzja naprawde dala. Wczesniej po zagraniu nie bylo po niej sladu poza wpisem w kronice.',
   'Decyzja za dwa albo trzy ruchy zajmuje na stole tyle miejsc, ile kosztuje, wiec od razu widac, ile tygodnia zjada.',
   'LUK KADENCJI. Nad zakladkami biegnie os dwunastu tygodni: przebyte wygaszone, biezacy duzy i zloty, na koncu odliczanie do wyborow, ktore czerwienieje na dwa tygodnie przed urna. Dwunasty tydzien przestal wygladac dokladnie jak drugi.',
 ]},

 '1.1.32':{data:'5 sierpnia 2026', zmiany:[
   'PRZEBUDOWA UKLADU. Nawigacja zeszla z gory na lewa szyne i zostaje na miejscu przy przewijaniu, tak jak w klientach gier. Gra przestala czytac sie jak strona internetowa z paskiem i menu.',
   'Tresc dostala cala wysokosc okna i sporo szerokosci: decyzje mieszcza sie teraz w trzech kolumnach zamiast dwoch, a wybrany dzial widac non stop zamiast szukac go w rzedzie kilkunastu zakladek.',
   'Pasek zasobow jest osobnym panelem z zaokraglona rama, a nie kanapka miedzy tytulem a menu.',
   'Na waskim oknie szyna sama wraca na gore, wiec nic sie nie zwezi do niczytelnosci.',
 ]},

 '1.1.31':{data:'5 sierpnia 2026', zmiany:[
   'Sejm zastany poprawiony: PPP ma szesc mandatow zamiast siedmiu, Kongres Koronny trzy zamiast czterech. Ludzie odeszli, a mandaty przejeli sasiedzi z tego samego obozu, wiec izba dalej ma rowno 40, a rzad kisielka48 26.',
   'Koalicjanci maja wreszcie dyscypline. Gdy Krol desygnuje premiera spoza twojej koalicji, twoi partnerzy glosuja przeciw; gdy kandydat jest z koalicji, popieraja go i dopiero wtedy da sie ich przekupic. Wczesniej glosowali za kazdym.',
   'Republike moga odbudowac tylko partie republikanskie: PPP, PLR, PKD, NBR i DPD. Warunek dostepu odsiewal wczesniej wylacznie DPD, wiec cel otwieral sie kazdemu, lacznie z monarchistami.',
   'Tydzien bez ruchu nie odpala sie juz po zagraniu decyzji, ktora zwraca akcje. Liczy sie fakt zagrania czegokolwiek, a nie stan licznika akcji. Komunikat mowi teraz, ile dokladnie kosztuje bezczynnosc.',
   'Transfery bezpartyjnych: dwa na kadencje zamiast jednego na tydzien. Wolna pula znikala do konca pierwszej kadencji, teraz starcza na cala gre i nikt nie wykupi wszystkich.',
 ]},

 '1.1.30':{data:'5 sierpnia 2026', zmiany:[
   'Ekran startowy: zza tytulu bije cieple swiatlo, liczby serwera sa duze i zlote, a karty trybow wyraznie leza nad tlem i mocniej reaguja na kursor.',
   'Cechy przewodniczacego: poprawione obciecie podpisu AUTORYTET.',
 ]},

 '1.1.29':{data:'5 sierpnia 2026', zmiany:[
   'Nowa paleta calej gry. Tlo zeszlo glebiej, a panele poszly w gore, wiec karty wreszcie wygladaja jak karty lezace na czyms, a nie jak plamy w tym samym kolorze co tlo.',
   'Sala obrad dostala atmosfere: cieple swiatlo znad mownicy, przyciemnione brzegi i delikatne ziarno jak na transmisji z obrad.',
   'Pasek u gory to teraz pulpit: odczyty rozdzielone kreskami, zlote liczby, barwa twojej partii biegnie przez cala dolna krawedz.',
   'Zakladki maja plynny wskaznik, a przy zmianie widoku karty wjezdzaja po kolei. Animacja odpala sie tylko przy zmianie zakladki, wiec klikanie decyzji niczym nie miga.',
   'Lawy w Sejmie sa wypukle i reaguja na kursor, wlasne mandaty swieca zlotem. Pasek glosowania jest wyzszy i wypelnia sie plynnie.',
   'Cechy przewodniczacego czyta sie jak odczyty przyrzadu, a nie jak cztery szare kwadraty.',
   'Naprawione: tytul decyzji stal o 15 pikseli dalej niz jej opis, bo zostal mu padding po starszej wersji ukladu.',
   'Kto ma w systemie wylaczone animacje, dostaje gre bez ruchu.',
 ]},

 '1.1.28':{data:'5 sierpnia 2026', zmiany:[
   'Drugi etap nowego wygladu: ekran Decyzji. Kategorie wygladaja teraz jak nawigacja, filtry skutkow zeszly na drugi plan, a kafle maja rowne wysokosci i kolorowy akcent kategorii przy lewej krawedzi.',
   'Wyszarzone decyzje wyrazniej odrozniaja sie od dostepnych, a powod blokady stoi w osobnej linii pod kaflem.',
   'Mapa okregow: kafle reaguja na kursor i wyraznie pokazuja, ktory okreg jest wybrany.',
 ]},

 '1.1.27':{data:'5 sierpnia 2026', zmiany:[
   'Pierwszy etap nowego wygladu: jedna skala wielkosci pisma i jeden rytm odstepow zamiast wartosci dobieranych na oko w kilkunastu miejscach.',
   'Karty maja spokojniejsza rame i wyrazniejszy naglowek, kafle decyzji czytaja sie jak karty do zagrania.',
   'Tabele, listy, pigulki i okna dostaly wiecej powietrza i jednolita wysokosc.',
   'Wykres kondycji partii mniejszy - podpisy osi przestaly na siebie zachodzic.',
 ]},

 '1.1.26':{data:'5 sierpnia 2026', zmiany:[
   'Weto nie marnuje juz calej kadencji. Podejscie do ustawy zuzywa sie dopiero po rozstrzygnieciu sprawy, a nie w chwili zlozenia projektu.',
   'Sejm moze odrzucic weto prezydenta wiekszoscia trzech piatych. Palac przestal byc instancja, od ktorej nie ma odwolania.',
   'Kazde weto kosztuje prezydenta: kontrowersja w gore, wiarygodnosc w dol i relacje z premierem na minus. Przegrane weto zabiera mu takze slawe.',
   'Prezydent komputerowy czyta ustawy: patrzy na radykalnosc, na to czy projekt jest jego, i czy sam siedzi w rzadzie.',
   'Przed zlozeniem projektu widzisz ostrzezenie, ze jako nie-rzadowiec pracujesz na konto premiera. Przy glosowaniu widac autora od razu.',
   'Partia bez mandatow nie ma juz prawa inicjatywy ustawodawczej.',
   'Ustawa przepchnieta przez opozycje obniza sprawczosc rzadu - to dowod, ze gabinet stracil kontrole nad izba.',
 ]},

 '1.1.25':{data:'5 sierpnia 2026', zmiany:[
   'Cel Kazikmistrz ma własne logo, a po jego ukończeniu Kaziu wraca do swojego starego awatara — tego, po którym wszyscy go pamiętają.',
 ]},

 '1.1.24':{data:'5 sierpnia 2026', zmiany:[
   'Naprawiony błąd: ustawa z poprzedniej kadencji zostawała na biurku prezydenta i naliczała karę za zwłokę w sprawie, której nigdy nie widziałeś. Teraz projekt przepada wraz z końcem kadencji.',
   'Zmęczenie władzą psuje też relacje — im dłużej rządzisz, tym gorzej reszta sceny na ciebie patrzy.',
   'Składając rząd bez kogoś, kto ma mandaty, obrażasz go proporcjonalnie do jego siły. Wcześniej nikomu to nie przeszkadzało.',
   'Ludzie z zaplecza nie znikają już bez śladu do bezpartyjnych. Odejść mogą do konkurencji — i wtedy widać dokąd.',
   'Regeneracja lidera znów za darmo, ale najwyżej dwa razy w tygodniu.',
   'Filtry decyzji zgadzają się z tym, co decyzja naprawdę robi — zniknęła jedność tam, gdzie jej już nie ma.',
   'Wykres kondycji partii mniejszy, podpisy osi przestały na siebie zachodzić.',
 ]},

'1.1.23':{data:'5 sierpnia 2026', zmiany:[
   'Inflacja: im większy zapas kapitału trzymasz w kasie, tym drożej wychodzi każda decyzja. Przy grubym worku starczy na jedną akcję w tygodniu — kapitał ma pracować, nie leżeć.',
   'Jedności nie kupisz już żadną decyzją. Zostają debaty, a te niosą ze sobą kontrowersję.',
   'Nabór do partii raz na sześć tygodni zamiast co trzy.',
   'Regeneracja lidera kosztuje 70 kapitału — tydzień bez przewodniczącego to majątek.',
   'Premier nie przejdzie do kolejnego tygodnia z pustymi krzesłami w rządzie. Nieobsadzone resorty świecą na czerwono.',
   'Po głosowaniu nad ustawą widzisz pełny wynik: kto jak zagłosował i o ile brakowało.',
   'Ustawa wniesiona spoza rządu daje autorowi mniej, a premierowi i tak dopisuje zasługę — tak działa gabinet.',
   'Ustawy wreszcie coś zmieniają: media dają dokładniejsze sondaże, sądy i kodeks schładzają kontrowersję, zagadki dokładają energii, Mordepedia ułatwia nabór.',
   'Żadne wydarzenie nie wskoczy już w środek liczenia głosów ani dogrywki prezydenckiej.',
   'Tako jest teraz potrzebny także do Alternatywy i Partii Republikańskiej. DPD dochodzi do Republikańskiej dopiero przez Partię Centrum.',
 ]},
 '1.1.20':{data:'4 sierpnia 2026', zmiany:[
   'Launcher ma teraz zakładki: Gra, Mody i Kreator. Wszystko robisz w jednym oknie, bez wchodzenia do gry.',
   'Kreator scenariuszy wprost w launcherze: nazwa, autor, opis i dziesięć suwaków ustawiających stan serwera na starcie.',
   'Zapisany scenariusz od razu ląduje na liście modów i w grze.',
 ]},
 '1.1.19':{data:'4 sierpnia 2026', zmiany:[
   'Mody i scenariusze masz teraz w launcherze: osobny ekran z listą wgranych, wgrywaniem plikiem i usuwaniem.',
   'Launcher przyjmuje pojedyncze pliki modów i całe paczki zip naraz — wskazujesz plik i tyle.',
 ]},
 '1.1.18':{data:'4 sierpnia 2026', zmiany:[
   'Mody i własne scenariusze. W kreatorze ustawiasz, jak ma wyglądać serwer na starcie, i zapisujesz to jako plik — swój scenariusz pojawia się na liście obok wbudowanych.',
   'Plik moda możesz wysłać komuś innemu. Wrzuca go u siebie do katalogu modów i gra w dokładnie to samo.',
   'Mody nie zawierają kodu, tylko opis zmian — cudzy scenariusz nie może zrobić w grze niczego poza tym, co przewidziano.',
   'Launcher wygląda inaczej: godło, wyraźny stan gotowości i jeden duży przycisk, gdy nie ma czego pobierać.',
 ]},
 '1.1.16':{data:'4 sierpnia 2026', zmiany:[
   'Aktualizacja nie otwiera już dwóch okien gry naraz. Launcher odblokowywał przycisk pół sekundy przed startem gry i dało się kliknąć drugi raz.',
 ]},
 '1.1.15':{data:'4 sierpnia 2026', zmiany:[
   'Wywiad to teraz minigra: trzy pytania, a właściwa odpowiedź zależy od sytuacji twojej partii. Wygrana daje sławę i wiarygodność bez kontrowersji, przegrana — aferę.',
   'Zamiast wycieku screenów i szitpostu wchodzi Doniesienie do administracji: raz na kadencję, 10% szans na rozwiązanie cudzej partii, a przy porażce ogromna kontrowersja. Boty tego nie mają.',
   'Nowa akcja opozycji: Przekupstwo koalicjanta. Kupiony poseł głosuje przeciw rządowi przy najbliższej ustawie.',
   'Rząd ma teraz sprawczość — przegrane głosowania biją po premierze i po poparciu gabinetu.',
   'Prezydent musi zdecydować o ustawie w trzy tygodnie. Zwłoka kosztuje wiarygodność, sławę i jedność partii.',
   'Sejm nie zapętli się już na wyborze premiera: po ośmiu nieudanych rundach Król powołuje rząd z nadania.',
   'Nabór da się wykręcić na pełne 100 punktów, ale tylko idealnym ogłoszeniem.',
   'Memy wyraźnie tańsze, kanwasing i nabór droższe.',
   'Nowy cel DPD „Kazikmistrz”: Kaziu traci swoją fatalną cechę i dostaje „Stare dobre lata”.',
   'Nowy cel globalny „Świadek Koronny” — najtrudniejszy w grze i celowo bez wielkich premii.',
   'Zakładka Partie pokazuje wyłącznie zaplecza obcych partii. Mandaty w pasku to zdobyte, nie prognoza.',
   'Gustaw przechodzi z PPP do DPD. Cele Postępowców i LSD dostały ostrzejsze wymagania, a najsilniejsze nagrody zostały przycięte.',
 ]},
 '1.1.14':{data:'4 sierpnia 2026', zmiany:[
   'Zapisy ze starszych wersji wczytują się normalnie. Wcześniej rozgrywka sprzed aktualizacji potrafiła wywalić grę przy pierwszym kliknięciu.',
   'Zapis z „trzynastego tygodnia” sam się prostuje przy wczytaniu.',
 ]},
 '1.1.13':{data:'4 sierpnia 2026', zmiany:[
   'Obecność w kanałach da się wreszcie zbudować. Zanikała szybciej, niż można ją było odnawiać, więc siedziała na sztywnym suficie i nie dawało się z niej zrobić wyniku.',
   'Kapitał nie schodzi już poniżej zera przy paraliżu partii, a dopłaty koalicyjne płacisz tylko wtedy, gdy naprawdę cię na nie stać.',
   'Minister, który odszedł z partii albo dał się podkupić, nie siedzi już w radzie jako duch — resort wraca do obsadzenia.',
   'Sejm, w którym nikt nie ma mandatu, nie wywraca już wyboru premiera. Król rozwiązuje izbę i idziemy do przedterminowych wyborów.',
   'Sprzątanie po kodzie: martwy ekran przewodnictwa i nieużywane resztki poszły w kosz.',
 ]},
 '1.1.12':{data:'4 sierpnia 2026', zmiany:[
   'Kadencja ma dokładnie dwanaście tygodni. Koniec z „13 z 12” — po ostatnim tygodniu idziesz prosto do urn.',
   'Wejście w Układ sterów i wycofanie się nie zabiera już limitu na kadencję ani akcji. Limit zużywa się dopiero, gdy coś zatwierdzisz.',
   'Sejm rozpatruje jeden projekt ustawy tygodniowo. Zasada „raz na kadencję” dla każdej ustawy zostaje bez zmian.',
   'Brak rządu wreszcie boli i boli coraz bardziej z każdym tygodniem kryzysu — spada aktywność, jedność, wiarygodność i kasa, a po czterech tygodniach ludzie zaczynają odchodzić.',
   'Sondaże mocniej zależą od tego, co robisz. Nawet własny elektorat trzeba zmobilizować: martwa partia nie dowozi swoich do urn.',
   'Zmęczenie władzą uderza łagodniej po pierwszej kadencji i narasta dopiero przy kolejnych.',
   'Partie finansują kampanię z tego, co mają na koncie, a nie tylko z tygodniowego przychodu. Duże budżety dają malejące zwroty.',
   'Cele partyjne dają wyraźnie mniej jedności, a więcej wiarygodności i aktywności. Sama zgoda w partii przestaje wygrywać wybory.',
   'Zakładka Partie przebudowana: twoje zaplecze na wierzchu, reszta sceny jednym czytelnym spisem zamiast ściany pasków.',
   'Nabór: kawałki ogłoszenia wyśrodkowane, z licznikiem postępu i czytelniejszym układem.',
 ]},
 '1.1.11':{data:'4 sierpnia 2026', zmiany:[
   'Nowa zakładka „Partie”: cała scena na jednym ekranie — kto rządzi, ile ma, w jakim jest stanie i jak cię znosi.',
   'Serwer wreszcie naprawdę żyje. Ludzie dołączają po dobrej kadencji i odchodzą po awanturach — liczby się zmieniają, a nie tylko komunikaty.',
   'Koalicjanci liczą krzesła. Zgarnij całą radę ministrów dla siebie, a partie bez resortu ci to zapamiętają.',
   'Jedność waży mniej niż dotąd — o wyniku decyduje bardziej to, co partia realnie robi.',
   'Tako dołącza do serwera jako bezpartyjny intelektualista. Bez niego nie ma Partii Centrum.',
   'Mandaty dostały własną ikonę, logo Perspektywicznej wreszcie na środku.',
   'Koniec z ucinanymi napisami pod salą sejmową i w kondycji partii.',
   'Kronika wróciła pod Przewodnictwo, a ciasny panel nad nią zniknął.',
 ]},
 '1.1.10':{data:'4 sierpnia 2026', zmiany:[
   'Do gry wchodzi muzyka z serwera. „Nie pucuj mi petardy” wita cię przy starcie PPP.',
   '„Pax Mathiae” leci, kiedy wybory wygrywa partia Maćka.',
   '„Dyktator i Król” gra przy powrocie Partii Republikańskiej.',
   'Wszystko cicho i pod jednym przyciskiem — wyciszenie ucina też to, co akurat leci.',
 ]},
 '1.1.9':{data:'4 sierpnia 2026', zmiany:[
   'Naprawiony launcher: aktualizacja nie kończy się już komunikatem o uszkodzonych bibliotekach.',
   'Nowy cel dla DPD — „Ani w lewo, ani w prawo”: zbierasz Tortexa, Kaziu i balona i zakładasz Partię Centrum.',
   'Nowy cel dla Nowej Perspektywy — „Hegemon Perspektywiczny”: pięć kadencji, urząd, pięćdziesiąt osób i pełna kasa. Reszta sceny cię za to znienawidzi.',
   'Balon przechodzi do PLR, a Chrześcijańska Partia Cesarska znika ze sceny — jej poseł i mandat trafiają do Nowej Perspektywy.',
   'Przycisk „Menu” na pasku gry: wyjście do menu nie chowa się już w oknie zapisu.',
   'Wymagania celów mówią jednym głosem: wszędzie „w partii”, nigdzie „w zapleczu”.',
 ]},
 '1.1.8':{data:'4 sierpnia 2026', zmiany:[
   'Koniec z pustym sejmem. Sejm mógł podnieść próg wyborczy tak wysoko, że nie przeskakiwał go nikt — teraz próg ustępuje, a mandaty zawsze mają właściciela.',
   'Koalicje wreszcie się opłacają: mandaty należą się liście i dzielą między wszystkie partie, także te bez własnych pięciu procent.',
   'Mała partia nie pokazuje już w sondażu zera, mając realne poparcie — błąd pomiaru skaluje się z wielkością.',
   'Doświadczenie zbiera osoba, nie partia. Zmiana przewodniczącego nie przenosi już cudzego dorobku.',
   'Odwołanie ministra to decyzja premiera, bez głosowania. Doszła osobna „Zmiana ministra”, a świeżo powołanego nie ruszysz przez trzy tygodnie.',
   'Przekupienie działacza: wybierasz konkretną osobę i płacisz jej cenę, zamiast rzucać monetą. Przewodniczących kupić się nie da.',
   'Vengeance rośnie wolniej i zatrzymuje się na 82 autorytetu — i nie zabiera już bonusu do nowej gry.',
   'Nowy skrót o partii i kronika na samej górze — bez przewijania pół strony.',
 ]},
 '1.1.7':{data:'4 sierpnia 2026', zmiany:[
   'Launcher zakłada grze własny folder zamiast wysypywać pliki tam, gdzie sam leży.',
   'Gra i jej biblioteki schodzą zawsze razem — koniec z błędem o brakującym python314.dll.',
   'Gra nie rozpakowuje się już przy każdym starcie: wstaje szybciej i rzadziej wkurza antywirusy.',
 ]},
 '1.1.6':{data:'4 sierpnia 2026', zmiany:[
   'Zapisy w sześciu miejscach: widzisz partię, kadencję, mandaty i datę każdej rozgrywki. Skrót Ctrl+Z.',
   'Autozapis chodzi osobno i nie zajmuje żadnego z tych miejsc.',
   'Launcher pobiera pliki ośmioma połączeniami naraz — aktualizacja schodzi w sekundy zamiast w minutę.',
   'Nowy wygląd launchera: własny pasek postępu i widać, który plik akurat leci.',
 ]},
 '1.1.4':{data:'3 sierpnia 2026', zmiany:[
   'Nabór to teraz układanka: składasz ogłoszenie z trzech kawałków, a liczy się dopasowanie do ludzi z kanału. Koniec z pisaniem w puste pole.',
   'Ustawy nie przechodzą już same z siebie — opozycja przestała firmować sukcesy rządu.',
   'Nowy widok głosowania: pasek za i przeciw, kreska progu, kto jak zagłosował.',
   'Po głosowaniu widać wprost, czy prezydent podpisał, czy zawetował.',
   'Sejm i władza rozłożone na kolumny, sala sejmowa mniejsza i czytelniejsza.',
   'Premier może znowu tworzyć i likwidować kanały — decyzja wróciła do gry.',
 ]},
 '1.1.3':{data:'3 sierpnia 2026', zmiany:[
   'Po każdej aktualizacji zobaczysz to okno — raz na wersję, nie za każdym odpaleniem.',
   'Do listy zmian wrócisz w każdej chwili: „co nowego” pod nazwiskami na ekranie startowym.',
 ]},
 '1.1.2':{data:'3 sierpnia 2026', zmiany:[
   'Trudniej: obecność w kanałach szybciej się osypuje, a powtarzanie tej samej decyzji przestaje działać.',
   'Nikt nie betonuje się na szczycie — im dłużej rządzisz, tym bardziej serwer ma cię dość.',
   'Po wyborach dostajesz rozliczenie kadencji: co dokładnie zabrało ci mandaty.',
   'Partie komputerowe składają wotum nieufności, podbierają ludzi i obsadzają ministerstwa.',
   'Ustawy resortowe: podatki, Mordepedia, sądy administracyjne i MAN.',
   'Cel Republikanów to zjednoczenie chętnych, a nie połknięcie czterech partii naraz.',
 ]},
};
function patchDoPokazania(){
  const wpis=PATCHNOTE[WERSJA];
  if(!wpis)return null;
  try{if(localStorage.getItem('mm_patchnote')===WERSJA)return null}catch(e){}
  return wpis;
}
function patchZamknij(){
  try{localStorage.setItem('mm_patchnote',WERSJA)}catch(e){}
  close();render();
}
function pokazPatch(){
  const wpis=PATCHNOTE[WERSJA];if(!wpis)return;
  close();
  const v=document.createElement('div');v.className='veil';v.id='veil';
  v.innerHTML=`<div class="mdl patchmdl"><button class="mdlx" type="button" aria-label="Zamknij">×</button>
    <div class="h"><div class="k">Wersja ${WERSJA} · ${wpis.data}</div><h2>Co nowego</h2></div>
    <div class="bd"><ul class="patchlist">${wpis.zmiany.map(z=>`<li>${z}</li>`).join('')}</ul></div>
    <div class="op"><button class="opt" id="pok"><b>Gram</b><span>Pokażę to znowu dopiero przy kolejnej wersji</span></button></div></div>`;
  document.body.appendChild(v);
  v.querySelector('#pok').onclick=patchZamknij;
  v.querySelector('.mdlx').onclick=patchZamknij;
}
function creditsBox(){
  return `<div class="credits">
    <div class="cline"></div>
    <div class="ctxt"><span class="ck">Mordy Mordeczki · Sejm</span>
      <div class="crole"><span>twórcy</span><b>${AUTORZY.join(' i ')}</b></div>
      <div class="ctesters">${TESTERZY.map(n=>`<div class="cperson"><b>${n}</b><span>tester</span></div>`).join('')}</div>
      <span class="cv">wersja ${WERSJA}${PATCHNOTE[WERSJA]?` · <button class="conowego" onclick="pokazPatch()">co nowego</button>`:''}</span></div>
  </div>`;
}
const TUT=[
 {t:'Prowadzisz Stronnictwo Reisei',
  d:'Dwie osoby, jeden mandat, ogromny sufit potencjału. U góry masz akcje na ten tydzień, kapitał, energię, sondaż i datę. '
   +'Kadencja to dwanaście tygodni, potem wybory. Panel z prawej mówi, co robić dalej, i odblokowuje się dopiero, gdy to zrobisz.',
  ok:()=>true},
 {t:'Zadanie: otwórz Mapę okręgów',tab:'mapa',
  d:'Sześciokąty to kanały serwera, w każdym rozdaje się mandaty. Obecność w kanale mnoży twój wynik od ×0,34 do ×2,7, '
   +'mocniej niż cokolwiek innego w grze. Wejdź w zakładkę i kliknij dowolny kanał.',
  ok:()=>!!G.tutSeen.mapa},
 {t:'Zadanie: zrób kanwasing',tab:'akcje',
  d:'Zakładka Decyzje, kategoria Kampania, decyzja <b>Kanwasing</b> w kanale <b>#ogólny</b>. Najtańszy sposób na obecność. '
   +'Z każdej kategorii możesz w tygodniu wykonać tylko jedną decyzję, więc plan na tydzień układa się sam.',
  ok:()=>(G.used.kanwas||0)>0},
 {t:'Zadanie: zakończ tydzień',
  d:'Kliknij <b>Kolejny tydzień</b> u góry. Data przeskoczy o siedem dni, wrócą akcje i energia, a serwer w tym czasie też coś zrobi. '
   +'Zdarzenia losowe rozwiążesz w oknie, które się pojawi.',
  ok:()=>G.week>=2},
 {t:'Zadanie: wiec, czyli kombinacja',tab:'akcje',
  d:'Zrób <b>Wiec w kanale</b> w tym samym <b>#ogólnym</b>. Kanwasing przed wiecem to kombinacja <b>×1,55</b>: '
   +'ludzie już wiedzieli, po co przychodzą. Kolejność decyzji działa też między tygodniami, kafelki pokazują mnożnik.',
  ok:()=>(G.used.wiec||0)>0},
 {t:'Zadanie: zajrzyj do Sondażu',tab:'sondaz',
  d:'Zobacz, jak stoisz na tle reszty. To badanie, nie wynik: pojedynczy odczyt bywa przestrzelony nawet o sześć punktów. '
   +'Mandaty obok liczone są z prawdziwego poparcia, którego nie widzisz.',
  ok:()=>!!G.tutSeen.sondaz},
 {t:'Skąd się bierze kapitał',
  d:'Składki płacą twoi ludzie i to bardzo nierówno: elita 2,6, intelektualista 0,95, serwerowicz 0,18. Jedna elita to '
   +'finansowo czternastu serwerowiczów. Do tego dochodzą urzędy: bycie w rządzie, fotel premiera, pałac prezydencki i resorty. '
   +'Uwaga na drugą stronę: nadwyżka ponad sześciokrotność tygodniowego dochodu topnieje o 24% i podbija kontrowersję. '
   +'Kapitał ma wychodzić w tym samym tygodniu, w którym wpłynął.',
  ok:()=>true},
 {t:'Zadanie: podpisz transfer',tab:'akcje',
  d:'Na dole zakładki Decyzje jest panel <b>Transfery bezpartyjnych</b>: ludzie spoza partii, których bierze się czystym kapitałem, '
   +'bez akcji. Elity kosztują najwięcej i najwięcej dają. Podpisz kogokolwiek, kogo cię stać. Jeden transfer na tydzień, boty polują na tych samych.',
  ok:()=>Object.keys(G.agents).some(n=>G.agents[n]===G.me)},
 {t:'Energia i zmęczenie',
  d:'Każda decyzja kosztuje energię, a ta wraca co tydzień, tym szybciej im wyższa wytrzymałość przewodniczącego i jedność partii. '
   +'Powtarzanie tej samej decyzji ją osłabia (kafelek pokazuje „zmęcz. ×”), więc opłaca się mieszać. '
   +'Koszt kapitału rośnie z wielkością partii: kanapowa płaci ułamek, moloch dwa i pół raza więcej.',
  ok:()=>true},
 {t:'Zadanie: sprawdź przychylność Króla',tab:'krol',
  d:'Król decyduje, kto dostanie desygnację na premiera. Liczą się przede wszystkim mandaty i wielkość partii, potem wiarygodność, '
   +'aktywność, stosunki z dworem i danina. Kontrowersja przeszkadza, ale nie przekreśla. Zajrzyj, jak stoisz.',
  ok:()=>!!G.tutSeen.krol},
 {t:'Zadanie: obejrzyj Sejm i władzę',tab:'sejm',
  d:'Tu widzisz premiera, prezydenta, gabinet, listy wyborcze i opozycję. Jeśli jesteś poza rządem, stąd zawiązujesz i nazywasz '
   +'blok opozycyjny. Zajrzyj, kto dziś rządzi serwerem.',
  ok:()=>!!G.tutSeen.sejm},
 {t:'Zadanie: wybierz sobie cel',tab:'cele',
  d:'Cel partyjny to jednorazowa przemiana: zmienia nazwę, logo i zasady, którymi gra twoja partia. '
   +'<b>Kanał w końcu żyje</b> i <b>Ręka Mordeczki</b> są dostępne dla każdego, reszta zależy od partii. Zobacz, czego wymagają.',
  ok:()=>!!G.tutSeen.cele},
 {t:'Ludzie, dyplomacja i kontrowersja',
  d:'Ludzi zdobywasz naborem, transferami, werbunkiem imiennym z cudzych partii i na koniec kadencji, jeśli sława i wiarygodność '
   +'są wyższe od progu zależnego od wielkości partii. Relacje z innymi decydują o koalicjach i o tym, kto da ci kogoś podebrać. '
   +'A kontrowersji pilnuj: przy 96 partia wpada w paraliż, sondaż słabnie i ludzie wychodzą.',
  ok:()=>true},
 {t:'Dograj kadencję do wyborów',
  d:'Reszta należy do ciebie. Buduj obecność, zbieraj ludzi, wydawaj kapitał. Przed wyborami zdecydujesz, czy startujesz sam przy progu 5%, '
   +'czy z kimś na wspólnej liście, gdzie próg rośnie do 8% we dwójkę i 13% w trójkę.',
  ok:()=>G.term>=2||G.phase==='elect'},
];
function startTutorial(){
  newGame('SS');
  G.tut={i:0};G.tutSeen={};
  say('<b>Samouczek.</b> Prowadzę cię przez pierwszą kadencję. Panel z prawej mówi, co robić dalej.','roy');
  render();
}
function tutStep(){return G.tut?TUT[G.tut.i]:null}
function tutNext(){
  if(!G.tut)return;
  const st=tutStep();
  if(!st||!st.ok())return;
  G.tut.i++;
  if(G.tut.i>=TUT.length){
    G.tut=null;
    say('<b>Samouczek skończony.</b> Od tej pory grasz normalnie, ta partia zostaje twoja.','good');
  }
  render();
}
function tutSkip(){
  if(!G.tut)return;
  G.tut=null;say('Samouczek pominięty. Grasz dalej normalnie.','');render();
}
function tutBox(){
  const st=tutStep();if(!st)return '';
  const gotowe=st.ok();
  return `<div class="tut">
    <div class="th"><span>Samouczek · krok ${G.tut.i+1} z ${TUT.length}</span>
      <button onclick="tutSkip()" title="Pomiń samouczek">✕</button></div>
    <div class="tdots">${TUT.map((_,i)=>`<i class="${i<G.tut.i?'done':i===G.tut.i?'on':''}"></i>`).join('')}</div>
    <h4>${st.t}</h4>
    <p>${st.d}</p>
    ${st.tab&&!gotowe?`<div class="thint">Zakładka <b>${(({mapa:'Mapa okręgów',akcje:'Decyzje',sondaz:'Sondaż',cele:'Cele partyjne',lider:'Lider',krol:'Król',sejm:'Sejm i władza'})[st.tab])}</b>, na górze ekranu</div>`:''}
    <button class="btn ${gotowe?'':'g'}" ${gotowe?'':'disabled'} onclick="tutNext()">
      ${gotowe?(G.tut.i===TUT.length-1?'Kończę samouczek':'Dalej →'):'Zrób to, co powyżej'}</button>
  </div>`;
}

function setup(){
  app.innerHTML=`
  <div class="intro">
    <div class="kick">Mordy Mordeczki · roleplay polityczny</div>
    <h1>Sejm<svg class="seal" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="var(--acc2)" stroke-width="1.1">
        <circle cx="50" cy="50" r="43"/><circle cx="50" cy="50" r="36"/>
        <path d="M50 14 L54 24 L50 22 L46 24 Z" fill="var(--acc2)" stroke="none"/>
        <g opacity=".85">
          <path d="M28 62 Q50 78 72 62" />
          <path d="M30 58 Q50 72 70 58" />
        </g>
      </g></svg></h1>
    <p>670 osób, 40 mandatów w dziewięciu kanałach, wybory co dwanaście tygodni. Po wyborach sejm głosuje nad
       premierem, a jeśli nie przejdzie, kandydata wskazuje Król Mordeczka. Co drugą kadencję serwer wybiera prezydenta.</p>
    <div class="facts">
      <div class="fact"><b>670</b><span>osób na serwerze</span></div>
      <div class="fact"><b>${DIST_SEATS}+${TOPUP}</b><span>mandatów: okręgi + lista</span></div>
      <div class="fact"><b>5/8/13%</b><span>progi wyborcze</span></div>
      <div class="fact"><b>${MAJ}</b><span>mandatów na większość</span></div>
      <div class="fact"><b>∞</b><span>kadencji</span></div>
    </div>
    <div class="ekstopka">
      <span class="ekleg">wczytywanie zapisów jest w menu głównym</span>
      <button class="btn g sm" onclick="backToMode()">← Wstecz</button>
    </div>
  </div>
  <!-- Układ z ekranu startu Victorii: lista po lewej, panel wybranego po prawej.
       Ich wiersze mają 560x105, panel boczny 420, odstęp 5 — te proporcje
       przenosimy tutaj, samą grafikę rysujemy po swojemu. -->
  <div class="pick v3 partyselect fifa">
    <button class="partyarrow left" aria-label="Poprzednia partia" onclick="pickPartyKrok(-1)">‹</button>
    <div class="pickmain fifaparty" id="pmain"></div>
    <button class="partyarrow right" aria-label="Następna partia" onclick="pickPartyKrok(1)">›</button>
    <div class="partyroster">
      <div class="partyrosterhead">${PID.length} ugrupowań <span>wybierz szyld — pełny profil jest po lewej</span></div>
      <div class="picklist">
        ${PID.map(k=>{const st=setupScenMandaty(k),d=BASE[k].diff||3;
          return `<button class="pickcell ${k===SEL?'on':''}" onclick="pickParty('${k}')" style="--pc:${BASE[k].c}">
          <i class="pcbar"></i>
          <div class="pcimg">${crest(k,'l')}</div>
          <span>${BASE[k].ab}</span>
          <span class="pcname">${BASE[k].n}</span>
          <div class="pcrow"><span class="pcseat">${st} ${pl(st,'mandat','mandaty','mandatów')}</span>
            <span class="pcdiff" title="trudność ${d} z 5">${'★'.repeat(d)}${'☆'.repeat(5-d)}</span></div>
        </button>`}).join('')}
        <button class="pickcell" onclick="openCreator()" style="border-style:dashed;--pc:var(--acc)">
          <div class="pcimg"><span style="width:56px;height:56px;display:grid;place-items:center;font-size:28px;color:var(--acc);
            border:1px dashed var(--line2);border-radius:10px;position:relative">+</span></div><span>NOWA</span>
          <span class="pcname">Zakładasz własną partię od zera</span>
          <div class="pcrow"><span class="pcseat">kreator</span><span class="pcdiff">☆☆☆☆☆</span></div></button>
      </div>
    </div>
    <div class="partycarouselmeta"><span>← / → zmienia partię</span><b>${PID.length} grywalnych ugrupowań</b><span>wybierz i prowadź</span></div>
    <button class="partycreatorlink" onclick="openCreator()">＋ Załóż własną partię</button>
  </div>`;
  pickMain();
}
function start(k){
  newGame(k);
  if(SCENSEL&&SCEN[SCENSEL]){G.scen=SCENSEL;try{SCEN[SCENSEL].apply()}catch(e){}}
  histPush();SFX.enter();render();
  if(k==='PPP')graj('petarda');   // hymn Partii Pana Prezesa na powitanie
}
function tryLoadFromSetup(){
  const el=document.getElementById('loadCodeInp');
  const err=document.getElementById('loadErr');
  const code=el?el.value:'';
  try{loadCode(code);if(err)err.textContent='';render()}
  catch(e){if(err)err.textContent='Nie udało się wczytać: '+e.message}
}

function game(){
  applyGoals();
  const p=me(),q=tally(),AL=allocate(q.res,q.total);
  /* Barwa partii jest własnością całej rozgrywki, nie tylko herbu w HUD-zie.
     CSS bierze ją stąd do aktywnej zakładki, nagłówków i kart decyzji. */
  document.documentElement.style.setProperty('--party-theme',p.c);
  const sh=q.res[G.me].tot/q.total*100;
  G.lastPoll=sh;
  const role=isPM()?'PREMIER':inGov()?'KOALICJA':'OPOZYCJA';
  app.innerHTML=`
  <div class="hud" style="--partia:${p.c}">
    <div class="id">${crest(G.me,'m')}<div style="min-width:0"><h2><span class="pelna">${p.n}</span><span class="skrot">${p.ab}</span></h2>
      <div class="sub">${p.lead} · <span class="rola ${role.toLowerCase()}">${role}</span>${hasPrez()?' · <span class="rola prezydent">PREZYDENT</span>':''}</div></div></div>
    <!-- Górny poziom paska: co PRZYBĘDZIE w tym tygodniu, na zielono.
         Dolny: stan na teraz. Dokładnie ten układ, co w pasku Victorii —
         najpierw przyrosty, pod nimi zasoby, wszystko w jednym pancerzu. -->
    <div class="hudcenter">
    <div class="rgroup zasoby">
    ${(()=>{const skl=[];
      if(isPM())skl.push('premier +1');if(hasPrez())skl.push('prezydent +1');
      if(hasAds(G.me))skl.push('Państwo Partyjne +2');if(hasHeg(G.me))skl.push('Hegemon +1');
      if(hasHor(G.me))skl.push('Horda −1');
      return `<div class="rs tip">${ikona('akcje')}<div class="rv"><b>${G.ap}<span class="of">/${G.apMax}</span></b><span>akcje</span></div>
      <div class="tipbox">
        <div class="tiptyt">Czym są akcje?</div>
        <div class="tiprada" style="margin:0 0 8px">Akcja to jeden ruch partii. Większość decyzji zużywa jedną, mocniejsze dwie albo trzy. Niewydane akcje przepadają po przejściu tygodnia.</div>
        <div class="l"><span>Podstawa</span><b>3</b></div>
        ${skl.map(x=>`<div class="l"><span>${x}</span></div>`).join('')}
        <div class="tot"><span>Dostępne teraz</span><b class="m">${G.ap} z ${G.apMax}</b></div>
        <div class="tiprada">Pula odnawia się przy kolejnym tygodniu. Więcej akcji dają najważniejsze urzędy i wybrane przemiany partii. Koszt konkretnej decyzji pokazują kropki na jej karcie.</div>
      </div></div>`})()}
    ${(()=>{const i=income();return `<div class="rs tip">${ikona('kapital')}<div class="rv"><b class="${G.kp<0?'ujem':''}">${Math.round(G.kp)}<span class="plus">+${i.total}</span></b><span>kapitał</span></div>
      <div class="tipbox">
        <div class="tiptyt">Czym jest kapitał?</div>
        <div class="tiprada" style="margin:0 0 8px">Kapitał to kasa całej partii, nie prywatny majątek lidera. Płacisz nim za decyzje, kampanię, media i polityczne układy.</div>
        ${SEG.map(s=>{const per={eli:2.6,int:.95,ser:.18}[s.id];
          return `<div class="l"><span><i style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${s.c};margin-right:6px"></i>${s.n} ${p.comp[s.id]}×${per.toFixed(2)}</span><b>${(p.comp[s.id]*per).toFixed(1)}</b></div>`}).join('')}
        <div class="l" style="border-top:1px solid var(--line);padding-top:6px;margin-top:6px">
          <span>Ściągalność (aktywność ${Math.round(p.act)})</span>
          <b style="color:${i.akt>1?'var(--pos)':i.akt<.7?'var(--neg)':'var(--acc)'}">×${i.akt.toFixed(2)}</b></div>
        ${i.urz?`<div class="l"><span>Dodatki z urzędów</span><b style="color:var(--acc)">+${i.urz.toFixed(1)}</b></div>`:''}
        <div class="tot"><span>Razem</span><b class="m" style="color:var(--acc)">+${i.total}</b></div>
        ${inflacjaProc()>0?`<div class="l" style="border-top:1px solid var(--line);padding-top:6px;margin-top:6px">
          <span style="color:var(--neg)">Inflacja (kapitał ponad ${INFLACJA_PROG})</span>
          <b style="color:var(--neg)">decyzje +${inflacjaProc()}%</b></div>
          <div style="color:var(--dim2);font-size:11.5px;margin-top:6px">Im większy zapas leży w kasie,
          tym drożej wychodzi każda decyzja. Wydawaj, zamiast zbierać.</div>`:''}
        <div class="tiprada">Kapitał zwiększasz przez liczniejszy skład, większy udział elity, aktywność, urzędy i wydawnictwa. Elita płaci wielokrotnie więcej od serwerowicza, ale przy martwej partii nie płaci nikt.</div>
      </div></div>`})()}
    ${(()=>{const eg=enGain(),ld=lead(G.me);return `<div class="rs tip">${ikona('energia')}
      <div class="rv"><b class="${G.en<25?'ujem':''}">${Math.round(G.en)}<span class="plus" style="color:${eg<8?'var(--neg)':eg<18?'var(--acc)':'var(--pos)'};-webkit-text-fill-color:${eg<8?'var(--neg)':eg<18?'var(--acc)':'var(--pos)'}">+${eg}</span></b><span>energia</span></div>
      <div class="tipbox">
        <div class="tiptyt">Czym jest energia?</div>
        <div class="tiprada" style="margin:0 0 8px">Energia opisuje siły przewodniczącego. Kosztują ją decyzje wymagające osobistego zaangażowania, a co tydzień wraca zależnie od lidera i kondycji partii.</div>
        <div class="l"><span>Podstawa</span><b>${BAL.energiaBaza.toFixed(1)}</b></div>
        <div class="l"><span>Wytrzymałość ${p.lead} (${ld.wytrz})</span><b>+${(ld.wytrz/3.1).toFixed(1)}</b></div>
        <div class="l"><span>Jedność ${Math.round(p.uni)} <span style="color:var(--dim2)">(punkt odniesienia 42)</span></span>
          <b style="color:${p.uni>=42?'var(--pos)':'var(--neg)'}">${p.uni>=42?'+':''}${((p.uni-42)/4.4).toFixed(1)}</b></div>
        ${G.law&&G.law.zagadki?'<div class="l"><span>Cotygodniowe zagadki</span><b style="color:var(--pos)">+4,0</b></div>':''}
        <div class="tot"><span>Razem</span><b class="m" style="color:${eg<8?'var(--neg)':'var(--acc)'}">+${eg}</b></div>
        <div class="tiprada">Energię zwiększasz przede wszystkim wytrzymałością przewodniczącego i jednością. Przy bardzo niskiej jedności lider praktycznie nie regeneruje sił.</div>
      </div></div>`})()}
    </div>
    <div class="rgroup polityka">
    <div class="rs tip">${ikona('sondaz')}<div class="rv"><b>${fmt(shown(G.me,sh))}%<span class="plus" style="color:var(--info);-webkit-text-fill-color:var(--info)">?</span></b><span>sondaż</span></div>
      <div class="tipbox" style="width:330px">
        <div class="tiptyt">Czym jest sondaż?</div>
        <div class="tiprada" style="margin:0 0 8px">Sondaż to niedokładny, cotygodniowy pomiar poparcia. Nie daje mandatów i nie jest wynikiem wyborów; pokazuje tylko, jak partia stoi w tej chwili.</div>
        <div class="tiptyt" style="margin-top:7px">Co realnie rusza sondażem</div>
        <div class="l"><span><b>Liczba i skład partii</b>, decyduje najmocniej</span></div>
        <div style="font-size:11.5px;color:var(--dim2);margin:-2px 0 7px">Dwie trzecie wyniku to twoi ludzie. Elita waży 1,75 głosu, intelektualista 1,10, serwerowicz 0,66.</div>
        <div class="l"><span><b>Obecność w okręgach</b></span><b>×0,45–2,1</b></div>
        <div style="font-size:11.5px;color:var(--dim2);margin:-2px 0 7px">Wiec, kanwasing, memy, zjazd i spot. Spada 12% tygodniowo, więc trzeba podtrzymywać.</div>
        <div class="l"><span><b>Jedność i aktywność</b></span><b>×0,46–1,3</b></div>
        <div style="font-size:11.5px;color:var(--dim2);margin:-2px 0 7px">Ważą dziś więcej niż sama sława. Szkolenie kadr, statut, zjazd.</div>
        <div class="l"><span><b>Urzędy</b></span><b>premier +26%, pałac +13%</b></div>
        <div class="l"><span><b>Momentum</b></span><b>±30%</b></div>
        <div style="font-size:11.5px;color:var(--dim2);margin:-2px 0 7px">Rośnie od wygranych debat, udanych afer i owacyjnych wieców; wygasa o 17% tygodniowo.</div>
        <div class="tiprada">
          Sam sondaż to <b style="color:var(--tx)">badanie</b>, nie wynik, pojedynczy odczyt bywa przestrzelony nawet o siedem punktów.
          Prawdziwe poparcie widać dopiero przy urnach.</div>
      </div></div>
    <!-- mandaty zdobyte w ostatnich wyborach, nie prognoza z bieżącego przeliczenia:
         liczba ma się zgadzać z tym, co pokazuje sejm, i zmieniać dopiero po urnach -->
    <div class="rs tip"><i class="ic ic-mandat" aria-hidden="true"></i><div class="rv"><b>${p.seats}</b><span>mandaty</span></div>
      <div class="tipbox"><div class="tiptyt">Czym są mandaty?</div>
        <div class="tiprada" style="margin:0">Mandaty to miejsca partii w sejmie zdobyte w ostatnich wyborach. Decydują o większości, premierze i ustawach; nie zmienią się aż do następnych wyborów.</div>
      </div></div>
    </div>
    ${streakBox()}
    </div>
    <div class="hudend">
      <button class="sndbtn" onclick="toggleMute()" title="${G.mute?'Włącz dźwięk':'Wycisz'}">${G.mute?'♪̸':'♪'}</button>
      <div class="datechip" key="${G.term}-${G.week}"><b>${dateStr(gameDate())}</b><span>K${G.term} · tydzień ${G.week} z ${G.weeks} · dzień ${G.dzienTygodnia||1}/7 · godz. ${String(G.godzina??8).padStart(2,'0')}:00</span></div>
      <button class="btn g sm" onclick="openSave()" title="Zapis i wczytanie">Zapis</button>
      <!-- wyjście do menu siedziało wcześniej dopiero w oknie zapisu i nikt go tam nie szukał -->
      <button class="btn g sm" onclick="doLobby()" title="Wyjście do menu głównego">Menu</button>
      ${G.phase==='finalcamp'
        ? `<button class="btn tura" onclick="closeFinalCamp()">Otwieram urny →</button>`
        : `<button class="btn tura" onclick="endWeek()">${G.week>=G.weeks?'Do wyborów →':'Kolejny tydzień →'}</button>`}
    </div>
  </div>
  ${G.phase==='finalcamp'?campBar():''}
  ${sitBanner()}
  ${eraBanner()}
  ${G.tut?tutBox():''}
  ${G.prez2?`<div class="runoff">
    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
      <span class="pill roy">druga tura za ${Math.max(0,G.prez2.week-G.week)} ${pl(Math.max(0,G.prez2.week-G.week),'tydzień','tygodnie','tygodni')}</span>
      ${G.prez2.r1.slice(0,2).map(x=>`<span class="nm">${ava(x.who,G.p[x.k].c,26)}<b>${x.who}</b>
        <span class="dim">${G.p[x.k].ab} ${fmt(x.pct)}%</span></span>`).join('<span class="dim">kontra</span>')}
      ${[G.prez2.r1[0].k,G.prez2.r1[1].k].includes(G.me)
        ? `<button class="btn sm" style="margin-left:auto" onclick="openPush()">Dorzuć do kampanii${G.prez2.spent?` (wydano ${G.prez2.spent})`:''}</button>`
        : '<span class="dim" style="margin-left:auto;font-size:12.5px">Nie ma cię w dogrywce.</span>'}
    </div></div>`:''}
  ${lukKadencji()}
  ${waznePasek()}
  <div class="nav">
    ${(()=>{const wazne=new Set(waznePozycje().map(x=>x.t));
      const nazwa=(k,n)=>n+(wazne.has(k)?'<span class="badge">!</span>':'');
      const nv=[['mapa',nazwa('mapa','Mapa okręgów')],['akcje',nazwa('akcje','Decyzje')+(G.ap?`<span class="badge">${G.ap}</span>`:'')],
       ['lider','Lider'+(leads(G.p[G.me]).some(n=>xpOs(n)>=35)?'<span class="badge">!</span>':'')],['krol','Król'+(kingFav(G.me)<0?'<span class="badge">!</span>':'')],['partie','Partie'],['sondaz','Sondaż']];
      const mg=myGoals();
      if(mg.length)nv.push(['cele',nazwa('cele',mg.length>1?'Cele partyjne':'Cel partyjny')]);
      // urzędy mają własne działy zamiast kategorii schowanych w decyzjach
      if(isPM())nv.push(['premier',nazwa('premier','Premier')]);
      if(hasPrez())nv.push(['prezydent',nazwa('prezydent','Prezydent')]);
      nv.push(['sejm','Sejm i władza']);
      nv.push(['ekonomia','Ekonomia']);
      // Media i Sąd są osobnymi systemami. Bez odpowiedniej ustawy widać je jako
      // zamknięte, żeby gracz od razu wiedział, co może odblokować w Sejmie.
      nv.push(['media','Media'+(mediaJest()?'':'<span class="badge wip">zamk.</span>')]);
      nv.push(['sad','Sąd'+(lawDone('sady')?'':'<span class="badge wip">zamk.</span>')]);
      nv.push(['mordepedia','<span title="Mordepedia">Pedia</span>'+(lawDone('mordepedia')?'':'<span class="badge wip">zamk.</span>')]);
      return nv.map(([k,n])=>`<button class="${G.tab===k?'on':''}" onclick="setTab('${k}')">${n}</button>`).join('')})()}
  </div>
  <div class="layout">
    <div class="sidebar" style="display:flex;flex-direction:column;gap:14px">${sidebar(p,q)}</div>
    <div class="widok${G._we?' wejscie':''}" data-tab="${G.tab}">${G.tab==='mapa'?kurier()+mapTab(q,AL):G.tab==='akcje'?actTab():G.tab==='partie'?partieTab():G.tab==='sondaz'?pollTab(q,AL)
      :G.tab==='cele'?goalTab():G.tab==='lider'?leadTab():G.tab==='krol'?kingTab()
      :G.tab==='premier'?premierTab():G.tab==='prezydent'?prezydentTab()
      :G.tab==='ekonomia'?ekonomiaTab()
      :G.tab==='media'?mediaTab():G.tab==='sad'?sadTab():G.tab==='mordepedia'?mordepediaTab():sejmTab()}</div>
  </div>`;
  G._we=0;
}
/* ---- zakładka „Partie” ----
   Jedno pytanie i jedna odpowiedź: kto siedzi w cudzych partiach. Własnej tu nie ma,
   bo jej skład widać w bocznej kolumnie, a wszystkie liczby o obcych — poparcie,
   mandaty, kondycję — pokazuje sondaż i sala sejmowa. Ta zakładka jest od nazwisk. */
function partieTab(){
  const obce=alive().filter(k=>k!==G.me)
    .sort((a,b)=>roster(G.p[b]).length-roster(G.p[a]).length);
  return `<div class="card"><div class="h"><h3>Zaplecza partii</h3>
    <span class="n">${obce.length} ${pl(obce.length,'partia','partie','partii')}</span></div>
    <div class="b">
    <div class="note" style="margin:0 0 14px">Kto realnie siedzi w cudzych partiach. Stąd bierzesz
    ludzi przy przekupywaniu działaczy i tu widać, kogo można komu podebrać.</div>
    ${obce.map(k=>{
      const p=G.p[k], sklad=roster(p);
      return `<div class="pzap">
        <div class="pzh">${crest(k,'s')}
          <div style="min-width:0"><b>${p.ab}</b>
            <span class="dim">${p.n}</span></div>
          <span class="pill">${sklad.length} ${pl(sklad.length,'osoba','osoby','osób')}</span>
        </div>
        <div class="benchgrid">
          ${sklad.map(n=>`<div class="bperson ${isLead(p,n)?'lead':''}" title="${esc(n)}${isLead(p,n)?' — przewodnictwo':''} — kapitał prywatny ${kasa(kapPryw(n))}${ranga(n)?' · '+ranga(n).n:''}">
            ${ava(n,p.c,34)}<span>${n}</span>
            <em class="kappryw">${mordedolar(11)} ${kasaSkrot(kapPryw(n))}</em>
            ${rangaOdznaka(n)}</div>`).join('')
            ||'<span class="dim">Nikogo poza przewodniczącym.</span>'}
        </div>
      </div>`}).join('')}
    </div></div>`;
}
