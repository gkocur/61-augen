# Trener skata — specyfikacja projektu

Data: 2026-11-12
Status: do przeglądu przez autora (słownik terminów do weryfikacji)

## 1. Cel

Aplikacja web ucząca gry w skata krok po kroku, od zupełnych podstaw po taktykę rozgrywającego i obrońców. Każda lekcja jest krótka (ok. 3–5 minut) i kończy się praktycznym ćwiczeniem.

### Założenia

- Interfejs i treść wyłącznie po polsku.
- Brak logowania i serwera — stan kursu i ustawienia w przeglądarce (`localStorage`).
- Statyczna strona, projektowana najpierw pod telefon (mobile-first), działa też na desktopie.
- Zasady: oficjalne zasady turniejowe (ISkO); kontra/re jako typowy dodatek spoza ISkO. Warianty towarzyskie (ramsz, bocki) w osobnym, opcjonalnym dodatku.
- Ustawienia: talia **Altenburg (domyślna)** lub francuska; „język” **oficjalny turniejowy (domyślny)** lub potoczny oparty na niemieckim.
- Grafiki kart z otwartych talii z Wikimedia Commons (z atrybucją).

### Poza zakresem wersji 1

- Swobodna gra pełnych rozdań z komputerowymi przeciwnikami (silnik i boty są projektowane tak, by dodać ją później).
- Konta, synchronizacja między urządzeniami, ranking.
- System powtórek rozłożonych w czasie (spaced repetition).
- Inne języki.
- Tryb offline / PWA (możliwy później bez zmian architektury).

## 2. Technologia

- Vite + TypeScript + React.
- Routing: `HashRouter` (działa na GitHub Pages bez konfiguracji serwera).
- Testy: Vitest (silnik, treść, zapis), React Testing Library (komponenty), Playwright (przejście lekcji w widoku telefonu).
- Hosting: GitHub Pages (budowanie przez GitHub Actions) lub dowolny hosting statyczny.

## 3. Architektura

```
src/
  engine/      czyste reguły skata (bez React)
  content/     kurs: moduły → lekcje → kroki
  glossary/    terminy oficjalne/potoczne, zależne od talii, z odmianą
  cards/       renderowanie kart obu talii + atrybucja + zapasowy renderer SVG
  exercises/   4 komponenty ćwiczeń
  bots/        skryptowani przeciwnicy do mini-rozdań
  state/       postęp i ustawienia (localStorage, wersjonowany schemat)
  ui/          ekrany: mapa kursu, lekcja, słowniczek, ustawienia, o kartach
```

Zależności płyną w jedną stronę: `ui` → `exercises` → `engine`/`glossary`/`cards`/`bots`; `content` zależy tylko od typów z `engine` i `exercises`. `engine` nie zależy od niczego.

### 3.1 `engine/` — silnik zasad

Czysty TypeScript, w pełni pokryty testami. Ten sam silnik obsłuży w przyszłości tryb pełnej gry.

- **Karty**: 32 karty, neutralne identyfikatory `<kolor>-<ranga>`; kolory `c` (♣ żołądź/trefl), `s` (♠ wino/pik), `h` (♥ czerwień/kier), `d` (♦ dzwonek/karo); rangi `7 8 9 10 J Q K A`. Przykład: `c-J` = niżnik żołędny / walet trefl.
- **Rodzaje gier**: kolorowa (4 kolory atu), grand, null; warianty: z ręki, zapowiedź krawca, zapowiedź czarnego, otwarta.
- **Kolejność kart**:
  - gra kolorowa: atu = W♣ > W♠ > W♥ > W♦ > A > 10 > K > D > 9 > 8 > 7 koloru atu; pozostałe kolory: A > 10 > K > D > 9 > 8 > 7;
  - grand: atu tylko 4 walety (kolejność jak wyżej); kolory jak wyżej;
  - null: brak atu; A > K > D > W > 10 > 9 > 8 > 7 w każdym kolorze.
