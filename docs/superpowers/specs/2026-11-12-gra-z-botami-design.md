# Trener skata — gra z botami (trening)

Data: 2026-11-12. Rozszerzenie wersji 1 kursu (spec główny: `2026-11-12-skat-trainer-design.md`, sekcja 7 — „tryb pełnej gry z botami”).

## 1. Cel

Swobodna gra pełnych rozdań przeciwko dwóm botom, jako trening uzupełniający kurs:
- **jak przy prawdziwym stole:** licytacja, skat, zgłoszenie, kontra/re, 10 lew i rozliczenie;
- **z pomocami treningowymi:** podpowiedź, licznik na żywo, cofanie ruchu i przegląd po rozdaniu;
- **z wynikami:** seria rozdań z tabelą punktów turniejowych.

Wymagania stałe (jak w kursie):
- tylko po polsku;
- talia i język (oficjalny/potoczny) z ustawień;
- działa bez logowania, a stan jest zapisany w przeglądarce;
- projektowana na telefon (375 px).

## 2. Zakres

**W wersji pierwszej:**
- **Pełne rozdanie:**
  - losowe rozdanie i licytacja (ty i dwa boty);
  - podniesienie skata i wyrzucenie 2 kart albo gra z ręki;
  - zgłoszenie gry: kolorowa, grand albo null, a przy grze z ręki także krawiec, czarny albo gra otwarta;
  - kontra i re, rozgrywka, rozliczenie.
- **Opcje serii spoza ISkO:**
  - **kontra/re:** domyślnie włączona;
  - **ramsz po pasach:** domyślnie włączony. Gdy jest wyłączony, rozdanie, w którym wszyscy spasowali, przepada (ISkO).
- **Pomoce:** podpowiedź na żądanie, licznik na żywo, cofanie ruchu, przegląd po rozdaniu.
- **Seria rozdań:**
  - rozdający zmienia się co rozdanie;
  - tabela Seegera-Fabiana dla trzech graczy;
  - zapis w przeglądarce.

**Celowo pominięte:**
- bocki;
- Schieberamsch;
- stół czteroosobowy;
- poziomy trudności botów;
- statystyki z wielu serii.

## 3. Architektura

Zależności płyną w jedną stronę: `play` (UI) → `game` → `engine` / `bots`. Lekcje (`content`, `exercises`) się nie zmieniają.

```
src/game/      NOWY — czysty TypeScript: stan rozdania i serii, akcje, przejścia faz, zapis
src/bots/      ROZBUDOWA — licytacja, wybór gry, wyrzucanie do skata, kontra/re, ramsz, podpowiedzi
src/play/      NOWY — ekrany gry (React), trasa /gra, pozycja „Gra” w menu
```

### 3.1 `game/` — automat stanów

- **Stan rozdania:** jeden obiekt z polem `phase`:
  `bidding → skat → declare → kontra → play → done` albo, po pasach z włączonym ramszem, `ramsch → done`.
- **Ruchy:** każdy ruch (twój albo bota) to akcja. Czysta funkcja `apply(stan, akcja) → nowy stan` odrzuca akcje niedozwolone w danej fazie (rzuca błąd, jak `playCard` w silniku).
- **Akcje:** `bid(wartość)`, `hold`, `pass`, `takeSkat`, `playHand`, `discard(karta, karta)`, `declare(zgłoszenie)`, `kontra`, `re`, `noDouble` i `play(karta)`.
- **Silnik pod spodem:**
  - **rozgrywka:** `createDeal`/`playCard`/`isDealOver`;
  - **wycena:** `settle`, z przelicytowaniem, `doubling`, ręką i zapowiedziami;
  - **stawki:** `BID_VALUES`/`nextBid`;
  - **rozliczenie ramsza:** `scoreRamsch`.
- **Ramsz w silniku rozgrywki:** potrzebne jest liczenie oczek i lew każdego gracza ze skatem u gracza, który wziął ostatnią lewę (funkcja `ramschTally`). Bez rozgrywającego i bez drużyn.
- **Losowanie:** z ziarna zapisanego w stanie (deterministyczny generator), żeby rozdanie dało się odtworzyć do testów i cofania.
- **Seria:** lista zakończonych rozdań i numer bieżącego rozdania. Rozdającym jest kolejno każdy z trzech graczy. Seria zawiera też opcje (kontra/re, ramsz).

### 3.2 Licytacja (ISkO)

- **Kolejność:** środkowa ręka licytuje do ręki, a ręka odpowiada „tak” albo „pas”. Potem ostatnia ręka licytuje do zwycięzcy pierwszej części.
- **Gdy środkowa i ostatnia ręka spasują:** ręka może zagrać za 18 albo spasować.
- **Stawki:** tylko z `BID_VALUES`.
- **Wynik licytacji:** zwycięzca zostaje rozgrywającym i musi zgłosić grę wartą co najmniej wylicytowaną stawkę. Jeśli nie zdoła (np. skat zmniejszy liczbę matadorów), przegrywa przez przelicytowanie, a `settle` liczy to z parametrem `bid`.
- **Null:** null o wartości niższej od stawki nie może być zgłoszony (ISkO 3.6). UI blokuje taki wybór.

