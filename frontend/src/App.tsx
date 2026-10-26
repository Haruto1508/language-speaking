import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import { MainLayout } from './layouts/MainLayout';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { TopicsPage } from './pages/TopicsPage';
import { LessonPage } from './pages/LessonPage';
import { ConversationPage } from './pages/ConversationPage';
import { DuoLessonPage } from './pages/DuoLessonPage';
import { DuoChatPage } from './pages/DuoChatPage';
import { ReviewPage } from './pages/ReviewPage';
import { VocabularyPage } from './pages/VocabularyPage';
import { GrammarPage } from './pages/GrammarPage';
import { AdminPage } from './pages/AdminPage';
import { ApiKeyModal } from './components/ApiKeyModal';
import { ImportJsonModal } from './components/ImportJsonModal';
import { ScrollToTopButton } from './components/ScrollToTopButton';
import { useAppStore } from './stores/useAppStore';

export const App: React.FC = () => {
  const { themeMode } = useAppStore();
  const isDark = themeMode === 'dark';

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#58CC02',
          colorBgBase: isDark ? '#0D151A' : '#FFFFFF',
          colorTextBase: isDark ? '#FFFFFF' : '#0F172A',
          colorBorder: isDark ? '#24353E' : '#E2E8F0',
          borderRadius: 14,
          fontFamily: "'Be Vietnam Pro', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        },
      }}
    >
      <BrowserRouter>
        {/* Global Modals & Controls */}
        <ApiKeyModal />
        <ImportJsonModal />
        <ScrollToTopButton />

        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Dedicated Fullscreen Duolingo Style Pages */}
          <Route path="/learn" element={<DuoLessonPage />} />
          <Route path="/learn/:id" element={<DuoLessonPage />} />

          {/* Core App Shell */}
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/topics" element={<TopicsPage />} />
            <Route path="/lesson/:id" element={<DuoLessonPage />} />
            <Route path="/chat" element={<DuoChatPage />} />
            <Route path="/conversation" element={<DuoChatPage />} />
            <Route path="/review" element={<ReviewPage />} />
            <Route path="/vocabulary" element={<VocabularyPage />} />
            <Route path="/grammar" element={<GrammarPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;
