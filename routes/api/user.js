import { Router } from "express";
import { auth } from "../../modules/user/controller.js";
import * as userController from "../../modules/user/controller.js";
export const usersRouter = Router();

usersRouter.post("/signup", userController.signup);
usersRouter.post("/login", auth, userController.login);
usersRouter.patch("/", auth, userController.subscription);
usersRouter.get("/logout", auth, userController.logout);
usersRouter.get("/current", auth, userController.current);
usersRouter.get("/verify/:verificationToken", userController.verificationToken);
usersRouter.post("/verify", userController.verifiy);
