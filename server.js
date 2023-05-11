import { app } from "./app.js";
import cors from "cors";
import mongoose from "mongoose";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
const storeAvatar = path.join(process.cwd(), "public", "avatars");
const uploadDir = path.join(process.cwd(), "public", "uploads");
app.use(cors());
app.use(morgan("dev"));
dotenv.config();

const PORT = process.env.PORT || 3000;
const uriDb = process.env.DB_HOST;
mongoose.Promise = global.Promise;
const connection = mongoose.connect(uriDb, {
  dbName: `db-contacts`,
});
process.on("SIGINT", () => {
  mongoose.disconnect();
  console.log("Database disconnected!");
});
connection
  .then(() => {
    app.listen(PORT, () => {
      // createFolderIsNotExist(uploadDir);
      // createFolderIsNotExist(storeAvatar);
      console.log(`\n${new Date().toISOString()}`);
      console.log(`Connected to the database.`);
      console.log(`Server running. Use our API on port: ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(`Server not running. Error message: ${err.message}`);
    process.exit(1);
  });
