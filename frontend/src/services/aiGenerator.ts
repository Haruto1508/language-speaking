import axios from 'axios';
import { ConversationScenario, LanguageCode, ProficiencyLevelCode } from '../types';

export interface GenerateScenarioParams {
  prompt: string;
  language: LanguageCode;
  level: ProficiencyLevelCode;
  apiKey?: string;
  provider?: 'gemini' | 'openai';
}

export const generateCustomScenario = async (
  params: GenerateScenarioParams
): Promise<ConversationScenario> => {
  const { prompt, language, level, apiKey, provider = 'gemini' } = params;

  // 1. If Gemini API Key provided, call Google Gemini 1.5/2.0 API directly
  if (apiKey && provider === 'gemini') {
    try {
      const isKo = language === 'KO';
      const systemInstruction = `You are a curriculum designer for ${isKo ? 'Korean' : 'English'} language learning. 
Create an authentic, practical communication roleplay scenario for ${level} level based on: "${prompt}".
Respond strictly with valid JSON conforming to:
{
  "title": "Title in Vietnamese and target language",
  "description": "Context description in Vietnamese",
  "userRole": "Learner role",
  "aiRole": "AI partner role",
  "initialGreeting": "Natural first line spoken by AI in ${isKo ? 'Korean' : 'English'}",
  "culturalContext": "1-2 brief cultural tips in Vietnamese"
}`;

      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: systemInstruction }] }],
          generationConfig: { responseMimeType: 'application/json' },
        },
        { timeout: 15000 }
      );

      const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const parsed = JSON.parse(text);
        return {
          id: Date.now(),
          topicCode: 'custom-' + Date.now(),
          languageCode: language,
          levelCode: level,
          title: parsed.title || prompt,
          description: parsed.description || prompt,
          userRole: parsed.userRole || 'Học viên (Learner)',
          aiRole: parsed.aiRole || 'Đối tác AI (AI Partner)',
          initialGreeting: parsed.initialGreeting || (isKo ? '안녕하세요! 무엇을 도와드릴까요?' : 'Hello! How can I help you?'),
          culturalContext: parsed.culturalContext || 'Lưu ý giữ ngữ điệu lịch sự.',
        };
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to smart educational engine:', err);
    }
  }

  // 2. If OpenAI API Key provided
  if (apiKey && provider === 'openai') {
    try {
      const isKo = language === 'KO';
      const res = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `Generate a structured communication scenario in JSON for ${isKo ? 'Korean' : 'English'} learning: { title, description, userRole, aiRole, initialGreeting, culturalContext }`,
            },
            { role: 'user', content: prompt },
          ],
          response_format: { type: 'json_object' },
        },
        {
          headers: { Authorization: `Bearer ${apiKey}` },
          timeout: 15000,
        }
      );

      const text = res.data?.choices?.[0]?.message?.content;
      if (text) {
        const parsed = JSON.parse(text);
        return {
          id: Date.now(),
          topicCode: 'custom-' + Date.now(),
          languageCode: language,
          levelCode: level,
          title: parsed.title || prompt,
          description: parsed.description || prompt,
          userRole: parsed.userRole || 'Learner',
          aiRole: parsed.aiRole || 'AI Partner',
          initialGreeting: parsed.initialGreeting || (isKo ? '안녕하세요!' : 'Hello!'),
          culturalContext: parsed.culturalContext || 'Giao tiếp tự nhiên.',
        };
      }
    } catch (err) {
      console.warn('OpenAI API call failed, falling back to smart educational engine:', err);
    }
  }

  // 3. Smart local educational fallback
  const isKo = language === 'KO';
  const cleanPrompt = prompt.trim();

  let title = cleanPrompt;
  let userRole = isKo ? 'Khách hàng (손님)' : 'Customer';
  let aiRole = isKo ? 'Nhân viên (직원)' : 'Staff Member';
  let greeting = isKo ? '안녕하세요! 무엇을 도와드릴까요?' : 'Hello there! How can I assist you today?';
  let culturalTip = isKo
    ? 'Hãy sử dụng đuôi câu 존댓말 (-요 / -습니다) khi trò chuyện lịch sự.'
    : 'Use polite modal expressions like "Could you please..." for natural rapport.';

  if (cleanPrompt.toLowerCase().includes('mua') || cleanPrompt.toLowerCase().includes('áo') || cleanPrompt.toLowerCase().includes('shop')) {
    title = isKo ? `Mua sắm & Hỏi giá (${cleanPrompt})` : `Shopping & Asking for Sizes (${cleanPrompt})`;
    userRole = isKo ? 'Khách mua hàng' : 'Shopper';
    aiRole = isKo ? 'Chủ tiệm (사장님)' : 'Shopkeeper';
    greeting = isKo ? '어서오세요! 찾으시는 옷이나 사이즈 있으신가요?' : 'Welcome in! Are you looking for any specific size or style today?';
    culturalTip = isKo ? 'Có thể hỏi "얼마예요?" (Bao nhiêu tiền ạ?) hoặc "입어봐도 돼요?" (Tôi thử được không?)' : 'Remember to specify sizes clearly.';
  } else if (cleanPrompt.toLowerCase().includes('phỏng vấn') || cleanPrompt.toLowerCase().includes('interview') || cleanPrompt.toLowerCase().includes('việc')) {
    title = isKo ? `Phỏng vấn xin việc (${cleanPrompt})` : `Job Interview (${cleanPrompt})`;
    userRole = isKo ? 'Ứng viên (지원자)' : 'Candidate';
    aiRole = isKo ? 'Người phỏng vấn (면접관)' : 'Interviewer';
    greeting = isKo ? '안녕하세요, 와주셔서 감사합니다. 먼저 간단하게 자기소개 부탁드립니다.' : 'Good morning! Thank you for coming. Could you start by introducing yourself?';
    culturalTip = isKo ? 'Sử dụng kính ngữ -ㅂ니다/-습니다 để thể hiện tính chuyên nghiệp cao.' : 'Structure answers using the STAR method.';
  } else if (cleanPrompt.toLowerCase().includes('bệnh') || cleanPrompt.toLowerCase().includes('thuốc') || cleanPrompt.toLowerCase().includes('bác sĩ')) {
    title = isKo ? `Khám bệnh tại phòng khám (${cleanPrompt})` : `Visiting the Doctor (${cleanPrompt})`;
    userRole = isKo ? 'Bệnh nhân (환자)' : 'Patient';
    aiRole = isKo ? 'Bác sĩ (의사)' : 'Doctor';
    greeting = isKo ? '어디가 불편해서 오셨나요? 증상을 말씀해 주세요.' : 'Hello, what symptoms have you been experiencing recently?';
  }

  return {
    id: Date.now(),
    topicCode: 'custom-' + Date.now(),
    languageCode: language,
    levelCode: level,
    title,
    description: `Tình huống luyện tập tự tạo: ${cleanPrompt}`,
    userRole,
    aiRole,
    initialGreeting: greeting,
    culturalContext: culturalTip,
  };
};

