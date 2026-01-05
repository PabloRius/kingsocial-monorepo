import { prisma } from "@repo/database";
import { EventDTO } from "@repo/shared-types";
import { eventSelect } from "./get";

export async function deleteById(eventId: string): Promise<EventDTO | null> {
  const event = await prisma.event.delete({
    where: { id: eventId },
    select: eventSelect,
  });
  return event;
}

export async function deleteParticipant(participantId: string) {
  const participant = await prisma.eventParticipant.delete({
    where: { id: participantId },
  });

  return !!participant;
}
