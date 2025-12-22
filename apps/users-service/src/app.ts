import express, { type Application } from "express";
import usersRouter from "./routes/users";

export const app: Application = express();

app.use(express.json());
app.use("/users", usersRouter);
