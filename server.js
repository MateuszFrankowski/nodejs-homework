import { app } from "./app.js";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
app.use(cors());

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
      console.log(`Server running. Use our API on port: ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(`Server not running. Error message: ${err.message}`);
    process.exit(1);
  });
