// src/ui/SettingsPage.tsx
import { useState } from 'react';
import { CardRow } from '../cards/Hand';
import { resolveText } from '../glossary';
import { useAppState } from '../state/AppStateContext';

const EXAMPLE = '[[lewa]], [[rozgrywajacy]], [[walet]]';

export function SettingsPage() {
  const { state, updateSettings, resetProgress } = useAppState();
  const { deck, register, unlockAll } = state.settings;
  const [resetDone, setResetDone] = useState(false);

  const handleReset = () => {
    if (window.confirm('Na pewno usunąć cały postęp kursu? Tego nie da się cofnąć.')) {
      resetProgress();
      setResetDone(true);
    }
  };

  return (
    <div className="settings">
      <h1>Ustawienia</h1>

      <fieldset className="settings__group">
        <legend>Talia</legend>
        <label className="settings__option">
          <input type="radio" name="deck" checked={deck === 'altenburg'} onChange={() => updateSettings({ deck: 'altenburg' })} />
          Altenburg (niemiecka)
        </label>
        <label className="settings__option">
          <input type="radio" name="deck" checked={deck === 'french'} onChange={() => updateSettings({ deck: 'french' })} />
          Francuska
        </label>
        <CardRow cards={['c-J', 's-A', 'h-10', 'd-K']} />
      </fieldset>

      <fieldset className="settings__group">
        <legend>Język</legend>
        <label className="settings__option">
          <input
            type="radio"
            name="register"
            checked={register === 'official'}
            onChange={() => updateSettings({ register: 'official' })}
          />
          Oficjalny turniejowy (np. {resolveText(EXAMPLE, { deck, register: 'official' })})
        </label>
        <label className="settings__option">
          <input
            type="radio"
            name="register"
            checked={register === 'colloquial'}
            onChange={() => updateSettings({ register: 'colloquial' })}
          />
          Potoczny (np. {resolveText(EXAMPLE, { deck, register: 'colloquial' })})
        </label>
      </fieldset>

      <fieldset className="settings__group">
        <legend>Postęp</legend>
        <label className="settings__option">
          <input type="checkbox" checked={unlockAll} onChange={(e) => updateSettings({ unlockAll: e.target.checked })} />
          Odblokuj wszystkie lekcje
        </label>
        <button type="button" className="button button--danger" onClick={handleReset}>
          Wyzeruj postęp
        </button>
        {resetDone && <p role="status">Postęp został wyzerowany.</p>}
      </fieldset>
    </div>
  );
}
