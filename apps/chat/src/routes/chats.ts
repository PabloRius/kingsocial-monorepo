import { Middleware } from "@repo/backend-utils";
import { Router } from "express";
import * as ChatController from "../controllers/chat.controller";
import * as CommunityController from "../controllers/community.controller";
const router: Router = Router();

router.get("/me", Middleware.authenticate, ChatController.getMyChats);

router.post("/message", Middleware.authenticate, ChatController.sendMessage);

router.post(
  "/message/fallback",
  Middleware.authenticate,
  ChatController.sendMessageWithFallback
);

router.post(
  "/message/community",
  Middleware.authenticate,
  CommunityController.sendMessage
);

export default router;
