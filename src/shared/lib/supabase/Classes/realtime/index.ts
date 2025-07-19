export { RealtimeCore } from './realtimeCore';
export { StatusMethods } from './statusMethods';

// Создаем экземпляр для использования
import { StatusMethods } from './statusMethods';
export const statusService = new StatusMethods();
