import type { Chat } from '../../types';
import { ChatListItem } from './ChatListItem';
import { EmptyState } from '../common/EmptyState';
import { Loader } from '../common/Loader';

interface ChatListProps {
  chats: Chat[];
  currentUserId: string;
  activeChatId: string | null;
  onlineUserIds: string[];
  isLoading: boolean;
  onSelectChat: (chat: Chat) => void;
}

export function ChatList({ chats, currentUserId, activeChatId, onlineUserIds, isLoading, onSelectChat }: ChatListProps) {
  if (isLoading) return <Loader className="py-8" />;

  if (chats.length === 0) {
    return (
      <EmptyState
        title="No conversations yet"
        description="Search for users to start chatting"
      />
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {chats.map((chat) => (
        <ChatListItem
          key={chat.id}
          chat={chat}
          currentUserId={currentUserId}
          isActive={chat.id === activeChatId}
          onlineUserIds={onlineUserIds}
          onClick={() => onSelectChat(chat)}
        />
      ))}
    </div>
  );
}
