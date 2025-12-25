import { NextFunction, Request, Response } from "express";
import { ZodError, ZodSchema } from "zod";

export const validate =
  (schema: ZodSchema<any, any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      // Type the received object and remove unknown entries
      const result = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      req.body = result.body;
      req.query = result.query;
      req.params = result.params;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: "Request validation failed",
          details: error.issues,
        });
      }
      next(error);
    }
  };
