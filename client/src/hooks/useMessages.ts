import { useState, useEffect, useCallback, useRef } from 'react';
import type { Message } from '../types';
import { messageService } from '../services/message.service';
import { getSocket } from '../socket/socket';
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export function useMessages(chatId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const messageIds = useRef(new Set<string>());

  // Reset when chat changes
  useEffect(() => {
    setMessages([]);
    setHasMore(false);
    setNextCursor(null);
    messageIds.current.clear();
  }, [chatId]);

  // Fetch initial messages
  const fetchMessages = useCallback(async () => {
    if (!chatId) return;
    try {
      setIsLoading(true);
      const data = await messageService.getMessages(chatId, 50);
      const unique = data.messages.filter((m) => {
        if (messageIds.current.has(m.id)) return false;
        messageIds.current.add(m.id);
        return true;
      });
      setMessages(unique);
      setHasMore(data.hasMore);
      setNextCursor(data.nextCursor);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setIsLoading(false);
    }
  }, [chatId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Load older messages
  const loadMore = useCallback(async () => {
    if (!chatId || !hasMore || !nextCursor || isLoading) return;
    try {
      setIsLoading(true);
      const data = await messageService.getMessages(chatId, 50, nextCursor);
      const unique = data.messages.filter((m) => {
        if (messageIds.current.has(m.id)) return false;
        messageIds.current.add(m.id);
        return true;
      });
      setMessages((prev) => [...unique, ...prev]);
      setHasMore(data.hasMore);
      setNextCursor(data.nextCursor);
    } catch (err) {
      console.error('Failed to load more messages:', err);
    } finally {
      setIsLoading(false);
    }
  }, [chatId, hasMore, nextCursor, isLoading]);

  // Listen for real-time messages
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !chatId) return;

    const handleNewMessage = (data: { chatId: string; message: Message }) => {
      if (data.chatId !== chatId) return;
      if (messageIds.current.has(data.message.id)) return;
      messageIds.current.add(data.message.id);
      setMessages((prev) => [...prev, data.message]);
    };

    socket.on('chat:new_message', handleNewMessage);
    return () => { socket.off('chat:new_message', handleNewMessage); };
  }, [chatId]);

  // Send message
  const sendMessage = useCallback(async (text: string) => {
    if (!chatId) return;
    const idempotencyKey = generateId();
    const message = await messageService.send(chatId, text, idempotencyKey);
    if (!messageIds.current.has(message.id)) {
      messageIds.current.add(message.id);
      setMessages((prev) => [...prev, message]);
    }
    return message;
  }, [chatId]);

  return { messages, isLoading, hasMore, loadMore, sendMessage, fetchMessages };
}
