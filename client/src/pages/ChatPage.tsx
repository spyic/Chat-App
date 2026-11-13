import { useState, useEffect } from 'react';
import type { Chat, User } from '../types';
import { ChatSidebar } from '../components/chat/ChatSidebar';
import { ChatWindow } from '../components/chat/ChatWindow';
import { useChats } from '../hooks/useChats';
import { useSocket } from '../hooks/useSocket';
import { getSocket } from '../socket/socket';
import toast from 'react-hot-toast';

export function ChatPage() {
  const { chats, isLoading, createChat } = useChats();
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);

  useSocket(); // ensures socket connected

  // Track online users
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleOnline = (data: { userId: string }) => {
      setOnlineUserIds((prev) => prev.includes(data.userId) ? prev : [...prev, data.userId]);
    };
    const handleOffline = (data: { userId: string }) => {
      setOnlineUserIds((prev) => prev.filter((id) => id !== data.userId));
    };

    socket.on('user:online', handleOnline);
    socket.on('user:offline', handleOffline);

    return () => {
      socket.off('user:online', handleOnline);
      socket.off('user:offline', handleOffline);
    };
  }, []);

  const handleStartChat = async (selectedUser: User) => {
    try {
      const chat = await createChat(selectedUser.id);
      setActiveChat(chat);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create chat');
    }
  };

  const handleSelectChat = (chat: Chat) => {
    setActiveChat(chat);
  };

  // Update active chat when chat list changes (e.g., new message updates lastMessage)
  useEffect(() => {
    if (activeChat) {
      const updated = chats.find((c) => c.id === activeChat.id);
      if (updated) {
        setActiveChat(updated);
      }
    }
  }, [chats, activeChat?.id]);

  return (
    <div className="h-screen flex bg-gray-50">
      <ChatSidebar
        chats={chats}
        isLoading={isLoading}
        activeChatId={activeChat?.id || null}
        onSelectChat={handleSelectChat}
        onStartChat={handleStartChat}
      />
      <ChatWindow chat={activeChat} onlineUserIds={onlineUserIds} />
    </div>
  );
}