### 3.3 Kontra i re

- **Moment:** przed pierwszą kartą.
- **Kto zapowiada:** obrońca może powiedzieć „kontra”, a rozgrywający odpowiedzieć „re”.
- **Wartości:** kontra ×2, re ×4. Liczy to `settle` (parametr `doubling`).

### 3.4 Ramsz

- **Zasady:** jak w lekcji 31 (spec główny, sekcja 9):
  - atu tylko walety;
  - skat dla biorącego ostatnią lewę;
  - przegrywa gracz z największą liczbą oczek;
  - jungfrau ×2;
  - durchmarsch +120.
- **Bez Schieberamscha:** skat nie jest przekazywany, więc `pushes = 0`.

## 4. Boty

Jeden poziom trudności: proste, poprawne heurystyki. Interfejs pozostaje wspólny, żeby później dało się podmienić boty na silniejsze.

- **Ocena ręki:** dla każdej gry (4 kolory, grand, null) prosta ocena grywalności:
  - **gra kolorowa:** liczba atu z waletami i wysokie atu;
  - **grand:** walety, asy, długi kolor;
  - **null:** brak wysokich kart bez niskich i brak luk.

  Wynik oceny to najlepsza grywalna gra i górna granica stawki z `maxBidFor`, albo brak gry.
- **Licytacja:** bot podbija albo trzyma, dopóki stawka nie przekroczy jego granicy, a potem pasuje.
- **Skat:** bot zawsze podnosi skat, nie gra z ręki i nie zapowiada.
- **Wyrzucanie do skata:** ponowna ocena 12 kart i wybór 2 kart według zasad z lekcji 21:
  - chowanie zagrożonych oczek, czyli dziesiątki i króla bez asa;
  - tworzenie pustych kolorów;
  - nie wyrzuca atu.
- **Zgłoszenie:** bot zgłasza najlepszą grę wartą co najmniej stawkę. Jeśli takiej nie ma, zgłasza najlepszą grę i przegrywa przez przelicytowanie.
- **Kontra i re:**
  - obrońca kontruje tylko przy wyraźnie mocnych kartach przeciwko zgłoszonej grze, np. co najmniej 3 atu, w tym wysokie, i 2 asy z boku;
  - rozgrywający odpowiada re przy bardzo mocnej ręce.
- **Rozgrywka:** obecny `heuristicBot`.
- **Ramsz:** nowa heurystyka. Bot dokłada najwyższą kartę, której nie bierze lewy, gdy lewę i tak bierze ktoś inny. Wychodzi niskimi kartami. Unika brania lew waletami.

## 5. Pomoce treningowe

- **Podpowiedź (przycisk):** pokazuje decyzję, którą w twojej sytuacji podjąłby bot, i jedno zdanie uzasadnienia. Uzasadnienie pochodzi z kategorii reguły, którą bot zastosował, i jest tekstem z tokenami słownika. Przykłady:
  - **licytacja:** „Najlepsza gra: kier z 2 — licytuj najwyżej do 30”;
  - **skat:** proponowane 2 karty;
  - **zgłoszenie:** proponowana gra;
  - **rozgrywka:** karta i powód, np. „Partner bierze lewę — dołóż oczka”.
- **Licznik na żywo:** włączany i wyłączany, z zapamiętanym wyborem. Pokazuje:
  - oczka obu stron, a w ramszu oczka każdego gracza;
  - ile atu już wyszło;
  - karty jeszcze w grze z podziałem na kolory, bez twoich kart.
- **Cofnij:** działa tylko w fazie rozgrywki, bez limitu. Przywraca stan sprzed twojej ostatniej karty, czyli razem z ruchami botów, które po niej nastąpiły. Rozdanie, w którym cofałeś, dostaje w tabeli oznaczenie „z cofaniem”.
- **Przegląd po rozdaniu:**
  - odkryte ręce botów i skat;
  - lewa po lewie: kto wyszedł, kto wziął i ile oczek;
  - rozbicie wyceny: matadory, poziomy, mnożnik, wartość, kontra/re, przelicytowanie i wynik;
  - w ramszu: oczka każdego gracza, jungfrau i durchmarsch.

## 6. Wyniki i zapis

- **Tabela serii:**
  - **wiersz rozdania:** numer, rozgrywający, gra, wynik gry i punkty Seegera-Fabiana dla ciebie i obu botów, pod spodem sumy;
  - **gra rozegrana:** rozgrywający dostaje wynik +50 albo −50 (`tournamentPoints`), a każdy obrońca 40 przy przegranej rozgrywającego;
  - **ramsz:** przegrywający dostaje swój wynik ramsza, bez premii Seegera-Fabiana; durchmarsch daje +120;
  - **rozdanie przepadło** (wszyscy spasowali, ramsz wyłączony): wiersz bez punktów.
