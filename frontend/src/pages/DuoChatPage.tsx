import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, Avatar, Modal, Typography, Space, Tooltip, message } from 'antd';
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
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAppStore } from '../stores/useAppStore';
import { api } from '../services/api';
import { ConversationScenario, ConversationMessage, ConversationFeedback, formatLevelVietnamese } from '../types';
import { speakText, recordSpeech } from '../utils/speech';

const { Text, Paragraph } = Typography;

export const DuoChatPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    targetLanguage,
    targetLevel,
    apiKey,
    openApiKeyModal,
    openImportModal,
    customScenarios,
    themeMode,
    toggleTheme,
  } = useAppStore();

  const isKo = targetLanguage === 'KO';

  // Base scenarios + custom scenarios
  const defaultScenarios: ConversationScenario[] = isKo
    ? [
        {
          id: 1,
          topicCode: 'korean-restaurant',
          languageCode: 'KO',
          levelCode: 'BEGINNER',
          title: 'Gọi món tại quán ăn Hàn Quốc (식당에서 주문하기)',
          description: 'Gọi món canh kim chi, xin thêm nước và gọi thanh toán hóa đơn.',
          userRole: 'Khách hàng (손님)',
          aiRole: 'Nhân viên phục vụ (직원)',
          initialGreeting: '어서오세요! 몇 분이세요? 편하신 자리로 앉으세요.',
          culturalContext: 'Dùng đuôi câu lịch sự -요 để giao tiếp tự nhiên.',
        },
        {
          id: 2,
          topicCode: 'korean-cafe',
          languageCode: 'KO',
          levelCode: 'BEGINNER',
          title: 'Gọi cà phê tại quán cafe Seoul (아이스 아메리카노)',
          description: 'Gọi đồ uống, chọn uống tại chỗ hay mang đi và xin hóa đơn.',
          userRole: 'Khách hàng (손님)',
          aiRole: 'Barista (바리스타)',
          initialGreeting: '안녕하세요! 주문 도와드리겠습니다. 드시고 가시나요?',
          culturalContext: 'Người Hàn hay gọi tắt Ice Americano là "아아".',
        },
        {
          id: 3,
          topicCode: 'korean-travel',
          languageCode: 'KO',
          levelCode: 'ELEMENTARY',
          title: 'Hỏi đường tại ga tàu điện ngầm Gangnam',
          description: 'Hỏi đường đến lối ra số 11 và thời gian đi bộ.',
          userRole: 'Khách du lịch (여행자)',
          aiRole: 'Người qua đường (행인)',
          initialGreeting: '네, 안녕하세요! 길 찾으시나요?',
          culturalContext: 'Mở đầu bằng "저기요, 실례지만..." khi hỏi đường.',
        },
      ]
    : [
        {
          id: 4,
          topicCode: 'english-cafe',
          languageCode: 'EN',
          levelCode: 'INTERMEDIATE',
          title: 'Gọi cà phê tại quán Specialty Coffee',
          description: 'Gọi đồ uống theo sở thích riêng, hỏi về mức rang hạt và thanh toán chạm.',
          userRole: 'Khách hàng (Customer)',
          aiRole: 'Nhân viên pha chế (Barista)',
          initialGreeting: 'Hey there! Welcome to Craft Coffee. What can I craft for you today?',
          culturalContext: 'Phong cách đàm thoại thân thiện, dùng cấu trúc nhã nhặn như "Could I please get...".',
        },
        {
          id: 5,
          topicCode: 'english-interview',
          languageCode: 'EN',
          levelCode: 'INTERMEDIATE',
          title: 'Phỏng vấn xin việc Lập trình viên',
          description: 'Giới thiệu bản thân, chia sẻ kinh nghiệm dự án và trả lời câu hỏi ứng xử kỹ thuật.',
          userRole: 'Ứng viên (Candidate)',
          aiRole: 'Trưởng nhóm kỹ thuật (Tech Lead)',
          initialGreeting: 'Good morning! Thanks for joining today. Could you tell me a bit about yourself?',
          culturalContext: 'Áp dụng mô hình STAR (Situation, Task, Action, Result) để trả lời mạch lạc.',
        },
      ];

  const allScenarios = [...customScenarios.filter((s) => s.languageCode === targetLanguage), ...defaultScenarios];

  const [selectedScenario, setSelectedScenario] = useState<ConversationScenario>(allScenarios[0]);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [sending, setSending] = useState(false);
  const [showTranslations, setShowTranslations] = useState<Record<number, boolean>>({});

  // Feedback modal
  const [feedback, setFeedback] = useState<ConversationFeedback | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Automatically switch selected scenario when targetLanguage changes
  useEffect(() => {
    const matching = allScenarios.filter((s) => s.languageCode === targetLanguage);
    if (matching.length > 0) {
      setSelectedScenario(matching[0]);
    }
  }, [targetLanguage]);

  // Initialize conversation when scenario changes
  useEffect(() => {
    if (selectedScenario) {
      const initial: ConversationMessage = {
        id: 1,
        senderRole: 'AI',
        content: selectedScenario.initialGreeting,
        timestamp: new Date().toISOString(),
      };
      setMessages([initial]);
      speakText(selectedScenario.initialGreeting, selectedScenario.languageCode, 0.95);
    }
  }, [selectedScenario]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

    try {
      // Backend reply
      const res = await api.conversations.reply(1, content);
      if (res?.messages) {
        setMessages(res.messages);
        const lastAi = res.messages.filter((m) => m.senderRole === 'AI').slice(-1)[0];
        if (lastAi) {
          speakText(lastAi.content, selectedScenario.languageCode, 0.95);
        }
      }
    } catch (e) {
      // Fallback local educational engine
      setTimeout(() => {
        let aiReply = '';
        let coachTip = '';
        let suggestion = '';

        if (isKo) {
          if (content.includes('김치찌개') || content.includes('주문') || content.includes('주세요')) {
            aiReply = '네, 김치찌개 하나 준비해 드리겠습니다! 밥과 기본 반찬은 셀프바에서 이용하시면 됩니다. 음료는 필요 없으신가요?';
            coachTip = 'Câu đặt món rất tự nhiên! Dùng "수량 + 주세요" là quy tắc chuẩn xác.';
            suggestion = '네, 시원한 물 한 병만 주세요.';
          } else if (content.includes('계산') || content.includes('얼마') || content.includes('카드')) {
            aiReply = '네, 총 9,000원입니다. 앞쪽에 카드 꽂아주시면 결제 도와드리겠습니다!';
            coachTip = 'Khi thanh toán, nói "카드로 할게요" hoặc "계산해 주세요" rất chuẩn.';
            suggestion = '영수증은 버려주셔도 돼요.';
          } else {
            aiReply = '네, 손님! 말씀하신 내용 확인했습니다. 더 필요하신 부분 있으시면 언제든 저기요 하고 불러주세요.';
            coachTip = 'Giữ ngữ điệu thân thiện và lịch sự với đuôi -요.';
            suggestion = '감사합니다, 맛있게 먹겠습니다!';
          }
        } else {
          if (content.includes('latte') || content.includes('coffee') || content.includes('get')) {
            aiReply = 'Perfect! An iced oat latte coming right up. That will be $6.50 on card. Will that be for here or to go?';
            coachTip = 'Great use of polite modal "Could I get...".';
            suggestion = 'Make that to go, please.';
          } else {
            aiReply = 'Sounds wonderful! Let me know if you need any extra syrup or sugar on the side.';
            coachTip = 'Fluent and natural flow.';
            suggestion = 'Thank you, I appreciate it!';
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
    } finally {
      setSending(false);
    }
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
        ? 'Buổi giao tiếp xuất sắc! Bạn đã sử dụng chính xác các đuôi câu kính ngữ 존댓말, gọi món rõ ràng và thể hiện sự tự tin cao.'
        : 'Outstanding conversation practice! You applied natural modal hedging and polite service request phrasing.',
      grammarMistakes: isKo
        ? ['Lưu ý khi gọi món: nên thêm lượng từ "하나" hoặc "1인분" sau tên món ăn.']
        : ['Remember prepositions: "order from the menu" instead of "order in the menu".'],
      vocabularyMistakes: isKo
        ? ['Nên dùng từ thuần Hàn "계산서" hoặc "영수증" thay vì mượn từ bill.']
        : ['Prefer "Could I please get" over blunt imperatives like "Give me".'],
      moreNaturalExpressions: isKo
        ? [
            'Khi xin thêm nước: "물 좀 더 주실 수 있나요?"',
            'Khi thanh toán xong: "잘 먹었습니다! 수고하세요~"',
          ]
        : [
            '"Could you make that extra hot, please?"',
            '"We are ready to order whenever you are."',
          ],
      usefulVocabulary: isKo
        ? ['1인분 (Một phần ăn)', '반찬 리필 (Xin thêm món phụ)', '포장 (Mang về / Takeout)', '영수증 (Hóa đơn)']
        : ['Single-origin', 'Dairy-free', 'Complimentary', 'To-go'],
      suggestedAlternativeSentences: isKo
        ? ['창가 자리로 부탁드려도 될까요? (Cho tôi xin bàn cạnh cửa sổ được không ạ?)']
        : ['Could we have the check whenever you get a chance?'],
    };

    setFeedback(mockFeedback);
    setIsFeedbackOpen(true);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
  };

  // Quick reply chips
  const quickReplies = isKo
    ? ['네, 김치찌개 하나 주세요.', '물 좀 더 주세요.', '계산해 주세요!', '창가 자리 있나요?']
    : ['Could I get an iced latte, please?', 'Make that to go, please.', 'Could I have the check?', 'What do you recommend?'];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--duo-bg)',
        color: 'var(--duo-text-primary)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'background-color 0.2s ease, color 0.2s ease',
      }}
    >
      {/* Top Header Navigation (Duolingo Style) */}
      <div
        style={{
          padding: '14px 24px',
          borderBottom: '2px solid var(--duo-border)',
          background: 'var(--duo-header-bg)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          transition: 'background-color 0.2s ease, border-color 0.2s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            className="duo-btn-outline"
            onClick={() => navigate('/topics')}
            style={{ padding: '8px 14px' }}
          >
            <ArrowLeft size={16} />
            <span>Thoát</span>
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18, fontWeight: 900, color: 'var(--duo-text-primary)' }}>
                {selectedScenario.title}
              </span>
              <Tag color="green">{formatLevelVietnamese(selectedScenario.levelCode)}</Tag>
            </div>
            <div style={{ fontSize: 12, color: 'var(--duo-text-secondary)' }}>
              Bạn là: <strong style={{ color: '#58CC02' }}>{selectedScenario.userRole}</strong> | AI đóng vai: <strong style={{ color: '#1CB0F6' }}>{selectedScenario.aiRole}</strong>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* API Key Modal Button */}
          <button
            className="duo-btn-outline"
            onClick={openApiKeyModal}
            style={{ padding: '8px 14px', borderColor: apiKey ? '#58CC02' : '#FFC800' }}
          >
            <Key size={15} color={apiKey ? '#58CC02' : '#FFC800'} />
            <span style={{ color: apiKey ? '#58CC02' : '#FFC800' }}>
              {apiKey ? 'API Key (Đã kích hoạt)' : 'Điền API Key'}
            </span>
          </button>

          {/* Import JSON Modal Button */}
          <button
            className="duo-btn-outline"
            onClick={openImportModal}
            style={{ padding: '8px 14px' }}
          >
            <Upload size={15} color="#1CB0F6" />
            <span>Nạp JSON</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            className="duo-btn-outline"
            onClick={toggleTheme}
            style={{
              padding: '8px 12px',
              color: themeMode === 'dark' ? '#FFC800' : '#6366F1',
            }}
            title={themeMode === 'dark' ? 'Chuyển sang giao diện Sáng ☀️' : 'Chuyển sang giao diện Tối 🌙'}
          >
            {themeMode === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Finish Button */}
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

      {/* Scenario Bar Selector */}
      <div
        style={{
          padding: '10px 24px',
          background: 'var(--duo-card-bg)',
          borderBottom: '2px solid var(--duo-border)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          overflowX: 'auto',
          transition: 'background-color 0.2s ease, border-color 0.2s ease',
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--duo-text-secondary)', whiteSpace: 'nowrap' }}>
          Đổi tình huống:
        </span>
        {allScenarios.map((sc) => {
          const isSel = selectedScenario.id === sc.id;
          return (
            <button
              key={sc.id}
              onClick={() => setSelectedScenario(sc)}
              style={{
                background: isSel ? '#58CC02' : 'var(--duo-bg)',
                color: isSel ? '#FFFFFF' : 'var(--duo-text-secondary)',
                border: isSel ? 'none' : '2px solid var(--duo-border)',
                borderBottom: isSel ? '3px solid #46A302' : '3px solid var(--duo-border)',
                borderRadius: 12,
                padding: '6px 14px',
                fontSize: 13,
                fontWeight: 800,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.1s ease',
              }}
            >
              {sc.title}
            </button>
          );
        })}
      </div>

      {/* Main Chat Messenger Area */}
      <div
        style={{
          flex: 1,
          maxWidth: 800,
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
          const isTranslated = showTranslations[msg.id || idx];

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
                  background: isAi ? 'linear-gradient(135deg, #1CB0F6, #58CC02)' : 'linear-gradient(135deg, #FFC800, #FF9600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  flexShrink: 0,
                  border: '2px solid var(--duo-border)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}
              >
                {isAi ? '🤖' : '🧑‍🎓'}
              </div>

              <div style={{ maxWidth: '78%' }}>
                {/* Speech Bubble */}
                <div className={isAi ? 'duo-speech-bubble' : 'duo-speech-bubble-user'}>
                  <div
                    className={isKo ? 'lang-ko' : ''}
                    style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.5 }}
                  >
                    {msg.content}
                  </div>

                  {/* Audio Speaker Controls for AI message */}
                  {isAi && (
                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
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
                        title="Nghe chậm"
                      >
                        🐢
                      </button>

                      {/* Translation reveal button */}
                      <button
                        onClick={() =>
                          setShowTranslations((prev) => ({
                            ...prev,
                            [msg.id || idx]: !isTranslated,
                          }))
                        }
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--duo-text-secondary)',
                          cursor: 'pointer',
                          fontSize: 12,
                          textDecoration: 'underline',
                        }}
                      >
                        {isTranslated ? 'Ẩn dịch' : 'Dịch nghĩa'}
                      </button>
                    </div>
                  )}

                  {/* Translation Text Reveal */}
                  {isTranslated && (
                    <div
                      style={{
                        marginTop: 8,
                        paddingTop: 8,
                        borderTop: '1px dashed var(--duo-border)',
                        fontSize: 13,
                        color: '#A5B4FC',
                      }}
                    >
                      💡 <em>Bản dịch tham khảo:</em>{' '}
                      {isKo ? 'Chào mừng quý khách! Đi mấy người ạ? Xin mời ngồi vào vị trí thoải mái.' : 'Xin chào! Bạn dùng gì hôm nay?'}
                    </div>
                  )}
                </div>

                {/* Coach Note On Grammar */}
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
      <div style={{ maxWidth: 800, width: '100%', margin: '0 auto', padding: '0 20px 10px' }}>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--duo-text-muted)', display: 'flex', alignItems: 'center' }}>
            Gợi ý:
          </span>
          {quickReplies.map((reply, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(reply)}
              className="duo-btn-outline"
              style={{
                padding: '6px 12px',
                fontSize: 12,
                borderRadius: 20,
                whiteSpace: 'nowrap',
              }}
            >
              {reply}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Input Action Bar */}
      <div
        style={{
          borderTop: '2px solid var(--duo-border)',
          background: 'var(--duo-card-bg)',
          padding: '16px 24px',
          transition: 'background-color 0.2s ease, border-color 0.2s ease',
        }}
      >
        <div
          style={{
            maxWidth: 800,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          {/* Big Voice Mic Recording Button */}
          <Tooltip title={isRecording ? 'Đang lắng nghe... bấm để dừng' : 'Bấm để ghi âm và nói trực tiếp'}>
            <button
              onClick={handleVoiceRecord}
              className={isRecording ? 'duo-mic-active' : ''}
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: isRecording ? '#FF4B4B' : '#1CB0F6',
                border: 'none',
                borderBottom: isRecording ? '4px solid #EA2B2B' : '4px solid #1899D6',
                color: '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.15s ease',
              }}
            >
              <Mic size={24} />
            </button>
          </Tooltip>

          {/* Text Input Field */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !sending && handleSendMessage()}
            placeholder={
              isKo
                ? 'Nhập bằng tiếng Hàn hoặc bấm mic để nói (ví dụ: 네, 김치찌개 하나 주세요)...'
                : 'Nhập bằng tiếng Anh hoặc bấm mic để nói (ví dụ: Could I get an iced latte, please?)...'
            }
            style={{
              flex: 1,
              background: 'var(--duo-bg)',
              border: '2px solid var(--duo-border)',
              borderRadius: 16,
              padding: '14px 18px',
              color: 'var(--duo-text-primary)',
              fontSize: 15,
              outline: 'none',
              fontFamily: 'inherit',
              transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease',
            }}
          />

          {/* Send Button */}
          <button
            className="duo-btn-green"
            onClick={() => handleSendMessage()}
            disabled={sending || !inputText.trim()}
            style={{ padding: '14px 22px', borderRadius: 16 }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* Post-Conversation Performance Feedback Modal */}
      {isFeedbackOpen && feedback && (
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Award size={26} color="#FFC800" />
              <span style={{ fontSize: 20, fontWeight: 900 }}>Kết quả Đánh giá Giao tiếp 🎉</span>
            </div>
          }
          open={isFeedbackOpen}
          onCancel={() => setIsFeedbackOpen(false)}
          footer={null}
          width={720}
          centered
        >
          <div style={{ padding: '10px 0' }}>
            {/* Score Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
              <div className="duo-card" style={{ textAlign: 'center', borderColor: '#FFC800' }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#FFC800' }}>{feedback.overallScore}</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--duo-text-muted)' }}>TỔNG ĐIỂM</div>
              </div>
              <div className="duo-card" style={{ textAlign: 'center', borderColor: '#58CC02' }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#58CC02' }}>{feedback.fluencyScore}</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--duo-text-muted)' }}>LƯU LOÁT</div>
              </div>
              <div className="duo-card" style={{ textAlign: 'center', borderColor: '#1CB0F6' }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#1CB0F6' }}>{feedback.grammarScore}</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--duo-text-muted)' }}>NGỮ PHÁP</div>
              </div>
              <div className="duo-card" style={{ textAlign: 'center', borderColor: '#CE82FF' }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#CE82FF' }}>{feedback.vocabularyScore}</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--duo-text-muted)' }}>TỪ VỰNG</div>
              </div>
            </div>

            {/* General Feedback Summary */}
            <div className="duo-card" style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 15, color: 'var(--duo-text-primary)', lineHeight: 1.6 }}>
                {feedback.feedbackSummary}
              </div>
            </div>

            {/* Natural Native Expressions */}
            {feedback.moreNaturalExpressions && feedback.moreNaturalExpressions.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#58CC02', fontWeight: 800, fontSize: 14, marginBottom: 8 }}>
                  <Sparkles size={16} />
                  <span>Cách người bản xứ diễn đạt tự nhiên hơn:</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {feedback.moreNaturalExpressions.map((exp, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 10,
                        background: 'rgba(88, 204, 2, 0.12)',
                        border: '1px solid rgba(88, 204, 2, 0.3)',
                        fontSize: 14,
                        color: 'var(--duo-text-primary)',
                        fontWeight: 600,
                      }}
                    >
                      ✨ {exp}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vocabulary to Remember */}
            {feedback.usefulVocabulary && feedback.usefulVocabulary.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#1CB0F6', fontWeight: 800, fontSize: 14, marginBottom: 8 }}>
                  <BookOpen size={16} />
                  <span>Từ vựng hữu ích cho tình huống này:</span>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {feedback.usefulVocabulary.map((word, i) => (
                    <Tag key={i} color="blue" style={{ fontSize: 13, padding: '6px 12px', borderRadius: 8, fontWeight: 700 }}>
                      {word}
                    </Tag>
                  ))}
                </div>
              </div>
            )}

            <button
              className="duo-btn-green"
              onClick={() => setIsFeedbackOpen(false)}
              style={{ width: '100%', padding: '14px' }}
            >
              <span>Tiếp tục luyện tập</span>
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
