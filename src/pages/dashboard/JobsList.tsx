import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Briefcase, Building2, Calendar, Trash2, FileText } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/integrations/supabase/client';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import FloatingNav from '@/components/dashboard/FloatingNav';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Job {
  id: string;
  job_title: string;
  company: string;
  description: string | null;
  cover_letter: string | null;
  applied_at: string;
  status: string | null;
}

const JobsList = () => {
  const { userProfile, isLoading } = useUser();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !userProfile) {
      navigate('/');
    }
  }, [userProfile, isLoading, navigate]);

  useEffect(() => {
    if (userProfile) {
      fetchJobs();
    }
  }, [userProfile]);

  const fetchJobs = async () => {
    if (!userProfile) return;
    
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_profile_id', userProfile.id)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async (id: string) => {
    try {
      const { error } = await supabase.from('jobs').delete().eq('id', id);
      if (error) throw error;
      setJobs((prev) => prev.filter((j) => j.id !== id));
      toast({ title: 'Job removed successfully' });
    } catch (error) {
      toast({ title: 'Failed to remove job', variant: 'destructive' });
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'interviewing': return 'bg-yellow-100 text-yellow-800';
      case 'offered': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
        <title>Applied Jobs - Dashboard</title>
      </Helmet>

      <div className="min-h-screen bg-background">
        <DashboardSidebar />
        
        <main className="ml-20 lg:ml-[280px] transition-all duration-300 pb-32">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-primary">Applied Jobs</h1>
                <p className="text-muted-foreground">Track your job applications</p>
              </div>
              <Link to="/jobs">
                <Button className="btn-primary">Find Jobs</Button>
              </Link>
            </div>

            {jobs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-12 text-center"
              >
                <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-primary mb-2">No applications yet</h3>
                <p className="text-muted-foreground mb-6">Start applying to jobs matched for you</p>
                <Link to="/jobs">
                  <Button className="btn-primary">Browse Jobs</Button>
                </Link>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card-hover p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Briefcase className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-primary text-lg">{job.job_title}</h3>
                          <div className="flex items-center gap-2 text-muted-foreground mt-1">
                            <Building2 className="w-4 h-4" />
                            <span>{job.company}</span>
                          </div>
                          <div className="flex items-center gap-4 mt-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                              {job.status || 'Applied'}
                            </span>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              {new Date(job.applied_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {job.cover_letter && (
                          <button
                            onClick={() => setSelectedJob(job)}
                            className="p-2 text-muted-foreground hover:text-primary transition-colors"
                            title="View Cover Letter"
                          >
                            <FileText className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteJob(job.id)}
                          className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </main>

        <FloatingNav />

        {/* Cover Letter Dialog */}
        <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Cover Letter - {selectedJob?.job_title} at {selectedJob?.company}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4 whitespace-pre-wrap text-muted-foreground">
              {selectedJob?.cover_letter}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default JobsList;
