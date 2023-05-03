import { Router } from "express";

import * as ContactController from "../../modules/contacts/controller.js";
export const router = Router();

router.get("/", ContactController.getAll);
router.get("/:id", ContactController.getById);
router.post("/", ContactController.create);
router.patch("/:id/favorite", ContactController.updateFavouriteFieldById);
router.put("/:id", ContactController.updateById);
router.delete("/:id", ContactController.deleteById);
