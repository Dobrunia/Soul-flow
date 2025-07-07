'use client';

import { ChatList, type ChatListItem } from 'dobruniaui';
import { useParams, useRouter } from 'next/navigation';

interface ChatListComponentProps {
  items: ChatListItem[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}

export default function ChatListComponent({
  items,
  loading,
  error,
  onRetry,
}: ChatListComponentProps) {
  const router = useRouter();
  const { chatId: selectedChatId } = useParams() as { chatId?: string };

  if (error) {
    return (
      <div className='p-4 text-center text-[var(--c-warning)]'>
        <p>{error}</p>
        {onRetry && (
          <button onClick={onRetry} className='mt-2 text-[var(--c-accent)] hover:underline'>
            Повторить попытку
          </button>
        )}
      </div>
    );
  }

  return (
    <ChatList
      items={items}
      selectedId={selectedChatId}
      onSelect={(id) => router.push(`/chats/${id}`)}
      loading={loading}
      skeletonCount={4}
      className='h-full mt-[1px] border-r border-[var(--c-border)]'
    />
  );
}
