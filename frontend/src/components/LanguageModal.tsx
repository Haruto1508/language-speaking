import React from 'react';
import { Modal, Space, Tag, Typography } from 'antd';
import { useAppStore } from '../stores/useAppStore';
import { LanguageCode, ProficiencyLevelCode } from '../types';
import { Globe, Award, CheckCircle2 } from 'lucide-react';

const { Text } = Typography;

const LANGUAGES = [
  {
    code: 'KO' as LanguageCode,
    name: 'Tiếng Hàn',
    nativeName: '한국어',
    flag: '🇰🇷',
    subtitle: 'Hangul • Kính ngữ • Giao tiếp Seoul',
  },
  {
    code: 'EN' as LanguageCode,
    name: 'Tiếng Anh',
    nativeName: 'English',
    flag: '🇺🇸',
    subtitle: 'IPA chuẩn • Phản xạ đàm thoại',
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
              width: 34,
              height: 34,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #58CC02, #1CB0F6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Globe size={18} color="#FFFFFF" />
          </div>
          <span style={{ fontSize: 17, fontWeight: 900 }}>Chọn Ngôn ngữ & Trình độ học tập</span>
        </div>
      }
      open={isLangModalOpen}
      onCancel={closeLangModal}
      footer={null}
      width={680}
      centered
      styles={{
        body: {
          maxHeight: 'calc(85vh - 70px)',
          overflowY: 'auto',
          paddingRight: 4,
        },
      }}
    >
      <div style={{ marginTop: 12 }}>
        {/* Two-column layout to keep modal compact and prevent overflowing screen */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
            alignItems: 'start',
          }}
        >
          {/* Column 1: Target Language */}
          <div>
            <div style={{ marginBottom: 8 }}>
              <Text
                style={{
                  color: 'var(--duo-text-secondary)',
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontWeight: 800,
                }}
              >
                1. Ngôn ngữ mục tiêu
              </Text>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {LANGUAGES.map((lang) => {
                const isSelected = targetLanguage === lang.code;
                return (
                  <div
                    key={lang.code}
                    onClick={() => setTargetLanguage(lang.code)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 14,
                      background: isSelected ? 'rgba(88, 204, 2, 0.12)' : 'var(--duo-card-bg)',
                      border: isSelected ? '2px solid #58CC02' : '2px solid var(--duo-border)',
                      borderBottom: isSelected ? '3.5px solid #46A302' : '3.5px solid var(--duo-border)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                    className="duo-card-interactive"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 32, lineHeight: 1 }}>{lang.flag}</span>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 16, fontWeight: 900, color: 'var(--duo-text-primary)' }}>
                            {lang.name}
                          </span>
                          <span style={{ fontSize: 12, color: 'var(--duo-text-muted)', fontWeight: 700 }}>
                            ({lang.nativeName})
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--duo-text-secondary)', marginTop: 2 }}>
                          {lang.subtitle}
                        </div>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 size={20} color="#58CC02" style={{ flexShrink: 0 }} />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column 2: Proficiency Level */}
          <div>
            <div style={{ marginBottom: 8 }}>
              <Text
                style={{
                  color: 'var(--duo-text-secondary)',
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontWeight: 800,
                }}
              >
                2. Trình độ học tập
              </Text>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {LEVELS.map((lvl) => {
                const isSelected = targetLevel === lvl.code;
                return (
                  <div
                    key={lvl.code}
                    onClick={() => setTargetLevel(lvl.code)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 10,
                      background: isSelected ? 'rgba(28, 176, 246, 0.12)' : 'var(--duo-card-bg)',
                      border: isSelected ? '2px solid #1CB0F6' : '1.5px solid var(--duo-border)',
                      borderBottom: isSelected ? '3px solid #1899D6' : '2.5px solid var(--duo-border)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease',
                    }}
                    className="duo-card-interactive"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Award size={16} color={isSelected ? '#1CB0F6' : 'var(--duo-text-muted)'} />
                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: 13,
                          color: isSelected ? '#1CB0F6' : 'var(--duo-text-primary)',
                        }}
                      >
                        {lvl.name}
                      </span>
                    </div>
                    <Space size={4}>
                      <Tag
                        color={isSelected ? 'blue' : 'default'}
                        style={{ fontWeight: 800, borderRadius: 5, fontSize: 11, margin: 0 }}
                      >
                        {lvl.cefr}
                      </Tag>
                      {targetLanguage === 'KO' && (
                        <Tag
                          color={isSelected ? 'purple' : 'default'}
                          style={{ fontWeight: 800, borderRadius: 5, fontSize: 11, margin: 0 }}
                        >
                          {lvl.topik}
                        </Tag>
                      )}
                      {isSelected && <CheckCircle2 size={16} color="#1CB0F6" style={{ marginLeft: 2 }} />}
                    </Space>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div style={{ marginTop: 18 }}>
          <button
            className="duo-btn-green"
            onClick={closeLangModal}
            style={{ width: '100%', padding: '11px', fontSize: 14 }}
          >
            <span>Xác nhận & Bắt đầu luyện tập</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
