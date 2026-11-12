// src/ui/ErrorBoundary.tsx
import { Component, type ReactNode } from 'react';

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error(error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="error-screen">
          <h1>Coś poszło nie tak</h1>
          <p>Twój postęp jest bezpieczny.</p>
          <a href="#/" className="button" onClick={() => this.setState({ error: null })}>
            Wróć do mapy kursu
          </a>
        </div>
      );
    }
    return this.props.children;
  }
}
