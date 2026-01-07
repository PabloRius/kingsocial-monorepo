import { generateVector } from "@repo/ai-system";
import { prisma } from "@repo/database";
import { CommunityCreatePayload, CommunityDTO } from "@repo/shared-types";
import { communitySelect } from "./get";

export async function createCommunity(
  data: CommunityCreatePayload,
  creatorId: string
): Promise<CommunityDTO> {
  const embeddingText =
    `Community data: Commuinty name: ${data.name}. Community Description: ${data.description}.`
      .replace(/|s+/g, " ")
      .trim();
  const embedding = await generateVector(embeddingText);
  return await prisma.community.create({
    data: {
      ...data,
      creatorId,
      members: {
        create: {
          userId: creatorId,
          joinedAt: new Date(),
          role: "admin",
        },
      },
      embedding,
    },
    select: communitySelect,
  });
}

export async function joinCommunity(
  communityId: string,
  userId: string
): Promise<boolean> {
  const result = await prisma.communityMember.create({
    data: {
      user: { connect: { id: userId } },
      community: { connect: { id: communityId } },
      joinedAt: new Date(),
      role: "member",
    },
  });

  return !!result;
}

export async function requestCommunity(
  communityId: string,
  userId: string,
  message: string
): Promise<boolean> {
  const result = await prisma.communityJoinRequest.create({
    data: {
      community: { connect: { id: communityId } },
      user: { connect: { id: userId } },
      createdAt: new Date(),
      message,
      status: "pending",
    },
  });

  return !!result;
}

export async function stampJoinRequest(
  requestId: string,
  status: string
): Promise<boolean> {
  const result = await prisma.communityJoinRequest.update({
    where: { id: requestId },
    data: {
      status,
    },
  });

  return !!result;
}
