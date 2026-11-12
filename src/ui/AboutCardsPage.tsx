import { DECK_CREDITS } from '../cards/deckCredits';

export function AboutCardsPage() {
  return (
    <div className="about-cards">
      <h1>O kartach</h1>
      <p>Grafiki kart pochodzą z Wikimedia Commons. Dziękujemy autorom za udostępnienie ich na wolnych licencjach.</p>
      {DECK_CREDITS.map((credit) => (
        <section key={credit.deck} className="about-cards__deck">
          <h2>{credit.name}</h2>
          <dl>
            <dt>Autor</dt>
            <dd>{credit.author}</dd>
            <dt>Licencja</dt>
            <dd>
              <a href={credit.licenseUrl} target="_blank" rel="noreferrer">
                {credit.license}
              </a>
            </dd>
            <dt>Zmiany</dt>
            <dd>{credit.changes}</dd>
          </dl>
          <p>
            <a href={credit.source} target="_blank" rel="noreferrer">
              Źródło w Wikimedia Commons
            </a>
          </p>
        </section>
      ))}
      <p>Grafiki talii Altenburg można rozpowszechniać dalej na tej samej licencji (CC BY-SA 3.0). Rewers kart i pozostała grafika aplikacji są częścią aplikacji.</p>
    </div>
  );
}
