import { Prisma, prisma } from "@repo/database";
import { ProfileDTO } from "@repo/shared-types";

const profileSelect = {
  id: true,
  name: true,
  email: true,
  image: true,
  biography: true,
  instagram: true,
  linkedin: true,
  coverImage: true,
  createdAt: true,

  sellerProfile: {
    select: {
      id: true,
      products: {
        select: {
          id: true,
          name: true,
          price: true,
          photos: true,
          category: true,
          createdAt: true,
        },
      },
    },
  },
} satisfies Prisma.UserSelect & Record<keyof ProfileDTO, any>;

export async function getById(id: string): Promise<ProfileDTO | null> {
  const profile = await prisma.user.findUnique({
    where: { id },
    select: profileSelect,
  });

  return profile as ProfileDTO | null;
}
