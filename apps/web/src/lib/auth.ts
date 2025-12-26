import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@repo/database";
import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID!,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET!,
      issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER,
    }) as Provider,
  ],
  callbacks: {
    async session({ session, user }) {
      const dbSession = await prisma.session.findFirst({
        where: { userId: user.id },
        orderBy: { expires: "desc" },
      });

      if (session.user && dbSession) {
        session.sessionToken = dbSession.sessionToken;
        session.user.id = user.id;
      }

      return session;
    },
  },
});
