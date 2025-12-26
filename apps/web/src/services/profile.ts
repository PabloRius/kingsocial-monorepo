"use server";

import { auth } from "@/lib/auth";
import { ApiResponse, ProfileDTO } from "@repo/shared-types";

const baseURL = `${process.env.NEXT_PUBLIC_PROFILE_URL}`;

export async function getOwnProfile() {
  const session = await auth();

  if (!session?.sessionToken) {
    throw new Error("Unauthorised: No session token found");
  }

  const response = await fetch(`${baseURL}/profile/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${session.sessionToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch profile data");
  }

  const result: ApiResponse<ProfileDTO> = await response.json();

  return result;
}
