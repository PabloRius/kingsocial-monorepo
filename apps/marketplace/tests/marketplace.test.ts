import * as ItemService from "../src/services/items.service";
import * as PlansService from "../src/services/plans.service";
import * as ItemStore from "../src/store/items";
import * as PlansStore from "../src/store/plans";

jest.mock("../src/store/items");
jest.mock("../src/store/plans");

jest.mock("@repo/database", () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    product: { findUnique: jest.fn() },
  },
}));

describe("Marketplace Component Unit Tests", () => {
  const mockUserId = "user_123";
  const mockItemId = "item_123";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TC-UNIT-MKT-01
  it("should throw 403 if a non-seller tries to publish an item", async () => {
    (PlansStore.getSellerProfile as jest.Mock).mockResolvedValue(null);

    await expect(
      ItemService.publishItem(mockUserId, {} as any)
    ).rejects.toThrow("Only registered sellers can publish listings");
  });

  // TC-UNIT-MKT-02
  it("should throw 403 if a user tries to modify an item they do not own", async () => {
    (PlansStore.getSellerProfile as jest.Mock).mockResolvedValue({
      id: "seller_id",
    });
    (ItemStore.getById as jest.Mock).mockResolvedValue({
      id: mockItemId,
      seller: { userId: "other_user" },
    });

    await expect(
      ItemService.modifyItemById(mockUserId, mockItemId, {} as any)
    ).rejects.toThrow("Unauthorised: You don't have access to this item");
  });

  // TC-UNIT-MKT-03
  it("should throw 400 if a user tries to bookmark their own item", async () => {
    (ItemStore.getUserBookmarkedItems as jest.Mock).mockResolvedValue([]);
    (ItemStore.getById as jest.Mock).mockResolvedValue({
      id: mockItemId,
      seller: { userId: mockUserId },
    });

    await expect(
      ItemService.toggleItemBookmark(mockUserId, mockItemId)
    ).rejects.toThrow("You cannot bookmark your own items");
  });

  // TC-UNIT-MKT-04
  it("should call unBookmarkItem if the item is already bookmarked", async () => {
    (ItemStore.getUserBookmarkedItems as jest.Mock).mockResolvedValue([
      mockItemId,
    ]);
    (ItemStore.getById as jest.Mock).mockResolvedValue({
      id: mockItemId,
      seller: { userId: "other_user" },
    });

    await ItemService.toggleItemBookmark(mockUserId, mockItemId);

    expect(ItemStore.unBookmarkItem).toHaveBeenCalledWith(
      mockUserId,
      mockItemId
    );
  });

  // TC-UNIT-MKT-05
  it("should call bookmarkItem if the item is not already bookmarked", async () => {
    (ItemStore.getUserBookmarkedItems as jest.Mock).mockResolvedValue([]);
    (ItemStore.getById as jest.Mock).mockResolvedValue({
      id: mockItemId,
      seller: { userId: "other_user" },
    });

    await ItemService.toggleItemBookmark(mockUserId, mockItemId);

    expect(ItemStore.bookmarkItem).toHaveBeenCalledWith(mockUserId, mockItemId);
  });

  // TC-UNIT-MKT-06
  it("shoulf throw 404 if deleting an item that doesn't exist", async () => {
    (ItemStore.getById as jest.Mock).mockResolvedValue(null);

    await expect(
      ItemService.deleteItemById(mockUserId, "invalid_id")
    ).rejects.toThrow("Item not found");
  });

  // TC-UNIT-MKT-07
  it("should throw 400 if user is already a seller", async () => {
    (PlansStore.getSellerProfile as jest.Mock).mockResolvedValue({
      userId: mockUserId,
    });

    await expect(
      PlansService.registerAsSeller(mockUserId, {} as any)
    ).rejects.toThrow("User is already registered as a seller");
  });
});
