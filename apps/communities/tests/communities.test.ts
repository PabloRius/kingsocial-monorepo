import * as CommunitiesService from "../src/services/communities.service";
import * as CommunitiesStore from "../src/store/communities";

jest.mock("../src/store/communities");

jest.mock("@repo/database", () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    community: { findUnique: jest.fn() },
  },
}));

describe("Communities Component Unit Test", () => {
  const mockUserId = "user_1";
  const mockCommId = "comm_1";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TC-UNIT-SOC-01
  it("should call joinCommunity when joining a public community", async () => {
    (CommunitiesStore.getById as jest.Mock).mockResolvedValue({
      mode: "public",
    });

    await CommunitiesService.joinCommunity(mockCommId, mockUserId);
    expect(CommunitiesStore.joinCommunity).toHaveBeenCalledWith(
      mockCommId,
      mockUserId
    );
  });

  // TC-UNIT-SOC-02
  it("should throw 403 when trying to join a private community directly", async () => {
    (CommunitiesStore.getById as jest.Mock).mockResolvedValue({
      mode: "private",
    });

    await expect(
      CommunitiesService.joinCommunity(mockCommId, mockUserId)
    ).rejects.toThrow("Must send a join request");
  });

  // TC-UNIT-SOC-03
  it("should throw 403 for duplicate join requests", async () => {
    (CommunitiesStore.getById as jest.Mock).mockResolvedValue({
      mode: "private",
    });
    (CommunitiesStore.hasRequested as jest.Mock).mockResolvedValue(true);

    await expect(
      CommunitiesService.requestJoinCommunity(mockCommId, mockUserId, "msg")
    ).rejects.toThrow(
      "Can't send multiple join requests to the same community"
    );
  });

  // TC-UNIT-SOC-04
  it("should throw 403 if non-admin tries to update community", async () => {
    (CommunitiesStore.getMemberByUserId as jest.Mock).mockResolvedValue({
      role: "member",
    });

    await expect(
      CommunitiesService.updateCommunity(mockCommId, {} as any, mockUserId)
    ).rejects.toThrow("Only admins can modify the community settings");
  });

  // TC-UNIT-SOC-05
  it("should throw 403 if non-creator tries to delete a community", async () => {
    (CommunitiesStore.getById as jest.Mock).mockResolvedValue({
      creatorId: "other",
    });

    await expect(
      CommunitiesService.deleteCommunityById(mockCommId, mockUserId)
    ).rejects.toThrow("Only the creator can delete the community");
  });
});
