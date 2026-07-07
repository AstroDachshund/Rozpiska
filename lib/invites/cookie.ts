import type { CookieOptions } from '@supabase/ssr';

/** Nazwa httpOnly cookie przenoszącego token zaproszenia przez rundę magic linka. */
export const INVITE_COOKIE = 'invite_token';

export const inviteCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 60, // 1h — tyle, ile żyje magic link (otp_expiry=3600)
};
