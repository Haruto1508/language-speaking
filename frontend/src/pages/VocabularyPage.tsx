import React, { useEffect, useState } from 'react';
import { Tag, Input, Typography, Spin, Pagination } from 'antd';
import {
  Search,
  Volume2,
  CheckCircle,
  Turtle,
  Check,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { useAppStore } from '../stores/useAppStore';
import { Vocabulary, formatStatusVietnamese, formatPartOfSpeechVietnamese } from '../types';
import { speakText, speakSlow } from '../utils/speech';
import { localDataService } from '../services/localDataService';
import { LanguageSwitchTabs } from '../components/LanguageSwitchTabs';

const { Title, Text } = Typography;

export const VocabularyPage: React.FC = () => {
  const { targetLanguage } = useAppStore();
  const [vocabList, setVocabList] = useState<Vocabulary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination & "Known" status tracking
  const [currentPage, setCurrentPage] = useState(1);
  const [filterMode, setFilterMode] = useState<'ALL' | 'NEW' | 'KNOWN'>('ALL');
  const [knownMap, setKnownMap] = useState<Record<string | number, boolean>>({});

  const PAGE_SIZE = 20;

  useEffect(() => {
    fetchVocab();
  }, [targetLanguage]);

  // Load known words from localStorage when language changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`duo_known_vocab_${targetLanguage}`);
      if (saved) {
        setKnownMap(JSON.parse(saved));
      } else {
        setKnownMap({});
      }
    } catch {
      setKnownMap({});
    }
    setCurrentPage(1);
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

  const toggleKnown = (id: number | string) => {
    setKnownMap((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(`duo_known_vocab_${targetLanguage}`, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to save known vocab to localStorage', e);
      }
      return next;
    });
  };

  // 1. Filter by search term
  const filteredBySearch = vocabList.filter(
    (v) =>
      v.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.romanization && v.romanization.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // 2. Filter by status tab (ALL / NEW / KNOWN)
  const filteredByStatus = filteredBySearch.filter((v) => {
    const isKnown = !!knownMap[v.id];
    if (filterMode === 'NEW') return !isKnown;
    if (filterMode === 'KNOWN') return isKnown;
    return true;
  });

  // 3. Sort: Order new words first, known words to the bottom!
  const sortedList = [...filteredByStatus].sort((a, b) => {
    const aKnown = !!knownMap[a.id];
    const bKnown = !!knownMap[b.id];
    if (aKnown === bKnown) return 0;
    return aKnown ? 1 : -1; // Unchecked / New words appear first!
  });

  // 4. Paginate: 20 words per page
  const totalItems = sortedList.length;
  const paginatedList = sortedList.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Statistics
  const totalCount = vocabList.length;
  const knownCount = vocabList.filter((v) => !!knownMap[v.id]).length;
  const newCount = totalCount - knownCount;

  const isKo = targetLanguage === 'KO';

  return (
    <div style={{ maxWidth: 1050, margin: '0 auto', paddingBottom: 60 }}>
      {/* Title & Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
        <div>
          <Title level={2} style={{ color: 'var(--duo-text-primary)', margin: 0, fontWeight: 900 }}>
            {isKo ? 'Sổ từ vựng tiếng Hàn 🇰🇷' : 'Sổ từ vựng tiếng Anh 🇺🇸'}
          </Title>
          <Text style={{ color: 'var(--duo-text-secondary)', fontSize: 14 }}>
            Khám phá từ vựng giao tiếp thực chiến, phân tích hình thái (morpheme), biến âm và cụm từ thông dụng.
          </Text>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <LanguageSwitchTabs />
          <div style={{ width: 280 }}>
            <Input
              prefix={<Search size={16} color="var(--duo-text-muted)" />}
              placeholder="Tìm kiếm từ, phiên âm, ý nghĩa..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              allowClear
              style={{
                background: 'var(--duo-card-bg)',
                borderColor: 'var(--duo-border)',
                color: 'var(--duo-text-primary)',
                borderRadius: 12,
                padding: '9px 14px',
              }}
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Reordering Helper */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 20,
          padding: '14px 18px',
          background: 'var(--duo-card-bg)',
          borderRadius: 14,
          border: '1.5px solid var(--duo-border)',
        }}
      >
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              setFilterMode('ALL');
              setCurrentPage(1);
            }}
            style={{
              padding: '8px 14px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer',
              border: filterMode === 'ALL' ? '2px solid #1CB0F6' : '1.5px solid var(--duo-border)',
              background: filterMode === 'ALL' ? 'rgba(28, 176, 246, 0.12)' : 'transparent',
              color: filterMode === 'ALL' ? '#1CB0F6' : 'var(--duo-text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            Tất cả ({totalCount})
          </button>

          <button
            onClick={() => {
              setFilterMode('NEW');
              setCurrentPage(1);
            }}
            style={{
              padding: '8px 14px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer',
              border: filterMode === 'NEW' ? '2px solid #FF9600' : '1.5px solid var(--duo-border)',
              background: filterMode === 'NEW' ? 'rgba(255, 150, 0, 0.12)' : 'transparent',
              color: filterMode === 'NEW' ? '#FF9600' : 'var(--duo-text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            🌱 Từ mới cần học ({newCount})
          </button>

          <button
            onClick={() => {
              setFilterMode('KNOWN');
              setCurrentPage(1);
            }}
            style={{
              padding: '8px 14px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer',
              border: filterMode === 'KNOWN' ? '2px solid #58CC02' : '1.5px solid var(--duo-border)',
              background: filterMode === 'KNOWN' ? 'rgba(88, 204, 2, 0.12)' : 'transparent',
              color: filterMode === 'KNOWN' ? '#58CC02' : 'var(--duo-text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            ✓ Đã biết ({knownCount})
          </button>
        </div>

        <div style={{ fontSize: 13, color: 'var(--duo-text-secondary)', fontWeight: 600 }}>
          💡 <strong style={{ color: '#58CC02' }}>Quy tắc:</strong> Các từ mới luôn được tự động xếp lên đầu (20 từ/trang)
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
        </div>
      ) : paginatedList.length === 0 ? (
        <div className="duo-card" style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ fontSize: 16, color: 'var(--duo-text-secondary)', margin: 0 }}>
            Không tìm thấy từ vựng nào phù hợp với bộ lọc hiện tại.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {paginatedList.map((vocab) => {
            const isKnown = !!knownMap[vocab.id];

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
                style={{
                  padding: 22,
                  borderColor: isKnown ? 'rgba(88, 204, 2, 0.35)' : 'var(--duo-border)',
                  background: isKnown ? 'rgba(88, 204, 2, 0.03)' : 'var(--duo-card-bg)',
                }}
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
                      {isKnown ? (
                        <Tag color="green" style={{ borderRadius: 6, fontWeight: 800, fontSize: 13, padding: '2px 8px' }}>
                          ✓ ĐÃ BIẾT
                        </Tag>
                      ) : (
                        <Tag color="gold" style={{ borderRadius: 6, fontWeight: 800, fontSize: 13, padding: '2px 8px' }}>
                          🌱 TỪ MỚI
                        </Tag>
                      )}
                    </div>

                    <div style={{ fontSize: 18, color: 'var(--duo-text-primary)', marginTop: 8, fontWeight: 800 }}>
                      {vocab.meaning}
                    </div>
                  </div>

                  {/* Actions: Play Sound & Check Known */}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
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

                    {/* Check / Uncheck Known Button */}
                    <button
                      onClick={() => toggleKnown(vocab.id)}
                      style={{
                        padding: '8px 14px',
                        fontSize: 13,
                        fontWeight: 800,
                        borderRadius: 10,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        background: isKnown ? 'rgba(88, 204, 2, 0.16)' : 'var(--duo-card-bg)',
                        border: isKnown ? '2px solid #58CC02' : '1.5px solid var(--duo-border)',
                        borderBottom: isKnown ? '3.5px solid #46A302' : '3px solid var(--duo-border)',
                        color: isKnown ? '#58CC02' : 'var(--duo-text-secondary)',
                        transition: 'all 0.15s ease',
                      }}
                      title={isKnown ? 'Nhấn để đánh dấu là từ mới cần học lại' : 'Nhấn để đánh dấu đã biết (tự động xếp sau các từ mới)'}
                    >
                      {isKnown ? (
                        <>
                          <CheckCircle size={16} color="#58CC02" />
                          <span>Đã biết ✓</span>
                        </>
                      ) : (
                        <>
                          <div
                            style={{
                              width: 14,
                              height: 14,
                              borderRadius: '50%',
                              border: '2px solid var(--duo-text-muted)',
                            }}
                          />
                          <span>Đánh dấu đã biết</span>
                        </>
                      )}
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

      {/* Pagination - 20 items per page */}
      {!loading && totalItems > PAGE_SIZE && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32, paddingBottom: 20 }}>
          <Pagination
            current={currentPage}
            pageSize={PAGE_SIZE}
            total={totalItems}
            onChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            showSizeChanger={false}
            showTotal={(total, range) => `Hiển thị ${range[0]} - ${range[1]} trong tổng số ${total} từ vựng`}
          />
        </div>
      )}
    </div>
  );
};
