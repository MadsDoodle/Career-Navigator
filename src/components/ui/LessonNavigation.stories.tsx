import type { Meta, StoryObj } from '@storybook/react-vite';
import LessonNavigation from './LessonNavigation';

const meta = {
  title: 'Learner/LessonNavigation',
  component: LessonNavigation,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof LessonNavigation>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onPrevious: () => alert('Previous lesson opened'),
    onNext: () => alert('Next lesson opened'),
    
  },
};