import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 p-4'>
      <div className='bg-white rounded-lg shadow-lg p-8 text-center max-w-md mx-auto'>
        <div className='mb-6'>
          <h1 className='text-6xl font-bold text-purple-700 mb-2'>404</h1>
          <h2 className='text-2xl font-bold text-gray-800 mb-2'>Страница не найдена</h2>
          <p className='text-gray-600'>
            К сожалению, запрашиваемая страница не существует или была перемещена
          </p>
        </div>

        <div className='space-y-3'>
          <Link href='/' className='block'>
            <button className='w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors'>
              На главную
            </button>
          </Link>
        </div>

        <div className='mt-6 pt-4 border-t border-gray-200'>
          <p className='text-sm text-gray-500'>
            Если вы считаете, что это ошибка, свяжитесь с поддержкой
          </p>
        </div>
      </div>
    </div>
  );
}