- **Dozwolone zagrania**: obowiązek dokładania do koloru wyjścia; walety (poza nullem) należą do atu, nie do swojego koloru.
- **Zwycięzca lewy**, **liczenie oczek** (A 11, 10 10, K 4, D 3, W 2, 9/8/7 0; razem 120), wynik rozdania (≥61 wygrywa rozgrywający; krawiec ≤30 / ≥90; czarny).
- **Wartość gry**:
  - wartości bazowe: ♦ 9, ♥ 10, ♠ 11, ♣ 12, grand 24;
  - mnożnik = matadory („z”/„bez”) + 1 (gra) + ręka + krawiec + krawiec zapowiedziany + czarny + czarny zapowiedziany + otwarta;
  - nulle: 23, z ręki 35, otwarty 46, otwarty z ręki 59;
  - przegrana: wartość ujemna podwójna (ISkO);
  - przelicytowanie: gra przegrana; wartość = najmniejsza wielokrotność wartości bazowej ≥ licytowanej stawki;
  - kontra ×2, re ×4 (dodatek spoza ISkO);
  - zapis turniejowy (Seeger-Fabian): wygrana +50 dla rozgrywającego, przegrana −50 i po +40 dla każdego obrońcy (stół 3-osobowy).
- **Licytacja**: kolejne stawki 18, 20, 22, 23, 24, 27, 30, 33, 35, 36, 40, 44, 45, 46, 48, 50, 54, 55, 59, 60, 63, 66, 70, 72, 77, 80, 81, 84, 88, 90, 96, 99, 100, 108, 110, 117, 120, 121, 126, 130, 132, 135, 140, 143, 144, 150, 153, 154, 156, 160, 162, 165, 168, 170, 176, 180, 187, 192, 198, 204, 216, 240, 264 (lista generowana i sprawdzana testem, nie wpisywana ręcznie w kod); kolejność: środek licytuje przodkowi, następnie zadek zwycięzcy; wszyscy pasują → rozdanie bez gry.

### 3.2 `content/` — treść kursu

Kurs = moduły → lekcje → kroki. Każda lekcja ma stabilny identyfikator (np. `m2-l07-atu-kolorowa`), tytuł, listę kroków teorii (tekst + opcjonalny przykład na kartach) i ćwiczenie końcowe (3–5 zadań lub pula zadań do losowania).

Treść jest typowanymi plikami TypeScript — kompilator wyłapuje błędne identyfikatory kart i typy ćwiczeń.

Tekst używa tokenów słownika (patrz 3.3): `[[lewa:B]]`, oraz fraz alternatywnych `{wygrana lewa|wygrany sztych}` tam, gdzie zmienia się rodzaj gramatyczny.

### 3.3 `glossary/` — terminologia

- Każdy termin ma wersję **oficjalną** i **potoczną**; nazwy kolorów i figur zależą dodatkowo od **talii**.
- Każda wersja ma formy przypadków (M, D, C, B, N, Ms) i liczby mnogiej, w zakresie potrzebnym w treści.
- Składnia w treści:
  - `[[termin]]` — mianownik l.p.;
  - `[[termin:B]]`, `[[termin:Dlm]]` — wybrany przypadek / liczba;
  - `{wersja oficjalna|wersja potoczna}` — cała fraza w dwóch wariantach (dla zgodności rodzaju itp.).
- Nazwa karty (np. „dziesiątka czerwienna”, „walet trefl”) generowana jest z talii i rejestru.
- Słownik terminów: sekcja 8.

### 3.4 `cards/` — karty

- Dwie talie: Altenburg (domyślna, wzór niemiecki) i francuska.
- Grafiki z Wikimedia Commons; kryteria wyboru: licencja CC0 / domena publiczna / CC-BY / CC-BY-SA, komplet 32 kart w spójnym stylu dla każdej talii, najlepiej SVG; kopie lokalne w `public/cards/<talia>/`.
- Strona „O kartach” z atrybucją (autor, licencja, link do źródła) dla każdej użytej talii.
- Zapasowy renderer SVG generowany w kodzie (symbol koloru + oznaczenie rangi), używany gdy brakuje grafiki lub gdy nie znajdziemy odpowiedniej talii.
- Karta zakryta (rewers) w tym samym stylu.