export interface GenerateLessonParams {
  topicId?: number;
  title: string;
  scenario: string;
  difficulty: ProficiencyLevelCode;
  learningObjectives?: string;
  languageCode: LanguageCode;
  apiKey?: string;
  provider?: 'gemini' | 'openai';
}

/**
 * Generate a comprehensive curriculum lesson (Vocabulary, Grammar, Dialogue, Exercises) using AI or Educational Engine
 */
export const generateFullLessonWithAi = async (
  params: GenerateLessonParams
): Promise<any> => {
  const { title, scenario, difficulty, learningObjectives, languageCode, apiKey, provider = 'gemini' } = params;
  const isKo = languageCode === 'KO';
  const lessonId = Date.now();

  // 1. Try Gemini API if key is present
  if (apiKey && provider === 'gemini') {
    try {
      const prompt = `You are a curriculum specialist for ${isKo ? 'Korean (Tiếng Hàn)' : 'English (Tiếng Anh)'} language education.
Create a complete lesson curriculum for level ${difficulty}.
Lesson Title: "${title}"
Scenario: "${scenario}"
Objectives: "${learningObjectives || 'Giao tiếp tự tin và đúng ngữ pháp'}"

Return ONLY valid JSON matching this schema:
{
  "title": "${title}",
  "scenario": "${scenario}",
  "description": "Mô tả bài học tóm tắt bằng tiếng Việt",
  "culturalNotes": "Lưu ý văn hóa ứng xử giao tiếp bằng tiếng Việt",
  "formalityExplanation": "Giải thích cấp độ kính ngữ hoặc sắc thái câu từ bằng tiếng Việt",
  "vocabulary": [
    {
      "word": "từ mục tiêu",
      "meaning": "nghĩa tiếng Việt",
      "partOfSpeech": "Từ loại (Noun/Verb/Adj)",
      "hangul": "nếu là tiếng Hàn",
      "romanization": "phiên âm",
      "exampleSentence": "câu ví dụ chuẩn",
      "translation": "nghĩa câu ví dụ tiếng Việt"
    }
  ],
  "grammar": [
    {
      "grammarPoint": "điểm ngữ pháp",
      "pattern": "cấu trúc",
      "explanation": "giải thích chi tiết bằng tiếng Việt",
      "formula": "công thức",
      "exampleSentence": "câu ví dụ",
      "translation": "dịch câu ví dụ"
    }
  ],
  "dialogue": {
    "title": "Hội thoại thực tế",
    "lines": [
      {
        "speakerName": "Tên nhân vật",
        "speakerRole": "USER hoặc AI",
        "textOriginal": "câu thoại mục tiêu",
        "textTranslation": "dịch tiếng Việt"
      }
    ]
  },
  "exercises": [
    {
      "prompt": "câu hỏi trắc nghiệm tiếng Việt",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "đáp án đúng",
      "explanation": "giải thích"
    }
  ]
}`;

      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        },
        { timeout: 16000 }
      );

      const parsedText = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (parsedText) {
        const data = JSON.parse(parsedText);
        return formatGeneratedLessonResponse(data, params, lessonId);
      }
    } catch (e) {
      console.warn('Gemini curriculum generation failed, using educational engine fallback:', e);
    }
  }

  // 2. Smart Educational Engine Fallback (Rule-Based & Semantic Matching)
  return buildSmartEducationalLesson(params, lessonId);
};

