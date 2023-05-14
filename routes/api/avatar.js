import { Router } from "express";
import { upload } from "../../middelwares/upload.js";
import { storeAvatar } from "../../middelwares/upload.js";
import { auth } from "../../modules/user/controller.js";
import { saveAvatarURL } from "../../modules/user/service.js";
import fs from "fs/promises";
import path from "path";
import Jimp from "jimp";
export const avatarRouter = Router();

avatarRouter.patch(
  "/",
  auth,
  upload.single("avatar"),
  async (req, res, next) => {
    const { path: temporaryName, originalname } = req.file;

    try {
      const file = await Jimp.read(temporaryName);
      await file.resize(250, 250).write(temporaryName);
    } catch (err) {
      console.error(err);
    }
    const fileName = path.join(storeAvatar, req.user.email + ".jpg");
    try {
      await fs.rename(temporaryName, fileName);
    } catch (err) {
      await fs.unlink(temporaryName);
      return next(err);
    }
    await saveAvatarURL(req.user._id, fileName);
    res.json({
      status: "success",
      code: 200,
      ResponseBody: {
        avatarURL: `http://${req.hostname}:3000/avatars/${req.user.email}.jpg`,
      },
    });
  }
);
export const testStore = path.join(process.cwd(), "public", "avatars");
