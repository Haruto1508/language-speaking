import React, { useEffect, useState } from 'react';
import { Tag, Typography, Spin, Input, Pagination } from 'antd';
import { Sparkles, AlertCircle, Volume2, Search, Turtle, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
import { useAppStore } from '../stores/useAppStore';
import { Grammar } from '../types';
import { speakText, speakSlow } from '../utils/speech';
import { localDataService } from '../services/localDataService';
import { LanguageSwitchTabs } from '../components/LanguageSwitchTabs';

const { Title, Text } = Typography;

export const GrammarPage: React.FC = () => {
  const { targetLanguage } = useAppStore();
  const [grammarList, setGrammarList] = useState<Grammar[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination & "Known" status tracking
  const [currentPage, setCurrentPage] = useState(1);
  const [filterMode, setFilterMode] = useState<'ALL' | 'NEW' | 'KNOWN'>('ALL');
  const [knownMap, setKnownMap] = useState<Record<string | number, boolean>>({});

  const PAGE_SIZE = 20;

  useEffect(() => {
    fetchGrammar();
  }, [targetLanguage]);

  // Load known grammar from localStorage when language changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`duo_known_grammar_${targetLanguage}`);
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

  const fetchGrammar = async () => {
    try {
      setLoading(true);
      const data = await api.grammar.getAll(targetLanguage);
      if (data && data.length > 0) {
        setGrammarList(data);
      } else {
        setGrammarList(localDataService.getGrammar(targetLanguage));
      }
    } catch {
      setGrammarList(localDataService.getGrammar(targetLanguage));
    } finally {
      setLoading(false);
    }
  };

  const toggleKnown = (id: number | string) => {
    setKnownMap((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(`duo_known_grammar_${targetLanguage}`, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to save known grammar to localStorage', e);
      }
      return next;
    });
  };

  const isKo = targetLanguage === 'KO';

  // 1. Filter by search query
  const filteredBySearch = grammarList.filter((gram) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      gram.grammarPoint?.toLowerCase().includes(q) ||
      gram.pattern?.toLowerCase().includes(q) ||
      gram.explanation?.toLowerCase().includes(q) ||
      gram.exampleSentence?.toLowerCase().includes(q) ||
      gram.translation?.toLowerCase().includes(q) ||
      gram.structureFormula?.toLowerCase().includes(q) ||
      gram.formula?.toLowerCase().includes(q) ||
      gram.usageGuide?.toLowerCase().includes(q) ||
      (gram.exampleConversationsJson && gram.exampleConversationsJson.toLowerCase().includes(q))
    );
  });

  // 2. Filter by status tab (ALL / NEW / KNOWN)
  const filteredByStatus = filteredBySearch.filter((gram) => {
    const isKnown = !!knownMap[gram.id];
    if (filterMode === 'NEW') return !isKnown;
    if (filterMode === 'KNOWN') return isKnown;
    return true;
  });

  // 3. Sort: Order new structures first, known structures to the bottom!
  const sortedList = [...filteredByStatus].sort((a, b) => {
    const aKnown = !!knownMap[a.id];
    const bKnown = !!knownMap[b.id];
    if (aKnown === bKnown) return 0;
    return aKnown ? 1 : -1; // Unchecked / New items appear first!
  });

  // 4. Paginate: 20 grammar items per page
  const totalItems = sortedList.length;
  const paginatedList = sortedList.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Statistics
  const totalCount = grammarList.length;
  const knownCount = grammarList.filter((g) => !!knownMap[g.id]).length;
  const newCount = totalCount - knownCount;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 60 }}>
      {/* Title & Search Bar */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={2} style={{ color: 'var(--duo-text-primary)', margin: 0, fontWeight: 900 }}>
            {isKo ? 'Mẫu câu & Ngữ pháp tiếng Hàn 🇰🇷' : 'Mẫu câu & Ngữ pháp tiếng Anh 🇺🇸'}
          </Title>
          <Text style={{ color: 'var(--duo-text-secondary)', fontSize: 14 }}>
            {isKo
              ? 'Nắm vững các công thức câu giao tiếp, cấp độ kính ngữ (존댓말 vs 반말) và các lỗi sai thường gặp.'
              : 'Nắm vững 50+ mẫu câu giao tiếp nhà hàng, công thức đàm thoại chuẩn mực và phản xạ tự nhiên.'}
          </Text>
        </div>

        {/* Search Bar & Language Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <LanguageSwitchTabs />
          <div style={{ width: 280, maxWidth: '100%' }}>
            <Input
              prefix={<Search size={16} color="var(--duo-text-muted)" />}
              placeholder="Tìm kiếm mẫu câu, từ khóa..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              allowClear
              style={{
                height: 44,
                borderRadius: 14,
                fontSize: 14,
                background: 'var(--duo-card-bg)',
                borderColor: 'var(--duo-border)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
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
              border: filterMode === 'ALL' ? '2px solid #00D2D3' : '1.5px solid var(--duo-border)',
              background: filterMode === 'ALL' ? 'rgba(0, 210, 211, 0.12)' : 'transparent',
              color: filterMode === 'ALL' ? '#00D2D3' : 'var(--duo-text-secondary)',
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
            🌱 Mẫu câu mới cần học ({newCount})
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
          💡 <strong style={{ color: '#58CC02' }}>Quy tắc:</strong> Mẫu câu mới luôn được tự động xếp lên đầu (20 câu/trang)
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
        </div>
      ) : paginatedList.length === 0 ? (
        <div className="duo-card" style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ fontSize: 16, color: 'var(--duo-text-secondary)', margin: 0 }}>
            Không tìm thấy mẫu câu nào phù hợp với bộ lọc hiện tại.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {paginatedList.map((gram) => {
            const isKnown = !!knownMap[gram.id];

            let convExamples: any[] = [];
            if (gram.exampleConversationsJson) {
              try {
                convExamples = JSON.parse(gram.exampleConversationsJson);
              } catch (e) {}
            }

            const formulaText = gram.structureFormula || gram.formula;

            return (
              <div
                key={gram.id}
                className="duo-card duo-card-interactive"
                style={{
                  padding: 26,
                  borderColor: isKnown ? 'rgba(88, 204, 2, 0.35)' : 'var(--duo-border)',
                  background: isKnown ? 'rgba(88, 204, 2, 0.03)' : 'var(--duo-card-bg)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: 20, fontWeight: 900, color: 'var(--duo-text-primary)', margin: 0 }}>
                      {gram.grammarPoint}
                    </h3>
                    {isKnown ? (
                      <Tag color="green" style={{ borderRadius: 6, fontWeight: 800 }}>✓ ĐÃ BIẾT</Tag>
                    ) : (
                      <Tag color="gold" style={{ borderRadius: 6, fontWeight: 800 }}>🌱 MẪU CÂU MỚI</Tag>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {gram.formalityLevel && (
                      <Tag color="magenta" style={{ borderRadius: 6, fontWeight: 800, margin: 0 }}>{gram.formalityLevel}</Tag>
                    )}

                    {/* Toggle Known Button */}
                    <button
                      onClick={() => toggleKnown(gram.id)}
                      style={{
                        padding: '6px 12px',
                        fontSize: 12,
                        fontWeight: 800,
                        borderRadius: 8,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        background: isKnown ? 'rgba(88, 204, 2, 0.16)' : 'var(--duo-card-bg)',
                        border: isKnown ? '1.5px solid #58CC02' : '1.5px solid var(--duo-border)',
                        color: isKnown ? '#58CC02' : 'var(--duo-text-secondary)',
                        transition: 'all 0.15s ease',
                      }}
                      title={isKnown ? 'Nhấn để đánh dấu là mẫu câu cần học lại' : 'Nhấn để đánh dấu đã biết (tự động xếp sau các câu mới)'}
                    >
                      {isKnown ? (
                        <>
                          <CheckCircle size={14} color="#58CC02" />
                          <span>Đã biết ✓</span>
                        </>
                      ) : (
                        <>
                          <div
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              border: '1.5px solid var(--duo-text-muted)',
                            }}
                          />
                          <span>Đánh dấu đã biết</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Structure Formula */}
                {formulaText && (
                  <div
                    style={{
                      padding: '12px 18px',
                      borderRadius: 12,
                      background: 'rgba(124, 58, 237, 0.08)',
                      border: '1.5px solid rgba(124, 58, 237, 0.28)',
                      marginBottom: 16,
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#8B5CF6', textTransform: 'uppercase', marginBottom: 4 }}>
                      Công thức cấu trúc:
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--duo-text-primary)' }}>
                      {formulaText}
                    </div>
                  </div>
                )}

                <p style={{ fontSize: 15, color: 'var(--duo-text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
                  {gram.explanation}
                </p>

                {/* Example sentence if available */}
                {gram.exampleSentence && (
                  <div
                    style={{
                      padding: '14px 18px',
                      borderRadius: 12,
                      background: 'rgba(88, 204, 2, 0.08)',
                      border: '1.5px solid rgba(88, 204, 2, 0.3)',
                      marginBottom: 16,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#58CC02', textTransform: 'uppercase', marginBottom: 4 }}>
                        Ví dụ câu tiêu biểu:
                      </div>
                      <div className={isKo ? 'lang-ko' : ''} style={{ fontSize: 16, fontWeight: 800, color: 'var(--duo-text-primary)' }}>
                        "{gram.exampleSentence}"
                      </div>
                      {gram.translation && (
                        <div style={{ fontSize: 13, color: 'var(--duo-text-secondary)', marginTop: 4 }}>
                          {gram.translation}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, marginLeft: 12 }}>
                      <button
                        onClick={() => speakText(gram.exampleSentence!, isKo ? 'KO' : 'EN')}
                        title="Nghe tốc độ chuẩn (1.0x)"
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#58CC02', padding: 6, display: 'flex' }}
                      >
                        <Volume2 size={20} />
                      </button>
                      <button
                        onClick={() => speakSlow(gram.exampleSentence!, isKo ? 'KO' : 'EN')}
                        title="Nghe phát âm chậm (0.6x 🐢)"
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#1CB0F6', padding: 6, display: 'flex' }}
                      >
                        <Turtle size={20} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Usage Guide */}
                {gram.usageGuide && (
                  <div style={{ marginBottom: 16 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--duo-text-primary)', marginBottom: 6 }}>
                      Hướng dẫn sử dụng & Mẫu câu ngữ cảnh:
                    </h4>
                    <pre
                      style={{
                        fontFamily: 'inherit',
                        fontSize: 13,
                        color: 'var(--duo-text-secondary)',
                        whiteSpace: 'pre-wrap',
                        background: 'var(--duo-bg)',
                        border: '1px solid var(--duo-border)',
                        padding: 14,
                        borderRadius: 10,
                        lineHeight: 1.6,
                      }}
                    >
                      {gram.usageGuide}
                    </pre>
                  </div>
                )}

                {/* Example Conversations */}
                {convExamples.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--duo-text-primary)', marginBottom: 8 }}>
                      Hội thoại mẫu thực tế ({convExamples.length} câu đối đáp):
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 380, overflowY: 'auto', paddingRight: 4 }}>
                      {convExamples.map((c, i) => (
                        <div
                          key={i}
                          style={{
                            padding: 12,
                            borderRadius: 10,
                            background: 'var(--duo-bg)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            border: '1px solid var(--duo-border)',
                          }}
                        >
                          <div style={{ flex: 1, paddingRight: 10 }}>
                            <div className={isKo ? 'lang-ko' : ''} style={{ fontSize: 14, fontWeight: 700, color: 'var(--duo-text-primary)' }}>
                              <strong style={{ color: '#1CB0F6' }}>{c.speaker || 'Person'}:</strong> "{c.text}"
                            </div>
                            {c.translation && (
                              <div style={{ fontSize: 12, color: 'var(--duo-text-secondary)', marginTop: 4 }}>
                                {c.translation}
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                            <button
                              onClick={() => speakText(c.text, isKo ? 'KO' : 'EN')}
                              title="Nghe chuẩn (1.0x)"
                              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#1CB0F6', padding: 4, display: 'flex' }}
                            >
                              <Volume2 size={18} />
                            </button>
                            <button
                              onClick={() => speakSlow(c.text, isKo ? 'KO' : 'EN')}
                              title="Nghe chậm (0.6x 🐢)"
                              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#58CC02', padding: 4, display: 'flex' }}
                            >
                              <Turtle size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Common Mistakes / Pitfalls */}
                {(gram.commonMistakes || gram.pitfalls) && (
                  <div
                    style={{
                      padding: 14,
                      borderRadius: 10,
                      background: 'rgba(255, 75, 75, 0.08)',
                      border: '1.5px solid rgba(255, 75, 75, 0.25)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#FF4B4B', fontWeight: 800, fontSize: 13, marginBottom: 4 }}>
                      <AlertCircle size={16} />
                      <span>Lỗi sai phổ biến & Lưu ý quan trọng:</span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--duo-text-secondary)' }}>
                      {gram.commonMistakes || gram.pitfalls}
                    </div>
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
            showTotal={(total, range) => `Hiển thị ${range[0]} - ${range[1]} trong tổng số ${total} mẫu câu`}
          />
        </div>
      )}
    </div>
  );
};
