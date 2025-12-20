import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  FileText, 
  BookOpen, 
  Briefcase, 
  MessageSquare, 
  Target, 
  Upload,
  Sparkles,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardNavbar from '@/components/DashboardNavbar';
import TypewriterText from '@/components/dashboard/TypewriterText';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  resumesCount: number;
  resourcesCount: number;
  jobsCount: number;
  chatsCount: number;
}

const featureCards = [
  {
    title: 'Resume Screening',
    description: 'Upload and analyze your resume with AI',
    icon: Upload,
    href: '/resume-screening',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    title: 'Resume Builder',
    description: 'Create ATS-optimized resumes',
    icon: FileText,
    href: '/resume-builder',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    title: 'Skill Gap Analysis',
    description: 'Identify skills to develop',
    icon: Target,
    href: '/skill-gap',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    title: 'Learning Resources',
    description: 'Get personalized learning paths',
    icon: BookOpen,
    href: '/resources',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    title: 'Job Matching',
    description: 'Find jobs that match your profile',
    icon: Briefcase,
    href: '/jobs',
    gradient: 'from-indigo-500 to-purple-500',
  },
  {
    title: 'Career Chat',
    description: 'Get AI career guidance',
    icon: MessageSquare,
    href: '/resources',
    gradient: 'from-pink-500 to-rose-500',
  },
];

const Dashboard = () => {
  const { userProfile, isLoading } = useUser();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    resumesCount: 0,
    resourcesCount: 0,
    jobsCount: 0,
    chatsCount: 0,
  });

  useEffect(() => {
    if (!isLoading && !userProfile) {
      navigate('/');
    }
  }, [userProfile, isLoading, navigate]);

  useEffect(() => {
    if (userProfile) {
      fetchStats();
    }
  }, [userProfile]);

  const fetchStats = async () => {
    if (!userProfile) return;

    try {
      const [resumes, resources, jobs, chats] = await Promise.all([
        supabase.from('resumes').select('id', { count: 'exact' }).eq('user_profile_id', userProfile.id),
        supabase.from('resources').select('id', { count: 'exact' }).eq('user_profile_id', userProfile.id),
        supabase.from('jobs').select('id', { count: 'exact' }).eq('user_profile_id', userProfile.id),
        supabase.from('chat_history').select('id', { count: 'exact' }).eq('user_profile_id', userProfile.id),
      ]);

      setStats({
        resumesCount: resumes.count || 0,
        resourcesCount: resources.count || 0,
        jobsCount: jobs.count || 0,
        chatsCount: chats.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full"
        />
      </div>
    );
  }

  if (!userProfile) return null;

  return (
    <>
      <Helmet>
        <title>Dashboard - AI Career Navigator</title>
        <meta name="description" content="Your personalized career dashboard" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <DashboardNavbar />
        <DashboardSidebar />
        
        <main className="ml-20 lg:ml-[280px] transition-all duration-300 pt-24 pb-12">
          <div className="max-w-6xl mx-auto px-6 py-8">
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center"
                >
                  <Sparkles className="w-6 h-6 text-primary-foreground" />
                </motion.div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-primary">
                    <TypewriterText 
                      text={`Welcome, ${userProfile.name}!`} 
                      delay={300} 
                      speed={60} 
                    />
                  </h1>
                </div>
              </div>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="text-lg text-muted-foreground max-w-2xl"
              >
                <TypewriterText 
                  text="Start your career journey with us. Explore our AI-powered tools to build your dream career." 
                  delay={1500} 
                  speed={30} 
                />
              </motion.p>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
            >
              {[
                { label: 'Resumes', value: stats.resumesCount, icon: FileText },
                { label: 'Resources', value: stats.resourcesCount, icon: BookOpen },
                { label: 'Jobs Applied', value: stats.jobsCount, icon: Briefcase },
                { label: 'Conversations', value: stats.chatsCount, icon: MessageSquare },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="glass-card p-6"
                >
                  <stat.icon className="w-8 h-8 text-secondary mb-3" />
                  <div className="text-3xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-8"
            >
              <h2 className="text-xl font-semibold text-primary mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-secondary" />
                Quick Actions
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featureCards.map((card, index) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <Link to={card.href}>
                      <motion.div
                        whileHover={{ y: -4 }}
                        className="glass-card-hover p-6 h-full"
                      >
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-4`}>
                          <card.icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-primary mb-2">{card.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{card.description}</p>
                        <div className="flex items-center gap-1 text-secondary text-sm font-medium">
                          Explore
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Dashboard;
