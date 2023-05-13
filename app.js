import express, { Router } from "express";
import morgan from "morgan";
import cors from "cors";
import { contactsRouter } from "./routes/api/contacts.js";
import { usersRouter } from "./routes/api/user.js";
import { avatarRouter } from "./routes/api/avatar.js";
import path from "path";
export const api = Router();
export const app = express();
export const publicFolder = path.join(process.cwd(), "public");
const formatsLogger = app.get("env") === "development" ? "dev" : "short";
app.use(morgan(formatsLogger));
app.use(cors());
app.use(express.json());
app.use(express.static(publicFolder));
app.use("/api/contacts", contactsRouter);
app.use("/api/users", usersRouter);
app.use("/api/avatars", avatarRouter);
app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});
