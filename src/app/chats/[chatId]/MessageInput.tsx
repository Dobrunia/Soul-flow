'use client';

import { useState } from 'react';
import { MessageInput as DobrunniaMessageInput } from 'dobruniaui';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  children?: React.ReactNode;
}

export default function MessageInput({ onSendMessage, children }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  const handleSend = () => {
    if (message.trim() || files.length > 0) {
      onSendMessage(message.trim());
      setMessage('');
      setFiles([]);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji);
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
          placeholder='Введите сообщение...'
          onSend={handleSend}
          onEmojiSelect={handleEmojiSelect}
          onAudioRecord={handleAudioRecord}
          maxHeight={400}
        >
          {children}
        </DobrunniaMessageInput>
      </div>
    </div>
  );
}
