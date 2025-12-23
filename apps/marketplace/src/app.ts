import express, { type Application } from "express";
import itemsRouter from "./routes/items";

export const app: Application = express();

app.use(express.json());
app.use("/items", itemsRouter);
