// shared/api/supabaseCore.ts
import {
  type SupabaseClient,
  type AuthError,
  type Session,
  type User,
} from '@supabase/supabase-js';
import { supabase } from '../client';

/** Базовый класс: держит client + даёт общие полезные методы */
export class SupabaseCore {
  protected readonly client: SupabaseClient;

  constructor() {
    this.client = supabase; // singleton browser-client
  }

  /* -------- сессия / пользователь -------- */

  /** Текущая сессия (читает cookie, без сетевого запроса). */
  async getSession(): Promise<Session | null> {
    const { data } = await this.client.auth.getSession();
    return data.session;
  }

  /** Текущий пользователь (JWT). */
  async getCurrentUser(): Promise<User | null> {
    const { data } = await this.client.auth.getUser();
    return data.user;
  }

  /* -------- refresh / logout -------- */

  async refresh(): Promise<AuthError | null> {
    const { error } = await this.client.auth.refreshSession();
    return error;
  }

  async signOutLocal(): Promise<AuthError | null> {
    const { error } = await this.client.auth.signOut({ scope: 'local' });
    return error;
  }

  /* low-level доступ – если вдруг нужен */
  get supabase(): SupabaseClient {
    return this.client;
  }
}
