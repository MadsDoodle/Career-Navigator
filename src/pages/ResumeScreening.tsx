import { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Upload, FileText, AlertCircle, CheckCircle2, XCircle, Loader2, ArrowLeft, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

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
  summary: string;
}

const ResumeScreening = () => {
  const [resumeText, setResumeText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const { toast } = useToast();

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (event) => {
          setResumeText(event.target?.result as string);
        };
        reader.readAsText(file);
      } else {
        toast({
          title: 'File format not supported',
          description: 'Please paste your resume text directly or upload a .txt file.',
          variant: 'destructive',
        });
      }
    }
  }, [toast]);

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
        toast({
          title: 'Analysis complete!',
          description: 'Your resume has been analyzed. Check the results below.',
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

  return (
    <>
      <Helmet>
        <title>AI Resume Screening - AI Career Navigator</title>
        <meta name="description" content="Get instant AI-powered resume analysis with ATS scoring and improvement suggestions." />
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
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">AI Resume Screening</h1>
            <p className="text-muted-foreground mb-8">Get detailed ATS analysis and improvement suggestions for your resume</p>

            {!analysis ? (
              <Card className="glass-card p-6 md:p-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Paste your resume content
                    </label>
                    <Textarea
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      placeholder="Paste your resume text here... Include all sections like contact info, summary, experience, education, skills, etc."
                      className="min-h-[300px] font-mono text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".txt"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <div className="flex items-center gap-2 text-secondary hover:text-primary transition-colors">
                        <Upload className="w-4 h-4" />
                        <span className="text-sm font-medium">Upload .txt file</span>
                      </div>
                    </label>
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
