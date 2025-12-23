import { z } from "zod";

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  seller: { select: { user: true } },
  category: z.string(),
  condition: z.string(),
  description: z.string(),
  photos: z.array(z.string()),
  price: z.number(),
  tags: z.array(z.string()),
  pickupLocation: z.string(),
  status: z.string(),
  views: z.number(),
  createdAt: z.date(),
  bookmarks: z.number(),
  soldAt: z.date(),
  references: z.number(),
});

export type ProductDTO = z.infer<typeof ProductSchema>;
