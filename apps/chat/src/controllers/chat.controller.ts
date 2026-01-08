import { Errors } from "@repo/backend-utils";
import { Prisma, prisma } from "@repo/database";
import { ChatDTO, MessageDTO } from "@repo/shared-types";
import { Request, Response } from "express";
import { io } from "src";

const messageSelect = {
  id: true,
  chatId: true,
  content: true,
  senderId: true,
  createdAt: true,
  productRef: { select: { id: true, photos: true, name: true, price: true } },
  eventRef: {
    select: {
      id: true,
      title: true,
      all_day: true,
      location: true,
      location_format: true,
      date: true,
      community: { select: { id: true, name: true } },
    },
  },
} satisfies Prisma.MessageSelect & Record<keyof MessageDTO, any>;

const chatSelect = {
  id: true,
  messages: { select: messageSelect },
  participants: {
    select: {
      id: true,
      userId: true,
      chatId: true,
      lastReadAt: true,
      user: { select: { id: true, image: true, name: true } },
    },
  },

  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ChatSelect & Record<keyof ChatDTO, any>;

export async function getMyChats(req: Request, res: Response) {
  const userId = (req as any).user.id;

  const chats = await prisma.chat.findMany({
    where: {
      participants: {
        some: { userId },
      },
    },
    orderBy: { updatedAt: "desc" },
    select: chatSelect,
  });
  res.json({ success: true, data: chats });
}

export async function sendMessageWithFallback(req: Request, res: Response) {
  const senderId = (req as any).user.id;
  const { receiverId, content, productRefId, eventRefId } = req.body;

  if (senderId === receiverId) {
    throw new Errors.APIError("You cannot message yourself", 400);
  }

  let chat = await prisma.chat.findFirst({
    where: {
      AND: [
        { participants: { some: { userId: senderId } } },
        { participants: { some: { userId: receiverId } } },
      ],
    },
    include: { _count: { select: { participants: true } } },
  });
  if (!chat || chat._count.participants !== 2) {
    chat = await prisma.chat.create({
      data: {
        participants: {
          create: [
            { user: { connect: { id: senderId } } },
            { user: { connect: { id: receiverId } } },
          ],
        },
      },
      include: { _count: { select: { participants: true } } },
    });
  }

  const newMessage = await prisma.message.create({
    data: {
      content,
      sender: { connect: { id: senderId } },
      chat: { connect: { id: chat!.id } },
      ...(productRefId && { productRef: { connect: { id: productRefId } } }),
      ...(eventRefId && { eventRef: { connect: { id: eventRefId } } }),
    },
    select: messageSelect,
  });

  await prisma.chat.update({
    where: { id: chat.id },
    data: { updatedAt: new Date() },
  });

  io.to(chat.id).emit("receive_message", newMessage);

  io.to(receiverId).emit("receive_message", newMessage);

  res.status(201).json({ success: true, data: newMessage });
}

export async function sendMessage(req: Request, res: Response) {
  const senderId = (req as any).user.id;
  const { chatId, content, productRefId, eventRefId } = req.body;

  const newMessage = await prisma.message.create({
    data: {
      content,
      sender: { connect: { id: senderId } },
      chat: { connect: { id: chatId } },
      ...(productRefId && { productRef: { connect: { id: productRefId } } }),
      ...(eventRefId && { eventRef: { connect: { id: eventRefId } } }),
    },
    select: messageSelect,
  });

  io.to(chatId).emit("receive_message", newMessage);

  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: { participants: true },
  });

  chat?.participants.forEach((p) => {
    if (p.userId !== senderId && p.userId) {
      io.to(p.userId).emit("receive_message", newMessage);
    }
  });

  res.status(201).json({ success: true, data: newMessage });
}
