import { Middleware, Utils } from "@repo/backend-utils";
import {
  GetMarketplaceQuery,
  GetMarketplaceQuerySchema,
  ProductCreateSchema,
  ProductUpdateSchema,
} from "@repo/shared-types";
import { Request, Response, Router } from "express";
import * as ItemService from "../services/items.service";
const router: Router = Router();

router.get(
  "/",
  Middleware.validate(GetMarketplaceQuerySchema),
  Utils.asyncHandler(
    async (req: Request<{}, any, any, GetMarketplaceQuery>, res: Response) => {
      const result = await ItemService.getMarketplaceCatalog(req.query);

      res.json({ success: true, data: result });
    }
  )
);

router.get(
  "/:id([0-9a-fA-F]{24})",
  Utils.asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await ItemService.getItemById(id);

    res.json({ success: true, data: result });
  })
);

router.get(
  "/me",
  Middleware.authenticate,
  Utils.asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;

    const result = await ItemService.getUserInventory(userId);

    res.json({ success: true, data: result });
  })
);

router.get(
  "/user/:userId",
  Utils.asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;

    const result = await ItemService.getUserInventory(userId);

    res.json({ success: true, data: result });
  })
);

router.post(
  "/",
  Middleware.authenticate,
  Middleware.validate(ProductCreateSchema),
  Utils.asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;

    const result = await ItemService.publishItem(userId, req.body);

    res.json({ success: true, data: result });
  })
);

router.put(
  "/:itemId",
  Middleware.authenticate,
  Middleware.validate(ProductUpdateSchema),
  Utils.asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { itemId } = req.params;
    const result = await ItemService.modifyItemById(userId, itemId, req.body);
    res.json({ success: true, data: result });
  })
);

router.put(
  "/increase_views/:itemId",
  Middleware.authenticate,
  Utils.asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { itemId } = req.params;
    const result = await ItemService.increaseItemViewsByOne(userId, itemId);
    res.json({ success: result, data: null });
  })
);

router.put(
  "/sold/:itemId",
  Middleware.authenticate,
  Utils.asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { itemId } = req.params;
    const result = await ItemService.markItemAsSold(userId, itemId);
    res.json({ success: result, data: null });
  })
);

router.put(
  "/bookmark/:itemId",
  Middleware.authenticate,
  Utils.asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { itemId } = req.params;
    const result = await ItemService.toggleItemBookmark(userId, itemId);
    res.json({ success: result, data: null });
  })
);

router.delete(
  "/:itemId",
  Middleware.authenticate,
  Utils.asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { itemId } = req.params;

    const result = await ItemService.deleteItemById(userId, itemId);

    res.json({ success: true, data: result });
  })
);

export default router;
