import React, { createContext, useContext, useState, useEffect } from 'react';
import { discoveryService, teamService, socialService, recruitmentService } from '../services';

const GameStoreContext = createContext();

const STORAGE_KEY = 'gamersg_store_v1';

function fromApiPost(post) {
  return {
    id: post.id,
    authorName: post.author_name || 'Gamer',
    authorHandle: post.author_type === 'player' ? `@${post.author_ign || post.author_name || 'gamer'}` : post.author_name,
    authorAvatar: post.author_avatar || post.avatar_url || '',
    isOrg: post.author_type === 'org' || post.author_type === 'organizer',
    isVerified: Boolean(post.author_verified),
    category: post.category || 'General',
    game: post.game || 'valorant',
    content: post.content,
    createdAt: post.created_at ? new Date(post.created_at).toLocaleString() : '',
    likes: Number(post.likes_count) || 0,
    likedByMe: Boolean(post.liked),
    comments: (post.comments || []).map((comment) => ({
      id: comment.id,
      authorName: comment.author_name,
      createdAt: comment.created_at ? new Date(comment.created_at).toLocaleString() : '',
      content: comment.content,
    })),
    shares: 0,
  };
}

function fromApiApplication(app) {
  return {
    id: app.id, teamId: app.team_id, teamName: app.team_name || 'Team', game: app.game || '',
    roleName: app.role, applicantId: app.player_id, applicantName: app.applicant_name || '',
    applicantRank: app.applicant_rank || '', pitch: app.pitch || '', vodLink: app.vod_link || '',
    status: app.status, appliedAt: app.created_at ? new Date(app.created_at).toLocaleString() : '',
  };
}

/* ── Initial Mock Players (LinkedIn-style network) ── */
const INITIAL_PLAYERS = [
  {
    id: 'player-me',
    name: 'Alex "Vortex" Chauhan',
    username: 'Vortex',
    tagline: 'Tier 1 Flex Duelist & IGL | VCT India Contender | Looking for Sponsored Roster',
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=300&q=80',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    location: 'Mumbai, India',
    primaryGame: 'valorant',
    lftStatus: 'Actively Looking for Tier 1 / Tier 2 Team',
    scrimAvailability: 'Daily 6:00 PM – 11:30 PM IST',
    discord: 'Vortex#0001',
    bio: 'Competitive tactical FPS athlete with 4+ years of competitive experience across VCT Qualifiers and BMPS circuits. Shotcaller with disciplined macro comms and high clutch winrate.',
    stats: {
      valorant: { rank: 'IMMORTAL 3', rr: '284 RR', kd: '1.38', winrate: '68.4%', hs: '34%' },
      bgmi: { rank: 'Conqueror', points: '6400 pts', kd: '5.20', winrate: '42%', matches: '320' },
      freefire: { rank: 'Grandmaster', stars: '84 Stars', kd: '4.80', winrate: '38%', headshot: '62%' },
      coc: { th: 'Town Hall 17', warStars: '1,840', trophies: '5,820', clan: 'INDIA Warriors' },
      cr: { league: 'Ultimate Champion', trophies: '8,400', bestSeason: '#42 IN', winrate: '64%' },
      cod: { rank: 'Legendary', mpRank: 'Top 1000', kd: '2.14', accuracy: '31%' },
    },
    gameAccounts: {
      valorant: 'Vortex#IND',
      bgmi: '512948194 (SoulVortex)',
      freefire: '891240182 (VortexFF)',
      coc: '#2QP9LV0 (VortexClan)',
      cr: '#8P8Y20R (VortexCR)',
      cod: 'Vortex#91823',
    },
    careerMilestones: [
      { year: '2025', title: 'Top 4 — VCT India Challenger Series', team: 'Velocity Gaming (Trial)' },
      { year: '2025', title: 'Grand Finals Qualifier — BMPS Season 3', team: 'Soul Academy' },
      { year: '2024', title: 'Champion — Red Bull Campus Clutch India', team: 'Team Brutality' },
    ],
    connectionsCount: 428,
    isVerified: true,
  },
  {
    id: 'player-2',
    name: 'Mortal (Naman Mathur)',
    username: 'Mortal',
    tagline: 'Co-Owner S8UL | Esports Athlete & Mentor | BGMI Legend',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    location: 'Mumbai, India',
    primaryGame: 'bgmi',
    lftStatus: 'Active Roster — Team Soul',
    stats: { bgmi: { rank: 'Conqueror', kd: '6.40', winrate: '54%' } },
    gameAccounts: { bgmi: '518294810 (SoulMortal)' },
    connectionsCount: 12400,
    isVerified: true,
  },
  {
    id: 'player-3',
    name: 'ScoutOP (Tanmay Singh)',
    username: 'ScoutOP',
    tagline: 'Professional BGMI/PUBGM Athlete | Sniper & IGL | Team IND / OR Alum',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80',
    location: 'Valsad, India',
    primaryGame: 'bgmi',
    lftStatus: 'Active Roster',
    stats: { bgmi: { rank: 'Conqueror', kd: '7.10', winrate: '58%' } },
    gameAccounts: { bgmi: '528491029 (ScoutOP)' },
    connectionsCount: 9800,
    isVerified: true,
  },
  {
    id: 'player-4',
    name: 'Ayan "GodAyan" Sen',
    username: 'GodAyan',
    tagline: 'Free Fire Grandmaster Rusher | Total Gaming Tryout Finalist',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    location: 'Kolkata, India',
    primaryGame: 'freefire',
    lftStatus: 'Looking for Free Fire Pro League Squad',
    stats: { freefire: { rank: 'Grandmaster', kd: '5.80', winrate: '45%' } },
    gameAccounts: { freefire: '849104810 (AyanFF)' },
    connectionsCount: 310,
    isVerified: false,
  },
];

