import { Middleware, Utils } from "@repo/backend-utils";
import {
  GetMarketplaceQuery,
  GetMarketplaceQuerySchema,
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
  "/:id",
  Utils.asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await ItemService.getItemById(id);

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

export default router;
