"use server";

import { auth } from "@/lib/auth";
import { ApiResponse, ChatDTO, EventDTO, MessageDTO } from "@repo/shared-types";

const baseURL = `${process.env.NEXT_PUBLIC_CHAT_URL}/chats`;

export async function getChats() {
  const url = new URL(`${baseURL}/me`);

  const session = await auth();
  if (!session) throw new Error("Authentication error: not signed in");

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${session.sessionToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch marketplace data");
  }

  const result: ApiResponse<ChatDTO[]> = await response.json();

  return result;
}

export async function sendMessage(payload: {
  chatId: string;
  content: string;
}) {
  const url = new URL(`${baseURL}/message`);

  const session = await auth();
  if (!session) throw new Error("Authentication error: not signed in");

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.sessionToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to send message");
  }

  const result: ApiResponse<MessageDTO> = await response.json();

  return result;
}

export async function sendMessageWithFallback({
  content,
  receiverId,
  productRefId,
  eventRefId,
}: {
  content: string;
  receiverId: string;
  productRefId?: string;
  eventRefId?: string;
}) {
  const url = new URL(`${baseURL}/message/fallback`);

  const session = await auth();
  if (!session) throw new Error("Authentication error: not signed in");

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.sessionToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content, receiverId, productRefId, eventRefId }),
  });

  if (!response.ok) {
    throw new Error("Failed to send message");
  }

  const result: ApiResponse<MessageDTO> = await response.json();

  return result;
}

export async function sendMessageToCommunity(payload: {
  content: string;
  communityId: string;
  memberId: string;
}) {
  const url = new URL(`${baseURL}/message/community`);

  const session = await auth();
  if (!session) throw new Error("Authentication error: not signed in");

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.sessionToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: payload.content,
      communityId: payload.communityId,
      senderId: payload.memberId,
    }),
  });

  if (!response.ok) {
    console.error("Failed to send message", response);
    throw new Error("Failed to send message");
  }

  const result: ApiResponse<MessageDTO> = await response.json();

  return result;
}

export async function sendMessageToEvent(
  content: string,
  event: EventDTO,
  senderId: string
) {
  await Promise.all(
    event.participants.map(async (p) => {
      if (p.userId === senderId) return;
      if (p.allowsMassMessages) {
        try {
          return await sendMessageWithFallback({
            content,
            receiverId: p.userId,
            eventRefId: event.id,
          });
        } catch (error) {
          console.error(error);
        }
      }
    })
  );

  return true;
}
