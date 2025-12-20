import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Heuristic-based section extraction from text
function extractSectionsFromText(text: string): { sectionName: string; content: string }[] {
  const sectionPatterns = [
    { pattern: /(?:^|\n)\s*(SUMMARY|PROFESSIONAL\s*SUMMARY|OBJECTIVE|CAREER\s*OBJECTIVE|PROFILE)\s*[:\-]?\s*\n/gi, name: 'Summary' },
    { pattern: /(?:^|\n)\s*(EXPERIENCE|WORK\s*EXPERIENCE|PROFESSIONAL\s*EXPERIENCE|EMPLOYMENT\s*HISTORY|WORK\s*HISTORY)\s*[:\-]?\s*\n/gi, name: 'Experience' },
    { pattern: /(?:^|\n)\s*(EDUCATION|ACADEMIC\s*BACKGROUND|QUALIFICATIONS|ACADEMIC\s*QUALIFICATIONS)\s*[:\-]?\s*\n/gi, name: 'Education' },
    { pattern: /(?:^|\n)\s*(SKILLS|TECHNICAL\s*SKILLS|CORE\s*SKILLS|KEY\s*SKILLS|COMPETENCIES|CORE\s*COMPETENCIES)\s*[:\-]?\s*\n/gi, name: 'Skills' },
    { pattern: /(?:^|\n)\s*(PROJECTS|KEY\s*PROJECTS|PERSONAL\s*PROJECTS|ACADEMIC\s*PROJECTS)\s*[:\-]?\s*\n/gi, name: 'Projects' },
    { pattern: /(?:^|\n)\s*(CERTIFICATIONS?|LICENSES?|CREDENTIALS?|PROFESSIONAL\s*CERTIFICATIONS?)\s*[:\-]?\s*\n/gi, name: 'Certifications' },
    { pattern: /(?:^|\n)\s*(ACHIEVEMENTS?|ACCOMPLISHMENTS?|AWARDS?|HONORS?)\s*[:\-]?\s*\n/gi, name: 'Achievements' },
    { pattern: /(?:^|\n)\s*(LANGUAGES?|LANGUAGE\s*SKILLS?)\s*[:\-]?\s*\n/gi, name: 'Languages' },
    { pattern: /(?:^|\n)\s*(INTERESTS?|HOBBIES?|ACTIVITIES?|EXTRACURRICULAR)\s*[:\-]?\s*\n/gi, name: 'Interests' },
    { pattern: /(?:^|\n)\s*(REFERENCES?)\s*[:\-]?\s*\n/gi, name: 'References' },
    { pattern: /(?:^|\n)\s*(CONTACT|CONTACT\s*INFORMATION|PERSONAL\s*DETAILS?|PERSONAL\s*INFORMATION)\s*[:\-]?\s*\n/gi, name: 'Contact Information' },
  ];

  const sections: { sectionName: string; content: string; startIndex: number }[] = [];
  
  for (const { pattern, name } of sectionPatterns) {
    let match;
    const regex = new RegExp(pattern.source, pattern.flags);
    while ((match = regex.exec(text)) !== null) {
      sections.push({
        sectionName: name,
        content: '',
        startIndex: match.index + match[0].length
      });
    }
  }

  sections.sort((a, b) => a.startIndex - b.startIndex);

  for (let i = 0; i < sections.length; i++) {
    const startIdx = sections[i].startIndex;
    const endIdx = i < sections.length - 1 ? sections[i + 1].startIndex - 50 : text.length;
    sections[i].content = text.slice(startIdx, endIdx).trim();
  }

  if (sections.length === 0) {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length > 0) {
      const contactLines = lines.slice(0, Math.min(5, lines.length));
      sections.push({
        sectionName: 'Contact Information',
        content: contactLines.join('\n'),
        startIndex: 0
      });
    }
  }

  const skillPatterns = /(?:skills?|technologies?|tools?|proficient in|expertise in|familiar with)[:\s]*([^\n]+)/gi;
  let skillMatch;
  const extractedSkills: string[] = [];
  while ((skillMatch = skillPatterns.exec(text)) !== null) {
    extractedSkills.push(skillMatch[1].trim());
  }
  
  if (extractedSkills.length > 0 && !sections.find(s => s.sectionName === 'Skills')) {
    sections.push({
      sectionName: 'Skills',
      content: extractedSkills.join(', '),
      startIndex: -1
    });
  }

  return sections.map(({ sectionName, content }) => ({ sectionName, content }));
}

