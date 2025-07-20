'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { MessageInput as DobrunniaMessageInput } from 'dobruniaui';
import { selectProfile } from '@/shared/store/profileSlice';
import { messageService } from '@/shared/lib/supabase/Classes/messageService';

interface MessageInputProps {
  children?: React.ReactNode;
}

export default function MessageInput({ children }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);

  const { chatId } = useParams() as { chatId: string };
  const me = useSelector(selectProfile);

  const handleSend = async () => {
    if (!message.trim() || !me?.id || sending) return;

    setSending(true);
    try {
      await messageService.sendMessage(chatId, me.id, message.trim());
      setMessage('');
      setFiles([]);
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
    } finally {
      setSending(false);
    }
  };

  const handleAudioRecord = (audio: Blob) => {
    // TODO: Реализовать отправку аудио
    console.log('Audio recorded:', audio);
  };

  return (
    <div className='flex-1 flex flex-col'>
      <div className='flex-1 overflow-hidden'>
        <DobrunniaMessageInput
          value={message}
          onChange={setMessage}
          files={files}
          onFilesChange={setFiles}
          onSend={handleSend}
          onAudioRecord={handleAudioRecord}
          maxHeight={400}
          disabled={sending}
        >
          {children}
        </DobrunniaMessageInput>
      </div>
    </div>
  );
}
