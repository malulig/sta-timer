import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("sta.db");

export function initDb() {
  db.execSync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    PRAGMA synchronous = NORMAL;
    CREATE TABLE IF NOT EXISTS __meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
  `);
  const row = db.getFirstSync<{ value?: string }>(`SELECT value FROM __meta WHERE key='schemaVersion'`);
  const current = row?.value ? Number(row.value) : 0;
  migrate(current);
}

function migrate(from: number) {
  let v = from;
  if (v < 1) {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        createdAt INTEGER NOT NULL,
        targetPost INTEGER NOT NULL,
        contractionAt INTEGER,
        elapsedTotal INTEGER NOT NULL,
        elapsedPost INTEGER NOT NULL,
        note TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_logs_createdAt ON logs (createdAt DESC);
    `);
    v = 1;
  }
  db.runSync(
    `INSERT INTO __meta(key,value) VALUES('schemaVersion',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value`,
    [String(v)]
  );
}
