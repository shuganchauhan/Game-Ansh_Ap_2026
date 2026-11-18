-- ==============================================================================
-- FLUX ESPORTS COMPETITIVE GAMING PLATFORM
-- Comprehensive DBMS Query Suite (Basic to Advanced Analytical SQL)
-- File: dbms/04_queries.sql
-- ==============================================================================

-- ==============================================================================
-- SECTION 1: CORE CRUD & DATA RETRIEVAL QUERIES
-- ==============================================================================

-- 1.1 Fetch verified esports athletes available for competitive scrims
SELECT 
    id, 
    username, 
    game_ign, 
    primary_game, 
    tagline, 
    lft_status, 
    scrim_availability
FROM player
WHERE lft_status = 'Available for Scrims'
ORDER BY created_at DESC
LIMIT 20;

-- 1.2 Fetch all registered teams in active status for VALORANT
SELECT 
    id, 
    name, 
    tag, 
    division, 
    status, 
    slots_max, 
    winrate
FROM team
WHERE LOWER(game) = 'valorant' 
  AND status = 'registered'
ORDER BY name ASC;

-- 1.3 Fetch pending organization and organizer verification applications
SELECT 
    'org' AS applicant_type,
    ov.id AS application_id,
    o.name AS entity_name,
    ov.legal_name,
    ov.rep_email,
    ov.created_at
FROM org_verification ov
JOIN org o ON o.id = ov.org_id
WHERE ov.status = 'pending'

UNION ALL

SELECT 
    'organizer' AS applicant_type,
    orgv.id AS application_id,
    orgv.org_name AS entity_name,
    orgv.org_name AS legal_name,
    torg.email AS rep_email,
    orgv.created_at
FROM organizer_verification orgv
JOIN tournament_organizer torg ON torg.id = orgv.organizer_id
WHERE orgv.status = 'pending'
ORDER BY created_at ASC;


-- ==============================================================================
-- SECTION 2: MULTI-TABLE RELATIONAL JOINS
-- ==============================================================================

-- 2.1 Complete Team Roster with Captain & Organization Affiliation (INNER + LEFT JOIN)
SELECT 
    t.id AS team_id,
    t.name AS team_name,
    t.game,
    t.tag,
    t.division,
    COALESCE(o.name, 'Independent Squad') AS organization_name,
    cap.username AS captain_username,
    cap.game_ign AS captain_ign,
    tm.id AS slot_id,
    tm.name AS athlete_name,
    tm.ign AS athlete_ign,
    tm.role AS tactical_role,
    tm.is_captain
FROM team t
LEFT JOIN org o ON o.id = t.org_id
LEFT JOIN player cap ON cap.id = t.captain_id
JOIN team_member tm ON tm.team_id = t.id
ORDER BY t.name ASC, tm.is_captain DESC, tm.name ASC;

-- 2.2 Scrim Match Lobby with Registered Teams and Live Check-In Status
SELECT 
    s.id AS scrim_id,
    s.name AS scrim_title,
    s.game,
    s.scheduled_at,
    s.slots_max,
    torg.name AS organizer_name,
    sr.check_in_status,
    sr.created_at AS registration_time,
    t.id AS team_id,
    t.name AS team_name,
    COALESCE(cap.game_ign, cap.username, 'TBD') AS captain_name,
    COUNT(tm.id) AS roster_member_count
FROM scrim s
JOIN tournament_organizer torg ON torg.id = s.organizer_id
JOIN scrim_registration sr ON sr.scrim_id = s.id
JOIN team t ON t.id = sr.team_id
LEFT JOIN player cap ON cap.id = t.captain_id
LEFT JOIN team_member tm ON tm.team_id = t.id
GROUP BY 
    s.id, s.name, s.game, s.scheduled_at, s.slots_max, 
    torg.name, sr.check_in_status, sr.created_at, t.id, t.name, cap.game_ign, cap.username
ORDER BY s.scheduled_at ASC, sr.created_at ASC;

-- 2.3 Athlete Mutual Connections (Self-Join on player_connection)
SELECT 
    p1.username AS athlete_1,
    p2.username AS athlete_2,
    pc.status AS connection_status,
    pc.created_at AS connected_since
