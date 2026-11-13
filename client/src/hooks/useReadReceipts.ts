import { useEffect, useCallback } from 'react';
import { getSocket } from '../socket/socket';
import { messageService } from '../services/message.service';

export function useReadReceipts(chatId: string | null, userId: string | null) {
  // Listen for read receipt events
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !chatId) return;

    const handler = (data: { chatId: string; messageId: string; userId: string }) => {
      // Read receipt received — component can re-render based on state
    };

    socket.on('chat:message_read', handler);
    return () => { socket.off('chat:message_read', handler); };
  }, [chatId]);

  const markAsRead = useCallback(async (messageId: string) => {
    if (!chatId) return;
    try {
      await messageService.markAsRead(chatId, messageId);
      const socket = getSocket();
      if (socket) {
        socket.emit('message:read', { chatId, messageId });
      }
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  }, [chatId]);

  const markAsDelivered = useCallback(async (messageId: string) => {
    if (!chatId) return;
    try {
      await messageService.markAsDelivered(chatId, messageId);
      const socket = getSocket();
      if (socket) {
        socket.emit('message:delivered', { chatId, messageId });
      }
    } catch (err) {
      console.error('Failed to mark as delivered:', err);
    }
  }, [chatId]);

  return { markAsRead, markAsDelivered };
}
