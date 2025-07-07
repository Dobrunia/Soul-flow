import { SupabaseCore } from './supabaseCore';
import type { Profile } from '@/types/types';

export class UserService extends SupabaseCore {
  /** Поиск пользователей по username, исключая себя */
  async searchUsers(query: string, excludeId?: string, limit = 10): Promise<Profile[]> {
    if (!query.trim()) return [];

    await this.ensureValidToken();

    let rq = this.supabase
      .from('profiles')
      .select('*')
      .ilike('username', `%${query.trim()}%`)
      .limit(limit);

    if (excludeId) rq = rq.neq('id', excludeId);

    const { data, error } = await rq;
    if (error) throw error;
    return data ?? [];
  }

  /** Получить произвольный профиль */
  async getProfile(id: string): Promise<Profile | null> {
    await this.ensureValidToken();
    const { data, error } = await this.supabase.from('profiles').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }

  /** Получить профиль текущего пользователя */
  async getMyProfile(): Promise<Profile | null> {
    await this.ensureValidToken();
    const user = await this.getCurrentUser();
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', user?.id)
      .single();
    if (error) throw error;
    return data;
  }
}

export const userService = new UserService();
