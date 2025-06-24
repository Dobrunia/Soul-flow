'use client';

import { useState } from 'react';
import { MessageInput as DobrunniaMessageInput } from 'dobruniaui';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
}

export default function MessageInput({ onSendMessage }: MessageInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleFilesChange = () => {
    // TODO: Реализовать загрузку файлов
  };

  return (
    <div className='p-4 bg-[var(--c-bg-subtle)] border-t border-[var(--c-border)]'>
      <DobrunniaMessageInput
        placeholder='Введите сообщение...'
        value={message}
        onChange={setMessage}
        onSend={handleSend}
        onEmojiSelect={() => {}}
        onAudioRecord={() => {}}
        files={[]}
        onFilesChange={handleFilesChange}
      />
    </div>
  );
}
