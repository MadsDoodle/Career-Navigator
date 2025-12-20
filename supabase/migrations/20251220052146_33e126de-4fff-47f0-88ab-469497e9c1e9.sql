-- Create users_profiles table to store user names
CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create resumes table
CREATE TABLE public.resumes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_profile_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('created', 'uploaded')),
  content JSONB,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create resources table
CREATE TABLE public.resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_profile_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT,
  description TEXT,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create jobs table
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_profile_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL,
  company TEXT NOT NULL,
  description TEXT,
  cover_letter TEXT,
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'applied'
);

-- Create chat_history table
CREATE TABLE public.chat_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_profile_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storage bucket for resume PDFs
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', true);

-- Storage policy for resume uploads
CREATE POLICY "Anyone can upload resumes" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'resumes');
CREATE POLICY "Anyone can view resumes" ON storage.objects FOR SELECT USING (bucket_id = 'resumes');

-- Enable RLS but allow public access for now (no auth)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

-- Public policies (since no auth)
CREATE POLICY "Public access to user_profiles" ON public.user_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to resumes" ON public.resumes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to resources" ON public.resources FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to jobs" ON public.jobs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to chat_history" ON public.chat_history FOR ALL USING (true) WITH CHECK (true);