import type { Meta, StoryObj } from '@storybook/react-vite';
import { LearnerProgressBadge } from './LearnerProgressBadge';
import type { LearnerProgressBadgeProps } from './LearnerProgressBadge';
import styles from './LearnerProgressBadge.stories.module.css';

const stateContent = {
  default: {
    eyebrow: 'Next up',
    title: 'Start your learning journey',
    description: 'Build your career plan one focused lesson at a time.',
    detail: '5 lessons · 35 min',
  },
  'in-progress': {
    eyebrow: 'Keep going',
    title: 'You are making progress',
    description: 'Pick up where you left off and keep your momentum going.',
    detail: '3 of 5 lessons complete',
  },
  completed: {
    eyebrow: 'Milestone reached',
    title: 'Learning task complete',
    description: 'You finished this learning path. Your next step is ready.',
    detail: 'Completed today',
  },
  disabled: {
    eyebrow: 'Locked',
    title: 'This lesson is unavailable',
    description: 'Complete the previous lesson to unlock this learning task.',
    detail: 'Unlocks after prerequisite',
  },
} as const;

function LearnerProgressShowcase(props: LearnerProgressBadgeProps) {
  const content = stateContent[props.state];
  const progress = props.progress ?? 0;

  return (
    <section className={`${styles.showcase} ${styles[props.state]}`} aria-label={`${content.title} preview`}>
      <div className={styles.topline}>
        <span className={styles.eyebrow}>{content.eyebrow}</span>
        <span className={styles.detail}>{content.detail}</span>
      </div>
      <div className={styles.copy}>
        <h2>{content.title}</h2>
        <p>{content.description}</p>
      </div>
      {props.state === 'in-progress' && (
        <div className={styles.progressTrack} aria-label={`${progress}% complete`}>
          <span style={{ width: `${progress}%` }} />
        </div>
      )}
      <div className={styles.footer}>
        <LearnerProgressBadge {...props} />
        <span className={styles.stateHint}>
          {props.state === 'default' && 'Ready to begin'}
          {props.state === 'in-progress' && 'Continue lesson'}
          {props.state === 'completed' && 'All done'}
          {props.state === 'disabled' && 'Not available yet'}
        </span>
      </div>
    </section>
  );
}

const meta = {
  title: 'LearnerProgressBadge',
  component: LearnerProgressBadge,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    state: {
      control: 'select',
      options: ['default', 'in-progress', 'completed', 'disabled'],
      description: 'Learner badge state',
    },
    progress: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Progress percentage (0-100)',
    },
    label: {
      control: 'text',
      description: 'Optional label override',
    },
  },
} satisfies Meta<typeof LearnerProgressBadge>;

export default meta;
type Story = StoryObj<typeof meta>;


export const Default: Story = {
  args: {
    state: 'default',
  },
  render: (args) => <LearnerProgressShowcase {...args} />,
};

export const InProgress: Story = {
  args: {
    state: 'in-progress',
    progress: 65,
  },
  render: (args) => <LearnerProgressShowcase {...args} />,
};

export const Completed: Story = {
  args: {
    state: 'completed',
  },
  render: (args) => <LearnerProgressShowcase {...args} />,
};

export const Disabled: Story = {
  args: {
    state: 'disabled',
  },
  render: (args) => <LearnerProgressShowcase {...args} />,
};
