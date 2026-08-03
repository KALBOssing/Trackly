import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { loginSchema } from "@/lib/validations/auth";
import { isAdminEmail } from "@/lib/admin";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days when "remember me" is checked; see jwt callback
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember me", type: "text" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse({
          email: credentials?.email,
          password: credentials?.password,
          rememberMe: credentials?.rememberMe === "true",
        });
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
          include: { studentProfile: true, teacherProfile: true },
        });
        if (!user) return null;
        if (user.suspended) return null;

        const valid = await verifyPassword(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          image: user.profilePictureUrl ?? undefined,
          studentProfileId: user.studentProfile?.id,
          teacherProfileId: user.teacherProfile?.id,
          isAdmin: isAdminEmail(user.email),
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.studentProfileId = (user as any).studentProfileId;
        token.teacherProfileId = (user as any).teacherProfileId;
        token.isAdmin = (user as any).isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).studentProfileId = token.studentProfileId;
        (session.user as any).teacherProfileId = token.teacherProfileId;
        (session.user as any).isAdmin = token.isAdmin;
        (session.user as any).impersonatedBy = token.impersonatedBy;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
