'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { MessageInput as DobrunniaMessageInput } from 'dobruniaui';
import { selectProfile } from '@/shared/store/profileSlice';
import { messageService } from '@/shared/lib/supabase/Classes/messageService';

export default function MessageInput() {
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

  const handleEmojiSelect = () => {
    // TODO: Реализовать выбор эмодзи
    console.log('Emoji selected');
  };

  const handleAudioRecord = (audio: Blob) => {
    // TODO: Реализовать отправку аудио
    console.log('Audio recorded:', audio);
  };

  return (
    <DobrunniaMessageInput
      value={message}
      onChange={setMessage}
      files={files}
      onFilesChange={setFiles}
      onSend={handleSend}
      onEmojiSelect={handleEmojiSelect}
      onAudioRecord={handleAudioRecord}
      disabled={sending}
    />
  );
}
