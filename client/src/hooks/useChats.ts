import { useState, useEffect, useCallback } from 'react';
import type { Chat } from '../types';
import { chatService } from '../services/chat.service';
import { getSocket } from '../socket/socket';

export function useChats() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChats = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await chatService.getMyChats();
      setChats(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load chats');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Listen for new messages to update chat list
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (data: { chatId: string; message: any }) => {
      setChats((prev) => {
        const updated = prev.map((chat) => {
          if (chat.id === data.chatId) {
            return {
              ...chat,
              lastMessageText: data.message.text,
              lastMessageSenderId: data.message.senderId,
              lastMessageAt: data.message.createdAt,
            };
          }
          return chat;
        });
        // Sort by latest message
        return updated.sort((a, b) => {
          const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
          const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
          return bTime - aTime;
        });
      });
    };

    // When a new chat is created (by us or by another user), add it to sidebar
    const handleChatCreated = (data: { chat: any }) => {
      setChats((prev) => {
        if (prev.find((c) => c.id === data.chat.id)) return prev;
        return [data.chat, ...prev];
      });
    };

    socket.on('chat:new_message', handleNewMessage);
    socket.on('chat:created', handleChatCreated);
    return () => {
      socket.off('chat:new_message', handleNewMessage);
      socket.off('chat:created', handleChatCreated);
    };
  }, []);

  const createChat = useCallback(async (participantId: string): Promise<Chat> => {
    const chat = await chatService.createOrGet(participantId);
    setChats((prev) => {
      if (prev.find((c) => c.id === chat.id)) return prev;
      return [chat, ...prev];
    });
    return chat;
  }, []);

  return { chats, isLoading, error, fetchChats, createChat };
}
