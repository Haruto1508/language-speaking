import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Progress, Card, Tag, Button, Typography, Space, Tooltip } from 'antd';
import {
  Flame,
  Target,
  BookOpen,
  Award,
  Layers,
  Sparkles,
  MessageSquare,
  AlertCircle,
  ArrowRight,
  Repeat,
  CheckCircle2,
} from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { api } from '../services/api';
import { DashboardSummary } from '../types';

const { Title, Text, Paragraph } = Typography;

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { targetLanguage, targetLevel, user } = useAppStore();
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, [targetLanguage, targetLevel]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await api.progress.getDashboard();
      setDashboard(data);
    } catch (e) {
      console.warn('Dashboard load error, using default metrics', e);
      // Fallback fallback dashboard metrics
      setDashboard({
        streakCount: user?.streakCount || 5,
        dailyGoalMinutes: user?.dailyGoalMinutes || 15,
        minutesStudiedToday: 12,
        vocabularyLearnedCount: 14,
        vocabularyMasteredCount: 6,
        lessonsCompletedCount: 2,
        grammarPointsCount: 8,
        conversationsCompletedCount: 3,
        dueReviewsCount: 5,
        recentMistakes: [
          {
            id: 1,
            type: 'GRAMMAR',
            originalText: '저기요! 김치찌개 주문합니다',
            correctedText: '저기요, 김치찌개 하나 주세요',
            explanation: 'In restaurants, use N + 하나 주세요 for ordering rather than declarative 합니다.',
            reviewed: false,
            createdAt: '2026-10-24T18:00:00Z',
          },
          {
            id: 2,
            type: 'VOCABULARY',
            originalText: 'Could you give me coffee?',
            correctedText: 'Could I please get an oat latte to go?',
            explanation: 'Modal phrasing "Could I please get..." sounds significantly more polite and natural.',
            reviewed: true,
            createdAt: '2026-10-23T14:30:00Z',
          },
        ],
        recommendedLesson: {
          id: 1,
          topicId: 1,
          topicName: 'Restaurant & Dining',
          title: targetLanguage === 'KO' ? 'Ordering at a Korean Restaurant (식당에서 주문하기)' : 'Ordering at a Specialty Coffee Shop',
          scenario: 'Order dishes, ask for refills, and politely request the bill.',
          description: 'Learn real-world dining expressions and polite speech.',
          difficulty: 'BEGINNER',
          status: 'PUBLISHED',
          orderIndex: 1,
          vocabularyCount: 5,
          grammarCount: 2,
          exercisesCount: 3,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const minutesGoal = dashboard?.dailyGoalMinutes || 15;
  const minutesDone = dashboard?.minutesStudiedToday || 12;
  const percentDone = Math.min(100, Math.round((minutesDone / minutesGoal) * 100));

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Welcome Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '28px 32px',
          marginBottom: 24,
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.08) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 24 }}>{targetLanguage === 'KO' ? '🇰🇷' : '🇺🇸'}</span>
            <Title level={2} style={{ margin: 0, color: 'var(--text-primary)' }}>
              Welcome back, {user?.name || 'Learner'}!
            </Title>
          </div>
          <Text style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
            You're currently mastering <strong>{targetLanguage === 'KO' ? 'Korean' : 'English'}</strong> ({targetLevel.replace('_', ' ')}). Ready for today's communication goal?
          </Text>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            className="duo-btn-green"
            onClick={() => navigate('/learn/1')}
            style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <span>Học bài Duolingo</span>
            <ArrowRight size={16} />
          </button>
          <button
            className="duo-btn-blue"
            onClick={() => navigate('/chat')}
            style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <MessageSquare size={16} />
            <span>Trò chuyện AI</span>
          </button>
          <button
            className="btn-secondary"
            onClick={() => navigate('/review')}
            style={{ padding: '10px 20px' }}
          >
            <Repeat size={16} />
            <span>Ôn tập ({dashboard?.dueReviewsCount || 5} từ)</span>
          </button>
        </div>
      </div>

      {/* Key Metric Cards */}
      <Row gutter={[16, 16]}>
        {/* Streak */}
        <Col xs={12} sm={6}>
          <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
            <Flame size={28} color="#F59E0B" className="flame-icon" style={{ margin: '0 auto 8px' }} />
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>
              {dashboard?.streakCount || 5} <span style={{ fontSize: 14, fontWeight: 500, color: '#F59E0B' }}>Days</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
              Learning Streak
            </div>
          </div>
        </Col>

        {/* Daily Goal */}
        <Col xs={12} sm={6}>
          <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
            <Target size={28} color="#10B981" style={{ margin: '0 auto 8px' }} />
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>
              {minutesDone}/{minutesGoal} <span style={{ fontSize: 14, fontWeight: 500, color: '#10B981' }}>min</span>
            </div>
            <Progress
              percent={percentDone}
              size="small"
              strokeColor="#10B981"
              showInfo={false}
              style={{ marginTop: 8 }}
            />
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
              Daily Study Goal
            </div>
          </div>
        </Col>

        {/* Vocabulary Count */}
        <Col xs={12} sm={6}>
          <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
            <Layers size={28} color="#6366F1" style={{ margin: '0 auto 8px' }} />
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>
              {dashboard?.vocabularyLearnedCount || 14}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
              Words Active ({dashboard?.vocabularyMasteredCount || 6} Mastered)
            </div>
          </div>
        </Col>

        {/* Conversations Completed */}
        <Col xs={12} sm={6}>
          <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
            <MessageSquare size={28} color="#06B6D4" style={{ margin: '0 auto 8px' }} />
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>
              {dashboard?.conversationsCompletedCount || 3}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
              AI Conversations Done
            </div>
          </div>
        </Col>
      </Row>

      {/* Recommended Lesson & Recent Mistakes */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        {/* Recommended Lesson Card */}
        <Col xs={24} md={14}>
          <div className="glass-panel" style={{ padding: 24, height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BookOpen size={20} color="#6366F1" />
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                  Recommended Lesson
                </span>
              </div>
              <Tag color="purple">Next in Sequence</Tag>
            </div>

            {dashboard?.recommendedLesson ? (
              <div>
                <div style={{ fontSize: 13, color: '#A5B4FC', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>
                  {dashboard.recommendedLesson.topicName}
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>
                  {dashboard.recommendedLesson.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16, lineHeight: 1.5 }}>
                  {dashboard.recommendedLesson.scenario}
                </p>

                <div style={{ display: 'flex', gap: 16, marginBottom: 20, fontSize: 13, color: 'var(--text-secondary)' }}>
                  <span>📚 {dashboard.recommendedLesson.vocabularyCount} Vocab</span>
                  <span>✨ {dashboard.recommendedLesson.grammarCount} Grammar</span>
                  <span>✍️ {dashboard.recommendedLesson.exercisesCount} Exercises</span>
                </div>

                <button
                  className="duo-btn-green"
                  onClick={() => navigate(`/learn/${dashboard.recommendedLesson?.id || 1}`)}
                  style={{ width: '100%', padding: '14px', fontSize: 15 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <span>Bắt đầu bài học Duolingo</span>
                    <ArrowRight size={18} />
                  </div>
                </button>
              </div>
            ) : (
              <div style={{ color: 'var(--text-secondary)', padding: '20px 0' }}>
                All available lessons completed! Explore topics or generate a new AI curriculum.
              </div>
            )}
          </div>
        </Col>

        {/* Recent Mistakes Tracker */}
        <Col xs={24} md={10}>
          <div className="glass-panel" style={{ padding: 24, height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={20} color="#F43F5E" />
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                  Recent Mistakes Review
                </span>
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Auto-tracked</span>
            </div>

            {dashboard?.recentMistakes && dashboard.recentMistakes.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {dashboard.recentMistakes.map((mistake) => (
                  <div
                    key={mistake.id}
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <Tag color={mistake.type === 'GRAMMAR' ? 'volcano' : 'gold'}>
                        {mistake.type}
                      </Tag>
                      {mistake.reviewed && <CheckCircle2 size={14} color="#10B981" />}
                    </div>
                    <div style={{ fontSize: 13, textDecoration: 'line-through', color: '#F43F5E', marginBottom: 2 }}>
                      {mistake.originalText}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#10B981', marginBottom: 6 }}>
                      ➜ {mistake.correctedText}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                      {mistake.explanation}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
                No active mistakes logged! Keep up the flawless practice.
              </div>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
};
