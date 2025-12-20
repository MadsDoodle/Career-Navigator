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
    const { resumeData, jobTitle, companyName, jobDescription } = await req.json();

    console.log('Cover letter generation request:', { jobTitle, companyName });

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
            content: `You are an expert cover letter writer who creates compelling, personalized cover letters that help candidates stand out. 

Key principles:
1. Match the tone and style to the company culture
2. Highlight relevant experience and achievements from the resume
3. Show genuine interest in the company and role
4. Include specific examples that demonstrate qualifications
5. Keep it concise (3-4 paragraphs)
6. Use professional but engaging language
7. Address the key requirements from the job description
8. Include a strong opening and call-to-action closing`
          },
          {
            role: 'user',
            content: `Write a professional cover letter for this job application:

Company: ${companyName}
Position: ${jobTitle}

Job Description:
${jobDescription}

Candidate's Resume/Background:
${JSON.stringify(resumeData, null, 2)}

Create a compelling cover letter that connects the candidate's experience to the job requirements.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
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

    const coverLetter = data.choices[0].message.content;

    return new Response(JSON.stringify({ coverLetter }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-cover-letter function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
