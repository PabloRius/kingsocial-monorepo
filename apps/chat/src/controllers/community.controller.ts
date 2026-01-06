import { prisma } from "@repo/database";
import { Request, Response } from "express";
import { io } from "src";

export async function sendMessage(req: Request, res: Response) {
  const { content, communityId, senderId } = req.body;

  const newMessage = await prisma.communityMessage.create({
    data: {
      content,
      community: { connect: { id: communityId } },
      sender: { connect: { id: senderId } },
      createdAt: new Date(),
    },
    include: { sender: { include: { user: true } }, community: true },
  });

  // 1. Emit to the specific community room (active chatters)
  io.to(`community_${communityId}`).emit("community_message", newMessage);

  // 2. Notify all members via their private rooms (for toasts)
  const community = await prisma.community.findUnique({
    where: { id: communityId },
    include: { members: true },
  });

  community?.members.forEach((member) => {
    // Don't send a toast to the person who just sent the message
    if (member.userId !== (req as any).user.id && member.chatAlerts === true) {
      io.to(member.userId).emit("community_notification", {
        communityName: community.name,
        communityId: community.id,
        content: newMessage.content,
        senderName: newMessage.sender!.user.name,
      });
    }
  });

  res.status(201).json({ success: true, data: newMessage });
}
