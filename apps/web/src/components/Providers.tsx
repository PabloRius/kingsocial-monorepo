"use client";

import { ChatProvider } from "@/context/ChatContext";
import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ChatProvider>{children}</ChatProvider>
    </SessionProvider>
  );
}
