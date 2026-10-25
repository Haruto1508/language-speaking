import React, { useEffect, useState } from 'react';
import { Tag, Button, Typography, Spin, Card, Row, Col } from 'antd';
import { Sparkles, AlertCircle, Volume2, BookOpen, Layers } from 'lucide-react';
import { api } from '../services/api';
import { useAppStore } from '../stores/useAppStore';
import { Grammar } from '../types';
import { speakText } from '../utils/speech';

const { Title, Text, Paragraph } = Typography;

export const GrammarPage: React.FC = () => {
  const { targetLanguage } = useAppStore();
  const [grammarList, setGrammarList] = useState<Grammar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGrammar();
  }, [targetLanguage]);

  const fetchGrammar = async () => {
    try {
      setLoading(true);
      const data = await api.grammar.getAll(targetLanguage);
      setGrammarList(data);
    } catch (e) {
      console.warn('Failed to load grammar from API, loading mock grammar library', e);
      const isKo = targetLanguage === 'KO';
      const fallbackGrammar: Grammar[] = isKo
        ? [
            {
              id: 1,
              grammarPoint: 'V + -(으)세요 (Đuôi câu mệnh lệnh lịch sự / Yêu cầu nhã nhặn)',
              explanation: 'Dùng để yêu cầu, nhờ vả hoặc hướng dẫn người đối diện làm một hành động nào đó một cách lịch sự, nhã nhặn trong giao tiếp hàng ngày.',
              usageGuide: '1. Nếu thân động từ kết thúc bằng nguyên âm, gắn -세요 (가다 -> 가세요 - Xin mời đi).\n2. Nếu thân động từ kết thúc bằng phụ âm (patchim), gắn -으세요 (앉다 -> 앉으세요 - Xin mời ngồi).\n3. Động từ bất quy tắc: 듣다 -> 들으세요 (Xin hãy lắng nghe), 만들다 -> 만드세요 (Xin hãy làm).',
              structureFormula: 'Thân động từ + -(으)세요',
              commonMistakes: 'Không dùng -(으)세요 để nói về hành động của chính bản thân mình. Đuôi câu này chỉ dành riêng để nói với người nghe.',
              formalityLevel: 'Kính ngữ 존댓말 (Chuẩn lịch sự)',
              koreanPattern: 'V + -(으)세요',
              exampleConversationsJson: '[{"speaker": "Nhân viên", "text": "편하신 자리에 앉으세요.", "translation": "Xin mời quý khách ngồi vào bất kỳ chỗ nào thuận tiện ạ."}]',
            },
            {
              id: 2,
              grammarPoint: 'N + 주세요 (Làm ơn cho tôi N / Cho tôi xin N)',
              explanation: 'Mẫu câu đề nghị vạn năng thường dùng nhất khi gọi món ăn, mua hàng hóa hoặc yêu cầu dịch vụ.',
              usageGuide: 'Gắn trực tiếp vào sau bất kỳ danh từ nào. Ví dụ: 물 주세요 (Cho tôi xin nước ạ), 메뉴판 주세요 (Cho tôi xin thực đơn ạ).',
              structureFormula: 'Danh từ (N) + 주세요',
              commonMistakes: 'Tránh nhầm lẫn giữa 주세요 (cho tôi xin) với 드리다 (kính tặng/gửi dâng lên người bề trên).',
              formalityLevel: 'Kính ngữ 존댓말 / 해요체',
              koreanPattern: 'N + 주세요',
              exampleConversationsJson: '[{"speaker": "Khách hàng", "text": "물 좀 더 주세요.", "translation": "Làm ơn cho tôi xin thêm chút nước với ạ."}]',
            },
          ]
        : [
            {
              id: 3,
              grammarPoint: 'Yêu cầu lịch sự: Could I please get / I would like',
              explanation: 'Trong tiếng Anh giao tiếp và dịch vụ, các câu mệnh lệnh trực tiếp như "Give me coffee" nghe rất thô lỗ và cộc lốc. Người bản xứ luôn dùng các trợ động từ tình thái (could, would) và từ đệm lịch sự.',
              usageGuide: 'Dùng cấu trúc: "Could I please get + [Món]?" hoặc "I would like to have + [Món], please."',
              structureFormula: 'Could I (please) get + [Size] + [Món] + with [Tùy chọn], please?',
              commonMistakes: 'Tránh nói cộc lốc "Give me" hoặc "I want". Luôn làm mềm câu nói bằng "Could I" và "please".',
              formalityLevel: 'Văn phong đàm thoại lịch sự (Polite)',
              exampleConversationsJson: '[{"speaker": "Khách hàng", "text": "Could I get a medium flat white with oat milk, please?", "translation": "Làm ơn cho mình một ly flat white cỡ vừa với sữa yến mạch nhé?"}]',
            },
          ];
      setGrammarList(fallbackGrammar);
    } finally {
      setLoading(false);
    }
  };

  const isKo = targetLanguage === 'KO';

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 60 }}>
      <div style={{ marginBottom: 28 }}>
        <Title level={2} style={{ color: 'var(--duo-text-primary)', margin: 0, fontWeight: 900 }}>
          {isKo ? 'Mẫu câu & Ngữ pháp tiếng Hàn 🇰🇷' : 'Mẫu câu & Ngữ pháp tiếng Anh 🇺🇸'}
        </Title>
        <Text style={{ color: 'var(--duo-text-secondary)', fontSize: 14 }}>
          Nắm vững các công thức câu giao tiếp, cấp độ kính ngữ (존댓말 vs 반말) và các lỗi sai thường gặp.
        </Text>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {grammarList.map((gram) => {
            let convExamples: any[] = [];
            if (gram.exampleConversationsJson) {
              try {
                convExamples = JSON.parse(gram.exampleConversationsJson);
              } catch (e) {}
            }

            return (
              <div key={gram.id} className="duo-card duo-card-interactive" style={{ padding: 26 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <h3 style={{ fontSize: 22, fontWeight: 900, color: 'var(--duo-text-primary)' }}>
                    {gram.grammarPoint}
                  </h3>
                  {gram.formalityLevel && (
                    <Tag color="magenta" style={{ borderRadius: 6, fontWeight: 800 }}>{gram.formalityLevel}</Tag>
                  )}
                </div>

                {/* Structure Formula */}
                {gram.structureFormula && (
                  <div
                    style={{
                      padding: '14px 18px',
                      borderRadius: 12,
                      background: 'rgba(28, 176, 246, 0.1)',
                      border: '1.5px solid rgba(28, 176, 246, 0.3)',
                      marginBottom: 16,
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#1CB0F6', textTransform: 'uppercase', marginBottom: 4 }}>
                      Công thức cấu trúc:
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--duo-text-primary)' }}>
                      {gram.structureFormula}
                    </div>
                  </div>
                )}

                <p style={{ fontSize: 15, color: 'var(--duo-text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
                  {gram.explanation}
                </p>

                {/* Usage Guide */}
                {gram.usageGuide && (
                  <div style={{ marginBottom: 16 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--duo-text-primary)', marginBottom: 6 }}>
                      Hướng dẫn sử dụng:
                    </h4>
                    <pre
                      style={{
                        fontFamily: 'inherit',
                        fontSize: 13,
                        color: 'var(--duo-text-secondary)',
                        whiteSpace: 'pre-wrap',
                        background: 'var(--duo-bg)',
                        border: '1px solid var(--duo-border)',
                        padding: 12,
                        borderRadius: 10,
                        lineHeight: 1.5,
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
                      Hội thoại mẫu thực tế:
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
                          <div>
                            <div className={isKo ? 'lang-ko' : ''} style={{ fontSize: 15, fontWeight: 700, color: 'var(--duo-text-primary)' }}>
                              <strong style={{ color: '#1CB0F6' }}>{c.speaker || 'A'}:</strong> "{c.text}"
                            </div>
                            {c.translation && (
                              <div style={{ fontSize: 13, color: 'var(--duo-text-secondary)', marginTop: 4 }}>
                                {c.translation}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => speakText(c.text, isKo ? 'KO' : 'EN')}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#1CB0F6', padding: 4 }}
                          >
                            <Volume2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Common Mistakes */}
                {gram.commonMistakes && (
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
                      <span>Lỗi sai phổ biến cần lưu ý:</span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--duo-text-secondary)' }}>
                      {gram.commonMistakes}
                    </div>
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
