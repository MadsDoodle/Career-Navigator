import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ArrowLeft, Wand2, Download, Edit3, Loader2, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
  };
  summary: string;
  experience: Array<{
    id: string;
    company: string;
    title: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    field: string;
    graduationDate: string;
    gpa: string;
  }>;
  skills: string;
  projects: Array<{
    id: string;
    name: string;
    technologies: string;
    description: string;
  }>;
  certifications: string;
}

const emptyResume: ResumeData = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
  },
  summary: '',
  experience: [],
  education: [],
  skills: '',
  projects: [],
  certifications: '',
};

const ResumeBuilder = () => {
  const [resumeData, setResumeData] = useState<ResumeData>(emptyResume);
  const [activeTab, setActiveTab] = useState('personal');
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [aiPrompt, setAiPrompt] = useState('');
  const { toast } = useToast();

  const generateSection = async (section: string, userInput: string, existingContent?: string) => {
    if (!userInput.trim()) {
      toast({
        title: 'Input required',
        description: 'Please provide some information for AI to generate content.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(section);
    try {
      const { data, error } = await supabase.functions.invoke('generate-resume-section', {
        body: { section, userInput, existingContent },
      });

      if (error) throw error;

      if (data.content) {
        if (section === 'summary') {
          setResumeData(prev => ({ ...prev, summary: data.content }));
        } else if (section === 'skills') {
          setResumeData(prev => ({ ...prev, skills: data.content }));
        } else if (section === 'certifications') {
          setResumeData(prev => ({ ...prev, certifications: data.content }));
        }
        
        toast({
          title: 'Content generated!',
          description: 'AI has generated content for your resume section.',
        });
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: 'Generation failed',
        description: 'Failed to generate content. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(null);
      setAiPrompt('');
    }
  };

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        id: Date.now().toString(),
        company: '',
        title: '',
        location: '',
        startDate: '',
        endDate: '',
        description: '',
      }],
    }));
  };

  const removeExperience = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id),
    }));
  };

  const updateExperience = (id: string, field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    }));
  };

  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, {
        id: Date.now().toString(),
        institution: '',
        degree: '',
        field: '',
        graduationDate: '',
        gpa: '',
      }],
    }));
  };

  const removeEducation = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id),
    }));
  };

  const updateEducation = (id: string, field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    }));
  };

  const addProject = () => {
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, {
        id: Date.now().toString(),
        name: '',
        technologies: '',
        description: '',
      }],
    }));
  };

  const removeProject = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.filter(proj => proj.id !== id),
    }));
  };

  const updateProject = (id: string, field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map(proj =>
        proj.id === id ? { ...proj, [field]: value } : proj
      ),
    }));
  };

  const downloadResume = () => {
    // Create a printable version
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${resumeData.personalInfo.fullName || 'Resume'}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Times New Roman', Times, serif;
              font-size: 11pt;
              line-height: 1.4;
              padding: 0.5in;
              max-width: 8.5in;
              margin: 0 auto;
            }
            h1 { font-size: 18pt; margin-bottom: 4pt; }
            h2 { font-size: 12pt; border-bottom: 1px solid #000; margin: 12pt 0 6pt; padding-bottom: 2pt; }
            h3 { font-size: 11pt; margin-bottom: 2pt; }
            .contact { font-size: 10pt; margin-bottom: 8pt; }
            .section { margin-bottom: 12pt; }
            .entry { margin-bottom: 8pt; }
            .entry-header { display: flex; justify-content: space-between; }
            .entry-title { font-weight: bold; }
            .entry-subtitle { font-style: italic; }
            ul { margin-left: 20pt; margin-top: 4pt; }
            li { margin-bottom: 2pt; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <h1>${resumeData.personalInfo.fullName || 'Your Name'}</h1>
          <div class="contact">
            ${[
              resumeData.personalInfo.email,
              resumeData.personalInfo.phone,
              resumeData.personalInfo.location,
              resumeData.personalInfo.linkedin
            ].filter(Boolean).join(' | ')}
          </div>

          ${resumeData.summary ? `
            <div class="section">
              <h2>Professional Summary</h2>
              <p>${resumeData.summary}</p>
            </div>
          ` : ''}

          ${resumeData.experience.length > 0 ? `
            <div class="section">
              <h2>Professional Experience</h2>
              ${resumeData.experience.map(exp => `
                <div class="entry">
                  <div class="entry-header">
                    <span class="entry-title">${exp.title}${exp.company ? ` - ${exp.company}` : ''}</span>
                    <span>${exp.startDate}${exp.endDate ? ` - ${exp.endDate}` : ''}</span>
                  </div>
                  ${exp.location ? `<div class="entry-subtitle">${exp.location}</div>` : ''}
                  ${exp.description ? `<p style="margin-top: 4pt;">${exp.description.replace(/\n/g, '<br>')}</p>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${resumeData.education.length > 0 ? `
            <div class="section">
              <h2>Education</h2>
              ${resumeData.education.map(edu => `
                <div class="entry">
                  <div class="entry-header">
                    <span class="entry-title">${edu.degree}${edu.field ? ` in ${edu.field}` : ''}</span>
                    <span>${edu.graduationDate}</span>
                  </div>
                  <div class="entry-subtitle">${edu.institution}</div>
                  ${edu.gpa ? `<div>GPA: ${edu.gpa}</div>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${resumeData.skills ? `
            <div class="section">
              <h2>Skills</h2>
              <p>${resumeData.skills.replace(/\n/g, '<br>')}</p>
            </div>
          ` : ''}

          ${resumeData.projects.length > 0 ? `
            <div class="section">
              <h2>Projects</h2>
              ${resumeData.projects.map(proj => `
                <div class="entry">
                  <h3>${proj.name}${proj.technologies ? ` (${proj.technologies})` : ''}</h3>
                  ${proj.description ? `<p>${proj.description}</p>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${resumeData.certifications ? `
            <div class="section">
              <h2>Certifications</h2>
              <p>${resumeData.certifications.replace(/\n/g, '<br>')}</p>
            </div>
          ` : ''}
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <>
      <Helmet>
        <title>AI Resume Builder - AI Career Navigator</title>
        <meta name="description" content="Build an ATS-optimized resume with AI assistance. Step-by-step builder with live preview." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container-custom py-8">
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-secondary transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="md:hidden"
              >
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button onClick={downloadResume} className="btn-primary">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">AI Resume Builder</h1>
            <p className="text-muted-foreground mb-8">Build an ATS-optimized resume with AI assistance</p>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Editor Panel */}
              <Card className="glass-card p-6 overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-6">
                    <TabsTrigger value="personal">Personal</TabsTrigger>
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="experience">Experience</TabsTrigger>
                    <TabsTrigger value="education">Education</TabsTrigger>
                    <TabsTrigger value="skills">Skills</TabsTrigger>
                    <TabsTrigger value="projects">Projects</TabsTrigger>
                  </TabsList>

                  <TabsContent value="personal" className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Full Name</Label>
                        <Input
                          value={resumeData.personalInfo.fullName}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, fullName: e.target.value }
                          }))}
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={resumeData.personalInfo.email}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, email: e.target.value }
                          }))}
                          placeholder="john@example.com"
                        />
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <Input
                          value={resumeData.personalInfo.phone}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, phone: e.target.value }
                          }))}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      <div>
                        <Label>Location</Label>
                        <Input
                          value={resumeData.personalInfo.location}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, location: e.target.value }
                          }))}
                          placeholder="New York, NY"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>LinkedIn URL</Label>
                        <Input
                          value={resumeData.personalInfo.linkedin}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, linkedin: e.target.value }
                          }))}
                          placeholder="linkedin.com/in/johndoe"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="summary" className="space-y-4">
                    <div>
                      <Label>Professional Summary</Label>
                      <Textarea
                        value={resumeData.summary}
                        onChange={(e) => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
                        placeholder="A brief professional summary highlighting your key strengths..."
                        className="min-h-[150px]"
                      />
                    </div>
                    <div className="border-t border-border pt-4">
                      <Label className="flex items-center gap-2 mb-2">
                        <Wand2 className="w-4 h-4 text-secondary" />
                        AI Generate Summary
                      </Label>
                      <Textarea
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="Describe your experience, skills, and career goals..."
                        className="min-h-[80px] mb-2"
                      />
                      <Button
                        onClick={() => generateSection('summary', aiPrompt, resumeData.summary)}
                        disabled={isGenerating === 'summary'}
                        size="sm"
                      >
                        {isGenerating === 'summary' ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Wand2 className="w-4 h-4 mr-2" />
                        )}
                        Generate with AI
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="experience" className="space-y-4">
                    {resumeData.experience.map((exp, index) => (
                      <div key={exp.id} className="border border-border rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Experience {index + 1}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeExperience(exp.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                        <div className="grid md:grid-cols-2 gap-3">
                          <Input
                            value={exp.company}
                            onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                            placeholder="Company Name"
                          />
                          <Input
                            value={exp.title}
                            onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                            placeholder="Job Title"
                          />
                          <Input
                            value={exp.location}
                            onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                            placeholder="Location"
                          />
                          <div className="flex gap-2">
                            <Input
                              value={exp.startDate}
                              onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                              placeholder="Start Date"
                            />
                            <Input
                              value={exp.endDate}
                              onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                              placeholder="End Date"
                            />
                          </div>
                        </div>
                        <Textarea
                          value={exp.description}
                          onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                          placeholder="Describe your responsibilities and achievements..."
                          className="min-h-[100px]"
                        />
                      </div>
                    ))}
                    <Button onClick={addExperience} variant="outline" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Experience
                    </Button>
                  </TabsContent>

                  <TabsContent value="education" className="space-y-4">
                    {resumeData.education.map((edu, index) => (
                      <div key={edu.id} className="border border-border rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Education {index + 1}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEducation(edu.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                        <div className="grid md:grid-cols-2 gap-3">
                          <Input
                            value={edu.institution}
                            onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                            placeholder="Institution Name"
                          />
                          <Input
                            value={edu.degree}
                            onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                            placeholder="Degree (e.g., Bachelor's)"
                          />
                          <Input
                            value={edu.field}
                            onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                            placeholder="Field of Study"
                          />
                          <Input
                            value={edu.graduationDate}
                            onChange={(e) => updateEducation(edu.id, 'graduationDate', e.target.value)}
                            placeholder="Graduation Date"
                          />
                          <Input
                            value={edu.gpa}
                            onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                            placeholder="GPA (optional)"
                          />
                        </div>
                      </div>
                    ))}
                    <Button onClick={addEducation} variant="outline" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Education
                    </Button>
                  </TabsContent>

                  <TabsContent value="skills" className="space-y-4">
                    <div>
                      <Label>Skills</Label>
                      <Textarea
                        value={resumeData.skills}
                        onChange={(e) => setResumeData(prev => ({ ...prev, skills: e.target.value }))}
                        placeholder="List your skills, separated by categories..."
                        className="min-h-[150px]"
                      />
                    </div>
                    <div className="border-t border-border pt-4">
                      <Label className="flex items-center gap-2 mb-2">
                        <Wand2 className="w-4 h-4 text-secondary" />
                        AI Generate Skills
                      </Label>
                      <Textarea
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="Describe your technical and soft skills..."
                        className="min-h-[80px] mb-2"
                      />
                      <Button
                        onClick={() => generateSection('skills', aiPrompt, resumeData.skills)}
                        disabled={isGenerating === 'skills'}
                        size="sm"
                      >
                        {isGenerating === 'skills' ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Wand2 className="w-4 h-4 mr-2" />
                        )}
                        Generate with AI
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="projects" className="space-y-4">
                    {resumeData.projects.map((proj, index) => (
                      <div key={proj.id} className="border border-border rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Project {index + 1}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeProject(proj.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                        <div className="grid md:grid-cols-2 gap-3">
                          <Input
                            value={proj.name}
                            onChange={(e) => updateProject(proj.id, 'name', e.target.value)}
                            placeholder="Project Name"
                          />
                          <Input
                            value={proj.technologies}
                            onChange={(e) => updateProject(proj.id, 'technologies', e.target.value)}
                            placeholder="Technologies Used"
                          />
                        </div>
                        <Textarea
                          value={proj.description}
                          onChange={(e) => updateProject(proj.id, 'description', e.target.value)}
                          placeholder="Describe the project and your contributions..."
                          className="min-h-[80px]"
                        />
                      </div>
                    ))}
                    <Button onClick={addProject} variant="outline" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Project
                    </Button>
                  </TabsContent>
                </Tabs>
              </Card>

              {/* Preview Panel */}
              <div className={`${showPreview ? 'block' : 'hidden'} lg:block`}>
                <Card className="glass-card p-6 sticky top-8">
                  <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Live Preview
                  </h3>
                  <div 
                    className="bg-white border border-border rounded-lg p-6 min-h-[600px] shadow-inner overflow-auto"
                    style={{ fontFamily: "'Times New Roman', Times, serif" }}
                  >
                    {/* Resume Preview */}
                    <div className="text-center mb-4">
                      <h1 className="text-xl font-bold text-gray-900">
                        {resumeData.personalInfo.fullName || 'Your Name'}
                      </h1>
                      <p className="text-sm text-gray-600">
                        {[
                          resumeData.personalInfo.email,
                          resumeData.personalInfo.phone,
                          resumeData.personalInfo.location,
                        ].filter(Boolean).join(' | ')}
                      </p>
                      {resumeData.personalInfo.linkedin && (
                        <p className="text-sm text-blue-600">{resumeData.personalInfo.linkedin}</p>
                      )}
                    </div>

                    {resumeData.summary && (
                      <div className="mb-4">
                        <h2 className="text-sm font-bold border-b border-gray-400 mb-2">PROFESSIONAL SUMMARY</h2>
                        <p className="text-sm text-gray-700">{resumeData.summary}</p>
                      </div>
                    )}

                    {resumeData.experience.length > 0 && (
                      <div className="mb-4">
                        <h2 className="text-sm font-bold border-b border-gray-400 mb-2">PROFESSIONAL EXPERIENCE</h2>
                        {resumeData.experience.map((exp) => (
                          <div key={exp.id} className="mb-3">
                            <div className="flex justify-between">
                              <span className="font-semibold text-sm">{exp.title}</span>
                              <span className="text-sm">{exp.startDate} - {exp.endDate || 'Present'}</span>
                            </div>
                            <p className="text-sm italic">{exp.company}{exp.location ? `, ${exp.location}` : ''}</p>
                            <p className="text-sm text-gray-700 whitespace-pre-line">{exp.description}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {resumeData.education.length > 0 && (
                      <div className="mb-4">
                        <h2 className="text-sm font-bold border-b border-gray-400 mb-2">EDUCATION</h2>
                        {resumeData.education.map((edu) => (
                          <div key={edu.id} className="mb-2">
                            <div className="flex justify-between">
                              <span className="font-semibold text-sm">{edu.degree} in {edu.field}</span>
                              <span className="text-sm">{edu.graduationDate}</span>
                            </div>
                            <p className="text-sm italic">{edu.institution}</p>
                            {edu.gpa && <p className="text-sm">GPA: {edu.gpa}</p>}
                          </div>
                        ))}
                      </div>
                    )}

                    {resumeData.skills && (
                      <div className="mb-4">
                        <h2 className="text-sm font-bold border-b border-gray-400 mb-2">SKILLS</h2>
                        <p className="text-sm text-gray-700 whitespace-pre-line">{resumeData.skills}</p>
                      </div>
                    )}

                    {resumeData.projects.length > 0 && (
                      <div className="mb-4">
                        <h2 className="text-sm font-bold border-b border-gray-400 mb-2">PROJECTS</h2>
                        {resumeData.projects.map((proj) => (
                          <div key={proj.id} className="mb-2">
                            <span className="font-semibold text-sm">{proj.name}</span>
                            {proj.technologies && <span className="text-sm"> ({proj.technologies})</span>}
                            <p className="text-sm text-gray-700">{proj.description}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {resumeData.certifications && (
                      <div className="mb-4">
                        <h2 className="text-sm font-bold border-b border-gray-400 mb-2">CERTIFICATIONS</h2>
                        <p className="text-sm text-gray-700 whitespace-pre-line">{resumeData.certifications}</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ResumeBuilder;
