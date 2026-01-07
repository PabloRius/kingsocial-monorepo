import { generateVector } from "@repo/ai-system";
import { Errors } from "@repo/backend-utils";
import { prisma } from "@repo/database";
import { ProductDTO, ProductUpdatePayload } from "@repo/shared-types";
import { marketplaceProductSelect } from "./get";

export async function updateItem(
  itemId: string,
  data: ProductUpdatePayload
): Promise<ProductDTO> {
  const embeddingText = `Product: ${data.name}. Category: ${
    data.category
  }. Condition: ${data.condition}. Description: ${
    data.description
  }. Tags: ${data.tags?.join(", ")}. Location: ${data.pickupLocation}.`
    .replace(/|s+/g, " ")
    .trim();
  const updatedEmbedding = await generateVector(embeddingText);
  return await prisma.product.update({
    where: { id: itemId },
    data: { ...data, embedding: updatedEmbedding },
    select: marketplaceProductSelect,
  });
}

export async function increaseViews(itemId: string): Promise<boolean> {
  await prisma.product.update({
    where: { id: itemId },
    data: { views: { increment: 1 } },
  });
  return true;
}

export async function markAsSold(itemId: string): Promise<boolean> {
  await prisma.product.update({
    where: { id: itemId },
    data: { status: "sold", soldAt: new Date() },
  });
  return true;
}

export async function bookmarkItem(
  userId: string,
  itemId: string
): Promise<boolean> {
  const userData = await prisma.user.findUnique({
    where: { id: userId },
    select: { bookmarkedProducts: true },
  });
  if (userData?.bookmarkedProducts.includes(itemId))
    throw new Error("Item Already bookmarked");
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { bookmarkedProducts: { push: itemId } },
    }),
    prisma.product.update({
      where: { id: itemId },
      data: { bookmarks: { increment: 1 } },
    }),
  ]);
  return true;
}

export async function unBookmarkItem(
  userId: string,
  itemId: string
): Promise<boolean> {
  const userData = await prisma.user.findUnique({
    where: { id: userId },
    select: { bookmarkedProducts: true },
  });
  if (!userData) throw new Errors.APIError("Invalid Session", 400);
  const { bookmarkedProducts } = userData;
  const newBookmarkedProducts = bookmarkedProducts.filter(
    (id) => id !== itemId
  );
  if (bookmarkedProducts.length === newBookmarkedProducts.length)
    throw new Errors.APIError("Invalid ItemId", 404);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { bookmarkedProducts: { set: newBookmarkedProducts } },
    }),
    prisma.product.update({
      where: { id: itemId },
      data: { bookmarks: { decrement: 1 } },
    }),
  ]);
  return true;
}
