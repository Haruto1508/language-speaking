import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, Button, Progress, Typography, Space } from 'antd';
import {
  RotateCw,
  Volume2,
  CheckCircle,
  Repeat,
  Flame,
  Award,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useAppStore } from '../stores/useAppStore';
import { ReviewItem, formatStatusVietnamese, formatPartOfSpeechVietnamese } from '../types';
import { speakText } from '../utils/speech';

import { localDataService } from '../services/localDataService';

const { Title, Text, Paragraph } = Typography;

export const ReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { targetLanguage } = useAppStore();

  const [queue, setQueue] = useState<ReviewItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    loadDueReviews();
  }, [targetLanguage]);

  const loadDueReviews = async () => {
    try {
      setLoading(true);
      const data = await api.reviews.getDue(10);
      if (data && data.length > 0) {
        setQueue(data);
      } else {
        setQueue(localDataService.getDueReviews(targetLanguage, 10));
      }
    } catch {
      setQueue(localDataService.getDueReviews(targetLanguage, 10));
    } finally {
      setLoading(false);
    }
  };

  const handleRateCard = async (rating: number) => {
    const current = queue[currentIndex];
    if (!current) return;

    try {
      await api.reviews.submit(current.vocabularyId, rating);
    } catch {
      // offline rate update
      const newStatus = rating >= 3 ? 'MASTERED' : rating === 2 ? 'LEARNING' : 'REVIEW';
      localDataService.updateVocabStatus(current.vocabularyId, newStatus);
    }

    setCompletedCount((prev) => prev + 1);
    setIsFlipped(false);

    if (currentIndex + 1 < queue.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Finished all cards in queue!
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      setCurrentIndex(queue.length);
    }
  };

  const isKo = targetLanguage === 'KO';
  const currentItem = queue[currentIndex];
  const isDone = currentIndex >= queue.length && queue.length > 0;

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ color: 'var(--duo-text-primary)', margin: 0, fontWeight: 900 }}>
            Ôn tập Lặp lại Ngắt quãng Thông minh 🧠
          </Title>
          <Text style={{ color: 'var(--duo-text-secondary)', fontSize: 14 }}>
            Thuật toán SM-2 tự động phân tích độ nhớ để kích hoạt từ vựng vào trí nhớ dài hạn.
          </Text>
        </div>

        <div className="duo-stat-pill streak">
          <Flame size={18} color="#FF9600" className="flame-bounce" />
          <span>5 Ngày Liên tục 🔥</span>
        </div>
      </div>

      {!isDone && queue.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--duo-text-secondary)', marginBottom: 6, fontWeight: 700 }}>
            <span>Thẻ {currentIndex + 1} trên {queue.length}</span>
            <span style={{ color: '#58CC02' }}>{Math.round((completedCount / queue.length) * 100)}% Hoàn thành</span>
          </div>
          <div className="duo-progress-track" style={{ height: 10 }}>
            <div className="duo-progress-fill" style={{ width: `${Math.round((completedCount / queue.length) * 100)}%` }} />
          </div>
        </div>
      )}

      {/* Main Flashcard */}
      {!isDone && currentItem ? (
        <div style={{ perspective: 1000, margin: '20px 0 28px' }}>
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="duo-card duo-card-interactive"
            style={{
              padding: '48px 36px',
              minHeight: 350,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              textAlign: 'center',
              cursor: 'pointer',
              position: 'relative',
              borderRadius: 22,
            }}
          >
            {/* Top Badges */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Tag color="purple" style={{ borderRadius: 6, fontWeight: 800 }}>
                {formatPartOfSpeechVietnamese(currentItem.partOfSpeech)}
              </Tag>
              <Tag color={currentItem.status === 'MASTERED' ? 'green' : 'blue'} style={{ borderRadius: 6, fontWeight: 800 }}>
                {formatStatusVietnamese(currentItem.status)}
              </Tag>
            </div>

            {/* Middle Card Content */}
            {!isFlipped ? (
              // FRONT OF FLASHCARD
              <div style={{ margin: 'auto 0' }}>
                <div
                  className={isKo ? 'lang-ko' : ''}
                  style={{
                    fontSize: 'clamp(2.2rem, 5.5vw, 3.2rem)',
                    fontWeight: 900,
                    color: 'var(--duo-text-primary)',
                    marginBottom: 12,
                  }}
                >
                  {currentItem.word}
                </div>

                {currentItem.romanization && (
                  <div style={{ fontSize: 16, color: '#1CB0F6', fontStyle: 'italic', marginBottom: 14 }}>
                    [{currentItem.romanization}]
                  </div>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    speakText(currentItem.word, isKo ? 'KO' : 'EN', 0.9);
                  }}
                  className="duo-btn-outline"
                  style={{ padding: '8px 18px', borderRadius: 20 }}
                >
                  <Volume2 size={18} color="#1CB0F6" />
                  <span>Nghe phát âm</span>
                </button>
              </div>
            ) : (
              // BACK OF FLASHCARD
              <div style={{ margin: 'auto 0', maxWidth: 540 }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#58CC02', marginBottom: 12 }}>
                  {currentItem.meaning}
                </div>

                {currentItem.pronunciationIpa && (
                  <div style={{ fontSize: 14, color: '#1CB0F6', marginBottom: 12, fontWeight: 600 }}>
                    IPA: {currentItem.pronunciationIpa}
                  </div>
                )}

                {currentItem.exampleSentence && (
                  <div
                    style={{
                      padding: 14,
                      borderRadius: 12,
                      background: 'var(--duo-bg)',
                      border: '1.5px solid var(--duo-border)',
                      marginTop: 14,
                      textAlign: 'left',
                    }}
                  >
                    <div className={isKo ? 'lang-ko' : ''} style={{ fontSize: 15, fontWeight: 800, color: 'var(--duo-text-primary)' }}>
                      "{currentItem.exampleSentence}"
                    </div>
                    {currentItem.translation && (
                      <div style={{ fontSize: 13, color: 'var(--duo-text-secondary)', marginTop: 4 }}>
                        {currentItem.translation}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Bottom Flip Instruction */}
            <div style={{ fontSize: 12, color: 'var(--duo-text-muted)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
              <RotateCw size={14} />
              <span>Chạm vào thẻ để {isFlipped ? 'xem mặt trước' : 'xem nghĩa và câu ví dụ'}</span>
            </div>
          </div>

          {/* Confidence Rating Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 18 }}>
            <button
              onClick={() => handleRateCard(1)}
              style={{
                padding: '14px 10px',
                borderRadius: 14,
                background: 'rgba(255, 75, 75, 0.12)',
                border: '2px solid rgba(255, 75, 75, 0.35)',
                borderBottom: '4px solid #EA2B2B',
                color: '#FF4B4B',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 15 }}>Chưa nhớ (1)</div>
              <div style={{ fontSize: 11, color: 'var(--duo-text-muted)', marginTop: 2, fontWeight: 700 }}>&lt; 10 phút</div>
            </button>

            <button
              onClick={() => handleRateCard(2)}
              style={{
                padding: '14px 10px',
                borderRadius: 14,
                background: 'rgba(255, 150, 0, 0.12)',
                border: '2px solid rgba(255, 150, 0, 0.35)',
                borderBottom: '4px solid #E58500',
                color: '#FF9600',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 15 }}>Khá khó (2)</div>
              <div style={{ fontSize: 11, color: 'var(--duo-text-muted)', marginTop: 2, fontWeight: 700 }}>1 Ngày</div>
            </button>

            <button
              onClick={() => handleRateCard(3)}
              style={{
                padding: '14px 10px',
                borderRadius: 14,
                background: 'rgba(28, 176, 246, 0.12)',
                border: '2px solid rgba(28, 176, 246, 0.35)',
                borderBottom: '4px solid #1899D6',
                color: '#1CB0F6',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 15 }}>Tốt (3)</div>
              <div style={{ fontSize: 11, color: 'var(--duo-text-muted)', marginTop: 2, fontWeight: 700 }}>3 Ngày</div>
            </button>

            <button
              onClick={() => handleRateCard(4)}
              style={{
                padding: '14px 10px',
                borderRadius: 14,
                background: 'rgba(88, 204, 2, 0.12)',
                border: '2px solid rgba(88, 204, 2, 0.35)',
                borderBottom: '4px solid #46A302',
                color: '#58CC02',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 15 }}>Dễ dàng (4)</div>
              <div style={{ fontSize: 11, color: 'var(--duo-text-muted)', marginTop: 2, fontWeight: 700 }}>6 Ngày</div>
            </button>
          </div>
        </div>
      ) : isDone ? (
        // Completed View
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

          <h2 style={{ fontSize: 28, fontWeight: 900, color: 'var(--duo-text-primary)', marginBottom: 8 }}>
            Hoàn thành phiên ôn tập hôm nay! 🎉
          </h2>
          <p style={{ color: 'var(--duo-text-secondary)', fontSize: 15, maxWidth: 480, margin: '0 auto 24px', lineHeight: 1.5 }}>
            Bạn đã ôn tập toàn bộ {queue.length} từ vựng mục tiêu. Khoảng thời gian lặp lại đã được thuật toán cập nhật để tối ưu khả năng ghi nhớ dài hạn.
          </p>

          <Space size="middle">
            <button className="duo-btn-green" onClick={() => navigate('/dashboard')}>
              <span>Về Bảng điều khiển</span>
              <ArrowRight size={18} />
            </button>
            <button className="duo-btn-outline" onClick={() => navigate('/topics')}>
              Tiếp tục học bài
            </button>
          </Space>
        </div>
      ) : (
        <div className="duo-card" style={{ padding: 40, textAlign: 'center' }}>
          <CheckCircle size={40} color="#58CC02" style={{ marginBottom: 12 }} />
          <h3 style={{ fontSize: 22, fontWeight: 900, color: 'var(--duo-text-primary)' }}>
            Không có từ nào cần ôn tập lúc này!
          </h3>
          <p style={{ color: 'var(--duo-text-secondary)', fontSize: 15, marginTop: 6 }}>
            Bạn đã bắt kịp toàn bộ từ vựng trong hàng đợi lặp lại ngắt quãng thông minh. Hãy học thêm các bài học mới để mở rộng vốn từ!
          </p>
          <button className="duo-btn-green" onClick={() => navigate('/topics')} style={{ marginTop: 20 }}>
            <span>Khám phá chủ đề bài học</span>
          </button>
        </div>
      )}
    </div>
  );
};
