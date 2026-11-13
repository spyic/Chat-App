import { useEffect, useRef } from 'react';
import type { Message } from '../../types';
import { MessageItem } from './MessageItem';
import { TypingIndicator } from './TypingIndicator';
import { Loader } from '../common/Loader';
import { formatDate, isSameDay } from '../../utils/formatDate';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  typingUsers: string[];
  participantName?: string;
}

export function MessageList({
  messages, currentUserId, isLoading, hasMore, onLoadMore, typingUsers, participantName,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevLengthRef = useRef(messages.length);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > prevLengthRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevLengthRef.current = messages.length;
  }, [messages.length]);

  // Scroll to bottom on initial load
  useEffect(() => {
    if (messages.length > 0 && !isLoading) {
      bottomRef.current?.scrollIntoView();
    }
  }, [messages.length > 0, isLoading]);

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-4">
      {hasMore && (
        <div className="text-center mb-4">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="text-sm text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Load older messages'}
          </button>
        </div>
      )}

      {isLoading && messages.length === 0 && <Loader className="py-8" />}

      {messages.map((msg, index) => {
        const showDate = index === 0 || !isSameDay(messages[index - 1].createdAt, msg.createdAt);
        return (
          <div key={msg.id}>
            {showDate && (
              <div className="flex items-center justify-center my-4">
                <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-500">
                  {formatDate(msg.createdAt)}
                </span>
              </div>
            )}
            <MessageItem message={msg} isOwn={msg.senderId === currentUserId} />
          </div>
        );
      })}

      {typingUsers.length > 0 && <TypingIndicator userName={participantName} />}
      <div ref={bottomRef} />
    </div>
  );
}
