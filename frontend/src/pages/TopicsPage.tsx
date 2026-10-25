import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Progress, Tag, Button, Space, Typography, Spin, Radio } from 'antd';
import {
  Utensils,
  Coffee,
  Compass,
  Briefcase,
  Users,
  Hand,
  Clock,
  BookOpen,
  CheckCircle,
  PlayCircle,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { api } from '../services/api';
import { Topic, ProficiencyLevelCode } from '../types';

const { Title, Text, Paragraph } = Typography;

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
      setTopics(data);
    } catch (e) {
      console.warn('Failed to fetch topics, using fallback mock data', e);
      // Fallback topics
      if (targetLanguage === 'KO') {
        setTopics([
          {
            id: 1,
            languageCode: 'KO',
            levelCode: 'BEGINNER',
            code: 'korean-restaurant',
            name: 'Restaurant & Dining',
            description: 'Order authentic dishes, ask for side dish refills, request the bill, and interact politely with staff.',
            icon: 'Utensils',
            estimatedMinutes: 20,
            totalLessons: 1,
            completedLessons: 0,
            progressPercentage: 0,
            lessons: [
              {
                id: 1,
                topicId: 1,
                topicName: 'Restaurant & Dining',
                title: 'Ordering at a Korean Restaurant (식당에서 주문하기)',
                scenario: 'Order dishes, ask for refills, and politely request the bill.',
                description: 'Polite verb endings, calling staff with 저기요, and asking for recommendations.',
                difficulty: 'BEGINNER',
                status: 'PUBLISHED',
                orderIndex: 1,
                vocabularyCount: 5,
                grammarCount: 2,
                exercisesCount: 3,
                completed: false,
              },
            ],
          },
          {
            id: 2,
            languageCode: 'KO',
            levelCode: 'BEGINNER',
            code: 'korean-greetings',
            name: 'Greetings & Introductions',
            description: 'Master honorific greetings, introduce your name and nationality, and make a warm first impression.',
            icon: 'Hand',
            estimatedMinutes: 15,
            totalLessons: 1,
            completedLessons: 0,
            progressPercentage: 0,
          },
          {
            id: 3,
            languageCode: 'KO',
            levelCode: 'BEGINNER',
            code: 'korean-cafe',
            name: 'Cafe & Coffee Culture',
            description: 'Navigate Seoul cafe culture: hot vs iced (아아), desserts, takeout vs dining in.',
            icon: 'Coffee',
            estimatedMinutes: 20,
            totalLessons: 1,
            completedLessons: 0,
            progressPercentage: 0,
          },
          {
            id: 4,
            languageCode: 'KO',
            levelCode: 'BEGINNER',
            code: 'korean-travel',
            name: 'Subway & Asking Directions',
            description: 'Navigate Seoul metro lines, ask locals for directions, transfer stations, and purchase tickets.',
            icon: 'Compass',
            estimatedMinutes: 25,
            totalLessons: 1,
            completedLessons: 0,
            progressPercentage: 0,
          },
        ]);
      } else {
        setTopics([
          {
            id: 5,
            languageCode: 'EN',
            levelCode: 'INTERMEDIATE',
            code: 'english-cafe',
            name: 'Specialty Coffee Shop',
            description: 'Custom coffee orders, roasts, milk alternatives, and natural small talk with the barista.',
            icon: 'Coffee',
            estimatedMinutes: 20,
            totalLessons: 1,
            completedLessons: 0,
            progressPercentage: 0,
            lessons: [
              {
                id: 2,
                topicId: 5,
                topicName: 'Specialty Coffee Shop',
                title: 'Ordering at a Specialty Coffee Shop',
                scenario: 'Order a customized beverage, inquire about bean roast profiles, and pay.',
                description: 'Master polite modals (Could I get), roast profiles, and takeaway options.',
                difficulty: 'INTERMEDIATE',
                status: 'PUBLISHED',
                orderIndex: 1,
                vocabularyCount: 4,
                grammarCount: 1,
                exercisesCount: 2,
                completed: false,
              },
            ],
          },
          {
            id: 6,
            languageCode: 'EN',
            levelCode: 'INTERMEDIATE',
            code: 'english-interview',
            name: 'Job Interview & Career',
            description: 'Present your experience, answer behavioral questions, and ask insightful questions to the hiring manager.',
            icon: 'Briefcase',
            estimatedMinutes: 30,
            totalLessons: 1,
            completedLessons: 0,
            progressPercentage: 0,
          },
        ]);
      }
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
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
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

        <Space>
          <button
            className="duo-btn-blue"
            onClick={() => navigate('/chat')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', fontSize: 14 }}
          >
            <Sparkles size={16} />
            <span>Phòng Luyện nói AI (Duolingo)</span>
          </button>
        </Space>
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
                transition: 'all 0.15s ease',
                userSelect: 'none',
              }}
            >
              {lvl.replace('_', ' ')}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
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
                          {topic.levelCode.replace('_', ' ')}
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
                      <button
                        className="duo-btn-green"
                        onClick={() => navigate(`/learn/1`)}
                        style={{ width: '100%', padding: '14px' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                          <span>Bắt đầu bài học Duolingo</span>
                          <PlayCircle size={18} />
                        </div>
                      </button>
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
