// Korean - Beginner
import koBeginnerTopics from '../data/korean/beginner/topics.json';
import koBeginnerVocab from '../data/korean/beginner/vocabulary.json';
import koBeginnerGrammar from '../data/korean/beginner/grammar.json';
import koBeginnerLessons from '../data/korean/beginner/lessons.json';
import koBeginnerScenarios from '../data/korean/beginner/scenarios.json';

// Korean - Elementary
import koElemTopics from '../data/korean/elementary/topics.json';
import koElemVocab from '../data/korean/elementary/vocabulary.json';
import koElemGrammar from '../data/korean/elementary/grammar.json';
import koElemLessons from '../data/korean/elementary/lessons.json';
import koElemScenarios from '../data/korean/elementary/scenarios.json';

// English - Beginner
import enBeginnerTopics from '../data/english/beginner/topics.json';
import enBeginnerVocab from '../data/english/beginner/vocabulary.json';
import enBeginnerGrammar from '../data/english/beginner/grammar.json';
import enBeginnerLessons from '../data/english/beginner/lessons.json';
import enBeginnerScenarios from '../data/english/beginner/scenarios.json';

// English - Intermediate
import enInterTopics from '../data/english/intermediate/topics.json';
import enInterVocab from '../data/english/intermediate/vocabulary.json';
import enInterGrammar from '../data/english/intermediate/grammar.json';
import enInterLessons from '../data/english/intermediate/lessons.json';
import enInterScenarios from '../data/english/intermediate/scenarios.json';

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

export interface LessonStep {
  type: string;
  title: string;
  instruction: string;
  prompt: string;
  romanization?: string;
  audioText?: string;
  tiles?: string[];
  correctTiles?: string[];
  options?: Array<{ id: string; text: string; correct: boolean }>;
  pairs?: Array<{ id: string; left: string; right: string }>;
}

export interface LocalLesson {
  id: number;
  languageCode: string;
  topicCode: string;
  title: string;
  levelCode: string;
  steps: LessonStep[];
}

interface LevelDataset {
  topics: Topic[];
  vocabulary: Vocabulary[];
  grammar: Grammar[];
  lessons: LocalLesson[];
  scenarios: ConversationScenario[];
}

// Organized strictly by Language and Proficiency Level
const dataset: Record<LanguageCode, Partial<Record<ProficiencyLevelCode, LevelDataset>>> = {
  KO: {
    BEGINNER: {
      topics: koBeginnerTopics as unknown as Topic[],
      vocabulary: koBeginnerVocab as unknown as Vocabulary[],
      grammar: koBeginnerGrammar as unknown as Grammar[],
      lessons: koBeginnerLessons as unknown as LocalLesson[],
      scenarios: koBeginnerScenarios as unknown as ConversationScenario[],
    },
    ELEMENTARY: {
      topics: koElemTopics as unknown as Topic[],
      vocabulary: koElemVocab as unknown as Vocabulary[],
      grammar: koElemGrammar as unknown as Grammar[],
      lessons: koElemLessons as unknown as LocalLesson[],
      scenarios: koElemScenarios as unknown as ConversationScenario[],
    },
  },
  EN: {
    BEGINNER: {
      topics: enBeginnerTopics as unknown as Topic[],
      vocabulary: enBeginnerVocab as unknown as Vocabulary[],
      grammar: enBeginnerGrammar as unknown as Grammar[],
      lessons: enBeginnerLessons as unknown as LocalLesson[],
      scenarios: enBeginnerScenarios as unknown as ConversationScenario[],
    },
    INTERMEDIATE: {
      topics: enInterTopics as unknown as Topic[],
      vocabulary: enInterVocab as unknown as Vocabulary[],
      grammar: enInterGrammar as unknown as Grammar[],
      lessons: enInterLessons as unknown as LocalLesson[],
      scenarios: enInterScenarios as unknown as ConversationScenario[],
    },
  },
};

