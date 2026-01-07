import { Middleware } from "@repo/backend-utils";
import dotenv from "dotenv";
import express, { type Application } from "express";
import profileRouter from "./routes/profile";

dotenv.config({});
export const app: Application = express();
app.use(express.json());

app.use("/profile", profileRouter);

app.use(Middleware.errorHandler);

export default app;
