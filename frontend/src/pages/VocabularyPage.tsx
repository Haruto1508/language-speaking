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
import { Vocabulary } from '../types';
import { speakText } from '../utils/speech';

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
      setVocabList(data);
    } catch (e) {
      console.warn('Failed to load vocab from backend, loading comprehensive mock items', e);
      const isKo = targetLanguage === 'KO';
      const fallbackVocab: Vocabulary[] = isKo
        ? [
            {
              id: 1,
              word: '안녕하세요',
              meaning: 'Hello / Good day / Good afternoon',
              partOfSpeech: 'Expression',
              pronunciationIpa: '[aɲ.ɲʌŋ.ɦa.se.jo]',
              exampleSentence: '안녕하세요! 두 명 자리 있나요?',
              translation: 'Hello! Do you have a table for two?',
              difficulty: 'Beginner',
              collocations: '안녕하세요, 반갑습니다',
              hangul: '안녕하세요',
              romanization: 'annyeonghaseyo',
              batchimRules: 'ㅇ batchim in 안 / 녕 has soft nasal resonance [ŋ]',
              soundChanges: 'ㅎ in 하 is smoothly connected in rapid speech',
              breakdownJson: '{"morphemes": [{"part": "안녕", "meaning": "wellness/peace"}, {"part": "하(다)", "meaning": "to do"}, {"part": "-세요", "meaning": "honorific polite ending"}]}',
              userStatus: 'LEARNING',
            },
            {
              id: 2,
              word: '김치찌개',
              meaning: 'Kimchi Stew (classic spicy Korean stew made with aged kimchi and pork/tofu)',
              partOfSpeech: 'Noun',
              pronunciationIpa: '[kim.tɕʰi.tɕ͈i.ɡɛ]',
              exampleSentence: '저희 김치찌개 2인분 주세요.',
              translation: 'Please give us two servings of kimchi stew.',
              difficulty: 'Beginner',
              collocations: '김치찌개 1인분, 김치찌개 맛집',
              hangul: '김치찌개',
              romanization: 'gimchijjigae',
              batchimRules: 'ㅁ batchim in 김 followed by tense ㅊ',
              soundChanges: 'Tense double consonant 찌 pronounced with crisp glottal tension',
              breakdownJson: '{"morphemes": [{"part": "김치", "meaning": "fermented kimchi"}, {"part": "찌개", "meaning": "stew"}]}',
              userStatus: 'NEW',
            },
            {
              id: 3,
              word: '주세요',
              meaning: 'Please give me / Please bring me',
              partOfSpeech: 'Verb phrase',
              pronunciationIpa: '[tɕu.se.jo]',
              exampleSentence: '물 좀 더 주세요.',
              translation: 'Please give me some more water.',
              difficulty: 'Beginner',
              collocations: '메뉴판 주세요, 영수증 주세요',
              hangul: '주세요',
              romanization: 'juseyo',
              batchimRules: 'Open vowels, melodic polite intonation',
              soundChanges: 'Standard polite pronunciation',
              breakdownJson: '{"morphemes": [{"part": "주(다)", "meaning": "give"}, {"part": "-(으)시-", "meaning": "honorific"}, {"part": "-어요", "meaning": "polite ending"}]}',
              userStatus: 'LEARNING',
            },
            {
              id: 4,
              word: '저기요',
              meaning: 'Excuse me! / Over here! (Calling restaurant staff)',
              partOfSpeech: 'Interjection',
              pronunciationIpa: '[tɕʌ.ɡi.jo]',
              exampleSentence: '저기요, 주문할게요!',
              translation: 'Excuse me, we are ready to order!',
              difficulty: 'Beginner',
              collocations: '저기요, 주문받아 주세요',
              hangul: '저기요',
              romanization: 'jeogiyo',
              batchimRules: 'No final consonant batchim',
              soundChanges: 'Standard clear projection',
              breakdownJson: '{"morphemes": [{"part": "저기", "meaning": "over there"}, {"part": "-요", "meaning": "polite marker"}]}',
              userStatus: 'REVIEW',
            },
            {
              id: 5,
              word: '계산하다',
              meaning: 'To pay / settle the bill / calculate',
              partOfSpeech: 'Verb',
              pronunciationIpa: '[kʲeː.san.ɦa.da]',
              exampleSentence: '계산은 카드로 할게요.',
              translation: 'I will pay by card.',
              difficulty: 'Beginner',
              collocations: '계산서, 계산해 주세요',
              hangul: '계산하다',
              romanization: 'gyesanhada',
              batchimRules: 'ㄴ batchim in 산 pronounced as dental nasal [n]',
              soundChanges: 'Connected speech shifts to [계사나다]',
              breakdownJson: '{"morphemes": [{"part": "계산 (計算)", "meaning": "reckoning"}, {"part": "-하다", "meaning": "to do"}]}',
              userStatus: 'MASTERED',
            },
          ]
        : [
            {
              id: 6,
              word: 'single-origin',
              meaning: 'Coffee beans sourced exclusively from one single producer, crop, or geographic region',
              partOfSpeech: 'Adjective',
              pronunciationIpa: '/ˌsɪŋ.ɡəl ˈɔːr.ɪ.dʒɪn/',
              exampleSentence: 'What single-origin beans do you have on pour-over today?',
              translation: 'Hôm nay quán có loại hạt cà phê đơn nguồn gốc nào cho pha pour-over vậy?',
              difficulty: 'Intermediate',
              collocations: 'single-origin espresso, single-origin roast',
              userStatus: 'LEARNING',
            },
            {
              id: 7,
              word: 'oat milk',
              meaning: 'A creamy plant-based milk alternative crafted from whole oats',
              partOfSpeech: 'Noun phrase',
              pronunciationIpa: '/ˈoʊt ˌmɪlk/',
              exampleSentence: 'Could I get an iced latte with oat milk instead of whole milk?',
              translation: 'Tôi có thể lấy một ly latte đá với sữa yến mạch thay vì sữa tươi không?',
              difficulty: 'Beginner',
              collocations: 'substitute oat milk, oat milk flat white',
              userStatus: 'REVIEW',
            },
            {
              id: 8,
              word: 'for here or to go',
              meaning: 'Standard cashier question checking if you will drink on premise or take away',
              partOfSpeech: 'Idiomatic phrase',
              pronunciationIpa: '/fɔːr hɪr ɔːr tuː ɡoʊ/',
              exampleSentence: 'Will that be for here or to go today?',
              translation: 'Bạn dùng ở đây hay mang đi ạ?',
              difficulty: 'Beginner',
              collocations: 'make that to go, drink for here',
              userStatus: 'MASTERED',
            },
          ];
      setVocabList(fallbackVocab);
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
                      <Tag color="blue" style={{ borderRadius: 6, fontWeight: 800 }}>{vocab.partOfSpeech}</Tag>
                      {vocab.userStatus && (
                        <Tag color={vocab.userStatus === 'MASTERED' ? 'green' : 'geekblue'} style={{ borderRadius: 6, fontWeight: 800 }}>
                          {vocab.userStatus}
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
                      🧩 Word Construction:
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
                    {vocab.batchimRules && <div>📝 <strong>Batchim Rule:</strong> {vocab.batchimRules}</div>}
                    {vocab.soundChanges && <div>🔊 <strong>Sound Change:</strong> {vocab.soundChanges}</div>}
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
                    <strong>Common Collocations:</strong> <span style={{ color: '#A5B4FC' }}>{vocab.collocations}</span>
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
