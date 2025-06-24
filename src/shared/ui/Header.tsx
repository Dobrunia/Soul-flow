import { headers } from 'next/headers';
import UserDropdown from '../../widgets/UserDropdown';

export default async function Header() {
  const headersList = await headers();
  const userId = headersList.get('x-user-id');
  const userEmail = headersList.get('x-user-email');

  // Если пользователь не авторизован, не показываем header
  if (!userId) {
    return null;
  }

  // Получаем имя из email (часть до @)
  const userName = userEmail?.split('@')[0] || 'Пользователь';

  return (
    <header className='w-full px-4 py-2 border-b bg-[var(--c-bg-subtle)] border-[var(--c-border)]'>
      <div className='w-full flex items-center justify-between'>
        <h1 className='text-xl font-semibold text-[var(--c-accent)]'>Soul Flow</h1>

        {/* Dropdown пользователя */}
        <UserDropdown userName={userName} userEmail={userEmail || ''} />
      </div>
    </header>
  );
}
