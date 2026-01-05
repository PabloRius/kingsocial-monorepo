"use client";

import { ChatSidebar } from "@/components/ChatSidebar";
import { UnauthorizedPage } from "@/components/UnauthorisedCard";
import { useSession } from "next-auth/react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  if (status === "unauthenticated") return <UnauthorizedPage />;
  return (
    <div className="h-max flex flex-1 flex-col justify-between">
      <div className="flex bg-linear-to-br from-blue-50 via-white to-purple-50 h-[calc(100vh-100px)] overflow-hidden">
        <ChatSidebar />
        <main className="flex-1 h-full flex flex-col overflow-hidden relative">
          {children}
        </main>
      </div>
    </div>
  );
}
