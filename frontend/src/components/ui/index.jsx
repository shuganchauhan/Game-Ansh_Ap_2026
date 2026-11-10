/**
 * FLUX — Shared UI Component Library
 * Reusable, design-token-driven components for consistent product experience.
 */

import React from 'react';
import { Loader2, AlertCircle, Info, CheckCircle2, XCircle, Inbox } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   BUTTON
   ───────────────────────────────────────────────────────────── */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  leftIcon,
  rightIcon,
  ...props
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-display font-semibold tracking-wide transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 rounded-xl';

  const variants = {
    primary: 'bg-primary hover:bg-primary-hover text-white shadow-sm shadow-primary/20',
    secondary: 'bg-surface-container-high hover:bg-surface-container-highest border border-card-border text-on-surface',
    outline: 'border border-primary text-primary hover:bg-primary/10',
    ghost: 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container',
    danger: 'bg-error hover:bg-error/90 text-white',
    success: 'bg-success hover:bg-success/90 text-white',
    gradient: 'bg-gradient-to-r from-primary to-primary-container text-white shadow-md shadow-primary/25 hover:opacity-95',
  };

  const sizes = {
    xs: 'px-3 py-1.5 text-xs',
    sm: 'px-4 py-2 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-sm',
    xl: 'px-8 py-4 text-base',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
   INPUT
   ───────────────────────────────────────────────────────────── */
export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightElement,
  className = '',
  containerClassName = '',
  ...props
}) {
  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label className="block font-display text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
            {leftIcon}
          </span>
        )}
        <input
          className={`
            w-full bg-surface-container-low border border-card-border rounded-xl
            px-4 py-2.5 text-sm text-on-surface placeholder-on-surface-variant/60
            transition-all focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
            disabled:opacity-50 disabled:cursor-not-allowed
            ${leftIcon ? 'pl-10' : ''}
            ${rightElement ? 'pr-10' : ''}
            ${error ? 'border-error focus:border-error focus:ring-error' : ''}
            ${className}
          `}
          {...props}
        />
        {rightElement && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </span>
        )}
      </div>
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-error font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-on-surface-variant">{hint}</p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   TEXTAREA
   ───────────────────────────────────────────────────────────── */
export function Textarea({ label, error, hint, className = '', containerClassName = '', ...props }) {
  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label className="block font-display text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full bg-surface-container-low border border-card-border rounded-xl
          px-4 py-3 text-sm text-on-surface placeholder-on-surface-variant/60
          transition-all focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
          resize-none disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-error focus:border-error focus:ring-error' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-error font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </p>
      )}
      {hint && !error && <p className="text-xs text-on-surface-variant">{hint}</p>}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SELECT
   ───────────────────────────────────────────────────────────── */
