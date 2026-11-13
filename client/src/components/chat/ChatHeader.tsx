import { Avatar } from '../common/Avatar';
import type { User } from '../../types';

interface ChatHeaderProps {
  participant: User | null;
  isOnline?: boolean;
}

export function ChatHeader({ participant, isOnline }: ChatHeaderProps) {
  if (!participant) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b bg-white">
      <Avatar name={participant.name} avatarUrl={participant.avatarUrl} isOnline={isOnline} />
      <div>
        <h3 className="font-semibold text-gray-900">{participant.name}</h3>
        <p className="text-xs text-gray-500">
          {isOnline ? 'Online' : 'Offline'}
        </p>
      </div>
    </div>
  );
}
