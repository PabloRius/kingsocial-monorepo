"use server";

import { auth } from "@/lib/auth";
import {
  ApiErrorResponse,
  ApiResponse,
  CommunityCreatePayload,
  CommunityDTO,
  CommunityMember,
  CommunityUpdatePayload,
} from "@repo/shared-types";
import { deleteFromCloudinary, uploadToCloudinary } from "./cloudinary-utils";
import { updateOwnEmbeddings } from "./profile";

const baseURL = `${process.env.NEXT_PUBLIC_COMMUNITIES_URL}/communities`;

export async function getOwnCommunities() {
  const session = await auth();

  if (!session?.sessionToken) {
    throw new Error("Unauthorised: No session token found");
  }

  const response = await fetch(`${baseURL}/me`, {
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

  const response = await fetch(`${baseURL}`, {
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

export async function getCommunityById(communityId: string) {
  const session = await auth();

  if (!session?.sessionToken) {
    throw new Error("Unauthorised: No session token found");
  }

  const response = await fetch(`${baseURL}/${communityId}`, {
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

export async function getRecommendedCommunities() {
  const url = new URL(`${baseURL}/recommendations`);

  const session = await auth();

  if (!session?.sessionToken) {
    throw new Error("Unauthorised: No session token found");
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${session.sessionToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    console.error("Error fetching communities: ", response);
    throw new Error("Failed to fetch communities");
  }

  const result: ApiResponse<CommunityDTO[]> = await response.json();

  return result;
}

export async function joinCommunity(communityId: string) {
  const session = await auth();

  if (!session?.sessionToken) {
    throw new Error("Unauthorised: No session token found");
  }

  const response = await fetch(`${baseURL}/${communityId}/join`, {
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

  try {
    await updateOwnEmbeddings();
  } catch (error) {
    console.error("Error updating self embeddings: ", error);
  } finally {
    return result;
  }
}

export async function stampCommunityJoinRequest(
  requestId: string,
  status: "approved" | "declined"
) {
  const session = await auth();

  if (!session?.sessionToken) {
    throw new Error("Unauthorised: No session token found");
  }

  const response = await fetch(`${baseURL}/request/${requestId}`, {
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

  const response = await fetch(`${baseURL}/${communityId}/request`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.sessionToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ joinMessage }),
  });

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
    const url = new URL(`${baseURL}`);

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
      console.error("Error creating community: ", errorResult);
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

    try {
      await updateOwnEmbeddings();
    } catch (error) {
      console.error("Error updating self embeddings: ", error);
    } finally {
      return result;
    }
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

export async function updateCommunity(
  communityId: string,
  data: CommunityUpdatePayload,
  coverImageFile: File | null
) {
  let uploadedUrl: string | null = "";
  try {
    const url = new URL(`${baseURL}/${communityId}`);

    const session = await auth();

    if (!session?.sessionToken) {
      throw new Error("Unauthorised: No session token found");
    }

    uploadedUrl = coverImageFile
      ? await uploadToCloudinary(coverImageFile, "communities")
      : null;

    const response = await fetch(url.toString(), {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${session.sessionToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        ...(coverImageFile ? { coverImage: uploadedUrl } : {}),
      }),
    });

    if (!response.ok) {
      const errorResult: ApiErrorResponse = await response
        .json()
        .catch(() => ({}));
      console.error("Error updating community: ", errorResult);
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

    if (uploadedUrl) {
      try {
        await deleteFromCloudinary(data.coverImage, "communities");
      } catch (cleanupError) {
        console.error("Cleanup failed: ", cleanupError);
      }
    }

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

  const response = await fetch(`${baseURL}/${communityId}/has_requested`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${session.sessionToken}`,
      "Content-Type": "application/json",
    },
  });

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

  const response = await fetch(`${baseURL}/${communityId}`, {
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

export async function updateCommunityMemberSettings(
  communityId: string,
  settings: { chatAlerts: boolean }
) {
  const session = await auth();

  if (!session?.sessionToken) {
    throw new Error("Unauthorised: No session token found");
  }

  const response = await fetch(
    `${baseURL}/${communityId}/update_member_settings`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${session.sessionToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(settings),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update settings");
  }

  const result: ApiResponse<CommunityMember> = await response.json();

  return result;
}
