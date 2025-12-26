import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    sessionToken?: string;
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
