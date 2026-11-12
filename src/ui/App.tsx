// src/ui/App.tsx
import { HashRouter, Route, Routes } from 'react-router-dom';
import { AppStateProvider } from '../state/AppStateContext';
import { CourseMap } from './CourseMap';
import { ErrorBoundary } from './ErrorBoundary';
import { GlossaryPage } from './GlossaryPage';
import { Layout } from './Layout';
import { LessonRoute } from './LessonPage';
import { NotFound } from './NotFound';
import { SettingsPage } from './SettingsPage';

export function AppRoutes() {
  return (
    <Layout>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<CourseMap />} />
          <Route path="/lekcja/:lessonId" element={<LessonRoute />} />
          <Route path="/ustawienia" element={<SettingsPage />} />
          <Route path="/slowniczek" element={<GlossaryPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ErrorBoundary>
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
