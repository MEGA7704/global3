CREATE TABLE IF NOT EXISTS global3_data (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  source TEXT DEFAULT 'api-online-only'
);

CREATE TABLE IF NOT EXISTS global3_backups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  source TEXT DEFAULT 'api-online-only'
);

CREATE INDEX IF NOT EXISTS idx_global3_backups_key_created
ON global3_backups(key, created_at);

CREATE TABLE IF NOT EXISTS global3_sessions (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS global3_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  message TEXT,
  created_at TEXT NOT NULL
);
