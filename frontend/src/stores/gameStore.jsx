import React, { createContext, useContext, useState, useEffect } from 'react';
import { discoveryService, teamService, socialService, recruitmentService, playerService } from '../services';
import { useAuth } from './authContext';

const GameStoreContext = createContext();

const STORAGE_KEY = 'gamersg_store_v2';

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

/* ── Clean Entity State (Live backend data will populate these) ── */
const INITIAL_PLAYERS = [];
const INITIAL_INVITATIONS = [];
const INITIAL_ORGS = [];
const INITIAL_TEAMS = [];
const INITIAL_POSTS = [];
const INITIAL_APPLICATIONS = [];

export function GameStoreProvider({ children }) {
  const { user: authUser } = useAuth();

  // Load or fallback
  const [storeState, setStoreState] = useState(() => {
    try {
      if (typeof localStorage !== "undefined") {
        // Purge legacy cache with mock data
        localStorage.removeItem("gamersg_store_v1");
      }
      const saved = typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      if (saved) {
        const parsed = JSON.parse(saved);
        const hasMockEntities = (parsed.players && parsed.players.some((p) => p.id === "player-me" || p.id === "player-mortal")) ||
                                (parsed.orgs && parsed.orgs.some((o) => o.id === "org-s8ul")) ||
                                (parsed.teams && parsed.teams.some((t) => t.id === "team-soul-bgmi"));
        if (!hasMockEntities) {
          if (parsed.currentUser?.id === "player-me" || !parsed.currentUser?.id) {
            parsed.currentUser = GUEST_ATHLETE;
          }
          return {
            ...parsed,
            players: parsed.players || [],
            orgs: parsed.orgs || [],
            teams: parsed.teams || [],
            posts: parsed.posts || [],
            applications: parsed.applications || [],
            connectedPlayerIds: parsed.connectedPlayerIds || [],
            followedOrgIds: parsed.followedOrgIds || [],
            myInvitations: parsed.myInvitations || [],
            teamInvitationsMap: parsed.teamInvitationsMap || {},
          };
        }
      }
    } catch (e) {
      console.warn("Failed to load store from localStorage:", e);
    }
    return {
      activeRole: "player",
      activeOrgId: null,
      currentUser: GUEST_ATHLETE,
      players: [],
      orgs: [],
      teams: [],
      posts: [],
      applications: [],
      connectedPlayerIds: [],
      followedOrgIds: [],
      myInvitations: [],
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
              return { ...prev, players: mappedBackend };
            });
          }
        }
        if (teamsResult.status === 'fulfilled') {
          const teamsRes = teamsResult.value;
          const backendTeams = Array.isArray(teamsRes) ? teamsRes : (teamsRes?.data || []);
          if (backendTeams.length > 0) {
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
              return { ...prev, teams: newTeams };
            });
          }
        }
        if (feedResult.status === 'fulfilled') {
          const remotePosts = Array.isArray(feedResult.value) ? feedResult.value.map(fromApiPost) : [];
          if (remotePosts.length > 0) {
            setStoreState((prev) => ({ ...prev, posts: remotePosts }));
          }
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
        captain_id: storeState.currentUser?.id || null,
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
          gstNumber: verificationForm.gstNumber || '',
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
