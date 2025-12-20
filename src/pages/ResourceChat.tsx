import { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Loader2, Bot, User, BookOpen, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import DashboardNavbar from '@/components/DashboardNavbar';
import { useUser } from '@/contexts/UserContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const suggestedTopics = [
  'React best practices',
  'Python for data science',
  'AWS certifications',
  'System design interview prep',
  'Machine learning fundamentals',
  'DevOps roadmap',
];

const ResourceChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input;
    if (!text.trim()) return;

    const userMessage: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('resource-chat', {
        body: {
          message: text,
          skills,
          conversationHistory: messages,
        },
      });

      if (error) throw error;

      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: 'Failed to get response',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const { userProfile } = useUser();

  return (
    <>
      <Helmet>
        <title>Learning Resources Chat - AI Career Navigator</title>
        <meta name="description" content="Get personalized learning resource recommendations based on your skills and career goals." />
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
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">Learning Resources Chat</h1>
            <p className="text-muted-foreground mb-8">Get personalized learning recommendations powered by AI</p>

            <div className="grid lg:grid-cols-4 gap-6">
              {/* Skills Sidebar */}
              <Card className="glass-card p-4 lg:col-span-1 h-fit">
                <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-secondary" />
                  Your Skills
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Add your skills for better recommendations
                </p>
                <div className="flex gap-2 mb-3">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="Add skill..."
                    className="text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  />
                  <Button size="sm" onClick={addSkill} variant="secondary">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="cursor-pointer hover:bg-destructive/10"
                      onClick={() => removeSkill(skill)}
                    >
                      {skill} ×
                    </Badge>
                  ))}
                </div>

                {messages.length === 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-foreground mb-2">Suggested Topics</h4>
                    <div className="space-y-2">
                      {suggestedTopics.map((topic) => (
                        <Button
                          key={topic}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-left text-sm"
                          onClick={() => sendMessage(`I want to learn about ${topic}. What resources do you recommend?`)}
                        >
                          <BookOpen className="w-3 h-3 mr-2" />
                          {topic}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              {/* Chat Area */}
              <Card className="glass-card p-4 lg:col-span-3 flex flex-col h-[600px]">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                      <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                        <Bot className="w-8 h-8 text-secondary" />
                      </div>
                      <h3 className="text-lg font-semibold text-primary mb-2">
                        Learning Resources Assistant
                      </h3>
                      <p className="text-muted-foreground max-w-sm">
                        Ask me about any topic you want to learn. I'll recommend courses, tutorials, books, and other resources tailored to your needs.
                      </p>
                    </div>
                  ) : (
                    messages.map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.role === 'user' ? 'bg-primary' : 'bg-secondary'
                        }`}>
                          {message.role === 'user' ? (
                            <User className="w-4 h-4 text-primary-foreground" />
                          ) : (
                            <Bot className="w-4 h-4 text-primary-foreground" />
                          )}
                        </div>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </motion.div>
                    ))
                  )}
                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                        <Bot className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <div className="bg-muted rounded-2xl px-4 py-3">
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about learning resources..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => sendMessage()}
                    disabled={isLoading || !input.trim()}
                    className="btn-primary"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ResourceChat;
