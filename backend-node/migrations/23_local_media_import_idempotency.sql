-- Independent import receipts become idempotent, old Takes stay untouched.
CREATE TABLE IF NOT EXISTS local_media_imports (
  id INTEGER PRIMARY KEY AUTOINCREMENT, target_type TEXT NOT NULL, target_id INTEGER NOT NULL,
  kind TEXT NOT NULL, provider TEXT NOT NULL, local_path TEXT NOT NULL, sha256 TEXT NOT NULL,
  prompt TEXT, style_template TEXT, model TEXT, generation_id TEXT, created_at TEXT NOT NULL,
  idempotency_key TEXT
);
ALTER TABLE local_media_imports ADD COLUMN idempotency_key TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_local_media_import_idempotency
  ON local_media_imports(idempotency_key) WHERE idempotency_key IS NOT NULL;
