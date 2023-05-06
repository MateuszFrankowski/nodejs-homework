import { Router } from "express";

import * as ContactController from "../../modules/contacts/controller.js";
export const contactsRouter = Router();

contactsRouter.get("/", ContactController.getAll);
contactsRouter.get("/:id", ContactController.getById);
contactsRouter.post("/", ContactController.create);
contactsRouter.patch(
  "/:id/favorite",
  ContactController.updateFavouriteFieldById
);
contactsRouter.put("/:id", ContactController.updateById);
contactsRouter.delete("/:id", ContactController.deleteById);
