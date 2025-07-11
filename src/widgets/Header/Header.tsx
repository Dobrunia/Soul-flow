import UserDropdown from './UserDropdown/UserDropdown';

export default function Header() {
  return (
    <header className='w-full h-[72px] px-[16px] py-[8px] border-b bg-[var(--c-bg-subtle)] border-[var(--c-border)]'>
      <div className='w-full h-full flex items-center justify-between'>
        <div className='font-h text-[var(--c-accent)] h-full flex items-center'>Soul Flow</div>
        <UserDropdown />
      </div>
    </header>
  );
}
