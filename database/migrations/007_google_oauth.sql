-- ============================================================
-- 007: GOOGLE OAUTH 2.0 INTEGRATION
-- ============================================================

-- Allow Google OAuth accounts to register without a mandatory local password
ALTER TABLE "player" ALTER COLUMN password_hash DROP NOT NULL;

-- Store Google account subject identifier
ALTER TABLE "player" ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;
CREATE INDEX IF NOT EXISTS idx_player_google_id ON "player"(google_id);
