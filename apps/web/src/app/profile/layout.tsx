"use client";

import { UnauthorizedPage } from "@/components/UnauthorisedCard";
import { useSession } from "next-auth/react";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  if (status === "unauthenticated") return <UnauthorizedPage />;
  return children;
}
