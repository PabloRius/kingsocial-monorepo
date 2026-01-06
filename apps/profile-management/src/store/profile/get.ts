import { Prisma, prisma } from "@repo/database";
import { ProfileDTO } from "@repo/shared-types";

export const profileSelect = {
  id: true,
  name: true,
  email: true,
  image: true,
  biography: true,
  socialLinks: true,
  coverImage: true,
  createdAt: true,
  bookmarkedProducts: true,
  settings: true,
  kNumber: true,
  degree: true,
  studyLevel: true,
  _count: { select: { communities: true } },
  communities: {
    select: {
      community: { select: { id: true, coverImage: true, name: true } },
      role: true,
      joinedAt: true,
    },
  },

  sellerProfile: {
    select: {
      id: true,
      plan: true,
      products: {
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          photos: true,
          category: true,
          condition: true,
          pickupLocation: true,
          tags: true,
          bookmarks: true,
          views: true,
          status: true,
          soldAt: true,
          createdAt: true,
          seller: {
            select: {
              id: true,
              userId: true,
              user: { select: { name: true, image: true } },
            },
          },
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
