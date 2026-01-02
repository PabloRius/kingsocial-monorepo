import z from "zod";
import { ProductDTOSchema } from "./marketplace";

export const socialLinkSchema = z.object({
  platform: z.string().min(1).max(50),
  url: z.string(),
});

export type SocialLink = z.infer<typeof socialLinkSchema>;

export const ProfileDTOSchema = z.object({
  id: z.string(),
  name: z.string().nullable(), // Required by Prisma
  email: z.email().nullable(), // Required by Prisma
  biography: z.string().nullable(),
  socialLinks: z.array(socialLinkSchema).max(10),
  image: z.string().nullable(),
  coverImage: z.string().nullable(),
  createdAt: z.date().or(z.string()),
  bookmarkedProducts: z.array(z.string()),
  sellerProfile: z
    .object({
      id: z.string(),
      plan: z.string(),
      products: z.array(ProductDTOSchema),
    })
    .nullable(),
});

export type ProfileDTO = z.infer<typeof ProfileDTOSchema>;

export const ProfileUpdateSchema = z.object({
  body: z.object({
    name: z.string(),
    biography: z.string(),
    socialLinks: z.array(socialLinkSchema).max(10),
    image: z.string(),
    coverImage: z.string(),
  }),
});

export type ProfileUpdatePayload = z.infer<typeof ProfileUpdateSchema>["body"];