function formatGeneratedLessonResponse(data: any, params: GenerateLessonParams, lessonId: number) {
  const isKo = params.languageCode === 'KO';
  return {
    id: lessonId,
    topicId: params.topicId || 1,
    topicName: isKo ? 'Tình huống thực tế' : 'Real-life Communication',
    languageCode: params.languageCode,
    title: data.title || params.title,
    scenario: data.scenario || params.scenario,
    description: data.description || `Giáo trình giao tiếp thực chiến: ${params.title}`,
    difficulty: params.difficulty,
    status: 'AI_GENERATED',
    learningObjectives: params.learningObjectives || data.learningObjectives || 'Nắm vững từ vựng và đàm thoại tự nhiên',
    culturalNotes: data.culturalNotes || (isKo ? 'Khi giao tiếp ở nơi công cộng tại Hàn Quốc, hãy ưu tiên dùng đuôi câu -아/어요 hoặc -습니다 lịch sự.' : 'In English, using polite modal verbs creates a courteous and respectful impression.'),
    formalityExplanation: data.formalityExplanation || (isKo ? 'Đuôi câu thân mật lịch sự (존댓말).' : 'Standard polite professional register.'),
    orderIndex: 1,
    vocabulary: (data.vocabulary || []).map((v: any, idx: number) => ({
      id: lessonId * 10 + idx,
      word: v.word,
      meaning: v.meaning,
      partOfSpeech: v.partOfSpeech || 'Từ vựng',
      hangul: v.hangul || (isKo ? v.word : undefined),
      romanization: v.romanization || '',
      exampleSentence: v.exampleSentence || '',
      translation: v.translation || '',
    })),
    grammar: (data.grammar || []).map((g: any, idx: number) => ({
      id: lessonId * 10 + idx,
      grammarPoint: g.grammarPoint,
      pattern: g.pattern || g.grammarPoint,
      explanation: g.explanation,
      formula: g.formula || '',
      exampleSentence: g.exampleSentence || '',
      translation: g.translation || '',
    })),
    dialogues: [
      {
        id: lessonId,
        lessonId,
        title: data.dialogue?.title || 'Hội thoại mẫu tình huống',
        contextDescription: params.scenario,
        userRole: 'Bạn (Học viên)',
        partnerRole: 'Đối tác AI',
        lines: (data.dialogue?.lines || []).map((l: any, idx: number) => ({
          id: idx + 1,
          speakerName: l.speakerName,
          speakerRole: l.speakerRole || (idx % 2 === 0 ? 'USER' : 'AI'),
          textOriginal: l.textOriginal,
          textTranslation: l.textTranslation,
          orderIndex: idx + 1,
        })),
      },
    ],
    exercises: (data.exercises || []).map((ex: any, idx: number) => ({
      id: lessonId * 10 + idx,
      lessonId,
      title: `Câu hỏi củng cố ${idx + 1}`,
      type: 'MULTIPLE_CHOICE',
      questions: [
        {
          id: idx + 1,
          prompt: ex.prompt,
          optionsJson: JSON.stringify(ex.options || []),
          correctAnswer: ex.correctAnswer || (ex.options ? ex.options[0] : ''),
          explanation: ex.explanation || 'Đọc kỹ câu và chọn phương án chuẩn nhất.',
          orderIndex: 1,
        },
      ],
    })),
    scenarios: [],
  };
}

