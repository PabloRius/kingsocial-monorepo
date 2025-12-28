import { Middleware, Utils } from "@repo/backend-utils";
import { Request, Response, Router } from "express";
import * as ProfileService from "../services/profile.service";

const router: Router = Router();

router.get(
  "/me",
  Middleware.authenticate,
  Utils.asyncHandler(async (req: Request, res: Response) => {
    const authenticatedUserId = (req as any).user.id;

    const result = await ProfileService.getOwnProfile(authenticatedUserId);

    res.json({ success: true, data: result });
  })
);

router.get(
  "/:userId",
  Middleware.authenticate,
  Utils.asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;

    const result = await ProfileService.getOwnProfile(userId);

    res.json({ success: true, data: result });
  })
);

export default router;
