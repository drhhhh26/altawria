import * as SQLite from 'expo-sqlite';
import questionsData from '../assets/questions.json';

export interface Answer {
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: number;
  question: string;
  category: string;
  answers: Answer[];
  correctIndex: number;
  licenseClasses: string[];
  imageFile: string | null;
  imageUrl: string | null;
}

let _db: SQLite.SQLiteDatabase | null = null;

export function getDb(): SQLite.SQLiteDatabase {
  if (!_db) throw new Error('DB not initialized. Call initDb() first.');
  return _db;
}

export async function initDb(): Promise<void> {
  const db = await SQLite.openDatabaseAsync('altawria.db');
  _db = db;

  await db.execAsync(`PRAGMA journal_mode = WAL;`);

  // Create tables
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS questions (
      id           INTEGER PRIMARY KEY,
      question     TEXT NOT NULL,
      category     TEXT NOT NULL,
      image_file   TEXT,
      image_source TEXT
    );

    CREATE TABLE IF NOT EXISTS answers (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id  INTEGER NOT NULL REFERENCES questions(id),
      text         TEXT NOT NULL,
      is_correct   INTEGER NOT NULL,
      sort_order   INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS question_classes (
      question_id  INTEGER NOT NULL REFERENCES questions(id),
      class_name   TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_progress (
      question_id    INTEGER PRIMARY KEY REFERENCES questions(id),
      times_seen     INTEGER DEFAULT 0,
      times_correct  INTEGER DEFAULT 0,
      bookmarked     INTEGER DEFAULT 0,
      last_seen      TEXT
    );

    CREATE TABLE IF NOT EXISTS exam_sessions (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      license     TEXT,
      score       INTEGER,
      total       INTEGER,
      passed      INTEGER,
      duration_s  INTEGER,
      taken_at    TEXT
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      key   TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_answers_qid ON answers(question_id);
    CREATE INDEX IF NOT EXISTS idx_classes_qid ON question_classes(question_id);
    CREATE INDEX IF NOT EXISTS idx_progress_bookmarked ON user_progress(bookmarked);
  `);

  // Seed data if not fully seeded (we expect 1800 questions)
  const row = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM questions');
  if (!row || row.count < 1800) {
    await seedDatabase(db);
  }
}

async function seedDatabase(db: SQLite.SQLiteDatabase): Promise<void> {
  console.log('[DB] Seeding database...');
  const questions = questionsData as Question[];

  const qStmt = await db.prepareAsync(
    `INSERT OR IGNORE INTO questions (id, question, category, image_file, image_source) VALUES (?, ?, ?, ?, ?)`
  );
  const aStmt = await db.prepareAsync(
    `INSERT INTO answers (question_id, text, is_correct, sort_order) VALUES (?, ?, ?, ?)`
  );
  const cStmt = await db.prepareAsync(
    `INSERT INTO question_classes (question_id, class_name) VALUES (?, ?)`
  );
  const pStmt = await db.prepareAsync(
    `INSERT OR IGNORE INTO user_progress (question_id) VALUES (?)`
  );

  try {
    await db.withExclusiveTransactionAsync(async () => {
      for (const q of questions) {
        await qStmt.executeAsync([q.id, q.question, q.category, q.imageFile ?? null, q.imageUrl ?? null]);

        for (let i = 0; i < q.answers.length; i++) {
          const a = q.answers[i];
          await aStmt.executeAsync([q.id, a.text, a.isCorrect ? 1 : 0, i]);
        }

        for (const cls of q.licenseClasses) {
          await cStmt.executeAsync([q.id, cls]);
        }

        await pStmt.executeAsync([q.id]);
      }
    });
  } finally {
    await qStmt.finalizeAsync();
    await aStmt.finalizeAsync();
    await cStmt.finalizeAsync();
    await pStmt.finalizeAsync();
  }

  console.log('[DB] Seeding complete:', questions.length, 'questions');
}

// ── Queries ──────────────────────────────────────────────────────────────────

export type QuestionRow = {
  id: number;
  question: string;
  category: string;
  image_file: string | null;
  image_source: string | null;
};

export type AnswerRow = {
  id: number;
  question_id: number;
  text: string;
  is_correct: number;
  sort_order: number;
};

export async function getQuestionsByCategory(
  category: string,
  licenseClass: string
): Promise<QuestionRow[]> {
  const db = getDb();
  return await db.getAllAsync<QuestionRow>(
    `SELECT DISTINCT q.* FROM questions q
     JOIN question_classes qc ON q.id = qc.question_id
     WHERE q.category = ? AND qc.class_name = ?
     ORDER BY q.id`,
    [category, licenseClass]
  );
}

export async function getExamQuestions(
  licenseClass: string,
  count: number
): Promise<QuestionRow[]> {
  const db = getDb();
  return await db.getAllAsync<QuestionRow>(
    `SELECT DISTINCT q.* FROM questions q
     JOIN question_classes qc ON q.id = qc.question_id
     WHERE qc.class_name = ?
     ORDER BY RANDOM()
     LIMIT ?`,
    [licenseClass, count]
  );
}

export async function getAnswersForQuestion(questionId: number): Promise<AnswerRow[]> {
  const db = getDb();
  return await db.getAllAsync<AnswerRow>(
    `SELECT * FROM answers WHERE question_id = ? ORDER BY sort_order`,
    [questionId]
  );
}

export async function getBookmarkedQuestions(licenseClass: string): Promise<QuestionRow[]> {
  const db = getDb();
  return await db.getAllAsync<QuestionRow>(
    `SELECT DISTINCT q.* FROM questions q
     JOIN question_classes qc ON q.id = qc.question_id
     JOIN user_progress up ON q.id = up.question_id
     WHERE qc.class_name = ? AND up.bookmarked = 1
     ORDER BY q.id`,
    [licenseClass]
  );
}

export async function toggleBookmark(questionId: number): Promise<boolean> {
  const db = getDb();
  const row = await db.getFirstAsync<{ bookmarked: number }>(
    `SELECT bookmarked FROM user_progress WHERE question_id = ?`,
    [questionId]
  );
  const newVal = row ? (row.bookmarked === 1 ? 0 : 1) : 1;
  await db.runAsync(
    `INSERT INTO user_progress (question_id, bookmarked) VALUES (?, ?)
     ON CONFLICT(question_id) DO UPDATE SET bookmarked = ?`,
    [questionId, newVal, newVal]
  );
  return newVal === 1;
}

export async function recordAnswer(
  questionId: number,
  isCorrect: boolean
): Promise<void> {
  const db = getDb();
  await db.runAsync(
    `INSERT INTO user_progress (question_id, times_seen, times_correct, last_seen)
     VALUES (?, 1, ?, datetime('now'))
     ON CONFLICT(question_id) DO UPDATE SET
       times_seen = times_seen + 1,
       times_correct = times_correct + ?,
       last_seen = datetime('now')`,
    [questionId, isCorrect ? 1 : 0, isCorrect ? 1 : 0]
  );
}

export async function saveExamSession(session: {
  license: string;
  score: number;
  total: number;
  passed: boolean;
  durationSeconds: number;
}): Promise<void> {
  const db = getDb();
  await db.runAsync(
    `INSERT INTO exam_sessions (license, score, total, passed, duration_s, taken_at)
     VALUES (?, ?, ?, ?, ?, datetime('now'))`,
    [session.license, session.score, session.total, session.passed ? 1 : 0, session.durationSeconds]
  );
}

export async function getCategoryStats(licenseClass: string): Promise<
  { category: string; total: number; seen: number; correct: number }[]
> {
  const db = getDb();
  return await db.getAllAsync(
    `SELECT q.category,
            COUNT(DISTINCT q.id) as total,
            SUM(CASE WHEN up.times_seen > 0 THEN 1 ELSE 0 END) as seen,
            SUM(COALESCE(up.times_correct, 0)) as correct
     FROM questions q
     JOIN question_classes qc ON q.id = qc.question_id
     LEFT JOIN user_progress up ON q.id = up.question_id
     WHERE qc.class_name = ?
     GROUP BY q.category`,
    [licenseClass]
  );
}

export async function getExamHistory(): Promise<{
  id: number; license: string; score: number; total: number;
  passed: number; duration_s: number; taken_at: string;
}[]> {
  const db = getDb();
  return await db.getAllAsync(
    `SELECT * FROM exam_sessions ORDER BY taken_at DESC LIMIT 50`
  );
}

export async function getSetting(key: string, defaultValue = ''): Promise<string> {
  const db = getDb();
  const row = await db.getFirstAsync<{ value: string }>(
    `SELECT value FROM user_settings WHERE key = ?`, [key]
  );
  return row?.value ?? defaultValue;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = getDb();
  await db.runAsync(
    `INSERT INTO user_settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = ?`,
    [key, value, value]
  );
}
