import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { currentSkills, targetRole } = await req.json();

    console.log('Skill gap analysis request:', { currentSkills, targetRole });

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
            content: `You are a career development expert who analyzes skill gaps between a person's current abilities and their target role. Provide detailed, actionable analysis.

Return your analysis as a JSON object with this structure:
{
  "targetRoleAnalysis": {
    "title": "string",
    "description": "Brief description of the role",
    "averageSalary": "string",
    "demandLevel": "High" | "Medium" | "Low"
  },
  "skillComparison": [
    {
      "skill": "skill name",
      "category": "Technical" | "Soft" | "Domain",
      "currentLevel": number (0-100),
      "requiredLevel": number (0-100),
      "gap": number,
      "priority": "Critical" | "High" | "Medium" | "Low"
    }
  ],
  "missingSkills": [
    {
      "skill": "skill name",
      "importance": "Critical" | "High" | "Medium" | "Low",
      "timeToLearn": "string (e.g., '2-3 months')",
      "learningResources": ["resource 1", "resource 2"]
    }
  ],
  "strengths": ["strength 1", "strength 2"],
  "learningRoadmap": {
    "phase1": {
      "title": "Foundation",
      "duration": "string",
      "focus": ["skill 1", "skill 2"],
      "milestones": ["milestone 1"]
    },
    "phase2": {
      "title": "Intermediate",
      "duration": "string",
      "focus": ["skill 3", "skill 4"],
      "milestones": ["milestone 2"]
    },
    "phase3": {
      "title": "Advanced",
      "duration": "string",
      "focus": ["skill 5"],
      "milestones": ["milestone 3"]
    }
  },
  "overallReadiness": number (0-100),
  "estimatedTimeToReady": "string"
}`
          },
          {
            role: 'user',
            content: `Analyze the skill gap for someone with these current skills: ${currentSkills.join(', ')}
            
Their target role is: ${targetRole}

Provide a comprehensive skill gap analysis with a personalized learning roadmap.`
          }
        ],
        temperature: 0.4,
        max_tokens: 2000,
      }),
    });

    const data = await response.json();

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
    } catch (e) {
      console.error('Failed to parse analysis JSON:', e);
      analysis = { raw: analysisText };
    }

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in skill-gap-analysis function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
