import {
  ApiResponse,
  Category,
  Condition,
  MarketplaceResponse,
} from "@repo/shared-types";
import { Request, Response, Router } from "express";
import { getAll } from "../store/get";

const router: Router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    // Extract and parse query paramters with default options
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const userId = (req.query.userId as string) || undefined;

    // Build the filters from the query params
    const filters = {
      search: (req.query.search as string) || undefined,
      category: (req.query.category as Category) || undefined,
      condition: (req.query.condition as Condition) || undefined,
      minPrice: req.query.minPrice
        ? parseFloat(req.query.minPrice as string)
        : undefined,
      maxPrice: req.query.maxPrice
        ? parseFloat(req.query.maxPrice as string)
        : undefined,
    };

    // Call the function
    const result = await getAll(page, limit, userId, filters);

    if (!result) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        error: "Failed to fetch products",
        data: null,
      };
      return res.status(500).json(errorResponse);
    }

    // Return the response
    const response: ApiResponse<MarketplaceResponse> = {
      success: true,
      data: result,
    };

    return res.json(response);
  } catch (error) {
    console.error("Route Error: ", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

export default router;
