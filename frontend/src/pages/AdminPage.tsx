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
import { ContentStatus, LessonDetail, LessonSummary, ProficiencyLevelCode, LanguageCode, formatLevelVietnamese } from '../types';
import { generateFullLessonWithAi, ingestRawContentToLesson } from '../services/aiGenerator';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const STORAGE_KEY = 'linguatalk_admin_lessons';
const getStoredAdminLessons = (): LessonSummary[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveAdminLessons = (list: LessonSummary[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save admin lessons to localStorage', e);
  }
};

export const AdminPage: React.FC = () => {
  const { targetLanguage, apiKey, apiProvider } = useAppStore();

  const [activeTab, setActiveTab] = useState('generate');
  const [lessons, setLessons] = useState<LessonSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [ingesting, setIngesting] = useState(false);

  // Form states for Generator
  const [lessonLang, setLessonLang] = useState<LanguageCode>(targetLanguage);
  const [topicId, setTopicId] = useState<number>(1);
  const [lessonTitle, setLessonTitle] = useState('Nhận phòng tại khách sạn (Boutique Hotel Check-in)');
  const [scenario, setScenario] = useState('Luyện tập làm thủ tục nhận phòng, yêu cầu phòng tầng cao không hút thuốc và hỏi giờ phục vụ bữa sáng.');
  const [difficulty, setDifficulty] = useState<ProficiencyLevelCode>('ELEMENTARY');
  const [objectives, setObjectives] = useState('Làm chủ từ vựng nhận phòng khách sạn và cách đề nghị lịch sự.');

  // Form states for Ingestion Pipeline
  const [ingestTopic, setIngestTopic] = useState('Phòng khám y tế & Hiệu thuốc tại Seoul (Medical Clinic & Pharmacy)');
  const [ingestLang, setIngestLang] = useState('KO');
  const [ingestLevel, setIngestLevel] = useState('BEGINNER');
  const [rawSource, setRawSource] = useState(`Bài 4: Khám bệnh & Mua thuốc (병원과 약국)
Từ vựng cốt lõi:
- 아프다 (bị ốm / đau)
- 감기약 (thuốc cảm)
- 처방전 (đơn thuốc)
- 열이 나다 (bị sốt)
Ngữ pháp:
- V + -(으)면 안 돼요 (Không được phép / cấm)
- V + -어/아야 되다 (Phải / bắt buộc)
Tình huống:
Bệnh nhân nói triệu chứng (đau đầu, sốt 2 ngày), bác sĩ chẩn đoán và bệnh nhân cầm đơn thuốc ra hiệu thuốc mua.`);

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
      const stored = getStoredAdminLessons();
      setLessons([...stored, ...data]);
    } catch (e) {
      console.warn('Admin load error, using stored and mock lessons list', e);
      const stored = getStoredAdminLessons();
      const defaultMock: LessonSummary[] = [
        {
          id: 1,
          topicId: 1,
          topicName: 'Nhà hàng & Ẩm thực',
          title: 'Gọi món tại quán ăn Hàn Quốc (식당에서 주문하기)',
          scenario: 'Gọi món canh kim chi, xin thêm nước và gọi thanh toán hóa đơn.',
          description: 'Làm chủ đuôi câu lịch sự -요, xưng hô 저기요 và hỏi món gợi ý.',
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
          topicName: 'Quán Cà phê Specialty',
          title: 'Gọi đồ uống tại quán Specialty Coffee',
          scenario: 'Đặt thức uống tùy chỉnh, hỏi về hồ sơ hạt rang và thanh toán.',
          description: 'Làm chủ các mẫu câu lịch sự (Could I get), mức rang và lựa chọn mang về.',
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
          topicName: 'Khách sạn & Lưu trú',
          title: 'Thủ tục nhận phòng khách sạn Boutique',
          scenario: 'Nhận phòng, hỏi giờ ăn sáng và gửi hành lý.',
          description: 'Giáo trình do AI tạo tự động, đang chờ phê duyệt.',
          difficulty: 'ELEMENTARY',
          status: 'AI_GENERATED',
          orderIndex: 2,
          vocabularyCount: 4,
          grammarCount: 1,
          exercisesCount: 2,
        },
      ];
      setLessons([...stored, ...defaultMock]);
    } finally {
      setLoading(false);
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

  const statusLabelMap: Record<ContentStatus, string> = {
    DRAFT: 'Bản nháp',
    AI_GENERATED: 'AI Tạo tự động',
    REVIEWING: 'Đang kiểm duyệt',
    APPROVED: 'Đã phê duyệt',
    PUBLISHED: 'Đã xuất bản',
    ARCHIVED: 'Đã lưu trữ',
  };

  const handleGenerateLesson = async () => {
    if (!lessonTitle.trim() || !scenario.trim()) {
      message.error('Vui lòng nhập tiêu đề bài học và tình huống');
      return;
    }
    setGenerating(true);
    try {
      let result: LessonDetail | null = null;
      try {
        result = await api.admin.generateLesson({
          topicId,
          title: lessonTitle.trim(),
          scenario: scenario.trim(),
          difficulty,
          learningObjectives: objectives.trim(),
        });
      } catch (apiErr) {
        console.warn('Backend API call failed, generating with AI / Educational Engine:', apiErr);
        result = await generateFullLessonWithAi({
          topicId,
          title: lessonTitle.trim(),
          scenario: scenario.trim(),
          difficulty,
          learningObjectives: objectives.trim(),
          languageCode: lessonLang,
          apiKey,
          provider: apiProvider,
        });
      }

      if (result) {
        setGeneratedLesson(result);
        setIsPreviewOpen(true);
        message.success('Tạo giáo trình bài học bằng AI thành công!');
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });

        const newSummary: LessonSummary = {
          id: result.id,
          topicId: result.topicId,
          topicName: result.topicName,
          title: result.title,
          scenario: result.scenario,
          description: result.description,
          difficulty: result.difficulty,
          status: result.status,
          orderIndex: result.orderIndex,
          vocabularyCount: result.vocabulary?.length || 0,
          grammarCount: result.grammar?.length || 0,
          exercisesCount: result.exercises?.length || 0,
        };

        setLessons((prev) => {
          const updated = [newSummary, ...prev];
          saveAdminLessons(updated);
          return updated;
        });
      }
    } catch (e) {
      console.error('Lesson generation error:', e);
      message.error('Không thể tạo bài học bằng AI');
    } finally {
      setGenerating(false);
    }
  };

  const handleRunIngestion = async () => {
    if (!rawSource.trim()) {
      message.error('Vui lòng nhập văn bản giáo trình thô');
      return;
    }
    setIngesting(true);
    try {
      let result: LessonDetail | null = null;
      try {
        result = await api.admin.ingestContent({
          languageCode: ingestLang,
          levelCode: ingestLevel,
          topicTitle: ingestTopic,
          rawSourceText: rawSource,
        });
      } catch (apiErr) {
        console.warn('Backend Ingestion API failed, using client ingestion engine:', apiErr);
        result = await ingestRawContentToLesson({
          languageCode: ingestLang,
          levelCode: ingestLevel,
          topicTitle: ingestTopic,
          rawSourceText: rawSource,
        });
      }

      if (result) {
        setGeneratedLesson(result);
        setIsPreviewOpen(true);
        message.success('Đã nạp và biên dịch giáo trình thành bài học chuẩn!');
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });

        const newSummary: LessonSummary = {
          id: result.id,
          topicId: result.topicId,
          topicName: result.topicName,
          title: result.title,
          scenario: result.scenario,
          description: result.description,
          difficulty: result.difficulty,
          status: result.status,
          orderIndex: result.orderIndex,
          vocabularyCount: result.vocabulary?.length || 0,
          grammarCount: result.grammar?.length || 0,
          exercisesCount: result.exercises?.length || 0,
        };

        setLessons((prev) => {
          const updated = [newSummary, ...prev];
          saveAdminLessons(updated);
          return updated;
        });
      }
    } catch (e) {
      message.error('Không thể nạp nội dung');
    } finally {
      setIngesting(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: ContentStatus) => {
    try {
      try {
        await api.admin.updateLessonStatus(id, status);
      } catch (e) {
        console.warn('Backend updateLessonStatus failed, updating locally:', e);
      }

      message.success(`Đã cập nhật trạng thái: ${statusLabelMap[status] || status}`);
      setLessons((prev) => {
        const updated = prev.map((l) => (l.id === id ? { ...l, status } : l));
        saveAdminLessons(updated);
        return updated;
      });

      if (generatedLesson && generatedLesson.id === id) {
        setGeneratedLesson({ ...generatedLesson, status });
      }

      if (status === 'PUBLISHED') {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
      }
    } catch (e) {
      message.error('Không thể cập nhật trạng thái');
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 60 }}>
      <div style={{ marginBottom: 28 }}>
        <Title level={2} style={{ color: 'var(--duo-text-primary)', margin: 0, fontWeight: 900 }}>
          Quản trị Giáo trình & Hệ thống Nạp AI ⚙️
        </Title>
        <Text style={{ color: 'var(--duo-text-secondary)', fontSize: 14 }}>
          Quản lý giáo trình chuẩn, kiểm duyệt bài học do AI tạo và tự động chuyển đổi tài liệu giáo dục thành bài học thực tế.
        </Text>
      </div>

      {/* Pipeline Architecture Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '20px 24px',
          marginBottom: 24,
          background: 'linear-gradient(135deg, rgba(88, 204, 2, 0.08), rgba(28, 176, 246, 0.08))',
          border: '1px solid rgba(88, 204, 2, 0.25)',
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 800, color: '#1CB0F6', textTransform: 'uppercase', marginBottom: 8 }}>
          Kiến trúc Quy trình Nạp & Chuẩn hóa Nội dung
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', fontSize: 13, color: 'var(--duo-text-primary)' }}>
          <Tag color="geekblue" icon={<FileText size={12} style={{ marginRight: 4 }} />}>Tài liệu Nguồn</Tag>
          <span>➔</span>
          <Tag color="cyan" icon={<Cpu size={12} style={{ marginRight: 4 }} />}>Tách từ & Phân tích cú pháp</Tag>
          <span>➔</span>
          <Tag color="purple" icon={<Sparkles size={12} style={{ marginRight: 4 }} />}>Xử lý Sư phạm AI</Tag>
          <span>➔</span>
          <Tag color="gold" icon={<CheckCircle size={12} style={{ marginRight: 4 }} />}>Kiểm tra Chuẩn dữ liệu</Tag>
          <span>➔</span>
          <Tag color="green" icon={<Database size={12} style={{ marginRight: 4 }} />}>Cơ sở dữ liệu Bài học</Tag>
          <span>➔</span>
          <Tag color="magenta">Kiểm duyệt & Xuất bản</Tag>
        </div>
      </div>

      {/* Modern Duolingo Tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <button
          className={activeTab === 'generate' ? 'duo-btn-green' : 'duo-btn-outline'}
          onClick={() => setActiveTab('generate')}
          style={{ padding: '10px 20px', fontSize: 14 }}
        >
          <Sparkles size={16} />
          <span>Tạo giáo trình bằng AI</span>
        </button>
        <button
          className={activeTab === 'ingest' ? 'duo-btn-blue' : 'duo-btn-outline'}
          onClick={() => setActiveTab('ingest')}
          style={{ padding: '10px 20px', fontSize: 14 }}
        >
          <Upload size={16} />
          <span>Nạp tài liệu thô (Ingestion)</span>
        </button>
        <button
          className={activeTab === 'manage' ? 'duo-btn-purple' : 'duo-btn-outline'}
          onClick={() => setActiveTab('manage')}
          style={{ padding: '10px 20px', fontSize: 14 }}
        >
          <Layers size={16} />
          <span>Quản lý & Duyệt bài ({lessons.length})</span>
        </button>
      </div>

      {/* TAB 1: AI LESSON GENERATOR */}
      {activeTab === 'generate' && (
        <div className="duo-card" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 20, fontWeight: 900, color: 'var(--duo-text-primary)', marginBottom: 16 }}>
            Tạo Giáo trình Giao tiếp Tự động bằng AI Giáo dục
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--duo-text-secondary)', display: 'block', marginBottom: 6 }}>
                Ngôn ngữ bài học:
              </label>
              <Select
                value={lessonLang}
                onChange={(val) => setLessonLang(val)}
                style={{ width: '100%', height: 40 }}
                options={[
                  { value: 'KO', label: '🇰🇷 Tiếng Hàn (Korean)' },
                  { value: 'EN', label: '🇺🇸 Tiếng Anh (English)' },
                ]}
              />
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--duo-text-secondary)', display: 'block', marginBottom: 6 }}>
                Trình độ:
              </label>
              <Select
                value={difficulty}
                onChange={(val) => setDifficulty(val)}
                style={{ width: '100%', height: 40 }}
                options={[
                  { value: 'BEGINNER', label: 'Mới bắt đầu (A1)' },
                  { value: 'ELEMENTARY', label: 'Sơ cấp (A2)' },
                  { value: 'INTERMEDIATE', label: 'Trung cấp (B1)' },
                  { value: 'UPPER_INTERMEDIATE', label: 'Trung cấp nâng cao (B2)' },
                  { value: 'ADVANCED', label: 'Cao cấp (C1)' },
                ]}
              />
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--duo-text-secondary)', display: 'block', marginBottom: 6 }}>
                Tiêu đề bài học:
              </label>
              <Input
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                style={{ background: 'var(--duo-card-bg)', borderColor: 'var(--duo-border)', color: 'var(--duo-text-primary)', borderRadius: 10, padding: '8px 12px' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--duo-text-secondary)', display: 'block', marginBottom: 6 }}>
              Mô tả tình huống giao tiếp:
            </label>
            <Input
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              placeholder="Ví dụ: Đặt câu hỏi hỏi đường, gọi món ăn, phỏng vấn xin việc..."
              style={{ background: 'var(--duo-card-bg)', borderColor: 'var(--duo-border)', color: 'var(--duo-text-primary)', borderRadius: 10, padding: '8px 12px' }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--duo-text-secondary)', display: 'block', marginBottom: 6 }}>
              Mục tiêu học tập (Tuỳ chọn):
            </label>
            <TextArea
              rows={3}
              value={objectives}
              onChange={(e) => setObjectives(e.target.value)}
              style={{ background: 'var(--duo-card-bg)', borderColor: 'var(--duo-border)', color: 'var(--duo-text-primary)', borderRadius: 10 }}
            />
          </div>

          <button
            className="duo-btn-green"
            onClick={handleGenerateLesson}
            disabled={generating}
            style={{ padding: '12px 28px', fontSize: 15 }}
          >
            {generating ? <Spin size="small" /> : <Sparkles size={16} />}
            <span>{generating ? 'Đang soạn thảo giáo trình...' : 'Bắt đầu Tạo bài học với AI'}</span>
          </button>
        </div>
      )}

      {/* TAB 2: INGESTION PIPELINE */}
      {activeTab === 'ingest' && (
        <div className="duo-card" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 20, fontWeight: 900, color: 'var(--duo-text-primary)', marginBottom: 8 }}>
            Đường ống nạp Giáo trình & Tài liệu Thô tự động
          </h3>
          <p style={{ color: 'var(--duo-text-secondary)', fontSize: 14, marginBottom: 20 }}>
            Dán tài liệu học, ghi chú hoặc nội dung giáo trình bất kỳ. Hệ thống AI sẽ tự động phân tích từ vựng, tạo giải thích ngữ pháp, đoạn hội thoại audio và các bài tập luyện phát âm tương ứng.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--duo-text-secondary)', display: 'block', marginBottom: 6 }}>
                Chủ đề mục tiêu:
              </label>
              <Input
                value={ingestTopic}
                onChange={(e) => setIngestTopic(e.target.value)}
                style={{ background: 'var(--duo-card-bg)', borderColor: 'var(--duo-border)', color: 'var(--duo-text-primary)', borderRadius: 10, padding: '8px 12px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--duo-text-secondary)', display: 'block', marginBottom: 6 }}>
                Ngôn ngữ:
              </label>
              <Select
                value={ingestLang}
                onChange={setIngestLang}
                style={{ width: '100%', height: 40 }}
                options={[
                  { value: 'KO', label: '🇰🇷 Tiếng Hàn' },
                  { value: 'EN', label: '🇺🇸 Tiếng Anh' },
                ]}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--duo-text-secondary)', display: 'block', marginBottom: 6 }}>
                Trình độ mục tiêu:
              </label>
              <Select
                value={ingestLevel}
                onChange={setIngestLevel}
                style={{ width: '100%', height: 40 }}
                options={[
                  { value: 'BEGINNER', label: 'Mới bắt đầu (A1)' },
                  { value: 'ELEMENTARY', label: 'Sơ cấp (A2)' },
                  { value: 'INTERMEDIATE', label: 'Trung cấp (B1)' },
                ]}
              />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--duo-text-secondary)', display: 'block', marginBottom: 6 }}>
              Dữ liệu tài liệu thô (Văn bản / Giáo trình):
            </label>
            <TextArea
              rows={8}
              value={rawSource}
              onChange={(e) => setRawSource(e.target.value)}
              style={{ background: 'var(--duo-card-bg)', borderColor: 'var(--duo-border)', color: 'var(--duo-text-primary)', fontFamily: 'monospace', borderRadius: 10 }}
            />
          </div>

          <button
            className="duo-btn-blue"
            onClick={handleRunIngestion}
            disabled={ingesting}
            style={{ padding: '12px 28px', fontSize: 15 }}
          >
            {ingesting ? <Spin size="small" /> : <Upload size={16} />}
            <span>{ingesting ? 'Đang nạp và xử lý pipeline...' : 'Chạy Đường ống nạp Giáo trình'}</span>
          </button>
        </div>
      )}

      {/* TAB 3: LESSON APPROVAL WORKFLOW */}
      {activeTab === 'manage' && (
        <div className="duo-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 20, fontWeight: 900, color: 'var(--duo-text-primary)', marginBottom: 16 }}>
            Quy trình Xét duyệt & Xuất bản Giáo trình
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                style={{
                  padding: 16,
                  borderRadius: 14,
                  background: 'var(--duo-bg)',
                  border: '1.5px solid var(--duo-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--duo-text-primary)' }}>
                      {lesson.title}
                    </span>
                    <Tag color={statusColorMap[lesson.status]}>{statusLabelMap[lesson.status] || lesson.status}</Tag>
                    <Tag color="geekblue">{formatLevelVietnamese(lesson.difficulty)}</Tag>
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
                      Bắt đầu duyệt
                    </Button>
                  )}
                  {(lesson.status === 'REVIEWING' || lesson.status === 'AI_GENERATED') && (
                    <Button
                      size="small"
                      style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#A5B4FC' }}
                      onClick={() => handleUpdateStatus(lesson.id, 'APPROVED')}
                    >
                      Phê duyệt
                    </Button>
                  )}
                  {lesson.status !== 'PUBLISHED' && (
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => handleUpdateStatus(lesson.id, 'PUBLISHED')}
                    >
                      Xuất bản ngay
                    </Button>
                  )}
                  {lesson.status === 'PUBLISHED' && (
                    <Button
                      size="small"
                      danger
                      onClick={() => handleUpdateStatus(lesson.id, 'ARCHIVED')}
                    >
                      Lưu trữ
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
              <span style={{ fontSize: 18, fontWeight: 800 }}>Xem trước Giáo trình: {generatedLesson.title}</span>
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
              <Tag color="purple">{statusLabelMap[generatedLesson.status] || generatedLesson.status}</Tag>
              <Tag color="cyan">{formatLevelVietnamese(generatedLesson.difficulty)}</Tag>
            </div>

            <Paragraph style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              <strong>Tình huống:</strong> {generatedLesson.scenario}
            </Paragraph>

            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                Từ vựng được tạo ({generatedLesson.vocabulary?.length || 0}):
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
              <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--duo-text-primary)' }}>
                Ngữ pháp được tạo ({generatedLesson.grammar?.length || 0}):
              </h4>
              {generatedLesson.grammar?.map((g, i) => (
                <div key={i} style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(255, 255, 255, 0.04)', fontSize: 13, marginTop: 4, border: '1px solid var(--duo-border)' }}>
                  <strong style={{ color: '#1CB0F6' }}>{g.grammarPoint}</strong>: {g.explanation}
                  {g.exampleSentence && (
                    <div style={{ color: 'var(--duo-text-secondary)', marginTop: 2, fontSize: 12 }}>
                      Ví dụ: <em>"{g.exampleSentence}"</em> {g.translation ? `(${g.translation})` : ''}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Dialogues */}
            {generatedLesson.dialogues && generatedLesson.dialogues.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--duo-text-primary)' }}>
                  Hội thoại giao tiếp thực tế ({generatedLesson.dialogues[0].lines?.length || 0} lượt):
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                  {generatedLesson.dialogues[0].lines?.map((line, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 8,
                        background: line.speakerRole === 'USER' ? 'rgba(88, 204, 2, 0.08)' : 'rgba(28, 176, 246, 0.08)',
                        borderLeft: line.speakerRole === 'USER' ? '3px solid #58CC02' : '3px solid #1CB0F6',
                        fontSize: 13,
                      }}
                    >
                      <strong style={{ color: line.speakerRole === 'USER' ? '#58CC02' : '#1CB0F6' }}>
                        {line.speakerName}:
                      </strong>{' '}
                      <span>{line.textOriginal}</span>
                      {line.textTranslation && (
                        <div style={{ fontSize: 12, color: 'var(--duo-text-secondary)', marginTop: 2 }}>
                          ↳ <em>{line.textTranslation}</em>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cultural Notes */}
            {generatedLesson.culturalNotes && (
              <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 10, background: 'rgba(255, 200, 0, 0.08)', border: '1px solid rgba(255, 200, 0, 0.3)' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#FFC800', marginBottom: 2 }}>
                  💡 Lưu ý văn hóa & Ứng xử giao tiếp:
                </div>
                <div style={{ fontSize: 13, color: 'var(--duo-text-primary)' }}>
                  {generatedLesson.culturalNotes}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
              <Button onClick={() => setIsPreviewOpen(false)}>Đóng xem trước</Button>
              <Button
                type="primary"
                onClick={() => {
                  handleUpdateStatus(generatedLesson.id, 'PUBLISHED');
                  setIsPreviewOpen(false);
                }}
              >
                Phê duyệt & Xuất bản lên hệ thống
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
