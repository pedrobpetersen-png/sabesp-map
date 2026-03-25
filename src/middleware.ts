export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - /login
     * - /api/auth (NextAuth routes)
     * - /_next (Next.js internals)
     * - /favicon.ico, /public assets
     */
    "/((?!login|api/auth|_next|favicon\\.ico).*)",
  ],
};
