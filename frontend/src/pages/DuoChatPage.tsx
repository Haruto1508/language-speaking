import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Tag, Avatar, Modal, Typography, Space, Tooltip, message, Progress } from 'antd';
import {
  Mic,
  Send,
  Volume2,
  Sparkles,
  Key,
  Upload,
  ArrowLeft,
  CheckCircle,
  RotateCcw,
  BookOpen,
  Award,
  AlertTriangle,
  Lightbulb,
  Sun,
  Moon,
  MessageSquare,
  Compass,
  Utensils,
  UserCheck,
  Languages,
  ChevronRight,
  Play,
  RotateCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import axios from 'axios';
import { useAppStore } from '../stores/useAppStore';
import { api } from '../services/api';
import {
  ConversationScenario,
  ConversationMessage,
  ConversationFeedback,
  formatLevelVietnamese,
} from '../types';
import { speakText, recordSpeech } from '../utils/speech';
import { translateToVietnamese } from '../services/translator';
import {
  COMPREHENSIVE_SCENARIOS,
  EnhancedScenario,
} from '../data/conversationScenarios';

const { Title, Text, Paragraph } = Typography;

export const DuoChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    targetLanguage,
    targetLevel,
    apiKey,
    openApiKeyModal,
    openImportModal,
    customScenarios,
    themeMode,
    toggleTheme,
    user,
  } = useAppStore();

  const isKo = targetLanguage === 'KO';

  // Merge default enhanced scenarios with user's custom scenarios
  const allEnhancedScenarios: EnhancedScenario[] = [
    ...COMPREHENSIVE_SCENARIOS.filter((s) => s.languageCode === targetLanguage),
    ...customScenarios
      .filter((s) => s.languageCode === targetLanguage)
      .map((cs) => ({
        ...cs,
        category: 'FREE_CHAT' as const,
        categoryLabel: 'Tự tạo',
        categoryIcon: '✨',
        quickReplies: [
          isKo ? '안녕하세요!' : 'Hello!',
          isKo ? '감사합니다.' : 'Thank you!',
          isKo ? '다시 한번 말씀해 주세요.' : 'Could you say that again?',
        ],
      })),
  ];

  // View state: 'LIST' (Catalog of topics & conversations) vs 'CHAT' (Interactive chat room)
  const initialScenarioId = searchParams.get('scenarioId');
  const initialScenario = initialScenarioId
    ? allEnhancedScenarios.find((s) => s.id === Number(initialScenarioId))
    : null;

  const [viewMode, setViewMode] = useState<'LIST' | 'CHAT'>(initialScenario ? 'CHAT' : 'LIST');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'DIRECTIONS' | 'SELF_INTRO' | 'FOOD_ORDER' | 'FREE_CHAT'>('ALL');
  const [selectedScenario, setSelectedScenario] = useState<EnhancedScenario>(
    initialScenario || allEnhancedScenarios[0]
  );

  // Chat State
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [sending, setSending] = useState(false);

  // Translations
  const [showTranslations, setShowTranslations] = useState<Record<string | number, boolean>>({});
  const [translations, setTranslations] = useState<Record<string | number, string>>({});
  const [translatingIds, setTranslatingIds] = useState<Record<string | number, boolean>>({});

  // Dynamic real-time translation handler
  const handleToggleTranslate = async (msgKey: string | number, text: string) => {
    const isCurrentlyOpen = !!showTranslations[msgKey];
    if (isCurrentlyOpen) {
      setShowTranslations((prev) => ({ ...prev, [msgKey]: false }));
      return;
    }

    setShowTranslations((prev) => ({ ...prev, [msgKey]: true }));

    if (translations[msgKey]) return;

    setTranslatingIds((prev) => ({ ...prev, [msgKey]: true }));
    try {
      const res = await translateToVietnamese(text, selectedScenario.languageCode, apiKey);
      setTranslations((prev) => ({ ...prev, [msgKey]: res }));
    } catch (err) {
      console.error('Translation error:', err);
      setTranslations((prev) => ({ ...prev, [msgKey]: 'Không thể dịch nội dung này.' }));
    } finally {
      setTranslatingIds((prev) => ({ ...prev, [msgKey]: false }));
    }
  };

  // Feedback modal
  const [feedback, setFeedback] = useState<ConversationFeedback | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Automatically switch selected scenario when targetLanguage changes
  useEffect(() => {
    const matching = allEnhancedScenarios.filter((s) => s.languageCode === targetLanguage);
    if (matching.length > 0) {
      setSelectedScenario(matching[0]);
    }
  }, [targetLanguage]);

  // When selectedScenario changes, reset messages and greeting
  const startChatWithScenario = (scenario: EnhancedScenario) => {
    setSelectedScenario(scenario);
    setViewMode('CHAT');
    setSearchParams({ scenarioId: String(scenario.id) });

    const initial: ConversationMessage = {
      id: 1,
      senderRole: 'AI',
      content: scenario.initialGreeting,
      timestamp: new Date().toISOString(),
    };
    setMessages([initial]);
    speakText(scenario.initialGreeting, scenario.languageCode, 0.95);
  };

  useEffect(() => {
    if (viewMode === 'CHAT' && messages.length === 0 && selectedScenario) {
      const initial: ConversationMessage = {
        id: 1,
        senderRole: 'AI',
        content: selectedScenario.initialGreeting,
        timestamp: new Date().toISOString(),
      };
      setMessages([initial]);
      speakText(selectedScenario.initialGreeting, selectedScenario.languageCode, 0.95);
    }
  }, [viewMode, selectedScenario]);

  useEffect(() => {
    if (viewMode === 'CHAT') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, viewMode]);

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const content = (textToSend || inputText).trim();
    if (!content || sending) return;
    setInputText('');
    setSending(true);

    const userMsg: ConversationMessage = {
      id: Date.now(),
      senderRole: 'USER',
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    const isFreeChat = selectedScenario.category === 'FREE_CHAT';

    // 1. If user provided Gemini API Key, generate real-time AI reply
    if (apiKey) {
      try {
        const systemInstruction = isFreeChat
          ? `You are a supportive, friendly ${isKo ? 'Korean' : 'English'} language tutor chatting naturally with a learner.
Respond warmly in ${isKo ? 'Korean' : 'English'} (1-2 sentences).
Respond ONLY with a JSON object:
{
  "reply": "natural response in target language",
  "coachTip": "concise encouragement or grammar tip in Vietnamese",
  "suggestedAlternative": "optional more native phrase in target language"
}`
          : `You are roleplaying as "${selectedScenario.aiRole}" in scenario: "${selectedScenario.title}". The learner is "${selectedScenario.userRole}".
Context: ${selectedScenario.description}.
Respond in character in ${isKo ? 'Korean' : 'English'} (1-2 natural sentences).
Respond ONLY with a JSON object:
{
  "reply": "in-character response in target language",
  "coachTip": "concise feedback in Vietnamese on learner tone or grammar",
  "suggestedAlternative": "optional more native phrasing in target language"
}`;

        const res = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            contents: [
              {
                parts: [
                  { text: systemInstruction },
                  { text: `Learner says: "${content}"` },
                ],
              },
            ],
            generationConfig: { responseMimeType: 'application/json' },
          },
          { timeout: 12000 }
        );

        const textOut = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (textOut) {
          const parsed = JSON.parse(textOut);
          const aiMsg: ConversationMessage = {
            id: Date.now() + 1,
            senderRole: 'AI',
            content: parsed.reply || (isKo ? '네, 잘 들었습니다!' : 'Got it! Sounds good.'),
            grammarFeedback: parsed.coachTip || 'Diễn đạt rất tự nhiên!',
            suggestedAlternative: parsed.suggestedAlternative,
            timestamp: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, aiMsg]);
          speakText(aiMsg.content, selectedScenario.languageCode, 0.95);
          return;
        }
      } catch (geminiErr) {
        console.warn('Gemini chat reply failed, using educational offline engine', geminiErr);
      }
    }

    // 2. Fallback smart educational engine
    setTimeout(() => {
      let aiReply = '';
      let coachTip = '';
      let suggestion = '';

      if (isKo) {
        if (selectedScenario.category === 'DIRECTIONS') {
          if (content.includes('출구') || content.includes('어디') || content.includes('어떻게')) {
            aiReply = '네! 이쪽으로 쭉 직진하시다가 첫 번째 사거리에서 우회전하시면 바로 보입니다.';
            coachTip = 'Câu hỏi đường rất chuẩn mực! Mở đầu với "저기요, 실례지만..." là phép lịch sự.';
            suggestion = '여기서 걸어서 얼마나 걸려요?';
          } else if (content.includes('얼마나') || content.includes('시간') || content.includes('걸려')) {
            aiReply = '걸어서 5분 정도밖에 안 걸려요. 금방 가실 수 있습니다!';
            coachTip = 'Dùng "얼마나 걸려요?" để hỏi thời gian đi lại rất tự nhiên.';
            suggestion = '친절하게 알려주셔서 정말 감사합니다!';
          } else {
            aiReply = '네, 맞습니다! 혹시 다른 곳도 더 찾으시는 곳 있으신가요?';
            coachTip = 'Giữ ngữ điệu nhã nhặn với đuôi -요.';
            suggestion = '감사합니다, 좋은 하루 보내세요!';
          }
        } else if (selectedScenario.category === 'SELF_INTRO') {
          if (content.includes('안녕') || content.includes('이름') || content.includes('베트남')) {
            aiReply = '만나서 정말 반가워요! 베트남에서 오셨군요. 한국 생활은 좀 어떠신가요?';
            coachTip = 'Giới thiệu quê quán rất rõ ràng. Nói "만나서 반갑습니다" là chuẩn mực.';
            suggestion = '한국어 공부하는 게 아주 재미있어요.';
          } else if (content.includes('취미') || content.includes('좋아') || content.includes('음악')) {
            aiReply = '와, 저랑 취미가 정말 비슷하시네요! 주말에 시간 되실 때 같이 활동해요.';
            coachTip = 'Chia sẻ sở thích giúp kéo gần khoảng cách rất nhanh.';
            suggestion = '네, 좋아요! 연락처 교환해요.';
          } else {
            aiReply = '말씀 들으니 정말 흥미롭네요! 앞으로 서로 도움 주고받으며 잘 지내봐요.';
            coachTip = 'Ngữ điệu tự tin và thân thiện.';
            suggestion = '앞으로 잘 부탁드립니다!';
          }
        } else if (selectedScenario.category === 'FOOD_ORDER') {
          if (content.includes('주문') || content.includes('주세요') || content.includes('찌개') || content.includes('삼겹살') || content.includes('커피')) {
            aiReply = '네, 손님! 주문하신 메뉴 바로 준비해 드리겠습니다. 더 필요하신 건 없으신가요?';
            coachTip = 'Cấu trúc "Tên món + 수량 + 주세요" là công thức chuẩn xác số 1 khi gọi món.';
            suggestion = '네, 시원한 물 한 병만 더 주세요.';
          } else if (content.includes('계산') || content.includes('얼마') || content.includes('카드')) {
            aiReply = '네, 총 결제 도와드리겠습니다. 앞쪽 단말기에 카드 꽂아주시면 됩니다!';
            coachTip = 'Khi thanh toán, nói "카드로 할게요" rất ngắn gọn và tự nhiên.';
            suggestion = '영수증은 버려주셔도 돼요.';
          } else {
            aiReply = '네, 손님! 말씀하신 부분 확인했습니다. 잠시만 기다려 주시면 바로 챙겨드리겠습니다.';
            coachTip = 'Giao tiếp gọi phục vụ rất lưu loát!';
            suggestion = '맛있게 잘 먹겠습니다!';
          }
        } else {
          // Free Chat
          aiReply = '정말 좋은 생각이네요! 당신과 한국어로 이야기 나누는 것이 참 즐겁습니다. 계속해서 편하게 말씀해 주세요!';
          coachTip = 'Phản xạ tiếng Hàn rất tự tin và trôi chảy!';
          suggestion = '다음에는 어떤 이야기를 나눌까요?';
        }
      } else {
        // English
        if (selectedScenario.category === 'DIRECTIONS') {
          if (content.includes('where') || content.includes('how') || content.includes('find')) {
            aiReply = 'Sure thing! Just head straight down this avenue and take a right at the traffic lights. You cannot miss it!';
            coachTip = 'Great use of polite inquiry modal "Could you tell me...".';
            suggestion = 'Is it within walking distance from here?';
          } else {
            aiReply = 'It takes only about five minutes on foot. Very easy to find!';
            coachTip = 'Clear pronunciation and natural conversational flow.';
            suggestion = 'Thank you so much, have a wonderful day!';
          }
        } else if (selectedScenario.category === 'FOOD_ORDER') {
          if (content.includes('latte') || content.includes('order') || content.includes('steak') || content.includes('burger') || content.includes('please')) {
            aiReply = 'Excellent choice! Coming right up for you. Would you like anything else to drink or a side with that?';
            coachTip = 'Polite modal request "Could I please get..." sounds very respectful.';
            suggestion = 'Could we get the check whenever you have a moment?';
          } else {
            aiReply = 'Certainly! That will be on card. Please tap right on the terminal screen.';
            coachTip = 'Smooth transaction phrasing.';
            suggestion = 'Keep the change, thank you!';
          }
        } else {
          aiReply = "That sounds wonderful! I completely agree with your point. What else would you like to explore today?";
          coachTip = 'Fluent and natural sentence structure.';
          suggestion = 'What do you recommend for practicing speaking?';
        }
      }

      const aiMsg: ConversationMessage = {
        id: Date.now() + 1,
        senderRole: 'AI',
        content: aiReply,
        grammarFeedback: coachTip,
        suggestedAlternative: suggestion,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMsg]);
      speakText(aiReply, selectedScenario.languageCode, 0.95);
    }, 700);

    setSending(false);
  };

  // Voice recording
  const handleVoiceRecord = async () => {
    setIsRecording(true);
    try {
      const res = await recordSpeech(selectedScenario.languageCode);
      if (res.transcript) {
        setInputText(res.transcript);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRecording(false);
    }
  };

  // Finish conversation
  const handleFinish = () => {
    const mockFeedback: ConversationFeedback = {
      sessionId: 1,
      overallScore: 92,
      fluencyScore: 90,
      grammarScore: 94,
      vocabularyScore: 89,
      feedbackSummary: isKo
        ? 'Bạn phản xạ câu hỏi và trả lời tự nhiên, vận dụng tốt đuôi câu lịch sự và từ vựng chuyên ngành trong tình huống!'
        : 'Outstanding roleplay! You applied natural modal hedging, courteous intonation, and native phrasing.',
      grammarMistakes: isKo
        ? ['Chú ý sử dụng kính ngữ phù hợp với người lớn tuổi/nhân viên phục vụ.']
        : ['Remember to check modal verb alignment in formal inquiries.'],
      vocabularyMistakes: [],
      moreNaturalExpressions: isKo
        ? ['"~해 주시겠어요?" thay vì "~해줘" để câu nói mềm mại và lịch thiệp hơn.']
        : ['"Could you please tell me..." sounds more natural than direct questions.'],
      usefulVocabulary: isKo
        ? ['직진하다 (đi thẳng)', '주문하다 (gọi món)', '반갑습니다 (rất vui được gặp)']
        : ['recommendation', 'crossroad', 'pleased to meet you'],
      suggestedAlternativeSentences: [],
    };
    setFeedback(mockFeedback);
    setIsFeedbackOpen(true);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
  };

  // Filter scenarios for catalog view
  const filteredCatalog = allEnhancedScenarios.filter((sc) => {
    if (selectedCategory === 'ALL') return true;
    return sc.category === selectedCategory;
  });

  const categoryCounts = {
    ALL: allEnhancedScenarios.length,
    DIRECTIONS: allEnhancedScenarios.filter((s) => s.category === 'DIRECTIONS').length,
    SELF_INTRO: allEnhancedScenarios.filter((s) => s.category === 'SELF_INTRO').length,
    FOOD_ORDER: allEnhancedScenarios.filter((s) => s.category === 'FOOD_ORDER').length,
    FREE_CHAT: allEnhancedScenarios.filter((s) => s.category === 'FREE_CHAT').length,
  };

  const isFreeChat = selectedScenario.category === 'FREE_CHAT';

  // =========================================================================
  // VIEW MODE 1: LIST / CATALOG OF CONVERSATION SCENARIOS
  // =========================================================================
  if (viewMode === 'LIST') {
    return (
      <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 60 }}>
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
          <div>
            <Title level={2} style={{ color: 'var(--duo-text-primary)', margin: 0, fontWeight: 900 }}>
              {isKo ? 'Hội thoại Giao tiếp Thực chiến Tiếng Hàn 🇰🇷' : 'Hội thoại Giao tiếp Thực chiến Tiếng Anh 🇺🇸'}
            </Title>
            <Text style={{ color: 'var(--duo-text-secondary)', fontSize: 15 }}>
              Chọn tình huống bên dưới để nhập vai cùng AI (Hỏi đường, Giới thiệu bản thân, Order món ăn) hoặc Chat tự do mọi chủ đề!
            </Text>
          </div>

          {/* Quick Action Buttons */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              className="duo-btn-outline"
              onClick={openImportModal}
              style={{ padding: '8px 16px', fontSize: 13 }}
            >
              <Upload size={16} color="#1CB0F6" />
              <span>Nạp thêm JSON</span>
            </button>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div
          style={{
            display: 'flex',
            gap: 10,
            overflowX: 'auto',
            paddingBottom: 14,
            marginBottom: 26,
          }}
        >
          {[
            { key: 'ALL', label: 'Tất cả chủ đề', icon: '🌟', count: categoryCounts.ALL },
            { key: 'DIRECTIONS', label: 'Hỏi đường & Đi lại', icon: '🗺️', count: categoryCounts.DIRECTIONS },
            { key: 'SELF_INTRO', label: 'Giới thiệu bản thân & Kết bạn', icon: '🙋', count: categoryCounts.SELF_INTRO },
            { key: 'FOOD_ORDER', label: 'Order món ăn & Cafe', icon: '🍜', count: categoryCounts.FOOD_ORDER },
            { key: 'FREE_CHAT', label: 'Chat tự do cùng AI', icon: '✨', count: categoryCounts.FREE_CHAT },
          ].map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key as any)}
                style={{
                  background: isSelected ? 'var(--duo-card-bg)' : 'transparent',
                  color: isSelected ? 'var(--duo-text-primary)' : 'var(--duo-text-secondary)',
                  border: isSelected ? '2px solid #58CC02' : '1.5px solid var(--duo-border)',
                  borderBottom: isSelected ? '4px solid #46A302' : '3px solid var(--duo-border)',
                  borderRadius: 14,
                  padding: '10px 18px',
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.15s ease',
                }}
                className="duo-card-interactive"
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <Tag
                  color={isSelected ? 'green' : 'default'}
                  style={{ borderRadius: 6, fontWeight: 800, margin: 0, fontSize: 11 }}
                >
                  {cat.count}
                </Tag>
              </button>
            );
          })}
        </div>

        {/* Scenario Directory Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
          {filteredCatalog.map((sc) => {
            const isFree = sc.category === 'FREE_CHAT';

            return (
              <div
                key={sc.id}
                onClick={() => startChatWithScenario(sc)}
                className="duo-card duo-card-interactive"
                style={{
                  padding: 22,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 14,
                  cursor: 'pointer',
                  position: 'relative',
                  border: isFree ? '2px solid rgba(28, 176, 246, 0.5)' : undefined,
                }}
              >
                <div>
                  {/* Top Badges */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 24 }}>{sc.categoryIcon}</span>
                      <Tag color="cyan" style={{ borderRadius: 6, fontWeight: 800, margin: 0 }}>
                        {sc.categoryLabel}
                      </Tag>
                    </div>

                    <Tag color="blue" style={{ borderRadius: 6, fontWeight: 800, margin: 0 }}>
                      {formatLevelVietnamese(sc.levelCode)}
                    </Tag>
                  </div>

                  {/* Title & Description */}
                  <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--duo-text-primary)', marginBottom: 8, lineHeight: 1.35 }}>
                    {sc.title}
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--duo-text-secondary)', lineHeight: 1.5, marginBottom: 14 }}>
                    {sc.description}
                  </p>

                  {/* Role Assignment */}
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: 12,
                      background: 'var(--duo-bg)',
                      border: '1px solid var(--duo-border)',
                      fontSize: 12,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                      marginBottom: 12,
                    }}
                  >
                    <div>
                      🧑‍🎓 <strong>Bạn đóng vai:</strong>{' '}
                      <span style={{ color: '#58CC02', fontWeight: 700 }}>{sc.userRole}</span>
                    </div>
                    <div>
                      🤖 <strong>AI đóng vai:</strong>{' '}
                      <span style={{ color: '#1CB0F6', fontWeight: 700 }}>{sc.aiRole}</span>
                    </div>
                  </div>

                  {/* Initial Greeting Quote */}
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: 10,
                      background: 'rgba(28, 176, 246, 0.08)',
                      borderLeft: '3px solid #1CB0F6',
                      fontSize: 13,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                    }}
                  >
                    <span className={isKo ? 'lang-ko' : ''} style={{ fontStyle: 'italic', color: 'var(--duo-text-primary)', fontWeight: 600 }}>
                      "{sc.initialGreeting}"
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speakText(sc.initialGreeting, sc.languageCode, 0.95);
                      }}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#1CB0F6', padding: 2 }}
                      title="Nghe câu mở đầu"
                    >
                      <Volume2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Bottom CTA Button */}
                <button
                  className={isFree ? 'duo-btn-blue' : 'duo-btn-green'}
                  style={{ width: '100%', padding: '10px 16px', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  <MessageSquare size={16} />
                  <span>{isFree ? 'Bắt đầu chat tự do ➔' : 'Vào luyện nói hội thoại ➔'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW MODE 2: ACTIVE CHAT ROOM
  // =========================================================================
  return (
    <div
      className="duo-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 120px)',
        borderRadius: 24,
        overflow: 'hidden',
        border: '2px solid var(--duo-border)',
        background: 'var(--duo-card-bg)',
      }}
    >
      {/* Top Header in Chat Room */}
      <div
        style={{
          padding: '12px 20px',
          background: 'var(--duo-card-hover)',
          borderBottom: '2px solid var(--duo-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Back button to scenario list */}
          <button
            className="duo-btn-outline"
            onClick={() => setViewMode('LIST')}
            style={{
              padding: '6px 14px',
              fontSize: 13,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 800,
            }}
            title="Quay lại danh sách chọn tình huống khác"
          >
            <ArrowLeft size={16} />
            <span>Danh sách hội thoại</span>
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>{selectedScenario.categoryIcon}</span>
              <span style={{ fontSize: 16, fontWeight: 900, color: 'var(--duo-text-primary)' }}>
                {selectedScenario.title}
              </span>
              <Tag color="blue" style={{ borderRadius: 6, fontWeight: 800, margin: 0 }}>
                {formatLevelVietnamese(selectedScenario.levelCode)}
              </Tag>
            </div>
            <div style={{ fontSize: 12, color: 'var(--duo-text-secondary)', marginTop: 2 }}>
              {isFreeChat ? (
                <span>Trò chuyện tự do cùng Trợ lý AI • Không giới hạn chủ đề</span>
              ) : (
                <span>
                  Bạn: <strong style={{ color: '#58CC02' }}>{selectedScenario.userRole}</strong> | AI: <strong style={{ color: '#1CB0F6' }}>{selectedScenario.aiRole}</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            className="duo-btn-green"
            onClick={handleFinish}
            style={{ padding: '8px 18px', fontSize: 13 }}
          >
            <CheckCircle size={16} />
            <span>Hoàn thành & Nhận đánh giá</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div
        style={{
          flex: 1,
          maxWidth: 820,
          width: '100%',
          margin: '0 auto',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          overflowY: 'auto',
        }}
      >
        {messages.map((msg, idx) => {
          const isAi = msg.senderRole === 'AI';
          const msgKey = msg.id ?? idx;
          const isTranslated = !!showTranslations[msgKey];
          const isTranslating = !!translatingIds[msgKey];
          const translatedText = translations[msgKey];

          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                flexDirection: isAi ? 'row' : 'row-reverse',
                alignItems: 'flex-start',
                gap: 12,
              }}
            >
              {/* Avatar Mascot */}
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: isAi
                    ? isFreeChat
                      ? 'linear-gradient(135deg, #8B5CF6, #06B6D4)'
                      : 'linear-gradient(135deg, #1CB0F6, #58CC02)'
                    : 'linear-gradient(135deg, #FFC800, #FF9600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  flexShrink: 0,
                  border: '2px solid var(--duo-border)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}
              >
                {isAi ? (isFreeChat ? '🧙‍♂️' : '🤖') : '🧑‍🎓'}
              </div>

              <div style={{ maxWidth: '78%' }}>
                {/* Speech Bubble */}
                <div className={isAi ? 'duo-speech-bubble' : 'duo-speech-bubble-user'}>
                  <div
                    className={isKo ? 'lang-ko' : ''}
                    style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.55 }}
                  >
                    {msg.content}
                  </div>

                  {/* Audio Speaker & Translation Controls for AI message */}
                  {isAi && (
                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <button
                        onClick={() => speakText(msg.content, selectedScenario.languageCode, 0.95)}
                        style={{
                          background: '#1CB0F6',
                          border: 'none',
                          borderBottom: '2px solid #1899D6',
                          color: '#FFFFFF',
                          padding: '4px 10px',
                          borderRadius: 8,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 12,
                          fontWeight: 800,
                        }}
                      >
                        <Volume2 size={14} />
                        <span>Nghe</span>
                      </button>

                      <button
                        onClick={() => speakText(msg.content, selectedScenario.languageCode, 0.65)}
                        style={{
                          background: 'var(--duo-card-bg)',
                          border: '1px solid var(--duo-border)',
                          color: 'var(--duo-text-primary)',
                          padding: '4px 8px',
                          borderRadius: 8,
                          cursor: 'pointer',
                          fontSize: 12,
                        }}
                        title="Nghe phát âm chậm"
                      >
                        🐢
                      </button>

                      {/* Translation reveal button */}
                      <button
                        onClick={() => handleToggleTranslate(msgKey, msg.content)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: isTranslated ? '#1CB0F6' : 'var(--duo-text-secondary)',
                          cursor: 'pointer',
                          fontSize: 12,
                          fontWeight: isTranslated ? 800 : 600,
                          textDecoration: 'underline',
                        }}
                      >
                        {isTranslated ? 'Ẩn dịch' : 'Dịch nghĩa'}
                      </button>
                    </div>
                  )}

                  {/* Controls for User message */}
                  {!isAi && (
                    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                      <button
                        onClick={() => speakText(msg.content, selectedScenario.languageCode, 0.95)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--duo-text-secondary)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 11,
                        }}
                        title="Nghe lại câu vừa nói"
                      >
                        <Volume2 size={13} />
                        <span>Nghe</span>
                      </button>
                      <button
                        onClick={() => handleToggleTranslate(msgKey, msg.content)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: isTranslated ? '#58CC02' : 'var(--duo-text-secondary)',
                          cursor: 'pointer',
                          fontSize: 11,
                          fontWeight: isTranslated ? 800 : 600,
                          textDecoration: 'underline',
                        }}
                      >
                        {isTranslated ? 'Ẩn dịch' : 'Dịch câu này'}
                      </button>
                    </div>
                  )}

                  {/* Dynamic Translation Box */}
                  {isTranslated && (
                    <div
                      style={{
                        marginTop: 10,
                        padding: '8px 12px',
                        borderRadius: 10,
                        background: isAi ? 'rgba(99, 102, 241, 0.12)' : 'rgba(88, 204, 2, 0.12)',
                        border: isAi ? '1px dashed #6366F1' : '1px dashed #58CC02',
                        fontSize: 13,
                        lineHeight: 1.5,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                        <span style={{ fontSize: 13 }}>💡</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: isAi ? '#A5B4FC' : '#86EFAC', textTransform: 'uppercase' }}>
                          Bản dịch nghĩa tiếng Việt:
                        </span>
                      </div>
                      <div style={{ paddingLeft: 18 }}>
                        {isTranslating ? (
                          <span style={{ color: '#FFC800', fontStyle: 'italic' }}>
                            Đang dịch nghĩa... ⏳
                          </span>
                        ) : (
                          <span style={{ color: 'var(--duo-text-primary)', fontWeight: 600 }}>
                            {translatedText || 'Chưa thể tải bản dịch.'}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Educational Coach Feedback */}
                {msg.grammarFeedback && (
                  <div
                    style={{
                      marginTop: 8,
                      padding: '8px 14px',
                      borderRadius: 12,
                      background: 'rgba(255, 200, 0, 0.1)',
                      border: '1.5px solid #FFC800',
                      fontSize: 12,
                      color: '#FFC800',
                    }}
                  >
                    💡 <strong>Góp ý từ trợ lý AI:</strong> {msg.grammarFeedback}
                    {msg.suggestedAlternative && (
                      <div style={{ marginTop: 4, color: 'var(--duo-text-primary)' }}>
                        Cách nói tự nhiên hơn: <strong>"{msg.suggestedAlternative}"</strong>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies Chips */}
      {selectedScenario.quickReplies && selectedScenario.quickReplies.length > 0 && (
        <div style={{ maxWidth: 820, width: '100%', margin: '0 auto', padding: '0 20px 8px' }}>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--duo-text-muted)', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
              💡 Gợi ý câu:
            </span>
            {selectedScenario.quickReplies.map((reply, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(reply)}
                className="duo-btn-outline"
                style={{
                  fontSize: 12,
                  padding: '5px 12px',
                  borderRadius: 20,
                  whiteSpace: 'nowrap',
                  fontWeight: 700,
                }}
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Input Bar */}
      <div
        style={{
          background: 'var(--duo-card-bg)',
          borderTop: '2px solid var(--duo-border)',
          padding: '16px 24px',
        }}
      >
        <div
          style={{
            maxWidth: 820,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          {/* Mic Button */}
          <button
            onClick={handleVoiceRecord}
            className={isRecording ? 'pulse-fast' : ''}
            style={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              background: isRecording ? '#FF4B4B' : 'linear-gradient(135deg, #1CB0F6, #1899D6)',
              border: 'none',
              borderBottom: isRecording ? '4px solid #EA2B2B' : '4px solid #1480B4',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              boxShadow: isRecording ? '0 0 16px rgba(255, 75, 75, 0.6)' : '0 4px 12px rgba(28, 176, 246, 0.3)',
              transition: 'all 0.15s ease',
            }}
            title={isRecording ? 'Đang lắng nghe bạn nói...' : 'Nhấn để nói tiếng Hàn/Anh qua micro'}
          >
            <Mic size={22} />
          </button>

          {/* Text Input */}
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              placeholder={
                isFreeChat
                  ? isKo
                    ? 'Nhập tin nhắn hoặc nói bất kỳ điều gì bằng tiếng Hàn...'
                    : 'Type a message or speak anything in English...'
                  : isKo
                  ? `Nhập câu nói của bạn (${selectedScenario.userRole})...`
                  : `Type your message (${selectedScenario.userRole})...`
              }
              className={isKo ? 'lang-ko' : ''}
              style={{
                width: '100%',
                padding: '14px 18px',
                borderRadius: 16,
                background: 'var(--duo-bg)',
                border: '2px solid var(--duo-border)',
                color: 'var(--duo-text-primary)',
                fontSize: 15,
                fontWeight: 600,
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s ease',
              }}
            />
          </div>

          {/* Send Button */}
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || sending}
            className="duo-btn-green"
            style={{
              height: 50,
              padding: '0 22px',
              fontSize: 15,
              opacity: !inputText.trim() ? 0.5 : 1,
              cursor: !inputText.trim() ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Send size={18} />
            <span>Gửi</span>
          </button>
        </div>
      </div>

      {/* Completion & Feedback Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Award size={26} color="#FFC800" />
            <span style={{ fontSize: 20, fontWeight: 900 }}>Kết quả Luyện nói & Đánh giá AI</span>
          </div>
        }
        open={isFeedbackOpen}
        onCancel={() => setIsFeedbackOpen(false)}
        footer={null}
        width={560}
        centered
      >
        {feedback && (
          <div style={{ marginTop: 16 }}>
            {/* Overall Score Circle Card */}
            <div
              style={{
                textAlign: 'center',
                padding: '24px 20px',
                borderRadius: 18,
                background: 'linear-gradient(135deg, rgba(88, 204, 2, 0.15), rgba(28, 176, 246, 0.15))',
                border: '2px solid var(--duo-border)',
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 48, fontWeight: 900, color: '#58CC02', lineHeight: 1 }}>
                {feedback.overallScore}
                <span style={{ fontSize: 22, color: 'var(--duo-text-muted)' }}>/100</span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, marginTop: 8, color: 'var(--duo-text-primary)' }}>
                Xuất sắc! Phản xạ hội thoại rất chuẩn mực 🌟
              </div>
            </div>

            {/* Sub-scores */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                  <span>Độ trôi chảy & Tự nhiên (Fluency)</span>
                  <span style={{ color: '#1CB0F6' }}>{feedback.fluencyScore}%</span>
                </div>
                <Progress percent={feedback.fluencyScore} strokeColor="#1CB0F6" showInfo={false} />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                  <span>Độ chính xác ngữ pháp (Grammar)</span>
                  <span style={{ color: '#58CC02' }}>{feedback.grammarScore}%</span>
                </div>
                <Progress percent={feedback.grammarScore} strokeColor="#58CC02" showInfo={false} />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                  <span>Vốn từ vựng tình huống (Vocabulary)</span>
                  <span style={{ color: '#FF9600' }}>{feedback.vocabularyScore}%</span>
                </div>
                <Progress percent={feedback.vocabularyScore} strokeColor="#FF9600" showInfo={false} />
              </div>
            </div>

            {/* AI Summary Comment */}
            <div
              style={{
                padding: '14px 18px',
                borderRadius: 14,
                background: 'var(--duo-card-bg)',
                border: '1.5px solid var(--duo-border)',
                fontSize: 14,
                lineHeight: 1.6,
                color: 'var(--duo-text-secondary)',
                marginBottom: 24,
              }}
            >
              💡 <strong>Nhận xét từ AI:</strong> {feedback.feedbackSummary}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                className="duo-btn-outline"
                onClick={() => {
                  setIsFeedbackOpen(false);
                  setViewMode('LIST');
                }}
                style={{ flex: 1, padding: '12px' }}
              >
                <span>Đổi kịch bản khác</span>
              </button>
              <button
                className="duo-btn-green"
                onClick={() => {
                  setIsFeedbackOpen(false);
                  startChatWithScenario(selectedScenario);
                }}
                style={{ flex: 1, padding: '12px' }}
              >
                <RotateCcw size={16} />
                <span>Luyện lại bài này</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
