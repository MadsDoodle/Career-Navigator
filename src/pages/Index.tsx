import { Helmet } from 'react-helmet-async';
import LandingNavbar from '@/components/LandingNavbar';
import HeroSection from '@/components/HeroSection';
import ProblemSection from '@/components/ProblemSection';
import FeaturesSection from '@/components/FeaturesSection';
import CareerJourneySection from '@/components/CareerJourneySection';
import MetricsSection from '@/components/MetricsSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>AI Career Navigator - From Resume to Real Employment</title>
        <meta name="description" content="Your personal AI mentor guiding you from resume creation to job success. Get ATS-optimized resumes, skill gap analysis, and personalized career paths." />
        <meta name="keywords" content="AI resume, career guidance, ATS optimization, job matching, skill gap analysis, career navigator" />
        <link rel="canonical" href="https://aicareernavigator.com" />
        <meta property="og:title" content="AI Career Navigator - From Resume to Real Employment" />
        <meta property="og:description" content="Transform your career with AI-powered resume optimization, skill gap analysis, and intelligent job matching." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <main className="min-h-screen bg-background overflow-x-hidden">
        <LandingNavbar />
        <section id="hero">
          <HeroSection />
        </section>
        <ProblemSection />
        <section id="features">
          <FeaturesSection />
        </section>
        <section id="journey">
          <CareerJourneySection />
        </section>
        <MetricsSection />
        <section id="about">
          <CTASection />
        </section>
        <Footer />
      </main>
    </>
  );
};

export default Index;
