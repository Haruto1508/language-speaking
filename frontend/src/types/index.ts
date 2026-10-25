export type LanguageCode = 'KO' | 'EN';

export type ProficiencyLevelCode =
  | 'BEGINNER'
  | 'ELEMENTARY'
  | 'INTERMEDIATE'
  | 'UPPER_INTERMEDIATE'
  | 'ADVANCED';

export type ContentStatus =
  | 'DRAFT'
  | 'AI_GENERATED'
  | 'REVIEWING'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'ARCHIVED';

export type VocabularyStatus = 'NEW' | 'LEARNING' | 'REVIEW' | 'MASTERED';

export type ExerciseType =
  | 'MULTIPLE_CHOICE'
  | 'FILL_IN_BLANK'
  | 'MATCHING'
  | 'SENTENCE_ORDERING'
  | 'TRANSLATION'
  | 'LISTENING'
  | 'SPEAKING'
  | 'GRAMMAR_CORRECTION';

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  targetLanguage: LanguageCode;
  targetLevel: ProficiencyLevelCode;
  streakCount: number;
  dailyGoalMinutes: number;
}

export interface Language {
  id: number;
  code: LanguageCode;
  name: string;
  nativeName: string;
  flagEmoji: string;
}

export interface ProficiencyLevelInfo {
  code: ProficiencyLevelCode;
  name: string;
  cefr: string;
  topik: string;
  description: string;
}

export interface Topic {
  id: number;
  languageCode: LanguageCode;
  levelCode: ProficiencyLevelCode;
  code: string;
  name: string;
  description: string;
  icon: string;
  estimatedMinutes: number;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  lessons?: LessonSummary[];
}

export interface LessonSummary {
  id: number;
  topicId: number;
  topicName: string;
  title: string;
  scenario: string;
  description: string;
  difficulty: ProficiencyLevelCode;
  status: ContentStatus;
  orderIndex: number;
  completed?: boolean;
  score?: number;
  vocabularyCount: number;
  grammarCount: number;
  exercisesCount: number;
}

export interface HangulBreakdown {
  morphemes?: Array<{ part: string; meaning: string }>;
  base?: string;
  verb?: string;
  affix?: string;
  suffix?: string;
  meaning?: string;
  components?: string[];
}

export interface Vocabulary {
  id: number;
  lessonId?: number;
  word: string;
  meaning: string;
  partOfSpeech: string;
  pronunciationIpa?: string;
  exampleSentence?: string;
  translation?: string;
  difficulty?: string;
  relatedWords?: string;
  collocations?: string;
  hangul?: string;
  romanization?: string;
  batchimRules?: string;
  soundChanges?: string;
  breakdownJson?: string;
  userStatus?: VocabularyStatus;
  correctCount?: number;
  incorrectCount?: number;
}

export interface Grammar {
  id: number;
  lessonId?: number;
  grammarPoint: string;
  explanation: string;
  usageGuide?: string;
  structureFormula?: string;
  commonMistakes?: string;
  formalityLevel?: string;
  koreanPattern?: string;
  exampleConversationsJson?: string;
}

export interface DialogueLine {
  id: number;
  speakerName: string;
  speakerRole: string;
  textOriginal: string;
  textRomanized?: string;
  textTranslation: string;
  audioUrl?: string;
  orderIndex: number;
}

export interface Dialogue {
  id: number;
  lessonId: number;
  title: string;
  contextDescription: string;
  userRole: string;
  partnerRole: string;
  lines: DialogueLine[];
}

export interface ExerciseQuestion {
  id: number;
  prompt: string;
  audioUrl?: string;
  optionsJson?: string;
  correctAnswer: string;
  explanation?: string;
  orderIndex: number;
}

export interface Exercise {
  id: number;
  lessonId: number;
  title: string;
  type: ExerciseType;
  questions: ExerciseQuestion[];
}

