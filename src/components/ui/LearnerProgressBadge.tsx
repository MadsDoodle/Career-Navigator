
import * as React from 'react';
import { Check, Lock } from 'lucide-react';
import styles from './LearnerProgressBadge.module.css';

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

  return (
    <div
      role="status"
      aria-disabled={state === 'disabled'}
      className={`${styles.badge} ${styles[state]} ${className}`.trim()}
      {...props}
    >
      {/* 1. Default (Not Started) */}
      {state === 'default' && (
        <>
          <span className={styles.circleIcon} />
          {label ? (
            <span className={styles.singleText}>{label}</span>
          ) : (
            <div className={styles.stackedText}>
              <span>NOT</span>
              <span>STARTED</span>
            </div>
          )}
        </>
      )}

      {/* 2. In-Progress */}
      {state === 'in-progress' && (
        <>
          <span className={styles.progressRing}>
            <svg viewBox="0 0 16 16" width="16" height="16">
              <circle className={styles.ringTrack} cx="8" cy="8" r="6" />
              <circle
                className={styles.ringFill}
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
            <span className={styles.singleText}>{label}</span>
          ) : (
            <div className={styles.stackedText}>
              <span>{safeProgress}%</span>
              <span>COMPLETE</span>
            </div>
          )}
        </>
      )}

      {/* 3. Completed */}
      {state === 'completed' && (
        <>
          <Check size={16} strokeWidth={3} className={styles.checkIcon} />
          <span className={styles.singleText}>{label ?? 'COMPLETED'}</span>
        </>
      )}

      {/* 4. Disabled (Locked) */}
      {state === 'disabled' && (
        <>
          <Lock size={14} strokeWidth={2.4} className={styles.lockIcon} />
          <span className={styles.singleText}>{label ?? 'LOCKED'}</span>
        </>
      )}
    </div>
  );
};

export default LearnerProgressBadge;