/* ── Initial Organizations ── */
const INITIAL_ORGS = [
  {
    id: 'org-s8ul',
    name: 'S8UL Esports',
    tag: 'S8UL',
    legalName: 'S8UL Gaming Entertainment Pvt Ltd',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
    banner: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
    verified: true,
    verificationStatus: 'verified', // 'unverified' | 'under_review' | 'verified'
    followers: 84200,
    isFollowing: true,
    location: 'Navi Mumbai, India',
    website: 'https://s8ulesports.com',
    twitter: '@S8ULesports',
    about: 'Leading South Asian Esports and Gaming organization. 2x Esports Awards Global Winner. Managing championship rosters in BGMI, Valorant, and Free Fire.',
    founded: '2020',
    games: ['bgmi', 'valorant', 'freefire'],
  },
  {
    id: 'org-ge',
    name: 'Global Esports',
    tag: 'GE',
    legalName: 'Global Esports Private Limited',
    logo: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=200&q=80',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    verified: true,
    verificationStatus: 'verified',
    followers: 61500,
    isFollowing: false,
    location: 'Mumbai, India',
    website: 'https://globalesports.com',
    twitter: '@GlobalEsportsIn',
    about: 'India’s only VCT Pacific franchise partner organization. Competing globally across FPS and Battle Royale titles.',
    founded: '2017',
    games: ['valorant', 'bgmi', 'cod'],
  },
  {
    id: 'org-godlike',
    name: 'Godlike Esports',
    tag: 'GODL',
    legalName: 'Godlike Esports LLP',
    logo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=200&q=80',
    banner: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
    verified: true,
    verificationStatus: 'verified',
    followers: 53900,
    isFollowing: false,
    location: 'Pune, India',
    website: 'https://godlike.gg',
    twitter: '@GodLike_in',
    about: 'Elite Indian esports powerhouse known for clutch plays, aggressive playstyle, and championship trophies.',
    founded: '2019',
    games: ['bgmi', 'freefire', 'cod'],
  },
  {
    id: 'org-totalgaming',
    name: 'Total Gaming Esports',
    tag: 'TG',
    legalName: 'Total Gaming Entertainment',
    logo: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=200&q=80',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    verified: true,
    verificationStatus: 'verified',
    followers: 78000,
    isFollowing: false,
    location: 'Ahmedabad, India',
    website: 'https://totalgaming.in',
    twitter: '@TotalGamingEsports',
    about: 'Home of India’s premier Free Fire roster. Champions of FFIC and international representatives.',
    founded: '2020',
    games: ['freefire', 'bgmi'],
  },
  {
    id: 'org-warriors',
    name: 'Warriors Gaming Clan',
    tag: 'WAR',
    legalName: 'Warriors Esports Syndicate',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
    banner: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
    verified: false,
    verificationStatus: 'under_review',
    followers: 12400,
    isFollowing: false,
    location: 'Delhi NCR, India',
    website: 'https://warriorsclan.in',
    twitter: '@WarriorsIndia',
    about: 'India’s top Clash of Clans and Clash Royale competitive clan. Over 800+ war wins and top 50 global ranking.',
    founded: '2016',
    games: ['coc', 'cr'],
  },
];

