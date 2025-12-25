import { prisma, Prisma } from "@repo/database";
import {
  Category,
  Condition,
  MarketplaceResponse,
  ProductDTO,
} from "@repo/shared-types";

const marketplaceProductSelect = {
  id: true,
  name: true,
  description: true,
  price: true,
  photos: true,
  category: true,
  condition: true,
  createdAt: true,
  seller: {
    select: {
      id: true,
      user: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  },
} satisfies Prisma.ProductSelect;

export async function getAll(
  page: number,
  limit: number,
  userId?: string,
  filters: {
    search?: string;
    category?: Category;
    condition?: Condition;
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
      sellerId: userId,
    },
    select: marketplaceProductSelect,
    orderBy: { createdAt: "desc" },
  });

  return products as unknown as ProductDTO[];
}
