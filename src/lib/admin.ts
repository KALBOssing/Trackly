// The set of accounts allowed into /admin. Deliberately not a database
// field or in-app toggle — admin access is granted by editing this file
// and redeploying, so it can't be escalated to from within the app itself.
export const ADMIN_EMAILS = ["cgfigueroa0@gmail.com"];

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
