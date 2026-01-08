import * as ProfileService from "../src/services/profile.service";
import * as ProfileStore from "../src/store/profile";

jest.mock("@repo/database", () => ({
  prisma: {
    user: { findUnique: jest.fn() },
  },
}));

jest.mock("../src/store/profile");

describe("Profile Management Component Unit Tests", () => {
  const mockUserId = "user_1";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  //TC-UNIT-PRF-01
  it("should throw 404 if the profile doesn't exist", async () => {
    (ProfileStore.getById as jest.Mock).mockResolvedValue(null);

    await expect(ProfileService.getPublicProfile("missing")).rejects.toThrow(
      "User profile not found"
    );
  });

  //TC-UNIT-PRF-02
  it("should trigger the store embedding update and return the vector", async () => {
    const mockVector = new Array(384).fill(0.123);
    (ProfileStore.updateUserEmbeddings as jest.Mock).mockResolvedValue(
      mockVector
    );

    const result = await ProfileService.updateUserEmbeddings(mockUserId);

    expect(ProfileStore.updateUserEmbeddings).toHaveBeenCalledWith(mockUserId);
    expect(result).toEqual(mockVector);
  });

  //TC-UNIT-PRF-03
  it("should pass the payload to the store and return the updated profile", async () => {
    const updatePayload = {
      biography: "Updated bio",
      degree: "Computer Science",
    };
    const mockUpdatedProfile = { id: mockUserId, ...updatePayload };

    (ProfileStore.updateProfile as jest.Mock).mockResolvedValue(
      mockUpdatedProfile
    );

    const result = await ProfileService.updateProfile(
      mockUserId,
      updatePayload as any
    );

    expect(ProfileStore.updateProfile).toHaveBeenCalledWith(
      mockUserId,
      updatePayload
    );
    expect(result.biography).toBe(updatePayload.biography);
  });
});
