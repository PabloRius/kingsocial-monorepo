import { prisma } from "@repo/database";
import { CreateSellerProfilePayload } from "@repo/shared-types";

export async function createSeller(
  userId: string,
  data: CreateSellerProfilePayload
) {
  return await prisma.sellerProfile.create({
    data: {
      plan: data.plan,
      user: { connect: { id: userId } },
    },
  });
}
