import {
  type AuthError,
  type OAuthResponse,
  type Provider,
  type SignInWithPasswordCredentials,
  type SignUpWithPasswordCredentials,
} from '@supabase/supabase-js';

import { SupabaseCore } from './supabaseCore';

/**
 * Расширяем SupabaseCore методами авторизации.
 * В любой момент можно создать собственный экземпляр, передав другой client.
 */
export class AuthService extends SupabaseCore {
  /* ---------- email / password ---------- */

  async login(credentials: SignInWithPasswordCredentials): Promise<AuthError | null> {
    const { error } = await this.supabase.auth.signInWithPassword(credentials);
    return error;
  }

  async signup(credentials: SignUpWithPasswordCredentials): Promise<AuthError | null> {
    const { error } = await this.supabase.auth.signUp(credentials);
    return error;
  }

  /* ---------- OAuth ---------- */

  async signInWithOAuth(
    provider: Provider,
    options: { redirectTo?: string } = {}
  ): Promise<OAuthResponse | AuthError> {
    return this.supabase.auth.signInWithOAuth({ provider, options });
  }
}

/* Экспорт готового singleton-инстанса для приложения */
export const auth = new AuthService();
