package com.linguatalk.config;

import com.linguatalk.domain.*;
import com.linguatalk.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final LanguageRepository languageRepository;
    private final TopicRepository topicRepository;
    private final LessonRepository lessonRepository;
    private final VocabularyRepository vocabularyRepository;
    private final GrammarRepository grammarRepository;
    private final DialogueRepository dialogueRepository;
    private final ExerciseRepository exerciseRepository;
    private final ConversationScenarioRepository scenarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already seeded. Skipping initial data seeding.");
            return;
        }

        log.info("Seeding LinguaTalk initial data...");

        // 1. Languages
        Language korean = Language.builder()
                .code("KO")
                .name("Korean")
                .nativeName("한국어")
                .flagEmoji("🇰🇷")
                .build();
        languageRepository.save(korean);

        Language english = Language.builder()
                .code("EN")
                .name("English")
                .nativeName("English")
                .flagEmoji("🇺🇸")
                .build();
        languageRepository.save(english);

        // 2. Users
        User learner = User.builder()
                .name("Thai Learner")
                .email("learner@linguatalk.com")
                .password(passwordEncoder.encode("password123"))
                .role(Role.ROLE_USER)
                .targetLanguage("KO")
                .targetLevel(ProficiencyLevel.BEGINNER)
                .streakCount(5)
                .dailyGoalMinutes(15)
                .lastStudyDate(LocalDate.now())
                .build();
        userRepository.save(learner);

        User admin = User.builder()
                .name("Lead Instructor Admin")
                .email("admin@linguatalk.com")
                .password(passwordEncoder.encode("admin123"))
                .role(Role.ROLE_ADMIN)
                .targetLanguage("EN")
                .targetLevel(ProficiencyLevel.ADVANCED)
                .streakCount(12)
                .dailyGoalMinutes(30)
                .lastStudyDate(LocalDate.now())
                .build();
        userRepository.save(admin);

        // 3. Korean Topics
        Topic koRestaurant = Topic.builder()
                .languageCode("KO")
                .levelCode("BEGINNER")
                .code("korean-restaurant")
                .name("Restaurant & Dining")
                .description("Order authentic dishes, ask for side dish refills, request the bill, and interact politely with restaurant staff.")
                .icon("Utensils")
                .estimatedMinutes(20)
                .orderIndex(1)
                .build();
        topicRepository.save(koRestaurant);

        Topic koGreetings = Topic.builder()
                .languageCode("KO")
                .levelCode("BEGINNER")
                .code("korean-greetings")
                .name("Greetings & Introductions")
                .description("Master honorific greetings, introduce your name and nationality, and make a warm first impression.")
                .icon("Hand")
                .estimatedMinutes(15)
                .orderIndex(2)
                .build();
        topicRepository.save(koGreetings);

        Topic koCafe = Topic.builder()
                .languageCode("KO")
                .levelCode("BEGINNER")
                .code("korean-cafe")
                .name("Cafe & Coffee Culture")
                .description("Navigate Seoul's famous cafe culture: hot vs iced (아아), desserts, takeout vs dining in.")
                .icon("Coffee")
                .estimatedMinutes(20)
                .orderIndex(3)
                .build();
        topicRepository.save(koCafe);

        Topic koTravel = Topic.builder()
                .languageCode("KO")
                .levelCode("ELEMENTARY")
                .code("korean-travel")
                .name("Subway & Asking Directions")
                .description("Navigate Seoul metro lines, ask locals for directions, transfer stations, and purchase tickets.")
                .icon("Compass")
                .estimatedMinutes(25)
                .orderIndex(4)
                .build();
        topicRepository.save(koTravel);

        // 4. English Topics
        Topic enCoffee = Topic.builder()
                .languageCode("EN")
                .levelCode("INTERMEDIATE")
                .code("english-cafe")
                .name("Specialty Coffee Shop")
                .description("Custom coffee orders, roasts, milk alternatives, and natural small talk with the barista.")
                .icon("Coffee")
                .estimatedMinutes(20)
                .orderIndex(1)
                .build();
        topicRepository.save(enCoffee);

        Topic enInterview = Topic.builder()
                .languageCode("EN")
                .levelCode("INTERMEDIATE")
                .code("english-interview")
                .name("Job Interview & Career")
                .description("Present your experience, answer behavioral questions, and ask insightful questions to the hiring manager.")
                .icon("Briefcase")
                .estimatedMinutes(30)
                .orderIndex(2)
                .build();
        topicRepository.save(enInterview);

        // 5. Complete Korean Lesson 1: Ordering at a Korean Restaurant
        Lesson koLesson1 = Lesson.builder()
                .topic(koRestaurant)
                .title("Ordering at a Korean Restaurant (식당에서 주문하기)")
                .scenario("You visit a traditional Korean stew restaurant in Hongdae. Order food, ask for water/side dish refills, and pay.")
                .description("Learn essential communication skills for dining in Korea: polite verb endings, calling staff, and asking for recommendations.")
                .difficulty(ProficiencyLevel.BEGINNER)
                .status(ContentStatus.PUBLISHED)
                .learningObjectives("1. Use '저기요' and '주세요' naturally.\n2. Apply the polite imperative -(으)세요.\n3. Request side dish refills and the bill gracefully.")
                .culturalNotes("In Korean dining, water and banchan (반찬) are complimentary. Look for the call bell (벨) on the side of the table. If there isn't one, make eye contact and say '저기요!' (Excuse me) or '사장님!' (Boss/Proprietor).")
                .formalityExplanation("This lesson focuses on Standard Polite Speech (해요체), which is universally respectful and appropriate for service interactions without being stiff.")
                .orderIndex(1)
                .build();
        koLesson1 = lessonRepository.save(koLesson1);

        // Vocabulary for Korean Lesson
        Vocabulary v1 = Vocabulary.builder()
                .lesson(koLesson1)
                .word("안녕하세요")
                .meaning("Hello / Good day / Good afternoon")
                .partOfSpeech("Expression")
                .pronunciationIpa("[aɲ.ɲʌŋ.ɦa.se.jo]")
                .exampleSentence("안녕하세요! 두 명 자리 있나요?")
                .translation("Hello! Do you have a table for two?")
                .difficulty("Beginner")
                .relatedWords("안녕 (informal), 안녕하십니까 (formal)")
                .collocations("안녕하세요, 반갑습니다 (Hello, nice to meet you)")
                .hangul("안녕하세요")
                .romanization("annyeonghaseyo")
                .batchimRules("ㅇ batchim in 안 / 녕 has soft nasal sound [ŋ]")
                .soundChanges("ㅎ in 하 is slightly aspirated or lenited in quick speech")
                .breakdownJson("{\"morphemes\": [{\"part\": \"안녕\", \"meaning\": \"peace/wellness\"}, {\"part\": \"하(다)\", \"meaning\": \"to do\"}, {\"part\": \"-세요\", \"meaning\": \"honorific polite ending\"}]}")
                .build();

        Vocabulary v2 = Vocabulary.builder()
                .lesson(koLesson1)
                .word("김치찌개")
                .meaning("Kimchi Stew (classic spicy Korean stew made with aged kimchi and pork/tofu)")
                .partOfSpeech("Noun")
                .pronunciationIpa("[kim.tɕʰi.tɕ͈i.ɡɛ]")
                .exampleSentence("저희 김치찌개 2인분 주세요.")
                .translation("Please give us two servings of kimchi stew.")
                .difficulty("Beginner")
                .relatedWords("된장찌개 (Soybean paste stew), 순두부찌개 (Soft tofu stew)")
                .collocations("김치찌개 1인분 (1 serving of kimchi stew), 김치찌개 맛집")
                .hangul("김치찌개")
                .romanization("gimchijjigae")
                .batchimRules("ㅁ batchim in 김 [m] followed by ㅊ")
                .soundChanges("Tense double consonant 찌 pronounced with crisp glottal tension")
                .breakdownJson("{\"morphemes\": [{\"part\": \"김치\", \"meaning\": \"traditional fermented kimchi\"}, {\"part\": \"찌개\", \"meaning\": \"stew / pot dish\"}]}")
                .build();

        Vocabulary v3 = Vocabulary.builder()
                .lesson(koLesson1)
                .word("주세요")
                .meaning("Please give me / Please bring me")
                .partOfSpeech("Verb phrase")
                .pronunciationIpa("[tɕu.se.jo]")
                .exampleSentence("물 좀 더 주세요.")
                .translation("Please give me some more water.")
                .difficulty("Beginner")
                .relatedWords("드리다 (humble giving), 주다 (plain to give)")
                .collocations("메뉴판 주세요 (Menu please), 영수증 주세요 (Receipt please)")
                .hangul("주세요")
                .romanization("juseyo")
                .batchimRules("Open vowels, smooth melodic intonation")
                .soundChanges("Standard polite pronunciation")
                .breakdownJson("{\"morphemes\": [{\"part\": \"주(다)\", \"meaning\": \"give\"}, {\"part\": \"-(으)시-\", \"meaning\": \"subject honorific\"}, {\"part\": \"-어/어요\", \"meaning\": \"polite speech style\"}]}")
                .build();

        Vocabulary v4 = Vocabulary.builder()
                .lesson(koLesson1)
                .word("저기요")
                .meaning("Excuse me! / Over here! (Used to call staff/attendants)")
                .partOfSpeech("Interjection")
                .pronunciationIpa("[tɕʌ.ɡi.jo]")
                .exampleSentence("저기요, 주문할게요!")
                .translation("Excuse me, we are ready to order!")
                .difficulty("Beginner")
                .relatedWords("여기요 (here), 사장님 (proprietor/boss), 이모님 (auntie)")
                .collocations("저기요, 주문받아 주세요")
                .hangul("저기요")
                .romanization("jeogiyo")
                .batchimRules("No final consonant batchim")
                .soundChanges("Direct clear vowel projection")
                .breakdownJson("{\"morphemes\": [{\"part\": \"저기\", \"meaning\": \"over there\"}, {\"part\": \"-요\", \"meaning\": \"polite marker\"}]}")
                .build();

        Vocabulary v5 = Vocabulary.builder()
                .lesson(koLesson1)
                .word("계산하다")
                .meaning("To pay / settle the bill / calculate")
                .partOfSpeech("Verb")
                .pronunciationIpa("[kʲeː.san.ɦa.da]")
                .exampleSentence("계산은 카드로 할게요.")
                .translation("I will pay by card.")
                .difficulty("Beginner")
                .relatedWords("결제 (settlement), 영수증 (receipt)")
                .collocations("계산서 (the bill), 계산해 주세요 (Please calculate the bill)")
                .hangul("계산하다")
                .romanization("gyesanhada")
                .batchimRules("ㄴ batchim in 산 pronounced as dental nasal [n]")
                .soundChanges("ㅎ in 하다 connects with 산 in fluent speech: [계사나다]")
                .breakdownJson("{\"morphemes\": [{\"part\": \"계산 (計算)\", \"meaning\": \"calculation / reckoning\"}, {\"part\": \"-하다\", \"meaning\": \"to do\"}]}")
                .build();

        vocabularyRepository.saveAll(List.of(v1, v2, v3, v4, v5));

        // Grammar for Korean Lesson
        Grammar g1 = Grammar.builder()
                .lesson(koLesson1)
                .grammarPoint("V + -(으)세요 (Polite Imperative / Courtesy Request)")
                .explanation("Used to politely request or instruct someone to take an action in daily social interactions.")
                .usageGuide("1. If verb stem ends in a vowel, attach -세요 (가다 -> 가세요).\n2. If verb stem ends in a consonant (batchim), attach -으세요 (앉다 -> 앉으세요).\n3. Irregular verbs: 듣다 -> 들으세요, 만들다 -> 만드세요.")
                .structureFormula("Verb Stem + -(으)세요")
                .commonMistakes("Do not use -(으)세요 to refer to actions you are doing yourself. It is strictly for addressing the listener.")
                .formalityLevel("존댓말 / 해요체 (Polite Informal Register)")
                .koreanPattern("V + -(으)세요")
                .exampleConversationsJson("[{\"speaker\": \"직원\", \"text\": \"편하신 자리에 앉으세요.\", \"translation\": \"Please sit in any comfortable seat.\"}, {\"speaker\": \"손님\", \"text\": \"네, 감사합니다.\", \"translation\": \"Yes, thank you.\"}]")
                .build();

        Grammar g2 = Grammar.builder()
                .lesson(koLesson1)
                .grammarPoint("N + (이)나 / 하고 (Listing items & requests)")
                .explanation("Used to connect nouns when ordering multiple items (e.g., A and B).")
                .usageGuide("Use '하고' for 'and' with nouns in casual and polite spoken Korean.")
                .structureFormula("Noun1 + 하고 + Noun2 + 주세요")
                .commonMistakes("Confusing '하고' (and) with '과/와' which is more common in formal writing.")
                .formalityLevel("해요체")
                .koreanPattern("N1 + 하고 + N2")
                .exampleConversationsJson("[{\"speaker\": \"손님\", \"text\": \"김치찌개 하나하고 콜라 하나 주세요.\", \"translation\": \"Please give me one kimchi stew and one cola.\"}]")
                .build();

        grammarRepository.saveAll(List.of(g1, g2));

        // Dialogue for Korean Lesson
        Dialogue koDialogue = Dialogue.builder()
                .lesson(koLesson1)
                .title("Dining at Hongdae Kimchi Jjigae (홍대 식당에서)")
                .contextDescription("A customer enters a bustling restaurant in Hongdae during lunchtime.")
                .userRole("손님 (Customer)")
                .partnerRole("직원 (Staff)")
                .build();
        koDialogue = dialogueRepository.save(koDialogue);

        DialogueLine dl1 = DialogueLine.builder()
                .dialogue(koDialogue)
                .speakerName("직원")
                .speakerRole("Staff")
                .textOriginal("어서오세요! 몇 분이세요?")
                .textRomanized("Eoseo-oseyo! Myeot bun-iseyo?")
                .textTranslation("Welcome! How many people in your party?")
                .orderIndex(1)
                .build();

        DialogueLine dl2 = DialogueLine.builder()
                .dialogue(koDialogue)
                .speakerName("손님")
                .speakerRole("Customer")
                .textOriginal("안녕하세요, 두 명이에요.")
                .textRomanized("Annyeonghaseyo, du myeong-ieyo.")
                .textTranslation("Hello, table for two please.")
                .orderIndex(2)
                .build();

        DialogueLine dl3 = DialogueLine.builder()
                .dialogue(koDialogue)
                .speakerName("직원")
                .speakerRole("Staff")
                .textOriginal("네, 안쪽 창가 자리에 앉으세요.")
                .textRomanized("Ne, anjjok changga jarie anjeuseyo.")
                .textTranslation("Yes, please sit at the inner window table.")
                .orderIndex(3)
                .build();

        DialogueLine dl4 = DialogueLine.builder()
                .dialogue(koDialogue)
                .speakerName("손님")
                .speakerRole("Customer")
                .textOriginal("저기요, 주문할게요! 김치찌개 2인분하고 라면 사리 하나 주세요.")
                .textRomanized("Jeogiyo, jumunhalgeyo! Gimchijjigae i-inbun-hago ramyeon sari hana juseyo.")
                .textTranslation("Excuse me, we are ready to order! Two servings of kimchi stew and one ramen noodle addition please.")
                .orderIndex(4)
                .build();

        DialogueLine dl5 = DialogueLine.builder()
                .dialogue(koDialogue)
                .speakerName("직원")
                .speakerRole("Staff")
                .textOriginal("네, 알겠습니다. 물과 반찬은 셀프바에서 이용하시면 됩니다.")
                .textRomanized("Ne, algetseumnida. Mul-gwa banchan-eun selpeu-ba-eseo iyonghasimyeon doemnida.")
                .textTranslation("Certainly. Water and side dishes are available at the self-service bar.")
                .orderIndex(5)
                .build();

        DialogueLine dl6 = DialogueLine.builder()
                .dialogue(koDialogue)
                .speakerName("손님")
                .speakerRole("Customer")
                .textOriginal("잘 먹었습니다! 사장님, 계산해 주세요.")
                .textRomanized("Jal meogeotseumnida! Sajangnim, gyesanhae juseyo.")
                .textTranslation("That was delicious! Boss, please bring the bill.")
                .orderIndex(6)
                .build();

        koDialogue.setLines(new java.util.ArrayList<>(List.of(dl1, dl2, dl3, dl4, dl5, dl6)));
        dialogueRepository.save(koDialogue);

        // Exercises for Korean Lesson
        Exercise koEx1 = Exercise.builder()
                .lesson(koLesson1)
                .title("Communication & Vocabulary Challenge")
                .type(ExerciseType.MULTIPLE_CHOICE)
                .build();
        koEx1 = exerciseRepository.save(koEx1);

        ExerciseQuestion kq1 = ExerciseQuestion.builder()
                .exercise(koEx1)
                .prompt("What is the most natural way to call a waiter in a Korean restaurant?")
                .optionsJson("[\"저기요!\", \"야!\", \"이봐!\", \"너!\"]")
                .correctAnswer("저기요!")
                .explanation("'저기요' (Excuse me) is polite, friendly, and universally accepted in restaurants.")
                .orderIndex(1)
                .build();

        ExerciseQuestion kq2 = ExerciseQuestion.builder()
                .exercise(koEx1)
                .prompt("How do you correctly conjugate '앉다' (to sit) with the polite imperative -(으)세요?")
                .optionsJson("[\"앉으세요\", \"앉세요\", \"앉아요\", \"앉아라\"]")
                .correctAnswer("앉으세요")
                .explanation("Since '앉다' has a batchim (ㄵ), attach -으세요 to form '앉으세요'.")
                .orderIndex(2)
                .build();

        ExerciseQuestion kq3 = ExerciseQuestion.builder()
                .exercise(koEx1)
                .prompt("Rearrange the tokens into a natural sentence: [주세요] [하나] [김치찌개]")
                .optionsJson("[\"김치찌개 하나 주세요\", \"주세요 하나 김치찌개\", \"하나 주세요 김치찌개\", \"김치찌개 주세요 하나\"]")
                .correctAnswer("김치찌개 하나 주세요")
                .explanation("Standard Korean word order: [Item] + [Quantity] + [주세요].")
                .orderIndex(3)
                .build();

        koEx1.setQuestions(new java.util.ArrayList<>(List.of(kq1, kq2, kq3)));
        exerciseRepository.save(koEx1);

        // Conversation Scenario for Korean Lesson
        ConversationScenario koScenario = ConversationScenario.builder()
                .lesson(koLesson1)
                .topicCode("korean-restaurant")
                .languageCode("KO")
                .levelCode("BEGINNER")
                .title("Ordering at a Korean Restaurant")
                .description("Interactive AI Roleplay: Practice ordering food, asking for recommendations, and asking for the bill.")
                .userRole("손님 (Customer)")
                .aiRole("직원 (Waiter)")
                .systemPrompt("You are a friendly Korean waiter at a lively stew restaurant. Welcome the customer, take their order politely in standard 존댓말, answer questions about dishes, and handle the bill.")
                .initialGreeting("어서오세요! 몇 분이세요? 편하신 자리로 앉으세요.")
                .culturalContext("Use standard polite informal ending (-요). Remember to offer recommendations if asked!")
                .build();
        scenarioRepository.save(koScenario);

        // 6. Complete English Lesson 1: Specialty Coffee Shop
        Lesson enLesson1 = Lesson.builder()
                .topic(enCoffee)
                .title("Ordering at a Specialty Coffee Shop")
                .scenario("You visit an artisan third-wave cafe. Order a customized beverage, inquire about bean roast profiles, and pay with contactless card.")
                .description("Master nuanced, polite conversational English for modern coffee establishments and casual customer service interactions.")
                .difficulty(ProficiencyLevel.INTERMEDIATE)
                .status(ContentStatus.PUBLISHED)
                .learningObjectives("1. Use polite modals ('Could I get...', 'Would it be possible...').\n2. Discuss roast profiles (fruity, chocolatey, single-origin).\n3. Navigate takeaway options and payment smoothly.")
                .culturalNotes("Specialty cafes pride themselves on customization. Baristas welcome questions regarding origin and flavor profiles. Tipping 15-20% is customary in North American cafes when paying by card terminal.")
                .formalityExplanation("Uses friendly polite conversational register (polite hedging with 'could' and 'please', contractions like 'I'd like').")
                .orderIndex(1)
                .build();
        enLesson1 = lessonRepository.save(enLesson1);

        // Vocabulary for English Lesson
        Vocabulary ev1 = Vocabulary.builder()
                .lesson(enLesson1)
                .word("single-origin")
                .meaning("Coffee beans sourced exclusively from one single producer, crop, or geographic region")
                .partOfSpeech("Adjective")
                .pronunciationIpa("/ˌsɪŋ.ɡəl ˈɔːr.ɪ.dʒɪn/")
                .exampleSentence("What single-origin beans do you have on pour-over today?")
                .translation("Hôm nay quán có loại hạt cà phê đơn nguồn gốc nào cho pha pour-over vậy?")
                .difficulty("Intermediate")
                .relatedWords("blend, micro-lot, terroir")
                .collocations("single-origin espresso, single-origin roast")
                .build();

        Vocabulary ev2 = Vocabulary.builder()
                .lesson(enLesson1)
                .word("oat milk")
                .meaning("A creamy dairy milk substitute made from whole oat grains")
                .partOfSpeech("Noun phrase")
                .pronunciationIpa("/ˈoʊt ˌmɪlk/")
                .exampleSentence("Could I get an iced latte with oat milk instead of whole milk?")
                .translation("Tôi có thể lấy một ly latte đá với sữa yến mạch thay vì sữa tươi không?")
                .difficulty("Beginner")
                .relatedWords("almond milk, soy milk, dairy-free")
                .collocations("substitute oat milk, oat milk flat white")
                .build();

        Vocabulary ev3 = Vocabulary.builder()
                .lesson(enLesson1)
                .word("for here or to go")
                .meaning("Standard inquiry by cashiers asking whether you will consume on premise or take away")
                .partOfSpeech("Idiomatic phrase")
                .pronunciationIpa("/fɔːr hɪr ɔːr tuː ɡoʊ/")
                .exampleSentence("Will that be for here or to go today?")
                .translation("Bạn dùng ở đây hay mang đi ạ?")
                .difficulty("Beginner")
                .relatedWords("dine-in, takeaway, take-out")
                .collocations("make that to go, drink for here")
                .build();

        Vocabulary ev4 = Vocabulary.builder()
                .lesson(enLesson1)
                .word("roast profile")
                .meaning("The degree to which coffee beans are roasted (light, medium, dark) determining flavor notes")
                .partOfSpeech("Noun phrase")
                .pronunciationIpa("/roʊst ˈproʊfaɪl/")
                .exampleSentence("Do you prefer a lighter, fruity roast profile or something darker and chocolatey?")
                .translation("Bạn thích vị rang sáng, hương hoa quả hay đậm đà, vị sô-cô-la hơn?")
                .difficulty("Intermediate")
                .relatedWords("light roast, dark roast, acidity")
                .collocations("balanced roast profile, medium roast")
                .build();

        vocabularyRepository.saveAll(List.of(ev1, ev2, ev3, ev4));

        // Grammar for English Lesson
        Grammar eg1 = Grammar.builder()
                .lesson(enLesson1)
                .grammarPoint("Polite Modal Requests: Could I please get / I'd like")
                .explanation("In English customer service encounters, direct imperatives like 'Give me a coffee' sound rude and blunt. Native speakers use modal verbs ('could', 'would') and soft conditional structures.")
                .usageGuide("1. 'Could I please get + [item]?'\n2. 'I would like to have + [item], please.'\n3. 'Would it be possible to get + [customization]?'")
                .structureFormula("Could I (please) get + [Size] + [Item] + with [Customization], please?")
                .commonMistakes("Avoid 'Give me' or 'I want'. Always include 'please' and soften the request.")
                .formalityLevel("Polite Casual Register")
                .exampleConversationsJson("[{\"speaker\": \"Customer\", \"text\": \"Could I get a medium flat white with oat milk, please?\", \"translation\": \"Tôi có thể lấy một ly flat white vừa với sữa yến mạch được không?\"}, {\"speaker\": \"Barista\", \"text\": \"Certainly! Would you like that for here or to go?\", \"translation\": \"Chắc chắn rồi! Bạn dùng ở đây hay mang về?\"}]")
                .build();

        grammarRepository.save(eg1);

        // Dialogue for English Lesson
        Dialogue enDialogue = Dialogue.builder()
                .lesson(enLesson1)
                .title("Ordering at Craft Coffee Co.")
                .contextDescription("A customer steps up to the counter at a modern specialty coffee counter.")
                .userRole("Customer")
                .partnerRole("Barista")
                .build();
        enDialogue = dialogueRepository.save(enDialogue);

        DialogueLine ed1 = DialogueLine.builder()
                .dialogue(enDialogue)
                .speakerName("Barista")
                .speakerRole("Barista")
                .textOriginal("Good morning! What can I craft for you today?")
                .textTranslation("Chào buổi sáng! Hôm nay tôi có thể pha chế món gì cho bạn?")
                .orderIndex(1)
                .build();

        DialogueLine ed2 = DialogueLine.builder()
                .dialogue(enDialogue)
                .speakerName("Customer")
                .speakerRole("Customer")
                .textOriginal("Hi! Could I please get an iced oat latte with an extra shot of espresso?")
                .textTranslation("Chào bạn! Cho mình một ly latte yến mạch đá thêm một shot espresso nhé?")
                .orderIndex(2)
                .build();

        DialogueLine ed3 = DialogueLine.builder()
                .dialogue(enDialogue)
                .speakerName("Barista")
                .speakerRole("Barista")
                .textOriginal("You got it! Would you prefer our house chocolate blend or the Ethiopian floral single-origin?")
                .textTranslation("Được ngay! Bạn thích blend sô-cô-la truyền thống hay loại hạt đơn nguồn gốc Ethiopia hương hoa?")
                .orderIndex(3)
                .build();

        DialogueLine ed4 = DialogueLine.builder()
                .dialogue(enDialogue)
                .speakerName("Customer")
                .speakerRole("Customer")
                .textOriginal("Let's go with the Ethiopian single-origin, please! Also, make that to go.")
                .textTranslation("Cho mình hạt Ethiopia nhé! Và cho mình mang đi.")
                .orderIndex(4)
                .build();

        DialogueLine ed5 = DialogueLine.builder()
                .dialogue(enDialogue)
                .speakerName("Barista")
                .speakerRole("Barista")
                .textOriginal("Sounds great. That'll be $6.50. You can tap your card whenever you're ready.")
                .textTranslation("Tuyệt vời. Tổng cộng là $6.50. Bạn có thể chạm thẻ bất cứ khi nào sẵn sàng.")
                .orderIndex(5)
                .build();

        enDialogue.setLines(new java.util.ArrayList<>(List.of(ed1, ed2, ed3, ed4, ed5)));
        dialogueRepository.save(enDialogue);

        // Exercises for English Lesson
        Exercise enEx1 = Exercise.builder()
                .lesson(enLesson1)
                .title("Polite Request & Idiom Quiz")
                .type(ExerciseType.MULTIPLE_CHOICE)
                .build();
        enEx1 = exerciseRepository.save(enEx1);

        ExerciseQuestion eq1 = ExerciseQuestion.builder()
                .exercise(enEx1)
                .prompt("Which phrasing sounds most natural and polite when ordering?")
                .optionsJson("[\"Could I please get an oat latte?\", \"Give me an oat latte now.\", \"I demand an oat latte.\", \"Oat latte bring.\"]")
                .correctAnswer("Could I please get an oat latte?")
                .explanation("'Could I please get...' is courteous and standard in modern spoken English.")
                .orderIndex(1)
                .build();

        ExerciseQuestion eq2 = ExerciseQuestion.builder()
                .exercise(enEx1)
                .prompt("What does 'single-origin' indicate about coffee beans?")
                .optionsJson("[\"Sourced from one specific farm or region\", \"Mixed with instant powder\", \"Brewed with milk\", \"Decaffeinated\"]")
                .correctAnswer("Sourced from one specific farm or region")
                .explanation("Single-origin coffee comes from a distinct grower, crop, or locale, giving it unique terroir.")
                .orderIndex(2)
                .build();

        enEx1.setQuestions(new java.util.ArrayList<>(List.of(eq1, eq2)));
        exerciseRepository.save(enEx1);

        // Conversation Scenario for English
        ConversationScenario enScenario = ConversationScenario.builder()
                .lesson(enLesson1)
                .topicCode("english-cafe")
                .languageCode("EN")
                .levelCode("INTERMEDIATE")
                .title("Specialty Coffee Order")
                .description("Interactive AI Roleplay: Practice ordering your ideal beverage, customizing milk, and paying.")
                .userRole("Customer")
                .aiRole("Barista")
                .systemPrompt("You are an enthusiastic barista at Craft Coffee Co. Ask friendly questions, suggest options when inquired, clarify for-here or to-go, and handle payment.")
                .initialGreeting("Hey there! Welcome to Craft Coffee. What can I get started for you today?")
                .culturalContext("Natural colloquial English. Friendly and supportive.")
                .build();
        scenarioRepository.save(enScenario);

        log.info("LinguaTalk database successfully seeded with Korean & English curricula!");
    }
}
