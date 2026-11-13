import { MessageSquare } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="text-gray-300 mb-4">
        {icon || <MessageSquare size={64} />}
      </div>
      <h3 className="text-lg font-medium text-gray-600 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-400 max-w-sm">{description}</p>}
    </div>
  );
}
