import { create } from 'zustand';
import { api } from '../services/api';
import { ConversationScenario, LanguageCode, ProficiencyLevelCode, User } from '../types';

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  targetLanguage: LanguageCode;
  targetLevel: ProficiencyLevelCode;
  isLangModalOpen: boolean;

  // Duolingo Gamification Stats
  hearts: number;
  gems: number;

  // API Key for Custom AI Communication Generation
  apiKey: string;
  apiProvider: 'gemini' | 'openai';
  isApiKeyModalOpen: boolean;

  // Theme Mode (Dark & Light)
  themeMode: 'dark' | 'light';
  toggleTheme: () => void;
  setThemeMode: (mode: 'dark' | 'light') => void;

  // Custom / Imported Scenarios from JSON or AI
  customScenarios: ConversationScenario[];
  isImportModalOpen: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setTargetLanguage: (lang: LanguageCode) => void;
  setTargetLevel: (level: ProficiencyLevelCode) => void;
  openLangModal: () => void;
  closeLangModal: () => void;

  setApiKey: (key: string, provider: 'gemini' | 'openai') => void;
  openApiKeyModal: () => void;
  closeApiKeyModal: () => void;

  openImportModal: () => void;
  closeImportModal: () => void;
  addCustomScenario: (scenario: ConversationScenario) => void;
  importScenariosFromJson: (jsonStr: string) => { success: boolean; count: number; error?: string };

  decrementHeart: () => void;
  refillHearts: () => void;
  fetchCurrentUser: () => Promise<void>;
  logout: () => void;
}

// Load initial custom scenarios from localStorage
const loadSavedScenarios = (): ConversationScenario[] => {
  try {
    const raw = localStorage.getItem('duo_custom_scenarios');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

// Initial theme setup
const savedTheme = (localStorage.getItem('duo_theme') as 'dark' | 'light') || 'dark';
if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('data-theme', savedTheme);
}

export const useAppStore = create<AppState>((set, get) => ({
  user: {
    id: 1,
    name: 'Thai Learner',
    email: 'learner@linguatalk.com',
    role: 'ROLE_USER',
    targetLanguage: 'KO',
    targetLevel: 'BEGINNER',
    streakCount: 5,
    dailyGoalMinutes: 15,
  },
  isAuthenticated: true,
  targetLanguage: (localStorage.getItem('linguatalk_target_lang') as LanguageCode) || 'KO',
  targetLevel: (localStorage.getItem('linguatalk_target_level') as ProficiencyLevelCode) || 'BEGINNER',
  isLangModalOpen: false,

  hearts: 5,
  gems: 450,

  themeMode: savedTheme,
  toggleTheme: () => {
    const next = get().themeMode === 'dark' ? 'light' : 'dark';
    localStorage.setItem('duo_theme', next);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', next);
    }
    set({ themeMode: next });
  },
  setThemeMode: (mode: 'dark' | 'light') => {
    localStorage.setItem('duo_theme', mode);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', mode);
    }
    set({ themeMode: mode });
  },

  apiKey: localStorage.getItem('duo_api_key') || '',
  apiProvider: (localStorage.getItem('duo_api_provider') as 'gemini' | 'openai') || 'gemini',
  isApiKeyModalOpen: false,

  customScenarios: loadSavedScenarios(),
  isImportModalOpen: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setTargetLanguage: (lang) => {
    localStorage.setItem('linguatalk_target_lang', lang);
    const currentUser = get().user;
    set({
      targetLanguage: lang,
      user: currentUser ? { ...currentUser, targetLanguage: lang } : null,
    });
  },

  setTargetLevel: (level) => {
    localStorage.setItem('linguatalk_target_level', level);
    set({ targetLevel: level });
  },

  openLangModal: () => set({ isLangModalOpen: true }),
  closeLangModal: () => set({ isLangModalOpen: false }),

  setApiKey: (key, provider) => {
    localStorage.setItem('duo_api_key', key);
    localStorage.setItem('duo_api_provider', provider);
    set({ apiKey: key, apiProvider: provider });
  },

  openApiKeyModal: () => set({ isApiKeyModalOpen: true }),
  closeApiKeyModal: () => set({ isApiKeyModalOpen: false }),

  openImportModal: () => set({ isImportModalOpen: true }),
  closeImportModal: () => set({ isImportModalOpen: false }),

  addCustomScenario: (scenario) => {
    const updated = [scenario, ...get().customScenarios];
    localStorage.setItem('duo_custom_scenarios', JSON.stringify(updated));
    set({ customScenarios: updated });
  },

  importScenariosFromJson: (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      const items: ConversationScenario[] = Array.isArray(parsed) ? parsed : [parsed];

      // Validate required properties
      for (const item of items) {
        if (!item.title || !item.userRole || !item.aiRole || !item.initialGreeting) {
          return {
            success: false,
            count: 0,
            error: 'Mỗi hội thoại cần có đủ: title, userRole, aiRole, initialGreeting',
          };
        }
        if (!item.id) {
          item.id = Date.now() + Math.floor(Math.random() * 10000);
        }
        if (!item.languageCode) {
          item.languageCode = get().targetLanguage;
        }
        if (!item.levelCode) {
          item.levelCode = get().targetLevel;
        }
      }

      const merged = [...items, ...get().customScenarios];
      localStorage.setItem('duo_custom_scenarios', JSON.stringify(merged));
      set({ customScenarios: merged });
      return { success: true, count: items.length };
    } catch (err: any) {
      return { success: false, count: 0, error: err.message || 'JSON không hợp lệ' };
    }
  },

  decrementHeart: () => set((state) => ({ hearts: Math.max(0, state.hearts - 1) })),
  refillHearts: () => set({ hearts: 5 }),

  fetchCurrentUser: async () => {
    try {
      const user = await api.auth.me();
      if (user) {
        set({
          user,
          isAuthenticated: true,
          targetLanguage: user.targetLanguage || 'KO',
          targetLevel: user.targetLevel || 'BEGINNER',
        });
      }
    } catch (e) {
      // Keep demo user
    }
  },

  logout: () => {
    api.auth.logout();
    set({ user: null, isAuthenticated: false });
  },
}));