### 3.5 `exercises/` — ćwiczenia

Każde ćwiczenie jest komponentem sterowanym danymi z lekcji; poprawność odpowiedzi sprawdza silnik, a nie ręcznie wpisane reguły.

| Typ | Dane | Ocena |
|---|---|---|
| `quiz` | pytanie, opcjonalnie karty do pokazania, odpowiedzi (tekst lub karty), poprawna odpowiedź, wyjaśnienie | wybór = poprawna |
| `playCard` | rodzaj gry, ręka gracza, karty już zagrane w lewie, pozycja gracza, tryb (`dozwolona` / `najlepsza`), lista najlepszych kart, wyjaśnienia dla typowych błędnych kart | silnik sprawdza dozwolenie; w trybie `najlepsza` dodatkowo lista z danych |
| `bid` | ręka, pozycja, zadanie: `maksymalna stawka` / `wybór gry` / `2 karty do skata` / `wartość gry`, odpowiedź, opcjonalna tolerancja (np. 30–36), wyjaśnienie | porównanie z odpowiedzią; wartość gry liczona silnikiem |
| `miniDeal` | 3 ręce + skat, rodzaj gry, rozgrywający, kto zaczyna, opcjonalny skrypt ruchów botów, cel (np. „ugraj ≥61”, „nie oddaj dziesiątki”), punkty kontrolne z pytaniami w trakcie | cel sprawdzany silnikiem po rozdaniu; punkty kontrolne jak `quiz` |

Po każdej odpowiedzi natychmiastowa informacja zwrotna z wyjaśnieniem. Przyciemnianie niedozwolonych kart w ręce włącza się od lekcji 8 (wcześniej rozpoznanie dozwolonej karty jest przedmiotem ćwiczenia).

### 3.6 `bots/` — przeciwnicy w mini-rozdaniach

- Jeśli ćwiczenie ma skrypt — bot gra karty ze skryptu (test treści gwarantuje ich dozwoloność).
- Jeśli skrypt się wyczerpie lub go nie ma, albo gracz zagrał inaczej niż przewiduje skrypt — prosta heurystyka: weź lewę najtańszą wygrywającą kartą, jeśli się da, w przeciwnym razie zagraj najniższą dozwoloną kartę (obrońcy dokładają oczka, gdy lewa należy do partnera).
- Interfejs bota (`chooseCard(stan, gracz) → karta`) jest wspólny, by później podłączyć silniejsze boty do trybu pełnej gry.

### 3.7 `state/` — postęp i ustawienia

- Klucz `localStorage`: `skat-trener:v1` (JSON) z polem `schemaVersion`.
- Zawartość: ustawienia (`deck: 'altenburg' | 'french'`, `register: 'official' | 'colloquial'`, `unlockAll: boolean`), postęp lekcji (`{ [lessonId]: { status, bestScore, attempts } }`), wyniki testów modułowych.
- Migracje między wersjami schematu.
- Każdy odczyt/zapis w `try/catch`. Brak dostępu do pamięci → praca w pamięci tymczasowej + baner „postęp nie zostanie zapisany”. Uszkodzony JSON → reset z komunikatem. Postęp dla lekcji usuniętych z kursu jest ignorowany.

### 3.8 `ui/` — ekrany

