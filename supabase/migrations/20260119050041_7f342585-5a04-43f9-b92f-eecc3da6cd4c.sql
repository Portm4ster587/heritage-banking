-- Create support_conversations table for chat conversations
CREATE TABLE public.support_conversations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    assigned_admin_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create support_messages table for individual messages
CREATE TABLE public.support_messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES public.support_conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'admin')),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for support_conversations

-- Users can view their own conversations
CREATE POLICY "Users can view own conversations"
ON public.support_conversations FOR SELECT
USING (auth.uid() = user_id);

-- Users can create conversations for themselves
CREATE POLICY "Users can create own conversations"
ON public.support_conversations FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all conversations
CREATE POLICY "Admins can view all conversations"
ON public.support_conversations FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update all conversations
CREATE POLICY "Admins can update all conversations"
ON public.support_conversations FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for support_messages

-- Users can view messages in their own conversations
CREATE POLICY "Users can view own conversation messages"
ON public.support_messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.support_conversations 
        WHERE id = conversation_id AND user_id = auth.uid()
    )
);

-- Users can create messages in their own conversations
CREATE POLICY "Users can create messages in own conversations"
ON public.support_messages FOR INSERT
WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
        SELECT 1 FROM public.support_conversations 
        WHERE id = conversation_id AND user_id = auth.uid()
    )
);

-- Admins can view all messages
CREATE POLICY "Admins can view all messages"
ON public.support_messages FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can create messages in any conversation
CREATE POLICY "Admins can create messages in any conversation"
ON public.support_messages FOR INSERT
WITH CHECK (
    auth.uid() = sender_id AND
    public.has_role(auth.uid(), 'admin')
);

-- Admins can update message read status
CREATE POLICY "Admins can update messages"
ON public.support_messages FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Users can update read status on their own conversation messages
CREATE POLICY "Users can update own message read status"
ON public.support_messages FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.support_conversations 
        WHERE id = conversation_id AND user_id = auth.uid()
    )
);

-- Create updated_at trigger
CREATE TRIGGER update_support_conversations_updated_at
BEFORE UPDATE ON public.support_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_support_conversations_user_id ON public.support_conversations(user_id);
CREATE INDEX idx_support_conversations_status ON public.support_conversations(status);
CREATE INDEX idx_support_messages_conversation_id ON public.support_messages(conversation_id);
CREATE INDEX idx_support_messages_created_at ON public.support_messages(created_at);