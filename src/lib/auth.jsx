import CredentialsProvider from "next-auth/providers/credentials";

import { UpstreamError, backendFetch } from "@/lib/backend";

/**
 * Server-side NextAuth configuration.
 *
 * Sign-in is delegated to the Express API so password hashing and the verified
 * `role` live in one place. The browser never talks to the API directly: the
 * BFF mints a short-lived signed identity token from this session.
 *
 * Google OAuth is intentionally not enabled: the API has no account-linking
 * flow, so an OAuth session could not be mapped to a real user id or role.
 */

const providers = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const email = typeof credentials?.email === "string" ? credentials.email.trim() : "";
      const password = typeof credentials?.password === "string" ? credentials.password : "";
      if (!email || !password) return null;

      try {
        const user = await backendFetch("login", {
          method: "POST",
          body: { email, password },
          timeoutMs: 10000,
        });

        if (!user?.id) return null;

        return {
          id: String(user.id),
          name: typeof user.name === "string" && user.name ? user.name : email,
          email: typeof user.email === "string" && user.email ? user.email : email,
          role: user.role === "admin" ? "admin" : "user",
        };
      } catch (error) {
        if (!(error instanceof UpstreamError)) {
          console.error("Sign-in failed:", error?.message);
        }
        // A wrong password, an unknown account and an unreachable API all fail
        // closed without leaking which one it was to the browser.
        return null;
      }
    },
  }),
];

export const authOptions = {
  providers,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role === "admin" ? "admin" : "user";
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role === "admin" ? "admin" : "user";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
