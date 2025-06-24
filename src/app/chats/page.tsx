export default function ChatsPage() {
  return (
    <div className='flex-1 flex items-center justify-center bg-[var(--c-bg-default)]'>
      {/* Показываем заглушку только на десктопе */}
      <div className='hidden md:flex text-center text-[var(--c-text-secondary)] flex-col items-center'>
        <div className='text-6xl mb-4'>💬</div>
        <h2 className='text-xl font-medium mb-2 text-[var(--c-text-primary)]'>
          Выберите чат слева, чтобы начать переписку
        </h2>
        <p className='text-sm'>Ваши сообщения отобразятся здесь</p>
      </div>

      {/* На мобилке эта страница не отображается, так как сразу показывается список чатов */}
    </div>
  );
}
