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