/* ── Initial Teams across the 6 Games ── */
const INITIAL_TEAMS = [
  {
    id: 'team-soul-bgmi',
    name: 'Team Soul',
    tag: 'SOUL',
    game: 'bgmi',
    orgId: 'org-s8ul',
    orgName: 'S8UL Esports',
    verified: true,
    division: 'BMPS Pro — Grand Finals',
    winrate: '82%',
    captainId: 'player-2',
    slotsMax: 5,
    roster: [
      { id: 'm1', name: 'Mortal', role: 'IGL / Shotcaller', ign: 'SoulMortal', isCaptain: true },
      { id: 'm2', name: 'Neyo', role: 'Main Assaulter', ign: 'SoulNeyo' },
      { id: 'm3', name: 'Ronak', role: 'Support / DMR', ign: 'SoulRonak' },
      { id: 'm4', name: 'Manya', role: 'Entry Fragger', ign: 'SoulManya' },
    ],
    openRoles: [
      { id: 'role-soul-sub', roleName: 'Fifth Sub / Flex Fragger', description: 'Conqueror tier BGMI assaulter with device verification.', requirements: 'Peak Conqueror, 5+ KD in scrims' },
    ],
  },
  {
    id: 'team-ge-val',
    name: 'Global Esports Red',
    tag: 'GE',
    game: 'valorant',
    orgId: 'org-ge',
    orgName: 'Global Esports',
    verified: true,
    division: 'VCT India — Tier 1',
    winrate: '74%',
    captainId: 'player-me',
    slotsMax: 5,
    roster: [
      { id: 'm5', name: 'Alex "Vortex"', role: 'Duelist / Flex', ign: 'Vortex#IND', isCaptain: true },
      { id: 'm6', name: 'Lightning', role: 'Initiator', ign: 'Lightning#GE' },
      { id: 'm7', name: 'SkRossi (Trial)', role: 'Jett / Operator', ign: 'SkR#IND' },
      { id: 'm8', name: 'Arav', role: 'Sentinel', ign: 'Arav#001' },
    ],
    openRoles: [
      { id: 'role-ge-ctrl', roleName: 'Main Controller (Omen/Viper)', description: 'Seeking Immortal 3+ tactical controller for VCT India Split 2.', requirements: 'Peak Immortal 3+, Fluent comms, daily scrims' },
    ],
  },
  {
    id: 'team-godl-bgmi',
    name: 'Godlike Esports',
    tag: 'GODL',
    game: 'bgmi',
    orgId: 'org-godlike',
    orgName: 'Godlike Esports',
    verified: true,
    division: 'BMPS Pro — Grand Finals',
    winrate: '78%',
    captainId: 'player-3',
    slotsMax: 5,
    roster: [
      { id: 'm9', name: 'Jonathan', role: 'Assaulter / Fragger', ign: 'GodLJonathan', isCaptain: true },
      { id: 'm10', name: 'Zgod', role: 'Support / Healer', ign: 'GodLZgod' },
      { id: 'm11', name: 'Shadow', role: 'IGL', ign: 'GodLShadow' },
      { id: 'm12', name: 'ClutchGod', role: 'Flex', ign: 'GodLClutch' },
    ],
    openRoles: [],
  },
  {
    id: 'team-tg-ff',
    name: 'Total Gaming Esports',
    tag: 'TG',
    game: 'freefire',
    orgId: 'org-totalgaming',
    orgName: 'Total Gaming Esports',
    verified: true,
    division: 'Free Fire India Pro — Div 1',
    winrate: '76%',
    captainId: 'player-4',
    slotsMax: 4,
    roster: [
      { id: 'm13', name: 'Mafia', role: 'Rusher', ign: 'TG_Mafia', isCaptain: true },
      { id: 'm14', name: 'FozyAjay', role: 'Sniper', ign: 'TG_Fozy' },
      { id: 'm15', name: 'Bala', role: 'Support', ign: 'TG_Bala' },
    ],
    openRoles: [
      { id: 'role-tg-4th', roleName: 'Main Rusher (Slot 4)', description: 'Looking for aggressive Grandmaster entry rusher for FFIC 2026.', requirements: 'Grandmaster, 55%+ headshot rate, Tournament proof' },
    ],
  },
  {
    id: 'team-war-coc',
    name: 'INDIA Warriors',
    tag: 'WAR',
    game: 'coc',
    orgId: 'org-warriors',
    orgName: 'Warriors Gaming Clan',
    verified: true,
    division: 'Legend League — Top 200 India',
    winrate: '80%',
    captainId: 'player-me',
    slotsMax: 15,
    roster: [
      { id: 'm16', name: 'Leader Shogun', role: 'Clan Leader', ign: '#2QP9LV0', isCaptain: true },
      { id: 'm17', name: 'Co-Leader Raj', role: 'War Base Specialist', ign: '#89LV129' },
      { id: 'm18', name: 'Vikram TH17', role: 'Legend League Attacker', ign: '#9012KA0' },
      { id: 'm19', name: 'Aman Pro', role: 'CWL Attacker', ign: '#KL02931' },
    ],
    openRoles: [
      { id: 'role-coc-th17', roleName: 'Town Hall 17 Max War Attacker', description: 'Looking for high 3-star percentage attackers for Champion CWL.', requirements: 'TH17 Maxed Heroes, 5600+ Trophies' },
    ],
  },
  {
    id: 'team-synergy-cod',
    name: 'SynerGY India',
    tag: 'SYN',
    game: 'cod',
    orgId: 'org-ge',
    orgName: 'Global Esports',
    verified: true,
    division: 'COD Mobile World — India Region',
    winrate: '75%',
    captainId: 'player-me',
    slotsMax: 5,
    roster: [
      { id: 'm20', name: 'Vortex COD', role: 'Anchor / AR', ign: 'Vortex#91823', isCaptain: true },
      { id: 'm21', name: 'GhostIN', role: 'SMG Rusher', ign: 'Ghost#001' },
      { id: 'm22', name: 'Spectre', role: 'Sniper (DL Q33)', ign: 'Spectre#881' },
      { id: 'm23', name: 'Blaze', role: 'Support / Trophy', ign: 'Blaze#212' },
    ],
    openRoles: [
      { id: 'role-cod-flex', roleName: 'Flex SMG / Slayer', description: 'Need aggressive slayer for upcoming Stage 4 Regional Qualifier.', requirements: 'Legendary 12K+ Points, Low latency device' },
    ],
  },
  {
    id: 'team-cr-phoenix',
    name: 'Phoenix Force CR',
    tag: 'PHX',
    game: 'cr',
    orgId: 'org-warriors',
    orgName: 'Warriors Gaming Clan',
    verified: true,
    division: 'Ultimate Championship — India Top 50',
    winrate: '79%',
    captainId: 'player-me',
    slotsMax: 3,
    roster: [
      { id: 'm24', name: 'CrownMaster', role: 'Main 1v1 Ladder', ign: '#8P8Y20R', isCaptain: true },
      { id: 'm25', name: 'PekkaGod', role: 'Beatdown Specialist', ign: '#99QP812' },
    ],
    openRoles: [
      { id: 'role-cr-cycle', roleName: 'Fast Cycle / Miner Control Specialist', description: 'Crown Championship South Asia representation.', requirements: 'Top 200 India Finish, 12-win Grand Challenge badge' },
    ],
  },
];

