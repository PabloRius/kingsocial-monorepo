import { Errors } from "@repo/backend-utils";
import { ProfileUpdatePayload } from "@repo/shared-types";
import * as ProfileStore from "../store/profile";

export async function getPublicProfile(userId: string) {
  const profile = await ProfileStore.getById(userId);
  if (!profile) {
    throw new Errors.APIError("User profile not found", 404);
  }
  return profile;
}

export async function getOwnProfile(authenticatedUserId: string) {
  return await getPublicProfile(authenticatedUserId);
}

export async function getRecommendedPeers(userId: string) {
  return await ProfileStore.getRecommendedPeers(userId);
}

export async function updateProfile(
  userId: string,
  data: ProfileUpdatePayload
) {
  const result = await ProfileStore.updateProfile(userId, data);
  await ProfileStore.updateUserEmbeddings(userId);
  return result;
}

export async function updateUserEmbeddings(userId: string) {
  return await ProfileStore.updateUserEmbeddings(userId);
}
