import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Tag, Space, Typography, Spin } from 'antd';
import {
  Utensils,
  Coffee,
  Compass,
  Briefcase,
  Users,
  Hand,
  Clock,
  BookOpen,
  PlayCircle,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { api } from '../services/api';
import { Topic, ProficiencyLevelCode, formatLevelVietnamese } from '../types';
import { localDataService } from '../services/localDataService';
import owlEmptyImg from '../assets/duo-empty-owl.jpg';
import { LanguageSwitchTabs } from '../components/LanguageSwitchTabs';

const { Title, Text } = Typography;

const ICON_MAP: Record<string, React.ReactNode> = {
  Utensils: <Utensils size={24} color="#6366F1" />,
  Coffee: <Coffee size={24} color="#06B6D4" />,
  Compass: <Compass size={24} color="#10B981" />,
  Briefcase: <Briefcase size={24} color="#F59E0B" />,
  Users: <Users size={24} color="#8B5CF6" />,
  Hand: <Hand size={24} color="#EC4899" />,
};

export const TopicsPage: React.FC = () => {
  const navigate = useNavigate();
  const { targetLanguage, targetLevel, setTargetLevel } = useAppStore();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopics();
  }, [targetLanguage, targetLevel]);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const data = await api.topics.getAll(targetLanguage, targetLevel);
      if (data && data.length > 0) {
        setTopics(data);
      } else {
        setTopics(localDataService.getTopics(targetLanguage, targetLevel));
      }
    } catch {
      setTopics(localDataService.getTopics(targetLanguage, targetLevel));
    } finally {
      setLoading(false);
    }
  };

  const levelOptions: ProficiencyLevelCode[] = [
    'BEGINNER',
    'ELEMENTARY',
    'INTERMEDIATE',
    'UPPER_INTERMEDIATE',
    'ADVANCED',
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 60 }}>
      {/* Header and Level Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <Title level={2} style={{ color: 'var(--duo-text-primary)', margin: 0, fontWeight: 900 }}>
            {targetLanguage === 'KO' ? 'Chủ đề & Tình huống giao tiếp tiếng Hàn 🇰🇷' : 'Chủ đề & Tình huống giao tiếp tiếng Anh 🇺🇸'}
          </Title>
          <Text style={{ color: 'var(--duo-text-secondary)', fontSize: 15 }}>
            Chọn tình huống thực tế để học theo lộ trình: Từ vựng cốt lõi ➔ Mẫu câu ngữ pháp ➔ Hội thoại & Luyện phát âm AI.
          </Text>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <LanguageSwitchTabs />
          <button
            className="duo-btn-blue"
            onClick={() => navigate('/chat')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', fontSize: 14 }}
          >
            <Sparkles size={16} />
            <span>Phòng Luyện nói AI (Duolingo)</span>
          </button>
        </div>
      </div>

      {/* Chunky Duolingo Level Filter Pills */}
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 14, marginBottom: 24 }}>
        {levelOptions.map((lvl) => {
          const isSelected = targetLevel === lvl;
          return (
            <button
              key={lvl}
              onClick={() => setTargetLevel(lvl)}
              style={{
                padding: '10px 20px',
                borderRadius: 16,
                background: isSelected ? 'var(--duo-green)' : 'var(--duo-card-bg)',
                color: isSelected ? '#FFFFFF' : 'var(--duo-text-secondary)',
                border: isSelected ? 'none' : '2px solid var(--duo-border)',
                borderBottom: isSelected ? '4px solid var(--duo-green-shadow)' : '4px solid var(--duo-border)',
                fontWeight: 800,
                fontSize: 14,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'none',
              }}
            >
              {formatLevelVietnamese(lvl)}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
        </div>
      ) : topics.length === 0 ? (
        /* Empty State with Duolingo 3D Owl Mascot */
        <div
          className="duo-card"
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 24,
            maxWidth: 640,
            margin: '20px auto',
            background: 'var(--duo-card-bg)',
          }}
        >
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <img
              src={owlEmptyImg}
              alt="Chưa có chủ đề"
              style={{
                width: 190,
                height: 190,
                objectFit: 'cover',
                borderRadius: 28,
                boxShadow: '0 12px 32px rgba(88, 204, 2, 0.25)',
                border: '3px solid rgba(88, 204, 2, 0.3)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: -8,
                right: -8,
                background: 'var(--duo-card-bg)',
                borderRadius: 9999,
                padding: '6px 12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                border: '2px solid var(--duo-border)',
                fontSize: 18,
              }}
            >
              🔍✨
            </div>
          </div>

          <h3 style={{ fontSize: 22, fontWeight: 900, color: 'var(--duo-text-primary)', marginBottom: 10 }}>
            Chưa có chủ đề giao tiếp nào!
          </h3>

          <p style={{ fontSize: 15, color: 'var(--duo-text-secondary)', maxWidth: 460, lineHeight: 1.6, marginBottom: 26 }}>
            Hiện tại chưa có chủ đề giao tiếp cho trình độ{' '}
            <strong style={{ color: '#1CB0F6' }}>{formatLevelVietnamese(targetLevel)}</strong>. Bạn hãy chọn cấp độ khác như{' '}
            <strong style={{ color: '#58CC02' }}>Sơ cấp (Beginner)</strong> hoặc chuyển đổi ngôn ngữ để tiếp tục luyện tập nhé!
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              className="duo-btn-green"
              onClick={() => setTargetLevel('BEGINNER')}
              style={{ padding: '12px 24px', fontSize: 14 }}
            >
              Chuyển về trình độ Sơ cấp
            </button>
            <button
              className="duo-btn-outline"
              onClick={() => navigate('/dashboard')}
              style={{ padding: '12px 20px', fontSize: 14 }}
            >
              Về Bảng điều khiển
            </button>
          </div>
        </div>
      ) : (
        <Row gutter={[22, 22]}>
          {topics.map((topic) => {
            const hasLessons = topic.lessons && topic.lessons.length > 0;
            return (
              <Col xs={24} md={12} key={topic.id}>
                <div
                  className="duo-card"
                  style={{
                    padding: 24,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <div
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: 16,
                          background: 'linear-gradient(135deg, rgba(88, 204, 2, 0.15), rgba(28, 176, 246, 0.15))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px solid var(--duo-border)',
                          fontSize: 24,
                        }}
                      >
                        {ICON_MAP[topic.icon] || <BookOpen size={26} color="#58CC02" />}
                      </div>
                      <Space>
                        <Tag color="blue" style={{ borderRadius: 8, fontWeight: 800, padding: '2px 8px' }}>
                          {formatLevelVietnamese(topic.levelCode)}
                        </Tag>
                        <Tag icon={<Clock size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />} color="default" style={{ borderRadius: 8, fontWeight: 700 }}>
                          {topic.estimatedMinutes} phút
                        </Tag>
                      </Space>
                    </div>

                    <h3 style={{ fontSize: 20, fontWeight: 900, color: 'var(--duo-text-primary)', marginBottom: 8 }}>
                      {topic.name}
                    </h3>
                    <p style={{ color: 'var(--duo-text-secondary)', fontSize: 14, lineHeight: 1.5, marginBottom: 18 }}>
                      {topic.description}
                    </p>

                    <div style={{ marginBottom: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--duo-text-muted)', marginBottom: 6, fontWeight: 700 }}>
                        <span>Tiến độ hoàn thành</span>
                        <span style={{ color: '#58CC02' }}>{topic.progressPercentage || 0}%</span>
                      </div>
                      <div className="duo-progress-track" style={{ height: 10 }}>
                        <div className="duo-progress-fill" style={{ width: `${topic.progressPercentage || 0}%` }} />
                      </div>
                    </div>
                  </div>

                  <div>
                    {hasLessons ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {topic.lessons!.map((lesson) => (
                          <div
                            key={lesson.id}
                            onClick={() => navigate(`/learn/${lesson.id}`)}
                            className="duo-card-interactive"
                            style={{
                              padding: '12px 16px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              borderRadius: 14,
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <PlayCircle size={22} color="#58CC02" />
                              <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--duo-text-primary)' }}>
                                {lesson.title}
                              </span>
                            </div>
                            <button
                              className="duo-btn-green"
                              style={{ padding: '6px 14px', fontSize: 12, minWidth: 80 }}
                            >
                              Học ngay
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div
                        style={{
                          padding: '14px 18px',
                          borderRadius: 14,
                          background: 'rgba(88, 204, 2, 0.05)',
                          border: '1.5px dashed var(--duo-border)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                        }}
                      >
                        <div
                          style={{
                            width: 42,
                            height: 42,
                            borderRadius: 12,
                            overflow: 'hidden',
                            flexShrink: 0,
                            boxShadow: '0 4px 10px rgba(88, 204, 2, 0.2)',
                          }}
                        >
                          <img
                            src={owlEmptyImg}
                            alt="Chưa có bài học"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--duo-text-primary)' }}>
                            Chưa có bài học chi tiết
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--duo-text-secondary)', marginTop: 2 }}>
                            Nội dung đang được biên soạn thêm
                          </div>
                        </div>
                        <button
                          className="duo-btn-outline"
                          onClick={() => navigate('/chat')}
                          style={{ padding: '6px 12px', fontSize: 12, whiteSpace: 'nowrap' }}
                        >
                          Luyện nói AI
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
};