/* ── Initial LinkedIn-Style Community Feed Posts ── */
const INITIAL_POSTS = [
  {
    id: 'post-1',
    authorName: 'S8UL Esports',
    authorHandle: '@S8ULesports',
    authorAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
    isOrg: true,
    isVerified: true,
    category: 'Org Announcement',
    game: 'bgmi',
    content: '🚨 OFFICIAL ANNOUNCEMENT: Tryouts are now formally open for our 5th roster slot on Team Soul (BGMI Division) ahead of BMPS Season 4 Grand Finals! We are actively scouting players with proven tier-1 scrim records. Apply via the Recruitment tab with your tracker ID & VOD link.',
    createdAt: '2 hours ago',
    likes: 842,
    likedByMe: false,
    comments: [
      { id: 'c1', user: 'Vortex', text: 'Dossier and VOD package submitted through the portal! Excited for this opportunity.', time: '1h ago' },
      { id: 'c2', user: 'ScoutOP', text: 'Big move! Hope to see a cracked fifth on the roster.', time: '45m ago' },
    ],
    shares: 94,
  },
  {
    id: 'post-2',
    authorName: 'Alex "Vortex" Chauhan',
    authorHandle: '@Vortex_VAL',
    authorAvatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=300&q=80',
    isOrg: false,
    isVerified: true,
    category: 'LFT / Tryout',
    game: 'valorant',
    content: '🎯 [LFT - VALORANT TIER 1 / TIER 2]\n\n• Peak Rank: Immortal 3 (284 RR)\n• Primary Role: Flex Duelist / IGL\n• Main Agents: Jett, Raze, Omen\n• Scrim Hours: 6:00 PM – Midnight IST\n\nLooking for an ambitious, org-backed team aiming for VCT India Split. Full VOD review and match analytics linked on my profile. DMs and tryout offers open!',
    createdAt: '5 hours ago',
    likes: 312,
    likedByMe: true,
    comments: [
      { id: 'c3', user: 'Global Esports', text: 'DM sent regarding our upcoming tryout block next Tuesday.', time: '3h ago' },
    ],
    shares: 48,
  },
  {
    id: 'post-3',
    authorName: 'Global Esports',
    authorHandle: '@GlobalEsportsIn',
    authorAvatar: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=200&q=80',
    isOrg: true,
    isVerified: true,
    category: 'Match Result',
    game: 'valorant',
    content: '🔥 GGWP! Secured 2-1 victory against Team Vitality in tonight’s international scrim block on Haven & Sunset. Our new controller lineup showed disciplined utility execution. Full tournament schedule coming this Friday.',
    createdAt: '8 hours ago',
    likes: 521,
    likedByMe: false,
    comments: [],
    shares: 31,
  },
  {
    id: 'post-4',
    authorName: 'Total Gaming Esports',
    authorHandle: '@TotalGamingEsports',
    authorAvatar: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=200&q=80',
    isOrg: true,
    isVerified: true,
    category: 'Recruitment',
    game: 'freefire',
    content: '⚔️ Free Fire India Championship (FFIC) 2026 Tryouts are active! If you hold a 55%+ headshot rate and competitive scrim tournament experience, check our team openings on Gamers’G.',
    createdAt: '1 day ago',
    likes: 670,
    likedByMe: false,
    comments: [],
    shares: 82,
  },
];

