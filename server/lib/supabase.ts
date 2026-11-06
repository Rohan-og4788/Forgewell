import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/env.ts';
import { logger } from './logger.ts';

let supabaseClient: SupabaseClient | null = null;
let supabaseAdminClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return supabaseClient;
}

export function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdminClient) {
    supabaseAdminClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return supabaseAdminClient;
}

/**
 * Validate a Supabase JWT token and return the authenticated user's ID and email
 */
export async function verifySupabaseToken(token: string): Promise<{ id: string; email: string } | null> {
  try {
    const supabase = getSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user || !user.email) {
      if (error) logger.debug(`Supabase token verification failed: ${error.message}`);
      return null;
    }

    return {
      id: user.id,
      email: user.email,
    };
  } catch (err) {
    logger.error('Error during Supabase token verification', err);
    return null;
  }
}
