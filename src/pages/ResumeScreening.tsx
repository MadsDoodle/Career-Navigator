import { useState, useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Upload, FileText, AlertCircle, CheckCircle2, XCircle, Loader2, ArrowLeft, Lightbulb, File, Target, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import DashboardNavbar from '@/components/DashboardNavbar';
import { useUser } from '@/contexts/UserContext';

interface SectionAnalysis {
  name: string;
  score: number;
  atsFriendly: boolean;
  content: string;
  issues: string[];
  recommendations: string[];
}

interface ResumeAnalysis {
  overallScore: number;
  atsCompatibility: string;
  sections: SectionAnalysis[];
  keywords: {
    found: string[];
    missing: string[];
    industryRelevant: string[];
  };
  formatting: {
    score: number;
    issues: string[];
    suggestions: string[];
  };
  extractedSkills?: string[];
  summary: string;
}

interface SkillGapAnalysis {
  targetRoleAnalysis: {
    title: string;
    description: string;
    averageSalary: string;
    demandLevel: string;
  };
  skillComparison: {
    skill: string;
    category: string;
    currentLevel: number;
    requiredLevel: number;
    gap: number;
    priority: string;
  }[];
  missingSkills: {
    skill: string;
    importance: string;
    timeToLearn: string;
    learningResources: string[];
  }[];
  strengths: string[];
  learningRoadmap: {
    phase1: { title: string; duration: string; focus: string[]; milestones: string[] };
    phase2: { title: string; duration: string; focus: string[]; milestones: string[] };
    phase3: { title: string; duration: string; focus: string[]; milestones: string[] };
  };
  overallReadiness: number;
  estimatedTimeToReady: string;
}

const ResumeScreening = () => {
  const [resumeText, setResumeText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { userProfile } = useUser();

  // Skill Gap Analysis states
  const [showSkillGap, setShowSkillGap] = useState(false);
  const [targetRole, setTargetRole] = useState('');
  const [isAnalyzingSkillGap, setIsAnalyzingSkillGap] = useState(false);
  const [skillGapAnalysis, setSkillGapAnalysis] = useState<SkillGapAnalysis | null>(null);

  const extractTextFromPDF = async (file: File): Promise<string> => {
    toast({
      title: 'PDF uploaded',
      description: 'Processing your PDF. For best results, also paste the text content.',
    });
    return `[PDF uploaded: ${file.name}]\n\nPlease also paste your resume text below for accurate analysis.`;
  };

  const handleFileUpload = useCallback(async (file: File) => {
    if (file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (event) => {
        setResumeText(event.target?.result as string);
        setUploadedFileName(file.name);
      };
      reader.readAsText(file);
    } else if (file.type === 'application/pdf') {
      setUploadedFileName(file.name);
      const text = await extractTextFromPDF(file);
      setResumeText(prev => prev ? prev + '\n\n' + text : text);
    } else {
      toast({
        title: 'File format not supported',
        description: 'Please upload a PDF or .txt file, or paste your resume text directly.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const analyzeResume = async () => {
    if (!resumeText.trim()) {
      toast({
        title: 'Resume text required',
        description: 'Please paste your resume content to analyze.',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-resume', {
        body: { resumeText },
      });

      if (error) throw error;

      if (data.analysis) {
        setAnalysis(data.analysis);
        setShowSkillGap(true); // Show skill gap section after analysis
        toast({
          title: 'Analysis complete!',
          description: 'Your resume has been analyzed. You can now run a skill gap analysis.',
        });
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: 'Analysis failed',
        description: 'Failed to analyze resume. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeSkillGap = async () => {
    if (!targetRole.trim()) {
      toast({
        title: 'Target role required',
        description: 'Please enter your target role to analyze skill gaps.',
        variant: 'destructive',
      });
      return;
    }

    const currentSkills = analysis?.extractedSkills || analysis?.keywords?.found || [];
    
    if (currentSkills.length === 0) {
      toast({
        title: 'No skills found',
        description: 'Could not extract skills from your resume. Please ensure your resume has a skills section.',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzingSkillGap(true);
    try {
      const { data, error } = await supabase.functions.invoke('skill-gap-analysis', {
        body: { currentSkills, targetRole },
      });

      if (error) throw error;

      if (data.analysis) {
        setSkillGapAnalysis(data.analysis);
        toast({
          title: 'Skill gap analysis complete!',
          description: 'Check out your personalized learning roadmap below.',
        });
      }
    } catch (error) {
      console.error('Skill gap analysis error:', error);
      toast({
        title: 'Analysis failed',
        description: 'Failed to analyze skill gaps. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzingSkillGap(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  return (
    <>
      <Helmet>
        <title>AI Resume Screening - AI Career Navigator</title>
        <meta name="description" content="Get instant AI-powered resume analysis with ATS scoring and improvement suggestions." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {userProfile && <DashboardNavbar />}
        <div className={`container-custom py-8 ${userProfile ? 'pt-24' : ''}`}>
          <Link to={userProfile ? '/dashboard' : '/'} className="inline-flex items-center gap-2 text-primary hover:text-secondary transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            {userProfile ? 'Back to Dashboard' : 'Back to Home'}
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">AI Resume Screening</h1>
            <p className="text-muted-foreground mb-8">Get detailed ATS analysis and improvement suggestions for your resume</p>

            {!analysis ? (
              <Card className="glass-card p-6 md:p-8">
                <div className="space-y-6">
                  {/* Drag and Drop Area */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                      isDragging 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50 hover:bg-muted/30'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.txt"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center gap-3">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                        isDragging ? 'bg-primary/20' : 'bg-muted'
                      }`}>
                        <Upload className={`w-8 h-8 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      {uploadedFileName ? (
                        <div className="flex items-center gap-2 text-primary">
                          <File className="w-4 h-4" />
                          <span className="font-medium">{uploadedFileName}</span>
                        </div>
                      ) : (
                        <>
                          <p className="text-foreground font-medium">Drag and drop your resume here</p>
                          <p className="text-sm text-muted-foreground">or click to browse</p>
                        </>
                      )}
                      <p className="text-xs text-muted-foreground">Supports PDF and TXT files</p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-card px-4 text-muted-foreground">or paste your resume text</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Resume content
                    </label>
                    <Textarea
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      placeholder="Paste your resume text here... Include all sections like contact info, summary, experience, education, skills, etc."
                      className="min-h-[250px] font-mono text-sm"
                    />
                  </div>

                  <Button
                    onClick={analyzeResume}
                    disabled={isAnalyzing || !resumeText.trim()}
                    className="w-full btn-primary"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing Resume...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Analyze Resume
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Overall Score Card */}
                <Card className="glass-card p-6 md:p-8">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="relative w-32 h-32">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="8"
                          className="text-muted"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="8"
                          strokeDasharray={`${(analysis.overallScore / 100) * 352} 352`}
                          className={getScoreColor(analysis.overallScore)}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-3xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                          {analysis.overallScore}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h2 className="text-2xl font-bold text-primary mb-2">ATS Compatibility Score</h2>
                      <Badge variant={analysis.atsCompatibility === 'High' ? 'default' : analysis.atsCompatibility === 'Medium' ? 'secondary' : 'destructive'}>
                        {analysis.atsCompatibility} Compatibility
                      </Badge>
                      <p className="text-muted-foreground mt-3">{analysis.summary}</p>
                    </div>
                  </div>
                </Card>

                {/* Extracted Skills */}
                {analysis.extractedSkills && analysis.extractedSkills.length > 0 && (
                  <Card className="glass-card p-6 md:p-8">
                    <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Skills Extracted from Your Resume
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.extractedSkills.map((skill, i) => (
                        <Badge key={i} variant="outline" className="bg-primary/5 border-primary/20 text-primary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Skill Gap Analysis Section */}
                {showSkillGap && !skillGapAnalysis && (
                  <Card className="glass-card p-6 md:p-8 border-2 border-secondary/30">
                    <h3 className="text-xl font-bold text-primary mb-2 flex items-center gap-2">
                      <Target className="w-5 h-5 text-secondary" />
                      Skill Gap Analysis
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Based on your extracted skills, let's identify gaps for your target role.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Input
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        placeholder="Enter your target role (e.g., Senior Software Engineer)"
                        className="flex-1"
                      />
                      <Button
                        onClick={analyzeSkillGap}
                        disabled={isAnalyzingSkillGap || !targetRole.trim()}
                        className="btn-primary whitespace-nowrap"
                      >
                        {isAnalyzingSkillGap ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            Analyze Skill Gap
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                )}

                {/* Skill Gap Analysis Results */}
                {skillGapAnalysis && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Target Role Overview */}
                    <Card className="glass-card p-6 md:p-8 border-2 border-secondary/30">
                      <h3 className="text-xl font-bold text-primary mb-4">
                        Target Role: {skillGapAnalysis.targetRoleAnalysis?.title || targetRole}
                      </h3>
                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground">Overall Readiness</p>
                          <p className={`text-3xl font-bold ${getScoreColor(skillGapAnalysis.overallReadiness)}`}>
                            {skillGapAnalysis.overallReadiness}%
                          </p>
                        </div>
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground">Time to Ready</p>
                          <p className="text-xl font-semibold text-foreground">
                            {skillGapAnalysis.estimatedTimeToReady}
                          </p>
                        </div>
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground">Demand Level</p>
                          <Badge variant={skillGapAnalysis.targetRoleAnalysis?.demandLevel === 'High' ? 'default' : 'secondary'}>
                            {skillGapAnalysis.targetRoleAnalysis?.demandLevel || 'Medium'}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-muted-foreground">{skillGapAnalysis.targetRoleAnalysis?.description}</p>
                    </Card>

                    {/* Skill Comparison */}
                    {skillGapAnalysis.skillComparison && skillGapAnalysis.skillComparison.length > 0 && (
                      <Card className="glass-card p-6 md:p-8">
                        <h3 className="text-xl font-bold text-primary mb-6">Skill Comparison</h3>
                        <div className="space-y-4">
                          {skillGapAnalysis.skillComparison.map((skill, index) => (
                            <div key={index} className="border border-border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-foreground">{skill.skill}</span>
                                  <Badge variant="outline" className="text-xs">{skill.category}</Badge>
                                </div>
                                <Badge className={getPriorityColor(skill.priority)}>{skill.priority}</Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Current Level</p>
                                  <Progress value={skill.currentLevel} className="h-2" />
                                  <span className="text-xs text-muted-foreground">{skill.currentLevel}%</span>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Required Level</p>
                                  <Progress value={skill.requiredLevel} className="h-2" />
                                  <span className="text-xs text-muted-foreground">{skill.requiredLevel}%</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}

                    {/* Missing Skills */}
                    {skillGapAnalysis.missingSkills && skillGapAnalysis.missingSkills.length > 0 && (
                      <Card className="glass-card p-6 md:p-8">
                        <h3 className="text-xl font-bold text-primary mb-6">Skills to Learn</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          {skillGapAnalysis.missingSkills.map((skill, index) => (
                            <div key={index} className="border border-border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-foreground">{skill.skill}</span>
                                <Badge className={getPriorityColor(skill.importance)}>{skill.importance}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                Time to learn: {skill.timeToLearn}
                              </p>
                              {skill.learningResources && skill.learningResources.length > 0 && (
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Resources:</p>
                                  <ul className="text-sm text-muted-foreground list-disc list-inside">
                                    {skill.learningResources.slice(0, 2).map((resource, i) => (
                                      <li key={i}>{resource}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}

                    {/* Learning Roadmap */}
                    {skillGapAnalysis.learningRoadmap && (
                      <Card className="glass-card p-6 md:p-8">
                        <h3 className="text-xl font-bold text-primary mb-6">Your Learning Roadmap</h3>
                        <div className="space-y-4">
                          {['phase1', 'phase2', 'phase3'].map((phaseKey, index) => {
                            const phase = skillGapAnalysis.learningRoadmap[phaseKey as keyof typeof skillGapAnalysis.learningRoadmap];
                            if (!phase) return null;
                            return (
                              <div key={phaseKey} className="border-l-4 border-secondary pl-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground text-sm flex items-center justify-center font-medium">
                                    {index + 1}
                                  </span>
                                  <h4 className="font-semibold text-foreground">{phase.title}</h4>
                                  <Badge variant="outline">{phase.duration}</Badge>
                                </div>
                                <div className="ml-8">
                                  <p className="text-sm text-muted-foreground mb-2">
                                    Focus: {phase.focus?.join(', ')}
                                  </p>
                                  {phase.milestones && phase.milestones.length > 0 && (
                                    <ul className="text-sm text-muted-foreground list-disc list-inside">
                                      {phase.milestones.map((milestone, i) => (
                                        <li key={i}>{milestone}</li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </Card>
                    )}
                  </motion.div>
                )}

                {/* Section Analysis */}
                <Card className="glass-card p-6 md:p-8">
                  <h3 className="text-xl font-bold text-primary mb-6">Section-by-Section Analysis</h3>
                  <div className="space-y-6">
                    {analysis.sections?.map((section, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border border-border rounded-xl p-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {section.atsFriendly ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                            <h4 className="font-semibold text-foreground">{section.name}</h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Score:</span>
                            <span className={`font-bold ${getScoreColor(section.score * 10)}`}>
                              {section.score}/10
                            </span>
                          </div>
                        </div>
                        <Progress value={section.score * 10} className={`h-2 mb-3 ${getScoreBg(section.score * 10)}`} />
                        
                        {section.content && (
                          <p className="text-sm text-muted-foreground mb-3">{section.content}</p>
                        )}

                        {section.issues?.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-red-600 mb-1">Issues:</p>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                              {section.issues.map((issue, i) => (
                                <li key={i}>{issue}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {section.recommendations?.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-green-600 mb-1 flex items-center gap-1">
                              <Lightbulb className="w-4 h-4" /> Recommendations:
                            </p>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                              {section.recommendations.map((rec, i) => (
                                <li key={i}>{rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </Card>

                {/* Keywords Analysis */}
                {analysis.keywords && (
                  <Card className="glass-card p-6 md:p-8">
                    <h3 className="text-xl font-bold text-primary mb-6">Keyword Analysis</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="font-medium text-green-600 mb-3">Found Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                          {analysis.keywords.found?.map((keyword, i) => (
                            <Badge key={i} variant="outline" className="bg-green-50 border-green-200 text-green-700">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-red-600 mb-3">Missing Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                          {analysis.keywords.missing?.map((keyword, i) => (
                            <Badge key={i} variant="outline" className="bg-red-50 border-red-200 text-red-700">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-secondary mb-3">Industry Relevant</h4>
                        <div className="flex flex-wrap gap-2">
                          {analysis.keywords.industryRelevant?.map((keyword, i) => (
                            <Badge key={i} variant="outline" className="bg-sky-50 border-sky-200 text-secondary">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Formatting Analysis */}
                {analysis.formatting && (
                  <Card className="glass-card p-6 md:p-8">
                    <h3 className="text-xl font-bold text-primary mb-4">Formatting Analysis</h3>
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-muted-foreground">Formatting Score:</span>
                      <span className={`text-2xl font-bold ${getScoreColor(analysis.formatting.score * 10)}`}>
                        {analysis.formatting.score}/10
                      </span>
                    </div>
                    {analysis.formatting.issues?.length > 0 && (
                      <div className="mb-4">
                        <p className="font-medium text-foreground mb-2">Issues:</p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1">
                          {analysis.formatting.issues.map((issue, i) => (
                            <li key={i}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {analysis.formatting.suggestions?.length > 0 && (
                      <div>
                        <p className="font-medium text-foreground mb-2">Suggestions:</p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1">
                          {analysis.formatting.suggestions.map((suggestion, i) => (
                            <li key={i}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Card>
                )}

                <Button
                  onClick={() => {
                    setAnalysis(null);
                    setResumeText('');
                    setUploadedFileName(null);
                    setShowSkillGap(false);
                    setSkillGapAnalysis(null);
                    setTargetRole('');
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Analyze Another Resume
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ResumeScreening;
