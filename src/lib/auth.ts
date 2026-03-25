import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const ALLOWED_DOMAINS = ["sabesp.com.br", "emae.com.br"];

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user }) {
      const email = user.email;
      if (!email) return false;
      const domain = email.split("@")[1]?.toLowerCase();
      if (!domain || !ALLOWED_DOMAINS.includes(domain)) {
        return "/login?error=domain";
      }
      return true;
    },
    async session({ session }) {
      return session;
    },
  },
};
