import { Check, CheckCheck } from 'lucide-react';

interface MessageStatusProps {
  status: 'sent' | 'delivered' | 'read';
}

export function MessageStatus({ status }: MessageStatusProps) {
  if (status === 'read') {
    return <CheckCheck size={16} className="text-blue-500" />;
  }
  if (status === 'delivered') {
    return <CheckCheck size={16} className="text-gray-400" />;
  }
  return <Check size={16} className="text-gray-400" />;
}
