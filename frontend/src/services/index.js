import { api } from '../lib/api';

export const discoveryService = {
  getTeams: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/discovery/teams${qs ? `?${qs}` : ''}`);
  },
  getTournaments: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/discovery/tournaments${qs ? `?${qs}` : ''}`);
  },
};

export const teamService = {
  listTeams: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/teams${qs ? `?${qs}` : ''}`);
  },
  getTeam: (id) => api.get(`/teams/${id}`),
  createTeam: (data) => api.post('/teams', data),
  updateTeam: (id, data) => api.put(`/teams/${id}`, data),
  addMember: (teamId, data) => api.post(`/teams/${teamId}/members`, data),
  removeMember: (teamId, memberId) => api.delete(`/teams/${teamId}/members/${memberId}`),
  addPlayer: (teamId, playerId) => api.post(`/teams/${teamId}/players`, { player_id: playerId }),
  removePlayer: (teamId, playerId) => api.delete(`/teams/${teamId}/players/${playerId}`),
  getPostings: (teamId) => api.get(`/teams/${teamId}/postings`),
  createPosting: (teamId, data) => api.post(`/teams/${teamId}/postings`, data),
  closePosting: (postingId) => api.patch(`/postings/${postingId}/close`),
  applyToPosting: (postingId, pitch) => api.post(`/postings/${postingId}/apply`, { pitch }),
};

export const recruitmentService = {
  getApplication: (id) => api.get(`/applications/${id}`),
  updateStatus: (id, status) => api.patch(`/applications/${id}`, { status }),
};

export const tournamentService = {
  getTournament: (id) => api.get(`/tournaments/${id}`),
  createTournament: (data) => api.post('/tournaments', data),
  updateTournament: (id, data) => api.patch(`/tournaments/${id}`, data),
  registerTeam: (tournamentId, teamId) => api.post(`/tournaments/${tournamentId}/register`, { team_id: teamId }),
  getRegistrations: (tournamentId) => api.get(`/tournaments/${tournamentId}/registrations`),
  updateRegistration: (tournamentId, regId, status) =>
    api.patch(`/tournaments/${tournamentId}/registrations/${regId}`, { status }),
};

export const scrimService = {
  listScrims: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/tournaments/scrims${qs ? `?${qs}` : ''}`);
  },
  createScrim: (data) => api.post('/tournaments/scrims', data),
  getScrimLobby: (id) => api.get(`/tournaments/scrims/${id}`),
  updateCredentials: (id, data) => api.patch(`/tournaments/scrims/${id}/credentials`, data),
  registerTeam: (scrimId, teamId) => api.post(`/tournaments/scrims/${scrimId}/register`, { team_id: teamId }),
  updateCheckin: (scrimId, teamId, check_in_status) =>
    api.post(`/tournaments/scrims/${scrimId}/checkin/${teamId}`, { check_in_status }),
};

export const orgService = {
  getOrg: (id) => api.get(`/orgs/${id}`),
  submitVerification: (data) => api.post('/orgs/verification', data),
  getVerificationStatus: () => api.get('/orgs/verification/status'),
};

export const organizerService = {
  submitVerification: (data) => api.post('/tournaments/organizer/verification', data),
  getVerificationStatus: () => api.get('/tournaments/organizer/verification/status'),
};

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  listOrgVerifications: (status = '') =>
    api.get(`/admin/verifications/orgs${status ? `?status=${status}` : ''}`),
  approveOrgVerification: (id) => api.patch(`/admin/verifications/orgs/${id}/approve`),
  rejectOrgVerification: (id, reviewNotes = '') =>
    api.patch(`/admin/verifications/orgs/${id}/reject`, { review_notes: reviewNotes }),
  listOrganizerVerifications: (status = '') =>
    api.get(`/admin/verifications/organizers${status ? `?status=${status}` : ''}`),
  approveOrganizerVerification: (id) => api.patch(`/admin/verifications/organizers/${id}/approve`),
  rejectOrganizerVerification: (id, reviewNotes = '') =>
    api.patch(`/admin/verifications/organizers/${id}/reject`, { review_notes: reviewNotes }),
  listUsers: () => api.get('/admin/users'),
};

export const socialService = {
  getFeed: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/social/feed${qs ? `?${qs}` : ''}`);
  },
  createPost: (data) => api.post('/social/posts', data),
  getPost: (id) => api.get(`/social/posts/${id}`),
  likePost: (id) => api.post(`/social/posts/${id}/like`),
  addComment: (id, content) => api.post(`/social/posts/${id}/comments`, { content }),
  follow: (target_id, target_type) => api.post('/social/follow', { target_id, target_type }),
  unfollow: (target_id, target_type) => api.delete('/social/follow', { body: JSON.stringify({ target_id, target_type }) }),
  connect: (targetPlayerId) => api.post(`/social/connections/${targetPlayerId}`),
  getConnections: () => api.get('/social/connections'),
  getRecommendedPlayers: () => api.get('/social/players/recommended'),
};

export const messageService = {
  getThread: (threadId, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/messages/${threadId}${qs ? `?${qs}` : ''}`);
  },
  sendMessage: (threadId, receiver_id, content) =>
    api.post(`/messages/${threadId}`, { receiver_id, content }),
};

export const playerService = {
  listPlayers: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/players${qs ? `?${qs}` : ''}`);
  },
  getPlayer: (id) => api.get(`/players/${id}`),
  updateProfile: (id, data) => api.put(`/players/${id}`, data),
};

export const uploadService = {
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/uploads', formData);
  },
};
