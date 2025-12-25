import express, { type Application } from "express";
import { errorHandler } from "./middleware/error";
import itemsRouter from "./routes/items";

export const app: Application = express();
app.use(express.json());

app.use("/items", itemsRouter);

app.use(errorHandler);

export default app;
