import React, { useEffect, useState } from 'react';
import {
  Tag,
  Button,
  Input,
  Select,
  Typography,
  Table,
  Space,
  Modal,
  Tabs,
  message,
  Spin,
  Alert,
} from 'antd';
import {
  Sparkles,
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  Upload,
  ArrowRight,
  Database,
  Cpu,
  Layers,
  Settings,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useAppStore } from '../stores/useAppStore';
import { ContentStatus, LessonDetail, LessonSummary, ProficiencyLevelCode } from '../types';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export const AdminPage: React.FC = () => {
  const { targetLanguage } = useAppStore();

  const [activeTab, setActiveTab] = useState('generate');
  const [lessons, setLessons] = useState<LessonSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [ingesting, setIngesting] = useState(false);

  // Form states for Generator
  const [topicId, setTopicId] = useState<number>(1);
  const [lessonTitle, setLessonTitle] = useState('Checking in at a Boutique Hotel');
  const [scenario, setScenario] = useState('Check-in, request a non-smoking high-floor room, and ask for breakfast hours.');
  const [difficulty, setDifficulty] = useState<ProficiencyLevelCode>('ELEMENTARY');
  const [objectives, setObjectives] = useState('Master polite check-in vocabulary and room amenities requests.');

  // Form states for Ingestion Pipeline
  const [ingestTopic, setIngestTopic] = useState('Medical Clinic & Pharmacy in Seoul');
  const [ingestLang, setIngestLang] = useState('KO');
  const [ingestLevel, setIngestLevel] = useState('BEGINNER');
  const [rawSource, setRawSource] = useState(`Unit 4: Visiting a Clinic & Pharmacy (병원과 약국)
Key Terms:
- 아프다 (to be sick / hurt)
- 감기약 (cold medicine)
- 처방전 (prescription)
- 열이 나다 (to have a fever)
Grammar:
- V + -(으)면 안 돼요 (You must not / prohibited)
- V + -어/아야 되다 (Must / have to)
Scenario:
Patient tells doctor symptoms (headache, fever for 2 days), doctor gives diagnosis, patient takes prescription to pharmacy.`);

  // Preview generated modal
  const [generatedLesson, setGeneratedLesson] = useState<LessonDetail | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    try {
      setLoading(true);
      const data = await api.admin.getLessons();
      setLessons(data);
    } catch (e) {
      console.warn('Admin load error, using mock lessons list', e);
      setLessons([
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
        },
        {
          id: 2,
          topicId: 5,
          topicName: 'Specialty Coffee Shop',
          title: 'Ordering at a Specialty Coffee Shop',
          scenario: 'Order customized coffee, inquire about bean roast profiles, and pay.',
          description: 'Master polite modals (Could I get), roast profiles, and takeaway options.',
          difficulty: 'INTERMEDIATE',
          status: 'PUBLISHED',
          orderIndex: 1,
          vocabularyCount: 4,
          grammarCount: 1,
          exercisesCount: 2,
        },
        {
          id: 3,
          topicId: 1,
          topicName: 'Hotel & Lodging',
          title: 'Boutique Hotel Check-in',
          scenario: 'Check-in, request breakfast schedule and luggage storage.',
          description: 'AI Generated curriculum currently under review.',
          difficulty: 'ELEMENTARY',
          status: 'AI_GENERATED',
          orderIndex: 2,
          vocabularyCount: 4,
          grammarCount: 1,
          exercisesCount: 2,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLesson = async () => {
    if (!lessonTitle || !scenario) {
      message.error('Please enter a lesson title and scenario');
      return;
    }
    setGenerating(true);
    try {
      const result = await api.admin.generateLesson({
        topicId,
        title: lessonTitle,
        scenario,
        difficulty,
        learningObjectives: objectives,
      });
      setGeneratedLesson(result);
      setIsPreviewOpen(true);
      message.success('AI Lesson generated successfully!');
      loadLessons();
    } catch (e) {
      message.error('Failed to generate lesson with AI');
    } finally {
      setGenerating(false);
    }
  };

  const handleRunIngestion = async () => {
    if (!rawSource.trim()) {
      message.error('Please provide raw curriculum text');
      return;
    }
    setIngesting(true);
    try {
      const result = await api.admin.ingestContent({
        languageCode: ingestLang,
        levelCode: ingestLevel,
        topicTitle: ingestTopic,
        rawSourceText: rawSource,
      });
      setGeneratedLesson(result);
      setIsPreviewOpen(true);
      message.success('Source material ingested and converted to structured lesson!');
      loadLessons();
    } catch (e) {
      message.error('Failed to ingest content');
    } finally {
      setIngesting(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: ContentStatus) => {
    try {
      await api.admin.updateLessonStatus(id, status);
      message.success(`Status updated to ${status}`);
      setLessons((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status } : l))
      );
      if (status === 'PUBLISHED') {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
      }
    } catch (e) {
      message.error('Failed to update status');
    }
  };

  const statusColorMap: Record<ContentStatus, string> = {
    DRAFT: 'default',
    AI_GENERATED: 'purple',
    REVIEWING: 'gold',
    APPROVED: 'blue',
    PUBLISHED: 'green',
    ARCHIVED: 'volcano',
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 60 }}>
      <div style={{ marginBottom: 28 }}>
        <Title level={2} style={{ color: 'var(--text-primary)', margin: 0 }}>
          Curriculum Management & AI Ingestion Pipeline ⚙️
        </Title>
        <Text style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Manage structured courses, review AI-generated lessons, and ingest external educational syllabi into validated learning modules.
        </Text>
      </div>

      {/* Pipeline Architecture Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '20px 24px',
          marginBottom: 24,
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(6, 182, 212, 0.08))',
          border: '1px solid rgba(99, 102, 241, 0.25)',
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: '#A5B4FC', textTransform: 'uppercase', marginBottom: 8 }}>
          Content Ingestion Pipeline Architecture
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', fontSize: 13, color: 'var(--text-primary)' }}>
          <Tag color="geekblue" icon={<FileText size={12} style={{ marginRight: 4 }} />}>Source Document</Tag>
          <span>➔</span>
          <Tag color="cyan" icon={<Cpu size={12} style={{ marginRight: 4 }} />}>Parser & Tokenizer</Tag>
          <span>➔</span>
          <Tag color="purple" icon={<Sparkles size={12} style={{ marginRight: 4 }} />}>AI Content Processor</Tag>
          <span>➔</span>
          <Tag color="gold" icon={<CheckCircle size={12} style={{ marginRight: 4 }} />}>Schema Validation</Tag>
          <span>➔</span>
          <Tag color="green" icon={<Database size={12} style={{ marginRight: 4 }} />}>Structured Database</Tag>
          <span>➔</span>
          <Tag color="magenta">Admin Review & Publish</Tag>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button
          className={activeTab === 'generate' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setActiveTab('generate')}
        >
          <Sparkles size={16} />
          <span>AI Lesson Generator</span>
        </button>
        <button
          className={activeTab === 'ingest' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setActiveTab('ingest')}
        >
          <Upload size={16} />
          <span>Raw Source Ingestion</span>
        </button>
        <button
          className={activeTab === 'manage' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setActiveTab('manage')}
        >
          <Layers size={16} />
          <span>Lesson Approval Workflow ({lessons.length})</span>
        </button>
      </div>

      {/* TAB 1: AI LESSON GENERATOR */}
      {activeTab === 'generate' && (
        <div className="glass-panel" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
            Generate Structured Curriculum with Educational AI
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                Lesson Title:
              </label>
              <Input
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                style={{ background: 'rgba(255, 255, 255, 0.04)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                Proficiency Level:
              </label>
              <Select
                value={difficulty}
                onChange={(val) => setDifficulty(val)}
                style={{ width: '100%' }}
                options={[
                  { value: 'BEGINNER', label: 'Beginner (A1)' },
                  { value: 'ELEMENTARY', label: 'Elementary (A2)' },
                  { value: 'INTERMEDIATE', label: 'Intermediate (B1)' },
                  { value: 'UPPER_INTERMEDIATE', label: 'Upper Intermediate (B2)' },
                  { value: 'ADVANCED', label: 'Advanced (C1)' },
                ]}
              />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Communication Scenario Description:
            </label>
            <Input
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              placeholder="e.g. Asking for directions, ordering food, job interview..."
              style={{ background: 'rgba(255, 255, 255, 0.04)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Pedagogical Objectives (Optional):
            </label>
            <TextArea
              rows={3}
              value={objectives}
              onChange={(e) => setObjectives(e.target.value)}
              style={{ background: 'rgba(255, 255, 255, 0.04)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
            />
          </div>

          <button
            className="btn-primary"
            onClick={handleGenerateLesson}
            disabled={generating}
            style={{ padding: '12px 28px', fontSize: 15 }}
          >
            {generating ? <Spin size="small" /> : <Sparkles size={16} />}
            <span>{generating ? 'Synthesizing Curriculum...' : 'Generate Structured Lesson'}</span>
          </button>
        </div>
      )}

      {/* TAB 2: INGESTION PIPELINE */}
      {activeTab === 'ingest' && (
        <div className="glass-panel" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
            External Document / Syllabus Ingestion Pipeline
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
            Paste textbook notes, language curriculum guidelines, or syllabus excerpts. Our processor parses terms, generates explanations, creates audio dialogues, exercises, and roleplay scenarios.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                Target Topic:
              </label>
              <Input
                value={ingestTopic}
                onChange={(e) => setIngestTopic(e.target.value)}
                style={{ background: 'rgba(255, 255, 255, 0.04)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                Language:
              </label>
              <Select
                value={ingestLang}
                onChange={setIngestLang}
                style={{ width: '100%' }}
                options={[
                  { value: 'KO', label: '🇰🇷 Korean' },
                  { value: 'EN', label: '🇺🇸 English' },
                ]}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                Target Level:
              </label>
              <Select
                value={ingestLevel}
                onChange={setIngestLevel}
                style={{ width: '100%' }}
                options={[
                  { value: 'BEGINNER', label: 'Beginner (A1)' },
                  { value: 'ELEMENTARY', label: 'Elementary (A2)' },
                  { value: 'INTERMEDIATE', label: 'Intermediate (B1)' },
                ]}
              />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Raw Source Material / Dataset:
            </label>
            <TextArea
              rows={8}
              value={rawSource}
              onChange={(e) => setRawSource(e.target.value)}
              style={{ background: 'rgba(255, 255, 255, 0.04)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)', fontFamily: 'monospace' }}
            />
          </div>

          <button
            className="btn-primary"
            onClick={handleRunIngestion}
            disabled={ingesting}
            style={{ padding: '12px 28px', fontSize: 15 }}
          >
            {ingesting ? <Spin size="small" /> : <Upload size={16} />}
            <span>{ingesting ? 'Processing Ingestion Pipeline...' : 'Run Ingestion Pipeline'}</span>
          </button>
        </div>
      )}

      {/* TAB 3: LESSON APPROVAL WORKFLOW */}
      {activeTab === 'manage' && (
        <div className="glass-panel" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
            Curriculum Status & Publishing Workflow
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                style={{
                  padding: 16,
                  borderRadius: 12,
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {lesson.title}
                    </span>
                    <Tag color={statusColorMap[lesson.status]}>{lesson.status}</Tag>
                    <Tag color="geekblue">{lesson.difficulty}</Tag>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                    {lesson.scenario}
                  </div>
                </div>

                {/* Workflow Transitions */}
                <Space>
                  {lesson.status === 'AI_GENERATED' && (
                    <Button
                      size="small"
                      type="dashed"
                      onClick={() => handleUpdateStatus(lesson.id, 'REVIEWING')}
                    >
                      Start Review
                    </Button>
                  )}
                  {(lesson.status === 'REVIEWING' || lesson.status === 'AI_GENERATED') && (
                    <Button
                      size="small"
                      style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#A5B4FC' }}
                      onClick={() => handleUpdateStatus(lesson.id, 'APPROVED')}
                    >
                      Approve
                    </Button>
                  )}
                  {lesson.status !== 'PUBLISHED' && (
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => handleUpdateStatus(lesson.id, 'PUBLISHED')}
                    >
                      Publish
                    </Button>
                  )}
                  {lesson.status === 'PUBLISHED' && (
                    <Button
                      size="small"
                      danger
                      onClick={() => handleUpdateStatus(lesson.id, 'ARCHIVED')}
                    >
                      Archive
                    </Button>
                  )}
                </Space>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generated Lesson Preview Modal */}
      {isPreviewOpen && generatedLesson && (
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Sparkles size={20} color="#6366F1" />
              <span style={{ fontSize: 18, fontWeight: 700 }}>Structured Lesson Preview: {generatedLesson.title}</span>
            </div>
          }
          open={isPreviewOpen}
          onCancel={() => setIsPreviewOpen(false)}
          footer={null}
          width={720}
          centered
        >
          <div style={{ padding: '10px 0' }}>
            <div style={{ marginBottom: 16 }}>
              <Tag color="purple">{generatedLesson.status}</Tag>
              <Tag color="cyan">{generatedLesson.difficulty}</Tag>
            </div>

            <Paragraph style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              <strong>Scenario:</strong> {generatedLesson.scenario}
            </Paragraph>

            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                Generated Vocabulary ({generatedLesson.vocabulary?.length || 0}):
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                {generatedLesson.vocabulary?.map((v, i) => (
                  <div key={i} style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(255, 255, 255, 0.03)', fontSize: 13 }}>
                    <strong style={{ color: '#A5B4FC' }}>{v.word}</strong>: {v.meaning} ({v.partOfSpeech})
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                Generated Grammar:
              </h4>
              {generatedLesson.grammar?.map((g, i) => (
                <div key={i} style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(255, 255, 255, 0.03)', fontSize: 13, marginTop: 4 }}>
                  <strong style={{ color: '#38BDF8' }}>{g.grammarPoint}</strong>: {g.explanation}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
              <Button onClick={() => setIsPreviewOpen(false)}>Close Preview</Button>
              <Button
                type="primary"
                onClick={() => {
                  handleUpdateStatus(generatedLesson.id, 'PUBLISHED');
                  setIsPreviewOpen(false);
                }}
              >
                Approve & Publish to Site
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
