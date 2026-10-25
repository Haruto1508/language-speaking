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
import { ReviewItem } from '../types';
import { speakText } from '../utils/speech';

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
      setQueue(data);
    } catch (e) {
      console.warn('Review queue error, using fallback review queue', e);
      const isKo = targetLanguage === 'KO';
      const fallbackQueue: ReviewItem[] = isKo
        ? [
            {
              progressId: 1,
              vocabularyId: 1,
              word: '안녕하세요',
              meaning: 'Hello / Good day / Good afternoon',
              partOfSpeech: 'Expression',
              pronunciationIpa: '[aɲ.ɲʌŋ.ɦa.se.jo]',
              exampleSentence: '안녕하세요! 두 명 자리 있나요?',
              translation: 'Hello! Do you have a table for two?',
              hangul: '안녕하세요',
              romanization: 'annyeonghaseyo',
              status: 'LEARNING',
              repetitions: 1,
              correctCount: 2,
              incorrectCount: 1,
              nextReviewAt: new Date().toISOString(),
            },
            {
              progressId: 2,
              vocabularyId: 2,
              word: '김치찌개',
              meaning: 'Kimchi Stew (classic spicy Korean stew)',
              partOfSpeech: 'Noun',
              pronunciationIpa: '[kim.tɕʰi.tɕ͈i.ɡɛ]',
              exampleSentence: '저희 김치찌개 2인분 주세요.',
              translation: 'Please give us two servings of kimchi stew.',
              hangul: '김치찌개',
              romanization: 'gimchijjigae',
              status: 'NEW',
              repetitions: 0,
              correctCount: 1,
              incorrectCount: 0,
              nextReviewAt: new Date().toISOString(),
            },
            {
              progressId: 3,
              vocabularyId: 3,
              word: '주세요',
              meaning: 'Please give me / Please bring me',
              partOfSpeech: 'Verb phrase',
              pronunciationIpa: '[tɕu.se.jo]',
              exampleSentence: '물 좀 더 주세요.',
              translation: 'Please give me some more water.',
              hangul: '주세요',
              romanization: 'juseyo',
              status: 'LEARNING',
              repetitions: 2,
              correctCount: 3,
              incorrectCount: 1,
              nextReviewAt: new Date().toISOString(),
            },
            {
              progressId: 4,
              vocabularyId: 4,
              word: '저기요',
              meaning: 'Excuse me! / Over here! (Calling staff)',
              partOfSpeech: 'Interjection',
              pronunciationIpa: '[tɕʌ.ɡi.jo]',
              exampleSentence: '저기요, 주문할게요!',
              translation: 'Excuse me, we are ready to order!',
              hangul: '저기요',
              romanization: 'jeogiyo',
              status: 'REVIEW',
              repetitions: 3,
              correctCount: 5,
              incorrectCount: 0,
              nextReviewAt: new Date().toISOString(),
            },
            {
              progressId: 5,
              vocabularyId: 5,
              word: '계산하다',
              meaning: 'To pay / settle the bill',
              partOfSpeech: 'Verb',
              pronunciationIpa: '[kʲeː.san.ɦa.da]',
              exampleSentence: '계산은 카드로 할게요.',
              translation: 'I will pay by card.',
              hangul: '계산하다',
              romanization: 'gyesanhada',
              status: 'NEW',
              repetitions: 0,
              correctCount: 0,
              incorrectCount: 0,
              nextReviewAt: new Date().toISOString(),
            },
          ]
        : [
            {
              progressId: 6,
              vocabularyId: 6,
              word: 'single-origin',
              meaning: 'Coffee beans sourced from one specific region or producer',
              partOfSpeech: 'Adjective',
              pronunciationIpa: '/ˌsɪŋ.ɡəl ˈɔːr.ɪ.dʒɪn/',
              exampleSentence: 'What single-origin pour-over do you recommend?',
              translation: 'Bạn đề xuất loại hạt đơn nguồn gốc nào?',
              status: 'LEARNING',
              repetitions: 1,
              correctCount: 2,
              incorrectCount: 1,
              nextReviewAt: new Date().toISOString(),
            },
            {
              progressId: 7,
              vocabularyId: 7,
              word: 'oat milk',
              meaning: 'A plant-based creamy milk substitute made from oats',
              partOfSpeech: 'Noun phrase',
              pronunciationIpa: '/ˈoʊt ˌmɪlk/',
              exampleSentence: 'Could I get an iced latte with oat milk, please?',
              translation: 'Cho mình latte đá với sữa yến mạch nhé?',
              status: 'REVIEW',
              repetitions: 3,
              correctCount: 4,
              incorrectCount: 0,
              nextReviewAt: new Date().toISOString(),
            },
          ];
      setQueue(fallbackQueue);
    } finally {
      setLoading(false);
    }
  };

  const handleRateCard = async (rating: number) => {
    const current = queue[currentIndex];
    if (!current) return;

    try {
      await api.reviews.submit(current.vocabularyId, rating);
    } catch (e) {
      // offline rate
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
          <Title level={2} style={{ color: 'var(--text-primary)', margin: 0 }}>
            Daily Spaced Repetition Review 🧠
          </Title>
          <Text style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Reviewing words prioritized by the SM-2 algorithm to lock them into long-term memory.
          </Text>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Flame size={20} color="#F59E0B" className="flame-icon" />
          <span style={{ fontWeight: 800, color: '#F59E0B' }}>5 Day Streak</span>
        </div>
      </div>

      {!isDone && queue.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
            <span>Card {currentIndex + 1} of {queue.length}</span>
            <span>{Math.round((completedCount / queue.length) * 100)}% Complete</span>
          </div>
          <Progress
            percent={Math.round((completedCount / queue.length) * 100)}
            strokeColor="linear-gradient(135deg, #6366F1, #06B6D4)"
            showInfo={false}
          />
        </div>
      )}

      {/* Main Flashcard */}
      {!isDone && currentItem ? (
        <div style={{ perspective: 1000, margin: '20px 0 28px' }}>
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="glass-panel"
            style={{
              padding: '44px 32px',
              minHeight: 340,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              textAlign: 'center',
              cursor: 'pointer',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              position: 'relative',
              background: 'linear-gradient(180deg, rgba(17, 24, 39, 0.9) 0%, rgba(17, 24, 39, 0.6) 100%)',
            }}
          >
            {/* Top Badges */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Tag color="purple">{currentItem.partOfSpeech}</Tag>
              <Tag color={currentItem.status === 'MASTERED' ? 'green' : 'blue'}>
                {currentItem.status}
              </Tag>
            </div>

            {/* Middle Card Content */}
            {!isFlipped ? (
              // FRONT OF FLASHCARD
              <div style={{ margin: 'auto 0' }}>
                <div
                  className={isKo ? 'lang-ko' : ''}
                  style={{
                    fontSize: 'clamp(2rem, 5vw, 3rem)',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    marginBottom: 12,
                  }}
                >
                  {currentItem.word}
                </div>

                {currentItem.romanization && (
                  <div style={{ fontSize: 16, color: '#A5B4FC', fontStyle: 'italic', marginBottom: 12 }}>
                    [{currentItem.romanization}]
                  </div>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    speakText(currentItem.word, isKo ? 'KO' : 'EN', 0.9);
                  }}
                  className="btn-secondary"
                  style={{ padding: '8px 18px', borderRadius: 20 }}
                >
                  <Volume2 size={18} color="#06B6D4" />
                  <span>Listen</span>
                </button>
              </div>
            ) : (
              // BACK OF FLASHCARD
              <div style={{ margin: 'auto 0', maxWidth: 540 }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#38BDF8', marginBottom: 12 }}>
                  {currentItem.meaning}
                </div>

                {currentItem.pronunciationIpa && (
                  <div style={{ fontSize: 14, color: '#A5B4FC', marginBottom: 12 }}>
                    IPA: {currentItem.pronunciationIpa}
                  </div>
                )}

                {currentItem.exampleSentence && (
                  <div
                    style={{
                      padding: 14,
                      borderRadius: 10,
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      marginTop: 14,
                      textAlign: 'left',
                    }}
                  >
                    <div className={isKo ? 'lang-ko' : ''} style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                      "{currentItem.exampleSentence}"
                    </div>
                    {currentItem.translation && (
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                        {currentItem.translation}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Bottom Flip Instruction */}
            <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <RotateCw size={14} />
              <span>Click card to {isFlipped ? 'see word front' : 'reveal meaning & example'}</span>
            </div>
          </div>

          {/* Confidence Rating Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 16 }}>
            <button
              onClick={() => handleRateCard(1)}
              style={{
                padding: '14px 10px',
                borderRadius: 12,
                background: 'rgba(244, 63, 94, 0.12)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: '#F43F5E',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 15 }}>Again (1)</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>&lt; 10 min</div>
            </button>

            <button
              onClick={() => handleRateCard(2)}
              style={{
                padding: '14px 10px',
                borderRadius: 12,
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: '#F59E0B',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 15 }}>Hard (2)</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>1 Day</div>
            </button>

            <button
              onClick={() => handleRateCard(3)}
              style={{
                padding: '14px 10px',
                borderRadius: 12,
                background: 'rgba(99, 102, 241, 0.12)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                color: '#818CF8',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 15 }}>Good (3)</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>3 Days</div>
            </button>

            <button
              onClick={() => handleRateCard(4)}
              style={{
                padding: '14px 10px',
                borderRadius: 12,
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#10B981',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 15 }}>Easy (4)</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>6 Days</div>
            </button>
          </div>
        </div>
      ) : isDone ? (
        // Completed View
        <div className="glass-panel" style={{ padding: 48, textAlign: 'center' }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10B981, #06B6D4)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
            }}
          >
            <Award size={40} color="white" />
          </div>

          <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
            Daily Review Completed! 🎉
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, maxWidth: 480, margin: '0 auto 24px', lineHeight: 1.5 }}>
            You reviewed all {queue.length} target words for today. Your spaced repetition intervals have been recalculated to maximize long-term retention.
          </p>

          <Space size="middle">
            <button className="btn-primary" onClick={() => navigate('/dashboard')}>
              <span>Back to Dashboard</span>
              <ArrowRight size={16} />
            </button>
            <button className="btn-secondary" onClick={() => navigate('/topics')}>
              Continue to Lessons
            </button>
          </Space>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: 40, textAlign: 'center' }}>
          <CheckCircle size={36} color="#10B981" style={{ marginBottom: 12 }} />
          <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
            No Due Reviews Right Now!
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
            You're completely caught up on your spaced repetition queue. Explore new lessons to expand your vocabulary!
          </p>
          <button className="btn-primary" onClick={() => navigate('/topics')} style={{ marginTop: 20 }}>
            Explore Topics & Lessons
          </button>
        </div>
      )}
    </div>
  );
};
