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
              meaning: 'Xin chào / Lời chào lịch sự thông dụng nhất',
              partOfSpeech: 'Thán từ / Lời chào',
              pronunciationIpa: '[aɲ.ɲʌŋ.ɦa.se.jo]',
              exampleSentence: '안녕하세요! 두 명 자리 있나요?',
              translation: 'Xin chào! Quán có bàn cho hai người không ạ?',
              difficulty: 'Mới bắt đầu',
              collocations: '안녕하세요, 반갑습니다',
              hangul: '안녕하세요',
              romanization: 'annyeonghaseyo',
              batchimRules: 'Patchim ㅇ trong 안 / 녕 có âm mũi mềm [ŋ]',
              soundChanges: 'Âm ㅎ trong 하 được nối mượt khi nói tự nhiên',
              breakdownJson: '{"morphemes": [{"part": "안녕", "meaning": "bình an/an yên"}, {"part": "하(다)", "meaning": "làm/chúc"}, {"part": "-세요", "meaning": "đuôi câu kính ngữ lịch sự"}]}',
              userStatus: 'LEARNING',
            },
            {
              id: 2,
              word: '김치찌개',
              meaning: 'Canh kim chi (Món canh hầm cay kinh điển của Hàn Quốc với thịt heo/đậu phụ)',
              partOfSpeech: 'Danh từ',
              pronunciationIpa: '[kim.tɕʰi.tɕ͈i.ɡɛ]',
              exampleSentence: '저희 김치찌개 2인분 주세요.',
              translation: 'Cho chúng tôi 2 suất canh kim chi nhé.',
              difficulty: 'Mới bắt đầu',
              collocations: '김치찌개 1인분, 김치찌개 맛집',
              hangul: '김치찌개',
              romanization: 'gimchijjigae',
              batchimRules: 'Patchim ㅁ trong 김 kết hợp âm căng ㅊ',
              soundChanges: 'Phụ âm đôi 찌 phát âm với độ căng thanh môn rõ nét',
              breakdownJson: '{"morphemes": [{"part": "김치", "meaning": "kim chi muối"}, {"part": "찌개", "meaning": "món canh hầm"}]}',
              userStatus: 'NEW',
            },
            {
              id: 3,
              word: '주세요',
              meaning: 'Làm ơn cho tôi / Xin hãy mang cho tôi',
              partOfSpeech: 'Cụm động từ cầu khiến',
              pronunciationIpa: '[tɕu.se.jo]',
              exampleSentence: '물 좀 더 주세요.',
              translation: 'Làm ơn cho tôi xin thêm chút nước với ạ.',
              difficulty: 'Mới bắt đầu',
              collocations: '메뉴판 주세요, 영수증 주세요',
              hangul: '주세요',
              romanization: 'juseyo',
              batchimRules: 'Nguyên âm mở, ngữ điệu lịch sự nhẹ nhàng',
              soundChanges: 'Phát âm chuẩn kính ngữ 해요체',
              breakdownJson: '{"morphemes": [{"part": "주(다)", "meaning": "cho/đưa"}, {"part": "-(으)시-", "meaning": "tiền tố kính ngữ"}, {"part": "-어요", "meaning": "đuôi câu lịch sự"}]}',
              userStatus: 'LEARNING',
            },
            {
              id: 4,
              word: '저기요',
              meaning: 'Em ơi! / Anh ơi! (Cách gọi nhân viên nhà hàng lịch sự)',
              partOfSpeech: 'Thán từ xưng hô',
              pronunciationIpa: '[tɕʌ.ɡi.jo]',
              exampleSentence: '저기요, 주문할게요!',
              translation: 'Em ơi, cho anh/chị gọi món với!',
              difficulty: 'Mới bắt đầu',
              collocations: '저기요, 주문받아 주세요',
              hangul: '저기요',
              romanization: 'jeogiyo',
              batchimRules: 'Không có patchim kết thúc',
              soundChanges: 'Nói rõ ràng và cao giọng nhẹ ở cuối để gọi nhân viên',
              breakdownJson: '{"morphemes": [{"part": "저기", "meaning": "đằng kia"}, {"part": "-요", "meaning": "tiểu từ lịch sự"}]}',
              userStatus: 'REVIEW',
            },
            {
              id: 5,
              word: '계산하다',
              meaning: 'Tính tiền / Thanh toán hóa đơn',
              partOfSpeech: 'Động từ',
              pronunciationIpa: '[kʲeː.san.ɦa.da]',
              exampleSentence: '계산은 카드로 할게요.',
              translation: 'Tôi xin thanh toán bằng thẻ nhé.',
              difficulty: 'Mới bắt đầu',
              collocations: '계산서, 계산해 주세요',
              hangul: '계산하다',
              romanization: 'gyesanhada',
              batchimRules: 'Patchim ㄴ trong 산 là âm mũi răng [n]',
              soundChanges: 'Trong văn nói tự nhiên nối âm thành [계사나다]',
              breakdownJson: '{"morphemes": [{"part": "계산 (計算)", "meaning": "kê toán/tính toán"}, {"part": "-하다", "meaning": "làm"}]}',
              userStatus: 'MASTERED',
            },
          ]
        : [
            {
              id: 6,
              word: 'single-origin',
              meaning: 'Cà phê đơn nguồn gốc (hạt cà phê thu hoạch từ một vùng nông trại duy nhất)',
              partOfSpeech: 'Tính từ',
              pronunciationIpa: '/ˌsɪŋ.ɡəl ˈɔːr.ɪ.dʒɪn/',
              exampleSentence: 'What single-origin beans do you have on pour-over today?',
              translation: 'Hôm nay quán có loại hạt cà phê đơn nguồn gốc nào cho pha pour-over vậy?',
              difficulty: 'Trung cấp',
              collocations: 'single-origin espresso, single-origin roast',
              userStatus: 'LEARNING',
            },
            {
              id: 7,
              word: 'oat milk',
              meaning: 'Sữa yến mạch (loại sữa thực vật thơm béo làm từ yến mạch nguyên cám)',
              partOfSpeech: 'Cụm danh từ',
              pronunciationIpa: '/ˈoʊt ˌmɪlk/',
              exampleSentence: 'Could I get an iced latte with oat milk instead of whole milk?',
              translation: 'Tôi có thể lấy một ly latte đá với sữa yến mạch thay vì sữa tươi không?',
              difficulty: 'Mới bắt đầu',
              collocations: 'substitute oat milk, oat milk flat white',
              userStatus: 'REVIEW',
            },
            {
              id: 8,
              word: 'for here or to go',
              meaning: 'Dùng tại quán hay mang về (câu hỏi giao tiếp chuẩn của thu ngân)',
              partOfSpeech: 'Cụm từ đàm thoại',
              pronunciationIpa: '/fɔːr hɪr ɔːr tuː ɡoʊ/',
              exampleSentence: 'Will that be for here or to go today?',
              translation: 'Đơn hàng này bạn dùng tại quán hay mang đi ạ?',
              difficulty: 'Mới bắt đầu',
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
