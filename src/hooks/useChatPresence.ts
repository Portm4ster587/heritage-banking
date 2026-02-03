import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PresenceState {
  onlineUsers: string[];
  typingUsers: Record<string, boolean>;
}

export const useChatPresence = (conversationId: string | null) => {
  const { user, isAdmin } = useAuth();
  const [presenceState, setPresenceState] = useState<PresenceState>({
    onlineUsers: [],
    typingUsers: {}
  });
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeoutState] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!conversationId || !user) return;

    const channelName = `chat-presence:${conversationId}`;
    
    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: user.id
        }
      }
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.keys(state);
        setPresenceState(prev => ({
          ...prev,
          onlineUsers: users
        }));
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        setPresenceState(prev => ({
          ...prev,
          onlineUsers: [...new Set([...prev.onlineUsers, key])]
        }));
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        setPresenceState(prev => ({
          ...prev,
          onlineUsers: prev.onlineUsers.filter(u => u !== key),
          typingUsers: { ...prev.typingUsers, [key]: false }
        }));
      })
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.userId !== user.id) {
          setPresenceState(prev => ({
            ...prev,
            typingUsers: { ...prev.typingUsers, [payload.userId]: payload.isTyping }
          }));
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            online_at: new Date().toISOString(),
            user_id: user.id,
            is_admin: isAdmin
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user, isAdmin]);

  const sendTypingIndicator = useCallback((typing: boolean) => {
    if (!conversationId || !user) return;

    const channelName = `chat-presence:${conversationId}`;
    const channel = supabase.channel(channelName);
    
    channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        userId: user.id,
        isTyping: typing
      }
    });
  }, [conversationId, user]);

  const handleTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      sendTypingIndicator(true);
    }

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set new timeout to stop typing indicator after 2 seconds
    const timeout = setTimeout(() => {
      setIsTyping(false);
      sendTypingIndicator(false);
    }, 2000);

    setTypingTimeoutState(timeout);
  }, [isTyping, typingTimeout, sendTypingIndicator]);

  const stopTyping = useCallback(() => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    setIsTyping(false);
    sendTypingIndicator(false);
  }, [typingTimeout, sendTypingIndicator]);

  const isOtherUserTyping = Object.values(presenceState.typingUsers).some(t => t);
  const isOtherUserOnline = presenceState.onlineUsers.length > 1;

  return {
    onlineUsers: presenceState.onlineUsers,
    typingUsers: presenceState.typingUsers,
    isOtherUserTyping,
    isOtherUserOnline,
    handleTyping,
    stopTyping
  };
};
