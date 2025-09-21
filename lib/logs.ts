import { db } from "./db";

export type LogItem = {
  id?: number;
  createdAt: number;
  targetPost: number;
  contractionAt: number | null;
  elapsedTotal: number;
  elapsedPost: number;
  note?: string | null;
};

export function insertLog(item: LogItem) {
  db.runSync(
    `INSERT INTO logs (createdAt, targetPost, contractionAt, elapsedTotal, elapsedPost, note)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [item.createdAt, item.targetPost, item.contractionAt, item.elapsedTotal, item.elapsedPost, item.note ?? null]
  );
}
export function listLogs(limit = 200, offset = 0): LogItem[] {
  return db.getAllSync<LogItem>(`SELECT * FROM logs ORDER BY createdAt DESC LIMIT ? OFFSET ?`, [limit, offset]);
}