/* ── Initial Applications ── */
const INITIAL_APPLICATIONS = [
  {
    id: 'app-1',
    teamId: 'team-soul-bgmi',
    teamName: 'Team Soul',
    game: 'bgmi',
    roleName: 'Fifth Sub / Flex Fragger',
    applicantId: 'player-me',
    applicantName: 'Alex "Vortex" Chauhan',
    applicantRank: 'Conqueror (6400 pts)',
    pitch: 'Competitive BGMI flex assaulter with 5.2 KD. Top 4 BMPS experience with disciplined IGL comms.',
    vodLink: 'https://youtu.be/sample-vod-scrim-highlight',
    status: 'shortlisted', // 'applied' | 'shortlisted' | 'accepted' | 'rejected'
    appliedAt: '2 days ago',
  },
  {
    id: 'app-2',
    teamId: 'team-tg-ff',
    teamName: 'Total Gaming Esports',
    game: 'freefire',
    roleName: 'Main Rusher (Slot 4)',
    applicantId: 'player-4',
    applicantName: 'Ayan "GodAyan" Sen',
    applicantRank: 'Grandmaster (84 Stars)',
    pitch: 'Grandmaster rusher with 5.8 KD and 62% headshot rate in competitive scrim lobbies.',
    vodLink: 'https://youtu.be/freefire-ayan-highlights',
    status: 'applied',
    appliedAt: '4 hours ago',
  },
];

