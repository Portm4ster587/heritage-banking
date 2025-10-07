import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  response?: string;
  status: 'pending' | 'responded';
}

export const AdminChatSystem = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      // For now, using mock data - would connect to Supabase table
      setMessages([
        {
          id: '1',
          user_id: 'user1',
          message: 'I need help with my account balance.',
          created_at: new Date().toISOString(),
          status: 'pending'
        }
      ]);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (messageId: string, response: string) => {
    toast({
      title: "Response Sent",
      description: "Your response has been sent to the customer."
    });
  };

  return (
    <Card className="banking-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageCircle className="h-6 w-6 text-primary" />
          <span>Customer Messages</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {messages.map((msg) => (
            <div key={msg.id} className="mb-4 p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Badge variant={msg.status === 'pending' ? 'destructive' : 'default'}>
                  {msg.status}
                </Badge>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 mr-1" />
                  {new Date(msg.created_at).toLocaleString()}
                </div>
              </div>
              <p className="text-sm mb-2">{msg.message}</p>
              {msg.status === 'pending' && (
                <div className="mt-3 space-y-2">
                  <Textarea placeholder="Type your response..." />
                  <Button size="sm" onClick={() => handleResponse(msg.id, '')}>
                    <Send className="w-4 h-4 mr-2" />
                    Send Response
                  </Button>
                </div>
              )}
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
