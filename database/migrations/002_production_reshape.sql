-- ============================================================
-- MIGRATION 002: PRODUCTION RESHAPE FOR GAMERS'G PLATFORM
-- ============================================================

-- 1. Enhance PLAYER table with LinkedIn-style gamer profile fields
ALTER TABLE "player" 
  ADD COLUMN IF NOT EXISTS tagline VARCHAR(255) DEFAULT 'Competitive Esports Athlete',
  ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS banner_url TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS location VARCHAR(100) DEFAULT 'India',
  ADD COLUMN IF NOT EXISTS primary_game VARCHAR(50) DEFAULT 'valorant',
  ADD COLUMN IF NOT EXISTS discord VARCHAR(100) DEFAULT '',
  ADD COLUMN IF NOT EXISTS lft_status VARCHAR(100) DEFAULT 'Available for Scrims',
  ADD COLUMN IF NOT EXISTS scrim_availability VARCHAR(100) DEFAULT 'Daily 7:00 PM - 11:30 PM IST',
  ADD COLUMN IF NOT EXISTS game_accounts JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS stats JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS career_milestones JSONB DEFAULT '[]';

-- 2. Player-to-Player Connections (LinkedIn Networking)
CREATE TABLE IF NOT EXISTS "player_connection" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID NOT NULL REFERENCES "player"(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES "player"(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'connected' CHECK (status IN ('pending', 'connected', 'declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(requester_id, receiver_id)
);
CREATE INDEX IF NOT EXISTS idx_conn_req ON "player_connection"(requester_id);
CREATE INDEX IF NOT EXISTS idx_conn_rec ON "player_connection"(receiver_id);

-- 3. Org Verification Application table
CREATE TABLE IF NOT EXISTS "org_verification" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES "org"(id) ON DELETE CASCADE,
  legal_name VARCHAR(200) NOT NULL,
  gst_number VARCHAR(50),
  website VARCHAR(255),
  twitter VARCHAR(100),
  rep_name VARCHAR(100),
  rep_email VARCHAR(255),
  documents_url TEXT DEFAULT 'verified_contract_bundle.pdf',
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES "admin"(id) ON DELETE SET NULL,
  review_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_org_verif_org ON "org_verification"(org_id);

-- 4. Organizer Verification Application table
CREATE TABLE IF NOT EXISTS "organizer_verification" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizer_id UUID NOT NULL REFERENCES "tournament_organizer"(id) ON DELETE CASCADE,
  org_name VARCHAR(200) NOT NULL,
  experience_summary TEXT,
  website VARCHAR(255),
  twitter VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES "admin"(id) ON DELETE SET NULL,
  review_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_organizer_verif ON "organizer_verification"(organizer_id);

-- 5. Enhance TEAM table (Captain, Tag, Division, Slots, Status: draft vs registered)
ALTER TABLE "team"
  ADD COLUMN IF NOT EXISTS captain_id UUID REFERENCES "player"(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS tag VARCHAR(10),
  ADD COLUMN IF NOT EXISTS division VARCHAR(100) DEFAULT 'Competitive Tier',
  ADD COLUMN IF NOT EXISTS slots_max INT DEFAULT 5,
  ADD COLUMN IF NOT EXISTS winrate VARCHAR(10) DEFAULT '0%';

-- Update status constraint on team to allow 'draft', 'active', 'registered'
ALTER TABLE "team" DROP CONSTRAINT IF EXISTS team_status_check;
ALTER TABLE "team" ADD CONSTRAINT team_status_check CHECK (status IN ('draft', 'active', 'registered'));

-- 6. TEAM MEMBER table (Roster Slots)
CREATE TABLE IF NOT EXISTS "team_member" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES "team"(id) ON DELETE CASCADE,
  player_id UUID REFERENCES "player"(id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  ign VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'Member',
  is_captain BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_team_member_team ON "team_member"(team_id);
CREATE INDEX IF NOT EXISTS idx_team_member_player ON "team_member"(player_id);

-- 7. Update POST table for player posts, categories, and likes
ALTER TABLE "post" DROP CONSTRAINT IF EXISTS post_author_type_check;
ALTER TABLE "post" ADD CONSTRAINT post_author_type_check CHECK (author_type IN ('player', 'org', 'team', 'organizer'));

ALTER TABLE "post"
  ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'General',
  ADD COLUMN IF NOT EXISTS game VARCHAR(50) DEFAULT 'valorant',
  ADD COLUMN IF NOT EXISTS likes_count INT DEFAULT 0;

-- 8. Post Likes & Comments
CREATE TABLE IF NOT EXISTS "post_like" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES "post"(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS "post_comment" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES "post"(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  author_name VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_post_comment_post ON "post_comment"(post_id);

-- 9. Update FOLLOW table to allow following Organizers
ALTER TABLE "follow" DROP CONSTRAINT IF EXISTS follow_target_type_check;
ALTER TABLE "follow" ADD CONSTRAINT follow_target_type_check CHECK (target_type IN ('org', 'team', 'organizer'));

-- 10. SCRIMS & SCRIM LOBBIES for Tournament Organizers
CREATE TABLE IF NOT EXISTS "scrim" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizer_id UUID NOT NULL REFERENCES "tournament_organizer"(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  game VARCHAR(50) NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  slots_max INT NOT NULL DEFAULT 16,
  room_id VARCHAR(50),
  room_password VARCHAR(50),
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'locked', 'live', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_scrim_organizer ON "scrim"(organizer_id);

CREATE TABLE IF NOT EXISTS "scrim_registration" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scrim_id UUID NOT NULL REFERENCES "scrim"(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES "team"(id) ON DELETE CASCADE,
  check_in_status VARCHAR(20) NOT NULL DEFAULT 'registered' CHECK (check_in_status IN ('registered', 'checked_in', 'ready')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(scrim_id, team_id)
);
