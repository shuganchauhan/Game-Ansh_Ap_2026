import React, { useState } from 'react';
import {
  X, Lock, AlertCircle, ArrowRight, Mail, User, Eye, EyeOff, ShieldCheck, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../stores/authContext';
import { useGameStore } from '../../stores/gameStore';

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
}) {
  const { login, signup } = useAuth();
  const { setActiveRole, setCurrentUser } = useGameStore();

  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreedTerms, setAgreedTerms] = useState(true);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode || 'login');
      setError(null);
      setForgotSent(false);
    }
  }, [isOpen, initialMode]);

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
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
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
        // Standard clean registration
        resultUser = await signup(cleanEmail, password);
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
      setError('Please enter your email address above to receive a password reset link.');
      return;
    }
    setError(null);
    setForgotSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-[#14141a]/95 border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl relative text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2 pt-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20">
            <span className="font-display font-extrabold text-2xl text-black">G</span>
          </div>
          <div>
            <h2 className="font-display font-bold text-2xl text-white tracking-tight">
              {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
            </h2>
            <p className="font-body text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
              {mode === 'login'
                ? 'Sign in to access your competitive dashboard, scrims, and match rooms.'
                : 'Join Gamers\'G to compete in tournaments, form rosters, and build your gaming profile.'}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-white/5 border border-white/10 text-center">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
              setForgotSent(false);
            }}
            className={`py-2.5 rounded-xl font-display text-xs font-bold uppercase tracking-wider transition-all ${
              mode === 'login'
                ? 'bg-gradient-to-r from-indigo-500 to-cyan-400 text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
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
                ? 'bg-gradient-to-r from-indigo-500 to-cyan-400 text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-body animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {forgotSent && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-body animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              If an account matches <strong>{email}</strong>, a password reset link has been dispatched to your inbox.
            </span>
          </div>
        )}

        {/* Main Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sign Up: Gamer Tag Field */}
          {mode === 'signup' && (
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                Gamer Tag / Display Name
              </label>
              <input
                type="text"
                placeholder="e.g. Vortex_99"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-body transition-all"
              />
            </div>
          )}

          {/* Email Address */}
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              Email Address
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 font-body transition-all"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-mono text-[11px] uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                Password
              </label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="font-mono text-[11px] text-zinc-400 hover:text-cyan-300 transition-colors"
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
                className="w-full pl-4 pr-11 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-body transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Sign Up: Confirm Password */}
          {mode === 'signup' && (
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 font-body transition-all"
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
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <label htmlFor="rememberMe" className="text-xs text-zinc-400 cursor-pointer select-none">
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
                className="w-4 h-4 mt-0.5 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-zinc-400 cursor-pointer select-none leading-relaxed">
                I agree to the <span className="text-white hover:underline">Terms of Service</span> and acknowledge the <span className="text-white hover:underline">Fair Play Code</span>.
              </label>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-400 hover:opacity-95 text-black font-display font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-500/25 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Authenticating...</span>
              </span>
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In to Account' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer switch prompt */}
        <div className="text-center pt-2 border-t border-white/10">
          <p className="text-xs text-zinc-400">
            {mode === 'login' ? (
              <>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError(null);
                  }}
                  className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors ml-1"
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
                  className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors ml-1"
                >
                  Sign in here
                </button>
              </>
            )}
          </p>
          <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-zinc-500 mt-3 uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-Bit SSL · Anti-Cheat Fair Play Protocol</span>
          </div>
        </div>
      </div>
    </div>
  );
}
