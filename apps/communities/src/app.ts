import { Middleware } from "@repo/backend-utils";
import express, { type Application } from "express";
import communitiesRouter from "./routes/communities";

export const app: Application = express();
app.use(express.json());

app.use("/communities", communitiesRouter);

app.use(Middleware.errorHandler);

export default app;
