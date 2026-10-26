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
 * Clean JSON string from potential markdown wrapper
 */
function cleanJsonString(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

/**
 * Remove Vietnamese diacritics for robust topic matching
 */
function removeVietnameseTones(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
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

  // 1. Try Gemini API if key is present
  if (apiKey && provider === 'gemini') {
    try {
      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        },
        { timeout: 18000 }
      );

      const parsedText = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (parsedText) {
        const data = JSON.parse(cleanJsonString(parsedText));
        return formatGeneratedLessonResponse(data, params, lessonId);
      }
    } catch (e) {
      console.warn('Gemini curriculum generation failed, using educational engine fallback:', e);
    }
  }

  // 2. Try OpenAI API if key is present
  if (apiKey && provider === 'openai') {
    try {
      const res = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are an expert language curriculum specialist. Always output valid JSON.' },
            { role: 'user', content: prompt },
          ],
          response_format: { type: 'json_object' },
        },
        {
          headers: { Authorization: `Bearer ${apiKey}` },
          timeout: 18000,
        }
      );

      const content = res.data?.choices?.[0]?.message?.content;
      if (content) {
        const data = JSON.parse(cleanJsonString(content));
        return formatGeneratedLessonResponse(data, params, lessonId);
      }
    } catch (e) {
      console.warn('OpenAI curriculum generation failed, using educational engine fallback:', e);
    }
  }

  // 3. Smart Educational Engine Fallback (Rule-Based & Semantic Matching)
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

type TopicTheme = 'SHOPPING' | 'DIRECTIONS' | 'DINING' | 'HOTEL' | 'AIRPORT' | 'JOB' | 'MEDICAL' | 'DAILY';

function detectTopicTheme(title: string, scenario: string, objectives?: string): TopicTheme {
  const combined = removeVietnameseTones(`${title} ${scenario} ${objectives || ''}`);

  if (
    combined.includes('mua sam') ||
    combined.includes('shopping') ||
    combined.includes('trung tam thuong mai') ||
    combined.includes('mall') ||
    combined.includes('cua hang') ||
    combined.includes('shop') ||
    combined.includes('quan ao') ||
    combined.includes('ao') ||
    combined.includes('tang nao') ||
    combined.includes('tang may') ||
    combined.includes('gia ca') ||
    combined.includes('thanh toan') ||
    combined.includes('size') ||
    combined.includes('thu do') ||
    combined.includes('san pham') ||
    combined.includes('giam gia') ||
    combined.includes('discount')
  ) {
    return 'SHOPPING';
  }

  if (
    combined.includes('hoi duong') ||
    combined.includes('duong di') ||
    combined.includes('chi duong') ||
    combined.includes('o dau') ||
    combined.includes('re trai') ||
    combined.includes('re phai') ||
    combined.includes('nga tu') ||
    combined.includes('ga tau') ||
    combined.includes('tram xe') ||
    combined.includes('subway') ||
    combined.includes('direction') ||
    combined.includes('station')
  ) {
    return 'DIRECTIONS';
  }

  if (
    combined.includes('nha hang') ||
    combined.includes('goi mon') ||
    combined.includes('thuc don') ||
    combined.includes('mon an') ||
    combined.includes('quan an') ||
    combined.includes('ca phe') ||
    combined.includes('coffee') ||
    combined.includes('restaurant') ||
    combined.includes('order') ||
    combined.includes('menu') ||
    combined.includes('an uong')
  ) {
    return 'DINING';
  }

  if (
    combined.includes('khach san') ||
    combined.includes('hotel') ||
    combined.includes('nhan phong') ||
    combined.includes('tra phong') ||
    combined.includes('check-in') ||
    combined.includes('check in') ||
    combined.includes('checkout') ||
    combined.includes('check out') ||
    combined.includes('dat phong') ||
    combined.includes('le tan') ||
    combined.includes('resort')
  ) {
    return 'HOTEL';
  }

  if (
    combined.includes('san bay') ||
    combined.includes('chuyen bay') ||
    combined.includes('ve may bay') ||
    combined.includes('hanh ly') ||
    combined.includes('hai quan') ||
    combined.includes('airport') ||
    combined.includes('flight') ||
    combined.includes('boarding')
  ) {
    return 'AIRPORT';
  }

  if (
    combined.includes('phong van') ||
    combined.includes('xin viec') ||
    combined.includes('cong viec') ||
    combined.includes('cong ty') ||
    combined.includes('dong nghiep') ||
    combined.includes('interview') ||
    combined.includes('resume') ||
    combined.includes('career')
  ) {
    return 'JOB';
  }

  if (
    combined.includes('kham benh') ||
    combined.includes('benh vien') ||
    combined.includes('bac si') ||
    combined.includes('hieu thuoc') ||
    combined.includes('mua thuoc') ||
    combined.includes('dau dau') ||
    combined.includes('sot') ||
    combined.includes('hospital') ||
    combined.includes('clinic') ||
    combined.includes('doctor') ||
    combined.includes('medicine')
  ) {
    return 'MEDICAL';
  }

  return 'DAILY';
}

