import { Middleware } from "@repo/backend-utils";
import dotenv from "dotenv";
import express, { type Application } from "express";
import itemsRouter from "./routes/items";
import plansRouter from "./routes/plans";

dotenv.config({});

export const app: Application = express();
app.use(express.json());

app.use("/items", itemsRouter);
app.use("/plans", plansRouter);

app.use(Middleware.errorHandler);

export default app;
