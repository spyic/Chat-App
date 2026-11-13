import type { User } from '../../types';
import { Avatar } from '../common/Avatar';

interface UserListProps {
  users: User[];
  onSelectUser: (user: User) => void;
}

export function UserList({ users, onSelectUser }: UserListProps) {
  return (
    <div className="space-y-1">
      {users.map((user) => (
        <button
          key={user.id}
          onClick={() => onSelectUser(user)}
          className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
        >
          <Avatar name={user.name} avatarUrl={user.avatarUrl} size="sm" />
          <div>
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
