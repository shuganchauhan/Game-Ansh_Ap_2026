import React, { useState } from 'react';
import {
  MessageSquare, Heart, Share2, CheckCircle2, Send, Plus, Users, Shield,
  Sparkles, Filter, Swords, Trophy, ExternalLink, Flame, Bookmark, LogIn, Lock
} from 'lucide-react';
import { useAuth } from '../../stores/authContext';
import { useGameStore } from '../../stores/gameStore';

export default function SocialFeedPage({ onSelectTab, onOpenAuth }) {
  const { user, isAuthenticated } = useAuth();
  const {
    posts,
    createPost,
    toggleLikePost,
    addCommentToPost,
    currentUser,
    activeRole,
    orgs,
    activeOrgId,
    players,
    connectedPlayerIds,
    toggleConnectPlayer,
    followedOrgIds,
    toggleFollowOrg,
  } = useGameStore();

  const [newContent, setNewContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('LFT / Tryout');
  const [selectedGame, setSelectedGame] = useState('valorant');
  const [feedFilter, setFeedFilter] = useState('all');
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [commentInput, setCommentInput] = useState('');
  const [copiedPostId, setCopiedPostId] = useState(null);
  const [actionError, setActionError] = useState('');

  const activeOrg = orgs.find((o) => o.id === activeOrgId);

  // Authenticated Action Handlers
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onOpenAuth?.('player', 'login');
      return;
    }
    if (!newContent.trim()) return;

    setActionError('');
    try {
      await createPost({ content: newContent, category: selectedCategory, game: selectedGame });
      setNewContent('');
    } catch (error) { setActionError(error.message || 'Could not publish your post.'); }
  };

  const handleAddComment = async (postId, e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onOpenAuth?.('player', 'login');
      return;
    }
    if (!commentInput.trim()) return;

    setActionError('');
    try {
      await addCommentToPost(postId, commentInput.trim());
      setCommentInput('');
    } catch (error) { setActionError(error.message || 'Could not add your comment.'); }
  };

  const handleToggleLike = (postId) => {
    if (!isAuthenticated) {
      onOpenAuth?.('player', 'login');
      return;
    }
    toggleLikePost(postId).catch((error) => setActionError(error.message || 'Could not update your like.'));
  };

  const handleToggleConnect = (playerId) => {
    if (!isAuthenticated) {
      onOpenAuth?.('player', 'login');
      return;
    }
    if (user?.role !== 'player') { setActionError('Player accounts can connect with other players.'); return; }
    toggleConnectPlayer(playerId).catch((error) => setActionError(error.message || 'Could not connect to this player.'));
  };

  const handleToggleFollow = (orgId) => {
    if (!isAuthenticated) {
      onOpenAuth?.('player', 'login');
      return;
    }
    if (user?.role !== 'player') { setActionError('Player accounts can follow organizations.'); return; }
    toggleFollowOrg(orgId).catch((error) => setActionError(error.message || 'Could not update this follow.'));
  };

  const handleShare = (postId) => {
    navigator.clipboard?.writeText?.(window.location.href);
    setCopiedPostId(postId);
    setTimeout(() => setCopiedPostId(null), 2000);
  };

  const filteredPosts = posts.filter((p) => {
    if (feedFilter === 'all') return true;
    if (feedFilter === 'lft') return p.category.includes('LFT') || p.category.includes('Recruitment');
    if (feedFilter === 'org') return p.isOrg;
    if (feedFilter === 'matches') return p.category.includes('Match');
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ═══════════════════════════════════════════════════════
            MAIN FEED COLUMN (8 Cols)
        ═══════════════════════════════════════════════════════ */}
        <div className="lg:col-span-8 space-y-6">
          {actionError && <p role="alert" className="p-3 rounded-xl bg-error/10 text-error text-sm">{actionError}</p>}

          {/* Feed Header */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs uppercase tracking-wider text-secondary font-bold">
                Competitive Network // 2026 Season
              </span>
            </div>
            <h1 className="font-display font-bold text-3xl text-on-surface">Community Feed</h1>
            <p className="font-body text-xs sm:text-sm text-on-surface-variant mt-0.5">
              Live tryout dispatches, LFT player resumes, scrim results, and official esports org announcements.
            </p>
          </div>

          {/* ── Rich Post Composer (Guarded by Authentication) ── */}
          {!isAuthenticated ? (
            <section className="p-6 rounded-3xl bg-surface-container-low border border-card-border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-on-surface">Join the Competitive Conversation</h3>
                  <p className="text-xs text-on-surface-variant">Sign in with your account to publish tryouts, like match results, and reply to pro rosters.</p>
                </div>
              </div>
              <button
                onClick={() => onOpenAuth?.('player', 'login')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white dark:text-black font-display font-bold text-xs uppercase tracking-wider shrink-0 hover:opacity-95 shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <LogIn className="w-4 h-4 text-white dark:text-black" />
                <span>Sign In to Post</span>
              </button>
            </section>
          ) : (
            <section className="p-5 rounded-3xl bg-surface-container-low border border-card-border shadow-lg space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={activeRole === 'org' ? activeOrg?.logo : (user?.avatar_url || currentUser.avatar)}
                  alt="Avatar"
                  className="w-10 h-10 rounded-xl object-cover ring-1 ring-card-border shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="font-display font-bold text-sm text-on-surface block truncate">
                    {user?.name || user?.username || (activeRole === 'org' ? activeOrg?.name : currentUser.name)}
                  </span>
                  <span className="font-mono text-[10px] text-secondary font-bold">
                    Posting as {user?.role ? user.role.toUpperCase() : (activeRole === 'org' ? 'Verified Organization' : 'Pro Athlete')}
                  </span>
                </div>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-3">
                <textarea
                  rows={3}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder={
                    activeRole === 'org'
                      ? "Broadcast official roster tryouts, tournament results, or signing announcements..."
                      : "Post LFT dossier, scrim clips, match results, or connect with scouting agents..."
                  }
                  className="w-full p-3 rounded-2xl bg-surface-container border border-card-border text-on-surface placeholder:text-on-surface-variant focus:outline-none text-sm font-body"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="p-2 rounded-xl bg-surface-container border border-card-border text-xs font-mono text-on-surface focus:outline-none"
                    >
                      <option value="LFT / Tryout">🎯 LFT / Tryout</option>
                      <option value="Org Announcement">📢 Org Announcement</option>
                      <option value="Match Result">🔥 Scrim / Match Result</option>
                      <option value="General Discussion">💬 General Discussion</option>
                    </select>

                    <select
                      value={selectedGame}
                      onChange={(e) => setSelectedGame(e.target.value)}
                      className="p-2 rounded-xl bg-surface-container border border-card-border text-xs font-mono text-on-surface focus:outline-none"
                    >
                      <option value="valorant">⚡ VALORANT</option>
                      <option value="bgmi">🔫 BGMI</option>
                      <option value="freefire">🔥 Free Fire</option>
                      <option value="coc">🏰 Clash of Clans</option>
                      <option value="cr">👑 Clash Royale</option>
                      <option value="cod">💀 Call of Duty</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={!newContent.trim()}
                    className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white dark:text-black font-display font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5 text-white dark:text-black" />
                    <span>Publish Post</span>
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* ── Feed Filter Tabs ── */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: 'all', label: 'All Dispatches' },
              { id: 'lft', label: '🎯 LFT & Tryouts' },
              { id: 'org', label: '🏢 Org Announcements' },
              { id: 'matches', label: '⚔️ Scrim Results' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFeedFilter(f.id)}
                className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold whitespace-nowrap transition-all ${
                  feedFilter === f.id
                    ? 'bg-primary text-white dark:text-black shadow-sm'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* ── Posts List ── */}
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="p-5 sm:p-6 rounded-3xl bg-surface-container-low border border-card-border space-y-4 shadow-sm"
              >
                {/* Author row */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={post.authorAvatar}
                      alt={post.authorName}
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-card-border shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-display font-bold text-sm text-on-surface truncate">
                          {post.authorName}
                        </span>
                        {post.isVerified && (
                          <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" title="Verified" />
                        )}
                        {post.isOrg && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase font-bold bg-secondary/15 text-secondary">
                            Org
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[11px] text-on-surface-variant block">
                        {post.authorHandle} · {post.createdAt}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="px-2.5 py-0.5 rounded font-mono text-[10px] uppercase font-bold bg-primary/10 text-primary">
                      {post.category}
                    </span>
                    {post.game && (
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold bg-surface-container text-on-surface-variant">
                        {post.game.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Post content */}
                <div className="font-body text-sm text-on-surface whitespace-pre-line leading-relaxed">
                  {post.content}
                </div>

                {/* Social Actions row */}
                <div className="flex items-center justify-between pt-3 border-t border-card-border text-xs font-mono">
                  <button
                    onClick={() => handleToggleLike(post.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                      post.likedByMe
                        ? 'text-error bg-error/10 font-bold'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                    }`}
                    title={!isAuthenticated ? "Sign in to like" : "Like post"}
                  >
                    <Heart className={`w-4 h-4 ${post.likedByMe ? 'fill-current' : ''}`} />
                    <span>{post.likes}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        onOpenAuth?.('player', 'login');
                        return;
                      }
                      setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all"
                    title={!isAuthenticated ? "Sign in to comment" : "View comments"}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.comments?.length || 0} Comments</span>
                  </button>

                  <button
                    onClick={() => handleShare(post.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>{copiedPostId === post.id ? 'Copied!' : 'Share'}</span>
                  </button>
                </div>

                {/* Comment Thread Drawer */}
                {activeCommentPostId === post.id && (
                  <div className="pt-3 border-t border-card-border space-y-3 animate-in fade-in">
                    {/* Add comment input */}
                    <form
                      onSubmit={(e) => handleAddComment(post.id, e)}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="text"
                        required
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        placeholder={isAuthenticated ? "Add your comment or scouting response..." : "Sign in to reply..."}
                        className="flex-1 p-2.5 rounded-xl bg-surface-container border border-card-border text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2.5 rounded-xl bg-primary text-white dark:text-black font-display font-bold text-xs uppercase shadow-sm"
                      >
                        Send
                      </button>
                    </form>

                    {/* Existing Comments */}
                    {post.comments?.length > 0 && (
                      <div className="space-y-2 pt-1">
                        {post.comments.map((c) => (
                          <div
                            key={c.id}
                            className="p-3 rounded-xl bg-surface-container text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between font-mono text-[10px]">
                              <span className="font-bold text-on-surface">{c.authorName}</span>
                              <span className="text-on-surface-variant">{c.createdAt}</span>
                            </div>
                            <p className="font-body text-on-surface-variant leading-relaxed">
                              {c.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
            SIDEBAR (4 Cols) — Connections & Orgs
        ═══════════════════════════════════════════════════════ */}
        <aside className="lg:col-span-4 space-y-6">

          {/* Player Network Widget */}
          <div className="p-5 rounded-3xl bg-surface-container-low border border-card-border space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <h3 className="font-display font-bold text-sm text-on-surface">
                  Pro Gamers to Connect
                </h3>
              </div>
              <span className="font-mono text-[10px] text-secondary font-bold">Network</span>
            </div>

            <div className="space-y-3">
              {players.filter(p => p.id !== currentUser.id).slice(0, 3).map((p) => {
                const isConnected = connectedPlayerIds.includes(p.id);
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-surface-container border border-card-border gap-2.5"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img src={p.avatar} alt={p.name} className="w-9 h-9 rounded-xl object-cover shrink-0" />
                      <div className="min-w-0">
                        <span className="font-display font-bold text-xs text-on-surface block truncate">
                          {p.name}
                        </span>
                        <span className="font-mono text-[10px] text-on-surface-variant truncate block">
                          {p.tagline.split('|')[0]}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleConnect(p.id)}
                      className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold shrink-0 transition-all ${
                        isConnected
                          ? 'bg-surface-container-high text-on-surface-variant'
                          : 'bg-primary text-white dark:text-black shadow-sm'
                      }`}
                    >
                      {isConnected ? 'Connected' : '+ Connect'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Esports Organizations to Follow Widget */}
          <div className="p-5 rounded-3xl bg-surface-container-low border border-card-border space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-secondary" />
                <h3 className="font-display font-bold text-sm text-on-surface">
                  Esports Orgs to Follow
                </h3>
              </div>
              <span className="font-mono text-[10px] text-tertiary font-bold">Franchises</span>
            </div>

            <div className="space-y-3">
              {orgs.slice(0, 4).map((org) => {
                const isFollowing = followedOrgIds.includes(org.id);
                return (
                  <div
                    key={org.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-surface-container border border-card-border gap-2.5"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img src={org.logo} alt={org.name} className="w-9 h-9 rounded-xl object-cover shrink-0" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-display font-bold text-xs text-on-surface truncate">
                            {org.name}
                          </span>
                          {org.verified && <CheckCircle2 className="w-3 h-3 text-secondary shrink-0" />}
                        </div>
                        <span className="font-mono text-[10px] text-on-surface-variant">
                          {org.followers.toLocaleString()} followers
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleFollow(org.id)}
                      className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold shrink-0 transition-all ${
                        isFollowing
                          ? 'bg-surface-container-high text-on-surface-variant'
                          : 'bg-secondary/15 text-secondary border border-secondary/30'
                      }`}
                    >
                      {isFollowing ? 'Following' : '+ Follow'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trending Esports Radar */}
          <div className="p-5 rounded-3xl bg-surface-container-low border border-card-border space-y-3 font-mono text-xs">
            <div className="flex items-center gap-2 text-on-surface font-bold font-display text-sm">
              <Flame className="w-4 h-4 text-tertiary" />
              <span>Trending in India Esports</span>
            </div>
            <div className="space-y-2 text-on-surface-variant">
              <div className="flex items-center justify-between p-2 rounded-xl bg-surface-container">
                <span className="text-secondary">#BMPSSeason4</span>
                <span className="text-[10px]">14.2K Dispatches</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-surface-container">
                <span className="text-primary">#VCTIndiaSplit</span>
                <span className="text-[10px]">8.9K Dispatches</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-surface-container">
                <span className="text-tertiary">#SoulTryouts</span>
                <span className="text-[10px]">6.1K Dispatches</span>
              </div>
            </div>
          </div>

        </aside>

      </div>
    </div>
  );
}
