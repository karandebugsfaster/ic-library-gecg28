// src/app/api/auth/[...nextauth]/route.js

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        try {
          await connectDB();

          const user = await User.findOne({ 
            email: credentials.email.toLowerCase(),
            role: credentials.role,
          });

          if (!user) {
            throw new Error('Invalid credentials');
          }

          if (user.status !== 'active') {
            throw new Error('Account is inactive');
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);

          if (!isValid) {
            throw new Error('Invalid credentials');
          }

          // Update last active
          user.lastActiveAt = new Date();
          await user.save();

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            assignedFaculty: user.assignedFaculty?.toString(),
            sessionInvalidatedAt: user.sessionInvalidatedAt,
          };

        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
        token.assignedFaculty = user.assignedFaculty;
        token.sessionInvalidatedAt = user.sessionInvalidatedAt;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.status = token.status;
        session.user.assignedFaculty = token.assignedFaculty;
        session.user.sessionInvalidatedAt = token.sessionInvalidatedAt;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };