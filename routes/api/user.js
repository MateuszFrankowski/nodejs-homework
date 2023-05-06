import { Router } from "express";

import * as userController from "../../modules/user/controller.js";
export const usersRouter = Router();

usersRouter.post("/signup", userController.signup);
usersRouter.post("/login", userController.login);