- **Mapa kursu** (start): moduły i lekcje ze statusem (zablokowana / dostępna / zaliczona + wynik), przycisk „Kontynuuj”.
- **Lekcja**: pasek postępu; kroki teorii z „Dalej”; zadania z natychmiastową oceną; podsumowanie (wynik, odblokowanie następnej lekcji przy ≥80% lub „Spróbuj ponownie” z nowym losowaniem z puli).
- **Test modułowy** na końcu modułu: losowe zadania z lekcji modułu.
- **Słowniczek**: wszystkie terminy w wybranym rejestrze, z drugim wariantem obok.
- **Ustawienia**: talia, język, „odblokuj wszystko”, reset postępu (z potwierdzeniem).
- **O kartach**: atrybucja grafik.
- **Stół (telefon)**: ręka gracza wachlarzem na dole, lewa na środku, przeciwnicy u góry (karty zakryte + etykieta pozycji). Zagranie: pierwsze dotknięcie wybiera kartę, drugie zatwierdza.

## 4. Program kursu

Lekcja = 2–4 ekrany teorii + ćwiczenie (3–5 zadań). Zaliczenie od 80%. Lekcje odblokowywane kolejno (lub wszystkie przy „odblokuj wszystko”).

**Moduł 1 — Pierwsze kroki**
1. Czym jest skat: 3 graczy, rozgrywający kontra dwóch obrońców, cel 61 oczek — *quiz*
2. Talia: 4 kolory × 8 kart; obie talie — *quiz: rozpoznaj kartę*
3. Oczka: A 11, 10 10, K 4, D 3, W 2, reszta 0; razem 120 — *quiz: policz oczka w lewie*
4. Rozdanie: 3 × 10 kart + 2 do skata; przodek / środek / zadek — *quiz: kto wychodzi*

**Moduł 2 — Rozgrywka lew**
5. Lewa i obowiązek dokładania do koloru — *playCard (dozwolona)*
6. Kolejność kart w kolorze: 10 wyżej niż K — *quiz: kto bierze lewę*
7. Atu w grze kolorowej: 4 walety + kolor atu — *quiz: kto bierze lewę*
8. Walet należy do atu, nie do swojego koloru — *playCard (dozwolona)*
9. Grand: atu tylko walety — *playCard*
10. Null: inna kolejność, brak atu, rozgrywający nie może wziąć lewy — *playCard*
11. Pierwsze pełne rozdanie: prosta gra kolorowa — *miniDeal*

**Moduł 3 — Wartość gry**
12. Wartości bazowe: 9 / 10 / 11 / 12; grand 24 — *quiz*
13. Matadory: „z ilu” / „bez ilu” — *quiz: policz matadory*
14. Poziomy gry: gra, ręka, krawiec, czarny, zapowiedzi, otwarta — *bid: wartość gry*
15. Nulle: 23 / 35 / 46 / 59 — *quiz*
16. Przegrana, przelicytowanie, zapis Seeger-Fabian — *bid: wartość gry / quiz: wynik*

**Moduł 4 — Licytacja**
17. Przebieg licytacji i kolejne stawki — *quiz: następna stawka*
18. Do ilu licytować rękę — *bid: maksymalna stawka*
19. Skat: podniesienie, wyrzucenie 2 kart, zgłoszenie gry; kiedy grać z ręki — *bid: wybór gry*

**Moduł 5 — Taktyka rozgrywającego**
20. Ocena ręki do gry kolorowej (atu, walety, boczne asy) — *bid: wybór gry / maksymalna stawka*
21. Co wyrzucić do skata (obnażanie koloru, dziesiątki, oczka do skata) — *bid: 2 karty do skata*
22. Ciągnięcie atu — kiedy tak, kiedy nie — *playCard (najlepsza) + miniDeal*
23. Gra kolorami z boku: niechroniona dziesiątka, wyrabianie koloru — *playCard (najlepsza)*
24. Kiedy grać granda — *bid + miniDeal*
25. Ręce do nulla, niebezpieczne karty — *bid: wybór gry*

**Moduł 6 — Taktyka obrońców**
26. Wyjście do gry: „krótka droga — długi kolor, długa droga — krótki kolor” — *playCard (najlepsza)*
27. Dokładanie oczek partnerowi — *playCard (najlepsza)*
28. Liczenie oczek i atu w trakcie gry — *miniDeal z punktami kontrolnymi*
29. Obrona przed nullem — *miniDeal*
30. Kontra i re — kiedy kontrować — *quiz z rękami*

