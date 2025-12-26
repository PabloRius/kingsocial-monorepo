import { prisma } from "@repo/database";
import { NextFunction, Request, Response } from "express";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, error: "Missing token" });
    }

    const token = authHeader.split(" ")[1];

    const session = await prisma.session.findUnique({
      where: { sessionToken: token },
      select: { userId: true, expires: true },
    });

    if (!session || session.expires < new Date()) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid or expired session" });
    }

    (req as any).user = { id: session.userId };
    next();
  } catch (error) {
    next(error);
  }
};
