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

export const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#58CC02',
          colorBgBase: '#131F24',
          colorTextBase: '#FFFFFF',
          borderRadius: 12,
          fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
        },
      }}
    >
      <BrowserRouter>
        {/* Global Modals for AI API Key & Scenario Generator, and JSON Scenario Importer */}
        <ApiKeyModal />
        <ImportJsonModal />

        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Dedicated Fullscreen Duolingo Style Pages */}
          <Route path="/learn" element={<DuoLessonPage />} />
          <Route path="/learn/:id" element={<DuoLessonPage />} />
          <Route path="/chat" element={<DuoChatPage />} />

          {/* Core App Shell */}
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/topics" element={<TopicsPage />} />
            <Route path="/lesson/:id" element={<DuoLessonPage />} />
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
