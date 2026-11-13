# Trener skata

Kurs skata po polsku — od podstaw do taktyki — z ćwiczeniami w przeglądarce. Bez logowania; postęp zapisuje się lokalnie (localStorage).

## Uruchomienie

```bash
npm install
npm run dev        # serwer deweloperski (http://localhost:5173)
npm test           # testy jednostkowe i treści (Vitest)
npm run e2e        # test E2E w widoku telefonu (Playwright; pierwszy raz: npx playwright install chromium)
npm run build      # wersja produkcyjna w dist/
npm run texts -- m1-l01   # podgląd tekstów lekcji we wszystkich wariantach talii i języka
```

Wymagany Node.js 22.4 lub nowszy.

## Wdrożenie (GitHub Pages)

1. Utwórz repozytorium na GitHubie i wypchnij gałąź `main`.
2. W repozytorium: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Każde wypchnięcie na `main` uruchamia workflow „Testy i wdrożenie” (`.github/workflows/deploy.yml`): testy, E2E, build i publikację. Adres strony pojawi się w podsumowaniu zadania `deploy`.

Aplikacja używa `HashRouter` i ścieżek względnych (`base: './'`), więc działa w podkatalogu Pages bez dodatkowej konfiguracji.

## Interfejs 3D

Stół do gry, ćwiczenia z kartami i strona główna są renderowane w WebGL (three.js + @react-three/fiber), kod w `src/three/`:

- `sceneCards.ts` — gdzie leży każda karta (ręka, wachlarze przeciwników, lewa, stosy, skat); czysta logika z testami;
- `layout.ts` — kamera i położenia kart dla proporcji ekranu (osobny układ dla telefonu w pionie);
- `TableScene.tsx` — stół, światło i karty przelatujące między miejscami; `HeroScene.tsx` — walety na stronie głównej;
- `Stage.tsx` — rama sceny z nakładką (HUD) i listą kart jako przycisków dla klawiatury i czytników ekranu.

Bez WebGL (także w testach w jsdom) aplikacja pokazuje dotychczasowy widok 2D. Silnik gry, boty i treść lekcji nie zależą od interfejsu.

## Treść kursu

- Lekcje: `src/content/lessons/` (dane typowane; test treści sprawdza je silnikiem gry).
- Słownik terminów (oficjalne / potoczne): `src/glossary/terms.ts`, nazwy kart: `src/glossary/cardNames.ts`.
- Specyfikacja: `docs/superpowers/specs/2026-11-12-skat-trainer-design.md`.

## Grafiki kart

Grafiki pochodzą z Wikimedia Commons (szczegóły na stronie „O kartach” w aplikacji i w `src/cards/deckCredits.ts`):

- talia Altenburg — Gunter Gerhardt (XSkat), wersja SVG: Mfrasca, licencja [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/);
- talia francuska — Adrian Kennard, [CC0](https://creativecommons.org/publicdomain/zero/1.0/).

Pliki pobiera skrypt `node scripts/fetch-cards.mjs`.
