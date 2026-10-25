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
import { DashboardSummary, formatLevelVietnamese } from '../types';

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
            explanation: 'Khi vào nhà hàng, hãy dùng "N + 하나 주세요" để gọi món thay vì dùng câu trần thuật "합니다".',
            reviewed: false,
            createdAt: '2026-10-24T18:00:00Z',
          },
          {
            id: 2,
            type: 'VOCABULARY',
            originalText: 'Could you give me coffee?',
            correctedText: 'Could I please get an oat latte to go?',
            explanation: 'Mẫu câu lịch sự "Could I please get..." nghe tự nhiên, nhã nhặn hơn nhiều so với "Give me".',
            reviewed: true,
            createdAt: '2026-10-23T14:30:00Z',
          },
        ],
        recommendedLesson: {
          id: 1,
          topicId: 1,
          topicName: targetLanguage === 'KO' ? 'Nhà hàng & Gọi món' : 'Quán cà phê Specialty',
          title: targetLanguage === 'KO' ? 'Gọi món tại nhà hàng Hàn Quốc (식당에서 주문하기)' : 'Gọi đồ uống tại quán Specialty Coffee',
          scenario: 'Thực hành gọi món ăn, xin thêm món phụ/nước uống và yêu cầu thanh toán hóa đơn lịch sự.',
          description: 'Học các mẫu câu ăn uống thực tế và cách xưng hô lịch sự.',
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
      {/* Duolingo Hero Welcome Banner */}
      <div className="duo-hero-banner" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {/* Mascot Avatar */}
            <div
              className="float-slow"
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #58CC02, #1CB0F6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 38,
                flexShrink: 0,
                boxShadow: '0 8px 24px rgba(88, 204, 2, 0.45)',
                border: '3px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              🦉
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 22 }}>{targetLanguage === 'KO' ? '🇰🇷' : '🇺🇸'}</span>
                <Title level={2} style={{ margin: 0, color: 'var(--duo-text-primary)', fontWeight: 900 }}>
                  Chào mừng trở lại, {user?.name || 'Học viên'}! 🎉
                </Title>
              </div>
              <Text style={{ color: 'var(--duo-text-secondary)', fontSize: 15, fontWeight: 500 }}>
                Bạn đang chinh phục <strong>{targetLanguage === 'KO' ? 'Tiếng Hàn giao tiếp' : 'Tiếng Anh giao tiếp'}</strong> ({formatLevelVietnamese(targetLevel)}). Cùng tích lũy thêm điểm XP hôm nay!
              </Text>
            </div>
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              className="duo-btn-green"
              onClick={() => navigate('/learn/1')}
              style={{ padding: '12px 22px', fontSize: 14 }}
            >
              <span>Vào học bài</span>
              <ArrowRight size={18} />
            </button>
            <button
              className="duo-btn-blue"
              onClick={() => navigate('/chat')}
              style={{ padding: '12px 22px', fontSize: 14 }}
            >
              <MessageSquare size={18} />
              <span>Trò chuyện AI</span>
            </button>
            <button
              className="duo-btn-outline"
              onClick={() => navigate('/review')}
              style={{ padding: '12px 20px', fontSize: 14 }}
            >
              <Repeat size={16} />
              <span>Ôn tập ({dashboard?.dueReviewsCount || 5})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Gamified Metric Cards */}
      <Row gutter={[18, 18]}>
        {/* Streak */}
        <Col xs={12} sm={6}>
          <div
            className="duo-card duo-card-interactive"
            style={{
              textAlign: 'center',
              padding: '22px 16px',
              borderColor: 'rgba(255, 150, 0, 0.35)',
              borderBottomColor: '#E58500',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'rgba(255, 150, 0, 0.14)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 10,
              }}
            >
              <Flame size={26} color="#FF9600" className="flame-bounce" />
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--duo-text-primary)' }}>
              {dashboard?.streakCount || 5}{' '}
              <span style={{ fontSize: 14, fontWeight: 700, color: '#FF9600' }}>Ngày</span>
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--duo-text-secondary)', marginTop: 4 }}>
              Chuỗi học tập (Streak)
            </div>
          </div>
        </Col>

        {/* Daily Goal */}
        <Col xs={12} sm={6}>
          <div
            className="duo-card duo-card-interactive"
            style={{
              textAlign: 'center',
              padding: '22px 16px',
              borderColor: 'rgba(88, 204, 2, 0.35)',
              borderBottomColor: '#46A302',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'rgba(88, 204, 2, 0.14)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 10,
              }}
            >
              <Target size={26} color="#58CC02" />
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--duo-text-primary)' }}>
              {minutesDone}/{minutesGoal}{' '}
              <span style={{ fontSize: 14, fontWeight: 700, color: '#58CC02' }}>phút</span>
            </div>
            <div className="duo-progress-track" style={{ height: 8, marginTop: 10 }}>
              <div className="duo-progress-fill" style={{ width: `${percentDone}%` }} />
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--duo-text-secondary)', marginTop: 6 }}>
              Mục tiêu mỗi ngày
            </div>
          </div>
        </Col>

        {/* Vocabulary Count */}
        <Col xs={12} sm={6}>
          <div
            className="duo-card duo-card-interactive"
            style={{
              textAlign: 'center',
              padding: '22px 16px',
              borderColor: 'rgba(206, 130, 255, 0.35)',
              borderBottomColor: '#A559D8',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'rgba(206, 130, 255, 0.14)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 10,
              }}
            >
              <Layers size={26} color="#CE82FF" />
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--duo-text-primary)' }}>
              {dashboard?.vocabularyLearnedCount || 14}
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--duo-text-secondary)', marginTop: 4 }}>
              Từ vựng ({dashboard?.vocabularyMasteredCount || 6} thành thạo)
            </div>
          </div>
        </Col>

        {/* Conversations Completed */}
        <Col xs={12} sm={6}>
          <div
            className="duo-card duo-card-interactive"
            style={{
              textAlign: 'center',
              padding: '22px 16px',
              borderColor: 'rgba(28, 176, 246, 0.35)',
              borderBottomColor: '#1899D6',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'rgba(28, 176, 246, 0.14)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 10,
              }}
            >
              <MessageSquare size={26} color="#1CB0F6" />
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--duo-text-primary)' }}>
              {dashboard?.conversationsCompletedCount || 3}
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--duo-text-secondary)', marginTop: 4 }}>
              Hội thoại AI hoàn thành
            </div>
          </div>
        </Col>
      </Row>

      {/* Recommended Lesson & Recent Mistakes */}
      <Row gutter={[24, 24]} style={{ marginTop: 28 }}>
        {/* Recommended Lesson Card */}
        <Col xs={24} md={14}>
          <div className="duo-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <BookOpen size={20} color="#58CC02" />
                  <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--duo-text-primary)' }}>
                    Bài học đề xuất tiếp theo
                  </span>
                </div>
                <Tag color="green" style={{ fontWeight: 800, borderRadius: 8, padding: '2px 8px' }}>
                  Ưu tiên số 1
                </Tag>
              </div>

              {dashboard?.recommendedLesson ? (
                <div>
                  <div style={{ fontSize: 12, color: '#1CB0F6', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>
                    {dashboard.recommendedLesson.topicName}
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 900, color: 'var(--duo-text-primary)', marginBottom: 8 }}>
                    {dashboard.recommendedLesson.title}
                  </h3>
                  <p style={{ color: 'var(--duo-text-secondary)', fontSize: 14, marginBottom: 16, lineHeight: 1.5 }}>
                    {dashboard.recommendedLesson.scenario}
                  </p>

                  <div style={{ display: 'flex', gap: 14, marginBottom: 20, fontSize: 13, color: 'var(--duo-text-secondary)', fontWeight: 600 }}>
                    <span>📚 {dashboard.recommendedLesson.vocabularyCount} Từ vựng</span>
                    <span>✨ {dashboard.recommendedLesson.grammarCount} Ngữ pháp</span>
                    <span>✍️ {dashboard.recommendedLesson.exercisesCount} Câu hỏi</span>
                  </div>
                </div>
              ) : (
                <div style={{ color: 'var(--duo-text-secondary)', padding: '20px 0' }}>
                  Bạn đã hoàn thành các bài học hiện tại! Hãy khám phá thêm chủ đề mới hoặc tự tạo thêm với AI.
                </div>
              )}
            </div>

            <button
              className="duo-btn-green"
              onClick={() => navigate(`/learn/${dashboard?.recommendedLesson?.id || 1}`)}
              style={{ width: '100%', padding: '14px', fontSize: 15 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span>Bắt đầu bài học Duolingo</span>
                <ArrowRight size={18} />
              </div>
            </button>
          </div>
        </Col>

        {/* Recent Mistakes Tracker */}
        <Col xs={24} md={10}>
          <div className="duo-card" style={{ height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={20} color="#FF4B4B" />
                <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--duo-text-primary)' }}>
                  Sổ tay Lỗi sai & Góp ý AI
                </span>
              </div>
              <span style={{ fontSize: 12, color: 'var(--duo-text-muted)', fontWeight: 700 }}>Tự động ghi nhớ</span>
            </div>

            {dashboard?.recentMistakes && dashboard.recentMistakes.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {dashboard.recentMistakes.map((mistake) => (
                  <div
                    key={mistake.id}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 12,
                      background: 'var(--duo-bg)',
                      border: '1.5px solid var(--duo-border)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <Tag color={mistake.type === 'GRAMMAR' ? 'volcano' : 'gold'} style={{ fontWeight: 800, borderRadius: 6 }}>
                        {mistake.type}
                      </Tag>
                      {mistake.reviewed && <CheckCircle2 size={16} color="#58CC02" />}
                    </div>
                    <div style={{ fontSize: 13, textDecoration: 'line-through', color: '#FF4B4B', marginBottom: 4 }}>
                      {mistake.originalText}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#58CC02', marginBottom: 6 }}>
                      ➜ {mistake.correctedText}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--duo-text-muted)', lineHeight: 1.4 }}>
                      {mistake.explanation}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--duo-text-muted)', padding: '40px 0' }}>
                🎉 Bạn chưa có lỗi sai nào gần đây. Hãy tiếp tục phong độ tuyệt vời!
              </div>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
};
