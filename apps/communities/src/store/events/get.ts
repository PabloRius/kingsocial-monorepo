import { prisma, Prisma } from "@repo/database";
import { EventDTO } from "@repo/shared-types";

export const eventSelect = {
  id: true,
  title: true,
  description: true,
  coverImage: true,
  tags: true,
  public: true,

  creatorId: true,
  creator: { select: { user: { select: { id: true } } } },

  capacity: true,
  participants: {
    select: {
      id: true,
      role: true,
      allowsMassMessages: true,
      eventId: true,
      userId: true,
      user: { select: { image: true, name: true, id: true } },
    },
  },

  community: {
    select: {
      id: true,
      name: true,
      coverImage: true,
      description: true,
      members: { select: { userId: true } },
    },
  },

  location_format: true,
  location: true,

  date: true,
  all_day: true,
  start_time: true,
  end_time: true,
} satisfies Prisma.EventSelect & Record<keyof EventDTO, any>;

export async function getAll(userId: string) {
  return await prisma.event.findMany({
    where: {
      AND: [
        {
          OR: [
            { public: { equals: true } },
            { participants: { some: { userId: { equals: userId } } } },
          ],
        },
        { date: { gte: new Date() } },
      ],
    },
    select: eventSelect,
  });
}

export async function getById(eventId: string) {
  return await prisma.event.findUnique({
    where: {
      id: eventId,
    },
    select: eventSelect,
  });
}

export async function getParticipantData(participantId: string) {
  return await prisma.eventParticipant.findUnique({
    where: { id: participantId },
  });
}
