import { Middleware, Utils } from "@repo/backend-utils";
import { CreateSellerProfileSchema } from "@repo/shared-types";
import { Request, Response, Router } from "express";
import * as PlansService from "../services/plans.service";

const router: Router = Router();

router.post(
  "/register",
  Middleware.authenticate,
  Middleware.validate(CreateSellerProfileSchema),
  Utils.asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const result = await PlansService.registerAsSeller(userId, req.body);

    res.status(201).json({ success: true, data: result });
  })
);

export default router;
