import UserDropdown from '../../widgets/UserDropdown/UserDropdown';

export default function Header() {
  return (
    <header className='w-full px-4 py-2 border-b bg-[var(--c-bg-subtle)] border-[var(--c-border)]'>
      <div className='w-full flex items-center justify-between'>
        <h1 className='text-xl font-semibold text-[var(--c-accent)]'>Soul Flow</h1>
        <UserDropdown />
      </div>
    </header>
  );
}
