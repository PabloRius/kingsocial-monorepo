import { Middleware, Utils } from "@repo/backend-utils";
import { eventCreatePayloadSchema } from "@repo/shared-types";
import { Request, Response, Router } from "express";
import * as EventsService from "../services/events.service";

const router: Router = Router();

router.get(
  "/",
  Middleware.authenticate,
  Utils.asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;

    const result = await EventsService.getAllEvents(userId);

    res.json({ success: true, data: result });
  })
);

router.get(
  "/:eventId",
  Middleware.authenticate,
  Utils.asyncHandler(async (req: Request, res: Response) => {
    const { eventId } = req.params;

    const result = await EventsService.getEventById(eventId);

    res.json({ success: true, data: result });
  })
);

router.post(
  "/:communityId",
  Middleware.validate(eventCreatePayloadSchema),
  Middleware.authenticate,
  Utils.asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { communityId } = req.params;

    const result = await EventsService.createEvent(
      req.body,
      communityId,
      userId
    );

    res.json({ success: true, data: result });
  })
);

router.post(
  "/:eventId/join",
  Middleware.authenticate,
  Utils.asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { eventId } = req.params;

    const result = await EventsService.joinEvent(eventId, userId);

    res.json({ success: true, data: result });
  })
);

router.delete(
  "/:eventId",
  Middleware.authenticate,
  Utils.asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { eventId } = req.params;

    const result = await EventsService.deleteEventById(eventId, userId);

    res.json({ success: true, data: result });
  })
);

router.delete(
  "/:eventId/participant/:participantId",
  Middleware.authenticate,
  Utils.asyncHandler(async (req: Request, res: Response) => {
    const { eventId, participantId } = req.params;
    const userId = (req as any).user.id;

    const result = await EventsService.deleteEventParticipant(
      eventId,
      participantId,
      userId
    );

    res.json({ success: true, data: result });
  })
);

export default router;
