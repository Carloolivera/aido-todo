import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

// Configuración mínima para middleware (sin DB, solo JWT)
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    // El provider vacío es necesario para que next-auth compile en Edge
    Credentials({}),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isAuthenticated = !!auth?.user;
      const publicPaths = ["/login", "/register"];
      const isPublicPath = publicPaths.some((p) => nextUrl.pathname.startsWith(p));

      if (!isAuthenticated && !isPublicPath) return false;
      if (isAuthenticated && isPublicPath) {
        return Response.redirect(new URL("/todos", nextUrl));
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
  },
};
