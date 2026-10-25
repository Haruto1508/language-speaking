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
              grammarPoint: 'V + -(으)세요 (Polite Imperative / Courtesy Request)',
              explanation: 'Used to politely request or instruct someone to take an action in daily social interactions.',
              usageGuide: '1. If verb stem ends in a vowel, attach -세요 (가다 -> 가세요).\n2. If verb stem ends in a consonant (batchim), attach -으세요 (앉다 -> 앉으세요).\n3. Irregular verbs: 듣다 -> 들으세요, 만들다 -> 만드세요.',
              structureFormula: 'Verb Stem + -(으)세요',
              commonMistakes: 'Do not use -(으)세요 to refer to actions you are doing yourself. It is strictly for addressing the listener.',
              formalityLevel: '존댓말 / 해요체 (Standard Polite)',
              koreanPattern: 'V + -(으)세요',
              exampleConversationsJson: '[{"speaker": "직원", "text": "편하신 자리에 앉으세요.", "translation": "Please sit in any comfortable seat."}]',
            },
            {
              id: 2,
              grammarPoint: 'N + 주세요 (Please give me N)',
              explanation: 'The universal everyday request pattern for goods, items, or food in service environments.',
              usageGuide: 'Attach directly to any noun. E.g. 물 주세요 (Water please), 메뉴판 주세요 (Menu please).',
              structureFormula: 'Noun + 주세요',
              commonMistakes: 'Confusing 주세요 (give me) with 드리다 (humble offering).',
              formalityLevel: '존댓말 / 해요체',
              koreanPattern: 'N + 주세요',
              exampleConversationsJson: '[{"speaker": "손님", "text": "물 좀 더 주세요.", "translation": "Please give me some more water."}]',
            },
          ]
        : [
            {
              id: 3,
              grammarPoint: 'Polite Modal Requests: Could I please get / I would like',
              explanation: 'In English customer service encounters, direct imperatives like "Give me a coffee" sound blunt and demanding. Native speakers use modal verbs (could, would) and polite softeners.',
              usageGuide: 'Use "Could I please get + [Item]?" or "I would like to have + [Item], please."',
              structureFormula: 'Could I (please) get + [Size] + [Item] + with [Customization], please?',
              commonMistakes: 'Avoid saying "Give me" or "I want". Always soften with "Could I" and "please".',
              formalityLevel: 'Polite Conversational Register',
              exampleConversationsJson: '[{"speaker": "Customer", "text": "Could I get a medium flat white with oat milk, please?", "translation": "Cho mình một ly flat white với sữa yến mạch nhé?"}]',
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
        <Title level={2} style={{ color: 'var(--text-primary)', margin: 0 }}>
          {isKo ? 'Korean Grammar Patterns 🇰🇷' : 'English Grammar Patterns 🇺🇸'}
        </Title>
        <Text style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Master communicative sentence formulas, formality levels (존댓말 vs 반말), and common usage pitfalls.
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
              <div key={gram.id} className="glass-panel" style={{ padding: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <h3 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>
                    {gram.grammarPoint}
                  </h3>
                  {gram.formalityLevel && (
                    <Tag color="magenta">{gram.formalityLevel}</Tag>
                  )}
                </div>

                {/* Structure Formula */}
                {gram.structureFormula && (
                  <div
                    style={{
                      padding: '14px 18px',
                      borderRadius: 10,
                      background: 'rgba(99, 102, 241, 0.12)',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      marginBottom: 16,
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#A5B4FC', textTransform: 'uppercase', marginBottom: 4 }}>
                      Structure Formula:
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {gram.structureFormula}
                    </div>
                  </div>
                )}

                <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
                  {gram.explanation}
                </p>

                {/* Usage Guide */}
                {gram.usageGuide && (
                  <div style={{ marginBottom: 16 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                      Usage Guide:
                    </h4>
                    <pre
                      style={{
                        fontFamily: 'inherit',
                        fontSize: 13,
                        color: 'var(--text-secondary)',
                        whiteSpace: 'pre-wrap',
                        background: 'rgba(0, 0, 0, 0.25)',
                        padding: 12,
                        borderRadius: 8,
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
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                      Real-world Example Dialogue:
                    </h4>
                    {convExamples.map((c, i) => (
                      <div
                        key={i}
                        style={{
                          padding: 12,
                          borderRadius: 8,
                          background: 'rgba(255, 255, 255, 0.03)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        <div>
                          <div className={isKo ? 'lang-ko' : ''} style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                            <strong>{c.speaker || 'A'}:</strong> "{c.text}"
                          </div>
                          {c.translation && (
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                              {c.translation}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => speakText(c.text, isKo ? 'KO' : 'EN')}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#06B6D4' }}
                        >
                          <Volume2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Common Mistakes */}
                {gram.commonMistakes && (
                  <div
                    style={{
                      padding: 14,
                      borderRadius: 8,
                      background: 'rgba(244, 63, 94, 0.08)',
                      border: '1px solid rgba(244, 63, 94, 0.25)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#F43F5E', fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                      <AlertCircle size={16} />
                      <span>Watch Out: Common Mistakes:</span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
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