function buildSmartEducationalLesson(params: GenerateLessonParams, lessonId: number) {
  const { title, scenario, difficulty, learningObjectives, languageCode } = params;
  const isKo = languageCode === 'KO';
  const theme = detectTopicTheme(title, scenario, learningObjectives);

  let vocabList: any[] = [];
  let grammarList: any[] = [];
  let dialogueLines: any[] = [];
  let culturalNotes = '';
  let formalityExplanation = '';
  let exerciseQuestions: any[] = [];

  if (isKo) {
    switch (theme) {
      case 'SHOPPING':
        vocabList = [
          { word: '쇼핑몰', meaning: 'Trung tâm thương mại', partOfSpeech: 'Danh từ', hangul: '쇼핑몰', romanization: 'syo-ping-mol', exampleSentence: '이 쇼핑몰은 몇 층까지 있어요?', translation: 'Trung tâm thương mại này có đến tầng mấy vậy ạ?' },
          { word: '몇 층', meaning: 'Tầng mấy', partOfSpeech: 'Danh từ', hangul: '몇 층', romanization: 'myeot cheung', exampleSentence: '의류 매장은 몇 층에 있나요?', translation: 'Gian hàng quần áo ở tầng mấy vậy ạ?' },
          { word: '입어보다', meaning: 'Mặc thử / Thử đồ', partOfSpeech: 'Động từ', hangul: '입어보다', romanization: 'i-beo-bo-da', exampleSentence: '이 옷 한번 입어봐도 될까요?', translation: 'Tôi có thể mặc thử chiếc áo này được không?' },
          { word: '탈의실', meaning: 'Phòng thay đồ / Phòng thử đồ', partOfSpeech: 'Danh từ', hangul: '탈의실', romanization: 'tal-ui-sil', exampleSentence: '탈의실은 저쪽에 있습니다.', translation: 'Phòng thử đồ ở phía đằng kia ạ.' },
          { word: '할인', meaning: 'Giảm giá / Chiết khấu', partOfSpeech: 'Danh từ', hangul: '할인', romanization: 'hal-in', exampleSentence: '지금 20% 할인 행사 중이에요.', translation: 'Hiện đang có chương trình giảm giá 20% ạ.' },
          { word: '계산하다', meaning: 'Thanh toán / Tính tiền', partOfSpeech: 'Động từ', hangul: '계산하다', romanization: 'gye-san-ha-da', exampleSentence: '카드로 계산해 주세요.', translation: 'Làm ơn thanh toán bằng thẻ cho tôi ạ.' },
        ];
        grammarList = [
          { grammarPoint: 'N은/는 몇 층에 있어요?', pattern: 'Danh từ + 은/는 몇 층에 있어요?', explanation: 'Mẫu câu chuẩn mực hỏi vị trí tầng của cửa hàng hoặc dịch vụ trong tòa nhà.', formula: 'N(có batchim) + 은 / N(không batchim) + 는 몇 층에 있어요?', exampleSentence: '여성 의류 매장은 몇 층에 있어요?', translation: 'Gian hàng thời trang nữ ở tầng mấy vậy ạ?' },
          { grammarPoint: 'V + -아/어 봐도 돼요?', pattern: 'Động từ + -아/어 봐도 돼요?', explanation: 'Mẫu câu xin phép được làm thử việc gì (thử áo, đi thử giày...).', formula: 'V + -아/어 봐도 돼요?', exampleSentence: '이 셔츠 한번 입어봐도 돼요?', translation: 'Tôi có thể mặc thử chiếc áo sơ mi này được không?' },
          { grammarPoint: 'N(으)로 계산할게요', pattern: 'Danh từ + (으)로 계산할게요', explanation: 'Cấu trúc thông báo phương thức thanh toán (thẻ, tiền mặt, Samsung Pay).', formula: 'N + (으)로 계산할게요', exampleSentence: '신용카드로 계산할게요.', translation: 'Tôi sẽ thanh toán bằng thẻ tín dụng ạ.' },
        ];
        dialogueLines = [
          { speakerName: 'Khách hàng', speakerRole: 'USER', textOriginal: '실례합니다, 의류 매장은 몇 층에 있어요?', textTranslation: 'Xin lỗi, gian hàng quần áo ở tầng mấy vậy ạ?' },
          { speakerName: 'Nhân viên', speakerRole: 'AI', textOriginal: '네 손님! 의류 매장은 2층과 3층에 있습니다. 에스컬레이터를 이용해 주세요.', textTranslation: 'Dạ thưa quý khách! Quần áo ở tầng 2 và tầng 3 ạ. Quý khách vui lòng đi thang cuốn nhé.' },
          { speakerName: 'Khách hàng', speakerRole: 'USER', textOriginal: '감사합니다! 이 재킷 M 사이즈로 입어봐도 돼요? 가격이 얼마예요?', textTranslation: 'Cảm ơn bạn! Chiếc áo khoác này tôi thử size M được không? Và giá bao nhiêu ạ?' },
          { speakerName: 'Nhân viên', speakerRole: 'AI', textOriginal: '네, M 사이즈 준비해 드릴게요. 탈의실은 안쪽에 있습니다. 현재 20% 할인해서 55,000원입니다.', textTranslation: 'Vâng, em chuẩn bị size M cho anh/chị nhé. Phòng thử đồ ở phía trong. Hiện đang giảm 20% còn 55.000 won ạ.' },
          { speakerName: 'Khách hàng', speakerRole: 'USER', textOriginal: '사이즈가 딱 맞네요! 이걸로 살게요. 카드로 계산할게요.', textTranslation: 'Size vừa khít luôn! Tôi lấy cái này nhé. Tôi thanh toán bằng thẻ ạ.' },
          { speakerName: 'Nhân viên', speakerRole: 'AI', textOriginal: '네, 여기 서명 부탁드립니다. 영수증과 쇼핑백 챙겨드렸습니다. 좋은 하루 보내세요!', textTranslation: 'Dạ quý khách ký tên vào đây giúp em. Em gửi hóa đơn và túi đồ nhé. Chúc quý khách một ngày tốt lành!' },
        ];
        culturalNotes = 'Khi mua sắm tại Hàn Quốc, bạn có thể tự do xem đồ nhưng hãy hỏi nhân viên trước khi thử đồ bằng câu "입어봐도 돼요?". Hàn Quốc hầu như không dùng tiền mặt, thanh toán bằng thẻ tín dụng hoặc thẻ quốc tế rất tiện lợi.';
        formalityExplanation = 'Sử dụng đuôi câu lịch sự tôn kính 존댓말 (-아요/어요, -(으)세요).';
        exerciseQuestions = [
          {
            prompt: 'Khi muốn hỏi gian hàng quần áo ở tầng mấy trong trung tâm thương mại Hàn Quốc, bạn nói câu nào?',
            options: ['옷 매장은 몇 층에 있어요?', '옷 매장이 어디로 가?', '밥 먹으러 갈래?', '체크인할게요.'],
            correctAnswer: '옷 매장은 몇 층에 있어요?',
            explanation: 'Mẫu câu "N은/는 몇 층에 있어요?" là cấu trúc chuẩn xác để hỏi vị trí tầng.',
          },
        ];
        break;

      case 'DIRECTIONS':
        vocabList = [
          { word: '길을 묻다', meaning: 'Hỏi đường', partOfSpeech: 'Động từ', hangul: '길을 묻다', romanization: 'gil-eul mut-da', exampleSentence: '길 좀 물어봐도 될까요?', translation: 'Tôi có thể hỏi đường một chút được không ạ?' },
          { word: '직진하다', meaning: 'Đi thẳng', partOfSpeech: 'Động từ', hangul: '직진하다', romanization: 'jik-jin-ha-da', exampleSentence: '앞으로 쭉 직진하세요.', translation: 'Xin hãy đi thẳng về phía trước.' },
          { word: '우회전하다', meaning: 'Rẽ phải', partOfSpeech: 'Động từ', hangul: '우회전하다', romanization: 'u-hoe-jeon-ha-da', exampleSentence: '사거리에서 우회전하세요.', translation: 'Hãy rẽ phải ở ngã tư.' },
          { word: '지하철역', meaning: 'Ga tàu điện ngầm', partOfSpeech: 'Danh từ', hangul: '지하철역', romanization: 'ji-ha-cheol-yeok', exampleSentence: '가장 가까운 지하철역이 어디예요?', translation: 'Ga tàu điện ngầm gần nhất ở đâu vậy ạ?' },
        ];
        grammarList = [
          { grammarPoint: 'N(으)로 가려면 어떻게 가야 돼요?', pattern: 'Danh từ + (으)로 가려면 어떻게 가야 돼요?', explanation: 'Hỏi cách di chuyển hoặc đường đi đến một địa điểm.', formula: 'N + (으)로 가려면 어떻게 가야 돼요?', exampleSentence: '명동역으로 가려면 어떻게 가야 돼요?', translation: 'Muốn đến ga Myeongdong thì đi như thế nào ạ?' },
        ];
        dialogueLines = [
          { speakerName: 'Người hỏi', speakerRole: 'USER', textOriginal: '실례지만, 여기서 명동역으로 가려면 어떻게 가야 돼요?', textTranslation: 'Xin lỗi, từ đây muốn đi đến ga Myeongdong thì đi thế nào ạ?' },
          { speakerName: 'Người qua đường', speakerRole: 'AI', textOriginal: '이 길로 100미터쯤 직진하시다가 사거리에서 우회전하시면 바로 역 입구가 보여요.', textTranslation: 'Bạn cứ đi thẳng theo đường này khoảng 100 mét, đến ngã tư thì rẽ phải là thấy ngay lối vào ga.' },
          { speakerName: 'Người hỏi', speakerRole: 'USER', textOriginal: '걸어서 얼마나 걸려요?', textTranslation: 'Đi bộ mất khoảng bao lâu ạ?' },
          { speakerName: 'Người qua đường', speakerRole: 'AI', textOriginal: '걸어서 5분 정도면 충분히 도착할 수 있어요.', textTranslation: 'Đi bộ chỉ khoảng 5 phút là đến nơi rồi nhé.' },
        ];
        culturalNotes = 'Khi mở lời hỏi đường người lạ ở Hàn Quốc, luôn bắt đầu bằng "실례지만..." (Xin lỗi làm phiền nhưng...).';
        formalityExplanation = 'Đuôi câu kính trọng chuẩn mực 존댓말.';
        exerciseQuestions = [
          {
            prompt: 'Câu nào dùng để hỏi "Từ đây đi đến ga tàu điện ngầm thế nào?"',
            options: ['지하철역으로 가려면 어떻게 가야 돼요?', '지하철 타고 싶지 않아요.', '얼마예요?', '체크인해 주세요.'],
            correctAnswer: '지하철역으로 가려면 어떻게 가야 돼요?',
            explanation: 'Cấu trúc -(으)려면 어떻게 가야 돼요? dùng để hỏi hướng đi.',
          },
        ];
        break;

      case 'DINING':
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
        culturalNotes = 'Ở các quán ăn Hàn Quốc, bạn dùng nút chuông trên bàn (호출벨) để gọi nhân viên thay vì vẫy tay nói to.';
        formalityExplanation = 'Xưng hô 저기요 và dùng đuôi câu -주세요.';
        exerciseQuestions = [
          {
            prompt: 'Cách gọi món canh kim chi lịch sự tại quán ăn là gì?',
            options: ['김치찌개 하나 주세요.', '김치찌개 싫어.', '김치찌개 얼마야?', '물 줘.'],
            correctAnswer: '김치찌개 하나 주세요.',
            explanation: 'Dùng cấu trúc "N + 주세요" là chuẩn mực lịch sự khi gọi món.',
          },
        ];
        break;

      case 'HOTEL':
        vocabList = [
          { word: '체크인하다', meaning: 'Nhận phòng (Check-in)', partOfSpeech: 'Động từ', hangul: '체크인하다', romanization: 'chek-in-hada', exampleSentence: '체크인하려고 하는데요.', translation: 'Tôi muốn làm thủ tục nhận phòng ạ.' },
          { word: '예약 확인', meaning: 'Xác nhận đặt phòng', partOfSpeech: 'Danh từ', hangul: '예약 확인', romanization: 'ye-yak hwa-gin', exampleSentence: '예약 확인서 보여드릴게요.', translation: 'Tôi sẽ xuất trình giấy xác nhận đặt phòng.' },
          { word: '조식', meaning: 'Bữa sáng khách sạn', partOfSpeech: 'Danh từ', hangul: '조식', romanization: 'jo-sik', exampleSentence: '조식 시간은 몇 시부터인가요?', translation: 'Giờ phục vụ bữa sáng từ mấy giờ vậy ạ?' },
        ];
        grammarList = [
          { grammarPoint: 'V + -(으)려고 하다', pattern: 'Động từ + -(으)려고 하다', explanation: 'Diễn đạt ý định, kế hoạch chuẩn bị thực hiện việc gì ("Định làm...", "Muốn làm...").', formula: 'V + -(으)려고 하다', exampleSentence: '호텔에 체크인하려고 해요.', translation: 'Tôi định làm thủ tục nhận phòng khách sạn.' },
        ];
        dialogueLines = [
          { speakerName: 'Khách', speakerRole: 'USER', textOriginal: '안녕하세요, 예약한 방 체크인하려고 하는데요.', textTranslation: 'Xin chào, tôi muốn làm thủ tục nhận phòng đã đặt trước ạ.' },
          { speakerName: 'Lễ tân', speakerRole: 'AI', textOriginal: '네 환영합니다! 예약자 성함과 여권을 보여주시겠어요?', textTranslation: 'Vâng chào mừng quý khách! Quý khách vui lòng cho tôi xin tên người đặt và hộ chiếu ạ.' },
        ];
        culturalNotes = 'Khách sạn ở Hàn Quốc thường yêu cầu xuất trình hộ chiếu và đặt cọc bằng thẻ tín dụng.';
        formalityExplanation = 'Đuôi câu trang trọng -ㅂ니다/습니다 và 존댓말.';
        exerciseQuestions = [
          {
            prompt: 'Muốn nói "Tôi muốn làm thủ tục nhận phòng" bạn nói câu nào?',
            options: ['체크인하려고 하는데요.', '체크아웃 끝났어.', '밥 먹을래요.', '방 청소해.'],
            correctAnswer: '체크인하려고 하는데요.',
            explanation: 'Mẫu câu -(으)려고 하는데요 diễn tả ý muốn lịch sự.',
          },
        ];
        break;

      default:
        vocabList = [
          { word: '소통하다', meaning: 'Giao tiếp / Thấu hiểu', partOfSpeech: 'Động từ', hangul: '소통하다', romanization: 'so-tong-ha-da', exampleSentence: '자연스럽게 소통하고 싶어요.', translation: 'Tôi muốn giao tiếp một cách tự nhiên.' },
          { word: '표현', meaning: 'Cách diễn đạt', partOfSpeech: 'Danh từ', hangul: '표현', romanization: 'pyo-hyeon', exampleSentence: '유용한 한국어 표현을 배웠어요.', translation: 'Tôi đã học được cách diễn đạt tiếng Hàn rất hữu ích.' },
          { word: '자신감', meaning: 'Sự tự tin', partOfSpeech: 'Danh từ', hangul: '자신감', romanization: 'ja-sin-gam', exampleSentence: '말할 때 자신감이 생겼어요.', translation: 'Tôi đã tự tin hơn rất nhiều khi nói chuyện.' },
        ];
        grammarList = [
          { grammarPoint: 'V + -(으)ㄹ 수 있다', pattern: 'Động từ + -(으)ㄹ 수 있다', explanation: 'Diễn tả năng lực hoặc khả năng có thể làm một hành động nào đó.', formula: 'V + -(으)ㄹ 수 있다', exampleSentence: '이제 한국어로 자신 있게 말할 수 있어요.', translation: 'Bây giờ tôi đã có thể tự tin nói chuyện bằng tiếng Hàn.' },
        ];
        dialogueLines = [
          { speakerName: 'Học viên', speakerRole: 'USER', textOriginal: '오늘 상황에 맞는 표현을 연습하고 싶어요.', textTranslation: 'Tôi muốn luyện tập các câu nói chuẩn cho tình huống hôm nay.' },
          { speakerName: 'Đối tác AI', speakerRole: 'AI', textOriginal: '좋아요! 원하시는 상황을 편하게 말씀해 주시면 대화를 이어갈게요.', textTranslation: 'Tuyệt vời! Bạn cứ thoải mái bắt đầu, tôi sẽ cùng bạn đối thoại nhé.' },
        ];
        culturalNotes = 'Giữ ngữ điệu tự tin và kết thúc câu rõ ràng bằng đuôi câu lịch sự.';
        formalityExplanation = 'Đuôi câu chuẩn mực 존댓말 (-아요/어요).';
        exerciseQuestions = [
          {
            prompt: 'Đuôi câu nào thể hiện sự lịch sự thân mật phổ biến nhất trong tiếng Hàn đời sống?',
            options: ['-아요 / -어요', '-냐?', '-라', '-자'],
            correctAnswer: '-아요 / -어요',
            explanation: 'Đuôi câu -아요/어요 là hình thức kính ngữ thân mật được dùng phổ biến nhất.',
          },
        ];
        break;
    }
  } else {
    // English Educational Curriculum Engine
    switch (theme) {
      case 'SHOPPING':
        vocabList = [
          { word: 'Mall Directory', meaning: 'Bảng chỉ dẫn các tầng / Sơ đồ thương mại', partOfSpeech: 'Noun', romanization: '[mɔːl dəˈrektəri]', exampleSentence: 'You can check the mall directory on the ground floor to locate the shop.', translation: 'Bạn có thể xem bảng chỉ dẫn ở tầng trệt để tìm vị trí cửa hàng.' },
          { word: 'Fitting room', meaning: 'Phòng thử đồ / Phòng thay quần áo', partOfSpeech: 'Noun', romanization: '[ˈfɪtɪŋ ruːm]', exampleSentence: 'Could you tell me where the fitting rooms are located?', translation: 'Làm ơn cho tôi hỏi phòng thử đồ nằm ở đâu ạ?' },
          { word: 'Price tag & Discount', meaning: 'Bảng giá & Mức giảm giá', partOfSpeech: 'Noun', romanization: '[praɪs tæɡ]', exampleSentence: 'This jacket is 20% off the original price tag today.', translation: 'Chiếc áo khoác này hôm nay đang được giảm giá 20% so với giá trên mác.' },
          { word: 'Payment method', meaning: 'Phương thức thanh toán (tiền mặt / thẻ)', partOfSpeech: 'Noun', romanization: '[ˈpeɪmənt ˈmeθəd]', exampleSentence: 'What payment methods do you accept at the checkout counter?', translation: 'Quầy thu ngân chấp nhận những phương thức thanh toán nào vậy ạ?' },
          { word: 'Receipt', meaning: 'Hóa đơn mua hàng', partOfSpeech: 'Noun', romanization: '[rɪˈsiːt]', exampleSentence: 'Please keep your receipt for exchange or refund within 30 days.', translation: 'Vui lòng giữ hóa đơn để đổi trả trong vòng 30 ngày.' },
        ];
        grammarList = [
          { grammarPoint: 'Which floor is [Store/Department] on?', pattern: 'Which floor is + [Store/Shop] + on?', explanation: 'Mẫu câu chuẩn mực hỏi vị trí tầng của cửa hàng, quầy đồ hoặc gian hàng trong trung tâm thương mại.', formula: 'Which floor is + [Store/Category] + on?', exampleSentence: 'Excuse me, which floor is the fashion apparel and shoe department on?', translation: 'Dạ xin lỗi, khu thời trang quần áo và giày dép nằm ở tầng mấy vậy ạ?' },
          { grammarPoint: 'Could you tell me how much this costs? / Do you have this in size [S/M/L]?', pattern: 'Could you tell me how much + [Subject] + costs?', explanation: 'Cách hỏi giá cả và hỏi kích cỡ/màu sắc sản phẩm một cách lịch sự, tự nhiên trong giao tiếp mua sắm quốc tế.', formula: 'Could you tell me how much + [Subject] + costs / is?', exampleSentence: 'Could you tell me how much this jacket costs, and do you have it in size M?', translation: 'Làm ơn cho tôi hỏi chiếc áo khoác này giá bao nhiêu và có sẵn size M không ạ?' },
          { grammarPoint: 'Can I pay by [cash / credit card / mobile pay]?', pattern: 'Can I pay by + [Payment Method]?', explanation: 'Cấu trúc thông dụng khi tiến hành thanh toán tại quầy thu ngân để xác nhận phương thức chấp nhận.', formula: 'Can I pay by + [cash / credit card / mobile pay]?', exampleSentence: 'Can I pay by international credit card or contactless pay?', translation: 'Tôi có thể thanh toán bằng thẻ tín dụng quốc tế hoặc thanh toán chạm không?' },
        ];
        dialogueLines = [
          { speakerName: 'Shopper', speakerRole: 'USER', textOriginal: 'Excuse me, which floor is the clothing store on? I am looking for fashion apparel.', textTranslation: 'Dạ xin lỗi, cho tôi hỏi cửa hàng quần áo ở tầng mấy vậy ạ? Tôi đang tìm khu thời trang.' },
          { speakerName: 'Staff', speakerRole: 'AI', textOriginal: 'Fashion apparel is on the 2nd and 3rd floors, right next to the central escalator.', textTranslation: 'Khu thời trang ở tầng 2 và tầng 3, ngay cạnh thang cuốn trung tâm ạ.' },
          { speakerName: 'Shopper', speakerRole: 'USER', textOriginal: 'Thank you! I found this nice jacket here. Could you tell me how much it costs and if you have it in size M?', textTranslation: 'Cảm ơn bạn! Tôi thấy chiếc áo khoác này rất đẹp. Cho tôi hỏi giá bao nhiêu và có sẵn size M không ạ?' },
          { speakerName: 'Staff', speakerRole: 'AI', textOriginal: 'It is $70, currently on sale for 15% off, so it is $59.50. We have size M in stock! The fitting room is right over there if you would like to try it on.', textTranslation: 'Dạ giá gốc là $70, đang giảm 15% còn $59.50. Bên em có sẵn size M! Phòng thử đồ ở đằng kia nếu quý khách muốn thử ạ.' },
          { speakerName: 'Shopper', speakerRole: 'USER', textOriginal: 'It fits me perfectly! I will take it. Where is the cashier and can I pay by credit card?', textTranslation: 'Áo vừa vặn lắm! Tôi sẽ lấy chiếc này. Quầy thu ngân ở đâu và tôi thanh toán bằng thẻ tín dụng được không?' },
          { speakerName: 'Staff', speakerRole: 'AI', textOriginal: 'The cashier is right here! We accept all credit cards and Apple Pay. Here is your receipt and shopping bag. Have a great day!', textTranslation: 'Quầy thu ngân ngay tại đây ạ! Bên em nhận mọi thẻ tín dụng và Apple Pay. Đây là hóa đơn và túi đồ của quý khách. Chúc quý khách một ngày tuyệt vời!' },
        ];
        culturalNotes = 'Tại các trung tâm thương mại phương Tây hoặc cửa hàng quốc tế, nhân viên thường niềm nở chào đón khách. Khi muốn tự do xem đồ, bạn có thể nói "I am just looking / browsing, thanks". Khi thử đồ, hãy mang sản phẩm đến khu vực fitting room và hỏi nhân viên hỗ trợ.';
        formalityExplanation = 'Sử dụng các cấu trúc lịch sự với "Excuse me", "Could you tell me..." và "Can I pay by..." giúp giao tiếp nhã nhặn, tự tin và chuyên nghiệp.';
        exerciseQuestions = [
          {
            prompt: 'Khi muốn hỏi một gian hàng hoặc quầy đồ ở tầng mấy trong trung tâm thương mại, câu nào sau đây là chuẩn mực nhất?',
            options: [
              'Which floor is the clothing store on?',
              'Where floor is clothing?',
              'Give me the floor of clothing.',
              'How many floors do you have?',
            ],
            correctAnswer: 'Which floor is the clothing store on?',
            explanation: 'Cấu trúc chuẩn tiếng Anh để hỏi tầng của gian hàng là "Which floor is [Store/Department] on?".',
          },
        ];
        break;

      case 'DIRECTIONS':
        vocabList = [
          { word: 'Crosswalk', meaning: 'Vạch kẻ sang đường cho người đi bộ', partOfSpeech: 'Noun', romanization: '[ˈkrɔːswɔːk]', exampleSentence: 'Cross the street at the next crosswalk.', translation: 'Hãy băng qua đường ở vạch sang đường tiếp theo.' },
          { word: 'Intersection', meaning: 'Ngã tư / Giao lộ', partOfSpeech: 'Noun', romanization: '[ˌɪntərˈsekʃn]', exampleSentence: 'Turn right at the big intersection.', translation: 'Hãy rẽ phải ở ngã tư lớn.' },
          { word: 'Within walking distance', meaning: 'Trong tầm đi bộ (rất gần)', partOfSpeech: 'Phrase', romanization: '[wɪˈðɪn ˈwɔːkɪŋ ˈdɪstəns]', exampleSentence: 'The subway station is within walking distance.', translation: 'Ga tàu điện ngầm nằm rất gần, trong tầm đi bộ.' },
          { word: 'Straight ahead', meaning: 'Thẳng ngay phía trước', partOfSpeech: 'Adverb', romanization: '[streɪt əˈhed]', exampleSentence: 'Keep walking straight ahead for two blocks.', translation: 'Tiếp tục đi thẳng về phía trước qua hai dãy nhà.' },
        ];
        grammarList = [
          { grammarPoint: 'How do I get to [Destination]?', pattern: 'How do I get to + [Place]?', explanation: 'Mẫu câu tự nhiên và phổ biến nhất để hỏi đường đi đến một địa điểm.', formula: 'How do I get to + [Destination]?', exampleSentence: 'Excuse me, how do I get to the central station?', translation: 'Xin lỗi, làm sao để tôi đi đến ga trung tâm vậy ạ?' },
        ];
        dialogueLines = [
          { speakerName: 'Tourist', speakerRole: 'USER', textOriginal: 'Excuse me, could you tell me how to get to the art museum from here?', textTranslation: 'Xin lỗi, bạn có thể chỉ cho tôi cách đi đến bảo tàng mỹ thuật từ đây không?' },
          { speakerName: 'Local', speakerRole: 'AI', textOriginal: 'Sure! Walk straight ahead for two blocks, then turn left at the traffic light.', textTranslation: 'Chắc chắn rồi! Bạn cứ đi thẳng qua 2 dãy nhà, sau đó rẽ trái ở cột đèn giao thông nhé.' },
          { speakerName: 'Tourist', speakerRole: 'USER', textOriginal: 'Is it within walking distance or should I take a bus?', textTranslation: 'Địa điểm đó có đi bộ được không hay tôi nên bắt xe buýt ạ?' },
          { speakerName: 'Local', speakerRole: 'AI', textOriginal: 'It is only a five-minute walk, so walking is very easy and fast!', textTranslation: 'Chỉ mất khoảng 5 phút đi bộ thôi, đi bộ rất nhanh và dễ dàng!' },
        ];
        culturalNotes = 'Luôn mở đầu bằng "Excuse me" trước khi hỏi đường một người lạ trên phố.';
        formalityExplanation = 'Lịch sự thân thiện trong giao tiếp đường phố.';
        exerciseQuestions = [
          {
            prompt: 'Cách hỏi đường nào sau đây là lịch sự và tự nhiên nhất?',
            options: ['Excuse me, how do I get to the museum?', 'Museum where?', 'Go to museum now.', 'Tell me the road.'],
            correctAnswer: 'Excuse me, how do I get to the museum?',
            explanation: '"Excuse me, how do I get to...?" là cấu trúc hỏi đường chuẩn mực và lịch sự nhất.',
          },
        ];
        break;

      case 'DINING':
        vocabList = [
          { word: 'Specialty', meaning: 'Món đặc sản / Điểm nổi bật của quán', partOfSpeech: 'Noun', romanization: '[ˈspeʃəlti]', exampleSentence: 'What is the chef’s specialty today?', translation: 'Món đặc sản của bếp trưởng hôm nay là gì vậy?' },
          { word: 'Recommend', meaning: 'Gợi ý / Đề xuất', partOfSpeech: 'Verb', romanization: '[ˌrekəˈmend]', exampleSentence: 'Could you recommend a popular appetizer?', translation: 'Bạn có thể gợi ý một món khai vị được yêu thích không?' },
          { word: 'Check / Bill', meaning: 'Hóa đơn thanh toán', partOfSpeech: 'Noun', romanization: '[tʃek / bɪl]', exampleSentence: 'Could we have the check, please?', translation: 'Làm ơn cho chúng tôi xin hóa đơn thanh toán nhé.' },
        ];
        grammarList = [
          { grammarPoint: 'Could I please get / have...?', pattern: 'Could I please get + [Item]?', explanation: 'Cấu trúc gọi món hoặc đưa ra yêu cầu phục vụ lịch sự chuẩn mực.', formula: 'Could I please get + [Food/Drink]?', exampleSentence: 'Could I please get a pasta and a glass of sparkling water?', translation: 'Làm ơn cho tôi một đĩa mì Ý và một ly nước khoáng có ga nhé.' },
        ];
        dialogueLines = [
          { speakerName: 'Customer', speakerRole: 'USER', textOriginal: 'Hi! Could we please get a table for two and take a look at the menu?', textTranslation: 'Chào bạn! Cho chúng tôi xin bàn 2 người và xem thực đơn được không?' },
          { speakerName: 'Server', speakerRole: 'AI', textOriginal: 'Welcome! Right this way. Here are the menus. Can I start you off with something to drink?', textTranslation: 'Chào mừng quý khách! Mời đi lối này. Thực đơn đây ạ. Quý khách muốn dùng đồ uống gì trước không ạ?' },
          { speakerName: 'Customer', speakerRole: 'USER', textOriginal: 'What would you recommend for the main course?', textTranslation: 'Bạn gợi ý món gì ngon nhất cho món chính?' },
          { speakerName: 'Server', speakerRole: 'AI', textOriginal: 'Our grilled salmon with lemon butter sauce is the house favorite tonight!', textTranslation: 'Món cá hồi nướng sốt bơ chanh là món được khách chuộng nhất tối nay ạ!' },
        ];
        culturalNotes = 'Tại Mỹ và nhiều nước phương Tây, tiền tip thường dao động từ 15% - 20% khi ăn tại nhà hàng có nhân viên phục vụ.';
        formalityExplanation = 'Lịch sự, trang nhã trong không gian nhà hàng.';
        exerciseQuestions = [
          {
            prompt: 'Khi muốn xin hóa đơn thanh toán ở nhà hàng, câu nói nào là chuẩn nhất?',
            options: ['Could we have the check, please?', 'Money now.', 'How much all food?', 'Give me bill fast.'],
            correctAnswer: 'Could we have the check, please?',
            explanation: '"Could we have the check, please?" là mẫu câu xin hóa đơn thanh toán chuẩn mực.',
          },
        ];
        break;

      case 'HOTEL':
        vocabList = [
          { word: 'Check-in', meaning: 'Làm thủ tục nhận phòng / Đăng ký', partOfSpeech: 'Verb', romanization: '[tʃek ɪn]', exampleSentence: 'I would like to check in, please.', translation: 'Tôi muốn làm thủ tục nhận phòng ạ.' },
          { word: 'Reservation', meaning: 'Đặt chỗ trước / Đặt phòng', partOfSpeech: 'Noun', romanization: '[ˌrezərˈveɪʃn]', exampleSentence: 'I have a reservation under the name John.', translation: 'Tôi có đặt phòng trước dưới tên John.' },
          { word: 'Complimentary', meaning: 'Miễn phí kèm theo dịch vụ', partOfSpeech: 'Adjective', romanization: '[ˌkɑːmplɪˈmentri]', exampleSentence: 'Breakfast is complimentary on the second floor.', translation: 'Bữa sáng miễn phí được phục vụ tại tầng hai.' },
        ];
        grammarList = [
          { grammarPoint: 'I would like to + Verb', pattern: 'I would like to + Verb', explanation: 'Cách nói trang nhã thay cho "I want", rất phù hợp trong dịch vụ khách sạn.', formula: 'I would like to + Verb', exampleSentence: 'I would like to check in for my reservation.', translation: 'Tôi muốn làm thủ tục nhận phòng theo đặt chỗ của mình.' },
        ];
        dialogueLines = [
          { speakerName: 'Guest', speakerRole: 'USER', textOriginal: 'Good afternoon, I have a reservation and would like to check in.', textTranslation: 'Chào buổi chiều, tôi đã đặt phòng trước và muốn làm thủ tục nhận phòng ạ.' },
          { speakerName: 'Front Desk', speakerRole: 'AI', textOriginal: 'Welcome to our hotel! May I have your passport and booking reference number?', textTranslation: 'Chào mừng quý khách! Quý khách vui lòng cho tôi xin hộ chiếu và mã đặt phòng ạ.' },
        ];
        culturalNotes = 'Nhân viên lễ tân khách sạn luôn coi trọng phong thái nhã nhặn và việc xưng hô lịch sự.';
        formalityExplanation = 'Ngữ khí chuyên nghiệp ngành hiếu khách (Hospitality register).';
        exerciseQuestions = [
          {
            prompt: 'Câu nào thể hiện việc nhận phòng lịch sự nhất?',
            options: ['I would like to check in, please.', 'Give me room.', 'Hey, check in.', 'Key now.'],
            correctAnswer: 'I would like to check in, please.',
            explanation: '"I would like to check in, please." thể hiện thái độ lịch thiệp và chuẩn mực.',
          },
        ];
        break;

      default:
        vocabList = [
          { word: 'Communicate', meaning: 'Giao tiếp / Trao đổi', partOfSpeech: 'Verb', romanization: '[kəˈmjuːnɪkeɪt]', exampleSentence: 'I want to communicate fluently in real situations.', translation: 'Tôi muốn giao tiếp trôi chảy trong các tình huống thực tế.' },
          { word: 'Expression', meaning: 'Cách diễn đạt / Cụm từ hay', partOfSpeech: 'Noun', romanization: '[ɪkˈspreʃn]', exampleSentence: 'Learning daily expressions boosts confidence.', translation: 'Học các cách diễn đạt hằng ngày giúp tăng sự tự tin.' },
          { word: 'Confidence', meaning: 'Sự tự tin', partOfSpeech: 'Noun', romanization: '[ˈkɑːnfɪdəns]', exampleSentence: 'Practice speaking with confidence every day.', translation: 'Hãy luyện tập nói với sự tự tin mỗi ngày.' },
        ];
        grammarList = [
          { grammarPoint: 'I would love to + Verb', pattern: 'I would love to + Verb', explanation: 'Bày tỏ mong muốn một cách nồng nhiệt và lịch sự.', formula: 'I would love to + Verb', exampleSentence: 'I would love to practice everyday communication.', translation: 'Tôi rất muốn luyện tập giao tiếp hằng ngày.' },
        ];
        dialogueLines = [
          { speakerName: 'Learner', speakerRole: 'USER', textOriginal: 'Hello! I would like to practice real-life communication today.', textTranslation: 'Xin chào! Hôm nay tôi muốn luyện tập giao tiếp tình huống thực tế.' },
          { speakerName: 'AI Partner', speakerRole: 'AI', textOriginal: 'Great! Let us start an engaging conversation together.', textTranslation: 'Tuyệt vời! Chúng ta hãy cùng nhau bắt đầu một cuộc trò chuyện thú vị nhé.' },
        ];
        culturalNotes = 'Giữ nụ cười và ánh mắt thân thiện khi giao tiếp bằng tiếng Anh.';
        formalityExplanation = 'Giao tiếp đời sống tự nhiên (Conversational English).';
        exerciseQuestions = [
          {
            prompt: 'Which phrase is the most natural to express your intention politely?',
            options: ['I would like to practice speaking.', 'Me talk now.', 'I want speak loud.', 'You listen me.'],
            correctAnswer: 'I would like to practice speaking.',
            explanation: '"I would like to..." is the standard polite expression.',
          },
        ];
        break;
    }
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
    culturalNotes,
    formalityExplanation,
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
        questions: exerciseQuestions.map((eq, idx) => ({
          id: idx + 1,
          prompt: eq.prompt,
          optionsJson: JSON.stringify(eq.options),
          correctAnswer: eq.correctAnswer,
          explanation: eq.explanation,
          orderIndex: idx + 1,
        })),
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
