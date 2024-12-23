{/*import { handlers } from "@/auth" // Referring to the auth.ts we just created
export const { GET, POST } = handlers */}

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import connectDB from "@/config/db";
import { User } from "@/models/User";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        const email = credentials?.email;
        const password = credentials?.password;

        if (!email || !password) {
          throw new Error("Please provide email and password");
        }

        await connectDB();

        const user = await User.findOne({ email }).select("+password +role");
        if (!user) {
          throw new Error("Invalid email or password");
        }

        const isMatched = await compare(password, user.password);
        if (!isMatched) {
          throw new Error("Invalid email or password");
        }

        const userData = {
          name: user.name,
          email: user.email,
          role: user.role,
          id: user._id.toString()
        };

        return userData;
      }
    })
  ],
  pages: {
    signIn: '/login'
  },
  callbacks: {
    async session({ session, token }) {
      if (token?.sub && token?.role) {
        session.user.id = token.sub;
        session.user.role = token.role;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
      }
      return token;
    },
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const { email, name, image, id } = user;
          await connectDB();
          const existingUser = await User.findOne({ email });
          if (!existingUser) {
            await User.create({ email, name, image, authProviderId: id });
          }
          return true;
        } catch (error) {
          throw new Error("Error while creating user");
        }
      }
      return true;
    }
  }
});
