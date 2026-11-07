import React from 'react';
import { AlertTriangle, RefreshCw, Home, Trash2, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[FLUX Critical Runtime Error Caught by Boundary]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  handleHardReset = () => {
    try {
      localStorage.removeItem('gamersg_store_v1');
      localStorage.removeItem('gamersg_token');
      localStorage.removeItem('gamersg_user');
      sessionStorage.clear();
    } catch (e) {
      console.warn('Could not clear storage:', e);
    }
    window.location.href = '/';
  };

  handleCopy = () => {
    const errorDetails = `FLUX Error Report:\n${this.state.error?.toString()}\n\nStack:\n${this.state.error?.stack || ''}\n\nComponent Stack:\n${this.state.errorInfo?.componentStack || ''}`;
    navigator.clipboard?.writeText(errorDetails).then(() => {
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2500);
    });
  };

  render() {
    if (this.state.hasError) {
      const { fallbackTitle, fallbackMessage } = this.props;
      const errorMsg = this.state.error?.message || this.state.error?.toString() || 'An unexpected runtime error occurred.';
      const componentStack = this.state.errorInfo?.componentStack || '';

      return (
        <div className="min-h-[50vh] flex items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-2xl rounded-3xl glass-modal p-6 sm:p-8 space-y-6 shadow-2xl border border-red-500/30 text-on-surface bg-surface-container-low/95">
            {/* Header Badge */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-red-400 block">
                  FLUX System Diagnostic
                </span>
                <h2 className="font-display font-bold text-xl sm:text-2xl text-on-surface">
                  {fallbackTitle || 'Component Failed to Load'}
                </h2>
              </div>
            </div>

            {/* Error Message Box */}
            <div className="p-4 rounded-2xl bg-surface-container-lowest border border-card-border space-y-2">
              <p className="font-body text-xs sm:text-sm text-on-surface leading-relaxed">
                {fallbackMessage || 'A runtime problem prevented this section of FLUX from rendering properly.'}
              </p>
              <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/20 text-red-300 font-mono text-xs break-all">
                {errorMsg}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="px-5 py-2.5 rounded-xl bg-primary text-white font-display font-bold text-xs uppercase tracking-wider shadow-glow hover:bg-primary-hover active:scale-95 transition-all flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Page</span>
              </button>

              <button
                onClick={() => window.location.href = '/'}
                className="px-5 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-card-border font-display font-bold text-xs uppercase tracking-wider text-on-surface transition-all flex items-center gap-2"
              >
                <Home className="w-4 h-4 text-secondary" />
                <span>Return to Arena Home</span>
              </button>

              <button
                onClick={this.handleHardReset}
                className="px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-card-border font-display font-bold text-xs uppercase tracking-wider text-on-surface-variant hover:text-red-400 transition-all flex items-center gap-2"
                title="Clears corrupted local cache and re-syncs fresh"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Cache &amp; Re-sync</span>
              </button>

              <button
                onClick={this.handleCopy}
                className="px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-card-border font-display font-bold text-xs uppercase tracking-wider text-on-surface-variant transition-all flex items-center gap-1.5 ml-auto"
              >
                {this.state.copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{this.state.copied ? 'Copied Details' : 'Copy Trace'}</span>
              </button>
            </div>

            {/* Expandable Technical Trace */}
            <div className="border-t border-card-border pt-4">
              <button
                onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
                className="flex items-center gap-1.5 font-mono text-[11px] text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <span>{this.state.showDetails ? 'Hide' : 'View'} Developer Trace</span>
                {this.state.showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {this.state.showDetails && (
                <div className="mt-3 p-3.5 rounded-xl bg-black/60 border border-card-border text-[11px] font-mono text-on-surface-variant overflow-x-auto max-h-56 overflow-y-auto space-y-2">
                  <div className="text-red-400 font-bold">{this.state.error?.stack || errorMsg}</div>
                  {componentStack && (
                    <div className="text-on-surface-variant/80 whitespace-pre-wrap">{componentStack}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
