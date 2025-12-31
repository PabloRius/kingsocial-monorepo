"use client";

import { Footer } from "@/components/Footer";
import { useSession } from "next-auth/react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  if (status === "unauthenticated") return;
  return (
    <div className="h-max flex flex-1 flex-col justify-between">
      {children}
      <Footer />
    </div>
  );
}
