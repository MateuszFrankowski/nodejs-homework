import createHttpError from "http-errors";
import { Express } from "express";
import path from "path";
import fs from "fs/promises";
import multer from "multer";
const app = express();

const storeAvatar = path.join(process.cwd(), "avatars");
const uploadDir = path.join(process.cwd(), "uploads");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
  limits: {
    fileSize: 1048576,
  },
});

const upload = multer({
  storage: storage,
});

app.post("/upload", upload.single("picture"), async (req, res, next) => {
  const { description } = req.body;
  const { path: temporaryName, originalname } = req.file;
  const fileName = path.join(storeAvatar, originalname);
  try {
    await fs.rename(temporaryName, fileName);
  } catch (err) {
    await fs.unlink(temporaryName);
    return next(err);
  }
  res.json({ description, message: "Plik załadowany pomyślnie", status: 200 });
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({ message: err.message, status: err.status });
});

const isAccessible = (path) => {
  return fs
    .access(path)
    .then(() => true)
    .catch(() => false);
};

const createFolderIsNotExist = async (folder) => {
  if (!(await isAccessible(folder))) {
    await fs.mkdir(folder);
  }
};

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  createFolderIsNotExist(uploadDir);
  createFolderIsNotExist(storeAvatar);
  console.log(`Server running. Use on port:${PORT}`);
});
