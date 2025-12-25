import { z } from "zod";

export const CategoryEnum = z.enum([
  "Electronics",
  "Furniture",
  "Clothing",
  "Other",
  "All Categories",
]);
export const ConditionEnum = z.enum(["New", "Used", "Refurbished", "Any"]);

export type Category = z.infer<typeof CategoryEnum>;
export type Condition = z.infer<typeof ConditionEnum>;

export const ProductDTOSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  photos: z.array(z.string()),
  category: z.string(),
  condition: z.string(),
  seller: z
    .object({
      id: z.string(),
      user: z.object({
        name: z.string().nullable(),
        image: z.string().nullable(),
      }),
    })
    .nullable(),
  createdAt: z.date(),
});

export type ProductDTO = z.infer<typeof ProductDTOSchema>;

export const MarketplaceResponseSchema = z.object({
  products: z.array(ProductDTOSchema),
  totalCount: z.number(),
  page: z.number(),
  limit: z.number(),
});

export type MarketplaceResponse = z.infer<typeof MarketplaceResponseSchema>;

export const GetMarketplaceQuerySchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((v) => parseInt(v || "1"))
      .default(1),
    limit: z
      .string()
      .optional()
      .transform((v) => parseInt(v || "10"))
      .default(10),
    search: z.string().optional(),
    category: CategoryEnum.optional(),
    condition: ConditionEnum.optional(),
    minPrice: z
      .string()
      .optional()
      .transform((v) => (v ? parseFloat(v) : undefined)),
    maxPrice: z
      .string()
      .optional()
      .transform((v) => (v ? parseFloat(v) : undefined)),
    userId: z.string().optional(),
  }),
});

export type GetMarketplaceQuery = z.infer<
  typeof GetMarketplaceQuerySchema
>["query"];