export function GameStoreProvider({ children }) {
  // Load or fallback
  const [storeState, setStoreState] = useState(() => {
    if (import.meta.env.PROD) {
      return {
        activeRole: 'player', activeOrgId: null,
        currentUser: { id: '', name: '', username: '', avatar: '', stats: {}, gameAccounts: {} },
        players: [], orgs: [], teams: [], posts: [], applications: [],
        connectedPlayerIds: [], followedOrgIds: [],
      };
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load store from localStorage', e);
    }
    return {
      activeRole: 'player', // 'player' | 'org' — allows instant testing of both views!
      activeOrgId: 'org-s8ul',
      currentUser: INITIAL_PLAYERS[0],
      players: INITIAL_PLAYERS,
      orgs: INITIAL_ORGS,
      teams: INITIAL_TEAMS,
      posts: INITIAL_POSTS,
      applications: INITIAL_APPLICATIONS,
      connectedPlayerIds: ['player-2', 'player-3'],
      followedOrgIds: ['org-s8ul'],
    };
  });

  // Save on state change
  useEffect(() => {
    if (import.meta.env.PROD) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storeState));
    } catch (e) {
      console.error('Failed to save store to localStorage', e);
    }
  }, [storeState]);

  // Initial sync with live backend if available
  useEffect(() => {
    async function syncBackendData() {
      try {
        const [teamsResult, feedResult] = await Promise.allSettled([
          discoveryService.getTeams(),
          socialService.getFeed(),
        ]);
        if (teamsResult.status === 'fulfilled') {
          const teamsRes = teamsResult.value;
          const backendTeams = Array.isArray(teamsRes) ? teamsRes : (teamsRes?.data || []);
          setStoreState((prev) => {
            const newTeams = backendTeams.map((bt) => ({
                id: bt.id,
                name: bt.name,
                tag: bt.tag || bt.name.slice(0, 4).toUpperCase(),
                game: bt.game?.toLowerCase() || 'valorant',
                orgId: bt.org_id,
                orgName: bt.org_name || 'Independent Squad',
                verified: Boolean(bt.org_id),
                division: bt.division || 'Competitive',
                winrate: bt.winrate || '0%',
                captainId: bt.captain_id || null,
                slotsMax: bt.slots_max || 5,
                roster: [],
                openRoles: [],
                membersCount: bt.members_count || 0,
              }));
            return { ...prev, teams: import.meta.env.PROD ? newTeams : [...newTeams, ...prev.teams] };
          });
        }
        if (feedResult.status === 'fulfilled') {
          const posts = Array.isArray(feedResult.value) ? feedResult.value.map(fromApiPost) : [];
          setStoreState((prev) => ({ ...prev, posts: import.meta.env.PROD ? posts : [...posts, ...prev.posts] }));
        }
      } catch (err) {
        // Backend offline; local store functions smoothly
      }
    }

    syncBackendData();
  }, []);

  /* ── Switch Active Perspective (Player vs Org) ── */
  const setActiveRole = (role) => {
    setStoreState((prev) => ({ ...prev, activeRole: role }));
  };

  const setActiveOrgId = (orgId) => {
    setStoreState((prev) => ({ ...prev, activeOrgId: orgId }));
  };

  const setTeamDetails = (teamId, details) => {
    setStoreState((prev) => ({ ...prev, teams: prev.teams.map((team) => team.id === teamId ? { ...team, ...details } : team) }));
  };

  const setCurrentUser = (user) => {
    if (!user) return;
    setStoreState((prev) => ({
      ...prev,
      currentUser: {
        ...prev.currentUser,
        id: user.id || prev.currentUser.id,
        name: user.name || user.username || user.email?.split('@')[0] || prev.currentUser.name,
        username: user.username || user.email?.split('@')[0] || prev.currentUser.username,
        email: user.email || prev.currentUser.email,
        role: user.role || prev.currentUser.role,
        isVerified: !!user.verified,
        tagline: user.tagline || prev.currentUser.tagline,
        primaryGame: user.primary_game || prev.currentUser.primaryGame,
        bio: user.bio || prev.currentUser.bio,
        avatar: user.avatar_url || prev.currentUser.avatar,
        stats: user.stats || prev.currentUser.stats,
        gameAccounts: user.game_accounts || prev.currentUser.gameAccounts,
        location: user.location || prev.currentUser.location,
      },
    }));
    if (user.role === 'player') {
      Promise.all([socialService.getConnections(), socialService.getFollows(), socialService.getRecommendedPlayers()])
        .then(([connections, follows, recommended]) => setStoreState((prev) => ({
          ...prev,
          connectedPlayerIds: connections.map((player) => player.id),
          followedOrgIds: follows.filter((follow) => follow.target_type === 'org').map((follow) => follow.target_id),
          players: recommended.map((player) => ({
            ...player, name: player.username, avatar: player.avatar_url,
            primaryGame: player.primary_game, lftStatus: player.lft_status,
          })),
        })))
        .catch(() => {});
    }
    if (['player', 'org', 'admin'].includes(user.role)) {
      recruitmentService.getApplications()
        .then((applications) => setStoreState((prev) => ({ ...prev, applications: applications.map(fromApiApplication) })))
        .catch(() => {});
    }
  };

  /* ── LinkedIn-Style Profile Update ── */
  const updateCurrentUserProfile = (updates) => {
    setStoreState((prev) => {
      const updatedUser = { ...prev.currentUser, ...updates };
      const updatedPlayers = prev.players.map((p) =>
        p.id === updatedUser.id ? updatedUser : p
      );
      return {
        ...prev,
        currentUser: updatedUser,
        players: updatedPlayers,
      };
    });
  };

  /* ── Team Formation (NO SEPARATE LOGIN! Any player or org creates teams) ── */
  const createTeam = async ({ name, tag, game, orgId = null, orgName = '', division = 'Open Tier', slotsMax = 5, initialMembers = [], openRoles = [] }) => {
    const created = await teamService.createTeam({
      name, tag, game, division, slots_max: Number(slotsMax),
      members: initialMembers.filter((member) => !member.isCaptain).map(({ name: memberName, ign, role }) => ({ name: memberName, ign, role })),
    });
    const postingResults = await Promise.allSettled(openRoles.map((posting) => teamService.createPosting(created.id, {
      role: posting.roleName, description: posting.description,
    })));
    const newTeam = {
      id: created.id, name: created.name, tag: created.tag || tag || name.slice(0, 4).toUpperCase(), game: created.game,
      orgId: created.org_id, orgName: orgName || 'Independent Squad', verified: false,
      division: created.division || division, winrate: '0%', captainId: created.captain_id,
      slotsMax: created.slots_max || Number(slotsMax) || 5,
      roster: (created.members || []).map((member) => ({ ...member, isCaptain: member.is_captain })),
      openRoles: postingResults.filter((result) => result.status === 'fulfilled').map((result) => ({
        id: result.value.id, roleName: result.value.role, description: result.value.description || '',
      })),
    };

    setStoreState((prev) => ({
      ...prev,
      teams: [newTeam, ...prev.teams],
    }));

    return newTeam;
  };

  /* ── Roster & Open Role Management ── */
  const addTeamMember = async (teamId, member) => {
    const result = await teamService.addMember(teamId, { name: member.name, ign: member.ign, role: member.role });
    setStoreState((prev) => ({
      ...prev,
      teams: prev.teams.map((t) => {
        if (t.id !== teamId) return t;
        return { ...t, roster: result.members.map((item) => ({ ...item, isCaptain: item.is_captain })), status: result.status };
      }),
    }));
  };

  const removeTeamMember = async (teamId, memberId) => {
    await teamService.removeMember(teamId, memberId);
    const fresh = await teamService.getTeam(teamId);
    setStoreState((prev) => ({
      ...prev,
      teams: prev.teams.map((t) => {
        if (t.id !== teamId) return t;
        return { ...t, roster: (fresh.members || []).map((item) => ({ ...item, isCaptain: item.is_captain })), status: fresh.status };
      }),
    }));
  };

  const openRecruitmentRole = async (teamId, roleData) => {
    const role = await teamService.createPosting(teamId, { role: roleData.roleName, description: roleData.description });
    setStoreState((prev) => ({
      ...prev,
      teams: prev.teams.map((t) => {
        if (t.id !== teamId) return t;
        const newRole = {
          id: role.id,
          roleName: role.role,
          description: role.description || '',
          requirements: roleData.requirements || '',
        };
        return {
          ...t,
          openRoles: [...t.openRoles, newRole],
        };
      }),
    }));
  };

  const closeRecruitmentRole = async (teamId, roleId) => {
    await teamService.closePosting(roleId);
    setStoreState((prev) => ({
      ...prev,
      teams: prev.teams.map((t) => {
        if (t.id !== teamId) return t;
        return {
          ...t,
          openRoles: t.openRoles.filter((r) => r.id !== roleId),
        };
      }),
    }));
  };

  /* ── Tryouts Application Pipeline ── */
  const submitApplication = async ({ postingId, teamId, roleName, pitch, vodLink }) => {
    const response = await teamService.applyToPosting(postingId, pitch, vodLink);
    const targetTeam = storeState.teams.find((team) => team.id === teamId);
    const newApp = fromApiApplication({ ...response, team_id: teamId, team_name: targetTeam?.name, game: targetTeam?.game, role: roleName, applicant_name: storeState.currentUser.name });
    setStoreState((prev) => ({
      ...prev,
      applications: [newApp, ...prev.applications],
    }));

    return newApp;
  };

  const updateApplicationStatus = async (appId, status) => {
    await recruitmentService.updateStatus(appId, status);
    setStoreState((prev) => {
      const updatedApplications = prev.applications.map((a) =>
        a.id === appId ? { ...a, status } : a
      );

      return {
        ...prev,
        applications: updatedApplications,
      };
    });
  };

  /* ── Org Verification System ── */
  const submitOrgVerification = (orgId, verificationForm) => {
    setStoreState((prev) => ({
      ...prev,
      orgs: prev.orgs.map((o) => {
        if (o.id !== orgId) return o;
        return {
          ...o,
          legalName: verificationForm.legalName || o.legalName,
          gstNumber: verificationForm.gstNumber || '27AABCU9603R1ZM',
          website: verificationForm.website || o.website,
          twitter: verificationForm.twitter || o.twitter,
          verificationStatus: 'under_review',
        };
      }),
    }));
  };

  const approveOrgVerification = (orgId) => {
    setStoreState((prev) => ({
      ...prev,
      orgs: prev.orgs.map((o) => {
        if (o.id !== orgId) return o;
        return {
          ...o,
          verified: true,
          verificationStatus: 'verified',
        };
      }),
      teams: prev.teams.map((t) => {
        if (t.orgId !== orgId) return t;
        return { ...t, verified: true };
      }),
    }));
  };

  /* ── Follow / Unfollow Organization ── */
  const toggleFollowOrg = async (orgId) => {
    const isFollowing = storeState.followedOrgIds.includes(orgId);
    try {
      if (isFollowing) await socialService.unfollow(orgId, 'org');
      else await socialService.follow(orgId, 'org');
    } catch (error) { throw error; }
    setStoreState((prev) => {
      const isFollowing = prev.followedOrgIds.includes(orgId);
      const newFollowed = isFollowing
        ? prev.followedOrgIds.filter((id) => id !== orgId)
        : [...prev.followedOrgIds, orgId];

      const newOrgs = prev.orgs.map((o) => {
        if (o.id !== orgId) return o;
        return {
          ...o,
          isFollowing: !isFollowing,
          followers: isFollowing ? o.followers - 1 : o.followers + 1,
        };
      });

      return {
        ...prev,
        followedOrgIds: newFollowed,
        orgs: newOrgs,
      };
    });
  };

  /* ── Player Connection (LinkedIn Style) ── */
  const toggleConnectPlayer = async (playerId) => {
    if (storeState.connectedPlayerIds.includes(playerId)) return;
    try { await socialService.connect(playerId); }
    catch (error) { throw error; }
    setStoreState((prev) => {
      const newConnected = prev.connectedPlayerIds.includes(playerId) ? prev.connectedPlayerIds : [...prev.connectedPlayerIds, playerId];

      return {
        ...prev,
        connectedPlayerIds: newConnected,
        currentUser: {
          ...prev.currentUser,
          connectionsCount: (prev.currentUser.connectionsCount || 0) + 1,
        },
      };
    });
  };

  /* ── Community Feed Posts & Comments ── */
  const createPost = async ({ content, category = 'General', game = 'valorant' }) => {
    const response = await socialService.createPost({ content, category, game });
    const newPost = fromApiPost(response);
    setStoreState((prev) => ({ ...prev, posts: [newPost, ...prev.posts] }));
    return newPost;
  };

  const toggleLikePost = async (postId) => {
    try {
      const result = await socialService.likePost(postId);
      setStoreState((prev) => ({ ...prev, posts: prev.posts.map((post) => post.id !== postId ? post : {
        ...post, likedByMe: result.liked, likes: Math.max(0, post.likes + (result.liked ? 1 : -1)),
      }) }));
    } catch (error) { throw error; }
  };

  const addCommentToPost = async (postId, text) => {
    if (!text.trim()) return;
    try {
      const comment = await socialService.addComment(postId, text);
      setStoreState((prev) => ({ ...prev, posts: prev.posts.map((post) => post.id !== postId ? post : {
        ...post, comments: [...post.comments, { id: comment.id, authorName: comment.author_name, createdAt: new Date(comment.created_at).toLocaleString(), content: comment.content }],
      }) }));
    } catch (error) { throw error; }
  };

  const value = {
    ...storeState,
    setCurrentUser,
    setActiveRole,
    setActiveOrgId,
    setTeamDetails,
    updateCurrentUserProfile,
    createTeam,
    addTeamMember,
    removeTeamMember,
    openRecruitmentRole,
    closeRecruitmentRole,
    submitApplication,
    updateApplicationStatus,
    submitOrgVerification,
    approveOrgVerification,
    toggleFollowOrg,
    toggleConnectPlayer,
    createPost,
    toggleLikePost,
    addCommentToPost,
  };

  return (
    <GameStoreContext.Provider value={value}>
      {children}
    </GameStoreContext.Provider>
  );
}

export function useGameStore() {
  const context = useContext(GameStoreContext);
  if (!context) {
    throw new Error('useGameStore must be used within a GameStoreProvider');
  }
  return context;
}
