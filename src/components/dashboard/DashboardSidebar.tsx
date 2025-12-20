import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  BookOpen, 
  Briefcase, 
  MessageSquare, 
  ChevronLeft, 
  ChevronRight,
  Home,
  Upload,
  PenTool
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface SidebarSection {
  id: string;
  title: string;
  icon: React.ElementType;
  items: { label: string; href: string; icon?: React.ElementType }[];
}

const sections: SidebarSection[] = [
  {
    id: 'resumes',
    title: 'Resumes',
    icon: FileText,
    items: [
      { label: 'Created Resumes', href: '/dashboard/resumes/created', icon: PenTool },
      { label: 'Uploaded Resumes', href: '/dashboard/resumes/uploaded', icon: Upload },
    ],
  },
  {
    id: 'resources',
    title: 'Resources',
    icon: BookOpen,
    items: [
      { label: 'Enrolled Resources', href: '/dashboard/resources' },
    ],
  },
  {
    id: 'jobs',
    title: 'Jobs',
    icon: Briefcase,
    items: [
      { label: 'Applied Jobs', href: '/dashboard/jobs' },
    ],
  },
  {
    id: 'chat',
    title: 'Chat History',
    icon: MessageSquare,
    items: [
      { label: 'All Conversations', href: '/dashboard/chat-history' },
    ],
  },
];

const DashboardSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['resumes']);
  const location = useLocation();

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen bg-card border-r border-border z-40 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                <Home className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-primary">Dashboard</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {/* Home Link */}
        <Link
          to="/dashboard"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
            location.pathname === '/dashboard'
              ? "bg-primary/10 text-primary"
              : "hover:bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          <Home className="w-5 h-5 flex-shrink-0" />
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-medium"
              >
                Home
              </motion.span>
            )}
          </AnimatePresence>
        </Link>

        {/* Sections */}
        {sections.map((section) => (
          <div key={section.id}>
            <button
              onClick={() => !isCollapsed && toggleSection(section.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                expandedSections.includes(section.id) && !isCollapsed
                  ? "bg-muted"
                  : "hover:bg-muted",
                "text-muted-foreground hover:text-foreground"
              )}
            >
              <section.icon className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="font-medium flex-1 text-left"
                  >
                    {section.title}
                  </motion.span>
                )}
              </AnimatePresence>
              {!isCollapsed && (
                <ChevronRight
                  className={cn(
                    "w-4 h-4 transition-transform",
                    expandedSections.includes(section.id) && "rotate-90"
                  )}
                />
              )}
            </button>

            {/* Sub-items */}
            <AnimatePresence>
              {!isCollapsed && expandedSections.includes(section.id) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pl-8 space-y-1 mt-1">
                    {section.items.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                          location.pathname === item.href
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                      >
                        {item.icon && <item.icon className="w-4 h-4" />}
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>

      {/* Back to Home */}
      <div className="p-4 border-t border-border">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          {!isCollapsed && <span className="font-medium">Back to Home</span>}
        </Link>
      </div>
    </motion.aside>
  );
};

export default DashboardSidebar;
