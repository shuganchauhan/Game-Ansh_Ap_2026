import React, { useState } from 'react';
import { X, Lock, AlertCircle, Sparkles, ArrowRight, Mail, Key } from 'lucide-react';
import { useAuth } from '../../stores/authContext';
import { useGameStore } from '../../stores/gameStore';

const QUICK_ACCOUNTS = [
  { role: 'admin', label: 'Admin', email: 'admin@gamersg.com', pass: 'Password123!', color: 'text-red-400 border-red-500/30 bg-red-500/10' },
  { role: 'player', label: 'Pro Player', email: 'vortex@gamersg.com', pass: 'Password123!', color: 'text-primary border-primary/30 bg-primary/10' },
  { role: 'org', label: 'Esports Org', email: 'management@s8ul.gg', pass: 'Password123!', color: 'text-secondary border-secondary/30 bg-secondary/10' },
  { role: 'organizer', label: 'Organizer', email: 'admin@skyesports.in', pass: 'Password123!', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
];

export default function AuthModal({ isOpen, onClose, onSuccess, initialRole = 'player', initialMode = 'login' }) {
  const { login, signup } = useAuth();
  const { setActiveRole, setCurrentUser } = useGameStore();

  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode || 'login');
      setError(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleQuickLogin = async (acc) => {
    setError(null);
    setLoading(true);
    setEmail(acc.email);
    setPassword(acc.pass);

    try {
      const loggedUser = await login(acc.email, acc.pass);
      setActiveRole(loggedUser.role);
      setCurrentUser?.(loggedUser);
      onSuccess?.(loggedUser);
      onClose();
    } catch (err) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let resultUser;
      if (mode === 'login') {
        resultUser = await login(email.trim(), password);
      } else {
        resultUser = await signup(email.trim(), password);
      }

      setActiveRole(resultUser.role || 'player');
      setCurrentUser?.(resultUser);
      onSuccess?.(resultUser);
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl glass-modal p-6 sm:p-8 space-y-6 shadow-2xl border border-card-border relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto shadow-lg shadow-primary/20">
            <span className="font-display font-bold text-2xl text-black">G</span>
          </div>
          <h2 className="font-display font-bold text-2xl text-on-surface">
            {mode === 'login' ? 'Welcome Back' : 'Get Started with Gamers\'G'}
          </h2>
          <p className="font-body text-xs text-on-surface-variant">
            {mode === 'login'
              ? 'Enter your email & password to access your dashboard'
              : 'Sign up with just email & password. Manage everything from your dashboard.'}
          </p>
        </div>

        {/* Mode Toggle (Sign In vs Register) */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-surface-container border border-card-border text-center">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-2 rounded-lg font-display text-xs font-semibold uppercase tracking-wider transition-all ${
              mode === 'login' ? 'bg-primary text-black font-bold shadow-sm' : 'text-on-surface-variant'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`py-2 rounded-lg font-display text-xs font-semibold uppercase tracking-wider transition-all ${
              mode === 'signup' ? 'bg-primary text-black font-bold shadow-sm' : 'text-on-surface-variant'
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-error/15 border border-error/30 text-error text-xs font-body">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Pure Form: Just Email & Password */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-mono text-[11px] uppercase text-on-surface-variant mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-primary" />
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-surface border border-card-border text-on-surface placeholder:text-on-surface-variant/50 text-sm focus:outline-none focus:border-primary font-body"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase text-on-surface-variant mb-1.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-secondary" />
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-surface border border-card-border text-on-surface placeholder:text-on-surface-variant/50 text-sm focus:outline-none focus:border-primary font-body"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover text-black font-display font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Processing...' : mode === 'login' ? 'Sign In to Dashboard' : 'Create Account & Enter'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 1-Click Quick Demo Sign-Ins */}
        <div className="pt-3 border-t border-card-border space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-on-surface-variant">
            <span className="flex items-center gap-1 font-bold text-secondary uppercase">
              <Sparkles className="w-3 h-3" />
              1-Click Demo Logins:
            </span>
            <span>Password123!</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {QUICK_ACCOUNTS.map((acc) => (
              <button
                key={acc.role}
                type="button"
                onClick={() => handleQuickLogin(acc)}
                disabled={loading}
                className={`p-2 rounded-xl border text-left flex items-center gap-2 hover:scale-[1.02] transition-all ${acc.color}`}
              >
                <div className="min-w-0 flex-1">
                  <div className="font-display font-bold text-xs truncate">{acc.label}</div>
                  <div className="font-mono text-[9px] opacity-70 truncate">{acc.email}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
