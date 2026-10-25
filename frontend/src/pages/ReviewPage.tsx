import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, Button, Input, Modal, Typography, Space, Tooltip, Progress, Pagination } from 'antd';
import {
  RotateCw,
  RotateCcw,
  Volume2,
  CheckCircle,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Search,
  BookOpen,
  Layers,
  Award,
  CheckCheck,
  Eye,
  Filter,
  Turtle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useAppStore } from '../stores/useAppStore';
import { Vocabulary, formatStatusVietnamese, formatPartOfSpeechVietnamese } from '../types';
import { speakText, speakSlow } from '../utils/speech';
import { localDataService } from '../services/localDataService';

const { Title, Text, Paragraph } = Typography;

export const ReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { targetLanguage } = useAppStore();
  const isKo = targetLanguage === 'KO';

  // Navigation tab: 'flashcard' (Học thẻ) or 'all' (Tất cả từ vựng)
  const [activeTab, setActiveTab] = useState<'flashcard' | 'all'>('flashcard');

  // Master vocabulary list for current language
  const [vocabList, setVocabList] = useState<Vocabulary[]>([]);
  const [loading, setLoading] = useState(true);

  // Flashcard Queue & index
  const [queue, setQueue] = useState<Vocabulary[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [hideMastered, setHideMastered] = useState(true);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  // All Vocab Tab Search & Detail Modal
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'MASTERED' | 'LEARNING' | 'NEW'>('ALL');
  const [selectedVocab, setSelectedVocab] = useState<Vocabulary | null>(null);
  const [allVocabPage, setAllVocabPage] = useState(1);

  const PAGE_SIZE_ALL = 20;

  useEffect(() => {
    loadVocab();
  }, [targetLanguage]);

  const loadVocab = async () => {
    try {
      setLoading(true);
      let list: Vocabulary[] = [];
      try {
        const data = await api.vocabulary.getAll(targetLanguage);
        if (data && data.length > 0) {
          list = data;
        } else {
          list = localDataService.getVocabulary(targetLanguage);
        }
      } catch {
        list = localDataService.getVocabulary(targetLanguage);
      }
      setVocabList(list);
      buildQueue(list, hideMastered);
    } finally {
      setLoading(false);
    }
  };

  const buildQueue = (allList: Vocabulary[], skipMastered: boolean) => {
    const filtered = skipMastered ? allList.filter((v) => v.userStatus !== 'MASTERED') : allList;
    setQueue(filtered);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionCompleted(false);
  };

  const handleToggleHideMastered = () => {
    const nextVal = !hideMastered;
    setHideMastered(nextVal);
    buildQueue(vocabList, nextVal);
  };

  // Mark word as Known / Mastered ("Đã biết / Bỏ qua")
  const handleMarkAsKnown = (vocabId?: number) => {
    const targetId = vocabId || queue[currentIndex]?.id;
    if (!targetId) return;

    localDataService.updateVocabStatus(targetId, 'MASTERED');

    // Update in-memory state
    const updatedList = vocabList.map((v) =>
      v.id === targetId ? { ...v, userStatus: 'MASTERED' as const } : v
    );
    setVocabList(updatedList);

    if (selectedVocab && selectedVocab.id === targetId) {
      setSelectedVocab({ ...selectedVocab, userStatus: 'MASTERED' });
    }

    // Advance flashcard
    if (activeTab === 'flashcard') {
      setIsFlipped(false);
      if (currentIndex + 1 < queue.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        triggerSessionComplete();
      }
    }
  };

  // Mark word as Needs Review ("Cần học lại")
  const handleMarkAsReview = (vocabId?: number) => {
    const current = queue[currentIndex];
    const targetId = vocabId || current?.id;
    if (!targetId) return;

    localDataService.updateVocabStatus(targetId, 'REVIEW');

    const updatedList = vocabList.map((v) =>
      v.id === targetId ? { ...v, userStatus: 'REVIEW' as const } : v
    );
    setVocabList(updatedList);

    if (selectedVocab && selectedVocab.id === targetId) {
      setSelectedVocab({ ...selectedVocab, userStatus: 'REVIEW' });
    }

    if (activeTab === 'flashcard' && current) {
      // Re-insert into queue so learner sees it again in this session
      setQueue((prev) => [...prev, current]);
      setIsFlipped(false);
      if (currentIndex + 1 < queue.length + 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        triggerSessionComplete();
      }
    }
  };

  const handleNextCard = () => {
    setIsFlipped(false);
    if (currentIndex + 1 < queue.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      triggerSessionComplete();
    }
  };

  const handlePrevCard = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const triggerSessionComplete = () => {
    setSessionCompleted(true);
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
  };

  const currentItem = queue[currentIndex];
  const masteredCount = vocabList.filter((v) => v.userStatus === 'MASTERED').length;
  const learningCount = vocabList.filter((v) => v.userStatus !== 'MASTERED').length;

  // Filtered list for "All Vocabulary" tab
  const filteredAllVocab = vocabList.filter((v) => {
    const matchesSearch =
      v.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.romanization && v.romanization.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    if (statusFilter === 'MASTERED') return v.userStatus === 'MASTERED';
    if (statusFilter === 'LEARNING') return v.userStatus === 'LEARNING' || v.userStatus === 'REVIEW';
    if (statusFilter === 'NEW') return !v.userStatus || v.userStatus === 'NEW';
    return true;
  });

  // Sort: new / learning words first, mastered words last!
  const sortedAllVocab = [...filteredAllVocab].sort((a, b) => {
    const aMastered = a.userStatus === 'MASTERED';
    const bMastered = b.userStatus === 'MASTERED';
    if (aMastered === bMastered) return 0;
    return aMastered ? 1 : -1;
  });

  const paginatedAllVocab = sortedAllVocab.slice(
    (allVocabPage - 1) * PAGE_SIZE_ALL,
    allVocabPage * PAGE_SIZE_ALL
  );

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', paddingBottom: 60 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
        <div>
          <Title level={2} style={{ color: 'var(--duo-text-primary)', margin: 0, fontWeight: 900 }}>
            {isKo ? 'Học & Ôn tập từ vựng tiếng Hàn 🇰🇷' : 'Học & Ôn tập từ vựng tiếng Anh 🇺🇸'}
          </Title>
          <Text style={{ color: 'var(--duo-text-secondary)', fontSize: 14 }}>
            Luyện flashcard ghi nhớ nhanh, đánh dấu từ đã biết và tra cứu danh sách toàn bộ từ vựng.
          </Text>
        </div>

        {/* Mastered Counter Badge */}
        <div className="duo-stat-pill" style={{ background: 'rgba(88, 204, 2, 0.12)', border: '1.5px solid rgba(88, 204, 2, 0.35)', color: '#58CC02' }}>
          <CheckCheck size={18} color="#58CC02" />
          <span>Đã thuộc {masteredCount} / {vocabList.length} từ</span>
        </div>
      </div>

      {/* Top Tab Bar */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          background: 'var(--duo-card-bg)',
          padding: 6,
          borderRadius: 16,
          border: '1.5px solid var(--duo-border)',
          marginBottom: 26,
        }}
      >
        <button
          onClick={() => setActiveTab('flashcard')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '12px 18px',
            borderRadius: 12,
            border: 'none',
            cursor: 'pointer',
            fontWeight: 800,
            fontSize: 15,
            transition: 'all 0.15s ease',
            background: activeTab === 'flashcard' ? 'var(--duo-card-hover, rgba(88, 204, 2, 0.12))' : 'transparent',
            color: activeTab === 'flashcard' ? '#58CC02' : 'var(--duo-text-secondary)',
            boxShadow: activeTab === 'flashcard' ? '0 2px 8px rgba(88, 204, 2, 0.15)' : 'none',
          }}
        >
          <BookOpen size={18} />
          <span>Học thẻ Flashcard</span>
          {learningCount > 0 && (
            <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 10, background: '#FF9600', color: '#FFF' }}>
              {learningCount} cần học
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('all')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '12px 18px',
            borderRadius: 12,
            border: 'none',
            cursor: 'pointer',
            fontWeight: 800,
            fontSize: 15,
            transition: 'all 0.15s ease',
            background: activeTab === 'all' ? 'var(--duo-card-hover, rgba(28, 176, 246, 0.12))' : 'transparent',
            color: activeTab === 'all' ? '#1CB0F6' : 'var(--duo-text-secondary)',
            boxShadow: activeTab === 'all' ? '0 2px 8px rgba(28, 176, 246, 0.15)' : 'none',
          }}
        >
          <Layers size={18} />
          <span>Tất cả từ vựng ({vocabList.length})</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: FLASHCARD QUIZ VIEW */}
      {/* ============================================================ */}
      {activeTab === 'flashcard' && (
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          {/* Controls: Skip known toggle + Progress */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <button
              onClick={handleToggleHideMastered}
              style={{
                background: hideMastered ? 'rgba(88, 204, 2, 0.12)' : 'var(--duo-card-bg)',
                border: hideMastered ? '1.5px solid #58CC02' : '1.5px solid var(--duo-border)',
                color: hideMastered ? '#58CC02' : 'var(--duo-text-secondary)',
                borderRadius: 12,
                padding: '6px 14px',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <CheckCircle size={15} />
              <span>{hideMastered ? 'Đang bỏ qua từ đã thuộc' : 'Đang học tất cả (kể cả từ đã thuộc)'}</span>
            </button>

            {!sessionCompleted && queue.length > 0 && (
              <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--duo-text-secondary)' }}>
                Thẻ {currentIndex + 1} / {queue.length}
              </span>
            )}
          </div>

          {/* Progress Bar */}
          {!sessionCompleted && queue.length > 0 && (
            <div className="duo-progress-track" style={{ height: 10, marginBottom: 20 }}>
              <div
                className="duo-progress-fill"
                style={{ width: `${Math.round(((currentIndex) / queue.length) * 100)}%` }}
              />
            </div>
          )}

          {/* Flashcard Body */}
          {!sessionCompleted && currentItem ? (
            <div>
              <div style={{ perspective: 1000, marginBottom: 24 }}>
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="duo-card duo-card-interactive"
                  style={{
                    padding: '48px 32px',
                    minHeight: 360,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    textAlign: 'center',
                    cursor: 'pointer',
                    borderRadius: 24,
                  }}
                >
                  {/* Top Tags */}
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Tag color="purple" style={{ borderRadius: 6, fontWeight: 800 }}>
                      {formatPartOfSpeechVietnamese(currentItem.partOfSpeech)}
                    </Tag>

                    <Tag
                      color={currentItem.userStatus === 'MASTERED' ? 'green' : currentItem.userStatus === 'REVIEW' ? 'orange' : 'blue'}
                      style={{ borderRadius: 6, fontWeight: 800 }}
                    >
                      {formatStatusVietnamese(currentItem.userStatus)}
                    </Tag>
                  </div>

                  {/* Card Center */}
                  {!isFlipped ? (
                    // Mặt trước: Từ vựng + Phiên âm + Nút loa
                    <div style={{ margin: 'auto 0' }}>
                      <div
                        className={isKo ? 'lang-ko' : ''}
                        style={{
                          fontSize: 'clamp(2.4rem, 6vw, 3.4rem)',
                          fontWeight: 900,
                          color: 'var(--duo-text-primary)',
                          marginBottom: 10,
                        }}
                      >
                        {currentItem.word}
                      </div>

                      {currentItem.romanization && (
                        <div style={{ fontSize: 17, color: '#1CB0F6', fontStyle: 'italic', marginBottom: 16 }}>
                          [{currentItem.romanization}]
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            speakText(currentItem.word, isKo ? 'KO' : 'EN', 0.95);
                          }}
                          className="duo-btn-outline"
                          style={{ padding: '8px 18px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                          title="Nghe phát âm bình thường (1.0x)"
                        >
                          <Volume2 size={18} color="#1CB0F6" />
                          <span>Nghe</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            speakSlow(currentItem.word, isKo ? 'KO' : 'EN');
                          }}
                          className="duo-btn-outline"
                          style={{ padding: '8px 16px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 6, color: '#58CC02', borderColor: 'rgba(88, 204, 2, 0.4)' }}
                          title="Nghe phát âm chậm (chú rùa 🐢 0.6x)"
                        >
                          <Turtle size={18} color="#58CC02" />
                          <span>Chậm</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Mặt sau: Ý nghĩa + Ví dụ
                    <div style={{ margin: 'auto 0', maxWidth: 540 }}>
                      <div style={{ fontSize: 28, fontWeight: 900, color: '#58CC02', marginBottom: 8 }}>
                        {currentItem.meaning}
                      </div>

                      {currentItem.pronunciationIpa && (
                        <div style={{ fontSize: 14, color: '#1CB0F6', marginBottom: 12, fontWeight: 700 }}>
                          IPA: {currentItem.pronunciationIpa}
                        </div>
                      )}

                      {currentItem.exampleSentence && (
                        <div
                          style={{
                            padding: 16,
                            borderRadius: 14,
                            background: 'var(--duo-bg)',
                            border: '1.5px solid var(--duo-border)',
                            marginTop: 12,
                            textAlign: 'left',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <div className={isKo ? 'lang-ko' : ''} style={{ fontSize: 16, fontWeight: 800, color: 'var(--duo-text-primary)' }}>
                              "{currentItem.exampleSentence}"
                            </div>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  speakText(currentItem.exampleSentence!, isKo ? 'KO' : 'EN', 0.95);
                                }}
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}
                                title="Nghe câu ví dụ tốc độ bình thường"
                              >
                                <Volume2 size={16} color="#1CB0F6" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  speakSlow(currentItem.exampleSentence!, isKo ? 'KO' : 'EN');
                                }}
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}
                                title="Nghe câu ví dụ chậm (chú rùa 🐢)"
                              >
                                <Turtle size={16} color="#58CC02" />
                              </button>
                            </div>
                          </div>
                          {currentItem.translation && (
                            <div style={{ fontSize: 14, color: 'var(--duo-text-secondary)' }}>
                              👉 {currentItem.translation}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bottom hint */}
                  <div style={{ fontSize: 12, color: 'var(--duo-text-muted)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, marginTop: 20 }}>
                    <RotateCw size={14} />
                    <span>Chạm vào thẻ để {isFlipped ? 'xem từ gốc' : 'lật xem nghĩa & câu ví dụ'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Tập trung vào học từ, có nút "Đã biết" để bỏ qua */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
                {/* Nút Quay lại */}
                <button
                  onClick={handlePrevCard}
                  disabled={currentIndex === 0}
                  className="duo-btn-outline"
                  style={{
                    padding: '14px 12px',
                    borderRadius: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    opacity: currentIndex === 0 ? 0.4 : 1,
                    cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  <ArrowLeft size={18} />
                  <span>Từ trước</span>
                </button>

                {/* Nút Cần học lại */}
                <button
                  onClick={() => handleMarkAsReview()}
                  style={{
                    padding: '14px 12px',
                    borderRadius: 14,
                    background: 'rgba(255, 150, 0, 0.12)',
                    border: '2px solid rgba(255, 150, 0, 0.4)',
                    borderBottom: '4px solid #E58500',
                    color: '#FF9600',
                    cursor: 'pointer',
                    fontWeight: 900,
                    fontSize: 15,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <RotateCcw size={18} />
                  <span>Cần ôn lại</span>
                </button>

                {/* Nút Tiếp theo */}
                <button
                  onClick={handleNextCard}
                  style={{
                    padding: '14px 12px',
                    borderRadius: 14,
                    background: 'rgba(28, 176, 246, 0.12)',
                    border: '2px solid rgba(28, 176, 246, 0.4)',
                    borderBottom: '4px solid #1899D6',
                    color: '#1CB0F6',
                    cursor: 'pointer',
                    fontWeight: 900,
                    fontSize: 15,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>Tiếp theo</span>
                  <ArrowRight size={18} />
                </button>

                {/* Nút ĐÃ BIẾT (Để sau này tự động bỏ qua cho nhanh) */}
                <button
                  onClick={() => handleMarkAsKnown()}
                  style={{
                    padding: '14px 14px',
                    borderRadius: 14,
                    background: '#58CC02',
                    border: '2px solid #58CC02',
                    borderBottom: '4px solid #46A302',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    fontWeight: 900,
                    fontSize: 15,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    boxShadow: '0 4px 12px rgba(88, 204, 2, 0.3)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <CheckCircle size={18} />
                  <span>Đã biết (Bỏ qua)</span>
                </button>
              </div>
            </div>
          ) : sessionCompleted ? (
            // Completed Session View
            <div className="duo-card" style={{ padding: 48, textAlign: 'center' }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FFC800, #FF9600)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                  boxShadow: '0 8px 24px rgba(255, 200, 0, 0.4)',
                }}
              >
                <Award size={44} color="#131F24" />
              </div>

              <h2 style={{ fontSize: 26, fontWeight: 900, color: 'var(--duo-text-primary)', marginBottom: 8 }}>
                Hoàn thành phiên học hôm nay! 🎉
              </h2>
              <p style={{ color: 'var(--duo-text-secondary)', fontSize: 15, maxWidth: 500, margin: '0 auto 24px', lineHeight: 1.5 }}>
                Bạn đã lướt qua toàn bộ từ vựng cần học. Những từ bạn bấm <b>"Đã biết"</b> sẽ được lưu lại để bỏ qua cho các lần học tới!
              </p>

              <Space size="middle" wrap style={{ justifyContent: 'center' }}>
                <button
                  className="duo-btn-green"
                  onClick={() => buildQueue(vocabList, hideMastered)}
                >
                  <RotateCcw size={18} />
                  <span>Học lại lần nữa</span>
                </button>

                <button
                  className="duo-btn-outline"
                  onClick={() => setActiveTab('all')}
                >
                  <Layers size={18} />
                  <span>Xem danh sách từ vựng</span>
                </button>
              </Space>
            </div>
          ) : (
            // No words to study
            <div className="duo-card" style={{ padding: 48, textAlign: 'center' }}>
              <CheckCircle size={44} color="#58CC02" style={{ marginBottom: 16 }} />
              <h3 style={{ fontSize: 22, fontWeight: 900, color: 'var(--duo-text-primary)', marginBottom: 8 }}>
                Tuyệt vời! Bạn đã thuộc hết từ vựng! 🌟
              </h3>
              <p style={{ color: 'var(--duo-text-secondary)', fontSize: 15, maxWidth: 480, margin: '0 auto 24px' }}>
                Không còn từ nào trong danh sách cần học. Bạn có thể bấm nút bên dưới để ôn tập lại cả những từ đã thuộc, hoặc xem danh sách tất cả từ vựng.
              </p>
              <Space size="middle" wrap style={{ justifyContent: 'center' }}>
                <button
                  className="duo-btn-outline"
                  onClick={() => {
                    setHideMastered(false);
                    buildQueue(vocabList, false);
                  }}
                >
                  <RotateCcw size={16} />
                  <span>Ôn lại tất cả từ đã thuộc</span>
                </button>
                <button className="duo-btn-green" onClick={() => setActiveTab('all')}>
                  <span>Xem tất cả từ vựng</span>
                </button>
              </Space>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: SHOW TOÀN BỘ TỪ VỰNG & CLICK XEM CHI TIẾT */}
      {/* ============================================================ */}
      {activeTab === 'all' && (
        <div>
          {/* Search & Filter Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
              marginBottom: 20,
            }}
          >
            <div style={{ flex: 1, minWidth: 260 }}>
              <Input
                prefix={<Search size={16} color="var(--duo-text-muted)" />}
                placeholder="Tìm kiếm từ, phiên âm hoặc ý nghĩa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                allowClear
                style={{
                  background: 'var(--duo-card-bg)',
                  borderColor: 'var(--duo-border)',
                  color: 'var(--duo-text-primary)',
                  borderRadius: 12,
                  padding: '10px 14px',
                }}
              />
            </div>

            {/* Status Filter Buttons */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                onClick={() => setStatusFilter('ALL')}
                style={{
                  padding: '8px 14px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: statusFilter === 'ALL' ? '1.5px solid #1CB0F6' : '1.5px solid var(--duo-border)',
                  background: statusFilter === 'ALL' ? 'rgba(28, 176, 246, 0.12)' : 'var(--duo-card-bg)',
                  color: statusFilter === 'ALL' ? '#1CB0F6' : 'var(--duo-text-secondary)',
                }}
              >
                Tất cả ({vocabList.length})
              </button>

              <button
                onClick={() => setStatusFilter('LEARNING')}
                style={{
                  padding: '8px 14px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: statusFilter === 'LEARNING' ? '1.5px solid #FF9600' : '1.5px solid var(--duo-border)',
                  background: statusFilter === 'LEARNING' ? 'rgba(255, 150, 0, 0.12)' : 'var(--duo-card-bg)',
                  color: statusFilter === 'LEARNING' ? '#FF9600' : 'var(--duo-text-secondary)',
                }}
              >
                Cần học ({learningCount})
              </button>

              <button
                onClick={() => setStatusFilter('MASTERED')}
                style={{
                  padding: '8px 14px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: statusFilter === 'MASTERED' ? '1.5px solid #58CC02' : '1.5px solid var(--duo-border)',
                  background: statusFilter === 'MASTERED' ? 'rgba(88, 204, 2, 0.12)' : 'var(--duo-card-bg)',
                  color: statusFilter === 'MASTERED' ? '#58CC02' : 'var(--duo-text-secondary)',
                }}
              >
                Đã thuộc ({masteredCount})
              </button>
            </div>
          </div>

          {/* Vocabulary List Items */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {paginatedAllVocab.map((item) => {
              const isMastered = item.userStatus === 'MASTERED';

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedVocab(item)}
                  className="duo-card duo-card-interactive"
                  style={{
                    padding: 18,
                    cursor: 'pointer',
                    borderRadius: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 12,
                    border: isMastered ? '1.5px solid rgba(88, 204, 2, 0.35)' : '1.5px solid var(--duo-border)',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <Tag color="purple" style={{ borderRadius: 6, fontWeight: 700, margin: 0 }}>
                        {formatPartOfSpeechVietnamese(item.partOfSpeech)}
                      </Tag>

                      <Tag
                        color={isMastered ? 'green' : 'orange'}
                        style={{ borderRadius: 6, fontWeight: 700, margin: 0 }}
                      >
                        {isMastered ? 'ĐÃ THUỘC' : 'CẦN HỌC'}
                      </Tag>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div
                        className={isKo ? 'lang-ko' : ''}
                        style={{ fontSize: 20, fontWeight: 900, color: 'var(--duo-text-primary)' }}
                      >
                        {item.word}
                      </div>

                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            speakText(item.word, isKo ? 'KO' : 'EN', 0.95);
                          }}
                          style={{
                            background: 'rgba(28, 176, 246, 0.1)',
                            border: 'none',
                            borderRadius: 8,
                            padding: '6px 8px',
                            cursor: 'pointer',
                            color: '#1CB0F6',
                          }}
                          title="Nghe bình thường"
                        >
                          <Volume2 size={16} />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            speakSlow(item.word, isKo ? 'KO' : 'EN');
                          }}
                          style={{
                            background: 'rgba(88, 204, 2, 0.1)',
                            border: 'none',
                            borderRadius: 8,
                            padding: '6px 8px',
                            cursor: 'pointer',
                            color: '#58CC02',
                          }}
                          title="Nghe chậm (chú rùa 🐢)"
                        >
                          <Turtle size={16} />
                        </button>
                      </div>
                    </div>

                    {item.romanization && (
                      <div style={{ fontSize: 13, color: '#1CB0F6', fontStyle: 'italic', marginTop: 2 }}>
                        [{item.romanization}]
                      </div>
                    )}

                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--duo-text-secondary)', marginTop: 8 }}>
                      {item.meaning}
                    </div>
                  </div>

                  <div style={{ fontSize: 12, color: 'var(--duo-text-muted)', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                    <Eye size={13} />
                    <span>Bấm vào để xem phiên âm & ví dụ</span>
                  </div>
                </div>
              );
            })}
          </div>

          {sortedAllVocab.length > PAGE_SIZE_ALL && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 28 }}>
              <Pagination
                current={allVocabPage}
                pageSize={PAGE_SIZE_ALL}
                total={sortedAllVocab.length}
                onChange={(page) => {
                  setAllVocabPage(page);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                showSizeChanger={false}
                showTotal={(total, range) => `Hiển thị ${range[0]} - ${range[1]} / ${total} từ vựng`}
              />
            </div>
          )}

          {sortedAllVocab.length === 0 && (
            <div className="duo-card" style={{ padding: 40, textAlign: 'center', marginTop: 20 }}>
              <p style={{ color: 'var(--duo-text-secondary)', fontSize: 15, margin: 0 }}>
                Không tìm thấy từ vựng nào khớp với từ khóa tìm kiếm.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL CHI TIẾT TỪ VỰNG KHI CLICK VÀO TỪ */}
      {/* ============================================================ */}
      <Modal
        open={!!selectedVocab}
        onCancel={() => setSelectedVocab(null)}
        footer={null}
        centered
        width={560}
      >
        {selectedVocab && (
          <div style={{ padding: '12px 8px' }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <Tag color="purple" style={{ borderRadius: 6, fontWeight: 800 }}>
                {formatPartOfSpeechVietnamese(selectedVocab.partOfSpeech)}
              </Tag>

              <Tag
                color={selectedVocab.userStatus === 'MASTERED' ? 'green' : 'orange'}
                style={{ borderRadius: 6, fontWeight: 800 }}
              >
                {selectedVocab.userStatus === 'MASTERED' ? 'ĐÃ THUỘC (BỎ QUA KHI HỌC)' : 'ĐANG HỌC'}
              </Tag>
            </div>

            {/* Word & Pronunciation */}
            <div style={{ textAlign: 'center', padding: '12px 0 16px' }}>
              <div
                className={isKo ? 'lang-ko' : ''}
                style={{ fontSize: 34, fontWeight: 900, color: 'var(--duo-text-primary)', marginBottom: 6 }}
              >
                {selectedVocab.word}
              </div>

              {selectedVocab.romanization && (
                <div style={{ fontSize: 17, color: '#1CB0F6', fontStyle: 'italic', marginBottom: 6 }}>
                  [{selectedVocab.romanization}]
                </div>
              )}

              {selectedVocab.pronunciationIpa && (
                <div style={{ fontSize: 14, color: '#58CC02', fontWeight: 700, marginBottom: 12 }}>
                  Phiên âm IPA: {selectedVocab.pronunciationIpa}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 12 }}>
                <button
                  onClick={() => speakText(selectedVocab.word, isKo ? 'KO' : 'EN', 0.95)}
                  className="duo-btn-outline"
                  style={{ padding: '8px 18px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  title="Nghe phát âm chuẩn tốc độ bình thường (1.0x)"
                >
                  <Volume2 size={18} color="#1CB0F6" />
                  <span>Nghe phát âm chuẩn</span>
                </button>

                <button
                  onClick={() => speakSlow(selectedVocab.word, isKo ? 'KO' : 'EN')}
                  className="duo-btn-outline"
                  style={{ padding: '8px 16px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 6, color: '#58CC02', borderColor: 'rgba(88, 204, 2, 0.4)' }}
                  title="Nghe phát âm chậm (chú rùa 🐢 0.6x)"
                >
                  <Turtle size={18} color="#58CC02" />
                  <span>Nghe chậm</span>
                </button>
              </div>
            </div>

            {/* Meaning */}
            <div
              style={{
                background: 'var(--duo-bg)',
                padding: '16px 20px',
                borderRadius: 14,
                border: '1.5px solid var(--duo-border)',
                marginBottom: 16,
              }}
            >
              <div style={{ fontSize: 13, color: 'var(--duo-text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>
                Định nghĩa tiếng Việt:
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#58CC02' }}>
                {selectedVocab.meaning}
              </div>
            </div>

            {/* Example Sentence */}
            {selectedVocab.exampleSentence && (
              <div
                style={{
                  background: 'var(--duo-bg)',
                  padding: '16px 20px',
                  borderRadius: 14,
                  border: '1.5px solid var(--duo-border)',
                  marginBottom: 20,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ fontSize: 13, color: 'var(--duo-text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>
                    Câu ví dụ ngữ cảnh:
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <button
                      onClick={() => speakText(selectedVocab.exampleSentence!, isKo ? 'KO' : 'EN', 0.95)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2 }}
                      title="Nghe ví dụ bình thường"
                    >
                      <Volume2 size={16} color="#1CB0F6" />
                    </button>
                    <button
                      onClick={() => speakSlow(selectedVocab.exampleSentence!, isKo ? 'KO' : 'EN')}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2 }}
                      title="Nghe ví dụ chậm (chú rùa 🐢)"
                    >
                      <Turtle size={16} color="#58CC02" />
                    </button>
                  </div>
                </div>
                <div className={isKo ? 'lang-ko' : ''} style={{ fontSize: 16, fontWeight: 800, color: 'var(--duo-text-primary)' }}>
                  "{selectedVocab.exampleSentence}"
                </div>
                {selectedVocab.translation && (
                  <div style={{ fontSize: 14, color: 'var(--duo-text-secondary)', marginTop: 4 }}>
                    👉 {selectedVocab.translation}
                  </div>
                )}
              </div>
            )}

            {/* Morpheme Breakdown if available */}
            {selectedVocab.breakdownJson && (() => {
              let breakdownData: any = null;
              try {
                breakdownData = JSON.parse(selectedVocab.breakdownJson);
              } catch (e) {}
              if (!breakdownData) return null;
              return (
                <div
                  style={{
                    marginBottom: 16,
                    padding: '12px 18px',
                    borderRadius: 12,
                    background: 'rgba(124, 58, 237, 0.08)',
                    border: '1.5px solid rgba(124, 58, 237, 0.28)',
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#8B5CF6', textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>🧩</span>
                    <span>Cấu tạo & Hình thái từ:</span>
                  </div>
                  {breakdownData.morphemes ? (
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 15, lineHeight: 1.6 }}>
                      {breakdownData.morphemes.map((m: any, i: number) => (
                        <span key={i} style={{ color: 'var(--duo-text-primary)' }}>
                          <strong style={{ color: '#D97706', fontSize: 16, fontWeight: 800 }}>{m.part}</strong>{' '}
                          <span style={{ color: 'var(--duo-text-secondary)', fontWeight: 600 }}>({m.meaning})</span>
                          {i < breakdownData.morphemes.length - 1 && (
                            <span style={{ margin: '0 6px', color: '#8B5CF6', fontWeight: 800 }}>+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })()}

            {/* Extra notes: Morphemes or pronunciation rules */}
            {(selectedVocab.batchimRules || selectedVocab.soundChanges) && (
              <div style={{ fontSize: 14, color: 'var(--duo-text-secondary)', marginBottom: 16, padding: '12px 16px', borderRadius: 12, background: 'rgba(28, 176, 246, 0.08)', lineHeight: 1.6 }}>
                {selectedVocab.batchimRules && <div>📝 <b>Quy tắc:</b> {selectedVocab.batchimRules}</div>}
                {selectedVocab.soundChanges && <div style={{ marginTop: 4 }}>🔊 <b>Biến âm:</b> {selectedVocab.soundChanges}</div>}
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
              {selectedVocab.userStatus === 'MASTERED' ? (
                <button
                  onClick={() => handleMarkAsReview(selectedVocab.id)}
                  style={{
                    padding: '12px 18px',
                    borderRadius: 12,
                    background: 'rgba(255, 150, 0, 0.12)',
                    border: '1.5px solid #FF9600',
                    color: '#FF9600',
                    cursor: 'pointer',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <RotateCcw size={16} />
                  <span>Đánh dấu cần học lại</span>
                </button>
              ) : (
                <button
                  onClick={() => handleMarkAsKnown(selectedVocab.id)}
                  style={{
                    padding: '12px 18px',
                    borderRadius: 12,
                    background: '#58CC02',
                    border: '1.5px solid #46A302',
                    color: '#FFF',
                    cursor: 'pointer',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <CheckCircle size={16} />
                  <span>Đánh dấu Đã biết (Bỏ qua khi học)</span>
                </button>
              )}

              <button
                onClick={() => setSelectedVocab(null)}
                className="duo-btn-outline"
                style={{ padding: '12px 18px', borderRadius: 12 }}
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
