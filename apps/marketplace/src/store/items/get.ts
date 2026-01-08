import { prisma, Prisma } from "@repo/database";
import {
  CategoryFilter,
  ConditionFilter,
  MarketplaceResponse,
  ProductDTO,
} from "@repo/shared-types";

export const marketplaceProductSelect = {
  id: true,
  name: true,
  description: true,
  price: true,
  photos: true,
  category: true,
  condition: true,
  pickupLocation: true,
  createdAt: true,
  tags: true,
  status: true,
  bookmarks: true,
  views: true,
  soldAt: true,
  seller: {
    select: {
      id: true,
      userId: true,
      user: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  },
} satisfies Prisma.ProductSelect & Record<keyof ProductDTO, any>;

export async function getAll(
  page: number,
  limit: number,
  userId?: string,
  filters: {
    search?: string;
    category?: CategoryFilter;
    condition?: ConditionFilter;
    minPrice?: number;
    maxPrice?: number;
  } = {}
): Promise<MarketplaceResponse | null> {
  const { search, category, condition, minPrice, maxPrice } = filters;
  const skip = (page - 1) * limit;

  const where: Prisma.ProductWhereInput = {
    AND: [
      search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
              { tags: { has: search } },
            ],
          }
        : {},
      category && category !== "All Categories" ? { category } : {},
      condition && condition !== "Any" ? { condition } : {},
      { price: { gte: minPrice ?? 0, lte: maxPrice ?? undefined } },
      { status: { not: "sold" } },
      userId ? { seller: { userId: { not: userId } } } : {},
    ],
  };

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      select: marketplaceProductSelect,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products: products as unknown as ProductDTO[],
    totalCount,
    page,
    limit,
  };
}

export async function getById(id: string): Promise<ProductDTO | null> {
  const product = await prisma.product.findUnique({
    where: { id },
    select: marketplaceProductSelect,
  });

  return product as unknown as ProductDTO;
}

export async function getByUserId(userId: string): Promise<ProductDTO[]> {
  const products = await prisma.product.findMany({
    where: {
      seller: { userId },
    },
    select: marketplaceProductSelect,
    orderBy: { createdAt: "desc" },
  });

  return products as unknown as ProductDTO[];
}

export async function getUserBookmarkedItems(userId: string) {
  const result = await prisma.user.findUnique({
    where: { id: userId },
    select: { bookmarkedProducts: true },
  });
  return result?.bookmarkedProducts;
}

export async function getRecommendedItems(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      embedding: true,
      id: true,
      sellerProfile: { select: { id: true } },
    },
  });

  if (!user?.embedding) return [];

  const sellerProfileId = user.sellerProfile?.id;

  const results = (await prisma.$runCommandRaw({
    aggregate: "Product",
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
          status: { $ne: "sold" },
          ...(sellerProfileId && {
            sellerId: { $ne: { $oid: sellerProfileId } },
          }),
        },
      },
      { $limit: 6 },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          price: 1,
          photos: 1,
          category: 1,
          condition: 1,
          status: 1,
          createdAt: 1,
          sellerId: 1,
          pickupLocation: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ],
    cursor: {},
  })) as any;

  const rawProducts = results.cursor?.firstBatch || [];

  return rawProducts.map((p: any) => ({
    ...p,
    id: p._id.$oid || p._id?.toString(),
    createdAt: p.createdAt?.$date ? new Date(p.createdAt.$date) : p.createdAt,
    _id: undefined,
  }));
}
