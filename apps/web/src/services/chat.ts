"use server";

import { auth } from "@/lib/auth";
import { ApiResponse, ChatDTO, MessageDTO } from "@repo/shared-types";

const baseURL = `${process.env.NEXT_PUBLIC_CHAT_URL}`;

export async function getChats() {
  const url = new URL(`${baseURL}/chats/me`);

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
  const url = new URL(`${baseURL}/chats/message`);

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
  const url = new URL(`${baseURL}/chats/message/fallback`);

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
