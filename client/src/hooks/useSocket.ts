import { useEffect, useCallback } from 'react';
import { getSocket, connectSocket, disconnectSocket } from '../socket/socket';
import { useAuthContext } from '../context/AuthContext';

export function useSocket() {
  const { token } = useAuthContext();

  useEffect(() => {
    if (token) {
      connectSocket(token);
    }
    return () => {
      // Don't disconnect on cleanup — socket is shared
    };
  }, [token]);

  const joinChat = useCallback((chatId: string) => {
    const socket = getSocket();
    if (socket) {
      socket.emit('chat:join', { chatId });
    }
  }, []);

  const leaveChat = useCallback((chatId: string) => {
    const socket = getSocket();
    if (socket) {
      socket.emit('chat:leave', { chatId });
    }
  }, []);

  const onNewMessage = useCallback((handler: (data: any) => void) => {
    const socket = getSocket();
    if (socket) {
      socket.on('chat:new_message', handler);
      return () => { socket.off('chat:new_message', handler); };
    }
    return () => {};
  }, []);

  return { joinChat, leaveChat, onNewMessage, socket: getSocket() };
}
