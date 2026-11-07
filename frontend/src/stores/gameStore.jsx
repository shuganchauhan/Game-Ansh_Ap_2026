import React, { createContext, useContext, useState, useEffect } from 'react';
import { discoveryService, teamService, socialService, recruitmentService, playerService } from '../services';
import { useAuth } from './authContext';

const GameStoreContext = createContext();

const STORAGE_KEY = 'gamersg_store_v1';

const GUEST_ATHLETE = {
  id: '',
  name: 'Gamer Athlete',
  username: 'gamer',
  tagline: 'Competitive Esports Athlete',
  avatar: '',
  banner: '',
  location: 'India',
  primaryGame: 'valorant',
  lftStatus: 'Available for Roster',
  scrimAvailability: 'Daily Evenings IST',
  discord: '',
  bio: 'Competitive esports athlete ready for tournament rosters and practice scrims.',
  stats: {},
  gameAccounts: {},
  careerMilestones: [],
  connectionsCount: 0,
  isVerified: false,
};

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

/* ── Initial Mock Players (Competitive Athlete Network) ── */
const INITIAL_PLAYERS = [
  {
    id: 'player-me',
    name: 'Alex "Vortex" Chauhan',
    username: 'Vortex',
    tagline: 'Tier 1 Flex Duelist & IGL | VCT India Contender | Looking for Sponsored Roster',
    avatar: '',
    banner: '',
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
    avatar: '',
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
    avatar: '',
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
    avatar: '',
    location: 'Kolkata, India',
    primaryGame: 'freefire',
    lftStatus: 'Looking for Free Fire Pro League Squad',
    stats: { freefire: { rank: 'Grandmaster', kd: '5.80', winrate: '45%' } },
    gameAccounts: { freefire: '849104810 (AyanFF)' },
    connectionsCount: 310,
    isVerified: false,
  },
  {
    id: 'player-5',
    name: 'Jonathan "JONATHAN" Amaral',
    username: 'JONATHAN',
    tagline: 'Professional BGMI Athlete | 3x MVP PMIS/BGIS | Two-Thumb Gyro Legend',
    avatar: '',
    location: 'Goa, India',
    primaryGame: 'bgmi',
    lftStatus: 'Available for Tier 1 Invitational Squads',
    stats: { bgmi: { rank: 'Conqueror', kd: '7.85', winrate: '62%' } },
    gameAccounts: { bgmi: '511223344 (GodLJONATHAN)' },
    connectionsCount: 15200,
    isVerified: true,
  },
  {
    id: 'player-6',
    name: 'Ganesh "SkRossi" Gangadhar',
    username: 'SkRossi',
    tagline: 'Valorant Duelist & Jett Operator Specialist | VCT Masters Qualifier',
    avatar: '',
    location: 'Bangalore, India',
    primaryGame: 'valorant',
    lftStatus: 'Looking for VCT India Contenders Team',
    stats: { valorant: { rank: 'RADIANTE', rr: '540 RR', kd: '1.45', winrate: '71%', hs: '38%' } },
    gameAccounts: { valorant: 'SkRossi#GE' },
    connectionsCount: 11400,
    isVerified: true,
  },
  {
    id: 'player-7',
    name: 'Harsh "Goblin" Paudwal',
    username: 'Goblin',
    tagline: 'BMPS MVP & Top Fragger | High-Tempo Close-Quarter Rusher',
    avatar: '',
    location: 'Mumbai, India',
    primaryGame: 'bgmi',
    lftStatus: 'Actively Looking for Team',
    stats: { bgmi: { rank: 'Conqueror', kd: '6.90', winrate: '52%' } },
    gameAccounts: { bgmi: '523948102 (GoblinOP)' },
    connectionsCount: 8900,
    isVerified: true,
  },
  {
    id: 'player-8',
    name: 'Ankit "VasiyoCRJ7" Pant',
    username: 'VasiyoCRJ7',
    tagline: 'Free Fire World Series Competitor | Strategic Shotcaller',
    avatar: '',
    location: 'Dehradun, India',
    primaryGame: 'freefire',
    lftStatus: 'Open for Pro League Tryouts',
    stats: { freefire: { rank: 'Grandmaster', kd: '5.20', winrate: '41%' } },
    gameAccounts: { freefire: '819203941 (TG_Vasiyo)' },
    connectionsCount: 7600,
    isVerified: true,
  },
  {
    id: 'player-9',
    name: 'Sabyasachi "Antidote" Bose',
    username: 'Antidote',
    tagline: 'Tactical Sentinel & Controller | Ex-CS:GO Veteran | Discipline & Comms',
    avatar: '',
    location: 'Kolkata, India',
    primaryGame: 'valorant',
    lftStatus: 'LFT — Tier 1 / Tier 2 Valorant',
    stats: { valorant: { rank: 'IMMORTAL 3', rr: '310 RR', kd: '1.28', winrate: '64%', hs: '32%' } },
    gameAccounts: { valorant: 'Antidote#CAL' },
    connectionsCount: 6200,
    isVerified: true,
  },
  {
    id: 'player-10',
    name: 'Shubham "NinjaJOD" Sahoo',
    username: 'NinjaJOD',
    tagline: 'Fastest BGMI Entry Assaulter | GodLike Roster Alum',
    avatar: '',
    location: 'Bhubaneswar, India',
    primaryGame: 'bgmi',
    lftStatus: 'Looking for BGIS Championship Squad',
    stats: { bgmi: { rank: 'Conqueror', kd: '6.75', winrate: '55%' } },
    gameAccounts: { bgmi: '539102941 (NinjaJOD)' },
    connectionsCount: 7400,
    isVerified: true,
  },
];

