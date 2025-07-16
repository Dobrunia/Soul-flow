import { SupabaseCore } from './supabaseCore';
import type { Profile } from '@/types/types';

export class ParticipantService extends SupabaseCore {
  /**
   * Получить профили всех участников чата
   */
  async getChatParticipants(chatId: string): Promise<Profile[]> {
    await this.ensureValidToken();

    const { data: participants, error } = await this.supabase
      .from('chat_participants')
      .select('profiles:user_id(id, username, avatar_url, status)')
      .eq('chat_id', chatId);

    if (error) throw error;

    return (participants || [])
      .flatMap((r: any) => {
        const p = r.profiles;
        if (!p) return [];
        return Array.isArray(p) ? p : [p];
      })
      .filter(Boolean) as Profile[];
  }
}

export const participantService = new ParticipantService();
