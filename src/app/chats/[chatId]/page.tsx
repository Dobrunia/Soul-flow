import { headers } from 'next/headers';

interface ChatPageProps {
  params: Promise<{
    chatId: string;
  }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { chatId } = await params;
  const headersList = await headers();
  const userEmail = headersList.get('x-user-email');

  return (
    <div className='flex-1 flex flex-col'>
      {/* Шапка чата */}
      <div className='p-4 bg-white border-b border-gray-200 flex items-center justify-between'>
        <div className='flex items-center'>
          <div className='w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium mr-3'>
            {chatId[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className='font-medium text-gray-900'>Чат #{chatId}</h2>
            <p className='text-sm text-gray-500'>онлайн</p>
          </div>
        </div>
      </div>

      {/* История сообщений */}
      <div className='flex-1 p-4 overflow-y-auto'>
        <div className='space-y-4'>
          {/* Пример сообщений */}
          <div className='flex'>
            <div className='bg-gray-100 rounded-lg p-3 max-w-xs'>
              <p className='text-sm'>Привет! Как дела?</p>
              <span className='text-xs text-gray-500 mt-1 block'>12:30</span>
            </div>
          </div>

          <div className='flex justify-end'>
            <div className='bg-blue-500 text-white rounded-lg p-3 max-w-xs'>
              <p className='text-sm'>Отлично! А у тебя?</p>
              <span className='text-xs text-blue-100 mt-1 block'>12:32</span>
            </div>
          </div>
        </div>
      </div>

      {/* Поле ввода */}
      <div className='p-4 bg-white border-t border-gray-200'>
        <div className='flex items-center space-x-2'>
          <input
            type='text'
            placeholder='Введите сообщение...'
            className='flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
          <button className='bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors'>
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8'
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