const getLanguageLevels = (language: LanguageCode): LevelDataset[] => {
  const langData = dataset[language] || {};
  return Object.values(langData) as LevelDataset[];
};

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
  // Topics (separated by Language and Level)
  getTopics: (language: LanguageCode, level?: ProficiencyLevelCode): Topic[] => {
    let rawTopics: Topic[];
    if (level && dataset[language]?.[level]) {
      rawTopics = dataset[language][level]!.topics;
    } else {
      const levels = getLanguageLevels(language);
      const all = levels.flatMap((l) => l.topics);
      rawTopics = level ? all.filter((t) => t.levelCode === level) : all;
    }

    const allLessons = getLanguageLevels(language).flatMap((l) => l.lessons);
    return rawTopics.map((t) => {
      const topicLessons = allLessons
        .filter((les) => les.topicCode === t.code)
        .map((les) => ({
          id: les.id,
          topicId: t.id,
          topicName: t.name,
          title: les.title,
          scenario: '',
          description: '',
          difficulty: (t.levelCode || 'BEGINNER') as ProficiencyLevelCode,
          status: 'PUBLISHED' as const,
          orderIndex: les.id,
          vocabularyCount: 0,
          grammarCount: 0,
          exercisesCount: les.steps?.length || 0,
        }));
      return {
        ...t,
        lessons: topicLessons.length > 0 ? topicLessons : t.lessons,
        totalLessons: topicLessons.length || t.totalLessons || 0,
      };
    });
  },

  getTopicByCode: (code: string): Topic | undefined => {
    const all = [
      ...getLanguageLevels('KO').flatMap((l) => l.topics),
      ...getLanguageLevels('EN').flatMap((l) => l.topics),
    ];
    return all.find((t) => t.code === code);
  },

  // Vocabulary (separated by Language and Level)
  getVocabulary: (language: LanguageCode, search?: string, level?: ProficiencyLevelCode): Vocabulary[] => {
    const storedProgress = getStoredVocabProgress();
    let source: Vocabulary[];
    if (level && dataset[language]?.[level]) {
      source = dataset[language][level]!.vocabulary;
    } else {
      const levels = getLanguageLevels(language);
      source = levels.flatMap((l) => l.vocabulary);
      if (level) {
        source = source.filter((v) => v.levelCode === level);
      }
    }

    let list = source.map((v) => ({
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

  // Grammar (separated by Language and Level)
  getGrammar: (language: LanguageCode, level?: ProficiencyLevelCode): Grammar[] => {
    if (level && dataset[language]?.[level]) {
      return dataset[language][level]!.grammar;
    }
    const levels = getLanguageLevels(language);
    const all = levels.flatMap((l) => l.grammar);
    return level ? all.filter((g) => g.levelCode === level) : all;
  },

  // Scenarios (separated by Language and Level)
  getScenarios: (language: LanguageCode, level?: ProficiencyLevelCode): ConversationScenario[] => {
    let custom: ConversationScenario[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_SCENARIOS);
      if (raw) custom = JSON.parse(raw);
    } catch {
      // ignore
    }

    let defaultItems: ConversationScenario[];
    if (level && dataset[language]?.[level]) {
      defaultItems = dataset[language][level]!.scenarios;
    } else {
      const levels = getLanguageLevels(language);
      defaultItems = levels.flatMap((l) => l.scenarios);
      if (level) {
        defaultItems = defaultItems.filter((s) => s.levelCode === level);
      }
    }

    const matchingCustom = custom.filter((s) => s.languageCode === language && (!level || s.levelCode === level));
    return [...matchingCustom, ...defaultItems];
  },

  // Lessons (separated by Language and Level)
  getLessonById: (id: number) => {
    const all = [
      ...getLanguageLevels('KO').flatMap((l) => l.lessons),
      ...getLanguageLevels('EN').flatMap((l) => l.lessons),
    ];
    return all.find((l) => l.id === id) || all[0];
  },

  getLessonsByLanguage: (language: LanguageCode, level?: ProficiencyLevelCode) => {
    if (level && dataset[language]?.[level]) {
      return dataset[language][level]!.lessons;
    }
    const levels = getLanguageLevels(language);
    return levels.flatMap((l) => l.lessons);
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
