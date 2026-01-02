import { prisma } from "@repo/database";
import { ProfileDTO, ProfileUpdatePayload } from "@repo/shared-types";
import { profileSelect } from "./get";

export async function updateProfile(
  userId: string,
  data: ProfileUpdatePayload
): Promise<ProfileDTO> {
  const result = await prisma.user.update({
    where: { id: userId },
    data,
    select: profileSelect,
  });

  return result;
}
