import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ArrowLeft, Briefcase, MapPin, DollarSign, Clock, Building2, ExternalLink, Heart, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  posted: string;
  matchScore: number;
  skills: string[];
  description: string;
}

// Placeholder jobs data
const placeholderJobs: Job[] = [
  {
    id: '1',
    title: 'Senior Software Engineer',
    company: 'TechCorp Inc.',
    location: 'San Francisco, CA',
    salary: '$150,000 - $200,000',
    type: 'Full-time',
    posted: '2 days ago',
    matchScore: 92,
    skills: ['React', 'TypeScript', 'Node.js', 'AWS'],
    description: 'We are looking for a Senior Software Engineer to join our team and help build scalable web applications...',
  },
  {
    id: '2',
    title: 'Full Stack Developer',
    company: 'StartupXYZ',
    location: 'Remote',
    salary: '$120,000 - $160,000',
    type: 'Full-time',
    posted: '1 day ago',
    matchScore: 88,
    skills: ['Python', 'React', 'PostgreSQL', 'Docker'],
    description: 'Join our fast-growing startup as a Full Stack Developer and work on cutting-edge technology...',
  },
  {
    id: '3',
    title: 'Frontend Engineer',
    company: 'DesignStudio',
    location: 'New York, NY',
    salary: '$110,000 - $140,000',
    type: 'Full-time',
    posted: '3 days ago',
    matchScore: 85,
    skills: ['React', 'CSS', 'JavaScript', 'Figma'],
    description: 'Looking for a creative Frontend Engineer who can bring beautiful designs to life...',
  },
  {
    id: '4',
    title: 'Backend Developer',
    company: 'DataCorp',
    location: 'Austin, TX',
    salary: '$130,000 - $170,000',
    type: 'Full-time',
    posted: '5 days ago',
    matchScore: 78,
    skills: ['Java', 'Spring Boot', 'Kubernetes', 'MongoDB'],
    description: 'We need a skilled Backend Developer to help scale our data infrastructure...',
  },
  {
    id: '5',
    title: 'DevOps Engineer',
    company: 'CloudServices',
    location: 'Seattle, WA',
    salary: '$140,000 - $180,000',
    type: 'Full-time',
    posted: '1 week ago',
    matchScore: 72,
    skills: ['AWS', 'Terraform', 'Docker', 'CI/CD'],
    description: 'Help us build and maintain our cloud infrastructure as a DevOps Engineer...',
  },
];

const JobMatching = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [showCoverLetterDialog, setShowCoverLetterDialog] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resumeData, setResumeData] = useState('');
  const { toast } = useToast();

  const filteredJobs = placeholderJobs.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSaveJob = (jobId: string) => {
    setSavedJobs(prev =>
      prev.includes(jobId)
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
    toast({
      title: savedJobs.includes(jobId) ? 'Job removed' : 'Job saved',
      description: savedJobs.includes(jobId)
        ? 'Job removed from your saved list'
        : 'Job added to your saved list',
    });
  };

  const generateCoverLetter = async () => {
    if (!selectedJob || !resumeData.trim()) {
      toast({
        title: 'Resume required',
        description: 'Please enter your resume details to generate a cover letter.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-cover-letter', {
        body: {
          resumeData,
          jobTitle: selectedJob.title,
          companyName: selectedJob.company,
          jobDescription: selectedJob.description,
        },
      });

      if (error) throw error;

      if (data.coverLetter) {
        setCoverLetter(data.coverLetter);
        toast({
          title: 'Cover letter generated!',
          description: 'Your personalized cover letter is ready.',
        });
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: 'Generation failed',
        description: 'Failed to generate cover letter. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-orange-600';
  };

  return (
    <>
      <Helmet>
        <title>Job Matching - AI Career Navigator</title>
        <meta name="description" content="Find jobs that match your skills and experience with AI-powered matching." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container-custom py-8">
          <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-secondary transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">Job Matching</h1>
                <p className="text-muted-foreground">AI-matched jobs based on your skills and experience</p>
              </div>
              <Badge variant="secondary" className="mt-4 md:mt-0">
                {placeholderJobs.length} jobs found
              </Badge>
            </div>

            {/* Search */}
            <Card className="glass-card p-4 mb-6">
              <div className="flex gap-4">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search jobs by title, company, or location..."
                  className="flex-1"
                />
                <Button variant="secondary">Search</Button>
              </div>
            </Card>

            {/* Info Banner */}
            <Card className="glass-card p-4 mb-6 bg-secondary/10 border-secondary/30">
              <p className="text-sm text-muted-foreground">
                <strong className="text-primary">Note:</strong> This is a placeholder feature. Jobs shown are demo data.
                In a full implementation, jobs would be fetched from job APIs and matched against your resume using AI.
              </p>
            </Card>

            {/* Job List */}
            <div className="space-y-4">
              {filteredJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="glass-card-hover p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-primary hover:text-secondary cursor-pointer">
                              {job.title}
                            </h3>
                            <div className="flex items-center gap-2 text-muted-foreground mt-1">
                              <Building2 className="w-4 h-4" />
                              <span>{job.company}</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleSaveJob(job.id)}
                          >
                            <Heart
                              className={`w-5 h-5 ${savedJobs.includes(job.id) ? 'fill-red-500 text-red-500' : ''}`}
                            />
                          </Button>
                        </div>

                        <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {job.salary}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            {job.type}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {job.posted}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-3">
                          {job.skills.map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col items-center lg:items-end gap-3">
                        <div className="text-center lg:text-right">
                          <p className="text-sm text-muted-foreground">Match Score</p>
                          <p className={`text-2xl font-bold ${getMatchColor(job.matchScore)}`}>
                            {job.matchScore}%
                          </p>
                          <Progress value={job.matchScore} className="w-24 h-2 mt-1" />
                        </div>
                        <div className="flex gap-2">
                          <Dialog open={showCoverLetterDialog && selectedJob?.id === job.id} onOpenChange={(open) => {
                            setShowCoverLetterDialog(open);
                            if (open) setSelectedJob(job);
                          }}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <FileText className="w-4 h-4 mr-1" />
                                Cover Letter
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Generate Cover Letter for {job.title}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 mt-4">
                                <div>
                                  <Label>Your Resume/Background</Label>
                                  <Textarea
                                    value={resumeData}
                                    onChange={(e) => setResumeData(e.target.value)}
                                    placeholder="Paste your resume or describe your experience..."
                                    className="min-h-[150px]"
                                  />
                                </div>
                                <Button
                                  onClick={generateCoverLetter}
                                  disabled={isGenerating || !resumeData.trim()}
                                  className="w-full"
                                >
                                  {isGenerating ? 'Generating...' : 'Generate Cover Letter'}
                                </Button>
                                {coverLetter && (
                                  <div>
                                    <Label>Generated Cover Letter</Label>
                                    <Textarea
                                      value={coverLetter}
                                      onChange={(e) => setCoverLetter(e.target.value)}
                                      className="min-h-[300px] mt-2"
                                    />
                                    <Button
                                      variant="outline"
                                      className="mt-2"
                                      onClick={() => {
                                        navigator.clipboard.writeText(coverLetter);
                                        toast({ title: 'Copied to clipboard!' });
                                      }}
                                    >
                                      Copy to Clipboard
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button size="sm" className="btn-primary">
                            Easy Apply
                            <ExternalLink className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {filteredJobs.length === 0 && (
              <Card className="glass-card p-12 text-center">
                <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-primary mb-2">No jobs found</h3>
                <p className="text-muted-foreground">Try adjusting your search criteria</p>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default JobMatching;