**Dodatek (opcjonalny) — Warianty towarzyskie**
31. Ramsz — *quiz + miniDeal*
32. Bocki i inne zasady domowe — *quiz*

### Kolejność wydawania treści

Aplikacja i silnik budowane w całości od razu; treść partiami:
1. Moduły 1–4 (zasady),
2. Moduły 5–6 (taktyka),
3. Dodatek.

## 5. Obsługa błędów

- Pamięć przeglądarki — patrz 3.7.
- Brak grafiki karty → zapasowy renderer SVG.
- Nieznany token słownika lub brakująca forma → błąd testu treści (nigdy nie trafia do użytkownika); w działającej aplikacji awaryjnie wyświetlany jest wariant oficjalny w mianowniku.
- Błąd renderowania lekcji → ekran „Coś poszło nie tak” z powrotem do mapy kursu (granica błędów React), postęp nienaruszony.

## 6. Testy

- **Silnik** (Vitest): dozwolone zagrania, zwycięzca lewy we wszystkich rodzajach gier, oczka, matadory, wartości gier i nulli, przelicytowanie, kontra/re, zapis Seeger-Fabian, stawki licytacji — na przykładach z oficjalnych zasad.
- **Treść** (Vitest): dla każdego ćwiczenia w kursie — brak powtórzonych kart i właściwa liczba kart w rękach/skacie; „najlepsze” karty są dozwolone; wartości gier zgodne z silnikiem; skrypty botów zawierają wyłącznie dozwolone ruchy; cele mini-rozdań osiągalne przy skrypcie; wszystkie tokeny słownika i formy istnieją; identyfikatory lekcji unikalne.
- **Zapis** (Vitest): migracje, uszkodzony JSON, brak `localStorage`.
- **Komponenty** (React Testing Library): każdy z 4 typów ćwiczeń — poprawna i błędna odpowiedź, informacja zwrotna, przełączanie talii i rejestru.
- **E2E** (Playwright, widok telefonu): przejście jednej lekcji od teorii do zaliczenia i odblokowania następnej; zachowanie postępu po przeładowaniu.

## 7. Przyszłe rozszerzenia (nie w wersji 1)

- Tryb pełnej gry z botami (silnik i interfejs bota gotowe).
- PWA / offline.
- Powtórki rozłożone w czasie.
- Eksport/import postępu (plik JSON).

## 8. Słownik terminów (do weryfikacji)

⚠ = pozycja niepewna. Do poprawienia bezpośrednio w tym pliku.

### 8.1 Kolory i figury (zależne od talii)

| Pojęcie | Altenburg — oficjalny | Altenburg — potoczny | Francuska — oficjalny | Francuska — potoczny |
|---|---|---|---|---|
| ♣ (Eichel / Kreuz) | żołądź | ajchel ⚠ | trefl | trefl / krzyż ⚠ |
| ♠ (Grün / Pik) | wino / zielone ⚠ | grin ⚠ | pik | pik |
| ♥ (Rot / Herz) | czerwień | herc / rot ⚠ | kier | kier |
| ♦ (Schellen / Karo) | dzwonek | szele ⚠ | karo | karo |
| Unter / Bube | niżnik | uner | walet | jopek / uner ⚠ |
| Ober / Dame | wyżnik | ober | dama | dama |
| Daus / As | tuz / as ⚠ | daus ⚠ | as | as |
| König | król | król | król | król |

### 8.2 Pojęcia gry (niezależne od talii)

