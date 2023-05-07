import { Router } from "express";
import { auth } from "../../modules/user/controller.js";
import * as ContactController from "../../modules/contacts/controller.js";
export const contactsRouter = Router();

contactsRouter.get("/", auth, ContactController.getAll);
contactsRouter.get("/:id", auth, ContactController.getById);
contactsRouter.post("/", auth, ContactController.create);
contactsRouter.patch(
  "/:id/favorite",
  ContactController.updateFavouriteFieldById
);
contactsRouter.put("/:id", auth, ContactController.updateById);
contactsRouter.delete("/:id", auth, ContactController.deleteById);
