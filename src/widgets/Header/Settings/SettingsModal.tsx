'use client';

import { Modal, ThemeSelect, Card } from 'dobruniaui';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Настройки' size='large'>
      <div className='h-[500px]'>
        {/* Выбор темы */}
        <Card variant='elevated' className='overflow-visible!' title='Внешний вид'>
          <Card title='Выбор темы' className='overflow-visible!'>
            <ThemeSelect />
          </Card>
        </Card>
      </div>
    </Modal>
  );
}