/* ── Initial Pending Squad Invitations (Unstop-style) ── */
const INITIAL_INVITATIONS = [
  {
    id: 'inv-godl-1',
    team_id: 'team-godl-bgmi',
    team_name: 'GodLike Esports',
    team_tag: 'GODL',
    team_game: 'bgmi',
    division: 'BGIS Grand Finals Circuit',
    role: 'Co-Assaulter / Entry Fragger',
    inviter_name: 'GodL Captain',
    message: 'We noticed your recent scrim performances and tournament kill-records. We want you on our official 5-man roster for the upcoming major.',
    status: 'pending',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    slots_max: 5,
    member_count: 3,
  },
  {
    id: 'inv-ge-1',
    team_id: 'team-ge-val',
    team_name: 'Global Esports Red',
    team_tag: 'GE',
    team_game: 'valorant',
    division: 'VCT Pacific Challenger Tier 1',
    role: 'Initiator / Flash Support',
    inviter_name: 'GE Captain',
    message: 'Your clutch statistics in recent competitive cups align with our squad playbook. Join us for the upcoming VCT Challenger run.',
    status: 'pending',
    created_at: new Date(Date.now() - 3600000 * 14).toISOString(),
    slots_max: 5,
    member_count: 4,
  },
];

/* ── Initial Organizations ── */
const INITIAL_ORGS = [
  {
    id: 'org-s8ul',
    name: 'S8UL Esports',
    tag: 'S8UL',
    legalName: 'S8UL Gaming Entertainment Pvt Ltd',
    logo: '',
    banner: '',
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
    logo: '',
    banner: '',
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
    logo: '',
    banner: '',
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
    logo: '',
    banner: '',
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
    logo: '',
    banner: '',
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

/* ── Initial Community Feed Posts ── */
const INITIAL_POSTS = [
  {
    id: 'post-1',
    authorName: 'S8UL Esports',
    authorHandle: '@S8ULesports',
    authorAvatar: '',
    isOrg: true,
    isVerified: true,
    category: 'Org Announcement',
    game: 'bgmi',
    content: 'OFFICIAL ANNOUNCEMENT: Tryouts are now formally open for our 5th roster slot on Team Soul (BGMI Division) ahead of BMPS Season 4 Grand Finals! We are actively scouting players with proven tier-1 scrim records. Apply via the Recruitment tab with your tracker ID & VOD link.',
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
    authorAvatar: '',
    isOrg: false,
    isVerified: true,
    category: 'LFT / Tryout',
    game: 'valorant',
    content: '[LFT - VALORANT TIER 1 / TIER 2]\n\n• Peak Rank: Immortal 3 (284 RR)\n• Primary Role: Flex Duelist / IGL\n• Main Agents: Jett, Raze, Omen\n• Scrim Hours: 6:00 PM – Midnight IST\n\nLooking for an ambitious, org-backed team aiming for VCT India Split. Full VOD review and match analytics linked on my profile. DMs and tryout offers open!',
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
    authorAvatar: '',
    isOrg: true,
    isVerified: true,
    category: 'Match Result',
    game: 'valorant',
    content: 'GGWP! Secured 2-1 victory against Team Vitality in tonight’s international scrim block on Haven & Sunset. Our new controller lineup showed disciplined utility execution. Full tournament schedule coming this Friday.',
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
    authorAvatar: '',
    isOrg: true,
    isVerified: true,
    category: 'Recruitment',
    game: 'freefire',
    content: 'Free Fire India Championship (FFIC) 2026 Tryouts are active! If you hold a 55%+ headshot rate and competitive scrim tournament experience, check our team openings on Gamers’G.',
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
  const { user: authUser } = useAuth();

  // Load or fallback
  const [storeState, setStoreState] = useState(() => {
    try {
      const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.currentUser?.id === 'player-me' || !parsed.currentUser?.id) {
          parsed.currentUser = GUEST_ATHLETE;
        }
        return {
          ...parsed,
          players: (parsed.players && parsed.players.length > 0) ? parsed.players : INITIAL_PLAYERS,
          orgs: (parsed.orgs && parsed.orgs.length > 0) ? parsed.orgs : INITIAL_ORGS,
          teams: (parsed.teams && parsed.teams.length > 0) ? parsed.teams : INITIAL_TEAMS,
          posts: (parsed.posts && parsed.posts.length > 0) ? parsed.posts : INITIAL_POSTS,
          applications: (parsed.applications && parsed.applications.length > 0) ? parsed.applications : INITIAL_APPLICATIONS,
          connectedPlayerIds: parsed.connectedPlayerIds || [],
          followedOrgIds: parsed.followedOrgIds || [],
          myInvitations: (parsed.myInvitations && parsed.myInvitations.length > 0) ? parsed.myInvitations : INITIAL_INVITATIONS,
          teamInvitationsMap: parsed.teamInvitationsMap || {},
        };
      }
    } catch (e) {
      console.warn('Failed to load store from localStorage, using initial dataset:', e);
    }
    return {
      activeRole: 'player',
      activeOrgId: null,
      currentUser: GUEST_ATHLETE,
      players: INITIAL_PLAYERS,
      orgs: INITIAL_ORGS,
      teams: INITIAL_TEAMS,
      posts: INITIAL_POSTS,
      applications: INITIAL_APPLICATIONS,
      connectedPlayerIds: [],
      followedOrgIds: [],
      myInvitations: INITIAL_INVITATIONS,
      teamInvitationsMap: {},
    };
  });

  // Sync with auth user on login / logout
  useEffect(() => {
    if (authUser) {
      setStoreState((prev) => ({
        ...prev,
        currentUser: {
          ...prev.currentUser,
          id: authUser.id || prev.currentUser.id,
          name: authUser.name || authUser.username || authUser.email?.split('@')[0] || prev.currentUser.name,
          username: authUser.username || authUser.email?.split('@')[0] || prev.currentUser.username,
          email: authUser.email || prev.currentUser.email,
          role: authUser.role || prev.currentUser.role,
          isVerified: !!authUser.verified,
          tagline: authUser.tagline || prev.currentUser.tagline,
          primaryGame: authUser.primary_game || prev.currentUser.primaryGame,
          bio: authUser.bio || prev.currentUser.bio,
          avatar: authUser.avatar_url || prev.currentUser.avatar,
        },
        activeRole: authUser.role === 'org' ? 'org' : 'player',
        activeOrgId: authUser.role === 'org' ? authUser.id : null,
      }));
    } else {
      setStoreState((prev) => ({
        ...prev,
        currentUser: GUEST_ATHLETE,
        activeRole: 'player',
        activeOrgId: null,
      }));
    }
  }, [authUser]);

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
        const [teamsResult, feedResult, tourneysResult, playersResult] = await Promise.allSettled([
          discoveryService.getTeams(),
          socialService.getFeed(),
          discoveryService.getTournaments(),
          playerService.listPlayers(),
        ]);
        if (playersResult.status === 'fulfilled') {
          const pRes = playersResult.value;
          const backendPlayers = Array.isArray(pRes) ? pRes : (pRes?.data || []);
          if (backendPlayers.length > 0) {
            setStoreState((prev) => {
              const mappedBackend = backendPlayers.map((bp) => ({
                id: bp.id,
                name: bp.username,
                username: bp.username,
                game_ign: bp.game_ign || bp.username,
                tagline: bp.tagline || 'Competitive Esports Athlete',
                primaryGame: bp.primary_game || 'valorant',
                avatar: bp.avatar_url || '',
                lftStatus: bp.lft_status || 'Looking for Team',
                scrimAvailability: bp.scrim_availability || 'Available for evening scrims',
                stats: bp.stats || {},
                isVerified: true,
              }));
              const playerMap = new Map();
              [...mappedBackend, ...prev.players].forEach((p) => {
                if (p && p.id && !playerMap.has(p.id)) playerMap.set(p.id, p);
              });
              return { ...prev, players: Array.from(playerMap.values()) };
            });
          }
        }
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
            const teamMap = new Map();
            [...newTeams, ...prev.teams].forEach((t) => {
              if (t && t.id && !teamMap.has(t.id)) teamMap.set(t.id, t);
            });
            return { ...prev, teams: Array.from(teamMap.values()) };
          });
        }
        if (feedResult.status === 'fulfilled') {
          const remotePosts = Array.isArray(feedResult.value) ? feedResult.value.map(fromApiPost) : [];
          setStoreState((prev) => {
            const postMap = new Map();
            remotePosts.forEach((p) => {
              if (p && p.id) postMap.set(p.id, p);
            });
            (prev.posts || []).forEach((p) => {
              if (p && p.id && !postMap.has(p.id)) postMap.set(p.id, p);
            });
            return { ...prev, posts: Array.from(postMap.values()) };
          });
        }
        if (tourneysResult.status === 'fulfilled') {
          const tRes = tourneysResult.value;
          const backendTourneys = Array.isArray(tRes) ? tRes : (tRes?.data || []);
          if (backendTourneys.length > 0) {
            setStoreState((prev) => ({ ...prev, tournaments: backendTourneys }));
          }
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

      if (user.id && typeof user.id === 'number') {
        playerService.getPlayer(user.id)
          .then((dbPlayer) => {
            if (!dbPlayer) return;
            setStoreState((prev) => ({
              ...prev,
              currentUser: {
                ...prev.currentUser,
                name: dbPlayer.username || prev.currentUser.name,
                username: dbPlayer.username || prev.currentUser.username,
                tagline: dbPlayer.tagline || prev.currentUser.tagline,
                bio: dbPlayer.bio || prev.currentUser.bio,
                location: dbPlayer.location || prev.currentUser.location,
                primaryGame: dbPlayer.primary_game || prev.currentUser.primaryGame,
                discord: dbPlayer.discord || prev.currentUser.discord,
                lftStatus: dbPlayer.lft_status || prev.currentUser.lftStatus,
                scrimAvailability: dbPlayer.scrim_availability || prev.currentUser.scrimAvailability,
                gameAccounts: dbPlayer.game_accounts || prev.currentUser.gameAccounts,
                stats: dbPlayer.stats || prev.currentUser.stats,
                careerMilestones: dbPlayer.career_milestones || prev.currentUser.careerMilestones,
                avatar: dbPlayer.avatar_url || prev.currentUser.avatar,
                banner: dbPlayer.banner_url || prev.currentUser.banner,
              },
            }));
          })
          .catch(() => {});
      }
    }
      if (['player', 'org', 'admin'].includes(user.role)) {
        recruitmentService.getApplications()
          .then((applications) => setStoreState((prev) => ({ ...prev, applications: applications.map(fromApiApplication) })))
          .catch(() => {});

        teamService.listMyInvitations()
          .then((invites) => {
            const list = Array.isArray(invites) ? invites : (invites?.data || []);
            if (list.length > 0) {
              setStoreState((prev) => ({ ...prev, myInvitations: list }));
            }
          })
          .catch(() => {});
      }
  };

  /* ── Athlete Dossier Profile Update ── */
  const updateCurrentUserProfile = async (updates) => {
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

    const currentId = storeState.currentUser?.id;
    if (currentId && typeof currentId === 'number') {
      try {
        await playerService.updateProfile(currentId, {
          username: updates.username || updates.name,
          tagline: updates.tagline,
          bio: updates.bio,
          location: updates.location,
          lft_status: updates.lftStatus,
          scrim_availability: updates.scrimAvailability,
          discord: updates.discord,
          game_accounts: updates.gameAccounts,
          stats: updates.stats,
          career_milestones: updates.careerMilestones,
        });
      } catch (err) {
        console.warn('Backend player profile sync skipped/failed:', err?.message);
      }
    }
  };

  /* ── Team Formation (NO SEPARATE LOGIN! Any player or org creates teams) ── */
  const createTeam = async ({ name, tag, game, orgId = null, orgName = '', division = 'Open Tier', slotsMax = 5, initialMembers = [], openRoles = [], invitedAthletes = [] }) => {
    const clampedSlots = Math.min(10, Math.max(4, Number(slotsMax) || 5));
    const validMembersPayload = initialMembers
      .filter((member) => !member.isCaptain && (member.name?.trim() || member.ign?.trim()))
      .map(({ name: memberName, ign, role }) => ({
        name: (memberName || ign).trim(),
        ign: (ign || memberName).trim(),
        role: role?.trim() || 'Player / Member',
      }));

    let created = null;
    try {
      created = await teamService.createTeam({
        name: name.trim(),
        tag: tag?.trim() || name.slice(0, 4).toUpperCase(),
        game,
        division,
        slots_max: clampedSlots,
        members: validMembersPayload,
      });
    } catch (err) {
      console.warn('Backend teamService.createTeam error, using local fallback:', err.message);
      const isReg = initialMembers.length >= 4;
      created = {
        id: `team-${Date.now()}`,
        name: name.trim(),
        tag: tag?.trim() || name.slice(0, 4).toUpperCase(),
        game,
        division,
        slots_max: clampedSlots,
        status: isReg ? 'registered' : 'draft',
        org_id: orgId,
        captain_id: storeState.currentUser?.id || 'player-me',
        members: initialMembers.map((m) => ({
          id: m.id || `member-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: m.name,
          ign: m.ign,
          role: m.role || 'Member',
          is_captain: !!m.isCaptain,
        })),
      };
    }

    let postingResults = [];
    if (created.id && !created.id.startsWith('team-')) {
      postingResults = await Promise.allSettled(
        openRoles.map((posting) =>
          teamService.createPosting(created.id, {
            role: posting.roleName,
            description: posting.description,
          })
        )
      );
    }

    const newTeam = {
      id: created.id,
      name: created.name,
      tag: created.tag || tag || name.slice(0, 4).toUpperCase(),
      game: created.game,
      orgId: created.org_id || orgId,
      orgName: orgName || (orgId ? 'Organization Roster' : 'Independent Squad'),
      verified: !!created.verified,
      division: created.division || division,
      status: created.status || (initialMembers.length >= 4 ? 'registered' : 'draft'),
      winrate: '0%',
      captainId: created.captain_id || storeState.currentUser?.id,
      slotsMax: created.slots_max || clampedSlots,
      roster: (created.members && created.members.length > 0)
        ? created.members.map((member) => ({ ...member, isCaptain: member.is_captain || member.isCaptain }))
        : initialMembers.map((m) => ({ ...m, isCaptain: !!m.isCaptain })),
      openRoles: postingResults.length > 0
        ? postingResults.filter((r) => r.status === 'fulfilled').map((r) => ({
            id: r.value.id,
            roleName: r.value.role,
            description: r.value.description || '',
          }))
        : openRoles.map((r, idx) => ({
            id: `role-${Date.now()}-${idx}`,
            roleName: r.roleName,
            description: r.description || '',
          })),
    };

    setStoreState((prev) => ({
      ...prev,
      teams: [newTeam, ...prev.teams],
    }));

    // Auto-dispatch team invitations to selected athletes (Unstop-style request flow)
    if (invitedAthletes && invitedAthletes.length > 0) {
      for (const athlete of invitedAthletes) {
        if (!athlete || !athlete.id) continue;
        sendTeamInvitation(created.id, {
          playerId: athlete.id,
          role: athlete.role || 'Member',
          message: athlete.message || `Official squad invitation to join ${name.trim()}!`,
        }).catch((invErr) => console.warn('Invitation dispatch note:', invErr?.message));
      }
    }

    return newTeam;
  };

  /* ── Roster & Open Role Management ── */
  const addTeamMember = async (teamId, member) => {
    try {
      const result = await teamService.addMember(teamId, { name: member.name, ign: member.ign, role: member.role });
      setStoreState((prev) => ({
        ...prev,
        teams: prev.teams.map((t) => {
          if (t.id !== teamId) return t;
          return { ...t, roster: result.members.map((item) => ({ ...item, isCaptain: item.is_captain })), status: result.status };
        }),
      }));
    } catch (e) {
      console.warn('Backend addMember error, updating locally:', e.message);
      setStoreState((prev) => ({
        ...prev,
        teams: prev.teams.map((t) => {
          if (t.id !== teamId) return t;
          const updatedRoster = [...(t.roster || []), {
            id: `member-${Date.now()}`,
            name: member.name,
            ign: member.ign,
            role: member.role || 'Member',
            isCaptain: false,
          }];
          return {
            ...t,
            roster: updatedRoster,
            status: updatedRoster.length >= 4 ? 'registered' : 'draft',
          };
        }),
      }));
    }
  };

  const removeTeamMember = async (teamId, memberId) => {
    try {
      await teamService.removeMember(teamId, memberId);
      const fresh = await teamService.getTeam(teamId);
      setStoreState((prev) => ({
        ...prev,
        teams: prev.teams.map((t) => {
          if (t.id !== teamId) return t;
          return { ...t, roster: (fresh.members || []).map((item) => ({ ...item, isCaptain: item.is_captain })), status: fresh.status };
        }),
      }));
    } catch (e) {
      console.warn('Backend removeMember error, updating locally:', e.message);
      setStoreState((prev) => ({
        ...prev,
        teams: prev.teams.map((t) => {
          if (t.id !== teamId) return t;
          const updatedRoster = (t.roster || []).filter((m) => m.id !== memberId && m.player_id !== memberId);
          return {
            ...t,
            roster: updatedRoster,
            status: updatedRoster.length >= 4 ? 'registered' : 'draft',
          };
        }),
      }));
    }
  };

  const openRecruitmentRole = async (teamId, roleData) => {
    try {
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
            openRoles: [...(t.openRoles || []), newRole],
          };
        }),
      }));
    } catch (e) {
      console.warn('Backend createPosting error, updating locally:', e.message);
      setStoreState((prev) => ({
        ...prev,
        teams: prev.teams.map((t) => {
          if (t.id !== teamId) return t;
          const newRole = {
            id: `role-${Date.now()}`,
            roleName: roleData.roleName,
            description: roleData.description || '',
            requirements: roleData.requirements || '',
          };
          return {
            ...t,
            openRoles: [...(t.openRoles || []), newRole],
          };
        }),
      }));
    }
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

  /* ── Player Connection (Competitive Pro Network) ── */
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

  /* ── Team Invitations System (Unstop-style Squad Request & Acceptance) ── */
  const sendTeamInvitation = async (teamId, { playerId, role = 'Member', message = '' }) => {
    let created = null;
    const targetPlayer = storeState.players.find((p) => p.id === playerId || p.username === playerId);
    const targetTeam = storeState.teams.find((t) => t.id === teamId);

    try {
      created = await teamService.sendInvitation(teamId, { player_id: playerId, role, message });
    } catch (err) {
      console.warn('Backend sendInvitation error, recording locally:', err?.message);
      created = {
        id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        team_id: teamId,
        team_name: targetTeam?.name || 'Squad',
        team_tag: targetTeam?.tag || 'SQD',
        team_game: targetTeam?.game || 'bgmi',
        player_id: playerId,
        invited_by: storeState.currentUser?.id,
        inviter_name: storeState.currentUser?.name || storeState.currentUser?.username || 'Captain',
        role,
        message,
        status: 'pending',
        created_at: new Date().toISOString(),
        username: targetPlayer?.username || 'Athlete',
        game_ign: targetPlayer?.game_ign || targetPlayer?.username || 'IGN',
        avatar_url: targetPlayer?.avatar || '',
      };
    }

    setStoreState((prev) => {
      const existingTeamInvites = prev.teamInvitationsMap?.[teamId] || [];
      const newMap = {
        ...prev.teamInvitationsMap,
        [teamId]: [created, ...existingTeamInvites.filter((i) => i.id !== created.id)],
      };

      const isTargetActiveUser = prev.currentUser?.id === playerId || prev.currentUser?.username === playerId;
      const updatedMyInvites = isTargetActiveUser
        ? [created, ...prev.myInvitations.filter((i) => i.id !== created.id)]
        : prev.myInvitations;

      return {
        ...prev,
        teamInvitationsMap: newMap,
        myInvitations: updatedMyInvites,
      };
    });

    return created;
  };

  const respondToInvitation = async (inviteId, action) => {
    let res = null;
    try {
      res = await teamService.respondInvitation(inviteId, action);
    } catch (err) {
      console.warn('Backend respondInvitation error, updating locally:', err?.message);
    }

    setStoreState((prev) => {
      const targetInvite = prev.myInvitations.find((i) => i.id === inviteId);
      const remainingMyInvites = prev.myInvitations.filter((i) => i.id !== inviteId);

      if (action === 'accept' && targetInvite) {
        const teamId = targetInvite.team_id;
        const updatedTeams = prev.teams.map((t) => {
          if (t.id !== teamId) return t;
          const currentRoster = t.roster || [];
          const alreadyMember = currentRoster.some(
            (m) => m.id === prev.currentUser?.id || m.player_id === prev.currentUser?.id || m.name === prev.currentUser?.name
          );
          if (alreadyMember) return t;

          const newMember = {
            id: prev.currentUser?.id || `member-${Date.now()}`,
            player_id: prev.currentUser?.id,
            name: prev.currentUser?.name || prev.currentUser?.username || 'Athlete',
            ign: prev.currentUser?.game_ign || prev.currentUser?.username || 'IGN',
            role: targetInvite.role || 'Member',
            isCaptain: false,
          };
          const newRoster = [...currentRoster, newMember];
          return {
            ...t,
            roster: newRoster,
            status: newRoster.length >= 4 ? 'registered' : t.status,
          };
        });

        const currentTeamInvites = prev.teamInvitationsMap?.[teamId] || [];
        const updatedTeamInvites = currentTeamInvites.filter((i) => i.id !== inviteId);

        return {
          ...prev,
          myInvitations: remainingMyInvites,
          teams: updatedTeams,
          teamInvitationsMap: {
            ...prev.teamInvitationsMap,
            [teamId]: updatedTeamInvites,
          },
        };
      }

      return {
        ...prev,
        myInvitations: remainingMyInvites,
      };
    });

    return res || { id: inviteId, status: action === 'accept' ? 'accepted' : 'declined' };
  };

  const fetchMyInvitations = async () => {
    try {
      const res = await teamService.listMyInvitations();
      const list = Array.isArray(res) ? res : (res?.data || []);
      if (list.length > 0) {
        setStoreState((prev) => ({ ...prev, myInvitations: list }));
      }
    } catch (e) {}
  };

  const fetchTeamInvitations = async (teamId) => {
    try {
      const res = await teamService.listTeamInvitations(teamId);
      const list = Array.isArray(res) ? res : (res?.data || []);
      setStoreState((prev) => ({
        ...prev,
        teamInvitationsMap: {
          ...prev.teamInvitationsMap,
          [teamId]: list,
        },
      }));
      return list;
    } catch (e) {
      return storeState.teamInvitationsMap?.[teamId] || [];
    }
  };

  const cancelTeamInvitation = async (teamId, inviteId) => {
    try {
      await teamService.cancelInvitation(teamId, inviteId);
    } catch (e) {}
    setStoreState((prev) => ({
      ...prev,
      teamInvitationsMap: {
        ...prev.teamInvitationsMap,
        [teamId]: (prev.teamInvitationsMap?.[teamId] || []).filter((i) => i.id !== inviteId),
      },
    }));
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
    sendTeamInvitation,
    respondToInvitation,
    fetchMyInvitations,
    fetchTeamInvitations,
    cancelTeamInvitation,
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
