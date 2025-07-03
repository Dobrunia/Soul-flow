import UserDropdown from './UserDropdown/UserDropdown';

export default function Header() {
  return (
    <header className='w-full h-[72px] px-[16px] py-[8px] border-b bg-[var(--c-bg-subtle)] border-[var(--c-border)]'>
      <div className='w-full flex items-center justify-between'>
        <h1 className='text-xl font-semibold text-[var(--c-accent)]'>Soul Flow</h1>
        <UserDropdown />
      </div>
    </header>
  );
}
