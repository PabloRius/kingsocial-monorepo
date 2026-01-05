import { Prisma, prisma } from "@repo/database";
import { CommunityDTO } from "@repo/shared-types";
import { eventSelect } from "../events/get";

export const communitySelect = {
  id: true,
  name: true,
  description: true,
  mode: true,
  coverImage: true,
  createdAt: true,
  chat: {
    select: {
      id: true,
      createdAt: true,
      communityId: true,
      content: true,
      senderId: true,
      sender: {
        select: {
          role: true,
          userId: true,
          user: { select: { name: true, image: true } },
        },
      },
    },
  },
  events: { select: eventSelect },
  members: {
    select: {
      id: true,
      communityId: true,
      userId: true,
      role: true,
      joinedAt: true,
      user: { select: { name: true, image: true } },
    },
  },
  joinRequests: {
    select: {
      id: true,
      user: { select: { id: true, name: true, image: true } },
      message: true,
      createdAt: true,
      status: true,
    },
  },
  creatorId: true,
} satisfies Prisma.CommunitySelect & Record<keyof CommunityDTO, any>;

export async function getAll(): Promise<CommunityDTO[] | null> {
  const communities = await prisma.community.findMany({
    select: communitySelect,
    orderBy: { createdAt: "desc" },
  });
  return communities;
}

export async function getAllByUserId(
  userId: string
): Promise<CommunityDTO[] | null> {
  const communities = await prisma.community.findMany({
    where: { members: { some: { userId: userId } } },
    select: communitySelect,
    orderBy: { createdAt: "desc" },
  });
  return communities;
}

export async function getById(
  communityId: string
): Promise<CommunityDTO | null> {
  const community = await prisma.community.findUnique({
    where: { id: communityId },
    select: communitySelect,
  });
  return community;
}

export async function hasRequested(
  communityId: string,
  userId: string
): Promise<boolean> {
  const community = await prisma.community.findUnique({
    where: { id: communityId },
    select: { joinRequests: { select: { userId: true } } },
  });

  const hasRequested = community?.joinRequests.some(
    (jr) => jr.userId === userId
  );
  return hasRequested || false;
}

export async function getMemberByUserId(communityId: string, userId: string) {
  return await prisma.communityMember.findUnique({
    where: {
      userId_communityId: { communityId, userId },
    },
  });
}
