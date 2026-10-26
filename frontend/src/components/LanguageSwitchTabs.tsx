import React from 'react';
import { useAppStore } from '../stores/useAppStore';
import { LanguageCode } from '../types';
import { CheckCircle2 } from 'lucide-react';

interface LanguageSwitchTabsProps {
  style?: React.CSSProperties;
}

export const LanguageSwitchTabs: React.FC<LanguageSwitchTabsProps> = ({ style }) => {
  const { targetLanguage, setTargetLanguage } = useAppStore();

  const handleSelect = (lang: LanguageCode) => {
    if (targetLanguage !== lang) {
      setTargetLanguage(lang);
    }
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'var(--duo-card-bg)',
        border: '2px solid var(--duo-border)',
        borderRadius: 16,
        padding: 4,
        gap: 6,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        ...style,
      }}
    >
      {/* Korean Tab */}
      <button
        type="button"
        onClick={() => handleSelect('KO')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 18px',
          borderRadius: 12,
          border: 'none',
          background: targetLanguage === 'KO' ? '#58CC02' : 'transparent',
          color: targetLanguage === 'KO' ? '#FFFFFF' : 'var(--duo-text-secondary)',
          fontWeight: 800,
          fontSize: 14,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          boxShadow: targetLanguage === 'KO' ? '0 2px 8px rgba(88, 204, 2, 0.35)' : 'none',
        }}
      >
        <span style={{ fontSize: 18, lineHeight: 1 }}>🇰🇷</span>
        <span>Tiếng Hàn (한국어)</span>
        {targetLanguage === 'KO' && <CheckCircle2 size={16} color="#FFFFFF" />}
      </button>

      {/* English Tab */}
      <button
        type="button"
        onClick={() => handleSelect('EN')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 18px',
          borderRadius: 12,
          border: 'none',
          background: targetLanguage === 'EN' ? '#1CB0F6' : 'transparent',
          color: targetLanguage === 'EN' ? '#FFFFFF' : 'var(--duo-text-secondary)',
          fontWeight: 800,
          fontSize: 14,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          boxShadow: targetLanguage === 'EN' ? '0 2px 8px rgba(28, 176, 246, 0.35)' : 'none',
        }}
      >
        <span style={{ fontSize: 18, lineHeight: 1 }}>🇺🇸</span>
        <span>Tiếng Anh (English)</span>
        {targetLanguage === 'EN' && <CheckCircle2 size={16} color="#FFFFFF" />}
      </button>
    </div>
  );
};
