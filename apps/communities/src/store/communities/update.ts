import { prisma } from "@repo/database";

export async function updateMemberSettings(
  memberId: string,
  settings: { chatAlerts: boolean }
) {
  return await prisma.communityMember.update({
    where: { id: memberId },
    data: settings,
  });
}
