import type { Message } from '../../types';
import { MessageStatus } from './MessageStatus';
import { formatTime } from '../../utils/formatDate';
import { cn } from '../../utils/cn';

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
}

export function MessageItem({ message, isOwn }: MessageItemProps) {
  if (message.deleted) {
    return (
      <div className={cn('flex mb-2', isOwn ? 'justify-end' : 'justify-start')}>
        <div className="px-4 py-2 rounded-2xl bg-gray-100 text-gray-400 italic text-sm max-w-xs">
          This message was deleted
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex mb-2', isOwn ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'px-4 py-2 rounded-2xl max-w-xs lg:max-w-md break-words',
          isOwn
            ? 'bg-indigo-600 text-white rounded-br-md'
            : 'bg-gray-100 text-gray-900 rounded-bl-md'
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        <div className={cn(
          'flex items-center gap-1 mt-1',
          isOwn ? 'justify-end' : 'justify-start'
        )}>
          <span className={cn('text-xs', isOwn ? 'text-indigo-200' : 'text-gray-400')}>
            {formatTime(message.createdAt)}
          </span>
          {message.edited && (
            <span className={cn('text-xs', isOwn ? 'text-indigo-200' : 'text-gray-400')}>
              (edited)
            </span>
          )}
          {isOwn && <MessageStatus status={message.readBy?.length ? 'read' : message.deliveredTo?.length ? 'delivered' : 'sent'} />}
        </div>
      </div>
    </div>
  );
}
