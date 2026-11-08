// Supabase Auth signs in with an email, but the app asks for a username.
// "diamondpalm" becomes "diamondpalm@example.com" (example.com is reserved, so
// no real mailbox is involved). Must match is_owner() in supabase_schema_v2.sql.
// A full email can also be typed directly.
export const LOGIN_EMAIL_DOMAIN = "example.com";

export function loginEmail(username: string): string {
  const u = username.trim().toLowerCase();
  return u.includes("@") ? u : `${u}@${LOGIN_EMAIL_DOMAIN}`;
}

export function displayName(email: string | undefined): string {
  if (!email) return "";
  return email.endsWith(`@${LOGIN_EMAIL_DOMAIN}`) ? email.split("@")[0] : email;
}
