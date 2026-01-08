import { Tests } from "@repo/backend-utils";
import { prisma } from "@repo/database";
import * as ProfileService from "../src/services/profile.service";

jest.setTimeout(60000);

jest.mock("@repo/ai-system", () => ({
  generateVector: jest.fn().mockResolvedValue(new Array(384).fill(0.123)),
}));

describe("Profile Management Integration Tests", () => {
  beforeAll(async () => {
    await Tests.setupTestDB();
    await prisma.$connect();
  });
  afterEach(async () => {
    await prisma.user.deleteMany();
  });
  afterAll(async () => {
    await prisma.$disconnect();
    await Tests.stopTestDB();
  });

  // TC-INT-PROF-01
  it("should update user data and automatically trigger embedding recalculation", async () => {
    const user = await prisma.user.create({
      data: { email: "student_a@kingston.ac.uk", biography: "Empty" },
    });

    const updatedBio =
      "I am interested in Cybersecurity and Python development.";
    await ProfileService.updateProfile(user.id, {
      name: user.name || "Noname",
      biography: updatedBio,
      socialLinks: [],
      image: "image",
      coverImage: "image",
      kNumber: "K...",
      studyLevel: "MSc",
      degree: "Software Engineering",
      settings: { notificationsEnabled: true, showOnlineStatus: true },
    });

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });

    expect(dbUser?.biography).toBe(updatedBio);
    expect(dbUser?.embedding).toBeDefined();
    expect(dbUser?.embedding).toHaveLength(384);
  });

  // TC-INT-PROF-02
  it("should return User B as a match for User A based on vector similarity", async () => {
    const vector = new Array(384).fill(0.9);

    const userA = await prisma.user.create({
      data: {
        email: "userA@test.com",
        embedding: vector,
        biography: "AI Researcher",
        degree: "Degree",
        studyLevel: "MSc",
        image: "image",
      },
    });

    const userB = await prisma.user.create({
      data: {
        email: "userB@test.com",
        embedding: vector,
        biography: "AI Enthusiast",
        degree: "Degree",
        studyLevel: "MSc",
        image: "image",
      },
    });

    jest.spyOn(prisma, "$runCommandRaw").mockResolvedValue({
      cursor: {
        firstBatch: [
          {
            _id: { $oid: userB.id },
            biography: "AI Enthusiast",
            name: "User B",
          },
        ],
      },
      ok: 1,
    } as any);

    const recommendations = await ProfileService.getRecommendedPeers(userA.id);

    const matchFound = recommendations.some(
      (peer: any) => peer.id === userB.id
    );
    expect(matchFound).toBe(true);

    const selfRecommended = recommendations.some(
      (peer: any) => peer.id === userA.id
    );
    expect(selfRecommended).toBe(false);
  });
});
