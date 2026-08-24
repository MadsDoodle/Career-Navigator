import type { Meta, StoryObj } from '@storybook/react-vite';
import { LearnerProgressBadge } from './LearnerProgressBadge';
import type { LearnerProgressBadgeProps } from './LearnerProgressBadge';
import '../../index.css';

const meta = {
  title: 'Learner/LearnerProgressBadge',
  component: LearnerProgressBadge,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'light',
    },
  },
  argTypes: {
    state: {
      control: 'select',
      options: ['default', 'in-progress', 'completed', 'disabled'],
    },
    progress: {
      control: {
        type: 'range',
        min: 0,
        max: 100,
        step: 1,
      },
    },
    label: {
      control: 'text',
    },
  },
} satisfies Meta<typeof LearnerProgressBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

const STATUS_COPY = {
  default: {
    title: 'Not Started',
    description: 'Your journey begins here.',
    accent: '#f59e0b',
    accentSoft: '#fef3c7',
  },
  'in-progress': {
    title: 'In Progress',
    description: 'Keep going — almost there.',
    accent: '#3b82f6',
    accentSoft: '#dbeafe',
  },
  completed: {
    title: 'Completed',
    description: 'Milestone unlocked. Nice work!',
    accent: '#22c55e',
    accentSoft: '#dcfce7',
  },
  disabled: {
    title: 'Locked',
    description: 'Finish the previous step first.',
    accent: '#9ca3af',
    accentSoft: '#f3f4f6',
  },
} as const;

const ProgressRing = ({
  progress,
  color,
}: {
  progress?: number;
  color: string;
}) => {
  const size = 56;
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(100, Math.max(0, progress ?? 25));
  const offset = circumference - (pct / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.4s ease' }}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="13"
        fontWeight={700}
        fill="#111827"
      >
        {pct}%
      </text>
    </svg>
  );
};

const Showcase = (props: LearnerProgressBadgeProps) => {
  const status = STATUS_COPY[props.state];

  return (
    <div
      style={{
        width: '420px',
        borderRadius: '18px',
        padding: '2px',
        background: `linear-gradient(135deg, ${status.accent}, ${status.accentSoft})`,
      }}
    >
      <div
        style={{
          borderRadius: '16px',
          padding: '22px',
          background: 'var(--lms-surface-card, #ffffff)',
          display: 'flex',
          alignItems: 'center',
          gap: '18px',
        }}
      >
        <div
          style={{
            flexShrink: 0,
            width: '56px',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ProgressRing progress={props.progress} color={status.accent} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '4px',
            }}
          >
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '2px 8px',
                borderRadius: '999px',
                color: status.accent,
                background: status.accentSoft,
              }}
            >
              {status.title}
            </span>
          </div>

          <p
            style={{
              margin: 0,
              fontSize: '13px',
              lineHeight: 1.5,
              color: 'var(--lms-surface-caption, #6b7280)',
            }}
          >
            {status.description}
          </p>

          <div style={{ marginTop: '12px' }}>
            <LearnerProgressBadge {...props} />
          </div>
        </div>
      </div>
    </div>
  );
};

export const Default: Story = {
  args: {
    state: 'default',
  },
  render: (args) => <Showcase {...args} />,
};

export const InProgress: Story = {
  args: {
    state: 'in-progress',
    progress: 65,
  },
  render: (args) => <Showcase {...args} />,
};

export const Completed: Story = {
  args: {
    state: 'completed',
    progress: 100,
  },
  render: (args) => <Showcase {...args} />,
};

export const Disabled: Story = {
  args: {
    state: 'disabled',
  },
  render: (args) => <Showcase {...args} />,
};

 
export const AllStates: Story = {
  args: {
    state: 'default',
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <Showcase state="default" />
      <Showcase state="in-progress" progress={65} />
      <Showcase state="completed" progress={100} />
      <Showcase state="disabled" />
    </div>
  ),
};