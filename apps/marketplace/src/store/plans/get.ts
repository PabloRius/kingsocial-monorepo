import { prisma } from "@repo/database";

export async function getSellerProfile(userId: string) {
  return await prisma.sellerProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
}
