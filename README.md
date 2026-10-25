# LinguaTalk: Communication-First Language Practice Platform (Korean & English)

**LinguaTalk** is a full-stack language learning and communication practice platform designed to develop authentic spoken fluency and real-world conversational competence in **English** and **Korean**.

Unlike conventional platforms focusing solely on isolated vocabulary drills, LinguaTalk structures the learning journey around **situational communication scenarios** (dining, cafes, directions, travel, interviews, and business meetings) with comprehensive phonetics, grammar, listening, interactive pronunciation evaluation, and turn-by-turn AI conversations.

---

## 🚀 Key Features

### 1. Communication-First Methodology
- **Learn ➔ Understand ➔ Practice ➔ Pronounce ➔ Communicate ➔ Review**
- Every vocabulary item is taught with real-world collocations, example sentences, audio pronunciation, and interactive usage.

### 2. Korean-Specific Educational Depth
- **Hangul Morpheme Breakdown**: Deconstructs phrases into living components (e.g. `안녕하세요` = `안녕` [wellness] + `하(다)` [to do] + `-세요` [polite imperative request]).
- **Phonetic & Batchim Rules**: Explains nasalization, tensification, and smooth connected speech (e.g. `[aɲ.ɲʌŋ.ɦa.se.jo]`).
- **Formality Levels & Speech Styles**: Standard Polite (`해요체`), Formal Polite (`하십시오체`), and Casual (`반말`).

### 3. English-Specific Educational Depth
- **IPA & Natural Prosody**: Pronunciation guides, stress, and rhythm.
- **Polite Modal Hedging**: Softening customer service inquiries (`Could I please get...` vs direct commands).
- **Phrasal Verbs & Collocations**: Natural native phrasing for cafes, workplaces, and interviews.

### 4. 8-Pillar Structured Lesson Experience
Each lesson features dedicated interactive tabs:
1. **Target Vocabulary**: Word cards with native audio, meanings, collocations, and Hangul breakdowns.
2. **Grammar & Sentence Patterns**: Formulas, usage guidelines, and common pitfalls to avoid.
3. **Multi-Speaker Authentic Dialogue**: Line-by-line speaker roles, romanizations, and full conversation audio playback.
4. **Interactive Pronunciation Trainer**: Real-time microphone recording and Web Speech API speech recognition with similarity percentage scoring.
5. **Interactive Exercises**: Quizzes (Multiple choice, sentence ordering, fill-in-the-blank) with immediate educational explanations.
6. **AI Conversation Partner**: Launch directly into roleplay matching the lesson's communicative scenario.

### 5. Turn-by-Turn AI Conversation Partner
- **Realistic Roleplay**: Scenarios such as *Customer ↔ Waiter* in a Korean restaurant or *Candidate ↔ Hiring Manager* in a technical interview.
- **Instant Coach Notes**: Provides real-time gentle grammar tips and suggested alternative native sentences.
- **Post-Conversation Analysis**:
  - Fluency Score, Grammar Score, Vocabulary Score, and Overall Score (0–100).
  - Detailed grammar mistake breakdowns.
  - Native natural expressions and substitutions.
  - Curated vocabulary list for scenario mastery.

### 6. Spaced Repetition System (SM-2)
- Tracks vocabulary across 4 stages: `NEW`, `LEARNING`, `REVIEW`, and `MASTERED`.
- "Review 10 Words Today" queue prioritizing items frequently answered incorrectly.
- Interactive flashcards with flip animations and 4 confidence grading options: *Again*, *Hard*, *Good*, *Easy*.

### 7. AI Curriculum Generation & Content Ingestion Pipeline
- **AI Lesson Generator**: Input a topic and scenario to synthesize full lessons with vocabulary, grammar, dialogues, and exercises following educational guidelines.
- **Source Ingestion Pipeline**: Ingests textbook excerpts and syllabi through:
  `Educational Source ➔ Parser ➔ AI Content Processor ➔ Schema Validation ➔ Structured Database`.
