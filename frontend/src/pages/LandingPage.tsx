import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Col, Row, Space, Tag, Typography } from 'antd';
import {
  MessageSquare,
  Sparkles,
  Zap,
  CheckCircle,
  ArrowRight,
  Globe,
  Mic,
  Award,
  BookOpen,
  Volume2,
  Repeat,
  ShieldCheck,
} from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { speakText } from '../utils/speech';

const { Title, Text, Paragraph } = Typography;

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { setTargetLanguage, openLangModal } = useAppStore();

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 0 60px' }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', padding: '60px 20px 40px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 20, background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.25)', marginBottom: 20 }}>
          <Sparkles size={16} color="#6366F1" />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#A5B4FC' }}>
            Next-Gen Communication-First Language Mastery
          </span>
        </div>

        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.8rem)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: 20 }}>
          Don't Just Memorize Words.<br />
          <span className="gradient-text">Speak with Real Confidence.</span>
        </h1>

        <Paragraph style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 720, margin: '0 auto 36px', lineHeight: 1.6 }}>
          LinguaTalk immerses you into real-world communication scenarios for <strong>Korean</strong> and <strong>English</strong>. From ordering kimchi stew in Seoul to negotiating in global business meetings, master pronunciation, authentic dialogues, and turn-by-turn AI conversations.
        </Paragraph>

        <Space size="middle" wrap orientation="horizontal" style={{ justifyContent: 'center' }}>
          <button
            className="duo-btn-green"
            style={{ padding: '14px 28px', fontSize: 16 }}
            onClick={() => {
              setTargetLanguage('KO');
              navigate('/learn/1');
            }}
          >
            <span>Học bài Duolingo 🇰🇷</span>
            <ArrowRight size={18} />
          </button>

          <button
            className="duo-btn-blue"
            style={{ padding: '14px 28px', fontSize: 16 }}
            onClick={() => {
              navigate('/chat');
            }}
          >
            <MessageSquare size={18} />
            <span>Trò chuyện AI (Duolingo Style)</span>
          </button>

          <button
            className="btn-secondary"
            style={{ padding: '14px 24px', fontSize: 15 }}
            onClick={() => {
              setTargetLanguage('EN');
              navigate('/learn/1');
            }}
          >
            <span>Luyện tiếng Anh 🇺🇸</span>
          </button>

          <Button
            type="text"
            onClick={() => navigate('/dashboard')}
            style={{ color: '#58CC02', fontWeight: 700, padding: '14px 20px', fontSize: 15 }}
          >
            Vào Dashboard ➔
          </Button>
        </Space>
      </div>

      {/* Methodology Section */}
      <div style={{ marginTop: 60 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Text style={{ color: '#6366F1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 13 }}>
            The LinguaTalk Loop
          </Text>
          <h2 style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>
            Communication-First Learning Methodology
          </h2>
          <Text style={{ color: 'var(--text-secondary)' }}>
            We bridge the gap between textbook knowledge and instinctive spoken fluency.
          </Text>
        </div>

        <Row gutter={[16, 16]}>
          {[
            { step: '1. Learn', title: 'Target Vocab & Hangul Breakdown', desc: 'Study words in context with IPA, batchim rules, sound changes, and collocations.' },
            { step: '2. Understand', title: 'Grammar in Social Context', desc: 'Grasp formality levels (존댓말 vs 반말, English modal politeness) with clear formulas.' },
            { step: '3. Practice', title: 'Interactive Multi-Speaker Audio', desc: 'Listen to line-by-line dialogues, train listening comprehension at 0.8x/1.0x speed.' },
            { step: '4. Pronounce', title: 'AI Speech Recognition', desc: 'Speak into your mic and get immediate accuracy scoring and phonetic feedback.' },
            { step: '5. Communicate', title: 'Turn-by-Turn AI Roleplay', desc: 'Interact with AI roleplay partners (Waiter, Barista, Interviewer) in realistic situations.' },
            { step: '6. Review', title: 'Spaced Repetition (SM-2)', desc: 'Prioritize tricky vocabulary and past mistakes so what you learn stays with you forever.' },
          ].map((item, idx) => (
            <Col xs={24} sm={12} md={8} key={idx}>
              <div
                className="glass-panel"
                style={{
                  padding: 24,
                  height: '100%',
                  background: 'rgba(255, 255, 255, 0.02)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ color: '#6366F1', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', marginBottom: 8 }}>
                  {item.step}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, color: 'var(--text-primary)' }}>
                  {item.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.5 }}>
                  {item.desc}
                </p>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      {/* Interactive Demonstration Cards */}
      <div style={{ marginTop: 80 }}>
        <Row gutter={[24, 24]}>
          {/* Korean Spotlight */}
          <Col xs={24} lg={12}>
            <div className="glass-panel" style={{ padding: 28, height: '100%', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Tag color="purple" style={{ fontSize: 13, padding: '4px 10px', borderRadius: 6 }}>
                  🇰🇷 Korean Spotlight
                </Tag>
                <Button
                  size="small"
                  type="text"
                  icon={<Volume2 size={16} color="#06B6D4" />}
                  onClick={() => speakText('안녕하세요. 김치찌개 하나 주세요.', 'KO')}
                  style={{ color: '#06B6D4' }}
                >
                  Listen
                </Button>
              </div>

              <div style={{ fontSize: 24, fontWeight: 800, color: '#A5B4FC', marginBottom: 6 }}>
                식당에서 주문하기 (Ordering at Restaurant)
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>
                Break down expressions into living components rather than robotic memorization:
              </p>

              {/* Breakdown chip */}
              <div style={{ padding: 14, borderRadius: 10, background: 'rgba(0, 0, 0, 0.3)', marginBottom: 16 }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                  안녕하세요 = 안녕 (Wellness) + 하(다) (Do) + -세요 (Polite Imperative)
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  💡 <strong>Batchim Rule:</strong> The 'ㅇ' in '안/녕' produces a smooth nasal resonance [aɲ.ɲʌŋ.ɦa.se.jo].
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Lesson Level: Beginner (A1)</span>
                <Button
                  type="primary"
                  onClick={() => {
                    setTargetLanguage('KO');
                    navigate('/topics');
                  }}
                  style={{ background: '#6366F1' }}
                >
                  Start Korean Lesson
                </Button>
              </div>
            </div>
          </Col>

          {/* English Spotlight */}
          <Col xs={24} lg={12}>
            <div className="glass-panel" style={{ padding: 28, height: '100%', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Tag color="cyan" style={{ fontSize: 13, padding: '4px 10px', borderRadius: 6 }}>
                  🇺🇸 English Spotlight
                </Tag>
                <Button
                  size="small"
                  type="text"
                  icon={<Volume2 size={16} color="#06B6D4" />}
                  onClick={() => speakText('Could I please get an iced oat latte with an extra shot?', 'EN')}
                  style={{ color: '#06B6D4' }}
                >
                  Listen
                </Button>
              </div>

              <div style={{ fontSize: 24, fontWeight: 800, color: '#38BDF8', marginBottom: 6 }}>
                Specialty Coffee & Professional Small Talk
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>
                Learn polite modal hedging and native collocations rather than blunt textbook phrasing:
              </p>

              {/* Phrasing chip */}
              <div style={{ padding: 14, borderRadius: 10, background: 'rgba(0, 0, 0, 0.3)', marginBottom: 16 }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                  "Could I please get..." vs "Give me a coffee"
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  💡 <strong>Collocation:</strong> "Single-origin pour-over", "Make that to-go", "Under the name..."
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Lesson Level: Intermediate (B1)</span>
                <Button
                  type="primary"
                  onClick={() => {
                    setTargetLanguage('EN');
                    navigate('/topics');
                  }}
                  style={{ background: '#06B6D4' }}
                >
                  Start English Lesson
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* AI Conversation Partner Callout */}
      <div
        className="glass-panel"
        style={{
          marginTop: 60,
          padding: '40px 30px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(6, 182, 212, 0.08))',
          border: '1px solid rgba(99, 102, 241, 0.3)',
        }}
      >
        <MessageSquare size={36} color="#6366F1" style={{ marginBottom: 16 }} />
        <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>
          Practice Turn-by-Turn with Your AI Language Partner
        </h2>
        <Paragraph style={{ color: 'var(--text-secondary)', maxWidth: 640, margin: '0 auto 24px', fontSize: 16 }}>
          Step into 20+ realistic scenarios: Job Interviews, Cafe Orders, Hotel Check-ins, Doctor Visits, and Metro navigation. Speak with voice recognition and receive detailed feedback on fluency, grammar, and more natural native alternatives.
        </Paragraph>
        <button
          className="btn-primary"
          style={{ padding: '12px 28px', fontSize: 15 }}
          onClick={() => navigate('/conversation')}
        >
          Try AI Conversation Partner
        </button>
      </div>
    </div>
  );
};
