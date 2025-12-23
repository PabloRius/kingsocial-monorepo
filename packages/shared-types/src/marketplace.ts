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
