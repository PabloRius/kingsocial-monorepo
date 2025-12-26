import { Errors } from "@repo/backend-utils";
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
