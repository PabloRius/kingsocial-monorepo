"use client";

import { ChatProvider } from "@/context/ChatContext";
import { ProfileProvider } from "@/context/ProfileContext";
import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ProfileProvider>
        <ChatProvider>{children}</ChatProvider>
      </ProfileProvider>
    </SessionProvider>
  );
}
