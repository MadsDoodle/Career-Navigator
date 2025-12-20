import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FileText, Plus, Calendar, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/integrations/supabase/client';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import FloatingNav from '@/components/dashboard/FloatingNav';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface Resume {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

const ResumesCreated = () => {
  const { userProfile, isLoading } = useUser();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !userProfile) {
      navigate('/');
    }
  }, [userProfile, isLoading, navigate]);

  useEffect(() => {
    if (userProfile) {
      fetchResumes();
    }
  }, [userProfile]);

  const fetchResumes = async () => {
    if (!userProfile) return;
    
    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_profile_id', userProfile.id)
        .eq('type', 'created')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResumes(data || []);
    } catch (error) {
      console.error('Error fetching resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteResume = async (id: string) => {
    try {
      const { error } = await supabase.from('resumes').delete().eq('id', id);
      if (error) throw error;
      setResumes((prev) => prev.filter((r) => r.id !== id));
      toast({ title: 'Resume deleted successfully' });
    } catch (error) {
      toast({ title: 'Failed to delete resume', variant: 'destructive' });
    }
  };

  if (isLoading || loading) {
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

  return (
    <>
      <Helmet>
        <title>Created Resumes - Dashboard</title>
      </Helmet>

      <div className="min-h-screen bg-background">
        <DashboardSidebar />
        
        <main className="ml-20 lg:ml-[280px] transition-all duration-300 pb-32">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-primary">Created Resumes</h1>
                <p className="text-muted-foreground">Resumes you've built with our AI</p>
              </div>
              <Link to="/resume-builder">
                <Button className="btn-primary flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Create New
                </Button>
              </Link>
            </div>

            {resumes.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-12 text-center"
              >
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-primary mb-2">No resumes yet</h3>
                <p className="text-muted-foreground mb-6">Start building your first resume with AI assistance</p>
                <Link to="/resume-builder">
                  <Button className="btn-primary">Create Resume</Button>
                </Link>
              </motion.div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resumes.map((resume, index) => (
                  <motion.div
                    key={resume.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card-hover p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <button
                        onClick={() => deleteResume(resume.id)}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <h3 className="font-semibold text-primary mb-2">{resume.title}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {new Date(resume.created_at).toLocaleDateString()}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </main>

        <FloatingNav />
      </div>
    </>
  );
};

export default ResumesCreated;
