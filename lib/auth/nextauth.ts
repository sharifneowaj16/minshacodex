import NextAuth, { NextAuthOptions, Session, User } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth/password';

// Extend types for custom fields
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: string;
    };
    accessToken?: string;
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    role: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: string;
    role: string;
    accessToken?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),

    // Facebook OAuth Provider
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),

    // Credentials Provider for email/password login
    CredentialsProvider({
      id: 'credentials',
      name: 'Email and Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        // Find user in database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user) {
          throw new Error('Invalid email or password');
        }

        if (!user.passwordHash) {
          throw new Error('Please sign in using your social account');
        }

        if (user.status !== 'ACTIVE') {
          throw new Error('Your account has been suspended');
        }

        // Verify password
        const isValid = await verifyPassword(credentials.password, user.passwordHash);

        if (!isValid) {
          throw new Error('Invalid email or password');
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || null,
          image: user.avatar,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle social login - create or update user in database
      if (account?.provider === 'google' || account?.provider === 'facebook') {
        const email = user.email?.toLowerCase();

        if (!email) {
          return false;
        }

        // Check if user exists
        let dbUser = await prisma.user.findUnique({
          where: { email },
          include: { accounts: true },
        });

        if (dbUser) {
          // Check if this provider is already linked
          const existingAccount = dbUser.accounts.find(
            (acc: { provider: string }) => acc.provider === account.provider
          );

          if (!existingAccount) {
            // Link new provider to existing user
            await prisma.account.create({
              data: {
                userId: dbUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                refresh_token: account.refresh_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
              },
            });
          }

          // Update last login
          await prisma.user.update({
            where: { id: dbUser.id },
            data: {
              lastLoginAt: new Date(),
              avatar: user.image || dbUser.avatar,
            },
          });
        } else {
          // Create new user with social account
          const nameParts = user.name?.split(' ') || [];
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';

          dbUser = await prisma.user.create({
            data: {
              email,
              firstName,
              lastName,
              avatar: user.image,
              emailVerified: new Date(),
              role: 'CUSTOMER',
              status: 'ACTIVE',
              lastLoginAt: new Date(),
              referralCode: `REF${Date.now().toString(36).toUpperCase()}`,
              accounts: {
                create: {
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token,
                  refresh_token: account.refresh_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                },
              },
            },
            include: { accounts: true },
          });
        }

        // Update user object with database ID
        user.id = dbUser.id;
        user.role = dbUser.role;
      }

      return true;
    },

    async jwt({ token, user, account }): Promise<JWT> {
      // Initial sign in
      if (user) {
        token.userId = user.id;
        token.role = user.role || 'CUSTOMER';
      }

      if (account?.access_token) {
        token.accessToken = account.access_token;
      }

      return token;
    },

    async session({ session, token }): Promise<Session> {
      if (token && session.user) {
        session.user.id = token.userId;
        session.user.role = token.role;
      }

      if (token.accessToken) {
        session.accessToken = token.accessToken;
      }

      return session;
    },
  },

  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
    newUser: '/register',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  events: {
    async signOut({ token }) {
      // Clean up any refresh tokens on sign out
      if (token?.userId) {
        await prisma.refreshToken.updateMany({
          where: { userId: token.userId },
          data: { revoked: true },
        });
      }
    },
  },

  debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions);
