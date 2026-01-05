import { Middleware } from "@repo/backend-utils";
import express, { type Application } from "express";
import communitiesRouter from "./routes/communities";
import eventsRouter from "./routes/events";

export const app: Application = express();
app.use(express.json());

app.use("/communities", communitiesRouter);

app.use("/events", eventsRouter);

app.use(Middleware.errorHandler);

export default app;
