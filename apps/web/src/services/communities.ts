"use server";

import { auth } from "@/lib/auth";
import {
  ApiErrorResponse,
  ApiResponse,
  CommunityCreatePayload,
  CommunityDTO,
  EventDTO,
} from "@repo/shared-types";
import { deleteFromCloudinary, uploadToCloudinary } from "./cloudinary-utils";

const baseURL = `${process.env.NEXT_PUBLIC_COMMUNITIES_URL}`;

export async function getOwnCommunities() {
  const session = await auth();

  if (!session?.sessionToken) {
    throw new Error("Unauthorised: No session token found");
  }

  const response = await fetch(`${baseURL}/communities/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${session.sessionToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch communities");
  }

  const result: ApiResponse<CommunityDTO[]> = await response.json();

  return result;
}

export async function getAllCommunities() {
  const session = await auth();

  if (!session?.sessionToken) {
    throw new Error("Unauthorised: No session token found");
  }

  const response = await fetch(`${baseURL}/communities`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${session.sessionToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch communities");
  }

  const result: ApiResponse<CommunityDTO[]> = await response.json();

  return result;
}

export async function getAllEvents() {
  const session = await auth();

  if (!session?.sessionToken) {
    throw new Error("Unauthorised: No session token found");
  }

  const response = await fetch(`${baseURL}/events`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${session.sessionToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch events");
  }

  const result: ApiResponse<EventDTO[]> = await response.json();

  return result;
}

export async function getCommunityById(communityId: string) {
  const session = await auth();

  if (!session?.sessionToken) {
    throw new Error("Unauthorised: No session token found");
  }

  const response = await fetch(`${baseURL}/communities/${communityId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${session.sessionToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch community");
  }

  const result: ApiResponse<CommunityDTO> = await response.json();

  return result;
}

export async function joinCommunity(communityId: string) {
  const session = await auth();

  if (!session?.sessionToken) {
    throw new Error("Unauthorised: No session token found");
  }

  const response = await fetch(`${baseURL}/communities/${communityId}/join`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.sessionToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to join community");
  }

  const result: ApiResponse<CommunityDTO> = await response.json();

  return result;
}

export async function stampCommunityJoinRequest(
  requestId: string,
  status: "approved" | "declined"
) {
  const session = await auth();

  if (!session?.sessionToken) {
    throw new Error("Unauthorised: No session token found");
  }

  const response = await fetch(`${baseURL}/communities/request/${requestId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.sessionToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error("Failed to join community");
  }

  const result: ApiResponse<CommunityDTO> = await response.json();

  return result;
}

export async function sendJoinRequest(
  communityId: string,
  joinMessage: string
) {
  const session = await auth();

  if (!session?.sessionToken) {
    throw new Error("Unauthorised: No session token found");
  }

  const response = await fetch(
    `${baseURL}/communities/${communityId}/request`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.sessionToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ joinMessage }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to request to join community");
  }

  const result: ApiResponse<CommunityDTO> = await response.json();

  return result;
}

export async function createCommunity(
  data: CommunityCreatePayload,
  coverImageFile: File
) {
  let uploadedUrl: string = "";
  try {
    const url = new URL(`${baseURL}/communities`);

    const session = await auth();

    if (!session?.sessionToken) {
      throw new Error("Unauthorised: No session token found");
    }

    uploadedUrl = await uploadToCloudinary(coverImageFile, "communities");

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.sessionToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...data, coverImage: uploadedUrl }),
    });

    if (!response.ok) {
      const errorResult: ApiErrorResponse = await response
        .json()
        .catch(() => ({}));
      console.error("Error creating item: ", errorResult);
      if (uploadedUrl) {
        try {
          await deleteFromCloudinary(uploadedUrl, "communities");
        } catch (cleanupError) {
          console.error("Cleanup failed: ", cleanupError);
        }
      }
      return errorResult;
    }

    const result: ApiResponse<CommunityDTO> = await response.json();

    return result;
  } catch (error) {
    if (uploadedUrl) {
      try {
        await deleteFromCloudinary(uploadedUrl, "communities");
      } catch (cleanupError) {
        console.error("Cleanup failed: ", cleanupError);
      }
    }
    throw error;
  }
}

export async function hasRequested(communityId: string) {
  const session = await auth();

  if (!session?.sessionToken) {
    throw new Error("Unauthorised: No session token found");
  }

  const response = await fetch(
    `${baseURL}/communities/${communityId}/has_requested`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.sessionToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch community");
  }

  const result: ApiResponse<boolean> = await response.json();

  return result;
}

export async function deleteCommunityById(communityId: string) {
  const session = await auth();

  if (!session?.sessionToken) {
    throw new Error("Unauthorised: No session token found");
  }

  const response = await fetch(`${baseURL}/communities/${communityId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${session.sessionToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    console.error(`Failed to delete community: ${response}`);
    throw new Error("Failed to delete community");
  }

  const result: ApiResponse<CommunityDTO> = await response.json();

  if (result.data.coverImage) {
    try {
      await deleteFromCloudinary(result.data.coverImage, "communities");
    } catch (cleanupError) {
      console.error("Cleanup failed: ", cleanupError);
    }
  }

  return !!result;
}
