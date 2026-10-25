import React from 'react';
import { Modal, Radio, Space, Tag, Typography } from 'antd';
import { useAppStore } from '../stores/useAppStore';
import { LanguageCode, ProficiencyLevelCode } from '../types';
import { Globe, Award, CheckCircle2 } from 'lucide-react';

const { Text, Title } = Typography;

const LANGUAGES = [
  {
    code: 'KO' as LanguageCode,
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    description: 'Master Hangul, honorifics (존댓말), batchim pronunciation rules, and authentic conversational scenarios in Seoul.',
  },
  {
    code: 'EN' as LanguageCode,
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    description: 'Learn modern idiomatic English, IPA pronunciation, phrasal verbs, polite modal hedging, and global workplace communication.',
  },
];

const LEVELS: Array<{ code: ProficiencyLevelCode; name: string; cefr: string; topik: string }> = [
  { code: 'BEGINNER', name: 'Beginner', cefr: 'A1', topik: 'TOPIK 1' },
  { code: 'ELEMENTARY', name: 'Elementary', cefr: 'A2', topik: 'TOPIK 2' },
  { code: 'INTERMEDIATE', name: 'Intermediate', cefr: 'B1', topik: 'TOPIK 3' },
  { code: 'UPPER_INTERMEDIATE', name: 'Upper Intermediate', cefr: 'B2', topik: 'TOPIK 4' },
  { code: 'ADVANCED', name: 'Advanced', cefr: 'C1', topik: 'TOPIK 5-6' },
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
          <Globe size={22} color="#6366F1" />
          <span style={{ fontSize: 18, fontWeight: 700 }}>Choose Target Language & Level</span>
        </div>
      }
      open={isLangModalOpen}
      onCancel={closeLangModal}
      footer={null}
      width={620}
      centered
    >
      <div style={{ marginTop: 16 }}>
        <Text style={{ color: 'var(--text-secondary)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
          1. Select Language
        </Text>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 10 }}>
          {LANGUAGES.map((lang) => {
            const isSelected = targetLanguage === lang.code;
            return (
              <div
                key={lang.code}
                onClick={() => setTargetLanguage(lang.code)}
                style={{
                  padding: '16px',
                  borderRadius: 12,
                  background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: isSelected ? '2px solid #6366F1' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 32 }}>{lang.flag}</span>
                  {isSelected && <CheckCircle2 size={20} color="#6366F1" />}
                </div>
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {lang.name}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{lang.nativeName}</div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.4 }}>
                  {lang.description}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 24 }}>
          <Text style={{ color: 'var(--text-secondary)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
            2. Select Proficiency Level
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
                    borderRadius: 10,
                    background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: isSelected ? '1.5px solid #6366F1' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Award size={18} color={isSelected ? '#6366F1' : '#9CA3AF'} />
                    <span style={{ fontWeight: 600, color: isSelected ? '#A5B4FC' : 'var(--text-primary)' }}>
                      {lvl.name}
                    </span>
                  </div>
                  <Space>
                    <Tag color="geekblue">{lvl.cefr}</Tag>
                    {targetLanguage === 'KO' && <Tag color="purple">{lvl.topik}</Tag>}
                    {isSelected && <CheckCircle2 size={18} color="#6366F1" />}
                  </Space>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: 24, textAlign: 'right' }}>
          <button className="btn-primary" onClick={closeLangModal} style={{ width: '100%', padding: '12px' }}>
            Confirm & Start Practicing
          </button>
        </div>
      </div>
    </Modal>
  );
};
