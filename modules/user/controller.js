import * as userService from "./service.js";
import jwt from "jsonwebtoken";
import Joi from "joi";
export const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await userService.findUser(email);
    if (!user || !user.validPassword(password)) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Incorrect login or password",
        data: "Bad request",
      });
    }
  } catch (e) {
    console.error(e);
    next(e);
  }
  const payload = {
    id: user.id,
    username: user.username,
  };

  const token = jwt.sign(payload, secret, { expiresIn: "1h" });
  res.json({
    status: "success",
    code: 200,
    data: {
      token,
    },
  });
};

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;
  console.log(username, email, password);
  try {
    const user = await userService.findUser(email);
    if (user) {
      return res.status(409).json({
        status: "error",
        code: 409,
        message: "Email is already in use",
        data: "Conflict",
      });
    }
  } catch (e) {
    console.error(e);
    next(e);
  }
  try {
    const newUser = await userService.register(username, email, password);
    res.status(201).json({
      status: "success",
      code: 201,
      data: {
        message: "Registration successful",
      },
    });
  } catch (error) {
    next(error);
  }
};
