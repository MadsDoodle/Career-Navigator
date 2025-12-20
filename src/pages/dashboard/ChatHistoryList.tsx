import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { MessageSquare, Calendar, Trash2, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/integrations/supabase/client';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import FloatingNav from '@/components/dashboard/FloatingNav';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ChatHistory {
  id: string;
  title: string;
  messages: unknown;
  created_at: string;
  updated_at: string;
}

const ChatHistoryList = () => {
  const { userProfile, isLoading } = useUser();
  const navigate = useNavigate();
  const [chats, setChats] = useState<ChatHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !userProfile) {
      navigate('/');
    }
  }, [userProfile, isLoading, navigate]);

  useEffect(() => {
    if (userProfile) {
      fetchChats();
    }
  }, [userProfile]);

  const fetchChats = async () => {
    if (!userProfile) return;
    
    try {
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_profile_id', userProfile.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setChats(data || []);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteChat = async (id: string) => {
    try {
      const { error } = await supabase.from('chat_history').delete().eq('id', id);
      if (error) throw error;
      setChats((prev) => prev.filter((c) => c.id !== id));
      toast({ title: 'Chat deleted successfully' });
    } catch (error) {
      toast({ title: 'Failed to delete chat', variant: 'destructive' });
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full"
        />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Chat History - Dashboard</title>
      </Helmet>

      <div className="min-h-screen bg-background">
        <DashboardSidebar />
        
        <main className="ml-20 lg:ml-[280px] transition-all duration-300 pb-32">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-primary">Chat History</h1>
                <p className="text-muted-foreground">Your AI career conversations</p>
              </div>
              <Link to="/resources">
                <Button className="btn-primary">New Chat</Button>
              </Link>
            </div>

            {chats.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-12 text-center"
              >
                <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-primary mb-2">No conversations yet</h3>
                <p className="text-muted-foreground mb-6">Start chatting with our AI career advisor</p>
                <Link to="/resources">
                  <Button className="btn-primary">Start Chat</Button>
                </Link>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {chats.map((chat, index) => (
                  <motion.div
                    key={chat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass-card-hover p-5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="w-5 h-5 text-secondary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-primary truncate">{chat.title}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(chat.updated_at).toLocaleDateString()}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {Array.isArray(chat.messages) ? chat.messages.length : 0} messages
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => deleteChat(chat.id)}
                          className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </main>

        <FloatingNav />
      </div>
    </>
  );
};

export default ChatHistoryList;
