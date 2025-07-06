'use client';

import { Modal, ThemeSelect, Card, Row } from 'dobruniaui';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Настройки' size='medium'>
      <div className='space-y-6'>
        {/* Выбор темы */}
        <Card variant='elevated' className='overflow-visible!'>
          <div className='p-4'>
            <h3 className='font-medium mb-3'>Внешний вид</h3>
            <ThemeSelect />
          </div>
        </Card>

        {/* Другие настройки можно добавить здесь */}
        <Card variant='elevated'>
          <div className='p-4'>
            <h3 className='font-medium mb-3'>Уведомления</h3>
            <Row left='Включить уведомления' center='Переключатель будет здесь' className='py-2' />
          </div>
        </Card>

        <Card variant='elevated'>
          <div className='p-4'>
            <h3 className='font-medium mb-3'>Приватность</h3>
            <Row
              left='Показывать статус онлайн'
              center='Переключатель будет здесь'
              className='py-2'
            />
          </div>
        </Card>
      </div>
    </Modal>
  );
}
