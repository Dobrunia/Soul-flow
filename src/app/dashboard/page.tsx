import { headers } from 'next/headers';
import LogoutButton from './LogoutButton';

export default async function DashboardPage() {
  const headersList = await headers();
  const userId = headersList.get('x-user-id');
  const userEmail = headersList.get('x-user-email');

  return (
    <div className='min-h-screen bg-gray-50 py-12 px-4'>
      <div className='max-w-4xl mx-auto'>
        <div className='bg-white shadow rounded-lg p-6'>
          <div className='flex justify-between items-center mb-6'>
            <h1 className='text-3xl font-bold text-gray-900'>Дашборд</h1>
            <LogoutButton />
          </div>

          <div className='bg-blue-50 border border-blue-200 p-4 rounded'>
            <h2 className='text-lg font-semibold text-blue-800 mb-2'>Добро пожаловать!</h2>
            <p className='text-blue-600'>Email: {userEmail}</p>
            <p className='text-blue-600'>ID: {userId}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
