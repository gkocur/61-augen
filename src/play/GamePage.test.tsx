// src/play/GamePage.test.tsx
import { act, fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GAME_STORAGE_KEY } from '../game';
import { renderWithProviders } from '../test/render';
import { createMemoryStorage } from '../test/storage';
import { GamePage } from './GamePage';

/** Ziarno 3: oba boty pasują, a ty (na ręku) decydujesz o grze za 18. Ziarno 1: bot na środkowym ręku licytuje. */
const BOTS_PASS = () => 3;
const BOT_BIDS = () => 1;

function renderGame(seedSource: () => number, storage: Storage = createMemoryStorage()) {
  renderWithProviders(<GamePage storage={storage} delayMs={0} seedSource={seedSource} />);
  return storage;
}

const tick = () => act(() => new Promise<void>((r) => setTimeout(r, 0)));

/** Rozgrywa rozdanie do końca: klika pierwszą dozwoloną kartę, a na kontrę/re odpowiada „bez”. */
async function playOut() {
  for (let i = 0; i < 400; i++) {
    if (screen.queryByRole('region', { name: 'Wynik rozdania' })) return;
    const noDouble = screen.queryByRole('button', { name: /^Bez (kontry|re)$/ });
    if (noDouble) fireEvent.click(noDouble);
    const list = screen.queryByRole('list', { name: 'Twoje karty' });
    const card = list
      ? within(list)
          .queryAllByRole('button')
          .find((b) => !b.hasAttribute('disabled') && b.getAttribute('aria-description') !== 'niedozwolona')
      : undefined;
    if (card) {
      fireEvent.click(card);
      fireEvent.click(card);
    }
    await tick();
  }
  throw new Error('Rozdanie się nie skończyło');
}

afterEach(() => vi.restoreAllMocks());