| Oficjalny | Potoczny |
|---|---|
| lewa | sztych |
| atu | trumf ⚠ |
| rozgrywający | szpiler ⚠ |
| obrońcy | przeciwnicy ⚠ |
| przodek / środek / zadek | forhand / mitelhand / hinterhand ⚠ |
| licytacja, licytować | reizowanie, reizować ⚠ |
| pas | pas / weg ⚠ |
| gra z ręki | hand |
| gra kolorowa | farbszpil ⚠ |
| oczka | augi ⚠ |
| krawiec | szneider |
| czarny | szwarc |
| gra otwarta | uwert ⚠ |
| z / bez (matadorów) | mit / ohne ⚠ |
| wyrzucić do skata | zdrukować ⚠ |
| dokładanie oczek partnerowi | szmirowanie |
| przelicytowanie | przereizowanie ⚠ |
| obnażony (pusty) kolor | blanka ⚠ |
| grand | grand |
| null | null / nul ⚠ |
| skat | skat |
| kontra / re | kontra / re |
| ramsz | ramsz |
| bock | bok ⚠ |

### 8.3 Do potwierdzenia przy weryfikacji zasad

- Kontra/re: nie należą do ISkO; w kursie jako dodatek (kontra ×2, re ×4, zapowiedź przed pierwszą kartą); szczegóły ustala się przed grą.
- Przegrana gra z ręki: liczona podwójnie, jak każda przegrana — potwierdzone w ISkO (wyd. 2018, pkt 2.5).
- Zapis Seeger-Fabian: wygrana +wartość +50; przegrana −2 × wartość −50 i +40 dla każdego obrońcy (stół 3-os.; 30 przy stole 4-os.) — potwierdzone.

## 9. Decyzje podjęte w trakcie realizacji (Plany 1–5)

- **Ćwiczenie `bid` zastąpione** quizami z polem `verify` (odpowiedź liczona silnikiem: `points`, `trickWinner`, `matadors`, `maxBid`, `nextBid`, `settle`) oraz ćwiczeniem `discard` (wybór 2 kart do skata). Wybór gry to zwykły quiz (lekcja 19; dalej w lekcjach 20, 24, 25).
- **Przyciemnianie niedozwolonych kart** dotyczy mini-rozdań; w ćwiczeniach „zagraj kartę” jest wyłączone, bo rozpoznanie dozwolonej karty jest ich celem.
- **Liczba zadań w lekcji:** zwykle 3–5, najwyżej 7.
- **Punkty kontrolne w mini-rozdaniach** (pytania w trakcie gry) — przeniesione do Planu 5 (moduł 6).
- **Nazwy kart odmieniają się przez przypadki:** `[[card:h-10:B]]` → „dziesiątkę czerwienną”.
- **Kontra/re** — w Planie 5 (lekcja 30), razem z ewentualną zmianą zapisu wyniku.
- **Zależności modułów:** `engine` ← `bots` ← `content` (walidacja treści używa silnika i botów) ← `exercises`/`ui`; `glossary` zależy tylko od `engine`.
- **Null zgłoszony po stawce wyższej niż jego wartość** jest odrzucany przez silnik (ISkO 3.6 liczy to jako przegraną grę kolorową/granda — nie modelujemy tego).
- **Podział dalszych prac:** Plan 4 — moduł 5; Plan 5 — moduł 6, kontra/re, punkty kontrolne; Plan 6 — dodatek, grafiki z Wikimedia, E2E, wdrożenie.
- **Rozdania w lekcjach taktycznych** wyszukiwane skryptem na silniku i botach (pouczające: dobra decyzja wygrywa, typowy błąd przegrywa); walidator treści ponownie symuluje wzorcowe rozegranie.
- **Przegląd tekstów:** `npm run texts [-- prefiks]` drukuje teksty lekcji w 4 kontekstach (talia × rejestr).
- **Mini-rozdania:** pytania w trakcie gry (`checkpoints` — liczba oczek strony gracza, liczba wyszłych atu), gra otwarta (`ouvert`), typowe błędy (`mistakes`) sprawdzane w teście treści.
- **Zasada wyjść obrońcy** zweryfikowana w źródłach: krótka droga (rozgrywający gra zaraz po wychodzącym) — długi kolor; długa droga — krótki kolor.
