import Link from 'next/link';

// Принудительно делаем страницу статической
// export const dynamic = 'force-static';

export default function NotFound() {
  return (
    <div className='min-h-screen flex items-center justify-center p-4 bg-[var(--c-bg-default)]'>
      <div className='rounded-lg shadow-lg p-8 text-center max-w-md mx-auto bg-[var(--c-bg-subtle)]'>
        <div className='mb-6'>
          <h1 className='text-6xl font-bold mb-2 text-[var(--c-accent)]'>404</h1>
          <h2 className='text-2xl font-bold mb-2 text-[var(--c-text-primary)]'>
            Страница не найдена
          </h2>
          <p className='text-[var(--c-text-secondary)]'>
            К сожалению, запрашиваемая страница не существует или была перемещена
          </p>
        </div>

        <div className='space-y-3'>
          <Link href='/' className='block'>
            <button className='w-full px-4 py-2 rounded-lg transition-colors hover:opacity-90 bg-[var(--c-accent)] text-[var(--c-text-inverse)] cursor-pointer'>
              На главную
            </button>
          </Link>
        </div>

        <div className='mt-6 pt-4 border-t border-[var(--c-border)]'>
          <p className='text-sm text-[var(--c-text-secondary)]'>
            Если вы считаете, что это ошибка, свяжитесь с поддержкой
          </p>
        </div>
      </div>
    </div>
  );
}