FROM player_connection pc
JOIN player p1 ON p1.id = pc.requester_id
JOIN player p2 ON p2.id = pc.receiver_id
WHERE pc.status = 'connected'
ORDER BY pc.created_at DESC;


-- ==============================================================================
-- SECTION 3: AGGREGATIONS, GROUP BY & HAVING CLAUSES
-- ==============================================================================

-- 3.1 Organization Roster Analytics (Orgs with at least 1 registered team)
SELECT 
    o.id AS org_id,
    o.name AS organization_name,
    o.verified AS is_verified,
    COUNT(DISTINCT t.id) AS total_teams,
    COUNT(DISTINCT tm.id) AS total_signed_athletes,
    COUNT(DISTINCT p.id) AS total_posts_published
FROM org o
LEFT JOIN team t ON t.org_id = o.id
LEFT JOIN team_member tm ON tm.team_id = t.id
LEFT JOIN post p ON p.author_id = o.id AND p.author_type = 'org'
GROUP BY o.id, o.name, o.verified
HAVING COUNT(DISTINCT t.id) >= 1
ORDER BY total_signed_athletes DESC;

-- 3.2 Game Title Ecosystem Distribution & Roster Capacity
SELECT 
    t.game,
    COUNT(DISTINCT t.id) AS total_squads,
    SUM(CASE WHEN t.status = 'registered' THEN 1 ELSE 0 END) AS tournament_ready_squads,
    SUM(CASE WHEN t.status = 'draft' THEN 1 ELSE 0 END) AS incomplete_draft_squads,
    ROUND(AVG(t.slots_max), 1) AS avg_max_slots,
    COUNT(DISTINCT tm.id) AS active_roster_members
FROM team t
LEFT JOIN team_member tm ON tm.team_id = t.id
GROUP BY t.game
ORDER BY total_squads DESC;

-- 3.3 Community Post Engagement Summary by Category
SELECT 
    p.category,
    p.game,
    COUNT(p.id) AS total_posts,
    SUM(p.likes_count) AS total_likes,
    COUNT(pc.id) AS total_comments,
    ROUND(AVG(p.likes_count), 2) AS avg_likes_per_post
FROM post p
LEFT JOIN post_comment pc ON pc.post_id = p.id
GROUP BY p.category, p.game
HAVING COUNT(p.id) > 0
ORDER BY total_likes DESC;


-- ==============================================================================
-- SECTION 4: SUBQUERIES & CORRELATED SUBQUERIES
-- ==============================================================================

-- 4.1 Athletes who have NEVER applied for any recruitment posting (Uncorrelated Subquery)
SELECT 
    p.id, 
    p.username, 
    p.email, 
    p.primary_game, 
    p.created_at
FROM player p
WHERE p.id NOT IN (
    SELECT DISTINCT a.player_id 
    FROM application a
)
ORDER BY p.created_at DESC;

-- 4.2 Teams with Fully Populated Rosters (Correlated Subquery)
SELECT 
    t.id, 
    t.name, 
    t.game, 
    t.division, 
    t.slots_max
FROM team t
WHERE t.slots_max <= (
    SELECT COUNT(*) 
    FROM team_member tm 
    WHERE tm.team_id = t.id
);

-- 4.3 High-Engagement Posts (Posts with likes greater than category average)
SELECT 
    p.id, 
    p.author_type, 
    p.category, 
    p.game, 
    p.likes_count, 
    p.content
FROM post p
WHERE p.likes_count > (
    SELECT AVG(p2.likes_count) 
    FROM post p2 
    WHERE p2.category = p.category
)
ORDER BY p.likes_count DESC;


-- ==============================================================================
-- SECTION 5: COMMON TABLE EXPRESSIONS (CTEs) & COMPLEX WORKFLOWS
-- ==============================================================================