// Extract skills from resume text
function extractSkillsFromResume(text: string, sections: { sectionName: string; content: string }[]): string[] {
  const skills: Set<string> = new Set();
  
  const skillsSection = sections.find(s => s.sectionName === 'Skills');
  if (skillsSection) {
    const skillItems = skillsSection.content.split(/[,;•|\n]/);
    skillItems.forEach(skill => {
      const cleaned = skill.trim().replace(/[•\-\*]/g, '').trim();
      if (cleaned && cleaned.length > 1 && cleaned.length < 50) {
        skills.add(cleaned);
      }
    });
  }

  const commonSkills = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'Go', 'Rust', 'PHP', 'Swift', 'Kotlin',
    'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'Laravel',
    'HTML', 'CSS', 'SASS', 'Tailwind', 'Bootstrap',
    'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Firebase', 'DynamoDB',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'Git', 'GitHub', 'GitLab',
    'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'NLP', 'Computer Vision',
    'Agile', 'Scrum', 'JIRA', 'Confluence', 'Project Management', 'Leadership',
    'Communication', 'Problem Solving', 'Teamwork', 'Critical Thinking',
    'Data Analysis', 'Excel', 'Power BI', 'Tableau', 'R', 'MATLAB',
    'REST API', 'GraphQL', 'Microservices', 'DevOps', 'CI/CD',
    'Figma', 'Adobe XD', 'UI/UX', 'Photoshop', 'Illustrator'
  ];

  const lowerText = text.toLowerCase();
  commonSkills.forEach(skill => {
    if (lowerText.includes(skill.toLowerCase())) {
      skills.add(skill);
    }
  });

  return Array.from(skills);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeText } = await req.json();

    if (!resumeText || resumeText.trim().length < 50) {
      return new Response(JSON.stringify({ 
        error: 'Resume text is required. Please paste your resume text to analyze.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Analyzing resume with section extraction...');

    const extractedSections = extractSectionsFromText(resumeText);
    const extractedSkills = extractSkillsFromResume(resumeText, extractedSections);
    
    console.log('Extracted sections:', extractedSections.map(s => s.sectionName));
    console.log('Extracted skills:', extractedSkills);

    const formattedSections = extractedSections.length > 0 
      ? extractedSections.map(s => `## ${s.sectionName}\n${s.content}`).join('\n\n')
      : resumeText;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert ATS (Applicant Tracking System) resume analyst and career coach. Analyze resumes section by section and provide detailed, actionable feedback.

We have already extracted the following sections from the resume using heuristic parsing:
${extractedSections.map(s => `- ${s.sectionName}`).join('\n')}

And these skills were detected:
${extractedSkills.join(', ')}

For each section, provide:
1. A score from 1-10
2. Whether it's ATS-friendly (yes/no)
3. Specific issues found
4. Detailed recommendations for improvement

Return your analysis as a JSON object with this structure:
{
  "overallScore": number (1-100),
  "atsCompatibility": "High" | "Medium" | "Low",
  "sections": [
    {
      "name": "section name",
      "score": number (1-10),
      "atsFriendly": boolean,
      "content": "brief summary of what was found",
      "issues": ["issue 1", "issue 2"],
      "recommendations": ["recommendation 1", "recommendation 2"]
    }
  ],
  "keywords": {
    "found": ["keyword1", "keyword2"],
    "missing": ["suggested keyword 1", "suggested keyword 2"],
    "industryRelevant": ["relevant keyword 1"]
  },
  "formatting": {
    "score": number (1-10),
    "issues": ["formatting issue 1"],
    "suggestions": ["formatting suggestion 1"]
  },
  "extractedSkills": ${JSON.stringify(extractedSkills)},
  "summary": "Overall summary of the resume analysis"
}`
          },
          {
            role: 'user',
            content: `Please analyze this resume and provide detailed section-by-section feedback:\n\n${formattedSections}`
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    const data = await response.json();
    console.log('OpenAI response received');

    if (data.error) {
      console.error('OpenAI API error:', data.error);
      return new Response(JSON.stringify({ error: data.error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const analysisText = data.choices[0].message.content;
    
    let analysis;
    try {
      const jsonMatch = analysisText.match(/```json\n?([\s\S]*?)\n?```/) || 
                        analysisText.match(/```\n?([\s\S]*?)\n?```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : analysisText;
      analysis = JSON.parse(jsonStr.trim());
      
      if (!analysis.extractedSkills) {
        analysis.extractedSkills = extractedSkills;
      }
    } catch (e) {
      console.error('Failed to parse analysis JSON:', e);
      analysis = { raw: analysisText, extractedSkills };
    }

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-resume function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
