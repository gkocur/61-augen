// src/ui/NotFound.tsx
import { Link } from 'react-router-dom';

export function NotFound({ message = 'Nie ma takiej strony.' }: { message?: string }) {
  return (
    <div className="not-found">
      <p>{message}</p>
      <Link className="button" to="/">
        Mapa kursu
      </Link>
    </div>
  );
}
