import { ApiResponse } from "@repo/shared-types";
import { NextFunction, Request, Response } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("[Server Error]: ", err);

  const response: ApiResponse<null> = {
    success: false,
    error: err.message || "Internal Server Error",
    data: null,
  };

  const status = err.status || 500;
  res.status(status).json(response);
};
