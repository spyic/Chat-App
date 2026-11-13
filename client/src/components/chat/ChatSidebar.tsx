import { useState, useEffect } from 'react';
import type { Chat, User } from '../../types';
import { ChatList } from './ChatList';
import { UserSearch } from '../users/UserSearch';
import { Avatar } from '../common/Avatar';
import { useAuthContext } from '../../context/AuthContext';
import { MessageSquarePlus, Search, LogOut } from 'lucide-react';
import { getSocket } from '../../socket/socket';

interface ChatSidebarProps {
  chats: Chat[];
  isLoading: boolean;
  activeChatId: string | null;
  onSelectChat: (chat: Chat) => void;
  onStartChat: (user: User) => void;
}

export function ChatSidebar({ chats, isLoading, activeChatId, onSelectChat, onStartChat }: ChatSidebarProps) {
  const { user, logout } = useAuthContext();
  const [showSearch, setShowSearch] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);

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

  const handleSelectUser = (selectedUser: User) => {
    setShowSearch(false);
    onStartChat(selectedUser);
  };

  return (
    <div className="w-80 border-r bg-white flex flex-col h-full relative">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <Avatar name={user?.name || 'User'} avatarUrl={user?.avatarUrl} size="sm" />
          <div>
            <h2 className="text-sm font-semibold text-gray-900">{user?.name}</h2>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSearch(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Search users"
          >
            <Search size={18} className="text-gray-600" />
          </button>
          <button
            onClick={() => setShowSearch(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="New chat"
          >
            <MessageSquarePlus size={18} className="text-gray-600" />
          </button>
          <button
            onClick={logout}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut size={18} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Chat List or Search */}
      {showSearch ? (
        <UserSearch onSelectUser={handleSelectUser} onClose={() => setShowSearch(false)} />
      ) : (
        <ChatList
          chats={chats}
          currentUserId={user?.id || ''}
          activeChatId={activeChatId}
          onlineUserIds={onlineUserIds}
          isLoading={isLoading}
          onSelectChat={onSelectChat}
        />
      )}
    </div>
  );
}
