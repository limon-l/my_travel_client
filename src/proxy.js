import { withAuth } from "next-auth/middleware";

/**
 * Only the account area requires a session. The catalogue, tour pages, about
 * and contact are public by design so travellers can browse before signing in.
 */
export default withAuth({
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
