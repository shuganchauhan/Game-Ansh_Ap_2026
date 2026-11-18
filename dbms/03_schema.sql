-- ==============================================================================
-- FLUX ESPORTS COMPETITIVE GAMING PLATFORM
-- Unified Production Relational Database Schema (PostgreSQL 14+)
-- File: dbms/03_schema.sql
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. ACCOUNTS & IDENTITIES
-- ==============================================================================

-- 2.1 Organizations (Professional Esports Orgs)
CREATE TABLE IF NOT EXISTS "org" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.2 Tournament Organizers (Third-party Event Hosts)
CREATE TABLE IF NOT EXISTS "tournament_organizer" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.3 Platform Administrators
CREATE TABLE IF NOT EXISTS "admin" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.4 Competitive Players / Athletes
CREATE TABLE IF NOT EXISTS "player" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT, -- Nullable to allow Google OAuth 2.0 logins
  google_id VARCHAR(255) UNIQUE,
  game_ign VARCHAR(100),
  tagline VARCHAR(255) DEFAULT 'Competitive Esports Athlete',
  bio TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  banner_url TEXT DEFAULT '',
  location VARCHAR(100) DEFAULT 'India',
  primary_game VARCHAR(50) DEFAULT 'valorant',
  discord VARCHAR(100) DEFAULT '',
  lft_status VARCHAR(100) DEFAULT 'Available for Scrims',
  scrim_availability VARCHAR(100) DEFAULT 'Daily 7:00 PM - 11:30 PM IST',
  game_accounts JSONB DEFAULT '{}',
  stats JSONB DEFAULT '{}',
  career_milestones JSONB DEFAULT '[]',
  team_id UUID, -- Foreign key defined after team table creation
  org_id UUID REFERENCES "org"(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT player_exclusivity CHECK (
    team_id IS NULL OR org_id IS NULL
  )
);

-- ==============================================================================
-- 3. TEAMS, ROSTERS & RECRUITMENT
-- ==============================================================================

-- 3.1 Teams & Squads
CREATE TABLE IF NOT EXISTS "team" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES "org"(id) ON DELETE SET NULL,
  captain_id UUID REFERENCES "player"(id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  game VARCHAR(100) NOT NULL DEFAULT '',
  tag VARCHAR(10),
  division VARCHAR(100) DEFAULT 'Competitive Tier',
  slots_max INT DEFAULT 5,
  winrate VARCHAR(10) DEFAULT '0%',
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'registered')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add deferred foreign key constraint to player for team_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_player_team'
  ) THEN
    ALTER TABLE "player" 
      ADD CONSTRAINT fk_player_team FOREIGN KEY (team_id) REFERENCES "team"(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 3.2 Roster Slots (Team Members)
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

-- 3.3 Team Invitations (Unstop-style athlete recruitment invitation flow)
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

-- 3.4 Open Recruitment Postings
CREATE TABLE IF NOT EXISTS "role_posting" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES "team"(id) ON DELETE CASCADE,
  role VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(10) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.5 Tryout Applications
CREATE TABLE IF NOT EXISTS "application" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES "player"(id) ON DELETE CASCADE,
  posting_id UUID NOT NULL REFERENCES "role_posting"(id) ON DELETE CASCADE,
  pitch TEXT NOT NULL DEFAULT '',
  vod_link TEXT,
  status VARCHAR(15) NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'shortlisted', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (player_id, posting_id)
);

-- ==============================================================================
-- 4. TOURNAMENTS & SCRIMS
-- ==============================================================================

-- 4.1 Tournaments
CREATE TABLE IF NOT EXISTS "tournament" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizer_id UUID NOT NULL REFERENCES "tournament_organizer"(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  game VARCHAR(100) NOT NULL,
  start_date TIMESTAMPTZ,
  status VARCHAR(15) NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.2 Tournament Registrations
CREATE TABLE IF NOT EXISTS "registration" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES "tournament"(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES "team"(id) ON DELETE CASCADE,
  status VARCHAR(15) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tournament_id, team_id)
);

-- 4.3 Practice Scrims
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

