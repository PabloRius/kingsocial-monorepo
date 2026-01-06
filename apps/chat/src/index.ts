import { prisma } from "@repo/database";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { authenticateSocket } from "./middleware/socketAuth";
import chatRoutes from "./routes/chats";

const PORT = parseInt(process.env.PORT || "4000") || 4000;

const app = express();
app.use(express.json());
app.use("/chats", chatRoutes);
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
  },
});

io.use(authenticateSocket);

const onlineUsers = new Map<string, string>();

io.on("connection", async (socket) => {
  const userId = (socket as any).user.id;
  if (!userId) return;
  console.log(`User connected: ${userId}`);

  onlineUsers.set(userId, socket.id);

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (user?.settings?.showOnlineStatus) {
    socket.broadcast.emit("user_status_changed", {
      userId,
      status: "online",
    });
  }

  socket.join(userId);

  socket.on("join_chat", (chatId: string) => {
    socket.join(chatId);
    console.log(`User ${userId} joined room ${chatId}`);
  });

  socket.on("mark_as_read", async ({ chatId }: { chatId: string }) => {
    try {
      await prisma.chatParticipant.update({
        where: { chatId_userId: { chatId, userId } },
        data: {
          lastReadAt: new Date(),
        },
      });

      socket.to(chatId).emit("messages_read", {
        chatId,
        userId,
        readAt: new Date(),
      });
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  });

  socket.on("join_community", (communityId: string) => {
    socket.join(`community_${communityId}`);
    console.log(`User ${userId} joined community: ${communityId}`);
  });

  socket.on("leave_community", (communityId: string) => {
    socket.leave(`community_${communityId}`);
  });

  socket.on("disconnect", () => {
    onlineUsers.delete(userId);
    console.log("User disconnected");
    socket.broadcast.emit("user_status_changed", {
      userId,
      status: "offline",
    });
  });
});

export { io };

httpServer.listen(PORT, () => console.log(`Chat service on port ${PORT}`));
