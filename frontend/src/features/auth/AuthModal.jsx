import React, { useState } from 'react';
import {
  X, Lock, AlertCircle, ArrowRight, Mail, User, Eye, EyeOff, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../stores/authContext';
import { useGameStore } from '../../stores/gameStore';

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
  initialRole = 'player',
}) {
  const { login, signup } = useAuth();
  const { setActiveRole, setCurrentUser } = useGameStore();

  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'
  const [role, setRole] = useState(initialRole);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreedTerms, setAgreedTerms] = useState(true);

  const [error, setError] = useState(null);
  const [forgotSent, setForgotSent] = useState(false);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode || 'login');
      setRole(initialRole || 'player');
      setError(null);
      setForgotSent(false);
    }
  }, [isOpen, initialMode, initialRole]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter your email or username.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    if (mode === 'signup') {
      if (password.length < 12) {
        setError('Password must be at least 12 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (!agreedTerms) {
        setError('You must agree to the Terms of Service & Fair Play Rules.');
        return;
      }
    }

    setLoading(true);

    try {
      let resultUser;
      if (mode === 'login') {
        resultUser = await login(cleanEmail, password);
      } else {
        const accountName = username.trim();
        if (role !== 'player' && accountName.length < 2) {
          setError('Please enter an organization or organizer name (at least 2 characters).');
          setLoading(false);
          return;
        }
        resultUser = await signup(role, role === 'player'
          ? { email: cleanEmail, password, username: accountName || undefined }
          : { email: cleanEmail, password, name: accountName });
      }

      const role = resultUser.role || 'player';
      setActiveRole(role);
      setCurrentUser?.(resultUser);
      onSuccess?.(resultUser);
      onClose();
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Authentication failed. Please verify your credentials and try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!email) {
      setError('Enter your account email first.');
      return;
    }
    setError('Password recovery is not configured yet. Contact platform support.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 dark:bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-surface-container-lowest dark:bg-[#14141a] border border-card-border p-6 sm:p-8 space-y-6 shadow-2xl relative text-on-surface">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors border border-card-border"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2 pt-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto shadow-lg shadow-primary/20">
            <span className="font-display font-extrabold text-2xl text-white dark:text-black">G</span>
          </div>
          <div>
            <h2 className="font-display font-bold text-2xl text-on-surface tracking-tight">
              {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
            </h2>
            <p className="font-body text-xs text-on-surface-variant mt-1 max-w-xs mx-auto">
              {mode === 'login'
                ? 'Sign in to access your competitive dashboard, scrims, and match rooms.'
                : 'Join Gamers\'G to compete in tournaments, form rosters, and build your gaming profile.'}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-surface-container border border-card-border text-center">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
              setForgotSent(false);
            }}
            className={`py-2.5 rounded-xl font-display text-xs font-bold uppercase tracking-wider transition-all ${
              mode === 'login'
                ? 'bg-primary text-white dark:text-black font-extrabold shadow-md'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
              setForgotSent(false);
            }}
            className={`py-2.5 rounded-xl font-display text-xs font-bold uppercase tracking-wider transition-all ${
              mode === 'signup'
                ? 'bg-primary text-white dark:text-black font-extrabold shadow-md'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Sign Up
          </button>
        </div>

        {mode === 'signup' && <label className="block">
          <span className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant mb-1.5 font-bold">Account type</span>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-card-border text-on-surface text-sm focus:outline-none focus:border-primary" aria-label="Account type">
            <option value="player">Player</option>
            <option value="org">Organization</option>
            <option value="organizer">Tournament organizer</option>
          </select>
        </label>}

        {/* Feedback Alerts */}
        {error && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-error/15 border border-error/30 text-error text-xs font-body animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Main Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sign Up: Gamer Tag or organization name */}
          {mode === 'signup' && (
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant mb-1.5 flex items-center gap-1.5 font-bold">
                <User className="w-3.5 h-3.5 text-secondary" />
                {role === 'player' ? 'Gamer Tag / Display Name' : role === 'org' ? 'Organization Name' : 'Organizer Name'}
              </label>
              <input
                type="text"
                placeholder={role === 'player' ? 'e.g. Vortex_99' : role === 'org' ? 'e.g. Northern Esports' : 'e.g. Campus Gaming League'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-surface-container-low dark:bg-white/5 border border-card-border text-on-surface placeholder:text-on-surface-variant/50 text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary font-body transition-all"
              />
            </div>
          )}

          {/* Email Address */}
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant mb-1.5 flex items-center gap-1.5 font-bold">
              <Mail className="w-3.5 h-3.5 text-primary" />
              Email Address
            </label>
            <input
              type="email"
              required
              autoFocus
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-surface-container-low dark:bg-white/5 border border-card-border text-on-surface placeholder:text-on-surface-variant/50 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body transition-all"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5 font-bold">
                <Lock className="w-3.5 h-3.5 text-secondary" />
                Password
              </label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="font-mono text-[11px] text-on-surface-variant hover:text-secondary transition-colors"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-4 pr-11 py-3 rounded-xl bg-surface-container-low dark:bg-white/5 border border-card-border text-on-surface placeholder:text-on-surface-variant/50 text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary font-body transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Sign Up: Confirm Password */}
          {mode === 'signup' && (
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant mb-1.5 flex items-center gap-1.5 font-bold">
                <Lock className="w-3.5 h-3.5 text-primary" />
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-surface-container-low dark:bg-white/5 border border-card-border text-on-surface placeholder:text-on-surface-variant/50 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body transition-all"
              />
            </div>
          )}

          {/* Options: Remember me & Terms */}
          {mode === 'login' ? (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-card-border bg-surface-container text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <label htmlFor="rememberMe" className="text-xs text-on-surface-variant cursor-pointer select-none">
                Remember this session on this device
              </label>
            </div>
          ) : (
            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-card-border bg-surface-container text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-on-surface-variant cursor-pointer select-none leading-relaxed">
                I agree to the <span className="text-on-surface font-semibold hover:underline">Terms of Service</span> and acknowledge the <span className="text-on-surface font-semibold hover:underline">Fair Play Code</span>.
              </label>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-primary to-secondary hover:opacity-95 text-white dark:text-black font-display font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/25 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
                <span>Authenticating...</span>
              </span>
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In to Account' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4 text-white dark:text-black" />
              </>
            )}
          </button>
        </form>

        {/* Footer switch prompt */}
        <div className="text-center pt-2 border-t border-card-border">
          <p className="text-xs text-on-surface-variant">
            {mode === 'login' ? (
              <>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError(null);
                  }}
                  className="font-bold text-secondary hover:underline transition-colors ml-1"
                >
                  Create one now
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className="font-bold text-primary hover:underline transition-colors ml-1"
                >
                  Sign in here
                </button>
              </>
            )}
          </p>
          <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-on-surface-variant/70 mt-3 uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
            <span>256-Bit SSL · Anti-Cheat Fair Play Protocol</span>
          </div>
        </div>
      </div>
    </div>
  );
}
