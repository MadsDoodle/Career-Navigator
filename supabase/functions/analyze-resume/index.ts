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
    const { resumeText } = await req.json();

    if (!resumeText) {
      return new Response(JSON.stringify({ error: 'Resume text is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Analyzing resume...');

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
  "summary": "Overall summary of the resume analysis"
}`
          },
          {
            role: 'user',
            content: `Please analyze this resume and provide detailed section-by-section feedback:\n\n${resumeText}`
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
    
    // Parse the JSON from the response
    let analysis;
    try {
      // Extract JSON from markdown code blocks if present
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
    console.error('Error in analyze-resume function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
