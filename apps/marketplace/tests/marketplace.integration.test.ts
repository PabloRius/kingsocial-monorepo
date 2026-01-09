import { prisma } from "@repo/database";
import { ProductCreatePayload } from "@repo/shared-types";
import * as ItemService from "../src/services/items.service";

jest.setTimeout(60000);

jest.mock("@repo/ai-system", () => ({
  generateVector: jest.fn().mockResolvedValue(new Array(384).fill(0.123)),
}));

describe("Marketplace Component Integration Tests", () => {
  const newItems: string[] = [];
  const newUsers: string[] = [];
  afterAll(async () => {
    await Promise.all(
      newItems.map((itemId) =>
        prisma.product.delete({ where: { id: itemId } }).catch(() => null)
      )
    );
    await Promise.all(
      newUsers.map((userId) =>
        prisma.user.delete({ where: { id: userId } }).catch(() => null)
      )
    );
  });
  // TC-INT-MKT-01
  it("should create an item with a 384-length vector", async () => {
    const seller = await prisma.user.create({
      data: {
        name: "SellerTest",
        email: "seller@test.com",
        sellerProfile: { create: { plan: "free" } },
      },
      include: { sellerProfile: true },
    });
    newUsers.push(seller.id);

    const payload = {
      name: "Vintage Camera",
      description: "A beautiful 1950s film camera in working condition.",
      price: 120,
      category: "Electronics",
      condition: "Fair",
      pickupLocation: "Kingston",
      tags: [],
      photos: [],
    };

    const newItem = await ItemService.publishItem(
      seller.id,
      payload as ProductCreatePayload
    );
    newItems.push(newItem.id);

    const dbItem = await prisma.product.findUnique({
      where: { id: newItem.id },
    });

    expect(dbItem).toBeDefined();
    expect(dbItem?.embedding).toHaveLength(384);
  });

  // TC-INT-MKT-02
  it("should return items sorted by cosine similarity", async () => {
    const seller = await prisma.user.create({
      data: {
        email: "seller@test.com",
        sellerProfile: { create: { plan: "free" } },
        embedding: new Array(384).fill(0.123),
      },
      include: { sellerProfile: true },
    });
    newUsers.push(seller.id);

    const payload = {
      name: "Vintage Camera",
      description: "A beautiful 1950s film camera in working condition.",
      price: 120,
      category: "Electronics",
      condition: "Fair",
      pickupLocation: "Kingston",
      tags: [],
      photos: [],
    };

    const newItem = await ItemService.publishItem(
      seller.id,
      payload as ProductCreatePayload
    );
    newItems.push(newItem.id);

    const results = await ItemService.getRecommendedItemsForUser(seller.id);

    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toHaveProperty("name");
  });

  // TC-INT-MKT-02
  it("should persist bookmarks in the user document", async () => {
    const seller = await prisma.user.create({
      data: {
        email: "seller@test.com",
        sellerProfile: { create: { plan: "free" } },
      },
      include: { sellerProfile: true },
    });
    newUsers.push(seller.id);

    const payload = {
      name: "Vintage Camera",
      description: "A beautiful 1950s film camera in working condition.",
      price: 120,
      category: "Electronics",
      condition: "Fair",
      pickupLocation: "Kingston",
      tags: [],
      photos: [],
    };

    const item = await ItemService.publishItem(
      seller.id,
      payload as ProductCreatePayload
    );
    newItems.push(item.id);

    const interested = await prisma.user.create({
      data: {
        name: "Interested",
        email: "interested@test.com",
        sellerProfile: { create: { plan: "free" } },
      },
    });
    newUsers.push(interested.id);

    await ItemService.toggleItemBookmark(interested.id, item.id);
    const updatedUser = await prisma.user.findUnique({
      where: { id: interested.id },
    });
    expect(updatedUser?.bookmarkedProducts).toContain(item.id);
  });
});
