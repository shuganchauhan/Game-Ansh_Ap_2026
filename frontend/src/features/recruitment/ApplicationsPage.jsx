import React from 'react';
import { Briefcase, CheckCircle, Clock, XCircle, ArrowRight, Shield, ExternalLink } from 'lucide-react';
import { useGameStore } from '../../stores/gameStore';

export default function ApplicationsPage({ onOpenAuth }) {
  const { applications, currentUser } = useGameStore();

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase bg-secondary/15 text-secondary border border-secondary/30 font-bold">
            <CheckCircle className="w-3.5 h-3.5" />
            Signed / Accepted
          </span>
        );
      case 'shortlisted':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase bg-tertiary/15 text-tertiary border border-tertiary/30 font-bold">
            <Clock className="w-3.5 h-3.5" />
            Shortlisted for Trial
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase bg-error/15 text-error border border-error/30 font-bold">
            <XCircle className="w-3.5 h-3.5" />
            Declined
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase bg-primary/15 text-primary border border-primary/30 font-bold">
            <Clock className="w-3.5 h-3.5" />
            In Review
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-xs uppercase tracking-wider text-secondary font-bold">
            Scouting &amp; Tryout Pipeline
          </span>
        </div>
        <h1 className="font-display font-bold text-3xl text-on-surface">Recruitment Applications</h1>
        <p className="font-body text-sm text-on-surface-variant mt-1">
          Track the live status of your team tryout submissions across all verified esports organizations.
        </p>
      </div>

      <div className="space-y-4">
        {applications.length > 0 ? (
          applications.map((app) => (
            <div
              key={app.id}
              className="p-6 rounded-2xl bg-surface-container-low border border-card-border space-y-4 transition-all hover:border-primary/40 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center font-display font-bold text-lg text-primary border border-card-border shrink-0">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-display font-bold text-lg text-on-surface">{app.teamName}</h2>
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold bg-surface-container text-on-surface-variant">
                        {app.game?.toUpperCase()}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-secondary font-semibold">
                      Position: {app.roleName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {getStatusBadge(app.status)}
                </div>
              </div>

              {/* Pitch */}
              <div className="p-3.5 rounded-xl bg-surface-container border border-card-border">
                <span className="font-mono text-[10px] uppercase text-on-surface-variant block mb-1">
                  Submitted Player Dossier:
                </span>
                <p className="font-body text-xs text-on-surface leading-relaxed">
                  &ldquo;{app.pitch}&rdquo;
                </p>
                {app.vodLink && (
                  <div className="flex items-center gap-1.5 text-xs font-mono text-primary pt-2">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <a href={app.vodLink} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      Attached VOD &amp; Scrim Highlights
                    </a>
                  </div>
                )}
              </div>

              {/* Progress Stepper */}
              <div className="relative pt-4 pb-2">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-surface-container-high -translate-y-1/2 z-0" />
                <div className="relative z-10 flex justify-between">
                  {['Applied', 'Shortlisted', 'Final Decision'].map((step, idx) => {
                    const isPassed =
                      (idx === 0) ||
                      (idx === 1 && (app.status === 'shortlisted' || app.status === 'accepted')) ||
                      (idx === 2 && (app.status === 'accepted' || app.status === 'rejected'));
                    return (
                      <div key={idx} className="flex flex-col items-center gap-1">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all ${
                            isPassed
                              ? 'bg-secondary text-on-secondary shadow-[0_0_10px_var(--glow-secondary)]'
                              : 'bg-surface-container-highest text-on-surface-variant'
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <span className="font-mono text-[10px] text-on-surface-variant">{step}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-on-surface-variant pt-2 border-t border-card-border">
                <span>Applicant: {app.applicantName} ({app.applicantRank})</span>
                <span>Submitted {app.appliedAt}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="py-16 text-center space-y-2 rounded-2xl bg-surface-container-low border border-card-border">
            <Briefcase className="w-10 h-10 text-on-surface-variant mx-auto" />
            <p className="font-display font-bold text-base text-on-surface">No applications submitted yet</p>
            <p className="font-body text-xs text-on-surface-variant">
              Explore teams in the Discovery tab and submit your tryout dossier.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
