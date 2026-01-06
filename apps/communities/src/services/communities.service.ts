import { Errors } from "@repo/backend-utils";
import { prisma } from "@repo/database";
import {
  CommunityCreatePayload,
  CommunityUpdatePayload,
} from "@repo/shared-types";
import * as CommunitiesStore from "../store/communities";

export async function getAllCommunities() {
  const data = await CommunitiesStore.getAll();

  if (!data) throw new Error("DATABASE_ERROR");

  return data;
}

export async function getUserCommunities(userId: string) {
  const data = await CommunitiesStore.getAllByUserId(userId);

  if (!data) throw new Error("DATABASE_ERROR");

  return data;
}

export async function getCommunityById(communityId: string) {
  const data = await CommunitiesStore.getById(communityId);

  return data;
}

export async function hasRequestedToJoin(communityId: string, userId: string) {
  const data = await CommunitiesStore.hasRequested(communityId, userId);

  return data;
}

export async function createCommunity(
  data: CommunityCreatePayload,
  userId: string
) {
  const result = await CommunitiesStore.createCommunity(data, userId);

  return result;
}

export async function joinCommunity(communityId: string, userId: string) {
  const community = await CommunitiesStore.getById(communityId);

  if (!community) throw new Errors.APIError("Community doesn't exist", 404);

  if (community.mode === "private") {
    throw new Errors.APIError("Must send a join request", 403);
  }

  return await CommunitiesStore.joinCommunity(communityId, userId);
}

export async function requestJoinCommunity(
  communityId: string,
  userId: string,
  message: string
) {
  const community = await CommunitiesStore.getById(communityId);

  if (!community) throw new Errors.APIError("Community doesn't exist", 404);

  if (community.mode !== "private") {
    throw new Errors.APIError(
      "Dont' need to send a request to a public community",
      403
    );
  }

  if ((await CommunitiesStore.hasRequested(communityId, userId)) === true)
    throw new Errors.APIError(
      "Can't send multiple join requests to the same community",
      403
    );

  return await CommunitiesStore.requestCommunity(communityId, userId, message);
}

export async function processJoinRequest(requestId: string, status: string) {
  const requestData = await prisma.communityJoinRequest.findUnique({
    where: { id: requestId },
  });

  if (!requestData)
    throw new Errors.APIError("Request not found in the server", 400);

  const stampResult = await CommunitiesStore.stampJoinRequest(
    requestId,
    status
  );

  if (!stampResult)
    throw new Errors.APIError("Error processing the join request", 500);

  const { communityId, userId } = requestData;

  const result = await CommunitiesStore.joinCommunity(communityId, userId);

  return result;
}

export async function updateCommunity(
  communityId: string,
  data: CommunityUpdatePayload,
  userId: string
) {
  const memberData = await CommunitiesStore.getMemberByUserId(
    communityId,
    userId
  );

  if (!memberData || memberData.role !== "admin")
    throw new Errors.APIError(
      "Only admins can modify the community settings",
      403
    );

  const result = await CommunitiesStore.updateCommunity(communityId, data);

  return result;
}

export async function updateCommunityMemberSettings(
  communityId: string,
  userId: string,
  settings: { chatAlerts: boolean }
) {
  const memberData = await CommunitiesStore.getMemberByUserId(
    communityId,
    userId
  );

  if (!memberData)
    throw new Errors.APIError("User is not a member of the community", 400);

  return await CommunitiesStore.updateMemberSettings(memberData.id, settings);
}

export async function deleteCommunityById(communityId: string, userId: string) {
  const community = await CommunitiesStore.getById(communityId);

  if (!community) throw new Errors.APIError("Community doesn't exist", 404);

  if (
    community?.creatorId !== userId &&
    !community?.members.some((m) => m.userId === userId && m.role === "admin")
  )
    throw new Errors.APIError("Only the admins can delete the community", 403);

  return await CommunitiesStore.deleteById(communityId);
}