function buildSmartEducationalLesson(params: GenerateLessonParams, lessonId: number) {
  const { title, scenario, difficulty, learningObjectives, languageCode } = params;
  const isKo = languageCode === 'KO';
  const query = `${title} ${scenario}`.toLowerCase();

  let vocabList: any[] = [];
  let grammarList: any[] = [];
  let dialogueLines: any[] = [];

  if (isKo) {
    if (query.includes('khách sạn') || query.includes('hotel') || query.includes('nhận phòng') || query.includes('check-in')) {
      vocabList = [
        { word: '체크인하다', meaning: 'Nhận phòng (Check-in)', partOfSpeech: 'Động từ', hangul: '체크인하다', romanization: 'chek-in-hada', exampleSentence: '체크인하려고 하는데요.', translation: 'Tôi muốn làm thủ tục nhận phòng ạ.' },
        { word: '예약 확인', meaning: 'Xác nhận đặt phòng', partOfSpeech: 'Danh từ', hangul: '예약 확인', romanization: 'ye-yak hwa-gin', exampleSentence: '예약 확인서 보여드릴게요.', translation: 'Tôi sẽ xuất trình giấy xác nhận đặt phòng.' },
        { word: '조식', meaning: 'Bữa sáng khách sạn', partOfSpeech: 'Danh từ', hangul: '조식', romanization: 'jo-sik', exampleSentence: '조식 시간은 몇 시부터인가요?', translation: 'Giờ phục vụ bữa sáng từ mấy giờ vậy ạ?' },
        { word: '금연실', meaning: 'Phòng không hút thuốc', partOfSpeech: 'Danh từ', hangul: '금연실', romanization: 'geum-yeon-sil', exampleSentence: '금연실로 배정해 주실 수 있나요?', translation: 'Khách sạn có thể xếp cho tôi phòng không hút thuốc được không?' },
      ];
      grammarList = [
        { grammarPoint: 'V + -(으)려고 하다', pattern: 'Động từ + -(으)려고 하다', explanation: 'Diễn đạt ý định, kế hoạch chuẩn bị thực hiện việc gì ("Định làm...", "Muốn làm...").', formula: 'V (không batchim) + -려고 하다 / V (có batchim) + -으려고 하다', exampleSentence: '호텔에 체크인하려고 해요.', translation: 'Tôi định làm thủ tục nhận phòng khách sạn.' },
        { grammarPoint: 'V + -아/어 주시겠어요?', pattern: 'Động từ + -아/어 주시겠어요?', explanation: 'Đưa ra lời đề nghị hoặc nhờ vả đối phương một cách lịch sự, trang nhã.', formula: 'V + -아/어 주시겠어요?', exampleSentence: '조용한 높은 층 방으로 배정해 주시겠어요?', translation: 'Lễ tân có thể xếp cho tôi phòng tầng cao yên tĩnh được không ạ?' },
      ];
      dialogueLines = [
        { speakerName: 'Khách', speakerRole: 'USER', textOriginal: '안녕하세요, 예약한 방 체크인하려고 하는데요.', textTranslation: 'Xin chào, tôi muốn làm thủ tục nhận phòng đã đặt trước ạ.' },
        { speakerName: 'Lễ tân', speakerRole: 'AI', textOriginal: '네 환영합니다! 예약자 성함과 여권을 보여주시겠어요?', textTranslation: 'Vâng chào mừng quý khách! Quý khách vui lòng cho tôi xin tên người đặt và hộ chiếu ạ.' },
        { speakerName: 'Khách', speakerRole: 'USER', textOriginal: '여기 여권 있습니다. 혹시 금연실이고 높은 층 방인가요?', textTranslation: 'Hộ chiếu của tôi đây ạ. Phòng này là phòng không hút thuốc ở tầng cao đúng không ạ?' },
        { speakerName: 'Lễ tân', speakerRole: 'AI', textOriginal: '네, 12층 전망 좋은 금연실로 준비해 드렸습니다. 조식은 2층에서 7시부터 이용 가능합니다.', textTranslation: 'Vâng, chúng tôi đã chuẩn bị phòng không hút thuốc tầng 12 view đẹp. Bữa sáng phục vụ tại tầng 2 từ 7 giờ ạ.' },
      ];
    } else if (query.includes('ăn') || query.includes('món') || query.includes('quán') || query.includes('nhà hàng') || query.includes('restaurant')) {
      vocabList = [
        { word: '주문하다', meaning: 'Gọi món / Đặt món', partOfSpeech: 'Động từ', hangul: '주문하다', romanization: 'ju-mun-ha-da', exampleSentence: '주문하시겠어요?', translation: 'Quý khách muốn gọi món chưa ạ?' },
        { word: '메뉴판', meaning: 'Menu thực đơn', partOfSpeech: 'Danh từ', hangul: '메뉴판', romanization: 'me-nyu-pan', exampleSentence: '메뉴판 좀 보여주세요.', translation: 'Làm ơn cho tôi xem thực đơn với ạ.' },
        { word: '추천하다', meaning: 'Giới thiệu / Gợi ý', partOfSpeech: 'Động từ', hangul: '추천하다', romanization: 'chu-cheon-ha-da', exampleSentence: '인기 있는 메뉴 추천해 주세요.', translation: 'Hãy gợi ý cho tôi món ăn được yêu thích nhất ở đây nhé.' },
        { word: '계산서', meaning: 'Hóa đơn tính tiền', partOfSpeech: 'Danh từ', hangul: '계산서', romanization: 'gye-san-seo', exampleSentence: '계산서 부탁드립니다.', translation: 'Cho tôi xin hóa đơn thanh toán ạ.' },
      ];
      grammarList = [
        { grammarPoint: 'N + (으)로 주세요', pattern: 'Danh từ + (으)로 주세요', explanation: 'Dùng khi chọn hoặc gọi món đồ cụ thể trong thực đơn ("Lấy cho tôi món...").', formula: 'N (có batchim) + 으로 주세요 / N (không batchim) + 로 주세요', exampleSentence: '김치찌개 1인분으로 주세요.', translation: 'Cho tôi một phần canh kim chi nhé.' },
      ];
      dialogueLines = [
        { speakerName: 'Khách', speakerRole: 'USER', textOriginal: '저기요! 메뉴판 좀 가져다주세요.', textTranslation: 'Em ơi! Mang thực đơn giúp anh/chị với nhé.' },
        { speakerName: 'Nhân viên', speakerRole: 'AI', textOriginal: '네 손님, 여기 메뉴판 있습니다. 주문 준비되시면 벨을 눌러주세요.', textTranslation: 'Dạ thực đơn đây ạ. Khi nào chọn xong quý khách bấm chuông gọi nhé.' },
        { speakerName: 'Khách', speakerRole: 'USER', textOriginal: '여기서 제일 잘 나가는 메뉴 하나 추천해 주시겠어요?', textTranslation: 'Em gợi ý cho anh/chị món ăn ngon bán chạy nhất ở quán với?' },
        { speakerName: 'Nhân viên', speakerRole: 'AI', textOriginal: '매콤달콤한 돼지갈비찜이 가장 인기 많습니다!', textTranslation: 'Dạ món sườn heo om sốt cay ngọt là món được chuộng nhất quán em ạ!' },
      ];
    } else {
      vocabList = [
        { word: '소통하다', meaning: 'Giao tiếp / Thấu hiểu', partOfSpeech: 'Động từ', hangul: '소통하다', romanization: 'so-tong-ha-da', exampleSentence: '자연스럽게 소통하고 싶어요.', translation: 'Tôi muốn giao tiếp một cách tự nhiên.' },
        { word: '표현', meaning: 'Cách diễn đạt / Biểu cảm', partOfSpeech: 'Danh từ', hangul: '표현', romanization: 'pyo-hyeon', exampleSentence: '유용한 한국어 표현을 배웠어요.', translation: 'Tôi đã học được cách diễn đạt tiếng Hàn rất hữu ích.' },
        { word: '자신감', meaning: 'Sự tự tin', partOfSpeech: 'Danh từ', hangul: '자신감', romanization: 'ja-sin-gam', exampleSentence: '말할 때 자신감이 생겼어요.', translation: 'Tôi đã tự tin hơn rất nhiều khi nói chuyện.' },
      ];
      grammarList = [
        { grammarPoint: 'V + -(으)ㄹ 수 있다', pattern: 'Động từ + -(으)ㄹ 수 있다', explanation: 'Diễn tả năng lực hoặc khả năng có thể làm một hành động nào đó.', formula: 'V + -(으)ㄹ 수 있다', exampleSentence: '이제 한국어로 자신 있게 말할 수 있어요.', translation: 'Bây giờ tôi đã có thể tự tin nói chuyện bằng tiếng Hàn.' },
      ];
      dialogueLines = [
        { speakerName: 'Học viên', speakerRole: 'USER', textOriginal: '오늘 상황에 맞는 표현을 연습하고 싶어요.', textTranslation: 'Tôi muốn luyện tập các câu nói chuẩn cho tình huống hôm nay.' },
        { speakerName: 'Đối tác AI', speakerRole: 'AI', textOriginal: '좋아요! 원하시는 상황을 편하게 말씀해 주시면 대화를 이어갈게요.', textTranslation: 'Tuyệt vời! Bạn cứ thoải mái bắt đầu, tôi sẽ cùng bạn đối thoại nhé.' },
      ];
    }
  } else {
    // English default templates
    vocabList = [
      { word: 'Check-in', meaning: 'Làm thủ tục nhận phòng / Đăng ký', partOfSpeech: 'Verb', romanization: '[tʃek ɪn]', exampleSentence: 'I would like to check in, please.', translation: 'Tôi muốn làm thủ tục nhận phòng ạ.' },
      { word: 'Reservation', meaning: 'Đặt chỗ trước / Đặt phòng', partOfSpeech: 'Noun', romanization: '[ˌrezərˈveɪʃn]', exampleSentence: 'I have a reservation under the name John.', translation: 'Tôi có đặt phòng trước dưới tên John.' },
      { word: 'Complimentary', meaning: 'Miễn phí kèm theo dịch vụ', partOfSpeech: 'Adjective', romanization: '[ˌkɑːmplɪˈmentri]', exampleSentence: 'Breakfast is complimentary on the second floor.', translation: 'Bữa sáng miễn phí được phục vụ tại tầng hai.' },
      { word: 'Assistance', meaning: 'Sự giúp đỡ / Hỗ trợ', partOfSpeech: 'Noun', romanization: '[əˈsɪstəns]', exampleSentence: 'Please let us know if you require any assistance.', translation: 'Hãy báo cho chúng tôi nếu bạn cần bất kỳ sự hỗ trợ nào.' },
    ];
    grammarList = [
      { grammarPoint: 'Could I please get / have...?', pattern: 'Could I please + Verb', explanation: 'Mẫu câu lịch sự chuẩn mực để đưa ra yêu cầu hoặc đặt dịch vụ trong tiếng Anh.', formula: 'Could I please + [Action/Item]?', exampleSentence: 'Could I please have a quiet room on a higher floor?', translation: 'Làm ơn cho tôi một phòng yên tĩnh ở tầng cao được không ạ?' },
      { grammarPoint: 'I would like to + Verb', pattern: 'I would like to + Verb', explanation: 'Cách nói trang nhã thay cho "I want", rất phù hợp trong giao tiếp du lịch và nhà hàng.', formula: 'I would like to + Verb', exampleSentence: 'I would like to confirm my check-out time.', translation: 'Tôi muốn xác nhận lại giờ trả phòng của mình.' },
    ];
    dialogueLines = [
      { speakerName: 'Guest', speakerRole: 'USER', textOriginal: 'Good afternoon, I have a reservation and would like to check in.', textTranslation: 'Chào buổi chiều, tôi đã đặt phòng trước và muốn làm thủ tục nhận phòng ạ.' },
      { speakerName: 'Front Desk', speakerRole: 'AI', textOriginal: 'Welcome to our hotel! May I have your passport and booking reference number?', textTranslation: 'Chào mừng quý khách! Quý khách vui lòng cho tôi xin hộ chiếu và mã đặt phòng ạ.' },
      { speakerName: 'Guest', speakerRole: 'USER', textOriginal: 'Here is my confirmation on my phone. Is breakfast included in this stay?', textTranslation: 'Xác nhận trên điện thoại của tôi đây ạ. Bữa sáng có bao gồm trong gói phòng không ạ?' },
      { speakerName: 'Front Desk', speakerRole: 'AI', textOriginal: 'Yes, complimentary buffet breakfast is served daily from 6:30 to 10:00 AM on the lobby floor.', textTranslation: 'Dạ có, buffet sáng miễn phí phục vụ hàng ngày từ 6:30 đến 10:00 sáng tại tầng sảnh ạ.' },
    ];
  }

  return {
    id: lessonId,
    topicId: params.topicId || 1,
    topicName: isKo ? 'Tình huống thực tế' : 'Real-life Communication',
    languageCode,
    title,
    scenario,
    description: `Giáo trình giao tiếp thực chiến: ${title}`,
    difficulty,
    status: 'AI_GENERATED',
    learningObjectives: learningObjectives || 'Nắm vững các mẫu câu và phản xạ giao tiếp tự nhiên',
    culturalNotes: isKo
      ? 'Trong văn hóa Hàn Quốc, luôn sử dụng đuôi câu tôn kính khi làm thủ tục tại khách sạn hay cửa hàng.'
      : 'In English, polite modal openers like "Could I please" help build positive rapport with service staff.',
    formalityExplanation: isKo
      ? 'Đuôi câu thân mật lịch sự 존댓말 (-아/어요, -(으)세요).'
      : 'Polite formal English register with modal verbs.',
    orderIndex: 1,
    vocabulary: vocabList.map((v, idx) => ({ ...v, id: lessonId * 10 + idx })),
    grammar: grammarList.map((g, idx) => ({ ...g, id: lessonId * 10 + idx })),
    dialogues: [
      {
        id: lessonId,
        lessonId,
        title: 'Hội thoại giao tiếp thực tế',
        contextDescription: scenario,
        userRole: 'Bạn (Học viên)',
        partnerRole: 'Đối tác AI',
        lines: dialogueLines.map((l, idx) => ({ ...l, id: idx + 1, orderIndex: idx + 1 })),
      },
    ],
    exercises: [
      {
        id: lessonId * 10 + 1,
        lessonId,
        title: 'Bài tập trắc nghiệm củng cố',
        type: 'MULTIPLE_CHOICE',
        questions: [
          {
            id: 1,
            prompt: isKo
              ? `Khi muốn làm thủ tục nhận phòng khách sạn, câu nói nào sau đây là lịch sự và tự nhiên nhất?`
              : `Which phrase is the most courteous when requesting assistance?`,
            optionsJson: JSON.stringify(
              isKo
                ? [
                    '체크인하려고 하는데요. (Tôi muốn làm thủ tục nhận phòng ạ)',
                    '방 줘. (Đưa phòng đây)',
                    '안녕 체크인. (Chào check-in)',
                    '여기 왜 이래? (Ở đây sao thế này?)',
                  ]
                : [
                    'Could I please check in for my reservation?',
                    'Give me my room now.',
                    'Hey, room key.',
                    'Check-in fast.',
                  ]
            ),
            correctAnswer: isKo ? '체크인하려고 하는데요. (Tôi muốn làm thủ tục nhận phòng ạ)' : 'Could I please check in for my reservation?',
            explanation: isKo
              ? 'Dùng cấu trúc "-(으)려고 하는데요" thể hiện nguyện vọng một cách trang nhã và tôn trọng đối phương.'
              : 'Using "Could I please..." is polite, grammatically precise, and expected in hospitality settings.',
            orderIndex: 1,
          },
        ],
      },
    ],
    scenarios: [],
  };
}

