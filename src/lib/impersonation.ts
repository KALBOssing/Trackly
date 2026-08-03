import { encode } from "next-auth/jwt";
import { cookies } from "next/headers";
import { isAdminEmail } from "@/lib/admin";

const secure = (process.env.NEXTAUTH_URL ?? "").startsWith("https://");
export const SESSION_COOKIE_NAME = secure ? "__Secure-next-auth.session-token" : "next-auth.session-token";
const MAX_AGE = 30 * 24 * 60 * 60; // matches authOptions.session.maxAge

type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "STUDENT" | "TEACHER";
  studentProfileId?: string;
  teacherProfileId?: string;
};

// Directly builds and sets a signed NextAuth session cookie for the given
// user, bypassing the normal sign-in flow. Used only by admin
// impersonation — never exposed to a non-admin action.
export async function setSessionForUser(user: SessionUser, impersonatedBy?: string) {
  const token = await encode({
    secret: process.env.NEXTAUTH_SECRET!,
    maxAge: MAX_AGE,
    token: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      studentProfileId: user.studentProfileId,
      teacherProfileId: user.teacherProfileId,
      isAdmin: isAdminEmail(user.email),
      impersonatedBy,
    },
  });

  cookies().set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}
