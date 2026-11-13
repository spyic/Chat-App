import { useState, useEffect, useCallback, useRef } from 'react';
import { getSocket } from '../socket/socket';
import type { TypingEvent } from '../types';

export function useTypingIndicator(chatId: string | null) {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !chatId) return;

    const handler = (data: TypingEvent) => {
      if (data.chatId !== chatId) return;
      setTypingUsers((prev) => {
        if (data.isTyping) {
          return prev.includes(data.userId) ? prev : [...prev, data.userId];
        }
        return prev.filter((id) => id !== data.userId);
      });
    };

    socket.on('chat:typing', handler);
    return () => {
      socket.off('chat:typing', handler);
      setTypingUsers([]);
    };
  }, [chatId]);

  const startTyping = useCallback(() => {
    const socket = getSocket();
    if (!socket || !chatId) return;
    socket.emit('typing:start', { chatId });

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      socket.emit('typing:stop', { chatId });
    }, 3000);
  }, [chatId]);

  const stopTyping = useCallback(() => {
    const socket = getSocket();
    if (!socket || !chatId) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    socket.emit('typing:stop', { chatId });
  }, [chatId]);

  return { typingUsers, startTyping, stopTyping };
}
