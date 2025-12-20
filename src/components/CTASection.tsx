import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Sparkles, Upload, ArrowRight, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import WaveBackground from './WaveBackground';

const CTASection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="cta" className="section-padding relative overflow-hidden">
      <WaveBackground />
      
      <div className="container-custom relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="glass-card max-w-4xl mx-auto p-8 md:p-12 lg:p-16 text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/30 mb-6"
          >
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-primary">Ready to Transform Your Career?</span>
          </motion.div>

          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4"
          >
            Build Your Career with AI,
            <br />
            <span className="gradient-text">Not Guesswork</span>
          </motion.h2>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8"
          >
            Join thousands of job seekers who have transformed their career prospects with AI-powered 
            resume optimization, skill gap analysis, and intelligent job matching.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/resume-screening"
                className="btn-primary inline-flex items-center justify-center gap-2 text-lg px-8 py-4"
              >
                <Upload className="w-5 h-5" />
                Analyze Your Resume
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/resume-builder"
                className="btn-secondary inline-flex items-center justify-center gap-2 text-lg px-8 py-4"
              >
                <FileText className="w-5 h-5" />
                Build from Scratch
              </Link>
            </motion.div>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-10 pt-8 border-t border-border/50"
          >
            <p className="text-sm text-muted-foreground mb-4">Trusted by job seekers worldwide</p>
            <div className="flex flex-wrap justify-center gap-8">
              {[
                { value: '10,000+', label: 'Resumes Optimized' },
                { value: '95%', label: 'ATS Pass Rate' },
                { value: '4.9/5', label: 'User Rating' },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-primary">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
