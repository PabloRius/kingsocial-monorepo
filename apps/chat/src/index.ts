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

io.on("connection", (socket) => {
  const userId = (socket as any).user.id;
  console.log(`User connected: ${userId}`);

  socket.join(userId);

  socket.on("join_chat", (chatId: string) => {
    socket.join(chatId);
    console.log(`User ${userId} joined room ${chatId}`);
  });

  socket.on("join_community", (communityId: string) => {
    socket.join(`community_${communityId}`);
    console.log(`User ${userId} joined community: ${communityId}`);
  });

  socket.on("leave_community", (communityId: string) => {
    socket.leave(`community_${communityId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

export { io };

httpServer.listen(PORT, () => console.log(`Chat service on port ${PORT}`));
