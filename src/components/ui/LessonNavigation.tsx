import { ChevronLeft, ChevronRight, BarChart3 } from "lucide-react";

type LessonNavigationProps = {
  onPrevious?: () => void;
  onNext?: () => void;
  onViewProgress?: () => void;
  progress?: number;
  isPreviousDisabled?: boolean;
  isNextDisabled?: boolean;
};

const LessonNavigation = ({
  onPrevious,
  onNext,
  onViewProgress,
  progress,
  isPreviousDisabled = false,
  isNextDisabled = false,
}: LessonNavigationProps) => {
  return (
    <nav
      aria-label="Lesson navigation"
      className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <button
        type="button"
        onClick={onPrevious}
        disabled={isPreviousDisabled}
        aria-label="Go to previous lesson"
        className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </button>

      <button
        type="button"
        onClick={onViewProgress}
        aria-label="View lesson progress"
        className="flex items-center justify-center gap-2 rounded-lg bg-blue-50 px-5 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <BarChart3 className="h-4 w-4" />
        Progress
        {progress !== undefined && (
          <span className="text-xs font-semibold">{progress}%</span>
        )}
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={isNextDisabled}
        aria-label="Go to next lesson"
        className="flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
};

export default LessonNavigation;