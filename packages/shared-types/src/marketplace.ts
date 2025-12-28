import { z } from "zod";

export const CategoryCoreEnum = z.enum([
  "Electronics",
  "Furniture",
  "Clothing",
  "Books",
  "Other",
]);
export const CategoryFilterEnum = z.enum([
  ...CategoryCoreEnum.options,
  "All Categories",
]);

export const ConditionCoreEnum = z.enum([
  "New",
  "Like New",
  "Good",
  "Fair",
  "Poor",
]);
export const ConditionFilterEnum = z.enum([
  ...ConditionCoreEnum.options,
  "Any",
]);

export type Category = z.infer<typeof CategoryCoreEnum>;
export type CategoryFilter = z.infer<typeof CategoryFilterEnum>;

export type Condition = z.infer<typeof ConditionCoreEnum>;
export type ConditionFilter = z.infer<typeof ConditionFilterEnum>;

export const CATEGORIES_CORE = CategoryCoreEnum.options;
export const CATEGORIES_FILTER = CategoryFilterEnum.options;

export const CONDITIONS_CORE = ConditionCoreEnum.options;
export const CONDITIONS_FILTER = ConditionFilterEnum.options;

export const LABELLED_CONDITIONS: Record<
  Condition,
  { label: string; description: string }
> = {
  New: { label: "New", description: "Brand new, never used" },
  "Like New": {
    label: "Like New",
    description: "Barely used, excellent condition",
  },
  Good: { label: "Good", description: "Used but well maintained" },
  Fair: {
    label: "Fair",
    description: "Shows wear but fully functional",
  },
  Poor: { label: "Poor", description: "Heavy wear, may need repairs" },
};

export const ProductDTOSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  photos: z.array(z.string()),
  category: z.string(),
  condition: z.string(),
  pickupLocation: z.string(),
  tags: z.array(z.string()),
  bookmarks: z.number(),
  views: z.number(),
  status: z.string(),
  soldAt: z.date().nullable(),
  seller: z
    .object({
      id: z.string(),
      userId: z.string(),
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
    category: CategoryFilterEnum.optional(),
    condition: ConditionFilterEnum.optional(),
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

export const ProductCreateSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(100),
    description: z.string().min(10).max(1000),
    price: z.number().positive(),
    category: CategoryCoreEnum,
    condition: ConditionCoreEnum,
    pickupLocation: z.string().min(3),
    tags: z.array(z.string()).default([]),
    photos: z.array(z.string()).min(1, "At least one image is required"),
  }),
});

export type ProductCreatePayload = z.infer<typeof ProductCreateSchema>["body"];

export const SellerPlanEnum = z.enum(["basic", "premium", "pro"]);
export type SellerPlan = z.infer<typeof SellerPlanEnum>;
export const SELLER_PLANS = SellerPlanEnum.options;

export const ProductUpdateSchema = ProductCreateSchema.extend({
  params: z.object({ itemId: z.string() }),
});

export type ProductUpdatePayload = z.infer<typeof ProductUpdateSchema>["body"];

export const CreateSellerProfileSchema = z.object({
  body: z.object({ plan: SellerPlanEnum.default("basic") }),
});

export type CreateSellerProfilePayload = z.infer<
  typeof CreateSellerProfileSchema
>["body"];
