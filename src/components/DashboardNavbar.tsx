import { motion } from 'framer-motion';
import { 
  FileText, 
  BookOpen, 
  Briefcase, 
  Target, 
  Upload,
  Home,
  Sparkles
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/resume-screening', icon: Upload, label: 'Screen Resume' },
  { href: '/resume-builder', icon: FileText, label: 'Build Resume' },
  { href: '/skill-gap', icon: Target, label: 'Skill Gap' },
  { href: '/resources', icon: BookOpen, label: 'Resources' },
  { href: '/jobs', icon: Briefcase, label: 'Jobs' },
];

const DashboardNavbar = () => {
  const location = useLocation();

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, type: 'spring', damping: 20 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="glass-card px-3 py-2 flex items-center justify-center gap-1 rounded-full shadow-lg border border-border/50">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2 mr-2">
          <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-sm text-primary hidden lg:block">
            AI Career<span className="text-secondary">Nav</span>
          </span>
        </Link>

        {/* Divider */}
        <div className="w-px h-8 bg-border/50 mr-2" />

        {/* Nav Items */}
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="dashboard-nav-active"
                  className="absolute inset-0 bg-primary/10 rounded-full"
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                />
              )}
              <item.icon className="w-4 h-4 relative z-10" />
              <span className="text-sm font-medium relative z-10 hidden md:block">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default DashboardNavbar;