export interface ConversationScenario {
  id: number;
  lessonId?: number;
  topicCode: string;
  languageCode: LanguageCode;
  levelCode: ProficiencyLevelCode;
  title: string;
  description: string;
  userRole: string;
  aiRole: string;
  initialGreeting: string;
  culturalContext?: string;
}

export interface LessonDetail {
  id: number;
  topicId: number;
  topicName: string;
  languageCode: LanguageCode;
  title: string;
  scenario: string;
  description: string;
  difficulty: ProficiencyLevelCode;
  status: ContentStatus;
  learningObjectives?: string;
  culturalNotes?: string;
  formalityExplanation?: string;
  orderIndex: number;
  completed?: boolean;
  score?: number;
  vocabulary: Vocabulary[];
  grammar: Grammar[];
  dialogues: Dialogue[];
  exercises: Exercise[];
  scenarios: ConversationScenario[];
}

export interface ConversationMessage {
  id?: number;
  senderRole: 'USER' | 'AI';
  content: string;
  timestamp?: string;
  grammarFeedback?: string;
  suggestedAlternative?: string;
}

export interface ConversationSession {
  id: number;
  scenario: ConversationScenario;
  status: 'ACTIVE' | 'COMPLETED';
  startedAt: string;
  completedAt?: string;
  overallScore?: number;
  fluencyScore?: number;
  grammarScore?: number;
  vocabularyScore?: number;
  feedbackSummary?: string;
  naturalExpressionsJson?: string;
  mistakesJson?: string;
  messages: ConversationMessage[];
}

export interface ConversationFeedback {
  sessionId: number;
  overallScore: number;
  fluencyScore: number;
  grammarScore: number;
  vocabularyScore: number;
  feedbackSummary: string;
  grammarMistakes: string[];
  vocabularyMistakes: string[];
  moreNaturalExpressions: string[];
  usefulVocabulary: string[];
  suggestedAlternativeSentences: string[];
}

export interface Mistake {
  id: number;
  type: string;
  originalText: string;
  correctedText: string;
  explanation: string;
  reviewed: boolean;
  createdAt: string;
}

export interface DashboardSummary {
  streakCount: number;
  dailyGoalMinutes: number;
  minutesStudiedToday: number;
  vocabularyLearnedCount: number;
  vocabularyMasteredCount: number;
  lessonsCompletedCount: number;
  grammarPointsCount: number;
  conversationsCompletedCount: number;
  dueReviewsCount: number;
  recommendedLesson?: LessonSummary;
  recentMistakes: Mistake[];
}

export interface ReviewItem {
  progressId: number;
  vocabularyId: number;
  word: string;
  meaning: string;
  partOfSpeech: string;
  pronunciationIpa?: string;
  exampleSentence?: string;
  translation?: string;
  hangul?: string;
  romanization?: string;
  status: VocabularyStatus;
  repetitions: number;
  correctCount: number;
  incorrectCount: number;
  nextReviewAt: string;
}

export const LEVEL_LABELS_VI: Record<ProficiencyLevelCode, string> = {
  BEGINNER: 'Mới bắt đầu (A1)',
  ELEMENTARY: 'Sơ cấp (A2)',
  INTERMEDIATE: 'Trung cấp (B1)',
  UPPER_INTERMEDIATE: 'Trung cấp nâng cao (B2)',
  ADVANCED: 'Cao cấp (C1)',
};

export const formatLevelVietnamese = (level?: string): string => {
  if (!level) return '';
  switch (level) {
    case 'BEGINNER':
      return 'Mới bắt đầu';
    case 'ELEMENTARY':
      return 'Sơ cấp';
    case 'INTERMEDIATE':
      return 'Trung cấp';
    case 'UPPER_INTERMEDIATE':
      return 'Trung cấp nâng cao';
    case 'ADVANCED':
      return 'Cao cấp';
    default:
      return level.replace('_', ' ');
  }
};

