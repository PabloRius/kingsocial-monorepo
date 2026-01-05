import { prisma } from "@repo/database";
import { CommunityDTO } from "@repo/shared-types";
import { communitySelect } from "./get";

export async function deleteById(
  communityId: string
): Promise<CommunityDTO | null> {
  const community = await prisma.community.delete({
    where: { id: communityId },
    select: communitySelect,
  });
  return community;
}
