import React from 'react';
import { Modal, Radio, Space, Tag, Typography } from 'antd';
import { useAppStore } from '../stores/useAppStore';
import { LanguageCode, ProficiencyLevelCode } from '../types';
import { Globe, Award, CheckCircle2 } from 'lucide-react';

const { Text, Title } = Typography;

const LANGUAGES = [
  {
    code: 'KO' as LanguageCode,
    name: 'Tiếng Hàn',
    nativeName: '한국어',
    flag: '🇰🇷',
    description: 'Chinh phục bảng chữ cái Hangul, kính ngữ (존댓말), quy tắc patchim và các tình huống giao tiếp đời thực tại Seoul.',
  },
  {
    code: 'EN' as LanguageCode,
    name: 'Tiếng Anh',
    nativeName: 'English',
    flag: '🇺🇸',
    description: 'Luyện phản xạ tiếng Anh tự nhiên, phát âm chuẩn IPA, cụm động từ và kỹ năng đàm thoại tự tin trong công việc.',
  },
];

const LEVELS: Array<{ code: ProficiencyLevelCode; name: string; cefr: string; topik: string }> = [
  { code: 'BEGINNER', name: 'Mới bắt đầu', cefr: 'A1', topik: 'TOPIK 1' },
  { code: 'ELEMENTARY', name: 'Sơ cấp', cefr: 'A2', topik: 'TOPIK 2' },
  { code: 'INTERMEDIATE', name: 'Trung cấp', cefr: 'B1', topik: 'TOPIK 3' },
  { code: 'UPPER_INTERMEDIATE', name: 'Trung cấp nâng cao', cefr: 'B2', topik: 'TOPIK 4' },
  { code: 'ADVANCED', name: 'Cao cấp', cefr: 'C1', topik: 'TOPIK 5-6' },
];

export const LanguageModal: React.FC = () => {
  const {
    isLangModalOpen,
    closeLangModal,
    targetLanguage,
    setTargetLanguage,
    targetLevel,
    setTargetLevel,
  } = useAppStore();

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #58CC02, #1CB0F6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Globe size={20} color="#FFFFFF" />
          </div>
          <span style={{ fontSize: 18, fontWeight: 900 }}>Chọn Ngôn ngữ & Trình độ học tập</span>
        </div>
      }
      open={isLangModalOpen}
      onCancel={closeLangModal}
      footer={null}
      width={620}
      centered
    >
      <div style={{ marginTop: 16 }}>
        <Text style={{ color: 'var(--duo-text-secondary)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800 }}>
          1. Chọn ngôn ngữ mục tiêu
        </Text>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 10 }}>
          {LANGUAGES.map((lang) => {
            const isSelected = targetLanguage === lang.code;
            return (
              <div
                key={lang.code}
                onClick={() => setTargetLanguage(lang.code)}
                style={{
                  padding: '16px',
                  borderRadius: 16,
                  background: isSelected ? 'rgba(88, 204, 2, 0.12)' : 'var(--duo-card-bg)',
                  border: isSelected ? '2px solid #58CC02' : '2px solid var(--duo-border)',
                  borderBottom: isSelected ? '4px solid #46A302' : '4px solid var(--duo-border)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                }}
                className="duo-card-interactive"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 34 }}>{lang.flag}</span>
                  {isSelected && <CheckCircle2 size={22} color="#58CC02" />}
                </div>
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 17, fontWeight: 900, color: 'var(--duo-text-primary)' }}>
                    {lang.name}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--duo-text-muted)', fontWeight: 700 }}>{lang.nativeName}</div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--duo-text-secondary)', marginTop: 8, lineHeight: 1.45 }}>
                  {lang.description}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 24 }}>
          <Text style={{ color: 'var(--duo-text-secondary)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800 }}>
            2. Chọn trình độ hiện tại của bạn
          </Text>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
            {LEVELS.map((lvl) => {
              const isSelected = targetLevel === lvl.code;
              return (
                <div
                  key={lvl.code}
                  onClick={() => setTargetLevel(lvl.code)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 12,
                    background: isSelected ? 'rgba(28, 176, 246, 0.12)' : 'var(--duo-card-bg)',
                    border: isSelected ? '2px solid #1CB0F6' : '1.5px solid var(--duo-border)',
                    borderBottom: isSelected ? '3.5px solid #1899D6' : '3px solid var(--duo-border)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease',
                  }}
                  className="duo-card-interactive"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Award size={18} color={isSelected ? '#1CB0F6' : 'var(--duo-text-muted)'} />
                    <span style={{ fontWeight: 800, fontSize: 14, color: isSelected ? '#1CB0F6' : 'var(--duo-text-primary)' }}>
                      {lvl.name}
                    </span>
                  </div>
                  <Space>
                    <Tag color="geekblue" style={{ fontWeight: 800, borderRadius: 6 }}>{lvl.cefr}</Tag>
                    {targetLanguage === 'KO' && <Tag color="purple" style={{ fontWeight: 800, borderRadius: 6 }}>{lvl.topik}</Tag>}
                    {isSelected && <CheckCircle2 size={18} color="#1CB0F6" />}
                  </Space>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <button
            className="duo-btn-green"
            onClick={closeLangModal}
            style={{ width: '100%', padding: '14px', fontSize: 15 }}
          >
            <span>Xác nhận & Bắt đầu luyện tập</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