- **Zapis:**
  - **klucz w przeglądarce:** `skat-trener:v1:gra`, niezależny od postępu kursu;
  - **zawartość:** wersja schematu, opcje serii, zakończone rozdania i bieżące rozdanie, więc rozdanie przetrwa odświeżenie strony;
  - **uszkodzony zapis:** nowa seria i komunikat, jak w kursie.
- **Nowa seria:** zeruje tabelę i pyta o potwierdzenie.

## 7. Interfejs

- **Menu:** pozycja „Gra” obok „Słowniczek” i „Ustawienia”.
- **Ekran startowy:**
  - tabela serii;
  - opcje (kontra/re, ramsz);
  - przyciski „Dalej” (następne rozdanie albo kontynuacja bieżącego) i „Nowa seria”.
- **Stół:**
  - u góry przeciwnicy z pozycją i liczbą kart, jak w mini-rozdaniach;
  - na środku stół z lewą;
  - na dole twoja ręka;
  - nad ręką pasek akcji zależny od fazy: licytacja (kolejna stawka / „tak” / „pas”), skat („Podnieś skat” / „Graj z ręki”), wyrzucanie (wybór 2 kart jak w lekcji 19), zgłoszenie (rodzaj gry i zapowiedzi), kontra/re;
  - stały przycisk „Podpowiedź” oraz „Cofnij” w rozgrywce.
- **Komunikaty botów:** przy przeciwniku krótko pokazuje się ostatnia wypowiedź, np. „18”, „tak”, „pas”, „kontra”.
- **Wynik rozdania:** podsumowanie, przycisk „Przegląd rozdania” i „Następne rozdanie”.
- **Teksty:** wszystkie przez słownik (tokeny), więc działają w obu rejestrach i dla obu talii.

## 8. Obsługa błędów

- **Niedozwolona akcja:** w UI nie da się jej wybrać (przyciski są nieaktywne, a niedozwolone karty przyciemnione). Automat i tak ją odrzuca.
- **Uszkodzony albo stary zapis gry:** nowa seria z komunikatem. Postęp kursu pozostaje nienaruszony.
- **Błąd renderowania:** obecna granica błędów („Coś poszło nie tak”).

## 9. Testy

- **`game/` (Vitest):**
  - kolejność licytacji i stawki;
  - pas wszystkich, z ramszem i bez;
  - gra z ręki i zapowiedzi;
  - przelicytowanie;
  - null powyżej stawki zablokowany;
  - kontra/re;
  - ramsz (`ramschTally` i rozliczenie);
  - cofanie;
  - tabela Seegera-Fabiana;
  - zapis, odczyt i uszkodzony zapis;
  - determinizm losowania z ziarna.
- **Boty (Vitest):**
  - zawsze dozwolone akcje;
  - licytacja w granicach `maxBidFor`;
  - wyrzucane karty pochodzą z ręki;
  - symulacja kilkuset losowych rozdań bot-kontra-bot bez błędów;
  - test rozsądku: bot nie licytuje słabej ręki i licytuje oczywiście mocną.
- **Komponenty (RTL):** licytacja, wybór skata i wyrzucanie, zgłoszenie, kontra, podpowiedź, cofnij, przegląd i tabela.
- **E2E (Playwright, 375 px):** jedno pełne rozdanie (licytacja, skat, 10 lew, wynik w tabeli) oraz zachowanie serii po przeładowaniu.

## 10. Podział pracy

Implementacja w trzech planach:
1. **Silnik gry i boty:** `game/` i nowe funkcje botów, bez UI.
2. **Ekrany gry:** trasa `/gra`, stół z fazami i tabela serii.
3. **Pomoce treningowe i E2E:** podpowiedź, licznik, cofnij i przegląd.

## 11. Decyzje z implementacji (Plan 7)

- **Rozdanie** = ziarno + lista ruchów (`history`). Zapis serii przechowuje tylko ruchy bieżącego rozdania, a przy wczytaniu rozdanie jest odtwarzane.
- **Kolejność miejsc:** w 1. rozdaniu rozdaje bot po prawej, więc gracz zaczyna na ręku. Potem rozdający przechodzi zgodnie z ruchem wskazówek zegara.
- **Heurystyki botów** (`src/bots/evaluate.ts`):
  - kolor: co najmniej 6 atu albo 5 atu z waletem i razem co najmniej 3 waletami lub asami z boku;
  - grand: 3 walety i 2 asy albo 2 walety z treflowym i 3 asy;
  - null: siódemka albo ósemka w każdym kolorze, najwyżej 2 asy i króle;
  - kontra: co najmniej 4 atu, w tym 2 wysokie, i 2 asy z boku (w grandzie 2 walety i 3 asy);
  - re: co najmniej 8 atu albo 7 atu i 3 walety.
- **Ramsz w silniku rozgrywki:** `createDeal` z `declarer: 0`, bo w ramszu nie ma rozgrywającego. Wynik liczy `ramschTally`.
