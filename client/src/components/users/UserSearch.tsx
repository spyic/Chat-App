import { useState } from 'react';
import type { User } from '../../types';
import { userService } from '../../services/user.service';
import { Avatar } from '../common/Avatar';
import { Search, X } from 'lucide-react';

interface UserSearchProps {
  onSelectUser: (user: User) => void;
  onClose: () => void;
}

export function UserSearch({ onSelectUser, onClose }: UserSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (q: string) => {
    setQuery(q);
    if (q.trim().length < 1) {
      setResults([]);
      return;
    }
    try {
      setIsSearching(true);
      const users = await userService.search(q);
      setResults(users);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-white z-10 flex flex-col">
      <div className="flex items-center gap-2 p-3 border-b">
        <Search size={18} className="text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search users..."
          autoFocus
          className="flex-1 text-sm outline-none"
        />
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
          <X size={18} className="text-gray-500" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isSearching && (
          <p className="text-center text-sm text-gray-400 py-4">Searching...</p>
        )}
        {!isSearching && results.length === 0 && query.trim() && (
          <p className="text-center text-sm text-gray-400 py-4">No users found</p>
        )}
        {results.map((user) => (
          <button
            key={user.id}
            onClick={() => onSelectUser(user)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
          >
            <Avatar name={user.name} avatarUrl={user.avatarUrl} size="sm" />
            <div>
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