- **Admin Workflow**: State lifecycle (`DRAFT`, `AI_GENERATED`, `REVIEWING`, `APPROVED`, `PUBLISHED`, `ARCHIVED`).

---

## 🛠️ Architecture & Technology Stack

### Backend
- **Language & Runtime**: Java 21 LTS
- **Framework**: Spring Boot 3.3.4
- **Persistence**: Spring Data JPA & Hibernate
- **Database**: H2 (In-Memory PostgreSQL mode for frictionless dev) + PostgreSQL configuration with Flyway migrations (`db/migration/V1__init_schema.sql`)
- **Security**: Spring Security 6 with stateless JWT Bearer token authentication (JJWT 0.12.5)
- **AI Service Layer**: Clean abstraction (`AiService`, `PromptBuilder`, `PromptTemplate`) with `RuleBasedEducationalAiService` and LLM provider extensibility
- **Clean Architecture**: `config`, `controller`, `service`, `repository`, `domain`, `dto`, `mapper`, `exception`, `ai`, `security`

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **UI Components**: Ant Design 5 (Luxury Dark Educational Theme) + Lucide React Icons
- **State Management**: Zustand
- **HTTP Client**: Axios with JWT interceptors
- **Audio & Speech**: Web Speech API (TTS & SpeechRecognition for pronunciation scoring)
- **Visuals & Polish**: Glassmorphism, smooth gradients, animated flame streak counter, Canvas Confetti celebrations

---

## 🏃 Getting Started

### 1. Prerequisites
- **Java 21**
- **Node.js 18+** & npm

### 2. Running the Backend
```bash
cd backend
./gradlew bootRun
```
The backend starts on `http://localhost:8080`.
The in-memory database will automatically seed with complete Korean & English curricula.

### 3. Running the Frontend
```bash
cd frontend
npm install
npm run dev
```
The frontend starts on `http://127.0.0.1:5173/`.

### 4. Default Seed Accounts
- **Learner Account**: `learner@linguatalk.com` / `password123`
- **Admin Instructor Account**: `admin@linguatalk.com` / `admin123`

---

## 📡 REST API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT token |
| `GET` | `/api/auth/me` | Current authenticated user profile |
| `GET` | `/api/languages` | List supported languages (KO, EN) |
| `GET` | `/api/levels` | List proficiency levels (Beginner to Advanced) |
| `GET` | `/api/topics` | Scenario topics filtered by language and level |
| `GET` | `/api/lessons/{id}` | Complete lesson details (Vocab, Grammar, Dialogue, Exercises) |
| `GET` | `/api/vocabulary` | Vocabulary library with breakdowns and collocations |
| `GET` | `/api/grammar` | Grammar patterns library with formulas and formality levels |
| `GET` | `/api/conversations/scenarios` | Available roleplay scenarios |
| `POST` | `/api/conversations/start` | Start an AI conversation session |
| `POST` | `/api/conversations/reply` | Send message and receive AI reply + coach note |
| `POST` | `/api/conversations/complete/{id}` | Complete session and receive comprehensive analysis |
| `GET` | `/api/progress/dashboard` | Dashboard metrics (Streak, Daily Goal, Mistakes) |
| `POST` | `/api/progress/complete-lesson` | Record lesson completion, score, and study time |
| `GET` | `/api/reviews/due` | Spaced repetition queue ("Review 10 words today") |
| `POST` | `/api/reviews/submit` | Submit card rating (1: Again, 2: Hard, 3: Good, 4: Easy) |
| `POST` | `/api/admin/generate-lesson` | Synthesize new structured lesson with AI |
| `POST` | `/api/admin/ingest` | Process external syllabus into structured lessons |
| `PATCH` | `/api/admin/lessons/{id}/status` | Admin status transition (AI_GENERATED -> APPROVED -> PUBLISHED) |
