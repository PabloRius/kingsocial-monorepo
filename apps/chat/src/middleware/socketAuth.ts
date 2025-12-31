import { prisma } from "@repo/database";
import { ExtendedError, Socket } from "socket.io";

export const authenticateSocket = async (
  socket: Socket,
  next: (err?: ExtendedError) => void
) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      console.error("Socket auth failed_ No token provided");
      return next(new Error("Authentication error: No token provided"));
    }

    const session = await prisma.session.findUnique({
      where: { sessionToken: token },
      include: { user: true },
    });

    if (!session || new Date() > session.expires) {
      return next(
        new Error("Authentication error: Invalid or expired session")
      );
    }

    (socket as any).user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    };

    next();
  } catch (error) {
    console.error("Socket Auth Error:", error);
    next(new Error("Internal server error during authentication"));
  }
};
