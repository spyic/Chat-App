import { useEffect } from 'react';
import type { Chat, User } from '../../types';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { EmptyState } from '../common/EmptyState';
import { useMessages } from '../../hooks/useMessages';
import { useTypingIndicator } from '../../hooks/useTypingIndicator';
import { useReadReceipts } from '../../hooks/useReadReceipts';
import { useAuthContext } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import toast from 'react-hot-toast';

interface ChatWindowProps {
  chat: Chat | null;
  onlineUserIds: string[];
}

export function ChatWindow({ chat, onlineUserIds }: ChatWindowProps) {
  const { user } = useAuthContext();
  const { joinChat, leaveChat } = useSocket();
  const { messages, isLoading, hasMore, loadMore, sendMessage } = useMessages(chat?.id || null);
  const { typingUsers, startTyping, stopTyping } = useTypingIndicator(chat?.id || null);
  const { markAsRead } = useReadReceipts(chat?.id || null, user?.id || null);

  const participant = chat?.participants.find((p) => p.id !== user?.id) || null;
  const isOnline = participant ? onlineUserIds.includes(participant.id) : false;

  // Join/leave chat rooms
  useEffect(() => {
    if (chat?.id) {
      joinChat(chat.id);
      return () => { leaveChat(chat.id); };
    }
  }, [chat?.id, joinChat, leaveChat]);

  // Mark messages as read
  useEffect(() => {
    if (!chat?.id || !messages.length || !user) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.senderId !== user.id) {
      markAsRead(lastMsg.id);
    }
  }, [messages, chat?.id, user, markAsRead]);

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <EmptyState
          title="Select a conversation"
          description="Choose a chat from the sidebar or search for users to start a new conversation"
        />
      </div>
    );
  }

  const handleSend = async (text: string) => {
    try {
      stopTyping();
      await sendMessage(text);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      <ChatHeader participant={participant} isOnline={isOnline} />
      <MessageList
        messages={messages}
        currentUserId={user?.id || ''}
        isLoading={isLoading}
        hasMore={hasMore}
        onLoadMore={loadMore}
        typingUsers={typingUsers}
        participantName={participant?.name}
      />
      <MessageInput onSend={handleSend} onTyping={startTyping} />
    </div>
  );
}
