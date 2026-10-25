import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Tabs,
  Tag,
  Button,
  Space,
  Spin,
  Typography,
  Radio,
  Progress,
  Modal,
  Card,
  Input,
  message,
  Tooltip,
} from 'antd';
import confetti from 'canvas-confetti';
import {
  BookOpen,
  Volume2,
  Mic,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  MessageSquare,
  Award,
  Layers,
  HelpCircle,
  Play,
  Pause,
} from 'lucide-react';
import { api } from '../services/api';
import { useAppStore } from '../stores/useAppStore';
import { LessonDetail, Vocabulary, Grammar, Dialogue, Exercise } from '../types';
import { speakText, recordSpeech } from '../utils/speech';

export const LessonPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { targetLanguage } = useAppStore();

  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('vocab');

  // Exercise state
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [exerciseSubmitted, setExerciseSubmitted] = useState(false);
  const [exerciseScore, setExerciseScore] = useState(0);

  // Pronunciation practice state
  const [isRecording, setIsRecording] = useState(false);
  const [pronunciationResult, setPronunciationResult] = useState<{ transcript: string; accuracy: number } | null>(null);
  const [selectedPronounceSentence, setSelectedPronounceSentence] = useState<string>('');

  // Audio playing indicator
  const [playingText, setPlayingText] = useState<string | null>(null);

  // Lesson completion modal
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);

  useEffect(() => {
    fetchLessonData();
  }, [id, targetLanguage]);

  const fetchLessonData = async () => {
    try {
      setLoading(true);
      const lessonId = id ? parseInt(id, 10) : 1;
      const data = await api.lessons.getById(lessonId);
      setLesson(data);
      if (data.vocabulary && data.vocabulary.length > 0) {
        setSelectedPronounceSentence(data.vocabulary[0].exampleSentence || data.vocabulary[0].word);
      }
    } catch (e) {
      console.warn('Failed to load lesson from API, loading rich mock lesson', e);
      // Fallback fallback rich lesson
      const isKo = targetLanguage === 'KO';
      const mockLesson: LessonDetail = {
        id: isKo ? 1 : 2,
        topicId: isKo ? 1 : 5,
        topicName: isKo ? 'Restaurant & Dining' : 'Specialty Coffee Shop',
        languageCode: isKo ? 'KO' : 'EN',
        title: isKo ? 'Ordering at a Korean Restaurant (식당에서 주문하기)' : 'Ordering at a Specialty Coffee Shop',
        scenario: isKo ? 'Order stew, ask for water/side dish refills, and pay politely with card.' : 'Custom coffee orders, bean roast profiles, and contactless card payment.',
        description: isKo ? 'Master the polite imperative -(으)세요, calling staff with 저기요, and dining customs.' : 'Polite modal requests (Could I please get), milk substitutions, and roast styles.',
        difficulty: isKo ? 'BEGINNER' : 'INTERMEDIATE',
        status: 'PUBLISHED',
        learningObjectives: isKo ? '1. Use 저기요 and 주세요 accurately.\n2. Conjugate V + -(으)세요.\n3. Request side dish refills and the bill.' : '1. Form polite requests with modals.\n2. Navigate milk substitutions and roast profiles.\n3. Complete takeaway inquiries.',
        culturalNotes: isKo ? 'In Korea, side dishes (반찬) and water are complimentary and usually refillable. Press the call bell or say "저기요!" to call staff.' : 'In artisan cafes, customization is standard. Tipping 15-20% on card payment is customary in North America.',
        formalityExplanation: isKo ? 'Focuses on Standard Polite Speech (해요체), which is respectful and suitable for service encounters.' : 'Friendly polite conversational register using modal hedging and contractions.',
        orderIndex: 1,
        vocabulary: isKo ? [
          {
            id: 1,
            word: '안녕하세요',
            meaning: 'Hello / Good day / Good afternoon',
            partOfSpeech: 'Expression',
            pronunciationIpa: '[aɲ.ɲʌŋ.ɦa.se.jo]',
            exampleSentence: '안녕하세요! 두 명 자리 있나요?',
            translation: 'Hello! Do you have a table for two?',
            difficulty: 'Beginner',
            collocations: '안녕하세요, 반갑습니다',
            hangul: '안녕하세요',
            romanization: 'annyeonghaseyo',
            batchimRules: 'ㅇ batchim in 안 / 녕 has soft nasal resonance [ŋ]',
            soundChanges: 'ㅎ in 하 is smoothly connected in rapid speech',
            breakdownJson: '{"morphemes": [{"part": "안녕", "meaning": "wellness/peace"}, {"part": "하(다)", "meaning": "to do"}, {"part": "-세요", "meaning": "honorific polite ending"}]}',
          },
          {
            id: 2,
            word: '김치찌개',
            meaning: 'Kimchi Stew (classic spicy Korean stew made with aged kimchi and pork/tofu)',
            partOfSpeech: 'Noun',
            pronunciationIpa: '[kim.tɕʰi.tɕ͈i.ɡɛ]',
            exampleSentence: '저희 김치찌개 2인분 주세요.',
            translation: 'Please give us two servings of kimchi stew.',
            difficulty: 'Beginner',
            collocations: '김치찌개 1인분, 김치찌개 맛집',
            hangul: '김치찌개',
            romanization: 'gimchijjigae',
            batchimRules: 'ㅁ batchim in 김 followed by tense ㅊ',
            soundChanges: 'Tense double consonant 찌 pronounced with crisp glottal tension',
            breakdownJson: '{"morphemes": [{"part": "김치", "meaning": "fermented kimchi"}, {"part": "찌개", "meaning": "stew"}]}',
          },
          {
            id: 3,
            word: '주세요',
            meaning: 'Please give me / Please bring me',
            partOfSpeech: 'Verb phrase',
            pronunciationIpa: '[tɕu.se.jo]',
            exampleSentence: '물 좀 더 주세요.',
            translation: 'Please give me some more water.',
            difficulty: 'Beginner',
            collocations: '메뉴판 주세요, 영수증 주세요',
            hangul: '주세요',
            romanization: 'juseyo',
            batchimRules: 'Open vowels, melodic polite intonation',
            soundChanges: 'Standard polite pronunciation',
            breakdownJson: '{"morphemes": [{"part": "주(다)", "meaning": "give"}, {"part": "-(으)시-", "meaning": "honorific"}, {"part": "-어요", "meaning": "polite ending"}]}',
          },
          {
            id: 4,
            word: '저기요',
            meaning: 'Excuse me! / Over here! (Calling restaurant staff)',
            partOfSpeech: 'Interjection',
            pronunciationIpa: '[tɕʌ.ɡi.jo]',
            exampleSentence: '저기요, 주문할게요!',
            translation: 'Excuse me, we are ready to order!',
            difficulty: 'Beginner',
            collocations: '저기요, 주문받아 주세요',
            hangul: '저기요',
            romanization: 'jeogiyo',
            batchimRules: 'No final consonant batchim',
            soundChanges: 'Standard clear projection',
            breakdownJson: '{"morphemes": [{"part": "저기", "meaning": "over there"}, {"part": "-요", "meaning": "polite marker"}]}',
          },
          {
            id: 5,
            word: '계산하다',
            meaning: 'To pay / settle the bill / calculate',
            partOfSpeech: 'Verb',
            pronunciationIpa: '[kʲeː.san.ɦa.da]',
            exampleSentence: '계산은 카드로 할게요.',
            translation: 'I will pay by card.',
            difficulty: 'Beginner',
            collocations: '계산서, 계산해 주세요',
            hangul: '계산하다',
            romanization: 'gyesanhada',
            batchimRules: 'ㄴ batchim in 산 pronounced as dental nasal [n]',
            soundChanges: 'Connected speech shifts to [계사나다]',
            breakdownJson: '{"morphemes": [{"part": "계산 (計算)", "meaning": "reckoning"}, {"part": "-하다", "meaning": "to do"}]}',
          },
        ] : [
          {
            id: 6,
            word: 'single-origin',
            meaning: 'Coffee beans sourced exclusively from one single producer, crop, or geographic region',
            partOfSpeech: 'Adjective',
            pronunciationIpa: '/ˌsɪŋ.ɡəl ˈɔːr.ɪ.dʒɪn/',
            exampleSentence: 'What single-origin beans do you have on pour-over today?',
            translation: 'Hôm nay quán có loại hạt cà phê đơn nguồn gốc nào cho pha pour-over vậy?',
            difficulty: 'Intermediate',
            collocations: 'single-origin espresso, single-origin roast',
          },
          {
            id: 7,
            word: 'oat milk',
            meaning: 'A creamy plant-based milk alternative crafted from whole oats',
            partOfSpeech: 'Noun phrase',
            pronunciationIpa: '/ˈoʊt ˌmɪlk/',
            exampleSentence: 'Could I get an iced latte with oat milk instead of whole milk?',
            translation: 'Tôi có thể lấy một ly latte đá với sữa yến mạch thay vì sữa tươi không?',
            difficulty: 'Beginner',
            collocations: 'substitute oat milk, oat milk flat white',
          },
          {
            id: 8,
            word: 'for here or to go',
            meaning: 'Standard cashier question checking if you will drink on premise or take away',
            partOfSpeech: 'Idiomatic phrase',
            pronunciationIpa: '/fɔːr hɪr ɔːr tuː ɡoʊ/',
            exampleSentence: 'Will that be for here or to go today?',
            translation: 'Bạn dùng ở đây hay mang đi ạ?',
            difficulty: 'Beginner',
            collocations: 'make that to go, drink for here',
          },
        ],
        grammar: isKo ? [
          {
            id: 1,
            grammarPoint: 'V + -(으)세요 (Polite Imperative / Courtesy Request)',
            explanation: 'Used to politely request or instruct someone to take an action in daily social interactions.',
            usageGuide: '1. If verb stem ends in a vowel, attach -세요 (가다 -> 가세요).\n2. If verb stem ends in a consonant (batchim), attach -으세요 (앉다 -> 앉으세요).',
            structureFormula: 'Verb Stem + -(으)세요',
            commonMistakes: 'Never use -(으)세요 for your own actions. It is strictly for addressing the listener.',
            formalityLevel: '존댓말 / 해요체 (Standard Polite)',
            koreanPattern: 'V + -(으)세요',
            exampleConversationsJson: '[{"speaker": "직원", "text": "편하신 자리에 앉으세요.", "translation": "Please sit in any comfortable seat."}]',
          },
        ] : [
          {
            id: 2,
            grammarPoint: 'Polite Modal Requests: Could I please get / I would like',
            explanation: 'In English customer service encounters, direct imperatives like "Give me a coffee" sound blunt and demanding. Native speakers use modal verbs (could, would) and polite softeners.',
            usageGuide: 'Use "Could I please get + [Item]?" or "I would like to have + [Item], please."',
            structureFormula: 'Could I (please) get + [Size] + [Item] + with [Customization], please?',
            commonMistakes: 'Avoid saying "Give me" or "I want". Always soften with "Could I" and "please".',
            formalityLevel: 'Polite Conversational Register',
          },
        ],
        dialogues: [
          {
            id: 1,
            lessonId: isKo ? 1 : 2,
            title: isKo ? 'Dining at Hongdae Kimchi Jjigae' : 'Ordering at Craft Coffee Co.',
            contextDescription: isKo ? 'A customer enters a bustling restaurant in Hongdae during lunchtime.' : 'A customer steps up to the counter at a specialty coffee shop.',
            userRole: isKo ? '손님 (Customer)' : 'Customer',
            partnerRole: isKo ? '직원 (Staff)' : 'Barista',
            lines: isKo ? [
              { id: 1, speakerName: '직원', speakerRole: 'Staff', textOriginal: '어서오세요! 몇 분이세요?', textRomanized: 'Eoseo-oseyo! Myeot bun-iseyo?', textTranslation: 'Welcome! How many people in your party?', orderIndex: 1 },
              { id: 2, speakerName: '손님', speakerRole: 'Customer', textOriginal: '안녕하세요, 두 명이에요.', textRomanized: 'Annyeonghaseyo, du myeong-ieyo.', textTranslation: 'Hello, table for two please.', orderIndex: 2 },
              { id: 3, speakerName: '직원', speakerRole: 'Staff', textOriginal: '네, 안쪽 창가 자리에 앉으세요.', textRomanized: 'Ne, anjjok changga jarie anjeuseyo.', textTranslation: 'Yes, please sit at the inner window table.', orderIndex: 3 },
              { id: 4, speakerName: '손님', speakerRole: 'Customer', textOriginal: '저기요, 주문할게요! 김치찌개 2인분하고 라면 사리 하나 주세요.', textRomanized: 'Jeogiyo, jumunhalgeyo! Gimchijjigae i-inbun-hago ramyeon sari hana juseyo.', textTranslation: 'Excuse me, we are ready to order! Two servings of kimchi stew and ramen noodles please.', orderIndex: 4 },
              { id: 5, speakerName: '손님', speakerRole: 'Customer', textOriginal: '잘 먹었습니다! 사장님, 계산해 주세요.', textRomanized: 'Jal meogeotseumnida! Sajangnim, gyesanhae juseyo.', textTranslation: 'That was delicious! Boss, please bring the bill.', orderIndex: 5 },
            ] : [
              { id: 6, speakerName: 'Barista', speakerRole: 'Staff', textOriginal: 'Good morning! What can I craft for you today?', textTranslation: 'Chào buổi sáng! Tôi có thể pha chế món gì cho bạn?', orderIndex: 1 },
              { id: 7, speakerName: 'Customer', speakerRole: 'Customer', textOriginal: 'Hi! Could I please get an iced oat latte with an extra shot?', textTranslation: 'Chào bạn! Cho mình một ly latte yến mạch đá thêm một shot espresso nhé?', orderIndex: 2 },
              { id: 8, speakerName: 'Barista', speakerRole: 'Staff', textOriginal: 'Would you prefer our house blend or the Ethiopian single-origin?', textTranslation: 'Bạn thích blend truyền thống hay loại hạt đơn nguồn gốc Ethiopia?', orderIndex: 3 },
              { id: 9, speakerName: 'Customer', speakerRole: 'Customer', textOriginal: 'Let\'s go with the Ethiopian single-origin, please! Also, make that to go.', textTranslation: 'Cho mình hạt Ethiopia nhé! Và cho mình mang đi.', orderIndex: 4 },
            ],
          },
        ],
        exercises: [
          {
            id: 1,
            lessonId: isKo ? 1 : 2,
            title: 'Knowledge Check & Application',
            type: 'MULTIPLE_CHOICE',
            questions: isKo ? [
              {
                id: 1,
                prompt: 'What is the most polite and natural way to call a waiter in a Korean restaurant?',
                optionsJson: '["저기요!", "야!", "이봐!", "너!"]',
                correctAnswer: '저기요!',
                explanation: '"저기요" (Excuse me) is polite, friendly, and universally accepted in dining establishments.',
                orderIndex: 1,
              },
              {
                id: 2,
                prompt: 'How do you correctly conjugate "앉다" (to sit) with the polite imperative -(으)세요?',
                optionsJson: '["앉으세요", "앉세요", "앉아요", "앉아라"]',
                correctAnswer: '앉으세요',
                explanation: 'Because "앉다" ends with a batchim (ㄵ), attach -으세요 to create "앉으세요".',
                orderIndex: 2,
              },
              {
                id: 3,
                prompt: 'Select the correct order: [주세요] [하나] [김치찌개]',
                optionsJson: '["김치찌개 하나 주세요", "주세요 하나 김치찌개", "하나 주세요 김치찌개", "김치찌개 주세요 하나"]',
                correctAnswer: '김치찌개 하나 주세요',
                explanation: 'Standard order: [Noun item] + [Quantity] + [주세요].',
                orderIndex: 3,
              },
            ] : [
              {
                id: 4,
                prompt: 'Which phrasing is the most polite and natural way to place an order?',
                optionsJson: '["Could I please get an oat latte?", "Give me an oat latte now.", "I demand an oat latte.", "Oat latte bring."]',
                correctAnswer: 'Could I please get an oat latte?',
                explanation: '"Could I please get..." uses modal hedging to express courtesy in everyday service interactions.',
                orderIndex: 1,
              },
            ],
          },
        ],
        scenarios: [
          {
            id: 1,
            lessonId: isKo ? 1 : 2,
            topicCode: isKo ? 'korean-restaurant' : 'english-cafe',
            languageCode: isKo ? 'KO' : 'EN',
            levelCode: isKo ? 'BEGINNER' : 'INTERMEDIATE',
            title: isKo ? 'Ordering at a Korean Restaurant' : 'Specialty Coffee Order',
            description: isKo ? 'Practice ordering food, asking for water refills, and paying.' : 'Practice ordering, customizing drinks, and asking questions.',
            userRole: isKo ? '손님 (Customer)' : 'Customer',
            aiRole: isKo ? '직원 (Waiter)' : 'Barista',
            initialGreeting: isKo ? '어서오세요! 몇 분이세요? 편하신 자리에 앉으세요.' : 'Hey there! Welcome to Craft Coffee. What can I get started for you today?',
          },
        ],
      };
      setLesson(mockLesson);
      setSelectedPronounceSentence(mockLesson.vocabulary[0].exampleSentence || mockLesson.vocabulary[0].word);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAudio = (text: string, lang: 'KO' | 'EN' = 'KO', speed = 0.9) => {
    setPlayingText(text);
    speakText(text, lang, speed).then(() => setPlayingText(null));
  };

  const handleTestPronunciation = async () => {
    if (!selectedPronounceSentence) return;
    setIsRecording(true);
    setPronunciationResult(null);

    const lang = lesson?.languageCode || 'KO';
    try {
      const res = await recordSpeech(lang, selectedPronounceSentence);
      setPronunciationResult(res);
      if (res.accuracy >= 80) {
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRecording(false);
    }
  };

  const handleSelectAnswer = (qId: number, answer: string) => {
    setUserAnswers((prev) => ({ ...prev, [qId]: answer }));
  };

  const handleGradeQuiz = () => {
    if (!lesson?.exercises || lesson.exercises.length === 0) return;
    const questions = lesson.exercises[0].questions;
    let correct = 0;

    questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });

    const calculatedScore = Math.round((correct / questions.length) * 100);
    setExerciseScore(calculatedScore);
    setExerciseSubmitted(true);

    if (calculatedScore >= 70) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handleCompleteEntireLesson = async () => {
    if (!lesson) return;
    try {
      await api.progress.completeLesson(lesson.id, Math.max(exerciseScore, 90), 420);
    } catch (e) {
      // offline save
    }
    setIsCompletedModalOpen(true);
    confetti({ particleCount: 120, spread: 100, origin: { y: 0.5 } });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <div style={{ color: '#6366F1', fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Loading Lesson...</div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <h3>Lesson not found</h3>
        <button className="btn-primary" onClick={() => navigate('/topics')}>
          Return to Topics
        </button>
      </div>
    );
  }

  const isKo = lesson.languageCode === 'KO';

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 60 }}>
      {/* Lesson Header Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <button
          className="btn-secondary"
          onClick={() => navigate('/topics')}
          style={{ padding: '6px 14px', fontSize: 13 }}
        >
          <ArrowLeft size={16} />
          <span>Back to Topics</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Tag color="purple">{lesson.difficulty}</Tag>
          <Tag color="cyan">{isKo ? '🇰🇷 Korean' : '🇺🇸 English'}</Tag>
        </div>
      </div>

      {/* Lesson Title Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '28px 32px',
          marginBottom: 24,
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(6, 182, 212, 0.08))',
          border: '1px solid rgba(99, 102, 241, 0.25)',
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: '#A5B4FC', textTransform: 'uppercase', marginBottom: 6 }}>
          {lesson.topicName}
        </div>
        <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>
          {lesson.title}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6, maxWidth: 800 }}>
          {lesson.scenario}
        </p>

        {/* Cultural Context Pill */}
        {lesson.culturalNotes && (
          <div
            style={{
              marginTop: 16,
              padding: '12px 16px',
              borderRadius: 10,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              fontSize: 13,
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
            }}
          >
            <strong style={{ color: '#F59E0B' }}>💡 Cultural Context:</strong> {lesson.culturalNotes}
          </div>
        )}
      </div>

      {/* Navigation Tabs for 8 Pillars */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          overflowX: 'auto',
          paddingBottom: 10,
          marginBottom: 24,
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        {[
          { key: 'vocab', label: '1. Vocabulary', icon: <Layers size={15} /> },
          { key: 'grammar', label: '2. Grammar', icon: <Sparkles size={15} /> },
          { key: 'dialogue', label: '3. Dialogue', icon: <MessageSquare size={15} /> },
          { key: 'pronunciation', label: '4. Pronunciation', icon: <Mic size={15} /> },
          { key: 'exercises', label: '5. Exercises', icon: <BookOpen size={15} /> },
          { key: 'roleplay', label: '6. AI Roleplay', icon: <Award size={15} /> },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '10px 18px',
                borderRadius: '10px 10px 0 0',
                background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: isActive ? '#A5B4FC' : 'var(--text-secondary)',
                borderBottom: isActive ? '3px solid #6366F1' : '3px solid transparent',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                fontWeight: isActive ? 700 : 500,
                fontSize: 14,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: VOCABULARY */}
      {activeTab === 'vocab' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {lesson.vocabulary.map((vocab) => {
            const isPlaying = playingText === vocab.word;
            let breakdownData: any = null;
            if (vocab.breakdownJson) {
              try {
                breakdownData = JSON.parse(vocab.breakdownJson);
              } catch (e) {}
            }

            return (
              <div
                key={vocab.id}
                className="glass-panel"
                style={{ padding: 24, border: '1px solid var(--border-subtle)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span
                        className={isKo ? 'lang-ko' : ''}
                        style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}
                      >
                        {vocab.word}
                      </span>
                      {vocab.romanization && (
                        <span style={{ fontSize: 14, color: '#A5B4FC', fontStyle: 'italic' }}>
                          [{vocab.romanization}]
                        </span>
                      )}
                      {vocab.pronunciationIpa && (
                        <span style={{ fontSize: 13, color: '#38BDF8' }}>
                          {vocab.pronunciationIpa}
                        </span>
                      )}
                      <Tag color="blue">{vocab.partOfSpeech}</Tag>
                    </div>

                    <div style={{ fontSize: 16, color: 'var(--text-primary)', marginTop: 8, fontWeight: 600 }}>
                      {vocab.meaning}
                    </div>
                  </div>

                  {/* Audio Speaker Button */}
                  <button
                    className={`btn-secondary ${isPlaying ? 'btn-audio-playing' : ''}`}
                    onClick={() => handlePlayAudio(vocab.word, isKo ? 'KO' : 'EN')}
                    style={{ padding: '8px 14px' }}
                  >
                    <Volume2 size={18} color="#06B6D4" />
                    <span>Listen</span>
                  </button>
                </div>

                {/* Korean Morpheme Breakdown */}
                {breakdownData && (
                  <div
                    style={{
                      marginTop: 14,
                      padding: '10px 14px',
                      borderRadius: 8,
                      background: 'rgba(0, 0, 0, 0.25)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#A5B4FC', textTransform: 'uppercase', marginBottom: 4 }}>
                      🧩 Word Construction Breakdown:
                    </div>
                    {breakdownData.morphemes ? (
                      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 13 }}>
                        {breakdownData.morphemes.map((m: any, i: number) => (
                          <span key={i} style={{ color: 'var(--text-primary)' }}>
                            <strong style={{ color: '#F59E0B' }}>{m.part}</strong> ({m.meaning})
                            {i < breakdownData.morphemes.length - 1 && ' + '}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        {JSON.stringify(breakdownData)}
                      </div>
                    )}
                  </div>
                )}

                {/* Batchim / Sound Changes */}
                {(vocab.batchimRules || vocab.soundChanges) && (
                  <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                    {vocab.batchimRules && <div>📝 <strong>Batchim Rule:</strong> {vocab.batchimRules}</div>}
                    {vocab.soundChanges && <div>🔊 <strong>Sound Change:</strong> {vocab.soundChanges}</div>}
                  </div>
                )}

                {/* Example sentence */}
                {vocab.exampleSentence && (
                  <div
                    style={{
                      marginTop: 14,
                      padding: 12,
                      borderRadius: 8,
                      background: 'rgba(99, 102, 241, 0.06)',
                      borderLeft: '3px solid #6366F1',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className={isKo ? 'lang-ko' : ''} style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {vocab.exampleSentence}
                      </span>
                      <button
                        onClick={() => handlePlayAudio(vocab.exampleSentence!, isKo ? 'KO' : 'EN')}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#06B6D4' }}
                      >
                        <Volume2 size={16} />
                      </button>
                    </div>
                    {vocab.translation && (
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                        {vocab.translation}
                      </div>
                    )}
                  </div>
                )}

                {/* Collocations */}
                {vocab.collocations && (
                  <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-secondary)' }}>
                    <strong>Common Collocations:</strong> <span style={{ color: '#A5B4FC' }}>{vocab.collocations}</span>
                  </div>
                )}
              </div>
            );
          })}

          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <button className="btn-primary" onClick={() => setActiveTab('grammar')}>
              <span>Proceed to Grammar</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: GRAMMAR */}
      {activeTab === 'grammar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {lesson.grammar.map((gram) => (
            <div key={gram.id} className="glass-panel" style={{ padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>
                  {gram.grammarPoint}
                </h3>
                {gram.formalityLevel && (
                  <Tag color="magenta">{gram.formalityLevel}</Tag>
                )}
              </div>

              {/* Structure Formula */}
              {gram.structureFormula && (
                <div
                  style={{
                    padding: '14px 18px',
                    borderRadius: 10,
                    background: 'rgba(99, 102, 241, 0.12)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    marginBottom: 16,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#A5B4FC', textTransform: 'uppercase', marginBottom: 4 }}>
                    Structure Formula:
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {gram.structureFormula}
                  </div>
                </div>
              )}

              <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
                {gram.explanation}
              </p>

              {/* Usage Guide */}
              {gram.usageGuide && (
                <div style={{ marginBottom: 16 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                    Usage Guide & Rules:
                  </h4>
                  <pre
                    style={{
                      fontFamily: 'inherit',
                      fontSize: 13,
                      color: 'var(--text-secondary)',
                      whiteSpace: 'pre-wrap',
                      background: 'rgba(0, 0, 0, 0.25)',
                      padding: 12,
                      borderRadius: 8,
                      lineHeight: 1.5,
                    }}
                  >
                    {gram.usageGuide}
                  </pre>
                </div>
              )}

              {/* Common Mistakes */}
              {gram.commonMistakes && (
                <div
                  style={{
                    padding: 14,
                    borderRadius: 8,
                    background: 'rgba(244, 63, 94, 0.08)',
                    border: '1px solid rgba(244, 63, 94, 0.25)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#F43F5E', fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                    <AlertCircle size={16} />
                    <span>Common Mistakes to Avoid:</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    {gram.commonMistakes}
                  </div>
                </div>
              )}
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
            <button className="btn-secondary" onClick={() => setActiveTab('vocab')}>
              <ArrowLeft size={16} />
              <span>Back to Vocabulary</span>
            </button>
            <button className="btn-primary" onClick={() => setActiveTab('dialogue')}>
              <span>Proceed to Dialogue</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: DIALOGUE */}
      {activeTab === 'dialogue' && (
        <div>
          {lesson.dialogues.map((dlg) => (
            <div key={dlg.id} className="glass-panel" style={{ padding: 28, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>
                    {dlg.title}
                  </h3>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    {dlg.contextDescription}
                  </div>
                </div>

                <button
                  className="btn-secondary"
                  onClick={() => {
                    const fullText = dlg.lines.map((l) => l.textOriginal).join('. ');
                    handlePlayAudio(fullText, isKo ? 'KO' : 'EN');
                  }}
                  style={{ padding: '8px 14px' }}
                >
                  <Volume2 size={16} color="#06B6D4" />
                  <span>Play Full Conversation</span>
                </button>
              </div>

              {/* Line-by-line speaker dialogue */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {dlg.lines.map((line) => {
                  const isUserRole = line.speakerRole.toLowerCase().includes('customer');
                  return (
                    <div
                      key={line.id}
                      style={{
                        padding: 16,
                        borderRadius: 12,
                        background: isUserRole ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                        border: isUserRole ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid var(--border-subtle)',
                        marginLeft: isUserRole ? 40 : 0,
                        marginRight: isUserRole ? 0 : 40,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Tag color={isUserRole ? 'purple' : 'cyan'}>{line.speakerName}</Tag>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{line.speakerRole}</span>
                        </div>
                        <button
                          onClick={() => handlePlayAudio(line.textOriginal, isKo ? 'KO' : 'EN')}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#06B6D4' }}
                        >
                          <Volume2 size={18} />
                        </button>
                      </div>

                      <div className={isKo ? 'lang-ko' : ''} style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                        {line.textOriginal}
                      </div>

                      {line.textRomanized && (
                        <div style={{ fontSize: 13, color: '#A5B4FC', fontStyle: 'italic', marginBottom: 4 }}>
                          {line.textRomanized}
                        </div>
                      )}

                      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        {line.textTranslation}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
            <button className="btn-secondary" onClick={() => setActiveTab('grammar')}>
              <ArrowLeft size={16} />
              <span>Back to Grammar</span>
            </button>
            <button className="btn-primary" onClick={() => setActiveTab('pronunciation')}>
              <span>Proceed to Pronunciation Practice</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: PRONUNCIATION PRACTICE */}
      {activeTab === 'pronunciation' && (
        <div className="glass-panel" style={{ padding: 28 }}>
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 24px' }}>
            <Mic size={32} color="#6366F1" style={{ marginBottom: 12 }} />
            <h3 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>
              Interactive Speech & Pronunciation Trainer
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              Select a target phrase from this lesson, speak aloud clearly into your microphone, and get instant phonetic accuracy scoring.
            </p>
          </div>

          {/* Sentence Picker */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {lesson.vocabulary.map((vocab) => {
              const sentence = vocab.exampleSentence || vocab.word;
              const isSelected = selectedPronounceSentence === sentence;
              return (
                <div
                  key={vocab.id}
                  onClick={() => setSelectedPronounceSentence(sentence)}
                  className="glass-card-interactive"
                  style={{
                    padding: '12px 16px',
                    borderRadius: 10,
                    background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                    border: isSelected ? '2px solid #6366F1' : '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div className={isKo ? 'lang-ko' : ''} style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {sentence}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {vocab.meaning}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayAudio(sentence, isKo ? 'KO' : 'EN');
                    }}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#06B6D4' }}
                  >
                    <Volume2 size={18} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Target Active Sentence Highlight */}
          <div
            style={{
              padding: 24,
              borderRadius: 14,
              background: 'rgba(0, 0, 0, 0.35)',
              textAlign: 'center',
              border: '1px solid var(--border-subtle)',
              marginBottom: 24,
            }}
          >
            <div style={{ fontSize: 12, textTransform: 'uppercase', color: '#A5B4FC', fontWeight: 700, marginBottom: 8 }}>
              Target Sentence to Speak:
            </div>
            <div className={isKo ? 'lang-ko' : ''} style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>
              "{selectedPronounceSentence}"
            </div>

            <button
              onClick={handleTestPronunciation}
              disabled={isRecording}
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: isRecording ? '#F43F5E' : 'linear-gradient(135deg, #6366F1, #38BDF8)',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isRecording ? '0 0 24px #F43F5E' : '0 4px 18px rgba(99, 102, 241, 0.4)',
                transition: 'all 0.2s',
              }}
            >
              <Mic size={32} />
            </button>
            <div style={{ fontSize: 13, color: isRecording ? '#F43F5E' : 'var(--text-secondary)', marginTop: 8, fontWeight: 600 }}>
              {isRecording ? 'Listening... Speak now!' : 'Click to Record & Evaluate'}
            </div>
          </div>

          {/* Pronunciation Feedback Result */}
          {pronunciationResult && (
            <div
              style={{
                padding: 20,
                borderRadius: 12,
                background: pronunciationResult.accuracy >= 80 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                border: pronunciationResult.accuracy >= 80 ? '1px solid #10B981' : '1px solid #F59E0B',
                textAlign: 'center',
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 28, fontWeight: 900, color: pronunciationResult.accuracy >= 80 ? '#10B981' : '#F59E0B' }}>
                {pronunciationResult.accuracy}% Accuracy
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
                We heard: <strong style={{ color: 'var(--text-primary)' }}>"{pronunciationResult.transcript}"</strong>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
                {pronunciationResult.accuracy >= 85
                  ? '🌟 Excellent native cadence and phonetics! Ready for real conversations.'
                  : '👍 Good effort! Focus on vowel openness and smooth batchim transition.'}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
            <button className="btn-secondary" onClick={() => setActiveTab('dialogue')}>
              <ArrowLeft size={16} />
              <span>Back to Dialogue</span>
            </button>
            <button className="btn-primary" onClick={() => setActiveTab('exercises')}>
              <span>Proceed to Exercises</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: EXERCISES */}
      {activeTab === 'exercises' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {lesson.exercises.map((ex) => (
            <div key={ex.id} className="glass-panel" style={{ padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>
                  {ex.title}
                </h3>
                <Tag color="geekblue">{ex.type.replace('_', ' ')}</Tag>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {ex.questions.map((q, idx) => {
                  let options: string[] = [];
                  if (q.optionsJson) {
                    try {
                      options = JSON.parse(q.optionsJson);
                    } catch (e) {}
                  }

                  const selected = userAnswers[q.id];
                  const isCorrect = selected === q.correctAnswer;

                  return (
                    <div
                      key={q.id}
                      style={{
                        padding: 20,
                        borderRadius: 12,
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
                        {idx + 1}. {q.prompt}
                      </div>

                      {/* Options Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {options.map((opt, optIdx) => {
                          const isOptionSelected = selected === opt;
                          let optBg = 'rgba(255, 255, 255, 0.03)';
                          let optBorder = '1px solid var(--border-subtle)';

                          if (exerciseSubmitted) {
                            if (opt === q.correctAnswer) {
                              optBg = 'rgba(16, 185, 129, 0.2)';
                              optBorder = '1.5px solid #10B981';
                            } else if (isOptionSelected && !isCorrect) {
                              optBg = 'rgba(244, 63, 94, 0.2)';
                              optBorder = '1.5px solid #F43F5E';
                            }
                          } else if (isOptionSelected) {
                            optBg = 'rgba(99, 102, 241, 0.2)';
                            optBorder = '1.5px solid #6366F1';
                          }

                          return (
                            <div
                              key={optIdx}
                              onClick={() => !exerciseSubmitted && handleSelectAnswer(q.id, opt)}
                              style={{
                                padding: '12px 16px',
                                borderRadius: 10,
                                background: optBg,
                                border: optBorder,
                                cursor: exerciseSubmitted ? 'default' : 'pointer',
                                fontSize: 14,
                                color: 'var(--text-primary)',
                                fontWeight: isOptionSelected ? 600 : 400,
                                transition: 'all 0.15s ease',
                              }}
                            >
                              {opt}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation Reveal */}
                      {exerciseSubmitted && (
                        <div
                          style={{
                            marginTop: 12,
                            padding: 10,
                            borderRadius: 8,
                            background: isCorrect ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.08)',
                            fontSize: 13,
                            color: isCorrect ? '#10B981' : '#F43F5E',
                          }}
                        >
                          <strong>{isCorrect ? '✅ Correct!' : '❌ Not quite.'}</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Quiz Grade Trigger */}
              <div style={{ marginTop: 24, textAlign: 'center' }}>
                {!exerciseSubmitted ? (
                  <button
                    className="btn-primary"
                    onClick={handleGradeQuiz}
                    style={{ padding: '12px 32px', fontSize: 16 }}
                  >
                    Check Answers
                  </button>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: exerciseScore >= 70 ? '#10B981' : '#F59E0B' }}>
                      Quiz Score: {exerciseScore}%
                    </div>
                    <Space>
                      <button
                        className="btn-secondary"
                        onClick={() => {
                          setExerciseSubmitted(false);
                          setUserAnswers({});
                        }}
                      >
                        <RotateCcw size={16} />
                        <span>Retry Quiz</span>
                      </button>
                      <button
                        className="btn-primary"
                        onClick={handleCompleteEntireLesson}
                      >
                        <CheckCircle2 size={16} />
                        <span>Finish & Claim XP</span>
                      </button>
                    </Space>
                  </div>
                )}
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
            <button className="btn-secondary" onClick={() => setActiveTab('pronunciation')}>
              <ArrowLeft size={16} />
              <span>Back to Pronunciation</span>
            </button>
            <button className="btn-primary" onClick={() => setActiveTab('roleplay')}>
              <span>Proceed to AI Conversation Partner</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* TAB 6: AI ROLEPLAY */}
      {activeTab === 'roleplay' && (
        <div className="glass-panel" style={{ padding: 28, textAlign: 'center' }}>
          <MessageSquare size={36} color="#6366F1" style={{ marginBottom: 12 }} />
          <h3 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>
            Put Lesson Concepts Into Real-Time Practice
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, maxWidth: 600, margin: '0 auto 24px', lineHeight: 1.6 }}>
            Engage with our AI Conversation Partner in this scenario. Use the vocabulary and grammar you just mastered. Receive line-by-line feedback and detailed post-conversation analysis.
          </p>

          <div
            style={{
              padding: 20,
              borderRadius: 12,
              background: 'rgba(0, 0, 0, 0.3)',
              maxWidth: 500,
              margin: '0 auto 24px',
              textAlign: 'left',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ fontSize: 13, color: '#A5B4FC', fontWeight: 700, marginBottom: 4 }}>
              Scenario: {lesson.scenarios?.[0]?.title || lesson.title}
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-primary)', marginBottom: 8 }}>
              🎭 <strong>Your Role:</strong> {lesson.scenarios?.[0]?.userRole || 'Customer'}
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-primary)', marginBottom: 8 }}>
              🤖 <strong>AI Role:</strong> {lesson.scenarios?.[0]?.aiRole || 'Staff'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              First Line: "{lesson.scenarios?.[0]?.initialGreeting || 'Hello!'}"
            </div>
          </div>

          <button
            className="btn-primary"
            style={{ padding: '14px 32px', fontSize: 16 }}
            onClick={() => navigate('/conversation')}
          >
            <Sparkles size={18} />
            <span>Launch AI Roleplay Session</span>
          </button>
        </div>
      )}

      {/* Completion Modal */}
      {isCompletedModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            className="glass-panel"
            style={{
              maxWidth: 480,
              width: '90%',
              padding: 32,
              textAlign: 'center',
              background: '#111827',
              border: '1px solid rgba(99, 102, 241, 0.4)',
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10B981, #06B6D4)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <Award size={36} color="white" />
            </div>

            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
              Lesson Mastered! 🎉
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
              You completed <strong>{lesson.title}</strong>! You acquired {lesson.vocabulary.length} new communication terms and completed interactive listening & grammar checks.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 24 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#10B981' }}>+50 XP</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Earned</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#F59E0B' }}>5 Days</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Streak Kept</div>
              </div>
            </div>

            <Space direction="vertical" style={{ width: '100%' }}>
              <button
                className="btn-primary"
                onClick={() => {
                  setIsCompletedModalOpen(false);
                  navigate('/conversation');
                }}
                style={{ width: '100%', padding: '12px' }}
              >
                <span>Practice with AI Partner Now</span>
                <ArrowRight size={16} />
              </button>

              <button
                className="btn-secondary"
                onClick={() => {
                  setIsCompletedModalOpen(false);
                  navigate('/dashboard');
                }}
                style={{ width: '100%', padding: '12px' }}
              >
                Return to Dashboard
              </button>
            </Space>
          </div>
        </div>
      )}
    </div>
  );
};
