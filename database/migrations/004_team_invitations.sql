-- ============================================================
-- MIGRATION 004: TEAM INVITATIONS & JOIN REQUEST WORKFLOW
-- ============================================================

CREATE TABLE IF NOT EXISTS "team_invitation" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES "team"(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES "player"(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES "player"(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'Member',
  message TEXT DEFAULT '',
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(team_id, player_id)
);

CREATE INDEX IF NOT EXISTS idx_team_invitation_player ON "team_invitation"(player_id);
CREATE INDEX IF NOT EXISTS idx_team_invitation_team ON "team_invitation"(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invitation_status ON "team_invitation"(status);