export function Select({ label, error, className = '', containerClassName = '', children, ...props }) {
  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label className="block font-display text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
          {label}
        </label>
      )}
      <select
        className={`
          w-full bg-surface-container-low border border-card-border rounded-xl
          px-4 py-2.5 text-sm text-on-surface
          transition-all focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
          disabled:opacity-50 disabled:cursor-not-allowed appearance-none
          ${error ? 'border-error' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-error font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   CARD
   ───────────────────────────────────────────────────────────── */
export function Card({ children, className = '', hover = false, padding = 'md', ...props }) {
  const paddings = { none: '', sm: 'p-4', md: 'p-5 sm:p-6', lg: 'p-6 sm:p-8' };
  return (
    <div
      className={`
        bg-surface-container-low border border-card-border rounded-2xl
        ${hover ? 'hover:border-primary/30 hover:shadow-card-hover transition-all duration-200 cursor-pointer' : ''}
        ${paddings[padding] || paddings.md}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   BADGE
   ───────────────────────────────────────────────────────────── */
export function Badge({ children, variant = 'default', size = 'sm', className = '' }) {
  const variants = {
    default: 'bg-surface-container text-on-surface-variant border-card-border',
    primary: 'bg-primary/15 text-primary border-primary/30',
    secondary: 'bg-secondary/15 text-secondary border-secondary/30',
    success: 'bg-success/15 text-success border-success/30',
    warning: 'bg-warning/15 text-warning border-warning/30',
    danger: 'bg-error/15 text-error border-error/30',
    live: 'bg-error/15 text-error border-error/30 animate-pulse',
    verified: 'bg-secondary/15 text-secondary border-secondary/30',
    gold: 'bg-tertiary/15 text-tertiary border-tertiary/30',
  };
  const sizes = {
    xs: 'px-1.5 py-0.5 text-[9px]',
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  };
  return (
    <span className={`inline-flex items-center gap-1 font-mono font-bold uppercase tracking-wider border rounded-md ${variants[variant] || variants.default} ${sizes[size] || sizes.sm} ${className}`}>
      {children}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   AVATAR
   ───────────────────────────────────────────────────────────── */
export function Avatar({ src, name = '?', size = 'md', className = '' }) {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  };
  const initial = (name?.[0] || '?').toUpperCase();
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizes[size] || sizes.md} rounded-xl object-cover flex-shrink-0 bg-surface-container ${className}`}
        onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
      />
    );
  }
  return (
    <div className={`${sizes[size] || sizes.md} rounded-xl bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center font-display font-bold text-on-surface flex-shrink-0 ring-1 ring-card-border ${className}`}>
      {initial}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SKELETON (Loading placeholder)
   ───────────────────────────────────────────────────────────── */
export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`animate-pulse bg-surface-container-high rounded-lg ${className}`}
      {...props}
    />
  );
}

export function SkeletonCard({ lines = 3 }) {
  return (
    <Card className="space-y-3">
      <Skeleton className="h-4 w-2/3" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-3 ${i === lines - 1 ? 'w-1/2' : 'w-full'}`} />
      ))}
    </Card>
  );
}

/* ─────────────────────────────────────────────────────────────
   SPINNER
   ───────────────────────────────────────────────────────────── */
export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8', xl: 'w-12 h-12' };
  return <Loader2 className={`animate-spin text-primary ${sizes[size] || sizes.md} ${className}`} />;
}

