import { prisma } from "@repo/database";
import { EventCreatePayload } from "@repo/shared-types";
import * as CommunitiesService from "../src/services/communities.service";
import * as EventsService from "../src/services/events.service";

jest.setTimeout(60000);

jest.mock("@repo/ai-system", () => ({
  generateVector: jest.fn().mockResolvedValue(new Array(384).fill(0.123)),
}));

describe("Communities Component Integration Tests", () => {
  const newCommunities: string[] = [];
  const newUsers: string[] = [];
  afterAll(async () => {
    await Promise.all(
      newCommunities.map((communityId) =>
        prisma.community.delete({ where: { id: communityId } })
      )
    );
    await Promise.all(
      newUsers.map((userId) => prisma.user.delete({ where: { id: userId } }))
    );
  });
  // TC-INT-SOC-01
  it("should create a JoinRequest linked to both user and community", async () => {
    const user = await prisma.user.create({
      data: { email: "joiner@test.com" },
    });
    newUsers.push(user.id);

    const community = await prisma.community.create({
      data: {
        name: "Private Study Group",
        mode: "private",
        coverImage: "image",
        description: "description",
        creatorId: "other_user",
      },
    });
    newCommunities.push(community.id);

    await CommunitiesService.requestJoinCommunity(
      community.id,
      user.id,
      "I want to learn!"
    );

    const request = await prisma.communityJoinRequest.findFirst({
      where: { userId: user.id, communityId: community.id },
    });

    expect(request).toBeDefined();
    expect(request?.status).toBe("pending");
  });

  // TC-INT-SOC-02
  it("should approve a request and create a CommunityMember record", async () => {
    const user = await prisma.user.create({
      data: { email: "member@test.com" },
    });
    newUsers.push(user.id);

    const community = await prisma.community.create({
      data: {
        name: "Private Study Group",
        mode: "private",
        coverImage: "image",
        description: "description",
        creatorId: "other_user",
      },
    });
    newCommunities.push(community.id);

    const request = await prisma.communityJoinRequest.create({
      data: { userId: user.id, communityId: community.id, status: "pending" },
    });

    await CommunitiesService.processJoinRequest(request.id, "approved");

    const membership = await prisma.communityMember.findFirst({
      where: { userId: user.id, communityId: community.id },
    });

    const updatedRequest = await prisma.communityJoinRequest.findUnique({
      where: { id: request.id },
    });

    expect(membership).toBeDefined();
    expect(updatedRequest?.status).toBe("approved");
  });

  // TC-INT-SOC-03
  it("should link a new event to its parent community", async () => {
    const user = await prisma.user.create({
      data: { email: "admin@test.com" },
    });
    newUsers.push(user.id);

    const community = await prisma.community.create({
      data: {
        name: "Private Study Group",
        mode: "private",
        coverImage: "image",
        description: "description",
        creatorId: "other_user",
      },
    });
    newCommunities.push(community.id);

    await prisma.communityMember.create({
      data: { userId: user.id, communityId: community.id, role: "admin" },
    });

    const event = await EventsService.createEvent(
      {
        title: "Final Exams",
        date: new Date(),
        description: "description",
        coverImage: "image",
        location_format: "in-person",
        all_day: true,
        public: true,
      } as EventCreatePayload,
      community.id,
      user.id
    );

    const communityWithEvents = await prisma.community.findUnique({
      where: { id: community.id },
      include: { events: true },
    });

    expect(communityWithEvents?.events).toContainEqual(
      expect.objectContaining({ id: event.id })
    );
  });

  // TC-INT-SOC-04
  it("should delete all associated events when a community is removed", async () => {
    const user = await prisma.user.create({
      data: { email: "creator@test.com" },
    });
    newUsers.push(user.id);

    const community = await prisma.community.create({
      data: {
        name: "Private Study Group",
        mode: "private",
        coverImage: "image",
        description: "description",
        creatorId: user.id,
      },
    });

    await prisma.communityMember.create({
      data: { userId: user.id, communityId: community.id, role: "admin" },
    });

    await prisma.event.createMany({
      data: [
        {
          title: "E1",
          communityId: community.id,
          creatorId: user.id,
          description: "description",
          coverImage: "image",
          location_format: "in-person",
          date: new Date(),
          all_day: true,
          public: true,
        },
        {
          title: "E2",
          communityId: community.id,
          creatorId: user.id,
          description: "description",
          coverImage: "image",
          location_format: "in-person",
          date: new Date(),
          all_day: true,
          public: true,
        },
        {
          title: "E3",
          communityId: community.id,
          creatorId: user.id,
          description: "description",
          coverImage: "image",
          location_format: "in-person",
          date: new Date(),
          all_day: true,
          public: true,
        },
      ],
    });

    await CommunitiesService.deleteCommunityById(community.id, user.id);

    const orphanedEvents = await prisma.event.findMany({
      where: { communityId: community.id },
    });

    expect(orphanedEvents).toHaveLength(0);
  });
});
