import {
  GetMarketplaceQuery,
  GetMarketplaceQuerySchema,
} from "@repo/shared-types";
import { Request, Response, Router } from "express";
import { validate } from "src/middleware/validate";
import { asyncHandler } from "src/utils/asyncHandler";
import * as ItemService from "../services/items.service";
const router: Router = Router();

router.get(
  "/",
  validate(GetMarketplaceQuerySchema),
  asyncHandler(
    async (req: Request<{}, any, any, GetMarketplaceQuery>, res: Response) => {
      const result = await ItemService.getMarketplaceCatalog(req.query);

      res.json({ success: true, data: result });
    }
  )
);

export default router;
