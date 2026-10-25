import axios from 'axios';

// In-memory cache for fast, zero-delay repeated translations
const translationCache = new Map<string, string>();

// Curated high-accuracy dictionary for common dialogues in our roleplay scenarios
const KNOWN_TRANSLATIONS: Record<string, string> = {
  // Korean greetings & dialogues
  '안녕하세요! 어서오세요, 몇 분이신가요? 편하신 자리에 앉으세요.':
    'Xin chào! Chào mừng quý khách, quý khách đi mấy người ạ? Xin mời ngồi vào chỗ thoải mái.',
  '안녕하세요! 주문 도와드리겠습니다. 드시고 가시나요?':
    'Xin chào! Tôi có thể giúp quý khách gọi món. Quý khách dùng tại quán hay mang đi ạ?',
  '저기요, 혹시 길 좀 물어봐도 될까요?':
    'Xin lỗi, tôi có thể hỏi đường một chút được không ạ?',
  '네, 김치찌개 하나 준비해 드리겠습니다! 밥과 기본 반찬은 셀프바에서 이용하시면 됩니다. 음료는 필요 없으신가요?':
    'Vâng, tôi sẽ chuẩn bị một phần canh kim chi cho quý khách! Cơm và món phụ ăn kèm quý khách lấy ở quầy tự phục vụ nhé. Quý khách có cần dùng thêm đồ uống gì không ạ?',
  '네, 총 9,000원입니다. 앞쪽에 카드 꽂아주시면 결제 도와드리겠습니다!':
    'Vâng, tổng cộng là 9.000 won ạ. Quý khách cắm thẻ vào khe cắm phía trước để thanh toán nhé!',
  '네, 손님! 말씀하신 내용 확인했습니다. 더 필요하신 부분 있으시면 언제든 저기요 하고 불러주세요.':
    'Vâng thưa quý khách! Tôi đã ghi nhận yêu cầu. Nếu cần thêm gì quý khách cứ gọi tôi bất cứ lúc nào nhé.',
  '네, 시원한 물 한 병만 주세요.':
    'Vâng, cho tôi xin một chai nước mát nhé.',
  '영수증은 버려주셔도 돼요.':
    'Hóa đơn thì bỏ đi cũng được ạ.',
  '감사합니다, 맛있게 먹겠습니다!':
    'Cảm ơn bạn, tôi sẽ ăn thật ngon miệng!',
  '안녕하세요':
    'Xin chào',
  '감사합니다':
    'Xin cảm ơn',
  '얼마예요?':
    'Bao nhiêu tiền vậy ạ?',
  '이거 주세요':
    'Cho tôi cái này nhé',
  '저기요':
    'Xin lỗi / Bạn ơi cho hỏi',
  '맛있어요':
    'Ngon lắm ạ',
  '잘 먹었습니다':
    'Tôi đã ăn rất ngon (cảm ơn bữa ăn)',
  
  // English greetings & dialogues
  'Hey there! Welcome to Craft Coffee. What can I craft for you today?':
    'Xin chào! Chào mừng bạn đến với Craft Coffee. Hôm nay tôi có thể làm món gì cho bạn nhỉ?',
  'Good morning! Thanks for joining today. Could you tell me a bit about yourself?':
    'Chào buổi sáng! Cảm ơn bạn đã tham gia hôm nay. Bạn có thể giới thiệu một chút về bản thân không?',
  'Perfect! An iced oat latte coming right up. That will be $6.50 on card. Will that be for here or to go?':
    'Tuyệt vời! Một ly latte sữa yến mạch đá sẽ có ngay. Của bạn hết 6.50 USD thanh toán thẻ. Bạn dùng tại quán hay mang đi ạ?',
  'Sounds wonderful! Let me know if you need any extra syrup or sugar on the side.':
    'Nghe tuyệt đấy! Hãy cho tôi biết nếu bạn cần thêm siro hoặc đường để riêng nhé.',
  'Make that to go, please.':
    'Cho tôi mang đi nhé, cảm ơn bạn.',
  'Thank you, I appreciate it!':
    'Cảm ơn bạn, tôi rất trân trọng điều đó!',
  'How may I help you?':
    'Tôi có thể giúp gì cho quý khách ạ?',
  'Do you have a reservation?':
    'Quý khách đã đặt bàn trước chưa ạ?',
  'Your table is ready.':
    'Bàn của quý khách đã sẵn sàng rồi ạ.',
  'Please take a seat.':
    'Xin mời quý khách ngồi.',
  'May I take your order?':
    'Quý khách gọi món chưa ạ?',
};

/**
 * Translates text into natural Vietnamese for conversational chat.
 * Tries known dictionary -> MyMemory API -> Gemini AI (if key provided).
 */
export async function translateToVietnamese(
  text: string,
  sourceLanguageCode?: string,
  geminiApiKey?: string
): Promise<string> {
  const clean = text.trim();
  if (!clean) return '';

  const cacheKey = `${sourceLanguageCode || 'auto'}_${clean}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  // 1. Direct match in local dictionary
  if (KNOWN_TRANSLATIONS[clean]) {
    const val = KNOWN_TRANSLATIONS[clean];
    translationCache.set(cacheKey, val);
    return val;
  }

  // 2. Identify source language code ('ko' or 'en')
  let langPair = 'en|vi';
  if (sourceLanguageCode?.toUpperCase() === 'KO') {
    langPair = 'ko|vi';
  } else if (sourceLanguageCode?.toUpperCase() === 'EN') {
    langPair = 'en|vi';
  } else {
    // Basic heuristic: check for Hangul characters
    const hasHangul = /[\uac00-\ud7af\u1100-\u11ff]/.test(clean);
    langPair = hasHangul ? 'ko|vi' : 'en|vi';
  }

  // 3. Call MyMemory public API
  try {
    const response = await axios.get(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(clean)}&langpair=${langPair}`,
      { timeout: 7000 }
    );

    const translatedText = response.data?.responseData?.translatedText;
    if (translatedText && typeof translatedText === 'string' && !translatedText.startsWith('MYMEMORY WARNING')) {
      const result = translatedText.trim();
      translationCache.set(cacheKey, result);
      return result;
    }
  } catch (err) {
    console.warn('MyMemory translation error:', err);
  }

  // 4. Fallback to Gemini 1.5 if user provided API key
  if (geminiApiKey) {
    try {
      const prompt = `Bạn là chuyên gia dịch thuật ngôn ngữ hội thoại tự nhiên sang tiếng Việt. Dịch câu ngắn sau sang tiếng Việt chuẩn văn cảnh giao tiếp thường ngày, chỉ trả về duy nhất câu đã dịch, không thêm giải thích hay dấu ngoặc kép: "${clean}"`;
      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
        },
        { timeout: 8000 }
      );
      const textOut = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (textOut && typeof textOut === 'string') {
        const result = textOut.trim().replace(/^["']|["']$/g, '');
        if (result) {
          translationCache.set(cacheKey, result);
          return result;
        }
      }
    } catch (geminiErr) {
      console.warn('Gemini translation fallback error:', geminiErr);
    }
  }

  // 5. Friendly fallback message
  return 'Không thể tải bản dịch vào lúc này (vui lòng kiểm tra kết nối mạng).';
}
