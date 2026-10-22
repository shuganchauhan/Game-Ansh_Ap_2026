import React, { useState, useEffect } from 'react';
import {
  Shield, CheckCircle2, XCircle, AlertTriangle, Users, Trophy, Swords,
  FileText, ExternalLink, RefreshCw, Search, Building2, UserCheck, Lock
} from 'lucide-react';
import { adminService } from '../../services';

export default function AdminPortalPage({ onSelectTab }) {
  const [stats, setStats] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('orgs'); // 'orgs' | 'organizers' | 'users'
  const [orgVerifications, setOrgVerifications] = useState([]);
  const [organizerVerifications, setOrganizerVerifications] = useState([]);
  const [usersList, setUsersList] = useState({ players: [], orgs: [], organizers: [] });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [sRes, orgRes, orgnRes, uRes] = await Promise.allSettled([
        adminService.getStats(),
        adminService.listOrgVerifications(),
        adminService.listOrganizerVerifications(),
        adminService.listUsers(),
      ]);

      if (sRes.status === 'fulfilled' && sRes.value) {
        setStats(sRes.value);
      }
      if (orgRes.status === 'fulfilled' && orgRes.value) {
        setOrgVerifications(orgRes.value);
      }
      if (orgnRes.status === 'fulfilled' && orgnRes.value) {
        setOrganizerVerifications(orgnRes.value);
      }
      if (uRes.status === 'fulfilled' && uRes.value) {
        setUsersList(uRes.value);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApproveOrg = async (id) => {
    setActionLoading(id);
    try {
      await adminService.approveOrgVerification(id);
      setFeedbackMsg('Organization approved & verified successfully!');
      loadData();
    } catch (err) {
      setFeedbackMsg('Failed to approve organization');
    } finally {
      setActionLoading(null);
      setTimeout(() => setFeedbackMsg(''), 4000);
    }
  };

  const handleRejectOrg = async (id) => {
    setActionLoading(id);
    try {
      await adminService.rejectOrgVerification(id, reviewNote || 'Documentation incomplete');
      setFeedbackMsg('Organization application rejected');
      loadData();
    } catch (err) {
      setFeedbackMsg('Failed to reject organization');
    } finally {
      setActionLoading(null);
      setTimeout(() => setFeedbackMsg(''), 4000);
    }
  };

  const handleApproveOrganizer = async (id) => {
    setActionLoading(id);
    try {
      await adminService.approveOrganizerVerification(id);
      setFeedbackMsg('Tournament Organizer approved & verified successfully!');
      loadData();
    } catch (err) {
      setFeedbackMsg('Failed to approve organizer');
    } finally {
      setActionLoading(null);
      setTimeout(() => setFeedbackMsg(''), 4000);
    }
  };

  const handleRejectOrganizer = async (id) => {
    setActionLoading(id);
    try {
      await adminService.rejectOrganizerVerification(id, reviewNote || 'Verification requirements not met');
      setFeedbackMsg('Organizer application rejected');
      loadData();
    } catch (err) {
      setFeedbackMsg('Failed to reject organizer');
    } finally {
      setActionLoading(null);
      setTimeout(() => setFeedbackMsg(''), 4000);
    }
  };

  const pendingOrgs = orgVerifications.filter(o => o.status === 'pending');
  const pendingOrganizers = organizerVerifications.filter(o => o.status === 'pending');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-r from-red-950/60 via-surface-container-high to-surface border border-red-500/20 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-xs uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5" />
              Gamers'G Official Admin Portal
            </div>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-on-surface">
              Verification & Compliance Operations
            </h1>
            <p className="text-on-surface-variant max-w-2xl text-sm sm:text-base">
              Review and authorize Indian Esports Organizations and Tournament Organizers.
              Ensure authentic legal credentials, GST filing, and verified roster compliance.
            </p>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="self-start md:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-surface-container-highest hover:bg-surface-bright border border-card-border text-on-surface text-sm font-semibold transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>

        {feedbackMsg && (
          <div className="mt-4 p-3 rounded-xl bg-primary/20 border border-primary/40 text-primary-light text-sm font-medium">
            {feedbackMsg}
          </div>
        )}
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-5 rounded-2xl bg-surface-container border border-card-border">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="font-mono text-xs">Total Athletes</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-bold font-display text-on-surface">
            {stats?.players ?? 0}
          </div>
          <span className="text-[11px] text-on-surface-variant">Active profiles</span>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container border border-card-border">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="font-mono text-xs">Verified Orgs</span>
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-display text-emerald-400">
            {stats?.orgs?.verified ?? 0} <span className="text-sm font-normal text-on-surface-variant">/ {stats?.orgs?.total ?? 0}</span>
          </div>
          <span className="text-[11px] text-emerald-400/80">Authorized tier</span>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container border border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="font-mono text-xs">Pending Orgs</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-display text-amber-400">
            {stats?.orgs?.pending_verifications ?? pendingOrgs.length}
          </div>
          <span className="text-[11px] text-amber-300">Requires review</span>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container border border-card-border">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="font-mono text-xs">Organizers</span>
            <Trophy className="w-4 h-4 text-secondary" />
          </div>
          <div className="text-2xl font-bold font-display text-on-surface">
            {stats?.organizers?.verified ?? 0} <span className="text-sm font-normal text-on-surface-variant">/ {stats?.organizers?.total ?? 0}</span>
          </div>
          <span className="text-[11px] text-on-surface-variant">Hosting scrims</span>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container border border-card-border">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="font-mono text-xs">Registered Squads</span>
            <CheckCircle2 className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-bold font-display text-on-surface">
            {stats?.teams?.registered ?? 0}
          </div>
          <span className="text-[11px] text-primary/80">4-5 members validated</span>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container border border-card-border">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="font-mono text-xs">Active Scrims</span>
            <Swords className="w-4 h-4 text-accent" />
          </div>
          <div className="text-2xl font-bold font-display text-accent">
            {stats?.scrims ?? 0}
          </div>
          <span className="text-[11px] text-on-surface-variant">Dedicated lobbies</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-3 border-b border-card-border pb-3">
        <button
          onClick={() => setActiveSubTab('orgs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition ${
            activeSubTab === 'orgs'
              ? 'bg-primary text-black font-semibold shadow-lg shadow-primary/20'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Organization Applications ({pendingOrgs.length})
        </button>

        <button
          onClick={() => setActiveSubTab('organizers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition ${
            activeSubTab === 'organizers'
              ? 'bg-primary text-black font-semibold shadow-lg shadow-primary/20'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          }`}
        >
          <Trophy className="w-4 h-4" />
          Organizer Applications ({pendingOrganizers.length})
        </button>

        <button
          onClick={() => setActiveSubTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition ${
            activeSubTab === 'users'
              ? 'bg-primary text-black font-semibold shadow-lg shadow-primary/20'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          All Entities & Rosters
        </button>
      </div>

      {/* Tab 1: Organization Applications */}
      {activeSubTab === 'orgs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-display text-on-surface">
              Pending Organization Verification Requests
            </h2>
            <span className="text-xs text-on-surface-variant font-mono">
              Auto-grants multi-team roster & verified badges upon approval
            </span>
          </div>

          {orgVerifications.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-surface-container border border-card-border text-on-surface-variant">
              No organization verification applications found.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {orgVerifications.map((item) => {
                const isPending = item.status === 'pending';
                return (
                  <div
                    key={item.id}
                    className={`p-6 rounded-3xl border transition ${
                      isPending
                        ? 'bg-surface-container-high border-amber-500/30'
                        : item.status === 'approved'
                        ? 'bg-surface-container border-emerald-500/30'
                        : 'bg-surface-container border-card-border opacity-70'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-bold text-on-surface">
                            {item.legal_name || item.org_name}
                          </h3>
                          <span
                            className={`px-3 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                              item.status === 'approved'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : item.status === 'pending'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
                                : 'bg-red-500/20 text-red-400 border border-red-500/40'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs text-on-surface-variant">
                          <div>
                            <span className="block font-mono text-[10px] uppercase text-on-surface-variant/70">
                              GSTIN / Registration
                            </span>
                            <span className="font-semibold text-on-surface">{item.gst_number || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="block font-mono text-[10px] uppercase text-on-surface-variant/70">
                              Representative
                            </span>
                            <span className="font-semibold text-on-surface">{item.rep_name || 'Authorized Officer'}</span>
                          </div>
                          <div>
                            <span className="block font-mono text-[10px] uppercase text-on-surface-variant/70">
                              Contact Email
                            </span>
                            <span className="font-semibold text-on-surface">{item.rep_email || item.org_email}</span>
                          </div>
                          <div>
                            <span className="block font-mono text-[10px] uppercase text-on-surface-variant/70">
                              Official Website
                            </span>
                            <a
                              href={item.website}
                              target="_blank"
                              rel="noreferrer"
                              className="text-secondary hover:underline inline-flex items-center gap-1 font-semibold"
                            >
                              {item.website ? item.website.replace('https://', '') : 'None'}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>

                        {item.documents_url && (
                          <div className="flex items-center gap-2 text-xs font-mono text-primary">
                            <FileText className="w-4 h-4" />
                            <span>Submitted Dossier: {item.documents_url}</span>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      {isPending && (
                        <div className="flex items-center gap-3 self-end lg:self-center">
                          <button
                            onClick={() => handleRejectOrg(item.id)}
                            disabled={actionLoading === item.id}
                            className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-semibold transition"
                          >
                            <XCircle className="w-4 h-4 inline mr-1.5" />
                            Reject
                          </button>
                          <button
                            onClick={() => handleApproveOrg(item.id)}
                            disabled={actionLoading === item.id}
                            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold shadow-lg shadow-emerald-500/20 transition"
                          >
                            <CheckCircle2 className="w-4 h-4 inline mr-1.5" />
                            Approve Verification
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Tournament Organizer Applications */}
      {activeSubTab === 'organizers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-display text-on-surface">
              Pending Tournament Organizer Applications
            </h2>
            <span className="text-xs text-on-surface-variant font-mono">
              Approving authorizes organizers to host custom scrim lobbies with room IDs
            </span>
          </div>

          {organizerVerifications.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-surface-container border border-card-border text-on-surface-variant">
              No organizer verification applications found.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {organizerVerifications.map((item) => {
                const isPending = item.status === 'pending';
                return (
                  <div
                    key={item.id}
                    className={`p-6 rounded-3xl border transition ${
                      isPending
                        ? 'bg-surface-container-high border-amber-500/30'
                        : item.status === 'approved'
                        ? 'bg-surface-container border-emerald-500/30'
                        : 'bg-surface-container border-card-border opacity-70'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-bold text-on-surface">
                            {item.org_name || item.organizer_name}
                          </h3>
                          <span
                            className={`px-3 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                              item.status === 'approved'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : item.status === 'pending'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
                                : 'bg-red-500/20 text-red-400 border border-red-500/40'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>

                        <p className="text-sm text-on-surface-variant max-w-3xl">
                          {item.experience_summary || 'Esports event organizer host'}
                        </p>

                        <div className="flex items-center gap-6 text-xs text-on-surface-variant">
                          <span>
                            Contact: <strong className="text-on-surface">{item.organizer_email}</strong>
                          </span>
                          {item.website && (
                            <a
                              href={item.website}
                              target="_blank"
                              rel="noreferrer"
                              className="text-secondary hover:underline inline-flex items-center gap-1 font-semibold"
                            >
                              Website <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          {item.twitter && (
                            <span className="text-primary font-mono">{item.twitter}</span>
                          )}
                        </div>
                      </div>

                      {isPending && (
                        <div className="flex items-center gap-3 self-end lg:self-center">
                          <button
                            onClick={() => handleRejectOrganizer(item.id)}
                            disabled={actionLoading === item.id}
                            className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-semibold transition"
                          >
                            <XCircle className="w-4 h-4 inline mr-1.5" />
                            Reject
                          </button>
                          <button
                            onClick={() => handleApproveOrganizer(item.id)}
                            disabled={actionLoading === item.id}
                            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold shadow-lg shadow-emerald-500/20 transition"
                          >
                            <CheckCircle2 className="w-4 h-4 inline mr-1.5" />
                            Approve Organizer
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: All Entities Directory */}
      {activeSubTab === 'users' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-surface-container border border-card-border space-y-4">
            <h3 className="font-display font-bold text-lg text-on-surface">
              System Directory Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-mono text-xs uppercase text-primary font-bold mb-3">
                  Athletes ({usersList.players?.length || 0})
                </h4>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
                  {usersList.players?.map((p) => (
                    <div key={p.id} className="p-2.5 rounded-xl bg-surface-container-high text-xs">
                      <div className="font-bold text-on-surface">{p.username}</div>
                      <div className="text-on-surface-variant font-mono text-[11px]">{p.email} • {p.game_ign || 'No IGN'}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-mono text-xs uppercase text-emerald-400 font-bold mb-3">
                  Organizations ({usersList.orgs?.length || 0})
                </h4>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
                  {usersList.orgs?.map((o) => (
                    <div key={o.id} className="p-2.5 rounded-xl bg-surface-container-high text-xs flex items-center justify-between">
                      <div>
                        <div className="font-bold text-on-surface">{o.name}</div>
                        <div className="text-on-surface-variant font-mono text-[11px]">{o.email}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${o.verified ? 'bg-emerald-500/20 text-emerald-400' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                        {o.verified ? 'VERIFIED' : 'UNVERIFIED'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-mono text-xs uppercase text-secondary font-bold mb-3">
                  Tournament Organizers ({usersList.organizers?.length || 0})
                </h4>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
                  {usersList.organizers?.map((orgn) => (
                    <div key={orgn.id} className="p-2.5 rounded-xl bg-surface-container-high text-xs flex items-center justify-between">
                      <div>
                        <div className="font-bold text-on-surface">{orgn.name}</div>
                        <div className="text-on-surface-variant font-mono text-[11px]">{orgn.email}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${orgn.verified ? 'bg-emerald-500/20 text-emerald-400' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                        {orgn.verified ? 'VERIFIED' : 'UNVERIFIED'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
