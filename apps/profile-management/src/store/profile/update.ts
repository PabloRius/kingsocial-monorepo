import { generateVector } from "@repo/ai-system";
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

export async function updateUserEmbeddings(userId: string) {
  const userData = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      bookmarkedProducts: true,
      biography: true,
      degree: true,
      studyLevel: true,
      socialLinks: true,
      communities: {
        select: { community: { select: { name: true, description: true } } },
      },
    },
  });
  if (!userData) throw new Error("User doesn't exist");
  const bookmarks = await prisma.product.findMany({
    where: { id: { in: userData?.bookmarkedProducts || [] } },
    select: { name: true, category: true },
  });
  const bookmarkText = bookmarks
    .map((b) => `${b.name} (${b.category})`)
    .join(", ");
  const communityText = userData?.communities
    .map((c) => c.community.name)
    .join(", ");
  const socialText = userData.socialLinks?.map((s) => s.platform).join(", ");
  const embeddingText = `
    User Persona and Interests.
    Biography: ${userData.biography}.
    ${
      userData.degree
        ? `Studying: ${userData.degree} at ${userData.studyLevel} level.`
        : ""
    }
    ${socialText ? `Active on: ${socialText}.` : ""}
    ${communityText ? `Member of these groups: ${communityText}.` : ""}
    ${bookmarkText ? `Interested in buying: ${bookmarkText}.` : ""}
  `
    .replace(/\s+/g, " ")
    .trim();
  const embedding = await generateVector(embeddingText);
  const result = await prisma.user.update({
    where: { id: userId },
    data: { embedding },
    select: profileSelect,
  });

  return result;
}
