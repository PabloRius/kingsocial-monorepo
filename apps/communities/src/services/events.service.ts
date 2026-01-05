import { Errors } from "@repo/backend-utils";
import { EventCreatePayload } from "@repo/shared-types";
import * as CommunitiesStore from "../store/communities";
import * as EventsStore from "../store/events";

export async function getAllEvents(userId: string) {
  return await EventsStore.getAll(userId);
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
