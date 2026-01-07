"use client";

import { UnauthorizedPage } from "@/components/UnauthorisedCard";
import { useSession } from "next-auth/react";

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  if (status === "unauthenticated") return <UnauthorizedPage />;
  return children;
}
