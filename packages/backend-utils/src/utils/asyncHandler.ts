import { NextFunction, Request, Response } from "express";

export const asyncHandler =
  (fn: Function) =>
  (requestAnimationFrame: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(requestAnimationFrame, res, next)).catch(next);
  };
