import type {Meta, StoryObj} from '@storybook/react-vite';
import {StudentQuiz} from './studentQuiz';
import {Toaster} from "sonner";

const meta = {
  title: 'Learner/StudentQuiz',
  component : StudentQuiz,
  decorators : [
    (Story)=>(
      <>
        <Story/>
        <Toaster richColors position="top-center" />
      </>
    )
  ],
  parameters : {
    layout : 'centered',
  },} satisfies Meta<typeof StudentQuiz>;
 
  export default meta;
  type Story = StoryObj<typeof meta>;
  export const Default: Story = {}