describe('gra z botami', () => {
  it('ekran startowy: zasady serii i start pierwszego rozdania', async () => {
    const user = userEvent.setup();
    renderGame(BOTS_PASS);
    expect(screen.getByRole('heading', { name: 'Gra z botami' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Kontra i re' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Ramsz, gdy wszyscy spasują' })).toBeChecked();
    await user.click(screen.getByRole('button', { name: 'Zacznij grę' }));
    expect(screen.getByText(/Rozdanie 1 · Siedzisz na ręku/)).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Gram za 18' })).toBeInTheDocument();
    expect(screen.getAllByText('pas')).toHaveLength(2);
    expect(within(screen.getByRole('list', { name: 'Twoje karty' })).getAllByRole('button')).toHaveLength(10);
  });

  it('licytacja: bot mówi stawkę, ty odpowiadasz „tak” albo „pas”', async () => {
    const user = userEvent.setup();
    renderGame(BOT_BIDS);
    await user.click(screen.getByRole('button', { name: 'Zacznij grę' }));
    expect(await screen.findByRole('button', { name: 'Tak (18)' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pas' })).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
  });

  it('pełne rozdanie: skat, wyrzucenie, zgłoszenie, rozgrywka, wynik i tabela; seria przetrwa odświeżenie', async () => {
    const user = userEvent.setup();
    const storage = renderGame(BOTS_PASS);
    await user.click(screen.getByRole('button', { name: 'Zacznij grę' }));
    await user.click(await screen.findByRole('button', { name: 'Gram za 18' }));
    await user.click(screen.getByRole('button', { name: 'Podnieś skat' }));
    const discard = screen.getByRole('group', { name: 'Wyrzucanie do skata' });
    const twelve = within(discard).getAllByRole('button').filter((b) => b.classList.contains('card'));
    expect(twelve).toHaveLength(12);
    const wyrzuc = within(discard).getByRole('button', { name: 'Wyrzuć do skata' });
    expect(wyrzuc).toBeDisabled();
    await user.click(twelve[10]);
    await user.click(twelve[11]);
    await user.click(wyrzuc);
    await user.click(screen.getByRole('button', { name: 'Czerwień' }));
    await user.click(screen.getByRole('button', { name: 'Zgłoś grę' }));
    expect(await screen.findByText('Gra kolorowa · atu: czerwień')).toBeInTheDocument();
    await playOut();
    const summary = screen.getByRole('region', { name: 'Wynik rozdania' });
    expect(within(summary).getByText(/Rozgrywający: Ty/)).toBeInTheDocument();
    await user.click(within(summary).getByRole('button', { name: 'Tabela wyników' }));
    const table = screen.getByRole('table', { name: 'Tabela wyników' });
    expect(within(table).getByRole('rowheader', { name: '1' })).toBeInTheDocument();
    expect(within(table).getByText(/Czerwień \(Ty\)/)).toBeInTheDocument();
    expect(storage.getItem(GAME_STORAGE_KEY)).not.toBeNull();

    // „Odświeżenie strony”: nowy komponent z tą samą pamięcią.
    document.body.innerHTML = '';
    renderGame(BOTS_PASS, storage);
    expect(screen.getByRole('table', { name: 'Tabela wyników' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Następne rozdanie' })).toBeInTheDocument();
  });

  it('gra z ręki: zapowiedzi do wyboru', async () => {
    const user = userEvent.setup();
    renderGame(BOTS_PASS);
    await user.click(screen.getByRole('button', { name: 'Zacznij grę' }));
    await user.click(await screen.findByRole('button', { name: 'Gram za 18' }));
    await user.click(screen.getByRole('button', { name: 'Graj z ręki' }));
    await user.click(screen.getByRole('button', { name: 'Grand' }));
    const announce = screen.getByRole('radiogroup', { name: 'Zapowiedź' });
    await user.click(within(announce).getByRole('radio', { name: 'Krawiec' }));
    await user.click(screen.getByRole('button', { name: 'Zgłoś grę' }));
    expect(await screen.findByText(/stawka 18 .*gra z ręki/)).toBeInTheDocument();
  });

  it('wszyscy pasują: bez ramsza rozdanie przepada', async () => {
    const user = userEvent.setup();
    renderGame(BOTS_PASS);
    await user.click(screen.getByRole('checkbox', { name: 'Ramsz, gdy wszyscy spasują' }));
    await user.click(screen.getByRole('button', { name: 'Zacznij grę' }));
    await user.click(await screen.findByRole('button', { name: 'Pas' }));
    expect(await screen.findByText('Wszyscy spasowali — rozdanie przepada.')).toBeInTheDocument();
  });

  it('wszyscy pasują: z ramszem gra się ramsza', async () => {
    const user = userEvent.setup();
    renderGame(BOTS_PASS);
    await user.click(screen.getByRole('button', { name: 'Zacznij grę' }));
    await user.click(await screen.findByRole('button', { name: 'Pas' }));
    expect(await screen.findByText('Ramsz · atu: tylko niżniki')).toBeInTheDocument();
    await playOut();
    expect(within(screen.getByRole('region', { name: 'Wynik rozdania' })).getByText(/każdy grał na siebie/)).toBeInTheDocument();
  });

  it('nowa seria po potwierdzeniu wraca do ekranu startowego', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderGame(BOTS_PASS);
    await user.click(screen.getByRole('checkbox', { name: 'Ramsz, gdy wszyscy spasują' }));
    await user.click(screen.getByRole('button', { name: 'Zacznij grę' }));
    await user.click(await screen.findByRole('button', { name: 'Pas' }));
    await user.click(await screen.findByRole('button', { name: 'Tabela wyników' }));
    await user.click(screen.getByRole('button', { name: 'Nowa seria' }));
    expect(screen.getByRole('button', { name: 'Zacznij grę' })).toBeInTheDocument();
  });

  it('uszkodzony zapis: komunikat i ekran startowy', () => {
    renderGame(BOTS_PASS, createMemoryStorage({ [GAME_STORAGE_KEY]: '{nie json' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Zapisana seria była uszkodzona');
    expect(screen.getByRole('button', { name: 'Zacznij grę' })).toBeInTheDocument();
  });
});
