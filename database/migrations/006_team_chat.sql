-- ============================================================
-- 006: SQUAD TACTICAL COMMS & PRIVATE TEAM CHAT
-- ============================================================

CREATE TABLE IF NOT EXISTS "team_message" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES "team"(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_role VARCHAR(20) NOT NULL DEFAULT 'player' CHECK (sender_role IN ('player', 'org', 'admin')),
  sender_name VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_team_message_team_created ON "team_message"(team_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_team_message_sender ON "team_message"(sender_id);
