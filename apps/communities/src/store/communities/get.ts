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
      chatAlerts: true,
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

export async function getJoinRequestById(requestId: string) {
  return await prisma.communityJoinRequest.findUnique({
    where: { id: requestId },
    select: { communityId: true, userId: true },
  });
}

export async function getRecommendedCommunities(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      embedding: true,
      id: true,
      communities: { select: { communityId: true } },
    },
  });

  if (!user?.embedding) return [];

  const joinedCommunityIds = user.communities.map((c) => c.communityId);

  const results = (await prisma.$runCommandRaw({
    aggregate: "Community",
    pipeline: [
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: user.embedding,
          numCandidates: 100,
          limit: 40,
        },
      },
      {
        $match: {
          ...(joinedCommunityIds.length > 0 && {
            _id: {
              $nin: joinedCommunityIds.map((id) => ({ $oid: id })),
            },
          }),
        },
      },
      { $limit: 6 },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          coverImage: 1,
          mode: 1,
          createdAt: 1,
          creatorId: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ],
    cursor: {},
  })) as any;

  const rawCommunities = results.cursor?.firstBatch || [];

  return rawCommunities.map((p: any) => ({
    ...p,
    id: p._id.$oid || p._id?.toString(),
    createdAt: p.createdAt?.$date ? new Date(p.createdAt.$date) : p.createdAt,
    _id: undefined,
  }));
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
