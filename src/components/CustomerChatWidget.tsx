import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, X, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const CustomerChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  const handleSendMessage = () => {
    if (!message.trim()) return;

    toast({
      title: "Message Sent",
      description: "Our team will respond to your message shortly."
    });
    setMessage('');
  };

  return (
    <>
      {/* Chat Widget Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-heritage-blue hover:bg-heritage-blue-dark z-50"
          size="icon"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 shadow-2xl z-50 animate-fade-in">
          <CardHeader className="bg-heritage-blue text-white relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-2 text-white hover:bg-white/20 z-10"
            >
              <X className="h-5 w-5" />
            </Button>
            <CardTitle className="text-lg flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <span>Chat with Heritage Bank</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="h-64 overflow-y-auto bg-muted/30 rounded-lg p-3">
                <div className="text-center text-sm text-muted-foreground py-8">
                  Welcome! How can we help you today?
                </div>
              </div>
              <div className="space-y-2">
                <Textarea
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <Button
                  onClick={handleSendMessage}
                  className="w-full bg-heritage-gold hover:bg-heritage-gold/90 text-heritage-blue"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};
