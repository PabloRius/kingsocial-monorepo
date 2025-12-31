import { Middleware } from "@repo/backend-utils";
import { Router } from "express";
import * as ChatController from "../controllers/chat.controller";
const router: Router = Router();

router.get("/me", Middleware.authenticate, ChatController.getMyChats);

router.post("/message", Middleware.authenticate, ChatController.sendMessage);

router.post(
  "/message/fallback",
  Middleware.authenticate,
  ChatController.sendMessageWithFallback
);

export default router;