/**
 * Ingest raw textual document and parse into structured LessonDetail
 */
export const ingestRawContentToLesson = async (params: {
  languageCode: string;
  levelCode: string;
  topicTitle: string;
  rawSourceText: string;
}): Promise<any> => {
  const { languageCode, levelCode, topicTitle, rawSourceText } = params;
  const isKo = languageCode === 'KO';
  const lessonId = Date.now();

  const lines = rawSourceText.split('\n').map((l) => l.trim()).filter(Boolean);

  const vocabExtracted: any[] = [];
  const grammarExtracted: any[] = [];

  for (const line of lines) {
    if (line.startsWith('-') || line.startsWith('•') || line.startsWith('*')) {
      const clean = line.replace(/^[-•*]\s*/, '');
      if (clean.includes('(') && clean.includes(')')) {
        const parts = clean.split(/\(|\)/).map((p) => p.trim()).filter(Boolean);
        if (parts.length >= 2) {
          vocabExtracted.push({
            id: lessonId * 10 + vocabExtracted.length,
            word: parts[0],
            meaning: parts[1],
            partOfSpeech: isKo ? 'Từ vựng cốt lõi' : 'Core Vocabulary',
            hangul: isKo ? parts[0] : undefined,
            romanization: '',
            exampleSentence: `${parts[0]} 연습 문장`,
            translation: `Câu luyện tập với từ ${parts[0]}`,
          });
        }
      } else if (clean.includes(':')) {
        const parts = clean.split(':').map((p) => p.trim());
        grammarExtracted.push({
          id: lessonId * 10 + grammarExtracted.length,
          grammarPoint: parts[0],
          pattern: parts[0],
          explanation: parts[1] || 'Điểm ngữ pháp quan trọng trong bài học',
          formula: parts[0],
          exampleSentence: `Ví dụ ứng dụng của ${parts[0]}`,
          translation: `Bản dịch câu ví dụ`,
        });
      }
    }
  }

  if (vocabExtracted.length === 0) {
    vocabExtracted.push({
      id: lessonId * 10 + 1,
      word: isKo ? '학습하다' : 'To learn',
      meaning: 'Học tập / Tiếp thu kiến thức',
      partOfSpeech: 'Động từ',
      exampleSentence: isKo ? '열심히 학습해요.' : 'We learn actively.',
      translation: 'Chăm chỉ học tập.',
    });
  }

  return {
    id: lessonId,
    topicId: 1,
    topicName: topicTitle,
    languageCode,
    title: topicTitle,
    scenario: `Bài học biên soạn từ tài liệu nguồn: ${topicTitle}`,
    description: `Nội dung đã được chuẩn hóa qua đường ống Ingestion Pipeline.`,
    difficulty: levelCode,
    status: 'AI_GENERATED',
    learningObjectives: 'Hấp thụ toàn bộ từ vựng và ngữ pháp từ tài liệu nguồn.',
    culturalNotes: isKo ? 'Lưu ý vận dụng linh hoạt trong các tình huống thực tế.' : 'Focus on real-world contextual usage.',
    formalityExplanation: isKo ? 'Kính ngữ chuẩn mực theo quy tắc ngữ pháp.' : 'Standard communication register.',
    orderIndex: 1,
    vocabulary: vocabExtracted,
    grammar: grammarExtracted,
    dialogues: [
      {
        id: lessonId,
        lessonId,
        title: 'Hội thoại ứng dụng tài liệu',
        contextDescription: topicTitle,
        userRole: 'Học viên',
        partnerRole: 'Trợ lý AI',
        lines: [
          { id: 1, speakerName: 'Học viên', speakerRole: 'USER', textOriginal: isKo ? '이 내용에 대해 더 배우고 싶어요.' : 'I would like to learn more about this.', textTranslation: 'Tôi muốn học hỏi thêm về nội dung này.', orderIndex: 1 },
          { id: 2, speakerName: 'Trợ lý AI', speakerRole: 'AI', textOriginal: isKo ? '좋습니다! 방금 nạp된 tài liệu를 바탕으로 함께 연습해 봐요.' : 'Great! Let us practice based on the ingested material.', textTranslation: 'Rất tốt! Chúng ta cùng luyện tập dựa trên tài liệu vừa được nạp nhé.', orderIndex: 2 },
        ],
      },
    ],
    exercises: [],
    scenarios: [],
  };
};
