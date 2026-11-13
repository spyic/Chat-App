import type { Chat, User } from '../../types';
import { Avatar } from '../common/Avatar';
import { formatRelativeTime } from '../../utils/formatDate';
import { cn } from '../../utils/cn';

interface ChatListItemProps {
  chat: Chat;
  currentUserId: string;
  isActive: boolean;
  onlineUserIds: string[];
  onClick: () => void;
}

export function ChatListItem({ chat, currentUserId, isActive, onlineUserIds, onClick }: ChatListItemProps) {
  const participant = chat.participants.find((p) => p.id !== currentUserId) || chat.participants[0];
  const isOnline = participant ? onlineUserIds.includes(participant.id) : false;

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left',
        isActive && 'bg-indigo-50 hover:bg-indigo-50'
      )}
    >
      <Avatar
        name={participant?.name || 'User'}
        avatarUrl={participant?.avatarUrl}
        isOnline={isOnline}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900 truncate text-sm">
            {participant?.name || 'Unknown'}
          </h4>
          {chat.lastMessageAt && (
            <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
              {formatRelativeTime(chat.lastMessageAt)}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 truncate mt-0.5">
          {chat.lastMessageText || 'No messages yet'}
        </p>
      </div>
      {chat.unreadCount > 0 && (
        <span className="flex-shrink-0 bg-indigo-600 text-white text-xs font-medium px-2 py-0.5 rounded-full">
          {chat.unreadCount}
        </span>
      )}
    </button>
  );
}
