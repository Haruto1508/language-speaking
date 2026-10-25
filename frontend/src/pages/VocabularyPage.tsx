import React, { useEffect, useState } from 'react';
import { Tag, Button, Input, Space, Typography, Spin, Card, Row, Col } from 'antd';
import {
  Search,
  Volume2,
  Layers,
  Sparkles,
  Bookmark,
  CheckCircle,
  Turtle,
} from 'lucide-react';
import { api } from '../services/api';
import { useAppStore } from '../stores/useAppStore';
import { Vocabulary, formatStatusVietnamese, formatPartOfSpeechVietnamese } from '../types';
import { speakText, speakSlow } from '../utils/speech';

import { localDataService } from '../services/localDataService';

const { Title, Text } = Typography;

export const VocabularyPage: React.FC = () => {
  const { targetLanguage } = useAppStore();
  const [vocabList, setVocabList] = useState<Vocabulary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchVocab();
  }, [targetLanguage]);

  const fetchVocab = async () => {
    try {
      setLoading(true);
      const data = await api.vocabulary.getAll(targetLanguage);
      if (data && data.length > 0) {
        setVocabList(data);
      } else {
        setVocabList(localDataService.getVocabulary(targetLanguage));
      }
    } catch {
      setVocabList(localDataService.getVocabulary(targetLanguage));
    } finally {
      setLoading(false);
    }
  };

  const filtered = vocabList.filter(
    (v) =>
      v.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.romanization && v.romanization.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const isKo = targetLanguage === 'KO';

  return (
    <div style={{ maxWidth: 1050, margin: '0 auto', paddingBottom: 60 }}>
      {/* Title & Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ color: 'var(--duo-text-primary)', margin: 0, fontWeight: 900 }}>
            {isKo ? 'Sổ từ vựng tiếng Hàn 🇰🇷' : 'Sổ từ vựng tiếng Anh 🇺🇸'}
          </Title>
          <Text style={{ color: 'var(--duo-text-secondary)', fontSize: 14 }}>
            Khám phá từ vựng giao tiếp thực chiến, phân tích hình thái (morpheme), biến âm và cụm từ thông dụng.
          </Text>
        </div>

        <div style={{ width: 320 }}>
          <Input
            prefix={<Search size={16} color="var(--duo-text-muted)" />}
            placeholder="Tìm kiếm từ, phiên âm, ý nghĩa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: 'var(--duo-card-bg)',
              borderColor: 'var(--duo-border)',
              color: 'var(--duo-text-primary)',
              borderRadius: 12,
              padding: '10px 14px',
            }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map((vocab) => {
            let breakdownData: any = null;
            if (vocab.breakdownJson) {
              try {
                breakdownData = JSON.parse(vocab.breakdownJson);
              } catch (e) {}
            }

            return (
              <div
                key={vocab.id}
                className="duo-card duo-card-interactive"
                style={{ padding: 22 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <span
                        className={isKo ? 'lang-ko' : ''}
                        style={{ fontSize: 28, fontWeight: 900, color: 'var(--duo-text-primary)' }}
                      >
                        {vocab.word}
                      </span>
                      {vocab.romanization && (
                        <span style={{ fontSize: 16, color: '#1CB0F6', fontStyle: 'italic', fontWeight: 600 }}>
                          [{vocab.romanization}]
                        </span>
                      )}
                      {vocab.pronunciationIpa && (
                        <span style={{ fontSize: 15, color: '#58CC02', fontWeight: 700 }}>
                          {vocab.pronunciationIpa}
                        </span>
                      )}
                      <Tag color="blue" style={{ borderRadius: 6, fontWeight: 800, fontSize: 13, padding: '2px 8px' }}>
                        {formatPartOfSpeechVietnamese(vocab.partOfSpeech)}
                      </Tag>
                      {vocab.userStatus && (
                        <Tag color={vocab.userStatus === 'MASTERED' ? 'green' : 'geekblue'} style={{ borderRadius: 6, fontWeight: 800, fontSize: 13, padding: '2px 8px' }}>
                          {formatStatusVietnamese(vocab.userStatus)}
                        </Tag>
                      )}
                    </div>

                    <div style={{ fontSize: 18, color: 'var(--duo-text-primary)', marginTop: 8, fontWeight: 800 }}>
                      {vocab.meaning}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button
                      className="duo-btn-outline"
                      onClick={() => speakText(vocab.word, isKo ? 'KO' : 'EN', 0.95)}
                      style={{ padding: '8px 14px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      title="Nghe phát âm bình thường (1.0x)"
                    >
                      <Volume2 size={16} color="#1CB0F6" />
                      <span>Nghe</span>
                    </button>

                    <button
                      className="duo-btn-outline"
                      onClick={() => speakSlow(vocab.word, isKo ? 'KO' : 'EN')}
                      style={{ padding: '8px 12px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6, color: '#58CC02', borderColor: 'rgba(88, 204, 2, 0.4)' }}
                      title="Nghe phát âm chậm (chú rùa 🐢 0.6x)"
                    >
                      <Turtle size={16} color="#58CC02" />
                      <span>Chậm</span>
                    </button>
                  </div>
                </div>

                {/* Korean Morpheme Breakdown */}
                {breakdownData && (
                  <div
                    style={{
                      marginTop: 14,
                      padding: '12px 18px',
                      borderRadius: 12,
                      background: 'rgba(124, 58, 237, 0.08)',
                      border: '1.5px solid rgba(124, 58, 237, 0.28)',
                      boxShadow: '0 2px 8px rgba(124, 58, 237, 0.04)',
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#8B5CF6', textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>🧩</span>
                      <span>Cấu tạo & Hình thái từ:</span>
                    </div>
                    {breakdownData.morphemes ? (
                      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 15, lineHeight: 1.6 }}>
                        {breakdownData.morphemes.map((m: any, i: number) => (
                          <span key={i} style={{ color: 'var(--duo-text-primary)' }}>
                            <strong style={{ color: '#D97706', fontSize: 16, fontWeight: 800 }}>{m.part}</strong>{' '}
                            <span style={{ color: 'var(--duo-text-secondary)', fontWeight: 600 }}>({m.meaning})</span>
                            {i < breakdownData.morphemes.length - 1 && (
                              <span style={{ margin: '0 6px', color: '#8B5CF6', fontWeight: 800 }}>+</span>
                            )}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: 14, color: 'var(--duo-text-secondary)' }}>
                        {JSON.stringify(breakdownData)}
                      </div>
                    )}
                  </div>
                )}

                {/* Batchim / Sound Changes */}
                {(vocab.batchimRules || vocab.soundChanges) && (
                  <div style={{ marginTop: 12, fontSize: 14, color: 'var(--duo-text-secondary)', display: 'flex', flexDirection: 'column', gap: 4, lineHeight: 1.6 }}>
                    {vocab.batchimRules && (
                      <div>
                        📝 <strong style={{ color: 'var(--duo-text-primary)' }}>Quy tắc Patchim:</strong> {vocab.batchimRules}
                      </div>
                    )}
                    {vocab.soundChanges && (
                      <div>
                        🔊 <strong style={{ color: 'var(--duo-text-primary)' }}>Quy tắc Biến âm:</strong> {vocab.soundChanges}
                      </div>
                    )}
                  </div>
                )}

                {/* Example sentence */}
                {vocab.exampleSentence && (
                  <div
                    style={{
                      marginTop: 14,
                      padding: '14px 18px',
                      borderRadius: 12,
                      background: 'rgba(28, 176, 246, 0.08)',
                      borderLeft: '4px solid #1CB0F6',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className={isKo ? 'lang-ko' : ''} style={{ fontSize: 17, fontWeight: 800, color: 'var(--duo-text-primary)', lineHeight: 1.5 }}>
                        "{vocab.exampleSentence}"
                      </span>
                      <button
                        onClick={() => speakText(vocab.exampleSentence!, isKo ? 'KO' : 'EN')}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#1CB0F6', padding: 4 }}
                        title="Nghe ví dụ"
                      >
                        <Volume2 size={18} />
                      </button>
                    </div>
                    {vocab.translation && (
                      <div style={{ fontSize: 15, color: 'var(--duo-text-secondary)', marginTop: 6, fontWeight: 600 }}>
                        {vocab.translation}
                      </div>
                    )}
                  </div>
                )}

                {/* Collocations */}
                {vocab.collocations && (
                  <div style={{ marginTop: 12, fontSize: 14, color: 'var(--duo-text-secondary)' }}>
                    <strong style={{ color: 'var(--duo-text-primary)' }}>Cụm từ thông dụng:</strong>{' '}
                    <span style={{ color: '#1CB0F6', fontWeight: 600 }}>{vocab.collocations}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
