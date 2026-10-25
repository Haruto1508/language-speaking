import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Heart, Volume2, Mic, CheckCircle2, XCircle, ArrowRight, RotateCcw, Award, Sparkles, Sun, Moon } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAppStore } from '../stores/useAppStore';
import { api } from '../services/api';
import { speakText, recordSpeech } from '../utils/speech';

interface ExerciseStep {
  type: 'word-builder' | 'listen-choose' | 'matching' | 'speak';
  title: string;
  instruction: string;
  prompt: string;
  romanization?: string;
  audioText: string;
  tiles?: string[];
  correctTiles?: string[];
  options?: Array<{ id: string; text: string; correct: boolean }>;
  pairs?: Array<{ id: string; left: string; right: string }>;
}

export const DuoLessonPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { targetLanguage, hearts, decrementHeart, themeMode, toggleTheme } = useAppStore();

  const isKo = id === '2' ? false : id === '1' ? true : targetLanguage === 'KO';

  // Lesson steps
  const steps: ExerciseStep[] = isKo
    ? [
        {
          type: 'word-builder',
          title: 'Dịch câu này sang tiếng Việt',
          instruction: 'Bấm vào các thẻ từ để ghép thành câu hoàn chỉnh:',
          prompt: '김치찌개 하나 주세요',
          romanization: 'Gimchijjigae hana juseyo',
          audioText: '김치찌개 하나 주세요',
          tiles: ['cho tôi', 'cơm trắng', 'một phần', 'canh kim chi', 'nước lọc', 'xin vui lòng', 'hai phần'],
          correctTiles: ['cho tôi', 'một phần', 'canh kim chi'],
        },
        {
          type: 'listen-choose',
          title: 'Nghe và chọn câu trả lời đúng',
          instruction: 'Lắng nghe nhân viên nhà hàng chào đón bạn:',
          prompt: '어서오세요! 몇 분이세요?',
          romanization: 'Eoseo-oseyo! Myeot bun-iseyo?',
          audioText: '어서오세요! 몇 분이세요?',
          options: [
            { id: '1', text: 'Chào mừng quý khách! Đi mấy người ạ?', correct: true },
            { id: '2', text: 'Xin hãy thanh toán bằng thẻ.', correct: false },
            { id: '3', text: 'Món này rất cay.', correct: false },
            { id: '4', text: 'Quán đã hết bàn rồi.', correct: false },
          ],
        },
        {
          type: 'speak',
          title: 'Luyện nói phát âm',
          instruction: 'Bấm vào biểu tượng mic và nói to rõ ràng:',
          prompt: '안녕하세요! 두 명이에요.',
          romanization: 'Annyeonghaseyo! Du myeong-ieyo.',
          audioText: '안녕하세요! 두 명이에요.',
        },
        {
          type: 'matching',
          title: 'Nối các cặp từ tương ứng',
          instruction: 'Chạm vào từ tiếng Hàn và nghĩa tương ứng:',
          prompt: 'Ghép đúng 3 cặp từ:',
          audioText: '저기요. 주세요. 계산하다.',
          pairs: [
            { id: '1', left: '저기요', right: 'Xin lỗi / Em ơi!' },
            { id: '2', left: '주세요', right: 'Làm ơn cho tôi' },
            { id: '3', left: '계산하다', right: 'Tính tiền / Thanh toán' },
          ],
        },
      ]
    : [
        {
          type: 'word-builder',
          title: 'Translate this sentence into Vietnamese',
          instruction: 'Tap the word tiles to assemble the correct sentence:',
          prompt: 'Could I please get an iced oat latte?',
          audioText: 'Could I please get an iced oat latte?',
          tiles: ['Cho tôi', 'ly latte', 'sữa yến mạch đá', 'với', 'nóng', 'trà xanh', 'được không'],
          correctTiles: ['Cho tôi', 'ly latte', 'sữa yến mạch đá', 'được không'],
        },
        {
          type: 'listen-choose',
          title: 'Listen and select the meaning',
          instruction: 'Listen to the barista inquire about your order:',
          prompt: 'Will that be for here or to go?',
          audioText: 'Will that be for here or to go?',
          options: [
            { id: '1', text: 'Bạn dùng ở đây hay mang đi ạ?', correct: true },
            { id: '2', text: 'Bạn muốn thanh toán bằng thẻ hay tiền mặt?', correct: false },
            { id: '3', text: 'Quán hôm nay hết cà phê rồi.', correct: false },
          ],
        },
        {
          type: 'speak',
          title: 'Speaking practice',
          instruction: 'Tap the mic and speak clearly:',
          prompt: 'Make that to go, please.',
          audioText: 'Make that to go, please.',
        },
      ];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStep = steps[currentStepIndex];

  // Word builder state
  const [selectedTiles, setSelectedTiles] = useState<string[]>([]);
  const [availableTiles, setAvailableTiles] = useState<string[]>(currentStep.tiles || []);

  // Listen choose state
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  // Speaking state
  const [isRecording, setIsRecording] = useState(false);
  const [spokenText, setSpokenText] = useState<string | null>(null);
  const [speakScore, setSpeakScore] = useState<number | null>(null);

  // Matching state
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);

  // Evaluation sheet state
  const [evaluationState, setEvaluationState] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [isFinished, setIsFinished] = useState(false);

  // Reset state when step changes
  useEffect(() => {
    if (currentStep) {
      setSelectedTiles([]);
      setAvailableTiles(currentStep.tiles ? [...currentStep.tiles] : []);
      setSelectedOptionId(null);
      setSpokenText(null);
      setSpeakScore(null);
      setMatchedPairs([]);
      setSelectedLeft(null);
      setSelectedRight(null);
      setEvaluationState('idle');

      // Auto play audio of prompt
      speakText(currentStep.audioText, isKo ? 'KO' : 'EN', 0.95);
    }
  }, [currentStepIndex]);

  // Word Tile Handler
  const handleTileClick = (word: string) => {
    if (evaluationState !== 'idle') return;
    setSelectedTiles((prev) => [...prev, word]);
    setAvailableTiles((prev) => {
      const idx = prev.indexOf(word);
      if (idx > -1) {
        const copy = [...prev];
        copy.splice(idx, 1);
        return copy;
      }
      return prev;
    });
  };

  const handleSelectedTileRemove = (word: string, index: number) => {
    if (evaluationState !== 'idle') return;
    setSelectedTiles((prev) => prev.filter((_, i) => i !== index));
    setAvailableTiles((prev) => [...prev, word]);
  };

  // Matching pair handler
  const handleLeftClick = (id: string) => {
    if (matchedPairs.includes(id) || evaluationState !== 'idle') return;
    setSelectedLeft(id);
    if (selectedRight) {
      checkPair(id, selectedRight);
    }
  };

  const handleRightClick = (id: string) => {
    if (matchedPairs.includes(id) || evaluationState !== 'idle') return;
    setSelectedRight(id);
    if (selectedLeft) {
      checkPair(selectedLeft, id);
    }
  };

  const checkPair = (leftId: string, rightId: string) => {
    if (leftId === rightId) {
      setMatchedPairs((prev) => [...prev, leftId]);
      setSelectedLeft(null);
      setSelectedRight(null);
    } else {
      setTimeout(() => {
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 500);
    }
  };

  // Speech Recording
  const handleRecord = async () => {
    setIsRecording(true);
    try {
      const res = await recordSpeech(isKo ? 'KO' : 'EN', currentStep.prompt);
      setSpokenText(res.transcript);
      setSpeakScore(res.accuracy);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRecording(false);
    }
  };

  // Determine if user has answered the question
  const hasAnswered = () => {
    if (currentStep.type === 'word-builder') {
      return selectedTiles.length > 0;
    }
    if (currentStep.type === 'listen-choose') {
      return selectedOptionId !== null;
    }
    if (currentStep.type === 'speak') {
      return speakScore !== null;
    }
    if (currentStep.type === 'matching') {
      return matchedPairs.length === (currentStep.pairs?.length || 3);
    }
    return false;
  };

  // Grade the answer
  const handleCheck = () => {
    let isCorrect = false;

    if (currentStep.type === 'word-builder') {
      const correctStr = (currentStep.correctTiles || []).join(' ');
      const userStr = selectedTiles.join(' ');
      isCorrect = userStr.trim() === correctStr.trim();
    } else if (currentStep.type === 'listen-choose') {
      const opt = currentStep.options?.find((o) => o.id === selectedOptionId);
      isCorrect = !!opt?.correct;
    } else if (currentStep.type === 'speak') {
      isCorrect = (speakScore || 0) >= 70;
    } else if (currentStep.type === 'matching') {
      isCorrect = matchedPairs.length === (currentStep.pairs?.length || 3);
    }

    if (isCorrect) {
      setEvaluationState('correct');
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.85 } });
    } else {
      setEvaluationState('wrong');
      decrementHeart();
    }
  };

  // Continue to next question or complete
  const handleContinue = () => {
    if (currentStepIndex + 1 < steps.length) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
      confetti({ particleCount: 100, spread: 90, origin: { y: 0.6 } });
      try {
        api.progress.completeLesson(id ? parseInt(id, 10) : 1, 100, 300);
      } catch (e) {}
    }
  };

  const progressPercent = Math.round(((currentStepIndex + 1) / steps.length) * 100);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--duo-bg)',
        color: 'var(--duo-text-primary)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        userSelect: 'none',
        transition: 'background-color 0.25s ease, color 0.25s ease',
      }}
    >
      {/* Top Header Bar */}
      <div
        style={{
          padding: '16px 24px',
          maxWidth: 900,
          width: '100%',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: 20,
        }}
      >
        {/* Exit Button */}
        <button
          onClick={() => navigate('/topics')}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--duo-text-secondary)',
            cursor: 'pointer',
            padding: 6,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <X size={26} />
        </button>

        {/* Chunky Duolingo Progress Bar */}
        <div style={{ flex: 1 }}>
          <div className="duo-progress-track">
            <div className="duo-progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          style={{
            background: 'var(--duo-card-bg)',
            border: '2px solid var(--duo-border)',
            color: 'var(--duo-text-secondary)',
            cursor: 'pointer',
            padding: '6px 10px',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            fontWeight: 800,
          }}
          title={themeMode === 'dark' ? 'Chuyển sang Giao diện Sáng' : 'Chuyển sang Giao diện Tối'}
        >
          {themeMode === 'dark' ? <Sun size={18} color="#FFC800" /> : <Moon size={18} color="#1CB0F6" />}
        </button>

        {/* Hearts Life Counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Heart size={22} color="#FF4B4B" fill="#FF4B4B" />
          <span style={{ fontSize: 18, fontWeight: 900, color: '#FF4B4B' }}>{hearts}</span>
        </div>
      </div>

      {/* Middle Interactive Exercise Area */}
      {!isFinished ? (
        <div
          style={{
            maxWidth: 680,
            width: '100%',
            margin: '0 auto',
            padding: '20px 24px 140px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          {/* Question Title & Instruction */}
          <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--duo-text-primary)', marginBottom: 6 }}>
            {currentStep.title}
          </h2>
          <p style={{ fontSize: 15, color: 'var(--duo-text-secondary)', marginBottom: 24 }}>
            {currentStep.instruction}
          </p>

          {/* Character / Prompt Box */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 28 }}>
            {/* Mascot Avatar */}
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #58CC02, #1CB0F6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 30,
                flexShrink: 0,
                border: '3px solid var(--duo-border)',
              }}
            >
              🦉
            </div>

            {/* Speech Bubble */}
            <div className="duo-speech-bubble" style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Audio Buttons */}
                <button
                  onClick={() => speakText(currentStep.audioText, isKo ? 'KO' : 'EN', 0.95)}
                  style={{
                    background: '#1CB0F6',
                    border: 'none',
                    borderBottom: '3px solid #1899D6',
                    color: '#FFFFFF',
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                  title="Nghe tốc độ chuẩn"
                >
                  <Volume2 size={20} />
                </button>

                <button
                  onClick={() => speakText(currentStep.audioText, isKo ? 'KO' : 'EN', 0.65)}
                  style={{
                    background: 'var(--duo-card-bg)',
                    border: '2px solid var(--duo-border)',
                    borderBottom: '3px solid var(--duo-border)',
                    color: 'var(--duo-text-primary)',
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                  title="Nghe chậm (Turtle speed)"
                >
                  🐢
                </button>

                <div>
                  <div
                    className={isKo ? 'lang-ko' : ''}
                    style={{ fontSize: 20, fontWeight: 900, color: 'var(--duo-text-primary)' }}
                  >
                    {currentStep.prompt}
                  </div>
                  {currentStep.romanization && (
                    <div style={{ fontSize: 13, color: 'var(--duo-text-muted)', fontStyle: 'italic', marginTop: 2 }}>
                      [{currentStep.romanization}]
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 1. WORD BUILDER TYPE */}
          {currentStep.type === 'word-builder' && (
            <div>
              {/* Answer Assembler Slot */}
              <div className="duo-word-slot" style={{ minHeight: 64, marginBottom: 28, padding: '10px 0' }}>
                {selectedTiles.length === 0 ? (
                  <span style={{ color: 'var(--duo-text-muted)', fontSize: 15 }}>
                    Chạm các từ bên dưới để xếp vào đây...
                  </span>
                ) : (
                  selectedTiles.map((tile, idx) => (
                    <button
                      key={idx}
                      className="duo-word-tile"
                      onClick={() => handleSelectedTileRemove(tile, idx)}
                      style={{ background: 'var(--duo-card-bg)', borderColor: '#58CC02', color: 'var(--duo-text-primary)' }}
                    >
                      {tile}
                    </button>
                  ))
                )}
              </div>

              {/* Tile Pool */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
                {availableTiles.map((tile, idx) => (
                  <button
                    key={idx}
                    className="duo-word-tile"
                    onClick={() => handleTileClick(tile)}
                  >
                    {tile}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. LISTEN & CHOOSE TYPE */}
          {currentStep.type === 'listen-choose' && currentStep.options && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {currentStep.options.map((opt) => {
                const isSelected = selectedOptionId === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => evaluationState === 'idle' && setSelectedOptionId(opt.id)}
                    className={`duo-card-interactive ${isSelected ? 'selected' : ''}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      fontSize: 16,
                      fontWeight: 700,
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        border: '2px solid var(--duo-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        fontWeight: 800,
                        color: isSelected ? '#1CB0F6' : 'var(--duo-text-muted)',
                        borderColor: isSelected ? '#1CB0F6' : 'var(--duo-border)',
                      }}
                    >
                      {opt.id}
                    </div>
                    <span>{opt.text}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* 3. SPEAKING TYPE */}
          {currentStep.type === 'speak' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ marginBottom: 20 }}>
                <button
                  onClick={handleRecord}
                  disabled={isRecording}
                  className={isRecording ? 'duo-mic-active' : ''}
                  style={{
                    width: 84,
                    height: 84,
                    borderRadius: '50%',
                    background: '#1CB0F6',
                    border: 'none',
                    borderBottom: '5px solid #1899D6',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Mic size={36} />
                </button>
                <div style={{ fontSize: 14, fontWeight: 800, marginTop: 12, color: isRecording ? '#FF4B4B' : 'var(--duo-text-secondary)' }}>
                  {isRecording ? 'Đang lắng nghe... Nói to rõ ràng!' : 'Chạm vào mic và đọc to'}
                </div>
              </div>

              {spokenText && (
                <div
                  className="duo-card"
                  style={{
                    display: 'inline-block',
                    padding: '14px 24px',
                    borderColor: (speakScore || 0) >= 70 ? '#58CC02' : '#FFC800',
                  }}
                >
                  <div style={{ fontSize: 13, color: 'var(--duo-text-muted)' }}>Máy nhận diện được:</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--duo-text-primary)', margin: '4px 0' }}>
                    "{spokenText}"
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: (speakScore || 0) >= 70 ? '#58CC02' : '#FFC800' }}>
                    Điểm chính xác: {speakScore}%
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. MATCHING PAIRS TYPE */}
          {currentStep.type === 'matching' && currentStep.pairs && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {/* Left Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {currentStep.pairs.map((p) => {
                  const isDone = matchedPairs.includes(p.id);
                  const isSel = selectedLeft === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleLeftClick(p.id)}
                      className={`duo-card-interactive ${isSel ? 'selected' : ''}`}
                      style={{
                        textAlign: 'center',
                        fontSize: 16,
                        fontWeight: 800,
                        opacity: isDone ? 0.35 : 1,
                        background: isDone ? (themeMode === 'dark' ? '#182B21' : '#D7FFB8') : undefined,
                        borderColor: isDone ? '#58CC02' : undefined,
                      }}
                    >
                      {p.left}
                    </div>
                  );
                })}
              </div>

              {/* Right Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {currentStep.pairs.map((p) => {
                  const isDone = matchedPairs.includes(p.id);
                  const isSel = selectedRight === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleRightClick(p.id)}
                      className={`duo-card-interactive ${isSel ? 'selected' : ''}`}
                      style={{
                        textAlign: 'center',
                        fontSize: 15,
                        fontWeight: 700,
                        opacity: isDone ? 0.35 : 1,
                        background: isDone ? (themeMode === 'dark' ? '#182B21' : '#D7FFB8') : undefined,
                        borderColor: isDone ? '#58CC02' : undefined,
                      }}
                    >
                      {p.right}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        // LESSON COMPLETED CELEBRATION SCREEN
        <div style={{ maxWidth: 540, width: '100%', margin: 'auto', textAlign: 'center', padding: 24 }}>
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FFC800, #FF9600)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
              boxShadow: '0 8px 24px rgba(255, 200, 0, 0.4)',
            }}
          >
            <Award size={54} color={themeMode === 'dark' ? '#131F24' : '#FFFFFF'} />
          </div>

          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#FFC800', marginBottom: 8 }}>
            Hoàn thành bài học! 🎉
          </h1>
          <p style={{ fontSize: 16, color: 'var(--duo-text-secondary)', marginBottom: 28 }}>
            Bạn đã xuất sắc vượt qua tất cả câu hỏi thực hành và tích lũy thêm điểm kinh nghiệm.
          </p>

          {/* Stats Badges */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 32 }}>
            <div className="duo-card" style={{ padding: '16px 24px', textAlign: 'center', borderColor: '#FFC800' }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#FFC800' }}>+50 XP</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--duo-text-muted)' }}>TỔNG XP</div>
            </div>
            <div className="duo-card" style={{ padding: '16px 24px', textAlign: 'center', borderColor: '#58CC02' }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#58CC02' }}>100%</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--duo-text-muted)' }}>ĐỘ CHÍNH XÁC</div>
            </div>
          </div>

          <button
            className="duo-btn-green"
            onClick={() => navigate('/conversation')}
            style={{ width: '100%', padding: '16px', fontSize: 17 }}
          >
            <span>Sang phòng luyện nói với AI</span>
            <ArrowRight size={20} />
          </button>
        </div>
      )}

      {/* Sticky Bottom Action Bar (Duolingo Style) */}
      {!isFinished && evaluationState === 'idle' && (
        <div
          style={{
            borderTop: '2px solid var(--duo-border)',
            padding: '20px 32px',
            background: 'var(--duo-header-bg)',
            display: 'flex',
            justifyContent: 'flex-end',
            position: 'sticky',
            bottom: 0,
            zIndex: 100,
            transition: 'background-color 0.25s ease, border-color 0.25s ease',
          }}
        >
          <button
            className="duo-btn-green"
            onClick={handleCheck}
            disabled={!hasAnswered()}
            style={{ minWidth: 160 }}
          >
            <span>KIỂM TRA</span>
          </button>
        </div>
      )}

      {/* Bottom Correct Drawer */}
      {evaluationState === 'correct' && (
        <div className="duo-sheet-correct">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: '#58CC02',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={32} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#58CC02' }}>Làm tốt lắm! 🎉</div>
              <div style={{ fontSize: 14, color: '#A5F3B0' }}>Bạn đã trả lời hoàn toàn chính xác.</div>
            </div>
          </div>

          <button className="duo-btn-green" onClick={handleContinue} style={{ minWidth: 160 }}>
            <span>TIẾP TỤC</span>
          </button>
        </div>
      )}

      {/* Bottom Wrong Drawer */}
      {evaluationState === 'wrong' && (
        <div className="duo-sheet-wrong">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: '#FF4B4B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <XCircle size={32} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#FF4B4B' }}>Chưa chính xác</div>
              <div style={{ fontSize: 13, color: '#FFB8B8', marginTop: 2 }}>
                Đáp án đúng:{' '}
                <strong>
                  {currentStep.type === 'word-builder'
                    ? (currentStep.correctTiles || []).join(' ')
                    : currentStep.options?.find((o) => o.correct)?.text || currentStep.prompt}
                </strong>
              </div>
            </div>
          </div>

          <button
            className="duo-btn-green"
            onClick={handleContinue}
            style={{ background: '#FF4B4B', borderBottomColor: '#EA2B2B', minWidth: 160 }}
          >
            <span>ĐÃ HIỂU</span>
          </button>
        </div>
      )}
    </div>
  );
};
