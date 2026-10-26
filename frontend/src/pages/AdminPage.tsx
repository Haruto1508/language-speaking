import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Pagination,
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
  Trash2,
  PlayCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useAppStore } from '../stores/useAppStore';
import { ContentStatus, LessonDetail, LessonSummary, ProficiencyLevelCode, LanguageCode, formatLevelVietnamese, ConversationScenario } from '../types';
import { generateFullLessonWithAi, ingestRawContentToLesson } from '../services/aiGenerator';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const STORAGE_KEY = 'linguatalk_admin_lessons';
const FULL_LESSONS_KEY = 'linguatalk_full_lessons';

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

export const saveFullLessonDetail = (lesson: LessonDetail) => {
  try {
    const existing = JSON.parse(localStorage.getItem(FULL_LESSONS_KEY) || '{}');
    existing[lesson.id] = lesson;
    localStorage.setItem(FULL_LESSONS_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error('Failed to save full lesson', e);
  }
};

export const getFullLessonDetail = (id: number): LessonDetail | null => {
  try {
    const existing = JSON.parse(localStorage.getItem(FULL_LESSONS_KEY) || '{}');
    return existing[id] || null;
  } catch {
    return null;
  }
};

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { targetLanguage, apiKey, apiProvider, addCustomScenario } = useAppStore();

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

  // Language filter & Pagination (10 items per page)
  const [filterLang, setFilterLang] = useState<LanguageCode>(targetLanguage);
  const [tab1Page, setTab1Page] = useState(1);
  const [tab3Page, setTab3Page] = useState(1);
  const PAGE_SIZE = 10;

  // Sync with global targetLanguage when it changes
  useEffect(() => {
    setFilterLang(targetLanguage);
    setTab1Page(1);
    setTab3Page(1);
  }, [targetLanguage]);

  // Count per language
  const koreanCount = lessons.filter(
    (l) => (l.languageCode || (/[가-힣]/.test(l.title + l.scenario) ? 'KO' : 'EN')) === 'KO'
  ).length;

  const englishCount = lessons.filter(
    (l) => (l.languageCode || (/[가-힣]/.test(l.title + l.scenario) ? 'KO' : 'EN')) === 'EN'
  ).length;

  // Filter lessons by language
  const filteredLessons = lessons.filter((lesson) => {
    const lang = lesson.languageCode || (/[가-힣]/.test(lesson.title + lesson.scenario) ? 'KO' : 'EN');
    return lang === filterLang;
  });

  const tab1PaginatedLessons = filteredLessons.slice((tab1Page - 1) * PAGE_SIZE, tab1Page * PAGE_SIZE);
  const tab3PaginatedLessons = filteredLessons.slice((tab3Page - 1) * PAGE_SIZE, tab3Page * PAGE_SIZE);

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    try {
      setLoading(true);
      const data = await api.admin.getLessons();
      const stored = getStoredAdminLessons();
      const combined = [...stored];
      for (const item of data) {
        if (!combined.some((c) => c.id === item.id)) {
          combined.push(item);
        }
      }
      setLessons(combined);
    } catch (e) {
      console.warn('Admin load error, using stored and mock lessons list', e);
      const stored = getStoredAdminLessons();
      const defaultMock: LessonSummary[] = [
        {
          id: 1,
          topicId: 1,
          topicName: 'Nhà hàng & Ẩm thực',
          languageCode: 'KO',
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
          languageCode: 'EN',
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
          languageCode: 'KO',
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
      const combined = [...stored];
      for (const item of defaultMock) {
        if (!combined.some((c) => c.id === item.id)) {
          combined.push(item);
        }
      }
      setLessons(combined);
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

  const handleViewLessonDetail = (summary: LessonSummary) => {
    const full = getFullLessonDetail(summary.id);
    if (full) {
      setGeneratedLesson(full);
    } else {
      setGeneratedLesson({
        id: summary.id,
        topicId: summary.topicId,
        topicName: summary.topicName,
        languageCode: summary.languageCode || 'EN',
        title: summary.title,
        scenario: summary.scenario,
        description: summary.description,
        difficulty: summary.difficulty,
        status: summary.status,
        orderIndex: summary.orderIndex,
        vocabulary: [],
        grammar: [],
        dialogues: [],
        exercises: [],
        scenarios: [],
      });
    }
    setIsPreviewOpen(true);
  };

  const handleDeleteLesson = (id: number) => {
    setLessons((prev) => {
      const updated = prev.filter((l) => l.id !== id);
      saveAdminLessons(updated);
      return updated;
    });
    try {
      const existing = JSON.parse(localStorage.getItem(FULL_LESSONS_KEY) || '{}');
      delete existing[id];
      localStorage.setItem(FULL_LESSONS_KEY, JSON.stringify(existing));
      const savedScenarios = JSON.parse(localStorage.getItem('duo_custom_scenarios') || '[]');
      const filteredScenarios = savedScenarios.filter((s: any) => s.id !== id);
      localStorage.setItem('duo_custom_scenarios', JSON.stringify(filteredScenarios));
    } catch (e) {
      console.error(e);
    }
    message.success('Đã xóa bài học khỏi danh sách');
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
        saveFullLessonDetail(result);

        // Sync to customScenarios for DuoChatPage so learner can immediately practice
        try {
          const scenarioForChat: ConversationScenario = {
            id: result.id,
            lessonId: result.id,
            topicCode: 'custom-' + result.id,
            languageCode: result.languageCode,
            levelCode: result.difficulty,
            title: result.title,
            description: result.scenario,
            userRole: result.dialogues?.[0]?.lines?.[0]?.speakerName || (result.languageCode === 'KO' ? 'Khách hàng' : 'Shopper'),
            aiRole: result.dialogues?.[0]?.lines?.[1]?.speakerName || (result.languageCode === 'KO' ? 'Nhân viên' : 'Staff'),
            initialGreeting: result.dialogues?.[0]?.lines?.[1]?.textOriginal || (result.languageCode === 'KO' ? '안녕하세요! 무엇을 도와드릴까요?' : 'Hello! How can I help you today?'),
            culturalContext: result.culturalNotes || '',
          };
          addCustomScenario(scenarioForChat);
        } catch (scErr) {
          console.warn('Could not sync scenario to store', scErr);
        }

        setGeneratedLesson(result);
        setIsPreviewOpen(true);
        message.success('Tạo giáo trình bài học bằng AI thành công và đã lưu vào hệ thống!');
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });

        const newSummary: LessonSummary = {
          id: result.id,
          topicId: result.topicId,
          topicName: result.topicName,
          title: result.title,
          languageCode: result.languageCode,
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
          const updated = [newSummary, ...prev.filter((l) => l.id !== newSummary.id)];
          saveAdminLessons(updated);
          return updated;
        });
        setFilterLang(result.languageCode);
        setTab1Page(1);
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
        saveFullLessonDetail(result);

        // Sync to customScenarios for DuoChatPage
        try {
          const scenarioForChat: ConversationScenario = {
            id: result.id,
            lessonId: result.id,
            topicCode: 'custom-' + result.id,
            languageCode: result.languageCode,
            levelCode: result.difficulty,
            title: result.title,
            description: result.scenario,
            userRole: result.dialogues?.[0]?.lines?.[0]?.speakerName || (result.languageCode === 'KO' ? 'Khách hàng' : 'Learner'),
            aiRole: result.dialogues?.[0]?.lines?.[1]?.speakerName || (result.languageCode === 'KO' ? 'Nhân viên' : 'AI Assistant'),
            initialGreeting: result.dialogues?.[0]?.lines?.[1]?.textOriginal || (result.languageCode === 'KO' ? '안녕하세요!' : 'Hello!'),
            culturalContext: result.culturalNotes || '',
          };
          addCustomScenario(scenarioForChat);
        } catch (scErr) {
          console.warn('Could not sync scenario to store', scErr);
        }

        setGeneratedLesson(result);
        setIsPreviewOpen(true);
        message.success('Đã nạp và biên dịch giáo trình thành bài học chuẩn!');
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });

        const newSummary: LessonSummary = {
          id: result.id,
          topicId: result.topicId,
          topicName: result.topicName,
          title: result.title,
          languageCode: result.languageCode,
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
          const updated = [newSummary, ...prev.filter((l) => l.id !== newSummary.id)];
          saveAdminLessons(updated);
          return updated;
        });
        setFilterLang(result.languageCode as LanguageCode);
        setTab1Page(1);
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
        const updatedDetail = { ...generatedLesson, status };
        setGeneratedLesson(updatedDetail);
        saveFullLessonDetail(updatedDetail);
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
          Quản trị Giáo trình & Hệ thống Nạp AI
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
          <span>Quản lý & Duyệt bài ({filteredLessons.length})</span>
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

          {/* LIST OF CREATED & SAVED CURRICULUMS IN TAB 1 */}
          <div style={{ marginTop: 36, paddingTop: 24, borderTop: '1.5px solid var(--duo-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h4 style={{ fontSize: 18, fontWeight: 900, color: 'var(--duo-text-primary)', margin: 0 }}>
                  Giáo trình Đã Lưu Vào Hệ thống ({filteredLessons.length} bài)
                </h4>
                <span style={{ fontSize: 13, color: 'var(--duo-text-secondary)' }}>
                  Hiển thị theo ngôn ngữ đang chọn ({filterLang === 'KO' ? '🇰🇷 Tiếng Hàn' : '🇺🇸 Tiếng Anh'}). Đã đồng bộ sẵn sàng vào Luyện nói AI.
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                {/* Language Toggle Pills */}
                <div style={{ display: 'flex', gap: 6, background: 'var(--duo-bg)', padding: 4, borderRadius: 12, border: '1px solid var(--duo-border)' }}>
                  <Button
                    size="small"
                    type={filterLang === 'KO' ? 'primary' : 'text'}
                    onClick={() => { setFilterLang('KO'); setTab1Page(1); }}
                    style={{
                      fontWeight: 700,
                      borderRadius: 8,
                      background: filterLang === 'KO' ? '#6366F1' : 'transparent',
                    }}
                  >
                    🇰🇷 Tiếng Hàn ({koreanCount})
                  </Button>
                  <Button
                    size="small"
                    type={filterLang === 'EN' ? 'primary' : 'text'}
                    onClick={() => { setFilterLang('EN'); setTab1Page(1); }}
                    style={{
                      fontWeight: 700,
                      borderRadius: 8,
                      background: filterLang === 'EN' ? '#1CB0F6' : 'transparent',
                    }}
                  >
                    🇺🇸 Tiếng Anh ({englishCount})
                  </Button>
                </div>

                <Button
                  type="link"
                  onClick={() => setActiveTab('manage')}
                  style={{ fontWeight: 700, color: '#1CB0F6', padding: 0 }}
                >
                  Chuyển sang trang Quản lý & Xét duyệt ➔
                </Button>
              </div>
            </div>

            {filteredLessons.length === 0 ? (
              <div style={{ padding: 28, textAlign: 'center', background: 'var(--duo-bg)', borderRadius: 16, border: '1.5px dashed var(--duo-border)' }}>
                <p style={{ color: 'var(--duo-text-secondary)', margin: 0 }}>
                  Chưa có giáo trình nào cho {filterLang === 'KO' ? 'Tiếng Hàn' : 'Tiếng Anh'}. Hãy điền thông tin và bấm nút "Bắt đầu Tạo bài học với AI" ở trên!
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {tab1PaginatedLessons.map((lesson, idx) => (
                  <div
                    key={lesson.id}
                    style={{
                      padding: '16px 20px',
                      borderRadius: 14,
                      background: idx === 0 && generatedLesson?.id === lesson.id ? 'rgba(88, 204, 2, 0.08)' : 'var(--duo-bg)',
                      border: idx === 0 && generatedLesson?.id === lesson.id ? '2px solid #58CC02' : '1.5px solid var(--duo-border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 16,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 280 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--duo-text-primary)' }}>
                          {lesson.title}
                        </span>
                        <Tag color={statusColorMap[lesson.status]}>{statusLabelMap[lesson.status] || lesson.status}</Tag>
                        <Tag color="cyan">{formatLevelVietnamese(lesson.difficulty)}</Tag>
                        {lesson.languageCode && (
                          <Tag color={lesson.languageCode === 'KO' ? 'blue' : 'green'}>
                            {lesson.languageCode === 'KO' ? '🇰🇷 Tiếng Hàn' : '🇺🇸 Tiếng Anh'}
                          </Tag>
                        )}
                        {idx === 0 && generatedLesson?.id === lesson.id && (
                          <Tag color="success">Vừa tạo & Đã lưu ✨</Tag>
                        )}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--duo-text-secondary)', lineHeight: 1.5 }}>
                        {lesson.scenario}
                      </div>
                      <div style={{ display: 'flex', gap: 14, marginTop: 8, fontSize: 12, color: 'var(--duo-text-secondary)' }}>
                        <span>📖 {lesson.vocabularyCount} từ vựng</span>
                        <span>📝 {lesson.grammarCount} điểm ngữ pháp</span>
                        <span>💬 {lesson.exercisesCount > 0 ? `${lesson.exercisesCount} bài tập` : 'Kịch bản đối thoại thực tế'}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <Button
                        icon={<Eye size={14} />}
                        onClick={() => handleViewLessonDetail(lesson)}
                      >
                        Xem kịch bản
                      </Button>
                      <Button
                        type="primary"
                        style={{ background: '#58CC02', borderColor: '#58CC02', fontWeight: 700 }}
                        onClick={() => navigate(`/chat?scenarioId=${lesson.id}`)}
                      >
                        Vào Luyện nói AI
                      </Button>
                      <Button
                        danger
                        size="small"
                        icon={<Trash2 size={13} />}
                        onClick={() => handleDeleteLesson(lesson.id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredLessons.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
                <Pagination
                  current={tab1Page}
                  pageSize={PAGE_SIZE}
                  total={filteredLessons.length}
                  onChange={(page) => setTab1Page(page)}
                  showSizeChanger={false}
                  showTotal={(total, range) => `${range[0]}-${range[1]} trên tổng số ${total} giáo trình (${filterLang === 'KO' ? 'Tiếng Hàn' : 'Tiếng Anh'})`}
                />
              </div>
            )}
          </div>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 900, color: 'var(--duo-text-primary)', margin: 0 }}>
                Quy trình Xét duyệt & Xuất bản Giáo trình ({filteredLessons.length} bài)
              </h3>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--duo-text-secondary)', marginTop: 4 }}>
                Quản lý vòng đời giáo trình {filterLang === 'KO' ? '🇰🇷 Tiếng Hàn' : '🇺🇸 Tiếng Anh'}: AI tạo ➔ Duyệt nội dung ➔ Xuất bản cho học viên
              </p>
            </div>

            {/* Language filter buttons */}
            <div style={{ display: 'flex', gap: 6, background: 'var(--duo-bg)', padding: 4, borderRadius: 12, border: '1px solid var(--duo-border)' }}>
              <Button
                size="small"
                type={filterLang === 'KO' ? 'primary' : 'text'}
                onClick={() => { setFilterLang('KO'); setTab3Page(1); }}
                style={{
                  fontWeight: 700,
                  borderRadius: 8,
                  background: filterLang === 'KO' ? '#6366F1' : 'transparent',
                }}
              >
                🇰🇷 Tiếng Hàn ({koreanCount})
              </Button>
              <Button
                size="small"
                type={filterLang === 'EN' ? 'primary' : 'text'}
                onClick={() => { setFilterLang('EN'); setTab3Page(1); }}
                style={{
                  fontWeight: 700,
                  borderRadius: 8,
                  background: filterLang === 'EN' ? '#1CB0F6' : 'transparent',
                }}
              >
                🇺🇸 Tiếng Anh ({englishCount})
              </Button>
            </div>
          </div>

          {filteredLessons.length === 0 ? (
            <div style={{ padding: 28, textAlign: 'center', background: 'var(--duo-bg)', borderRadius: 16, border: '1.5px dashed var(--duo-border)' }}>
              <p style={{ color: 'var(--duo-text-secondary)', margin: 0 }}>
                Không có giáo trình nào thuộc {filterLang === 'KO' ? 'Tiếng Hàn' : 'Tiếng Anh'} cần xét duyệt.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {tab3PaginatedLessons.map((lesson) => (
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
                  <div style={{ flex: 1, minWidth: 260 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--duo-text-primary)' }}>
                        {lesson.title}
                      </span>
                      <Tag color={statusColorMap[lesson.status]}>{statusLabelMap[lesson.status] || lesson.status}</Tag>
                      <Tag color="geekblue">{formatLevelVietnamese(lesson.difficulty)}</Tag>
                      {lesson.languageCode && (
                        <Tag color={lesson.languageCode === 'KO' ? 'blue' : 'green'}>
                          {lesson.languageCode === 'KO' ? '🇰🇷 Tiếng Hàn' : '🇺🇸 Tiếng Anh'}
                        </Tag>
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                      {lesson.scenario}
                    </div>
                    <div style={{ display: 'flex', gap: 14, marginTop: 6, fontSize: 12, color: 'var(--duo-text-secondary)' }}>
                      <span>📖 {lesson.vocabularyCount} từ vựng</span>
                      <span>📝 {lesson.grammarCount} ngữ pháp</span>
                    </div>
                  </div>

                  {/* Workflow Transitions */}
                  <Space wrap>
                    <Button
                      size="small"
                      icon={<Eye size={12} />}
                      onClick={() => handleViewLessonDetail(lesson)}
                    >
                      Xem
                    </Button>
                    <Button
                      size="small"
                      style={{ background: '#58CC02', borderColor: '#58CC02', color: '#fff', fontWeight: 700 }}
                      onClick={() => navigate(`/chat?scenarioId=${lesson.id}`)}
                    >
                      Luyện nói
                    </Button>
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
                        Xuất bản
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
                    <Button
                      size="small"
                      danger
                      icon={<Trash2 size={12} />}
                      onClick={() => handleDeleteLesson(lesson.id)}
                    />
                  </Space>
                </div>
              ))}
            </div>
          )}

          {filteredLessons.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
              <Pagination
                current={tab3Page}
                pageSize={PAGE_SIZE}
                total={filteredLessons.length}
                onChange={(page) => setTab3Page(page)}
                showSizeChanger={false}
                showTotal={(total, range) => `${range[0]}-${range[1]} trên tổng số ${total} giáo trình (${filterLang === 'KO' ? 'Tiếng Hàn' : 'Tiếng Anh'})`}
              />
            </div>
          )}
        </div>
      )}

      {/* Generated Lesson Preview Modal */}
      {isPreviewOpen && generatedLesson && (
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Sparkles size={20} color="#6366F1" />
              <span style={{ fontSize: 17, fontWeight: 800 }}>Xem trước Giáo trình: {generatedLesson.title}</span>
            </div>
          }
          open={isPreviewOpen}
          onCancel={() => setIsPreviewOpen(false)}
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingTop: 10, borderTop: '1px solid var(--duo-border)' }}>
              <Button
                type="primary"
                style={{ background: '#58CC02', borderColor: '#58CC02', fontWeight: 700 }}
                onClick={() => {
                  handleUpdateStatus(generatedLesson.id, 'PUBLISHED');
                  setIsPreviewOpen(false);
                  navigate(`/chat?scenarioId=${generatedLesson.id}`);
                }}
              >
                🚀 Xuất bản & Vào Luyện nói ngay
              </Button>
              <div style={{ display: 'flex', gap: 10 }}>
                <Button onClick={() => setIsPreviewOpen(false)}>Đóng xem trước</Button>
                <Button
                  type="primary"
                  onClick={() => {
                    handleUpdateStatus(generatedLesson.id, 'PUBLISHED');
                    message.success('Đã xuất bản giáo trình! Bạn có thể xem ngay trong danh sách bên dưới.');
                    setIsPreviewOpen(false);
                  }}
                >
                  Phê duyệt & Xuất bản
                </Button>
              </div>
            </div>
          }
          width={680}
          centered
        >
          <div
            style={{
              maxHeight: '48vh',
              overflowY: 'auto',
              paddingRight: 8,
              paddingTop: 6,
              paddingBottom: 6,
            }}
          >
            <div style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
              <Tag color="purple">{statusLabelMap[generatedLesson.status] || generatedLesson.status}</Tag>
              <Tag color="cyan">{formatLevelVietnamese(generatedLesson.difficulty)}</Tag>
              {generatedLesson.languageCode && (
                <Tag color={generatedLesson.languageCode === 'KO' ? 'blue' : 'green'}>
                  {generatedLesson.languageCode === 'KO' ? '🇰🇷 Tiếng Hàn' : '🇺🇸 Tiếng Anh'}
                </Tag>
              )}
            </div>

            <Paragraph style={{ color: 'var(--duo-text-secondary)', fontSize: 13, marginBottom: 14 }}>
              <strong>Tình huống:</strong> {generatedLesson.scenario}
            </Paragraph>

            {/* Cultural Notes */}
            {generatedLesson.culturalNotes && (
              <div style={{ marginBottom: 14, padding: '8px 12px', borderRadius: 8, background: 'rgba(255, 200, 0, 0.08)', border: '1px solid rgba(255, 200, 0, 0.25)' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#FFC800', marginBottom: 2 }}>
                  💡 Lưu ý văn hóa & Ứng xử:
                </div>
                <div style={{ fontSize: 12, color: 'var(--duo-text-primary)' }}>
                  {generatedLesson.culturalNotes}
                </div>
              </div>
            )}

            {/* Vocabulary Grid */}
            <div style={{ marginBottom: 14 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--duo-text-primary)', marginBottom: 6 }}>
                Từ vựng trọng tâm ({generatedLesson.vocabulary?.length || 0}):
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 6 }}>
                {generatedLesson.vocabulary?.map((v, i) => (
                  <div key={i} style={{ padding: '6px 10px', borderRadius: 8, background: 'rgba(255, 255, 255, 0.03)', fontSize: 12, border: '1px solid var(--duo-border)' }}>
                    <strong style={{ color: '#A5B4FC' }}>{v.word}</strong>: {v.meaning}{' '}
                    <span style={{ opacity: 0.6, fontSize: 11 }}>({v.partOfSpeech})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Grammar */}
            <div style={{ marginBottom: 14 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--duo-text-primary)', marginBottom: 6 }}>
                Ngữ pháp & Cấu trúc ({generatedLesson.grammar?.length || 0}):
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {generatedLesson.grammar?.map((g, i) => (
                  <div key={i} style={{ padding: '6px 10px', borderRadius: 8, background: 'rgba(255, 255, 255, 0.03)', fontSize: 12, border: '1px solid var(--duo-border)' }}>
                    <strong style={{ color: '#1CB0F6' }}>{g.grammarPoint}</strong>: {g.explanation}
                    {g.exampleSentence && (
                      <div style={{ color: 'var(--duo-text-secondary)', marginTop: 2, fontSize: 11 }}>
                        Ví dụ: <em>"{g.exampleSentence}"</em> {g.translation ? `(${g.translation})` : ''}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Dialogues */}
            {generatedLesson.dialogues && generatedLesson.dialogues.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--duo-text-primary)', marginBottom: 6 }}>
                  Hội thoại đối đáp mẫu ({generatedLesson.dialogues[0].lines?.length || 0} lượt):
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {generatedLesson.dialogues[0].lines?.map((line, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 8,
                        background: line.speakerRole === 'USER' ? 'rgba(88, 204, 2, 0.08)' : 'rgba(28, 176, 246, 0.08)',
                        borderLeft: line.speakerRole === 'USER' ? '3px solid #58CC02' : '3px solid #1CB0F6',
                        fontSize: 12,
                      }}
                    >
                      <strong style={{ color: line.speakerRole === 'USER' ? '#58CC02' : '#1CB0F6' }}>
                        {line.speakerName}:
                      </strong>{' '}
                      <span>{line.textOriginal}</span>
                      {line.textTranslation && (
                        <div style={{ fontSize: 11, color: 'var(--duo-text-secondary)', marginTop: 2 }}>
                          ↳ <em>{line.textTranslation}</em>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Exercises if present */}
            {generatedLesson.exercises && generatedLesson.exercises.length > 0 && generatedLesson.exercises[0]?.questions && (
              <div style={{ marginBottom: 10 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--duo-text-primary)', marginBottom: 6 }}>
                  Bài tập củng cố ({generatedLesson.exercises[0].questions.length} câu hỏi trắc nghiệm):
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {generatedLesson.exercises[0].questions.map((q, idx) => (
                    <div key={idx} style={{ padding: '6px 10px', borderRadius: 8, background: 'rgba(255, 255, 255, 0.02)', fontSize: 12, border: '1px solid var(--duo-border)' }}>
                      <div style={{ fontWeight: 600 }}>Câu {idx + 1}: {q.prompt}</div>
                      <div style={{ fontSize: 11, color: '#58CC02', marginTop: 2 }}>
                        ✓ Đáp án: {q.correctAnswer} {q.explanation ? `(${q.explanation})` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
