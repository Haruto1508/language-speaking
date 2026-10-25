package com.linguatalk.ai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.linguatalk.domain.*;
import com.linguatalk.dto.AdminDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RuleBasedEducationalAiService implements AiService {

    private final ObjectMapper objectMapper;

    @Override
    public Lesson generateLesson(Topic topic, AdminDto.GenerateLessonRequest request) {
        log.info("Generating AI lesson for topic: {}, title: {}", topic.getName(), request.getTitle());

        boolean isKorean = "KO".equalsIgnoreCase(topic.getLanguageCode());

        Lesson lesson = Lesson.builder()
                .topic(topic)
                .title(request.getTitle())
                .scenario(request.getScenario())
                .description("AI-generated curriculum focusing on: " + request.getScenario())
                .difficulty(request.getDifficulty())
                .status(ContentStatus.AI_GENERATED)
                .learningObjectives(request.getLearningObjectives() != null ? request.getLearningObjectives() :
                        "Master essential phrases, expressions, and grammar for " + request.getScenario())
                .culturalNotes(isKorean ?
                        "In Korean culture, polite speech (존댓말) is essential when addressing staff or strangers." :
                        "In English-speaking culture, polite qualifiers ('could I have', 'please') establish courteous rapport.")
                .formalityExplanation(isKorean ?
                        "Utilizes standard polite informal style (-아/어요) and honorific request ending (-(으)세요)." :
                        "Uses polite professional register with modal verbs (would, could, please).")
                .orderIndex(topic.getLessons().size() + 1)
                .build();

        // 1. Generate Target Vocabulary
        List<Vocabulary> vocabList = new ArrayList<>();
        if (isKorean) {
            vocabList.add(Vocabulary.builder()
                    .lesson(lesson)
                    .word("주문하다")
                    .meaning("To order (food, items)")
                    .partOfSpeech("Verb")
                    .pronunciationIpa("[주문하다 / jumunhada]")
                    .exampleSentence("주문하시겠어요?")
                    .translation("Would you like to order?")
                    .difficulty("Beginner")
                    .relatedWords("주문 (order), 계산 (bill)")
                    .collocations("주문을 받다 (take order), 주문을 하다 (place order)")
                    .hangul("주문하다")
                    .romanization("jumunhada")
                    .batchimRules("No irregular batchim sound changes")
                    .soundChanges("Standard pronunciation")
                    .breakdownJson("{\"base\": \"주문\", \"affix\": \"하다\", \"meaning\": \"order + do\"}")
                    .build());

            vocabList.add(Vocabulary.builder()
                    .lesson(lesson)
                    .word("메뉴판")
                    .meaning("Menu / Menu board")
                    .partOfSpeech("Noun")
                    .pronunciationIpa("[메뉴판 / menyupan]")
                    .exampleSentence("메뉴판 좀 보여주세요.")
                    .translation("Please show me the menu.")
                    .difficulty("Beginner")
                    .relatedWords("식단, 가격표")
                    .collocations("메뉴판을 보다 (look at menu)")
                    .hangul("메뉴판")
                    .romanization("menyupan")
                    .batchimRules("ㄴ batchim in 판 followed by pause")
                    .soundChanges("Standard nasal pronunciation")
                    .breakdownJson("{\"components\": [\"메뉴 (menu)\", \"판 (board)\"]}")
                    .build());

            vocabList.add(Vocabulary.builder()
                    .lesson(lesson)
                    .word("추천하다")
                    .meaning("To recommend")
                    .partOfSpeech("Verb")
                    .pronunciationIpa("[추천하다 / chucheonhada]")
                    .exampleSentence("여기서 제일 인기 있는 메뉴 추천해 주세요.")
                    .translation("Please recommend the most popular menu item here.")
                    .difficulty("Elementary")
                    .relatedWords("인기, 추천")
                    .collocations("메뉴를 추천하다")
                    .hangul("추천하다")
                    .romanization("chucheonhada")
                    .batchimRules("ㄴ sound ending")
                    .soundChanges("No sound shift")
                    .breakdownJson("{\"root\": \"추천 (recommendation)\", \"verb\": \"하다 (do)\"}")
                    .build());
        } else {
            vocabList.add(Vocabulary.builder()
                    .lesson(lesson)
                    .word("recommendation")
                    .meaning("A suggestion or proposal as to the best course of action")
                    .partOfSpeech("Noun")
                    .pronunciationIpa("/ˌrɛkəmɛnˈdeɪʃən/")
                    .exampleSentence("Do you have any recommendations for today's special?")
                    .translation("Bạn có gợi ý món đặc biệt nào cho hôm nay không?")
                    .difficulty("Intermediate")
                    .relatedWords("suggest, proposal, advise")
                    .collocations("make a recommendation, highly recommended")
                    .build());

            vocabList.add(Vocabulary.builder()
                    .lesson(lesson)
                    .word("reservation")
                    .meaning("An arrangement where something is booked in advance")
                    .partOfSpeech("Noun")
                    .pronunciationIpa("/ˌrɛzərˈveɪʃən/")
                    .exampleSentence("I would like to make a table reservation for two at 7 PM.")
                    .translation("Tôi muốn đặt bàn cho 2 người lúc 7 giờ tối.")
                    .difficulty("Intermediate")
                    .relatedWords("booking, reserve, appointment")
                    .collocations("make a reservation, confirm a reservation, under the name")
                    .build());
        }
        lesson.setVocabularyList(vocabList);

        // 2. Generate Grammar
        List<Grammar> grammarList = new ArrayList<>();
        if (isKorean) {
            grammarList.add(Grammar.builder()
                    .lesson(lesson)
                    .grammarPoint("-(으)세요 (Polite imperative / request)")
                    .explanation("Used to politely ask someone to do something or give courteous instructions.")
                    .usageGuide("Attached to verb stems. Add -세요 after vowel stems, -으세요 after consonant stems.")
                    .structureFormula("Verb Stem + -(으)세요 (가다 -> 가세요, 앉다 -> 앉으세요)")
                    .commonMistakes("Confusing with informal -아/어 or overly stiff -하십시오.")
                    .formalityLevel("해요체 (Standard Polite)")
                    .koreanPattern("V + -(으)세요")
                    .exampleConversationsJson("[{\"speakerA\": \"여기 앉으세요.\", \"speakerB\": \"감사합니다.\"}]")
                    .build());
        } else {
            grammarList.add(Grammar.builder()
                    .lesson(lesson)
                    .grammarPoint("Polite Requests: Would you mind / Could I possibly")
                    .explanation("Used in formal and professional contexts to request services or permissions gracefully.")
                    .usageGuide("Use 'Could I have + noun' or 'Would you mind + Gerund (V-ing)'.")
                    .structureFormula("Could I have + [Noun] please? / Would you mind + [V-ing]?")
                    .commonMistakes("Responding 'Yes' to 'Would you mind' when you mean 'Sure, I will do it'.")
                    .formalityLevel("Polite Professional Register")
                    .exampleConversationsJson("[{\"speakerA\": \"Could I have the check, please?\", \"speakerB\": \"Certainly, right away.\"}]")
                    .build());
        }
        lesson.setGrammarList(grammarList);

        // 3. Generate Dialogue
        Dialogue dialogue = Dialogue.builder()
                .lesson(lesson)
                .title(request.getScenario() + " - Roleplay Dialogue")
                .contextDescription("Authentic situational practice: " + request.getScenario())
                .userRole(isKorean ? "손님 (Customer)" : "Guest / Customer")
                .partnerRole(isKorean ? "직원 (Staff / Host)" : "Staff / Associate")
                .build();

        List<DialogueLine> lines = new ArrayList<>();
        if (isKorean) {
            lines.add(DialogueLine.builder()
                    .dialogue(dialogue)
                    .speakerName("직원")
                    .speakerRole("Staff")
                    .textOriginal("어서오세요! 몇 분이세요?")
                    .textRomanized("Eoseo-oseyo! Myeot bun-iseyo?")
                    .textTranslation("Welcome! How many people in your party?")
                    .orderIndex(1)
                    .build());
            lines.add(DialogueLine.builder()
                    .dialogue(dialogue)
                    .speakerName("손님")
                    .speakerRole("Customer")
                    .textOriginal("두 명이에요. 창가 자리 있나요?")
                    .textRomanized("Du myeong-ieyo. Chang-ga jari innayo?")
                    .textTranslation("Two people. Do you have a window seat?")
                    .orderIndex(2)
                    .build());
            lines.add(DialogueLine.builder()
                    .dialogue(dialogue)
                    .speakerName("직원")
                    .speakerRole("Staff")
                    .textOriginal("네, 이쪽으로 편하게 앉으세요.")
                    .textRomanized("Ne, i-jjog-euro pyeonhage anjeuseyo.")
                    .textTranslation("Yes, please have a comfortable seat right this way.")
                    .orderIndex(3)
                    .build());
        } else {
            lines.add(DialogueLine.builder()
                    .dialogue(dialogue)
                    .speakerName("Staff")
                    .speakerRole("Staff")
                    .textOriginal("Good afternoon! How can I help you today?")
                    .textTranslation("Xin chào! Tôi có thể giúp gì cho bạn hôm nay?")
                    .orderIndex(1)
                    .build());
            lines.add(DialogueLine.builder()
                    .dialogue(dialogue)
                    .speakerName("Customer")
                    .speakerRole("Customer")
                    .textOriginal("Hi, could I see the menu, please?")
                    .textTranslation("Xin chào, tôi có thể xem thực đơn được không?")
                    .orderIndex(2)
                    .build());
        }
        dialogue.setLines(lines);
        lesson.setDialogues(List.of(dialogue));

        // 4. Generate Exercises
        Exercise mcq = Exercise.builder()
                .lesson(lesson)
                .title("Comprehension & Vocabulary Check")
                .type(ExerciseType.MULTIPLE_CHOICE)
                .build();

        List<ExerciseQuestion> qList = new ArrayList<>();
        if (isKorean) {
            qList.add(ExerciseQuestion.builder()
                    .exercise(mcq)
                    .prompt("Which phrase politely asks someone to sit down?")
                    .optionsJson("[\"여기 앉으세요\", \"여기 가지 마세요\", \"여기 먹으세요\", \"여기 일어나세요\"]")
                    .correctAnswer("여기 앉으세요")
                    .explanation("앉다 (to sit) + 으세요 creates the polite request '앉으세요'.")
                    .orderIndex(1)
                    .build());
        } else {
            qList.add(ExerciseQuestion.builder()
                    .exercise(mcq)
                    .prompt("What is the most polite way to ask for the bill?")
                    .optionsJson("[\"Give me the check.\", \"Could I please have the check?\", \"Check now!\", \"Bill here.\"]")
                    .correctAnswer("Could I please have the check?")
                    .explanation("'Could I please have...' uses modal hedging to express polite formality.")
                    .orderIndex(1)
                    .build());
        }
        mcq.setQuestions(qList);
        lesson.setExercises(List.of(mcq));

        // 5. Generate Conversation Scenario
        ConversationScenario scenario = ConversationScenario.builder()
                .lesson(lesson)
                .topicCode(topic.getCode())
                .languageCode(topic.getLanguageCode())
                .levelCode(topic.getLevelCode())
                .title(request.getTitle() + " - AI Roleplay")
                .description("Practice interacting live in: " + request.getScenario())
                .userRole(isKorean ? "Customer" : "Client")
                .aiRole(isKorean ? "Staff" : "Representative")
                .initialGreeting(isKorean ? "어서오세요! 무엇을 도와드릴까요?" : "Hello! Welcome, how may I assist you today?")
                .culturalContext(isKorean ? "Remember to use polite endings like -요 or -습니다." : "Polite phrasing is appreciated.")
                .build();
        lesson.setScenarios(List.of(scenario));

        return lesson;
    }

    @Override
    public ConversationReply generateConversationResponse(ConversationSession session, String userMessage) {
        String lang = session.getScenario().getLanguageCode();
        String aiRole = session.getScenario().getAiRole();
        String msgLower = userMessage.toLowerCase().trim();

        if ("KO".equalsIgnoreCase(lang)) {
            if (msgLower.contains("메뉴") || msgLower.contains("추천")) {
                return new ConversationReply(
                        "네, 저희 가게의 시그니처 메뉴인 김치찌개와 불고기 정식을 추천해 드립니다! 어느 것으로 하시겠어요?",
                        "좋은 표현이에요! '메뉴 추천해 주세요'는 아주 자연스러운 질문입니다.",
                        "저희 가게 대표 메뉴 추천해 주실 수 있나요?"
                );
            } else if (msgLower.contains("주세요") || msgLower.contains("하나") || msgLower.contains("개")) {
                return new ConversationReply(
                        "네, 알겠습니다. 주문하신 메뉴 바로 준비해 드리겠습니다. 음료는 따로 필요 없으신가요?",
                        "주문하실 때 '수량 + 주세요' 패턴을 정확하게 사용하셨습니다.",
                        "네, 김치찌개 1인분 부탁드립니다."
                );
            } else if (msgLower.contains("계산") || msgLower.contains("얼마") || msgLower.contains("카드")) {
                return new ConversationReply(
                        "총 만 오천 원입니다. 카드 결제는 앞쪽 단말기에 꽂아주시면 됩니다!",
                        "계산 요청 시 '계산해 주세요' 또는 '얼마인가요?'가 적절합니다.",
                        "계산 도와주시겠어요?"
                );
            } else {
                return new ConversationReply(
                        "네, 손님! 말씀하신 내용 잘 들었습니다. 다른 필요한 부분 있으시면 언제든 말씀해 주세요.",
                        "문장이 자연스럽습니다. 존댓말 어미(-요 / -ㅂ니다)를 유지해 보세요.",
                        "네, 감사합니다."
                );
            }
        } else {
            // English conversation logic
            if (msgLower.contains("recommend") || msgLower.contains("special") || msgLower.contains("menu")) {
                return new ConversationReply(
                        "I highly recommend our chef's grilled salmon or the roasted prime rib. Both are exceptional today!",
                        "Excellent use of vocabulary for inquiring about dishes.",
                        "What do you recommend from today's specials?"
                );
            } else if (msgLower.contains("have") || msgLower.contains("order") || msgLower.contains("like")) {
                return new ConversationReply(
                        "Splendid choice! Would you like that with any side orders or drinks to start?",
                        "Polite phrasing. Using 'I would like...' is courteous and standard.",
                        "I'll have the salmon with steamed vegetables, please."
                );
            } else if (msgLower.contains("check") || msgLower.contains("bill") || msgLower.contains("pay")) {
                return new ConversationReply(
                        "Here is your check. There is no rush, you can pay whenever you are ready.",
                        "Clear and polite request for payment.",
                        "Could we have the check whenever you get a moment, please?"
                );
            } else {
                return new ConversationReply(
                        "Understood! Let me know if you need anything else, I will be right here.",
                        "Good communication flow. Keep your answers concise and engaging.",
                        "Thank you, that sounds wonderful."
                );
            }
        }
    }

    @Override
    public ConversationAnalysis analyzeConversation(ConversationSession session) {
        boolean isKorean = "KO".equalsIgnoreCase(session.getScenario().getLanguageCode());

        int fluency = 88;
        int grammar = 92;
        int vocab = 85;
        int overall = (fluency + grammar + vocab) / 3;

        List<String> grammarMistakes = new ArrayList<>();
        List<String> vocabMistakes = new ArrayList<>();
        List<String> naturalExpressions = new ArrayList<>();
        List<String> usefulVocabulary = new ArrayList<>();
        List<String> alternativeSentences = new ArrayList<>();

        if (isKorean) {
            grammarMistakes.add("조사 생략: '김치찌개 주세요'보다는 '김치찌개 하나 주세요'처럼 수량 단위를 붙이면 더 정확합니다.");
            vocabMistakes.add("'빌(bill)' 대신 '계산서' 또는 '영수증'을 사용하는 것이 한국어 환경에서 더 명확합니다.");
            naturalExpressions.add("주문할 때: '저기요, 주문할게요!' 대신 '사장님, 주문 도와주세요~'");
            naturalExpressions.add("계산할 때: '계산해 주세요' 또는 '카드로 계산할게요'");
            usefulVocabulary.addAll(List.of("1인분 (one serving)", "덜 맵게 (less spicy)", "반찬 리필 (side dish refill)", "포장 (takeout)"));
            alternativeSentences.add("창가 자리로 부탁드려도 될까요? (Could we please have a window seat?)");
            alternativeSentences.add("영수증은 버려주셔도 돼요. (You can discard the receipt.)");
        } else {
            grammarMistakes.add("Watch preposition usage: 'order on menu' -> 'order from the menu'.");
            vocabMistakes.add("Prefer 'Could I have' rather than 'Give me' to avoid sounding abrupt.");
            naturalExpressions.add("'Could I get this to go, please?' for takeout requests.");
            naturalExpressions.add("'We are ready to order whenever you are.'");
            usefulVocabulary.addAll(List.of("Complimentary", "Appetizer", "Special of the day", "Split the bill"));
            alternativeSentences.add("Do you have any dairy-free options available?");
            alternativeSentences.add("We'll take the check whenever you're ready.");
        }

        return new ConversationAnalysis(
                overall,
                fluency,
                grammar,
                vocab,
                "Great conversation! You demonstrated good situational awareness and effectively carried out the communication goal.",
                grammarMistakes,
                vocabMistakes,
                naturalExpressions,
                usefulVocabulary,
                alternativeSentences
        );
    }
}