-- 5.1 Team Eligibility Audit CTE (Determines tournament compliance)
WITH TeamRosterMetrics AS (
    SELECT 
        t.id AS team_id,
        t.name AS team_name,
        t.game,
        t.status AS current_status,
        t.slots_max,
        COUNT(tm.id) AS current_roster_size,
        COUNT(CASE WHEN tm.is_captain THEN 1 END) AS captain_count
    FROM team t
    LEFT JOIN team_member tm ON tm.team_id = t.id
    GROUP BY t.id, t.name, t.game, t.status, t.slots_max
),
ComplianceEvaluation AS (
    SELECT 
        team_id,
        team_name,
        game,
        current_status,
        current_roster_size,
        slots_max,
        captain_count,
        CASE 
            WHEN current_roster_size >= 4 AND captain_count = 1 THEN 'ELIGIBLE_FOR_OFFICIAL_SCRIMS'
            WHEN current_roster_size < 4 THEN 'ROSTER_INCOMPLETE_MIN_4_REQUIRED'
            WHEN captain_count = 0 THEN 'NO_CAPTAIN_DESIGNATED'
            ELSE 'UNDER_REVIEW'
        END AS tournament_eligibility
    FROM TeamRosterMetrics
)
SELECT * FROM ComplianceEvaluation
ORDER BY current_roster_size DESC;

-- 5.2 Private Squad Comms Activity Metric CTE
WITH RecentTeamMessages AS (
    SELECT 
        team_id,
        COUNT(id) AS messages_last_30_days,
        MAX(created_at) AS last_transmission_at,
        COUNT(DISTINCT sender_id) AS active_chatters_count
    FROM team_message
    WHERE created_at >= NOW() - INTERVAL '30 days'
    GROUP BY team_id
)
SELECT 
    t.id AS team_id,
    t.name AS team_name,
    t.game,
    COALESCE(rtm.messages_last_30_days, 0) AS message_volume,
    COALESCE(rtm.active_chatters_count, 0) AS active_members_communicating,
    rtm.last_transmission_at
FROM team t
LEFT JOIN RecentTeamMessages rtm ON rtm.team_id = t.id
ORDER BY message_volume DESC;


-- ==============================================================================
-- SECTION 6: ANALYTICAL WINDOW FUNCTIONS
-- ==============================================================================

-- 6.1 Rank Athletes within their Primary Game Title by Connected Network Size
WITH AthleteConnections AS (
    SELECT 
        p.id AS player_id,
        p.username,
        p.primary_game,
        COUNT(pc.id) AS total_connections
    FROM player p
    LEFT JOIN player_connection pc 
        ON (pc.requester_id = p.id OR pc.receiver_id = p.id) 
        AND pc.status = 'connected'
    GROUP BY p.id, p.username, p.primary_game
)
SELECT 
    player_id,
    username,
    primary_game,
    total_connections,
    ROW_NUMBER() OVER (PARTITION BY primary_game ORDER BY total_connections DESC) AS game_rank_dense,
    RANK() OVER (PARTITION BY primary_game ORDER BY total_connections DESC) AS game_rank_standard,
    DENSE_RANK() OVER (ORDER BY total_connections DESC) AS global_network_rank
FROM AthleteConnections
ORDER BY primary_game, game_rank_dense;

-- 6.2 Squad Tactical Comms Latency Analysis (LAG Window Function)
-- Calculates time gap between consecutive tactical transmissions in team chat
SELECT 
    tm.id AS message_id,
    t.name AS team_name,
    tm.sender_name,
    tm.sender_role,
    tm.content,
    tm.created_at,
    LAG(tm.created_at) OVER (
        PARTITION BY tm.team_id 
        ORDER BY tm.created_at ASC
    ) AS previous_message_time,
    ROUND(
        EXTRACT(
            EPOCH FROM (
                tm.created_at - LAG(tm.created_at) OVER (
                    PARTITION BY tm.team_id 
                    ORDER BY tm.created_at ASC
                )
            )
        )
    ) AS seconds_since_last_comm
FROM team_message tm
JOIN team t ON t.id = tm.team_id
ORDER BY tm.team_id, tm.created_at ASC;


-- ==============================================================================
-- SECTION 7: PRODUCTION DATABASE VIEWS
-- ==============================================================================

