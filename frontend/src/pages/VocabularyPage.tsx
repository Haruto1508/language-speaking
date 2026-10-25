import React, { useEffect, useState } from 'react';
import { Tag, Button, Input, Space, Typography, Spin, Card, Row, Col } from 'antd';
import {
  Search,
  Volume2,
  Layers,
  Sparkles,
  Bookmark,
  CheckCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { useAppStore } from '../stores/useAppStore';
import { Vocabulary, formatStatusVietnamese, formatPartOfSpeechVietnamese } from '../types';
import { speakText } from '../utils/speech';

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
                        style={{ fontSize: 24, fontWeight: 900, color: 'var(--duo-text-primary)' }}
                      >
                        {vocab.word}
                      </span>
                      {vocab.romanization && (
                        <span style={{ fontSize: 14, color: '#1CB0F6', fontStyle: 'italic' }}>
                          [{vocab.romanization}]
                        </span>
                      )}
                      {vocab.pronunciationIpa && (
                        <span style={{ fontSize: 13, color: '#58CC02', fontWeight: 600 }}>
                          {vocab.pronunciationIpa}
                        </span>
                      )}
                      <Tag color="blue" style={{ borderRadius: 6, fontWeight: 800 }}>
                        {formatPartOfSpeechVietnamese(vocab.partOfSpeech)}
                      </Tag>
                      {vocab.userStatus && (
                        <Tag color={vocab.userStatus === 'MASTERED' ? 'green' : 'geekblue'} style={{ borderRadius: 6, fontWeight: 800 }}>
                          {formatStatusVietnamese(vocab.userStatus)}
                        </Tag>
                      )}
                    </div>

                    <div style={{ fontSize: 16, color: 'var(--duo-text-primary)', marginTop: 8, fontWeight: 700 }}>
                      {vocab.meaning}
                    </div>
                  </div>

                  <button
                    className="duo-btn-outline"
                    onClick={() => speakText(vocab.word, isKo ? 'KO' : 'EN')}
                    style={{ padding: '8px 16px', fontSize: 13 }}
                  >
                    <Volume2 size={16} color="#1CB0F6" />
                    <span>Phát âm</span>
                  </button>
                </div>

                {/* Korean Morpheme Breakdown */}
                {breakdownData && (
                  <div
                    style={{
                      marginTop: 14,
                      padding: '10px 14px',
                      borderRadius: 8,
                      background: 'rgba(0, 0, 0, 0.25)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#A5B4FC', textTransform: 'uppercase', marginBottom: 4 }}>
                      🧩 Cấu tạo & Hình thái từ:
                    </div>
                    {breakdownData.morphemes ? (
                      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 13 }}>
                        {breakdownData.morphemes.map((m: any, i: number) => (
                          <span key={i} style={{ color: 'var(--text-primary)' }}>
                            <strong style={{ color: '#F59E0B' }}>{m.part}</strong> ({m.meaning})
                            {i < breakdownData.morphemes.length - 1 && ' + '}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        {JSON.stringify(breakdownData)}
                      </div>
                    )}
                  </div>
                )}

                {/* Batchim / Sound Changes */}
                {(vocab.batchimRules || vocab.soundChanges) && (
                  <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                    {vocab.batchimRules && <div>📝 <strong>Quy tắc Patchim:</strong> {vocab.batchimRules}</div>}
                    {vocab.soundChanges && <div>🔊 <strong>Quy tắc Biến âm:</strong> {vocab.soundChanges}</div>}
                  </div>
                )}

                {/* Example sentence */}
                {vocab.exampleSentence && (
                  <div
                    style={{
                      marginTop: 14,
                      padding: 12,
                      borderRadius: 8,
                      background: 'rgba(99, 102, 241, 0.06)',
                      borderLeft: '3px solid #6366F1',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className={isKo ? 'lang-ko' : ''} style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                        "{vocab.exampleSentence}"
                      </span>
                      <button
                        onClick={() => speakText(vocab.exampleSentence!, isKo ? 'KO' : 'EN')}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#06B6D4' }}
                      >
                        <Volume2 size={16} />
                      </button>
                    </div>
                    {vocab.translation && (
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                        {vocab.translation}
                      </div>
                    )}
                  </div>
                )}

                {/* Collocations */}
                {vocab.collocations && (
                  <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-secondary)' }}>
                    <strong>Cụm từ thông dụng:</strong> <span style={{ color: '#A5B4FC' }}>{vocab.collocations}</span>
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
