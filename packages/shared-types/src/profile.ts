import z from "zod";

export const ProfileDTOSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  biography: z.string().nullable(),
  instagram: z.string().nullable(),
  linkedin: z.string().nullable(),
  image: z.string().nullable(),
  coverImage: z.string().nullable(),
  createdAt: z.date().or(z.string()),
  sellerProfile: z
    .object({
      id: z.string(),
      products: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          price: z.number(),
          photos: z.array(z.string()),
          category: z.string(),
          createdAt: z.date().or(z.string()),
        })
      ),
    })
    .nullable(),
});

export type ProfileDTO = z.infer<typeof ProfileDTOSchema>;
