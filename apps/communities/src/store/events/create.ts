import { prisma } from "@repo/database";
import { EventCreatePayload, EventDTO } from "@repo/shared-types";
import { eventSelect } from "./get";

export async function createEvent(
  data: EventCreatePayload,
  communityId: string,
  creatorId: string,
  creatorMemberId: string
): Promise<EventDTO> {
  return await prisma.event.create({
    data: {
      ...data,
      creator: { connect: { id: creatorMemberId } },
      community: { connect: { id: communityId } },
      participants: {
        create: {
          userId: creatorId,
          joinedAt: new Date(),
          role: "admin",
        },
      },
    },
    select: eventSelect,
  });
}
