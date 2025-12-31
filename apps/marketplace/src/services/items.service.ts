import { Errors } from "@repo/backend-utils";
import { prisma } from "@repo/database";
import {
  GetMarketplaceQuery,
  ProductCreatePayload,
  ProductUpdatePayload,
} from "@repo/shared-types";
import * as ItemStore from "../store/items";

export async function getMarketplaceCatalog(query: GetMarketplaceQuery) {
  const { page, limit, userId, ...filters } = query;

  const data = await ItemStore.getAll(page, limit, userId, filters);

  if (!data) throw new Error("DATABASE_ERROR");

  return data;
}

export async function getItemById(id: string) {
  const item = await ItemStore.getById(id);
  if (!item) throw new Errors.APIError("Item not found", 404);
  return item;
}

export async function getUserInventory(userId: string) {
  return await ItemStore.getByUserId(userId);
}

export async function publishItem(userId: string, data: ProductCreatePayload) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { sellerProfile: { select: { id: true } } },
  });

  if (!user?.sellerProfile) {
    throw new Errors.APIError(
      "Only registered sellers can publish listings",
      403
    );
  }

  return await ItemStore.createItem(user.sellerProfile.id, data);
}

export async function modifyItemById(
  userId: string,
  itemId: string,
  data: ProductUpdatePayload
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { sellerProfile: { select: { id: true } } },
  });

  if (!user) {
    throw new Errors.APIError(
      "Only registered users can access this method",
      403
    );
  }

  const item = await prisma.product.findUnique({
    where: { id: itemId },
    select: { seller: { select: { userId: true } } },
  });

  if (!item || item.seller?.userId !== userId) {
    throw new Errors.APIError(
      "Unauthorised: You don't have access to this item",
      403
    );
  }

  const result = await ItemStore.updateItem(itemId, data);
  return result;
}

export async function increaseItemViewsByOne(userId: string, itemId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { sellerProfile: { select: { id: true } } },
  });

  if (!user) {
    throw new Errors.APIError(
      "Only registered users can increase an item's views",
      403
    );
  }

  const result = await ItemStore.increaseViews(itemId);
  return result;
}

export async function markItemAsSold(userId: string, itemId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { sellerProfile: { select: { id: true } } },
  });

  const item = await prisma.product.findUnique({
    where: { id: itemId },
    select: { seller: { select: { userId: true } } },
  });

  if (!user || !user.sellerProfile || item?.seller?.userId !== userId) {
    throw new Errors.APIError(
      "Only the seller can modify an item's status",
      403
    );
  }

  const result = await ItemStore.markAsSold(itemId);
  return result;
}

export async function toggleItemBookmark(userId: string, itemId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { bookmarkedProducts: true },
  });

  const item = await prisma.product.findUnique({
    where: { id: itemId },
    select: { seller: { select: { userId: true } } },
  });

  if (!user || !user.bookmarkedProducts || !item) {
    throw new Errors.APIError("Invalid params", 400);
  }

  if (item.seller?.userId === userId) {
    throw new Errors.APIError("You cannot bookmark your own items", 400);
  }

  if (user.bookmarkedProducts.includes(itemId)) {
    return await ItemStore.unBookmarkItem(userId, itemId);
  }

  return await ItemStore.bookmarkItem(userId, itemId);
}

export async function deleteItemById(userId: string, itemId: string) {
  console.log(itemId);
  const item = await prisma.product.findUnique({
    where: { id: itemId },
    select: { seller: { select: { userId: true } } },
  });
  if (!item) throw new Errors.APIError("Item not found", 404);
  if (!item.seller)
    throw new Errors.APIError("Unauthorized: You do not own this listing", 403);
  if (item.seller.userId !== userId)
    throw new Errors.APIError("Unauthorized: You do not own this listing", 403);

  const deletedItem = await ItemStore.deleteItem(itemId);

  return deletedItem;
}