export function LoadingState({ message = 'Loading...', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 gap-3 ${className}`}>
      <Spinner size="lg" />
      <p className="text-sm text-on-surface-variant font-medium">{message}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   EMPTY STATE
   ───────────────────────────────────────────────────────────── */
export function EmptyState({ icon: Icon = Inbox, title, description, action, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center gap-4 ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface-variant">
        <Icon className="w-7 h-7" />
      </div>
      {title && <p className="font-display font-bold text-base text-on-surface">{title}</p>}
      {description && <p className="text-sm text-on-surface-variant max-w-xs leading-relaxed">{description}</p>}
      {action}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ALERT
   ───────────────────────────────────────────────────────────── */
export function Alert({ variant = 'info', children, className = '', onDismiss }) {
  const configs = {
    info: { icon: Info, cls: 'bg-primary/10 border-primary/30 text-primary' },
    success: { icon: CheckCircle2, cls: 'bg-success/10 border-success/30 text-success' },
    warning: { icon: AlertCircle, cls: 'bg-warning/10 border-warning/30 text-warning' },
    error: { icon: XCircle, cls: 'bg-error/10 border-error/30 text-error' },
  };
  const { icon: Icon, cls } = configs[variant] || configs.info;
  return (
    <div className={`flex items-start gap-3 p-3.5 rounded-xl border text-sm ${cls} ${className}`}>
      <Icon className="w-4 h-4 shrink-0 mt-0.5" />
      <div className="flex-1 font-medium">{children}</div>
      {onDismiss && (
        <button onClick={onDismiss} className="opacity-60 hover:opacity-100 transition-opacity">
          <XCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   DIALOG / MODAL
   ───────────────────────────────────────────────────────────── */
export function Dialog({ isOpen, onClose, title, subtitle, children, maxWidth = 'max-w-lg', className = '' }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel */}
      <div className={`relative w-full ${maxWidth} bg-surface-container-low border border-card-border rounded-2xl shadow-2xl animate-slide-up ${className}`}>
        {/* Header */}
        {(title || onClose) && (
          <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-card-border">
            <div>
              {title && <h2 className="font-display font-bold text-lg text-on-surface">{title}</h2>}
              {subtitle && <p className="text-xs text-on-surface-variant mt-0.5">{subtitle}</p>}
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="shrink-0 p-1.5 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant"
              >
                <XCircle className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   TABS
   ───────────────────────────────────────────────────────────── */
export function Tabs({ tabs, activeTab, onSelect, className = '' }) {
  return (
    <div className={`flex items-center gap-1 p-1 rounded-xl bg-surface-container border border-card-border ${className}`}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-display text-xs font-semibold transition-all ${
              isActive
                ? 'bg-primary text-white shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   STATUS PILL (for application / verification statuses)
   ───────────────────────────────────────────────────────────── */
const STATUS_CONFIGS = {
  applied: { label: 'Applied', variant: 'default' },
  pending: { label: 'Pending', variant: 'default' },
  pending_review: { label: 'Under Review', variant: 'warning' },
  under_review: { label: 'Under Review', variant: 'warning' },
  shortlisted: { label: 'Shortlisted', variant: 'secondary' },
  tryout: { label: 'Tryout', variant: 'secondary' },
  accepted: { label: 'Accepted', variant: 'success' },
  approved: { label: 'Approved', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'danger' },
  withdrawn: { label: 'Withdrawn', variant: 'default' },
  open: { label: 'Open', variant: 'success' },
  closed: { label: 'Closed', variant: 'default' },
  draft: { label: 'Draft', variant: 'default' },
  active: { label: 'Active', variant: 'success' },
  live: { label: 'LIVE', variant: 'live' },
  completed: { label: 'Completed', variant: 'default' },
  cancelled: { label: 'Cancelled', variant: 'danger' },
  not_applied: { label: 'Not Applied', variant: 'default' },
};

export function StatusBadge({ status, className = '' }) {
  const config = STATUS_CONFIGS[status?.toLowerCase?.()] || { label: status, variant: 'default' };
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}

/* ─────────────────────────────────────────────────────────────
   SECTION HEADER
   ───────────────────────────────────────────────────────────── */
export function SectionHeader({ eyebrow, title, description, align = 'center', action, className = '' }) {
  const alignClasses = {
    center: 'text-center items-center',
    left: 'text-left items-start',
  };
  return (
    <div className={`flex flex-col gap-3 ${alignClasses[align] || alignClasses.center} ${className}`}>
      <div className={`flex flex-col gap-2 ${alignClasses[align] || alignClasses.center}`}>
        {eyebrow && (
          <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
            {eyebrow}
          </span>
        )}
        {title && (
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl text-on-surface tracking-tight">
            {title}
          </h2>
        )}
        {description && (
          <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   STAT CARD
   ───────────────────────────────────────────────────────────── */
export function StatCard({ icon: Icon, label, value, color = 'text-primary', className = '' }) {
  return (
    <div className={`flex items-center gap-3 p-4 bg-surface-container-low border border-card-border rounded-xl ${className}`}>
      {Icon && (
        <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center flex-shrink-0">
          <Icon className={`w-4.5 h-4.5 ${color}`} />
        </div>
      )}
      <div>
        <p className="font-mono text-xs text-on-surface-variant">{label}</p>
        <p className={`font-display font-bold text-lg ${color}`}>{value}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   DIVIDER
   ───────────────────────────────────────────────────────────── */
export function Divider({ label, className = '' }) {
  if (!label) return <hr className={`border-card-border ${className}`} />;
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <hr className="flex-1 border-card-border" />
      <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">{label}</span>
      <hr className="flex-1 border-card-border" />
    </div>
  );
}
