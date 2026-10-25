import axios from 'axios';
import {
  ConversationFeedback,
  ConversationScenario,
  ConversationSession,
  DashboardSummary,
  Grammar,
  Language,
  LessonDetail,
  LessonSummary,
  ProficiencyLevelCode,
  ProficiencyLevelInfo,
  ReviewItem,
  Topic,
  User,
  Vocabulary,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Attach JWT token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('linguatalk_jwt');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Auth
  auth: {
    login: async (email: string, password: string) => {
      const res = await apiClient.post<{ token: string; user: User }>('/auth/login', {
        email,
        password,
      });
      if (res.data.token) {
        localStorage.setItem('linguatalk_jwt', res.data.token);
      }
      return res.data;
    },
    register: async (name: string, email: string, password: string, targetLanguage = 'KO', targetLevel = 'BEGINNER') => {
      const res = await apiClient.post<{ token: string; user: User }>('/auth/register', {
        name,
        email,
        password,
        targetLanguage,
        targetLevel,
      });
      if (res.data.token) {
        localStorage.setItem('linguatalk_jwt', res.data.token);
      }
      return res.data;
    },
    me: async () => {
      const res = await apiClient.get<User>('/auth/me');
      return res.data;
    },
    logout: () => {
      localStorage.removeItem('linguatalk_jwt');
    },
  },

  // Languages & Levels
  languages: {
    getAll: async () => {
      const res = await apiClient.get<Language[]>('/languages');
      return res.data;
    },
    getLevels: async () => {
      const res = await apiClient.get<ProficiencyLevelInfo[]>('/levels');
      return res.data;
    },
  },

  // Topics
  topics: {
    getAll: async (language: string, level?: string) => {
      const res = await apiClient.get<Topic[]>('/topics', {
        params: { language, level },
      });
      return res.data;
    },
    getByCode: async (code: string) => {
      const res = await apiClient.get<Topic>(`/topics/${code}`);
      return res.data;
    },
  },

  // Lessons
  lessons: {
    getByTopic: async (topicId: number) => {
      const res = await apiClient.get<LessonSummary[]>('/lessons', {
        params: { topicId },
      });
      return res.data;
    },
    getById: async (id: number) => {
      const res = await apiClient.get<LessonDetail>(`/lessons/${id}`);
      return res.data;
    },
  },

  // Vocabulary & Grammar
  vocabulary: {
    getAll: async (language?: string) => {
      const res = await apiClient.get<Vocabulary[]>('/vocabulary', {
        params: { language },
      });
      return res.data;
    },
  },
  grammar: {
    getAll: async (language?: string) => {
      const res = await apiClient.get<Grammar[]>('/grammar', {
        params: { language },
      });
      return res.data;
    },
  },

  // AI Conversations
  conversations: {
    getScenarios: async (language?: string, level?: string) => {
      const res = await apiClient.get<ConversationScenario[]>('/conversations/scenarios', {
        params: { language, level },
      });
      return res.data;
    },
    getScenarioById: async (id: number) => {
      const res = await apiClient.get<ConversationScenario>(`/conversations/scenarios/${id}`);
      return res.data;
    },
    startSession: async (scenarioId: number) => {
      const res = await apiClient.post<ConversationSession>('/conversations/start', { scenarioId });
      return res.data;
    },
    reply: async (sessionId: number, message: string) => {
      const res = await apiClient.post<ConversationSession>('/conversations/reply', {
        sessionId,
        message,
      });
      return res.data;
    },
    complete: async (sessionId: number) => {
      const res = await apiClient.post<ConversationFeedback>(`/conversations/complete/${sessionId}`);
      return res.data;
    },
    getSession: async (sessionId: number) => {
      const res = await apiClient.get<ConversationSession>(`/conversations/session/${sessionId}`);
      return res.data;
    },
  },

  // Progress & Dashboard
  progress: {
    getDashboard: async () => {
      const res = await apiClient.get<DashboardSummary>('/progress/dashboard');
      return res.data;
    },
    completeLesson: async (lessonId: number, score: number, timeSpentSeconds: number) => {
      const res = await apiClient.post<{ success: boolean; message: string }>('/progress/complete-lesson', {
        lessonId,
        score,
        timeSpentSeconds,
      });
      return res.data;
    },
  },

  // Spaced Repetition Reviews
  reviews: {
    getDue: async (limit = 10) => {
      const res = await apiClient.get<ReviewItem[]>('/reviews/due', {
        params: { limit },
      });
      return res.data;
    },
    submit: async (vocabularyId: number, rating: number) => {
      const res = await apiClient.post<ReviewItem>('/reviews/submit', {
        vocabularyId,
        rating,
      });
      return res.data;
    },
  },

  // Admin
  admin: {
    getLessons: async (status?: string) => {
      const res = await apiClient.get<LessonSummary[]>('/admin/lessons', {
        params: { status },
      });
      return res.data;
    },
    generateLesson: async (payload: {
      topicId: number;
      title: string;
      scenario: string;
      difficulty: ProficiencyLevelCode;
      learningObjectives?: string;
    }) => {
      const res = await apiClient.post<LessonDetail>('/admin/generate-lesson', payload);
      return res.data;
    },
    updateLessonStatus: async (lessonId: number, status: string) => {
      const res = await apiClient.patch<LessonSummary>(`/admin/lessons/${lessonId}/status`, { status });
      return res.data;
    },
    ingestContent: async (payload: {
      languageCode: string;
      levelCode: string;
      topicTitle: string;
      rawSourceText: string;
    }) => {
      const res = await apiClient.post<LessonDetail>('/admin/ingest', payload);
      return res.data;
    },
  },
};
