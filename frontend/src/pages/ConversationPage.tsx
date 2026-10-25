import React, { useEffect, useState, useRef } from 'react';
import { Button, Tag, Avatar, Space, Typography, Spin, Modal, Rate, Card, Tooltip } from 'antd';
import {
  MessageSquare,
  Mic,
  Send,
  Volume2,
  Sparkles,
  Award,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAppStore } from '../stores/useAppStore';
import { api } from '../services/api';
import {
  ConversationScenario,
  ConversationSession,
  ConversationFeedback,
} from '../types';
import { speakText, recordSpeech } from '../utils/speech';

const { Title, Text, Paragraph } = Typography;

export const ConversationPage: React.FC = () => {
  const { targetLanguage, targetLevel } = useAppStore();

  const [scenarios, setScenarios] = useState<ConversationScenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<ConversationScenario | null>(null);
  const [session, setSession] = useState<ConversationSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Chat inputs
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Post-conversation feedback modal
  const [feedback, setFeedback] = useState<ConversationFeedback | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadScenarios();
  }, [targetLanguage, targetLevel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages]);

  const loadScenarios = async () => {
    try {
      setLoading(true);
      const data = await api.conversations.getScenarios(targetLanguage, targetLevel);
      setScenarios(data);
      if (data.length > 0) {
        setSelectedScenario(data[0]);
      }
    } catch (e) {
      console.warn('Failed to fetch scenarios from API, using fallback scenarios', e);
      const isKo = targetLanguage === 'KO';
      const fallbackList: ConversationScenario[] = isKo
        ? [
            {
              id: 1,
              topicCode: 'korean-restaurant',
              languageCode: 'KO',
              levelCode: 'BEGINNER',
              title: 'Ordering at a Traditional Korean Restaurant',
              description: 'Order kimchi stew, ask for extra side dishes, and settle the bill.',
              userRole: '손님 (Customer)',
              aiRole: '직원 (Waiter)',
              initialGreeting: '안녕하세요! 어서오세요, 몇 분이신가요? 편하신 자리에 앉으세요.',
              culturalContext: 'Use standard polite informal ending (-요).',
            },
            {
              id: 2,
              topicCode: 'korean-cafe',
              languageCode: 'KO',
              levelCode: 'BEGINNER',
              title: 'Ordering Coffee in Seoul (Iced Americano & Bakery)',
              description: 'Order your beverage, choose dine-in or takeout, and ask for a receipt.',
              userRole: '손님 (Customer)',
              aiRole: '바리스타 (Barista)',
              initialGreeting: '안녕하세요! 주문 도와드리겠습니다. 드시고 가시나요?',
              culturalContext: 'Contractions like "아아" (Ice Americano) are common in cafes.',
            },
            {
              id: 3,
              topicCode: 'korean-travel',
              languageCode: 'KO',
              levelCode: 'ELEMENTARY',
              title: 'Asking for Directions at Gangnam Station',
              description: 'Ask a local commuter how to find Exit 11 and how long it takes.',
              userRole: '여행자 (Traveler)',
              aiRole: '행인 (Pedestrian)',
              initialGreeting: '저기요, 혹시 길 좀 물어봐도 될까요?',
              culturalContext: 'Polite attention-getters: 실례합니다 or 저기요.',
            },
          ]
        : [
            {
              id: 4,
              topicCode: 'english-cafe',
              languageCode: 'EN',
              levelCode: 'INTERMEDIATE',
              title: 'Artisan Specialty Coffee Order',
              description: 'Order customized coffee, inquire about roast origins, and pay.',
              userRole: 'Customer',
              aiRole: 'Barista',
              initialGreeting: 'Hey there! Welcome to Craft Coffee. What can I get started for you today?',
              culturalContext: 'Friendly and supportive conversational English.',
            },
            {
              id: 5,
              topicCode: 'english-interview',
              languageCode: 'EN',
              levelCode: 'INTERMEDIATE',
              title: 'Software Developer Job Interview',
              description: 'Introduce your background, discuss a technical project, and answer questions.',
              userRole: 'Candidate',
              aiRole: 'Hiring Manager',
              initialGreeting: 'Good afternoon, Thai! Thanks for joining today. Could you tell me a little bit about yourself?',
              culturalContext: 'Professional register using STAR method and clear structuring.',
            },
          ];
      setScenarios(fallbackList);
      if (fallbackList.length > 0) {
        setSelectedScenario(fallbackList[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = async (scenario: ConversationScenario) => {
    setSelectedScenario(scenario);
    try {
      setLoading(true);
      const newSession = await api.conversations.startSession(scenario.id);
      setSession(newSession);
      // Play initial greeting
      speakText(scenario.initialGreeting, scenario.languageCode, 0.95);
    } catch (e) {
      // Mock session fallback
      const mockSession: ConversationSession = {
        id: Date.now(),
        scenario,
        status: 'ACTIVE',
        startedAt: new Date().toISOString(),
        messages: [
          {
            id: 1,
            senderRole: 'AI',
            content: scenario.initialGreeting,
            timestamp: new Date().toISOString(),
          },
        ],
      };
      setSession(mockSession);
      speakText(scenario.initialGreeting, scenario.languageCode, 0.95);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !session) return;
    const msgToSend = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const updatedSession = await api.conversations.reply(session.id, msgToSend);
      setSession(updatedSession);

      // Play the latest AI response
      const latestAiMsg = updatedSession.messages.filter((m) => m.senderRole === 'AI').slice(-1)[0];
      if (latestAiMsg) {
        speakText(latestAiMsg.content, session.scenario.languageCode, 0.95);
      }
    } catch (e) {
      // Offline / fallback reply simulation
      const userMsg = {
        id: Date.now(),
        senderRole: 'USER' as const,
        content: msgToSend,
        timestamp: new Date().toISOString(),
      };

      const isKo = session.scenario.languageCode === 'KO';
      const aiReplyContent = isKo
        ? '네, 주문 확인했습니다! 김치찌개 하나와 공깃밥 바로 준비해 드리겠습니다. 반찬은 셀프바 이용해 주세요.'
        : 'Awesome choice! An iced oat latte coming right up. That will be $6.25 on card.';

      const aiMsg = {
        id: Date.now() + 1,
        senderRole: 'AI' as const,
        content: aiReplyContent,
        grammarFeedback: isKo
          ? '자연스러운 표현입니다! 수량 단위(하나/1인분)를 함께 쓰시면 더욱 원활합니다.'
          : 'Great sentence phrasing and polite cadence.',
        suggestedAlternative: isKo
          ? '김치찌개 1인분 부탁드립니다.'
          : 'Could I also get that with light ice, please?',
        timestamp: new Date().toISOString(),
      };

      setSession((prev) =>
        prev ? { ...prev, messages: [...prev.messages, userMsg, aiMsg] } : null
      );
      speakText(aiReplyContent, session.scenario.languageCode, 0.95);
    } finally {
      setSending(false);
    }
  };

  const handleVoiceRecord = async () => {
    if (!session) return;
    setIsRecording(true);
    try {
      const result = await recordSpeech(session.scenario.languageCode);
      if (result.transcript) {
        setInputText(result.transcript);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRecording(false);
    }
  };

  const handleCompleteConversation = async () => {
    if (!session) return;
    try {
      const analysis = await api.conversations.complete(session.id);
      setFeedback(analysis);
      setIsFeedbackOpen(true);
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
    } catch (e) {
      // Mock analysis fallback
      const isKo = session.scenario.languageCode === 'KO';
      const mockFeedback: ConversationFeedback = {
        sessionId: session.id,
        overallScore: 89,
        fluencyScore: 88,
        grammarScore: 92,
        vocabularyScore: 86,
        feedbackSummary: isKo
          ? '훌륭한 대화였습니다! 식당 상황에 맞는 존댓말과 주문 어미를 적절하게 구사하셨습니다.'
          : 'Impressive roleplay interaction! You sustained the conversational momentum with polite modal hedging.',
        grammarMistakes: isKo
          ? [
              '조사 생략 주의: "김치찌개 주세요"보다는 "김치찌개 하나 주세요"가 더욱 한국어다운 자연스러움을 줍니다.',
            ]
          : ['Preposition check: "order in the menu" -> "order from the menu".'],
        vocabularyMistakes: isKo
          ? ['외래어 "빌(bill)" 대신 "계산서" 또는 "영수증"을 사용하는 것이 더 직관적입니다.']
          : ['Avoid overly abrupt phrases like "Give me", prefer "Could I get".'],
        moreNaturalExpressions: isKo
          ? [
              '식사 후 계산할 때: "사장님, 계산해 주세요!" 또는 "카드로 계산할게요"',
              '반찬 리필 요청 시: "여기 반찬 좀 더 주실 수 있나요?"',
            ]
          : [
              '"Could I get this to go, please?" for takeaway.',
              '"We are ready to order whenever you are."',
            ],
        usefulVocabulary: isKo
          ? ['1인분 (One serving)', '덜 맵게 (Less spicy)', '앞접시 (Extra sharing plate)', '포장 (Takeout)']
          : ['Single-origin', 'Dairy-free', 'Complimentary', 'Split the bill'],
        suggestedAlternativeSentences: isKo
          ? [
              '창가 자리로 부탁드려도 될까요? (Could we please have a window seat?)',
              '영수증은 버려주셔도 괜찮습니다. (You can discard the receipt.)',
            ]
          : [
              'Could we have the check whenever you get a chance?',
              'Do you have any recommendations for today?',
            ],
      };
      setFeedback(mockFeedback);
      setIsFeedbackOpen(true);
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
    }
  };

  return (
    <div style={{ maxWidth: 1050, margin: '0 auto', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Scenario Picker Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '12px 20px',
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <MessageSquare size={20} color="#6366F1" />
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
              {session?.scenario.title || selectedScenario?.title || 'Select Scenario'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              You: <strong style={{ color: '#A5B4FC' }}>{session?.scenario.userRole || selectedScenario?.userRole}</strong> | AI: <strong style={{ color: '#38BDF8' }}>{session?.scenario.aiRole || selectedScenario?.aiRole}</strong>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {!session ? (
            <button
              className="btn-primary"
              onClick={() => selectedScenario && handleStartSession(selectedScenario)}
              style={{ padding: '8px 18px', fontSize: 13 }}
            >
              <Sparkles size={16} />
              <span>Start Conversation</span>
            </button>
          ) : (
            <Space>
              <button
                className="btn-secondary"
                onClick={() => selectedScenario && handleStartSession(selectedScenario)}
                style={{ padding: '8px 14px', fontSize: 13 }}
              >
                <RotateCcw size={15} />
                <span>Restart</span>
              </button>
              <button
                className="btn-primary"
                onClick={handleCompleteConversation}
                style={{ padding: '8px 18px', fontSize: 13, background: 'linear-gradient(135deg, #10B981, #06B6D4)' }}
              >
                <CheckCircle size={16} />
                <span>Finish & Get Feedback</span>
              </button>
            </Space>
          )}
        </div>
      </div>

      {/* Main Conversation Canvas */}
      {!session ? (
        // Scenario Selection Screen
        <div className="glass-panel" style={{ padding: 32, flex: 1, overflowY: 'auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
              Choose a Roleplay Communication Scenario
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              Engage in turn-by-turn dialogues with dynamic real-time speech and immediate educational guidance.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {scenarios.map((sc) => {
              const isSelected = selectedScenario?.id === sc.id;
              return (
                <div
                  key={sc.id}
                  onClick={() => handleStartSession(sc)}
                  className="glass-card-interactive"
                  style={{
                    padding: 20,
                    borderRadius: 14,
                    background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                    border: isSelected ? '2px solid #6366F1' : '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <Tag color="purple">{sc.levelCode.replace('_', ' ')}</Tag>
                    <Tag color="cyan">{sc.languageCode === 'KO' ? '🇰🇷 Korean' : '🇺🇸 English'}</Tag>
                  </div>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                    {sc.title}
                  </h4>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 14 }}>
                    {sc.description}
                  </p>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    🎭 Roles: <strong>{sc.userRole}</strong> ↔ <strong>{sc.aiRole}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        // Active Chat Canvas
        <div
          className="glass-panel"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Messages Scroll Area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {session.messages.map((msg, idx) => {
              const isAi = msg.senderRole === 'AI';
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
                  <Avatar
                    style={{
                      backgroundColor: isAi ? '#6366F1' : '#10B981',
                      flexShrink: 0,
                    }}
                  >
                    {isAi ? 'AI' : 'You'}
                  </Avatar>

                  <div style={{ maxWidth: '75%' }}>
                    {/* Message Bubble */}
                    <div
                      style={{
                        padding: '14px 18px',
                        borderRadius: isAi ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                        background: isAi ? 'rgba(99, 102, 241, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        border: isAi ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                        color: 'var(--text-primary)',
                        fontSize: 15,
                        lineHeight: 1.5,
                      }}
                    >
                      <div>{msg.content}</div>

                      {/* Play Audio Button for AI message */}
                      {isAi && (
                        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <button
                            onClick={() => speakText(msg.content, session.scenario.languageCode, 0.95)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#06B6D4',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 12,
                              fontWeight: 600,
                            }}
                          >
                            <Volume2 size={15} />
                            <span>Listen</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Educational feedback on learner turn */}
                    {msg.grammarFeedback && (
                      <div
                        style={{
                          marginTop: 6,
                          padding: '8px 12px',
                          borderRadius: 8,
                          background: 'rgba(245, 158, 11, 0.1)',
                          border: '1px solid rgba(245, 158, 11, 0.25)',
                          fontSize: 12,
                          color: '#F59E0B',
                        }}
                      >
                        💡 <strong>Coach Note:</strong> {msg.grammarFeedback}
                        {msg.suggestedAlternative && (
                          <div style={{ marginTop: 4, color: 'var(--text-secondary)' }}>
                            Suggested: <strong style={{ color: '#A5B4FC' }}>"{msg.suggestedAlternative}"</strong>
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

          {/* Chat Input Bar */}
          <div
            style={{
              padding: '16px 20px',
              borderTop: '1px solid var(--border-subtle)',
              background: 'rgba(0, 0, 0, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            {/* Mic Speech-to-text Button */}
            <Tooltip title="Hold or click to speak your response aloud">
              <button
                onClick={handleVoiceRecord}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: isRecording ? '#F43F5E' : 'rgba(255, 255, 255, 0.08)',
                  border: isRecording ? 'none' : '1px solid var(--border-subtle)',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  boxShadow: isRecording ? '0 0 15px #F43F5E' : 'none',
                }}
              >
                <Mic size={20} />
              </button>
            </Tooltip>

            {/* Text Input Field */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !sending && handleSendMessage()}
              placeholder={
                session.scenario.languageCode === 'KO'
                  ? '한국어로 답장해 보세요 (예: 네, 김치찌개 하나 주세요)...'
                  : 'Type in English or click the mic to speak...'
              }
              style={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 12,
                padding: '12px 18px',
                color: 'var(--text-primary)',
                fontSize: 15,
                outline: 'none',
              }}
            />

            {/* Send Button */}
            <button
              className="btn-primary"
              onClick={handleSendMessage}
              disabled={sending || !inputText.trim()}
              style={{ padding: '12px 20px', height: 46 }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Post-Conversation Comprehensive Feedback Modal */}
      {isFeedbackOpen && feedback && (
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Award size={24} color="#10B981" />
              <span style={{ fontSize: 20, fontWeight: 800 }}>Conversation Performance Analysis</span>
            </div>
          }
          open={isFeedbackOpen}
          onCancel={() => setIsFeedbackOpen(false)}
          footer={null}
          width={750}
          centered
        >
          <div style={{ padding: '10px 0' }}>
            {/* Score Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
              <div style={{ padding: 14, borderRadius: 10, background: 'rgba(16, 185, 129, 0.1)', textAlign: 'center', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#10B981' }}>{feedback.overallScore}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Overall Score</div>
              </div>
              <div style={{ padding: 14, borderRadius: 10, background: 'rgba(99, 102, 241, 0.1)', textAlign: 'center', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#6366F1' }}>{feedback.fluencyScore}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Fluency</div>
              </div>
              <div style={{ padding: 14, borderRadius: 10, background: 'rgba(6, 182, 212, 0.1)', textAlign: 'center', border: '1px solid rgba(6, 182, 212, 0.25)' }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#06B6D4' }}>{feedback.grammarScore}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Grammar</div>
              </div>
              <div style={{ padding: 14, borderRadius: 10, background: 'rgba(245, 158, 11, 0.1)', textAlign: 'center', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#F59E0B' }}>{feedback.vocabularyScore}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Vocabulary</div>
              </div>
            </div>

            {/* Summary */}
            <div style={{ padding: 14, borderRadius: 10, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', marginBottom: 20 }}>
              <div style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                {feedback.feedbackSummary}
              </div>
            </div>

            {/* Grammar Mistakes */}
            {feedback.grammarMistakes && feedback.grammarMistakes.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#F43F5E', fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
                  <AlertTriangle size={16} />
                  <span>Grammar & Structure Refinements:</span>
                </div>
                <ul style={{ paddingLeft: 20, color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6 }}>
                  {feedback.grammarMistakes.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Natural Expressions */}
            {feedback.moreNaturalExpressions && feedback.moreNaturalExpressions.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10B981', fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
                  <Sparkles size={16} />
                  <span>More Natural Expressions Used by Natives:</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {feedback.moreNaturalExpressions.map((exp, i) => (
                    <div key={i} style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(16, 185, 129, 0.08)', fontSize: 13, color: '#10B981' }}>
                      ✨ {exp}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Useful Vocabulary */}
            {feedback.usefulVocabulary && feedback.usefulVocabulary.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#A5B4FC', fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
                  <BookOpen size={16} />
                  <span>Useful Vocabulary for This Scenario:</span>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {feedback.usefulVocabulary.map((word, i) => (
                    <Tag key={i} color="blue" style={{ fontSize: 13, padding: '4px 10px' }}>
                      {word}
                    </Tag>
                  ))}
                </div>
              </div>
            )}

            <div style={{ textAlign: 'right', marginTop: 20 }}>
              <button
                className="btn-primary"
                onClick={() => {
                  setIsFeedbackOpen(false);
                  setSession(null);
                }}
                style={{ width: '100%', padding: '12px' }}
              >
                Back to Scenarios List
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
