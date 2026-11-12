// src/ui/App.tsx
import type { ReactNode } from 'react';
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AppStateProvider } from '../state/AppStateContext';
import { AboutCardsPage } from './AboutCardsPage';
import { CourseMap } from './CourseMap';
import { ErrorBoundary } from './ErrorBoundary';
import { GlossaryPage } from './GlossaryPage';
import { Layout } from './Layout';
import { LessonRoute } from './LessonPage';
import { NotFound } from './NotFound';
import { SettingsPage } from './SettingsPage';

function RouteErrorBoundary({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return <ErrorBoundary key={pathname}>{children}</ErrorBoundary>;
}

export function AppRoutes() {
  return (
    <Layout>
      <RouteErrorBoundary>
        <Routes>
          <Route path="/" element={<CourseMap />} />
          <Route path="/lekcja/:lessonId" element={<LessonRoute />} />
          <Route path="/ustawienia" element={<SettingsPage />} />
          <Route path="/slowniczek" element={<GlossaryPage />} />
          <Route path="/o-kartach" element={<AboutCardsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </RouteErrorBoundary>
    </Layout>
  );
}

export function App() {
  return (
    <AppStateProvider>
      <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppRoutes />
      </HashRouter>
    </AppStateProvider>
  );
}