-- 4.4 Scrim Registrations
CREATE TABLE IF NOT EXISTS "scrim_registration" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scrim_id UUID NOT NULL REFERENCES "scrim"(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES "team"(id) ON DELETE CASCADE,
  check_in_status VARCHAR(20) NOT NULL DEFAULT 'registered' CHECK (check_in_status IN ('registered', 'checked_in', 'ready')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(scrim_id, team_id)
);

-- ==============================================================================
-- 5. SOCIAL & NETWORKING
-- ==============================================================================

-- 5.1 Player-to-Player Connections (Professional Networking)
CREATE TABLE IF NOT EXISTS "player_connection" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID NOT NULL REFERENCES "player"(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES "player"(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'connected' CHECK (status IN ('pending', 'connected', 'declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(requester_id, receiver_id)
);

-- 5.2 Entity Follows
CREATE TABLE IF NOT EXISTS "follow" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES "player"(id) ON DELETE CASCADE,
  target_type VARCHAR(10) NOT NULL CHECK (target_type IN ('org', 'team', 'organizer')),
  target_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (player_id, target_type, target_id)
);

-- 5.3 Community Posts
CREATE TABLE IF NOT EXISTS "post" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_type VARCHAR(10) NOT NULL CHECK (author_type IN ('player', 'org', 'team', 'organizer')),
  author_id UUID NOT NULL,
  category VARCHAR(50) DEFAULT 'General',
  game VARCHAR(50) DEFAULT 'valorant',
  likes_count INT DEFAULT 0,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5.4 Post Likes
CREATE TABLE IF NOT EXISTS "post_like" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES "post"(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- 5.5 Post Comments
CREATE TABLE IF NOT EXISTS "post_comment" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES "post"(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  author_name VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 6. MESSAGING & SQUAD COMMS
-- ==============================================================================

-- 6.1 Direct 1-on-1 Messages (Player to Player)
CREATE TABLE IF NOT EXISTS "message" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES "player"(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES "player"(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6.2 Squad Tactical Comms (Private Team Group Chat)
CREATE TABLE IF NOT EXISTS "team_message" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES "team"(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_role VARCHAR(20) NOT NULL DEFAULT 'player' CHECK (sender_role IN ('player', 'org', 'admin')),
  sender_name VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 7. VERIFICATION DOSSIERS & COMPLIANCE
-- ==============================================================================

-- 7.1 Org Verification Dossiers
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

-- 7.2 Tournament Organizer Verification Dossiers
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

-- ==============================================================================
-- 8. COMPREHENSIVE PERFORMANCE INDEX CATALOG
-- ==============================================================================

-- Player & Identity Indexes
CREATE INDEX IF NOT EXISTS idx_player_team ON "player"(team_id);
CREATE INDEX IF NOT EXISTS idx_player_org ON "player"(org_id);
CREATE INDEX IF NOT EXISTS idx_player_google_id ON "player"(google_id);
CREATE INDEX IF NOT EXISTS idx_conn_req ON "player_connection"(requester_id);
CREATE INDEX IF NOT EXISTS idx_conn_rec ON "player_connection"(receiver_id);

-- Team & Roster Indexes
CREATE INDEX IF NOT EXISTS idx_team_org ON "team"(org_id);
CREATE INDEX IF NOT EXISTS idx_team_captain ON "team"(captain_id);
CREATE INDEX IF NOT EXISTS idx_team_member_team ON "team_member"(team_id);
CREATE INDEX IF NOT EXISTS idx_team_member_player ON "team_member"(player_id);
CREATE INDEX IF NOT EXISTS idx_team_invitation_player ON "team_invitation"(player_id);
CREATE INDEX IF NOT EXISTS idx_team_invitation_team ON "team_invitation"(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invitation_status ON "team_invitation"(status);

-- Recruitment Indexes
CREATE INDEX IF NOT EXISTS idx_role_posting_team ON "role_posting"(team_id);
CREATE INDEX IF NOT EXISTS idx_application_player ON "application"(player_id);
CREATE INDEX IF NOT EXISTS idx_application_posting ON "application"(posting_id);

-- Tournament & Scrim Indexes
CREATE INDEX IF NOT EXISTS idx_tournament_organizer ON "tournament"(organizer_id);
CREATE INDEX IF NOT EXISTS idx_registration_tournament ON "registration"(tournament_id);
CREATE INDEX IF NOT EXISTS idx_scrim_organizer ON "scrim"(organizer_id);
CREATE INDEX IF NOT EXISTS idx_scrim_reg_scrim ON "scrim_registration"(scrim_id);

-- Social & Messaging Indexes
CREATE INDEX IF NOT EXISTS idx_follow_player ON "follow"(player_id);
CREATE INDEX IF NOT EXISTS idx_post_author ON "post"(author_id, author_type);
CREATE INDEX IF NOT EXISTS idx_post_comment_post ON "post_comment"(post_id);
CREATE INDEX IF NOT EXISTS idx_message_sender ON "message"(sender_id);
CREATE INDEX IF NOT EXISTS idx_message_receiver ON "message"(receiver_id);
CREATE INDEX IF NOT EXISTS idx_team_message_team_created ON "team_message"(team_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_team_message_sender ON "team_message"(sender_id);

-- Verification Indexes
CREATE INDEX IF NOT EXISTS idx_org_verif_org ON "org_verification"(org_id);
CREATE INDEX IF NOT EXISTS idx_organizer_verif ON "organizer_verification"(organizer_id);

-- ==============================================================================
-- 9. DEFAULT PLATFORM ADMINISTRATOR PROVISIONING
-- ==============================================================================

INSERT INTO "admin" (email, password_hash)
VALUES ('shagunaaryanansh@flux.com', '$2b$12$XArKaGsW1/dLRnEpGySd8ORzJ.zgEIdnmdGB2THTMSX7Xd/Xi3D2O')
ON CONFLICT (email) DO NOTHING;
