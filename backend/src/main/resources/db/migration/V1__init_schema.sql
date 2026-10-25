-- LinguaTalk Database Schema Migration V1
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'USER',
    target_language VARCHAR(50) DEFAULT 'KO',
    target_level VARCHAR(50) DEFAULT 'BEGINNER',
    streak_count INT DEFAULT 1,
    last_study_date DATE,
    daily_goal_minutes INT DEFAULT 15,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS languages (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    native_name VARCHAR(100) NOT NULL,
    flag_emoji VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS topics (
    id BIGSERIAL PRIMARY KEY,
    language_code VARCHAR(10) NOT NULL,
    level_code VARCHAR(50) NOT NULL,
    code VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    estimated_minutes INT DEFAULT 20,
    order_index INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS lessons (
    id BIGSERIAL PRIMARY KEY,
    topic_id BIGINT REFERENCES topics(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    scenario VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PUBLISHED',
    learning_objectives TEXT,
    cultural_notes TEXT,
    formality_explanation TEXT,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vocabulary (
    id BIGSERIAL PRIMARY KEY,
    lesson_id BIGINT REFERENCES lessons(id) ON DELETE CASCADE,
    word VARCHAR(255) NOT NULL,
    meaning TEXT NOT NULL,
    part_of_speech VARCHAR(50),
    pronunciation_ipa VARCHAR(255),
    example_sentence TEXT,
    translation TEXT,
    difficulty VARCHAR(50),
    related_words TEXT,
    collocations TEXT,
    hangul VARCHAR(255),
    romanization VARCHAR(255),
    batchim_rules TEXT,
    sound_changes TEXT,
    breakdown_json TEXT
);

CREATE TABLE IF NOT EXISTS grammar (
    id BIGSERIAL PRIMARY KEY,
    lesson_id BIGINT REFERENCES lessons(id) ON DELETE CASCADE,
    grammar_point VARCHAR(255) NOT NULL,
    explanation TEXT NOT NULL,
    usage_guide TEXT,
    structure_formula TEXT,
    common_mistakes TEXT,
    formality_level VARCHAR(100),
    korean_pattern VARCHAR(255),
    example_conversations_json TEXT
);

CREATE TABLE IF NOT EXISTS dialogues (
    id BIGSERIAL PRIMARY KEY,
    lesson_id BIGINT REFERENCES lessons(id) ON DELETE CASCADE,
    title VARCHAR(255),
    context_description TEXT,
    user_role VARCHAR(100),
    partner_role VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS dialogue_lines (
    id BIGSERIAL PRIMARY KEY,
    dialogue_id BIGINT REFERENCES dialogues(id) ON DELETE CASCADE,
    speaker_name VARCHAR(100),
    speaker_role VARCHAR(100),
    text_original TEXT NOT NULL,
    text_romanized TEXT,
    text_translation TEXT NOT NULL,
    audio_url VARCHAR(500),
    order_index INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS exercises (
    id BIGSERIAL PRIMARY KEY,
    lesson_id BIGINT REFERENCES lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS exercise_questions (
    id BIGSERIAL PRIMARY KEY,
    exercise_id BIGINT REFERENCES exercises(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    audio_url VARCHAR(500),
    options_json TEXT,
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    order_index INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS conversation_scenarios (
    id BIGSERIAL PRIMARY KEY,
    lesson_id BIGINT REFERENCES lessons(id) ON DELETE SET NULL,
    topic_code VARCHAR(100),
    language_code VARCHAR(10),
    level_code VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    user_role VARCHAR(100) NOT NULL,
    ai_role VARCHAR(100) NOT NULL,
    system_prompt TEXT,
    initial_greeting TEXT NOT NULL,
    cultural_context TEXT
);

CREATE TABLE IF NOT EXISTS conversation_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    scenario_id BIGINT REFERENCES conversation_scenarios(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    overall_score INT,
    fluency_score INT,
    grammar_score INT,
    vocabulary_score INT,
    feedback_summary TEXT,
    natural_expressions_json TEXT,
    mistakes_json TEXT
);

CREATE TABLE IF NOT EXISTS conversation_messages (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT REFERENCES conversation_sessions(id) ON DELETE CASCADE,
    sender_role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    grammar_feedback TEXT,
    suggested_alternative TEXT
);

CREATE TABLE IF NOT EXISTS learning_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    lesson_id BIGINT REFERENCES lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE,
    score INT DEFAULT 0,
    completed_at TIMESTAMP,
    time_spent_seconds INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS vocabulary_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    vocabulary_id BIGINT REFERENCES vocabulary(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'NEW',
    repetitions INT DEFAULT 0,
    correct_count INT DEFAULT 0,
    incorrect_count INT DEFAULT 0,
    ease_factor DOUBLE PRECISION DEFAULT 2.5,
    interval_days INT DEFAULT 1,
    last_reviewed_at TIMESTAMP,
    next_review_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mistakes (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    lesson_id BIGINT REFERENCES lessons(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL,
    original_text TEXT NOT NULL,
    corrected_text TEXT NOT NULL,
    explanation TEXT,
    reviewed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