-- 7.1 View: Consolidated Athlete Competitive Passport
CREATE OR REPLACE VIEW v_athlete_competitive_passport AS
SELECT 
    p.id AS athlete_id,
    p.username,
    p.email,
    p.game_ign,
    p.primary_game,
    p.tagline,
    p.lft_status,
    p.scrim_availability,
    p.avatar_url,
    p.location,
    t.id AS current_team_id,
    t.name AS current_team_name,
    t.division AS current_team_division,
    o.id AS affiliated_org_id,
    o.name AS affiliated_org_name,
    p.created_at AS member_since
FROM player p
LEFT JOIN team t ON t.id = p.team_id
LEFT JOIN org o ON o.id = p.org_id;

-- 7.2 View: Live Tournament & Scrim Command Center Feed
CREATE OR REPLACE VIEW v_live_tournament_scrim_feed AS
SELECT 
    'scrim' AS event_type,
    s.id AS event_id,
    s.name AS event_title,
    s.game,
    s.status,
    s.scheduled_at AS event_time,
    s.slots_max,
    COUNT(sr.id) AS registered_teams_count,
    torg.name AS organizer_name
FROM scrim s
JOIN tournament_organizer torg ON torg.id = s.organizer_id
LEFT JOIN scrim_registration sr ON sr.scrim_id = s.id
GROUP BY s.id, s.name, s.game, s.status, s.scheduled_at, s.slots_max, torg.name

UNION ALL

SELECT 
    'tournament' AS event_type,
    tour.id AS event_id,
    tour.name AS event_title,
    tour.game,
    tour.status,
    tour.start_date AS event_time,
    64 AS slots_max,
    COUNT(reg.id) AS registered_teams_count,
    torg2.name AS organizer_name
FROM tournament tour
JOIN tournament_organizer torg2 ON torg2.id = tour.organizer_id
LEFT JOIN registration reg ON reg.tournament_id = tour.id
GROUP BY tour.id, tour.name, tour.game, tour.status, tour.start_date, torg2.name;


-- ==============================================================================
-- SECTION 8: ATOMIC TRANSACTIONAL ROUTINES
-- ==============================================================================

-- 8.1 Transaction: Accept Team Invitation & Atomically Bind Athlete to Roster Slot
DO $$
DECLARE
    v_invite_id UUID;
    v_team_id UUID;
    v_player_id UUID;
    v_role VARCHAR(50);
    v_player_ign VARCHAR(100);
    v_player_name VARCHAR(100);
BEGIN
    -- Select the first pending invitation for simulation
    SELECT id, team_id, player_id, role 
    INTO v_invite_id, v_team_id, v_player_id, v_role
    FROM team_invitation 
    WHERE status = 'pending' 
    LIMIT 1;

    IF v_invite_id IS NOT NULL THEN
        -- Fetch player metadata
        SELECT username, COALESCE(game_ign, username) 
        INTO v_player_name, v_player_ign
        FROM player 
        WHERE id = v_player_id;

        -- 1. Mark invitation accepted
        UPDATE team_invitation 
        SET status = 'accepted', updated_at = NOW() 
        WHERE id = v_invite_id;

        -- 2. Insert into team roster slots
        INSERT INTO team_member (team_id, player_id, name, ign, role, is_captain)
        VALUES (v_team_id, v_player_id, v_player_name, v_player_ign, v_role, false)
        ON CONFLICT DO NOTHING;

        -- 3. Update player's active team reference
        UPDATE player 
        SET team_id = v_team_id 
        WHERE id = v_player_id;

        -- 4. Update team status to 'registered' if roster reaches 4+ players
        IF (SELECT COUNT(*) FROM team_member WHERE team_id = v_team_id) >= 4 THEN
            UPDATE team SET status = 'registered' WHERE id = v_team_id;
        END IF;

        RAISE NOTICE 'Transaction committed: Athlete % joined Team % successfully.', v_player_name, v_team_id;
    ELSE
        RAISE NOTICE 'No pending invitations found for transaction test.';
    END IF;
END $$;
