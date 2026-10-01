import { createHash, timingSafeEqual } from 'crypto';
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const digest = (value: string) => createHash('sha256').update(value).digest();

// Constant-time comparison so response timing doesn't leak how much of a guess was right.
function matches(input: string | undefined, expected: string | undefined): boolean {
  if (!input || !expected) {
    return false;
  }
  return timingSafeEqual(digest(input), digest(expected));
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const usernameMatches = matches(credentials?.username, process.env.ADMIN_USERNAME);
        const passwordMatches = matches(credentials?.password, process.env.ADMIN_PASSWORD);
        return usernameMatches && passwordMatches ? { id: 'admin', name: 'Admin' } : null;
      }
    })
  ],
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 12 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
