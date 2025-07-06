/** Простая коллекция валидаторов. Возвращают **пустую строку**, если
 *  всё ок, иначе — текст ошибки (который можно сразу показать в UI). */

export function validateEmail(email: string): string {
  const trimmed = email.trim();
  if (!trimmed) return 'Email обязателен';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(trimmed) ? '' : 'Введите корректный email';
}

export function validatePassword(pwd: string): string {
  const trimmed = pwd.trim();
  if (!trimmed) return 'Пароль обязателен';
  return trimmed.length < 6 ? 'Минимум 6 символов' : '';
}

export function validateConfirmPassword(pwd: string, confirm: string): string {
  const trimmed = confirm.trim();
  if (!trimmed) return 'Подтверждение пароля обязательно';
  return pwd.trim() === trimmed ? '' : 'Пароли не совпадают';
}
