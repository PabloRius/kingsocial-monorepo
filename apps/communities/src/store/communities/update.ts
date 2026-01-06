import { prisma } from "@repo/database";
import { CommunityDTO, CommunityUpdatePayload } from "@repo/shared-types";
import { communitySelect } from "./get";

export async function updateCommunity(
  communityId: string,
  data: CommunityUpdatePayload
): Promise<CommunityDTO> {
  return await prisma.community.update({
    where: { id: communityId },
    data,
    select: communitySelect,
  });
}

export async function updateMemberSettings(
  memberId: string,
  settings: { chatAlerts: boolean }
) {
  return await prisma.communityMember.update({
    where: { id: memberId },
    data: settings,
  });
}
