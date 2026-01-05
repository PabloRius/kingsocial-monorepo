"use server";

import { auth } from "@/lib/auth";
import {
  ApiErrorResponse,
  ApiResponse,
  EventCreatePayload,
  EventDTO,
} from "@repo/shared-types";
import { deleteFromCloudinary, uploadToCloudinary } from "./cloudinary-utils";

const baseURL = `${process.env.NEXT_PUBLIC_COMMUNITIES_URL}/events`;

export async function getAllEvents() {
  const session = await auth();

  if (!session?.sessionToken) {
    throw new Error("Unauthorised: No session token found");
  }

  const response = await fetch(`${baseURL}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${session.sessionToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch events");
  }

  const result: ApiResponse<EventDTO[]> = await response.json();

  return result;
}

export async function getEventById(eventId: string) {
  const session = await auth();

  if (!session?.sessionToken) {
    throw new Error("Unauthorised: No session token found");
  }

  const response = await fetch(`${baseURL}/${eventId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${session.sessionToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch event");
  }

  const result: ApiResponse<EventDTO> = await response.json();

  return result;
}

export async function createEvent(
  data: EventCreatePayload,
  communityId: string,
  coverImageFile: File
) {
  let uploadedUrl: string = "";
  try {
    const url = new URL(`${baseURL}/${communityId}`);

    const session = await auth();

    if (!session?.sessionToken) {
      throw new Error("Unauthorised: No session token found");
    }

    uploadedUrl = await uploadToCloudinary(coverImageFile, "events");

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.sessionToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...data, coverImage: uploadedUrl }),
    });

    if (!response.ok) {
      const errorResult: ApiErrorResponse = await response
        .json()
        .catch(() => ({}));
      console.error("Error creating event: ", errorResult);
      if (uploadedUrl) {
        try {
          await deleteFromCloudinary(uploadedUrl, "events");
        } catch (cleanupError) {
          console.error("Cleanup failed: ", cleanupError);
        }
      }
      return errorResult;
    }

    const result: ApiResponse<EventDTO> = await response.json();

    return result;
  } catch (error) {
    if (uploadedUrl) {
      try {
        await deleteFromCloudinary(uploadedUrl, "communities");
      } catch (cleanupError) {
        console.error("Cleanup failed: ", cleanupError);
      }
    }
    throw error;
  }
}

export async function joinEvent(eventId: string) {
  const session = await auth();

  if (!session?.sessionToken) {
    throw new Error("Unauthorised: No session token found");
  }

  const response = await fetch(`${baseURL}/${eventId}/join`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.sessionToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch event");
  }

  const result: ApiResponse<boolean> = await response.json();

  return result;
}

export async function deleteEventById(eventId: string) {
  const session = await auth();

  if (!session?.sessionToken) {
    throw new Error("Unauthorised: No session token found");
  }

  const response = await fetch(`${baseURL}/${eventId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${session.sessionToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete event");
  }

  const result: ApiResponse<EventDTO> = await response.json();

  try {
    await deleteFromCloudinary(result.data.coverImage, "events");
  } catch (cleanupError) {
    console.error(`Error cleaning up the event coverImage: `, cleanupError);
    throw cleanupError;
  }

  return result;
}

export async function deleteAttendeeFromEvent(
  eventId: string,
  participantId: string
) {
  const session = await auth();

  if (!session?.sessionToken) {
    throw new Error("Unauthorised: No session token found");
  }

  const response = await fetch(
    `${baseURL}/${eventId}/participant/${participantId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${session.sessionToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to remove attendee");
  }

  const result: ApiResponse<boolean> = await response.json();

  return result;
}
