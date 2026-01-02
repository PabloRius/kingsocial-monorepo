"use server";

import { auth } from "@/lib/auth";
import {
  ApiErrorResponse,
  ApiResponse,
  ProfileDTO,
  ProfileUpdatePayload,
} from "@repo/shared-types";
import { deleteFromCloudinary, uploadToCloudinary } from "./cloudinary-utils";

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

export async function getProfileById(userId: string) {
  const session = await auth();

  if (!session?.sessionToken) {
    throw new Error("Unauthorised: No session token found");
  }

  const response = await fetch(`${baseURL}/profile/${userId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${session.sessionToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    console.error("Failed to fetch profile data", response);
    throw new Error("Failed to fetch profile data");
  }

  const result: ApiResponse<ProfileDTO> = await response.json();

  return result;
}

export async function updateProfile(
  data: ProfileUpdatePayload,
  imageFile?: File,
  coverImageFile?: File
) {
  const uploadedUrls: { url: string; folder: string }[] = [];
  try {
    const url = new URL(`${baseURL}/profile/me`);

    const session = await auth();
    if (!session?.sessionToken) throw new Error("Unauthorised");

    let newImage: string | null = null;
    let newCoverImage: string | null = null;

    if (imageFile) {
      const folder = "profiles/images";
      newImage = await uploadToCloudinary(imageFile, folder);
      uploadedUrls.push({ url: newImage, folder });
    }
    if (coverImageFile) {
      const folder = "profiles/covers";
      newCoverImage = await uploadToCloudinary(coverImageFile, folder);
      uploadedUrls.push({ url: newCoverImage, folder });
    }

    const response = await fetch(url.toString(), {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${session.sessionToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        ...(newImage && { image: newImage }),
        ...(newCoverImage && { coverImage: newCoverImage }),
      }),
    });

    if (!response.ok) {
      await performCleanup(uploadedUrls);
      const errorResult: ApiErrorResponse = await response
        .json()
        .catch(() => ({}));
      return errorResult;
    }

    if (newImage && data.image) {
      deleteFromCloudinary(data.image, "profiles/images").catch(console.error);
    }
    if (newCoverImage && data.coverImage) {
      deleteFromCloudinary(data.coverImage, "profiles/covers").catch(
        console.error
      );
    }

    return await response.json();
  } catch {
    if (uploadedUrls.length === 0) return;
    try {
      await Promise.all(
        uploadedUrls.map((item) => deleteFromCloudinary(item.url, item.folder))
      );
    } catch (e) {
      console.error("Cleanup failed", e);
    }
  }
}

async function performCleanup(items: { url: string; folder: string }[]) {
  try {
    await Promise.all(
      items.map((item) => deleteFromCloudinary(item.url, item.folder))
    );
  } catch (e) {
    console.error("Cleanup failed", e);
  }
}

export async function deleteProfile() {
  return true;
}
