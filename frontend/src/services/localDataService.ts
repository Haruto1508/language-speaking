import topicsData from '../data/topics.json';
import vocabularyData from '../data/vocabulary.json';
import grammarData from '../data/grammar.json';
import scenariosData from '../data/scenarios.json';
import lessonsData from '../data/lessons.json';
import {
  Topic,
  Vocabulary,
  Grammar,
  ConversationScenario,
  ReviewItem,
  DashboardSummary,
  LanguageCode,
  ProficiencyLevelCode,
} from '../types';

const STORAGE_KEYS = {
  VOCAB_PROGRESS: 'linguatalk_vocab_progress',
  STUDY_STATS: 'linguatalk_study_stats',
  CUSTOM_SCENARIOS: 'duo_custom_scenarios',
};

// Local storage helpers
const getStoredVocabProgress = (): Record<number, string> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VOCAB_PROGRESS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveVocabProgress = (vocabId: number, status: string) => {
  try {
    const current = getStoredVocabProgress();
    current[vocabId] = status;
    localStorage.setItem(STORAGE_KEYS.VOCAB_PROGRESS, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to save vocab progress', e);
  }
};

export const localDataService = {
  // Topics
  getTopics: (language: LanguageCode, level?: ProficiencyLevelCode): Topic[] => {
    return (topicsData as unknown as Topic[]).filter((t) => {
      const matchLang = t.languageCode === language;
      const matchLevel = level ? t.levelCode === level : true;
      return matchLang && matchLevel;
    });
  },

  getTopicByCode: (code: string): Topic | undefined => {
    return (topicsData as unknown as Topic[]).find((t) => t.code === code);
  },

  // Vocabulary
  getVocabulary: (language: LanguageCode, search?: string): Vocabulary[] => {
    const storedProgress = getStoredVocabProgress();
    let list = (vocabularyData as unknown as Vocabulary[]).filter((v) => v.languageCode === language);

    // Merge saved progress
    list = list.map((v) => ({
      ...v,
      userStatus: (storedProgress[v.id] || v.userStatus || 'NEW') as Vocabulary['userStatus'],
    }));

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (v) =>
          v.word.toLowerCase().includes(q) ||
          v.meaning.toLowerCase().includes(q) ||
          (v.romanization && v.romanization.toLowerCase().includes(q))
      );
    }

    return list;
  },

  updateVocabStatus: (id: number, status: string) => {
    saveVocabProgress(id, status);
  },

  // Grammar
  getGrammar: (language: LanguageCode): Grammar[] => {
    return (grammarData as unknown as Grammar[]).filter((g) => g.languageCode === language);
  },

  // Scenarios
  getScenarios: (language: LanguageCode): ConversationScenario[] => {
    let custom: ConversationScenario[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_SCENARIOS);
      if (raw) custom = JSON.parse(raw);
    } catch {
      // ignore
    }

    const defaultItems = (scenariosData as ConversationScenario[]).filter((s) => s.languageCode === language);
    const matchingCustom = custom.filter((s) => s.languageCode === language);
    return [...matchingCustom, ...defaultItems];
  },

  // Lessons
  getLessonById: (id: number) => {
    return lessonsData.find((l) => l.id === id) || lessonsData[0];
  },

  // Reviews
  getDueReviews: (language: LanguageCode, limit = 10): ReviewItem[] => {
    const vocab = localDataService.getVocabulary(language);
    return vocab.slice(0, limit).map((v) => ({
      progressId: v.id,
      vocabularyId: v.id,
      word: v.word,
      meaning: v.meaning,
      partOfSpeech: v.partOfSpeech,
      pronunciationIpa: v.pronunciationIpa,
      exampleSentence: v.exampleSentence,
      translation: v.translation,
      hangul: v.hangul,
      romanization: v.romanization,
      status: v.userStatus || 'LEARNING',
      repetitions: 1,
      correctCount: 2,
      incorrectCount: 1,
      nextReviewAt: new Date().toISOString(),
    }));
  },

  // Dashboard Summary
  getDashboardSummary: (language: LanguageCode): DashboardSummary => {
    const vocab = localDataService.getVocabulary(language);
    const mastered = vocab.filter((v) => v.userStatus === 'MASTERED').length;
    const learning = vocab.filter((v) => v.userStatus === 'LEARNING' || v.userStatus === 'REVIEW').length;
    const grammar = localDataService.getGrammar(language);
    const isKo = language === 'KO';

    return {
      streakCount: 5,
      dailyGoalMinutes: 15,
      minutesStudiedToday: 12,
      vocabularyLearnedCount: learning + mastered || 14,
      vocabularyMasteredCount: mastered || 6,
      lessonsCompletedCount: 2,
      grammarPointsCount: grammar.length || 8,
      conversationsCompletedCount: 3,
      dueReviewsCount: 5,
      recentMistakes: isKo
        ? [
            {
              id: 1,
              type: 'GRAMMAR',
              originalText: '저기요! 김치찌개 주문합니다',
              correctedText: '저기요, 김치찌개 하나 주세요',
              explanation: 'Khi vào nhà hàng, hãy dùng "N + 하나 주세요" để gọi món thay vì dùng câu trần thuật "합니다".',
              reviewed: false,
              createdAt: new Date().toISOString(),
            },
          ]
        : [
            {
              id: 2,
              type: 'COLLOCATION',
              originalText: 'I want one coffee to take out',
              correctedText: 'Could I please get a coffee to go?',
              explanation: 'Dùng cụm "to go" tự nhiên hơn và thêm "Could I please get" để thể hiện sự lịch thiệp.',
              reviewed: false,
              createdAt: new Date().toISOString(),
            },
          ],
    };
  },
};
