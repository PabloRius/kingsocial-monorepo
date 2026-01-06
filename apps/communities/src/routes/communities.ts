import { Middleware, Utils } from "@repo/backend-utils";
import {
  communityCreatePayloadSchema,
  communityUpdatePayloadSchema,
} from "@repo/shared-types";
import { Request, Response, Router } from "express";
import * as CommunitiesService from "../services/communities.service";

const router: Router = Router();

router.get(
  "/",
  Middleware.authenticate,
  Utils.asyncHandler(async (req: Request, res: Response) => {
    const result = await CommunitiesService.getAllCommunities();

    res.json({ success: true, data: result });
  })
);

router.get(
  "/me",
  Middleware.authenticate,
  Utils.asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;

    const result = await CommunitiesService.getUserCommunities(userId);

    res.json({ success: true, data: result });
  })
);

router.get(
  "/:communityId",
  Middleware.authenticate,
  Utils.asyncHandler(async (req: Request, res: Response) => {
    const { communityId } = req.params;

    const result = await CommunitiesService.getCommunityById(communityId);

    res.json({ success: true, data: result });
  })
);

router.get(
  "/:communityId/has_requested",
  Middleware.authenticate,
  Utils.asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { communityId } = req.params;

    const result = await CommunitiesService.hasRequestedToJoin(
      communityId,
      userId
    );

    res.json({ success: true, data: result });
  })
);

router.post(
  "",
  Middleware.validate(communityCreatePayloadSchema),
  Middleware.authenticate,
  Utils.asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;

    const result = await CommunitiesService.createCommunity(req.body, userId);

    res.json({ success: true, data: result });
  })
);

router.post(
  "/:communityId/join",
  Middleware.authenticate,
  Utils.asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { communityId } = req.params;

    const result = await CommunitiesService.joinCommunity(communityId, userId);

    res.json({ success: true, data: result });
  })
);

router.post(
  "/:communityId/request",
  Middleware.authenticate,
  Utils.asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { communityId } = req.params;
    const { joinMessage } = req.body;

    const result = await CommunitiesService.requestJoinCommunity(
      communityId,
      userId,
      joinMessage
    );

    res.json({ success: true, data: result });
  })
);

router.post(
  "/request/:requestId",
  Middleware.authenticate,
  Utils.asyncHandler(async (req: Request, res: Response) => {
    const { requestId } = req.params;
    const { status } = req.body;

    const result = await CommunitiesService.processJoinRequest(
      requestId,
      status
    );

    res.json({ success: true, data: result });
  })
);

router.put(
  "/:communityId",
  Middleware.validate(communityUpdatePayloadSchema),
  Middleware.authenticate,
  Utils.asyncHandler(async (req: Request, res: Response) => {
    const { communityId } = req.params;
    const userId = (req as any).user.id;

    const result = await CommunitiesService.updateCommunity(
      communityId,
      req.body,
      userId
    );

    res.json({ success: true, data: result });
  })
);

router.put(
  "/:communityId/update_member_settings",
  Middleware.authenticate,
  Utils.asyncHandler(async (req: Request, res: Response) => {
    const { communityId } = req.params;
    const userId = (req as any).user.id;

    const result = await CommunitiesService.updateCommunityMemberSettings(
      communityId,
      userId,
      req.body
    );

    res.json({ success: true, data: result });
  })
);

router.delete(
  "/:communityId",
  Middleware.authenticate,
  Utils.asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { communityId } = req.params;

    const result = await CommunitiesService.deleteCommunityById(
      communityId,
      userId
    );

    res.json({ success: true, data: result });
  })
);

export default router;
