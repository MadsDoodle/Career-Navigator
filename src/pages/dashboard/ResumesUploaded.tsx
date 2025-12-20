import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Upload, FileText, Calendar, Trash2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/integrations/supabase/client';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import FloatingNav from '@/components/dashboard/FloatingNav';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface Resume {
  id: string;
  title: string;
  file_url: string | null;
  created_at: string;
}

const ResumesUploaded = () => {
  const { userProfile, isLoading } = useUser();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
        .eq('type', 'uploaded')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResumes(data || []);
    } catch (error) {
      console.error('Error fetching resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userProfile) return;

    if (file.type !== 'application/pdf') {
      toast({ title: 'Please upload a PDF file', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const fileName = `${userProfile.id}/${Date.now()}_${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('resumes')
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase
        .from('resumes')
        .insert({
          user_profile_id: userProfile.id,
          title: file.name.replace('.pdf', ''),
          type: 'uploaded',
          file_url: urlData.publicUrl,
        });

      if (insertError) throw insertError;

      toast({ title: 'Resume uploaded successfully!' });
      fetchResumes();
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: 'Failed to upload resume', variant: 'destructive' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
        <title>Uploaded Resumes - Dashboard</title>
      </Helmet>

      <div className="min-h-screen bg-background">
        <DashboardSidebar />
        
        <main className="ml-20 lg:ml-[280px] transition-all duration-300 pb-32">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-primary">Uploaded Resumes</h1>
                <p className="text-muted-foreground">Your uploaded PDF resumes</p>
              </div>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf"
                  className="hidden"
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="btn-primary flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Uploading...' : 'Upload PDF'}
                </Button>
              </div>
            </div>

            {resumes.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-12 text-center"
              >
                <Upload className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-primary mb-2">No uploads yet</h3>
                <p className="text-muted-foreground mb-6">Upload your existing resume for AI analysis</p>
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-primary"
                >
                  Upload Resume
                </Button>
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
                      <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-secondary" />
                      </div>
                      <div className="flex gap-2">
                        {resume.file_url && (
                          <a
                            href={resume.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-muted-foreground hover:text-primary transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => deleteResume(resume.id)}
                          className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <h3 className="font-semibold text-primary mb-2 truncate">{resume.title}</h3>
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

export default ResumesUploaded;
