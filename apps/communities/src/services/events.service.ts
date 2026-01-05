import { Errors } from "@repo/backend-utils";
import { EventCreatePayload } from "@repo/shared-types";
import * as CommunitiesStore from "../store/communities";
import * as EventsStore from "../store/events";

export async function getAllEvents(userId: string) {
  return await EventsStore.getAll(userId);
}

export async function getEventById(eventId: string) {
  return await EventsStore.getById(eventId);
}

export async function createEvent(
  data: EventCreatePayload,
  communityId: string,
  userId: string
) {
  const memberData = await CommunitiesStore.getMemberByUserId(
    communityId,
    userId
  );

  if (!memberData || memberData.role !== "admin")
    throw new Errors.APIError(
      "Only admins of a community can create new events",
      403
    );

  const result = await EventsStore.createEvent(
    data,
    communityId,
    userId,
    memberData.id
  );

  return result;
}

export async function joinEvent(eventId: string, userId: string) {
  const event = await EventsStore.getById(eventId);

  if (!event) throw new Errors.APIError("Event not found", 404);

  if (event.participants.some((p) => p.userId === userId))
    throw new Errors.APIError(
      "User is already a participant in this event",
      400
    );

  return await EventsStore.joinEvent(eventId, userId);
}

export async function deleteEventById(eventId: string, userId: string) {
  const event = await EventsStore.getById(eventId);

  if (!event) throw new Errors.APIError("Event doesn't exist", 404);

  if (
    event?.creatorId !== userId &&
    !event?.participants.some((p) => p.userId === userId && p.role === "admin")
  )
    throw new Errors.APIError("Only the admins can delete the event", 403);

  return await EventsStore.deleteById(eventId);
}

export async function deleteEventParticipant(
  eventId: string,
  participantId: string,
  userId: string
) {
  const event = await EventsStore.getById(eventId);

  if (!event) throw new Errors.APIError("Event doesn't exist", 404);

  if (
    event?.creatorId !== userId &&
    !event?.participants.some((p) => p.userId === userId && p.role === "admin")
  )
    throw new Errors.APIError("Only the admins can delete the event", 403);

  const participantData = await EventsStore.getParticipantData(participantId);

  if (!participantData)
    throw new Errors.APIError("User is not a participant of this event", 400);

  return await EventsStore.deleteParticipant(participantId);
}
