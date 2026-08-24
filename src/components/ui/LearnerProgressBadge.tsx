
import * as React from 'react';
import { Check, Lock } from 'lucide-react';
import './tokens.css';

export type LearnerProgressState = 'default' | 'in-progress' | 'completed' | 'disabled';

export interface LearnerProgressBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  state: LearnerProgressState;
  progress?: number;
  label?: string;
  className?: string;
}

export const LearnerProgressBadge: React.FC<LearnerProgressBadgeProps> = ({
  state = 'default',
  progress = 0,
  label,
  className = '',
  ...props
}) => {
  const safeProgress = Math.min(100, Math.max(0, Math.round(progress)));
  const stateClasses = {
    default: 'border-[var(--lms-state-default-border)] bg-[var(--lms-state-default-bg)] text-[var(--lms-state-default-text)]',
    'in-progress': 'border-[var(--lms-state-progress-border)] bg-[var(--lms-state-progress-bg)] text-[var(--lms-state-progress-text)]',
    completed: 'border-[var(--lms-state-completed-border)] bg-[var(--lms-state-completed-bg)] text-[var(--lms-state-completed-text)]',
    disabled: 'cursor-not-allowed border-[var(--lms-state-disabled-border)] bg-[var(--lms-state-disabled-bg)] text-[var(--lms-state-disabled-text)]',
  }[state];

  return (
    <div
      role="status"
      aria-disabled={state === 'disabled'}
      className={`inline-flex items-center gap-[var(--lms-badge-gap)] rounded-full border-[1.5px] border-solid px-[var(--lms-badge-padding-x)] py-[var(--lms-badge-padding-y)] font-sans text-xs font-extrabold uppercase tracking-[var(--lms-letter-spacing-badge)] select-none ${stateClasses} ${className}`.trim()}
      {...props}
    >
      {state === 'default' && (
        <>
          <span className="h-[15px] w-[15px] shrink-0 rounded-full border-[2.2px] border-[var(--lms-state-default-icon)]" />
          {label ? (
            <span>{label}</span>
          ) : (
            <div className="flex flex-col text-[11px] leading-[1.15]">
              <span>NOT</span>
              <span>STARTED</span>
            </div>
          )}
        </>
      )}

      {state === 'in-progress' && (
        <>
          <span className="inline-flex shrink-0 -rotate-90">
            <svg viewBox="0 0 16 16" width="16" height="16">
              <circle className="fill-none stroke-[var(--lms-state-progress-ring-track)] [stroke-width:2.8]" cx="8" cy="8" r="6" />
              <circle
                className="fill-none stroke-[var(--lms-state-progress-ring-fill)] [stroke-width:2.8] [stroke-linecap:round] transition-[stroke-dashoffset] duration-300 ease-in-out"
                cx="8"
                cy="8"
                r="6"
                style={{
                  strokeDasharray: 37.7,
                  strokeDashoffset: 37.7 - (safeProgress / 100) * 37.7,
                }}
              />
            </svg>
          </span>
          {label ? (
            <span>{label}</span>
          ) : (
            <div className="flex flex-col text-[11px] leading-[1.15]">
              <span>{safeProgress}%</span>
              <span>COMPLETE</span>
            </div>
          )}
        </>
      )}

      {state === 'completed' && (
        <>
          <Check size={16} strokeWidth={3} className="shrink-0 text-[var(--lms-state-completed-icon)]" />
          <span>{label ?? 'COMPLETED'}</span>
        </>
      )}

      {state === 'disabled' && (
        <>
          <Lock size={14} strokeWidth={2.4} className="shrink-0 text-[var(--lms-state-disabled-icon)]" />
          <span>{label ?? 'LOCKED'}</span>
        </>
      )}
    </div>
  );
};

export default LearnerProgressBadge;
